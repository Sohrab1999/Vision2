// Task 100 — DB hygiene check + app_open restore (localStorage-only QA seed; zero server rows expected)
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const today = "2026-10-13";
  const evs = await p.eventDay.findMany({ where: { day: today }, orderBy: { name: "asc" } });
  console.log("EventDay(today):", JSON.stringify(evs));
  const attempts = await p.quizAttempt.count();
  const learners = await p.quizAttempt.groupBy({ by: ["userId"], _count: true });
  console.log("attempts:", attempts, "learners:", learners.length);
  const duels = await p.quizAttempt.count({ where: { category: "duel" } });
  console.log("duel rows:", duels);
  await p.$disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
