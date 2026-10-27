// ------------------------------------------------------------------
// r413 — «بانکِ خطایِ ماندگارِ دریلها» — قفلهایِ موتورِ خالصِ drill-mistakes.
//
// قراردادهایِ حکم:
//  · sanitize: بانکِ بیقرارداد/پایهٔ بیقرارداد/رکوردِ wrong=0 میافتد؛
//    clampها؛ سقفِ ۲۴ بانک و ۴۰۰ پایه (نخستینهایِ درج میمانند)؛
//    idempotence (ورودیِ مسموم دوبار sanitize → همان)
//  · merge: بیشترینِ هر شمارنده (ایدئومِ wordMistakes — ردیفها هرگز
//    حذف نمیشوند تا max-merge رستاخیز نزاید)؛ قراردادِ سختِ round-trip:
//    merge(a, cloud(a)) === a
//  · record: هر رخداد یک واحد (بدونِ dedup — سیاستِ شمارش با صداکننده)؛
//    ورودیِ نامعتبر همان مرجعِ نقشه (گاردهایِ صادق)؛ سقفِ نوشتنِ
//    بانکِ بیستوپنجم و پایهٔ چهارصدویکم (شیرِ اطمینان)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  sanitizeDrillMistakes,
  mergeDrillMistakes,
  recordDrillMistakes,
  countDrillMistakes,
  isDrillMistakeBase,
  DRILL_MISTAKE_BASE_MAX,
  DRILL_MISTAKE_BANK_CAP,
  DRILL_MISTAKE_BASE_CAP,
  DRILL_MISTAKE_WRONG_CAP,
  type DrillMistakeMap,
} from "@/lib/drill-mistakes";
import { DRILL_BANK_KEY_RE } from "@/lib/drill-stats";

const entry = (over: { wrong?: number; ok?: number; lastDay?: string; lastOkDay?: string } = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: "2026-10-25",
  lastOkDay: "",
  ...over,
});

describe("drill-mistakes r413 — sanitize", () => {
  it("هر هفت بانکِ فعلی از الگویِ کلید میگذرند (همان قفلِ drillStats)", () => {
    const ids = ["verbs", "words", "abbrev", "phonemes", "bg-examples", "lesson-vocab", "dict-vocab"];
    for (const id of ids) expect(DRILL_BANK_KEY_RE.test(id)).toBe(true);
  });

  it("تهی/غیرآبجکت/آرایه → نقشهٔ تهیِ صادق", () => {
    expect(sanitizeDrillMistakes(undefined)).toEqual({});
    expect(sanitizeDrillMistakes(null)).toEqual({});
    expect(sanitizeDrillMistakes(42)).toEqual({});
    expect(sanitizeDrillMistakes(["verbs"])).toEqual({});
  });

  it("بانکِ بیقرارداد یا بی‌هیچ رکوردِ واقعی میافتد", () => {
    const out = sanitizeDrillMistakes({
      Verbs: { go: entry() }, // حرفِ بزرگ — بیقرارداد
      "bad key": { go: entry() }, // فاصله — بیقرارداد
      empty: {}, // بانکِ تهی — رکورد نیست
      zero: { go: entry({ wrong: 0 }) }, // فقط رکوردِ بیخطا — بانک تهی میماند و میافتد
      verbs: { go: entry() },
    });
    expect(Object.keys(out)).toEqual(["verbs"]);
  });

  it("پایهٔ بیقرارداد (تهی/بیشازحد بلند) میافتد — واک و نشانه میگذرند", () => {
    const out = sanitizeDrillMistakes({
      verbs: { "": entry(), ["x".repeat(DRILL_MISTAKE_BASE_MAX + 1)]: entry(), go: entry() },
      phonemes: { "æ": entry(), "θ": entry() }, // واکهایِ IPA — کلیدِ مشروع
      abbrev: { "e.g.": entry() }, // نقطه و فاصله در کلیدِ پایه مشروعاند
    });
    expect(Object.keys(out.verbs!)).toEqual(["go"]);
    expect(Object.keys(out.phonemes!)).toEqual(["æ", "θ"]);
    expect(Object.keys(out.abbrev!)).toEqual(["e.g."]);
  });

  it("clamp: سقفِ wrong + روزِ بیقرارداد → تهی — رکوردِ wrong=0 میافتد", () => {
    const out = sanitizeDrillMistakes({
      verbs: { go: entry({ wrong: DRILL_MISTAKE_WRONG_CAP + 100, lastDay: "nope" }), come: entry({ wrong: 0 }) },
    });
    expect(out.verbs!.go).toEqual({ wrong: DRILL_MISTAKE_WRONG_CAP, ok: 0, lastDay: "", lastOkDay: "" });
    expect(out.verbs!.come).toBeUndefined();
  });

  it(`سقفِ ${DRILL_MISTAKE_BANK_CAP} بانک و ${DRILL_MISTAKE_BASE_CAP} پایه — نخستینهایِ درج میمانند`, () => {
    const flood: DrillMistakeMap = {};
    for (let i = 0; i < DRILL_MISTAKE_BANK_CAP + 4; i++) {
      const bank: Record<string, ReturnType<typeof entry>> = {};
      for (let j = 0; j < DRILL_MISTAKE_BASE_CAP + 5; j++) {
        bank[`base-${String(j).padStart(4, "0")}`] = entry();
      }
      flood[`bank-${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(97 + Math.floor(i / 26))}`] = bank;
    }
    const out = sanitizeDrillMistakes(flood);
    expect(Object.keys(out)).toHaveLength(DRILL_MISTAKE_BANK_CAP);
    expect(Object.keys(out)[0]).toBe("bank-aa"); // سرِ درج پابرجا
    const firstBank = out["bank-aa"]!;
    expect(Object.keys(firstBank)).toHaveLength(DRILL_MISTAKE_BASE_CAP);
    expect(Object.keys(firstBank)[0]).toBe("base-0000"); // نخستینِ درج
    expect(Object.keys(firstBank).at(-1)).toBe(`base-${String(DRILL_MISTAKE_BASE_CAP - 1).padStart(4, "0")}`);
  });

  it("idempotence: sanitizeِ دوبارِ ورودیِ مسموم همان میدهد", () => {
    const poisoned = {
      verbs: { go: { wrong: -3, lastDay: 7 }, come: { wrong: 2.9, lastDay: "2026-13-99" }, 42: entry() },
      "BAD KEY": { go: entry() },
      junk: 3,
    };
    const once = sanitizeDrillMistakes(poisoned);
    const twice = sanitizeDrillMistakes(once);
    expect(twice).toEqual(once);
  });

  it("کلیدِ پایه: رشتهٔ ۱..۸۰ نویسه — قراردادِ صادقِ isDrillMistakeBase", () => {
    expect(isDrillMistakeBase("go")).toBe(true);
    expect(isDrillMistakeBase("æ")).toBe(true);
    expect(isDrillMistakeBase("")).toBe(false);
    expect(isDrillMistakeBase("x".repeat(81))).toBe(false);
    expect(isDrillMistakeBase(7)).toBe(false); // غیررشته — ورودیِ عدد هرگز کلید نیست
  });
});

describe("drill-mistakes r413 — merge (بیشترینِ هر شمارنده — ردیف هرگز حذف نمیشود)", () => {
  it("unionِ بانکها و پایهها؛ maxِ wrong و maxِ روز", () => {
    const l: DrillMistakeMap = { verbs: { go: entry({ wrong: 3, lastDay: "2026-10-20" }) } };
    const r: DrillMistakeMap = {
      verbs: { go: entry({ wrong: 1, lastDay: "2026-10-24" }), come: entry() },
      phonemes: { "æ": entry() },
    };
    const m = mergeDrillMistakes(l, r);
    // r414 — entry() حالا ok/lastOkDay هم دارد؛ maxِ هر چهار فیلد
    expect(m.verbs!.go).toEqual({ ...entry(), wrong: 3, lastDay: "2026-10-24" }); // بیشترینِ هر دو
    expect(m.verbs!.come).toEqual(entry()); // پایهٔ تازهٔ ریموت میآید
    expect(m.phonemes!["æ"]).toEqual(entry());
  });

  it("قراردادِ سختِ R-1: merge(a, cloud(a)) === a — جمع رانش میساخت", () => {
    const a: DrillMistakeMap = {
      verbs: { go: entry({ wrong: 3, lastDay: "2026-10-20" }), come: entry({ wrong: 1, lastDay: "2026-10-01" }) },
      "lesson-vocab": { ability: entry({ wrong: 2, lastDay: "2026-10-09" }) },
    };
    const cloud = JSON.parse(JSON.stringify(a));
    expect(mergeDrillMistakes(a, cloud)).toEqual(a);
  });

  it("هر دو سمت تهی/غایب — ادغامِ صادقِ تهی", () => {
    expect(mergeDrillMistakes(undefined, undefined)).toEqual({});
    expect(mergeDrillMistakes({}, { verbs: { go: entry() } }).verbs).toBeDefined();
  });
});

describe("drill-mistakes r413 — record (مسیرِ نوشتنِ محلی)", () => {
  it("نخستین رخداد: wrong=1 + روز — و رخدادِ دومِ همان پایه جمع میشود", () => {
    let m: DrillMistakeMap = {};
    m = recordDrillMistakes(m, "verbs", ["go"], "2026-10-25");
    expect(m.verbs!.go).toEqual({ wrong: 1, ok: 0, lastDay: "2026-10-25", lastOkDay: "" });
    m = recordDrillMistakes(m, "verbs", ["go"], "2026-10-26");
    expect(m.verbs!.go).toEqual({ wrong: 2, ok: 0, lastDay: "2026-10-26", lastOkDay: "" });
  });

  it("هر رخداد یک واحد — بدونِ dedup (دو پرسشِ نادرست رویِ یک پایه = ۲+)", () => {
    const m = recordDrillMistakes({}, "verbs", ["go", "go", "come"], "2026-10-25");
    expect(m.verbs!.go).toEqual({ wrong: 2, ok: 0, lastDay: "2026-10-25", lastOkDay: "" });
    expect(m.verbs!.come).toEqual({ wrong: 1, ok: 0, lastDay: "2026-10-25", lastOkDay: "" });
  });

  it("روزِ کهنه‌تر، wrong را جمع میکند ولی lastDay را عقب نمیبَرد", () => {
    const base: DrillMistakeMap = { verbs: { go: entry({ wrong: 5, lastDay: "2026-10-25" }) } };
    const out = recordDrillMistakes(base, "verbs", ["go"], "2026-10-01");
    expect(out.verbs!.go).toEqual({ wrong: 6, ok: 0, lastDay: "2026-10-25", lastOkDay: "" });
  });

  it("گاردهایِ صادق: ورودیِ نامعتبر همان مرجعِ نقشه — بی نوشتن", () => {
    const base: DrillMistakeMap = { verbs: { go: entry() } };
    const same = (m: DrillMistakeMap) => expect(m).toBe(base);
    same(recordDrillMistakes(base, "Verbs", ["go"], "2026-10-25")); // بانکِ بیقرارداد
    same(recordDrillMistakes(base, "verbs", ["go"], "2026-10-2")); // روزِ بیقرارداد
    same(recordDrillMistakes(base, "verbs", ["go"], "")); // روزِ تهی
    same(recordDrillMistakes(base, "verbs", [], "2026-10-25")); // بی رخداد
    same(recordDrillMistakes(base, "verbs", ["", "x".repeat(81)], "2026-10-25")); // همه نامعتبر
  });

  it("پایههایِ نامعتبر در میانِ معتبرها میافتند — معتبرها ثبت میشوند", () => {
    const m = recordDrillMistakes({}, "verbs", ["", "go", "x".repeat(81)], "2026-10-25");
    expect(Object.keys(m.verbs!)).toEqual(["go"]);
  });

  it(`شیرِ اطمینان: بانکِ ${DRILL_MISTAKE_BANK_CAP}+۱ام و پایهٔ ${DRILL_MISTAKE_BASE_CAP}+۱ام پذیرفته نمیشود`, () => {
    let m: DrillMistakeMap = {};
    for (let i = 0; i < DRILL_MISTAKE_BANK_CAP; i++) {
      m = recordDrillMistakes(m, `bank-${String.fromCharCode(97 + i)}`, ["go"], "2026-10-25");
    }
    const full = recordDrillMistakes(m, "bank-z", ["go"], "2026-10-25");
    expect(full).toBe(m); // بانکِ بیستوپنجم — همان مرجع
    let bank: DrillMistakeMap = { verbs: {} };
    for (let j = 0; j < DRILL_MISTAKE_BASE_CAP; j++) {
      bank = recordDrillMistakes(bank, "verbs", [`base-${String(j).padStart(4, "0")}`], "2026-10-25");
    }
    const capped = recordDrillMistakes(bank, "verbs", ["overflow-base"], "2026-10-25");
    expect(capped).toBe(bank); // پایهٔ ۴۰۱ام — همان مرجع
    // ولی پایههایِ موجودِ بانکِ پر هنوز جمع میشوند (سقف فقط پذیرشِ تازهست)
    const grown = recordDrillMistakes(bank, "verbs", ["base-0000"], "2026-10-26");
    expect(grown.verbs!["base-0000"]).toEqual({ wrong: 2, ok: 0, lastDay: "2026-10-26", lastOkDay: "" });
  });
});

describe("drill-mistakes r413 — countDrillMistakes (خوانشِ صادق)", () => {
  it("شمارشِ پایههایِ خطادار؛ بانکِ غایب = صفرِ صادق", () => {
    const m: DrillMistakeMap = { verbs: { go: entry(), come: entry() } };
    expect(countDrillMistakes(m, "verbs")).toBe(2);
    expect(countDrillMistakes(m, "words")).toBe(0);
    expect(countDrillMistakes({}, "verbs")).toBe(0);
  });
});
