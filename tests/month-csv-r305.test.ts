// ------------------------------------------------------------------
// r305 — ماه‌نامهٔ خواندن (CSVِ معلم‌نگر): برشِ ۳۰روزهٔ داستان‌ها.
// منبعِ یگانه: monthReads (قراردادِ خالصِ r304) — همین تابعی که نوارِ
// ماه‌نامهٔ DOM و کارتِ PNG میخوانند؛ هیچ شمارشِ موازی‌ای نیست.
// قراردادِ خانوادهٔ CSV (یک زبان با ۱۶۹/۱۷۸):
//   · سطرِ سرِ یخ‌زده · ۳۰+۱ سطر · قدیم→نو با لنگرِ امروز · CRLF
//   · روزِ خالی = صفرِ صادقانه (سطر حذف نمیشود) · اعدادِ ASCII
//   · ۶ فیلد در هر سطر (r312: +جمعِ هفت‌روزه، +تفاوت با هفت‌روزهٔ پیش)،
//     هیچ نقل‌قولی نیست
//   · جمعِ فزاینده: سطرِ آخر = خودِ جمعِ ماه (بدونِ سطرِ خلاصهٔ خارجِ جدول)
//   · r312 — مقایسهٔ دوهفته‌ای کاملِ سه‌سطحی: بوم (جملهٔ جهتیِ کارت) /
//     اکسلِ هفتگی (ستونِ «تفاوت با هفتهٔ پیش» r311) / اکسلِ ماهانه
//     (سطرِ آخر = جمعِ ۷روزِ آخر در برابرِ ۷روزِ قبلش)؛ پنجرهٔ ناقص
//     = خانهٔ تهیِ صادق (نه صفرِ دروغین)؛ افت = مینوسِ ASCII
//   · کلیدِ بیرونِ پنجره (۳۱روزِ پیش) نادیده — سقفِ پنجره، هم‌الگوی monthReads
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  CSV_BOM,
  MONTH_CSV_COLUMNS,
  MONTH_CSV_DAYS,
  buildMonthCsv,
  downloadMonthCsv,
} from "@/lib/progress-csv";

const T = "2026-10-14"; // چهارشنبه — همان لنگرِ خانوادهٔ CSV
const DAY0 = "2026-09-15"; // ۲۹ روزِ پیش از لنگر — کهنه‌ترین خانهٔ پنجره

/** dayHistory entry with only the stories field that matters here */
const st = (day: string, stories: number) => ({ day, stories }) as never;

describe("month-csv — شکل (r305)", () => {
  it("سطرِ سرِ یخ‌زده: ترتیبِ ۶ستونیِ منجمد (r312: +دو ستونِ هفت‌روزه)", () => {
    expect(MONTH_CSV_COLUMNS).toEqual([
      "تاریخ",
      "روز هفته",
      "داستان‌ها",
      "جمعِ فزاینده",
      "جمعِ هفت‌روزه",
      "تفاوت با هفت‌روزهٔ پیش",
    ]);
  });

  it("۳۰+۱ سطر؛ کهنه‌ترین خانه = ۲۹ روزِ پیش، آخرین سطر امروزِ لنگر", () => {
    const rows = buildMonthCsv({}, T).trimEnd().split("\r\n");
    expect(MONTH_CSV_DAYS).toBe(30);
    expect(rows).toHaveLength(31);
    expect(rows[1].startsWith(DAY0)).toBe(true);
    expect(rows[30].startsWith(T)).toBe(true);
  });

  it("CRLF در همه‌جا — بدونِ LFِ لخت", () => {
    const csv = buildMonthCsv({}, T);
    expect(csv).toContain("\r\n");
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});

describe("month-csv — مقدارها", () => {
  it("شمارشِ داستان‌ها از همان منبعِ یگانه + جمعِ فزاینده درست", () => {
    const history = {
      [T]: st(T, 2),
      "2026-10-13": st("2026-10-13", 1),
      "2026-10-11": st("2026-10-11", 3),
    };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    expect(rows[27]).toBe("2026-10-11,یکشنبه,3,3,3,3");
    expect(rows[28]).toBe("2026-10-12,دوشنبه,0,3,3,3");
    expect(rows[29]).toBe("2026-10-13,سه‌شنبه,1,4,4,4");
    expect(rows[30]).toBe(`${T},چهارشنبه,2,6,6,6`);
  });

  it("سطرِ آخرِ جمعِ فزاینده = خودِ جمعِ ماه (بدونِ سطرِ خلاصهٔ خارجِ جدول)", () => {
    const history = {
      [T]: st(T, 2),
      "2026-10-01": st("2026-10-01", 4),
      "2026-09-20": st("2026-09-20", 1),
    };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    const last = rows[30].split(",");
    expect(last[3]).toBe("7"); // 4 + 1 + 2 — کلِ پنجره
  });

  it("روزهایِ خالیِ پنجره = صفرِ صادقانه (سطر حذف نمیشود)", () => {
    const rows = buildMonthCsv({}, T).trimEnd().split("\r\n");
    expect(rows[1]).toBe(`${DAY0},سه‌شنبه,0,0,,`);
    expect(rows[30]).toBe(`${T},چهارشنبه,0,0,0,0`);
  });

  it("کلیدِ بیرونِ پنجره (۳۱ روزِ پیش) نادیده — سقفِ پنجره صادق است", () => {
    const history = { "2026-09-14": st("2026-09-14", 9) };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    expect(rows[1].startsWith(DAY0)).toBe(true);
    expect(rows[1].endsWith(",0,0,,")).toBe(true);
    expect(rows[30].endsWith(",0,0,0,0")).toBe(true);
  });

  it("بازخوانی هم شمرده میشود — هر اتمامِ داستان (منبعِ r299)", () => {
    const history = { [T]: st(T, 3) };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    expect(rows[30]).toBe(`${T},چهارشنبه,3,3,3,3`);
  });

  it("اعداد ASCII + ساختارِ ۶فیلدیِ بی‌نقل‌قول در کلِ فایل", () => {
    const history = { [T]: st(T, 2), "2026-10-13": st("2026-10-13", 11) };
    const csv = buildMonthCsv(history, T);
    for (const row of csv.trimEnd().split("\r\n")) {
      expect(row.split(",")).toHaveLength(6);
    }
    expect(csv).not.toContain('"');
    expect(csv).not.toContain("۱۱");
  });
});

// r312 — دو ستونِ هفت‌روزه: کامل‌شدنِ مقایسهٔ دوهفته‌ای در سطحِ سوم
// (بوم: جملهٔ جهتیِ کارت / اکسلِ هفتگی: r311 / اکسلِ ماهانه: همین‌جا)
describe("month-csv — ستونهایِ هفت‌روزه (r312)", () => {
  it("شش سطرِ اول پنجرهٔ کاملِ هفت‌روزه ندارند → خانهٔ تهیِ صادق، نه صفرِ دروغین", () => {
    const rows = buildMonthCsv({}, T).trimEnd().split("\r\n");
    for (let r = 1; r <= 6; r += 1) {
      expect(rows[r].endsWith(",,")).toBe(true);
    }
    // هفتمین سطر (idx6 = ۲۰۲۶-۰۹-۲۱): اولین پنجرهٔ کامل — بی-پیشینِ درون-فایلی
    expect(rows[7]).toBe("2026-09-21,دوشنبه,0,0,0,");
  });

  it("چهاردهمین سطر اولین تفاوتِ صادق — دو پنجرهٔ ۷روزهٔ غیرهمپوشانِ درون-فایلی", () => {
    // idx13 = ۲۰۲۶-۰۹-۲۸: پنجرهٔ idx7..13 (۵ داستان) در برابرِ idx0..6 (صفر)
    const history = { "2026-09-28": st("2026-09-28", 5) };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    expect(rows[14]).toBe("2026-09-28,دوشنبه,5,5,5,5");
    // سیزدهمین سطر (idx12): پنجرهٔ هفت‌روزه‌اش کامل است (همه‌صفر) اما
    // پنجرهٔ پیشینِ درون-فایلی ندارد → فقط خانهٔ تفاوت تهی است
    expect(rows[13]).toBe("2026-09-27,یکشنبه,0,0,0,");
  });

  it("سطرِ آخر = «جمعِ ۷روزِ آخر در برابرِ ۷روزِ قبلش» — رشدِ +۶", () => {
    // هفتهٔ اخیر (۱۰-۰۸..۱۰-۱۴): ۱+۳+۲=۶ — هفتهٔ قبلش (۱۰-۰۱..۱۰-۰۷): صفر
    const history = {
      "2026-10-08": st("2026-10-08", 1),
      "2026-10-11": st("2026-10-11", 3),
      [T]: st(T, 2),
    };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    const cells = rows[30].split(",");
    expect(cells[4]).toBe("6");
    expect(cells[5]).toBe("6");
  });

  it("افت با مینوسِ ASCII — هم‌حکایتیِ سطرِ آخر با ستونِ تفاوتِ روندِ هفتگی", () => {
    // هفتهٔ قبلش (۱۰-۰۲+۱۰-۰۴): ۱۰ — هفتهٔ اخیر (۱۰-۱۰+۱۰-۱۳): ۳ → افتِ ۷
    const history = {
      "2026-10-02": st("2026-10-02", 4),
      "2026-10-04": st("2026-10-04", 6),
      "2026-10-10": st("2026-10-10", 1),
      "2026-10-13": st("2026-10-13", 2),
    };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    const cells = rows[30].split(",");
    expect(cells[4]).toBe("3");
    expect(cells[5]).toBe("-7"); // مینوسِ ASCII — هم‌قراردادِ r311
  });

  it("پنجره‌ها از سطرهایِ همین جدول مشتق میشوند — هیچ شمارشِ موازیِ بیرونی نیست", () => {
    // جمعِ هفت‌روزهٔ سطرِ آخر باید برابرِ مجموعِ ۷ خانهٔ آخرِ ستونِ داستان‌ها باشد
    const history = {
      "2026-10-09": st("2026-10-09", 2),
      "2026-10-12": st("2026-10-12", 4),
      [T]: st(T, 1),
    };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    const last7Counts = rows
      .slice(24)
      .map((r) => Number(r.split(",")[2]))
      .reduce((s, n) => s + n, 0);
    expect(rows[30].split(",")[4]).toBe(String(last7Counts));
  });
});

describe("month-csv — دانلود", () => {
  it("BOM = U+FEFF فقط رویِ مسیرِ دانلود پیشوند میشود", () => {
    expect(CSV_BOM.charCodeAt(0)).toBe(0xfeff);
    expect(buildMonthCsv({}, T).startsWith("تاریخ")).toBe(true);
  });

  it("SSR: document نیست → false (بدونِ انفجار)", () => {
    expect(typeof document).toBe("undefined");
    expect(downloadMonthCsv({}, T)).toBe(false);
  });
});
