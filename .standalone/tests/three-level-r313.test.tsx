// @vitest-environment jsdom
// ------------------------------------------------------------------
// r313 — آزمونِ پیوندیِ «یک منبع، سه سطح» (پیشنهادِ ①ِ r312):
//   با یک seedِ مشترکِ داستانها، سه سطحِ مستقلِ کد باید یک حکایت را
//   بگویند — نه با هم‌حکایتیِ ادبی، با برابریِ عددیِ واقعی:
//     · سطحِ DOM: monthReads (نوارِ ۳۰خانه‌ایِ ماه‌نامه) — جمعِ ماه
//     · سطحِ اکسل: buildMonthCsv — سطرِ آخر: جمعِ فزاینده / جمعِ
//       هفت‌روزه / تفاوت با هفت‌روزهٔ پیش (لغزانِ ۷روزهٔ r312)
//     · سطحِ بوم: weekStripSums (نقاشِ واحدِ drawWeekStrip14) —
//       prev/current/delta از دو نیمهٔ ۷تایی
//   weekPerDayِ سطحِ بوم از monthReads().perDay.slice(-14) مشتق میشود —
//   هیچ seedِ موازیای؛ دو مسیرِ کد (پنجرههای درون-جدولیِ CSV در برابرِ
//   reduceِ نیمهایِ نقاش) باید رویِ همان داده به یک عدد برسند.
//   مینوسِ ASCII در هر دو سطح از String() میآید — برابریِ رشته‌ای عینِ
//   قرارداد است.
// r314 — پیوندِ دوم در واحدِ فعالیت: جدولِ ۳۵روزه (پنج شمارنده — همان
//   واحدِ نوارِ کارتها) هم صاحبِ دو ستونِ هفت‌روزه شد؛ سطرِ آخرش باید با
//   weekStripSums رویِ همان statOfDayهایِ ۱۴روزه برابر باشد — «یک منبع،
//   سه سطح» حالا در هر دو واحد (داستان‌ها r313 / فعالیت r314) عددی قفلست.
//   + برچسبِ ستونهایِ خروجیهایِ اکسل در UIِ هفته‌نامه (پیشنهادِ ②ِ r312):
//     باندِ aria==title با سه شمارشِ ستون — و tooltipِ دکمههایِ روند/
//     ماه‌نامه که ستونهایِ تازهٔ r311/r312 را می‌نامند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { buildMonthCsv, buildProgressCsv } from "@/lib/progress-csv";
import { monthReads } from "@/lib/library-month";
import { weekStripSums } from "@/lib/result-image";
import { dayKeyBefore, statOfDay } from "@/lib/weekly-digest";
import { useStudy } from "@/lib/study-store";
import WeeklyReportSection from "@/components/study/reports/weekly-report";

// هفته‌نامه analytics مصرف میکند — استور با آلودگیِ ناوبری امن است (الگویِ weekly-report.component)
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const T = "2026-10-14"; // چهارشنبه — همان لنگرِ خانوادهٔ CSV

/** dayHistory entry with only the stories field that matters here */
const st = (day: string, stories: number) => ({ day, stories }) as never;

const csvLib = () => readFileSync(join(process.cwd(), "src/lib/progress-csv.ts"), "utf8");
const reportLib = () =>
  readFileSync(join(process.cwd(), "src/components/study/reports/weekly-report.tsx"), "utf8");

/** seedِ مشترکِ رشد: هفتهٔ پیشِ پنجره ۴ داستان — هفتهٔ آخر ۱۲ (رشدِ +۸) */
const growSeed = {
  "2026-10-01": st("2026-10-01", 1),
  "2026-10-03": st("2026-10-03", 3),
  "2026-10-08": st("2026-10-08", 2),
  "2026-10-10": st("2026-10-10", 4),
  "2026-10-13": st("2026-10-13", 5),
  [T]: st(T, 1),
};

/** seedِ مشترکِ افت: هفتهٔ پیش ۱۰ — هفتهٔ آخر ۳ (افتِ −۷) */
const fallSeed = {
  "2026-10-02": st("2026-10-02", 4),
  "2026-10-04": st("2026-10-04", 6),
  "2026-10-10": st("2026-10-10", 1),
  "2026-10-13": st("2026-10-13", 2),
};

describe("پیوندِ سه‌سطحی — یک منبع، یک حکایت (r313)", () => {
  it("سطرِ آخرِ ماه‌نامه === weekStripSumsِ همان پنجرهٔ ۱۴روزهٔ داستانها — رشدِ +۸", () => {
    const rows = buildMonthCsv(growSeed, T).trimEnd().split("\r\n");
    const cells = rows[30].split(",");
    // weekPerDayِ سطحِ بوم از منبعِ یگانه مشتق میشود — نه از seedِ موازی
    const wpd = monthReads(growSeed, T)
      .perDay.slice(-14)
      .map((d) => ({ total: d.count }));
    const sums = weekStripSums(wpd);
    expect(sums.current).toBe(12); // ۲+۴+۵+۱ — هفتهٔ آخر
    expect(sums.delta).toBe(8); // ۱۲ − ۴
    expect(cells[4]).toBe(String(sums.current)); // جمعِ هفت‌روزه
    expect(cells[5]).toBe(String(sums.delta)); // تفاوت با هفت‌روزهٔ پیش
    expect(Number(cells[5])).toBeGreaterThan(0); // رشد — بدونِ علامت
  });

  it("افت — مینوسِ ASCII در هر دو سطح از یک String میآید", () => {
    const rows = buildMonthCsv(fallSeed, T).trimEnd().split("\r\n");
    const cells = rows[30].split(",");
    const wpd = monthReads(fallSeed, T)
      .perDay.slice(-14)
      .map((d) => ({ total: d.count }));
    const sums = weekStripSums(wpd);
    expect(sums.delta).toBe(-7); // ۳ − ۱۰
    expect(cells[5]).toBe(String(sums.delta));
    expect(cells[5]).toBe("-7"); // مینوسِ ASCII — نه «−» ریاضی
  });

  it("دو نیمهٔ نقاش با ستونِ داستانهایِ خودِ CSV هم می‌سنجند — پنجرهها همان ۱۴ روز را برش میزنند", () => {
    const rows = buildMonthCsv(growSeed, T).trimEnd().split("\r\n");
    // آخرین ۱۴ سطرِ داده (rows[17..30]) = پنجرهٔ نقاش؛ نیمهٔ اول rows[17..23]
    const storyCol = (from: number, to: number) =>
      rows
        .slice(from, to + 1)
        .map((r) => Number(r.split(",")[2]))
        .reduce((s, n) => s + n, 0);
    const wpd = monthReads(growSeed, T)
      .perDay.slice(-14)
      .map((d) => ({ total: d.count }));
    const sums = weekStripSums(wpd);
    expect(sums.prev).toBe(storyCol(17, 23)); // هفتهٔ پیش — از خودِ جدول
    expect(sums.current).toBe(storyCol(24, 30)); // هفتهٔ آخر — از خودِ جدول
  });

  it("سطحِ سوم — جمعِ فزایندهٔ سطرِ آخر === monthReads.total (نوارِ ۳۰خانه‌ایِ DOM)", () => {
    const rows = buildMonthCsv(growSeed, T).trimEnd().split("\r\n");
    const cells = rows[30].split(",");
    expect(cells[3]).toBe(String(monthReads(growSeed, T).total));
    expect(cells[3]).toBe("16"); // کلِ پنجرهٔ ۳۰روزه — همهٔ seed داخلِ پنجرهاست
  });

  it("تاریخِ خالی — هر سه سطح صفرِ صادقند (نه خانهٔ تهی — پنجرهها کاملند)", () => {
    const rows = buildMonthCsv({}, T).trimEnd().split("\r\n");
    const cells = rows[30].split(",");
    const sums = weekStripSums(monthReads({}, T).perDay.slice(-14).map((d) => ({ total: d.count })));
    expect(sums).toEqual({ prev: 0, current: 0, delta: 0 });
    expect(cells[3]).toBe("0");
    expect(cells[4]).toBe(String(sums.current));
    expect(cells[5]).toBe(String(sums.delta));
  });

  it("r314 — پیوند در واحدِ فعالیت: سطرِ آخرِ جدولِ ۳۵روزه === weekStripSumsِ همان ۱۴روزه", () => {
    // seedِ فعالیت (مرور/آزمون) — همان واحدِ نوارِ کارتها؛ داستانها در این حکایت بی‌ربط‌اند
    const act = (d: string, reviews: number, quizzes = 0) =>
      ({ day: d, reviews, quizzes, words: 0, dictation: 0, rush: 0, stories: 0 }) as never;
    const seed = {
      "2026-10-01": act("2026-10-01", 1),
      "2026-10-03": act("2026-10-03", 0, 3),
      "2026-10-08": act("2026-10-08", 2),
      "2026-10-10": act("2026-10-10", 4),
      [T]: act(T, 0, 1),
    };
    // weekPerDayِ کارت با همان عبارتی تغذیه میشود که weekly-report می‌نویسد:
    // پنج شمارندهٔ statOfDay — رونویسیِ عینِ فراخوانِ کارت، نه شمارشِ موازی
    const weekPerDay14 = Array.from({ length: 14 }, (_, i) => {
      const st = statOfDay(dayKeyBefore(T, 13 - i), { dayHistory: seed });
      return {
        total: st.reviews + st.quizzes + st.words + st.dictation + st.rush,
      };
    });
    const sums = weekStripSums(weekPerDay14);
    expect(sums.prev).toBe(4); // ۱۰-۰۱ + ۱۰-۰۳
    expect(sums.current).toBe(7); // ۱۰-۰۸ + ۱۰-۱۰ + امروز
    expect(sums.delta).toBe(3);
    // اکسلِ ۳۵روزه — سطرِ آخر: همان دو عدد، از پنجرههایِ درون-جدولیِ r314
    const rows = buildProgressCsv(seed, T).trimEnd().split("\r\n");
    const cells = rows[35].split(",");
    expect(cells[8]).toBe(String(sums.current));
    expect(cells[9]).toBe(String(sums.delta));
  });

  it("r314 — افت در واحدِ فعالیت — مینوسِ ASCII در هر دو سطح", () => {
    const act = (d: string, reviews: number) =>
      ({ day: d, reviews, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 }) as never;
    const seed = {
      "2026-10-02": act("2026-10-02", 4),
      "2026-10-04": act("2026-10-04", 6),
      "2026-10-10": act("2026-10-10", 1),
      "2026-10-13": act("2026-10-13", 2),
    };
    const weekPerDay14 = Array.from({ length: 14 }, (_, i) => {
      const st = statOfDay(dayKeyBefore(T, 13 - i), { dayHistory: seed });
      return {
        total: st.reviews + st.quizzes + st.words + st.dictation + st.rush,
      };
    });
    const sums = weekStripSums(weekPerDay14);
    expect(sums.delta).toBe(-7); // ۳ − ۱۰
    const rows = buildProgressCsv(seed, T).trimEnd().split("\r\n");
    expect(rows[35].split(",")[9]).toBe(String(sums.delta));
    expect(rows[35].split(",")[9]).toBe("-7");
  });

  it("قفلِ منبع — buildMonthCsv فقط یک monthReads میخورد؛ نقاش فقط یک weekStripSums", () => {
    const csv = csvLib();
    expect(csv.match(/monthReads\(history, today\)/g)?.length).toBe(1);
    expect(csv).toContain('import { monthReads } from "./library-month";');
    const img = readFileSync(join(process.cwd(), "src/lib/result-image.ts"), "utf8");
    expect(img.match(/const sums = weekStripSums\(weekPerDay\)/g)?.length).toBe(1);
  });
});

// ------------------------------------------------------------------
// r313② — باندِ برچسبِ ستونهایِ خروجیهایِ اکسل در هفته‌نامه + tooltipهای
// هم‌زبانِ ستونهایِ واقعی (r311: تفاوت با هفتهٔ پیش / r312: دو ستونِ
// هفت‌روزه). aria==title هم‌قراردادِ دستور رنگ‌ها.
// ------------------------------------------------------------------

describe("باندِ برچسبِ خروجیهایِ اکسل — کامپوننت (r313)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      dayHistory: {},
      history: {},
      goalMetDays: [],
      dailyGoal: 10,
      streak: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
    });
  });

  it("باند حاضر است: aria==title و سه شمارشِ ستون با ستونهایِ تازه", () => {
    render(<WeeklyReportSection />);
    const band = screen.getByLabelText("ستونهایِ خروجیهایِ اکسل");
    expect(band.getAttribute("title")).toBe("ستونهایِ خروجیهایِ اکسل");
    expect(band).toHaveTextContent("۳۵روزه: ۱۰ ستون (با جمعِ هفت‌روزه و تفاوتش)");
    expect(band).toHaveTextContent("روندِ ۴هفته‌ای: ۱۱ ستون (با تفاوت با هفتهٔ پیش)");
    expect(band).toHaveTextContent("ماه‌نامهٔ خواندن: ۶ ستون (با جمعِ هفت‌روزه و تفاوتش)");
  });

  it("tooltipِ هر شمارش نامِ کاملِ ستونها را میگوید — نه فقط تعداد", () => {
    render(<WeeklyReportSection />);
    expect(screen.getByTitle("جدولِ ۳۵روزه — ۱۰ ستون: تاریخ، روز هفته، پنج شمارنده، مجموع، جمعِ هفت‌روزه، تفاوت با هفت‌روزهٔ پیش")).toBeInTheDocument();
    expect(
      screen.getByTitle("روندِ ۴هفته‌ای — ۱۱ ستون: پنج شمارنده، مجموع، تفاوت با هفتهٔ پیش، روزهای فعال و هدف")
    ).toBeInTheDocument();
    expect(
      screen.getByTitle("ماه‌نامهٔ خواندن — ۶ ستون: تاریخ، روز هفته، داستانها، جمعِ فزاینده، جمعِ هفت‌روزه، تفاوت با هفت‌روزهٔ پیش")
    ).toBeInTheDocument();
  });

  it("دکمههایِ دانلود هم‌زبانِ ستونهایِ تازه‌اند — tooltipِ قدیمیِ ۴ستونیِ ماه‌نامه بازنگشته", () => {
    render(<WeeklyReportSection />);
    const trend = screen.getByTitle("روندِ ۴هفته‌ای CSV — هر هفته یک سطر با تفاوت با هفتهٔ پیش، روزهای فعال و هدف");
    expect(trend.getAttribute("aria-label")).toBe("دانلود روند ۴هفته‌ای CSV");
    const month = screen.getByTitle(
      "ماه‌نامهٔ خواندن CSV — ۳۰ سطرِ روزانهٔ داستان با جمعِ فزاینده، جمعِ هفت‌روزه و تفاوت با هفت‌روزهٔ پیش"
    );
    expect(month.getAttribute("aria-label")).toBe("دانلود ماه‌نامهٔ خواندن CSV");
    // قفلِ بازنگشتِ قدیمی: titleِ ماه‌نامه دیگر رویِ «جمعِ فزاینده» تمام نمیشود
    const src = reportLib();
    expect(src).toContain("جمعِ فزاینده، جمعِ هفت‌روزه و تفاوت با هفت‌روزهٔ پیش");
    expect(src).not.toContain('title="ماه‌نامهٔ خواندن CSV — ۳۰ سطرِ روزانهٔ داستان با جمعِ فزاینده"');
  });
});
