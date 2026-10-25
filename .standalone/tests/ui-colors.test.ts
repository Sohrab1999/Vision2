import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// unslop F10 (task 189) — B-1 note executed: raw hex in canvas/SVG painters.
// Painters cannot read Tailwind classes; before the shared module each painter
// duplicated palette hexes by hand and they could silently drift apart.
// Contract:
//   1. every known painter imports uiColors
//   2. painters carry ZERO raw hex literals (the codemod's leftover check,
//      frozen as a guard — new painters must adopt the module)
//   3. the module itself is well-formed: every leaf is a 6-digit hex, values
//      are unique (copy-paste drift guard), floor of 30 leaves
// Exemptions (platform-required, stay self-contained): global-error.tsx,
// layout.tsx, and hexes inside arbitrary Tailwind classes (CSS context).

const PAINTERS = [
  "src/lib/result-image.ts",
  "src/lib/skill-stats.ts",
  "src/components/study/practice/vocab-donut.tsx",
  "src/components/study/shared/confetti.tsx",
  "src/components/study/practice/daily-quests.tsx",
  "src/components/study/practice/progress-ring.tsx",
  "src/components/study/practice/srs-panel.tsx",
  "src/components/study/lesson/lesson-view.tsx",
  "src/components/study/home/home-bookshelf.tsx",
];

const MODULE = "src/lib/ui-colors.ts";
const HEX_RE = /#[0-9a-fA-F]{6}\b/g;

const moduleSrc = readFileSync(join(process.cwd(), MODULE), "utf8");

describe("ui-colors contract (unslop F10 — B-1 painters)", () => {
  it("every painter imports the shared palette module", () => {
    const missing = PAINTERS.filter((f) => {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      return !src.includes(`from "./ui-colors"`) && !src.includes(`from "@/lib/ui-colors"`);
    });
    expect(missing, `painters not importing uiColors: ${missing.join(", ")}`).toEqual([]);
  });

  it("painters carry zero raw hex literals", () => {
    const offenders: string[] = [];
    for (const f of PAINTERS) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      const hexes = src.match(HEX_RE) ?? [];
      if (hexes.length > 0) offenders.push(`${f}: ${[...new Set(hexes)].join(", ")}`);
    }
    expect(offenders, `raw hex back in painters:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("the module is well-formed: hex-shaped, unique values, >= 30 leaves", () => {
    // every quoted string in the module must be a full 6-digit hex
    const quoted = moduleSrc.match(/"[^"]+"/g) ?? [];
    const badShape = quoted.filter((q) => !/^"#(?:[0-9a-fA-F]{6})"$/.test(q));
    expect(badShape, `non-hex string literals: ${badShape.join(", ")}`).toEqual([]);

    // uniqueness — two names pointing at one hex means copy-paste drift
    const values = quoted.map((q) => q.slice(1, -1));
    expect(values.length).toBeGreaterThanOrEqual(30);
    const dupes = values.filter((v, i) => values.indexOf(v) !== i);
    expect(dupes, `duplicate values: ${[...new Set(dupes)].join(", ")}`).toEqual([]);
  });

  it("module documents its platform-required exemptions", () => {
    expect(moduleSrc).toContain("global-error.tsx");
    expect(moduleSrc).toContain("layout.tsx");
    expect(moduleSrc).toContain("platform-required");
  });
});
