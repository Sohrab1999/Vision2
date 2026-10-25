// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 77 — سومین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// نشانگر یخِ زنجیره در هدر. قراردادهایی که قفل می‌شوند:
//   ① تازه‌وارد/بی‌یخ → هیچ رندر نمی‌شود (خموشی، هم‌قرارداد حبهٔ مرور)
//   ② مخزن: برچسب «۲ یخ» + تساوی aria-label == title
//   ③ نجاتِ امروز: «نجات شد» با titleِ نجات
//   ④ کلیک → رویداد freeze_badge + بازگشت واقعی به خانه (اکشن اسلایس
//     ناوبری ماک نمی‌شود — وضعیت واقعی store ادعا می‌شود)
//   ⑤ بریک‌پوینت هم‌شعله: کلاس‌های hidden + sm:inline-flex (واکنش‌گرایی
//     سطح CSS نه رندر شرطی — الگوی فایل due-pill)
// الگوی seed هم‌الگوی due-pill/goal-chip: setState مستقیم روی store
// واقعی (skipHydration) + vi.mock برای analytics.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy, todayStr } from "@/lib/study-store";
import FreezeBadge from "@/components/study/practice/freeze-badge";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("نشانگر یخِ زنجیره — کامپوننت (Task 77)", () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(trackEvent).mockClear();
    useStudy.setState({
      freezeCount: 0,
      freezeSavedDay: "",
      goalMetDays: [],
      freezeEarnedDay: "",
      view: { type: "dictionary" },
    });
  });

  it("تازه‌وارد (بی‌یخ، بدون نجات) → هیچ رندر نمی‌شود", () => {
    render(<FreezeBadge />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("مخزن ۲ یخ: برچسب «۲ یخ» + تساوی aria-label و title با قرارداد پوشش", () => {
    useStudy.setState({ freezeCount: 2 });
    render(<FreezeBadge />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveTextContent("۲ یخ");
    expect(chip).toHaveAttribute("aria-label", chip.getAttribute("title"));
    expect(chip.getAttribute("title")).toContain("۲ یخِ زنجیره داری");
  });

  it("نجات امروز: «نجات شد» + عنوانِ نجات‌دادن زنجیره", () => {
    useStudy.setState({ freezeCount: 0, freezeSavedDay: todayStr() });
    render(<FreezeBadge />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveTextContent("نجات شد");
    expect(chip.getAttribute("title")).toContain("زنجیره را نجات داد");
  });

  it("کلیک → رویداد freeze_badge + ناوبری واقعی به خانه", () => {
    useStudy.setState({ freezeCount: 2, view: { type: "exam" } });
    render(<FreezeBadge />);
    fireEvent.click(screen.getByRole("button"));
    expect(trackEvent).toHaveBeenCalledWith("freeze_badge");
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("واکنش‌گرایی سطح CSS: کلاس hidden برای موبایل + sm:inline-flex برای دسکتاپ", () => {
    useStudy.setState({ freezeCount: 1 });
    render(<FreezeBadge />);
    const chip = screen.getByRole("button");
    expect(chip.className).toContain("hidden");
    expect(chip.className).toContain("sm:inline-flex");
  });
});
