// Task 112 — DB hygiene for the entry-ticket QA round.
// The QA round registers exactly ONE learner (بلیت‌آزمای QA) via /api/register;
// no quiz attempts, no duel matches (rooms never filled into a match).
// This script removes the profile by the exact userId recorded in the creds
// file and restores the app_open baseline if the browser visit bumped it.
// Read-only unless --clean.
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const p = new PrismaClient();

(async () => {
  let qaUserId = null;
  try {
    qaUserId = JSON.parse(fs.readFileSync("node_modules/.cache/r112-creds.json", "utf8")).userId ?? null;
  } catch {}

  const profs = await p.learnerProfile.findMany({
    where: qaUserId ? { userId: qaUserId } : { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    select: { userId: true, name: true, createdAt: true },
  });
  console.log("QA profiles:", JSON.stringify(profs.map((x) => ({ userId: x.userId, name: x.name }))));

  const attempts = await p.quizAttempt.findMany({
    where: qaUserId ? { userId: qaUserId } : { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    select: { userId: true, category: true, outcome: true },
  });
  console.log("QA attempts:", JSON.stringify(attempts));

  const todayKey = new Date().toISOString().slice(0, 10);
  const ev = await p.eventDay.findMany({ where: { day: todayKey }, select: { day: true, name: true, count: true } });
  console.log("today events:", JSON.stringify(ev));

  if (process.argv.includes("--clean")) {
    if (qaUserId) {
      const gone = await p.learnerProfile.deleteMany({ where: { userId: qaUserId } });
      console.log("profile deleted:", gone.count);
      const goneAttempts = await p.quizAttempt.deleteMany({ where: { userId: qaUserId } });
      console.log("stray attempts deleted:", goneAttempts.count);
    }
    for (const e of ev) {
      if (e.name === "app_open") {
        await p.eventDay.update({ where: { day_name: { day: e.day, name: e.name } }, data: { count: 2 } });
        console.log("app_open restored to 2 (was", e.count + ")");
      } else if (["duel_start", "duel_done", "lesson_open"].includes(e.name)) {
        await p.eventDay.delete({ where: { day_name: { day: e.day, name: e.name } } });
        console.log("QA event row removed:", e.name, "=", e.count);
      }
    }
    try { fs.unlinkSync("node_modules/.cache/r112-creds.json"); } catch {}
    console.log("CLEAN-OK");
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
