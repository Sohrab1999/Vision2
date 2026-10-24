// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۸ — گاردهایِ «فهرستِ پرش» (بندِ ② پیشنهادِ ۲۲۷):
//   ① درسنامهٔ جامع: دکمهٔ «فهرست پرش» کنارِ باز/بستنِ همه (بیرونِ گروهِ
//      دودکمه‌ای — قراردادِ گاردِ r227)؛ پنلِ ۳۲ چیپ در ۳ گروهِ جزوه —
//      نشانِ توپُر = موضوعِ باز (data-open)؛ کلیکِ چیپ = بازکردنِ هدف +
//      اسکرولِ محلیِ لنگر + بستنِ پنل — بدونِ چرخشِ استور
//   ② اجزای کلام: دکمهٔ «فهرست جدول‌ها» بیرونِ گروهِ فیلتر؛ پنلِ چیپ‌ها
//      همیشه از «فهرستِ رندرشده» (فیلترِ فعال) — همان قراردادِ ناوبریِ
//      r227؛ چیپ = «پایه · درس» + شمارشِ خانواده‌ها؛ کلیک = اسکرولِ محلی
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import AppendixView from "@/components/study/lesson/appendix-view";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import {
  BOOKLET_GRAMMAR_TOPICS,
  BOOKLET_GRAMMAR_SOURCES,
} from "@/data/booklet-grammar";
import { WORD_FAMILY_TABLES } from "@/data/word-families";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));

const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const GRAMMAR_PANEL = "فهرست پرش موضوع‌های درسنامهٔ جامع";
const POS_PANEL = "فهرست پرش جدول‌های اجزای کلماتی";

describe("jump-index-r228 — فهرستِ پرشِ درسنامهٔ جامع", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear(); // راند ۲۳۱ — ایزوله‌سازی از جایگاهِ خواندنِ پایدار
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("دکمهٔ «فهرست پرش» بیرونِ گروهِ دودکمه‌ایِ باز/بستن است — پنل به‌طورِ پیش‌فرض بسته", () => {
    render(<BookletGrammarView />);
    const group = screen.getByRole("group", { name: "باز و بستن همهٔ موضوع‌ها" });
    // قراردادِ r227 پابرجا: داخلِ گروه فقط دو دکمه
    expect(
      within(group).getAllByRole("button").map((b) => (b.textContent ?? "").trim()),
    ).toEqual(["بازکردن همه", "بستن همه"]);
    const jump = screen.getByRole("button", { name: "فهرست پرش" });
    expect(jump.getAttribute("aria-expanded")).toBe("false");
    expect(jump.getAttribute("aria-controls")).toBe("bg-jump-index");
    expect(screen.queryByRole("group", { name: GRAMMAR_PANEL })).toBeNull();
  });

  it("پنلِ باز: ۳۲ چیپ با برچسبِ «پرش به موضوعِ N: عنوان» — هر موضوعِ آرایه سر جایش", () => {
    render(<BookletGrammarView />);
    fireEvent.click(screen.getByRole("button", { name: "فهرست پرش" }));
    const panel = screen.getByRole("group", { name: GRAMMAR_PANEL });
    const chips = within(panel).getAllByRole("button");
    expect(chips).toHaveLength(BOOKLET_GRAMMAR_TOPICS.length);
    expect(BOOKLET_GRAMMAR_TOPICS).toHaveLength(32);
    BOOKLET_GRAMMAR_TOPICS.forEach((t, i) => {
      expect(
        within(panel).getByRole("button", { name: `پرش به موضوعِ ${fa(i + 1)}: ${t.title}` }),
      ).toBeTruthy();
    });
    // سه سرصفحهٔ جزوه در پنل هست
    expect(panel.textContent).toContain(BOOKLET_GRAMMAR_SOURCES["دهم"]);
    expect(panel.textContent).toContain(BOOKLET_GRAMMAR_SOURCES["یازدهم"]);
    expect(panel.textContent).toContain(BOOKLET_GRAMMAR_SOURCES["دوازدهم"]);
  });

  it("نشانِ باز/بسته: چیپِ موضوعِ پیش‌باز data-open=true — مصدرِ بسته data-open=false؛ بازکردنِ همه همه را توپُر می‌کند", () => {
    render(<BookletGrammarView />);
    fireEvent.click(screen.getByRole("button", { name: "فهرست پرش" }));
    const panel = screen.getByRole("group", { name: GRAMMAR_PANEL });
    const firstChip = within(panel).getByRole("button", {
      name: `پرش به موضوعِ ۱: ${BOOKLET_GRAMMAR_TOPICS[0].title}`,
    });
    expect(firstChip.getAttribute("data-open")).toBe("true");
    const infChip = within(panel).getByRole("button", {
      name: "پرش به موضوعِ ۲۴: مصدر با to",
    });
    expect(infChip.getAttribute("data-open")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "بازکردن همه" }));
    const reopened = screen.getByRole("group", { name: GRAMMAR_PANEL });
    for (const chip of within(reopened).getAllByRole("button")) {
      expect(chip.getAttribute("data-open")).toBe("true");
    }
  });

  it("کلیکِ چیپِ مصدر: پنل بسته می‌شود، موضوعِ ۲۴ باز و به لنگرش اسکرول می‌شود — بدونِ چرخشِ استور", async () => {
    render(<BookletGrammarView />);
    fireEvent.click(screen.getByRole("button", { name: "فهرست پرش" }));
    fireEvent.click(
      within(screen.getByRole("group", { name: GRAMMAR_PANEL })).getByRole("button", {
        name: "پرش به موضوعِ ۲۴: مصدر با to",
      }),
    );
    // پنل بسته شد
    expect(screen.queryByRole("group", { name: GRAMMAR_PANEL })).toBeNull();
    // بدنهٔ مصدرِ دور حالا باز است — «کاربرد دوازدهم» بدونِ کلیکِ دستی دیدنی
    const inf = document.getElementById("bg-topic-bg-infinitive")!;
    expect(inf.querySelector('button[aria-expanded="true"]')).toBeTruthy();
    expect(inf.textContent).toContain("کاربرد دوازدهم");
    // اسکرولِ محلی — هیچ چرخشِ استوری
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1),
    );
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });
});

describe("jump-index-r228 — فهرستِ پرشِ جدول‌های «اجزای کلماتی»", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  const posTab = () => fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));

  it("دکمهٔ «فهرست جدول‌ها» بیرونِ گروهِ فیلتر است — پنلِ باز: ۱۰ چیپ از فهرستِ کامل", () => {
    render(<AppendixView />);
    posTab();
    const filterGroup = screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" });
    // قراردادِ r222/r227: داخلِ گروهِ فیلتر فقط ۴ دکمه
    expect(within(filterGroup).getAllByRole("button")).toHaveLength(4);
    const jump = screen.getByRole("button", { name: "فهرست جدول‌ها" });
    expect(jump.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(jump);
    const panel = screen.getByRole("group", { name: POS_PANEL });
    expect(jump.getAttribute("aria-expanded")).toBe("true");
    const chips = within(panel).getAllByRole("button");
    expect(chips).toHaveLength(10);
    expect(
      within(panel).getByRole("button", { name: "پرش به جدولِ ۱: دهم · درس اول" }),
    ).toBeTruthy();
    expect(
      within(panel).getByRole("button", { name: "پرش به جدولِ ۱۰: دوازدهم · درس سوم" }),
    ).toBeTruthy();
  });

  it("کلیکِ چیپِ جدولِ ۲: پنل بسته می‌شود + اسکرولِ محلی به لنگر — بدونِ چرخشِ استور", async () => {
    render(<AppendixView />);
    posTab();
    fireEvent.click(screen.getByRole("button", { name: "فهرست جدول‌ها" }));
    fireEvent.click(
      within(screen.getByRole("group", { name: POS_PANEL })).getByRole("button", {
        name: "پرش به جدولِ ۲: دهم · درس دوم",
      }),
    );
    expect(screen.queryByRole("group", { name: POS_PANEL })).toBeNull();
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1),
    );
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });

  it("هم‌راستاییِ فیلتر (قراردادِ r227): پنلِ «یازدهم» فقط ۳ چیپِ همان پایه را دارد", () => {
    render(<AppendixView />);
    posTab();
    fireEvent.click(
      within(screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" }))
        .getAllByRole("button")
        .find((b) => (b.textContent ?? "").startsWith("یازدهم")) as HTMLElement,
    );
    fireEvent.click(screen.getByRole("button", { name: "فهرست جدول‌ها" }));
    const panel = screen.getByRole("group", { name: POS_PANEL });
    const chips = within(panel).getAllByRole("button");
    expect(chips).toHaveLength(3);
    expect(
      within(panel).getByRole("button", { name: "پرش به جدولِ ۱: یازدهم · درس اول" }),
    ).toBeTruthy();
    expect(
      within(panel).getByRole("button", { name: "پرش به جدولِ ۳: یازدهم · درس سوم" }),
    ).toBeTruthy();
    // چیپِ خارجِ scope نیست
    expect(
      within(panel).queryByRole("button", { name: "پرش به جدولِ ۱: دهم · درس اول" }),
    ).toBeNull();
  });

  it("چیپ‌ها شمارشِ خانواده‌ها را می‌گویند — عینِ دادهٔ همان جدول", () => {
    render(<AppendixView />);
    posTab();
    fireEvent.click(screen.getByRole("button", { name: "فهرست جدول‌ها" }));
    const panel = screen.getByRole("group", { name: POS_PANEL });
    // شمارشِ خانوادهٔ جدولِ اول از خودِ داده — همان چیزی که چیپ می‌گوید
    const first = WORD_FAMILY_TABLES[0];
    const firstChip = within(panel).getByRole("button", { name: "پرش به جدولِ ۱: دهم · درس اول" });
    expect(firstChip.textContent).toContain(`${fa(first.families.length)} خانواده`);
    expect(panel.textContent).not.toContain("NaN");
  });
});
