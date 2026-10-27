// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 150 — نشانِ ترکیبی زنجیره در هدر: جانشینِ کاملِ FreezeBadge +
// اسپنِ شعلهٔ header.tsx. قراردادهایی که قفل می‌شوند:
//   ① تازه‌واردِ کامل → هیچ رندر نمی‌شود (خموشی، هم‌قرارداد قدیم)
//   ② شعلهٔ لخت: «۹» + فلیم‌انیمیشن streak-flame + بدونِ مهمانِ یخ
//   ③ combo: مهمانِ یخ با کلاس streak-ice و «۲ یخ»؛ عنوانِ یک‌پارچه
//   ④ نجاتِ امروز: «نجات شد» در همان چیپ
//   ⑤ تساوی aria-label == title روی هر سه حالت (قراردادِ چیپ‌های هدر)
//   ⑥ ضربهٔ یخ‌دار → freeze_badge؛ ضربهٔ شعلهٔ لخت → streak_badge (نو —
//     شعله تا دیروز تنها عضوِ هدر با صفرِ تحلیل بود) + ناوبری واقعی
//   ⑦ بریک‌پوینت و پایهٔ خانواده: hidden + sm:inline-flex + c-chip-flame
// الگوی seed هم‌الگوی freeze-badge قدیم: setState مستقیم + vi.mock analytics.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy, todayStr } from "@/lib/study-store";
import StreakBadge from "@/components/study/practice/streak-badge";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("نشانِ ترکیبی زنجیره — کامپوننت (Task 150)", () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(trackEvent).mockClear();
    useStudy.setState({
      streak: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      view: { type: "dictionary" },
    });
  });

  it("تازه‌واردِ کامل (زنجیرهٔ صفر، بی‌یخ) → هیچ رندر نمی‌شود", () => {
    render(<StreakBadge />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("شعلهٔ لخت: «۹» + streak-flame + بدونِ مهمانِ یخ + عنوانِ عینِ چیپِ قدیم", () => {
    useStudy.setState({ streak: 9 });
    render(<StreakBadge />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveTextContent("۹");
    expect(chip.querySelector(".streak-flame")).not.toBeNull();
    expect(chip.querySelector(".streak-ice")).toBeNull();
    expect(chip.getAttribute("title")).toBe("زنجیرهٔ ۹ روزه مطالعه");
    expect(chip).toHaveAttribute("aria-label", chip.getAttribute("title"));
  });

  it("combo: مهمانِ یخ «۲ یخ» با کلاس streak-ice + عنوانِ یک‌پارچهٔ شعله؛ یخ", () => {
    useStudy.setState({ streak: 9, freezeCount: 2 });
    render(<StreakBadge />);
    const chip = screen.getByRole("button");
    const ice = chip.querySelector(".streak-ice");
    expect(ice).not.toBeNull();
    expect(ice).toHaveTextContent("۲ یخ");
    expect(chip.getAttribute("title")).toContain("زنجیرهٔ ۹ روزه مطالعه؛ ۲ یخِ زنجیره داری");
    expect(chip).toHaveAttribute("aria-label", chip.getAttribute("title"));
  });

  it("نجاتِ امروز: «نجات شد» در همان چیپ کنار شعله", () => {
    useStudy.setState({ streak: 5, freezeSavedDay: todayStr() });
    render(<StreakBadge />);
    const chip = screen.getByRole("button");
    expect(chip.querySelector(".streak-ice")).toHaveTextContent("نجات شد");
    expect(chip.getAttribute("title")).toContain("زنجیرهٔ ۵ روزه مطالعه؛ امروز یخ، زنجیره را نجات داد");
  });

  it("ضربهٔ یخ‌دار → freeze_badge + ناوبری واقعی به خانه", () => {
    useStudy.setState({ streak: 9, freezeCount: 2, view: { type: "exam" } });
    render(<StreakBadge />);
    fireEvent.click(screen.getByRole("button"));
    expect(trackEvent).toHaveBeenCalledWith("freeze_badge");
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("ضربهٔ شعلهٔ لخت → streak_badge (رویدادِ نو — تحلیلِ نخستینِ شعله)", () => {
    useStudy.setState({ streak: 9, freezeCount: 0, view: { type: "exam" } });
    render(<StreakBadge />);
    fireEvent.click(screen.getByRole("button"));
    expect(trackEvent).toHaveBeenCalledWith("streak_badge");
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("بریک‌پوینت هم‌قدیم + پایهٔ خانوادهٔ c-chip: hidden + sm:inline-flex + c-chip-flame", () => {
    useStudy.setState({ streak: 9, freezeCount: 2 });
    render(<StreakBadge />);
    const chip = screen.getByRole("button");
    expect(chip.className).toContain("hidden");
    expect(chip.className).toContain("sm:inline-flex");
    expect(chip.className).toContain("c-chip-flame");
  });
});
