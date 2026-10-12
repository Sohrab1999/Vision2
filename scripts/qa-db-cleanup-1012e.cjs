// QA cleanup for job 453171 round @ 2026-10-12 ~18:00 +08:00 — Step-8 store-slices
// browser round. The dictation finish auto-registered the anonymous QA visitor
// (POST /api/register 201 + 1 dictation attempt) — both belong to QA, delete.
// Global EventDay counters restored to the pre-QA snapshot (1012e):
//   app_open 2, lesson_open 7, my_words_open 16, my_words_review_start 1,
//   quiz_done 1, star_word 8; dictation_done row is QA-only → deleted.
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
  // dictation_done not in baseline → row deleted entirely
};
// round 55: same baseline reused — QA round only drifted app_open (+2 fresh
// sessions incl. the Turbopack restart), my_words_open (+2), star_word (+1);
// zero learner/attempt rows (star-only QA never registers).

(async () => {
  // 1) find the QA learner: created within this round's window (last 45 min), anonymous
  const cutoff = new Date(Date.now() - 45 * 60_000);
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
