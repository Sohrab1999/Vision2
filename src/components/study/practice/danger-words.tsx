"use client";

// ------------------------------------------------------------------
// F7 «واژه‌های خطرناک من» — word-level mistake analysis panel
// (roadmap sprint 4). Ranks the learner's most-missed vocabulary,
// then closes the loop with two targeted CTAs:
//   • فلش‌کارت همین‌ها  → Flashcards restricted to the dangerous subset
//   • تمرین همین‌ها     → generated drill (real bank Qs when possible)
//   • (r255) چیپِ «در جزوه · N» در ردیفِ هر واژه — ششمین مصرف‌کنندهٔ
//     دیالوگِ مشترکِ word-usage-dialog (بندِ ① پیشنهادِ ۲۵۴): خطایِ
//     مکرر رویِ یک واژه حالا یک کلیک تا متنِ واقعیِ جزوه فاصله دارد؛
//     بی‌کاربرد، هیچ (صداقتِ r252). ردیف کلیکِ خودش را ندارد پس
//     stopPropagation لازم نیست؛ aria-label همان قراردادِ «مکالمه‌ها
//     و ریدینگ‌ها» است.
// ------------------------------------------------------------------

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BookOpenText, Sparkles, Zap, TrendingDown, Star, Ear } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { dangerWords, buildDangerQuiz, type DangerWord } from "@/lib/word-risk";
import { buildDangerDictation, DICTATION_MIN_DANGER } from "@/lib/danger-dictation";
import { findLesson, lessons } from "@/data";
import { lessonNameFa } from "@/data/lesson-meta";
import { faNum } from "@/lib/study-theme";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import { useToast } from "@/hooks/use-toast";
import { speak } from "@/lib/speak";
import { trackEvent } from "@/lib/analytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { findWordUsages, type WordUsageSite } from "@/lib/word-usage";
import Flashcards from "../lesson/flashcards";
import QuizEngine from "../quiz/quiz-engine";
import DictationTab from "../lesson/dictation-tab";
import WordUsageDialog from "../lesson/word-usage-dialog";

const lessonFa = lessonNameFa;

export default function DangerWords() {
  const wordMistakes = useStudy((s) => s.wordMistakes);
  const wordSeen = useStudy((s) => s.wordSeen);
  const starredWords = useStudy((s) => s.starredWords);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();
  const { toast } = useToast();
  // راندِ ۳۴۵ — چیپِ «روخوانی جفت» در شکستِ صدا ساکت نمی‌ماند
  // (همزبانِ خانوادهٔ شنیدار — listen-view)؛ هیچ رویدادِ تحلیلی رویِ پایِ شکست.
  const pairSpeakError = () =>
    toast({
      title: "🔇 پخش صدا ممکن نشد",
      description: "اتصال اینترنت را بررسی کن و دوباره روی دکمهٔ پخش بزن.",
      duration: 3500,
    });

  const starredSet = useMemo(() => new Set(starredWords), [starredWords]);

  const [flashOpen, setFlashOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);
  const [flashLesson, setFlashLesson] = useState<number | null>(null);

  // راند ۲۵۵ — ششمین مصرف‌کنندهٔ «کاربرد در جزوه»: ردیفِ خطاها هم یک کلیک
  // تا متنِ واقعیِ جزوه فاصله دارد (تک‌منبع با پنج مصرف‌کنندهٔ پیشین)
  const [usage, setUsage] = useState<{ en: string; sites: WordUsageSite[] } | null>(null);

  const list = useMemo<DangerWord[]>(
    () => (mounted ? dangerWords(wordMistakes, wordSeen, 10) : []),
    [wordMistakes, wordSeen, mounted]
  );

  const lessonsPresent = useMemo(() => [...new Set(list.map((d) => d.lessonId))].sort(), [list]);
  const totalMistakes = useMemo(() => list.reduce((s, d) => s + d.mistakes, 0), [list]);

  // راند ۲۰۶: جفت‌های جزوه در ردیف‌های رتبه‌بندی — فشرده (تا ۲ چیپ)، چون ردیف شلوغ است
  const pairIndex = useMemo(() => buildSynAntIndex(lessons), []);

  const practice = useMemo(() => (practiceOpen ? buildDangerQuiz(list, 10) : null), [practiceOpen, list]);

  const dictSource = useMemo(
    () => (dictOpen && list.length > 0 ? buildDangerDictation(list) : null),
    [dictOpen, list]
  );

  const openFlashcards = () => {
    setFlashLesson(lessonsPresent[0] ?? list[0]?.lessonId ?? 1);
    setFlashOpen(true);
    trackEvent("danger_flashcards");
  };

  const flashLessonId = flashLesson ?? lessonsPresent[0] ?? 1;
  const flashLessonData = findLesson(flashLessonId);
  const flashWords = list
    .filter((d) => d.lessonId === flashLessonId)
    .map((d) => ({ en: d.en, fa: d.fa }));

  return (
    <section aria-label="واژه‌های خطرناک من" className="overflow-hidden rounded-2xl border c-card shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-l from-rose-500 via-orange-400 to-amber-400" />
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-900/20">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-stone-800">
              واژه‌های خطرناک من
              {/* r327 — چیپِ شمارنده در تاریک رویِ bg-rose-100ِ بازنگشته
                  میمرد (کرنلِ متنِ rose-600 → #fda4af رویِ گلیِ روشن = ۱٫۵۸)؛
                  زمینهٔ تیرهٔ خانواده جوهرِ کرنل را سالم نگه میدارد (۹٫۴۵) */}
              {list.length > 0 && (
                /* r329 — روشن: رزِ -۶۰۰ رویِ rose-100 = ۳٫۷۷ (زنده)؛ -۸۰۰ = ۶٫۵۹.
                   تاریک: هم‌ارزشِ کرنل (#fda4af) — قاعدهٔ r327 پابرجا */
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800 dark:bg-rose-950/60">
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
          <div className="rounded-xl border-2 border-dashed border-stone-200 c-stone-60 px-4 py-7 text-center">
            <TrendingDown size={22} className="mx-auto mb-2 text-stone-300" />
            <p className="text-[12.5px] font-bold text-stone-500">هنوز واژهٔ خطری ثبت نشده</p>
            <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-5 text-stone-500">
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
                    className="flex items-center gap-3 rounded-xl border border-stone-100 c-stone-70 px-3 py-2.5"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11.5px] font-black text-white ${
                        /* r327 — سفید رویِ استاپهایِ ۵۰۰/۴۰۰ میمرد (۲٫۸۹)؛
                           جفتهایِ عمیق در هر دو تم ≥۴٫۵ — تهِ -۷۰۰ در تاریک
                           به #fdba74 بازمیگردد (توکنِ orange-700) پس -۹۵۰ */
                        hot ? "bg-gradient-to-br from-rose-700 to-orange-950" : "bg-gradient-to-br from-amber-700 to-orange-950"
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
                      {/* r322 — ردیفِ متایِ ردیف: چهار chip (نوار + درصد + شمارش +
                          در جزوه + مترادف) بدونِ wrap در ۳۹۰ تا ۹px از کادرِ
                          min-w-0 بیرون میزدند (سنجشِ زندهٔ شخصیتِ قهرمان —
                          اولین suspectِ واقعیِ دامِ basis-صفر در حالتِ پُر).
                          flex-wrap: در دسکتاپ همه جا میشود (رندرِ عیناً همان)،
                          در موبایل chipِ اضافی به سطرِ دوم میرود نه رویِ دکمهها. */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-200">
                          <motion.span
                            className={`block h-full rounded-full ${hot ? "bg-rose-700" : "bg-amber-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(12, ratePct)}%` }}
                            transition={{ duration: 0.6, delay: 0.1 + i * 0.04 }}
                          />
                        </span>
                        {/* r329 — ردیفِ خطا: رزِ -۶۰۰ رویِ ردیفِ نقابِ سنگی = ۴٫۳۸ و
                            کهربایِ -۶۰۰ = ۳٫۳ (زنده با بوم)؛ -۷۰۰/-۸۰۰ ≥۵٫۵ */}
                        <span className={`text-[10.5px] font-black ${hot ? "text-rose-700" : "text-amber-800"}`}>
                          {faNum(ratePct)}٪ خطا
                        </span>
                        <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          {faNum(d.mistakes)} بار غلط
                        </span>
                        <span className="hidden rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500 sm:inline">
                          {lessonFa(d.lessonId)}
                        </span>
                        {(() => {
                          // راند ۲۵۵ — چیپِ «در جزوه» رویِ ردیفِ خطا: واژه‌ای که
                          // بیشترین غلط را از یادگیرنده گرفته، باید ببیند کجای
                          // جزوه زندگی می‌کند — بی‌کاربرد، هیچ (صداقتِ r252).
                          const sites = findWordUsages(d.en);
                          if (sites.length === 0) return null;
                          return (
                            <button
                              type="button"
                              data-testid={`danger-usage-chip-${d.en.replace(/\s+/g, "-")}`}
                              onClick={() => setUsage({ en: d.en, sites })}
                              title="کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه"
                              aria-label={`کاربرد ${d.en} در مکالمه‌ها و ریدینگ‌ها — ${faNum(sites.length)} مورد`}
                              className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50/60 px-1.5 py-0.5 text-[10.5px] font-bold text-sky-700 transition-[background-color,color,border-color,transform] active:scale-[0.96]"
                            >
                              <BookOpenText size={11} aria-hidden />
                              در جزوه · {faNum(sites.length)}
                            </button>
                          );
                        })()}
                        {(() => {
                          // چیپ‌های فشردهٔ جفت — حداکثر ۲ تا؛ کلیک همتا را روخوانی می‌کند
                          const pairs = synAntPairsFor(pairIndex, d.en);
                          if (pairs.length === 0) return null;
                          return (
                            <span className="flex flex-wrap items-center gap-1">
                              {pairs.slice(0, 2).map((p) => (
                                <button
                                  key={`${p.kind}-${p.other}-${p.lessonId}`}
                                  type="button"
                                  onClick={() => void speak(p.other, 0.95, undefined, pairSpeakError)}
                                  title="روخوانی جفت"
                                  aria-label={`${p.kind === "syn" ? "مترادف" : "متضاد"}ِ ${d.en}: ${p.other} — روخوانی`}
                                  className={`dict-pair-chip inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                                    p.kind === "syn"
                                      ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                                      : "border-rose-200 bg-rose-50/60 text-rose-700"
                                  }`}
                                >
                                  <span aria-hidden className="font-black">{p.kind === "syn" ? "≈" : "↔"}</span>
                                  <span dir="ltr">{p.other}</span>
                                </button>
                              ))}
                              {pairs.length > 2 && (
                                <span
                                  className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500"
                                  title="ردیف‌های جفت دیگر در تبِ مترادف و متضاد درس"
                                >
                                  +{faNum(pairs.length - 2)}
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    {(() => {
                      const isStarred = starredSet.has(d.key);
                      return (
                        <motion.button
                          whileTap={{ scale: 0.75 }}
                          onClick={() => toggleStarred(d.key)}
                          title={isStarred ? `حذف «${d.en}» از واژه‌های من` : `افزودن «${d.en}» به واژه‌های من`}
                          aria-label={isStarred ? `حذف «${d.en}» از واژه‌های من` : `افزودن «${d.en}» به واژه‌های من`}
                          aria-pressed={isStarred}
                          className="shrink-0 self-start rounded-md p-1 transition-[background-color,color,border-color,transform] hover:scale-110 active:scale-[0.96]"
                        >
                          <Star
                            size={15}
                            className={
                              isStarred
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300 transition-colors hover:text-amber-400"
                            }
                          />
                        </motion.button>
                      );
                    })()}
                  </motion.li>
                );
              })}
            </ul>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <button
                onClick={openFlashcards}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[13px] font-bold text-violet-700 transition-[background-color,color,border-color,transform] hover:bg-violet-100 active:scale-[0.96]"
              >
                <Sparkles size={15} />
                فلش‌کارت همین‌ها
              </button>
              <button
                onClick={() => (setPracticeOpen(true), trackEvent("danger_practice"))}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-rose-700 to-orange-950 px-4 py-2.5 text-[13px] font-black text-white shadow-md shadow-rose-500/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
              >
                <Zap size={15} />
                تمرین همین‌ها
              </button>
              <button
                onClick={() => (setDictOpen(true), trackEvent("danger_dictation_start"))}
                disabled={list.length < DICTATION_MIN_DANGER}
                title={
                  list.length < DICTATION_MIN_DANGER
                    ? `حداقل ${faNum(DICTATION_MIN_DANGER)} واژهٔ خطرناک لازم است`
                    : undefined
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] font-bold text-rose-700 transition-[background-color,color,border-color,transform,opacity] enabled:hover:bg-rose-100 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Ear size={15} />
                دیکتهٔ همین‌ها
              </button>
            </div>
            <p className="mt-2.5 text-center text-[10.5px] leading-5 text-stone-500">
              این تحلیل از تست‌های واژگان، دیکته و تمرین شنیداریِ خودت ساخته می‌شود — هرچه بیشتر تمرین کنی دقیق‌تر می‌شود.
              <br />
              واژه‌های خطرناک را با <Star size={10} className="inline fill-amber-400 text-amber-400" /> ستاره به «واژه‌های من» بفرست تا در آزمون و فلش‌کارت شخصی مرور شوند.
            </p>
          </>
        )}
      </div>

      {/* targeted flashcards dialog */}
      <Dialog open={flashOpen} onOpenChange={setFlashOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
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
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition-[background-color,color,border-color,box-shadow,transform] active:scale-[0.96] ${
                    flashLessonId === lid ? "bg-violet-600 text-white shadow-md" : "border c-card text-stone-600 hover:border-violet-300"
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

      {/* targeted dictation dialog — spell the ranked mistakes by ear */}
      <Dialog open={dictOpen} onOpenChange={setDictOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Ear size={16} className="text-rose-600" />
              دیکتهٔ واژه‌های خطرناک
            </DialogTitle>
          </DialogHeader>
          {dictSource && <DictationTab source={dictSource} onExit={() => setDictOpen(false)} exitLabel="بازگشت به واژه‌های خطرناک" />}
        </DialogContent>
      </Dialog>

      {/* targeted practice dialog */}
      <Dialog open={practiceOpen} onOpenChange={setPracticeOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
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
              // راند ۲۴۹ — بندِ ① پیشنهادِ ۲۴۸: خانوادهٔ resumeDoor به
              // تمرینِ هدفمندِ واژه‌های خطرناک هم رسید — نتیجه در دیالوگ
              // گرفته می‌شود و راهِ برگشت به ضمیمه همان‌جاست؛ پرش، دیالوگ
              // را با ویویِ خانه جمع می‌کند (تمیز، بدون نشتِ سشن).
              resumeDoor
              onExit={() => setPracticeOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* راند ۲۵۵ — دیالوگِ مشترکِ «کاربرد در جزوه» (تک‌منبع) — از ردیفِ خطا */}
      <WordUsageDialog target={usage} onClose={() => setUsage(null)} />
    </section>
  );
}
