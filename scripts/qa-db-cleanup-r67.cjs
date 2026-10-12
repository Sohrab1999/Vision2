#!/usr/bin/env node
// Task 67 DB hygiene (v2) — the analytics server keys EventDay by UTC day,
// so this round's QA (00:0x +08 == 2026-10-12 UTC) drifted the 2026-10-12
// rows: app_open 2→4 (two page loads) and lesson_open 9→10 (one smart-
// flashcards intent). Restore the standing baseline; delete any QA rows on
// future days; assert learners/attempts untouched.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const targets = [
    { day: "2026-10-12", name: "app_open", count: 2 },
    { day: "2026-10-12", name: "lesson_open", count: 9 },
  ];
  for (const t of targets) {
    const cur = await p.eventDay.findUnique({
      where: { day_name: { day: t.day, name: t.name } },
    });
    if (cur && cur.count !== t.count) {
      await p.eventDay.update({ where: { id: cur.id }, data: { count: t.count } });
      console.log("RESTORED", t.day, t.name, `${cur.count}→${t.count}`);
    } else {
      console.log("OK", t.day, t.name, cur ? `=${cur.count}` : "(no row)");
    }
  }
  // safety: drop rows created on later days (none expected)
  const live = await p.eventDay.findMany();
  for (const r of live.filter((x) => x.day >= "2026-10-13")) {
    await p.eventDay.delete({ where: { id: r.id } });
    console.log("DELETED", r.day, r.name, r.count);
  }
  const learners = await p.learnerProfile.count();
  const attempts = await p.quizAttempt.count();
  console.log(
    "AFTER:",
    JSON.stringify(
      await p.eventDay.findMany({ orderBy: [{ day: "desc" }, { name: "asc" }], take: 8 }),
    ),
  );
  console.log("learners:", learners, "attempts:", attempts);
  if (learners !== 6 || attempts !== 10) {
    console.error("DRIFT: learners/attempts changed!");
    process.exitCode = 1;
  } else {
    console.log("CLEAN_OK");
  }
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
