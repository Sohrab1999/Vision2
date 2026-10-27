// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r417 — «شفافیتِ ریتم» — قفلهایِ نما.
//
// چیپِ آسمانیِ دورهٔ نفس: ردیفِ درنفس از چیپِ زمردی (r414) غایب است —
// و از r417 در چیپِ خودش دیده میشود. قفلها:
//  · درنفسِ تنها: چیپِ آسمانی با «فردا» (نزدیکترین بازگشت) — زمردی
//    غایب، رزگونِ ثبتشده میماند (سه حقیقتِ جدا)
//  · مخلوطِ سررسید+نفس: هر دو چیپ با اعدادِ صادقِ خودشان
//  · فاصلهٔ بلندتر: ok=2 → «۲ روزِ دیگر» — نه «فردا»
//  · مسلطِ کامل: چیپِ آسمانی صادقانه غایب — تسلط بازگشتی ندارد
//  · تازهٔ امروزِ بیحق: نه سررسید نه نفس — هیچ ادعایِ برساخته
//  · بانکِ غایب: هیچ چیزی — قراردادِ صفرِ صادقِ r236
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { todayStr } from "@/state/day-engine";

const TODAY = todayStr();
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

/** ردیفِ درنفس — آخرین رخداد حقِ امروز، فاصله هنوز نگذشته */
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});

const openDrillIntro = () => {
  render(<AppendixView />);
  fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
};

const graceChip = () => screen.queryByLabelText(/دورهٔ نفس این تمرین/);
const dueChip = () => screen.queryByLabelText(/سررسیدهای مرور این تمرین/);

describe("appendix-drill-view r417 — چیپِ آسمانیِ دورهٔ نفس", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("درنفسِ تنها: چیپِ آسمانی با «فردا» — زمردی غایب، رزگونِ ثبتشده میماند", () => {
    useStudy.setState({ drillMistakes: { verbs: { come: graceEntry() } } });
    openDrillIntro();
    const chip = graceChip();
    expect(chip).toBeTruthy();
    expect(chip!.getAttribute("aria-label")).toBe(
      `دورهٔ نفس این تمرین: ${faNum(1)} مورد در استراحت، نزدیکترین بازگشت ${faNum(1)} روز دیگر`,
    );
    expect(chip!.textContent).toContain("۱ مورد در دورهٔ نفس");
    expect(chip!.textContent).toContain("فردا"); // فاصلهٔ ۱ = فردا، نه «۱ روزِ دیگر»
    expect(dueChip()).toBeNull(); // سررسید نیست — زمردی صادقانه غایب
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۱ مورد ثبتشده")).toBeTruthy();
  });

  it("مخلوطِ سررسید+نفس: هر دو چیپ با اعدادِ صادقِ خودشان — سه حقیقتِ جدا", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: { wrong: 2, ok: 0, lastDay: YESTERDAY, lastOkDay: "" }, // سررسید
          come: graceEntry(), // درنفسِ grace1
          see: graceEntry({ wrong: 3, ok: 2 }), // درنفسِ grace2
        },
      },
    });
    openDrillIntro();
    expect(dueChip()!.getAttribute("aria-label")).toBe(
      `سررسیدهای مرور این تمرین: ${faNum(1)} مورد`,
    );
    expect(graceChip()!.getAttribute("aria-label")).toBe(
      `دورهٔ نفس این تمرین: ${faNum(2)} مورد در استراحت، نزدیکترین بازگشت ${faNum(1)} روز دیگر`,
    );
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۳ مورد ثبتشده")).toBeTruthy();
  });

  it("فاصلهٔ بلندتر: ok=2 → «۲ روزِ دیگر» — نه «فردا»", () => {
    useStudy.setState({ drillMistakes: { verbs: { see: graceEntry({ wrong: 3, ok: 2 }) } } });
    openDrillIntro();
    const chip = graceChip();
    expect(chip).toBeTruthy();
    expect(chip!.textContent).toContain("۱ مورد در دورهٔ نفس");
    expect(chip!.textContent).toContain("۲ روزِ دیگر");
    expect(chip!.textContent).not.toContain("فردا");
  });

  it("مسلطِ کامل: چیپِ آسمانی صادقانه غایب — تسلط بازگشتی ندارد", () => {
    useStudy.setState({
      drillMistakes: { verbs: { have: { wrong: 1, ok: 1, lastDay: YESTERDAY, lastOkDay: TODAY } } },
    });
    openDrillIntro();
    expect(graceChip()).toBeNull();
    expect(dueChip()).toBeNull();
  });

  it("تازهٔ امروزِ بیحق: نه سررسید نه نفس — هیچ ادعایِ برساختهای رندر نمیشود", () => {
    useStudy.setState({
      drillMistakes: { verbs: { eat: { wrong: 1, ok: 0, lastDay: TODAY, lastOkDay: "" } } },
    });
    openDrillIntro();
    expect(graceChip()).toBeNull();
    expect(dueChip()).toBeNull();
    // فقط حقیقتِ ثبتشده میماند
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۱ مورد ثبتشده")).toBeTruthy();
  });

  it("بانکِ غایب: هیچ چیزی — قراردادِ صفرِ صادق", () => {
    openDrillIntro();
    expect(graceChip()).toBeNull();
    expect(dueChip()).toBeNull();
  });
});
