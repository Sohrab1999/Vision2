"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Eraser, ArrowLeft, PartyPopper, CheckCircle2, Info, ClipboardCheck } from "lucide-react";
import { useStudy, questionSourceLesson } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { findQuestion } from "@/lib/explain-source";
import { trackEvent } from "@/lib/analytics";
import type { QuizQuestion } from "@/lib/study-types";
import QuizEngine from "../quiz/quiz-engine";

/**
 * «مرور سریع قبل امتحان» — a mixed quiz built ONLY from the learner's own
 * mistake bank (lessons 1-3 + the 360-item exam bank). Answering a question
 * correctly removes it from the bank (QuizEngine does that via mistakesOf).
 */

interface ResolvedMistake {
  q: QuizQuestion;
  count: number; // times answered wrong
  bucket: string; // "0" exam bank | "1".."3" lessons
}

const BUCKET_LABELS: Record<string, string> = {
  "0": "بانک ۳۶۰ تستی",
  "1": "درس اول",
  "2": "درس دوم",
  "3": "درس سوم",
};

/** resolve mistake-bank keys ("bucket:questionId") back to bundled questions */
function resolveMistakes(mistakes: Record<string, number>): ResolvedMistake[] {
  const out: ResolvedMistake[] = [];
  for (const [key, count] of Object.entries(mistakes)) {
    if (!count || count <= 0) continue;
    const sep = key.indexOf(":");
    if (sep <= 0) continue;
    const q = findQuestion(key.slice(sep + 1));
    if (q) out.push({ q, count, bucket: key.slice(0, sep) });
  }
  // most-missed first; ties shuffled so repeated sessions vary
  return out.sort((a, b) => b.count - a.count || (Math.random() < 0.5 ? -1 : 1));
}

function cheerFor(total: number): { emoji: string; text: string } {
  if (total >= 30) return { emoji: "🔥", text: "بانک خطا پُره — همین حالا بهترین زمانِ دوباره‌است!" };
  if (total >= 15) return { emoji: "🎯", text: "یک دورِ مرورِ سریع، قبل از امتحان خیلی وزن دارد." };
  if (total >= 5) return { emoji: "💪", text: "چند سؤال غلط مانده — چند دقیقه بیشتر وقت نمی‌گیرد." };
  return { emoji: "🌱", text: "خطاهایت کم‌اند — همین حالا پاکشان کن." };
}

const SIZE_OPTIONS = [10, 15, 20] as const;

export default function ReviewView() {
  const mistakes = useStudy((s) => s.mistakes);
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();
  const [session, setSession] = useState<QuizQuestion[] | null>(null);
  const [size, setSize] = useState<number>(10);

  // re-derives after every quiz finish (right answers shrink the bank)
  const resolved = useMemo(() => (mounted ? resolveMistakes(mistakes) : []), [mounted, mistakes]);

  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of resolved) map.set(r.bucket, (map.get(r.bucket) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [resolved]);

  /* --------------------------- active session --------------------------- */
  if (session) {
    return (
      <QuizEngine
        title="مرور سریع قبل امتحان"
        questions={session}
        resultKeyStr="review"
        lessonId="review"
        category="review"
        immediate={true}
        mistakesOf={(q) => questionSourceLesson(q)}
        onExit={() => setSession(null)}
      />
    );
  }

  const total = resolved.length;
  const cheer = cheerFor(total);
  const clampedSize = Math.min(size, total);

  return (
    <div className="space-y-5">
      {/* ------------------------------ header ------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="review-hero rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Zap size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800">مرور سریع قبل امتحان</h1>
            <p className="text-[13px] text-stone-500">
              ترکیبی از غلط‌های اخیرِ خودت — هر پاسخِ درست، سؤال را برای همیشه از بانک خطا حذف می‌کند
            </p>
          </div>
        </div>
      </motion.div>

      {mounted && total === 0 ? (
        /* ---------------------------- empty state ---------------------------- */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
        >
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <PartyPopper size={28} />
          </span>
          <h2 className="mb-2 text-lg font-extrabold text-stone-800">بانک خطا کاملاً خالیه!</h2>
          <p className="mx-auto mb-6 max-w-md text-[13px] leading-7 text-stone-500">
            یا هنوز تست‌هایت همه درست بوده، یا قبلاً همهٔ خطاهایت را مرور کرده‌ای.
            همین حالا آمادهٔ هر آزمونی هستی — برو سراغ بانک ۳۶۰ تستی!
          </p>
          <button
            onClick={() => setView({ type: "exam" })}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          >
            <ClipboardCheck size={16} />
            آزمون جامع واژگان
            <ArrowLeft size={15} />
          </button>
        </motion.div>
      ) : (
        <>
          {/* ---------------------------- stats + cheer ---------------------------- */}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border c-card p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Eraser size={17} className="text-rose-500" />
                <h2 className="text-sm font-extrabold text-stone-800">بانک خطای تو</h2>
                <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-sm shadow-rose-500/30">
                  {faNum(total)} سؤال
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {buckets.map(([bucket, count]) => (
                  <span
                    key={bucket}
                    className="rounded-lg bg-stone-100 px-2.5 py-1 text-[12px] font-bold text-stone-600"
                  >
                    {BUCKET_LABELS[bucket] ?? "بخش دیگر"}: {faNum(count)}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] font-bold text-stone-600">
                {cheer.emoji} {cheer.text}
              </p>
            </div>

            {/* how it works */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:w-72">
              <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-sky-800">
                <Info size={15} />
                چطور کار می‌کند؟
              </h3>
              <ul className="space-y-2.5 text-[12px] leading-6 text-stone-600">
                <li className="flex gap-1.5">
                  <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
                  سؤال‌های بیشترِ غلط، اول می‌آیند
                </li>
                <li className="flex gap-1.5">
                  <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
                  بدون تایمر — با فیدبک فوری و ترجمه
                </li>
                <li className="flex gap-1.5">
                  <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
                  پاسخ درست = حذف از بانک؛ تا آزمونِ تمیز
                </li>
              </ul>
            </div>
          </div>

          {/* ------------------------------ session config ------------------------------ */}
          <div className="rounded-2xl border c-card p-5 shadow-sm sm:p-6">
            <p className="mb-2 text-[13px] font-bold text-stone-600">۱. طول جلسهٔ مرور:</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSize(n)}
                  disabled={n > total}
                  className={`rounded-xl border-2 px-5 py-2.5 text-sm font-black transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${
                    clampedSize === n
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-stone-200 text-stone-500 hover:border-amber-300"
                  }`}
                >
                  {faNum(n)} سؤال
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                trackEvent("quick_review_start");
                setSession(resolved.slice(0, clampedSize).map((r) => r.q));
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 py-3 text-sm font-black text-white shadow-lg shadow-amber-500/25 transition-all hover:opacity-95 active:scale-[0.98] sm:w-auto sm:px-10"
            >
              <Zap size={17} />
              شروع مرور سریع ({faNum(clampedSize)} سؤال)
              <ArrowLeft size={16} />
            </button>
            {total > clampedSize && (
              <p className="mt-3 text-[12px] text-stone-500">
                {faNum(total - clampedSize)} سؤالِ دیگر هم در بانک هست — در جلسهٔ بعدی می‌روی سراغشان.
              </p>
            )}
          </div>

          {/* ------------------------------ per-lesson pointer ------------------------------ */}
          <p className="rounded-xl bg-stone-50 px-4 py-3 text-[12px] leading-6 text-stone-500">
            برای دیدنِ متن و جزئیاتِ سؤال‌های غلطِ هر درس، به تب «تست» همان درس برو —
            مرورِ سریع فقط برای تمرینِ ترکیبیِ قبل از امتحان است.
          </p>
        </>
      )}
    </div>
  );
}
