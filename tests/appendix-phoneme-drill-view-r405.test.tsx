// @vitest-environment jsdom
// ------------------------------------------------------------------
// r405 — «تمرین جدول تلفظ» در زیرتبِ phonetics ضمیمه — بانکِ چهارم
// رویِ نمایِ مشترکِ r403.
//
// قفلهای نما:
//  · دکمهٔ «تمرین» بالای کارت‌های واک (ایدئومِ verbsِ r239)؛ جدول پابرجاست
//  · لنگرِ عمیقِ phonemeId هرگز دریل را بالا نمیآورد — drill فقط با کلیک
//    (آینهٔ قفلهایِ verbBaseِ r234 / posTableِ r403 / abbrevSymِ r404)
//  · معرفی: عنوانِ «تمرین جدول تلفظ» + شمارشِ صادقِ ۴۴ واک
//  · جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهایِ kbd؛ پرسشِ اول گونهٔ fa است
//    (گزینههایِ فارسیِ بانک — رندرِ RTL رویِ همان قراردادِ r401)
//  · کیبوردِ r402 در بانکِ چهارم هم زنده است (نمایِ مشترک — یک شنونده)
//  · «جدول تلفظ» از معرفی/نتیجه بیرون میبرد؛ انصرافِ تلفظ از run
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { vowelPhonemes, consonantPhonemes } from "@/data/appendix";

const openPhoneticsTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "جدول تلفظ (IPA)" }));
};

describe("appendix-phoneme-drill-view r405 — ورود از زیرتبِ phonetics", () => {
  beforeEach(() => cleanup());

  it("دکمهٔ «تمرین» بالای کارت‌های واک؛ جدولِ تلفظ هنوز هست", () => {
    render(<AppendixView />);
    openPhoneticsTab();
    expect(screen.getByRole("button", { name: "شروع تمرین جدول تلفظ" })).toBeTruthy();
    expect(screen.getByLabelText("جست‌وجو در جدول تلفظ")).toBeTruthy(); // جدول پابرجا
  });

  it("کلیک: کارتها میروند، معرفیِ تلفظ میآید (۴۴ صادق)؛ بازگشت به جدول", () => {
    render(<AppendixView />);
    openPhoneticsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین جدول تلفظ" }));
    expect(screen.queryByLabelText("جست‌وجو در جدول تلفظ")).toBeNull(); // جدول رفته
    expect(screen.getByText("تمرین جدول تلفظ")).toBeTruthy();
    expect(screen.getByText(/از ۴۴ واک/)).toBeTruthy();
    expect(screen.getByText(/توصیف، واژه‌های نمونه و شنیدنِ واک/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول تلفظ" }));
    expect(screen.getByRole("button", { name: "شروع تمرین جدول تلفظ" })).toBeTruthy();
  });

  it("لنگرِ عمیقِ phonemeId دریل را بالا نمیآورد — drill فقط با کلیک (آینهٔ r234/r403/r404)", () => {
    render(<AppendixView phonemeId="ʃ" />);
    expect(screen.queryByRole("button", { name: "شروع جلسهٔ تمرین تلفظ" })).toBeNull();
    expect(screen.getByLabelText("جست‌وجو در جدول تلفظ")).toBeTruthy();
  });
});

describe("appendix-phoneme-drill-view r405 — جریانِ یک جلسهٔ تلفظ", () => {
  beforeEach(() => cleanup());

  const startPhonemeDrill = () => {
    render(<AppendixView />);
    openPhoneticsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین جدول تلفظ" }));
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین تلفظ" }));
  };

  it("جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهایِ kbd؛ پرسشِ اول fa با گزینههایِ فارسیِ بانک", () => {
    startPhonemeDrill();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    expect(opts).toHaveLength(4);
    const legal = new Set([...vowelPhonemes, ...consonantPhonemes].map((p) => p.fa));
    for (const o of opts) {
      const value = (o.getAttribute("aria-label") || "")
        .replace(/^گزینه [۱-۴]: /, "")
        .replace(/ — پاسخ درست$/, "");
      expect(legal.has(value)).toBe(true); // پرسشِ اول = گونهٔ fa (چرخشِ سهگونه)
    }
    const group = screen.getByRole("group", { name: "گزینه‌های پرسش" });
    const chips = [...group.querySelectorAll("span[aria-hidden]")].filter((el) =>
      el.className.includes("font-mono"),
    );
    expect(chips.map((c) => c.textContent)).toEqual(["۱", "۲", "۳", "۴"]);
  });

  it("پرامپتِ پرسشِ اول لنگرِ واقعیِ بانک دارد: توصیفِ واکِ «symbol» — نه متنِ ساختگی", () => {
    startPhonemeDrill();
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3.textContent).toContain("توصیفِ واکِ");
    expect([...vowelPhonemes, ...consonantPhonemes].some((p) => h3.textContent!.includes(`«${p.symbol}»`))).toBe(true);
  });

  it("کیبوردِ r402 در بانکِ تلفظ هم زنده است — Digit3 پاسخ میدهد، ← پیش میرود", () => {
    startPhonemeDrill();
    fireEvent.keyDown(window, { key: "3", code: "Digit3" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.keyDown(window, { key: "ArrowLeft", code: "ArrowLeft" });
    expect(screen.getByText(/سؤال ۲ از/)).toBeTruthy();
  });

  it("جلسهٔ کامل: نتیجهٔ صادق + بازخوانی؛ انصرافِ تلفظ از میانهٔ جلسه بیرون میبرد", () => {
    startPhonemeDrill();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین تلفظ" }));
    expect(screen.getByLabelText("جست‌وجو در جدول تلفظ")).toBeTruthy();

    cleanup(); // دو mount پشت‌هم در یک تست — مالِ هر کدام صحنهٔ خودش
    startPhonemeDrill();
    for (let i = 0; i < 10; i++) {
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      fireEvent.click(opts[i % 4]);
      fireEvent.click(
        i === 9
          ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
          : screen.getByRole("button", { name: "سؤال بعدی" }),
      );
    }
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy();
    expect(screen.getByLabelText("بازخوانی سؤال‌های تمرین").children.length).toBe(10);
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول تلفظ از نتیجه" }));
    expect(screen.getByRole("button", { name: "شروع تمرین جدول تلفظ" })).toBeTruthy();
  });
});
