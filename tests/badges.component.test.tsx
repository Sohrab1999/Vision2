// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 81 — ششمین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// بخش «نشان‌ها و دستاوردها» — ۲۵ نشان با خانوادهٔ تازهٔ یخ.
// قراردادهایی که قفل می‌شوند:
//   ① تازه‌وارد: شمار «۰ از ۲۵» + همهٔ کاشی‌ها قفل (بدون badge-shine)
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

  it("تازه‌وارد: «۰ از ۲۵» + کاشی یخ قفل با پیشرفتِ فارسی زیرِ قفل", () => {
    render(<Badges />);
    // شمار در JSX دو تکه رندر می‌شود — تطبیق با textContentِ نرمال‌شده
    const chip = screen.getByText((_, el) => el?.tagName === "SPAN" && /۰\s*از\s*۲۵/.test(el.textContent ?? ""));
    expect(chip).toBeInTheDocument();
    const tile = screen.getByText("انبار یخ").closest(".badge-card");
    expect(tile).not.toBeNull();
    expect(tile?.className).not.toContain("badge-shine");
    expect(tile).toHaveTextContent("۰ از ۲ یخ در انبار");
  });

  it("یادگیرندهٔ یخی: «۴ از ۲۵» + کاشی‌های یخ باز (badge-shine) و اولِ لیست", () => {
    seedIce();
    const { container } = render(<Badges />);
    expect(screen.getByText((_, el) => el?.tagName === "SPAN" && /۴\s*از\s*۲۵/.test(el.textContent ?? ""))).toBeInTheDocument();
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
