import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// unslop P10 (task 187) — KR-10 hard: "a pressed button responds with
// scale(0.96); no feedback and a deeper squeeze are both findings."
// The whole estate uses exactly ONE press value: active:scale-[0.96].
// Static file-read guard (same style as css-hygiene / motion-budget):
// any future active:scale-95 / -90 / -[0.98] / -[0.99] re-introduction
// fails here. hover: scales, entrance keyframes and the flip transform
// are deliberately out of scope (plan's scope bounds).

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
const FILES = walk(SRC).filter((f) => !f.includes("node_modules"));

describe("press-scale contract (unslop P10 — KR-10)", () => {
  it("every active:scale-* in src is exactly active:scale-[0.96]", () => {
    const offenders: { file: string; value: string }[] = [];
    for (const f of FILES) {
      const text = readFileSync(f, "utf8");
      for (const m of text.matchAll(/active:scale-\[?[0-9.]+\]?/g)) {
        if (m[0] !== "active:scale-[0.96]") {
          offenders.push({ file: f.replace(SRC + "/", ""), value: m[0] });
        }
      }
    }
    expect(
      offenders,
      `non-canonical press scales: ${offenders.map((o) => `${o.file}:${o.value}`).join(", ")}`
    ).toEqual([]);
  });

  it("the canonical value is actually used (guard stays meaningful)", () => {
    const uses = FILES.filter((f) =>
      readFileSync(f, "utf8").includes("active:scale-[0.96]")
    );
    expect(uses.length).toBeGreaterThanOrEqual(50);
  });

  it("the conventions comment lives in globals.css (DS header)", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(/press feedback: active:scale-\[0\.96\] everywhere/);
  });
});
