import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isAssertiveToast } from "@/lib/announcer";

// ------------------------------------------------------------------
// r341 — سویپِ زندهٔ «مسیرِ تصویرِ نتیجه و اشتراک» — قفلهایِ راند.
//
// رکوردِ زنده (scripts/qa-r341-share-sweep.sh + qa-r341-share-refix.sh):
//   ① دانلودِ canvas در هر دو تم و هر دو کارت (گواهی/استاندارد) سالم:
//     dl=vision2-result-<percent>.png + توستِ «🖼 تصویر نتیجه ذخیره شد» —
//     سطحِ توست bg-background/text-foreground در تاریک درست برمیگردد
//     (روشن lab(100)/lab(2.75) · تاریک lab(2.75)/lab(98.26)) — probed
//     ۳۰۰/۲۹۵ fails=0.
//   ② یگانهٔ مردودِ راند: اشتراک با کلیپبوردِ بیاجازه «ساکت» بود —
//     catchِ فراگیرِ قدیمی «Failed to execute 'writeText'... permission
//     denied» را انصرافِ کاربر جلوه میداد و هیچ بازخوردی نمیآمد
//     (toast-probe found:false ×۲ در هر دو تم).
//   ③ درمانِ زندهتاییدشده: دو پا، دو قضاوت — AbortError = انصرافِ واقعی
//     (سکوتِ مشروع)؛ شکستِ کلیپبورد = توستِ صادقانهٔ «خطا در کپی نتیجه»
//     با راهنمایِ دانلود (پس از درمان: found:true ×۲، fails=0).
// ------------------------------------------------------------------

const quizResultSrc = readFileSync(
  join(process.cwd(), "src/components/study/quiz/quiz-result.tsx"),
  "utf8",
);
const resultImageSrc = readFileSync(
  join(process.cwd(), "src/lib/result-image.ts"),
  "utf8",
);
const sweepSrc = readFileSync(
  join(process.cwd(), "scripts/qa-r341-share-sweep.sh"),
  "utf8",
);

describe("share honesty r341 — دو پا، دو قضاوت", () => {
  it("قراردادِ کهنهٔ ساکت حذف شده — هیچ catchِ فراگیریِ با فرضِ «انصرافِ کاربر» باقی نمانده", () => {
    expect(quizResultSrc).not.toContain("user cancelled share");
    // پاهای مجزا: share بومی و کلیپبورد هر یک قضاوتِ خود را دارند
    expect(quizResultSrc).toContain("AbortError");
    expect(quizResultSrc).toContain("clipboard-unavailable");
  });

  it("پایِ shareِ بومی: فقط AbortError سکوتِ مشروع است — خطایِ دیگر به کلیپبورد میافتد", () => {
    const leg = quizResultSrc.slice(
      quizResultSrc.indexOf("typeof navigator.share ==="),
      quizResultSrc.indexOf("clipboard-unavailable"),
    );
    expect(leg).toContain("navigator.share");
    expect(leg).toContain('name === "AbortError"');
    expect(leg).toContain("return");
  });

  it("پایِ کلیپبورد: گاردِ دردسترس بودن + جفتِ توستِ صادقانه", () => {
    expect(quizResultSrc).toContain(
      "typeof navigator.clipboard.writeText !==",
    );
    expect(quizResultSrc).toContain("✓ نتیجه کپی شد");
    expect(quizResultSrc).toContain("خطا در کپی نتیجه");
    // راهنمایِ جایگزین — دانلودِ تصویر بهعنوانِ مسیرِ برونرفت
    expect(quizResultSrc).toContain("دانلود تصویر نتیجه");
  });

  it("توستِ خطایِ تازه از کانالِ assertive میگذرد (قراردادِ Task 171)", () => {
    expect(isAssertiveToast("خطا در کپی نتیجه")).toBe(true);
    expect(isAssertiveToast("✓ نتیجه کپی شد")).toBe(false);
    expect(isAssertiveToast("🖼 تصویر نتیجه ذخیره شد")).toBe(false);
  });

  it("دکمهٔ اشتراک فقط روی کارتِ گواهی است — کارتِ استاندارد سه CTA دارد (r341: ctas=3 زنده)", () => {
    const shareCalls = quizResultSrc.match(/onClick=\{shareResult\}/g) || [];
    expect(shareCalls.length).toBe(1);
    const certIdx = quizResultSrc.indexOf("const certificateCard");
    const stdIdx = quizResultSrc.indexOf("const standardCard");
    const stdBody = quizResultSrc.slice(stdIdx);
    expect(stdBody).not.toContain("onClick={shareResult}");
    expect(certIdx).toBeGreaterThan(-1);
    expect(stdIdx).toBeGreaterThan(certIdx);
  });

  it("نامِ فایلِ دانلود درصدِ واقعی را حمل میکند — رکوردِ زنده: vision2-result-10.png", () => {
    expect(resultImageSrc).toContain("`vision2-result-${opts.percent}.png`");
  });

  it("ابزارِ راند: toast-probe توستِ رادیکس را با data-state=open میبیند و سویپ رکوردِ دو-پا را میدارد", () => {
    const probeSrc = readFileSync(
      join(process.cwd(), "scripts/r341-toast-probe.js"),
      "utf8",
    );
    expect(probeSrc).toContain('li[data-state="open"]');
    expect(sweepSrc).toContain("install_recorders");
    expect(sweepSrc).toContain("__r341share");
    expect(sweepSrc).toContain("__r341dl");
    // negctlِ دقیقِ r339 — جوهرِ کاشتهشده باید در failsList دیده شود
    expect(sweepSrc).toContain("110, 231, 183");
  });
});
