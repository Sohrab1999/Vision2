// Task 77 DB cleanup — freeze badge QA hygiene.
// Drift: app_open 2→4 (smoke + QA reloads), QA-only freeze_badge row (count=1
// — first production of this event in the feature's life was the QA tap in
// round D). Real rows untouched: lesson_open=9 (badge nav used goHome/setView
// — no openLesson fired), my_words_open=16, my_words_review_start=1,
// quiz_done=1, star_word=8; 6 learners / 10 attempts intact.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const DAY = "2026-10-12";
const BASELINE_APP_OPEN = 2;

(async () => {
  const appOpen = await p.eventDay.findUnique({
    where: { day_name: { day: DAY, name: "app_open" } },
  });
  if (appOpen && appOpen.count !== BASELINE_APP_OPEN) {
    await p.eventDay.update({
      where: { day_name: { day: DAY, name: "app_open" } },
      data: { count: BASELINE_APP_OPEN },
    });
    console.log(`RESTORED app_open ${appOpen.count} -> ${BASELINE_APP_OPEN}`);
  } else {
    console.log(`app_open already ${appOpen?.count ?? "missing"}`);
  }

  const badge = await p.eventDay.findUnique({
    where: { day_name: { day: DAY, name: "freeze_badge" } },
  });
  if (badge) {
    await p.eventDay.delete({ where: { day_name: { day: DAY, name: "freeze_badge" } } });
    console.log(`DELETED freeze_badge=${badge.count}`);
  } else {
    console.log("freeze_badge row absent");
  }

  const after = await p.eventDay.findMany({ where: { day: DAY }, orderBy: { name: "asc" } });
  console.log("after:", after.map((e) => `${e.name}=${e.count}`).join(" | "));
  await p.$disconnect();
})();
