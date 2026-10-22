// ------------------------------------------------------------------
// r305 — ماه‌نامهٔ خواندن (CSVِ معلم‌نگر): برشِ ۳۰روزهٔ داستان‌ها.
// منبعِ یگانه: monthReads (قراردادِ خالصِ r304) — همین تابعی که نوارِ
// ماه‌نامهٔ DOM و کارتِ PNG میخوانند؛ هیچ شمارشِ موازی‌ای نیست.
// قراردادِ خانوادهٔ CSV (یک زبان با ۱۶۹/۱۷۸):
//   · سطرِ سرِ یخ‌زده · ۳۰+۱ سطر · قدیم→نو با لنگرِ امروز · CRLF
//   · روزِ خالی = صفرِ صادقانه (سطر حذف نمیشود) · اعدادِ ASCII
//   · ۴ فیلد در هر سطر، هیچ نقل‌قولی نیست
//   · جمعِ فزاینده: سطرِ آخر = خودِ جمعِ ماه (بدونِ سطرِ خلاصهٔ خارجِ جدول)
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
  it("سطرِ سرِ یخ‌زده: ترتیبِ ۴ستونیِ منجمد", () => {
    expect(MONTH_CSV_COLUMNS).toEqual(["تاریخ", "روز هفته", "داستان‌ها", "جمعِ فزاینده"]);
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
    expect(rows[27]).toBe("2026-10-11,یکشنبه,3,3");
    expect(rows[28]).toBe("2026-10-12,دوشنبه,0,3");
    expect(rows[29]).toBe("2026-10-13,سه‌شنبه,1,4");
    expect(rows[30]).toBe(`${T},چهارشنبه,2,6`);
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
    expect(rows[1]).toBe(`${DAY0},سه‌شنبه,0,0`);
    expect(rows[30]).toBe(`${T},چهارشنبه,0,0`);
  });

  it("کلیدِ بیرونِ پنجره (۳۱ روزِ پیش) نادیده — سقفِ پنجره صادق است", () => {
    const history = { "2026-09-14": st("2026-09-14", 9) };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    expect(rows[1].startsWith(DAY0)).toBe(true);
    expect(rows[1].endsWith(",0,0")).toBe(true);
    expect(rows[30].endsWith(",0,0")).toBe(true);
  });

  it("بازخوانی هم شمرده میشود — هر اتمامِ داستان (منبعِ r299)", () => {
    const history = { [T]: st(T, 3) };
    const rows = buildMonthCsv(history, T).trimEnd().split("\r\n");
    expect(rows[30]).toBe(`${T},چهارشنبه,3,3`);
  });

  it("اعداد ASCII + ساختارِ ۴فیلدیِ بی‌نقل‌قول در کلِ فایل", () => {
    const history = { [T]: st(T, 2), "2026-10-13": st("2026-10-13", 11) };
    const csv = buildMonthCsv(history, T);
    for (const row of csv.trimEnd().split("\r\n")) {
      expect(row.split(",")).toHaveLength(4);
    }
    expect(csv).not.toContain('"');
    expect(csv).not.toContain("۱۱");
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
