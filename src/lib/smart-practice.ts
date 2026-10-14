// ------------------------------------------------------------------
// «تمرین هوشمند» — assembles a personalized quiz session from the
// learner's own weak points:
//   1. the mistake bank (most-missed questions first, ≤ half the session)
//   2. weak quiz skills (avg < 70%): extra vocab/grammar questions,
//      biased toward the lesson of the weakest recorded result
//   3. a diagnostic fill (balanced random pick) when the above are short
//      — also the whole plan for brand-new learners
// Pure client-side module; reads only the bundled 610-question index.
// ------------------------------------------------------------------

import { questionIndex, findQuestion } from "@/lib/explain-source";
import { skillBreakdown, lessonIdOfKey } from "@/lib/skill-stats";
import type { QuizQuestion, QuizResult } from "@/lib/study-types";
import type { MistakeMap } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { TOTAL_QUESTIONS } from "@/data/lesson-meta";
import { shuffle } from "@/lib/domain/shuffle";

export interface SmartMixChip {
  label: string;
  count: number;
  tone: "rose" | "violet" | "emerald" | "sky";
}

export interface SmartPlan {
  pool: QuizQuestion[]; // exactly `target` questions, interleaved
  mix: SmartMixChip[]; // composition chips for the prep screen
  reasoning: string; // one-line Persian explanation of the recipe
  diagnostic: boolean; // true when built without any learner history
}

const WEAK_THRESHOLD = 70;
const QUIZ_SKILLS = ["vocab", "grammar"] as const;

const sourceLesson = (q: QuizQuestion) =>
  q.id.startsWith("l1") ? 1 : q.id.startsWith("l2") ? 2 : q.id.startsWith("l3") ? 3 : 0;

const LESSON_FA = ["", "درس ۱", "درس ۲", "درس ۳"];

export function buildSmartPlan(input: {
  results: Record<string, QuizResult>;
  mistakes: MistakeMap;
  target: number;
}): SmartPlan {
  const idx = questionIndex();
  const picked = new Map<string, { q: QuizQuestion; source: string }>();
  const take = (q: QuizQuestion, source: string) => {
    if (!picked.has(q.id) && picked.size < input.target) picked.set(q.id, { q, source });
  };

  // ---- 1) mistake bank: most-missed first (ties shuffled) ----
  const mistakeEntries = Object.entries(input.mistakes)
    .filter(([, c]) => (c ?? 0) > 0)
    .map(([key, count]) => ({ key: key.slice(key.indexOf(":") + 1), count }))
    .filter((e) => idx.has(e.key))
    .sort((a, b) => b.count - a.count || (Math.random() < 0.5 ? -1 : 1));
  const mistakeQuota = Math.min(mistakeEntries.length, Math.ceil(input.target / 2));
  for (const e of mistakeEntries.slice(0, mistakeQuota)) {
    const q = findQuestion(e.key);
    if (q) take(q, "mistake");
  }

  // ---- 2) weak quiz skills (avg < 70), round-robin, biased to weakest lesson ----
  const stats = skillBreakdown(input.results);
  const weakSkills = stats.filter(
    (s) => s.avg < WEAK_THRESHOLD && (QUIZ_SKILLS as readonly string[]).includes(s.def.id)
  );
  const skillCursor = new Map<string, QuizQuestion[]>();
  for (const s of weakSkills) {
    const cats = s.def.id === "vocab" ? ["vocab", "vocab-konkuri"] : [s.def.id];
    const weakLesson = s.weakest ? lessonIdOfKey(s.weakest.key) : null;
    const candidates = shuffle([...idx.values()].filter((q) => !picked.has(q.id) && cats.includes(q.category)));
    if (weakLesson !== null) {
      candidates.sort((a, b) => {
        const pa = sourceLesson(a) === weakLesson ? 0 : 1;
        const pb = sourceLesson(b) === weakLesson ? 0 : 1;
        return pa - pb;
      });
    }
    skillCursor.set(s.def.id, candidates);
  }
  let guard = 0;
  while (picked.size < input.target && guard < 8) {
    guard++;
    let progressed = false;
    for (const s of weakSkills) {
      const list = skillCursor.get(s.def.id);
      while (list && list.length > 0 && picked.size < input.target) {
        const q = list.shift()!;
        if (!picked.has(q.id)) {
          take(q, `skill:${s.def.id}`);
          progressed = true;
          break;
        }
      }
      if (picked.size >= input.target) break;
    }
    if (!progressed) break;
  }

  // ---- 3) diagnostic fill: balanced random across the whole bank ----
  const remaining = input.target - picked.size;
  if (remaining > 0) {
    const fill = shuffle([...idx.values()].filter((q) => !picked.has(q.id))).slice(0, remaining);
    for (const q of fill) take(q, "diag");
  }

  // ---- composition chips + reasoning ----
  const mix: SmartMixChip[] = [];
  let reasoning = "";
  const diagnostic = Object.keys(input.results).length === 0 && mistakeEntries.length === 0;

  if (mistakeQuota > 0) {
    mix.push({ label: "بانک خطا", count: mistakeQuota, tone: "rose" });
  }
  for (const s of weakSkills) {
    const n = [...picked.values()].filter((p) => p.source === `skill:${s.def.id}`).length;
    if (n > 0) {
      const weakLesson = s.weakest ? lessonIdOfKey(s.weakest.key) : null;
      const focus = weakLesson ? ` (${LESSON_FA[weakLesson]})` : "";
      mix.push({ label: `${s.def.label}${focus}`, count: n, tone: s.def.id === "grammar" ? "violet" : "emerald" });
    }
  }
  const diagCount = [...picked.values()].filter((p) => p.source === "diag").length;
  if (diagCount > 0) {
    mix.push({ label: diagnostic ? "سنجش ترکیبی" : "تثبیت عمومی", count: diagCount, tone: "sky" });
  }

  const parts: string[] = [];
  if (mistakeQuota > 0) parts.push(`${faNum(mistakeQuota)} سؤال از بانک خطا`);
  for (const chip of mix) {
    if (chip.tone === "violet" || chip.tone === "emerald") parts.push(`${faNum(chip.count)} سؤال ${chip.label}`);
  }
  if (diagCount > 0) {
    parts.push(
      diagnostic ? `${faNum(diagCount)} سؤال سنجش از همهٔ درس‌ها` : `${faNum(diagCount)} سؤال تثبیتی از همهٔ درس‌ها`
    );
  }
  reasoning = diagnostic
    ? "تازه شروع کرده‌ای؛ یک جلسهٔ سنجشِ ترکیبی می‌سازم تا نقاط قوت و ضعفت شناخته شود."
    : `دستور این جلسه: ${parts.join(" + ")} — چیده‌شده از بانک ${faNum(TOTAL_QUESTIONS)} سوالیِ کتاب.`;

  return {
    pool: shuffle([...picked.values()]).map((p) => p.q),
    mix,
    reasoning,
    diagnostic,
  };
}
