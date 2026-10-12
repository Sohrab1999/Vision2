/* Round 70 DB cleanup — restore EventDay drift from smoke+QA page loads.
 * Baseline (end of r69 worklog): app_open=2, lesson_open=9 on 2026-10-12 UTC.
 * This round only loaded pages (no openLesson/quiz/words gameplay): the smoke
 * onboarding CTA added lesson_open +1; browser sessions added app_open.
 * Real data rows (my_words_open 16, my_words_review_start 1, quiz_done 1,
 * star_word 8) untouched. Learners/attempts untouched.
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const BASELINE = { app_open: 2, lesson_open: 9 };
const DAY = "2026-10-12";

(async () => {
  for (const [name, target] of Object.entries(BASELINE)) {
    const row = await p.eventDay.findUnique({ where: { day_name: { day: DAY, name } } });
    if (!row) { console.log(`KEEP ${name}: row missing (nothing to restore)`); continue; }
    if (row.count <= target) { console.log(`KEEP ${name}: ${row.count} <= ${target}`); continue; }
    await p.eventDay.update({ where: { id: row.id }, data: { count: target } });
    console.log(`RESTORE ${name}: ${row.count} -> ${target}`);
  }
  const after = await p.eventDay.findMany({ where: { day: DAY }, orderBy: { name: "asc" } });
  for (const r of after) console.log(`FINAL ${r.name}=${r.count}`);
  await p.$disconnect();
  console.log("CLEAN_OK");
})().catch(e => { console.error(e); process.exit(1); });
