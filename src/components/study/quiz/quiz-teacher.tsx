"use client";

// «معلمِ کارنامه» — the AI teacher's review launcher on the quiz result
// screen (Task 117). Mirrors the story panel's honest posture: the client
// ships ONLY ids + raw chosen indices (question text never travels — the
// explain security posture), the server recomputes correctness from the
// bundled keys, and the panel renders the three controlled sections
// inline — the result page stays the learner's place. Provenance is
// honest: تازه (fresh AI) / آماده (cached) / حالت آفلاین (fallback).

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, Sparkles, RotateCcw, ImageDown, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { TeacherReview } from "@/lib/exam-teacher";
import { percent as percentOf } from "@/lib/domain/percent";
import { faNum } from "@/lib/study-theme";
import { downloadTeacherCardImage, buildTeacherCardBlob } from "@/lib/result-image";
import { canShareImageFiles, blobToFile, shareImageFile, type ShareOutcome } from "@/lib/share-card";
import { useToast } from "@/hooks/use-toast";

interface TeacherState {
  status: "idle" | "loading" | "done" | "error";
  review?: TeacherReview;
  source?: "ai" | "fallback";
  cached?: boolean;
  /** honest server message (e.g. out-of-bank sessions) — shown verbatim */
  serverMsg?: string;
}

export default function QuizTeacher({
  ids,
  answers,
  correct = 0,
  total = 0,
  userName,
}: {
  ids: string[];
  answers: (number | undefined)[];
  /** نتیجهٔ واقعیِ همین جلسه — برای کارتِ PNG (تسک ۱۱۸) */
  correct?: number;
  total?: number;
  userName?: string;
}) {
  const [state, setState] = useState<TeacherState>({ status: "idle" });
  const [imgBusy, setImgBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const { toast } = useToast();
  const percent = percentOf(correct, total);

  // Task 118 — کارتِ نظرِ معلم: همان سه‌بخشِ صادقِ همین پنل به PNG؛
  // ذخیره همیشه هست، هم‌رسانیِ بومی فقط با پشتیبانیِ واقعیِ canShare({files})
  const saveCard = async () => {
    if (imgBusy || shareBusy || !state.review) return;
    setImgBusy(true);
    const ok = await downloadTeacherCardImage({
      review: state.review,
      correct,
      total,
      percent,
      userName,
      source: state.source,
    });
    setImgBusy(false);
    toast(
      ok
        ? { title: "🖼 کارتِ معلم ذخیره شد", description: "داوریِ همین جلسه حالا یک عکسِ قابلِ فرستادن است.", duration: 3000 }
        : { title: "خطا در ساخت تصویر", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };

  const shareCard = async () => {
    if (shareBusy || imgBusy || !state.review) return;
    setShareBusy(true);
    const blob = await buildTeacherCardBlob({
      review: state.review,
      correct,
      total,
      percent,
      userName,
      source: state.source,
    });
    let outcome: ShareOutcome = "failed";
    if (blob) {
      outcome = await shareImageFile({
        file: blobToFile(blob, "vision2-teacher.png"),
        title: "معلمِ کارنامه — وب‌کتاب ویژن ۲",
        text: `🎓 نظرِ معلم دربارهٔ کارنامه‌ام: ${faNum(percent)}٪ (${faNum(correct)} از ${faNum(total)})`,
      });
    }
    setShareBusy(false);
    if (outcome === "shared") {
      toast({ title: "📨 نظرِ معلم هم‌رسانی شد", description: "کارت با شیتِ خودِ سیستم فرستاده شد.", duration: 3000 });
    } else if (outcome === "failed") {
      toast({ title: "هم‌رسانی ممکن نشد", description: "می‌توانی عکس را ذخیره کنی و خودت بفرستی.", duration: 3000 });
    }
    // cancelled → سکوتِ کامل (لغوِ کاربر اتفاق نیست)
  };

  const ask = async () => {
    if (state.status === "loading" || ids.length === 0) return;
    trackEvent("exam_review_start");
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/exam-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids,
          answers: answers.map((a) => (typeof a === "number" ? a : null)),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | (TeacherReview & { source?: "ai" | "fallback"; cached?: boolean; error?: string })
        | null;
      if (!res.ok || !data?.intro || !data.strength || !data.advice) {
        setState({ status: "error", serverMsg: !res.ok ? data?.error : undefined });
        return;
      }
      setState({
        status: "done",
        review: { intro: data.intro, strength: data.strength, advice: data.advice },
        source: data.source ?? "ai",
        cached: data.cached,
      });
    } catch {
      setState({ status: "error" });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="معلمِ کارنامه"
      className="quiz-teacher overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50/90 to-white shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-900/20">
          <GraduationCap size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13.5px] font-extrabold text-stone-800">معلمِ کارنامه</h3>
          <p className="text-[11.5px] leading-5 text-stone-500">
            بازخوردِ هوشمندِ معلم روی همین جلسه — صادق، بر اساسِ پاسخ‌های واقعیِ تو
          </p>
        </div>
        <button
          onClick={ask}
          disabled={state.status === "loading"}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-violet-500 to-fuchsia-600 px-4 py-2.5 text-[13px] font-black text-white shadow-md shadow-violet-500/25 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="نظرِ معلم را برای این جلسه بخواه"
        >
          {state.status === "loading" ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              معلم دارد کارنامه‌ات را می‌خواند…
            </>
          ) : state.status === "done" ? (
            <>
              <RotateCcw size={14} />
              نظرِ تازهٔ معلم
            </>
          ) : (
            <>
              <Sparkles size={14} />
              نظرِ معلم را بخواه
            </>
          )}
        </button>
      </div>

      {state.status === "done" && state.review && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="c-veil-60 border-t border-violet-100 p-4"
          data-ai-review
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-black text-violet-700">
              <Sparkles size={13} />
              نظرِ معلم
            </span>
            {state.source === "fallback" ? (
              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-500">حالت آفلاین</span>
            ) : state.cached ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-500">آماده</span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">تازه</span>
            )}
          </div>

          <p className="text-[13.5px] leading-7 text-stone-800">{state.review.intro}</p>

          <div className="mt-3 grid gap-2">
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50/80 px-3 py-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <p className="text-[12.5px] leading-6 text-stone-700">
                <b className="text-emerald-700">نقطهٔ قوت: </b>
                {state.review.strength}
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-amber-50/80 px-3 py-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
              <p className="text-[12.5px] leading-6 text-stone-700">
                <b className="text-amber-700">تمرینِ پیشنهادی: </b>
                {state.review.advice}
              </p>
            </div>
          </div>

          {/* Task 118 — کارتِ PNGِ همین داوری: ذخیره همیشه، هم‌رسانیِ بومی فقط
              وقتی مرورگر واقعاً فایل می‌پذیرد (الگویِ صداقتِ ۱۰۲) */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={saveCard}
              disabled={imgBusy || shareBusy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-[12px] font-black text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-50/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ذخیرهٔ عکس نظر معلم"
            >
              {imgBusy ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <ImageDown size={13} aria-hidden />}
              ذخیرهٔ کارتِ معلم
            </button>
            {canShareImageFiles() && (
              <button
                onClick={shareCard}
                disabled={imgBusy || shareBusy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-[12px] font-black text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-50/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="هم‌رسانی عکس نظر معلم"
              >
                {shareBusy ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Share2 size={13} aria-hidden />}
                هم‌رسانی
              </button>
            )}
          </div>
        </motion.div>
      )}

      {state.status === "error" && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-violet-100 bg-rose-50/60 p-4 text-[12.5px] font-bold text-rose-600">
          <span>{state.serverMsg ?? "بازخورد ساخته نشد — اتصال را چک کن و دوباره تلاش کن."}</span>
          <button
            onClick={ask}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 transition-all hover:bg-rose-50 active:scale-95"
            aria-label="تلاش دوباره برای گرفتن نظر معلم"
          >
            <RotateCcw size={11} />
            تلاش دوباره
          </button>
        </div>
      )}
    </motion.section>
  );
}
