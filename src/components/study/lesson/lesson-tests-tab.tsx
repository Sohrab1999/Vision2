"use client";

import { useState } from "react";
import { ListChecks, Shuffle, BookA, BookMarked, PenLine, Eraser } from "lucide-react";
import type { LessonData, QuizCategory, QuizQuestion } from "@/lib/study-types";
import { useStudy, resultKey, mistakesOfLesson } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { themeOf, faNum } from "@/lib/study-theme";
import QuizEngine from "../quiz/quiz-engine";

const categoryInfo: { key: QuizCategory; label: string; desc: string; icon: React.ElementType }[] = [
  { key: "vocab", label: "تست واژگان — سطح استاندارد", desc: "برگرفته از بخش «تست واژگان» جزوه همراه با ترجمهٔ پاسخ‌ها", icon: BookA },
  { key: "vocab-konkuri", label: "تست واژگان — سطح کنکوری", desc: "تست‌های سخت‌تر واژگان با چهار گزینهٔ نزدیک", icon: BookMarked },
  { key: "grammar", label: "تست گرامر و نگارش", desc: "تست‌های دستگریپی گرامر درس با پاسخ تشریحی", icon: PenLine },
];

export default function LessonTestsTab({ lesson }: { lesson: LessonData }) {
  const [session, setSession] = useState<{ title: string; questions: QuizQuestion[]; cat: string } | null>(null);
  const results = useStudy((s) => s.results);
  const mistakes = useStudy((s) => s.mistakes);
  const mounted = useMounted();
  const t = themeOf(lesson.color);
  const mistakeCount = mounted ? mistakesOfLesson(mistakes, lesson.id) : 0;

  if (session) {
    return (
      <QuizEngine
        title={session.title}
        questions={session.questions}
        resultKeyStr={resultKey(lesson.id, session.cat)}
        lessonId={lesson.id}
        category={session.cat}
        immediate
        onExit={() => setSession(null)}
      />
    );
  }

  const start = (cat: QuizCategory, label: string) => {
    const questions = [...lesson.quizzes.filter((q) => q.category === cat)].sort(
      () => Math.random() - 0.5
    );
    setSession({ title: label, questions, cat });
  };

  const startMixed = () => {
    const questions = [...lesson.quizzes].sort(() => Math.random() - 0.5);
    setSession({ title: `تست ترکیبی درس — ${lesson.titleFa}`, questions, cat: "mixed" });
  };

  const startMistakeReview = () => {
    const prefix = `${lesson.id}:`;
    const questions = lesson.quizzes.filter((q) => (mistakes[`${prefix}${q.id}`] ?? 0) > 0);
    if (questions.length === 0) return;
    setSession({
      title: `مرور اشتباهات — ${lesson.titleFa}`,
      questions: [...questions].sort(() => Math.random() - 0.5),
      cat: "mistakes",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categoryInfo.map((c) => {
          const count = lesson.quizzes.filter((q) => q.category === c.key).length;
          const best = mounted ? results[resultKey(lesson.id, c.key)] : null;
          return (
            <div key={c.key} className="flex flex-col rounded-2xl border c-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.bgSoft} ${t.text}`}>
                  <c.icon size={19} />
                </span>
                <span className="rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-500">
                  {count} تست
                </span>
              </div>
              <h3 className="mb-1 text-sm font-extrabold text-stone-800">{c.label}</h3>
              <p className="mb-3 flex-1 text-[12px] leading-6 text-stone-500">{c.desc}</p>
              {best && (
                <p className="mb-2 text-[12px] font-bold text-emerald-700">
                  بهترین نتیجه: {best.percent}٪ ({best.correct}/{best.total})
                </p>
              )}
              <button
                onClick={() => start(c.key, c.label)}
                className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl ${t.bg} py-2.5 text-sm font-bold text-white transition-[background-color,color,border-color,transform,opacity] hover:opacity-90 active:scale-[0.96]`}
              >
                <ListChecks size={16} />
                شروع تست
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={startMixed}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 c-veil-60 py-4 text-sm font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:border-emerald-400 hover:text-emerald-700 active:scale-[0.96]"
      >
        <Shuffle size={17} />
        تست ترکیبی — همهٔ {lesson.quizzes.length} تست این درس (بُر خورده)
      </button>

      {mistakeCount > 0 && (
        <button
          onClick={startMistakeReview}
          className="lesson-mistakes-cta flex w-full items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-gradient-to-l from-rose-50 to-red-50 p-4 text-right shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:shadow-md hover:shadow-rose-200/50 active:scale-[0.96]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
              <Eraser size={20} />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-stone-800">مرور اشتباهات این درس</span>
              <span className="block text-[12px] text-stone-500">
                {faNum(mistakeCount)} سؤالی که قبلاً اشتباه جواب داده‌ای — با پاسخ درست از بانک حذف می‌شوند
              </span>
            </span>
          </span>
          <span className="shrink-0 rounded-xl bg-rose-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-rose-600/30">
            شروع مرور
          </span>
        </button>
      )}
    </div>
  );
}
