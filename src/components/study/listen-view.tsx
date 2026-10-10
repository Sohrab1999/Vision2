"use client";

// ------------------------------------------------------------------
// F6 «بشنو و انتخاب کن» — listening practice engine (roadmap sprint 4)
//
// Setup (count + lesson scope) → Play (TTS speaks, max 2 plays per item,
// 3 options, instant feedback) → Done (result + review list).
// Word-kind items feed SRS + F7 word-risk tracking; the round itself
// lands in the results map as the «شنیداری» skill.
// ------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  Volume2,
  Play,
  Check,
  X,
  ChevronLeft,
  RotateCcw,
  Trophy,
  Ear,
  MessageSquareQuote,
  Languages,
} from "lucide-react";
import { useStudy, resultKey, wordKey } from "@/lib/study-store";
import { pickRound, listenBankStats, LISTEN_KIND_LABEL, type RoundItem, type ListenKind } from "@/lib/listen-bank";
import { speak, stopSpeaking } from "@/lib/speak";
import { faNum } from "@/lib/study-theme";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import ProgressRing from "./progress-ring";

type Phase = "setup" | "play" | "done";
const MAX_PLAYS = 2;

const KIND_ICON: Record<ListenKind, React.ElementType> = {
  meaning: Languages,
  next: MessageSquareQuote,
  word: Ear,
};

const SPEED_BY_KIND: Record<ListenKind, number> = { meaning: 0.92, next: 0.92, word: 0.8 };

export default function ListenView() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(8);
  const [lessonFilter, setLessonFilter] = useState(0); // 0 = all lessons
  const [items, setItems] = useState<RoundItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [playsLeft, setPlaysLeft] = useState(MAX_PLAYS);
  const [playing, setPlaying] = useState(false);
  const userIdRef = useRef<string>("");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = items[idx];
  const total = items.length;
  const stats = listenBankStats(lessonFilter);

  const playAudio = useCallback(
    (target: RoundItem, consume: boolean) => {
      if (playing) return;
      if (consume) setPlaysLeft((p) => Math.max(0, p - 1));
      setPlaying(true);
      speak(
        target.audio,
        SPEED_BY_KIND[target.kind],
        () => setPlaying(false),
        () => {
          setPlaying(false);
          toast({
            title: "🔇 پخش صدا ممکن نشد",
            description: "اتصال اینترنت را بررسی کن و دوباره روی دکمهٔ پخش بزن.",
            duration: 3500,
          });
        }
      );
    },
    [playing, toast]
  );

  // autoplay each new item (deferred so React doesn't cascade renders)
  useEffect(() => {
    if (phase !== "play" || !item || selected !== null) return;
    const t = setTimeout(() => playAudio(item, true), 350);
    return () => clearTimeout(t);
  }, [phase, idx, selected]);

  // stop audio + pending timers on item change / unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [idx, phase]);

  const startRound = () => {
    const round = pickRound(count, lessonFilter);
    if (round.length === 0) {
      toast({
        title: "بانک شنیداری برای این محدوده خالی است",
        description: "محدودهٔ درس را روی «همه» بگذار و دوباره تلاش کن.",
        duration: 3500,
      });
      return;
    }
    setItems(round);
    setIdx(0);
    setSelected(null);
    setAnswers([]);
    setPlaysLeft(MAX_PLAYS);
    setPlaying(false);
    setPhase("play");
  };

  /** advance to the item at nextIdx (no result logic) */
  const advanceTo = (nextIdx: number) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setIdx(nextIdx);
    setSelected(null);
    setPlaysLeft(MAX_PLAYS);
  };

  const choose = (i: number) => {
    if (!item || selected !== null || phase !== "play") return;
    stopSpeaking();
    setPlaying(false);
    const ok = i === item.answer;
    const next = [...answers];
    next[idx] = i;
    setAnswers(next);
    setSelected(i);
    // word items close the loop with SRS + F7 word-risk right away
    if (item.wordEn) {
      const store = useStudy.getState();
      store.reviewWord(wordKey(item.lessonId, item.wordEn), ok);
      try {
        store.addWordResults([{ key: wordKey(item.lessonId, item.wordEn), ok }]);
      } catch {
        /* best-effort */
      }
    }
    // freeze the answer snapshot so the delayed callback can't miss the last click
    const finalAnswers = next;
    if (idx + 1 < total) {
      advanceTimer.current = setTimeout(() => advanceTo(idx + 1), 2200);
    } else {
      advanceTimer.current = setTimeout(() => finishRound(finalAnswers), 2200);
    }
  };

  const finishRound = (final: number[]) => {
    if (phase === "done" || total === 0) return;
    stopSpeaking();
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    const correct = final.reduce((s, a, i) => (a === items[i]?.answer ? s + 1 : s), 0);
    const percent = Math.round((correct / total) * 100);
    const key = resultKey(lessonFilter >= 1 ? lessonFilter : 0, "listening");
    useStudy.getState().addResult(key, { correct, total, percent, at: new Date().toISOString() });
    useStudy.getState().trackQuizDone();
    trackEvent("listen_done");
    toast({
      title: percent >= 80 ? "🎧 گوش‌های تیز!" : percent >= 50 ? "👍 خوب بود، ادامه بده!" : "💪 با تمرین بیشتر شنیداری‌ات قوی می‌شود",
      description: `تمرین شنیداری: ${faNum(correct)} از ${faNum(total)} درست (${faNum(percent)}٪)`,
      duration: 4000,
    });
    try {
      const store = useStudy.getState();
      const userId = userIdRef.current || store.ensureUserId();
      userIdRef.current = userId;
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, lesson: lessonFilter, category: "listening", total, correct }),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
    setPhase("done");
  };

  const restart = () => {
    stopSpeaking();
    setPhase("setup");
    setItems([]);
    setIdx(0);
    setAnswers([]);
    setSelected(null);
    setPlaying(false);
  };

  // keep the feedback box visible after answering (page + dialog friendly)
  useEffect(() => {
    if (phase !== "play" || selected === null) return;
    document.querySelector("[data-listen-feedback]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected, phase]);

  // keyboard: 1-3 choose, Enter advance
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const num = Number(e.key);
      if (num >= 1 && num <= (item?.options.length ?? 0)) {
        choose(num - 1);
        return;
      }
      if (e.key === "Enter" && selected !== null) {
        if (idx < total - 1) advanceTo(idx + 1);
        else finishRound(answers);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ------------------------------ SETUP ------------------------------
  if (phase === "setup") {
    const lessonOptions = [
      { id: 0, label: "هر سه درس" },
      { id: 1, label: "درس اول" },
      { id: 2, label: "درس دوم" },
      { id: 3, label: "درس سوم" },
    ];
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-l from-cyan-500 via-teal-500 to-emerald-500" />
        <div className="p-6 text-center sm:p-8">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-teal-500/30">
            <Headphones size={30} />
          </span>
          <h3 className="mb-2 text-xl font-black text-stone-800">تمرین شنیداری — بشنو و انتخاب کن</h3>
          <p className="mx-auto mb-5 max-w-lg text-[13px] leading-7 text-stone-500">
            مثل امتحان واقعی Vision: جمله یا واژه را از صدای هوش مصنوعی می‌شنوی و گزینهٔ درست را انتخاب می‌کنی.
            هر آیتم فقط <b className="text-teal-700">۲ بار</b> قابل پخش است — دقیق گوش کن!
          </p>

          <div className="mx-auto mb-5 grid max-w-lg gap-2 sm:grid-cols-3">
            {(
              [
                { kind: "word" as const, icon: Ear, title: "واژه", desc: "معنی واژهٔ شنیده‌شده" },
                { kind: "meaning" as const, icon: Languages, title: "ترجمهٔ جمله", desc: "معنی درست جملهٔ مکالمه" },
                { kind: "next" as const, icon: MessageSquareQuote, title: "ادامهٔ مکالمه", desc: "جملهٔ بعدی گفتگو" },
              ] satisfies { kind: ListenKind; icon: React.ElementType; title: string; desc: string }[]
            ).map((k) => (
              <div key={k.kind} className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-center">
                <k.icon size={17} className="mx-auto mb-1 text-teal-600" />
                <div className="text-[12.5px] font-black text-stone-700">{k.title}</div>
                <div className="mt-0.5 text-[10.5px] leading-4 text-stone-500">{k.desc}</div>
              </div>
            ))}
          </div>

          <div className="mx-auto mb-4 max-w-sm">
            <div className="mb-2 text-[12px] font-bold text-stone-500">تعداد آیتم‌ها</div>
            <div className="flex justify-center gap-2">
              {[6, 8, 10, 12].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                    count === n
                      ? "bg-teal-600 text-white shadow-md shadow-teal-500/25"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-teal-300 hover:text-teal-600"
                  }`}
                >
                  {faNum(n)}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mb-4 max-w-sm">
            <div className="mb-2 text-[12px] font-bold text-stone-500">محدودهٔ درس</div>
            <div className="flex flex-wrap justify-center gap-2">
              {lessonOptions.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setLessonFilter(o.id)}
                  className={`rounded-xl px-3.5 py-2 text-[12.5px] font-bold transition-all active:scale-95 ${
                    lessonFilter === o.id
                      ? "bg-stone-800 text-white shadow-md"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-5 text-[11px] text-stone-400">
            بانک این محدوده: {faNum(stats.word)} واژه · {faNum(stats.meaning)} جمله · {faNum(stats.next)} ادامهٔ مکالمه
          </p>

          <button
            onClick={startRound}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-600 to-teal-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-teal-600/25 transition-all hover:opacity-95 active:scale-95"
          >
            <Play size={17} />
            شروع تمرین شنیداری
          </button>
        </div>
      </motion.div>
    );
  }

  // ------------------------------- DONE -------------------------------
  if (phase === "done") {
    const correct = answers.reduce((s, a, i) => (a === items[i]?.answer ? s + 1 : s), 0);
    const percent = Math.round((correct / total) * 100);
    const grade =
      percent >= 90
        ? { msg: "شنیداری‌ت فوق‌العاده است! آمادهٔ امتحان واقعی 🎧", cls: "text-emerald-600" }
        : percent >= 70
          ? { msg: "خوب بود! با تمرین بیشتر کاملاً مسلط می‌شوی.", cls: "text-emerald-600" }
          : percent >= 50
            ? { msg: "بد نیست — سرعت پخش را در تنظیمات کمتر کن و دوباره تمرین کن.", cls: "text-amber-600" }
            : { msg: "نیاز به تمرین بیشتر داری. اول فلش‌کارت‌ها را مرور کن!", cls: "text-rose-600" };
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <ProgressRing percent={percent} size={120} stroke={10}>
              <div>
                <div className="text-2xl font-black text-stone-800">{percent}٪</div>
                <div className="text-[11px] text-stone-500" dir="ltr">
                  {correct}/{total}
                </div>
              </div>
            </ProgressRing>
          </div>
          <div className="mb-1 flex items-center justify-center gap-2 text-lg font-black">
            <Trophy size={20} className="text-amber-500" />
            <span className="text-stone-800">تمرین شنیداری — نتیجهٔ نهایی</span>
          </div>
          <p className={`mb-5 text-sm font-bold ${grade.cls}`}>{grade.msg}</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={startRound}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-95"
            >
              <RotateCcw size={15} />
              یک دور دیگر
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
            >
              تغییر تنظیمات
            </button>
            <button
              onClick={() => useStudy.getState().goHome()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition-all hover:bg-stone-50 active:scale-95"
            >
              بازگشت به خانه
            </button>
          </div>
        </div>

        {/* review list */}
        <div className="max-h-[46vh] space-y-2.5 overflow-y-auto nice-scroll pl-1">
          {items.map((it, i) => {
            const ok = answers[i] === it.answer;
            const KindIcon = KIND_ICON[it.kind];
            const en = it.kind === "next";
            return (
              <div key={it.id} className={`rounded-xl border p-3.5 ${ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"}`}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${ok ? "bg-emerald-500" : "bg-rose-500"}`}>
                    {ok ? <Check size={12} /> : <X size={12} />}
                  </span>
                  <KindIcon size={13} className="shrink-0 text-stone-400" />
                  <span className="text-[11px] font-bold text-stone-400">{LISTEN_KIND_LABEL[it.kind]}</span>
                </div>
                <p className={`${en ? "en-text " : ""}text-[13.5px] font-semibold leading-7 text-stone-800`} dir={en ? "ltr" : "rtl"}>
                  {it.reveal}
                </p>
                <p className="mt-1 text-[12px] leading-6 text-stone-500">{it.translation}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ------------------------------- PLAY -------------------------------
  if (!item) return null;
  const en = item.kind === "next";
  const KindIcon = KIND_ICON[item.kind];
  return (
    <div className="space-y-4">
      {/* header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-extrabold text-stone-800">
            <Headphones size={16} className="text-teal-600" />
            تمرین شنیداری — بشنو و انتخاب کن
          </span>
          <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-[12px] font-black text-teal-700">
            {faNum(idx + 1)} / {faNum(total)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-gradient-to-l from-cyan-500 to-teal-600 transition-all duration-300" style={{ width: `${(idx / total) * 100}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.22 }}
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
        >
          {/* kind + prompt */}
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11.5px] font-black text-teal-700">
              <KindIcon size={12} />
              {LISTEN_KIND_LABEL[item.kind]}
            </span>
            <span className="text-[12px] text-stone-500">{item.prompt}</span>
          </div>

          {/* player */}
          <div className="mx-auto mb-6 flex max-w-xs flex-col items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => playAudio(item, true)}
              disabled={playing || playsLeft <= 0 || selected !== null}
              aria-label="پخش صدا"
              className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition-all ${
                playing
                  ? "bg-gradient-to-br from-teal-400 to-cyan-600 shadow-teal-500/40"
                  : playsLeft <= 0 || selected !== null
                    ? "cursor-not-allowed bg-stone-300 shadow-none"
                    : "bg-gradient-to-br from-teal-500 to-cyan-700 shadow-teal-600/30 hover:opacity-95"
              }`}
            >
              {playing ? (
                <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 rounded-full border-2 border-teal-300/60" aria-hidden />
              ) : null}
              <Volume2 size={30} />
            </motion.button>
            <div className="flex items-center gap-1.5" aria-label={`فرصت پخش باقی‌مانده: ${playsLeft}`}>
              {Array.from({ length: MAX_PLAYS }).map((_, i) => (
                <span key={i} className={`h-2 w-6 rounded-full transition-colors ${i < playsLeft ? "bg-teal-500" : "bg-stone-200"}`} />
              ))}
              <span className="mr-1 text-[10.5px] font-bold text-stone-400">
                {playing ? "در حال پخش…" : playsLeft > 0 ? `${faNum(playsLeft)} فرصت پخش` : "فرصت پخش تمام شد"}
              </span>
            </div>
          </div>

          {/* options */}
          <div className="space-y-2.5" dir={en ? "ltr" : "rtl"}>
            {item.options.map((opt, i) => {
              const isCorrect = selected !== null && i === item.answer;
              const isWrong = selected === i && i !== item.answer;
              const chosen = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={selected !== null}
                  data-listen-option={i}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-right transition-all ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : isWrong
                        ? "border-rose-400 bg-rose-50"
                        : chosen
                          ? "border-teal-300 bg-teal-50/50"
                          : "border-stone-200 bg-white hover:border-teal-300 hover:bg-teal-50/40 active:scale-[0.99]"
                  } ${selected !== null && !isCorrect && !isWrong ? "opacity-60" : ""}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black ${
                      isCorrect ? "bg-emerald-500 text-white" : isWrong ? "bg-rose-500 text-white" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {isCorrect ? <Check size={14} /> : isWrong ? <X size={14} /> : faNum(i + 1)}
                  </span>
                  <span className={`${en ? "en-text " : ""}text-[14px] font-medium leading-7 text-stone-800`}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* feedback */}
          <AnimatePresence>
            {selected !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-listen-feedback className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3.5">
                <p className={`mb-1 text-[13px] font-black ${selected === item.answer ? "text-emerald-700" : "text-rose-600"}`}>
                  {selected === item.answer ? "✓ درست بود!" : "✗ پاسخ درست مشخص شد"}
                </p>
                <p className={`${en ? "en-text " : ""}text-[13.5px] font-bold leading-7 text-stone-800`} dir={en ? "ltr" : "rtl"}>
                  {item.reveal}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-6 text-stone-600">{item.translation}</p>
                <button
                  onClick={() => {
                    if (idx < total - 1) advanceTo(idx + 1);
                    else finishRound(answers);
                  }}
                  data-listen-next
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-teal-700 active:scale-95"
                >
                  {idx < total - 1 ? "آیتم بعدی" : "دیدن نتیجه"}
                  <ChevronLeft size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-3 hidden items-center justify-center gap-1.5 border-t border-stone-100 pt-3 text-[11px] text-stone-400 min-[720px]:flex">
            <span>میان‌برها:</span>
            {["۱", "۲", "۳"].map((k) => (
              <kbd key={k} className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm">
                {k}
              </kbd>
            ))}
            <span>انتخاب گزینه ·</span>
            <kbd className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500 shadow-sm" dir="ltr">
              Enter
            </kbd>
            <span>آیتم بعدی</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
