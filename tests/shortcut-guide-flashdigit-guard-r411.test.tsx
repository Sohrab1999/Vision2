// @vitest-environment jsdom
// ------------------------------------------------------------------
// r411 — گاردِ ارقامِ تبِ درس حینِ فلش‌کارت — بستنِ کلاسِ حفرهٔ r407
// برایِ آخرین سطحِ پاسخخوار (همان کلاسی که r409 برایِ دریلها بست).
//
// قفلهای کلاس (کنترل-جفت — درسِ r409):
//  · بیِ سطحِ شنیدار: رقمِ ۲ تبِ مکالمه را باز میکند (کنترلِ سالم)
//  · با سطحِ شنیدار (فلش‌کارت باز): رقمِ ۲ هیچ — مرور نمیبُرد
//  · جراحیِ گارد پابرجاست (اصلاحیه فقط ارقام است): با سطحِ شنیدار
//    KeyD هنوز ناوبری میکند و KeyF هنوز مرورِ هوشمند را میگشاید —
//    فقط ارقامِ تب ساکتند، و فقط در نمایِ درس
//  · Numpad هم پوشیده است (Numpad2)
//  · «؟» حینِ فلش‌کارت راهنما را باز میکند (بالایِ گارد)
//  · ارقامِ بیرونِ نمایِ درس هرگز ناوبری نبودهاند (رقم در خانه هیچ)
//  · ثبتِ صادق در راهنما: ردیفِ ارقامِ «در درس‌ها» سکوتِ حینِ فلش‌کارت
//    را مینویسد
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { useStudy } from "@/lib/study-store";
import { setListenSurface } from "@/lib/listen-surface";

const press = (key: string, code: string) => fireEvent.keyDown(window, { key, code });

const lessonView = { view: { type: "lesson", id: 1 }, lessonTab: "vocab" } as const;

describe("r411 — گاردِ ارقامِ تبِ درس حینِ فلش‌کارت", () => {
  beforeEach(() => {
    cleanup();
    setListenSurface(false);
    useStudy.setState({ view: { type: "home" }, lessonTab: "vocab" });
  });
  afterEach(() => {
    cleanup();
    setListenSurface(false);
    useStudy.setState({ view: { type: "home" }, lessonTab: "vocab" });
  });

  it("کنترل: بیِ سطحِ شنیدار، رقمِ ۲ در نمایِ درس تبِ مکالمه را باز میکند", () => {
    useStudy.setState({ ...lessonView });
    render(<ShortcutGuide />);
    press("2", "Digit2");
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
    expect(useStudy.getState().lessonTab).toBe("conversation");
  });

  it("با سطحِ شنیدار (فلش‌کارت باز)، رقمِ ۲ هیچ — مرور نمیبُرد", () => {
    useStudy.setState({ ...lessonView });
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("2", "Digit2");
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
    expect(useStudy.getState().lessonTab).toBe("vocab"); // دست‌نخورده
  });

  it("Numpad2 هم زیرِ همان گارد است", () => {
    useStudy.setState({ ...lessonView });
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("2", "Numpad2");
    expect(useStudy.getState().lessonTab).toBe("vocab");
  });

  it("جراحیِ پابرجا: با سطحِ شنیدار، KeyD هنوز ناوبری میکند — فقط ارقام ساکتند", () => {
    useStudy.setState({ ...lessonView });
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("d", "KeyD");
    expect(useStudy.getState().view).toEqual({ type: "dictionary" });
  });

  it("جراحیِ پابرجا: با سطحِ شنیدار، KeyF هنوز مرورِ هوشمند را میگشاید — کنشِ صریح است نه یانکِ پنهان", () => {
    useStudy.setState({ ...lessonView });
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("f", "KeyF");
    // openLesson(id, "smart") — نمایِ درس با نیتِ مرورِ هوشمند
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
    expect(useStudy.getState().flashIntent).toBe("smart");
  });

  it("«؟» حینِ فلش‌کارت راهنما را باز میکند — بالایِ گارد", () => {
    useStudy.setState({ ...lessonView });
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("?", "?");
    expect(screen.getByText("راهنمای میان‌برهای کیبورد")).toBeTruthy();
  });

  it("رقم در خانه هرگز ناوبری نبوده — سطحِ شنیدارِ خانه (واژهٔ روز) چیزی را ساکت نمیکند", () => {
    useStudy.setState({ view: { type: "home" } });
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("2", "Digit2");
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("ثبتِ صادق: ردیفِ ارقامِ «در درس‌ها» سکوتِ حینِ فلش‌کارت را مینویسد", () => {
    render(<ShortcutGuide />);
    fireEvent(window, new CustomEvent("open-shortcuts"));
    expect(
      screen.getByText(
        "پرش مستقیم به تب‌های درس (واژگان، مکالمه، ریدینگ، گرامر، نگارش، دیکته، تست‌ها) — تا فلش‌کارت باز است خاموش",
      ),
    ).toBeTruthy();
  });

  it("ثبتِ صادق: گروهِ «روخوانی با T» حالا چهار سطح را ثبت میکند", () => {
    render(<ShortcutGuide />);
    fireEvent(window, new CustomEvent("open-shortcuts"));
    expect(
      screen.getByText("جدول تلفظ (IPA): دوباره‌شنیدنِ آخرین واکِ شنیده — بی‌شنیده، T همان شب/روز میماند"),
    ).toBeTruthy();
    expect(
      screen.getByText("واژهٔ روز (خانه): دوباره‌شنیدنِ واژهٔ روز — بی‌شنیده، T همان شب/روز میماند"),
    ).toBeTruthy();
  });
});
