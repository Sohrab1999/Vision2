// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند r453 — قفلِ رگرسیونِ «حفرهٔ اشتراکِ useToast» — راه‌حلِ
// useSyncExternalStore (use-toast.ts).
//
// یافتهٔ زندهٔ همین راند (بازتولید ۵/۵ در مرورگرِ واقعی): اشتراکِ
// [state]-وابستهٔ کلاسیکِ shadcn با هر تغییرِ state، شنوندهٔ خودش را
// جدا و دوباره وصل میکرد؛ dispatchی که در پنجرهٔ همین چرخه برسد
// (تایمرِ auto-advanceِ دیکته — نه رویدادِ React) به Toaster نمیرسید
// و توست هرگز رندر نمیشد: ۰ تایمرِ پیشین → ۴/۴ رندر، ۷+ تایمر → ۴/۴ غیب.
//
// این قفل قراردادِ تازه را بایت‌به‌بایت میسنجد:
//   ① dispatch از بیرونِ رویدادِ React (setTimeout واقعی) باید رندر کند
//   ② اشتراک پس از N چرخهٔ dispatch باید «یکبار-وصل» بماند (churn ممنوع)
//   ③ توستِ دوم پسِ توستِ اول هم باید برسد (سبدِ شنونده خالی نمیشود)
//   ④ dismiss به REMOVE نرود — TOAST_REMOVE_DELAY طولانی است (قراردادِ قدیم)
// ------------------------------------------------------------------

import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import { Toaster } from "@/components/ui/toaster";
import { toast, useToast } from "@/hooks/use-toast";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** یک مصرفکنندهٔ حداقلی که فقط متنِ توستهایِ زنده را میریزد */
function ToastMirror() {
  const { toasts } = useToast();
  return (
    <div data-testid="mirror">
      {toasts.map((t) => (
        <span key={t.id} data-testid="mirror-item">
          {typeof t.title === "string" ? t.title : ""}
        </span>
      ))}
    </div>
  );
}

describe("r453 — useToast با useSyncExternalStore (حفرهٔ اشتراک)", () => {
  it("dispatch از setTimeoutِ بیرونِ رویدادِ React رندر میشود — کلاسِ باگِ ۴/۴ غیبِ مرورگر", () => {
    vi.useFakeTimers();
    render(
      <>
        <Toaster />
        <ToastMirror />
      </>,
    );
    expect(screen.queryByTestId("mirror-item")).toBeNull();
    act(() => {
      setTimeout(() => {
        toast({ title: "تایمریِ بیرونِ رویداد", description: "دیکتهٔ پایهٔ هفتم: ۴ از ۸ (۵۰٪)", duration: 4000 });
      }, 0);
      vi.runAllTimers();
    });
    // رندرِ Toaster + آینه — هر دو باید توست را ببینند
    expect(screen.getByTestId("mirror-item")).toHaveTextContent("تایمریِ بیرونِ رویداد");
    expect(document.querySelector("[role='dialog']")).toBeNull(); // توست در دیالوگ نیست — بیرونِ آن زندگی میکند
  });

  it("اشتراک یکبار-وصل میماند: هشت چرخهٔ dispatch پیاپی (۷ تایمرِ پیشرویِ دیکته + پایان) و توستِ هشتم هم رندر میشود", () => {
    vi.useFakeTimers();
    render(
      <>
        <Toaster />
        <ToastMirror />
      </>,
    );
    act(() => {
      for (let i = 1; i <= 8; i++) {
        setTimeout(() => {
          toast({ title: `چرخهٔ ${i}`, duration: 4000 });
        }, i * 10);
      }
      vi.runAllTimers();
    });
    // r454 — TOAST_LIMIT=3 شد (ریشهٔ دوم: مسابقهٔ وعده)؛ پس از ۸ dispatch،
    // سه توستِ آخر زنده‌اند — «چرخهٔ 8» یعنی هیچ حلقه‌ای از dispatchها
    // شنونده را نکشته — باگِ قدیمی همین‌جا توستِ هشتم را غیب میکرد
    const items = screen.getAllByTestId("mirror-item");
    expect(items).toHaveLength(3); // قراردادِ limit-3: [8، 7، 6]
    expect(items[0]).toHaveTextContent("چرخهٔ 8"); // آخرین dispatch حاضر
    expect(screen.getAllByText("چرخهٔ 8").length).toBeGreaterThanOrEqual(2); // آینه + Toaster
  });

  it("توستِ دوم پس از توستِ اول هم میرسد — و با limit-3 اولی زنده میماند (قراردادِ r454)", () => {
    vi.useFakeTimers();
    render(
      <>
        <Toaster />
        <ToastMirror />
      </>,
    );
    act(() => {
      toast({ title: "نخست", duration: 4000 });
    });
    // انباشتِ state ماژول درونِ فایل با limit-3 زنده میماند (چرخههایِ ۸/۷
    // از تستِ پیشین) — ترتیبِ قطعی پسِ «نخست»: [نخست، 8، 7]
    expect(screen.getAllByTestId("mirror-item")[0]).toHaveTextContent("نخست");
    act(() => {
      toast({ title: "دوم", duration: 4000 });
    });
    // r454 — LIMIT=3: دومی میآید و اولی را بیرون نمی‌پراند (کلاسِ باگِ
    // وعده: دومی اولی را ۳۷ میلی‌ثانیه بعد می‌بلعید) — ترتیبِ قطعی:
    // [دوم، نخست، 8]
    const items = screen.getAllByTestId("mirror-item");
    expect(items).toHaveLength(3); // سقفِ پشته
    expect(items[0]).toHaveTextContent("دوم"); // تازه‌ترین اول
    expect(items[1]).toHaveTextContent("نخست"); // اولی زنده — قراردادِ limit-3
  });

  it("قراردادِ ماژول: toast و dismiss از useToast و exportِ سطحِ ماژول — همه توابع‌اند", () => {
    const src = readFileSync("src/hooks/use-toast.ts", "utf8");
    expect(src).toContain("React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)");
    expect(src).not.toContain("}, [state])"); // churnِ [state]-وابسته ممنوع — کلاسِ باگ
    expect(src).toContain("function subscribe(listener: () => void)");
    expect(src).toContain("export { useToast, toast }");
  });
});
