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
const FIN98 = [69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80] as const;

// کلیدهای چاپی راهنمای تصحیح ص۲۴۲-۲۴۳ — عیناً
const LIS_MCQ_KEYS: Record<number, string> = { 2: "a", 3: "c", 4: "b", 5: "d", 6: "c", 7: "a", 8: "b" };
const DEF_LETTERS = "abcde";
const K_DEF: Record<number, string> = { 1: "e", 2: "c", 3: "a", 4: "d" }; // b اضافهٔ چاپی
const BANK_WORDS = ["combination", "compile", "dedicated", "consume"];
const K_BANK: Record<number, string> = { 1: "consume", 2: "combination", 3: "dedicated" }; // compile اضافهٔ چاپی
const G_LETTERS = "abcd";
const K_G: Record<number, string> = { 1: "b", 2: "d", 3: "c", 4: "a" };
const K_CONN: Record<number, string> = { 1: "so", 2: "and", 3: "but", 4: "or" };
const ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"];
const K_ROLE: Record<number, number> = { 1: 1, 2: 1, 3: 0, 4: 2, 5: 1, 6: 1 }; // Supporting×۴ / Topic=۴۴ / Concluding=۴۵

describe("jozve topic grammar bank g12 — final exam خِرداد ۹۸ (r293 extraction receipt)", () => {
  it("bank shape: three hundred twenty six lessons, final 98 adds 12 banks / 51 items (family 1587)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 326 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      69: 8, 70: 2, 71: 4, 72: 3, 73: 3, 74: 4, 75: 4, 76: 2, 77: 4, 78: 6, 79: 5, 80: 6,
    };
    const levels: Record<number, string> = {
      69: "استاندارد", 71: "استاندارد", 75: "استاندارد", 78: "استاندارد", 79: "استاندارد", 80: "استاندارد",
    };
    for (const n of FIN98) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی خرداد ۹۸");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(69).questions.every((q) => q.id === `g12-fin98-lis${q.n}`)).toBe(true);
    expect(L(78).questions.every((q) => q.id === `g12-fin98-role${q.n}`)).toBe(true);
    // آزمون نهایی خرداد ۹۸: ۵۱ آیتم در ۱۲ بانک — خانواده: ۷۲۰ + ۵۱ = ۷۷۱
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1587);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1587);
  });

  it("provenance: source.final98 registered with two honest absences (printed-less listening + open paragraph)", () => {
    const src = bank.source.final98 as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("237-241");
    expect(src.keyPages).toBe("242-243");
    expect(src.banks).toBe(12);
    expect(src.questions).toBe(51);
    expect(src.extractedRound).toBe(293);
    const audio = src.audioAbsent as Record<string, unknown>;
    expect(String(audio.section)).toContain("۱-۶");
    expect(String(audio.printedKey)).toContain("take temperature");
    expect(String(audio.printedKey)).toContain("ذکر دو مورد کافی است");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.note)).toContain("Plant trees / Use less fossil fuels");
    expect(String(open.note)).toContain("Change waste to energy");
  });

  it("listening with printed text (69): first printed-text listening bank — 1 typed + 7 MCQs keyed by p242", () => {
    const qs = L(69).questions;
    expect(qs[0].kind).toBe("typed");
    expect(qs[0].accepted).toEqual(["wind"]);
    expect(qs[0].options).toEqual(["wind", "coal"]); // دو انتخابِ چاپیِ درونِ ساقه
    expect(String(qs[0].question)).toContain("Wind or Coal");
    for (let i = 2; i <= 8; i++) {
      const q = qs[i - 1];
      expect(q.kind, q.id).not.toBe("typed"); // ۸-۱۴ همه MCQ
      const letters = q.options.length === 3 ? "abc" : G_LETTERS;
      expect(letters[q.answer], q.id).toBe(LIS_MCQ_KEYS[i]);
    }
    // ۱۲/۱۳/۱۴ سه‌گزینه‌ایِ چاپ
    expect(qs[5].options).toEqual(["heart attack", "human's life", "air pollution"]);
    expect(qs[6].options).toEqual(["big cities", "roads", "highways"]);
    expect(qs[7].options).toEqual(["reasons", "diseases", "ways"]);
    // ۱۰/۱۱ داستانِ صوتیِ Bijan/Mehran — رسیدِ وابستگی در source.final98
    expect(String(qs[3].question)).toContain("Bijan didn't tell Mehran");
  });

  it("picture vocab (70): two typed with self-sufficient printed stems; item 16 dual printed key", () => {
    const qs = L(70).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["hard"]);
    expect(String(qs[0].question)).toContain("of hearing");
    expect(qs[1].accepted).toEqual(["wind turbines", "turbines"]); // کلید دودوییِ چاپ «Wind turbines/ turbines»
    expect(String(qs[1].question)).toContain("(s) use wind to generate electricity");
  });

  it("definitions (71): five printed options a..e with faithful letter keys e/c/a/d (b extra)", () => {
    const qs = L(71).questions;
    expect(qs.map((q) => q.options.length)).toEqual([5, 5, 5, 5]);
    expect(qs.map((q) => DEF_LETTERS[q.answer])).toEqual(["e", "c", "a", "d"]);
    expect(qs[0].options).toContain("in a way that is successful and achieves what you want"); // e
    expect(qs[1].options).toContain("a book in which you record your thoughts and feelings"); // c
    expect(qs[2].options).toContain("the rise and fall of the sea"); // a
    expect(qs[3].options).toContain("to change in form or character"); // d
    expect(qs[2].options).toContain("in a quiet way"); // b — اضافهٔ چاپی حاضر در ستون
    expect(String(qs[0].question)).toContain("helpful tips on how to use a dictionary");
    expect(String(qs[3].question)).toContain("convert some sofas into a bed");
  });

  it("vocab bank-fill (72): printed bank of four words, compile is the printed extra, keys faithful", () => {
    const qs = L(72).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_BANK[q.n]]);
      expect(q.options.every((o) => BANK_WORDS.includes(o)), q.id).toBe(true);
      expect(q.options[0]).toBe(K_BANK[q.n]); // اسکفولد: کلید نخست
      expect(q.options.length).toBe(4);
    }
    const used = qs.map((q) => K_BANK[q.n]);
    expect(new Set(used).size).toBe(3);
    expect(BANK_WORDS.filter((w) => !used.includes(w))).toEqual(["compile"]); // اضافهٔ چاپی
    expect(String(qs[2].question)).toContain("spared no pains to help sick people");
  });

  it("knowledge completion (73): first-letter printed hints kept attached; dual key on 25; hug anchored by glossary", () => {
    const qs = L(73).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["absorb"]);
    expect(String(qs[0].question)).toContain("Plants a---------------"); // حرفِ چاپیِ نخست چسبیده
    expect(qs[1].accepted).toEqual(["symbol", "sign"]); // کلید دودوییِ چاپ «symbol /sign»
    expect(String(qs[1].question)).toContain("chemical s --------------- for hydrogen");
    expect(qs[2].accepted).toEqual(["hug"]); // کلیدِ بریدهٔ «hu» — رسیدِ لنگرِ واژه‌نامه
    expect(String(qs[2].question)).toContain("usually h---------------");
    for (const q of qs) expect(q.options[0], q.id).toBe(q.accepted?.[0]);
  });

  it("verb forms in dialogue (74): four typed with printed verb hints; 29 dual key would/could go", () => {
    const qs = L(74).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["seems"]);
    expect(qs[1].accepted).toEqual(["had decided"]);
    expect(qs[2].accepted).toEqual(["would go", "could go"]); // کلید چاپی «would/ could go»
    expect(qs[3].accepted).toEqual(["are served"]);
    for (const q of qs) expect(String(q.question)).toContain("(to"); // راهنمای فعل چاپی
    expect(String(qs[2].question)).toContain("If it were fine, We"); // W بزرگِ چاپیِ میانه — وفادار
  });

  it("grammar MCQs (75): reversed print d,c,b,a remapped to natural a-d; keys b/d/c/a from guide", () => {
    const qs = L(75).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "d", "c", "a"]);
    expect(qs[0].options).toEqual(["whom", "which", "who", "whose"]);
    expect(qs[1].options).toEqual(["was produced", "produce", "may produce", "may be produced"]);
    expect(qs[2].options).toEqual(["communicate", "communication", "communicative", "to communicate"]);
    expect(qs[3].options).toEqual(["into", "on", "up", "over"]);
    expect(String(qs[2].question)).toContain("kept to himself");
  });

  it("word order (76): first dual full-sentence keys — both printed guide variants accepted", () => {
    const qs = L(76).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual([
      "Everything in the garden was brown because it hadn't rained for months.",
      "Everything is brown in the garden because it hadn't rained for months.",
    ]);
    expect(qs[1].accepted).toEqual([
      "The woman who lives next door is a famous professor.",
      "The woman who is a famous professor lives next door.",
    ]);
    for (const q of qs) {
      // پوششِ واژه‌سطحِ دوسویه علیه واریانتِ نخست (الگوی r292)
      const scrambleWords = String(q.question)
        .split(/[\s/]+/)
        .map((t) => t.replace(/[^\w\s'-]/g, "").trim())
        .filter(Boolean)
        .map((t) => norm(t));
      const primaryWords = norm(q.accepted?.[0] ?? "")
        .split(" ")
        .map((w) => w.replace(/[^\w'-]/g, ""))
        .filter(Boolean);
      for (const w of scrambleWords) {
        expect(primaryWords, `${q.id} scramble word "${w}"`).toContain(w);
      }
      for (const w of primaryWords) {
        expect(scrambleWords, `${q.id} answer word "${w}"`).toContain(w);
      }
      // واریانت دوم چاپیِ راهنماست — تنشِ «is» در برابرِ بهم‌ریختهٔ «was» فقط در ۳۵ (رسید source.final98)
      if (q.n === 1 && q.accepted && q.accepted.length > 1) {
        expect(q.accepted[1], q.id).toContain("Everything is brown");
        expect(scrambleWords, q.id).not.toContain("is");
        expect(scrambleWords, q.id).toContain("was");
      }
    }
    expect(String(qs[0].question)).toContain("hadn't / in the garden / was / it");
    expect(String(qs[1].question)).toContain("famous / lives / the woman / professor");
  });

  it("connectives (77): closed printed pool {and, or, but, so}, keys so/and/but/or", () => {
    const qs = L(77).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_CONN[q.n]]);
      expect([...q.options].sort()).toEqual(["and", "but", "or", "so"]);
    }
    expect(String(qs[0].question)).toContain("The early bird catches the worm");
    expect(String(qs[3].question)).toContain("when I finish your painting");
  });

  it("paragraph roles (78): six three-option MCQs keyed by p243 descriptor table (Topic=44, Concluding=45)", () => {
    const qs = L(78).questions;
    for (const q of qs) {
      expect(q.options, q.id).toEqual(ROLE_OPTIONS);
      expect(q.answer, q.id).toBe(K_ROLE[q.n]);
    }
    expect(K_ROLE[3]).toBe(0); // Topic — آب: بنیادی‌ترین عنصر (۴۴)
    expect(K_ROLE[4]).toBe(2); // Concluding (۴۵)
    expect(String(qs[5].question)).toContain("No living-being"); // املای بدنهٔ چاپ — رسید
    expect(String(qs[4].question)).toContain("large and commercial scale");
  });

  it("reading charity (79): two typed verbatim + synonym MCQ b + two True (52 with printed-key tension)", () => {
    const qs = L(79).questions;
    expect(qs.slice(0, 2).every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted?.[0]).toContain("great personal happiness but also to respect from others");
    expect(qs[1].accepted?.[0]).toContain("we continue to give to those who are more in need");
    expect(qs[2].options).toEqual(["experience", "advantage", "choice", "effect"]);
    expect(qs[2].answer).toBe(1); // b/ advantage — کلید چاپی
    expect(qs[3].options).toEqual(["True", "False"]);
    expect(qs[3].answer).toBe(0); // (a) True
    expect(qs[4].answer).toBe(0); // (a) True — تنشِ «All people» — الگوی r289، رسید در source.final98
    expect(String(qs[4].question)).toContain("All people feel great personal happiness");
  });

  it("reading dictionary (80): three typed verbatim + reference MCQ c + antonym MCQ a + one False", () => {
    const qs = L(80).questions;
    expect(qs.slice(0, 3).every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted?.[0]).toContain("By using a talking dictionary");
    expect(qs[1].accepted?.[0]).toContain("Seeing specific words used in a sentence");
    expect(qs[2].accepted?.[0]).toContain("When reading or writing a story, an essay, a paragraph");
    expect(qs[3].options).toEqual(["pronunciation", "spelling", "part of speech", "example sentence"]);
    expect(qs[3].answer).toBe(2); // c/ part of speech
    expect(qs[4].options).toEqual(["out of reach", "valuable", "repetitive", "accessible"]);
    expect(qs[4].answer).toBe(0); // a/ out of reach
    expect(qs[5].options).toEqual(["True", "False"]);
    expect(qs[5].answer).toBe(1); // b/ False
    expect(String(qs[3].question)).toContain("line 7");
  });

  it("typed engine: normalizeTypedAnswer accepts dual printed keys and both word-order variants", () => {
    expect(normalizeTypedAnswer("Wind Turbines")).toBe(normalizeTypedAnswer("wind turbines"));
    expect(normalizeTypedAnswer("Could go")).toBe(normalizeTypedAnswer("could go"));
    expect(normalizeTypedAnswer("Everything in the garden was brown because it hadn't rained for months.")).toBe(
      normalizeTypedAnswer("everything in the garden was brown because it hadn't rained for months")
    );
    expect(normalizeTypedAnswer("The woman who is a famous professor lives next door")).toBe(
      normalizeTypedAnswer("The woman who is a famous professor lives next door.")
    );
    expect(normalizeTypedAnswer("HUG")).toBe(normalizeTypedAnswer("hug"));
  });

  it("no stem collision: fin98 ids are fresh and unseen in lessons <69", () => {
    const earlyIds = new Set(
      bank.lessons.filter((l) => l.lesson < 69).flatMap((l) => l.questions.map((q) => q.id))
    );
    const fresh = L(69).questions.concat(...FIN98.slice(1).map((n) => L(n).questions)).map((q) => q.id);
    for (const id of fresh) expect(earlyIds.has(id), id).toBe(false);
    expect(fresh.every((id) => id.startsWith("g12-fin98-"))).toBe(true);
  });

  it("dual-key integrity: every accepted array is non-empty and its head equals options[0] for typed", () => {
    for (const n of [69, 70, 72, 73, 74, 76, 77]) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          expect(q.accepted?.length, q.id).toBeGreaterThan(0);
          expect(q.options[0], q.id).toBe(q.accepted?.[0]);
        }
      }
    }
  });

  it("faithful oddities receipt: six honest oddities are locked in the shipped data", () => {
    // ۲۶: کلیدِ بریدهٔ «hu» → hug (لنگر واژه‌نامه)
    expect(L(73).questions[2].accepted).toEqual(["hug"]);
    // ۳۱-۳۴: چاپ وارونه — بازنگاشت طبیعی
    expect(L(75).questions[0].options[3]).toBe("whose"); // d چاپی آخرِ طبیعی
    // ۳۵: واریانت دوم «is brown» با بهم‌ریختهٔ «was» — هر دو پذیرفته
    expect(L(76).questions[0].accepted?.[1]).toContain("Everything is brown in the garden");
    // ۴۷: املای بدنه «No living-being» حاکم
    expect(String(L(78).questions[5].question)).toContain("No living-being");
    // ۵۲: تنشِ کلید «All people» → True چاپی
    expect(L(79).questions[4].answer).toBe(0);
    // ۱۲: سه‌گزینه‌ایِ چاپ
    expect(L(69).questions[5].options).toHaveLength(3);
  });
});
