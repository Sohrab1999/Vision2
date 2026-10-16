"use client";

// «مرور نشان‌شده‌ها» — quiz launcher inside the personal word-book.
// Builds a session from the CURRENTLY FILTERED star list (so a lesson chip
// or search query scopes the quiz — e.g. quiz just lesson 2 stars), hands it
// to the shared QuizEngine, and keeps my-words.tsx under the §12 cap.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Play, RotateCcw } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { buildStarredQuiz } from "@/lib/starred-quiz";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import type { QuizQuestion } from "@/lib/study-types";
import type { ResolvedStar } from "@/lib/my-words-resolve";
import QuizEngine from "../quiz/quiz-engine";

const MIN_STARS = 4; // below this a session feels hollow (1-3 words)
const SIZE_OPTIONS = [8, 15] as const;

const LESSON_LABELS: Record<string, string> = {
  "1": "درس اول",
  "2": "درس دوم",
  "3": "درس سوم",
};

export default function MyWordsReview({ stars }: { stars: ResolvedStar[] }) {
  const setView = useStudy((s) => s.setView);
  const [session, setSession] = useState<{ questions: QuizQuestion[]; faOptions: Set<string>; lessonOf: Map<string, number> } | null>(null);
  const [size, setSize] = useState<number>(8);

  const eligible = stars.length >= MIN_STARS;
  const clamped = Math.min(size, stars.length);

  const start = () => {
    const quiz = buildStarredQuiz(
      stars.map((s) => ({ key: s.key, lessonId: s.lessonId, en: s.en, fa: s.fa })),
      clamped
    );
    if (quiz.questions.length < MIN_STARS) return;
    trackEvent("my_words_review_start");
    setSession(quiz);
  };

  if (session) {
    return (
      <QuizEngine
        title="مرور واژه‌های نشان‌شده"
        questions={session.questions}
        resultKeyStr="my-words"
        lessonId="my-words"
        category="my-words"
        immediate={true}
        trackMistakes={false}
        faOptions={(q) => session.faOptions.has(q.id)}
        groupOf={(q) => String(session.lessonOf.get(q.id) ?? 0)}
        groupLabels={LESSON_LABELS}
        onExit={() => setSession(null)}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="مرور واژه‌های نشان‌شده"
      className="mywords-hero overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50/90 to-white shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-900/20">
          <GraduationCap size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-stone-800">مرور نشان‌شده‌ها</h2>
          <p className="text-[11.5px] leading-5 text-stone-500">
            {eligible
              ? `آزمونی از همین لیست — سؤال‌های رسمی بانک + تمرین دوطرفه؛ مربعِ فیلترها هم اثر می‌کند`
              : `برای شروع مرور حداقل ${faNum(MIN_STARS)} واژه نشان کن — الان ${faNum(stars.length)} داری`}
          </p>
        </div>
        {eligible && (
          <div className="flex items-center gap-1.5" role="group" aria-label="طول جلسهٔ مرور">
            {SIZE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setSize(n)}
                disabled={n > stars.length}
                className={`rounded-lg border px-2.5 py-1.5 text-[11.5px] font-black transition-[border-color,opacity,transform] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${
                  clamped === n
                    ? "border-amber-400 bg-amber-100 text-amber-700"
                    : "border-stone-200 bg-white text-stone-500 hover:border-amber-300"
                }`}
              >
                {faNum(n)}
              </button>
            ))}
          </div>
        )}
        {eligible ? (
          <button
            onClick={start}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 px-4 py-2.5 text-[13px] font-black text-white shadow-md shadow-amber-500/25 transition-[opacity,transform] hover:opacity-95 active:scale-95"
          >
            <Play size={14} />
            شروع مرور ({faNum(clamped)} سؤال)
          </button>
        ) : (
          <button
            onClick={() => setView({ type: "dictionary" })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-[13px] font-bold text-amber-700 transition-[background-color,transform] hover:bg-amber-50 active:scale-95"
          >
            <RotateCcw size={14} />
            رفتن به دیکشنری
          </button>
        )}
      </div>
    </motion.section>
  );
}
