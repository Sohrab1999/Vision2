// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۳ — «کاربرد در جزوه» سه‌سطحی شد + شمارندهٔ سرصفحه
//
// بندِ ① پیشنهادِ ۲۵۲: دیالوگِ جایِ واژه (r252) به کامپوننتِ مشترک رفت
// و چیپِ «در جزوه» حالا رویِ تبِ واژگانِ درس و پشتِ فلش‌کارت هم هست —
// همان تک‌منبعِ findWordUsages، همان دیالوگ، صفرِ محتوایِ ساخته.
// بندِ ② پیشنهادِ ۲۵۲: سرصفحهٔ دیکشنری می‌گوید چند واژه از N در متنِ
// خودِ جزوه زندگی می‌کنند — خودسازگار با چیپ‌هایِ همان صفحه.
//
// گاردهایِ این فایل:
//   ① استخراجِ دیالوگ: UsageDialog مشترک عینِ رفتارِ r252 — markِ
//     amber، نشانِ نوع، ترجمهٔ فارسیِ جزوه، بستن → onClose.
//   ② تبِ واژگان: چیپِ واقعی رویِ کارتِ کاربرددار؛ کلیک → دیالوگ؛
//     و مهم‌تر: کارتِ والد «بلد» را جعل نمی‌کند (stopPropagation).
//   ③ صداقت در تبِ واژگان: واژهٔ بی‌کاربرد هیچ چیپی ندارد.
//   ④ فلش‌کارت: چیپ رویِ پشتِ کارت؛ کلیکِ آن فلیپ را نمی‌زند و
//     دیالوگِ مشترک را باز می‌کند.
//   ⑤ شمارندهٔ سرصفحه: «X از N» با شمارشِ مستقلِ تست یکی است —
//     کارت‌محور، هم‌خوان با «جستجو در N واژه».
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import VocabTab from "@/components/study/lesson/vocab-tab";
import Flashcards from "@/components/study/lesson/flashcards";
import UsageDialog from "@/components/study/lesson/usage-dialog";
import { findWordUsages } from "@/lib/word-usage";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { LessonData, VocabWord } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

// واژهٔ کاربرددارِ یک درس — از خودِ داده، نه پینِ دستی
const usageWordOf = (l: LessonData): VocabWord | undefined =>
  l.vocabulary.find((w) => findWordUsages(w.en).length > 0);

describe("«کاربرد در جزوه» سه‌سطحی — r253", () => {
  it("① دیالوگِ مشترک: عینِ رفتارِ r252 — markِ amber + نشانِ نوع + ترجمهٔ جزوه + بستن", () => {
    const sites = findWordUsages("communication");
    expect(sites.length).toBeGreaterThanOrEqual(2);
    const onClose = vi.fn();
    render(<UsageDialog usage={{ en: "communication", sites }} onClose={onClose} />);
    const dialog = screen.getByTestId("usage-dialog");
    // هایلایتِ mark — کلاسِ amberِ ریمپ‌شدهٔ kernel
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    for (const m of marks) expect(m.className).toContain("bg-amber-50");
    // نشانِ نوع + عنوانِ درس‌دار + متنِ فارسیِ خودِ جزوه
    const siteCards = dialog.querySelectorAll("[data-testid=usage-site]");
    expect(siteCards.length).toBeGreaterThanOrEqual(2);
    for (const card of siteCards) {
      expect(/مکالمه|ریدینگ/.test(card.textContent ?? "")).toBe(true);
      expect(card.textContent).toContain("درس");
    }
    // بستن → onClose
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("② تبِ واژگان: چیپِ واقعی + دیالوگ + کارتِ والد بلد را جعل نمی‌کند", () => {
    const lesson = lessons[0];
    const word = usageWordOf(lesson);
    expect(word).toBeDefined();
    render(<VocabTab lesson={lesson} />);
    const chip = screen.getByTestId(`usage-chip-${word!.en.replace(/\s+/g, "-")}`);
    expect(chip).toHaveTextContent("در جزوه");
    // کلیکِ چیپ: دیالوگ باز می‌شود اما known دست‌نخورده می‌ماند
    act(() => {
      fireEvent.click(chip);
    });
    expect(screen.getByTestId("usage-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("usage-dialog").textContent).toContain(word!.en);
    expect(useStudy.getState().known).toEqual({});
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
    // و خودِ کارت هنوز بلد نشده — aria-pressed=false
    const card = chip.closest("[role=button]");
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute("aria-pressed", "false");
  });

  it("③ صداقت در تبِ واژگان: واژهٔ بی‌کاربرد چیپ ندارد — بی‌کاربرد، هیچ", () => {
    render(<VocabTab lesson={lessons[0]} />);
    expect(screen.queryByTestId("usage-chip-broadcast")).not.toBeInTheDocument();
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("④ فلش‌کارت: چیپ رویِ پشتِ کارت؛ کلیکِ آن فلیپ نمی‌زند و دیالوگِ مشترک باز می‌کند", () => {
    const lesson = lessons[0];
    const word = usageWordOf(lesson)!;
    // دکِ دوکارتی با propِ words (مسیرِ F7) — کارتِ اول واژهٔ کاربرددار است
    render(<Flashcards lesson={lesson} onExit={() => {}} words={[word, lesson.vocabulary[lesson.vocabulary.length - 1]]} />);
    const flipCard = screen.getByRole("button", { name: "برگرداندن کارت" });
    // کارتِ بسته است — چیپِ پشت هنوز در DOM است (فلیپِ CSS، حذفِ DOM نیست)
    const chip = screen.getByTestId(`usage-chip-${word.en.replace(/\s+/g, "-")}`);
    act(() => {
      fireEvent.click(chip);
    });
    // دیالوگِ مشترک باز شد و فلیپ سرِ جایش است — stopPropagation کار می‌کند
    expect(screen.getByTestId("usage-dialog")).toBeInTheDocument();
    expect(flipCard).toHaveAttribute("aria-pressed", "false");
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("⑤ شمارندهٔ سرصفحهٔ دیکشنری: «X از N» با شمارشِ مستقلِ تست یکی است", () => {
    render(<DictionaryView />);
    const pill = screen.getByTestId("usage-stat");
    const allWords = lessons.flatMap((l) => l.vocabulary);
    const expectedUsed = allWords.filter((w) => findWordUsages(w.en).length > 0).length;
    expect(expectedUsed).toBeGreaterThan(0);
    expect(pill.textContent).toContain(`${faNum(expectedUsed)} از ${faNum(allWords.length)}`);
    // زبانِ صادق: «در متنِ جزوه آمده‌اند» — وعده‌ای بیش از تک‌منبع نیست
    expect(pill.textContent).toContain("در متنِ جزوه آمده‌اند");
  });
});
