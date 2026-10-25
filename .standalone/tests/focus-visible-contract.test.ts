// ------------------------------------------------------------------
// تسک ۱۷۷ — قراردادِ focus-visible: «outline-none بی‌نشانهٔ کانونی ممنوع».
// راهبردِ کاربرِ کیبورد: outline را نمی‌کُشیم مگر نشانهٔ قوی‌تری بگذاریم
// (ring/outline تِیل‌ویند). border/bg-only شمارش نمی‌شود — تغییرِ لبه
// نشانهٔ قابلِ اعتمادِ کانونی نیست (المانِ کم‌کنتراست آن را گم می‌کند).
// مصرف‌کنندهٔ همان analyze() که CLI و QA هم می‌خورند — تک‌قراردادِ ۱۱۳.
// Global fallback در globals.css (:focus-visible زمردی + .dark) پینِ
// جداگانه دارد — این قرارداد فقط لایهٔ لغوهایِ محلی را قفل می‌کند.
// ------------------------------------------------------------------

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const require = createRequire(import.meta.url);
const { analyze } = require("../scripts/audit-focus-visible.cjs");

describe("focus-visible contract — no outline-none without a strong focus signal (Task 177)", () => {
  const r = analyze();

  it("scanned a sane number of TSX files and outline-none spots", () => {
    expect(r.files).toBeGreaterThan(80);
    expect(r.outlineNone).toBeGreaterThan(5);
  });

  it("has ZERO elements with outline-none and no focus signal at all", () => {
    const none = r.spots.filter((s) => s.kind === "none");
    expect(
      none,
      `outline-none with zero focus compensation: ${none.map((s) => `${s.file}:${s.line}`).join("; ")}`
    ).toEqual([]);
  });

  it("has ZERO border-only compensations (edge-color change is not a focus signal)", () => {
    const weak = r.spots.filter((s) => s.kind === "border-only");
    expect(
      weak,
      `border-only focus compensation: ${weak.map((s) => `${s.file}:${s.line}`).join("; ")}`
    ).toEqual([]);
  });

  it("global keyboard fallback stays pinned in globals.css (light + dark)", () => {
    const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid/);
    expect(css).toMatch(/\.dark :focus-visible\s*\{[^}]*outline-color:/);
  });
});
