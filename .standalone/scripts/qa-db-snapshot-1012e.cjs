// QA snapshot BEFORE browser round — job 453171 @ 2026-10-12 17:15 +08:00
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  const events = await p.eventDay.findMany({ where: { day: "2026-10-12" } });
  console.log("LEARNERS:", learners, "ATTEMPTS:", attempts);
  console.log("EVENTS:", JSON.stringify(events.map(e => `${e.name}=${e.count}`)));
  await p.$disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
