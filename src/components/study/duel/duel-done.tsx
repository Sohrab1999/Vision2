"use client";

import { motion } from "framer-motion";
import { Trophy, Swords, Users, RotateCcw, Crown, Handshake, Loader2, ShieldCheck } from "lucide-react";
import { faNum } from "@/lib/study-theme";
import { decomposeDuelScore } from "@/lib/duel-history";
import type { EndPayload } from "./duel-types";

// فاز DONE — کارنامهٔ نبرد، مقایسهٔ دو بازیکن و دکمه‌های پس از نبرد

export default function DuelDone({ endData, mySid, myFinishAt, oppConnected, rematchVotes, rematch, leaveRoom }: {
  endData: EndPayload;
  mySid: string | null;
  myFinishAt: number;
  oppConnected: boolean;
  rematchVotes: number;
  rematch: () => void;
  leaveRoom: () => void;
}) {
  const mine = endData.players.find((p) => p.sid === mySid);
  const other = endData.players.find((p) => p.sid !== mySid);
  const outcome: "win" | "loss" | "tie" = endData.winner === null ? "tie" : endData.winner === mySid ? "win" : "loss";
  const forfeit = endData.reason === "forfeit";

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`duel-done relative overflow-hidden rounded-2xl border-2 p-6 text-center shadow-sm sm:p-8 ${
          outcome === "win"
            ? "dd-win border-emerald-300 bg-gradient-to-bl from-emerald-50 to-teal-50"
            : outcome === "tie"
              ? "dd-tie border-amber-300 bg-gradient-to-bl from-amber-50 to-orange-50"
              : "dd-lose border-rose-300 bg-gradient-to-bl from-rose-50 to-orange-50"
        }`}
      >
        <div className="relative">
          <motion.span
            initial={{ rotate: -12, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl ${
              outcome === "win"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                : outcome === "tie"
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30"
                  : "bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/30"
            }`}
          >
            {outcome === "win" ? <Trophy size={38} /> : outcome === "tie" ? <Handshake size={38} /> : <Swords size={38} />}
          </motion.span>
          <h1 className="mb-2 text-2xl font-black text-stone-800 sm:text-3xl">
            {outcome === "win" ? (forfeit ? "برد با ضربهٔ فنی!" : "پیروزی در نبرد! 🏆") : outcome === "tie" ? "مساوی — رقابت نزدیک!" : forfeit ? "حریف خارج شد" : "این دور را باختی"}
          </h1>
          <p className="mx-auto max-w-md text-[13px] leading-7 text-stone-600">
            {outcome === "win"
              ? forfeit
                ? "حریف وسط نبرد قطع شد؛ امتیازت سالم ثبت شد."
                : "سرعتمان خوب بود! حریف تازه‌ای را پیدا کن و زنجیرهٔ بردها را ادامه بده."
              : outcome === "tie"
                ? "امتیازها برابر شد؛ دوباره مبارزه کن تا برنده مشخص شود."
                : "ناراحت نباش — غلط‌های این نبرد به بانک مرور رفت‌اند تا دفعهٔ بعد قوی‌تر برگردی."}
          </p>
        </div>
      </motion.div>

      {/* کارت مقایسه */}
      <div className="duel-card rounded-2xl border border-stone-200 c-card-elevated p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
            <Crown size={16} className="text-amber-600" />
            کارنامهٔ نبرد
          </h2>
          {endData.receipt && (
            <span
              title="نتیجهٔ این نبرد با امضای داورِ سرور تأیید شد"
              className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/60 px-2 py-0.5 text-[10.5px] font-black text-emerald-700"
            >
              <ShieldCheck size={11} aria-hidden />
              رسیدِ امضاشدهٔ داوری
            </span>
          )}
        </div>
        <div className="space-y-2.5">
          {[
            { p: mine, label: "تو", highlight: outcome === "win" },
            { p: other, label: "حریف", highlight: outcome === "loss" },
          ].map(
            ({ p, label, highlight }) => {
              if (!p) return null;
              // Task 99 — تفکیکِ امتیاز: پایه (درست×۱۰۰) + پاداشِ سرعت (قراردادِ
              // داور در scoring.ts؛ نمایشِ کلاینت — اعتبار با رسیدِ ۹۴ است).
              const d = decomposeDuelScore(p.score, p.correct);
              const basePct = p.score > 0 ? Math.max(0, Math.min(100, Math.round((d.base / p.score) * 100))) : 0;
              return (
                <div
                  key={p.sid}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    highlight ? "border-emerald-300 bg-emerald-50/70" : "border-stone-200 c-stone-70"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: p.color }}>
                    <Users size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-extrabold text-stone-800">{p.name}</span>
                      <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500">{label}</span>
                      {p.disconnected && <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">خارج شد</span>}
                    </div>
                    <div className="mt-0.5 text-[11.5px] font-bold text-stone-400">
                      {faNum(p.correct)} درست از {faNum(Math.max(p.answered, endData.total))} · پیشروی {faNum(p.qi)}/{faNum(endData.total)}
                      {p.sid === mySid && myFinishAt > 0 && endData.startedAt
                        ? ` · زمان تو ${faNum(Math.max(1, Math.round((myFinishAt - endData.startedAt) / 1000)))} ثانیه`
                        : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-left">
                    <span className="text-xl font-black text-stone-800">{faNum(p.score)}</span>
                    {p.score > 0 && (
                      <>
                        <div className="mt-1 flex h-1.5 w-20 overflow-hidden rounded-full bg-stone-100" aria-hidden>
                          <span className="bg-emerald-500" style={{ width: `${basePct}%` }} />
                          <span className="flex-1 bg-amber-400" />
                        </div>
                        <div className="mt-0.5 text-[10px] font-bold text-stone-400">
                          {faNum(d.base)} پایه + {faNum(d.bonus)} سرعت
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
        <p className="mt-3 text-center text-[11.5px] leading-6 text-stone-400">
          {endData.receipt
            ? "نتیجهٔ این نبرد با رسیدِ امضاشدهٔ داور در آمار سرور ثبت شد — غلط‌هایت در کارت «بانک اشتباهات» خانه منتظرت هستند."
            : "نتیجهٔ این نبرد با امضای هویتی‌ات در آمار سرور ثبت شد — غلط‌هایت در کارت «بانک اشتباهات» خانه منتظرت هستند."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {oppConnected ? (
          <button
            onClick={rematch}
            className="duel-cta inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-8 py-3.5 text-[15px] font-black text-white shadow-xl shadow-fuchsia-600/25 transition-all hover:opacity-95 active:scale-95"
          >
            <RotateCcw size={18} />
            نبرد دوباره
          </button>
        ) : null}
        <button
          onClick={leaveRoom}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-6 py-3 text-[14px] font-black text-stone-600 transition-all hover:border-stone-300 active:scale-95"
        >
          <Swords size={16} />
          {oppConnected && rematchVotes > 0 ? "منتظر حریف… یا حریف جدید" : "حریف جدید"}
        </button>
      </div>
      {oppConnected && rematchVotes > 0 && (
        <p className="text-center text-[12px] font-bold text-fuchsia-600">
          <Loader2 size={12} className="ml-1 inline animate-spin" />
          منتظر تأیید حریف برای نبرد دوباره…
        </p>
      )}
    </div>
  );
}
