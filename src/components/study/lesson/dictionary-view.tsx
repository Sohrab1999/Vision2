"use client";

import { useMemo, useState } from "react";
import { Search, X, BookMarked, BookOpenText, CheckCircle2, CircleDashed, AlarmClock, SearchX, Download, Star, ArrowLeftRight, Shuffle, BarChart3, ChevronDown, TrendingUp, Percent, EyeOff } from "lucide-react";
import { lessons } from "@/data";
import { useStudy, wordKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf, faNum } from "@/lib/study-theme";
import { downloadAnkiTsv, buildAnkiTsv } from "@/lib/anki-export";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { buildSynAntIndex, synAntPairsFor, matchesViaPairs } from "@/lib/syn-ant-lookup";
import { findWordUsages, lessonsVocabUsageRanking } from "@/lib/word-usage";
import WordUsageDialog, { type WordUsageTarget } from "./word-usage-dialog";
import { buildPairsDrillQuiz, SYN_QUIZ_CAP } from "@/lib/syn-ant-quiz";
import type { QuizQuestion } from "@/lib/study-types";
import { speak } from "@/lib/speak";
import SpeakButton from "../shared/speak-button";
import QuizEngine from "../quiz/quiz-engine";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// state filter values — «paired» (r205): فقط واژه‌های جفت‌دارِ جزوه؛
// «usage» (r253): فقط واژه‌های کاربرددار در متنِ مکالمه/ریدینگِ جزوه؛
// «unused» (r260): قرینهٔ کهرباییِ «usage» — فقط از مسیرِ Shift+کلیکِ سطرِ نوارِ
// مقایسه‌ای می‌آید و هرگز در stateChips نیست (ردیفِ وضعیت دقیقاً ۶ دکمه — گاردِ r253)
type StateFilter = "all" | "known" | "unknown" | "due" | "paired" | "usage" | "unused";

// r260 — سهمِ درصدیِ یک‌رقمِ اعشار با ممیزِ فارسی (همان ایدئومِ study-theme)؛
// هرگز رشتهٔ ثابت — همیشه از تقسیمِ لایهٔ داده
const pctFa = (ratio: number) => faNum((Math.round(ratio * 1000) / 10).toFixed(1)).replace(".", "٫");

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

  // راند ۲۵۸ — نوارِ مقایسه‌ایِ ۱۲ درسی (بندِ ③ پیشنهادِ ۲۵۷، باز از ۲۵۴): «کدام
  // درس بیشترین واژهٔ کاربرددار را دارد؟» — سطرِ هر درس از تک‌منبعِ
  // lessonsVocabUsageRanking (مقیاسِ کارت — هم‌مقیاسِ همین لنزِ r253؛
  // جمع = ۱۹۱۵/۴۰۳۲ با پیش‌شمارشِ قفل). داده ایستاست — deterministic بدونِ
  // mounted-gate (الگویِ vocab-usage-censusِ r257). نامِ دکمه/سطرها هرگز
  // «کاربرددار» یا «جزوه»ی برهنه ندارد — فضای نامِ a11yِ لنزِ r253 (درسِ r253).
  const [rankOpen, setRankOpen] = useState(false);
  const usageRank = useMemo(() => {
    const rows = lessonsVocabUsageRanking();
    return {
      rows,
      maxUsed: rows.reduce((m, r) => Math.max(m, r.usedWords), 0),
      // راند ۲۵۹ — قهرمانِ مقیاسِ دوم: بیشترینِ «سهمِ نسبی» (تقسیمِ شناور —
      // کسرهایِ مساویِ ریاضی به doubleِ یکسان می‌رسند؛ تساویِ مستقیم ایمن است)
      maxRatio: rows.reduce((m, r) => Math.max(m, r.totalWords > 0 ? r.usedWords / r.totalWords : 0), 0),
      sumUsed: rows.reduce((n, r) => n + r.usedWords, 0),
      sumTotal: rows.reduce((n, r) => n + r.totalWords, 0),
      // r260 ① — میانگینِ سادهٔ ۱۲ نسبت (بدونِ وزن‌دهیِ اندازهٔ درس) — مقیاسی
      // متفاوت از سهمِ کلِ پیکره (sumUsed/sumTotal): درسِ ۱۰۵تایی و ۹۸۸تایی
      // اینجا هم‌وزن‌اند. پیش‌شمارشِ r260: میانگین ۴۹٫۷٪ در برابرِ پیکره ۴۷٫۵٪.
      avgRatio:
        rows.length > 0
          ? rows.reduce((n, r) => n + (r.totalWords > 0 ? r.usedWords / r.totalWords : 0), 0) / rows.length
          : 0,
      // r261 ① — قهرمانِ مسیرِ معکوس: بیشترینِ شمارشِ بیرون-از-متن (مکملِ
      // آسمانیِ «بیشترین» در مقیاسِ شمارش). مقایسهٔ صحیحی — همیشه صفر ممکن
      // نیست چون هیچ درسی کاملاً در-متن نیست، ولی گاردِ صفرِ شرط می‌ماند.
      maxUnused: rows.reduce((m, r) => Math.max(m, r.totalWords - r.usedWords), 0),
      // r262 ① — قهرمانِ چهارمِ ماتریسِ ۲×۲: بیشترینِ «نسبتِ» بیرون-از-متن
      // از واژگانِ خودِ درس (تقسیمِ شناور — تساویِ مستقیم ایمن، همان منطقِ
      // maxRatioِ r259). پیش‌شمارشِ r262: درسِ ۴ با ۲۳۶/۳۴۱ = ٪۶۹٫۲ — یگانه؛
      // ماتریسِ کامل: شمارشِ در-متن→۱۰ · نسبتِ در-متن→۷ · شمارشِ بیرون→۱۰ ·
      // نسبتِ بیرون→۴.
      maxUnusedRatio: rows.reduce(
        (m, r) => Math.max(m, r.totalWords > 0 ? (r.totalWords - r.usedWords) / r.totalWords : 0),
        0
      ),
      // r261 ② — رتبهٔ سهمِ در-متنِ هر درس (نسبتِ شناور، نزولی؛ رتبه‌بندیِ
      // رقابتی: اولین جایگاهِ هر کسرِ متمایز = رتبه‌اش، هم‌کسرها هم‌رتبه —
      // همان منطقِ تساویِ امنِ maxRatioِ r259). پیش‌شمارشِ r261: بدونِ تساوی؛
      // درسِ ۷ = رتبهٔ ۱ (۶۹٫۵٪) · درسِ ۱ = رتبهٔ ۲ · درسِ ۱۰ = رتبهٔ ۷.
      rankOf: (() => {
        const fracs = rows.map((r) => ({
          id: r.lessonId,
          frac: r.totalWords > 0 ? r.usedWords / r.totalWords : -1,
        }));
        const sorted = [...fracs].sort((a, b) => b.frac - a.frac);
        const fracRank = new Map<number, number>();
        sorted.forEach((r, i) => {
          if (!fracRank.has(r.frac)) fracRank.set(r.frac, i + 1);
        });
        const rank = new Map<number, number>();
        fracs.forEach((r) => rank.set(r.id, fracRank.get(r.frac) ?? 0));
        return rank;
      })(),
    };
  }, []);
  // کلیکِ سطر = فیلترِ همان درس + لنزِ «کاربرددار» — مطالعهٔ هدفمندِ دو-کلیکی؛
  // Shift+کلیک (r260 ②) = همان درس با لنزِ کهرباییِ «بیرون-از-متن» — مطالعهٔ
  // هدفمندِ معکوس (قهرمانِ «بیرونی‌ترینِ» r261 برایِ دیدنِ حفره‌ها). پنل جمع می‌شود تا
  // «N واژه یافت شد» بلافاصله دیده شود. (دادهٔ دموکراتیک — فقط دو فیلترِ
  // محلیِ view؛ هیچ رکوردِ یادگیری‌ای ساخته نمی‌شود.)
  const openRankLesson = (lessonId: number, reverse = false) => {
    setLessonFilter(lessonId);
    setStateFilter(reverse ? "unused" : "usage");
    setRankOpen(false);
  };

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
      if (stateFilter === "unused" && usageSet.has(w.en.trim().toLowerCase())) return false;
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

        {/* راند ۲۶۰ ② — نوارِ شناسهٔ لنزِ کهرباییِ «بیرون-از-متن»: فیلترِ
            «unused» فقط از مسیرِ Shift+کلیکِ سطرِ نوار می‌آید و چیپِ قابلِ
            کلیکی در ردیفِ وضعیت ندارد — این نوار هویتش را اعلام می‌کند و
            بازگشتِ یک‌کلیکی می‌دهد (هویتِ کهرباییِ r257/259 — amber-50/200/800
            ریمپِ موجود؛ صفرِ قانونِ CSSِ نو). بیرونِ ردیفِ وضعیت — گاردِ ۶ دکمه. */}
        {stateFilter === "unused" && (
          <div
            data-testid="usage-reverse-bar"
            className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-900/30"
          >
            <EyeOff size={14} aria-hidden className="shrink-0 text-amber-700 dark:text-amber-300" />
            <p className="min-w-0 flex-1 text-[11.5px] font-bold leading-5 text-amber-800 dark:text-amber-200">
              لنزِ کهربایی: فقط واژه‌های بیرون-از-متن{" "}
              {lessonFilter ? `درسِ ${faNum(lessonFilter)}` : "همهٔ درس‌ها"} — واژه‌هایی که در مکالمه‌ها و ریدینگ‌های جزوه نیامده‌اند
            </p>
            <button
              type="button"
              data-testid="usage-reverse-clear"
              onClick={() => {
                // بازگشتِ کامل به همهٔ واژه‌ها — هم لنزِ کهربایی هم فیلترِ درس
                // (قراردادِ aria-label: «به همهٔ واژه‌ها»)
                setStateFilter("all");
                setLessonFilter(null);
              }}
              aria-label="بازگشت از لنزِ کهربایی به همهٔ واژه‌ها"
              className="shrink-0 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-black text-white transition-[background-color] hover:bg-amber-700 dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-400"
            >
              بازگشت
            </button>
          </div>
        )}

        {/* راند ۲۵۸ — نوارِ مقایسه‌ایِ ۱۲ درسی (بندِ ③ پیشنهادِ ۲۵۷): بخشِ
            خودش را دارد (بیرونِ ردیفِ «وضعیت یادگیری:» — گاردِ r253 آن ردیف
            را دقیقاً ۶ دکمه می‌خواهد) و نامش هرگز /کاربرددار/ را تصاحب
            نمی‌کند؛ پرسشِ کاملِ پیشنهاد، تیترِ غیرتعاملیِ داخلِ پنل است. */}
        <div className="mt-2.5 border-t border-dashed border-stone-200 pt-3">
          <button
            type="button"
            data-testid="usage-rank-toggle"
            onClick={() => setRankOpen((v) => !v)}
            aria-expanded={rankOpen}
            aria-controls="usage-rank-panel"
            title="مقایسهٔ ۱۲ درس — واژه‌های هر درس که در مکالمه‌ها و ریدینگ‌های جزوه زندگی می‌کنند"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-stone-600 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-stone-100 dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-900/70"
          >
            <BarChart3 size={13} />
            مقایسهٔ پوششِ واژگانِ {faNum(lessons.length)} درس
            <ChevronDown size={13} aria-hidden className={`transition-transform duration-200 ${rankOpen ? "rotate-180" : ""}`} />
          </button>
          {rankOpen && (
            <div
              id="usage-rank-panel"
              data-testid="usage-rank-panel"
              className="mt-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/60"
            >
              {/* h2 — گاردِ outline (J-6): h1→h3 پرشِ ۲ ممنوع؛ سرفصلِ بخشِ مقایسه */}
              <h2 className="mb-0.5 flex items-center gap-1.5 text-[12.5px] font-extrabold text-stone-800">
                <BookOpenText size={13} className="text-sky-600" />
                کدام درس بیشترین واژهٔ کاربرددار را دارد؟
              </h2>
              {/* r260 ① — دو مقیاسِ یک پیکره در یک سطر: میانگینِ سادهٔ نسبت‌های
                  ۱۲گانه (درس‌ها هم‌وزن) در برابرِ سهمِ کلِ پیکره (وزن‌دار به اندازهٔ
                  درس). پیش‌شمارشِ r260: ٪۴۹٫۷ در برابرِ ٪۴۷٫۵ — تفاوتی که فقط با
                  هم‌نشینی‌شان دیده می‌شود. spanِ اطلاعاتی نه دکمه (فضای نامِ a11y). */}
              <p data-testid="usage-rank-avg" className="mb-1 text-[11px] font-black text-stone-600">
                میانگینِ سهمِ درس‌ها: ٪{pctFa(usageRank.avgRatio)} · سهمِ کلِ پیکره: ٪{pctFa(usageRank.sumUsed / usageRank.sumTotal)}
              </p>
              <p className="mb-2 text-[11px] font-bold leading-5 text-stone-500">
                نوار = سهمِ واژه‌هایِ هر درس که در مکالمه‌ها و ریدینگ‌های جزوه زندگی می‌کنند؛ عدد = کارت‌ها. کلیک روی هر درس: واژه‌های در-متن با لنزِ آسمانی · با کلید Shift: واژه‌های بیرون-از-متن با لنزِ کهربایی.
              </p>
              <div className="grid gap-0.5">
                {usageRank.rows.map((r) => {
                  const pct = r.totalWords > 0 ? Math.round((r.usedWords / r.totalWords) * 100) : 0;
                  // r260 ③ — نیمهٔ پنهانِ همان سهم: بیرون-از-متن (مکملِ گردشده،
                  // مستقل محاسبه می‌شود نه ۱۰۰−pct — صداقتِ گردکردن)
                  const unusedPct = r.totalWords > 0 ? Math.round(((r.totalWords - r.usedWords) / r.totalWords) * 100) : 0;
                  // r261 ② — رتبهٔ سهمِ در-متن در همان tooltip (رتبه‌بندیِ رقابتیِ
                  // نسبتِ شناور — هم‌کسرها هم‌رتبه)
                  const rank = usageRank.rankOf.get(r.lessonId) ?? 0;
                  // r265 ③ — بندِ ③ پیشنهادِ ۲۶۴: مقیاسِ مطلقِ پیکره در همان
                  // tooltip — «۴۹۰ از ۱۹۱۵ کاربردِ در-متنِ پیکره · ۴۹۸ از
                  // ۲۱۱۷ بی‌کاربردِ پیکره». مخرج = جمعِ کلِ ۱۲ درس (نه اندازهٔ
                  // خودِ درس — آن «N از M» مرئیِ سطر است)؛ واژهٔ «بی‌کاربرد»
                  // همان پانویسِ پنل است. پیش‌شمارشِ r265: جمع‌ها ۱۹۱۵/۲۱۱۷/۴۰۳۲؛
                  // لنگرها درسِ ۱۰ = ۴۹۰+۴۹۸ · درسِ ۷ = ۷۳+۳۲.
                  return (
                    <button
                      key={r.lessonId}
                      type="button"
                      data-testid={`usage-rank-row-${r.lessonId}`}
                      onClick={(e) => openRankLesson(r.lessonId, e.shiftKey)}
                      title={`درسِ ${faNum(r.lessonId)}: ٪${faNum(pct)} در متن · ٪${faNum(unusedPct)} بیرون از متن · رتبهٔ ${faNum(rank)} از ${faNum(usageRank.rows.length)} در سهمِ در-متن · ${faNum(r.usedWords)} از ${faNum(usageRank.sumUsed)} کاربردِ در-متنِ پیکره · ${faNum(r.totalWords - r.usedWords)} از ${faNum(usageRank.sumTotal - usageRank.sumUsed)} بی‌کاربردِ پیکره — کلیک: واژه‌های در-متن · Shift+کلیک: بیرون-از-متن`}
                      aria-label={`نمایش واژه‌های درس ${faNum(r.lessonId)} — ${r.titleFa} — که در مکالمه‌ها و ریدینگ‌ها آمده‌اند؛ با Shift: واژه‌هایی که نیامده‌اند`}
                      className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-right transition-[background-color,color] hover:bg-white dark:hover:bg-stone-700/50"
                    >
                      <span className="shrink-0 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10.5px] font-black text-violet-700">
                        درس {faNum(r.lessonId)}
                      </span>
                      <span className="w-[7.5rem] min-w-0 shrink truncate text-[11.5px] font-bold text-stone-600">
                        {r.titleFa}
                      </span>
                      <span aria-hidden className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-200/80">
                        <span
                          className="block h-full rounded-full bg-gradient-to-l from-sky-600 to-sky-400"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="shrink-0 text-[10.5px] font-black text-stone-600">
                        {faNum(r.usedWords)} از {faNum(r.totalWords)}
                      </span>
                      {usageRank.maxUsed > 0 && r.usedWords === usageRank.maxUsed && (
                        <span
                          data-testid="usage-rank-max"
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-sky-600 px-1.5 py-0.5 text-[9.5px] font-black text-white"
                        >
                          <TrendingUp size={9} aria-hidden />
                          بیشترین
                        </span>
                      )}
                      {/* راند ۲۵۹ — بندِ ② پیشنهادِ ۲۵۸: قهرمانِ مقیاسِ دوم —
                          «بیشترینِ نسبت» (درسِ ۷: ۶۹٫۵٪) کنارِ «بیشترینِ شمارش»
                          (درسِ ۱۰: ۴۹۰)؛ هویتِ آسمانیِ خانواده با خطِ دورِ ملایم
                          (border-sky-200/bg-sky-50 — ریمپِ تاریکِ kernel) تا از
                          badgeِ پرِ شمارش تفکیک شود؛ تساوی = همهٔ صدرنشین‌ها. */}
                      {usageRank.maxRatio > 0 && r.usedWords / r.totalWords === usageRank.maxRatio && (
                        <span
                          data-testid="usage-rank-max-ratio"
                          title="بیشترین سهمِ نسبی واژه‌های در-متن از واژگانِ همان درس"
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[9.5px] font-black text-sky-700"
                        >
                          <Percent size={9} aria-hidden />
                          بیشترینِ نسبت
                        </span>
                      )}
                      {/* راند ۲۶۱ — بندِ ① پیشنهادِ ۲۶۰: قرینهٔ کهرباییِ «بیشترین» —
                          قهرمانِ مسیرِ معکوس (Shift+کلیک): درسی با بیشترین واژهٔ
                          بیرون-از-متن (پیش‌شمارشِ r261: درسِ ۱۰ با ۴۹۸ — یگانه؛
                          Σ=۲۱۱۷ قفلِ r259). هویتِ کهرباییِ خانواده — همان ایدئومِ
                          سرشماریِ r258 (border-amber-200/bg-amber-50/60/text-amber-800 —
                          ریمپِ تاریکِ kernel؛ صفرِ قانونِ CSSِ نو) و آیکونِ EyeOffِ
                          بیرون-از-متنِ r257 — badgeِ پیش‌نمایِ همان مقصدِ Shift+کلیک.
                          مقایسهٔ صحیحی — هم‌شمارها همه badge می‌گیرند. */}
                      {usageRank.maxUnused > 0 && r.totalWords - r.usedWords === usageRank.maxUnused && (
                        <span
                          data-testid="usage-rank-max-unused"
                          title="بیشترین واژهٔ بیرون-از-متن از واژگانِ همان درس — با Shift+کلیک همان واژه‌ها را ببین"
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50/60 px-1.5 py-0.5 text-[9.5px] font-black text-amber-800"
                        >
                          <EyeOff size={9} aria-hidden />
                          بیرونی‌ترین
                        </span>
                      )}
                      {/* راند ۲۶۲ — بندِ ① پیشنهادِ ۲۶۱: قهرمانِ چهارم — قرینهٔ
                          کهرباییِ «بیشترینِ نسبت»: بیشترینِ نسبتِ بیرون-از-متن
                          از واژگانِ خودِ درس (پیش‌شمارشِ r262: درسِ ۴ با ٪۶۹٫۲ —
                          یگانه؛ درسِ ۴ پیشتر بی-badge بود و حالا تاجِ مسیرِ
                          معکوس در مقیاسِ نسبت را می‌گیرد). هویتِ کهرباییِ خانواده
                          (همان ایدئومِ r258/261 — صفرِ قانونِ CSSِ نو) + آیکونِ
                          Percentِ مقیاسِ نسبتِ r259؛ تساوی = همهٔ صدرنشین‌ها. */}
                      {usageRank.maxUnusedRatio > 0 &&
                        r.totalWords > 0 &&
                        (r.totalWords - r.usedWords) / r.totalWords === usageRank.maxUnusedRatio && (
                          <span
                            data-testid="usage-rank-max-unused-ratio"
                            title="بیشترین سهمِ نسبی واژه‌های بیرون-از-متن از واژگانِ همان درس — با Shift+کلیک همان واژه‌ها را ببین"
                            className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50/60 px-1.5 py-0.5 text-[9.5px] font-black text-amber-800"
                          >
                            <Percent size={9} aria-hidden />
                            بیرونی‌ترینِ نسبت
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
              <p
                data-testid="usage-rank-sum"
                className="mt-2 border-t border-dashed border-stone-200 pt-2 text-[11px] font-black text-stone-600"
              >
                جمعِ {faNum(usageRank.rows.length)} درس: {faNum(usageRank.sumUsed)} از{" "}
                {faNum(usageRank.sumTotal)} واژه در جزوه (٪{pctFa(usageRank.sumUsed / usageRank.sumTotal)}) ·
                بی‌کاربردها: {faNum(usageRank.sumTotal - usageRank.sumUsed)}{" "}
                واژه (٪{pctFa((usageRank.sumTotal - usageRank.sumUsed) / usageRank.sumTotal)})
              </p>
            </div>
          )}
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
      {/* r263 ① — پیوندِ دوسویه: کلیکِ چیپِ درسِ نوارِ پراکندگی = وعدهٔ aria-label
          («رفتن به واژه‌هایِ درسِ N») — فیلترِ درس + لنزِ آسمانی + پاک‌کردنِ
          جستجو (جستجو برایِ یافتنِ همین واژه بود؛ وعدهٔ دکمه، واژه‌هایِ کلِ درس
          است) + بستنِ دیالوگ. بقیهٔ مصرف‌کننده‌هایِ دیالوگ بی-هندلر می‌مانند. */}
      <WordUsageDialog
        target={usage}
        onClose={() => setUsage(null)}
        onOpenLesson={(lessonId) => {
          setLessonFilter(lessonId);
          setStateFilter("usage");
          setQuery("");
          setUsage(null);
        }}
      />
    </div>
  );
}
