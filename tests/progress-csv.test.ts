// ------------------------------------------------------------------
// تسک ۱۷۸ — بازسازیِ قراردادِ CSVِ ۳۵روزه (تسک ۱۶۹ — نسخهٔ ریموت فقط
// رویِ GitHub زنده بود؛ درختِ محلی پسِ رول‌بک آن را گم کرده بود).
// قفل‌ها (طبقِ ثبتِ کارنامِ ۱۶۹ در worklog):
//   شکل: سطرِ سرِ یخ‌زده · ۳۵+۱ سطر · قدیم→نو با لنگرِ امروز · CRLF بدونِ
//        LFِ لخت · هفت‌روزه‌سازی (days=7 → ۸ سطر) · عبور از مرزِ ماه
//   مقدارها: شمارنده‌ها سرِ جای خود + مجموع · نرمال‌سازیِ ناقصِ legacy
//        (فیلدِ غایب = صفر) · پرشدنِ روزهایِ خالی با صفرِ صادقانه ·
//        هفتهٔ فارسی (چهارشنبه/سه‌شنبه) · اعدادِ ASCII · ساختارِ ۸فیلدی
//        بی‌نقل‌قول
//   دانلود: BOM=U+FEFF · نامِ فایلِ لنگر · SSR=false
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  CSV_BOM,
  PROGRESS_CSV_COLUMNS,
  PROGRESS_CSV_DAYS,
  buildProgressCsv,
  downloadProgressCsv,
} from "@/lib/progress-csv";

const T = "2026-10-14"; // چهارشنبه

const day = (n: number, reviews: number, quizzes = 0) =>
  ({ day: n, reviews, quizzes, words: 0, dictation: 0, rush: 0, stories: 0 });

describe("progress-csv — شکل (rebuilt task-169 contract)", () => {
  it("سطرِ سرِ یخ‌زده: ترتیبِ ۸ستونیِ منجمد", () => {
    expect(PROGRESS_CSV_COLUMNS).toEqual([
      "تاریخ", "روز هفته", "مرور", "آزمون", "واژهٔ نو", "دیکته", "برق‌آسا", "مجموع",
    ]);
  });

  it("۳۵+۱ سطر؛ آخرین سطر امروزِ لنگر است (قدیم → نو)", () => {
    const csv = buildProgressCsv({}, T);
    const rows = csv.trimEnd().split("\r\n");
    expect(rows).toHaveLength(PROGRESS_CSV_DAYS + 1);
    expect(rows[1].startsWith("2026-09-10")).toBe(true);
    expect(rows[35].startsWith(T)).toBe(true);
  });

  it("هفت‌روزه‌سازی: days=7 → ۸ سطر", () => {
    const rows = buildProgressCsv({}, T, 7).trimEnd().split("\r\n");
    expect(rows).toHaveLength(8);
    expect(rows[1].startsWith("2026-10-08")).toBe(true);
  });

  it("عبور از مرزِ ماه: ۲۰۲۶-۰۲-۲۸ → ۰۳-۰۱ (۲۰۲۶ نَکبیس، بدونِ ۲۹)", () => {
    const rows = buildProgressCsv({}, "2026-03-01", 3).trimEnd().split("\r\n");
    expect(rows[1].startsWith("2026-02-27")).toBe(true);
    expect(rows[2].startsWith("2026-02-28")).toBe(true);
    expect(rows[3].startsWith("2026-03-01")).toBe(true);
  });

  it("CRLF در همه‌جا — بدونِ LFِ لخت", () => {
    const csv = buildProgressCsv({}, T);
    expect(csv).toContain("\r\n");
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});

describe("progress-csv — مقدارها", () => {
  it("شمارنده‌ها سرِ جای خود + مجموع", () => {
    const history = { [T]: { day: T, reviews: 12, quizzes: 3, words: 4, dictation: 2, rush: 1, stories: 0 } } as never;
    const rows = buildProgressCsv(history, T, 1).trimEnd().split("\r\n");
    expect(rows[1]).toBe(`${T},چهارشنبه,12,3,4,2,1,22`);
  });

  it("نرمال‌سازیِ ناقصِ legacy: فیلدِ غایب = صفر (نه NaN)", () => {
    const history = { [T]: { day: T, reviews: 5 } } as never;
    const rows = buildProgressCsv(history, T, 1).trimEnd().split("\r\n");
    expect(rows[1]).toBe(`${T},چهارشنبه,5,0,0,0,0,5`);
  });

  it("روزهایِ خالیِ پنجره = صفرِ صادقانه (سطر حذف نمی‌شود)", () => {
    const history = { [T]: day(0, 1) } as never;
    const rows = buildProgressCsv(history, T, 3).trimEnd().split("\r\n");
    expect(rows[1]).toBe("2026-10-12,دوشنبه,0,0,0,0,0,0");
    expect(rows[2]).toBe("2026-10-13,سه‌شنبه,0,0,0,0,0,0");
    expect(rows[3]).toBe(`${T},چهارشنبه,1,0,0,0,0,1`);
  });

  it("هفتهٔ فارسیِ درست: ۱۳ اکتبر سه‌شنبه (با نیم‌فاصلهٔ سه‌شنبه)", () => {
    const rows = buildProgressCsv({}, T, 2).trimEnd().split("\r\n");
    expect(rows[1].startsWith("2026-10-13,سه‌شنبه")).toBe(true);
  });

  it("اعداد ASCII — اکسل بتواند حساب کند", () => {
    const history = { [T]: { day: T, reviews: 12 } } as never;
    const rows = buildProgressCsv(history, T, 1).trimEnd().split("\r\n");
    expect(rows[1]).toContain(",12,");
    expect(rows[1]).not.toContain("۱۲");
  });

  it("ساختار: هر سطر دقیقاً ۸ فیلد، هیچ نقل‌قولی در کلِ فایل نیست", () => {
    const history = { [T]: { day: T, reviews: 9, quizzes: 2 } } as never;
    const csv = buildProgressCsv(history, T);
    for (const row of csv.trimEnd().split("\r\n")) {
      expect(row.split(",")).toHaveLength(8);
    }
    expect(csv).not.toContain('"');
  });
});

describe("progress-csv — دانلود", () => {
  it("BOM = U+FEFF رویِ متنِ ساخته‌شده در ابتدایِ فایلِ دانلودی", () => {
    // BOM پیش از سطرِ سر، فقط در مسیرِ دانلود پیشوند می‌شود
    expect(CSV_BOM).toBe("\uFEFF");
    expect(CSV_BOM.charCodeAt(0)).toBe(0xfeff);
    expect(buildProgressCsv({}, T, 1).startsWith("تاریخ")).toBe(true);
  });

  it("SSR: document نیست → false (بدونِ انفجار)", () => {
    // در vitestِ node-environment این فایل، document وجود ندارد
    expect(typeof document).toBe("undefined");
    expect(downloadProgressCsv({}, T)).toBe(false);
  });
});
