"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BookOpenText,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Languages,
  LibraryBig,
  Lightbulb,
  Link2,
  ListChecks,
  Loader2,
  PenLine,
  KeyRound,
  Search,
  Shapes,
  Volume2,
  X,
} from "lucide-react";
import { faNum } from "@/lib/study-theme";
import { speak } from "@/lib/speak";
import { useStudy } from "@/lib/study-store";
import QuizEngine from "../quiz/quiz-engine";
import type { QuizQuestion } from "@/lib/study-types";

// =====================================================================
// «کتابخانهٔ جزوه‌ها» — استخراجِ کامل و واژه‌به‌واژهٔ ۶ جزوهٔ پایهٔ ۷ تا ۱۲.
// درخواست صریح کاربر: «محتوای جزوه‌ها رو دقیق استخراج کن، همه رو، به جز
// اسم ناشر و نویسنده همه‌چیز رو دقیق استخراج کن».
// داده‌ها از PDFها با scripts/extract-jozve.cjs به public/jozve/*.json
// ریخته شده‌اند؛ این نما آن‌ها را فصل‌به‌فصل و سکشن‌به‌سکشن می‌خواند.
// =====================================================================

interface JozveSection {
  type: string;
  title: string;
  lines: string[];
}
interface JozveChapter {
  id: string;
  title: string;
  kind: "lesson" | "intro" | "appendix";
  zone: string;
  zoneLabel: string;
  sections: JozveSection[];
}
interface JozveDoc {
  grade: number;
  title: string;
  source: string;
  pages: number;
  authorExcluded: boolean;
  extraction: { keptLines: number; droppedAuthorLines: number; droppedJunkLines: number };
  chapters: JozveChapter[];
}
interface IndexChapter {
  id: string;
  title: string;
  kind: string;
  sections: { type: string; title: string; lines: number }[];
}
interface GradeIndex {
  grade: number;
  title: string;
  pages: number;
  chapters: IndexChapter[];
}
interface JozveIndex {
  grades: GradeIndex[];
  totals: { pages: number; keptLines: number; droppedAuthorLines: number; droppedJunkLines: number };
}

const GRADE_LABEL: Record<number, string> = { 7: "هفتم", 8: "هشتم", 9: "نهم", 10: "دهم", 11: "یازدهم", 12: "دوازدهم" };

const SECTION_META: Record<string, { label: string; icon: typeof BookOpen; cls: string }> = {
  vocab: { label: "واژگان", icon: BookOpen, cls: "text-amber-700 bg-amber-50 border-amber-200" },
  translation: { label: "ترجمه و مکالمه", icon: Languages, cls: "text-sky-700 bg-sky-50 border-sky-200" },
  grammar: { label: "گرامر", icon: Shapes, cls: "text-teal-700 bg-teal-50 border-teal-200" },
  writing: { label: "نگارش", icon: PenLine, cls: "text-rose-700 bg-rose-50 border-rose-200" },
  tests: { label: "تست و آزمون", icon: ListChecks, cls: "text-violet-700 bg-violet-50 border-violet-200" },
  explain: { label: "تشریح", icon: Lightbulb, cls: "text-orange-700 bg-orange-50 border-orange-200" },
  answer: { label: "پاسخنامه و کلید", icon: KeyRound, cls: "text-stone-600 bg-stone-100 border-stone-200" },
  appendix: { label: "ضمیمه", icon: LibraryBig, cls: "text-stone-600 bg-stone-100 border-stone-200" },
  intro: { label: "شروع درس", icon: BookOpenText, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  notes: { label: "یادداشت", icon: FileText, cls: "text-stone-600 bg-stone-50 border-stone-200" },
};
const sectionMeta = (t: string) => SECTION_META[t] ?? SECTION_META.notes;

const KIND_META: Record<string, { label: string; cls: string }> = {
  lesson: { label: "درس", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  intro: { label: "مقدمه", cls: "bg-stone-100 text-stone-700 border-stone-200" },
  appendix: { label: "بخش", cls: "bg-amber-100 text-amber-800 border-amber-200" },
};

// فارسی/انگلیسی بودن خط برای جهت‌دهی و دکمهٔ روخوانی
const isMostlyEnglish = (s: string) => {
  const letters = s.replace(/[^\p{L}]/gu, "");
  if (!letters) return false;
  const latin = (letters.match(/[\p{Script=Latin}]/gu) || []).length;
  return latin / letters.length > 0.6;
};

// —— کشِ ماژولی: index و اسناد پایه فقط یکبار از شبکه خوانده می‌شوند ——
let indexPromise: Promise<JozveIndex> | null = null;
const fetchIndex = (): Promise<JozveIndex> => {
  if (!indexPromise) indexPromise = fetch("/jozve/index.json").then((r) => r.json());
  return indexPromise;
};
const docCache = new Map<number, Promise<JozveDoc>>();
const fetchDoc = (grade: number): Promise<JozveDoc> => {
  let p = docCache.get(grade);
  if (!p) {
    p = fetch(`/jozve/g${grade}.json`).then((r) => r.json());
    docCache.set(grade, p);
  }
  return p;
};

// —— بانک‌های تستِ قابلِ‌اجرا از دلِ جزوه‌ها (ادامهٔ استخراج — r273) ——
// هر پایه‌ای که فایل tests-gN.json بگیرد این‌جا ثبت می‌شود؛ مانیفست شمارش‌ها
// برای کارت «اجرای تست» بدونِ شبکه است و خودِ فایل در لحظهٔ شروع خوانده می‌شود.
interface JozveTestQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface JozveTestBank {
  grade: number;
  answerArbitration?: { q: number; letter: string; why: string }[];
  lessons: { lesson: number; title: string; level: string; count: number; questions: JozveTestQuestion[] }[];
}
const GRADE_TESTS: Record<number, { lessons: { lesson: number; title: string; count: number }[] }> = {
  11: {
    lessons: [
      { lesson: 1, title: "درس اول", count: 40 },
      { lesson: 2, title: "درس دوم", count: 40 },
      { lesson: 3, title: "درس سوم", count: 40 },
      // r278 — بانک‌های تکمیلی با کلید گرید چاپی «پاسخنامه کلیدی» (بدون ترجمه)
      { lesson: 4, title: "تکمیلی درس اول (ص۲۱)", count: 22 },
      { lesson: 5, title: "تکمیلی درس سوم (ص۹۳)", count: 20 },
    ],
  },
  12: {
    lessons: [
      { lesson: 1, title: "درس اول", count: 100 },
      { lesson: 2, title: "درس دوم", count: 100 },
      { lesson: 3, title: "درس سوم", count: 100 },
    ],
  },
};
const testsCache = new Map<number, Promise<JozveTestBank | null>>();
const fetchTests = (grade: number): Promise<JozveTestBank | null> => {
  let p = testsCache.get(grade);
  if (!p) {
    p = GRADE_TESTS[grade]
      ? fetch(`/jozve/tests-g${grade}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);
    testsCache.set(grade, p);
  }
  return p;
};

// —— بانک‌های «جمع‌بندی گرامر و نگارش» (r276) ——
// فایل grammar-gN.json؛ کلید از شبکهٔ چاپی خود جزوه (پاسخنامه کلیدی) —
// ترجمهٔ فارسی برای تست‌های گرامر در جزوه چاپ نشده (غیبتِ صادقانه).
const GRADE_GRAMMAR: Record<number, { lessons: { lesson: number; title: string; count: number }[] }> = {
  11: {
    lessons: [
      { lesson: 1, title: "درس اول", count: 60 },
      { lesson: 2, title: "درس دوم", count: 70 },
      { lesson: 3, title: "درس سوم", count: 70 },
    ],
  },
};
const grammarCache = new Map<number, Promise<JozveTestBank | null>>();
const fetchGrammar = (grade: number): Promise<JozveTestBank | null> => {
  let p = grammarCache.get(grade);
  if (!p) {
    p = GRADE_GRAMMAR[grade]
      ? fetch(`/jozve/grammar-g${grade}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);
    grammarCache.set(grade, p);
  }
  return p;
};

// —— بانک‌های کنکوری/دستگرمی گرامر (r277) ——
// فایل grammar-gN-konkur.json؛ کلید از بلوک‌های توضیحی خود جزوه (N - گزینه (X))
// و این‌بار با ترجمهٔ فارسی خودِ جزوه (ترجمه تست) — برخلاف جمع‌بندی که بی‌ترجمه بود.
const GRADE_GRAMMAR_KONKUR: Record<number, { lessons: { lesson: number; title: string; count: number }[] }> = {
  11: {
    lessons: [
      { lesson: 1, title: "درس اول", count: 20 },
      { lesson: 2, title: "درس دوم", count: 20 },
      { lesson: 3, title: "درس سوم", count: 30 },
    ],
  },
};
const konkurCache = new Map<number, Promise<JozveTestBank | null>>();
const fetchKonkurGrammar = (grade: number): Promise<JozveTestBank | null> => {
  let p = konkurCache.get(grade);
  if (!p) {
    p = GRADE_GRAMMAR_KONKUR[grade]
      ? fetch(`/jozve/grammar-g${grade}-konkur.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);
    konkurCache.set(grade, p);
  }
  return p;
};

// —— بانک‌های موضوعی گرامر جزوه (r280) ——
// فایل grammar-gN-topic.json — هر درس = یک مبحث کامل از جزوه (اینجا: ضمایر موصولی
// و حذف آنها — ۸۸ تست، دو سطح، کلید گرید چاپی «پاسخنامه 88تست»). ترجمه برای این
// خانواده در جزوه چاپ نشده (غیبتِ صادقانه — الگوی r278/r279).
const GRADE_GRAMMAR_TOPIC: Record<number, { lessons: { lesson: number; title: string; count: number }[] }> = {
  12: {
    lessons: [
      { lesson: 1, title: "ضمایر موصولی — متوسط و کنکوری (ص۸۸)", count: 27 },
      { lesson: 2, title: "حذف ضمایر — نظام قدیم (ص۸۹-۹۱)", count: 61 },
      // r281 — بانک مرور زمان‌ها: بخش اول کلید توضیحی، بخش دوم کلید گرید چاپی
      { lesson: 3, title: "مرور زمان‌ها — متوسط (ص۱۴۲-۱۴۳)", count: 30 },
      { lesson: 4, title: "مرور زمان‌ها — استاندارد (ص۱۴۳-۱۴۵)", count: 50 },
      // r282 — سه بانک کلید-گرید sec23: افعال ناقص ص۱۴۹ + معلوم/مجهول ص۱۵۰ + تخصصی ص۱۵۱-۱۵۲
      { lesson: 5, title: "کاربردهای افعال ناقص — متوسط (ص۱۴۹)", count: 20 },
      { lesson: 6, title: "معلوم و مجهول — کنکوری (ص۱۵۰)", count: 20 },
      { lesson: 7, title: "افعال ناقص زمان گذشته — تخصصی (ص۱۵۱-۱۵۲)", count: 40 },
      // r283 — بانک‌های عبارات الحاق (Tag Questions): ص۴۴ دستگرمی با کلید گرید ص۱۸۷ + ص۴۵ کنکوری با کلید توضیحی ص۱۸۹-۱۹۱
      { lesson: 8, title: "عبارات الحاق (Tag Questions) — دستگرمی (ص۴۴)", count: 20 },
      { lesson: 9, title: "عبارات الحاق (Tag Questions) — کنکوری (ص۴۵)", count: 15 },
      // r284 — بانک‌های معلوم و مجهول: بخش اول آموزشی ص۳۶ (کلید توضیحی ص۱۸۵-۱۸۶) + بخش دوم کنکوری ص۳۷-۳۸ (گرید ص۱۸۷)
      { lesson: 10, title: "معلوم و مجهول — بخش اول، آموزشی (ص۳۶)", count: 20 },
      { lesson: 11, title: "معلوم و مجهول — بخش دوم، کنکوری (ص۳۷-۳۸)", count: 40 },
    ],
  },
};
const topicCache = new Map<number, Promise<JozveTestBank | null>>();
const fetchTopicGrammar = (grade: number): Promise<JozveTestBank | null> => {
  let p = topicCache.get(grade);
  if (!p) {
    p = GRADE_GRAMMAR_TOPIC[grade]
      ? fetch(`/jozve/grammar-g${grade}-topic.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);
    topicCache.set(grade, p);
  }
  return p;
};

const POS_KEY = "jozve-reader-pos-v1"; // آخرین موقعیت مطالعه

export default function JozveView() {
  const [index, setIndex] = useState<JozveIndex | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [doc, setDoc] = useState<JozveDoc | null>(null);
  const [failedGrade, setFailedGrade] = useState<number | null>(null);
  const [chapterIdx, setChapterIdx] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [speakingLine, setSpeakingLine] = useState<string | null>(null);
  const restored = useRef(false);
  const secAnchor = useRef<HTMLDivElement | null>(null);

  // deep-link «جزوهٔ همین درس» — نما با { type: "jozve", grade, chapterId }
  // مونت می‌شود و باید مستقیم روی فصلِ همان درس باز شود، نه روی آخرین
  // موقعیتِ ذخیره‌شده. الگوی رسمیِ «تنظیم state هنگام تغییر props» است:
  // اعمال در رندر (با گاردِ applied)، نه افکت — تا رندر آبشاری نداشته باشیم.
  const view = useStudy((s) => s.view);
  const linkGrade = view.type === "jozve" ? view.grade : undefined;
  const linkChapterId = view.type === "jozve" ? view.chapterId : undefined;
  const initialLinkGrade = useRef(linkGrade); // مقدارِ لحظهٔ مونت — برای گاردِ بازیابیِ موقعیت
  const [appliedLink, setAppliedLink] = useState<string | null>(null);
  const [appliedChapter, setAppliedChapter] = useState<string | null>(null);
  if (linkGrade != null) {
    const key = `${linkGrade}:${linkChapterId ?? ""}`;
    if (appliedLink !== key) {
      setAppliedLink(key);
      setGrade(linkGrade);
      setFailedGrade(null);
      setQuery("");
      setChapterIdx(null); // رزولوشنِ فصل فقط بعد از بارگیری سندِ درست
    }
  }
  if (doc && linkChapterId != null && doc.grade === linkGrade && appliedChapter !== linkChapterId) {
    const ci = doc.chapters.findIndex((c) => c.id === linkChapterId);
    if (ci >= 0) {
      setAppliedChapter(linkChapterId);
      setChapterIdx(ci);
    }
    // فصلِ یافت‌نشده = گرِیس‌فول: فهرست فصل‌های همان پایه باز می‌ماند
  }

  // بارگیری فهرست + بازگردانیِ آخرین موقعیت (همه در کالبکِ async — نه بدنهٔ افکت)
  // استثنا: deep-link «جزوهٔ همین درس» فعال است — آن هم اولویت و آخرین
  // موقعیت نباید جای آن را بگیرد.
  useEffect(() => {
    fetchIndex()
      .then((idx) => {
        setIndex(idx);
        if (restored.current) return;
        restored.current = true;
        if (initialLinkGrade.current != null) return; // deep-link اولویت دارد
        try {
          const pos = JSON.parse(localStorage.getItem(POS_KEY) || "null");
          if (pos && typeof pos.grade === "number" && idx.grades.some((g) => g.grade === pos.grade)) {
            setGrade(pos.grade);
            if (typeof pos.chapterIdx === "number") setChapterIdx(pos.chapterIdx);
          }
        } catch {}
      })
      .catch(() => {});
  }, []);

  // بارگیری سند پایهٔ انتخابی
  useEffect(() => {
    if (grade == null) return;
    let cancelled = false;
    fetchDoc(grade)
      .then((d) => {
        if (cancelled) return;
        setDoc(d);
        setChapterIdx((ci) => (ci != null && ci < d.chapters.length ? ci : null));
        setOpenSections(new Set([0]));
      })
      .catch(() => {
        if (!cancelled) setFailedGrade(grade);
      });
    localStorage.setItem(POS_KEY, JSON.stringify({ grade }));
    return () => {
      cancelled = true;
    };
  }, [grade]);

  // بارگیری در جریان = سندِ حاضر متعلق به پایهٔ فعلی نیست
  const loadingDoc = grade != null && doc?.grade !== grade && failedGrade !== grade;

  // ثبت موقعیت فصل
  useEffect(() => {
    if (grade != null && chapterIdx != null) localStorage.setItem(POS_KEY, JSON.stringify({ grade, chapterIdx }));
  }, [grade, chapterIdx]);

  // پرش نرم به سکشن پس از تغییر فصل
  useEffect(() => {
    if (chapterIdx == null) return;
    const t = setTimeout(() => secAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => clearTimeout(t);
  }, [chapterIdx]);

  const chapter = doc && chapterIdx != null ? doc.chapters[chapterIdx] : null;

  const totals = index?.totals;
  const chapterLines = useMemo(
    () => (chapter ? chapter.sections.reduce((a, s) => a + s.lines.length, 0) : 0),
    [chapter]
  );

  const toggleSection = useCallback((i: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const copySection = useCallback((sec: JozveSection) => {
    const text = `${sec.title}\n\n${sec.lines.join("\n")}`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(sec.title);
        setTimeout(() => setCopied(null), 1600);
      },
      () => {}
    );
  }, []);

  const sayEnglish = useCallback((line: string) => {
    setSpeakingLine(line);
    speak(line, 0.9, () => setSpeakingLine(null), () => setSpeakingLine(null));
  }, []);

  // اجرای تست واژگان جزوه — سشن QuizEngine مستقل (خارج از بانک ۳ درس):
  // trackMistakes=false چون این محتوا جزوهٔ پایه‌های دیگر است و نباید بانک
  // خطای درس‌های Vision 2 را آلوده کند؛ نتیجه زیر کلید مستقل خودش می‌رود.
  const [testSession, setTestSession] = useState<{
    title: string;
    questions: QuizQuestion[];
    resultKey: string;
    category: "vocab" | "grammar";
  } | null>(null);
  const [testLoadingLesson, setTestLoadingLesson] = useState<string | null>(null);
  const startJozveTest = useCallback(
    async (g: number, les: { lesson: number; title: string; count: number }) => {
      setTestLoadingLesson(`g${g}-l${les.lesson}`);
      try {
        const bank = await fetchTests(g);
        const l = bank?.lessons.find((x) => x.lesson === les.lesson);
        if (!l || l.questions.length === 0) return;
        const questions: QuizQuestion[] = l.questions.map((q) => ({
          id: q.id,
          category: "vocab",
          question: q.question,
          options: q.options,
          answer: q.answer,
          ...(q.translation ? { translation: q.translation } : {}),
        }));
        setTestSession({
          title: `آزمون واژگان جزوه — ${les.title} پایهٔ ${GRADE_LABEL[g]}`,
          questions,
          resultKey: `jozve-g${g}-l${les.lesson}`,
          category: "vocab",
        });
      } finally {
        setTestLoadingLesson(null);
      }
    },
    []
  );

  // اجرای آزمون گرامر جزوه (r276) — سشن مستقلِ همان‌خانواده: trackMistakes=false
  // (محتوای جزوهٔ پایه‌های دیگر)، نتیجه زیر کلید مستقل jozve-gN-gram-lM.
  const startJozveGrammar = useCallback(
    async (g: number, les: { lesson: number; title: string; count: number }) => {
      setTestLoadingLesson(`g${g}-gram-l${les.lesson}`);
      try {
        const bank = await fetchGrammar(g);
        const l = bank?.lessons.find((x) => x.lesson === les.lesson);
        if (!l || l.questions.length === 0) return;
        const questions: QuizQuestion[] = l.questions.map((q) => ({
          id: q.id,
          category: "grammar",
          question: q.question,
          options: q.options,
          answer: q.answer,
          ...(q.translation ? { translation: q.translation } : {}),
        }));
        setTestSession({
          title: `آزمون گرامر جزوه — ${les.title} پایهٔ ${GRADE_LABEL[g]}`,
          questions,
          resultKey: `jozve-g${g}-gram-l${les.lesson}`,
          category: "grammar",
        });
      } finally {
        setTestLoadingLesson(null);
      }
    },
    []
  );

  // اجرای بانک موضوعی گرامر (r280) — ضمایر موصولی دوازدهم؛ سشن مستقل با کلید گرید چاپی
  const startJozveTopic = useCallback(
    async (g: number, les: { lesson: number; title: string; count: number }) => {
      setTestLoadingLesson(`g${g}-tgram-l${les.lesson}`);
      try {
        const bank = await fetchTopicGrammar(g);
        const l = bank?.lessons.find((x) => x.lesson === les.lesson);
        if (!l || l.questions.length === 0) return;
        const questions: QuizQuestion[] = l.questions.map((q) => ({
          id: q.id,
          category: "grammar",
          question: q.question,
          options: q.options,
          answer: q.answer,
          ...(q.translation ? { translation: q.translation } : {}),
        }));
        setTestSession({
          title: `آزمون گرامر موضوعی جزوه — ${les.title} پایهٔ ${GRADE_LABEL[g]}`,
          questions,
          resultKey: `jozve-g${g}-tgram-l${les.lesson}`,
          category: "grammar",
        });
      } finally {
        setTestLoadingLesson(null);
      }
    },
    []
  );

  // اجرای بانک‌های کنکوری گرامر (r277) — کلید و ترجمه از بلوک‌های توضیحی خود جزوه
  const startJozveKonkur = useCallback(
    async (g: number, les: { lesson: number; title: string; count: number }) => {
      setTestLoadingLesson(`g${g}-kgram-l${les.lesson}`);
      try {
        const bank = await fetchKonkurGrammar(g);
        const l = bank?.lessons.find((x) => x.lesson === les.lesson);
        if (!l || l.questions.length === 0) return;
        const questions: QuizQuestion[] = l.questions.map((q) => ({
          id: q.id,
          category: "grammar",
          question: q.question,
          options: q.options,
          answer: q.answer,
          ...(q.translation ? { translation: q.translation } : {}),
        }));
        setTestSession({
          title: `تست‌های کنکوری گرامر جزوه — ${les.title} پایهٔ ${GRADE_LABEL[g]}`,
          questions,
          resultKey: `jozve-g${g}-kgram-l${les.lesson}`,
          category: "grammar",
        });
      } finally {
        setTestLoadingLesson(null);
      }
    },
    []
  );

  // نتایج جست‌وجو در سند بارگیری‌شده
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !doc) return [];
    const out: { ch: number; si: number; li: number; line: string }[] = [];
    for (let ci = 0; ci < doc.chapters.length; ci++) {
      const c = doc.chapters[ci];
      if (c.title.toLowerCase().includes(q)) out.push({ ch: ci, si: -1, li: -1, line: c.title });
      for (let si = 0; si < c.sections.length; si++) {
        const s = c.sections[si];
        if (s.title.toLowerCase().includes(q)) out.push({ ch: ci, si, li: -1, line: s.title });
        for (let li = 0; li < s.lines.length; li++) {
          if (s.lines[li].toLowerCase().includes(q)) {
            out.push({ ch: ci, si, li, line: s.lines[li] });
            if (out.length >= 300) return out;
          }
        }
      }
    }
    return out;
  }, [query, doc]);

  const jumpTo = useCallback((ch: number, si: number) => {
    setQuery("");
    setChapterIdx(ch);
    if (si >= 0) setOpenSections((prev) => new Set(prev).add(si));
    setTimeout(() => {
      if (si >= 0) document.getElementById(`jozve-sec-${si}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, []);

  const goBack = () => {
    if (chapterIdx != null) setChapterIdx(null);
    else if (grade != null) {
      setGrade(null);
      setDoc(null);
      setFailedGrade(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6" dir="rtl">
      {/* اجرای تست جزوه — سشن تمام‌عرض جایگزین خواننده */}
      {testSession && (
        <QuizEngine
          title={testSession.title}
          questions={testSession.questions}
          resultKeyStr={testSession.resultKey}
          lessonId="jozve"
          category={testSession.category}
          immediate
          trackMistakes={false}
          onExit={() => setTestSession(null)}
        />
      )}
      {!testSession && (
      <>
      {/* سرصفحه */}
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-stone-800">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
              <LibraryBig size={20} />
            </span>
            کتابخانهٔ جزوه‌ها
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-6 text-stone-500">
            استخراج کامل واژه‌به‌واژهٔ ۶ جزوهٔ پایهٔ {faNum(7)} تا {faNum(12)}
            {totals && (
              <> — {faNum(totals.pages)} صفحه، {faNum(totals.keptLines)} خط محتوا؛ فقط نام نویسنده/ناشر حذف شده است.</>
            )}
          </p>
        </div>
        {(chapterIdx != null || grade != null) && (
          <button
            onClick={goBack}
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] font-bold text-stone-600 shadow-sm transition hover:bg-stone-50 active:scale-95"
          >
            <ArrowRight size={15} />
            {chapterIdx != null ? "فهرست درس‌ها" : "انتخاب پایه"}
          </button>
        )}
      </header>

      {/* نوار پایه‌ها */}
      {index && (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="انتخاب پایه">
          {index.grades.map((g) => {
            const active = grade === g.grade;
            const lessons = g.chapters.filter((c) => c.kind === "lesson").length;
            return (
              <button
                key={g.grade}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setGrade(g.grade);
                  setChapterIdx(null);
                  setQuery("");
                }}
                className={`rounded-xl border px-3.5 py-2 text-[12.5px] font-extrabold shadow-sm transition-[background-color,border-color,transform] active:scale-95 ${
                  active
                    ? "border-amber-300 bg-amber-100 text-amber-900 shadow-amber-200/50"
                    : "border-stone-200 bg-white text-stone-600 hover:border-amber-200 hover:bg-amber-50"
                }`}
              >
                پایهٔ {GRADE_LABEL[g.grade]}
                <span className={`mr-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? "bg-amber-200 text-amber-900" : "bg-stone-100 text-stone-500"}`}>
                  {faNum(lessons)} درس
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* جست‌وجو (فقط وقتی سندی بارگیری شده) */}
      {doc && (
        <div className="relative mb-5">
          <Search size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`جست‌وجو در جزوهٔ پایهٔ ${GRADE_LABEL[doc.grade]}…`}
            className="w-full rounded-2xl border border-stone-200 bg-white py-2.5 pl-10 pr-10 text-[13px] font-medium text-stone-700 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            aria-label="جست‌وجو در جزوه"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="پاک کردن جست‌وجو"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* حالت‌ها */}
      {!index && (
        <div className="flex justify-center py-16">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-600" />
        </div>
      )}

      {loadingDoc && (
        <div className="flex justify-center py-16">
          <Loader2 size={30} className="animate-spin text-amber-500" />
        </div>
      )}

      {/* نتایج جست‌وجو */}
      {query && doc && (
        <section aria-label="نتایج جست‌وجو" className="mb-5 space-y-2">
          <h2 className="text-[13px] font-extrabold text-stone-700">
            {searchResults.length ? `${faNum(searchResults.length)} نتیجه برای «${query}»` : `نتیجه‌ای برای «${query}» یافت نشد`}
          </h2>
          <div className="max-h-96 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {searchResults.map((r, i) => {
              const ch = doc.chapters[r.ch];
              return (
                <button
                  key={`${r.ch}-${r.si}-${r.li}-${i}`}
                  onClick={() => jumpTo(r.ch, r.si)}
                  className="block w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-right shadow-sm transition hover:border-amber-300 hover:bg-amber-50/60"
                >
                  <span className="mb-0.5 block text-[10.5px] font-black text-amber-700">
                    {ch.title} {r.si >= 0 ? `› ${ch.sections[r.si].title.slice(0, 50)}` : ""}
                  </span>
                  <span dir="auto" className="line-clamp-2 block text-[12.5px] leading-6 text-stone-700">
                    {r.li >= 0 ? r.line : `سکشن: ${r.line}`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* فهرست فصل‌ها */}
      {doc && !query && chapterIdx == null && (
        <section aria-label="فهرست فصل‌ها" className="space-y-2.5">
          {/* اجرای تست واژگان جزوه — ادامهٔ استخراج (r273) */}
          {GRADE_TESTS[doc.grade] && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-white text-violet-700">
                  <ListChecks size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-black text-violet-900">آزمون واژگان این جزوه</h3>
                  <p className="text-[11px] leading-5 text-violet-700/80">
                    تست‌های استخراج‌شده از دلِ PDF جزوه، با کلیدِ خودِ جزوه — بانک‌های ۴۰تستی ترجمهٔ خود جزوه را هم دارند؛ پاسخ اشتباه به بانک خطای سه درس نمی‌رود
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {GRADE_TESTS[doc.grade].lessons.map((les) => {
                  const busy = testLoadingLesson === `g${doc.grade}-l${les.lesson}`;
                  return (
                    <button
                      key={les.lesson}
                      onClick={() => startJozveTest(doc.grade, les)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300 bg-white px-3 py-2 text-[12px] font-extrabold text-violet-800 shadow-sm transition-[background-color,transform] hover:bg-violet-100 active:scale-95 disabled:opacity-60"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <ListChecks size={14} />}
                      {les.title} — {faNum(les.count)} تست
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* اجرای آزمون گرامر جزوه — بانک جمع‌بندی با کلید شبکهٔ چاپی (r276) */}
          {GRADE_GRAMMAR[doc.grade] && (
            <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-700">
                  <PenLine size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-black text-teal-900">آزمون گرامر این جزوه</h3>
                  <p className="text-[11px] leading-5 text-teal-700/80">
                    بانک «جمع‌بندی گرامر و نگارش» با کلید شبکهٔ چاپی خودِ جزوه — بدون ترجمه (در جزوه چاپ نشده)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {GRADE_GRAMMAR[doc.grade].lessons.map((les) => {
                  const busy = testLoadingLesson === `g${doc.grade}-gram-l${les.lesson}`;
                  return (
                    <button
                      key={les.lesson}
                      onClick={() => startJozveGrammar(doc.grade, les)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-2 text-[12px] font-extrabold text-teal-800 shadow-sm transition-[background-color,transform] hover:bg-teal-100 active:scale-95 disabled:opacity-60"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />}
                      {les.title} — {faNum(les.count)} تست
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* اجرای بانک‌های کنکوری گرامر جزوه — کلید توضیحی + ترجمهٔ خود جزوه (r277) */}
          {GRADE_GRAMMAR_KONKUR[doc.grade] && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700">
                  <KeyRound size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-black text-sky-900">تست‌های کنکوری گرامر جزوه</h3>
                  <p className="text-[11px] leading-5 text-sky-700/80">
                    بانک‌های «دستگرمی/کنکوری» با کلید توضیحی و ترجمهٔ خودِ جزوه
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {GRADE_GRAMMAR_KONKUR[doc.grade].lessons.map((les) => {
                  const busy = testLoadingLesson === `g${doc.grade}-kgram-l${les.lesson}`;
                  return (
                    <button
                      key={les.lesson}
                      onClick={() => startJozveKonkur(doc.grade, les)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3 py-2 text-[12px] font-extrabold text-sky-800 shadow-sm transition-[background-color,transform] hover:bg-sky-100 active:scale-95 disabled:opacity-60"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                      {les.title} — {faNum(les.count)} تست
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* اجرای بانک موضوعی گرامر جزوه — کلید گرید چاپی (r280) */}
          {GRADE_GRAMMAR_TOPIC[doc.grade] && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700">
                  <Link2 size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-black text-amber-900">آزمون گرامر موضوعی جزوه</h3>
                  <p className="text-[11px] leading-5 text-amber-700/80">
                    بانک‌های مبحث‌محور با کلید گرید چاپی خودِ جزوه — سطح‌بندی مطابق سرصفحهٔ خود جزوه
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {GRADE_GRAMMAR_TOPIC[doc.grade].lessons.map((les) => {
                  const busy = testLoadingLesson === `g${doc.grade}-tgram-l${les.lesson}`;
                  return (
                    <button
                      key={les.lesson}
                      onClick={() => startJozveTopic(doc.grade, les)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-[12px] font-extrabold text-amber-800 shadow-sm transition-[background-color,transform] hover:bg-amber-100 active:scale-95 disabled:opacity-60"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                      {les.title} — {faNum(les.count)} تست
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {doc.chapters.map((c, ci) => {
            const km = KIND_META[c.kind] ?? KIND_META.intro;
            const lines = c.sections.reduce((a, s) => a + s.lines.length, 0);
            const sectionTypes = Array.from(new Set(c.sections.map((s) => s.type))).filter((t) => sectionMeta(t));
            return (
              <button
                key={c.id}
                onClick={() => {
                  setChapterIdx(ci);
                  setOpenSections(new Set([0]));
                }}
                className="block w-full rounded-2xl border border-stone-200 bg-white p-4 text-right shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${km.cls}`}>{km.label}</span>
                      {sectionTypes.slice(0, 5).map((t) => {
                        const m = sectionMeta(t);
                        return (
                          <span key={t} className={`hidden rounded-full border px-1.5 py-0.5 text-[9.5px] font-bold sm:inline ${m.cls}`}>
                            {m.label}
                          </span>
                        );
                      })}
                    </div>
                    <h3 className="truncate text-[14px] font-extrabold text-stone-800">{c.title}</h3>
                    <p className="mt-0.5 text-[11.5px] text-stone-500">
                      {faNum(c.sections.length)} سکشن · {faNum(lines)} خط
                    </p>
                  </div>
                  <ChevronDown size={17} className="mt-1 shrink-0 -rotate-90 text-stone-300" />
                </div>
              </button>
            );
          })}
          {/* گزارش صحت استخراج */}
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-[11.5px] leading-6 text-stone-500">
            <strong className="text-stone-700">گزارش صحت استخراج:</strong> از {faNum(doc.pages)} صفحهٔ PDF، {faNum(doc.extraction.keptLines)} خط
            محتوا واژه‌به‌واژه حفظ شد؛ {faNum(doc.extraction.droppedAuthorLines)} خطِ هویت نویسنده/ناشر و{" "}
            {faNum(doc.extraction.droppedJunkLines)} خطِ تکراری (شماره صفحه/فهرست) حذف شد. متن از PDF استخراج شده و ممکن است در واژه‌های
            کمی، آرتیفکت فونتی داشته باشد.
          </div>
        </section>
      )}

      {/* خوانندهٔ فصل */}
      {doc && chapter && (
        <section aria-label={chapter.title}>
          <div ref={secAnchor} className="-scroll-mt-24" />
          <div className="sticky top-14 z-10 -mx-1 mb-4 rounded-2xl border border-stone-200 c-veil-95 p-3 shadow-sm backdrop-blur">
            <h2 className="mb-2 truncate text-[15px] font-black text-stone-800">
              <span className={`mr-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-black align-middle ${KIND_META[chapter.kind]?.cls ?? KIND_META.intro.cls}`}>
                {KIND_META[chapter.kind]?.label ?? "بخش"}
              </span>
              {chapter.title}
              <span className="mr-2 text-[11px] font-medium text-stone-400">{faNum(chapterLines)} خط</span>
            </h2>
            {/* ناوبری سکشن‌ها */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {chapter.sections.map((s, si) => {
                const m = sectionMeta(s.type);
                const active = openSections.has(si);
                return (
                  <button
                    key={si}
                    onClick={() => {
                      if (!active) toggleSection(si);
                      document.getElementById(`jozve-sec-${si}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                      active ? m.cls : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
                    }`}
                    title={s.title}
                  >
                    {m.label} {faNum(si + 1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {chapter.sections.map((s, si) => {
              const m = sectionMeta(s.type);
              const open = openSections.has(si);
              const Icon = m.icon;
              return (
                <article
                  key={si}
                  id={`jozve-sec-${si}`}
                  className="scroll-mt-40 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggleSection(si)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-right transition hover:bg-stone-50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${m.cls}`}>
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-extrabold text-stone-800">{s.title}</span>
                        <span className="block text-[10.5px] text-stone-400">
                          {m.label} · {faNum(s.lines.length)} خط
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="کپی این سکشن"
                        onClick={(e) => {
                          e.stopPropagation();
                          copySection(s);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            copySection(s);
                          }
                        }}
                        className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
                      >
                        {copied === s.title ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </span>
                      <ChevronDown size={16} className={`text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-3">
                      <div className="max-h-[28rem] space-y-0.5 overflow-y-auto pr-1 scrollbar-thin">
                        {s.lines.map((line, li) => {
                          if (!line) return <div key={li} className="h-2.5" />;
                          const en = isMostlyEnglish(line);
                          return (
                            <p
                              key={li}
                              dir={en ? "ltr" : "auto"}
                              className={`group flex items-start gap-1.5 rounded-lg px-1.5 py-0.5 text-[13px] leading-7 hover:bg-white ${
                                en ? "justify-end text-left font-medium text-stone-800" : "text-stone-700"
                              }`}
                            >
                              <span className="min-w-0 flex-1 break-words">{line}</span>
                              {en && (
                                <button
                                  onClick={() => sayEnglish(line)}
                                  aria-label="روخوانی این خط"
                                  className="mt-1 shrink-0 text-stone-300 opacity-0 transition group-hover:opacity-100 hover:text-emerald-600"
                                >
                                  <Volume2 size={13} className={speakingLine === line ? "animate-pulse text-emerald-600" : ""} />
                                </button>
                              )}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* ناوبری فصل قبلی/بعدی */}
          <nav className="mt-5 flex items-center justify-between gap-2" aria-label="فصل بعدی و قبلی">
            {chapterIdx! < doc.chapters.length - 1 ? (
              <button
                onClick={() => {
                  setChapterIdx(chapterIdx! + 1);
                  setOpenSections(new Set([0]));
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-stone-600 shadow-sm transition hover:bg-stone-50 active:scale-95"
              >
                فصل بعد
                <ArrowRight size={14} className="rotate-180" />
              </button>
            ) : (
              <span />
            )}
            {chapterIdx! > 0 && (
              <button
                onClick={() => {
                  setChapterIdx(chapterIdx! - 1);
                  setOpenSections(new Set([0]));
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-stone-600 shadow-sm transition hover:bg-stone-50 active:scale-95"
              >
                <ArrowRight size={14} />
                فصل قبلی
              </button>
            )}
          </nav>
        </section>
      )}

      {/* خالی: پایه انتخاب شده ولی سند نیست */}
      {grade != null && !loadingDoc && !doc && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-[13px] text-stone-500">
          بارگیری جزوهٔ پایهٔ {GRADE_LABEL[grade]} ناموفق بود — دوباره تلاش کنید.
        </div>
      )}

      {/* انتخاب پایه */}
      {index && grade == null && (
        <section aria-label="معرفی کتابخانه" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {index.grades.map((g) => {
              const lessons = g.chapters.filter((c) => c.kind === "lesson").length;
              const sectionCount = g.chapters.reduce((a, c) => a + c.sections.length, 0);
              return (
                <button
                  key={g.grade}
                  onClick={() => {
                    setGrade(g.grade);
                    setChapterIdx(null);
                  }}
                  className="rounded-2xl border border-stone-200 bg-white p-4 text-right shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-stone-800">پایهٔ {GRADE_LABEL[g.grade]}</h3>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                      {faNum(g.pages)} صفحه
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-5 text-stone-500">{g.title}</p>
                  <p className="mt-2 text-[11px] font-bold text-stone-400">
                    {faNum(lessons)} درس · {faNum(sectionCount)} سکشن
                  </p>
                </button>
              );
            })}
          </div>
          {totals && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-[11.5px] leading-6 text-stone-500">
              <strong className="text-stone-700">در کل کتابخانه:</strong> {faNum(totals.pages)} صفحهٔ PDF از {faNum(6)} جزوه،{" "}
              {faNum(totals.keptLines)} خط محتوای حفظ‌شده؛ {faNum(totals.droppedAuthorLines)} خطِ نام نویسنده/ناشر حذف شده و{" "}
              {faNum(totals.droppedJunkLines)} خطِ شماره صفحه و نقطه‌چین فهرست پاک‌سازی شده است.
            </div>
          )}
        </section>
      )}
      </>
      )}
    </div>
  );
}
