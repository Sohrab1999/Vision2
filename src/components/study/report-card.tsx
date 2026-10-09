"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  ClipboardCheck,
  GraduationCap,
  Stamp,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStudy, lastNDays } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { BADGES, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";
import { skillBreakdown, barColorFor, skillGradeFa } from "@/lib/skill-stats";

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

export default function ReportCard() {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();

  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const history = useStudy((s) => s.history);
  const dayStat = useStudy((s) => s.dayStat);
  const streak = useStudy((s) => s.streak);
  const bestStreak = useStudy((s) => s.bestStreak);
  const mistakes = useStudy((s) => s.mistakes);
  const rushBest = useStudy((s) => s.rushBest);
  const rushBestCorrect = useStudy((s) => s.rushBestCorrect);
  const userName = useStudy((s) => s.userName);

  // global opener (from tool cards / skill panel)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-report", handler);
    return () => window.removeEventListener("open-report", handler);
  }, []);

  const evalInput = useMemo(
    () =>
      mounted
        ? buildEvalInput({ known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect })
        : null,
    [mounted, known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect]
  );
  const unlocked = useMemo(() => (evalInput ? unlockedBadgeIds(evalInput) : []), [evalInput]);
  const skills = useMemo(() => (mounted ? skillBreakdown(results) : []), [mounted, results]);
  const week = useMemo(() => (mounted ? lastNDays(7, history) : []), [mounted, history]);

  const knownCount = evalInput?.knownCount ?? 0;
  const weekQuizzes = week.reduce((s, d) => s + d.quizzes, 0);
  const weekReviews = week.reduce((s, d) => s + d.reviews, 0);
  const weekActive = week.filter((d) => d.total > 0).length;
  const avgPercent = useMemo(() => {
    const rs = Object.values(results);
    return rs.length ? Math.round(rs.reduce((s, r) => s + r.percent, 0) / rs.length) : 0;
  }, [results]);

  const records = [
    { icon: BookOpenCheck, label: "واژهٔ آموخته", value: faNum(knownCount), cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { icon: Award, label: "نشان کسب‌شده", value: `${faNum(unlocked.size)} از ${faNum(BADGES.length)}`, cls: "text-amber-600 bg-amber-50 border-amber-200" },
    { icon: Flame, label: "بهترین زنجیره", value: `${faNum(bestStreak)} روز`, cls: "text-orange-600 bg-orange-50 border-orange-200" },
    { icon: Zap, label: "رکورد چالش", value: `${faNum(rushBest)} امتیاز`, cls: "text-rose-600 bg-rose-50 border-rose-200" },
  ];

  const grade =
    knownCount >= 150 && avgPercent >= 70
      ? { title: "کارنامهٔ درخشان!", msg: "پیشرفتت واقعاً قابل تحسین است — همین مسیر را ادامه بده." }
      : knownCount > 0 || evalInput?.resultsCount
        ? { title: "در مسیر یادگیری", msg: "هر تمرین کوچک، تو را به تسلط کامل نزدیک‌تر می‌کند. امروز هم یک قدم بردار!" }
        : { title: "شروع یک سفر تازه", msg: "این کارنامه با اولین فعالیت تو پر می‌شود — از یک مرور کوتاه شروع کن." };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="report-dialog max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg nice-scroll">
        <DialogHeader className="sr-only">
          <DialogTitle>کارنامهٔ پیشرفت من</DialogTitle>
          <DialogDescription>گزارش جامع پیشرفت یادگیری در وب‌کتاب ویژن ۲</DialogDescription>
        </DialogHeader>

        {mounted && (
          <div className="report-paper relative overflow-hidden">
            {/* letterhead band */}
            <div className="report-band relative bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-500 px-5 pb-5 pt-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold opacity-80">
                    <CalendarDays size={11} />
                    {todayFa()}
                  </div>
                  <h3 className="mt-1 text-lg font-black">{grade.title}</h3>
                  <p className="mt-0.5 text-[12px] leading-5 opacity-90">
                    {userName ? `${userName} عزیز، ` : ""}{grade.msg}
                  </p>
                </div>
                <span className="report-stamp flex h-16 w-16 shrink-0 rotate-6 flex-col items-center justify-center rounded-full border-2 border-dashed border-white/50 text-center text-[8px] font-black leading-3 opacity-80">
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
                    <div className="text-[10px] font-bold opacity-75">{r.label}</div>
                  </div>
                ))}
              </div>

              {/* weekly band */}
              <div className="report-week rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
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

              {/* skills */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
                  <Activity size={13} className="text-violet-600" />
                  میانگین مهارت‌ها
                </div>
                {skills.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/60 px-3 py-5 text-center text-[11.5px] font-bold text-stone-400">
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
                        const label = key === "rush" ? "چالش برق‌آسا" : key === "exam" ? "آزمون جامع" : key === "final" ? "آزمون پایان ترم" : key.split(":").slice(1).join(":");
                        return (
                          <li key={key} className="flex items-center justify-between rounded-lg border border-stone-100 bg-white px-2.5 py-1.5">
                            <span className="text-[11.5px] font-bold text-stone-600">{label}</span>
                            <span className="text-[12px] font-black text-emerald-700" dir="ltr">
                              {faNum(r.percent)}٪ <span className="text-[10px] font-normal text-stone-400">({r.correct}/{r.total})</span>
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}

              {/* footer note */}
              <div className="report-foot flex items-center justify-between gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold leading-5 text-emerald-800">
                  <TrendingUp size={13} className="shrink-0" />
                  برای نمرهٔ بالاتر، هر روز ۱۰ دقیقه مرور هوشمند کن — کارنامهٔ هفتهٔ بعد تو اینجا بهتر دیده می‌شود.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
