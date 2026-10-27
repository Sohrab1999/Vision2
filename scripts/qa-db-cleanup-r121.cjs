// Task 121 — DB hygiene: inspect QA deltas then restore baselines. Read-only unless --clean.
// (r121 variant of qa-db-cleanup-r116.cjs — adds the week_review_* + exam_review_* families)
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await p.quizAttempt.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, userId: true, category: true, outcome: true, createdAt: true },
  });
  console.log("attempts <60m:", JSON.stringify(rows.map((r) => r.category)));
  const profs = await p.learnerProfile.findMany({ where: { createdAt: { gte: since } }, select: { userId: true, name: true } });
  console.log("profiles <60m:", JSON.stringify(profs.map((x) => x.name)));
  const todayKey = new Date().toISOString().slice(0, 10);
  const ev = await p.eventDay.findMany({ where: { day: todayKey }, select: { day: true, name: true, count: true } });
  console.log("today events:", JSON.stringify(ev));
  console.log("attempts total:", await p.quizAttempt.count());
  console.log("storyCache rows (content cache, kept):", await p.storyCache.count());
  console.log("weekReviewCache rows (content cache, kept):", await p.weekReviewCache.count());
  if (process.argv.includes("--clean")) {
    for (const e of ev) {
      if (e.name === "app_open") {
        await p.eventDay.update({ where: { day_name: { day: e.day, name: e.name } }, data: { count: 2 } });
        console.log("app_open restored to 2 (was", e.count + ")");
      } else if (
        [
          "duel_start", "duel_done", "lesson_open",
          "my_words_open", "my_words_story_start", "story_served", "story_generated", "story_fallback",
          "week_review_start", "week_review_served", "week_review_generated", "week_review_fallback",
          "exam_review_start", "exam_review_served", "exam_review_generated", "exam_review_fallback",
          "quiz_done", "exam_done",
        ].includes(e.name)
      ) {
        await p.eventDay.delete({ where: { day_name: { day: e.day, name: e.name } } });
        console.log("QA event row removed:", e.name, "=", e.count);
      }
    }
    console.log("CLEAN-OK");
  }
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
