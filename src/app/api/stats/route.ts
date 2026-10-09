import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [total, avg, recent] = await Promise.all([
      db.quizAttempt.count(),
      db.quizAttempt.aggregate({ _avg: { percent: true } }),
      db.quizAttempt.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          lesson: true,
          category: true,
          total: true,
          correct: true,
          percent: true,
          createdAt: true,
        },
      }),
    ]);
    return NextResponse.json({
      total,
      avgPercent: Math.round(avg._avg.percent ?? 0),
      recent,
    });
  } catch {
    return NextResponse.json({ total: 0, avgPercent: 0, recent: [] });
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
    const attempt = await db.quizAttempt.create({
      data: { userId, lesson, category, total, correct, percent },
    });
    return NextResponse.json({ ok: true, id: attempt.id });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "failed to save attempt" }, { status: 500 });
  }
}
