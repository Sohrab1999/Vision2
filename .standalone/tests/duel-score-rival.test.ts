// ------------------------------------------------------------------
// Task 99 — قراردادهای خالصِ «تفکیکِ امتیاز» و «رقیبِ نخست»:
//   ① decomposeDuelScore: امتیاز = پایه (درست×۱۰۰) + پاداشِ سرعت —
//     قراردادِ داور (challenge-service/scoring.ts: BASE_POINTS=100،
//     speedBonus ۰..۱۰۰ فقط برای پاسخِ درست) — تفکیک صرفاً نمایشی است.
//   ② duelTopRival: بیشترین بردِ مقابلِ یک حریفِ واحد — گروه‌بندیِ
//     نرمال‌شده (بی‌فاصله/بی‌نیم‌فاصله) + تساویِ قطعی (بردِ Nامِ تازه‌تر).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import {
  decomposeDuelScore,
  duelTopRival,
  DUEL_BASE_POINTS,
  type DuelRecord,
} from "@/lib/duel-history";

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

describe("decomposeDuelScore — تفکیکِ پایه/سرعت", () => {
  it("قراردادِ پاریتی: BASE_POINTS صداست — مثل scoring.tsِ داور", () => {
    expect(DUEL_BASE_POINTS).toBe(100);
  });

  it("تفکیکِ دقیق: ۸ درست × ۱۰۰ پایه + ۱۹۹ سرعت از امتیازِ ۹۹۹", () => {
    expect(decomposeDuelScore(999, 8)).toEqual({ base: 800, bonus: 199 });
  });

  it("پاسخ‌های سریع‌ترِ ممکن: پاداشِ صفر هم صادق نمایش داده می‌شود", () => {
    expect(decomposeDuelScore(1000, 10)).toEqual({ base: 1000, bonus: 0 });
  });

  it("سقفِ پاداشِ هر سؤال ۱۰۰ است — ۱۰ درستِ همه‌سریع = پایه + ۱۰۰۰", () => {
    // theoretical ceiling of the judge contract: correct×(100+100)
    expect(decomposeDuelScore(2000, 10)).toEqual({ base: 1000, bonus: 1000 });
  });

  it("ورودیِ خراب: درستِ صفر/منفی/غیرعددی → پایهٔ صفر، امتیازِ منفی → پاداشِ صفر (گاردِ clamp)", () => {
    expect(decomposeDuelScore(0, 0)).toEqual({ base: 0, bonus: 0 });
    expect(decomposeDuelScore(500, -3)).toEqual({ base: 0, bonus: 500 });
    expect(decomposeDuelScore(500, NaN)).toEqual({ base: 0, bonus: 500 });
    expect(decomposeDuelScore(-50, 2)).toEqual({ base: 200, bonus: 0 });
    expect(decomposeDuelScore(Infinity, 2)).toEqual({ base: 200, bonus: 0 });
  });
});

describe("duelTopRival — رقیبِ نخست", () => {
  it("بیشترین بردِ مقابلِ یک حریف را می‌دهد؛ باخت/مساوی نمی‌شمارند", () => {
    const ledger = [
      rec({ id: "d5", opponent: "امیر", outcome: "win" }),
      rec({ id: "d4", opponent: "سینا", outcome: "loss" }),
      rec({ id: "d3", opponent: "امیر", outcome: "loss" }),
      rec({ id: "d2", opponent: "امیر", outcome: "win" }),
      rec({ id: "d1", opponent: "سینا", outcome: "win" }),
    ];
    expect(duelTopRival(ledger)).toEqual({ opponent: "امیر", wins: 2 });
  });

  it("گروه‌بندیِ نرمال‌شده: «امیر محمد» و «امیرمحمد» یک رقیب‌اند", () => {
    const ledger = [
      rec({ id: "d3", opponent: "امیرمحمد", outcome: "win" }),
      rec({ id: "d2", opponent: "سینا", outcome: "win" }),
      rec({ id: "d1", opponent: "امیر محمد", outcome: "win" }),
    ];
    const top = duelTopRival(ledger)!;
    expect(top.wins).toBe(2);
    // نامِ نمایشیِ نخستینِ برخورد باقی می‌ماند
    expect(top.opponent).toBe("امیرمحمد");
  });

  it("تساویِ شمار: رقیبی که بردِ Nامش تازه‌تر است می‌ماند (قطعی)", () => {
    // پیمایش جدید→قدیم: سینا اول به ۱ می‌رسد (d3)، امیر بعد (d2) — در ۱-۱ سینا می‌ماند
    const ledger = [
      rec({ id: "d4", opponent: "سینا", outcome: "win" }),
      rec({ id: "d3", opponent: "امیر", outcome: "win" }),
      rec({ id: "d2", opponent: "سینا", outcome: "loss" }),
      rec({ id: "d1", opponent: "امیر", outcome: "tie" }),
    ];
    expect(duelTopRival(ledger)).toEqual({ opponent: "سینا", wins: 1 });
  });

  it("دفترچهٔ خالی و بدونِ برد → null", () => {
    expect(duelTopRival([])).toBeNull();
    expect(duelTopRival([rec({ outcome: "loss" }), rec({ outcome: "tie" })])).toBeNull();
  });

  it("یک بردِ تنها → همان حریف با یک برد (پیشرفتِ «۱ از ۲» را می‌سازد)", () => {
    expect(duelTopRival([rec({ id: "d1", opponent: "پریسا", outcome: "win" })])).toEqual({
      opponent: "پریسا",
      wins: 1,
    });
  });
});
