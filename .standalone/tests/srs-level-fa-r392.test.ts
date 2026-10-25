// ------------------------------------------------------------------
// راند ۳۹۲ — قراردادِ «سطح N از ۶» یک نام گرفت: srsLevelFa در مالکِ موتورِ SRS
// سرشماریِ برچسبِ سطحِ مرور: ۴ متنِ نما + نردبانِ نقطههایِ فلش‌کارت — سه جا
// «۶»یِ هاردکد و یکجا مشتقِ درست از SRS_INTERVALS.length. کلاسِ «سندِ دروغِ»
// حکمِ r383: اگر نردبان بلند شود، danger «از ۷» میگفت و بقیه «از ۶» — مخرج
// حالا یکجا در مالکِ رجیستری زندگی میکند (سابقهٔ badgeFractionFa در r387).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { srsLevelFa, SRS_INTERVALS } from "@/state/srs-engine";
import { srsLevelFa as srsLevelFaViaBarrel } from "@/lib/study-store";
import { faNum } from "@/lib/time-fa";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("مالکِ قرارداد — srsLevelFa (state/srs-engine.ts)", () => {
  it("قالبِ دقیق در دو سرِ نردبان — ارقامِ فارسی، بدونِ رقمِ لاتینی", () => {
    expect(srsLevelFa(0)).toBe("سطح ۱ از ۶");
    expect(srsLevelFa(5)).toBe("سطح ۶ از ۶");
    for (const lv of [0, 1, 2, 3, 4, 5]) {
      expect(srsLevelFa(lv)).not.toMatch(/[0-9]/);
    }
  });

  it("قدمِ +۱ قرارداد است — ورودیِ ۰..۵ دامنه است، خروجی ۱..۶ نمایش", () => {
    expect(srsLevelFa(2)).toBe(`سطح ${faNum(3)} از ${faNum(SRS_INTERVALS.length)}`);
  });

  it("مخرج همیشه با رجیستریِ زنده موافقت است — سندِ دروغ ناممکن", () => {
    expect(srsLevelFa(3)).toBe(`سطح ${faNum(4)} از ${faNum(SRS_INTERVALS.length)}`);
    expect(SRS_INTERVALS.length).toBeGreaterThan(0);
  });

  it("بازنشرِ study-store = همان تابعِ مالک — دو نام برای یک تابع نیست (درسِ r385)", () => {
    expect(srsLevelFaViaBarrel).toBe(srsLevelFa);
  });
});

describe("قفلهایِ منبعِ سرشماری (r392)", () => {
  it("سه نما از مالک وام میگیرند — با شمارشِ دقیقِ فراخوانها", () => {
    expect(read("src/components/study/practice/srs-panel.tsx").split("srsLevelFa(").length - 1).toBe(2); // دو چیپ: سررسید + پیشنگاه
    expect(read("src/components/study/practice/danger-words.tsx").split("srsLevelFa(").length - 1).toBe(1);
    expect(read("src/components/study/lesson/flashcards.tsx").split("srsLevelFa(").length - 1).toBe(1);
  });

  it("قالبِ دستیِ «سطح … از» در کلِ src/components منقرض است", () => {
    const files = [
      "src/components/study/practice/srs-panel.tsx",
      "src/components/study/practice/danger-words.tsx",
      "src/components/study/lesson/flashcards.tsx",
    ];
    const offenders = files.filter((f) => /سطح \$\{faNum\([^)]*\+ 1\)\} از/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it("«از ۶»یِ هاردکد در نماها منقرض — مخرج فقط در مالک از رجیستری میآید", () => {
    for (const f of [
      "src/components/study/practice/srs-panel.tsx",
      "src/components/study/lesson/flashcards.tsx",
    ]) {
      expect(read(f)).not.toContain("از ۶");
    }
    // danger هم دیگر SRS_INTERVALS را وارد نمیکند — برچسب از مالک میآید
    expect(read("src/components/study/practice/danger-words.tsx")).not.toContain("SRS_INTERVALS");
  });

  it("نردبانِ نقطههایِ فلش‌کارت طولش از رجیستری میآید — length: 6 هاردکد منقرض", () => {
    const src = read("src/components/study/lesson/flashcards.tsx");
    expect(src).toContain("Array.from({ length: SRS_INTERVALS.length })");
    expect(src).not.toContain("length: 6 }");
  });

  it("حکمِ «نخیر» ①: titleِ «سطح مرور: N — بعدی» فلش‌کارت گویشِ خودش میماند", () => {
    const src = read("src/components/study/lesson/flashcards.tsx");
    expect(src).toContain("سطح مرور: ${faNum(srsItem.level + 1)} — بعدی: ${SRS_LABELS[srsItem.level]}");
  });

  it("مالک در موتورِ SRS زندگی میکند و از study-store بازنشر میشود — ثباتِ مسیرِ r384", () => {
    const engine = read("src/state/srs-engine.ts");
    expect(engine).toContain("export const srsLevelFa");
    expect(engine).toContain('import { faNum } from "@/lib/time-fa"');
    expect(read("src/lib/study-store.ts")).toMatch(/srsLevelFa,?\s*\n?\s*srsQuestionDueIds/);
  });
});
