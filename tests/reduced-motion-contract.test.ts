// ------------------------------------------------------------------
// unslop audit P1 (F1 / G-9 hard · KR-15 hard) — reduced-motion contract.
// Recon correction vs the plan draft: the project ALREADY ships a manual
// kill-switch (html.user-reduce-motion ← settings hub F2). The fix does
// NOT duplicate a @media block — it ORs the OS preference into the same
// channel (matchMedia hook) and closes the framer-motion gap via
// MotionConfig (JS animations ignore the CSS 0.01ms rule).
// These pins make each leg of that union non-removable.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("unslop P1 — reduced-motion یک kill-switch، سه پا", () => {
  const css = read("src/app/globals.css");
  const app = read("src/components/study/study-app.tsx");
  const hook = read("src/hooks/use-prefers-reduced-motion.ts");

  it("پایِ CSS: قاعدهٔ kill-switch موجود محفوظ است — حذفش = بازگشتِ باگ", () => {
    expect(css).toContain(
      "html.user-reduce-motion *,\nhtml.user-reduce-motion *::before,\nhtml.user-reduce-motion *::after {"
    );
    expect(css).toContain("animation-duration: 0.01ms !important");
    expect(css).toContain("transition-duration: 0.01ms !important");
    expect(css).toContain("html.user-reduce-motion .streak-flame");
  });

  it("پایِ OS: media query از طریقِ hook واردِ همان کلاس می‌شود — نه بلوکِ تکراری", () => {
    expect(hook).toContain("(prefers-reduced-motion: reduce)");
    expect(hook).toContain('mq.addEventListener("change", update)');
    expect(app).toContain("usePrefersReducedMotion()");
    expect(app).toContain("settings.reduceMotion || osReduceMotion");
    // design-system integrity: ONE channel, not two parallel rules
    expect(css).not.toContain("@media (prefers-reduced-motion");
  });

  it("پایِ framer: JS-انیمیشن‌ها هم خاموش می‌شوند — MotionConfig always|user", () => {
    expect(app).toContain('<MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>');
  });
});
