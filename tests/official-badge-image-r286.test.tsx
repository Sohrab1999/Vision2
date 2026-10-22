// @vitest-environment jsdom
// ------------------------------------------------------------------
// r286 «عکسِ کارنامهٔ رسمی» — کارتِ PNGِ هم‌رسانیِ داستانِ «کلِ مسیر»:
//   ① کاربرِ فعالِ پرچم‌دار: فراخوانی با KPIهایِ صادقِ همان کارنامه
//     (همان ۴ KPIِ DOM) + کدِ یادگیرنده + آرایهٔ badges از همان ارزیابیِ واحد
//   ② بی‌نشانِ صادق: آرایهٔ تهی + خطِ صادقِ DOM — نه حذفِ بخش
//   ③ چرخهٔ busy؛ false → تُستِ خطا
//   ④ بدونِ کلیک هیچ فراخوانی
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { toastSpy, officialImage } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  officialImage: vi.fn(),
}));

vi.mock("@/lib/result-image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/result-image")>();
  return {
    ...actual,
    downloadOfficialImage: (...args: unknown[]) => officialImage(...args),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

import OfficialReport from "@/components/study/reports/official-report";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { FIRST_VISIBLE_BADGE_ID } from "@/lib/identity";
import { TOTAL_VOCABULARY } from "@/data/lesson-meta";
import type { OfficialImageOpts } from "@/lib/result-image";

const btn = () => screen.getByRole("button", { name: "گرفتن عکس کارنامهٔ رسمی" });

function seedActive() {
  useStudy.setState({
    known: { "3:accept": true, "3:reject": true, "4:abolish": true } as never,
    results: { "3:1": { percent: 80, total: 10 }, "4:1": { percent: 90, total: 10 } } as never,
    history: { [daysAgoKey(0)]: { reviews: 8, quizzes: 2 } },
    dayHistory: {
      [daysAgoKey(0)]: { day: daysAgoKey(0), reviews: 8, quizzes: 2, words: 0, dictation: 0, rush: 0, stories: 0 },
    },
    dayStat: { day: daysAgoKey(0), reviews: 8, quizzes: 2, words: 0, dictation: 0, rush: 0, stories: 0 },
    streak: 3,
    bestStreak: 5,
    userName: "پرنیان ف",
    userId: "abcd1234efgh5678",
    seenBadges: [FIRST_VISIBLE_BADGE_ID],
    mistakes: {},
    srs: {},
    starredWords: [],
    wordSeen: {},
  });
}

const tierChips = () =>
  document.querySelectorAll(".or-chip-bronze, .or-chip-silver, .or-chip-gold").length;

describe("عکسِ کارنامهٔ رسمی (r286)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockReset();
    officialImage.mockReset();
    window.localStorage.clear();
    useStudy.setState({
      known: {},
      results: {},
      srs: {},
      mistakes: {},
      history: {},
      dayHistory: {},
      dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
      streak: 0,
      bestStreak: 0,
      userName: "",
      userId: "",
      seenBadges: [],
      starredWords: [],
      wordSeen: {},
    });
  });

  it("فراخوانی با KPIهایِ صادق + کدِ یادگیرنده + نشانهایِ همان ارزیابیِ واحد", async () => {
    officialImage.mockResolvedValue(true);
    seedActive();
    render(<OfficialReport open onClose={() => {}} />);
    fireEvent.click(btn());
    await waitFor(() => expect(officialImage).toHaveBeenCalledTimes(1));
    const arg = officialImage.mock.calls[0][0] as OfficialImageOpts;
    expect(arg.knownCount).toBe(3);
    expect(arg.totalVocabulary).toBe(TOTAL_VOCABULARY);
    expect(arg.avgPercent).toBe(85);
    expect(arg.monthTotal).toBe(10);
    expect(arg.bestStreak).toBe(5);
    expect(arg.streak).toBe(3);
    expect(arg.learnerCode).toBe("ABCD1234");
    expect(arg.userName).toBe("پرنیان ف");
    // r309 — نوارِ ۱۴روزهٔ فعالیت: همان حسابِ history (مرور+آزمون) — ۱۴ خانه،
    // امروزِ فعالِ ۱۰ و بقیه صفرِ صادق؛ هفتهٔ این‌روزی (آخرِ آرایه) درست نشاندار
    expect(arg.weekPerDay).toHaveLength(14);
    expect(arg.weekPerDay!.map((p) => p.total)).toEqual([...Array(13).fill(0), 10]);
    expect(arg.weekPerDay!.every((p, i) => p.inThisWeek === i >= 7)).toBe(true);
    const titles = arg.badges.map((b) => b.title);
    expect(titles).toContain("اولین دیده‌شدن");
    expect(titles).toContain("اولین قدم");
    // یک ارزیابی، دو سطح: چیپهایِ تیرِ بدنه === طولِ آرایهٔ PNG
    expect(arg.badges.length).toBe(tierChips());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(toastSpy.mock.calls[0][0].title).toContain("ذخیره شد");
  });

  it("بی‌نشان: آرایهٔ تهیِ صادق + خطِ صادقِ بدنه", async () => {
    officialImage.mockResolvedValue(true);
    render(<OfficialReport open onClose={() => {}} />);
    fireEvent.click(btn());
    await waitFor(() => expect(officialImage).toHaveBeenCalledTimes(1));
    const arg = officialImage.mock.calls[0][0] as OfficialImageOpts;
    expect(arg.badges).toEqual([]);
    expect(screen.getByText(/هنوز نشانی باز نشده/)).toBeInTheDocument();
    expect(tierChips()).toBe(0);
  });

  it("حینِ ساختِ تصویر دکمه معلول است و پس از پایان آزاد میشود", async () => {
    let resolve!: (v: boolean) => void;
    officialImage.mockImplementation(() => new Promise<boolean>((res) => (resolve = res)));
    seedActive();
    render(<OfficialReport open onClose={() => {}} />);
    fireEvent.click(btn());
    expect(btn()).toBeDisabled();
    resolve(true);
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("false (محیطِ بی‌کانواس) → تُستِ خطا و دکمه آزاد", async () => {
    officialImage.mockResolvedValue(false);
    seedActive();
    render(<OfficialReport open onClose={() => {}} />);
    fireEvent.click(btn());
    await waitFor(() => expect(toastSpy).toHaveBeenCalledTimes(1));
    expect(toastSpy.mock.calls[0][0].title).toBe("خطا در ساخت تصویر");
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("بدونِ کلیک هیچ فراخوانی نیست", () => {
    seedActive();
    render(<OfficialReport open onClose={() => {}} />);
    expect(officialImage).not.toHaveBeenCalled();
    expect(btn()).toBeInTheDocument();
  });
});
