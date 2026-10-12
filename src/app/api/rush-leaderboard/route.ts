import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";

export const runtime = "nodejs";

// Roadmap Step 5: rate limit + error shape moved to withApi.

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
export const GET = withApi({ key: "rush-lb-get", limit: { max: 240 } }, async ({ json }) => {
  // Phase-1 «پایداری»: the per-user "last played" timestamp comes from
  // the same groupBy (_max.createdAt) — no unbounded second findMany.
  const grouped = await db.quizAttempt.groupBy({
    by: ["userId"],
    where: { category: "rush" },
    _count: { _all: true },
    _max: { score: true, percent: true, correct: true, createdAt: true },
  });

  if (grouped.length === 0) {
    return json({ learners: [], totalPlayers: 0 });
  }

  const userIds = grouped.map((g) => g.userId);
  // select projection — the hashed secret never leaves the DB row
  const profiles = await db.learnerProfile.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, name: true, color: true },
  });
  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const ranked: RushRow[] = grouped
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
    .sort((a, b) => b.bestScore - a.bestScore || b.games - a.games);

  // audit 2026-10-12 (P-10): totalPlayers must count the ranked field BEFORE
  // the podium slice — it was always ≤10.
  const rows = ranked.slice(0, 10);

  return json({ learners: rows, totalPlayers: ranked.length });
});
