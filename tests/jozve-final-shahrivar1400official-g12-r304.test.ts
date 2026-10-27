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
const FIN1400SHR = [248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265] as const;

// کلیدهای چاپیِ «راهنمای تصحیح شهریور ۱۴۰۰» ص۳۲۷-۳۲۸ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "b", 2: "a", 3: "b", 4: "a" }; // False/True/False/True
const K_L2: Record<number, string> = { 1: "b", 2: "a", 3: "c" }; // سه‌گزینه‌ایِ چاپی — سومین در خانواده
const K_L3: Record<number, string> = { 1: "b", 2: "b", 3: "a", 4: "c" }; // سه‌گزینه‌ایِ چاپی — چهارمین در خانواده
const K_PIC: Record<number, string> = { 1: "c", 2: "a", 3: "d", 4: "e" }; // b اضافهٔ چاپی — جای دوم (عینِ r302)
const K_DEF: Record<number, string> = { 1: "a", 2: "d", 3: "b" }; // c اضافه — جای سوم
const K_G: Record<number, string> = { 1: "d", 2: "a", 3: "c", 4: "c" };
const K_R1TF: Record<number, string> = { 1: "a", 2: "b" }; // True / False
const K_R1M: Record<number, string> = { 3: "c", 4: "b" };
const K_R2TF: Record<number, string> = { 1: "b", 2: "a" }; // False / True
const K_R2M: Record<number, string> = { 3: "b", 4: "a" };
const K_R3TF: Record<number, string> = { 1: "b", 2: "a" }; // False / True

describe("jozve topic grammar bank g12 — official nationwide shahrivar 1400 exam (r304 extraction receipt)", () => {
  it("bank shape: three hundred thirty lessons, shahrivar 1400 adds 18 banks / 51 items (family 1659)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 330 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      248: 4, 249: 3, 250: 4, 251: 5, 252: 4, 253: 3, 254: 3, 255: 1,
      256: 4, 257: 1, 258: 2, 259: 1, 260: 5, 261: 4, 262: 2, 263: 2,
      264: 2, 265: 1,
    };
    const levels: Record<number, string> = {
      248: "استاندارد", 249: "استاندارد", 250: "استاندارد", 252: "استاندارد",
      254: "استاندارد", 256: "استاندارد", 261: "استاندارد", 262: "استاندارد",
    };
    for (const n of FIN1400SHR) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی سراسری شهریور ۱۴۰۰");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(248).questions.map((q) => q.id)).toEqual([
      "g12-fin1400shr-l1tf1", "g12-fin1400shr-l1tf2", "g12-fin1400shr-l1tf3", "g12-fin1400shr-l1tf4",
    ]);
    expect(L(265).questions.map((q) => q.id)).toEqual(["g12-fin1400shr-cx1"]);
    // آزمون رسمی سراسری شهریور ۱۴۰۰: ۵۱ آیتم در ۱۸ بانک — خانواده: ۱۳۳۹ + ۵۱ = ۱۳۹۰
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1659);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1659);
  });

  it("provenance: source.final1400shr registered — fifth official-source round, near-complete key 52/55, dual verb-form key, family pool reuse", () => {
    const src = bank.source.final1400shr as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("322-326");
    expect(String(src.keyPages)).toContain("327-328");
    expect(src.banks).toBe(18);
    expect(src.questions).toBe(51);
    expect(src.keys).toBe(51);
    expect(src.sections).toBe(19);
    expect(src.extractedRound).toBe(304);
    expect(src.audioFilesAbsent).toBe(true); // بخشِ شنیداری هست؛ فایلِ صوتی در دسترس نیست
    expect(String(src.titlePrinted)).toContain("شهریور ماه سال ۱۴۰۰");
    expect(String(src.titlePrinted)).toContain("کلیهٔ رشته‌ها");
    expect(String(src.branchVariant)).toContain("دومواریانته");
    expect(String(src.branchVariant)).toContain("سه‌گزینه‌ای");
    expect(String(src.branchVariant)).toContain("بازاستفاده");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Wind towers");
    expect(String(open.items)).toContain("Smoking");
    const receipts = String(src.receipts);
    expect(receipts).toContain("had got/gotten"); // نخستین کلیدِ دومواریانتهٔ شکلِ فعل
    expect(receipts).toContain("absorb/variety/forgive/arrange"); // پولِ عینِ r303
  });

  it("listening file 1 (248): dictionary-culture T/F — keys b/a/b/a", () => {
    const qs = L(248).questions;
    expect(qs.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a", "b", "a"]);
    expect(String(qs[0].question)).toContain("You can use only online dictionaries.");
    expect(String(qs[3].question)).toContain("learn more about the world");
  });

  it("NEW listening file 2 (249): THIRD three-option MCQ of the family — father/son keys b/a/c", () => {
    const qs = L(249).questions;
    expect(qs.every((q) => q.options.length === 3)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "a", "c"]);
    expect(qs[0].options).toEqual(["food", "picnic", "drawing pictures"]);
    expect(qs[2].options).toEqual(["studied their lessons", "went home", "flew kites"]);
  });

  it("NEW listening file 3 (250): FOURTH three-option MCQ — Mehran/Bijan keys b/b/a/c with printed proverb stem", () => {
    const qs = L(250).questions;
    expect(qs.every((q) => q.options.length === 3)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "b", "a", "c"]);
    expect(String(qs[3].question)).toContain("A friend in need, is a friend indeed");
    expect(qs[2].options).toEqual(["secret", "not important", "emergency"]);
  });

  it("Sara/Nurse fill (251): parenthesized printed blanks ……(12)……-……(16)…… — medicine/history/Persian/life/take", () => {
    const qs = L(251).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["medicine", "history", "Persian", "life", "take"]);
    expect(String(qs[0].question)).toContain("rich in ……(12)……---------------");
    expect(String(qs[4].question)).toContain("ask my dad to ……(16)…..");
    for (const q of qs) expect(String(q.placeholder)).toContain("fill in the blank");
  });

  it("picture vocab (252): extra (b) in SECOND position (r302 pattern; r303 was first) — keys c/a/d/e", () => {
    const qs = L(252).questions;
    expect(qs.every((q) => q.options.length === 5)).toBe(true);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["c", "a", "d", "e"]);
    expect(qs[0].options[1]).toBe("Hamid sits on the sofa and watches TV all the time."); // اضافه
    expect(String(qs[0].question)).toContain("با توجه به تصاویر");
  });

  it("pool bank (253): printed pool identical to r303's (absorb/variety/forgive/arrange, forgive extra) — keys variety/arrange/absorb; Plants stem is documented family reuse", () => {
    const qs = L(253).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["absorb", "variety", "forgive", "arrange"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["variety", "arrange", "absorb"]);
    expect(String(qs[2].question)).toContain("Plants --------------- carbon dioxide.");
    // رسیدِ بازاستفادهٔ عمدی: جملهٔ ۲۳ عینِ pool1ِ r303 است (امتحانِ شهریور تمرینِ خرداد را بازیافته)
    const r303Pool1 = bank.lessons.find((l) => l.lesson === 233)!.questions.find((q) => q.id === "g12-fin1400khh-pool1")!;
    expect(qs[2].question).toBe(r303Pool1.question);
  });

  it("definitions (254): full A-sentences as stems, extra (c) cry suddenly in THIRD position — keys a/d/b; two-page stem is documented family reuse of r303", () => {
    const qs = L(254).questions;
    expect(qs.every((q) => q.options.length === 4)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["a", "d", "b"]);
    expect(String(qs[0].question)).toContain("two-page introduction");
    expect(qs[0].options[2]).toBe("cry suddenly"); // اضافه — جای سوم
    // رسیدِ بازاستفادهٔ عمدی: ساقهٔ ۲۴ همان چاپِ «This book has only a two-page»ِ pool2ِ r303 را دارد
    const r303Pool2 = bank.lessons.find((l) => l.lesson === 233)!.questions.find((q) => q.id === "g12-fin1400khh-pool2")!;
    const twoPagePrefix = "This book has only a two-page";
    expect(String(qs[0].question).startsWith(twoPagePrefix)).toBe(true);
    expect(r303Pool2.question.startsWith(twoPagePrefix)).toBe(true);
  });

  it("own knowledge (255): printed letter-gap s- - - - — spoil (too many cooks — third single-variant proverb of the family)", () => {
    const qs = L(255).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["spoil"]);
    expect(String(qs[0].question)).toContain("too many cooks s --------------- the broth");
    for (const q of qs) expect(String(q.placeholder)).toContain("first letter");
  });

  it("grammar (256): tag/relative/passive/conditional — keys d/a/c/c; faithful double period «yesterday..»", () => {
    const qs = L(256).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["d", "a", "c", "c"]);
    expect(String(qs[0].question)).toContain("You haven’t done your homework");
    expect(String(qs[1].question)).toContain("I lost yesterday..");
    expect(qs[2].options[2]).toBe("should be called");
  });

  it("verb form (257): FIRST dual-variant key of the family «had got/gotten» — printed with slash in the guide", () => {
    const qs = L(257).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["had gotten", "had got"]);
    expect(String(qs[0].question)).toContain("a bad score. (get)");
    for (const q of qs) expect(String(q.placeholder)).toContain("پرانتز");
  });

  it("word order (258): grids 33/34 — Sara-bear past-perfect + My sister second-conditional", () => {
    const qs = L(258).questions;
    expect(qs[0].accepted).toEqual(["Sara had never seen a bear before she went to the zoo."]);
    expect(qs[1].accepted).toEqual(["My sister would clean her room if she were at home."]);
    expect(String(qs[0].question)).toContain("went to the zoo / had never seen/ Sara/ a bear/ before /she/. /");
    expect(String(qs[1].question)).toContain("My sister/ she/ if / her room / were at home / would clean /. /");
  });

  it("relative pronoun (259): printed guide key «which» + explanatory note — multi-modal single-slot pattern", () => {
    const qs = L(259).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["which"]);
    expect(String(qs[0].question)).toContain("I bought a dictionary");
    for (const q of qs) expect(String(q.placeholder)).toContain("دارای فعل");
  });

  it("NEW electric-car reading (260): family-fresh text — True/False/c/b + typed portable device", () => {
    const r1 = L(260).questions;
    expect(r1.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(r1.slice(2, 4).map((q) => G_LETTERS[q.answer])).toEqual(["c", "b"]);
    expect(r1[2].options).toEqual(["consumed by", "replaced in", "stored on", "polluted"]);
    expect(r1[4].kind).toBe("typed");
    expect(r1[4].accepted).toEqual(["portable device"]);
    const earlier = bank.lessons.filter((l) => l.lesson < 260).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r1) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("NEW dictionary-tips reading (261): family-fresh text — False/True/b/a", () => {
    const r2 = L(261).questions;
    expect(r2.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(r2.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(String(r2[0].question)).toContain("only one type of good dictionary");
    expect(r2[2].options).toEqual(["learner’s dictionary", "entry", "part of speech", "origin"]);
    const earlier = bank.lessons.filter((l) => l.lesson < 261).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r2) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("NEW respect-nature reading (262/263): family-fresh text — False/True + underlined key 47 + full-sentence key 48 (four RTL guide fragments)", () => {
    const r3 = L(262).questions;
    expect(r3.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(String(r3[0].question)).toContain("people should only respect other people");
    const qa = L(263).questions;
    expect(qa[0].accepted?.[0]).toBe("in your yard or in your favorite park");
    expect(qa[0].accepted?.[1]).toBe("You can do these and show the beauty of nature in your yard or in your favorite park.");
    expect(qa[1].accepted?.[0]).toBe("You should remind your children that all living creatures are parts of our world and are valuable in the natural environment.");
    const earlier = bank.lessons.filter((l) => l.lesson < 262).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r3) expect(earlier.includes(q.question), q.id).toBe(false);
    for (const q of qa) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("connectives (264) + and-keyed half-sentence compound (265): or/but — printed half-sentence key «and I make an omelet»", () => {
    const qs = L(264).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["or", "but"]);
    expect(String(qs[1].question)).toContain("Mary studies a lot ,");
    const cx = L(265).questions;
    expect(cx[0].accepted?.[0]).toBe("I get up early in the morning, and I make an omelet.");
    expect(cx[0].accepted?.[1]).toBe("and I make an omelet");
    expect(String(cx[0].question)).toContain("(make an omelet)");
  });

  it("typed answer normalization: every accepted variant of banks 248-265 round-trips; apostrophe/case variants interchangeable", () => {
    for (const n of FIN1400SHR) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    expect(normalizeTypedAnswer("had gotten")).toBe(normalizeTypedAnswer("HAD GOTTEN"));
    expect(normalizeTypedAnswer("You should remind your children that all living creatures are parts of our world and are valuable in the natural environment.")).toBe(
      normalizeTypedAnswer("you should remind your children that all living creatures are parts of our world and are valuable in the natural environment")
    );
  });

  it("kind purity + collision: no id overlaps with lessons <248; typed sanity (accepted head ∈ options except word-order bank 258); ids all g12-fin1400shr-*", () => {
    for (const n of FIN1400SHR) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin1400shr-"), q.id).toBe(true);
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          if (n !== 258) expect(q.options, q.id).toContain(q.accepted?.[0]);
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN1400SHR.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 248).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});
