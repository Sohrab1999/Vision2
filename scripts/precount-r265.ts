// پیش‌شمارشِ ترمینالِ r265 — لنگرهایِ داده‌محور برایِ:
// ③ شمارندهٔ «N از M» پیکره‌ای در tooltipِ سطرهایِ پنلِ مقایسهٔ ۱۲ درس —
//   هر سطر گذشته از ٪ها و رتبه، مقیاسِ مطلقِ پیکره را هم می‌گوید:
//   «۴۹۰ از ۱۹۱۵ کاربردِ در-متنِ پیکره · ۴۹۸ از ۲۱۱۷ بی‌کاربردِ پیکره».
//   مخرجِ پیکره = جمعِ همهٔ درس‌ها (sumUsed / sumUnused) — نه اندازهٔ خودِ درس
//   (آن «N از M» سطرِ مرئیِ موجود است).
// ① شمارِ هم-بیشینه‌ها در tooltipِ شمارندهٔ صدرنشینِ دیالوگِ کاربرد —
//   «اینجا ۲ درسِ هم-بیشینه‌اند» یا «اینجا صدرنشین یگانه است» — از
//   leaderLessonsِ همان لنز (لنزِ نوع شامل می‌شود).
// اجرا: bun scripts/precount-r265.ts
import { findWordUsages, lessonsVocabUsageRanking } from "../src/lib/word-usage";
import { lessons } from "../src/data";

// ۱) جمع‌هایِ پیکره — مخرج‌هایِ «N از M» جدید
const RANK = lessonsVocabUsageRanking();
const sumUsed = RANK.reduce((n, r) => n + r.usedWords, 0);
const sumTotal = RANK.reduce((n, r) => n + r.totalWords, 0);
const sumUnused = sumTotal - sumUsed;
console.log(`پیکره: sumUsed=${sumUsed} · sumUnused=${sumUnused} · sumTotal=${sumTotal} · rows=${RANK.length}`);

// ۲) سطرهایِ ۱۲گانه — «N از M» هر درس با مخرجِ پیکره‌ای
let rowCheck = true;
for (const r of RANK) {
  const unused = r.totalWords - r.usedWords;
  const ok = r.usedWords <= sumUsed && unused <= sumUnused && r.usedWords + unused === r.totalWords;
  if (!ok) rowCheck = false;
  console.log(
    `درسِ ${r.lessonId}: ${r.usedWords} از ${sumUsed} در-متن · ${unused} از ${sumUnused} بی‌کاربرد · (سطرِ مرئی: ${r.usedWords} از ${r.totalWords}) ${ok ? "OK" : "!!"}`
  );
}
console.log(`سطرها: ${rowCheck ? "ALL OK" : "FAIL"}`);

// ۳) لنگرهایِ سختِ موردِ انتظارِ تست‌ها
const l10 = RANK.find((r) => r.lessonId === 10)!;
const l7 = RANK.find((r) => r.lessonId === 7)!;
console.log(
  `\nلنگر: درسِ ۱۰ = ${l10.usedWords} از ${sumUsed} + ${l10.totalWords - l10.usedWords} از ${sumUnused} (انتظار: ۴۹۰/۱۹۱۵ + ۴۹۸/۲۱۱۷) · درسِ ۷ = ${l7.usedWords} از ${sumUsed} + ${l7.totalWords - l7.usedWords} از ${sumUnused} (انتظار: ۷۳/۱۹۱۵ + ۳۲/۲۱۱۷)`
);

// ۴) شمارِ هم-بیشینه‌هایِ دیالوگ برایِ واژه‌هایِ لنگر — بی-لنز و زیرِ هر دو لنز
function lensOf(sites: ReturnType<typeof findWordUsages>, kind?: string) {
  const vis = kind ? sites.filter((s) => s.kind === kind) : sites;
  const m = new Map<number, number>();
  vis.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const max = sorted[0]?.[1] ?? 0;
  const leaders = sorted.filter(([, c]) => c === max).map(([l]) => l);
  return { total: vis.length, max, leaders };
}
for (const w of ["change", "communication", "ability"]) {
  const sites = findWordUsages(w);
  const all = lensOf(sites);
  console.log(
    `${w}: total=${all.total} · leaders=[${all.leaders}] (${all.leaders.length === 1 ? "یگانه" : `${all.leaders.length} هم-بیشینه`})`
  );
  for (const kind of ["conversation", "reading"]) {
    const lk = lensOf(sites, kind);
    if (lk.total === 0) continue;
    console.log(
      `  · lens=${kind}: total=${lk.total} · leaders=[${lk.leaders}] (${lk.leaders.length === 1 ? "یگانه" : `${lk.leaders.length} هم-بیشینه`})`
    );
  }
}

// ۵) سرشماریِ جمله‌بندیِ یگانه/هم-بیشینه در کلِ پیکره — چند نوارِ بازِ بی-لنز
//    صدرنشینِ یگانه دارند و چندتا مساوی؟ (لنگرِ آماریِ tooltipِ نو)
let barOpen = 0, sole = 0, tied = 0, maxTie = 0, tieSample = "";
const seen = new Set<string>();
for (const l of lessons) {
  for (const v of l.vocabulary) {
    const en = v.en;
    if (!en || seen.has(en.toLowerCase())) continue;
    seen.add(en.toLowerCase());
    const m = new Map<number, number>();
    findWordUsages(en).forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
    if (m.size < 2) continue; // نوارِ بی-لنز فقط برایِ ≥۲ درس
    barOpen++;
    const counts = [...m.values()];
    const max = Math.max(...counts);
    const nLeaders = counts.filter((c) => c === max).length;
    if (nLeaders === 1) sole++;
    else {
      tied++;
      maxTie = Math.max(maxTie, nLeaders);
      if (!tieSample) tieSample = `${en} (${nLeaders})`;
    }
  }
}
console.log(
  `\nنوارِ بازِ بی-لنز: ${barOpen} واژه · یگانه=${sole} · مساوی=${tied} · بیشینهٔ هم-بیشینه=${maxTie} (${tieSample})`
);
