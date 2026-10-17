import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

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
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const COMP2 = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46] as const;

// کلیدهای چاپی ص۲۱۳ — عیناً از «آزمون جامع تشریحی درس دوم»
const K_VOC: Record<number, string> = {
  1: "combine", 2: "arrange", 3: "compile", 4: "advanced",
  5: "jumped", 6: "recommend", 7: "respect", 8: "suppose",
};
const VOC_BANK = ["recommend", "jumped", "respect", "wonder", "compile", "advanced", "suppose", "arrange", "combine"];
const K_DEF: Record<number, string> = { 1: "effective", 2: "symbol", 3: "jump into", 4: "figure out" };
const DEF_BANK = ["symbol", "entry", "effective", "jump into", "figure out"];
const K_VF: Record<number, string> = { 1: "lost", 2: "would be", 3: "didn't invite", 4: "would pass" };
const K_UN: Record<number, string> = {
  1: "The book which I read yesterday was a detective story.",
  2: "If I had enough money, I would buy a modern car.",
  3: "What would you do if you didn't have any teeth?",
  4: "His wife is a woman who loves jokes.",
};
const OPEN_KEYS: Record<number, string> = {
  5: "The Nobel Prize was awarded to Einstein for physics in 1921.",
  6: "He wrote a letter to President Roosevelt expressing his worry about the atomic bomb.",
};

describe("jozve topic grammar bank g12 — comprehensive exam lesson 2 (r290 extraction receipt)", () => {
  it("bank shape: two hundred twenty-seven lessons, comprehensive lesson-2 adds 10 banks / 51 items (family 1283)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 227 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = { 37: 8, 38: 4, 39: 4, 40: 8, 41: 4, 42: 4, 43: 4, 44: 5, 45: 6, 46: 4 };
    const levels: Record<number, string> = { 38: "استاندارد", 40: "استاندارد", 44: "استاندارد", 46: "استاندارد" };
    for (const n of COMP2) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("جامع درس دوم");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(37).questions.every((q) => q.id === `g12-comp2-v${q.n}`)).toBe(true);
    expect(L(44).questions.every((q) => q.id === `g12-comp2-clz${q.n}`)).toBe(true);
    // آزمون جامع درس دوم: ۵۱ آیتم در ۱۰ بانک — خانواده: ۵۷۴ + ۵۱ = ۶۲۵
    const compTotal = COMP2.reduce((a, n) => a + L(n).count, 0);
    expect(compTotal).toBe(51);
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1283);
  });

  it("typed vocab bank 37: all 8 printed keys (p213), closed 9-word bank scaffolds, wonder is the printed extra word", () => {
    for (const q of L(37).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_VOC[q.n]]);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(K_VOC[q.n]));
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(q.options, q.id).toHaveLength(4);
      // داربست = استخرِ بستهٔ بانک ۹تایی چاپی — هیچ داربست بیرون از بانک
      for (const o of q.options) expect(VOC_BANK, `${q.id}:${o}`).toContain(o);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.placeholder, q.id).toBe("fill in the blank with the word bank…");
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // هشت کلیدِ متمایز؛ «wonder» واژهٔ اضافهٔ چاپی است (۹ واژه − ۸ کلید = ۱ اضافه)
    const keys = L(37).questions.map((q) => q.accepted![0]);
    expect(new Set(keys).size).toBe(8);
    expect(keys, "wonder must remain the extra word").not.toContain("wonder");
  });

  it("mcq collocations bank 38: faithful FIVE printed options (a-e incl. real 'word attack'), grid c/e/d/a", () => {
    const opts = ["dictionary", "symbol", "tips", "words", "attack"]; // a..e به ترتیب چاپ
    const answers: Record<number, number> = { 1: 2, 2: 4, 3: 3, 4: 0 }; // c / e / d / a
    const stems = ["helpful", "word", "complicated", "bilingual"];
    for (const q of L(38).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(opts); // ۵ گزینهٔ چاپی — انحرافِ مستند (source.comprehensive2.fiveOptions)
      expect(q.answer, q.id).toBe(answers[q.n]);
      expect(q.question, q.id).toBe(stems[q.n - 1]);
      expect(FA.test(q.question), q.id).toBe(false);
    }
  });

  it("typed definitions bank 39: printed keys effective/symbol/jump into/figure out, entry is the extra word, closed pool", () => {
    const stemPrefix: Record<number, string> = {
      1: "Successful or achieving the results",
      2: "Something that stands for something else",
      3: "To suddenly decide to do something",
      4: "To understand or solve something",
    };
    for (const q of L(39).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_DEF[q.n]]);
      expect(q.question, q.id).toMatch(new RegExp(`^${stemPrefix[q.n]}`));
      expect(q.options, q.id).toHaveLength(4);
      for (const o of q.options) expect(DEF_BANK, `${q.id}:${o}`).toContain(o);
      expect(q.placeholder, q.id).toBe("write the word from the bank…");
    }
    const keys = L(39).questions.map((q) => q.accepted![0]);
    expect(keys, "entry must remain extra").not.toContain("entry");
  });

  it("grammar MCQ bank 40: printed grid b/b/a/b/a/d/b/b with semantic locks (second conditional, astronaut were, horse which)", () => {
    const locks: Record<number, { ans: number; opt: string }> = {
      1: { ans: 1, opt: "communicative" },
      2: { ans: 1, opt: "unsuccessfully" },
      3: { ans: 0, opt: "unexpectedly" },
      4: { ans: 1, opt: "endangering" },
      5: { ans: 0, opt: "Would / go" },
      6: { ans: 3, opt: "were" },
      7: { ans: 1, opt: "which" },
      8: { ans: 1, opt: "who" },
    };
    for (const q of L(40).questions) {
      const lk = locks[q.n];
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(lk.ans);
      expect(q.options[q.answer], q.id).toBe(lk.opt);
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // قفل‌های معنایی
    expect(L(40).questions[4].question).toMatch(/if you didn't work/); // شرطیِ نوع دوم → Would/go
    expect(L(40).questions[5].question).toMatch(/would you like to travel/); // دومِ مجازی → were
    expect(L(40).questions[6].question).toMatch(/horse/); // جانور → which
    expect(L(40).questions[7].question).toMatch(/the man/); // انسان فاعل → who
  });

  it("typed who/which bank 41: closed two-word pool {who, which} with polarity-preserving semantic locks", () => {
    const K_REL: Record<number, string> = { 1: "which", 2: "which", 3: "who", 4: "who" };
    for (const q of L(41).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_REL[q.n]]);
      expect(q.options, q.id).toEqual([K_REL[q.n], K_REL[q.n] === "which" ? "who" : "which"]);
      expect(q.placeholder, q.id).toBe("fill in the blank… (who / which)");
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // قفل‌های معنایی: غیرقیدگذاری‌شدهٔ جمع → which؛ انسانِ فاعل → who
    expect(L(41).questions[0].question).toMatch(/Summer holidays,/);
    expect(L(41).questions[2].question).toMatch(/The old lady/);
    expect(L(41).questions[3].question).toMatch(/The child/);
  });

  it("typed conditional verb-forms bank 42: printed keys lost/would be/didn't invite/would pass, hints printed in stems, closed pool", () => {
    const hints: Record<number, string> = { 1: "(lose)", 2: "(be)", 3: "(not / invite)", 4: "(pass)" };
    for (const q of L(42).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_VF[q.n]]);
      expect(q.question, q.id).toContain(hints[q.n]);
      for (const o of q.options) expect(Object.values(K_VF), `${q.id}:${o}`).toContain(o);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.placeholder, q.id).toBe("write the correct verb form…");
    }
    // داوری زمانیِ شرط: گذشتهٔ سادهٔ if → would + مصدر
    expect(L(42).questions[0].question).toMatch(/If I /);
    expect(L(42).questions[3].question).toMatch(/were easy enough/);
    // رسیدِ غلط چاپی: «birth day» دوواژه‌ای طبق چاپ — در stem و در provenance
    expect(L(42).questions[2].question).toContain("birth day");
  });

  it("word-order bank 43: scramble tokens ⊆ printed answer sentences, accepted verbatim from p213", () => {
    for (const q of L(43).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_UN[q.n]]);
      expect(q.placeholder, q.id).toBe("write the complete sentence…");
      const tokens = q.question.split("/").map((t) => norm(t)).filter((t) => t && t !== "," && t !== ".");
      const answerNorm = norm(K_UN[q.n]);
      for (const t of tokens) expect(answerNorm, `${q.id} token «${t}»`).toContain(t);
      for (const o of q.options) expect(Object.values(K_UN), `${q.id}:${o}`).toContain(o);
      expect(new Set(q.options).size, q.id).toBe(4);
    }
    // پرسشیِ Q3 با «?» چاپی و نقطهٔ پایانیِ بقیه
    expect(L(43).questions[2].question.endsWith("?")).toBe(true);
  });

  it("five-blank cloze bank 44 (bilingual-brain passage): printed ---N--- markers, one blank per window, grid a/c/d/a/a", () => {
    const K_CLZ: Record<number, number> = { 1: 0, 2: 2, 3: 3, 4: 0, 5: 0 }; // a/c/d/a/a
    for (const q of L(44).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.question, q.id).toContain(`(---${q.n}---)`);
      expect(q.question.match(/\(---\d---\)/g) ?? [], q.id).toHaveLength(1);
      expect(q.question, q.id).not.toMatch(BLANK);
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(K_CLZ[q.n]);
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // رسیدِ متن: مطالعهٔ دوزبانه‌ها — قفلِ سرنخ‌ها
    expect(L(44).questions[0].question).toMatch(/Brain scans showed that people/);
    expect(L(44).questions[1].question).toMatch(/Nov\. 12 in the journal Brain and Language/);
    expect(L(44).questions[3].question).toMatch(/Viorica Marian/);
    expect(L(44).questions[4].options[0]).toBe("monolinguals");
  });

  it("reading bank 45 (Einstein): two MCQ b/c + True/False a/b + two open typed questions keyed verbatim from p213", () => {
    const l45 = L(45);
    expect(l45.questions[0].kind).toBeUndefined();
    expect(l45.questions[1].kind).toBeUndefined();
    expect(l45.questions[0].answer).toBe(1); // b. American citizen
    expect(l45.questions[0].options[1]).toBe("American citizen");
    expect(l45.questions[1].answer).toBe(2); // c. health problems
    expect(l45.questions[1].options[2]).toBe("health problems");
    // درست/نادرست — کلیدهای چاپی a/b
    expect(l45.questions[2].options).toEqual(["True", "False"]);
    expect(l45.questions[2].answer).toBe(0); // a=True
    expect(l45.questions[3].options).toEqual(["True", "False"]);
    expect(l45.questions[3].answer).toBe(1); // b=False — «easily» خلافِ متن
    for (const q of [l45.questions[4], l45.questions[5]]) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([OPEN_KEYS[q.n as 5 | 6]]);
      expect(q.placeholder, q.id).toBeUndefined(); // «type your answer…» خودکار
      expect(q.options, q.id).toHaveLength(2); // داربستِ حداقلیِ دوکلیدی — جعلِ گزینه ممنوع
    }
    expect(l45.questions[4].question).toMatch(/Nobel Prize/);
    expect(l45.questions[5].question).toMatch(/atomic bomb/);
  });

  it("reading MCQ bank 46 (Leonardo): printed grid b/c/d/b with the reversed-options receipt locked (rm2 a=nearly/b=sadly/c=anxiously/d=bravely)", () => {
    const locks: Record<number, { ans: number; opt: string }> = {
      1: { ans: 1, opt: "Leonardo's art and invention talent" },
      2: { ans: 2, opt: "anxiously" },
      3: { ans: 3, opt: "A pump worked by water-power to bring water from a stream to a house was invented by Leonardo." },
      4: { ans: 1, opt: "Where is one of the most Leonardo's famous paintings now?" },
    };
    for (const q of L(46).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(locks[q.n].ans);
      expect(q.options[q.answer], q.id).toBe(locks[q.n].opt);
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // رسیدِ ترتیبِ معکوسِ چاپی — گزینه‌ها با نگاشتِ وفادارِ a..d
    const rm2 = L(46).questions[1];
    expect(rm2.options).toEqual(["nearly", "sadly", "anxiously", "bravely"]);
    expect(rm2.answer).toBe(2); // کلید چاپی c=anxiously
    expect(rm2.question).toContain("“eagerly”");
  });

  it("id uniqueness across the whole 227-bank family (1283 ids) + comprehensive lesson-2 banks introduce zero new stem collisions", () => {
    const all = bank.lessons.flatMap((l) => l.questions);
    const ids = new Set(all.map((q) => q.id));
    expect(ids.size).toBe(1283);
    const stems = new Set(
      bank.lessons
        .filter((l) => l.lesson < 37)
        .flatMap((l) => l.questions.map((q) => norm(q.question.replace(/-+/g, " ").replace(/\(---\d---\)/g, " "))))
    );
    for (const n of COMP2) {
      for (const q of L(n).questions) {
        const key = norm(q.question.replace(/-+/g, " ").replace(/\(---\d---\)/g, " "));
        expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
      }
    }
  });

  it("provenance: source.comprehensive2 receipt (r290) + prior blocks frozen + kind purity of the new banks", () => {
    const cp = bank.source.comprehensive2 as Record<string, unknown> | undefined;
    expect(cp).toBeTruthy();
    expect(cp?.extractedRound).toBe(290);
    expect(String(cp?.pages)).toContain("109");
    expect(String(cp?.pages)).toContain("113");
    expect(String(cp?.questions)).toContain("51");
    expect(JSON.stringify(cp?.visualAbsent)).toContain("1.D");
    expect(JSON.stringify(cp?.openEndedNoPrintedKey)).toContain("topic sentence");
    expect(JSON.stringify(cp?.fiveOptions)).toContain("word attack");
    expect(JSON.stringify(cp?.leonardoReversed)).toContain("anxiously");
    expect(JSON.stringify(cp?.receipts)).toContain("birth day");
    // بلوک‌های پیشین منجمد
    expect((bank.source.comprehensive as Record<string, unknown>).extractedRound).toBe(289);
    expect((bank.source.diagnostic as Record<string, unknown>).extractedRound).toBe(287);
    expect((bank.source.diagnosticS89 as Record<string, unknown>).extractedRound).toBe(288);
    expect((bank.source.stats as Record<string, number>).questions).toBe(88);
    // خلوصِ kinds — تایپی‌ها / mcqها / بانکِ مختلطِ ریدینگ
    for (const n of [37, 39, 41, 42, 43]) {
      expect(L(n).questions.every((q) => q.kind === "typed"), L(n).title).toBe(true);
    }
    for (const n of [38, 40, 44, 46]) {
      expect(L(n).questions.every((q) => q.kind === undefined), L(n).title).toBe(true);
    }
    const l45 = L(45);
    expect(l45.questions.filter((q) => q.kind === "typed")).toHaveLength(2);
    expect(l45.questions.filter((q) => q.kind === undefined)).toHaveLength(4);
  });
});
