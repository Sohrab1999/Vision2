// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۰ — گاردهای «پیوندِ درسنامهٔ جامع ↔ درس‌های برنامه»:
//   ① دادهٔ LESSON_BG_LINKS — فقط درس‌های ۱-۶ (شاهدِ خودِ جزوه‌ها)،
//      شمارشِ هر درس، وجودِ شناسه‌ها، هم‌خوانیِ پایهٔ درس با جزوهٔ مبدأ
//   ② صفرِ صادقانه — درس‌های ۷-۱۲ پیوند ندارند (بنیان‌های دهم زیربخشِ
//      پایه‌ای ندارد و مالکیتِ ساختگی ممنوع)
//   ③ رندرِ تبِ گرامر — بخشِ «درسنامهٔ جامعِ مرتبط از جزوه» در درس ۱ با
//      همان کارت‌های آکاردئونی ضمیمه؛ غیبتِ کامل در درس ۷
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

import GrammarTab from "@/components/study/lesson/grammar-tab";
import { LESSON_BG_LINKS, BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { lessons } from "@/data";

const LINKED = [1, 2, 3, 4, 5, 6];

describe("lesson-bg-links-r220 — دادهٔ پیوند", () => {
  it("فقط درس‌های ۱-۶ پیوند دارند با شمارشِ ۲/۳/۳/۴/۲/۲ (جمعِ ۱۶ — راند ۲۲۵: مصدرِ درس سه)", () => {
    const keys = Object.keys(LESSON_BG_LINKS).map(Number).sort((a, b) => a - b);
    expect(keys).toEqual(LINKED);
    expect(LESSON_BG_LINKS[1]).toHaveLength(2);
    expect(LESSON_BG_LINKS[2]).toHaveLength(3);
    expect(LESSON_BG_LINKS[3]).toHaveLength(3);
    expect(LESSON_BG_LINKS[4]).toHaveLength(4);
    expect(LESSON_BG_LINKS[5]).toHaveLength(2);
    expect(LESSON_BG_LINKS[6]).toHaveLength(2);
    const total = Object.values(LESSON_BG_LINKS).reduce((n, xs) => n + xs.length, 0);
    expect(total).toBe(16);
    // راند ۲۲۵ — شاهدِ فهرستِ خودِ جزوه: «مصدر با to» در زیربخشِ گرامرِ درس سوم است (g11.txt L822-856)
    expect(LESSON_BG_LINKS[3]).toContain("bg-infinitive");
  });

  it("هر شناسه واقعی است، بدونِ تکرار در یک درس، و پایهٔ درس = جزوهٔ مبدأ", () => {
    for (const [id, ids] of Object.entries(LESSON_BG_LINKS)) {
      const lesson = lessons.find((l) => l.id === Number(id))!;
      expect(new Set(ids).size).toBe(ids.length);
      for (const tid of ids) {
        const topic = BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === tid);
        expect(topic, `topic ${tid} باید موجود باشد`).toBeTruthy();
        // جزوهٔ مبدأِ موضوع = پایهٔ خودِ درس (یازدهم ↔ یازدهم، دوازدهم ↔ دوازدهم)
        expect(topic!.source).toBe(lesson.grade);
      }
    }
  });

  it("پینِ اتکا — یازدهم: هر موضوع به همان درسی می‌رود که آزمونِ تشخیصیِ جزوه برایش ساخته شده", () => {
    // درس اول (ص۲۹، کلید ص۱۷۹) / درس دوم (ص۶۳+ص۷۵، کلید ص۱۸۷+ص۱۹۱) / درس سوم (ص۱۰۰، کلید ص۱۹۶)
    expect(LESSON_BG_LINKS[1]).toEqual(["bg-quantifiers", "bg-numbers"]);
    expect(LESSON_BG_LINKS[2]).toEqual(["bg-present-perfect", "bg-phrasal-verbs", "bg-gerund"]);
    // راند ۲۲۵ — مصدر با to با شاهدِ فهرستِ خودِ جزوه (زیربخشِ گرامرِ درس سوم، g11.txt L822-856)
    expect(LESSON_BG_LINKS[3]).toEqual(["bg-first-conditional", "bg-ed-ing-adjectives", "bg-infinitive"]);
  });

  it("پینِ اتکا — دوازدهم: ارجاع‌های درون‌متنیِ جزوه (ص۹۴/ص۹۵) و بازه‌های تدریس", () => {
    // درس اول: مجهول ص۲۶+، عبارات الحاق ص۴۲+ («در درس ۱ آشنا شدیم»)، حروف ربط ص۴۶
    expect(LESSON_BG_LINKS[4]).toEqual(["bg-passive", "bg-passive-tenses", "bg-tag-questions", "bg-conjunctions"]);
    // درس دوم: ضمایر موصولی ص۷۹، شرطی نوع دوم ص۹۳
    expect(LESSON_BG_LINKS[5]).toEqual(["bg-relative-pronouns", "bg-conditional-type-2"]);
    // درس سوم: گذشتهٔ کامل ص۱۳۷+ («در درس سوم آشنا خواهید شد»)، افعال ناقصِ گذشته ص۱۴۶+
    expect(LESSON_BG_LINKS[6]).toEqual(["bg-past-perfect", "bg-past-modals"]);
  });

  it("صفرِ صادقانه — درس‌های ۷-۱۲ پیوند ندارند (بدونِ مالکیتِ ساختگی)", () => {
    for (const id of [7, 8, 9, 10, 11, 12]) {
      expect(LESSON_BG_LINKS[id]).toBeUndefined();
    }
  });
});

describe("lesson-bg-links-r220 — رندرِ تبِ گرامر", () => {
  beforeEach(cleanup);

  it("درس ۱: بخشِ «درسنامهٔ جامعِ مرتبط از جزوه — ۲ موضوع» رندر می‌شود و بازکردنِ موضوع، کارتِ کاملِ ضمیمه را می‌آورد", () => {
    const lesson = lessons.find((l) => l.id === 1)!;
    render(<GrammarTab lesson={lesson} />);
    expect(screen.getByText("درسنامهٔ جامعِ مرتبط از جزوه")).toBeTruthy();
    expect(screen.getByText("۲ موضوع")).toBeTruthy();
    expect(screen.getByText(/جزوهٔ جامعِ پایهٔ یازدهم برای گرامرِ همین درس/)).toBeTruthy();
    // کارت‌های بسته — بازکردنِ کمّی‌ها
    fireEvent.click(screen.getByText("صفت‌های کمّی و شمارشی"));
    // محتوای همان کارتِ ضمیمه — مقدمه + هر سه تمرینِ تعاملی
    expect(screen.getByText(/از طریق اسمی که بعد از آن‌ها در جمله به کار می‌رود/)).toBeTruthy();
    expect(screen.getByText(/آزمونکِ خودِ جزوه — ۲۰ سؤال/)).toBeTruthy();
    expect(screen.getByText(/تمرینِ تایپیِ خودِ جزوه — ۲۰ سؤال/)).toBeTruthy();
    expect(screen.getByText(/جمله‌سازیِ خودِ جزوه — ۱۰ سؤال/)).toBeTruthy();
  });

  it("درس ۷: هیچ بخشِ پیوندی نیست — صفرِ صادقانه در UI هم", () => {
    const lesson = lessons.find((l) => l.id === 7)!;
    const { container } = render(<GrammarTab lesson={lesson} />);
    expect(screen.queryByText("درسنامهٔ جامعِ مرتبط از جزوه")).toBeNull();
    expect(container.textContent).not.toContain("درسنامهٔ جامع");
  });
});
