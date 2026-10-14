"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Printer,
  X,
  FileText,
  GraduationCap,
  Flame,
  BookOpenCheck,
  Activity,
  Award,
  TrendingUp,
  Zap,
  Stamp,
  Sparkles,
  Lightbulb,
  User,
  Target,
  FileSpreadsheet,
} from "lucide-react";
import {
  useStudy,
  lastNDays,
  mistakesOfLesson,
  srsDueCount,
  knownCountOfLesson,
  daysAgoKey,
} from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { useEscape } from "@/hooks/use-keyboard";
import { faNum } from "@/lib/study-theme";
import { LESSONS_META, TOTAL_VOCABULARY } from "@/data/lesson-meta";
import { BADGES, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";
import { skillBreakdown, barColorFor, skillGradeFa } from "@/lib/skill-stats";
import { buildCoverageMap, COVERAGE_SKILLS } from "@/lib/coverage-map";
import { COVERAGE_SKILL_SHORT, heatSummary } from "@/lib/coverage-heat";
import { downloadCoverageCsv, coverageStatus } from "@/lib/coverage-csv";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import type { BadgeTier } from "@/lib/achievements";

// ------------------------------------------------------------------
// گزارش رسمی چاپی (PDF) — A4 paper for the teacher / parents.
// Opened from the report-card dialog via the global "open-official-
// report" event. Rendered through a portal to <body> so the print
// stylesheet can hide the whole app and paginate the paper cleanly
// across multiple A4 pages. All colors use dedicated .or-* classes
// (immune to dark-mode overrides) so the printed paper is always light.
// ------------------------------------------------------------------

function todayFa(): string {
  try {
    return new Date().toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return faNum(new Date().toLocaleDateString("en-GB"));
  }
}

// task 184 — «وضعیت» cell of the per-lesson table: the 180/181 ladder
// (تلاش‌نشده/ضعیف/خوب/عالی) read off the lesson AVERAGE. Thresholds come
// from the ONE canonical source — coverageStatus in coverage-csv.ts, the
// same function the r180 CSV exports — so a teacher sees identical tiers
// on paper and in Excel. Photocopy-safe like r181: the TEXT carries the
// signal (or-bad red / emerald die in a mono copy), and the untried row
// keeps the honest "—" instead of a fabricated zero.
function lessonStatusNode(avg: number | null) {
  if (avg === null) return <span className="font-bold text-stone-500">—</span>;
  const st = coverageStatus(avg);
  if (st === "عالی") return <span className="font-black text-emerald-700">عالی</span>;
  if (st === "ضعیف") return <span className="or-bad font-black">ضعیف</span>;
  return <span className="font-black">خوب</span>;
}

function printOfficial() {
  try {
    trackEvent("print_report");
    document.body.classList.add("print-official");
    const cleanup = () => document.body.classList.remove("print-official");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
    // safety net for browsers that never fire afterprint
    setTimeout(cleanup, 2000);
  } catch {
    document.body.classList.remove("print-official");
  }
}

const TIER_CHIP: Record<BadgeTier, string> = {
  bronze: "or-chip-bronze",
  silver: "or-chip-silver",
  gold: "or-chip-gold",
};

function gradeChipCls(avg: number): string {
  if (avg >= 85) return "or-chip-green";
  if (avg >= 70) return "or-chip-teal";
  if (avg >= 50) return "or-chip-amber";
  return "or-chip-rose";
}

export default function OfficialReport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useMounted();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const srs = useStudy((s) => s.srs);
  const mistakes = useStudy((s) => s.mistakes);
  const history = useStudy((s) => s.history);
  const streak = useStudy((s) => s.streak);
  const bestStreak = useStudy((s) => s.bestStreak);
  const rushBest = useStudy((s) => s.rushBest);
  const rushBestCorrect = useStudy((s) => s.rushBestCorrect);
  const rushGames = useStudy((s) => s.rushGames);
  const dayStat = useStudy((s) => s.dayStat);
  const userName = useStudy((s) => s.userName);
  const userId = useStudy((s) => s.userId);

  // opener lives in study-app (Task 44: lazy-mount on first use) — this
  // component is mounted only after the first "open-official-report" event.
  // lock background scroll while the paper is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes the paper (shared modal dismiss contract — useEscape گام ۶)
  useEscape(onClose, open);

  const knownCount = useMemo(
    () => (mounted ? Object.values(known).filter(Boolean).length : 0),
    [mounted, known]
  );

  // per-lesson rows for the official table
  const perLesson = useMemo(
    () =>
      mounted
        ? LESSONS_META.map((l) => {
            const prefix = `${l.id}:`;
            const entries = Object.entries(results).filter(([k]) => k.startsWith(prefix));
            const pcts = entries.map(([, r]) => r.percent);
            return {
              id: l.id,
              titleEn: l.titleEn,
              titleFa: l.titleFa,
              vocabKnown: knownCountOfLesson(known, l.id),
              vocabTotal: l.vocabCount,
              attempts: entries.length,
              avg: pcts.length ? Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length) : null,
              best: pcts.length ? Math.max(...pcts) : null,
              openMistakes: mistakesOfLesson(mistakes, l.id),
              srsTotal: Object.keys(srs).filter((k) => k.startsWith(prefix)).length,
              srsDue: srsDueCount(srs, l.id),
            };
          })
        : [],
    [mounted, known, results, srs, mistakes]
  );

  const skills = useMemo(() => (mounted ? skillBreakdown(results) : []), [mounted, results]);

  // skill coverage (task 176) — the task-174 lib reused on paper: which
  // lesson x skill cell was never attempted is exactly what a teacher needs
  // to see. Honest “—” for untried cells, no fabricated zeros.
  const coverage = useMemo(
    () =>
      mounted
        ? buildCoverageMap(
            results,
            known,
            LESSONS_META.map((l) => ({ id: l.id, title: l.titleFa, words: l.vocabCount }))
          )
        : null,
    [mounted, results, known]
  );
  const coverageHeat = useMemo(() => (coverage ? heatSummary(coverage.lessons) : null), [coverage]);

  // task 180 — coverage CSV export: third consumer of the 174/176 line and
  // sibling of the 169/178 CSV family (same BOM/CRLF/ASCII dialect), but a
  // tidy long table (one row per lesson x skill) so the teacher can
  // filter/pivot in Excel — the time-series files stay separate.
  const { toast } = useToast();
  const saveCoverageCsv = () => {
    const ok = coverage ? downloadCoverageCsv(coverage, daysAgoKey(0)) : false;
    trackEvent("coverage_csv");
    toast(
      ok
        ? { title: "🧭 CSV پوشش ذخیره شد", description: "هر سطر = یک مهارتِ یک درس — آمادهٔ فیلتر در اکسل.", duration: 3000 }
        : { title: "گزارش پوشش هنوز آماده نیست", description: "اول کمی تمرین کن تا نقشهٔ پوشش ساخته شود.", duration: 3000 }
    );
  };

  const evalInput = useMemo(
    () =>
      mounted
        ? buildEvalInput({ known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames })
        : null,
    [mounted, known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames]
  );
  const unlocked = useMemo<Set<string>>(
    () => (evalInput ? unlockedBadgeIds(evalInput) : new Set<string>()),
    [evalInput]
  );
  const unlockedBadges = useMemo(
    () => (unlocked.size > 0 ? BADGES.filter((b) => unlocked.has(b.id)) : []),
    [unlocked]
  );

  const month = useMemo(() => (mounted ? lastNDays(30, history) : []), [mounted, history]);
  const monthBuckets = useMemo(() => {
    if (month.length === 0) return [];
    const size = Math.ceil(month.length / 4);
    const out: { total: number; active: number }[] = [];
    for (let i = 0; i < month.length; i += size) {
      const chunk = month.slice(i, i + size);
      out.push({
        total: chunk.reduce((s, d) => s + d.total, 0),
        active: chunk.filter((d) => d.total > 0).length,
      });
    }
    return out;
  }, [month]);
  const monthMax = Math.max(1, ...monthBuckets.map((b) => b.total));
  const monthTotal = monthBuckets.reduce((s, b) => s + b.total, 0);
  const activeDays30 = month.filter((d) => d.total > 0).length;

  const avgPercent = useMemo(() => {
    const rs = Object.values(results);
    return rs.length ? Math.round(rs.reduce((s, r) => s + r.percent, 0) / rs.length) : 0;
  }, [results]);

  // one-line teacher-facing recommendation
  const advice = useMemo(() => {
    if (!mounted) return null;
    if (skills.length === 0)
      return {
        title: "شروع سفر یادگیری",
        text: "هنوز نتیجه‌ای ثبت نشده است. با یک تست کوتاه از درس اول شروع کنید تا این کارنامه پُر شود.",
      };
    const weakest = skills[skills.length - 1];
    if (weakest.avg < 70)
      return {
        title: "پیشنهاد تمرین",
        text: `تمرکز بیشتر روی «${weakest.def.label}» (میانگین ${faNum(weakest.avg)}٪) بیشترین اثر را در نمرهٔ بعدی خواهد داشت.`,
      };
    return {
      title: "وضعیت مطلوب",
      text: "میانگین همهٔ مهارت‌ها در وضعیت خوبی است — با مرور هوشمند روزانه همین روند حفظ شود.",
    };
  }, [mounted, skills]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="official-portal-root"
      role="dialog"
      aria-modal="true"
      aria-label="گزارش رسمی پیشرفت درسی"
    >
      <div
        className="official-overlay fixed inset-0 z-[80] overflow-y-auto p-4 nice-scroll sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* screen-only toolbar */}
        <div className="official-chrome mx-auto mb-4 flex max-w-[780px] flex-col gap-2 rounded-2xl border border-white/15 bg-stone-900/85 p-3 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[12px] font-bold leading-5 text-stone-200">
            <Lightbulb size={15} className="shrink-0 text-amber-300" />
            برای گرفتن PDF، در پنجرهٔ چاپ مقصد را «Save as PDF» انتخاب کنید.
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={saveCoverageCsv}
              aria-label="دانلود CSV پوشش مهارت‌ها"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[12px] font-black text-stone-100 transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-95"
            >
              <FileSpreadsheet size={14} />
              CSV پوشش
            </button>
            <button
              onClick={printOfficial}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[12px] font-black text-white shadow-sm transition-all hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-95"
            >
              <Printer size={14} />
              چاپ / ذخیرهٔ PDF
            </button>
            <button
              ref={closeRef}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[12px] font-black text-stone-100 transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-95"
            >
              <X size={14} />
              بستن
            </button>
          </div>
        </div>

        {/* ---------- the A4 paper ---------- */}
        <article className="official-report relative mx-auto max-w-[780px] rounded-2xl p-6 shadow-2xl sm:p-8">
          {/* letterhead */}
          <header className="or-band relative mb-5 flex items-start justify-between gap-3 overflow-hidden rounded-xl px-5 py-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold opacity-85">
                <GraduationCap size={14} />
                وب‌کتاب آموزشی ویژن ۲ — زبان انگلیسی ۲ (پایهٔ یازدهم)
              </div>
              <h2 className="mt-1.5 text-xl font-black">گزارش پیشرفت درسی</h2>
              <p className="mt-0.5 text-[11.5px] font-bold opacity-85">
                کارنامهٔ رسمی دانش‌آموز برای معلم و والدین
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <span className="or-stamp flex h-16 w-16 rotate-6 flex-col items-center justify-center rounded-full text-center text-[8px] font-black leading-3">
                <Stamp size={15} className="mb-0.5" />
                مهر
                <br />
                وب‌کتاب
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black">
                {todayFa()}
              </span>
            </div>
          </header>

          {/* student info */}
          <div className="or-kpi-neutral mb-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl px-4 py-3 text-[12px] font-bold">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-emerald-600" />
              نام: <span className="font-black">{userName ? userName : "دانش‌آموز ویژن ۲"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileText size={13} className="text-emerald-600" />
              کد یادگیرنده:{" "}
              <span className="font-black" dir="ltr">
                {userId ? userId.slice(0, 8).toUpperCase() : "—"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Flame size={13} className="text-orange-500" />
              زنجیرهٔ فعلی: <span className="font-black">{faNum(streak)} روز</span>
            </span>
          </div>

          {/* performance summary */}
          <section className="or-section-block mb-5">
            <h3 className="or-section mb-2.5 flex items-center gap-1.5 text-[13.5px] font-black">
              <Activity size={14} className="text-emerald-600" />
              خلاصهٔ عملکرد
            </h3>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="or-kpi rounded-xl p-3 text-center">
                <BookOpenCheck size={16} className="mx-auto mb-1 text-emerald-600" />
                <div className="or-kpi-value text-[16px] font-black leading-5">
                  {faNum(knownCount)} / {faNum(TOTAL_VOCABULARY)}
                </div>
                <div className="or-kpi-label text-[10px] font-bold">واژگان آموخته‌شده</div>
              </div>
              <div className="or-kpi rounded-xl p-3 text-center">
                <Award size={16} className="mx-auto mb-1 text-emerald-600" />
                <div className="or-kpi-value text-[16px] font-black leading-5">{faNum(avgPercent)}٪</div>
                <div className="or-kpi-label text-[10px] font-bold">میانگین نمرات</div>
              </div>
              <div className="or-kpi rounded-xl p-3 text-center">
                <TrendingUp size={16} className="mx-auto mb-1 text-emerald-600" />
                <div className="or-kpi-value text-[16px] font-black leading-5">{faNum(monthTotal)}</div>
                <div className="or-kpi-label text-[10px] font-bold">فعالیت ۳۰ روز اخیر</div>
              </div>
              <div className="or-kpi rounded-xl p-3 text-center">
                <Flame size={16} className="mx-auto mb-1 text-emerald-600" />
                <div className="or-kpi-value text-[16px] font-black leading-5">{faNum(bestStreak)} روز</div>
                <div className="or-kpi-label text-[10px] font-bold">بهترین زنجیرهٔ فعالیت</div>
              </div>
            </div>
          </section>

          {/* per-lesson table */}
          <section className="or-section-block mb-5">
            <h3 className="or-section mb-2.5 flex items-center gap-1.5 text-[13.5px] font-black">
              <BookOpenCheck size={14} className="text-emerald-600" />
              عملکرد درس‌به‌درس
            </h3>
            <div className="overflow-x-auto nice-scroll">
              <table className="or-table w-full min-w-[520px] text-[11.5px]">
                <thead>
                  <tr className="text-right">
                    <th className="px-2 py-1.5 font-black">درس</th>
                    <th className="px-2 py-1.5 text-center font-black">واژگان</th>
                    <th className="px-2 py-1.5 text-center font-black">آزمون‌ها</th>
                    <th className="px-2 py-1.5 text-center font-black">میانگین</th>
                    {/* task 184 — status ladder column, right beside its source (میانگین) */}
                    <th className="px-2 py-1.5 text-center font-black">وضعیت</th>
                    <th className="px-2 py-1.5 text-center font-black">بهترین</th>
                    <th className="px-2 py-1.5 text-center font-black">خطای باز</th>
                    <th className="px-2 py-1.5 text-center font-black">مرور هوشمند</th>
                  </tr>
                </thead>
              <tbody>
                {perLesson.map((r) => (
                  <tr key={r.id}>
                    <td className="px-2 py-1.5 font-black">
                      درس {faNum(r.id)}
                      <span className="mr-1 block text-[9.5px] font-bold opacity-70" dir="ltr">
                        {r.titleEn}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {faNum(r.vocabKnown)} / {faNum(r.vocabTotal)}
                    </td>
                    <td className="px-2 py-1.5 text-center">{faNum(r.attempts)}</td>
                    <td className="px-2 py-1.5 text-center font-black">
                      {r.avg === null ? "—" : `${faNum(r.avg)}٪`}
                    </td>
                    <td className="px-2 py-1.5 text-center">{lessonStatusNode(r.avg)}</td>
                    <td className="px-2 py-1.5 text-center">
                      {r.best === null ? "—" : `${faNum(r.best)}٪`}
                    </td>
                    <td className={`px-2 py-1.5 text-center font-black ${r.openMistakes > 0 ? "or-bad" : ""}`}>
                      {faNum(r.openMistakes)}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {r.srsTotal === 0 ? (
                        "—"
                      ) : (
                        <>
                          {faNum(r.srsTotal)} واژه
                          {r.srsDue > 0 && (
                            <span className="or-bad mr-1 text-[10px] font-black">
                              ({faNum(r.srsDue)} سررسید)
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
            <p className="or-foot mt-1.5 text-[10px] font-bold leading-4">
              «خطای باز» یعنی سؤال‌هایی که آخرین بار غلط پاسخ داده شده‌اند و هنوز دوباره تمرین نشده‌اند.
              وضعیتِ هر درس از میانگینِ همان درس خوانده می‌شود: زیرِ ۵۰ «ضعیف»، ۵۰ تا ۸۴ «خوب»، ۸۵ به بالا «عالی».
            </p>
          </section>

          {/* skills table */}
          <section className="or-section-block mb-5">
            <h3 className="or-section mb-2.5 flex items-center gap-1.5 text-[13.5px] font-black">
              <Sparkles size={14} className="text-emerald-600" />
              میانگین مهارت‌ها
            </h3>
            {skills.length === 0 ? (
              <div className="or-kpi-neutral rounded-xl px-3 py-4 text-center text-[11.5px] font-bold">
                هنوز نتیجه‌ای ثبت نشده است — با اولین تست، این جدول پر می‌شود.
              </div>
            ) : (
              <div className="overflow-x-auto nice-scroll">
                <table className="or-table w-full min-w-[400px] text-[11.5px]">
                  <thead>
                    <tr className="text-right">
                      <th className="px-2 py-1.5 font-black">مهارت</th>
                      <th className="px-2 py-1.5 text-center font-black">تعداد</th>
                      <th className="px-2 py-1.5 text-center font-black">بهترین</th>
                      <th className="px-2 py-1.5 font-black">میانگین</th>
                      <th className="px-2 py-1.5 text-center font-black">ارزیابی</th>
                    </tr>
                  </thead>
                <tbody>
                  {skills.map((s) => {
                    const g = skillGradeFa(s.avg);
                    return (
                      <tr key={s.def.id}>
                        <td className="px-2 py-1.5 font-black">{s.def.label}</td>
                        <td className="px-2 py-1.5 text-center">{faNum(s.attempts)}</td>
                        <td className="px-2 py-1.5 text-center">{faNum(s.best)}٪</td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="or-bar-track h-2 flex-1 overflow-hidden rounded-full">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.max(3, s.avg)}%`, backgroundColor: barColorFor(s.avg) }}
                              />
                            </div>
                            <span className="w-9 shrink-0 text-left text-[10.5px] font-black">{faNum(s.avg)}٪</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[9.5px] font-black ${gradeChipCls(s.avg)}`}>
                            {g.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            )}
          </section>

          {/* skill coverage (task 176) — teacher view: which skill was never attempted */}
          {coverage && coverageHeat && (
            <section className="or-section-block or-coverage mb-5">
              <h3 className="or-section mb-2.5 flex items-center gap-1.5 text-[13.5px] font-black">
                <Target size={14} className="text-emerald-600" />
                پوشش مهارت‌ها
                <span className="or-chip rounded-full px-2 py-0.5 text-[10px] font-black">
                  {faNum(coverageHeat.attemptedCells)} از {faNum(coverageHeat.totalCells)} تلاش‌شده
                </span>
              </h3>
              {coverage.attemptedSkills === 0 ? (
                <div className="or-kpi-neutral rounded-xl px-3 py-4 text-center text-[11.5px] font-bold">
                  هنوز هیچ مهارتی تلاش نشده — با اولین تست، این جدول پر می‌شود.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto nice-scroll">
                    <table className="or-table w-full min-w-[540px] text-[11.5px]">
                      <thead>
                        <tr className="text-right">
                          <th className="px-2 py-1.5 font-black">درس</th>
                          {COVERAGE_SKILLS.map((sk) => (
                            <th
                              key={sk.key}
                              title={sk.label}
                              className="px-2 py-1.5 text-center font-black"
                            >
                              {COVERAGE_SKILL_SHORT[sk.key] ?? sk.label}
                            </th>
                          ))}
                          <th className="px-2 py-1.5 font-black">گام بعدی</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coverage.lessons.map((L) => (
                          <tr key={L.id}>
                            <td className="px-2 py-1.5 font-black">درس {faNum(L.id)}</td>
                            {L.cells.map((c) =>
                              c.best === null ? (
                                <td
                                  key={c.key}
                                  title={`${c.label} — هنوز تلاش نشده`}
                                  className="px-2 py-1.5 text-center font-bold text-stone-500"
                                >
                                  —
                                </td>
                              ) : (
                                <td
                                  key={c.key}
                                  title={`${c.label} — بهترینِ ثبت‌شده ${faNum(c.best)}٪`}
                                  className={`px-2 py-1.5 text-center font-black ${c.best < 50 ? "or-bad" : ""}`}
                                >
                                  {faNum(c.best)}٪
                                  {/* task 181 — status ladder on paper: the r180 CSV
                                     tiers (ضعیف/عالی) duplicated as TEXT so the signal
                                     survives a mono photocopy where or-bad red dies. Mid
                                     band (50..84) stays bare — labels there would be noise. */}
                                  {c.best < 50 && (
                                    <span className="or-bad block text-[9px] font-black leading-3">ضعیف</span>
                                  )}
                                  {c.best >= 85 && (
                                    <span className="block text-[9px] font-black leading-3 text-emerald-700">عالی</span>
                                  )}
                                </td>
                              )
                            )}
                            <td
                              className={`px-2 py-1.5 text-[10.5px] font-black ${
                                L.covered ? "text-emerald-700" : "text-stone-500"
                              }`}
                            >
                              {L.covered ? "کامل" : L.gap?.label ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="or-foot mt-1.5 text-[10px] font-bold leading-4">
                    «—» یعنی این مهارت هنوز تلاش نشده است.
                    {coverageHeat.avgBest !== null &&
                      ` میانگینِ بهترینِ نمراتِ تلاش‌شده: ${faNum(coverageHeat.avgBest)}٪.`}
                  </p>
                </>
              )}
            </section>
          )}

          {/* monthly activity */}
          <section className="or-section-block mb-5">
            <h3 className="or-section mb-2.5 flex items-center gap-1.5 text-[13.5px] font-black">
              <TrendingUp size={14} className="text-emerald-600" />
              فعالیت ۳۰ روز اخیر (به تفکیک هفته)
            </h3>
            <div className="flex h-24 items-end gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3" dir="ltr">
              {monthBuckets.map((b, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-stone-500">{b.total > 0 ? faNum(b.total) : ""}</span>
                  <div
                    className={`w-full rounded-t-md ${b.total > 0 ? "or-weekbar" : "or-weekbar-empty"}`}
                    style={{ height: `${Math.max(b.total > 0 ? 10 : 4, (b.total / monthMax) * 52)}px` }}
                  />
                  <span className="text-[9.5px] font-bold text-stone-500">هفتهٔ {faNum(i + 1)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-orange-500" />
                رکورد چالش برق‌آسا: <span className="font-black">{faNum(rushBest)} امتیاز</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Activity size={12} className="text-emerald-600" />
                روزهای فعال در ۳۰ روز اخیر: <span className="font-black">{faNum(activeDays30)}</span>
              </span>
            </div>
          </section>

          {/* badges */}
          <section className="or-section-block mb-5">
            <h3 className="or-section mb-2.5 flex items-center gap-1.5 text-[13.5px] font-black">
              <Award size={14} className="text-emerald-600" />
              نشان‌های کسب‌شده
              <span className="or-chip rounded-full px-2 py-0.5 text-[10px] font-black">
                {faNum(unlockedBadges.length)} از {faNum(BADGES.length)}
              </span>
            </h3>
            {unlockedBadges.length === 0 ? (
              <div className="or-kpi-neutral rounded-xl px-3 py-4 text-center text-[11.5px] font-bold">
                هنوز نشانی باز نشده — با ادامهٔ تمرین روزانه نشان‌های بعدی باز می‌شوند.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {unlockedBadges.map((b) => (
                  <span
                    key={b.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-black ${TIER_CHIP[b.tier]}`}
                  >
                    <Award size={11} />
                    {b.title}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* advice */}
          {advice && (
            <section className="or-section-block mb-5">
              <div className="or-note flex items-start gap-2 rounded-xl px-4 py-3">
                <Lightbulb size={15} className="mt-0.5 shrink-0" />
                <p className="text-[12px] font-bold leading-5">
                  <span className="font-black">{advice.title}: </span>
                  {advice.text}
                </p>
              </div>
            </section>
          )}

          {/* signatures */}
          <section className="or-section-block mb-3 grid grid-cols-3 gap-3">
            {["امضای دانش‌آموز", "امضای معلم", "امضای والدین"].map((label) => (
              <div key={label} className="or-sign rounded-xl p-3 text-center">
                <div className="or-sign-line mx-auto mb-2 h-7 w-full max-w-[140px]" />
                <div className="text-[10.5px] font-black">{label}</div>
              </div>
            ))}
          </section>

          {/* paper footer */}
          <footer className="or-foot flex items-center justify-between border-t border-stone-100 pt-2.5 text-[9.5px] font-bold">
            <span>این گزارش به‌صورت خودکار از پیشرفت واقعی دانش‌آموز در وب‌کتاب ویژن ۲ ساخته شده است.</span>
            <span dir="ltr">Vision2 Webbook</span>
          </footer>

          {/* screen-only print button on the paper */}
          <div className="official-chrome mt-4 text-center">
            <button
              onClick={printOfficial}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-[12px] font-black text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95"
            >
              <Printer size={14} />
              چاپ / ذخیرهٔ PDF
            </button>
          </div>
        </article>
      </div>
    </div>,
    document.body
  );
}
