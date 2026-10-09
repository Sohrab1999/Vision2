"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowLeft, RotateCcw, Trophy, Eye } from "lucide-react";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy } from "@/lib/study-store";
import { useToast } from "@/hooks/use-toast";
import ProgressRing from "./progress-ring";

export interface QuizEngineProps {
  title: string;
  questions: QuizQuestion[];
  resultKeyStr: string; // e.g. "1:vocab" or "exam"
  lessonId: number | string;
  category: string;
  immediate?: boolean; // instant feedback per question
  secondsPerQuestion?: number; // optional timer
  onExit: () => void;
}

const letters = ["a", "b", "c", "d"];

export default function QuizEngine({
  title,
  questions,
  resultKeyStr,
  lessonId,
  category,
  immediate = true,
  secondsPerQuestion,
  onExit,
}: QuizEngineProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]); // chosen per question (in order)
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    secondsPerQuestion ? secondsPerQuestion * questions.length : null
  );
  const userIdRef = useRef<string>("");
  const { toast } = useToast();

  const correctCount = useMemo(
    () => answers.reduce((s, a, i) => (a === questions[i]?.answer ? s + 1 : s), 0),
    [answers, questions]
  );

  const q = questions[idx];
  const total = questions.length;

  const finish = (finalAnswers: number[]) => {
    const correct = finalAnswers.reduce(
      (s, a, i) => (a === questions[i]?.answer ? s + 1 : s),
      0
    );
    const percent = Math.round((correct / total) * 100);
    useStudy.getState().addResult(resultKeyStr, {
      correct,
      total,
      percent,
      at: new Date().toISOString(),
    });
    toast({
      title: percent >= 70 ? "🏆 نتیجهٔ عالی!" : percent >= 50 ? "👍 نتیجهٔ قابل قبول" : "💪 تمرین بیشتر!",
      description: `${title}: ${correct} از ${total} درست (${percent}٪)${
        percent >= 90 ? " — فوق‌العاده بود!" : ""
      }`,
      duration: 4000,
    });
    // fire-and-forget to backend
    try {
      const store = useStudy.getState();
      const userId = userIdRef.current || store.ensureUserId();
      userIdRef.current = userId;
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          lesson: typeof lessonId === "number" ? lessonId : 0,
          category,
          total,
          correct,
        }),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
    setFinished(true);
  };

  // timer
  useEffect(() => {
    if (timeLeft === null || finished) return;
    const t = setTimeout(() => {
      const next = timeLeft - 1;
      setTimeLeft(next);
      if (next <= 0) {
        finish(answers);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished]);

  const choose = (i: number) => {
    if (immediate) {
      if (selected !== null) return;
      const next = [...answers];
      next[idx] = i;
      setAnswers(next);
      setSelected(i);
    } else {
      // exam mode: record answer and auto advance
      const next = [...answers];
      next[idx] = i;
      setAnswers(next);
      if (idx < total - 1) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        finish(next);
      }
    }
  };

  const nextQuestion = () => {
    if (idx < total - 1) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      finish(answers);
    }
  };

  const restart = () => {
    setIdx(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(secondsPerQuestion ? secondsPerQuestion * questions.length : null);
  };

  /* ------------------------------- finished ------------------------------- */
  if (finished) {
    const percent = Math.round((correctCount / total) * 100);
    const grade =
      percent >= 90
        ? { msg: "فوق‌العاده! تو یک قهرمان زبان انگلیسی‌ای! 🏆", cls: "text-emerald-600" }
        : percent >= 70
          ? { msg: "خیلی خوب! با کمی تمرین بیشتر به عالی می‌رسی.", cls: "text-emerald-600" }
          : percent >= 50
            ? { msg: "بد نیست! نکات گرامری و واژگان را دوباره مرور کن.", cls: "text-amber-600" }
            : { msg: "نیاز به تمرین بیشتر داری. فلش‌کارت‌ها را مرور کن!", cls: "text-rose-600" };

    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <ProgressRing percent={percent} size={120} stroke={10}>
              <div>
                <div className="text-2xl font-black text-stone-800">{percent}٪</div>
                <div className="text-[11px] text-stone-500" dir="ltr">
                  {correctCount}/{total}
                </div>
              </div>
            </ProgressRing>
          </div>
          <div className="mb-1 flex items-center justify-center gap-2 text-lg font-black">
            <Trophy size={20} className="text-amber-500" />
            <span className="text-stone-800">{title} — نتیجهٔ نهایی</span>
          </div>
          <p className={`mb-5 text-sm font-bold ${grade.cls}`}>{grade.msg}</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
            >
              <RotateCcw size={15} />
              تلاش مجدد
            </button>
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
            >
              بازگشت
            </button>
          </div>
        </div>

        {/* review */}
        <div className="max-h-[46vh] space-y-2.5 overflow-y-auto nice-scroll pl-1">
          {questions.map((qq, i) => {
            const my = answers[i];
            const ok = my === qq.answer;
            return (
              <div
                key={qq.id}
                className={`rounded-xl border p-3.5 ${
                  ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"
                }`}
              >
                <div className="mb-1.5 flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                      ok ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  >
                    {ok ? <Check size={12} /> : <X size={12} />}
                  </span>
                  <p className="en-text flex-1 text-[13.5px] leading-7 text-stone-800" dir="ltr">
                    <b className="mr-1 text-stone-400">{i + 1}.</b>
                    {qq.question}
                  </p>
                </div>
                <p className="mr-7 text-[12.5px] text-stone-600">
                  پاسخ شما: <span className="en-text font-bold" dir="ltr">{my !== undefined ? `${letters[my]}) ${qq.options[my]}` : "—"}</span>
                  {!ok && (
                    <>
                      {" "}· پاسخ درست:{" "}
                      <span className="en-text font-bold text-emerald-700" dir="ltr">
                        {letters[qq.answer]}) {qq.options[qq.answer]}
                      </span>
                    </>
                  )}
                </p>
                {qq.translation && (
                  <p className="mr-7 mt-1 text-[12px] leading-6 text-stone-500">{qq.translation}</p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  /* -------------------------------- active -------------------------------- */
  return (
    <div className="space-y-4">
      {/* header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
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
            className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-700 transition-all duration-300"
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
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <p className="en-text mb-5 text-[16px] font-semibold leading-8 text-stone-800" dir="ltr">
            {q.question}
          </p>
          <div className="space-y-2.5" dir="ltr">
            {q.options.map((opt, i) => {
              const isCorrect = immediate && selected !== null && i === q.answer;
              const isWrong = immediate && selected === i && i !== q.answer;
              const chosen = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={immediate && selected !== null}
                  data-quiz-option={i}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : isWrong
                        ? "border-rose-400 bg-rose-50"
                        : chosen
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-[0.99]"
                  } ${immediate && selected !== null && !isCorrect && !isWrong ? "opacity-60" : ""}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black ${
                      isCorrect
                        ? "bg-emerald-500 text-white"
                        : isWrong
                          ? "bg-rose-500 text-white"
                          : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {isCorrect ? <Check size={14} /> : isWrong ? <X size={14} /> : letters[i]}
                  </span>
                  <span className="en-text text-[14.5px] font-medium text-stone-800">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* feedback */}
          {immediate && selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3.5"
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
              <button
                onClick={nextQuestion}
                data-quiz-next
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
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
                onClick={() => (idx < total - 1 ? (setIdx(idx + 1), setSelected(null)) : finish(answers))}
                data-quiz-next
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-emerald-700 active:scale-95"
              >
                {idx < total - 1 ? "بعدی" : "پایان و نتیجه"}
                <ArrowLeft size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
