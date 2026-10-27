// ---------------------------------------------------------------------
// r417 — «شفافیتِ ریتم» — قفلهایِ موتورِ دورهٔ نفسِ پیدا.
//
// صفرِ صادقِ چیپِ زمردی (r416: «درنفس، نه فراموششده») حالا روزِ
// بازگشت هم میگوید. قفلها:
//  · نردبان در روزِ بازگشت: ok=1 → فردا؛ ok=2 → +۲؛ ok=3 → +۴؛
//    ok=4/9 → +۸ (سقف) — عینِ نردبانِ r416، بیِ سیاستِ تازه
//  · حقِ امروزِ ردیفِ نیمهتسلط: درنفس با بازگشتِ فردا
//  · اشتباهِ امروزِ بیحق: نه سررسید، نه درنفس — چیپِ آسمانی ادعای
//    بیپشتوانه نمیسازد (حقی نگرفته است)
//  · مسلط: بازگشتی در کار نیست — حتی درونِ فاصله
//  · بارِ مسمومِ بیروز: سررسیدِ محتاط، نه نشسته
//  · فاصلهٔ سپریشده: بازگشتِ تهی — ردیف در صفِ سررسید
//  · lastOkDayِ آینده (کجساعتِ ابری): درنفسِ تعلیقشده با روزِ صادق
//  · همپوشانیِ صفر: هیچ ردیفی همزمان سررسید و درنفس نیست — رویِ
//    بانکِ مخلوطِ همهٔ حالتها
//  · ترتیب: نزدیکترین بازگشت نخست؛ daysUntil با مرزِ ماه
//  · summary: count + nearestDays؛ بانکِ غایب = صفرِ صادق
// ---------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import {
  countDrillDue,
  countDrillGrace,
  drillDaysBetween,
  drillDueBases,
  drillGraceNextDueDay,
  drillGraceRows,
  drillGraceSummary,
  type DrillMistakeBank,
  type DrillMistakeEntry,
} from "@/lib/drill-mistakes";

const entry = (over: Partial<DrillMistakeEntry> = {}): DrillMistakeEntry => ({
  wrong: 2,
  ok: 0,
  lastDay: "2026-10-20",
  lastOkDay: "",
  ...over,
});

const TODAY = "2026-10-25";
const day = (offset: number): string => {
  const t = Date.UTC(2026, 9, 25, 12) + offset * 86400000;
  return new Date(t).toISOString().slice(0, 10);
};

describe("drill-grace-transparency r417 — روزِ بازگشتِ برنامهای", () => {
  it("نردبان در روزِ بازگشت: ok=1 → فردا؛ ok=2 → +۲؛ ok=3 → +۴؛ ok=4/9 → سقفِ هشت", () => {
    expect(drillGraceNextDueDay(entry({ ok: 1, lastOkDay: TODAY }), TODAY)).toBe(day(1));
    expect(drillGraceNextDueDay(entry({ wrong: 3, ok: 2, lastOkDay: TODAY }), TODAY)).toBe(day(2));
    expect(drillGraceNextDueDay(entry({ wrong: 4, ok: 3, lastOkDay: TODAY }), TODAY)).toBe(day(4));
    expect(drillGraceNextDueDay(entry({ wrong: 5, ok: 4, lastOkDay: TODAY }), TODAY)).toBe(day(8));
    expect(drillGraceNextDueDay(entry({ wrong: 10, ok: 9, lastOkDay: TODAY }), TODAY)).toBe(day(8)); // سقفِ صادق
  });

  it("فاصله از روزِ حق میشمارد نه از امروز — حقِ پنج روزِ پیش با ok=1، فردا بازمیگردد", () => {
    // lastOkDay = دیروز، grace(1)=۱ → بازگشتِ امروز: دیگر درنفس نیست
    expect(drillGraceNextDueDay(entry({ ok: 1, lastOkDay: "2026-10-24" }), TODAY)).toBeNull();
    // lastOkDay = امروز → بازگشتِ فردا
    expect(drillGraceNextDueDay(entry({ ok: 1, lastOkDay: TODAY }), TODAY)).toBe(day(1));
  });

  it("اشتباهِ امروزِ بیحق: نه سررسید (همانروزِ r414) نه درنفس — ادعایِ بیپشتوانه ممنوع", () => {
    const e = entry({ lastDay: TODAY, ok: 0, lastOkDay: "" });
    expect(countDrillDue({ go: e }, TODAY)).toBe(0); // سررسید نیست
    expect(drillGraceNextDueDay(e, TODAY)).toBeNull(); // و درنفس هم نیست — حق نگرفته
  });

  it("مسلط: بازگشتی در کار نیست — حتی درونِ فاصله", () => {
    const e = entry({ wrong: 2, ok: 2, lastOkDay: TODAY }); // ok ≥ wrong
    expect(drillGraceNextDueDay(e, TODAY)).toBeNull();
  });

  it("بارِ مسمومِ بیروز: سررسیدِ محتاط — نه نشسته", () => {
    const e = entry({ lastDay: "", ok: 3, lastOkDay: TODAY, wrong: 4 });
    expect(countDrillDue({ go: e }, TODAY)).toBe(1);
    expect(drillGraceNextDueDay(e, TODAY)).toBeNull();
  });

  it("فاصلهٔ سپریشده: بازگشتِ تهی — همان ردیف در صفِ سررسید حاضر است", () => {
    // حقِ ۱۰ اکتبر با ok=2 (فاصلهٔ ۲) → از ۱۲ اکتبر سررسید
    const e = entry({ lastDay: "2026-10-09", ok: 2, lastOkDay: "2026-10-10", wrong: 3 });
    expect(drillGraceNextDueDay(e, TODAY)).toBeNull();
    expect(countDrillDue({ go: e }, TODAY)).toBe(1);
  });

  it("lastOkDayِ آینده (کجساعتِ ابری): درنفسِ تعلیقشده با روزِ صادق", () => {
    // حقِ ۵ روزِ آینده با ok=1 → بازگشتِ ۶ روزِ آینده — تا آنروز روزِ صادقِ صبر
    const e = entry({ lastDay: "2026-10-20", ok: 1, lastOkDay: day(5) });
    expect(drillGraceNextDueDay(e, TODAY)).toBe(day(6));
    expect(countDrillDue({ go: e }, TODAY)).toBe(0); // تا پسِ فاصله سررسید نیست (r416)
  });

  it("همپوشانیِ صفر: هیچ ردیفی همزمان سررسید و درنفس نیست — بانکِ مخلوطِ همهٔ حالتها", () => {
    const bank: DrillMistakeBank = {
      go: entry({ lastDay: "2026-10-24", ok: 0, lastOkDay: "" }), // سررسیدِ ساده
      come: entry({ wrong: 2, ok: 1, lastDay: "2026-10-20", lastOkDay: TODAY }), // درنفسِ grace1
      see: entry({ wrong: 3, ok: 2, lastDay: "2026-10-01", lastOkDay: TODAY }), // درنفسِ grace2
      have: entry({ wrong: 1, ok: 1, lastDay: "2026-10-20", lastOkDay: "2026-10-20" }), // مسلط
      eat: entry({ lastDay: TODAY, ok: 0, lastOkDay: "" }), // تازهٔ امروزِ بیحق
      run: entry({ lastDay: "2026-10-09", ok: 2, lastOkDay: "2026-10-10" }), // فاصلهٔ سپریشده
      sit: entry({ lastDay: "", ok: 0, lastOkDay: "" }), // مسمومِ بیروز
      win: entry({ wrong: 3, ok: 1, lastDay: "2026-10-20", lastOkDay: TODAY }), // نیمهتسلطِ درنفس
    };
    const due = drillDueBases(bank, TODAY);
    const grace = drillGraceRows(bank, TODAY);
    const dueSet = new Set(due);
    for (const g of grace) expect(dueSet.has(g.base)).toBe(false); // هیچ اشتراکی
    // و هر ردیفِ بیِمسلطِ بانک دقیقاً در یکی از دو مجموعه است
    for (const [base, e] of Object.entries(bank)) {
      if (e.ok >= e.wrong) continue; // مسلط — در هیچکدام
      const inDue = dueSet.has(base);
      const inGrace = grace.some((g) => g.base === base);
      const neither = base === "eat"; // تازهٔ امروزِ بیحق — تنها استثنایِ صادق
      expect(inDue || inGrace || neither, base).toBe(true);
      expect(inDue && inGrace, base).toBe(false);
    }
    expect(countDrillDue(bank, TODAY)).toBe(due.length);
    expect(countDrillGrace(bank, TODAY)).toBe(grace.length);
  });

  it("ترتیب: نزدیکترین بازگشت نخست؛ daysUntil با شمارِ روزهایِ مانده", () => {
    const bank: DrillMistakeBank = {
      see: entry({ wrong: 3, ok: 2, lastOkDay: TODAY }), // بازگشت +۲
      come: entry({ ok: 1, lastOkDay: TODAY }), // بازگشت فردا
      win: entry({ wrong: 5, ok: 4, lastOkDay: TODAY }), // بازگشت +۸ (سقف)
    };
    const rows = drillGraceRows(bank, TODAY);
    expect(rows.map((r) => r.base)).toEqual(["come", "see", "win"]);
    expect(rows.map((r) => r.daysUntil)).toEqual([1, 2, 8]);
  });

  it("drillDaysBetween: مرزِ ماه و سال — و کلیدِ بیقرارداد = صفر", () => {
    expect(drillDaysBetween("2026-10-25", "2026-10-26")).toBe(1);
    expect(drillDaysBetween("2026-10-28", "2026-11-02")).toBe(5); // مرزِ ماه
    expect(drillDaysBetween("2026-12-30", "2027-01-02")).toBe(3); // مرزِ سال
    expect(drillDaysBetween("2026-02-27", "2028-03-01", )).toBe(733); // دو سالِ کامل + ۲ روز (2027/2028 عادی قبلِ کبیسه در بازه)
    expect(drillDaysBetween("بد", "2026-10-26")).toBe(0);
    expect(drillDaysBetween("2026-10-25", "")).toBe(0);
  });

  it("summary: count + nearestDays — و بانکِ غایب/تهی = صفرِ صادق با nearestDaysِ تهی", () => {
    expect(drillGraceSummary(undefined, TODAY)).toEqual({ count: 0, nearestDays: null });
    expect(drillGraceSummary({}, TODAY)).toEqual({ count: 0, nearestDays: null });
    const bank: DrillMistakeBank = {
      see: entry({ wrong: 3, ok: 2, lastOkDay: TODAY }), // +۲
      go: entry({ lastDay: "2026-10-24", ok: 0 }), // سررسید — شمرده نمیشود
      come: entry({ ok: 1, lastOkDay: TODAY }), // فردا — نزدیکترین
    };
    expect(drillGraceSummary(bank, TODAY)).toEqual({ count: 2, nearestDays: 1 });
  });
});
