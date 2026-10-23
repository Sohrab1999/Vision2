// ------------------------------------------------------------------
// «خروجی Anki» — export the full 3-lesson vocabulary as an
// Anki-importable TSV file (front = English, back = Persian).
// Modern Anki (≥ 2.1.55) reads the leading `#` directives and imports
// the rest as Basic notes into the `Vision2` deck.
// ------------------------------------------------------------------

import { lessons } from "@/data";
import type { VocabWord } from "./study-types";

function sanitizeField(s: string): string {
  return s.replace(/[\t\r\n]+/g, " ").trim();
}

/** build the TSV content — duplicate English words across lessons are kept once */
export function buildAnkiTsv(words?: (VocabWord & { lessonId?: number })[]): { tsv: string; count: number } {
  const rows: string[] = [];
  const seen = new Set<string>();
  const source = words ?? lessons.flatMap((l) => l.vocabulary);
  for (const w of source) {
    const en = sanitizeField(w.en);
    const fa = sanitizeField(w.fa);
    const key = en.toLowerCase();
    if (!en || !fa || seen.has(key)) continue;
    seen.add(key);
    rows.push(`${en}\t${fa}`);
  }
  const header = "#separator:tab\n#html:false\n#deck:Vision2\n";
  return { tsv: header + rows.join("\n") + "\n", count: rows.length };
}

/** generate + download the file in the browser; returns the card count —
 *  or null when the blob/download pipeline fails (r344 two-legged honesty:
 *  the last unguarded member of the download family now reports failure
 *  instead of leaving the click silent). */
export function downloadAnkiTsv(): number | null {
  try {
    const { tsv, count } = buildAnkiTsv();
    const blob = new Blob([tsv], { type: "text/tab-separated-values;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vision2-anki.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return count;
  } catch {
    return null;
  }
}
