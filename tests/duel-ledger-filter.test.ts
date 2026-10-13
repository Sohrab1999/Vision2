// ------------------------------------------------------------------
// Task 98 «دفترچهٔ قابلِ کاویدن» — قراردادهای خالصِ جست‌وجو/فیلترِ دفترچهٔ نبردها:
//   ① نرمالِ پرس‌وجو: نیم‌فاصلهٔ فارسی → فاصله، فروکردنِ فاصله‌ها، lowercase
//   ② فیلترِ ترکیبیِ AND (query + outcome + verifiedOnly) با حفظِ ترتیبِ جدید→قدیم
//   ③ خلاصهٔ برد/باخت/مساوی برای خطِ نتیجه
// دفترچه سقفِ ۱۵ رکورد دارد — فیلتر روی همین دفترچهٔ کوچک است نه آرشیو.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import {
  filterDuelLedger,
  duelLedgerDigest,
  normalizeDuelQuery,
  type DuelRecord,
} from "@/lib/duel-history";

const SIG = "a".repeat(64);

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-12",
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

describe("normalizeDuelQuery — یکسان‌سازیِ عبارتِ جست‌وجو", () => {
  it("نیم‌فاصله و فاصله کلاً حذف می‌شوند — سه شکلِ نام یکی می‌شوند", () => {
    expect(normalizeDuelQuery("امیر\u200cمحمد")).toBe("امیرمحمد");
    expect(normalizeDuelQuery("امیر محمد")).toBe("امیرمحمد");
    expect(normalizeDuelQuery("امیرمحمد")).toBe("امیرمحمد");
  });

  it("فاصله‌های دو سر و پیاپی حذف و lowercase می‌شود", () => {
    expect(normalizeDuelQuery("  AMIR   Reza  ")).toBe("amirreza");
  });

  it("رشتهٔ خالی و فقط‌فاصله‌ای → رشتهٔ خالی (یعنی بی‌قیدِ جست‌وجو)", () => {
    expect(normalizeDuelQuery("")).toBe("");
    expect(normalizeDuelQuery("   ")).toBe("");
  });
});

describe("filterDuelLedger — فیلترِ ترکیبیِ AND", () => {
  const ledger = [
    rec({ id: "d5", opponent: "امیرمحمد", outcome: "win", receiptSig: SIG }),
    rec({ id: "d4", opponent: "سینا", outcome: "loss" }),
    rec({ id: "d3", opponent: "امیر رضا", outcome: "tie" }),
    rec({ id: "d2", opponent: "سینا", outcome: "win", receiptSig: SIG }),
    rec({ id: "d1", opponent: "پریسا", outcome: "loss" }),
  ];

  it("بدونِ فیلتر، خودِ دفترچه را با حفظِ ترتیب می‌دهد", () => {
    const out = filterDuelLedger(ledger);
    expect(out).toHaveLength(5);
    expect(out.map((r) => r.id)).toEqual(["d5", "d4", "d3", "d2", "d1"]);
  });

  it("زیررشتهٔ نامِ حریف — «امیر» هر دو شکلِ «امیرمحمد» و «امیر رضا» را می‌گیرد", () => {
    const out = filterDuelLedger(ledger, { query: "امیر" });
    expect(out.map((r) => r.id)).toEqual(["d5", "d3"]);
  });
  it("نرمالِ دوطرفه: پرس‌وجوی «امیر محمد» (فاصله‌دار) با رکوردِ «امیرمحمد» (پیوسته) می‌خواند", () => {
    const out = filterDuelLedger(ledger, { query: "امیر محمد" });
    expect(out.map((r) => r.id)).toEqual(["d5"]);
    // و برعکس: پرس‌وجوی پیوسته با رکوردِ فاصله‌دار
    expect(filterDuelLedger(ledger, { query: "امیررضا" }).map((r) => r.id)).toEqual(["d3"]);
  });

  it("نامِ لاتین به بزرگیِ حروف حساس نیست", () => {
    const latin = [rec({ id: "d1", opponent: "John" })];
    expect(filterDuelLedger(latin, { query: "JOHN" })).toHaveLength(1);
    expect(filterDuelLedger(latin, { query: "john" })).toHaveLength(1);
  });

  it("پرس‌وجوی فقط‌فاصله‌ای مثل بی‌قید رفتار می‌کند", () => {
    expect(filterDuelLedger(ledger, { query: "   " })).toHaveLength(5);
  });

  it("فیلترِ نتیجه: برد/باخت/مساوی هرکدام زیرمجموعهٔ خودش", () => {
    expect(filterDuelLedger(ledger, { outcome: "win" }).map((r) => r.id)).toEqual(["d5", "d2"]);
    expect(filterDuelLedger(ledger, { outcome: "loss" }).map((r) => r.id)).toEqual(["d4", "d1"]);
    expect(filterDuelLedger(ledger, { outcome: "tie" }).map((r) => r.id)).toEqual(["d3"]);
  });

  it("فقطِ داورگواه: فقط رکوردهای رسیددار — باخت/مساویِ رسیددار هم می‌آیند", () => {
    const mixed = [
      rec({ id: "a", outcome: "win", receiptSig: SIG }),
      rec({ id: "b", outcome: "loss", receiptSig: SIG }),
      rec({ id: "c", outcome: "win" }),
    ];
    expect(filterDuelLedger(mixed, { verifiedOnly: true }).map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("ترکیبِ AND: نام + نتیجه + داورگواه هم‌زمان تنگ‌تر می‌شوند", () => {
    const out = filterDuelLedger(ledger, { query: "سینا", outcome: "win", verifiedOnly: true });
    expect(out.map((r) => r.id)).toEqual(["d2"]);
    // همان با نتیجهٔ باخت خالی می‌شود
    expect(filterDuelLedger(ledger, { query: "سینا", outcome: "loss", verifiedOnly: true })).toHaveLength(0);
  });
});

describe("duelLedgerDigest — خلاصهٔ نتیجه", () => {
  it("شمارِ برد/باخت/مساویِ مجموعه را می‌دهد", () => {
    const ledger = [
      rec({ outcome: "win" }),
      rec({ outcome: "win" }),
      rec({ outcome: "loss" }),
      rec({ outcome: "tie" }),
    ];
    expect(duelLedgerDigest(ledger)).toEqual({ win: 2, loss: 1, tie: 1 });
  });

  it("دفترچهٔ خالی صفرِ صادق است", () => {
    expect(duelLedgerDigest([])).toEqual({ win: 0, loss: 0, tie: 0 });
  });
});
