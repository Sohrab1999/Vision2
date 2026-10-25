// Task 76 DB cleanup — goal chip QA hygiene.
// Drift: app_open 2→4 (page loads/reloads), QA-only goal_chip row (count=1
// — first production of this event in the feature's life was the QA tap).
// lesson_open stayed 9 (nav used setView — no openLesson fired).
// Real rows (my_words_open=16, my_words_review_start=1, quiz_done=1,
// star_word=8) and 6 learners / 10 attempts untouched.
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

  const chip = await p.eventDay.findUnique({
    where: { day_name: { day: DAY, name: "goal_chip" } },
  });
  if (chip) {
    await p.eventDay.delete({ where: { day_name: { day: DAY, name: "goal_chip" } } });
    console.log(`DELETED goal_chip=${chip.count}`);
  } else {
    console.log("goal_chip row absent");
  }

  const after = await p.eventDay.findMany({ where: { day: DAY }, orderBy: { name: "asc" } });
  console.log("after:", after.map((e) => `${e.name}=${e.count}`).join(" | "));
  await p.$disconnect();
})();
