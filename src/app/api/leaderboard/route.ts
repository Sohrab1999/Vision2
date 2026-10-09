import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export interface LeaderRow {
  userId: string;
  name: string;
  color: string;
  attempts: number;
  avgPercent: number;
  bestPercent: number;
}

export async function GET(req: NextRequest) {
  const limit = rateLimit(req, "lb-get", 240, 60_000);
  if (!limit.ok) return limit.response!;
  try {
    const grouped = await db.quizAttempt.groupBy({
      by: ["userId"],
      _count: { _all: true },
      _avg: { percent: true },
      _max: { percent: true },
    });

    if (grouped.length === 0) {
      return NextResponse.json({ learners: [], totalLearners: 0 });
    }

    const userIds = grouped.map((g) => g.userId);
    const profiles = await db.learnerProfile.findMany({
      where: { userId: { in: userIds } },
    });
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const rows: LeaderRow[] = grouped
      .map((g) => {
        const p = profileMap.get(g.userId);
        return {
          userId: g.userId,
          name: p?.name ?? "زبان‌آموز مهمان",
          color: p?.color ?? "stone",
          attempts: g._count._all,
          avgPercent: Math.round(g._avg.percent ?? 0),
          bestPercent: Math.round(g._max.percent ?? 0),
        };
      })
      // رتبه‌بندی: میانگین نمره، سپس تعداد فعالیت بیشتر
      .sort((a, b) => b.avgPercent - a.avgPercent || b.attempts - a.attempts)
      .slice(0, 20);

    return NextResponse.json({ learners: rows, totalLearners: grouped.length });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ learners: [], totalLearners: 0 });
  }
}
