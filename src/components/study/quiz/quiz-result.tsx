"use client";

// R-7 «برش موتور تست» (docs/codebase-audit.md §12 گام ۷)
// QuizResult — صفحهٔ پایان راند: حلقهٔ درصد، کارت گواهی (آزمون جامع)،
// کارت استاندارد، اشتراک‌گذاری/دانلود تصویر و مرور سؤال‌به‌سؤال.
// ظاهر پیکسل‌به‌پیکسل از quiz-engine قبلی حفظ شده است.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, Trophy, Award, Share2, ScrollText, ImageDown, Star } from "lucide-react";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy } from "@/lib/study-store";
import { starrableWord, type StarrableWord } from "@/lib/starred-from-quiz";
import { percent as percentOf } from "@/lib/domain/percent";
import { faNum } from "@/lib/study-theme";
import { downloadResultImage } from "@/lib/result-image";
import { useToast } from "@/hooks/use-toast";
import { gradeFor } from "@/lib/domain/grade";
import ExplainBox from "../shared/explain-box";
import ProgressRing from "../practice/progress-ring";
import QuizTeacher from "./quiz-teacher";
import { letters } from "./quiz-constants";

export interface QuizResultProps {
  title: string;
  questions: QuizQuestion[];
  /** frozen chosen index per question (in question order) */
  answers: number[];
  correctCount: number;
  trackMistakes?: boolean;
  certificate?: boolean;
  /** predicate: question's options are Persian → rendered RTL (word drills) */
  faOptions?: (q: QuizQuestion) => boolean;
  /** per-question group key for the result breakdown (e.g. source lesson) */
  groupOf?: (q: QuizQuestion) => string;
  /** display label per group key */
  groupLabels?: Record<string, string>;
  onRestart: () => void;
  onExit: () => void;
}

export default function QuizResult({
  title,
  questions,
  answers,
  correctCount,
  trackMistakes = true,
  certificate = false,
  faOptions,
  groupOf,
  groupLabels,
  onRestart,
  onExit,
}: QuizResultProps) {
  const [imgBusy, setImgBusy] = useState(false);
  const { toast } = useToast();
  const starredWords = useStudy((s) => s.starredWords);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const starredSet = useMemo(() => new Set(starredWords), [starredWords]);

  const total = questions.length;
  const percent = percentOf(correctCount, total);
  const wrongIds = questions.filter((qq, i) => answers[i] !== qq.answer).map((qq) => qq.id);
  const grade = gradeFor(percent);

  // «ستاره از نتیجهٔ آزمون» — wrong answers whose word can land in «واژه‌های من»
  const starrableWrong = useMemo(() => {
    const map = new Map<string, StarrableWord>();
    for (const [i, qq] of questions.entries()) {
      if (answers[i] === qq.answer) continue;
      const w = starrableWord(qq);
      if (w) map.set(qq.id, w);
    }
    return map;
  }, [questions, answers]);

  // per-group accuracy (e.g. per source lesson in the final exam)
  const groups =
    groupOf && groupLabels
      ? Object.keys(groupLabels)
          .map((key) => {
            const qs = questions.filter((qq) => groupOf(qq) === key);
            const ok = qs.filter((qq, i) => answers[questions.indexOf(qq)] === qq.answer).length;
            return { key, label: groupLabels[key], total: qs.length, correct: ok };
          })
          .filter((g) => g.total > 0)
      : [];

  const saveResultImage = async (premium: boolean) => {
    if (imgBusy) return;
    setImgBusy(true);
    const ok = await downloadResultImage({
      title,
      percent,
      correct: correctCount,
      total,
      userName: useStudy.getState().userName || undefined,
      premium,
    });
    setImgBusy(false);
    toast(
      ok
        ? { title: "🖼 تصویر نتیجه ذخیره شد", description: "حالا می‌توانی آن را در هر کجا به اشتراک بگذاری.", duration: 3000 }
        : { title: "خطا در ساخت تصویر", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };

  const shareResult = async () => {
    const breakdown = groups.map((g) => `${g.label}: ${faNum(percentOf(g.correct, g.total))}٪`).join(" · ");
    const text = `🏆 نتیجهٔ من در وب‌کتاب «Vision Two»\n${title}\n⭐ ${faNum(percent)}٪ (${faNum(correctCount)} از ${faNum(total)})${breakdown ? `\n📊 ${breakdown}` : ""}`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: "نتیجهٔ وب‌کتاب Vision Two", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast({ title: "✓ نتیجه کپی شد", description: "می‌توانی آن را برای دوستانت بفرستی!", duration: 3000 });
    } catch {
      /* user cancelled share */
    }
  };

  const certificateCard = (
    <div className="certificate-card rounded-2xl bg-white p-1.5 shadow-xl">
      <div className="rounded-xl border-2 border-dashed border-amber-300 p-5 text-center sm:p-6">
        <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-black tracking-widest text-amber-600">
          <ScrollText size={14} />
          WEBBOOK CERTIFICATE · وب‌کتاب ویژن دو
        </div>
        <div className="mb-4 flex justify-center">
          <ProgressRing percent={percent} size={116} stroke={10}>
            <div>
              <div className="text-2xl font-black text-stone-800">{faNum(percent)}٪</div>
              <div className="text-[11px] text-stone-500" dir="ltr">
                {correctCount}/{total}
              </div>
            </div>
          </ProgressRing>
        </div>
        <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full bg-gradient-to-l from-amber-400 to-orange-500 px-4 py-1.5 text-[13px] font-black text-white shadow-lg shadow-amber-500/30">
          <Award size={16} />
          {title}
        </div>
        <p className={`mb-1 text-sm font-bold ${grade.cls}`}>{grade.msg}</p>
        <p className="mb-4 text-[11.5px] text-stone-400">
          تاریخ اخذ: {new Date().toLocaleDateString("fa-IR")} · وب‌کتاب تعاملی زبان انگلیسی یازدهم
        </p>

        {/* per-source breakdown */}
        {groups.length > 0 && (
          <div className="mx-auto mb-4 grid max-w-md gap-2 text-right" dir="rtl">
            {groups.map((g) => {
              const pct = percentOf(g.correct, g.total);
              const bar = pct >= 70 ? "from-emerald-400 to-emerald-600" : pct >= 50 ? "from-amber-400 to-orange-500" : "from-rose-400 to-rose-600";
              return (
                <div key={g.key} className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between text-[11.5px] font-bold">
                    <span className="text-stone-600">{g.label}</span>
                    <span className="text-stone-800">
                      {faNum(g.correct)}/{faNum(g.total)} — {faNum(pct)}٪
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-l ${bar}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2.5">
          <button
            onClick={shareResult}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-600/25 transition-[opacity,transform] hover:opacity-90 active:scale-95"
          >
            <Share2 size={15} />
            اشتراک‌گذاری نتیجه
          </button>
          <button
            onClick={() => saveResultImage(true)}
            disabled={imgBusy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 transition-[background-color,opacity,transform] hover:bg-amber-100 active:scale-95 disabled:opacity-50"
          >
            <ImageDown size={15} />
            {imgBusy ? "در حال ساخت تصویر…" : "دانلود تصویر نتیجه"}
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-[background-color,transform] hover:bg-emerald-700 active:scale-95"
          >
            <RotateCcw size={15} />
            تلاش مجدد
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition-[background-color,transform] hover:bg-stone-50 active:scale-95"
          >
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );

  const standardCard = (
    <div className="rounded-2xl border c-card p-6 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <ProgressRing percent={percent} size={120} stroke={10}>
          <div>
            <div className="text-2xl font-black text-stone-800">{percent}٪</div>
            <div className="text-[11px] text-stone-500" dir="ltr">
              {correctCount}/{total}
            </div>
          </div>
        </ProgressRing>
      </div>
      <div className="mb-1 flex items-center justify-center gap-2 text-lg font-black">
        <Trophy size={20} className="text-amber-500" />
        <span className="text-stone-800">{title} — نتیجهٔ نهایی</span>
      </div>
      <p className={`mb-5 text-sm font-bold ${grade.cls}`}>{grade.msg}</p>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {trackMistakes && wrongIds.length > 0 && (
          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[12px] font-bold text-rose-600">
            {wrongIds.length} سؤال به بانک مرور اشتباهات اضافه شد
          </span>
        )}
        {trackMistakes && starrableWrong.size > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-700">
            واژه‌های اشتباه را با ستاره به «واژه‌های من» بفرست
          </span>
        )}
        {!trackMistakes && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-700">
            تمرین هدفمند انجام شد — واژه‌های خطرناک به‌روزرسانی شدند
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button
          onClick={() => saveResultImage(false)}
          disabled={imgBusy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition-[background-color,opacity,transform] hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
        >
          <ImageDown size={15} />
          {imgBusy ? "در حال ساخت تصویر…" : "دانلود تصویر نتیجه"}
        </button>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-[background-color,transform] hover:bg-emerald-700 active:scale-95"
        >
          <RotateCcw size={15} />
          تلاش مجدد
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition-[background-color,transform] hover:bg-stone-50 active:scale-95"
        >
          بازگشت
        </button>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {certificate ? certificateCard : standardCard}

      {/* «معلمِ کارنامه» — the AI teacher's honest session review (Task 117);
          ids + raw chosen indices only, correctness recomputed server-side.
          Task 118: the real session outcome feeds the shareable teacher card */}
      <QuizTeacher
        ids={questions.map((qq) => qq.id)}
        answers={questions.map((_, i) => answers[i])}
        correct={correctCount}
        total={total}
        userName={useStudy.getState().userName || undefined}
      />

      {/* review */}
      <div className="max-h-[46vh] space-y-2.5 overflow-y-auto nice-scroll pl-1">
        {questions.map((qq, i) => {
          const my = answers[i];
          const ok = my === qq.answer;
          const sw = ok ? undefined : starrableWrong.get(qq.id);
          const isStarred = sw !== undefined && starredSet.has(sw.key);
          return (
            <div
              key={qq.id}
              className={`rounded-xl border p-3.5 ${
                ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"
              }`}
            >
              <div className="mb-1.5 flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                    ok ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                >
                  {ok ? <Check size={12} /> : <X size={12} />}
                </span>
                <p className="en-text flex-1 text-[13.5px] leading-7 text-stone-800" dir="ltr">
                  <b className="mr-1 text-stone-400">{i + 1}.</b>
                  {qq.question}
                </p>
                {sw && (
                  <motion.button
                    whileTap={{ scale: 0.75 }}
                    onClick={() => toggleStarred(sw.key)}
                    title={isStarred ? `حذف «${sw.en}» از واژه‌های من` : `افزودن «${sw.en}» به واژه‌های من`}
                    aria-label={isStarred ? `حذف ${sw.en} از واژه‌های من` : `افزودن ${sw.en} به واژه‌های من`}
                    aria-pressed={isStarred}
                    className="shrink-0 rounded-md p-1 transition-transform hover:scale-110 active:scale-90"
                  >
                    <Star size={15} className={isStarred ? "fill-amber-400 text-amber-400" : "text-rose-300 transition-colors hover:text-amber-400"} />
                  </motion.button>
                )}
              </div>
              <p className="mr-7 text-[12.5px] text-stone-600">
                پاسخ شما: <span className={`${faOptions?.(qq) ? "" : "en-text "}font-bold`} dir={faOptions?.(qq) ? "rtl" : "ltr"}>{my !== undefined ? `${letters[my]}) ${qq.options[my]}` : "—"}</span>
                {!ok && (
                  <>
                    {" "}· پاسخ درست:{" "}
                    <span className={`${faOptions?.(qq) ? "" : "en-text "}font-bold text-emerald-700`} dir={faOptions?.(qq) ? "rtl" : "ltr"}>
                      {letters[qq.answer]}) {qq.options[qq.answer]}
                    </span>
                  </>
                )}
              </p>
              {qq.translation && (
                <p className="mr-7 mt-1 text-[12px] leading-6 text-stone-500">{qq.translation}</p>
              )}
              {!ok && (
                <div className="mr-7 mt-2">
                  <ExplainBox questionId={qq.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
