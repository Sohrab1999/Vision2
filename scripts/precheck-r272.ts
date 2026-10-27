/**
 * پیش‌سنجهٔ r272 — قفلِ لنگرهایِ دو فیچرِ راند:
 * ① استخرِ «از N نامزد» دریل واژه‌های زنده (بندِ ② پیشنهادِ r271):
 *    liveWordsCandidates(scope, minCount) — سیمِ واحدی که قرار است هم
 *    سازندهٔ سؤال و هم شمارندهٔ نوار از آن بخوانند (ایدئومِ r265).
 * ② زیرنویسِ جمعیت در سرِ هر دو دیالوگِ دریلِ دیکشنری: «N سؤال از M…» —
 *    شمارشِ واقعیِ ساخته‌شده در برابرِ وعدهٔ «تا ۸» نوار.
 * ③ aria/titleِ دکمه‌هایِ خروجی هم‌نفسِ توست (بندِ ③ پیشنهادِ r271):
 *    لنگرهایِ shown و lensDomainLabel برایِ سه دامنه.
 */
import { lessons } from "../src/data";
import { findWordUsages, usedWordRank } from "../src/lib/word-usage";
import { buildLiveWordsQuiz, LIVE_DRILL_CAP } from "../src/lib/live-words-quiz";
import { buildPairsDrillQuiz, SYN_QUIZ_CAP } from "../src/lib/syn-ant-quiz";
import { lensDomainLabel, lensScopeTag } from "../src/lib/lens-csv";

// آینهٔ liveWordsCandidates — قبل از استخراج، جمعیت را از سیمِ حاضر می‌سازیم
function mirrorCandidates(scope: typeof lessons, minCount: number): { en: string; count: number }[] {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const count = findWordUsages(w.en).length;
      if (count >= Math.max(1, minCount)) out.push({ en: w.en, count });
    }
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

console.log("=== ① استخرِ دریل واژه‌های زنده (دامنه × آستانه) ===");
const allPool = mirrorCandidates(lessons, 0);
console.log(`همه × ۰ = ${allPool.length}`);
for (const t of [5, 10, 20]) {
  console.log(`همه × ${t}+ = ${mirrorCandidates(lessons, t).length}`);
}
for (const l of lessons) {
  const p0 = mirrorCandidates([l], 0).length;
  const row = [5, 10, 20].map((t) => `${t}+:${mirrorCandidates([l], t).length}`).join(" ");
  console.log(`L${l.id}: pool=${p0} | ${row}`);
}
// جمعِ تک-درس‌ها در برابرِ ددوپِ سراسری (درسِ r268 — غیر-جمع‌پذیری)
const sumPerLesson = lessons.reduce((n, l) => n + mirrorCandidates([l], 10).length, 0);
console.log(`غیر-جمع‌پذیریِ ۱۰+: جمعِ درس‌ها=${sumPerLesson} در برابرِ همه=${mirrorCandidates(lessons, 10).length}`);
const dupWitness = new Map<string, number>();
for (const l of lessons) {
  for (const c of mirrorCandidates([l], 10)) dupWitness.set(c.en.toLowerCase(), (dupWitness.get(c.en.toLowerCase()) ?? 0) + 1);
}
const cross = [...dupWitness.entries()].filter(([, n]) => n > 1).slice(0, 6);
console.log(`شاهدِ هم‌نامِ بین‌درسی (۱۰+): ${cross.map(([k, n]) => `${k}×${n}`).join("، ")}`);

console.log("\n=== ② سؤالِ واقعیِ ساخته‌شده (زیرنویسِ دیالوگ) ===");
const liveAll = buildLiveWordsQuiz(lessons, LIVE_DRILL_CAP, 0);
console.log(`دریل زنده همه×۰: ${liveAll.length} سؤال از ${allPool.length} نامزد (cap=${LIVE_DRILL_CAP})`);
const liveL1x10 = buildLiveWordsQuiz([lessons[0]], LIVE_DRILL_CAP, 10);
console.log(`دریل زنده L1×۱۰+: ${liveL1x10.length} سؤال از ${mirrorCandidates([lessons[0]], 10).length} نامزد`);
for (const w of liveL1x10.slice(0, 5)) console.log(`  lw: ${w.word} (rank=${usedWordRank(w.word!)?.rank ?? "-"})`);
const pairsAll = buildPairsDrillQuiz(lessons, SYN_QUIZ_CAP);
let rows = 0, syn = 0, ant = 0;
for (const l of lessons) {
  syn += l.synonyms?.length ?? 0;
  ant += l.antonyms?.length ?? 0;
}
rows = syn + ant;
console.log(`دریل جفت‌ها همه: ${pairsAll.length} سؤال از ${rows} ردیف (${syn} مترادف · ${ant} متضاد)`);
const pairsL1 = buildPairsDrillQuiz([lessons[0]], SYN_QUIZ_CAP);
const l1syn = lessons[0].synonyms?.length ?? 0, l1ant = lessons[0].antonyms?.length ?? 0;
console.log(`دریل جفت‌ها L1: ${pairsL1.length} سؤال از ${l1syn + l1ant} ردیف (${l1syn} مترادف · ${l1ant} متضاد)`);
// دامنهٔ تهیِ واقعیِ زنده — برایِ توستِ صفرِ صادقانه
for (const l of lessons) {
  const p20 = mirrorCandidates([l], 20).length;
  if (p20 === 0) console.log(`صفرِ واقعی: L${l.id} × ۲۰+ = ۰ نامزد (توستِ صادقانه)`);
}

console.log("\n=== ③ لنگرهایِ ariaِ خروجی (shown × domain) ===");
// shown در لنزِ used = کارت‌هایِ دیدنی — تقریب: همهٔ ردیف‌هایِ آستانه‌گذشته (کارت‌محور)
const allRows = lessons.flatMap((l) => l.vocabulary);
const shown0 = allRows.filter((w) => findWordUsages(w.en).length > 0).length;
const shown10 = allRows.filter((w) => findWordUsages(w.en).length >= 10).length;
const l3Rows = lessons[2].vocabulary;
const shownL3x10 = l3Rows.filter((w) => findWordUsages(w.en).length >= 10).length;
console.log(`shown: پیش‌فرض=${shown0} | ۱۰+=${shown10} | L3×۱۰+=${shownL3x10}`);
for (const [lf, mu] of [[null, 0], [null, 10], [3, 10], [1, 0]] as [number | null, number][]) {
  console.log(`domain(${lf},${mu}) -> "${lensDomainLabel(lf, mu)}" | tag="${lensScopeTag(lf, mu)}"`);
}
