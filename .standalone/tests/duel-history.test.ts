// Task 65 «تاریخچهٔ نبردها» — موتور خالص دفترچهٔ دودل + اتصال اسلایس +
// پایداری (sanitize/merge). تا امروز از یک نبرد فقط W/L/T می‌ماند؛ این تست‌ها
// قرارداد رکورد کامل (حریف/امتیاز/تاریخ/فرم) را قفل می‌کنند.

import { describe, it, expect, beforeEach } from "vitest";
import {
  buildDuelRecord,
  pushDuelRecord,
  duelWinStreak,
  duelBestScore,
  duelVerifiedCount,
  duelVerifiedWins,
  duelForm,
  sanitizeDuelHistory,
  mergeDuelHistory,
  sanitizeDuelRecord,
  DUEL_HISTORY_CAP,
  type DuelRecord,
} from "@/lib/duel-history";
import { useStudy } from "@/lib/study-store";
import { SYNC_FIELDS, sanitizeAll, mergeAll } from "@/lib/persist/schema";

// ---------------- سازنده‌های کمکی قطعی ----------------

// ظهرِ محلی — تا day key محلیِ رکورد قطعاً «2026-10-12» بماند (تولیدکنندگانِ
// day-key در کل اپ از getterهای محلی استفاده می‌کنند، نه UTC)
const NOW = new Date(2026, 9, 12, 12, 0, 0).getTime();
const STARTED = NOW - 95_000; // نبرد ۹۵ ثانیه طول کشیده

const endPayload = (over: Partial<Parameters<typeof buildDuelRecord>[0]> = {}) => ({
  reason: "finished" as const,
  winner: "me" as string | null,
  total: 10,
  startedAt: STARTED,
  players: [
    { sid: "me", name: "من", color: "emerald", score: 1200, correct: 8, answered: 10 },
    { sid: "opp", name: "سینا", color: "rose", score: 950, correct: 6, answered: 9 },
  ],
  ...over,
});

const rec = (over: Partial<DuelRecord> = {}): DuelRecord => ({
  id: "d1000",
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

// ---------------- buildDuelRecord ----------------

describe("buildDuelRecord", () => {
  it("win: نگاشت کامل فیلدها از EndPayload", () => {
    const r = buildDuelRecord(endPayload(), "me", NOW, STARTED + 90_000)!;
    expect(r.outcome).toBe("win");
    expect(r.opponent).toBe("سینا");
    expect(r.opponentColor).toBe("rose");
    expect(r.myScore).toBe(1200);
    expect(r.oppScore).toBe(950);
    expect(r.myCorrect).toBe(8);
    expect(r.oppCorrect).toBe(6);
    expect(r.answered).toBe(10);
    expect(r.total).toBe(10);
    expect(r.reason).toBe("finished");
    expect(r.durationSec).toBe(90); // از myFinishAt
    expect(r.id).toMatch(/^d\d+$/);
    expect(r.day).toBe("2026-10-12");
  });

  it("loss/tie/forfeit: برندگان و دلیل پایان", () => {
    expect(buildDuelRecord(endPayload({ winner: "opp" }), "me", NOW)!.outcome).toBe("loss");
    expect(buildDuelRecord(endPayload({ winner: null }), "me", NOW)!.outcome).toBe("tie");
    expect(buildDuelRecord(endPayload({ reason: "forfeit" }), "me", NOW)!.reason).toBe("forfeit");
  });

  it("بدون بازیکن خودی → null؛ بدون حریف → فالبک «حریف»", () => {
    expect(buildDuelRecord(endPayload(), "ghost", NOW)).toBeNull();
    const solo = buildDuelRecord(endPayload({ players: [endPayload().players[0]] }), "me", NOW)!;
    expect(solo.opponent).toBe("حریف");
    expect(solo.oppScore).toBe(0);
  });

  it("duration: فالبک به now وقتی myFinishAt=0 (فورفیت/تایم‌اوت) و startedAt=null → ۰", () => {
    expect(buildDuelRecord(endPayload(), "me", NOW)!.durationSec).toBe(95);
    expect(buildDuelRecord(endPayload({ startedAt: null }), "me", NOW)!.durationSec).toBe(0);
  });

  it("clamp: امتیاز/مدت خارج از محدوده سقف می‌خورد", () => {
    const r = buildDuelRecord(
      endPayload({
        startedAt: NOW - 10 * 3600_000, // ۱۰ ساعت پیش
        players: [
          { sid: "me", name: "من", color: "emerald", score: 9e9, correct: 8, answered: 10 },
          { sid: "opp", name: "سینا", color: "rose", score: 950, correct: 6, answered: 9 },
        ],
      }),
      "me",
      NOW
    )!;
    expect(r.myScore).toBe(1_000_000);
    expect(r.durationSec).toBe(7200);
  });
});

// ---------------- pushDuelRecord + خلاصه‌ها ----------------

describe("pushDuelRecord + summaries", () => {
  it("newest-first، حذف تکراریِ هم‌id، سقف ۱۵", () => {
    let log: DuelRecord[] = [];
    for (let i = 0; i < DUEL_HISTORY_CAP + 4; i++) {
      log = pushDuelRecord(log, rec({ id: `d${i}`, myScore: i }));
    }
    expect(log).toHaveLength(DUEL_HISTORY_CAP);
    expect(log[0].id).toBe(`d${DUEL_HISTORY_CAP + 3}`); // جدیدترین جلو
    // درج هم‌id جایگزین می‌شود، نه تکرار
    const twice = pushDuelRecord(pushDuelRecord([], rec({ id: "d1" })), rec({ id: "d1", myScore: 7 }));
    expect(twice).toHaveLength(1);
    expect(twice[0].myScore).toBe(7);
  });

  it("برد متوالی: از جدیدترین؛ مساوی و باخت می‌شکنند", () => {
    expect(duelWinStreak([])).toBe(0);
    expect(duelWinStreak([rec(), rec(), rec()])).toBe(3);
    expect(duelWinStreak([rec(), rec({ outcome: "tie" }), rec()])).toBe(1);
    expect(duelWinStreak([rec({ outcome: "loss" }), rec(), rec()])).toBe(0);
  });

  it("بهترین امتیاز و فرم ۵تایی", () => {
    expect(duelBestScore([])).toBe(0);
    expect(duelBestScore([rec({ myScore: 300 }), rec({ myScore: 1500 }), rec({ myScore: 900 })])).toBe(1500);
    const log = [rec(), rec(), rec({ outcome: "loss" }), rec({ outcome: "tie" }), rec(), rec(), rec()];
    expect(duelForm(log, 5)).toEqual(["win", "win", "loss", "tie", "win"]);
  });
});

// ---------------- اسلایس arcade ----------------

describe("arcade slice — recordDuelOutcome با رکورد", () => {
  const resetAll = () =>
    useStudy.setState({ duelWins: 0, duelLosses: 0, duelTies: 0, duelHistory: [] });

  beforeEach(resetAll);

  it("شمارنده‌ها + دفترچه با هم؛ بدون رکورد فقط شمارنده‌ها", () => {
    const s0 = useStudy.getState();
    s0.recordDuelOutcome("win", rec({ id: "d1", outcome: "win" }));
    s0.recordDuelOutcome("loss");
    const s1 = useStudy.getState();
    expect(s1.duelWins).toBe(1);
    expect(s1.duelLosses).toBe(1);
    expect(s1.duelHistory).toHaveLength(1);
    expect(s1.duelHistory[0].id).toBe("d1");
  });

  it("دو رکورد → newest-first در اسلایس هم برقرار است", () => {
    const s = useStudy.getState();
    s.recordDuelOutcome("win", rec({ id: "d1" }));
    s.recordDuelOutcome("loss", rec({ id: "d2", outcome: "loss" }));
    const hist = useStudy.getState().duelHistory;
    expect(hist.map((r) => r.id)).toEqual(["d2", "d1"]);
  });
});

// ---------------- پایداری: sanitize + merge ----------------

describe("sanitizeDuelHistory + mergeDuelHistory", () => {
  it("غیرآرایه → خالی؛ رکورد خراب می‌افتد نه نصفه", () => {
    expect(sanitizeDuelHistory("junk")).toEqual([]);
    expect(sanitizeDuelHistory([null, 42, { id: "d1" }])).toEqual([]); // day/outcome ندارد
    expect(sanitizeDuelHistory([{ ...rec(), day: "2026/10/12" }])).toEqual([]); // روز نامعتبر
    expect(sanitizeDuelHistory([{ ...rec(), outcome: "draw" }])).toEqual([]); // نتیجهٔ نامعتبر
  });

  it("clamp + نرمال‌سازی فیلدها روی رکورد سالم", () => {
    const [r] = sanitizeDuelHistory([
      rec({ myScore: 9e9, durationSec: 999_999, opponent: "  ".padEnd(3, "x"), opponentColor: "w".repeat(99) }),
    ]);
    expect(r!.myScore).toBe(1_000_000);
    expect(r!.durationSec).toBe(7200);
    expect(r!.opponentColor.length).toBeLessThanOrEqual(24);
  });

  it("تکراریِ id و سقف ۱۵ — نوترین‌ها می‌مانند (r386: مرز، ترتیب را هم ترمیم میکند)", () => {
    // r386 حکم — رفتارِ قدیم: «۱۵تایِ اولِ ورودی» میماندند؛ با ورودیِ
    // صعودیِ این آزمون، قدیمی‌ترین‌ها زنده میماندند و نوترین‌ها (d16..d18)
    // میافتند — دروغِ سقف. مرزِ نو: ۱۵تایِ «نوترین» با epoch. تکراریِ
    // d1 هم دیگر سقف را رد نمیکند (قدیمی‌ترین است) — اولین-برندهِ dedupe
    // فقط محتواست، نه بلیتِ ماندن.
    const flood = Array.from({ length: DUEL_HISTORY_CAP + 3 }, (_, i) => rec({ id: `d${i + 1}` }));
    const out = sanitizeDuelHistory([...flood, rec({ id: "d1", myScore: 5 })]);
    expect(out).toHaveLength(DUEL_HISTORY_CAP);
    // نوترین‌ها: d18..d4 — و ترتیبِ خروجی newest-first است
    expect(out[0].id).toBe("d18");
    expect(out.map((r) => r.id)).toEqual(
      Array.from({ length: DUEL_HISTORY_CAP }, (_, i) => `d${DUEL_HISTORY_CAP + 3 - i}`)
    );
    expect(out.find((r) => r.id === "d1")).toBeUndefined(); // قدیمی‌ترین، افتاده
  });

  it("merge ابری: اتحاد بر اساس id، مرتب newest-first، سقف‌خورده", () => {
    const l = [rec({ id: "d2" }), rec({ id: "d1" })];
    const r = [rec({ id: "d3" }), rec({ id: "d2", myScore: 7 })]; // d2 تکراری — محلی می‌ماند
    const m = mergeDuelHistory(l, r);
    expect(m.map((x) => x.id)).toEqual(["d3", "d2", "d1"]);
    expect(m.find((x) => x.id === "d2")!.myScore).toBe(1200);
    const far = Array.from({ length: 20 }, (_, i) => rec({ id: `d${100 + i}` }));
    expect(mergeDuelHistory([], far)).toHaveLength(DUEL_HISTORY_CAP);
    expect(mergeDuelHistory([], far)[0].id).toBe("d119"); // بزرگ‌ترین id جلو
  });
});

// ---------------- تسک ۹۶ — رسیدِ داور روی رکوردهای دفترچه ----------------

const SIG = "a".repeat(64);
const SIG2 = "f".repeat(64);

describe("buildDuelRecord — receiptSig (Task 96)", () => {
  it("sig سالم ذخیره می‌شود؛ نامشکل/غایب فیلد ثبت نمی‌کند", () => {
    const withSig = buildDuelRecord(endPayload(), "me", NOW, STARTED + 90_000, SIG)!;
    expect(withSig.receiptSig).toBe(SIG);
    // نامشکل: رشتهٔ کوتاه/غیرهگز — هیچ
    expect(buildDuelRecord(endPayload(), "me", NOW, 0, "zz")!.receiptSig).toBeUndefined();
    expect(buildDuelRecord(endPayload(), "me", NOW, 0, "g".repeat(64))!.receiptSig).toBeUndefined();
    expect(buildDuelRecord(endPayload(), "me", NOW, 0, SIG + "0")!.receiptSig).toBeUndefined(); // ۶۵ نویسه
    // غایب/null → فیلدِ رکوردهای قدیمی
    expect(buildDuelRecord(endPayload(), "me", NOW)!.receiptSig).toBeUndefined();
    expect(buildDuelRecord(endPayload(), "me", NOW, 0, null)!.receiptSig).toBeUndefined();
  });

  it("باخت/مساوی هم رسید دارند — رسید برای دو طرف است، نه فقط برنده", () => {
    expect(buildDuelRecord(endPayload({ winner: "opp" }), "me", NOW, 0, SIG2)!.receiptSig).toBe(SIG2);
    expect(buildDuelRecord(endPayload({ winner: null }), "me", NOW, 0, SIG2)!.receiptSig).toBe(SIG2);
  });
});

describe("sanitize + verifiedCount + merge upgrade (Task 96)", () => {
  it("sanitizeDuelRecord: sig سالم می‌ماند، sig خراب می‌افتد، رکوردِ بی‌sig (قدیمی) سرِ پا می‌ماند", () => {
    expect(sanitizeDuelRecord(rec({ receiptSig: SIG }))!.receiptSig).toBe(SIG);
    expect(sanitizeDuelRecord(rec({ receiptSig: "Q".repeat(64) }))!.receiptSig).toBeUndefined();
    expect(sanitizeDuelRecord(rec({ receiptSig: 12345 as unknown as string }))!.receiptSig).toBeUndefined();
    const legacy = sanitizeDuelRecord(rec());
    expect(legacy).not.toBeNull();
    expect(legacy!.receiptSig).toBeUndefined();
    // idempotent: خروجیِ sanitize دوباره sanitize شده همان می‌ماند
    expect(sanitizeDuelRecord(legacy!)).toEqual(legacy);
  });

  it("duelVerifiedCount: زیرمجموعهٔ صادق — صفر روی دفترچهٔ قدیمی", () => {
    expect(duelVerifiedCount([])).toBe(0);
    expect(duelVerifiedCount([rec(), rec()])).toBe(0);
    expect(duelVerifiedCount([rec({ receiptSig: SIG }), rec(), rec({ receiptSig: SIG2 })])).toBe(2);
  });

  // ---- duelVerifiedWins (Task 105) — زیرمجموعهٔ صادقِ زیرمجموعه: هم برد هم رسید
  it("duelVerifiedWins: فقط «بردِ» رسیددار می‌شمارد — باخت/مساویِ رسیددار و بردِ بی‌رسید هیچ‌کدام", () => {
    expect(duelVerifiedWins([])).toBe(0);
    expect(duelVerifiedWins([rec(), rec({ outcome: "loss" })])).toBe(0); // بردِ بی‌sig
    // باختِ رسیددار: verified هست، verifiedWin نه
    expect(duelVerifiedWins([rec({ outcome: "loss", receiptSig: SIG })])).toBe(0);
    // مساویِ رسیددار: همین‌طور
    expect(duelVerifiedWins([rec({ outcome: "tie", receiptSig: SIG })])).toBe(0);
    // بردِ رسیددار: می‌شمارد
    expect(duelVerifiedWins([rec({ receiptSig: SIG }), rec({ receiptSig: SIG2 })])).toBe(2);
    // ترکیبی: از ۵ رکورد فقط دو بردِ رسیددار
    const mixed = [
      rec({ receiptSig: SIG }),
      rec({ outcome: "loss", receiptSig: SIG2 }),
      rec(),
      rec({ receiptSig: SIG }),
      rec({ outcome: "tie" }),
    ];
    expect(duelVerifiedWins(mixed)).toBe(2);
  });

  it("duelVerifiedWins: زیرمجموعهٔ duelVerifiedCount و زیرمجموعهٔ بردها — در هر ترکیبی", () => {
    const pool = [
      rec({ receiptSig: SIG }),
      rec({ outcome: "loss", receiptSig: SIG }),
      rec({ outcome: "tie", receiptSig: SIG }),
      rec(),
      rec({ outcome: "loss" }),
    ];
    const wins = pool.filter((r) => r.outcome === "win").length;
    expect(duelVerifiedWins(pool)).toBeLessThanOrEqual(duelVerifiedCount(pool));
    expect(duelVerifiedWins(pool)).toBeLessThanOrEqual(wins);
    expect(duelVerifiedWins(pool)).toBe(1);
  });

  it("duelVerifiedWins: خلوص و قطعیت — همان ورودی همان خروجی، ورودی را تغییر نمی‌دهد", () => {
    const pool = [rec({ receiptSig: SIG }), rec({ outcome: "loss", receiptSig: SIG2 })];
    const snapshot = JSON.stringify(pool);
    const a = duelVerifiedWins(pool);
    const b = duelVerifiedWins(pool);
    expect(a).toBe(b);
    expect(a).toBe(1);
    expect(JSON.stringify(pool)).toBe(snapshot);
  });

  it("sanitizeAll فیلدِ تازه را از snapshot منتقل می‌کند", () => {
    const d = sanitizeAll({ duelHistory: [rec({ id: "d9", receiptSig: SIG })] });
    expect(d.duelHistory![0].receiptSig).toBe(SIG);
  });

  it("merge هم‌id: رکوردِ رسیددار کامل‌تر است — ارتقا بله، تنزل هرگز", () => {
    // محلیِ بی‌sig + دوریِ sigدار → ارتقا
    const up = mergeDuelHistory([rec({ id: "d1" })], [rec({ id: "d1", receiptSig: SIG })]);
    expect(up.find((x) => x.id === "d1")!.receiptSig).toBe(SIG);
    // محلیِ sigدار + دوریِ بی‌sig → محلی می‌ماند (تنزل نه)
    const keep = mergeDuelHistory([rec({ id: "d1", receiptSig: SIG, myScore: 777 })], [rec({ id: "d1", myScore: 42 })]);
    const k = keep.find((x) => x.id === "d1")!;
    expect(k.receiptSig).toBe(SIG);
    expect(k.myScore).toBe(777);
    // هر دو بی‌sig → رفتارِ قدیمی: محلی می‌ماند
    const legacy = mergeDuelHistory([rec({ id: "d2", myScore: 1200 })], [rec({ id: "d2", myScore: 7 })]);
    expect(legacy.find((x) => x.id === "d2")!.myScore).toBe(1200);
  });
});

// ---------------- اتصال جدول SyncField ----------------

describe("SyncField wiring", () => {
  it("duelHistory در جدول است: sanitize + merge تابع‌دار", () => {
    expect(typeof SYNC_FIELDS["duelHistory"].sanitize).toBe("function");
    expect(typeof SYNC_FIELDS["duelHistory"].merge).toBe("function");
  });

  it("sanitizeAll یک snapshot نامطمئن را به دفترچهٔ سالم تبدیل می‌کند", () => {
    const d = sanitizeAll({ duelHistory: [rec(), "junk", rec({ id: "d2" })] });
    expect(d.duelHistory).toHaveLength(2);
    expect(d.duelHistory![0].id).toBe("d1000");
    // idempotent
    const again = sanitizeAll({ duelHistory: d.duelHistory });
    expect(again.duelHistory).toEqual(d.duelHistory);
  });

  it("mergeAll دو دستگاه را روی دفترچه متحد می‌کند", () => {
    const local = sanitizeAll({ duelHistory: [rec({ id: "d1" })] });
    const remote = sanitizeAll({ duelHistory: [rec({ id: "d2" })] });
    const merged = mergeAll(local, remote);
    expect(merged.duelHistory!.map((r) => r.id)).toEqual(["d2", "d1"]);
  });

  it("sanitizeDuelRecord: ورودی سالم → همان معنا، ورودی خطرناک → null", () => {
    expect(sanitizeDuelRecord(rec())!.outcome).toBe("win");
    expect(sanitizeDuelRecord([])).toBeNull();
    expect(sanitizeDuelRecord({ ...rec(), id: "" })).toBeNull();
  });
});
