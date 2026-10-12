#!/usr/bin/env node
// Task 65 DB hygiene — the duel-history QA only loads pages (no gameplay, no
// learner registration, no stats sends), so the only drift is EventDay app_open.
// Restore the round-62/63/64 baseline: app_open 2, quiz_done 1, no QA-only rows.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const before = await p.eventDay.findMany({ orderBy: { day: "desc" }, take: 3 });
  console.log("BEFORE:", JSON.stringify(before));
  const today = before[0];
  if (today && today.appOpen > 2) {
    await p.eventDay.update({ where: { day: today.day }, data: { appOpen: 2 } });
  }
  if (today && today.quizDone > 1) {
    await p.eventDay.update({ where: { day: today.day }, data: { quizDone: 1 } });
  }
  const learners = await p.learnerProfile.findMany({ select: { userId: true, name: true, createdAt: true } });
  const attempts = await p.quizAttempt.count();
  console.log("AFTER:", JSON.stringify(await p.eventDay.findMany({ orderBy: { day: "desc" }, take: 3 })));
  console.log("learners:", learners.length, "attempts:", attempts);
  console.log("learnerNames:", learners.map(l => l.name).join(","));
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
