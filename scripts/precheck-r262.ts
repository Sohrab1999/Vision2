// پیش‌سنجهٔ راند ۲۶۲ — رتبه روی کارت‌های دیکشنری + مقایسهٔ درس‌ها در لنز
import { lessons } from "../src/data";
import { findWordUsages, usedWordRank } from "../src/lib/word-usage";

// ① رتبهٔ کارت‌محور: چند کارتِ کاربرددار رتبه دارند؟ نمونه‌ها
let usedCards = 0, rankedCards = 0;
for (const l of lessons) {
  for (const w of l.vocabulary) {
    if (findWordUsages(w.en).length > 0) {
      usedCards++;
      if (usedWordRank(w.en)) rankedCards++;
    }
  }
}
console.log("① rank parity:", { usedCards, rankedCards, equal: usedCards === rankedCards });
console.log("   of:", JSON.stringify(usedWordRank("of")));
console.log("   language:", JSON.stringify(usedWordRank("language")));
console.log("   communication:", JSON.stringify(usedWordRank("communication")));

// ② مقایسهٔ درس‌ها: شمارشِ کاربرددارِ هر درس (بدون آستانه و با آستانه‌ها)
for (const t of [0, 5, 10, 20]) {
  const per = lessons.map((l) => {
    let n = 0;
    for (const w of l.vocabulary) {
      if (findWordUsages(w.en).length >= Math.max(1, t)) n++;
    }
    return { id: l.id, title: l.titleFa, vocab: l.vocabulary.length, used: n, pct: Math.round((n / l.vocabulary.length) * 100) };
  });
  const max = Math.max(...per.map((p) => p.used));
  console.log(`② threshold ${t}:`, per.map((p) => `L${p.id} ${p.used}/${p.vocab} (${p.pct}%)`).join(" | "), "max=", max);
}
