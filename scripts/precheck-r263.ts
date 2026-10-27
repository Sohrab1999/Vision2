// پیش‌سنجهٔ راند ۲۶۳ — سطح هشتم (چیپ روی مثال‌های TopicCard) + رتبه در دو سطح باقی
import { lessons } from "../src/data";
import { BOOKLET_GRAMMAR_TOPICS } from "../src/data/booklet-grammar";
import { findWordUsages, usedWordRank } from "../src/lib/word-usage";
import { synAntPairsFor } from "../src/lib/syn-ant-lookup";
import { buildSynAntIndex } from "../src/lib/syn-ant-lookup";

// واژه‌های یکتای کل جزوه (ترتیبِ درس‌ها)
const unique: string[] = [];
const seen = new Set<string>();
for (const l of lessons) for (const w of l.vocabulary) {
  const k = w.en.toLowerCase();
  if (!seen.has(k)) { seen.add(k); unique.push(w.en); }
}
console.log("① unique vocab:", unique.length);

// تشخیص: توکن‌محور برای تک‌واژه + regex برای خاص (آینهٔ r259)
const alphaSet = new Set(unique.filter(w => /^[a-z]+$/.test(w)));
const special = unique.filter(w => !/^[a-z]+$/.test(w));
console.log("   alpha:", alphaSet.size, "| special:", special.length);

function forms(word: string): string[] {
  const w = word.trim().toLowerCase();
  if (w.endsWith("e")) { const s = w.slice(0, -1); return [s+"e", s+"es", s+"ed", s+"ing"]; }
  if (w.endsWith("y")) { const s = w.slice(0, -1); return [s+"y", s+"ies", s+"ied", s+"ying"]; }
  return [w, w+"s", w+"es", w+"ed", w+"ing"];
}
const formIndex = new Map<string, Set<string>>();
for (const w of alphaSet) for (const f of forms(w)) {
  if (!formIndex.has(f)) formIndex.set(f, new Set());
  formIndex.get(f)!.add(w.toLowerCase());
}

let wordlessExamples = 0, totalExamples = 0, maxChips = 0, overCap = 0, zeroSiteChips = 0, totalChips = 0;
const perTopic: Record<string, number> = {};
for (const t of BOOKLET_GRAMMAR_TOPICS) {
  let topicChips = 0;
  for (const ex of t.examples ?? []) {
    totalExamples++;
    const tokens = new Set(ex.en.toLowerCase().match(/[a-z]+/g) ?? []);
    const hits = new Set<string>();
    for (const tok of tokens) {
      const ws = formIndex.get(tok);
      if (ws) for (const w of ws) hits.add(w);
    }
    for (const w of special) {
      const re = w.trim().toLowerCase().endsWith("e")
        ? new RegExp(`\\b${w.slice(0,-1).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?:e|es|ed|ing)\\b`, "i")
        : w.trim().toLowerCase().endsWith("y")
          ? new RegExp(`\\b${w.slice(0,-1).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?:y|ies|ied|ying)\\b`, "i")
          : new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?:s|es|ed|ing)?\\b`, "i");
      if (re.test(ex.en)) hits.add(w.toLowerCase());
    }
    if (hits.size === 0) wordlessExamples++;
    else {
      if (hits.size > 5) overCap++;
      maxChips = Math.max(maxChips, hits.size);
      totalChips += hits.size;
      topicChips += hits.size;
      for (const h of hits) if (findWordUsages(h).length === 0) zeroSiteChips++;
    }
  }
  perTopic[t.id] = topicChips;
}
console.log("② examples:", totalExamples, "| wordless:", wordlessExamples, "| overCap(>5):", overCap, "| maxChips:", maxChips, "| zeroSiteChips:", zeroSiteChips, "| totalChips:", totalChips);
console.log("   sample perTopic:", Object.entries(perTopic).slice(0, 6));

// رتبه در دو سطح: هر واژهٔ کاربرددار رتبه دارد (پارتیِ r262) — پیمان در vocab-tab/flashcards همان است
console.log("③ rank parity spotcheck: of=", JSON.stringify(usedWordRank("of")));

// ④ دادهٔ سویچ جفت‌دار (برای پیشنهاد r264 — الان فقط سنجه)
const pairIndex = buildSynAntIndex(lessons);
for (const l of lessons.slice(0, 4)) {
  let n = 0;
  for (const w of l.vocabulary) if (synAntPairsFor(pairIndex, w.en).length > 0) n++;
  console.log(`   L${l.id} pair-bearing: ${n}/${l.vocabulary.length}`);
}
