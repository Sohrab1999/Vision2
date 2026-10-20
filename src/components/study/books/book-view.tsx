"use client";

// r397 — «کتاب‌های همهٔ پایه‌ها» — نمای درس‌به‌درسِ هر جزوه.
// خواستهٔ صریح کاربر: «حالا همهٔ این کتاب‌ها رو به وب‌اپ اضافه کن، همان‌طور
// که جزوهٔ یازدهم رو اضافه کردی — مرتب». این نما برای هر شش پایه همان
// تجربهٔ «درس» را می‌سازد: کارتِ هر درس + تب‌های واژگان/گرامر/ترجمه/متن/تست‌ها،
// با همان بانک‌های آزمونِ کتابخانه (کلید نتیجهٔ مشترک jozve-gN-lM) و پرش
// به متنِ کاملِ فصل در کتابخانهٔ جزوه‌ها. داده از استخراجِ موجود
// public/jozve/*.json می‌آید (src/lib/books.ts مشتق می‌کند).

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BookOpenText,
  GraduationCap,
  Languages,
  LibraryBig,
  ListChecks,
  Loader2,
  Search,
  Volume2,
  X,
} from "lucide-react";
import { faNum } from "@/lib/study-theme";
import { speak } from "@/lib/speak";
import { useStudy } from "@/lib/study-store";
import { mistakeTargetOf } from "@/lib/jozve-bank.client";
import QuizEngine from "../quiz/quiz-engine";
import type { QuizQuestion } from "@/lib/study-types";
import {
  bookMetaByGrade,
  deriveBook,
  isJunkVocabLine,
  loadBookDoc,
  loadBookTests,
  splitScriptLine,
  type BookChapter,
  type BookDoc,
  type BookMeta,
  type BookSection,
  type BookTestBank,
  type DerivedBook,
  type DerivedLesson,
  type ScriptLine,
} from "@/lib/books";

type BookTab = "vocab" | "grammar" | "translation" | "text" | "tests";

const TAB_META: { key: BookTab; label: string; icon: React.ElementType }[] = [
  { key: "vocab", label: "واژگان", icon: BookOpen },
  { key: "grammar", label: "گرامر", icon: GraduationCap },
  { key: "translation", label: "ترجمه و مکالمه", icon: Languages },
  { key: "text", label: "متن و تمرین", icon: BookOpenText },
  { key: "tests", label: "تست‌ها", icon: ListChecks },
];

// هر تب به کدام سکشن‌ها می‌خورد (به ترتیبِ خودِ جزوه)
const isTextSection = (type: string) => type !== "vocab" && type !== "grammar" && type !== "translation";

// ---------------------------------------------------- سطر خط دوزبانه

function LineRow({ line, onSpeak }: { line: string; onSpeak: (l: string) => void }) {
  const parts: ScriptLine = useMemo(() => splitScriptLine(line), [line]);
  if (!parts.en && !parts.fa) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-stone-50">
      {parts.en && (
        <button
          onClick={() => onSpeak(parts.en)}
          dir="ltr"
          className="en-text group flex max-w-[55%] shrink-0 items-start gap-1 text-left text-[13px] font-semibold leading-6 text-stone-800"
          title="روخوانی"
        >
          <span>{parts.en}</span>
          <Volume2 size={13} className="mt-1 shrink-0 text-stone-300 transition-colors group-hover:text-emerald-600" />
        </button>
      )}
      {parts.fa && (
        <span dir="rtl" className={`text-[13px] leading-6 text-stone-600 ${parts.en ? "flex-1 border-r border-stone-100 pr-2" : ""}`}>
          {parts.fa}
        </span>
      )}
    </div>
  );
}

function SectionCard({ sec, onSpeak, kind }: { sec: BookSection; onSpeak: (l: string) => void; kind: string }) {
  const lines = kind === "vocab" ? sec.lines.filter((l) => !isJunkVocabLine(l)) : sec.lines.filter((l) => l.trim());
  if (!lines.length) return null;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h4 className="mb-2 text-[12.5px] font-black text-stone-700">{sec.title}</h4>
      <div className="space-y-0.5">
        {lines.map((l, i) => (
          <LineRow key={i} line={l} onSpeak={onSpeak} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------- کارت درس

function LessonCard({
  meta,
  les,
  active,
  onOpen,
}: {
  meta: BookMeta;
  les: DerivedLesson;
  active: boolean;
  onOpen: () => void;
}) {
  const chips = [
    { n: les.counts.vocab, label: "واژه" },
    { n: les.counts.grammar, label: "خط گرامر" },
    { n: les.counts.translation, label: "خط ترجمه" },
    { n: les.banks.reduce((a, b) => a + b.count, 0), label: "تست" },
  ].filter((c) => c.n > 0);

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onOpen}
      className={`group flex flex-col rounded-2xl border bg-white p-4 text-right shadow-sm transition-[border-color,box-shadow] hover:shadow-md ${
        active ? `border-stone-300 ring-2 ${meta.ring}` : "border-stone-200 hover:border-stone-300"
      }`}
      aria-label={`${les.label} — باز کردن جزئیات`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${meta.chip}`}>
          <BookOpen size={12} />
          {les.label}
        </span>
        {les.chapterIdxs.length > 1 && (
          <span className="text-[10px] font-bold text-stone-400">{faNum(les.chapterIdxs.length)} بخش</span>
        )}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {chips.length ? (
          chips.map((c) => (
            <span key={c.label} className="rounded-lg bg-stone-100 px-2 py-0.5 text-[10.5px] font-bold text-stone-600">
              {faNum(c.n)} {c.label}
            </span>
          ))
        ) : (
          <span className="text-[11px] font-bold text-stone-400">فقط آزمون — متنِ این درس فصلِ جدا ندارد</span>
        )}
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-black text-stone-500 transition-colors group-hover:text-stone-800">
        باز کردن درس
        <ArrowRight size={14} className="rotate-180" />
      </span>
    </motion.button>
  );
}

// ---------------------------------------------------- نمای اصلی کتاب

export default function BookView({ grade }: { grade: number }) {
  const meta = bookMetaByGrade(grade);
  const goHome = useStudy((s) => s.goHome);
  const setView = useStudy((s) => s.setView);

  const [doc, setDoc] = useState<BookDoc | null>(null);
  const [tests, setTests] = useState<BookTestBank | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [tab, setTab] = useState<BookTab>("vocab");
  const [copied, setCopied] = useState<string | null>(null);

  // سشن آزمون — الگوی کتابخانهٔ جزوه‌ها؛ r404 — خطاها با سطلِ پایه‌ایِ
  // مستقل (g7..g12) ثبت می‌شوند و بانکِ سه درسِ Vision 2 دست‌نخورده می‌ماند.
  const [testSession, setTestSession] = useState<{
    title: string;
    questions: QuizQuestion[];
    resultKey: string;
    category: "vocab" | "grammar";
  } | null>(null);
  const [testLoading, setTestLoading] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setDoc(null);
    setTests(null);
    setFailed(false);
    setActive(null);
    setTestSession(null);
    Promise.all([loadBookDoc(grade), loadBookTests(grade)])
      .then(([d, t]) => {
        if (!alive) return;
        if (!d) setFailed(true);
        setDoc(d);
        setTests(t);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [grade]);

  const book: DerivedBook | null = useMemo(
    () => (doc ? deriveBook(doc, tests) : null),
    [doc, tests],
  );

  const activeLesson = useMemo(
    () => book?.lessons.find((l) => l.ordinal === active) ?? null,
    [book, active],
  );

  // تبِ آغازینِ هر درس: نخستین تبِ غیرخالی به ترتیبِ واژگان→گرامر→ترجمه→
  // متن→تست‌ها (درسِ بی‌متن مثل درس ۷/۸ جزوهٔ هفتم مستقیم روی تست‌ها می‌نشیند)
  useEffect(() => {
    if (!activeLesson) return;
    const c = activeLesson.counts;
    const bankCount = activeLesson.banks.reduce((a, b) => a + b.count, 0);
    if (c.vocab > 0) setTab("vocab");
    else if (c.grammar > 0) setTab("grammar");
    else if (c.translation > 0) setTab("translation");
    else if (c.other > 0) setTab("text");
    else if (bankCount > 0) setTab("tests");
  }, [activeLesson]);

  const openLesson = useCallback((ordinal: number) => {
    setActive((prev) => (prev === ordinal ? prev : ordinal));
    requestAnimationFrame(() => {
      document.getElementById("book-lesson-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const onSpeak = useCallback((line: string) => {
    speak(line, 0.9, () => {}, () => {});
  }, []);

  const copySection = useCallback((title: string, lines: string[]) => {
    navigator.clipboard?.writeText(lines.join("\n")).then(
      () => {
        setCopied(title);
        setTimeout(() => setCopied(null), 1600);
      },
      () => {},
    );
  }, []);

  const startBank = useCallback(
    async (bankRef: { lesson: number; title: string }) => {
      if (!tests) return;
      setTestLoading(`b${bankRef.lesson}`);
      try {
        const les = tests.lessons.find((x) => x.lesson === bankRef.lesson);
        if (!les || les.questions.length === 0) return;
        const isGrammar = (les.questions[0] as { category?: string })?.category === "grammar";
        const questions: QuizQuestion[] = les.questions.map((q) => {
          const qq = q as {
            id: string;
            question: string;
            options: string[];
            answer: number;
            translation?: string;
            kind?: "mcq" | "typed";
            accepted?: string[];
            placeholder?: string;
          };
          return {
            id: qq.id,
            category: isGrammar ? ("grammar" as const) : ("vocab" as const),
            question: qq.question,
            options: qq.options,
            answer: qq.answer,
            ...(qq.translation ? { translation: qq.translation } : {}),
            ...(qq.kind === "typed" ? { kind: "typed" as const, accepted: qq.accepted ?? [] } : {}),
            ...(qq.placeholder ? { placeholder: qq.placeholder } : {}),
          };
        });
        setTestSession({
          title: `${isGrammar ? "آزمون گرامر جزوه" : "آزمون واژگان جزوه"} — ${bankRef.title} — پایهٔ ${meta?.label ?? grade}`,
          questions,
          resultKey: `jozve-g${grade}-l${bankRef.lesson}`,
          category: isGrammar ? "grammar" : "vocab",
        });
      } finally {
        setTestLoading(null);
      }
    },
    [tests, grade, meta],
  );

  const openInLibrary = useCallback(
    (chapterId?: string) => setView({ type: "jozve", grade, chapterId }),
    [setView, grade],
  );

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-16 text-center text-stone-500" dir="rtl">
        کتاب این پایه یافت نشد.
      </div>
    );
  }

  // سشن آزمون — تمام‌عرض جایگزین نما (الگوی کتابخانهٔ جزوه‌ها)
  if (testSession) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6" dir="rtl">
        <QuizEngine
          title={testSession.title}
          questions={testSession.questions}
          resultKeyStr={testSession.resultKey}
          lessonId="jozve"
          category={testSession.category}
          immediate
          mistakesOf={mistakeTargetOf}
          onExit={() => setTestSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6" dir="rtl">
      {/* سرصفحهٔ کتاب */}
      <header className="mb-6">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className={`h-1.5 w-full bg-gradient-to-l ${meta.spine}`} />
          <div className="flex items-start justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b text-white shadow-sm ${meta.spine}`}>
                <LibraryBig size={20} />
              </span>
              <div>
                <span className={`mb-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-black ${meta.chip}`}>
                  پایهٔ {meta.label}
                </span>
                <h1 className="text-lg font-black leading-7 text-stone-800">{meta.title}</h1>
                {book && (
                  <p className="mt-1 text-[12px] leading-6 text-stone-500">
                    {faNum(book.pages)} صفحه · {faNum(book.lessons.length)} درس ·{" "}
                    {faNum(book.lessons.reduce((a, l) => a + l.banks.length, 0) + book.otherBanks.reduce((a, g) => a + g.banks.length, 0))} بانک آزمون
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={goHome}
              className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] font-bold text-stone-600 shadow-sm transition hover:bg-stone-50 active:scale-95"
              aria-label="بازگشت به خانه"
            >
              <ArrowRight size={15} />
              خانه
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => openInLibrary()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11.5px] font-extrabold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100 active:scale-95"
          >
            <LibraryBig size={13} />
            متنِ کامل در کتابخانهٔ جزوه‌ها
          </button>
          {/* r410 — جست‌وجوی متنیِ درونِ همین کتاب (فیلترِ پایه از پیش فعال) */}
          <button
            onClick={() => setView({ type: "search", grade })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[11.5px] font-extrabold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100 active:scale-95"
          >
            <Search size={13} />
            جست‌وجو در این کتاب
          </button>
        </div>
      </header>

      {/* بارگیری */}
      {!book && !failed && (
        <div className="flex justify-center py-16">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-500" />
        </div>
      )}
      {failed && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center text-[13px] font-bold text-rose-700">
          بارگیری کتاب ناموفق بود — اتصال را بررسی کن و دوباره تلاش کن.
        </div>
      )}

      {book && (
        <>
          {/* کارت‌های درس */}
          <section aria-label="درس‌های کتاب" className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-stone-800">
              <BookOpen size={17} className={meta.accent} />
              درس‌ها — برای مطالعه کلیک کن
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {book.lessons.map((les) => (
                <LessonCard key={les.ordinal} meta={meta} les={les} active={active === les.ordinal} onOpen={() => openLesson(les.ordinal)} />
              ))}
            </div>
          </section>

          {/* جزئیات درس فعال */}
          {activeLesson && (
            <motion.section
              id="book-lesson-detail"
              aria-label={`جزئیات ${activeLesson.label}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <div className={`h-1 w-full bg-gradient-to-l ${meta.spine}`} />
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 p-4">
                <div>
                  <h3 className={`text-base font-black ${meta.accent}`}>{activeLesson.label}</h3>
                  <p className="text-[11.5px] text-stone-500">
                    {activeLesson.chapterIdxs.length
                      ? `${faNum(activeLesson.chapterIdxs.length)} فصل از جزوه${activeLesson.banks.length ? ` · ${faNum(activeLesson.banks.length)} بانک آزمون` : ""}`
                      : "آزمون‌های این درس از بخشِ «نمونه سؤالات امتحانی» جزوه"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {activeLesson.chapterIdxs.length > 0 && (
                    <button
                      onClick={() => openInLibrary(doc?.chapters[activeLesson.chapterIdxs[0]]?.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-extrabold text-amber-800 transition hover:bg-amber-100 active:scale-95"
                    >
                      <LibraryBig size={12} />
                      متنِ کامل
                    </button>
                  )}
                  <button
                    onClick={() => setActive(null)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 text-stone-400 transition hover:bg-stone-50 hover:text-stone-600 active:scale-95"
                    aria-label="بستن جزئیات درس"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* نوار تب */}
              <nav className="flex gap-1 overflow-x-auto border-b border-stone-100 px-3 py-2" aria-label="بخش‌های درس">
                {TAB_META.map((t) => {
                  const Icon = t.icon;
                  const countOf: Record<BookTab, number> = {
                    vocab: activeLesson.counts.vocab,
                    grammar: activeLesson.counts.grammar,
                    translation: activeLesson.counts.translation,
                    text: activeLesson.counts.other,
                    tests: activeLesson.banks.reduce((a, b) => a + b.count, 0),
                  };
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      disabled={countOf[t.key] === 0}
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-extrabold transition-colors disabled:opacity-35 ${
                        tab === t.key ? `${meta.chip} shadow-sm` : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                      }`}
                    >
                      <Icon size={14} />
                      {t.label}
                      {countOf[t.key] > 0 && <span className="text-[10px] font-black opacity-60">{faNum(countOf[t.key])}</span>}
                    </button>
                  );
                })}
              </nav>

              {/* محتوای تب */}
              <div className="p-4">
                {tab === "tests" && (
                  <div className="space-y-2">
                    {activeLesson.banks.length === 0 && (
                      <p className="py-6 text-center text-[12.5px] font-bold text-stone-400">
                        بانک آزمونی برای این درس ثبت نشده است.
                      </p>
                    )}
                    {activeLesson.banks.map((b) => {
                      const busy = testLoading === `b${b.lesson}`;
                      return (
                        <button
                          key={b.lesson}
                          onClick={() => startBank(b)}
                          disabled={busy}
                          className="flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-right shadow-sm transition hover:border-stone-300 hover:bg-stone-50 active:scale-[0.99] disabled:opacity-60"
                        >
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-extrabold text-stone-700">{b.title}</span>
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-black text-stone-500">
                            {busy ? <Loader2 size={13} className="animate-spin" /> : <ListChecks size={13} />}
                            {faNum(b.count)} تست
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {tab !== "tests" && activeLesson.chapterIdxs.length > 0 && (
                  <div className="max-h-[32rem] space-y-3 overflow-y-auto pl-1 scrollbar-thin">
                    {activeLesson.chapterIdxs
                      .flatMap((ci) => {
                        const ch: BookChapter = doc!.chapters[ci];
                        return ch.sections
                          .map((sec, si) => ({ sec, si }))
                          .filter(({ sec }) => (tab === "text" ? isTextSection(sec.type) : sec.type === tab));
                      })
                      .map(({ sec, si }) => (
                        <div key={`${activeLesson.ordinal}-${si}-${sec.title}`}>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <h4 className="truncate text-[11.5px] font-black text-stone-400">{sec.title}</h4>
                            <button
                              onClick={() => copySection(sec.title, sec.lines)}
                              className="shrink-0 rounded-lg border border-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-400 transition hover:bg-stone-50 hover:text-stone-600 active:scale-95"
                              aria-label={`کپی ${sec.title}`}
                            >
                              {copied === sec.title ? "کپی شد ✓" : "کپی"}
                            </button>
                          </div>
                          <SectionCard sec={sec} onSpeak={onSpeak} kind={tab === "text" ? "other" : tab} />
                        </div>
                      ))}
                  </div>
                )}

                {tab !== "tests" && activeLesson.chapterIdxs.length === 0 && (
                  <p className="py-6 text-center text-[12.5px] font-bold text-stone-400">
                    این درس در متنِ جزوه فصلِ جدا ندارد — از تبِ «تست‌ها» ادامه بده.
                  </p>
                )}
              </div>
            </motion.section>
          )}

          {/* بخش‌های آزمونِ بی‌درس — نهایی‌ها، جامع، تشریحی… */}
          {book.otherBanks.length > 0 && (
            <section aria-label="بخش‌های آزمون دیگر جزوه" className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-stone-800">
                <ListChecks size={17} className={meta.accent} />
                بخش‌های آزمونِ دیگر جزوه
              </h2>
              <div className="space-y-2.5">
                {book.otherBanks.map((g) => (
                  <details key={g.group} className="rounded-2xl border border-stone-200 bg-white shadow-sm open:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-black text-stone-700">{g.group}</span>
                      <span className="shrink-0 rounded-lg bg-stone-100 px-2 py-0.5 text-[10.5px] font-black text-stone-500">
                        {faNum(g.banks.length)} بانک · {faNum(g.banks.reduce((a, b) => a + b.count, 0))} تست
                      </span>
                    </summary>
                    <div className="space-y-1.5 border-t border-stone-100 p-3">
                      {g.banks.map((b) => {
                        const busy = testLoading === `b${b.lesson}`;
                        return (
                          <button
                            key={b.lesson}
                            onClick={() => startBank(b)}
                            disabled={busy}
                            className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-right transition hover:bg-stone-50 active:scale-[0.99] disabled:opacity-60"
                          >
                            <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-stone-600">{b.title}</span>
                            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-black text-stone-400">
                              {busy ? <Loader2 size={13} className="animate-spin" /> : <ListChecks size={12} />}
                              {faNum(b.count)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* فصل‌های دیگر جزوه — مسیر کتابخانه */}
          {book.extraChapters.length > 0 && (
            <section aria-label="فصل‌های دیگر جزوه" className="mb-2">
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-stone-800">
                <BookOpenText size={17} className={meta.accent} />
                فصل‌های دیگر جزوه
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {book.extraChapters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openInLibrary(c.id)}
                    className="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-right shadow-sm transition hover:border-amber-300 hover:bg-amber-50/60 active:scale-[0.99]"
                  >
                    <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-stone-700">{c.title}</span>
                    <span className="shrink-0 text-[10.5px] font-bold text-stone-400">{faNum(c.sections)} سکشن</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
