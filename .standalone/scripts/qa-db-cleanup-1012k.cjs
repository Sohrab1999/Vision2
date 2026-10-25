// QA cleanup for job 453171 round @ 2026-10-12 ~22:00 +08:00 — two-level
// word-key resolver (task 62). One QA dictation round auto-registered an
// anonymous learner (+1 danger-dictation attempt, lesson 0) — all QA, delete.
// Baseline = pristine end of task 61: 6 learners / 10 attempts.
// EventDay restored to: app_open 2, lesson_open 7, my_words_open 16,
// my_words_review_start 1, quiz_done 1, star_word 8;
// QA-only rows deleted: danger_dictation_start, dictation_done.
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
};
const QA_ONLY = ["danger_dictation_start", "dictation_done"];

(async () => {
  const cutoff = new Date(Date.now() - 120 * 60_000);
  const qaLearners = await p.learnerProfile.findMany({
    where: { createdAt: { gte: cutoff }, name: "یادگیرنده" },
    select: { userId: true, createdAt: true },
  });
  for (const l of qaLearners) {
    const attempts = await p.quizAttempt.deleteMany({ where: { userId: l.userId } });
    const syncs = await p.learnerSync.deleteMany({ where: { userId: l.userId } });
    await p.learnerProfile.delete({ where: { userId: l.userId } });
    console.log(`learner ${l.userId} deleted (+${attempts.count} attempts, +${syncs.count} sync rows)`);
  }
  if (qaLearners.length === 0) console.log("no QA learner found in window");

  for (const name of QA_ONLY) {
    const del = await p.eventDay.deleteMany({ where: { day: DAY, name } });
    if (del.count) console.log(`QA-only event row deleted: ${name} x${del.count}`);
  }

  const rows = await p.eventDay.findMany({ where: { day: DAY } });
  for (const r of rows) {
    const want = BASELINE[r.name];
    if (want === undefined) {
      await p.eventDay.delete({ where: { id: r.id } });
      console.log(`unknown event row deleted: ${r.name}=${r.count}`);
    } else if (r.count !== want) {
      await p.eventDay.update({ where: { id: r.id }, data: { count: want } });
      console.log(`event ${r.name}: ${r.count} -> ${want}`);
    }
  }

  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  console.log(`FINAL: ${learners} learners / ${attempts} attempts`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
