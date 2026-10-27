// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۴ — لنزِ «کاربرددار» در دیکشنری + شمارندهٔ per-lesson
//
// بندِ ① پیشنهادِ ۲۵۳: فیلترِ وضعیتِ ششمِ دیکشنری — فقط واژه‌هایی که خودِ
// جزوه در مکالمه/ریدینگ استفاده‌شان کرده؛ همان تک‌منبعِ findWordUsages که
// چیپ‌ها و سرصفحه می‌خوانند، پس هر سه نما همیشه هم‌داستان‌اند.
// بندِ ③ پیشنهادِ ۲۵۳: در همین لنز، چیپِ هر درس شمارندهٔ کاربرددارِ همان
// درس را نشان می‌دهد («درس ۱ · ۱۳۰») — بی‌لنز، بی‌نویز مثلِ سابق.
//
// گاردهایِ این فایل:
//   ① چیپِ «کاربرددار» با شمارشِ خودسازگار (از خودِ داده، نه پینِ دستی)
//   ② لنز واقعاً فیلتر می‌کند: communication حاضر، broadcast غایب
//   ③ شمارندهٔ per-lesson فقط با لنز فعال می‌آید + titleِ توضیحی
//   ④ ترکیبِ لنز با فیلترِ درس: همهٔ کارت‌هایِ نمایان = همان درس + کاربرددار
//   ⑤ حالتِ خالیِ لنز با پیامِ اختصاصی + دکمهٔ بازنشانی به «همه»
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { findWordUsages } from "@/lib/word-usage";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";

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

const usedCards = (lessonId?: number) =>
  lessons
    .flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })))
    .filter((w) => (lessonId ? w.lessonId === lessonId : true) && findWordUsages(w.en).length > 0).length;

describe("لنزِ «کاربرددار» دیکشنری — r254", () => {
  it("① چیپِ کاربرددار با شمارشِ خودسازگار از خودِ داده حاضر است", () => {
    render(<DictionaryView />);
    const chip = screen.getByRole("button", { name: /کاربرددار/ });
    const expected = usedCards();
    expect(expected).toBeGreaterThan(0);
    expect(chip.textContent).toContain(faNum(expected));
    // زبانِ هم‌خوان با سرصفحه: این لنز یعنی «در متنِ جزوه آمده‌اند»
    expect(screen.getByTestId("usage-stat").textContent).toContain(faNum(expected));
  });

  it("② لنز واقعاً فیلتر می‌کند: کاربرددار حاضر، بی‌کاربرد غایب", () => {
    render(<DictionaryView />);
    expect(screen.getAllByText("broadcast").length).toBeGreaterThanOrEqual(1);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // communication کاربرددار است — کارتش با چیپِ «در جزوه» حاضر می‌ماند
    expect(screen.getAllByTestId("usage-chip-communication").length).toBeGreaterThanOrEqual(1);
    // broadcast هیچ کاربردی در متنِ جزوه ندارد — از لنز حذف می‌شود (هم‌نام‌هایش هم)
    expect(screen.queryAllByText("broadcast")).toHaveLength(0);
  });

  it("③ شمارندهٔ per-lesson فقط با لنزِ فعال می‌آید + titleِ توضیحی", () => {
    render(<DictionaryView />);
    const l1 = lessons[0];
    const expected = usedCards(l1.id);
    const chipOf = () => screen.getByRole("button", { name: /فهمیدن مردم/ });
    // بی‌لنز: چیپ تمیز — نه شمارنده، نه title
    expect(chipOf().textContent).not.toContain("·");
    expect(chipOf().getAttribute("title")).toBeNull();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // با لنز: «درس ۱: فهمیدن مردم · N» + titleِ کامل
    expect(chipOf().textContent).toContain(`· ${faNum(expected)}`);
    expect(chipOf().getAttribute("title")).toContain(`${faNum(expected)} از ${faNum(l1.vocabulary.length)}`);
  });

  it("④ ترکیبِ لنز با فیلترِ درس: فقط کارت‌هایِ همان درسِ کاربرددار", () => {
    render(<DictionaryView />);
    const l1 = lessons[0];
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /فهمیدن مردم/ }));
    });
    const expected = usedCards(l1.id);
    // «N واژه یافت شد» با شمارشِ مستقلِ تست یکی است
    const summary = screen.getByText(/واژه یافت شد/);
    expect(summary.textContent).toContain(faNum(expected));
    // و همهٔ چیپ‌هایِ نمایان به کارت‌هایِ کاربرددار تعلق دارند
    expect(screen.getAllByTestId(/^usage-chip-/).length).toBeGreaterThan(0);
  });

  it("⑤ حالتِ خالیِ لنز: پیامِ اختصاصی + بازنشانی به «همه»", () => {
    render(<DictionaryView />);
    const input = screen.getByPlaceholderText("مثلاً: language یا زبان...");
    act(() => {
      fireEvent.change(input, { target: { value: "broadcast" } });
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    expect(screen.getByText("واژه‌ای با این فیلترها یافت نشد")).toBeInTheDocument();
    expect(screen.getByText(/واژه‌های کاربرددار در مکالمه\/ریدینگِ جزوه زندگی می‌کنند/)).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "نمایش همهٔ واژه‌ها" }));
    });
    // بازنشانیِ فقط وضعیت — جست‌وجو می‌ماند و broadcast (همهٔ هم‌نام‌هایش) برمی‌گردد
    expect(screen.getAllByText("broadcast").length).toBeGreaterThanOrEqual(1);
  });
});
