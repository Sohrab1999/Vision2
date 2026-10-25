// precount r272 — اندازه‌گیریِ متنِ reasoningِ دو شاخهٔ buildSmartPlan
// [الف] شاخهٔ diagnostic (کاربرِ نو — نتایج خالی): متنِ فعلی تکرارِ جعبهٔ 🌱 است؛
//       متنِ نو باید «دستورِ جلسه + بانک + وعدهٔ سوگیری» را بگوید.
// [ب] شاخهٔ غیر-diagnostic (نتایج ساختگی): نباید دست‌خورده باشد.
// اجرا: bunx tsx scripts/precount-r272.ts  (یا bun scripts/precount-r272.ts)
import { buildSmartPlan } from "../src/lib/smart-practice";
import type { QuizResult } from "../src/lib/study-types";

for (const target of [10, 15, 20]) {
  const diag = buildSmartPlan({ results: {}, mistakes: {}, target });
  console.log(`--- diagnostic target=${target}`);
  console.log("  diagnostic:", diag.diagnostic, "| pool:", diag.pool.length, "| mix:", diag.mix.map((m) => `${m.label}:${m.count}`).join(" · "));
  console.log("  reasoning:", diag.reasoning);
}

// شاخهٔ غیر-diagnostic: یک نتیجهٔ ضعیفِ واژگان + دو خطا
const results: Record<string, QuizResult> = {
  "1:vocab": {
    key: "1:vocab",
    lessonId: 1,
    category: "vocab",
    total: 10,
    correct: 4,
    skipped: 0,
    durationMs: 90000,
    at: Date.now(),
  } as unknown as QuizResult,
};
const nonDiag = buildSmartPlan({ results, mistakes: { "0:q-demo-1": 3, "0:q-demo-2": 1 }, target: 10 });
console.log("--- non-diagnostic target=10");
console.log("  diagnostic:", nonDiag.diagnostic, "| pool:", nonDiag.pool.length, "| mix:", nonDiag.mix.map((m) => `${m.label}:${m.count}`).join(" · "));
console.log("  reasoning:", nonDiag.reasoning);
