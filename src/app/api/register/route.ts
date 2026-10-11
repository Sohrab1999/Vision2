import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { hashSecret, newSecret, presentSecret, secretMatches } from "@/lib/identity/secret";

export const runtime = "nodejs";

// Phase-0 «اعتماد» — server-issued learner identity.
//
// Every write to /api/stats and /api/profile now requires the secret that
// THIS route issued for the learner. Flow:
//   • fresh learner      → POST { name?, color? }            → new userId + secret
//   • legacy client      → POST { userId }                   → first-claim: secret issued
//   • returning client   → POST { userId, secret }           → idempotent re-issue
//   • impostor           → POST { userId, wrong/no secret }  → 403
//
// userIds stay client-generated (crypto.randomUUID — unguessable) so the
// migration is transparent; new identities can also be fully server-issued.

const ALLOWED_COLORS = ["emerald", "amber", "rose", "violet", "sky"];

function newUserId(): string {
  return `u-${Date.now().toString(36)}-${Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")}`;
}

function cleanName(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, 24) : "";
}

export async function POST(req: NextRequest) {
  // registration is a once-per-learner call; keep the bucket tight
  const limit = rateLimit(req, "register", 10, 60_000);
  if (!limit.ok) return limit.response!;
  try {
    const body = (await req.json().catch(() => ({}))) as {
      userId?: unknown;
      secret?: unknown;
      name?: unknown;
      color?: unknown;
    } | null;

    const requestedId = typeof body?.userId === "string" ? body.userId.trim().slice(0, 80) : "";
    const requestedSecret = presentSecret(body?.secret);
    const name = cleanName(body?.name);
    const color = ALLOWED_COLORS.includes(body?.color as string) ? (body?.color as string) : "emerald";

    const userId = requestedId || newUserId();
    const existing = await db.learnerProfile.findUnique({ where: { userId } });

    if (existing?.secret) {
      // already claimed — only the holder of the secret may re-issue
      // (audit S4: timing-safe compare against the hashed secret at rest)
      if (!secretMatches(requestedSecret, existing.secret)) {
        return NextResponse.json(
          { error: "این شناسه قبلاً ثبت شده است؛ امضای معتبر لازم است." },
          { status: 403 }
        );
      }
      const updated = await db.learnerProfile.update({
        where: { userId },
        data: name.length >= 2 ? { name, color } : {},
      });
      // echo the presented secret — the holder already has it, and with
      // hashed storage the plaintext exists only on the client side.
      return NextResponse.json({ ok: true, userId, secret: requestedSecret, name: updated.name, color: updated.color });
    }

    const secret = newSecret();
    // name is required by the schema — anonymous registrations get a neutral label
    // (audit SEC-1: only the SHA-256 digest is stored; plaintext ships once, below)
    const data = { name: name.length >= 2 ? name : "یادگیرنده", color, secret: hashSecret(secret) };
    const profile = existing
      ? await db.learnerProfile.update({ where: { userId }, data })
      : await db.learnerProfile.create({ data: { userId, ...data } });

    return NextResponse.json(
      { ok: true, userId: profile.userId, secret, name: profile.name, color: profile.color },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "خطای سرور در ثبت‌نام." }, { status: 500 });
  }
}
