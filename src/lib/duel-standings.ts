// Task-36 «جدول نبرد» — pure duel standings aggregation.
//
// The leaderboard API and the UI both need the same derived view of duel
// attempts (wins/losses/ties per learner, ranked for a podium). Keeping it
// here means the exact ranking contract is unit-tested and the API route
// stays a thin DB reader.
//
// Trust model (same as Phase-0 «اعتماد»): rows may only exist for signed
// learners, but the outcome itself is player-reported — identical trust
// level to `correct`/`score` on every other attempt category.

import { percent } from "@/lib/domain/percent";

export interface DuelAttemptLike {
  userId: string;
  /** Player-reported outcome; null = legacy row or unset (never counts). */
  outcome: string | null;
  score: number | null;
  percent: number | null;
  /** Task 95 — judge receipt sig (Task 94); present only on judge-attested rows. */
  receiptSig?: string | null;
}

export interface DuelStanding {
  userId: string;
  duels: number;
  wins: number;
  losses: number;
  ties: number;
  /** Task 95 — wins carrying the :3003 judge's HMAC receipt (subset of wins). */
  verifiedWins: number;
  bestScore: number;
  avgPercent: number;
  winRate: number; // 0..100 — ties excluded from the denominator
}

const VALID = new Set(["win", "loss", "tie"]);

/** Aggregate raw duel attempt rows into ranked standings. */
export function aggregateDuelStandings(rows: DuelAttemptLike[]): DuelStanding[] {
  const map = new Map<
    string,
    { duels: number; wins: number; losses: number; ties: number; verifiedWins: number; bestScore: number; percentSum: number; percentN: number }
  >();

  for (const r of rows) {
    if (!VALID.has(r.outcome ?? "")) continue; // legacy/unset rows never enter the standings
    const cur =
      map.get(r.userId) ??
      { duels: 0, wins: 0, losses: 0, ties: 0, verifiedWins: 0, bestScore: 0, percentSum: 0, percentN: 0 };
    cur.duels += 1;
    if (r.outcome === "win") {
      cur.wins += 1;
      // Task 95 — a win counts as judge-attested only when the row carries the
      // :3003 receipt sig (legacy rows predate Task 94 and stay unverified).
      if (typeof r.receiptSig === "string" && r.receiptSig.length > 0) cur.verifiedWins += 1;
    } else if (r.outcome === "loss") cur.losses += 1;
    else cur.ties += 1;
    if (typeof r.score === "number" && r.score > cur.bestScore) cur.bestScore = r.score;
    if (typeof r.percent === "number") {
      cur.percentSum += r.percent;
      cur.percentN += 1;
    }
    map.set(r.userId, cur);
  }

  return [...map.entries()]
    .map(([userId, c]) => ({
      userId,
      duels: c.duels,
      wins: c.wins,
      losses: c.losses,
      ties: c.ties,
      verifiedWins: c.verifiedWins,
      bestScore: c.bestScore,
      avgPercent: c.percentN > 0 ? Math.round(c.percentSum / c.percentN) : 0,
      winRate: percent(c.wins, c.wins + c.losses),
    }))
    // Ranking contract: wins first, then win rate, then best single score.
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || b.bestScore - a.bestScore || b.duels - a.duels);
}

/** One duel = exactly two player-reported rows (the ghost keeps its row too). */
export function duelMatchCount(rows: DuelAttemptLike[]): number {
  const valid = rows.filter((r) => VALID.has(r.outcome ?? "")).length;
  return Math.floor(valid / 2);
}
