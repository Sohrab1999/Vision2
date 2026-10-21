// پیش‌شمارشِ ترمینالِ r266 — لنگرهایِ داده‌محور برایِ:
// ① پانویسِ پنلِ مقایسه مقیاسِ دوتایی می‌گیرد: «جمعِ ۱۲ درس: ۱۹۱۵ از ۴۰۳۲
//   واژه در جزوه (٪۴۷٫۵) · بی‌کاربردها: ۲۱۱۷ واژه (٪۵۲٫۵)» — مخرج‌هایِ
//   tooltipهایِ r265 حالا با درصدشان در خودِ پنل هم مرئی‌اند.
// ② صداقتِ توزیعِ یکنواخت در tooltipِ شمارندهٔ صدرنشین — وقتی «همهٔ» درس‌هایِ
//   نوار هم‌شمارند (leaderLessons.length === lessonCounts.length)، پسوندِ
//   «توزیعِ یکنواخت — همهٔ درس‌ها هم‌شمارند» افزوده می‌شود (افزودن نه
//   جایگزینی — قفل‌هایِ r264/265 سبز می‌مانند). لنزِ مکالمهٔ change (۵=۱·۹=۱)
//   نمونهٔ زندهٔ یکنواخت است.
// اجرا: bun scripts/precount-r266.ts
import { findWordUsages, lessonsVocabUsageRanking } from "../src/lib/word-usage";
import { lessons } from "../src/data";

// ۱) درصدهایِ پانویس — گردِ مستقل (صداقتِ گردکردنِ r260)
const RANK = lessonsVocabUsageRanking();
const sumUsed = RANK.reduce((n, r) => n + r.usedWords, 0);
const sumTotal = RANK.reduce((n, r) => n + r.totalWords, 0);
const sumUnused = sumTotal - sumUsed;
const pct = (n: number, d: number) => Math.round((n / d) * 1000) / 10;
console.log(`پیکره: ${sumUsed}/${sumTotal} = ٪${pct(sumUsed, sumTotal)} · ${sumUnused}/${sumTotal} = ٪${pct(sumUnused, sumTotal)}`);

// ۲) سرشماریِ یکنواختی — از ۵۴۹ نوارِ باز، چندتا «همهٔ درس‌ها هم‌شمار»اند؟
let barOpen = 0, uniform = 0, partialTie = 0, sole = 0;
let maxTie = 0, maxTieWord = "", maxTieUniform = false;
let partialSample = "", uniformSample = "";
const seen = new Set<string>();
const distOf = (en: string) => {
  const m = new Map<number, number>();
  findWordUsages(en).forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
};
for (const l of lessons) {
  for (const v of l.vocabulary) {
    const en = v.en;
    if (!en || seen.has(en.toLowerCase())) continue;
    seen.add(en.toLowerCase());
    const dist = distOf(en);
    if (dist.length < 2) continue; // نوارِ باز فقط برایِ ≥۲ درس
    barOpen++;
    const counts = dist.map(([, c]) => c);
    const max = Math.max(...counts);
    const nLeaders = counts.filter((c) => c === max).length;
    if (nLeaders === 1) { sole++; continue; }
    if (nLeaders === dist.length) {
      uniform++;
      if (!uniformSample) uniformSample = `${en} (${dist.length} درس × ${max})`;
      if (nLeaders > maxTie) { maxTie = nLeaders; maxTieWord = en; maxTieUniform = true; }
    } else {
      partialTie++;
      if (!partialSample) partialSample = `${en} (${nLeaders} از ${dist.length} درس هم-بیشینه)`;
      if (nLeaders > maxTie) { maxTie = nLeaders; maxTieWord = en; maxTieUniform = false; }
    }
  }
}
console.log(`نوارهایِ باز: ${barOpen} · یگانه=${sole} · یکنواخت=${uniform} · تساویِ جزئی=${partialTie}`);
console.log(`نمونهٔ یکنواخت: ${uniformSample} · نمونهٔ جزئی: ${partialSample}`);
console.log(`بیشینهٔ هم-بیشینه: ${maxTie} درس — ${maxTieWord} (یکنواخت: ${maxTieUniform})`);

// ۳) واژه‌هایِ لنگرِ تست — یکنواختِ بی-لنز + تساویِ جزئیِ بی-لنز + یکنواختِ زیرِ لنز
for (const w of ["change", "communication"]) {
  const dist = distOf(w);
  const max = Math.max(...dist.map(([, c]) => c));
  const nL = dist.filter(([, c]) => c === max).length;
  console.log(`${w}: dist=${dist.map(([l, c]) => `${l}=${c}`).join(" · ")} · leaders=${nL}/${dist.length} ${nL === dist.length ? "یکنواخت" : nL === 1 ? "یگانه" : "جزئی"}`);
  for (const kind of ["conversation", "reading"]) {
    const sites = findWordUsages(w).filter((s) => s.kind === kind);
    if (sites.length === 0) continue;
    const m = new Map<number, number>();
    sites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
    const d = [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    const mx = Math.max(...d.map(([, c]) => c));
    const n = d.filter(([, c]) => c === mx).length;
    console.log(`  · lens=${kind}: ${d.map(([l, c]) => `${l}=${c}`).join(" · ")} · leaders=${n}/${d.length} ${n === d.length ? "یکنواخت" : n === 1 ? "یگانه" : "جزئی"}`);
  }
}
