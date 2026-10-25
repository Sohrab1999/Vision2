import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, profileQuerySchema, profileSchema } from "@/lib/api/validate";
import { hashSecret, newSecret, presentSecret, secretMatches } from "@/lib/identity/secret";

export const runtime = "nodejs";

// Roadmap Step 5: validation + rate limit + error shape moved to withApi.

export const GET = withApi(
  { key: "profile-get", limit: { max: 240 }, query: profileQuerySchema },
  async ({ parsed, json }) => {
    // select projection: the hashed secret never leaves the DB row
    const profile = await db.learnerProfile.findUnique({
      where: { userId: parsed.userId },
      select: { userId: true, name: true, color: true },
    });
    return json({ profile: profile ?? null });
  }
);

export const POST = withApi(
  { key: "profile-post", limit: { max: 30 }, bodyCap: BODY_CAPS.profile, schema: profileSchema },
  async ({ parsed: body, json }) => {
    const rawName = body.name.slice(0, 24); // schema guarantees ≥ 2 after trim
    const presented = presentSecret(body.secret);

    // Phase-0 «اعتماد»: profile updates are signature-checked. The only
    // grace window is a legacy row that has not been claimed yet — updating
    // it through this route claims it on the spot and returns the secret.
    const existing = await db.learnerProfile.findUnique({ where: { userId: body.userId } });
    if (!existing) {
      throw ApiError.unauthorized("یادگیرنده ثبت‌نام نشده است.");
    }
    // audit S4: one timing-safe comparison against the (hashed) stored secret.
    // Legacy claim path is unchanged: an unclaimed row gets its secret here.
    const stored = existing.secret;
    if (stored && !secretMatches(presented, stored)) {
      throw ApiError.unauthorized();
    }
    // plaintext to echo back (the client already holds it on the auth path)
    // vs. the digest we persist — they only coincide on the claim path.
    let outSecret = presented;
    let dataSecret = stored;
    if (!stored) {
      outSecret = newSecret();
      dataSecret = hashSecret(outSecret);
    }

    const profile = await db.learnerProfile.update({
      where: { userId: body.userId },
      data: { name: rawName, color: body.color, secret: dataSecret },
    });
    return json({
      ok: true,
      profile: { userId: profile.userId, name: profile.name, color: profile.color },
      secret: outSecret,
    });
  }
);
