// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r432 — «سررسیدهایِ امروز به تفکیک بانک» — قفلهایِ فهرستِ چندبانکی.
//
// حکمِ معلقِ ناوبریِ چندبانکی (از r425): خانهٔ امروزِ نوار فقط برایِ
// تکبانک دکمه دارد و روزِ چندبانکی ساکتِ صادق میماند (r236) — یادگیرنده
// هیچ پرشی نداشت. r432: فهرستِ زیرِ نوار همان حکم را به شکلِ فهرست میبندد:
//  · فقط در روزِ چندبانکی بالا میآید (تکبانک = خودِ خانهٔ نوار — صفر افزونگی)
//  · هر بانک یک سطر: عنوانِ رسمیِ اطلس + شمارِ صادق + پرشِ خودش (لنگرِ
//    نخستین پایه — همان داوریِ todayTarget) — ترتیب = ترتیبِ رسمیِ بلوکهایِ r420
//  · بانکِ بیلنگر سطرِ شمارِ بیوعده میگیرد — هیچ مقصدِ برساختهای (r236)
//  · کلیک = همان بدنهٔ پرش (doJump — تکمالکِ نگاشتِ لنگر→ناوبری) +
//    رویدادِ drill_due_jump یکبار + بستنِ کارنامه (onLeaveReport)
//  · «پرش ≠ نوشتن» — هیچ جلسهای شروع نمیشود
//  · تکمنبع: از همان memoِ weekAgenda (صفر شمارشِ موازی — درسِ r421)
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";
import { vowelPhonemes, consonantPhonemes } from "@/data/appendix";
import { WORD_FAMILY_TABLES, wordFamilyTableId } from "@/data/word-families";

const { trackSpy, closeSpy } = vi.hoisted(() => ({
  trackSpy: vi.fn(),
  closeSpy: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));

const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا
const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});

const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;
const WF_T = WORD_FAMILY_TABLES[0];
const WF_NOUN = WF_T.families.find((f) => f.noun)!.noun;

const banksBand = () => screen.queryByLabelText(/^سررسیدهایِ امروز به تفکیک بانک/);
const bankJump = (name: string | RegExp) => screen.queryByRole("button", { name });

describe("weekly-report r432 — فهرستِ سررسیدهایِ امروز به تفکیک بانک", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
    trackSpy.mockClear();
    closeSpy.mockClear();
  });
  afterEach(() => cleanup());

  it("روزِ چندبانکی: فهرست بالا میآید — سطربهسطر با عنوانِ رسمیِ بانک، شمارِ صادق و ترتیبِ رسمیِ بلوکها", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), see: dueEntry() }, // ۲ سررسیدِ یک بانک
        phonemes: { [SYM]: dueEntry() },
        words: { [WF_NOUN]: dueEntry() },
      },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const band = banksBand();
    expect(band).toBeTruthy();
    expect(band!.getAttribute("aria-label")).toBe(
      `سررسیدهایِ امروز به تفکیک بانک — ${faNum(4)} مورد در ${faNum(3)} بانک`,
    );
    // ترتیبِ رسمیِ بلوکهایِ r420: verbs → phonemes → words
    const rows = Array.from(
      band!.querySelectorAll("button.today-bank-jump, div[aria-label$='میزبانِ پرش ندارد']"),
    );
    const titles = rows.map((r) => (r as HTMLElement).textContent);
    expect(titles.some((t) => t!.includes("افعال بی‌قاعده"))).toBe(true);
    expect(titles.some((t) => t!.includes("جدول تلفظ"))).toBe(true);
    expect(titles.some((t) => t!.includes("خانوادهٔ واژه‌ها"))).toBe(true);
    const idxV = titles.findIndex((t) => t!.includes("افعال بی‌قاعده"));
    const idxP = titles.findIndex((t) => t!.includes("جدول تلفظ"));
    const idxW = titles.findIndex((t) => t!.includes("خانوادهٔ واژه‌ها"));
    expect(idxV).toBeLessThan(idxP);
    expect(idxP).toBeLessThan(idxW);
    // شمارِ صادقِ هر بانک: verbs=۲ (جمعِ صادقِ روزانه — نه شمارِ کلِ بانک)
    const vBtn = bankJump(`پرش به تمرینِ افعال بی‌قاعده — ${faNum(2)} مورد`);
    expect(vBtn).toBeTruthy();
    expect(bankJump(`پرش به تمرینِ جدول تلفظ — ${faNum(1)} مورد`)).toBeTruthy();
    expect(bankJump(`پرش به تمرینِ خانوادهٔ واژه‌ها — ${faNum(1)} مورد`)).toBeTruthy();
  }, 20000);

  it("کلیکِ سطرِ بانک = پرشِ واقعی با لنگرِ عمیق + رویدادِ یکبار + بستنِ کارنامه — پرش ≠ نوشتن", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), see: dueEntry() },
        phonemes: { [SYM]: dueEntry() },
      },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const btn = bankJump(`پرش به تمرینِ جدول تلفظ — ${faNum(1)} مورد`)!;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    // لنگرِ عمیقِ همان خانواده: view = ضمیمه با کارتِ واک (r235) — نه جلسهٔ ساختگی
    expect(useStudy.getState().view).toEqual({ type: "appendix", phonemeId: SYM });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("drill_due_jump");
    expect(closeSpy).toHaveBeenCalledTimes(1);
  }, 20000);

  it("روزِ تکبانکی: فهرست غایب — خانهٔ نوار خودش پرش دارد (صفر افزونگی) و قفلِ r425 دستنخورده", () => {
    useStudy.setState({
      drillMistakes: { verbs: { go: dueEntry(), see: dueEntry() } },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    expect(banksBand()).toBeNull();
    // خانهٔ امروزِ نوار همان دکمهٔ r425 است
    const el = screen.queryByLabelText(
      `هفتهٔ پیشِ رو — ${faNum(2)} موردِ بازگشت در ${faNum(1)} روز`,
    );
    expect(el).toBeTruthy();
    const btn = el!.querySelector('button[aria-label^="امروز"]')!;
    expect(btn.getAttribute("aria-label")).toBe(
      `امروز — ${faNum(2)} موردِ بازگشت — پرش به تمرینِ افعال بی‌قاعده`,
    );
  }, 20000);

  it("بیِ سررسید: نه فهرست نه چیزی — سکوتِ صادقِ کامل", () => {
    useStudy.setState({
      drillMistakes: { verbs: { go: { wrong: 2, ok: 5, lastDay: YESTERDAY, lastOkDay: YESTERDAY } } }, // مسلط
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    expect(banksBand()).toBeNull();
  }, 20000);

  it("بانکِ بیلنگر در روزِ چندبانکی: سطرِ شمارِ بیوعده — هیچ دکمهای با مقصدِ برساخته (r236)؛ خواهرِ لنگردار پرش میکند", () => {
    useStudy.setState({
      drillMistakes: {
        "dict-vocab": { "zzz-not-a-word": dueEntry() }, // پایهٔ حلنشده — بیِ لنگر
        phonemes: { [SYM]: dueEntry() },
      },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const band = banksBand();
    expect(band).toBeTruthy();
    // سطرِ بیوعده: div با ariaِ صادق — نه دکمه
    const quiet = screen.queryByText("واژگان دیکشنری");
    expect(quiet).toBeTruthy();
    expect(quiet!.closest("button")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /پرش به تمرینِ واژگان دیکشنری/ }),
    ).toBeNull();
    const quietRow = quiet!.closest("div[aria-label]") as HTMLElement | null;
    expect(quietRow?.getAttribute("aria-label")).toBe(
      `واژگان دیکشنری — ${faNum(1)} مورد — میزبانِ پرش ندارد`,
    );
    // خواهرِ لنگردار همانطور که هست پرش میکند
    const pBtn = bankJump(`پرش به تمرینِ جدول تلفظ — ${faNum(1)} مورد`)!;
    expect(pBtn).toBeTruthy();
    fireEvent.click(pBtn);
    expect(useStudy.getState().view).toEqual({ type: "appendix", phonemeId: SYM });
  }, 20000);

  it("دو بانکِ بیلنگر: فهرست با هر دو سطرِ ساکت بالا میآید — فهرستِ صادق، نه حذفِ خاموش", () => {
    useStudy.setState({
      drillMistakes: {
        "dict-vocab": { "zzz-not-a-word": dueEntry() },
        words: { "zzz-not-a-noun": dueEntry() },
      },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const band = banksBand();
    expect(band).toBeTruthy();
    expect(band!.getAttribute("aria-label")).toBe(
      `سررسیدهایِ امروز به تفکیک بانک — ${faNum(2)} مورد در ${faNum(2)} بانک`,
    );
    expect(screen.queryByRole("button", { name: /پرش به تمرینِ/ })).toBeNull();
  }, 20000);

  it("مسیرِ خانوادهٔ واژهها با عمقِ سطریِ r428 از فهرست: view خودِ واژه را حمل میکند", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry() },
        words: { [WF_NOUN]: dueEntry() },
      },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const btn = bankJump(`پرش به تمرینِ خانوادهٔ واژه‌ها — ${faNum(1)} مورد`)!;
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      posTableId: wordFamilyTableId(WF_T),
      posRowWord: WF_NOUN,
    });
    expect(closeSpy).toHaveBeenCalledTimes(1);
  }, 20000);
});
