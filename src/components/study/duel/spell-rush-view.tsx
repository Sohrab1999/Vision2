"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Zap,
  Ear,
  Flame,
  Trophy,
  Play,
  RotateCcw,
  Home,
  Sparkles,
  Target,
  Timer,
  Download,
  Lightbulb,
  Volume2,
  SkipForward,
  Keyboard,
} from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { useToast } from "@/hooks/use-toast";
import { useCountdown } from "@/hooks/use-countdown";
import { percent } from "@/lib/domain/percent";
import { downloadResultImage } from "@/lib/result-image";
import { speak, stopSpeaking } from "@/lib/speak";
import { trackEvent } from "@/lib/analytics";
import { sendStats } from "@/lib/identity";
import {
  buildSpellDeck,
  scoreAnswer,
  SPELL_ROUND_MS,
  SPELL_HINT_POINTS,
  type SpellItem,
} from "@/lib/spell-rush";
import Confetti from "../shared/confetti";

// ------------------------------------------------------------------
// «دیکتهٔ برق‌آسا» — 60-second spelling sprint: hear the word, type it.
// The arcade shell (rush-hero/hud/card/done) is REUSED so the sprint
// inherits the whole dark taxonomy; the listening accents are sky.
// Scoring/economics live in lib/spell-rush.ts (tested); every answered
// word feeds wordSeen/wordMistakes + reviewWord on its canonical key —
// the sprint is real SRS study, not just a toy.
// ------------------------------------------------------------------

type Phase = "setup" | "play" | "done";
type Feedback = "none" | "right" | "wrong";

/** normalize a spelled answer — same semantics as the dictation tab */
export function normSpelling(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** the mode segmented control — shared by both rush setups (exported) */
export function RushModeTabs({ mode, onChange }: { mode: "quiz" | "spell"; onChange: (m: "quiz" | "spell") => void }) {
  const tabs = [
    { id: "quiz" as const, label: "چهارگزینه‌ای", icon: Zap },
    { id: "spell" as const, label: "املا", icon: Ear },
  ];
  return (
    <div className="flex justify-center" role="tablist" aria-label="حالت چالش برق‌آسا">
      <div className="inline-flex rounded-2xl border c-card p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mode === t.id}
            onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-black transition-all active:scale-95 ${
              mode === t.id
                ? "bg-gradient-to-l from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25"
                : "text-stone-500 hover:text-orange-700"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SpellRushView({ onExit }: { onExit?: () => void }) {
  const { toast } = useToast();
  const mounted = useMounted();
  const setView = useStudy((s) => s.setView);
  const spellRushBest = useStudy((s) => s.spellRushBest);
  const spellRushBestCorrect = useStudy((s) => s.spellRushBestCorrect);

  const [phase, setPhase] = useState<Phase>("setup");
  const [deck, setDeck] = useState<SpellItem[]>([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0); // full-correct spellings
  const [hintCorrect, setHintCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [input, setInput] = useState("");
  const [hintUsed, setHintUsed] = useState(false);
  const [revealed, setRevealed] = useState(0); // letters revealed this word
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [audioErr, setAudioErr] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = deck[qi];

  useEffect(() => {
    return () => {
      finishedRef.current = true;
      stopSpeaking();
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // ----------------------------- finish -----------------------------
  const finish = useCallback(
    (final: { score: number; correct: number; answered: number; hintCorrect: number }) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      stopSpeaking();
      const store = useStudy.getState();
      const record = final.score > 0 && final.score > store.spellRushBest;
      setIsNewRecord(record);
      store.setSpellRushBest(final.score, final.correct);
      store.trackQuizDone();
      trackEvent("spell_rush_done");
      // half credit for hint-assisted spellings — the dictation convention
      const realCorrect = Math.round(final.correct + 0.5 * final.hintCorrect);
      if (final.answered > 0) {
        store.addResult("spell-rush", {
          correct: realCorrect,
          total: final.answered,
          percent: percent(realCorrect, final.answered),
          at: new Date().toISOString(),
        });
      }
      toast({
        title: final.score >= 150 ? "⚡ املايت برق‌آسا بود!" : final.score >= 80 ? "🔥 خوب بود!" : "💪 تمرین، املايت را محکم می‌کند",
        description: `امتیاز ${faNum(final.score)} · ${faNum(final.correct)} املأ درست از ${faNum(final.answered)}`,
        duration: 4500,
      });
      try {
        sendStats({ lesson: 0, category: "spell-rush", total: final.answered, correct: realCorrect, score: final.score }).catch(() => {});
      } catch {
        /* ignore */
      }
      setPhase("done");
    },
    [toast]
  );

  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // live mirrors so the countdown's end callback never reads stale state
  const liveScore = useRef(0);
  const liveCorrect = useRef(0);
  const liveAnswered = useRef(0);
  const liveHint = useRef(0);
  const timeLeft = useCountdown({
    duration: SPELL_ROUND_MS,
    active: phase === "play",
    tickMs: 200,
    onEnd: () =>
      finishRef.current({
        score: liveScore.current,
        correct: liveCorrect.current,
        answered: liveAnswered.current,
        hintCorrect: liveHint.current,
      }),
  });
  useEffect(() => {
    liveScore.current = score;
    liveCorrect.current = correct;
    liveAnswered.current = answered;
    liveHint.current = hintCorrect;
  }, [score, correct, answered, hintCorrect]);

  // ----------------------------- gameplay -----------------------------
  const advance = useCallback(() => {
    setFeedback("none");
    setInput("");
    setHintUsed(false);
    setRevealed(0);
    setAudioErr(false);
    if (qi + 1 >= deck.length) {
      setDeck((d) => [...d, ...buildSpellDeck()]); // endless pool
    }
    setQi(qi + 1);
  }, [qi, deck.length]);

  const submit = useCallback(() => {
    if (!current || feedback !== "none" || finishedRef.current) return;
    const ok = normSpelling(input) === normSpelling(current.en);
    const verdict = ok ? (hintUsed ? "hint" : "full") : "wrong";
    const { pts, nextCombo } = scoreAnswer(combo, verdict);
    setFeedback(ok ? "right" : "wrong");
    setAnswered((a) => a + 1);
    setLastPoints(pts);
    if (pts > 0) setScore((s) => s + pts);
    if (verdict === "full") {
      setCorrect((c) => c + 1);
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));
    } else if (verdict === "hint") {
      setHintCorrect((c) => c + 1);
      setCombo(nextCombo);
    } else {
      setCombo(0);
    }
    // the sprint writes the SAME canonical keys as the dictation tab
    useStudy.getState().reviewWord(current.key, ok && !hintUsed);
    useStudy.getState().addWordResults([{ key: current.key, ok }]);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(advance, ok ? 650 : 1200);
  }, [current, feedback, input, hintUsed, combo, advance]);

  const skip = useCallback(() => {
    if (!current || feedback !== "none" || finishedRef.current) return;
    const { nextCombo } = scoreAnswer(combo, "wrong");
    setFeedback("wrong");
    setAnswered((a) => a + 1);
    setCombo(nextCombo);
    useStudy.getState().reviewWord(current.key, false);
    useStudy.getState().addWordResults([{ key: current.key, ok: false }]);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(advance, 500);
  }, [current, feedback, combo, advance]);

  const revealHint = useCallback(() => {
    if (!current || feedback !== "none") return;
    if (revealed >= current.en.length) return;
    const next = revealed + 1;
    setRevealed(next);
    setHintUsed(true);
    setInput(current.en.slice(0, next));
    inputRef.current?.focus();
  }, [current, feedback, revealed]);

  const start = () => {
    finishedRef.current = false;
    setDeck(buildSpellDeck());
    setQi(0);
    setScore(0);
    setCorrect(0);
    setHintCorrect(0);
    setAnswered(0);
    setCombo(0);
    setMaxCombo(0);
    setLastPoints(0);
    setFeedback("none");
    setInput("");
    setHintUsed(false);
    setRevealed(0);
    setIsNewRecord(false);
    setAudioErr(false);
    setPhase("play");
  };

  // autoplay each new word (deferred like the dictation tab)
  useEffect(() => {
    if (phase !== "play" || !current || feedback !== "none") return;
    inputRef.current?.focus();
    const t = setTimeout(() => {
      speak(
        current.en,
        0.85,
        undefined,
        () => setAudioErr(true)
      );
    }, 80);
    return () => clearTimeout(t);
  }, [phase, qi, feedback, current]);

  const fullAccuracy = percent(Math.round(correct + 0.5 * hintCorrect), answered);

  const saveImage = async () => {
    setImgBusy(true);
    const ok = await downloadResultImage({
      title: "دیکتهٔ برق‌آسا — ۶۰ ثانیه",
      percent: fullAccuracy,
      correct: Math.round(correct + 0.5 * hintCorrect),
      total: answered,
      userName: useStudy.getState().userName || undefined,
    });
    setImgBusy(false);
    toast(ok ? { title: "🖼 تصویر نتیجه دانلود شد" } : { title: "دانلود تصویر ناموفق بود", duration: 3000 });
  };

  // ----------------------------- SETUP -----------------------------
  if (phase === "setup") {
    return (
      <div className="space-y-5">
        <RushModeTabs mode="spell" onChange={(m) => m === "quiz" && onExit?.()} />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rush-hero relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-bl from-amber-50 via-orange-50 to-rose-50 p-6 text-center shadow-sm sm:p-10"
        >
          <div className="rush-hero-bolt absolute -left-6 -top-8 opacity-[0.07]" aria-hidden>
            <Ear size={220} />
          </div>
          <div className="relative">
            <span className="rush-icon mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-xl shadow-sky-500/30">
              <Ear size={38} />
            </span>
            <span className="spell-chip mb-3 inline-flex items-center gap-1.5 rounded-full border border-sky-200 c-veil-70 px-3 py-1 text-xs font-bold text-sky-700">
              <Sparkles size={13} />
              حالت شنیداری — املا زیر آتش
            </span>
            <h1 className="mb-2 text-2xl font-black text-stone-800 sm:text-3xl">
              دیکتهٔ برق‌آسا — {faNum(60)} ثانیه
            </h1>
            <p className="mx-auto mb-6 max-w-lg text-[13.5px] leading-7 text-stone-600">
              واژه را می‌شنوی، املایش را می‌نویسی! از هر سه درس، بی‌وقفه تا پایان زمان. هر واژه در برنامهٔ مرور (SRS)
              همان‌جا ثبت می‌شود — هم بازی است، هم درس واقعی.
            </p>

            <div className="mx-auto mb-7 grid max-w-xl gap-2.5 text-right">
              {[
                { icon: Target, text: `املأ درستِ بی‌راهنما ۱۰ امتیاز + پاداش کمبو (تا ۳۰ امتیاز)` },
                { icon: Lightbulb, text: `راهنما حرف بعدی را نشان می‌دهد؛ پاسخِ با راهنما ${faNum(SPELL_HINT_POINTS)} امتیاز ثابت و بدون کمبو` },
                { icon: Timer, text: "غلط یا رد کردن کمبو را صفر می‌کند؛ پایان زمان = ثبت رکورد" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl border border-orange-100 c-veil-80 px-3.5 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <r.icon size={16} />
                  </span>
                  <span className="text-[13px] font-bold text-stone-700">{r.text}</span>
                </div>
              ))}
            </div>

            <div className="mb-7 flex flex-wrap items-center justify-center gap-3">
              <span className="spell-chip rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-[13px] font-black text-sky-800">
                🏆 رکورد تو: {faNum(mounted ? spellRushBest : 0)} امتیاز
              </span>
              {mounted && spellRushBestCorrect > 0 && (
                <span className="rounded-xl border c-card px-4 py-2 text-[13px] font-black text-stone-600">
                  بیشترین املأ درست: {faNum(spellRushBestCorrect)}
                </span>
              )}
            </div>

            <button
              onClick={start}
              className="rush-start inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-l from-sky-500 to-cyan-600 px-9 py-4 text-base font-black text-white shadow-xl shadow-sky-600/30 transition-all hover:opacity-95 active:scale-95"
            >
              <Play size={20} />
              شروع دیکتهٔ برق‌آسا
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <Keyboard size={13} />
              <span>میان‌بر:</span>
              <kbd className="rounded-md border c-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-500 shadow-sm" dir="ltr">
                Enter
              </kbd>
              <span>برای ثبت املا</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------- DONE -----------------------------
  if (phase === "done") {
    return (
      <div className="space-y-4">
        <div className="rush-done relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-amber-50 p-8 text-center shadow-sm">
          {isNewRecord && <Confetti />}
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/30">
            <Trophy size={28} />
          </span>
          <h3 className="mb-1 text-xl font-black text-stone-800">دیکتهٔ برق‌آسا تمام شد!</h3>
          {isNewRecord && (
            <span className="spell-chip mb-2 inline-block rounded-full bg-gradient-to-l from-sky-500 to-cyan-600 px-3.5 py-1 text-[12px] font-black text-white shadow-md shadow-sky-500/30">
              ⚡ رکورد جدید!
            </span>
          )}
          <p className="rush-score my-2 text-5xl font-black text-sky-600">{faNum(score)}</p>
          <p className="mb-5 text-sm font-bold text-stone-500">امتیاز کل</p>

          <div className="mb-6 flex flex-wrap justify-center gap-2 text-[12px] font-bold">
            <span className="rounded-full c-wash-emerald px-3 py-1 text-emerald-700">بی‌راهنما: {faNum(correct)}</span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">با راهنما: {faNum(hintCorrect)}</span>
            <span className="rounded-full c-wash-rose px-3 py-1 text-rose-600">غلط/رد: {faNum(answered - correct - hintCorrect)}</span>
            <span className="rounded-full c-wash-amber px-3 py-1 text-amber-700">بیشترین کمبو: {faNum(maxCombo)}×</span>
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600">رکورد: {faNum(spellRushBest)}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-sky-500 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-sky-600/25 transition-all hover:opacity-95 active:scale-95"
            >
              <RotateCcw size={16} />
              دیکتهٔ دوباره
            </button>
            <button
              onClick={saveImage}
              disabled={imgBusy}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-600 transition-all hover:border-sky-300 hover:text-sky-700 active:scale-95 disabled:opacity-50"
            >
              <Download size={16} />
              {imgBusy ? "در حال ساخت…" : "دانلود تصویر نتیجه"}
            </button>
            {onExit ? (
              <button
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
              >
                <Zap size={16} />
                حالت چهارگزینه‌ای
              </button>
            ) : (
              <button
                onClick={() => setView({ type: "home" })}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
              >
                <Home size={16} />
                بازگشت به خانه
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[11.5px] leading-6 text-stone-400">
          نتیجهٔ هر واژه در برنامهٔ مرور (SRS) و بانک خطاهای واژگانی ثبت شد — واژه‌های غلط زودتر دوباره سر می‌رسند.
        </p>
      </div>
    );
  }

  // ----------------------------- PLAY -----------------------------
  if (!current) return null;
  const totalSeconds = Math.ceil(timeLeft / 1000);
  const ring = 2 * Math.PI * 26;
  const progress = timeLeft / SPELL_ROUND_MS;

  return (
    <div className="space-y-4">
      {/* HUD — same skeleton as the quiz rush */}
      <div className="rush-hud flex items-center gap-3 rounded-2xl border border-orange-200 bg-white p-3.5 shadow-sm">
        <div className={`relative h-16 w-16 shrink-0 ${totalSeconds <= 10 ? "rush-time-low" : ""}`}>
          <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90">
            <circle cx="30" cy="30" r="26" fill="none" strokeWidth="5" className="stroke-stone-100" />
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              className={`transition-[stroke-dashoffset] duration-200 ${totalSeconds <= 10 ? "stroke-rose-500" : "stroke-sky-500"}`}
              strokeDasharray={ring}
              strokeDashoffset={ring * (1 - progress)}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-lg font-black ${totalSeconds <= 10 ? "text-rose-600" : "text-sky-600"}`}>
            {faNum(totalSeconds)}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={score}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="rush-score-live text-2xl font-black text-stone-800"
                >
                  {faNum(score)}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10.5px] font-bold text-stone-400">امتیاز</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10.5px] font-bold text-stone-400">
              <span>
                {faNum(answered)} پاسخ · دقت {faNum(fullAccuracy)}٪
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 ${combo >= 2 ? "c-wash-amber" : "bg-stone-50"}`}>
            <Flame size={15} className={combo >= 2 ? "text-orange-500" : "text-stone-300"} />
            <span className={`text-lg font-black ${combo >= 2 ? "text-orange-600" : "text-stone-300"}`}>{faNum(combo)}×</span>
          </div>
        </div>
      </div>

      {/* word card — hear & spell */}
      <div className="rush-card relative overflow-hidden rounded-2xl border-2 border-sky-200 c-card-elevated p-5 shadow-md sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={qi}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 14 }}
            transition={{ duration: 0.18 }}
            className="text-center"
          >
            <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-400">
              <Ear size={13} className="text-sky-500" />
              گوش کن و املایش را بنویس
              {hintUsed && <span className="spell-chip rounded-full bg-sky-50 px-2 py-0.5 text-[9.5px] font-black text-sky-700">با راهنما — {faNum(SPELL_HINT_POINTS)} امتیاز</span>}
            </div>

            {/* fa meaning — the clue */}
            <p className="spell-fa mb-3 text-2xl font-black text-stone-800">{current.fa}</p>

            {/* feedback slot */}
            <div className="mb-3 flex h-9 items-center justify-center">
              <AnimatePresence mode="wait">
                {feedback === "right" && (
                  <motion.span
                    key="right"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[13px] font-black text-emerald-700"
                  >
                    <Sparkles size={14} />
                    {hintUsed ? `درست (با راهنما) +${faNum(lastPoints)}` : `کامل! +${faNum(lastPoints)}`}
                  </motion.span>
                )}
                {feedback === "wrong" && (
                  <motion.span
                    key="wrong"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[13px] font-black text-rose-700"
                  >
                    املأ درست:
                    <span className="en-text" dir="ltr">
                      {current.en}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* the typing input */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              disabled={feedback !== "none"}
              dir="ltr"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label="املای واژه"
              placeholder="type the word…"
              className="spell-input mx-auto block w-full max-w-sm rounded-xl border-2 border-sky-200 bg-white px-4 py-3 text-center text-lg font-black tracking-wide text-stone-800 outline-none transition-all placeholder:text-stone-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
            />

            {/* actions */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() =>
                  speak(
                    current.en,
                    0.85,
                    undefined,
                    () => setAudioErr(true)
                  )
                }
                className="spell-chip inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-[12px] font-bold text-sky-700 transition-all hover:bg-sky-50 active:scale-95"
              >
                <Volume2 size={13} />
                دوباره بشنو
              </button>
              <button
                onClick={revealHint}
                disabled={feedback !== "none" || revealed >= current.en.length}
                title="حرف بعدی را نشان بده (امتیاز کم می‌شود)"
                className="spell-chip inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[12px] font-bold text-amber-700 transition-all enabled:hover:bg-amber-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Lightbulb size={13} />
                راهنما {revealed > 0 ? `(${faNum(revealed)}/${faNum(current.en.length)})` : ""}
              </button>
              <button
                onClick={skip}
                disabled={feedback !== "none"}
                className="spell-chip inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[12px] font-bold text-stone-500 transition-all enabled:hover:bg-stone-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SkipForward size={13} />
                رد کردن
              </button>
            </div>

            {audioErr && (
              <p className="mt-2 text-[11px] font-bold text-rose-600">
                پخش صدا ممکن نشد — از معنی بالا حدس بزن یا دوباره تلاش کن
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-[11px] text-stone-400">
        <Keyboard size={12} className="ml-1 inline" />
        <kbd className="rounded-md border c-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-500 shadow-sm" dir="ltr">Enter</kbd> ثبت املا — واژه‌های غلط همان‌جا در SRS و بانک خطا می‌روند
      </p>
    </div>
  );
}
