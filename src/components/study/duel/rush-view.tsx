"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Zap,
  Flame,
  Trophy,
  Play,
  RotateCcw,
  Home,
  Sparkles,
  Target,
  Timer,
  Download,
  Keyboard,
} from "lucide-react";
import { lessons, examBank } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy, questionSourceLesson } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { useToast } from "@/hooks/use-toast";
import { useCountdown } from "@/hooks/use-countdown";
import { isTypingTarget, readDigit, useKeydown } from "@/hooks/use-keyboard";
import { percent } from "@/lib/domain/percent";
import { shuffle, shuffleWithOptions } from "@/lib/domain/shuffle";
import { downloadResultImage } from "@/lib/result-image";
import { trackEvent } from "@/lib/analytics";
import { sendStats } from "@/lib/identity";
import RushBoard from "./rush-board";
import SpellRushView, { RushModeTabs } from "./spell-rush-view";
import Confetti from "../shared/confetti";
import OptionButton from "../shared/option-button";

// ------------------------------------------------------------------
// چالش برق‌آسا — 60-second quick-fire quiz across all lessons.
// Every correct answer scores 10 pts + combo bonus (up to +20).
// Wrong answers still feed the per-lesson mistake bank for review.
// ------------------------------------------------------------------

type Phase = "setup" | "play" | "done";
type Feedback = "none" | "right" | "wrong";

interface RushQ {
  q: QuizQuestion;
  options: string[]; // shuffled copy
  answer: number; // index inside the shuffled copy
  src: number; // 1/2/3 = lesson, 0 = exam bank
}

const ROUND_MS = 60_000;
const letters = ["a", "b", "c", "d"];

/** one full shuffled deck of every question in the book */
function buildDeck(): RushQ[] {
  const all: QuizQuestion[] = [...lessons.flatMap((l) => l.quizzes), ...examBank];
  return shuffle(all).map((q) => {
    const { options, answer } = shuffleWithOptions(q.options, q.answer);
    return { q, options, answer, src: questionSourceLesson(q) };
  });
}

/** points for a correct answer given the current combo (1-based) */
function pointsFor(combo: number): number {
  return 10 + Math.min(combo - 1, 10) * 2;
}

export default function RushView() {
  const { toast } = useToast();
  const mounted = useMounted();

  const setView = useStudy((s) => s.setView);
  const rushBest = useStudy((s) => s.rushBest);
  const rushBestCorrect = useStudy((s) => s.rushBestCorrect);

  // arcade mode: the classic 4-option quiz or the spelling sprint — the
  // spell view is a full sibling (its own setup/play/done), not a variant
  const [mode, setMode] = useState<"quiz" | "spell">("quiz");

  const [phase, setPhase] = useState<Phase>("setup");
  const [deck, setDeck] = useState<RushQ[]>([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [picked, setPicked] = useState(-1);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [boardNonce, setBoardNonce] = useState(0); // bumps after each finished round to refresh the class board
  const finishedRef = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = deck[qi];

  // ----------------------------- lifecycle -----------------------------
  useEffect(() => {
    return () => {
      finishedRef.current = true;
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // ----------------------------- finish -----------------------------
  const finish = useCallback(
    (final: { score: number; correct: number; answered: number }) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const store = useStudy.getState();
      const accuracy = percent(final.correct, final.answered);
      const record = final.score > 0 && final.score > store.rushBest;
      setIsNewRecord(record);
      store.setRushBest(final.score, final.correct);
      store.trackQuizDone();
      trackEvent("rush_done");
      if (final.answered > 0) {
        store.addResult("rush", {
          correct: final.correct,
          total: final.answered,
          percent: accuracy,
          at: new Date().toISOString(),
        });
      }
      toast({
        title: final.score >= 150 ? "⚡ چالش برق‌آسا! فوق‌العاده بود" : final.score >= 80 ? "🔥 عالی بود!" : "💪 تمرین، سرعتت را بالا می‌برد",
        description: `امتیاز ${faNum(final.score)} · ${faNum(final.correct)} پاسخ درست از ${faNum(final.answered)}`,
        duration: 4500,
      });
      try {
        // signed fire-and-forget (Phase-0)
        sendStats({ lesson: 0, category: "rush", total: final.answered, correct: final.correct, score: final.score }).catch(
          () => {}
        );
      } catch {
        /* ignore */
      }
      setPhase("done");
      setBoardNonce((n) => n + 1); // RushBoard refetches so the new record shows on next setup
    },
    [toast]
  );

  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // ----------------------------- countdown -----------------------------
  // live mirrors so the countdown's end callback never reads stale state
  const liveScore = useRef(0);
  const liveCorrect = useRef(0);
  const liveAnswered = useRef(0);

  // شمارش معکوس راند از ضرب‌الاجل — نه جمعِ تیک‌ها (useCountdown گام ۶)
  const timeLeft = useCountdown({
    duration: ROUND_MS,
    active: phase === "play",
    tickMs: 200,
    onEnd: () =>
      finishRef.current({ score: liveScore.current, correct: liveCorrect.current, answered: liveAnswered.current }),
  });

  useEffect(() => {
    liveScore.current = score;
    liveCorrect.current = correct;
    liveAnswered.current = answered;
  }, [score, correct, answered]);

  // ----------------------------- gameplay -----------------------------
  const advance = useCallback(() => {
    setFeedback("none");
    setPicked(-1);
    if (qi + 1 >= deck.length) {
      setDeck((d) => [...d, ...buildDeck()]); // endless pool
    }
    setQi(qi + 1);
  }, [qi, deck.length]);

  const answer = useCallback(
    (i: number) => {
      if (!current || feedback !== "none" || finishedRef.current) return;
      const ok = i === current.answer;
      setPicked(i);
      setFeedback(ok ? "right" : "wrong");
      setAnswered((a) => a + 1);
      if (ok) {
        const pts = pointsFor(combo + 1);
        const nc = combo + 1;
        setLastPoints(pts);
        setScore((s) => s + pts);
        setCorrect((c) => c + 1);
        setCombo(nc);
        setMaxCombo((m) => Math.max(m, nc));
        useStudy.getState().clearMistake(current.src, current.q.id);
      } else {
        setCombo(0);
        useStudy.getState().addMistakes(current.src, [current.q.id]);
      }
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(advance, ok ? 480 : 850);
    },
    [current, feedback, combo, advance]
  );

  // keyboard 1-4 during play (layout-proof: latin + Persian digits + physical codes)
  useKeydown(
    (e) => {
      if (isTypingTarget(e)) return;
      const n = readDigit(e);
      if (n !== null && n >= 1 && n <= 4) {
        e.preventDefault();
        answer(n - 1);
      }
    },
    phase === "play",
  );

  const start = () => {
    finishedRef.current = false;
    setDeck(buildDeck());
    setQi(0);
    setScore(0);
    setCorrect(0);
    setAnswered(0);
    setCombo(0);
    setMaxCombo(0);
    setLastPoints(0);
    setFeedback("none");
    setPicked(-1);
    setIsNewRecord(false);
    setPhase("play");
  };

  const accuracy = useMemo(() => percent(correct, answered), [answered, correct]);

  const saveImage = async () => {
    setImgBusy(true);
    const ok = await downloadResultImage({
      title: "چالش برق‌آسا — ۶۰ ثانیه",
      percent: accuracy,
      correct,
      total: answered,
      userName: useStudy.getState().userName || undefined,
    });
    setImgBusy(false);
    toast(ok ? { title: "🖼 تصویر نتیجه دانلود شد" } : { title: "دانلود تصویر ناموفق بود", duration: 3000 });
  };

  // ----------------------------- SETUP -----------------------------
  if (mode === "spell") {
    return <SpellRushView onExit={() => setMode("quiz")} />;
  }

  if (phase === "setup") {
    return (
      <div className="space-y-5">
        <RushModeTabs mode="quiz" onChange={setMode} />
        <RushBoard refreshKey={boardNonce} />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rush-hero relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-bl from-amber-50 via-orange-50 to-rose-50 p-6 text-center shadow-sm sm:p-10"
        >
          <div className="rush-hero-bolt absolute -left-6 -top-8 opacity-[0.07]" aria-hidden>
            <Zap size={220} />
          </div>
          <div className="relative">
            <span className="rush-icon mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-xl shadow-orange-500/30">
              <Zap size={38} />
            </span>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-orange-200 c-veil-70 px-3 py-1 text-xs font-bold text-orange-700">
              <Sparkles size={13} />
              حالت بازی جدید — برای واژگان سریع
            </span>
            <h1 className="mb-2 text-2xl font-black text-stone-800 sm:text-3xl">
              چالش برق‌آسا — {faNum(60)} ثانیه
            </h1>
            <p className="mx-auto mb-6 max-w-lg text-[13.5px] leading-7 text-stone-600">
              هر چه می‌توانی تست واژگان جواب بده! سؤال‌ها از هر سه درس و بانک ۳۶۰ تستی می‌آیند و گزینه‌ها هر بار
              بُر می‌خورند. پاسخ‌های غلط به بانک مرور اشتباهات همان درس می‌روند تا بعداً جبران کنی.
            </p>

            <div className="mx-auto mb-7 grid max-w-xl gap-2.5 text-right">
              {[
                { icon: Target, text: "هر پاسخ درست ۱۰ امتیاز + پاداش کمبو (تا ۳۰ امتیاز)" },
                { icon: Flame, text: "پاسخ‌های پشت‌سرهمِ درست ضریب کمبوی تو را بالا می‌برد" },
                { icon: Timer, text: "پایان زمان = پایان چالش؛ رکوردت ذخیره می‌شود" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl border border-orange-100 c-veil-80 px-3.5 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <r.icon size={16} />
                  </span>
                  <span className="text-[13px] font-bold text-stone-700">{r.text}</span>
                </div>
              ))}
            </div>

            <div className="mb-7 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-[13px] font-black text-amber-800">
                🏆 رکورد تو: {faNum(mounted ? rushBest : 0)} امتیاز
              </span>
              {mounted && rushBestCorrect > 0 && (
                <span className="rounded-xl border c-card px-4 py-2 text-[13px] font-black text-stone-600">
                  بیشترین پاسخ درست: {faNum(rushBestCorrect)}
                </span>
              )}
            </div>

            <button
              onClick={start}
              className="rush-start inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-9 py-4 text-base font-black text-white shadow-xl shadow-orange-600/30 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
            >
              <Play size={20} />
              شروع چالش
            </button>

            <div className="mt-4 hidden items-center justify-center gap-1.5 text-[11px] text-stone-500 min-[720px]:flex">
              <Keyboard size={13} />
              <span>میان‌بر:</span>
              {["1", "2", "3", "4"].map((k) => (
                <kbd key={k} className="rounded-md border c-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-500 shadow-sm" dir="ltr">
                  {k}
                </kbd>
              ))}
              <span>برای پاسخ سریع</span>
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
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
            <Trophy size={28} />
          </span>
          <h2 className="mb-1 text-xl font-black text-stone-800">چالش تمام شد!</h2>
          {isNewRecord && (
            <span className="mb-2 inline-block rounded-full bg-gradient-to-l from-amber-500 to-orange-600 px-3.5 py-1 text-[12px] font-black text-white shadow-md shadow-orange-500/30">
              ⚡ رکورد جدید!
            </span>
          )}
          <p className="rush-score my-2 text-5xl font-black text-orange-600">{faNum(score)}</p>
          <p className="mb-5 text-sm font-bold text-stone-500">امتیاز کل</p>

          <div className="mb-6 flex flex-wrap justify-center gap-2 text-[12px] font-bold">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">درست: {faNum(correct)}</span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">کل پاسخ‌ها: {faNum(answered)}</span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">دقت: {faNum(accuracy)}٪</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">بیشترین کمبو: {faNum(maxCombo)}×</span>
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600">رکورد: {faNum(rushBest)}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
            >
              <RotateCcw size={16} />
              چالش دوباره
            </button>
            <button
              onClick={saveImage}
              disabled={imgBusy}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-600 transition-[background-color,color,border-color,transform,opacity] hover:border-orange-300 hover:text-orange-700 active:scale-[0.96] disabled:opacity-50"
            >
              <Download size={16} />
              {imgBusy ? "در حال ساخت…" : "دانلود تصویر نتیجه"}
            </button>
            <button
              onClick={() => setView({ type: "home" })}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:bg-stone-50 active:scale-[0.96]"
            >
              <Home size={16} />
              بازگشت به خانه
            </button>
          </div>
        </div>

        <p className="text-center text-[11.5px] leading-6 text-stone-500">
          پاسخ‌های غلط این دور به بانک مرور اشتباهات درس مربوطه اضافه شدند — از کارت «بانک اشتباهات» در خانه می‌توانی آن‌ها را دوباره تمرین کنی.
        </p>
      </div>
    );
  }

  // ----------------------------- PLAY -----------------------------
  if (!current) return null;
  const totalSeconds = Math.ceil(timeLeft / 1000);
  const ring = 2 * Math.PI * 26;
  const progress = timeLeft / ROUND_MS;

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className="rush-hud flex items-center gap-3 rounded-2xl border border-orange-200 bg-white p-3.5 shadow-sm">
        {/* countdown ring */}
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
              className={`transition-[stroke-dashoffset] duration-200 ${totalSeconds <= 10 ? "stroke-rose-500" : "stroke-orange-500"}`}
              strokeDasharray={ring}
              strokeDashoffset={ring * (1 - progress)}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-lg font-black ${totalSeconds <= 10 ? "text-rose-600" : "text-orange-600"}`}>
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
              <span className="text-[11px] font-bold text-stone-500">امتیاز</span>
              {feedback === "right" && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-black text-emerald-700"
                >
                  +{faNum(lastPoints)}
                </motion.span>
              )}
            </div>
            <div className="mt-0.5 text-[11px] font-bold text-stone-500">
              دقت {faNum(accuracy)}٪ · {faNum(correct)} درست از {faNum(answered)}
            </div>
          </div>

          {/* combo */}
          <motion.div
            animate={combo >= 2 ? { scale: [1, 1.12, 1] } : {}}
            transition={combo >= 2 ? { repeat: Infinity, duration: 0.9 } : {}}
            className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl ${
              combo >= 5
                ? "bg-gradient-to-br from-rose-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                : combo >= 2
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md"
                  : "bg-stone-100 text-stone-500"
            }`}
          >
            <Flame size={16} />
            <span className="text-[12px] font-black leading-none">{faNum(combo)}×</span>
          </motion.div>
        </div>
      </div>

      {/* question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qi}
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.18 }}
          className={`rush-card rounded-2xl border-2 c-card-elevated p-5 shadow-md sm:p-6 ${
            feedback === "right"
              ? "border-emerald-400"
              : feedback === "wrong"
                ? "border-rose-400"
                : "border-orange-200"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">
              {current.src === 0 ? "بانک ۳۶۰ تستی" : `درس ${current.src === 1 ? "اول" : current.src === 2 ? "دوم" : "سوم"}`}
            </span>
            <span className="text-[11px] font-bold text-stone-500">سؤال {faNum(qi + 1)}</span>
          </div>
          <p className="en-text mb-5 text-[16px] font-semibold leading-8 text-stone-800" dir="ltr">
            {current.q.question}
          </p>
          <div className="space-y-2.5" dir="ltr">
            {current.options.map((opt, i) => {
              const isCorrect = feedback !== "none" && i === current.answer;
              const isWrong = feedback === "wrong" && picked === i;
              return (
                <OptionButton
                  key={i}
                  index={i}
                  label={letters[i]}
                  text={opt}
                  state={isCorrect ? "correct" : isWrong ? "wrong" : "idle"}
                  dim={feedback !== "none" && !isCorrect && !isWrong}
                  dimOpacity="50"
                  disabled={feedback !== "none"}
                  onClick={() => answer(i)}
                  accent="orange"
                  icon="circle"
                  dataAttr="rush"
                />
              );
            })}
          </div>

          {feedback === "wrong" && current.q.translation && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl bg-rose-50/70 p-3 text-[13px] leading-7 text-stone-600">
              {current.q.translation}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
