// ------------------------------------------------------------------
// اهداف روزانه (Daily Quests) — five small, auto-tracked missions that
// reset every day. Progress is derived from the store's DayStat which
// is incremented by real user actions (reviews, quizzes, new words,
// dictation rounds, rush rounds). Pure functions only.
// ------------------------------------------------------------------

import type { DayStat, LessonTab } from "./study-store";
import { emptyDayStat, todayStr } from "./study-store";

export interface QuestDef {
  id: string;
  title: string;
  hint: string;
  target: number;
  icon: string; // lucide icon name resolved in the component
  /** tailwind classes for the icon square + progress bar */
  accent: string;
  bar: string;
  value: (d: DayStat) => number;
  /** where this quest's CTA jumps to */
  jump:
    | { kind: "smart-review" }
    | { kind: "exam" }
    | { kind: "flashcards" }
    | { kind: "dictation" }
    | { kind: "rush" };
}

export const QUESTS: QuestDef[] = [
  {
    id: "review",
    title: "مرور فلش‌کارت",
    hint: "۱۰ بار واژه‌ها را مرور کن",
    target: 10,
    icon: "RefreshCcw",
    accent: "bg-amber-100 text-amber-700",
    bar: "from-amber-400 to-amber-600",
    value: (d) => d.reviews,
    jump: { kind: "smart-review" },
  },
  {
    id: "words",
    title: "واژهٔ تازه",
    hint: "۵ واژهٔ جدید یاد بگیر",
    target: 5,
    icon: "BookA",
    accent: "bg-violet-100 text-violet-700",
    bar: "from-violet-400 to-violet-600",
    value: (d) => d.words,
    jump: { kind: "flashcards" },
  },
  {
    id: "quiz",
    title: "آزمون و تمرین",
    hint: "۳ آزمون یا تمرین کامل کن",
    target: 3,
    icon: "ListChecks",
    accent: "bg-emerald-100 text-emerald-700",
    bar: "from-emerald-400 to-emerald-600",
    value: (d) => d.quizzes,
    jump: { kind: "exam" },
  },
  {
    id: "dictation",
    title: "دیکتهٔ شنیداری",
    hint: "یک دور دیکته کامل کن",
    target: 1,
    icon: "Ear",
    accent: "bg-teal-100 text-teal-700",
    bar: "from-teal-400 to-teal-600",
    value: (d) => d.dictation,
    jump: { kind: "dictation" },
  },
  {
    id: "rush",
    title: "چالش برق‌آسا",
    hint: "یک دور ۶۰ ثانیه‌ای بازی کن",
    target: 1,
    icon: "Zap",
    accent: "bg-orange-100 text-orange-700",
    bar: "from-orange-400 to-orange-600",
    value: (d) => d.rush,
    jump: { kind: "rush" },
  },
];

/** how many quests are complete for the given day stat */
export function completedQuestCount(d: DayStat | undefined): number {
  const stat = d ?? emptyDayStat("");
  return QUESTS.reduce((n, q) => n + (q.value(stat) >= q.target ? 1 : 0), 0);
}

/** quests with per-quest progress (0..1+) for rendering */
export function questProgress(
  d: DayStat | undefined,
  today = todayStr()
): { def: QuestDef; value: number; done: boolean; pct: number }[] {
  const stat = d?.day === today ? d : emptyDayStat(today);
  return QUESTS.map((def) => {
    const value = def.value(stat);
    const done = value >= def.target;
    return { def, value, done, pct: Math.min(100, Math.round((value / def.target) * 100)) };
  });
}

/** label of the tab a flashcard jump lands on (kept here to avoid importing components) */
export const FLASHCARD_TAB: LessonTab = "vocab";
