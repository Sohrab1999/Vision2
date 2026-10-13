#!/usr/bin/env node
/* Task 127 — DB hygiene after the c-ink-amber QA round.
 * The rush round (r125 pattern) wrote: 1 Visitor profile (onboarding default
 * name «یادگیرنده», <60m), 1 rush attempt, 1 rush_done EventDay row, +3 app_open
 * (r101 already restored app_open). r122's name-filter can't see the Visitor —
 * this script finds it by age+name, deletes the QA attempt by recency+category,
 * and removes today's rush_done row (count=1 == exactly this round's write).
 * Real learner rows (flashcard_done/anki_export/star_word/quiz_done/…) untouched.
 * Run:  node scripts/qa-db-cleanup-r127.cjs          (report only)
 *       node scripts/qa-db-cleanup-r127.cjs --clean
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const HOUR = 3600e3;

async function main() {
  const now = Date.now();
  const cands = await db.learnerProfile.findMany({
    where: { name: "یادگیرنده", createdAt: { gte: new Date(now - HOUR) } },
    select: { userId: true, name: true, createdAt: true },
  });
  console.log("QA visitor candidates (<60m):", cands.map((p) => p.userId.slice(0, 12)).join(", ") || "(none)");

  const qaAttempt = await db.quizAttempt.findFirst({
    where: { category: "rush", createdAt: { gte: new Date(now - HOUR) } },
    orderBy: { createdAt: "desc" },
  });
  console.log("QA rush attempt (<60m):", qaAttempt ? `${qaAttempt.id}@${qaAttempt.createdAt.toISOString()}` : "(none)");

  const today = new Date();
  const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const rushEvent = await db.eventDay.findFirst({ where: { day, name: "rush_done" } });
  console.log(`rush_done event row (${day}):`, rushEvent ? `count=${rushEvent.count}` : "(none)");
  const attemptsTotal = await db.quizAttempt.count();
  console.log("attempts total:", attemptsTotal, "(baseline 39)");

  if (!process.argv.includes("--clean")) {
    console.log("REPORT-ONLY");
    return;
  }
  for (const p of cands) {
    await db.learnerProfile.delete({ where: { userId: p.userId } });
    console.log(`deleted visitor profile ${p.userId.slice(0, 12)}`);
  }
  if (qaAttempt) {
    await db.quizAttempt.delete({ where: { id: qaAttempt.id } });
    console.log(`deleted QA attempt ${qaAttempt.id}`);
  }
  if (rushEvent && rushEvent.count === 1) {
    await db.eventDay.delete({ where: { id: rushEvent.id } });
    console.log(`deleted rush_done row (count=1 — this round's write)`);
  } else if (rushEvent) {
    await db.eventDay.update({ where: { id: rushEvent.id }, data: { count: { decrement: 1 } } });
    console.log(`decremented rush_done row (was count=${rushEvent.count} — real learner rows mixed in)`);
  }
  console.log("attempts after:", await db.quizAttempt.count(), "| profiles after:", await db.learnerProfile.count());
  console.log("CLEAN-OK");
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
