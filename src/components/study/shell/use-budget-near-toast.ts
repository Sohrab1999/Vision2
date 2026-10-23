"use client";

// ------------------------------------------------------------------
// r360 — «هشدارِ پیشازِسقف» — پیشنهادِ ④ِ r358 (دو راند باز): امروز
// فقط نوارها دربارهٔ بودجه حرف میزنند (منفعل) و توستهایِ r347/r348
// فقط وقتی سقف «بسته» شد میآیند (واکنشی) — یادگیرنده سقف را وقتی
// میشناسد که دیگر دیر است. این قلاب حلقهٔ گمشده است: تنِ «نزدیک»
// (≥۸۵ — همان آستانهٔ موتورِ budget-tone، بدونِ هیچ لیترالی اینجا)
// رویدادِ window میفرستد و اینجا توستِ اختصاصیِ هر سرویس، روزیِ
// یک‌بار، میآید.
//
// قراردادها:
//   • آستانه فقط در موتور است — اینجا «near» واژگانِ موتور است نه عدد
//   • سقفِ بسته (۱۰۰٪) هشدارِ پیشازِسقف نمیگیرد — آن لحظه مالِ خانوادهٔ
//     توستهایِ بستهٔ r347/r348 است (دوتاییِ صحنه ممنوع — درسِ TOAST_LIMIT)
//   • روزیِ یک‌بار به ازایِ هر سرویس (دو کلیدِ مستقل) — از تکحقیقتِ
//     once-per-day (استخراجِ همین راند)
//   • خدمتِ ناشناخته/دیتایِ زباله ⇒ هیچ — جعلِ هشدار ممنوع
//   • این قلاب رویداد تولید نمیکند — خواننده است، همزادِ چیپِ r359
// ------------------------------------------------------------------

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { faNum } from "@/lib/study-theme";
import { oncePerDay } from "@/lib/once-per-day";

const NEAR_TTS_KEY = "vision2-budget-near-tts-toast-day"; // r360
const NEAR_EXPLAIN_KEY = "vision2-budget-near-explain-toast-day"; // r360

export type BudgetNearService = "tts" | "explain";

export const BUDGET_NEAR_EVENT = "budget-near";

export function useBudgetNearToast() {
  const { toast } = useToast();
  useEffect(() => {
    const onNear = (e: Event) => {
      const detail = (e as CustomEvent<{ service?: unknown; pct?: unknown }>).detail;
      const service = detail?.service;
      if (service !== "tts" && service !== "explain") return; // خدمتِ ناشناخته ⇒ هیچ
      const raw = typeof detail?.pct === "number" ? detail.pct : NaN;
      if (!Number.isFinite(raw) || raw <= 0 || raw >= 100) return; // دیتایِ زباله/بسته ⇒ هیچ — جعلِ هشدار و «۱۰۰٪»ِ دوتایی هر دو ممنوع
      if (!oncePerDay(service === "tts" ? NEAR_TTS_KEY : NEAR_EXPLAIN_KEY)) return;
      const pct = Math.min(99, Math.round(raw)); // هشدار هرگز «۱۰۰٪» نمیگوید — آن لحظه مالِ سقفِ بسته است
      toast(
        service === "tts"
          ? {
              title: "🔊 روخوانی به آستانهٔ سقف رسید",
              description: `${faNum(pct)}٪ از سقفِ این ماه مصرف شد — روخوانیِ تازه را برایِ درسِ مهم نگه دار؛ کشِ صدا همچنان کار میکند.`,
              duration: 6000,
            }
          : {
              title: "💡 توضیحِ هوشمند به آستانهٔ سقف رسید",
              description: `${faNum(pct)}٪ از سقفِ این ماه مصرف شد — توضیحِ «چرا غلط شد؟» را برایِ پرسشهایِ مهم نگه دار.`,
              duration: 6000,
            }
      );
    };
    window.addEventListener(BUDGET_NEAR_EVENT, onNear);
    return () => window.removeEventListener(BUDGET_NEAR_EVENT, onNear);
  }, [toast]);
}
