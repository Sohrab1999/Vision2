// QA cleanup for job 453171 round @ 2026-10-12 ~17:30 +08:00 — restore the
// global EventDay counters to their pre-QA baseline. QA browser was anonymous
// (localStorage-seeded only) → zero learner/attempt rows created (verified:
// 6 learners / 10 attempts untouched). Only the global counters drifted:
//   app_open 2→3 (fresh browser session), lesson_open 7→8 (smart-review jump),
//   my_words_open 16→18 (2 visits), star_word 8→9 (danger-panel star test),
//   srs_due_review 0→1 (new event fired once in the chip-click test).
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const DAY = "2026-10-12";
const BASELINE = {
  app_open: 2,
  lesson_open: 7,
  my_words_open: 16,
  my_words_review_start: 1,
  quiz_done: 1,
  star_word: 8,
  // srs_due_review is not in baseline → row deleted entirely
};

(async () => {
  const rows = await p.eventDay.findMany({ where: { day: DAY } });
  for (const r of rows) {
    const want = BASELINE[r.name];
    if (want === undefined) {
      await p.eventDay.delete({ where: { id: r.id } });
      console.log(`event ${r.name}=${r.count}: QA-only row → deleted`);
      continue;
    }
    if (r.count !== want) {
      await p.eventDay.update({ where: { id: r.id }, data: { count: want } });
      console.log(`event ${r.name}: ${r.count} -> ${want} (restored)`);
    } else {
      console.log(`event ${r.name}: ${r.count} (already baseline)`);
    }
  }
  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  console.log(`final: learners=${learners} attempts=${attempts}`);
  await p.$disconnect();
})();
