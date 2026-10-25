"use client";

// ------------------------------------------------------------------
// Task-37 «هفته‌نامهٔ پیشرفت» — the week-over-week digest band inside
// the report card. This week (7 days) vs the one before it, per-day
// bars, goal dots and Persian highlights — all derived from the pure
// computeWeeklyDigest() contract (unit-tested in weekly-digest.test).
// Renders inside .report-paper so the print stylesheet covers it too.
// ------------------------------------------------------------------

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingDown, TrendingUp, Minus, CalendarHeart, Check, Compass, Snowflake, Swords, Timer, ImageDown, Share2, Loader2, CalendarClock, CalendarDays, Gauge, FileDown, BarChart3, Award, BookMarked, Flame } from "lucide-react";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { faNum, secFa, percentFa } from "@/lib/study-theme";
import { percentFromRate } from "@/lib/domain/percent"; // r388 — نرخ→درصد از مالک؛ هم آستانه و هم نرخِ زنده یک قدم
import { TIER_CHIP, badgeFractionFa } from "@/lib/achievements"; // r387 — کسرِ نشان از مالکِ رجیستری؛ BADGES دیگر در این نما لازم نیست
import { useBadgeCensus } from "@/hooks/use-badge-census";
import { buildCoverageMap } from "@/lib/coverage-map";
import { LESSONS_META } from "@/data/lesson-meta";
import { computeWeeklyDigest, faWeekday, faDayLabel, DUEL_QUICK_WEEK, type Delta, type QuickWeekProfile } from "@/lib/weekly-digest";
import { freezeDayMark, freezeLedgerMeta } from "@/lib/freeze-badge";
import { downloadWeeklyImage, buildWeeklyBlob, type WeeklyImageOpts, imageFailToast } from "@/lib/result-image";
import { blobToFile, shareImageFile, type ShareOutcome } from "@/lib/share-card";
import { trackEvent } from "@/lib/analytics";
import { downloadProgressCsv, downloadWeeklyTrendCsv, downloadMonthCsv } from "@/lib/progress-csv";
import { storiesReadSince } from "@/lib/library-progress";
import { storyStreak } from "@/lib/library-streak";
import { monthReads } from "@/lib/library-month";
import { storyById, HILL_TOTAL_STORIES } from "@/data/hill-stories";
import { useToast } from "@/hooks/use-toast";

const DELTA_META: { field: Delta["field"]; label: string; cls: string }[] = [
  // r329 — مقیاسِ -۶۰۰ رویِ ظرفِ نقابِ کاشیها زیرِ ۴٫۵ می‌ماند (کهربایِ ۳٫۱۷ ·
  // زمردِ ۳٫۶۲ · فیروزهایِ ۳٫۶۴ — زنده با بوم)؛ -۸۰۰ در هر دو تم ≥۶ —
  // تاریک با توکنِ کرنل (--color-*-800) خودش جوهرِ روشن می‌دهد
  { field: "reviews", label: "مرور", cls: "text-amber-800" },
  { field: "quizzes", label: "آزمون", cls: "text-emerald-800" },
  { field: "words", label: "واژهٔ نو", cls: "text-teal-800" },
  { field: "activities", label: "مجموع", cls: "text-stone-700" },
];

function DeltaChip({ d, label, cls }: { d: Delta; label: string; cls: string }) {
  const Icon = d.diff > 0 ? TrendingUp : d.diff < 0 ? TrendingDown : Minus;
  const tone = d.diff > 0 ? "text-emerald-700" : d.diff < 0 ? "text-rose-700" : "text-stone-500";
  return (
    <div className="flex-1 rounded-xl border border-stone-200 c-veil-70 px-2 py-2 text-center">
      <div className={`flex items-center justify-center gap-1 text-[15px] font-black ${cls}`}>
        {faNum(d.current)}
      </div>
      <div className="text-[9.5px] font-bold text-stone-500">{label}</div>
      <div className={`mt-0.5 flex items-center justify-center gap-0.5 text-[9.5px] font-black ${tone}`}>
        <Icon size={10} aria-hidden />
        {d.previous > 0 ? (
          <span dir="ltr">{`${d.diff > 0 ? "+" : ""}${faNum(d.diff)} (${Math.abs(d.percent ?? 0)}%)`}</span>
        ) : (
          <span>هفتهٔ پیش: —</span>
        )}
      </div>
    </div>
  );
}

// Task 113 — خطِ «هفتهٔ چابک» در هفته‌نامه: وقتی همین پنجرهٔ ۷روزه از گیت‌های
// خانوادهٔ دهم بگذرد، هفته‌نامه هم روایتش می‌کند — نقره «هفتهٔ چابک»، طلا
// «هفتهٔ برق» (هم‌آیکنِ همان نشان در کاشی — زبانِ بصریِ یکی). آستانه‌ها از
// DUEL_QUICK_WEEK می‌آیند تا هیچ‌وقت دووجهی نشوند؛ گیتِ نگذرانده یعنی خطِ
// غایب — نه تشویقِ ساختگی.
function QuickWeekLine({ qw }: { qw: QuickWeekProfile }) {
  const gold = qw.avgMs <= DUEL_QUICK_WEEK.goldMs;
  return (
    <div
      className="mt-1 flex flex-wrap items-center gap-1 text-[9.5px] font-black"
      title={`گیتِ هفته: میانگینِ فکر ≤ ${secFa(DUEL_QUICK_WEEK.silverMs)} ثانیه و نرخِ درستی ≥ ${percentFa(percentFromRate(DUEL_QUICK_WEEK.correctRate))} در پنجرهٔ ۷روزه · ${faNum(qw.thinkful)} نبردِ فکردار، ${faNum(qw.answered)} پاسخ`}
    >
      {gold ? (
        <Gauge size={11} className="text-amber-800" aria-hidden />
      ) : (
        <CalendarClock size={11} className="text-emerald-700" aria-hidden />
      )}
      <span className={gold ? "text-amber-800" : "text-emerald-700"}>
        {`${gold ? "هفتهٔ برق!" : "هفتهٔ چابک!"} — میانگینِ فکر ${secFa(qw.avgMs)} ثانیه با نرخِ درستی ${percentFa(percentFromRate(qw.rate))}`}
      </span>
    </div>
  );
}

/**
 * Task 186 — «گامِ بعدی»: نخستین سلولِ تلاش‌نشده در ترتیبِ کانونیِ
 * (vocab→dictation→listening→writing→konkuri→grammar) از همان
 * coverage-mapِ ۱۷۴ که ستونِ «گام بعدی» کاغذِ رسمی مصرف می‌کند —
 * یک منبع، دو مصرف: داشبورد و کاغذ هرگز واگرا نمی‌شوند. تازه‌وارد هم
 * چیپِ درست می‌گیرد («درس ۱ · تست واژگان» — پیشنهادِ کانونیِ صادق است،
 * نه آمارِ ساختگی)؛ همه‌پوشیده = null (چیپِ «همهٔ گام‌ها پوشیده»). خالص
 * و O(18) — بی‌useMemo (کامپایلرِ react حفظِ memo اینجا را رد می‌کرد
 * و هزینهٔ محاسبه ناچیز است).
 */
function findNextStep(
  results: Record<string, { percent: number; at?: string }>,
  known: Record<string, boolean>
): { lessonId: number; label: string } | null {
  const cov = buildCoverageMap(
    results,
    known,
    LESSONS_META.map((l) => ({ id: l.id, title: l.titleFa, words: l.vocabCount }))
  );
  for (const L of cov.lessons) {
    if (L.gap) return { lessonId: L.id, label: L.gap.label };
  }
  return null;
}

export default function WeeklyReportSection() {
  const dayHistory = useStudy((s) => s.dayHistory);
  const history = useStudy((s) => s.history);
  const results = useStudy((s) => s.results);
  const known = useStudy((s) => s.known);
  const goalMetDays = useStudy((s) => s.goalMetDays);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const streak = useStudy((s) => s.streak);
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeSavedDay = useStudy((s) => s.freezeSavedDay);
  const freezeUsedDays = useStudy((s) => s.freezeUsedDays);
  const freezeEarnedDay = useStudy((s) => s.freezeEarnedDay);
  const duelHistory = useStudy((s) => s.duelHistory);
  // r297 «کتاب‌خانه همه‌جا» — نوارِ کتاب‌خانه در هفته‌نامه (هم‌پنجرهٔ ۷روزهٔ دایجست)
  // r298 — گاردِ ?? داخلِ memo: مرجعِ پایدار برای کامپایلرِ react
  // (با ?? خالیِ هر رندر، حفظِ memoِ evalInput رد می‌شد — درسِ lint)
  const libraryDoneRaw = useStudy((s) => s.libraryDone);
  const libraryDone = useMemo(() => libraryDoneRaw ?? {}, [libraryDoneRaw]);
  // r302 — دومین مصرفِ library-streak: رکوردِ زنجیره در کنارِ شمارشِ هفته
  // (منبعِ یگانه با چیپِ کارتِ ادامهٔ خواندن؛ longestِ r301 بالاخره مصرف)
  const readStreak = useMemo(() => storyStreak(dayHistory, daysAgoKey(0)), [dayHistory]);
  // r304 — ماه‌نامهٔ خواندن: نگاهِ ۳۰روزه به داستان‌ها (همان منبعِ یگانه؛
  // dayHistory.stories) — نوارِ ۳۰خانه‌ای داخلِ نوارِ کتاب‌خانه
  const month = useMemo(() => monthReads(dayHistory, daysAgoKey(0)), [dayHistory]);
  // r284 — the badge band: the weekly digest answers «این هفته چطور بود؟»؛
  // نشان‌ها جوابِ «تا کجا رسیده‌ام؟»اند — r382: خودِ ارزیابیِ واحد هم به
  // قلابِ خانواده (use-badge-census) کوچید؛ سیگنالهایِ فقطسرشماری اینجا
  // دیگر سلکت نمی‌شوند — منبعِ یگانه، هیچ ارزیابیِ موازی‌ای.
  const [imgBusy, setImgBusy] = useState(false);
  const { toast } = useToast();

  // تسک ۱۷۸ — خروجی‌های CSV (بازسازیِ ۱۶۹ + روندِ تازه): هم‌روزِ دایجست
  // (daysAgoKey(0)) — آزمون‌ها با روزِ لنگر قفل‌اند.
  const saveCsv = () => {
    const ok = downloadProgressCsv(dayHistory, daysAgoKey(0));
    toast(
      ok
        ? { title: "📊 جدول CSV ذخیره شد", description: `${faNum(35)} روزِ فعالیت با ستونهایِ هفت‌روزه — آمادهٔ اکسل.`, duration: 3000 }
        : { title: "خطا در ساخت فایل", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };
  const saveTrendCsv = () => {
    const ok = downloadWeeklyTrendCsv({ dayHistory, history, goalMetDays }, daysAgoKey(0));
    toast(
      ok
        ? { title: "📈 روندِ ۴هفته‌ای ذخیره شد", description: "هر هفته یک سطر — برای گزارش معلم مناسب است.", duration: 3000 }
        : { title: "خطا در ساخت فایل", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };
  // r305 — ماه‌نامهٔ خواندن: برشِ ۳۰روزهٔ داستان‌ها از همان monthReads — CSVِ معلم‌نگر؛
  // r313 — toast هم زبانِ ۶ستونیِ r312 را میگوید (هم‌زبانِ برچسبِ دکمه)
  const saveMonthCsv = () => {
    const ok = downloadMonthCsv(dayHistory, daysAgoKey(0));
    toast(
      ok
        ? { title: "🗓 ماه‌نامهٔ خواندن ذخیره شد", description: "۳۰ سطرِ روزانه با جمعِ فزاینده و ستونهایِ هفت‌روزه — آمادهٔ اکسل.", duration: 3000 }
        : { title: "خطا در ساخت فایل", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };

  const digest = useMemo(
    // the digest window ends "today"; daysAgoKey(0) is the exported wall-clock
    // day key. The memo re-runs when the store's dayHistory changes — exactly
    // when the digest must.
    () => computeWeeklyDigest({ dayHistory, history, goalMetDays, duelHistory }, daysAgoKey(0)),
    [dayHistory, history, goalMetDays, duelHistory]
  );

  // دفتر یخ (Task 78) — مخزن + نجات‌های این هفته + مسیر یخِ بعدی؛ هم‌قرارداد
  // goalAndFreezePatch (فقط روزهای واقعیِ یخ و هدف) — هم‌پنجرهٔ ۷روزهٔ دایجست
  const ledger = useMemo(
    () =>
      freezeLedgerMeta({
        freezeCount,
        freezeSavedDay,
        freezeUsedDays,
        goalMetDays,
        freezeEarnedDay,
        today: daysAgoKey(0),
      }),
    [freezeCount, freezeSavedDay, freezeUsedDays, goalMetDays, freezeEarnedDay]
  );

  // Task 186 — گامِ بعدی: خالص و بی‌useMemo (کامنتِ findNextStep)
  const nextStep = findNextStep(results, known);

  // r297 — داستان‌های این هفته (هم‌پنجرهٔ دایجست: ۷روزِ اخیر، امروز شامل)
  const weekReads = useMemo(
    () => storiesReadSince(libraryDone, daysAgoKey(6), daysAgoKey(0)),
    [libraryDone],
  );

  // r284→r382 — ارزیابیِ واحدِ نشان‌ها از قلابِ خانواده (قرض از
  // use-badge-census): همان ۱۳ سیگنال + گیتِ هیدریشنِ خانواده (SSR-safe —
  // قراردادِ useFreshBadges) — نسخهٔ محلیِ memoهایِ سرشماری مرده است.
  const { unlockedBadges } = useBadgeCensus();

  const maxTotal = Math.max(1, ...digest.perDay.map((p) => p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush));
  const today = daysAgoKey(0);
  // r315 — عددِ «فعالیتِ امروز» از همان perDay (منبعِ یگانهٔ نوار): چیپِ زیرِ نوار
  // همان خانهٔ حلقهٔ زمردی را عدد می‌کند — عددهای چیپها با نوار سنجیده میشوند
  // (درسِ r309، حالا مستقیم زیرِ خودِ نوار). صفرِ صادق: امروزِ بیفعالیت هم
  // دیده میشود ولی خنثی — نه زمردیِ تشویقِ ساختگی (هم‌قراردادِ «بی‌داده هم صادق»).
  const todayEntry = digest.perDay.find((p) => p.day === today);
  const todayTotal = todayEntry
    ? todayEntry.stat.reviews + todayEntry.stat.quizzes + todayEntry.stat.words + todayEntry.stat.dictation + todayEntry.stat.rush
    : 0;

  // Task 104 — عکسِ هفته‌نامه: همان دایجستِ روی صفحه به یک کارتِ PNGِ خانوادهٔ
  // سبز تبدیل می‌شود — ورودیِ کاهش‌یافته فقط از اعدادِ واقعیِ همین دایجست پر می‌شود.
  // r306 — دانلود و هم‌رسانی دو دروازهٔ «یک» ارزیابی‌اند (الگویِ duel-done):
  // ورودیِ کارت یک‌بار ساخته میشود و هر دو دروازه از همان میخوانند.
  const weeklyImageOpts = (): WeeklyImageOpts => ({
    userName: useStudy.getState().userName || undefined,
    activities: digest.thisWeek.activities,
    reviews: digest.thisWeek.reviews,
    quizzes: digest.thisWeek.quizzes,
    words: digest.thisWeek.words,
    dictation: digest.thisWeek.dictation,
    rush: digest.thisWeek.rush,
    goalDays: digest.thisWeek.goalDays,
    streak,
    bestDay: digest.bestDay ? { label: faDayLabel(digest.bestDay.day), total: digest.bestDay.total } : null,
    // r298 — چیپِ داستان روی کارتِ PNG: فقط با کتاب‌خانهٔ فعال (صفرِ صادق
    // برای خوانندهٔ این‌هفته‌بی‌داستان؛ غایب برای بی‌کتاب‌خانه)
    storiesWeek: Object.keys(libraryDone).length > 0 ? weekReads.count : undefined,
    // r303 — استریکِ کتابخوانی روی کارت: فقط با سابقه (سیاستِ بوم‌محورِ r302)
    storiesStreak:
      readStreak.current > 0 || readStreak.longest > 0
        ? { current: readStreak.current, longest: readStreak.longest }
        : undefined,
    // r305 — سطرِ ماه‌نامه روی کارت: فقط با سابقهٔ پنجره (سیاستِ بوم‌محور)
    storiesMonth:
      !month.empty
        ? { total: month.total, activeDays: month.activeDays, bestCount: month.best?.count ?? 0 }
        : undefined,
    // r307 — نوارِ ۳۰خانه‌ای روی کارت: همان perDayِ ماه‌نامه (کهنه→امروز)؛
    // فقط همراهِ storiesMonth — بدونِ سابقه نوارِ صفرِ ساختگی نیست
    storiesMonthPerDay: !month.empty ? month.perDay.map((d) => d.count) : undefined,
    // r308 — نوارِ ۱۴روزهٔ هفته روی کارت: همان فرمولِ نوارِ DOM (جمعِ ۵
    // خانواده؛ داستان جدا در چیپ) با inThisWeekِ صریح — همیشه تغذیه میشود
    // (فعالیتِ صفرِ صادق، هم‌قراردادِ چیپها)
    weekPerDay: digest.perDay.map((p) => ({
      total: p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush,
      inThisWeek: p.inThisWeek,
    })),
    duelLine:
      digest.duels && digest.duels.thisWeek > 0
        ? `${faNum(digest.duels.thisWeek)}${digest.duels.truncated ? "+" : ""} نبرد واژگانی این هفته — ${faNum(digest.duels.win)} برد، ${faNum(digest.duels.loss)} باخت${digest.duels.tie > 0 ? `، ${faNum(digest.duels.tie)} مساوی` : ""}`
        : undefined,
    // r285 — همان ارزیابیِ واحدِ نوارِ نشانها به کارتِ PNG هم میرسد؛
    // هیچ ارزیابیِ دومی وجود ندارد — آرایه از unlockedBadgesِ همین رندر میآید.
    badges: unlockedBadges.map((b) => ({ title: b.title, tier: b.tier })),
  });

  const saveWeeklyImage = async () => {
    if (imgBusy) return;
    setImgBusy(true);
    const ok = await downloadWeeklyImage(weeklyImageOpts());
    setImgBusy(false);
    // r397 — the failure pair borrows the named owner (imageFailToast);
    // the success toast stays this gate's own dialect.
    if (ok) {
      toast({ title: "🖼 عکسِ هفته‌نامه ذخیره شد", description: "کارتِ هفتگیت آمادهٔ فرستادن است.", duration: 3000 });
    } else {
      imageFailToast();
    }
  };

  // r306 — هم‌رسانیِ بومیِ کارتِ هفته‌نامه با قراردادِ share-card (r102):
  // فقط با canShare({files}) واقعی؛ لغوِ کاربر خطا نیست (ساکت)؛
  // پشتیبانی‌نشدن پیامِ صادقانهِ «ذخیره کن و خودت بفرست» دارد.
  const [shareBusy, setShareBusy] = useState(false);
  const shareWeeklyImage = async () => {
    if (shareBusy || imgBusy) return;
    setShareBusy(true);
    const blob = await buildWeeklyBlob(weeklyImageOpts());
    let outcome: ShareOutcome = "failed";
    if (blob) {
      trackEvent("weekly_image");
      outcome = await shareImageFile({
        file: blobToFile(blob, "vision2-weekly.png"),
        title: "هفته‌نامهٔ پیشرفت — وب‌کتاب ویژن ۲",
        text: `هفته‌نامهٔ پیشرفتم: ${faNum(digest.thisWeek.activities)} فعالیت این هفته`,
      });
    }
    setShareBusy(false);
    if (outcome === "shared") {
      toast({ title: "📨 هفته‌نامه هم‌رسانی شد", description: "کارت با شیتِ خودِ سیستم فرستاده شد.", duration: 3000 });
    } else if (outcome === "failed") {
      toast({ title: "هم‌رسانی ممکن نشد", description: "می‌توانی عکس را ذخیره کنی و خودت بفرستی.", duration: 3000 });
    }
    // cancelled — کاربر لغو کرد؛ خطا نیست، ساکت (قراردادِ share-card)
  };

  return (
    <div className="report-digest rounded-xl border border-stone-200 c-stone-70 p-3.5">
      {/* r315 — flex-wrap: سنجشِ واقعیِ ۳۹۰px قبل از تغییر ۱۱px سرریزِ پنهان داشت
          (سرستونِ sw=297 در برابرِ cw=286 — دکمهٔ آخر ۱۱px داخلِ پدینگ میرفت)؛
          خوشهٔ دکمه‌ها در موبایل به سطرِ دوم می‌رود — دسکتاپ بی‌تغییر (۳۹۲ < ۴۴۰). */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
          <Sparkles size={13} className="text-teal-600" />
          هفته‌نامهٔ پیشرفت
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
            {faNum(digest.thisWeek.activities)} فعالیت این هفته
          </span>
          {/* Task 104 — عکسِ هفته‌نامه: آیکنِ خانوادهٔ خروجی‌ها (هم‌الگوی دفترچهٔ نبرد) */}
          <button
            onClick={saveWeeklyImage}
            disabled={imgBusy}
            aria-label="گرفتن عکس هفته‌نامهٔ پیشرفت"
            title="عکسِ هفته‌نامه — یک کارت PNG برای هم‌رسانی"
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-teal-600 disabled:opacity-50"
          >
            {imgBusy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <ImageDown size={15} aria-hidden />}
          </button>
          {/* r306 — هم‌رسانیِ بومیِ همان کارت: دو دروازهٔ یک ارزیابی (duel-done الگو)؛
              لغوِ کاربر ساکت، پشتیبانی‌نشدن پیامِ صادقانه */}
          <button
            onClick={shareWeeklyImage}
            disabled={shareBusy || imgBusy}
            aria-label="هم‌رسانی عکس هفته‌نامهٔ پیشرفت"
            title="هم‌رسانیِ کارتِ هفته‌نامه با شیتِ خودِ سیستم"
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-teal-600 disabled:opacity-50"
          >
            {shareBusy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Share2 size={15} aria-hidden />}
          </button>
          {/* تسک ۱۷۸ — خروجیِ CSVِ ۳۵روزه (بازسازیِ ۱۶۹) — هم‌الگوی عکس؛ بدونِ busy چون همگام است؛
              r314 — tooltip زبانِ ۱۰ستونیِ دو ستونِ هفت‌روزه را می‌نامد */}
          <button
            onClick={saveCsv}
            aria-label="دانلود جدول CSV پیشرفت"
            title="خروجیِ CSV — جدولِ ۳۵روزهٔ فعالیت با جمعِ هفت‌روزه و تفاوت با هفت‌روزهٔ پیش"
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-teal-600"
          >
            <FileDown size={15} aria-hidden />
          </button>
          {/* تسک ۱۷۸ — روندِ ۴هفته‌ای: هر هفته یک سطر برای معلم؛
              r313 — tooltip ستونِ تفاوتِ r311 را هم می‌نامد */}
          <button
            onClick={saveTrendCsv}
            aria-label="دانلود روند ۴هفته‌ای CSV"
            title="روندِ ۴هفته‌ای CSV — هر هفته یک سطر با تفاوت با هفتهٔ پیش، روزهای فعال و هدف"
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-teal-600"
          >
            <BarChart3 size={15} aria-hidden />
          </button>
          {/* r305 — ماه‌نامهٔ خواندن CSV: ستونِ داستان‌ها تا امروز در هیچ خروجی‌ای نبود؛
              r313 — tooltip هم‌زبانِ ستونهایِ واقعی شد (r311/r312 ستونهای تازه را می‌نامد) */}
          <button
            onClick={saveMonthCsv}
            aria-label="دانلود ماه‌نامهٔ خواندن CSV"
            title="ماه‌نامهٔ خواندن CSV — ۳۰ سطرِ روزانهٔ داستان با جمعِ فزاینده، جمعِ هفت‌روزه و تفاوت با هفت‌روزهٔ پیش"
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-teal-600"
          >
            <CalendarDays size={15} aria-hidden />
          </button>
        </div>
      </div>

      {/* r313 — برچسبِ ستونهایِ خروجیهایِ اکسل همان‌جای دکمهها: معلمِ اکسلخوان
          پیش از دانلود میداند هر فایل چند ستون و چه ستونهای تازهای دارد
          (r311: تفاوت با هفتهٔ پیش در روند / r312: دو ستونِ هفت‌روزه در ماه‌نامه / r314: دو ستونِ هفت‌روزه در جدولِ ۳۵روزه)؛
          aria==title هم‌قراردادِ دستور رنگ‌ها */}
      <div
        className="report-csv-hint mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg c-veil-60 px-2.5 py-2"
        title="ستونهایِ خروجیهایِ اکسل"
        aria-label="ستونهایِ خروجیهایِ اکسل"
      >
        <span className="flex items-center gap-1 text-[9.5px] font-extrabold text-stone-500">
          <FileDown size={11} className="text-teal-600" aria-hidden />
          خروجیهایِ اکسل:
        </span>
        <span
          className="text-[9.5px] font-bold text-stone-500"
          title="جدولِ ۳۵روزه — ۱۰ ستون: تاریخ، روز هفته، پنج شمارنده، مجموع، جمعِ هفت‌روزه، تفاوت با هفت‌روزهٔ پیش"
        >
          ۳۵روزه: ۱۰ ستون (با جمعِ هفت‌روزه و تفاوتش)
        </span>
        <span
          className="text-[9.5px] font-bold text-stone-500"
          title="روندِ ۴هفته‌ای — ۱۱ ستون: پنج شمارنده، مجموع، تفاوت با هفتهٔ پیش، روزهای فعال و هدف"
        >
          روندِ ۴هفته‌ای: ۱۱ ستون (با تفاوت با هفتهٔ پیش)
        </span>
        <span
          className="text-[9.5px] font-bold text-stone-500"
          title="ماه‌نامهٔ خواندن — ۶ ستون: تاریخ، روز هفته، داستانها، جمعِ فزاینده، جمعِ هفت‌روزه، تفاوت با هفت‌روزهٔ پیش"
        >
          ماه‌نامهٔ خواندن: ۶ ستون (با جمعِ هفت‌روزه و تفاوتش)
        </span>
      </div>

      {/* delta chips — this week vs the one before */}
      <div className="mb-3 flex gap-2">
        {DELTA_META.map((m) => {
          const d = digest.deltas.find((x) => x.field === m.field)!;
          return <DeltaChip key={m.field} d={d} label={m.label} cls={m.cls} />;
        })}
      </div>

      {/* Task 186 — گامِ بعدی: پیشنهادِ کانونیِ صادق در یک نگاه، بالایِ دایجست؛
          هم‌خانوادهٔ ردیف‌های نیمه‌شفافِ همین گزارش و چیپِ سبزِ هدف (c-chip-goal) —
          aria==title هم‌قراردادِ دفتر یخ */}
      <div
        className="next-step-band mb-3 rounded-lg c-veil-60 px-2.5 py-2"
        title={
          nextStep
            ? `گام بعدی — نخستین گامِ تلاش‌نشده در ترتیبِ کانونی: ${nextStep.label} درس ${faNum(nextStep.lessonId)}`
            : "گام بعدی — هر ۱۸ گامِ درس‌به‌درس تلاش شده؛ مرورِ هوشمند را ادامه بده"
        }
        aria-label={
          nextStep
            ? `گام بعدی — نخستین گامِ تلاش‌نشده در ترتیبِ کانونی: ${nextStep.label} درس ${faNum(nextStep.lessonId)}`
            : "گام بعدی — هر ۱۸ گامِ درس‌به‌درس تلاش شده؛ مرورِ هوشمند را ادامه بده"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-stone-600">
            <Compass size={12} className="text-emerald-600" aria-hidden />
            گام بعدی
          </div>
          {nextStep ? (
            <span className="c-chip-goal inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9.5px] font-black">
              {`درس ${faNum(nextStep.lessonId)} · ${nextStep.label}`}
            </span>
          ) : (
            <span className="c-chip-goal inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9.5px] font-black">
              <Check size={9} aria-hidden />
              همهٔ گام‌ها پوشیده
            </span>
          )}
        </div>
      </div>

      {/* r284 — نوار نشان‌ها: پاسخِ «تا کجا رسیده‌ام؟» در هفته‌نامه — هم‌ارزیابیِ
          رسمی (سرشماریِ واحدِ use-badge-census) و هم‌چیپِ تیر با کارنامه (TIER_CHIPِ واحد).
          بی‌نشان هم صادق: یک خطِ خنثی، نه حذفِ نوار — هم‌قراردادِ گامِ بعدی. */}
      <div className="badge-band mb-3 rounded-lg c-veil-60 px-2.5 py-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-stone-600">
            <Award size={12} className="text-emerald-600" aria-hidden />
            نشان‌های من
          </div>
          <span className="c-chip-goal inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9.5px] font-black">
            {badgeFractionFa(unlockedBadges.length)}
          </span>
        </div>
        {unlockedBadges.length === 0 ? (
          <p className="mt-1 text-[10px] font-bold leading-5 text-stone-500">
            هنوز نشانی باز نشده — با ادامهٔ تمرین روزانه نشان‌ها همین‌جا هم می‌آیند.
          </p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {unlockedBadges.map((b) => (
              <span
                key={b.id}
                title={b.desc}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-black ${TIER_CHIP[b.tier]}`}
              >
                <Award size={10} aria-hidden />
                {b.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* r297 — نوار کتاب‌خانه: داستان‌های این هفته + پیشرفت کل سه‌گانه.
          هم‌پنجرهٔ ۷روزهٔ دایجست؛ شمارش از storiesReadSince (منبعِ یگانه با
          کارتِ «ادامهٔ خواندن» و چیپِ نمودار) — بی‌داده هم صادق: خطِ خنثی،
          نه حذفِ نوار — هم‌قراردادِ نوارِ نشان‌ها. */}
      <div className="library-band mb-3 rounded-lg c-veil-60 px-2.5 py-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-stone-600">
            <BookMarked size={12} className="text-teal-600" aria-hidden />
            کتاب‌خانهٔ داستان‌ها
          </div>
          <span className="c-chip-goal inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9.5px] font-black">
            {`${faNum(weekReads.count)} داستان این هفته · ${faNum(Object.keys(libraryDone).length)} از ${faNum(HILL_TOTAL_STORIES)} کل`}
          </span>
        </div>
        {/* r302 — سطرِ زنجیره: سه حالتِ صادقِ هم‌معنایِ کارتِ خانه؛ بی‌سابقه
            نمایش داده نمیشود تا خطِ نخستِ بی‌داده شلوغ نشود */}
        {(readStreak.current > 0 || readStreak.longest > 0) && (
          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold leading-5 text-stone-500">
            <Flame
              size={11}
              aria-hidden
              className={readStreak.readToday ? "text-amber-500" : "text-stone-500"}
            />
            <span>
              {readStreak.current > 0
                ? `زنجیرهٔ خواندن — ${faNum(readStreak.current)} روز${readStreak.readToday ? "" : " — امروز بخوان تا ننشیند"}`
                : `زنجیرهٔ خواندن قطع شده${readStreak.longest > 1 ? ` — رکورد: ${faNum(readStreak.longest)} روز` : " — با یک داستان از نو شروع کن"}`}
              {readStreak.current > 0 && readStreak.longest > readStreak.current
                ? ` · رکورد: ${faNum(readStreak.longest)} روز`
                : ""}
            </span>
          </div>
        )}
        {/* r304 — ماه‌نامهٔ خواندن: نوارِ ۳۰روزه (شاملِ امروز)؛ کهنه در راست
            (جریانِ زمانِ RTL)، امروز در چپ با حلقه؛ بی‌سابقه مخفی (سیاستِ r302).
            گریدِ ۳۰ستونیِ minmax(0,1fr) — در ۳۹۰px هر خانه ~۹px، بی‌سرریز.
            خانه‌ها با utilitiesِ همین‌جا (درسِ بودجهٔ سلکتورِ r304: خانوادهٔ
            تازه = CSSِ تازه نیست؛ سطحِ خالی از کلاسِ trackِ معنایی است و
            تاریکش با kernel)؛ data-level صرفاً قلابِ QA است. */}
        {!month.empty && (
          <div className="mt-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold leading-5 text-stone-500">
              <CalendarClock size={11} aria-hidden className="text-amber-600" />
              <span>
                {`ماهِ گذشته: ${faNum(month.total)} داستان در ${faNum(month.activeDays)} روز`}
                {month.best && month.best.count > 1
                  ? ` · پرکارترین: ${faNum(month.best.count)} داستان`
                  : ""}
              </span>
            </div>
            <div
              className="mt-1 grid h-2 gap-[2px]"
              style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}
              role="img"
              aria-label={`ماه‌نامهٔ خواندن: ${faNum(month.total)} داستان در ${faNum(month.activeDays)} روزِ فعال`}
            >
              {month.perDay.map((d) => {
                const today = d.day === daysAgoKey(0);
                return (
                  <span
                    key={d.day}
                    title={`${d.day} · ${faNum(d.count)} داستان`}
                    data-level={d.count >= 3 ? "3" : String(d.count)}
                    data-today={today ? "1" : undefined}
                    className={`rounded-[2px] ${
                      d.count >= 3
                        ? "bg-amber-600 dark:bg-amber-500"
                        : d.count === 2
                          ? "bg-amber-400 dark:bg-amber-400/60"
                          : d.count === 1
                            ? "bg-amber-200 dark:bg-amber-200/35"
                            : "c-track-60"
                    }${today ? " ring-1 ring-inset ring-amber-700/55 dark:ring-amber-300/70" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        )}
        {weekReads.count === 0 ? (
          <p className="mt-1 text-[10px] font-bold leading-5 text-stone-500">
            {Object.keys(libraryDone).length === 0
              ? "هنوز داستانی نخوانده‌ای — کتاب‌خانهٔ داستان‌های دکتر هیل از ابزارهای خانه در دسترس است."
              : "این هفته داستانِ تازه‌ای نخوانده‌ای — داستانِ بعدیِ تو منتظر است."}
          </p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {weekReads.ids.map((id) => {
              const st = storyById(id);
              return (
                <span
                  key={id}
                  title={st ? st.title : id}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[9.5px] font-black text-teal-700"
                >
                  <BookMarked size={10} aria-hidden />
                  <span dir="ltr">{st ? st.title : id}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 14-day strip: last week outlined, this week solid */}
      <div className="mb-1 flex h-16 items-end gap-[3px]" dir="ltr" aria-hidden>
        {digest.perDay.map((p, i) => {
          const total = p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush;
          const isToday = p.day === today;
          // نشانِ یخ (Task 79) — روزِ غیبتِ نجات‌خورده حلقهٔ آسمانی می‌گیرد؛
          // ثبت‌ها همیشه پیش از امروز‌اند پس با حلقهٔ زمردیِ امروز برخورد نمی‌کند
          const mark = freezeDayMark(p.day, freezeUsedDays);
          return (
            <motion.div
              key={p.day}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(total > 0 ? 10 : 3, (total / maxTotal) * 44)}px` }}
              transition={{ delay: i * 0.02, duration: 0.35, ease: "easeOut" }}
              className={`flex-1 rounded-t-[4px] ${
                p.inThisWeek
                  ? total > 0
                    ? "bg-gradient-to-t from-teal-600 via-emerald-500 to-lime-400"
                    : "bg-emerald-200/60"
                  : total > 0
                    ? "bg-stone-300"
                    : "c-track-60"
              } ${
                isToday
                  ? "ring-2 ring-emerald-500/60 ring-offset-1"
                  : mark.saved
                    ? "ring-2 ring-sky-500/60 ring-offset-1"
                    : ""
              }`}
              title={`${faDayLabel(p.day)} — ${mark.saved ? mark.title : `${faNum(total)} فعالیت`}`}
            />
          );
        })}
      </div>
      <div className="mb-3 flex justify-between text-[9px] font-bold text-stone-500" dir="ltr">
        <span>{faDayLabel(digest.perDay[0].day)}</span>
        <span>هفتهٔ پیش | این هفته</span>
        {/* r315 — چیپِ «فعالیتِ امروز» جایِ برچسبِ خالیِ «امروز»: دقیقاً زیرِ
            خانهٔ آخرِ نوار (امروز در جریانِ LTRِ نوار راست‌ترین است) — عددش
            از همان perDay می‌آید و صفرِ صادق هم دیده میشود؛ فعال بودنش با
            زمردیِ خانوادهٔ حلقهٔ امروز (زبانِ دستورِ رنگها) و بیفعالیتش خنثی. */}
        <span
          title="فعالیتِ امروز تا این لحظه — همان خانهٔ آخرِ نوار با حلقهٔ زمردی"
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black ${
            todayTotal > 0 ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
          }`}
        >
          {`${faNum(todayTotal)} فعالیت امروز`}
        </span>
      </div>

      {/* goal dots — one per day of this week */}
      <div className="mb-3 flex items-center justify-between gap-2 rounded-lg c-veil-60 px-2.5 py-2">
        <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-stone-600">
          <CalendarHeart size={12} className="text-emerald-600" aria-hidden />
          هدف روزانه ({faNum(dailyGoal)})
        </div>
        <div className="flex items-center gap-1" dir="ltr">
          {digest.perDay
            .filter((p) => p.inThisWeek)
            .map((p) => {
              const met = goalMetDays.includes(p.day);
              // نشانِ یخ (Task 79) — اولویت: هدف کامل → نجاتِ یخ → فعال → خالی؛
              // روزِ نجات‌خورده ذاتاً بی‌فعالیت است — حلقهٔ آسمانی می‌گوید
              // «این روزِ خالی زنجیره را نشکست» (bg-sky-50 قاعدهٔ دارک دارد)
              const mark = freezeDayMark(p.day, freezeUsedDays);
              const active = p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush > 0;
              return (
                <span
                  key={p.day}
                  title={`${faWeekday(p.day)} — ${met ? "هدف کامل شد" : mark.saved ? mark.title : active ? "فعال ولی ناقص" : "بی‌فعالیت"}`}
                  className={`h-3.5 w-3.5 rounded-full border ${
                    met
                      ? "border-emerald-600 bg-emerald-500"
                      : mark.saved
                        ? "border-sky-500 bg-sky-50"
                        : active
                          ? "border-amber-400 bg-amber-200"
                          : "border-stone-300 bg-white"
                  }`}
                />
              );
            })}
        </div>
      </div>

      {/* دفتر یخ (Task 78) — هم‌خانوادهٔ ردیف نقطه‌های هدف؛ باند آسمانیِ همان چیپ هدر */}
      <div
        className="freeze-ledger mb-3 rounded-lg c-veil-60 px-2.5 py-2"
        title={ledger.title}
        aria-label={ledger.title}
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-stone-600">
            <Snowflake size={12} className="text-sky-700" aria-hidden />
            دفتر یخ
          </div>
          <div className="flex items-center gap-1">
            {/* چیپ‌های مخزن/نجات (Task 84) — مهاجرت به کلاسِ معناییِ c-chip-freeze
                (ترانش ۴ فاز ۱٫۵): ارزش‌ها عین همین بردار بودند — صفرِ انحراف.
                چیپِ «نجات امروز» پایین‌تر عامدانه خارج ماند: text-sky-700 و قاعدهٔ
                unlayered بر utilities برتری دارد — ترکیب می‌شکست. */}
            <span className="inline-flex items-center gap-0.5 rounded-full border c-chip-freeze px-1.5 py-0.5 text-[9.5px] font-black">
              {ledger.stockLabel}
            </span>
            {ledger.rescueLabel && (
              <span className="inline-flex items-center gap-0.5 rounded-full border c-chip-freeze px-1.5 py-0.5 text-[9.5px] font-black">
                <Check size={9} aria-hidden />
                {ledger.rescueLabel}
              </span>
            )}
            {/* تعمد (Task 84): «نجات امروز» بیرونِ مهاجرت ماند — text-sky-700
                قوی‌تر از sky-600ِ خانواده است و قاعدهٔ unlayered بر utilities
                برتری دارد؛ ترکیبِ c-chip-freeze + text-sky-700 می‌شکست */}
            {ledger.savedToday && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[9.5px] font-black text-sky-700">
                <Check size={9} aria-hidden />
                نجات امروز
              </span>
            )}
          </div>
        </div>
        {/* مسیر یخِ بعدی — هم‌زبان خطّ خانه؛ سقفِ پُر فقط متن */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-[9.5px] font-bold text-stone-500">مسیر یخِ بعدی</span>
          <div className="flex items-center gap-1.5">
            {ledger.earn.state !== "cap" && (
              <span className="flex gap-0.5" aria-hidden>
                {Array.from({ length: ledger.earn.needed }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-4 rounded-full ${i < ledger.earn.inWindow ? "bg-sky-500" : "c-track-70"}`}
                  />
                ))}
              </span>
            )}
            <span className="text-[9.5px] font-bold text-sky-700">{ledger.earn.label}</span>
          </div>
        </div>
      </div>

      {/* Task 103 — نبردهای واژگانی: خلاصهٔ صادقِ پنجرهٔ ۷روزه از دفترچه؛
          بدونِ دفترچه بلوک رندر نمی‌شود (صفرِ ساختگی ممنوع)؛ «+» یعنی شمارشِ
          حداقلی چون پنجره پرِ سقفِ ۱۵تاییِ دفترچه است */}
      {digest.duels && (
        <div
          className="duel-week mb-3 rounded-lg c-veil-60 px-2.5 py-2"
          aria-label={`نبردهای واژگانی — ${faNum(digest.duels.thisWeek)} نبرد این هفته`}
        >
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-stone-600">
              <Swords size={12} className="text-fuchsia-600" aria-hidden />
              نبردهای واژگانی
            </div>
            <span className="c-chip-duel inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9.5px] font-black">
              {`${faNum(digest.duels.thisWeek)}${digest.duels.truncated ? "+" : ""} نبرد این هفته`}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1">
              {([
                ["برد", digest.duels.win, "bg-emerald-500"],
                ["باخت", digest.duels.loss, "bg-rose-700"],
                ["مساوی", digest.duels.tie, "bg-amber-500"],
              ] as const).map(([label, n, dot]) => (
                <span
                  key={label}
                  className="c-chip-duel inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9.5px] font-black"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
                  {`${faNum(n)} ${label}`}
                </span>
              ))}
            </div>
            <span className="text-[9.5px] font-bold text-stone-500" title="نبردهای ۸ تا ۱۴ روز پیش">
              {`هفتهٔ پیش: ${faNum(digest.duels.lastWeek)}`}
            </span>
          </div>
          {/* نوارِ نرخِ برد — مسیرِ هم‌خانوادهٔ ردیف‌های دیگر + پرِ برندِ نبرد */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full c-track-60" aria-hidden>
              <div
                className="h-full rounded-full bg-gradient-to-l from-arcade-from to-arcade-to transition-[background-color,color,border-color,box-shadow,transform]"
                style={{ width: `${Math.max(0, Math.min(100, digest.duels.winRate))}%` }}
              />
            </div>
            <span className="text-[9.5px] font-bold text-fuchsia-600">{`نرخِ برد ${faNum(digest.duels.winRate)}٪`}</span>
          </div>
          {/* Task 109 — «فکرِ هفته»: میانگینِ وزن‌دار + سریع‌ترین لحظه از
              نبردهای فکردارِ همین هفته؛ بدونِ رکوردِ فکردار خط غایب است
              (زیرمجموعهٔ صادق — هم‌زبان چیپِ دفترچه و نشانِ چابکیِ ذهن) */}
          {digest.duels.think && (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5">
              <span
                className="flex items-center gap-1 text-[9.5px] font-bold text-stone-500"
                title={`میانگینِ فکر از ${faNum(digest.duels.think.seen)} سؤالِ ثبت‌شده در نبردهای فکردارِ این هفته`}
              >
                <Timer size={11} className="text-stone-500" aria-hidden />
                {`فکرِ میانگین ${secFa(digest.duels.think.avgMs)} ثانیه · سریع‌ترین ${secFa(digest.duels.think.fastestMs)} ثانیه`}
              </span>
              {digest.duels.think.seen < digest.duels.think.total && (
                <span className="text-[9.5px] font-bold text-stone-500">
                  {`ثبت برای ${faNum(digest.duels.think.seen)} از ${faNum(digest.duels.think.total)} سؤال`}
                </span>
              )}
            </div>
          )}
          {/* Task 113 — تاییدِ هفته‌نامه برای هفتهٔ چابک؛ زیرِ خطِ فکر، پیش از
              بهترینِ امتیاز — روایتِ همان خانواده‌ای که نشانش در کاشی‌هاست */}
          {digest.duels.quickWeek && <QuickWeekLine qw={digest.duels.quickWeek} />}
          {digest.duels.best > 0 && (
            <div className="mt-1 text-[9.5px] font-bold text-stone-500">
              {`بهترین امتیازِ همین هفته: ${faNum(digest.duels.best)}`}
            </div>
          )}
          {digest.duels.truncated && (
            <p className="mt-1 text-[9px] font-bold leading-4 text-stone-500">
              دفترچه فقط ۱۵ نبردِ آخر را نگه می‌دارد — این شمارش حداقلی است.
            </p>
          )}
        </div>
      )}

      {/* دستور رنگ‌ها (Task 80) — زبان بصری نقطه‌ها/نوارها یک‌جا آموزش داده
          می‌شود؛ نمونه‌ها دقیقاً همان کلاس‌های خود نقطه‌ها هستند تا رنگِ
          افسانه و رنگِ داده هرگز واگرا نشوند */}
      <div
        className="report-legend mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg c-veil-60 px-2.5 py-2"
        title="دستور رنگ‌های گزارش"
        aria-label="دستور رنگ‌های گزارش"
      >
        <span className="text-[9.5px] font-extrabold text-stone-500">دستور رنگ‌ها:</span>
        <span className="flex items-center gap-1 text-[9.5px] font-bold text-stone-500">
          <span className="h-2.5 w-2.5 rounded-full border border-emerald-600 bg-emerald-500" aria-hidden />
          هدف کامل
        </span>
        <span className="flex items-center gap-1 text-[9.5px] font-bold text-stone-500">
          <span className="h-2.5 w-2.5 rounded-full border border-amber-400 bg-amber-200" aria-hidden />
          فعال ولی ناقص
        </span>
        <span className="flex items-center gap-1 text-[9.5px] font-bold text-stone-500">
          <span className="h-2.5 w-2.5 rounded-full border border-sky-500 bg-sky-50" aria-hidden />
          نجات با یخ
        </span>
        {/* زبانِ نوار ۱۴روزه (Task 84) — نمونه‌ها دقیقاً همان کلاس‌های خودِ نوارها */}
        <span className="flex items-center gap-1 text-[9.5px] font-bold text-stone-500">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-gradient-to-t from-teal-600 via-emerald-500 to-lime-400" aria-hidden />
          فعالیت
        </span>
        <span className="flex items-center gap-1 text-[9.5px] font-bold text-stone-500">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-stone-300" aria-hidden />
          هفتهٔ پیش
        </span>
        <span className="flex items-center gap-1 text-[9.5px] font-bold text-stone-500">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-white ring-2 ring-emerald-500/60 ring-offset-1" aria-hidden />
          امروز
        </span>
      </div>

      {/* highlights */}
      {digest.highlights.length > 0 ? (
        <ul className="space-y-1">
          {digest.highlights.slice(0, 3).map((h, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] font-bold leading-5 text-stone-600">
              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] font-bold leading-5 text-stone-500">
          هنوز دادهٔ کافی برای هفته‌نامه نیست — از همین امروز با چند مرور شروع کن تا هفتهٔ بعد، گزارش پیشرفتت اینجا زنده شود.
          {streak > 0 ? " زنجیره‌ات همین حالا روشن است!" : ""}
        </p>
      )}
    </div>
  );
}
