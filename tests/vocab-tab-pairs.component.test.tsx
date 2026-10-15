// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 205 — booklet syn/ant pairs land on the lesson VOCAB TAB cards
// (the biggest word surface still without them): same shared index the
// dictionary / WOTD / flashcards use (tasks 203/204).
//   ① a paired word renders its chips (≈ emerald / ↔ rose)
//   ② tapping a chip speaks the counterpart AND does NOT toggle the
//     card's «بلدم» (stopPropagation — the card itself toggles known)
//   ③ a pair-less word stays chipless (no fake zeros)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import VocabTab from "@/components/study/lesson/vocab-tab";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
import { speak } from "@/lib/speak";

// minimal fixture — VocabTab reads id/color/vocabulary of LessonData;
// the real lesson-3 rows ride along through the SHARED index (lessons
// barrel), exactly like production (homonym-safe all-lesson lookup)
const lesson3Fixture = {
  id: 3,
  titleEn: "Lesson 3",
  titleFa: "درس ۳",
  tagline: "",
  color: "rose",
  vocabulary: [
    { en: "accept", fa: "پذیرفتن" }, // booklet: ↔ refuse / ↔ reject
    { en: "zzzunpairedword", fa: "بی‌جفت" },
  ],
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

const index = buildSynAntIndex(lessons);
const acceptPairs = synAntPairsFor(index, "accept");

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {}, starredWords: [] });
  vi.mocked(speak).mockClear();
});

describe("VocabTab — booklet pair chips (round 205)", () => {
  it("the booklet really carries the accept pairs (fixture honesty — bidirectional index)", () => {
    // accept lives in lessons 3 AND 4 — the shared index sees both rows:
    // ↔ reject (lesson 3's own row) + ↔ refuse (lesson 4's row, mirrored)
    const others = acceptPairs.map((p) => p.other);
    expect(others).toContain("refuse");
    expect(others).toContain("reject");
  });

  it("renders the paired word's chips with tap-to-speak labels", () => {
    render(<VocabTab lesson={lesson3Fixture} />);
    const labels = screen.getAllByRole("button").map((b) => b.getAttribute("aria-label") ?? "");
    expect(labels).toContain("متضادِ accept: refuse — روخوانی");
    expect(labels).toContain("متضادِ accept: reject — روخوانی");
    // the counterpart text rides its own [dir=ltr] span inside the chip
    expect(screen.getByText("refuse", { selector: "[dir='ltr']" })).toBeInTheDocument();
    expect(screen.getByText("reject", { selector: "[dir='ltr']" })).toBeInTheDocument();
  });

  it("tapping a pair chip speaks the counterpart and does NOT toggle «بلدم»", () => {
    render(<VocabTab lesson={lesson3Fixture} />);
    const chip = screen.getByRole("button", { name: "متضادِ accept: refuse — روخوانی" });
    fireEvent.click(chip);
    expect(speak).toHaveBeenCalledWith("refuse", 0.95);
    // stopPropagation: the card's own onClick (toggleKnown) never fired —
    // the store stays clean
    expect(useStudy.getState().known["3:accept"]).toBeFalsy();
    expect(Object.keys(useStudy.getState().known)).toHaveLength(0);
  });

  it("pair-less words stay chipless on the vocab tab too", () => {
    render(<VocabTab lesson={lesson3Fixture} />);
    // «accept» has chips, the bare word has none — scope to its own card text
    const bareCard = screen.getByText("بی‌جفت").closest("div.min-w-0") as HTMLElement;
    expect(bareCard.querySelector(".dict-pair-chip")).toBeNull();
    // and the paired card DOES carry chips (contrast within the same render)
    const pairedCard = screen.getByText("پذیرفتن").closest("div.min-w-0") as HTMLElement;
    expect(pairedCard.querySelectorAll(".dict-pair-chip").length).toBeGreaterThan(0);
  });

  it("card click still toggles known (the chip didn't swallow the card's own contract)", () => {
    render(<VocabTab lesson={lesson3Fixture} />);
    fireEvent.click(screen.getByText("پذیرفتن").closest('[role="button"]') as HTMLElement);
    expect(useStudy.getState().known["3:accept"]).toBe(true);
  });
});
