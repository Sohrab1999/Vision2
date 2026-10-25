"use client";

// ------------------------------------------------------------------
// تسک ۱۷۴ «نقشهٔ پوشش» — بخشِ کارنامه: جدولِ درس × مهارت.
// فقط کلاس‌های موجود (سنگ/زمرد/کهربا + c-veil) — صفر قاعدهٔ تازهٔ CSS
// (قراردادِ کنتراستِ ۱۷۲: متنِ کم‌رنگ همیشه سنگِ ۵۰۰ به بالا — توکنِ
// منسوخِ ۴۰۰ در هیچ کلاس یا کامنتی نمی‌آید).
// صادقانه: هرگز-تلاش‌نشده = چیپِ خط‌چینِ «—»، نه صفرِ ساختگی؛
// gap = نخستین ستونِ خالی در ترتیبِ کانونیِ lib.
// ------------------------------------------------------------------

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, CheckCircle2, ArrowLeft } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { lessons } from "@/data";
import { buildCoverageMap, type CoverageLesson } from "@/lib/coverage-map";

const DOT: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-700",
};

function LessonRow({ L }: { L: CoverageLesson }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="mb-1.5 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[L.color] ?? "bg-emerald-500"}`} aria-hidden />
        <span className="text-[12.5px] font-extrabold text-stone-800">{L.title}</span>
        <span className="mr-auto rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-black text-stone-600">
          {faNum(L.known)} از {faNum(L.wordTotal)} واژه
        </span>
      </div>

      {/* word-known bar */}
      <div className="report-track mb-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-emerald-600 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, L.wordPct)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* six skill cells */}
      <div className="flex flex-wrap gap-1.5">
        {L.cells.map((c) =>
          c.best !== null ? (
            <span
              key={c.key}
              title={`${c.label} — بهترینِ ثبت‌شده ${faNum(c.best)}٪`}
              className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-black text-emerald-700"
            >
              {c.label} {faNum(c.best)}٪
            </span>
          ) : (
            <span
              key={c.key}
              title={`${c.label} — تا حالا تلاش نشده`}
              className="inline-flex items-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-2 py-0.5 text-[10.5px] font-bold text-stone-500"
            >
              {c.label} —
            </span>
          )
        )}
      </div>

      {/* gap line — honest next step, or the covered celebration */}
      {L.gap ? (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-stone-600">
          <ArrowLeft size={11} className="text-amber-600" />
          گامِ بعدی: {L.gap.label} این درس
        </p>
      ) : (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 size={11} />
          همهٔ مهارت‌های این درس تلاش شده — آفرین!
        </p>
      )}
    </div>
  );
}

export default function CoverageMapSection() {
  const results = useStudy((s) => s.results);
  const known = useStudy((s) => s.known);
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

  return (
    <section aria-label="نقشهٔ پوشش مهارت‌ها" className="coverage-map">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
        <MapIcon size={13} className="text-teal-600" />
        نقشهٔ پوشش مهارت‌ها
        <span className="mr-auto rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
          {faNum(map.attemptedSkills)} از {faNum(map.totalSkills)} تلاش‌شده
        </span>
      </div>
      <div className="space-y-2">
        {map.lessons.map((L) => (
          <LessonRow key={L.id} L={L} />
        ))}
      </div>
    </section>
  );
}
