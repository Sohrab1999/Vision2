// ------------------------------------------------------------------
// تسک ۱۸۵ — «بودجهٔ موشن» (P6 از اودیتِ unslop) — قراردادِ ساکنِ سه
// صحنهٔ موشن: فلیپِ کارت، میله‌هایِ هفته‌نامه، کاغذرنگیِ جشن. یافتهٔ
// F6 (G-5+G-1): اوت‌لایرهایِ موشن — فلیپِ ۰٫۵۵ ثانیه‌ای بالایِ باندِ
// تعاملِ مستقیم (KR-16)، میله‌هایِ ۰٫۴۵ ثانیه‌ای، و ease-in رویِ
// حرکتِ ورودی (G-1: ease-in نشانِ حرکتِ خروجی است).
// قراردادهایی که قفل می‌شوند:
//  ① فلیپِ کارت = ۰٫۴۲ ثانیه (حسِ عمدیِ فلیپِ سه‌بعدی حفظ شد —
//     قضاوتِ مستند در plans/unslop.md F6) و ۰٫۵۵ بازنگردد
//  ② میله‌هایِ هفته‌نامه = ۰٫۳ ثانیه ×۲ (framer، ease از قبل easeOut)
//  ③ کاغذرنگی = ease-out (استدلالِ گرانش یادداشت و رد شد — تزئین است)
//  ④ مرزِ دامنه: home-hero با ۰٫۴۵ دست‌نخورده ماند (خارجِ یافتهٔ F6
//     بود — ورودیِ صحنه، نه تعاملِ مستقیم)؛ اگر راندِ بعدی خواست
//     دست بزند، آگاهانه و با به‌روزرسانیِ همین پین
// تستِ ساکنِ خواندنِ فایل — هم‌الگوی css-hygiene؛ بدونِ DOM.
// ------------------------------------------------------------------

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
const chart = readFileSync(
  resolve(process.cwd(), "src/components/study/practice/weekly-chart.tsx"),
  "utf8"
);
const hero = readFileSync(
  resolve(process.cwd(), "src/components/study/home/home-hero.tsx"),
  "utf8"
);

describe("بودجهٔ موشن — قراردادِ P6 (Task 185)", () => {
  it("فلیپِ کارت ۰٫۴۲ ثانیه است و باندِ اوت‌لایر (۰٫۵۵) بازنگشته", () => {
    const block = css.slice(css.indexOf(".flip-card {"), css.indexOf(".flip-card.flipped"));
    expect(block).toContain("transition: transform 0.42s");
    expect(block).not.toContain("0.55s");
  });

  it("کاغذرنگیِ جشن ease-out است — ease-inِ نشانِ خروج ممنوع", () => {
    const line = css.split("\n").find((l) => l.includes(".confetti-piece"));
    expect(line).toBeTruthy();
    expect(line).toContain("ease-out");
    expect(line).not.toContain("ease-in");
    // مدتِ ۱٫۸s دست‌نخورده — فقط easing در دامنهٔ P6 بود
    expect(line).toContain("1.8s");
  });

  it("میله‌هایِ هفته‌نامه ۰٫۳ ثانیه ×۲ — ۰٫۴۵ بازنگردد", () => {
    expect(chart).not.toContain("duration: 0.45");
    const bars = chart.match(/duration: 0\.3, ease: "easeOut"/g) ?? [];
    expect(bars).toHaveLength(2);
  });

  it("مرزِ دامنه: home-hero با ۰٫۴۵ دست‌نخورده — خارجِ یافتهٔ F6", () => {
    expect(hero).toContain("duration: 0.45");
  });
});
