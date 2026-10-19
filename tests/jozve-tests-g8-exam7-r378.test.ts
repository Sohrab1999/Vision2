/**
 * r378 — گاردِ خانوادهٔ پایانیِ کارتِ تستِ پایهٔ هشتم:
 * «نمونه سؤالات امتحانی درس هفتم» (pdf-p72) → ۱ بانکِ تازه/۶ آیتم در tests-g8.json
 * (مجموع: ۱۶ بانک/۵۲ آیتم — نقشهٔ g8familyMap اکنون ۷/۷)
 *
 * نکاتِ راند: (۱) بانکِ ۱۶ جدولِ ترجمهٔ دوطرفهٔ س۲ دوم است (رندر: shopping | searching |
 * reading | شعر | مجله | باشگاه) با گزینه‌های هم‌جدولی (الگویِ r374-بانک۳) — ساقه‌های
 * فارسی‌به‌انگلیسی «X به انگلیسی: -------» و انگلیسی‌به‌فارسی «X به فارسی: -------».
 * gym در جدولِ واژگانِ ص۶۱ نیست و از دیالوگِ چاپیِ ص۶۲ «But I usually go to the gym in
 * my free time.» لنگر می‌گیرد. (۲) سکشن‌های ۱ و ۲ تصویری‌اند (۶+۴ تصویر) و با داوریِ
 * کاملِ رندر مستثنی شدند — هیچ جمله/ساقه/کلیدی از آن‌ها نباید در بانک‌ها نشت کرده باشد.
 * (۳) کوئیرک‌های چاپی: «جمالت» (شکستنِ لام‌الف در لایه)، شمارهٔ تکراریِ «۲» برای جدولِ
 * ترجمه، بی‌نقطگیِ جمله‌های ۳/۴/۵ س۱، ادغامِ «مجله شعر» در یک خطِ لایه، ستارهٔ search
 * در خطِ جداگانهٔ ص۶۱.
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

const rec = g8.source.g8exam7 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number;
  items: number; bankCounts: number[]; tableCellsRenderOrder: string[]; tableCellsSource: string;
  keyPolicy: string; engineNote: string; derivedKeys: Record<string, string[]>;
  skippedSections: string[]; printQuirks: string[];
};
const map = g8.source.g8familyMap as {
  extractedRound: string; lastUpdatedRound?: string;
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
  note: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r378) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g8.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p72 = slicePage(72);
const p61 = slicePage(61);
const a61 = p61.join("\n");
const a6263 = slicePage(62).concat(slicePage(63)).join("\n");

describe("r378 — رسیدِ g8exam7 و نقشهٔ خانواده‌ها (۷/۷)", () => {
  it("رسید: r378، pdf-p72، ۳ سکشن/۱ استخراج/۲ مستثنی، ۶ آیتم در [6] با ترتیبِ رندرِ جدول", () => {
    expect(rec.extractedRound).toBe("r378");
    expect(rec.section).toContain("درس هفتم");
    expect(rec.examPages).toContain("pdf-p72");
    expect(rec.sectionsTotal).toBe(3);
    expect(rec.sectionsExtracted).toBe(1);
    expect(rec.sectionsSkipped).toBe(2);
    expect(rec.items).toBe(6);
    expect(rec.bankCounts).toEqual([6]);
    expect(rec.tableCellsRenderOrder).toEqual(["shopping", "searching", "reading", "شعر", "مجله", "باشگاه"]);
    expect(rec.tableCellsSource).toContain("ردیفِ پاسخِ خالی");
    expect(rec.keyPolicy).toContain("gym");
    expect(rec.engineNote).toContain("دورویی");
    expect(rec.derivedKeys["S2-l7"]).toEqual(["gym", "magazine", "poem", "خواندن", "جستجو", "خرید"]);
    expect(rec.skippedSections).toHaveLength(2);
    expect(rec.skippedSections.some((s) => s.includes("اسکی"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("چرخِ خرید"))).toBe(true);
  });

  it("کوئیرک‌های چاپیِ مستند: «جمالت»، شمارهٔ تکراریِ «۲»، بی‌نقطگیِ ۳/۴/۵، ادغامِ «مجله شعر»، نقطهٔ پیش از سرخط", () => {
    expect(rec.printQuirks.some((s) => s.includes("جمالت"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("تکراری"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("بدونِ نقطه"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("مجله شعر"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("نقطهٔ پیش از متن"))).toBe(true);
  });

  it("نقشهٔ ۸ خانوادهٔ g8: r378=۱ و r379=۱ (جامعِ ص۷۳ — گاردِ خودش) و null=۰ — families[6] (pdf-p72) راندِ r378", () => {
    expect(map.families).toHaveLength(8);
    expect(map.families.map((f) => f.pdfPage)).toEqual([18, 27, 35, 41, 50, 60, 72, 73]);
    expect(map.families.filter((f) => f.round === "r378")).toHaveLength(1);
    expect(map.families.filter((f) => f.round === "r379")).toHaveLength(1);
    expect(map.families.filter((f) => f.round === null)).toHaveLength(0);
    expect(map.families[6].round).toBe("r378");
    expect(map.families[6].status).toContain("۱ بانک/۶ آیتم");
    expect(map.families[6].status).toContain("۷/۷");
    expect(map.lastUpdatedRound).toBe("r379");
    expect(map.note).toContain("r369");
  });
});

describe("r378 — بازتولیدِ لایهٔ ص۷۲ (ضدِ رونویسیِ دستی)", () => {
  it("تیترِ دوبخطیِ خانوادهٔ هفتم: «نمونه سواالت امتحانی درس» + «هفتم»", () => {
    const i = p72.findIndex((l) => l.includes("نمونه سواالت امتحانی درس"));
    const two = p72.slice(i, i + 4).map((l) => l.trim()).filter(Boolean).slice(0, 2);
    expect(two).toEqual(["نمونه سواالت امتحانی درس", "هفتم"]);
  });

  it("شش جملهٔ سرگرمیِ س۱ (تصویریِ مستثنی) verbatim — جمله‌های ۳/۴/۵ بی‌نقطه", () => {
    const flat = p72
      .filter((l) => /^[15]\)/.test(l.trim()) || /^[34]\) I/.test(l.trim()))
      .flatMap((l) => l.trim().split(/\s{2,}/).filter(Boolean));
    expect(flat).toEqual([
      "1) I like reading.", "2) I like playing computer game.",
      "3) I go shopping", "4) I walk in the park",
      "5) I go horse riding", "6) I watch movies as a hobby.",
    ]);
    expect(flat[2].endsWith(".")).toBe(false);
    expect(flat[3].endsWith(".")).toBe(false);
    expect(flat[4].endsWith(".")).toBe(false);
    expect(flat[5].endsWith(".")).toBe(true);
  });

  it("سرخطِ س۲ با «جمالت»ِ لایه + چهار ساقهٔ ناقصِ تصویری (مستثنی) verbatim", () => {
    expect(p72.some((l) => l.includes("با توجه به تصاویر داده شده جمالت ناقص زیر را کامل کنید"))).toBe(true);
    const stems = p72
      .filter((l) => l.trim().startsWith("I like …") || l.trim().startsWith("I usually buy a …"))
      .flatMap((l) => l.trim().split(/\s{2,}/).filter(Boolean));
    expect(stems).toEqual([
      "I like ………………… in winter.", "He enjoys ………………………",
      "I usually buy a ……………………………", "my hobby is playing …………………………",
    ]);
  });

  it("شمارهٔ تکراریِ «۲)» + سرخطِ جدولِ ترجمه + پنج خطِ خانه‌ها (با ادغامِ «مجله شعر»)", () => {
    expect(p72.some((l) => l.trim() === "2)")).toBe(true);
    expect(p72.some((l) => l.includes("کلمات زیر را به انگلیسی و فارسی ترجمه کنید"))).toBe(true);
    const i = p72.findIndex((l) => l.trim() === "باشگاه");
    const tail = p72.slice(i).map((l) => l.trim()).filter(Boolean);
    expect(tail.slice(0, 5)).toEqual(["باشگاه", "مجله شعر", "reading", "searching", "shopping"]);
  });

  it("لنگرهای ستاره‌دارِ ص۶۱ (magazine*/poem*/read*/go shopping* + ستارهٔ خطِ جداگانهٔ search) و دیالوگ‌های ص۶۲/۶۳", () => {
    for (const anchor of [/magazine\*/, /poem\*/, /read\*/, /go shopping\*/])
      expect(a61).toMatch(anchor);
    expect(a61).toMatch(/\*\s*\nsearch/);
    expect(a6263).toContain("go to the gym in my free");
    expect(a6263).toContain("I love reading.");
    expect(a6263).toContain("I enjoy searching the Web.");
    expect(a6263).toContain("I usually go shopping.");
  });
});

describe("r378 — بانک ۱۶ (خ۷/س۲ دوم): جدولِ ترجمهٔ دوطرفه با گزینه‌های هم‌جدولی", () => {
  const bank = L(16);

  it("شش ساقه به دو الگو: سه «X به انگلیسی: -------» (باشگاه/مجله/شعر) و سه «X به فارسی: -------» (reading/searching/shopping به ترتیبِ لایه)", () => {
    expect(bank.title).toContain("درس هفتم");
    expect(bank.title).toContain("ص۷۲");
    expect(bank.questions.map((it) => it.question)).toEqual([
      "باشگاه به انگلیسی: -------",
      "مجله به انگلیسی: -------",
      "شعر به انگلیسی: -------",
      "reading به فارسی: -------",
      "searching به فارسی: -------",
      "shopping به فارسی: -------",
    ]);
  });

  it("کلیدها gym/magazine/poem/خواندن/جستجو/خرید با اندیس‌های [1,0,2,3,0,2]", () => {
    expect(keyed(16)).toEqual(["gym", "magazine", "poem", "خواندن", "جستجو", "خرید"]);
    expect(bank.questions.map((it) => it.answer)).toEqual([1, 0, 2, 3, 0, 2]);
  });

  it("هم‌جدولی: گزینه‌های q1-3 از استخرِ انگلیسیِ شش‌تایی و q4-6 از استخرِ فارسیِ شش‌تایی — بدونِ واژهٔ بیرونی", () => {
    const EN = ["gym", "magazine", "poem", "shopping", "searching", "reading"];
    const FA = ["باشگاه", "مجله", "شعر", "خواندن", "جستجو", "خرید"];
    for (const it of bank.questions.slice(0, 3))
      for (const o of it.options) expect(EN, `${it.id}: ${o}`).toContain(o);
    for (const it of bank.questions.slice(3))
      for (const o of it.options) expect(FA, `${it.id}: ${o}`).toContain(o);
    // گزینه‌های هر سؤال یکتا و چهارگانه‌اند
    for (const it of bank.questions) expect(new Set(it.options).size).toBe(4);
  });

  it("پوششِ شش‌تاییِ جدول: gym/magazine/poem کلیدِ q1-3 و reading/searching/shopping ساقهٔ q4-6 — هر خانه دقیقاً یک نقش", () => {
    const keys23 = new Set(bank.questions.slice(0, 3).map((it) => it.options[it.answer]));
    const stems46 = bank.questions.slice(3).map((it) => it.question.replace(" به فارسی: -------", ""));
    expect([...keys23].sort()).toEqual(["gym", "magazine", "poem"]);
    expect(stems46).toEqual(["reading", "searching", "shopping"]);
    // gym از جدولِ واژگان ص۶۱ نمی‌آید — فقط دیالوگِ ص۶۲ (پیمانِ لنگرِ مستند)
    expect(a61).not.toMatch(/gym/);
    expect(a6263).toContain("gym");
  });
});

describe("r378 — پیمان‌های سراسریِ فایل (پس از الحاقِ بانکِ ۱۶)", () => {
  it("شکلِ فایل: ۱۹ بانک/[4,3,3,2,5,3,1,4,4,4,2,1,4,2,4,6,8,5,5]/۷۰ id یکتا — ids[46]=g8-l16-1", () => {
    expect(g8.lessons).toHaveLength(19);
    expect(g8.lessons.map((l) => l.count)).toEqual([4, 3, 3, 2, 5, 3, 1, 4, 4, 4, 2, 1, 4, 2, 4, 6, 8, 5, 5]);
    const ids = g8.lessons.flatMap((b) => b.questions.map((q) => q.id));
    expect(ids).toHaveLength(70);
    expect(new Set(ids).size).toBe(70);
    expect(ids[46]).toBe("g8-l16-1");
    expect(ids[51]).toBe("g8-l16-6");
  });

  it("نشت‌سنجِ دو سکشنِ تصویریِ مستثنی: جمله‌های س۱، ساقه‌های س۲ و کلیدهای داوری (skiing/walking/computer games) غایب‌اند", () => {
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const forbidden of [
      "I like reading.", "I like playing computer game.", "I go shopping",
      "I walk in the park", "I go horse riding", "I watch movies as a hobby.", // شش جملهٔ س۱
      "I like …", "He enjoys …", "I usually buy a …", "my hobby is playing …", // چهار ساقهٔ س۲
      "skiing", "walking", // کلیدهای داوریِ س۲ (magazine/computer games در واژگانِ چاپی هم هست — فقط دوتاییِ منحصربه‌فردِ تصویری)
      "شماره هر جمله", // سرخطِ س۱
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("بانکِ ۱۶ MCQ چهارگزینه‌ایِ بدونِ تایپی (قراردادِ r363)", () => {
    for (const it of L(16).questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
      expect(it.options.length).toBe(4);
    }
  });

  it("خلوصِ دوروییِ بانکِ ۱۶ (استثنایِ پنجمِ کارت): ساقه‌های q1-3 فارسی با گزینه‌های لاتینِ خالص؛ ساقه‌های q4-6 دوبخشیِ «X به فارسی» با گزینه‌های فارسی", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    const q16 = L(16).questions;
    for (const it of q16.slice(0, 3)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian stem of ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `latin option of ${it.id}: ${o}`).toBe(true);
    }
    for (const it of q16.slice(3)) {
      // ساقهٔ دوبخشی: واژهٔ لاتینِ جدول + پسوندِ فارسیِ «به فارسی: -------» (شکلِ ثابت)
      expect(it.question, `two-way stem of ${it.id}`).toMatch(/^(reading|searching|shopping) به فارسی: -------$/);
      for (const o of it.options) expect(/\p{Script=Arabic}/u.test(o), `Persian option of ${it.id}: ${o}`).toBe(true);
    }
  });
});
