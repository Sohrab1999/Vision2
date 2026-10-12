// QA cleanup for job 453171 round @ 2026-10-12 ~16:00 +08:00 — restore the
// global EventDay counters to their pre-QA baseline (the QA browser session
// fired lesson_open/my_words_open/quiz_done/star_word clicks). No learner or
// attempt rows were created (anonymous visitor skips stats sync — verified).
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const DAY = "2026-10-12";
const BASELINE = {
  lesson_open: 7,
  my_words_open: 16,
  quiz_done: 1,
  star_word: 8,
  app_open: 1,
  my_words_review_start: 1,
};

(async () => {
  const rows = await p.eventDay.findMany({ where: { day: DAY } });
  for (const r of rows) {
    const want = BASELINE[r.name];
    if (want === undefined) {
      console.log(`event ${r.name}=${r.count}: not in baseline — leaving untouched`);
      continue;
    }
    if (r.count !== want) {
      await p.eventDay.update({ where: { id: r.id }, data: { count: want } });
      console.log(`event ${r.name}: ${r.count} -> ${want} (restored)`);
    } else {
      console.log(`event ${r.name}: ${r.count} (already baseline)`);
    }
  }
  // safety net: confirm no QA learner/attempt exists
  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  console.log(`learners=${learners} attempts=${attempts} (baseline 6/10)`);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
