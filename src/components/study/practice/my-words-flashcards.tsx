"use client";

// «فلش‌کارت واژه‌های من» — flashcard launcher inside the personal word-book.
// Runs the shared Flashcards engine over a resolved multi-lesson deck built
// from the CURRENTLY FILTERED star list, with a scope toggle: the whole book
// or just the words not yet marked «بلدم». Mirrors my-words-review.tsx.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Play, RotateCcw } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { buildMyWordsDeck, dominantLessonId, type DeckScope } from "@/lib/my-words-deck";
import { faNum } from "@/lib/study-theme";
import { lessons } from "@/data";
import { trackEvent } from "@/lib/analytics";
import type { ResolvedStar } from "@/lib/my-words-resolve";
import Flashcards, { type FlashcardDeckCard } from "../lesson/flashcards";

export default function MyWordsFlashcards({ stars }: { stars: ResolvedStar[] }) {
  const setView = useStudy((s) => s.setView);
  const known = useStudy((s) => s.known);
  const [scope, setScope] = useState<DeckScope>("all");
  // session snapshot: frozen at start, so answering the last card wraps the
  // deck (flashcards semantics) instead of live-erasing it mid-flow
  const [session, setSession] = useState<{ color: string; cards: FlashcardDeckCard[] } | null>(null);

  const deck = useMemo(
    () => buildMyWordsDeck(stars.map((s) => s.key), (k) => !!known[k], scope),
    [stars, known, scope]
  );
  const deckColor =
    lessons.find((l) => l.id === dominantLessonId(deck))?.color ?? "amber";

  if (session) {
    return (
      <Flashcards
        lesson={lessons[0]} // unused in deck mode (keys are absolute)
        deck={session}
        onExit={() => setSession(null)}
      />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="فلش‌کارت واژه‌های من"
      className="mywords-cards overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50/90 to-white shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-900/20">
          <Layers size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-stone-800">فلش‌کارت واژه‌های من</h2>
          <p className="text-[11.5px] leading-5 text-stone-500">
            {deck.length > 0
              ? scope === "all"
                ? `مرور سریع بدون نمره — هر درسی که بلد نیستی می‌ماند تا وقتی بلد شوی`
                : `${faNum(deck.length)} واژهٔ بلدم‌نشده — بچرخان تا تمامشان بلد شوند`
              : scope === "unmastered"
                ? "همهٔ واژه‌های نشان‌شده را بلدی — عجب! به حالت «همه» برگرد یا واژهٔ تازه نشان کن"
                : "برای فلش‌کارت حداقل یک واژه نشان کن"}
          </p>
        </div>
        {stars.length > 0 && (
          <div className="flex items-center gap-1.5" role="group" aria-label="دامنهٔ فلش‌کارت">
            {(
              [
                { v: "all", label: "همه" },
                { v: "unmastered", label: "بلدم‌نشده" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                onClick={() => setScope(o.v)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11.5px] font-black transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                  scope === o.v
                    ? "border-violet-400 bg-violet-100 text-violet-700"
                    : "border-stone-200 bg-white text-stone-500 hover:border-violet-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        {deck.length > 0 ? (
          <button
            onClick={() => {
              trackEvent("my_words_flashcards_start");
              setSession({ color: deckColor, cards: deck });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2.5 text-[13px] font-black text-white shadow-md shadow-violet-500/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
          >
            <Play size={14} />
            شروع فلش‌کارت ({faNum(deck.length)} کارت)
          </button>
        ) : (
          <button
            onClick={() => setView({ type: "dictionary" })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-[13px] font-bold text-violet-700 transition-[background-color,color,border-color,transform] hover:bg-violet-50 active:scale-[0.96]"
          >
            <RotateCcw size={14} />
            رفتن به دیکشنری
          </button>
        )}
      </div>
    </motion.section>
  );
}
