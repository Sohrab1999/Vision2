// پارتیِ دو مسیر: توکنی + regexِ خاص  ↔  regexِ کامل روی همهٔ واژه‌ها
import { lessons } from "../src/data";
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";
import { wordFormRegex } from "../src/lib/word-usage";

const unique: string[] = [];
const seen = new Set<string>();
for (const l of lessons) for (const w of l.vocabulary) {
  const k = w.en.toLowerCase();
  if (!seen.has(k)) { seen.add(k); unique.push(w.en); }
}
const special = unique.filter(w => !/^[a-z]+$/.test(w));

function forms(word: string): string[] {
  const w = word.trim().toLowerCase();
  if (w.endsWith("e")) { const s = w.slice(0, -1); return [s+"e", s+"es", s+"ed", s+"ing"]; }
  if (w.endsWith("y")) { const s = w.slice(0, -1); return [s+"y", s+"ies", s+"ied", s+"ying"]; }
  return [w, w+"s", w+"es", w+"ed", w+"ing"];
}
const formIndex = new Map<string, Set<string>>();
for (const w of unique) {
  if (!/^[a-z]+$/.test(w)) continue;
  for (const f of forms(w)) {
    if (!formIndex.has(f)) formIndex.set(f, new Set());
    formIndex.get(f)!.add(w.toLowerCase());
  }
}

let mismatches = 0, checked = 0;
for (const t of BOOKLET_GRAMMAR_TOPICS) {
  (t.examples ?? []).forEach((ex) => {
    checked++;
    // مسیر A — توکنی + خاص
    const tokens = new Set(ex.en.toLowerCase().match(/[a-z]+/g) ?? []);
    const fast = new Set<string>();
    for (const tok of tokens) {
      const ws = formIndex.get(tok);
      if (ws) for (const w of ws) fast.add(w);
    }
    for (const w of special) if (wordFormRegex(w).test(ex.en)) fast.add(w.toLowerCase());
    // مسیر B — regex کامل
    const full = new Set<string>();
    for (const w of unique) if (wordFormRegex(w).test(ex.en)) full.add(w.toLowerCase());
    const a = [...fast].sort().join("|");
    const b = [...full].sort().join("|");
    if (a !== b) {
      mismatches++;
      if (mismatches <= 3) console.log("MISMATCH in", t.id, ":", a.slice(0,120), "≠", b.slice(0,120));
    }
  });
}
console.log(`parity: checked=${checked} mismatches=${mismatches}`);
