"use client";

// ------------------------------------------------------------------
// r351 — «برجِ بیدار» — پیشنهادِ ②ِ r350: نشانِ فعالِ برجِ مراقبت.
// r350 نبضِ کامل را ساخت (کارتِ کهرباییِ نانهای خطا در دیالوگ)، اما
// آن دید فقط وقتی زنده است که اپراتور خودش دیالوگ را باز کند. این
// قلابِ کوچک، GET /api/client-error را یکبار در سوارشدن (و با کلیدِ
// تازهسازی در هر بازشدنِ تنظیمات) میخواند و «تازگی» را حساب میکند:
// آخرین نانِ خطا در ۲۴ ساعتِ گذشته؟ ⇒ نقطهٔ کهربایی رویِ دکمهٔ
// تنظیمات در سربرگ — سیگنالِ غیرمزاحم (هیچ توستی رویِ بازکردنِ
// صفحه نمیآید؛ خودِ کرش از r346 خودش را درمان میکند و توستِ هشدار
// تنها زخم را نمک میپاشد). خطا ⇒ بی‌نشان (دیدبانی، نه درستکاری —
// همان قانونِ ردیفهای بودجه).
// ------------------------------------------------------------------

import { useEffect, useState } from "react";

export const WATCHTOWER_FRESH_WINDOW_MS = 24 * 3600 * 1000;

export interface WatchtowerSnapshot {
  state: "idle" | "ready" | "error";
  count: number;
  fresh: boolean;
}

/** آیا این مُهرِ زمانی «تازه» است؟ خالی/زباله/آینده ⇒ نه (صداقت) */
export function isFreshBreadcrumb(at: string | undefined, now: number = Date.now()): boolean {
  if (!at) return false;
  const t = Date.parse(at);
  if (!Number.isFinite(t)) return false;
  const age = now - t;
  return age >= 0 && age < WATCHTOWER_FRESH_WINDOW_MS;
}

export function useWatchtower(refreshKey: number = 0): WatchtowerSnapshot {
  const [snap, setSnap] = useState<WatchtowerSnapshot>({ state: "idle", count: 0, fresh: false });

  useEffect(() => {
    let alive = true;
    // نقطه، دوتایی است (هست/نیست) — loadingِ میانی مصرفی ندارد؛
    // state فقط با نتیجهٔ واکش جلو میرود (قاعدهٔ set-state-in-effect).
    fetch("/api/client-error", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("watchtower http " + res.status);
        const data = (await res.json()) as { ok?: boolean; count?: number; last?: { at?: string } };
        if (!alive) return;
        const count = typeof data.count === "number" && Number.isFinite(data.count) ? data.count : 0;
        setSnap({ state: "ready", count, fresh: isFreshBreadcrumb(data.last?.at) });
      })
      .catch(() => {
        if (!alive) return;
        // خطا = بی‌نشان — نشانِ جعلیِ «سلامت» یا «خطر» هر دو دروغند
        setSnap((s) => ({ ...s, state: "error", fresh: false }));
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return snap;
}
