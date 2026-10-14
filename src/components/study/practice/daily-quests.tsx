"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCcw,
  BookA,
  ListChecks,
  Ear,
  Zap,
  Target,
  Trophy,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useStudy, firstLessonWithDue, todayStr, type DayStat } from "@/lib/study-store";
import { percent } from "@/lib/domain/percent";
import { questProgress } from "@/lib/daily-quests";
import { faNum } from "@/lib/study-theme";
import { useMounted } from "@/lib/use-mounted";
import { useToast } from "@/hooks/use-toast";

// ------------------------------------------------------------------
// اهداف روزانه — five auto-tracked daily missions. Each row jumps to
// the exact place the user can make progress. Completing all five
// fires a celebration toast + keeps the streak meaningful.
// ------------------------------------------------------------------

const QUEST_ICONS: Record<string, React.ElementType> = {
  RefreshCcw,
  BookA,
  ListChecks,
  Ear,
  Zap,
};

export default function DailyQuests() {
  const mounted = useMounted();
  const { toast } = useToast();
  const dayStat = useStudy((s) => s.dayStat);
  const srs = useStudy((s) => s.srs);
  const openLesson = useStudy((s) => s.openLesson);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const setView = useStudy((s) => s.setView);

  const quests = useMemo(() => questProgress(dayStat), [dayStat]);
  const doneCount = quests.filter((q) => q.done).length;
  const allDone = doneCount === quests.length;
  const overallPct = percent(doneCount, quests.length);

  // celebrate when the fifth quest completes *live in this session*
  // (ref-guarded: no toast on mere page loads with a finished day)
  const seenRef = useRef<{ day: string; count: number } | null>(null);
  const dayKey = mounted ? dayStat.day : "";
  useEffect(() => {
    if (!dayKey || seenRef.current?.day !== dayKey) {
      seenRef.current = { day: dayKey, count: doneCount };
      return;
    }
    if (doneCount > seenRef.current.count && allDone) {
      toast({
        title: "🎉 همهٔ اهداف امروز کامل شد!",
        description: "پنج‌گانهٔ امروز را گرفتی — زنجیره‌ات امن است. فردا هم منتظرتیم!",
      });
    }
    seenRef.current.count = doneCount;
  }, [dayKey, doneCount, allDone, toast]);

  const jump = (kind: string) => {
    switch (kind) {
      case "smart-review": {
        const lesson = firstLessonWithDue(srs) ?? 1;
        openLesson(lesson, "smart");
        break;
      }
      case "flashcards":
        openLesson(1, "smart"); // straight into flashcards for new words
        break;
      case "exam":
        setView({ type: "exam" });
        break;
      case "dictation":
        openLessonTab(1, "dictation");
        break;
      case "rush":
        setView({ type: "rush" });
        break;
    }
  };

  const today = todayStr();
  const stat: DayStat = mounted && dayStat.day === today ? dayStat : { day: today, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 };
  const title = allDone
    ? "اهداف امروز کامل شد!"
    : doneCount === 0
      ? "امروز هنوز شروع نکردی"
      : "ادامه بده، نزدیک است!";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      aria-label="اهداف روزانه"
      className="daily-quests relative overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm"
    >
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-stone-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="quest-head-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25">
            <Target size={20} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-black text-stone-800">اهداف روزانه</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${allDone ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                {faNum(doneCount)} از {faNum(quests.length)}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] font-bold text-stone-500">{title}</p>
          </div>
        </div>
        <div className="relative shrink-0" aria-hidden>
          <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
            <circle cx="26" cy="26" r="22" fill="none" stroke="#e7e5e4" strokeWidth="5" />
            <circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              stroke={allDone ? "#059669" : "#10b981"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 22}
              strokeDashoffset={2 * Math.PI * 22 * (1 - overallPct / 100)}
              style={{ transition: "stroke-dashoffset 0.7s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className={`text-[13px] font-black leading-none ${overallPct === 0 ? "text-stone-500" : "text-stone-700"}`}>
              {faNum(overallPct)}
              <span className="text-[9px]">٪</span>
            </span>
          </span>
        </div>
      </div>

      {/* rows */}
      <ul className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {quests.map((q, i) => {
          const Icon = QUEST_ICONS[q.def.icon] ?? Target;
          return (
            <li key={q.def.id}>
              <button
                onClick={() => jump(q.def.jump.kind)}
                className={`quest-row group flex w-full items-center gap-3 rounded-xl border p-3 text-right transition-[background-color,color,border-color,box-shadow] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  q.done
                    ? "border-emerald-300 bg-emerald-50/70"
                    : "border-stone-200 bg-stone-50/60 hover:border-emerald-200 hover:bg-emerald-50/40"
                }`}
                aria-label={`${q.def.title} — ${q.value < q.def.target ? `${faNum(q.def.target - q.value)} باقی‌مانده` : "کامل شد"}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${q.done ? "bg-emerald-500 text-white" : q.def.accent}`}>
                  {q.done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-extrabold text-stone-800">{q.def.title}</span>
                    <span className={`shrink-0 text-[11px] font-black ${q.done ? "text-emerald-600" : "text-stone-500"}`} dir="ltr">
                      {faNum(Math.min(q.value, q.def.target))}/{faNum(q.def.target)}
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full c-track-80">
                    <motion.span
                      className={`daily-bar block h-full rounded-full bg-gradient-to-l ${q.def.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(q.done ? 100 : 4, q.pct)}%` }}
                      transition={{ delay: i * 0.06, duration: 0.6, ease: "easeOut" }}
                    />
                  </span>
                  <span className="mt-1 block text-[10.5px] font-bold text-stone-500">
                    {q.done ? "کامل شد — عالی!" : q.def.hint}
                  </span>
                </span>
                <ChevronLeft size={14} className="quest-arrow shrink-0 text-stone-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-emerald-500" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* all-done reward band */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="reward-band relative overflow-hidden border-t border-emerald-200 bg-gradient-to-l from-emerald-600 via-teal-500 to-emerald-500 px-5 py-3"
        >
          <div className="reward-shimmer absolute inset-0" aria-hidden />
          <p className="relative flex items-center justify-center gap-2 text-[12.5px] font-black text-white">
            <Trophy size={15} />
            پاداش روزانه گرفتی — {faNum(stat.reviews + stat.quizzes + stat.words)} فعالیت امروز ثبت شد. زنجیره‌ات امن است!
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}
// r15 daily quests
