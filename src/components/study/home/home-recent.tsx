"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { lessonMetaById, lessonNameFa } from "@/data/lesson-meta";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { themeOf, faNum } from "@/lib/study-theme";
import { categoryLabel, globalResultLabel, globalResultTheme } from "./home-constants";

// «آخرین نتایج شما» — چهار رکورد اخیر با رنگ تم درس

export default function HomeRecent() {
  const results = useStudy((s) => s.results);
  const mounted = useMounted();

  const recentResults = mounted
    ? Object.entries(results)
        .sort((a, b) => (b[1].at > a[1].at ? 1 : -1))
        .slice(0, 4)
    : [];

  if (recentResults.length === 0) return null;

  return (
    <section aria-label="آخرین نتایج تست‌ها">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-stone-800">
        <RotateCcw size={19} className="text-stone-500" />
        آخرین نتایج شما
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {recentResults.map(([key, r]) => {
          const [lessonPart, cat] = key.split(":");
          const lesson = lessonMetaById(Number(lessonPart));
          const themeName = lesson?.color ?? globalResultTheme[key] ?? "emerald";
          const t = themeOf(themeName);
          const label = lesson
            ? `${lessonNameFa(lesson.id)} — `
            : globalResultLabel[key] ?? (cat ? categoryLabel[cat] ?? cat : null);
          return (
            <div key={key} className={`rounded-xl border ${t.border} ${t.bgSoft} p-3`}>
              <div className="mb-1 text-[11px] font-bold text-stone-500">{label ?? "تمرین"}</div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-stone-800">{faNum(r.percent)}٪</span>
                <span className="text-[12px] text-stone-500" dir="ltr">
                  {r.correct}/{r.total}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
