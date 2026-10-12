"use client";

import { useEffect, useRef, useState } from "react";

export interface CountdownOptions {
  /** full duration in ms — every (re)start counts down from here */
  duration: number;
  /** fire-and-forget resolution in ms (default 100) */
  tickMs?: number;
  /** when false the countdown freezes at its last value (no ticking) */
  active?: boolean;
  /** change this to restart the countdown while staying active (new question, new round…) */
  restartKey?: number | string;
  /** runs once when the countdown hits zero; always the freshest closure */
  onEnd?: () => void;
}

/**
 * Deadline-based countdown (audit §10 R-6).
 *
 * قبل از این قلاب، سه تایمر دستی در رش و دیوئل هر کدام با الگوی خودشان:
 * Date.now()+مدت در useEffect، setInterval، پاک‌سازی دستی و ریسک نشتی —
 * (نشتی واقعی: duel-view L247–251 در ممیزی). اکنون یک قرارداد:
 * - شمارش از «ضرب‌الاجل» است نه جمعِ تیک‌ها — دقیق حتی با تب غیرفعال؛
 * - `active=false` شمارش را منجمد می‌کند (مثلاً حین نمایش پاسخ در دیوئل)؛
 * - `restartKey` عوض شود شمارش از `duration` ری‌استارت می‌شود؛
 * - `onEnd` از طریق ref همیشه تازه است — نیازی به وابستگی‌های پایدار نیست.
 */
export function useCountdown({
  duration,
  tickMs = 100,
  active = true,
  restartKey = 0,
  onEnd,
}: CountdownOptions): number {
  // full duration on (re)start — the first async tick corrects it within one frame,
  // so callers never flash an empty bar at the moment a countdown begins
  const [remaining, setRemaining] = useState(duration);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!active) return; // frozen — keep the last remaining value on screen
    const deadline = Date.now() + duration;
    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      setRemaining(left);
      if (left <= 0) {
        clearInterval(iv);
        onEndRef.current?.();
      }
    };
    const iv = setInterval(tick, tickMs);
    // first paint of the new duration, async so the effect stays render-clean
    const t0 = setTimeout(tick, 0);
    return () => {
      clearInterval(iv);
      clearTimeout(t0);
    };
  }, [duration, tickMs, active, restartKey]);

  return remaining;
}
