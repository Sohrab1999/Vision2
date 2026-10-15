// ------------------------------------------------------------------
// Skill breakdown — aggregate the local quiz results into per-skill
// stats (attempts / best / avg percent). Shared by the home skill
// panel and the report-card dialog.
// ------------------------------------------------------------------

import type { QuizResult } from "@/lib/study-types";
import { LESSONS_META } from "@/data/lesson-meta";
import type { LessonTab, View } from "@/state/types";
import { uiColors } from "./ui-colors";

export interface SkillDef {
  id: string;
  label: string;
  icon: string; // lucide icon name, resolved by the consumer
  color: string; // hex accent for bars/chips
  match: (key: string) => boolean;
}

export const SKILL_DEFS: SkillDef[] = [
  { id: "vocab", label: "واژگان", icon: "BookOpenCheck", color: uiColors.emerald[600], match: (k) => k.endsWith(":vocab") || k.endsWith(":vocab-konkuri") },
  { id: "grammar", label: "گرامر", icon: "SpellCheck", color: uiColors.violet[600], match: (k) => k.endsWith(":grammar") },
  { id: "writing", label: "نگارش", icon: "Pencil", color: uiColors.amber[600], match: (k) => k.endsWith(":writing") },
  { id: "dictation", label: "دیکته", icon: "Ear", color: uiColors.pink[600], match: (k) => k.endsWith(":dictation") },
  { id: "listening", label: "شنیداری", icon: "Headphones", color: uiColors.cyan[600], match: (k) => k.endsWith(":listening") },
  { id: "mixed", label: "تست ترکیبی", icon: "Layers", color: uiColors.teal[600], match: (k) => k.endsWith(":mixed") },
  { id: "mistakes", label: "مرور اشتباهات", icon: "Eraser", color: uiColors.rose[600], match: (k) => k.endsWith(":mistakes") },
  { id: "synant", label: "مترادف و متضاد", icon: "ArrowLeftRight", color: uiColors.sky[600], match: (k) => k.endsWith(":synant") },
  { id: "exam", label: "آزمون جامع", icon: "ClipboardCheck", color: uiColors.lime[700], match: (k) => k === "exam" },
  { id: "final", label: "پایان ترم", icon: "GraduationCap", color: uiColors.amber[700], match: (k) => k === "final" || k.startsWith("final-") },
  { id: "rush", label: "چالش برق‌آسا", icon: "Zap", color: uiColors.orange[600], match: (k) => k === "rush" },
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
  return Number.isInteger(n) && n >= 1 && n <= LESSONS_META.length ? n : null;
}

// ---------------------------------------------------------------
// Round 204 — targeted-practice CTA routing. The home skill
// panel's weakest-skill CTA used to dump every lesson-bound skill
// on the tests tab; now each skill lands where it is actually
// practiced (vocab → flashcards, grammar → the grammar lesson,
// synant → the tables/drill tab, mistakes → the review session).
// Pure so tests can pin the whole map.
// ---------------------------------------------------------------

/** where the targeted-practice CTA of a skill should land */
export type SkillPracticeTarget =
  | { kind: "view"; view: View }
  | { kind: "lesson"; lessonId: number; tab: LessonTab };

/** lesson tab each lesson-bound skill practices in; null → generic tests tab */
const PRACTICE_TAB: Record<string, LessonTab | null> = {
  vocab: "vocab",
  grammar: "grammar",
  writing: "writing",
  dictation: "dictation",
  synant: "synant",
  mixed: "tests",
};

export function skillPracticeTarget(s: SkillStat): SkillPracticeTarget {
  switch (s.def.id) {
    case "rush":
      return { kind: "view", view: { type: "rush" } };
    case "exam":
    case "final":
      return { kind: "view", view: { type: "exam" } };
    case "listening":
      return { kind: "view", view: { type: "listen" } };
    case "mistakes":
      // the mistake-bank review session is cross-lesson by design —
      // the weakest result key carries no actionable lesson
      return { kind: "view", view: { type: "review" } };
    default: {
      // lesson-bound: the weakest result's lesson decides WHERE, the
      // skill decides WHICH tab; an unparsable key (global dictation
      // buckets like exam-gN:dictation, or a missing weakest entry)
      // falls back to lesson 1 of the same tab — never a wrong-skill tab
      const lessonId = s.weakest ? lessonIdOfKey(s.weakest.key) : null;
      const tab = PRACTICE_TAB[s.def.id] ?? "tests";
      return { kind: "lesson", lessonId: lessonId ?? 1, tab };
    }
  }
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
  return percent >= 70 ? uiColors.emerald[600] : percent >= 50 ? uiColors.amber[600] : uiColors.rose[600];
}

export function skillGradeFa(avg: number): { label: string; cls: string } {
  if (avg >= 85) return { label: "عالی", cls: "bg-emerald-100 text-emerald-700" };
  if (avg >= 70) return { label: "خوب", cls: "bg-teal-100 text-teal-700" };
  if (avg >= 50) return { label: "در حال تلاش", cls: "bg-amber-100 text-amber-700" };
  return { label: "نیازمند تمرین", cls: "bg-rose-100 text-rose-600" };
}
