// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 124 — داوریِ معلمِ هفته روی کاغذ A4 (OfficialReport).
// قراردادهایی که قفل می‌شوند:
//   ① هفتهٔ خالی هرگز داوری نمی‌شود — هم‌گیتِ واحد (hasWeekVerdict):
//      نه بخشی، نه اسکلت، حتی یک fetch هم به سرور نمی‌رود
//   ② داوریِ AI با سه‌گانهٔ کامل رندر می‌شود + چیپِ منبعِ صادق
//      (تازه/آماده/حالتِ آفلاین — قراردادِ زبانیِ پنلِ ۱۱۹)
//   ③ شکستِ شبکه هرگز صدای ساختگی نمی‌شود — بازگشتِ آفلاین از اعدادِ
//      واقعیِ هفته (fallbackWeekReview) با چیپِ «حالت آفلاین»
//   ④ source=fallbackِ صریحِ سرور هم حفظ می‌شود — چیپ دروغ نمی‌گوید
//   ⑤ اسکلتِ حینِ واکشی کلاسِ official-chrome دارد — هرگز روی کاغذ
//      چاپی نمی‌نشیند (قراردادِ «کرومِ صفحه = چاپ‌مخفی»)
//   ⑥ بدنهٔ POST فقط آمارِ تجمیعی است — هرگز dayHistoryِ خام
// الگوی seed هم‌الگوی weekly-report: setState مستقیم + stubGlobal fetch.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import OfficialReport from "@/components/study/reports/official-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const d = (n: number) => daysAgoKey(n);

function seedActiveWeek() {
  useStudy.setState({
    dayHistory: {
      [d(0)]: { day: d(0), reviews: 5, quizzes: 1, words: 0, dictation: 0, rush: 0 },
      [d(1)]: { day: d(1), reviews: 3, quizzes: 0, words: 2, dictation: 0, rush: 0 },
      [d(3)]: { day: d(3), reviews: 2, quizzes: 1, words: 0, dictation: 1, rush: 1 },
    },
    history: {},
    goalMetDays: [d(0), d(1)],
    streak: 3,
    userName: "سارا",
    userId: "abcdef12",
    known: {},
    results: {},
    srs: {},
    mistakes: {},
  });
}

function seedEmptyWeek() {
  useStudy.setState({
    dayHistory: {},
    history: {},
    goalMetDays: [],
    streak: 0,
    known: {},
    results: {},
    srs: {},
    mistakes: {},
  });
}

const okReview = {
  intro: "مقدمهٔ داوریِ هفتهٔ پرکار",
  strength: "مرور لغت ستونِ هفته بود",
  advice: "یک آزمونِ کوتاه بزن",
};

function fetchRes(body: unknown) {
  return { ok: true, json: async () => body } as unknown as Response;
}

async function renderOpenPaper() {
  render(<OfficialReport open onClose={() => {}} />);
  // کاغذ با چرخهٔ mount حاضر می‌شود
  await screen.findByText("گزارش پیشرفت درسی");
}

describe("داوریِ معلمِ هفته در کارنامهٔ رسمی — کامپوننت (Task 124)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("هفتهٔ خالی: نه بخش، نه اسکلت، حتی fetch — گیتِ واحد (۱)", async () => {
    seedEmptyWeek();
    await renderOpenPaper();
    expect(screen.queryByText("داوریِ معلمِ هفته")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("هفتهٔ فعال + AI: سه‌گانهٔ کامل + چیپِ «تازه» + خطِ هدفِ هفته (۲)", async () => {
    seedActiveWeek();
    fetchMock.mockResolvedValue(fetchRes({ ...okReview, source: "ai", cached: false }));
    await renderOpenPaper();
    expect(await screen.findByText("داوریِ معلمِ هفته")).toBeInTheDocument();
    expect(screen.getByText(okReview.intro)).toBeInTheDocument();
    expect(screen.getByText(okReview.strength)).toBeInTheDocument();
    expect(screen.getByText(okReview.advice)).toBeInTheDocument();
    expect(screen.getByText("تازه")).toBeInTheDocument();
    // خطِ پیش‌زمینهٔ صادق: ۲ روزِ هدف از ۷
    expect(screen.getByText(/از ۷ روزِ هدف کامل/)).toBeInTheDocument();
  });

  it("cached=true → چیپِ «آماده» — خواندنِ ارزان از کش (۲)", async () => {
    seedActiveWeek();
    fetchMock.mockResolvedValue(fetchRes({ ...okReview, cached: true }));
    await renderOpenPaper();
    expect(await screen.findByText("آماده")).toBeInTheDocument();
  });

  it("شبکه‌رفت → بازگشتِ آفلاینِ صادق + چیپِ «حالت آفلاین» (۳)", async () => {
    seedActiveWeek();
    fetchMock.mockResolvedValue(null as unknown as Response); // requestWeekVerdict → null
    await renderOpenPaper();
    expect(await screen.findByText("حالت آفلاین")).toBeInTheDocument();
    // متنِ fallback از قوی‌ترین بُعدِ واقعیِ هفته ساخته می‌شود (مرور لغت=۱۰)
    expect(screen.getByText(/«مرور لغت» ستونِ این هفته‌ات بود/)).toBeInTheDocument();
  });

  it("source=fallbackِ صریحِ سرور → چیپِ «حالت آفلاین» حفظ می‌شود (۴)", async () => {
    seedActiveWeek();
    fetchMock.mockResolvedValue(
      fetchRes({ intro: "مقدمهٔ سرور", strength: "قوتِ سرور", advice: "توصیهٔ سرور", source: "fallback" })
    );
    await renderOpenPaper();
    expect(await screen.findByText("مقدمهٔ سرور")).toBeInTheDocument();
    expect(screen.getByText("حالت آفلاین")).toBeInTheDocument();
  });

  it("اسکلتِ حینِ واکشی: role=status + official-chrome — هرگز روی کاغذ چاپ نمی‌شود (۵)", async () => {
    seedActiveWeek();
    fetchMock.mockReturnValue(new Promise(() => undefined)); // هرگز حل نمی‌شود
    await renderOpenPaper();
    const skeleton = await screen.findByRole("status", { name: "در حال خواندن داوری معلم هفته" });
    expect(skeleton.className).toContain("official-chrome");
    expect(skeleton.className).toContain("or-teacher");
    expect(screen.queryByText("داوریِ معلمِ هفته")).not.toBeInTheDocument();
  });

  it("بدنهٔ POST فقط آمارِ تجمیعی — activities=۱۵، هرگز dayHistoryِ خام (۶)", async () => {
    seedActiveWeek();
    fetchMock.mockResolvedValue(fetchRes({ ...okReview }));
    await renderOpenPaper();
    await screen.findByText("داوریِ معلمِ هفته");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/week-review");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.activities).toBe(16); // ۶+۵+۵ — حسابِ دستیِ خودِ تست، نه ادعا
    expect(body.goalDays).toBe(2);
    expect(body.streak).toBe(3);
    expect(Object.keys(body)).not.toContain("dayHistory");
    expect(Object.keys(body)).not.toContain("perDay");
  });
});
