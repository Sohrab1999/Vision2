import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

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
  } catch {
    return NextResponse.json({ profile: null });
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
    const presented = typeof body?.secret === "string" ? body.secret.slice(0, 100) : "";

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
    let secret = existing.secret;
    if (secret && presented !== secret) {
      return NextResponse.json({ error: "امضای نامعتبر است." }, { status: 403 });
    }
    if (!secret) {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      secret = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }

    const profile = await db.learnerProfile.update({
      where: { userId },
      data: { name: rawName, color, secret },
    });
    return NextResponse.json({
      ok: true,
      profile: { userId: profile.userId, name: profile.name, color: profile.color },
      secret,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "failed to save profile" }, { status: 500 });
  }
}
