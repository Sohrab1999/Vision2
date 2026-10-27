import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r358 — گاردِ «آزمون تشریحی گرامر درس سوم» جزوهٔ جامع یازدهم
// ص۱۰۰-۱۰۲، کلیدِ چاپیِ ص۱۹۶-۱۹۷ — پنج سکشن = پنج بانک (l74..l78):
// شکلِ افعال (۱۰ تایپی) / تصحیحِ اشتباهِ گرامری (۱۲ تایپی) / بهترین گزینه (۲۰ MCQ، کلیدِ حرفی) /
// جمله‌سازیِ شرطی (۱۰ تایپی) / جمله‌سازیِ مصدر (۹ تایپی — چاپ بریده، کلیدِ یتیمِ مستند)
// لنگرِ متقابلِ دوطرفه: «پاسخنامه صفحه: ۱۹۶ و ۱۹۷» ⇠ «سؤالات صفحه: ۱۰۰ تا ۱۰۲»
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

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const words = (s: string) =>
  s
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .split("/")
    .join(" ")
    .match(/[a-z0-9']+/g) ?? [];

const byLesson = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const l74 = byLesson(74);
const l75 = byLesson(75);
const l76 = byLesson(76);
const l77 = byLesson(77);
const l78 = byLesson(78);

describe("r358 — receipt: source.g11l3gtash", () => {
  it("receipt exists with extractedRound=r358 and 10 printQuirks", () => {
    const rec = bank.source.g11l3gtash;
    expect(rec).toBeTruthy();
    expect(rec!.extractedRound).toBe("r358");
    expect(rec!.printQuirks).toHaveLength(10);
  });

  it("receipt records the two-way locator, the orphan key entry, and the be-verb suppletion", () => {
    const quirks = bank.source.g11l3gtash!.printQuirks!.join(" ");
    expect(quirks).toContain("پاسخنامه صفحه: ۱۹۶ و ۱۹۷");
    expect(quirks).toContain("آزمون تش  ییح");
    expect(quirks).toContain("یتیم");
    expect(quirks).toContain("(be)→are");
  });
});

describe("r358 — bank shapes (l74..l78)", () => {
  it("titles, levels, counts (۵ سکشنِ چاپی — سکشن۵ ۹تایی به‌سبب بریدگیِ چاپ)", () => {
    expect(l74.title).toBe("تشریحی گرامر د۳ — شکل صحیح افعال (ص۱۰۰)");
    expect(l75.title).toBe("تشریحی گرامر د۳ — تصحیح اشتباه گرامری (ص۱۰۰)");
    expect(l76.title).toBe("تشریحی گرامر د۳ — تست چهارگزینه‌ای (ص۱۰۰-۱۰۱)");
    expect(l77.title).toBe("تشریحی گرامر د۳ — جمله‌سازی شرطی (ص۱۰۲)");
    expect(l78.title).toBe("تشریحی گرامر د۳ — جمله‌سازی با مصدر (ص۱۰۲)");
    expect(l74.level).toBe("تشریحی — تایپی");
    expect(l76.level).toBe("تشریحی — چهارگزینه‌ای");
    expect(l77.level).toBe("تشریحی — جمله‌سازی");
    expect(l78.level).toBe("تشریحی — جمله‌سازی");
    expect([l74.count, l75.count, l76.count, l77.count, l78.count]).toEqual([10, 12, 20, 10, 9]);
  });

  it("ids: g11-l74..l78-N unique across the whole bank — total 1223 items in 108 banks", () => {
    const sizes: Record<number, number> = { 74: 10, 75: 12, 76: 20, 77: 10, 78: 9 };
    for (const les of [l74, l75, l76, l77, l78]) {
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: sizes[les.lesson]! }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(958 + 61 + 65 + 100 + 39); // ۹۵۸ (تا r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)؛ +۳۹: پایان‌ترم تشریحی (r361)
    expect(bank.lessons).toHaveLength(108);
  });

  it("file shape: last forty-nine banks are l60..l108 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94، r361 appended l95..l108)", () => {
    const tail = bank.lessons.slice(-49).map((l) => l.lesson);
    expect(tail).toEqual([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108]);
  });

  it("all questions are grammar-categorized and Persian-free", () => {
    const FA = /[\u0600-\u06FF]/;
    for (const les of [l74, l75, l76, l77, l78]) {
      for (const q of les.questions) {
        expect(q.category, q.id).toBe("grammar");
        expect(FA.test(q.question), q.id).toBe(false);
      }
    }
  });
});

describe("r358 — typed purity (l74/l75/l77/l78)", () => {
  it("every typed question keeps accepted=[options[answer]] + placeholder", () => {
    for (const les of [l74, l75, l77, l78]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted, q.id).toEqual([q.options[q.answer]]);
        expect(q.placeholder?.length ?? 0, q.id).toBeGreaterThan(8);
      }
    }
  });

  it("l74: printed key sequence locked verbatim + 32-dash blanks + parenthetical verbs kept", () => {
    const keys = l74.questions.map((q) => q.accepted![0]);
    expect(keys).toEqual(["will stay", "won’t shine", "be", "am not", "are", "come", "don’t slow", "are", "will make", "works"]);
    const verbs = ["(stay)", "(not shine)", "(be)", "(not be)", "(be)", "(come)", "(not slow)", "(be)", "(make)", "(work)"];
    l74.questions.forEach((q, i) => {
      expect(q.question, q.id).toContain(verbs[i]);
      expect(q.question, q.id).toMatch(/-{32}/);
      expect(q.question, q.id).not.toMatch(/-\s+-/);
    });
  });

  it("l74: radical/negation/be-whitelist lock (تعریِ win→wonِ r356 برای متممِ be)", () => {
    const nonBe = [[0, "stay"], [1, "shine"], [5, "come"], [6, "slow"], [8, "make"], [9, "work"]] as const;
    for (const [i, radical] of nonBe) {
      expect(l74.questions[i]!.accepted![0].toLowerCase(), `Q${i + 1}`).toContain(radical);
    }
    // be-items: whitelist از چاپ + توازنِ نفی
    expect(l74.questions[2]!.accepted![0]).toBe("be");
    expect(["am not", "are"]).toContain(l74.questions[3]!.accepted![0]);
    expect(l74.questions[3]!.accepted![0]).toContain("not");
    expect(["are"]).toContain(l74.questions[4]!.accepted![0]);
    expect(l74.questions[4]!.accepted![0]).not.toContain("not");
    for (const q of l74.questions) {
      const neg = /\(not /.test(q.question);
      expect(/\bnot\b|n’t/.test(q.accepted![0].toLowerCase()), q.id).toBe(neg);
    }
  });

  it("l75: stems keep the printed answer box؛ corrections locked verbatim (کلیدِ جمله‌تکرارِ پرانتزی)", () => {
    const corrections = ["don’t", "will answer", "get", "has", "win", "see", "doesn’t", "eats", "ask", "allow", "will be", "quit"];
    l75.questions.forEach((q, i) => {
      expect(q.question, q.id).toMatch(/\(-{20,}\)\s*$/);
      expect(q.accepted![0], q.id).toBe(corrections[i]);
    });
    expect(l75.questions[6]!.question).toContain("Ali won’t pass his exam if he don’t study harder.");
    expect(l75.questions[9]!.question).toContain("He will go camping if his parents allows him.");
  });

  it("l75: each correction is NOT the sentence's own word (تصحیح، تغییر است نه تکرار)", () => {
    l75.questions.forEach((q) => {
      const sentenceWords = words(q.question.replace(/\(-{20,}\)\s*$/, ""));
      expect(sentenceWords, q.id).not.toContain(q.accepted![0].toLowerCase());
    });
  });
});

describe("r358 — l76 بهترین گزینه (MCQ ×۲۰ — کلیدِ حرفیِ چاپی)", () => {
  const printedGrid = "bbdccbdcaacbacdcbdba".split("");
  const printedIdx = printedGrid.map((L) => "abcd".indexOf(L));

  it("letter grid from the printed key maps to answer indices — 20/20", () => {
    expect(l76.questions.map((q) => q.answer)).toEqual(printedIdx);
    l76.questions.forEach((q) => expect(q.options).toHaveLength(4));
  });

  it("spot checks: Q1 «will receive» (شرطِ نوع اول) و Q20 «are»", () => {
    expect(l76.questions[0]!.options[1]).toBe("will receive");
    expect(l76.questions[0]!.answer).toBe(1);
    expect(l76.questions[19]!.options[0]).toBe("are");
    expect(l76.questions[19]!.answer).toBe(0);
    expect(l76.questions[5]!.options[1]).toBe("cannot move");
  });
});

describe("r358 — l77/l78 جمله‌سازی (قفلِ چندمجموعهٔ واژگانِ ساقه⇄کلید)", () => {
  it("every jumbled stem's word multiset equals its key sentence's — 19/19", () => {
    for (const les of [l77, l78]) {
      for (const q of les.questions) {
        expect(words(q.question).sort(), q.id).toEqual(words(q.accepted![0]).sort());
        expect(q.question, q.id).toContain("/");
      }
    }
  });

  it("l77: printed key sentences verbatim (جملاتِ شرطی)", () => {
    const keys = l77.questions.map((q) => q.accepted![0]);
    expect(keys[0]).toBe("Will you buy this car if they fix it?");
    expect(keys[2]).toBe("If you don’t practice, you won’t improve.");
    expect(keys[9]).toBe("If they play computer games all night, they will be tired tomorrow.");
    expect(keys[6]).toContain("3000 tomans");
  });

  it("l78: 9 items only (چاپ بریده) — کلیدِ یتیمِ «My parents wanted me…» در بانک نیست", () => {
    expect(l78.count).toBe(9);
    for (const q of l78.questions) {
      expect(q.accepted![0], q.id).not.toContain("My parents wanted me");
    }
    const keys = l78.questions.map((q) => q.accepted![0]);
    expect(keys[0]).toBe("What do you want to eat for breakfast?");
    expect(keys[8]).toBe("It is your duty to finish the work in time.");
  });

  it("scaffold options = own key + three sibling keys of the same section, without duplicates", () => {
    for (const les of [l74, l75, l77, l78]) {
      for (const q of les.questions) {
        expect(new Set(q.options).size, q.id).toBe(q.options.length);
        expect(q.options[0]).toBe(q.accepted![0]);
      }
    }
  });
});
