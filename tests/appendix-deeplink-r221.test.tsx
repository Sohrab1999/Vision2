// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۱ — گاردهای «رفت‌وبرگشتِ درسنامه ↔ ضمیمه»:
//   ① نقشهٔ معکوسِ BG_TOPIC_TO_LESSON — دقیقاً ۱۵ مدخل، مشتقِ وفادار از
//      LESSON_BG_LINKS (رفت‌وبرگشتی)، پین‌های اتکا، بنیان‌های دهم بیرونِ نقشه
//   ② استور — openAppendixTopic لنگرِ {appendix, topicId} می‌گذارد و
//      openLessonTab بازگشتِ تبِ گرامر؛ چرخهٔ کاملِ رفت‌وبرگشت
//   ③ لنگرِ عمیق در BookletGrammarView — پیش‌بازشدنِ کارت + اسکرولِ
//      scrollIntoView + یک‌بارِ مصرف (onFocusDone) + شناسهٔ نامعتبر بی‌خطر
//   ④ UI — دکمهٔ ↗ روی کارت‌های درس، چیپِ «درسِ مرتبط» روی کارت‌های ضمیمه،
//      و صفرِ صادقانه: ۱۵ چیپ در کلِ ضمیمه، بنیان‌های دهم بی‌چیپ
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

import BookletGrammarView, {
  TopicCard,
} from "@/components/study/lesson/booklet-grammar-view";
import {
  BG_TOPIC_TO_LESSON,
  BOOKLET_GRAMMAR_TOPICS,
  LESSON_BG_LINKS,
} from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";

const TOPIC = (id: string) => {
  const t = BOOKLET_GRAMMAR_TOPICS.find((x) => x.id === id);
  expect(t, `topic ${id} باید موجود باشد`).toBeTruthy();
  return t!;
};

describe("appendix-deeplink-r221 — نقشهٔ معکوسِ BG_TOPIC_TO_LESSON", () => {
  it("دقیقاً ۱۵ مدخل با پین‌های اتکا (خروجیِ مشتق — نه دستی)", () => {
    expect(Object.keys(BG_TOPIC_TO_LESSON)).toHaveLength(15);
    // یازدهم — آزمون‌های تشخیصیِ خودِ جزوه (ص۲۹/۶۳/۱۰۰)
    expect(BG_TOPIC_TO_LESSON["bg-quantifiers"]).toBe(1);
    expect(BG_TOPIC_TO_LESSON["bg-numbers"]).toBe(1);
    expect(BG_TOPIC_TO_LESSON["bg-present-perfect"]).toBe(2);
    expect(BG_TOPIC_TO_LESSON["bg-phrasal-verbs"]).toBe(2);
    expect(BG_TOPIC_TO_LESSON["bg-gerund"]).toBe(2);
    expect(BG_TOPIC_TO_LESSON["bg-first-conditional"]).toBe(3);
    expect(BG_TOPIC_TO_LESSON["bg-ed-ing-adjectives"]).toBe(3);
    // دوازدهم — ارجاع‌های درون‌متنی + بازه‌های تدریس (ص۲۶-۴۶/ص۷۹-۹۵/ص۱۳۷-۱۵۱)
    expect(BG_TOPIC_TO_LESSON["bg-passive"]).toBe(4);
    expect(BG_TOPIC_TO_LESSON["bg-passive-tenses"]).toBe(4);
    expect(BG_TOPIC_TO_LESSON["bg-tag-questions"]).toBe(4);
    expect(BG_TOPIC_TO_LESSON["bg-conjunctions"]).toBe(4);
    expect(BG_TOPIC_TO_LESSON["bg-relative-pronouns"]).toBe(5);
    expect(BG_TOPIC_TO_LESSON["bg-conditional-type-2"]).toBe(5);
    expect(BG_TOPIC_TO_LESSON["bg-past-perfect"]).toBe(6);
    expect(BG_TOPIC_TO_LESSON["bg-past-modals"]).toBe(6);
    // هیچ مدخلی بیرونِ درس‌های پیونددار نیست
    for (const v of Object.values(BG_TOPIC_TO_LESSON)) {
      expect([1, 2, 3, 4, 5, 6]).toContain(v);
    }
  });

  it("هم‌خوانیِ رفت‌وبرگشتی با LESSON_BG_LINKS + کلیدها شناسهٔ واقعی‌اند", () => {
    const linkEntries = Object.entries(LESSON_BG_LINKS).flatMap(([lid, tids]) =>
      tids.map((tid) => [tid, Number(lid)] as const),
    );
    expect(linkEntries).toHaveLength(15);
    for (const [tid, lid] of linkEntries) {
      expect(
        BG_TOPIC_TO_LESSON[tid],
        `BG_TOPIC_TO_LESSON[${tid}] باید ${lid} باشد`,
      ).toBe(lid);
    }
    for (const tid of Object.keys(BG_TOPIC_TO_LESSON)) {
      expect(BOOKLET_GRAMMAR_TOPICS.some((t) => t.id === tid)).toBe(true);
    }
  });

  it("صفرِ صادقانه — بنیان‌های دهم (۱۶ موضوع) هیچ درسی ندارند", () => {
    const g10 = BOOKLET_GRAMMAR_TOPICS.filter((t) => t.source === "دهم");
    expect(g10).toHaveLength(16);
    for (const t of g10) {
      expect(BG_TOPIC_TO_LESSON[t.id]).toBeUndefined();
    }
  });
});

describe("appendix-deeplink-r221 — استورِ ناوبری", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ view: { type: "home" } as never, lessonTab: "vocab" });
  });

  it("openAppendixTopic لنگر می‌گذارد؛ openLessonTab بازگشتِ گرامر — چرخهٔ کامل", () => {
    // رفت: از درس ۱ → ضمیمه با لنگرِ موضوعِ کمّی‌ها
    useStudy.getState().openAppendixTopic("bg-quantifiers");
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      topicId: "bg-quantifiers",
    });
    expect(useStudy.getState().flashIntent).toBe("none");
    // برگشت: از ضمیمه → درسِ ۱ روی تبِ گرامر
    useStudy.getState().openLessonTab(1, "grammar");
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
    expect(useStudy.getState().lessonTab).toBe("grammar");
  });

  it("setViewِ قدیمی بدونِ topicId هنوز معتبر است (سازگاریِ هدر/پالت)", () => {
    useStudy.getState().setView({ type: "appendix" });
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });
});

describe("appendix-deeplink-r221 — لنگرِ عمیق در BookletGrammarView", () => {
  beforeAll(() => {
    // jsdom scrollIntoView ندارد — stub برای ادعای فراخوانی
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
  });

  it("لنگرِ معتبر: کارت پیش از کلیک باز است، لنگرِ DOM دارد و scrollIntoView یک‌بار خورده", async () => {
    const onFocusDone = vi.fn();
    render(
      <BookletGrammarView focusTopicId="bg-past-modals" onFocusDone={onFocusDone} />,
    );
    // پیش‌بازشده — مقدمهٔ «افعال ناقصِ گذشته» بدونِ هیچ کلیکی رندر شده
    expect(
      screen.getByText(/have \+ p\.p\. آمده باشد، به «زمان گذشته» اشاره دارد/),
    ).toBeTruthy();
    // لنگرِ اسکرول
    const anchor = document.getElementById("bg-topic-bg-past-modals");
    expect(anchor).toBeTruthy();
    // اسکرولِ تمرکز یک‌بار + تحویلِ «انجام شد» به والد
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1));
    expect(onFocusDone).toHaveBeenCalledTimes(1);
  });

  it("بدونِ لنگر: رفتارِ سابق — فقط موضوعِ اول باز و اسکریپتِ اسکرول خاموش", () => {
    render(<BookletGrammarView />);
    expect(
      screen.getByText(/با چیدن حروف کنار هم/),
    ).toBeTruthy(); // اولین موضوعِ دهم باز است
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("لنگرِ نامعتبر بی‌خطر است: بدونِ پیش‌بازشدنِ جزئی و با اعلامِ «انجام شد»", () => {
    const onFocusDone = vi.fn();
    render(<BookletGrammarView focusTopicId="bg-no-such-topic" onFocusDone={onFocusDone} />);
    expect(document.getElementById("bg-topic-bg-no-such-topic")).toBeNull();
    expect(onFocusDone).toHaveBeenCalledTimes(1);
  });
});

describe("appendix-deeplink-r221 — دکمهٔ ↗ و چیپِ «درسِ مرتبط»", () => {
  beforeEach(cleanup);

  it("دکمهٔ ↗ (درس → ضمیمه): aria-label با عنوانِ موضوع و کلیکِ مستقل از toggle", () => {
    const onOpenInAppendix = vi.fn();
    const onToggle = vi.fn();
    const topic = TOPIC("bg-quantifiers");
    render(
      <TopicCard
        topic={topic}
        index={17}
        isOpen={false}
        onToggle={onToggle}
        onOpenInAppendix={onOpenInAppendix}
      />,
    );
    const jump = screen.getByRole("button", {
      name: `نمایشِ «${topic.title}» در ضمیمه`,
    });
    fireEvent.click(jump);
    expect(onOpenInAppendix).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
    // toggle هنوز سرِ جای خودش است
    fireEvent.click(screen.getByText(topic.title));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("چیپِ «درسِ مرتبط» (ضمیمه → درس): کلیکش مسیرِ برگشت است", () => {
    const onOpenLesson = vi.fn();
    render(
      <TopicCard
        topic={TOPIC("bg-past-modals")}
        index={31}
        isOpen
        onToggle={vi.fn()}
        relatedLesson={6}
        onOpenLesson={onOpenLesson}
      />,
    );
    const chip = screen.getByRole("button", { name: /درسِ مرتبط: درسِ ۶/ });
    fireEvent.click(chip);
    expect(onOpenLesson).toHaveBeenCalledTimes(1);
  });

  it("صفرِ صادقانه در UI: موضوعِ بی‌پیوند (بنیانِ دهم) نه ↗ می‌خواهد نه چیپِ درس", () => {
    render(
      <TopicCard
        topic={TOPIC("bg-alphabet-word-sentence")}
        index={1}
        isOpen
        onToggle={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /در ضمیمه/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /درسِ مرتبط/ })).toBeNull();
  });

  it("در کلِ ضمیمه دقیقاً ۱۵ چیپِ «درسِ مرتبط» هست (۱۵ پیوندِ ۲۲۰ → ۱۵ چیپِ ۲۲۱)", () => {
    render(<BookletGrammarView />);
    // چیپ داخلِ بدنهٔ آکاردئون است — اول هر ۱۵ کارتِ پیونددار را باز می‌کنیم
    for (const tids of Object.values(LESSON_BG_LINKS)) {
      for (const tid of tids) {
        fireEvent.click(screen.getByText(TOPIC(tid).title));
      }
    }
    const chips = screen.getAllByRole("button", { name: /درسِ مرتبط/ });
    expect(chips).toHaveLength(15);
    // و کارتِ بی‌پیوندِ بازشدهٔ اول، بی‌چیپ مانده
    expect(
      document.getElementById("bg-topic-bg-alphabet-word-sentence")!.textContent,
    ).not.toContain("درسِ مرتبط");
  }, 30000); // بازکردنِ ۱۵ کارت با کلِ دریل‌ها — سنگین‌تر از timeoutِ پیش‌فرض
});
