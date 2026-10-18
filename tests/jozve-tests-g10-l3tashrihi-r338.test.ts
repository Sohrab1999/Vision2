import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r338 — گاردِ بانک‌های ۵۳-۵۶ِ tests-g10: «آزمون تشریحی واژگان درس سوم»
// (ص۱۲۰-۱۲۲، کلید واژه‌ای چاپی ص۲۷۴ — عینِ الگوی r323/r326 برای درس سوم)
// قفل: ۱۶ کلیدِ بانک‌واژه + ۸ حرف اول (زیرخطِ چاپ در ۶ آیتم کوتاه‌تر — قاعدهٔ r323-Q7)
// + ۸ تعریف + ۲۵ MCQِ واژه‌ای (گریدِ کلیدِ «1.Experimentig» بدونِ n — گزینهٔ سؤال تمیز)

const doc = JSON.parse(fs.readFileSync("public/jozve/tests-g10.json", "utf-8"));
const L = (n: number) => doc.lessons.find((l: { lesson: number }) => l.lesson === n);

describe("tests-g10 tashrihi3 — تشریحی واژگان درس سوم (r338)", () => {
  it("receipt tashrihi3 with sections/keyPages/pattern/quirks", () => {
    const src = doc.source.tashrihi3;
    expect(src).toBeTruthy();
    expect(src.keyPages).toBe("274");
    expect(src.extractedRound).toBe("r338");
    expect(src.header).toContain("درس سوم");
    expect(src.header).toContain("۲۷۴");
    expect(src.header).toContain("تسی یچ"); // لایه‌غلطِ پنجمِ تشریحی — رندر حاکم
    expect(src.keyVerification).toContain("۵۷/۵۷");
    expect(src.pattern).toContain("r323/r326");
    expect(src.printQuirks.some((q: string) => q.includes("Experimentig"))).toBe(true);
    expect(src.printQuirks.some((q: string) => q.includes("دو تیره کم"))).toBe(true);
  });

  it("file shape: 56 banks, family 734 items (4 tashrihi3 appended)", () => {
    expect(doc.grade).toBe(10);
    expect(doc.lessons).toHaveLength(66);
    expect(doc.lessons.slice(6).map((l: { count: number }) => l.count)).toEqual([16, 8, 8, 25, 40, 40, 15, 7, 5, 10, 20, 16, 12, 6, 7, 14, 6, 6, 40, 15, 7, 10, 12, 20, 45, 16, 12, 5, 7, 4, 6, 8, 8, 6, 6, 3, 4, 6, 6, 1, 4, 6, 2, 8, 6, 6, 16, 8, 8, 25, 40, 10, 7, 7, 5, 5, 10, 5, 5, 20]);
    expect(doc.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(848);
  });

  it("bank 53 (بانک واژه): 16 typed keys locked to p274, extras situation/interview never the accepted key", () => {
    const keys = [
      "fortunately", "inventions", "medicines", "lives", "try", "developed", "experiments", "possible",
      "translate", "knowledge", "published", "passed", "thousands", "cradle", "solve", "inventors",
    ];
    const l53 = L(53);
    expect(l53.title).toContain("ص۱۲۰");
    l53.questions.forEach((q: { accepted: string[]; options: string[]; question: string; kind: string }, i: number) => {
      expect(q.kind, `B53-Q${i + 1} kind`).toBe("typed");
      expect(q.accepted, `B53-Q${i + 1}`).toEqual([keys[i]]);
      expect(q.question, `B53-Q${i + 1} bank suffix`).toContain("[bank:");
    });
    // دو زیربانکِ چاپِ ۹کلمه‌ای — اضافه‌ها در گزینه‌ها هست (حواس‌پرت‌کنِ چاپ) ولی هرگز accepted نیست
    expect(l53.questions[0].question).toContain("situation");
    expect(l53.questions[8].question).toContain("interview");
    expect(l53.questions.every((q: { accepted: string[] }) => q.accepted[0] !== "situation" && q.accepted[0] !== "interview")).toBe(true);
    // کوئیرکِ کامای چسبیدهٔ Q1
    expect(l53.questions[0].question).toContain("------------------, we got home");
    // آپاستروفِ تایپوگرافیکِ چاپ در Q4/Q12
    expect(l53.questions[3].question).toContain("scientists’");
    expect(l53.questions[11].question).toContain("She’s");
  });

  it("bank 54 (حرف اول): stems verbatim — underline count SHORT of key length in 6/8 (print quirk; r323-Q7 rule)", () => {
    const keys = ["inventor", "camera", "telephone", "patient", "bulb", "energetic", "airplane", "winter"];
    // شمارِ زیرخطِ عینِ چاپ (لایه + رندر ۶۰۰dpi)
    const printedUnderscores = [7, 4, 8, 5, 2, 7, 5, 4];
    const l54 = L(54);
    l54.questions.forEach((q: { accepted: string[]; question: string; kind: string }, i: number) => {
      expect(q.kind, `B54-Q${i + 1} kind`).toBe("typed");
      expect(q.accepted, `B54-Q${i + 1}`).toEqual([keys[i]]);
      const underscores = (q.question.match(/_/g) || []).length;
      expect(underscores, `B54-Q${i + 1} printed underscores`).toBe(printedUnderscores[i]);
      expect(q.question.toLowerCase().includes(` ${keys[i]}`)).toBe(false); // نشتِ کلید در ساقه ممنوع
    });
    // فقط Q1 و Q3 هم‌طولِ کلیدند؛ شش تای دیگر کوتاه‌تر از کلیدِ گریدِ ص۲۷۴ چاپ شده‌اند
    expect(printedUnderscores.map((u, i) => u + 1 === keys[i].length)).toEqual([true, false, true, false, false, false, false, false]);
    // دو تیرهٔ کمِ Q7 (airplane=۸ ولی چاپ a+۵)
    expect(l54.questions[6].question).toContain("(a _ _ _ _ _ )");
  });

  it("bank 55 (تعریف‌ها): 8 typed definitions, extra description in options but never accepted", () => {
    const keys = ["translator", "experiment", "noise", "thinker", "value", "careless", "quit", "weak"];
    const l55 = L(55);
    l55.questions.forEach((q: { accepted: string[]; options: string[]; question: string; kind: string }, i: number) => {
      expect(q.kind, `B55-Q${i + 1} kind`).toBe("typed");
      expect(q.accepted, `B55-Q${i + 1}`).toEqual([keys[i]]);
      expect(q.question, `B55-Q${i + 1} ends with colon`).toMatch(/:$/);
      expect(q.options, `B55-Q${i + 1} full printed bank`).toContain("description");
    });
    expect(l55.questions.every((q: { accepted: string[] }) => q.accepted[0] !== "description")).toBe(true);
    expect(l55.questions[0].question).toContain("changing words"); // تعریفِ مترجم
  });

  it("bank 56 (چهارگزینه‌ای): 25 MCQ keys locked to printed word grid p274 — key-grid «Experimentig» typo vs clean option", () => {
    const keyWords = ["Experimenting", "during", "believe", "after", "history", "moment", "observe", "meaning", "put / aside", "unfortunately", "heavily", "emotions", "brought", "successful", "became", "called", "successful", "behave", "quit", "possible", "research", "emphasis", "special", "finally", "belief"];
    const l56 = L(56);
    expect(l56.questions).toHaveLength(25);
    l56.questions.forEach((q: { options: string[]; answer: number; question: string; kind?: string }, i: number) => {
      expect(q.kind, `B56-Q${i + 1} kind`).toBeUndefined(); // MCQ — بدونِ kind
      expect(q.options[q.answer], `B56-Q${i + 1}`).toBe(keyWords[i]);
    });
    // گریدِ چاپ «1.Experimentig» بدونِ n — ولی گزینهٔ سؤال «Experimenting» تمیز (رندر ۶۰۰dpi)
    expect(l56.questions[0].options[2]).toBe("Experimenting");
    // Q9 دوجای‌خالی با گزینه‌های اسلش‌دارِ چاپِ فاصله‌دار
    expect(l56.questions[8].question.match(/------------------/g)?.length).toBe(2);
    expect(l56.questions[8].options).toEqual(["be / after", "give / up", "put / aside", "grow / up"]);
    // Q6 «Could you mind» عینِ چاپ + Q23 گزینهٔ سایه‌دارِ چاپ
    expect(l56.questions[5].question).toContain("Could you mind my bag");
    expect(l56.questions[22].options[1]).toBe("special");
    // Q14 آپاستروفِ چاپ
    expect(l56.questions[17].question).toContain("I’m ashamed");
  });

  it("no duplicate ids across the whole family (828)", () => {
    const ids = doc.lessons.flatMap((l: { questions: { id: string }[] }) => l.questions.map((q: { id: string }) => q.id));
    expect(ids.length).toBe(848);
    expect(new Set(ids).size).toBe(848);
  });
});
