"use client";

import { useMemo } from "react";

/**
 * Lightweight CSS confetti burst for new records (shared — audit §10 R-6).
 * تا گام ۶ داخل rush-view زندگی می‌کرد؛ هر حال دیگر (دیوئل، آزمون جامع…)
 * می‌تواند بدون کپی‌کردن ۲۵ خط، همین را بازفروشد.
 */
export default function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: 6 + ((i * 37) % 88),
        delay: (i % 6) * 0.12,
        dur: 1.6 + ((i * 7) % 10) / 10,
        color: ["#f59e0b", "#f97316", "#ef4444", "#10b981", "#fbbf24"][i % 5],
        size: 6 + (i % 3) * 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 block rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
