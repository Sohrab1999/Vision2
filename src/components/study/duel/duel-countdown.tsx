"use client";

import { AnimatePresence, motion } from "framer-motion";
import { faNum } from "@/lib/study-theme";
import type { PublicPlayer } from "./duel-types";

// فاز COUNTDOWN — شمارش معکوس ۵ثانیه‌ای پیش از شروع نبرد

export default function DuelCountdown({ countdownLeft, players }: {
  countdownLeft: number;
  players: PublicPlayer[];
}) {
  const secs = Math.ceil(countdownLeft / 1000);
  return (
    <div className="duel-hero flex min-h-[55vh] flex-col items-center justify-center rounded-2xl bg-gradient-to-bl from-violet-600 via-fuchsia-600 to-rose-500 p-8 text-center text-white shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        {[0, 1].map((i) => {
          const p = players[i];
          return p ? (
            <div key={p.sid} className="flex flex-col items-center gap-1 rounded-xl border border-white/25 bg-white/15 px-4 py-2 backdrop-blur-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[12.5px] font-extrabold">{p.name}</span>
            </div>
          ) : null;
        })}
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={secs}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          className="text-[110px] font-black leading-none drop-shadow-lg"
        >
          {faNum(Math.max(1, secs))}
        </motion.div>
      </AnimatePresence>
      <p className="mt-4 text-[14px] font-bold text-white/85">نبرد تا لحظه‌ای دیگر… آماده باش! ⚔️</p>
    </div>
  );
}
