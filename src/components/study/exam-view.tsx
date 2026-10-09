"use client";

import { useState } from "react";
import { ClipboardCheck, Timer, Zap, BookOpen } from "lucide-react";
import { examBank, lessons } from "@/data";
import { useStudy } from "@/lib/study-store";
import { themeOf } from "@/lib/study-theme";
import QuizEngine from "./quiz-engine";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExamView() {
  const [config, setConfig] = useState<{ count: number; timed: boolean } | null>(null);
  const bestExam = useStudy((s) => s.results["exam"]);

  if (config) {
    const questions = shuffle(examBank).slice(0, config.count);
    return (
      <QuizEngine
        title={`آزمون جامع واژگان (${config.count} تست)`}
        questions={questions}
        resultKeyStr="exam"
        lessonId={0}
        category="exam"
        immediate={false}
        secondsPerQuestion={config.timed ? 45 : undefined}
        onExit={() => setConfig(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ClipboardCheck size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800">آزمون جامع واژگان</h1>
            <p className="text-[13px] text-stone-500">
              {examBank.length} تست گردآوری از بانک «۳۶۰ تست جمع‌بندی واژگان درس اول تا سوم» جزوه
            </p>
          </div>
        </div>

        {bestExam && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            <p className="text-[13px] font-bold text-emerald-800">
              🏆 بهترین نتیجهٔ شما در آزمون جامع: {bestExam.percent}٪ ({bestExam.correct} از {bestExam.total})
            </p>
          </div>
        )}

        <p className="mb-2 text-[13px] font-bold text-stone-600">۱. تعداد سؤالات را انتخاب کنید:</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {[10, 20, 30].map((n) => (
            <button
              key={n}
              onClick={() => setConfig((c) => ({ count: n, timed: c?.timed ?? true }))}
              className={`rounded-xl border-2 px-5 py-2.5 text-sm font-black transition-all active:scale-95 ${
                config?.count === n
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
              }`}
            >
              {n} تست
            </button>
          ))}
        </div>

        <p className="mb-2 text-[13px] font-bold text-stone-600">۲. حالت آزمون:</p>
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setConfig((c) => ({ count: c?.count ?? 10, timed: true }))}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
              config?.timed !== false
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
            }`}
          >
            <Timer size={16} />
            با تایمر (۴۵ ثانیه برای هر تست)
          </button>
          <button
            onClick={() => setConfig((c) => ({ count: c?.count ?? 10, timed: false }))}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
              config?.timed === false
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
            }`}
          >
            <Zap size={16} />
            بدون تایمر
          </button>
        </div>

        <button
          onClick={() => setConfig((c) => ({ count: c?.count ?? 10, timed: c?.timed ?? true }))}
          className="w-full rounded-xl bg-emerald-600 py-3.5 text-[15px] font-black text-white shadow-lg shadow-emerald-900/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          شروع آزمون جامع
        </button>
      </div>

      {/* quick lesson tests shortcut */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-stone-700">
          <BookOpen size={16} className="text-stone-400" />
          یا مستقیم وارد تست‌های هر درس شوید:
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {lessons.map((l) => (
            <LessonShortcut key={l.id} id={l.id} title={l.titleFa} color={l.color} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LessonShortcut({ id, title, color }: { id: number; title: string; color: string }) {
  const openLesson = useStudy((s) => s.openLesson);
  const t = themeOf(color);
  return (
    <button
      onClick={() => openLesson(id)}
      className={`rounded-xl border ${t.border} ${t.bgSoft} p-3.5 text-right transition-all hover:shadow-md active:scale-[0.98]`}
    >
      <div className={`text-[13px] font-extrabold ${t.text}`}>درس {id}</div>
      <div className="text-[12px] font-bold text-stone-600">{title}</div>
    </button>
  );
}
