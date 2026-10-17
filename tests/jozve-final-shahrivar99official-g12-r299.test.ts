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
const FIN99SHO = [154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171] as const;

// کلیدهای چاپیِ «راهنمای تصحیح» ص۲۹۱-۲۹۲ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const PRVB_LETTERS = "fghij";
const K_L1: Record<number, string> = { 1: "a", 2: "c", 3: "c" };
const K_PIC: Record<number, string> = { 1: "b", 2: "d", 3: "a", 4: "c" }; // e اضافهٔ چاپی — متفاوت با c/b/d/aِ r298
const K_G: Record<number, string> = { 1: "b", 2: "c", 3: "b", 4: "d", 5: "c", 6: "a" };
const K_R1TF: Record<number, string> = { 1: "a", 2: "b" }; // ۳۳ True / ۳۴ False
const K_R1M: Record<number, string> = { 3: "d", 4: "a" };
const K_R2TF: Record<number, string> = { 1: "a", 2: "a" }; // ۳۹ True / ۴۰ True
const K_R2M: Record<number, string> = { 3: "b", 4: "d" };
const K_DEFB: Record<number, string> = { 1: "c", 2: "a", 3: "d", 4: "e" }; // b اضافهٔ چاپی
const K_PRVB: Record<number, string> = { 1: "j", 2: "h", 3: "f", 4: "g" }; // i اضافهٔ چاپی
const K_LG: Record<number, string> = { 1: "volleyball", 2: "team", 3: "fun", 4: "play", 5: "twice", 6: "games" };

describe("jozve topic grammar bank g12 — official shahrivar 99 exam (r299 extraction receipt)", () => {
  it("bank shape: three hundred twenty six lessons, official shahrivar 99 adds 18 banks / 61 items (family 1587)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 326 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      154: 3, 155: 3, 156: 2, 157: 6, 158: 4, 159: 3, 160: 3, 161: 6, 162: 2,
      163: 4, 164: 2, 165: 4, 166: 2, 167: 4, 168: 1, 169: 4, 170: 4, 171: 4,
    };
    const levels: Record<number, string> = {
      154: "استاندارد", 158: "استاندارد", 161: "استاندارد", 163: "استاندارد",
      165: "استاندارد", 169: "استاندارد", 170: "استاندارد",
    };
    for (const n of FIN99SHO) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی سراسری شهریور ۹۹");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(154).questions.map((q) => q.id)).toEqual([
      "g12-fin99sho-l1m1", "g12-fin99sho-l1m2", "g12-fin99sho-l1m3",
    ]);
    expect(L(168).questions.map((q) => q.id)).toEqual(["g12-fin99sho-cc1"]);
    // آزمون رسمی سراسری شهریور ۹۹: ۶۱ آیتم در ۱۸ بانک — خانواده: ۱۰۴۲ + ۶۱ = ۱۱۰۳
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1587);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1587);
  });

  it("provenance: source.final99sho registered — first official-source round (aee.medu.ir), second variant of one round, honest 50/63-67 absence", () => {
    const src = bank.source.final99sho as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("285-290");
    expect(String(src.keyPages)).toContain("291-292");
    expect(src.banks).toBe(18);
    expect(src.questions).toBe(61);
    expect(src.sections).toBe(18);
    expect(src.extractedRound).toBe(299);
    expect(String(src.branchVariant)).toContain("محتوایی متمایز");
    expect(String(src.branchVariant)).toContain("۶۷ آیتم");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Smoking");
    expect(String(open.items)).toContain("Having a healthy lifestyle");
    expect(String(src.titlePrinted)).toContain("aee.medu.ir");
    expect(String(src.titlePrinted)).toContain("تمامی رشته‌ها");
  });

  it("listening file 1 (154): MCQ keys a/c/c with printed stems — tired/consider/Behzad health", () => {
    const qs = L(154).questions;
    expect(qs.every((q) => (q.kind ?? "mcq") === "mcq")).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["a", "c", "c"]);
    expect(qs[0].options).toEqual([
      "he is working on a new project", "he is sick and feels weak",
      "he doesn`t sleep well at nights", "he is working on a difficult problem",
    ]);
    expect(qs[1].options).toEqual([
      "work, sport and responsibility", "money, sport and work",
      "work, money and responsibility", "responsibility, money and sport",
    ]);
    expect(String(qs[0].question)).toContain("Amin is really tired because ---------------");
    expect(String(qs[1].question)).toContain("consider --------------- more");
    expect(String(qs[2].question)).toBe("What does Behzad think about health?");
  });

  it("listening files 2+3 (155/156): full-sentence typed keys for 4/7/8 — first complete listening Q&A banks of the family", () => {
    const q4 = L(155).questions[0];
    expect(q4.kind).toBe("typed");
    expect(q4.accepted).toEqual(["He left his jacket on the bus."]);
    expect(String(q4.question)).toBe("Where did Alex leave his jacket?");
    const tfs = L(155).questions.slice(1);
    expect(tfs.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]); // ۵ False / ۶ True
    expect(String(tfs[0].question)).toContain("His jacket wasn’t new and expensive");
    expect(String(tfs[1].question)).toContain("call the bus station");
    const l3 = L(156).questions;
    expect(l3.every((q) => q.kind === "typed")).toBe(true);
    expect(l3[0].accepted).toEqual(["It is at 6:30."]);
    expect(l3[1].accepted).toEqual(["She may bring a birthday card."]);
    expect(String(l3[0].question)).toContain("What time is the birthday party?");
  });

  it("dialogue Nick (157): six typed keys with in-text printed numbers …9… — faithful …n……. style (r298 used parenthesized (5))", () => {
    const qs = L(157).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["volleyball", "team", "fun", "play", "twice", "games"]);
    expect(String(qs[0].question)).toContain("But my favorite sport is…9…---------------");
    expect(String(qs[1].question)).toContain("Are you on a ……10…---------------");
    expect(String(qs[4].question)).toContain("about …13…--------------- a week");
    expect(String(qs[5].question)).toContain("playing video …14…--------------- is a sport");
    for (const q of qs) expect(q.placeholder, q.id).toContain("missing word");
  });

  it("picture vocab (158): five printed sentences a-e with extra e (sofa) — keys b/d/a/c, DIFFERENT letters from booklet r298 (c/b/d/a)", () => {
    const qs = L(158).questions;
    const pool = [
      "The mother is hugging her little child.",
      "My sister often sits in the balcony and studies her lessons.",
      "The student circled the dictionary entry for the new word.",
      "Solar panels change solar power into electricity.",
      "The sofa converts into bed.",
    ];
    for (const q of qs) expect(q.options, q.id).toEqual(pool);
    expect(qs.every((q) => q.options.length === 5)).toBe(true);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["b", "d", "a", "c"]);
    expect(String(qs[0].question)).toContain("با توجه به تصاویر");
    expect(String(qs[0].question)).toContain("یک جمله اضافی است");
  });

  it("vocab bank (159): full printed pool in options (repeatedly/forever/demand/arrange — forever extra) — keys arrange/demand/repeatedly", () => {
    const qs = L(159).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) expect(q.options, q.id).toEqual(["repeatedly", "forever", "demand", "arrange"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["arrange", "demand", "repeatedly"]);
    expect(String(qs[0].question)).toContain("We’ll need to --------------- the chairs");
    expect(String(qs[1].question)).toContain("The --------------- for organic food is increasing");
    expect(String(qs[2].question)).toContain("I have told Mohsen --------------- to talk politely");
  });

  it("own knowledge (160): printed first letters h-/s-/p- carried in stems — hearing/smart/pollute", () => {
    const qs = L(160).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["hearing", "smart", "pollute"]);
    expect(String(qs[0].question)).toContain("is hard of h ---------------");
    expect(String(qs[1].question)).toContain("apps for s --------------- phones");
    expect(String(qs[2].question)).toContain("they p --------------- the rivers");
    for (const q of qs) expect(String(q.placeholder)).toContain("first letter");
  });

  it("grammar (161): six MCQ keys b/c/b/d/c/a — tag question, relative, passive known, passive perfect, conditional, increasingly", () => {
    const qs = L(161).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "c", "b", "d", "c", "a"]);
    expect(String(qs[0].question)).toContain("They will buy a new house, ---------------?");
    expect(qs[0].options[1]).toBe("won`t they"); // بک‌تیکِ چاپی
    expect(String(qs[2].question)).toContain("Hafez --------------- to be as one of the most famous Persian poet");
    expect(qs[3].options[3]).toBe("have been broken");
    expect(String(qs[4].question)).toContain("If the old man had his glasses");
    expect(String(qs[5].question)).toContain("My job has become --------------- difficult");
  });

  it("relative + conditional (162): which single key; cond1 accepts the printed modal list would/could/might — first multi-modal single-slot key", () => {
    const qs = L(162).questions;
    expect(qs[0].accepted).toEqual(["which"]);
    expect(String(qs[0].question)).toContain("A cheetah is an animal ---------------");
    expect(String(qs[0].placeholder)).toContain("which");
    expect(qs[1].accepted).toEqual(["would", "could", "might"]);
    expect(String(qs[1].question)).toContain("If I had wings, I ---------------");
    expect(String(qs[1].placeholder)).toContain("would/could/might");
    expect(normalizeTypedAnswer("WOULD")).toBe(normalizeTypedAnswer("would"));
  });

  it("reading Respect (163/164): TF True/False + respect/reflects; Q&A keys — 38 accepts all three printed example variants", () => {
    const r1 = L(163).questions;
    expect(r1.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(r1.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["d", "a"]);
    expect(String(r1[2].question)).toContain("We show our --------------- by being polite");
    expect(String(r1[3].question)).toContain("Telling your parents that you thank them");
    const qa = L(164).questions;
    expect(qa[0].accepted?.[0]).toContain("you appreciate who they are and what they do");
    expect(qa[1].accepted).toHaveLength(3);
    expect(qa[1].accepted?.[0]).toContain("washing the dishes");
    expect(qa[1].accepted?.[1]).toContain("cleaning the kitchen");
    expect(qa[1].accepted?.[2]).toContain("cleaning the room");
  });

  it("reading Early humans (165/166): TF True/True + humans/life of early humans + means/founding", () => {
    const r2 = L(165).questions;
    expect(r2.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "a"]);
    expect(r2.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["b", "d"]);
    expect(String(r2[2].question)).toContain("What does “they” in line 3 refer to?");
    expect(String(r2[3].question)).toContain("It is about ---------------");
    const cl = L(166).questions;
    expect(cl.map((q) => q.accepted?.[0])).toEqual(["means", "founding"]);
    expect(String(cl[1].question)).toContain("such as --------------- the cities");
  });

  it("connectives (167): full printed pool but/and/so/or in options — keys and/or/but/so with faithful curly apostrophes", () => {
    const qs = L(167).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["and", "or", "but", "so"]);
    expect(String(qs[0].question)).toContain("I get up early in the morning");
    expect(String(qs[3].question)).toContain("That dictionary is expensive");
    expect(String(qs[3].question)).toContain("can’t buy it");
  });

  it("compound sentence (168): single-item bank — key «so he passed it.» (second 1-item bank of the family after l102)", () => {
    const qs = L(168).questions;
    expect(qs).toHaveLength(1);
    expect(qs[0].accepted).toEqual(["so he passed it."]);
    expect(String(qs[0].question)).toContain("Saeed studied hard for the exam, ---------------");
    expect(String((bank.source.final99sho as Record<string, unknown>).receipts)).toContain("جمع نمره ٠٤");
  });

  it("definitions branch (169): five options a-e with extra b (cry suddenly) — keys c/a/d/e", () => {
    const qs = L(169).questions;
    const pool = [
      "to take something in, especially gradually",
      "cry suddenly",
      "a book in which you record your thoughts or feelings or what has happened every day",
      "to suddenly decide to do something",
      "to finish something",
    ];
    for (const q of qs) expect(q.options, q.id).toEqual(pool);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["c", "a", "d", "e"]);
    expect(String(qs[0].question)).toContain("I have kept a diary for twelve years");
    expect(String(qs[3].question)).toContain("Don’t use up all the milk");
  });

  it("proverbs branch (170): five options f-j with extra i — keys j/h/f/g", () => {
    const qs = L(170).questions;
    const pool = [
      "When you get money quickly, like by winning it, it’s easy to spend it or lose it quickly as well.",
      "When two people cooperate with each other, they come up with better ideas.",
      "You have to practice a skill a lot to become good at it.",
      "People like to spend time with those who are similar to them.",
      "You soon forget people or things that are no longer visible or present.",
    ];
    for (const q of qs) expect(q.options, q.id).toEqual(pool);
    expect(qs.map((q) => PRVB_LETTERS[q.answer])).toEqual(["j", "h", "f", "g"]);
    expect(String(qs[0].question)).toContain("Out of sight, out of mind");
    expect(String(qs[3].question)).toContain("Two heads are better than one");
  });

  it("word-order sentences (171): jumbled printed groups in stems — full-sentence keys from the guide (guide says pick two; all four playable)", () => {
    const qs = L(171).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(String(qs[0].question)).toContain("work / some workers / who / and teachers");
    expect(String(qs[1].question)).toContain("wrote / didn’t / a letter / the girl / she");
    expect(String(qs[2].question)).toContain("because / hadn’t rained / everything in the garden");
    expect(String(qs[3].question)).toContain("be / by the teacher / the parents / called / should");
    expect(qs[0].accepted?.[0]).toBe("There are some workers and teachers who work in the village.");
    expect(qs[1].accepted?.[0]).toBe("The girl wrote a letter, didn`t she?");
    expect(qs[2].accepted?.[0]).toBe("Everything in the garden was brown because it hadn`t rained.");
    expect(qs[3].accepted?.[0]).toBe("The parents should be called by the teacher.");
    expect(normalizeTypedAnswer("the girl wrote a letter, didn't she?")).toBe(
      normalizeTypedAnswer("The girl wrote a letter, didn`t she?")
    );
  });

  it("typed answer normalization: every accepted variant of banks 154-171 round-trips to itself", () => {
    for (const n of FIN99SHO) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
  });

  it("kind purity + collision: no id overlaps with lessons <154; typed sanity (accepted head ∈ options); stems carry no unfaithful additions", () => {
    for (const n of FIN99SHO) {
      const qs = L(n).questions;
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          if (n !== 168) expect(q.options, q.id).toContain(q.accepted?.[0]); // l168: options=[کلیدِ جملهٔ کامل]
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN99SHO.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 154).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
    // هیچ ساقه‌ای بین واریانتِ رسمی (این راند) و چاپِ جزوه (r298) کپی نشده — دو آزمونِ متفاوت
    const booklet = bank.lessons.filter((l) => l.lesson >= 138 && l.lesson <= 153).flatMap((l) => l.questions.map((q) => q.question));
    const official = FIN99SHO.flatMap((n) => L(n).questions.map((q) => q.question));
    for (const s of official) expect(booklet.includes(s), s.slice(0, 40)).toBe(false);
  });
});
