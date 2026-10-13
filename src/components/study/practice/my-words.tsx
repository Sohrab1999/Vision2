"use client";

// واژه‌های من — the learner's personal word-book.
// Every word starred anywhere in the app (dictionary rows, vocab tab,
// flashcards) lands here as a wordKey ("1:ability"). Stars travel in
// backups/cloud sync via the SyncField table (sanitize + union merge),
// so the list survives a new device. Dangling keys (word renamed in a
// future content update) are silently skipped at render — never crash.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Search, X, SearchX, BookMarked, Trash2, CheckCircle2, Circle, ArrowDownAZ, ArrowDownUp } from "lucide-react";
import { lessons } from "@/data";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf, faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import SpeakButton from "../shared/speak-button";
import { resolveStar, type ResolvedStar } from "@/lib/my-words-resolve";
import MyWordsReview from "./my-words-review";
import MyWordsFlashcards from "./my-words-flashcards";
import MyWordsDictation from "./my-words-dictation";
type SortMode = "new" | "old" | "az";

export default function MyWordsView() {
  const starredWords = useStudy((s) => s.starredWords);
  const known = useStudy((s) => s.known);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const clearStarred = useStudy((s) => s.clearStarred);
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();

  const [query, setQuery] = useState("");
  const [lessonFilter, setLessonFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortMode>("new");
  const [armedClear, setArmedClear] = useState(false);
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // funnel signal: the personal word-book was actually opened
  useEffect(() => {
    trackEvent("my_words_open");
  }, []);

  // disarm the "clear all" confirm automatically
  useEffect(() => {
    return () => {
      if (armTimer.current) clearTimeout(armTimer.current);
    };
  }, []);

  const stars = useMemo(() => {
    const resolved = mounted ? starredWords.map(resolveStar) : [];
    const ok = resolved.filter((r): r is ResolvedStar => r !== null);
    // newest-first by default (stars are appended oldest → newest)
    if (sort === "new") return [...ok].reverse();
    if (sort === "az") return [...ok].sort((a, b) => a.en.localeCompare(b.en));
    return ok; // old
  }, [starredWords, sort, mounted]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stars.filter((w) => {
      if (lessonFilter && w.lessonId !== lessonFilter) return false;
      if (!q) return true;
      return w.en.toLowerCase().includes(q) || w.fa.includes(query.trim());
    });
  }, [stars, query, lessonFilter]);

  const knownCount = mounted ? stars.filter((w) => known[w.key]).length : 0;
  const lessonCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const w of stars) counts.set(w.lessonId, (counts.get(w.lessonId) ?? 0) + 1);
    return counts;
  }, [stars]);

  const armClear = () => {
    if (!armedClear) {
      setArmedClear(true);
      if (armTimer.current) clearTimeout(armTimer.current);
      armTimer.current = setTimeout(() => setArmedClear(false), 3500);
      return;
    }
    if (armTimer.current) clearTimeout(armTimer.current);
    setArmedClear(false);
    clearStarred();
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="rounded-2xl border c-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Star size={19} className="fill-amber-400" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-stone-800">واژه‌های من</h1>
            <p className="text-[12px] text-stone-500">
              واژه‌نامهٔ شخصی تو — هر جا ستارهٔ یک واژه را بزنی اینجا جمع می‌شود
            </p>
          </div>
          {mounted && stars.length > 0 && (
            <button
              onClick={armClear}
              className={`ms-auto inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-all active:scale-95 ${
                armedClear
                  ? "animate-pulse border-rose-300 bg-rose-500 text-white"
                  : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
              }`}
              aria-label={armedClear ? "تأیید پاک‌کردن همهٔ واژه‌های نشان‌شده" : "پاک‌کردن همهٔ واژه‌های نشان‌شده"}
            >
              <Trash2 size={14} />
              {armedClear ? "مطمئنی؟ دوباره بزن" : "پاک‌کردن همه"}
            </button>
          )}
        </div>

        {mounted && stars.length > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-center">
              <div className="text-lg font-black text-amber-600">{faNum(stars.length)}</div>
              <div className="text-[10.5px] font-bold text-amber-600/80">واژهٔ نشان‌شده</div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-center">
              <div className="text-lg font-black text-emerald-600">{faNum(knownCount)}</div>
              <div className="text-[10.5px] font-bold text-emerald-600/80">بلدم</div>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-center">
              <div className="text-lg font-black text-sky-600">{faNum(lessonCounts.size)}</div>
              <div className="text-[10.5px] font-bold text-sky-600/80">درس درگیر</div>
            </div>
          </div>
        )}

        {/* review launcher — quiz from the currently filtered stars */}
        <div className="mb-3">
          <MyWordsReview stars={filtered} />
        </div>

        {/* flashcard launcher — quick no-score pass over the same filtered stars */}
        <div className="mb-3">
          <MyWordsFlashcards stars={filtered} />
        </div>

        {/* dictation launcher — spell the filtered stars by ear */}
        <div className="mb-4">
          <MyWordsDictation stars={filtered} />
        </div>

        {/* search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو میان واژه‌های نشان‌شده..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="پاک کردن جستجو"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* lesson chips */}
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
            const count = lessonCounts.get(l.id) ?? 0;
            return (
              <button
                key={l.id}
                onClick={() => setLessonFilter(l.id)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-all ${
                  lessonFilter === l.id ? `${t.bg} text-white` : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                درس {l.id}: {l.titleFa}
                <span className={`ms-1.5 rounded-full px-1.5 text-[10px] ${lessonFilter === l.id ? "bg-white/25" : "bg-stone-200/80 text-stone-500"}`}>
                  {faNum(count)}
                </span>
              </button>
            );
          })}
          {/* sort segmented control */}
          <span className="mx-1 hidden h-6 w-px self-center bg-stone-200 sm:block" />
          <div className="flex overflow-hidden rounded-full border border-stone-200" role="group" aria-label="ترتیب نمایش">
            {([
              { id: "new" as SortMode, label: "تازه‌ترین", icon: ArrowDownUp },
              { id: "old" as SortMode, label: "قدیمی‌ترین", icon: null },
              { id: "az" as SortMode, label: "الفبا", icon: ArrowDownAZ },
            ]).map((m) => (
              <button
                key={m.id}
                onClick={() => setSort(m.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-bold transition-colors ${
                  sort === m.id ? "bg-amber-500 text-white" : "bg-white text-stone-500 hover:bg-stone-50"
                }`}
                aria-pressed={sort === m.id}
              >
                {m.icon && <m.icon size={12} />}
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mounted && stars.length === 0 && (
        /* nothing starred yet — guide the learner to the star affordances */
        <div className="dict-empty flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 px-4 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Star size={26} className="text-amber-300" />
          </span>
          <p className="text-[14px] font-extrabold text-stone-600">هنوز واژه‌ای نشان نکرده‌ای</p>
          <p className="max-w-sm text-[12px] leading-6 text-stone-400">
            در دیکشنری، فهرست واژگان درس‌ها یا فلش‌کارت‌ها روی
            <Star size={11} className="mx-1 inline fill-amber-400 text-amber-400" />
            بزن تا واژه‌های مهم‌ات اینجا برای مرور سریع جمع شوند.
          </p>
          <button
            onClick={() => setView({ type: "dictionary" })}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-stone-700 px-4 py-2 text-[12px] font-bold text-white transition-all hover:bg-stone-600 active:scale-95"
          >
            <BookMarked size={14} />
            رفتن به دیکشنری
          </button>
        </div>
      )}

      {mounted && stars.length > 0 && filtered.length === 0 && (
        <div className="dict-empty flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 c-stone-60 px-4 py-10 text-center">
          <SearchX size={26} className="text-stone-300" />
          <p className="text-[13px] font-extrabold text-stone-500">با این فیلترها واژه‌ای یافت نشد</p>
          <p className="text-[11.5px] font-bold text-stone-400">جستجو یا فیلتر درس را تغییر بده</p>
          <button
            onClick={() => {
              setQuery("");
              setLessonFilter(null);
            }}
            className="mt-1 rounded-full bg-stone-700 px-3.5 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-stone-600"
          >
            نمایش همهٔ نشان‌شده‌ها
          </button>
        </div>
      )}

      {mounted && stars.length > 0 && (
        <p className="text-[12px] text-stone-500">{faNum(filtered.length)} واژه نشان‌شده</p>
      )}

      {/* cards */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {mounted &&
            filtered.slice(0, 300).map((w, i) => {
              const t = themeOf(w.color);
              const isKnown = !!known[w.key];
              return (
                <motion.div
                  layout
                  key={w.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ delay: Math.min(i * 0.015, 0.25), duration: 0.22 }}
                  className="group relative flex items-start justify-between gap-2 rounded-xl border border-amber-100 bg-white p-3 transition-shadow hover:shadow-md hover:ring-2 hover:ring-amber-100"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="en-text text-[15px] font-bold text-stone-800" dir="ltr">
                        {w.en}
                      </span>
                      {w.pos && (
                        <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                          {posLabel[w.pos as keyof typeof posLabel] ?? w.pos}
                        </span>
                      )}
                      <button
                        onClick={() => toggleStarred(w.key)}
                        title="حذف از واژه‌های من"
                        aria-label={`حذف ${w.en} از واژه‌های من`}
                        className="ms-0.5 rounded-md p-0.5 transition-transform hover:scale-110 active:scale-90"
                      >
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                      </button>
                    </div>
                    <div className="mt-0.5 text-[13px] text-stone-600">{w.fa}</div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.chipBg}`}>
                      درس {w.lessonId}: {w.titleFa}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    <SpeakButton text={w.en} />
                    <button
                      onClick={() => toggleKnown(w.key)}
                      title={isKnown ? "بلدم" : "علامت‌زدن به عنوان بلد"}
                      className={`h-8 rounded-full border px-2 text-[10px] font-bold transition-all ${
                        isKnown
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-stone-200 bg-white text-stone-400 hover:text-stone-600"
                      }`}
                    >
                      {isKnown ? <CheckCircle2 size={14} className="inline" /> : <Circle size={14} className="inline" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}
