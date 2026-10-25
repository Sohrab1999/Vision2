// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 208 — «جفت‌دار» lens on the personal word-book (ledger 207-①,
// the still-virgin 206-③). Contract with the dictionary's r205 lens:
//   ① the violet chip's badge counts CARDS (stars), data-derived
//   ② the lens hides pair-less stars, keeps paired ones, found-line agrees
//   ③ aria-pressed toggle — second click restores the hidden star
//   ④ composes with the lesson filter
//   ⑤ composes with the search query
//   ⑥ the filtered-empty reset clears the lens too
// jsdom note: removals ride AnimatePresence exit animations (~0.22s) —
// every «card disappears» claim waits with waitFor (house idiom, r111-era).
// Fixtures: "3:accept" is paired (↔ refuse / ↔ reject); pair-less and
// paired lesson-1 stars are data-derived, never hard-coded.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyWordsView from "@/components/study/practice/my-words";
import { useStudy } from "@/lib/study-store";
import { buildSynAntIndex } from "@/lib/syn-ant-lookup";
import { lessons } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));

const index = buildSynAntIndex(lessons);
// data-derived pair-less star (same recipe as the r206 guards)
const bare = lessons
  .flatMap((l) => l.vocabulary.map((w) => ({ key: `${l.id}:${w.en.toLowerCase()}`, lessonId: l.id, en: w.en, fa: w.fa })))
  .find((w) => !index.has(w.en.trim().toLowerCase()))!;
// data-derived PAIRED star from lesson 1 (for lesson/search composition guards)
const pairedL1 = lessons[0].vocabulary.find((w) => index.has(w.en.trim().toLowerCase()))!;

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {}, starredWords: [], wordMistakes: {}, wordSeen: {} });
});

const lensChip = () => screen.getByRole("button", { name: /جفت‌دار/ });
// the lens BUTTON also carries the literal text — scope to the stat card's label div
const statCard = () => screen.getByText("جفت‌دار", { selector: "div" }).closest("div.rounded-xl")!;

describe("MyWords — «جفت‌دار» lens (round 208)", () => {
  it("honest badge + fourth stat card: one paired star of two shows «۱»", () => {
    useStudy.setState({ starredWords: ["3:accept", bare.key] });
    render(<MyWordsView />);
    expect(lensChip()).toHaveTextContent("۱");
    expect(lensChip()).toHaveAttribute("aria-pressed", "false");
    // the violet stats card joins the trio (grid now 2×2 on mobile)
    expect(statCard()).toHaveTextContent("۱");
  });

  it("lens hides the pair-less star, keeps the paired one; found line agrees", async () => {
    useStudy.setState({ starredWords: ["3:accept", bare.key] });
    render(<MyWordsView />);
    expect(screen.getByText(bare.fa)).toBeInTheDocument();
    fireEvent.click(lensChip());
    expect(lensChip()).toHaveAttribute("aria-pressed", "true");
    // exit animation must finish before the card leaves the DOM (jsdom)
    await waitFor(() => expect(screen.queryByText(bare.fa)).not.toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText("accept")).toBeInTheDocument();
    expect(screen.getByText(/۱ واژه نشان‌شده/)).toBeInTheDocument();
  });

  it("second click toggles the lens off — hidden star returns", async () => {
    useStudy.setState({ starredWords: ["3:accept", bare.key] });
    render(<MyWordsView />);
    fireEvent.click(lensChip());
    await waitFor(() => expect(screen.queryByText(bare.fa)).not.toBeInTheDocument(), { timeout: 2000 });
    fireEvent.click(lensChip());
    await waitFor(() => expect(screen.getByText(bare.fa)).toBeInTheDocument(), { timeout: 2000 });
    expect(lensChip()).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/۲ واژه نشان‌شده/)).toBeInTheDocument();
  });

  it("composes with the lesson filter: lens + درس ۳ keeps only accept", async () => {
    useStudy.setState({ starredWords: ["3:accept", `1:${pairedL1.en.toLowerCase()}`] });
    render(<MyWordsView />);
    fireEvent.click(lensChip());
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`درس ۳: ${"هنر و فرهنگ"}`) }));
    await waitFor(() => expect(screen.queryByText(pairedL1.en)).not.toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText("accept")).toBeInTheDocument();
    expect(screen.getByText(/۱ واژه نشان‌شده/)).toBeInTheDocument();
  });

  it("composes with the search query under the lens", async () => {
    useStudy.setState({ starredWords: ["3:accept", `1:${pairedL1.en.toLowerCase()}`] });
    render(<MyWordsView />);
    fireEvent.click(lensChip());
    fireEvent.change(screen.getByPlaceholderText("جستجو میان واژه‌های نشان‌شده..."), {
      target: { value: pairedL1.en.slice(0, 4) },
    });
    await waitFor(() => expect(screen.queryByText("accept")).not.toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText(pairedL1.en)).toBeInTheDocument();
  });

  it("filtered-empty reset clears the lens too (no dead-end state)", async () => {
    useStudy.setState({ starredWords: ["3:accept", bare.key] });
    render(<MyWordsView />);
    fireEvent.click(lensChip());
    await waitFor(() => expect(screen.queryByText(bare.fa)).not.toBeInTheDocument(), { timeout: 2000 });
    fireEvent.change(screen.getByPlaceholderText("جستجو میان واژه‌های نشان‌شده..."), {
      target: { value: "zzzz" },
    });
    expect(screen.getByText("با این فیلترها واژه‌ای یافت نشد")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "نمایش همهٔ نشان‌شده‌ها" }));
    await waitFor(() => expect(screen.getByText(bare.fa)).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText("accept")).toBeInTheDocument();
    expect(lensChip()).toHaveAttribute("aria-pressed", "false");
  });
});
