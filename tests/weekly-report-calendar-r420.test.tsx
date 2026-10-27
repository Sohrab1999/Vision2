// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r420 — «تقویمِ همهٔ بانکها» — قفلهایِ نمایِ هفته‌نامه.
//
// دکمهٔ چهارمِ نوارِ خروجیهایِ CSV — فقط با ردیفِ زنده (r236، عینِ
// r418). قفلها:
//  · بیِ بانکِ خطا: دکمهٔ همه-بانکی غایب — همکارانِ همیشگی حاضرند
//  · دو بانکِ زنده: aria با شمارِ کلِ ردیفها (ارقامِ فارسی)
//  · کلیک: blobِ واقعی — سرصفحهٔ دهستونی، بلوکِ verbs پیشِ phonemes
//    (ترتیبِ رسمیِ اطلس)، برچسبها از اطلس، BOM در سرِ بایتها (r401)
//    + toastِ موفقیتِ خودگویش (پروبِ stateِ r398)
//  · شکستِ COU: fileFailToastِ نامدار (r398) — بی toastِ موفقیت
// درسِ r418: استابِ appendChild بعدِ mount نصب میشود، نه پیشِ آن.
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { useToast } from "@/hooks/use-toast"; // r398 — ایدئومِ پروبِ state
import { faNum } from "@/lib/study-theme";
import { todayStr } from "@/state/day-engine";
import { consonantPhonemes, vowelPhonemes } from "@/data/appendix";
import { resolveDrillLabel } from "@/lib/drill-label-atlas";
import { faWeekday } from "@/lib/weekly-digest";

const TODAY = todayStr();
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});

/** نمادِ واقعیِ نخستین واک — برچسب از خودِ اطلس میآید (داده‌محور) */
const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;

const allBtn = () => screen.queryByRole("button", { name: /دانلود تقویم مرور همهٔ تمرین‌ها/ });

function ToastProbe({ onToasts }: { onToasts: (t: ReturnType<typeof useToast>["toasts"]) => void }) {
  const s = useToast();
  useEffect(() => {
    onToasts(s.toasts);
  }, [s.toasts, onToasts]);
  return null;
}

describe("weekly-report r420 — دکمهٔ تقویمِ همهٔ بانکها", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  afterEach(() => {
    cleanup();
  });

  it("بیِ بانکِ خطا: دکمهٔ همه-بانکی غایب — همکارانِ همیشگیِ نوار حاضرند (r236)", () => {
    render(<ReportCard open onClose={() => {}} />);
    expect(allBtn()).toBeNull();
    expect(screen.getByLabelText("دانلود جدول CSV پیشرفت")).toBeTruthy();
    expect(screen.getByLabelText("دانلود ماه‌نامهٔ خواندن CSV")).toBeTruthy();
  });

  it("دو بانکِ زنده: aria با شمارِ کلِ ردیفهایِ هر دو بانک", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(), // سررسید
          come: graceEntry(), // درنفس
        },
        phonemes: { [SYM]: graceEntry() }, // درنفسِ بانکِ دوم
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(allBtn()!.getAttribute("aria-label")).toBe(
      `دانلود تقویم مرور همهٔ تمرین‌ها CSV — ${faNum(3)} ردیفِ زنده`,
    );
  });

  it("کلیک: blobِ واقعی — دهستونی، بلوکِ verbs پیشِ phonemes، برچسب از اطلس + toastِ موفقیت", async () => {
    const originalCOU = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: (b: Blob) => {
        (globalThis as unknown as { __r420blob?: Blob }).__r420blob = b;
        return "blob:r420-view-fake";
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    let toasts: ReturnType<typeof useToast>["toasts"] = [];
    try {
      useStudy.setState({
        drillMistakes: {
          phonemes: { [SYM]: graceEntry() },
          verbs: { go: dueEntry() }, // نقشه عمداً بیترتیب — بلوکِ رسمی میچیند
        },
      });
      render(
        <>
          <ReportCard open onClose={() => {}} />
          <ToastProbe onToasts={(t) => (toasts = t)} />
        </>,
      );
      // استابِ append بعدِ mount — درسِ r418 (استابِ پیش از render کلِ سوارشدن را میگیرد)
      const appended: HTMLElement[] = [];
      const origAppend = document.body.appendChild.bind(document.body);
      document.body.appendChild = ((el: HTMLElement) => {
        appended.push(el);
        return el;
      }) as typeof document.body.appendChild;
      try {
        fireEvent.click(allBtn()!);
      } finally {
        document.body.appendChild = origAppend;
      }
      const anchor = appended.find(
        (el) => (el as HTMLAnchorElement).download === `vision2-review-calendar-all-${TODAY}.csv`,
      );
      expect(anchor).toBeTruthy();
      const blob = (globalThis as unknown as { __r420blob?: Blob }).__r420blob!;
      const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await blob.arrayBuffer());
      expect(text.charCodeAt(0)).toBe(0xfeff); // BOM نزدِ جایِ دانلود (r399)
      const lines = text.split("\r\n").filter((l) => l !== "");
      // ignoreBOM یعنی BOM در متن میماند (حذف نمیشود) — سرصفحه بعدِ آن است
      expect(lines[0].slice(1)).toBe(
        "وضعیت,بانک,پایه,معنی,خطاها,حقها,آخرین خطا,روزِ بازگشت,روز هفته,روزهای مانده",
      );
      // بلوکِ رسمیِ اطلس: verbs (سررسید) پیشِ phonemes (درنفس) — برچسبها از اطلس؛
      // سررسید = بازگشتِ امروز (daysUntil ۰) — جدولِ همیشههمشکلِ r418
      expect(lines[1]).toBe(
        `سررسید,افعال بی‌قاعده,go,${resolveDrillLabel("verbs", "go")},2,0,${YESTERDAY},${TODAY},${faWeekday(TODAY)},0`,
      );
      expect(lines[2].startsWith(`درنفس,جدول تلفظ,${SYM},${resolveDrillLabel("phonemes", SYM)},`)).toBe(true);
      const okToast = toasts.find((t) => t.title === "🗓 تقویمِ همهٔ تمرینها ذخیره شد");
      expect(okToast).toBeTruthy();
      expect(okToast!.description).toContain(`${faNum(2)} بانک`);
    } finally {
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
      Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    }
  });

  it("شکستِ COU: fileFailToastِ نامدار (r398) — بی toastِ موفقیت", () => {
    const originalCOU = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => {
        throw new TypeError("r420-view-cou");
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    let toasts: ReturnType<typeof useToast>["toasts"] = [];
    try {
      useStudy.setState({
        drillMistakes: { verbs: { go: dueEntry() } },
      });
      render(
        <>
          <ReportCard open onClose={() => {}} />
          <ToastProbe onToasts={(t) => (toasts = t)} />
        </>,
      );
      // r454 — TOAST_LIMIT=3: توستهایِ راندهایِ پیش در سبد میمانند؛ نیّتِ
      // «بی toastِ موفقیت» یعنی «در همین راند توستِ موفقیتِ تازه نیامده» —
      // شمارشِ عنوان-همان نباید افزایش یابد.
      const okBefore = toasts.filter((t) => t.title === "🗓 تقویمِ همهٔ تمرینها ذخیره شد").length;
      fireEvent.click(allBtn()!);
      expect(toasts.some((t) => t.title === "خطا در ساخت فایل" && t.duration === 3000)).toBe(true);
      expect(toasts.filter((t) => t.title === "🗓 تقویمِ همهٔ تمرینها ذخیره شد").length).toBe(okBefore);
    } finally {
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
      Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    }
  });
});
