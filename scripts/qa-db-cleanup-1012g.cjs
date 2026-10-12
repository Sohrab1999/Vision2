// QA cleanup for job 453171 round @ 2026-10-12 ~20:00 +08:00 — Step-9 tranche-3a
// tone consolidation + «دیکتهٔ واژه‌های من» feature browser round. The dictation
// finish auto-registered the anonymous QA visitor (POST /api/register + 1
// my-words-dictation attempt, lesson 0) — both belong to QA, delete.
// Global EventDay counters restored to the pre-QA snapshot (this round):
//   app_open 6, lesson_open 7, my_words_open 24, my_words_review_start 1,
//   quiz_done 1, star_word 8;
// QA-only rows deleted: dictation_done (trackDictation from the QA round —
// no real learner has one) and my_words_dictation_start (the new funnel event,
// fired only by QA this round).
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
  // dictation_done + my_words_dictation_start not in baseline → rows deleted
};

(async () => {
  // 1) find the QA learner: created within this round's window (last 60 min), anonymous
  const cutoff = new Date(Date.now() - 60 * 60_000);
  const qaLearners = await p.learnerProfile.findMany({
    where: { createdAt: { gte: cutoff }, name: "یادگیرنده" }, // anonymous QA default name
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

  // 3) final verification
  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  const events = await p.eventDay.findMany({ where: { day: DAY } });
  console.log("FINAL:", learners, "learners /", attempts, "attempts /", JSON.stringify(events.map(e => `${e.name}=${e.count}`)));
  await p.$disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
