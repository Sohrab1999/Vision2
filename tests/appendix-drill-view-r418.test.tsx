// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r418 — «صادرِ تقویمِ مرور» — قفلهایِ نما.
//
// دکمهٔ «تقویمِ مرور (CSV)» در معرفیِ هر بانک — خانوادهٔ سنگیِ خنثی
// (خبرِ برنامهای، نه کنشِ زمردی و نه هشدارِ رزگون). قفلها:
//  · بانکِ زنده + مالکِ برچسب: دکمه با ariaِ دوعددیِ صادق (سررسید + درنفس)
//  · کلیک: دانلودِ BOMدار با سطرهایِ SRSِ صادق + toastِ موفقیتِ خودگویش
//  · شکستِ COU: fileFailToast (جفتِ نامدارِ r398)
//  · بانکِ تهی / همه مسلط: هیچ دکمهای — تقویمِ تهی ادعایِ بیپشتوانه (r236)
//  · میزبانِ بیِمالکِ برچسب (سازگاریِ پسرو، عینِ r415): دکمه نیست
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { useEffect } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import AppendixDrillView from "@/components/study/lesson/appendix-drill-view";
import { useStudy } from "@/lib/study-store";
import { useToast } from "@/hooks/use-toast"; // r398 — ایدئومِ پروبِ state (تسترِ Toaster نیست)
import { faNum } from "@/lib/study-theme";
import { todayStr } from "@/state/day-engine";

const TODAY = todayStr();
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});
/** ردیفِ درنفس — آخرین رخداد حقِ امروز، فاصله هنوز نگذشته */
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});

const openDrillIntro = (onToasts?: (t: ReturnType<typeof useToast>["toasts"]) => void) => {
  // r398 — پروبِ stateِ toast (تسترِ Toaster در درخت نیست — DOMِ toast جایی رندر نمیشود)
  function ToastProbe() {
    const s = useToast();
    useEffect(() => {
      onToasts?.(s.toasts);
    }, [s.toasts, onToasts]);
    return null;
  }
  render(
    <>
      <AppendixView />
      {onToasts ? <ToastProbe /> : null}
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
};

const calendarBtn = () => screen.queryByRole("button", { name: /دانلود تقویم مرور این تمرین/ });

describe("appendix-drill-view r418 — دکمهٔ تقویمِ مرور", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("بانکِ زنده: دکمه با ariaِ دوحقیقتی — ۱ سررسید و ۱ درنفس (ارقامِ فارسی)", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(),
          come: graceEntry(),
        },
      },
    });
    openDrillIntro();
    const btn = calendarBtn();
    expect(btn).toBeTruthy();
    expect(btn!.getAttribute("aria-label")).toBe(
      `دانلود تقویم مرور این تمرین: ${faNum(1)} سررسید و ${faNum(1)} مورد در دورهٔ نفس`,
    );
    expect(btn!.textContent).toContain("تقویمِ مرور (CSV)");
  });

  it("کلیک: دانلودِ BOMدار — سررسیدها به اولویت و درنفسها به نزدیکترین + toastِ موفقیت", async () => {
    const originalCOU = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: (b: Blob) => {
        (globalThis as unknown as { __r418blob?: Blob }).__r418blob = b;
        return "blob:r418-view-fake";
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    let toasts: ReturnType<typeof useToast>["toasts"] = [];
    try {
      useStudy.setState({
        drillMistakes: {
          verbs: {
            go: dueEntry(), // سررسیدِ ساده
            see: dueEntry({ wrong: 3, lastDay: "2026-10-18" }), // سررسید — اولویتِ بالاتر
            come: graceEntry(), // درنفسِ grace1
          },
        },
      });
      openDrillIntro((t) => {
        toasts = t;
      });
      // دنبالهٔ نقاش لنگر را append و همانلحظه remove میکند — گرفتن با ایدئومِ r351
      // (استابِ بعد از mount — نه پیشِ آن؛ درسِ رانِ نخستِ همین راند)
      const appended: HTMLElement[] = [];
      const origAppend = document.body.appendChild.bind(document.body);
      document.body.appendChild = ((el: HTMLElement) => {
        appended.push(el);
        return el;
      }) as typeof document.body.appendChild;
      try {
        fireEvent.click(calendarBtn()!);
      } finally {
        document.body.appendChild = origAppend;
      }
      const anchor = appended.find(
        (el) => (el as HTMLAnchorElement).download === `vision2-review-calendar-${TODAY}.csv`,
      );
      expect(anchor).toBeTruthy();
      // درسِ r401: blob.text() جوابِ BOM را میبلعد — arrayBuffer + ignoreBOM
      const blob = (globalThis as unknown as { __r418blob?: Blob }).__r418blob!;
      const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await blob.arrayBuffer());
      expect(text.charCodeAt(0)).toBe(0xfeff); // BOM نزدِ جایِ دانلود (r399)
      const lines = text.split("\r\n").filter((l) => l !== "");
      expect(lines[0]).toContain("وضعیت,پایه,معنی");
      expect(lines[1]).toContain("سررسید,see,دیدن"); // بیشترینِ خطا نخست
      expect(lines[2]).toContain("سررسید,go,رفتن");
      expect(lines[3]).toContain("درنفس,come,آمدن، رسیدن"); // معنیِ میزبان
      // toastِ موفقیت — گویشِ خودِ این در (پروبِ stateِ r398)؛ توصیف زبانِ سطرها را میگوید
      const okToast = toasts.find((t) => t.title === "🗓 تقویم مرور ذخیره شد");
      expect(okToast).toBeTruthy();
      expect(String(okToast!.description)).toContain("۳ ردیفِ زنده");
    } finally {
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
      Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    }
  });

  it("شکستِ COU: fileFailToast — جفتِ نامدارِ r398، بی toastِ موفقیت", () => {
    const originalCOU = globalThis.URL.createObjectURL;
    try {
      Object.defineProperty(globalThis.URL, "createObjectURL", {
        value: () => {
          throw new TypeError("r418-view-cou");
        },
        writable: true,
        configurable: true,
      });
      useStudy.setState({ drillMistakes: { verbs: { go: dueEntry() } } });
      let toasts: ReturnType<typeof useToast>["toasts"] = [];
      openDrillIntro((t) => {
        toasts = t;
      });
      // r454 — TOAST_LIMIT=3: توستهایِ راندهایِ پیش (مثلاً موفقیتِ تستِ
      // قبلی) در سبد زنده میمانند و دیگر با توستِ نو حذف نمیشوند؛ نیّتِ
      // «بی toastِ موفقیت» یعنی «در همین راند توستِ موفقیتِ تازه نیامده» —
      // پس شمارشِ توستهایِ موفقیتِ عنوان-همان نباید افزایش یابد.
      const okBefore = toasts.filter((t) => t.title === "🗓 تقویم مرور ذخیره شد").length;
      fireEvent.click(calendarBtn()!);
      expect(toasts.some((t) => t.title === "خطا در ساخت فایل" && t.duration === 3000)).toBe(true);
      expect(toasts.filter((t) => t.title === "🗓 تقویم مرور ذخیره شد").length).toBe(okBefore);
    } finally {
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
    }
  });

  it("بانکِ تهی: هیچ دکمهای — صفرِ صادقِ r236 حتی با مالکِ برچسبِ حاضر", () => {
    openDrillIntro();
    expect(calendarBtn()).toBeNull();
  });

  it("همه مسلط: بازگشتِ برنامهای نیست — تقویم ادعا نمیکند", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { have: { wrong: 1, ok: 1, lastDay: YESTERDAY, lastOkDay: TODAY } },
      },
    });
    openDrillIntro();
    expect(calendarBtn()).toBeNull();
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۱ مورد ثبتشده")).toBeTruthy();
  });

  it("میزبانِ بیِمالکِ برچسب (سازگاریِ پسرو): بانکِ زنده هست ولی دکمه نیست", () => {
    useStudy.setState({ drillMistakes: { verbs: { go: dueEntry() } } });
    render(
      <AppendixDrillView
        spec={{
          id: "verbs",
          title: "تمرین افعال بی‌قاعده",
          intro: "معرفی",
          startAria: "شروع جلسهٔ تمرین فعل",
          exitLabel: "جدول افعال",
          exitAria: "بازگشت به جدول افعال",
          exitResultAria: "بازگشت به جدول افعال",
          cancelAria: "انصراف از تمرین",
        }}
        buildSession={() => null}
        onExit={() => {}}
      />,
    );
    expect(screen.getByLabelText(/سررسیدهای مرور این تمرین/)).toBeTruthy();
    expect(calendarBtn()).toBeNull();
  });
});
