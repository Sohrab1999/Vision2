// @vitest-environment jsdom
// ------------------------------------------------------------------
// unslop audit P2 (F2 / B-8a red) — flashcards flip keyboard contract.
// The flip card had role="button" + aria-label but NO tabIndex and NO
// key handler: keyboard users could not operate the core study surface.
// Contract locked here: focusable, Enter AND Space flip, aria-pressed
// announces state, other keys do nothing, Space never scrolls the page.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, fireEvent } from "@testing-library/react";
import Flashcards from "@/components/study/lesson/flashcards";
import { useStudy } from "@/lib/study-store";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

// minimal fixture — Flashcards reads only id/color/vocabulary of LessonData
const lesson = {
  id: 1,
  titleEn: "Lesson 1",
  titleFa: "درس ۱",
  tagline: "",
  color: "emerald",
  vocabulary: [{ en: "ability", fa: "توانایی" }],
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

const card = () =>
  document.querySelector('[role="button"][aria-label="برگرداندن کارت"]') as HTMLElement;

describe("flashcards flip — keyboard contract (unslop P2)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ known: {}, srs: {}, mistakes: {} } as never);
  });

  it("کارت focus‌پذیر است — role=button بدون tabIndex یعنی باگِ B-8a", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} />);
    expect(card()).toBeInTheDocument();
    expect(card()).toHaveAttribute("tabindex", "0");
  });

  it("Enter flip می‌کند، Space برمی‌گرداند — aria-pressed وضعیت را اعلام می‌کند", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} />);
    const el = card();
    expect(el).toHaveAttribute("aria-pressed", "false");
    fireEvent.keyDown(el, { key: "Enter" });
    expect(el.className).toContain("flipped");
    expect(el).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(el, { key: " " });
    expect(el.className).not.toContain("flipped");
    expect(el).toHaveAttribute("aria-pressed", "false");
  });

  it("کلیدِ بی‌ربط flip نمی‌کند؛ Space رفتارِ پیش‌فرضِ اسکرول را preventDefault می‌کند", () => {
    render(<Flashcards lesson={lesson} onExit={() => {}} />);
    const el = card();
    fireEvent.keyDown(el, { key: "a" });
    expect(el.className).not.toContain("flipped");
    const evt = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
  });
});
