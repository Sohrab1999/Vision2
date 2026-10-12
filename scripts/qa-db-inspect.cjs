/* QA-pollution inspection: learners + today's attempts (read-only). */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const learners = await p.learnerProfile.findMany({
    select: { userId: true, name: true, color: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  console.log("== learners ==");
  for (const l of learners) console.log(JSON.stringify(l));

  const since = new Date("2026-10-11T20:00:00.000Z"); // Tehran-local "today"
  const attempts = await p.quizAttempt.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  console.log("== attempts today ==");
  for (const a of attempts) console.log(JSON.stringify(a));
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
