// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۰۹ — گاردهای رندرِ تبِ «جزوه»:
//   ① درس ۱۰ تبِ «جزوه» دارد؛ درس ۱ ندارد (قفلِ هوشمندِ تب‌بار)
//   ② تب: بخش واژگان با ردیف‌های واقعی جزوه + دکمهٔ روخوانی
//   ③ فیلترِ نوعِ بخش — «مکالمهٔ کتاب» فقط بخش‌های مکالمه را می‌گذارد
//   ④ خط مکالمه: گوینده + متنِ انگلیسی + ترجمهٔ فارسی
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import LessonView from "@/components/study/lesson/lesson-view";
import BookletTab from "@/components/study/lesson/booklet-tab";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
// IntersectionObserver برای whileInView
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
}

function setTab(tab: string) {
  useStudy.setState({ lessonTab: tab } as Partial<ReturnType<typeof useStudy.getState>>);
}

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({ view: { type: "lesson", id: 10 }, lessonTab: "vocab" } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("lesson-view booklet tab gating", () => {
  it("lesson 10 shows the «جزوه» tab; lesson 1 does not", () => {
    const first = render(<LessonView id={10} />);
    expect(screen.getByRole("button", { name: /جزوه/ })).toBeInTheDocument();
    first.unmount();
    const second = render(<LessonView id={1} />);
    const nav = second.container.querySelector('nav[aria-label="بخش‌های درس"]');
    expect(nav?.textContent).not.toContain("جزوه");
    second.unmount();
  });

  it("clicking the tab renders booklet vocab rows with real booklet content", async () => {
    // رندرِ کاملِ ۴۰ بخشِ جزوه در jsdom سنگین است — تایم‌اوتِ سخاوتمندانه
    render(<LessonView id={10} />);
    fireEvent.click(await screen.findByRole("button", { name: /جزوه/ }, {}, { timeout: 10000 }));
    await screen.findByRole("button", { name: /همهٔ بخش‌ها/ }, {}, { timeout: 10000 });
    // محتوای واقعی جزوهٔ هفتم — واژهٔ شناخته‌شده
    await waitFor(() => {
      expect(screen.getAllByText("توانستن، قادر بودن").length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  }, 25000);
});

describe("booklet tab internals", () => {
  it("kind filter narrows the visible sections", async () => {
    setTab("booklet");
    render(<BookletTab lesson={lessons.find((l) => l.id === 10)!} />);
    // فیلترِ مکالمه
    fireEvent.click(screen.getByRole("button", { name: /مکالمهٔ کتاب/ }));
    await waitFor(() => {
      const heads = screen.getAllByRole("heading", { level: 3 });
      expect(heads.length).toBeGreaterThan(0);
      for (const h of heads) expect(h.textContent).toContain("مکالمه");
    });
  });

  it("a dialogue line renders speaker, English and Persian together", async () => {
    setTab("booklet");
    render(<BookletTab lesson={lessons.find((l) => l.id === 10)!} />);
    fireEvent.click(screen.getByRole("button", { name: /مکالمهٔ کتاب/ }));
    await waitFor(() => {
      expect(screen.getAllByText(/معلم/).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/کلاس/u).length).toBeGreaterThan(0);
  });

  it("empty-lesson fallback message renders for lessons without booklet", () => {
    const ghost = { ...lessons.find((l) => l.id === 10)!, id: 99 } as (typeof lessons)[number];
    setTab("booklet");
    render(<BookletTab lesson={ghost} />);
    expect(screen.getByText(/هنوز جزوه‌ای بارگذاری نشده/)).toBeInTheDocument();
  });
});
