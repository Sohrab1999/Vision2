// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r421 — «تقویمِ هفتهٔ پیشِ رو» — قفلهایِ نمایِ هفته‌نامه.
//
// دکمهٔ پنجمِ نوارِ خروجیهایِ CSV — برشِ ۷روزهٔ اطلسِ r420. قفلها:
//  · بیِ بانکِ خطا: دکمهٔ هفته و همه-بانکی هر دو غایب — سهگانهٔ کهنه
//    حاضر (r236 — قراردادِ r418/r420 پابرجا)
//  · بانکِ مخلوط: ariaِ هفته فقط ردیفهایِ درونِ پنجره را میشمارد
//    («۳ ردیفِ این هفته») — نه کلِ بانک؛ ariaِ همه-بانکی کل را میگوید
//  · همه‌دورترها (درنفسِ grace8): دکمهٔ هفته غایب، همه-بانکی حاضر —
//    هفتهای که فقط «پس از هفته» دارد وعدهٔ بیپشتوانه است (r236)
//  · کلیک: blobِ واقعی — BOM در سرِ بایتها، سطرهایِ جمعِ روز پیشِ
//    ردیفهایِ هر روز، دنبالهٔ «پس از هفته» + toastِ خودگویش
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
import { todayStr, daysAgoKey } from "@/state/day-engine";
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

const weekBtn = () => screen.queryByRole("button", { name: /دانلود تقویم هفتهٔ پیشِ رو/ });
const allBtn = () => screen.queryByRole("button", { name: /دانلود تقویم مرور همهٔ تمرین‌ها/ });

function ToastProbe({ onToasts }: { onToasts: (t: ReturnType<typeof useToast>["toasts"]) => void }) {
  const s = useToast();
  useEffect(() => {
    onToasts(s.toasts);
  }, [s.toasts, onToasts]);
  return null;
}

describe("weekly-report r421 — دکمهٔ تقویمِ هفتهٔ پیشِ رو", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  afterEach(() => {
    cleanup();
  });

  it("بیِ بانکِ خطا: دکمهٔ هفته و همه-بانکی هر دو غایب — سهگانهٔ کهنه حاضر (r236)", () => {
    render(<ReportCard open onClose={() => {}} />);
    expect(weekBtn()).toBeNull();
    expect(allBtn()).toBeNull();
    expect(screen.getByLabelText("دانلود جدول CSV پیشرفت")).toBeTruthy();
    expect(screen.getByLabelText("دانلود ماه‌نامهٔ خواندن CSV")).toBeTruthy();
  });

  it("بانکِ مخلوط: ariaِ هفته فقط ردیفهایِ درونِ پنجره را میشمارد — نه کلِ بانک", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(), // روزِ ۰ — درون
          come: graceEntry(), // grace1 — درون
          run: { wrong: 5, ok: 4, lastDay: YESTERDAY, lastOkDay: TODAY }, // grace8 — بیرونِ پنجره
        },
        phonemes: {
          [SYM]: { wrong: 5, ok: 4, lastDay: daysAgoKey(3), lastOkDay: daysAgoKey(2) }, // grace6 — لبهٔ درون
        },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    // r436 — aria پس از شمارِ درونِ پنجره، جملهٔ نامِ دنباله را هم میگوید
    // (پیشنهادِ ②ِ r435 از هِلپرِ مشترکِ afterWeekNaming) — گویشِ عینِ
    // toastِ r435. قصدِ r421 پابرجاست: شمار «۳» فقط ردیفهایِ درونِ
    // پنجره است، نه کلِ بانک (runِ grace8 در شمار نیامده).
    expect(weekBtn()!.getAttribute("aria-label")).toBe(
      `دانلود تقویم هفتهٔ پیشِ رو CSV — ${faNum(3)} ردیفِ این هفته؛ نزدیکترین بازگشت پس از هفته: تمرینِ افعال بی‌قاعده، ${faNum(8)} روزِ دیگر`,
    );
    expect(allBtn()!.getAttribute("aria-label")).toBe(
      `دانلود تقویم مرور همهٔ تمرین‌ها CSV — ${faNum(4)} ردیفِ زنده`,
    );
  });

  it("همه‌دورترها: دکمهٔ هفته غایب — همه-بانکی حاضر میماند (وعدهٔ بیپشتوانه نیست)", () => {
    useStudy.setState({
      drillMistakes: {
        phonemes: {
          [SYM]: { wrong: 5, ok: 4, lastDay: YESTERDAY, lastOkDay: TODAY }, // grace8 — دورتر از هفته
        },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(weekBtn()).toBeNull();
    expect(allBtn()).toBeTruthy();
  });

  it("کلیک: blobِ واقعی — جمعِ روز پیشِ ردیفهایِ هر روز، پس از هفته در دنباله + toastِ خودگویش", async () => {
    const originalCOU = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: (b: Blob) => {
        (globalThis as unknown as { __r421blob?: Blob }).__r421blob = b;
        return "blob:r421-view-fake";
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    let toasts: ReturnType<typeof useToast>["toasts"] = [];
    try {
      useStudy.setState({
        drillMistakes: {
          phonemes: { [SYM]: { wrong: 5, ok: 4, lastDay: daysAgoKey(3), lastOkDay: daysAgoKey(2) } }, // روزِ ۶
          verbs: {
            run: { wrong: 5, ok: 4, lastDay: YESTERDAY, lastOkDay: TODAY }, // grace8 — پس از هفته
            go: dueEntry(), // روزِ ۰
            come: graceEntry(), // روزِ ۱
          },
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
        fireEvent.click(weekBtn()!);
      } finally {
        document.body.appendChild = origAppend;
      }
      const anchor = appended.find(
        (el) => (el as HTMLAnchorElement).download === `vision2-review-week-${TODAY}.csv`,
      );
      expect(anchor).toBeTruthy();
      const blob = (globalThis as unknown as { __r421blob?: Blob }).__r421blob!;
      const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await blob.arrayBuffer());
      expect(text.charCodeAt(0)).toBe(0xfeff); // BOM نزدِ جایِ دانلود (r399)
      const lines = text.split("\r\n").filter((l) => l !== "");
      // ignoreBOM یعنی BOM در متن میماند — سرصفحه بعدِ آن است
      expect(lines[0].slice(1)).toBe(
        "وضعیت,بانک,پایه,معنی,خطاها,حقها,آخرین خطا,روزِ بازگشت,روز هفته,روزهای مانده",
      );
      // ۸ سطر: جمعِ ۰ + go + جمعِ ۱ + come + جمعِ ۶ + SYM + پس از هفته (run)
      expect(lines).toHaveLength(8);
      expect(lines[1].split(",")).toEqual(["جمعِ روز", "", "", "1 مورد", "", "", "", TODAY, faWeekday(TODAY), "0"]);
      expect(lines[2]).toBe(
        `سررسید,افعال بی‌قاعده,go,${resolveDrillLabel("verbs", "go")},2,0,${YESTERDAY},${TODAY},${faWeekday(TODAY)},0`,
      );
      expect(lines[3].startsWith("جمعِ روز,,,1 مورد,,,,")).toBe(true);
      expect(lines[4]).toContain(`درنفس,افعال بی‌قاعده,come,${resolveDrillLabel("verbs", "come")},`);
      expect(lines[5].startsWith("جمعِ روز,,,1 مورد,,,,")).toBe(true);
      expect(lines[6]).toContain(`درنفس,جدول تلفظ,${SYM},${resolveDrillLabel("phonemes", SYM)},`);
      expect(lines[7].startsWith("پس از هفته,,,1 موردِ دیگر,,,,")).toBe(true);
      expect(lines[7].endsWith(",8")); // نزدیکترینِ دورترها — run در grace8
      const okToast = toasts.find((t) => t.title === "🗓 تقویمِ هفتهٔ پیشِ رو ذخیره شد");
      expect(okToast).toBeTruthy();
      expect(okToast!.description).toContain(`${faNum(3)} ردیف در ${faNum(3)} روزِ پیشِ رو`);
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
        throw new TypeError("r421-view-cou");
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
      const okBefore = toasts.filter((t) => t.title === "🗓 تقویمِ هفتهٔ پیشِ رو ذخیره شد").length;
      fireEvent.click(weekBtn()!);
      expect(toasts.some((t) => t.title === "خطا در ساخت فایل" && t.duration === 3000)).toBe(true);
      expect(toasts.filter((t) => t.title === "🗓 تقویمِ هفتهٔ پیشِ رو ذخیره شد").length).toBe(okBefore);
    } finally {
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
      Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    }
  });
});
