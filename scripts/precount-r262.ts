// پیش‌شمارشِ ترمینالِ r262 — لنگرهایِ داده‌محور برایِ:
// ① badgeِ کهرباییِ «بیرونی‌ترینِ نسبت» — قرینهٔ کهرباییِ «بیشترینِ نسبت»:
//   درسی با بیشترین «نسبتِ» واژهٔ بیرون-از-متن از واژگانِ خودش (یگانگی سنجیده
//   شود) — ماتریسِ ۲×۲ قهرمان‌ها کامل شود: {شمارش، نسبت} × {در-متن، بیرون}.
// ② نوارِ پراکندگیِ درس‌ها در دیالوگِ کاربردِ مشترک — واژه‌هایی با ≥۲ درس؛
//   لنگرِ تست: change (۱۳ کاربرد) و breakdownِ درس‌هایش + صدرنشین.
// اجرا: bun scripts/precount-r262.ts
import { lessonsVocabUsageRanking, findWordUsages } from "../src/lib/word-usage";

// ① نسبتِ بیرون-از-متنِ هر درس
const RANK = lessonsVocabUsageRanking();
const rows = RANK.map((r) => ({
  id: r.lessonId,
  unusedRatio: (r.totalWords - r.usedWords) / r.totalWords,
  unused: r.totalWords - r.usedWords,
  total: r.totalWords,
}));
const maxUnusedRatio = Math.max(...rows.map((r) => r.unusedRatio));
const champs = rows.filter((r) => r.unusedRatio === maxUnusedRatio);
console.log("نسبتِ بیرون-از-متنِ هر ۱۲ درس:");
console.log(rows.map((r) => `درس${r.id}: ٪${(r.unusedRatio * 100).toFixed(1)}`).join(" · "));
console.log(`→ قهرمانِ «بیرونی‌ترینِ نسبت»: ${(maxUnusedRatio * 100).toFixed(1)}٪ · یگانگی=${champs.length} → درسِ ${champs.map((c) => c.id).join("،")}`);
const r4 = rows.find((r) => r.id === 4)!;
console.log(`لنگرِ درسِ ۴: ${r4.unused}/${r4.total} = ٪${(r4.unusedRatio * 100).toFixed(1)} (گردِ فارسیِ نمایش: ٪${Math.round(r4.unusedRatio * 100)})`);
// ماتریسِ کاملِ قهرمان‌ها برایِ گزارش
const maxUsed = Math.max(...RANK.map((r) => r.usedWords));
const maxRatio = Math.max(...RANK.map((r) => r.usedWords / r.totalWords));
const maxUnusedCount = Math.max(...RANK.map((r) => r.totalWords - r.usedWords));
console.log(`ماتریسِ ۲×۲: شمارشِ در-متن → درسِ ${RANK.filter((r) => r.usedWords === maxUsed).map((r) => r.lessonId)} · نسبتِ در-متن → درسِ ${RANK.filter((r) => r.usedWords / r.totalWords === maxRatio).map((r) => r.lessonId)} · شمارشِ بیرون → درسِ ${RANK.filter((r) => r.totalWords - r.usedWords === maxUnusedCount).map((r) => r.lessonId)} · نسبتِ بیرون → درسِ ${champs.map((c) => c.id)}`);

// ② پراکندگیِ درس‌ها برایِ واژه‌هایِ چند-درسه
for (const w of ["change", "ability", "communication"]) {
  const sites = findWordUsages(w);
  const byLesson = new Map<number, number>();
  for (const s of sites) byLesson.set(s.lessonId, (byLesson.get(s.lessonId) ?? 0) + 1);
  const parts = [...byLesson.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const maxC = Math.max(...parts.map(([, c]) => c));
  console.log(`${w}: ${sites.length} کاربرد · ${parts.length} درس → ${parts.map(([l, c]) => `درس${l}=${c}`).join(" · ")} · صدرنشین=${parts.filter(([, c]) => c === maxC).map(([l]) => l)}`);
}
