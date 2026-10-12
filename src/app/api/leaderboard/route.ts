import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { aggregateDuelStandings, duelMatchCount } from "@/lib/duel-standings";

export const runtime = "nodejs";

// Roadmap Step 5: rate limit + error shape moved to withApi.

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

export const GET = withApi({ key: "lb-get", limit: { max: 240 } }, async ({ json }) => {
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
    return json({ learners: [], totalLearners: 0, duelers: [], duelsTotal });
  }

  const userIds = [...new Set([...grouped.map((g) => g.userId), ...duelStandings.map((d) => d.userId)])];
  // select projection — the hashed secret never leaves the DB row
  const profiles = await db.learnerProfile.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, name: true, color: true },
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

  return json({ learners: rows, totalLearners: grouped.length, duelers, duelsTotal });
});
