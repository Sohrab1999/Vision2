import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r320 — گاردِ شست‌وشوی ۲۰ ترجمهٔ چاپیِ «ترجمه تست» کلیدِ تشریحیِ بخش اول (ص۱۸۵-۱۸۶) به l10
// + تصدیقِ چاپ‌محورِ کلیدها (l10: ۲۰/۲۰ گزینه(X)؛ l11: ۴۰/۴۰ گریدِ ص۱۸۷).
// رسیدِ موکولِ r284 («بازسازی به راند مستقل») بسته شد — الگوی r315.

type TQ = { id: string; n: number; question: string; options: string[]; answer: number; translation?: string };
type TWash = {
  round: string; pages: string; section: string; method: string; items: number;
  supersedes: string; keysVerified: string; printQuirks: string[];
};
type TVerify = { round: string; page: string; method: string; items: number; agree: number; note: string };
type TBank = {
  source: {
    passive?: {
      part1: { questions: number; translationsWashed?: TWash };
      part2: { questions: number; printVerification?: TVerify };
      translations: string;
      extractedRound: number;
    };
  };
  lessons: { lesson: number; count: number; questions: TQ[] }[];
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/grammar-g12-topic.json", "utf8"),
) as unknown as TBank;
const l10 = bank.lessons.find((l) => l.lesson === 10)!;
const l11 = bank.lessons.find((l) => l.lesson === 11)!;
const passive = bank.source.passive!;
const w = passive.part1.translationsWashed!;
const pv = passive.part2.printVerification!;
const LET = "abcd";

// رونویسیِ چشمیِ مستقل از رندر (۳۰۰dpi کامل + ۱۴۰۰dpi نیمه‌ها + ۲۴۰۰-۳۴۰۰dpi زومِ واژه)
const TRANSCRIPT: Record<number, string> = {
  1: "مرد گفت: ماشینهای زیادی در این مکان خریداری میشود.",
  2: "دانش آموزان تخته سیاه را پاک کردند. به عبارت دیگر، تخته سیاه توسط دانش آموزان پاک شد.",
  3: "بنی دستهایش را شسته است. به عبارت دیگر، دستهای بنی تمیز شده اند.",
  4: "تکلیف زیادی از ساعت ۸ انجام داده شده است.",
  5: "تعداد زیادی از فیلمهای جالب اغلب در این سینما نمایش داده میشوند.",
  6: "این محصول با قیمت پائین‌تری برای سالها فروخته شده است.",
  7: "جالب است بدانیم که این پل دو سال قبل ساخته شد.",
  8: "امروز یک چیز جالب اتفاق افتاد و همه دانش آموزان خندیدند.",
  9: "به ما گفته شد که شما این کتاب را از کتابخانه قرض گرفته بودید.",
  10: "گزارش آزمایشات انجام گرفته توسط دانش آموزان به معلم فرستاده شد.",
  11: "من نمیدانستم که کتاب \"جنایات و مکافات\" توسط \"فئودور داستایوفسگی\" نوشته شده است.",
  12: "شغل خوبی توسط آنها به خواهرم پیشنهاد شده، اما او آن را رد کرد (نپذیرفت).",
  13: "به آقای علوی هدیه ای توسط همکارانش داده شده (اهدا شد) وقتی که او بازنشسته شد.",
  14: "آلبرت انیشتین نزد عامه مردم به عنوان معروف ترین دانشمند همه دوران شناخته شده است.",
  15: "بنی سیلین در دهه ۱۹۲۰ عریضه شد، و به گسترش عصر آنتی بیوتیک ها کمک کرد.",
  16: "دیوار بزرگ چین هزاران سال قبل ساخته شد.",
  17: "وقتیکه بچه بودم به من یاد داده شد که چگونه از آن دستگاه قدیمی استفاده کنم، شما نیاز نیست به من آموزش دهید.",
  18: "دیزن لند یک پارک تفریحی معروف جهانی در کالیفرنیای جنوبی است. از آن توسط بیشتر از ده میلیون نفر هر سال بازدید میشود.",
  19: "بسیاری از ما به فرض از آب در زندگی روزانه مان استفاده می کنیم، اما آدمی که در بیابان زندگی می کند آب را با سهل انگاری استفاده نمی کند. برای آنها، هر قطره آب ارزشمند است.",
  20: "برواز به استنبول به مدت پنج ساعت تاخیر داشته است به خاطر مهی که مانع از زمین برخاستن و فرود هواپیماها در لحظه شده است.",
};
const KEY_PRINT_L10 = "dcbccda bcd ddabdcdaac".replace(/\s/g, "");
const rows: string[][] = [
  ["d", "d", "b", "c"], ["c", "d", "c", "d"], ["b", "c", "b", "a"], ["d", "c", "b", "b"], ["c", "c", "a", "d"],
  ["a", "d", "b", "d"], ["b", "b", "b", "a"], ["c", "d", "c", "c"], ["b", "a", "a", "a"], ["b", "a", "b", "a"],
];
const byN: Record<number, string> = {};
rows.forEach((quad, i) => quad.forEach((letter, j) => { byN[i + 1 + 10 * j] = letter; }));
const KEY_PRINT_L11 = Object.keys(byN).map(Number).sort((a, b) => a - b).map((n) => byN[n]).join("");

const FA = /[\u0600-\u06FF]/;

describe("jozve passive wash g12 (r320 print-verbatim translations + key confirmation)", () => {
  it("wash receipt: round/pages/method/items/supersedes/keysVerified + printQuirks", () => {
    expect(w.round).toBe("r320");
    expect(w.pages).toBe("185-186");
    expect(w.method).toContain("visual transcription");
    expect(w.method).toContain("3400dpi");
    expect(w.items).toBe(20);
    expect(w.supersedes).toContain("r284");
    expect(w.keysVerified).toContain("20/20");
    expect(w.printQuirks.length).toBeGreaterThanOrEqual(10);
    // r284 extraction receipt intact
    expect(passive.extractedRound).toBe(284);
    expect(passive.part1.questions).toBe(20);
    expect(passive.part2.questions).toBe(40);
  });

  it("all 20 translations verbatim-locked to the independent print transcript, Persian-pure", () => {
    expect(l10.questions).toHaveLength(20);
    for (const q of l10.questions) {
      expect(q.translation, `${q.id} present`).toBe(TRANSCRIPT[q.n]);
      expect(FA.test(q.translation!), `${q.id} Persian`).toBe(true);
      expect(/[A-Za-z]{3,}/.test(q.translation!), `${q.id} no Latin leak`).toBe(false);
    }
  });

  it("print quirks locked verbatim (بنی سیلین، عریضه، داستایوفسگی، برواز، برخاستن، دیزن لند)", () => {
    expect(TRANSCRIPT[15]).toContain("بنی سیلین");
    expect(TRANSCRIPT[15]).toContain("عریضه شد");
    expect(TRANSCRIPT[11]).toContain("داستایوفسگی");
    expect(TRANSCRIPT[20]).toContain("برواز");
    expect(TRANSCRIPT[20]).toContain("برخاستن");
    expect(TRANSCRIPT[20]).not.toContain("برداختن");
    expect(TRANSCRIPT[18]).toContain("دیزن لند");
    expect(TRANSCRIPT[3]).toContain("بنی دستهایش");
    const quirks = w.printQuirks.join(" ");
    for (const token of ["بنی سیلین", "عریضه", "داستایوفسگی", "برواز", "برخاستن", "دیزن لند"]) {
      expect(quirks).toContain(token);
    }
  });

  it("l11 printVerification: 40/40 keys confirmed against the p187 grid; part2 keeps honest absence", () => {
    expect(pv.round).toBe("r320");
    expect(pv.page).toBe("187");
    expect(pv.items).toBe(40);
    expect(pv.agree).toBe(40);
    expect(pv.note).toContain("غیبت");
    expect(l11.questions).toHaveLength(40);
    for (const q of l11.questions) expect(q.translation, q.id).toBeUndefined();
    expect(passive.translations).toContain("part2");
    expect(passive.translations).toContain("غیبتِ صادقانه");
  });

  it("all 60 keys locked letter-by-letter to the print transcripts (تشریحی + گرید)", () => {
    l10.questions.forEach((q, i) => expect(LET[q.answer], `l10-Q${q.n}`).toBe(KEY_PRINT_L10[i]));
    l11.questions.forEach((q, i) => expect(LET[q.answer], `l11-Q${q.n}`).toBe(KEY_PRINT_L11[i]));
  });
});
