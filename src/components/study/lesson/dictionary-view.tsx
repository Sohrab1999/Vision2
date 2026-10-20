"use client";

import { useMemo, useState } from "react";
import { Search, X, BookMarked, BookOpenText, CheckCircle2, CircleDashed, AlarmClock, SearchX, Download, Star, ArrowLeftRight, Shuffle } from "lucide-react";
import { lessons } from "@/data";
import { useStudy, wordKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf, faNum } from "@/lib/study-theme";
import { downloadAnkiTsv, buildAnkiTsv } from "@/lib/anki-export";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { buildSynAntIndex, synAntPairsFor, matchesViaPairs } from "@/lib/syn-ant-lookup";
import { findWordUsages } from "@/lib/word-usage";
import WordUsageDialog, { type WordUsageTarget } from "./word-usage-dialog";
import { buildPairsDrillQuiz, SYN_QUIZ_CAP } from "@/lib/syn-ant-quiz";
import type { QuizQuestion } from "@/lib/study-types";
import { speak } from "@/lib/speak";
import SpeakButton from "../shared/speak-button";
import QuizEngine from "../quiz/quiz-engine";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// state filter values — «paired» (r205): فقط واژه‌های جفت‌دارِ جزوه؛
// «usage» (r253): فقط واژه‌های کاربرددار در متنِ مکالمه/ریدینگِ جزوه
type StateFilter = "all" | "known" | "unknown" | "due" | "paired" | "usage";

export default function DictionaryView() {
  const [query, setQuery] = useState("");
  const [lessonFilter, setLessonFilter] = useState<number | null>(null);
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const known = useStudy((s) => s.known);
  const srs = useStudy((s) => s.srs);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const starredWords = useStudy((s) => s.starredWords);
  const setView = useStudy((s) => s.setView);
  // راند ۲۵۲ — «کاربرد در جزوه»: دیالوگِ جایِ واژه در مکالمه‌ها و ریدینگ‌هایِ جزوه
  // (r253 — خودِ دیالوگ به تک‌منبعِ مشترکِ word-usage-dialog رفت)
  const [usage, setUsage] = useState<WordUsageTarget | null>(null);
  const mounted = useMounted();
  const { toast } = useToast();

  const ankiCount = useMemo(() => buildAnkiTsv().count, []);

  // نمایهٔ جفت‌های مترادف/متضاد جزوه (تسک ۲۰۳) — یک‌بار روی همهٔ درس‌ها
  const pairIndex = useMemo(() => buildSynAntIndex(lessons), []);

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

  // «جفت‌دار» (پیشنهادِ ۲۰۳-③، راند ۲۰۵): واژه‌هایی که حداقل یک جفتِ مترادف/متضاد
  // در جزوه دارند — دسترس‌پذیریِ جفت تابعِ خودِ واژه است (هم‌نام‌ها هر دو ردیف را
  // می‌بینند)، پس مجموعهٔ نرمال‌شدهٔ en کافی است؛ یک‌بار می‌سازیم، همه‌جا می‌خوانیم.
  // شمارنده «کارت» می‌شمارد نه واژهٔ یکتا — هم‌نام‌ها دو کارت‌اند و badge باید
  // با «N واژه یافت شد» یکی بخواند (همان قرارداد بقیهٔ چیپ‌ها).
  const pairedSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of allWords) {
      const k = w.en.trim().toLowerCase();
      if (set.has(k)) continue;
      if (synAntPairsFor(pairIndex, w.en).length > 0) set.add(k);
    }
    return set;
  }, [allWords, pairIndex]);
  const pairedCount = useMemo(
    () => allWords.reduce((n, w) => n + (pairedSet.has(w.en.trim().toLowerCase()) ? 1 : 0), 0),
    [allWords, pairedSet]
  );

  // «کاربرددار» (راند ۲۵۳ — بندِ ② پیشنهادِ ۲۵۲): واژه‌هایی که حداقل یک
  // کاربردِ واقعی در متنِ مکالمه/ریدینگِ جزوه دارند — همان تک‌منبعِ r252
  // (findWordUsages) که دیالوگِ جای‌ها می‌خواند؛ لنزِ ششمِ دیکشنری با
  // شمارندهٔ صادقانه، الگویِ چیپِ جفت‌دار (r205). شمارنده «کارت» می‌شمارد
  // نه واژهٔ یکتا — هم‌نام‌ها دو کارت‌اند و badge باید با «N واژه یافت شد»
  // یکی بخواند (همان قراردادِ چیپ‌هایِ وضعیت).
  const usageSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of allWords) {
      const k = w.en.trim().toLowerCase();
      if (set.has(k)) continue;
      if (findWordUsages(w.en).length > 0) set.add(k);
    }
    return set;
  }, [allWords]);
  const usageCount = useMemo(
    () => allWords.reduce((n, w) => n + (usageSet.has(w.en.trim().toLowerCase()) ? 1 : 0), 0),
    [allWords, usageSet]
  );

  // «دریلِ جفت‌ها» (راند ۲۰۷) — از لنزِ جفت‌دار مستقیم به آزمونِ استانداردِ خانه:
  // با فیلترِ درس فقط همان درس، بی‌فیلتر همهٔ درس‌ها؛ نتیجه زیرِ «0:synant»
  // ثبت می‌شود (پنلِ مهارتِ مترادف/متضاد و فیدِ خانه خودکار می‌فهمند)
  const [drillOpen, setDrillOpen] = useState(false);
  const [drill, setDrill] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const startDrill = () => {
    const scope = lessonFilter ? lessons.filter((l) => l.id === lessonFilter) : lessons;
    if (scope.length === 0) return;
    setDrill({
      title: lessonFilter ? `دریل جفت‌ها — درس ${faNum(lessonFilter)}` : "دریل جفت‌ها — همهٔ درس‌ها",
      questions: buildPairsDrillQuiz(scope),
    });
    setDrillOpen(true);
  };
  const closeDrill = () => {
    setDrillOpen(false);
    setDrill(null);
  };

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
      if (stateFilter === "paired" && !pairedSet.has(w.en.trim().toLowerCase())) return false;
      if (stateFilter === "usage" && !usageSet.has(w.en.trim().toLowerCase())) return false;
      if (!q) return true;
      if (w.en.toLowerCase().includes(q) || w.fa.includes(query.trim())) return true;
      // جستجوی ازراهِجفت: «lend» کارتِ «borrow» را هم می‌آورد (تسک ۲۰۳)
      return matchesViaPairs(pairIndex, w.en, q);
    });
  }, [allWords, query, lessonFilter, stateFilter, known, srs, pairIndex, pairedSet, usageSet]);

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
    {
      id: "paired",
      label: "جفت‌دار",
      icon: ArrowLeftRight,
      cls: "bg-violet-600",
      count: pairedCount,
    },
    {
      id: "usage",
      label: "کاربرددار",
      icon: BookOpenText,
      cls: "bg-sky-600",
      count: usageCount,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border c-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <BookMarked size={19} />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-stone-800">دیکشنری واژگان</h1>
            <p className="text-[12px] text-stone-500">
              جستجو در {faNum(allWords.length)} واژهٔ همهٔ درس‌ها — با تلفظ صوتی؛ جفت‌های مترادف/متضاد جزوه هم جستجو می‌شوند
            </p>
          </div>
          <button
            onClick={() => setView({ type: "my-words" })}
            className="ms-auto inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-700 transition-[background-color,color,border-color,transform,fill,stroke] hover:bg-amber-100 active:scale-[0.96]"
            aria-label="رفتن به واژه‌های من"
          >
            <Star size={14} className="fill-amber-400 text-amber-400" />
            واژه‌های من{mounted && starredWords.length > 0 && ` (${faNum(starredWords.length)})`}
          </button>
          <button
            onClick={() => {
              const count = downloadAnkiTsv();
              trackEvent("anki_export");
              toast({
                title: "🃏 خروجی Anki آماده شد",
                description: `${faNum(count)} کارت در فایل vision2-anki.txt — در Anki از File ▸ Import واردش کن.`,
                duration: 6000,
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-700 transition-[background-color,color,border-color,transform] hover:bg-emerald-100 active:scale-[0.96]"
            aria-label={`صادرات ${ankiCount} واژه به صورت فایل Anki`}
          >
            <Download size={14} />
            خروجی Anki ({faNum(ankiCount)} کارت)
          </button>
        </div>
        <div className="relative mb-3">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً: language یا زبان..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-600"
              aria-label="پاک کردن"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLessonFilter(null)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
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
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                  lessonFilter === l.id ? `${t.bg} text-white` : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                درس {faNum(l.id)}: {l.titleFa}
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-dashed border-stone-200 pt-3">
          <span className="text-[10.5px] font-black text-stone-500">وضعیت یادگیری:</span>
          {stateChips.map((c) => (
            <button
              key={c.id}
              onClick={() => setStateFilter(c.id)}
              className={`dict-state-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-[background-color,color,border-color,box-shadow] ${
                stateFilter === c.id
                  ? `${c.cls} text-white shadow-sm`
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {c.icon && <c.icon size={12} />}
              {c.label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-black ${
                  stateFilter === c.id ? "bg-black/25" : "bg-stone-200/80 text-stone-600"
                }`}
              >
                {faNum(c.count)}
              </span>
            </button>
          ))}
        </div>

        {/* نوارِ دریلِ جفت‌ها — فقط وقتی لنزِ جفت‌دار فعال است (راند ۲۰۷) */}
        {stateFilter === "paired" && pairedCount > 0 && (
          <div
            className="pairs-drill-bar mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border border-violet-200 bg-gradient-to-l from-arcade-tint to-arcade-tint-to px-3.5 py-2.5"
            data-testid="pairs-drill-bar"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-arcade-from-soft to-arcade-to-soft text-white shadow-sm">
              <ArrowLeftRight size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-extrabold text-violet-800">دریل جفت‌ها</p>
              <p className="text-[11px] font-bold leading-4 text-stone-500">
                {lessonFilter
                  ? `جفت‌های مترادف/متضادِ درس ${faNum(lessonFilter)} — تا ${faNum(SYN_QUIZ_CAP)} سؤالِ چهارگزینه‌ای از جدولِ جزوه`
                  : `جفت‌های همهٔ ${faNum(lessons.length)} درس — تا ${faNum(SYN_QUIZ_CAP)} سؤالِ چهارگزینه‌ای با سهمِ متعادلِ هر درس`}
              </p>
            </div>
            <button
              onClick={startDrill}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-arcade-from to-arcade-to px-4 py-2 text-[12.5px] font-black text-white shadow-md shadow-violet-600/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
              aria-label="شروع دریل جفت‌ها"
            >
              <Shuffle size={14} />
              شروع دریل
            </button>
          </div>
        )}
      </div>

      <p className="text-[12px] text-stone-500">{faNum(filtered.length)} واژه یافت شد</p>

      {mounted && filtered.length === 0 && (
        <div className="dict-empty flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 c-stone-60 px-4 py-10 text-center">
          <SearchX size={26} className="text-stone-300" />
          <p className="text-[13px] font-extrabold text-stone-500">واژه‌ای با این فیلترها یافت نشد</p>
          <p className="text-[11.5px] font-bold text-stone-500">
            {stateFilter === "due"
              ? "الان واژهٔ سررسیدی نداری — همه‌چیز سر موعد است!"
              : "فیلتر وضعیت یا جستجو را تغییر بده"}
          </p>
          {stateFilter !== "all" && (
            <button
              onClick={() => setStateFilter("all")}
              className="mt-1 rounded-full bg-stone-700 px-3.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-stone-600"
            >
              نمایش همهٔ واژه‌ها
            </button>
          )}
        </div>
      )}

      <div className="max-h-[58vh] grid gap-2.5 overflow-y-auto pl-1 nice-scroll sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, 300).map((w) => {
          const isKnown = mounted && !!known[wordKey(w.lessonId, w.en)];
          const isStarred = mounted && starredWords.includes(wordKey(w.lessonId, w.en));
          const t = themeOf(w.lessonColor);
          return (
            <div
              key={`${w.lessonId}-${w.en}`}
              className="flex items-start justify-between gap-2 rounded-xl border c-card p-3 transition-shadow hover:shadow-sm"
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
                  <button
                    onClick={() => toggleStarred(wordKey(w.lessonId, w.en))}
                    title={isStarred ? "حذف از واژه‌های من" : "افزودن به واژه‌های من"}
                    aria-label={isStarred ? `حذف ${w.en} از واژه‌های من` : `افزودن ${w.en} به واژه‌های من`}
                    aria-pressed={isStarred}
                    className={`rounded-md p-0.5 transition-[background-color,color,border-color,transform,fill,stroke] hover:scale-110 active:scale-[0.96] ${
                      isStarred ? "fill-amber-400 text-amber-400" : "text-stone-300 hover:text-amber-400"
                    }`}
                  >
                    <Star size={14} className={isStarred ? "fill-amber-400 text-amber-400" : ""} />
                  </button>
                </div>
                <div className="mt-0.5 text-[13px] text-stone-600">{w.fa}</div>
                {(() => {
                  const pairs = mounted ? synAntPairsFor(pairIndex, w.en) : [];
                  if (pairs.length === 0) return null;
                  return (
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {pairs.slice(0, 3).map((p) => (
                        <button
                          key={`${p.kind}-${p.other}-${p.lessonId}`}
                          type="button"
                          onClick={() => void speak(p.other, 0.95)}
                          title="روخوانی جفت"
                          aria-label={`${p.kind === "syn" ? "مترادف" : "متضاد"}ِ ${w.en}: ${p.other} — روخوانی`}
                          className={`dict-pair-chip inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10.5px] font-bold transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                            p.kind === "syn"
                              ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                              : "border-rose-200 bg-rose-50/60 text-rose-700"
                          }`}
                        >
                          <span aria-hidden className="font-black">{p.kind === "syn" ? "≈" : "↔"}</span>
                          <span dir="ltr">{p.other}</span>
                        </button>
                      ))}
                      {pairs.length > 3 && (
                        <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10.5px] font-bold text-stone-500">
                          +{faNum(pairs.length - 3)}
                        </span>
                      )}
                    </div>
                  );
                })()}
                {/* راند ۲۵۲ — «کاربرد در جزوه»: این واژه کجای جزوه آمده؟
                    چیپ فقط با تطبیقِ واقعی در مکالمه/ریدینگِ جزوه می‌آید —
                    بی‌کاربرد، هیچ (صداقتِ همیشگی). کلیک → دیالوگِ جای‌ها با
                    هایلایتِ واژه و ترجمهٔ فارسیِ خودِ جزوه. رنگ‌ها رویِ
                    ایدئومِ kernel — sky-50/200/700 خودشان dark remap دارند. */}
                {(() => {
                  const sites = mounted ? findWordUsages(w.en) : [];
                  if (sites.length === 0) return null;
                  return (
                    <button
                      type="button"
                      data-testid={`usage-chip-${w.en.replace(/\s+/g, "-")}`}
                      onClick={() => setUsage({ en: w.en, sites })}
                      title="کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه"
                      aria-label={`کاربرد ${w.en} در مکالمه‌ها و ریدینگ‌ها — ${faNum(sites.length)} مورد`}
                      className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50/60 px-1.5 py-0.5 text-[10.5px] font-bold text-sky-700 transition-[background-color,color,border-color,transform] active:scale-[0.96]"
                    >
                      <BookOpenText size={11} aria-hidden />
                      در جزوه · {faNum(sites.length)}
                    </button>
                  );
                })()}
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.chipBg}`}>
                  درس {faNum(w.lessonId)}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <SpeakButton text={w.en} />
                <button
                  onClick={() => toggleKnown(wordKey(w.lessonId, w.en))}
                  title={isKnown ? "بلدم" : "علامت‌زدن به عنوان بلد"}
                  className={`h-8 rounded-full border px-2 text-[10px] font-bold transition-colors ${
                    isKnown
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-500 hover:text-stone-600"
                  }`}
                >
                  بلدم
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* دریلِ جفت‌ها — آزمونِ استانداردِ خانه روی جفت‌های همان دامنه؛ نتیجه
          زیرِ «0:synant» ثبت می‌شود (فید، پنلِ مهارت و بانکِ اشتباهات می‌فهمند) */}
      <Dialog open={drillOpen} onOpenChange={(o) => (o ? setDrillOpen(true) : closeDrill())}>
        <DialogContent aria-describedby={undefined} className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight size={16} className="text-violet-600" />
              {drill?.title ?? "دریل جفت‌ها"}
            </DialogTitle>
          </DialogHeader>
          {drill && drill.questions.length > 0 && (
            <QuizEngine
              title={drill.title}
              questions={drill.questions}
              resultKeyStr="0:synant"
              lessonId={0}
              category="synant"
              immediate
              // راند ۲۴۸ — بندِ ① پیشنهادِ ۲۴۷: خانوادهٔ resumeDoor به نتیجهٔ
              // دریلِ دیکشنری هم رسید — جایی که نتیجهٔ جفت‌ها گرفته می‌شود،
              // راهِ برگشت به ضمیمه هم آن‌جاست (همان الگو، opt-inِ مصرف‌کننده).
              resumeDoor
              onExit={closeDrill}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* راند ۲۵۲ → ۲۵۳ — دیالوگِ «کاربرد در جزوه» حالا تک‌منبعِ مشترک است:
          هر جایِ واقعیِ واژه در مکالمه‌ها/ریدینگ‌هایِ جزوه با هایلایتِ mark
          و ترجمهٔ فارسیِ خودِ جزوه — حداکثر ۸ مورد، مابقی شمارندهٔ صادقانه. */}
      <WordUsageDialog target={usage} onClose={() => setUsage(null)} />
    </div>
  );
}
