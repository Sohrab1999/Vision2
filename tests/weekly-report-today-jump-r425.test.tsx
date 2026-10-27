// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r425 — «پرشِ خانهٔ امروز» — قفلهایِ نمایِ کارنامه.
//
// پیشنهادِ ②ِ r422: خانهٔ «امروز»ِ نوارِ هفته از نمایشِ محض به ناوبری
// میرسد. قراردادها:
//  · تکبانکِ امروز با لنگرِ حلشده = دکمهٔ پرش با زبانِ کامل در title/aria
//    («امروز — N موردِ بازگشت — پرش به تمرینِ X») — کلیک = پریمیتیوِ
//    ناوبریِ موجود + رویدادِ drill_due_jump یکبار + بستنِ کارنامه
//    (onLeaveReport — پرش زیرِ دیالوگ پنهان نمیماند)
//  · «پرش ≠ نوشتن» — هیچ جلسهای شروع نمیشود؛ view = appendix با لنگرِ
//    سطرِ فعل (r234) نه drill فعال
//  · امروزِ چندبانکی: خانهٔ ساکتِ صادق با گویشِ خودش («در ۲ بانک — هر
//    بانک در میزبانِ خودش تمرین میشود») — نه دکمه، نه مقصدِ حدسی
//  · بانکِ ناشناس (کلیدِ کهنهٔ localStorage): خانهٔ ساکتِ بیوعده —
//    هیچ دکمهای با titleِ تهی بالا نمیآید (r236)
//  · تکمنبعِ شمار: ariaِ دکمه همان جمعِ ariaِ نوار میگوید — صفر شمارشِ موازی
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";
import { vowelPhonemes, consonantPhonemes } from "@/data/appendix";
import { WORD_FAMILY_TABLES, wordFamilyTableId } from "@/data/word-families";
import { lessons } from "@/data"; // r430 — لنگرِ دیکشنری از خودِ داده

const { trackSpy, closeSpy } = vi.hoisted(() => ({
  trackSpy: vi.fn(),
  closeSpy: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));

const TODAY = daysAgoKey(0);
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});

/** نمادِ واقعیِ نخستین واک — برچسب از خودِ اطلس میآید (داده‌محور) */
const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;

const strip = (n: number, days: number) =>
  screen.queryByLabelText(`هفتهٔ پیشِ رو — ${faNum(n)} موردِ بازگشت در ${faNum(days)} روز`);

describe("weekly-report r425 — پرشِ خانهٔ امروز", () => {
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

  it("تکبانکِ امروز: خانهٔ امروز دکمهٔ پرش است — کلیک = لنگرِ سطرِ فعل + رویدادِ یکبار + بستنِ کارنامه", () => {
    useStudy.setState({
      drillMistakes: { verbs: { go: dueEntry(), see: dueEntry() } }, // دو سررسیدِ امروزِ یک بانک
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = strip(2, 1);
    expect(el).toBeTruthy();
    // r426 — گویشِ ظرفِ نوار هم پرش را میگوید (کشفپذیری از سطحِ ظرف)
    expect(el!.getAttribute("title")).toContain("خانهٔ امروز با سررسیدِ تکبانک پرش به تمرین دارد");
    const btn = el!.querySelector('button[aria-label^="امروز"]')!;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("aria-label")).toBe(
      `امروز — ${faNum(2)} موردِ بازگشت — پرش به تمرینِ افعال بی‌قاعده`,
    );
    expect(btn.className).toContain("bg-emerald-50"); // خانوادهٔ زمردیِ r414
    expect(btn.className).toContain("today-jump"); // کرنلِ دارکِ اسکوپشده (globals r425)
    fireEvent.click(btn);
    // پرش = ناوبریِ واقعی به میزبان با لنگرِ سطرِ نخستین سررسید — نه جلسهٔ ساختگی
    expect(useStudy.getState().view).toEqual({ type: "appendix", verbBase: "go" });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("drill_due_jump");
    expect(closeSpy).toHaveBeenCalledTimes(1); // کارنامه بسته شد — مقصد پنهان نمیماند
  });

  it("words (r428): پرشِ امروز به ضمیمه با لنگرِ سطریِ خانواده — سطرِ واژه مقصد است نه فقط جدول", () => {
    const t = WORD_FAMILY_TABLES[0];
    const noun = t.families.find((f) => f.noun)!.noun;
    useStudy.setState({
      drillMistakes: { words: { [noun]: dueEntry() } },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = strip(1, 1);
    expect(el).toBeTruthy();
    const btn = el!.querySelector('button[aria-label^="امروز"]')!;
    expect(btn.getAttribute("aria-label")).toBe(
      `امروز — ${faNum(1)} موردِ بازگشت — پرش به تمرینِ خانوادهٔ واژه‌ها`,
    );
    fireEvent.click(btn);
    // عمقِ سطریِ r428: view خودِ واژه را هم حمل میکند (سطرِ خانواده پالس میزند)
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      posTableId: wordFamilyTableId(t),
      posRowWord: noun,
    });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("drill_due_jump");
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it("dict-vocab (r430): پرشِ امروز به دیکشنری با لنگرِ کارتِ واژه — نه فرودِ بی‌لنگرِ کهنه", () => {
    const en = lessons[0].vocabulary.find((w) => w.en && w.fa)!.en;
    useStudy.setState({
      drillMistakes: { "dict-vocab": { [en]: dueEntry() } },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = strip(1, 1);
    expect(el).toBeTruthy();
    const btn = el!.querySelector('button[aria-label^="امروز"]')!;
    expect(btn.getAttribute("aria-label")).toBe(
      `امروز — ${faNum(1)} موردِ بازگشت — پرش به تمرینِ واژگان دیکشنری`,
    );
    fireEvent.click(btn);
    // عمقِ سطریِ r430: view خودِ واژه را حمل میکند (عدسی + کارتِ پالس‌دار)
    expect(useStudy.getState().view).toEqual({ type: "dictionary", focusWord: en });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("drill_due_jump");
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it("امروزِ چندبانکی: خانهٔ ساکتِ صادق با گویشِ خودش — نه دکمه، نه مقصدِ حدسی", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry() },
        phonemes: { [SYM]: dueEntry() },
      },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = strip(2, 1);
    expect(el).toBeTruthy();
    const today = el!.querySelector('[title^="امروز"]')!;
    expect(today.tagName).toBe("DIV"); // بیِ مقصدِ یگانه — هیچ دعوتِ کنشی
    expect(today.getAttribute("title")).toBe(
      `امروز — ${faNum(2)} موردِ بازگشت در ${faNum(2)} بانک — هر بانک در میزبانِ خودش تمرین میشود`,
    );
    expect(today.className).toContain("bg-emerald-50"); // زمردیِ شمار میماند
    expect(trackSpy).not.toHaveBeenCalled();
  });

  it("بانکِ ناشناس (کلیدِ کهنه): خانهٔ امروز ساکتِ بیوعده میماند — r236", () => {
    useStudy.setState({
      drillMistakes: { "ghost-bank": { go: dueEntry() } },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = strip(1, 1);
    expect(el).toBeTruthy(); // ردیفِ زنده است — نوار بالا میآید
    const today = el!.querySelector('[title^="امروز"]')!;
    expect(today.tagName).toBe("DIV"); // لنگرِ حلنشده = هیچ دکمهای
    expect(today.getAttribute("title")).toBe(`امروز — ${faNum(1)} موردِ بازگشت`); // زبانِ r422
    expect(today.className).toContain("bg-emerald-50");
  });

  it("بیِ سررسیدِ امروز (فقط درنفسِ درونِ پنجره): نوارِ r422 دستنخورده — هیچ دکمهای", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          come: { wrong: 2, ok: 1, lastDay: YESTERDAY, lastOkDay: TODAY }, // grace1 — فردا
        },
      },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = strip(1, 1);
    expect(el).toBeTruthy();
    const today = el!.querySelector('[title^="امروز"]')!;
    expect(today.tagName).toBe("DIV");
    expect(today.getAttribute("title")).toBe("امروز — بیِ بازگشت"); // ساکتِ صادقِ r236
    expect(today.textContent).toBe(`امروز—`); // بیعدد — r236
  });
});
