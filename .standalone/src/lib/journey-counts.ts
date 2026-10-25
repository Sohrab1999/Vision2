"use client";

// ------------------------------------------------------------------
// r356 — «شمارندههای نبض روی سفرِ کشف» — پیشنهادِ ④ِ r351 (چهار راند
// باز): چیپِ «کشف شد» از یک پرچمِ دودویی به شمارندهٔ زندهٔ مصرفِ واقعی
// میرسد. داده از همان GET /api/event میآید که نبض میخواند — بدونِ هیچ
// تغییری در API (قراردادِ یخزدهٔ F10 از قبل total و week میدهد) و
// بدونِ هیچ سطحِ ناواقعیِ تازه.
//
// صادقیت — سه قانون:
//   • واکشِ شکستخورده ⇒ همهٔ چیپها خطِ ثابتِ r349 را نشان میدهند —
//     شمارندهٔ جعلی ممنوع (دیدبانی، نه درستکاری — قاعدهٔ نبض/بودجه)
//   • کشفشده اما صفرِ دفتر (دستگاهِ دیگر / پیش از F10 / divergenceِ
//     محلی-سرور) ⇒ خطِ ثابت — عدد از هیچ جعل نمیشود
//   • چیپِ کشفنشده شمارنده ندارد — کارِ او پرش است، نه آمار
//
// نگاشتِ دنیا→رویدادها تکحقیقت است و تایپش علیهِ EventName بسته:
// اگر رجیستری رویدادی را نامگذاری یا حذف کند، همین‌جا کامپایل میشکند
// (درسِ r355: رانشِ بدونِ کامپایل ناممکن است). هر رویداد فقط یک خانه
// دارد — شمارندهٔ مشترکِ دو چیپ، آمار را دوبرابرِ دروغ میکند.
// منطقِ انتخابِ هر خانه: «پایانِ یک دورِ واقعی از همان سطح» — startهای
// دیگرِ دیکته/برق‌آسا از سطوحِ دیگرِ خودشان میآیند و به این کارت تعلق
// ندارند؛ نبرد با duel_done شمرده میشود (start+done یک مسابقه را
// دوبرابر میشمرد).
// ------------------------------------------------------------------

import { useEffect, useState } from "react";
import type { EventName } from "@/lib/analytics-events";

export const JOURNEY_WORLD_EVENTS = {
  flashcards: ["flashcard_done"],
  quiz: ["quiz_done"],
  listening: ["listen_done"],
  dictation: ["dictation_done"],
  rush: ["rush_done"],
  duel: ["duel_done"],
  mywords: ["my_words_review_start", "my_words_flashcards_start", "my_words_dictation_start"],
  library: ["library_story_done"],
  konkur: ["konkur_start"],
} as const satisfies Record<string, readonly EventName[]>;

export type JourneyWorldKey = keyof typeof JOURNEY_WORLD_EVENTS;

/** جمعِ صادقِ شمارندهها — کلیدِ غایب/زباله ⇒ صفر؛ منفی/NaN/∞ هرگز وارد جمع نمیشوند */
export function sumJourneyEvents(
  counts: Record<string, number> | undefined,
  names: readonly EventName[]
): number {
  if (!counts) return 0;
  let sum = 0;
  for (const n of names) {
    const v = counts[n];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) sum += v;
  }
  return sum;
}

export type JourneyCounterKind = "active" | "dormant" | "plain";

export interface JourneyCounter {
  kind: JourneyCounterKind;
  week: number;
  total: number;
}

/**
 * حالتِ خطِ شمارنده — هرگز جعل نمیکند:
 *   هفتهٔ زنده ⇒ active («N بار این هفته»)
 *   هفتهٔ خالی اما سابقه ⇒ dormant («N بار تا امروز — برگرد و تمرین کن»)
 *   هیچکدام (دینامیکِ محلی-سرور واگرده) ⇒ plain — خطِ ثابتِ r349
 */
export function journeyCounterState(week: number, total: number): JourneyCounter {
  const w = typeof week === "number" && Number.isFinite(week) && week > 0 ? week : 0;
  const t = typeof total === "number" && Number.isFinite(total) && total > 0 ? total : 0;
  if (w > 0) return { kind: "active", week: w, total: t };
  if (t > 0) return { kind: "dormant", week: 0, total: t };
  return { kind: "plain", week: 0, total: 0 };
}

export interface JourneyCountsSnapshot {
  state: "idle" | "ready" | "error";
  week: Record<string, number>;
  total: Record<string, number>;
}

/**
 * قلابِ شمارندههای سفرِ کشف — همزادِ use-watchtower (r351): یک GET
 * کوچک (/api/event — قراردادِ پیشفرضِ F10، بدونِ ?days) در سوارشدن.
 * state «loading» مصرفی ندارد (نقطه دوتایی است) — فقط نتیجه، قاعدهٔ
 * set-state-in-effect. خطا ⇒ نقشههای خالی با state error — چیپها
 * خودشان به خطِ ثابت برمیگردند (هیچ سطحِ دیگری دستنخورده میماند).
 */
export function useJourneyCounts(): JourneyCountsSnapshot {
  const [snap, setSnap] = useState<JourneyCountsSnapshot>({ state: "idle", week: {}, total: {} });

  useEffect(() => {
    let alive = true;
    fetch("/api/event", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("journey-counts http " + res.status);
        const data = (await res.json()) as {
          events?: { name?: unknown; total?: unknown; week?: unknown }[];
        };
        if (!alive) return;
        const week: Record<string, number> = {};
        const total: Record<string, number> = {};
        for (const e of Array.isArray(data.events) ? data.events : []) {
          if (!e || typeof e.name !== "string" || e.name.length === 0) continue;
          week[e.name] =
            typeof e.week === "number" && Number.isFinite(e.week) && e.week > 0 ? e.week : 0;
          total[e.name] =
            typeof e.total === "number" && Number.isFinite(e.total) && e.total > 0 ? e.total : 0;
        }
        setSnap({ state: "ready", week, total });
      })
      .catch(() => {
        if (!alive) return;
        // خطا = نقشههای خالی — «سلامتِ جعلی» و «شمارندهٔ جعلی» هر دو دروغند
        setSnap((s) => ({ ...s, state: "error" }));
      });
    return () => {
      alive = false;
    };
  }, []);

  return snap;
}
