import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// r321 — پیلِ روزِ نمودارِ هفتگی: اولین یافتهٔ واقعیِ شکارِ basis-صفر پس از
//   ترمیمهایِ r318 — و کشفِ کورسو (پنلهایِ hasProgress با seedِ تازه رندر
//   نمیشوند؛ نمودار فقط برایِ یادگیرندهٔ دارایِ پیشرفت میآید — نخستین
//   کاربرِ واقعیِ اپ این باگ را میديد و هیچ پیمایشِ پیشین آن را ندیده بود).
//
//   سنجشِ زندهٔ ۳۹۰px (پیش از ترمیم): ستونها ۳۹px؛ پیلِ نامِ کامل
//   truncate داشت ولی در flex-col با items-center کفِ عرضی نمیگرفت —
//   جعبه تا عرضِ متن باز میشد و truncate هرگز درگیر نمیشد:
//
//   روز        | عرضِ پیل | سرریز
//   -----------+----------+-------
//   جمعه       | ۳۹       | ۰
//   شنبه       | ۳۹       | ۰
//   یکشنبه     | ۴۳       | +۴
//   دوشنبه     | ۴۳       | +۴
//   سه‌شنبه    | ۴۶       | +۷
//   چهارشنبه   | ۴۹       | +۱۰
//   امروز      | ۴۰       | +۱
//
//   خونِ متقارن (items-center) در گپِ ۶px — «سه‌شنبه» و «چهارشنبه» با
//   همسایههایشان تصادف میکردند (خانوادهٔ چسبیدگیِ سرستونهایِ r316).
//
//   ترمیم — الگویِ دقیقِ r316 (یک منبع، دو سطح، دسکتاپ بیت‌همسان):
//   موبایل حرفِ ابتدایِ رسمیِ تقویمهایِ فارسی (ش ی د س چ پ ج)؛ دسکتاپ
//   با sm: نامِ کامل؛ کفِ max-w-full + tooltipِ نامِ کامل؛ px-1 (بهجای
//   px-1.5) تا «امروز»یِ ۴۰px هم بیکلمپ جا شود.

const dayEngine = readFileSync(join(process.cwd(), "src", "state", "day-engine.ts"), "utf8");
const chart = readFileSync(join(process.cwd(), "src", "components", "study", "practice", "weekly-chart.tsx"), "utf8");

describe("weekday pill r321 — the weekly chart axis stops bleeding at 390px", () => {
  it("FA_WEEKDAY_INITIAL is the exact seven-letter calendar convention", () => {
    // قفلِ دقیقِ هقمقدار — واحدِ بودجه پیکسل است نه نویسه (درسِ r316):
    // «چهارشنبه» = ۴۹px در ستونِ ۳۹px، «چ» = ~۱۴px — هر دو همیشه جا میشوند.
    expect(dayEngine).toContain('"یکشنبه": "ی"');
    expect(dayEngine).toContain('"دوشنبه": "د"');
    expect(dayEngine).toContain('"سه‌شنبه": "س"');
    expect(dayEngine).toContain('"چهارشنبه": "چ"');
    expect(dayEngine).toContain('"پنجشنبه": "پ"');
    expect(dayEngine).toContain('"جمعه": "ج"');
    expect(dayEngine).toContain('"شنبه": "ش"');
    // نامهایِ کاملِ lastNDays دستنخوردهاند — CSV/کارنامه/عنوانِ میلهها همانها
    expect(dayEngine).toContain('const weekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];');
  });

  it("the pill finally has a width floor — truncate can engage as the safety net", () => {
    // ریشهٔ باگ: truncate بدونِ max-w-full در flex-col با items-center هیچ
    // جعبه‌ای برای بریدن ندارد — جعبه تا عرضِ متن باز میشد
    // r324 — shrink-0 هم اضافه شد: دامِ این بار عمودی بود (روزِ اوجِ هفته
    // پیل را تا ۴px له میکرد) — لیبلِ روز دیگر هیچگز جذب‌کنندهٔ flex نیست
    expect(chart).toContain("mt-2 max-w-full shrink-0 truncate rounded-full px-1 py-0.5");
    // px-1 نه px-1.5: «امروز»یِ ۴۰px در ستونِ ۳۹px بیکلمپ جا شود
    expect(chart).not.toContain("rounded-full px-1.5 py-0.5 text-[10px]");
  });

  it("one source, two levels — mobile initial, desktop full name", () => {
    // دارو فقط به سطحِ بیمار (درسِ r316): دسکتاپ که جا دارد نامِ کامل میبیند
    expect(chart).toContain('<span className="sm:hidden">{FA_WEEKDAY_INITIAL[d.weekday] ?? d.weekday}</span>');
    expect(chart).toContain('<span className="hidden sm:inline">{d.weekday}</span>');
    // tooltipِ نامِ کامل برایِ موبایل؛ «امروز» بی‌tooltip
    expect(chart).toContain('title={d.isToday ? undefined : d.weekday}');
  });

  it("the audit driver now carries a has-progress home visit — the blind spot stays closed", () => {
    // این یافته فقط چون دیده شد که یادگیرندهای پیشرفت داشت؛ رانندهٔ r319
    // حالا خودش نسخهٔ hasProgressِ home را میسنجد
    const driver = readFileSync(join(process.cwd(), "scripts", "qa-r319-basis-zero.sh"), "utf8");
    expect(driver).toContain('audit "home-progress"');
  });
});
