// Task 104 — DB hygiene for the EMPTY-DB baseline discovered this round.
// The sandbox reset wiped db/custom.db (0 attempts / 0 profiles / 0 events,
// image-provisioned at 05:41). Baseline is therefore EMPTY, not the old
// «attempts=10 / app_open=2». This script reports the full picture; --clean
// removes QA-accumulated event rows so the round ends exactly at the
// empty baseline. Never touches attempts/profiles unless they are QA rows
// created <90 minutes ago by the QA learner name pattern.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const attempts = await p.quizAttempt.count();
  const profiles = await p.learnerProfile.count();
  const events = await p.eventDay.findMany({ select: { day: true, name: true, count: true } });
  console.log("attempts:", attempts, "(baseline 0)");
  console.log("profiles:", profiles, "(baseline 0)");
  console.log("eventDay rows:", JSON.stringify(events));
  if (process.argv.includes("--clean")) {
    // baseline is empty → today's QA event rows all go
    for (const e of events) {
      await p.eventDay.delete({ where: { day_name: { day: e.day, name: e.name } } });
      console.log("event row removed:", e.name, "=", e.count, "on", e.day);
    }
    // safety net: QA learner rows younger than 90min matching the QA naming
    const since = new Date(Date.now() - 90 * 60 * 1000);
    const qaProfiles = await p.learnerProfile.findMany({
      where: { createdAt: { gte: since }, name: { startsWith: "QA-" } },
      select: { userId: true, name: true },
    });
    for (const pr of qaProfiles) {
      await p.quizAttempt.deleteMany({ where: { userId: pr.userId } });
      await p.learnerProfile.delete({ where: { userId: pr.userId } });
      console.log("QA profile+attempts removed:", pr.name);
    }
    const a2 = await p.quizAttempt.count();
    const p2 = await p.learnerProfile.count();
    const e2 = await p.eventDay.count();
    console.log("after clean → attempts:", a2, "profiles:", p2, "events:", e2);
    if (a2 === 0 && p2 === 0 && e2 === 0) console.log("CLEAN-OK (empty baseline restored)");
    else { console.log("CLEAN-INCOMPLETE — inspect manually"); process.exitCode = 1; }
  }
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
