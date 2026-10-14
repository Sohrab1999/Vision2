"use client";

// ---------------------------------------------------------------------
// متروی گرامر — جریان درس ۹۰ثانیه‌ای (Task 40 / مرحلهٔ ۲ «چشم‌ها»)
// سه گام نقشهٔ راه: «ببین» جملهٔ رنگی + نوار زمان ← «بفهم» آینهٔ فارسی +
// غلط کلاسیک ← «امتحان کن» ۳ سؤال با دکمهٔ «چرا اشتباه شد؟» (قالب ثابت).
// نمرهٔ گام سوم با کلید g:ls:<stationId> در همان results استور ثبت می‌شود
// (addResult بهترین نمره را نگه می‌دارد) — بدون فیلد جدید استور.
// ---------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Eye,
  FlipHorizontal2 as MirrorIcon,
  MessageCircleQuestion,
  PartyPopper,
  PencilLine,
  Swords,
  X,
} from "lucide-react";
import { useStudy, todayStr } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { LINE_COLORS } from "@/lib/grammar-theme";
import type { GrammarLine, GrammarStation } from "@/data/grammar-map";
import type { GrammarMicroLesson } from "@/data/grammar-lessons";
import { ROLE_LABELS } from "@/data/grammar-lessons";
import { lessonFor, lessonKey, tryPercent, whyAnswer } from "@/lib/grammar-lesson";

const STEP_LABELS = ["ببین", "بفهم", "امتحان کن"] as const;

interface Props {
  line: GrammarLine;
  station: GrammarStation;
  onExit: () => void;
  onGoQuiz: () => void;
}

export default function GrammarLessonFlow({ line, station, onExit, onGoQuiz }: Props) {
  const lesson: GrammarMicroLesson | null = useMemo(
    () => lessonFor(station.id),
    [station.id]
  );
  const addResult = useStudy((s) => s.addResult);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>([null, null, null]);
  const [whyOpen, setWhyOpen] = useState<number | null>(null);
  const recorded = useRef(false);

  const c = LINE_COLORS[line.color];
  const answeredAll = picked.every((p) => p !== null);
  const correct = picked.reduce<number>(
    (n, p, i) => n + (p !== null && p === lesson?.try[i].answer ? 1 : 0),
    0
  );
  const percent = tryPercent(correct, lesson?.try.length ?? 3);

  // ثبت نمرهٔ درس — یک‌بار در هر تلاش (addResult بهترین را نگه می‌دارد)
  useEffect(() => {
    if (answeredAll && !recorded.current && lesson) {
      recorded.current = true;
      addResult(lessonKey(station.id), {
        correct,
        total: lesson.try.length,
        percent,
        at: todayStr(),
      });
    }
  }, [answeredAll, correct, percent, lesson, station.id, addResult]);

  if (!lesson) {
    return (
      <div className="glesson space-y-4">
        <p className="rounded-xl bg-stone-100 p-4 text-center text-[13px] font-bold text-stone-600">
          این ایستگاه هنوز درس ۹۰ثانیه‌ای ندارد.
        </p>
        <button onClick={onExit} className="w-full rounded-xl bg-stone-200 py-2.5 text-[13px] font-extrabold text-stone-700">
          بازگشت به نقشه
        </button>
      </div>
    );
  }

  const restart = () => {
    setStep(0);
    setPicked([null, null, null]);
    setWhyOpen(null);
    recorded.current = false;
  };

  return (
    <div className="glesson space-y-4">
      {/* سربرگ: ایستگاه + ناوبری گام‌ها */}
      <div className={`glesson-head relative overflow-hidden rounded-2xl border ${c.border} ${c.soft} p-4`}>
        <div className="flex items-center gap-2.5">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.solid} text-white shadow-md`}>
            <PencilLine size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-black text-stone-800">
              درس ۹۰ثانیه‌ای: {station.fa}
            </h2>
            <p className="truncate text-[11.5px] font-bold text-stone-500">
              خط «{line.fa}» — {lesson.hook}
            </p>
          </div>
          <button
            onClick={onExit}
            aria-label="بستن درس"
            className="glesson-close mr-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border c-card text-stone-500 shadow-sm transition hover:text-stone-700 active:scale-[0.96]"
          >
            <X size={16} />
          </button>
        </div>

        {/* نقطه‌های گام */}
        <div className="mt-3.5 flex items-center gap-1.5" role="tablist" aria-label="گام‌های درس">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-1.5">
              <button
                role="tab"
                aria-selected={step === i}
                aria-label={`گام ${faNum(i + 1)}: ${label}`}
                onClick={() => setStep(i)}
                className={`flex-1 rounded-full py-1.5 text-center text-[11.5px] font-extrabold transition-[background-color,color,border-color,box-shadow] ${
                  step === i
                    ? `${c.solid} text-white shadow-sm`
                    : i < step
                      ? "glesson-step-done border"
                      : "glesson-step-idle border"
                }`}
              >
                {i < step ? <Check size={12} className="inline -mt-0.5" /> : null}
                {faNum(i + 1)}. {label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* بدنهٔ گام‌ها */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 14 }}
          transition={{ duration: 0.18 }}
        >
          {step === 0 && <SeeStep lesson={lesson} c={c.solid} cText={c.text} />}
          {step === 1 && <MirrorStep lesson={lesson} />}
          {step === 2 && (
            <TryStep
              lesson={lesson}
              picked={picked}
              whyOpen={whyOpen}
              onPick={(qi, oi) =>
                setPicked((prev) => prev.map((p, i) => (i === qi ? oi : p)))
              }
              onWhy={(qi) => setWhyOpen((w) => (w === qi ? null : qi))}
              done={answeredAll}
              correct={correct}
              percent={percent}
              onGoQuiz={onGoQuiz}
              onRestart={restart}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* دکمهٔ ادامه */}
      {step < 2 && (
        <button
          onClick={() => setStep((s) => s + 1)}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl ${c.solid} py-3 text-[13.5px] font-black text-white shadow-md transition-[background-color,color,border-color,box-shadow,transform] hover:brightness-110 active:scale-[0.96]`}
        >
          {step === 0 ? "فهمیدم — حالا آینهٔ فارسی" : "فهمیدم — امتحان کن"}
          <ArrowLeft size={15} />
        </button>
      )}
    </div>
  );
}

/* ---------------------------------- گام ۱: ببین ---------------------------------- */

function SeeStep({
  lesson,
  c,
  cText,
}: {
  lesson: GrammarMicroLesson;
  c: string;
  cText: string;
}) {
  const rolesUsed = [...new Set(lesson.see.pieces.map((p) => p.role))];
  return (
    <div className="space-y-4">
      {/* جملهٔ رنگی */}
      <div className="glesson-see rounded-2xl border c-card p-4">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-black text-stone-500">
          <Eye size={14} /> قاعده را با چشم بخوان — فاعل، فعل، مفعول هرکدام رنگ خودشان
        </p>
        <div dir="ltr" className="flex flex-wrap items-center justify-start gap-1.5">
          {lesson.see.pieces.map((piece, i) => (
            <motion.span
              key={`${piece.text}-${i}`}
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12 + i * 0.14, duration: 0.25 }}
              className={`glesson-piece glesson-role-${piece.role} rounded-lg border px-2.5 py-1.5 font-mono text-[14px] font-bold shadow-sm`}
            >
              {piece.text}
            </motion.span>
          ))}
        </div>

        {/* نوار زمان (درس‌های زمان‌محور) */}
        {lesson.see.timebar && (
          <div className="glesson-timebar mt-4 rounded-xl bg-stone-50 p-3">
            <p className={`mb-2 text-center text-[11.5px] font-black ${cText}`}>
              نوار زمان: {lesson.see.timebar.label}
            </p>
            <div dir="ltr" className="relative h-1.5 rounded-full bg-gradient-to-r from-stone-300 via-stone-400 to-stone-300">
              <motion.span
                initial={{ left: "0%" }}
                animate={{ left: `${lesson.see.timebar.marker}%` }}
                transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
                className="absolute -top-[7px] z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center"
              >
                <span className={`absolute h-3.5 w-3.5 rounded-full ${c}`} />
                <span className={`relative h-3.5 w-3.5 animate-ping rounded-full opacity-40 ${c}`} />
              </motion.span>
            </div>
            <div dir="ltr" className="mt-2 flex justify-between text-[10px] font-bold text-stone-500">
              <span>گذشته</span>
              <span>اکنون</span>
              <span>آینده</span>
            </div>
          </div>
        )}

        {/* راهنمای نقش‌ها */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rolesUsed.map((role) => (
            <span key={role} className={`glesson-piece glesson-role-${role} rounded-full border px-2 py-0.5 text-[10px] font-black`}>
              {ROLE_LABELS[role]}
            </span>
          ))}
        </div>
      </div>

      {/* نکتهٔ بصری */}
      <div className={`glesson-note rounded-xl border-l-4 border-r-4 p-3.5 text-[12.5px] font-bold leading-6 text-stone-700 ${cText}`} style={{ borderRightColor: "currentColor", borderLeftColor: "transparent" }}>
        {lesson.see.note}
      </div>
    </div>
  );
}

/* --------------------------------- گام ۲: بفهم ---------------------------------- */

function MirrorStep({ lesson }: { lesson: GrammarMicroLesson }) {
  return (
    <div className="space-y-4">
      {lesson.mirrors.map((m, mi) => (
        <div key={mi} className="glesson-mirror space-y-2">
          {/* جفت آینه */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            <div className="glesson-mirror-fa rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
              <p className="mb-1 text-[10px] font-black text-emerald-500">فارسی</p>
              <p className="text-[13px] font-bold leading-6 text-emerald-900">{m.fa}</p>
            </div>
            <div className="flex items-center justify-center">
              <MirrorIcon size={16} className="text-stone-300" />
            </div>
            <div className="glesson-mirror-en rounded-xl border c-card p-3 text-center" dir="ltr">
              <p className="mb-1 text-[10px] font-black text-stone-500">English</p>
              <p className="font-mono text-[12.5px] font-bold leading-6 text-stone-800">{m.en}</p>
            </div>
          </div>

          {/* انگلیسی چه چیزی اضافه دارد */}
          <div className="glesson-adds rounded-xl bg-stone-50 p-3 text-[12px] font-bold leading-6 text-stone-600">
            <span className="text-stone-500">انگلیسی چه چیزی اضافه می‌کند؟ </span>
            {m.adds}
          </div>

          {/* غلط کلاسیک ایرانی */}
          <div className="glesson-mistake rounded-xl border border-rose-200 bg-rose-50/70 p-3">
            <p className="glesson-mistake-title mb-1.5 flex items-center gap-1 text-[11px] font-black text-rose-500">
              <MessageCircleQuestion size={13} /> غلط کلاسیک ما ایرانی‌ها
            </p>
            <div className="space-y-1.5 font-mono text-[12.5px] font-bold" dir="ltr">
              <p className="glesson-wrong text-rose-600 line-through decoration-rose-400/70 decoration-2">{m.mistake.wrong}</p>
              <p className="glesson-right flex items-center gap-1.5 text-emerald-700">
                <Check size={14} strokeWidth={3} /> {m.mistake.right}
              </p>
            </div>
            <p className="glesson-mistake-why mt-2 border-t border-rose-200/60 pt-2 text-[11.5px] font-bold leading-5 text-rose-800/90" dir="rtl">
              {m.mistake.why}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- گام ۳: امتحان کن -------------------------------- */

function TryStep({
  lesson,
  picked,
  whyOpen,
  onPick,
  onWhy,
  done,
  correct,
  percent,
  onGoQuiz,
  onRestart,
}: {
  lesson: GrammarMicroLesson;
  picked: (number | null)[];
  whyOpen: number | null;
  onPick: (qi: number, oi: number) => void;
  onWhy: (qi: number) => void;
  done: boolean;
  correct: number;
  percent: number;
  onGoQuiz: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-3">
      {lesson.try.map((q, qi) => {
        const myPick = picked[qi];
        const answered = myPick !== null;
        const isRight = myPick === q.answer;
        return (
          <div key={qi} className="glesson-q rounded-2xl border c-card p-4">
            <p className="mb-2.5 flex items-baseline gap-1.5">
              <span className="text-[11px] font-black text-stone-500">{faNum(qi + 1)}.</span>
              <span dir="ltr" className="glesson-q-prompt font-mono text-[13.5px] font-bold leading-6 text-stone-800">
                {q.prompt}
              </span>
            </p>
            <div className="flex flex-wrap gap-2" dir="ltr">
              {q.options.map((opt, oi) => {
                const chosen = myPick === oi;
                const realAnswer = oi === q.answer;
                let cls = "glesson-opt border c-card text-stone-700 hover:border-stone-400";
                if (answered && realAnswer) cls = "glesson-opt glesson-opt-correct border border-emerald-400 bg-emerald-50 text-emerald-800";
                else if (answered && chosen && !realAnswer) cls = "glesson-opt glesson-opt-wrong border border-rose-400 bg-rose-50 text-rose-700";
                else if (answered) cls = "glesson-opt glesson-opt-muted border border-stone-100 bg-stone-50 text-stone-500";
                return (
                  <button
                    key={oi}
                    onClick={() => !answered && onPick(qi, oi)}
                    disabled={answered}
                    aria-pressed={chosen}
                    className={`rounded-xl border px-3 py-2 font-mono text-[12.5px] font-bold transition-[background-color,color,border-color,transform] ${cls} ${answered ? "cursor-default" : "active:scale-[0.96]"}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* بازخورد فوری + چرا اشتباه شد؟ */}
            {answered && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${isRight ? "glesson-chip-right bg-emerald-100 text-emerald-700" : "glesson-chip-wrong bg-rose-100 text-rose-700"}`}>
                    {isRight ? "✓ درست!" : "✗ اشتباه شد"}
                  </span>
                  {!isRight && (
                    <button
                      onClick={() => onWhy(qi)}
                      className="glesson-why-btn inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-black text-stone-600 transition hover:bg-white active:scale-[0.96]"
                    >
                      <MessageCircleQuestion size={12} /> چرا اشتباه شد؟
                    </button>
                  )}
                </div>
                {!isRight && whyOpen === qi && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="glesson-why mt-2 rounded-xl bg-stone-50 p-3 text-[12px] font-bold leading-6 text-stone-700"
                  >
                    {whyAnswer(q.why)}
                  </motion.p>
                )}
              </motion.div>
            )}
          </div>
        );
      })}

      {/* کارت پایان درس */}
      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`glesson-done rounded-2xl border-2 border-dashed p-4 text-center ${percent === 100 ? "glesson-done-perfect border-emerald-300 bg-emerald-50" : "glesson-done-ok border-stone-300 bg-stone-50"}`}
        >
          <p className={`glesson-done-title mb-1 flex items-center justify-center gap-1.5 text-[14px] font-black ${percent === 100 ? "text-emerald-700" : "text-stone-700"}`}>
            <PartyPopper size={17} />
            {percent === 100 ? "سه‌تایی تمیز — درس را رد کردی!" : "درس تمام شد!"}
          </p>
          <p className="glesson-done-sub mb-3 text-[12px] font-bold text-stone-500">
            امتحان کن: {faNum(correct)} از {faNum(lesson.try.length)} درست ({faNum(percent)}٪) — حالا وقت آزمونک واقعی ایستگاه است
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={onGoQuiz}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md transition-[background-color,color,border-color,box-shadow,transform] hover:brightness-110 active:scale-[0.96] bg-stone-800`}
            >
              <Swords size={15} /> آزمونک ایستگاه را بزن
            </button>
            <button
              onClick={onRestart}
              className="glesson-restart inline-flex items-center gap-1.5 rounded-xl border c-card px-4 py-2.5 text-[13px] font-extrabold text-stone-600 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:bg-stone-50 active:scale-[0.96]"
            >
              مرور دوبارهٔ درس
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
