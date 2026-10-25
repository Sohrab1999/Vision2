// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۲ — «کاربرد در جزوه»: یابندهٔ جایِ واژه در مکالمه‌ها و ریدینگ‌ها
//
// ویژگیِ محتواییِ وفادارِ جزوه: برایِ هر واژهٔ واژگان، متن‌هایِ خودِ جزوه
// (مکالمه + ریدینگ، هم‌درس و میان‌درسی) با ترجمهٔ فارسیِ خودِ جزوه نمایه
// می‌شود — نه جملهٔ ساختهٔ ما، نه تعریفی بیرونی. چیپِ «در جزوه» رویِ کارتِ
// واژه فقط با تطبیقِ واقعی می‌آید (بی‌کاربرد، هیچ) و دیالوگِ جای‌ها واژه را
// با mark هایلایت می‌کند.
//
// گاردهایِ این فایل:
//   ① معناشناسیِ تطبیق: مرزِ واژه + پسوندهایِ مجازِ لایه-به-لایه —
//     recall/useful/wind/message هیچ‌کدام «call/use/win/age» نیستند؛
//     called/using/aged/studies/studied/studying هستند؛ case-insensitive.
//   ② صداقتِ داده: سایت‌هایِ واقعی با faِ غیرخالی و lessonId/kindِ درست؛
//     پرشِ میان‌درسی (ability از درس ۱ در مکالمهٔ درس ۱۱ هم هست)؛
//     گزیدهٔ en هر سایت خودش تطبیق دارد؛ بی‌کاربرد = آرایهٔ خالی.
//   ③ هایلایت: قطعه‌ها به متنِ اصلی بازمی‌سازند و قطعه‌هایِ hit تطبیق دارند.
//   ④ سطحِ کامپوننت: چیپِ «در جزوه» با شمارشِ faNum رویِ کارتِ واژهٔ
//     کاربرددار؛ کلیک → دیالوگ با mark هایلایت‌شده + ترجمهٔ فارسی + نشانِ نوع.
//   ⑤ صداقتِ ساختاری: واژهٔ بی‌کاربرد هیچ چیپی ندارد — بی‌کاربرد، هیچ.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { findWordUsages, wordFormRegex, highlightParts } from "@/lib/word-usage";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";

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

describe("«کاربرد در جزوه» — r252", () => {
  it("① معناشناسیِ تطبیق: مرزِ واژه + پسوندهایِ مجاز — FPهایِ کلاسیک ممنوع", () => {
    // call → called/calls ✓، recall ✗ (مرزِ واژه)
    expect(wordFormRegex("call").test("they called me yesterday")).toBe(true);
    expect(wordFormRegex("call").test("he calls it art")).toBe(true);
    expect(wordFormRegex("call").test("recall the name")).toBe(false);
    // use → used/using ✓ (ختم به e)، useful ✗
    expect(wordFormRegex("use").test("I am using it")).toBe(true);
    expect(wordFormRegex("use").test("she used to sing")).toBe(true);
    expect(wordFormRegex("use").test("a useful book")).toBe(false);
    // win → wind ✗ (پسوندِ برهنهٔ d ممنوع — درسِ پروب)
    expect(wordFormRegex("win").test("the wind blows")).toBe(false);
    // age → message ✗ (مرزِ واژه)، aged ✓
    expect(wordFormRegex("age").test("send a message")).toBe(false);
    expect(wordFormRegex("age").test("he aged well")).toBe(true);
    // study → studies/studied/studying ✓ (ختم به y)
    expect(wordFormRegex("study").test("she studies art")).toBe(true);
    expect(wordFormRegex("study").test("we studied hard")).toBe(true);
    expect(wordFormRegex("study").test("studying english")).toBe(true);
    // case-insensitive: «Culture» در ریدینگ، «culture» در واژگان — یکی
    expect(wordFormRegex("culture").test("Iranian Culture is rich")).toBe(true);
  });

  it("② صداقتِ داده: سایت‌هایِ واقعیِ جزوه با faِ غیرخالی + پرشِ میان‌درسی + گزیدهٔ تطبیق‌دار", () => {
    // communication: چند سایتِ واقعی در جزوه (ریدینگ «زبان‌های دنیا» و…)
    const sites = findWordUsages("communication");
    expect(sites.length).toBeGreaterThanOrEqual(2);
    for (const s of sites) {
      expect(s.fa.length).toBeGreaterThan(0);
      expect(s.en.length).toBeGreaterThan(0);
      expect(s.lessonId).toBeGreaterThanOrEqual(1);
      expect(s.lessonId).toBeLessThanOrEqual(12);
      expect(["conversation", "reading"]).toContain(s.kind);
      // برچسبِ حاویِ «درس» با ارقامِ فارسی (ایدئومِ faNumِ کلِ اپ — رگِ r252)
      expect(s.titleFa).toContain(`درس ${faNum(s.lessonId)}`);
      // گزیدهٔ en خودش تطبیق دارد — نه متنِ کاملِ بی‌گزیده و بی‌تطبیق
      expect(wordFormRegex("communication").test(s.en)).toBe(true);
    }
    expect(sites.some((s) => s.kind === "reading")).toBe(true);
    // پرشِ میان‌درسی: ability واژهٔ درس ۱ است اما در مکالمهٔ درس ۱۱ هم هست
    const ability = findWordUsages("ability");
    expect(ability.length).toBeGreaterThanOrEqual(1);
    expect(ability.some((s) => s.lessonId !== 1)).toBe(true);
    // بی‌کاربرد = آرایهٔ خالی (broadcast واژهٔ درس ۱ است؛ در متن‌ها نیست)
    expect(findWordUsages("broadcast")).toEqual([]);
  });

  it("③ هایلایت: بازسازیِ متنِ اصلی + قطعه‌هایِ hit تطبیق دارند", () => {
    const en = "People use language to communicate. It uses written forms.";
    const parts = highlightParts(en, "use");
    expect(parts.map((p) => p.text).join("")).toBe(en);
    const hits = parts.filter((p) => p.hit);
    expect(hits.length).toBeGreaterThanOrEqual(2); // use + uses
    for (const h of hits) expect(wordFormRegex("use").test(h.text)).toBe(true);
  });

  it("④ سطحِ کامپوننت: چیپِ «در جزوه» + دیالوگ با mark و ترجمه و نشانِ نوع", () => {
    render(<DictionaryView />);
    const input = screen.getByPlaceholderText("مثلاً: language یا زبان...");
    act(() => {
      fireEvent.change(input, { target: { value: "communication" } });
    });
    // communication واژهٔ مشترکِ چند درس است — هر کارتِ هم‌نام چیپِ خودش را دارد
    const chips = screen.getAllByTestId("usage-chip-communication");
    expect(chips.length).toBeGreaterThanOrEqual(1);
    const chip = chips[0];
    expect(chip).toHaveTextContent("در جزوه");
    act(() => {
      fireEvent.click(chip);
    });
    const dialog = screen.getByTestId("usage-dialog");
    // هایلایتِ mark داخلِ دیالوگ — با کلاس‌هایِ amberِ ریمپ‌شدهٔ kernel
    const marks = dialog.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    for (const m of marks) expect(m.className).toContain("bg-amber-50");
    // ترجمهٔ فارسیِ خودِ جزوه (حداقل یک سایت با متنِ فارسیِ غیرخالی)
    const siteCards = dialog.querySelectorAll("[data-testid=usage-site]");
    expect(siteCards.length).toBeGreaterThanOrEqual(2);
    // هر سایت: نشانِ نوع (مکالمه یا ریدینگ) + عنوانِ حاویِ «درس» + متنِ فارسی
    for (const card of siteCards) {
      expect(/مکالمه|ریدینگ/.test(card.textContent ?? "")).toBe(true);
      expect(card.textContent).toContain("درس");
    }
    // نخستینِ سایتِ «communication» ریدینگِ «زبان‌های دنیا»ی درس ۱ است
    expect(siteCards[0].textContent).toContain("درس ۱");
    // نشانِ نوع — «ریدینگ» حاضر است
    expect(dialog.textContent).toContain("ریدینگ");
    // بستنِ دیالوگ
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });

  it("⑤ صداقتِ ساختاری: واژهٔ بی‌کاربرد هیچ چیپی ندارد — بی‌کاربرد، هیچ", () => {
    render(<DictionaryView />);
    const input = screen.getByPlaceholderText("مثلاً: language یا زبان...");
    act(() => {
      fireEvent.change(input, { target: { value: "broadcast" } });
    });
    expect(screen.queryByTestId("usage-chip-broadcast")).not.toBeInTheDocument();
    // و دیالوگی هم باز نیست
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });
});
