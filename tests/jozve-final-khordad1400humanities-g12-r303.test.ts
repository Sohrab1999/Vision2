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
const FIN1400KHH = [228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247] as const;

// کلیدهای چاپیِ «راهنمای تصحیح خرداد ۱۴۰۰ انسانی» ص۳۲۰-۳۲۱ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "a", 2: "b" }; // True / False
const K_L2: Record<number, string> = { 1: "b", 2: "c", 3: "b", 4: "a" }; // سه‌گزینه‌ایِ چاپی — دومین در خانواده
const K_L4TF: Record<number, string> = { 1: "b", 2: "a", 3: "b", 4: "a" }; // False/True/False/True
const K_PIC: Record<number, string> = { 1: "d", 2: "e", 3: "c", 4: "b" }; // a اضافهٔ چاپی — جای نخست
const K_DEF: Record<number, string> = { 1: "d", 2: "c", 3: "b" }; // a اضافه — جای نخست
const K_G: Record<number, string> = { 1: "c", 2: "a", 3: "c", 4: "b" };
const K_R1TF: Record<number, string> = { 1: "a", 2: "b" }; // True / False
const K_R1M: Record<number, string> = { 3: "b" };
const K_R2TF: Record<number, string> = { 1: "b", 2: "a" }; // False / True
const K_R2M: Record<number, string> = { 3: "b" };
const K_R3TF: Record<number, string> = { 1: "a", 2: "a" }; // True / True
const K_R3M: Record<number, string> = { 3: "c", 4: "a" };

describe("jozve topic grammar bank g12 — official nationwide khordad 1400 humanities exam (r303 extraction receipt)", () => {
  it("bank shape: two hundred sixty-five lessons, khordad 1400 humanities adds 20 banks / 56 items (family 1390)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 265 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      228: 3, 229: 4, 230: 4, 231: 4, 232: 4, 233: 3, 234: 3, 235: 1,
      236: 4, 237: 1, 238: 2, 239: 1, 240: 3, 241: 1, 242: 3, 243: 2,
      244: 4, 245: 2, 246: 1, 247: 6,
    };
    const levels: Record<number, string> = {
      229: "استاندارد", 231: "استاندارد", 232: "استاندارد", 234: "استاندارد",
      236: "استاندارد", 240: "استاندارد", 242: "استاندارد", 244: "استاندارد",
    };
    for (const n of FIN1400KHH) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی سراسری خرداد ۱۴۰۰ انسانی");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(228).questions.map((q) => q.id)).toEqual([
      "g12-fin1400khh-l1tf1", "g12-fin1400khh-l1tf2", "g12-fin1400khh-l1q1",
    ]);
    expect(L(247).questions.map((q) => q.id)).toEqual([
      "g12-fin1400khh-ord1", "g12-fin1400khh-ord2", "g12-fin1400khh-ord3",
      "g12-fin1400khh-ord4", "g12-fin1400khh-ord5", "g12-fin1400khh-ord6",
    ]);
    // آزمون رسمی سراسری خرداد ۱۴۰۰ انسانی: ۵۶ آیتم در ۲۰ بانک — خانواده: ۱۲۸۳ + ۵۶ = ۱۳۳۹
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1390);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1390);
  });

  it("provenance: source.final1400khh registered — track-variant pair of r302, near-complete key 56/57, third six-slot, or-keyed half-sentence", () => {
    const src = bank.source.final1400khh as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("315-319");
    expect(String(src.keyPages)).toContain("320-321");
    expect(src.banks).toBe(20);
    expect(src.questions).toBe(56);
    expect(src.keys).toBe(56);
    expect(src.sections).toBe(19);
    expect(src.extractedRound).toBe(303);
    expect(src.audioFilesAbsent).toBe(true); // بخشِ شنیداری هست؛ فایلِ صوتی در دسترس نیست
    expect(String(src.titlePrinted)).toContain("خرداد ماه سال ۱۴۰۰");
    expect(String(src.titlePrinted)).toContain("ادبیات و علوم انسانی");
    expect(String(src.branchVariant)).toContain("شش‌جمله‌ای");
    expect(String(src.branchVariant)).toContain("سه‌گزینه‌ای");
    expect(String(src.branchVariant)).toContain("or");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Forests");
    const receipts = String(src.receipts);
    expect(receipts).toContain("or you should wash the dishes"); // کلیدِ نیمه‌جمله‌ایِ چاپیِ ۵۰
    expect(receipts).toContain("r301-ws2"); // بازاستفادهِ عمدیِ تمرینِ کتاب
  });

  it("listening file 1 (228): mixed T/F (a/b) + typed sister — Zohreh/Maryam invitation story", () => {
    const qs = L(228).questions;
    expect(qs.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(qs[2].kind).toBe("typed");
    expect(qs[2].accepted).toEqual(["sister"]);
    expect(String(qs[0].question)).toContain("Zohreh has invited everyone but Mina.");
    expect(String(qs[2].question)).toContain("because she is her mother’s friend");
  });

  it("NEW listening file 2 (229): second three-option MCQ of the family — museum day keys b/c/b/a", () => {
    const qs = L(229).questions;
    expect(qs.every((q) => q.options.length === 3)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "c", "b", "a"]);
    expect(qs[1].options).toEqual(["Modern Art", "Holy shrine", "Holy Defense"]);
    expect(qs[3].options).toEqual(["home", "to school", "to the museum"]);
  });

  it("Asadi Tusi dictionary fill (230): parenthesized printed blanks ……(8)……-……(11)…… — famous/final/taken/lived", () => {
    const qs = L(230).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["famous", "final", "taken", "lived"]);
    expect(String(qs[0].question)).toContain("…… (8)……---------------");
    expect(String(qs[2].question)).toContain("……(10)……--------------- from poetry");
    for (const q of qs) expect(String(q.placeholder)).toContain("fill in the blank");
  });

  it("listening file 4 T/F (231): Tahereh Saffarzadeh — keys b/a/b/a with faithful age-of-6 print", () => {
    const qs = L(231).questions;
    expect(qs.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a", "b", "a"]);
    expect(String(qs[1].question)).toContain("reciting the Holy Quran at the age of 6.");
    expect(String(qs[3].question)).toContain("translation of Holy Quran in 1380.");
  });

  it("picture vocab (232): extra (a) in FIRST position (r301 pattern; r302 was second) — keys d/e/c/b", () => {
    const qs = L(232).questions;
    expect(qs.every((q) => q.options.length === 5)).toBe(true);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["d", "e", "c", "b"]);
    expect(qs[0].options[0]).toBe("Iran is rich in oil resources."); // اضافه
    expect(String(qs[0].question)).toContain("با توجه به تصاویر");
  });

  it("pool bank (233): printed pool hugged/introduction/absorb/effectively (effectively extra LAST) — keys absorb/introduction/hugged", () => {
    const qs = L(233).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["hugged", "introduction", "absorb", "effectively"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["absorb", "introduction", "hugged"]);
    expect(String(qs[1].question)).toContain("a two-page");
  });

  it("definitions (234): full A-sentences as stems, extra (a) cry suddenly in FIRST position — keys d/c/b", () => {
    const qs = L(234).questions;
    expect(qs.every((q) => q.options.length === 4)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["d", "c", "b"]);
    expect(String(qs[1].question)).toContain("two high and two low tides each day.");
    expect(qs[0].options[0]).toBe("cry suddenly"); // اضافه
  });

  it("own knowledge (235): printed letter-gap c- - — come (easy come, easy go)", () => {
    const qs = L(235).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["come"]);
    expect(String(qs[0].question)).toContain("“Easy c --------------- , easy go”");
    for (const q of qs) expect(String(q.placeholder)).toContain("first letter");
  });

  it("grammar (236): tag/relative/past-perfect/passive — keys c/a/c/b", () => {
    const qs = L(236).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "a", "c", "b"]);
    expect(String(qs[0].question)).toContain("They invited you to their party");
    expect(qs[3].options[1]).toBe("must be obeyed");
  });

  it("verb form (237): printed hint (break) — was broken", () => {
    const qs = L(237).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["was broken"]);
    expect(String(qs[0].question)).toContain("by that boy yesterday. (break)");
    for (const q of qs) expect(String(q.placeholder)).toContain("پرانتز");
  });

  it("word order (238): grid 33 intentionally reuses the printed r301-ws2 exercise — keys Roya-upset / John-fix", () => {
    const qs = L(238).questions;
    expect(qs[0].accepted).toEqual(["Roya was upset because she had gotten a bad score."]);
    expect(qs[1].accepted).toEqual(["John could fix the car if he were at home."]);
    expect(String(qs[0].question)).toContain("had gotten/ was upset/ because/ a bad score/ she/ Roya /. /");
    expect(String(qs[1].question)).toContain("the car / were at home /if / he / could fix/ John  /. /");
  });

  it("relative pronoun (239): printed guide key «which» + explanatory note — multi-modal single-slot pattern", () => {
    const qs = L(239).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["which"]);
    expect(String(qs[0].question)).toContain("An ostrich is a bird");
    for (const q of qs) expect(String(q.placeholder)).toContain("دارای فعل");
  });

  it("elders reading (240/241): family-fresh text — True/False/b + full-sentence key «They feel honored.»", () => {
    const r1 = L(240).questions;
    expect(r1.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(r1.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["b"]);
    expect(String(r1[0].question)).toContain("elders were not born elders");
    const qa = L(241).questions;
    expect(qa[0].accepted).toEqual(["They feel honored."]);
    // نو بودنِ متن: هیچ ساقه‌ای از این بانک‌ها در بانک‌های قبلی خانواده نیست
    const earlier = bank.lessons.filter((l) => l.lesson < 240).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r1) expect(earlier.includes(q.question), q.id).toBe(false);
    for (const q of qa) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("NEW dictionary-tips reading (242/243): family-fresh text — False/True/b + entry/collocations typed", () => {
    const r2 = L(242).questions;
    expect(r2.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(r2.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["b"]);
    expect(r2[2].options).toEqual(["definitions", "guide words", "pronunciations", "spellings"]);
    const comp = L(243).questions;
    expect(comp.map((q) => q.accepted?.[0])).toEqual(["entry", "collocations"]);
    const earlier = bank.lessons.filter((l) => l.lesson < 242).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r2) expect(earlier.includes(q.question), q.id).toBe(false);
    for (const q of comp) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("NEW hydropower reading (244): family-fresh text — True/True/c/a; faithful «in some of countries» print", () => {
    const r3 = L(244).questions;
    expect(r3.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "a"]);
    expect(r3.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["c", "a"]);
    expect(String(r3[2].question)).toContain("in some of countries to keep the cities");
    const earlier = bank.lessons.filter((l) => l.lesson < 244).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r3) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("connectives (245) + or-keyed half-sentence compound (246): and/but — printed half-sentence key «or you should wash the dishes»", () => {
    const qs = L(245).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["and", "but"]);
    expect(String(qs[1].question)).toContain("There is snow in the street");
    const cx = L(246).questions;
    expect(cx[0].accepted?.[0]).toBe("You should do your homework, or you should wash the dishes.");
    expect(cx[0].accepted?.[1]).toBe("or you should wash the dishes");
    expect(String(cx[0].question)).toContain("(wash the dishes)");
  });

  it("NEW six-slot paragraph ordering (247): third in family — guide keys d/a/c/b/f/e as position sentences", () => {
    const qs = L(247).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs).toHaveLength(6);
    expect(qs[0].accepted).toEqual(["Ants are hardworking insects."]);
    expect(qs[1].accepted).toEqual(["Throughout the summer, they collect food for the winter season."]);
    expect(qs[2].accepted).toEqual(["Whenever they find sweet lying on the floor,"]);
    expect(qs[3].accepted).toEqual(["they stick to the sweet and carry it to their home."]);
    expect(qs[4].accepted).toEqual(["Thus, in this way, they clean the floor."]);
    expect(qs[5].accepted).toEqual(["As a result, they are known as helpful and active insects."]);
    expect(String(qs[0].question)).toContain("جملهٔ نخست (Topic) پاراگراف مورچه‌ها");
    expect(String(qs[5].question)).toContain("جملهٔ پایانی (Concluding) پاراگراف مورچه‌ها");
    for (const q of qs) expect(String(q.placeholder)).toContain("بنویسید");
  });

  it("typed answer normalization: every accepted variant of banks 228-247 round-trips; apostrophe variants interchangeable", () => {
    for (const n of FIN1400KHH) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    expect(normalizeTypedAnswer("was broken")).toBe(normalizeTypedAnswer("WAS BROKEN"));
    expect(normalizeTypedAnswer("They feel honored.")).toBe(
      normalizeTypedAnswer("they feel honored")
    );
  });

  it("kind purity + collision: no id overlaps with lessons <228; typed sanity (accepted head ∈ options except ordering/word-order banks); ids all g12-fin1400khh-*", () => {
    for (const n of FIN1400KHH) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin1400khh-"), q.id).toBe(true);
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          if (n !== 247 && n !== 238) expect(q.options, q.id).toContain(q.accepted?.[0]);
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN1400KHH.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 228).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});
