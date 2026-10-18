import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r356 — گاردِ «آزمون تشریحی گرامر درس دوم» جزوهٔ جامع یازدهم
// ص۶۳-۶۴، کلیدِ چاپیِ ص۱۸۷ — چهار سکشن = چهار بانک (l56..l59):
// since/for (۱۰ تایپی) / پرانتزی (۱۲ تایپی) / شکلِ افعال (۱۲ تایپی) /
// بهترین گزینه (۲۰ MCQ) — ۵۴ آیتم؛ دو دوبلانکیِ ترتیب‌دار (s1-Q1، s2-Q7)
// + دو دوبلانکیِ MCQ (Q9/Q13)
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

const byLesson = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const l56 = byLesson(56);
const l57 = byLesson(57);
const l58 = byLesson(58);
const l59 = byLesson(59);

describe("r356 — receipt: source.g11l2gtash", () => {
  it("receipt exists with extractedRound=r356 and 12 printQuirks", () => {
    const rec = bank.source.g11l2gtash;
    expect(rec).toBeTruthy();
    expect(rec!.extractedRound).toBe("r356");
    expect(rec!.printQuirks).toHaveLength(12);
  });

  it("receipt records the exam-header key locator «پاسخنامه صفحه ۱۸۷» and the scramble family", () => {
    const quirks = bank.source.g11l2gtash!.printQuirks!.join(" ");
    expect(quirks).toContain("پاسخنامه صفحه ۱۸۷");
    expect(quirks).toContain("آزمون تش  ییح");
    expect(quirks).toContain("has you been");
  });
});

describe("r356 — bank shapes (l56..l59)", () => {
  it("titles, levels, counts (۴ سکشنِ چاپی)", () => {
    expect(l56.title).toBe("تشریحی گرامر د۲ — جاهای خالی با since یا for (ص۶۳)");
    expect(l57.title).toBe("تشریحی گرامر د۲ — گزینهٔ صحیح پرانتزی (ص۶۳)");
    expect(l58.title).toBe("تشریحی گرامر د۲ — شکل صحیح افعال (ص۶۳)");
    expect(l59.title).toBe("تشریحی گرامر د۲ — تست چهارگزینه‌ای (ص۶۴)");
    expect(l56.level).toBe("تشریحی — تایپی");
    expect(l57.level).toBe("تشریحی — تایپی");
    expect(l58.level).toBe("تشریحی — تایپی");
    expect(l59.level).toBe("تشریحی — چهارگزینه‌ای");
    expect([l56.count, l57.count, l58.count, l59.count]).toEqual([10, 12, 12, 20]);
  });

  it("ids: g11-l56..l59-N unique across the whole bank — total 1084 items in 92 banks", () => {
    const sizes = [10, 12, 12, 20];
    for (const les of [l56, l57, l58, l59]) {
      const size = sizes[les.lesson - 56];
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: size }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(839 + 54 + 65 + 61 + 65); // ۸۳۹ (تا r355) + ۵۴ (r356) + ۶۵ (r357) + ۶۱ (r358) + ۶۵ (r359 — جامع تشریحی د۳)
    expect(bank.lessons).toHaveLength(92);
  });

  it("file shape: last thirty-seven banks are l56..l92 in order (r357 appended l60..l73، r358 appended l74..l78، r359 appended l79..l92)", () => {
    const tail = bank.lessons.slice(-37).map((l) => l.lesson);
    expect(tail).toEqual([56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]);
  });

  it("all questions are grammar-categorized", () => {
    for (const les of [l56, l57, l58, l59]) {
      for (const q of les.questions) expect(q.category).toBe("grammar");
    }
  });
});

describe("r356 — typed purity (l56/l57/l58)", () => {
  it("every typed question keeps accepted=[options[answer]] + placeholder", () => {
    for (const les of [l56, l57, l58]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted, q.id).toEqual([q.options[q.answer]]);
        expect(q.placeholder?.length ?? 0, q.id).toBeGreaterThan(8);
      }
    }
  });
});

describe("r356 — l56 since/for (کلیدِ چاپیِ ص۱۸۷ سکشن۱)", () => {
  it("printed key sequence locked verbatim: for / since, for, for, since, since, for, since, for, since, for", () => {
    const keys = l56.questions.map((q) => q.accepted![0]);
    expect(keys).toEqual([
      "for / since", "for", "for", "since", "since",
      "for", "since", "for", "since", "for",
    ]);
  });

  it("Q1 double-blank ordered key + two 24-dash blanks in the stem", () => {
    const q1 = l56.questions[0];
    expect(q1.accepted).toEqual(["for / since"]);
    expect(q1.options).toEqual(["for / since", "since / for"]);
    const blanks = q1.question.match(/-{24}/g) ?? [];
    expect(blanks).toHaveLength(2);
    expect(q1.question).toContain("a long time.");
    expect(q1.question).toContain("January.");
  });

  it("Q8 broken dash-run merged into one 24-dash blank («15 years.»)", () => {
    const q8 = l56.questions[7];
    const blanks = q8.question.match(/-{24}/g) ?? [];
    expect(blanks).toHaveLength(1);
    expect(q8.question).toContain("15 years.");
    expect(q8.question).not.toMatch(/-\s+-/);
  });

  it("every stem has exactly the right blank count (Q1:2، بقیه:۱)", () => {
    for (const q of l56.questions) {
      const blanks = q.question.match(/-{24}/g) ?? [];
      expect(blanks, q.id).toHaveLength(q.n === 1 ? 2 : 1);
    }
  });
});

describe("r356 — l57 پرانتزی (کلید ∈ دو نامزدِ چاپی)", () => {
  it("single-paren items: accepted key is one of the two printed candidates", () => {
    const printedPairs: Record<number, [string, string]> = {
      1: ["went", "has gone"],
      2: ["have bought", "has bought"],
      3: ["took", "have taken"],
      4: ["has bought", "have bought"],
      5: ["will eat", "has eaten"],
      6: ["do you live", "have you lived"],
      8: ["didn’t see", "hasn’t seen"],
      9: ["hasn’t called", "didn’t call"],
      10: ["had", "have had"],
      11: ["are", "been"],
      12: ["ate", "has eaten"],
    };
    for (const [n, cands] of Object.entries(printedPairs)) {
      const q = l57.questions[Number(n) - 1];
      expect(cands, q.id).toContain(q.accepted![0]);
      expect(q.options, q.id).toEqual(cands);
      expect(q.question, q.id).toContain(`(${cands[0]} / ${cands[1]})`);
    }
  });

  it("Q7 double-paren: same printed pair twice, ordered key «is / has been»", () => {
    const q7 = l57.questions[6];
    expect(q7.accepted).toEqual(["is / has been"]);
    expect(q7.options).toEqual(["is / has been", "has been / is"]);
    expect((q7.question.match(/\(is \/ has been\)/g) ?? []).length).toBe(2);
    expect(q7.question).toContain("in Yazd right now.");
    expect(q7.question).toContain("for two weeks.");
  });
});

describe("r356 — l58 شکلِ افعال (قفلِ رادیکال + داربستِ چهارگزینه‌ای)", () => {
  it("stems keep the printed parenthetical verbs and 40-dash blanks", () => {
    const verbs = ["(not play)", "(lose)", "(not answer)", "(not have)", "(visit)", "(repair)", "(ask)", "(live)", "(win)", "(spend)", "(never drive)", "(prevent)"];
    l58.questions.forEach((q, i) => {
      expect(q.question, q.id).toContain(verbs[i]);
      expect(q.question, q.id).toMatch(/-{40}/);
      expect(q.question, q.id).not.toMatch(/-\s+-/);
    });
  });

  it("radical of the parenthetical verb appears in the printed key (win→won بی‌قاعده)", () => {
    const radicals = ["pl", "lo", "ans", "ha", "vi", "rep", "as", "li", "wo", "sp", "dr", "pr"];
    l58.questions.forEach((q, i) => {
      expect(q.accepted![0].toLowerCase(), q.id).toContain(radicals[i]);
    });
  });

  it("scaffold options = own key + three sibling keys of the same section", () => {
    const keys = l58.questions.map((q) => q.accepted![0]);
    for (const q of l58.questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options[0]).toBe(q.accepted![0]);
      const others = q.options.slice(1);
      expect(new Set(others).size).toBe(3);
      for (const o of others) expect(keys).toContain(o);
    }
    expect(new Set(keys).size).toBe(12);
  });
});

describe("r356 — l59 بهترین گزینه (MCQ ×۲۰ — نگاشتِ یکتای کلیدِ چاپی)", () => {
  const printedKeyTexts = [
    "has had", "has sailed", "gave up", "hasn’t stopped", "wanted",
    "haven’t eaten", "were you late", "been", "has / won", "have never seen",
    "have had", "came back", "have / learnt", "swum", "haven’t worn",
    "spoke", "hasn’t finished", "saw", "has happened", "hasn’t done",
  ];

  it("each printed key text maps to exactly one option letter — 20/20", () => {
    l59.questions.forEach((q, i) => {
      expect(q.options).toHaveLength(4);
      const hits = q.options.map((o, idx) => (norm(o) === norm(printedKeyTexts[i]) ? idx : -1)).filter((x) => x >= 0);
      expect(hits, `Q${i + 1} key=${printedKeyTexts[i]!}`).toEqual([q.answer]);
    });
  });

  it("Q9/Q13 two-blank MCQs: pair-shaped printed options («has / won»، «have / learnt»)", () => {
    const q9 = l59.questions[8];
    const q13 = l59.questions[12];
    expect(q9.question.match(/-{20}/g) ?? []).toHaveLength(2);
    expect(q9.question).toContain("World Cup");
    expect(q9.options[1]).toBe("has / won");
    expect(q13.question.match(/-{20}/g) ?? []).toHaveLength(2);
    expect(q13.question).toContain("never");
    expect(q13.options[3]).toBe("have / learnt");
  });

  it("verbatim print quirks locked: «has you been» (Q7-d) و نقطهٔ چاپیِ Q16-A", () => {
    const q7 = l59.questions[6];
    expect(q7.options[3]).toBe("has you been");
    expect(q7.options).toEqual(["were you late", "have you been", "are you late", "has you been"]);
    const q16 = l59.questions[15];
    expect(q16.question).toContain("A: Have you ever spoken to him. B:");
  });

  it("no stem carries a Persian fragment (سربرگِ سکشن جعلی نمی‌سازد — درسِ r354)", () => {
    const FA = /[\u0600-\u06FF]/;
    for (const les of [l56, l57, l58, l59]) {
      for (const q of les.questions) expect(FA.test(q.question), q.id).toBe(false);
    }
  });
});
