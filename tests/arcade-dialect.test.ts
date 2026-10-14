import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// unslop P3 Route A (task 190) — DEC-9 hard: "the violet/fuchsia arcade
// dialect is undocumented and not in the DS". The owner closed the fork as
// FORMALIZE: the battle modes keep their violet→fuchsia identity, but it is
// now a named, tokenized, documented second brand. These tokens live in the
// @theme block of globals.css (--color-arcade-*); every arcade gradient stop
// must name them. Static file-read guard (same style as press-scale /
// scoped-transitions): any raw from-violet-* to-fuchsia-* pair re-entering
// src fails here. Deliberately OUT of scope (documented in the token
// comment): rush (amber/orange fire mood), spell-rush (sky/cyan frost mood),
// podium rank gradients (dark-tuned literals), grammar metro violet line,
// study-theme lesson accents, daily-quest same-hue bars, paper masthead
// gradient (print design), home-hero gradient text.

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const FILES = walk(SRC).filter((f) => !f.includes("node_modules"));
const CSS = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

describe("arcade dialect contract (unslop P3 Route A — formalized brand)", () => {
  it("has ZERO raw violet→fuchsia gradient pairs anywhere in src", () => {
    const offenders: { file: string; line: string }[] = [];
    for (const f of FILES) {
      const text = readFileSync(f, "utf8");
      // cross-family pairs only — same-hue runs (podium violet→violet,
      // daily-quest bars) are deliberate rank/accent gradients, out of scope
      for (const m of text.matchAll(/from-violet-\d+ to-fuchsia-\d+|from-fuchsia-\d+ to-violet-\d+/g)) {
        offenders.push({ file: f.replace(SRC + "/", ""), line: m[0] });
      }
    }
    expect(
      offenders,
      `raw arcade pairs must use the --color-arcade-* tokens: ${offenders
        .map((o) => `${o.file}: ${o.line}`)
        .join(", ")}`
    ).toEqual([]);
  });

  it("the purple-600 drift is gone (my-words flashcards unified to the soft pair)", () => {
    const hits = FILES.filter((f) => readFileSync(f, "utf8").includes("purple-600"));
    expect(hits, `purple-600 must not return: ${hits.join(", ")}`).toEqual([]);
  });

  it("defines the seven arcade tokens exactly once in a NON-INLINE @theme (var flow for the dark kernel)", () => {
    // r190: the tokens deliberately live OUTSIDE the @theme inline block —
    // inline bakes literal hexes into the utilities and the .dark remap
    // could not flow (live-probed). The block here must be plain "@theme".
    const blockStart = CSS.search(/\/\* r190: arcade dialect tokens — NON-INLINE @theme[\s\S]*?@theme \{/);
    expect(blockStart, "the non-inline arcade @theme block must exist").toBeGreaterThanOrEqual(0);
    const blockEnd = CSS.indexOf("\n}", blockStart);
    const themeBlock = CSS.slice(blockStart, blockEnd);
    const tokens: Record<string, string> = {
      "--color-arcade-from": "#7c3aed", // violet-600
      "--color-arcade-to": "#c026d3", // fuchsia-600
      "--color-arcade-from-soft": "#8b5cf6", // violet-500
      "--color-arcade-to-soft": "#d946ef", // fuchsia-500
      "--color-arcade-tint": "#f5f3ff", // violet-50
      "--color-arcade-tint-to": "#fdf4ff", // fuchsia-50
      "--color-arcade-end": "#e11d48", // rose-600
    };
    for (const [name, hex] of Object.entries(tokens)) {
      const defs = themeBlock.split("\n").filter((l) => l.trim().startsWith(`${name}:`));
      expect(defs, `${name} must be defined exactly once in @theme`).toHaveLength(1);
      expect(defs[0]).toContain(hex);
    }
    // and none of them may sneak back into the inline block
    const inlineStart = CSS.search(/@theme inline \{/);
    const inlineEnd = CSS.indexOf("\n}", inlineStart);
    const inlineBlock = CSS.slice(inlineStart, inlineEnd);
    expect(inlineBlock).not.toContain("--color-arcade-from:");
  });

  it("keeps the dark remaps in the canonical .dark kernel (ported from the retired class rules)", () => {
    const darkStart = CSS.split("\n").findIndex((l) => /^\.dark \{/.test(l));
    expect(darkStart).toBeGreaterThanOrEqual(0);
    const darkBlock = CSS.split("\n").slice(darkStart, darkStart + 140).join("\n");
    expect(darkBlock).toMatch(/--color-arcade-from:\s*#5b21b6/);
    expect(darkBlock).toMatch(/--color-arcade-to:\s*#86198f/);
    expect(darkBlock).toMatch(/--color-arcade-tint:\s*rgba\(59, 40, 92, 0\.35\)/);
    expect(darkBlock).toMatch(/--color-arcade-tint-to:\s*rgba\(74, 4, 78, 0\.35\)/);
    // the retired class-level stops must stay retired — check CSS only
    // (comments stripped, per the r90 lesson: doc lines are not selectors)
    const cssNoComments = CSS.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(cssNoComments).not.toMatch(/\.dark \.from-violet-600/);
    expect(cssNoComments).not.toMatch(/\.dark \.to-fuchsia-600/);
  });

  it("ships the .arcade-hero recipe and both heroes consume it", () => {
    expect(CSS).toMatch(/\.arcade-hero \{/);
    expect(CSS).toMatch(/arcade-hero recipe \(plan P3 Route A\)/);
    for (const rel of ["components/study/duel/duel-setup.tsx", "components/study/duel/duel-countdown.tsx"]) {
      const text = readFileSync(join(SRC, rel), "utf8");
      expect(text, `${rel} must carry the arcade-hero class`).toContain("duel-hero arcade-hero");
      expect(text, `${rel} must not carry raw hero gradient utilities`).not.toMatch(
        /from-violet-600 via-fuchsia-600/
      );
    }
  });

  it("the dialect is documented as a deliberate battle-mode brand (DS comment)", () => {
    expect(CSS).toMatch(/arcade dialect — the duel family's documented second brand/);
    expect(CSS).toMatch(/deliberately speak violet→fuchsia/);
  });

  it("the tokens are actually consumed (guard stays meaningful)", () => {
    const uses = FILES.filter((f) => /-arcade-(from|to|tint)/.test(readFileSync(f, "utf8")));
    expect(uses.length).toBeGreaterThanOrEqual(6);
  });
});
