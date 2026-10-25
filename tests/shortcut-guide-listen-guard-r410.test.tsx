// @vitest-environment jsdom
// ------------------------------------------------------------------
// r410 — گاردِ راهنمای سراسری بر سرِ T: سطحِ شنیدار T را میگیرد.
//
// قفلهای کلاس (همه کنترل-جفت — درسِ r409):
//  · بیِ سطحِ شنیدار: KeyT شب/روز را عوض میکند (کنترلِ سالم)
//  · با سطحِ شنیدار: KeyT پوسته را دست نمیزند (setTheme صدا نمیشود)
//  · جراحیِ گارد: با سطحِ شنیدار، KeyD هنوز ناوبری میکند — سطحِ
//    شنیدار ناوبر نیست، شنیدار است (فقط T جابه‌جا میشود)
//  · «؟» حینِ سطحِ شنیدار راهنما را باز میکند
//  · ثبتِ صادق در راهنما: ردیفِ T در گروهِ فلش‌کارتها + گروهِ
//    «روخوانی با T — سطح‌های شنیدار» با دو ردیف
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { useStudy } from "@/lib/study-store";
import { setListenSurface, listenSurfaceSnapshot } from "@/lib/listen-surface";

const setThemeSpy = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: setThemeSpy }),
}));

const press = (key: string, code: string) => fireEvent.keyDown(window, { key, code });

describe("r410 — گاردِ T در سطحِ شنیدار", () => {
  beforeEach(() => {
    cleanup();
    setListenSurface(false);
    setThemeSpy.mockClear();
    useStudy.setState({ view: { type: "home" }, lessonTab: "vocab" });
  });
  afterEach(() => {
    cleanup();
    setListenSurface(false);
    useStudy.setState({ view: { type: "home" }, lessonTab: "vocab" });
  });

  it("کنترل: بیِ سطحِ شنیدار، KeyT شب/روز را عوض میکند", () => {
    render(<ShortcutGuide />);
    press("t", "KeyT");
    expect(setThemeSpy).toHaveBeenCalledTimes(1);
    expect(setThemeSpy).toHaveBeenCalledWith("dark");
  });

  it("با سطحِ شنیدار، KeyT پوسته را دست نمیزند — T مالِ سطح است", () => {
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    expect(listenSurfaceSnapshot()).toBe(true);
    press("t", "KeyT");
    expect(setThemeSpy).not.toHaveBeenCalled();
  });

  it("جراحیِ گارد: با سطحِ شنیدار، KeyD هنوز ناوبری میکند — فقط T جابه‌جا میشود", () => {
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("d", "KeyD");
    expect(useStudy.getState().view).toEqual({ type: "dictionary" });
    // و KeyT در همان حالت پوسته را دست نمیزند (هر دو نیمِ جراحی)
    press("t", "KeyT");
    expect(setThemeSpy).not.toHaveBeenCalled();
  });

  it("«؟» حینِ سطحِ شنیدار راهنما را باز میکند — بالایِ گارد، بیخطر", () => {
    act(() => setListenSurface(true));
    render(<ShortcutGuide />);
    press("?", "?");
    expect(screen.getByText("راهنمای میان‌برهای کیبورد")).toBeTruthy();
  });

  it("گروهِ فلش‌کارتها ردیفِ T را دارد — ثبتِ صادقِ مالکیتِ T", () => {
    render(<ShortcutGuide />);
    fireEvent(window, new CustomEvent("open-shortcuts"));
    expect(
      screen.getByText("روخوانی واژهٔ کارت — تا فلش‌کارت باز است، T مالِ آن است"),
    ).toBeTruthy();
  });

  it("گروهِ «روخوانی با T» دو سطح را صادقانه ثبت میکند", () => {
    render(<ShortcutGuide />);
    fireEvent(window, new CustomEvent("open-shortcuts"));
    expect(screen.getByText("روخوانی با T — سطح‌های شنیدار")).toBeTruthy();
    expect(
      screen.getByText("فلش‌کارت: روخوانی واژهٔ کارت (رویِ هر دو رویِ کارت)"),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "جدول افعال ضمیمه: دوباره‌شنیدنِ آخرین فعلِ شنیده — بی‌شنیده، T همان شب/روز میماند",
      ),
    ).toBeTruthy();
  });
});
