// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 128 «هدفِ هفتگی» — حلقهٔ زندهٔ هدفِ هفتگی رویِ هفته‌نامه.
// قفل‌ها:
//   ① role=img با aria-label == title (هم‌قراردادِ دفتر یخ/چیپ‌های هدر)
//   ② مرکزِ حلقه = درصدِ فارسیِ همان weekGoalMeta — ۳روز = «۴۳٪»
//   ③ arc فقط وقتی pct>0 کشیده می‌شود (صفرِ واقعی نقطهٔ کاذب ندارد)
//   ④ برچسبِ «X از ۷ روزِ هدف» زیرِ sm پنهان (بودجهٔ موبایلِ ردیف)
//   ⑤ ۷/۷ = ۱۰۰٪ + جشنِ زمردی؛ نقطه‌های هدفِ روزانه دست‌نخورده (رگرسیون)
// الگوی seed هم‌الگوی دفتر یخ: setState مستقیم + daysAgoKey.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import WeeklyReportSection from "@/components/study/reports/weekly-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("حلقهٔ هدفِ هفتگی در هفته‌نامه — کامپوننت (Task 128)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      dayHistory: {},
      history: {},
      goalMetDays: [],
      dailyGoal: 10,
      streak: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
    });
  });

  it("سه روزِ هدف: role=img با aria هم‌قراردادِ title + مرکزِ «۴۳٪» + arc با dasharrayِ 43", () => {
    useStudy.setState({ goalMetDays: [daysAgoKey(0), daysAgoKey(1), daysAgoKey(2)] });
    render(<WeeklyReportSection />);
    const ring = screen.getByRole("img", { name: /۳ از ۷ روزِ هدف/ });
    expect(ring.getAttribute("title")).toContain("۳ از ۷ روزِ هدف");
    expect(ring.textContent).toContain("۴۳٪");
    const arc = ring.querySelector('circle[pathLength="100"]');
    expect(arc, "the arc circle exists for pct>0").not.toBeNull();
    expect(arc?.getAttribute("stroke")).toBe("url(#week-goal-arc)");
    expect(arc?.getAttribute("stroke-dasharray")).toBe("43 57");
  });

  it("برچسبِ «۳ از ۷ روزِ هدف» هم‌زبانِ PNG/A4، زیرِ sm پنهان (بودجهٔ موبایل)", () => {
    useStudy.setState({ goalMetDays: [daysAgoKey(0), daysAgoKey(1), daysAgoKey(2)] });
    render(<WeeklyReportSection />);
    const ring = screen.getByRole("img", { name: /۳ از ۷/ });
    const label = ring.parentElement?.querySelector("span.hidden");
    expect(label?.textContent).toBe("۳ از ۷ روزِ هدف");
    expect(label?.className).toContain("sm:inline");
  });

  it("هفتهٔ خالی: هیچ arc نیست (نقطهٔ کاذب ممنوع) + مرکزِ «۰٪» + track حاضر", () => {
    render(<WeeklyReportSection />);
    const ring = screen.getByRole("img", { name: /۰ از ۷ روزِ هدف/ });
    expect(ring.textContent).toContain("۰٪");
    expect(ring.querySelector('circle[pathLength="100"]')).toBeNull();
    const track = ring.querySelector('circle[stroke="var(--color-stone-200)"]');
    expect(track, "the stone-token track always renders").not.toBeNull();
  });

  it("۷/۷: «۱۰۰٪» + جشنِ زمردی در مرکز و برچسب + عنوانِ کامل‌شدن", () => {
    useStudy.setState({
      goalMetDays: [0, 1, 2, 3, 4, 5, 6].map((d) => daysAgoKey(d)),
    });
    render(<WeeklyReportSection />);
    const ring = screen.getByRole("img", { name: /۷ از ۷ روزِ هدف/ });
    expect(ring.textContent).toContain("۱۰۰٪");
    expect(ring.getAttribute("title")).toContain("کامل شد");
    const center = ring.querySelector("span");
    expect(center?.className).toContain("text-emerald-700");
    const arc = ring.querySelector('circle[pathLength="100"]');
    expect(arc?.getAttribute("stroke-dasharray")).toBe("100 0");
  });

  it("رگرسیون: نقطه‌های هدفِ روزانه (۷تا) کنارِ حلقه سرِ جایشان هستند", () => {
    useStudy.setState({ goalMetDays: [daysAgoKey(0), daysAgoKey(1), daysAgoKey(2)] });
    render(<WeeklyReportSection />);
    const ring = screen.getByRole("img", { name: /۳ از ۷/ });
    const row = ring.closest(".c-veil-60") as HTMLElement;
    expect(row, "the goal row hosts both the ring and the dots").not.toBeNull();
    // ۷ نقطهٔ روزانه = spanهای گردِ داخلِ گروهِ dir=ltr
    const dotsRow = row.querySelector('div[dir="ltr"]');
    expect(dotsRow?.querySelectorAll("span.rounded-full").length).toBe(7);
  });
});
