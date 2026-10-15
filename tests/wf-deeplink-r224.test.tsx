// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۴ — گاردهای «رفت‌وبرگشتِ اجزای کلماتی» (آینهٔ appendix-deeplink-r221
// برای لایهٔ واژگان — بندِ ① پیشنهادِ پایانیِ راند ۲۲۳):
//   ① داده — wordFamilyTableId پایدار و یکتا برای هر ۱۰ جدول؛ نقشهٔ معکوسِ
//      WF_TABLE_ID_TO_LESSON دقیقاً ۹ مدخل، مشتقِ وفادار از
//      WORD_FAMILY_LESSON_LINKS (رفت‌وبرگشتی) + صفرِ صادقانهٔ «درس چهارمِ دهم»
//   ② استور — openAppendixPosTable لنگرِ {appendix, posTableId} می‌گذارد و
//      openLessonTab بازگشتِ تبِ واژگان؛ setViewِ قدیمی بدونِ posTableId سالم
//   ③ لنگرِ عمیق در AppendixView — بازشدنِ مستقیم روی زیرتبِ pos + اسکرولِ
//      scrollIntoView + یک‌بارِ مصرف + شناسهٔ نامعتبر بی‌خطر (درسنامهٔ جامع)
//   ④ UI — دکمهٔ ↗ در بخشِ درس (کلیکِ مستقل از toggle)، چیپِ «درسِ مرتبط» در
//      هدرِ کارت‌های ضمیمه (۹ چیپ) و بی‌چیپیِ «درس چهارمِ دهم»
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

import AppendixView from "@/components/study/lesson/appendix-view";
import VocabTab from "@/components/study/lesson/vocab-tab";
import {
  WORD_FAMILY_LESSON_LINKS,
  WORD_FAMILY_TABLES,
  WF_TABLE_ID_TO_LESSON,
  wordFamilyTableId,
} from "@/data/word-families";
import { lessons } from "@/data";
import { useStudy } from "@/lib/study-store";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

// فیچرِ کمینه — همان الگویِ r223: id باید شناسهٔ واقعیِ درس باشد.
const fixture = (id: number) =>
  ({
    id,
    titleEn: `Lesson ${id}`,
    titleFa: `درس ${id}`,
    tagline: "",
    color: "rose",
    grade: lessons.find((l) => l.id === id)!.grade,
    vocabulary: [{ en: "sample", fa: "نمونه" }],
    conversation: { introEn: "", introFa: "", lines: [] },
    readings: [],
    grammar: [],
    synonyms: [],
    writing: [],
    quizzes: [],
  }) as unknown as LessonData;

describe("wf-deeplink-r224 — شناسهٔ جدول + نقشهٔ معکوس", () => {
  it("هر ۱۰ جدول شناسهٔ پایدارِ «wf-gNN-lN» دارد و هر ۱۰ یکتا هستند", () => {
    const ids = WORD_FAMILY_TABLES.map(wordFamilyTableId);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    for (const id of ids) expect(id).toMatch(/^wf-g1[012]-l[1-4]$/);
    // پین‌های اتکا — درس ↔ جدولِ همان پایه (شاهدِ «به ترتیبِ درس»)
    expect(wordFamilyTableId(WORD_FAMILY_LESSON_LINKS[1])).toBe("wf-g11-l1");
    expect(wordFamilyTableId(WORD_FAMILY_LESSON_LINKS[6])).toBe("wf-g12-l3");
    expect(wordFamilyTableId(WORD_FAMILY_LESSON_LINKS[7])).toBe("wf-g10-l1");
  });

  it("WF_TABLE_ID_TO_LESSON دقیقاً ۹ مدخل، رفت‌وبرگشتی با WORD_FAMILY_LESSON_LINKS", () => {
    expect(Object.keys(WF_TABLE_ID_TO_LESSON)).toHaveLength(9);
    for (const [lid, table] of Object.entries(WORD_FAMILY_LESSON_LINKS)) {
      expect(WF_TABLE_ID_TO_LESSON[wordFamilyTableId(table)]).toBe(Number(lid));
    }
    for (const v of Object.values(WF_TABLE_ID_TO_LESSON)) {
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9]).toContain(v);
    }
  });

  it("صفرِ صادقانه — «درس چهارمِ دهم» در برنامهٔ درسی جای ندارد (بیرونِ نقشه)", () => {
    const g10Tables = WORD_FAMILY_TABLES.filter((t) => t.grade === "دهم");
    expect(g10Tables).toHaveLength(4);
    const fourth = g10Tables.find((t) => t.lesson === "درس چهارم")!;
    expect(wordFamilyTableId(fourth)).toBe("wf-g10-l4");
    expect(WF_TABLE_ID_TO_LESSON["wf-g10-l4"]).toBeUndefined();
  });
});

describe("wf-deeplink-r224 — استورِ ناوبری", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ view: { type: "home" } as never, lessonTab: "vocab" });
  });

  it("openAppendixPosTable لنگر می‌گذارد؛ openLessonTab بازگشتِ واژگان — چرخهٔ کامل", () => {
    useStudy.getState().openAppendixPosTable("wf-g11-l1");
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      posTableId: "wf-g11-l1",
    });
    expect(useStudy.getState().flashIntent).toBe("none");
    useStudy.getState().openLessonTab(1, "vocab");
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
    expect(useStudy.getState().lessonTab).toBe("vocab");
  });

  it("setViewِ قدیمی و لنگرِ topicId بدونِ posTableId سالم‌اند (سازگاریِ هدر/پالت/r221)", () => {
    useStudy.getState().setView({ type: "appendix" });
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
    useStudy.getState().openAppendixTopic("bg-quantifiers");
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      topicId: "bg-quantifiers",
    });
  });
});

describe("wf-deeplink-r224 — لنگرِ عمیق در AppendixView", () => {
  beforeAll(() => {
    // jsdom scrollIntoView ندارد — stub برای ادعای فراخوانی
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
  });

  it("لنگرِ معتبر: ضمیمه مستقیم روی زیرتبِ pos باز می‌شود و جدولِ هدف لنگرِ DOM دارد", async () => {
    render(<AppendixView posTableId="wf-g11-l1" />);
    // روی pos هستیم — چیپِ سکشن رندر شده و کارتِ هدفِ «درس اولِ یازدهم» لنگر دارد
    // (عنوانِ «درس اول» در هر سه پایه تکرار می‌شود — پرس‌وجو داخلِ لنگرِ هدف)
    expect(
      screen.getByText("خانوادهٔ واژه‌ها از خودِ جزوه‌ها (اجزای کلماتی)"),
    ).toBeTruthy();
    const anchor = document.getElementById("wf-table-wf-g11-l1");
    expect(anchor).toBeTruthy();
    expect(anchor!.textContent).toContain("اجزای کلماتیِ درس اول");
    expect(anchor!.textContent).toContain("Vision Two");
    // اسکرولِ تمرکز یک‌بار + یک‌بارِ مصرف (لنگر پاک می‌شود — پرشِ تکراری نداریم)
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1),
    );
  });

  it("بدونِ لنگر: رفتارِ سابق — درسنامهٔ جامع پیش‌فرض است و اسکرولِ pos خاموش", () => {
    render(<AppendixView />);
    expect(
      screen.getByText(/درسنامهٔ جامع — از خودِ جزوه‌های جامع/),
    ).toBeTruthy();
    expect(
      screen.queryByText("خانوادهٔ واژه‌ها از خودِ جزوه‌ها (اجزای کلماتی)"),
    ).toBeNull();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("لنگرِ نامعتبر بی‌خطر است: درسنامهٔ جامع پیش‌فرض، بدونِ اسکرولِ pos", () => {
    render(<AppendixView posTableId="wf-g99-l9" />);
    expect(
      screen.queryByText("خانوادهٔ واژه‌ها از خودِ جزوه‌ها (اجزای کلماتی)"),
    ).toBeNull();
    expect(document.getElementById("wf-table-wf-g99-l9")).toBeNull();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});

describe("wf-deeplink-r224 — دکمهٔ ↗ و چیپِ «درسِ مرتبط»", () => {
  beforeEach(cleanup);

  it("دکمهٔ ↗ (درس → ضمیمه): استور لنگرِ pos می‌گیرد و toggle مستقل می‌ماند", () => {
    useStudy.setState({ view: { type: "lesson", id: 1 } as never });
    render(<VocabTab lesson={fixture(1)} />);
    const jump = screen.getByRole("button", {
      name: "نمایشِ «اجزای کلماتیِ درس اول» در ضمیمه",
    });
    fireEvent.click(jump);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      posTableId: "wf-g11-l1",
    });
    // بخش هنوز بسته است — پرش مستقل از toggle بود
    expect(screen.queryByText("اجزای کلماتیِ درس اول")).toBeNull();
  });

  it("چیپِ «درسِ مرتبط» در ضمیمه: کلیکش مسیرِ برگشتِ تبِ واژگان است", () => {
    useStudy.setState({ view: { type: "appendix" } as never });
    render(<AppendixView />);
    fireEvent.click(screen.getByText("اجزای کلام")); // زیرتبِ pos
    const chip = screen.getByRole("button", { name: /درسِ مرتبط: درسِ ۷/ });
    fireEvent.click(chip);
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 7 });
    expect(useStudy.getState().lessonTab).toBe("vocab");
  });

  it("در کلِ ضمیمه دقیقاً ۹ چیپِ «درسِ مرتبط» هست و «درس چهارمِ دهم» بی‌چیپ می‌ماند", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByText("اجزای کلام"));
    const chips = screen.getAllByRole("button", { name: /درسِ مرتبط/ });
    expect(chips).toHaveLength(9);
    const fourth = document.getElementById("wf-table-wf-g10-l4");
    expect(fourth).toBeTruthy();
    expect(fourth!.textContent).not.toContain("درسِ مرتبط");
  });
});
