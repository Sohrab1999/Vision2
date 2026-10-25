// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 104 «عکسِ هفته‌نامه» — دکمهٔ هدرِ هفته‌نامهٔ پیشرفت:
//   ① کلیک → downloadWeeklyImage با همان اعدادِ صادقِ دایجستِ روی صفحه
//     (فعالیت/برشِ خانواده‌ها/روزهای هدف/زنجیره/پرجانب‌ترین روز/خطِ نبرد)
//   ② خطِ نبرد فقط با نبردِ این هفته؛ «+»یِ حداقلی هم منتقل می‌شود
//   ③ چرخهٔ busy؛ false → تُستِ خطا
//   ④ بدونِ کلیک، هیچ فراخوانی
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { toastSpy, weeklyImage } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  weeklyImage: vi.fn(),
}));

vi.mock("@/lib/result-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/result-image")>()),
  downloadWeeklyImage: (...args: unknown[]) => weeklyImage(...args),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
  // r397 — the failure branch borrows the real imageFailToast owner, which
  // calls the named `toast` export directly — the mock must carry it too.
  toast: toastSpy,
}));

import { render as rtlRender } from "@testing-library/react";
import WeeklyReportSection from "@/components/study/reports/weekly-report";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";

const duelRec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: daysAgoKey(0),
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
  answered: 10,
  total: 10,
  durationSec: 80,
  ...over,
});

const btn = () => screen.getByRole("button", { name: "گرفتن عکس هفته‌نامهٔ پیشرفت" });

function seedWeekly() {
  // هفتهٔ جاری: امروز ۸ مرور + دیروز ۲ آزمون + ۳ روز پیش ۵ واژه؛ هفتهٔ پیش کمتر
  useStudy.setState({
    dayHistory: {
      [daysAgoKey(0)]: { day: daysAgoKey(0), reviews: 8, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
      [daysAgoKey(1)]: { day: daysAgoKey(1), reviews: 0, quizzes: 2, words: 0, dictation: 0, rush: 0, stories: 0 },
      [daysAgoKey(3)]: { day: daysAgoKey(3), reviews: 0, quizzes: 0, words: 5, dictation: 0, rush: 0, stories: 0 },
      [daysAgoKey(9)]: { day: daysAgoKey(9), reviews: 1, quizzes: 1, words: 1, dictation: 1, rush: 1, stories: 0 },
    },
    goalMetDays: [daysAgoKey(0), daysAgoKey(1)],
    streak: 4,
    userName: "میلاد",
  });
}

describe("عکسِ هفته‌نامه (Task 104)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockReset();
    weeklyImage.mockReset();
    window.localStorage.clear();
    useStudy.setState({
      dayHistory: {},
      history: {},
      goalMetDays: [],
      streak: 0,
      userName: "",
      duelHistory: [],
      freezeCount: 0,
      freezeSavedDay: "",
      freezeUsedDays: [],
      freezeEarnedDay: "",
    });
  });

  it("کلیک → فراخوانی با اعدادِ صادقِ دایجست + نام + زنجیره + پرجانب‌ترین روز", async () => {
    weeklyImage.mockResolvedValue(true);
    seedWeekly();
    rtlRender(<WeeklyReportSection />);
    fireEvent.click(btn());
    await waitFor(() => expect(weeklyImage).toHaveBeenCalledTimes(1));
    const arg = weeklyImage.mock.calls[0][0];
    expect(arg.activities).toBe(15);
    expect(arg.reviews).toBe(8);
    expect(arg.quizzes).toBe(2);
    expect(arg.words).toBe(5);
    expect(arg.dictation).toBe(0);
    expect(arg.rush).toBe(0);
    expect(arg.goalDays).toBe(2);
    expect(arg.streak).toBe(4);
    expect(arg.userName).toBe("میلاد");
    expect(arg.bestDay).toEqual({ label: expect.stringMatching(/۱۴\/۱۰|۳\/۱۰|.../), total: 8 });
    expect(arg.duelLine).toBeUndefined();
    // r309 — نوارِ ۱۴روزه سنجیده میشود: جمعِ ۷روزِ آخرِ همان آرایه ===
    // activities (۸+۲+۵) — چیپ و نوار از یک حساب، بدونِ منبعِ موازی
    const wpd = arg.weekPerDay as { total: number; inThisWeek: boolean }[];
    expect(wpd).toHaveLength(14);
    expect(wpd.slice(7).reduce((s, p) => s + p.total, 0)).toBe(15);
    expect(wpd[13]).toEqual({ total: 8, inThisWeek: true });
    expect(wpd[4]).toEqual({ total: 5, inThisWeek: false });
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(toastSpy.mock.calls[0][0].title).toContain("ذخیره شد");
  });

  it("خطِ نبرد فقط با نبردِ این هفته — و «+»یِ حداقلی منتقل می‌شود", async () => {
    weeklyImage.mockResolvedValue(true);
    seedWeekly();
    useStudy.setState({
      duelHistory: [
        duelRec({ id: "a", day: daysAgoKey(0), outcome: "win" }),
        duelRec({ id: "b", day: daysAgoKey(1), outcome: "loss" }),
        duelRec({ id: "c", day: daysAgoKey(10), outcome: "win" }),
      ],
    });
    rtlRender(<WeeklyReportSection />);
    fireEvent.click(btn());
    await waitFor(() => expect(weeklyImage).toHaveBeenCalled());
    expect(weeklyImage.mock.calls[0][0].duelLine).toBe("۲ نبرد واژگانی این هفته — ۱ برد، ۱ باخت");
  });

  it("حینِ ساختِ تصویر دکمه معلول است و پس از پایان آزاد می‌شود", async () => {
    let resolve!: (v: boolean) => void;
    weeklyImage.mockImplementation(() => new Promise<boolean>((res) => (resolve = res)));
    seedWeekly();
    rtlRender(<WeeklyReportSection />);
    fireEvent.click(btn());
    expect(btn()).toBeDisabled();
    resolve(false);
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("false (محیطِ بی‌کانواس) → تُستِ خطا و دکمه آزاد", async () => {
    weeklyImage.mockResolvedValue(false);
    seedWeekly();
    rtlRender(<WeeklyReportSection />);
    fireEvent.click(btn());
    await waitFor(() => expect(toastSpy).toHaveBeenCalledTimes(1));
    expect(toastSpy.mock.calls[0][0].title).toBe("خطا در ساخت تصویر");
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("بدونِ کلیک هیچ فراخوانی نیست", () => {
    seedWeekly();
    rtlRender(<WeeklyReportSection />);
    expect(weeklyImage).not.toHaveBeenCalled();
    expect(btn()).toBeInTheDocument();
  });
});
