// پیش‌بررسیِ داده برای پیمانِ r255 — پیش‌شرط‌ها را قبل از vitest چک می‌کند
import { lessons } from "../src/data";
import { findWordUsages, wordFormRegex } from "../src/lib/word-usage";

// WOTD pick of today
const all = lessons.flatMap((l) => l.vocabulary.map((w) => ({ ...w, lessonId: l.id })));
const d = new Date();
const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
const pick = all[seed % all.length];
console.log("WOTD today:", pick.en, "| usage sites:", findWordUsages(pick.en).length);

const lesson = lessons[0];
const lessonWords = new Set(lesson.vocabulary.map((w) => w.en.toLowerCase()));

const hitsFor = (line: { en: string }) => {
  const hits: string[] = [];
  const seen = new Set<string>();
  for (const w of lesson.vocabulary) {
    const k = w.en.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (wordFormRegex(w.en).test(line.en)) hits.push(w.en);
  }
  return hits;
};

const expected = lesson.conversation.lines.map(hitsFor);
const firstHit = expected.findIndex((h) => h.length > 0);
console.log("lesson1 lines:", lesson.conversation.lines.length, "| first hit line idx:", firstHit, "| hits:", expected[firstHit]);

// a line-word with >=2 usages
let multi: string | null = null;
for (const h of expected.flat()) {
  if (findWordUsages(h).length >= 2) { multi = h; break; }
}
console.log("line-word with >=2 usages:", multi, multi ? findWordUsages(multi).length : "-");

// cross-lesson words living in lesson1 lines but not in lesson1 vocab
const cross = lessons.slice(1).flatMap((l) => l.vocabulary)
  .filter((w) => !lessonWords.has(w.en.toLowerCase())
    && lesson.conversation.lines.some((ln) => wordFormRegex(w.en).test(ln.en)));
console.log("cross-lesson words in lesson1 lines:", cross.length, "e.g.", cross.slice(0, 6).map((w) => w.en));

// hit distribution
const hitLines = expected.filter((h) => h.length > 0).length;
const maxHits = Math.max(...expected.map((h) => h.length));
console.log("hit lines:", hitLines, "| max hits per line:", maxHits);

// testid collision check: lesson1 testids × cross testids
const tid = (s: string) => `line-usage-chip-${s.replace(/\s+/g, "-")}`;
const lessonTids = new Set([...lessonWords].map((w) => tid(w)));
const crossTids = cross.map((w) => tid(w.en));
const collide = crossTids.filter((t) => lessonTids.has(t));
console.log("testid collisions:", collide.length, collide.slice(0, 4));
