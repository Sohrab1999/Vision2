/* Round 74 DB cleanup — restore EventDay to r73's declared end-state baseline.
 * Baseline (end of r73 worklog): app_open=2, lesson_open=9 on 2026-10-12,
 * NO srs_due_pill row (its first generation ever was r73 QA, not a learner —
 * r73 already deleted it once; it reappeared, so it predates r74 QA drift).
 * r74 QA only loaded pages + setView + setDailyGoal (localStorage-only):
 * app_open drifted 2→4. lesson_open=10 and srs_due_pill=1 are residue.
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
    if (!row) { console.log(`KEEP ${name}: row missing`); continue; }
    if (row.count <= target) { console.log(`KEEP ${name}: ${row.count} <= ${target}`); continue; }
    await p.eventDay.update({ where: { id: row.id }, data: { count: target } });
    console.log(`RESTORE ${name}: ${row.count} -> ${target}`);
  }
  const pill = await p.eventDay.findUnique({ where: { day_name: { day: DAY, name: "srs_due_pill" } } });
  if (pill) {
    await p.eventDay.delete({ where: { id: pill.id } });
    console.log(`DELETE srs_due_pill: was ${pill.count} (QA-only event)`);
  } else {
    console.log("KEEP srs_due_pill: row absent");
  }
  const after = await p.eventDay.findMany({ where: { day: DAY }, orderBy: { name: "asc" } });
  for (const r of after) console.log(`FINAL ${r.name}=${r.count}`);
  await p.$disconnect();
  console.log("CLEAN_OK");
})().catch(e => { console.error(e); process.exit(1); });
