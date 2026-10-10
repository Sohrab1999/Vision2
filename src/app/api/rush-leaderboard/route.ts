import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

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
export async function GET(req: NextRequest) {
  const limit = rateLimit(req, "rush-lb-get", 240, 60_000);
  if (!limit.ok) return limit.response!;
  try {
    // Phase-1 «پایداری»: the per-user "last played" timestamp now comes from
    // the same groupBy (_max.createdAt) — the old second findMany scanned
    // every rush attempt without a take.
    const grouped = await db.quizAttempt.groupBy({
      by: ["userId"],
      where: { category: "rush" },
      _count: { _all: true },
      _max: { score: true, percent: true, correct: true, createdAt: true },
    });

    if (grouped.length === 0) {
      return NextResponse.json({ learners: [], totalPlayers: 0 });
    }

    const userIds = grouped.map((g) => g.userId);
    const profiles = await db.learnerProfile.findMany({
      where: { userId: { in: userIds } },
    });
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

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
          lastAt: g._max.createdAt?.toISOString() ?? null,
        };
      })
      // rank by best points; ties → more games first
      .sort((a, b) => b.bestScore - a.bestScore || b.games - a.games)
      .slice(0, 10);

    return NextResponse.json({ learners: rows, totalPlayers: rows.length });
  } catch (error) {
    // Phase-1 «پایداری»: surface DB failures instead of a fake empty board.
    console.error("Rush leaderboard API error:", error);
    return NextResponse.json({ error: "جدول چالش موقتاً در دسترس نیست." }, { status: 500 });
  }
}
