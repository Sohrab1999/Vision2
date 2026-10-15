import { describe, expect, it } from "vitest";
import { lessons, examBank } from "@/data";
import { LESSON_QUIZ_COUNT, TOTAL_QUESTIONS } from "@/data/lesson-meta";

// راند ۲۱۲ — واژگان/گرامر استاندارد و کنکوری جزوه‌های جامع: ۴۹۴ ردیفِ تازه
// که با سه دور بازبینیِ دستیِ ردیف‌به‌ردیف (کلیدِ جزوه + تصحیحِ زبانیِ مطمئن)
// وارد درس‌های ۱ تا ۹ شد. این گاردها پینش می‌کنند.

const BK_PATTERN = /^l(\d+)-bk(\d+)$/;

function bkRows(lesson: number) {
  const l = lessons.find((x) => x.id === lesson);
  return (l?.quizzes ?? []).filter((q) => BK_PATTERN.test(q.id));
}

const BK_COUNTS: Record<number, number> = {
  1: 398,
  2: 64,
  3: 185,
  4: 219,
  5: 342,
  6: 143,
  7: 143,
  8: 152,
  9: 527,
};
// [به‌روزِ صادقانهٔ راند ۲۱۳] ردیف‌های نجات‌یافتهٔ رسوب (۱۶۷۹ ردیف) ادامهٔ
// همین namespace (l{N}-bk{M}) هستند؛ پین‌ها به جمعِ انباشتهٔ ۲۱۷۳ ری‌بیلت شدند.
// دلتای دقیق راند ۲۱۳ و نمونه‌هایش در tests/booklet-mcq-r213.test.ts پین است.

describe("booklet-mcq-r212: بانک تست‌های استاندارد/کنکوری جزوه‌های جامع", () => {
  it("count pins — ردیف‌های جزوهٔ هر درس و جمع کل", () => {
    let total = 0;
    for (const [id, cnt] of Object.entries(BK_COUNTS)) {
      const rows = bkRows(Number(id));
      expect(rows, `lesson ${id}`).toHaveLength(cnt);
      total += cnt;
    }
    expect(total).toBe(2173);
  });

  it("every booklet row is well-formed: ۴ گزینهٔ یکتا و کلید در محدوده", () => {
    for (let id = 1; id <= 9; id++) {
      for (const q of bkRows(id)) {
        expect(q.options, q.id).toHaveLength(4);
        expect(new Set(q.options.map((o) => o.trim().toLowerCase())).size, q.id).toBe(4);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThan(4);
        expect(q.category === "vocab-konkuri" || q.category === "grammar", q.id).toBe(true);
      }
    }
  });

  it("sample pins — نمونه‌های ترمیم‌شده و کلیددارِ هر درس (با متنِ ساقه)", () => {
    const all = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((id) => bkRows(id));
    const answerOf = (prefix: string) => {
      const q = all.find((row) => row.question.startsWith(prefix));
      expect(q, prefix).toBeDefined();
      return q!.options[q!.answer];
    };

    // L4 — بلوکِ کلیددارِ «کلیدی و ترجمه» (هم‌ترازیِ کامل با پاسخنامه)
    expect(answerOf("Happiness isn\u2019t about getting what you want")).toBe("grateful");
    expect(answerOf("He was one of the Australia")).toBe("distinguished");
    // L5 — کلیدِ واقعیِ «تست ۱۰۰ واژگان» صفحهٔ ۷۴-۷۸
    expect(answerOf("The building was burning")).toBe("emergency");
    expect(answerOf("Although milk is made up mainly of water")).toBe("contains");
    // L6 — انرژی و محیط زیست
    expect(answerOf("They have greatly ")).toBe("reduced");
    expect(answerOf("My mother practiced some relaxation")).toBe("deal with");
    // L7 — واژگان پایهٔ هفتم تا نهم (کلیدِ صفحهٔ ۲۳۲)
    expect(answerOf("In the past, teachers and students")).toBe("chalks");
    expect(answerOf("All of us have heard that eating")).toBe("carrots");
    // L8 — ترتیبِ صفت
    expect(answerOf("He has recently bought a")).toBe("beautiful big white Japanese");
    // L9 — گذشتهٔ استمراری و ضمائر انعکاسی
    expect(answerOf("While Kimia and her friends")).toBe("were playing / started");
    expect(answerOf("Shiva and Shima were able to clean")).toBe("themselves");
    // گرامرِ ترمیم‌شدهٔ زبانی (کلیدِ جزوه در این بلوک‌ها جابه‌جا بود)
    expect(answerOf("He was surprised ")).toBe("to see");
    expect(answerOf("We enjoy ")).toBe("giving / to have");
    expect(answerOf("Ali always talks")).toBe("a lot");
  });

  it("corruption blocklist — هیچ سوپِ گلیف یا واترمارک وارد نشده", () => {
    const BAD = [
      /تسی یچ/, /سؤاال/, /باال/, /جمالت/, /نشی  ن/, /یگم\b/,
      /Telegram/i, /True \/ False/, /PracticalEnglish/,
      /[۰-۹]{2,}\s*[.\-]\s*گزینه/, /گذشته ساده\/جملۀ/,
    ];
    for (let id = 1; id <= 9; id++) {
      for (const q of bkRows(id)) {
        const text = `${q.question} ${q.options.join(" ")}`;
        for (const pat of BAD) {
          expect(pat.test(text), `${q.id} vs ${pat}`).toBe(false);
        }
        // ساقه باید لاتین‌غالب باشد (فضای خالی مجاز)
        const letters = q.question.replace(/[^A-Za-z]/g, "").length;
        const blanks = q.question.replace(/[-_―–—]/g, "").length;
        expect(letters / Math.max(1, blanks), q.id).toBeGreaterThan(0.55);
      }
    }
  });

  it("author/publisher scrub — نامِ مؤلف/ناشر طبق فرمانِ مالک ممنوع", () => {
    for (let id = 1; id <= 9; id++) {
      for (const q of bkRows(id)) {
        const text = `${q.question} ${q.options.join(" ")}`;
        expect(/جمال/i.test(text) && /احمدی/i.test(text), q.id).toBe(false);
        expect(/لطفی/i.test(text), q.id).toBe(false);
        expect(/جزوه/.test(text), q.id).toBe(false);
      }
    }
  });

  it("aggregate pins — جمعِ بانک و سازگاریِ meta", () => {
    const real = lessons.reduce((s, l) => s + l.quizzes.length, 0);
    expect(LESSON_QUIZ_COUNT).toBe(real);
    expect(LESSON_QUIZ_COUNT).toBe(2708);
    expect(TOTAL_QUESTIONS).toBe(LESSON_QUIZ_COUNT + examBank.length);
  });
});
