// Validation script for new lessons 10-12 (round 198) — run with: bun scripts/validate-lessons-r198.ts
import lesson10 from "../src/data/lesson10";
import lesson11 from "../src/data/lesson11";
import lesson12 from "../src/data/lesson12";
import type { LessonData } from "../src/lib/study-types";

const lessons: LessonData[] = [lesson10, lesson11, lesson12];
let failed = 0;

for (const l of lessons) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const q of l.quizzes) {
    if (ids.has(q.id)) errors.push(`duplicate quiz id: ${q.id}`);
    ids.add(q.id);
    if (q.answer < 0 || q.answer >= q.options.length) errors.push(`${q.id}: answer out of range`);
    const opts = new Set(q.options);
    if (opts.size !== q.options.length) errors.push(`${q.id}: duplicate options`);
    if (q.options.length !== 4) errors.push(`${q.id}: ${q.options.length} options (want 4)`);
  }
  const enWords = new Set<string>();
  for (const w of l.vocabulary) {
    if (!w.fa || !w.fa.trim()) errors.push(`vocab "${w.en}" has no fa`);
    if (enWords.has(w.en.toLowerCase())) errors.push(`duplicate vocab: ${w.en}`);
    enWords.add(w.en.toLowerCase());
  }
  for (const s of l.synonyms) if (!s.syn || !s.fa) errors.push(`syn ${s.en} incomplete`);
  for (const a of l.antonyms ?? []) if (!a.ant || !a.fa) errors.push(`ant ${a.en} incomplete`);
  for (const w of l.writing) {
    const join = w.answer.join(" ");
    if (!join.trim()) errors.push(`writing ${w.id} empty`);
    if (!w.answer.length) errors.push(`writing ${w.id} no tokens`);
  }
  for (const g of l.grammar) if (!g.html.includes("<")) errors.push(`grammar "${g.title}" html empty`);
  if (l.readings.length !== 2) errors.push(`readings: ${l.readings.length} (want 2)`);
  for (const r of l.readings) {
    if (r.paragraphs.length !== 5) errors.push(`reading "${r.titleEn}": ${r.paragraphs.length} paragraphs (want 5)`);
    for (const p of r.paragraphs) if (!p.en || !p.fa) errors.push(`reading "${r.titleEn}" incomplete paragraph`);
  }
  if (l.conversation.lines.length < 10) errors.push(`conversation too short: ${l.conversation.lines.length}`);
  for (const line of l.conversation.lines) if (!line.en || !line.fa) errors.push(`conversation line incomplete: ${line.speaker}`);

  const cats = l.quizzes.reduce<Record<string, number>>((acc, q) => ((acc[q.category] = (acc[q.category] ?? 0) + 1), acc), {});
  console.log(
    `lesson${l.id} [${l.titleEn} / ${l.grade} / ${l.color}]: ` +
      `vocab=${l.vocabulary.length} quizzes=${l.quizzes.length} (${cats.vocab ?? 0}v/${cats["vocab-konkuri"] ?? 0}k/${cats.grammar ?? 0}g) ` +
      `grammar=${l.grammar.length} writing=${l.writing.length} syn=${l.synonyms.length} ant=${l.antonyms?.length ?? 0} ` +
      `conv=${l.conversation.lines.length}L readings=${l.readings.length}x5`
  );
  if (errors.length) {
    failed++;
    console.error(`  ❌ lesson${l.id}:`, errors);
  } else {
    console.log(`  ✅ clean`);
  }
}

const totalVocab = lessons.reduce((s, l) => s + l.vocabulary.length, 0);
const totalQuiz = lessons.reduce((s, l) => s + l.quizzes.length, 0);
console.log(`\nNEW TOTALS: vocab=${totalVocab} quizzes=${totalQuiz}`);
console.log(`full shelf projection: vocab=${1115 + totalVocab} lessonQuizzes=${370 + totalQuiz} totalQuestions=${370 + totalQuiz + 360}`);
if (failed > 0) process.exit(1);
