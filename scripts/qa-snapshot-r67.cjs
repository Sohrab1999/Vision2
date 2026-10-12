#!/usr/bin/env node
// Task 67 — snapshot EventDay baseline BEFORE palette QA so the cleanup can
// restore exact pre-QA values (app_open drift from page loads + one
// lesson_open from the smart-flashcards command test).
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const rows = await p.eventDay.findMany({ orderBy: [{ day: "desc" }, { name: "asc" }] });
  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  fs.writeFileSync(
    "/home/z/my-project/scripts/.r67-baseline.json",
    JSON.stringify({ rows, learners, attempts }, null, 2),
  );
  console.log("BASELINE:", JSON.stringify(rows), "learners:", learners, "attempts:", attempts);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
