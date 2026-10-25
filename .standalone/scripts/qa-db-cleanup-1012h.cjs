// QA cleanup for job 453171 round @ 2026-10-12 ~20:05 +08:00 — «دیکتهٔ واژه‌های
// خطرناک» feature + dark rose-700 ink + QuizAttempt @@index. Each of the 3 QA
// dictation rounds auto-registered an anonymous learner (+1 danger-dictation
// attempt, lesson 0) — all QA, delete.
// Baseline = pristine end of task 57 (and 58): 6 learners / 10 attempts.
// EventDay restored to:
//   app_open 2, lesson_open 7, my_words_open 16, my_words_review_start 1,
//   quiz_done 1, star_word 8;
// QA-only rows deleted: dictation_done (3), danger_dictation_start (3 — new
// funnel event, fired only by QA so far).
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
  // dictation_done + danger_dictation_start not in baseline → rows deleted
};

(async () => {
  // 1) QA learners: created this round (last 90 min), anonymous default name
  const cutoff = new Date(Date.now() - 90 * 60_000);
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

  // 2) restore global event counters
  const rows = await p.eventDay.findMany({ where: { day: DAY } });
  for (const r of rows) {
    const want = BASELINE[r.name];
    if (want === undefined) {
      await p.eventDay.delete({ where: { id: r.id } });
      console.log(`event ${r.name}=${r.count}: QA-only row → deleted`);
      continue;
    }
    if (r.count > want) {
      await p.eventDay.update({ where: { id: r.id }, data: { count: want } });
      console.log(`event ${r.name}: ${r.count} → ${want}`);
    }
  }

  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  const events = await p.eventDay.findMany({ where: { day: DAY } });
  console.log("FINAL:", JSON.stringify({ learners, attempts, events: events.map((e) => `${e.name}=${e.count}`) }));
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
