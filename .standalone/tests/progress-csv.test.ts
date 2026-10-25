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
// r314 — زبانِ دوهفته‌ای در هر سه اکسل: ۸→۱۰ ستون (+جمعِ هفت‌روزه،
//   +تفاوت با هفت‌روزهٔ پیش) — همان الگویِ r312 در ماه‌نامه: پنجرهها از
//   سطرهایِ خودِ جدول مشتق میشوند، شش سطرِ اول بی‌پنجرهٔ کامل (خانهٔ
//   تهیِ صادق)، چهاردهمین سطر اولین تفاوتِ صادق، افت با مینوسِ ASCII؛
//   و واحدِ این جدول (پنج شمارنده) همان واحدِ نوارِ کارتهاست — سطرِ
//   آخر با weekStripSums می‌سنجد (آزمونِ پیوندیِ three-level-r313).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { CSV_BOM } from "@/lib/file-download"; // r399 — BOM تکخانه شد (مالک)
import {
  PROGRESS_CSV_COLUMNS,
  PROGRESS_CSV_DAYS,
  buildProgressCsv,
  downloadProgressCsv,
} from "@/lib/progress-csv";

const T = "2026-10-14"; // چهارشنبه

const day = (n: number, reviews: number, quizzes = 0) =>
  ({ day: n, reviews, quizzes, words: 0, dictation: 0, rush: 0, stories: 0 });

describe("progress-csv — شکل (rebuilt task-169 contract)", () => {
  it("سطرِ سرِ یخ‌زده: ترتیبِ ۱۰ستونیِ منجمد (r314: +دو ستونِ هفت‌روزه)", () => {
    expect(PROGRESS_CSV_COLUMNS).toEqual([
      "تاریخ", "روز هفته", "مرور", "آزمون", "واژهٔ نو", "دیکته", "برق‌آسا", "مجموع",
      "جمعِ هفت‌روزه", "تفاوت با هفت‌روزهٔ پیش",
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
    expect(rows[1]).toBe(`${T},چهارشنبه,12,3,4,2,1,22,,`);
  });

  it("نرمال‌سازیِ ناقصِ legacy: فیلدِ غایب = صفر (نه NaN)", () => {
    const history = { [T]: { day: T, reviews: 5 } } as never;
    const rows = buildProgressCsv(history, T, 1).trimEnd().split("\r\n");
    expect(rows[1]).toBe(`${T},چهارشنبه,5,0,0,0,0,5,,`);
  });

  it("روزهایِ خالیِ پنجره = صفرِ صادقانه (سطر حذف نمی‌شود)", () => {
    const history = { [T]: day(0, 1) } as never;
    const rows = buildProgressCsv(history, T, 3).trimEnd().split("\r\n");
    expect(rows[1]).toBe("2026-10-12,دوشنبه,0,0,0,0,0,0,,");
    expect(rows[2]).toBe("2026-10-13,سه‌شنبه,0,0,0,0,0,0,,");
    expect(rows[3]).toBe(`${T},چهارشنبه,1,0,0,0,0,1,,`);
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

  it("ساختار: هر سطر دقیقاً ۱۰ فیلد، هیچ نقل‌قولی در کلِ فایل نیست", () => {
    const history = { [T]: { day: T, reviews: 9, quizzes: 2 } } as never;
    const csv = buildProgressCsv(history, T);
    for (const row of csv.trimEnd().split("\r\n")) {
      expect(row.split(",")).toHaveLength(10);
    }
    expect(csv).not.toContain('"');
  });
});

// r314 — دو ستونِ هفت‌روزه: کامل‌شدنِ زبانِ دوهفته‌ای در هر سه اکسل
// (بوم: جملهٔ جهتیِ کارت / اکسلِ ۳۵روزه: همین‌جا / اکسلِ ماهانه: r312)
describe("progress-csv — ستونهایِ هفت‌روزه (r314)", () => {
  it("شش سطرِ اول پنجرهٔ کاملِ هفت‌روزه ندارند → خانهٔ تهیِ صادق، نه صفرِ دروغین", () => {
    const rows = buildProgressCsv({}, T).trimEnd().split("\r\n");
    for (let r = 1; r <= 6; r += 1) {
      expect(rows[r].endsWith(",,")).toBe(true);
    }
    // هفتمین سطر: اولین پنجرهٔ کامل — بی-پیشینِ درون-فایلی → فقط تفاوت تهی است
    expect(rows[7]).toBe("2026-09-16,چهارشنبه,0,0,0,0,0,0,0,");
  });

  it("چهاردهمین سطر اولین تفاوتِ صادق — دو پنجرهٔ ۷روزهٔ غیرهمپوشانِ درون-فایلی", () => {
    // rows[14] = امروز−۲۱ (۲۰۲۶-۰۹-۲۳): پنجرهٔ rows[8..14] در برابرِ rows[1..7]
    const history = {
      "2026-09-23": day(0, 5),
    } as never;
    const rows = buildProgressCsv(history, T).trimEnd().split("\r\n");
    expect(rows[14]).toBe("2026-09-23,چهارشنبه,5,0,0,0,0,5,5,5");
  });

  it("سطرِ آخر = «جمعِ ۷روزِ آخر در برابرِ ۷روزِ قبلش» — رشد", () => {
    // هفتهٔ اخیر (۱۰-۰۸..۱۰-۱۴): 2+4+1=7 — هفتهٔ قبلش: 1+3=4 → رشدِ ۳
    const history = {
      "2026-10-01": day(0, 1),
      "2026-10-03": day(0, 3),
      "2026-10-08": day(0, 2),
      "2026-10-10": day(0, 4),
      [T]: day(0, 1),
    } as never;
    const rows = buildProgressCsv(history, T).trimEnd().split("\r\n");
    const cells = rows[35].split(",");
    expect(cells[8]).toBe("7");
    expect(cells[9]).toBe("3");
  });

  it("افت با مینوسِ ASCII", () => {
    // هفتهٔ قبلش: 10 — هفتهٔ اخیر: 3 → افتِ ۷
    const history = {
      "2026-10-02": day(0, 4),
      "2026-10-04": day(0, 6),
      "2026-10-10": day(0, 1),
      "2026-10-13": day(0, 2),
    } as never;
    const rows = buildProgressCsv(history, T).trimEnd().split("\r\n");
    const cells = rows[35].split(",");
    expect(cells[8]).toBe("3");
    expect(cells[9]).toBe("-7");
  });

  it("پنجرهها از سطرهایِ خودِ جدول مشتق میشوند — با daysِ کوتاهِ سفارشی هم", () => {
    // جمعِ هفت‌روزهٔ سطرِ آخر = مجموعِ ۷ خانهٔ آخرِ ستونِ مجموع
    const history = {
      "2026-10-09": day(0, 2),
      "2026-10-12": day(0, 4),
      [T]: day(0, 1),
    } as never;
    const rows = buildProgressCsv(history, T).trimEnd().split("\r\n");
    const last7Totals = rows
      .slice(29)
      .map((r) => Number(r.split(",")[7]))
      .reduce((s, n) => s + n, 0);
    expect(rows[35].split(",")[8]).toBe(String(last7Totals));
    // days=7: فقط سطرِ هفتم پنجرهٔ کامل دارد و تفاوتش تهی است
    const short = buildProgressCsv({}, T, 7).trimEnd().split("\r\n");
    expect(short[7]).toBe("2026-10-14,چهارشنبه,0,0,0,0,0,0,0,");
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
