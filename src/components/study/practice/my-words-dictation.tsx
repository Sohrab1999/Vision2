"use client";

// «دیکتهٔ ستاره‌ها» — dictation launcher inside the personal word-book.
// Builds a virtual DictationSource from the CURRENTLY FILTERED star list
// (lesson chips / search scope the session, same as the quiz launcher) and
// hands it to the shared DictationTab. Round results write SRS/known/
// mistake bookkeeping on the canonical star keys via storeKey.

import { useState } from "react";
import { motion } from "framer-motion";
import { Ear, Play, RotateCcw } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { buildStarredDictation, DICTATION_MIN_STARS } from "@/lib/starred-dictation";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import type { DictationSource } from "@/lib/study-types";
import type { ResolvedStar } from "@/lib/my-words-resolve";
import DictationTab from "../lesson/dictation-tab";

export default function MyWordsDictation({ stars }: { stars: ResolvedStar[] }) {
  const setView = useStudy((s) => s.setView);
  const [session, setSession] = useState<DictationSource | null>(null);

  const eligible = stars.length >= DICTATION_MIN_STARS;

  if (session) {
    return <DictationTab source={session} onExit={() => setSession(null)} />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="دیکتهٔ واژه‌های نشان‌شده"
      className="mywords-dictation overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-l from-arcade-tint/90 to-white shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-arcade-from-soft to-arcade-to-soft text-white shadow-md shadow-violet-900/20">
          <Ear size={20} />
        </span>
        {/* r318 — همان قراردادِ سهراه‌اندازِ «واژه‌های من»: کفِ min-content
            بهجایِ min-w-0 تا h2 در ۳۹۰px بریده نشود (دامِ flex-basis صفر). */}
        <div className="flex-1">
          <h2 className="text-sm font-extrabold text-stone-800">دیکتهٔ ستاره‌ها</h2>
          <p className="text-[11.5px] leading-5 text-stone-500">
            {eligible
              ? `املای شنیداری از همین لیست — می‌شنوی، معنی را می‌بینی، می‌نویسی؛ مربعِ فیلترها هم اثر می‌کند`
              : `برای شروع دیکته حداقل ${faNum(DICTATION_MIN_STARS)} واژه نشان کن — الان ${faNum(stars.length)} داری`}
          </p>
        </div>
        {eligible ? (
          <button
            onClick={() => {
              trackEvent("my_words_dictation_start");
              setSession(buildStarredDictation(stars));
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-arcade-from-soft to-arcade-to-soft px-4 py-2.5 text-[13px] font-black text-white shadow-md shadow-violet-500/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
          >
            <Play size={14} />
            شروع دیکته
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
