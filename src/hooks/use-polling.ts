"use client";

import { useEffect, useRef } from "react";

/**
 * Adaptive polling (audit §10 R-6).
 *
 * قرارداد واحد «نظرسنجی زنده»: بلافاصله یک بار می‌گیرد، بعد هر `intervalMs`
 * فقط وقتی تب پیدا است؛ تب پنهان آپدیت را حذف می‌کند و بازگشت به تب همان
 * لحظه رفرش می‌آورد (الگوی «تجربهٔ فاز ۲» که در لیدربورد و رش‌بورد عیناً
 * ۲۰ خط تکرار شده بود). `fn` همیشه تازه است — بستن inline مشکلی ندارد.
 */
export function usePolling(fn: () => void, intervalMs: number, enabled = true): void {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (document.hidden) return;
      fnRef.current();
    };
    tick();
    const t = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, enabled]);
}
