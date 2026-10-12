"use client";

import { UserRound } from "lucide-react";
import { avatarClasses } from "../header";

/**
 * AvatarDot — the colored initial-letter avatar used by every ranking
 * surface. تا گام ۶ نسخهٔ محلی leaderboard و یک نسخهٔ inline در rush-board
 * زندگی می‌کردند؛ اکنون یکی است (اندازهٔ قلم ≈ ۰٫۳۸ اندازهٔ دایره).
 */
export default function AvatarDot({ color, name, size = 36 }: { color: string; name: string; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-black text-white shadow-md ${avatarClasses[color] ?? "bg-gradient-to-br from-stone-400 to-stone-600 shadow-stone-500/30"}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name ? name.trim().charAt(0) : <UserRound size={size * 0.5} />}
    </span>
  );
}
