// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 76 — دومین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// چیپ هدف امروز در هدر. قراردادهایی که قفل می‌شوند:
//   ① روز کهنه/آینده صفر دیده می‌شود (گارد dayStat.day === today)
//   ② شمارش فقط reviews+quizzes (واژهٔ نو آلوده نمی‌کند — هم‌قرارداد
//     goalAndFreezePatch)
//   ③ حالت برآورده: آیکن تیک + کسر ۱۰/۱۰
//   ④ کلیک → رویداد goal_chip + بازگشت واقعی به خانه (اکشن اسلایس
//     ناوبری ماک نمی‌شود — وضعیت واقعی store ادعا می‌شود)
// الگوی seed هم‌الگوی فایل due-pill: setState مستقیم روی store واقعی
// (skipHydration) + vi.mock برای analytics.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy, todayStr, daysAgoKey } from "@/lib/study-store";
import GoalChip from "@/components/study/practice/goal-chip";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const today = () => todayStr();

describe("چیپ هدف امروز — کامپوننت (Task 76)", () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(trackEvent).mockClear();
    useStudy.setState({
      dailyGoal: 10,
      dayStat: { day: today(), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
      view: { type: "exam" },
    });
  });

  it("روز نو: ۰/۱۰ با آیکن هدف — نه تیک", () => {
    render(<GoalChip />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveAttribute("aria-label", expect.stringContaining("۱۰ فعالیت تا امن‌شدن زنجیره"));
    expect(chip.textContent).toContain("۰/۱۰");
    expect(chip.textContent).not.toContain("۱۰/۱۰");
  });

  it("پیشرفت زنده: ۳+۴=۷ از ۱۰؛ واژهٔ نو=۹ آلوده نمی‌کند (قرارداد زنجیره)", () => {
    useStudy.setState({
      dayStat: { day: today(), reviews: 3, quizzes: 4, words: 9, dictation: 2, rush: 1 },
    });
    render(<GoalChip />);
    const chip = screen.getByRole("button");
    expect(chip).toHaveAttribute(
      "aria-label",
      "۷ از ۱۰ فعالیت — ۳ فعالیت تا امن‌شدن زنجیره"
    );
    expect(chip.textContent).toContain("۷");
    expect(chip.textContent).not.toContain("۱۶"); // words/dictation/rush جمع نشده‌اند
  });

  it("برآورده: ۶+۴ → کسر ۱۰/۱۰ و عنوان پاداش", () => {
    useStudy.setState({
      dayStat: { day: today(), reviews: 6, quizzes: 4, words: 0, dictation: 0, rush: 0 },
    });
    render(<GoalChip />);
    const chip = screen.getByRole("button");
    expect(chip.getAttribute("aria-label")).toContain("هدف برآورده شد");
    expect(chip.textContent).toContain("۱۰/۱۰");
  });

  it("روز کهنه: dayStat دیروز صفر دیده می‌شود (گارد امروز)", () => {
    useStudy.setState({
      dayStat: { day: daysAgoKey(1), reviews: 9, quizzes: 9, words: 0, dictation: 0, rush: 0 },
    });
    render(<GoalChip />);
    expect(screen.getByRole("button").textContent).toContain("۰/۱۰");
  });

  it("کلیک → رویداد goal_chip + بازگشت واقعی به خانه", () => {
    useStudy.setState({
      dayStat: { day: today(), reviews: 1, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    });
    render(<GoalChip />);
    fireEvent.click(screen.getByRole("button"));
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith("goal_chip");
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  // Task 123 — زیرِ ۳۲۰px بودجهٔ هدر سرریز می‌شد (OV=19px زنده اندازه‌گیری
  // شد): چیپِ هدف با hidden min-[320px]:inline-flex از ۲۸۰px حذف می‌شود؛
  // jsdom چیدمان ندارد — قرارداد = کلاس (همان سنّتِ هیروی ۱۲۳)
  it("بودجهٔ هدر: زیرِ ۳۲۰px پنهان، از ۳۲۰px inline-flex (کلاسِ ضد-سرریز)", () => {
    render(<GoalChip />);
    const chip = screen.getByRole("button");
    expect(chip.className).toContain("hidden");
    expect(chip.className).toContain("min-[320px]:inline-flex");
    expect(chip.className).not.toMatch(/(^|\s)inline-flex(\s|$)/); // پایهٔ همیشه‌نمایانِ کهنه ممنوع
  });
});
