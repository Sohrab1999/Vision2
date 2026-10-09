// ------------------------------------------------------------------
// Skill breakdown — aggregate the local quiz results into per-skill
// stats (attempts / best / avg percent). Shared by the home skill
// panel and the report-card dialog.
// ------------------------------------------------------------------

import type { QuizResult } from "@/lib/study-types";

export interface SkillDef {
  id: string;
  label: string;
  icon: string; // lucide icon name, resolved by the consumer
  color: string; // hex accent for bars/chips
  match: (key: string) => boolean;
}

export const SKILL_DEFS: SkillDef[] = [
  { id: "vocab", label: "واژگان", icon: "BookOpenCheck", color: "#059669", match: (k) => k.endsWith(":vocab") || k.endsWith(":vocab-konkuri") },
  { id: "grammar", label: "گرامر", icon: "SpellCheck", color: "#7c3aed", match: (k) => k.endsWith(":grammar") },
  { id: "writing", label: "نگارش", icon: "Pencil", color: "#d97706", match: (k) => k.endsWith(":writing") },
  { id: "dictation", label: "دیکته", icon: "Ear", color: "#db2777", match: (k) => k.endsWith(":dictation") },
  { id: "mixed", label: "تست ترکیبی", icon: "Layers", color: "#0d9488", match: (k) => k.endsWith(":mixed") },
  { id: "mistakes", label: "مرور اشتباهات", icon: "Eraser", color: "#e11d48", match: (k) => k.endsWith(":mistakes") },
  { id: "exam", label: "آزمون جامع", icon: "ClipboardCheck", color: "#4d7c0f", match: (k) => k === "exam" },
  { id: "final", label: "پایان ترم", icon: "GraduationCap", color: "#b45309", match: (k) => k === "final" },
  { id: "rush", label: "چالش برق‌آسا", icon: "Zap", color: "#ea580c", match: (k) => k === "rush" },
];

export interface SkillStat {
  def: SkillDef;
  attempts: number;
  best: number; // best percent across entries
  avg: number; // mean percent
  /** weakest single entry: resultKey + percent (for the targeted-practice CTA) */
  weakest: { key: string; percent: number } | null;
}

/** lesson id (number) of a result key, or null for global keys (exam/final/rush) */
export function lessonIdOfKey(key: string): number | null {
  const head = key.split(":")[0];
  const n = Number(head);
  return Number.isInteger(n) && n >= 1 && n <= 3 ? n : null;
}

export function skillBreakdown(results: Record<string, QuizResult>): SkillStat[] {
  const out: SkillStat[] = [];
  for (const def of SKILL_DEFS) {
    const entries = Object.entries(results).filter(([k]) => def.match(k));
    if (entries.length === 0) continue;
    const pcts = entries.map(([, r]) => r.percent);
    const weakestEntry = entries.reduce((w, e) => (e[1].percent < w[1].percent ? e : w), entries[0]);
    out.push({
      def,
      attempts: entries.length,
      best: Math.max(...pcts),
      avg: Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length),
      weakest: { key: weakestEntry[0], percent: weakestEntry[1].percent },
    });
  }
  // strongest-looking first
  return out.sort((a, b) => b.avg - a.avg);
}

export function barColorFor(percent: number): string {
  return percent >= 70 ? "#059669" : percent >= 50 ? "#d97706" : "#e11d48";
}

export function skillGradeFa(avg: number): { label: string; cls: string } {
  if (avg >= 85) return { label: "عالی", cls: "bg-emerald-100 text-emerald-700" };
  if (avg >= 70) return { label: "خوب", cls: "bg-teal-100 text-teal-700" };
  if (avg >= 50) return { label: "در حال تلاش", cls: "bg-amber-100 text-amber-700" };
  return { label: "نیازمند تمرین", cls: "bg-rose-100 text-rose-600" };
}
