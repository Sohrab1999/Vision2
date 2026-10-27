// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند r455 — قفلِ «قراردادِ بصریِ پشتهٔ توستها» — gap-3 در viewport.
//
// شاهدِ زندهٔ همین راند (scripts/qa-r455-toast-stack-mobile.sh —
// شصتمین مصرفکنندهٔ qa-lib، ۳۹۰×۸۴۴) فاصلهٔ صفرِ توستهای چسبیده را
// ثبت کرد: با TOAST_LIMIT=3 (r454) سه توستِ راستین (Anki + پشتیبانِ
// پروفایل + راستکلیکِ رزومهٔ هدر) پشته شدند و gaps=[0] بود — درزِ
// border به border، rowGap="normal"، شاتِ عریان. تعمیر: gap-3 (12px)
// در ToastViewport — پس از تعمیر هر پنج صحنه (سهتایی/سرریز/شب/زوجِ
// رقابتیِ روز و شب) gaps=[12] و rowGap="12px".
//   ① قراردادِ viewport: gap-3 + flex-col-reverse + max-h-screen + p-4
//   ② ترتیبِ DOM: تازهترین اول (سازگار با رانِ زنده: وعده در بالا)
//   ③ سقفِ ۳ در سطحِ رندر (مکملِ قفلِ سطحِ state در r454)
//   ④ قراردادِ منبع: gap-3 در toast.tsx + TOAST_LIMIT=3 در use-toast.ts
// ------------------------------------------------------------------

import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";

afterEach(() => {
  cleanup();
});

describe("r455 — قراردادِ بصریِ پشتهٔ توستها (gap-3)", () => {
  it("viewport دارای gap-3 + flex-col-reverse + max-h-screen + p-4 است — خانوادهٔ موبایلِ ۳۹۰", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "یکی", duration: 4000 });
      toast({ title: "دو", duration: 4000 });
    });
    const ol = document.querySelector("ol");
    expect(ol).not.toBeNull();
    const cls = ol!.className;
    expect(cls).toContain("gap-3"); // تعمیرِ r455 — فاصلهٔ ۱۲px بینِ توستها
    expect(cls).toContain("flex-col-reverse"); // چیدمانِ پشتهایِ موبایل
    expect(cls).toContain("max-h-screen"); // سقفِ ارتفاعِ viewport
    expect(cls).toContain("p-4"); // لایهٔ دورِ پشته
    expect(cls).toContain("fixed top-0"); // لنگرِ موبایل (زیرِ sm)
    expect(cls).toContain("z-[100]"); // بالاتر از دیالوگها
  });

  it("ترتیبِ DOM = تازهترین اول — سازگار با رانِ زنده (وعده در بالای نتیجه)", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "اولِ قدیمی", duration: 6000 });
      toast({ title: "دوم", duration: 3500 });
      toast({ title: "سومِ تازه", duration: 3000 });
    });
    const lis = [...document.querySelectorAll("ol li")];
    expect(lis).toHaveLength(3);
    const texts = lis.map((el) => el.textContent || "");
    expect(texts[0]).toContain("سومِ تازه"); // تازهترین سرِ DOM
    expect(texts[1]).toContain("دوم");
    expect(texts[2]).toContain("اولِ قدیمی"); // کهنترین تهِ DOM
  });

  it("سقفِ ۳ در سطحِ رندر: چهارمین dispatch، کهنترین را از DOM بیرون میبرد", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "یکی", duration: 6000 });
      toast({ title: "دو", duration: 6000 });
      toast({ title: "سه", duration: 6000 });
    });
    expect(document.querySelectorAll("ol li")).toHaveLength(3);
    act(() => {
      toast({ title: "چهارمِ مهاجم", duration: 6000 });
    });
    const lis = [...document.querySelectorAll("ol li")];
    expect(lis).toHaveLength(3); // هرگز چهار نمیشود
    const texts = lis.map((el) => el.textContent || "");
    expect(texts.join("|")).toContain("چهارمِ مهاجم");
    expect(texts.join("|")).not.toContain("یکی"); // کهنترین حذف شد
  });

  it("قراردادِ منبع: gap-3 در ToastViewport + یادداشتِ r455 + TOAST_LIMIT=3 پابرجا", () => {
    const toastSrc = readFileSync("src/components/ui/toast.tsx", "utf8");
    expect(toastSrc).toContain("gap-3"); // تعمیرِ r455 حاضر
    expect(toastSrc).toContain("qa-r455-toast-stack-mobile.sh"); // سندِ شاهد در خودِ منبع
    expect(toastSrc).toContain("gaps=[0]"); // رانویسِ عیبِ ثبتشده
    const hookSrc = readFileSync("src/hooks/use-toast.ts", "utf8");
    expect(hookSrc).toContain("const TOAST_LIMIT = 3"); // قراردادِ r454 پابرجا
    expect(hookSrc).toContain("useSyncExternalStore"); // حفرهٔ r453 بسته مانده
  });
});
