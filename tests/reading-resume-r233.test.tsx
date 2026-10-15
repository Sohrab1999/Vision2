// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۳ — گاردهای «ادامهٔ مطالعه» + درصدِ چیپ‌های «فهرست درس‌ها»:
//   A. رکوردِ نشانگرِ آخرین موضوع (bg-reading):
//     ① رفت‌وبرگشتِ کاملِ رکوردِ خودکفا (id/title/page/source)
//     ② نوشتنِ نامعتبر و خواندنِ شکل‌های خراب = null — هیچ ساختگی
//   B. کارتِ «ضمیمهٔ کتاب» در خانه:
//     ③ با رکورد: خطِ «ادامه از …» + کلیک = پرشِ عمیقِ r221
//     ④ بی‌رکورد: کارت مثلِ سابق + کلیک = ضمیمهٔ ساده
//   C. درصدِ چیپ‌ها:
//     ⑤ درسِ با واژهٔ بلد = نشانِ «٪»؛ درسِ صفر = هیچ عددی
//   D. نوشتنِ نشانگر از خودِ درسنامه (toggle-open / پرش) — یکپارچه
//   E. صفرِ نوشتنِ جانبی در استورِ یادگیری
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomeTools from "@/components/study/home/home-tools";
import LessonJumpIndex from "@/components/study/lesson/lesson-jump-index";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import { writeBgLastTopic, readBgLastTopic } from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { LESSONS_META } from "@/data/lesson-meta";
import { wordKey } from "@/state/progress";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

// IntersectionObserver برای whileInView (فریمرموشنِ خانه/درسنامه)
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
}

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    flashIntent: "none",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("bg-reading bookmark record (r233)", () => {
  it("round-trips the self-contained record (id/title/page/source)", () => {
    expect(readBgLastTopic()).toBeNull(); // بازدیدِ اول: هیچ رکوردی
    writeBgLastTopic({
      id: "bg-verb-to-be",
      title: "فعل to be",
      page: "صفحهٔ ۲۴",
      source: "دهم",
    });
    const rec = readBgLastTopic();
    expect(rec).toEqual({
      id: "bg-verb-to-be",
      title: "فعل to be",
      page: "صفحهٔ ۲۴",
      source: "دهم",
    });
  });

  it("defensive reads: malformed JSON, partial and non-string shapes are all null", () => {
    localStorage.setItem("vision2-bg-last-topic", "{not json");
    expect(readBgLastTopic()).toBeNull();
    localStorage.setItem("vision2-bg-last-topic", JSON.stringify({ id: "x" })); // بی‌عنوان
    expect(readBgLastTopic()).toBeNull();
    localStorage.setItem("vision2-bg-last-topic", JSON.stringify({ id: 42, title: "t" })); // شناسهٔ غیررشته‌ای
    expect(readBgLastTopic()).toBeNull();
    localStorage.setItem("vision2-bg-last-topic", JSON.stringify({ id: "x", title: 7 })); // عنوانِ غیررشته‌ای
    expect(readBgLastTopic()).toBeNull();
    localStorage.setItem("vision2-bg-last-topic", JSON.stringify(["bg-verb-to-be"])); // آرایه
    expect(readBgLastTopic()).toBeNull();
    // page/sourceِ غیررشته‌ای کنارِ رکوردِ سالم دور ریخته می‌شوند نه کلِ رکورد
    localStorage.setItem(
      "vision2-bg-last-topic",
      JSON.stringify({ id: "bg-articles", title: "حروف تعریف", page: 22, source: null }),
    );
    expect(readBgLastTopic()).toEqual({ id: "bg-articles", title: "حروف تعریف" });
  });
});

describe("home appendix card resume (r233)", () => {
  it("with a bookmark: shows the «ادامه از …» line and clicking deep-links via openAppendixTopic", () => {
    writeBgLastTopic({
      id: "bg-verb-to-be",
      title: "فعل to be",
      page: "صفحهٔ ۲۴",
      source: "دهم",
    });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card.textContent).toContain("ادامه از «فعل to be»");
    expect(card.textContent).toContain("صفحهٔ ۲۴");
    expect(card.getAttribute("title")).toContain("ادامهٔ مطالعه از «فعل to be»");
    fireEvent.click(card);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      topicId: "bg-verb-to-be",
    });
  });

  it("without a bookmark: the card is verbatim and opens the plain appendix", () => {
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card.textContent).not.toContain("ادامه از");
    expect(card.getAttribute("title")).toBeNull();
    fireEvent.click(card);
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });
});

describe("lesson jump chips percent (r233)", () => {
  it("chips of lessons with known words show a percent; untouched lessons stay clean", async () => {
    // درس ۱: ۳ واژه از ۲۰۴ = ۱٪؛ بقیه صفر
    useStudy.setState({
      known: {
        [wordKey(1, "ability")]: true,
        [wordKey(1, "access")]: true,
        [wordKey(1, "action")]: true,
      } as Record<string, boolean>,
    } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<LessonJumpIndex currentId={1} />);
    fireEvent.click(screen.getByRole("button", { name: /فهرست درس‌ها/ }));
    const panel = screen.getByRole("group", { name: "فهرست پرش درس‌ها" });
    await waitFor(() => {
      expect(panel.textContent).toContain("۱٪");
    });
    // فقط درسِ ۱ درصد دارد — بقیهٔ درس‌هایِ صفر بی‌عددند (صداقت)
    const chipsWithPercent = panel.querySelectorAll("button span.text-\\[10px\\]");
    expect(chipsWithPercent).toHaveLength(1);
    expect(chipsWithPercent[0].textContent).toBe("۱٪");
    expect(chipsWithPercent[0].getAttribute("title")).toContain("۳ از ۲۰۴ واژهٔ این درس بلدی");
  });
});

describe("bookmark is written by the grammar view itself (r233)", () => {
  it("toggling a topic open writes the bookmark; closing does not change it", async () => {
    render(<BookletGrammarView />);
    // موضوعِ ۱ پیش‌باز است — بازکردنِ موضوعِ ۲ با toggle (سرفصلِ کارتِ بسته).
    // آموزشِ در-مسیر: textContentِ دکمهٔ سرفصل بدونِ فاصله می‌چسبد
    // («۲ضمایر فاعلیSubject Pronounsصفحهٔ ۲۲») — لنگر با پیشوندِ شماره پین می‌شود.
    const topic2 = screen.getByRole("button", { name: /^۲ضمایر فاعلی/ });
    fireEvent.click(topic2);
    await waitFor(() => {
      const rec = readBgLastTopic();
      expect(rec?.id).toBe("bg-subject-pronouns");
      expect(rec?.title).toBe("ضمایر فاعلی");
    });
    // بستنِ همان موضوع نشانگر را عوض نمی‌کند — «آخرین دیده‌شده» می‌ماند
    fireEvent.click(topic2);
    expect(readBgLastTopic()?.id).toBe("bg-subject-pronouns");
    // صفرِ نوشتنِ جانبی در استورِ یادگیری
    expect(useStudy.getState().known).toEqual({});
    expect(useStudy.getState().results).toEqual({});
  }, 20000);
});
