"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, Users, RotateCcw, Crown, Handshake, Loader2, ShieldCheck, ImageDown, Share2, Timer } from "lucide-react";
import { faNum, secFa } from "@/lib/study-theme";
import { decomposeDuelScore, duelHeadToHead } from "@/lib/duel-history";
import { useStudy } from "@/lib/study-store";
import { duelThinkStats } from "@/lib/duel-think";
import { downloadDuelDoneImage, buildDuelDoneBlob } from "@/lib/result-image";
import { canShareImageFiles, blobToFile, shareImageFile, type ShareOutcome } from "@/lib/share-card";
import { useToast } from "@/hooks/use-toast";
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
  const [imgBusy, setImgBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const { toast } = useToast();

  // Task 191 — «کارنامهٔ مقابلِ این حریف»: دفترچه به کارتِ مقایسه وصل می‌شود.
  // duelHeadToHead با نامِ نرمال‌شدهٔ ۹۸ می‌شمارد؛ نامِ فالبکِ «حریف» و
  // دفترچهٔ بی‌سابقهٔ مقابلِ او → null (بلوک غایب). رکوردِ همین نبرد چون
  // persistResult پیش از رندرِ done در دفترچه نشسته، داخلِ شمارش است —
  // برچسبِ «با همین نبرد» همین را شفاف می‌گوید.
  const duelHistory = useStudy((s) => s.duelHistory);
  const h2h = duelHeadToHead(duelHistory, other?.name);

  // Task 106 → ۱۰۹ — secFa به study-theme مهاجرت کرد (یک قراردادِ مشترک؛
  // هفته‌نامه هم از امروز همین را می‌خواند). null → «—» همان‌جا حل شده.

  // Task 101 — عکسِ این نبرد: همان کارتِ نبرد با دادهٔ EndPayload؛ تفکیکِ
  // پایه/سرعت از همان decomposeDuelScoreِ کارنامه (قراردادِ ۹۹)؛ ثانیه‌ها
  // فقط وقتی خودی تمام کرده (myFinishAt>0) — همان قراردادِ نمایشِ کارنامه
  const saveDuelImage = async () => {
    if (imgBusy || !mine) return;
    setImgBusy(true);
    const d = decomposeDuelScore(mine.score, mine.correct);
    const ok = await downloadDuelDoneImage({
      outcome,
      forfeit,
      myName: mine.name || "تو",
      oppName: other?.name || "حریف",
      myScore: mine.score,
      oppScore: other?.score ?? 0,
      myCorrect: mine.correct,
      oppCorrect: other?.correct ?? 0,
      total: endData.total,
      durationSec:
        myFinishAt > 0 && endData.startedAt
          ? Math.max(1, Math.round((myFinishAt - endData.startedAt) / 1000))
          : null,
      base: d.base,
      bonus: d.bonus,
      receipt: !!endData.receipt,
    });
    setImgBusy(false);
    toast(
      ok
        ? { title: "🖼 عکسِ این نبرد ذخیره شد", description: "حالا می‌توانی نتیجه‌ات را برای دوستانت بفرستی.", duration: 3000 }
        : { title: "خطا در ساخت تصویر", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };

  // Task 102 — هم‌رسانیِ بومیِ همان کارت: داده‌ها از همان EndPayloadِ صادق؛
  // متن، همان ریبونِ نتیجه است که روی کارت کشیده می‌شود (یک حقیقت، دو بستر)
  const shareDuelImage = async () => {
    if (shareBusy || imgBusy || !mine) return;
    setShareBusy(true);
    const d = decomposeDuelScore(mine.score, mine.correct);
    const blob = await buildDuelDoneBlob({
      outcome,
      forfeit,
      myName: mine.name || "تو",
      oppName: other?.name || "حریف",
      myScore: mine.score,
      oppScore: other?.score ?? 0,
      myCorrect: mine.correct,
      oppCorrect: other?.correct ?? 0,
      total: endData.total,
      durationSec:
        myFinishAt > 0 && endData.startedAt
          ? Math.max(1, Math.round((myFinishAt - endData.startedAt) / 1000))
          : null,
      base: d.base,
      bonus: d.bonus,
      receipt: !!endData.receipt,
    });
    let outcome2: ShareOutcome = "failed";
    if (blob) {
      const ribbon =
        outcome === "win"
          ? forfeit
            ? "برد با ضربهٔ فنی!"
            : "پیروزی در نبرد!"
          : outcome === "tie"
            ? "مساوی — رقابت نزدیک"
            : forfeit
              ? "حریف خارج شد"
              : "این دور را باختی";
      outcome2 = await shareImageFile({
        file: blobToFile(blob, `vision2-duel-${outcome}.png`),
        title: "نبرد واژگان — وب‌کتاب ویژن ۲",
        text: `${ribbon} ${faNum(mine.score)} به ${faNum(other?.score ?? 0)}`,
      });
    }
    setShareBusy(false);
    if (outcome2 === "shared") {
      toast({ title: "📨 نبرد هم‌رسانی شد", description: "کارتِ این نبرد با شیتِ خودِ سیستم فرستاده شد.", duration: 3000 });
    } else if (outcome2 === "failed") {
      toast({ title: "هم‌رسانی ممکن نشد", description: "می‌توانی عکس را ذخیره کنی و خودت بفرستی.", duration: 3000 });
    }
  };

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
                    <div className="mt-0.5 text-[11.5px] font-bold text-stone-500">
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
                        <div className="mt-0.5 text-[10px] font-bold text-stone-500">
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
        {/* Task 191 — سرشماریِ مقابلِ همین حریف از دفترچه (شاملِ نبردِ جاری) */}
        {h2h && other && (
          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 text-center text-[11.5px] font-bold leading-6 text-stone-500">
            <Swords size={12} className="shrink-0 text-fuchsia-500" aria-hidden />
            <span>
              کارنامهٔ مقابلِ {other.name} در دفترچه (با همین نبرد):{" "}
              <span className="font-black text-stone-600">
                {faNum(h2h.win)} برد · {faNum(h2h.loss)} باخت
                {h2h.tie > 0 ? ` · ${faNum(h2h.tie)} مساوی` : ""}
              </span>
            </span>
          </p>
        )}
        <p className="mt-3 text-center text-[11.5px] leading-6 text-stone-500">
          {endData.receipt
            ? "نتیجهٔ این نبرد با رسیدِ امضاشدهٔ داور در آمار سرور ثبت شد — غلط‌هایت در کارت «بانک اشتباهات» خانه منتظرت هستند."
            : "نتیجهٔ این نبرد با امضای هویتی‌ات در آمار سرور ثبت شد — غلط‌هایت در کارت «بانک اشتباهات» خانه منتظرت هستند."}
        </p>
      </div>

      {/* Task 106 — «زمانِ فکر»: ریتمِ دیدن→پاسخِ خودی از ساعتِ خودِ داور
          (duel:seen؛ امتیاز همچنان از qStartAt است). بی‌نمونه (سرویسِ قدیمی/
          ندیدنِ سؤال) کلِ بلوک صادقانه غایب است — نه صفرِ ساختگی */}
      {(() => {
        const samples = mySid ? endData.think?.[mySid] : undefined;
        if (!samples) return null;
        const st = duelThinkStats(samples);
        if (st.seen === 0) return null;
        const span = Math.max(st.maxMs ?? 1, 1);
        return (
          <div
            className="duel-think rounded-2xl border border-stone-200 c-card-elevated p-5 shadow-sm"
            aria-label="زمانِ فکرِ من در این نبرد"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
                <Timer size={16} className="text-violet-600" aria-hidden />
                زمانِ فکرِ تو
              </h2>
              <span className="shrink-0 rounded-full border border-violet-200 bg-violet-50/60 px-2 py-0.5 text-[10.5px] font-black text-violet-700">
                ثبت برای {faNum(st.seen)} از {faNum(st.total)} سؤال
              </span>
            </div>
            <div className="mb-2 flex h-12 items-end gap-1" aria-hidden>
              {samples.map((ms, i) =>
                ms === null ? (
                  <span
                    key={i}
                    title={`سؤال ${faNum(i + 1)}: ثبت نشده`}
                    className="h-1 flex-1 rounded-full bg-stone-200"
                  />
                ) : (
                  <span
                    key={i}
                    title={`سؤال ${faNum(i + 1)}: ${secFa(ms)} ثانیه`}
                    className="flex-1 rounded-full bg-gradient-to-t from-arcade-from-soft to-fuchsia-400"
                    style={{ height: `${Math.max(6, Math.round((ms / span) * 44))}px` }}
                  />
                )
              )}
            </div>
            <p className="text-center text-[11.5px] font-bold leading-6 text-stone-500">
              میانگینِ فکر {secFa(st.avgMs)} ثانیه · سریع‌ترین {secFa(st.minMs)} ثانیه
              {st.seen < st.total ? ` · ${faNum(st.total - st.seen)} سؤال بدونِ ثبت` : ""}
            </p>
          </div>
        );
      })()}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {oppConnected ? (
          <button
            onClick={rematch}
            className="duel-cta inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-l from-arcade-from to-arcade-to px-8 py-3.5 text-[15px] font-black text-white shadow-xl shadow-fuchsia-600/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
          >
            <RotateCcw size={18} />
            نبرد دوباره
          </button>
        ) : null}
        {/* Task 101 — عکسِ این نبرد: هم‌ردیفِ اکشن‌ها، سلسله‌مراتبِ ثانویه */}
        <button
          onClick={saveDuelImage}
          disabled={imgBusy || !mine}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-[14px] font-black text-stone-600 transition-[background-color,color,border-color,transform,opacity] hover:text-fuchsia-700 active:scale-[0.96] disabled:opacity-50"
        >
          {imgBusy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ImageDown size={16} aria-hidden />}
          عکسِ این نبرد
        </button>
        {/* Task 102 — هم‌رسانیِ بومی فقط وقتی مرورگر واقعاً فایل می‌پذیرد */}
        {canShareImageFiles() && (
          <button
            onClick={shareDuelImage}
            disabled={shareBusy || imgBusy || !mine}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-[14px] font-black text-stone-600 transition-[background-color,color,border-color,transform,opacity] hover:text-fuchsia-700 active:scale-[0.96] disabled:opacity-50"
          >
            {shareBusy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Share2 size={16} aria-hidden />}
            هم‌رسانی
          </button>
        )}
        <button
          onClick={leaveRoom}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-[14px] font-black text-stone-600 transition-[background-color,color,border-color,transform] hover:text-stone-700 active:scale-[0.96]"
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
