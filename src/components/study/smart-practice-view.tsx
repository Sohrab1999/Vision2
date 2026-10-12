"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, ArrowLeft, Info, CheckCircle2, Layers, Ear, Pencil, BookOpenCheck } from "lucide-react";
import { useStudy, questionSourceLesson, firstLessonWithDue, srsDueTotal } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { skillBreakdown, lessonIdOfKey, type SkillStat } from "@/lib/skill-stats";
import { buildSmartPlan } from "@/lib/smart-practice";
import { readCountPrefill, clearCountPrefill } from "@/lib/nav-prefill";
import { trackEvent } from "@/lib/analytics";
import type { QuizQuestion } from "@/lib/study-types";
import QuizEngine from "./quiz-engine";

/**
 * «تمرین هوشمند» — a session that assembles itself from the learner's
 * weak points: mistake bank + weakest skills + diagnostic fill.
 * Answering correctly still removes the question from the mistake bank.
 */

const TONE_CLASS: Record<string, string> = {
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
};

const SIZE_OPTIONS = [10, 15, 20] as const;

/** کلید prefill پالت — هم‌رشته با dispatch پالت (Task 74: «تمرین هوشمند ۱۵») */
const SMART_PREFILL_KEY = "vision2-smart-prefill";

/** weak non-quiz skills → supplementary practice pointers (dictation/listening/writing) */
function extraFor(s: SkillStat): { label: string; onClick: () => void } | null {
  const lessonId = s.weakest ? lessonIdOfKey(s.weakest.key) : null;
  const lesson = lessonId ?? 1;
  if (s.def.id === "dictation")
    return { label: `تمرین دیکتهٔ ${lesson ? `درس ${faNum(lesson)}` : "دیکته"}`, onClick: () => useStudy.getState().openLessonTab(lesson, "dictation") };
  if (s.def.id === "listening")
    return { label: "تمرین «بشنو و انتخاب کن»", onClick: () => useStudy.getState().setView({ type: "listen" }) };
  if (s.def.id === "writing")
    return { label: `تمرین نگارش ${lesson ? `درس ${faNum(lesson)}` : "نگارش"}`, onClick: () => useStudy.getState().openLessonTab(lesson, "writing") };
  return null;
}

const EXTRA_ICONS: Record<string, React.ElementType> = {
  dictation: Ear,
  listening: BookOpenCheck,
  writing: Pencil,
};

export default function SmartPracticeView() {
  const results = useStudy((s) => s.results);
  const mistakes = useStudy((s) => s.mistakes);
  const srs = useStudy((s) => s.srs);
  const setView = useStudy((s) => s.setView);
  const openLesson = useStudy((s) => s.openLesson);
  const mounted = useMounted();
  const [session, setSession] = useState<QuizQuestion[] | null>(null);
  // Task 74 — prefill پالت: initializer غیرمخرب می‌خواند (هم‌الگوی exam/konkur؛
  // مقاوم به دوبار-فراخوانی StrictMode) و مصرفِ یک‌بارمصرف در هر دو مسیر
  // (mount + رویداد open-smart-with) انجام می‌شود — prefill کهنه نباید در
  // mount بعدی زنده بماند (درس راند ۶۹).
  const [size, setSize] = useState<number>(
    () => readCountPrefill(SMART_PREFILL_KEY, SIZE_OPTIONS) ?? 10,
  );

  useEffect(() => {
    clearCountPrefill(SMART_PREFILL_KEY);
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ count?: number }>).detail;
      if (typeof d?.count === "number" && (SIZE_OPTIONS as readonly number[]).includes(d.count)) {
        setSize(d.count);
        clearCountPrefill(SMART_PREFILL_KEY);
      }
    };
    window.addEventListener("open-smart-with", handler);
    return () => window.removeEventListener("open-smart-with", handler);
  }, []);

  const plan = useMemo(
    () => (mounted ? buildSmartPlan({ results, mistakes, target: size }) : null),
    [mounted, results, mistakes, size]
  );

  const weakExtras = useMemo(() => {
    if (!mounted) return [];
    return skillBreakdown(results)
      .filter((s) => s.avg < 70 && ["dictation", "listening", "writing"].includes(s.def.id))
      .map((s) => ({ skill: s, action: extraFor(s) }))
      .filter((x) => x.action !== null);
  }, [mounted, results]);

  const dueCards = mounted ? srsDueTotal(srs) : 0;
  const dueLesson = mounted ? firstLessonWithDue(srs) : null;

  /* --------------------------- active session --------------------------- */
  if (session) {
    return (
      <QuizEngine
        title="تمرین هوشمند"
        questions={session}
        resultKeyStr="smart"
        lessonId="smart"
        category="smart"
        immediate={true}
        groupOf={(q) => String(questionSourceLesson(q))}
        groupLabels={{ "0": "بانک ۳۶۰", "1": "درس ۱", "2": "درس ۲", "3": "درس ۳" }}
        mistakesOf={(q) => questionSourceLesson(q)}
        onExit={() => setSession(null)}
      />
    );
  }

  const chips = plan?.mix ?? [];

  return (
    <div className="space-y-5">
      {/* ------------------------------ hero ------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="smart-hero rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50 to-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Sparkles size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800">تمرین هوشمند</h1>
            <p className="text-[13px] text-stone-500">
              جلسه‌ای که خودش را با نقاط ضعف تو تنظیم می‌کند — هر بار از نو ساخته می‌شود
            </p>
          </div>
        </div>
      </motion.div>

      {/* ---------------------------- recipe + info ---------------------------- */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Brain size={17} className="text-violet-500" />
            <h2 className="text-sm font-extrabold text-stone-800">ترکیب جلسهٔ تو</h2>
            <span className="rounded-full bg-violet-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-sm shadow-violet-500/30">
              {faNum(size)} سؤال
            </span>
          </div>

          {plan && plan.diagnostic ? (
            <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3">
              <p className="text-[12.5px] font-bold leading-6 text-sky-800">
                🌱 هنوز نتیجه‌ای ثبت نشده — یک جلسهٔ سنجشِ ترکیبی از سه درس می‌سازم
                تا مهارت‌هایت اندازه‌گیری شود.
              </p>
            </div>
          ) : (
            <div className="mb-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className={`rounded-lg border px-2.5 py-1 text-[12px] font-bold ${TONE_CLASS[chip.tone] ?? TONE_CLASS.sky}`}
                >
                  {chip.label}: {faNum(chip.count)}
                </span>
              ))}
            </div>
          )}

          <p className="text-[12px] font-bold leading-6 text-stone-600">
            ✨ {plan?.reasoning ?? "در حال آماده‌سازی…"}
          </p>

          {weakExtras.length > 0 && (
            <div className="mt-4 border-t border-dashed border-stone-200 pt-3">
              <p className="mb-2 text-[11.5px] font-extrabold text-stone-500">
                این مهارت‌ها هم ضعیف‌اند ولی با تست ساخته نمی‌شوند:
              </p>
              <div className="flex flex-wrap gap-2">
                {weakExtras.map(({ skill, action }) => {
                  const Icon = EXTRA_ICONS[skill.def.id] ?? Layers;
                  return (
                    <button
                      key={skill.def.id}
                      onClick={action!.onClick}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[11.5px] font-bold text-stone-600 transition-all hover:border-violet-300 hover:text-violet-700 active:scale-95"
                    >
                      <Icon size={13} />
                      {action!.label}
                      <span className="text-[10px] font-black text-rose-500">{faNum(skill.avg)}٪</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {dueCards > 0 && dueLesson && (
            <button
              onClick={() => openLesson(dueLesson, "smart")}
              className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-right transition-all hover:shadow-sm active:scale-[0.99]"
            >
              <span className="text-[12px] font-bold text-amber-800">
                ⏰ {faNum(dueCards)} کارت واژگان هم سررسید مرور شده — قبل از تست یک دور بزن
              </span>
              <ArrowLeft size={14} className="shrink-0 text-amber-600" />
            </button>
          )}
        </div>

        {/* how it works */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:w-72">
          <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-sky-800">
            <Info size={15} />
            چطور ساخته می‌شود؟
          </h3>
          <ul className="space-y-2.5 text-[12px] leading-6 text-stone-600">
            <li className="flex gap-1.5">
              <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
              اول: پرغلط‌ترین سؤال‌های خودت
            </li>
            <li className="flex gap-1.5">
              <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
              بعد: سؤال تازه از ضعیف‌ترین مهارت‌ها
            </li>
            <li className="flex gap-1.5">
              <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
              باقی: سنجش ترکیبی برای تثبیت
            </li>
            <li className="flex gap-1.5">
              <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500" />
              پاسخ درست = پاک‌شدن از بانک خطا
            </li>
          </ul>
        </div>
      </div>

      {/* ------------------------------ session config ------------------------------ */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="mb-2 text-[13px] font-bold text-stone-600">طول جلسه:</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`rounded-xl border-2 px-5 py-2.5 text-sm font-black transition-all active:scale-95 ${
                size === n
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-stone-200 text-stone-500 hover:border-violet-300"
              }`}
            >
              {faNum(n)} سؤال
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (!plan) return;
            trackEvent("smart_practice_start");
            setSession(plan.pool);
          }}
          disabled={!plan || plan.pool.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-fuchsia-600 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-40 sm:w-auto sm:px-10"
        >
          <Sparkles size={17} />
          شروع تمرین هوشمند ({faNum(plan?.pool.length ?? 0)} سؤال)
          <ArrowLeft size={16} />
        </button>
        <p className="mt-3 text-[12px] leading-6 text-stone-400">
          بدون تایمر، با فیدبک فوری و ترجمهٔ فارسی — نتیجه در تحلیل مهارت‌ها و کارنامه ثبت می‌شود.
        </p>
      </div>
    </div>
  );
}
