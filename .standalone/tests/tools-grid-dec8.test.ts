import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// unslop DEC-8 watch-item executed (task 191) — the audit's F-note: the tools
// grid is a DEC-3-exempt launcher with equal-weight cards, but the
// pastel-tile-per-item look (bg-<fam>-50 + border-<fam>-200 on all 11 tiles)
// is the generic-AI tell to retire: ONE neutral tile treatment with color
// only on the glyph. This guard pins the redesign so it cannot drift back:
// ① the section carries the .tools-grid scope hook (the dark glyph lifts key
//   off it),
// ② every tool's color field is GLYPH-ONLY (no bg-/border- utilities left in
//   the per-tool color strings),
// ③ the tile span itself is the single neutral treatment,
// ④ the four scoped dark glyph lifts exist with the family-base values and
//   stay SCOPED — a bare .dark .text-<fam>-600 band rule would wash over the
//   whole estate (solid 600s keep light-scale per the kernel contract).

const TOOLS = readFileSync(join(process.cwd(), "src/components/study/home/home-tools.tsx"), "utf8");
const CSS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("tools grid DEC-8 (one neutral tile, color only on the glyph)", () => {
  it("the grid carries the tools-grid scope hook for the dark lifts", () => {
    expect(TOOLS).toMatch(/<section aria-label="ابزارهای یادگیری" className="tools-grid">/);
  });

  it("every per-tool color field is glyph-only (no pastel triplet comes back)", () => {
    const colorFields = TOOLS.match(/color: "([^"]+)"/g) ?? [];
    expect(colorFields.length).toBeGreaterThanOrEqual(11);
    for (const field of colorFields) {
      expect(field, `pastel tile classes leaked back into a color field: ${field}`).not.toMatch(/\b(bg|border)-[a-z]+-\d+/);
      expect(field).toMatch(/^color: "text-[a-z]+-\d+"$/);
    }
  });

  it("the tile span is the ONE neutral treatment (kernel-served in dark)", () => {
    expect(TOOLS).toMatch(/rounded-xl border bg-stone-50 border-stone-200 \$\{tool\.color\}/);
    // and no other tinted tile recipe survived anywhere in the file
    expect(TOOLS).not.toMatch(/bg-(violet|sky|amber|emerald|orange|teal|fuchsia|rose)-50\b/);
  });

  it("the four scoped dark glyph lifts exist with the family dark bases", () => {
    const LIFTS: Record<string, string> = {
      "emerald-600": "#34d399",
      "orange-600": "#fdba74",
      "teal-600": "#5eead4",
      "fuchsia-600": "#e879f9",
    };
    for (const [shade, val] of Object.entries(LIFTS)) {
      // the selector may be consolidated into an equal-declaration group
      // (css-tones.cjs) — assert scope + value on the same rule line
      const lines = CSS.split("\n").filter((l) => l.includes(`.dark .tools-grid .text-${shade}`));
      expect(lines, `dark lift for .tools-grid .text-${shade} missing`).toHaveLength(1);
      expect(lines[0]).toContain(`color: ${val};`);
    }
  });

  it("the lifts stay scoped — no bare band rule for these 600s", () => {
    for (const fam of ["emerald", "orange", "teal", "fuchsia"]) {
      const bare = CSS.split("\n").filter((l) => {
        const t = l.trim();
        return t.startsWith(`.dark .text-${fam}-600 {`) || t.startsWith(`.dark .text-${fam}-600,`);
      });
      expect(bare, `bare .dark .text-${fam}-600 band rule appeared`).toEqual([]);
    }
  });
});
