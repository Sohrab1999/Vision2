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
const FIN1401KHH = [285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304] as const;

// کلیدهای چاپیِ «راهنمای تصحیح خرداد ۱۴۰۱» ص۳۴۱-۳۴۲ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "b", 2: "a", 3: "b" }; // False/True/False
const K_L2: Record<number, string> = { 1: "c", 2: "c", 3: "b", 4: "a" }; // سه‌گزینه‌ای
const K_PIC: Record<number, string> = { 1: "c", 2: "e", 3: "d", 4: "a" }; // b اضافهٔ چاپی — جای دوم
const K_DEF: Record<number, string> = { 1: "c", 2: "d", 3: "a" }; // b اضافه — جای دوم
const K_G: Record<number, string> = { 1: "d", 2: "b", 3: "a", 4: "c" };
const K_R1TF: Record<number, string> = { 1: "a" }; // True
const K_R1M: Record<number, string> = { 3: "c", 4: "b", 5: "d" };
const K_R2M: Record<number, string> = { 1: "d", 2: "a" };
const K_R3TF: Record<number, string> = { 1: "a", 2: "b" }; // True / False

describe("jozve topic grammar bank g12 — official nationwide khordad 1401 exam (r306 extraction receipt)", () => {
  it("bank shape: three hundred twenty six lessons, khordad 1401 adds 20 banks / 53 items (family 1587) — first 20-row exam of the family (bank record)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 326 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      285: 3, 286: 4, 287: 3, 288: 6, 289: 4, 290: 3, 291: 3, 292: 1,
      293: 4, 294: 1, 295: 2, 296: 1, 297: 5, 298: 2, 299: 2, 300: 2,
      301: 3, 302: 2, 303: 1, 304: 1,
    };
    for (const n of FIN1401KHH) {
      expect(L(n).count, `lesson ${n}`).toBe(counts[n]);
      expect(L(n).questions.length, `lesson ${n}`).toBe(counts[n]);
      expect(L(n).title).toContain("خرداد ۱۴۰۱");
    }
    expect(bank.lessons.filter((l) => l.lesson >= 285 && l.lesson <= 304).reduce((a, l) => a + l.count, 0)).toBe(53);
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1587);
  });

  it("provenance: source.final1401khh — pages 336-340 / key pages 341-342 / seventh official source / fifteenth session / MP3 audio header variant", () => {
    const src = bank.source.final1401khh as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("336-340");
    expect(src.keyPages).toBe("341-342");
    const tp = String(src.titlePrinted);
    expect(tp).toContain("خرداد");
    expect(tp).toContain("aee.medu.ir");
    expect(String(src.branchVariant)).toContain("۲۰بانکی");
    expect(String(src.branchVariant)).toContain("MP3");
    // ردیف‌های استخراج‌نشدهٔ بارمِ اصولی: Topic ۵۴/۵۵ + پاراگرافِ ۵۶
    const absent = src.openWritingAbsent as { items: string; reason: string };
    expect(absent.items).toContain("Pollution");
    expect(absent.items).toContain("Firefighters");
    expect(absent.items).toContain("Solar energy");
    // هیچ کدام از ۵۳ آیتم برای Topic/پاراگراف نیست — کل آیتم‌ها رسمی و شماره‌دار
    const allIds = FIN1401KHH.flatMap((n) => L(n).questions.map((q) => q.id));
    expect(allIds.length).toBe(53);
    expect(allIds.every((id) => id.startsWith("g12-fin1401khh-"))).toBe(true);
  });

  it("S1 listening Shila/Samira T/F: printed keys b/a/b — twin of r305 dialogue but every stem differs (Wednesday not Friday, Holy Defense, midnight)", () => {
    const qs = L(285).questions;
    qs.forEach((q, i) => {
      expect(q.options).toEqual(["True", "False"]);
      expect(q.answer, q.id).toBe(TF_LETTERS.indexOf(K_L1[i + 1]));
    });
    const stems = qs.map((q) => q.question);
    expect(stems[0]).toContain("Wednesday");
    expect(stems[0]).not.toContain("Friday");
    expect(stems[1]).toContain("Holy Defense");
    expect(stems[2]).toContain("midnight");
    // موازیِ r305 — هیچ ساقه‌ای مشترک نیست
    const r305Stems = bank.lessons.find((l) => l.lesson === 267)!.questions.map((q) => q.question);
    for (const s of stems) for (const t of r305Stems) expect(s === t, `${s} ~ ${t}`).toBe(false);
  });

  it("S2 Mehran/Bijan three-option: printed keys c/c/b/a — third family occurrence of the dialogue names with a distinct question set", () => {
    const qs = L(286).questions;
    qs.forEach((q, i) => {
      expect(q.options.length, q.id).toBe(3);
      expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_L2[i + 1]));
    });
    expect(qs[0].options[2]).toBe("a mobile phone");
    expect(qs[1].options[2]).toContain("Mehran’s friend");
    expect(qs[2].options[1]).toBe("it was a secret");
    expect(qs[3].options[0]).toContain("A friend in need is a friend indeed");
    // وقوعِ سومِ دیالوگ: دی۹۸ (l69) و شهریور ۱۴۰۰ (l250) — با سؤال‌های متفاوت
    const prior = [69, 250].flatMap((n) =>
      bank.lessons.find((l) => l.lesson === n)!.questions.map((q) => q.question)
    );
    for (const q of qs) for (const p of prior) expect(q.question === p, q.id).toBe(false);
  });

  it("S3 Maryam/Sara fills: parenthetical optional key 8 (good) dictionary + dual keys 9 online,smart / 10 word,search — parenthetical prints both variants", () => {
    const q8 = L(287).questions[0];
    expect(q8.kind).toBe("typed");
    expect(q8.accepted).toEqual(["dictionary", "good dictionary"]);
    const q9 = L(287).questions[1];
    expect(q9.accepted).toEqual(["online, smart"]);
    expect(q9.question).toContain("PCs and --------------- phones");
    const q10 = L(287).questions[2];
    expect(q10.accepted).toEqual(["word, search"]);
    expect(q10.question).toContain("type the term into the --------------- box");
  });

  it("S4 elders fill: six numbered printed gaps ……(11)……..……(16)…… parenthesized style (r304 pattern) — keys forgive/knowledge/faced/respecting/feel/appreciate", () => {
    const qs = L(288).questions;
    expect(qs.length).toBe(6);
    const keys = ["forgive", "knowledge", "faced", "respecting", "feel", "appreciate"];
    qs.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted).toEqual([keys[i]]);
      expect(q.question, q.id).toContain(`(${11 + i})`);
    });
    expect(qs[0].question).toContain("how to love, how to care");
    expect(qs[5].question).toContain("gone through");
  });

  it("S5 picture vocab: five printed sentences, extra (b) in SECOND position (r302/r304 pattern) — keys c/e/d/a; Wind towers option repeats from family", () => {
    const qs = L(289).questions;
    expect(qs.length).toBe(4);
    for (const q of qs) {
      expect(q.options.length).toBe(5);
      q.options.forEach((_, i) => {
        const letter = PIC_LETTERS[i];
        if (letter === K_PIC[qs.indexOf(q) + 1]) expect(q.answer, `${q.id}:${letter}`).toBe(i);
      });
    }
    expect(qs.map((q) => q.answer)).toEqual([2, 4, 3, 0]);
    const extra = q_optionsWithoutAnswers(qs);
    expect(extra).toEqual(["Some scientists are working on producing electricity from plants."]);
    expect(qs[0].options).toContain("Wind towers are natural air cooling systems.");
  });

  it("S6 word pool: communicative/replaced/suppose/effectively with extra suppose THIRD position — keys effectively/communicative/replaced; kept-to-himself twin of dey-98", () => {
    const qs = L(290).questions;
    expect(qs[0].options).toEqual(["communicative", "replaced", "suppose", "effectively"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["effectively", "communicative", "replaced"]);
    expect(qs[1].question).toContain("kept to himself");
    // خویشاوندِ دی۹۸ (l75) — ساقه متفاوت (The old man …)
    const r98 = bank.lessons.find((l) => l.lesson === 75)!.questions.find((q) => q.id === "g12-fin98-g3")!;
    expect(r98.question).toContain("kept to himself");
    expect(r98.question).not.toBe(qs[1].question);
  });

  it("S7 definitions: four B-definitions, extra (b) in SECOND position (r305 pattern) — keys c/d/a; tides stem EQUAL to r303-26 (cross-round reuse receipt)", () => {
    const qs = L(291).questions;
    expect(qs.map((q) => q.answer)).toEqual([2, 3, 0]);
    expect(qs[0].options[1]).toBe("take something in, especially gradually");
    // گاردِ برابریِ بین‌راندی — عینِ r303-26
    const r303 = bank.lessons.find((l) => l.lesson === 234)!.questions.find((q) => q.id === "g12-fin1400khh-def2")!;
    expect(r303.question).toBe(qs[2].question);
    expect(r303.question).toContain("two high and two low tides");
  });

  it("S8 proverb: SECOND double letter-gap of the family (e----/w---) — dual key early, worm; instruction stem differs from r301 single-gap twin", () => {
    const q = L(292).questions[0];
    expect(q.kind).toBe("typed");
    expect(q.accepted).toEqual(["early, worm"]);
    expect(q.question).toContain("the e --------------- bird catches the w ---------------");
    // خویشاوندِ r301-27 — کلیدِ تک‌واژه‌ای worm با ساقهٔ متفاوت
    const r301 = bank.lessons.find((l) => l.lesson === 199)!.questions.find((q) => q.id === "g12-fin99dey-ok2")!;
    expect(r301.accepted).toEqual(["worm"]);
    expect(r301.question).not.toBe(q.question);
    // و r305-27 ضرب‌المثلِ دولایهٔ نخست (sight/mind) — ساقه و کلید متفاوت
    const r305 = bank.lessons.find((l) => l.lesson === 273)!.questions[0];
    expect(r305.accepted).toEqual(["sight, mind", "sight , mind"]);
  });

  it("S9 grammar: printed keys d/b/a/c — tag question on 'he is not well', relative whom, passive has been translated, modal passive should be done", () => {
    const qs = L(293).questions;
    qs.forEach((q, i) => {
      expect(q.options.length, q.id).toBe(4);
      expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_G[i + 1]));
    });
    expect(qs[0].question).toContain("he is not well");
    expect(qs[0].options[3]).toBe("is he");
    expect(qs[1].options[1]).toBe("whom");
    expect(qs[2].options[0]).toBe("has been translated");
    expect(qs[3].options[2]).toBe("should be done");
  });

  it("S10 verb form: printed two-part key had + fallen with (0/5) marks — single variant, no slash (contrast with r304 had got/gotten)", () => {
    const q = L(294).questions[0];
    expect(q.kind).toBe("typed");
    expect(q.accepted).toEqual(["had fallen"]);
    expect(q.question).toContain("(fall)");
    // r304 دومواریانتهٔ چاپی بود (اسلش در چاپ؛ accepted دو واریانت جدا)
    const r304 = bank.lessons.find((l) => l.lesson === 257);
    const r304vf = r304?.questions.find((x) => x.kind === "typed");
    if (r304vf) {
      expect(r304vf.accepted).toEqual(["had gotten", "had got"]);
    }
  });

  it("S11 word ordering: RTL fragments reconstructed into two full-sentence keys", () => {
    const [ws1, ws2] = L(295).questions;
    expect(ws1.accepted).toEqual(["They were excited because their son had passed the driving test."]);
    expect(ws1.question).toContain("the driving test");
    expect(ws2.accepted).toEqual(["What would you do if it weren’t raining?"]);
    expect(ws2.question).toContain("weren’t raining");
  });

  it("S12 relative pronoun: key guide allows who OR whom — both accepted (m-mark principle)", () => {
    const q = L(296).questions[0];
    expect(q.kind).toBe("typed");
    expect(q.accepted).toEqual(["who", "whom"]);
    expect(q.question).toContain("A doctor is a person");
  });

  it("S13 hydropower reading: fresh family text — True + parenthetical dual (running) water, electricity + keys c/b/d; no prior reading stems (only r303 single T/F item about hydropower)", () => {
    const qs = L(297).questions;
    expect(qs[0].options).toEqual(["True", "False"]);
    expect(qs[0].answer).toBe(TF_LETTERS.indexOf(K_R1TF[1]));
    const q37 = qs[1];
    expect(q37.accepted).toEqual(["running water, electricity", "water, electricity"]);
    qs.slice(2).forEach((q, i) => {
      expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_R1M[i + 3]));
    });
    expect(qs[4].options[3]).toBe("Hydropower");
    // متنِ تازه — هیچ ساقه‌ای از خانوادهٔ پیشین نیست
    const stems = qs.map((q) => q.question);
    const priorStems = new Set(
      bank.lessons.filter((l) => l.lesson < 285).flatMap((l) => l.questions.map((q) => q.question))
    );
    for (const s of stems) expect(priorStems.has(s), s).toBe(false);
  });

  it("S14/S15 Mike & John reading: MCQ keys d/a + open Q&A with printed full-sentence keys and parenthetical-optional 44", () => {
    const m = L(298).questions;
    m.forEach((q, i) => expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_R2M[i + 1])));
    expect(m[0].options[3]).toBe("experienced");
    expect(m[1].options[0]).toBe("waved");
    const qa = L(299).questions;
    expect(qa[0].accepted).toEqual([
      "He asked him if he could drive him home.",
      "He asked Mike if he could drive him home.",
    ]);
    expect(qa[1].accepted).toEqual([
      "John was upset because he had lost his documents.",
      "because he had lost his documents",
    ]);
  });

  it("S16 dictionary reading T/F: r302 text returns with TWO reworded stems — French not Latin (False), Since… not Words are… (True)", () => {
    const qs = L(300).questions;
    qs.forEach((q, i) => expect(q.answer, q.id).toBe(TF_LETTERS.indexOf(K_R3TF[i + 1])));
    expect(qs[0].question).toContain("Since dictionaries put words in alphabetical order");
    expect(qs[1].question).toContain("French");
    // ساقه‌های r302 باید متفاوت بمانند — گاردِ برابریِ وارونه
    const r302tf1 = bank.lessons.find((l) => l.lesson === 221)!.questions.find((q) => q.id === "g12-fin1400khr-r1tf1")!;
    const r302tf2 = bank.lessons.find((l) => l.lesson === 221)!.questions.find((q) => q.id === "g12-fin1400khr-r1tf2")!;
    expect(r302tf1.question).toContain("Words are easily found");
    expect(r302tf2.question).toContain("Latin");
    expect(r302tf2.question).not.toBe(qs[1].question);
    expect(r302tf1.question).not.toBe(qs[0].question);
  });

  it("S17 dictionary Q&A: stem 47 EQUAL to r302 r1m2 (second family occurrence; MCQ there, open here) — RTL-reconstructed keys 48/49", () => {
    const qs = L(301).questions;
    const r302m2 = bank.lessons.find((l) => l.lesson === 221)!.questions.find((q) => q.id === "g12-fin1400khr-r1m2")!;
    expect(r302m2.question).toBe(qs[0].question);
    expect(qs[0].accepted).toEqual(["It refers to words.", "words"]);
    expect(qs[1].accepted).toEqual(["A dictionary which explains the meanings of technical words."]);
    expect(qs[2].accepted).toEqual(["International Phonetic Alphabet", "the International Phonetic Alphabet"]);
    expect(qs[2].question).toContain("IPA stands for");
  });

  it("S18/S19/S20: connectives so/but + slash-dual compound 52 (four accepted variants) + FIRST Not-Supporting typed bank from ants text", () => {
    const [c1, c2] = L(302).questions;
    expect(c1.accepted).toEqual(["so"]);
    expect(c2.accepted).toEqual(["but"]);
    expect(c1.options).toEqual(["but", "and", "so", "or"]);
    const cx = L(303).questions[0];
    expect(cx.accepted).toEqual([
      "These shoes are small, but these shoes are big.",
      "These shoes are small, but those shoes are big.",
      "but these shoes are big",
      "but those shoes are big",
    ]);
    const ns = L(304).questions[0];
    expect(ns.accepted).toEqual(["Yesterday, my sister saw an ant."]);
    expect(ns.question).toContain("Not Supporting");
    // کلیدِ نامرتبط نباید در accepted پاراگرافِ شش‌جمله‌ایِ r303 باشد
    const r303ords = bank.lessons.find((l) => l.lesson === 247)!.questions.flatMap((q) => q.accepted ?? []);
    expect(r303ords).not.toContain("Yesterday, my sister saw an ant.");
  });

  it("typed answer normalization: every accepted variant of banks 285-304 round-trips; comma keys keep printed spacing", () => {
    for (const n of FIN1401KHH) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    expect(normalizeTypedAnswer("early, worm")).toBe("early, worm");
    expect(normalizeTypedAnswer("Running Water, electricity")).toBe(normalizeTypedAnswer("running water, electricity"));
    expect(normalizeTypedAnswer("These shoes are small, but those shoes are big.")).toContain("those shoes");
  });

  it("kind purity + collision: no id overlaps with lessons <285; typed sanity (accepted head ∈ options); ids all g12-fin1401khh-*", () => {
    for (const n of FIN1401KHH) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin1401khh-"), q.id).toBe(true);
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
    const newIds = new Set(FIN1401KHH.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 285).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});

/** گزینه‌های اضافهٔ چاپی: همهٔ گزینه‌هایی که در هیچ سؤالِ بانک پاسخ نیستند */
function q_optionsWithoutAnswers(qs: TQuestion[]): string[] {
  const answered = new Set(qs.map((q) => q.options[q.answer]));
  return qs[0].options.filter((o) => !answered.has(o));
}
