import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r323 — گاردِ «آزمون تشریحی واژگان درس اول» جزوهٔ دهم (ص۴۹-۵۱، کلید چاپی ص۲۴۲)
// نخستین بانکِ درس‌محورِ پایهٔ دهم — با خواستهٔ صریحِ کاربر («درس‌های هر پایه») — الگوی r311.
// ۴ بانک / ۵۷ آیتم: ۱۶ تایپیِ بانک‌واژه + ۸ حرف‌اول + ۸ تعریف + ۲۵ MCQ.

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string; translations: string;
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const BANK_A = ["take care", "pay attention", "saved", "died out", "divided", "increase", "destroy", "choose", "protecting"];
const BANK_B = ["recently", "amazing", "plain", "natural", "endangered", "instead", "future", "injured", "living"];
const KEY_B1 = [
  "saved", "protecting", "take care", "destroy", "choose", "died out", "pay attention", "increase",
  "natural", "injured", "amazing", "future", "living", "instead", "recently", "endangered",
];
const KEY_B2 = ["earth", "elephant", "plain", "hunter", "spring", "mountain", "forest", "visitor"];
const KEY_B3 = ["nature", "plan", "hope", "road", "lake", "whale", "zebra", "phrase"];
// کلیدِ حرفیِ MCQ از گریدِ واژه‌ایِ چاپ ص۲۴۲ (among→b, divided→d, ...)
const KEY_B4 = "bddbcacacdbdabbdcbdacbcab".split("");

describe("jozve tests-g10 (r323 تشریحی واژگان درس اول — p49-51, key p242)", () => {
  it("file shape: grade 10, 29 banks ... = 482 (r333 gram4 appended), receipt complete", () => {
    expect(bank.grade).toBe(10);
    // r329 — بانک‌های ۱۳-۱۶ (تشریحی گرامر درس اول) به خانواده اضافه شد؛ دوازده بانکِ r323-r328 دست‌نخورده‌اند
    expect(bank.lessons).toHaveLength(66);
    expect(bank.lessons.slice(0, 4).map((l) => l.count)).toEqual([16, 8, 8, 25]);
    expect(bank.lessons.reduce((s, l) => s + l.count, 0)).toBe(848);
    expect(bank.source.extractedRound).toBe("r323");
    expect(bank.source.keyPages).toBe("242");
    expect(bank.source.keyVerification).toContain("57/57");
    expect(bank.source.pattern).toContain("r311");
    expect(bank.source.translations).toContain("غیبتِ صادقانه");
  });

  it("bank 1 (بانک واژه): typed keys locked to p242, options hold the printed bank, extras never accepted", () => {
    const l1 = bank.lessons[0];
    expect(l1.title).toContain("بانک واژه");
    l1.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([KEY_B1[i]]);
      expect(q.options, q.id).toHaveLength(9);
      // گزینه‌ها = بانکِ چاپی همان نیمه (۱-۸ بانک A، ۹-۱۶ بانک B)
      const src = i < 8 ? BANK_A : BANK_B;
      for (const o of q.options) expect(src, `${q.id}:${o}`).toContain(o);
      // واژهٔ اضافهٔ هر بانک هرگز کلید نیست
      expect(q.question).toContain("[bank:");
    });
    expect(l1.questions.map((q) => q.accepted![0])).not.toContain("divided");
    expect(l1.questions.map((q) => q.accepted![0])).not.toContain("plain");
  });

  it("bank 2 (حرف اول): first-letter hint length matches the answer word", () => {
    const l2 = bank.lessons[1];
    l2.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([KEY_B2[i]]);
      expect(q.placeholder).toContain("first letter");
      // نشانهٔ حرف اول چاپی: «X _ ...» — طولِ خط‌ها + ۱ = طولِ واژه
      // استثنای چاپی Q7: «f _ _ _ _» (۴ زیرخط برای «forest» شش‌حرفی — زیرخطِ کمِ چاپ؛
      // کلیدِ واژه‌ای ص۲۴۲ و معنا حاکم‌اند — الگوی کوئیرکِ چاپ r309)
      const m = q.question.match(/([A-Za-z])((?: _)+)\b/);
      expect(m, q.id).toBeTruthy();
      const hinted = m![1].toLowerCase() + "_".repeat(m![2].split("_").length - 1);
      const qn = q.n;
      if (qn === 7) {
        expect(KEY_B2[i]).toBe("forest");
        expect(hinted.length).toBe(5); // چاپِ کوتاه‌شده
      } else {
        expect(hinted.length, q.id).toBe(KEY_B2[i].length);
      }
      expect(KEY_B2[i].startsWith(m![1].toLowerCase()), q.id).toBe(true);
    });
  });

  it("bank 3 (تعریف‌ها): printed definitions, danger is the extra word", () => {
    const l3 = bank.lessons[2];
    l3.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([KEY_B3[i]]);
      expect(q.question.endsWith(":"), q.id).toBe(true);
      expect(q.options, q.id).toHaveLength(9);
      expect(q.options).toContain("danger"); // واژهٔ اضافهٔ چاپ
    });
    expect(l3.questions.map((q) => q.accepted![0])).not.toContain("danger");
  });

  it("bank 4 (MCQ): 25 items, answers locked letter-by-letter to the p242 word key", () => {
    const l4 = bank.lessons[3];
    const LET = "abcd";
    l4.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(LET[q.answer], `Q${q.n}`).toBe(KEY_B4[i]);
    });
  });

  it("ids unique across the bank family", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(848);
  });
});
