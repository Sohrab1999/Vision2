// ------------------------------------------------------------------
// تسک ۱۷۹ — قراردادِ چاپِ کاغذِ رسمی، پالشِ دومِ «آمادهٔ معلم».
// تشخیصِ راند: PDFِ واقعیِ agent-browser نشان داد پیمایشِ صفحه‌ها سالم است
// (break-inside: avoid کار می‌کند — هیچ بخشی بریده نمی‌شود). پس این راند
// ریزِ قرارداد را قفل می‌کند تا آینده خاموش خراب نشود:
//   ۱) جدولِ بلند مجاز به عبور از صفحه است (.or-table break-inside auto) —
//      پس thead باید در صفحهٔ بعد تکرار شود (table-header-group صریح).
//   ۲) اگر بخشی روزی بلندتر از یک صفحه شد، h3 نباید یتیمِ تهِ صفحه بماند.
//   ۳) or-note و یا هر جعبهٔ امضا اتمی است — امضای دو‌تکه روی کاغذِ
//      «رسمی» زشت‌ترین حالتِ خرابی است.
//   ۴) زیبرا و خطِ سطر به stone-100/200 تیره شد — زیبرایِ stone-50 روی
//      چاپگرِ لیزریِ سیاه‌وسفید اختلافِ <۲٪ داشت و عملاً دیده نمی‌شد.
// همان الگویِ قراردادِ focus-visible: متنِ CSS خوانده و قفل می‌شود.
// ------------------------------------------------------------------

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

// فقط بلوکِ @media print که مالِ کاغذِ رسمی است (آخرین تکرارِ فایل)
const printIdx = css.lastIndexOf("@media print");
const printBlock = css.slice(printIdx);

describe("print pagination contract — teacher-ready paper, pass 2 (Task 179)", () => {
  it("keeps the A4 page + section-level avoid baseline intact (Task 27 rules still pin)", () => {
    expect(printBlock).toContain("@page { size: A4; margin: 9mm; }");
    expect(printBlock).toContain(
      "body.print-official .or-section-block { break-inside: avoid; page-break-inside: avoid; }",
    );
    expect(printBlock).toContain(
      "body.print-official .or-table tr { break-inside: avoid; page-break-inside: avoid; }",
    );
  });

  it("long tables may cross pages — thead repeats via table-header-group", () => {
    // قراردادِ جفتی: اگر روزی auto به avoid تغییر کند، تکرارِ سرستون بی‌معنا
    // می‌شود و باید با هم عوض شوند؛ پینِ جداگانه این هم‌زمانی را نگه می‌دارد.
    expect(printBlock).toContain("body.print-official .or-table { break-inside: auto; }");
    expect(printBlock).toContain("body.print-official .or-table thead { display: table-header-group; }");
  });

  it("section headings never dangle as the last line of a page", () => {
    expect(printBlock).toContain(
      "body.print-official .or-section h3 { break-after: avoid; page-break-after: avoid; }",
    );
  });

  it("advice note and signature boxes are atomic across page breaks", () => {
    expect(printBlock).toContain("body.print-official .or-note,");
    expect(printBlock).toContain("body.print-official .or-sign { break-inside: avoid; page-break-inside: avoid; }");
  });

  it("zebra + row rule survived the mono-printer audit (stone-100/200, not stone-50)", () => {
    // تیره‌شدهٔ ۱۷۹: زیبرا #f5f5f4 و خطِ سطر #e7e5e4 — مقدارِ قدیمیِ #eceae6
    // دیگر نبودنی است تا کسی ناخواسته به رنگِ نامرئیِ کاغذ برگردد.
    expect(css).toContain(".or-table td { border-bottom: 1px solid #e7e5e4; color: #44403c; }");
    expect(css).toContain(".or-table tbody tr:nth-child(even) td { background-color: #f5f5f4; }");
    expect(css).not.toContain("border-bottom: 1px solid #eceae6");
    expect(css).not.toContain("tr:nth-child(even) td { background-color: #fafaf9; }");
  });

  it("zebra contrast is real on paper: stone-100 vs white is a visible delta", () => {
    // گاردِ معنایی (نه فقط متنی): f5f5f4 = 245,245,244 — کافی تیره‌تر از
    // سفیدِ کاغذ تا در اسکنِ کم‌کنتراست هم ردِ سطر پیدا بماند؛ و همچنان
    // از پس‌زمینهٔ سرستون (#f5f5f4) جداشدنی است چون فقط tbody را می‌گیرد.
    const zebra = css.match(/\.or-table tbody tr:nth-child\(even\) td \{ background-color: (#[0-9a-f]{6}); \}/);
    expect(zebra).toBeTruthy();
    const hex = zebra![1];
    const r = parseInt(hex.slice(1, 3), 16);
    expect(r).toBeLessThanOrEqual(245); // تیره‌تر یا هم‌سطحِ stone-100
    expect(r).toBeGreaterThanOrEqual(230); // اما نه آن‌قدر تیره که جوهر بسوزاند
  });

  it("low-score alert wins the specificity war inside tables (r179 fix)", () => {
    // «.or-bad» تنها (0,1,0) در برابرِ «.or-table td» (0,1,1) می‌باخت —
    // هشدارِ نمرهٔ کم از روزِ اول سنگیِ ۷۰۰ رندر می‌شد، نه سرخِ معلم‌دیده.
    // قاعدهٔ دومیرقمی باید همان‌جا باشد؛ حذفش = بازگشتِ خاموشِ باگ.
    expect(css).toContain(".or-table .or-bad { color: #be123c; }");
  });
});
