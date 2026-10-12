"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ear,
  Volume2,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Play,
  Sparkles,
  Trophy,
  SpellCheck,
} from "lucide-react";
import type { DictationSource, DictationSourceWord, LessonData, VocabWord } from "@/lib/study-types";
import { useStudy, wordKey, resultKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { shuffle } from "@/lib/domain/shuffle";
import { percent as percentOf } from "@/lib/domain/percent";
import { faNum, posLabel, themeOf } from "@/lib/study-theme";
import { speak, speakSpell, stopSpeaking } from "@/lib/speak";
import { useToast } from "@/hooks/use-toast";
import { sendStats } from "@/lib/identity";

type Phase = "setup" | "play" | "done";

interface PickedWord extends DictationSourceWord {
  hint: number; // letters revealed
  hintUsed: boolean;
  result?: "full" | "half" | "wrong";
}

/** normalize a spelled answer: lowercase, unify apostrophes, trim punctuation/spaces */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DictationTab({
  lesson,
  source,
  onExit,
  exitLabel = "بازگشت به واژه‌های من",
}: {
  /** the classic per-lesson pool — omit when `source` is given */
  lesson?: LessonData;
  /** virtual pool (personal word-book, custom sets) — omit when `lesson` is given */
  source?: DictationSource;
  /** optional way out for non-tab embeds (my-words launcher) */
  onExit?: () => void;
  /** done-screen exit button label — the default serves the my-words flow;
   *  virtual-source dialogs pass their own («بازگشت به واژه‌های خطرناک», …) */
  exitLabel?: string;
}) {
  const { toast } = useToast();
  const mounted = useMounted();

  const known = useStudy((s) => s.known);
  const srs = useStudy((s) => s.srs);
  const reviewWord = useStudy((s) => s.reviewWord);

  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(10);
  const [smartOrder, setSmartOrder] = useState(true);
  const [words, setWords] = useState<PickedWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [state, setState] = useState<"typing" | "correct" | "wrong">("typing");
  const [score, setScore] = useState(0); // points (1 / 0.5 / 0)
  const [replaying, setReplaying] = useState(false);
  const [spelling, setSpelling] = useState(false);
  const [audioErrorFor, setAudioErrorFor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // effective pool: the virtual source wins; the lesson flow degrades to a
  // synthetic source so every downstream read has ONE shape
  const src: DictationSource | undefined =
    source ??
    (lesson
      ? { id: lesson.id, label: "درس", color: lesson.color, statsLesson: lesson.id, words: lesson.vocabulary }
      : undefined);
  /** store key for a word — the star key when pinned, else the lesson key */
  const keyOf = useCallback(
    (w: DictationSourceWord) => w.storeKey ?? wordKey((src?.id ?? 0) as number, w.en),
    [src?.id]
  );
  const t = themeOf(src?.color ?? "emerald");

  const word = words[idx];
  const total = words.length;

  const playAudio = useCallback(
    (text: string, speed = 0.85, errTag: number | null = null) => {
      setReplaying(true);
      speak(
        text,
        speed,
        () => setReplaying(false),
        () => {
          setReplaying(false);
          setAudioErrorFor(errTag);
        }
      );
    },
    []
  );

  /** hear the word spelled letter-by-letter (counts as a hint → half credit) */
  const playSpelled = useCallback((en: string, asHint: boolean) => {
    if (asHint) {
      // reveal all letters visually too, same as fully-used hint
      setWords((ws) => ws.map((w, i) => (i === idx && !w.hintUsed ? { ...w, hint: en.length, hintUsed: true } : w)));
    }
    setSpelling(true);
    speakSpell(
      en,
      () => setSpelling(false),
      () => setSpelling(false)
    );
  }, [idx]);

  const startRound = () => {
    if (!src || src.words.length === 0) return;
    const base = src.words;
    let picked = shuffle(base);
    if (smartOrder && mounted) {
      const now = Date.now();
      picked = picked.sort((a, b) => {
        const pri = (w: VocabWord) => {
          const k = keyOf(w);
          if (!known[k]) return 0; // unknown first
          const item = srs[k];
          if (item && item.dueAt <= now) return 1; // known but due
          return 2; // known and scheduled later
        };
        return pri(a) - pri(b);
      });
    }
    setWords(picked.slice(0, Math.min(count, base.length)).map((w) => ({ ...w, hint: 0, hintUsed: false })));
    setIdx(0);
    setInput("");
    setState("typing");
    setScore(0);
    setAudioErrorFor(null);
    setPhase("play");
  };

  // autoplay on each new word (deferred to a callback so React doesn't cascade renders)
  useEffect(() => {
    if (phase !== "play" || !word || state !== "typing") return;
    inputRef.current?.focus();
    const t = setTimeout(() => playAudio(word.en, 0.85, idx), 60);
    return () => clearTimeout(t);
  }, [phase, idx, state]);

  // cleanup audio + pending timer on unmount / word change
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [idx]);

  const finish = useCallback(
    (finalScore: number) => {
      if (!src) return;
      const percent = percentOf(finalScore, total);
      const correctForStats = Math.round(finalScore);
      useStudy.getState().addResult(resultKey(src.id, "dictation"), {
        correct: correctForStats,
        total,
        percent,
        at: new Date().toISOString(),
      });
      useStudy.getState().trackQuizDone();
      useStudy.getState().trackDictation(); // daily quest: dictation round
      toast({
        title: percent >= 80 ? "🏆 دیکتهٔ فوق‌العاده!" : percent >= 50 ? "👍 خوب بود، ادامه بده!" : "💪 با تمرین بهتر می‌شود",
        description: `دیکتهٔ ${src.label}: ${faNum(correctForStats)} از ${faNum(total)} (${faNum(percent)}٪)`,
        duration: 4000,
      });
      try {
        // signed fire-and-forget (Phase-0); non-lesson sources send lesson 0
        sendStats({ lesson: src.statsLesson, category: src.category ?? "dictation", total, correct: correctForStats }).catch(() => {});
      } catch {
        /* ignore */
      }
      setPhase("done");
    },
    [src, total, toast]
  );

  const goNext = useCallback(
    (newScore: number) => {
      if (idx + 1 >= total) {
        finish(newScore);
      } else {
        setIdx((i) => i + 1);
        setInput("");
        setState("typing");
      }
    },
    [idx, total, finish]
  );

  const check = () => {
    if (!word || state !== "typing") return;
    const ok = norm(input) === norm(word.en);
    const pts = ok ? (word.hintUsed ? 0.5 : 1) : 0;
    const newScore = score + pts;
    setScore(newScore);
    setState(ok ? "correct" : "wrong");
    setWords((ws) => ws.map((w, i) => (i === idx ? { ...w, result: ok ? (w.hintUsed ? "half" : "full") : "wrong" } : w)));
    // feed the SRS engine: spelling success advances the word's review schedule
    reviewWord(keyOf(word), ok && !word.hintUsed);
    // F7 — dictation is a word sighting; a wrong spelling or a needed hint
    // counts as a word-level mistake
    try {
      useStudy.getState().addWordResults([{ key: keyOf(word), ok: ok && !word.hintUsed }]);
    } catch {
      /* best-effort */
    }
    if (ok) {
      advanceTimer.current = setTimeout(() => goNext(newScore), 1500);
    }
  };

  const revealHint = () => {
    if (!word || state !== "typing") return;
    if (word.hint >= word.en.length) return;
    const nextHint = word.hint + 1;
    const nextWords = [...words];
    nextWords[idx] = { ...word, hint: nextHint, hintUsed: true };
    setWords(nextWords);
    setInput(word.en.slice(0, nextHint));
    inputRef.current?.focus();
  };

  const skip = () => {
    if (!word || state !== "typing") return;
    reviewWord(keyOf(word), false);
    try {
      useStudy.getState().addWordResults([{ key: keyOf(word), ok: false }]);
    } catch {
      /* best-effort */
    }
    setWords((ws) => ws.map((w, i) => (i === idx ? { ...w, result: "wrong" } : w)));
    setState("wrong");
  };

  const restart = () => {
    stopSpeaking();
    setPhase("setup");
    setWords([]);
    setIdx(0);
    setScore(0);
    setSpelling(false);
  };

  // ----------------------------- SETUP -----------------------------
  if (phase === "setup") {
    if (!src) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm"
      >
        <div className="h-1.5 w-full bg-gradient-to-l from-violet-500 to-fuchsia-500" />
        <div className="p-6 text-center sm:p-8">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
            <Ear size={30} />
          </span>
          <h3 className="mb-2 text-xl font-black text-stone-800">آزمون دیکته — املای شنیداری</h3>
          <p className="mx-auto mb-6 max-w-md text-[13px] leading-7 text-stone-500">
            کلمه را می‌شنوید، معنی فارسی را می‌بینید و املای انگلیسی آن را تایپ می‌کنید. واژه‌های درست و غلط در
            برنامهٔ مرور هوشمند (SRS) ثبت می‌شوند.
          </p>

          <div className="mx-auto mb-5 max-w-sm">
            <div className="mb-2 text-[12px] font-bold text-stone-500">تعداد واژه‌ها</div>
            <div className="flex justify-center gap-2">
              {[8, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                    count === n
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-violet-300 hover:text-violet-600"
                  }`}
                >
                  {faNum(n)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSmartOrder((v) => !v)}
            className={`mx-auto mb-6 flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-bold transition-all ${
              smartOrder
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-stone-200 bg-white text-stone-500 hover:text-violet-600"
            }`}
          >
            <Sparkles size={14} />
            اولویت با واژه‌های یادنگرفته و سررسید
            <span className={`h-4 w-7 rounded-full p-0.5 transition-colors ${smartOrder ? "bg-violet-600" : "bg-stone-300"}`}>
              <span className={`block h-3 w-3 rounded-full bg-white transition-transform ${smartOrder ? "-translate-x-3" : ""}`} />
            </span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={startRound}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all hover:opacity-90 active:scale-95"
            >
              <Play size={16} />
              شروع دیکته
            </button>
            {onExit && (
              <button
                onClick={() => {
                  stopSpeaking();
                  onExit();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[13px] font-bold text-stone-500 transition-all hover:bg-stone-50 active:scale-95"
              >
                بازگشت
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ----------------------------- DONE -----------------------------
  if (phase === "done") {
    const percent = percentOf(score, total);
    const noHint = words.filter((w) => w.result === "full").length;
    const half = words.filter((w) => w.result === "half").length;
    const wrong = words.filter((w) => w.result === "wrong").length;
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
            <Trophy size={28} />
          </span>
          <h3 className="mb-2 text-xl font-black text-stone-800">دیکته تمام شد!</h3>
          <p className="mb-1 text-4xl font-black text-violet-600">{faNum(percent)}٪</p>
          <p className="mb-2 text-sm text-stone-500">
            امتیاز {faNum(score)} از {faNum(total)}
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-2 text-[12px] font-bold">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">کامل: {faNum(noHint)}</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">با راهنما: {faNum(half)}</span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">غلط: {faNum(wrong)}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={startRound}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-violet-700 active:scale-95"
            >
              <RotateCcw size={15} />
              دیکتهٔ جدید
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
            >
              بازگشت به تنظیمات
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-bold text-violet-700 transition-all hover:bg-violet-100 active:scale-95"
              >
                {exitLabel}
              </button>
            )}
          </div>
        </div>

        {/* review of all asked words */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-sm font-extrabold text-stone-700">واژه‌های این دور</h4>
          <div className="grid max-h-72 gap-2 overflow-y-auto nice-scroll sm:grid-cols-2">
            {words.map((w) => (
              <div
                key={w.en}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  w.result === "full"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : w.result === "half"
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-rose-200 bg-rose-50/50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {w.result === "full" ? (
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  ) : w.result === "half" ? (
                    <Lightbulb size={16} className="shrink-0 text-amber-600" />
                  ) : (
                    <XCircle size={16} className="shrink-0 text-rose-500" />
                  )}
                  <div className="min-w-0">
                    <div className="en-text truncate text-sm font-bold text-stone-800" dir="ltr">
                      {w.en}
                    </div>
                    <div className="truncate text-[12px] text-stone-500">{w.fa}</div>
                  </div>
                </div>
                <div className="mr-2 flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => playAudio(w.en)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-600 transition-all hover:bg-violet-50"
                    aria-label={`روخوانی ${w.en}`}
                  >
                    <Volume2 size={14} />
                  </button>
                  <button
                    onClick={() => playSpelled(w.en, false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-600 transition-all hover:bg-sky-50"
                    aria-label={`املای حرف‌به‌حرف ${w.en}`}
                    title="املای حرف‌به‌حرف"
                  >
                    <SpellCheck size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // ----------------------------- PLAY -----------------------------
  if (!word) return null;

  const answerChars = word.en.split("");
  const userChars = norm(input).split("");
  const inputChars = input.split("");
  const isCorrect = state === "correct";

  return (
    <div className="space-y-4">
      {/* progress */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full bg-gradient-to-l from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${((idx + (state === "typing" ? 0 : 1)) / total) * 100}%` }}
          />
        </div>
        <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-[12px] font-bold text-violet-700">
          {faNum(Math.min(idx + 1, total))} از {faNum(total)}
        </span>
        <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[12px] font-bold text-stone-600">
          امتیاز: {faNum(score)}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.25 }}
          className={`mx-auto max-w-2xl overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-colors ${
            state === "typing"
              ? "border-violet-200"
              : isCorrect
                ? "border-emerald-300"
                : "border-rose-300"
          }`}
        >
          {/* audio area */}
          <div className="dict-setup flex flex-col items-center gap-3 bg-gradient-to-b from-violet-50/70 to-transparent p-6 pb-4">
            <motion.button
              onClick={() => playAudio(word.en, 0.85, idx)}
              whileTap={{ scale: 0.9 }}
              animate={replaying ? { scale: [1, 1.08, 1] } : {}}
              transition={replaying ? { repeat: Infinity, duration: 1 } : {}}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/35 transition-all hover:opacity-90"
              aria-label="پخش دوبارهٔ کلمه"
            >
              {/* sound waves */}
              <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" aria-hidden />
              <Volume2 size={34} />
            </motion.button>
            <div className="flex items-center gap-2 text-[12px] text-stone-400">
              <Ear size={13} />
              گوش کنید و املای کلمه را بنویسید
            </div>
            {audioErrorFor === idx && (
              <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-700">
                روخوانی در دسترس نیست — از دکمهٔ راهنما استفاده کنید
              </div>
            )}
          </div>

          {/* meaning prompt */}
          <div className="px-6 text-center">
            <div className="mb-1 flex items-center justify-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${t.chipBg}`}>
                {word.pos ? posLabel[word.pos] ?? word.pos : "واژه"}
              </span>
              {word.hintUsed && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  با راهنما (۰٫۵ امتیاز)
                </span>
              )}
            </div>
            <div className="mb-4 text-2xl font-black leading-relaxed text-stone-800">{word.fa}</div>
          </div>

          {/* input + feedback */}
          <div className="px-6 pb-6">
            {state === "typing" ? (
              <>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") check();
                  }}
                  dir="ltr"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="type the word..."
                  className="en-text mx-auto block w-full max-w-md rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 text-center text-xl font-bold tracking-wide outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
                <div className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={check}
                    disabled={!input.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:bg-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCircle2 size={16} />
                    بررسی
                  </button>
                  <button
                    onClick={revealHint}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] font-bold text-amber-700 transition-all hover:bg-amber-100 active:scale-95"
                  >
                    <Lightbulb size={15} />
                    راهنما
                  </button>
                  <button
                    onClick={() => playSpelled(word.en, true)}
                    disabled={spelling}
                    title="شنیدن املای حرف‌به‌حرف (نیم‌امتیاز)"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-[13px] font-bold text-sky-700 transition-all hover:bg-sky-100 active:scale-95 disabled:opacity-50"
                  >
                    <SpellCheck size={15} />
                    حرف‌به‌حرف
                  </button>
                  <button
                    onClick={skip}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[13px] font-bold text-stone-500 transition-all hover:bg-stone-50 active:scale-95"
                  >
                    رد کردن
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl border p-4 text-center ${
                  isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
              >
                <div className={`mb-3 flex items-center justify-center gap-2 text-sm font-black ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={17} /> آفرین! املا درست است {word.hintUsed ? "(با راهنما — نیم امتیاز)" : "(۱ امتیاز)"}
                    </>
                  ) : (
                    <>
                      <XCircle size={17} /> املای درست:
                    </>
                  )}
                </div>

                {/* letter boxes */}
                <div className="mb-3 flex flex-wrap justify-center gap-1.5" dir="ltr">
                  {answerChars.map((ch, i) => {
                    const typed = state === "wrong" ? norm(input)[i] ?? "" : inputChars[i] ?? "";
                    const wrong = state === "wrong" && typed !== ch;
                    const revealed = word.hintUsed && i < word.hint;
                    return (
                      <motion.span
                        key={i}
                        initial={wrong ? { y: -6, opacity: 0 } : false}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className={`en-text flex h-9 w-8 items-center justify-center rounded-lg border text-lg font-bold ${
                          wrong
                            ? "border-rose-300 bg-white text-rose-500 line-through decoration-rose-400"
                            : revealed
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : isCorrect
                                ? "border-emerald-300 bg-white text-emerald-700"
                                : "border-violet-300 bg-white text-violet-700"
                        }`}
                      >
                        {ch === " " ? "␣" : ch}
                      </motion.span>
                    );
                  })}
                </div>

                {state === "wrong" && userChars.length > 0 && norm(input) !== norm(word.en) && (
                  <p className="mb-3 text-[12px] text-rose-500" dir="ltr">
                    you typed: <b>{input.trim()}</b>
                  </p>
                )}

                {!isCorrect && (
                  <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => playSpelled(word.en, false)}
                      disabled={spelling}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-[12px] font-bold text-sky-700 transition-all hover:bg-sky-50 active:scale-95 disabled:opacity-50"
                    >
                      <SpellCheck size={13} />
                      {spelling ? "در حال خواندن…" : "شنیدن حرف‌به‌حرف"}
                    </button>
                    <button
                      onClick={() => playAudio(word.en)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-[12px] font-bold text-violet-700 transition-all hover:bg-violet-50 active:scale-95"
                    >
                      <Volume2 size={13} />
                      تلفظ کلمه
                    </button>
                  </div>
                )}

                {!isCorrect && (
                  <button
                    onClick={() => goNext(score)}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-violet-700 active:scale-95"
                  >
                    واژهٔ بعدی
                    <ChevronLeft size={15} />
                  </button>
                )}
                {isCorrect && (
                  <p className="animate-pulse text-[12px] font-bold text-emerald-500">در حال رفتن به واژهٔ بعدی…</p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* SRS note */}
      <p className="text-center text-[11px] text-stone-400">
        نتیجهٔ هر واژه در برنامهٔ مرور با فاصله (SRS) ثبت می‌شود — واژه‌های غلط زودتر دوباره مرور می‌شوند
      </p>
    </div>
  );
}
