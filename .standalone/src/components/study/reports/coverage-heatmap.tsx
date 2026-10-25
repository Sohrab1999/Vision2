"use client";

// ------------------------------------------------------------------
// تسک ۱۷۵ «گریدِ حرارتیِ پوشش» — ماتریسِ فشردهٔ درس × مهارت زیرِ نقشهٔ ۱۷۴.
// فقط کلاس‌های موجود (سنگ/کهربا/فیروزه/زمرد + c-veil) — صفر قاعدهٔ تازهٔ CSS
// (قراردادِ کنتراستِ ۱۷۲: متنِ کم‌رنگ همیشه سنگِ ۵۰۰ به بالا).
// سلول: نوارِ حرارت از classifyHeatِ خالص؛ سرد = خط‌چینِ «—» نه صفرِ ساختگی.
// ARIA: جدولِ واقعی با role و ردیف‌هایِ display:contents — الگویِ رسمیِ
// گرید؛ سرستون‌ها titleِ برچسبِ کامل را حمل می‌کنند.
// حرکت: پلکانیِ سلولی (ردیف×ستون) — با reduceMotion کاربر کلاً بی‌حرکت.
// ------------------------------------------------------------------

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { lessons } from "@/data";
import { buildCoverageMap, type CoverageCell } from "@/lib/coverage-map";
import {
  HEAT_BANDS,
  HEAT_COLD,
  COVERAGE_SKILL_SHORT,
  classifyHeat,
  heatSummary,
  type HeatBandId,
} from "@/lib/coverage-heat";

/** نقاشیِ هر نوار — همان خانواده‌ها در لِجند هم (یک زبانِ بصری) */
const CELL: Record<HeatBandId, string> = {
  cold: "border border-dashed border-stone-300 bg-stone-50 text-stone-500",
  faint: "border border-stone-200 bg-stone-100 text-stone-600",
  warming: "border border-amber-200 bg-amber-50 text-amber-700",
  strong: "border border-teal-200 bg-teal-50 text-teal-700",
  elite: "border border-emerald-700 bg-emerald-700 text-white shadow-sm",
};

function HeatCell({ c, delay, reduce }: { c: CoverageCell; delay: number; reduce: boolean }) {
  const band = classifyHeat(c.best);
  return (
    <motion.div
      role="cell"
      title={
        c.best !== null
          ? `${c.label} — بهترینِ ثبت‌شده ${faNum(c.best)}٪`
          : `${c.label} — تا حالا تلاش نشده`
      }
      className={`flex aspect-square items-center justify-center rounded-lg text-[10px] font-black ${CELL[band]}`}
      initial={reduce ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay }}
    >
      {c.best !== null ? faNum(c.best) : "—"}
    </motion.div>
  );
}

export default function CoverageHeatmapSection() {
  const results = useStudy((s) => s.results);
  const known = useStudy((s) => s.known);
  const reduceMotion = useStudy((s) => s.settings.reduceMotion);
  const mounted = useMounted();

  const map = useMemo(
    () =>
      mounted
        ? buildCoverageMap(
            results,
            known,
            lessons.map((l) => ({ id: l.id, title: l.titleFa, words: l.vocabulary.length }))
          )
        : null,
    [results, known, mounted]
  );

  if (!map) return null;
  const sum = heatSummary(map.lessons);

  return (
    <section aria-label="نمایِ حرارتیِ پوشش مهارت‌ها" className="coverage-heat">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
        <Flame size={13} className="text-amber-600" />
        نمایِ حرارتیِ پوشش
        <span
          className="mr-auto rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700"
          title="میانگینِ بهترینِ ثبت‌شده فقط رویِ سلول‌هایِ تلاش‌شده"
        >
          میانگینِ بهترین‌ها: {sum.avgBest !== null ? `${faNum(sum.avgBest)}٪` : "—"}
        </span>
      </div>

      <div
        role="table"
        aria-label="ماتریسِ حرارتِ درس × مهارت"
        className="grid grid-cols-[minmax(0,64px)_repeat(6,minmax(0,1fr))] items-center gap-1 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm sm:grid-cols-[auto_repeat(6,minmax(0,1fr))]"
      >
        <div role="row" className="contents">
          <div role="columnheader" className="text-right text-[9.5px] font-black text-stone-500">
            درس
          </div>
          {map.lessons[0]?.cells.map((sk) => (
            <div
              key={sk.key}
              role="columnheader"
              title={sk.label}
              className="text-center text-[9.5px] font-black text-stone-500"
            >
              {COVERAGE_SKILL_SHORT[sk.key] ?? sk.label}
            </div>
          ))}
        </div>

        {map.lessons.map((L, ri) => (
          <div key={L.id} role="row" className="contents">
            <div
              role="rowheader"
              title={L.title}
              className="truncate pr-1 text-right text-[10.5px] font-extrabold text-stone-700"
            >
              {L.title}
            </div>
            {L.cells.map((c, ci) => (
              <HeatCell key={c.key} c={c} delay={ri * 0.06 + ci * 0.025} reduce={reduceMotion} />
            ))}
          </div>
        ))}
      </div>

      {/* لِجند — از همان جدولِ HEAT_BANDS + سردِ مستقل (تک‌قرارداد) */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-1.5 py-0.5 text-[9.5px] font-bold text-stone-500">
          <span className={`h-2.5 w-2.5 rounded ${CELL.cold}`} aria-hidden />
          {HEAT_COLD.label}
        </span>
        {HEAT_BANDS.map((b) => (
          <span
            key={b.id}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-stone-600"
          >
            <span className={`h-2.5 w-2.5 rounded ${CELL[b.id]}`} aria-hidden />
            {b.label}
          </span>
        ))}
      </div>
    </section>
  );
}
