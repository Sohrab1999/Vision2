// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r419 — «ریتم، پیشِ ورود» — قفلهایِ نما.
//
// چیپِ میزبان (DrillStatChip r412/r413) تا دیروز فقط گذشته را میگفت:
// «N جلسه · بهترین X٪». حالِ SRS پشتِ درِ تمرین بود. از r419 دو چیپِ
// فشرده کنارِ بنفش بالا میآیند — عینِ خانوادههایِ معرفیِ r414/r417:
//  · زمردیِ «N سررسید» — فقط سررسیدهایِ واقعی (مسلط شمرده نمیشود)
//  · آسمانیِ «N درنفس» — فقط ردیفهایِ برخوردار از نفس (تازهٔ امروزِ
//    بیحق ادعا نمیسازد)
// قفلها:
//  · بیِ رکوردِ جلسه هیچ — حتی با بانکِ خطا (قراردادِ r412 پابرجا)
//  · رکوردِ بیبانک: فقط بنفش — هیچ SRS
//  · مخلوط: بنفش + زمردی + آسمانی، هرکدام با اعدادِ صادقِ خودشان
//  · ariaِ هر چیپ عینِ زبانِ کاملِ خانوادهٔ معرفی است
//  · همه مسلط: هیچ SRS — تسلط سررسید نمیسازد
//  · تازهٔ امروزِ بیحق: هیچ SRS — هیچ ادعایِ برساخته
//  · میزبان: رویِ جدولِ افعال، پیشِ ورود به تمرین — بدونِ بازکردنِ معرفی
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DrillStatChip from "@/components/study/lesson/drill-stat-chip";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { faNum, percentFa } from "@/lib/study-theme";
import { todayStr } from "@/state/day-engine";

const TODAY = todayStr();
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

/** رکوردِ پیشرفتِ میزبان — همانِ DrillStat (r412) */
const hostStat = { sessions: 3, correct: 15, total: 30, bestPercent: 70, lastDay: YESTERDAY };

/** ردیفِ درنفس — آخرین رخداد حقِ امروز، فاصله هنوز نگذشته */
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});

const renderChip = () => render(<DrillStatChip bankId="verbs" />);

const violetChip = () => screen.queryByLabelText(/پیشرفت این تمرین/);
const dueChip = () => screen.queryByLabelText(/سررسیدهای مرور این تمرین/);
const graceChip = () => screen.queryByLabelText(/دورهٔ نفس این تمرین/);

describe("drill-stat-chip r419 — ریتم، پیشِ ورود", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("بیِ رکوردِ جلسه هیچ — حتی با بانکِ خطا (قراردادِ r412 پابرجا)", () => {
    useStudy.setState({ drillMistakes: { verbs: { go: { wrong: 2, ok: 0, lastDay: YESTERDAY, lastOkDay: "" } } } });
    const { container } = renderChip();
    expect(container.textContent).toBe(""); // هیچ چیزی رندر نمیشود
    expect(violetChip()).toBeNull();
    expect(dueChip()).toBeNull();
    expect(graceChip()).toBeNull();
  });

  it("رکوردِ بیبانک: فقط بنفش — هیچ SRS", () => {
    useStudy.setState({ drillStats: { verbs: hostStat } });
    renderChip();
    expect(violetChip()!.textContent).toBe(
      `${faNum(3)} جلسه · بهترین ${percentFa(70)}`,
    );
    expect(dueChip()).toBeNull();
    expect(graceChip()).toBeNull();
  });

  it("مخلوط: بنفش + زمردیِ «۱ سررسید» + آسمانیِ «۲ درنفس» — ariaِ کاملِ خانواده", () => {
    useStudy.setState({
      drillStats: { verbs: hostStat },
      drillMistakes: {
        verbs: {
          go: { wrong: 2, ok: 0, lastDay: YESTERDAY, lastOkDay: "" }, // سررسید
          come: graceEntry(), // درنفسِ grace1
          see: graceEntry({ wrong: 3, ok: 2 }), // درنفسِ grace2
          have: { wrong: 1, ok: 1, lastDay: YESTERDAY, lastOkDay: YESTERDAY }, // مسلط
          eat: { wrong: 1, ok: 0, lastDay: TODAY, lastOkDay: "" }, // تازهٔ امروزِ بیحق
        },
      },
    });
    renderChip();
    expect(violetChip()!.getAttribute("aria-label")).toBe(
      `پیشرفت این تمرین: ${faNum(3)} جلسهٔ کامل، بهترین ${percentFa(70)}`,
    );
    const due = dueChip();
    expect(due).toBeTruthy();
    expect(due!.getAttribute("aria-label")).toBe(`سررسیدهای مرور این تمرین: ${faNum(1)} مورد`);
    expect(due!.textContent).toContain(`${faNum(1)} سررسید`);
    const grace = graceChip();
    expect(grace).toBeTruthy();
    // aria عینِ زبانِ کاملِ خانوادهٔ معرفیِ r417 است
    expect(grace!.getAttribute("aria-label")).toBe(
      `دورهٔ نفس این تمرین: ${faNum(2)} مورد در استراحت، نزدیکترین بازگشت ${faNum(1)} روز دیگر`,
    );
    expect(grace!.textContent).toContain(`${faNum(2)} درنفس`);
    // مسلط و تازهٔ امروز در هیچ چیپی شمرده نشدند — ۱+۲ نه ۴
  });

  it("فاصلهٔ بلندترِ نفس: ok=2 → ariaِ «۲ روزِ دیگر»", () => {
    useStudy.setState({
      drillStats: { verbs: hostStat },
      drillMistakes: { verbs: { see: graceEntry({ wrong: 3, ok: 2 }) } },
    });
    renderChip();
    expect(graceChip()!.getAttribute("aria-label")).toBe(
      `دورهٔ نفس این تمرین: ${faNum(1)} مورد در استراحت، نزدیکترین بازگشت ${faNum(2)} روز دیگر`,
    );
    expect(dueChip()).toBeNull();
  });

  it("همه مسلط: هیچ SRS — تسلط سررسید نمیسازد", () => {
    useStudy.setState({
      drillStats: { verbs: hostStat },
      drillMistakes: {
        verbs: {
          have: { wrong: 2, ok: 2, lastDay: YESTERDAY, lastOkDay: YESTERDAY },
          take: { wrong: 3, ok: 4, lastDay: YESTERDAY, lastOkDay: TODAY },
        },
      },
    });
    renderChip();
    expect(violetChip()).toBeTruthy();
    expect(dueChip()).toBeNull();
    expect(graceChip()).toBeNull();
  });

  it("تازهٔ امروزِ بیحق: هیچ SRS — هیچ ادعایِ برساخته (r417)", () => {
    useStudy.setState({
      drillStats: { verbs: hostStat },
      drillMistakes: { verbs: { eat: { wrong: 1, ok: 0, lastDay: TODAY, lastOkDay: "" } } },
    });
    renderChip();
    expect(violetChip()).toBeTruthy();
    expect(dueChip()).toBeNull();
    expect(graceChip()).toBeNull();
  });

  it("میزبان: رویِ جدولِ افعال کنارِ دکمهٔ «تمرین» — پیشِ ورود، بدونِ بازکردنِ معرفی", () => {
    useStudy.setState({
      drillStats: { verbs: hostStat },
      drillMistakes: {
        verbs: {
          go: { wrong: 2, ok: 0, lastDay: YESTERDAY, lastOkDay: "" }, // سررسید
          come: graceEntry(), // درنفس
        },
      },
    });
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
    // معرفی هنوز باز نشده — چیپهایِ میزبان خودشان صحبت میکنند
    expect(screen.getByLabelText(`سررسیدهای مرور این تمرین: ${faNum(1)} مورد`)).toBeTruthy();
    expect(
      screen.getByLabelText(
        `دورهٔ نفس این تمرین: ${faNum(1)} مورد در استراحت، نزدیکترین بازگشت ${faNum(1)} روز دیگر`,
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText(/پیشرفت این تمرین/)).toBeTruthy();
  });
});
