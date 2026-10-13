// ------------------------------------------------------------------
// Task 124 «داوریِ معلمِ هفته در کارنامهٔ رسمی» — UI-free client for
// the week-verdict endpoint. The WeekTeacher panel (119) owns its own
// fetch state; the A4 official report is a second surface that needs
// the SAME verdict through the SAME contract without duplicating the
// parsing rules — so the request now lives here once, UI-free, and
// both surfaces can read it.
//
// Honesty rules carried over from 119/121:
//   • never throws — any failure (network, non-ok, malformed body,
//     missing fields) lands on `null` and the caller decides the
//     honest fallback (the report composes the offline review from
//     the REAL counts and labels it «حالت آفلاین»)
//   • source defaults to "ai" only when the server actually said
//     nothing — the server's own "fallback" verdict is preserved so
//     the provenance chip never lies
//   • cached defaults to false — a fresh generation must never be
//     shown as «آماده»
// UI-free: only the WeekTeacherStats shape and the TeacherReview
// type — no store, no React, no DOM.
// ------------------------------------------------------------------

import type { TeacherReview } from "@/lib/exam-teacher";
import type { WeekTeacherStats } from "@/lib/week-teacher";

export interface WeekVerdictResult {
  review: TeacherReview;
  source: "ai" | "fallback";
  cached: boolean;
}

type VerdictBody = TeacherReview & { source?: "ai" | "fallback"; cached?: boolean };

/** the three verdict fields, all non-empty — one language, one gate */
function isTeacherReview(x: unknown): x is VerdictBody {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.intro === "string" &&
    r.intro.length > 0 &&
    typeof r.strength === "string" &&
    r.strength.length > 0 &&
    typeof r.advice === "string" &&
    r.advice.length > 0
  );
}

/**
 * Ask /api/week-review for the current week's verdict. Resolves
 * `null` on every failure mode — the caller composes the honest
 * offline review instead. Never throws.
 */
export async function requestWeekVerdict(
  stats: WeekTeacherStats,
  doFetch: typeof fetch = fetch
): Promise<WeekVerdictResult | null> {
  try {
    const res = await doFetch("/api/week-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    });
    const data = (await res.json().catch(() => null)) as
      | (Partial<TeacherReview> & { source?: "ai" | "fallback"; cached?: boolean })
      | null;
    if (!res.ok || !isTeacherReview(data)) return null;
    return {
      review: { intro: data.intro, strength: data.strength, advice: data.advice },
      source: data.source === "fallback" ? "fallback" : "ai",
      cached: data.cached === true,
    };
  } catch {
    return null;
  }
}
