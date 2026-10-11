import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { aggregateDuelStandings, duelMatchCount } from "@/lib/duel-standings";

export const runtime = "nodejs";

export interface LeaderRow {
  userId: string;
  name: string;
  color: string;
  attempts: number;
  avgPercent: number;
  bestPercent: number;
}

export interface DuelerRow {
  userId: string;
  name: string;
  color: string;
  duels: number;
  wins: number;
  losses: number;
  ties: number;
  bestScore: number;
  avgPercent: number;
  winRate: number;
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

    // Task-36 «جدول نبرد» — duel standings ride along in the same response so
    // the leaderboard never needs a second request to switch dimensions.
    const duelRows = await db.quizAttempt.findMany({
      where: { category: "duel" },
      select: { userId: true, outcome: true, score: true, percent: true },
    });
    const duelStandings = aggregateDuelStandings(duelRows);
    const duelsTotal = duelMatchCount(duelRows);

    if (grouped.length === 0) {
      return NextResponse.json({ learners: [], totalLearners: 0, duelers: [], duelsTotal });
    }

    const userIds = [...new Set([...grouped.map((g) => g.userId), ...duelStandings.map((d) => d.userId)])];
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

    const duelers: DuelerRow[] = duelStandings
      .map((d) => {
        const p = profileMap.get(d.userId);
        return {
          userId: d.userId,
          name: p?.name ?? "زبان‌آموز مهمان",
          color: p?.color ?? "stone",
          duels: d.duels,
          wins: d.wins,
          losses: d.losses,
          ties: d.ties,
          bestScore: d.bestScore,
          avgPercent: d.avgPercent,
          winRate: d.winRate,
        };
      })
      .slice(0, 20);

    return NextResponse.json({ learners: rows, totalLearners: grouped.length, duelers, duelsTotal });
  } catch (error) {
    // Phase-1 «پایداری»: surface DB failures instead of a fake empty board.
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "جدول امتیازات موقتاً در دسترس نیست." }, { status: 500 });
  }
}
