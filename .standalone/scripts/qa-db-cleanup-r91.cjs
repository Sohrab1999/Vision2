// Task 78 DB cleanup — freeze-day marks QA hygiene.
// The ledger is passive (no trackEvent) → only app_open drift from page
// loads/reloads: 4 → baseline 2. Real rows untouched: lesson_open=9,
// my_words_open=16, my_words_review_start=1, quiz_done=1, star_word=8;
// 6 learners / 10 attempts intact.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const DAY = "2026-10-13";
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

  const after = await p.eventDay.findMany({ where: { day: DAY }, orderBy: { name: "asc" } });
  console.log("after:", after.map((e) => `${e.name}=${e.count}`).join(" | "));
  await p.$disconnect();
})();
