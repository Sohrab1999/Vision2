"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, WifiOff, Loader2 } from "lucide-react";
import { questionSourceLesson } from "@/lib/study-store";
import { isTypingTarget, readDigit, useKeydown } from "@/hooks/use-keyboard";
import OptionButton from "../shared/option-button";
import { faNum } from "@/lib/study-theme";
import type { Feedback, PublicPlayer, QuizQuestion, DuelQ } from "./duel-types";
import { LETTERS } from "./duel-types";

// فاز PLAY — سؤال زنده با حلقهٔ زمانِ ریتمِ اتاق (Task 107)، HUD دو نفره و کیبورد ۱–۴
// (کیبورد همه‌چیدمان: ارقام لاتین/فارسی + کد فیزیکی — گام ۶)

export default function DuelPlay({ me, opp, total, cur, curQ, correctIdx, qi, picked, feedback, myDone, oppLeft, answer, timeLeft, paceMs }: {
  me: PublicPlayer | null;
  opp: PublicPlayer | null;
  total: number;
  cur: DuelQ | null;
  curQ: QuizQuestion | null;
  correctIdx: number;
  qi: number;
  picked: number;
  feedback: Feedback;
  myDone: boolean;
  oppLeft: boolean;
  answer: (i: number) => void;
  timeLeft: number;
  /** Task 107 — ریتمِ مؤثرِ اتاق از داور؛ مبنای حلقهٔ پیشرفتِ زمان */
  paceMs: number;
}) {
  // کیبورد ۱–۴ حین مسابقه — این نما فقط در فاز play روی صفحه است
  useKeydown(
    (e) => {
      if (isTypingTarget(e)) return;
      const n = readDigit(e);
      if (n !== null && n >= 1 && n <= 4) {
        e.preventDefault();
        answer(n - 1);
      }
    },
    true,
  );

  const totalSecs = Math.ceil(timeLeft / 1000);
  const ring = 2 * Math.PI * 26;
  const qProgress = timeLeft / paceMs; // Task 107 — کسر بر پایهٔ ریتمِ خودِ اتاق
  const myAnswered = me?.answered ?? 0;
  const myCorrect = me?.correct ?? 0;

  return (
    <div className="space-y-4">
      {/* بنر خروج حریف */}
      {oppLeft && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-[12.5px] font-bold text-rose-700"
        >
          حریف وسط نبرد قطع شد — اگر تا پایان مهلت برنگردد، برد با ضربهٔ فنی ثبت می‌شود.
        </motion.div>
      )}

      {/* HUD دو نفره */}
      <div className="duel-hud rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { p: me, label: "تو", isMe: true },
            { p: opp, label: "حریف", isMe: false },
          ].map(
            ({ p, label, isMe }) =>
              p && (
                <div key={p.sid} className={`rounded-xl border p-2.5 ${isMe ? "border-fuchsia-200 bg-fuchsia-50/60" : "border-stone-200 c-stone-60"}`}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-stone-700">
                      {label === "تو" ? label : p.name}
                    </span>
                    {p.done && <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />}
                    {p.disconnected && <WifiOff size={13} className="shrink-0 text-rose-400" />}
                    <span className="shrink-0 text-[15px] font-black text-stone-800">{faNum(p.score)}</span>
                  </div>
                  {/* خانه‌های پیشرفت */}
                  <div className="mt-2 flex gap-1" dir="ltr">
                    {Array.from({ length: total }).map((_, k) => {
                      const correctCount = p.correct;
                      const wrongCount = Math.max(0, p.answered - p.correct);
                      const cls =
                        k < correctCount
                          ? "bg-emerald-500"
                          : k < correctCount + wrongCount
                            ? "bg-rose-400"
                            : "bg-stone-200";
                      return <span key={k} className={`h-1.5 flex-1 rounded-full ${cls} ${k === p.qi && !p.done && !p.disconnected ? "animate-pulse bg-fuchsia-400" : ""}`} />;
                    })}
                  </div>
                  <div className="mt-1 text-[10.5px] font-bold text-stone-500">
                    {faNum(p.correct)} درست · سؤال {faNum(Math.min(p.qi + 1, total))} از {faNum(total)}
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* انتظار برای حریف پس از اتمام من */}
      {myDone ? (
        <div className="duel-card rounded-2xl border border-stone-200 c-card-elevated p-8 text-center shadow-sm">
          <Loader2 size={34} className="mx-auto mb-3 animate-spin text-fuchsia-500" />
          <h2 className="mb-1 text-lg font-black text-stone-800">همهٔ سؤال‌هایت تمام شد!</h2>
          {/* Task 192 — نبضِ زندهٔ حریف در لحظهٔ انتظار: همان زبانِ سلول‌های HUD
              (emerald/rose/pulse) در ماژولِ کانونیِ انتظار؛ حالتِ «حریف هم تمام
              کرد» و «حریف غایب» هر یک جملهٔ صادقِ خودش را دارد. */}
          {opp && !opp.done && !opp.disconnected ? (
            <>
              <p className="text-[13px] text-stone-500">منتظر حریف می‌مانیم تا مسابقه تمام شود…</p>
              <div
                className="mx-auto mt-4 max-w-[280px] rounded-xl border border-stone-200 c-stone-60 p-3 text-right"
                aria-label={`پیشرفت زندهٔ ${opp.name}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-extrabold text-stone-700">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: opp.color }} />
                    <span className="truncate">{opp.name}</span>
                  </span>
                  <span className="shrink-0 text-[14px] font-black text-stone-800">{faNum(opp.score)}</span>
                </div>
                <div className="flex gap-1" dir="ltr" aria-hidden>
                  {Array.from({ length: total }).map((_, k) => {
                    const wrongCount = Math.max(0, opp.answered - opp.correct);
                    const cls =
                      k < opp.correct
                        ? "bg-emerald-500"
                        : k < opp.correct + wrongCount
                          ? "bg-rose-400"
                          : k === opp.qi
                            ? "animate-pulse bg-fuchsia-400"
                            : "bg-stone-200";
                    return <span key={k} className={`h-1.5 flex-1 rounded-full ${cls}`} />;
                  })}
                </div>
                <div className="mt-1.5 text-[10.5px] font-bold text-stone-500">
                  سؤال {faNum(Math.min(opp.qi + 1, total))} از {faNum(total)} · {faNum(opp.correct)} درست
                </div>
              </div>
            </>
          ) : opp?.done ? (
            <p className="text-[13px] text-stone-500">حریف هم تمام کرد — منتظر جمع‌بندی داور…</p>
          ) : (
            <p className="text-[13px] text-stone-500">منتظر حریف می‌مانیم تا مسابقه تمام شود…</p>
          )}
        </div>
      ) : (
        cur &&
        curQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={qi}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.18 }}
              className={`duel-card rounded-2xl border-2 c-card-elevated p-5 shadow-md sm:p-6 ${
                feedback === "right" ? "border-emerald-400" : feedback === "wrong" ? "border-rose-400" : "border-fuchsia-200"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-fuchsia-50 px-2.5 py-1 text-[11px] font-bold text-fuchsia-700">
                  {questionSourceLesson(curQ) === 0 ? "بانک ۳۶۰ تستی" : `درس ${questionSourceLesson(curQ) === 1 ? "اول" : questionSourceLesson(curQ) === 2 ? "دوم" : "سوم"}`}
                </span>
                {/* حلقهٔ زمان هر سؤال */}
                <div className={`relative h-12 w-12 ${totalSecs <= 5 ? "duel-time-low" : ""}`}>
                  <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90">
                    <circle cx="30" cy="30" r="26" fill="none" strokeWidth="5" className="stroke-stone-100" />
                    <circle
                      cx="30"
                      cy="30"
                      r="26"
                      fill="none"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className={`transition-[stroke-dashoffset] duration-100 ${totalSecs <= 5 ? "stroke-rose-500" : "stroke-fuchsia-500"}`}
                      strokeDasharray={ring}
                      strokeDashoffset={ring * (1 - qProgress)}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-[13px] font-black ${totalSecs <= 5 ? "text-rose-600" : "text-fuchsia-600"}`}>
                    {faNum(totalSecs)}
                  </span>
                </div>
              </div>
              <p className="en-text mb-5 text-[16px] font-semibold leading-8 text-stone-800" dir="ltr">
                {curQ.question}
              </p>
              <div className="space-y-2.5" dir="ltr">
                {cur.perm.map((origIdx, i) => {
                  const isCorrect = feedback !== "none" && i === correctIdx;
                  const isWrong = feedback === "wrong" && picked === i;
                  return (
                    <OptionButton
                      key={i}
                      index={i}
                      label={LETTERS[i]}
                      text={curQ.options[origIdx]}
                      state={isCorrect ? "correct" : isWrong ? "wrong" : "idle"}
                      dim={feedback !== "none" && !isCorrect && !isWrong}
                      dimOpacity="50"
                      disabled={feedback !== "none"}
                      onClick={() => answer(i)}
                      accent="fuchsia"
                      icon="circle"
                      dataAttr="duel"
                    />
                  );
                })}
              </div>

              {feedback === "wrong" && curQ.translation && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl bg-rose-50/70 p-3 text-[13px] leading-7 text-stone-600">
                  {curQ.translation}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        )
      )}

      <p className="text-center text-[11px] font-bold text-stone-500" suppressHydrationWarning>
        امتیاز زنده: تو {faNum(myCorrect)} درست از {faNum(myAnswered)} — داوری روی سرور انجام می‌شود؛ تقلب ممکن نیست ⚔️
      </p>
    </div>
  );
}
