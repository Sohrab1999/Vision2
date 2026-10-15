// ------------------------------------------------------------------
// Task 201 — قراردادِ خالصِ «رقیبِ همیشگی» روی setup نبرد (توصیهٔ ۱۹۴):
//   duelPerennialRival: حریفی که بیشترین روبه‌روشدنِ کل (برد+باخت+مساوی)
//   را با او داشته‌ای — برخلاف duelTopRival (بیشترین بردِ مقلب) که نبردهای
//   باخت/مساوی را نادیده می‌گیرد. صداقتِ خانوادهٔ duelHeadToHead:
//   فالبکِ «حریف» کلید نیست، نام‌های نرمال‌شده یکی می‌شوند، تساویِ قطعی.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import {
  duelPerennialRival,
  duelHeadToHead,
  DUEL_ANON_OPPONENT,
  DUEL_HISTORY_CAP,
  pushDuelRecord,
  type DuelRecord,
} from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-15",
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

describe("duelPerennialRival — رقیبِ همیشگیِ setup", () => {
  it("بیشترین روبه‌روشدنِ کل می‌بَرد — باخت/مساوی هم شمارند (تفاوتِ با duelTopRival)", () => {
    // امیر: ۱ برد + ۲ باخت = ۳ نبرد؛ سینا: ۲ برد = ۲ نبرد
    const ledger = [
      rec({ id: "d6", opponent: "امیر", outcome: "win" }),
      rec({ id: "d5", opponent: "سینا", outcome: "win" }),
      rec({ id: "d4", opponent: "سینا", outcome: "win" }),
      rec({ id: "d3", opponent: "امیر", outcome: "loss" }),
      rec({ id: "d2", opponent: "امیر", outcome: "loss" }),
    ];
    // duelTopRival سینا را می‌دهد (۲ برد > ۱ برد)؛ رقیبِ همیشگی امیر است (۳ نبرد)
    expect(duelPerennialRival(ledger)).toEqual({
      opponent: "امیر",
      duels: 3,
      win: 1,
      loss: 2,
      tie: 0,
    });
  });

  it("کارنامهٔ کاملِ سه‌وضعیتی: برد/باخت/مساوی درست جمع می‌شوند", () => {
    const ledger = [
      rec({ id: "d4", opponent: "پریسا", outcome: "win" }),
      rec({ id: "d3", opponent: "پریسا", outcome: "loss" }),
      rec({ id: "d2", opponent: "پریسا", outcome: "tie" }),
      rec({ id: "d1", opponent: "پریسا", outcome: "tie" }),
    ];
    expect(duelPerennialRival(ledger)).toEqual({
      opponent: "پریسا",
      duels: 4,
      win: 1,
      loss: 1,
      tie: 2,
    });
  });

  it("گروه‌بندیِ نرمال‌شده: «امیر محمد» و «امیرمحمد» یک رقیب‌اند؛ نامِ نمایشیِ اولین می‌ماند", () => {
    const ledger = [
      rec({ id: "d3", opponent: "امیر محمد", outcome: "loss" }),
      rec({ id: "d2", opponent: "سینا", outcome: "win" }),
      rec({ id: "d1", opponent: "امیرمحمد", outcome: "win" }),
    ];
    const rival = duelPerennialRival(ledger)!;
    expect(rival.opponent).toBe("امیر محمد"); // اولینِ دیده‌شده در پیمایشِ جدید→قدیم
    expect(rival.duels).toBe(2);
    expect(rival.win).toBe(1);
    expect(rival.loss).toBe(1);
  });

  it("فالبکِ «حریف» هرگز رقیب نمی‌سازد — ناشناس‌ها آدم‌های متفاوت‌اند", () => {
    expect(duelPerennialRival([
      rec({ id: "d3", opponent: DUEL_ANON_OPPONENT, outcome: "win" }),
      rec({ id: "d2", opponent: DUEL_ANON_OPPONENT, outcome: "loss" }),
      rec({ id: "d1", opponent: DUEL_ANON_OPPONENT, outcome: "tie" }),
    ])).toBeNull();
    // رکوردِ ناشناس حتی در کنارِ رقیبِ واقعی هم شمارش را خراب نمی‌کند
    const mixed = [
      rec({ id: "d2", opponent: DUEL_ANON_OPPONENT, outcome: "win" }),
      rec({ id: "d1", opponent: "امیر", outcome: "tie" }),
    ];
    expect(duelPerennialRival(mixed)).toEqual({ opponent: "امیر", duels: 1, win: 0, loss: 0, tie: 1 });
  });

  it("تساویِ شمارِ نبرد: رقیبی که نبردِ Nامش تازه‌تر است می‌ماند (قطعی)", () => {
    // پیمایش جدید→قدیم: سینا اول به ۲ می‌رسد (d3)؛ امیر بعداً (d2) — در ۲-۲ سینا می‌ماند
    const ledger = [
      rec({ id: "d4", opponent: "سینا", outcome: "win" }),
      rec({ id: "d3", opponent: "سینا", outcome: "loss" }),
      rec({ id: "d2", opponent: "امیر", outcome: "tie" }),
      rec({ id: "d1", opponent: "امیر", outcome: "win" }),
    ];
    expect(duelPerennialRival(ledger)!.opponent).toBe("سینا");
  });

  it("بلوکِ غایب: دفترچهٔ خالی / بی‌رکوردِ نام‌دار → null", () => {
    expect(duelPerennialRival([])).toBeNull();
    expect(duelPerennialRival([] as DuelRecord[])).toBeNull();
  });

  it("هم‌خوانیِ کارنامه با duelHeadToHead — دو خوانندهٔ یک واقعیت", () => {
    const ledger = [
      rec({ id: "d4", opponent: "امیر", outcome: "win" }),
      rec({ id: "d3", opponent: "امیر", outcome: "loss" }),
      rec({ id: "d2", opponent: "امیر", outcome: "tie" }),
      rec({ id: "d1", opponent: "سینا", outcome: "loss" }),
    ];
    const rival = duelPerennialRival(ledger)!;
    expect(duelHeadToHead(ledger, rival.opponent)).toEqual({
      win: rival.win,
      loss: rival.loss,
      tie: rival.tie,
    });
  });

  it("با سقفِ دفترچه می‌ماند — رقیبِ همیشگی از pushDuelRecord بیرون می‌آید", () => {
    let ledger: DuelRecord[] = [];
    for (let i = 0; i < DUEL_HISTORY_CAP + 6; i++) {
      ledger = pushDuelRecord(ledger, rec({
        id: `d${1000 + i}`,
        opponent: i % 2 === 0 ? "امیر" : "سینا",
        outcome: i % 3 === 0 ? "loss" : "win",
      }));
    }
    const rival = duelPerennialRival(ledger)!;
    // همهٔ رکوردهای درونِ سقف معتبرند و گروه‌بندی روی همان‌هاست
    const duelsInLedger = ledger.length;
    expect(rival.duels).toBeLessThanOrEqual(duelsInLedger);
    expect(rival.win + rival.loss + rival.tie).toBe(rival.duels);
    // هر دو حریف حضور دارند؛ بیشینه با کارنامهٔ کامل
    expect(["امیر", "سینا"]).toContain(rival.opponent);
  });
});
