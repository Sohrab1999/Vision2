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
const FIN1401SHR = [305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324] as const;

// کلیدهای چاپیِ «راهنمای تصحیح شهریور ۱۴۰۱» ص۳۴۸-۳۴۹ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "b", 2: "a", 3: "a", 4: "b" }; // والیبال/بادبادک
const K_L2: Record<number, string> = { 1: "c", 2: "a", 3: "b", 4: "c" }; // سه‌گزینه‌ایِ گزارشگر/ورزشکار
const K_PIC: Record<number, string> = { 1: "d", 2: "e", 3: "a", 4: "c" }; // b اضافهٔ چاپی — جای دوم
const K_DEF: Record<number, string> = { 1: "b", 2: "d", 3: "c" }; // a اضافه — جای اول
const K_G: Record<number, string> = { 1: "b", 2: "c", 3: "a", 4: "d" };
const K_R1TF: Record<number, string> = { 1: "b", 2: "b", 3: "a", 4: "b" }; // خورشیدی
const K_R2TF: Record<number, string> = { 1: "a", 2: "b" }; // خواب
const K_R2M: Record<number, string> = { 3: "c", 4: "b" };
const K_R3TF: Record<number, string> = { 1: "b", 2: "a" }; // فرهنگ‌لغت
const K_R3M: Record<number, string> = { 3: "d", 4: "a" };

describe("jozve topic grammar bank g12 — official nationwide shahrivar 1401 exam (r307 extraction receipt)", () => {
  it("bank shape: three hundred twenty four lessons, shahrivar 1401 adds 20 banks / 62 items (family 1556) — ITEM record (62 > 53) tying the 20-bank record; booklet now fully extracted", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 324 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      305: 4, 306: 4, 307: 4, 308: 6, 309: 4, 310: 3, 311: 3, 312: 2,
      313: 4, 314: 3, 315: 1, 316: 1, 317: 1, 318: 4, 319: 3, 320: 4,
      321: 1, 322: 4, 323: 2, 324: 4,
    };
    for (const n of FIN1401SHR) {
      expect(L(n).count, `lesson ${n}`).toBe(counts[n]);
      expect(L(n).questions.length, `lesson ${n}`).toBe(counts[n]);
      expect(L(n).title).toContain("شهریور ۱۴۰۱");
    }
    expect(bank.lessons.filter((l) => l.lesson >= 305).reduce((a, l) => a + l.count, 0)).toBe(62);
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1556);
  });

  it("provenance: source.final1401shr — pages 343-347 / key pages 348-349 / eighth official source / sixteenth and FINAL session of the series (page 349 is the last page of the booklet)", () => {
    const src = bank.source.final1401shr as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("343-347");
    expect(src.keyPages).toBe("348-349");
    const tp = String(src.titlePrinted);
    expect(tp).toContain("شهریور");
    expect(tp).toContain("aee.medu.ir");
    expect(String(src.branchVariant)).toContain("واپسین");
    // ردیف‌های استخراج‌نشدهٔ بارمِ اصولی: Topic ۶۳-۶۵ + پاراگرافِ Water ۶۶
    const absent = src.openWritingAbsent as { items: string; reason: string };
    expect(absent.items).toContain("Iran/Books/Computer");
    expect(absent.items).toContain("Water");
    const allIds = FIN1401SHR.flatMap((n) => L(n).questions.map((q) => q.id));
    expect(allIds.length).toBe(62);
    expect(allIds.every((id) => id.startsWith("g12-fin1401shr-"))).toBe(true);
  });

  it("S1 father/son volleyball T/F: printed keys b/a/a/b — fresh stems (kites/photographs), distinct from r304 father/son three-option set", () => {
    const qs = L(305).questions;
    qs.forEach((q, i) => {
      expect(q.options).toEqual(["True", "False"]);
      expect(q.answer, q.id).toBe(TF_LETTERS.indexOf(K_L1[i + 1]));
    });
    expect(qs[0].question).toContain("volleyball and had a sandwich");
    expect(qs[2].question).toContain("flew their kites");
    // هیچ ساقه‌ای از خانوادهٔ پیشین نیست — بازیِ تازهٔ همان بازیگرِ پدر/پسرِ r304
    const stems = qs.map((q) => q.question);
    const priorStems = new Set(
      bank.lessons.filter((l) => l.lesson < 305).flatMap((l) => l.questions.map((q) => q.question))
    );
    for (const s of stems) expect(priorStems.has(s), s).toBe(false);
  });

  it("S2 reporter/athlete three-option: printed keys c/a/b/c — SIXTH three-option listening bank of the family", () => {
    const qs = L(306).questions;
    qs.forEach((q, i) => {
      expect(q.options.length, q.id).toBe(3);
      expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_L2[i + 1]));
    });
    expect(qs[0].options[2]).toBe("badminton");
    expect(qs[1].options[0]).toBe("popular");
    expect(qs[2].options[1]).toBe("weekend");
    expect(qs[3].options[2]).toBe("offline and online");
    // شمارشِ ساختاریِ بانک‌های شنیداریِ تمام‌سه‌گزینه‌ای — این ششمین است (l210/l229/l249/l250/l286)
    const priorThreeOpt = bank.lessons
      .filter(
        (l) =>
          l.lesson < 305 &&
          l.title.includes("شنیداری") &&
          l.questions.length > 0 &&
          l.questions.every((q) => (q.kind ?? "mcq") === "mcq" && q.options.length === 3)
      )
      .map((l) => l.lesson);
    expect(priorThreeOpt).toEqual([210, 229, 249, 250, 286]);
    expect(L(306).title).toContain("سه‌گزینه‌ای");
  });

  it("S3 Majid/Iranmehr dictionary dialogue fills: recommend/monolingual/elementary/pocket — monolingual SECOND typed key (l94 letter-hint twin) with a fresh stem", () => {
    const qs = L(307).questions;
    const keys = ["recommend", "monolingual", "elementary", "pocket"];
    qs.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted).toEqual([keys[i]]);
      expect(q.question, q.id).toContain("Mr. Iranmehr:");
    });
    expect(qs[1].question).toContain("more suitable for you");
    // monolingual دومین کلیدِ تایپیِ خانواده — l94 (خرداد ۹۸) با شکافِ حرفیِ m——— بود؛ ساقه‌ها باید متفاوت بمانند
    const priorMono = bank.lessons
      .filter((l) => l.lesson < 305)
      .flatMap((l) => l.questions)
      .filter((q) => (q.accepted ?? []).some((a) => a.toLowerCase().includes("monolingual")));
    expect(priorMono.map((q) => q.id)).toEqual(["g12-fin98d-vocpic2"]);
    expect(priorMono[0].question).toContain("m—");
    expect(priorMono[0].question).not.toBe(qs[1].question);
    const l67typed = bank.lessons.find((l) => l.lesson === 67)!.questions.find((q) => q.question.includes("monolingual"))!;
    expect(l67typed.accepted?.[0]).toContain("One language");
  });

  it("S4 dark street listening fill: FIRST-PERSON retelling of r306 Mike/John reading — six numbered printed gaps with keys late/office/quiet/walking/wondered/suddenly", () => {
    const qs = L(308).questions;
    expect(qs.length).toBe(6);
    const keys = ["late", "office", "quiet", "walking", "wondered", "suddenly"];
    qs.forEach((q, i) => {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted).toEqual([keys[i]]);
      expect(q.question, q.id).toContain(`(${13 + i})`);
    });
    expect(qs[0].question).toContain("at around 9 p.m.");
    // موازیِ مستند با r306: هر ساقهٔ اول‌شخص باید همتایِ سوم‌شخصِ r306 را در خانواده داشته باشد و از آن متفاوت باشد
    const r306Mike = [298, 299].flatMap((n) => L(n).questions.map((q) => q.question));
    const paralles = ["such a dark and quiet street before", "came out of the car", "in the office"];
    for (const p of paralles) {
      expect(r306Mike.some((s) => s.includes(p)), `r306 parallel for ${p}`).toBe(true);
    }
    const priorStems = new Set(
      bank.lessons.filter((l) => l.lesson < 305).flatMap((l) => l.questions.map((q) => q.question))
    );
    for (const q of qs) expect(priorStems.has(q.question), q.id).toBe(false);
  });

  it("S5 picture vocab: extra (b) in SECOND position FOURTH time (r302/r304/r306) — keys d/e/a/c; Wind towers Yazd sentence is topic-kin of l96/l143/r306 but string-fresh", () => {
    const qs = L(309).questions;
    expect(qs.length).toBe(4);
    for (const q of qs) {
      expect(q.options.length).toBe(5);
      q.options.forEach((_, i) => {
        const letter = PIC_LETTERS[i];
        if (letter === K_PIC[qs.indexOf(q) + 1]) expect(q.answer, `${q.id}:${letter}`).toBe(i);
      });
    }
    expect(qs.map((q) => q.answer)).toEqual([3, 4, 0, 2]);
    const extra = q_optionsWithoutAnswers(qs);
    expect(extra).toEqual(["Absence makes the heart grow fonder."]);
    // خویشاوندِ موضوعی: جملهٔ تصویریِ Wind towers در r306 و دو نسخهٔ قدیمیِ l96/l143 — هر سه متفاوت از این جمله
    const wt = "Wind towers in Yazd’s buildings can lower the cooling cost.";
    const priorWT = bank.lessons
      .filter((l) => l.lesson < 305)
      .flatMap((l) => l.questions)
      .filter((q) => q.question.includes("Wind towers") || (q.options ?? []).some((o: string) => o.includes("Wind towers")));
    expect(priorWT.length).toBeGreaterThanOrEqual(2);
    for (const q of priorWT) {
      expect(q.question !== wt, "r307 wind-towers sentence must stay string-fresh").toBe(true);
      for (const o of q.options ?? []) expect(o !== wt, o).toBe(true);
    }
  });

  it("S6 word pool (identify/shouted/diary/turbine): extra diary in THIRD position — keys turbine/identify/shouted; identify & shouted keys fresh in family", () => {
    const qs = L(310).questions;
    expect(qs[0].options).toEqual(["identify", "shouted", "diary", "turbine"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["turbine", "identify", "shouted"]);
    expect(qs[0].question).toContain("generate a lot of electricity");
    expect(qs[2].question).toContain("at me angrily");
    const all = bank.lessons.flatMap((l) => l.questions);
    expect(all.filter((q) => (q.accepted ?? []).includes("identify")).length).toBe(1);
    expect(all.filter((q) => (q.accepted ?? []).includes("shouted")).length).toBe(1);
  });

  it("S7 definitions: extra (a) in FIRST position (new slot for the definition bank) — keys b/d/c", () => {
    const qs = L(311).questions;
    expect(qs.map((q) => q.answer)).toEqual([1, 3, 2]);
    expect(qs[0].options[0]).toBe("to change in a form");
    expect(qs[0].question).toContain("really appreciate");
    expect(qs[1].question).toContain("give up trying after a failure");
    expect(qs[2].question).toContain("Pizza contains");
    const extra = q_optionsWithoutAnswers(qs);
    expect(extra).toEqual(["to change in a form"]);
  });

  it("S8 letter gaps: burst — FIRST time the gap is on the verb itself (l87 gap was on into) + flock — FIRST letter-gap form of the l136 full proverb", () => {
    const [q29, q30] = L(312).questions;
    expect(q29.kind).toBe("typed");
    expect(q29.accepted).toEqual(["burst"]);
    expect(q29.question).toContain("he b --------------- into tears");
    const l87 = bank.lessons.find((l) => l.lesson === 87)!.questions.find((q) => q.question.includes("burst"))!;
    expect(l87.question).toContain("Aida burst --------------- tears");
    expect(l87.question).not.toBe(q29.question);
    expect((l87.accepted ?? []).includes("burst")).toBe(false); // شکافِ l87 روی into بود نه burst
    expect(q30.accepted).toEqual(["flock"]);
    expect(q30.question).toContain("Birds of a feather, f --------------- together");
    const l136 = bank.lessons.find((l) => l.lesson === 136)!.questions.find((q) => q.question.includes("Birds of a feather"))!;
    expect(l136.question).toBe("Birds of a feather flock together");
    expect(l136.question).not.toBe(q30.question);
  });

  it("S9 grammar: printed keys b/c/a/d — whom, is spoken, never→positive tag does she, hadn't played", () => {
    const qs = L(313).questions;
    qs.forEach((q, i) => {
      expect(q.options.length, q.id).toBe(4);
      expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_G[i + 1]));
    });
    expect(qs[0].options[1]).toBe("whom");
    expect(qs[1].options[2]).toBe("is spoken");
    expect(qs[2].question).toContain("never behaves politely");
    expect(qs[2].options[0]).toBe("does she");
    expect(qs[3].question).toContain("chess before, so I showed her");
    expect(qs[3].options[3]).toBe("hadn’t played");
  });

  it("S10 verb forms: THREE typed items — be kept (modal passive, fresh) / had studied (first typed; l87 MCQ) / would tell (fresh)", () => {
    const qs = L(314).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["be kept", "had studied", "would tell"]);
    expect(qs[0].question).toContain("(to keep)");
    expect(qs[1].question).toContain("(to study)");
    expect(qs[2].question).toContain("(to tell)");
    // l87 — had studied فقط در ساقهٔ MCQ بود، نه کلیدِ تایپی
    const l87 = bank.lessons.find((l) => l.lesson === 87)!.questions.find((q) => q.question.includes("she had studied well"))!;
    expect(l87.kind).not.toBe("typed");
    const all = bank.lessons.flatMap((l) => l.questions);
    expect(all.filter((q) => (q.accepted ?? []).includes("would tell")).length).toBe(1);
    expect(all.filter((q) => (q.accepted ?? []).includes("be kept")).length).toBe(1);
  });

  it("S11 word ordering: TWO printed variants joined by یا — both accepted", () => {
    const q = L(315).questions[0];
    expect(q.accepted).toEqual([
      "When the teacher came to the class, the students had done their homework.",
      "The students had done their homework when the teacher came to the class.",
    ]);
    expect(q.question).toContain("had done / the students");
  });

  it("S12 conditional: three-part printed key I/would/travel to the future with (0.25)(0.25)(0.5) marks — time machine stem fresh", () => {
    const q = L(316).questions[0];
    expect(q.accepted).toEqual(["I would travel to the future."]);
    expect(q.question).toContain("time machine");
    expect(q.question).toContain("(travel to the future)");
    const all = bank.lessons.flatMap((l) => l.questions);
    expect(all.filter((x) => x.question.includes("time machine")).length).toBe(1);
  });

  it("S13 relative pronoun: 'A Forest is a place' with faithful capital F — which accepted; kin of l296 A-doctor and garage/factory/cinema but stem fresh", () => {
    const q = L(317).questions[0];
    expect(q.kind).toBe("typed");
    expect(q.accepted).toEqual(["which"]);
    expect(q.question).toContain("A Forest is a place");
    const doctor = L(296).questions[0];
    expect(doctor.question).toContain("A doctor is a person");
    expect(doctor.question).not.toBe(q.question);
    const all = bank.lessons.flatMap((l) => l.questions);
    expect(all.filter((x) => x.question.includes("A Forest is a place")).length).toBe(1);
  });

  it("S14 solar reading T/F: printed keys b/b/a/b — the r306 principle-only Solar energy paragraph is now a FULLY PLAYABLE reading (promotion receipt)", () => {
    const qs = L(318).questions;
    qs.forEach((q, i) => {
      expect(q.options).toEqual(["True", "False"]);
      expect(q.answer, q.id).toBe(TF_LETTERS.indexOf(K_R1TF[i + 1]));
    });
    // ارتقا: r306 — پاراگرافِ Solar energy فقط در openWritingAbsent بود؛ این‌جا ۷ آیتمِ قابلِ بازی
    const r306absent = (bank.source.final1401khh as Record<string, unknown>).openWritingAbsent as { items: string };
    expect(r306absent.items).toContain("Solar energy");
    expect(L(319).questions.length).toBe(3);
    expect([318, 319].reduce((a, n) => a + L(n).questions.length, 0)).toBe(7);
  });

  it("S14 continued — solar fills + full-sentence question 47 with two (0/5) marks; every stem fresh in family", () => {
    const qs = L(319).questions;
    expect(qs[0].accepted).toEqual(["solar energy"]);
    expect(qs[1].accepted).toEqual(["panels"]);
    expect(qs[2].accepted).toEqual(["Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels."]);
    expect(qs[2].question).toContain("What do solar technologies deliver to us?");
    const priorStems = new Set(
      bank.lessons.filter((l) => l.lesson < 305).flatMap((l) => l.questions.map((q) => q.question))
    );
    for (const q of qs) expect(priorStems.has(q.question), q.id).toBe(false);
  });

  it("S15 sleep reading: T/F a/b + MCQ c/b — fresh passage (121 days a year / baby 16 hours / after 50 → 6.5)", () => {
    const qs = L(320).questions;
    qs.slice(0, 2).forEach((q, i) => {
      expect(q.options).toEqual(["True", "False"]);
      expect(q.answer, q.id).toBe(TF_LETTERS.indexOf(K_R2TF[i + 1]));
    });
    qs.slice(2).forEach((q, i) => {
      expect(q.options.length, q.id).toBe(4);
      expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_R2M[i + 3]));
    });
    expect(qs[2].options[2]).toBe("6.5");
    expect(qs[3].options[1]).toBe("lives less");
    const priorStems = new Set(
      bank.lessons.filter((l) => l.lesson < 305).flatMap((l) => l.questions.map((q) => q.question))
    );
    for (const q of qs) expect(priorStems.has(q.question), q.id).toBe(false);
  });

  it("S15 continued — sleep open question 52: SLASH-DUAL printed key 'We / You spend' — THIRD slash-dual of the family, this time in the SUBJECT", () => {
    const q = L(321).questions[0];
    expect(q.kind).toBe("typed");
    expect(q.accepted).toEqual([
      "We spend about one-third (1/3) of our lives in sleep.",
      "You spend about one-third (1/3) of our lives in sleep.",
    ]);
    // الگوی r304/r306 — اسلش در فعل/اسم بود، این‌جا در فاعل
    const r304vf = L(257).questions.find((x) => x.kind === "typed");
    expect(r304vf?.accepted).toContain("had gotten");
    const r306cx = L(303).questions[0];
    expect(r306cx.accepted).toContain("but these shoes are big");
  });

  it("S16 dictionary reading T/F + MCQ: THIRD dictionary-themed passage but a NEW text (compilation/prefixes/bilingual) — refer-to third occurrence with fresh pronoun it", () => {
    const qs = L(322).questions;
    qs.slice(0, 2).forEach((q, i) => {
      expect(q.options).toEqual(["True", "False"]);
      expect(q.answer, q.id).toBe(TF_LETTERS.indexOf(K_R3TF[i + 1]));
    });
    qs.slice(2).forEach((q, i) => {
      expect(q.options.length, q.id).toBe(4);
      expect(q.answer, q.id).toBe(G_LETTERS.indexOf(K_R3M[i + 3]));
    });
    expect(qs[0].question).toContain("After looking the word up");
    expect(qs[2].options[3]).toBe("to improve reading understanding");
    expect(qs[3].question).toContain("in paragraph one refer to");
    expect(qs[3].options[0]).toBe("word");
    // refer-to — وقوعِ سوم (r302-r1m2، r306-l301) با ضمیرِ متفاوت
    const r302m2 = L(221).questions.find((q) => q.id === "g12-fin1400khr-r1m2")!;
    const r306ref = L(301).questions[0];
    expect(r302m2.question).toContain("refer to");
    expect(r306ref.question).toContain("refer to");
    expect(r302m2.question).not.toBe(qs[3].question);
    expect(r306ref.question).not.toBe(qs[3].question);
    // متنِ تازه: هیچ ساقه‌ای از خانوادهٔ پیشین نیست
    const priorStems = new Set(
      bank.lessons.filter((l) => l.lesson < 305).flatMap((l) => l.questions.map((q) => q.question))
    );
    for (const q of qs) expect(priorStems.has(q.question), q.id).toBe(false);
  });

  it("S16 continued — dictionary fills: key 58 reconstructed from RTL fragments (second occurrence of the r305-47 pattern)", () => {
    const qs = L(323).questions;
    expect(qs[0].accepted).toEqual(["the meaning of the word."]);
    expect(qs[1].accepted).toEqual(["we are still confused or think we are missing important information"]);
    expect(qs[1].question).toContain("we use a dictionary when");
    // RTL-reconstruction دومین وقوع — r305-47 فهرستِ چهARMثالی (l282)
    const r305list = L(282)!.questions.find((q) => (q.accepted ?? []).some((a) => a.includes("televisions")));
    expect(r305list).toBeTruthy();
  });

  it("S17 connectives: FOUR items (r305/r306 had two) with pool (and, or, but, so) — keys so/or/and/but; all stems fresh", () => {
    const qs = L(324).questions;
    expect(qs.length).toBe(4);
    expect(qs[0].options).toEqual(["and", "or", "but", "so"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["so", "or", "and", "but"]);
    expect(qs[0].question).toContain("You lost the game!");
    expect(qs[2].question).toContain("whiteboard");
    expect(qs[3].question).toContain("rich man");
    const priorStems = new Set(
      bank.lessons.filter((l) => l.lesson < 305).flatMap((l) => l.questions.map((q) => q.question))
    );
    for (const q of qs) expect(priorStems.has(q.question), q.id).toBe(false);
    // rich-man خویشاوندِ l3 — ساقه‌های متفاوت
    const l3 = bank.lessons.find((l) => l.lesson === 3)!.questions.find((q) => q.question.includes("rich man"))!;
    expect(l3.question).toContain("your uncle");
    expect(l3.question).not.toBe(qs[3].question);
  });

  it("typed answer normalization: every accepted variant of banks 305-324 round-trips; slash-dual and RTL keys survive", () => {
    for (const n of FIN1401SHR) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    expect(normalizeTypedAnswer("We spend about one-third (1/3) of our lives in sleep.")).toContain("one-third");
    expect(normalizeTypedAnswer("The students had done their homework when the teacher came to the class.")).toContain("homework");
  });

  it("kind purity + collision: no id overlaps with lessons <305; typed sanity (accepted head ∈ options); ids all g12-fin1401shr-*", () => {
    for (const n of FIN1401SHR) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin1401shr-"), q.id).toBe(true);
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
    const newIds = new Set(FIN1401SHR.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 305).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});

/** گزینه‌های اضافهٔ چاپی: همهٔ گزینه‌هایی که در هیچ سؤالِ بانک پاسخ نیستند */
function q_optionsWithoutAnswers(qs: TQuestion[]): string[] {
  const answered = new Set(qs.map((q) => q.options[q.answer]));
  return qs[0].options.filter((o) => !answered.has(o));
}
