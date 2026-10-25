// ------------------------------------------------------------------
// unslop audit P7 (F7 / J-6) — static heading-outline guard.
// Per .tsx file: heading tags (<h1..h6>) in source order must never
// jump more than one level (h1→h3 was the audited bug in appendix-view,
// rush-view, spell-rush-view). Source order is the contract — runtime
// conditionals keep tags in the same relative order.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

describe("unslop P7 — outline بدونِ پرشِ بیش از یک سطح (J-6)", () => {
  const files = [...walk("src/components"), ...walk("src/app")];

  it("هیچ فایلی ترتیبِ hN با پرش نداشته باشد", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      const levels = [...src.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) {
          offenders.push(`${f}: h${levels[i - 1]}→h${levels[i]} (پرشِ ${levels[i] - levels[i - 1]})`);
          break;
        }
      }
    }
    expect(offenders, `heading jumps:\n${offenders.join("\n")}`).toEqual([]);
  });
});
