// ------------------------------------------------------------------
// Task 118 — wrapCanvasLines: the pure canvas word-wrap contract that
// lets the teacher card draw multi-line Persian reviews.
//   ① greedy fill measures against the injected measure fn
//   ② maxLines truncation closes the last kept line with «…»
//   ③ a single word wider than the whole line is hard-chopped by chars
//   ④ exact fits never earn a fake ellipsis
//   ⑤ degenerate inputs return honest empties
// measure here = string length (maxW in "chars") — deterministic.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { wrapCanvasLines } from "@/lib/result-image";

const M = (s: string) => s.length;

describe("wrapCanvasLines", () => {
  it("packs words greedily up to maxW", () => {
    // maxW=10: "ab cd" (5) fits, adding "efghij" (11) does not
    const lines = wrapCanvasLines("ab cd efghij", 10, M, 5);
    expect(lines).toEqual(["ab cd", "efghij"]);
  });

  it("splits a long text across many lines in order", () => {
    const lines = wrapCanvasLines("one two three four five", 8, M, 10);
    // "four five" = 9 > 8 → five opens its own line
    expect(lines).toEqual(["one two", "three", "four", "five"]);
  });

  it("closes the last kept line with … only when words truly drop", () => {
    const lines = wrapCanvasLines("aa bb cc dd", 5, M, 2);
    // "cc dd" = 5 fits exactly → two full lines, nothing dropped
    expect(lines).toEqual(["aa bb", "cc dd"]);
    const clipped = wrapCanvasLines("aa bb cc dd ee", 5, M, 2);
    expect(clipped).toEqual(["aa bb", "cc dd…"]);
  });

  it("never adds a fake ellipsis on an exact fit", () => {
    const lines = wrapCanvasLines("aa bb cc", 5, M, 2);
    expect(lines).toEqual(["aa bb", "cc"]);
    expect(lines[1].endsWith("…")).toBe(false);
  });

  it("hard-chops a single word wider than the whole line", () => {
    const lines = wrapCanvasLines("abcdefghij", 4, M, 5);
    expect(lines).toEqual(["abcd", "efgh", "ij"]);
  });

  it("hard-chops and ellipsises when the chunks exceed maxLines", () => {
    // hardChop fills each chunk to maxW: "abcd" + "efgh" + "ij"
    const lines = wrapCanvasLines("abcdefghij", 4, M, 2);
    expect(lines).toEqual(["abcd", "efgh…"]);
  });

  it("chops an oversized word after a normal prefix", () => {
    const lines = wrapCanvasLines("ab wwxyz", 3, M, 5);
    // chunks of "wwxyz" at maxW=3: "wwx" + "yz" — all within maxLines
    expect(lines).toEqual(["ab", "wwx", "yz"]);
    // with maxLines=2 the tail chunk drops and the ellipsis lands honestly
    expect(wrapCanvasLines("ab wwxyz", 3, M, 2)).toEqual(["ab", "wwx…"]);
  });

  it("duplicate oversized words never earn a phantom ellipsis", () => {
    // the indexOf-trap: two identical oversized words, exact chunk fit
    const lines = wrapCanvasLines("abcd abcd", 4, M, 4);
    expect(lines).toEqual(["abcd", "abcd"]);
    expect(lines[1].endsWith("…")).toBe(false);
  });

  it("returns [] for empty / whitespace-only text", () => {
    expect(wrapCanvasLines("", 10, M, 3)).toEqual([]);
    expect(wrapCanvasLines("   ", 10, M, 3)).toEqual([]);
  });

  it("returns [] for degenerate budgets", () => {
    expect(wrapCanvasLines("hello", 10, M, 0)).toEqual([]);
    expect(wrapCanvasLines("hello", 0, M, 3)).toEqual([]);
  });

  it("keeps a single fitting word as one line", () => {
    expect(wrapCanvasLines("سلام", 10, M, 3)).toEqual(["سلام"]);
  });

  it("measure is always called with candidate lines, never mutated input", () => {
    const seen: string[] = [];
    wrapCanvasLines("a bb ccc", 5, (s) => {
      seen.push(s);
      return s.length;
    }, 3);
    expect(seen).toContain("a bb");
    expect(seen).toContain("a bb ccc");
  });
});
