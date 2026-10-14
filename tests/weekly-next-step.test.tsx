// @vitest-environment jsdom
// ------------------------------------------------------------------
// تسک ۱۸۶ — «گامِ بعدی» در هفته‌نامهٔ پیشرفت — چیپِ پیشنهادِ کانونی.
// قراردادهایی که قفل می‌شوند:
//  ① نوار همیشه حاضر است (تازه‌وارد هم پیشنهادِ درست می‌گیرد —
//     «درس ۱ · تست واژگان»: پیشنهادِ کانونیِ صادق، نه آمارِ ساختگی)
//  ② نردبان پیش می‌رود: واژگانِ درس ۱ ثبت‌شده → «درس ۱ · دیکته»
//  ③ هر شش گامِ درس ۱ → «درس ۲ · تست واژگان» (پیمایشِ درسی)
//  ④ هر ۱۸ گام → «همهٔ گام‌ها پوشیده» با تیک — عددِ ساختگی ممنوع
//  ⑤ aria==title روی نوار (هم‌قراردادِ دفتر یخ)
// منبعِ یگانه: buildCoverageMapِ ۱۷۴ — همان که ستونِ «گام بعدی» کاغذِ
// رسمی مصرف می‌کند؛ داشبورد و کاغذ هرگز واگرا نمی‌شوند.
// seed هم‌الگوی weekly-report.component.test: setState مستقیم روی استور.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import WeeklyReportSection from "@/components/study/reports/weekly-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const seedResults = (r: Record<string, { percent: number; at?: string }>) =>
  useStudy.setState({ results: r as never });

/** نوارِ «گام بعدی» — با aria-label (هم‌قراردادِ دفتر یخ) */
const nextStepBand = () => screen.getByLabelText(/گام بعدی/);
const chipText = () => nextStepBand().querySelector("span.c-chip-goal")!.textContent;

describe("گامِ بعدی در هفته‌نامه — کامپوننت (Task 186)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      dayHistory: {},
      history: {},
      results: {},
      known: {},
      goalMetDays: [],
      dailyGoal: 10,
      streak: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
      duelHistory: undefined as never,
    });
  });

  it("تازه‌وارد: نوار حاضر — چیپ «درس ۱ · تست واژگان» (نخستینِ کانونی) + aria==title", () => {
    render(<WeeklyReportSection />);
    const band = nextStepBand();
    expect(band).toHaveTextContent("گام بعدی");
    expect(chipText()).toBe("درس ۱ · تست واژگان");
    expect(band.getAttribute("aria-label")).toBe(band.getAttribute("title"));
    expect(band.getAttribute("title")).toContain("ترتیبِ کانونی");
  });

  it("واژگانِ درس ۱ ثبت‌شده → چیپ به «درس ۱ · دیکته» پیش می‌رود", () => {
    seedResults({ "1:vocab": { percent: 85, at: "2026-10-14" } });
    render(<WeeklyReportSection />);
    expect(chipText()).toBe("درس ۱ · دیکته");
  });

  it("مرزِ ۸۴/۸۵؟ فرقی نمی‌کند — گام از «تلاش‌نشده» می‌آید نه از نمره: ۴۰٪ هم گام را جلو می‌برد", () => {
    // صداقتِ پوشش: هر تلاشی (حتی ضعیف) ستون را پوشیده می‌کند — نردبانِ
    // وضعیت (ضعیف/خوب/عالی) داستانِ جدولِ رسمی است، نه انتخابِ گامِ بعدی
    seedResults({ "1:vocab": { percent: 40, at: "2026-10-14" } });
    render(<WeeklyReportSection />);
    expect(chipText()).toBe("درس ۱ · دیکته");
  });

  it("هر شش گامِ درس ۱ پوشیده → «درس ۲ · تست واژگان» (پیمایشِ درسی)", () => {
    seedResults({
      "1:vocab": { percent: 80, at: "2026-10-14" },
      "1:dictation": { percent: 80, at: "2026-10-14" },
      "1:listening": { percent: 80, at: "2026-10-14" },
      "1:writing": { percent: 80, at: "2026-10-14" },
      "1:vocab-konkuri": { percent: 80, at: "2026-10-14" },
      "1:grammar": { percent: 80, at: "2026-10-14" },
    });
    render(<WeeklyReportSection />);
    expect(chipText()).toBe("درس ۲ · تست واژگان");
  });

  it("هر ۳۶ گام پوشیده → «همهٔ گام‌ها پوشیده» با تیک — عنوانِ ادامهٔ مسیر", () => {
    seedResults({
      "1:vocab": { percent: 80, at: "2026-10-14" },
      "1:dictation": { percent: 80, at: "2026-10-14" },
      "1:listening": { percent: 80, at: "2026-10-14" },
      "1:writing": { percent: 80, at: "2026-10-14" },
      "1:vocab-konkuri": { percent: 80, at: "2026-10-14" },
      "1:grammar": { percent: 80, at: "2026-10-14" },
      "2:vocab": { percent: 80, at: "2026-10-14" },
      "2:dictation": { percent: 80, at: "2026-10-14" },
      "2:listening": { percent: 80, at: "2026-10-14" },
      "2:writing": { percent: 80, at: "2026-10-14" },
      "2:vocab-konkuri": { percent: 80, at: "2026-10-14" },
      "2:grammar": { percent: 80, at: "2026-10-14" },
      "3:vocab": { percent: 80, at: "2026-10-14" },
      "3:dictation": { percent: 80, at: "2026-10-14" },
      "3:listening": { percent: 80, at: "2026-10-14" },
      "3:writing": { percent: 80, at: "2026-10-14" },
      "3:vocab-konkuri": { percent: 80, at: "2026-10-14" },
      "3:grammar": { percent: 80, at: "2026-10-14" },
      "4:vocab": { percent: 80, at: "2026-10-14" },
      "4:dictation": { percent: 80, at: "2026-10-14" },
      "4:listening": { percent: 80, at: "2026-10-14" },
      "4:writing": { percent: 80, at: "2026-10-14" },
      "4:vocab-konkuri": { percent: 80, at: "2026-10-14" },
      "4:grammar": { percent: 80, at: "2026-10-14" },
      "5:vocab": { percent: 80, at: "2026-10-14" },
      "5:dictation": { percent: 80, at: "2026-10-14" },
      "5:listening": { percent: 80, at: "2026-10-14" },
      "5:writing": { percent: 80, at: "2026-10-14" },
      "5:vocab-konkuri": { percent: 80, at: "2026-10-14" },
      "5:grammar": { percent: 80, at: "2026-10-14" },
      "6:vocab": { percent: 80, at: "2026-10-14" },
      "6:dictation": { percent: 80, at: "2026-10-14" },
      "6:listening": { percent: 80, at: "2026-10-14" },
      "6:writing": { percent: 80, at: "2026-10-14" },
      "6:vocab-konkuri": { percent: 80, at: "2026-10-14" },
      "6:grammar": { percent: 80, at: "2026-10-14" },
    });
    render(<WeeklyReportSection />);
    const band = nextStepBand();
    expect(chipText()).toBe("همهٔ گام‌ها پوشیده");
    expect(band.querySelector("span.c-chip-goal svg")).not.toBeNull();
    expect(band.getAttribute("title")).toContain("مرورِ هوشمند");
  });

  it("دو گامِ خالیِ پی‌درپیِ دو درس: اولویت با درسِ پایین‌تر (ترتیبِ کانونیِ درسی هم هست)", () => {
    seedResults({
      "2:dictation": { percent: 60, at: "2026-10-14" },
      "3:listening": { percent: 60, at: "2026-10-14" },
    });
    render(<WeeklyReportSection />);
    // درس ۱ کاملاً خالی → نخستینِ gapِ آن «تست واژگان» است
    expect(chipText()).toBe("درس ۱ · تست واژگان");
  });
});
