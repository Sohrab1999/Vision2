// ------------------------------------------------------------------
// r316 — قفلهایِ منبعِ «پیمایشِ سرریز» (درسِ r315: سرریزِ پنهان با چشم
// دیده نمیشود، سنجیده میشود). سه یافتهٔ sweepِ ۳۹۰px و قفلِ اصلاحشان:
//   ① سربرگِ رسمی (report-card): ردیفِ مهرِ لبه-به-لبه — min-contentِ متن
//     + مهرِ ۶۴px + گپِ ۱۲ == عرضِ کانتینر (سرریزِ ۳px در هر دو viewport)
//     → گپِ ۸px نفسِ اضافه
//   ② ماتریسِ حرارت (coverage-heatmap): ستونِ عنوانِ auto در موبایل جا
//     میخورد و شش سرستون را به ۲۶px میرساند — چهار برچسب چسبان → کپِ
//     minmax(0,64px) در موبایل و بازگشتِ auto در sm+
//   ③ برچسبهای «شنوا»/«کنکور» در coverage-heat.test.ts قفل‌اند (خانوادهٔ
//     خودِ map) — اینجا فقط هندسه.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const cardSrc = () =>
  readFileSync(join(process.cwd(), "src/components/study/reports/report-card.tsx"), "utf8");
const heatSrc = () =>
  readFileSync(join(process.cwd(), "src/components/study/reports/coverage-heatmap.tsx"), "utf8");

describe("قفلِ هندسهٔ سرریز — r316", () => {
  it("سربرگِ رسمی: ردیفِ مهر با gap-2 است — گپِ ۱۲ برندهٔ تیغه بود (سرریزِ ۳px)", () => {
    const src = cardSrc();
    expect(src).toContain("flex items-start justify-between gap-2");
    // نسخهٔ تیغهای برنگشته باشد
    expect(src).not.toContain("flex items-start justify-between gap-3");
  });

  it("ماتریسِ حرارت: کپِ ۶۴pxِ ستونِ عنوان در موبایل و بازگشتِ auto در sm+", () => {
    const src = heatSrc();
    expect(src).toContain(
      "grid-cols-[minmax(0,64px)_repeat(6,minmax(0,1fr))] items-center gap-1 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm sm:grid-cols-[auto_repeat(6,minmax(0,1fr))]"
    );
    // نسخهٔ تک-حالتیِ قدیمی (بدونِ کپ) برنگشته باشد
    expect(src).not.toContain('grid-cols-[auto_repeat(6,minmax(0,1fr))] items-center gap-1 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm"');
  });

  it("برچسبِ سرستون از همان mapِ کوتاه میخواند و tooltip نامِ کامل دارد — هم‌قراردادِ r316", () => {
    const src = heatSrc();
    expect(src).toContain("COVERAGE_SKILL_SHORT[sk.key] ?? sk.label");
    expect(src).toContain('title={sk.label}');
  });
});
