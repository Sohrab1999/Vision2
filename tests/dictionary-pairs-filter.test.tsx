// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 205 — the fifth dictionary state filter «جفت‌دار» (the still
// virgin suggestion ③ of round 203): show ONLY words that carry at
// least one booklet syn/ant pair.
//   ① the chip exists with the ArrowLeftRight icon + honest count
//     (count == number of dictionary words that resolve ≥1 pair)
//   ② clicking it filters the grid to paired words only — every
//     rendered card carries a pair chip, and the found-count equals
//     the chip's badge
//   ③ the filter composes with the lesson filter (lesson 3 ⊂ paired)
//   ④ it composes with search too (borrow query under paired stays)
//   ⑤ switching back to «همه» restores the full list
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

import { faNum } from "@/lib/study-theme";

const index = buildSynAntIndex(lessons);

// honest expectation, computed straight from the data layer: how many
// dictionary CARDS resolve at least one booklet pair (homonyms = 2 cards)
const allWords = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
const expectedPaired = allWords.filter((w) => synAntPairsFor(index, w.en).length > 0).length;
// the grid caps at 300 visible cards (slice) — asserts must respect that
const GRID_CAP = 300;

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {}, starredWords: [] });
});

function clickPairedChip() {
  fireEvent.click(screen.getByRole("button", { name: /جفت‌دار/ }));
}

// the state row (وضعیت یادگیری) vs the lesson row (همهٔ درس‌ها) — scope matters
function clickStateChip(name: RegExp) {
  const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
  fireEvent.click(within(row).getByRole("button", { name }));
}

describe("DictionaryView — فیلترِ «جفت‌دار» (راند ۲۰۵)", () => {
  it("the chip exists with an honest count badge (data-layer agreement)", () => {
    render(<DictionaryView />);
    const chip = screen.getByRole("button", { name: /جفت‌دار/ });
    expect(chip).toHaveTextContent(faNum(expectedPaired));
  });

  it("clicking it shows ONLY paired words — every visible card has ≥1 pair chip", () => {
    render(<DictionaryView />);
    clickPairedChip();
    const found = screen.getByText(/واژه یافت شد/);
    expect(found).toHaveTextContent(faNum(expectedPaired));
    // every RENDERED card (slice cap 300 < expectedPaired) carries a chip
    const grid = document.querySelector(".nice-scroll") as HTMLElement;
    const wordCards = grid.querySelectorAll(":scope > div");
    expect(wordCards.length).toBe(GRID_CAP);
    for (const card of wordCards) {
      expect(card.querySelector(".dict-pair-chip")).not.toBeNull();
    }
  });

  it("composes with the lesson filter — lesson 3's paired subset only", () => {
    render(<DictionaryView />);
    clickPairedChip();
    fireEvent.click(screen.getByRole("button", { name: "درس ۳: هنر و فرهنگ" }));
    const l3Words = lessons.find((l) => l.id === 3)!.vocabulary;
    const expected = l3Words.filter((w) => synAntPairsFor(index, w.en).length > 0).length;
    expect(expected).toBeGreaterThan(0);
    const found = screen.getByText(/واژه یافت شد/);
    expect(found).toHaveTextContent(faNum(expected));
  });

  it("composes with search — «borrow» stays visible under the paired filter", () => {
    render(<DictionaryView />);
    clickPairedChip();
    fireEvent.change(screen.getByPlaceholderText(/language یا زبان/), { target: { value: "borrow" } });
    // borrow lives in lessons 3 AND 4 — both homonym cards stay visible
    const cards = screen.getAllByText("borrow", { selector: "[dir='ltr']" });
    expect(cards.length).toBe(2);
  });

  it("switching back to «همه» restores the full dictionary", () => {
    render(<DictionaryView />);
    clickPairedChip();
    clickStateChip(new RegExp(`^همه\\s*${faNum(allWords.length)}$`));
    const found = screen.getByText(/واژه یافت شد/);
    expect(found).toHaveTextContent(faNum(allWords.length));
  });

  it("the empty-state branch never fires for paired (booklet has plenty)", () => {
    render(<DictionaryView />);
    clickPairedChip();
    expect(screen.queryByText("واژه‌ای با این فیلترها یافت نشد")).toBeNull();
  });
});
