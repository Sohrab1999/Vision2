// ---------------------------------------------------------------------
// متروی گرامر — پالت رنگ خط‌ها (مشترک بین ویوی نقشه و جریان درس)
// کلاس‌های تیرهٔ این پالت در globals.css با .gmetro/.glesson کامل می‌شود.
// ---------------------------------------------------------------------

import type { GrammarLineColor } from "@/data/grammar-map";

export interface LinePalette {
  solid: string;
  rail: string;
  soft: string;
  text: string;
  border: string;
}

export const LINE_COLORS: Record<GrammarLineColor, LinePalette> = {
  emerald: {
    solid: "bg-emerald-700",
    rail: "bg-gradient-to-l from-emerald-300 via-emerald-500 to-emerald-700",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  amber: {
    solid: "bg-amber-700",
    rail: "bg-gradient-to-l from-amber-300 via-amber-400 to-amber-600",
    soft: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  teal: {
    solid: "bg-teal-700",
    rail: "bg-gradient-to-l from-teal-300 via-teal-500 to-teal-700",
    soft: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  rose: {
    // r335: -۶۰۰ زیرِ سفیدِ کامل = ۴٫۷۳ (مرزی؛ آلفایِ پسوندِ کهنه ۳٫۱۸)
    // — یک پله عمیق‌تر مثل توکنِ جوهرِ خانواده (سفید رویِ -۷۰۰ = ۶٫۳).
    solid: "bg-rose-700",
    rail: "bg-gradient-to-l from-rose-300 via-rose-400 to-rose-600",
    soft: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  violet: {
    solid: "bg-violet-600",
    rail: "bg-gradient-to-l from-violet-300 via-violet-500 to-violet-700",
    soft: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  orange: {
    solid: "bg-orange-700",
    rail: "bg-gradient-to-l from-orange-300 via-orange-400 to-orange-600",
    soft: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  sky: {
    // r335: سفید رویِ -۷۰۰ زنده ≈ ۴٫۳۴ (مردودِ مرزی) — -۸۰۰ = ۷٫۵؛
    // در تاریک قاعدهٔ scopedِ باندِ گمترو استاپِ کرنلشده را عمیق نگه میدارد.
    solid: "bg-sky-800",
    rail: "bg-gradient-to-l from-sky-300 via-sky-500 to-sky-700",
    soft: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  fuchsia: {
    solid: "bg-fuchsia-700",
    rail: "bg-gradient-to-l from-fuchsia-300 via-fuchsia-500 to-fuchsia-700",
    soft: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
  },
  lime: {
    solid: "bg-lime-700",
    rail: "bg-gradient-to-l from-lime-300 via-lime-500 to-lime-700",
    soft: "bg-lime-50",
    text: "text-lime-700",
    border: "border-lime-200",
  },
  indigo: {
    solid: "bg-indigo-700",
    rail: "bg-gradient-to-l from-indigo-300 via-indigo-500 to-indigo-700",
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  cyan: {
    solid: "bg-cyan-700",
    rail: "bg-gradient-to-l from-cyan-300 via-cyan-500 to-cyan-700",
    soft: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  // راند ۱۹۸ — خط‌های متوسطهٔ اول
  pink: {
    solid: "bg-pink-700",
    rail: "bg-gradient-to-l from-pink-300 via-pink-500 to-pink-700",
    soft: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  blue: {
    solid: "bg-blue-700",
    rail: "bg-gradient-to-l from-blue-300 via-blue-500 to-blue-700",
    soft: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  purple: {
    solid: "bg-purple-700",
    rail: "bg-gradient-to-l from-purple-300 via-purple-500 to-purple-700",
    soft: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
};
