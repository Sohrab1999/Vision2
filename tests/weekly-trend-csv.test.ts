// ------------------------------------------------------------------
// تسک ۱۷۸ — قراردادِ «روندِ ۴هفته‌ای» CSV — برادرِ تازهٔ ۱۶۹ برایِ معلم.
// (r311 — ستونِ «تفاوت با هفتهٔ پیش» اضافه شد: ۱۱ فیلد)
// قفل‌ها:
//   شکل: سرستونِ ۱۱فیلدیِ یخ‌زده · weeks=4 → ۴+۱ سطر · قدیم→نو · پایانِ
//        هر هفته = dayKeyBefore(today, w*7) · CRLFِ خالص
//   مقدارها: تجمیعِ ۷روزه از statOfDay (شاملِ سقوطِ legacy history) ·
//        روزهایِ فعال فقط اگر فعالیت>۰ · روزهایِ هدف از goalMetDays ·
//        هفتهٔ خالی = سطرِ صفرِ صادقانه (نه حذف) · اعدادِ ASCII ·
//        بی‌نقل‌قول · پایانِ هفته‌ها با فاصلهٔ دقیقِ ۷روزه از هم
//   r311 — تفاوت: عددیِ مشتق از همین سطرها (بدونِ سطرِ خلاصهٔ بیرونِ
//        جدول — هم‌قراردادِ جمعِ فزایندهٔ ماه‌نامه) · کهنه‌ترین سطر =
//        خانهٔ تهیِ صادق (نه صفرِ دروغین) · منفی با مینوسِ ASCII
//   دانلود: BOM · نامِ فایلِ لنگر · SSR=false
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  CSV_BOM,
  WEEKLY_TREND_COLUMNS,
  WEEKLY_TREND_WEEKS,
  buildWeeklyTrendCsv,
  downloadWeeklyTrendCsv,
} from "@/lib/progress-csv";

const T = "2026-10-14"; // چهارشنبه

describe("weekly-trend-csv — شکل", () => {
  it("سرستونِ ۱۱فیلدیِ منجمد (r311: + تفاوت با هفتهٔ پیش)", () => {
    expect(WEEKLY_TREND_COLUMNS).toEqual([
      "پایان هفته", "روز", "مرور", "آزمون", "واژهٔ نو", "دیکته", "برق‌آسا",
      "مجموع", "تفاوت با هفتهٔ پیش", "روزهای فعال", "روزهای هدف",
    ]);
  });

  it("۴+۱ سطر؛ امروزی‌ترین هفته آخر با لنگرِ امروز، قدیمی‌ترین اول", () => {
    const rows = buildWeeklyTrendCsv({}, T).trimEnd().split("\r\n");
    expect(rows).toHaveLength(WEEKLY_TREND_WEEKS + 1);
    expect(rows[1].startsWith("2026-09-23")).toBe(true); // T-21
    expect(rows[4].startsWith(T)).toBe(true);
  });

  it("پایانِ هفته‌ها دقیقاً ۷روزه از هم (بدونِ هم‌پوشانی)", () => {
    const rows = buildWeeklyTrendCsv({}, T).trimEnd().split("\r\n");
    const ends = rows.slice(1).map((r) => r.split(",")[0]);
    expect(ends).toEqual(["2026-09-23", "2026-09-30", "2026-10-07", "2026-10-14"]);
  });

  it("weeks=2 → ۳ سطر", () => {
    const rows = buildWeeklyTrendCsv({}, T, 2).trimEnd().split("\r\n");
    expect(rows).toHaveLength(3);
    expect(rows[1].startsWith("2026-10-07")).toBe(true);
  });

  it("CRLFِ خالص + BOMِ خانواده", () => {
    const csv = buildWeeklyTrendCsv({}, T);
    expect(csv.endsWith("\r\n")).toBe(true);
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
    expect(CSV_BOM.charCodeAt(0)).toBe(0xfeff);
  });
});

describe("weekly-trend-csv — مقدارها", () => {
  it("تجمیعِ ۷روزه: شمارنده‌ها + مجموع + روزهایِ فعال — پنجرهٔ هر سطر [پایان-۶..پایان]", () => {
    const dayHistory = {
      "2026-10-14": { reviews: 10, quizzes: 2, words: 3, dictation: 1, rush: 1, stories: 0 },
      "2026-10-12": { reviews: 4 },
      "2026-10-08": { reviews: 100 }, // ابتدایِ پنجرهٔ هفتهٔ آخر (10-08..10-14)
      "2026-10-07": { reviews: 9 },   // در پنجرهٔ هفتهٔ میانی (10-01..10-07)
    } as never;
    const rows = buildWeeklyTrendCsv({ dayHistory }, T).trimEnd().split("\r\n");
    // هفتهٔ آخر (10-08..10-14): مرور=114، آزمون=2، واژه=3، دیکته=1، برق=1، مجموع=121، فعال=3
    // r311 — تفاوتِ با هفتهٔ میانی: 121−9=112
    expect(rows[4]).toBe(`2026-10-14,چهارشنبه,114,2,3,1,1,121,112,3,0`);
    // هفتهٔ میانی (10-01..10-07): فقط 10-07 — هم‌روزِ هفته با امروز (چهارشنبه)
    // r311 — تفاوت با هفتهٔ صفرِ پیش از خود: 9−0=9
    expect(rows[3]).toBe("2026-10-07,چهارشنبه,9,0,0,0,0,9,9,1,0");
    // 10-08 نباید دوباره در هفتهٔ میانی بیفتد (پنجره‌های ناپیوسته)
    expect(rows[3]).not.toContain("114");
  });

  it("سقوطِ legacy history: نقدِ قدیمی هم صادقانه جمع می‌شود", () => {
    const input = {
      history: { "2026-10-13": { reviews: 7, quizzes: 1 } },
    } as never;
    const rows = buildWeeklyTrendCsv(input, T).trimEnd().split("\r\n");
    expect(rows[4]).toBe(`2026-10-14,چهارشنبه,7,1,0,0,0,8,8,1,0`);
  });

  it("روزهایِ هدف از goalMetDays — فقط روزهایِ داخلِ پنجره شمرده می‌شوند", () => {
    const input = {
      dayHistory: { "2026-10-14": { reviews: 2 } } as never,
      goalMetDays: ["2026-10-14", "2026-09-01"], // 09-01 بیرونِ هر ۴ پنجره است
    } as never;
    const rows = buildWeeklyTrendCsv(input, T).trimEnd().split("\r\n");
    expect(rows[4]).toBe(`2026-10-14,چهارشنبه,2,0,0,0,0,2,2,1,1`);
  });

  it("هفتهٔ خالی = سطرِ صفرِ صادقانه — سطر حذف نمی‌شود و '—' نمی‌آید (r311: تنها سطر = تفاوتِ تهی)", () => {
    const rows = buildWeeklyTrendCsv({}, T, 1).trimEnd().split("\r\n");
    expect(rows[1]).toBe(`2026-10-14,چهارشنبه,0,0,0,0,0,0,,0,0`);
  });

  it("ساختار: هر سطر دقیقاً ۱۱ فیلد، هیچ نقل‌قولی نیست، اعداد ASCII", () => {
    const csv = buildWeeklyTrendCsv({ dayHistory: { [T]: { reviews: 30 } } as never }, T);
    for (const row of csv.trimEnd().split("\r\n")) {
      expect(row.split(",")).toHaveLength(11);
    }
    expect(csv).not.toContain('"');
    expect(csv).not.toContain("۳۰");
  });

  // r311 — معناشناسیِ ستونِ تفاوت: کهنه‌ترین = تهیِ صادق، هم‌پا = 0،
  // افت = مینوسِ ASCII، و هر سطر = اختلاف از سطرِ قبلِ خود (نه از امروز)
  it("تفاوت: کهنه‌ترین تهی، هم‌پا صفر، افت با مینوسِ ASCII — از سطرِ قبلِ خود", () => {
    // پنجرهٔ هر سطر [پایان-۶..پایان]: هفته‌ها قدیم→نو: 30، 30 (هم‌پا)، 26 (منفیِ −4)، 26 (هم‌پا)
    const dayHistory = {
      "2026-09-20": { reviews: 30 }, // پنجرهٔ قدیمی‌ترین (09-17..09-23)
      "2026-09-27": { reviews: 30 }, // (09-24..09-30) — هم‌پا
      "2026-10-04": { reviews: 26 }, // (10-01..10-07) — منفی
      "2026-10-11": { reviews: 26 }, // (10-08..10-14) — هم‌پا
    } as never;
    const rows = buildWeeklyTrendCsv({ dayHistory }, T).trimEnd().split("\r\n");
    const deltas = rows.slice(1).map((r) => r.split(",")[8]);
    expect(deltas).toEqual(["", "0", "-4", "0"]);
    // مینوسِ ASCII نه نویسهٔ یونیکدِ دیگر
    expect(rows[3].split(",")[8]).toBe("-4");
  });

  it("تفاوت از تجمیعِ ۷روزهٔ خودِ سطرهاست — سطرِ نوستا با مجموعِ تازه === جفتِ هفته‌نامه (همان حکایت)", () => {
    // امروزِ فعال: 10 مرور + 2 آزمون + 3 واژه = 15 در پنجرهٔ آخر؛ هفتهٔ پیشِ همان فایل = 9
    const dayHistory = {
      "2026-10-14": { reviews: 10, quizzes: 2, words: 3 },
      "2026-10-07": { reviews: 9 },
    } as never;
    const rows = buildWeeklyTrendCsv({ dayHistory }, T).trimEnd().split("\r\n");
    const last = rows[4].split(",");
    expect(last[7]).toBe("15"); // مجموع
    expect(last[8]).toBe("6"); // 15−9 — همان deltaای که کارتِ PNG نشان میدهد
  });
});

describe("weekly-trend-csv — دانلود", () => {
  it("SSR: document نیست → false", () => {
    expect(typeof document).toBe("undefined");
    expect(downloadWeeklyTrendCsv({}, T)).toBe(false);
  });
});
