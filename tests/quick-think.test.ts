// ------------------------------------------------------------------
// Task 108 «ماندگاریِ آمارِ فکر» + نهمین خانوادهٔ نشان «چابکیِ ذهن».
//
// سه لایه این‌جا قفل می‌شود:
//   ① thinkStatsFromSamples — خلاصهٔ ذخیره‌کردنی از نمونه‌ها؛ بی‌نمونه →
//      null (فیلدِ think اصلاً ثبت نمی‌شود — نه صفرِ ساختگی)
//   ② buildDuelRecord/sanitizeDuelRecord — سفرِ ماندگار: با نمونه → فیلد؛
//      بی‌نمونه → کلیدِ غایب؛ thinkِ خراب از ابر/دستی → می‌افتد، رکورد می‌ماند
//   ③ isQuickThinkRecord/duelQuickThinkers — گیتِ دومرحله‌ایِ صادقِ
//      «فکرِ کم + درستِ زیاد»: رکوردِ بی‌think هرگز نمی‌شمارد؛ مرزِ دقیقِ
//      ≤۱۵۰۰ms و ≥۸۰٪ تست-قفل؛ زیرمجموعهٔ ریاضیِ ۷⇒۳ در هر دو جهت
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { thinkStatsFromSamples, type ThinkSamples } from "@/lib/duel-think";
import {
  buildDuelRecord,
  sanitizeDuelRecord,
  sanitizeDuelHistory,
  mergeDuelHistory,
  isQuickThinkRecord,
  duelQuickThinkers,
  DUEL_QUICK_THINK,
  type DuelRecord,
} from "@/lib/duel-history";
import { buildEvalInput, BADGES, unlockedBadgeIds } from "@/lib/achievements";

// ---------------- سازنده‌های کمکی قطعی ----------------

const rec = (over: Partial<DuelRecord> = {}): DuelRecord => ({
  id: `d${Math.floor(Math.random() * 1e9)}`,
  day: "2026-10-13",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1100,
  oppScore: 900,
  myCorrect: 8,
  oppCorrect: 4,
  answered: 10,
  total: 10,
  durationSec: 80,
  ...over,
});

const quickThink = (over: Partial<DuelRecord["think"]> = {}): NonNullable<DuelRecord["think"]> => ({
  avgMs: 800,
  minMs: 200,
  maxMs: 1500,
  seen: 10,
  total: 10,
  ...over,
});

const quickRec = (over: Partial<DuelRecord> = {}, thinkOver: Partial<DuelRecord["think"]> = {}) =>
  rec({ think: quickThink(thinkOver), ...over });

// ---------------- ① thinkStatsFromSamples ----------------

describe("thinkStatsFromSamples — خلاصهٔ ذخیره‌کردنی", () => {
  it("نمونه‌های عادی → میانگینِ گردشده + کمینه/بیشینه/seen/total", () => {
    const st = thinkStatsFromSamples([1000, 2000, 3000]);
    expect(st).toEqual({ avgMs: 2000, minMs: 1000, maxMs: 3000, seen: 3, total: 3 });
  });

  it("میانگینِ کسری به ms گرد می‌شود — سریال‌سازیِ پایدار", () => {
    // میانگینِ 100/150/200 = 150 — و 100/101 = 100.5 → 101 (گردِ نیم‌بالا)
    expect(thinkStatsFromSamples([100, 150, 200])!.avgMs).toBe(150);
    expect(thinkStatsFromSamples([100, 101])!.avgMs).toBe(101);
  });

  it("nullهای فشردهٔ صادق نادیده می‌شوند — seen فقط نمونه‌های سالم", () => {
    const st = thinkStatsFromSamples([500, null, 900, null]);
    expect(st).toEqual({ avgMs: 700, minMs: 500, maxMs: 900, seen: 2, total: 4 });
  });

  it("آرایهٔ خالی → null — چیزی برای ماندگاری نیست", () => {
    expect(thinkStatsFromSamples([])).toBeNull();
  });

  it("همه‌null → null — نه صفرِ ساختگی", () => {
    expect(thinkStatsFromSamples([null, null, null])).toBeNull();
  });

  it("ورودیِ غیرآرایه → null (هرگز throw نمی‌کند)", () => {
    expect(thinkStatsFromSamples(undefined as unknown as ThinkSamples)).toBeNull();
    expect(thinkStatsFromSamples("junk" as unknown as ThinkSamples)).toBeNull();
    expect(thinkStatsFromSamples({ 0: 5 } as unknown as ThinkSamples)).toBeNull();
  });

  it("خلوص: ورودی دست‌نخورده + قطعیت", () => {
    const src: ThinkSamples = [100, null, 300];
    const snapshot = JSON.stringify(src);
    const a = thinkStatsFromSamples(src);
    const b = thinkStatsFromSamples(src);
    expect(JSON.stringify(src)).toBe(snapshot);
    expect(a).toEqual(b);
  });
});

// ---------------- ② سفرِ ماندگار: build + sanitize + merge ----------------

const END = {
  reason: "finished" as const,
  winner: "s-me",
  total: 10,
  startedAt: 1_000,
  players: [
    { sid: "s-me", name: "من", color: "emerald", score: 1100, correct: 8, answered: 10 },
    { sid: "s-opp", name: "حریف", color: "rose", score: 900, correct: 4, answered: 10 },
  ],
};

describe("buildDuelRecord — ماندگاریِ آمارِ فکر", () => {
  it("با نمونهٔ فکر → think روی رکورد می‌نشیند (گردشده)", () => {
    const samples = [500, 700, 900, 300, 600, 800, 200, 400, 1000, 600];
    // میانگینِ 600 — دقیق
    const r = buildDuelRecord(END, "s-me", 5_000, 4_000, null, samples)!;
    expect(r.think).toEqual({ avgMs: 600, minMs: 200, maxMs: 1000, seen: 10, total: 10 });
  });

  it("بی‌نمونه (سرویسِ قدیمی) → کلیدِ think اصلاً غایب است — نه null", () => {
    const r = buildDuelRecord(END, "s-me", 5_000, 4_000, null)!;
    expect("think" in r).toBe(false);
    // کلیدهایِ سندِ ۹۴/۶۵ دست‌نخورده
    expect(Object.keys(r).sort()).toEqual(
      ["answered", "day", "durationSec", "id", "myCorrect", "myScore", "oppCorrect", "oppScore", "opponent", "opponentColor", "outcome", "receiptSig", "reason", "total"].sort()
    );
  });

  it("همه‌null → فیلدِ غایب (زیرمجموعهٔ صادق، نه فیلدِ تهی)", () => {
    const r = buildDuelRecord(END, "s-me", 5_000, 4_000, null, [null, null])!;
    expect("think" in r).toBe(false);
  });

  it("نمونه‌های خراب (منفی/غیرعدد) نادیده می‌شوند — فقط سالم‌ها می‌شمارند", () => {
    const r = buildDuelRecord(END, "s-me", 5_000, 4_000, null, [-5, 400, "x" as unknown as number, 800])!;
    expect(r.think).toEqual({ avgMs: 600, minMs: 400, maxMs: 800, seen: 2, total: 4 });
  });
});

describe("sanitizeDuelRecord — thinkِ خراب می‌افتد، رکورد می‌ماند", () => {
  it("thinkِ سالم از سفرِ ابر سالم بیرون می‌آید", () => {
    const src = quickRec({ id: "d1" });
    const out = sanitizeDuelRecord(JSON.parse(JSON.stringify(src)))!;
    expect(out.think).toEqual(src.think);
  });

  it("avgMs رشته/NaN/منفی → فیلد می‌افتد", () => {
    for (const bad of [{ ...quickThink(), avgMs: "۸۰۰" }, { ...quickThink(), avgMs: NaN }, { ...quickThink(), avgMs: -1 }]) {
      const out = sanitizeDuelRecord({ ...rec({ id: "d1" }), think: bad })!;
      expect(out.think, `avg=${String(bad.avgMs)}`).toBeUndefined();
      expect(out.id).toBe("d1"); // خودِ رکورد سرِ پاست
    }
  });

  it("seen غایتِ total یا کسری یا صفر → فیلد می‌افتد", () => {
    for (const bad of [{ ...quickThink(), seen: 11, total: 10 }, { ...quickThink(), seen: 2.5 }, { ...quickThink(), seen: 0, total: 0 }]) {
      const out = sanitizeDuelRecord({ ...rec({ id: "d1" }), think: bad })!;
      expect(out.think).toBeUndefined();
    }
  });

  it("ترتیبِ وارونهٔ min>avg یا avg>max → فیلد می‌افتد", () => {
    const out1 = sanitizeDuelRecord({ ...rec({ id: "d1" }), think: { ...quickThink(), minMs: 2000, avgMs: 800 } })!;
    const out2 = sanitizeDuelRecord({ ...rec({ id: "d1" }), think: { ...quickThink(), avgMs: 3000, maxMs: 1500 } })!;
    expect(out1.think).toBeUndefined();
    expect(out2.think).toBeUndefined();
  });

  it("sanitizeDuelHistory هم همان قرارداد را دارد (سقف/یکتایی دست‌نخورده)", () => {
    const good = JSON.parse(JSON.stringify(quickRec({ id: "d1" })));
    const bad = { ...JSON.parse(JSON.stringify(rec({ id: "d2" }))), think: { avgMs: "x" } };
    const out = sanitizeDuelHistory([good, bad]);
    expect(out).toHaveLength(2);
    expect(out[0].think).toBeTruthy();
    expect(out[1].think).toBeUndefined();
  });

  it("merge ابری think را عبور می‌دهد — اتحادِ id محور دست‌نخورده", () => {
    const mine = [quickRec({ id: "d1" })];
    const cloud = [quickRec({ id: "d2", outcome: "loss", myCorrect: 4 })];
    const merged = mergeDuelHistory(mine, cloud);
    expect(merged.map((r) => r.id)).toEqual(["d2", "d1"]);
    expect(merged[0].think).toBeTruthy();
    expect(merged[1].think).toBeTruthy();
  });
});

// ---------------- ③ گیتِ دومرحله‌ای: چابکیِ ذهن ----------------

describe("isQuickThinkRecord — مرزهایِ دقیق", () => {
  it("رکوردِ چابکِ کامل → true", () => {
    expect(isQuickThinkRecord(quickRec())).toBe(true);
  });

  it("مرزِ فکر: avgMs برابرِ ۱۵۰۰ → true (≤)؛ ۱۵۰۱ → false", () => {
    expect(isQuickThinkRecord(quickRec({}, { avgMs: DUEL_QUICK_THINK.quickMs }))).toBe(true);
    expect(isQuickThinkRecord(quickRec({}, { avgMs: DUEL_QUICK_THINK.quickMs + 1 }))).toBe(false);
  });

  it("مرزِ درستی: ۴ از ۵ (۰٫۸) → true؛ ۳ از ۵ → false", () => {
    expect(isQuickThinkRecord(quickRec({ answered: 5, myCorrect: 4 }, { seen: 5, total: 5 }))).toBe(true);
    expect(isQuickThinkRecord(quickRec({ answered: 5, myCorrect: 3 }, { seen: 5, total: 5 }))).toBe(false);
  });

  it("نمونهٔ نازک: seen<۳ → false — میانگینِ تک‌نمونه‌ای آمار نیست", () => {
    expect(isQuickThinkRecord(quickRec({}, { seen: 2, total: 10 }))).toBe(false);
  });

  it("نمونهٔ کوتاه: answered<۵ → false — نرخِ درستی بی‌معنا", () => {
    expect(isQuickThinkRecord(quickRec({ answered: 4, myCorrect: 4 }))).toBe(false);
  });

  it("رکوردِ قدیمیِ بی‌think → false — هرگز نمی‌شمارد", () => {
    expect(isQuickThinkRecord(rec())).toBe(false);
  });

  it("thinkِ خراب (هرگز throw نمی‌کند) → false", () => {
    expect(isQuickThinkRecord({ ...rec(), think: null as unknown as DuelRecord["think"] })).toBe(false);
    expect(isQuickThinkRecord({ ...rec(), think: "junk" as unknown as DuelRecord["think"] })).toBe(false);
    expect(isQuickThinkRecord({ ...rec(), think: { ...quickThink(), avgMs: NaN } })).toBe(false);
    expect(isQuickThinkRecord({ ...rec(), answered: NaN, think: quickThink() })).toBe(false);
  });

  it("برد لازم نیست — مساوی/باخت با درستیِ بالا چابک‌اند (قراردادِ «درستِ زیاد»)", () => {
    expect(isQuickThinkRecord(quickRec({ outcome: "tie" }))).toBe(true);
    expect(isQuickThinkRecord(quickRec({ outcome: "loss" }))).toBe(true);
  });
});

describe("duelQuickThinkers — شمارش و زیرمجموعه", () => {
  it("دفترچهٔ ترکیبی: فقط چابک‌ها می‌شمارند", () => {
    const ledger = [
      quickRec({ id: "d1" }), // چابک
      rec({ id: "d2" }), // قدیمیِ بی‌think
      quickRec({ id: "d3", myCorrect: 2, outcome: "loss" }, { avgMs: 500 }), // درستیِ کم
      quickRec({ id: "d4" }, { avgMs: 2500 }), // فکرِ زیاد
      quickRec({ id: "d5" }), // چابک
    ];
    expect(duelQuickThinkers(ledger)).toBe(2);
  });

  it("ورودیِ خراب → صفر (الگوی duelVerifiedWins)", () => {
    expect(duelQuickThinkers(undefined as unknown as DuelRecord[])).toBe(0);
    expect(duelQuickThinkers("junk" as unknown as DuelRecord[])).toBe(0);
    expect(duelQuickThinkers([null, rec({ id: "d1" })] as unknown as DuelRecord[])).toBe(0);
  });

  it("زیرمجموعهٔ ریاضی: چابک ⊆ thinkدار ⊆ کل — ۷⇒۳ در هر دو جهت", () => {
    const seven = Array.from({ length: 7 }, (_, i) => quickRec({ id: `q${i}` }));
    expect(duelQuickThinkers(seven)).toBe(7);
    // بریدنِ رکورد هرگز شمارش را زیاد نمی‌کند (پیمایشِ جدید→قدیم قطعیت)
    expect(duelQuickThinkers(seven.slice(0, 4))).toBe(4);
    expect(duelQuickThinkers(seven.slice(0, 2))).toBe(2);
  });

  it("خلوص و قطعیت — ورودی دست‌نخورده، دو بارِ هم‌نتیجه", () => {
    const ledger = [quickRec({ id: "d1" }), rec({ id: "d2" })];
    const snap = JSON.stringify(ledger);
    const a = duelQuickThinkers(ledger);
    const b = duelQuickThinkers(ledger);
    expect(JSON.stringify(ledger)).toBe(snap);
    expect(a).toBe(b);
  });
});

// ---------------- ④ سیم‌کشیِ نشان‌ها (buildEvalInput واقعی) ----------------

type BuildArgs = Parameters<typeof buildEvalInput>[0];
const BASE_DEFAULTS = {
  known: {},
  results: {},
  history: {},
  dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
  streak: 0,
  bestStreak: 0,
  mistakes: {},
} as unknown as BuildArgs;
const base = (over: Partial<BuildArgs> = {}) => buildEvalInput({ ...BASE_DEFAULTS, ...over });
const byId = (id: string): (typeof BADGES)[number] => BADGES.find((b) => b.id === id)!;

describe("نشان‌های چابکیِ ذهن — سیم‌کشی و زیرمجموعهٔ نشان", () => {
  it("duelQuickThinkers از دفترچهٔ واقعی به eval input می‌رسد", () => {
    const ledger = [quickRec({ id: "d1" }), quickRec({ id: "d2" }), rec({ id: "d3" })];
    const input = base({ duelHistory: ledger });
    expect(input.duelQuickThinkers).toBe(2);
    // پیشرفتِ شمارشیِ تک‌گایتی: زیرِ قفلِ نمونه، شمارِ نمونه می‌آید
    expect(byId("quick-think").progress!(input)).toContain("۲ از ۳");
    expect(byId("flash-mind").progress!(input)).toContain("۲ از ۷");
  });

  it("سه رکوردِ چابک → نیم‌نگاه باز؛ هفت → برقِ فکر هم باز (زیرمجموعهٔ ۷⇒۳)", () => {
    const three = Array.from({ length: 3 }, (_, i) => quickRec({ id: `q${i}` }));
    const input3 = base({ duelHistory: three });
    expect(byId("quick-think").check!(input3)).toBe(true);
    expect(byId("flash-mind").check!(input3)).toBe(false);

    const seven = Array.from({ length: 7 }, (_, i) => quickRec({ id: `q${i}` }));
    const input7 = base({ duelHistory: seven });
    expect(byId("quick-think").check!(input7)).toBe(true);
    expect(byId("flash-mind").check!(input7)).toBe(true);
  });

  it("دفترچهٔ پرِ بردِ عادیِ بی‌think → هر دو نشان قفل (صداقتِ زیرمجموعه)", () => {
    const legacy = Array.from({ length: 15 }, (_, i) => rec({ id: `l${i}` }));
    const input = base({ duelHistory: legacy });
    expect(input.duelQuickThinkers).toBe(0);
    const unlocked = [...unlockedBadgeIds(input)];
    expect(unlocked).not.toContain("quick-think");
    expect(unlocked).not.toContain("flash-mind");
  });

  it("wording و تیر و آیکن: نیم‌نگاه نقره/Eye، برقِ فکر طلا/BrainCircuit؛ رجیستری ۶۰", () => {
    expect(BADGES.length).toBe(60);
    expect(byId("quick-think").tier).toBe("silver");
    expect(byId("quick-think").icon).toBe("Eye");
    expect(byId("flash-mind").tier).toBe("gold");
    expect(byId("flash-mind").icon).toBe("BrainCircuit");
  });
});
