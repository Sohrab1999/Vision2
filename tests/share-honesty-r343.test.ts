// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadProgressCsv, downloadWeeklyTrendCsv, downloadMonthCsv } from "@/lib/progress-csv";
import { downloadCoverageCsv } from "@/lib/coverage-csv";

// ------------------------------------------------------------------
// r343 — نخستین داوریِ زندهٔ خانوادهٔ CSV و پایِ بومیِ share — قفلهای راند.
//
// رکوردِ زنده (scripts/qa-r343-csv-family.sh — کلیک+کاوشِ اتمیک):
//   ① سه CSVِ هفته‌نامه با تزریقِ URL.createObjectURL→throw: توستِ
//     «خطا در ساخت فایل» ×۳ زنده (TOAST-HIT)، رکوردگرِ لنگر dl=0 —
//     هیچ دانلودی در مسیرِ شکست.
//   ② negctlِ بازگردانی: سه توستِ موفقیت (جدول/روند/ماه‌نامه) + سه لنگرِ
//     واقعی vision2-progress/weekly/month-reading-2026-10-23.csv.
//   ③ coverage CSV — درمانِ دوپایهٔ این راند: شکستِ ساخت دیگر «اول کمی
//     تمرین کن» نمیگوید؛ «خطا در ساخت فایل» (همزبانِ خانواده) زنده شد +
//     بازگردانی ⇒ vision2-coverage-2026-10-23.csv.
//   ④ عکسِ هفته‌نامه/کارنامه: toBlob→null ⇒ «خطا در ساخت تصویر» ×۲ + dl=0؛
//     بازگردانی ⇒ عکسِ هفته‌نامه/کارنامه ذخیره شد + فایلِ واقعی.
//   ⑤ اشتراکِ بیپشتیبانِ هر دو کارت (هدلس canShare ندارد — بدونِ استاب):
//     «هم‌رسانی ممکن نشد» ×۲ و هیچ دانلودی (dl بی‌تغییر).
//   ⑥ ماتریسِ پایِ بومیِ share رویِ گواهی (qa-r343-native-share.sh):
//     AbortError ⇒ سکوتِ مشروع (share:1, wt:0, toasts:none)؛
//     TypeError+کلیپبوردِ سالم ⇒ «✓ نتیجه کپی شد» (wt:1)؛
//     TypeError+کلیپبوردِ مردود ⇒ «خطا در کپی نتیجه» (wt:2).
//   ⑦ تاریکِ درجا: توستِ شکست bg lab(2.75)/ink lab(98.26) — کرنلِ
//     bg-background/text-foreground درست برمیگردد.
//   ⑧ basis-zero: رسمی total:39 suspects=[] · گواهی total:0 suspects=[].
// ------------------------------------------------------------------

const officialSrc = readFileSync(
  join(process.cwd(), "src/components/study/reports/official-report.tsx"),
  "utf8",
);
const weeklySrc = readFileSync(
  join(process.cwd(), "src/components/study/reports/weekly-report.tsx"),
  "utf8",
);
const quizResultSrc = readFileSync(
  join(process.cwd(), "src/components/study/quiz/quiz-result.tsx"),
  "utf8",
);
const csvDriverSrc = readFileSync(
  join(process.cwd(), "scripts/qa-r343-csv-family.sh"),
  "utf8",
);
const nativeDriverSrc = readFileSync(
  join(process.cwd(), "scripts/qa-r343-native-share.sh"),
  "utf8",
);

const T = "2026-10-23";

const minimalCoverage = {
  lessons: [{ id: 1, title: "درسِ آزمون", cells: [{ label: "واژگان", best: 90, at: T }] }],
} as never;

describe("share honesty r343 — خانوادهٔ CSV و پایِ بومی", () => {
  const orig = URL.createObjectURL;
  afterEach(() => {
    URL.createObjectURL = orig;
    vi.restoreAllMocks();
  });

  it("قراردادِ شکستِ چهار درگاهِ CSV: createObjectURL که پرتاب کند ⇒ false و هیچ لنگری کلیک نمیشود", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = (() => {
      throw new TypeError("r343-injected");
    }) as typeof URL.createObjectURL;
    expect(downloadProgressCsv({}, T)).toBe(false);
    expect(downloadWeeklyTrendCsv({ dayHistory: {} }, T)).toBe(false);
    expect(downloadMonthCsv({}, T)).toBe(false);
    expect(downloadCoverageCsv(minimalCoverage, T)).toBe(false);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("قراردادِ موفقیت با createObjectURLِ سالم: لنگر با نامِ درصددارِ لنگرروز کلیک میشود", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = (() => "blob:r343-fake") as typeof URL.createObjectURL;
    expect(downloadProgressCsv({}, T)).toBe(true);
    expect(downloadCoverageCsv(minimalCoverage, T)).toBe(true);
    expect(clickSpy).toHaveBeenCalledTimes(2);
    const names = clickSpy.mock.instances.map(
      (a) => (a as unknown as HTMLAnchorElement).download,
    );
    expect(names[0]).toBe(`vision2-progress-${T}.csv`);
    expect(names[1]).toBe(`vision2-coverage-${T}.csv`);
  });

  it("درمانِ دوپایهٔ coverage: نبودِ پوشش زودبرمیگردد و شکستِ ساخت همزبانِ خانواده میشود", () => {
    const guardAt = officialSrc.indexOf("if (!coverage)");
    const callAt = officialSrc.indexOf("downloadCoverageCsv(coverage");
    const readyAt = officialSrc.indexOf("گزارش پوشش هنوز آماده نیست");
    const failAt = officialSrc.indexOf('title: "خطا در ساخت فایل"');
    expect(guardAt).toBeGreaterThan(-1);
    expect(callAt).toBeGreaterThan(guardAt);
    expect(failAt).toBeGreaterThan(callAt);
    expect(readyAt).toBeGreaterThan(-1);
    // پیامِ «تمرین کن» فقط در پایِ نبودِ پوشش است — پیش از زودبرگشت
    const earlyReturn = officialSrc.slice(guardAt, callAt);
    expect(earlyReturn).toContain("اول کمی تمرین کن");
    expect(officialSrc.slice(callAt)).not.toContain("اول کمی تمرین کن");
  });

  it("سه CSVِ هفته‌نامه زبانِ خانواده را نگه میدارند: شکست = «خطا در ساخت فایل»", () => {
    for (const success of ["جدول CSV ذخیره شد", "روندِ ۴هفته‌ای ذخیره شد", "ماه‌نامهٔ خواندن ذخیره شد"]) {
      expect(weeklySrc).toContain(success);
    }
    const hits = weeklySrc.match(/خطا در ساخت فایل/g) ?? [];
    expect(hits.length).toBeGreaterThanOrEqual(3);
  });

  it("پایِ بومیِ shareResult: مجموعهٔ سکوتِ مشروع دقیقاً {AbortError} است — NotAllowedError به کلیپبورد میافتد", () => {
    const legStart = quizResultSrc.indexOf("typeof navigator.share ===");
    const legEnd = quizResultSrc.indexOf("clipboard-unavailable");
    const leg = quizResultSrc.slice(legStart, legEnd);
    expect(leg).toContain('name === "AbortError"');
    expect(leg).not.toContain("NotAllowedError");
  });

  it("ابزارِ راندِ CSV: تزریقِ COU/blob + رکوردگرِ لنگر + negctlِ بازگردانی + کلیکِ اتمیکِ await-پرامیس", () => {
    expect(csvDriverSrc).toContain("r343-cou-injected");
    expect(csvDriverSrc).toContain("__origCOU");
    expect(csvDriverSrc).toContain("__origToBlob");
    expect(csvDriverSrc).toContain("closest('a[download]')");
    expect(csvDriverSrc).toContain("cou_restore");
    expect(csvDriverSrc).toContain("blob_restore");
    // درسِ اندازهگیریِ راند: پرامیس داخلِ eval awaited میشود — کلیک+کاوش اتمیک
    expect(csvDriverSrc).toContain("new Promise((res)");
    expect(csvDriverSrc).toContain("TOAST-HIT");
    // هر چهار مسیرِ شکست + دو negctlِ بازگردانی در سویپ هست
    expect((csvDriverSrc.match(/TOAST-TIMEOUT|TOAST-HIT/g) ?? []).length).toBeGreaterThan(0);
  });

  it("ابزارِ ماتریسِ بومی: سه سناریو با رکوردگرِ دورِ API (share/wt/shareErrs/wtErrs)", () => {
    expect(nativeDriverSrc).toContain('matrix_click "AbortError" "ok" "SILENCE"');
    expect(nativeDriverSrc).toContain('matrix_click "TypeError" "ok" "نتیجه کپی شد"');
    expect(nativeDriverSrc).toContain('matrix_click "TypeError" "deny" "خطا در کپی نتیجه"');
    expect(nativeDriverSrc).toContain("shareErrs");
    expect(nativeDriverSrc).toContain("wtErrs");
    expect(nativeDriverSrc).toContain("NotAllowedError"); // استابِ writeTextِ مردود
  });
});
