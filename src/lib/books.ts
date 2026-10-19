// r397 — «کتاب‌های همهٔ پایه‌ها» — لایهٔ دادهٔ خالصِ قفسهٔ کتاب‌ها.
//
// خواستهٔ صریح کاربر: «حالا همهٔ این کتاب‌ها رو به وب‌اپ اضافه کن، همان‌طور
// که جزوهٔ یازدهم رو اضافه کردی — مرتب». قفسهٔ کتابِ خانه تا امروز فقط سه درسِ
// دست‌سازِ پایهٔ یازدهم را داشت؛ این ماژول همان تجربهٔ درس‌به‌درس را برای
// هر شش جزوهٔ پایهٔ ۷ تا ۱۲ از دلِ استخراجِ موجود می‌سازد:
//
//   • فصل‌های «درس N» از /jozve/gN.json  → گروه‌بندی با ترتیبِ وابسته (اول…هشتم)
//   • بانک‌های tests-gN.json            → اتصال به همان درس با عنوانِ خودشان
//   • بانک‌های بی‌درس (نهایی‌ها، جامع، تشریحی…) → گروه‌بندی با پیشوندِ عنوان
//
// همهٔ توابع خالص‌اند (بدون DOM/fetch در سطح ماژول) تا در vitest هم با
// همان فایل‌های public/jozve/*.json راستی‌آزمایی شوند. بارگیری‌های شبکه
// کشِ ماژولی دارند (الگوی jozve-view) و فقط از کامپوننت‌های کلاینت صدا
// زده می‌شوند.

// ---------------------------------------------------------------- انواع

export interface BookSection {
  type: string;
  title: string;
  lines: string[];
}

export interface BookChapter {
  id: string;
  title: string;
  kind: string; // lesson | intro | appendix
  zone?: string;
  zoneLabel?: string;
  sections: BookSection[];
}

export interface BookDoc {
  grade: number;
  title: string;
  source: string;
  pages: number;
  authorExcluded?: boolean;
  chapters: BookChapter[];
}

export interface BankLessonEntry {
  lesson: number;
  title: string;
  level?: string;
  count: number;
  questions: unknown[];
  [k: string]: unknown;
}

export interface BookTestBank {
  grade: number;
  title?: string;
  lessons: BankLessonEntry[];
  source?: Record<string, unknown>;
}

// سطر واژه‌نامه: بدونِ جفت‌سازیِ خطرناکِ دوستونه — وفادار به ردیفِ چاپی
export interface ScriptLine {
  en: string;
  fa: string;
}

// --------------------------------------------------------- متای ثابت کتاب‌ها

export interface BookMeta {
  grade: number;
  label: string; // هفتم … دوازدهم
  title: string; // عنوانِ روی جلد (با index.json پین می‌شود)
  pages: number; // شمار صفحهٔ PDF (با index.json پین می‌شود)
  lessonCount: number; // شمار درس‌های مشتق‌شده (با فایل‌ها پین می‌شود)
  spine: string; // کلاس grad بند کتاب
  chip: string; // کلاس چیپ
  accent: string; // متن رنگی
  ring: string; // حاشیهٔ کارت
}

export const BOOKS: BookMeta[] = [
  {
    grade: 7,
    label: "هفتم",
    title: "جزوه کامل زبان انگلیسی پایه هفتم",
    pages: 104,
    lessonCount: 8,
    spine: "from-emerald-500 to-emerald-700",
    chip: "bg-emerald-50 border-emerald-200 text-emerald-800",
    accent: "text-emerald-700",
    ring: "border-emerald-200 hover:border-emerald-300",
  },
  {
    grade: 8,
    label: "هشتم",
    title: "جزوه کامل زبان انگلیسی پایه هشتم",
    pages: 101,
    lessonCount: 7,
    spine: "from-amber-500 to-amber-700",
    chip: "bg-amber-50 border-amber-200 text-amber-800",
    accent: "text-amber-700",
    ring: "border-amber-200 hover:border-amber-300",
  },
  {
    grade: 9,
    label: "نهم",
    title: "جزوه کامل زبان انگلیسی پایه نهم",
    pages: 118,
    lessonCount: 6,
    spine: "from-rose-500 to-rose-700",
    chip: "bg-rose-50 border-rose-200 text-rose-800",
    accent: "text-rose-700",
    ring: "border-rose-200 hover:border-rose-300",
  },
  {
    grade: 10,
    label: "دهم",
    title: "جزوه جامع زبان انگلیسی پایه دهم",
    pages: 302,
    lessonCount: 4,
    spine: "from-teal-500 to-teal-700",
    chip: "bg-teal-50 border-teal-200 text-teal-800",
    accent: "text-teal-700",
    ring: "border-teal-200 hover:border-teal-300",
  },
  {
    grade: 11,
    label: "یازدهم",
    title: "جزوه جامع کمک‌آموزشی زبان انگلیسی پایه یازدهم",
    pages: 204,
    lessonCount: 3,
    spine: "from-violet-500 to-violet-700",
    chip: "bg-violet-50 border-violet-200 text-violet-800",
    accent: "text-violet-700",
    ring: "border-violet-200 hover:border-violet-300",
  },
  {
    grade: 12,
    label: "دوازدهم",
    title: "جزوه جامع پایه دوازدهم همراه با امتحانات نهایی",
    pages: 349,
    lessonCount: 3,
    spine: "from-orange-500 to-orange-700",
    chip: "bg-orange-50 border-orange-200 text-orange-800",
    accent: "text-orange-700",
    ring: "border-orange-200 hover:border-orange-300",
  },
];

export const bookMetaByGrade = (g: number): BookMeta | undefined => BOOKS.find((b) => b.grade === g);
export const BOOKS_PAGES_TOTAL = BOOKS.reduce((a, b) => a + b.pages, 0); // ۱۱۷۸

/**
 * شمار بانک‌های آزمونِ هر پایه در tests-gN.json — کارت‌های خانه بدونِ شبکه
 * این عدد را نشان می‌دهند؛ در tests/books-derive.test.ts با خودِ فایل‌ها پین شده.
 */
export const BOOK_BANK_COUNTS: Record<number, number> = { 7: 20, 8: 19, 9: 50, 10: 100, 11: 108, 12: 143 };

export const GRADE_LABELS: Record<number, string> = {
  7: "هفتم",
  8: "هشتم",
  9: "نهم",
  10: "دهم",
  11: "یازدهم",
  12: "دوازدهم",
};

// ------------------------------------------------------ تجزیهٔ ترتیبِ درس

const ORDINAL_WORDS: Record<string, number> = {
  اول: 1,
  دوم: 2,
  سوم: 3,
  چهارم: 4,
  پنجم: 5,
  ششم: 6,
  هفتم: 7,
  هشتم: 8,
};

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

const faDigitToNum = (s: string): number | null => {
  if (!/^[۰-۹0-9]+$/.test(s)) return null;
  const n = parseInt(
    s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d))),
    10,
  );
  return n >= 1 && n <= 8 ? n : null;
};

/**
 * ترتیبِ درس از «عنوانِ فصل» — فقط لنگرِ آغازین: «درس اول»، «درس دوم»…
 * عمداً «کلید و ترجمهٔ تست‌های واژگان درس اول» را نمی‌گیرد (درس در انتهاست)
 * تا فصل‌های کلید در سطح کتاب بمانند.
 */
export const chapterLessonOrdinal = (title: string): number | null => {
  const m = title.trim().match(/^درس\s+([۰-۹0-9]+|اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم)\s*$/);
  if (!m) return null;
  return ORDINAL_WORDS[m[1]] ?? faDigitToNum(m[1]);
};

/**
 * ترتیبِ درس از «عنوانِ بانکِ تست» — جست‌وجوی آزاد: «امتحانی درس سوم — …»
 * → ۳؛ «کلید و ترجمه تستهای واژگان درس دو» → ۲. بی‌درس → null.
 */
export const bankLessonOrdinal = (title: string): number | null => {
  const m = title.match(/درس\s+([۰-۹0-9]+|اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم)/);
  if (!m) return null;
  return ORDINAL_WORDS[m[1]] ?? faDigitToNum(m[1]);
};

/** برچسب فارسیِ ترتیب: 1 → «درس اول» */
export const lessonOrdinalLabel = (n: number): string => {
  const words = ["", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم"];
  return n >= 1 && n <= 8 ? `درس ${words[n]}` : `درس ${n}`;
};

// -------------------------------------------------- تفکیک خط دوزبانه

const FA_CHAR = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * ردیف‌های دوستونهٔ PDF استخراج‌شده به شکل «EN1 EN2 FA1 FA2» در یک خط
 * می‌آیند (ردیفِ چاپی: انگلیسی بالا، فارسی پایین). تفکیک در مرزِ نخستین
 * نویسهٔ فارسی انجام می‌شود — وفادار، بدونِ جفت‌سازیِ حدسی.
 * خطِ تمام‌فارسی → en=""؛ خطِ تمام‌انگلیسی → fa="".
 */
export const splitScriptLine = (line: string): ScriptLine => {
  const idx = line.search(FA_CHAR);
  if (idx < 0) return { en: line.trim(), fa: "" };
  return { en: line.slice(0, idx).trim(), fa: line.slice(idx).trim() };
};

/**
 * خط‌های زبالهٔ سربرگِ جدول‌های واژگان (آرتیفکتِ چاپ) — هم در شمارش
 * و هم در رندر حذف می‌شوند تا قرارداد یکی بماند.
 */
export const isJunkVocabLine = (line: string): boolean => {
  const t = line.trim();
  if (!t) return true;
  if (/^کلمه\s*\(\)\s*\d/.test(t)) return true; // «کلمه()1 معنی()1 …»
  if (/^Persian Meanings/i.test(t)) return true; // سربرگِ لاتینِ جدول
  return false;
};

// --------------------------------------------------------- مشتق‌سازی کتاب

export interface BankRef {
  lesson: number; // شناسهٔ بانک در tests-gN.json (کلید نتیجهٔ jozve-gN-lM)
  title: string;
  count: number;
}

export interface BankGroup {
  group: string; // برچسبِ پیشوند («نهایی خرداد ۱۴۰۲»، «آزمون جامع ۳۶۰»…)
  banks: BankRef[];
}

export interface DerivedLesson {
  ordinal: number;
  label: string; // «درس اول»
  chapterIdxs: number[]; // ایندکس فصل‌های «درس N» در doc.chapters (به ترتیب)
  counts: {
    vocab: number; // خط‌های واژه‌نامه (بی‌زباله)
    grammar: number; // خط‌های گرامر
    translation: number; // خط‌های ترجمه/مکالمه
    other: number; // بقیهٔ خط‌ها (متن/تمرین/نگارش/پاسخنامه…)
  };
  banks: BankRef[]; // بانک‌های متصل به همین درس
}

export interface DerivedBook {
  grade: number;
  title: string;
  pages: number;
  lessons: DerivedLesson[];
  otherBanks: BankGroup[]; // بانک‌های بی‌درس، گروه‌به‌گروه با پیشوندِ عنوان
  extraChapters: {
    idx: number;
    id: string;
    title: string;
    kind: string;
    sections: number;
  }[]; // فصل‌های غیرِ «درس N» (مقدمه، بخش‌ها، کلید و ترجمه…) — مسیر کتابخانه
}

const SECTION_TAB_OF: Record<string, "vocab" | "grammar" | "translation" | "other"> = {
  vocab: "vocab",
  grammar: "grammar",
  translation: "translation",
};

const bucketOf = (type: string): "vocab" | "grammar" | "translation" | "other" =>
  SECTION_TAB_OF[type] ?? "other";

const countSectionLines = (lines: string[], type: string): number => {
  if (type === "vocab") return lines.filter((l) => !isJunkVocabLine(l)).length;
  return lines.filter((l) => l.trim()).length;
};

/** پیشوندِ گروه‌بندیِ بانک‌های بی‌درس: بخشِ پیش از «—» (یا کلِ عنوان کوتاه) */
export const bankGroupPrefix = (title: string): string => {
  const cut = title.split("—")[0].trim();
  return (cut || title).slice(0, 48);
};

/**
 * مشتق‌سازی کاملِ یک کتاب از دو سندِ خام — فصل‌های «درس N» گروه می‌شوند
 * (فصل‌های تکراریِ درسِ واحد، مثل بخشِ دومِ همان درس، پشتِ هم می‌آیند)،
 * بانک‌های آزمون با عنوانشان به درس می‌چسبند و بقیه گروه می‌شوند.
 */
export const deriveBook = (doc: BookDoc, tests: BookTestBank | null): DerivedBook => {
  const lessons = new Map<number, DerivedLesson>();
  const lessonOf = (n: number): DerivedLesson => {
    let l = lessons.get(n);
    if (!l) {
      l = { ordinal: n, label: lessonOrdinalLabel(n), chapterIdxs: [], counts: { vocab: 0, grammar: 0, translation: 0, other: 0 }, banks: [] };
      lessons.set(n, l);
    }
    return l;
  };

  const extraChapters: DerivedBook["extraChapters"] = [];
  doc.chapters.forEach((ch, idx) => {
    const ord = chapterLessonOrdinal(ch.title);
    if (ord != null && ch.kind === "lesson") {
      const les = lessonOf(ord);
      les.chapterIdxs.push(idx);
      for (const sec of ch.sections) {
        les.counts[bucketOf(sec.type)] += countSectionLines(sec.lines, sec.type);
      }
    } else {
      extraChapters.push({ idx, id: ch.id, title: ch.title, kind: ch.kind, sections: ch.sections.length });
    }
  });

  const unmatched: BankRef[] = [];
  for (const les of tests?.lessons ?? []) {
    const ord = bankLessonOrdinal(les.title);
    if (ord != null) lessonOf(ord).banks.push({ lesson: les.lesson, title: les.title, count: les.count });
    else unmatched.push({ lesson: les.lesson, title: les.title, count: les.count });
  }

  // گروه‌بندیِ بانک‌های بی‌درس با پیشوندِ عنوان — حفظِ ترتیبِ اولین ظهور
  const groups = new Map<string, BankRef[]>();
  for (const b of unmatched) {
    const g = bankGroupPrefix(b.title);
    const arr = groups.get(g);
    if (arr) arr.push(b);
    else groups.set(g, [b]);
  }

  return {
    grade: doc.grade,
    title: doc.title,
    pages: doc.pages,
    lessons: [...lessons.values()].sort((a, b) => a.ordinal - b.ordinal),
    otherBanks: [...groups.entries()].map(([group, banks]) => ({ group, banks })),
    extraChapters,
  };
};

// ------------------------------------------------------ بارگیری‌های شبکه

export interface JozveIndexLite {
  grades: { grade: number; title: string; pages: number; chapters: { id: string; title: string; kind: string; sections: { type: string; title: string; lines: number }[] }[] }[];
  totals?: { pages: number; keptLines: number };
}

const indexCache: { p: Promise<JozveIndexLite> | null } = { p: null };
export const loadJozveIndex = (): Promise<JozveIndexLite> => {
  if (!indexCache.p) indexCache.p = fetch("/jozve/index.json").then((r) => r.json());
  return indexCache.p;
};

const docCache = new Map<number, Promise<BookDoc | null>>();
export const loadBookDoc = (grade: number): Promise<BookDoc | null> => {
  let p = docCache.get(grade);
  if (!p) {
    p = fetch(`/jozve/g${grade}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    docCache.set(grade, p);
  }
  return p;
};

const testsCache = new Map<number, Promise<BookTestBank | null>>();
export const loadBookTests = (grade: number): Promise<BookTestBank | null> => {
  let p = testsCache.get(grade);
  if (!p) {
    p = fetch(`/jozve/tests-g${grade}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    testsCache.set(grade, p);
  }
  return p;
};
