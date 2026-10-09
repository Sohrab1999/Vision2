"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, RefreshCw, Hand } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { useStudy, wordKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf } from "@/lib/study-theme";
import SpeakButton from "./speak-button";

export default function Flashcards({
  lesson,
  onExit,
}: {
  lesson: LessonData;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const known = useStudy((s) => s.known);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const mounted = useMounted();

  const t = themeOf(lesson.color);
  const cards = lesson.vocabulary;
  const word = cards[index];
  const isKnown = mounted && !!known[wordKey(lesson.id, word.en)];
  const knownCount = cards.filter((w) => mounted && known[wordKey(lesson.id, w.en)]).length;

  const go = (dir: 1 | -1) => {
    setFlipped(false);
    setIndex((i) => (i + dir + cards.length) % cards.length);
  };

  const markKnown = (v: boolean) => {
    const key = wordKey(lesson.id, word.en);
    if (!!known[key] !== v) toggleKnown(key);
    go(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-lg bg-stone-100 px-2.5 py-1 font-bold text-stone-700">
            کارت {index + 1} از {cards.length}
          </span>
          <span className={`rounded-lg ${t.chipBg} px-2.5 py-1 text-[12px] font-bold`}>
            {knownCount} بلدم
          </span>
        </div>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[13px] font-bold text-stone-600 hover:bg-stone-50"
        >
          <X size={14} />
          خروج
        </button>
      </div>

      {/* progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full ${t.bg} transition-all duration-300`}
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
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
          className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
        >
          <ChevronRight size={16} />
          قبلی
        </button>
        <button
          onClick={() => markKnown(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl ${t.bg} px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95`}
        >
          <Check size={16} />
          بلدم
        </button>
        <button
          onClick={() => markKnown(false)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
        >
          <RefreshCw size={15} />
          تکرار
        </button>
        <button
          onClick={() => go(1)}
          className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
        >
          بعدی
          <ChevronLeft size={16} />
        </button>
      </div>

      <AnimatePresence>
        {isKnown && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-[12px] text-emerald-600"
          >
            ✓ این واژه در فهرست «بلدم» شماست
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
