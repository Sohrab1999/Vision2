/**
 * r370 — گاردِ «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس اول (pdf-p50) + درس دوم (pdf-p56)
 * → نخستین فایلِ تستِ پایهٔ هفتم (tests-g7.json) — ۴ بانک/۲۰ آیتم از ۱۰ سکشنِ دو خانواده
 *
 * نکتهٔ زیرساختیِ راند: سکشنِ «شکل کوچک و بزرگ حروف» به‌جایِ تایپی، MCQ دوگزینه‌ای است —
 * موتورِ پاسخِ تایپی case-insensitive است (src/lib/typed-answer.ts → normalizeTypedAnswer
 * با toLowerCase) و تبدیلِ حروف را سنجش‌ناپذیر می‌کند. گزینهٔ دومِ هر آیتم = خودِ حرفِ چاپی
 * (تلهٔ همان‌حرفی‌نوشتن) با چینشِ یک‌درمیان. هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست — کلیدها
 * استنتاجیِ مستند (رسید g7exam1/g7exam2)؛ نقشهٔ ۸ خانوادهٔ g7 در رسیدِ g7familyMap.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

type Q = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string; keyWhy?: string;
};
type Bank = { lesson: number; title: string; level?: string; count: number; questions: Q[] };
type Doc = { grade: number; title: string; lessons: Bank[]; source: Record<string, Record<string, unknown>> };

const g7 = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/jozve/tests-g7.json"), "utf-8"),
) as Doc;

const L = (n: number) => {
  const b = g7.lessons.find((x) => x.lesson === n);
  expect(b, `bank g7-l${n} missing`).toBeDefined();
  return b as Bank;
};
const q = (bn: number, n: number) => L(bn).questions[n - 1];

const rec1 = g7.source.g7exam1 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number;
  items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; skippedSections: string[]; printQuirks: string[];
};
const rec2 = g7.source.g7exam2 as typeof rec1 & {
  wordBank: string[]; extraWords: string[];
};
const map = g7.source.g7familyMap as {
  extractedRound: string; note: string;
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
  g8Note: string;
};

describe("r370 — رسیدهای g7exam1 / g7exam2 / g7familyMap", () => {
  it("receipt1: خانوادهٔ درس اول — ۵ سکشن، ۲ بانک/۱۲ آیتم", () => {
    expect(rec1.extractedRound).toBe("r370");
    expect(rec1.section).toContain("درس اول");
    expect(rec1.examPages).toContain("pdf-p50");
    expect(rec1.keyPages).toContain("هیچ پاسخنامهٔ چاپی");
    expect(rec1.sectionsTotal).toBe(5);
    expect(rec1.sectionsExtracted).toBe(2);
    expect(rec1.sectionsSkipped).toBe(3);
    expect(rec1.items).toBe(12);
    expect(rec1.bankCounts).toEqual([11, 1]);
    expect(rec1.derivedKeys.S1).toHaveLength(11);
    expect(rec1.derivedKeys.S3[0]).toContain("book");
  });

  it("receipt1: engineNote — چراییِ MCQ به‌جایِ تایپی (case-insensitive)", () => {
    expect(rec1.engineNote).toContain("case-insensitive");
    expect(rec1.engineNote).toContain("typed-answer.ts");
    expect(rec1.engineNote).toContain("همان‌حرفی‌نوشتن");
    // سه بندِ مستثنیِ خانوادهٔ ۱: س۲/س۴/س۵
    expect(rec1.skippedSections).toHaveLength(3);
    expect(rec1.skippedSections.some((s) => s.startsWith("س۲"))).toBe(true);
    expect(rec1.skippedSections.some((s) => s.includes("تولیدِ آزاد"))).toBe(true);
    expect(rec1.skippedSections.some((s) => s.startsWith("س۵"))).toBe(true);
  });

  it("receipt2: خانوادهٔ درس دوم — ۵ سکشن، ۲ بانک/۸ آیتم + اضافیِ Hello.", () => {
    expect(rec2.extractedRound).toBe("r370");
    expect(rec2.section).toContain("درس دوم");
    expect(rec2.examPages).toContain("pdf-p56");
    expect(rec2.sectionsTotal).toBe(5);
    expect(rec2.sectionsExtracted).toBe(2);
    expect(rec2.items).toBe(8);
    expect(rec2.bankCounts).toEqual([3, 5]);
    expect(rec2.wordBank).toEqual(["morning.", "Thanks.", "is Majidi.", "your name?", "Hello.", "Ali Karimi."]);
    expect(rec2.extraWords).toEqual(["Hello."]);
    // ردیفِ ۴ حذفِ آیتمی: نقصِ چاپ (چیپ‌ها = کپیِ ردیفِ ۱)
    expect(rec2.skippedSections.some((s) => s.includes("ردیفِ ۴"))).toBe(true);
    expect(rec2.printQuirks.some((s) => s.includes("کپیِ ردیفِ ۱"))).toBe(true);
    expect(rec2.printQuirks.some((s) => s.includes("فقط در رندرند"))).toBe(true);
  });

  it("receiptMap: نقشهٔ ۸ خانوادهٔ g7 + دو خانوادهٔ r370 + یادداشتِ g8", () => {
    expect(map.families).toHaveLength(8);
    expect(map.families.map((f) => f.pdfPage)).toEqual([50, 56, 65, 74, 84, 90, 97, 103]);
    expect(map.families.filter((f) => f.round === "r370")).toHaveLength(2);
    expect(map.families.filter((f) => f.round === null)).toHaveLength(6);
    expect(map.g8Note).toContain("۷ خانواده");
    expect(map.note).toContain("دوخطی");
  });
});

describe("r370 — شکلِ فایلِ tests-g7.json", () => {
  it("file shape: grade 7، چهار بانک، شمارها [11,1,3,5]، ۲۰ آیتمِ یکتا", () => {
    expect(g7.grade).toBe(7);
    expect(g7.lessons).toHaveLength(4);
    expect(g7.lessons.map((l) => l.count)).toEqual([11, 1, 3, 5]);
    const ids = g7.lessons.flatMap((l) => l.questions.map((x) => x.id));
    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    expect(ids[0]).toBe("g7-l1-1");
    expect(ids[11]).toBe("g7-l2-1");
    expect(ids[12]).toBe("g7-l3-1");
    expect(ids[15]).toBe("g7-l4-1");
  });

  it("بدونِ آیتمِ تایپی در کلِ g7 — سکشنِ حروف عمداً MCQ است (engineNote)", () => {
    for (const b of g7.lessons)
      for (const it of b.questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length).toBeGreaterThanOrEqual(2); // قراردادِ r363 در g7 هم
      }
  });

  it("خلوصِ لاتین: ساقه‌ها و گزینه‌های هر چهار بانک (→ = پیکانِ پرامپتِ مجاز)", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    for (const b of g7.lessons)
      for (const it of b.questions) {
        expect(latinPunct.test(it.question), `question of ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
      }
  });
});

describe("r370 — بانکِ ۱: شکل کوچک و بزرگ حروف (س۱، ص۵۰)", () => {
  const PRINT_ROW = ["A", "b", "K", "q", "R", "m", "X", "o", "D", "v", "G"];

  it("۱۱ آیتم — ساقه‌ها عینِ ردیفِ چاپی و گزینه‌ها جفتِ caseِ همان حرف", () => {
    const bank = L(1);
    expect(bank.questions).toHaveLength(11);
    bank.questions.forEach((it, i) => {
      const printed = PRINT_ROW[i];
      expect(it.question, `stem ${it.id}`).toBe(`${printed} → -------`);
      expect(it.options).toHaveLength(2);
      const [o1, o2] = it.options;
      // هر دو گزینه شکل‌هایِ کوچک/بزرگِ همان حرف‌اند (بدونِ حرفِ بیگانه)
      expect(o1.toLowerCase()).toBe(printed.toLowerCase());
      expect(o2.toLowerCase()).toBe(printed.toLowerCase());
      expect(o1).not.toBe(o2);
    });
  });

  it("کلید = شکلِ دیگرِ حرفِ چاپی؛ چینشِ یک‌درمیان (فرد 0/زوج 1)", () => {
    L(1).questions.forEach((it, i) => {
      const printed = PRINT_ROW[i];
      const target = printed === printed.toLowerCase() ? printed.toUpperCase() : printed.toLowerCase();
      const n = i + 1;
      expect(it.answer).toBe(n % 2 === 1 ? 0 : 1);
      expect(it.options[it.answer]).toBe(target);
      // گزینهٔ دیگر = خودِ حرفِ چاپی (تلهٔ همان‌حرفی‌نوشتن)
      expect(it.options[1 - it.answer]).toBe(printed);
    });
  });
});

describe("r370 — بانکِ ۲: کلمهٔ ناهماهنگ (س۳، ص۵۰)", () => {
  it("چهارگزینه‌ایِ چاپی green/blue/black/book → book (اندیسِ ۳)", () => {
    const it = q(2, 1);
    expect(it.question).toBe("green – blue – black – book");
    expect(it.options).toEqual(["green", "blue", "black", "book"]);
    expect(it.answer).toBe(3);
    expect(it.options[it.answer]).toBe("book");
  });
});

describe("r370 — بانکِ ۳: نام‌سازی از حروفِ داده‌شده (س۲، ص۵۶)", () => {
  it("سه آیتم — حروفِ چیپ‌ها verbatim در ساقه", () => {
    expect(q(3, 1).question).toBe("a n a h m → ?");
    expect(q(3, 2).question).toBe("a b a r k → ?");
    expect(q(3, 3).question).toBe("n a o m → ?");
    expect(q(3, 1).options).toEqual(["Mahsa", "Mahin", "Mahan"]);
    expect(q(3, 2).options).toEqual(["Arash", "Armin", "Akbar"]);
    expect(q(3, 3).options).toEqual(["Mina", "Mona", "Amin"]);
  });

  it("کلیدِ آنگرام با چندمجموعهٔ حروف: کلید دقیقاً از ساقه ساخته می‌شود، دیگران نه", () => {
    const multiset = (s: string) =>
      [...s.replace(/\s/g, "").toLowerCase()].sort().join("");
    for (const n of [1, 2, 3]) {
      const it = q(3, n);
      const letters = multiset(it.question.replace("→ ?", "").trim());
      it.options.forEach((name, idx) => {
        if (idx === it.answer) expect(multiset(name), `${it.id} key`).toBe(letters);
        else expect(multiset(name), `${it.id} distractor ${name}`).not.toBe(letters);
      });
    }
  });
});

describe("r370 — بانکِ ۴: وصل‌کردنیِ پایانِ جمله (س۵، ص۵۶)", () => {
  it("پنج ساقه با شش گزینهٔ مشترکِ چاپی — عینِ ستونِ راست", () => {
    const bank = L(4);
    expect(bank.questions).toHaveLength(5);
    for (const it of bank.questions) {
      expect(it.options).toEqual(["morning.", "Thanks.", "is Majidi.", "your name?", "Hello.", "Ali Karimi."]);
      expect(it.question.endsWith("( ------- )")).toBe(true);
    }
  });

  it("کلیدها [5,3,1,0,2] — جفتِ یکتا؛ «Hello.» اضافیِ چاپی هرگز کلید نیست", () => {
    const bank = L(4);
    const expected: [string, number][] = [
      ["My name is ……. .", 5],
      ["What's ……… .", 3],
      ["Fine, ……", 1],
      ["Good ……. .", 0],
      ["My last name ……. .", 2],
    ];
    bank.questions.forEach((it, i) => {
      expect(it.question.startsWith(expected[i][0])).toBe(true);
      expect(it.answer).toBe(expected[i][1]);
    });
    const keyed = bank.questions.map((it) => it.options[it.answer]);
    expect(new Set(keyed).size).toBe(5); // نگاشتِ یک‌به‌یک
    for (const it of bank.questions) expect(it.options[it.answer]).not.toBe("Hello.");
    // آپاستروفِ چاپ: راست‌ساده (') — verbatim در ساقهٔ ق۲
    expect(q(4, 2).question).toContain("What's");
  });
});
