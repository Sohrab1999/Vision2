"use client";

import type { LucideIcon } from "lucide-react";
import { Check, X, CheckCircle2, XCircle } from "lucide-react";

/**
 * OptionButton — the ONE answer-option row of every quiz surface
 * (audit §10 R-6). تا گام ۶ چهار نسخهٔ ساختاری یکسان وجود داشت:
 * موتور تست (زمردی)، رش (نارنجی)، دیوئل (فوشیا)، شنیداری (فیروزه‌ای) —
 * با همان اسکلت: قاب ۲px، نشان حرف/شماره، حالت درست/غلط/انتخاب،
 * کم‌نورشدن بقیه. همهٔ تفاوت‌های ظاهری با پراپ حفظ شده تا پیکسل‌ها
 * دقیقاً همان بمانند.
 */

export type OptionAccent = "emerald" | "teal" | "orange" | "fuchsia";
/** badge icon family: plain check/x or the filled circle pair (rush/duel) */
export type OptionBadgeIcon = "check" | "circle";
export type OptionState = "idle" | "chosen" | "correct" | "wrong";

const ACCENTS: Record<OptionAccent, { hover: string; chosen: string }> = {
  emerald: { hover: "hover:border-emerald-300 hover:bg-emerald-50/40", chosen: "border-emerald-300 bg-emerald-50/50" },
  teal: { hover: "hover:border-teal-300 hover:bg-teal-50/40", chosen: "border-teal-300 bg-teal-50/50" },
  orange: { hover: "hover:border-orange-300 hover:bg-orange-50/50", chosen: "border-orange-300 bg-orange-50/50" },
  fuchsia: { hover: "hover:border-fuchsia-300 hover:bg-fuchsia-50/50", chosen: "border-fuchsia-300 bg-fuchsia-50/50" },
};

export interface OptionButtonProps {
  index: number;
  /** badge content while idle: letter («a») or Persian numeral («۱») */
  label: string;
  text: string;
  /** Persian option text — drops the en-text latin styling */
  textFa?: boolean;
  state?: OptionState;
  /** answer locked and this row is neither correct nor wrong → dim it */
  dim?: boolean;
  /** preserve each surface's exact dim level (rush 50, others 60) */
  dimOpacity?: "50" | "60";
  disabled?: boolean;
  onClick?: () => void;
  accent?: OptionAccent;
  icon?: OptionBadgeIcon;
  align?: "left" | "right";
  /** listen-view rows are roomier */
  roomy?: boolean;
  textSize?: string;
  leading?: string;
  /** keeps the data-<surface>-option hook used by tests/QA */
  dataAttr?: "quiz" | "rush" | "duel" | "listen";
}

export default function OptionButton({
  index,
  label,
  text,
  textFa = false,
  state = "idle",
  dim = false,
  dimOpacity = "60",
  disabled = false,
  onClick,
  accent = "emerald",
  icon = "check",
  align = "left",
  roomy = false,
  textSize = "text-[14.5px]",
  leading,
  dataAttr,
}: OptionButtonProps) {
  const a = ACCENTS[accent];
  const stateCls =
    state === "correct"
      ? "border-emerald-500 bg-emerald-50"
      : state === "wrong"
        ? "border-rose-400 bg-rose-50"
        : state === "chosen"
          ? a.chosen
          : `border-stone-200 bg-white ${a.hover}`;
  const badgeCls =
    state === "correct" ? "bg-emerald-500 text-white" : state === "wrong" ? "bg-rose-700 text-white" : "bg-stone-100 text-stone-600";
  const Icon: LucideIcon | null =
    state === "correct" ? (icon === "circle" ? CheckCircle2 : Check) : state === "wrong" ? (icon === "circle" ? XCircle : X) : null;
  const dimCls = !dim ? "" : dimOpacity === "50" ? "opacity-50" : "opacity-60";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...(dataAttr ? { [`data-${dataAttr}-option`]: index } : {})}
      className={`flex w-full items-center gap-3 rounded-xl border-2 ${roomy ? "p-3.5" : "p-3"} ${
        align === "right" ? "text-right" : "text-left"
      } transition-[background-color,color,border-color,transform] active:scale-[0.96] ${stateCls} ${dimCls}`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black ${badgeCls}`}>
        {Icon ? <Icon size={14} /> : label}
      </span>
      <span className={`${textFa ? "" : "en-text "}${textSize} font-medium text-stone-800 ${leading ?? ""}`}>{text}</span>
    </button>
  );
}
