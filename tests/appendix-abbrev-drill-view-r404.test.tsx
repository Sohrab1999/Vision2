// @vitest-environment jsdom
// ------------------------------------------------------------------
// r404 — «تمرین نشانه‌های اختصاری» در زیرتبِ abbrev ضمیمه — بانکِ سوم
// رویِ نمایِ مشترکِ r403.
//
// قفلهای نما:
//  · دکمهٔ «تمرین» بالای کارت‌های نشانه (ایدئومِ verbsِ r239)؛ جدول پابرجاست
//  · لنگرِ عمیقِ abbrevSym هرگز دریل را بالا نمیآورد — drill فقط با کلیک
//    (آینهٔ قفلهایِ verbBaseِ r234 / posTableِ r403)
//  · معرفی: عنوانِ «تمرین نشانه‌های اختصاری» + شمارشِ صادقِ ۱۳ نشانه
//  · جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهایِ kbd؛ پرسشِ اول گونهٔ fa است
//    (گزینههایِ فارسیِ بانک — رندرِ RTL رویِ همان قراردادِ r401)
//  · کیبوردِ r402 در بانکِ سوم هم زنده است (نمایِ مشترک — یک شنونده)
//  · «کارت‌های نشانه» از معرفی/نتیجه بیرون میبرد؛ انصرافِ نشانه از run
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { abbreviations } from "@/data/appendix";

const openAbbrevTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "نشانه‌های اختصاری" }));
};

describe("appendix-abbrev-drill-view r404 — ورود از زیرتبِ abbrev", () => {
  beforeEach(() => cleanup());

  it("دکمهٔ «تمرین» بالای کارت‌ها؛ جدولِ نشانهها هنوز هست", () => {
    render(<AppendixView />);
    openAbbrevTab();
    expect(screen.getByRole("button", { name: "شروع تمرین نشانه‌های اختصاری" })).toBeTruthy();
    expect(screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری")).toBeTruthy(); // جدول پابرجا
  });

  it("کلیک: کارتها میروند، معرفیِ نشانه میآید (۱۳ صادق)؛ بازگشت به کارتها", () => {
    render(<AppendixView />);
    openAbbrevTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین نشانه‌های اختصاری" }));
    expect(screen.queryByText("جست‌وجو در نشانه‌های اختصاری")).toBeNull(); // جدول رفته
    expect(screen.getByText("تمرین نشانه‌های اختصاری")).toBeTruthy();
    expect(screen.getByText(new RegExp(`از ۱۳ نشانه`))).toBeTruthy();
    expect(screen.getByText(/معنی، شکلِ کامل و نشانهٔ معکوس/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به کارت‌های نشانه" }));
    expect(screen.getByRole("button", { name: "شروع تمرین نشانه‌های اختصاری" })).toBeTruthy();
  });

  it("لنگرِ عمیقِ abbrevSym دریل را بالا نمیآورد — drill فقط با کلیک (آینهٔ r234/r403)", () => {
    render(<AppendixView abbrevSym="adj" />);
    expect(screen.queryByRole("button", { name: "شروع جلسهٔ تمرین نشانه" })).toBeNull();
    expect(screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری")).toBeTruthy();
  });
});

describe("appendix-abbrev-drill-view r404 — جریانِ یک جلسهٔ نشانه", () => {
  beforeEach(() => cleanup());

  const startAbbrevDrill = () => {
    render(<AppendixView />);
    openAbbrevTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین نشانه‌های اختصاری" }));
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین نشانه" }));
  };

  it("جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهایِ kbd؛ پرسشِ اول fa با گزینههایِ فارسیِ بانک", () => {
    startAbbrevDrill();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    expect(opts).toHaveLength(4);
    const legal = new Set(abbreviations.map((a) => a.fa));
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

  it("پرامپتِ پرسشِ اول لنگرِ واقعیِ بانک دارد: معنیِ نشانهٔ «sym» — نه متنِ ساختگی", () => {
    startAbbrevDrill();
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3.textContent).toContain("معنیِ نشانهٔ");
    expect(abbreviations.some((a) => h3.textContent!.includes(`«${a.sym}»`))).toBe(true);
  });

  it("کیبوردِ r402 در بانکِ نشانه هم زنده است — Digit2 پاسخ میدهد، Enter پیش میرود", () => {
    startAbbrevDrill();
    fireEvent.keyDown(window, { key: "2", code: "Digit2" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });
    expect(screen.getByText(/سؤال ۲ از/)).toBeTruthy();
  });

  it("جلسهٔ کامل: نتیجهٔ صادق + بازخوانی؛ انصرافِ نشانه از میانهٔ جلسه بیرون میبرد", () => {
    startAbbrevDrill();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین نشانه" }));
    expect(screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری")).toBeTruthy();

    cleanup(); // دو mount پشت‌هم در یک تست — مالِ هر کدام صحنهٔ خودش
    startAbbrevDrill();
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
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به کارت‌های نشانه از نتیجه" }));
    expect(screen.getByRole("button", { name: "شروع تمرین نشانه‌های اختصاری" })).toBeTruthy();
  });
});
