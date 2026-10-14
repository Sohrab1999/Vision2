// ------------------------------------------------------------------
// Task 191 — «کارنامهٔ مقابلِ حریف» (head-to-head): صفحهٔ پایانِ نبرد
// به دفترچه وصل می‌شود. قراردادهایِ صداقت که این تست‌ها قفل می‌کنند:
//   ① تطبیقِ نرمال‌شدهٔ ۹۸ (بی‌فاصله/بی‌نیم‌فاصله) — «امیر محمد» و
//     «امیرمحمد» یک رقیب‌اند.
//   ② نامِ فالبکِ «حریف» هرگز کلیدِ تطبیق نیست — نه به‌عنوانِ حریفِ فعلی
//     (→ null) و نه به‌عنوانِ رکوردِ گذشته (ناشناس‌ها به هم نمی‌چسبند)؛
//     رکوردهای فالبکِ قدیمی به حریفِ واقعی هم نشمارده می‌شوند.
//   ③ بی‌سابقه → null (بلوک غایب، نه صفرِ ساختگی)؛ شمارشِ جاریِ همین نبرد
//     که persistResult پیش از رندرِ done در دفترچه می‌نشیند طبیعتاً داخل است.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import {
  duelHeadToHead,
  DUEL_ANON_OPPONENT,
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

describe("duelHeadToHead — کارنامهٔ مقابلِ حریف", () => {
  it("برد/باخت/مساویِ مقابلِ همان حریف را می‌دهد؛ بقیهٔ حریف‌ها نمی‌شمارند", () => {
    const ledger = [
      rec({ id: "d5", opponent: "سینا", outcome: "win" }), // همین نبرد
      rec({ id: "d4", opponent: "امیر", outcome: "win" }),
      rec({ id: "d3", opponent: "سینا", outcome: "loss" }),
      rec({ id: "d2", opponent: "سینا", outcome: "tie" }),
      rec({ id: "d1", opponent: "سینا", outcome: "win" }),
    ];
    expect(duelHeadToHead(ledger, "سینا")).toEqual({ win: 2, loss: 1, tie: 1 });
  });

  it("تطبیقِ نرمال‌شده: «امیر محمد»، «امیرمحمد» و «امیر‌محمد» یک رقیب‌اند", () => {
    const ledger = [
      rec({ id: "d3", opponent: "امیر محمد", outcome: "win" }),
      rec({ id: "d2", opponent: "امیرمحمد", outcome: "loss" }),
      rec({ id: "d1", opponent: "امیر‌محمد", outcome: "win" }),
    ];
    expect(duelHeadToHead(ledger, "امیرمحمد")).toEqual({ win: 2, loss: 1, tie: 0 });
  });

  it(`نامِ فالبکِ «${DUEL_ANON_OPPONENT}» حریفِ فعلی → null — رقابتِ ساختگی ساخته نمی‌شود`, () => {
    const ledger = [rec({ id: "d1", opponent: DUEL_ANON_OPPONENT, outcome: "win" })];
    expect(duelHeadToHead(ledger, DUEL_ANON_OPPONENT)).toBeNull();
    expect(duelHeadToHead(ledger, undefined)).toBeNull();
    expect(duelHeadToHead(ledger, "   ")).toBeNull();
    expect(duelHeadToHead(ledger, null)).toBeNull();
  });

  it("رکوردهای فالبکِ قدیمیِ «حریف» به حریفِ واقعی نمی‌چسبند — هرگز", () => {
    const ledger = [
      rec({ id: "d2", opponent: "سینا", outcome: "win" }),
      rec({ id: "d1", opponent: DUEL_ANON_OPPONENT, outcome: "win" }),
    ];
    expect(duelHeadToHead(ledger, "سینا")).toEqual({ win: 1, loss: 0, tie: 0 });
  });

  it("بی‌سابقهٔ مقابلِ این حریف → null (بلوک غایب، نه صفرِ ساختگی)", () => {
    const ledger = [rec({ id: "d1", opponent: "امیر", outcome: "win" })];
    expect(duelHeadToHead(ledger, "سینا")).toBeNull();
    expect(duelHeadToHead([], "سینا")).toBeNull();
  });

  it("ورودیِ نامطمئن صادقانه نادیده می‌شود (الگوی خانوادهٔ دفترچه)", () => {
    expect(duelHeadToHead(null as unknown as DuelRecord[], "سینا")).toBeNull();
    expect(duelHeadToHead([null, rec({ id: "d1" })] as unknown as DuelRecord[], "سینا")).toEqual({
      win: 1,
      loss: 0,
      tie: 0,
    });
  });

  it("حساس به حروفِ لاتینِ نامِ انگلیسی نیست (lowercaseِ نرمال‌سازِ ۹۸)", () => {
    const ledger = [rec({ id: "d1", opponent: "Alex", outcome: "loss" })];
    expect(duelHeadToHead(ledger, "alex")).toEqual({ win: 0, loss: 1, tie: 0 });
  });
});
