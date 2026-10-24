// @vitest-environment jsdom
// ------------------------------------------------------------------
// r387 — «کسرِ سرشماریِ نشان یک نام گرفت» — مالک: src/lib/achievements.ts
//
// سه حکمی که این فایل قفل میکند:
//  ① کسرِ «X از ۵۶» از مالکِ رجیستری میآید (badgeFractionFa): صورت =
//     شمارندهٔ بازِ هر نما، مخرج همیشه کلِ رجیستری — زیرگروهِ بایت‌همسانِ
//     حکمِ سرشماریِ r386⑤. هر چهار نما (گریدِ نشان‌ها، کارنامه،
//     هفته‌نامه، اوراقِ رسمی) همین قالب را بایتبه‌بایت تکرار میکردند.
//  ② موافقتِ همیشگیِ چهار نما (حکمِ یگانگیِ r383): چون مخرج از یکجا
//     میآید، دیگر هیچ نمایی نمیتواند «۵ از ۵۶»یِ ناهم‌روا بگوید —
//     گزارشِ کاغذیِ ناهم‌سان با گرید، ردهٔ خطایِ مردِ r383 است.
//  ③ گویشهایِ دیگرِ «faNum(x) از faNum(y)» عمدی میمانند: بومِ share
//     (result-image r288) پارامترِ total دارد برای باندِ خانوادهٔ
//     نبردی — مستند، دست‌نخورده، بی‌وام از مالک.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { BADGES, badgeFractionFa } from "@/lib/achievements";
import { faNum } from "@/lib/study-theme";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const FOUR_VIEWS = [
  "src/components/study/practice/badges.tsx",
  "src/components/study/reports/weekly-report.tsx",
  "src/components/study/reports/official-report.tsx",
  "src/components/study/reports/report-card.tsx",
];

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|ts)$/.test(name)) out.push(p);
  }
  return out;
};

describe("r387 — badgeFractionFa: مالکِ کسرِ سرشماری", () => {
  it("قالبِ دقیق: «X از Y» با ارقامِ فارسی و مخرجِ کلِ رجیستری", () => {
    const total = BADGES.length;
    // قالبِ بایت‌همسان — همان که چهار نما تکرار میکردند
    expect(badgeFractionFa(0)).toBe(`${faNum(0)} از ${faNum(total)}`);
    expect(badgeFractionFa(20)).toBe(`${faNum(20)} از ${faNum(total)}`);
    expect(badgeFractionFa(total)).toBe(`${faNum(total)} از ${faNum(total)}`);
  });

  it("ارقامِ فارسی — هیچ رقمِ لاتینی در خروجی نیست", () => {
    for (const n of [0, 1, 7, 13, 20, 33, 55, 56]) {
      expect(badgeFractionFa(n)).not.toMatch(/[0-9]/);
    }
  });

  it("مخرج همیشه رجیستری است — نه پارامترِ فراخوان", () => {
    // حتی اگر فراخوان عددِ دیگری بفرستد، مخرج تغییر نمیکند (امضای تک‌آرگومانی)
    const fn = badgeFractionFa.length;
    expect(fn).toBe(1);
    expect(badgeFractionFa(1)).toContain(` از ${faNum(BADGES.length)}`);
  });

  it("مخرجِ زنده با رجیستریِ واقعی همخوان است (۰ از ۵۶)", () => {
    expect(badgeFractionFa(0)).toBe("۰ از ۵۶");
  });
});

describe("r387 — قفلهایِ منبع: چهار نما وامگیرِ مالک‌اند", () => {
  it("هر چهار نما badgeFractionFa را از @/lib/achievements وارد میکنند", () => {
    for (const v of FOUR_VIEWS) {
      const src = read(v);
      expect(src).toContain("badgeFractionFa");
      expect(src).toMatch(/from "@\/lib\/achievements"/);
    }
  });

  it("هیچ نمایی دیگر قالبِ قدیمی را تکرار نمیکند (صورتِ دستیِ BADGES.length منقرض در نماها)", () => {
    // قالبِ رشته‌ایِ قدیمی
    const tpl = /از \$\{faNum\(BADGES\.length\)\}/;
    // قالبِ JSXِ قدیمی
    const jsx = /از \{faNum\(BADGES\.length\)\}/;
    for (const v of FOUR_VIEWS) {
      const src = read(v);
      expect(tpl.test(src)).toBe(false);
      expect(jsx.test(src)).toBe(false);
    }
  });

  it("تعریفِ badgeFractionFa فقط در مالک است (یکنفرانه در سراسرِ src)", () => {
    const all = walk("src");
    const owners = all.filter((p) => /export function badgeFractionFa/.test(read(p)));
    expect(owners).toEqual(["src/lib/achievements.ts"]);
  });

  it("بومِ share گویشِ مستندِ r288 خودش را نگه میدارد — بی‌وام از مالک", () => {
    const img = read("src/lib/result-image.ts");
    expect(img).not.toMatch(/import\s*\{[^}]*badgeFractionFa/); // عمدی: totalِ پارامتریِ خانوادهٔ نبردی (ذکرِ نام در حاشیه آزاد است)
    expect(img).toContain("const total = o.total ?? BADGES.length;");
    expect(img).toContain("از ${faNum(total)}"); // قالبِ بوم با مخرجِ پارامتری
    // حاشیهٔ r387 ثبت شده تا گرههایِ بعدی بدانند این تکرار تصمیم است
    expect(img).toContain("r387");
  });

  it("مالک خودش از BADGES.length و faNum میخواند — بدونِ کلونِ شمارنده", () => {
    const own = read("src/lib/achievements.ts");
    expect(own).toMatch(/export function badgeFractionFa\(unlockedCount: number\): string \{\s*\n\s*return `\$\{faNum\(unlockedCount\)\} از \$\{faNum\(BADGES\.length\)\}`;/);
  });
});
