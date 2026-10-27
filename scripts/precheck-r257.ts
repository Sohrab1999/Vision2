// پیش‌سنجهٔ r257 — واقعیت‌های داده برای دریلِ واژه‌های زنده (کلوز)
import { lessons } from "../src/data";
import type { LessonData } from "../src/lib/study-types";
import { findWordUsages, wordFormRegex, highlightParts } from "../src/lib/word-usage";

const BLANK = "____";

function usedCandidates(scope: LessonData[]) {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of scope)
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const count = findWordUsages(w.en).length;
      if (count > 0) out.push({ en: w.en, count });
    }
  return out.sort((a, b) => b.count - a.count); // پایدار
}

function build(scope: LessonData[], cap = 8) {
  const cands = usedCandidates(scope);
  const pool = cands.map((c) => c.en);
  const qs: { en: string; cloze: string; blanks: number; siteKind: string }[] = [];
  const skipped: { en: string; reason: string }[] = [];
  for (const c of cands) {
    if (qs.length >= cap) break;
    const site = findWordUsages(c.en)[0];
    const parts = highlightParts(site.en, c.en);
    const blanks = parts.filter((p) => p.hit).length;
    if (blanks === 0) {
      skipped.push({ en: c.en, reason: "no-blank" });
      continue;
    }
    const dists = pool.filter(
      (d) => d.toLowerCase() !== c.en.toLowerCase() && !wordFormRegex(d).test(site.en)
    );
    if (dists.length < 3) {
      skipped.push({ en: c.en, reason: `few-distractors(${dists.length})` });
      continue;
    }
    qs.push({
      en: c.en,
      cloze: parts.map((p) => (p.hit ? BLANK : p.text)).join(""),
      blanks,
      siteKind: site.kind,
    });
  }
  return { qs, skipped, totalCands: cands.length };
}

for (const [label, scope] of [
  ["BOOKLET", lessons],
  ["LESSON-1", lessons.filter((l) => l.id === 1)],
  ["LESSON-10", lessons.filter((l) => l.id === 10)],
] as [string, LessonData[]][]) {
  const { qs, skipped, totalCands } = build(scope);
  console.log(`== ${label}: cands=${totalCands} questions=${qs.length} skipped=${skipped.length}`);
  console.log("   order:", qs.map((q) => `${q.en}(${findWordUsages(q.en).length})`).slice(0, 8).join(" > "));
  console.log("   q1 cloze:", JSON.stringify(qs[0]?.cloze.slice(0, 110)));
  console.log("   skipped:", skipped.map((s) => `${s.en}:${s.reason}`).join(", ") || "none");
  console.log(
    "   kinds:",
    JSON.stringify(qs.reduce<Record<string, number>>((m, q) => ((m[q.siteKind] = (m[q.siteKind] ?? 0) + 1), m), {}))
  );
}
