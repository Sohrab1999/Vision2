// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۳ — دو بندِ نقشهٔ ۲۲۲:
//   ① پیوندِ جدول‌های «اجزای کلماتی» به درس‌های برنامه
//     (WORD_FAMILY_LESSON_LINKS — ادامهٔ LESSON_BG_LINKSِ راند ۲۲۰ برای
//     لایهٔ واژگان): درسِ Nامِ هر پایه جدولِ «درس Nام» همان پایه را می‌گیرد؛
//     درس‌های ۱-۳ = یازدهم، ۴-۶ = دوازدهم، ۷-۹ = دهم؛ جدولِ «درس چهارمِ
//     دهم» و درس‌های ۱۰-۱۲ صفرِ صادقانه.
//   ② دکمهٔ تلفظ روی همهٔ ستون‌های انگلیسیِ غیرتهی — در ضمیمه ۸۳۶ دکمه
//     (۲۴۴ اسم + ۱۹۷ فعل + ۲۳۱ صفت + ۱۶۴ قید) و در تبِ واژگانِ هر درس
//     همان کارتِ ضمیمه (کامپوننتِ مشترک WordFamilyTableCard).
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import VocabTab from "@/components/study/lesson/vocab-tab";
import {
  WORD_FAMILY_TABLES,
  WORD_FAMILY_TOTAL,
  WORD_FAMILY_LESSON_LINKS,
} from "@/data/word-families";
import { lessons } from "@/data";
import type { LessonData } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));

beforeEach(() => {
  cleanup();
  window.localStorage.clear(); // راند ۲۳۱ — ایزوله‌سازی از جایگاهِ خواندنِ پایدار
});

// فیچرِ کمینه — VocabTab فقط id/color/vocabulary را از LessonData می‌خواند
// (الگویِ vocab-tab-pairs.component.test.tsx)؛ جدولِ پیوندی از کلیدِ id
// می‌آید، پس id باید شناسهٔ واقعیِ درس باشد.
const fixture = (id: number) =>
  ({
    id,
    titleEn: `Lesson ${id}`,
    titleFa: `درس ${id}`,
    tagline: "",
    color: "rose",
    grade: lessons.find((l) => l.id === id)!.grade, // پایهٔ واقعیِ درس — راهنمایِ بخش از آن می‌خواند
    vocabulary: [{ en: "sample", fa: "نمونه" }],
    conversation: { introEn: "", introFa: "", lines: [] },
    readings: [],
    grammar: [],
    synonyms: [],
    writing: [],
    quizzes: [],
  }) as unknown as LessonData;

describe("word-families-lesson-links-r223 — دادهٔ پیوند", () => {
  it("دقیقاً درس‌های ۱ تا ۹ پیوند دارند و مقدار، خودِ جدولِ ضمیمه است (ارجاع — نه کپی)", () => {
    const keys = Object.keys(WORD_FAMILY_LESSON_LINKS)
      .map(Number)
      .sort((a, b) => a - b);
    expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const table of Object.values(WORD_FAMILY_LESSON_LINKS)) {
      expect(WORD_FAMILY_TABLES.includes(table)).toBe(true);
    }
  });

  it("هم‌خوانیِ پایهٔ درسِ برنامه با پایهٔ جدول — درسِ Nامِ هر پایه، «درس Nام» همان پایه", () => {
    const pinned: Record<number, { grade: string; lesson: string; vision: string }> = {
      1: { grade: "یازدهم", lesson: "درس اول", vision: "Vision Two" },
      2: { grade: "یازدهم", lesson: "درس دوم", vision: "Vision Two" },
      3: { grade: "یازدهم", lesson: "درس سوم", vision: "Vision Two" },
      4: { grade: "دوازدهم", lesson: "درس اول", vision: "Vision Three" },
      5: { grade: "دوازدهم", lesson: "درس دوم", vision: "Vision Three" },
      6: { grade: "دوازدهم", lesson: "درس سوم", vision: "Vision Three" },
      7: { grade: "دهم", lesson: "درس اول", vision: "Vision One" },
      8: { grade: "دهم", lesson: "درس دوم", vision: "Vision One" },
      9: { grade: "دهم", lesson: "درس سوم", vision: "Vision One" },
    };
    for (const [idStr, want] of Object.entries(pinned)) {
      const table = WORD_FAMILY_LESSON_LINKS[Number(idStr)];
      expect(table.grade).toBe(want.grade);
      expect(table.lesson).toBe(want.lesson);
      expect(table.vision).toBe(want.vision);
      // گیرندهٔ پیوندِ اشتباهِ پایه: پایهٔ درسِ برنامه هم باید یکی باشد
      const lesson = lessons.find((l) => l.id === Number(idStr))!;
      expect(lesson.grade).toBe(want.grade);
    }
  });

  it("شمارشِ خانواده‌های هر درس (۲۴/۲۳/۲۱/۲۳/۲۲/۲۳/۳۱/۲۶/۳۰ — جمعِ ۲۲۳ از ۲۴۶)", () => {
    const pinned: Record<number, number> = { 1: 24, 2: 23, 3: 21, 4: 23, 5: 22, 6: 23, 7: 31, 8: 26, 9: 30 };
    for (const [id, want] of Object.entries(pinned)) {
      expect(WORD_FAMILY_LESSON_LINKS[Number(id)].families).toHaveLength(want);
    }
    const total = Object.values(WORD_FAMILY_LESSON_LINKS).reduce((n, t) => n + t.families.length, 0);
    expect(total).toBe(223);
    expect(WORD_FAMILY_TOTAL).toBe(246); // ۲۳ خانوادهٔ «درس چهارمِ دهم» بیرونِ قفسه
  });

  it("صفرهایِ صادقانه: «درس چهارمِ دهم» پیوندِ درسی ندارد و درس‌های ۱۰-۱۲ (هفتم/هشتم/نهم) بیرونِ نقشه‌اند", () => {
    for (const table of Object.values(WORD_FAMILY_LESSON_LINKS)) {
      expect(table.lesson).not.toBe("درس چهارم");
    }
    const dahomLinks = Object.values(WORD_FAMILY_LESSON_LINKS).filter((t) => t.grade === "دهم");
    expect(dahomLinks).toHaveLength(3);
    for (const id of [10, 11, 12]) {
      expect(WORD_FAMILY_LESSON_LINKS[id]).toBeUndefined();
      const lesson = lessons.find((l) => l.id === id)!;
      expect(["هفتم", "هشتم", "نهم"]).toContain(lesson.grade);
    }
  });
});

describe("word-families-lesson-links-r223 — رندرِ تبِ واژگانِ درس", () => {
  it("درس ۳: بخشِ «خانوادهٔ واژه‌های مرتبط از جزوه — ۲۱ خانواده» پیش‌فرض بسته است و با بازشدن، همان کارتِ ضمیمه را می‌آورد", () => {
    render(<VocabTab lesson={fixture(3)} />);
    expect(screen.getByText("خانوادهٔ واژه‌های مرتبط از جزوه")).toBeTruthy();
    expect(screen.getByText("۲۱ خانواده")).toBeTruthy();
    // بسته — جدول در DOM نیست
    expect(screen.queryByText("اجزای کلماتیِ درس سوم")).toBeNull();
    // بازکردن
    fireEvent.click(screen.getByText("خانوادهٔ واژه‌های مرتبط از جزوه"));
    expect(screen.getByText("اجزای کلماتیِ درس سوم")).toBeTruthy();
    expect(screen.getByText("Vision Two")).toBeTruthy();
    // سلولِ شاخصِ خودِ جدول + دکمه‌های تلفظِ ردیفِ decoration (هر ۴ ستون پر)
    expect(screen.getByText("decoratively")).toBeTruthy();
    const row = screen.getByText("decoration").closest("tr") as HTMLElement;
    expect(within(row).getAllByRole("button", { name: "روخوانی متن انگلیسی" })).toHaveLength(4);
    // راهنمایِ بخش به پایهٔ درس اشاره می‌کند (متنِ راهنما بینِ نودهایِ JSX شکسته می‌شود — با textContentِ سکشن)
    const section = screen.getByText("خانوادهٔ واژه‌های مرتبط از جزوه").closest("section") as HTMLElement;
    expect(section.textContent).toContain("جزوهٔ جامعِ پایهٔ یازدهم");
    // بستنِ دوباره
    fireEvent.click(screen.getByText("خانوادهٔ واژه‌های مرتبط از جزوه"));
    expect(screen.queryByText("اجزای کلماتیِ درس سوم")).toBeNull();
  });

  it("درس ۷ (دهم): جدولِ «درس اول» با ۳۱ خانواده — و درس ۱۰ (هفتم): غیبتِ کاملِ بخش", () => {
    render(<VocabTab lesson={fixture(7)} />);
    fireEvent.click(screen.getByText("خانوادهٔ واژه‌های مرتبط از جزوه"));
    expect(screen.getByText("اجزای کلماتیِ درس اول")).toBeTruthy();
    expect(screen.getByText("Vision One")).toBeTruthy();
    // چیپِ شمارش دوبار: در هدرِ سکشن + در کارتِ جدول
    expect(screen.getAllByText("۳۱ خانواده")).toHaveLength(2);
    // چون cleanup بین رندرهاست، این رندر تازه است — درس ۱۰ بخش ندارد
    cleanup();
    const { container } = render(<VocabTab lesson={fixture(10)} />);
    expect(screen.queryByText("خانوادهٔ واژه‌های مرتبط از جزوه")).toBeNull();
    expect(container.textContent).not.toContain("اجزای کلماتی");
  });
});

describe("word-families-lesson-links-r223 — دکمهٔ تلفظِ همهٔ ستون‌ها در ضمیمه", () => {
  it("جمعِ دکمه‌های تلفظِ زیرتبِ «اجزای کلام» = ۸۳۶ (۲۴۴ اسم + ۱۹۷ فعل + ۲۳۱ صفت + ۱۶۴ قید)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const speakButtons = screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" });
    expect(speakButtons).toHaveLength(836);
  });

  it("ردیفِ با خانهٔ خالی (proper): فقط ۲ دکمه برای قید و صفت — فعل و اسمِ خالی دکمه ندارند", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const row = screen.getByText("properly").closest("tr") as HTMLElement;
    expect(within(row).getAllByRole("button", { name: "روخوانی متن انگلیسی" })).toHaveLength(2);
  });
});
