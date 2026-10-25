// QA cleanup — remove the learner + attempt created by the my-words review QA run
// (job 453171, 2026-10-12). Target: u-mv4xxeav-* created 2026-10-12T07:38 only.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const qaUser = "u-mv4xxeav-044f9c878d67971c";
  const a = await p.quizAttempt.deleteMany({ where: { userId: qaUser } });
  const l = await p.learnerProfile.deleteMany({ where: { userId: qaUser } });
  const sync = await p.learnerSync.deleteMany({ where: { userId: qaUser } }).catch(() => ({ count: 0 }));
  console.log(`deleted: attempts=${a.count} learners=${l.count} syncCodes=${sync.count || 0}`);
  const left = { learners: await p.learnerProfile.count(), attempts: await p.quizAttempt.count() };
  console.log("remaining:", JSON.stringify(left));
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
