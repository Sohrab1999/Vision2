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

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Eye, Keyboard, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/study-types";
import { normalizeTypedAnswer, typedAnswerIndex } from "@/lib/typed-answer";
import { useStudy } from "@/lib/study-store";
import { completeQuizRun } from "@/lib/quiz-finish";
import { useToast } from "@/hooks/use-toast";
import OptionButton from "../shared/option-button";
import { useQuizRun } from "./use-quiz-run";
import QuizResult from "./quiz-result";
import { letters } from "./quiz-constants";
import ExplainBox from "../shared/explain-box";

/**
 * r285 — ورودی پاسخ تایپی («بنویسید»). state محلیِ متن اینجاست و با key=q.id
 * در مونتِ والد، به‌ازای هر سؤال از نو ساخته می‌شود — بدون اثرِ ریست.
 */
function TypedAnswerInput({
  q,
  disabled,
  onSubmit,
}: {
  q: QuizQuestion;
  disabled: boolean;
  onSubmit: (raw: string) => void;
}) {
  const [typed, setTyped] = useState("");
  const submit = () => {
    if (!normalizeTypedAnswer(typed)) return; // ورودی خالی
    onSubmit(typed.trim());
  };
  // r288 — placeholder وابسته به شکلِ سؤال: فعل داخل پرانتز / اصلاح خطا / تگ / خالیِ کانونی / متنِ ۴خالی
  const stem = q.question;
  const placeholder = /---------------\s*\)/.test(stem)
    ? "write the correction…"
    : /\([a-z ]+\)/.test(stem) && /---------------/.test(stem)
      ? "write the correct verb form…"
      : /---------------/.test(stem) && stem.trim().endsWith("?")
        ? "type the tag question… (e.g. are they)"
        : /---------------|\(---\d---\)/.test(stem)
          ? "fill in the blank… (e.g. and)"
          : "type your answer…";
  return (
    <div className="space-y-2.5" dir="ltr">
      <div className="flex gap-2">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="پاسخ تایپی"
          data-quiz-typed-input
          className="en-text min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] font-semibold text-stone-800 outline-none transition-[border-color,box-shadow] placeholder:font-normal placeholder:text-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
        />
        <button
          type="button"
          data-quiz-typed-submit
          onClick={submit}
          disabled={disabled || !normalizeTypedAnswer(typed)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-bold text-white transition-[background-color,transform] hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
        >
          <Keyboard size={15} />
          بررسی پاسخ
        </button>
      </div>
    </div>
  );
}

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
  /** override the lesson each question's mistakes are recorded to */
  mistakesOf?: (q: QuizQuestion) => number | string;
  /** when false, wrong answers stay out of the mistake bank (word-drills) */
  trackMistakes?: boolean;
  /** predicate: question's options are Persian → rendered RTL (word drills) */
  faOptions?: (q: QuizQuestion) => boolean;
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
  mistakesOf,
  trackMistakes = true,
  faOptions,
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
  const { idx, selected, answers, finished, timeLeft, total, choose, nextQuestion, restart, typedTexts, recordTyped } = run;
  const q = questions[idx];
  const faOpt = q ? (faOptions?.(q) ?? false) : false;

  // r285 — پاسخ تایپی: سنجش با شکل‌هایِ accepted (نرمال‌سازی در lib/typed-answer.ts)
  // و ثبت به‌صورت اندیس گزینه؛ متنِ خام در run.typedTexts می‌ماند.
  const isTyped = q?.kind === "typed";
  const submitTyped = (raw: string) => {
    if (!q) return;
    if (immediate && selected !== null) return; // بازخورد داده شده — قفل
    recordTyped(q.id, raw);
    choose(typedAnswerIndex(q, raw));
  };

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
        faOptions={faOptions}
        typedTexts={run.typedTexts}
        groupOf={groupOf}
        groupLabels={groupLabels}
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
            className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-700 transition duration-300"
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
          {isTyped && q ? (
            /* r285 — سؤال تایپی («بنویسید» جزوهٔ دوازدهم): ورودیِ پاسخ باز؛
               key=q.id → state تایپ به‌ازای هر سؤال نو می‌شود */
            <TypedAnswerInput
              key={q.id}
              q={q}
              disabled={immediate && selected !== null}
              onSubmit={submitTyped}
            />
          ) : (
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
          )}

          {/* feedback */}
          {immediate && selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              data-quiz-feedback
              className="mt-4 scroll-mt-24 rounded-xl border border-stone-200 bg-stone-50 p-3.5"
            >
              {isTyped && (
                <p className="mb-1.5 text-[12.5px] text-stone-500">
                  پاسخ تایپیِ شما:{" "}
                  <span className="en-text font-bold text-stone-700" dir="ltr">
                    “{typedTexts[q.id] ?? "—"}”
                  </span>
                </p>
              )}
              <p
                className={`mb-1 flex items-center gap-1.5 text-[13px] font-black ${
                  selected === q.answer ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {selected === q.answer ? (
                  <>
                    <CheckCircle2 size={15} />
                    ✓ پاسخ درست!
                  </>
                ) : (
                  <>
                    <XCircle size={15} />
                    ✗ پاسخ درست: {letters[q.answer]}) {q.options[q.answer]}
                  </>
                )}
              </p>
              {q.translation && (
                <p className="text-[13px] leading-7 text-stone-600">{q.translation}</p>
              )}
              {selected !== q.answer && <ExplainBox questionId={q.id} />}
              <button
                onClick={nextQuestion}
                data-quiz-next
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white transition-[background-color,transform] hover:bg-emerald-700 active:scale-95"
              >
                {idx < total - 1 ? "سؤال بعدی" : "دیدن نتیجه"}
                <ArrowLeft size={14} />
              </button>
            </motion.div>
          )}

          {/* exam mode nav */}
          {!immediate && (
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[12px] text-stone-400">
                <Eye size={13} />
                پاسخ‌ها در پایان نمایش داده می‌شوند
              </span>
              <button
                onClick={nextQuestion}
                data-quiz-next
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white transition-[background-color,transform] hover:bg-emerald-700 active:scale-95"
              >
                {idx < total - 1 ? "بعدی" : "پایان و نتیجه"}
                <ArrowLeft size={14} />
              </button>
            </div>
          )}

          {/* keyboard hint (desktop) */}
          <div className="mt-3 hidden items-center justify-center gap-1.5 border-t border-stone-100 pt-3 text-[11px] text-stone-400 min-[720px]:flex">
            {isTyped ? (
              <>
                <span>پاسخ را تایپ کنید و</span>
                <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">
                  Enter
                </kbd>
                <span>بزنید — بعد از بازخورد، Enter سؤال بعدی</span>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
