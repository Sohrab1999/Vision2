import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, syncQuerySchema, syncSchema } from "@/lib/api/validate";
import { looksLikeCode, newCode, strictNormalizeCode } from "@/lib/sync-code";

export const runtime = "nodejs";

// F3 «کد یادگیرنده» — cross-device progress sync.
// POST { code?, data } → upsert snapshot (code generated when absent)
// GET  ?code=XXXX-XXXX → return the stored snapshot (merge happens client-side)
//
// The code is the only credential (deliberately no full auth for this
// product stage — see roadmap §8). Brute-force resistance comes from
// the unambiguous 32-char alphabet (32^8 ≈ 1.1e12) plus a tight GET
// rate limit below.
//
// Audit 2026-10-12 (SEC-4/D-8): code format + CSPRNG generation live in
// the shared src/lib/sync-code.ts. Roadmap Step 5: validation + rate
// limit + error shape moved to withApi.

const MAX_DATA_BYTES = 600_000; // ~600KB snapshot ceiling (bodyCap adds envelope slack)

function dataToString(data: Record<string, unknown>): string | null {
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

export const GET = withApi(
  { key: "sync-get", limit: { max: 12 }, query: syncQuerySchema },
  async ({ parsed, json }) => {
    // tight limit: 12 lookups/min per IP → code guessing is impractical
    const code = strictNormalizeCode(parsed.code);
    if (!code) {
      throw ApiError.bad("قالب کد درست نیست.");
    }
    const row = await db.learnerSync.findUnique({ where: { code } });
    if (!row) {
      throw ApiError.notFound("کدی با این مشخصات پیدا نشد.");
    }
    return json({ code: row.code, updatedAt: row.updatedAt, data: JSON.parse(row.data) });
  }
);

export const POST = withApi(
  { key: "sync-post", limit: { max: 30 }, bodyCap: BODY_CAPS.sync, schema: syncSchema },
  async ({ parsed: body, json }) => {
    const dataStr = dataToString(body.data);
    if (!dataStr) {
      throw ApiError.bad("دادهٔ ارسالی نامعتبر یا بیش از حد بزرگ است.");
    }

    const requested = body.code !== undefined ? strictNormalizeCode(body.code) : "";
    if (body.code !== undefined && !looksLikeCode(body.code)) {
      throw ApiError.bad("قالب کد درست نیست.");
    }

    // find existing row by code to keep one row per learner
    let row = requested ? await db.learnerSync.findUnique({ where: { code: requested } }) : null;

    if (!row) {
      // generate a collision-free code (retry a few times)
      for (let i = 0; i < 5 && !row; i++) {
        const code = newCode();
        row = await db.learnerSync.create({ data: { code, userId: body.userId, data: dataStr } }).catch(() => null);
      }
      if (!row) {
        throw ApiError.server("ساخت کد ناموفق بود — دوباره تلاش کن.");
      }
    } else {
      row = await db.learnerSync.update({ where: { code: row.code }, data: { data: dataStr } });
    }

    return json({ code: row.code, updatedAt: row.updatedAt });
  }
);
