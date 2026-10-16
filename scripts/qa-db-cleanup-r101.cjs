// Task 101 — DB hygiene: inspect QA deltas then restore baselines. Read-only unless --clean.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await p.quizAttempt.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, userId: true, category: true, outcome: true, score: true, createdAt: true },
  });
  console.log("attempts <60m:", JSON.stringify(rows.map((r) => ({ c: r.category, o: r.outcome }))));
  const profs = await p.learnerProfile.findMany({ where: { createdAt: { gte: since } }, select: { userId: true, name: true } });
  console.log("profiles <60m:", JSON.stringify(profs.map((x) => x.name)));
  const todayKey = new Date().toISOString().slice(0, 10);
  const ev = await p.eventDay.findMany({ where: { day: todayKey }, select: { day: true, name: true, count: true } });
  console.log("today events:", JSON.stringify(ev));
  console.log("attempts total:", await p.quizAttempt.count());
  if (process.argv.includes("--clean")) {
    // Round 260 update: QA sessions now ride full loops (rush completion, konkur
    // simulator, smart practice), which DO write quizAttempt rows and session
    // events. Baseline contract stays attempts=0 / app_open=2, so --clean now
    // also drops QA-session attempts from the last hour and the QA-generated
    // event names. Unknown event names are deliberately preserved.
    const del = await p.quizAttempt.deleteMany({ where: { createdAt: { gte: since } } });
    if (del.count) console.log("QA attempts removed (<60m):", del.count);
    const QA_EVENT_NAMES = [
      "duel_start", "duel_done", "lesson_open", "konkur_start", "konkur_done",
      "smart_practice_start", "smart_practice_done", "quiz_done", "rush_done",
      "my_words_open", "listen_start", "listen_done",
    ];
    for (const e of ev) {
      if (e.name === "app_open") {
        await p.eventDay.update({ where: { day_name: { day: e.day, name: e.name } }, data: { count: 2 } });
        console.log("app_open restored to 2 (was", e.count + ")");
      } else if (QA_EVENT_NAMES.includes(e.name)) {
        await p.eventDay.delete({ where: { day_name: { day: e.day, name: e.name } } });
        console.log("QA event row removed:", e.name, "=", e.count);
      }
    }
    console.log("attempts total now:", await p.quizAttempt.count());
    console.log("CLEAN-OK");
  }
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
