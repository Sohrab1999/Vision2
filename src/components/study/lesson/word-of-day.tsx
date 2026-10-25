"use client";

// ------------------------------------------------------------------
// Word of the day — deterministic daily pick from all 3 lessons.
// Same word for everyone on the same day; changes at midnight.
// ------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, BookOpen, Sparkles } from "lucide-react";
import { lessons } from "@/data";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum, posLabel } from "@/lib/study-theme";
import { lessonOrdinalFa } from "@/data/lesson-meta";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import WordUsageDialog from "./word-usage-dialog";
import BookletUsageChip, { useBookletUsageTarget } from "./booklet-usage-chip";
import PairSpeakChips from "./pair-speak-chips";
import { speakFailToast } from "@/lib/speak";
import { setListenSurface } from "@/lib/listen-surface";
import { isTypingTarget, useKeydown } from "@/hooks/use-keyboard";
import SpeakButton from "../shared/speak-button";

// راند ۲۰۵: نقشهٔ عددِ اصلیِ محلی حذف شد — «درس هفتم» و بقیه از کمکیِ مشترکِ
// lesson-meta می‌آید (تکِ منبعِ حقیقت؛ همان نقشه‌ای که کتاب‌خانه و فوتر می‌خوانند)

export default function WordOfDay() {
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const setView = useStudy((s) => s.setView);
  const known = useStudy((s) => s.known);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const mounted = useMounted();
  // راند ۲۵۴ — «کاربرد در جزوه» رویِ کارتِ واژهٔ روز (بندِ ① پیشنهادِ ۲۵۳):
  // چهارمین مصرف‌کنندهٔ خانواده، همان تک‌منبع + همان دیالوگِ مشترک؛
  // r389 — سیم‌کشی به مالکِ یکتایِ چیپ
  const usage = useBookletUsageTarget();

  const pick = useMemo(() => {
    // build flat vocab list with lesson ref
    const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
    const d = new Date();
    const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    const w = all[seed % all.length];
    return { ...w, key: `${w.lessonId}:${w.en.toLowerCase()}` };
  }, []);

  const isKnown = mounted ? Boolean(known[pick.key]) : false;
  const lesson = lessons.find((l) => l.id === pick.lessonId);

  // round 204: booklet syn/ant pairs on the daily card (same index the
  // dictionary uses — task 203), tap a chip to hear the counterpart
  const pairIndex = useMemo(() => buildSynAntIndex(lessons), []);
  const pairs = mounted ? synAntPairsFor(pairIndex, pick.en) : [];

  // ---------------------------------------------------------------------
  // r411 — میانبرِ T رویِ کارتِ واژهٔ روز: «دوبارهشنیدنِ واژهٔ روز» —
  // ایدئومِ «آخرین شنیده» (جدولِ افعالِ r410) رویِ تک‌هدف:
  //  · هدفِ T فقط چیپِ اصلیِ کارت است (خودِ واژهٔ روز) — چیپهایِ جفت
  //    (PairSpeakChips — مالکِ یکتایِ r390) و چیپِ «در جزوه» هدفِ T
  //    نمیشوند؛ سطحِ شنیدارِ این کارت یک هدف دارد، نه چند هدف.
  //  · lastHeard فقط با «شروعِ روخوانی» ثبت میشود (onSpeak پیش از هر
  //    تلاشِ شبکه) — بی‌شنیده، T همان شب/روزِ پوسته میماند (صداقتِ r236
  //    و جراحیِ r410: کارتِ خانه ناوبر نیست و T را پیش از نخستین شنیده
  //    نمیرباید). حافظه، stateِ خودِ کارت است — با خروج از خانه می‌پرد
  //    و T دوباره به پوسته برمی‌گردد (عینِ چرخهٔ عمرِ جدولها).
  //  · T = کلیکِ امریِ همان چیپ: playing توقف، idle دوبارهخوانی — استِ
  //    روخوانی نزدِ مالکِ چیپ (درسِ r409). T هیچ چیزی ثبت نمیکند،
  //    «بلدم» را نمیزند و ناوبری نمیکند — فقط شنیدار.
  //  · پرچمِ سطحِ شنیدار در خانه اثری بر گاردِ ارقامِ r411 ندارد (خانه
  //    رقمی ندارد) — فقط T را از پوسته میگیرد، تا وقتی کارت زنده است.
  // ---------------------------------------------------------------------
  const wotdChipRef = useRef<HTMLButtonElement | null>(null);
  const registerWotdChip = useCallback((el: HTMLButtonElement | null) => {
    wotdChipRef.current = el;
  }, []);
  const [heardWotd, setHeardWotd] = useState(false);
  const markHeard = useCallback(() => setHeardWotd(true), []);

  useEffect(() => {
    setListenSurface(heardWotd);
  }, [heardWotd]);
  useEffect(() => {
    return () => {
      setListenSurface(false);
    };
  }, []);

  useKeydown((e) => {
    if (isTypingTarget(e)) return;
    if (e.code === "KeyT") {
      if (!heardWotd) return; // بی‌شنیده — T مالِ پوسته است (شب/روز)
      e.preventDefault();
      wotdChipRef.current?.click();
    }
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      aria-label="واژهٔ امروز"
      className="word-day relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-l from-teal-50 via-emerald-50 to-lime-50 shadow-sm"
    >
      {/* decorative watermark */}
      <span className="pointer-events-none absolute -left-6 -top-8 select-none text-[110px] font-black leading-none text-emerald-900/5" aria-hidden>
        W
      </span>

      <div className="relative grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
        {/* icon + label */}
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-lg shadow-emerald-900/25">
            <CalendarDays size={26} />
          </div>
          <div>
            {/* r329 — جوهرِ -۷۰۰ رویِ گرادیانِ word-day (کاپوزیتِ #dfece7)
                = ۴٫۴۲/۴٫۴۱ (زنده)؛ -۸۰۰ ≥۶٫۳ — دوقلویِ -۸۰۰ در قاعدهٔ scoped تاریک */}
            <div className="flex items-center gap-1 text-[12px] font-black text-emerald-800">
              <Sparkles size={12} />
              واژهٔ امروز
            </div>
            <div className="text-[11px] text-stone-500">هر روز یک واژهٔ تازه از همهٔ درس‌ها</div>
          </div>
        </div>

        {/* word + meaning */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="en-text text-2xl font-black text-stone-800" dir="ltr">
              {pick.en}
            </span>
            {pick.pos && (
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10.5px] font-bold text-teal-800">
                {posLabel[pick.pos] ?? pick.pos}
              </span>
            )}
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
              درس {lessonOrdinalFa(pick.lessonId)}
            </span>
          </div>
          <p className="mt-1 truncate text-[13.5px] font-bold text-stone-600">{pick.fa}</p>
          {pairs.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {/* r390 — چیپهایِ «روخوانی جفت» از مالکِ یکتایِ PairSpeakChips */}
              <PairSpeakChips pairs={pairs} en={pick.en} onSpeakError={speakFailToast} />
            </div>
          )}
          {/* راند ۲۵۴ → ۳۸۹ — چیپِ «در جزوه» کنارِ جفت‌ها: این واژهٔ امروز کجای
              مکالمه/ریدینگِ جزوه آمده؟ فقط با تطبیقِ واقعی — بیکاربرد، هیچ
              (صداقتِ همیشگیِ خانواده؛ قالب حالا در مالکِ یکتایِ r389). کارتِ
              خودش را دارد — no stopPropagation لازم نیست (برخلافِ کارتِ بلدمِ
              تبِ واژگان). mt-1.5: فاصلهٔ چیدمانیِ خودِ کارت. */}
          <BookletUsageChip
            en={pick.en}
            mounted={mounted}
            testid={`usage-chip-${pick.en.replace(/\s+/g, "-")}`}
            onOpen={usage.open}
            className="mt-1.5"
          />
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <SpeakButton text={pick.en} size="md" onSpeak={markHeard} ref={registerWotdChip} />
            {/* r411 — راهنمایِ صادقِ T: فقط با شنیدهٔ زنده؛ بی‌شنیده هیچ */}
            {heardWotd && (
              <span
                data-testid="wotd-t-hint"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                <kbd className="rounded-md border border-emerald-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300" dir="ltr">
                  T
                </kbd>
                دوبارهشنیدنِ واژهٔ روز
              </span>
            )}
          </span>
          <button
            onClick={() => toggleKnown(pick.key)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-[background-color,color,border-color,box-shadow,transform] active:scale-[0.96] ${
              isKnown
                ? "border-emerald-600 bg-emerald-700 text-white shadow-md shadow-emerald-600/25"
                : "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
            }`}
            aria-pressed={isKnown}
          >
            {isKnown ? "✓ بلدم" : "بلدم؟"}
          </button>
          <button
            onClick={() => openLessonTab(pick.lessonId, "vocab")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12px] font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.96]"
          >
            <BookOpen size={14} />
            فلش‌کارت درس
          </button>
          <button
            onClick={() => setView({ type: "dictionary" })}
            className="hidden items-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-bold text-teal-800 transition-[background-color,color,border-color,transform] hover:text-teal-900 active:scale-[0.96] sm:inline-flex"
          >
            در دیکشنری ↗
          </button>
        </div>
      </div>

      {/* bottom strip */}
      <div className="h-1.5 w-full bg-gradient-to-l from-teal-500 via-emerald-500 to-lime-400" />
      {mounted && lesson && (
        <span className="sr-only">
          واژهٔ امروز از {lesson.titleFa} انتخاب شده است. مجموع واژگان {faNum(lesson.vocabulary.length)} واژه.
        </span>
      )}

      {/* راند ۲۵۴ — دیالوگِ مشترکِ «کاربرد در جزوه» (تک‌منبع با دیکشنری/تبِ واژگان/فلش‌کارت) */}
      <WordUsageDialog target={usage.target} onClose={usage.close} />
    </motion.section>
  );
}
