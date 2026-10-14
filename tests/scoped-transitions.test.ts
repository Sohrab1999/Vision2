import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// unslop plan P4 (task 188) — F4 / G-4 red: transitioning EVERY property
// animates layout properties nobody meant. Estate-wide contract:
//   1. the banned catch-all utility appears ZERO times in src/
//   2. every arbitrary transition list may only name PAINT properties —
//      layout properties (width/height/padding/margin/inset/top/left ...)
//      must never be transitioned
// Static file-read guard, same family as css-hygiene / press-scale.
// Scope bounds honored elsewhere: durations/easings are P6's, keyframes
// untouched, shadcn ui/* diffs minimal.

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

const SRC = join(process.cwd(), "src");
const FILES = walk(SRC);

// paint-only properties a transition may name
const PAINT_ONLY = new Set([
  "background-color",
  "color",
  "border-color",
  "box-shadow",
  "transform",
  "opacity",
  "fill",
  "stroke",
  "stroke-dashoffset", // the duel timer ring's arc draw — SVG paint, no reflow
  "text-decoration-color",
  "outline-color",
]);

describe("scoped-transitions contract (unslop P4 — G-4)", () => {
  it("the banned catch-all transition utility appears zero times in src/", () => {
    const offenders = FILES.filter((f) =>
      readFileSync(f, "utf8").includes("transition-all")
    );
    expect(
      offenders,
      `files still carrying the catch-all: ${offenders.join(", ")}`
    ).toEqual([]);
  });

  it("every arbitrary transition list names paint-only properties (no layout)", () => {
    const violations: { file: string; list: string; bad: string[] }[] = [];
    for (const f of FILES) {
      const text = readFileSync(f, "utf8");
      for (const m of text.matchAll(/transition-\[([^\]"']+)\]/g)) {
        const props = m[1].split(",").map((s) => s.trim());
        const bad = props.filter((p) => !PAINT_ONLY.has(p));
        if (bad.length) {
          violations.push({ file: f.replace(SRC + "/", ""), list: m[1], bad });
        }
      }
    }
    expect(
      violations,
      `layout properties in transition lists: ${violations
        .map((v) => `${v.file} [${v.list}] bad=${v.bad.join("|")}`)
        .join(", ")}`
    ).toEqual([]);
  });

  it("the sweep actually happened (meaningfulness floor)", () => {
    let scoped = 0;
    for (const f of FILES) {
      scoped += (readFileSync(f, "utf8").match(/transition-\[/g) || []).length;
    }
    expect(scoped).toBeGreaterThanOrEqual(150);
  });
});
