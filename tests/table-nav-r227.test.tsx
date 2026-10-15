// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۷ — گاردهای دو ویژگیِ این راند:
//   ① ناوبریِ پیوستهٔ جدول‌های «اجزای کلماتی» (بندِ ① پیشنهادِ ۲۲۶ —
//      آینهٔ topic-nav-r226 برای لایهٔ واژگان): نوارِ «قبلی/بعدی + X از Y»
//      پانوشتِ هر کارت در بسترِ ضمیمه؛ همسایه‌ها از فهرستِ رندرشده
//      (فیلترِ فعال) — ناوبری اسکرولِ محلیِ لنگر است، بدونِ چرخشِ استور
//   ② باز/بستنِ همهٔ موضوع‌های «درسنامهٔ جامع» (بندِ ② پیشنهادِ ۲۲۶):
//      بازکردنِ همه = کلِ بانکِ ۳۲تایی؛ بستنِ همه حتیِ پیش‌بازِ موضوعِ ۱؛
//      toggleِ تکی بعدش سالم می‌ماند
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import AppendixView from "@/components/study/lesson/appendix-view";
import WordFamilyTableCard from "@/components/study/lesson/word-family-table-card";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import {
  WORD_FAMILY_TABLES,
  wordFamilyTableId,
} from "@/data/word-families";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

// ناوبریِ همسایه از «فهرستِ رندرشده» — برچسب = «<پایه> · <درس>»
const label = (t: (typeof WORD_FAMILY_TABLES)[number]) => `${t.grade} · ${t.lesson}`;
const filterButton = (prefix: string) =>
  within(screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" }))
    .getAllByRole("button")
    .find((b) => (b.textContent ?? "").startsWith(prefix)) as HTMLElement;

describe("table-nav-r227 — نوارِ ناوبری جدول‌های pos در ضمیمه", () => {
  beforeAll(() => {
    // jsdom scrollIntoView ندارد — stub برای ادعای فراخوانیِ ناوبری
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("کارتِ اولِ ضمیمه («دهم · درس اول»): «بعدی» دارد، «قبلی» ندارد، چیپِ «۱ از ۱۰»", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const first = within(document.getElementById("wf-table-wf-g10-l1")!);
    expect(
      first.getByRole("button", { name: `جدولِ بعدی: ${label(WORD_FAMILY_TABLES[1])}` }),
    ).toBeTruthy();
    expect(first.queryByRole("button", { name: /جدولِ قبلی/ })).toBeNull();
    expect(first.getByText("۱ از ۱۰")).toBeTruthy();
  });

  it("کلیکِ «بعدی»: scrollIntoView به لنگرِ هدف — بدونِ چرخشِ استور", async () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    fireEvent.click(
      within(document.getElementById("wf-table-wf-g10-l1")!).getByRole("button", {
        name: `جدولِ بعدی: ${label(WORD_FAMILY_TABLES[1])}`,
      }),
    );
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1),
    );
    // ناوبریِ محلی است — view دست‌نخورده
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });

  it("کارتِ آخر («دوازدهم · درس سوم»): «قبلی» دارد، «بعدی» ندارد، چیپِ «۱۰ از ۱۰» (scope داخلِ لنگر)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const last = within(document.getElementById("wf-table-wf-g12-l3")!);
    expect(
      last.getByRole("button", {
        name: `جدولِ قبلی: ${label(WORD_FAMILY_TABLES[WORD_FAMILY_TABLES.length - 2])}`,
      }),
    ).toBeTruthy();
    expect(last.queryByRole("button", { name: /جدولِ بعدی/ })).toBeNull();
    expect(last.getByText("۱۰ از ۱۰")).toBeTruthy();
  });

  it("مرزِ بین‌پایه‌ای روشن است: «دهم · درس چهارم» بعدی‌اش «یازدهم · درس اول» است — و بی‌چیپِ درسِ مرتبط می‌ماند", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const fourth = within(document.getElementById("wf-table-wf-g10-l4")!);
    expect(fourth.getByRole("button", { name: "جدولِ قبلی: دهم · درس سوم" })).toBeTruthy();
    expect(fourth.getByRole("button", { name: "جدولِ بعدی: یازدهم · درس اول" })).toBeTruthy();
    expect(fourth.getByText("۴ از ۱۰")).toBeTruthy();
    // صفرِ صادقانهٔ r223/r224 پابرجا: جدولِ «درس چهارمِ دهم» چیپِ برگشت ندارد
    expect(fourth.queryByRole("button", { name: /درسِ مرتبط/ })).toBeNull();
  });

  it("فیلترِ پایه با ناوبری هم‌راستاست: «یازدهم» یعنی «N از ۳» و همسایه‌ها فقط درونِ همان پایه", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    fireEvent.click(filterButton("یازدهم"));
    const first11 = within(document.getElementById("wf-table-wf-g11-l1")!);
    expect(first11.getByText("۱ از ۳")).toBeTruthy();
    expect(
      first11.getByRole("button", { name: "جدولِ بعدی: یازدهم · درس دوم" }),
    ).toBeTruthy();
    expect(first11.queryByRole("button", { name: /جدولِ قبلی/ })).toBeNull();
    // همسایهٔ بین‌پایه‌ایِ «همه» در این scope دیده نمی‌شود — یالِ
    // «دهم·چهارم ← یازدهم·اول» فقط در فهرستِ کامل وجود دارد
    expect(
      screen.queryByRole("button", { name: "جدولِ بعدی: یازدهم · درس اول" }),
    ).toBeNull();
  });
});

describe("table-nav-r227 — بسترِ درس: کارتِ تنها نوارِ ناوبری نمی‌بیند", () => {
  beforeEach(cleanup);

  it("WordFamilyTableCardِ تنها (مثلِ LinkedWordFamilies) نه دکمهٔ ناوبری دارد نه چیپِ موقعیت", () => {
    render(<WordFamilyTableCard table={WORD_FAMILY_TABLES[0]} />);
    expect(screen.queryByRole("button", { name: /جدولِ (قبلی|بعدی)/ })).toBeNull();
    expect(screen.queryByText(/از ۱۰/)).toBeNull();
  });
});

describe("table-nav-r227 — باز/بستنِ همهٔ موضوع‌های درسنامهٔ جامع", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("دکمه‌ها در هدرِ درسنامهٔ جامع هستند — گروهِ دودکمه‌ای «بازکردن همه / بستن همه»", () => {
    render(<BookletGrammarView />);
    const group = screen.getByRole("group", { name: "باز و بستن همهٔ موضوع‌ها" });
    const names = within(group)
      .getAllByRole("button")
      .map((b) => (b.textContent ?? "").trim());
    expect(names).toEqual(["بازکردن همه", "بستن همه"]);
  });

  it("«بازکردن همه»: هر ۳۲ toggle باز می‌شود — بدنهٔ مصدرِ دور (موضوعِ ۲۴) بدونِ کلیکِ دستی دیده می‌شود", () => {
    render(<BookletGrammarView />);
    fireEvent.click(screen.getByRole("button", { name: "بازکردن همه" }));
    const openToggles = document.querySelectorAll('button[aria-expanded="true"]');
    expect(openToggles).toHaveLength(BOOKLET_GRAMMAR_TOPICS.length);
    const inf = document.getElementById("bg-topic-bg-infinitive")!;
    expect(inf.textContent).toContain("کاربرد دوازدهم");
  });

  it("«بستن همه»: حتیِ پیش‌بازِ موضوعِ ۱ هم بسته می‌شود — و toggleِ تکی بعدش سالم می‌ماند", () => {
    render(<BookletGrammarView />);
    // پیش‌فرض: موضوعِ اول باز است
    expect(
      document.getElementById(`bg-topic-${BOOKLET_GRAMMAR_TOPICS[0].id}`)!
        .querySelector('button[aria-expanded="true"]'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "بستن همه" }));
    expect(document.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(0);
    // هدرها می‌مانند، بدنه‌ها می‌روند
    expect(screen.getByText(BOOKLET_GRAMMAR_TOPICS[0].title)).toBeTruthy();
    // toggleِ تکی بعد از بستنِ همه سالم است
    fireEvent.click(screen.getByText(BOOKLET_GRAMMAR_TOPICS[0].title));
    expect(document.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(1);
  });
});
