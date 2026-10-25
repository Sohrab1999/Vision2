// DB baseline snapshot for QA round @ 2026-10-12 ~17:00 +08:00 (job 453171)
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const learners = await p.learnerProfile.findMany({ select: { userId: true, name: true } });
  const attempts = await p.quizAttempt.findMany({
    select: { id: true, userId: true, lesson: true, category: true, correct: true, total: true },
  });
  const events = await p.eventDay.findMany({ orderBy: [{ day: "asc" }, { name: "asc" }] });
  console.log("learners:", learners.length, JSON.stringify(learners.map((l) => l.name || l.userId.slice(0,8))));
  console.log("attempts:", attempts.length);
  for (const e of events) console.log(`event ${e.day} ${e.name} = ${e.count}`);
  await p.$disconnect();
})();
