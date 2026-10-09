import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// F3 «کد یادگیرنده» — cross-device progress sync.
// POST { code?, data } → upsert snapshot (code generated when absent)
// GET  ?code=XXXX-XXXX → return the stored snapshot (merge happens client-side)
//
// The code is the only credential (deliberately no full auth for this
// product stage — see roadmap §8). Brute-force resistance comes from
// the unambiguous 32-char alphabet (32^8 ≈ 1.1e12) plus a tight GET
// rate limit below.

const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const MAX_DATA_BYTES = 600_000; // ~600KB snapshot ceiling

function normalize(code: string): string {
  const clean = code.toUpperCase().replace(/[^2-9A-Z]/g, "").slice(0, 8);
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : "";
}

function looksValid(code: string): boolean {
  return /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/.test(code);
}

function newCode(): string {
  const pick = (n: number) =>
    Array.from({ length: n }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
  return `${pick(4)}-${pick(4)}`;
}

function dataToString(data: unknown): string | null {
  try {
    const s = JSON.stringify(data);
    if (!s || s.length > MAX_DATA_BYTES) return null;
    // light shape check: must at least be an object with a known map inside
    const obj = JSON.parse(s) as Record<string, unknown>;
    if (!obj || typeof obj !== "object" || !("known" in obj) || !("results" in obj)) return null;
    return s;
  } catch {
    return null;
  }
}

function validUserId(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length >= 6 && trimmed.length <= 64 ? trimmed : null;
}

export async function GET(req: NextRequest) {
  // tight limit: 12 lookups/min per IP → code guessing is impractical
  const limit = rateLimit(req, "sync-get", 12, 60_000);
  if (!limit.ok) return limit.response!;
  try {
    const raw = req.nextUrl.searchParams.get("code") ?? "";
    const code = normalize(raw);
    if (!looksValid(code)) {
      return NextResponse.json({ error: "قالب کد درست نیست." }, { status: 400 });
    }
    const row = await db.learnerSync.findUnique({ where: { code } });
    if (!row) {
      return NextResponse.json({ error: "کدی با این مشخصات پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ code: row.code, updatedAt: row.updatedAt, data: JSON.parse(row.data) });
  } catch {
    return NextResponse.json({ error: "خطای سرور در بازیابی." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(req, "sync-post", 30, 60_000);
  if (!limit.ok) return limit.response!;
  try {
    const body = (await req.json().catch(() => null)) as { code?: unknown; data?: unknown; userId?: unknown } | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "بدنهٔ درخواست نامعتبر است." }, { status: 400 });
    }
    const userId = validUserId(body.userId);
    if (!userId) {
      return NextResponse.json({ error: "شناسهٔ یادگیرنده نامعتبر است." }, { status: 400 });
    }

    const dataStr = dataToString(body.data);
    if (!dataStr) {
      return NextResponse.json({ error: "دادهٔ ارسالی نامعتبر یا بیش از حد بزرگ است." }, { status: 400 });
    }

    const requested = typeof body.code === "string" ? normalize(body.code) : "";
    if (body.code !== undefined && !looksValid(requested)) {
      return NextResponse.json({ error: "قالب کد درست نیست." }, { status: 400 });
    }

    // find existing row by code to keep one row per learner
    let row = requested ? await db.learnerSync.findUnique({ where: { code: requested } }) : null;

    if (!row) {
      // generate a collision-free code (retry a few times)
      for (let i = 0; i < 5 && !row; i++) {
        const code = newCode();
        row = await db.learnerSync.create({ data: { code, userId, data: dataStr } }).catch(() => null);
      }
      if (!row) {
        return NextResponse.json({ error: "ساخت کد ناموفق بود — دوباره تلاش کن." }, { status: 500 });
      }
    } else {
      row = await db.learnerSync.update({ where: { code: row.code }, data: { data: dataStr } });
    }

    return NextResponse.json({ code: row.code, updatedAt: row.updatedAt });
  } catch {
    return NextResponse.json({ error: "خطای سرور در همگام‌سازی." }, { status: 500 });
  }
}
