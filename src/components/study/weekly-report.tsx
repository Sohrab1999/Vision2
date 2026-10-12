"use client";

// ------------------------------------------------------------------
// Task-37 «هفته‌نامهٔ پیشرفت» — the week-over-week digest band inside
// the report card. This week (7 days) vs the one before it, per-day
// bars, goal dots and Persian highlights — all derived from the pure
// computeWeeklyDigest() contract (unit-tested in weekly-digest.test).
// Renders inside .report-paper so the print stylesheet covers it too.
// ------------------------------------------------------------------

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingDown, TrendingUp, Minus, CalendarHeart, Check, Snowflake } from "lucide-react";
import { useStudy, daysAgoKey } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { computeWeeklyDigest, faWeekday, faDayLabel, type Delta } from "@/lib/weekly-digest";
import { freezeDayMark, freezeLedgerMeta } from "@/lib/freeze-badge";

const DELTA_META: { field: Delta["field"]; label: string; cls: string }[] = [
  { field: "reviews", label: "مرور", cls: "text-amber-600" },
  { field: "quizzes", label: "آزمون", cls: "text-emerald-600" },
  { field: "words", label: "واژهٔ نو", cls: "text-teal-600" },
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

export default function WeeklyReportSection() {
  const dayHistory = useStudy((s) => s.dayHistory);
  const history = useStudy((s) => s.history);
  const goalMetDays = useStudy((s) => s.goalMetDays);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const streak = useStudy((s) => s.streak);
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeSavedDay = useStudy((s) => s.freezeSavedDay);
  const freezeUsedDays = useStudy((s) => s.freezeUsedDays);
  const freezeEarnedDay = useStudy((s) => s.freezeEarnedDay);

  const digest = useMemo(
    // the digest window ends "today"; daysAgoKey(0) is the exported wall-clock
    // day key. The memo re-runs when the store's dayHistory changes — exactly
    // when the digest must.
    () => computeWeeklyDigest({ dayHistory, history, goalMetDays }, daysAgoKey(0)),
    [dayHistory, history, goalMetDays]
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

  const maxTotal = Math.max(1, ...digest.perDay.map((p) => p.stat.reviews + p.stat.quizzes + p.stat.words + p.stat.dictation + p.stat.rush));
  const today = daysAgoKey(0);

  return (
    <div className="report-digest rounded-xl border border-stone-200 c-stone-70 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
          <Sparkles size={13} className="text-teal-600" />
          هفته‌نامهٔ پیشرفت
        </div>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
          {faNum(digest.thisWeek.activities)} فعالیت این هفته
        </span>
      </div>

      {/* delta chips — this week vs the one before */}
      <div className="mb-3 flex gap-2">
        {DELTA_META.map((m) => {
          const d = digest.deltas.find((x) => x.field === m.field)!;
          return <DeltaChip key={m.field} d={d} label={m.label} cls={m.cls} />;
        })}
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
                    : "bg-stone-200/60"
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
      <div className="mb-3 flex justify-between text-[9px] font-bold text-stone-400" dir="ltr">
        <span>{faDayLabel(digest.perDay[0].day)}</span>
        <span>هفتهٔ پیش | این هفته</span>
        <span>امروز</span>
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
            <Snowflake size={12} className="text-sky-600" aria-hidden />
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
          <span className="text-[9.5px] font-bold text-stone-400">مسیر یخِ بعدی</span>
          <div className="flex items-center gap-1.5">
            {ledger.earn.state !== "cap" && (
              <span className="flex gap-0.5" aria-hidden>
                {Array.from({ length: ledger.earn.needed }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-4 rounded-full ${i < ledger.earn.inWindow ? "bg-sky-500" : "bg-stone-200/70"}`}
                  />
                ))}
              </span>
            )}
            <span className="text-[9.5px] font-bold text-sky-600">{ledger.earn.label}</span>
          </div>
        </div>
      </div>

      {/* دستور رنگ‌ها (Task 80) — زبان بصری نقطه‌ها/نوارها یک‌جا آموزش داده
          می‌شود؛ نمونه‌ها دقیقاً همان کلاس‌های خود نقطه‌ها هستند تا رنگِ
          افسانه و رنگِ داده هرگز واگرا نشوند */}
      <div
        className="report-legend mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg c-veil-60 px-2.5 py-2"
        title="دستور رنگ‌های گزارش"
        aria-label="دستور رنگ‌های گزارش"
      >
        <span className="text-[9.5px] font-extrabold text-stone-400">دستور رنگ‌ها:</span>
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
