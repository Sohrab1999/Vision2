"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { finalKeyLabel } from "@/lib/domain/final-exam";
import {
  Award,
  BookOpenCheck,
  Flame,
  Zap,
  CalendarDays,
  Activity,
  ListChecks,
  RefreshCcw,
  Ear,
  SpellCheck,
  Pencil,
  Layers,
  Eraser,
  ArrowLeftRight,
  ClipboardCheck,
  GraduationCap,
  Stamp,
  TrendingUp,
  Trophy,
  Printer,
  FileText,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStudy, lastNDays } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { badgeFractionFa } from "@/lib/achievements"; // r387 — BADGES دیگر در این نما لازم نیست؛ کسر از مالک میآید
import { skillBreakdown, barColorFor, skillGradeFa } from "@/lib/skill-stats";
import { useBadgeCensus } from "@/hooks/use-badge-census";
import { monthVitalsOf, avgPercentOf } from "@/lib/report-vitals";
import WeeklyReportSection from "./weekly-report";
import CoverageMapSection from "./coverage-map";
import CoverageHeatmapSection from "./coverage-heatmap";

// ------------------------------------------------------------------
// کارنامهٔ من — a letter-style progress report dialog.
// Opened from the "پیشرفت من" tool card, the skill panel link, or the
// global "open-report" event. Summarizes records, the last 7 days and
// per-skill averages with a wax-stamp flourish.
// ------------------------------------------------------------------

const ICONS: Record<string, React.ElementType> = {
  BookOpenCheck,
  SpellCheck,
  Pencil,
  Ear,
  Layers,
  Eraser,
  ArrowLeftRight,
  ClipboardCheck,
  GraduationCap,
  Zap,
};

function todayFa(): string {
  try {
    return new Date().toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return faNum(new Date().toLocaleDateString("en-GB"));
  }
}

/** print only the report paper (body gets a temporary class + print CSS) */
function printReport() {
  try {
    document.body.classList.add("print-report");
    const cleanup = () => document.body.classList.remove("print-report");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
    // safety net for browsers that never fire afterprint
    setTimeout(cleanup, 2000);
  } catch {
    document.body.classList.remove("print-report");
  }
}

export default function ReportCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useMounted();

  // r382 — ممیزیِ دوقلوها: ۸ سیگنالِ فقطسرشماری به قلابِ خانواده کوچید؛
  // اینجا فقط سیگنالهایی میمانند که خودِ نما مستقیم میخواند.
  const results = useStudy((s) => s.results);
  const history = useStudy((s) => s.history);
  const bestStreak = useStudy((s) => s.bestStreak);
  const rushBest = useStudy((s) => s.rushBest);
  const userName = useStudy((s) => s.userName);

  // opener lives in study-app (Task 44: lazy-mount on first use) — this
  // component is mounted only after the first "open-report" event.
  // r382 — ارزیابیِ واحدِ نشانها از قلابِ خانواده (قرض از use-badge-census):
  // همان ۱۳ سیگنال + گیتِ هیدریشن — هیچ نسخهٔ محلیِ سرشماری مجاز نیست.
  const { evalInput, unlocked } = useBadgeCensus();
  const skills = useMemo(() => (mounted ? skillBreakdown(results) : []), [mounted, results]);
  const week = useMemo(() => (mounted ? lastNDays(7, history) : []), [mounted, history]);
  const month = useMemo(() => (mounted ? lastNDays(30, history) : []), [mounted, history]);

  const knownCount = evalInput?.knownCount ?? 0;
  const weekQuizzes = week.reduce((s, d) => s + d.quizzes, 0);
  const weekReviews = week.reduce((s, d) => s + d.reviews, 0);
  const weekActive = week.filter((d) => d.total > 0).length;

  // r382 — حیاتیِ ماهانه از موتورِ خانواده (report-vitals): ستونها + سقفِ
  // امن + جمعِ کل در یک قرارداد — «جمع کل» با ستونها همیشه همخوان میماند.
  const { buckets: monthBuckets, max: monthMax, total: monthTotal } = useMemo(
    () => monthVitalsOf(month),
    [month]
  );
  const avgPercent = useMemo(() => avgPercentOf(results), [results]);

  const records = [
    // r327 — جوهرهایِ -۶۰۰ رویِ زمینهٔ -۵۰ زیرِ ۴٫۵ میماندند (زنده با بوم:
    // زمرد ۲٫۵۲ · کهربا ۲٫۳۱ · نارنجی ۲٫۶ · رز ۴٫۱۲)؛ -۷۰۰ همه را بالایِ
    // ۴٫۸ میبرد و در تاریک کرنلِ متن (text-*-700 → روشن) خودش جوهرِ تاریک
    // را رویِ زمینهٔ تیرهٔ خانواده جابهجا میکند
    { icon: BookOpenCheck, label: "واژهٔ آموخته", value: faNum(knownCount), cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { icon: Award, label: "نشان کسب‌شده", value: badgeFractionFa(unlocked.size), cls: "text-amber-700 bg-amber-50 border-amber-200" },
    { icon: Flame, label: "بهترین زنجیره", value: `${faNum(bestStreak)} روز`, cls: "text-orange-700 bg-orange-50 border-orange-200" },
    { icon: Zap, label: "رکورد چالش", value: `${faNum(rushBest)} امتیاز`, cls: "text-rose-700 bg-rose-50 border-rose-200" },
  ];

  const grade =
    knownCount >= 150 && avgPercent >= 70
      ? { title: "کارنامهٔ درخشان!", msg: "پیشرفتت واقعاً قابل تحسین است — همین مسیر را ادامه بده." }
      : knownCount > 0 || evalInput?.resultsCount
        ? { title: "در مسیر یادگیری", msg: "هر تمرین کوچک، تو را به تسلط کامل نزدیک‌تر می‌کند. امروز هم یک قدم بردار!" }
        : { title: "شروع یک سفر تازه", msg: "این کارنامه با اولین فعالیت تو پر می‌شود — از یک مرور کوتاه شروع کن." };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="report-dialog max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg nice-scroll">
        <DialogHeader className="sr-only">
          <DialogTitle>کارنامهٔ پیشرفت من</DialogTitle>
          <DialogDescription>گزارش جامع پیشرفت یادگیری در وب‌کتاب ویژن ۲</DialogDescription>
        </DialogHeader>

        {mounted && (
          <div className="report-paper relative overflow-hidden">
            {/* letterhead band */}
            <div className="report-band relative bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-700 px-5 pb-5 pt-5 text-white">
              {/* r316 — gap-2: سنجشِ qa-r316-overflow-sweep این ردیف را ۳px سرریزِ
                  لبه-به-لبه نشان داد (min-contentِ متن + مهرِ ۶۴px + گپِ ۱۲ = عرضِ کانتینر
                  — برندهٔ تیغه)؛ ۴px نفسِ اضافه در هر دو viewport — مهرِ تزئینی با ۸px گپ سالم */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold opacity-95">
                    <CalendarDays size={11} />
                    {todayFa()}
                  </div>
                  <h3 className="mt-1 text-lg font-black">{grade.title}</h3>
                  <p className="mt-0.5 text-[12px] leading-5 opacity-95">
                    {userName ? `${userName} عزیز، ` : ""}{grade.msg}
                  </p>
                </div>
                <span className="report-stamp flex h-16 w-16 shrink-0 rotate-6 flex-col items-center justify-center rounded-full border-2 border-dashed border-white/60 text-center text-[9px] font-black leading-3 opacity-100">
                  <Stamp size={16} className="mb-0.5" />
                  مهر
                  <br />
                  وب‌کتاب
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* records */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {records.map((r) => (
                  <div key={r.label} className={`rounded-xl border p-2.5 text-center ${r.cls}`}>
                    <r.icon size={16} className="mx-auto mb-1" />
                    <div className="text-[15px] font-black leading-5">{r.value}</div>
                    {/* r329 — آلفایِ ۷۵٪ جوهرِ -۷۰۰ را زیرِ ۴٫۵ می‌برد (رزِ ۴٫۱۰،
                        کهربایِ ۳٫۱۸ — زنده با بوم)؛ آلفا حذف — جوهرهای -۷۰۰ رویِ
                        تینت‌های -۵۰ در آلفایِ کامل ≥۴٫۷ زندهسنجیده */}
                    <div className="text-[10px] font-bold">{r.label}</div>
                  </div>
                ))}
              </div>

              {/* weekly band */}
              <div className="report-week rounded-xl border border-stone-200 c-stone-70 p-3.5">
                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
                  <CalendarDays size={13} className="text-emerald-600" />
                  فعالیت هفت روز اخیر
                </div>
                <div className="flex items-center gap-4 text-center">
                  <div className="flex-1">
                    <div className="text-lg font-black text-stone-800">{faNum(weekQuizzes + weekReviews)}</div>
                    <div className="text-[10px] font-bold text-stone-500">فعالیت کل</div>
                  </div>
                  <div className="h-8 w-px bg-stone-200" />
                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-1 text-lg font-black text-stone-800">
                      <ListChecks size={14} className="text-emerald-600" />
                      {faNum(weekQuizzes)}
                    </div>
                    <div className="text-[10px] font-bold text-stone-500">تست و نگارش</div>
                  </div>
                  <div className="h-8 w-px bg-stone-200" />
                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-1 text-lg font-black text-stone-800">
                      <RefreshCcw size={14} className="text-amber-600" />
                      {faNum(weekReviews)}
                    </div>
                    <div className="text-[10px] font-bold text-stone-500">مرور فلش‌کارت</div>
                  </div>
                  <div className="h-8 w-px bg-stone-200" />
                  <div className="flex-1">
                    <div className="text-lg font-black text-stone-800">{faNum(weekActive)}</div>
                    <div className="text-[10px] font-bold text-stone-500">روز فعال</div>
                  </div>
                </div>
              </div>

              {/* Task-37 — هفته‌نامهٔ پیشرفت: week-over-week digest
                  r425 — پرشِ خانهٔ امروزِ نوارِ هفته: onLeaveReport کارنامه
                  را میبندد تا مقصدِ پرش (میزبانِ تمرین) زیرِ دیالوگ پنهان نماند */}
              <WeeklyReportSection onLeaveReport={onClose} />

              {/* monthly band */}
              {monthBuckets.length > 0 && (
                <div className="report-month rounded-xl border border-stone-200 c-stone-70 p-3.5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
                      <TrendingUp size={13} className="text-teal-600" />
                      فعالیت ۳۰ روز اخیر (به تفکیک هفته)
                    </div>
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
                      جمع کل: {faNum(monthTotal)}
                    </span>
                  </div>
                  <div className="flex h-24 items-end gap-2.5" dir="ltr">
                    {monthBuckets.map((b, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-stone-500">{b.total > 0 ? faNum(b.total) : ""}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(b.total > 0 ? 12 : 4, (b.total / monthMax) * 56)}px` }}
                          transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                          className={`w-full rounded-t-md ${
                            b.total > 0
                              ? "bg-gradient-to-t from-teal-600 via-emerald-500 to-lime-400"
                              : "c-track-70"
                          }`}
                          title={`${faNum(b.total)} فعالیت — ${faNum(b.active)} روز فعال`}
                        />
                        <span className="text-[9.5px] font-bold text-stone-500">هفتهٔ {faNum(i + 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* skills */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
                  <Activity size={13} className="text-violet-600" />
                  میانگین مهارت‌ها
                </div>
                {skills.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-stone-200 c-stone-60 px-3 py-5 text-center text-[11.5px] font-bold text-stone-500">
                    هنوز نتیجه‌ای ثبت نشده — با اولین تست این بخش پر می‌شود
                  </div>
                ) : (
                  <ul className="report-skills space-y-2.5">
                    {skills.map((s) => {
                      const Icon = ICONS[s.def.icon] ?? Activity;
                      const g = skillGradeFa(s.avg);
                      return (
                        <li key={s.def.id} className="flex items-center gap-2.5">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                            style={{ backgroundColor: s.def.color }}
                          >
                            <Icon size={12} />
                          </span>
                          <span className="w-20 shrink-0 text-[11.5px] font-extrabold text-stone-700">{s.def.label}</span>
                          <div className="report-track h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: barColorFor(s.avg) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(3, s.avg)}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>
                          <span className="w-9 shrink-0 text-left text-[11px] font-black text-stone-700">{faNum(s.avg)}٪</span>
                          <span className={`hidden shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black sm:block ${g.cls}`}>
                            {g.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* best results mini-list */}
              {Object.keys(results).length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
                    <Trophy size={13} className="text-amber-500" />
                    بهترین نتایج تو
                  </div>
                  <ul className="report-best space-y-1.5">
                    {Object.entries(results)
                      .sort((a, b) => b[1].percent - a[1].percent)
                      .slice(0, 3)
                      .map(([key, r]) => {
                        const label =
                          key === "rush"
                            ? "چالش برق‌آسا"
                            : key === "exam"
                              ? "آزمون جامع"
                              : (finalKeyLabel(key) ?? key.split(":").slice(1).join(":"));
                        return (
                          <li key={key} className="flex items-center justify-between rounded-lg border border-stone-100 bg-white px-2.5 py-1.5">
                            <span className="text-[11.5px] font-bold text-stone-600">{label}</span>
                            <span className="text-[12px] font-black text-emerald-700" dir="ltr">
                              {faNum(r.percent)}٪ <span className="text-[10px] font-normal text-stone-500">({r.correct}/{r.total})</span>
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}

              {/* تسک ۱۷۴ — نقشهٔ پوشش: درس × مهارت، شکافِ هرگز-تلاش‌نشده */}
              <CoverageMapSection />

              {/* تسک ۱۷۵ — نمایِ حرارتی: ماتریسِ فشردهٔ همان داده */}
              <CoverageHeatmapSection />

              {/* footer note */}
              <div className="report-foot flex flex-col gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold leading-5 text-emerald-800">
                  <TrendingUp size={13} className="shrink-0" />
                  برای نمرهٔ بالاتر، هر روز ۱۰ دقیقه مرور هوشمند کن — کارنامهٔ هفتهٔ بعد تو اینجا بهتر دیده می‌شود.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={printReport}
                    className="report-print-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-[11px] font-black text-emerald-700 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.96]"
                    aria-label="چاپ کارنامه"
                  >
                    <Printer size={13} />
                    چاپ کارنامه
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-official-report"))}
                    className="report-print-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-[11px] font-black text-emerald-700 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.96]"
                    aria-label="گزارش رسمی چاپی برای معلم"
                  >
                    <FileText size={13} />
                    گزارش رسمی چاپی (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
