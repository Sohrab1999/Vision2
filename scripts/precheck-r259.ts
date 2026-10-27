// پیش‌سنجهٔ r259 — دو فیچر:
// ① سطح هفتم «کاربرد در جزوه»: چیپ‌های واژه‌های زنده در نثر درسنامه (grammar-tab)
// ② رتبهٔ پرکاربردی روی WOTD («رتبهٔ N از M» — همان سیم findWordUsages)
// + پارتیِ تمام‌واژه‌ایِ شاخصِ توکنی با findWordUsages (الگوریتم lib تازه)

import { lessons } from "../src/data";
import { findWordUsages, wordFormRegex } from "../src/lib/word-usage";

// — استریپرِ مستقل (همان که lib/تست خواهند ساخت) —
const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const dedupHits = (text: string, vocab: { en: string }[]): string[] => {
  const hits: string[] = [];
  const seen = new Set<string>();
  for (const w of vocab) {
    const k = w.en.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (wordFormRegex(w.en).test(text)) hits.push(w.en);
  }
  return hits;
};

// — ① گرامر —
console.log("=== ① grammar sections ===");
let totalHitSections = 0;
let maxHits = 0;
let capSections = 0; // >5 چیپ (سقف)
const wordless: string[] = [];
for (const l of lessons) {
  const hitsPerSection = l.grammar.map((s) => dedupHits(stripHtml(s.html), l.vocabulary));
  const hitSections = hitsPerSection.filter((h) => h.length > 0).length;
  totalHitSections += hitSections;
  wordless.push(`${l.id}:${l.grammar.length - hitSections}`);
  for (const h of hitsPerSection) {
    maxHits = Math.max(maxHits, h.length);
    if (h.length > 5) capSections++;
  }
  console.log(
    `درس ${l.id}: ${hitSections}/${l.grammar.length} بخش واژه‌دار | ` +
      hitsPerSection.map((h) => h.length).join(",")
  );
}
console.log(`مجموعِ بخش‌های واژه‌دار: ${totalHitSections} | بی‌واژه per-lesson: ${wordless.join(" ")}`);
console.log(`maxHits=${maxHits} | بخش‌هایِ سقف‌دار (>5): ${capSections}`);

// پیش‌شرطِ قفل دامنه: واژه‌های میان‌درسی در نثر گرامر درس ۱
const l1 = lessons[0];
const l1Words = new Set(l1.vocabulary.map((w) => w.en.toLowerCase()));
const l1Text = l1.grammar.map((s) => stripHtml(s.html));
const crossGram = lessons
  .slice(1)
  .flatMap((l) => l.vocabulary)
  .filter((w) => !l1Words.has(w.en.toLowerCase()) && l1Text.some((t) => wordFormRegex(w.en).test(t)));
console.log(`پیش‌شرطِ قفل دامنه — واژه‌های میان‌درسیِ زنده در گرامر درس ۱: ${crossGram.length}`);
console.log(`  نمونه‌ها: ${crossGram.slice(0, 8).map((w) => w.en).join(", ")}`);

// — ② رتبهٔ پرکاربردی —
console.log("\n=== ② used-rank ===");
const allCards = lessons.flatMap((l) => l.vocabulary);
const totalUsed = allCards.filter((w) => findWordUsages(w.en).length > 0).length;
console.log(`کارت‌های کاربرددار (total): ${totalUsed}`);

// شاخص توکنی — واحد → مجموعه واژه‌های توکنشده
const units: string[] = [];
for (const l of lessons) {
  units.push(l.conversation.introEn);
  for (const ln of l.conversation.lines) units.push(ln.en);
  for (const r of l.readings) for (const p of r.paragraphs) units.push(p.en);
}
console.log(`units: ${units.length}`);
const tokenUnits = new Map<string, Set<number>>();
for (let i = 0; i < units.length; i++) {
  for (const m of units[i].toLowerCase().matchAll(/[a-z]+/g)) {
    let s = tokenUnits.get(m[0]);
    if (!s) tokenUnits.set(m[0], (s = new Set()));
    s.add(i);
  }
}
const toleratedForms = (word: string): string[] => {
  const w = word.trim().toLowerCase();
  if (w.endsWith("e")) { const s = w.slice(0, -1); return [s + "e", s + "es", s + "ed", s + "ing"]; }
  if (w.endsWith("y")) { const s = w.slice(0, -1); return [s + "y", s + "ies", s + "ied", s + "ying"]; }
  return [w, w + "s", w + "es", w + "ed", w + "ing"];
};
const countViaTokens = (en: string): number => {
  const forms = toleratedForms(en);
  const acc = new Set<number>();
  for (const f of forms) {
    const s = tokenUnits.get(f);
    if (s) for (const i of s) acc.add(i);
  }
  return acc.size;
};

// پارتیِ تمام‌واژه‌ای: countViaTokens === findWordUsages().length برای همهٔ کارت‌ها
let mismatches = 0;
const checked = new Set<string>();
for (const w of allCards) {
  const k = w.en.toLowerCase();
  if (checked.has(k)) continue;
  checked.add(k);
  const a = countViaTokens(w.en);
  const b = findWordUsages(w.en).length;
  if (a !== b) {
    mismatches++;
    if (mismatches <= 10) console.log(`MISMATCH ${w.en}: tokens=${a} regex=${b}`);
  }
}
console.log(`پارتیِ توکن↔ریجنکس: ${checked.size} واژهٔ یکتا، ${mismatches} ناهم‌خوان`);

// کارت‌محورِ رتبه: ۱ + تعداد کارت‌هایِ با شمارشِ اکیداً بیشتر
const countOf = (en: string) => findWordUsages(en).length;
const rankOf = (en: string) => {
  const c = countOf(en);
  if (c === 0) return null;
  return 1 + allCards.filter((w) => countOf(w.en) > c).length;
};
console.log(`rank of=${rankOf("of")} (count=${countOf("of")}) | you=${rankOf("you")} | it=${rankOf("it")} | are=${rankOf("are")}`);

// توزیعِ سقفِ امروز — و واژهٔ WOTD امروز
const d = new Date();
const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
const pick = all[seed % all.length];
console.log(`WOTD امروز: ${pick.en} (درس ${pick.lessonId}) count=${countOf(pick.en)} rank=${rankOf(pick.en)}`);
// یک واژهٔ بی‌کاربرد برای شاخهٔ صداقت
const unused = allCards.find((w) => countOf(w.en) === 0);
console.log(`نمونهٔ بی‌کاربرد: ${unused?.en} rank=${unused ? rankOf(unused.en) : "-"}`);
