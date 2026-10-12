"use client";

import { motion } from "framer-motion";
import { Sparkles, Swords, Users, Timer, Zap, Wifi, WifiOff, Loader2, Target, ShieldCheck } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import type { Conn } from "./duel-types";

// فاز SETUP — قهرمان نبرد: آمار بردها، ساخت اتاق و پیوستن با کد

export default function DuelSetup({ conn, createRoom, joinRoom, joinInput, setJoinInput, joinBusy }: {
  conn: Conn;
  createRoom: () => void;
  joinRoom: () => void;
  joinInput: string;
  setJoinInput: (v: string) => void;
  joinBusy: boolean;
}) {
  const mounted = useMounted();
  const duelWins = useStudy((s) => s.duelWins);
  const duelLosses = useStudy((s) => s.duelLosses);
  const duelTies = useStudy((s) => s.duelTies);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="duel-hero relative overflow-hidden rounded-2xl bg-gradient-to-bl from-violet-600 via-fuchsia-600 to-rose-500 p-6 text-center text-white shadow-lg shadow-fuchsia-600/20 sm:p-10"
      >
        <div className="absolute -left-6 -top-8 opacity-[0.08]" aria-hidden>
          <Swords size={230} />
        </div>
        <div className="relative">
          <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-white shadow-xl shadow-fuchsia-900/30">
            <Swords size={38} />
          </span>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            <Sparkles size={13} />
            حالت چندنفرهٔ زنده — واژگان Vision 2
          </span>
          <h1 className="mb-2 text-2xl font-black sm:text-3xl">نبرد دودنفره</h1>
          <p className="mx-auto mb-6 max-w-lg text-[13.5px] leading-7 text-white/85">
            با یک یادگیرندهٔ دیگر همزمان مسابقه بده! هر دو همان ۱۰ سؤال را می‌بینید و داوری روی سرور انجام می‌شود —
            نه تقلبی، نه تأخیری. سریع‌تر جواب بدهی، امتیاز بیشتری می‌گیری.
          </p>

          <div className="mx-auto mb-7 flex flex-wrap items-center justify-center gap-2.5">
            <span className="rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-black backdrop-blur-sm">
              🏆 بردها: {faNum(mounted ? duelWins : 0)}
            </span>
            <span className="rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-black backdrop-blur-sm">
              😔 باخت‌ها: {faNum(mounted ? duelLosses : 0)}
            </span>
            <span className="rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-black backdrop-blur-sm">
              🤝 مساوی: {faNum(mounted ? duelTies : 0)}
            </span>
          </div>

          {/* ساخت اتاق */}
          <div className="mx-auto mb-4 max-w-md rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-center gap-2 text-[13px] font-black">
              <Users size={15} />
              اتاق جدید بساز
            </div>
            <p className="mb-3 text-[12px] leading-6 text-white/80">یک کد ۵حرفی می‌گیریم؛ به دوستت بده تا بپیوندد.</p>
            <button
              onClick={createRoom}
              disabled={conn !== "online"}
              className="duel-cta inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-3.5 text-[15px] font-black text-fuchsia-700 shadow-xl transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
            >
              <Swords size={18} />
              ساخت اتاق نبرد
            </button>
          </div>

          {/* پیوستن با کد */}
          <div className="mx-auto max-w-md rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-center gap-2 text-[13px] font-black">
              <Target size={15} />
              با کد به نبرد بپیوند
            </div>
            <div className="flex gap-2" dir="ltr">
              <input
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5))}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                placeholder="کد اتاق… مثل K7M2X"
                aria-label="کد اتاق مسابقه"
                className="duel-input w-full flex-1 rounded-xl border-2 border-white/30 bg-white/90 px-3 py-2.5 text-center font-mono text-lg font-black tracking-[0.3em] text-stone-800 outline-none placeholder:text-stone-400 focus:border-white"
              />
              <button
                onClick={joinRoom}
                disabled={conn !== "online" || joinBusy || joinInput.trim().length < 4}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-[13px] font-black text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {joinBusy ? <Loader2 size={15} className="animate-spin" /> : <Swords size={15} />}
                پیوستن
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-white/75">
            {conn === "online" ? <Wifi size={13} /> : conn === "connecting" ? <Loader2 size={13} className="animate-spin" /> : <WifiOff size={13} />}
            {conn === "online" ? "متصل به سرور نبرد" : conn === "connecting" ? "در حال اتصال…" : "اتصال برقرار نیست — چند لحظه صبر کن"}
          </div>
        </div>
      </motion.div>

      {/* چطور کار می‌کند؟ */}
      <section className="duel-card rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
          <ShieldCheck size={17} className="text-fuchsia-600" />
          چطور کار می‌کند؟
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {[
            {
              icon: Users,
              title: "۱. اتاق دو نفره",
              desc: "یکی اتاق می‌سازد و کد ۵حرفی را می‌فرستد؛ دیگری با کد می‌پیوندد و شمارش معکوس ۵ثانیه‌ای شروع می‌شود.",
            },
            {
              icon: Timer,
              title: "۲. ده سؤال، پانزده ثانیه",
              desc: "هر دو همان سؤال‌ها را با همان ترتیب گزینه‌ها می‌بینند؛ اگر تا ۱۵ ثانیه جواب ندهی، آن سؤال غلط حساب می‌شود.",
            },
            {
              icon: Zap,
              title: "۳. داوری روی سرور",
              desc: "هر پاسخ درست ۱۰۰ امتیاز + پاداش سرعت (تا ۱۰۰). نتیجه را سرور اعلام می‌کند؛ غلط‌ها به بانک مرور می‌روند.",
            },
          ].map((r) => (
            <div key={r.title} className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-100 text-fuchsia-700">
                  <r.icon size={14} />
                </span>
                <span className="text-[12.5px] font-extrabold text-stone-800">{r.title}</span>
              </div>
              <p className="text-[12px] leading-6 text-stone-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
