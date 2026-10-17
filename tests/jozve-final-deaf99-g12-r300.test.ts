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
const FIN99SHD = [172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190] as const;

// کلیدهای چاپیِ «راهنمای تصحیح ویژهٔ ناشنوایان» ص۲۹۹-۳۰۰ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const PRVB_LETTERS = "fghij";
const K_PIC: Record<number, string> = { 1: "b", 2: "d", 3: "a", 4: "c" }; // e اضافهٔ چاپی
const K_ODD: Record<number, string> = { 1: "b", 2: "c" }; // look up / coal
const K_G: Record<number, string> = { 1: "b", 2: "c", 3: "b", 4: "d", 5: "c", 6: "a" };
const K_R1TF: Record<number, string> = { 1: "a", 2: "a" }; // ۲۷ True / ۲۸ True
const K_R1M: Record<number, string> = { 3: "b", 4: "d" };
const K_R2TF: Record<number, string> = { 1: "a", 2: "b" }; // ۳۳ True / ۳۴ False
const K_R2M: Record<number, string> = { 3: "d", 4: "a" };
const K_R3TF: Record<number, string> = { 1: "a", 2: "a" }; // ۳۹ True / ۴۰ True
const K_DEFB: Record<number, string> = { 1: "c", 2: "a", 3: "d", 4: "e" };
const K_PRVB: Record<number, string> = { 1: "j", 2: "h", 3: "f", 4: "g" };
const K_VB: Record<number, string> = { 1: "arrange", 2: "demand", 3: "repeatedly", 4: "burst", 5: "variety" };

describe("jozve topic grammar bank g12 — deaf-students shahrivar 99 exam (r300 extraction receipt)", () => {
  it("bank shape: three hundred four lessons, deaf exam adds 19 banks / 63 items (family 1494)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 304 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      172: 4, 173: 5, 174: 2, 175: 3, 176: 6, 177: 4, 178: 2, 179: 4, 180: 2,
      181: 4, 182: 2, 183: 2, 184: 2, 185: 4, 186: 1, 187: 4, 188: 4, 189: 4, 190: 4,
    };
    const levels: Record<number, string> = {
      172: "استاندارد", 174: "استاندارد", 176: "استاندارد", 179: "استاندارد",
      181: "استاندارد", 183: "استاندارد", 188: "استاندارد", 189: "استاندارد",
    };
    for (const n of FIN99SHD) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی ناشنوایان شهریور ۹۹");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(172).questions.map((q) => q.id)).toEqual([
      "g12-fin99shd-pic1", "g12-fin99shd-pic2", "g12-fin99shd-pic3", "g12-fin99shd-pic4",
    ]);
    expect(L(186).questions.map((q) => q.id)).toEqual(["g12-fin99shd-cc1"]);
    // آزمون ویژهٔ ناشنوایان: ۶۳ آیتم در ۱۹ بانک — خانواده: ۱۱۰۳ + ۶۳ = ۱۱۶۶
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1494);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1494);
  });

  it("provenance: source.final99shd registered — first listening-free round, four NEW sections, third variant of one date", () => {
    const src = bank.source.final99shd as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("293-298");
    expect(String(src.keyPages)).toContain("299-300");
    expect(src.banks).toBe(19);
    expect(src.questions).toBe(63);
    expect(src.sections).toBe(18);
    expect(src.extractedRound).toBe(300);
    expect(src.audioAbsent).toBeNull(); // بخش شنیداری اساساً وجود ندارد — نه غیبتِ فایل
    expect(String(src.branchVariant)).toContain("بی‌شنیداری");
    expect(String(src.branchVariant)).toContain("ناهماهنگ");
    expect(String(src.branchVariant)).toContain("پاراگراف‌کاوی");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Smoking");
    expect(String(open.items)).toContain("explanation");
    expect(String(src.titlePrinted)).toContain("ویژهٔ ناشنوایان");
  });

  it("picture vocab (172): same five printed sentences as r299 with extra e — keys b/d/a/c", () => {
    const qs = L(172).questions;
    expect(qs.every((q) => (q.kind ?? "mcq") === "mcq")).toBe(true);
    expect(qs.every((q) => q.options.length === 5)).toBe(true);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["b", "d", "a", "c"]);
    expect(String(qs[0].question)).toContain("با توجه به تصاویر");
  });

  it("six-word bank (173): printed pool repeatedly/forever/burst/demand/variety/arrange (forever extra) — burst/variety are NEW words of this round", () => {
    const qs = L(173).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["repeatedly", "forever", "burst", "demand", "variety", "arrange"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["arrange", "demand", "repeatedly", "burst", "variety"]);
    expect(String(qs[3].question)).toContain("Aida --------------- into tears when she saw her score");
    expect(String(qs[4].question)).toContain("They do a --------------- of fitness activities");
  });

  it("odd-one-out (174): SECOND occurrence in the family after r295 — keys look up / coal", () => {
    const qs = L(174).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "c"]);
    expect(qs[0].options).toEqual(["take care of", "look up", "care for", "look after"]);
    expect(qs[1].options).toEqual(["water", "wind", "coal", "sun"]);
    expect(String(qs[0].question)).toContain("کلمهٔ ناهماهنگ با بقیه گزینه‌ها");
    expect(String((bank.source.final99shd as Record<string, unknown>).receipts).length).toBeGreaterThan(0);
  });

  it("own knowledge (175): printed first letters h-/s-/p- — hearing/smart/pollute", () => {
    const qs = L(175).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["hearing", "smart", "pollute"]);
    expect(String(qs[0].question)).toContain("is hard of h ---------------");
  });

  it("grammar (176): six MCQ keys b/c/b/d/c/a — shared stems with r299 l161 are the documented parallelism of the variant", () => {
    const qs = L(176).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "c", "b", "d", "c", "a"]);
    const r299g = bank.lessons.find((l) => l.lesson === 161)!.questions;
    expect(qs.map((q) => q.question)).toEqual(r299g.map((q) => q.question)); // هم‌ساقه‌گیِ موازیِ عمدی (رسید branchVariant)
    expect(qs[0].options[1]).toBe("won`t they");
  });

  it("verb forms with printed hints (177): was found / forgets / got / been made — hints (to find)/(to forget)/(to get)/(to make) carried", () => {
    const qs = L(177).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["was found", "forgets", "got", "been made"]);
    expect(String(qs[0].question)).toContain("The robber --------------- by the police last week. (to find)");
    expect(String(qs[1].question)).toContain("doesn`t he? (to forget)");
    expect(String(qs[2].question)).toContain("If it --------------- warmer, they would travel to the north. (to get)");
    expect(String(qs[3].question)).toContain("has --------------- by doctors to cure cancer. (to make)");
    for (const q of qs) expect(String(q.placeholder)).toContain("پرانتز");
  });

  it("relative + conditional (178): which single key; printed modal list would/could/might (same novel key type as r299)", () => {
    const qs = L(178).questions;
    expect(qs[0].accepted).toEqual(["which"]);
    expect(qs[1].accepted).toEqual(["would", "could", "might"]);
    expect(String(qs[1].placeholder)).toContain("would/could/might");
  });

  it("reading Early humans (179/180): «line 2» (r299 printed «line 3» — the ONLY textual difference of shared sections) + True/True + humans + means/founding", () => {
    const r1 = L(179).questions;
    expect(String(r1[2].question)).toContain("What does “they” in line 2 refer to?");
    expect(String(r1[2].question)).not.toContain("line 3");
    expect(r1.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "a"]);
    expect(r1.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["b", "d"]);
    const cl = L(180).questions;
    expect(cl.map((q) => q.accepted?.[0])).toEqual(["means", "founding"]);
  });

  it("reading Respect (181/182): TF True/False + respect/reflects + full-sentence keys with three-variant 38", () => {
    const r2 = L(181).questions;
    expect(r2.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(r2.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["d", "a"]);
    const qa = L(182).questions;
    expect(qa[0].accepted?.[0]).toContain("you appreciate who they are and what they do");
    expect(qa[1].accepted).toHaveLength(3);
    expect(qa[1].accepted?.[1]).toContain("cleaning the kitchen");
  });

  it("NEW dictionary reading (183/184): family-fresh text — TF True/True, «truth goes with tell», You/I variants for 42, printed double «??» faithful", () => {
    const tf = L(183).questions;
    expect(tf.map((q) => TF_LETTERS[q.answer])).toEqual(["a", "a"]);
    expect(String(tf[0].question)).toContain("You can see the new word in its example sentence");
    expect(String(tf[1].question)).toContain("Definitions sometimes give you grammatical information");
    const qa = L(184).questions;
    expect(String(qa[0].question)).toContain("What does the word “truth” usually go with??");
    expect(qa[0].accepted?.[0]).toContain("usually goes with tell");
    expect(qa[1].accepted).toHaveLength(2);
    expect(qa[1].accepted?.[0]).toContain("You can easily copy them to make your own sentences seem more natural");
    expect(qa[1].accepted?.[1]).toContain("I can easily copy them to make my own sentences seem more natural");
    // نو بودنِ متن: هیچ ساقه‌ای از این بانک در بانک‌های قبلی خانواده نیست
    const earlier = bank.lessons.filter((l) => l.lesson < 183).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of qa) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("connectives (185) + compound sentence (186): same pools and keys — and/or/but/so, so he passed it.", () => {
    const qs = L(185).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["and", "or", "but", "so"]);
    const cc = L(186).questions;
    expect(cc).toHaveLength(1);
    expect(cc[0].accepted).toEqual(["so he passed it."]);
  });

  it("NEW paragraph analysis (187): first-ever Topic+Irrelevant extraction — four typed items with printed guide keys, Persian stems, guide-dropped hyphen accepted", () => {
    const qs = L(187).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(String(qs[0].question)).toContain("جملهٔ آغازین (Topic) پاراگراف A کوسه‌ها");
    expect(String(qs[1].question)).toContain("جملهٔ نامربوط (Irrelevant) پاراگراف A کوسه‌ها");
    expect(String(qs[2].question)).toContain("جملهٔ آغازین (Topic) پاراگراف B ستارگان");
    expect(String(qs[3].question)).toContain("جملهٔ نامربوط (Irrelevant) پاراگراف B ستارگان");
    expect(qs[0].accepted).toEqual(["Sharks are fast-swimming fishes.", "Sharks are fast swimming fishes."]); // راهنما بدونِ خطِّ تیره
    expect(qs[1].accepted).toEqual(["Tigers live on the ground, and in the trees."]);
    expect(qs[2].accepted).toEqual(["The stars are tiny points of light in the space."]);
    expect(qs[3].accepted).toEqual(["We live on the Earth."]);
    for (const q of qs) expect(String(q.placeholder)).toContain("بنویسید");
  });

  it("optional branches (188/189) + word order (190): definitions c/a/d/e, proverbs j/h/f/g (fghij pool), four full-sentence keys", () => {
    const defb = L(188).questions;
    expect(defb.every((q) => q.options.length === 5)).toBe(true);
    expect(defb.map((q) => PIC_LETTERS[q.answer])).toEqual(["c", "a", "d", "e"]);
    const prvb = L(189).questions;
    expect(prvb.map((q) => PRVB_LETTERS[q.answer])).toEqual(["j", "h", "f", "g"]);
    const ws = L(190).questions;
    expect(ws[1].accepted?.[0]).toBe("The girl wrote a letter, didn`t she?");
    expect(ws[2].accepted?.[0]).toBe("Everything in the garden was brown because it hadn`t rained.");
  });

  it("typed answer normalization: every accepted variant of banks 172-190 round-trips; apostrophe variants interchangeable", () => {
    for (const n of FIN99SHD) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    expect(normalizeTypedAnswer("was found")).toBe(normalizeTypedAnswer("WAS FOUND"));
    expect(normalizeTypedAnswer("The girl wrote a letter, didn't she?")).toBe(
      normalizeTypedAnswer("The girl wrote a letter, didn`t she?")
    );
  });

  it("kind purity + collision: no id overlaps with lessons <172; typed sanity (accepted head ∈ options except paragraph bank); ids all g12-fin99shd-*", () => {
    for (const n of FIN99SHD) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin99shd-"), q.id).toBe(true);
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          if (n !== 187 && n !== 186) expect(q.options, q.id).toContain(q.accepted?.[0]);
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN99SHD.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 172).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});
