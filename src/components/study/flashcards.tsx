"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, RefreshCw, Hand, Sparkles, Star, Layers } from "lucide-react";
import type { LessonData, VocabWord } from "@/lib/study-types";
import { useStudy, wordKey, SRS_LABELS } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { isTypingTarget, useKeydown } from "@/hooks/use-keyboard";
import { trackEvent } from "@/lib/analytics";
import { posLabel, themeOf } from "@/lib/study-theme";
import SpeakButton from "./speak-button";

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

  const dueCards = useMemo(() => {
    if (!mounted) return base;
    const now = Date.now();
    const due = base.filter((c) => {
      const item = srs[keyOf(c)];
      if (!item) return true; // never reviewed → due
      return item.dueAt <= now;
    });
    return due.length > 0 ? due : base;
  }, [smartMode, mounted, index]); // recompute as user advances

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

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [smartMode]);

  const go = (dir: 1 | -1) => {
    setFlipped(false);
    setIndex((i) => (i + dir + cards.length) % cards.length);
  };

  const answer = (knownIt: boolean) => {
    reviewWord(key, knownIt);
    if (knownIt && !isKnown) toggleKnown(key);
    trackReview(); // daily streak + goal progress
    // F10: one full pass of the deck = a finished flashcard round
    if (index >= cards.length - 1) trackEvent("flashcard_done");
    go(1);
  };

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
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
        <Layers className="mx-auto mb-2 text-stone-300" size={28} />
        <p className="text-sm font-bold text-stone-600">کارتی برای مرور نیست</p>
        <button
          onClick={onExit}
          className="mt-3 rounded-lg border border-stone-200 px-4 py-2 text-[12.5px] font-bold text-stone-600 hover:bg-stone-50"
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
          <span className="rounded-lg bg-stone-100 px-2.5 py-1 font-bold text-stone-700">
            کارت {Math.min(index + 1, cards.length)} از {cards.length}
          </span>
          <span className={`rounded-lg ${t.chipBg} px-2.5 py-1 text-[12px] font-bold`}>
            {knownCount} بلدم
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* smart review toggle */}
          <button
            onClick={() => setSmartMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-all ${
              smartMode
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-stone-200 bg-white text-stone-500 hover:text-violet-600"
            }`}
          >
            <Sparkles size={13} />
            مرور هوشمند
            {smartMode && dueCount > 0 && (
              <span className="rounded-full bg-violet-600 px-1.5 text-[10px] text-white">{dueCount}</span>
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

      {/* progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full ${t.bg} transition-all duration-300`}
          style={{ width: `${((Math.min(index + 1, cards.length)) / cards.length) * 100}%` }}
        />
      </div>

      {/* card */}
      <div className="flip-scene mx-auto max-w-xl">
        <div
          className={`flip-card ${flipped ? "flipped" : ""} h-64 cursor-pointer select-none sm:h-72`}
          onClick={() => setFlipped((f) => !f)}
          role="button"
          aria-label="برگرداندن کارت"
        >
          {/* front: English */}
          <div className={`flip-face flex flex-col items-center justify-center gap-3 rounded-2xl border-2 ${t.border} bg-white p-6 shadow-lg`}>
            {srsItem && (
              <div className="absolute left-4 top-4 flex gap-1" title={`سطح مرور: ${srsItem.level + 1} — بعدی: ${SRS_LABELS[srsItem.level]}`}>
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
              className={`absolute right-4 top-4 rounded-lg p-1 transition-all hover:scale-110 active:scale-90 ${
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
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-stone-400">
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
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={() => go(-1)}
          className="inline-flex items-center gap-1 rounded-xl border c-card px-4 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
        >
          <ChevronRight size={16} />
          قبلی
        </button>
        <button
          onClick={() => answer(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl ${t.bg} px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95`}
        >
          <Check size={16} />
          بلدم
        </button>
        <button
          onClick={() => answer(false)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-95"
        >
          <RefreshCw size={15} />
          تکرار
        </button>
        <button
          onClick={() => go(1)}
          className="inline-flex items-center gap-1 rounded-xl border c-card px-4 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
        >
          بعدی
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* keyboard hints (desktop) */}
      <div className="hidden items-center justify-center gap-3 text-[10.5px] text-stone-400 min-[720px]:flex">
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
            className="text-center text-[12px] text-stone-400"
          >
            {isKnown && <span className="text-emerald-600">✓ بلدم · </span>}
            مرور بعدی: <b className="text-violet-600">{SRS_LABELS[srsItem.level]} دیگر</b> (سطح {srsItem.level + 1} از ۶)
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
