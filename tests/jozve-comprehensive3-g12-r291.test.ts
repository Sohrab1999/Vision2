import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { normalizeTypedAnswer } from "../src/lib/typed-answer";

type TQuestion = {
  id: string;
  n: number;
  category: string;
  kind?: "mcq" | "typed";
  question: string;
  options: string[];
  answer: number;
  accepted?: string[];
  placeholder?: string;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; family: string; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\//g, " ")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const COMP3 = [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58] as const;

// کلیدهای چاپی ص۲۲۶ — عیناً از «پاسخنامه آزمون جامع تشریحی درس سوم»
const K_VOC: Record<number, string> = {
  1: "absorb", 2: "pollute", 3: "demand", 4: "remind",
  5: "opposite", 6: "generate", 7: "blow", 8: "common",
};
const VOC_BANK = ["demand", "blow", "generate", "pollute", "common", "absorb", "forever", "remind", "opposite"];
const K_DEF: Record<number, string> = { 1: "replace", 2: "consumption", 3: "pollution", 4: "generation" };
const DEF_BANK = ["generation", "replace", "conversion", "consumption", "pollution"];
const K_PASS: Record<number, string> = { 1: "must be paid", 2: "may be produced", 3: "can be used", 4: "should be informed" };
const S7_KEYS: Record<number, string> = {
  1: "People must obey the traffic rules.",
  2: "The traffic rules must be obeyed by people.",
  3: "Scientists can change wind into electricity.",
  4: "Wind can be changed into electricity.",
};
const K_PT: Record<number, string> = {
  1: "arrived / had finished", 2: "phoned / had been", 3: "had had / broke", 4: "played / had gone",
};
const K_WO: Record<number, string> = {
  1: "When I arrived at the party my friends had already gone.",
  2: "Students should be informed about the possible harms.",
};
const ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"];

describe("jozve topic grammar bank g12 — comprehensive exam lesson 3 (r291 extraction receipt)", () => {
  it("bank shape: two hundred forty-seven lessons, comprehensive lesson-3 adds 12 banks / 53 items (family 1339)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 247 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = { 47: 8, 48: 4, 49: 4, 50: 4, 51: 4, 52: 4, 53: 4, 54: 2, 55: 4, 56: 6, 57: 5, 58: 4 };
    const levels: Record<number, string> = { 48: "استاندارد", 50: "استاندارد", 55: "استاندارد", 56: "استاندارد", 57: "استاندارد", 58: "استاندارد" };
    for (const n of COMP3) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("جامع درس سوم");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(47).questions.every((q) => q.id === `g12-comp3-v${q.n}`)).toBe(true);
    expect(L(56).questions.every((q) => q.id === `g12-comp3-clz${q.n}`)).toBe(true);
    // آزمون جامع درس سوم: ۵۳ آیتم در ۱۲ بانک — خانواده: ۶۲۵ + ۵۳ = ۶۷۸
    const compTotal = COMP3.reduce((a, n) => a + L(n).count, 0);
    expect(compTotal).toBe(53);
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1339);
  });

  it("typed vocab bank 47: all 8 printed keys (p226), closed 9-word bank scaffolds, forever is the printed extra word", () => {
    for (const q of L(47).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_VOC[q.n]]);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(K_VOC[q.n]));
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(q.options, q.id).toHaveLength(4);
      for (const o of q.options) expect(VOC_BANK, `${q.id}:${o}`).toContain(o);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.placeholder, q.id).toBe("fill in the blank with the word bank…");
      expect(FA.test(q.question), q.id).toBe(false);
    }
    const keys = L(47).questions.map((q) => q.accepted![0]);
    expect(new Set(keys).size).toBe(8);
    expect(keys, "forever must remain the extra word").not.toContain("forever");
  });

  it("mcq collocations bank 48: faithful FIVE printed options (a-e), grid c/d/a/e with e. sources as a real key", () => {
    const opts = ["instance", "balcony", "fuels", "energy", "sources"]; // a..e به ترتیب چاپ
    const answers: Record<number, number> = { 1: 2, 2: 3, 3: 0, 4: 4 }; // c / d / a / e
    const stems = ["fossil", "kinetic", "for", "main"];
    for (const q of L(48).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(opts);
      expect(q.answer, q.id).toBe(answers[q.n]);
      expect(q.question, q.id).toBe(stems[q.n - 1]);
      expect(FA.test(q.question), q.id).toBe(false);
    }
  });

  it("typed definitions bank 49: printed keys replace/consumption/pollution/generation, conversion is the extra word, closed pool", () => {
    const stemPrefix: Record<number, string> = {
      1: "To put something back in the right place",
      2: "The act of using energy, food or materials",
      3: "The process of making air, water, soil",
      4: "The production of something, especially electricity",
    };
    for (const q of L(49).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_DEF[q.n]]);
      expect(q.question, q.id).toMatch(new RegExp(`^${stemPrefix[q.n]}`));
      expect(q.options, q.id).toHaveLength(4);
      for (const o of q.options) expect(DEF_BANK, `${q.id}:${o}`).toContain(o);
      expect(q.placeholder, q.id).toBe("write the word from the bank…");
    }
    const keys = L(49).questions.map((q) => q.accepted![0]);
    expect(keys, "conversion must remain extra").not.toContain("conversion");
  });

  it("grammar MCQ bank 50: printed grid b/d/a/b with semantic locks (reported speech past perfect, passive fish salad)", () => {
    const locks: Record<number, { ans: number; opt: string; stemPart: string }> = {
      1: { ans: 1, opt: "had captured", stemPart: "The police reported" },
      2: { ans: 3, opt: "had seen", stemPart: "the week before" },
      3: { ans: 0, opt: "should do", stemPart: "global warming" },
      4: { ans: 1, opt: "may be made", stemPart: "by the cook" },
    };
    for (const q of L(50).questions) {
      const lk = locks[q.n];
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(lk.ans);
      expect(q.options[q.answer], q.id).toBe(lk.opt);
      expect(q.question, q.id).toContain(lk.stemPart);
      expect(FA.test(q.question), q.id).toBe(false);
    }
  });

  it("typed passive bank 51: printed keys must be paid / may be produced / can be used / should be informed, hints printed in stems", () => {
    const hints: Record<number, string> = { 1: "(must / pay)", 2: "(may / produce)", 3: "(can / use)", 4: "(should / inform)" };
    for (const q of L(51).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_PASS[q.n]]);
      expect(q.question, q.id).toContain(hints[q.n]);
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      for (const o of q.options) expect(Object.values(K_PASS), `${q.id}:${o}`).toContain(o);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.placeholder, q.id).toBe("write the passive form…");
    }
  });

  it("active/passive bank 52: two printed scrambles × two voices, suffix pattern — Active:/— Passive:, tokens ⊆ answers", () => {
    const scrambles: Record<string, string> = {
      "1": "must / rules / the / obey / people / traffic / .",
      "2": "electricity / can / scientists / into / change / wind / .",
    };
    for (const q of L(52).questions) {
      const scrambleNo = q.n <= 2 ? 1 : 2;
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([S7_KEYS[q.n]]);
      expect(q.question, q.id).toMatch(q.n % 2 === 1 ? /— Active:/ : /— Passive:/);
      expect(q.question, q.id).toContain(scrambles[String(scrambleNo)]);
      expect(q.placeholder, q.id).toBe("write the full sentence…");
      // هر جفت Active/Passive از یک بهم‌ریختهٔ چاپی می‌آید — کلیدها متمایزند
      for (const o of q.options) expect(Object.values(S7_KEYS), `${q.id}:${o}`).toContain(o);
      expect(new Set(q.options).size, q.id).toBe(4);
    }
    // داوری صدا: Active با فاعلِ انسانی آغاز، Passive با مفعولِ جابه‌جاشده
    expect(L(52).questions[0].accepted![0]).toMatch(/^People /);
    expect(L(52).questions[1].accepted![0]).toMatch(/^The traffic rules /);
    expect(L(52).questions[2].accepted![0]).toMatch(/^Scientists /);
    expect(L(52).questions[3].accepted![0]).toMatch(/^Wind /);
  });

  it("double-blank past-tense bank 53: PRINTED SLASH KEYS verbatim (arrived / had finished) — lib now slash-normalizes typed input", () => {
    const hints: Array<[string, string]> = [["(arrive)", "(finish)"], ["(phone)", "(be)"], ["(have)", "(break)"], ["(play)", "(go)"]];
    for (const q of L(53).questions) {
      const [h1, h2] = hints[q.n - 1];
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_PT[q.n]]);
      expect(q.question, q.id).toContain(h1);
      expect(q.question, q.id).toContain(h2);
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(2); // دوخالی چاپی
      for (const o of q.options) expect(Object.values(K_PT), `${q.id}:${o}`).toContain(o);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.placeholder, q.id).toBe("write both verb forms… (e.g. arrived / had finished)");
    }
    // نرمال‌سازیِ نو: هر سه شکلِ تایپِ محتمل به یک کلید می‌رسند — کلید چاپی با اسلش حاکم است
    const sample = K_PT[1];
    expect(normalizeTypedAnswer(sample)).toBe(normalizeTypedAnswer("arrived had finished"));
    expect(normalizeTypedAnswer(sample)).toBe(normalizeTypedAnswer("arrived/had finished"));
    expect(normalizeTypedAnswer("was / built")).toBe(normalizeTypedAnswer("was built")); // سازگار با کلید فضادارِ r287
  });

  it("word-order bank 54: two printed scrambles, tokens ⊆ printed answer sentences (p226)", () => {
    for (const q of L(54).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_WO[q.n]]);
      expect(q.placeholder, q.id).toBe("write the complete sentence…");
      const tokens = q.question.split("/").map((t) => norm(t)).filter((t) => t && t !== "," && t !== ".");
      const answerNorm = norm(K_WO[q.n]);
      for (const t of tokens) expect(answerNorm, `${q.id} token «${t}»`).toContain(t);
      expect(q.options, q.id).toEqual([K_WO[q.n], K_WO[q.n === 1 ? 2 : 1]]); // داربستِ حداقلیِ دوجمله‌ای
    }
    expect(L(54).questions[0].question).toMatch(/already/);
    expect(L(54).questions[1].question).toMatch(/informed/);
  });

  it("paragraph-roles bank 55: faithful THREE-option MCQ (topic/supporting/concluding), printed key Topic(3)/Supporting(1,4)/Concluding(2)", () => {
    const answers: Record<number, number> = { 1: 1, 2: 2, 3: 0, 4: 1 };
    for (const q of L(55).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(ROLE_OPTIONS); // ۳ گزینه — طبیعتِ خودِ تمرین (source.comprehensive3.threeRoles)
      expect(q.answer, q.id).toBe(answers[q.n]);
      expect(q.question, q.id).toMatch(/water/i); // هر چهار جملهٔ چاپی دربارهٔ آب‌اند
      expect(FA.test(q.question), q.id).toBe(false);
    }
    expect(L(55).questions[2].question).toMatch(/^Water is the most essential/);
    expect(L(55).questions[1].question).toMatch(/^Thus,/);
  });

  it("proverbs cloze bank 56 (six blanks, REVERSED print remapped): grid b/b/a/a/c/d with printed ---N--- markers", () => {
    const K_CLZ: Record<number, number> = { 1: 1, 2: 1, 3: 0, 4: 0, 5: 2, 6: 3 }; // b/b/a/a/c/d
    for (const q of L(56).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.question, q.id).toContain(`(---${q.n}---)`);
      expect(q.question.match(/\(---\d---\)/g) ?? [], q.id).toHaveLength(1);
      expect(q.question, q.id).not.toMatch(BLANK);
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(K_CLZ[q.n]);
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // رسیدِ متن: ضرب‌المثلِ هندوانه — قفلِ سرنخ‌ها + نگاشتِ معکوسِ وفادار
    expect(L(56).questions[0].question).toMatch(/watermelons in one hand/);
    expect(L(56).questions[0].options[1]).toBe("proverbs");
    expect(L(56).questions[1].options[1]).toBe("Its equivalent");
    expect(L(56).questions[2].options[0]).toBe("But I");
    expect(L(56).questions[4].options[2]).toBe("can see");
    expect(L(56).questions[5].options[3]).toBe("how much work");
  });

  it("wind-energy cloze bank 57 (five blanks, REVERSED print remapped): grid b/d/c/a/b", () => {
    const K_WND: Record<number, number> = { 1: 1, 2: 3, 3: 2, 4: 0, 5: 1 }; // b/d/c/a/b
    for (const q of L(57).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.question, q.id).toContain(`(---${q.n}---)`);
      expect(q.question.match(/\(---\d---\)/g) ?? [], q.id).toHaveLength(1);
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(K_WND[q.n]);
    }
    // قفل‌های معنایی: باد انرژیِ خورشیدی است، توربین مکانیکی می‌سازد
    expect(L(57).questions[0].options[1]).toBe("solar");
    expect(L(57).questions[1].options[3]).toBe("can be used");
    expect(L(57).questions[2].options[2]).toBe("convert");
    expect(L(57).questions[3].options[0]).toBe("mechanical");
    expect(L(57).questions[4].options[1]).toBe("power");
    expect(L(57).questions[1].question).toMatch(/“harvested”/);
  });

  it("dolphins reading bank 58: printed grid d/c/d/a with the reversed-synonym receipt locked (a=complicated)", () => {
    const locks: Record<number, { ans: number; opt: string }> = {
      1: { ans: 3, opt: "have a reputation for being friendly to humans" },
      2: { ans: 2, opt: "does not mean that we are superior to them" },
      3: { ans: 3, opt: "dolphins have some social traits that are similar to those of humans" },
      4: { ans: 0, opt: "complicated" },
    };
    for (const q of L(58).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(locks[q.n].ans);
      expect(q.options[q.answer], q.id).toBe(locks[q.n].opt);
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // رسیدِ ترتیبِ معکوسِ چاپی Q4 — نگاشت وفادار a..d
    expect(L(58).questions[3].options).toEqual(["complicated", "strong", "dedicated", "reliable"]);
    // رسیدِ غلط چاپی: «from» به‌جای «form» — وفادار ماندیم
    expect(L(58).questions[1].options[1]).toContain("sophisticated from of communication");
  });

  it("id uniqueness across the whole 247-bank family (1339 ids) + comprehensive lesson-3 banks introduce zero new stem collisions", () => {
    const all = bank.lessons.flatMap((l) => l.questions);
    const ids = new Set(all.map((q) => q.id));
    expect(ids.size).toBe(1339);
    const stems = new Set(
      bank.lessons
        .filter((l) => l.lesson < 47)
        .flatMap((l) => l.questions.map((q) => norm(q.question.replace(/-+/g, " ").replace(/\(---\d---\)/g, " "))))
    );
    for (const n of COMP3) {
      for (const q of L(n).questions) {
        const key = norm(q.question.replace(/-+/g, " ").replace(/\(---\d---\)/g, " "));
        expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
      }
    }
  });

  it("provenance: source.comprehensive3 receipt (r291) + prior blocks frozen + kind purity of the new banks", () => {
    const cp = bank.source.comprehensive3 as Record<string, unknown> | undefined;
    expect(cp).toBeTruthy();
    expect(cp?.extractedRound).toBe(291);
    expect(String(cp?.pages)).toContain("156");
    expect(String(cp?.pages)).toContain("159");
    expect(String(cp?.questions)).toContain("53");
    expect(JSON.stringify(cp?.visualAbsent)).toContain("1.D");
    expect(JSON.stringify(cp?.threeRoles)).toContain("Concluding");
    expect(JSON.stringify(cp?.reversedPrint)).toContain("13-4");
    expect(JSON.stringify(cp?.slashKeys)).toContain("normalizeTypedAnswer");
    expect(JSON.stringify(cp?.receipts)).toContain("from به‌جای form");
    // بلوک‌های پیشین منجمد
    expect((bank.source.comprehensive2 as Record<string, unknown>).extractedRound).toBe(290);
    expect((bank.source.comprehensive as Record<string, unknown>).extractedRound).toBe(289);
    expect((bank.source.diagnostic as Record<string, unknown>).extractedRound).toBe(287);
    expect((bank.source.stats as Record<string, number>).questions).toBe(88);
    // خلوصِ kinds — تایپی‌ها / mcqها
    for (const n of [47, 49, 51, 52, 53, 54]) {
      expect(L(n).questions.every((q) => q.kind === "typed"), L(n).title).toBe(true);
    }
    for (const n of [48, 50, 55, 56, 57, 58]) {
      expect(L(n).questions.every((q) => q.kind === undefined), L(n).title).toBe(true);
    }
  });
});
