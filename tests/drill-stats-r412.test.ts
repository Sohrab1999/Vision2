// ------------------------------------------------------------------
// r412 — «دریلها واردِ استور میشوند» — قفلهایِ موتورِ خالصِ drill-stats.
//
// قراردادهایِ حکم:
//  · sanitize: کلیدِ بیقرارداد/رکوردِ بیجلسه/ناسازگار میافتد؛ clampها؛
//    idempotence (ورودیِ مسموم دوبار sanitize → همان)
//  · merge: سیاستِ «بیشترینِ» هر شمارنده — قراردادِ سختِ round-trip:
//    merge(a, cloud(a)) === a (جمع رانش میسازد؛ درسِ persist-schema)
//  · record: جلسهٔ کامل جمع میکند (مسیرِ نوشتنِ محلی)؛ ورودیِ نامعتبر
//    نقشه را همان‌طورِ همان‌مرجع برمیگرداند (گاردهایِ صادق)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  sanitizeDrillStats,
  mergeDrillStats,
  recordDrillResult,
  DRILL_BANK_KEY_RE,
  DRILL_STAT_CAP,
  type DrillStatMap,
} from "@/lib/drill-stats";
import { percent } from "@/lib/domain/percent";

const stat = (over: Partial<DrillStatMap[string]> = {}) => ({
  sessions: 3,
  correct: 24,
  total: 30,
  bestPercent: 80,
  lastDay: "2026-10-25",
  ...over,
});

describe("drill-stats r412 — sanitize", () => {
  it("هر هفت بانکِ فعلی از الگویِ کلید میگذرند", () => {
    const ids = ["verbs", "words", "abbrev", "phonemes", "bg-examples", "lesson-vocab", "dict-vocab"];
    for (const id of ids) expect(DRILL_BANK_KEY_RE.test(id)).toBe(true);
  });

  it("تهی/غیرآبجکت/آرایه → نقشهٔ تهیِ صادق", () => {
    expect(sanitizeDrillStats(undefined)).toEqual({});
    expect(sanitizeDrillStats(null)).toEqual({});
    expect(sanitizeDrillStats(42)).toEqual({});
    expect(sanitizeDrillStats(["verbs"])).toEqual({});
  });

  it("کلیدِ بیقرارداد (بزرگ/فاصله/بیشازحد بلند) میافتد", () => {
    const junk = sanitizeDrillStats({
      Verbs: stat(),
      "bad key": stat(),
      ["a".repeat(25)]: stat(),
      phonemes: stat(),
    });
    expect(Object.keys(junk)).toEqual(["phonemes"]);
  });

  it("رکوردِ بیجلسه/بیسؤال/ناسازگار (درستِ بیشتر از کل) میافتد", () => {
    const out = sanitizeDrillStats({
      verbs: stat({ sessions: 0 }),
      words: stat({ total: 0 }),
      abbrev: stat({ correct: 31 }),
      phonemes: stat(),
    });
    expect(Object.keys(out)).toEqual(["phonemes"]);
  });

  it("clamp: سقفِ شمارندهها + بهترینِ درصدِ ۱۰۰ + روزِ بیقرارداد → تهی", () => {
    const out = sanitizeDrillStats({ verbs: stat({ sessions: 999_999, bestPercent: 150, lastDay: "nope" }) });
    expect(out.verbs).toEqual({ sessions: 99_999, correct: 24, total: 30, bestPercent: 100, lastDay: "" });
  });

  it(`سقفِ ${DRILL_STAT_CAP} بانک — نخستینهایِ درج میمانند (ترتیبِ درج معنا دارد، نه «تازگی»)`, () => {
    const flood: DrillStatMap = {};
    // کلیدهایِ همقرارداد (فقط حروفِ کوچک/خطِ تیره) — ۳۰ بانکِ یکتا
    for (let i = 0; i < DRILL_STAT_CAP + 6; i++) {
      flood[`bank-${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(97 + Math.floor(i / 26))}`] = stat();
    }
    const out = sanitizeDrillStats(flood);
    expect(Object.keys(out)).toHaveLength(DRILL_STAT_CAP);
    expect(Object.keys(out)[0]).toBe("bank-aa"); // سرِ درج پابرجا
    expect(Object.keys(out).at(-1)).toBe("bank-xa"); // شش تهی افتادند (i=24..29)
  });

  it("idempotence: sanitizeِ دوبارِ ورودیِ مسموم همان میدهد", () => {
    const poisoned = {
      verbs: { sessions: -3, total: 0, correct: 9, bestPercent: 1e9, lastDay: 7 },
      words: stat({ correct: 24.7, total: "x" as unknown as number }),
      "BAD KEY": stat(),
      junk: 3,
    };
    const once = sanitizeDrillStats(poisoned);
    const twice = sanitizeDrillStats(once);
    expect(twice).toEqual(once);
  });
});

describe("drill-stats r412 — merge (سیاستِ بیشترین — نه جمع)", () => {
  it("کلیدِ تازهٔ ریموت میآید؛ کلیدِ مشترک بیشترینِ هر شمارنده را میگیرد", () => {
    const l: DrillStatMap = { verbs: stat({ sessions: 5, correct: 40, total: 50, bestPercent: 70, lastDay: "2026-10-20" }) };
    const r: DrillStatMap = {
      verbs: stat({ sessions: 2, correct: 16, total: 20, bestPercent: 90, lastDay: "2026-10-24" }),
      words: stat(),
    };
    const m = mergeDrillStats(l, r);
    expect(m.verbs).toEqual({ sessions: 5, correct: 40, total: 50, bestPercent: 90, lastDay: "2026-10-24" });
    expect(m.words).toEqual(stat());
  });

  it("درستِ ادغامشده هرگز از کل میگذرد (هر دو سمت c ≤ t دارند)", () => {
    const l: DrillStatMap = { verbs: stat({ correct: 9, total: 10 }) };
    const r: DrillStatMap = { verbs: stat({ correct: 30, total: 50 }) };
    const m = mergeDrillStats(l, r);
    expect(m.verbs!.correct).toBeLessThanOrEqual(m.verbs!.total);
  });

  it("قراردادِ سختِ R-1: merge(a, cloud(a)) === a — جمع رانش میساخت", () => {
    const a: DrillStatMap = {
      verbs: stat(),
      "lesson-vocab": stat({ sessions: 1, correct: 7, total: 10, bestPercent: 70, lastDay: "2026-10-01" }),
    };
    const cloud = JSON.parse(JSON.stringify(a));
    expect(mergeDrillStats(a, cloud)).toEqual(a);
  });
});

describe("drill-stats r412 — record (مسیرِ نوشتنِ محلی)", () => {
  it("یک جلسهٔ کامل: جمعِ شمارندهها + بهترینِ درصد با percentِ مالک", () => {
    const base: DrillStatMap = { verbs: stat() };
    const out = recordDrillResult(base, "verbs", 9, 10, "2026-10-26");
    expect(out.verbs).toEqual({
      sessions: 4,
      correct: 33,
      total: 40,
      bestPercent: 90,
      lastDay: "2026-10-26",
    });
    expect(out.verbs!.bestPercent).toBe(percent(9, 10));
  });

  it("جلسهٔ ضعیفِ بعدی bestPercent را نمیبُرد ولی شمارندهها جمع میشوند", () => {
    let m: DrillStatMap = { verbs: stat({ sessions: 1, correct: 10, total: 10, bestPercent: 100, lastDay: "2026-10-25" }) };
    m = recordDrillResult(m, "verbs", 3, 10, "2026-10-26");
    expect(m.verbs!.sessions).toBe(2);
    expect(m.verbs!.bestPercent).toBe(100);
    expect(m.verbs!.lastDay).toBe("2026-10-26");
  });

  it("بانکِ تازه از صفر میروید (کلیدِ غایب)", () => {
    const out = recordDrillResult({}, "phonemes", 0, 10, "2026-10-25");
    expect(out.phonemes).toEqual({ sessions: 1, correct: 0, total: 10, bestPercent: 0, lastDay: "2026-10-25" });
  });

  it("گاردهایِ صادق: ورودیِ نامعتبر همان مرجعِ نقشه — بی نوشتن", () => {
    const base: DrillStatMap = { verbs: stat() };
    const same = (m: DrillStatMap) => expect(m).toBe(base);
    same(recordDrillResult(base, "Verbs", 9, 10, "2026-10-26")); // کلیدِ بیقرارداد
    same(recordDrillResult(base, "verbs", 9, 0, "2026-10-26")); // کلِ صفر
    same(recordDrillResult(base, "verbs", 9, 10.5, "2026-10-26")); // کلِ کسری
    same(recordDrillResult(base, "verbs", 9, 1000, "2026-10-26")); // کلِ بیرونِ سقف
    same(recordDrillResult(base, "verbs", -1, 10, "2026-10-26")); // درستِ منفی
    same(recordDrillResult(base, "verbs", 11, 10, "2026-10-26")); // درستِ بیشتر از کل
    same(recordDrillResult(base, "verbs", 9, 10, "2026-10-2")); // روزِ بیقرارداد
    same(recordDrillResult(base, "verbs", 9, 10, "")); // روزِ تهی
  });
});
