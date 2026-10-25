// ------------------------------------------------------------------
// تسک ۱۷۴ «نقشهٔ پوشش» — خالص و بی‌UI: جدولِ درس × مهارت از maps استور.
// قرارداد: results فقط «بهترینِ درصد» هر کلید را نگه می‌دارد (results.ts
// slicing) — پس سلول = بهترین٪ + تاریخِ همان بهترین، نه تعدادِ تلاش.
// gap = نخستین ستونِ هرگز-تلاش‌نشده در ترتیبِ کانونیِ COVERAGE_SKILLS؛
// هیچ‌وقت عددِ ساختگی نمی‌سازد — تلاش‌نشده یعنی null و UI‌اش «—» است.
// شنیداریِ «همهٔ درس‌ها» (کلید 0:listening) خودبه‌خود بیرونِ پیشوندِ
// هر درس می‌ماند — قاعدهٔ q: سِر-engine را بازسازی نمی‌کنیم.
// خالص: هیچ Date.now()/Math.random() — ورودی‌ها همان maps استورند.
// ------------------------------------------------------------------

import { knownCountOfLesson, resultKey } from "@/state/progress";

export interface CoverageSkill {
  key: string;
  label: string;
}

/** ستون‌های مهارت به ترتیبِ کانونیِ پیشنهادِ گامِ بعدی */
export const COVERAGE_SKILLS: CoverageSkill[] = [
  { key: "vocab", label: "تست واژگان" },
  { key: "dictation", label: "دیکته" },
  { key: "listening", label: "شنیداری" },
  { key: "writing", label: "نگارش" },
  { key: "vocab-konkuri", label: "واژگانِ کنکوری" },
  { key: "grammar", label: "گرامر" },
];

export interface CoverageCell {
  key: string;
  label: string;
  /** بهترین درصد ثبت‌شده ۰..۱۰۰ — هرگز تلاش‌نشده = null (عددِ ساختگی ممنوع) */
  best: number | null;
  /** تاریخِ ISOِ همان بهترینِ ثبت‌شده */
  at: string | null;
}

export interface CoverageLesson {
  id: number;
  title: string;
  /** رنگِ درس (emerald/amber/rose) — فقط برایِ نقطهٔ شناسه؛ منطق روی آن نیست */
  color: string;
  known: number;
  wordTotal: number;
  wordPct: number;
  cells: CoverageCell[];
  /** نخستین ستونِ تلاش‌نشده در ترتیبِ کانونی — همه‌پوشیده = null */
  gap: CoverageCell | null;
  /** هر شش ستون تلاش شده؟ */
  covered: boolean;
}

export interface CoverageMapResult {
  lessons: CoverageLesson[];
  totalSkills: number;
  attemptedSkills: number;
}

/** درصد سالم‌شده: NaN/بی‌کران → null؛ بیرونِ ۰..۱۰۰ → گیرِ کران */
function sanePct(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function buildCoverageMap(
  results: Record<string, { percent: number; at?: string }>,
  known: Record<string, boolean>,
  lessons: { id: number; title: string; words: number; color?: string }[]
): CoverageMapResult {
  const lessonsOut = lessons.map((L) => {
    const knownN = knownCountOfLesson(known ?? {}, L.id);
    const wordTotal = Number.isFinite(L.words) ? Math.max(0, Math.round(L.words)) : 0;
    const wordPct = wordTotal > 0 ? Math.min(100, Math.round((knownN / wordTotal) * 100)) : 0;
    const cells: CoverageCell[] = COVERAGE_SKILLS.map((sk) => {
      const r = results?.[resultKey(L.id, sk.key)];
      const best = sanePct(r?.percent);
      return {
        key: sk.key,
        label: sk.label,
        best,
        at: best !== null ? (typeof r?.at === "string" ? r.at : null) : null,
      };
    });
    const gap = cells.find((c) => c.best === null) ?? null;
    const attempted = cells.filter((c) => c.best !== null).length;
    return {
      id: L.id,
      title: L.title,
      color: typeof L.color === "string" ? L.color : "",
      known: knownN,
      wordTotal,
      wordPct,
      cells,
      gap,
      covered: attempted === cells.length,
    };
  });
  const totalSkills = lessonsOut.length * COVERAGE_SKILLS.length;
  const attemptedSkills = lessonsOut.reduce(
    (s, l) => s + l.cells.filter((c) => c.best !== null).length,
    0
  );
  return { lessons: lessonsOut, totalSkills, attemptedSkills };
}
