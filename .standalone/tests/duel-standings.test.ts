// Task-36 «جدول نبرد» — duel standings aggregation contract.
import { describe, it, expect } from "vitest";
import { aggregateDuelStandings, duelMatchCount, DuelAttemptLike } from "@/lib/duel-standings";

const row = (over: Partial<DuelAttemptLike> & { userId: string }): DuelAttemptLike => ({
  outcome: "win",
  score: null,
  percent: null,
  ...over,
});

describe("aggregateDuelStandings", () => {
  it("returns an empty list for no rows", () => {
    expect(aggregateDuelStandings([])).toEqual([]);
  });

  it("never counts legacy rows (outcome null) or invalid outcome values", () => {
    const s = aggregateDuelStandings([
      row({ userId: "a", outcome: null }),
      row({ userId: "a", outcome: "hacked" }),
      row({ userId: "a", outcome: "" }),
    ]);
    expect(s).toEqual([]);
  });

  it("tallies wins, losses and ties per learner", () => {
    const s = aggregateDuelStandings([
      row({ userId: "a", outcome: "win" }),
      row({ userId: "a", outcome: "win" }),
      row({ userId: "a", outcome: "loss" }),
      row({ userId: "a", outcome: "tie" }),
    ]);
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ userId: "a", duels: 4, wins: 2, losses: 1, ties: 1 });
  });

  it("computes winRate excluding ties from the denominator", () => {
    const s = aggregateDuelStandings([
      row({ userId: "a", outcome: "win" }),
      row({ userId: "a", outcome: "win" }),
      row({ userId: "a", outcome: "tie" }),
      row({ userId: "a", outcome: "loss" }),
      row({ userId: "a", outcome: "loss" }),
    ]);
    // 2 wins out of 4 decided duels = 50%
    expect(s[0].winRate).toBe(50);
  });

  it("winRate is 0 when every duel ended in a tie", () => {
    const s = aggregateDuelStandings([row({ userId: "a", outcome: "tie" }), row({ userId: "b", outcome: "tie" })]);
    expect(s.every((x) => x.winRate === 0)).toBe(true);
  });

  it("keeps the best single score and rounds the average percent", () => {
    const s = aggregateDuelStandings([
      row({ userId: "a", score: 1200, percent: 80 }),
      row({ userId: "a", score: 1750, percent: 71 }),
      row({ userId: "a", score: 900, percent: 90 }),
    ]);
    expect(s[0].bestScore).toBe(1750);
    expect(s[0].avgPercent).toBe(80); // round(241/3)
  });

  it("ranks by wins first, then win rate, then best score", () => {
    const s = aggregateDuelStandings([
      row({ userId: "fewer-wins", outcome: "win" }),
      row({ userId: "fewer-wins", outcome: "win" }),
      row({ userId: "champ", outcome: "win" }),
      row({ userId: "champ", outcome: "win" }),
      row({ userId: "champ", outcome: "win" }),
      row({ userId: "equal-worse-rate", outcome: "win" }),
      row({ userId: "equal-worse-rate", outcome: "win" }),
      row({ userId: "equal-worse-rate", outcome: "loss" }),
      row({ userId: "equal-worse-rate", outcome: "loss" }),
      row({ userId: "equal-better-rate", outcome: "win" }),
      row({ userId: "equal-better-rate", outcome: "win" }),
    ]);
    expect(s.map((x) => x.userId)[0]).toBe("champ");
    const a = s.find((x) => x.userId === "equal-better-rate")!;
    const b = s.find((x) => x.userId === "equal-worse-rate")!;
    expect(a.winRate).toBe(100);
    expect(b.winRate).toBe(50);
    expect(s.indexOf(a)).toBeLessThan(s.indexOf(b));
  });

  it("breaks a full tie by duel count (more activity wins)", () => {
    const s = aggregateDuelStandings([
      row({ userId: "lazy", outcome: "win" }),
      row({ userId: "grinder", outcome: "win" }),
      row({ userId: "grinder", outcome: "win" }),
      row({ userId: "grinder", outcome: "loss" }),
      row({ userId: "grinder", outcome: "loss" }),
    ]);
    // both: 1 win, 50% winRate → grinder has more duels (4) than lazy (1)
    expect(s[0].userId).toBe("grinder");
  });

  it("splits rows of different learners independently (bestScore breaks full ties)", () => {
    const s = aggregateDuelStandings([
      row({ userId: "a", outcome: "win", score: 500 }),
      row({ userId: "a", outcome: "win", score: 400 }),
      row({ userId: "b", outcome: "win", score: 800 }),
      row({ userId: "b", outcome: "win", score: 100 }),
      row({ userId: "c", outcome: "win", score: 999 }),
    ]);
    expect(s).toHaveLength(3);
    // a and b tie on wins (2) and winRate (100) — b's bestScore 800 > a's 500
    expect(s[0].userId).toBe("b");
    expect(s[0].bestScore).toBe(800);
    expect(s[1].userId).toBe("a");
    expect(s[2].userId).toBe("c"); // fewer wins
  });
});

describe("duelMatchCount", () => {
  it("counts one match per pair of reported rows", () => {
    const rows = [
      row({ userId: "a", outcome: "win" }),
      row({ userId: "b", outcome: "loss" }),
      row({ userId: "a", outcome: "win" }),
      row({ userId: "b", outcome: "loss" }),
      row({ userId: "a", outcome: "win" }),
    ];
    // 5 valid rows → 2 full matches (a ghost row stays half-counted)
    expect(duelMatchCount(rows)).toBe(2);
  });

  it("ignores legacy rows when counting matches", () => {
    const rows = [
      row({ userId: "a", outcome: "win" }),
      row({ userId: "b", outcome: "loss" }),
      row({ userId: "x", outcome: null }), // pre-Task-36 duel row
      row({ userId: "y", outcome: null }),
    ];
    expect(duelMatchCount(rows)).toBe(1);
  });

  it("is zero on empty input", () => {
    expect(duelMatchCount([])).toBe(0);
  });
});

// ------------------------------------------------------------------
// Task 95 «داورگواه» — verifiedWins: the judge-attested subset of wins.
// A win counts as verified ONLY when the row carries the :3003 receipt sig
// (Task 94). Legacy rows (pre-Task-94, receiptSig null) stay unverified;
// losses/ties never contribute regardless of a sig.
// ------------------------------------------------------------------
describe("verifiedWins — داورگواه (Task 95)", () => {
  it("counts only wins with a non-empty receiptSig; subset ≤ wins", () => {
    const s = aggregateDuelStandings([
      row({ userId: "a", outcome: "win", receiptSig: "aa".repeat(32) }),
      row({ userId: "a", outcome: "win", receiptSig: "bb".repeat(32) }),
      row({ userId: "a", outcome: "win" }), // legacy — unverified win
      row({ userId: "a", outcome: "loss", receiptSig: "cc".repeat(32) }), // losses never verify
      row({ userId: "a", outcome: "tie", receiptSig: "dd".repeat(32) }), // ties never verify
    ]);
    const a = s.find((x) => x.userId === "a")!;
    expect(a.wins).toBe(3);
    expect(a.verifiedWins).toBe(2);
  });

  it("empty-string sig is not verification; all-legacy user stays at zero", () => {
    const s = aggregateDuelStandings([
      row({ userId: "b", outcome: "win", receiptSig: "" }),
      row({ userId: "b", outcome: "win", receiptSig: null }),
      row({ userId: "b", outcome: "win" }),
    ]);
    expect(s[0].wins).toBe(3);
    expect(s[0].verifiedWins).toBe(0);
  });

  it("verifiedWins is always present (zero) even when no sig field is sent", () => {
    const s = aggregateDuelStandings([row({ userId: "c", outcome: "win" })]);
    expect(s[0].verifiedWins).toBe(0);
  });
});
