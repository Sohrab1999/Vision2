"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { Volume2, Loader2, Square } from "lucide-react";
import { speak, speakFailToast } from "@/lib/speak";

interface SpeakButtonProps {
  text: string;
  speed?: number;
  size?: "sm" | "md" | "icon";
  className?: string;
  label?: string;
  /** راند ۲۳۴ — کنشِ اختیاریِ هم‌زمانِ شروعِ روخوانی؛ جدولِ افعال با آن
   * «آخرین فعلِ شنیده‌شده» را ثبت می‌کند (سوختِ «ادامهٔ مطالعه»). */
  onSpeak?: () => void;
  /** راند ۴۰۹ — دسترسیِ امریِ کیبوردِ دریل: میانبرِ T همان دکمه را
   * کلیک میکند (استِ روخوانی/توقف و fail-toast همه نزدِ همین مالک میماند).
   * React 19 — ref بهعنوانِ prop؛ همهٔ مصرفکنندگانِ دیگر بیاثر (اختیاری). */
  ref?: Ref<HTMLButtonElement>;
}

export default function SpeakButton({
  text,
  speed = 0.95,
  size = "sm",
  className = "",
  label,
  onSpeak,
  ref: btnRef,
}: SpeakButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const handle = async () => {
    if (state === "playing") {
      if (stopRef.current) stopRef.current();
      stopRef.current = null;
      setState("idle");
      return;
    }
    // شروعِ روخوانی = کنشِ واقعیِ خواندن (راند ۲۳۴) — پیش از هر تلاشِ شبکه
    onSpeak?.();
    setState("loading");
    const stop = await speak(
      text,
      speed,
      () => setState("idle"),
      // راندِ ۳۴۵ — شکستِ صدا دیگر ساکت نیست: همزبانِ خانوادهٔ شنیدار
      // (listen-view) — بدونِ هیچ رویدادِ تحلیلیِ دروغین رویِ پایِ شکست.
      // r394 — سهگانهٔ خانواده از مالکِ نامدار (speak.ts)
      () => {
        setState("idle");
        speakFailToast();
      }
    );
    stopRef.current = () => {
      stop();
      setState("idle");
    };
    setState("playing");
  };

  const iconSize = size === "md" ? 18 : 14;
  const cls =
    size === "icon"
      ? "h-11 w-11 rounded-full"
      : "h-11 rounded-full gap-1.5 px-2.5";

  return (
    <button
      type="button"
      ref={btnRef}
      onClick={handle}
      title="روخوانی با هوش مصنوعی"
      aria-label="روخوانی متن انگلیسی"
      className={`inline-flex items-center justify-center border transition-[background-color,color,border-color,box-shadow,transform] active:scale-[0.96] ${
        state === "playing"
          ? "bg-emerald-700 text-white border-emerald-600 shadow-sm"
          : "bg-white/80 hover:bg-emerald-50 text-emerald-700 border-emerald-200"
      } ${cls} ${className}`}
    >
      {state === "loading" ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : state === "playing" ? (
        <Square size={iconSize - 2} />
      ) : (
        <Volume2 size={iconSize} />
      )}
      {label && size !== "icon" && (
        <span className="text-xs font-medium">
          {state === "playing" ? "توقف" : label || "روخوانی"}
        </span>
      )}
    </button>
  );
}
