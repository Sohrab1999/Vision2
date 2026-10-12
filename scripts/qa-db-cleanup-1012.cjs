/* QA cleanup 2026-10-12 (post-rollback DB hygiene):
 *  1) Explicit QA learners (qa-player-* / test-qa-u*) — learner rows + attempts.
 *  2) Orphaned attempt-users: learner rows already deleted by earlier cleanup
 *     rounds as QA records, but their quizAttempt rows were missed — they still
 *     pollute global stats (avgPercent/total). Real UUID learners untouched.
 */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const learners = await p.learnerProfile.findMany({ select: { userId: true, name: true } });
  const qaLearners = learners.filter(
    (l) => l.userId.startsWith("qa-player") || l.userId.startsWith("test-qa-u"),
  );
  const learnerIds = new Set(learners.map((l) => l.userId));

  const attempts = await p.quizAttempt.findMany({ select: { userId: true } });
  const attemptUserIds = [...new Set(attempts.map((a) => a.userId))];
  const orphaned = attemptUserIds.filter((id) => !learnerIds.has(id));

  const doomed = [
    ...qaLearners.map((l) => l.userId),
    ...orphaned,
  ];
  console.log("removing learners:", qaLearners.map((l) => `${l.userId.slice(0, 12)} (${l.name})`).join(", ") || "none");
  console.log("removing orphaned attempt-users:", orphaned.map((i) => i.slice(0, 9)).join(",") || "none");

  const before = await p.quizAttempt.count();
  for (const id of doomed) {
    const r = await p.quizAttempt.deleteMany({ where: { userId: id } });
    if (r.count) console.log(`  attempts deleted for ${id.slice(0, 12)}: ${r.count}`);
  }
  for (const l of qaLearners) {
    const r = await p.learnerProfile.deleteMany({ where: { userId: l.userId } });
    if (r.count) console.log(`  learnerProfile deleted: ${l.userId.slice(0, 12)}`);
  }
  const after = await p.quizAttempt.count();
  console.log(`attempts: ${before} -> ${after}`);
  const left = await p.learnerProfile.findMany({ select: { userId: true, name: true } });
  console.log("remaining learners:", left.map((l) => `${l.userId.slice(0, 9)} (${l.name})`).join(", "));
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
