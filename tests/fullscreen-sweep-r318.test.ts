import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// r318 — پیمایشِ «سطحهایِ تمامصفحه»: خانوادهٔ سومِ قراردادِ «کاغذِ پاک»
//   (r316 کارنامه · r317 هفت دیالوگ · r318 آنبوردینگ + زبانههایِ درس + نماهایِ ابزار)
// یافتهٔ واقعیِ راند: سه راهاندازِ «واژههای من» در ۳۹۰px دامِ flex-basisِ صفر
// گرفتند (min-w-0 + flex-1 → متن تا ۴۸px له شد؛ h2 تا ۳۴px بیرون زد و
// overflowhidden سکشن بریدش). کلاسِ مشروعِ پنجم هم همینجا قفل میشود: deco_bleed
// — خونِ تزئینیِ مهارشده (نشانِ آبی / بولت / هالهٔ glow) که در RTL سمتِ چپ
// scrollWidth را باد میدهد ولی عمداً با overflowhidden بریده میشود.

const sweepJs = readFileSync(join(process.cwd(), "scripts", "r317-sweep.js"), "utf8");
const sweepSh = readFileSync(join(process.cwd(), "scripts", "qa-r318-fullscreen-sweep.sh"), "utf8");
const review = readFileSync(
  join(process.cwd(), "src", "components", "study", "practice", "my-words-review.tsx"),
  "utf8",
);
const flashcards = readFileSync(
  join(process.cwd(), "src", "components", "study", "practice", "my-words-flashcards.tsx"),
  "utf8",
);
const dictation = readFileSync(
  join(process.cwd(), "src", "components", "study", "practice", "my-words-dictation.tsx"),
  "utf8",
);

describe("fullscreen sweep r318 — the clean-paper contract reaches every full-screen surface", () => {
  it("classifier now knows all five legitimate horizontal overflow classes", () => {
    // ۱ scroller · ۲ truncate · ۳ transform · ۴ sr_only · ۵ deco_bleed (r318)
    expect(sweepJs).toContain('"scroller"');
    expect(sweepJs).toContain('"truncate"');
    expect(sweepJs).toContain('"transform"');
    expect(sweepJs).toContain('"sr_only"');
    expect(sweepJs).toContain('"deco_bleed"');
  });

  it("deco_bleed is honest: bleeding in-flow text stays a bug, decorations pass", () => {
    // نشانِ پایدارِ تزئین = زیردرختِ aria-hidden (بولت خودش aria-hidden دارد؛
    // svg و pathِ داخلش هم با همان زیردرخت خموشاند). pointer-events هرگز
    // نباید وارد داوری شود: ارث‌بری است و framer-motion روی رپرِ نمایِ
    // درحالانیمیشن خطیِ آن را میگذارد — بینِ رانها ناپایدار بود (درسِ راند).
    expect(sweepJs).toContain("const silenced");
    expect(sweepJs).toContain('n.getAttribute("aria-hidden") === "true"');
    expect(sweepJs).toContain("pointer-events is INHERITED");
    // عنصرِ display:none با rectِ صفر از آزمونِ لبه رد میشود ولی خون نیست — حذف میشود
    expect(sweepJs).toContain('if (getComputedStyle(k).display === "none") return false;');
    // درسِ RTL: خونِ چپ هم به scrollWidth میرود — قاعده باید هر دو سمت را ببیند
    expect(sweepJs).toContain("kr.left < er.left - 1");
  });

  it("my-words launchers keep the min-content floor — the flex-basis-zero trap stays closed", () => {
    // سنجشِ پیش از ترمیم (۳۹۰px): «مرور نشان‌شده‌ها» ۸۲px در خانهٔ ۴۸px (over=۳۴)،
    // «فلش‌کارت واژه‌های من» ۷۰px (over=۲۲)، «دیکتهٔ ستاره‌ها» ۵۶px (over=۸) —
    // واحدِ بودجه پیکسل است نه نویسه (درسِ r316).
    for (const src of [review, flashcards, dictation]) {
      expect(src).not.toContain("min-w-0 flex-1");
      expect(src).toContain('className="flex-1"');
    }
    // قرارداد در کامنتِ خودِ کد ثبت است تا ترمیمِ ناخواسته هشدار دهد
    expect(review).toContain("flex-basis");
    expect(flashcards).toContain("r318");
    expect(dictation).toContain("r318");
  });

  it("sweep covers 19 light + 4 dark + 4 desktop full-screen surfaces with real-user navigation", () => {
    // ناوبریِ واقعی: کلیکِ کارتِ ابزار / قفسهٔ کتاب / زبانهٔ درس — نه dispatch داخلی
    for (const fn of ["click_tool()", "open_spine()", "click_tab()", "reload_home()"]) {
      expect(sweepSh).toContain(fn);
    }
    // فازِ روشن = ۱۹ سنجش: ۱ آنبوردینگ + ۸ زبانهٔ درس ۱ + ۱ جزوهٔ درس ۱۰ + ۹ ابزار
    expect(sweepSh).toContain('sweep \'[role=dialog]\' "onboarding-390"');
    expect(sweepSh).toContain('sweep main "lesson1:$tab"');
    expect(sweepSh).toContain('sweep main "lesson10:booklet"');
    expect(sweepSh).toContain('sweep main "tool:$t"');
    // نُه نمایِ ابزارِ فازِ روشن — یک حلقه، نهُ عنوان
    const lightTools = [
      "دیکشنری جستجو",
      "واژه‌های من",
      "آزمون جامع",
      "گوشهٔ کنکور",
      "متروی گرامر",
      "مرور سریع قبل امتحان",
      "ضمیمهٔ کتاب",
      "تمرین هوشمند",
      "کتاب‌خانهٔ داستان‌ها",
    ];
    for (const t of lightTools) expect(sweepSh).toContain(`"${t}"`);
    expect((sweepSh.match(/^for t in /gm) ?? []).length).toBe(3); // روشن + تاریک + دسکتاپ
    // چهار سطحِ تاریک و چهار دسکتاپ (حلقههایِ مجزا)
    expect(sweepSh).toContain('for t in "دیکشنری جستجو" "آزمون جامع" "ضمیمهٔ کتاب" "کتاب‌خانهٔ داستان‌ها"; do');
    expect(sweepSh).toContain('for t in "آزمون جامع" "گوشهٔ کنکور" "ضمیمهٔ کتاب" "کتاب‌خانهٔ داستان‌ها"; do');
    // تمِ تاریک از next-themes میآید (کلیدِ theme) — نه کلاسِ دستیِ میانِ راندها
    expect(sweepSh).toContain("localStorage.setItem('theme','dark')");
    // زبانههایِ درسِ ۱ — هشت بخشِ کامل (سطرِ دقیقِ حلقه؛ دو برچسبِ نیمفاصله‌دار کوتیشن میگیرند)
    expect(sweepSh).toContain('for tab in واژگان مکالمه ریدینگ گرامر نگارش دیکته "تست‌ها" "مترادف و متضاد"; do');
    // جزوه فقط در درسهای ۱۰-۱۲ — قفسهٔ L10 سنجیده میشود
    expect(sweepSh).toContain("open_spine L10");
  });

  it("the judged-negligible onboarding 2px clip is recorded, not silently dropped", () => {
    // داوریِ دستیِ راند: دکمهٔ آواتارِ ۴۴px فقط ۲.۲px لبهٔ سایه در جعبهٔ تنگ میبُرد —
    // بیآسیب و بدونِ افتِ متن؛ v_cand همان کاندیدای صادق میماند (hidden_clip).
    expect(sweepJs).toContain('"hidden_clip"');
  });
});
