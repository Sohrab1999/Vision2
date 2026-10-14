// ------------------------------------------------------------------
// Task 110 «هفتهٔ چابک» — دهمین خانوادهٔ نشان: گیتِ ترکیبیِ هفتگی.
//
// سه لایه این‌جا قفل می‌شود:
//   ① DUEL_QUICK_WEEK — یک قرارداد با ۱۰۸: silverMs/correctRate از
//      DUEL_QUICK_THINK می‌آیند تا آستانه‌ها هرگز دووجهی نشوند
//   ② duelQuickWeekReport — پنجره‌های لغزانِ لنگربر-روزِ رکورد؛ میانگینِ
//      وزن‌دار بر seen (هم‌وزنِ فکرِ هفتهٔ ۱۰۹)؛ نرخِ درستی از همهٔ
//      پاسخ‌های پنجره (هفتهٔ سریعِ بی‌دقت گیت را نمی‌گذراند)؛ مرزهای
//      دقیقِ ≤۱۵۰۰/≤۱۰۰۰/≥۰٫۸/≥۳/≥۹/≥۱۵ تست-قفل
//   ③ سیم‌کشیِ buildEvalInput + دو نشانِ جدید در رجیستریِ ۵۵تایی —
//      زیرمجموعهٔ ریاضیِ طلا⇒نقره در هر دو جهت
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import {
  duelQuickWeekReport,
  DUEL_QUICK_WEEK,
  dayKeyBefore,
  type QuickWeekReport,
} from "@/lib/weekly-digest";
import { DUEL_QUICK_THINK, type DuelRecord } from "@/lib/duel-history";
import { BADGES, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";

// ---------------- سازنده‌های کمکی قطعی ----------------

const BASE = "2026-10-13";
/** روزِ n روزِ پیش از BASE — همان قراردادِ dayKeyBefore (خالص، قطعی) */
const dayAgo = (n: number): string => dayKeyBefore(BASE, n);

const rec = (over: Partial<DuelRecord> = {}): DuelRecord => ({
  id: `d${Math.floor(Math.random() * 1e9)}`,
  day: BASE,
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1100,
  oppScore: 900,
  myCorrect: 9,
  oppCorrect: 4,
  answered: 10,
  total: 10,
  durationSec: 80,
  ...over,
});

const quickThink = (over: Partial<NonNullable<DuelRecord["think"]>> = {}): NonNullable<DuelRecord["think"]> => ({
  avgMs: 800,
  minMs: 200,
  maxMs: 1500,
  seen: 10,
  total: 10,
  ...over,
});

const quickRec = (
  over: Partial<DuelRecord> = {},
  thinkOver: Partial<NonNullable<DuelRecord["think"]>> = {}
) => rec({ think: quickThink(thinkOver), ...over });

/** هفتهٔ سریعِ استاندارد: سه نبردِ فکردار روی سه روزِ متوالی — واجدِ نقره */
const quickWeekSeed = (): DuelRecord[] => [
  quickRec({ id: "w1", day: dayAgo(0), opponent: "حریفِ یکم" }),
  quickRec({ id: "w2", day: dayAgo(1), opponent: "حریفِ دوم" }),
  quickRec({ id: "w3", day: dayAgo(2), opponent: "حریفِ سوم" }),
];

const emptyReport = (r: QuickWeekReport): void => {
  expect(r.qualifying).toBeNull();
  expect(r.bestAvgMs).toBeNull();
  expect(r.maxThinkful).toBe(0);
};

// ---------------- ① قراردادِ یک‌وجهی با ۱۰۸ ----------------

describe("DUEL_QUICK_WEEK — یک قرارداد با چابکیِ ذهن", () => {
  it("آستانه‌های نقره/نرخ از DUEL_QUICK_THINK می‌آیند — هرگز دووجهی نمی‌شوند", () => {
    expect(DUEL_QUICK_WEEK.silverMs).toBe(DUEL_QUICK_THINK.quickMs);
    expect(DUEL_QUICK_WEEK.correctRate).toBe(DUEL_QUICK_THINK.correctRate);
    expect(DUEL_QUICK_WEEK.goldMs).toBeLessThan(DUEL_QUICK_WEEK.silverMs);
    expect(DUEL_QUICK_WEEK.windowDays).toBe(7);
    expect(DUEL_QUICK_WEEK.minThinkful).toBe(3);
    expect(DUEL_QUICK_WEEK.minSeen).toBe(9);
    expect(DUEL_QUICK_WEEK.minAnswered).toBe(15);
  });
});

// ---------------- ② duelQuickWeekReport — گیتِ هفتگی ----------------

describe("duelQuickWeekReport — گیتِ ترکیبیِ پنجرهٔ ۷روزه", () => {
  it("هفتهٔ استانداردِ سه‌نبرده → واجد با میانگینِ وزن‌دار و پنجرهٔ [لنگر−۶..لنگر]", () => {
    const r = duelQuickWeekReport(quickWeekSeed());
    expect(r.qualifying).not.toBeNull();
    // لنگر = جدیدترین روزِ رکورد؛ آغاز = شش روزِ پیش‌تر
    expect(r.qualifying!.endDay).toBe(dayAgo(0));
    expect(r.qualifying!.startDay).toBe(dayKeyBefore(dayAgo(0), 6));
    expect(r.qualifying!.thinkful).toBe(3);
    expect(r.qualifying!.duels).toBe(3);
    // وزن‌دار: (۸۰۰×۱۰×۳)÷۳۰ = ۸۰۰
    expect(r.qualifying!.avgMs).toBe(800);
    expect(r.qualifying!.seen).toBe(30);
    expect(r.qualifying!.answered).toBe(30);
    expect(r.qualifying!.correct).toBe(27);
    expect(r.qualifying!.rate).toBeCloseTo(0.9, 10);
    expect(r.maxThinkful).toBe(3);
    expect(r.bestAvgMs).toBe(800);
  });

  it("میانگینِ میانگین‌ها وزن‌دار است — نبردِ پرنمونه سنگین‌تر (هم‌وزنِ ۱۰۹)", () => {
    // ۶۰۰ms با ۱۰ نمونه + ۹۰۰ms با ۵ نمونه → (۶۰۰۰+۴۵۰۰)÷۱۵ = ۷۰۰ نه ۷۵۰
    const r = duelQuickWeekReport([
      quickRec({ id: "a1", day: dayAgo(0), opponent: "ح" }, { avgMs: 600, minMs: 300 }),
      quickRec({ id: "a2", day: dayAgo(1), opponent: "د" }, { avgMs: 900, minMs: 400, seen: 5, total: 5 }),
      quickRec({ id: "a3", day: dayAgo(2), opponent: "و" }, { avgMs: 900, minMs: 400, seen: 5, total: 5 }),
    ]);
    expect(r.qualifying!.seen).toBe(20);
    expect(r.qualifying!.avgMs).toBe(750); // (۶۰۰۰+۴۵۰۰+۴۵۰۰)÷۲۰
  });

  it("زیرمجموعهٔ ریاضیِ طلا⇒نقره — مرزهای دقیقِ ۱۰۰۰ و ۱۵۰۰ هر دو جهت", () => {
    const atMs = (ms: number) =>
      duelQuickWeekReport([
        quickRec({ id: "g1", day: dayAgo(0), opponent: "ح" }, { avgMs: ms, minMs: ms - 100 }),
        quickRec({ id: "g2", day: dayAgo(1), opponent: "د" }, { avgMs: ms, minMs: ms - 100 }),
        quickRec({ id: "g3", day: dayAgo(2), opponent: "و" }, { avgMs: ms, minMs: ms - 100 }),
      ]);
    // مرزِ دقیقِ طلا: ۱۰۰۰ → هر دو باز
    const goldEdge = atMs(1000);
    expect(goldEdge.qualifying!.avgMs).toBe(1000);
    expect(goldEdge.qualifying!.avgMs <= DUEL_QUICK_WEEK.goldMs).toBe(true);
    expect(goldEdge.qualifying!.avgMs <= DUEL_QUICK_WEEK.silverMs).toBe(true);
    // بینِ دو پله: ۱۰۰۱ → نقره بله، طلا نه
    const between = atMs(1001);
    expect(between.qualifying!.avgMs <= DUEL_QUICK_WEEK.goldMs).toBe(false);
    expect(between.qualifying!.avgMs <= DUEL_QUICK_WEEK.silverMs).toBe(true);
    // مرزِ دقیقِ نقره: ۱۵۰۰ → نقره بله، طلا نه
    const silverEdge = atMs(1500);
    expect(silverEdge.qualifying!.avgMs <= DUEL_QUICK_WEEK.silverMs).toBe(true);
    expect(silverEdge.qualifying!.avgMs <= DUEL_QUICK_WEEK.goldMs).toBe(false);
    // فراتر: ۱۵۰۱ → هیچ‌کدام
    expect(atMs(1501).qualifying).toBeNull();
  });

  it("کفِ نبردهای فکردار: دو نبردِ فکردار حتی پرنمونه واجد نمی‌شود — ولی شمارِ پیشرفتِ صادق می‌ماند", () => {
    const r = duelQuickWeekReport([
      quickRec({ id: "t1", day: dayAgo(0), opponent: "ح" }),
      quickRec({ id: "t2", day: dayAgo(1), opponent: "د" }),
    ]);
    expect(r.qualifying).toBeNull();
    expect(r.bestAvgMs).toBeNull(); // زیرِ کفِ ۳ فکردار — میانگینِ نمایشی هم نیست
    expect(r.maxThinkful).toBe(2); // اما دو فکردارِ یک پنجره دیده می‌شوند
  });

  it("کفِ نمونهٔ فکر: جمعِ seen=۸ (۳+۳+۲) گیت را نمی‌گذراند؛ ۹ مرزِ دقیقِ عبور", () => {
    const below = duelQuickWeekReport([
      quickRec({ id: "s1", day: dayAgo(0), opponent: "ح" }, { seen: 3, total: 3 }),
      quickRec({ id: "s2", day: dayAgo(1), opponent: "د" }, { seen: 3, total: 3 }),
      quickRec({ id: "s3", day: dayAgo(2), opponent: "و" }, { seen: 2, total: 2 }),
    ]);
    // سه فکردار هست — میانگینِ نمایشیِ طلا صادق محاسبه می‌شود، ولی گیتِ seen=۹ نمی‌گذرد
    expect(below.qualifying).toBeNull();
    expect(below.bestAvgMs).toBe(800);
    expect(below.maxThinkful).toBe(3);
    const edge = duelQuickWeekReport([
      quickRec({ id: "e1", day: dayAgo(0), opponent: "ح" }, { seen: 3, total: 3 }),
      quickRec({ id: "e2", day: dayAgo(1), opponent: "د" }, { seen: 3, total: 3 }),
      quickRec({ id: "e3", day: dayAgo(2), opponent: "و" }, { seen: 3, total: 3 }),
    ]);
    expect(edge.qualifying).not.toBeNull();
    expect(edge.qualifying!.seen).toBe(9);
  });

  it("کفِ پاسخ: جمعِ answered=۱۴ قفل می‌ماند؛ ۱۵ مرزِ دقیقِ عبور", () => {
    const mk = (perDuel: number) =>
      duelQuickWeekReport([
        quickRec({ id: "n1", day: dayAgo(0), opponent: "ح", answered: perDuel, myCorrect: perDuel }),
        quickRec({ id: "n2", day: dayAgo(1), opponent: "د", answered: perDuel, myCorrect: perDuel }),
        quickRec({ id: "n3", day: dayAgo(2), opponent: "و", answered: perDuel, myCorrect: perDuel }),
      ]);
    expect(mk(4).qualifying).toBeNull(); // ۱۲ < ۱۵
    expect(mk(5).qualifying).not.toBeNull(); // ۱۵ = مرز
  });

  it("نرخِ درستی از همهٔ پاسخ‌های پنجره می‌خواند — هفتهٔ سریعِ بی‌دقت قفل می‌ماند", () => {
    const r = duelQuickWeekReport([
      // سه نبردِ چابکِ ۹۰٪ — و به‌شدتِ بی‌دقتِ یک نبردِ عادیِ همان هفته
      quickRec({ id: "c1", day: dayAgo(0), opponent: "ح" }),
      quickRec({ id: "c2", day: dayAgo(1), opponent: "د" }),
      quickRec({ id: "c3", day: dayAgo(2), opponent: "و" }),
      rec({ id: "c4", day: dayAgo(1), opponent: "ش", myCorrect: 1, answered: 10, outcome: "loss" }),
    ]);
    // (۲۷+۱)÷(۳۰+۱۰) = ۰٫۷ — زیرِ گیتِ ۰٫۸
    expect(r.qualifying).toBeNull();
    expect(r.bestAvgMs).toBe(800); // میانگینِ نمایشیِ طلا هنوز صادق است
    expect(r.maxThinkful).toBe(3);
  });

  it("نرخ با سقفِ ۱ محافظت می‌شود — درستیِ بیش‌ازصدِ ورودیِ خراب گمراه نمی‌کند", () => {
    const r = duelQuickWeekReport([
      quickRec({ id: "x1", day: dayAgo(0), opponent: "ح", myCorrect: 12, answered: 10 }),
      quickRec({ id: "x2", day: dayAgo(1), opponent: "د" }),
      quickRec({ id: "x3", day: dayAgo(2), opponent: "و" }),
    ]);
    expect(r.qualifying).not.toBeNull();
    expect(r.qualifying!.rate).toBe(1);
  });

  it("فورفیتِ بی‌پاسخ نه به نرخ کمکی دارد نه زیانی — اما در duels می‌شمارد", () => {
    const r = duelQuickWeekReport([
      ...quickWeekSeed(),
      rec({ id: "f1", day: dayAgo(1), opponent: "ش", answered: 0, myCorrect: 0, outcome: "loss", reason: "forfeit" }),
    ]);
    expect(r.qualifying).not.toBeNull();
    expect(r.qualifying!.duels).toBe(4);
    expect(r.qualifying!.answered).toBe(30);
    expect(r.qualifying!.rate).toBeCloseTo(0.9, 10);
  });

  it("مرزِ پنجرهٔ ۷روزه: سه رکورد در یک پنجرهٔ ۷روزه واجد می‌شود؛ فاصلهٔ ۷روزه هرگز", () => {
    // پخشِ دور: امروز، ۶روز و ۱۳روزِ پیش — هیچ پنجره‌ای هر سه را نمی‌گیرد
    // (۶ و ۱۳ با فاصلهٔ ۷روز از هم‌اند — پنجرهٔ ۷روزه فقط ۶ روز عقب‌تر را می‌بیند)
    const spread = duelQuickWeekReport([
      quickRec({ id: "d0", day: dayAgo(0), opponent: "ح" }),
      quickRec({ id: "d6", day: dayAgo(6), opponent: "د" }),
      quickRec({ id: "d13", day: dayAgo(13), opponent: "و" }),
    ]);
    expect(spread.qualifying).toBeNull();
    expect(spread.bestAvgMs).toBeNull();
    expect(spread.maxThinkful).toBe(2); // امروز و ۶روزِ پیش در پنجرهٔ لنگرِ امروز
    // فشرده: سه روزِ متوالیِ ۸/۹/۱۰روزِ پیش — هفتهٔ گذشتهٔ خودشان واجد است
    const packed = duelQuickWeekReport([
      quickRec({ id: "p8", day: dayAgo(8), opponent: "ح" }),
      quickRec({ id: "p9", day: dayAgo(9), opponent: "د" }),
      quickRec({ id: "p10", day: dayAgo(10), opponent: "و" }),
    ]);
    expect(packed.qualifying).not.toBeNull();
    expect(packed.qualifying!.endDay).toBe(dayAgo(8));
    expect(packed.qualifying!.startDay).toBe(dayKeyBefore(dayAgo(8), 6));
    // مرزِ دقیقِ پهنای پنجره: جدیدترین و قدیمی‌ترین با فاصلهٔ دقیقاً ۶ روز
    // (۷ روزِ تقویمی) در یک پنجره می‌افتند؛ ۷ روزِ فاصله هرگز
    const edge6 = duelQuickWeekReport([
      quickRec({ id: "e8", day: dayAgo(8), opponent: "ح" }),
      quickRec({ id: "e14", day: dayAgo(14), opponent: "د" }),
      quickRec({ id: "e13", day: dayAgo(13), opponent: "و" }),
    ]);
    // لنگرِ ۸: [۱۴−..۸−] هر سه (۸،۱۳،۱۴) — فاصلهٔ ۸−۱۴ = ۶ روز ✓
    expect(edge6.qualifying).not.toBeNull();
    const gap7 = duelQuickWeekReport([
      quickRec({ id: "g7", day: dayAgo(7), opponent: "ح" }),
      quickRec({ id: "g14", day: dayAgo(14), opponent: "د" }),
      quickRec({ id: "g13", day: dayAgo(13), opponent: "و" }),
    ]);
    // لنگرِ ۷: [−۱۳..−۷] فقط ۷ و ۱۳ (۲تایی)؛ لنگرِ ۱۳: ۱۳ و ۱۴ (۲تایی)؛ لنگرِ ۱۴: ۱تایی
    expect(gap7.qualifying).toBeNull();
    expect(gap7.bestAvgMs).toBeNull();
    expect(gap7.maxThinkful).toBe(2);
  });

  it("قطعیتِ جدید→قدیم: دو هفتهٔ واجد → پنجرهٔ تازه‌تر گزارش می‌شود", () => {
    const oldWeek: DuelRecord[] = [
      quickRec({ id: "o1", day: dayAgo(20), opponent: "ح" }, { avgMs: 700, minMs: 100 }),
      quickRec({ id: "o2", day: dayAgo(21), opponent: "د" }, { avgMs: 700, minMs: 100 }),
      quickRec({ id: "o3", day: dayAgo(22), opponent: "و" }, { avgMs: 700, minMs: 100 }),
    ];
    const r = duelQuickWeekReport([...quickWeekSeed(), ...oldWeek]);
    expect(r.qualifying!.endDay).toBe(dayAgo(0));
    expect(r.qualifying!.avgMs).toBe(800);
    // بهترینِ میانگین از هفتهٔ قدیمی‌تر می‌آید (۷۰۰ < ۸۰۰) — پیشرفتِ طلا صادق می‌ماند
    expect(r.bestAvgMs).toBe(700);
  });

  it("بهترینِ میانگینِ نمایشی حتی بدونِ عبورِ نرخ محاسبه می‌شود — پیشرفتِ طلا بی‌دروغ", () => {
    const r = duelQuickWeekReport([
      quickRec({ id: "b1", day: dayAgo(0), opponent: "ح" }, { avgMs: 500, minMs: 100 }),
      quickRec({ id: "b2", day: dayAgo(1), opponent: "د" }, { avgMs: 500, minMs: 100 }),
      quickRec({ id: "b3", day: dayAgo(2), opponent: "و" }, { avgMs: 500, minMs: 100 }),
      rec({ id: "b4", day: dayAgo(3), opponent: "ش", myCorrect: 0, answered: 10, outcome: "loss" }),
    ]);
    expect(r.qualifying).toBeNull(); // نرخ (۱۵÷۴۰=۰٫۳۷۵) فرو می‌ریزد
    expect(r.bestAvgMs).toBe(500);
  });

  it("دفترچهٔ قدیمیِ بی‌think: گزارشِ خالیِ صادق — صفرِ ساختگی نه", () => {
    const r = duelQuickWeekReport(
      Array.from({ length: 12 }, (_, i) => rec({ id: `l${i}`, day: dayAgo(i % 5), opponent: `حریفِ ${i}` }))
    );
    emptyReport(r);
  });

  it("رکوردِ فکرداری که خودش «چابکِ» تک‌رکوردی نیست (seen=۲) در میانگینِ هفته می‌آید — گیتِ مستقل", () => {
    const r = duelQuickWeekReport([
      quickRec({ id: "m1", day: dayAgo(0), opponent: "ح" }, { avgMs: 300, minMs: 100, seen: 2, total: 10 }),
      quickRec({ id: "m2", day: dayAgo(1), opponent: "د" }, { avgMs: 300, minMs: 100, seen: 4, total: 10 }),
      quickRec({ id: "m3", day: dayAgo(2), opponent: "و" }, { avgMs: 300, minMs: 100, seen: 4, total: 10 }),
    ]);
    // رکوردِ seen=۲ برای خانوادهٔ ۱۰۸ هرگز چابک نیست؛ میانگینِ هفته اما نمونه‌هایش را می‌خواند
    expect(r.qualifying).not.toBeNull();
    expect(r.qualifying!.seen).toBe(10);
    expect(r.qualifying!.avgMs).toBe(300);
  });

  it("ورودیِ خراب: غیرآرایه/تهی → گزارشِ خالی؛ رکوردهای ناقص بی‌صدا کنار می‌روند", () => {
    emptyReport(duelQuickWeekReport(undefined));
    emptyReport(duelQuickWeekReport([]));
    emptyReport(duelQuickWeekReport(null as unknown as DuelRecord[]));
    emptyReport(duelQuickWeekReport("خراب" as unknown as DuelRecord[]));
    // رکوردهای خراب: بی‌روز، نتیجهٔ ناشناخته، تهی — همه نادیده
    const messy = duelQuickWeekReport([
      { id: "bad1", outcome: "win" } as unknown as DuelRecord,
      { id: "bad2", day: "نه-تاریخ", outcome: "win" } as unknown as DuelRecord,
      null as unknown as DuelRecord,
      ...quickWeekSeed(),
    ]);
    expect(messy.qualifying).not.toBeNull();
    expect(messy.qualifying!.duels).toBe(3);
  });

  it("خلوص: آرایه و رکوردهای ورودیش دست‌نخورده می‌مانند", () => {
    const seed = quickWeekSeed();
    const snapshot = JSON.stringify(seed);
    duelQuickWeekReport(seed);
    expect(JSON.stringify(seed)).toBe(snapshot);
  });
});

// ---------------- ③ سیم‌کشیِ رجیستری و eval ----------------

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

describe("سیم‌کشیِ خانوادهٔ هفتهٔ چابک — رجیستریِ ۵۷تایی", () => {
  it("دو نشانِ جدید با آیکن/تیر/قراردادِ پیشرفت — رجیستری ۵۲→۵۵", () => {
    expect(BADGES.length).toBe(58);
    const ids = new Set(BADGES.map((b) => b.id));
    expect(ids.has("quick-week")).toBe(true);
    expect(ids.has("lightning-week")).toBe(true);
    const silver = BADGES.find((b) => b.id === "quick-week")!;
    const gold = BADGES.find((b) => b.id === "lightning-week")!;
    expect(silver.tier).toBe("silver");
    expect(silver.icon).toBe("CalendarClock");
    expect(gold.tier).toBe("gold");
    expect(gold.icon).toBe("Gauge");
  });

  it("buildEvalInput از دفترچهٔ واقعی گزارش می‌سازد — هفتهٔ واجد، هر دو نشان", () => {
    const input = base({ duelHistory: quickWeekSeed() });
    expect(input.duelQuickWeek.qualifying).not.toBeNull();
    expect(input.duelQuickWeek.maxThinkful).toBe(3);
    const unlocked = unlockedBadgeIds(input);
    expect(unlocked.has("quick-week")).toBe(true);
    expect(unlocked.has("lightning-week")).toBe(true);
  });

  it("زیرمجموعه در هر دو جهت: میانگینِ ۱٫۲ثانیه → فقط نقره؛ دفترچهٔ خالی → هیچ‌کدام", () => {
    const mid = base({
      duelHistory: [
        quickRec({ id: "z1", day: dayAgo(0), opponent: "ح" }, { avgMs: 1200, minMs: 500 }),
        quickRec({ id: "z2", day: dayAgo(1), opponent: "د" }, { avgMs: 1200, minMs: 500 }),
        quickRec({ id: "z3", day: dayAgo(2), opponent: "و" }, { avgMs: 1200, minMs: 500 }),
      ],
    });
    expect(mid.duelQuickWeek.qualifying).not.toBeNull();
    const midUnlocked = unlockedBadgeIds(mid);
    expect(midUnlocked.has("quick-week")).toBe(true);
    expect(midUnlocked.has("lightning-week")).toBe(false);

    const none = base({ duelHistory: [] });
    expect(none.duelQuickWeek.qualifying).toBeNull();
    expect(none.duelQuickWeek.bestAvgMs).toBeNull();
    expect(none.duelQuickWeek.maxThinkful).toBe(0);
    expect(unlockedBadgeIds(none).has("quick-week")).toBe(false);
    expect(unlockedBadgeIds(none).has("lightning-week")).toBe(false);
  });

  it("پیشرفتِ نقره شمارشیِ سقف‌خورده است؛ پیشرفتِ طلا فقط با هفتهٔ واجد متن می‌گیرد", () => {
    const silver = BADGES.find((b) => b.id === "quick-week")!;
    const gold = BADGES.find((b) => b.id === "lightning-week")!;
    const two = base({
      duelHistory: [
        quickRec({ id: "p1", day: dayAgo(0), opponent: "ح" }),
        quickRec({ id: "p2", day: dayAgo(1), opponent: "د" }),
      ],
    });
    expect(silver.progress!(two)).toBe("۲ از ۳ نبردِ فکردار در یک هفته");
    expect(gold.progress!(two)).toBeUndefined();
    // هفتهٔ واجدِ ۸۰۰ms → بهترینِ میانگین ۰٫۸ — «۰٫۸ از ۱ ثانیه»
    const full = base({ duelHistory: quickWeekSeed() });
    expect(gold.progress!(full)).toBe("۰٫۸ از ۱ ثانیه");
    // سقفِ شمارش: پنج فکردار در یک پنجره باز هم «۳ از ۳» می‌ماند
    const five = base({
      duelHistory: [
        quickRec({ id: "f1", day: dayAgo(0), opponent: "ح" }),
        quickRec({ id: "f2", day: dayAgo(1), opponent: "د" }),
        quickRec({ id: "f3", day: dayAgo(2), opponent: "و" }),
        quickRec({ id: "f4", day: dayAgo(3), opponent: "ش" }),
        quickRec({ id: "f5", day: dayAgo(4), opponent: "ق" }),
      ],
    });
    expect(silver.progress!(five)).toBe("۳ از ۳ نبردِ فکردار در یک هفته");
  });
});
