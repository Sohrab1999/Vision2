"use client";

// ------------------------------------------------------------------
// F7 «واژه‌های خطرناک من» — word-level mistake analysis panel
// (roadmap sprint 4). Ranks the learner's most-missed vocabulary,
// then closes the loop with two targeted CTAs:
//   • فلش‌کارت همین‌ها  → Flashcards restricted to the dangerous subset
//   • تمرین همین‌ها     → generated drill (real bank Qs when possible)
// ------------------------------------------------------------------

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, Zap, TrendingDown } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { dangerWords, buildDangerQuiz, type DangerWord } from "@/lib/word-risk";
import { findLesson } from "@/data";
import { faNum } from "@/lib/study-theme";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Flashcards from "./flashcards";
import QuizEngine from "./quiz-engine";

const lessonFa = (id: number) => (id === 1 ? "درس اول" : id === 2 ? "درس دوم" : "درس سوم");

export default function DangerWords() {
  const wordMistakes = useStudy((s) => s.wordMistakes);
  const wordSeen = useStudy((s) => s.wordSeen);
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();

  const [flashOpen, setFlashOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [flashLesson, setFlashLesson] = useState<number | null>(null);

  const list = useMemo<DangerWord[]>(
    () => (mounted ? dangerWords(wordMistakes, wordSeen, 10) : []),
    [wordMistakes, wordSeen, mounted]
  );

  const lessonsPresent = useMemo(() => [...new Set(list.map((d) => d.lessonId))].sort(), [list]);
  const totalMistakes = useMemo(() => list.reduce((s, d) => s + d.mistakes, 0), [list]);

  const practice = useMemo(() => (practiceOpen ? buildDangerQuiz(list, 10) : null), [practiceOpen, list]);

  const openFlashcards = () => {
    setFlashLesson(lessonsPresent[0] ?? list[0]?.lessonId ?? 1);
    setFlashOpen(true);
  };

  const flashLessonId = flashLesson ?? lessonsPresent[0] ?? 1;
  const flashLessonData = findLesson(flashLessonId);
  const flashWords = list
    .filter((d) => d.lessonId === flashLessonId)
    .map((d) => ({ en: d.en, fa: d.fa }));

  return (
    <section aria-label="واژه‌های خطرناک من" className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-l from-rose-500 via-orange-400 to-amber-400" />
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-900/20">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-stone-800">
              واژه‌های خطرناک من
              {list.length > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-600">
                  {faNum(list.length)} واژه
                </span>
              )}
            </h2>
            <p className="text-[12px] text-stone-500">
              {list.length > 0
                ? `واژه‌هایی که بیشترین اشتباه را از تو گرفته‌اند (${faNum(totalMistakes)} بار خطا) — همین‌ها را هدفمند تمرین کن`
                : "تحلیل اشتباه‌های تو در سطح واژه"}
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/60 px-4 py-7 text-center">
            <TrendingDown size={22} className="mx-auto mb-2 text-stone-300" />
            <p className="text-[12.5px] font-bold text-stone-500">هنوز واژهٔ خطری ثبت نشده</p>
            <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-5 text-stone-400">
              با حل تست‌های واژگان، دیکته و تمرین شنیداری، واژه‌هایی که بیشترین اشتباه را می‌گیری اینجا شناسایی می‌شوند.
            </p>
          </div>
        ) : (
          <>
            <ul className="max-h-96 space-y-2 overflow-y-auto nice-scroll pl-1">
              {list.map((d, i) => {
                const ratePct = Math.round(d.rate * 100);
                const hot = d.rate >= 0.5;
                return (
                  <motion.li
                    key={d.key}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/70 px-3 py-2.5"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11.5px] font-black text-white ${
                        hot ? "bg-gradient-to-br from-rose-500 to-orange-500" : "bg-gradient-to-br from-amber-400 to-orange-500"
                      }`}
                    >
                      {faNum(i + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="en-text text-[14px] font-bold text-stone-800" dir="ltr">
                          {d.en}
                        </span>
                        <span className="truncate text-[11.5px] text-stone-500">{d.fa}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-200">
                          <motion.span
                            className={`block h-full rounded-full ${hot ? "bg-rose-500" : "bg-amber-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(12, ratePct)}%` }}
                            transition={{ duration: 0.6, delay: 0.1 + i * 0.04 }}
                          />
                        </span>
                        <span className={`text-[10.5px] font-black ${hot ? "text-rose-600" : "text-amber-600"}`}>
                          {faNum(ratePct)}٪ خطا
                        </span>
                        <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-500">
                          {faNum(d.mistakes)} بار غلط
                        </span>
                        <span className="hidden rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500 sm:inline">
                          {lessonFa(d.lessonId)}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <button
                onClick={openFlashcards}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[13px] font-bold text-violet-700 transition-all hover:bg-violet-100 active:scale-95"
              >
                <Sparkles size={15} />
                فلش‌کارت همین‌ها
              </button>
              <button
                onClick={() => setPracticeOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-rose-500 to-orange-500 px-4 py-2.5 text-[13px] font-black text-white shadow-md shadow-rose-500/25 transition-all hover:opacity-95 active:scale-95"
              >
                <Zap size={15} />
                تمرین همین‌ها
              </button>
            </div>
            <p className="mt-2.5 text-center text-[10.5px] leading-5 text-stone-400">
              این تحلیل از تست‌های واژگان، دیکته و تمرین شنیداریِ خودت ساخته می‌شود — هرچه بیشتر تمرین کنی دقیق‌تر می‌شود.
            </p>
          </>
        )}
      </div>

      {/* targeted flashcards dialog */}
      <Dialog open={flashOpen} onOpenChange={setFlashOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles size={16} className="text-violet-600" />
              فلش‌کارت واژه‌های خطرناک
            </DialogTitle>
          </DialogHeader>
          {lessonsPresent.length > 1 && (
            <div className="mb-1 flex flex-wrap justify-center gap-2" dir="rtl">
              {lessonsPresent.map((lid) => (
                <button
                  key={lid}
                  onClick={() => setFlashLesson(lid)}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all active:scale-95 ${
                    flashLessonId === lid ? "bg-violet-600 text-white shadow-md" : "border border-stone-200 bg-white text-stone-600 hover:border-violet-300"
                  }`}
                >
                  {lessonFa(lid)}
                </button>
              ))}
            </div>
          )}
          {flashLessonData && flashWords.length > 0 && (
            <Flashcards lesson={flashLessonData} words={flashWords} onExit={() => setFlashOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* targeted practice dialog */}
      <Dialog open={practiceOpen} onOpenChange={setPracticeOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Zap size={16} className="text-rose-600" />
              تمرین هدفمند واژه‌های خطرناک
            </DialogTitle>
          </DialogHeader>
          {practice && practice.questions.length > 0 && (
            <QuizEngine
              title="واژه‌های خطرناک من"
              questions={practice.questions}
              resultKeyStr="0:danger"
              lessonId={0}
              category="danger"
              immediate
              trackMistakes={false}
              faOptions={(q) => practice.faOptions.has(q.id)}
              onExit={() => setPracticeOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
