// ---------------------------------------------------------------------
// r423 — «خانههایِ هفتگانهٔ تقویمِ هفته» — قفلهایِ چینندهٔ مشترک.
//
// تکمنبعِ نوارِ نمایِ r422 و کارتِ تصویریِ r423 (پیشنهادِ ①ِ r421/r422).
// قفلها:
//  · هفت خانه همیشه (k=۰..۶) — نوار و کارت هر دو همین شکل را میخوانند
//  · شمارِ هر خانه از سطرِ dayTotalِ خودِ agenda — صفر شمارشِ موازی
//    (جمعِ شمارها = itemCountِ خودِ agenda؛ هیچ خانه‌ای چیزی از
//    بانک نمیشمارد)
//  · برچسبِ «امروز»/«فردا» برایِ k=۰/۱؛ k≥۲ از faWeekdayِ روزِ سطرِ
//    زنده (روزی که SRS وعده کرده) و از dayForِ تزریقی برایِ روزِ ساکت
//  · dayFor تزریقی است — کتابخانه بیِ study-store میماند؛ آزمون با
//    کلیدهایِ ثابت قطعی است و تحریفِ dayFor باید برچسبِ ساکتها را
//    عوض کند (ثبتِ وابستگی، نه سهو)
//  · خلوصِ تابعی: ورودیِ یکسان = خروجیِ یکسان
//  · صداقتِ ارثی: هفتهٔ تهی (نقشهٔ تهی / همه‌مسلط) = هفت خانهٔ صفرِ
//    ساکت — نه عددِ برساخته (r236)
// ---------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  buildDrillCalendarAllRows,
  buildDrillWeekAgendaFromRows,
  buildDrillWeekCalendarCells,
  type DrillCalendarHosts,
} from "@/lib/drill-calendar-csv";
import { faWeekday } from "@/lib/weekly-digest";

const TODAY = "2026-10-26";
const ago = (n: number) => {
  const iso = (d: Date) =>
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  return iso(new Date(Date.parse(TODAY + "T12:00:00Z") - n * 86400000));
};

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: ago(1),
  lastOkDay: "",
  ...over,
});
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: ago(1),
  lastOkDay: TODAY,
  ...over,
});
/** درنفسِ دور — ok=4 نردبانِ ۸روزه؛ از پنجرهٔ ۷روزه بیرون میماند */
const graceFar = (over: Record<string, unknown> = {}) => ({
  wrong: 5,
  ok: 4,
  lastDay: ago(1),
  lastOkDay: TODAY,
  ...over,
});

const HOSTS: DrillCalendarHosts = {
  labelFor: () => () => "",
  titleFor: (bankId) => ({ verbs: "افعال بی‌قاعده" }[bankId] ?? ""),
  order: ["verbs", "phonemes", "words", "abbrev", "lesson-vocab", "dict-vocab", "bg-examples"],
};

/** dayForِ قطعیِ آزمون — همان قراردادِ نما (k => daysAgoKey(-k)) با TODAY ثابت */
const dayFor = (k: number) => ago(-k);

const mixedBank = {
  verbs: {
    go: dueEntry(), // k=۰ — سررسید
    come: graceEntry(), // k=۱ — grace1
    see: graceEntry({ ok: 2, wrong: 3 }), // k=۲ — grace2
    run: graceFar(), // k=۸ — پس از هفته
  },
};

describe("drill-week-cells r423 — خانههایِ هفتگانهٔ مشترک", () => {
  it("هفت خانه همیشه؛ نردبانِ مخلوط: امروز۱/فردا۱/روز۲۱ و چهار خانهٔ ساکت", () => {
    const agenda = buildDrillWeekAgendaFromRows(buildDrillCalendarAllRows(mixedBank, TODAY, HOSTS));
    const cells = buildDrillWeekCalendarCells(agenda, dayFor);
    expect(cells).toHaveLength(7);
    expect(cells.map((c) => c.k)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(cells[0].label).toBe("امروز");
    expect(cells[0].count).toBe(1);
    expect(cells[1].label).toBe("فردا");
    expect(cells[1].count).toBe(1);
    expect(cells[2].label).toBe(faWeekday(ago(-2)));
    expect(cells[2].count).toBe(1);
    const silent = cells.filter((c) => c.count === 0);
    expect(silent).toHaveLength(4); // k=۳..۶
    expect(silent.every((c) => c.label === faWeekday(dayFor(c.k)))).toBe(true);
  });

  it("تکمنبع: شمارِ هر خانه از dayTotalِ خودِ agenda — جمعِ شمارها = itemCount", () => {
    const agenda = buildDrillWeekAgendaFromRows(buildDrillCalendarAllRows(mixedBank, TODAY, HOSTS));
    const cells = buildDrillWeekCalendarCells(agenda, dayFor);
    const dayTotals = agenda.rows.filter((r) => r.kind === "dayTotal");
    for (const c of cells) {
      const row = dayTotals.find((r) => r.kind === "dayTotal" && r.daysUntil === c.k);
      expect(c.count).toBe(row && row.kind === "dayTotal" ? row.count : 0);
      // روزِ زنده از خودِ سطر میآید — روزی که SRS وعده کرده، نه dayFor
      if (row && row.kind === "dayTotal") expect(c.day).toBe(row.day);
    }
    expect(cells.reduce((s, c) => s + c.count, 0)).toBe(agenda.itemCount);
  });

  it("dayFor تزریقی محترم است — تحریفش برچسبِ خانههایِ ساکت را عوض میکند", () => {
    const agenda = buildDrillWeekAgendaFromRows(buildDrillCalendarAllRows(mixedBank, TODAY, HOSTS));
    const crooked = buildDrillWeekCalendarCells(agenda, (k) => ago(-(k + 30)));
    const honest = buildDrillWeekCalendarCells(agenda, dayFor);
    // روزِ ساکتِ k=۶ در دو جهان برچسبِ متفاوت دارد — وابستگیِ ثبتشده
    expect(crooked[6].label).toBe(faWeekday(ago(-36)));
    expect(honest[6].label).toBe(faWeekday(ago(-6)));
    expect(crooked[6].label).not.toBe(honest[6].label);
    // ولی شمارها هرگز با dayFor نمیتوانند تغییر کنند — واقعیتِ SRS
    expect(crooked.map((c) => c.count)).toEqual(honest.map((c) => c.count));
  });

  it("هفتهٔ تهی (نقشهٔ تهی و همه‌مسلط): هفت خانهٔ صفرِ ساکت — نه عددِ برساخته (r236)", () => {
    const empty = buildDrillWeekAgendaFromRows(buildDrillCalendarAllRows({}, TODAY, HOSTS));
    expect(empty.itemCount).toBe(0);
    const cells = buildDrillWeekCalendarCells(empty, dayFor);
    expect(cells).toHaveLength(7);
    expect(cells.every((c) => c.count === 0)).toBe(true);
    const mastered = buildDrillWeekAgendaFromRows(
      buildDrillCalendarAllRows(
        { verbs: { have: { wrong: 1, ok: 1, lastDay: ago(6), lastOkDay: ago(6) } } },
        TODAY,
        HOSTS,
      ),
    );
    expect(mastered.itemCount).toBe(0);
    expect(buildDrillWeekCalendarCells(mastered, dayFor).every((c) => c.count === 0)).toBe(true);
  });

  it("خلوصِ تابعی: ورودیِ یکسان = خروجیِ یکسان", () => {
    const agenda = buildDrillWeekAgendaFromRows(buildDrillCalendarAllRows(mixedBank, TODAY, HOSTS));
    expect(buildDrillWeekCalendarCells(agenda, dayFor)).toEqual(
      buildDrillWeekCalendarCells(agenda, dayFor),
    );
  });
});
