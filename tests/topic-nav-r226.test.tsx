// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۶ — گاردهای «ناوبریِ پیوستهٔ موضوع‌ها» (چیپِ قبلی/بعدی + چیپِ
// موقعیتِ «X از Y» داخلِ کارت‌های ضمیمه — بندِ ② پیشنهادِ ۲۲۵):
//   ① ترتیبِ سراسری — کارتِ اول «قبلی» ندارد، کارتِ آخر «بعدی» ندارد؛
//      چیپِ موقعیت «<index> از ۳۲» در هر کارتِ بازِ ضمیمه
//   ② رفتارِ ناوبری — کلیکِ «بعدی» موضوعِ هدف را باز می‌کند و به لنگرش
//      می‌برد (scrollIntoView) — کاملاً محلی، بدونِ چرخشِ استور
//   ③ بسترِ درس — TopicCard بدونِ propsِ ناوبری، نوار را نمی‌بیند
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import BookletGrammarView, { TopicCard } from "@/components/study/lesson/booklet-grammar-view";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";

const AT = (i: number) => BOOKLET_GRAMMAR_TOPICS[i];
const LAST = BOOKLET_GRAMMAR_TOPICS.length - 1;

describe("topic-nav-r226 — ترتیبِ سراسری و چیپِ موقعیت در ضمیمه", () => {
  beforeAll(() => {
    // jsdom scrollIntoView ندارد — stub برای ادعای فراخوانیِ ناوبری
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear(); // راند ۲۳۱ — ایزوله‌سازی از جایگاهِ خواندنِ پایدار
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
  });

  it("کارتِ اول (پیش‌باز): «بعدی» دارد، «قبلی» ندارد، چیپِ «۱ از ۳۲»", () => {
    render(<BookletGrammarView />);
    expect(
      screen.getByRole("button", { name: `موضوعِ بعدی: ${AT(1).title}` }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /موضوعِ قبلی/ })).toBeNull();
    expect(screen.getByText("۱ از ۳۲")).toBeTruthy();
  });

  it("کلیکِ «بعدی»: موضوعِ دوم باز می‌شود و scrollIntoView می‌خورد — بدونِ چرخشِ استور", async () => {
    useStudy.setState({ view: { type: "appendix" } as never });
    render(<BookletGrammarView />);
    fireEvent.click(screen.getByRole("button", { name: `موضوعِ بعدی: ${AT(1).title}` }));
    const anchor = document.getElementById(`bg-topic-${AT(1).id}`)!;
    expect(anchor.querySelector("button[aria-expanded]")?.getAttribute("aria-expanded")).toBe("true");
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1),
    );
    // ناوبریِ محلی است — view دست‌نخورده
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });

  it("کارتِ آخر: «قبلی» دارد، «بعدی» ندارد، چیپِ «۳۲ از ۳۲» — (scope داخلِ لنگر؛ کارتِ اولِ پیش‌باز نوارِ خودش را دارد)", () => {
    render(<BookletGrammarView />);
    fireEvent.click(screen.getByText(AT(LAST).title));
    const last = within(document.getElementById(`bg-topic-${AT(LAST).id}`)!);
    expect(
      last.getByRole("button", { name: `موضوعِ قبلی: ${AT(LAST - 1).title}` }),
    ).toBeTruthy();
    expect(last.queryByRole("button", { name: /موضوعِ بعدی/ })).toBeNull();
    expect(last.getByText("۳۲ از ۳۲")).toBeTruthy();
  });

  it("هر کارتِ بازِ ضمیمه جایگاهِ خودش را نشان می‌دهد — مصدرِ تازهٔ r225: «۲۴ از ۳۲» (scope داخلِ لنگر)", () => {
    render(<BookletGrammarView />);
    fireEvent.click(screen.getByText("مصدر با to"));
    const inf = within(document.getElementById("bg-topic-bg-infinitive")!);
    expect(inf.getByText("۲۴ از ۳۲")).toBeTruthy();
    expect(
      inf.getByRole("button", { name: "موضوعِ قبلی: صفات فاعلی و مفعولی (-ed / -ing)" }),
    ).toBeTruthy();
    // همسایهٔ بعدیِ مصدر، اولین موضوعِ دوازدهم است — سدِ مرزیِ گروه‌ها
    expect(
      inf.getByRole("button", { name: `موضوعِ بعدی: ${AT(24).title}` }),
    ).toBeTruthy();
  });

  it("چیپِ «درسِ مرتبط» با دکمه‌های ناوبری تداخل ندارد (۱۶ چیپِ مرتبط مستقل)", () => {
    render(<BookletGrammarView />);
    // کارتِ اولِ پیش‌بازشده هم چیپِ مرتبط ندارد (بنیانِ دهم) و هم ناوبری دارد
    expect(screen.queryByRole("button", { name: /درسِ مرتبط/ })).toBeNull();
    expect(screen.getByRole("button", { name: /موضوعِ بعدی/ })).toBeTruthy();
  });
});

describe("topic-nav-r226 — بسترِ درس: بدونِ propsِ ناوبری، نوار رندر نمی‌شود", () => {
  beforeEach(cleanup);

  it("TopicCardِ تنها (مثلِ LinkedBookletTopics) نه نوار دارد نه چیپِ موقعیت", () => {
    render(
      <TopicCard
        topic={AT(0)}
        index={1}
        isOpen
        onToggle={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /موضوعِ (قبلی|بعدی)/ })).toBeNull();
    expect(screen.queryByText(/از ۳۲/)).toBeNull();
  });
});
