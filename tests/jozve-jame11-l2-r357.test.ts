import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r357 — گاردِ «آزمون جامع تشریحی درس دوم» جزوهٔ جامع یازدهم
// ص۷۴-۷۷، کلیدِ چاپیِ ص۱۹۱-۱۹۲ — چهارده سکشن = چهارده بانک (l60..l73):
// ناقص/داده‌شده/حروف‌ناقص/متفاوت/دو MCQ/جمله‌سازی/وند/متضاد/افعال/
// دوکلمه‌ای/اسم‌مصدرِ جدولی/کلوزِ اعتیاد/درک مطلب — ۶۵ آیتم (۴ تایپی + ۸ + …)
// لنگرِ متقابلِ دوطرفه: «پاسخنامه صفحه ۱۹۱ و ۱۹۲» ⇠ «آزمون صفحه ۷۴ تا ۷۷»
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

const byLesson = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const l60 = byLesson(60);
const l61 = byLesson(61);
const l62 = byLesson(62);
const l63 = byLesson(63);
const l64 = byLesson(64);
const l65 = byLesson(65);
const l66 = byLesson(66);
const l67 = byLesson(67);
const l68 = byLesson(68);
const l69 = byLesson(69);
const l70 = byLesson(70);
const l71 = byLesson(71);
const l72 = byLesson(72);
const l73 = byLesson(73);

describe("r357 — receipt: source.g11l2jame", () => {
  it("receipt exists with extractedRound=r357 and 14 printQuirks", () => {
    const rec = bank.source.g11l2jame;
    expect(rec).toBeTruthy();
    expect(rec!.extractedRound).toBe("r357");
    expect(rec!.printQuirks).toHaveLength(14);
  });

  it("receipt records the two-way locator and the scramble family", () => {
    const quirks = bank.source.g11l2jame!.printQuirks!.join(" ");
    expect(quirks).toContain("پاسخنامه صفحه ۱۹۱ و ۱۹۲");
    expect(quirks).toContain("آزمون تش  ییح");
    expect(quirks).toContain("serving");
  });
});

describe("r357 — bank shapes (l60..l73)", () => {
  it("titles, levels, counts (۱۴ سکشنِ چاپی)", () => {
    expect(l60.title).toBe("تشریحی جامع — کلمات ناقص (ص۷۴)");
    expect(l61.title).toBe("تشریحی جامع — کلمات داده‌شده (ص۷۴)");
    expect(l63.title).toBe("تشریحی جامع — گزینهٔ متفاوت (ص۷۴)");
    expect(l66.title).toBe("تشریحی جامع — جمله‌سازی (ص۷۵)");
    expect(l71.title).toBe("تشریحی جامع — اسم مصدر، جدول سه‌ستونه (ص۷۶)");
    expect(l73.title).toBe("تشریحی جامع — درک مطلب تغذیه (ص۷۶-۷۷)");
    expect(l60.level).toBe("تشریحی — تایپی");
    expect(l64.level).toBe("تشریحی — چهارگزینه‌ای");
    expect(l66.level).toBe("تشریحی — جمله‌سازی");
    expect(l73.level).toBe("تشریحی — درست/نادرست و تایپی");
    const counts = [l60, l61, l62, l63, l64, l65, l66, l67, l68, l69, l70, l71, l72, l73].map((l) => l.count);
    expect(counts).toEqual([4, 8, 4, 4, 4, 4, 3, 4, 4, 4, 4, 6, 6, 6]);
  });

  it("ids: g11-l60..l73-N unique across the whole bank — total 1184 items in 94 banks", () => {
    const sizes: Record<number, number> = { 60: 4, 61: 8, 62: 4, 63: 4, 64: 4, 65: 4, 66: 3, 67: 4, 68: 4, 69: 4, 70: 4, 71: 6, 72: 6, 73: 6 };
    for (const les of [l60, l61, l62, l63, l64, l65, l66, l67, l68, l69, l70, l71, l72, l73]) {
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: sizes[les.lesson]! }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(893 + 65 + 61 + 65 + 100); // ۸۹۳ (تا r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359) + ۱۰۰ (r360 — گرامر و نگارش د۳)
    expect(bank.lessons).toHaveLength(94);
  });

  it("file shape: last thirty-five banks are l60..l94 in order (r358 appended l74..l78، r359 appended l79..l92، r360 appended l93..l94)", () => {
    const tail = bank.lessons.slice(-35).map((l) => l.lesson);
    expect(tail).toEqual([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94]);
  });

  it("no stem carries a Persian fragment (سربرگِ سکشن جعلی نمی‌سازد — درسِ r354)", () => {
    const FA = /[\u0600-\u06FF]/;
    for (const les of [l60, l61, l62, l63, l64, l65, l66, l67, l68, l69, l70, l71, l72, l73]) {
      for (const q of les.questions) expect(FA.test(q.question), q.id).toBe(false);
    }
  });
});

describe("r357 — typed purity (l60/l61/l62/l63/l66/l67/l68/l69/l70/l71)", () => {
  it("every typed question keeps accepted=[options[answer]] + placeholder", () => {
    for (const les of [l60, l61, l62, l63, l66, l67, l68, l69, l70, l71]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted, q.id).toEqual([q.options[q.answer]]);
        expect(q.placeholder?.length ?? 0, q.id).toBeGreaterThan(8);
      }
    }
  });

  it("l60 skeleton pattern lock: key fills each __-run with exactly one letter", () => {
    const tokens = ["w__k__s", "infl__en__ed", "c__nditi__n", "h__artb__at"];
    l60.questions.forEach((q, i) => {
      expect(q.question, q.id).toContain(tokens[i]);
      const rx = new RegExp("^" + tokens[i]!.split("__").map((p) => (p === "" ? "" : p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))).join(".{1}") + "$", "i");
      expect(q.accepted![0], q.id).toMatch(rx);
    });
    expect(l60.questions.map((q) => q.accepted![0])).toEqual(["wakes", "influenced", "condition", "heartbeat"]);
  });

  it("l61 word-bank pool in stem [bank: …] with extra «serving» — keys ⊆ pool", () => {
    const pool = ["avoiding", "balanced", "goal", "decreased", "serving", "relationships", "emotional", "heart", "emergency"];
    const keys = l61.questions.map((q) => q.accepted![0]);
    for (const k of keys) expect(pool, k).toContain(k);
    expect(new Set(keys).size).toBe(8);
    const q1 = l61.questions[0];
    expect(q1.question).toContain("[bank: avoiding / balanced / goal / decreased / serving / relationships / emotional / heart / emergency]");
    expect(q1.accepted![0]).toBe("heart");
  });

  it("l62 skeleton runs: first letter + N slots matches the key (after/gained/blood/cure)", () => {
    const expected: [string, string, number][] = [["a", "after", 4], ["g", "gained", 5], ["b", "blood", 4], ["c", "cure", 3]];
    l62.questions.forEach((q, i) => {
      const [first, key, slots] = expected[i]!;
      const rx = new RegExp(`^${first}.{${slots}}$`, "i");
      expect(key, q.id).toMatch(rx);
      expect(q.accepted![0], q.id).toBe(key);
      expect(q.question, q.id).toMatch(new RegExp(`${first}(?: _)+ `));
    });
  });

  it("l63 odd-one-out: options = four printed candidates, key is the odd one", () => {
    const printed: string[][] = [
      ["carrot", "tomato", "banana", "potato"],
      ["meat", "candy", "fish", "chicken"],
      ["unhealthy", "harmful", "not good", "useful"],
      ["sailing", "jogging", "walking", "running"],
    ];
    const keys = ["banana", "candy", "useful", "sailing"];
    l63.questions.forEach((q, i) => {
      expect(q.question, q.id).toBe(printed[i]!.join(" / "));
      expect(q.options, q.id).toEqual(printed[i]!);
      expect(q.accepted![0], q.id).toBe(keys[i]!);
      expect(q.answer, q.id).toBe(printed[i]!.indexOf(keys[i]!));
    });
  });
});

describe("r357 — l64/l65 بهترین گزینه (MCQ ×۴+۴ — نگاشتِ یکتای کلیدِ چاپی)", () => {
  const printedKey64 = ["miracle", "decreases", "minerals", "won"];
  const printedKey65 = ["forgotten", "riding", "believed", "using"];

  it("each printed key text maps to exactly one option letter — 8/8", () => {
    [l64, l65].forEach((les, bi) => {
      const keys = bi === 0 ? printedKey64 : printedKey65;
      les.questions.forEach((q, i) => {
        expect(q.options).toHaveLength(4);
        const hits = q.options.map((o, idx) => (o === keys[i] ? idx : -1)).filter((x) => x >= 0);
        expect(hits, `${q.id} key=${keys[i]!}`).toEqual([q.answer]);
      });
    });
  });

  it("l65 stems keep verbatim dash blanks and grammar category", () => {
    expect(l65.questions[0]!.question).toContain("I’ve ------------------------- it.");
    expect(l64.questions[0]!.category).toBe("vocab");
    expect(l65.questions[0]!.category).toBe("grammar");
  });
});

describe("r357 — l66/l67/l68/l69/l70 قفل‌های تایپی", () => {
  it("l66 sentence-building: printed key sentences verbatim (دوستونیِ کلید به‌درستی شکست)", () => {
    const keys = l66.questions.map((q) => q.accepted![0]);
    expect(keys).toEqual([
      "They have written three letters today.",
      "Smoking is bad for your health.",
      "Has he finished doing his homework?",
    ]);
    expect(l66.questions[2]!.question).toContain("finished?");
    expect(l66.questions.map((q) => q.options[0])).toEqual(keys);
  });

  it("l67 affixes: stem keeps colon + [bank: al / un / or / in]؛ ریشهٔ ۴حرفی + وندِ استخر", () => {
    const stems = ["correct:", "nature:", "translate:", "important:"];
    const keys = ["incorrect", "natural", "translator", "unimportant"];
    l67.questions.forEach((q, i) => {
      expect(q.question, q.id).toBe(`${stems[i]} [bank: al / un / or / in]`);
      expect(q.accepted![0], q.id).toBe(keys[i]);
      expect(q.accepted![0].toLowerCase(), q.id).toContain(stems[i]!.slice(0, 4).toLowerCase());
      const k = q.accepted![0].toLowerCase();
      expect(["al", "un", "or", "in"].some((a) => k.startsWith(a) || k.endsWith(a)), q.id).toBe(true);
    });
  });

  it("l68 synonym/antonym markers (= / ≠) kept verbatim in stems", () => {
    const stems = ["quit =", "prevent =", "turn on ≠", "begin ≠"];
    const keys = ["give up", "stop", "turn off", "finish"];
    l68.questions.forEach((q, i) => {
      expect(q.question, q.id).toBe(stems[i]);
      expect(q.accepted![0], q.id).toBe(keys[i]);
    });
  });

  it("l69 verb forms: parenthetical verb kept, 40-dash blanks merged, radical lock", () => {
    const verbs = ["(play)", "(live)", "(see)", "(travel)"];
    const radicals = ["play", "liv", "see", "trav"];
    l69.questions.forEach((q, i) => {
      expect(q.question, q.id).toContain(verbs[i]);
      expect(q.question, q.id).toMatch(/-{40}/);
      expect(q.question, q.id).not.toMatch(/-\s+-/);
      expect(q.accepted![0].toLowerCase(), q.id).toContain(radicals[i]!);
    });
    expect(l69.questions.map((q) => q.accepted![0])).toEqual(["has played", "living", "have seen", "travelling"]);
  });

  it("l70 two-word verbs: 24-dash blanks, particle scaffold without duplicates", () => {
    l70.questions.forEach((q) => {
      expect(q.question, q.id).toMatch(/-{24}/);
      expect(q.question, q.id).not.toMatch(/-\s+-/);
      expect(new Set(q.options).size, q.id).toBe(q.options.length);
    });
    expect(l70.questions.map((q) => q.accepted![0])).toEqual(["in", "up", "out", "out"]);
    const q2 = l70.questions[1];
    expect(q2!.question).toContain("gave ------------------------.");
  });
});

describe("r357 — l71 اسم مصدر (جدولِ سه‌ستونهٔ کلیدِ ص۱۹۲)", () => {
  it("each sentence contains exactly its printed gerund — سطر-خوانیِ جدول خودتأیید شد", () => {
    const expected: [string, string][] = [
      ["I’m tired of doing the same job, day after day.", "doing"],
      ["Playing chess for two hours made her tired.", "Playing"],
      ["My father enjoys walking in the park.", "walking"],
      ["Travelling by train made us happy last summer.", "Travelling"],
      ["We thanked him for answering our questions.", "answering"],
      ["My sister likes reading story books.", "reading"],
    ];
    l71.questions.forEach((q, i) => {
      const [stem, gerund] = expected[i]!;
      expect(q.question, q.id).toBe(stem);
      expect(q.accepted![0], q.id).toBe(gerund);
      const others = q.options.slice(1);
      expect(new Set(others).size, q.id).toBe(3);
      expect(others, q.id).not.toContain(gerund);
    });
  });
});

describe("r357 — l72 کلوزِ اعتیاد (MCQ ×۶ — بلنکِ شماره‌دارِ ---(N)---)", () => {
  const printedKeyTexts = ["badly", "called", "sick", "hurt", "cure", "habit"];

  it("each printed key text maps to exactly one option letter — 6/6", () => {
    l72.questions.forEach((q, i) => {
      expect(q.options).toHaveLength(4);
      const hits = q.options.map((o, idx) => (o === printedKeyTexts[i] ? idx : -1)).filter((x) => x >= 0);
      expect(hits, `${q.id} key=${printedKeyTexts[i]!}`).toEqual([q.answer]);
      expect(q.question, q.id).toMatch(new RegExp(`---\\(${i + 1}\\)---`));
    });
  });

  it("passage sentences: addiction cloze context locked", () => {
    expect(l72.questions[0]!.question).toContain("Addiction is when the body or mind");
    expect(l72.questions[5]!.question).toContain("of enjoying that thing");
  });
});

describe("r357 — l73 درک مطلب تغذیه (۴ T/F + ۲ تایپی)", () => {
  it("T/F: options=[\"True\",\"False\"]، کلیدِ چاپی true/false/true/false", () => {
    expect(l73.questions.slice(0, 4).map((q) => q.answer)).toEqual([0, 1, 0, 1]);
    for (const q of l73.questions.slice(0, 4)) {
      expect(q.options).toEqual(["True", "False"]);
      expect(q.question, q.id).not.toMatch(/\(\s*True or False\s*\)$/);
    }
    expect(l73.questions[0]!.question).toContain("Fruits often have more calories and sugar than vegetables.");
  });

  it("typed Q5/Q6: printed key answers verbatim from the passage", () => {
    const q5 = l73.questions[4]!;
    const q6 = l73.questions[5]!;
    expect(q5.kind).toBe("typed");
    expect(q5.question).toBe("What do grains give our bodies?");
    expect(q5.accepted![0]).toBe("Grains give carbohydrates and some vitamins and minerals.");
    expect(q6.kind).toBe("typed");
    expect(q6.question).toBe("What is a food pyramid?");
    expect(q6.accepted![0]).toContain("chart that can be used to see how many servings of each food should be eaten each day");
  });
});
