// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 78 — چهارمین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// هفته‌نامهٔ پیشرفت (WeeklyReportSection) در کارنامه — ردیف «دفتر یخ».
// قراردادهایی که قفل می‌شوند:
//   ① ردیف دفتر یخ همیشه حاضر است (گزارش = تصویر کامل؛ صفرها هم دعوت‌اند)
//   ② مخزن/نجات/نجاتِ امروز از قرارداد freezeLedgerMeta می‌آیند
//   ③ مسیر یخِ بعدی: میله‌های ۳گانه فقط غیرِسقف؛ برچسب هم‌زبان خانه
//   ④ تساوی aria-label == title روی کل ردیف (هم‌قرارداد چیپ‌های هدر)
//   ⑤ ردیف نقطه‌های هدف دست‌نخورده مانده (هر دو ردیف کنار هم — رگرسیون)
// الگوی seed هم‌الگوی due-pill/goal-chip/freeze-badge: setState مستقیم.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy, todayStr, daysAgoKey } from "@/lib/study-store";
import WeeklyReportSection from "@/components/study/weekly-report";

// analytics در این ردیف مصرف نمی‌شود — ولی استور با آلودگیِ ناوبری امن است
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("دفتر یخ در هفته‌نامه — کامپوننت (Task 78)", () => {
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

  it("تازه‌وارد: ردیف حاضر است — «بی‌یخ» + «۰ از ۳ روزِ هدف‌دار» (گزارش تصویر کامل)", () => {
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("بی‌یخ");
    expect(ledger).toHaveTextContent("۰ از ۳ روزِ هدف‌دار");
    expect(ledger).toHaveTextContent("مسیر یخِ بعدی");
  });

  it("مخزن ۲ یخ: چیپ «۲ یخ در انبار» + aria==title روی ردیف", () => {
    useStudy.setState({ freezeCount: 2 });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("۲ یخ در انبار");
    expect(ledger.getAttribute("aria-label")).toBe(ledger.getAttribute("title"));
    expect(ledger.getAttribute("title")).toContain("دفتر یخ — ۲ یخ در انبار");
  });

  it("نجاتِ ۳ روز پیش: چیپ «۱ نجاتِ زنجیره در ۷ روزِ گذشته» با تیک", () => {
    useStudy.setState({ freezeCount: 1, freezeUsedDays: [daysAgoKey(3)] });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("۱ نجاتِ زنجیره در ۷ روزِ گذشته");
  });

  it("نجاتِ امروز: چیپ «نجات امروز» + عنوانِ نجات", () => {
    useStudy.setState({ freezeSavedDay: todayStr() });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("نجات امروز");
    expect(ledger.getAttribute("title")).toContain("امروز یخ، زنجیره را نجات داد");
  });

  it("سقفِ پُر (۲ یخ): میله‌های مسیر حذف — فقط برچسب «سقف یخ‌ها پر است»", () => {
    useStudy.setState({ freezeCount: 2 });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    expect(ledger).toHaveTextContent("سقف یخ‌ها پر است");
    // هیچ میلهٔ sky-500 در مسیر یخِ بعدی نیست (سقف فقط متن)
    const bars = ledger.querySelectorAll(".bg-sky-500");
    expect(bars.length).toBe(0);
  });

  it("زیرِ سقف: ۳ میلهٔ مسیر + ۲ پُر (bg-sky-500) برای ۲ روزِ هدف‌دار", () => {
    useStudy.setState({ freezeCount: 1, goalMetDays: [daysAgoKey(1), daysAgoKey(2)] });
    render(<WeeklyReportSection />);
    const ledger = screen.getByLabelText(/دفتر یخ/);
    const bars = ledger.querySelectorAll(".bg-sky-500");
    expect(bars.length).toBe(2);
    expect(ledger).toHaveTextContent("۲ از ۳ روزِ هدف‌دار");
  });

  it("رگرسیون: ردیف نقطه‌های هدف سر جایش است — دوتا ردیف کنار هم", () => {
    useStudy.setState({ goalMetDays: [todayStr()] });
    render(<WeeklyReportSection />);
    // ردیف هدف: برچسب «هدف روزانه (۱۰)»
    expect(screen.getByText(/هدف روزانه/)).toBeInTheDocument();
    // و دفتر یخ جدا و بعدش
    expect(screen.getByLabelText(/دفتر یخ/)).toBeInTheDocument();
  });
});
