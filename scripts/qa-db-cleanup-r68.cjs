#!/usr/bin/env node
// Task 68 DB hygiene — restore EventDay to the round's snapshot (.r67-baseline.json
// captured ALL rows pre-QA). Rows not in the baseline (QA-created, any day/name)
// are deleted; baseline rows get their exact counts back; learners/attempts asserted.
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const base = JSON.parse(fs.readFileSync("/home/z/my-project/scripts/.r67-baseline.json", "utf8"));
  const baseIds = new Set(base.rows.map((r) => r.id));
  const baseById = new Map(base.rows.map((r) => [r.id, r]));
  const live = await p.eventDay.findMany();
  for (const r of live) {
    const b = baseById.get(r.id);
    if (!b) {
      await p.eventDay.delete({ where: { id: r.id } });
      console.log("DELETED", r.day, r.name, r.count);
    } else if (r.count !== b.count) {
      await p.eventDay.update({ where: { id: r.id }, data: { count: b.count } });
      console.log("RESTORED", r.day, r.name, `${r.count}→${b.count}`);
    }
  }
  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  console.log("learners:", learners, "attempts:", attempts);
  if (learners !== base.learners || attempts !== base.attempts) {
    console.error("DRIFT: learners/attempts changed!");
    process.exitCode = 1;
  } else {
    console.log("CLEAN_OK");
  }
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
