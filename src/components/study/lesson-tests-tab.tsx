"use client";

import { useState } from "react";
import { ListChecks, Shuffle, BookA, BookMarked, PenLine } from "lucide-react";
import type { LessonData, QuizCategory, QuizQuestion } from "@/lib/study-types";
import { useStudy, resultKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { themeOf } from "@/lib/study-theme";
import QuizEngine from "./quiz-engine";

const categoryInfo: { key: QuizCategory; label: string; desc: string; icon: React.ElementType }[] = [
  { key: "vocab", label: "تست واژگان — سطح استاندارد", desc: "برگرفته از بخش «تست واژگان» جزوه همراه با ترجمهٔ پاسخ‌ها", icon: BookA },
  { key: "vocab-konkuri", label: "تست واژگان — سطح کنکوری", desc: "تست‌های سخت‌تر واژگان با چهار گزینهٔ نزدیک", icon: BookMarked },
  { key: "grammar", label: "تست گرامر و نگارش", desc: "تست‌های دستگریپی گرامر درس با پاسخ تشریحی", icon: PenLine },
];

export default function LessonTestsTab({ lesson }: { lesson: LessonData }) {
  const [session, setSession] = useState<{ title: string; questions: QuizQuestion[]; cat: string } | null>(null);
  const results = useStudy((s) => s.results);
  const mounted = useMounted();
  const t = themeOf(lesson.color);

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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categoryInfo.map((c) => {
          const count = lesson.quizzes.filter((q) => q.category === c.key).length;
          const best = mounted ? results[resultKey(lesson.id, c.key)] : null;
          return (
            <div key={c.key} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
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
                className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl ${t.bg} py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95`}
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-white/60 py-4 text-sm font-bold text-stone-600 transition-all hover:border-emerald-400 hover:text-emerald-700 active:scale-[0.99]"
      >
        <Shuffle size={17} />
        تست ترکیبی — همهٔ {lesson.quizzes.length} تست این درس (بُر خورده)
      </button>
    </div>
  );
}
