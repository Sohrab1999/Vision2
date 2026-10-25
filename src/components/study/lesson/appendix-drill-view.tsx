"use client";

// ---------------------------------------------------------------------
// r400 — «تمرین افعال بی‌قاعده» — نمایِ دریل داخلِ زیرتبِ verbs ضمیمه.
// r401 — «معنی + مرورِ اشتباهها»: گونهٔ fa گزینههایِ فارسی دارد (رندرِ
//    RTL بدونِ en-text — ایدئومِ برعکسِ ستونِ انگلیسی)؛ پسِ نتیجه،
//    «مرورِ اشتباهها» فقط سؤالهایِ نادرست/بیپاسخِ همین جلسه را دوباره
//    میپرسد (بانکِ خطایِ موضعی — هیچ نوشتنی به استورِ یادگیری)؛
//    سرصفحهٔ مرور صادق است: «نتیجهٔ مرور»، نه «نتیجهٔ تمرین».
// r402 — «کیبوردِ دریل»: ۱-۴ (هر چیدمان: کدِ فیزیکی/ارقامِ فارسی/لاتین)
//    گزینه را انتخاب میکند، Enter/← پسِ پاسخ پیش میرود — عینِ ایدئومِ
//    کوئیز از کیتِ همگانیِ §10 R-6 (useKeydown + readDigit +
//    isTypingTarget)؛ و هر گزینه نشانگرِ kbdِ رقمِ خودش را دارد
//    (aria-hidden — شماره در aria-label هست؛ راهنمای سراسری هم ثبت شد).
// r403 — «نمایِ مشترکِ دو بانک»: این نما دیگر فعل-محور نیست — spec
//    (عنوان/معرفی/برچسبها) و buildSession از والد میآید (فعل: موتورِ r400؛
//    خانوادهٔ واژه: موتورِ r403). چیپِ روخوانی از فیلدِ speakِ خودِ پرسش
//    میآید — موتورِ هر بانک مالکِ تصمیم است، نما حدس نمیزند؛ رندرِ fa
//    (RTL فارسی) و بقیه (LTR انگلیسی) رویِ همان قراردادِ r401 پابرجاست.
//
// جریان: معرفی → پرسش‌ها (بازخوردِ درجا، بی تایمر — کاربر سرعته) →
// نتیجهٔ صادق (درصد از مالکِ r388 + بازخوانیِ سؤالبهسؤال: بیپاسخ =
// «بی‌پاسخ»، نه صفرِ دروغین).
//
// قراردادهای نما:
//  · ترنزیشن scopeشده: فقط transition-colors / transition-transform —
//    کلاسِ سراسریِ ممنوعِ نقشهٔ P4 در این ریپو منقرض است (کامنت عمداً
//    توکنش را نام نمیبرد تا شمارندهٔ G-4 کورکورانه شکار نکند).
//  · هدفِ لمس: min-h-11 (پریمیتیوِ ۴۴pxِ خانه).
//  · شمارندهها و درصد فارسی از مالکِ قالب (faNum / percentFa).
//  · خطا/درست: خانوادهٔ rose/emerald — همان ایدئومِ practice.
//  · TTS روی واژهٔ انگلیسیِ پرسش (ایدئومِ EnSpeakCellِ جدولِ r229) —
//    فقط فعلِ هدف، نه گزینه‌ها (تمرکزِ شنیداری رویِ خودِ فعل).
//  · هیچ چیز به استورِ یادگیری نمینویسد — جلسه از خودِ نما زنده است
//    (ماندگاری/بانک خطا: نامزدِ راندهای بعد، نه این راند).
// ---------------------------------------------------------------------

import { useMemo, useState } from "react";
import { ArrowLeft, Check, GraduationCap, Repeat, RotateCcw, Volume2, X } from "lucide-react";
import type { ReactNode } from "react";
import {
  buildDrillReplay,
  scoreDrill,
  type DrillSession,
} from "@/lib/appendix-drill";
import { faNum, percentFa } from "@/lib/study-theme";
import { isTypingTarget, readDigit, useKeydown } from "@/hooks/use-keyboard";
import SpeakButton from "../shared/speak-button";

export interface DrillViewSpec {
  /** شناسه — فقط برایِ ثبت و تست (r404: بانکِ سومِ نشانه‌های اختصاری پیوست) */
  id: "verbs" | "words" | "abbrev";
  /** سرصفحهٔ معرفی + عنوانِ نتیجهٔ تازه */
  title: string;
  /** پاراگرافِ معرفی — کامل از والد (شمارشِ بانک همانجاست) */
  intro: ReactNode;
  /** برچسبها — aria-labelها قفلِ تستند؛ هر بانک متنِ صادقِ خودش را دارد */
  startAria: string;
  exitLabel: string;
  exitAria: string;
  exitResultAria: string;
  cancelAria: string;
}

type Phase = "intro" | "run" | "done";

export default function AppendixDrillView({
  spec,
  buildSession,
  onExit,
}: {
  spec: DrillViewSpec;
  /** سازندهٔ جلسه — مالکیت با موتورِ همان بانک (r400 فعل / r403 واژه) */
  buildSession: () => DrillSession | null;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<DrillSession | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  // r401 — نتیجهٔ فعلی مالِ جلسهٔ مرور است؟ (سرصفحهٔ صادق: «نتیجهٔ مرور»)
  const [isReplay, setIsReplay] = useState(false);

  const score = useMemo(
    () => (session ? scoreDrill(session.questions, answers) : null),
    [session, answers],
  );

  const start = () => {
    const s = buildSession();
    if (!s || s.questions.length === 0) return; // بانکِ تهی: بیسروصدا به جدول برگرد (هر دو بانک پرند)
    setSession(s);
    setAnswers(Array<number | null>(s.size).fill(null));
    setIdx(0);
    setPicked(null);
    setIsReplay(false); // جلسهٔ تازهٔ کامل — نه مرور
    setPhase("run");
  };

  // r401 — مرورِ اشتباهها: همان سؤالهایِ نادرست/بیپاسخ، همان ترتیب،
  // همان گزینهها؛ پاسخها صفر میشوند و پرچمِ مرور روشن (سرصفحهٔ صادق).
  const replay = () => {
    if (!session) return;
    const r = buildDrillReplay(session.questions, answers);
    if (r.questions.length === 0) return; // نمیتواند رخ دهد — دکمه فقط با اشتباه بالا میآید
    setSession(r);
    setAnswers(Array<number | null>(r.size).fill(null));
    setIdx(0);
    setPicked(null);
    setIsReplay(true);
    setPhase("run");
  };

  const answer = (opt: number) => {
    if (picked !== null || !session) return; // هر سؤال یک انتخاب
    setPicked(opt);
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = opt;
      return next;
    });
  };

  const next = () => {
    if (!session) return;
    if (idx + 1 >= session.size) {
      setPhase("done");
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
  };

  // r402 — کیبوردِ دریل: فقط در فازِ run زنده است؛ رقمِ ۱-۴ (هر چیدمان)
  // گزینه انتخاب میکند و Enter/← پسِ پاسخ پیش میرود — عینِ ایدئومِ کوئیز.
  // حروفِ ناوبریِ سراسری دستنخوردهاند (این شنونده فقط رقم/Enter/← میخواند).
  useKeydown((e) => {
    if (phase !== "run" || !session) return;
    if (isTypingTarget(e)) return;
    const q = session.questions[idx];
    if (!q) return;
    const num = readDigit(e);
    if (num !== null && num >= 1 && num <= q.options.length) {
      if (picked === null) {
        e.preventDefault();
        answer(num - 1);
      }
      return; // پسِ پاسخ، رقمها هیچ — هر سؤال یک انتخاب
    }
    if ((e.key === "Enter" || e.key === "ArrowLeft") && picked !== null) {
      e.preventDefault();
      next();
    }
  }, phase === "run");

  // ------------------------------------------------------------- معرفی
  if (phase === "intro" || !session) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
        <h2 className="flex items-center justify-center gap-2 text-[15px] font-black text-stone-800">
          <GraduationCap size={18} aria-hidden className="text-violet-700" />
          {spec.title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-6 text-stone-600">{spec.intro}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={start}
            aria-label={spec.startAria}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-violet-700 px-5 text-[13px] font-black text-white shadow-sm transition-colors hover:bg-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 active:scale-[0.96]"
          >
            <GraduationCap size={16} aria-hidden />
            شروع تمرین
          </button>
          <button
            onClick={onExit}
            aria-label={spec.exitAria}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 text-[12.5px] font-bold text-stone-600 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 active:scale-[0.96]"
          >
            <ArrowLeft size={15} aria-hidden />
            {spec.exitLabel}
          </button>
        </div>
      </section>
    );
  }

  const q = session.questions[idx];

  // -------------------------------------------------------------- نتیجه
  if (phase === "done" && score) {
    const wrongCount = score.total - score.correct;
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        {/* سرصفحهٔ صادق (r401): نتیجهٔ مرور جای نتیجهٔ تمرین را نمیگیرد */}
        <h2 className="text-center text-[15px] font-black text-stone-800">
          {isReplay ? "نتیجهٔ مرور" : "نتیجهٔ تمرین"}
        </h2>
        <p className="mt-2 text-center">
          <span className="text-[26px] font-black text-violet-700" aria-label={`نمرهٔ ${percentFa(score.percentValue)}`}>
            {percentFa(score.percentValue)}
          </span>
          <span className="mr-2 text-[12.5px] font-bold text-stone-500">
            {faNum(score.correct)} درست از {faNum(score.total)}
          </span>
        </p>
        <ul className="mt-4 space-y-1.5" aria-label="بازخوانی سؤال‌های تمرین">
          {session.questions.map((qq, i) => {
            const a = answers[i];
            const ok = a === qq.answer;
            return (
              <li
                key={`${qq.base}-${qq.kind}-${i}`}
                className={`rounded-xl border px-3 py-2 text-[12px] leading-5 ${
                  ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
              >
                <span className="flex items-start gap-1.5">
                  {ok ? (
                    <Check size={14} aria-hidden className="mt-0.5 shrink-0 text-emerald-700" />
                  ) : (
                    <X size={14} aria-hidden className="mt-0.5 shrink-0 text-rose-700" />
                  )}
                  <span className="font-bold text-stone-700">
                    {qq.prompt}
                    {qq.speak && (
                      <span className="mr-1 inline-flex items-center gap-1 align-middle" dir="ltr">
                        <SpeakButton text={qq.speak} size="sm" />
                      </span>
                    )}
                  </span>
                </span>
                <span className="mt-1 block pr-5 text-stone-600">
                  {qq.kind === "base" ? "فعل: " : "پاسخ: "}
                  {qq.kind === "fa" ? (
                    <span className="font-black text-stone-800">{qq.options[qq.answer]}</span>
                  ) : (
                    <span dir="ltr" className="en-text font-black text-stone-800">
                      {qq.options[qq.answer]}
                    </span>
                  )}
                  {!ok && (
                    <>
                      {" · "}پاسخِ تو:{" "}
                      {qq.kind === "fa" ? (
                        <span className="font-bold text-rose-700">
                          {a == null ? "بی‌پاسخ" : qq.options[a]}
                        </span>
                      ) : (
                        <span dir="ltr" className="en-text font-bold text-rose-700">
                          {a == null ? "بی‌پاسخ" : qq.options[a]}
                        </span>
                      )}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {wrongCount > 0 && (
            <button
              onClick={replay}
              aria-label="مرور اشتباههای تمرین"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 text-[12.5px] font-black text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 active:scale-[0.96]"
            >
              <Repeat size={15} aria-hidden />
              مرور اشتباهها ({faNum(wrongCount)})
            </button>
          )}
          <button
            onClick={start}
            aria-label="تمرین دوباره"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-violet-700 px-5 text-[13px] font-black text-white shadow-sm transition-colors hover:bg-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 active:scale-[0.96]"
          >
            <RotateCcw size={15} aria-hidden />
            تمرین دوباره
          </button>
          <button
            onClick={onExit}
            aria-label={spec.exitResultAria}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 text-[12.5px] font-bold text-stone-600 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 active:scale-[0.96]"
          >
            <ArrowLeft size={15} aria-hidden />
            {spec.exitLabel}
          </button>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------- پرسش
  const answered = picked !== null;
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] font-bold text-stone-500" aria-live="polite">
          سؤال {faNum(idx + 1)} از {faNum(session.size)}
        </p>
        <button
          onClick={onExit}
          aria-label={spec.cancelAria}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-[11.5px] font-bold text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 active:scale-[0.96]"
        >
          <ArrowLeft size={14} aria-hidden />
          انصراف
        </button>
      </div>

      <div aria-hidden className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        {/* fill با scaleX (کامپوزیتپذیر، بی layout) — در RTL از راست پر میشود */}
        <div
          className="h-full w-full origin-right rounded-full bg-violet-600 transition-transform duration-300"
          style={{ transform: `scaleX(${(idx + (answered ? 1 : 0)) / session.size})` }}
        />
      </div>

      <h3 className="mt-4 flex flex-wrap items-center gap-1.5 text-[14px] font-black leading-7 text-stone-800">
        {q.speak && (
          <span className="inline-flex items-center gap-1" dir="ltr">
            <span className="en-text text-violet-700">{q.speak}</span>
            <SpeakButton text={q.speak} size="sm" />
          </span>
        )}
        <Volume2 size={13} aria-hidden className="sr-only" />
        <span>{q.prompt}</span>
      </h3>

      <div className="mt-3 grid gap-2 sm:grid-cols-2" role="group" aria-label="گزینه‌های پرسش">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isPicked = i === picked;
          // r401 — گونهٔ fa: گزینهها فارسیاند (RTL، بی en-text)؛
          // بقیهٔ گونهها انگلیسی (LTR، en-text) — ایدئومِ برعکسِ ستون.
          const isFa = q.kind === "fa";
          const cls = !answered
            ? "border-stone-300 bg-white text-stone-700 hover:border-violet-300 hover:bg-violet-50"
            : isCorrect
              ? "border-emerald-400 bg-emerald-50 text-emerald-800"
              : isPicked
                ? "border-rose-400 bg-rose-50 text-rose-700"
                : "border-stone-200 bg-white text-stone-500";
          return (
            <button
              key={`${opt}-${i}`}
              onClick={() => answer(i)}
              disabled={answered}
              aria-label={`گزینه ${faNum(i + 1)}: ${opt}${answered && isCorrect ? " — پاسخ درست" : ""}`}
              className={`flex min-h-11 items-center justify-between rounded-xl border px-3 ${isFa ? "text-right" : "text-left"} text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 active:scale-[0.96] disabled:cursor-default ${cls}`}
            >
              {/* r402 — نشانگرِ kbdِ رقمِ گزینه: قراردادِ بصریِ Kbdِ راهنما،
                  aria-hidden (شماره در aria-label هست)؛ در حالتِ پاسخخورده
                  هم میماند — قراردادِ حالت را نشانگرِ درست/نادرست میدهد */}
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-50 px-1 font-mono text-[10.5px] font-bold text-stone-500 shadow-[0_1px_0_0_#e7e5e4]"
                >
                  {faNum(i + 1)}
                </span>
                {isFa ? (
                  <span>{opt}</span>
                ) : (
                  <span dir="ltr" className="en-text">
                    {opt}
                  </span>
                )}
              </span>
              {answered && isCorrect && <Check size={15} aria-hidden className="shrink-0 text-emerald-600" />}
              {answered && isPicked && !isCorrect && <X size={15} aria-hidden className="shrink-0 text-rose-600" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={next}
          disabled={!answered}
          aria-label={idx + 1 >= session.size ? "دیدن نتیجهٔ تمرین" : "سؤال بعدی"}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-violet-700 px-5 text-[12.5px] font-black text-white shadow-sm transition-colors hover:bg-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {idx + 1 >= session.size ? "دیدن نتیجه" : "بعدی"}
          <ArrowLeft size={14} aria-hidden />
        </button>
      </div>
    </section>
  );
}
