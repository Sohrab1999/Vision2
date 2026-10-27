// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند r456 — قفلِ «بستنِ توست در لمس + حکمِ Escape» — شصتیکمین
// مصرفکنندهٔ qa-lib (شاهد: scripts/qa-r456-toast-close-touch.sh).
//
// شاهدِ زندهٔ همین راند (۳۹۰×۸۴۴) سه واقعیت را ثبت کرد:
//   ① ToastClose با opacity-0 + group-hover-تنها در لمس «نامرئی» بود
//      (opacity="0" زنده) و دکمهٔ آیکونی «بی نامِ دسترسپذیر» (aria=null) —
//      اما hit-test همان دکمه (TAP-REACHES-BUT-UNSEEN). تعمیر:
//      [@media(hover:none)]:opacity-100 + aria-label="بستن".
//   ② گوشِ سوایپِ رادیکس زنده داوری شد: ۱۲۰px میمیراند، ۳۰px نه
//      (آستانهٔ ۵۰px) — پیشفرضِ swipeDirection="right" دستنخورده.
//   ③ حکمِ Escape (بازداوریِ درسِ r455): نردبانِ ۳→۲→۱→۰ با سه فشار —
//      هر فشار «یک» توستِ کهنترین را میبرد (capture-listenerِ document،
//      بالاترین لایه)؛ quirkِ فلگِ چسبان زنده داوری شد (PRESSES-NEEDED:2):
//      مسیرِ bubble، isFocusedToastEscapeKeyDownRefِ سطح-provider را TRUE
//      رها میکند و فشارِ بعدیِ سراسری بلعیده میشود (فقط ریست).
// ------------------------------------------------------------------

import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act, fireEvent } from "@testing-library/react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";

afterEach(() => {
  cleanup();
});

// توستِ زنده = data-state="open" — توستهایِ بستهشده در jsdom مونتاده
// میمانند (animate-out بدونِ animationend) و باید با عنوان پیدا شوند.
const liByTitle = (t: string) =>
  [...document.querySelectorAll("ol li")].find((el) => (el.textContent || "").includes(t));

describe("r456 — بستنِ توست در لمس (hover:none + aria-label)", () => {
  it("دکمهٔ بستن نامِ دسترسپذیر «بستن» دارد و کلاسِ hover:none + رفتارِ هاورِ دسکتاپ پابرجاست", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "ق-پروبِ لمس", duration: 6000 });
    });
    const closes = screen.getAllByRole("button", { name: "بستن" });
    expect(closes.length).toBeGreaterThanOrEqual(1); // A11Y-NO-NAME زنده بود — now named
    const cls = closes[closes.length - 1].className;
    expect(cls).toContain("[@media(hover:none)]:opacity-100"); // تعمیرِ r456 — لمس میبیند
    expect(cls).toContain("group-hover:opacity-100"); // دسکتاپِ هاوردار دستنخورده
    expect(cls).toContain("focus:opacity-100"); // مسیرِ فوکوس پابرجا
    expect(cls).toContain("opacity-0"); // پایهٔ هاور-محور پابرجا
    expect(cls).toContain("right-1 top-1"); // هندسهٔ زنده (۴px/۴px، آیکون ۱۶)
  });

  it("گوشِ سوایپِ رادیکس دستنخورده: هیچ swipeDirection اوررایدی در منبع نیست (پیشفرضِ راست، آستانهٔ ۵۰)", () => {
    const src = readFileSync("src/components/ui/toast.tsx", "utf8");
    expect(src).not.toContain("swipeDirection"); // اورراید ممنوع — پیشفرضِ رادیکس
    expect(src).toContain("data-[swipe=end]"); // قراردادِ CSSِ سوایپِ خانواده
    // قراردادِ منبعِ همین راند + سندِ شاهد:
    expect(src).toContain("[@media(hover:none)]:opacity-100");
    expect(src).toContain('aria-label="بستن"');
    expect(src).toContain("qa-r456-toast-close-touch.sh");
    expect(src).toContain("TAP-REACHES-BUT-UNSEEN");
    expect(src).toContain("gap-3"); // تعمیرِ r455 پابرجا
    expect(src).toContain("gaps=[0]"); // رانویسِ r455 پابرجا
    const toasterSrc = readFileSync("src/components/ui/toaster.tsx", "utf8");
    expect(toasterSrc).toContain("capture-listener"); // حکمِ Escapeِ r456
    expect(toasterSrc).toContain("isFocusedToastEscapeKeyDownRef"); // quirkِ ثبتشده
  });
});

describe("r456 — حکمِ Escape (بازداوریِ «قاتلِ پشته»)", () => {
  it("نردبان: هر فشارِ Escape دقیقاً «کهنترینِ» زنده را میبرد — تازهترین تا نوبتش زنده میماند", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "LD-کهنترین", duration: 6000 });
      toast({ title: "LD-تازهترین", duration: 6000 });
    });
    expect(liByTitle("LD-تازهترین")).toHaveAttribute("data-state", "open");
    // فشارِ ۱ — capture-listener بالاترین لایه (= کهنترین، چون Set به
    // ترتیبِ commit تازهترین-اول پر شده) — فقط کهنترین میمیرد:
    fireEvent.keyDown(document, { key: "Escape" });
    expect(liByTitle("LD-کهنترین")).toBeUndefined();
    expect(liByTitle("LD-تازهترین")).toHaveAttribute("data-state", "open");
    // فشارِ ۲ — نوبتِ تازهترین:
    fireEvent.keyDown(document, { key: "Escape" });
    expect(liByTitle("LD-تازهترین")).toBeUndefined();
  });

  it("quirkِ فلگِ چسبان: bubble-path فلگِ سطح-provider را TRUE رها میکند — فشارِ بعدی بلعیده میشود؛ دومی بازیابی", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "ST-کهن", duration: 6000 });
      toast({ title: "ST-تازه", duration: 6000 });
    });
    // bubble-path (همانندِ فوکوسِ درونِ توست): capture کهنترین را میبندد
    // و bubble هدفِ خودش را — هر دو میمیرند؛ فلگ TRUE میماند:
    fireEvent.keyDown(liByTitle("ST-تازه")!, { key: "Escape" });
    expect(liByTitle("ST-کهن")).toBeUndefined();
    expect(liByTitle("ST-تازه")).toBeUndefined();
    // توستِ تازه: فشارِ نخست بلعیده میشود (فقط ریستِ فلگ — هیچِ مرگی):
    act(() => {
      toast({ title: "ST-سوم", duration: 6000 });
    });
    expect(liByTitle("ST-سوم")).toHaveAttribute("data-state", "open");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(liByTitle("ST-سوم")).toHaveAttribute("data-state", "open"); // SWALLOW — زندهٔ PRESSES-NEEDED:2
    // فشارِ دوم — بازیابی:
    fireEvent.keyDown(document, { key: "Escape" });
    expect(liByTitle("ST-سوم")).toBeUndefined();
  });
});
