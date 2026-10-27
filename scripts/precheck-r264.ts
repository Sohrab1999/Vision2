// پیش‌سنجهٔ راند ۲۶۴ — سویچِ «جفت‌دار» برایِ مقایسهٔ درس‌ها (بندِ ① پیشنهادِ ۲۶۳)
// سنجه: هر درس چند واژهٔ (۱) تمامِ واژگان و (۲) واژه‌هایِ حاضرِ پیکره
// جفتِ مترادف/متضاد دارند (سیمِ synAntPairsFor — نمایهٔ دوطرفهٔ r203).
import { lessons } from "../src/data";
import { buildSynAntIndex, synAntPairsFor } from "../src/lib/syn-ant-lookup";
import { findWordUsages } from "../src/lib/word-usage";

const index = buildSynAntIndex(lessons);
console.log("index size:", index.size);

// ① مرجعِ تمامِ واژگان — چند واژهٔ هر درس جفت دارند (آمارِ «آماده»یِ پیشنهاد)
const full = lessons.map((l) => {
  let n = 0;
  for (const w of l.vocabulary) if (synAntPairsFor(index, w.en).length > 0) n++;
  return { id: l.id, vocab: l.vocabulary.length, pairs: n, pct: Math.round((n / l.vocabulary.length) * 100) };
});
console.log("① full-vocab pairs:", full.map((p) => `L${p.id} ${p.pairs}/${p.vocab} (${p.pct}%)`).join(" | "));

// ② جمعیتِ طراحی — واژه‌هایِ حاضرِ پیکره (داخلِ لنزِ کاربرددار) + آستانه‌ها
for (const t of [0, 5, 10, 20]) {
  const per = lessons.map((l) => {
    let n = 0;
    for (const w of l.vocabulary) {
      if (findWordUsages(w.en).length < Math.max(1, t)) continue;
      if (synAntPairsFor(index, w.en).length > 0) n++;
    }
    return n;
  });
  const max = Math.max(...per);
  console.log(`② used+threshold ${t}:`, per.map((n, i) => `L${i + 1}=${n}`).join(" "), "max=", max);
}

// ③ نمونه‌هایِ گارد: جفت‌هایِ of و language و ability — صفرِ بی‌جفت
console.log("③ of pairs:", JSON.stringify(synAntPairsFor(index, "of")));
console.log("   lend pairs:", JSON.stringify(synAntPairsFor(index, "lend")));
console.log("   language pairs:", synAntPairsFor(index, "language").length);

// ④ هیچ واژهٔ جفت‌داری شمارشِ پیکرهٔ منفی ندارد؟ (استقلالِ دو سیم)
let both = 0, pairOnly = 0, usedOnly = 0;
for (const l of lessons) {
  for (const w of l.vocabulary) {
    const hasPairs = synAntPairsFor(index, w.en).length > 0;
    const used = findWordUsages(w.en).length > 0;
    if (hasPairs && used) both++;
    else if (hasPairs) pairOnly++;
    else if (used) usedOnly++;
  }
}
console.log("④ independence:", { both, pairOnly, usedOnly });
