// ------------------------------------------------------------------
// Task 100 — هفتمین خانوادهٔ نشان: «سرعت» — قراردادِ خالصِ duelSpeedStats:
//   پاداشِ سرعتِ هر نبرد از decomposeDuelScore (قراردادِ داور، Task 99)
//   درمی‌آید: امتیاز − درست×۱۰۰. میانگین بر «پاسخِ درست» است.
//   ① رکوردِ بی‌درست (myCorrect=0) هیچ اطلاعاتِ سرعت ندارد — کلاً کنار گذاشته
//     می‌شود، نه اینکه امتیازِ دروغینش واردِ میانگین شود.
//   ② سقفِ قراردادی: پاداشِ هر نبرد ≤ درست×۱۰۰ (هر پاسخ حداکثر ۱۰۰) —
//     امتیازِ جعلیِ فراتر از سقف فقط تا سقف حساب می‌شود.
//   ③ دفترچهٔ بی‌درست → میانگینِ ۰ نه NaN (هیچ گاردِ اختیاریِ خاموش نیست).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import { duelSpeedStats, type DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1200,
  oppScore: 950,
  myCorrect: 8,
  oppCorrect: 6,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

describe("duelSpeedStats — میانگینِ پاداشِ سرعتِ دفترچه", () => {
  it("پاریتیِ قرارداد: ۸ درست با امتیازِ ۱۲۰۰ → پاداشِ ۴۰۰، میانگینِ ۵۰", () => {
    const s = duelSpeedStats([rec({ myScore: 1200, myCorrect: 8 })]);
    expect(s.totalBonus).toBe(400);
    expect(s.totalCorrect).toBe(8);
    expect(s.avgBonus).toBe(50);
  });

  it("تجمیعِ چند نبرد: میانگینِ وزنی بر پاسخِ درست است نه میانگینِ سادهٔ نبردها", () => {
    // نبردِ ۵درست/پاداشِ ۲۵۰ (میانگین ۵۰) + نبردِ ۱۰درست/پاداشِ ۹۰۰ (میانگین ۹۰)
    const s = duelSpeedStats([
      rec({ myScore: 750, myCorrect: 5 }),
      rec({ myScore: 1900, myCorrect: 10 }),
    ]);
    expect(s.totalBonus).toBe(1150);
    expect(s.totalCorrect).toBe(15);
    expect(s.avgBonus).toBeCloseTo(1150 / 15, 10); // ≈۷۶.۶۷ — نه (۵۰+۹۰)/۲
  });

  it("سقفِ قراردادی: امتیازِ جعلیِ ۵۰۰۰ با ۳ درست → پاداش فقط ۳۰۰ (۳×۱۰۰)، میانگین ۱۰۰", () => {
    const s = duelSpeedStats([rec({ myScore: 5000, myCorrect: 3 })]);
    expect(s.totalBonus).toBe(300);
    expect(s.avgBonus).toBe(100);
  });

  it("رکوردِ بی‌درست (myCorrect=0) کلاً کنار گذاشته می‌شود — امتیازِ دروغینش سرعت نمی‌شود", () => {
    const s = duelSpeedStats([
      rec({ myScore: 999, myCorrect: 0 }), // بی‌اطلاعِ سرعت
      rec({ myScore: 1100, myCorrect: 10 }),
    ]);
    expect(s.totalBonus).toBe(100);
    expect(s.totalCorrect).toBe(10);
    expect(s.avgBonus).toBe(10);
  });

  it("دفترچهٔ خالی و دفترچهٔ همه‌باختِ بی‌درست → میانگینِ ۰ صادق نه NaN", () => {
    expect(duelSpeedStats([])).toEqual({ totalBonus: 0, totalCorrect: 0, avgBonus: 0 });
    const empty = duelSpeedStats([rec({ myScore: 400, myCorrect: 0 }), rec({ myScore: 0, myCorrect: 0 })]);
    expect(empty.avgBonus).toBe(0);
    expect(empty.totalCorrect).toBe(0);
    expect(Number.isNaN(empty.avgBonus)).toBe(false);
  });

  it("درستِ اعشاری/منفیِ خراب مثل صفر رفتار می‌شود (گاردِ همان decompose)", () => {
    const s = duelSpeedStats([rec({ myScore: 800, myCorrect: -2 }), rec({ myScore: 900, myCorrect: 6 })]);
    expect(s.totalCorrect).toBe(6);
    expect(s.totalBonus).toBe(300);
  });
});
