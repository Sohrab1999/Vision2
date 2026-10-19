// r397 — «کتاب‌های همهٔ پایه‌ها» — پیمان‌های لایهٔ مشتق‌سازی.
// هر شش کتاب باید از دلِ فایل‌های واقعی public/jozve/*.json درست ساخته شود:
//   • متای ثابت (عنوان/صفحه/شمار بانک) با خودِ فایل‌ها پین می‌شوند — ضدِ عددِ کهنه
//   • فصل‌های «درس N» فقط با لنگرِ آغازین گروه می‌شوند (کلید و ترجمه‌ها اسیر نمی‌شوند)
//   • بانک‌های آزمون یا به درس می‌چسبند یا در گروه‌های بی‌درس می‌افتند — هیچ‌کدام گم نمی‌شوند
//   • تفکیک خط دوزبانه و پالایشِ زباله‌های سربرگِ جدول واژگان

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  BOOKS,
  BOOK_BANK_COUNTS,
  BOOKS_PAGES_TOTAL,
  bankGroupPrefix,
  bankLessonOrdinal,
  chapterLessonOrdinal,
  deriveBook,
  isJunkVocabLine,
  lessonOrdinalLabel,
  splitScriptLine,
  type BookDoc,
  type BookTestBank,
} from "@/lib/books";

const jozve = (f: string) => JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));
const index = jozve("index.json") as { grades: { grade: number; title: string; pages: number }[] };

const docs = new Map<number, BookDoc>();
const banks = new Map<number, BookTestBank>();
for (const b of BOOKS) {
  docs.set(b.grade, jozve(`g${b.grade}.json`) as BookDoc);
  banks.set(b.grade, jozve(`tests-g${b.grade}.json`) as BookTestBank);
}

describe("r397 — متای ثابت کتاب‌ها با فایل‌های واقعی پین می‌شوند", () => {
  it("عنوان و شمار صفحهٔ هر کتاب با index.json برابر است", () => {
    for (const b of BOOKS) {
      const g = index.grades.find((x) => x.grade === b.grade)!;
      expect(g, `پایهٔ ${b.grade} در index.json ثبت است`).toBeTruthy();
      expect(b.title).toBe(g.title);
      expect(b.pages).toBe(g.pages);
    }
  });

  it("شمار بانک‌های هر پایه با tests-gN.json برابر است", () => {
    for (const b of BOOKS) {
      expect(banks.get(b.grade)!.lessons.length).toBe(BOOK_BANK_COUNTS[b.grade]);
    }
  });

  it("مجموع صفحه‌ها ۱۱۷۸ است (شش جزوهٔ کامل)", () => {
    expect(BOOKS_PAGES_TOTAL).toBe(1178);
  });
});

describe("r397 — تجزیهٔ ترتیبِ درس", () => {
  it("لنگرِ آغازینِ فصل: «درس اول» می‌گیرد، «کلید و ترجمه … درس اول» نمی‌گیرد", () => {
    expect(chapterLessonOrdinal("درس اول")).toBe(1);
    expect(chapterLessonOrdinal("درس ششم")).toBe(6);
    expect(chapterLessonOrdinal("درس ۴")).toBe(4);
    expect(chapterLessonOrdinal("کلید و ترجمه تستهای واژگان درس اول -پایه دهم")).toBeNull();
    expect(chapterLessonOrdinal("معرفی و مقدمه")).toBeNull();
    expect(chapterLessonOrdinal("درس اول")).toBe(1);
    expect(chapterLessonOrdinal("فصل درس دوم")).toBeNull(); // پیشوندِ غیرِ «درس»
  });

  it("جست‌وجوی آزادِ بانک: «امتحانی درس سوم — …» می‌گیرد، بی‌درس null", () => {
    expect(bankLessonOrdinal("امتحانی درس سوم — عدد به حروف (س۲، ص۶۵)")).toBe(3);
    expect(bankLessonOrdinal("امتحانی درس هشتم — پاسخ از ستون راست (س۳، ص۱۰۳)")).toBe(8);
    expect(bankLessonOrdinal("تست واژگان ۵۰تایی (ص۹۸-۱۰۱)")).toBeNull();
    expect(bankLessonOrdinal("آزمون جامع ۳۶۰ — بانک 1 (سؤال 1-20)")).toBeNull();
    expect(bankLessonOrdinal("نهایی خرداد ۱۴۰۲ — کامل‌کردن متن (س۴، ص۳۳۶)")).toBeNull();
  });

  it("برچسب فارسیِ ترتیب", () => {
    expect(lessonOrdinalLabel(1)).toBe("درس اول");
    expect(lessonOrdinalLabel(8)).toBe("درس هشتم");
  });
});

describe("r397 — مشتق‌سازی هر شش کتاب", () => {
  const derived = new Map<number, ReturnType<typeof deriveBook>>();
  for (const b of BOOKS) derived.set(b.grade, deriveBook(docs.get(b.grade)!, banks.get(b.grade)!));

  it("شمار درس‌های هر پایه درست است (گ۷/۸ درس‌های فقط-آزمونی هم دارند)", () => {
    // g7: فصل‌ها تا درس ۶ + بانک‌های درس ۷ و ۸ → ۸ درس
    expect(derived.get(7)!.lessons.map((l) => l.ordinal)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    // g8: فصل‌ها تا ۶ + بانکِ درس ۷ → ۷ درس
    expect(derived.get(8)!.lessons.map((l) => l.ordinal)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(derived.get(9)!.lessons.map((l) => l.ordinal)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(derived.get(10)!.lessons.map((l) => l.ordinal)).toEqual([1, 2, 3, 4]);
    expect(derived.get(11)!.lessons.map((l) => l.ordinal)).toEqual([1, 2, 3]);
    expect(derived.get(12)!.lessons.map((l) => l.ordinal)).toEqual([1, 2, 3]);
  });

  it("هر درسِ g7 فصل و بانکِ هر دو را دارد (درس ۷/۸ هم فصلِ خود را دارند — c8/c9)", () => {
    for (const ord of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const les = derived.get(7)!.lessons.find((l) => l.ordinal === ord)!;
      expect(les.chapterIdxs.length, `درس ${ord} فصل دارد`).toBeGreaterThanOrEqual(1);
      expect(les.banks.length, `درس ${ord} بانک دارد`).toBeGreaterThan(0);
    }
    // درس هفتمِ g8 هم فصلِ خود را دارد (c7)
    const les7 = derived.get(8)!.lessons.find((l) => l.ordinal === 7)!;
    expect(les7.chapterIdxs.length).toBe(1);
    expect(les7.banks.length).toBeGreaterThan(0);
  });

  it("فصل‌های تکراریِ درس واحد جمع می‌شوند (g10 درس اول = ۳ فصل، g12 درس اول = ۳ فصل)", () => {
    expect(derived.get(10)!.lessons[0].chapterIdxs).toHaveLength(3);
    expect(derived.get(12)!.lessons[0].chapterIdxs).toHaveLength(3);
    expect(derived.get(11)!.lessons[1].chapterIdxs.length).toBeGreaterThanOrEqual(2); // c4+c6+c9
  });

  it("هیچ بانکی گم نمی‌شود: درس‌ها + گروه‌های بی‌درس = کلِ بانک‌ها", () => {
    for (const b of BOOKS) {
      const d = derived.get(b.grade)!;
      const total = banks.get(b.grade)!.lessons.length;
      const inLessons = d.lessons.reduce((a, l) => a + l.banks.length, 0);
      const inGroups = d.otherBanks.reduce((a, g) => a + g.banks.length, 0);
      expect(inLessons + inGroups).toBe(total);
      // هیچ گروهِ بی‌درسی خالی نیست و هیچ گروهِ تکراری وجود ندارد
      expect(new Set(d.otherBanks.map((g) => g.group)).size).toBe(d.otherBanks.length);
    }
  });

  it("نمونهٔ شمردنی: بانک‌های درس سومِ g7 چهار بانک است (r371)", () => {
    const les = derived.get(7)!.lessons.find((l) => l.ordinal === 3)!;
    expect(les.banks).toHaveLength(4);
  });

  it("بانک‌های نهاییِ g12 در گروه‌های بی‌درس می‌افتند و شمارشان حفظ است", () => {
    const d = derived.get(12)!;
    expect(d.otherBanks.length).toBeGreaterThan(10);
    const finals = d.otherBanks.filter((g) => g.group.startsWith("نهایی"));
    expect(finals.length).toBeGreaterThan(8); // ۱۷ برگهٔ نهایی
  });

  it("هر درسِ دارای فصل، شمارِ خطِ واژگانِ بی‌زباله دارد (g7 درس اول > ۲۰)", () => {
    const les = derived.get(7)!.lessons.find((l) => l.ordinal === 1)!;
    expect(les.counts.vocab).toBeGreaterThan(20);
    expect(les.counts.grammar).toBeGreaterThan(0);
  });
});

describe("r397 — تفکیک خط دوزبانه و پالایش زباله", () => {
  it("ردیفِ دوستونهٔ واقعی g7: EN بالا، FA پایین", () => {
    const s = splitScriptLine("*word canواژه ،کلمه ،لغت توانستن ،قادر بودن");
    expect(s.en).toBe("*word can");
    expect(s.fa).toBe("واژه ،کلمه ،لغت توانستن ،قادر بودن");
  });

  it("خط تمام‌فارسی و تمام‌انگلیسی", () => {
    expect(splitScriptLine("سالم علی سالم رضا")).toEqual({ en: "", fa: "سالم علی سالم رضا" });
    expect(splitScriptLine("Sense of Appreciation")).toEqual({ en: "Sense of Appreciation", fa: "" });
  });

  it("پرانتزِ معوجِ آغازِ خط به سمتِ انگلیسی می‌ماند", () => {
    const s = splitScriptLine(")CD (compact disk numberدیسک فشرده عدد ،شماره");
    expect(s.en).toBe(")CD (compact disk number");
    expect(s.fa).toBe("دیسک فشرده عدد ،شماره");
  });

  it("زباله‌های سربرگِ جدول واژگان شناسایی می‌شوند", () => {
    expect(isJunkVocabLine("")).toBe(true);
    expect(isJunkVocabLine("کلمه()1 معنی()1 کلمه()2 معنی()2")).toBe(true);
    expect(isJunkVocabLine("Persian Meanings Words Persian Meanings")).toBe(true);
    expect(isJunkVocabLine("*lesson * greatدرس عالی ،زیاد،بزرگ")).toBe(false);
  });

  it("پیشوندِ گروه‌بندیِ بانک بی‌درس: بخشِ پیش از «—»", () => {
    expect(bankGroupPrefix("نهایی خرداد ۱۴۰۲ — کامل‌کردن متن (س۴، ص۳۳۶)")).toBe("نهایی خرداد ۱۴۰۲");
    expect(bankGroupPrefix("آزمون جامع ۳۶۰ — بانک 1 (سؤال 1-20)")).toBe("آزمون جامع ۳۶۰");
    expect(bankGroupPrefix("تست گرامری (ص۲۸)")).toBe("تست گرامری (ص۲۸)");
  });
});
