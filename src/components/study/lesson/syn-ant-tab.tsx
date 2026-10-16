"use client";

// ------------------------------------------------------------------
// هشتمین تبِ درس — «مترادف و متضاد» (Task 202).
// جدول‌های جزوه (SYN/ANT) بالاخره زنده می‌شوند: حالتِ «جدول» مرجعِ
// کامل با روخوانی دو سمت است و حالتِ «تمرین» با همان موتورِ تستِ خانه
// (QuizEngine + completeQuizRun) نتیجه را زیرِ کلیدِ «N:synant» ثبت
// می‌کند — فیدِ خانه، پنلِ مهارت و بانکِ اشتباهات خودکار می‌فهمند.
// ------------------------------------------------------------------

import { useState } from "react";
import { ArrowLeftRight, Shuffle, Table2, Volume2 } from "lucide-react";
import type { LessonData, QuizQuestion } from "@/lib/study-types";
import { useStudy, resultKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { themeOf, faNum } from "@/lib/study-theme";
import { synAntCounts, buildSynAntQuiz, SYN_QUIZ_CAP } from "@/lib/syn-ant-quiz";
import QuizEngine from "../quiz/quiz-engine";
import SpeakButton from "../shared/speak-button";

export default function SynAntTab({ lesson }: { lesson: LessonData }) {
  const [mode, setMode] = useState<"table" | "quiz">("table");
  const [session, setSession] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const results = useStudy((s) => s.results);
  const mounted = useMounted();
  const t = themeOf(lesson.color);
  const counts = synAntCounts(lesson);
  const best = mounted ? results[resultKey(lesson.id, "synant")] : undefined;

  if (session) {
    return (
      <QuizEngine
        title={session.title}
        questions={session.questions}
        resultKeyStr={resultKey(lesson.id, "synant")}
        lessonId={lesson.id}
        category="synant"
        immediate
        // راند ۲۴۹ — بندِ ① پیشنهادِ ۲۴۸: خانوادهٔ resumeDoor به نتیجهٔ
        // تمرینِ جفت‌هایِ خودِ درس هم رسید — جایی که حکمِ کوچک گرفته
        // می‌شود، راهِ برگشت به ضمیمه هم آن‌جاست (همان الگو، opt-in).
        resumeDoor
        onExit={() => setSession(null)}
      />
    );
  }

  const startQuiz = () => {
    setSession({
      title: `مترادف و متضاد درس — ${lesson.titleFa}`,
      questions: buildSynAntQuiz(lesson),
    });
  };

  const renderRow = (
    row: { en: string; fa: string },
    pair: string,
    kind: "syn" | "ant",
    i: number
  ) => (
    <li
      key={`${kind}-${i}-${row.en}`}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-stone-100 bg-white px-3.5 py-2.5"
    >
      <span className={`en-text min-w-[110px] text-[15px] font-bold ${t.text}`} dir="ltr">
        {row.en}
      </span>
      <span className="text-stone-300" aria-hidden>
        {kind === "syn" ? "≈" : "↔"}
      </span>
      <span className="en-text min-w-[110px] text-[15px] font-extrabold text-stone-800" dir="ltr">
        {pair}
      </span>
      <SpeakButton text={pair} label="روخوانی" />
      <span className="mr-auto text-[12.5px] font-bold text-stone-500">{row.fa}</span>
    </li>
  );

  return (
    <div className="space-y-4">
      {/* نوارِ کنترل: شمارنده‌ها + سوییچ حالت */}
      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border ${t.border} bg-white p-3.5 shadow-sm`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-lg ${t.chipBg} px-2.5 py-1.5 text-[12px] font-black`}>
            <ArrowLeftRight size={13} />
            مترادف: {faNum(counts.syn)} · متضاد: {faNum(counts.ant)}
          </span>
          {best && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[12px] font-bold text-emerald-700">
              بهترین نتیجه: {faNum(best.percent)}٪
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode("table")}
            aria-pressed={mode === "table"}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-[background-color,color,border-color,box-shadow] ${
              mode === "table" ? `${t.bg} text-white shadow-sm` : "border c-card text-stone-500 hover:text-stone-700"
            }`}
          >
            <Table2 size={13} />
            جدول
          </button>
          <button
            onClick={mode === "quiz" ? startQuiz : () => setMode("quiz")}
            aria-pressed={mode === "quiz"}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-[background-color,color,border-color,box-shadow] ${
              mode === "quiz" ? `${t.bg} text-white shadow-sm` : "border c-card text-stone-500 hover:text-stone-700"
            }`}
          >
            <Shuffle size={13} />
            تمرین
          </button>
          {mode === "quiz" && (
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-[12.5px] font-bold text-white transition-[background-color,color,border-color,box-shadow,transform] hover:bg-stone-700 active:scale-[0.96]"
            >
              دورِ تازه
            </button>
          )}
        </div>
      </div>

      {mode === "table" ? (
        <div className="space-y-5">
          {mode === "table" && (
            <p className="rounded-xl border border-dashed border-stone-200 px-4 py-2.5 text-[12.5px] leading-6 text-stone-500">
              جدول‌های «واژگان و معانی» جزوه — هر ردیف یک جفتِ آموختنی است؛ روی دکمهٔ بلندگو بزن تا تلفظِ درست را بشنوی.
            </p>
          )}
          <section aria-label="جدول مترادف‌ها">
            <h3 className={`mb-2.5 flex items-center gap-2 text-[14px] font-black ${t.text}`}>
              <span aria-hidden>≈</span> مترادف‌ها <span className="text-stone-500">({faNum(counts.syn)} جفت)</span>
            </h3>
            <ul className="space-y-1.5">
              {lesson.synonyms.map((row, i) => renderRow(row, row.syn, "syn", i))}
            </ul>
          </section>
          {counts.ant > 0 && (
            <section aria-label="جدول متضادها">
              <h3 className="mb-2.5 flex items-center gap-2 text-[14px] font-black text-rose-600">
                <span aria-hidden>↔</span> متضادها <span className="text-stone-500">({faNum(counts.ant)} جفت)</span>
              </h3>
              <ul className="space-y-1.5">
                {(lesson.antonyms ?? []).map((row, i) => renderRow(row, row.ant, "ant", i))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <div className={`rounded-2xl border ${t.border} bg-white p-6 text-center shadow-sm`}>
          <Volume2 className="mx-auto mb-3 text-stone-300" size={30} />
          <h3 className="mb-1.5 text-[15px] font-black text-stone-800">تمرینِ چهارگزینه‌ای</h3>
          <p className="mx-auto mb-4 max-w-md text-[13px] leading-7 text-stone-500">
            از جدولِ همین درس تا {faNum(SYN_QUIZ_CAP)} سؤال می‌گیریم — نیمیش هم‌معنی، نیمیش متضاد.
            پاسخِ درست فوری چراغ می‌شود و غلط‌ها به بانکِ مرور می‌روند؛ نتیجه در پروفایل و فید ثبت است.
          </p>
          <button
            onClick={startQuiz}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-stone-800 px-6 py-3 text-[14px] font-black text-white shadow-md transition-[background-color,box-shadow,transform] hover:bg-stone-700 active:scale-[0.96]"
          >
            <Shuffle size={16} />
            شروع تمرین مترادف و متضاد
          </button>
          {counts.ant === 0 && (
            <p className="mt-3 text-[11.5px] font-bold text-stone-500">
              این درس جدولِ متضاد ندارد — تمرین فقط مترادف است.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
