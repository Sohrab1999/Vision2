// ------------------------------------------------------------------
// پیش‌سنجهٔ r274 — لنگرهایِ درِ چهارمِ خروجی: جدولِ مثال‌هایِ درسنامه
// (بندِ ③ پیشنهادِ r273 — «جدول · N» برایِ درسنامه، همان لهجهٔ r273)
// اجرا: bunx tsx scripts/precheck-r274.ts  (یا bun run)
// ------------------------------------------------------------------
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";

const rows = BOOKLET_GRAMMAR_TOPICS.flatMap((t) =>
  (t.examples ?? []).map((ex) => ({
    topicId: t.id,
    topic: t.title,
    source: t.source,
    page: t.page,
    en: ex.en,
    fa: ex.fa,
    tag: ex.tag ?? "",
  }))
);

console.log("=== جمعیت ===");
console.log("topics total:", BOOKLET_GRAMMAR_TOPICS.length);
console.log("topics WITH examples:", BOOKLET_GRAMMAR_TOPICS.filter((t) => (t.examples?.length ?? 0) > 0).length);
console.log("topics WITHOUT examples (honest zero):", BOOKLET_GRAMMAR_TOPICS.filter((t) => !t.examples || t.examples.length === 0).map((t) => t.id).join(", ") || "(none)");
console.log("example rows total:", rows.length);

console.log("\n=== per-source ===");
for (const src of ["دهم", "یازدهم", "دوازدهم"] as const) {
  const n = rows.filter((r) => r.source === src).length;
  const topics = new Set(rows.filter((r) => r.source === src).map((r) => r.topicId)).size;
  console.log(`${src}: ${n} مثال در ${topics} موضوع`);
}

console.log("\n=== per-source anchors (largest) ===");
const byTopic = new Map<string, number>();
for (const r of rows) byTopic.set(r.topicId, (byTopic.get(r.topicId) ?? 0) + 1);
const sorted = [...byTopic.entries()].sort((a, b) => b[1] - a[1]);
console.log("largest topics:", sorted.slice(0, 5).map(([id, n]) => `${id}=${n}`).join(", "));
console.log("smallest topics:", sorted.slice(-3).map(([id, n]) => `${id}=${n}`).join(", "));

console.log("\n=== tag coverage ===");
const withTag = rows.filter((r) => r.tag).length;
console.log(`with tag: ${withTag} / ${rows.length} — بدونِ برچسب: ${rows.length - withTag} (صداقتِ تهی)`);

console.log("\n=== dialect audit (comma/quote/newline per field) ===");
let bad = 0;
const fields = ["en", "fa", "tag", "topic", "source", "page"] as const;
for (const f of fields) {
  const hits = rows.filter((r) => /[,«»"'\n\r]/.test(r[f]));
  console.log(`${f}: ${hits.length} موردِ ناساز` + (hits.length ? " ← مثال: " + JSON.stringify(hits[0][f]).slice(0, 90) : ""));
  bad += hits.length;
}

console.log("\n=== duplicate sentences ===");
const seen = new Map<string, number>();
for (const r of rows) seen.set(r.en, (seen.get(r.en) ?? 0) + 1);
const dups = [...seen.entries()].filter(([, n]) => n > 1);
console.log(dups.length ? dups.map(([s, n]) => `"${s.slice(0, 40)}"×${n}`).join(" · ") : "(none — هر جمله یکتا)");

console.log("\n=== BG_TOPIC_TO_LESSON coverage ===");
const linked = BOOKLET_GRAMMAR_TOPICS.filter((t) => t.examples?.length && (t.id in ({} as Record<string, number>)));
console.log("(فقط برایِ اطلاع — خروجی دامنه‌ثابت است، فیلترِ درسِ مثال‌ها معنا ندارد چون نوارِ دریل واژه-محور است)");

console.log("\n=== جمع‌بندی ===");
console.log(bad === 0 ? "dialekt پاک — بی‌نقل‌قولِ خانواده می‌ایستد" : `⚠ ${bad} فیلدِ ناساز — dialect باید نقل‌قولِ RFC4180 بگیرد`);
console.log("لنگرِ پیشنهادیِ جمعیت:", rows.length);
