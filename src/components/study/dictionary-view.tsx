"use client";

import { useMemo, useState } from "react";
import { Search, X, BookMarked } from "lucide-react";
import { lessons } from "@/data";
import { useStudy, wordKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf } from "@/lib/study-theme";
import SpeakButton from "./speak-button";

export default function DictionaryView() {
  const [query, setQuery] = useState("");
  const [lessonFilter, setLessonFilter] = useState<number | null>(null);
  const known = useStudy((s) => s.known);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const mounted = useMounted();

  const allWords = useMemo(
    () =>
      lessons.flatMap((l) =>
        l.vocabulary.map((w) => ({ ...w, lessonId: l.id, lessonColor: l.color, lessonTitle: l.titleFa }))
      ),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allWords.filter((w) => {
      if (lessonFilter && w.lessonId !== lessonFilter) return false;
      if (!q) return true;
      return w.en.toLowerCase().includes(q) || w.fa.includes(query.trim());
    });
  }, [allWords, query, lessonFilter]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <BookMarked size={19} />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-stone-800">دیکشنری واژگان</h1>
            <p className="text-[12px] text-stone-500">
              جستجو در {allWords.length} واژهٔ هر سه درس — با تلفظ صوتی
            </p>
          </div>
        </div>
        <div className="relative mb-3">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً: language یا زبان..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="پاک کردن"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLessonFilter(null)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-all ${
              lessonFilter === null ? "bg-stone-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            همهٔ درس‌ها
          </button>
          {lessons.map((l) => {
            const t = themeOf(l.color);
            return (
              <button
                key={l.id}
                onClick={() => setLessonFilter(l.id)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-all ${
                  lessonFilter === l.id ? `${t.bg} text-white` : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                درس {l.id}: {l.titleFa}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[12px] text-stone-500">{filtered.length} واژه یافت شد</p>

      <div className="max-h-[58vh] grid gap-2.5 overflow-y-auto pl-1 nice-scroll sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, 300).map((w) => {
          const isKnown = mounted && !!known[wordKey(w.lessonId, w.en)];
          const t = themeOf(w.lessonColor);
          return (
            <div
              key={`${w.lessonId}-${w.en}`}
              className="flex items-start justify-between gap-2 rounded-xl border border-stone-200 bg-white p-3 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="en-text text-[15px] font-bold text-stone-800" dir="ltr">
                    {w.en}
                  </span>
                  {w.pos && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                      {posLabel[w.pos] ?? w.pos}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[13px] text-stone-600">{w.fa}</div>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.chipBg}`}>
                  درس {w.lessonId}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <SpeakButton text={w.en} />
                <button
                  onClick={() => toggleKnown(wordKey(w.lessonId, w.en))}
                  title={isKnown ? "بلدم" : "علامت‌زدن به عنوان بلد"}
                  className={`h-8 rounded-full border px-2 text-[10px] font-bold transition-all ${
                    isKnown
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-400 hover:text-stone-600"
                  }`}
                >
                  بلدم
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
