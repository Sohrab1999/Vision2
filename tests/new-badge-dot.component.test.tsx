// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 82 — هفتمین سوژهٔ زیرساخت تست کامپوننت: نقطهٔ شمارندهٔ نشانِ
// تازه (NewBadgeDot) — قهرمان‌سازیِ دستاورد روی آواتارِ هدر.
// قراردادهایی که قفل می‌شوند:
//   ① بدون نشانِ تازه → هیچ رندر نمی‌شود (خ zero-noise مثل freezeBadge)
//   ② یک نشانِ دیده‌نشده → نقطهٔ «۱» + کلاس پایدار new-badge-dot
//     + aria-label فارسی + title == قرارداد صادرشده
//   ③ چند نشان تازه → رقم فارسی («۳»)
//   ④ همه دیده‌شده → نقطه غیب می‌شود (چراغ تا لحظهٔ دیدن روشن است)
// تعریفِ «تازه» از newBadgeIds می‌آید — این تست فقط سیم‌کشیِ hook→DOM است.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import NewBadgeDot, { NEW_BADGE_DOT_TITLE } from "@/components/study/profile/new-badge-dot";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("نقطهٔ نشان تازه — کامپوننت (Task 82)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      known: {},
      results: {},
      history: {},
      mistakes: {},
      streak: 0,
      bestStreak: 0,
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      rushBest: 0,
      rushBestCorrect: 0,
      rushGames: 0,
      freezeCount: 0,
      freezeUsedDays: [],
      freezeEarnedDay: "",
      goalMetDays: [],
      seenBadges: [],
    });
  });

  it("تازه‌وارد: هیچ نقطه‌ای رندر نمی‌شود (zero-noise)", () => {
    const { container } = render(<NewBadgeDot />);
    expect(container).toBeEmptyDOMElement();
  });

  it("یک نشان دیده‌نشده (streak-3): نقطهٔ «۱» + aria و title درست", () => {
    useStudy.setState({ streak: 3, bestStreak: 3 });
    render(<NewBadgeDot />);
    const dot = document.querySelector(".new-badge-dot");
    expect(dot).not.toBeNull();
    expect(dot).toHaveTextContent("۱");
    expect(dot).toHaveAttribute("title", NEW_BADGE_DOT_TITLE);
    expect(dot).toHaveAttribute("aria-label", "۱ نشان تازه");
    expect(dot).toHaveAttribute("role", "status");
  });

  it("سه نشان تازه (streak-3 + یخ‌ساز + اولین هدف): رقم فارسی «۳»", () => {
    useStudy.setState({ streak: 3, bestStreak: 3, freezeEarnedDay: "2026-10-05", goalMetDays: ["2026-10-12"] });
    render(<NewBadgeDot />);
    const dot = document.querySelector(".new-badge-dot");
    expect(dot).toHaveTextContent("۳");
    // رقم لاتین ممنوع — درسِ Task 81 در سطح داده هم اعمال شده
    expect(dot?.textContent).not.toMatch(/[0-9]/);
  });

  it("همهٔ بازها دیده‌شده‌اند → نقطه غیب می‌شود", () => {
    useStudy.setState({ streak: 3, bestStreak: 3, seenBadges: ["streak-3"] });
    const { container } = render(<NewBadgeDot />);
    expect(container).toBeEmptyDOMElement();
  });
});
