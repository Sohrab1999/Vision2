// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 204 — the weakest-skill CTA on the home skill panel actually
// navigates to the routed target: synant → lesson tab 8 (synant),
// vocab → the lesson's flashcards. Locks the wiring between the pure
// skillPracticeTarget map and the store calls.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import SkillPanel from "@/components/study/practice/skill-panel";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ results: {}, view: { type: "home" }, lessonTab: "vocab" });
});

const cta = () => screen.getByRole("button", { name: /تمرین هدفمند/ });

describe("SkillPanel CTA — routing wiring", () => {
  it("weakest synant result «3:synant» → opens lesson 3 on the synant tab", () => {
    useStudy.setState({
      results: {
        "3:synant": { correct: 2, total: 8, percent: 25, at: new Date().toISOString() },
      },
    });
    render(<SkillPanel />);
    fireEvent.click(cta());
    const { view, lessonTab } = useStudy.getState();
    expect(view).toEqual({ type: "lesson", id: 3 });
    expect(lessonTab).toBe("synant");
  });

  it("weakest vocab result «2:vocab» → opens lesson 2 flashcards (vocab tab)", () => {
    useStudy.setState({
      results: {
        "2:vocab": { correct: 1, total: 8, percent: 12, at: new Date().toISOString() },
      },
    });
    render(<SkillPanel />);
    fireEvent.click(cta());
    const { view, lessonTab } = useStudy.getState();
    expect(view).toEqual({ type: "lesson", id: 2 });
    expect(lessonTab).toBe("vocab");
  });

  it("weakest grammar result «5:grammar» → opens lesson 5 on the grammar tab", () => {
    useStudy.setState({
      results: {
        "5:grammar": { correct: 3, total: 10, percent: 30, at: new Date().toISOString() },
      },
    });
    render(<SkillPanel />);
    fireEvent.click(cta());
    const { view, lessonTab } = useStudy.getState();
    expect(view).toEqual({ type: "lesson", id: 5 });
    expect(lessonTab).toBe("grammar");
  });

  it("weakest mistakes result «0:mistakes» → the cross-lesson review view", () => {
    useStudy.setState({
      results: {
        "0:mistakes": { correct: 1, total: 6, percent: 16, at: new Date().toISOString() },
      },
    });
    render(<SkillPanel />);
    fireEvent.click(cta());
    const { view } = useStudy.getState();
    expect(view).toEqual({ type: "review" });
  });
});
