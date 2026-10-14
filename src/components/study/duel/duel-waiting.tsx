"use client";

import { motion } from "framer-motion";
import { Users, Copy, LogOut, Loader2, Timer } from "lucide-react";
import type { PublicPlayer } from "./duel-types";
import { paceSecondsLabel } from "@/lib/duel-pace";

// فاز WAITING — اتاق ساخته شده و منتظر حریفیم

export default function DuelWaiting({ roomCode, players, mySid, paceMs, copyCode, leaveRoom }: {
  roomCode: string | null;
  players: PublicPlayer[];
  mySid: string | null;
  /** Task 107 — ریتمِ مؤثرِ اتاق از داور (duel:state)؛ هر دو طرف همان را می‌بینند */
  paceMs: number;
  copyCode: () => void;
  leaveRoom: () => void;
}) {
  return (
    <div className="duel-card mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200 c-card-elevated p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700">
        <Users size={30} />
      </span>
      <h1 className="text-xl font-black text-stone-800">اتاق آماده است!</h1>
      <p className="text-[13px] leading-6 text-stone-500">این کد را برای حریفت بفرست. با پیوستن او، نبرد خودکار شروع می‌شود.</p>

      <button
        onClick={copyCode}
        className="duel-code group mx-auto flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 px-4 py-4 transition-all hover:border-fuchsia-400 active:scale-[0.98]"
        aria-label={`کد اتاق ${roomCode} — برای کپی کلیک کن`}
      >
        <span className="font-mono text-3xl font-black tracking-[0.35em] text-fuchsia-700" dir="ltr">
          {roomCode}
        </span>
        <Copy size={18} className="text-fuchsia-500 transition-transform group-hover:scale-110" />
      </button>

      {/* Task 107 — ریتمِ اتاق: عددی که داور در duel:state فرستاده؛ هر دو
          بازیکن پیش از شروع همان را می‌بینند — نه حدسِ محلیِ هر کلاینت */}
      <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11.5px] font-black text-stone-600">
        <Timer size={13} className="text-fuchsia-600" aria-hidden />
        سرعت هر سؤال: {paceSecondsLabel(paceMs)}
      </div>

      {/* بازیکنان */}
      <div className="flex items-center justify-center gap-3">
        {[0, 1].map((i) => {
          const p = players[i];
          return p ? (
            <motion.div
              key={p.sid}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex min-w-28 flex-col items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5"
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="max-w-28 truncate text-[12.5px] font-extrabold text-stone-700">{p.name}</span>
              <span className="text-[10px] font-bold text-stone-500">{p.sid === mySid ? "تو" : "حریف"}</span>
            </motion.div>
          ) : (
            <div key={`slot-${i}`} className="flex min-w-28 flex-col items-center gap-1 rounded-xl border border-dashed border-stone-200 px-3 py-2.5 text-stone-300">
              <Users size={16} />
              <span className="text-[11px] font-bold">در انتظار…</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-fuchsia-600">
        <Loader2 size={14} className="animate-spin" />
        منتظر پیوستن حریف…
      </div>

      <button
        onClick={leaveRoom}
        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2 text-[12.5px] font-bold text-stone-500 transition-colors hover:border-rose-200 hover:text-rose-600"
      >
        <LogOut size={14} />
        لغو و بازگشت
      </button>
    </div>
  );
}
