// ---------------------------------------------------------------------
// r416 — «فاصلهگذاریِ پیشروندهٔ سررسید» — قفلهایِ موتورِ دورهٔ نفس.
//
// درِ r414 هر روزِ پسِ خطا سررسید بود — حتی برایِ ردیفی که همین امروز
// حقِ تازه گرفته بود (شاهدِ زندهٔ r415: come با ok:1ِ امروز، همان لحظه
// دوباره «۱ سررسید» بود). از r416، پاسخِ درستِ آخرین رخداد به ردیف یک
// دورهٔ نفس میدهد: نردبانِ دوبرابرشوندهٔ ۱→۲→۴→۸ روز (سقفِ هشت) از
// lastOkDay. خطایِ تازهتر دورهٔ نفس را باطل میکند؛ ok=0 (بارِ کهنهٔ
// r413) فاصلهای ندارد؛ ردیفِ بیروزِ مسموم همچنان محتاطانه سررسید است.
//
// قفلها:
//  · نردبانِ grace: 0→۰، 1→۱، 2→۲، 3→۴، 4→۸، 7→۸، 9999→۸، منفی→۰
//  · حقِ امروز، ردیفِ نیمهتسلط را همان روز از صف بیرون میبرد — فردا برمیگردد (ok=1)
//  · ok=2: فردا هنوز نه، پسِ دو روز؛ ok=3: پسِ چهار روز
//  · ok=4 در هشت روز؛ ok=9 هم در هشت — سقفِ صادق
//  · خطایِ تازه دورهٔ نفس را باطل میکند — فردایِ اشتباه سررسید
//  · همانروزِ اشتباه+حق: امروز نه؛ فردا (grace از امروزِ مشترک)
//  · بارِ کهنهٔ ok=0: هر روزِ پسِ خطا سررسید — رفتارِ r414 دستنخورده
//  · ردیفِ بیروزِ مسموم: سررسید — حتی با lastOkDayِ حاضر (محتاطترین خوانش)
//  · lastOkDayِ آینده (کجساعتِ ابری): تا پسِ فاصله سررسید نیست
//  · مرزِ ماه و سال در جابهجاییِ روز (2026-10-31 + ۲ → 2026-11-02؛
//    2026-12-31 + ۲ → 2027-01-02)
//  · تسلط درونِ دورهٔ نفس هم میبندد — هرگز سررسید نیست
//  · drillDueBases: ردیفِ درنفس از فهرست میافتد؛ ترتیبِ اولویتِ باقی پابرجا
//  · countDrillDue == طولِ فهرست — رویِ بانکِ مخلوط
// ---------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import {
  DRILL_DUE_GRACE_CAP,
  countDrillDue,
  drillDueBases,
  drillDueGraceDays,
  isDrillMistakeDue,
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

describe("drill-due-grace r416 — نردبانِ فاصلهٔ پیشرونده", () => {
  it("نردبانِ دوبرابرشونده: 0→۰، 1→۱، 2→۲، 3→۴، 4→۸ — و در سقف میماند", () => {
    expect(drillDueGraceDays(0)).toBe(0);
    expect(drillDueGraceDays(1)).toBe(1);
    expect(drillDueGraceDays(2)).toBe(2);
    expect(drillDueGraceDays(3)).toBe(4);
    expect(drillDueGraceDays(4)).toBe(DRILL_DUE_GRACE_CAP);
    expect(drillDueGraceDays(7)).toBe(DRILL_DUE_GRACE_CAP);
    expect(drillDueGraceDays(9999)).toBe(DRILL_DUE_GRACE_CAP); // سقف حتی در capِ شمارنده
    expect(drillDueGraceDays(-3)).toBe(0); // منفی هم هیچ
  });

  it("حقِ امروز، ردیفِ نیمهتسلط را همان روز از صف بیرون میبرد — فردا برمیگردد (ok=1)", () => {
    // wrong:2، ok:1، خطای ۵ روز پیش، حقِ امروز — در r414 همین لحظه سررسید بود
    const e = entry({ wrong: 2, ok: 1, lastDay: "2026-10-20", lastOkDay: TODAY });
    expect(isDrillMistakeDue(e, TODAY)).toBe(false); // سرفصلِ r416
    expect(isDrillMistakeDue(e, day(1))).toBe(true); // پسِ یک روز
  });

  it("ok=2: فردا هنوز نه — پسِ دو روز؛ ok=3: پسِ چهار روز", () => {
    const two = entry({ wrong: 3, ok: 2, lastDay: "2026-10-20", lastOkDay: TODAY });
    expect(isDrillMistakeDue(two, day(1))).toBe(false);
    expect(isDrillMistakeDue(two, day(2))).toBe(true);
    const three = entry({ wrong: 4, ok: 3, lastDay: "2026-10-20", lastOkDay: TODAY });
    expect(isDrillMistakeDue(three, day(3))).toBe(false);
    expect(isDrillMistakeDue(three, day(4))).toBe(true);
  });

  it("ok=4 در هشت روز؛ ok=9 هم در هشت — سقفِ صادق", () => {
    const four = entry({ wrong: 5, ok: 4, lastDay: "2026-10-20", lastOkDay: TODAY });
    expect(isDrillMistakeDue(four, day(7))).toBe(false);
    expect(isDrillMistakeDue(four, day(8))).toBe(true);
    const nine = entry({ wrong: 10, ok: 9, lastDay: "2026-10-20", lastOkDay: TODAY });
    expect(isDrillMistakeDue(nine, day(8))).toBe(true); // نه روزِ دهم — همان هشت
  });

  it("خطایِ تازهتر از آخرین حق، دورهٔ نفس را باطل میکند — فردایِ اشتباه سررسید", () => {
    // حقِ سه روز پیش، اشتباهِ دیروز — آخرین رخداد اشتباه است
    const e = entry({ wrong: 3, ok: 1, lastDay: day(-1), lastOkDay: day(-3) });
    expect(isDrillMistakeDue(e, TODAY)).toBe(true); // بیِ انتظارِ نفس
    expect(isDrillMistakeDue(e, day(1))).toBe(true); // فردا هم — اشتباه، نفس نمیخرد
  });

  it("همانروزِ اشتباه+حق: امروز نه؛ فردا با شمارشِ grace از امروزِ مشترک", () => {
    const e = entry({ wrong: 3, ok: 1, lastDay: TODAY, lastOkDay: TODAY });
    expect(isDrillMistakeDue(e, TODAY)).toBe(false); // اشتباهِ امروز — همان روز نه
    expect(isDrillMistakeDue(e, day(1))).toBe(true); // grace(1)=۱ از امروز
  });

  it("بارِ کهنهٔ r413 (ok=0): هر روزِ پسِ خطا سررسید — رفتارِ r414 دستنخورده", () => {
    const e = entry({ wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" });
    expect(isDrillMistakeDue(e, TODAY)).toBe(true);
    expect(isDrillMistakeDue(e, day(5))).toBe(true);
  });

  it("ردیفِ بیروزِ مسموم: سررسید — حتی با lastOkDayِ حاضر (محتاطترین خوانش)", () => {
    expect(isDrillMistakeDue(entry({ wrong: 2, ok: 1, lastDay: "", lastOkDay: "2026-10-24" }), TODAY)).toBe(true);
    expect(isDrillMistakeDue(entry({ wrong: 1, lastDay: "", lastOkDay: "" }), TODAY)).toBe(true);
  });

  it("lastOkDayِ آینده (کجساعتِ ابری): تا پسِ فاصله سررسید نیست", () => {
    const e = entry({ wrong: 2, ok: 1, lastDay: "2026-10-20", lastOkDay: day(1) });
    expect(isDrillMistakeDue(e, TODAY)).toBe(false);
    expect(isDrillMistakeDue(e, day(1))).toBe(false); // هنوز روزِ حق نرسیده
    expect(isDrillMistakeDue(e, day(2))).toBe(true); // grace(1)=۱ از فردا
  });

  it("مرزِ ماه و سال در جابهجاییِ روز پابرجاست", () => {
    const monthEdge = entry({ wrong: 3, ok: 2, lastDay: "2026-10-01", lastOkDay: "2026-10-31" });
    expect(isDrillMistakeDue(monthEdge, "2026-11-01")).toBe(false);
    expect(isDrillMistakeDue(monthEdge, "2026-11-02")).toBe(true); // grace(2)=۲
    const yearEdge = entry({ wrong: 3, ok: 2, lastDay: "2026-12-01", lastOkDay: "2026-12-31" });
    expect(isDrillMistakeDue(yearEdge, "2027-01-01")).toBe(false);
    expect(isDrillMistakeDue(yearEdge, "2027-01-02")).toBe(true);
  });

  it("تسلط درونِ دورهٔ نفس هم میبندد — هرگز سررسید نیست", () => {
    const mastered = entry({ wrong: 1, ok: 1, lastDay: "2026-10-20", lastOkDay: TODAY });
    expect(isDrillMistakeDue(mastered, TODAY)).toBe(false);
    expect(isDrillMistakeDue(mastered, day(30))).toBe(false);
  });

  it("drillDueBases: ردیفِ درنفس از فهرست میافتد؛ ترتیبِ اولویتِ باقی پابرجا", () => {
    const bank = {
      go: entry({ wrong: 2, ok: 1, lastDay: "2026-10-20", lastOkDay: TODAY }), // درنفس — میافتد
      see: entry({ wrong: 3, ok: 0, lastDay: "2026-10-19" }), // سررسید — بیشترین خطا
      run: entry({ wrong: 1, ok: 0, lastDay: "2026-10-21" }), // سررسید
      sit: entry({ wrong: 1, ok: 0, lastDay: TODAY }), // امروز — هنوز نه
    };
    expect(drillDueBases(bank, TODAY)).toEqual(["see", "run"]);
    expect(countDrillDue(bank, TODAY)).toBe(2);
  });

  it("countDrillDue == طولِ فهرست — رویِ بانکِ مخلوطِ کامل", () => {
    const bank = {
      go: entry({ wrong: 2, ok: 1, lastDay: "2026-10-20", lastOkDay: TODAY }), // نفس
      come: entry({ wrong: 2, ok: 2, lastDay: "2026-10-20", lastOkDay: "2026-10-24" }), // نفسِ درحالِ گذراندن
      see: entry({ wrong: 4, ok: 3, lastDay: "2026-10-01", lastOkDay: "2026-10-15" }), // grace(3)=۴ از ۱۵ → ۱۹ گذشته
      have: entry({ wrong: 1, ok: 1, lastDay: "2026-10-20", lastOkDay: "2026-10-21" }), // مسلط
      eat: entry({ wrong: 1, ok: 0, lastDay: "2026-10-24" }), // سررسیدِ ساده
    };
    const list = drillDueBases(bank, TODAY);
    expect(list).toEqual(["see", "eat"]); // see: wrong:4 سنگینتر نخست؛ eat: فردایِ خطا
    expect(countDrillDue(bank, TODAY)).toBe(list.length);
  });
});
