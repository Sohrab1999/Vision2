"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Eraser, Lightbulb, PenLine, Volume2, RotateCcw, ArrowLeft } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { useStudy, resultKey } from "@/lib/study-store";
import { themeOf } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";
import { shuffle } from "@/lib/domain/shuffle";
import { percent as percentOf } from "@/lib/domain/percent";

export default function WritingTab({ lesson }: { lesson: LessonData }) {
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]); // indices into pool
  const [checked, setChecked] = useState<null | boolean>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const addResult = useStudy((s) => s.addResult);
  const trackQuizDone = useStudy((s) => s.trackQuizDone);
  const t = themeOf(lesson.color);

  const ex = lesson.writing[idx];
  const pool = useMemo(() => {
    // shuffle tokens, retry a few times so the pool isn't already solved
    let tokens = shuffle(ex.answer);
    for (let tries = 0; tries < 5 && tokens.join(" ") === ex.answer.join(" "); tries++) {
      tokens = shuffle(ex.answer);
    }
    return tokens.map((w, i) => ({ w, i }));
  }, [ex]);

  const buildSentence = placed.map((pi) => pool[pi].w);
  const isComplete = placed.length === ex.answer.length;

  const check = () => {
    const ok = buildSentence.join(" ") === ex.answer.join(" ");
    setChecked(ok);
    if (ok) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (idx < lesson.writing.length - 1) {
      setIdx(idx + 1);
      setPlaced([]);
      setChecked(null);
      setShowHint(false);
    } else {
      const percent = percentOf(correctCount, lesson.writing.length);
      addResult(resultKey(lesson.id, "writing"), {
        correct: correctCount,
        total: lesson.writing.length,
        percent,
        at: new Date().toISOString(),
      });
      trackQuizDone();
      setDone(true);
    }
  };

  const restart = () => {
    setIdx(0);
    setPlaced([]);
    setChecked(null);
    setShowHint(false);
    setCorrectCount(0);
    setDone(false);
  };

  if (done) {
    const percent = percentOf(correctCount, lesson.writing.length);
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border c-card p-8 text-center shadow-sm"
      >
        <span className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${t.chipBg}`}>
          <PenLine size={28} />
        </span>
        <h3 className="mb-2 text-xl font-black text-stone-800">تمرین نگارش تمام شد!</h3>
        <p className="mb-1 text-3xl font-black text-emerald-600">{percent}٪</p>
        <p className="mb-6 text-sm text-stone-500" dir="ltr">
          {correctCount}/{lesson.writing.length}
        </p>
        <button
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-emerald-700 active:scale-[0.96]"
        >
          <RotateCcw size={15} />
          تمرین مجدد
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between rounded-xl border c-card px-4 py-3">
        <span className="flex items-center gap-2 text-[13px] font-extrabold text-stone-700">
          <PenLine size={15} className={t.text} />
          جمله‌سازی — ترتیب کلمات را بساز
        </span>
        <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[12px] font-black text-stone-600">
          {idx + 1} / {lesson.writing.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full ${t.bg} transition-[background-color,color,border-color,box-shadow,transform] duration-300`} style={{ width: `${((idx + (checked !== null ? 1 : 0)) / lesson.writing.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={ex.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* prompt */}
          <div className={`rounded-2xl border ${t.border} ${t.bgSoft} p-4`}>
            <p className="text-[15px] font-bold leading-8 text-stone-800">«{ex.fa}»</p>
            {showHint && ex.hint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 rounded-lg c-veil-70 p-2.5 text-[12.5px] leading-6 text-amber-700"
              >
                💡 {ex.hint}
              </motion.p>
            )}
            <button
              onClick={() => setShowHint((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-stone-500 hover:text-amber-600"
            >
              <Lightbulb size={13} />
              {showHint ? "بستن راهنما" : "راهنمای گرامری"}
            </button>
          </div>

          {/* answer area */}
          <div
            className={`min-h-[72px] rounded-2xl border-2 border-dashed p-3 transition-colors ${
              checked === true
                ? "border-emerald-400 bg-emerald-50"
                : checked === false
                  ? "border-rose-400 bg-rose-50"
                  : "border-stone-300 bg-white"
            }`}
            dir="ltr"
          >
            {placed.length === 0 ? (
              <p className="flex h-[52px] items-center justify-center text-[13px] text-stone-500">
                روی کلمه‌ها به ترتیب درست کلیک کن...
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {placed.map((pi, pos) => {
                  const word = pool[pi].w;
                  const correctHere = ex.answer[pos] === word;
                  return (
                    <motion.button
                      key={`${pi}-${pos}`}
                      layout
                      onClick={() => {
                        if (checked !== null) return;
                        setPlaced((p) => p.filter((_, i) => i !== pos));
                        setChecked(null);
                      }}
                      className={`en-text rounded-lg px-2.5 py-1.5 text-[14px] font-semibold transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                        checked === null
                          ? "bg-stone-800 text-white hover:bg-stone-700"
                          : correctHere
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                      }`}
                    >
                      {word}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* word pool */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl border c-card p-3" dir="ltr">
            {pool.map((item, i) =>
              placed.includes(i) ? null : (
                <motion.button
                  key={`${item.w}-${i}`}
                  layout
                  onClick={() => {
                    if (checked !== null) return;
                    setPlaced((p) => [...p, i]);
                    setChecked(null);
                  }}
                  className="en-text rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[14px] font-semibold text-stone-700 transition-[background-color,color,border-color,transform] hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.96]"
                >
                  {item.w}
                </motion.button>
              )
            )}
          </div>

          {/* actions */}
          {checked === null ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={check}
                disabled={!isComplete}
                className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                  isComplete ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-stone-300"
                }`}
              >
                <Check size={16} />
                بررسی جمله
              </button>
              <button
                onClick={() => { setPlaced([]); setChecked(null); }}
                className="inline-flex items-center gap-1.5 rounded-xl border c-card px-4 py-2.5 text-sm font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:bg-stone-50 active:scale-[0.96]"
              >
                <Eraser size={15} />
                پاک کردن
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-3.5 ${checked ? "border-emerald-200 bg-emerald-50/70" : "border-rose-200 bg-rose-50/70"}`}
            >
              <p className={`mb-1 flex items-center gap-1.5 text-[13px] font-black ${checked ? "text-emerald-700" : "text-rose-600"}`}>
                {checked ? <Check size={15} /> : <X size={15} />}
                {checked ? "آفرین! جمله درست است." : "ترتیب درست نبود — کلمه‌ها را جابه‌جا کن."}
              </p>
              <p className="en-text text-[14px] font-semibold text-stone-700" dir="ltr">
                {ex.answer.join(" ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SpeakButton text={ex.answer.join(" ").replace(/ ,/g, ",")} label="روخوانی" />
                <button
                  onClick={next}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-emerald-700 active:scale-[0.96]"
                >
                  {idx < lesson.writing.length - 1 ? "تمرین بعدی" : "دیدن نتیجه"}
                  <ArrowLeft size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
