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

const BLANK = "---------------";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\//g, " ")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const FIN97 = [59, 60, 61, 62, 63, 64, 65, 66, 67, 68] as const;

// کلیدهای چاپی راهنمای تصحیح ص۲۳۴-۲۳۶ — عیناً
const K_VOC: Record<number, string> = { 1: "convert", 2: "generate", 3: "effect", 4: "turbine" };
const VOC_BANK = ["generate", "renewable", "convert", "turbine", "effect"];
const K_VF: Record<number, string> = { 1: "can open", 2: "would sell", 3: "be paid", 4: "had not washed" };
const K_WO: Record<number, string> = {
  1: "My brother always carries a bag which seems very heavy.",
  2: "Mina has an exam tomorrow, so she should study well tonight.",
};
const K_CONN: Record<number, string> = { 1: "but", 2: "so", 3: "and", 4: "or" };
const ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"];
const K_ROLE: Record<number, number> = { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1, 6: 0 }; // Concluding / Supporting×۴ / Topic

describe("jozve topic grammar bank g12 — final exam دِی ۹۷ (r292 extraction receipt)", () => {
  it("bank shape: two hundred forty-seven lessons, final 97 adds 10 banks / 42 items (family 1339)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 247 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = { 59: 4, 60: 4, 61: 4, 62: 4, 63: 4, 64: 2, 65: 4, 66: 6, 67: 5, 68: 5 };
    const levels: Record<number, string> = { 60: "استاندارد", 61: "استاندارد", 63: "استاندارد", 66: "استاندارد", 67: "استاندارد", 68: "استاندارد" };
    for (const n of FIN97) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی دی ۹۷");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(59).questions.every((q) => q.id === `g12-fin97-v${q.n}`)).toBe(true);
    expect(L(66).questions.every((q) => q.id === `g12-fin97-role${q.n}`)).toBe(true);
    // آزمون نهایی دی ۹۷: ۴۲ آیتم در ۱۰ بانک — خانواده: ۶۷۸ + ۴۲ = ۷۲۰
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1339);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1339);
  });

  it("provenance: source.final97 registered with two honest absences (audio + open writing)", () => {
    const src = bank.source.final97 as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("229-233");
    expect(src.keyPages).toBe("234-236");
    expect(src.banks).toBe(10);
    expect(src.questions).toBe(42);
    expect(src.extractedRound).toBe(292);
    const audio = src.audioAbsent as Record<string, unknown>;
    expect(audio.section).toContain("listening");
    expect(String(audio.printedKey)).toContain("next week");
    expect(String(audio.printedKey)).toContain("7.water");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.note)).toContain("sport / forest / smoking / language / bad habits / art");
  });

  it("vocab bank-fill (59): printed bank of five words, renewable is the printed extra, keys faithful to p234", () => {
    const qs = L(59).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.options, q.id).toContain(K_VOC[q.n]);
      expect(q.accepted, q.id).toEqual([K_VOC[q.n]]);
      expect(q.options.every((o) => VOC_BANK.includes(o)), q.id).toBe(true);
      expect(q.options[0]).toBe(K_VOC[q.n]); // اسکفولد: کلید نخست
      expect(q.options.length).toBe(4);
    }
    const used = qs.map((q) => K_VOC[q.n]);
    expect(new Set(used).size).toBe(4);
    expect(VOC_BANK.filter((w) => !used.includes(w))).toEqual(["renewable"]); // اضافهٔ چاپی
    expect(String(qs[0].question)).toContain("......17....");
    expect(String(qs[3].question)).toContain("......20");
  });

  it("definitions (60): five printed options a..e with faithful letter keys b/a/e/c (d extra)", () => {
    const qs = L(60).questions;
    const letters = "abcde";
    expect(qs.map((q) => q.options.length)).toEqual([5, 5, 5, 5]);
    expect(qs.map((q) => letters[q.answer])).toEqual(["b", "a", "e", "c"]);
    expect(qs[0].options).toContain("in a quiet way"); // b
    expect(qs[1].options).toContain("well-known"); // a
    expect(qs[2].options).toContain("the amount of a product or service that people want"); // e
    expect(qs[3].options).toContain("to finish something"); // c
    // هیچ گزینه‌ای حرفِ چاپی در متن ندارد — گزینه‌ها عین ستون B
    expect(qs[0].question).toBe("calmly");
    expect(qs[3].question).toBe("Use up");
  });

  it("collocations (61): five printed options with keys d/c/e/a (b the train extra)", () => {
    const qs = L(61).questions;
    const letters = "abcde";
    expect(qs.map((q) => letters[q.answer])).toEqual(["d", "c", "e", "a"]);
    expect(qs[0].options).toEqual(["temperature", "the train", "a mistake", "no pains", "the needs"]);
    expect(qs[0].question).toBe("spare");
    expect(qs[1].question).toBe("make");
    expect(qs[2].question).toBe("meet");
    expect(qs[3].question).toBe("take");
  });

  it("verb forms (62): closed pool of four printed keys, typed", () => {
    const qs = L(62).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_VF[q.n]]);
      expect(q.options[0]).toBe(K_VF[q.n]);
      expect(new Set(q.options).size).toBe(4);
      expect(String(q.question)).toContain("("); // راهنمای فعل چاپی
    }
    expect(String(qs[0].question)).toContain("can't he?");
    expect(String(qs[3].question)).toContain("(not to wash)");
  });

  it("grammar MCQs (63): faithful option grids keyed c/a/d/b", () => {
    const qs = L(63).questions;
    const letters = "abcd";
    expect(qs.map((q) => letters[q.answer])).toEqual(["c", "a", "d", "b"]);
    expect(qs[0].options).toEqual(["whom", "whose", "who", "which"]);
    expect(qs[1].options).toEqual(["was posted", "posted", "was posting", "has posted"]);
    expect(qs[2].options).toEqual(["did he", "did she", "didn't he", "didn't she"]);
    expect(qs[3].options).toEqual(["off", "out", "at", "on"]);
    expect(String(qs[3].question)).toContain("What they were talking about"); // W بزرگِ چاپی — وفادار
  });

  it("word order (64): scrambles with uniform ' / ' and full printed keys; tokens ⊆ answer", () => {
    const qs = L(64).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_WO[q.n]]);
      // پوششِ واژه‌سطحِ دوسویه: هر واژهٔ بهم‌ریخته در کلید و هر واژهٔ کلید در بهم‌ریخته
      const scrambleWords = String(q.question)
        .split(/[\s/]+/)
        .map((t) => t.replace(/[^\w\s'-]/g, "").trim())
        .filter(Boolean)
        .map((t) => norm(t));
      const answerWords = norm(K_WO[q.n])
        .split(" ")
        .map((w) => w.replace(/[^\w'-]/g, ""))
        .filter(Boolean);
      for (const w of scrambleWords) {
        expect(answerWords, `${q.id} scramble word "${w}"`).toContain(w);
      }
      for (const w of answerWords) {
        expect(scrambleWords, `${q.id} answer word "${w}"`).toContain(w);
      }
    }
    expect(String(qs[0].question)).toContain("very heavy / a bag / always");
    expect(String(qs[1].question)).toContain("she Mina");
  });

  it("connectives (65): closed printed pool {and, or, but, so}, keys but/so/and/or", () => {
    const qs = L(65).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_CONN[q.n]]);
      expect([...q.options].sort()).toEqual(["and", "but", "or", "so"]);
    }
    expect(String(qs[0].question)).toContain("her grandmother hates it");
  });

  it("paragraph roles (66): six three-option MCQs keyed by p236 printed table (Topic item54, Concluding item49)", () => {
    const qs = L(66).questions;
    for (const q of qs) {
      expect(q.options, q.id).toEqual(ROLE_OPTIONS);
      expect(q.answer, q.id).toBe(K_ROLE[q.n]);
    }
    expect(qs[5].question).toContain("Horses are farm animals. They are usually black");
    expect(K_ROLE[6]).toBe(0); // Topic — کلید ص۲۳۶
    expect(K_ROLE[1]).toBe(2); // Concluding
  });

  it("reading dictionaries (67): three typed with verbatim printed keys + two True MCQs", () => {
    const qs = L(67).questions;
    expect(qs.slice(0, 3).every((q) => q.kind === "typed")).toBe(true);
    expect(qs.slice(3).every((q) => q.kind !== "typed")).toBe(true);
    expect(qs[0].accepted?.[0]).toBe("Bilingual dictionary is useful for them.");
    expect(qs[1].accepted?.[0]).toBe("It contains the English word along with their meaning in another language.");
    expect(qs[2].accepted?.[0]).toBe("One language is used in it.");
    expect(qs[3].options).toEqual(["True", "False"]);
    expect(qs[3].answer).toBe(0); // (a) True
    expect(qs[4].answer).toBe(0); // (a) True
  });

  it("reading teachers (68): typed verbatim + MCQ c/d + two False MCQs; printed quirks kept (lime, conference)", () => {
    const qs = L(68).questions;
    expect(qs[0].kind).toBe("typed");
    expect(qs[0].accepted?.[0]).toContain("They attend conference and training sessions");
    expect(qs[1].options).toEqual(["dedicated", "knowledgeable", "necessary", "productive"]);
    expect(qs[1].answer).toBe(2); // c
    expect(qs[1].question).toContain("first lime"); // غلط چاپی وفادار
    expect(qs[2].options).toEqual(["subjects", "classes", "teachers", "students' names"]);
    expect(qs[2].answer).toBe(3); // d — کلید چاپی
    expect(qs[3].options).toEqual(["True", "False"]);
    expect(qs[3].answer).toBe(1); // b False
    expect(qs[4].answer).toBe(1); // b False
  });

  it("typed engine: normalizeTypedAnswer accepts printed keys case/punctuation-insensitively", () => {
    expect(normalizeTypedAnswer("Can open")).toBe(normalizeTypedAnswer("can open"));
    expect(normalizeTypedAnswer("HAD NOT  WASHED")).toBe(normalizeTypedAnswer("had not washed"));
    expect(normalizeTypedAnswer("Mina has an exam tomorrow, so she should study well tonight")).toBe(
      normalizeTypedAnswer("Mina has an exam tomorrow, so she should study well tonight.")
    );
    expect(normalizeTypedAnswer("bilingual dictionary is useful for them.")).toBe(
      normalizeTypedAnswer("Bilingual dictionary is useful for them.")
    );
  });

  it("no stem collision: fin97 ids are fresh and unseen in lessons <59", () => {
    const earlyIds = new Set(
      bank.lessons.filter((l) => l.lesson < 59).flatMap((l) => l.questions.map((q) => q.id))
    );
    const fresh = L(59).questions.concat(...FIN97.slice(1).map((n) => L(n).questions)).map((q) => q.id);
    for (const id of fresh) expect(earlyIds.has(id), id).toBe(false);
    expect(fresh.every((id) => id.startsWith("g12-fin97-"))).toBe(true);
  });

  it("kind purity: ۶ تایپی خالص / ۴ MCQ خالص در گروه نهایی", () => {
    const typedOnly = [59, 62, 64, 65];
    const mcqOnly = [60, 61, 63, 66];
    for (const n of typedOnly) {
      expect(L(n).questions.every((q) => q.kind === "typed"), `bank ${n}`).toBe(true);
    }
    for (const n of mcqOnly) {
      expect(L(n).questions.every((q) => q.kind !== "typed"), `bank ${n}`).toBe(true);
    }
  });

  it("faithful oddities receipt: five honest oddities are locked in the shipped data", () => {
    // ۳۶: W بزرگ چاپی
    expect(String(L(63).questions[3].question)).toContain("What they were talking about");
    // ۶۱: lime به‌جای line
    expect(String(L(68).questions[1].question)).toContain("first lime");
    // ۵۴: بدنهٔ دوبندی با نقشِ Topic کلید
    expect(String(L(66).questions[5].question)).toContain("grey, white and brown");
    // ۳۷: اسلش یکدست + توکن عین چاپ
    expect(String(L(64).questions[0].question)).toContain("my brother / seems / carries");
    // ۱۹: گیومهٔ اضافه پاک شد — birds بدون کوتیشن
    expect(String(L(59).questions[2].question)).toContain("by and on birds and insects");
  });
});
