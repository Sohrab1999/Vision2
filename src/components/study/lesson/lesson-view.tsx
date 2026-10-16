"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, MessageSquareText, BookOpenText, GraduationCap, ListChecks, Layers, PenLine, Ear, LibraryBig } from "lucide-react";
import { findLesson } from "@/data";
import { useStudy, knownCountOfLesson, type LessonTab } from "@/lib/study-store";
import { percent } from "@/lib/domain/percent";
import { themeOf, faNum } from "@/lib/study-theme";
import ProgressRing from "../practice/progress-ring";
import VocabTab from "./vocab-tab";
import ConversationTab from "./conversation-tab";
import ReadingTab from "./reading-tab";
import GrammarTab from "./grammar-tab";
import WritingTab from "./writing-tab";
import DictationTab from "./dictation-tab";
import LessonTestsTab from "./lesson-tests-tab";

const tabs: { key: LessonTab; label: string; icon: React.ElementType }[] = [
  { key: "vocab", label: "واژگان", icon: BookOpen },
  { key: "conversation", label: "مکالمه", icon: MessageSquareText },
  { key: "reading", label: "ریدینگ", icon: BookOpenText },
  { key: "grammar", label: "گرامر", icon: GraduationCap },
  { key: "writing", label: "نگارش", icon: PenLine },
  { key: "dictation", label: "دیکته", icon: Ear },
  { key: "tests", label: "تست‌ها", icon: ListChecks },
];

export default function LessonView({ id }: { id: number }) {
  const lesson = findLesson(id);
  const goHome = useStudy((s) => s.goHome);
  const setView = useStudy((s) => s.setView);
  const tab = useStudy((s) => s.lessonTab);
  const setTab = useStudy((s) => s.setLessonTab);
  const known = useStudy((s) => s.known);
  const flashIntent = useStudy((s) => s.flashIntent);
  const flashNonce = useStudy((s) => s.flashNonce);

  if (!lesson) {
    return <div className="p-10 text-center text-stone-500">درس یافت نشد.</div>;
  }

  const t = themeOf(lesson.color);
  const knownCount = knownCountOfLesson(known, lesson.id);
  const knownPercent = percent(knownCount, lesson.vocabulary.length);

  // «جزوهٔ همین درس» — پرش مستقیم به فصلِ همان درس در کتابخانهٔ جزوه‌ها.
  // نگاشت سنجیده و در زمانِ کلیک: اولین فصلِ kind=lesson با عنوان «درس N»
  // در جزوهٔ پایهٔ یازدهم (فصل‌های اصلی c3/c4/c5 قبل از فصل‌های گرامر و
  // کلیدِ تست‌ها در آرایه می‌آیند). اگر ایندکس در دسترس نبود، گرِیس‌فول:
  // جزوهٔ پایهٔ ۱۱ از فهرست باز می‌شود.
  const openJozve = () => {
    const ord = lesson.id === 1 ? "اول" : lesson.id === 2 ? "دوم" : "سوم";
    interface IdxChapter { id: string; kind: string; title: string }
    interface IdxGrade { grade: number; chapters: IdxChapter[] }
    type Idx = { grades?: IdxGrade[] };
    fetch("/jozve/index.json")
      .then((r) => r.json() as Promise<Idx>)
      .then((idx) => {
        const g11 = idx.grades?.find((g) => g.grade === 11);
        const ch = g11?.chapters?.find((c) => c.kind === "lesson" && c.title === `درس ${ord}`);
        setView({ type: "jozve", grade: 11, chapterId: ch?.id });
      })
      .catch(() => setView({ type: "jozve", grade: 11 }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* lesson header */}
      <div className={`overflow-hidden rounded-2xl border ${t.border} bg-white shadow-sm`}>
        <div className={`h-1.5 w-full bg-gradient-to-l ${t.gradient}`} />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goHome}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border c-card text-stone-500 transition-[color,background-color,transform] hover:bg-stone-50 hover:text-stone-700 active:scale-95"
              aria-label="بازگشت به خانه"
            >
              <ArrowRight size={18} />
            </button>
            <div>
              <span className={`mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${t.chipBg}`}>
                درس {lesson.id === 1 ? "اول" : lesson.id === 2 ? "دوم" : "سوم"} — پایهٔ یازدهم
              </span>{" "}
              {lesson.id <= 3 && (
                <button
                  onClick={openJozve}
                  title="متن کامل همین درس در جزوهٔ یازدهم — کتابخانهٔ جزوه‌ها"
                  className="mb-1 inline-flex translate-y-0.5 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 transition-[background-color,border-color,transform] hover:border-amber-300 hover:bg-amber-100 active:scale-95"
                >
                  <LibraryBig size={11} />
                  جزوهٔ همین درس
                </button>
              )}
              <h1 className={`en-text text-2xl font-bold leading-tight ${t.text}`} dir="ltr">
                “{lesson.titleEn}”
              </h1>
              <p className="text-sm font-bold text-stone-600">
                {lesson.titleFa} — <span className="font-normal text-stone-400">{lesson.tagline}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing percent={knownPercent} size={62} stroke={6} color={t.text.includes("amber") ? "#d97706" : t.text.includes("rose") ? "#e11d48" : "#059669"}>
              <span className="text-[11px] font-black text-stone-700">{faNum(knownPercent)}٪</span>
            </ProgressRing>
            <div className="text-[12px] leading-6 text-stone-500">
              <div>
                <b className="text-stone-700">{faNum(knownCount)}</b> از {faNum(lesson.vocabulary.length)} واژه
              </div>
              <div>
                <Layers size={11} className="inline align-middle" /> {faNum(lesson.quizzes.length)} تست
              </div>
            </div>
          </div>
        </div>

        {/* tab bar */}
        <nav className="flex gap-1 overflow-x-auto border-t border-stone-100 c-stone-70 px-3 py-2" aria-label="بخش‌های درس">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-colors ${
                  active
                    ? `${t.bg} text-white shadow-sm`
                    : "text-stone-500 hover:bg-white hover:text-stone-700"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* tab content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {tab === "vocab" && (
          <VocabTab
            key={`vocab-${flashNonce}`}
            lesson={lesson}
            startSmart={flashIntent === "smart"}
          />
        )}
        {tab === "conversation" && <ConversationTab lesson={lesson} />}
        {tab === "reading" && <ReadingTab lesson={lesson} />}
        {tab === "grammar" && <GrammarTab lesson={lesson} />}
        {tab === "writing" && <WritingTab lesson={lesson} />}
        {tab === "dictation" && <DictationTab lesson={lesson} />}
        {tab === "tests" && <LessonTestsTab lesson={lesson} />}
      </motion.div>
    </motion.div>
  );
}
