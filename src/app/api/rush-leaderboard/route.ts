import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export interface RushRow {
  userId: string;
  name: string;
  color: string;
  bestScore: number;
  bestCorrect: number;
  bestPercent: number;
  games: number;
  lastAt: string | null;
}

/** بهترین امتیازهای چالش برق‌آسا بین همهٔ یادگیرندگان (category = rush) */
export async function GET() {
  try {
    const grouped = await db.quizAttempt.groupBy({
      by: ["userId"],
      where: { category: "rush" },
      _count: { _all: true },
      _max: { score: true, percent: true, correct: true },
    });

    if (grouped.length === 0) {
      return NextResponse.json({ learners: [], totalPlayers: 0 });
    }

    const userIds = grouped.map((g) => g.userId);
    const [profiles, lastGames] = await Promise.all([
      db.learnerProfile.findMany({ where: { userId: { in: userIds } } }),
      // last rush attempt per user (for "recently played" tiebreak)
      db.quizAttempt.findMany({
        where: { category: "rush", userId: { in: userIds } },
        orderBy: { createdAt: "desc" },
        select: { userId: true, createdAt: true },
      }),
    ]);
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const lastMap = new Map<string, Date>();
    for (const g of lastGames) if (!lastMap.has(g.userId)) lastMap.set(g.userId, g.createdAt);

    const rows: RushRow[] = grouped
      // attempts from before the score column existed have score=null — skip them
      .filter((g) => (g._max.score ?? 0) > 0)
      .map((g) => {
        const p = profileMap.get(g.userId);
        return {
          userId: g.userId,
          name: p?.name ?? "زبان‌آموز مهمان",
          color: p?.color ?? "stone",
          bestScore: Math.round(g._max.score ?? 0),
          bestCorrect: Math.round(g._max.correct ?? 0),
          bestPercent: Math.round(g._max.percent ?? 0),
          games: g._count._all,
          lastAt: lastMap.get(g.userId)?.toISOString() ?? null,
        };
      })
      // rank by best points; ties → more games first
      .sort((a, b) => b.bestScore - a.bestScore || b.games - a.games)
      .slice(0, 10);

    return NextResponse.json({ learners: rows, totalPlayers: rows.length });
  } catch (error) {
    console.error("Rush leaderboard API error:", error);
    return NextResponse.json({ learners: [], totalPlayers: 0 });
  }
}
