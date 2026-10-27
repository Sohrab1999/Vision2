// ------------------------------------------------------------------
// پیش‌سنجهٔ r270 — زبانِ جمعیت: ① متنِ اشتراکِ نتیجه «ترکیبِ سطح» را
// می‌گوید (r269-①) ② عنوانِ دریلِ واژه‌های زنده پسوندِ آستانه می‌گیرد
// (ایدئومِ r267) ③ نوارِ دریلِ جفت‌ها جمعیتِ جدولِ دامنه را نام می‌برد
// لنگرها: سطرهایِ SYN/ANT هر درس + کلِ ۳۰۹/۲۱۷/۵۲۶ + tallyِ دریل‌هایِ
// واقعی + شمارشِ دریلِ زندهٔ آستانه‌دار (عنوان باید زنده بماند)
// ------------------------------------------------------------------
import { lessons } from "../src/data";
import { buildLiveWordsQuiz, buildGrammarExampleQuiz } from "../src/lib/live-words-quiz";
import { usedWordRank } from "../src/lib/word-usage";
import { usageTierLabel } from "../src/lib/lens-csv";
import { SYN_QUIZ_CAP } from "../src/lib/syn-ant-quiz";
import type { QuizQuestion } from "../src/lib/study-types";

const faNum = (n: number) => n.toLocaleString("fa-IR");

console.log("=== ① جمعیتِ جدولِ SYN/ANT (نوارِ دریلِ جفت‌ها) ===");
let totalSyn = 0;
let totalAnt = 0;
for (const l of lessons) {
  const syn = l.synonyms?.length ?? 0;
  const ant = l.antonyms?.length ?? 0;
  totalSyn += syn;
  totalAnt += ant;
  console.log(`  درس ${faNum(l.id)}: ${faNum(syn)} مترادف · ${faNum(ant)} متضاد = ${faNum(syn + ant)} ردیف`);
}
console.log(`  کل: ${faNum(totalSyn)} مترادف + ${faNum(totalAnt)} متضاد = ${faNum(totalSyn + totalAnt)} ردیف`);

console.log("\n=== ② tallyِ دریل‌هایِ واقعی (متنِ اشتراک) ===");
const tallyMirror = (words: string[]): string => {
  const counts = new Map<string, number>();
  for (const w of words) {
    const t = usageTierLabel(usedWordRank(w)?.count ?? 0) || "بی‌سطح";
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const segs: string[] = [];
  for (const t of ["پرکاربرد", "میانه", "کم‌کاربرد", "بی‌سطح"]) {
    const n = counts.get(t);
    if (n) segs.push(`${faNum(n)} ${t}`);
  }
  return segs.join(" · ");
};
const liveAll = buildLiveWordsQuiz(lessons);
console.log(`  دریل زندهٔ همه‌درس: ${faNum(liveAll.length)} سؤال → «${tallyMirror(liveAll.map((q) => q.word!))}»`);
const l4g = buildGrammarExampleQuiz(lessons.filter((l) => l.id === 4));
console.log(`  دریل مثال‌های درس ۴: ${faNum(l4g.length)} سؤال → «${tallyMirror(l4g.map((q) => q.word!))}»`);

console.log("\n=== ③ شمارشِ دریلِ زندهٔ آستانه‌دار (پسوندِ عنوان) ===");
for (const min of [0, 5, 10, 20]) {
  const all = buildLiveWordsQuiz(lessons, 8, min);
  const l1 = buildLiveWordsQuiz(lessons.filter((l) => l.id === 1), 8, min);
  console.log(`  آستانهٔ ${faNum(min)}+: همه=${faNum(all.length)} سؤال · درس ۱=${faNum(l1.length)} سؤال`);
}

console.log("\n=== ④ دریلِ جفت‌ها word ندارد؟ (absenceِ صادقانهٔ متنِ اشتراک) ===");
import { buildSynAntQuiz } from "../src/lib/syn-ant-quiz";
const l1Pairs = buildSynAntQuiz(lessons[0]);
const withWord = l1Pairs.filter((q: QuizQuestion) => q.word);
console.log(`  دریلِ جفت‌های درس ۱: ${faNum(l1Pairs.length)} سؤال، wordدار: ${faNum(withWord.length)} → متنِ اشتراکِ بی‌tally`);
console.log(`  (SYN_QUIZ_CAP=${faNum(SYN_QUIZ_CAP)})`);
console.log("\nپیش‌سنجه تمام شد.");
