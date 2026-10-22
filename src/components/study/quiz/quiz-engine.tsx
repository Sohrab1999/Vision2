"use client";

// QuizEngine — موتور تست (ترکیب‌گر سبک پس از برش R-7 در §12 گام ۷)
//
//   • quiz/use-quiz-run.ts  → ماشین حالت راند (اندیس/انتخاب/تایمر/کیبورد)
//   • quiz/quiz-result.tsx  → صفحهٔ نتیجه (کارت استاندارد/گواهی + مرور)
//   • lib/quiz-finish.ts    → منطق خالص پایان راند (نتیجه/اشتباهات/ریسک واژه/کنکور/آمار)
//
// همین فایل فقط صفحهٔ «سؤال فعال» را رندر می‌کند و آن دو را به هم وصل
// می‌کند؛ قرارداد خارجی (default export + QuizEngineProps) دست‌نخورده
// مانده تا ۸ مصرف‌کننده (درس/آزمون/کنکور/مرور هوشمند/…) بدون تغییر کار کنند.

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye } from "lucide-react";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy } from "@/lib/study-store";
import { completeQuizRun } from "@/lib/quiz-finish";
import { useToast } from "@/hooks/use-toast";
import OptionButton from "../shared/option-button";
import { useQuizRun } from "./use-quiz-run";
import QuizResult from "./quiz-result";
import { letters } from "./quiz-constants";
import ExplainBox from "../shared/explain-box";

export interface QuizEngineProps {
  title: string;
  questions: QuizQuestion[];
  resultKeyStr: string; // e.g. "1:vocab" or "exam"
  lessonId: number | string;
  category: string;
  immediate?: boolean; // instant feedback per question
  secondsPerQuestion?: number; // optional timer
  onExit: () => void;
  /** per-question group key for the result breakdown (e.g. source lesson) */
  groupOf?: (q: QuizQuestion) => string;
  /** display label per group key */
  groupLabels?: Record<string, string>;
  /** diploma-style result card with share button (final exam) */
  certificate?: boolean;
  /** certificate family color (راند ۱۹۷ — نشانِ رنگِ خانوادهٔ پایه، فقط با certificate) */
  accentFamily?: string;
  /** grade label for the certificate footer + canvas seal («پایهٔ دهم») */
  gradeLabel?: string;
  /** override the lesson each question's mistakes are recorded to */
  mistakesOf?: (q: QuizQuestion) => number | string;
  /** when false, wrong answers stay out of the mistake bank (word-drills) */
  trackMistakes?: boolean;
  /** predicate: question's options are Persian → rendered RTL (word drills) */
  faOptions?: (q: QuizQuestion) => boolean;
  /** راند ۲۴۶ — درِ ششمِ حلقه: خطِ «ادامهٔ مطالعه» زیرِ کارتِ نتیجه
   * (فقط مصرف‌کننده‌هایِ درس opt-in می‌کنند — آزمون جامع/کنکور/… دست‌نخورده) */
  resumeDoor?: boolean;
}

export default function QuizEngine({
  title,
  questions,
  resultKeyStr,
  lessonId,
  category,
  immediate = true,
  secondsPerQuestion,
  onExit,
  groupOf,
  groupLabels,
  certificate = false,
  accentFamily,
  gradeLabel,
  mistakesOf,
  trackMistakes = true,
  faOptions,
  resumeDoor = false,
}: QuizEngineProps) {
  const { toast } = useToast();

  const finish = (finalAnswers: number[]) => {
    const { correct, total, percent } = completeQuizRun({
      questions,
      finalAnswers,
      resultKeyStr,
      lessonId,
      category,
      trackMistakes,
      mistakesOf,
    });
    toast({
      title: percent >= 70 ? "🏆 نتیجهٔ عالی!" : percent >= 50 ? "👍 نتیجهٔ قابل قبول" : "💪 تمرین بیشتر!",
      description: `${title}: ${correct} از ${total} درست (${percent}٪)${
        percent >= 90 ? " — فوق‌العاده بود!" : ""
      }`,
      duration: 4000,
    });
  };

  const run = useQuizRun({ questions, immediate, secondsPerQuestion, onFinish: finish });
  const { idx, selected, answers, finished, timeLeft, total, choose, nextQuestion, restart } = run;
  const q = questions[idx];
  const faOpt = q ? (faOptions?.(q) ?? false) : false;

  /* ------------------------------- finished ------------------------------- */
  if (finished) {
    return (
      <QuizResult
        title={title}
        questions={questions}
        answers={answers}
        correctCount={run.correctCount}
        trackMistakes={trackMistakes}
        certificate={certificate}
        accentFamily={accentFamily}
        gradeLabel={gradeLabel}
        faOptions={faOptions}
        groupOf={groupOf}
        groupLabels={groupLabels}
        resumeDoor={resumeDoor}
        onRestart={restart}
        onExit={onExit}
      />
    );
  }

  if (!q) return null;

  /* -------------------------------- active -------------------------------- */
  return (
    <div className="space-y-4">
      {/* header */}
      <div className="rounded-2xl border c-card p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-sm font-extrabold text-stone-800">{title}</span>
          <div className="flex items-center gap-2">
            {timeLeft !== null && (
              <span
                className={`rounded-lg px-2.5 py-1 text-[12px] font-black ${
                  timeLeft < 60 ? "bg-rose-100 text-rose-700" : "bg-stone-100 text-stone-600"
                }`}
                dir="ltr"
              >
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            )}
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-black text-emerald-700">
              {idx + 1} / {total}
            </span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-700 transition-[background-color,color,border-color,box-shadow,transform] duration-300"
            style={{ width: `${((idx + (selected !== null ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.22 }}
          className="rounded-2xl border c-card p-5 shadow-sm"
        >
          <p className="en-text mb-5 text-[16px] font-semibold leading-8 text-stone-800" dir="ltr">
            {q.question}
          </p>
          <div className="space-y-2.5" dir={faOpt ? "rtl" : "ltr"}>
            {q.options.map((opt, i) => {
              const isCorrect = immediate && selected !== null && i === q.answer;
              const isWrong = immediate && selected === i && i !== q.answer;
              const chosen = selected === i;
              return (
                <OptionButton
                  key={i}
                  index={i}
                  label={letters[i]}
                  text={opt}
                  textFa={faOpt}
                  state={isCorrect ? "correct" : isWrong ? "wrong" : chosen ? "chosen" : "idle"}
                  dim={immediate && selected !== null && !isCorrect && !isWrong}
                  dimOpacity="60"
                  disabled={immediate && selected !== null}
                  onClick={() => choose(i)}
                  accent="emerald"
                  icon="check"
                  dataAttr="quiz"
                />
              );
            })}
          </div>

          {/* feedback */}
          {immediate && selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              data-quiz-feedback
              className="mt-4 scroll-mt-24 rounded-xl border border-stone-200 bg-stone-50 p-3.5"
            >
              <p
                className={`mb-1 text-[13px] font-black ${
                  selected === q.answer ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {selected === q.answer ? "✓ پاسخ درست!" : `✗ پاسخ درست: ${letters[q.answer]}) ${q.options[q.answer]}`}
              </p>
              {q.translation && (
                <p className="text-[13px] leading-7 text-stone-600">{q.translation}</p>
              )}
              {selected !== q.answer && <ExplainBox questionId={q.id} />}
              <button
                onClick={nextQuestion}
                data-quiz-next
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-[13px] font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-emerald-800 active:scale-[0.96]"
              >
                {idx < total - 1 ? "سؤال بعدی" : "دیدن نتیجه"}
                <ArrowLeft size={14} />
              </button>
            </motion.div>
          )}

          {/* exam mode nav */}
          {!immediate && (
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[12px] text-stone-500">
                <Eye size={13} />
                پاسخ‌ها در پایان نمایش داده می‌شوند
              </span>
              <button
                onClick={nextQuestion}
                data-quiz-next
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-[13px] font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-emerald-800 active:scale-[0.96]"
              >
                {idx < total - 1 ? "بعدی" : "پایان و نتیجه"}
                <ArrowLeft size={14} />
              </button>
            </div>
          )}

          {/* keyboard hint (desktop) */}
          <div className="mt-3 hidden items-center justify-center gap-1.5 border-t border-stone-100 pt-3 text-[11px] text-stone-500 min-[720px]:flex">
            <span>میان‌برها:</span>
            {["1", "2", "3", "4"].map((k) => (
              <kbd key={k} className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">
                {k}
              </kbd>
            ))}
            <span>برای انتخاب گزینه</span>
            <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">
              Enter
            </kbd>
            <span>برای سؤال بعدی</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
