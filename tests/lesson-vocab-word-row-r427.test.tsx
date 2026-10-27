// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r427 — «لنگرِ سطرِ واژه» — قفلهایِ عمقِ سطریِ پرشِ خانهٔ امروز.
//
// بندِ ③ پیشنهادهایِ r426: پرشِ lesson-vocab تا دیروز فقط تا «تبِ واژگانِ
// درس» میآمد (r407) و یادگیرنده خودش باید واژه را در شبکه مییافت. این
// راند لنگر عمیقتر میشود — الگویِ سطرِ فعلِ r234 رویِ کارتهایِ واژه:
//  ① استور: openLessonTab با پارامترِ سوم = view {lesson, id, focusWord}؛
//    فراخوانیِ دو-آرگومنتیِ کهنه هر focusWordِ کهنهای پاک میکند
//  ② VocabTab: focusWord معتبر → کارتِ واژه (حتی با فاصله در نام —
//    اسلاگِ usage-chipِ r253) پالسِ زمردیِ هستهٔ r234 میگیرد + onFocusDone
//    یکبار؛ بیِ focusWord هیچ پالسی
//  ③ LessonView: view با focusWord معتبر → پالس + لنگر از view پاک
//    میشود (پرشِ دوبارهٔ همان واژه دوباره کار میکند — بهبودِ آگاهانه بر
//    الگویِ ضمیمه که لنگر را در view نگه میدارد)؛ focusWord نامعتبر =
//    سکوتِ صادق — هیچ پالسی، هیچ پاکسازیِ نابرآمده
//  ④ کارنامه: تک‌بانکِ lesson-vocab → کلیکِ خانهٔ امروز = viewِ درس با
//    focusWord + تبِ واژگان + drill_due_jump یکبار + بستنِ کارنامه
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import VocabTab from "@/components/study/lesson/vocab-tab";
import LessonView from "@/components/study/lesson/lesson-view";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { LessonData } from "@/lib/study-types";
import { daysAgoKey } from "@/state/day-engine";

const { trackSpy, closeSpy } = vi.hoisted(() => ({
  trackSpy: vi.fn(),
  closeSpy: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(async () => () => {}), speakFailToast: vi.fn() }));

// واژهٔ واقعیِ نخستین درس — لنگر از خودِ داده (هیچ واژهٔ برساخته)
const LESSON0 = lessons[0];
const EN0 = LESSON0.vocabulary.find((w) => w.en && w.fa)!.en;

const TODAY = daysAgoKey(0);
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});

/** فیکسچرِ کمینه با واژهٔ دوفاصلهای — قفلِ اسلاگِ id (ایدئومِ usage-chipِ r253) */
const slugFixture = {
  id: 999,
  titleEn: "Fixture",
  titleFa: "فیکسچر",
  tagline: "",
  color: "rose",
  vocabulary: [
    { en: "amusement", fa: "سرگرمی" },
    { en: "a bit", fa: "کمی" },
  ],
  conversation: { introEn: "", introFa: "", lines: [] },
  readings: [],
  grammar: [],
  synonyms: [],
  writing: [],
  quizzes: [],
} as unknown as LessonData;

const PULSE_KERNEL = "shadow-emerald-300"; // هستهٔ مشترکِ پالس با سطرِ فعلِ r234

const strip = (n: number, days: number) =>
  screen.queryByLabelText(`هفتهٔ پیشِ رو — ${faNumOf(n)} موردِ بازگشت در ${faNumOf(days)} روز`);

function faNumOf(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  useStudy.setState(useStudy.getInitialState(), true);
  trackSpy.mockClear();
  closeSpy.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("r427 — لنگرِ سطرِ واژه", () => {
  it("استور: openLessonTab با پارامترِ سوم لنگر را در view میگذارد؛ بیِ آن لنگرِ کهنه پاک میشود", () => {
    useStudy.getState().openLessonTab(LESSON0.id, "vocab", EN0);
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: LESSON0.id, focusWord: EN0 });
    expect(useStudy.getState().lessonTab).toBe("vocab");
    // فراخوانیِ دو-آرگومنتیِ کهنه (پالت فرمان/راهنمای کلیدها) هر لنگری را پاک میکند
    useStudy.getState().openLessonTab(LESSON0.id, "tests");
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: LESSON0.id });
  });

  it("VocabTab: focusWord معتبر — کارتِ واژه (با فاصله در نام) پالسِ زمردی میگیرد و onFocusDone یکبار صدا میخورد", async () => {
    const done = vi.fn();
    const { container } = render(<VocabTab lesson={slugFixture} focusWord="a bit" onFocusDone={done} />);
    const row = document.getElementById("vocab-row-a-bit");
    expect(row).not.toBeNull(); // اسلاگِ فاصله→خط تیره — ایدئومِ usage-chipِ r253
    await waitFor(() => {
      expect(row!.className).toContain(PULSE_KERNEL);
      expect(row!.className).toContain("bg-emerald-50");
    });
    expect(done).toHaveBeenCalledTimes(1);
    // کارتِ همسایه پالس ندارد — پالس فقط رویِ مقصد
    const neighbor = document.getElementById("vocab-row-amusement")!;
    expect(neighbor.className).not.toContain(PULSE_KERNEL);
    expect(container).toBeTruthy();
    screen.getByText("amusement"); // شبکهِ عادی سرِ پاست — پالس، نمای را عوض نمیکند
  });

  it("VocabTab بیِ focusWord: هیچ کارتی پالس ندارد — رفتارِ کهنه دستنخورده", () => {
    render(<VocabTab lesson={slugFixture} />);
    const rows = document.querySelectorAll("[id^='vocab-row-']");
    expect(rows.length).toBe(2);
    rows.forEach((r) => expect(r.className).not.toContain(PULSE_KERNEL));
  });

  it("LessonView: رسیدن با لنگرِ معتبر → پالس + لنگر از view پاک میشود (پرشِ دوبارهٔ همان واژه زنده میماند)", async () => {
    useStudy.setState({ view: { type: "lesson", id: LESSON0.id, focusWord: EN0 } });
    render(<LessonView id={LESSON0.id} focusWord={EN0} />);
    const row = await waitFor(() => {
      const el = document.getElementById(`vocab-row-${EN0.replace(/\s+/g, "-")}`);
      expect(el).toBeTruthy();
      expect(el!.className).toContain(PULSE_KERNEL);
      return el!;
    });
    expect(row.className).toContain("bg-emerald-50");
    // پاکشدنِ لنگر از view — قراردادِ یک‌بارِ مصرفِ r427
    await waitFor(() => {
      expect(useStudy.getState().view).toEqual({ type: "lesson", id: LESSON0.id });
    });
  });

  it("LessonView با focusWord نامعتبر: سکوتِ صادق — هیچ پالسی، view دستنخورده", async () => {
    useStudy.setState({ view: { type: "lesson", id: LESSON0.id, focusWord: "zzz-ghost-word" } });
    render(<LessonView id={LESSON0.id} focusWord="zzz-ghost-word" />);
    await new Promise((r) => setTimeout(r, 120)); // فرصتِ هر rAFِ برساخته — هیچ نباید بود
    const rows = document.querySelectorAll("[id^='vocab-row-']");
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((r) => expect(r.className).not.toContain(PULSE_KERNEL));
    // لنگرِ نامعتبر پاک نمیشود؟ پاک میشود فقط با مصرف — اینجا مصرفی در کار نبود
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: LESSON0.id, focusWord: "zzz-ghost-word" });
  });

  it("کارنامه: تک‌بانکِ lesson-vocab → کلیکِ خانهٔ امروز = viewِ درس با focusWord + تبِ واژگان + رویدادِ یکبار + بستنِ کارنامه", async () => {
    useStudy.setState({
      drillMistakes: { "lesson-vocab": { [EN0]: dueEntry() } },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = strip(1, 1);
    expect(el).toBeTruthy();
    const btn = el!.querySelector('button[aria-label^="امروز"]')!;
    expect(btn.getAttribute("aria-label")).toBe(
      `امروز — ${faNumOf(1)} موردِ بازگشت — پرش به تمرینِ واژگان درس`,
    );
    fireEvent.click(btn);
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: LESSON0.id, focusWord: EN0 });
    expect(useStudy.getState().lessonTab).toBe("vocab");
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("drill_due_jump");
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
