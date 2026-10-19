/**
 * r374 — گاردِ نخستین کارتِ تستِ پایهٔ هشتم: «نمونه سؤالات امتحانی درس اول» (pdf-p18)
 * → tests-g8.jsonِ تازه با ۳ بانک/۱۰ آیتم (هشتمین کارتِ جزوه؛ سومین پایهٔ غیرِ ۱۰-۱۲)
 *
 * نکاتِ زیرساختیِ راند: (۱) بانکِ ۲ دومین بانکِ «دواضعیِ» کارت‌هاست — ۵ واژه برای ۳ بلنک با
 * دستورِ چاپیِ «دو کلمه اضافی است»؛ cousin/british هرگز-کلید؛ «alittle»/«Beautiful»/«british»
 * verbatimِ چاپ. (۲) بانکِ ۳ ساقهٔ فارسیِ سلول‌های جدولِ چاپیِ س۵ دارد (الگویِ r372-بانک‌های
 * ۱۳/۱۴) — کلیدهای قاره/کشوری زیبا لنگردارِ درسِ اول (continent* جدولِ واژگان؛ It’s a beautiful
 * country دیالوگ) و «سال» به الگویِ کلیدِ ترجمه‌ایِ یکتای r371-جمعه→Friday. (۳) ساقه‌های س۲/س۳
 * از لایه استخراج شدند — گارد همان را بازتولید می‌کند (ضدِ رونویسی). (۴) خلوصِ لاتین: بانکِ ۳
 * ساقهٔ فارسی دارد — گاردِ خودش options را جدا بررسید می‌کند (سابقهٔ r371-بانک۸).
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

type Q = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[];
};
type Bank = { lesson: number; title: string; level?: string; count: number; questions: Q[] };
type Doc = { grade: number; title: string; lessons: Bank[]; source: Record<string, Record<string, unknown>> };

const g8 = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/jozve/tests-g8.json"), "utf-8"),
) as Doc;

const L = (n: number) => {
  const b = g8.lessons.find((x) => x.lesson === n);
  expect(b, `bank g8-l${n} missing`).toBeDefined();
  return b as Bank;
};
const keyed = (bn: number) => L(bn).questions.map((it) => it.options[it.answer]);

const rec = g8.source.g8exam1 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number;
  items: number; bankCounts: number[]; wordBank: string[]; wordBankSource: string;
  keyPolicy: string; engineNote: string; derivedKeys: Record<string, string[]>;
  skippedSections: string[]; printQuirks: string[];
};
const map = g8.source.g8familyMap as {
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
  note: string;
};

// ————— بازتولیدِ ساقه‌ها از لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r374) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g8.txt"), "utf-8").split("\n");
const p18Start = layer.findIndex((l) => l.trim() === "<<<PAGE 18>>>");
const p18End = layer.findIndex((l, i) => i > p18Start && l.trim().startsWith("<<<PAGE"));
const p18 = layer.slice(p18Start, p18End);
const head = layer.slice(0, p18Start).join("\n");

const norm = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[….]{3,}/g, "-------")
    .replace(/-------(?=[A-Za-z])/g, "------- ");

const rowsFromLayer = p18
  .filter((l) => /^(Indonesia|Australia|Asia|Chinese)\b/.test(l.trim()))
  .map((l) => norm(l.trim().split(/\s{2,}/)[0]).replace(" - ", " – "));
const bankFromLayer = p18
  .map((l) => /\(([^)]*Beautiful[^)]*)\)/.exec(l))
  .filter(Boolean)
  .map((m) => m![1].split("–").map((w) => w.trim()));
const stemsFromLayer: Record<string, string> = {};
for (const line of p18) {
  const m = /^([1-3])\.\s*(.+?)\s*$/.exec(line.trim());
  if (m && line.includes("…")) stemsFromLayer[m[1]] = norm(`${m[1]}. ${m[2]}`);
}

describe("r374 — رسیدِ g8exam1 + نقشهٔ g8familyMap", () => {
  it("رسید: ۵ سکشن → ۳ استخراج/۲ مستثنی، ۱۰ آیتم در [4,3,3]، بانکِ ۵واژه‌ایِ دواضعی", () => {
    expect(rec.extractedRound).toBe("r374");
    expect(rec.examPages).toContain("pdf-p18");
    expect(rec.sectionsTotal).toBe(5);
    expect(rec.sectionsExtracted).toBe(3);
    expect(rec.sectionsSkipped).toBe(2);
    expect(rec.items).toBe(10);
    expect(rec.bankCounts).toEqual([4, 3, 3]);
    expect(rec.wordBank).toEqual(["Beautiful", "alittle", "cousin", "originally", "british"]);
    expect(rec.wordBankSource).toContain("دو کلمه اضافی");
    expect(rec.keyPolicy).toContain("r371");
    expect(rec.engineNote).toContain("r372");
    expect(rec.derivedKeys.S2).toEqual(["Spanish", "Europe", "china", "Britain"]);
    expect(rec.derivedKeys.S3).toEqual(["alittle", "originally", "Beautiful"]);
    expect(rec.derivedKeys.S5).toEqual(["continent", "a beautiful country", "year"]);
    expect(rec.skippedSections).toHaveLength(2);
    expect(rec.skippedSections[0]).toContain("I am from Iran");
    expect(rec.skippedSections[1]).toContain("ص");
    expect(rec.skippedSections[1]).toContain("غ");
    expect(rec.printQuirks.some((s) => s.includes("alittle"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("china"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("از دیدن شما خوشحالم"))).toBe(true);
  });

  it("نقشهٔ ۷ خانوادهٔ g8 — r374=۱ و null=۶ (pdf-p18/27/35/41/50/60/72)", () => {
    expect(map.families).toHaveLength(7);
    expect(map.families.map((f) => f.pdfPage)).toEqual([18, 27, 35, 41, 50, 60, 72]);
    expect(map.families.filter((f) => f.round === "r374")).toHaveLength(1);
    expect(map.families.filter((f) => f.round === null)).toHaveLength(6);
    expect(map.families[0].status).toContain("۳ بانک/۱۰ آیتم");
    expect(map.note).toContain("r369");
  });

  it("بازتولیدِ لایه: بانکِ چاپی، ساقه‌های شماره‌دار و لنگرهای درسِ اول (ضدِ رونویسی)", () => {
    expect(bankFromLayer[0]).toEqual(["Beautiful", "alittle", "cousin", "originally", "british"]);
    expect(Object.keys(stemsFromLayer).sort()).toEqual(["1", "2", "3"]);
    expect(stemsFromLayer["1"]).toContain("I speak French, English and ------- Persian.");
    expect(stemsFromLayer["2"]).toContain("I am ------- Australian but I live in England.");
    expect(stemsFromLayer["3"]).toContain("Spain is a ------- country. I love it.");
    expect(rowsFromLayer).toHaveLength(4);
    expect(rowsFromLayer[1]).toContain("china");
    expect(head).toMatch(/continent\*/);
    expect(head).toMatch(/It’s a beautiful country\./);
  });
});

describe("r374 — بانکِ ۱: خ۱/س۲ ناهماهنگ (چهارگزینه‌ای)", () => {
  it("ردیف‌های چاپی verbatim (china کوچک)؛ گزینه‌ها به ترتیبِ ردیف؛ کلیدها [3,2,2,2]", () => {
    const bank = L(1);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "Indonesia – Iraq – Egypt – Spanish",
      "Australia – china – Europe – Italy",
      "Asia – Europe – china – Africa",
      "Chinese – French – Britain – Brazilian",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([3, 2, 2, 2]);
    expect(keyed(1)).toEqual(["Spanish", "Europe", "china", "Britain"]);
    bank.questions.forEach((it) => {
      expect(it.options).toHaveLength(4);
      expect(it.question.split(" – ")).toEqual([...it.options]);
    });
  });

  it("کلیدِ دسته‌ای: زبان در برابر کشور، قاره در برابر کشور، کشور در برابر قاره، کشور در برابر زبان/ملیت", () => {
    expect(keyed(1)).toEqual(["Spanish", "Europe", "china", "Britain"]);
  });
});

describe("r374 — بانکِ ۲: خ۱/س۳ تکمیل با بانکِ دواضعی (پنج‌گزینه‌ای)", () => {
  const B2 = ["Beautiful", "alittle", "cousin", "originally", "british"];

  it("ساقه‌های شماره‌دارِ چاپ verbatim؛ هر گزینه‌مجموعه جای‌بهجاییِ کاملِ بانک؛ کلیدها [2,4,1]", () => {
    const bank = L(2);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "1. I speak French, English and ------- Persian.",
      "2. I am ------- Australian but I live in England.",
      "3. Spain is a ------- country. I love it.",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([2, 4, 1]);
    expect(keyed(2)).toEqual(["alittle", "originally", "Beautiful"]);
    for (const it of bank.questions) {
      expect([...it.options].sort()).toEqual([...B2].sort());
    }
  });

  it("هرگز-کلیدهای دوگانه: cousin و british (اضافی‌های چاپی) پاسخِ هیچ آیتمی نیستند", () => {
    for (const it of L(2).questions) {
      expect(it.options).toContain("cousin");
      expect(it.options).toContain("british");
      expect(it.options[it.answer], `${it.id} never-key`).not.toBe("cousin");
      expect(it.options[it.answer], `${it.id} never-key`).not.toBe("british");
    }
  });
});

describe("r374 — بانکِ ۳: خ۱/س۵ ترجمهٔ جدول (چهارگزینه‌ایِ ساقه‌فارسی)", () => {
  it("ساقه‌های فارسیِ سلول‌های چاپی؛ کلیدها [1,0,2] = continent/a beautiful country/year", () => {
    const bank = L(3);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "قاره به انگلیسی: -------",
      "کشوری زیبا به انگلیسی: -------",
      "سال به انگلیسی: -------",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([1, 0, 2]);
    expect(keyed(3)).toEqual(["continent", "a beautiful country", "year"]);
    for (const it of bank.questions) expect(it.options).toHaveLength(4);
  });

  it("ساقه‌ها فارسی‌اند ولی گزینه‌ها لاتینِ خالص (الگویِ r372-بانک‌های ۱۳/۱۴)", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    for (const it of L(3).questions) {
      expect(it.question).toContain("به انگلیسی: -------");
      for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
    }
  });
});

describe("r374 — پیمان‌های سراسریِ فایلِ تازه", () => {
  it("file shape: grade 8، سه بانک، شمارها [4,3,3]، ۱۰ آیتمِ یکتا با الگویِ g8-l1..3", () => {
    expect(g8.grade).toBe(8);
    expect(g8.title).toContain("پایه هشتم");
    expect(g8.lessons).toHaveLength(3);
    expect(g8.lessons.map((l) => l.count)).toEqual([4, 3, 3]);
    const ids = g8.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    expect(ids[0]).toBe("g8-l1-1");
    expect(ids[4]).toBe("g8-l2-1");
    expect(ids[7]).toBe("g8-l3-1");
    for (const b of g8.lessons) expect(b.count).toBe(b.questions.length);
  });

  it("بدونِ آیتمِ تایپی در کلِ g8 (قراردادِ r363)", () => {
    for (const b of g8.lessons)
      for (const it of b.questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length).toBeGreaterThanOrEqual(2);
      }
  });

  it("خلوصِ لاتینِ بانک‌های ۱/۲ — بانکِ ۳ (ساقهٔ فارسیِ چاپ) تنها استثناست", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    for (const b of g8.lessons.filter((x) => x.lesson !== 3))
      for (const it of b.questions) {
        expect(latinPunct.test(it.question), `question of ${it.id}: ${it.question}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
      }
  });

  it("هیچ آیتمی از سکشن‌های مستثنی (تصویری) نشت نکرده است", () => {
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const forbidden of [
      "I am from", // س۱ — نقشهٔ ایران (تصویری)
      "She is from England", "They are French", "Are they British", "Are you from Spain", // س۴ (تصویری)
      "Nice to see", "Glad to see", "Pleased to meet", // س۵-آیتم۴ (دوکلیدیِ ترجمه‌ای)
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });
});
