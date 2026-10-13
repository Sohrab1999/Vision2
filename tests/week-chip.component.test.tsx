// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 129 «چیپِ هفته در هدر» — مینی‌حلقهٔ هدفِ هفتگی، همسایهٔ چیپِ
// امروز (Task 76). قراردادهایی که قفل می‌شوند:
//   ① زبانِ همان قراردادِ حلقهٔ هفته‌نامه: aria == title، «X از ۷ روزِ هدف»
//   ② arc دوقلویِ حلقهٔ ۱۲۸: dasharray «43 57» برای ۳ روز؛ pct=۰ هیچ
//      arc نمی‌کشد (نقطهٔ کاذبِ linecap-round ممنوع)
//   ③ مرزِ پنجره از سمتِ store: روزِ هفتمِ قبل شمرده نمی‌شود
//   ④ حالتِ کامل ۷/۷: arc «100 0» + پاداشِ بوردرِ زمردی
//   ⑤ کلیک → رویداد week_chip + dispatchِ open-report (ناوبری عوض
//      نمی‌شود — هفته‌نامه رویِ همان نما باز می‌شود)
//   ⑥ بودجهٔ هدر: زیرِ sm پنهان (هم‌خانوادهٔ شعلهٔ زنجیره — درسِ ۱۲۳)
//   ⑦ track = توکنِ سنگی — دوقلوییِ track با حلقهٔ هفته‌نامه
// الگوی seed هم‌الگوی فایل goal-chip: setState مستقیم روی store واقعی
// (skipHydration) + vi.mock برای analytics.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import WeekChip from "@/components/study/practice/week-chip";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("چیپ هفته — کامپوننت (Task 129)", () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(trackEvent).mockClear();
    useStudy.setState({ goalMetDays: [] });
  });

  it("هفتهٔ خالی: حلقهٔ ۰٪ بدونِ arc — صداقتِ صفر (نقطهٔ کاذب ممنوع)", () => {
    render(<WeekChip />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveAttribute("aria-label", expect.stringContaining("۰ از ۷ روزِ هدف"));
    expect(chip.querySelector("circle[pathLength=\"100\"]")).toBeNull();
    expect(chip.querySelector("circle[stroke=\"var(--color-stone-200)\"]")).not.toBeNull(); // track حاضر
  });

  it("هفتهٔ زنده: ۳ روزِ هدف → dasharray «43 57» + aria == title (قرارداد ۷۸④)", () => {
    const gm = [daysAgoKey(0), daysAgoKey(1), daysAgoKey(2)];
    useStudy.setState({ goalMetDays: gm });
    render(<WeekChip />);
    const chip = screen.getByRole("button");
    expect(chip.getAttribute("aria-label")).toBe(
      "۳ از ۷ روزِ هدف — این هفته: ۴ روزِ هدفِ دیگر تا حلقهٔ کامل"
    );
    expect(chip.getAttribute("title")).toBe(chip.getAttribute("aria-label"));
    const arc = chip.querySelector("circle[pathLength=\"100\"]");
    expect(arc).not.toBeNull();
    expect(arc!.getAttribute("stroke-dasharray")).toBe("43 57");
    expect(arc!.getAttribute("stroke")).toBe("url(#week-chip-arc)"); // همان گرادیانِ PNG/زنده
  });

  it("مرزِ پنجره از سمتِ store: روزِ هفتمِ قبل بیرون است، ششمین داخل", () => {
    useStudy.setState({ goalMetDays: [daysAgoKey(6)] });
    render(<WeekChip />);
    const arc = screen.getByRole("button").querySelector("circle[pathLength=\"100\"]");
    expect(arc!.getAttribute("stroke-dasharray")).toBe("14 86");
    cleanup();
    useStudy.setState({ goalMetDays: [daysAgoKey(7)] });
    render(<WeekChip />);
    expect(screen.getByRole("button").querySelector("circle[pathLength=\"100\"]")).toBeNull();
  });

  it("کامل ۷/۷: arc «100 0» + پاداشِ بوردرِ زمردی (عنوانِ جشن)", () => {
    const gm = [0, 1, 2, 3, 4, 5, 6].map((n) => daysAgoKey(n));
    useStudy.setState({ goalMetDays: gm });
    render(<WeekChip />);
    const chip = screen.getByRole("button");
    expect(chip.getAttribute("aria-label")).toContain("کامل شد");
    const arc = chip.querySelector("circle[pathLength=\"100\"]");
    expect(arc!.getAttribute("stroke-dasharray")).toBe("100 0");
    expect(chip.className).toContain("border-emerald-600/70");
    expect(chip.className).not.toContain("c-card");
  });

  it("کلیک → رویداد week_chip + dispatchِ open-report (بدونِ تغییرِ ناوبری)", () => {
    const dispatched = vi.fn();
    window.addEventListener("open-report", dispatched);
    useStudy.setState({ goalMetDays: [daysAgoKey(0)], view: { type: "dictionary" } });
    render(<WeekChip />);
    fireEvent.click(screen.getByRole("button"));
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith("week_chip");
    expect(dispatched).toHaveBeenCalledTimes(1);
    expect(useStudy.getState().view).toEqual({ type: "dictionary" }); // ناوبری دست‌نخورده
    window.removeEventListener("open-report", dispatched);
  });

  it("بودجهٔ هدر: زیرِ sm پنهان، از sm inline-flex (کلاسِ ضد-سرریز — هم‌خانوادهٔ شعله)", () => {
    render(<WeekChip />);
    const chip = screen.getByRole("button");
    expect(chip.className).toContain("hidden");
    expect(chip.className).toContain("sm:inline-flex");
    expect(chip.className).not.toMatch(/(^|\s)inline-flex(\s|$)/); // پایهٔ همیشه‌نمایان ممنوع
  });

  it("دوقلوییِ track: توکنِ سنگی — در دارک خودش تیره می‌شود، صفرِ قانونِ نو", () => {
    render(<WeekChip />);
    const track = screen.getByRole("button").querySelector("circle[stroke=\"var(--color-stone-200)\"]");
    expect(track).not.toBeNull(); // همان توکنِ حلقهٔ هفته‌نامه (۱۲۸) — دارکِ مجانی
  });
});
