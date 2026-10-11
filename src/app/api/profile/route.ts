import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { hashSecret, newSecret, presentSecret, secretMatches } from "@/lib/identity/secret";

export const runtime = "nodejs";

const ALLOWED_COLORS = ["emerald", "amber", "rose", "violet", "sky"];

export async function GET(req: NextRequest) {
  const limit = rateLimit(req, "profile-get", 240, 60_000);
  if (!limit.ok) return limit.response!;
  try {
    const userId = req.nextUrl.searchParams.get("userId") ?? "";
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    const profile = await db.learnerProfile.findUnique({ where: { userId } });
    return NextResponse.json({
      profile: profile
        ? { userId: profile.userId, name: profile.name, color: profile.color }
        : null,
    });
  } catch (error) {
    // Phase-1 «پایداری»: surface DB failures instead of a fake empty profile.
    console.error("Profile GET API error:", error);
    return NextResponse.json({ error: "پروفایل موقتاً در دسترس نیست." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(req, "profile-post", 30, 60_000);
  if (!limit.ok) return limit.response!;
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === "string" ? body.userId.slice(0, 80) : "";
    const rawName = typeof body?.name === "string" ? body.name.trim().slice(0, 24) : "";
    const color = ALLOWED_COLORS.includes(body?.color) ? body.color : "emerald";
    const presented = presentSecret(body?.secret);

    if (!userId || rawName.length < 2) {
      return NextResponse.json(
        { error: "نام باید حداقل ۲ حرف باشد" },
        { status: 400 }
      );
    }

    // Phase-0 «اعتماد»: profile updates are signature-checked. The only
    // grace window is a legacy row that has not been claimed yet — updating
    // it through this route claims it on the spot and returns the secret.
    const existing = await db.learnerProfile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json({ error: "یادگیرنده ثبت‌نام نشده است." }, { status: 403 });
    }
    // audit S4: one timing-safe comparison against the (hashed) stored secret.
    // Legacy claim path is unchanged: an unclaimed row gets its secret here.
    const stored = existing.secret;
    if (stored && !secretMatches(presented, stored)) {
      return NextResponse.json({ error: "امضای نامعتبر است." }, { status: 403 });
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
      where: { userId },
      data: { name: rawName, color, secret: dataSecret },
    });
    return NextResponse.json({
      ok: true,
      profile: { userId: profile.userId, name: profile.name, color: profile.color },
      secret: outSecret,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "failed to save profile" }, { status: 500 });
  }
}
