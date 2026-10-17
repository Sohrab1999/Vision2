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

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const FIN1400KHR = [209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227] as const;

// کلیدهای چاپیِ «راهنمای تصحیح خرداد ۱۴۰۰» ص۳۱۳-۳۱۴ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1TF: Record<number, string> = { 1: "b", 2: "b", 3: "a", 4: "a" }; // False/False/True/True
const K_L2: Record<number, string> = { 1: "b", 2: "c", 3: "c", 4: "a" }; // سه‌گزینه‌ایِ چاپی — نخستین بار در خانواده
const K_PIC: Record<number, string> = { 1: "e", 2: "d", 3: "a", 4: "c" }; // b اضافهٔ چاپی — جایگاهِ دوم
const K_DEF: Record<number, string> = { 1: "d", 2: "c", 3: "b" }; // a اضافه — جای نخست
const K_G: Record<number, string> = { 1: "b", 2: "d", 3: "a", 4: "d" };
const K_R1TF: Record<number, string> = { 1: "a", 2: "a" }; // True / True
const K_R1M: Record<number, string> = { 3: "c", 4: "b" };
const K_R2TF: Record<number, string> = { 1: "a", 2: "b" }; // True / False
const K_R2M: Record<number, string> = { 3: "b", 4: "a" };
const K_R3TF: Record<number, string> = { 1: "a", 2: "b" }; // True / False
const K_R3M: Record<number, string> = { 3: "c", 4: "d" };

describe("jozve topic grammar bank g12 — official nationwide khordad 1400 exam (r302 extraction receipt)", () => {
  it("bank shape: two hundred sixty-five lessons, khordad 1400 official adds 19 banks / 56 items (family 1390)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 265 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      209: 4, 210: 4, 211: 4, 212: 3, 213: 4, 214: 3, 215: 3, 216: 1,
      217: 4, 218: 1, 219: 2, 220: 1, 221: 4, 222: 4, 223: 1, 224: 4,
      225: 2, 226: 1, 227: 6,
    };
    const levels: Record<number, string> = {
      209: "استاندارد", 210: "استاندارد", 213: "استاندارد", 215: "استاندارد",
      217: "استاندارد", 221: "استاندارد", 222: "استاندارد", 224: "استاندارد",
    };
    for (const n of FIN1400KHR) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی سراسری خرداد ۱۴۰۰");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(209).questions.map((q) => q.id)).toEqual([
      "g12-fin1400khr-l1tf1", "g12-fin1400khr-l1tf2", "g12-fin1400khr-l1tf3", "g12-fin1400khr-l1tf4",
    ]);
    expect(L(227).questions.map((q) => q.id)).toEqual([
      "g12-fin1400khr-ord1", "g12-fin1400khr-ord2", "g12-fin1400khr-ord3",
      "g12-fin1400khr-ord4", "g12-fin1400khr-ord5", "g12-fin1400khr-ord6",
    ]);
    // آزمون رسمی سراسری خرداد ۱۴۰۰: ۵۶ آیتم در ۱۹ بانک — خانواده: ۱۲۲۷ + ۵۶ = ۱۲۸۳
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1390);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1390);
  });

  it("provenance: source.final1400khr registered — third official-source round, near-complete key 56/57, whole listening playable, first three-option listening MCQ", () => {
    const src = bank.source.final1400khr as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("308-312");
    expect(String(src.keyPages)).toContain("313-314");
    expect(src.banks).toBe(19);
    expect(src.questions).toBe(56);
    expect(src.keys).toBe(56);
    expect(src.sections).toBe(19);
    expect(src.extractedRound).toBe(302);
    expect(src.audioFilesAbsent).toBe(true); // بخشِ شنیداری هست؛ فایلِ صوتی در دسترس نیست
    expect(String(src.titlePrinted)).toContain("خرداد ماه سال ۱۴۰۰");
    expect(String(src.titlePrinted)).toContain("ریاضی-فیزیک و علوم تجربی");
    expect(String(src.branchVariant)).toContain("شش‌جمله‌ای");
    expect(String(src.branchVariant)).toContain("نزدیک‌ترین پوشش");
    expect(String(src.branchVariant)).toContain("سه‌گزینه‌ای");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Sport");
    const receipts = String(src.receipts);
    expect(receipts).toContain("but he had to read it"); // کلیدِ نیمه‌جمله‌ایِ چاپیِ ۵۰
  });

  it("listening file 1 T/F (209): gym story — keys b/b/a/a", () => {
    const qs = L(209).questions;
    expect(qs.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "b", "a", "a"]);
    expect(String(qs[0].question)).toContain("Roya will go to the gym on Saturday.");
    expect(String(qs[3].question)).toContain("less active sports like chess");
  });

  it("NEW listening file 2 (210): FIRST three-option MCQ of the family — restaurant keys b/c/c/a", () => {
    const qs = L(210).questions;
    expect(qs.every((q) => q.options.length === 3)).toBe(true); // درسِ r301: ساختارِ گزینه‌ها ثابت نیست
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "c", "c", "a"]);
    expect(qs[0].options).toEqual(["it was expensive", "they didn’t want to", "the restaurant was too far"]);
    expect(qs[2].options).toEqual(["fish and chips", "chicken with chips", "chicken with rice"]);
    expect(String(qs[3].question)).toContain("never tasted their");
  });

  it("environment fill (211): numbered printed blanks ……9……-……12…… — around/social/land/protect", () => {
    const qs = L(211).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["around", "social", "land", "protect"]);
    expect(String(qs[0].question)).toContain("……9……---------------");
    expect(String(qs[2].question)).toContain("the oceans, …...11……., seas, etc");
    for (const q of qs) expect(String(q.placeholder)).toContain("fill in the blank");
  });

  it("listening file 4 (212): mixed T/F (b/a) + typed listen — promising theme", () => {
    const qs = L(212).questions;
    expect(qs.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(qs[2].kind).toBe("typed");
    expect(qs[2].accepted).toEqual(["listen"]);
    expect(String(qs[0].question)).toContain("Promising others can make our world a better place");
  });

  it("picture vocab (213): extra (b) in SECOND position — third distinct extra spot (r299/r300 last, r301 first) — keys e/d/a/c", () => {
    const qs = L(213).questions;
    expect(qs.every((q) => q.options.length === 5)).toBe(true);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["e", "d", "a", "c"]);
    expect(qs[0].options[1]).toBe("I have kept a diary for twelve years."); // اضافه
    expect(String(qs[0].question)).toContain("با توجه به تصاویر");
  });

  it("pool bank (214): printed pool suppose/use up/distinguished/fossil (suppose extra FIRST) — keys fossil/use up/distinguished", () => {
    const qs = L(214).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["suppose", "use up", "distinguished", "fossil"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["fossil", "use up", "distinguished"]);
    expect(String(qs[2].question)).toContain("Dr. Gharib was known as a");
  });

  it("definitions (215): full A-sentences as stems, extra (a) in FIRST position — keys d/c/b", () => {
    const qs = L(215).questions;
    expect(qs.every((q) => q.options.length === 4)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["d", "c", "b"]);
    expect(String(qs[0].question)).toContain("I did not read the introduction and jumped into the next part.");
    expect(qs[0].options[0]).toContain("to put things in a neat, attractive, or useful order"); // اضافه
  });

  it("own knowledge (216): printed letter-gap s- - - - — speak (actions speak louder)", () => {
    const qs = L(216).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["speak"]);
    expect(String(qs[0].question)).toContain("“Actions s --------------- louder than words”");
    for (const q of qs) expect(String(q.placeholder)).toContain("first letter");
  });

  it("grammar (217): tag/relative/passive-modal/conditional — keys b/d/a/d", () => {
    const qs = L(217).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "d", "a", "d"]);
    expect(String(qs[0].question)).toContain("Hamid doesn’t say a bad word");
    expect(qs[2].options[0]).toBe("may be made");
  });

  it("verb form (218): printed hint (pay) — had paid", () => {
    const qs = L(218).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["had paid"]);
    expect(String(qs[0].question)).toContain("too much. (pay)");
    for (const q of qs) expect(String(q.placeholder)).toContain("پرانتز");
  });

  it("word order (219): two keys reconstructed from the printed scrambled grid — (0/5) bar marks documented in receipts", () => {
    const qs = L(219).questions;
    expect(qs[0].accepted).toEqual(["Joe had already learned Chinese when he moved to China."]);
    expect(qs[1].accepted).toEqual(["They would buy a house if they were you."]);
    expect(String(qs[0].question)).toContain("moved to China / had already learned/ Chinese/ Joe/ he/ when /. /");
    expect(String(qs[1].question)).toContain("you /if / They / a house /  would buy / they were /./");
  });

  it("relative pronoun (220): printed guide key «which» + explanatory note — multi-modal single-slot pattern of r301", () => {
    const qs = L(220).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["which"]);
    expect(String(qs[0].question)).toContain("A horse is an animal");
    for (const q of qs) expect(String(q.placeholder)).toContain("دارای فعل");
  });

  it("dictionary reading (221): True/True/c/b — «them» refers to words; faithful Latin ‘dictio’ print", () => {
    const r1 = L(221).questions;
    expect(r1.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "a"]);
    expect(r1.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["c", "b"]);
    expect(String(r1[1].question)).toContain("The word ‘dictionary’ comes from the Latin ‘dictio’.");
    expect(r1[3].options).toEqual(["pronunciations", "words", "dictionaries", "spellings"]);
  });

  it("NEW solar reading (222/223): family-fresh text — True/False/b/a + full-sentence key «by absorbing sunlight»", () => {
    const r2 = L(222).questions;
    expect(r2.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(r2.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(String(r2[1].question)).toContain("for few years"); // خطای چاپیِ «a few» وفادار
    const qa = L(223).questions;
    expect(qa[0].accepted).toEqual(["Solar collectors collect heat by absorbing sunlight."]);
    // نو بودنِ متن: هیچ ساقه‌ای از این بانک‌ها در بانک‌های قبلی خانواده نیست
    const earlier = bank.lessons.filter((l) => l.lesson < 222).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r2) expect(earlier.includes(q.question), q.id).toBe(false);
    for (const q of qa) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("NEW teenagers reading (224): family-fresh text — True/False/c/d; faithful «at the age 16» print", () => {
    const r3 = L(224).questions;
    expect(r3.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(r3.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["c", "d"]);
    expect(String(r3[1].question)).toContain("at the age 16 can drive in all countries");
    const earlier = bank.lessons.filter((l) => l.lesson < 224).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r3) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("connectives (225) + half-sentence compound (226): and/so — printed half-sentence key «but he had to read it»", () => {
    const qs = L(225).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["and", "so"]);
    const cx = L(226).questions;
    expect(cx[0].accepted?.[0]).toBe("The book was boring but he had to read it.");
    expect(cx[0].accepted?.[1]).toBe("but he had to read it");
    expect(String(cx[0].question)).toContain("The book was boring");
  });

  it("NEW six-slot paragraph ordering (227): second in family — guide keys c/f/b/d/e/a as position sentences", () => {
    const qs = L(227).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs).toHaveLength(6);
    expect(qs[0].accepted).toEqual(["The new century has brought big changes in communication."]);
    expect(qs[1].accepted).toEqual(["Cell phones are important in these changes."]);
    expect(qs[2].accepted).toEqual(["Most of these cell phones can help you have video calls."]);
    expect(qs[3].accepted).toEqual(["But some people do not have such phones"]);
    expect(qs[4].accepted).toEqual(["because they are very expensive."]);
    expect(qs[5].accepted).toEqual(["In short, communication can depend on technology."]);
    expect(String(qs[0].question)).toContain("جملهٔ نخست (Topic) پاراگراف ارتباطات");
    expect(String(qs[5].question)).toContain("جملهٔ پایانی (Concluding) پاراگراف ارتباطات");
    for (const q of qs) expect(String(q.placeholder)).toContain("بنویسید");
  });

  it("typed answer normalization: every accepted variant of banks 209-227 round-trips; apostrophe variants interchangeable", () => {
    for (const n of FIN1400KHR) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    expect(normalizeTypedAnswer("had paid")).toBe(normalizeTypedAnswer("HAD PAID"));
    expect(normalizeTypedAnswer("Solar collectors collect heat by absorbing sunlight.")).toBe(
      normalizeTypedAnswer("solar collectors collect heat by absorbing sunlight")
    );
  });

  it("kind purity + collision: no id overlaps with lessons <209; typed sanity (accepted head ∈ options except ordering/word-order banks); ids all g12-fin1400khr-*", () => {
    for (const n of FIN1400KHR) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin1400khr-"), q.id).toBe(true);
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          if (n !== 227 && n !== 219) expect(q.options, q.id).toContain(q.accepted?.[0]);
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN1400KHR.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 209).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});
