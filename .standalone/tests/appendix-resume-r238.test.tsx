// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۸ — «آخرینِ مسیرِ خوانده‌شده» در کارتِ ضمیمهٔ خانه (بندِ ①
// پیشنهادِ ۲۳۷): سه چیپِ کوچکِ «اخیراً در ضمیمه» زیرِ پرشِ اصلی — همان
// دادهٔ vision2-bg-history، بدونِ کلیدِ تازه. قراردادهایی که قفل می‌شوند:
//   A. سینیِ چیپ‌ها (HomeAppendixHistory + کارتِ خانه):
//     ① بی‌تاریخچه = هیچ سینی‌ای (صداقت — هیچ کنترلِ ساختگی)
//     ② با تاریخچه = چیپ‌ها زیرِ کارت، جدیدترین اول، خودِ رکوردِ فعلی حذف
//     ③ سقفِ ۳ چیپ — تاریخچهٔ بلندتر فقط سه تایِ اول را نشان می‌دهد
//     ④ کلیکِ چیپ = viewِ همان لایه از قلابِ مشترک + صفرِ نوشتنِ استور +
//       رکوردِ «ادامهٔ مطالعه» دست‌نخورده (پرش ≠ نوشتن)
//     ⑤ دو معنایِ جدا: پاک‌کردنِ رکورد چیپ‌ها را نمی‌کشد — چیپ‌ها از
//       رکوردِ اصلی مستقل‌اند
//     ⑥ نوشتنِ تازه در لایه‌ها سینی را واکنشی تازه می‌کند (ایدئومِ storeِ
//       خارجیِ r231 — کارتِ خانه حالا مثلِ پنج درِ دیگر واکنشی است)
//     ⑦ گاردِ DOM: چیپ‌ها بیرونِ کارتِ دکمه‌ای‌اند — دکمه در دکمه ممنوع
//     ⑧ پرشِ چیپ scopeهایِ مختلف (grammar/phonetics) مقصدِ درست دارد
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import HomeTools from "@/components/study/home/home-tools";
import {
  writeAppendixResume,
  readAppendixResume,
  clearAppendixResume,
  subscribeAppendixHistory,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import type { AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const verbRec: AppendixResumeItem = {
  scope: "verbs",
  id: "eat",
  title: "eat — ate — eaten",
  hint: "خوردن",
};
const grammarRec: AppendixResumeItem = {
  scope: "grammar",
  id: "t-present-simple",
  title: "حال ساده",
  hint: "ص ۲۳",
};
const phonRec: AppendixResumeItem = {
  scope: "phonetics",
  id: "ʌ",
  title: "/ʌ/",
  hint: "cup — love",
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("A — سینیِ «اخیراً در ضمیمه» در کارتِ خانه", () => {
  it("① بی‌تاریخچه = هیچ سینی‌ای رندر نمی‌شود (صداقت)", () => {
    render(<HomeTools />);
    expect(screen.queryByTestId("home-appendix-history")).toBeNull();
  });

  it("② با تاریخچه = سینی زیرِ کارت؛ جدیدترین اول؛ خودِ رکوردِ فعلی از چیپ‌ها حذف", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپ
      writeAppendixResume(grammarRec); // آخرین نوشتن = رکوردِ فعلی (بلوکِ اصلی دارد)
    });
    render(<HomeTools />);
    const tray = screen.getByTestId("home-appendix-history");
    expect(tray).toBeInTheDocument();
    expect(tray).toHaveTextContent("اخیراً در ضمیمه");
    // فقط قدیمی‌تر حاضر است — فعلی حذف شده
    expect(screen.getByTestId("home-history-item-verbs-eat")).toBeInTheDocument();
    expect(screen.queryByTestId("home-history-item-grammar-t-present-simple")).toBeNull();
    // ترتیب: جدیدترینِ باقی‌مانده اول — اینجا فقط یکی مانده
    const chips = tray.querySelectorAll("button");
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain("eat — ate — eaten");
  });

  it("③ سقفِ ۳ چیپ — از تاریخچهٔ بلندتر فقط سه تایِ اولِ باقی‌مانده می‌آید", () => {
    act(() => {
      // ترتیبِ نوشتن: قدیمی‌ترین اول — آخرینِ نوشتن (etc) رکوردِ فعلی است
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
      writeAppendixResume(phonRec);
      writeAppendixResume({ scope: "pos", id: "nouns", title: "اسم‌ها" });
      writeAppendixResume({ scope: "abbrev", id: "etc", title: "etc." });
    });
    render(<HomeTools />);
    const tray = screen.getByTestId("home-appendix-history");
    expect(tray.querySelectorAll("button")).toHaveLength(3);
    // تاریخچه: etc → nouns → ʌ → حال ساده → eat؛ رکوردِ فعلی (etc/abbrev)
    // حذف می‌شود؛ سه تایِ اولِ باقی‌مانده: nouns، ʌ، حال ساده
    expect(screen.getByTestId("home-history-item-pos-nouns")).toBeInTheDocument();
    expect(screen.getByTestId("home-history-item-phonetics-ʌ")).toBeInTheDocument();
    expect(screen.getByTestId("home-history-item-grammar-t-present-simple")).toBeInTheDocument();
    expect(screen.queryByTestId("home-history-item-abbrev-etc")).toBeNull();
    expect(screen.queryByTestId("home-history-item-verbs-eat")).toBeNull();
  });

  it("④ کلیکِ چیپ = viewِ همان لایه + صفرِ نوشتنِ استور + رکوردِ «ادامه» دست‌نخورده", () => {
    useStudy.setState({ known: { apple: true } } as Partial<ReturnType<typeof useStudy.getState>>);
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپ
      writeAppendixResume(grammarRec); // آخرین نوشتن = رکوردِ فعلی
    });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card).toBeInTheDocument(); // کارتِ اصلی سرِ جایش است
    act(() => {
      fireEvent.click(screen.getByTestId("home-history-item-verbs-eat"));
    });
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      verbBase: "eat",
    });
    // پرش ≠ نوشتن: رکورد همان حال ساده می‌ماند
    expect(readAppendixResume()?.id).toBe("t-present-simple");
    // صفرِ نوشتنِ جانبی در استورِ یادگیری
    expect(useStudy.getState().known).toEqual({ apple: true });
  });

  it("⑤ دو معنایِ جدا: پاک‌کردنِ رکورد چیپ‌ها را نمی‌کشد", () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
    });
    render(<HomeTools />);
    expect(screen.getByTestId("home-appendix-history")).toBeInTheDocument();
    act(() => {
      clearAppendixResume();
    });
    // رکورد غیب شد ولی چیپ‌ها حاضرند — «اخیراً» مستقل از «ادامه» است
    expect(readAppendixResume()).toBeNull();
    expect(screen.getByTestId("home-appendix-history")).toBeInTheDocument();
    expect(screen.getByTestId("home-history-item-grammar-t-present-simple")).toBeInTheDocument();
    expect(screen.getByTestId("home-history-item-verbs-eat")).toBeInTheDocument();
  });

  it("⑥ نوشتنِ تازه سینی را واکنشی تازه می‌کند (ایدئومِ storeِ خارجی)", () => {
    const spy = vi.fn();
    const un = subscribeAppendixHistory(spy);
    render(<HomeTools />);
    expect(screen.queryByTestId("home-appendix-history")).toBeNull();
    act(() => {
      writeAppendixResume(verbRec); // فعلی
      writeAppendixResume(phonRec); // چیپ
    });
    expect(spy).toHaveBeenCalled();
    expect(screen.getByTestId("home-appendix-history")).toBeInTheDocument();
    expect(screen.getByTestId("home-history-item-verbs-eat")).toBeInTheDocument();
    un();
  });

  it("⑦ گاردِ DOM: چیپ‌ها descendantِ کارتِ دکمه‌ای نیستند (دکمه در دکمه ممنوع)", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپ
      writeAppendixResume(grammarRec); // فعلی
    });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    const chip = screen.getByTestId("home-history-item-verbs-eat");
    const tray = screen.getByTestId("home-appendix-history");
    // چیپ داخلِ کارت نیست — sibling است داخلِ wrapper
    expect(card.contains(chip)).toBe(false);
    // و برعکس
    expect(chip.contains(card)).toBe(false);
    // wrapper مشترک: کارت و سینی هر دو فرزندِ مستقیمِ همان والدِ flex-col هستند
    expect(card.parentElement).toBe(tray.parentElement);
  });

  it("⑧ پرشِ چیپِ هر scope مقصدِ درستِ همان لایه را دارد", () => {
    act(() => {
      writeAppendixResume(phonRec); // قدیمی‌تر → چیپِ phonetics
      writeAppendixResume(verbRec); // فعلی
    });
    render(<HomeTools />);
    act(() => {
      fireEvent.click(screen.getByTestId("home-history-item-phonetics-ʌ"));
    });
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      phonemeId: "ʌ",
    });
    expect(readAppendixResume()?.id).toBe("eat");
  });
});
