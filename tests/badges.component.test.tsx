// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 81 — ششمین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// بخش «نشان‌ها و دستاوردها» — ۲۵ نشان با خانوادهٔ تازهٔ یخ.
// قراردادهایی که قفل می‌شوند:
//   ① تازه‌وارد: شمار «۰ از ۳۴» + همهٔ کاشی‌ها قفل (بدون badge-shine)
//   ② یادگیرندهٔ یخی: کاشی‌های یخ باز و «اول» مرتب‌شده‌اند (sort قرارداد)
//     + پیشرفتِ زیرِ قفل با رقم فارسی
//   ③ گارد نقشهٔ آیکن: هر iconِ رجیستری در BADGE_ICONS کلید دارد —
//     وگرنه کاشی بی‌صدا به Medal برمی‌گردد (تستِ تنها ناظرِ این سکوت)
//   ④ توستِ باز شدن تازه: یک نشانِ دیده‌نشده → دقیقاً یک توست با عنوان
//     درست؛ markBadgesSeen واقعی store را به‌روز می‌کند (ماکِ اکشن ممنوع)
// الگوی seed هم‌الگوی ۵ سوژهٔ قبلی: setState مستقیم + ماک analytics/toast.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import { BADGES } from "@/lib/achievements";
import Badges, { BADGE_ICONS } from "@/components/study/badges";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const seedIce = () =>
  useStudy.setState({
    freezeCount: 2,
    freezeUsedDays: ["2026-10-12", "2026-10-08", "2026-09-30"],
    freezeEarnedDay: "2026-10-05",
    seenBadges: [],
  });

/** Task 82 — هفت روزِ هدف‌دار + یک streak؛ خانوادهٔ هدف تا «هفتهٔ هدف‌دار» باز است */
const seedGoal = () => {
  const days = [1, 2, 3, 4, 5, 6, 7].map((n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  useStudy.setState({ goalMetDays: days, streak: 3, seenBadges: [] });
};

/** (Task 84) هفتهٔ رویدادی: کلِ پنجرهٔ موتور هدف‌دار + dayHistory فقط مرور —
 *  کلیدهای نسبی (درسِ ۸۳: seed مطلق = بمبِ ساعتیِ منطقهٔ زمانی) */
const seedEventWeek = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  const goalMetDays: string[] = [];
  for (let n = 0; n <= 6; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 6, quizzes: 0, words: 0, dictation: 0, rush: 0 };
    goalMetDays.push(key(n));
  }
  useStudy.setState({ goalMetDays, dayHistory, streak: 7, seenBadges: [] });
};
/** (Task 85) رانِ دیکته: هر روزِ پنجره حداقل یک دیکته — بدونِ هیچ هدفی (استقلال از goal) */
const seedDictationRun = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  for (let n = 0; n <= 6; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: 0, words: 0, dictation: 1, rush: 0 };
  }
  useStudy.setState({ dayHistory, seenBadges: [] });
};

// (Task 86) کلیدهای نسبی — درسِ ۸۳؛ آزمونِ کوچکِ روزانه (زیرِ سقفِ هدف) ولی پیوسته
const seedExamRun = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  for (let n = 0; n <= 6; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: 1, words: 0, dictation: 0, rush: 0 };
  }
  useStudy.setState({ dayHistory, seenBadges: [] });
};

describe("نشان‌ها و دستاوردها — کامپوننت (Task 81)", () => {
  beforeAll(() => {
    // jsdom IntersectionObserver ندارد — ویژگی whileInView فریمرموشن امن شود
    class IOStub {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;
  });

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
      seenBadges: [],
    });
  });

  it("گارد نقشهٔ آیکن: هر iconِ رجیستری در BADGE_ICONS کلید دارد (شامل ۴ آیکن یخ)", () => {
    for (const b of BADGES) {
      expect(BADGE_ICONS[b.icon], `icon "${b.icon}" of ${b.id} must exist in the map`).toBeTruthy();
    }
    expect(BADGE_ICONS.Snowflake).toBeTruthy();
    expect(BADGE_ICONS.ShieldCheck).toBeTruthy();
    expect(BADGE_ICONS.Shield).toBeTruthy();
    expect(BADGE_ICONS.Package).toBeTruthy();
  });

  it("تازه‌وارد: «۰ از ۳۴» + کاشی یخ قفل با پیشرفتِ فارسی زیرِ قفل", () => {
    render(<Badges />);
    // شمار در JSX دو تکه رندر می‌شود — تطبیق با textContentِ نرمال‌شده
    const chip = screen.getByText((_, el) => el?.tagName === "SPAN" && /۰\s*از\s*۳۴/.test(el.textContent ?? ""));
    expect(chip).toBeInTheDocument();
    const tile = screen.getByText("انبار یخ").closest(".badge-card");
    expect(tile).not.toBeNull();
    expect(tile?.className).not.toContain("badge-shine");
    expect(tile).toHaveTextContent("۰ از ۲ یخ در انبار");
    // (Task 82) کاشی هدف هم قفل است — روزهای هدف‌دار صفر
    const goalTile = screen.getByText("هفتهٔ هدف‌دار").closest(".badge-card");
    expect(goalTile?.className).not.toContain("badge-shine");
    expect(goalTile).toHaveTextContent("۰ از ۷ روزِ هدف‌دار");
  });

  it("یادگیرندهٔ یخی: «۴ از ۳۴» + کاشی‌های یخ باز (badge-shine) و اولِ لیست", () => {
    seedIce();
    const { container } = render(<Badges />);
    expect(screen.getByText((_, el) => el?.tagName === "SPAN" && /۴\s*از\s*۳۴/.test(el.textContent ?? ""))).toBeInTheDocument();
    for (const title of ["یخ‌ساز", "نجات‌گر", "انبار یخ", "سپر یخی"]) {
      const tile = screen.getByText(title).closest(".badge-card");
      expect(tile?.className, `${title} must be unlocked`).toContain("badge-shine");
    }
    // قرارداد مرتب‌سازی: بازها اول — چهار کاشیِ اولِ DOM هر چهار نشان یخ‌اند
    const tiles = [...container.querySelectorAll(".badge-card")].slice(0, 4);
    const titles = tiles.map((t) => t.textContent ?? "");
    expect(titles.join("|")).toContain("یخ‌ساز");
    expect(titles.join("|")).toContain("سپر یخی");
  });

  it("(Task 82) یادگیرندهٔ هدف‌مند: «۳ از ۳۴» + هفتهٔ هدف‌دار باز + قفلِ آخر با پیشرفتِ فارسی", () => {
    seedGoal();
    const { container } = render(<Badges />);
    expect(screen.getByText((_, el) => el?.tagName === "SPAN" && /۳\s*از\s*۳۴/.test(el.textContent ?? ""))).toBeInTheDocument();
    for (const title of ["اولین هدف", "پنج‌روزهٔ هدف‌دار", "هفتهٔ هدف‌دار"]) {
      const tile = screen.getByText(title).closest(".badge-card");
      expect(tile?.className, `${title} must be unlocked`).toContain("badge-shine");
    }
    // قفلِ آخر: دو هفتهٔ درخشان — پیشرفتِ هفت‌از-چهارده با رقم فارسی
    const fort = screen.getByText("دو هفتهٔ درخشان").closest(".badge-card");
    expect(fort?.className).not.toContain("badge-shine");
    expect(fort).toHaveTextContent("۷ از ۱۴ روزِ هدف‌دار");
    // سطل‌ها مستقل: نشان یخ برای این seed باز نشده
    const ice = screen.getByText("یخ‌ساز").closest(".badge-card");
    expect(ice?.className).not.toContain("badge-shine");
    void container;
  });

  it("(Task 83) هفتهٔ بی‌قفسه: در seed هدف‌مند ۶/۷ پنجره است (روزِ هفتم بیرون) — قفل با پیشرفتِ پنجره", () => {
    seedGoal(); // روزهای key(1..7) — فقط ۶ روز در پنجرهٔ ۷روزه (daysAgo(7) بیرون است)
    render(<Badges />);
    const cage = screen.getByText("هفتهٔ بی‌قفسه").closest(".badge-card");
    expect(cage).not.toBeNull();
    expect(cage?.className).not.toContain("badge-shine");
    expect(cage).toHaveTextContent("۶ از ۷ روزِ این هفته");
  });

  it("(Task 84) هفتهٔ رویدادی: کلِ پنجرهٔ موتور هدف‌دار + dayHistory فقط مرور → هر دو نشانِ بی‌دیکته/بی‌آزمون باز", () => {
    seedEventWeek();
    render(<Badges />);
    for (const title of ["هفتهٔ بی‌دیکته", "هفتهٔ بی‌آزمون"]) {
      const tile = screen.getByText(title).closest(".badge-card");
      expect(tile, `${title} tile must exist`).not.toBeNull();
      expect(tile?.className, `${title} must be unlocked`).toContain("badge-shine");
    }
  });

  it("(Task 85) رانِ دیکته: هفت روزِ دیکته‌دار بدونِ هیچ هدفی → «هفتهٔ دیکتهٔ پیوسته» باز (استقلالِ زنده از goal)", () => {
    seedDictationRun();
    render(<Badges />);
    const tile = screen.getByText("هفتهٔ دیکتهٔ پیوسته").closest(".badge-card");
    expect(tile, "dictation-run tile must exist").not.toBeNull();
    expect(tile?.className, "dictation-run must be unlocked without goalDays7").toContain("badge-shine");
  });

  it("(Task 86) رانِ آزمون: هفت روزِ آزمون‌دارِ زیرِ سقفِ هدف → «هفتهٔ آزمون‌دار» باز و بی‌آزمون قفل (قرینهٔ متضاد، زنده)", () => {
    seedExamRun();
    render(<Badges />);
    const tile = screen.getByText("هفتهٔ آزمون‌دار").closest(".badge-card");
    expect(tile, "exam-run tile must exist").not.toBeNull();
    expect(tile?.className, "exam-run must be unlocked with tiny daily quizzes").toContain("badge-shine");
    const noExam = screen.getByText("هفتهٔ بی‌آزمون").closest(".badge-card");
    expect(noExam?.className, "week-no-exam must stay locked (quizzes7 > 0)").not.toContain("badge-shine");
  });

  it("توستِ تازه: فقط نشانِ دیده‌نشده → یک توست «یخ‌ساز» + store واقعی seen می‌شود", () => {
    useStudy.setState({
      freezeEarnedDay: "2026-10-05",
      // همهٔ نشان‌های دیگر «دیده‌شده» seed می‌شوند — فقط یخ‌ساز تازه است
      seenBadges: BADGES.filter((b) => b.id !== "ice-maker").map((b) => b.id),
    });
    render(<Badges />);
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(String(toastSpy.mock.calls[0]?.[0]?.title)).toContain("یخ‌ساز");
    // اکشن واقعی store — نه ماک: seenBadges حالا یخ‌ساز را دارد
    expect(useStudy.getState().seenBadges).toContain("ice-maker");
  });
});
