// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۲ — گاردهای «فهرست درس‌ها» (پرشِ میانِ درس‌ها از سرصفحهٔ درس):
//   ① دکمه با aria-expanded/aria-controls و پنلِ بسته به‌صورت پیش‌فرض
//   ② ساختارِ پنل عینِ دادهٔ منجمد: ۶ گروهِ پایه (۳/۳/۳/۱/۱/۱)، ۱۲ چیپ
//      در ترتیبِ قفسهٔ کتاب، نشانِ «۱۲» روی خودِ دکمه
//   ③ چیپِ درسِ فعلی صادق: aria-current + disabled + عنوانِ «درسِ فعلی»
//   ④ کلیکِ چیپ = openLesson + بستنِ پنل — ناوبریِ واقعیِ دید
//   ⑤ مربعِ شمارهٔ هر چیپ هم‌رنگِ عصبِ همان درس در قفسهٔ کتاب (chipBg)
//   ⑥ صفرِ نوشتنِ جانبی در استورِ یادگیری — openLesson فقط view را می‌کند
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import LessonJumpIndex, { gradeGroupsOf } from "@/components/study/lesson/lesson-jump-index";
import { useStudy } from "@/lib/study-store";
import { LESSONS_META } from "@/data/lesson-meta";
import { themeOf } from "@/lib/study-theme";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

function resetStore(currentId: number) {
  useStudy.setState({
    view: { type: "lesson", id: currentId },
    lessonTab: "vocab",
    known: {},
    results: {},
    flashIntent: "none",
  } as Partial<ReturnType<typeof useStudy.getState>>);
}

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: /فهرست درس‌ها/ }));
}

beforeEach(() => {
  localStorage.clear();
  resetStore(1);
  cleanup();
});

describe("lesson jump index (r232)", () => {
  it("button is ARIA-wired and the panel is closed by default, opens on click", () => {
    render(<LessonJumpIndex currentId={1} />);
    const btn = screen.getByRole("button", { name: /فهرست درس‌ها/ });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAttribute("aria-controls", "lesson-jump-index");
    expect(screen.queryByRole("group", { name: "فهرست پرش درس‌ها" })).not.toBeInTheDocument();
    // نشانِ شمارش روی خودِ دکمه — دوازده درس
    expect(btn.textContent).toContain("۱۲");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "فهرست پرش درس‌ها" })).toBeInTheDocument();
  });

  it("panel structure is pinned from frozen data: 6 grade groups 3/3/3/1/1/1, 12 chips in bookshelf order", () => {
    const groups = gradeGroupsOf(LESSONS_META);
    expect(groups.map((g) => g.grade)).toEqual(["یازدهم", "دوازدهم", "دهم", "هفتم", "هشتم", "نهم"]);
    expect(groups.map((g) => g.lessons.length)).toEqual([3, 3, 3, 1, 1, 1]);

    render(<LessonJumpIndex currentId={1} />);
    openPanel();
    const panel = screen.getByRole("group", { name: "فهرست پرش درس‌ها" });
    // سرصفحهٔ هر پایه: نامِ پایه + شمارشِ فارسی
    expect(panel.textContent).toContain("پایهٔ یازدهم");
    expect(panel.textContent).toContain("۳ درس");
    expect(panel.textContent).toContain("پایهٔ هفتم");
    expect(panel.textContent).toContain("۱ درس");
    // ۱۲ چیپ در ترتیبِ شناسهٔ قفسهٔ کتاب — دنبالهٔ عنوان‌های انگلیسی
    const jumpChips = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.startsWith("پرش به درس") || b.getAttribute("aria-label")?.startsWith("درسِ فعلی"));
    expect(jumpChips).toHaveLength(LESSONS_META.length);
    for (let i = 0; i < LESSONS_META.length; i++) {
      expect(jumpChips[i].textContent).toContain(LESSONS_META[i].titleEn);
    }
  });

  it("current lesson chip is honest: aria-current + disabled with the «درسِ فعلی» label, others enabled", () => {
    render(<LessonJumpIndex currentId={1} />);
    openPanel();
    const current = screen.getByRole("button", { name: /درسِ فعلی: درس اول/ });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toBeDisabled();
    expect(current.textContent).toContain("Understanding People");
    // بقیه فعال‌اند — پرش‌پذیر
    const others = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.startsWith("پرش به درس"));
    expect(others).toHaveLength(LESSONS_META.length - 1);
    for (const b of others) expect(b).toBeEnabled();
  });

  it("clicking another lesson's chip navigates via openLesson and closes the panel", () => {
    render(<LessonJumpIndex currentId={1} />);
    openPanel();
    const before = useStudy.getState();
    const knownSnapshot = JSON.stringify(before.known);
    const resultsSnapshot = JSON.stringify(before.results);
    fireEvent.click(screen.getByRole("button", { name: /پرش به درس دوم/ }));
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 2 });
    // پنل بسته شد
    expect(screen.queryByRole("group", { name: "فهرست پرش درس‌ها" })).not.toBeInTheDocument();
    // صفرِ نوشتنِ جانبی — known و results دست‌نخورده
    expect(JSON.stringify(useStudy.getState().known)).toBe(knownSnapshot);
    expect(JSON.stringify(useStudy.getState().results)).toBe(resultsSnapshot);
  });

  it("each chip's number square wears its bookshelf spine color (theme chipBg)", () => {
    render(<LessonJumpIndex currentId={1} />);
    openPanel();
    // درس ۱ زمردی و درس ۲ کهربایی — عینِ رنگِ عصبِ قفسه
    const l1 = screen.getByRole("button", { name: /درسِ فعلی: درس اول/ });
    expect(l1.querySelector("span")?.className).toContain("bg-violet-600"); // فعلی: توپُرِ بنفش
    const l2 = screen.getByRole("button", { name: /پرش به درس دوم/ });
    expect(l2.querySelector("span")?.className).toContain(themeOf(LESSONS_META[1].color).chipBg.split(" ")[0]);
    const l4 = screen.getByRole("button", { name: /پرش به درس چهارم/ });
    expect(l4.querySelector("span")?.className).toContain(themeOf(LESSONS_META[3].color).chipBg.split(" ")[0]);
  });
});
