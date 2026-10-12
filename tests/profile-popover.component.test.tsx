// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 82 — هشتمین سوژهٔ زیرساخت تست کامپوننت: پروفایلِ هدر و حلقهٔ
// طلاییِ نشانِ تازه (ProfilePopover + NewBadgeDot + useFreshBadges).
// قراردادهایی که قفل می‌شوند:
//   ① نشانِ تازه → کلاس پایدار new-badge-ring روی آواتار + نقطهٔ شمارنده
//   ② دیده‌شدن (markBadgesSeen واقعی) → حلقه و نقطه هر دو غیب می‌شوند —
//     یعنی چراغ دقیقاً با «توستِ خانه» خاموش می‌شود (تک‌نویسنده)
//   ③ بدون نشانِ تازه → آواتار ساده (بدون حلقه) — هدر بی‌سروصدا
//   ④ آواتارِ بی‌نام (fallback) هم حلقه می‌گیرد — قهرمان‌سازی شاملِ همه
// الگوی seed: setState مستقیم + ماک analytics/toast (الگوی ۷ سوژهٔ قبل).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import ProfilePopover from "@/components/study/profile/profile-popover";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

describe("حلقهٔ نشان تازه روی آواتار — کامپوننت (Task 82)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockClear();
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
      userName: "",
      avatarColor: "emerald",
    });
  });

  it("نشان تازه: آواتارِ نام‌دار حلقهٔ طلایی + نقطهٔ «۱» می‌گیرد", () => {
    useStudy.setState({ userName: "سارا", streak: 3, bestStreak: 3 });
    const { container } = render(<ProfilePopover />);
    const btn = screen.getByRole("button", { name: "پروفایل من" });
    expect(btn).toBeInTheDocument();
    const ring = container.querySelector(".new-badge-ring");
    expect(ring).not.toBeNull();
    expect(ring?.className).toContain("ring-amber-400");
    const dot = container.querySelector(".new-badge-dot");
    expect(dot).toHaveTextContent("۱");
  });

  it("دیده‌شدن → حلقه و نقطه هر دو خاموش (هم‌منبع با توستِ بخش نشان‌ها)", () => {
    useStudy.setState({ userName: "سارا", streak: 3, bestStreak: 3 });
    const { container, rerender } = render(<ProfilePopover />);
    expect(container.querySelector(".new-badge-ring")).not.toBeNull();
    act(() => {
      useStudy.setState({ seenBadges: ["streak-3"] });
    });
    rerender(<ProfilePopover />);
    expect(container.querySelector(".new-badge-ring")).toBeNull();
    expect(container.querySelector(".new-badge-dot")).toBeNull();
  });

  it("بدون نشان تازه: آواتار ساده — هدر بی‌سروصدا", () => {
    useStudy.setState({ userName: "سارا" });
    const { container } = render(<ProfilePopover />);
    expect(screen.getByRole("button", { name: "پروفایل من" })).toBeInTheDocument();
    expect(container.querySelector(".new-badge-ring")).toBeNull();
    expect(container.querySelector(".new-badge-dot")).toBeNull();
  });

  it("آواتارِ بی‌نام (fallback) هم حلقه می‌گیرد", () => {
    useStudy.setState({ streak: 3, bestStreak: 3 });
    const { container } = render(<ProfilePopover />);
    expect(container.querySelector(".new-badge-ring")).not.toBeNull();
    expect(container.querySelector(".new-badge-dot")).not.toBeNull();
  });
});
