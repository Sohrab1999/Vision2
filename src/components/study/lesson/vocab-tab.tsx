"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, Circle, Layers, X, Star } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { useStudy, wordKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf } from "@/lib/study-theme";
import Flashcards from "./flashcards";

type Filter = "all" | "known" | "unknown";

export default function VocabTab({
  lesson,
  startSmart = false,
}: {
  lesson: LessonData;
  startSmart?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [flashMode, setFlashMode] = useState(startSmart);
  const known = useStudy((s) => s.known);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const starredWords = useStudy((s) => s.starredWords);
  const consumeFlashIntent = useStudy((s) => s.consumeFlashIntent);
  const mounted = useMounted();

  // consume the "smart review" navigation intent once (flashcards open via
  // the flashNonce remount-key in LessonView, so no setState is needed here)
  useEffect(() => {
    if (startSmart) consumeFlashIntent();
  }, [startSmart, consumeFlashIntent]);

  const t = themeOf(lesson.color);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lesson.vocabulary.filter((w) => {
      if (q && !w.en.toLowerCase().includes(q) && !w.fa.includes(query.trim())) return false;
      if (filter === "all") return true;
      const isKnown = mounted && !!known[wordKey(lesson.id, w.en)];
      return filter === "known" ? isKnown : !isKnown;
    });
  }, [lesson, query, filter, known, mounted]);

  if (flashMode) {
    return <Flashcards lesson={lesson} onExit={() => setFlashMode(false)} startSmart={startSmart} />;
  }

  const knownCount = lesson.vocabulary.filter((w) => mounted && known[wordKey(lesson.id, w.en)]).length;

  const filterBtn = (f: Filter, label: string, count: number, active: boolean) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-[background-color,color,border-color,box-shadow] ${
        active ? `${t.bg} text-white shadow-sm` : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در واژگان (فارسی یا انگلیسی)..."
            className="w-full rounded-xl border c-card py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-600"
              aria-label="پاک کردن جستجو"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFlashMode(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-[background-color,color,border-color,transform] hover:bg-emerald-100 active:scale-[0.96]"
        >
          <Layers size={16} />
          حالت فلش‌کارت
        </button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filterBtn("all", "همه", lesson.vocabulary.length, filter === "all")}
        {filterBtn("known", "بلدم", knownCount, filter === "known")}
        {filterBtn("unknown", "یاد نگرفته", lesson.vocabulary.length - knownCount, filter === "unknown")}
        <span className="mr-auto hidden text-[11px] text-stone-500 sm:block">
          روی هر واژه کلیک کنید تا «بلدم» علامت بخورد
        </span>
      </div>

      {/* grid */}
      <div className="grid max-h-[62vh] gap-2.5 overflow-y-auto pl-1 nice-scroll sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((w, i) => {
          const isKnown = mounted && !!known[wordKey(lesson.id, w.en)];
          const wKey = wordKey(lesson.id, w.en);
          const isStarred = mounted && starredWords.includes(wKey);
          return (
            <motion.div
              key={w.en}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.012, 0.3) }}
              role="button"
              tabIndex={0}
              aria-pressed={isKnown}
              onClick={() => toggleKnown(wKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleKnown(wKey);
                }
              }}
              className={`group flex items-start justify-between gap-2 rounded-xl border p-3 text-right transition-[background-color,color,border-color,box-shadow,transform] active:scale-[0.96] ${
                isKnown
                  ? `${t.border} ${t.bgSoft}`
                  : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
              }`}
              title={isKnown ? "علامت‌زده به عنوان بلد" : "کلیک: بلدم"}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className={`en-text text-[15px] font-bold ${isKnown ? t.text : "text-stone-800"}`} dir="ltr">
                    {w.en}
                  </span>
                  {w.pos && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                      {posLabel[w.pos] ?? w.pos}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStarred(wKey);
                    }}
                    title={isStarred ? "حذف از واژه‌های من" : "افزودن به واژه‌های من"}
                    aria-label={isStarred ? `حذف ${w.en} از واژه‌های من` : `افزودن ${w.en} به واژه‌های من`}
                    aria-pressed={isStarred}
                    className={`rounded-md p-0.5 transition-[background-color,color,border-color,transform] hover:scale-110 active:scale-[0.96] ${
                      isStarred ? "text-amber-400" : "text-stone-300 hover:text-amber-400"
                    }`}
                  >
                    <Star size={14} className={isStarred ? "fill-amber-400" : ""} />
                  </button>
                </div>
                <div className="mt-1 text-[13px] leading-6 text-stone-600">{w.fa}</div>
              </div>
              {isKnown ? (
                <CheckCircle2 size={17} className={`shrink-0 ${t.text}`} />
              ) : (
                <Circle size={17} className="shrink-0 text-stone-300 group-hover:text-stone-500" />
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            واژه‌ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}
