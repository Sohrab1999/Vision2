// ------------------------------------------------------------------
// Task 100 «دفترچهٔ مرتب» — قراردادِ خالصِ مرتب‌سازیِ دفترچهٔ نبردها:
//   ① newest: بر اساس idِ نزولی (تازه‌تر اول) — حتی اگر آرایهٔ ورودی درهم باشد
//   ② myScore: بیشترین امتیازِ خودی اول — تساوی با idِ نزولی
//   ③ margin: بیشترین اختلاف (myScore−oppScore) اول — طیفِ صادق: بردِ سنگین
//     بالا، باختِ سنگین پایین — تساوی با idِ نزولی
// مرتب‌سازی هرگز آرایهٔ ورودی را نمی‌شکند (کپیِ خالص) و قطعی است.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import { sortDuelLedger, DUEL_LEDGER_SORTS, type DuelRecord } from "@/lib/duel-history";

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

describe("sortDuelLedger — مرتب‌سازیِ دفترچه", () => {
  it("newest: بر idِ نزولی می‌چیند — ورودیِ درهم‌ترتیب هم درست می‌شود (تکیه بر قراردادِ id نه ترتیبِ آرایه)", () => {
    const scrambled = [
      rec({ id: "d100", myScore: 100 }),
      rec({ id: "d300", myScore: 200 }),
      rec({ id: "d200", myScore: 300 }),
    ];
    expect(sortDuelLedger(scrambled, "newest").map((r) => r.id)).toEqual(["d300", "d200", "d100"]);
  });

  it("پیش‌فرض همان newest است", () => {
    const ledger = [rec({ id: "d1" }), rec({ id: "d9" })];
    expect(sortDuelLedger(ledger).map((r) => r.id)).toEqual(["d9", "d1"]);
  });

  it("myScore: بیشترین امتیازِ خودی اول — تساوی با تازه‌تر (idِ بزرگ‌تر) می‌شکند", () => {
    const ledger = [
      rec({ id: "d1", myScore: 800 }),
      rec({ id: "d3", myScore: 1200 }),
      rec({ id: "d2", myScore: 800 }), // هم‌امتیازِ d1 ولی تازه‌تر
    ];
    expect(sortDuelLedger(ledger, "myScore").map((r) => r.id)).toEqual(["d3", "d2", "d1"]);
  });

  it("margin: بردِ سنگین‌تر بالا — و باختِ سنگین‌تر پایینِ طیف (یک قراردادِ واحد)", () => {
    const ledger = [
      rec({ id: "d1", outcome: "win", myScore: 700, oppScore: 650 }), // اختلاف +۵۰
      rec({ id: "d2", outcome: "loss", myScore: 200, oppScore: 1100 }), // اختلاف −۹۰۰
      rec({ id: "d3", outcome: "win", myScore: 1200, oppScore: 500 }), // اختلاف +۷۰۰
      rec({ id: "d4", outcome: "loss", myScore: 400, oppScore: 800 }), // اختلاف −۴۰۰
    ];
    expect(sortDuelLedger(ledger, "margin").map((r) => r.id)).toEqual(["d3", "d1", "d4", "d2"]);
  });

  it("margin: تساویِ اختلاف با idِ نزولی می‌شکند", () => {
    const ledger = [
      rec({ id: "d1", myScore: 700, oppScore: 600 }), // +۱۰۰
      rec({ id: "d2", myScore: 900, oppScore: 800 }), // +۱۰۰ — تازه‌تر
      rec({ id: "d3", myScore: 500, oppScore: 400 }), // +۱۰۰ — تازه‌ترین
    ];
    expect(sortDuelLedger(ledger, "margin").map((r) => r.id)).toEqual(["d3", "d2", "d1"]);
  });

  it("آرایهٔ ورودی دست‌نخورده می‌ماند (خالص) و خروجی قطعی است", () => {
    const ledger = [rec({ id: "d1", myScore: 100 }), rec({ id: "d2", myScore: 900 })];
    const snapshot = ledger.map((r) => r.id);
    const once = sortDuelLedger(ledger, "myScore");
    const twice = sortDuelLedger(ledger, "myScore");
    expect(ledger.map((r) => r.id)).toEqual(snapshot); // ورودی سالم
    expect(once.map((r) => r.id)).toEqual(twice.map((r) => r.id)); // قطعی
    expect(once).not.toBe(ledger); // کپیِ تازه، نه همان آرایه
  });

  it("دفترچهٔ خالی → خالی؛ تک‌رکورد → خودش", () => {
    expect(sortDuelLedger([], "myScore")).toEqual([]);
    const single = [rec({ id: "d1" })];
    expect(sortDuelLedger(single, "margin").map((r) => r.id)).toEqual(["d1"]);
  });

  it("DUEL_LEDGER_SORTS: سه کلیدِ ثبت‌شده — قراردادِ UI همین است", () => {
    expect(DUEL_LEDGER_SORTS).toEqual(["newest", "myScore", "margin"]);
  });
});
