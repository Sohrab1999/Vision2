"use client";

// ------------------------------------------------------------------
// Task 119 «معلمِ هفته» — the AI teacher's verdict on the whole week,
// at the bottom of the weekly report band. The week teacher is the
// exam teacher's (117) weekly sibling: the client ships ONLY the
// report band's own aggregate numbers (never the raw dayHistory — the
// week lives in localStorage and the envelope must stay tiny), the
// server validates internal consistency and caches per week
// fingerprint. Provenance is honest: تازه (fresh AI) / آماده (cached)
// / حالت آفلاین (fallback). The honest gate is ONE evaluator shared
// with the route: an empty week (no activity, no duel) renders no
// launcher at all — the teacher never judges a week that never
// happened.
// ------------------------------------------------------------------

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, Sparkles, RotateCcw, ImageDown, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { TeacherReview } from "@/lib/exam-teacher";
import { hasWeekVerdict, type WeekTeacherStats } from "@/lib/week-teacher";
import { weekGoalMeta } from "@/lib/week-goal";
import { useStudy } from "@/lib/study-store";
import { downloadWeekCardImage, buildWeekCardBlob , imageFailToast } from "@/lib/result-image";
import { canShareImageFiles, blobToFile, shareImageFile, type ShareOutcome } from "@/lib/share-card";
import { useToast } from "@/hooks/use-toast";

interface WeekTeacherState {
  status: "idle" | "loading" | "done" | "error";
  review?: TeacherReview;
  source?: "ai" | "fallback";
  cached?: boolean;
  /** honest server message (e.g. quota exhausted) — shown verbatim */
  serverMsg?: string;
}

export default function WeekTeacher({ stats }: { stats: WeekTeacherStats }) {
  const [state, setState] = useState<WeekTeacherState>({ status: "idle" });
  const { toast } = useToast();
  const userName = useStudy((s) => s.userName);
  // Task 121 — کارتِ PNGِ داوریِ هفته: ذخیره همیشه، هم‌رسانیِ بومی فقط با
  // پشتیبانیِ واقعیِ canShare({files}) (الگویِ صداقتِ ۱۰۲/۱۱۸/۱۲۰)
  const [imgBusy, setImgBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  // the one verdict gate — same evaluator the route re-runs (never two faces)
  if (!hasWeekVerdict(stats)) return null;

  const saveCard = async () => {
    if (imgBusy || shareBusy || !state.review) return;
    setImgBusy(true);
    const ok = await downloadWeekCardImage({
      review: state.review,
      stats,
      userName,
      source: state.source,
    });
    setImgBusy(false);
    if (ok) {
      toast(
        { title: "🗓 کارتِ معلمِ هفته ذخیره شد", description: "داوریِ این هفته حالا یک عکسِ قابلِ فرستادن است.", duration: 3000 }
      );
    } else {
      imageFailToast(); // r397 — نامِ واحدِ جفتِ شکستِ تصویر (سرشماریِ مالک)
    }
  };

  const shareCard = async () => {
    if (shareBusy || imgBusy || !state.review) return;
    setShareBusy(true);
    const blob = await buildWeekCardBlob({
      review: state.review,
      stats,
      userName,
      source: state.source,
    });
    let outcome: ShareOutcome = "failed";
    if (blob) {
      // Task 138 — متنِ هم‌رسانی هم از قرارداد می‌خواند (آخرین برچسبِ خامِ
      // مخزن): عددِ clamp‌شده از meta.label؛ پسوندِ «کامل» گویشِ همین متن است.
      const shareGoal = weekGoalMeta(stats.goalDays);
      outcome = await shareImageFile({
        file: blobToFile(blob, "vision2-week-teacher.png"),
        title: "معلمِ هفته — وب‌کتاب ویژن ۲",
        text: `🗓 داوریِ معلم برای این هفته: ${shareGoal.label} کامل`,
      });
    }
    setShareBusy(false);
    if (outcome === "shared") {
      toast({ title: "📨 کارتِ معلمِ هفته هم‌رسانی شد", description: "عکس با شیتِ خودِ سیستم فرستاده شد.", duration: 3000 });
    } else if (outcome === "failed") {
      toast({ title: "هم‌رسانی ممکن نشد", description: "می‌توانی عکس را ذخیره کنی و خودت بفرستی.", duration: 3000 });
    }
    // cancelled → سکوتِ کامل (لغوِ کاربر اتفاق نیست)
  };

  const ask = async () => {
    if (state.status === "loading") return;
    trackEvent("week_review_start");
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/week-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
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
      if (data.source !== "fallback" && !data.cached) {
        toast({ title: "🎓 معلمِ هفته آماده شد", description: "داوریِ این هفته بر اساسِ اعدادِ واقعیِ هفته‌نامه است.", duration: 3000 });
      }
    } catch {
      setState({ status: "error" });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="معلمِ هفته"
      className="week-teacher mt-1 overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-l from-arcade-tint/90 to-white"
    >
      <div className="flex flex-wrap items-center gap-2.5 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-arcade-from-soft to-arcade-to text-white shadow-md shadow-violet-900/20">
          <GraduationCap size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[12.5px] font-extrabold text-stone-800">معلمِ هفته</h3>
          <p className="text-[10.5px] leading-5 text-stone-500">
            قضاوتِ معلم روی همین هفته — صادق، بر اساسِ اعدادِ همین هفته‌نامه
          </p>
        </div>
        <button
          onClick={ask}
          disabled={state.status === "loading"}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-arcade-from-soft to-arcade-to px-3.5 py-2 text-[12px] font-black text-white shadow-md shadow-violet-500/25 transition-[opacity,transform] hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="نظر معلم را برای این هفته بخواه"
        >
          {state.status === "loading" ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              معلم هفته‌ات را می‌خواند…
            </>
          ) : state.status === "done" ? (
            <>
              <RotateCcw size={13} />
              داوریِ تازه
            </>
          ) : (
            <>
              <Sparkles size={13} />
              نظرِ معلم را بخواه
            </>
          )}
        </button>
      </div>

      {state.status === "done" && state.review && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="c-veil-60 border-t border-violet-100 p-3"
          data-week-review
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-black text-violet-700">
              <Sparkles size={12} />
              نظرِ معلمِ هفته
            </span>
            {state.source === "fallback" ? (
              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-500">حالت آفلاین</span>
            ) : state.cached ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-500">آماده</span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">تازه</span>
            )}
          </div>

          <p className="text-[12.5px] leading-6 text-stone-800">{state.review.intro}</p>

          <div className="mt-2 grid gap-1.5">
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50/80 px-2.5 py-1.5">
              <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <p className="text-[11.5px] leading-6 text-stone-700">
                <b className="text-emerald-700">نقطهٔ قوت: </b>
                {state.review.strength}
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50/80 px-2.5 py-1.5">
              <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
              <p className="text-[11.5px] leading-6 text-stone-700">
                <b className="text-amber-700">تمرینِ پیشنهادی: </b>
                {state.review.advice}
              </p>
            </div>
          </div>

          {/* Task 121 — کارتِ PNGِ همین داوری: ذخیره همیشه، هم‌رسانیِ بومی
              فقط وقتی مرورگر واقعاً فایل می‌پذیرد (الگویِ صداقتِ ۱۰۲/۱۱۸) */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={saveCard}
              disabled={imgBusy || shareBusy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-[11.5px] font-black text-violet-700 transition-[background-color,border-color,opacity,transform] hover:border-violet-300 hover:bg-violet-50/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ذخیرهٔ عکس نظر معلم هفته"
            >
              {imgBusy ? <Loader2 size={12} className="animate-spin" aria-hidden /> : <ImageDown size={12} aria-hidden />}
              ذخیرهٔ کارتِ هفته
            </button>
            {canShareImageFiles() && (
              <button
                onClick={shareCard}
                disabled={imgBusy || shareBusy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-[11.5px] font-black text-violet-700 transition-[background-color,border-color,opacity,transform] hover:border-violet-300 hover:bg-violet-50/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="هم‌رسانی عکس نظر معلم هفته"
              >
                {shareBusy ? <Loader2 size={12} className="animate-spin" aria-hidden /> : <Share2 size={12} aria-hidden />}
                هم‌رسانی
              </button>
            )}
          </div>
        </motion.div>
      )}

      {state.status === "error" && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-violet-100 bg-rose-50/60 p-3 text-[11.5px] font-bold text-rose-600">
          <span>{state.serverMsg ?? "داوریِ هفته ساخته نشد — اتصال را چک کن و دوباره تلاش کن."}</span>
          <button
            onClick={ask}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 transition-[background-color,transform] hover:bg-rose-50 active:scale-95"
            aria-label="تلاش دوباره برای داوری هفته"
          >
            <RotateCcw size={11} />
            تلاش دوباره
          </button>
        </div>
      )}
    </motion.section>
  );
}
