// @vitest-environment jsdom
// ------------------------------------------------------------------
// r409 — گاردِ راهنمای سراسری حینِ دریل — تعمیمِ quizContext.
//
// قفلهای کلاس (همه کنترل-جفت: با پرچم و بی پرچم):
//  · حینِ دریل، KeyD ناوبری نمیکند — جلسهٔ در حالِ پاسخ نمیمیرد
//  · بیِ دریل، همان کلید ناوبری میکند (کنترلِ سالمِ گارد)
//  · حینِ دریلِ تبِ واژگانِ درس، رقمِ ۲ تب عوض نمیکند (حفرهٔ ارقامِ
//    درس — درسِ ۹ مستقیمِ دریلِ r407 را میبُرید)
//  · «؟» حینِ دریل هم راهنما را باز میکند (بالایِ گارد — بیخطر)
//  · گروهِ تمرینها ردیفِ T را دارد (ثبتِ صادقِ میانبرِ روخوانی)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { useStudy } from "@/lib/study-store";
import { setDrillActive, drillActiveSnapshot } from "@/lib/drill-active";

const press = (key: string, code: string) =>
  fireEvent.keyDown(window, { key, code });

describe("r409 — گاردِ راهنما حینِ دریل", () => {
  beforeEach(() => {
    cleanup();
    setDrillActive(false);
    useStudy.setState({ view: { type: "home" }, lessonTab: "vocab" });
  });
  afterEach(() => {
    cleanup();
    setDrillActive(false);
    useStudy.setState({ view: { type: "home" }, lessonTab: "vocab" });
  });

  it("کنترل: بیِ دریل، KeyD به دیکشنری میرود — گاردِ پایه سالم", () => {
    render(<ShortcutGuide />);
    expect(useStudy.getState().view).toEqual({ type: "home" });
    press("d", "KeyD");
    expect(useStudy.getState().view).toEqual({ type: "dictionary" });
  });

  it("حینِ دریل، KeyD هیچ — جلسهٔ در حالِ پاسخ نمیمیرد", () => {
    setDrillActive(true);
    render(<ShortcutGuide />);
    expect(drillActiveSnapshot()).toBe(true);
    press("d", "KeyD");
    expect(useStudy.getState().view).toEqual({ type: "home" }); // ساکت گذشت
    press("h", "KeyH");
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("حینِ دریلِ تبِ واژگانِ درس، رقمِ ۲ تب را عوض نمیکند — حفرهٔ ارقامِ درس بسته شد", () => {
    useStudy.getState().openLessonTab(1, "vocab");
    setDrillActive(true);
    render(<ShortcutGuide />);
    press("2", "Digit2");
    expect(useStudy.getState().lessonTab).toBe("vocab"); // جلسهٔ دریل سالم
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
    // کنترل: بیِ پرچم همان رقم میبُرد به مکالمه — یعنی گارد واقعاً دلیلِ سکوت است
    // (act: راهنما به تغییرِ استورِ خارجی رندرِ تازه بگیرد تا closureِ گارد تازه شود)
    act(() => {
      setDrillActive(false);
    });
    press("2", "Digit2");
    expect(useStudy.getState().lessonTab).toBe("conversation");
  });

  it("«؟» حینِ دریل هم راهنما را باز میکند — بالایِ گارد، بیخطر", () => {
    setDrillActive(true);
    render(<ShortcutGuide />);
    press("?", "?");
    expect(screen.getByText("راهنمای میان‌برهای کیبورد")).toBeTruthy();
  });

  it("گروهِ تمرینها ردیفِ T را دارد — ثبتِ صادقِ میانبرِ روخوانیِ هدف", () => {
    render(<ShortcutGuide />);
    fireEvent(window, new CustomEvent("open-shortcuts"));
    expect(
      screen.getByText("روخوانیِ هدفِ پرسش — وقتی پرسش شنیدنی دارد"),
    ).toBeTruthy();
  });
});
