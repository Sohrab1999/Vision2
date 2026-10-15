// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 204 — word-of-day hardening + pair chips, flashcard back pairs:
//   ① WOTD lesson label bug: the shelf grew to 12 lessons but the label
//     only knew three ordinals — lesson ≥4 wrongly said «درس سوم»
//   ② WOTD card carries its booklet syn/ant pairs (same index as the
//     dictionary, task 203) with tap-to-speak counterparts
//   ③ flashcard answer face carries the same pairs (tap speaks, does
//     NOT flip the card back — stopPropagation)
//   ④ pair-less words stay chipless (no fake zeros)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import WordOfDay from "@/components/study/lesson/word-of-day";
import Flashcards from "@/components/study/lesson/flashcards";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
import { speak } from "@/lib/speak";

// replicate the deterministic daily pick (same seed formula as the component)
const pick = (() => {
  const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
  const d = new Date();
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  return all[seed % all.length];
})();

const ORDINALS = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم", "یازدهم", "دوازدهم"];

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {} });
  vi.mocked(speak).mockClear();
});

describe("WordOfDay — lesson label bug (round 204)", () => {
  it("labels the picked lesson with ITS OWN ordinal — never a wrong one", () => {
    render(<WordOfDay />);
    const expected = `درس ${ORDINALS[pick.lessonId - 1]}`;
    // the label chip exists and names the right lesson
    expect(screen.getByText(expected)).toBeInTheDocument();
    // and no other ordinal label leaks onto the card
    for (const o of ORDINALS) {
      if (o === ORDINALS[pick.lessonId - 1]) continue;
      expect(screen.queryByText(`درس ${o}`)).toBeNull();
    }
  });

  it("every lesson id 1..12 maps to an ordinal (the bug was ids ≥4)", () => {
    for (const l of lessons) {
      expect(ORDINALS[l.id - 1], `lesson ${l.id} ordinal`).toBeTruthy();
    }
  });
});

describe("WordOfDay — booklet pair chips", () => {
  const index = buildSynAntIndex(lessons);
  const pairs = synAntPairsFor(index, pick.en);

  it("renders a chip for each booklet pair of today's word (up to 3)", () => {
    render(<WordOfDay />);
    if (pairs.length === 0) {
      // today's word is pair-less: card stays chipless, no fake zeros
      expect(screen.queryByTitle("روخوانی جفت")).toBeNull();
      return;
    }
    // honest count: one speak-button per chip, capped at 3 (r210: today's
    // word can carry several pairs — getByTitle would die on multiplicity)
    const chips = screen.getAllByTitle("روخوانی جفت");
    expect(chips.length).toBe(Math.min(pairs.length, 3));
    const first = pairs[0];
    expect(screen.getByText(first.other, { selector: "[dir='ltr']" })).toBeInTheDocument();
  });

  it("tapping a pair chip speaks the counterpart", () => {
    if (pairs.length === 0) return; // day-dependent: skip on pair-less days
    render(<WordOfDay />);
    const chip = screen.getByRole("button", {
      name: `${pairs[0].kind === "syn" ? "مترادف" : "متضاد"}ِ ${pick.en}: ${pairs[0].other} — روخوانی`,
    });
    fireEvent.click(chip);
    expect(speak).toHaveBeenCalledWith(pairs[0].other, 0.95);
  });
});

// minimal fixture — Flashcards reads id/color/vocabulary of LessonData
const lesson3Fixture = {
  id: 3,
  titleEn: "Lesson 3",
  titleFa: "درس ۳",
  tagline: "",
  color: "amber",
  vocabulary: [{ en: "borrow", fa: "قرض گرفتن" }],
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

describe("Flashcards — pair chips on the answer face", () => {
  it("flipped card of «borrow» shows the booklet antonym chip ↔ lend", () => {
    render(<Flashcards lesson={lesson3Fixture} onExit={() => {}} />);
    // back face content is hidden until flipped (flip-card CSS), but the
    // chip BUTTON exists in the DOM only when pairs resolve — assert it
    const flipCard = document.querySelector('[role="button"][aria-label="برگرداندن کارت"]') as HTMLElement;
    expect(flipCard).toBeInTheDocument();
    fireEvent.click(flipCard); // flip → back face active
    expect(screen.getByText("lend", { selector: "[dir='ltr']" })).toBeInTheDocument();
    expect(screen.getByTitle("روخوانی جفت")).toBeInTheDocument();
  });

  it("tapping the pair chip speaks the counterpart without flipping back", () => {
    render(<Flashcards lesson={lesson3Fixture} onExit={() => {}} />);
    const flipCard = document.querySelector('[role="button"][aria-label="برگرداندن کارت"]') as HTMLElement;
    fireEvent.click(flipCard); // flip to back
    fireEvent.click(screen.getByTitle("روخوانی جفت"));
    expect(speak).toHaveBeenCalledWith("lend", 0.95);
    // stopPropagation kept the card flipped
    expect(flipCard.getAttribute("aria-pressed")).toBe("true");
  });

  it("pair-less words stay chipless (no fake zeros)", () => {
    const bare = {
      ...lesson3Fixture,
      vocabulary: [{ en: "zzzunpairedword", fa: "بی‌جفت" }],
    } as unknown as LessonData;
    render(<Flashcards lesson={bare} onExit={() => {}} />);
    const flipCard = document.querySelector('[role="button"][aria-label="برگرداندن کارت"]') as HTMLElement;
    fireEvent.click(flipCard);
    expect(screen.queryByTitle("روخوانی جفت")).toBeNull();
  });
});
