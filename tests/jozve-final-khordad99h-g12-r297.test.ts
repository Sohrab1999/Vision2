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

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\//g, " ")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const FIN99H = [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137] as const;

// کلیدهای چاپی راهنمای تصحیح ص۲۷۵-۲۷۶ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "d" }; // MCQ ۱
const K_L1TF: Record<number, string> = { 2: "b" }; // False
const K_L2M: Record<number, string> = { 1: "d", 2: "b", 3: "a" }; // ۵/۶/۷
const K_PIC: Record<number, string> = { 1: "d", 2: "a", 3: "b", 4: "e" }; // c اضافهٔ چاپی
const K_VOCBANK: Record<number, string> = { 1: "dedicated", 2: "conditioner", 3: "alphabetically" }; // introduction اضافهٔ چاپی
const K_G: Record<number, string> = { 1: "a", 2: "b", 3: "a", 4: "c", 5: "d" };
const K_R1M: Record<number, string> = { 1: "b", 2: "c" };
const K_R1TF: Record<number, string> = { 3: "a", 4: "b" }; // ۳۷ True / ۳۸ False
const K_R2M: Record<number, string> = { 1: "c", 2: "b" };
const K_R2TF: Record<number, string> = { 1: "a", 2: "b" }; // ۴۳ True / ۴۴ False
const K_CONT: Record<number, string> = { 1: "c", 2: "d", 3: "a", 4: "b" }; // ۴۷-۵۰
const K_CONN: Record<number, string> = { 1: "and", 2: "or", 3: "but", 4: "so" };
const K_DEFB: Record<number, string> = { 1: "d", 2: "e", 3: "c", 4: "b" }; // a اضافهٔ چاپی
const K_PRVB: Record<number, string> = { 1: "i", 2: "h", 3: "f", 4: "j" }; // g اضافهٔ چاپی

describe("jozve topic grammar bank g12 — final exam خرداد ۹۹ انسانی (r297 extraction receipt)", () => {
  it("bank shape: three hundred four lessons, humanities variant adds 18 banks / 66 items (family 1494)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 304 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      120: 4, 121: 5, 122: 5, 123: 4, 124: 3, 125: 3, 126: 5, 127: 5,
      128: 4, 129: 2, 130: 2, 131: 2, 132: 2, 133: 4, 134: 4, 135: 4, 136: 4, 137: 4,
    };
    const levels: Record<number, string> = {
      120: "استاندارد", 121: "استاندارد", 122: "استاندارد", 123: "استاندارد",
      126: "استاندارد", 128: "استاندارد", 130: "استاندارد", 131: "استاندارد",
      133: "استاندارد", 135: "استاندارد", 136: "استاندارد",
    };
    for (const n of FIN99H) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی خرداد ۹۹ انسانی");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(120).questions.map((q) => q.id)).toEqual(["g12-fin99h-l1m1", "g12-fin99h-l1tf1", "g12-fin99h-l1t1", "g12-fin99h-l1t2"]);
    expect(L(137).questions.every((q) => q.id === `g12-fin99h-wo${q.n}`)).toBe(true);
    // آزمون نهایی خرداد ۹۹ انسانی: ۶۶ آیتم در ۱۸ بانک — خانواده: ۹۱۸ + ۶۶ = ۹۸۴
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1494);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1494);
  });

  it("provenance: source.final99h registered — branch variant + honest absences (topic sentences 55/56, choice section 16 ج/د)", () => {
    const src = bank.source.final99h as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("268-274");
    expect(src.keyPages).toBe("275-276");
    expect(src.banks).toBe(18);
    expect(src.questions).toBe(66);
    expect(src.sections).toBe(16);
    expect(src.extractedRound).toBe(297);
    expect(String(src.branchVariant)).toContain("واریانتِ رشته‌ای");
    expect(String(src.branchVariant)).toContain("PAGE 277");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("۵۵-۵۶");
    expect(String(open.items)).toContain("Firefighters");
    const visual = src.visualAbsent as Record<string, unknown>;
    expect(String(visual.items)).toContain("Light bulbs");
  });

  it("listening file 1 (120): MCQ d + T/F False + two typed full-sentence keys", () => {
    const qs = L(120).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "typed", "typed"]);
    expect(G_LETTERS[qs[0].answer]).toBe(K_L1[1]);
    expect(qs[0].options).toEqual(["he is very angry", "he is far from the woman", "she can’t hear at all", "she can’t hear clearly"]);
    expect(TF_LETTERS[qs[1].answer]).toBe(K_L1TF[2]);
    expect(qs[2].accepted).toEqual(["Because she can’t hear well."]);
    expect(qs[3].accepted).toEqual([
      "It might be something as simple as an infection.",
      "It might be something as simple as an infection or more serious.",
    ]); // کلیدِ اسلش‌دارِ راهنما — دو واریانت (رسید)
    expect(String(qs[0].question)).toContain("Why is the man shouting?");
  });

  it("listening file 2 (121): three MCQs d/b/a (option «b & c» compound faithful) + typed 8/9 (key 9 remontaged from jumbled OCR)", () => {
    const qs = L(121).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "mcq", "typed", "typed"]);
    expect(qs.slice(0, 3).map((q) => G_LETTERS[q.answer])).toEqual(["d", "b", "a"]);
    expect(qs[1].options).toEqual(["replaceable", "rechargeable", "convertible", "b & c"]);
    expect(qs[3].accepted).toEqual(["Because her phone battery was running low."]);
    // بازمونتاژِ کلیدِ آشفتهٔ OCR (movie / to finish watching / electricity / nough / e / She needed) — الگوی r294-r296
    expect(qs[4].accepted).toEqual(["She needed enough electricity to finish watching the movie."]);
    expect(String(qs[4].question)).toContain("What did the woman need to finish watching the movie?");
  });

  it("listening file 3 (122): two cloze typed responding/personal + typed 12/13/14", () => {
    const qs = L(122).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["responding"]);
    expect(String(qs[0].question)).toContain("gets stuck into reading and --------------- to emails");
    expect(qs[1].accepted).toEqual(["personal"]);
    expect(qs[2].accepted).toEqual([
      "Yes, it does. It takes him a lot of time to answer the emails.",
      "Yes, it does.",
    ]);
    expect(qs[3].accepted).toEqual(["He deletes them."]);
    expect(qs[4].accepted).toEqual(["He takes an organized approach with work emails."]);
  });

  it("picture vocab (123): five printed sentences a-e, keys d/a/b/e — c is the printed extra", () => {
    const qs = L(123).questions;
    for (const q of qs) expect(q.options, q.id).toEqual([
      "There are lots of free apps that you don’t need to pay money to use them.",
      "It is believed that hugging your child boosts the level of happiness.",
      "Teenagers who help others are more successful in life.",
      "Hydropower is produced as a result of falling or running water.",
      "Tides can usually happen near any huge body of water like an ocean or a sea.",
    ]);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["d", "a", "b", "e"]);
    expect(PIC_LETTERS.split("").filter((x) => !["d", "a", "b", "e"].includes(x))).toEqual(["c"]);
    expect(String(qs[0].question)).toContain("تصویر (15)");
    expect(String(qs[3].question)).toContain("تصویر (18)");
  });

  it("vocab bank-fill (124): printed bank introduction/dedicated/alphabetically/conditioner — introduction is the printed extra", () => {
    const qs = L(124).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_VOCBANK[q.n]]);
      expect(q.options, q.id).toEqual(["introduction", "dedicated", "alphabetically", "conditioner"]);
    }
    const used = qs.map((q) => K_VOCBANK[q.n]);
    expect(new Set(used).size).toBe(3);
    expect(["introduction", "dedicated", "alphabetically", "conditioner"].filter((w) => !used.includes(w))).toEqual(["introduction"]);
    expect(String(qs[2].question)).toContain("authors’ names");
  });

  it("own knowledge (125): printed first-letter carriers f/c/l kept inside stems — keys forever/contain/lap; backtick «mother`s» faithful", () => {
    const qs = L(125).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(String(qs[0].question)).toContain("keep it a secret f- - - - - -");
    expect(String(qs[1].question)).toContain("foods that c - - - - - - a lot of fat");
    expect(String(qs[2].question)).toContain("her mother`s l - -");
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["forever", "contain", "lap"]);
    for (const q of qs) expect(q.placeholder, q.id).toContain("printed first letter");
  });

  it("grammar (126): keys a/b/a/c/d — backtick tag options «doesn`t she / didn`t she» faithful; relative which", () => {
    const qs = L(126).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["a", "b", "a", "c", "d"]);
    expect(qs[0].options).toEqual(["which", "when", "whom", "whose"]);
    expect(qs[1].options).toEqual(["have studied", "studied", "studies", "would study"]);
    expect(qs[2].options).toEqual(["have built", "are built", "were built", "have been built"]);
    expect(qs[3].options).toEqual(["doesn`t she", "don`t they", "didn`t she", "didn`t they"]);
    expect(qs[4].options).toEqual(["communicatively", "communicate", "communication", "communicative"]);
    expect(String(qs[4].question)).toContain("thus he doesn’t feel comfortable");
  });

  it("verb forms (127): five typed with printed hints — passive perfect / past passive / conditional were", () => {
    const qs = L(127).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual([
      "increasingly", "collect", "has been discovered", "were invented", "were",
    ]);
    expect(String(qs[0].question)).toContain("(increase)");
    expect(String(qs[1].question)).toContain("( collect)");
    expect(String(qs[2].question)).toContain("( discover )");
    expect(String(qs[3].question)).toContain("( invent )");
    expect(String(qs[4].question)).toContain("( be )");
    expect(String(qs[1].question)).toContain("don’t they?");
  });

  it("einstein reading (128): 2 MCQs b/c + T/F True/False (a/b)", () => {
    const qs = L(128).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "mcq", "mcq"]);
    expect(qs.slice(0, 2).map((q) => G_LETTERS[q.answer])).toEqual(["b", "c"]);
    expect(qs[0].options).toEqual(["president", "American citizen", "physicist", "student"]);
    expect(qs[1].options).toEqual(["Relativity Theory", "scientific research", "health problems", "academic studies"]);
    expect(qs.slice(2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(String(qs[0].question)).toContain("Before the World War II");
  });

  it("einstein typed (129): guide key prints «in١٢٩١» — Persian-digit slide of 1921 (second digit-slide of the family, first inside key text); body text 1921 is the anchor", () => {
    const qs = L(129).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual([
      "The Nobel Prize was awarded to Einstein for physics in 1921.",
      "In 1921.",
    ]);
    expect(normalizeTypedAnswer("The Nobel Prize was awarded to Einstein for physics in 1921.")).toBeTruthy();
    expect(qs[1].accepted).toEqual(["He wrote a letter to President Roosevelt expressing his worry about the atomic bomb."]);
    expect(String(qs[1].question)).toContain("fear of the atomic bomb?");
  });

  it("energy reading (130): 2 MCQs c/b — «they» reference and main-idea stems", () => {
    const qs = L(130).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "b"]);
    expect(qs[0].options).toEqual(["fossil fuels", "non-renewable energy sources", "renewable sources of energy", "solar panels"]);
    expect(qs[1].options).toEqual([
      "how long it takes for light to reach the earth from the sun",
      "the importance of energy for human life and where energy comes from",
      "different types of non-renewable sources of energy used by people",
      "how fossil fuels were formed",
    ]);
    expect(String(qs[0].question)).toContain("paragraph3, line 2");
  });

  it("energy T/F (131): True/False (a/b) — backtick «The sun`s energy» faithful", () => {
    const qs = L(131).questions;
    expect(qs.map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(qs[0].options).toEqual(["True", "False"]);
    expect(String(qs[1].question)).toContain("The sun`s energy can only be stored");
  });

  it("energy typed (132): 45 three-noun slash key = one combined + three singles (r296-45 pattern); 46 numbered «٦٤.» in guide — same template slide as r296", () => {
    const qs = L(132).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual([
      "The energy is stored in their roots, fruits, and leaves.",
      "The energy is stored in their roots.",
      "The energy is stored in their fruits.",
      "The energy is stored in their leaves.",
    ]);
    expect(normalizeTypedAnswer("The energy is stored in their ROOTS.")).toBe(normalizeTypedAnswer("The energy is stored in their roots."));
    expect(qs[1].accepted).toEqual([
      "Three forms of renewable energy are: solar energy, water energy and wind energy.",
      "Solar energy, water energy and wind energy.",
    ]);
    expect(String(qs[1].question)).toContain("What are the three forms of renewable energy?");
  });

  it("matching A/B (133): printed column-A stems with trailing conjunctions — keys c/d/a/b", () => {
    const qs = L(133).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "mcq", "mcq"]);
    for (const q of qs) expect(q.options, q.id).toEqual(["I didn`t have your number.", "I looked out.", "you can buy a pocket one.", "it was not safe to drive."]);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "d", "a", "b"]);
    expect(String(qs[0].question)).toContain("You can use mobile dictionary, or");
    expect(String(qs[3].question)).toContain("I went to the window, and");
  });

  it("connectives Amin (134): closed pool {but, and, so, or} — keys and/or/but/so", () => {
    const qs = L(134).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["and", "or", "but", "so"]);
    expect(String(qs[0].question)).toContain("Amin is a student");
    expect(String(qs[3].question)).toContain("Amin waited until his friend’s father arrived");
  });

  it("column B definitions الف (135) + proverbs ب (136): parallel choice branches — a/g extras; curly «it’s confusing» faithful", () => {
    const defs = L(135).questions;
    for (const q of defs) expect(q.options, q.id).toEqual([
      "cry suddenly",
      "the amount of a product or service that people want",
      "in a way that is successful and achieves what you want",
      "stop being angry with someone",
      "an arrangement in a particular order",
    ]);
    expect(defs.map((q) => PIC_LETTERS[q.answer])).toEqual(["d", "e", "c", "b"]);
    expect(PIC_LETTERS.split("").filter((x) => !["d", "e", "c", "b"].includes(x))).toEqual(["a"]);
    expect(String(defs[0].question)).toContain("I may forgive myself for the accident");
    expect(String(defs[3].question)).toContain("the demand for oil is decreasing");
    const proverbs = L(136).questions;
    for (const q of proverbs) expect(q.options, q.id).toEqual([
      "People like to spend time with those who are similar to them.",
      "When two people cooperate with each other, they come up with better ideas.",
      "When there are too many people trying to lead and give their opinions, it’s confusing and leads to bad results.",
      "You soon forget people or things that are no longer visible or present.",
      "You have to practice a skill a lot to become good at it.",
    ]);
    expect(proverbs.map((q) => "fghij"[q.answer])).toEqual(["i", "h", "f", "j"]);
    expect("fghij".split("").filter((x) => !["i", "h", "f", "j"].includes(x))).toEqual(["g"]);
    expect(String(proverbs[0].question)).toContain("Out of sight, out of mind");
    expect(String(proverbs[3].question)).toContain("Practice makes perfect");
  });

  it("word order (137): four variants from 61a/61b/62a/62b — 61a dual grammatical readings (guide arrow note) and 62a John/He tension both accepted; scramble coverage per variant", () => {
    const qs = L(137).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual([
      "The woman who bought that apartment was talking to the neighbors in the yard.",
      "The woman who was talking to the neighbors in the yard bought that apartment.",
    ]); // یادداشتِ «فلش» راهنما — دو خوانشِ کامل از یک بهم‌ریخته (رسید)
    expect(qs[1].accepted).toEqual(["His parents became happy after they had met their son."]);
    expect(qs[2].accepted).toEqual([
      "He could be a good runner if he had more free time to practice.",
      "John could be a good runner if he had more free time to practice.",
    ]); // بهم‌ریخته شامل John است؛ کلیدِ چاپی با He — هر دو (رسید)
    expect(qs[3].accepted).toEqual(["They must be informed about the result today."]);
    for (const q of qs) {
      for (const variant of q.accepted ?? []) {
        const scrambleWords = String(q.question)
          .split(/[\s/]+/)
          .map((t) => t.replace(/[’‘`´]/g, "'").replace(/[^\w\s'-]/g, "").trim())
          .filter(Boolean)
          .map((t) => norm(t));
        const answerWords = norm(variant)
          .split(" ")
          .map((w) => w.replace(/[^\w'-]/g, ""))
          .filter(Boolean);
        for (const w of answerWords) {
          expect(scrambleWords, `${q.id} variant word "${w}"`).toContain(w);
        }
      }
    }
    expect(String(qs[0].question)).toContain("talking / to the neighbors / the woman / bought");
    expect(String(qs[2].question)).toContain("a good runner / to practice / could be / if / free time / had / he / John / more");
  });

  it("kind purity + collision: no id overlaps with lessons <120; typed sanity (accepted head ∈ options)", () => {
    for (const n of FIN99H) {
      const qs = L(n).questions;
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          expect(q.options, q.id).toContain(q.accepted?.[0]);
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN99H.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 120).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });

  it("eight oddities locked faithful: «b & c» compound, «١٢٩١» slide receipt, «٦٤» slide, backtick tag options, «mother`s», curly «it’s confusing», «can’t hear at all», «Teenagers» cross-variant stem", () => {
    expect(L(121).questions[1].options[3]).toBe("b & c");
    expect(String((bank.source.final99h as Record<string, unknown>).receipts)).toContain("١٢٩١");
    expect(String((bank.source.final99h as Record<string, unknown>).receipts)).toContain("٦٤.");
    expect(L(126).questions[3].options[2]).toBe("didn`t she");
    expect(String(L(125).questions[2].question)).toContain("her mother`s l - -");
    expect(L(136).questions[1].options[2]).toContain("it’s confusing and leads to bad results");
    expect(L(120).questions[0].options[2]).toBe("she can’t hear at all");
    expect(L(123).questions[2].options[2]).toContain("Teenagers who help others are more successful in life.");
  });
});
