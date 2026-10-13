// ------------------------------------------------------------------
// Task 101 «کارنامهٔ دفترچه» — قراردادِ خالصِ duelLedgerStats:
//   ① دفترچهٔ خالی → صفرهای صادق و رقیبِ null
//   ② شمارش‌ها و درصدِ برد (۳ از ۵ → ۶۰)
//   ③ سقفِ درصد (۵ از ۵ → ۱۰۰) و صفرِ صادق (۰ از ۴ → ۰)
//   ④ best/totalPoints/streak سیم‌کشیِ درست
//   ⑤ topRival از همان duelTopRival (گروه‌بندیِ بی‌فاصله زنده)
//   ⑥ verified زیرمجموعهٔ صادق
//   ⑦ خلوص: ورودی دست‌نخورده، خروجی قطعی
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { duelLedgerStats, type DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

describe("duelLedgerStats — کارنامهٔ دفترچه (Task 101)", () => {
  it("دفترچهٔ خالی → صفرهای صادق، winRate صفر، رقیبِ null", () => {
    const s = duelLedgerStats([]);
    expect(s.total).toBe(0);
    expect(s.win).toBe(0);
    expect(s.loss).toBe(0);
    expect(s.tie).toBe(0);
    expect(s.winRate).toBe(0);
    expect(s.best).toBe(0);
    expect(s.streak).toBe(0);
    expect(s.totalPoints).toBe(0);
    expect(s.topRival).toBeNull();
    expect(s.verified).toBe(0);
  });

  it("شمارش‌ها و درصدِ برد: ۳ برد، ۱ باخت، ۱ مساوی → ۶۰٪", () => {
    const s = duelLedgerStats([
      rec({ id: "d1", outcome: "win" }),
      rec({ id: "d2", outcome: "win" }),
      rec({ id: "d3", outcome: "win" }),
      rec({ id: "d4", outcome: "loss" }),
      rec({ id: "d5", outcome: "tie" }),
    ]);
    expect(s.total).toBe(5);
    expect(s.win).toBe(3);
    expect(s.loss).toBe(1);
    expect(s.tie).toBe(1);
    expect(s.winRate).toBe(60);
  });

  it("سقفِ ۱۰۰ و صفرِ صادقِ درصد", () => {
    expect(duelLedgerStats([rec({ id: "d1" }), rec({ id: "d2" })]).winRate).toBe(100);
    expect(
      duelLedgerStats([
        rec({ id: "d1", outcome: "loss" }),
        rec({ id: "d2", outcome: "loss" }),
        rec({ id: "d3", outcome: "loss" }),
        rec({ id: "d4", outcome: "loss" }),
      ]).winRate
    ).toBe(0);
  });

  it("best = بیشترین امتیاز؛ totalPoints = مجموع؛ streak = بردِ متوالیِ انتهای دفترچه", () => {
    // قراردادِ store: آرایه newest-first — سرِ آرایه تازه‌ترین است
    const s = duelLedgerStats([
      rec({ id: "d3", outcome: "loss", myScore: 400 }),
      rec({ id: "d2", outcome: "win", myScore: 1250 }),
      rec({ id: "d1", outcome: "win", myScore: 800 }),
    ]);
    expect(s.best).toBe(1250);
    expect(s.totalPoints).toBe(800 + 1250 + 400);
    // باختِ تازه‌ترین (سرِ آرایه) زنجیره را می‌شکند → صفر
    expect(s.streak).toBe(0);
    // بردِ متوالیِ سرِ دفترچه → ۲
    const s2 = duelLedgerStats([
      rec({ id: "d3", outcome: "win", myScore: 900 }),
      rec({ id: "d2", outcome: "win", myScore: 800 }),
      rec({ id: "d1", outcome: "loss", myScore: 100 }),
    ]);
    expect(s2.streak).toBe(2);
  });

  it("topRival از همان duelTopRival: «امیرمحمد» و «امیر محمد» یک رقیب‌اند", () => {
    const s = duelLedgerStats([
      rec({ id: "d1", opponent: "امیرمحمد" }),
      rec({ id: "d2", opponent: "امیر محمد" }),
      rec({ id: "d3", opponent: "سینا" }),
    ]);
    expect(s.topRival).toEqual({ opponent: "امیرمحمد", wins: 2 });
  });

  it("verified زیرمجموعهٔ صادق: فقط رکوردهای رسیددار می‌شمارند", () => {
    const sig = "a".repeat(64);
    const s = duelLedgerStats([
      rec({ id: "d1", receiptSig: sig }),
      rec({ id: "d2" }),
      rec({ id: "d3", receiptSig: "b".repeat(64) }),
    ]);
    expect(s.verified).toBe(2);
    expect(s.total).toBe(3);
  });

  it("خلوص: ورودی دست‌نخورده و خروجی قطعی", () => {
    const input = [rec({ id: "d1" }), rec({ id: "d2", outcome: "loss" })];
    const snapshot = JSON.stringify(input);
    const a = duelLedgerStats(input);
    const b = duelLedgerStats(input);
    expect(JSON.stringify(input)).toBe(snapshot);
    expect(a).toEqual(b);
  });

  it("دفاعِ totalPoints: myScoreِ نامعین حقِ واردشدن به مجموع را ندارد", () => {
    const dirty = [rec({ id: "d1", myScore: 500 }), rec({ id: "d2", myScore: Number.NaN })];
    const s = duelLedgerStats(dirty as DuelRecord[]);
    expect(s.totalPoints).toBe(500);
  });
});
