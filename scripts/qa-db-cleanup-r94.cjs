// Task 94 — DB hygiene: inspect QA deltas then clean. Read-only unless --clean.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const since = new Date(Date.now() - 40 * 60 * 1000);
  const rows = await p.quizAttempt.findMany({
    where: { category: "duel", createdAt: { gte: since } },
    select: { id: true, userId: true, outcome: true, score: true, percent: true, receiptSig: true, createdAt: true },
  });
  console.log(
    "recent duel rows:",
    JSON.stringify(rows.map((r) => ({ u: r.userId.slice(0, 8), o: r.outcome, s: r.score, rs: r.receiptSig ? r.receiptSig.slice(0, 10) + "…" : null })))
  );

  const profs = await p.learnerProfile.findMany({ where: { createdAt: { gte: since } }, select: { userId: true, name: true } });
  console.log("profiles created <40m:", JSON.stringify(profs.map((x) => x.name)));

  const todayKey = new Date().toISOString().slice(0, 10); // EventDay.day = "YYYY-MM-DD" (UTC)
  const ev = await p.eventDay.findMany({ where: { day: todayKey }, select: { day: true, name: true, count: true } });
  console.log("today events:", JSON.stringify(ev));

  const attempts = await p.quizAttempt.count();
  console.log("attempts total:", attempts);

  if (process.argv.includes("--clean")) {
    const qaUserIds = new Set(rows.map((r) => r.userId));
    // also the fresh :81-origin profile from onboarding skip
    for (const prof of profs) qaUserIds.add(prof.userId);
    for (const uid of qaUserIds) {
      const del = await p.quizAttempt.deleteMany({ where: { userId: uid } });
      const delP = await p.learnerProfile.deleteMany({ where: { userId: uid } });
      if (del.count || delP.count) console.log("cleaned", uid.slice(0, 8), "attempts:", del.count, "profiles:", delP.count);
    }
    // EventDay is (day,name,count) rows: restore passive app_open to baseline 2
    // and drop the QA-only funnel events from this round
    for (const e of ev) {
      if (e.name === "app_open") {
        await p.eventDay.update({ where: { day_name: { day: e.day, name: e.name } }, data: { count: 2 } });
        console.log("app_open restored to 2 (was", e.count + ")");
      } else if (["duel_start", "duel_done", "lesson_open"].includes(e.name)) {
        await p.eventDay.delete({ where: { day_name: { day: e.day, name: e.name } } });
        console.log("QA event row removed:", e.name, "=", e.count);
      }
    }
    console.log("CLEAN-OK");
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
