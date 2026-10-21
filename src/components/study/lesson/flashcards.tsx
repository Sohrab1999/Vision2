"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, RefreshCw, Hand, Sparkles, Star, Layers, BookOpenText } from "lucide-react";
import type { LessonData, VocabWord } from "@/lib/study-types";
import { useStudy, wordKey, SRS_LABELS } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { isTypingTarget, useKeydown } from "@/hooks/use-keyboard";
import { trackEvent } from "@/lib/analytics";
import { posLabel, themeOf, faNum } from "@/lib/study-theme";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import { findWordUsages } from "@/lib/word-usage";
import WordUsageDialog from "./word-usage-dialog";
import { speak } from "@/lib/speak";
import { lessons } from "@/data";
import SpeakButton from "../shared/speak-button";

export interface FlashcardDeckCard {
  key: string; // "1:ability" — absolute store key (may span lessons)
  lessonId: number;
  word: VocabWord;
}

export default function Flashcards({
  lesson,
  onExit,
  startSmart = false,
  words,
  /** «واژه‌های من» — a resolved multi-lesson deck; overrides lesson/words entirely */
  deck,
}: {
  lesson: LessonData;
  onExit: () => void;
  startSmart?: boolean;
  /** F7 — restrict the deck to a specific subset (e.g. dangerous words) */
  words?: VocabWord[];
  /** multi-lesson personal deck (lib/my-words-deck buildMyWordsDeck) */
  deck?: { color: string; cards: FlashcardDeckCard[] };
}) {
  const [smartMode, setSmartMode] = useState(startSmart);
  // راند ۲۷۴ — اندازهٔ پاسِ مرورِ هوشمند در لحظهٔ روشن‌شدن (نوارِ پیشرفتِ صادق)
  const [passTotal, setPassTotal] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const known = useStudy((s) => s.known);
  const srs = useStudy((s) => s.srs);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const starredWords = useStudy((s) => s.starredWords);
  const reviewWord = useStudy((s) => s.reviewWord);
  const trackReview = useStudy((s) => s.trackReview);
  const mounted = useMounted();
  // راند ۲۵۳ — «کاربرد در جزوه» رویِ پشتِ فلش‌کارت (بندِ ① پیشنهادِ ۲۵۲):
  // همان تک‌منبع + همان دیالوگِ مشترکِ دیکشنری/تبِ واژگان
  const [usage, setUsage] = useState<{ en: string; sites: ReturnType<typeof findWordUsages> } | null>(null);

  const t = themeOf(deck?.color ?? lesson.color);

  // one internal card model for all three deck sources:
  // lesson tab (whole lesson) → F7 subset (danger words of one lesson) →
  // «واژه‌های من» deck (multi-lesson, absolute keys precomputed)
  const base: FlashcardDeckCard[] = deck
    ? deck.cards
    : (words && words.length > 0 ? words : lesson.vocabulary).map((w) => ({
        key: wordKey(lesson.id, w.en),
        lessonId: lesson.id,
        word: w,
      }));
  const keyOf = (c: FlashcardDeckCard) => c.key;

  // راند ۲۷۴ — بازمحاسبه رویِ خودِ وضعیتِ srs نه رویِ index. وابستگیِ index دو
  // خطایِ زنده می‌ساخت: [الف] پرشِ مو — جلوبردنِ index همزمان با کوچک‌شدنِ
  // آرایه، جانشینِ کارتِ پاسخ‌داده‌شده را یک‌جا رد می‌کرد (اندازه‌گیریِ
  // زنده: ترتیبِ ۰←۲←۴←۶←۸ رویِ دِکِ ۲۰۴تایی)؛ [ب] انجمادِ پایانِ پاس — با
  // خالی‌شدنِ سررسیدها و indexِ تغییرنکرده، memo دیگر بازمحاسبه نمی‌کرد و کارتِ
  // تازه-پاسخ‌داده‌شده برایِ همیشه رویِ صفحه می‌ماند. بازگشت به base هم حذف شد:
  // سررسیدِ خالی در مرورِ هوشمند یعنی «پاس تمام شد»، نه دِکِ کاملِ تازه.
  const dueCards = useMemo(() => {
    if (!mounted) return base;
    const now = Date.now();
    return base.filter((c) => {
      const item = srs[keyOf(c)];
      if (!item) return true; // never reviewed → due
      return item.dueAt <= now;
    });
  }, [smartMode, mounted, srs]); // recompute when the SRS state itself moves

  const cards = smartMode ? dueCards : base;
  const card = cards[Math.min(index, cards.length - 1)];
  const word = card?.word;
  const key = card ? keyOf(card) : "";
  const srsItem = mounted ? srs[key] : undefined;
  const isKnown = mounted && !!known[key];
  const isStarred = mounted && starredWords.includes(key);
  const knownCount = base.filter((c) => mounted && known[keyOf(c)]).length;
  // deck-scoped due count (fixes the F7 subset badge that used the whole lesson)
  const dueCount = mounted
    ? base.filter((c) => {
        const item = srs[keyOf(c)];
        return !item || item.dueAt <= Date.now();
      }).length
    : 0;

  // round 204: booklet syn/ant pairs on the answer face — one index for all
  // deck sources (lesson tab, F7 subset, multi-lesson «واژه‌های من» deck);
  // same all-lesson lookup the dictionary cards use (homonyms see both rows)
  const pairIndex = useMemo(() => buildSynAntIndex(lessons), []);
  const pairs = word ? synAntPairsFor(pairIndex, word.en) : [];

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [smartMode]);

  const go = (dir: 1 | -1) => {
    if (cards.length === 0) return; // پاسِ تمام‌شده — ناوبری معنا ندارد
    setFlipped(false);
    setIndex((i) => (i + dir + cards.length) % cards.length);
  };

  const answer = (knownIt: boolean) => {
    if (!key) return; // بی‌کارت (پاسِ تمام‌شده) — آلودگیِ srs با کلیدِ تهی ممنوع
    reviewWord(key, knownIt);
    if (knownIt && !isKnown) toggleKnown(key);
    trackReview(); // daily streak + goal progress
    // F10: one full pass of the deck = a finished flashcard round
    if (index >= cards.length - 1) trackEvent("flashcard_done");
    if (smartMode) {
      // راند ۲۷۴ — کارتِ پاسخ‌داده‌شده خودش از دستِ سررسید خارج می‌شود و جانشین
      // در همان index می‌نشیند؛ جلوبردنِ index اینجا یعنی پرشِ مو. اگر آخرین
      // موقعیت بود، به سرِ باقی‌مانده برمی‌گردیم (چرخشِ صادقِ دِکِ در حالِ آب‌شدن).
      setFlipped(false);
      if (index >= cards.length - 1) setIndex(0);
    } else {
      go(1);
    }
  };

  // راند ۲۷۴ — startSmart: اندازهٔ پاس پس از زنده‌شدنِ srs ثبت شود (فقطِ یک‌بار؛
  // با اولین شمارِ سررسیدِ غیرصفر). روشن‌کردنِ دستی هم در خودِ دکمه ثبت می‌کند.
  useEffect(() => {
    if (smartMode && mounted && passTotal === 0 && dueCount > 0) setPassTotal(dueCount);
  }, [smartMode, mounted, passTotal, dueCount]);

  // keyboard shortcuts: Space flip, ← next (RTL), → previous, K known, R repeat
  // (re-registered each render so closures stay fresh)
  useKeydown((e) => {
    if (isTypingTarget(e)) return;
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(-1);
    } else if (e.code === "KeyK") {
      answer(true);
    } else if (e.code === "KeyR") {
      answer(false);
    }
  });

  // empty-deck guard (defensive: a dangling snapshot or an empty lesson subset
  // must render a friendly state, never crash on card.word) — after all hooks
  if (!card || !word) {
    // راند ۲۷۴ — سررسیدِ خالیِ مرورِ هوشمند یعنی «پاس تمام شد» نه «دِک خالی است»:
    // پیامِ صادق + مسیرِ ادامهٔ دستی؛ دِکِ واقعاً خالی پیامِ خودش را دارد.
    const passDone = smartMode && mounted && base.length > 0;
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-800">
        <Layers className="mx-auto mb-2 text-stone-300 dark:text-stone-600" size={28} />
        <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
          {passDone ? "پاسِ مرورِ هوشمند تمام شد — همهٔ کارت‌هایِ سررسید مرور شدند" : "کارتی برای مرور نیست"}
        </p>
        {passDone && (
          <button
            onClick={() => setSmartMode(false)}
            className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-[12.5px] font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
          >
            ادامهٔ مرورِ دستی — همهٔ کارت‌ها
          </button>
        )}
        <button
          onClick={onExit}
          className={`mt-3 rounded-lg border border-stone-200 px-4 py-2 text-[12.5px] font-bold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-700 ${passDone ? "ms-2" : ""}`}
        >
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-lg bg-stone-100 px-2.5 py-1 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
            {smartMode
              ? `${faNum(cards.length)} کارتِ باقی‌مانده`
              : `کارت ${faNum(Math.min(index + 1, cards.length))} از ${faNum(cards.length)}`}
          </span>
          <span className={`rounded-lg ${t.chipBg} px-2.5 py-1 text-[12px] font-bold`}>
            {faNum(knownCount)} بلدم
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* smart review toggle */}
          <button
            onClick={() => {
              // راند ۲۷۴ — اندازهٔ پاس در لحظهٔ روشن‌شدن ثبت می‌شود تا نوارِ
              // پیشرفت، کسرِ واقعیِ «پاسخ‌داده از سررسیدِ آغازِ پاس» را بگوید.
              if (!smartMode) setPassTotal(dueCount);
              setSmartMode((v) => !v);
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors ${
              smartMode
                ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300"
                : "border-stone-200 bg-white text-stone-500 hover:text-violet-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:text-violet-300"
            }`}
          >
            <Sparkles size={13} />
            مرور هوشمند
            {smartMode && dueCount > 0 && (
              <span className="rounded-full bg-violet-600 px-1.5 text-[10px] text-white">{faNum(dueCount)}</span>
            )}
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-lg border c-card px-3 py-1.5 text-[13px] font-bold text-stone-600 hover:bg-stone-50"
          >
            <X size={14} />
            خروج
          </button>
        </div>
      </div>

      {/* progress bar — راند ۲۷۴: در مرورِ هوشمند، پیشرفتِ پاس (پاسخ‌داده از سررسیدِ آغاز)؛
          در حالتِ دستی، جایگاه در دِکِ ثابت */}
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
        <div
          className={`h-full ${t.bg} transition-[background-color,color,border-color,box-shadow,transform] duration-300`}
          style={{
            width: `${
              smartMode
                ? passTotal > 0
                  ? Math.min(100, Math.max(0, ((passTotal - cards.length) / passTotal) * 100))
                  : 0
                : (Math.min(index + 1, cards.length) / cards.length) * 100
            }%`,
          }}
        />
      </div>

      {/* card */}
      <div className="flip-scene mx-auto max-w-xl">
        <div
          className={`flip-card ${flipped ? "flipped" : ""} h-64 cursor-pointer select-none sm:h-72`}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            // Space is owned by the page-level useKeydown flip below (one
            // toggle per press); the focused control answers Enter — the
            // B-8a escape hatch MINUS the Space branch, which would
            // double-toggle (element handler + window handler both fire).
            if (e.key === "Enter") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label="برگرداندن کارت"
        >
          {/* front: English */}
          <div className={`flip-face flex flex-col items-center justify-center gap-3 rounded-2xl border-2 ${t.border} bg-white p-6 shadow-lg`}>
            {srsItem && (
              <div className="absolute left-4 top-4 flex gap-1" title={`سطح مرور: ${faNum(srsItem.level + 1)} — بعدی: ${SRS_LABELS[srsItem.level]}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${i <= srsItem.level ? "bg-violet-500" : "bg-stone-200"}`}
                  />
                ))}
              </div>
            )}
            {/* واژه‌های من — star toggle (top corner, mirrors the SRS dots) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStarred(key);
              }}
              title={isStarred ? "حذف از واژه‌های من" : "افزودن به واژه‌های من"}
              aria-label={isStarred ? "حذف از واژه‌های من" : "افزودن به واژه‌های من"}
              aria-pressed={isStarred}
              className={`absolute right-4 top-4 rounded-lg p-1 transition-[background-color,color,border-color,transform] hover:scale-110 active:scale-[0.96] ${
                isStarred ? "text-amber-400" : "text-stone-300 hover:text-amber-400"
              }`}
            >
              <Star size={17} className={isStarred ? "fill-amber-400" : ""} />
            </button>
            <span className={`rounded-full ${t.chipBg} px-3 py-1 text-[11px] font-bold`}>
              {word.pos ? posLabel[word.pos] ?? word.pos : "واژه"}
            </span>
            <div className={`en-text text-center text-4xl font-bold sm:text-5xl ${t.text}`} dir="ltr">
              {word.en}
            </div>
            <SpeakButton text={word.en} label="روخوانی" />
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-stone-500">
              <Hand size={12} /> برای دیدن معنی کلیک کنید
            </span>
          </div>
          {/* back: Persian */}
          <div className={`flip-face back flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-gradient-to-br p-6 text-white shadow-lg ${t.gradient}`}>
            <div className="text-center text-2xl font-black leading-relaxed sm:text-3xl">
              {word.fa}
            </div>
            <div className="en-text text-sm opacity-80" dir="ltr">
              {word.en}
            </div>
            {pairs.length > 0 && (
              <div className="mt-1 flex max-w-full flex-wrap items-center justify-center gap-1">
                {pairs.slice(0, 3).map((p) => (
                  <button
                    key={`${p.kind}-${p.other}-${p.lessonId}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void speak(p.other, 0.95);
                    }}
                    title="روخوانی جفت"
                    aria-label={`${p.kind === "syn" ? "مترادف" : "متضاد"}ِ ${word.en}: ${p.other} — روخوانی`}
                    className="flip-pair-chip inline-flex items-center gap-0.5 rounded-md border border-white/35 bg-white/15 px-1.5 py-0.5 text-[10.5px] font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-white/25 active:scale-[0.96]"
                  >
                    <span aria-hidden className="font-black">{p.kind === "syn" ? "≈" : "↔"}</span>
                    <span dir="ltr">{p.other}</span>
                  </button>
                ))}
                {pairs.length > 3 && (
                  <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10.5px] font-bold text-white/85">
                    +{faNum(pairs.length - 3)}
                  </span>
                )}
              </div>
            )}
            {(() => {
              // راند ۲۵۳ — چیپِ «در جزوه» کنارِ جفت‌ها رویِ پشتِ کارت، در
              // همان ایدئومِ سفیدِ رویِ گرادیان؛ فقط با تطبیقِ واقعی —
              // بی‌کاربرد، هیچ. stopPropagation: کلیکِ کارت flip است و
              // چیپ نباید کارت را برگرداند — دیالوگِ مشترک را باز می‌کند.
              const sites = mounted ? findWordUsages(word.en) : [];
              if (sites.length === 0) return null;
              return (
                <button
                  type="button"
                  data-testid="flash-usage-chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUsage({ en: word.en, sites });
                  }}
                  title="کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه"
                  aria-label={`کاربرد ${word.en} در مکالمه‌ها و ریدینگ‌ها — ${faNum(sites.length)} مورد`}
                  className="flip-pair-chip inline-flex items-center gap-1 rounded-md border border-white/35 bg-white/15 px-1.5 py-0.5 text-[10.5px] font-bold text-white transition-[background-color,color,border-color,transform] hover:bg-white/25 active:scale-[0.96]"
                >
                  <BookOpenText size={11} aria-hidden />
                  در جزوه · {faNum(sites.length)}
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={() => go(-1)}
          className="inline-flex items-center gap-1 rounded-xl border c-card px-4 py-2.5 text-sm font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:bg-stone-50 active:scale-[0.96]"
        >
          <ChevronRight size={16} />
          قبلی
        </button>
        <button
          onClick={() => answer(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl ${t.bg} px-5 py-2.5 text-sm font-bold text-white shadow-md transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-90 active:scale-[0.96]`}
        >
          <Check size={16} />
          بلدم
        </button>
        <button
          onClick={() => answer(false)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 transition-[background-color,color,border-color,transform] hover:bg-rose-100 active:scale-[0.96] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
        >
          <RefreshCw size={15} />
          تکرار
        </button>
        <button
          onClick={() => go(1)}
          className="inline-flex items-center gap-1 rounded-xl border c-card px-4 py-2.5 text-sm font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:bg-stone-50 active:scale-[0.96]"
        >
          بعدی
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* keyboard hints (desktop) */}
      <div className="hidden items-center justify-center gap-3 text-[10.5px] text-stone-500 min-[720px]:flex">
        <span className="flex items-center gap-1">
          <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">Space</kbd>
          برگرداندن
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">←</kbd>
          بعدی
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">K</kbd>
          بلدم
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">R</kbd>
          تکرار
        </span>
      </div>

      <AnimatePresence>
        {srsItem && (
          <motion.p
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-[12px] text-stone-500"
          >
            {isKnown && <span className="text-emerald-600">✓ بلدم · </span>}
            مرور بعدی: <b className="text-violet-600">{SRS_LABELS[srsItem.level]} دیگر</b> (سطح {faNum(srsItem.level + 1)} از ۶)
          </motion.p>
        )}
      </AnimatePresence>

      {/* راند ۲۵۳ — دیالوگِ مشترکِ «کاربرد در جزوه» (تک‌منبع با دیکشنری و تبِ واژگان) */}
      <WordUsageDialog target={usage} onClose={() => setUsage(null)} />
    </div>
  );
}
