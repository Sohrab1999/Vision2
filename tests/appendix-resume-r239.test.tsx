// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۹ — دو بندِ پیشنهادِ ۲۳۸ در یک راند:
//   A. «مسیرِ اخیر» زیرِ نشانگرِ سرِ ضمیمه (بندِ ①): خوشهٔ
//     pill + چیپِ فشرده با جدیدترینِ ورودیِ «دیگرِ» تاریخچه — همان
//     قراردادها: پرش ≠ نوشتن، حذفِ رکوردِ فعلی از چیپ‌ها، استقلالِ
//     دو معنا (بی‌رکورد ولی با تاریخچه = فقط چیپ).
//   B. حلقهٔ کیبوردِ واحد (بندِ ②): ثابتِ RESUME_FOCUS_RING رویِ همهٔ
//     درهایِ Tab-پذیرِ حلقهٔ «ادامه» — هدر، نشانگر + چیپِ اخیر، کارتِ
//     خانه، چیپ‌هایِ سینیِ خانه، «ادامه» و ردیف‌هایِ تاریخچهٔ پروفایل.
//     درِ فرمان‌یاب مستثناست (aria-activedescendant — ردیف‌ها فوکوس
//     نمی‌گیرند).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import AppendixResumePill from "@/components/study/lesson/appendix-resume-pill";
import HeaderResumeButton from "@/components/study/shell/header-resume-button";
import HomeTools from "@/components/study/home/home-tools";
import ProfilePopover from "@/components/study/profile/profile-popover";
import {
  writeAppendixResume,
  readAppendixResume,
  clearAppendixResume,
} from "@/lib/bg-reading";
import { RESUME_FOCUS_RING } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import type { AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

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
  toastSpy.mockClear();
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

describe("A — چیپِ «مسیرِ اخیر» زیرِ نشانگرِ ضمیمه", () => {
  it("① رکورد + تاریخچه: خوشه = pill + چیپِ جدیدترینِ «دیگر»؛ فعلی هرگز چیپ نمی‌شود", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپ
      writeAppendixResume(grammarRec); // فعلی → pill
    });
    const onGo = vi.fn();
    render(<AppendixResumePill onGo={onGo} />);
    expect(screen.getByTestId("appendix-resume-pill")).toBeInTheDocument();
    const chip = screen.getByTestId("appendix-recent-chip-verbs-eat");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent("eat — ate — eaten");
    expect(chip).toHaveTextContent("افعال بی‌قاعده");
    // فعلی (حال ساده) چیپ نیست
    expect(screen.queryByTestId("appendix-recent-chip-grammar-t-present-simple")).toBeNull();
    // فقط یک چیپ — جدیدترینِ دیگر (eat قدیمی‌تر از grammar است؛ phonetics در کار نیست)
  });

  it("② کلیکِ چیپ = onGo با همان scope/id + رکوردِ «ادامه» دست‌نخورده", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپ
      writeAppendixResume(grammarRec); // فعلی
    });
    const onGo = vi.fn();
    render(<AppendixResumePill onGo={onGo} />);
    act(() => {
      fireEvent.click(screen.getByTestId("appendix-recent-chip-verbs-eat"));
    });
    expect(onGo).toHaveBeenCalledWith("verbs", "eat");
    // پرش ≠ نوشتن
    expect(readAppendixResume()?.id).toBe("t-present-simple");
  });

  it("③ بی‌رکورد ولی با تاریخچه = فقط چیپ (دو معنایِ جدا — pill غیب)", () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
      clearAppendixResume();
    });
    const onGo = vi.fn();
    render(<AppendixResumePill onGo={onGo} />);
    expect(screen.queryByTestId("appendix-resume-pill")).toBeNull();
    // بدونِ رکوردِ فعلی، جدیدترینِ تاریخچه خودش چیپ می‌شود (grammar)
    const chip = screen.getByTestId("appendix-recent-chip-grammar-t-present-simple");
    expect(chip).toBeInTheDocument();
    // با دو ورودی هم فقط «یک» چیپِ فشرده — بودجهٔ سرِ ضمیمه (جدیدترینِ اول)
    expect(screen.getAllByTestId(/^appendix-recent-chip-/)).toHaveLength(1);
    expect(screen.queryByTestId("appendix-recent-chip-verbs-eat")).toBeNull();
    expect(chip).toHaveTextContent("حال ساده");
  });

  it("④ بی‌رکورد و بی‌تاریخچه = کلِ خوشه غیب (صداقت)", () => {
    render(<AppendixResumePill onGo={vi.fn()} />);
    expect(screen.queryByTestId("appendix-resume-cluster")).toBeNull();
  });

  it("⑤ تاریخچهٔ تک‌عضوی که همانِ رکوردِ فعلی است = بی‌چیپ", () => {
    act(() => {
      writeAppendixResume(verbRec);
    });
    const onGo = vi.fn();
    render(<AppendixResumePill onGo={onGo} />);
    expect(screen.getByTestId("appendix-resume-pill")).toBeInTheDocument();
    expect(screen.queryByTestId(/^appendix-recent-chip-/)).toBeNull();
  });
});

describe("B — حلقهٔ کیبوردِ واحدِ درهایِ «ادامه» (RESUME_FOCUS_RING)", () => {
  it("⑥ ثابت: کلاس‌هایِ کانونیِ حلقه را یک‌جا دارد", () => {
    expect(RESUME_FOCUS_RING).toContain("focus-visible:outline-none");
    expect(RESUME_FOCUS_RING).toContain("focus-visible:ring-2");
    expect(RESUME_FOCUS_RING).toContain("focus-visible:ring-emerald-500");
    expect(RESUME_FOCUS_RING).toContain("focus-visible:ring-offset-1");
    expect(RESUME_FOCUS_RING).toContain("dark:focus-visible:ring-offset-stone-900");
  });

  it("⑦ دکمهٔ هدر + نشانگرِ ضمیمه + چیپِ اخیرش: هر سه حلقه دارند", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپ
      writeAppendixResume(grammarRec); // فعلی
    });
    render(<HeaderResumeButton />);
    expect(screen.getByTestId("header-resume-button")).toHaveClass("focus-visible:ring-2");
    cleanup();
    render(<AppendixResumePill onGo={vi.fn()} />);
    expect(screen.getByTestId("appendix-resume-pill")).toHaveClass("focus-visible:ring-2");
    expect(screen.getByTestId("appendix-recent-chip-verbs-eat")).toHaveClass("focus-visible:ring-2");
  });

  it("⑧ کارتِ ضمیمهٔ خانه + چیپ‌هایِ سینیِ «اخیراً»: حلقه دارند؛ کارتِ دیگرِ گرید ندارد", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپِ سینی
      writeAppendixResume(grammarRec); // فعلی
    });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card).toHaveClass("focus-visible:ring-2");
    expect(screen.getByTestId("home-history-item-verbs-eat")).toHaveClass("focus-visible:ring-2");
    // کارتِ «دیکشنری جستجو» بیرونِ حلقه است — بدونِ حلقه
    const dictCard = screen.getByRole("button", { name: /دیکشنری جستجو/ });
    expect(dictCard).not.toHaveClass("focus-visible:ring-2");
  });

  it("⑨ پروفایل: «ادامه» + ردیف‌هایِ تاریخچه حلقه دارند", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → ردیفِ تاریخچه
      writeAppendixResume(grammarRec); // فعلی
    });
    render(<ProfilePopover />);
    const trigger = screen.getByRole("button", { name: "پروفایل من" });
    act(() => {
      fireEvent.pointerDown(trigger);
      fireEvent.click(trigger);
    });
    expect(screen.getByRole("button", { name: /ادامه/ })).toHaveClass("focus-visible:ring-2");
    expect(screen.getByTestId("profile-history-item-verbs-eat")).toHaveClass("focus-visible:ring-2");
  });
});
