import { lessons } from "../src/data";
import { buildLiveWordsQuiz, buildGrammarExampleQuiz } from "../src/lib/live-words-quiz";
import { usedWordRank } from "../src/lib/word-usage";
import { usageTierLabel } from "../src/lib/lens-csv";
const tier = (en: string) => usageTierLabel(usedWordRank(en)?.count ?? 0) || "بی‌سطح";
const tally = (ws: string[]) => {
  const t: Record<string, number> = {};
  ws.forEach((w) => { const k = tier(w); t[k] = (t[k] ?? 0) + 1; });
  return Object.entries(t).map(([k, v]) => `${k}=${v}`).join(" · ");
};
const L4 = buildGrammarExampleQuiz(lessons.filter((l) => l.id === 4)).map((q) => q.word!);
const L7 = buildGrammarExampleQuiz(lessons.filter((l) => l.id === 7)).map((q) => q.word!);
const all = buildLiveWordsQuiz(lessons).map((q) => q.word!);
const L1 = buildLiveWordsQuiz(lessons.filter((l) => l.id === 1)).map((q) => q.word!);
console.log("L4 words:", L4.join(", "), "|| tally:", tally(L4));
console.log("L7 words:", L7.join(", "), "|| tally:", tally(L7));
console.log("live all words:", all.join(", "), "|| tally:", tally(all));
console.log("live L1 words:", L1.join(", "), "|| tally:", tally(L1));
console.log("of tier:", tier("of"), "| communication:", tier("communication"), "| ability:", tier("ability"));
