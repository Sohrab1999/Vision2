// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۴ — سوییپِ a11yِ هشدارِ Radix: هر دیالوگِ اپ یا DialogDescription
// واقعی دارد یا به‌صراحتِ Radix «بی‌توصیفِ عمدی» اعلام می‌شود
// (aria-describedby={undefined} — الگویِ command-palette). هشدارِ
// «Missing Description or aria-describedby» دیگر نباید در کنسول ببارد.
// گاردِ سطحِ منبع: هر فایلی که DialogContent دارد باید یکی از دو راه را
// برگزیند — کلاسِ «دیالوگِ بی‌توصیفِ بی‌اعلان» برای همیشه بسته است.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

describe("dialog described-by sweep (r254)", () => {
  it("هر فایلِ DialogContent‌دار یا DialogDescription دارد یا aria-describedby={undefined} اعلام می‌کند", () => {
    const out = execSync("rg -l '<DialogContent' src/", { cwd: process.cwd() }).toString();
    const files = out.trim().split("\n").filter(Boolean);
    expect(files.length).toBeGreaterThanOrEqual(10);
    for (const f of files) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      const hasRealDescription = /DialogDescription/.test(src);
      const hasEscapeHatch = /aria-describedby=\{undefined\}/.test(src);
      expect(
        hasRealDescription || hasEscapeHatch,
        `${f} renders DialogContent without a description and without the documented escape hatch`
      ).toBe(true);
    }
  });

  it("شمارشِ دقیقِ راند: شش DialogContentِ نو escape hatch گرفتند و دیالوگِ مشترکِ usage هم هست", () => {
    const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
    // srs-panel ۱ + danger-words ۳ + exam ۱ + dictionary(drill) ۱ = ۶
    expect(read("src/components/study/practice/srs-panel.tsx").match(/aria-describedby=\{undefined\}/g)?.length).toBe(1);
    expect(read("src/components/study/practice/danger-words.tsx").match(/aria-describedby=\{undefined\}/g)?.length).toBe(3);
    expect(read("src/components/study/exam/exam-view.tsx").match(/aria-describedby=\{undefined\}/g)?.length).toBe(1);
    expect(read("src/components/study/lesson/dictionary-view.tsx").match(/aria-describedby=\{undefined\}/g)?.length).toBe(1);
    // دیالوگِ مشترکِ «کاربرد در جزوه» هم عمداً بی‌توصیف اعلام می‌شود
    expect(read("src/components/study/lesson/word-usage-dialog.tsx")).toContain("aria-describedby={undefined}");
  });
});
