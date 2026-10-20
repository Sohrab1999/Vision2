// ------------------------------------------------------------------
// r410 — «جست‌وجو در کتاب‌ها» — کورپوسِ سرور (فقط runtime nodejs).
//
// همان الگوی jozve-bank.ts: فایل‌های عمومیِ public/jozve/*.json با
// node:fs خوانده می‌شوند؛ تنبل و یک‌بارمصرف؛ خرابیِ یک فایل هرگز کل
// لودر را نمی‌اندازد. رکوردهای جست‌وجو یک‌بار ساخته و با haystackِ
// نرمال‌شده پیش‌محاسبه می‌شوند تا هر پرس‌وجو یک اسکنِ خطیِ ارزان باشد:
//   • ۶ کتابِ g7-g12 → رکوردِ «text» (خط‌به‌خط، با سکشن/فصل)
//   • ۹ بانکِ tests-*/grammar-* → رکوردِ «question» (سؤال + گزینه‌ها + ترجمه)
// رتبه‌بندی با scoreHaystack (lib/jozve-search) و پراکنده‌سازیِ
// متنوع: نتایج از همهٔ اسناد نوبتی می‌آیند تا یک کتاب نتایج را
// انحصار نگیرد (رفتارِ جست‌وجوی کتاب‌به‌کتاب، نه ریزشِ سیلابِ یک بانک).
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import path from "node:path";
import { examBank } from "@/data/exam";
import { examBankG10 } from "@/data/exam-g10";
import lesson1 from "@/data/lesson1";
import lesson2 from "@/data/lesson2";
import lesson3 from "@/data/lesson3";
import {
  buildPhraseRegex,
  makeSnippet,
  normSearchText,
  scoreHaystack,
  searchTerms,
  type JozveSearchResult,
} from "./jozve-search";

const BOOK_TITLES: Record<number, string> = {
  7: "جزوه کامل زبان انگلیسی پایه هفتم",
  8: "جزوه کامل زبان انگلیسی پایه هشتم",
  9: "جزوه کامل زبان انگلیسی پایه نهم",
  10: "جزوه جامع زبان انگلیسی پایه دهم",
  11: "جزوه جامع کمک‌آموزشی زبان انگلیسی پایه یازدهم",
  12: "جزوه جامع پایه دوازدهم همراه با امتحانات نهایی",
};

const BANK_META: { file: string; doc: string; grade: number }[] = [
  { file: "tests-g7.json", doc: "tests-g7", grade: 7 },
  { file: "tests-g8.json", doc: "tests-g8", grade: 8 },
  { file: "tests-g9.json", doc: "tests-g9", grade: 9 },
  { file: "tests-g10.json", doc: "tests-g10", grade: 10 },
  { file: "tests-g11.json", doc: "tests-g11", grade: 11 },
  { file: "tests-g12.json", doc: "tests-g12", grade: 12 },
  { file: "grammar-g11.json", doc: "grammar-g11", grade: 11 },
  { file: "grammar-g11-konkur.json", doc: "grammar-g11-konkur", grade: 11 },
  { file: "grammar-g12-topic.json", doc: "grammar-g12-topic", grade: 12 },
];

/** سقفِ نتیجه در هر سند در پاسخ نهایی — متنوع‌سازیِ نتایج */
const PER_DOC_CAP = 12;

// r411 — بانک‌هایِ باندلِ کتابِ ویژن ۲ (همان ۱٬۶۷۴ سؤالِ teacher-bank):
// سه درس (۴۵۲) + آزمونِ جامع (۳۶۰) + بانکِ کنکورِ دهم (۸۶۲). اینها آخرین
// حلقهٔ کورِ جست‌وجو بودند — نتایجِ جست‌وجو اکنون کلِ محتوایِ اپ را پوشش می‌دهد
// (۶٬۲۲۲ جزوه + ۱٬۶۷۴ باندل = ۷٬۸۹۶ سؤال — هم‌عددِ ایندکسِ گستردهٔ معلم).
const VISION2_BOOK = "کتاب ویژن ۲ — پایهٔ یازدهم";
const KONKUR_BOOK = "بانک کنکور دهم";

const BUNDLED_QUESTIONS: {
  doc: string;
  grade: number;
  bookTitle: string;
  bankTitle: string;
  questions: { id?: unknown; question?: unknown; options?: unknown; answer?: unknown; translation?: unknown }[];
}[] = [
  { doc: "lesson-1", grade: 11, bookTitle: VISION2_BOOK, bankTitle: "درس ۱ — Understanding People", questions: lesson1.quizzes },
  { doc: "lesson-2", grade: 11, bookTitle: VISION2_BOOK, bankTitle: "درس ۲ — A Healthy Lifestyle", questions: lesson2.quizzes },
  { doc: "lesson-3", grade: 11, bookTitle: VISION2_BOOK, bankTitle: "درس ۳ — Art and Culture", questions: lesson3.quizzes },
  { doc: "exam-360", grade: 11, bookTitle: VISION2_BOOK, bankTitle: "آزمون جامع — بانک ۳۶۰ تستی", questions: examBank },
  { doc: "konkur-g10", grade: 10, bookTitle: KONKUR_BOOK, bankTitle: "بانک کنکور دهم (۸۶۲ تست)", questions: examBankG10 },
];

interface SearchRecord {
  kind: "text" | "question";
  grade: number;
  doc: string;
  bookTitle: string;
  titleHay: string; // عنوانِ فصل+سکشن یا بانک — نرمال‌شده
  haystack: string; // متنِ نرمال‌شده
  // text
  chapterId?: string;
  chapterTitle?: string;
  sectionTitle?: string;
  sectionType?: string;
  lineIdx?: number;
  lineText?: string;
  // question
  bankLesson?: number;
  bankTitle?: string;
  questionId?: string;
  question?: string;
  options?: string[];
  answer?: number;
  translation?: string;
}

/** سطرهای زبالهٔ سربرگِ جدول واژگان — هم‌قراردادِ books.ts */
const isJunk = (t: string): boolean =>
  !t.trim() || /^کلمه\s*\(\)\s*\d/.test(t) || /^Persian Meanings/i.test(t);

function loadDoc(grade: number): SearchRecord[] {
  try {
    const filePath = path.join(process.cwd(), "public", "jozve", `g${grade}.json`);
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    const chapters =
      typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { chapters?: unknown }).chapters)
        ? ((parsed as { chapters: { id?: string; title?: string; sections?: unknown }[] }).chapters)
        : [];
    const bookTitle = BOOK_TITLES[grade] ?? `جزوه پایه ${grade}`;
    const out: SearchRecord[] = [];
    for (const ch of chapters) {
      const chapterTitle = typeof ch.title === "string" ? ch.title : "";
      const chapterId = typeof ch.id === "string" ? ch.id : "";
      if (!Array.isArray(ch.sections)) continue;
      for (const sec of ch.sections) {
        if (!sec || !Array.isArray((sec as { lines?: unknown }).lines)) continue;
        const sectionTitle = typeof (sec as { title?: unknown }).title === "string" ? ((sec as { title: string }).title) : "";
        const sectionType = typeof (sec as { type?: unknown }).type === "string" ? ((sec as { type: string }).type) : "other";
        const titleHay = normSearchText(`${chapterTitle} ${sectionTitle}`);
        const lines = (sec as { lines: unknown[] }).lines;
        for (let li = 0; li < lines.length; li++) {
          const raw = typeof lines[li] === "string" ? (lines[li] as string) : "";
          if (isJunk(raw)) continue;
          out.push({
            kind: "text",
            grade,
            doc: `g${grade}`,
            bookTitle,
            titleHay,
            haystack: normSearchText(raw),
            chapterId,
            chapterTitle,
            sectionTitle,
            sectionType,
            lineIdx: li,
            lineText: raw,
          });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** سازندهٔ مشترکِ رکوردِ سؤال — بانکِ جزوه و باندل یک‌شکل ایندکس می‌شوند */
function questionRecord(input: {
  raw: unknown;
  doc: string;
  grade: number;
  bookTitle: string;
  bankTitle: string;
  bankLesson?: number;
}): SearchRecord | null {
  if (!input.raw || typeof input.raw !== "object") return null;
  const q = input.raw as {
    id?: unknown; question?: unknown; options?: unknown; answer?: unknown; translation?: unknown;
  };
  if (typeof q.question !== "string" || !q.question.trim()) return null;
  const options = Array.isArray(q.options)
    ? q.options.filter((o): o is string => typeof o === "string")
    : [];
  const answer = typeof q.answer === "number" ? q.answer : undefined;
  const translation = typeof q.translation === "string" && q.translation.trim() ? q.translation : undefined;
  return {
    kind: "question",
    grade: input.grade,
    doc: input.doc,
    bookTitle: input.bookTitle,
    titleHay: normSearchText(input.bankTitle),
    haystack: normSearchText([q.question, ...options, translation ?? ""].join(" ")),
    bankLesson: input.bankLesson,
    bankTitle: input.bankTitle,
    questionId: typeof q.id === "string" ? q.id : undefined,
    question: q.question,
    options,
    answer,
    translation,
  };
}

function loadBank(meta: { file: string; doc: string; grade: number }): SearchRecord[] {
  try {
    const filePath = path.join(process.cwd(), "public", "jozve", meta.file);
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    const lessons =
      typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { lessons?: unknown }).lessons)
        ? ((parsed as { lessons: unknown[] }).lessons)
        : [];
    const bookTitle = BOOK_TITLES[meta.grade] ?? `جزوه پایه ${meta.grade}`;
    const out: SearchRecord[] = [];
    for (const les of lessons) {
      if (!les || !Array.isArray((les as { questions?: unknown }).questions)) continue;
      const bankLesson = typeof (les as { lesson?: unknown }).lesson === "number" ? ((les as { lesson: number }).lesson) : 0;
      const bankTitle = typeof (les as { title?: unknown }).title === "string" ? ((les as { title: string }).title) : "";
      for (const raw of (les as { questions: unknown[] }).questions) {
        const rec = questionRecord({ raw, doc: meta.doc, grade: meta.grade, bookTitle, bankTitle, bankLesson });
        if (rec) out.push(rec);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** بانک‌هایِ باندلِ کلاینت-امن (دادهٔ درس‌ها/آزمون/کنکور) — بدونِ fs */
function loadBundled(): SearchRecord[] {
  const out: SearchRecord[] = [];
  for (const b of BUNDLED_QUESTIONS) {
    for (const raw of b.questions) {
      const rec = questionRecord({ raw, doc: b.doc, grade: b.grade, bookTitle: b.bookTitle, bankTitle: b.bankTitle });
      if (rec) out.push(rec);
    }
  }
  return out;
}

let corpus: SearchRecord[] | null = null;

/** کلِ رکوردهای قابلِ جست‌وجو (تنبل، کشِ یک‌بارمصرف؛ هرگز throw نمی‌کند) */
export function jozveSearchCorpus(): SearchRecord[] {
  if (!corpus) {
    const all: SearchRecord[] = [];
    for (let g = 7; g <= 12; g++) all.push(...loadDoc(g));
    for (const m of BANK_META) all.push(...loadBank(m));
    all.push(...loadBundled()); // r411 — آخرین حلقهٔ کورِ جست‌وجو
    corpus = all;
  }
  return corpus;
}

/** شمارِ رکوردهای ایندکس‌شده — برای تست پیمان‌ها و برچسبِ نما */
export function jozveSearchCorpusSize(): { text: number; question: number } {
  let text = 0;
  let question = 0;
  for (const r of jozveSearchCorpus()) {
    if (r.kind === "text") text += 1;
    else question += 1;
  }
  return { text, question };
}

export interface JozveSearchOptions {
  grade?: number;
  kind?: "text" | "question";
  limit?: number;
}

/**
 * جست‌وجوی سراسری: AND سختِ جملات، امتیازِ scoreHaystack، سپس
 * نوبت‌کشیِ میانِ اسناد (هر سند تا PER_DOC_CAP) تا limit.
 * total = شمارِ کلِ تطبیق‌ها (پیش از کپ) برای «و …».
 */
export function searchJozve(
  q: string,
  opts: JozveSearchOptions = {},
): { total: number; results: JozveSearchResult[] } {
  const terms = searchTerms(q);
  if (!terms.length) return { total: 0, results: [] };
  const phrase = normSearchText(q);
  // r412 — لایهٔ عبارتِ پیوسته: یک بار در هر پرس‌وجو ساخته می‌شود؛
  // هم برایِ مرکزِ قطعه (snippet) و هم برایِ پرچمِ phraseHit
  const phraseRe = buildPhraseRegex(terms);
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 60);

  // r413 — پرچمِ عبارتِ پیوسته روی «متنِ خام» یک‌بار در حلقهٔ امتیازدهی
  // محاسبه می‌شود و هم به رتبه‌بندی و هم به شکلِ سیم می‌رسد — پیش‌تر پرچم
  // فقط پس از انتخابِ نتایج دوباره‌آزمایی می‌شد و در ترتیب هیچ نقشی نداشت.
  const rawHit = (r: SearchRecord): boolean => {
    if (!phraseRe) return false;
    const raw = r.kind === "text" ? (r.lineText ?? "") : (r.question ?? "");
    return new RegExp(phraseRe.source, "gi").test(raw); // نمونهٔ تازه — lastIndexِ مستقل
  };

  // امتیازدهی + گروه‌بندیِ تطبیق‌ها بر پایهٔ سند — برای پراکنده‌سازیِ متنوع
  const byDoc = new Map<string, { rec: SearchRecord; score: number; phraseHit: boolean }[]>();
  let total = 0;
  for (const r of jozveSearchCorpus()) {
    if (opts.grade != null && r.grade !== opts.grade) continue;
    if (opts.kind != null && r.kind !== opts.kind) continue;
    const score = scoreHaystack(r.haystack, r.titleHay, terms, phrase);
    if (score == null) continue;
    total += 1;
    if (total > 2000) break; // سقفِ ایمنیِ پیمایش
    const entry = { rec: r, score, phraseHit: rawHit(r) };
    const arr = byDoc.get(r.doc);
    if (arr) arr.push(entry);
    else byDoc.set(r.doc, [entry]);
  }

  // هر سند: نزولیِ امتیاز؛ هم‌امتیازها → عبارتِ پیوسته اول (tie-breakِ صریحِ r413 —
  // پیش‌تر +۶ غیرمستقیمِ scoreHaystack فقط روی haystackِ نرمال بود و رکوردی که
  // عبارت در متنِ خامِ‌شان نشسته اما در گزینه‌ها/ترجمه پراکنده است می‌ماند عقب)
  for (const arr of byDoc.values()) {
    arr.sort((a, b) => b.score - a.score || Number(b.phraseHit) - Number(a.phraseHit));
  }

  // r414 — رتبه‌بندیِ سراسریِ گروه‌ها پیش از نوبت‌کشی: تاکنون اسناد به
  // ترتیبِ کورپوس می‌آمدند و یک گروهِ بی‌عبارتِ کم‌امتیاز می‌توانست پیشِ
  // گروهِ عبارت‌دار بنشیند (QAِ «حال کامل»: tests-g12 با سرِ ۴ جلوتر از
  // lesson-2 با سرِ ۱۱). کلیدِ رتبه = (سرِ سند عبارتِ پیوسته دارد؟،
  // بهترینِ امتیازِ سند) — همان روحِ tie-breakِ درون‌سندیِ r413، این بار
  // میانِ کتاب‌ها؛ تساویِ کامل → ترتیبِ کورپوس (sortِ پایدار). «سرِ سند»
  // همیشه در دورِ اولِ نوبت‌کشی به نتایج می‌رسد، پس کلیدِ رتبه مستقل از
  // کپِ هر سند قابلِ بازسازی است — پیمانِ r414 دقیقاً همین را قفل می‌کند.
  const docs = [...byDoc.entries()]
    .map(([doc, arr]) => ({ doc, head: arr[0] }))
    .sort(
      (a, b) =>
        Number(b.head.phraseHit) - Number(a.head.phraseHit) || b.head.score - a.head.score,
    )
    .map((e) => e.doc);

  const perDoc = new Map<string, number>();
  const picked: { rec: SearchRecord; score: number; phraseHit: boolean }[] = [];
  for (let round = 0; picked.length < limit && round < PER_DOC_CAP; round++) {
    let advanced = false;
    for (const doc of docs) {
      const arr = byDoc.get(doc)!;
      if (round >= arr.length) continue;
      if ((perDoc.get(doc) ?? 0) >= PER_DOC_CAP) continue;
      picked.push(arr[round]);
      perDoc.set(doc, round + 1);
      advanced = true;
      if (picked.length >= limit) break;
    }
    if (!advanced) break;
  }

  const results = picked.map(({ rec: r, score, phraseHit }) => {
    const raw = r.kind === "text" ? (r.lineText ?? "") : (r.question ?? "");
    const base: JozveSearchResult = {
      kind: r.kind,
      grade: r.grade,
      doc: r.doc,
      bookTitle: r.bookTitle,
      text: raw,
      snippet: makeSnippet(raw, terms, 70, phraseRe),
      score,
    };
    // r412/r413 — عبارتِ پیوسته در «متنِ خامِ» رکورد نشسته است؟ (نه فقط در
    // haystackِ نرمال — هایلایتِ کلاینت روی متنِ خام زندگی می‌کند)؛
    // پرچمِ محاسبه‌شده در حلقهٔ امتیازدهی همان‌جا مصرف می‌شود — بدونِ دوباره‌آزمایی.
    if (r.kind === "text") {
      base.chapterId = r.chapterId;
      base.chapterTitle = r.chapterTitle;
      base.sectionTitle = r.sectionTitle;
      base.sectionType = r.sectionType;
      base.lineIdx = r.lineIdx;
    } else {
      base.bankLesson = r.bankLesson;
      base.bankTitle = r.bankTitle;
      base.questionId = r.questionId;
      base.options = r.options;
      base.answer = r.answer;
      base.translation = r.translation;
    }
    if (phraseHit) base.phraseHit = true;
    return base;
  });

  return { total, results };
}
