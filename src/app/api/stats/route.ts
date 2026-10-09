import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [total, avg, last24h, recent] = await Promise.all([
      db.quizAttempt.count(),
      db.quizAttempt.aggregate({ _avg: { percent: true } }),
      db.quizAttempt.count({ where: { createdAt: { gte: since } } }),
      db.quizAttempt.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          userId: true,
          lesson: true,
          category: true,
          total: true,
          correct: true,
          percent: true,
          createdAt: true,
        },
      }),
    ]);

    // join learner names for the live feed
    const profiles = await db.learnerProfile.findMany({
      where: { userId: { in: recent.map((r) => r.userId) } },
    });
    const nameMap = new Map(profiles.map((p) => [p.userId, p]));
    const recentNamed = recent.map((r) => {
      const p = nameMap.get(r.userId);
      return {
        ...r,
        name: p?.name ?? null,
        color: p?.color ?? null,
      };
    });

    return NextResponse.json({
      total,
      avgPercent: Math.round(avg._avg.percent ?? 0),
      last24h,
      recent: recentNamed,
    });
  } catch {
    return NextResponse.json({ total: 0, avgPercent: 0, last24h: 0, recent: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === "string" ? body.userId.slice(0, 80) : "";
    const lesson = Number(body?.lesson);
    const category = typeof body?.category === "string" ? body.category.slice(0, 40) : "";
    const total = Number(body?.total);
    const correct = Number(body?.correct);

    if (
      !userId ||
      !Number.isFinite(lesson) ||
      !category ||
      !Number.isFinite(total) ||
      !Number.isFinite(correct) ||
      total <= 0
    ) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const percent = Math.round((correct / total) * 100);
    const rawScore = Number(body?.score);
    const score = Number.isFinite(rawScore) && rawScore > 0 ? Math.min(Math.round(rawScore), 100_000) : null;
    const attempt = await db.quizAttempt.create({
      data: { userId, lesson, category, total, correct, percent, score },
    });
    return NextResponse.json({ ok: true, id: attempt.id });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "failed to save attempt" }, { status: 500 });
  }
}
