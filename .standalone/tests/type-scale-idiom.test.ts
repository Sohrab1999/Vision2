import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// unslop P8 Route B (task 190) — B-3 (914→887 text-[Npx] literals, detector
// severity: white). The owner closed the fork as DOCUMENTED IDIOM: the px
// literal family IS the scale, recorded in the globals.css header; the code
// stays free (no ~50-file token sweep for zero visual delta). This guard
// pins the DOCUMENTATION only — if someone deletes the idiom comment the
// scale goes back to being implicit and this fails. It deliberately does
// NOT pin the literal counts (the idiom route leaves the code free to add
// nearest-table sizes).

const CSS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("type scale idiom (unslop P8 Route B — documented, not tokenized)", () => {
  it("the idiom comment lives in the globals.css header", () => {
    expect(CSS).toMatch(/type scale idiom \(plan P8 route b/);
  });

  it("records the canonical size table with the census counts", () => {
    expect(CSS).toMatch(/12×181 · 13×130 · 11×120 · 10×102 · 11\.5×72/);
    expect(CSS).toMatch(/10\.5×63 · 15×53 ·/);
    expect(CSS).toMatch(/12\.5×53 · 9\.5×44 · 13\.5×24 · 14×20 · 9×9 \(px×count\)/);
  });

  it("states the route decision (no tokenization) and the print exception", () => {
    expect(CSS).toMatch(/documented, NOT tokenized/);
    expect(CSS).toMatch(/print-pagination-contract/);
  });
});
