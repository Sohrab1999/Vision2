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
const FIN99SH = [138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153] as const;

// کلیدهای چاپیِ «Answer key» ص۲۸۳-۲۸۴ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "d", 2: "c", 3: "a", 4: "c" }; // آیتم ۲ سه‌گزینه‌ایِ چاپی
const K_PB: Record<number, string> = { 1: "wonderful", 2: "minds", 3: "invisible", 4: "visit" }; // ۵-۸
const K_PC: Record<number, string> = { 1: "developed", 2: "batteries", 3: "benefit", 4: "goals" }; // ۹-۱۲
const K_PIC: Record<number, string> = { 1: "c", 2: "b", 3: "d", 4: "a" }; // ۱۳-۱۶ — بدونِ جملهٔ اضافی
const K_DEFB: Record<number, string> = { 1: "d", 2: "e", 3: "a", 4: "b" }; // c اضافهٔ چاپی
const K_VBANK: Record<number, string> = { 1: "cooling", 2: "dedicated", 3: "combination" }; // forgive اضافهٔ چاپی
const K_OK: Record<number, string> = { 1: "diary", 2: "demand", 3: "absorb" };
const K_G: Record<number, string> = { 1: "c", 2: "b", 3: "b", 4: "b" }; // ۲۸ = «unseccessfully» چاپی → unsuccessfully
const K_VF: Record<number, string> = { 1: "seems", 2: "had decided", 3: "would go", 4: "is served" };
const K_R1M: Record<number, string> = { 1: "c", 2: "c" };
const K_R1TF: Record<number, string> = { 3: "b", 4: "a" }; // ۳۹ False / ۴۰ True
const K_R2M: Record<number, string> = { 1: "b", 2: "b" };
const K_R2TF: Record<number, string> = { 3: "a", 4: "b" }; // ۴۵ True / ۴۶ False
const K_CONN: Record<number, string> = { 1: "and", 2: "so", 3: "or", 4: "but" };
const ROLE_OPTS = ["Topic sentence", "Supporting sentence", "Concluding sentence"];
const K_ROLE: Record<number, number> = { 1: 2, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1 }; // a=Concluding / c=Topic / b,d,e,f=Supporting

describe("jozve topic grammar bank g12 — final exam شهریور ۹۹ (r298 extraction receipt)", () => {
  it("bank shape: two hundred twenty-seven lessons, shahrivar 99 adds 16 banks / 58 items (family 1283)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 227 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      138: 4, 139: 4, 140: 4, 141: 4, 142: 4, 143: 3, 144: 3, 145: 4,
      146: 4, 147: 2, 148: 4, 149: 2, 150: 4, 151: 2, 152: 4, 153: 6,
    };
    const levels: Record<number, string> = {
      138: "استاندارد", 139: "آموزشی — ورود آزاد", 140: "آموزشی — ورود آزاد",
      141: "استاندارد", 142: "استاندارد", 145: "استاندارد", 148: "استاندارد",
      150: "استاندارد", 153: "استاندارد",
    };
    for (const n of FIN99SH) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی شهریور ۹۹");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(138).questions.map((q) => q.id)).toEqual([
      "g12-fin99sh-l1m1", "g12-fin99sh-l1m2", "g12-fin99sh-l1m3", "g12-fin99sh-l1m4",
    ]);
    expect(L(153).questions.every((q) => q.id === `g12-fin99sh-role${q.n}`)).toBe(true);
    // آزمون نهایی شهریور ۹۹: ۵۸ آیتم در ۱۶ بانک — خانواده: ۹۸۴ + ۵۸ = ۱۰۴۲
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1283);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1283);
  });

  it("provenance: source.final99sh registered — first inline Answer key round, complete 52/52 coverage, honest Gharib absence", () => {
    const src = bank.source.final99sh as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("277-282");
    expect(String(src.keyPages)).toContain("283-284");
    expect(String(src.keyPages)).toContain("Answer key");
    expect(src.banks).toBe(16);
    expect(src.questions).toBe(58);
    expect(src.sections).toBe(14);
    expect(src.extractedRound).toBe(298);
    expect(String(src.inlineAnswerKey)).toContain("۵۲/۵۲");
    expect(String(src.beyondNumbering)).toContain("۵۸ از ۵۲");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Dr.Mohamad Gharib");
    expect(String(src.titlePrinted)).toContain("شهریورماه ۱۳۹۹");
  });

  it("listening file 1 (138): MCQ keys d/c/a/c — item 2 is a three-option print; item 4 four options", () => {
    const qs = L(138).questions;
    expect(qs.every((q) => (q.kind ?? "mcq") === "mcq")).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["d", "c", "a", "c"]);
    expect(qs[0].options).toEqual(["pencils", "dictionaries", "notebooks", "pens"]);
    expect(qs[1].options).toEqual(["pen", "pencil", "dictionary"]); // سه‌گزینه‌ایِ چاپی
    expect(qs[2].options).toEqual(["score", "dictionary", "scarf"]);
    expect(qs[3].options).toEqual(["lazy", "busy", "clever", "funny"]);
    expect(String(qs[0].question)).toContain("because she had bought some before");
  });

  it("listening Part B superhuman (139): typed cloze with printed blank markers (5)-(8) — keys wonderful/minds/invisible/visit", () => {
    const qs = L(139).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["wonderful", "minds", "invisible", "visit"]);
    expect(String(qs[0].question)).toContain("superhuman has (5) --------------- abilities");
    expect(String(qs[1].question)).toContain("read people's (6) ---------------");
    expect(String(qs[2].question)).toContain("(7) --------------- or sometimes very strong");
    expect(String(qs[3].question)).toContain("Do you like to (8) --------------- a superhuman?");
    for (const q of qs) expect(q.placeholder, q.id).toContain("missing word");
  });

  it("listening Part C electric cars (140): typed keys developed/batteries/benefit/goals — «Electric cars» capital-E print faithful", () => {
    const qs = L(140).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["developed", "batteries", "benefit", "goals"]);
    expect(String(qs[0].question)).toContain("The needs for Electric cars");
    expect(String(qs[3].question)).toContain("such as better fuel economy or more power");
  });

  it("picture vocab (141): four printed sentences, picture-letter keys c/b/d/a — no extra sentence (r297 had five + c)", () => {
    const qs = L(141).questions;
    const pool = [
      "I always use monolingual dictionary to learn vocabulary.",
      "My grandfather feeds the pigeons in the park every morning.",
      "In the opposite of fans, wind turbines use wind to generate electricity.",
      "Today some people use shiny panels on the roofs to collect heat.",
    ];
    for (const q of qs) expect(q.options, q.id).toEqual(pool);
    // حروفِ چاپیِ تصویرها: جملهٔ ۱۳→تصویر c، ۱۴→b، ۱۵→d، ۱۶→a (حروفِ تصویرند نه جایگاهِ گزینه)
    expect(qs.map((q) => K_PIC[q.n])).toEqual(["c", "b", "d", "a"]);
    // هر سوال پاسخش جملهٔ خودش است (چرخهٔ کامل — بدونِ اضافه)
    expect(qs.map((q) => q.answer)).toEqual([0, 1, 2, 3]);
    expect(String(qs[0].question)).toContain("تصویر (c)");
    expect(String(qs[3].question)).toContain("تصویر (a)");
  });

  it("matching column B (142): five printed definitions with c extra — keys d/e/a/b", () => {
    const qs = L(142).questions;
    for (const q of qs) expect(q.options, q.id).toEqual([
      "To put things in a useful order",
      "To cry suddenly",
      "To take something in",
      "Many different types of things or people",
      "Birds of a feather flock together",
    ]);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["d", "e", "a", "b"]);
    expect(PIC_LETTERS.split("").filter((x) => !["d", "e", "a", "b"].includes(x))).toEqual(["c"]);
    expect(String(qs[0].question)).toContain("come from a variety of different background"); // مفردِ چاپی وفادار
    expect(String(qs[3].question)).toContain("burst into tears on hearing of the death");
  });

  it("vocab bank-fill (143): printed bank forgive/cooling/dedicated/combination — forgive is the printed extra", () => {
    const qs = L(143).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_VBANK[q.n]]);
      expect(q.options, q.id).toEqual(["forgive", "cooling", "dedicated", "combination"]);
    }
    const used = qs.map((q) => K_VBANK[q.n]);
    expect(new Set(used).size).toBe(3);
    expect(["forgive", "cooling", "dedicated", "combination"].filter((w) => !used.includes(w))).toEqual(["forgive"]);
    expect(String(qs[1].question)).toContain("spared no pains to help people");
    expect(String(qs[2].question)).toContain("a --------------- of paints in his works");
  });

  it("own knowledge (144): printed first-letter carriers ad/d/a kept inside stems — keys diary/demand/absorb", () => {
    const qs = L(144).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(String(qs[0].question)).toContain("is called ad ---------------"); // حرفِ تعریف + حرفِ اولِ چاپی
    expect(String(qs[1].question)).toContain("Nowadays d --------------- for organic food");
    expect(String(qs[2].question)).toContain("Plants a --------------- carbon dioxide");
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["diary", "demand", "absorb"]);
    for (const q of qs) expect(q.placeholder, q.id).toContain("printed first letter");
    expect(normalizeTypedAnswer("Diary")).toBe(normalizeTypedAnswer("diary"));
  });

  it("grammar (145): keys c/b/b/b — key 28 prints the typo «unseccessfully»; body option b «unsuccessfully» is the governing key (slide receipt)", () => {
    const qs = L(145).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "b", "b", "b"]);
    expect(qs[0].options).toEqual(["which", "when", "who", "whose"]);
    expect(qs[1].options).toEqual(["success", "unsuccessfully", "succeed", "unsuccessful"]);
    expect(qs[2].options).toEqual(["was discovering", "was discovered", "has discovered", "had discovered"]);
    expect(qs[3].options).toEqual(["to lose", "had lost", "was lost", "would lose"]);
    // نقطهٔ سرگردانِ چاپِ «Alcohol.» در ساقه حذف شد — رسید
    expect(String(qs[2].question)).toContain("Alcohol --------------- by an Iranian scientist called Razi");
    expect(String((bank.source.final99sh as Record<string, unknown>).receipts)).toContain("unseccessfully");
  });

  it("verb forms (146): shared Jack/Kevin dialogue with r293 — «special seafood → is served» (singular) and single-variant «would go» (r293 was would/could binary); own answer first in options", () => {
    const qs = L(146).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["seems", "had decided", "would go", "is served"]);
    expect(qs[2].accepted).toEqual(["would go"]); // تک‌واریانته — کلیدِ چاپیِ این نوبت حاکم (رسیدِ تقابل با r293)
    expect(String(qs[3].question)).toContain("special seafood (34) --------------- (to serve)");
    for (const q of qs) {
      expect(q.options?.[0], q.id).toBe(q.accepted?.[0]); // سرِ accepted نخست (الگوی r293)
      expect(q.options, q.id).toHaveLength(4);
    }
    expect(new Set(qs.flatMap((q) => q.options ?? [])).size).toBe(4);
    expect(String(qs[0].question)).toContain("doesn't it?");
  });

  it("word order (147): two jumbles with complete printed keys — full word-surface coverage per variant", () => {
    const qs = L(147).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["If my uncle passed his driving test, he could drive a car."]);
    expect(qs[1].accepted).toEqual(["My mother wants to buy this, which is the golden watch."]);
    for (const q of qs) {
      const scrambleWords = String(q.question)
        .split(/[\s/]+/)
        .map((t) => t.replace(/[’‘`´]/g, "'").replace(/[^\w\s'-]/g, "").trim())
        .filter(Boolean)
        .map((t) => norm(t));
      const answerWords = norm(q.accepted![0])
        .split(" ")
        .map((w) => w.replace(/[^\w'-]/g, ""))
        .filter(Boolean);
      for (const w of answerWords) {
        expect(scrambleWords, `${q.id} word "${w}"`).toContain(w);
      }
    }
    expect(String(qs[0].question)).toContain("if/ could / he / a car/ my uncle /his driving test / passed/ drive");
    expect(String(qs[1].question)).toContain("my mother/ this / the golden watch / is / which/ to buy/ wants/");
  });

  it("reading environment (148): MCQ keys c/c + T/F False/True — «environmental population» print oddity faithful", () => {
    const qs = L(148).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "mcq", "mcq"]);
    expect(qs.slice(0, 2).map((q) => G_LETTERS[q.answer])).toEqual(["c", "c"]);
    expect(qs[0].options[2]).toBe("an increase in most forms of environmental population");
    expect(qs[1].options).toEqual(["are endless", "would soon be used", "are more than they were in the past", "disappear quickly"]);
    expect(qs.slice(2).map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(String(qs[3].question)).toContain("at lower rate"); // املای چاپیِ وفادار
    expect(String(qs[1].question)).toContain("The limits to Growth");
  });

  it("reading environment typed (149): two complete-sentence keys 41/42", () => {
    const qs = L(149).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["They think that the world seems to be getting worse."]);
    expect(qs[1].accepted).toEqual(["They believe that energy and natural resources have become more than they were in the past."]);
    for (const q of qs) expect(q.placeholder, q.id).toContain("complete sentence");
    expect(normalizeTypedAnswer(qs[0].accepted![0])).toBeTruthy();
  });

  it("reading newborn (150): MCQ keys b/b + T/F True/False — four-option semantics for «act» closest-meaning", () => {
    const qs = L(150).questions;
    expect(qs.map((q) => q.kind ?? "mcq")).toEqual(["mcq", "mcq", "mcq", "mcq"]);
    expect(qs.slice(0, 2).map((q) => G_LETTERS[q.answer])).toEqual(["b", "b"]);
    expect(qs[0].options).toEqual(["his facial expressions", "crying", "saying difficult words", "gestures"]);
    expect(qs[1].options).toEqual(["remind", "copy", "change", "respect"]);
    expect(qs.slice(2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(String(qs[1].question)).toContain("The word");
    expect(String(qs[1].question)).toContain("act");
  });

  it("reading newborn typed (151): key 47 prints singular «his feeling» (oddity locked) + complete-sentence key 48", () => {
    const qs = L(151).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["A baby can show his feeling by crying."]); // مفردِ چاپی — عینِ کلید
    expect(qs[1].accepted).toEqual(["When he gets older he can choose proper words and expressions to say what he wants."]);
    expect(String(qs[0].question)).toContain("How can a baby show his feelings?");
  });

  it("connectives (152): closed pool {and, so, or, but} — keys and/so/or/but (49-52)", () => {
    const qs = L(152).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) expect(q.options, q.id).toEqual(["and", "so", "or", "but"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["and", "so", "or", "but"]);
    expect(String(qs[0].question)).toContain("They went to the park yesterday");
    expect(String(qs[3].question)).toContain("She loves apples");
  });

  it("water paragraph roles (153): six lettered sentences a-f — c=Topic / a=Concluding / b,d,e,f=Supporting per the printed key table", () => {
    const qs = L(153).questions;
    expect(qs.every((q) => (q.kind ?? "mcq") === "mcq")).toBe(true);
    for (const q of qs) expect(q.options, q.id).toEqual(ROLE_OPTS);
    for (const q of qs) expect(q.answer, q.id).toBe(K_ROLE[q.n]);
    expect(String(qs[0].question)).toContain("Thus, water is very important to our life and our planet");
    expect(String(qs[2].question)).toContain("Water is the most essential element in our life");
    expect(String(qs[5].question)).toContain("Water is also essential for animals, birds, insects, etc");
    expect(String(qs[1].question)).toContain("the wild life is going to extinct without it"); // املای چاپیِ وفادار
  });

  it("kind purity + collision: no id overlaps with lessons <138; typed sanity (accepted head ∈ options)", () => {
    for (const n of FIN99SH) {
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
    const newIds = new Set(FIN99SH.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 138).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });

  it("eight oddities locked faithful: «unseccessfully» slide, singular «background», «In the opposite of fans», «is called ad», singular «his feeling», single «would go», singular «is served», «environmental population»", () => {
    expect(String((bank.source.final99sh as Record<string, unknown>).receipts)).toContain("unseccessfully");
    expect(String(L(142).questions[0].question)).toContain("different background");
    expect(L(141).questions[2].options[2]).toBe("In the opposite of fans, wind turbines use wind to generate electricity.");
    expect(String(L(144).questions[0].question)).toContain("is called ad ---------------");
    expect(L(151).questions[0].accepted?.[0]).toContain("his feeling by crying");
    expect(L(146).questions[2].accepted).toEqual(["would go"]);
    expect(L(146).questions[3].accepted?.[0]).toBe("is served");
    expect(L(148).questions[0].options[2]).toContain("environmental population");
  });
});
