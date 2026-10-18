import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r326 — گاردِ بانک‌های ۷-۱۰ِ tests-g10: «آزمون تشریحی واژگان درس دوم»
// (ص۸۴-۸۶، کلید واژه‌ای چاپی ص۲۵۸ — عینِ الگوی r323 برای درس دوم)
// قفل: ۱۶ کلیدِ بانک‌واژه + ۸ حرف اول (طولِ زیرخط = طولِ کلید) + ۸ تعریف + ۲۵ MCQِ واژه‌ای

const doc = JSON.parse(fs.readFileSync("public/jozve/tests-g10.json", "utf-8"));
const L = (n: number) => doc.lessons.find((l: { lesson: number }) => l.lesson === n);

describe("tests-g10 tashrihi2 — تشریحی واژگان درس دوم (r326)", () => {
  it("receipt tashrihi2 with sections/keyPages/pattern/quirks", () => {
    const src = doc.source.tashrihi2;
    expect(src).toBeTruthy();
    expect(src.keyPages).toBe("258");
    expect(src.extractedRound).toBe("r326");
    expect(src.header).toContain("درس دوم");
    expect(src.header).toContain("۲۵۸");
    expect(src.keyVerification).toContain("57/57");
    expect(src.pattern).toContain("r323");
    expect(src.translations).toContain("غیبتِ صادقانه");
    expect(src.printQuirks.some((q: string) => q.includes("to keeps"))).toBe(true);
  });

  it("file shape: 98 banks, family 1466 items (4 tashrihi4 + 1 vocab40l4 + 7 g10l4c appended — r345/r346/r347 surgery)", () => {
    expect(doc.grade).toBe(10);
    expect(doc.lessons).toHaveLength(98);
    expect(doc.lessons.slice(6).map((l: { count: number }) => l.count)).toEqual([16, 8, 8, 25, 40, 40, 15, 7, 5, 10, 20, 16, 12, 6, 7, 14, 6, 6, 40, 15, 7, 10, 12, 20, 45, 16, 12, 5, 7, 4, 6, 8, 8, 6, 6, 3, 4, 6, 6, 1, 4, 6, 2, 8, 6, 6, 16, 8, 8, 25, 40, 10, 7, 7, 5, 5, 10, 5, 5, 20, 16, 12, 9, 5, 2, 6, 7, 46, 4, 10, 16, 8, 8, 25, 40, 8, 10, 10, 5, 5, 10, 20, 16, 12, 13, 2, 4, 6, 6, 57, 100, 120]);
    expect(doc.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(1466);
  });

  it("bank 7 (بانک واژه): 16 typed keys locked to p258, extras disease/element never the accepted key", () => {
    const keys = [
      "exercise", "strange", "ugly", "important", "blood", "strong", "compare", "suitable",
      "healthy", "worst", "drop", "carry", "lost", "orbits", "without", "abroad",
    ];
    const l7 = L(7);
    l7.questions.forEach((q: { accepted: string[]; options: string[]; question: string }, i: number) => {
      expect(q.accepted, `B7-Q${i + 1}`).toEqual([keys[i]]);
      expect(q.question).toContain("[bank:");
    });
    // اضافهٔ چاپِ بانک A/B در گزینه‌ها هست (حواس‌پرت‌کنِ چاپ) ولی هرگز accepted نیست
    expect(l7.questions[0].options).toContain("disease");
    expect(l7.questions[8].options).toContain("element");
    expect(l7.questions.every((q: { accepted: string[] }) => q.accepted[0] !== "disease" && q.accepted[0] !== "element")).toBe(true);
    // کوئیرکِ چاپیِ Q5 قفل است
    expect(l7.questions[4].question).toContain("to keeps us alive");
  });

  it("bank 8 (حرف اول): stems locked, underline count matches key length (no r323-Q7-style exception)", () => {
    const keys = ["metal", "camel", "fact", "difficult", "oxygen", "helpful", "polite", "defend"];
    const l8 = L(8);
    l8.questions.forEach((q: { accepted: string[]; question: string }, i: number) => {
      expect(q.accepted, `B8-Q${i + 1}`).toEqual([keys[i]]);
      const m = q.question.match(/([a-z]) ((?:_ ?)+)/);
      expect(m, `B8-Q${i + 1} underline`).toBeTruthy();
      const letters = (q.question.match(/_/g) || []).length;
      expect(letters + 1, `B8-Q${i + 1} length`).toBe(keys[i].length);
      expect(q.question.toLowerCase().includes(` ${keys[i]}`)).toBe(false); // نشتِ کلید در ساقه ممنوع
    });
    // حرفِ اولِ ساقه = حرفِ اولِ کلید
    l8.questions.forEach((q: { question: string }, i: number) => {
      const m = q.question.match(/ ([a-z]) _/);
      expect(m![1], `B8-Q${i + 1} first letter`).toBe(keys[i][0]);
    });
  });

  it("bank 9 (تعریف‌ها): 8 typed keys locked, extra pepper never accepted", () => {
    const keys = ["village", "collect", "daily", "gift", "sky", "planet", "war", "heart"];
    const l9 = L(9);
    l9.questions.forEach((q: { accepted: string[]; question: string }, i: number) => {
      expect(q.accepted, `B9-Q${i + 1}`).toEqual([keys[i]]);
      expect(q.question).not.toContain("pepper");
    });
    expect(l9.questions[0].options).toContain("pepper"); // اضافه در گزینه‌ها هست
  });

  it("bank 10 (MCQ): 25 answers locked word-by-word to the printed key p258", () => {
    const keys = [
      "donated", "dangerous", "brain", "collects", "opinion", "describe", "clear", "happens",
      "observatory", "soldiers", "better", "without", "deep", "healthy", "wonderful", "quality",
      "detail", "important", "disease", "useful", "alike", "donate", "oxygen", "Even", "complete",
    ];
    const l10 = L(10);
    l10.questions.forEach((q: { options: string[]; answer: number }, i: number) => {
      expect(q.options[q.answer], `B10-Q${i + 1}`).toBe(keys[i]);
      expect(q.options).toHaveLength(4);
    });
    // Q10 ساقه با soldiers (استعارهٔ چاپ) و Q24 آغاز با جای خالی
    expect(l10.questions[9].question).toContain("defend the body against microbes");
    expect(l10.questions[23].question.startsWith("--------------- if you take a taxi")).toBe(true);
  });

  it("ids unique across the whole 438-item family", () => {
    const ids = doc.lessons.flatMap((l: { questions: { id: string }[] }) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1466);
  });
});
