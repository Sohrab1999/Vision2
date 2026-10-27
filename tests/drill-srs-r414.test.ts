// ------------------------------------------------------------------
// r414 — «SRSِ دریل» — قفلهایِ نیمهٔ دومِ حلقه (ok/سررسید) رویِ موتورِ
// بانکِ خطا (drill-mistakes).
//
// قراردادهایِ حکم:
//  · recordDrillCorrects: فقط ردیفِ موجود ok میگیرد — بانکِ خطا از
//    پاسخِ درست ردیف نمیسازد (پایهٔ بیخطا ریسک نمیآفریند)؛ گاردهایِ
//    صادق (بانک/روز/تهیِ پسِ پالایش → همان مرجع)؛ سقفِ ok = سقفِ wrong
//  · تسلط = ok ≥ wrong؛ سررسید = بیِتسلط و lastDay < امروز — ردیفِ
//    همینِ امروزِ اشتباهشده امروز دوباره پرسیده نمیشود
//  · drillDueBases: اولویتِ صادق — بیشترینِ خطا نخست، هموزنها از
//    کهنهترین اشتباه؛ مسلطدهندهها هرگز در فهرست نیستند
//  · سازگاریِ پسرو: بارِ r413 (بی ok/lastOkDay) → ok=0/تهی — سررسیدِ
//    صادقِ همان دات؛ mergeِ بیشترین رویِ هر چهار شمارنده/روز
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  sanitizeDrillMistakes,
  mergeDrillMistakes,
  recordDrillCorrects,
  drillDueBases,
  countDrillDue,
  isDrillMistakeMastered,
  isDrillMistakeDue,
  type DrillMistakeMap,
  type DrillMistakeEntry,
} from "@/lib/drill-mistakes";

const entry = (over: Partial<DrillMistakeEntry> = {}): DrillMistakeEntry => ({
  wrong: 2,
  ok: 0,
  lastDay: "2026-10-25",
  lastOkDay: "",
  ...over,
});

const TODAY = "2026-10-26";

describe("drill-srs r414 — recordDrillCorrects (نیمهٔ دیگرِ حلقه)", () => {
  it("پاسخِ درستِ پایهٔ خطادار ok را بالا میبرد و lastOkDay را مینشاند", () => {
    const base: DrillMistakeMap = { verbs: { go: entry() } };
    const out = recordDrillCorrects(base, "verbs", ["go"], TODAY);
    expect(out.verbs!.go).toEqual({ wrong: 2, ok: 1, lastDay: "2026-10-25", lastOkDay: TODAY });
    expect(out.verbs!.go.lastDay).toBe("2026-10-25"); // روزِ خطا دستنخورده
  });

  it("پاسخِ درستِ پایهٔ بیخطا ردیف نمیسازد — بانکِ خطا فقط بانکِ خطاست", () => {
    const out = recordDrillCorrects({}, "verbs", ["go", "come"], TODAY);
    expect(out).toEqual({}); // هیچ ردیفِ تازهای
    const withOther: DrillMistakeMap = { phonemes: { "æ": entry() } };
    const out2 = recordDrillCorrects(withOther, "verbs", ["go"], TODAY);
    expect(out2).toBe(withOther); // بانکِ غایب — همان مرجع
  });

  it("تسلط: با wrong=1 و ok=1 ردیف مسلط میشود — از سررسید بیرون میماند ولی در بانک است", () => {
    let m: DrillMistakeMap = { verbs: { go: entry({ wrong: 1, lastDay: "2026-10-20" }) } };
    m = recordDrillCorrects(m, "verbs", ["go"], TODAY);
    expect(isDrillMistakeMastered(m.verbs!.go)).toBe(true);
    expect(countDrillDue(m.verbs, TODAY)).toBe(0);
    expect(m.verbs!.go.wrong).toBe(1); // ردیف حذف نشده — حکمِ max-merge
  });

  it("اشتباهِ دوباره، تسلطِ کسبشده را میشکند — wrong جلو میزند، ردیف دوباره سررسید میشود", () => {
    let m: DrillMistakeMap = { verbs: { go: entry({ wrong: 1, ok: 1, lastDay: "2026-10-20", lastOkDay: "2026-10-21" }) } };
    expect(isDrillMistakeMastered(m.verbs!.go)).toBe(true);
    // اشتباهِ تازه (r413 recordDrillMistakes — spread، ok دستنخورده)
    m = { verbs: { go: { ...m.verbs!.go, wrong: 2, lastDay: "2026-10-25" } } };
    expect(isDrillMistakeMastered(m.verbs!.go)).toBe(false);
    expect(isDrillMistakeDue(m.verbs!.go, TODAY)).toBe(true);
  });

  it("گاردهایِ صادق: ورودیِ نامعتبر همان مرجع — بی نوشتن", () => {
    const base: DrillMistakeMap = { verbs: { go: entry() } };
    const same = (m: DrillMistakeMap) => expect(m).toBe(base);
    same(recordDrillCorrects(base, "Verbs", ["go"], TODAY)); // بانکِ بیقرارداد
    same(recordDrillCorrects(base, "verbs", ["go"], "nope")); // روزِ بیقرارداد
    same(recordDrillCorrects(base, "verbs", [], TODAY)); // بی رخداد
    same(recordDrillCorrects(base, "verbs", ["", "x".repeat(81)], TODAY)); // همه نامعتبر
    same(recordDrillCorrects(base, "verbs", ["never-mistaken"], TODAY)); // پایهٔ بیخطا
  });

  it("سقفِ ok: در سقف، ok رشد نمیکند و اگر lastOkDay هم تازه نباشد، همان مرجع", () => {
    const base: DrillMistakeMap = { verbs: { go: entry({ ok: 9999, lastOkDay: TODAY }) } };
    expect(recordDrillCorrects(base, "verbs", ["go"], TODAY)).toBe(base); // سقفِ نشسته + همان روز
    const moved = recordDrillCorrects(base, "verbs", ["go"], "2026-10-27");
    expect(moved.verbs!.go.ok).toBe(9999); // سقف
    expect(moved.verbs!.go.lastOkDay).toBe("2026-10-27"); // ولی روزِ تازه مینشیند
  });
});

describe("drill-srs r414 — سیاستِ سررسید", () => {
  it("سررسید = بیِتسلط و اشتباهش پیش از امروز؛ ردیفِ امروزِ اشتباهشده سررسید نیست", () => {
    expect(isDrillMistakeDue(entry({ wrong: 1, lastDay: "2026-10-25" }), TODAY)).toBe(true);
    expect(isDrillMistakeDue(entry({ wrong: 1, lastDay: TODAY }), TODAY)).toBe(false); // امروز — تازه
    expect(isDrillMistakeDue(entry({ wrong: 1, ok: 1, lastDay: "2026-10-20" }), TODAY)).toBe(false); // مسلط
    expect(isDrillMistakeDue(entry({ wrong: 3, ok: 1, lastDay: "2026-10-20" }), TODAY)).toBe(true); // بیِتسلط
  });

  it("اولویتِ صادق: بیشترینِ خطا نخست؛ هموزنها از کهنهترین اشتباه", () => {
    const bank = {
      a: entry({ wrong: 1, lastDay: "2026-10-24" }),
      b: entry({ wrong: 3, lastDay: "2026-10-25" }),
      c: entry({ wrong: 1, lastDay: "2026-10-20" }),
      mastered: entry({ wrong: 1, ok: 1, lastDay: "2026-10-20" }),
      fresh: entry({ wrong: 5, lastDay: TODAY }), // امروز — سررسید نیست
    };
    expect(drillDueBases(bank, TODAY)).toEqual(["b", "c", "a"]);
    expect(countDrillDue(bank, TODAY)).toBe(3);
  });

  it("بانکِ غایب/تهی = صفرِ صادق و فهرستِ تهی", () => {
    expect(drillDueBases(undefined, TODAY)).toEqual([]);
    expect(countDrillDue({}, TODAY)).toBe(0);
  });
});

describe("drill-srs r414 — سازگاریِ پسرو و ادغام", () => {
  it("بارِ r413 (بی ok/lastOkDay) → ok=0/تهی — سررسیدِ صادق، بی خطا", () => {
    const out = sanitizeDrillMistakes({ verbs: { go: { wrong: 2, lastDay: "2026-10-25" } } });
    expect(out.verbs!.go).toEqual({ wrong: 2, ok: 0, lastDay: "2026-10-25", lastOkDay: "" });
    expect(isDrillMistakeDue(out.verbs!.go, TODAY)).toBe(true);
  });

  it("ادغامِ بیشترین رویِ ok/lastOkDay — round-tripِ R-1 پابرجا", () => {
    const l: DrillMistakeMap = { verbs: { go: entry({ ok: 1, lastOkDay: "2026-10-22" }) } };
    const r: DrillMistakeMap = { verbs: { go: entry({ ok: 3, lastOkDay: "2026-10-24" }) } };
    const m = mergeDrillMistakes(l, r);
    expect(m.verbs!.go).toEqual({ wrong: 2, ok: 3, lastDay: "2026-10-25", lastOkDay: "2026-10-24" });
    const a: DrillMistakeMap = { verbs: { go: entry({ wrong: 2, ok: 1, lastOkDay: "2026-10-24" }) } };
    expect(mergeDrillMistakes(a, JSON.parse(JSON.stringify(a)))).toEqual(a);
  });

  it("idempotence: sanitizeِ دوبارِ ورودیِ مسموم با okها همان میدهد", () => {
    const poisoned = { verbs: { go: { wrong: 2, ok: -7, lastDay: "2026-10-25", lastOkDay: 42 } } };
    const once = sanitizeDrillMistakes(poisoned);
    expect(sanitizeDrillMistakes(once)).toEqual(once);
    expect(once.verbs!.go).toEqual({ wrong: 2, ok: 0, lastDay: "2026-10-25", lastOkDay: "" });
  });
});
