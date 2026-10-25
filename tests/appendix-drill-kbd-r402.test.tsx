// @vitest-environment jsdom
// ------------------------------------------------------------------
// r402 — «کیبوردِ دریل» — میانبرهای پاسخ در نمایِ تمرینِ افعال.
//
// قفلهای کلاس:
//  · ۱-۴ (کدِ فیزیکی Digit/Numpad، ارقام لاتین، ارقام فارسی) گزینه
//    انتخاب میکند — عینِ ایدئومِ کوئیز از کیتِ §10 R-6
//  · Enter/← فقط پسِ پاسخ پیش میرود؛ پیش از پاسخ هیچ
//  · پسِ پاسخ رقمها هیچ (هر سؤال یک انتخاب — قراردادِ r400)
//  · کلید در جعبهٔ متن نادیده گرفته میشود (isTypingTarget)
//  · شنونده فقط در فازِ run زنده است — در نتیجه/معرفی هیچ
//  · نشانگرِ kbdِ رقم رویِ گزینهها: aria-hidden + ارقامِ فارسی
//  · راهنمای سراسری گروهِ دریل را دارد (ثبتِ صادقِ میانبر)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixDrillView from "@/components/study/lesson/appendix-drill-view";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { readDigit, isTypingTarget } from "@/hooks/use-keyboard";
import { irregularVerbs } from "@/data/appendix";
import { buildDrillSession, DRILL_SIZE } from "@/lib/appendix-drill";

const noop = () => {};

// specِ فعل — عینِ VERB_DRILL_SPECِ appendix-view (رشتههایِ قفل)
const VERB_SPEC = {
  id: "verbs" as const,
  title: "تمرین افعال بی‌قاعده",
  intro: null,
  startAria: "شروع جلسهٔ تمرین فعل",
  exitLabel: "جدول افعال",
  exitAria: "بازگشت به جدول افعال",
  exitResultAria: "بازگشت به جدول افعال از نتیجه",
  cancelAria: "انصراف از تمرین",
};

const startDrill = () => {
  render(
    <AppendixDrillView
      spec={VERB_SPEC}
      buildSession={() => buildDrillSession(irregularVerbs, DRILL_SIZE)}
      onExit={noop}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
};

const counter = () => screen.getByText(/سؤال .* از/).textContent;

const typeKey = (init: { key: string; code?: string }) => {
  fireEvent.keyDown(window, { key: init.key, code: init.code ?? init.key });
};

describe("appendix-drill kbd r402 — کیتِ خواندنِ رقم (سیم‌کشِ دوباره، نه بازنویسی)", () => {
  it("readDigit: کدِ فیزیکی، لاتین، فارسی — و نادیده در همهٔ غیرِ رقمها", () => {
    const digit = (key: string, code?: string) =>
      readDigit({ key, code } as unknown as KeyboardEvent);
    expect(digit("3", "Digit3")).toBe(3);
    expect(digit("7", "Numpad7")).toBe(7);
    expect(digit("4", "")).toBe(4);
    expect(digit("۲", "")).toBe(2);
    expect(digit("a", "KeyA")).toBeNull();
    expect(digit("Enter", "Enter")).toBeNull();
  });

  it("isTypingTarget: جعبهٔ متن شنونده را دور میزند", () => {
    const input = document.createElement("input");
    const ev = { target: input, key: "1" } as unknown as KeyboardEvent;
    expect(isTypingTarget(ev)).toBe(true);
    const ev2 = { target: document.body, key: "1" } as unknown as KeyboardEvent;
    expect(isTypingTarget(ev2)).toBe(false);
  });
});

describe("appendix-drill kbd r402 — پاسخ با کیبورد", () => {
  beforeEach(() => cleanup());

  it("Digit1 گزینهٔ یک را انتخاب میکند و بعدی را معلول میکند", () => {
    startDrill();
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(true);
    typeKey({ key: "1", code: "Digit1" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
    // پسِ پاسخ، گزینهها معلولاند — رقمِ دوباره هیچ
    typeKey({ key: "3", code: "Digit3" });
    expect(counter()).toContain("سؤال ۱");
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("ارقامِ فارسی و Numpad هم کار میکنند (چیدمانبیز)", () => {
    startDrill();
    typeKey({ key: "۲", code: "" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
    typeKey({ key: "Enter", code: "Enter" });
    expect(counter()).toContain("سؤال ۲");
    typeKey({ key: "", code: "Numpad4" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("Enter پیش از پاسخ هیچ میکند؛ پسِ پاسخ پیش میرود؛ ← هم همان", () => {
    startDrill();
    typeKey({ key: "Enter", code: "Enter" });
    expect(counter()).toContain("سؤال ۱"); // بیپاسخ: هیچ
    typeKey({ key: "2", code: "Digit2" });
    typeKey({ key: "Enter", code: "Enter" });
    expect(counter()).toContain("سؤال ۲");
    typeKey({ key: "3", code: "Digit3" });
    typeKey({ key: "ArrowLeft", code: "ArrowLeft" });
    expect(counter()).toContain("سؤال ۳");
  });

  it("رقمِ بیرون از بازه (۵) هیچ میکند", () => {
    startDrill();
    typeKey({ key: "5", code: "Digit5" });
    typeKey({ key: "۵", code: "" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("کلید در جعبهٔ متن نادیده است — تایپِ «۲» در input پاسخ نمیدهد", () => {
    startDrill();
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "2", code: "Digit2" });
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(true);
    input.remove();
  });

  it("شنونده در فازِ نتیجه مرده است — Enter نتیجه را عوض نمیکند", () => {
    startDrill();
    for (let i = 0; i < 10; i++) {
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      fireEvent.click(opts[0]);
      fireEvent.click(
        i === 9
          ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
          : screen.getByRole("button", { name: "سؤال بعدی" }),
      );
    }
    expect(screen.getByText(/نتیجهٔ (تمرین|مرور)/)).toBeTruthy();
    const scoreEl = screen.getByLabelText(/^نمرهٔ /);
    typeKey({ key: "1", code: "Digit1" });
    typeKey({ key: "Enter", code: "Enter" });
    expect(screen.getByLabelText(/^نمرهٔ /)).toBe(scoreEl); // همان نتیجه — هیچ عوض نشد
  });

  it("هر گزینه نشانگرِ kbdِ رقمِ خودش را دارد — aria-hidden با ارقامِ فارسی", () => {
    startDrill();
    const group = screen.getByRole("group", { name: "گزینه‌های پرسش" });
    const chips = [...group.querySelectorAll("span[aria-hidden]")].filter(
      (el) => el.className.includes("font-mono"),
    );
    expect(chips.length).toBe(4);
    expect(chips.map((c) => c.textContent)).toEqual(["۱", "۲", "۳", "۴"]);
  });
});

describe("appendix-drill kbd r402 — ثبتِ صادق در راهنمای سراسری", () => {
  beforeEach(() => cleanup());

  it("راهنما گروهِ «تمرین‌های ضمیمه (فعل، واژه و نشانه)» را با هر دو ردیف دارد (r404: هر سه بانک)", () => {
    render(<ShortcutGuide />);
    // راهنما با رویدادِ زندهٔ هدر/فوتر باز میشود (همان قراردادِ open-shortcuts)
    fireEvent(window, new CustomEvent("open-shortcuts"));
    expect(screen.getByText("تمرین‌های ضمیمه (فعل، واژه و نشانه)")).toBeTruthy();
    expect(screen.getByText("انتخاب گزینه (ارقام فارسی و لاتین، هر چیدمان)")).toBeTruthy();
    expect(screen.getByText("پرسش بعدی — فقط پس از پاسخ")).toBeTruthy();
  });
});
