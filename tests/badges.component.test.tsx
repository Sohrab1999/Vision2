// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 81 — ششمین سوژهٔ زیرساخت تست کامپوننت (بازشده در Task 75):
// بخش «نشان‌ها و دستاوردها» — ۲۵ نشان با خانوادهٔ تازهٔ یخ.
// قراردادهایی که قفل می‌شوند:
//   ① تازه‌وارد: شمار «۰ از ۵۲» + همهٔ کاشی‌ها قفل (بدون badge-shine)
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
import Badges, { BADGE_ICONS } from "@/components/study/practice/badges";

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

// (Task 87) کلیدهای نسبی — هر روزِ پنجره هم دیکته هم آزمون؛ هر دو رانِ تکی هم‌زمان باز می‌شوند
const seedDoubleRun = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  for (let n = 0; n <= 6; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: 1, words: 0, dictation: 1, rush: 0 };
  }
  useStudy.setState({ dayHistory, seenBadges: [] });
};

// (Task 88) کلیدهای نسبی — مرورِ کوچکِ روزانه (زیرِ سقفِ هدف) ولی پیوسته
const seedReviewRun = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  for (let n = 0; n <= 6; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 1, quizzes: 0, words: 0, dictation: 0, rush: 0 };
  }
  useStudy.setState({ dayHistory, seenBadges: [] });
};

const seedTripleRun = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  for (let n = 0; n <= 6; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 1, quizzes: 1, words: 0, dictation: 1, rush: 0 };
  }
  useStudy.setState({ dayHistory, seenBadges: [] });
};

// (Task 90) کلیدهای نسبی — چهارده روزِ پیوستهٔ هر سه فعالیت (ماراتن)
const seedMarathon = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  for (let n = 0; n <= 13; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 1, quizzes: 1, words: 0, dictation: 1, rush: 0 };
  }
  useStudy.setState({ dayHistory, seenBadges: [] });
};

// (Task 92) ۲۵ روزِ «فقط‌واژه‌ای» — گسترده‌ترین شرطِ حضور را روی کاشی اثبات می‌کند:
// هیچ ران/هدف/زنجیره‌ای باز نمی‌شود ولی ماهِ حاضر می‌درخشد.
// درسِ آلودگی: beforeEach يومتحن goalMetDays را ریست نمی‌کند — seedِ هدفِ تست‌های
// قبلی می‌ماند و چیپِ «۱ از ۵۲» را «۲ از ۵۲» می‌کرد؛ این seed خودش پاکش می‌کند.
const seedPresence = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const dayHistory: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
  for (let n = 0; n <= 24; n++) {
    dayHistory[key(n)] = { day: key(n), reviews: 0, quizzes: 0, words: 1, dictation: 0, rush: 0 };
  }
  useStudy.setState({ dayHistory, goalMetDays: [], seenBadges: [] });
};

// (Task 93) پنج مهارتِ پخش‌شده روی پنج روزِ پنجره — گسترده‌ترین حالتِ تنوع؛
// فقط پنج‌گانه باز می‌شود (بدونِ هدف/ران/حضور) و قفلِ متقابلِ رویدادی‌ها زنده اثبات می‌شود.
const seedFiveSkills = () => {
  const key = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const mk = (over: Partial<{ reviews: number; quizzes: number; words: number; dictation: number; rush: number }>) => ({
    day: "",
    reviews: 0,
    quizzes: 0,
    words: 0,
    dictation: 0,
    rush: 0,
    ...over,
  });
  const dayHistory: Record<string, ReturnType<typeof mk>> = {
    [key(0)]: mk({ reviews: 1 }),
    [key(1)]: mk({ quizzes: 1 }),
    [key(2)]: mk({ dictation: 1 }),
    [key(4)]: mk({ words: 1 }),
    [key(6)]: mk({ rush: 1 }),
  };
  useStudy.setState({ dayHistory, goalMetDays: [], seenBadges: [] });
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

  it("تازه‌وارد: «۰ از ۵۲» + کاشی یخ قفل با پیشرفتِ فارسی زیرِ قفل", () => {
    render(<Badges />);
    // شمار در JSX دو تکه رندر می‌شود — تطبیق با textContentِ نرمال‌شده؛
    // لنگرِ دقیق: وادارهای «۰ از ۵۰ واژه/مرور» (قفلِ نشان‌های ۵۲تایی) هم دارند
    const chip = screen.getByText((_, el) => el?.tagName === "SPAN" && /^۰\s*از\s*۵۲$/.test((el.textContent ?? "").trim()));
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

  it("یادگیرندهٔ یخی: «۴ از ۵۲» + کاشی‌های یخ باز (badge-shine) و اولِ لیست", () => {
    seedIce();
    const { container } = render(<Badges />);
    expect(screen.getByText((_, el) => el?.tagName === "SPAN" && /۴\s*از\s*۵۲/.test(el.textContent ?? ""))).toBeInTheDocument();
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

  it("(Task 82) یادگیرندهٔ هدف‌مند: «۳ از ۵۲» + هفتهٔ هدف‌دار باز + قفلِ آخر با پیشرفتِ فارسی", () => {
    seedGoal();
    const { container } = render(<Badges />);
    expect(screen.getByText((_, el) => el?.tagName === "SPAN" && /۳\s*از\s*۵۲/.test(el.textContent ?? ""))).toBeInTheDocument();
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

  it("(Task 87) رانِ دوتایی: هفت روزِ دوبل → «هفتهٔ دوبل» باز و هر دو رانِ تکی هم باز (هم‌پوشانیِ زنده روی سطوح کاشی)", () => {
    seedDoubleRun();
    render(<Badges />);
    const tile = screen.getByText("هفتهٔ دوبل").closest(".badge-card");
    expect(tile, "double-run tile must exist").not.toBeNull();
    expect(tile?.className, "double-run must be unlocked").toContain("badge-shine");
    expect(tile?.querySelector("svg"), "Layers SVG renders (icon-map guard: never silent Medal)").not.toBeNull();
    const dictation = screen.getByText("هفتهٔ دیکتهٔ پیوسته").closest(".badge-card");
    const exam = screen.getByText("هفتهٔ آزمون‌دار").closest(".badge-card");
    expect(dictation?.className, "dictation-run co-unlocks").toContain("badge-shine");
    expect(exam?.className, "exam-run co-unlocks").toContain("badge-shine");
  });

  it("(Task 88) رانِ مرور: هفت روزِ مرورِ کوچکِ زیرِ سقفِ هدف → «هفتهٔ مرور» باز (استقلالِ زنده از goal)", () => {
    seedReviewRun();
    render(<Badges />);
    const tile = screen.getByText("هفتهٔ مرور").closest(".badge-card");
    expect(tile, "review-run tile must exist").not.toBeNull();
    expect(tile?.className, "review-run must be unlocked with tiny daily reviews").toContain("badge-shine");
    expect(tile?.querySelector("svg"), "History SVG renders (icon-map guard: never silent Medal)").not.toBeNull();
  });

  it("(Task 89) رانِ سه‌گانه: هفت روزِ هر سه فعالیت → «هفتهٔ سه‌گانه» باز و هر چهار رانِ زیرمجموعه هم‌بازند", () => {
    seedTripleRun();
    render(<Badges />);
    const tile = screen.getByText("هفتهٔ سه‌گانه").closest(".badge-card");
    expect(tile, "triple-run tile must exist").not.toBeNull();
    expect(tile?.className, "triple-run must be unlocked").toContain("badge-shine");
    expect(tile?.querySelector("svg"), "Crown SVG renders (icon-map guard: never silent Medal)").not.toBeNull();
    // هم‌پوشانیِ چهارنفره — زنده روی سطوح کاشی: همهٔ ران‌های زیرمجموعه می‌درخشند
    for (const t of ["هفتهٔ دیکتهٔ پیوسته", "هفتهٔ آزمون‌دار", "هفتهٔ دوبل", "هفتهٔ مرور"]) {
      const sub = screen.getByText(t).closest(".badge-card");
      expect(sub?.className, `${t} co-unlocks with triple`).toContain("badge-shine");
    }
  });

  it("(Task 90) ماراتن: چهارده روزِ هر سه فعالیت → «ماراتنِ دوهفته‌ای» باز و پنج رانِ زیرمجموعه هم‌بازند", () => {
    seedMarathon();
    render(<Badges />);
    const tile = screen.getByText("ماراتنِ دوهفته‌ای").closest(".badge-card");
    expect(tile, "marathon-run tile must exist").not.toBeNull();
    expect(tile?.className, "marathon-run must be unlocked").toContain("badge-shine");
    expect(tile?.querySelector("svg"), "Trophy SVG renders (icon-map guard: never silent Medal)").not.toBeNull();
    // هم‌پوشانیِ شش‌نفره — زنده روی سطوح کاشی: پنج رانِ زیرمجموعه می‌درخشند
    for (const t of ["هفتهٔ سه‌گانه", "هفتهٔ دیکتهٔ پیوسته", "هفتهٔ آزمون‌دار", "هفتهٔ دوبل", "هفتهٔ مرور"]) {
      const sub = screen.getByText(t).closest(".badge-card");
      expect(sub?.className, `${t} co-unlocks with marathon`).toContain("badge-shine");
    }
  });

  it("(Task 92) حضور: بیست‌وپنج روزِ فقط‌واژه‌ای → «ماهِ حاضر» باز، «ماهِ درخشان» قفل با پیشرفتِ صادق؛ رجیستری ۴۰", () => {
    seedPresence();
    render(<Badges />);
    const tile = screen.getByText("ماهِ حاضر").closest(".badge-card");
    expect(tile, "presence-month tile must exist").not.toBeNull();
    expect(tile?.className, "presence-month must be unlocked (words-only days count)").toContain("badge-shine");
    expect(tile?.querySelector("svg"), "CalendarCheck SVG renders (icon-map guard: never silent Medal)").not.toBeNull();
    // پلهٔ طلا هنوز قفل است — ۲۵ < ۳۰ — و پیشرفتِ زیرِ قفل صادق است
    const full = screen.getByText("ماهِ درخشان").closest(".badge-card");
    expect(full?.className, "presence-month-full locked at 25 days").not.toContain("badge-shine");
    expect(full).toHaveTextContent("۲۵ از ۳۰ روزِ فعال");
    // شمارِ رجیستری روی چیپ = ۴۰
    const chip = screen.getByText((_, el) => el?.tagName === "SPAN" && /۱\s*از\s*۵۲/.test(el.textContent ?? ""));
    expect(chip).toBeInTheDocument();
  });

  it("(Task 93) تنوع: پنج مهارتِ پخش‌شده در پنجره → «هفتهٔ پنج‌گانه» باز با Puzzle؛ بی‌دیکته/بی‌آزمون قفلِ متقابل؛ رجیستری ۵۲", () => {
    seedFiveSkills();
    render(<Badges />);
    const tile = screen.getByText("هفتهٔ پنج‌گانه").closest(".badge-card");
    expect(tile, "five-skill-week tile must exist").not.toBeNull();
    expect(tile?.className, "five-skill-week must be unlocked").toContain("badge-shine");
    expect(tile?.querySelector("svg"), "Puzzle SVG renders (icon-map guard: never silent Medal)").not.toBeNull();
    // قفلِ متقابلِ قراردادی — زنده روی کاشی: هر دو نشانِ رویدادی قفل می‌مانند
    for (const t of ["هفتهٔ بی‌دیکته", "هفتهٔ بی‌آزمون"]) {
      const no = screen.getByText(t).closest(".badge-card");
      expect(no?.className, `${t} can never co-unlock with five-skill`).not.toContain("badge-shine");
    }
    // قراردادِ lock-only (درسِ ۸۶): کاشیِ باز پیشرفت را پنهان می‌کند —
    // پس فقط بازشدن و SVG و قفلِ متقابل را روی کاشی اثبات می‌کنیم
    // (رشته‌های پیشرفت در تستِ pure قفل‌اند)؛ شمارِ رجیستری روی چیپ = ۵۲
    const chip = screen.getByText((_, el) => el?.tagName === "SPAN" && /۱\s*از\s*۵۲/.test(el.textContent ?? ""));
    expect(chip).toBeInTheDocument();
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
