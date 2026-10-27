"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Sparkles, CalendarClock, CheckCircle2, TrendingUp, Sprout, BookOpenCheck, AlarmClock, ArrowLeft, Star, ChevronDown, Ear } from "lucide-react";
import { useStudy, srsDueTotal, firstLessonWithDue, starToggleAria, srsLevelFa, type SrsItem } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { srsDueSummary, srsForecastWords, SRS_PANEL_SPOTLIGHT_EVENT, peekSrsSpotlight, ackSrsSpotlight, focusSrsDashboard } from "@/lib/srs-due";
import { buildDueDictation, DICTATION_MIN_DUE } from "@/lib/due-dictation";
import type { DictationSource } from "@/lib/study-types";
import { trackEvent } from "@/lib/analytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DictationTab from "../lesson/dictation-tab";
import { uiColors } from "@/lib/ui-colors";

// ------------------------------------------------------------------
// داشبورد مرور هوشمند — health of the SRS queue:
// due-now / learning / strong / mastered + 7-day forecast of what's
// coming up, with a one-tap smart review entry. A state donut shows
// the composition of the queue at a glance.
// ------------------------------------------------------------------

const DAY_MS = 86_400_000;
const DONUT_R = 40;
const DONUT_C = 2 * Math.PI * DONUT_R;

function dayLabel(offset: number): string {
  if (offset === 0) return "امروز";
  if (offset === 1) return "فردا";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const weekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
  return weekdays[d.getDay()];
}

export default function SrsPanel() {
  const srs = useStudy((s) => s.srs);
  const openLesson = useStudy((s) => s.openLesson);
  const starredWords = useStudy((s) => s.starredWords);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const mounted = useMounted();

  const starredSet = useMemo(() => new Set(starredWords), [starredWords]);

  const stats = useMemo(() => {
    if (!mounted) return null;
    const now = Date.now();
    let due = 0;
    let learning = 0; // level 0..2
    let strong = 0; // level 3..4
    let mastered = 0; // level 5
    const forecast = new Array<number>(7).fill(0);
    const items = Object.values(srs) as SrsItem[];
    for (const it of items) {
      // Task 293 — a null entry in a raw-hydrated map (legacy/corrupt
      // blob) must skip, not crash the whole panel; totals stay honest
      // because `total` still counts every key.
      if (!it || typeof it.dueAt !== "number" || typeof it.level !== "number") continue;
      if (it.dueAt <= now) due++;
      else {
        const dayOffset = Math.floor((it.dueAt - now) / DAY_MS);
        if (dayOffset < 7) forecast[dayOffset]++;
      }
      if (it.level >= 5) mastered++;
      else if (it.level >= 3) strong++;
      else learning++;
    }
    return { due, learning, strong, mastered, total: items.length, forecast, maxForecast: Math.max(1, ...forecast) };
  }, [srs, mounted]);

  const reviewLesson = mounted ? firstLessonWithDue(srs) : null;
  const dueTotal = mounted ? srsDueTotal(srs) : 0;

  // «سررسید الآن» — WHICH words are due (oldest first), not just how many;
  // every count here is resolvable-only so the block is self-consistent
  const dueInfo = useMemo(
    () => (mounted ? srsDueSummary(srs, Date.now(), 5) : { words: [], dueTotal: 0 }),
    [srs, mounted]
  );
  const dueWords = dueInfo.words;
  const dueOverflow = Math.max(0, dueInfo.dueTotal - dueWords.length);

  // «دیکتهٔ سررسیدها» — املای شنیداری از فهرست کامل سررسید (نه فقط ۵ چیپ).
  // جلسه SNAPSHOT است (درس task 50): منبع در لحظهٔ باز شدن منجمد می‌شود —
  // وگرنه مرورِ آخرین واژهٔ سررسید وسط راند، dueTotal را صفر و dictSource را
  // null می‌کند و DictationTab وسط کار آنمانت می‌شود (finish هرگز نمی‌رسد).
  const [dictOpen, setDictOpen] = useState(false);
  const [dictSession, setDictSession] = useState<DictationSource | null>(null);
  const openDueDictation = () => {
    const words = srsDueSummary(srs, Date.now(), dueInfo.dueTotal).words;
    if (words.length === 0) return;
    setDictSession(buildDueDictation(words));
    setDictOpen(true);
    trackEvent("srs_due_dictation_start");
  };
  const closeDueDictation = () => {
    setDictOpen(false);
    setDictSession(null);
  };

  const startSmartReview = () => {
    trackEvent("srs_due_review");
    openLesson(reviewLesson ?? 1, "smart");
  };

  // «پیش‌بینی تپ‌پذیر» — هر ستونِ پیش‌بینی بازشدنی است تا نشان بدهد کدام واژه‌ها
  // در آن روز سر می‌رسند (همان قرارداد خودسازگار srsDueSummary، اما برای آینده);
  // یک ردیف در هر لحظه باز است، کلیک دوباره می‌بندد.
  const [openDay, setOpenDay] = useState<number | null>(null);
  const forecastInfo = useMemo(
    () => (mounted && openDay !== null ? srsForecastWords(srs, Date.now(), openDay, 8) : null),
    [srs, mounted, openDay]
  );
  // r371 «پرش به پنلِ همسایه» — مالکِ نمایشِ پالس اینجاست (عینِ پالسِ
  // دکمهٔ هدر — r244/r245): پرندهها (چیپهایِ کارتِ خطر) فقط رویداد
  // میفرستند؛ هایلایتِ گذرای ۱٫۶ثانیهای با تایمرِ مُهرِدار که هر
  // درخواستِ نو، مهلتِ قبلی را باطل میکند — و پاکسازی در unmount.
  const [spotlit, setSpotlit] = useState(false);
  const spotTimerRef = useRef<number | null>(null);
  // r372 «داشبوردِ مرور در فرمان‌یاب» — مسیرِ دوگانهٔ رسیدن: پرندهٔ
  // همسایه (چیپِ کارتِ خطر) رویدادِ زنده میفرستد؛ پرندهٔ دور (فرمانِ
  // پالت از دنیایِ دیگر) پرچم میگذارد و ناوبری میکند — این اثر بعد
  // از mount پرچم را مصرف میکند و خودش میپرد (ایدئومِ نشانگرِ
  // ضمیمه، r246: نگاهِ بدونِ عارضه برایِ StrictMode، اقرار فقط در
  // تایمرِ زندهٔ نهایی). سکونِ ۴۵۰ms: WordOfDay/VocabDonutِ بالای
  // پنل chunkهای داینامیکاند — اسکلت→واقعی جابهجا میشود؛ اسکرولِ
  // نرم رویِ چیدمانِ آرام گرفته صادقانهتر فرود میآید.
  const showSpotlight = () => {
    if (spotTimerRef.current !== null) window.clearTimeout(spotTimerRef.current);
    setSpotlit(true);
    spotTimerRef.current = window.setTimeout(() => {
      spotTimerRef.current = null;
      setSpotlit(false);
    }, 1600);
  };
  useEffect(() => {
    const SRS_JUMP_SETTLE_MS = 450;
    let consumeTimer: number | null = null;
    if (peekSrsSpotlight()) {
      consumeTimer = window.setTimeout(() => {
        consumeTimer = null;
        ackSrsSpotlight();
        // پرش با خودِ تابعِ کتابخانه — اسکرول + فوکوس + رویدادِ زنده؛
        // نمایش همان مسیرِ همیشگی (onSpot پایین) رنگ میگیرد.
        focusSrsDashboard();
      }, SRS_JUMP_SETTLE_MS);
    }
    const onSpot = () => showSpotlight();
    window.addEventListener(SRS_PANEL_SPOTLIGHT_EVENT, onSpot);
    return () => {
      window.removeEventListener(SRS_PANEL_SPOTLIGHT_EVENT, onSpot);
      if (consumeTimer !== null) window.clearTimeout(consumeTimer);
      if (spotTimerRef.current !== null) window.clearTimeout(spotTimerRef.current);
    };
  }, []);

  const faTime = (ts: number) => {
    const d = new Date(ts);
    const two = (n: number) => String(n).padStart(2, "0");
    const fa = (s: string) => [...s].map((c) => faNum(Number(c))).join("");
    return `${fa(two(d.getHours()))}:${fa(two(d.getMinutes()))}`;
  };

  // r322 — short فقط برای برچسبِ نیمفاصلهدار: «مستحکم‌شده» مرزِ شکستِ سطر ندارد
  // (U+200C فرصتِ شکست نمیسازد) و در دسکتاپ که خانه با lg:grid-cols-2 نیمعرض
  // میشود تا ۱۱px بیرون میزد (سنجشِ زندهٔ شخصیتِ قهرمان — over=11)؛ در موبایل
  // پنل تمامعرض است و برچسبِ کامل جا میشود — الگویِ r316: یک منبع، دو سطح،
  // نامِ کامل در tooltip. بقیهٔ برچسبها در مرزهای عرضی خود جا میشوند/شکسته میشوند.
  const chips: { icon: typeof CalendarClock; label: string; short?: string; value: number; cls: string }[] = [
    { icon: CalendarClock, label: "سررسید الآن", value: stats?.due ?? 0, cls: "bg-rose-50 text-rose-700" },
    { icon: Sprout, label: "در حال یادگیری", value: stats?.learning ?? 0, cls: "bg-amber-50 text-amber-700" },
    { icon: TrendingUp, label: "مستحکم‌شده", short: "مستحکم", value: stats?.strong ?? 0, cls: "bg-emerald-50 text-emerald-700" },
    { icon: BookOpenCheck, label: "وارفته", value: stats?.mastered ?? 0, cls: "bg-teal-50 text-teal-700" },
  ];

  // donut segments (value + color per SRS state)
  const arcs = useMemo(() => {
    if (!stats || stats.total === 0) return [];
    const segs = [
      { v: stats.due, c: uiColors.rose[500] },
      { v: stats.learning, c: uiColors.amber[500] },
      { v: stats.strong, c: uiColors.emerald[500] },
      { v: stats.mastered, c: uiColors.teal[500] },
    ];
    let acc = 0;
    return segs.map((s) => {
      const frac = s.v / stats.total;
      const arc = { c: s.c, frac, off: acc };
      acc += frac;
      return arc;
    });
  }, [stats]);

  return (
    <section
      id="srs-dashboard"
      aria-label="داشبورد مرور هوشمند"
      tabIndex={-1}
      data-spotlit={spotlit ? "true" : undefined}
      // r371 — لنگرِ پرش: scroll-mt-24 برای فاصلهٔ هدرِ چسبان (ایدئومِ r221/224)
      // + فوکوسِ برنامه‌ای (tabIndex=-1 فقط برایِ فوکوسِ دستوری) — بدونِ
      // outline-none: پالس، نشانهٔ کانونیِ خودش است و قراردادِ Task 177
      // پابرجا (کلاسِ جهانیِ :focus-visible برایِ پرشِ کیبوردی میماند).
      // پالس: حلقهٔ درونیِ ۲px زمردی — «جایگزین، نه اضافه» (قراردادِ سرشماریِ
      // r429/r430): shadow-sm از رشتهٔ پایه به شاخهٔ بی‌پالس رفت — پنلِ پالس‌دار
      // هرگز shadow-sm را همزمان حمل نمیکند؛ وگرنه --tw-shadowِ مشترک را
      // میدزدید (کامپایل: .shadow-sm پسِ shadow-[inset…] میآید و برنده میشود —
      // حلقه در روشن مرده بود، زنده witnessed) و ریمپِ سراسریِ شبِ
      // .dark .shadow-sm هم قلابش را مییافت. تیره با سایهٔ صریحِ خودش؛
      // مرزِ پنل دستِ نگارندهٔ تیرهٔ کرنل است (صفرِ وصلهٔ تیره).
      className={`srs-panel overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-l from-teal-50/80 to-emerald-50/60 transition-[box-shadow] duration-300 scroll-mt-24 ${
        spotlit
          ? "shadow-[inset_0_0_0_2px] shadow-emerald-300 dark:shadow-emerald-600"
          : "shadow-sm"
      }`}
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-teal-500 via-emerald-500 to-lime-400" />
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-900/20">
              <RefreshCcw size={20} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-stone-800">داشبورد مرور هوشمند (SRS)</h2>
              <p className="text-[12px] text-stone-500">
                {stats && stats.total > 0
                  ? `${faNum(stats.total)} واژه در چرخهٔ مرور با فاصله`
                  : "با فلش‌کارت یا دیکته شروع کن تا برنامهٔ مرور بسازد"}
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-col items-center gap-4 sm:flex-row">
            {/* SRS state donut */}
            <div
              role="img"
              aria-label="ترکیب وضعیت واژه‌ها در چرخهٔ مرور"
              className="srs-donut relative h-28 w-28 shrink-0 rounded-full bg-white/50 p-1 shadow-sm"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={DONUT_R} fill="none" stroke="rgba(15,118,110,0.12)" strokeWidth="12" />
                {arcs.map((a, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={DONUT_R}
                    fill="none"
                    stroke={a.c}
                    strokeWidth="12"
                    strokeDasharray={`${Math.max(0, a.frac * DONUT_C - 1.5)} ${DONUT_C}`}
                    strokeDashoffset={-a.off * DONUT_C}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black leading-none text-stone-800">{faNum(stats?.total ?? 0)}</span>
                <span className="mt-1 text-[9.5px] font-bold text-stone-500">واژه در چرخه</span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2">
              {chips.map((c) => (
                // min-w-0 — کفِ عرضیِ آیتمِ گرید: بدونِ آن برچسبِ بلندِ آینده ستونِ
                // minmax(auto,1fr) را باز میکند و همان سرریزِ ۱۱px برمیگردد
                <div key={c.label} className={`min-w-0 rounded-xl border border-white/60 p-2.5 text-center shadow-sm ${c.cls}`}>
                  <c.icon size={15} className="mx-auto mb-1" />
                  <div className="text-lg font-black leading-none">{faNum(c.value)}</div>
                  {/* r329 — آلفایِ ۸۰٪ رویِ برچسب ضربِ جوهر می‌ساخت: کهربایِ -۷۰۰
                      رویِ amber-50 با آلفا = ۳٫۴۷ (زنده با بوم)؛ حذفِ آلفا —
                      سلسله‌مراتب با سایز/وزن می‌ماند (درسِ spine راند ۳۲۸) */}
                  <div className="mt-1 text-[10.5px] font-bold" title={c.label}>
                    <span className="lg:hidden">{c.label}</span>
                    <span className="hidden lg:inline">{c.short ?? c.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* due-now word chips — the concrete "which words" layer */}
          {dueWords.length > 0 && (
            <div className="srs-due-preview mb-4 rounded-xl border border-rose-100 c-veil-70 p-3 shadow-sm">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-700" />
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-stone-500">
                  <AlarmClock size={12} className="text-rose-500" />
                  سررسید الآن — با یک ضربه مرور کن:
                </span>
                <span className="mr-auto rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700">
                  {faNum(dueInfo.dueTotal)} واژه
                </span>
                <button
                  onClick={openDueDictation}
                  disabled={dueInfo.dueTotal < DICTATION_MIN_DUE}
                  title={
                    dueInfo.dueTotal < DICTATION_MIN_DUE
                      ? `حداقل ${faNum(DICTATION_MIN_DUE)} واژهٔ سررسید لازم است`
                      : "املای شنیداری از همهٔ واژه‌های سررسید — املا درست یعنی مرور واقعی"
                  }
                  className="srs-due-dict-btn inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-[11px] font-bold text-rose-700 shadow-sm transition-[background-color,color,border-color,box-shadow,transform,opacity] enabled:hover:border-rose-300 enabled:hover:bg-rose-50 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Ear size={12} />
                  دیکته
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dueWords.map((w) => {
                  const starred = starredSet.has(w.key);
                  return (
                    <div key={w.key} className="inline-flex items-center gap-0.5">
                      {/* ستاره — هفتمین سطح ستاره‌گذاری: واژهٔ سررسید مستقیم به «واژه‌های من» */}
                      {/* r391 — aria/title از مالکِ قراردادِ ستاره (state/slices/starred.ts) */}
                      <motion.button
                        whileTap={{ scale: 0.75 }}
                        onClick={() => toggleStarred(w.key)}
                        aria-pressed={starred}
                        aria-label={starToggleAria(w.en, starred)}
                        title={starToggleAria(w.en, starred)}
                        className="srs-due-star flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md transition-colors hover:bg-amber-50"
                      >
                        <Star size={12} className={starred ? "fill-amber-400 text-amber-500" : "text-stone-300 transition-colors hover:text-amber-400"} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={startSmartReview}
                        title={`${w.en} — ${srsLevelFa(w.level)}`}
                        className="srs-due-chip group flex items-center gap-1.5 rounded-lg border border-rose-100 bg-white px-2 py-1 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-rose-300 hover:shadow active:scale-[0.96]"
                      >
                        <span className="en-text text-[12px] font-bold text-stone-800" dir="ltr">
                          {w.en}
                        </span>
                        <span className="hidden text-[10px] text-stone-500 sm:inline">{w.fa}</span>
                        <ArrowLeft size={11} className="text-rose-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.button>
                    </div>
                  );
                })}
                {dueOverflow > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={startSmartReview}
                    className="srs-due-chip rounded-lg border border-dashed border-rose-200 bg-white/50 px-2 py-1 text-[11px] font-bold text-rose-500 transition-[background-color,color,border-color,transform] hover:border-rose-400 active:scale-[0.96]"
                  >
                    +{faNum(dueOverflow)} واژهٔ دیگر
                  </motion.button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 border-t border-rose-100/70 pt-1.5 text-[10px] text-stone-500">
                <Star size={10} className="text-amber-400" />
                واژهٔ سررسید را با ستاره به «واژه‌های من» بفرست — یا با دیکته، املایش را محک بزن
              </div>
            </div>
          )}

          {/* 7-day forecast — تپ‌پذیر: کلیک روی ستون، واژه‌های همان روز را باز می‌کند */}
          {stats && stats.total > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-stone-500">
                <CalendarClock size={12} />
                پیش‌بینی مرور ۷ روز آینده
                {stats.forecast.some((n) => n > 0) && (
                  <span className="mr-auto text-[9.5px] font-bold text-stone-500">روی ستون‌ها بزن تا واژه‌ها را ببینی</span>
                )}
              </div>
              <div className="flex h-16 items-end gap-1.5" dir="ltr">
                {stats.forecast.map((n, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-stone-500">{n > 0 ? faNum(n) : ""}</span>
                    <motion.button
                      type="button"
                      aria-expanded={openDay === i}
                      aria-label={`${dayLabel(i)}: ${faNum(n)} واژه${n > 0 ? " — دیدن واژه‌ها" : ""}`}
                      disabled={n === 0}
                      onClick={() => setOpenDay((cur) => (cur === i ? null : i))}
                      whileTap={n > 0 ? { scale: 0.9 } : undefined}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(n > 0 ? 14 : 3, (n / stats.maxForecast) * 40)}px` }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                      className={`srs-fx-bar w-full rounded-t-md transition-[background-color,color,border-color,box-shadow] ${n > 0 ? (openDay === i ? "bg-gradient-to-t from-teal-600 to-emerald-300 ring-2 ring-emerald-300/60" : "bg-gradient-to-t from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-300") : "c-track-70"}`}
                      title={`${dayLabel(i)}: ${faNum(n)} واژه`}
                    />
                    <span className={`text-[9.5px] font-bold ${openDay === i ? "text-emerald-700" : i === 0 ? "text-emerald-700" : "text-stone-500"}`}>
                      {dayLabel(i)}
                    </span>
                  </div>
                ))}
              </div>
              {/* expansion — واژه‌های روزِ انتخاب‌شده، زودترین اول، با ستارهٔ هفتم */}
              {openDay !== null && forecastInfo && (
                <div className="srs-fx-expand mt-2 rounded-xl border border-teal-100 c-veil-70 p-3">
                  {forecastInfo.words.length > 0 ? (
                    <>
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-stone-500">
                        <ChevronDown size={12} className="text-emerald-600" />
                        {dayLabel(openDay)} — {faNum(forecastInfo.total)} واژه سر می‌رسد
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {forecastInfo.words.map((w) => {
                          const starred = starredSet.has(w.key);
                          return (
                            <div key={w.key} className="inline-flex items-center gap-0.5">
                              <motion.button
                                whileTap={{ scale: 0.75 }}
                                onClick={() => toggleStarred(w.key)}
                                aria-pressed={starred}
                                aria-label={starToggleAria(w.en, starred)}
                                title={starToggleAria(w.en, starred)}
                                className="srs-due-star flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md transition-colors hover:bg-amber-50"
                              >
                                <Star size={12} className={starred ? "fill-amber-400 text-amber-500" : "text-stone-300 transition-colors hover:text-amber-400"} />
                              </motion.button>
                              <span
                                title={`${w.en} — ${srsLevelFa(w.level)}`}
                                className="srs-fx-chip inline-flex items-center gap-1.5 rounded-lg border border-dashed border-teal-200 bg-white px-2 py-1 text-[11px] shadow-sm"
                              >
                                <span className="en-text text-[12px] font-bold text-stone-800" dir="ltr">{w.en}</span>
                                <span className="hidden text-[10px] text-stone-500 sm:inline">{w.fa}</span>
                                <span className="text-[9.5px] font-black text-emerald-600">{faTime(w.dueAt)}</span>
                              </span>
                            </div>
                          );
                        })}
                        {forecastInfo.total > forecastInfo.words.length && (
                          <span className="srs-fx-chip inline-flex items-center rounded-lg border border-dashed border-teal-200 bg-white/50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                            +{faNum(forecastInfo.total - forecastInfo.words.length)} واژهٔ دیگر
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-1 border-t border-teal-100/70 pt-1.5 text-[10px] text-stone-500">
                        <Star size={10} className="text-amber-400" />
                        واژه‌ای که قرار است بیاید را با ستاره به «واژه‌های من» بفرست تا از قلم نیفتد
                      </div>
                    </>
                  ) : (
                    <div className="py-1 text-center text-[11px] font-bold text-stone-500">واژه‌ای در این روز نیست</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-stretch gap-2.5 lg:w-52">
          <button
            onClick={startSmartReview}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-700 to-emerald-700 px-5 py-3 text-[13px] font-black text-white shadow-lg shadow-emerald-900/20 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
          >
            <Sparkles size={16} />
            {dueTotal > 0 ? `مرور ${faNum(dueTotal)} واژهٔ سررسید` : "شروع مرور هوشمند"}
          </button>
          {stats && stats.total > 0 && (
            <div className="rounded-xl border border-teal-100 c-veil-70 px-3 py-2 text-center text-[11px] font-bold leading-5 text-stone-500">
              {dueTotal > 0 ? (
                <span className="text-rose-700">{faNum(dueTotal)} واژه منتظر مرور است — الان بهترین وقت است!</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 size={12} />
                  همه‌چیز سر موعد است؛ دمت گرم!
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* targeted dictation dialog — spell the due words by ear; a correct
          spelling on a due word is a REAL SRS upgrade via reviewWord.
          Session is a SNAPSHOT — frozen at open, immune to live dueTotal decay. */}
      <Dialog
        open={dictOpen}
        onOpenChange={(o) => {
          if (o) openDueDictation();
          else closeDueDictation();
        }}
      >
        <DialogContent aria-describedby={undefined} className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Ear size={16} className="text-rose-600" />
              دیکتهٔ واژه‌های سررسید
            </DialogTitle>
          </DialogHeader>
          {dictSession && <DictationTab source={dictSession} onExit={closeDueDictation} exitLabel="بازگشت به داشبورد مرور" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
