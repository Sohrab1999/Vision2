// ------------------------------------------------------------------
// Task 121 — weekCardPercent + weekCardMotto: the pure helpers behind
// the week-teacher PNG card's goal ring and footer motto.
//   ① percent = the honest clamp of goalDays/7 — never burns on junk
//   ② the ring is driven by the REAL goal days, nothing decorative
//   ③ the motto reads the real week (goal tier → active tier → keep)
//   ④ degenerate inputs land on honest defaults
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { weekCardPercent, weekCardMotto } from "@/lib/result-image";

describe("weekCardPercent", () => {
  it("maps the seven honest day counts to their percents", () => {
    expect(weekCardPercent(0)).toBe(0);
    expect(weekCardPercent(1)).toBe(14); // 14.28… → round → 14
    expect(weekCardPercent(3)).toBe(43); // 42.85… → round → 43
    expect(weekCardPercent(7)).toBe(100);
  });

  it("clamps out-of-range input instead of lying", () => {
    expect(weekCardPercent(-2)).toBe(0);
    expect(weekCardPercent(9)).toBe(100);
    expect(weekCardPercent(99)).toBe(100);
  });

  it("lands on honest defaults for junk", () => {
    expect(weekCardPercent(Number.NaN)).toBe(0);
    expect(weekCardPercent(Infinity)).toBe(0); // non-finite → honest 0, no decoration
    expect(weekCardPercent(2.4)).toBe(29); // round(2.4)=2 → round(2/7*100)=29
  });
});

describe("weekCardMotto", () => {
  it("celebrates a near-full goal week", () => {
    expect(weekCardMotto(5, 1)).toBe("FULL WEEK ★");
    expect(weekCardMotto(7, 7)).toBe("FULL WEEK ★");
  });

  it("honours an active week even without goal days", () => {
    expect(weekCardMotto(2, 3)).toBe("STRONG WEEK");
    expect(weekCardMotto(0, 5)).toBe("STRONG WEEK");
  });

  it("keeps a quiet week honest — no fake praise", () => {
    expect(weekCardMotto(1, 2)).toBe("KEEP GOING!");
    expect(weekCardMotto(0, 0)).toBe("KEEP GOING!");
  });
});
