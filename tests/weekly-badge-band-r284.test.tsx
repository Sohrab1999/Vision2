// @vitest-environment jsdom
// ------------------------------------------------------------------
// r284 — نوار نشان‌ها در هفته‌نامه («نشان‌های من») — پاسخِ «تا کجا رسیده‌ام؟».
// قراردادهایی که قفل می‌شوند:
//  ① نوار همیشه حاضر است — تازه‌واردِ بی‌نشان: «۰ از ۵۳» + خطِ صادقِ خالی،
//     نه حذفِ نوار (هم‌قراردادِ نوارِ «گام بعدی»)
//  ② نشانِ پرچم‌دارِ هویت («اولین دیده‌شدن») با seenBadges مستقیم باز میشود —
//     همان ارزیابیِ واحدِ buildEvalInput؛ چیپ با کلاسِ تیرِ برنز و title=desc
//  ③ شمارنده با ارقامِ فارسی و قالبِ «X از ۵۳»
//  ④ منبعِ یگانه: TIER_CHIP فقط در lib/achievements — هیچ گزارشی رنگِ تیر را
//     دوباره تعریف نمیکند (کارنامهٔ رسمی هم import میکند، نه کپی)
//  ⑤ نوار در بی‌نشان‌ترین حالت هم ساختارِ ثابت دارد (badge-band یک‌بار)
// seed هم‌الگوی weekly-next-step.test: setState مستقیم روی استور.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import WeeklyReportSection from "@/components/study/reports/weekly-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("نوار نشان‌های هفته‌نامه (r284)", () => {
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
      bestStreak: 0,
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
      duelHistory: undefined as never,
      seenBadges: [],
      rushBest: 0,
      rushBestCorrect: 0,
      rushGames: 0,
    });
  });

  it("تازه‌واردِ بی‌نشان: نوار حاضر — «۰ از ۵۳» + خطِ صادق، بی‌چیپِ تیر", () => {
    render(<WeeklyReportSection />);
    const band = document.querySelector(".badge-band");
    expect(band).not.toBeNull();
    expect(band).toHaveTextContent("نشان‌های من");
    expect(band).toHaveTextContent("۰ از ۵۳");
    expect(band).toHaveTextContent("هنوز نشانی باز نشده");
    // هیچ چیپ تیری رندر نشده — فقط شمارنده
    const tierChips = band!.querySelectorAll("span[class*='or-chip-']");
    expect(tierChips.length).toBe(0);
  });

  it("پرچمِ «اولین دیده‌شدن» در seenBadges → چیپِ برنزیِ «اولین دیده‌شدن» + «۱ از ۵۳» + title=desc", () => {
    useStudy.setState({ seenBadges: ["first-visible"] });
    render(<WeeklyReportSection />);
    const band = document.querySelector(".badge-band")!;
    expect(band).toHaveTextContent("۱ از ۵۳");
    const chip = [...band.querySelectorAll("span")].find((s) =>
      s.textContent?.includes("اولین دیده‌شدن")
    );
    expect(chip).toBeDefined();
    expect(chip!.className).toContain("or-chip-bronze");
    expect(chip!.getAttribute("title")).toBe(
      "نامت را بگذار و با نخستین فعالیتت در جدول کلاس و فید دیده شو"
    );
    // خطِ خالی دیگر نیست
    expect(band.textContent).not.toContain("هنوز نشانی باز نشده");
  });

  it("شمارنده با فعالیتِ واقعی هم جواب میدهد — یک quiz امروز → «اولین قدم» هم باز میشود", () => {
    useStudy.setState({
      dayStat: { day: daysAgoKey(0), quizzes: 2, reviews: 0, words: 0, dictation: 0, rush: 0 } as never,
    });
    render(<WeeklyReportSection />);
    const band = document.querySelector(".badge-band")!;
    expect(band).toHaveTextContent("اولین قدم");
    expect(band.querySelector("span[class*='or-chip-']")).not.toBeNull();
  });

  it("قفلِ منبع: TIER_CHIP فقط در lib — هفتگی import میکند، رسمی دیگر تعریفِ لوکال ندارد", () => {
    const weekly = readFileSync(
      join(process.cwd(), "src/components/study/reports/weekly-report.tsx"),
      "utf8"
    );
    expect(weekly).toContain('from "@/lib/achievements"');
    expect(weekly).toContain("TIER_CHIP");
    // هیچ تعریفِ موازیِ تیر در هیچ گزارشی
    const official = readFileSync(
      join(process.cwd(), "src/components/study/reports/official-report.tsx"),
      "utf8"
    );
    expect(official).not.toMatch(/const TIER_CHIP/);
    expect(official).toContain("TIER_CHIP");
    const lib = readFileSync(join(process.cwd(), "src/lib/achievements.ts"), "utf8");
    expect(lib.match(/export const TIER_CHIP/g)?.length).toBe(1);
    // نوار دقیقاً یک‌بار در هفتگی
    expect(weekly.match(/badge-band/g)?.length).toBe(1);
  });
});
