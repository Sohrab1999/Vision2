// Task 75 DB cleanup — restore app_open drift caused by smoke QA page loads.
// This round touched NO gameplay/openLesson surfaces (component tests mock
// analytics; live smoke only loads the home page + opens the palette),
// so the only drift is app_open on 2026-10-12: baseline 2 → drifted 5.
// Real rows (lesson_open=9, my_words_open=16, my_words_review_start=1,
// quiz_done=1, star_word=8) and 6 learners / 10 attempts stay untouched.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const BASELINE = { day: "2026-10-12", app_open: 2 };

(async () => {
  const row = await p.eventDay.findUnique({
    where: { day_name: { day: BASELINE.day, name: "app_open" } },
  });
  if (!row) {
    console.log("NO_ROW — nothing to clean");
  } else if (row.count === BASELINE.app_open) {
    console.log(`ALREADY_CLEAN app_open=${row.count}`);
  } else {
    await p.eventDay.update({
      where: { day_name: { day: BASELINE.day, name: "app_open" } },
      data: { count: BASELINE.app_open },
    });
    console.log(`RESTORED app_open ${row.count} -> ${BASELINE.app_open}`);
  }
  const after = await p.eventDay.findMany({
    where: { day: "2026-10-12" },
    orderBy: { name: "asc" },
  });
  console.log("after:", after.map((e) => `${e.name}=${e.count}`).join(" | "));
  await p.$disconnect();
})();
