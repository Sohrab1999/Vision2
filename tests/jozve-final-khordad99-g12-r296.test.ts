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
const FIN99K = [105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119] as const;

// کلیدهای چاپی راهنمای تصحیح ص۲۶۶-۲۶۷ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const K_L1TF: Record<number, string> = { 1: "b", 2: "b" }; // ۱/۲ False
const K_L2M: Record<number, string> = { 1: "c", 2: "c" }; // ۵/۶
const K_L2TF: Record<number, string> = { 3: "a", 4: "b" }; // ۷ True / ۸ False
const K_L3TF: Record<number, string> = { 1: "b", 2: "a" }; // ۱۱ False / ۱۲ True
const PIC_LETTERS = "abcde";
const K_PIC: Record<number, string> = { 1: "d", 2: "e", 3: "b", 4: "a" }; // c اضافهٔ چاپی
const K_VOCBANK: Record<number, string> = { 1: "honored", 2: "overcome", 3: "suppose" }; // demand اضافهٔ چاپی
const K_G: Record<number, string> = { 1: "c", 2: "b", 3: "d", 4: "b" };
const K_R1M: Record<number, string> = { 1: "b", 2: "a" };
const K_R1TF: Record<number, string> = { 3: "b", 4: "a" };
const K_R2M: Record<number, string> = { 1: "b", 2: "c" };
const K_R2TF: Record<number, string> = { 3: "b", 4: "a" };
const K_CONN: Record<number, string> = { 1: "so", 2: "and", 3: "but", 4: "or" };
const K_DEFB: Record<number, string> = { 1: "b", 2: "e", 3: "a", 4: "c" }; // d اضافهٔ چاپی
const K_PRVB: Record<number, string> = { 1: "g", 2: "j", 3: "f", 4: "h" }; // i اضافهٔ چاپی

describe("jozve topic grammar bank g12 — final exam خرداد ۹۹ (r296 extraction receipt)", () => {
  it("bank shape: three hundred twenty six lessons, final khordad 99 adds 15 banks / 63 items (family 1587)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 326 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      105: 4, 106: 6, 107: 5, 108: 4, 109: 3, 110: 3, 111: 4,
      112: 4, 113: 6, 114: 6, 115: 4, 116: 2, 117: 4, 118: 4, 119: 4,
    };
    const levels: Record<number, string> = {
      105: "استاندارد", 106: "استاندارد", 107: "استاندارد", 108: "استاندارد",
      111: "استاندارد", 113: "استاندارد", 114: "استاندارد", 117: "استاندارد", 118: "استاندارد",
    };
    for (const n of FIN99K) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی خرداد ۹۹");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(105).questions.every((q) => q.id === `g12-fin99k-l1t${q.n}` || q.id === `g12-fin99k-l1tf${q.n}`)).toBe(true);
    expect(L(119).questions.every((q) => q.id === `g12-fin99k-wo${q.n}`)).toBe(true);
    // آزمون نهایی خرداد ۹۹: ۶۳ آیتم در ۱۵ بانک — خانواده: ۸۵۵ + ۶۳ = ۹۱۸
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1587);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1587);
  });

  it("provenance: source.final99k registered with honest absences (open relative 30, topic sentences 53/54, choice section 17)", () => {
    const src = bank.source.final99k as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("259-265");
    expect(src.keyPages).toBe("266-267");
    expect(src.banks).toBe(15);
    expect(src.questions).toBe(63);
    expect(src.sections).toBe(17);
    expect(src.extractedRound).toBe(296);
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.section)).toContain("A pigeon");
    expect(String(open.section)).toContain("فهمیده");
    expect(String(open.note)).toContain("Topic Sentence");
    expect(String(open.note)).toContain("which");
  });

  it("listening file 1 (105): both T/F keyed b/b + two typed full-sentence keys (printed lowercase faithful)", () => {
    const qs = L(105).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "typed", "typed"]);
    expect(qs.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "b", "a", "a"]);
    expect(qs[0].options).toEqual(["True", "False"]);
    expect(String(qs[0].question)).toContain("taken the laptop to the computer shop");
    expect(qs[2].accepted).toEqual(["she had the money."]); // کوچک‌نویسِ چاپیِ راهنما وفادار
    expect(qs[3].accepted).toEqual(["Because it is so slow."]);
    expect(String(qs[3].question)).toContain("throw the laptop out the window");
  });

  it("listening file 2 (106): two 4-option MCQs c/c + T/F a/b + typed 9/10 (key 10 remontaged from jumbled OCR)", () => {
    const qs = L(106).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "mcq", "mcq", "typed", "typed"]);
    expect(qs.slice(0, 4).map((q) => G_LETTERS[q.answer])).toEqual(["c", "c", "a", "b"]);
    expect(qs[0].options).toEqual(["She is trying to imagine.", "She is trying to invite somebody.", "She is working on her invention.", "She is cooking food."]);
    expect(qs[1].options).toEqual(["energy source", "fuel", "coal", "renewable energy"]);
    expect(qs[4].accepted).toEqual(["No, he doesn`t like it."]);
    // بازمونتاژِ کلیدِ آشفتهٔ OCR با لنگرهای چندگانه — رسیدِ source.final99k
    expect(qs[5].accepted).toEqual(["No, he doesn`t appreciate the woman`s job."]);
    expect(String(qs[5].question)).toContain("appreciate the woman’s job?");
  });

  it("listening file 3 (107): T/F b/a + typed 13 (printed key creative) / 14 / 15", () => {
    const qs = L(107).questions;
    expect(qs.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(qs[2].accepted).toEqual(["creative"]);
    expect(String(qs[2].question)).toContain("Delilah is the");
    expect(qs[3].accepted).toEqual(["respect each other`s abilities."]);
    expect(qs[4].accepted).toEqual(["He didn`t enjoy working in a team environment a year ago."]);
    expect(String(qs[4].question)).toContain("a year ago?");
  });

  it("picture vocab (108): five printed sentences a-e, keys d/e/b/a — c is the printed extra", () => {
    const qs = L(108).questions;
    for (const q of qs) expect(q.options, q.id).toEqual([
      "Taking people’s temperature can help them fight the coronavirus.",
      "If you focus the sun`s rays through a magnifying glass on a dry leaf, it will start to burn.",
      "Teenagers who help others are more successful in life.",
      "Wind tower is a type of natural air cooling system.",
      "John couldn’t figure out what the teacher was talking about.",
    ]);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["d", "e", "b", "a"]);
    const unused = PIC_LETTERS.split("").filter((x) => !["d", "e", "b", "a"].includes(x));
    expect(unused).toEqual(["c"]); // اضافهٔ چاپی
    expect(String(qs[0].question)).toContain("تصویر (16)");
    expect(String(qs[3].question)).toContain("تصویر (19)");
  });

  it("vocab bank-fill (109): printed bank suppose/honored/demand/overcome — demand is the printed extra", () => {
    const qs = L(109).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_VOCBANK[q.n]]);
      expect(q.options, q.id).toEqual(["suppose", "honored", "demand", "overcome"]);
    }
    const used = qs.map((q) => K_VOCBANK[q.n]);
    expect(new Set(used).size).toBe(3);
    expect(["suppose", "honored", "demand", "overcome"].filter((w) => !used.includes(w))).toEqual(["demand"]);
    expect(String(qs[1].question)).toContain("hybrid cars");
  });

  it("own knowledge (110): printed first-letter carriers i/r/g kept inside stems — keys intermediate/replace/guide", () => {
    const qs = L(110).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(String(qs[0].question)).toContain("elementary, i --------------- and advanced");
    expect(String(qs[1].question)).toContain("could r --------------- most of its workers");
    expect(String(qs[2].question)).toContain("called g --------------- words");
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["intermediate", "replace", "guide"]);
    for (const q of qs) expect(q.placeholder, q.id).toContain("printed first letter");
  });

  it("grammar (111): FIRST final round with natural print a-d — keys c/b/d/b; printed typos «the corps» and «isn’t  she» faithful", () => {
    const qs = L(111).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "b", "d", "b"]);
    expect(qs[0].options).toEqual(["which", "when", "whom", "whose"]);
    expect(qs[1].options).toEqual(["endanger", "endangering", "endangered", "dangers"]);
    expect(qs[2].options).toEqual(["isn’t  she", "did she", "doesn't she", "does she"]);
    expect(qs[3].options).toEqual(["could  save", "were saved", "had saved", "were saving"]);
    expect(String(qs[1].question)).toContain("the corps"); // غلطِ چاپیِ بدنه وفادار (crops)
    expect(String(qs[2].question)).toContain("Zhila never says a word");
  });

  it("verb forms dialog (112): four typed with printed hints; item 34 SECOND three-variant key might/would/could", () => {
    const qs = L(112).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["have been invited"]);
    expect(qs[1].accepted).toEqual(["was said"]);
    expect(qs[2].accepted).toEqual(["decides"]);
    expect(qs[3].accepted).toEqual(["might choose", "would choose", "could choose"]);
    for (const q of qs) expect(String(q.question)).toMatch(/\(\d+\) --------------- \((invite|say|decide|choose)\)/);
    expect(String(qs[0].question)).toContain("haven`t you?");
    // موتورِ نرمال‌سازی هر سه واریانتِ چاپی را می‌پذیرد (الگوی r294)
    expect(normalizeTypedAnswer("Might choose")).toBe(normalizeTypedAnswer("might choose"));
    expect(normalizeTypedAnswer("Would choose")).toBe(normalizeTypedAnswer("would choose"));
    expect(normalizeTypedAnswer("Could choose")).toBe(normalizeTypedAnswer("could choose"));
  });

  it("reading languages (113): 2 MCQs b/a + T/F b/a + typed 39 (dual (0/5) marks) / 40", () => {
    const qs = L(113).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "mcq", "mcq", "typed", "typed"]);
    expect(qs[0].options).toEqual(["learning first language", "second language", "difference of languages", "Chinese language"]);
    expect(qs[1].options[0]).toContain("how different it is from one’s mother tongue");
    expect(qs.slice(0, 4).map((q) => G_LETTERS[q.answer])).toEqual(["b", "a", "b", "a"]);
    expect(qs[4].accepted).toEqual(["English is easier for French people to learn because it is very similar to French."]);
    expect(qs[5].accepted).toEqual(["Because they already use Chinese letters in their own language."]);
    expect(String(qs[0].question)).toContain("paragraph 2 line 4");
  });

  it("reading energy (114): 2 MCQs b/c + T/F b/a (43 False vs printed «cheap way» tension) + typed 45 multi-source remontage / 46", () => {
    const qs = L(114).questions;
    expect(qs.slice(0, 4).map((q) => G_LETTERS[q.answer])).toEqual(["b", "c", "b", "a"]);
    expect(qs[0].options).toEqual(["The use of waste products for energy", "The search for new sources of energy", "Effective ways of producing hydropower", "New discoveries in geothermal power"]);
    expect(qs[1].options).toEqual(["Electrical power", "Clean energy", "Nuclear energy", "Hydroelectric power"]);
    expect(qs[2].options).toEqual(["True", "False"]);
    expect(qs[4].accepted).toEqual([
      "It is produced from streams and rivers.",
      "It is produced from oceans.",
      "It is produced from water.",
    ]); // نخستین کلیدِ چندمنبعیِ بازمونتاژشده از اسلش‌های راهنما
    expect(normalizeTypedAnswer("It is produced from Oceans.")).toBe(normalizeTypedAnswer("It is produced from oceans."));
    expect(normalizeTypedAnswer("It is produced from WATER.")).toBe(normalizeTypedAnswer("It is produced from water."));
    expect(qs[5].accepted).toEqual(["It will keep the environment clean."]);
    expect(String(qs[2].question)).toContain("expensive way");
  });

  it("connectives (115): teacher paragraph split into four stems — closed pool, keys so/and/but/or", () => {
    const qs = L(115).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["so", "and", "but", "or"]);
    expect(String(qs[0].question)).toContain("Teachers work hard every day");
    expect(String(qs[3].question)).toContain("you will be sorry one day");
  });

  it("sentence continuation (116): COVID 19 so-clause + Jimmy but-clause — printed lowercase keys faithful", () => {
    const qs = L(116).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["they should stay at home."]);
    expect(qs[1].accepted).toEqual(["he has to do his homework."]);
    expect(String(qs[0].question)).toContain("COVID 19");
    expect(String(qs[1].question)).toContain("Jimmy seems very tired");
  });

  it("column B definitions (117): FIRST parallel choice branch (الف) — five printed definitions, keys b/e/a/c, d extra", () => {
    const qs = L(117).questions;
    for (const q of qs) expect(q.options, q.id).toEqual([
      "to make water, air, etc. dirty",
      "lack of success in doing something",
      "have something inside",
      "an arrangement in a particular order",
      "many different types of things or people",
    ]);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["b", "e", "a", "c"]);
    expect(PIC_LETTERS.split("").filter((x) => !["b", "e", "a", "c"].includes(x))).toEqual(["d"]);
    expect(String(qs[2].question)).toContain("The factory polluted the river");
  });

  it("column B proverbs (118): FIRST parallel choice branch (ب) — five printed meanings f-j, keys g/j/f/h, i extra; «Action speak» typo faithful", () => {
    const qs = L(118).questions;
    for (const q of qs) expect(q.options, q.id).toEqual([
      "Just saying that you will do something doesn`t mean much. Actually, doing it is harder.",
      "Don`t just wait for good things to happen to you. Work hard to achieve your goals.",
      "Someone who has experienced some kind of negative situation will try to avoid making the same mistake.",
      "People like to spend time with others who are similar to them.",
      "When two people cooperate with each other, they come up with better idea.",
    ]);
    expect(qs.map((q) => "fghij"[q.answer])).toEqual(["g", "j", "f", "h"]);
    expect("fghij".split("").filter((x) => !["g", "j", "f", "h"].includes(x))).toEqual(["i"]);
    expect(String(qs[2].question)).toContain("Action speak louder than words"); // غلطِ چاپی وفادار
    expect(String(qs[1].question)).toContain("Two heads are better than one");
  });

  it("word order (119): FIRST four-variant remontage from choice items 59a/59b/60a/60b — scramble coverage per variant", () => {
    const qs = L(119).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual([
      "Mina would help you with your homework if she had more free time.",
      "My mother was angry with my brother because he hadn`t washed his hands.",
      "The students bought some useful books which their teacher suggested.",
      "Can water be converted into ice in cold weather?",
    ]);
    for (const q of qs) {
      const scrambleWords = String(q.question)
        .split(/[\s/]+/)
        .map((t) => t.replace(/[’‘`´]/g, "'").replace(/[^\w\s'-]/g, "").trim())
        .filter(Boolean)
        .map((t) => norm(t));
      const answerWords = norm(q.accepted?.[0] ?? "")
        .split(" ")
        .map((w) => w.replace(/[^\w'-]/g, ""))
        .filter(Boolean);
      for (const w of answerWords) {
        expect(scrambleWords, `${q.id} answer word "${w}"`).toContain(w);
      }
    }
    expect(String(qs[0].question)).toContain("more free time / Mina / would / had");
    expect(String(qs[3].question)).toContain("cold weather / into / converted / water / in / ice / be / can / ?");
  });

  it("kind purity + collision: no id overlaps with lessons <105; typed sanity (accepted head ∈ options)", () => {
    for (const n of FIN99K) {
      const qs = L(n).questions;
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          expect(q.options, q.id).toContain(q.accepted?.[0]);
        }
      }
    }
    const newIds = new Set(FIN99K.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 105).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });

  it("seven oddities locked faithful: «she had the  money.» lowercase, «the corps», «isn’t  she», «Action speak», «better idea», «٦٤» slide, COVID 19", () => {
    expect(L(105).questions[2].accepted?.[0]).toBe("she had the money."); // چاپِ کوچک‌نویس (فاصلهٔ دوگانهٔ OCR در رسید)
    expect(String(L(111).questions[1].question)).toContain("the corps");
    expect(L(111).questions[2].options[0]).toBe("isn’t  she");
    expect(String(L(118).questions[2].question)).toContain("Action speak");
    expect(L(118).questions[1].options[4]).toContain("better idea"); // غلطِ چاپیِ گزینهٔ j وفادار
    expect(String(L(114).questions[5].question)).toContain("clean sources of energy"); // کلیدش «٦٤.» چاپ شده بود
    expect(String(L(116).questions[0].question)).toContain("COVID 19");
  });
});
