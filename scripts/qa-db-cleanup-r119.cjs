// Task 119 — DB hygiene (r118 variant — no attempts this round: the QA
// flow only asks the week teacher; adds the week_review event family).
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await p.quizAttempt.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, userId: true, category: true, outcome: true, createdAt: true },
  });
  console.log("attempts <60m:", JSON.stringify(rows.map((r) => `${r.category}/${r.outcome}`)));
  const profs = await p.learnerProfile.findMany({ where: { createdAt: { gte: since } }, select: { userId: true, name: true } });
  console.log("profiles <60m:", JSON.stringify(profs.map((x) => x.name)));
  const todayKey = new Date().toISOString().slice(0, 10);
  const ev = await p.eventDay.findMany({ where: { day: todayKey }, select: { day: true, name: true, count: true } });
  console.log("today events:", JSON.stringify(ev));
  console.log("attempts total:", await p.quizAttempt.count());
  console.log("weekReviewCache rows (content cache, kept like reviewCache):", await p.weekReviewCache.count());
  if (process.argv.includes("--clean")) {
    // the browser QA run wrote: NO attempts (localStorage-only seed + two teacher
    // POSTs), app_open, and the week_review event rows. Restore the passive
    // app_open baseline (2); drop QA-only event rows. WeekReviewCache stays
    // (content, shared policy with ExplainCache/StoryCache/ReviewCache).
    for (const r of rows) {
      await p.quizAttempt.delete({ where: { id: r.id } });
      console.log("QA-window attempt removed:", r.category);
    }
    for (const pr of profs) {
      await p.learnerProfile.delete({ where: { userId: pr.userId } });
      console.log("QA-window profile removed:", pr.name);
    }
    for (const e of ev) {
      if (e.name === "app_open") {
        const was = e.count;
        if (was !== 2) {
          await p.eventDay.update({ where: { day_name: { day: e.day, name: e.name } }, data: { count: 2 } });
          console.log("app_open restored to 2 (was", was + ")");
        }
      } else if (
        [
          "duel_start", "duel_done", "lesson_open", "my_words_open",
          "my_words_story_start", "story_served", "story_generated", "story_fallback",
          "quiz_done", "exam_done", "exam_review_start", "exam_review_served", "exam_review_generated", "exam_review_fallback",
          "week_review_start", "week_review_served", "week_review_generated", "week_review_fallback",
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
