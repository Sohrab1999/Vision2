// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 206 — the pairs tour COMPLETES: the two last word surfaces
// without booklet pairs join (my-words star list, danger-words rank)
// and the home bookshelf shows each lesson's pair wealth (lesson-meta
// pairCount, pinned to the data layer in lesson-meta.test.ts).
//   ① my-words: a starred paired word renders its chips, tap speaks
//   ② my-words: a pair-less star stays chipless
//   ③ danger-words: a ranked row carries compact chips (≤2 + overflow)
//   ④ bookshelf: every lesson card shows its «N جفت» chip
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import MyWordsView from "@/components/study/practice/my-words";
import DangerWords from "@/components/study/practice/danger-words";
import HomeBookshelf from "@/components/study/home/home-bookshelf";
import { useStudy } from "@/lib/study-store";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import { lessons } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
import { speak } from "@/lib/speak";

// jsdom has no IntersectionObserver — the bookshelf's whileInView needs one
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(vi.stubGlobal as (k: string, v: unknown) => void)("IntersectionObserver", IOStub);

const index = buildSynAntIndex(lessons);
const acceptPairs = synAntPairsFor(index, "accept");

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {}, starredWords: [], wordMistakes: {}, wordSeen: {} });
  vi.mocked(speak).mockClear();
});

describe("MyWords — booklet pair chips (round 206)", () => {
  it("a starred paired word (3:accept) renders its ↔ chips and tap speaks", () => {
    useStudy.setState({ starredWords: ["3:accept"] });
    render(<MyWordsView />);
    const labels = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label") ?? "");
    expect(labels).toContain("متضادِ accept: refuse — روخوانی");
    expect(labels).toContain("متضادِ accept: reject — روخوانی");
    fireEvent.click(screen.getByRole("button", { name: "متضادِ accept: refuse — روخوانی" }));
    expect(speak).toHaveBeenCalledWith("refuse", 0.95, undefined, expect.any(Function));
  });

  it("a pair-less star stays chipless (no fake zeros)", () => {
    const bare = lessons
      .flatMap((l) => l.vocabulary.map((w) => ({ key: `${l.id}:${w.en.toLowerCase()}`, en: w.en, fa: w.fa, lessonId: l.id })))
      .find((w) => !index.has(w.en.trim().toLowerCase()))!;
    expect(bare).toBeDefined();
    useStudy.setState({ starredWords: [bare.key] });
    render(<MyWordsView />);
    // the star resolved into a card — its own card carries no pair chips
    const card = screen.getByText(bare.fa).closest("div.min-w-0") as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.querySelector(".dict-pair-chip")).toBeNull();
  });
});

describe("DangerWords — compact pair chips on ranked rows (round 206)", () => {
  it("a dangerous paired word (3:accept, 2 misses of 3) carries ≤2 chips + overflow", () => {
    useStudy.setState({ wordMistakes: { "3:accept": 2 }, wordSeen: { "3:accept": 3 } });
    render(<DangerWords />);
    const labels = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label") ?? "");
    expect(labels).toContain("متضادِ accept: refuse — روخوانی");
    expect(labels).toContain("متضادِ accept: reject — روخوانی");
    // only 2 chips shown even though accept has 2 pairs → overflow is data-dependent;
    // when more than 2 exist the +N badge appears instead of the 3rd chip
    const overflow = screen.queryByTitle("ردیف‌های جفت دیگر در تبِ مترادف و متضاد درس");
    if (acceptPairs.length > 2) expect(overflow).not.toBeNull();
    else expect(overflow).toBeNull();
  });

  it("a dangerous pair-less word stays chipless", () => {
    const bare = lessons
      .flatMap((l) => l.vocabulary.map((w) => ({ key: `${l.id}:${w.en.toLowerCase()}`, en: w.en, lessonId: l.id })))
      .find((w) => !index.has(w.en.trim().toLowerCase()))!;
    useStudy.setState({ wordMistakes: { [bare.key]: 2 }, wordSeen: { [bare.key]: 3 } });
    render(<DangerWords />);
    const card = screen.getByText(bare.en).closest("div.min-w-0") as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.querySelector(".dict-pair-chip")).toBeNull();
  });
});

describe("HomeBookshelf — pair wealth chip (round 206)", () => {
  it("every lesson card shows its «N جفت» chip (lesson-meta pairCount)", () => {
    render(<HomeBookshelf />);
    // lesson 1 → ۴۰ جفت, lesson 3 → ۱۲۳ جفت (the richest), lessons 10-12 → ۲۴ جفت each
    expect(screen.getByText("۴۰ جفت")).toBeInTheDocument();
    expect(screen.getByText("۱۲۳ جفت")).toBeInTheDocument();
    expect(screen.getAllByText("۲۴ جفت")).toHaveLength(3);
  });
});
