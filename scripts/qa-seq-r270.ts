// دنبالهٔ دریلِ زندهٔ ۱۰+ برای QA — سؤال/گزینه‌ها/پاسخ
import { buildLiveWordsQuiz } from "../src/lib/live-words-quiz";
import { lessons } from "../src/data";
const qs = buildLiveWordsQuiz(lessons, 8, 10);
for (const q of qs) {
  console.log(JSON.stringify({ q: q.question, answer: q.options[q.answer], word: q.word }));
}
