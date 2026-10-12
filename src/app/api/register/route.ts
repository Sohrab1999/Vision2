import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, registerSchema } from "@/lib/api/validate";
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
//
// Roadmap Step 5: validation + rate limit + error shape moved to withApi.

function newUserId(): string {
  return `u-${Date.now().toString(36)}-${Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")}`;
}

export const POST = withApi(
  { key: "register", limit: { max: 10 }, bodyCap: BODY_CAPS.register, schema: registerSchema },
  async ({ parsed: body, json }) => {
    // registration is a once-per-learner call; keep the bucket tight (above)
    const requestedSecret = presentSecret(body.secret);
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 24) : "";
    const color = body.color ?? "emerald";

    const userId = body.userId || newUserId();
    const existing = await db.learnerProfile.findUnique({ where: { userId } });

    if (existing?.secret) {
      // already claimed — only the holder of the secret may re-issue
      // (audit S4: timing-safe compare against the hashed secret at rest)
      if (!secretMatches(requestedSecret, existing.secret)) {
        throw ApiError.unauthorized("این شناسه قبلاً ثبت شده است؛ امضای معتبر لازم است.");
      }
      const updated = await db.learnerProfile.update({
        where: { userId },
        data: name.length >= 2 ? { name, color } : {},
      });
      // echo the presented secret — the holder already has it, and with
      // hashed storage the plaintext exists only on the client side.
      return json({ ok: true, userId, secret: requestedSecret, name: updated.name, color: updated.color });
    }

    const secret = newSecret();
    // name is required by the schema — anonymous registrations get a neutral label
    // (audit SEC-1: only the SHA-256 digest is stored; plaintext ships once, below)
    const data = { name: name.length >= 2 ? name : "یادگیرنده", color, secret: hashSecret(secret) };
    const profile = existing
      ? await db.learnerProfile.update({ where: { userId }, data })
      : await db.learnerProfile.create({ data: { userId, ...data } });

    return json(
      { ok: true, userId: profile.userId, secret, name: profile.name, color: profile.color },
      { status: existing ? 200 : 201 }
    );
  }
);
