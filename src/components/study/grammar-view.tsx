"use client";

// ---------------------------------------------------------------------
// متروی گرامر — ویوی نقشهٔ سفر گرامر (Task 39 / مرحلهٔ ۱ نقشهٔ راه گرامر)
// ۶ خط خانواده‌گرامری، ۱۵ ایستگاه واقعی از خود کتاب؛ رنگ ایستگاه از
// results موجود در استور مشتق می‌شود (بدون فیلد جدید) و پیشرفت با
// همان نتایج، خودبه‌خود در بک‌آپ/سینک ابری هم سفر می‌کند.
// ---------------------------------------------------------------------

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrainFront,
  Lock,
  Check,
  Compass,
  BookOpen,
  Lightbulb,
  Swords,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudy, todayStr } from "@/lib/study-store";
import { lessons } from "@/data";
import { GRAMMAR_LINES, type GrammarLine, type GrammarStation, type GrammarLineColor } from "@/data/grammar-map";
import {
  GRAMMAR_GREEN,
  mapSummary,
  lineStats,
  stationStatus,
  stationQuestions,
  lineProbe,
  stationKey,
  probeKey,
  bestPercent,
  probeRecommendation,
} from "@/lib/grammar-progress";
import { faNum } from "@/lib/study-theme";
import QuizEngine from "./quiz-engine";

// پالت هر خط (روشن/تیره با کلاس‌های scoped در globals.css کامل می‌شود)
const LINE_COLORS: Record<
  GrammarLineColor,
  { solid: string; rail: string; soft: string; text: string; border: string }
> = {
  emerald: {
    solid: "bg-emerald-600",
    rail: "bg-gradient-to-l from-emerald-300 via-emerald-500 to-emerald-700",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  amber: {
    solid: "bg-amber-500",
    rail: "bg-gradient-to-l from-amber-300 via-amber-400 to-amber-600",
    soft: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  teal: {
    solid: "bg-teal-600",
    rail: "bg-gradient-to-l from-teal-300 via-teal-500 to-teal-700",
    soft: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  rose: {
    solid: "bg-rose-500",
    rail: "bg-gradient-to-l from-rose-300 via-rose-400 to-rose-600",
    soft: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  violet: {
    solid: "bg-violet-600",
    rail: "bg-gradient-to-l from-violet-300 via-violet-500 to-violet-700",
    soft: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  orange: {
    solid: "bg-orange-500",
    rail: "bg-gradient-to-l from-orange-300 via-orange-400 to-orange-600",
    soft: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
};

interface QuizSession {
  title: string;
  questions: ReturnType<typeof stationQuestions>;
  resultKey: string;
  lessonId: number;
  perQuestionLesson: boolean; // probe: هر سؤال به درسِ خودش برمی‌گردد
}

export default function GrammarView() {
  const results = useStudy((s) => s.results);
  const setView = useStudy((s) => s.setView);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const [quiz, setQuiz] = useState<QuizSession | null>(null);
  const [dialog, setDialog] = useState<{
    line: GrammarLine;
    station: GrammarStation;
  } | null>(null);

  const summary = useMemo(() => mapSummary(results), [results]);

  const startStationQuiz = (line: GrammarLine, station: GrammarStation) => {
    const questions = stationQuestions(station);
    if (!questions.length) return;
    setDialog(null);
    setQuiz({
      title: `آزمونک ایستگاه: ${station.fa}`,
      questions,
      resultKey: stationKey(station.id),
      lessonId: station.lesson,
      perQuestionLesson: false,
    });
  };

  const startProbe = (line: GrammarLine) => {
    const questions = lineProbe(line, todayStr());
    if (!questions.length) return;
    setQuiz({
      title: `آزمون شناخت: ${line.fa}`,
      questions,
      resultKey: probeKey(line.id),
      lessonId: line.stations[0].lesson,
      perQuestionLesson: true,
    });
  };

  if (quiz) {
    const lessonOf = (q: { id: string }) => {
      const m = /^l(\d)-/.exec(q.id);
      return m ? (Number(m[1]) as 1 | 2 | 3) : quiz.lessonId;
    };
    return (
      <QuizEngine
        title={quiz.title}
        questions={quiz.questions}
        resultKeyStr={quiz.resultKey}
        lessonId={quiz.lessonId}
        category="grammar"
        immediate
        onExit={() => setQuiz(null)}
        mistakesOf={quiz.perQuestionLesson ? lessonOf : () => quiz.lessonId}
      />
    );
  }

  return (
    <div className="gmetro space-y-6">
      {/* ------------------------------- hero ------------------------------- */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="gmetro-hero relative overflow-hidden rounded-3xl bg-gradient-to-bl from-teal-600 via-teal-700 to-emerald-800 p-5 text-white shadow-lg shadow-teal-900/20 sm:p-7"
      >
        <TrainFront
          className="pointer-events-none absolute -left-4 -top-4 opacity-[0.09]"
          size={150}
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner">
            <TrainFront size={24} />
          </span>
          <div>
            <h1 className="text-xl font-black sm:text-2xl">متروی گرامر</h1>
            <p className="text-[13px] leading-6 text-teal-100">
              کل گرامر کتاب ویژن ۲، یک نقشهٔ سفر — هر خط یک خانواده، هر ایستگاه یک قاعده
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-bold">
            {faNum(summary.green)} ایستگاه سبز از {faNum(summary.total)}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-bold">
            {faNum(GRAMMAR_LINES.length)} خط · {faNum(summary.total)} ایستگاه
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-bold">
            آستانهٔ سبز شدن: {faNum(GRAMMAR_GREEN)}٪
          </span>
        </div>
        <div className="relative mt-4 grid gap-2 text-[12px] font-bold text-teal-50 sm:grid-cols-3">
          <span className="gmetro-step rounded-xl bg-white/10 px-3 py-2">
            ۱. درس و ترفند ایستگاه را بخوان
          </span>
          <span className="gmetro-step rounded-xl bg-white/10 px-3 py-2">
            ۲. آزمونکش را بالای {faNum(GRAMMAR_GREEN)}٪ بزن
          </span>
          <span className="gmetro-step rounded-xl bg-white/10 px-3 py-2">
            ۳. ایستگاه بعدی همان خط باز می‌شود
          </span>
        </div>
      </motion.section>

      {/* ------------------------------- lines ------------------------------- */}
      {GRAMMAR_LINES.map((line, li) => {
        const c = LINE_COLORS[line.color];
        const stats = lineStats(line, results);
        const probeRes = bestPercent(results, probeKey(line.id));
        return (
          <motion.section
            key={line.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(li * 0.05, 0.2) }}
            className={`gmetro-line rounded-2xl border ${c.border} ${c.soft} p-4 sm:p-5`}
            aria-label={line.fa}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`gmetro-badge rounded-full ${c.solid} px-3 py-1.5 text-[12px] font-black text-white shadow-sm`}
              >
                {line.fa}
                <span className="mr-1.5 font-mono text-[10px] font-bold opacity-80" dir="ltr">
                  {line.en}
                </span>
              </span>
              <span className="text-[12px] font-bold text-stone-500">
                {faNum(stats.green)} از {faNum(stats.total)} سبز
              </span>
              <button
                onClick={() => startProbe(line)}
                className={`gmetro-probe-btn mr-auto inline-flex items-center gap-1.5 rounded-full border ${c.border} bg-white px-3 py-1.5 text-[12px] font-extrabold ${c.text} shadow-sm transition-all hover:-translate-y-px hover:shadow active:scale-95`}
              >
                <Compass size={14} />
                {probeRes === null ? "آزمون شناخت خط" : `شناخت: ${faNum(probeRes)}٪`}
              </button>
            </div>

            {probeRes !== null && (
              <p className={`gmetro-probe-note mb-3 rounded-xl border ${c.border} bg-white/70 px-3 py-2 text-[12px] font-bold leading-6 ${c.text}`}>
                <Compass size={13} className="mb-0.5 inline-block" />{" "}
                {probeRecommendation(line, probeRes, results)}
              </p>
            )}

            {/* rail + stations (RTL: ایستگاه اول سمت راست) */}
            <div className="relative">
              <div
                className={`absolute inset-x-5 top-5 h-1.5 rounded-full ${c.rail} opacity-90`}
                aria-hidden
              />
              <ol className="nice-scroll relative flex snap-x gap-1 overflow-x-auto pb-1 pt-0">
                {line.stations.map((station, idx) => {
                  const status = stationStatus(line, idx, results);
                  const best = bestPercent(results, stationKey(station.id));
                  const locked = status === "locked";
                  return (
                    <li key={station.id} className="min-w-[96px] flex-1 snap-start">
                      <button
                        onClick={() => setDialog({ line, station })}
                        aria-label={`ایستگاه ${station.fa} — ${
                          status === "green"
                            ? "سبز"
                            : locked
                              ? "قفل"
                              : "باز"
                        }`}
                        className="group flex w-full flex-col items-center gap-1.5 px-1 pt-0"
                      >
                        <span
                          className={`gmetro-node relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 shadow-sm transition-transform group-hover:scale-110 group-active:scale-95 ${
                            status === "green"
                              ? `gmetro-node-green border-white ${c.solid} text-white`
                              : locked
                                ? "gmetro-node-locked border-stone-100 bg-stone-200 text-stone-400"
                                : `gmetro-node-open border-white bg-white ${c.text} shadow-md`
                          }`}
                        >
                          {status === "green" ? (
                            <Check size={17} strokeWidth={3.5} />
                          ) : locked ? (
                            <Lock size={13} />
                          ) : (
                            <span className={`h-2.5 w-2.5 rounded-full ${c.solid}`} />
                          )}
                        </span>
                        <span
                          className={`gmetro-label text-center text-[11px] font-extrabold leading-4 ${
                            status === "green"
                              ? c.text
                              : locked
                                ? "text-stone-400"
                                : "text-stone-700"
                          }`}
                        >
                          {station.fa}
                        </span>
                        <span
                          className={`gmetro-chip rounded-full px-2 py-0.5 text-[10px] font-black ${
                            status === "green"
                              ? `${c.solid} text-white`
                              : locked
                                ? "bg-stone-100 text-stone-400"
                                : "bg-white text-stone-500 border border-stone-200"
                          }`}
                        >
                          {status === "green"
                            ? `${faNum(best ?? GRAMMAR_GREEN)}٪ سبز`
                            : locked
                              ? "قفل"
                              : best !== null
                                ? `${faNum(best)}٪`
                                : "شروع کن"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.section>
        );
      })}

      {/* --------------------- station dialog --------------------- */}
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="gmetro-dialog max-h-[86vh] overflow-y-auto rounded-2xl p-0 nice-scroll sm:max-w-xl">
          {dialog && (
            <div className="p-5 pt-4">
              <DialogHeader className="mb-3 text-right">
                <DialogTitle className="flex flex-wrap items-center gap-2 text-base font-extrabold text-stone-800">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${LINE_COLORS[dialog.line.color].solid} text-white shadow-md`}
                  >
                    <Swords size={16} />
                  </span>
                  {dialog.station.fa}
                  <span className="font-mono text-[11px] font-bold text-stone-400" dir="ltr">
                    {dialog.station.en}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-[12px] leading-6 text-stone-500">
                  ایستگاهِ خط «{dialog.line.fa}» — درس {faNum(dialog.station.lesson)} از کتاب
                </DialogDescription>
              </DialogHeader>

              {/* ترفند حفظ — بذر کارت قاعده */}
              <div className="gmetro-tip mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Lightbulb size={17} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-[12.5px] font-bold leading-6 text-amber-800">
                  ترفند حفظ: {dialog.station.tip}
                </p>
              </div>

              {/* درس ایستگاه — همان محتوای واقعی کتاب */}
              <StationLesson station={dialog.station} />

              <div className="mt-4 flex flex-wrap gap-2">
                {(() => {
                  const status = stationStatus(dialog.line, dialog.line.stations.indexOf(dialog.station), results);
                  const canQuiz = status !== "locked" && stationQuestions(dialog.station).length > 0;
                  return (
                    <button
                      onClick={() => canQuiz && startStationQuiz(dialog.line, dialog.station)}
                      disabled={!canQuiz}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md transition-all active:scale-95 ${
                        canQuiz
                          ? `${LINE_COLORS[dialog.line.color].solid} hover:brightness-110`
                          : "cursor-not-allowed bg-stone-300 shadow-none"
                      }`}
                    >
                      {status === "locked" ? (
                        <>
                          <Lock size={15} /> اول ایستگاه قبلی را سبز کن
                        </>
                      ) : (
                        <>
                          <Swords size={15} /> شروع آزمونک ایستگاه
                        </>
                      )}
                    </button>
                  );
                })()}
                <button
                  onClick={() => {
                    openLessonTab(dialog.station.lesson, "grammar");
                    setDialog(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[13px] font-extrabold text-stone-600 shadow-sm transition-all hover:bg-stone-50 active:scale-95"
                >
                  <BookOpen size={15} />
                  توضیح کامل در کتاب
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* خانه — از هر ایستگاهی می‌شود برگشت */}
      <div className="flex justify-center pb-2">
        <button
          onClick={() => setView({ type: "home" })}
          className="text-[12px] font-bold text-stone-400 underline-offset-4 hover:text-stone-600 hover:underline"
        >
          بازگشت به خانه
        </button>
      </div>
    </div>
  );
}

// درس ایستگاه — همان سکشن واقعی گرامر کتاب (بدون تولید محتوای موازی)
function StationLesson({ station }: { station: GrammarStation }) {
  const sec = lessons[station.lesson - 1].grammar[station.section];
  return (
    <div
      className="g-html gmetro-lesson rounded-xl border border-stone-200 bg-white p-4"
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sec ? sec.html : "" }}
    />
  );
}
