"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowLeft, RotateCcw, Trophy, Eye, Award, Share2, ScrollText, ImageDown } from "lucide-react";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { downloadResultImage } from "@/lib/result-image";
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
  /** per-question group key for the result breakdown (e.g. source lesson) */
  groupOf?: (q: QuizQuestion) => string;
  /** display label per group key */
  groupLabels?: Record<string, string>;
  /** diploma-style result card with share button (final exam) */
  certificate?: boolean;
  /** override the lesson each question's mistakes are recorded to */
  mistakesOf?: (q: QuizQuestion) => number | string;
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
  groupOf,
  groupLabels,
  certificate = false,
  mistakesOf,
}: QuizEngineProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]); // chosen per question (in order)
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    secondsPerQuestion ? secondsPerQuestion * questions.length : null
  );
  const [imgBusy, setImgBusy] = useState(false);
  const userIdRef = useRef<string>("");
  const { toast } = useToast();

  const correctCount = useMemo(
    () => answers.reduce((s, a, i) => (a === questions[i]?.answer ? s + 1 : s), 0),
    [answers, questions]
  );

  const q = questions[idx];
  const total = questions.length;

  const finish = (finalAnswers: number[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
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
    useStudy.getState().trackQuizDone();
    // error bank: record wrong answers, clear ones now answered correctly
    const wrongIds = questions
      .filter((qq, i) => finalAnswers[i] !== qq.answer)
      .map((qq) => qq.id);
    const rightIds = questions
      .filter((qq, i) => finalAnswers[i] === qq.answer)
      .map((qq) => qq.id);
    const storeNow = useStudy.getState();
    if (mistakesOf) {
      // bucket wrong/right ids per source lesson, then record each bucket
      const wrongBy = new Map<string, string[]>();
      const rightBy = new Map<string, string[]>();
      for (const [i, qq] of questions.entries()) {
        const target = String(mistakesOf(qq));
        const bucket = finalAnswers[i] !== qq.answer ? wrongBy : rightBy;
        bucket.set(target, [...(bucket.get(target) ?? []), qq.id]);
      }
      for (const [target, ids] of wrongBy) storeNow.addMistakes(target, ids);
      for (const [target, ids] of rightBy) for (const id of ids) storeNow.clearMistake(target, id);
    } else {
      if (wrongIds.length) storeNow.addMistakes(lessonId, wrongIds);
      for (const id of rightIds) storeNow.clearMistake(lessonId, id);
    }
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
    // freeze the answers so late clicks during exit animations can't mutate the result
    setAnswers(finalAnswers);
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
    if (finishedRef.current || finished) return;
    if (immediate) {
      if (selected !== null) return;
      const next = [...answers];
      next[idx] = i;
      setAnswers(next);
      setSelected(i);
    } else {
      // exam mode: record answer and auto advance (one answer per question)
      if (answers[idx] !== undefined) return;
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
    finishedRef.current = false;
    setIdx(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(secondsPerQuestion ? secondsPerQuestion * questions.length : null);
  };

  // keyboard shortcuts: 1-4 choose an option, Enter / ← advance
  // (re-registered each render so closures are always fresh)
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const num = Number(e.key);
      if (num >= 1 && num <= (questions[idx]?.options.length ?? 0)) {
        choose(num - 1);
        return;
      }
      if (e.key === "Enter" || e.key === "ArrowLeft") {
        if (immediate && selected !== null) nextQuestion();
        else if (!immediate) {
          if (idx < total - 1) {
            setIdx(idx + 1);
            setSelected(null);
          } else {
            finish(answers);
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ------------------------------- finished ------------------------------- */
  if (finished) {
    const percent = Math.round((correctCount / total) * 100);
    const wrongIds = questions.filter((qq, i) => answers[i] !== qq.answer).map((qq) => qq.id);
    const grade =
      percent >= 90
        ? { msg: "فوق‌العاده! تو یک قهرمان زبان انگلیسی‌ای! 🏆", cls: "text-emerald-600" }
        : percent >= 70
          ? { msg: "خیلی خوب! با کمی تمرین بیشتر به عالی می‌رسی.", cls: "text-emerald-600" }
          : percent >= 50
            ? { msg: "بد نیست! نکات گرامری و واژگان را دوباره مرور کن.", cls: "text-amber-600" }
            : { msg: "نیاز به تمرین بیشتر داری. فلش‌کارت‌ها را مرور کن!", cls: "text-rose-600" };

    // per-group accuracy (e.g. per source lesson in the final exam)
    const groups =
      groupOf && groupLabels
        ? Object.keys(groupLabels)
            .map((key) => {
              const qs = questions.filter((qq) => groupOf(qq) === key);
              const ok = qs.filter((qq, i) => answers[questions.indexOf(qq)] === qq.answer).length;
              return { key, label: groupLabels[key], total: qs.length, correct: ok };
            })
            .filter((g) => g.total > 0)
        : [];

    const saveResultImage = async (premium: boolean) => {
      if (imgBusy) return;
      setImgBusy(true);
      const ok = await downloadResultImage({
        title,
        percent,
        correct: correctCount,
        total,
        userName: useStudy.getState().userName || undefined,
        premium,
      });
      setImgBusy(false);
      toast(
        ok
          ? { title: "🖼 تصویر نتیجه ذخیره شد", description: "حالا می‌توانی آن را در هر کجا به اشتراک بگذاری.", duration: 3000 }
          : { title: "خطا در ساخت تصویر", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
      );
    };

    const shareResult = async () => {
      const breakdown = groups.map((g) => `${g.label}: ${faNum(Math.round((g.correct / g.total) * 100))}٪`).join(" · ");
      const text = `🏆 نتیجهٔ من در وب‌کتاب «Vision Two»\n${title}\n⭐ ${faNum(percent)}٪ (${faNum(correctCount)} از ${faNum(total)})${breakdown ? `\n📊 ${breakdown}` : ""}`;
      try {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          await navigator.share({ title: "نتیجهٔ وب‌کتاب Vision Two", text });
          return;
        }
        await navigator.clipboard.writeText(text);
        toast({ title: "✓ نتیجه کپی شد", description: "می‌توانی آن را برای دوستانت بفرستی!", duration: 3000 });
      } catch {
        /* user cancelled share */
      }
    };

    const certificateCard = (
      <div className="certificate-card rounded-2xl bg-white p-1.5 shadow-xl">
        <div className="rounded-xl border-2 border-dashed border-amber-300 p-5 text-center sm:p-6">
          <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-black tracking-widest text-amber-600">
            <ScrollText size={14} />
            WEBBOOK CERTIFICATE · وب‌کتاب ویژن دو
          </div>
          <div className="mb-4 flex justify-center">
            <ProgressRing percent={percent} size={116} stroke={10}>
              <div>
                <div className="text-2xl font-black text-stone-800">{faNum(percent)}٪</div>
                <div className="text-[11px] text-stone-500" dir="ltr">
                  {correctCount}/{total}
                </div>
              </div>
            </ProgressRing>
          </div>
          <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full bg-gradient-to-l from-amber-400 to-orange-500 px-4 py-1.5 text-[13px] font-black text-white shadow-lg shadow-amber-500/30">
            <Award size={16} />
            {title}
          </div>
          <p className={`mb-1 text-sm font-bold ${grade.cls}`}>{grade.msg}</p>
          <p className="mb-4 text-[11.5px] text-stone-400">
            تاریخ اخذ: {new Date().toLocaleDateString("fa-IR")} · وب‌کتاب تعاملی زبان انگلیسی یازدهم
          </p>

          {/* per-source breakdown */}
          {groups.length > 0 && (
            <div className="mx-auto mb-4 grid max-w-md gap-2 text-right" dir="rtl">
              {groups.map((g) => {
                const pct = Math.round((g.correct / g.total) * 100);
                const bar = pct >= 70 ? "from-emerald-400 to-emerald-600" : pct >= 50 ? "from-amber-400 to-orange-500" : "from-rose-400 to-rose-600";
                return (
                  <div key={g.key} className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2">
                    <div className="mb-1 flex items-center justify-between text-[11.5px] font-bold">
                      <span className="text-stone-600">{g.label}</span>
                      <span className="text-stone-800">
                        {faNum(g.correct)}/{faNum(g.total)} — {faNum(pct)}٪
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-l ${bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={shareResult}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-600/25 transition-all hover:opacity-90 active:scale-95"
            >
              <Share2 size={15} />
              اشتراک‌گذاری نتیجه
            </button>
            <button
              onClick={() => saveResultImage(true)}
              disabled={imgBusy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 transition-all hover:bg-amber-100 active:scale-95 disabled:opacity-50"
            >
              <ImageDown size={15} />
              {imgBusy ? "در حال ساخت تصویر…" : "دانلود تصویر نتیجه"}
            </button>
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
      </div>
    );

    const standardCard = (
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
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {wrongIds.length > 0 && (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[12px] font-bold text-rose-600">
              {wrongIds.length} سؤال به بانک مرور اشتباهات اضافه شد
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => saveResultImage(false)}
            disabled={imgBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
          >
            <ImageDown size={15} />
            {imgBusy ? "در حال ساخت تصویر…" : "دانلود تصویر نتیجه"}
          </button>
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
    );

    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {certificate ? certificateCard : standardCard}

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

          {/* keyboard hint (desktop) */}
          <div className="mt-3 hidden items-center justify-center gap-1.5 border-t border-stone-100 pt-3 text-[11px] text-stone-400 min-[720px]:flex">
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
