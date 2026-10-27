// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند r454 — قفلِ «ریشهٔ دومِ توستِ آلوده» — TOAST_LIMIT=1 → ۳.
//
// شکارِ زندهٔ همین راند (scripts/qa-r454-toast-root2.sh — LOG با
// MutationObserver روی olِ viewport): توستِ نتیجهٔ دیکته رندر میشد اما
// ۳۷ms بعد با توستِ «✓ وعده برقرار شد» (r279 — celebrateFirstVisible
// پسِ پاسخِ موفقِ اولین sendStatsِ نامدار) جایگزین میشد:
//   +LI@505238|💪 با تمرین بهتر می‌شود… ۴ از ۸ (۴۴٪)
//   -LI@505275                      ← ۳۷ میلی‌ثانیه عمر!
//   +LI@505275|✓ وعده برقرار شد …   ← جانشینِ متا
// ADD_TOAST با LIMIT=1 چیدمان را به [تازهترین] برش میزند — کلاسِ باگ
// عمومی است: هر دو توستِ نزدیک-همزمان، دومی اولی را ساکت میبلعد.
// قراردادِ تازه: تا ۳ توستِ زنده پشته میشوند؛ توستِ نتیجهٔ یادگیرنده
// هرگز قربانیِ توستِ متا نمیشود.
//   ① مسابقهٔ وعده: نتیجه + متا در پنجرهٔ ۳۷ms — هر دو زنده
//   ② سرریز: توستِ چهارم کهن‌ترین را بیرون میپراند (slice قراردادی)
//   ③ ترتیبِ پشته: تازهترین اول (سازگار با فراخوانهایِ فعلی)
//   ④ قراردادِ منبع: TOAST_LIMIT = 3 + یادداشتِ ریشهٔ دوم
// ------------------------------------------------------------------

import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import { Toaster } from "@/components/ui/toaster";
import { toast, useToast } from "@/hooks/use-toast";

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

function mount() {
  render(
    <>
      <Toaster />
      <ToastMirror />
    </>,
  );
}

const RESULT_TITLE = "💪 با تمرین بهتر می‌شود"; // توستِ نتیجهٔ دیکته (۴۴٪)
const META_TITLE = "✓ وعده برقرار شد"; // توستِ متا — قاتلِ ۳۷ms

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("r454 — قراردادِ TOAST_LIMIT=3 (ریشهٔ دومِ توستِ آلوده)", () => {
  it("مسابقهٔ وعده: توستِ نتیجه + توستِ متا در پنجرهٔ ۳۷ms — هر دو زنده میمانند (بازتولیدِ ۶/۶ِ مرورگر)", () => {
    vi.useFakeTimers();
    mount();
    act(() => {
      toast({ title: RESULT_TITLE, description: "دیکتهٔ پایهٔ هفتم: ۴ از ۸ (۴۴٪)", duration: 4000 });
      // ر454: پاسخِ sendStats ~۳۷ms بعد میرسد — قبل از هر رندرِ تعاملِ کاربر
      setTimeout(() => {
        toast({ title: META_TITLE, description: "اولین فعالیتت ثبت شد" });
      }, 37);
    });
    act(() => {
      vi.advanceTimersByTime(40);
    });
    const items = screen.getAllByTestId("mirror-item");
    expect(items).toHaveLength(2); // OLD: 1 (وعده نتیجه را می‌بلعید)
    expect(items[0]).toHaveTextContent(META_TITLE); // تازهترین اول
    expect(items[1]).toHaveTextContent(RESULT_TITLE); // نتیجه زنده — قربانی نمیشود
    // هر دو در Toaster هم رندر شدهاند (دو توست در olِ رادیکس)
    expect(screen.getAllByText(RESULT_TITLE).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(META_TITLE).length).toBeGreaterThanOrEqual(2);
  });

  it("سرریزِ پشته: توستِ چهارم کهن‌ترین را بیرون میپراند — سقفِ ۳ حفظ میشود", () => {
    mount();
    act(() => {
      toast({ title: "یکی", duration: 4000 });
      toast({ title: "دو", duration: 4000 });
      toast({ title: "سه", duration: 4000 });
      toast({ title: "چهار", duration: 4000 });
    });
    const items = screen.getAllByTestId("mirror-item");
    expect(items).toHaveLength(3); // سقف
    expect(items[0]).toHaveTextContent("چهار");
    expect(items[1]).toHaveTextContent("سه");
    expect(items[2]).toHaveTextContent("دو");
    expect(screen.queryByText("یکی")).toBeNull(); // کهن‌ترین حذف شد
  });

  it("ترتیبِ پشته: dispatchی که بعداً میرسد در سرِ فهرست است — قراردادِ فراخوانهایِ فعلی", () => {
    mount();
    act(() => {
      toast({ title: "اول", duration: 4000 });
    });
    act(() => {
      toast({ title: "دوم", duration: 4000 });
    });
    act(() => {
      toast({ title: "سوم", duration: 4000 });
    });
    const items = screen.getAllByTestId("mirror-item");
    expect(items.map((el) => el.textContent)).toEqual(["سوم", "دوم", "اول"]);
  });

  it("قراردادِ منبع: TOAST_LIMIT=3 + یادداشتِ ریشهٔ دوم + حفرهٔ r453 هنوز بسته", () => {
    const src = readFileSync("src/hooks/use-toast.ts", "utf8");
    expect(src).toContain("const TOAST_LIMIT = 3");
    expect(src).not.toContain("const TOAST_LIMIT = 1"); // قاتلِ ۳۷ms ممنوع
    expect(src).toContain("ریشهٔ دومِ توستِ آلوده"); // یادداشتِ سند
    expect(src).toContain("celebrateFirstVisible"); // نامِ قاتل در سند
    expect(src).toContain("React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)"); // حفرهٔ r453 بسته مانده
    expect(src).not.toContain("}, [state])"); // churn ممنوع — همیشه
  });
});
