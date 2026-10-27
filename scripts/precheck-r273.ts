/**
 * پیش‌سنجهٔ r273 — قفلِ لنگرهایِ دو فیچرِ راند:
 * ① درِ سومِ خروجی: «خروجی جدول جفت‌ها» در نوارِ دریلِ جفت‌ها — CSVِ
 *    جدولِ SYN/ANT برایِ اکسلِ معلم (dialectِ خانواده: BOM/CRLF/بی‌نقل‌قول).
 *    داده: lesson.synonyms {en, syn, fa} / lesson.antonyms {en, ant, fa}.
 * ② ariaِ دکمه‌هایِ «شروع دریل» هم‌نفسِ نوار (ایدئومِ r272-③): سه سایت —
 *    جفت‌ها، واژه‌هایِ زنده، مثال‌هایِ درسنامه.
 */
import { lessons } from "../src/data";
import { lensScopeTag, lensDomainLabel } from "../src/lib/lens-csv";
import { readFileSync } from "node:fs";

interface Row { en: string; pair: string; kind: "syn" | "ant"; fa: string; lessonId: number }

const rows: Row[] = [];
for (const l of lessons) {
  for (const r of l.synonyms ?? []) rows.push({ en: r.en, pair: r.syn, kind: "syn", fa: r.fa, lessonId: l.id });
  for (const r of l.antonyms ?? []) rows.push({ en: r.en, pair: r.ant, kind: "ant", fa: r.fa, lessonId: l.id });
}

console.log("=== ① جمعیتِ جدولِ جفت‌ها ===");
const syn = rows.filter((r) => r.kind === "syn").length;
const ant = rows.length - syn;
console.log(`کل = ${rows.length} (${syn} مترادف · ${ant} متضاد) — لنگرِ r270: ۴۷۷ (۲۹۸·۱۷۹)`);
for (const l of lessons) {
  const s = (l.synonyms ?? []).length, a = (l.antonyms ?? []).length;
  if ([1, 3, 7, 10].includes(l.id)) console.log(`L${l.id}: ${s + a} ردیف (${s} مترادف · ${a} متضاد)`);
}
const minLesson = [...lessons].map((l) => ({ id: l.id, n: (l.synonyms?.length ?? 0) + (l.antonyms?.length ?? 0) })).sort((a, b) => a.n - b.n)[0];
console.log(`کمینهٔ درس: L${minLesson.id} = ${minLesson.n} (دکمه هرگز در عمل نمی‌میرد؟)`);

console.log("\n=== ② قراردادِ dialect — ویرگول/نقل‌قول/خطِ جدید ===");
const bad = rows.filter((r) => [r.en, r.pair, r.fa].some((v) => /["\n,]/.test(v)));
console.log(`مقدارهایِ حاویِ ویرگول/نقل‌قول/خطِ جدید = ${bad.length}`);
if (bad.length) console.log(bad.slice(0, 6).map((r) => `${r.en}|${r.pair}|${r.fa}`).join(" ⏎ "));
const emptyFa = rows.filter((r) => !r.fa.trim()).length;
console.log(`faِ تهی = ${emptyFa}`);
const emptyEn = rows.filter((r) => !r.en.trim() || !r.pair.trim()).length;
console.log(`en/pairِ تهی = ${emptyEn}`);

console.log("\n=== ③ تکرار و تنوع ===");
const enCounts = new Map<string, number>();
for (const r of rows) enCounts.set(r.en.toLowerCase(), (enCounts.get(r.en.toLowerCase()) ?? 0) + 1);
const dup = [...enCounts.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(`واژه‌هایِ چند-ردیفی (چند جفت): ${dup.map(([k, n]) => `${k}×${n}`).join("، ")}`);
const pairSet = new Set(rows.map((r) => `${r.en}→${r.pair.toLowerCase()}`));
console.log(`یکتاییِ en→pair = ${pairSet.size} از ${rows.length} (دوقلو = ${rows.length - pairSet.size})`);

console.log("\n=== ④ تگِ دامنه — reuseِ سیمِ لنز با آستانهٔ ۰ ===");
for (const lf of [null, 1, 3, 12] as (number | null)[]) {
  console.log(`lf=${lf}: tag="${lensScopeTag(lf, 0)}" label="${lensDomainLabel(lf, 0)}"`);
}

console.log("\n=== ⑤ ariaِ کنونیِ سه دکمهٔ «شروع دریل» ===");
const dictSrc = readFileSync("src/components/study/lesson/dictionary-view.tsx", "utf8");
const gramSrc = readFileSync("src/components/study/lesson/booklet-grammar-view.tsx", "utf8");
for (const [name, src] of [["دیکشنری", dictSrc], ["درسنامه", gramSrc]] as const) {
  const ms = src.match(/aria-label="شروع[^"]*"/g) ?? [];
  console.log(`${name}: ${ms.join(" | ") || "—یافت نشد—"}`);
}
