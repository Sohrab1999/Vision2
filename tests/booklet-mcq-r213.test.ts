import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { lessons } from "@/data";
import { LESSON_QUIZ_COUNT, TOTAL_QUESTIONS } from "@/data/lesson-meta";

// راند ۲۱۳ — «نجاتِ رسوبِ تست‌ها»: هر ۱۸۳۲ ردیفِ پارک‌شدهٔ راند ۲۱۲
// ردیف‌به‌ردیف حل شد (S = حلِ زبانیِ مطمئن، D = حذفِ مستند). ۱۶۷۹ ردیف وارد
// درس‌های ۱ تا ۹ شد و ۱۵۳ ردیف (حل‌نشدنی/خراب/تکراریِ موجود) با دلیل در
// booklet-extract/mcq-r213-drops.json ثبت شد. این گاردها پینش می‌کنند.

const BK_PATTERN = /^l(\d+)-bk(\d+)$/;

// آخرین شناسهٔ bk هر درس تا انتهای راند ۲۱۲ — ردیف‌های راند ۲۱۳ ادامهٔ
// همین شماره‌گذاری‌اند (bk رنجِ بالاتر)
const R212_MAX: Record<number, number> = {
  1: 32,
  2: 19,
  3: 51,
  4: 65,
  5: 83,
  6: 76,
  7: 52,
  8: 40,
  9: 76,
};

const R213_COUNTS: Record<number, number> = {
  1: 366,
  2: 45,
  3: 134,
  4: 154,
  5: 259,
  6: 67,
  7: 91,
  8: 112,
  9: 451,
};

function r213Rows(lesson: number) {
  const l = lessons.find((x) => x.id === lesson);
  return (l?.quizzes ?? []).filter((q) => {
    const m = BK_PATTERN.exec(q.id);
    return !!m && Number(m[1]) === lesson && Number(m[2]) > R212_MAX[lesson];
  });
}

const CORRUPTION_PATTERNS = [
  /زوماتز/, /عنرص/, /تلوزیون/, /م تشه/, /ه ده م/, /سوپِ گلیف/,
  /telegram/i, /answer key/i, /good luck/i, /true\s*\/\s*false/i,
  /<[^>]+>/, /\bTODO\b/, /\blorem\b/i, /\bundefined\b/,
];

describe("booklet-mcq-r213: نجاتِ رسوبِ تست‌های جزوه‌های جامع", () => {
  it("count pins — ردیف‌های تازهٔ هر درس و جمع کل (۱۶۷۹)", () => {
    let total = 0;
    for (const [id, cnt] of Object.entries(R213_COUNTS)) {
      const rows = r213Rows(Number(id));
      expect(rows, `lesson ${id}`).toHaveLength(cnt);
      total += cnt;
    }
    expect(total).toBe(1679);
  });

  it("every r213 row is well-formed: ۴ گزینهٔ یکتا، کلیدِ در-محدوده، دستهٔ معتبر", () => {
    for (let id = 1; id <= 9; id++) {
      for (const q of r213Rows(id)) {
        expect(q.options, q.id).toHaveLength(4);
        expect(
          new Set(q.options.map((o) => o.trim().toLowerCase())).size,
          q.id,
        ).toBe(4);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThan(4);
        expect(
          q.category === "vocab-konkuri" || q.category === "grammar",
          q.id,
        ).toBe(true);
        for (const o of q.options) {
          expect(o.trim().length, q.id).toBeGreaterThan(0);
        }
      }
    }
  });

  it("sample pins — نمونه‌های حل‌شدهٔ هر درس (با متنِ ساقه و کلیدِ دقیق)", () => {
    const all = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((id) => r213Rows(id));
    const answerOf = (prefix: string) => {
      const q = all.find((row) => row.question.startsWith(prefix));
      expect(q, prefix).toBeDefined();
      return q!.options[q!.answer];
    };

    // L7 — واژگانِ وژن ۱ (g10 L7 p52)
    expect(answerOf("Tom called to say he’s going to be")).toBe("a few");
    expect(answerOf("The lizards are classed as an")).toBe("endangered");
    // L8 — صفت‌های ترتیبی (g10 L8 p102)
    expect(answerOf("I have never forgotten the")).toBe(
      "beautiful large brown wooden",
    );
    // L9 — ضمایرِ انعکاسی + گرامر
    expect(answerOf("Maryam and I washed all the dishes")).toBe("ourselves");
    expect(answerOf("Mr. Norani")).toBe("likes");
    // L1 — واژگانِ وژن ۲ (g11)
    expect(answerOf("We had a very hard winter last year")).toBe("died");
    expect(answerOf("Stress can affect both your physical and")).toBe("mental");
    expect(answerOf("Dress sizes")).toBe("range");
    // L2 — گرامرِ حالِ کامل
    expect(answerOf("I")).toBeDefined();
    const perfect = all.find((q) =>
      q.question.startsWith("I was doing my homework when my mother"),
    );
    expect(perfect, "L2 past-interruption").toBeDefined();
    expect(perfect!.options[perfect!.answer]).toBe("came back");
    // L3 — مصدر/Gerund
    expect(answerOf("I often avoid")).toBe("going");
    // L4 — مجهول (g12)
    expect(answerOf("My little brothers")).toBe("are taken");
    expect(answerOf("A fish salad")).toBe("may be made");
    // L5 — نسبی/تگ
    expect(answerOf("She was the girl")).toBe("whose");
    expect(answerOf("Their aunt")).toBe("ordered");
    // L6 — شرطی + واژگانِ انرژی
    expect(answerOf("Where")).toBeDefined();
    const cond = all.find((q) =>
      q.question.startsWith("Where would you like to travel"),
    );
    expect(cond, "L6 astronaut conditional").toBeDefined();
    expect(cond!.options[cond!.answer]).toBe("were");
    expect(answerOf("The problem with fossil fuels is that they are not")).toBe(
      "renewable",
    );
  });

  it("blocklist corruption/watermark — هیچ الگوی خرابی یا واترمارکی وارد نشده", () => {
    for (let id = 1; id <= 9; id++) {
      for (const q of r213Rows(id)) {
        const text = `${q.question} ${q.options.join(" ")}`;
        for (const p of CORRUPTION_PATTERNS) {
          expect(p.test(text), `${q.id} vs ${p}`).toBe(false);
        }
      }
    }
  });

  it("stem latin-ratio — ساقه‌ها لاتینِ سالم‌اند (خط‌چین‌ها محتوا هستند)", () => {
    for (let id = 1; id <= 9; id++) {
      for (const q of r213Rows(id)) {
        const letters = q.question.replace(/[^A-Za-z]/g, "").length;
        const blanks = q.question.replace(/[-_―–—]/g, "").length;
        expect(letters / Math.max(1, blanks), q.id).toBeGreaterThan(0.55);
      }
    }
  });

  it("author/publisher scrub — نامِ مؤلف/ناشر طبق فرمانِ مالک ممنوع", () => {
    for (let id = 1; id <= 9; id++) {
      for (const q of r213Rows(id)) {
        const text = `${q.question} ${q.options.join(" ")}`;
        expect(/جمال/i.test(text) && /احمدی/i.test(text), q.id).toBe(false);
        expect(/لطفی/i.test(text), q.id).toBe(false);
        expect(/جزوه/.test(text), q.id).toBe(false);
      }
    }
  });

  it("residue reconciliation — هر ۱۸۳۲ ردیف یا فرود آمد یا حذفِ مستند دارد؛ رسوب صفر", () => {
    const drops = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "booklet-extract/mcq-r213-drops.json"),
        "utf-8",
      ),
    ) as Array<{ key: string; reason: string }>;
    const landed = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((id) =>
      r213Rows(id),
    ).length;
    expect(landed).toBe(1679);
    expect(drops.length).toBe(153);
    // هر ردیفِ حذف‌شده دلیلِ مستند دارد
    for (const d of drops) {
      expect(d.reason.length, d.key).toBeGreaterThan(0);
      expect(
        ["hand-drop", "already-in-bank", "empty-option-after-scrub",
          "duplicate-options", "blocklist", "stem-length"].includes(d.reason),
        d.key,
      ).toBe(true);
    }
    const residue = readFileSync(
      resolve(process.cwd(), "booklet-extract/mcq-residue.txt"),
      "utf-8",
    ).trim();
    expect(residue).toBe("");
  });

  it("aggregate pins — جمعِ بانک و سازگاریِ meta", () => {
    const real = lessons.reduce((s, l) => s + l.quizzes.length, 0);
    expect(LESSON_QUIZ_COUNT).toBe(real);
    expect(LESSON_QUIZ_COUNT).toBe(2708);
    expect(TOTAL_QUESTIONS).toBe(LESSON_QUIZ_COUNT + 360);
  });
});
