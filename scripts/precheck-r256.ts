// پیش‌سنجهٔ r256 — واقعیت‌های داده برای: ① چیپ‌های ریدینگ ② مرتب‌سازی لنز
import { lessons } from "../src/data";
import { findWordUsages, wordFormRegex } from "../src/lib/word-usage";
import { buildSynAntIndex } from "../src/lib/syn-ant-lookup";

// ① ریدینگ درس ۱: کدام پاراگراف‌ها واژه دارند؟ سقف ۵ چیپ نقش دارد؟
const l1 = lessons[0];
const lessonWords = new Set(l1.vocabulary.map((w) => w.en.toLowerCase()));
console.log("== lesson 1 readings ==");
for (const r of l1.readings) {
  console.log(`READING: ${r.titleFa} (${r.paragraphs.length} paragraphs)`);
  r.paragraphs.forEach((p, pi) => {
    const hits: string[] = [];
    const seen = new Set<string>();
    for (const w of l1.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      if (wordFormRegex(w.en).test(p.en)) hits.push(w.en);
    }
    console.log(`  P${pi}: hits=${hits.length}${hits.length > 5 ? " (CAP!)" : ""} -> [${hits.join(", ")}]`);
  });
}
// واژه‌های میان‌درسی که در پاراگراف‌های درس ۱ زندگی می‌کنند (پیش‌شرط قفل دامنه)
const cross = lessons
  .slice(1)
  .flatMap((l) => l.vocabulary)
  .filter(
    (w) =>
      !lessonWords.has(w.en.toLowerCase()) &&
      l1.readings.some((r) => r.paragraphs.some((p) => wordFormRegex(w.en).test(p.en)))
  );
console.log("CROSS-lesson words living in lesson-1 paragraphs:", cross.length, cross.slice(0, 6).map((w) => w.en));

// چند پاراگرافِ کل جزوه واژه‌دار است؟ (برای QA زنده)
let withHits = 0, totalParas = 0;
for (const l of lessons)
  for (const r of l.readings)
    for (const p of r.paragraphs) {
      totalParas++;
      const any = l.vocabulary.some((w) => wordFormRegex(w.en).test(p.en));
      if (any) withHits++;
    }
console.log(`booklet paragraphs with hits: ${withHits}/${totalParas}`);

// ② توزیع شمارش کاربرد برای مرتب‌سازی لنز
const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
const counts = all
  .map((w) => ({ en: w.en, lessonId: w.lessonId, n: findWordUsages(w.en).length }))
  .filter((x) => x.n > 0)
  .sort((a, b) => b.n - a.n);
console.log("used cards:", counts.length, "/", all.length);
console.log("top8:", counts.slice(0, 8).map((x) => `${x.en}@L${x.lessonId}:${x.n}`).join(" | "));
console.log("max:", counts[0]?.n, "second:", counts[1]?.n, "ties-at-max:", counts.filter((x) => x.n === counts[0].n).length);

// dict order (original) of top words — برای گارد ثباتِ مرتب‌سازی
const idxTop = counts.slice(0, 5).map((x) => all.findIndex((w) => w.en === x.en && w.lessonId === x.lessonId));
console.log("original-order indexes of top5:", idxTop.join(","));

// پیش‌شرط: چند کارت n=0 در لنز وجود ندارد (لنز فقط n>0) — و پخشِ مقادیر
const dist = new Map<number, number>();
for (const c of counts) dist.set(c.n, (dist.get(c.n) ?? 0) + 1);
console.log("distribution:", [...dist.entries()].sort((a, b) => b[0] - a[0]).map(([n, c]) => `${n}x${c}`).join(" "));

// گاردِ هم‌نامیِ dict برای pairIndex usage (تا مطمئن شویم synAntIndex import بی‌استفاده نماند)
void buildSynAntIndex(lessons);
