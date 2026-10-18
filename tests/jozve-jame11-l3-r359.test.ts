import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r359 — گاردِ «آزمون جامع تشریحی درس سوم» جزوهٔ جامع یازدهم
// ص۱۰۹-۱۱۱، کلیدِ چاپیِ ص۲۰۱-۲۰۲ — چهارده سکشن = چهارده بانک (l79..l92):
// کلمات ناقص (۴) / کلمات داده‌شده (۸، اضافیِ handicrafts) / حروفِ ناقص (۴) / گزینهٔ متفاوت (۴) /
// وصلِ تعریف (۴) / چهارگزینه‌ای واژگان (۴) / چهارگزینه‌ای گرامر (۴) / جمله‌سازی (۲) /
// متضاد (۸ — ترتیبِ چاپِ به‌هم‌ریخته) / وصلِ دوستونی (۶) / پرانتزی (۴) / فشار صوت (۱ مستند) /
// کلوزِ فرهنگ (۶) / درک مطلبِ عکاسی (۴ درست/نادرست + ۲ تایپی) = ۶۵ آیتم
// لنگرِ متقابلِ دوطرفه: «پاسخنامه صفحه: ۲۰۱ تا ۲۰۲» ⇠ «آزمون صفحه: ۱۰۹ تا ۱۱۱»
// =====================================================================

interface BankQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  kind?: "mcq" | "typed";
  accepted?: string[];
  placeholder?: string;
  translation?: string;
}
interface BankLesson {
  lesson: number;
  title: string;
  level?: string;
  count: number;
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  source: Record<string, {
    extractedRound?: string;
    printQuirks?: string[];
    [k: string]: unknown;
  }>;
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const words = (s: string) =>
  s
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .split("/")
    .join(" ")
    .match(/[a-z0-9']+/g) ?? [];

const byLesson = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const L = (n: number) => byLesson(n);
const l79 = L(79);
const l80 = L(80);
const l82 = L(82);
const l84 = L(84);
const l85 = L(85);
const l86 = L(86);
const l87 = L(87);
const l88 = L(88);
const l89 = L(89);
const l90 = L(90);
const l91 = L(91);
const l92 = L(92);

describe("r359 — receipt: source.g11l3jame", () => {
  it("receipt exists with extractedRound=r359 and 11 printQuirks", () => {
    const rec = bank.source.g11l3jame;
    expect(rec).toBeTruthy();
    expect(rec!.extractedRound).toBe("r359");
    expect(rec!.printQuirks).toHaveLength(11);
  });

  it("receipt records the two-way locator, the key mislabel, the antonym scramble, and the stress item", () => {
    const quirks = bank.source.g11l3jame!.printQuirks!.join(" ");
    expect(quirks).toContain("پاسخنامه صفحه: ۲۰۱ تا ۲۰۲");
    expect(quirks).toContain("آزمون صفحه: ۱۰۹ تا ۱۱۱");
    expect(quirks).toContain("«۵» برچسب زده");
    expect(quirks).toContain("1,3,5,7,2,4,6,8");
    expect(quirks).toContain("(rising)");
    expect(quirks).toContain("handicrafts");
  });
});

describe("r359 — bank shapes (l79..l92)", () => {
  it("titles, levels, counts (۱۴ سکشنِ چاپی — شمارشِ [4,8,4,4,4,4,4,2,8,6,4,1,6,6])", () => {
    expect(l79.title).toBe("تشریحی جامع — کلمات ناقص (ص۱۰۹)");
    expect(l80.title).toBe("تشریحی جامع — کلمات داده‌شده (ص۱۰۹)");
    expect(L(81).title).toBe("تشریحی جامع — کلمهٔ مناسب با حروف ناقص (ص۱۰۹)");
    expect(l82.title).toBe("تشریحی جامع — گزینهٔ متفاوت (ص۱۰۹)");
    expect(L(83).title).toBe("تشریحی جامع — وصل کردن تعریف‌ها (ص۱۰۹)");
    expect(l84.title).toBe("تشریحی جامع — تست چهارگزینه‌ای (ص۱۰۹)");
    expect(l85.title).toBe("تشریحی جامع — تست چهارگزینه‌ای (ص۱۱۰)");
    expect(l86.title).toBe("تشریحی جامع — جمله‌سازی (ص۱۱۰)");
    expect(l87.title).toBe("تشریحی جامع — متضاد (ص۱۱۰)");
    expect(l88.title).toBe("تشریحی جامع — وصل دوستونی (ص۱۱۰)");
    expect(l89.title).toBe("تشریحی جامع — خط زیر گزینهٔ صحیح (ص۱۱۰)");
    expect(l90.title).toBe("تشریحی جامع — فشار صوت (ص۱۱۰)");
    expect(l91.title).toBe("تشریحی جامع — کلوز فرهنگ (ص۱۱۰-۱۱۱)");
    expect(l92.title).toBe("تشریحی جامع — درک مطلب عکاسی (ص۱۱۱)");
    expect([79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92].map((n) => L(n).level)).toEqual([
      "تشریحی — تایپی", "تشریحی — تایپی", "تشریحی — تایپی", "تشریحی — تایپی", "تشریحی — تایپی",
      "تشریحی — چهارگزینه‌ای", "تشریحی — چهارگزینه‌ای", "تشریحی — جمله‌سازی", "تشریحی — تایپی",
      "تشریحی — تایپی", "تشریحی — تایپی", "تشریحی — تایپی", "تشریحی — چهارگزینه‌ای",
      "تشریحی — درست/نادرست و تایپی",
    ]);
    expect([79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92].map((n) => L(n).count)).toEqual([
      4, 8, 4, 4, 4, 4, 4, 2, 8, 6, 4, 1, 6, 6,
    ]);
  });

  it("ids: g11-l79..l92-N unique across the whole bank — total 1084 items in 92 banks", () => {
    const sizes: Record<number, number> = { 79: 4, 80: 8, 81: 4, 82: 4, 83: 4, 84: 4, 85: 4, 86: 2, 87: 8, 88: 6, 89: 4, 90: 1, 91: 6, 92: 6 };
    for (const les of bank.lessons.filter((b) => b.lesson >= 79)) {
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: sizes[les.lesson]! }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(1019 + 65); // ۱۰۱۹ (تا r358) + ۶۵ (r359)
    expect(bank.lessons).toHaveLength(92);
  });

  it("file shape: last thirty-three banks are l60..l92 in order (r359 appended l79..l92)", () => {
    const tail = bank.lessons.slice(-33).map((l) => l.lesson);
    expect(tail).toEqual([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]);
  });

  it("all new questions are Persian-free", () => {
    const FA = /[\u0600-\u06FF]/;
    for (const les of bank.lessons.filter((b) => b.lesson >= 79)) {
      for (const q of les.questions) {
        expect(FA.test(q.question), q.id).toBe(false);
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
      }
    }
  });
});

describe("r359 — typed purity (l79..l90 typed banks)", () => {
  it("every typed question keeps accepted=[options[answer]] + placeholder", () => {
    for (const les of [l79, l80, L(81), l82, L(83), l86, l87, l88, l89, l90]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted, q.id).toEqual([q.options[q.answer]]);
        expect(q.placeholder?.length ?? 0, q.id).toBeGreaterThan(8);
      }
    }
  });

  it("l79/l81: printed keys locked verbatim + gap patterns kept", () => {
    expect(l79.questions.map((q) => q.accepted![0])).toEqual(["diversity", "pottery", "imagination", "reflects"]);
    expect(l79.questions.map((q) => q.question)).toEqual([
      "The island has more d__ver__ity in plant life than other islands nearby.",
      "She was a painter for years before she discovered p__tt__ry.",
      "Is it just my ima__inati__n, or is it getting warm in here?",
      "His book clearly r__fl__cts his beliefs.",
    ]);
    expect(L(81).questions.map((q) => q.accepted![0])).toEqual(["truth", "skill", "economy", "value"]);
    for (const q of L(81).questions) expect(q.question, q.id).toMatch(/\b[a-z]( _)+/);
  });

  it("l80: 9-word pool with extra «handicrafts» never used as an answer + word bank in every stem", () => {
    expect(l80.questions.map((q) => q.accepted![0])).toEqual([
      "traditional", "custom", "sociable", "bored", "wellness", "included", "ashamed", "excited",
    ]);
    for (const q of l80.questions) {
      expect(q.question, q.id).toContain("[bank: excited / wellness / handicrafts / traditional / custom / bored / sociable / included / ashamed]");
      expect(q.accepted![0], q.id).not.toBe("handicrafts");
    }
  });

  it("l82: options keep the printed order — answer is the odd one's index", () => {
    expect(l82.questions[0]!.options).toEqual(["totally", "completely", "certainly", "entirely"]);
    expect(l82.questions[0]!.answer).toBe(2); // certainly
    expect(l82.questions[1]!.accepted![0]).toBe("sad");
    expect(l82.questions[2]!.accepted![0]).toBe("well-known");
    expect(l82.questions[3]!.accepted![0]).toBe("ugly");
  });

  it("l83/l88: letter keys mapped via the printed columns + dotted-paren stems verbatim", () => {
    expect(L(83).questions.map((q) => q.accepted![0])).toEqual(["vast", "earn", "pack", "appreciate"]);
    for (const q of L(83).questions) expect(q.question, q.id).toMatch(/\(-{4,}\)\s*\[bank: /);
    expect(l88.questions.map((q) => q.accepted![0])).toEqual(["country", "products", "customs", "people", "values", "chairs"]);
    for (const q of l88.questions) expect(q.question, q.id).toContain("[bank: people / customs / values / country / chairs / products]");
  });
});

describe("r359 — l84/l85 بهترین گزینه (MCQ — کلیدِ متنیِ چاپی)", () => {
  it("l84 answers = unique/common/recognize/customs", () => {
    expect(l84.questions.map((q) => q.options[q.answer])).toEqual(["unique", "common", "recognize", "customs"]);
    expect(l84.questions[0]!.options).toEqual(["calligraphic", "present", "unique", "decorative"]);
  });

  it("l85 answers = be/don’t work/to complete/not to speak — grammar-categorized", () => {
    expect(l85.questions.map((q) => q.options[q.answer])).toEqual(["be", "don’t work", "to complete", "not to speak"]);
    for (const q of l85.questions) expect(q.category, q.id).toBe("grammar");
    expect(l85.questions[3]!.options).toEqual(["don’t speak", "to not speak", "not to speak", "not speak"]);
  });
});

describe("r359 — l86 جمله‌سازی (قفلِ چندمجموعهٔ واژگانِ ساقه⇄کلید)", () => {
  it("both jumbled stems' word multisets equal their key sentences' — 2/2", () => {
    for (const q of l86.questions) {
      expect(words(q.question).sort(), q.id).toEqual(words(q.accepted![0]).sort());
      expect(q.question, q.id).toContain("/");
    }
  });
  it("printed key sentences verbatim", () => {
    expect(l86.questions.map((q) => q.accepted![0])).toEqual([
      "I told him not to play football in the yard.",
      "You will hurt yourself if you jump into the river.",
    ]);
  });
});

describe("r359 — l87 متضاد (ترتیبِ چاپِ به‌هم‌ریخته → بازچینیِ ۱..۸)", () => {
  it("re-sorted stems + printed keys verbatim (چندواریانتِ «or» عینِ چاپ)", () => {
    expect(l87.questions.map((q) => q.question)).toEqual([
      "expensive ≠", "lose ≠", "sell ≠", "slowly ≠", "hot ≠", "cheerful ≠", "increase ≠", "falling ≠",
    ]);
    expect(l87.questions.map((q) => q.accepted![0])).toEqual([
      "cheap", "find or win", "buy", "quickly or rapidly", "cold", "cheerless or gloomy", "decrease", "rising",
    ]);
  });
});

describe("r359 — l89/l90 پرانتزی و فشار صوت", () => {
  it("l89: two-candidate parens with printed keys", () => {
    expect(l89.questions.map((q) => q.accepted![0])).toEqual(["loses", "watch", "To have", "not to answer"]);
    expect(l89.questions[2]!.options).toEqual(["To have", "Have"]);
    for (const q of l89.questions) expect(q.options, q.id).toHaveLength(2);
  });

  it("l90: single documented intonation item (الگوی g10-l92) — rising / falling به ترتیبِ چاپ", () => {
    expect(l90.count).toBe(1);
    expect(l90.questions[0]!.question).toBe("If you don’t wash fruits before eating them, (--------) you will get sick. (--------)");
    expect(l90.questions[0]!.accepted![0]).toBe("rising / falling");
    expect(l90.questions[0]!.options).toEqual(["rising / falling"]);
  });
});

describe("r359 — l91/l92 کلوز و درک مطلب", () => {
  it("l91: cloze keys b,c,a,a,d,c + numbered ---N--- blanks in per-sentence stems", () => {
    expect(l91.questions.map((q) => q.options[q.answer])).toEqual(["unique", "activities", "produce", "values", "influenced", "ancient"]);
    for (const q of l91.questions) {
      expect(q.question, q.id).toMatch(/---\d---/);
      expect(q.options, q.id).toHaveLength(4);
    }
    expect(l91.questions[0]!.options).toEqual(["uncertain", "unique", "familiar", "respectful"]);
  });

  it("l92: 4 True/False keyed true,true,false,false + 2 typed from the printed key verbatim", () => {
    expect(l92.questions.slice(0, 4).map((q) => q.options[q.answer])).toEqual(["True", "True", "False", "False"]);
    expect(l92.questions.slice(0, 4).every((q) => q.options.join() === "True,False")).toBe(true);
    expect(l92.questions[4]!.accepted![0]).toBe("A photographer takes photographs, especially as a job.");
    expect(l92.questions[5]!.accepted![0]).toBe("The amount of time the shutter stays open for is called the shutter speed.");
    expect(l92.questions[4]!.kind).toBe("typed");
    expect(l92.questions[5]!.question).toBe("What is the shutter speed?");
  });

  it("scaffold options = own key + sibling keys of the same section, without duplicates", () => {
    for (const les of [l79, L(81), l87]) {
      for (const q of les.questions) {
        expect(new Set(q.options).size, q.id).toBe(q.options.length);
      }
    }
    for (const q of l86.questions) expect(q.options[0]).toBe(q.accepted![0]);
  });
});
