import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r360 — گاردِ «تست های گرامر و نگارش درس3 - پایه11» (بخش اول ص۱۰۳-۱۰۴ + بخش دوم ص۱۰۵-۱۰۸)
// بخش اول: ۳۰ MCQ با کلیدِ تشریحیِ ص۱۹۸-۱۹۹ («N - گزینه (X)»)؛ بخش دوم: ۷۰ MCQ با کلیدِ
// گریدِ مختصاتیِ ص۲۰۰ (۷ ستون × ۱۰ ردیف، ارقامِ سیاهِ sz۱۴ / حروفِ سرخِ c#c00000 sz۱۵ —
// ستونِ ۶۱-۷۰ با سایزِ ۱۵ چاپ شده نه ۱۴ — ناهم‌سایزیِ ستونیِ چاپ).
// داوری‌های رندر (۸x): سربرگِ کلید «پاسخنامه تستهای دستگریمی» — لایه «دستگریم» بدونِ «ی» آخر می‌دهد؛
// «شیوه کیل حل تستهای گرامر» چاپ‌غلطِ «کیل»؛ ارقامِ لوکاتورِ چاپِ ص۱۹۸ فارسی («۱۰۳ و ۱۰۴») ولی لایه لاتین؛
// لکهٔ «cc» سه‌پوینتیِ نامرئی‌چاپ بالایِ گریدِ ص۲۰۰؛ scrambleِ عنوانِ ص۱۰۳ («ست ت»+«های»).
// تکرارهای چاپی (قراردادِ r308: نگه‌داشتن نه حذف): Q13=Q66 بخش دوم (فقط عرضِ تیره ۱۷/۱۶)؛
// Q4 بخش اول = Q3 بخش دوم. بدونِ ترجمهٔ چاپی (صفحاتِ سؤال فاقدِ ستونِ ترجمه).

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string; kind?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string;
    g11l3gwr?: {
      extractedRound: string; examPages: string; keyPages: string;
      sections: number; items: number; printQuirkCount: number; printQuirks: string[];
      keyVerification: Record<string, string>;
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g11.json", "utf8"),
) as unknown as TBank;

const B1 = bank.lessons.find((l) => l.lesson === 93)!;
const B2 = bank.lessons.find((l) => l.lesson === 94)!;

// کلیدِ چاپیِ بخش اول — رونویسی از کلیدِ تشریحیِ ص۱۹۸-۱۹۹ (۳۰ حرف)
const PRINT_KEY1 = "bbcbcbabddcaddcddbbadabddbccbb".split("");
// کلیدِ چاپیِ بخش دوم — رونویسی از گریدِ مختصاتیِ ص۲۰۰ (۷۰ حرف، ستون‌به‌ردیف)
const PRINT_KEY2 = (
  "b c b b a a c c b d " + "c d a d b d c c d a " + "b d d c d c d b a d " +
  "a d b a d b d d d c " + "d d b a a d c a d d " + "a c c b a a c a c d " +
  "c a a d d a b d a c"
).split(" ");

describe("jozve tests-g11 l3gwr (r360 — تست های گرامر و نگارش درس3 — pp103-108, keys pp198-200)", () => {
  it("g11l3gwr receipt complete: pages, rounds, items, quirks incl. دستگریمی/کیل/cc", () => {
    expect(bank.source.g11l3gwr).toBeTruthy();
    const s = bank.source.g11l3gwr!;
    expect(s.extractedRound).toBe("r360");
    expect(s.examPages).toContain("103-104");
    expect(s.examPages).toContain("105-108");
    expect(s.keyPages).toContain("198-199");
    expect(s.keyPages).toContain("200");
    expect(s.sections).toBe(2);
    expect(s.items).toBe(100);
    expect(s.printQuirkCount).toBeGreaterThanOrEqual(12);
    const Q = s.printQuirks.join(" ");
    expect(Q).toContain("دستگریمی"); // رندر حاکم — لایه «دستگریم» می‌دهد
    expect(Q).toContain("کیل"); // چاپ‌غلطِ «شیوه کیل حل تستهای گرامر»
    expect(Q).toContain("سؤاالت");
    expect(Q).toContain("سواالات"); // دو تجزیهٔ متفاوتِ «سؤالات» در دو سربرگ
    expect(Q).toContain("۱۰۳ و ۱۰۴"); // ارقامِ فارسیِ چاپ در برابرِ لایهٔ لاتین
    expect(Q).toContain("cc"); // لکهٔ سه‌پوینتیِ بالایِ گرید
    expect(Q).toContain("ست ت"); // scrambleِ عنوانِ ص۱۰۳
    expect(Q).toContain("۶۱-۷۰"); // ناهم‌سایزیِ ستونیِ گرید
    expect(Q).toContain("Q13 = Q66"); // تکرارِ چاپی
    expect(s.keyVerification.sec1_explanatory).toContain("30/30");
    expect(s.keyVerification.sec2_grid).toContain("70/70");
  });

  it("bank shape: 30+70 MCQ, category grammar, unique ids, no translation, Latin purity", () => {
    expect(B1.title).toBe("کنکوری/استاندارد — بخش اول: ۳۰ تست گرامر و نگارش د۳ (ص۱۰۳-۱۰۴)");
    expect(B1.level).toBe("کنکوری/استاندارد — چهارگزینه‌ای");
    expect(B1.count).toBe(30);
    expect(B2.title).toBe("متوسط/کنکوری — بخش دوم: ۷۰ تست گرامر و نگارش د۳ (ص۱۰۵-۱۰۸)");
    expect(B2.level).toBe("متوسط/کنکوری — چهارگزینه‌ای");
    expect(B2.count).toBe(70);
    for (const [B, pre] of [[B1, "g11-l93"] as const, [B2, "g11-l94"] as const]) {
      B.questions.forEach((q, i) => {
        expect(q.n).toBe(i + 1);
        expect(q.id).toBe(`${pre}-${i + 1}`);
        expect(q.category).toBe("grammar");
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(3);
        expect(q.translation).toBeUndefined(); // بدونِ ترجمهٔ چاپی — عینِ جزوه
        expect(q.kind).toBeUndefined();
        const body = q.question + q.options.join(" ");
        expect(/[آ-ی]/.test(body)).toBe(false); // خلوصِ لاتین
        expect(q.options.every((o) => o.length > 0)).toBe(true);
      });
    }
    // همهٔ سؤال‌ها جای‌خالیِ ۸+ تیره دارند (به‌جز Q61 بخش دوم: ساقه با بلنکِ ابتدایِ جمله)
    for (const B of [B1, B2]) {
      B.questions.forEach((q) => {
        if (!(B === B2 && q.n === 61)) expect(q.question).toMatch(/-{8,}/);
      });
    }
  });

  it("print keys locked verbatim: 30-letter explanatory + 70-letter coordinate grid", () => {
    expect(PRINT_KEY1).toHaveLength(30);
    B1.questions.forEach((q, i) => {
      expect("abcd"[q.answer]).toBe(PRINT_KEY1[i]);
    });
    expect(PRINT_KEY2).toHaveLength(70);
    B2.questions.forEach((q, i) => {
      expect("abcd"[q.answer]).toBe(PRINT_KEY2[i]);
    });
    // تکیه‌گاه‌های معناییِ قفل‌شده در استخراج
    expect(B1.questions[0].answer).toBe(1); // Q1 will buy (شرطی نوع اول)
    expect(B1.questions[23].answer).toBe(3); // Q24 to tell / swimming (want+to، go+ing)
    expect(B1.questions[29].answer).toBe(1); // Q30 to answer
    expect(B2.questions[0].answer).toBe(1); // Q1 buy (شرطی نوع اول)
    expect(B2.questions[1].answer).toBe(2); // Q2 to see
    expect(B2.questions[59].answer).toBe(3); // Q60 to eat
    expect(B2.questions[67].answer).toBe(3); // Q68 not to play
  });

  it("verbatim stems and options: two-row Q8, wrapped Q29/Q14, leading-blank Q61", () => {
    expect(B1.questions[0].question).toBe(
      "If I find a book that is popular among all children, I -------------- it for my brother as a birthday present.",
    );
    expect(B1.questions[0].options[3]).toBe("would have bought"); // لایهٔ fitz آن را نمی‌دهد؛ چاپ دارد
    expect(B1.questions[7].options).toEqual([
      "will decide inviting", "decide to invite", "will decide to invite", "decide inviting",
    ]); // گزینه‌های دوردیفیِ Q8
    expect(B1.questions[28].question).toContain("for everyone in the hotel ------------------ the lobby as quickly as possible."); // ساقهٔ دوخطی
    expect(B2.questions[13].question).toContain("if you ---------------- your exams. So, study your lessons as much as possible."); // تیره در انتهای خط + ادامهٔ ساقه
    expect(B2.questions[60].question).toBe(
      "----------------------, I have no idea where I would like to vacation this summer.",
    );
    expect(B2.questions[60].options).toEqual(["I am honest", "Be honest", "To be honest", "Honest I am"]);
    // سنزِ تیره‌ها: بخش اول ۴۱ ران/۷۱۱ تیره، بخش دوم ۸۱ ران/۱۴۳۸ تیره — بدونِ هیچ بریدگیِ بین‌خطی
    for (const [B, runs, total] of [[B1, 41, 711] as const, [B2, 81, 1438] as const]) {
      const r = B.questions.reduce((s, q) => s + [...q.question.matchAll(/-{3,}/g)].length, 0);
      const t = B.questions.reduce(
        (s, q) => s + [...q.question.matchAll(/-{3,}/g)].reduce((a, m) => a + m[0].length, 0), 0);
      expect(r).toBe(runs);
      expect(t).toBe(total);
    }
  });

  it("printed duplicates kept per r308: B2 Q13=Q66 (dash-normalized), B1 Q4 = B2 Q3", () => {
    const norm = (s: string) => s.replace(/-{3,}/g, "—");
    const q13 = B2.questions[12];
    const q66 = B2.questions[65];
    expect(norm(q13.question)).toBe(norm(q66.question));
    expect(q13.options).toEqual(q66.options);
    expect(q13.answer).toBe(q66.answer);
    expect(q13.question).not.toBe(q66.question); // تیره‌ها ۱۷/۱۶ — عینِ چاپ
    const q4 = B1.questions[3];
    const q3 = B2.questions[2];
    expect(norm(q4.question)).toBe(norm(q3.question));
    expect(q4.options).toEqual(q3.options);
    expect(q4.answer).toBe(q3.answer);
  });

  it("file shape after r360: 94 banks, 1184 items, unique ids, tail vector ends [30, 70]", () => {
    expect(bank.lessons).toHaveLength(94);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(1184);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1184);
    // وکتورِ دنباله: دو بانکِ جدید در انتها؛ پیش از آن جامعِ د۳ (r359) با [4,8,4,4,4,4,4,2,8,6,4,1,6,6]
    expect(counts.slice(-2)).toEqual([30, 70]);
    expect(counts.slice(-16, -2)).toEqual([4, 8, 4, 4, 4, 4, 4, 2, 8, 6, 4, 1, 6, 6]);
    // دنبالهٔ کاملِ شناسه‌های l60..l94 از r357/r358/r359/r360
    const lastIds = bank.lessons.slice(-35).flatMap((l) => l.questions.map((q) => q.id));
    expect(lastIds.slice(0, 4)).toEqual(["g11-l60-1", "g11-l60-2", "g11-l60-3", "g11-l60-4"]);
    expect(lastIds.slice(-4)).toEqual(["g11-l94-67", "g11-l94-68", "g11-l94-69", "g11-l94-70"]);
  });
});
