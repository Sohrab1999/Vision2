import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r361 — گاردِ «آزمون تشریحی پایان ترم دوم» یازدهم (ص۱۱۴-۱۱۶، کلیدِ چاپیِ ص۲۰۳)
// چهارده سکشنِ خودِ آزمون = چهارده بانک (l95..l108، الگوی r355/r357/r359) با شماره‌گذاریِ سراسریِ ۱-۳۹.
// کشف‌های چاپی: سکشن۴ دو سؤال در یک سطرِ دوستونیِ RTL (راست=۱۲، چپ=۱۱)؛ سکشن۸ ترتیبِ ۲۴,۲۲,۲۵,۲۳
// و سکشن۹ ترتیبِ ۲۸,۲۶,۲۹,۲۷ (هر دو با کلیدِ یکسان در آزمون و کلید — بازچینی با شماره)؛
// گزینه‌های س۳۷ سطریِ RTL (لایه d,c,b,a — مختصاتِ x چپ‌به‌راست a→d) و س۳۸ دوستونی (b,a/d,c) —
// ترتیب با لنگرِ حروفِ چاپی بازسازی؛ کلیدِ ۱۱/۱۲ و ۳۶-۳۹ سطرهای مشترک چاپی؛ کلیدِ چندواریانتیِ
// «begin or start» verbatim؛ رانِ dashِ شکسته در ۲۳/۲۵؛ ص۱۱۶ پس از س۳۹ فقط Noteِ خالی.
// لوکاتورِ دوطرفه: آزمون «(پاسخنامه صفحه203)» ⇠ کلید «(آزمون صفحه114 تا116)».

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string;
    g11l4jame?: {
      extractedRound: string; examPages: string; keyPages: string;
      sections: number; items: number; printQuirkCount: number; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g11.json", "utf8"),
) as unknown as TBank;

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const NEW = [95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108];

// کلیدِ چاپیِ ص۲۰۳ — رونوشتِ حرف‌به‌حرف (۳۶ مدخلِ سکشن‌های ۱-۱۱ + سطرِ مشترکِ ۳۶-۳۹)
const KEY1_6 = ["diversity", "recent", "identity", "ability", "culture", "lifestyle"];
const KEY7_8 = ["metals", "century"];
const KEY9_10 = ["a", "c"]; // حرفی — با گزینه‌ها واژه می‌شود
const KEY11_12 = ["My father (He) has bought a bag of rice.", "If I have time, I will wash the dishes."];
const KEY13 = "I have enough problems of my own without having to worry about yours.";
const KEY14_17 = ["Our friend", "English", "fluently", "Last week"];
const KEY18_21 = ["written", "answers", "to help", "watching"];
const KEY22_25 = ["impossible", "rainy", "dangerous", "dislike"];
const KEY26_29 = ["begin or start", "lose", "expensive", "slowly"];
const KEY30_33 = ["addiction", "emotional", "decreases", "balanced"];
const KEY34_36 = ["false", "true", "Millions of people use social media."];
const KEY37 = "media"; // 37. B
const KEY38 = "two kinds of media"; // 38. B
const KEY39 = "create";

describe("r361 — receipt & shape", () => {
  it("receipt g11l4jame: r361, pp114-116, key p203, 14 sections, 39 items, 11 printQuirks", () => {
    const rec = bank.source.g11l4jame!;
    expect(rec).toBeTruthy();
    expect(rec.extractedRound).toBe("r361");
    expect(rec.examPages).toBe("114-116");
    expect(rec.keyPages).toBe("203");
    expect(rec.sections).toBe(14);
    expect(rec.items).toBe(39);
    expect(rec.printQuirkCount).toBe(11);
    expect(rec.printQuirks).toHaveLength(11);
    // لوکاتورِ دوطرفه در خودِ رسید ثبت است
    expect(rec.printQuirks[0]).toContain("پاسخنامه صفحه203");
    expect(rec.printQuirks[0]).toContain("آزمون صفحه114 تا116");
  });

  it("file shape after r361: 108 banks, 1223 items, unique ids, tail vector l95..l108", () => {
    expect(bank.lessons).toHaveLength(108);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(1223);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1223);
    // وکتورِ چهارده بانکِ جدید
    expect(counts.slice(-14)).toEqual([6, 2, 2, 2, 1, 4, 4, 4, 4, 4, 3, 1, 1, 1]);
    // شناسه‌های سراسریِ l95..l108 به ترتیب
    const tailIds = bank.lessons.slice(-14).flatMap((l) => l.questions.map((q) => q.id));
    expect(tailIds.slice(0, 6)).toEqual(["g11-l95-1", "g11-l95-2", "g11-l95-3", "g11-l95-4", "g11-l95-5", "g11-l95-6"]);
    expect(tailIds.slice(-4)).toEqual(["g11-l105-3", "g11-l106-1", "g11-l107-1", "g11-l108-1"]);
  });

  it("titles & levels follow the family convention", () => {
    for (const n of NEW) {
      const b = L(n);
      expect(b.title, `l${n}`).toContain("تشریحی پایان‌ترم");
      expect(b.title, `l${n}`).toMatch(/ص۱۱۴|ص۱۱۵|ص۱۱۶/);
      expect(b.level, `l${n}`).toMatch(/تشریحی — (تایپی|چهارگزینه‌ای|جمله‌سازی|درست\/نادرست و تایپی)/);
      expect(b.count, `l${n}`).toBe(b.questions.length);
    }
    expect(L(95).title).toBe("تشریحی پایان‌ترم — کلمات داده‌شده (ص۱۱۴)");
    expect(L(108).title).toBe("تشریحی پایان‌ترم — هم‌معنی «make» (ص۱۱۶)");
  });

  it("all new questions are Persian-free", () => {
    const FA = /[\u0600-\u06FF]/;
    for (const n of NEW) {
      for (const q of L(n).questions) {
        expect(FA.test(q.question), q.id).toBe(false);
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
      }
    }
  });
});

describe("r361 — keys locked to the printed key (p203)", () => {
  it("l95: six answers exactly the printed key order", () => {
    const b = L(95);
    expect(b.questions.map((q) => q.accepted![0])).toEqual(KEY1_6);
    // استخرِ ۷واژه‌ای با اضافیِ souvenirs در هر ساقه
    for (const q of b.questions) {
      expect(q.question).toContain("[bank: recent / culture / ability / souvenirs / diversity / identity / lifestyle]");
      expect(q.question).toMatch(/-{31}/);
    }
    // اضافیِ souvenirs هرگز پاسخ نیست
    expect(b.questions.map((q) => q.accepted![0])).not.toContain("souvenirs");
  });

  it("l96: incomplete-word stems verbatim (m_ / c_ gaps)", () => {
    const b = L(96);
    expect(b.questions[0].question).toContain("valuable m_ _ _ _ _.");
    expect(b.questions[1].question).toContain("twenty-first c_ _ _ _ _ _.");
    expect(b.questions.map((q) => q.accepted![0])).toEqual(KEY7_8);
  });

  it("l97: two MCQs keyed by printed letters a/c", () => {
    const b = L(97);
    expect(b.questions[0].options).toEqual(["decided", "to decide", "decide", "deciding"]);
    expect(b.questions[0].answer).toBe(0); // a
    expect(b.questions[1].options).toEqual(["exciting", "excite", "excited", "excitement"]);
    expect(b.questions[1].answer).toBe(2); // c
    expect(b.questions.map((q) => q.category)).toEqual(["grammar", "vocab"]);
  });

  it("l98: picture section re-sorted (print row RTL: right=12, left=11), key variants in accepted", () => {
    const b = L(98);
    expect(b.questions[0].question).toBe("What has your father bought?");
    expect(b.questions[1].question).toBe("What will you do if you have time?");
    expect(b.questions[0].accepted).toEqual([
      "My father (He) has bought a bag of rice.",
      "My father has bought a bag of rice.",
      "He has bought a bag of rice.",
    ]);
    expect(b.questions[1].accepted).toEqual(["If I have time, I will wash the dishes."]);
  });

  it("l99: sentence-building multiset lock stem<->key (13 tokens)", () => {
    const q = L(99).questions[0];
    const w = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\//g, " ").match(/[a-z0-9']+/g) ?? [];
    expect([...w(q.question)].sort()).toEqual([...w(KEY13)].sort());
    expect(q.accepted).toEqual([KEY13]);
    expect(q.question).toContain("having/ .");
  });

  it("l100: underline section — stems end with the printed explanation parens", () => {
    const b = L(100);
    expect(b.questions.map((q) => q.accepted![0])).toEqual(KEY14_17);
    expect(b.questions[0].question).toBe("Our friend lives in a very small village. (subject)");
    expect(b.questions[2].question).toBe("My friend can speak French fluently. (adverb of manner)");
    expect(b.questions[3].question).toBe("Last week, I saw my English teacher in the street. (adverb of time)");
  });

  it("l101: verb forms with parenthetical verbs verbatim", () => {
    const b = L(101);
    expect(b.questions.map((q) => q.accepted![0])).toEqual(KEY18_21);
    expect(b.questions[0].question).toContain("(write)");
    expect(b.questions[1].question).toContain("(answer)");
    expect(b.questions[2].question).toContain("(help)");
    expect(b.questions[3].question).toContain("(watch)");
    for (const q of b.questions) expect(q.question).toMatch(/-{31}/);
  });

  it("l102: affix section in l67 format (root: [bank: dis / im / ous / y])", () => {
    const b = L(102);
    expect(b.questions.map((q) => q.accepted![0])).toEqual(KEY22_25);
    expect(b.questions.map((q) => q.question)).toEqual([
      "possible: [bank: dis / im / ous / y]",
      "rain: [bank: dis / im / ous / y]",
      "danger: [bank: dis / im / ous / y]",
      "like: [bank: dis / im / ous / y]",
    ]);
  });

  it("l103: antonyms — multi-variant printed key «begin or start» kept verbatim", () => {
    const b = L(103);
    expect(b.questions.map((q) => q.accepted![0])).toEqual(KEY26_29);
    expect(b.questions[0].question).toMatch(/^finish ≠ -{31}$/);
    expect(b.questions[1].question).toMatch(/^find ≠ -{31}$/);
    expect(b.questions[2].question).toMatch(/^cheap ≠ -{31}$/);
    expect(b.questions[3].question).toMatch(/^quickly ≠ -{31}$/);
  });

  it("l104: cloze with printed ---30---..---33--- blanks + 4-word pool in every stem", () => {
    const b = L(104);
    expect(b.questions.map((q) => q.accepted![0])).toEqual(KEY30_33);
    expect(b.questions[0].question).toMatch(/^Bad habits and ---30--- can be harmful to health\. \[bank: emotional \/ balanced \/ addiction \/ decreases\]$/);
    expect(b.questions[1].question).toMatch(/^The most important thing to enjoy a good life is having ---31--- health\. \[bank: emotional \/ balanced \/ addiction \/ decreases\]$/);
    expect(b.questions[2].question).toMatch(/^Praying ---32--- stress and gives people a calm and ---33--- life\. \[bank: emotional \/ balanced \/ addiction \/ decreases\]$/);
    expect(b.questions[3].question).toMatch(/^Praying ---32--- stress and gives people a calm and ---33--- life\. \[bank: emotional \/ balanced \/ addiction \/ decreases\]$/);
  });

  it("l105: reading — 2 True/False + 1 typed", () => {
    const b = L(105);
    expect(b.questions[0].question).toBe("Magazines are types of social media.");
    expect(b.questions[0].options).toEqual(["True", "False"]);
    expect(b.questions[0].answer).toBe(1); // false
    expect(b.questions[1].question).toBe("You need special skills to create traditional media.");
    expect(b.questions[1].answer).toBe(0); // true
    expect(b.questions[2].kind).toBe("typed");
    expect(b.questions[2].question).toBe("How many people use social media?");
    expect(b.questions[2].accepted).toEqual([KEY34_36[2]]);
  });

  it("l106/l107: RTL-row MCQs re-sorted by printed letter anchors; keys B/B", () => {
    const q37 = L(106).questions[0];
    expect(q37.question).toMatch(/^The underlined word “them” in the last line refers to -{31}\.$/);
    expect(q37.options).toEqual(["people", "media", "magazines", "millions"]);
    expect(q37.answer).toBe(1); // B
    const q38 = L(107).questions[0];
    expect(q38.question).toMatch(/^This passage mainly talks about -{31}\.$/);
    expect(q38.options).toEqual(["media companies", "two kinds of media", "books and magazines", "writing twitter posts"]);
    expect(q38.answer).toBe(1); // B
  });

  it("l108: synonym of make — dotted paren verbatim, answer create", () => {
    const q = L(108).questions[0];
    expect(q.question).toMatch(/^Which word in the text is the synonym of “make”\? \(-{29}\)$/);
    expect(q.accepted).toEqual([KEY39]);
    expect(q.options).toEqual(["create"]);
  });
});

describe("r361 — typed purity", () => {
  it("typed banks carry kind/accepted/placeholder; MCQ banks do not", () => {
    const TYPED = [95, 96, 98, 99, 100, 101, 102, 103, 104, 108];
    const MCQ = [97, 106, 107];
    for (const n of TYPED) {
      for (const q of L(n).questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted?.length, q.id).toBeGreaterThan(0);
        expect(q.placeholder, q.id).toBeTruthy();
        expect(q.options[q.answer], q.id).toBe(q.accepted![0]);
      }
    }
    for (const n of MCQ) {
      for (const q of L(n).questions) {
        expect(q.kind, q.id).toBeUndefined();
        expect(q.accepted, q.id).toBeUndefined();
      }
    }
    // l105 مختلط: T/F بدونِ kind، تایپی با kind
    const b105 = L(105);
    expect(b105.questions[0].kind).toBeUndefined();
    expect(b105.questions[2].kind).toBe("typed");
  });
});
