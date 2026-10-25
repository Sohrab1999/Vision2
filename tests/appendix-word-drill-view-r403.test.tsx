// @vitest-environment jsdom
// ------------------------------------------------------------------
// r403 — «تمرین خانوادهٔ واژه‌ها» در زیرتبِ pos ضمیمه — نمایِ مشترک.
//
// قفلهای نما:
//  · دکمهٔ «تمرین» کنارِ سربرگِ خانوادهها؛ جدول پابرجاست (ایدئومِ r239)
//  · لنگرِ عمیقِ posTable هرگز دریل را بالا نمیآورد — drill فقط با کلیک
//    (آینهٔ قفلِ verbBaseِ r234)
//  · معرفی: عنوانِ «تمرین خانوادهٔ واژه‌ها» + شمارشِ صادقِ ۲۴۶ خانواده
//  · جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهایِ kbd؛ پرسشِ اول گونهٔ fa است
//    (گزینههایِ فارسیِ بانک)
//  · کیبوردِ r402 در بانکِ واژه هم زنده است (نمایِ مشترک — یک شنونده)
//  · «جدول اجزای کلام» از معرفی/نتیجه بیرون میبرد؛ انصرافِ واژه از run
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { WORD_FAMILY_TABLES, WORD_FAMILY_TOTAL, wordFamilyTableId } from "@/data/word-families";

const openPosTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
};

describe("appendix-word-drill-view r403 — ورود از زیرتبِ pos", () => {
  beforeEach(() => cleanup());

  it("دکمهٔ «تمرین» کنارِ سربرگِ خانوادهها؛ جدول هنوز هست", () => {
    render(<AppendixView />);
    openPosTab();
    expect(screen.getByRole("button", { name: "شروع تمرین خانوادهٔ واژه‌ها" })).toBeTruthy();
    expect(screen.getByText(/خانوادهٔ واژه‌ها از خودِ جزوه‌ها/)).toBeTruthy();
  });

  it("کلیک: جدولها میروند، معرفیِ واژه میآید (۲۴۶ صادق)؛ بازگشت به جدولها", () => {
    render(<AppendixView />);
    openPosTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین خانوادهٔ واژه‌ها" }));
    expect(screen.queryByText(/خانوادهٔ واژه‌ها از خودِ جزوه‌ها/)).toBeNull();
    expect(screen.getByText("تمرین خانوادهٔ واژه‌ها")).toBeTruthy();
    expect(screen.getByText(new RegExp(`از ${String(WORD_FAMILY_TOTAL).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} خانواده`))).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول اجزای کلام" }));
    expect(screen.getByText(/خانوادهٔ واژه‌ها از خودِ جزوه‌ها/)).toBeTruthy();
  });

  it("لنگرِ عمیقِ posTable دریل را بالا نمیآورد — drill فقط با کلیک (آینهٔ r234)", () => {
    const t = WORD_FAMILY_TABLES[0];
    render(<AppendixView posTableId={wordFamilyTableId(t)} />);
    expect(screen.queryByRole("button", { name: "شروع جلسهٔ تمرین واژه" })).toBeNull();
    expect(screen.getByText(/خانوادهٔ واژه‌ها از خودِ جزوه‌ها/)).toBeTruthy();
  });
});

describe("appendix-word-drill-view r403 — جریانِ یک جلسهٔ واژه", () => {
  beforeEach(() => cleanup());

  const startWordDrill = () => {
    render(<AppendixView />);
    openPosTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین خانوادهٔ واژه‌ها" }));
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین واژه" }));
  };

  it("جلسه: «سؤال ۱ از ۱۰» + ۴ گزینه + چیپهایِ kbd؛ پرسشِ اول fa با گزینههایِ فارسی", () => {
    startWordDrill();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    expect(opts).toHaveLength(4);
    const legal = new Set(
      WORD_FAMILY_TABLES.flatMap((t) => t.families).map((f) => f.fa).filter((v) => v !== ""),
    );
    for (const o of opts) {
      const value = (o.getAttribute("aria-label") || "")
        .replace(/^گزینه [۱-۴]: /, "")
        .replace(/ — پاسخ درست$/, "");
      expect(legal.has(value)).toBe(true); // پرسشِ اول = گونهٔ fa (چرخشِ ۵گونه)
    }
    const group = screen.getByRole("group", { name: "گزینه‌های پرسش" });
    const chips = [...group.querySelectorAll("span[aria-hidden]")].filter((el) =>
      el.className.includes("font-mono"),
    );
    expect(chips.map((c) => c.textContent)).toEqual(["۱", "۲", "۳", "۴"]);
  });

  it("پرامپتِ پرسشِ اول از خودِ بانک است: معنیِ یک لنگرِ واقعی — نه متنِ ساختگی", () => {
    startWordDrill();
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3.textContent).toContain("معنیِ");
    const anchors = WORD_FAMILY_TABLES.flatMap((t) => t.families).flatMap((f) => [f.verb, f.noun, f.adjective, f.adverb]);
    expect(anchors.some((a) => a !== "" && h3.textContent!.includes(a))).toBe(true);
  });

  it("کیبوردِ r402 در بانکِ واژه هم زنده است — Digit1 پاسخ میدهد، Enter پیش میرود", () => {
    startWordDrill();
    fireEvent.keyDown(window, { key: "1", code: "Digit1" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });
    expect(screen.getByText(/سؤال ۲ از/)).toBeTruthy();
  });

  // r412 — دو mount + بیست کلیک رویِ سنگینترین نمایِ اپ؛ همان آیینِ
  // تایم‌اوتِ سنگینها (r233/r234/r235) — رانشِ بارِ ماشین نباید قرمزِ دروغ بدهد
  it("جلسهٔ کامل: نتیجهٔ صادق + بازخوانی؛ انصرافِ واژه از میانهٔ جلسه بیرون میبرد", () => {
    startWordDrill();
    fireEvent.click(screen.getByRole("button", { name: "انصراف از تمرین واژه" }));
    expect(screen.getByText(/خانوادهٔ واژه‌ها از خودِ جزوه‌ها/)).toBeTruthy();

    cleanup(); // دو mount پشت‌هم در یک تست — مالِ هر کدام صحنهٔ خودش
    startWordDrill();
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
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول اجزای کلام از نتیجه" }));
    expect(screen.getByText(/خانوادهٔ واژه‌ها از خودِ جزوه‌ها/)).toBeTruthy();
  }, 20000);
});
