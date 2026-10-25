import { describe, expect, it } from "vitest";

import { percent } from "@/lib/domain/percent";
import { shuffle, shuffleWithOptions, type Rng } from "@/lib/domain/shuffle";
import { isTypingTarget, readDigit } from "@/hooks/use-keyboard";

// ------------------------------------------------------------------
// Step-6 (R-4) — the ONE shuffle + guarded percent + layout-proof
// keyboard parsers. Pure domain: no React, no store.
// ------------------------------------------------------------------

/** deterministic RNG that walks a fixed sequence (for reproducible tests) */
function seqRng(values: number[]): Rng {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("shuffle", () => {
  it("keeps every element exactly once (multiset preserved)", () => {
    const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const out = shuffle(src);
    expect(out).toHaveLength(src.length);
    expect([...out].sort((a, b) => a - b)).toEqual(src);
  });

  it("never mutates the input array", () => {
    const src = ["a", "b", "c", "d"];
    const frozen = [...src];
    shuffle(src);
    expect(src).toEqual(frozen);
  });

  it("handles empty and single-element arrays", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });

  it("is deterministic under an injected rng", () => {
    const rng = seqRng([0.1, 0.9, 0.5, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6]);
    const a = shuffle([1, 2, 3, 4, 5], rng);
    const b = shuffle([1, 2, 3, 4, 5], seqRng([0.1, 0.9, 0.5, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6]));
    expect(a).toEqual(b);
  });

  it("eventually produces different orders across many draws", () => {
    const src = Array.from({ length: 12 }, (_, i) => i);
    const first = JSON.stringify(shuffle(src));
    let varied = false;
    for (let i = 0; i < 20 && !varied; i++) {
      if (JSON.stringify(shuffle(src)) !== first) varied = true;
    }
    expect(varied).toBe(true);
  });
});

describe("shuffleWithOptions", () => {
  it("tracks where the correct answer lands", () => {
    const { options, answer } = shuffleWithOptions(["A", "B", "C", "D"], 2, seqRng([0.99, 0.01, 0.5]));
    // 0.99 → j=3 (swap 3,3) · 0.01 → j=0 (swap 2,0) · 0.5 → j=1 (swap 1,1)
    expect(options).toEqual(["C", "B", "A", "D"]);
    expect(options[answer]).toBe("C");
  });

  it("keeps the option multiset intact", () => {
    const { options } = shuffleWithOptions(["x", "y", "z"], 0);
    expect([...options].sort()).toEqual(["x", "y", "z"]);
  });

  it("stays correct when two options hold equal text", () => {
    const { options, answer } = shuffleWithOptions(["same", "same", "other"], 0);
    expect(options).toHaveLength(3);
    expect(options[answer]).toBe("same");
    expect(options.filter((o) => o === "same")).toHaveLength(2);
  });

  it("handles a single-option question", () => {
    const { options, answer } = shuffleWithOptions(["only"], 0);
    expect(options).toEqual(["only"]);
    expect(answer).toBe(0);
  });
});

describe("percent", () => {
  it("rounds part-of-whole to the nearest integer", () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
    expect(percent(7, 8)).toBe(88);
    expect(percent(50, 200)).toBe(25);
  });

  it("returns 0 for an invalid or zero denominator", () => {
    expect(percent(5, 0)).toBe(0);
    expect(percent(5, -10)).toBe(0);
    expect(percent(5, Number.NaN)).toBe(0);
  });

  it("clamps into 0..100 even for overshooting inputs", () => {
    expect(percent(150, 100)).toBe(100);
    expect(percent(-5, 100)).toBe(0);
  });

  it("treats NaN part as 0", () => {
    expect(percent(Number.NaN, 10)).toBe(0);
  });

  it("passes identity cases through", () => {
    expect(percent(0, 10)).toBe(0);
    expect(percent(10, 10)).toBe(100);
  });
});

/** minimal KeyboardEvent-shaped stand-in (the parsers only read code/key/target) */
function fakeKey(opts: { key: string; code?: string; target?: Partial<HTMLElement> }): KeyboardEvent {
  return {
    key: opts.key,
    code: opts.code ?? "",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    target: opts.target ?? null,
  } as unknown as KeyboardEvent;
}

describe("readDigit", () => {
  it("reads latin digits", () => {
    expect(readDigit(fakeKey({ key: "3", code: "Digit3" }))).toBe(3);
    expect(readDigit(fakeKey({ key: "0", code: "Digit0" }))).toBe(0);
  });

  it("reads Persian digits", () => {
    expect(readDigit(fakeKey({ key: "۲" }))).toBe(2);
    expect(readDigit(fakeKey({ key: "۹" }))).toBe(9);
    expect(readDigit(fakeKey({ key: "۰" }))).toBe(0);
  });

  it("reads physical codes even when the layout produces another glyph", () => {
    // FR layout: Shift+1 produces «!», but code stays Digit1
    expect(readDigit(fakeKey({ key: "!", code: "Digit1" }))).toBe(1);
    expect(readDigit(fakeKey({ key: "a", code: "Numpad4" }))).toBe(4);
  });

  it("returns null for non-digit keys", () => {
    expect(readDigit(fakeKey({ key: "Enter", code: "Enter" }))).toBeNull();
    expect(readDigit(fakeKey({ key: "b", code: "KeyB" }))).toBeNull();
    expect(readDigit(fakeKey({ key: "ArrowLeft", code: "ArrowLeft" }))).toBeNull();
  });
});

describe("isTypingTarget", () => {
  it("flags text fields", () => {
    expect(isTypingTarget(fakeKey({ key: "a", target: { tagName: "INPUT" } }))).toBe(true);
    expect(isTypingTarget(fakeKey({ key: "a", target: { tagName: "TEXTAREA" } }))).toBe(true);
    expect(isTypingTarget(fakeKey({ key: "a", target: { tagName: "SELECT" } }))).toBe(true);
  });

  it("flags contenteditable and role=textbox", () => {
    expect(isTypingTarget(fakeKey({ key: "a", target: { tagName: "DIV", isContentEditable: true } }))).toBe(true);
    expect(isTypingTarget(fakeKey({ key: "a", target: { tagName: "DIV", getAttribute: () => "textbox" } }))).toBe(true);
  });

  it("flags modifier combos so browser shortcuts stay untouched", () => {
    const ev = { ...fakeKey({ key: "a" }), ctrlKey: true } as unknown as KeyboardEvent;
    expect(isTypingTarget(ev)).toBe(true);
  });

  it("lets plain keystrokes through to global shortcuts", () => {
    expect(isTypingTarget(fakeKey({ key: " ", target: { tagName: "BODY" } }))).toBe(false);
    expect(
      isTypingTarget(fakeKey({ key: "1", target: { tagName: "DIV", getAttribute: () => null } })),
    ).toBe(false);
  });
});

// ------------------------------------------------------------------
// gradeFor — the shared 90/70/50 ladder (step-6 R-6)
// ------------------------------------------------------------------
import { GENERIC_GRADE_COPY, gradeFor } from "@/lib/domain/grade";

describe("gradeFor", () => {
  it("climbs the ladder at the exact thresholds", () => {
    expect(gradeFor(90).level).toBe("elite");
    expect(gradeFor(89).level).toBe("good");
    expect(gradeFor(70).level).toBe("good");
    expect(gradeFor(69).level).toBe("ok");
    expect(gradeFor(50).level).toBe("ok");
    expect(gradeFor(49).level).toBe("weak");
    expect(gradeFor(0).level).toBe("weak");
  });

  it("pairs levels with the unified colors", () => {
    expect(gradeFor(95).cls).toBe("text-emerald-600");
    expect(gradeFor(75).cls).toBe("text-emerald-600");
    expect(gradeFor(60).cls).toBe("text-amber-600");
    expect(gradeFor(20).cls).toBe("text-rose-600");
  });

  it("uses generic copy by default and honors surface overrides", () => {
    expect(gradeFor(95).msg).toBe(GENERIC_GRADE_COPY.elite);
    const listen = gradeFor(95, { elite: "شنیداری‌ت فوق‌العاده است! آمادهٔ امتحان واقعی 🎧" });
    expect(listen.msg).toContain("شنیداری");
    expect(listen.cls).toBe("text-emerald-600");
  });

  it("keeps untouched copy lines when only some are overridden", () => {
    const g = gradeFor(30, { weak: "پیام سفارشی" });
    expect(g.msg).toBe("پیام سفارشی");
    expect(gradeFor(60).msg).toBe(GENERIC_GRADE_COPY.ok);
  });
});
