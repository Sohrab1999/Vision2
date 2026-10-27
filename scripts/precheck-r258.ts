// پیش‌سنجهٔ r258 — واقعیت‌های داده برای فیلترِ «حداقل کاربرد» + پرکاربردها
import { lessons } from "../src/data";
import { findWordUsages } from "../src/lib/word-usage";
import { buildLiveWordsQuiz, LIVE_DRILL_CAP } from "../src/lib/live-words-quiz";

const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
const counts = all.map((w) => findWordUsages(w.en).length);

// شمارشِ کارت‌ها در هر آستانه (کارت‌محور — هم‌نام‌ها دو کارت)
for (const t of [5, 10, 20]) {
  const n = counts.filter((c) => c >= t).length;
  console.log(`>=${t}: ${n} cards`);
}

// پرکاربردهای جزوه — ددوپِ هم‌نام، نزولیِ پایدار
const seen = new Set<string>();
const dedup: { en: string; count: number }[] = [];
for (const w of all) {
  const k = w.en.toLowerCase();
  if (seen.has(k)) continue;
  seen.add(k);
  const count = findWordUsages(w.en).length;
  if (count > 0) dedup.push({ en: w.en, count });
}
dedup.sort((a, b) => b.count - a.count);
console.log("top10:", dedup.slice(0, 10).map((u) => `${u.en}:${u.count}`).join(" | "));
console.log("top10 monotonic:", dedup.slice(0, 10).every((u, i) => i === 0 || dedup[i - 1].count >= u.count));

// دریل با minCount — دامنهٔ باریک‌تر
const q10 = buildLiveWordsQuiz(lessons, LIVE_DRILL_CAP, 10);
console.log(
  "drill(min10):",
  q10.map((q) => `${q.options[q.answer]}(${findWordUsages(q.options[q.answer]).length})`).join(" > ")
);
const qDefault = buildLiveWordsQuiz(lessons);
console.log("drill(default) first:", qDefault[0].options[qDefault[0].answer]);

// پیش‌شرط: هر سه آستانه غیرخالی و ۲۰+ هم بیش از یک صفحه نیست؟
console.log("all non-empty:", [5, 10, 20].every((t) => counts.filter((c) => c >= t).length > 0));
