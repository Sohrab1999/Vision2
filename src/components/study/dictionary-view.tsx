"use client";

import { useMemo, useState } from "react";
import { Search, X, BookMarked, CheckCircle2, CircleDashed, AlarmClock, SearchX } from "lucide-react";
import { lessons } from "@/data";
import { useStudy, wordKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf, faNum } from "@/lib/study-theme";
import SpeakButton from "./speak-button";

// state filter values
type StateFilter = "all" | "known" | "unknown" | "due";

export default function DictionaryView() {
  const [query, setQuery] = useState("");
  const [lessonFilter, setLessonFilter] = useState<number | null>(null);
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const known = useStudy((s) => s.known);
  const srs = useStudy((s) => s.srs);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const mounted = useMounted();

  const allWords = useMemo(
    () =>
      lessons.flatMap((l) =>
        l.vocabulary.map((w) => ({ ...w, lessonId: l.id, lessonColor: l.color, lessonTitle: l.titleFa }))
      ),
    []
  );

  // count of words due for SRS review right now
  const dueCount = useMemo(() => {
    if (!mounted) return 0;
    const now = Date.now();
    return allWords.filter((w) => {
      const it = srs[wordKey(w.lessonId, w.en)];
      return it && it.dueAt <= now;
    }).length;
  }, [allWords, srs, mounted]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return allWords.filter((w) => {
      if (lessonFilter && w.lessonId !== lessonFilter) return false;
      const isKnown = !!known[wordKey(w.lessonId, w.en)];
      if (stateFilter === "known" && !isKnown) return false;
      if (stateFilter === "unknown" && isKnown) return false;
      if (stateFilter === "due") {
        const it = srs[wordKey(w.lessonId, w.en)];
        if (!it || it.dueAt > now) return false;
      }
      if (!q) return true;
      return w.en.toLowerCase().includes(q) || w.fa.includes(query.trim());
    });
  }, [allWords, query, lessonFilter, stateFilter, known, srs]);

  const stateChips: { id: StateFilter; label: string; icon?: React.ElementType; cls: string; count: number }[] = [
    {
      id: "all",
      label: "همه",
      cls: "bg-stone-700",
      count: allWords.length,
    },
    {
      id: "known",
      label: "بلدم",
      icon: CheckCircle2,
      cls: "bg-emerald-600",
      count: mounted ? allWords.filter((w) => known[wordKey(w.lessonId, w.en)]).length : 0,
    },
    {
      id: "unknown",
      label: "بلد نیستم",
      icon: CircleDashed,
      cls: "bg-stone-500",
      count: mounted ? allWords.filter((w) => !known[wordKey(w.lessonId, w.en)]).length : 0,
    },
    {
      id: "due",
      label: "سررسید مرور",
      icon: AlarmClock,
      cls: "bg-rose-500",
      count: dueCount,
    },
  ];

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
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-dashed border-stone-200 pt-3">
          <span className="text-[10.5px] font-black text-stone-400">وضعیت یادگیری:</span>
          {stateChips.map((c) => (
            <button
              key={c.id}
              onClick={() => setStateFilter(c.id)}
              className={`dict-state-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-all ${
                stateFilter === c.id
                  ? `${c.cls} text-white shadow-sm`
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {c.icon && <c.icon size={12} />}
              {c.label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-black ${
                  stateFilter === c.id ? "bg-white/25" : "bg-stone-200/80 text-stone-500"
                }`}
              >
                {faNum(c.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-[12px] text-stone-500">{filtered.length} واژه یافت شد</p>

      {mounted && filtered.length === 0 && (
        <div className="dict-empty flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/60 px-4 py-10 text-center">
          <SearchX size={26} className="text-stone-300" />
          <p className="text-[13px] font-extrabold text-stone-500">واژه‌ای با این فیلترها یافت نشد</p>
          <p className="text-[11.5px] font-bold text-stone-400">
            {stateFilter === "due"
              ? "الان واژهٔ سررسیدی نداری — همه‌چیز سر موعد است!"
              : "فیلتر وضعیت یا جستجو را تغییر بده"}
          </p>
          {stateFilter !== "all" && (
            <button
              onClick={() => setStateFilter("all")}
              className="mt-1 rounded-full bg-stone-700 px-3.5 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-stone-600"
            >
              نمایش همهٔ واژه‌ها
            </button>
          )}
        </div>
      )}

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
