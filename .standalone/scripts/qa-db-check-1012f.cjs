const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const learners = await p.learnerProfile.count();
  const attempts = await p.attempt.count();
  const ev = await p.eventDay.findMany({ where: { day: new Date().toISOString().slice(0, 10) } });
  console.log(JSON.stringify({ learners, attempts, events: ev.map((e) => `${e.name}=${e.count}`).sort() }, null, 1));
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
