"use client";

// «داستانِ واژه‌های من» — the AI mini-story launcher inside the personal
// word-book (Task 116). Mirrors the review/flashcards/dictation launcher
// trio: takes the CURRENTLY FILTERED star list, sends wordKeys only (the
// server resolves content — the explain security posture), and renders the
// cached controlled story inline on the same card: English paragraphs with
// the target words highlighted + the Persian summary line + one-shot TTS.
// The panel never navigates away — the word-book stays the learner's place.

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenText, Wand2, Loader2, Volume2, Square, Sparkles, RotateCcw, ImageDown, Share2 } from "lucide-react";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import { speak, stopSpeaking, type SpeakStop } from "@/lib/speak";
import { useStudy } from "@/lib/study-store";
import type { ResolvedStar } from "@/lib/my-words-resolve";
import { STORY_MIN_WORDS, STORY_MAX_WORDS, storySegments, type StoryWord } from "@/lib/story-forge";
import { downloadStoryCardImage, buildStoryCardBlob } from "@/lib/result-image";
import { canShareImageFiles, blobToFile, shareImageFile, type ShareOutcome } from "@/lib/share-card";
import { useToast } from "@/hooks/use-toast";

interface StoryState {
  status: "idle" | "loading" | "done" | "error";
  story?: string;
  summary?: string;
  source?: "ai" | "fallback";
  cached?: boolean;
  words?: StoryWord[];
}

export default function MyWordsStory({ stars }: { stars: ResolvedStar[] }) {
  const [state, setState] = useState<StoryState>({ status: "idle" });
  const [speaking, setSpeaking] = useState(false);
  const stopRef = useRef<SpeakStop | null>(null);
  const userName = useStudy((s) => s.userName);
  const { toast } = useToast();
  // Task 120 — کارتِ PNGِ داستان: ذخیره همیشه، هم‌رسانیِ بومی فقط با
  // پشتیبانیِ واقعیِ canShare({files}) (الگویِ صداقتِ ۱۰۲/۱۱۸)
  const [imgBusy, setImgBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  const eligible = stars.length >= STORY_MIN_WORDS;
  // the filter's own order (newest first by default) — the cap keeps the
  // request tiny and the cache key bounded; the rest of the list just waits
  const chosen = useMemo(() => stars.slice(0, STORY_MAX_WORDS), [stars]);

  const segments = useMemo(
    () => (state.story && state.words ? storySegments(state.story, state.words) : []),
    [state.story, state.words]
  );

  /** تعدادِ جایِ نشان‌شدهٔ واقعی — عددِ روی کارت و متنِ share، نه ادعا */
  const hitCount = useMemo(() => segments.reduce((n, s) => n + (s.hit ? 1 : 0), 0), [segments]);

  const saveCard = async () => {
    if (imgBusy || shareBusy || !state.story || !state.summary) return;
    setImgBusy(true);
    const ok = await downloadStoryCardImage({
      story: state.story,
      summary: state.summary,
      words: state.words ?? [],
      userName,
      source: state.source,
    });
    setImgBusy(false);
    toast(
      ok
        ? { title: "📖 کارتِ داستان ذخیره شد", description: "داستانت با واژه‌های برجسته حالا یک عکسِ قابلِ فرستادن است.", duration: 3000 }
        : { title: "خطا در ساخت تصویر", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };

  const shareCard = async () => {
    if (shareBusy || imgBusy || !state.story || !state.summary) return;
    setShareBusy(true);
    const blob = await buildStoryCardBlob({
      story: state.story,
      summary: state.summary,
      words: state.words ?? [],
      userName,
      source: state.source,
    });
    let outcome: ShareOutcome = "failed";
    if (blob) {
      outcome = await shareImageFile({
        file: blobToFile(blob, "vision2-story.png"),
        title: "داستانِ واژه‌های من — وب‌کتاب ویژن ۲",
        text: `📖 داستانی با واژه‌های خودم — ${faNum(hitCount)} واژهٔ برجسته`,
      });
    }
    setShareBusy(false);
    if (outcome === "shared") {
      toast({ title: "📨 کارتِ داستان هم‌رسانی شد", description: "عکس با شیتِ خودِ سیستم فرستاده شد.", duration: 3000 });
    } else if (outcome === "failed") {
      toast({ title: "هم‌رسانی ممکن نشد", description: "می‌توانی عکس را ذخیره کنی و خودت بفرستی.", duration: 3000 });
    }
    // cancelled → سکوتِ کامل (لغوِ کاربر اتفاق نیست)
  };

  const forge = async () => {
    if (!eligible || state.status === "loading") return;
    trackEvent("my_words_story_start");
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: chosen.map((s) => s.key) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as {
        story?: string;
        summary?: string;
        source?: "ai" | "fallback";
        cached?: boolean;
        words?: StoryWord[];
      };
      if (!data.story || !data.summary) throw new Error("empty");
      setState({
        status: "done",
        story: data.story,
        summary: data.summary,
        source: data.source ?? "ai",
        cached: data.cached,
        words: data.words,
      });
    } catch {
      setState({ status: "error" });
    }
  };

  const readAloud = () => {
    if (!state.story) return;
    if (speaking) {
      stopRef.current?.();
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    void speak(state.story, 0.9, () => setSpeaking(false), () => setSpeaking(false)).then(
      (stop) => {
        stopRef.current = stop;
      },
      () => setSpeaking(false)
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="داستانِ واژه‌های من"
      className="mywords-story overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-l from-sky-50/90 to-white shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-900/20">
          <BookOpenText size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold text-stone-800">داستانِ واژه‌های من</h2>
          <p className="text-[11.5px] leading-5 text-stone-500">
            {eligible
              ? `یک داستان کوتاه انگلیسی با ${faNum(chosen.length)} واژهٔ نشان‌شده‌ات — واژه‌ها داخلش برجسته‌اند`
              : `برای ساخت داستان دست‌کم ${faNum(STORY_MIN_WORDS)} واژه نشان کن${stars.length > 0 ? ` — فعلاً ${faNum(stars.length)} واژه داری` : ""}`}
          </p>
        </div>
        {eligible ? (
          <button
            onClick={forge}
            disabled={state.status === "loading"}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-sky-500 to-cyan-600 px-4 py-2.5 text-[13px] font-black text-white shadow-md shadow-sky-500/25 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="ساخت داستان با واژه‌های نشان‌شده"
          >
            {state.status === "loading" ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                داریم می‌سازیم…
              </>
            ) : (
              <>
                <Wand2 size={14} />
                ساخت داستان
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => trackEvent("my_words_open")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-[13px] font-bold text-sky-700 transition-all hover:bg-sky-50 active:scale-95"
          >
            <RotateCcw size={14} />
            رفتن به دیکشنری
          </button>
        )}
      </div>

      {/* the tale — inline on the same card, word-book stays home */}
      {state.status === "done" && state.story && state.summary && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="c-veil-60 border-t border-sky-100 p-4 sm:p-5"
          data-ai-story
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-black text-sky-700">
              <Sparkles size={13} />
              داستان تو
            </span>
            <div className="flex items-center gap-1.5">
              {state.source === "fallback" ? (
                <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-500">حالت آفلاین</span>
              ) : state.cached ? (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-500">آماده</span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">تازه</span>
              )}
              <button
                onClick={readAloud}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-all active:scale-95 ${
                  speaking ? "border-sky-400 bg-sky-500 text-white" : "border-sky-200 bg-white text-sky-600 hover:bg-sky-50"
                }`}
                aria-label={speaking ? "توقف روخوانی داستان" : "روخوانی داستان"}
              >
                {speaking ? <Square size={11} /> : <Volume2 size={12} />}
                {speaking ? "توقف" : "روخوانی"}
              </button>
            </div>
          </div>

          <p dir="ltr" className="en-text text-left text-[14.5px] leading-8 text-stone-800">
            {segments.map((seg, i) =>
              seg.hit ? (
                <mark
                  key={i}
                  title={state.words?.find((w) => w.en.toLowerCase() === seg.hit!.toLowerCase())?.fa ?? seg.hit}
                  className="rounded bg-amber-100 px-0.5 font-bold text-amber-700"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </p>

          <p className="mt-3 rounded-xl bg-sky-50/80 px-3 py-2 text-[12.5px] leading-6 text-stone-600">
            <b className="text-sky-700">خلاصه: </b>
            {state.summary}
          </p>

          {/* Task 120 — کارتِ PNGِ همین داستان: ذخیره همیشه، هم‌رسانیِ بومی
              فقط وقتی مرورگر واقعاً فایل می‌پذیرد (الگویِ صداقتِ ۱۰۲/۱۱۸) */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={saveCard}
              disabled={imgBusy || shareBusy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-[12px] font-black text-sky-700 transition-all hover:border-sky-300 hover:bg-sky-50/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ذخیرهٔ عکس داستان"
            >
              {imgBusy ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <ImageDown size={13} aria-hidden />}
              ذخیرهٔ کارتِ داستان
            </button>
            {canShareImageFiles() && (
              <button
                onClick={shareCard}
                disabled={imgBusy || shareBusy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-[12px] font-black text-sky-700 transition-all hover:border-sky-300 hover:bg-sky-50/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="هم‌رسانی عکس داستان"
              >
                {shareBusy ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Share2 size={13} aria-hidden />}
                هم‌رسانی
              </button>
            )}
          </div>
        </motion.div>
      )}

      {state.status === "error" && (
        <div className="border-t border-sky-100 bg-rose-50/60 p-4 text-[12.5px] font-bold text-rose-600">
          داستان ساخته نشد — اتصال را چک کن و دوباره تلاش کن.
        </div>
      )}
    </motion.section>
  );
}
