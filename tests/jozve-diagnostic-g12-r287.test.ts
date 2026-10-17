import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

type TQuestion = {
  id: string;
  n: number;
  category: string;
  kind?: "mcq" | "typed";
  question: string;
  options: string[];
  answer: number;
  accepted?: string[];
  translation?: string;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; family: string; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const l15 = L(15), l16 = L(16), l17 = L(17), l18 = L(18), l19 = L(19), l20 = L(20), l21 = L(21);

// کلیدهای چاپی ص۱۹۳-۱۹۴ — عیناً از «کلید آزمون تشریحی گرامر درس اول (صفحه 50 تا 54)»
const K1: Record<number, string> = {
  1: "Butter is made from cream.", 2: "I am never invited to parties.",
  3: "Oranges are imported into Canada.", 4: "Are these rooms cleaned every day?",
  5: "My parrots are kept in the cage.", 6: "How often are these rooms cleaned?",
  7: "How many languages are spoken in Canada?", 8: "Football is played in most countries of the world.",
};
const K4: Record<number, string> = {
  1: "is made", 2: "was painted", 3: "are sold", 4: "isn’t used", 5: "was built",
  6: "Are allowed", 7: "was bitten", 8: "were injured", 9: "is pronounced",
  10: "are repaired", 11: "were woken up", 12: "stole", 13: "Were invited",
  14: "invented", 15: "is remembered",
};
const K5: Record<number, string> = {
  1: "is made", 2: "are made", 3: "weren’t invited", 4: "were stolen", 5: "was",
  6: "was stolen", 7: "are shown", 8: "called", 9: "was invited", 10: "were damaged",
  11: "has been repaired", 12: "was found", 13: "was invented", 14: "was given",
  15: "hasn’t been repaired",
};
const K6: Record<number, string> = {
  1: "c", 2: "b", 3: "d", 4: "c", 5: "b", 6: "c", 7: "d", 8: "c", 9: "a", 10: "b",
  11: "b", 12: "c", 13: "c", 14: "a", 15: "d", 16: "b", 17: "c", 18: "a", 19: "c", 20: "d",
};
const K7: Record<number, string> = {
  1: "were they", 2: "wasn’t she", 3: "has she", 4: "haven’t they", 5: "isn’t he",
  6: "didn’t we", 7: "shouldn’t they", 8: "hasn’t he", 9: "mustn’t they", 10: "could they",
  11: "didn’t he", 12: "won’t you", 13: "don’t they", 14: "isn’t he", 15: "aren’t I",
  16: "does he", 17: "does he", 18: "can they", 19: "is there", 20: "shall we",
};

// قفل‌های معنایی ساقه — سرنخ‌های حسیِ کلید
const STEM_LOCKS: Array<[15 | 16 | 17 | 18 | 19 | 21, number, RegExp]> = [
  [15, 1, /^cream \/ butter \/ make \/ from/],
  [16, 6, /be born \/ in \/ in \/ 1360 \/ Tehran \/ I/],
  [17, 6, /thieves \/ tall \/ down \/ cut \/ some \/ the \/ by \/ trees/],
  [18, 5, /When --------------- this bridge --------------- \(build\)\?/],
  [18, 12, /Somebody --------------- \(steal\) my bike/],
  [19, 5, /How old is this film\? B: It is made in 1980/],
  [19, 15, /it hasn’t repaired yet/],
  [21, 15, /I am listening to my English teacher now/],
  [21, 19, /There is no water in the kettle/],
  [21, 20, /Let’s go to the cinema/],
];

const MCQ_LOCKS: Record<number, string> = {
  1: "has been stolen", 3: "were invited", 7: "have been built",
  9: "are caused", 12: "was written", 14: "covers",
  17: "have been solved", 19: "were asked", 20: "was given",
};

describe("jozve topic grammar bank g12 — diagnostic test p50-54 (r287 extraction receipt)", () => {
  it("bank shape: twenty-three lessons, seven diagnostic banks added with printed counts", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 171 }, (_, i) => i + 1) // r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزود؛ r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r299 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ و چاپِ رسمیِ سراسریِ آن (۵۹-۱۷۱) را افزودند
    );
    const counts = [27, 61, 30, 50, 20, 20, 40, 20, 15, 20, 40, 22, 20, 20];
    counts.forEach((c, i) => expect(bank.lessons[i].questions).toHaveLength(c));
    for (const [l, c] of [[l15, 8], [l16, 8], [l17, 8], [l18, 15], [l19, 15], [l20, 20], [l21, 20]] as const) {
      expect(l.count, l.title).toBe(c);
      expect(l.questions, l.title).toHaveLength(c);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: c }, (_, i) => i + 1));
    }
    expect(l15.questions.every((q) => q.id === `g12-dpass1-${q.n}`)).toBe(true);
    expect(l16.questions.every((q) => q.id === `g12-dpass2-${q.n}`)).toBe(true);
    expect(l17.questions.every((q) => q.id === `g12-dpass3-${q.n}`)).toBe(true);
    expect(l18.questions.every((q) => q.id === `g12-dverb-${q.n}`)).toBe(true);
    expect(l19.questions.every((q) => q.id === `g12-dfix-${q.n}`)).toBe(true);
    expect(l20.questions.every((q) => q.id === `g12-dmcq-${q.n}`)).toBe(true);
    expect(l21.questions.every((q) => q.id === `g12-dtag-${q.n}`)).toBe(true);
    // جمع خانواده: ۴۹۹ + ۱۶ (r288) = ۵۱۵
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1103); // ۵۱۵ + ۵۹ آزمون جامع r289
  });

  it("typed banks 15-17: full-sentence keys from printed p193, scramble stems faithful, single typed input", () => {
    for (const q of l15.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K1[q.n]]);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(K1[q.n]));
      expect(q.question, q.id).toMatch(/^cream \/ butter|parties \/ I|import \/ Canada|clean \/ rooms|keep \/ parrots|rooms \/ clean|speak \/ in Canada|play \/ football/);
    }
    // قفل دو مورد از S2/S3
    expect(l16.questions[5].accepted![0]).toBe("I was born in Tehran in 1360.");
    expect(l17.questions[5].accepted![0]).toBe("The tall trees have been cut down by some thieves.");
    for (const l of [l15, l16, l17]) {
      for (const q of l.questions) {
        expect(q.options, q.id).toHaveLength(4);
        const wrongs = q.options.filter((_, i) => i !== q.answer);
        expect(new Set(wrongs.map(norm)).size, q.id).toBe(3);
        for (const w of wrongs) expect(norm(w), q.id).not.toBe(norm(q.accepted![0]));
        expect(FA.test(q.question), q.id).toBe(false);
      }
    }
  });

  it("typed bank 18 (verb forms): slash-keys joined, two-blank printed items exactly {5,6,9,13,15}", () => {
    for (const q of l18.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K4[q.n]]);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(K4[q.n]));
      const blanks = (q.question.match(new RegExp(BLANK, "g")) ?? []).length;
      expect([5, 6, 9, 13, 15].includes(q.n) ? blanks : 1, q.id).toBe([5, 6, 9, 13, 15].includes(q.n) ? 2 : 1);
      expect(FA.test(q.question), q.id).toBe(false);
      expect(q.question, q.id).toMatch(/\([a-z ]+\)|\(not use\)/); // فعل داخل پرانتز (شامل فعل عبارتی «wake up») وفادار ماند
    }
    // فعال‌های چاپی Q12/Q14 — تلهٔ معلوم
    expect(l18.questions[11].accepted![0]).toBe("stole");
    expect(l18.questions[13].accepted![0]).toBe("invented");
  });

  it("typed bank 19 (find & fix): correction keys from p194 parenthesized receipts, '(---------------)' placeholder stem", () => {
    for (const q of l19.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K5[q.n]]);
      expect(q.question, q.id).toContain("(---------------)");
      expect(FA.test(q.question), q.id).toBe(false);
      const wrongs = q.options.filter((_, i) => i !== q.answer);
      expect(new Set(wrongs.map(norm)).size, q.id).toBe(3);
    }
    expect(l19.questions[4].question).toContain("It is made in 1980");
    expect(l19.questions[14].accepted![0]).toBe("hasn’t been repaired");
  });

  it("mcq bank 20: letter grid fidelity (all 20), semantic locks, vertical-option extraction clean", () => {
    for (const q of l20.questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options.map(norm)).size, q.id).toBe(4);
      expect(q.answer, q.id).toBe("abcd".indexOf(K6[q.n]));
      expect(FA.test(q.question), q.id).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id}:${o}`).toBe(false);
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
    }
    for (const [n, opt] of Object.entries(MCQ_LOCKS)) {
      const q = l20.questions[Number(n) - 1];
      expect(q.options[q.answer], `q${n}`).toBe(opt);
    }
  });

  it("typed bank 21 (tags): full 20 printed keys incl. duplicates (isn't he ×2, does he ×2), classic traps locked", () => {
    for (const q of l21.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K7[q.n]]);
      expect(q.question.endsWith("?"), q.id).toBe(true);
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
    }
    expect(l21.questions[4].accepted![0]).toBe("isn’t he");
    expect(l21.questions[13].accepted![0]).toBe("isn’t he"); // تکرار چاپی — وفادار
    expect(l21.questions[15].accepted![0]).toBe("does he");
    expect(l21.questions[16].accepted![0]).toBe("does he"); // تکرار چاپی
    expect(l21.questions[14].accepted![0]).toBe("aren’t I");
    expect(l21.questions[19].accepted![0]).toBe("shall we");
  });

  it("stem locks verbatim + English purity across all six typed banks", () => {
    for (const [lesson, n, re] of STEM_LOCKS) {
      const l = L(lesson);
      expect(l.questions[n - 1].question, `l${l.lesson}-q${n}`).toMatch(re);
    }
    for (const l of [l15, l16, l17, l18, l19, l21]) {
      for (const q of l.questions) {
        for (const o of q.options) expect(FA.test(o), `${q.id}:${o}`).toBe(false);
        for (const a of q.accepted ?? []) expect(FA.test(a), `${q.id}:${a}`).toBe(false);
      }
    }
  });

  it("id uniqueness across the whole 171-bank family (1103 ids) + diagnostic banks introduce zero new stem collisions", () => {
    const all = bank.lessons.flatMap((l) => l.questions);
    const ids = new Set(all.map((q) => q.id));
    expect(ids.size).toBe(1103);
    const stems = new Set(
      bank.lessons
        .filter((l) => l.lesson < 15)
        .flatMap((l) => l.questions.map((q) => norm(q.question.replace(/-+/g, " ").replace(/\(---------------\)/g, " "))))
    );
    // برخوردِ چاپیِ مستند (الگوی ERRATA_DUP r281): خود جزوه چند سؤال S6 را در آزمون ص۳۷-۳۸ هم
    // چاپ کرده (g12-pass2-14/16) — هر دو کلید یکسان‌اند و این هم‌خوانی رسیدِ اعتبارِ هر دو گرید است.
    const PRINTED_DUPS = new Set(["g12-dmcq-5", "g12-dmcq-7"]);
    for (const l of [l15, l16, l17, l18, l19, l21]) {
      for (const q of l.questions) {
        const key = norm(q.question.replace(/-+/g, " ").replace(/\(---------------\)/g, " "));
        expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
      }
    }
    for (const q of l20.questions) {
      if (PRINTED_DUPS.has(q.id)) continue;
      const key = norm(q.question.replace(/-+/g, " "));
      expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
    }
  });

  it("printed duplicate receipts: dmcq-5/dmcq-7 == pass2-14/pass2-16 (booklet repeats items across p38 and p52, keys agree)", () => {
    const p2 = bank.lessons.find((l) => l.lesson === 11)!.questions;
    const d5 = l20.questions[4];
    const p14 = p2.find((q) => q.id === "g12-pass2-14")!;
    expect(norm(p14.question.replace(/-+/g, " "))).toBe(norm(d5.question.replace(/-+/g, " ")));
    expect(p14.options[p14.answer]).toBe("has been invited");
    expect(d5.options[d5.answer]).toBe("has been invited"); // هم‌خوانی دو کلید چاپی
    expect(p14.options).not.toEqual(d5.options); // ترتیب گزینه‌ها متفاوت چاپ شده — وفادار به هر دو
    const d7 = l20.questions[6];
    const p16 = p2.find((q) => q.id === "g12-pass2-16")!;
    expect(norm(p16.question.replace(/-+/g, " "))).toBe(norm(d7.question.replace(/-+/g, " ")));
    expect(p16.options[p16.answer]).toBe("have been built");
    expect(d7.options[d7.answer]).toBe("have been built");
  });

  it("provenance: source.diagnostic receipt (r287) + frozen r280 stats untouched + family purity", () => {
    const dg = bank.source.diagnostic as Record<string, unknown> | undefined;
    expect(dg).toBeTruthy();
    expect(dg?.extractedRound).toBe(287);
    expect(String(dg?.pages)).toContain("50-54");
    expect(String(dg?.questions)).toContain("94");
    const stats = bank.source.stats as Record<string, number>;
    expect(stats.questions).toBe(88);
    // خلوص: ۱۵-۱۹ و ۲۱ تایپی، ۲۰ mcq بی‌فیلد kind، بانک‌های ۱-۱۴ دست‌نخورده
    for (const l of [l15, l16, l17, l18, l19, l21]) {
      expect(l.questions.every((q) => q.kind === "typed"), l.title).toBe(true);
    }
    expect(l20.questions.every((q) => q.kind === undefined)).toBe(true);
    for (const l of bank.lessons.filter((x) => x.lesson < 15)) {
      const isTyped = l.lesson === 12 || l.lesson === 13;
      for (const q of l.questions) {
        if (isTyped) expect(q.kind, q.id).toBe("typed");
        else expect(q.kind, q.id).toBeUndefined();
      }
    }
  });
});
