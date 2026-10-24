// ------------------------------------------------------------------
// r386 — «ستونِ فقراتِ ترتیبِ دفترچه» — قراردادِ id نامدار میشود
//
// سه حکمی که این فایل قفل میکند:
//   ① قراردادِ id (`d` + ارقامِ ۱..۱۴ — epoch ms ۱۹۷۰..۲۲۸۶) از تولدِ
//      Task 65 تنها یک سازنده دارد (buildDuelRecord)؛ تا دیروز گیتِ
//      sanitize هر رشتهٔ ۱..۴۰نویسه‌ای را زنده نگه میداشت — «zzz» در
//      مقایسهٔ رشتهای بالاتر از هر «d...» میچید: در duel-setup تازهترین
//      «نبرد» میشد و در merge با سقفِ ۱۵ جایِ نوترینِ واقعی را میگرفت
//      (اخراجِ داده). حالا idِ بیقرارداد = رکوردِ خراب = کلاً میافتد.
//   ② مرز، تمامیتِ دفترچه را هم ترمیم میکند: sanitizeDuelHistory دیگر
//      ترتیبِ ورودیِ نامطمئن را عیناً حفظ نمیکند — خروجی newest-first
//      است و سقفِ ۱۵ «۱۵تایِ نوترین» میمانند نه «۱۵تایِ اولی». آینهٔ
//      mergeDuelHistory؛ برایِ دادهٔ سالم idempotent.
//   ③ همهٔ مقایسههایِ ترتیب روی epochِ عددی میچرخند (byIdDesc مشترِک) —
//      مقایسهٔ رشتهای روی طولِ متفاوت دروغ میگفت («d9» > «d1739...»).
//      epochِ null (فقط از ورودیِ پالایشنشده) تهِ صف میماند و هرگز
//      نمیتواند «تازهترین» را بدزدد.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  sanitizeDuelRecord,
  sanitizeDuelHistory,
  mergeDuelHistory,
  sortDuelLedger,
  duelIdEpoch,
  duelWinStreak,
  DUEL_HISTORY_CAP,
  type DuelRecord,
} from "@/lib/duel-history";
import { sanitizeAll } from "@/lib/persist/schema";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const readAbs = (p: string) => readFileSync(p, "utf8");

// سازندهٔ آزمون — epochهایِ واقع‌نمای ۱۳رقمی (عصرِ ۲۰۲۶)
const E0 = 1_739_000_000_000;
const rec = (over: Partial<DuelRecord> & { id: string }): DuelRecord => ({
  day: "2026-10-25",
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
const at = (n: number) => `d${E0 + n}`;

// ---------------- ① گیتِ قراردادِ id ----------------

describe("گیتِ id در sanitizeDuelRecord — قراردادِ نامدار", () => {
  it("idِ بیرونِ قرارداد → رکورد کلاً میافتد (نه نصفه)", () => {
    const junkIds = [
      "zzz", // پیشوندِ غریبه — رشتهای بالاتر از هر d میچید (شاهدِ اصلیِ r386)
      "abc",
      "1234", // بی d
      "d", // بی رقم
      "d12a3", // مخلوطِ رقم/حرف
      "d-123",
      " d123", // فاصله
      "d۱۲۳", // ارقامِ فارسی — قرارداد ASCII است
      `d${"9".repeat(15)}`, // ۱۵ رقم — بیرونِ بازهٔ ۱..۱۴
      "d" + "x".repeat(39),
      "",
    ];
    for (const id of junkIds) {
      expect(sanitizeDuelRecord(rec({ id })), `id=${JSON.stringify(id)}`).toBeNull();
    }
  });

  it("idِ درقرارداد زنده میماند — مرزهایِ ۱ و ۱۳ و ۱۴ رقم", () => {
    expect(sanitizeDuelRecord(rec({ id: "d1" }))!.id).toBe("d1");
    expect(sanitizeDuelRecord(rec({ id: at(0) }))!.id).toBe(at(0));
    expect(sanitizeDuelRecord(rec({ id: `d${"9".repeat(14)}` }))!.id).toBe(`d${"9".repeat(14)}`);
    // ۱۵ رقم میافتد (مرزِ بالای ۲۲۸۶) — ولی ۱۴ رقمِ تمیز زنده است
    expect(sanitizeDuelRecord(rec({ id: `d${"9".repeat(15)}` }))).toBeNull();
  });

  it("duelIdEpoch — تنها خوانندهٔ مجازِ ساختارِ id", () => {
    expect(duelIdEpoch(at(7))).toBe(E0 + 7);
    expect(duelIdEpoch("d1")).toBe(1);
    expect(duelIdEpoch("d0100")).toBe(100); // صفرِ پیشرو — درقرارداد
    expect(duelIdEpoch("zzz")).toBeNull();
    expect(duelIdEpoch("d12a3")).toBeNull();
  });
});

// ---------------- ② تمامیتِ دفترچه در مرز ----------------

describe("sanitizeDuelHistory — مرز، ترتیب را هم ترمیم میکند", () => {
  it("ورودیِ درهم‌ترتیب → خروجی newest-first با epoch (نه ترتیبِ رشته)", () => {
    const scrambled = [rec({ id: at(300), outcome: "loss" }), rec({ id: at(100) }), rec({ id: at(200) })];
    const out = sanitizeDuelHistory(scrambled);
    expect(out.map((r) => r.id)).toEqual([at(300), at(200), at(100)]);
  });

  it("دروغِ طولِ متفاوت مرده: d9 کوتاه دیگر تازهترین نمیشود", () => {
    // مقایسهٔ رشته‌ایِ قدیم: «d9» > «d1739...» — تازهترینِ دفترچه میشد!
    const out = sanitizeDuelHistory([rec({ id: "d9", outcome: "tie" }), rec({ id: at(0) })]);
    expect(out.map((r) => r.id)).toEqual([at(0), "d9"]);
  });

  it(`سقفِ ۱۵ = ۱۵تایِ نوترین (نه ۱۵تایِ اولِ ورودیِ درهم)`, () => {
    const eighteen = Array.from({ length: DUEL_HISTORY_CAP + 3 }, (_, i) =>
      rec({ id: at(i), outcome: i >= 15 ? "win" : "loss" }) // سه‌تایِ نوترین بردند
    );
    const scrambled = [...eighteen].reverse(); // قدیمی‌ترین اول — بدترینِ حالت
    const out = sanitizeDuelHistory(scrambled);
    expect(out).toHaveLength(DUEL_HISTORY_CAP);
    expect(out[0].id).toBe(at(DUEL_HISTORY_CAP + 2)); // نوترین زنده است
    expect(out.at(-1)!.id).toBe(at(3)); // سه‌تایِ قدیمی افتادند
    // زنجیرهٔ برد از «تازهترینِ واقعی» پیموده میشود نه سرِ آرایهٔ خراب:
    // سه بردِ نوترینِ کنارِ هم — ورودیِ بدونِ ترمیم، سرِ صف باختِ قدیمی داشت
    expect(duelWinStreak(out)).toBe(3);
  });

  it("تکراریِ id: اولین برندهٔ محتواست — ولی بلیتِ ماندن نیست", () => {
    const first = rec({ id: at(1), receiptSig: "a".repeat(64) });
    const dup = rec({ id: at(1), myScore: 7 }); // بی رسید — اما تکراری
    const out = sanitizeDuelHistory([first, dup]);
    expect(out).toHaveLength(1);
    expect(out[0].receiptSig).toBe("a".repeat(64)); // اولینِ محتوادار
    expect(out[0].myScore).not.toBe(7);
  });

  it("idempotence — پالایشِ دوباره، هیچ چیز را نمی‌شکند", () => {
    const messy = [
      rec({ id: at(5) }),
      { id: "zzz", day: "2026-10-25", outcome: "win" }, // بیقرارداد — میافتد
      rec({ id: at(9), outcome: "loss" }),
      rec({ id: at(2) }),
    ];
    const once = sanitizeDuelHistory(messy);
    const twice = sanitizeDuelHistory(once);
    expect(twice.map((r) => r.id)).toEqual(once.map((r) => r.id));
  });

  it("زنجیرهٔ برد از سرِ حقیقت پیموده میشود — نه سرِ آرایهٔ خراب", () => {
    // آرایهٔ دستکاری‌شده: باختِ قدیمی سرِ صف است — رفتارِ قدیم streak=۰ میخواند
    const newest = rec({ id: at(50), outcome: "win" });
    const older = rec({ id: at(10), outcome: "loss" });
    expect(duelWinStreak([older, newest])).toBe(0); // ورودیِ خام — قراردادِ پیمایشِ سرِ صف
    expect(duelWinStreak(sanitizeDuelHistory([older, newest]))).toBe(1); // مرز ترمیم میکند
  });
});

// ---------------- ③ مقایسهگرِ مشترِک و خنثیسازیِ ربایش ----------------

describe("byIdDesc مشترِک — merge و sort دیگر رشتهمحور نیستند", () => {
  it("merge: epochِ null تهِ صف میماند — ربایشِ نوترین ناممکن است", () => {
    // حتی اگر merge بی Sanitize تغذیه شود (قرارداد: ورودی پالایششده)،
    // «zzz» دیگر تازهترین نمیشود و با سقف، رکوردِ واقعی را اخراج نمیکند
    const merged = mergeDuelHistory([rec({ id: "zzz", outcome: "tie" })], [
      rec({ id: at(0) }),
    ]);
    expect(merged[0].id).toBe(at(0));
    const flooded = mergeDuelHistory(
      Array.from({ length: DUEL_HISTORY_CAP }, (_, i) => rec({ id: `z${i}` })),
      [rec({ id: at(0) })]
    );
    expect(flooded[0].id).toBe(at(0)); // تنها رکوردِ واقعی، قربانیِ سقف نمیشود
  });

  it("sortDuelLedger(newest): epoch-محور — تساویِ epoch با idِ رشتهای میشکند", () => {
    const sameEpoch = [rec({ id: "d100", outcome: "win" }), rec({ id: "d0100", outcome: "loss" })];
    expect(sortDuelLedger(sameEpoch).map((r) => r.id)).toEqual(["d100", "d0100"]);
  });

  it("sortDuelLedger(myScore): تساویِ امتیاز با تازهترینِ epoch میشکند", () => {
    const ledger = [
      rec({ id: "d9", myScore: 800 }), // epoch ۹ — رشته‌ایِ قدیم بالای d1739 میچید
      rec({ id: at(0), myScore: 800 }),
      rec({ id: at(5), myScore: 500 }),
    ];
    expect(sortDuelLedger(ledger, "myScore").map((r) => r.id)).toEqual([at(0), "d9", at(5)]);
  });
});

// ---------------- ④ سیمکشیِ مرزِ واقعیِ استور ----------------

describe("sanitizeAll — مسیرِ واقعیِ hydration", () => {
  it("دفترچهٔ دستکاری‌شده در ورود به استور ترمیم میشود", () => {
    const real = rec({ id: at(0) });
    const hijacker = rec({ id: "zzz", outcome: "tie", opponent: "رباینده" });
    const out = sanitizeAll({ duelHistory: [hijacker, real] });
    const ledger = (out as { duelHistory: DuelRecord[] }).duelHistory;
    expect(ledger).toHaveLength(1);
    expect(ledger[0].id).toBe(at(0));
    expect(ledger[0].opponent).toBe("سینا");
  });
});

// ---------------- ⑤ قفلهایِ منبع ----------------

describe("قفلهایِ منبع r386", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      const s = statSync(p);
      return s.isDirectory()
        ? walk(p)
        : /\.(ts|tsx)$/.test(f)
          ? [p]
          : [];
    });

  it("تنها سازندهٔ id: buildDuelRecord — هیچ `id: \\`d\\` دیگری در src زنده نیست", () => {
    const hits = walk(join(process.cwd(), "src")).filter((f) =>
      /id:\s*`d\$\{/.test(readAbs(f))
    );
    expect(hits).toEqual([join(process.cwd(), "src/lib/duel-history.ts")]);
  });

  it("ID_RE و duelIdEpoch فقط در مالکِ دامنه تعریف میشوند", () => {
    const hits = walk(join(process.cwd(), "src")).filter((f) =>
      /ID_RE\s*=\s*\/\^d|function duelIdEpoch/.test(readAbs(f))
    );
    expect(hits).toEqual([join(process.cwd(), "src/lib/duel-history.ts")]);
  });

  it("مقایسهگرِ رشتهمحورِ قدیم در هیچ‌جا زنده نیست — byIdDesc یکتاست", () => {
    const dh = read("src/lib/duel-history.ts");
    expect(dh.match(/const byIdDesc/g)?.length).toBe(1);
    const hits = walk(join(process.cwd(), "src")).filter((f) =>
      /\.sort\(\(\s*a,\s*b\s*\)\s*=>\s*\(a\.id\s*<\s*b\.id/.test(readAbs(f))
    );
    expect(hits).toEqual([]);
  });

  it("خوانندههایِ آرایه دستنخوردهاند — ترمیم در مرز، نه در نما", () => {
    // home: «آخرین» = [0] — پس از r386 مرز، این قرارداد همیشه درست است
    const home = read("src/components/study/home/home-duel-resume.tsx");
    expect(home).toContain("duelHistory[0]");
    // duel-setup: شاخهٔ پیشفرض همان آرایهٔ خام میماند (کاویدن جدا مرتب میکند)
    const setup = read("src/components/study/duel/duel-setup.tsx");
    expect(setup).toContain("duelHistory.slice(0, 5)");
    // مرزِ استور همان sanitizeDuelHistory است
    const schema = read("src/lib/persist/schema.ts");
    expect(schema).toContain("duelHistory: { sanitize: sanitizeDuelHistory, merge: mergeDuelHistory }");
  });
});
