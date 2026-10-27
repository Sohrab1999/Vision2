// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r416 — «فاصلهگذاریِ پیشروندهٔ سررسید» — قفلهایِ نما.
//
// چیپِ زمردی و دکمهٔ تمرینِ سررسیدها (r414/r415) از countDrillDue میخوانند —
// پس سیاستِ دورهٔ نفس بیِ هیچ تغییرِ نما، صادقانه در UI دیده میشود.
// قفلها:
//  · ردیفِ درنفس (حقِ امروز، نیمهتسلط): چیپِ زمردی و دکمه صادقانه غایب —
//    چیپِ رزگونِ ثبتشده میماند (دو حقیقتِ جدا)
//  · فاصلهٔ سپریشده: همان ردیف به صف برمیگردد — چیپ و دکمه با عددِ صادق
//  · جریانِ کامل: پاسخِ درستِ سررسیدِ نیمهتسلط همان لحظه از صف بیرونش
//    میآورد (در r414 چنین ردیفی در صف میماند — شاهدِ زندهٔ r415: «۱ سررسید»)
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { countDrillDue } from "@/lib/drill-mistakes";
import { faNum } from "@/lib/study-theme";
import { todayStr } from "@/state/day-engine";
import { irregularVerbs } from "@/data/appendix";

const TODAY = todayStr();
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — سررسیدِ صادق زیرِ هر تاریخِ اجرا

/** ردیفِ نیمهتسلطِ خطادار — پایهٔ گفتوگویِ دورهٔ نفس (wrong > ok، ولی حقِ تازه) */
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: YESTERDAY,
  lastOkDay: TODAY, // حقِ امروز — دورهٔ نفسِ تازه
  ...over,
});

const openVerbsTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
};

const openDrillIntro = () => {
  render(<AppendixView />);
  openVerbsTab();
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
};

const mistakeBtn = (n: number) =>
  screen.getByRole("button", {
    name: `شروع جلسهٔ تمرین فقط از سررسیدهای این تمرین: ${faNum(n)} مورد`,
  });

/** هدفِ پرسشِ فعلی را از پرامپتش مییابد و شکلِ درستِ پاسخ را برمیگرداند */
const correctOfCurrent = (): string => {
  const promptEl = screen.getByText(/کدام است؟|متعلق به کدام فعل است؟/);
  const prompt = promptEl.textContent || "";
  // الگوی r415: پرامپت «معنیِ» → fa؛ «گذشتهٔ سادهٔ» → past؛ p.p. → pp؛ وگرنه base
  const target = irregularVerbs.find(
    (v) => prompt.includes(`«${v.base}»`) || prompt.includes(`«${v.past}»`),
  );
  expect(target).toBeDefined();
  return prompt.startsWith("معنیِ") ? target!.fa
    : prompt.includes("گذشتهٔ سادهٔ") ? target!.past
    : prompt.includes("p.p.") ? target!.pp
    : target!.base;
};

const clickOption = (match: (label: string) => boolean) => {
  const opt = screen
    .getAllByRole("button", { name: /^گزینه [۱-۴]: / })
    .find((b) => match(b.getAttribute("aria-label") || ""));
  expect(opt).toBeDefined();
  fireEvent.click(opt!);
};

const runQuestions = (n: number, mode: "correct" | "wrong") => {
  for (let i = 0; i < n; i++) {
    const correct = correctOfCurrent();
    if (mode === "correct") clickOption((l) => l.includes(correct));
    else clickOption((l) => !l.includes(correct));
    fireEvent.click(
      i === n - 1
        ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
        : screen.getByRole("button", { name: "سؤال بعدی" }),
    );
  }
};

describe("appendix-drill-view r416 — دورهٔ نفسِ سررسید در نما", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("ردیفِ درنفس: چیپِ زمردی و دکمهٔ سررسید صادقانه غایب — چیپِ رزگونِ ثبتشده میماند", () => {
    useStudy.setState({ drillMistakes: { verbs: { go: graceEntry() } } });
    expect(countDrillDue(useStudy.getState().drillMistakes["verbs"], TODAY)).toBe(0);
    openDrillIntro();
    expect(screen.queryByLabelText(/سررسیدهای مرور این تمرین/)).toBeNull();
    expect(screen.queryByRole("button", { name: /شروع جلسهٔ تمرین فقط از سررسیدها/ })).toBeNull();
    // دو حقیقتِ جدا: ثبتشده هست، سررسید نیست
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۱ مورد ثبتشده")).toBeTruthy();
  });

  it("فاصلهٔ سپریشده: ردیف به صف برمیگردد — چیپ و دکمه با عددِ صادق", () => {
    // حقِ ۱۰ اکتبر، grace(1)=۱ → از ۱۱ اکتبر سررسید — زیرِ هر تاریخِ اجرا
    useStudy.setState({
      drillMistakes: { verbs: { go: graceEntry({ lastDay: "2026-10-09", lastOkDay: "2026-10-10" }) } },
    });
    expect(countDrillDue(useStudy.getState().drillMistakes["verbs"], TODAY)).toBe(1);
    openDrillIntro();
    expect(screen.getByLabelText(/سررسیدهای مرور این تمرین/)).toBeTruthy();
    expect(mistakeBtn(1)).toBeTruthy();
  });

  it("جریانِ کامل: پاسخِ درستِ سررسیدِ نیمهتسلط همان لحظه از صف بیرونش میآورد — در r414 در صف میماند", () => {
    useStudy.setState({ drillMistakes: { verbs: { go: { wrong: 2, ok: 0, lastDay: YESTERDAY, lastOkDay: "" } } } });
    openDrillIntro();
    // پیشِ جلسه: نیمهتسلطِ بیحق، سررسید است
    expect(mistakeBtn(1)).toBeTruthy();
    fireEvent.click(mistakeBtn(1));
    expect(screen.getByText(`سؤال ${faNum(1)} از ${faNum(1)}`)).toBeTruthy();
    runQuestions(1, "correct"); // پرسشِ نخست = go (تنها سررسید — صفِ اولویت)
    const go = useStudy.getState().drillMistakes["verbs"]!["go"]!;
    expect(go.ok).toBe(1);
    expect(go.wrong).toBe(2); // نیمهتسلط — مسلط نشده
    expect(go.lastOkDay).toBe(TODAY);
    expect(countDrillDue(useStudy.getState().drillMistakes["verbs"], TODAY)).toBe(0); // درنفس
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول افعال از نتیجه" }));
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    // معرفیِ پسِ حق: چیپِ سررسید و دکمه صادقانه غایب — گرچه مسلط نشده
    expect(screen.queryByLabelText(/سررسیدهای مرور این تمرین/)).toBeNull();
    expect(screen.queryByRole("button", { name: /شروع جلسهٔ تمرین فقط از سررسیدها/ })).toBeNull();
    // چیپِ خطا میماند — دو حقیقتِ جدا (ثبتشده ≠ سررسید)
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۱ مورد ثبتشده")).toBeTruthy();
  });
});
