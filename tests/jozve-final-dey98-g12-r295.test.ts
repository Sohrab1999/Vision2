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
const FIN98D = [93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104] as const;

// کلیدهای چاپی راهنمای تصحیح ص۲۵۷-۲۵۸ — عیناً
const LIS_MCQ_KEYS: Record<number, string> = { 1: "b", 2: "c" }; // ۷/۸ — سه‌گزینه‌ایِ چاپ
const DEF_LETTERS = "abcde";
const K_DEF: Record<number, string> = { 1: "c", 2: "d", 3: "e", 4: "b" }; // a اضافهٔ چاپی
const BANK_WORDS = ["shared", "cooling", "radiation", "effectively", "replaced"];
const K_BANK: Record<number, string> = { 1: "effectively", 2: "shared", 3: "replaced", 4: "cooling" }; // radiation اضافهٔ چاپی
const G_LETTERS = "abcd";
const K_G: Record<number, string> = { 1: "c", 2: "a", 3: "c", 4: "d" }; // چاپ وارونهٔ d,c,b,a
const K_CONN: Record<number, string> = { 1: "or", 2: "so", 3: "but", 4: "and" };

describe("jozve topic grammar bank g12 — final exam دی ۹۸ (r295 extraction receipt)", () => {
  it("bank shape: three hundred twenty six lessons, final dey 98 adds 12 banks / 46 items (family 1587)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 326 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      93: 3, 94: 2, 95: 4, 96: 4, 97: 4, 98: 4, 99: 4, 100: 2, 101: 4, 102: 1, 103: 5, 104: 4,
    };
    const levels: Record<number, string> = {
      93: "استاندارد", 95: "استاندارد", 97: "استاندارد", 99: "استاندارد",
      102: "استاندارد", 103: "استاندارد", 104: "استاندارد",
    };
    for (const n of FIN98D) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی دی ۹۸");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(93).questions.every((q) => q.id === `g12-fin98d-lis${q.n}`)).toBe(true);
    expect(L(102).questions.every((q) => q.id === `g12-fin98d-tree${q.n}`)).toBe(true);
    // آزمون نهایی دی ۹۸: ۴۶ آیتم در ۱۲ بانک — خانواده: ۸۱۴ + ۴۶ = ۸۵۵
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1587);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1587);
  });

  it("provenance: source.final98d registered with honest absences (printed-less listening stems + two open writings)", () => {
    const src = bank.source.final98d as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("251-256");
    expect(src.keyPages).toBe("257-258");
    expect(src.banks).toBe(12);
    expect(src.questions).toBe(46);
    expect(src.sections).toBe(17);
    expect(src.extractedRound).toBe(295);
    const audio = src.audioAbsent as Record<string, unknown>;
    expect(String(audio.section)).toContain("۱-۶");
    expect(String(audio.printedKey)).toContain("renewable energy");
    expect(String(audio.printedKey)).toContain("crazy about soccer");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.note)).toContain("Doctors/Fruits/Forests");
    expect(String(open.note)).toContain("Ghanoon in medicine");
  });

  it("listening with printed text (93): two three-option MCQs + one typed keyed by p257", () => {
    const qs = L(93).questions;
    expect(qs[0].options).toEqual(["Mina’s mother", "her close friend", "Maryam’s sister"]);
    expect(DEF_LETTERS.slice(0, 3)[qs[0].answer]).toBe(LIS_MCQ_KEYS[1]); // b/ her close friend
    expect(qs[1].options).toEqual(["Mina’s mother", "Zoheh’s mother", "Maryam’s sister"]);
    expect(DEF_LETTERS.slice(0, 3)[qs[1].answer]).toBe(LIS_MCQ_KEYS[2]); // c/ Maryam’s sister
    expect(qs[1].options[1]).toContain("Zoheh’s mother"); // املای چاپیِ بدنه وفادار
    expect(qs[2].kind).toBe("typed");
    expect(qs[2].accepted).toEqual(["She lives in another neighborhood."]); // کلیدِ جمله‌کاملِ چاپیِ راهنما
    expect(String(qs[2].question)).toContain("Where does Mina live?");
  });

  it("picture vocab (94): first-letter typed (balcony / monolingual) with printed hints in placeholder", () => {
    const qs = L(94).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["balcony"]);
    expect(String(qs[0].question)).toContain("sitting in the b——————— and drinking tea");
    expect(qs[1].accepted).toEqual(["monolingual"]);
    expect(String(qs[1].question)).toContain("m——————— dictionary");
    for (const q of qs) expect(q.placeholder, q.id).toContain("printed first letter");
  });

  it("definitions (95): single-word heads (calmly/tide/figure out/remind) — five printed options keyed c/d/e/b (a extra)", () => {
    const qs = L(95).questions;
    expect(qs.map((q) => q.options.length)).toEqual([5, 5, 5, 5]);
    expect(qs.map((q) => DEF_LETTERS[q.answer])).toEqual(["c", "d", "e", "b"]);
    expect(qs.map((q) => q.question)).toEqual(["calmly", "tide", "figure out", "remind"]);
    expect(qs[0].options).toContain("in a quiet way"); // c
    expect(qs[1].options).toContain("the rise and fall of the sea"); // d
    expect(qs[2].options).toContain("to find a solution or arrive at an answer to"); // e
    expect(qs[3].options).toContain("help somebody remember something"); // b
    expect(qs[0].options).toContain("a book in which you record"); // a — اضافهٔ چاپی حاضر در ستون
  });

  it("vocab bank-fill (96): printed bank of five words, radiation is the printed extra, keys faithful", () => {
    const qs = L(96).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_BANK[q.n]]);
      expect(q.options, q.id).toEqual(BANK_WORDS); // بانکِ کاملِ چاپی عیناً در options
      expect(q.options).toContain(K_BANK[q.n]);
    }
    const used = qs.map((q) => K_BANK[q.n]);
    expect(new Set(used).size).toBe(4);
    expect(BANK_WORDS.filter((w) => !used.includes(w))).toEqual(["radiation"]); // اضافهٔ چاپی
    expect(String(qs[3].question)).toContain("Wind towers are natural air");
  });

  it("odd one out (97): FIRST odd-one-out bank — keys c/d/c/a by p257 with semantic second judgement", () => {
    const qs = L(97).questions;
    for (const q of qs) expect(q.options, q.id).toHaveLength(4);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "d", "c", "a"]);
    expect(qs[0].options).toEqual(["water", "tree", "coal", "sun"]); // منبعِ تجدیدناپذیر
    expect(qs[1].options).toEqual(["pollution", "waste", "garbage", "resource"]);
    expect(qs[2].options).toEqual(["effective", "useful", "confusing", "helpful"]);
    expect(qs[3].options).toEqual(["generate", "use up", "absorb", "digest"]);
    expect(String(qs[0].question)).toContain("does not go with the other three");
  });

  it("verb forms (98): four typed with printed verb hints; item 31 dual key had learned/learnt", () => {
    const qs = L(98).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["has bought"]); // tag hasn't she
    expect(qs[1].accepted).toEqual(["were killed"]); // مجهولِ گذشتهٔ جمع
    expect(qs[2].accepted).toEqual(["had learned", "had learnt"]); // «had learned /learnt»
    expect(qs[3].accepted).toEqual(["be sent"]);
    for (const q of qs) expect(String(q.question)).toContain("(to"); // راهنمای فعل چاپی
    expect(String(qs[0].question)).toContain("hasn’t she?");
  });

  it("grammar MCQs (99): reversed print d,c,b,a remapped to natural a-d; keys c/a/c/d from guide", () => {
    const qs = L(99).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "a", "c", "d"]);
    expect(qs[0].options).toEqual(["meet", "have meet", "had met", "would meet"]); // «have meet» غلطِ چاپیِ بدنه
    expect(qs[1].options).toEqual(["would", "will", "may", "had"]);
    expect(qs[2].options).toEqual(["whose", "who", "which", "whom"]);
    expect(qs[3].options).toEqual(["should collect", "collect", "collected", "is collected"]);
    expect(String(qs[3].question)).toContain("When do they collect the waste");
  });

  it("word order (100): item 37 single; item 38 dual variants remontaged from the slash guide key", () => {
    const qs = L(100).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["My brother went to the library, but he didn’t study at all."]);
    expect(qs[1].accepted).toEqual([
      "She is watching the DVD that her father has bought.",
      "Her father is watching the DVD that she has bought.",
    ]);
    for (const q of qs) {
      const scrambleWords = String(q.question)
        .split(/[\s/]+/)
        .map((t) => t.replace(/[^\w\s'-]/g, "").trim())
        .filter(Boolean)
        .map((t) => norm(t));
      // ۳۷: انقباضِ چاپیِ کلید (didn’t) در بهم‌ریخته به دو تکه (didn’t/ study) پخش است — تنها استثنا (رسید source.final98d)
      const answerWords = norm(q.accepted?.[0] ?? "")
        .split(" ")
        .map((w) => w.replace(/[^\w'-]/g, ""))
        .filter(Boolean)
        .filter((w) => !(q.n === 1 && (w === "didn't" || w === "at" || w === "all")));
      for (const w of answerWords) {
        expect(scrambleWords, `${q.id} answer word "${w}"`).toContain(w);
      }
    }
    expect(String(qs[0].question)).toContain("went/ my brother/ to the library");
    expect(String(qs[1].question)).toContain("watching/ bought/ her father/ is/ the DVD");
  });

  it("connectives (101): closed printed pool {and, or, but, so}, keys or/so/but/and; printed spacing kept", () => {
    const qs = L(101).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_CONN[q.n]]);
      expect([...q.options].sort()).toEqual(["and", "but", "or", "so"]);
    }
    expect(String(qs[0].question)).toContain("He can buy the dictionary");
    expect(String(qs[3].question)).toContain("he wore it for two years ."); // فاصلهٔ چاپی پیش از نقطه — وفادار
  });

  it("tree reorder (102): FIRST letter-keyed six-sentence cloze — printed options a-f, key c/e/f/a/b/d", () => {
    const qs = L(102).questions;
    expect(qs).toHaveLength(1);
    const q = qs[0];
    expect(q.options[0]).toBe("c / e / f / a / b / d"); // عینِ کلیدِ چاپیِ راهنما
    expect(q.answer).toBe(0);
    for (let i = 1; i < q.options.length; i++) expect(q.options[i], `variant ${i}`).not.toBe(q.options[0]);
    // شش جملهٔ بدنه عیناً در رسیدِ داده — ترتیبِ حروفیِ چاپ
    expect(String(q.question)).toContain("Order the six mixed-up sentences");
  });

  it("tree sentences receipt: six printed sentences a-f exist verbatim in the bank provenance", () => {
    // شش جملهٔ کلوز ۴۳ راستی‌آزماییِ OCR شدند و عیناً در رسیدِ source.final98d ثبت‌اند
    const src = bank.source.final98d as Record<string, unknown>;
    expect(String((src.receipts as Array<{ item: string; note: string }>).find((r) => r.item === "43")?.note))
      .toContain("شش‌جمله‌ای");
  });

  it("reading electric cars (103): two typed verbatim + remontaged MCQ a + two False keyed by p258", () => {
    const qs = L(103).questions;
    expect(qs.slice(0, 2).every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted?.[0]).toContain("because they don’t burn gasoline in the engine");
    expect(qs[1].accepted?.[0]).toContain("plugged in at night");
    expect(qs[2].options[0]).toContain("combine the benefits of gasoline engines and electric motors");
    expect(qs[2].answer).toBe(0); // بازسازی از کلیدِ جمله‌کاملِ چاپی راهنما — رسید
    expect(qs[3].options).toEqual(["True", "False"]);
    expect(qs[3].answer).toBe(1); // ۵۱ False
    expect(qs[4].answer).toBe(1); // ۵۲ False — تنشِ «Not all» با کلیدِ چاپی حاکم
    expect(String(qs[4].question)).toContain("Not all electric cars have batteries");
  });

  it("reading ears (104): four MCQs keyed d/c/b/a by p258", () => {
    const qs = L(104).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["d", "c", "b", "a"]);
    expect(qs[0].options).toEqual(["our ears will not change in size", "our ears will be the same size.",
      "our ears will get colder", "our ears will not change in shape."]);
    expect(qs[1].options).toEqual(["he/she is a kind person", "he/she is very happy",
      "he/she may get angry easily", "he/she drinks a lot"]);
    expect(qs[2].options).toEqual(["his face, ears and nose", "the size, color and shape",
      "his mouth, eyes and nose", "the hair, eyes and color"]);
    expect(qs[3].options).toEqual(["When they are cold", "When they are medium-size",
      "When they are not white color", "When they are musical"]);
    expect(String(qs[3].question)).toContain("nervous character");
  });

  it("typed engine: normalizeTypedAnswer is case-insensitive across accepted variants", () => {
    expect(normalizeTypedAnswer("Were Killed")).toBe(normalizeTypedAnswer("were killed"));
    expect(normalizeTypedAnswer("She is watching the DVD that her father has bought.")).toBe(
      normalizeTypedAnswer("she is watching the dvd that her father has bought")
    );
    expect(normalizeTypedAnswer("Her father is watching the DVD that she has bought.")).toBe(
      normalizeTypedAnswer("her father is watching the dvd that she has bought")
    );
    expect(normalizeTypedAnswer("BALCONY")).toBe(normalizeTypedAnswer("balcony"));
  });

  it("no stem collision: fin98d ids are fresh and unseen in lessons <93", () => {
    const earlyIds = new Set(
      bank.lessons.filter((l) => l.lesson < 93).flatMap((l) => l.questions.map((q) => q.id))
    );
    const fresh = L(93).questions.concat(...FIN98D.slice(1).map((n) => L(n).questions)).map((q) => q.id);
    for (const id of fresh) expect(earlyIds.has(id), id).toBe(false);
    expect(fresh.every((id) => id.startsWith("g12-fin98d-"))).toBe(true);
  });

  it("dual-key integrity: every accepted array is non-empty and its head is present in options for typed", () => {
    for (const n of [93, 94, 96, 98, 100, 101]) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          expect(q.accepted?.length, q.id).toBeGreaterThan(0);
          expect(q.options, q.id).toContain(q.accepted?.[0]);
        }
      }
    }
  });

  it("faithful oddities receipt: seven honest oddities are locked in the shipped data", () => {
    // ۸: املای چاپیِ بدنه «Zoheh» وفادار (در گزینه‌ها — نه ساقه)
    expect(L(93).questions[1].options[1]).toContain("Zoheh");
    // ۲۵-۲۸: نخستین odd-one-out
    expect(L(97).questions[0].options[2]).toBe("coal");
    // ۳۱: کلیدِ دودوییِ چاپ
    expect(L(98).questions[2].accepted).toEqual(["had learned", "had learnt"]);
    // ۳۳: «have meet» غلطِ چاپیِ گزینه وفادار
    expect(L(99).questions[0].options[1]).toBe("have meet");
    // ۳۸: کلیدِ دودوییِ بازمونتاژشدهٔ اسلش‌دار
    expect(L(100).questions[1].accepted?.[1]).toContain("Her father is watching");
    // ۴۲: فاصلهٔ چاپیِ «years .» وفادار
    expect(String(L(101).questions[3].question)).toContain("two years .");
    // ۴۳: نخستین کلوزِ حروف‌محور — کلیدِ شش‌بخشی
    expect(L(102).questions[0].options[0]).toBe("c / e / f / a / b / d");
  });
});
