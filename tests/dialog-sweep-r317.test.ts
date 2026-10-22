import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * r317 — قراردادِ «کاغذِ پاک» به خانوادهٔ دیالوگها رسید.
 *
 * راندِ ۳۱۷ همان پیمایشِ sw/cwِ r316 را به ۷ سطحِ دیالوگِ اپ برد (روشن/تاریکِ ۳۹۰ + دسکتاپِ ۱۲۸۰)
 * و نتیجه: صفرِ باگِ واقعی. دو کشفِ راند اینجا قفل میشود:
 * ۱) طبقهبند حالا چهارمین کلاسِ مشروع را میشناسد — sr-only: جعبهٔ ۱pxِ صفحهخوان
 *    با سرریزِ عمدیِ متن (عنوانِ فرمان‌یاب) — کلاسهایِ ۱-۳ میراثِ r316 است.
 * ۲) پسآزمونِ بستن باید لایهٔ radix را بسنجد نه trigger را — trigger همیشه در DOM است
 *    (popoverها با Escape بسته میشوند: wrapperِ radix از DOM میرود، data-state خالی میشود).
 * r322 — طبقهبند حالا شش کلاسِ مشروع میداند: پنجمِ deco_bleed (r318) و ششمِ
 * sheen_bleed (درخشِ متحرکِ badge-shine — ناپایدارِ زمانی با امضای قطعیِ پزودو).
 */

const sweepJs = readFileSync(join(process.cwd(), "scripts", "r317-sweep.js"), "utf8");
const sweepSh = readFileSync(join(process.cwd(), "scripts", "qa-r317-dialog-sweep.sh"), "utf8");
const palette = readFileSync(
  join(process.cwd(), "src", "components", "study", "shell", "command-palette.tsx"),
  "utf8",
);

describe("dialog sweep r317 — the clean-paper contract reaches every dialog", () => {
  it("classifier knows all six legitimate horizontal overflow classes", () => {
    // ۱ scroller (r316) · ۲ truncate (r316) · ۳ transform (r316) · ۴ sr_only (r317)
    // ۵ deco_bleed (r318) · ۶ sheen_bleed (r322 — درخشِ متحرک)
    expect(sweepJs).toContain('"scroller"');
    expect(sweepJs).toContain('"truncate"');
    expect(sweepJs).toContain('"transform"');
    expect(sweepJs).toContain('"sr_only"');
    expect(sweepJs).toContain('"deco_bleed"');
    expect(sweepJs).toContain('"sheen_bleed"');
  });

  it("vertical classifier separates designed hiding from invisible clipping", () => {
    // مشروع: پیمایشگر عمودی / clamp / جریانِ آزاد — کاندیدای بررسی: hidden_clip
    expect(sweepJs).toContain('"vscroller"');
    expect(sweepJs).toContain('"clamp"');
    expect(sweepJs).toContain('"flow"');
    expect(sweepJs).toContain('"hidden_clip"');
    // sr_only در هر دو محور شناخته میشود — دو شاخه
    expect(sweepJs.split('"sr_only"').length - 1).toBe(2);
  });

  it("sweep covers all seven dialog surfaces across three phases", () => {
    // روشنِ ۳۹۰: ۷ سطح · تاریکِ ۳۹۰: ۴ سطح · دسکتاپ: ۳ سطح — جمعاً ۱۴ فراخوان
    const calls = sweepSh.match(/^run_dialog /gm)?.length ?? 0;
    expect(calls).toBe(14);
    for (const sel of [
      ".report-paper",
      '[aria-label="گزارش رسمی پیشرفت درسی"]',
      '[aria-label^="پروفایل من"]',
      '[aria-label="تنظیمات"]',
      ".shortcuts-dialog",
      ".command-palette",
      ".duel-card",
    ]) {
      expect(sweepSh).toContain(`'${sel}'`);
    }
  });

  it("close post-check reads the radix layer, not the always-mounted trigger", () => {
    // درسِ راند: triggerِ popover همیشه در DOM است؛ بستهشدن یعنی wrapper/data-state
    expect(sweepSh).toContain("data-radix-popper-content-wrapper");
    expect(sweepSh).toContain("data-state=open");
  });

  it("palette keeps its sr-only DialogTitle and DialogDescription", () => {
    // اگر sr-only از عنوانِ فرمان‌یاب برداشته شود، سرصفحهٔ خام داخلِ پالت ظاهر میشود —
    // همان سرریزِ ۸۷px/۴۰۲px که پیمایش دید و طبقهبند مشروع شناخت.
    expect(palette).toContain('<DialogTitle className="sr-only">فرمان‌یاب</DialogTitle>');
    expect(palette).toContain('<DialogDescription className="sr-only">');
    expect(palette.split("sr-only").length - 1).toBeGreaterThanOrEqual(2);
  });
});
