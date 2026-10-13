#!/usr/bin/env node
/* Task 130 — DB hygiene after the deviant-consolidation QA round.
 * This round ran TWO rush rounds (the first hit the Turbopack watcher stall —
 * CSS chunk stale, re-run for the honest green), so: up to 2 rush attempts,
 * 1-2 Visitor profiles (onboarding default name «یادگیرنده», <2h), rush_done
 * EventDay count=2 (today's row), +app_open inflation. r122's name filter can't
 * see the Visitor — found by age+name like r127. Real learner rows untouched.
 * Run:  node scripts/qa-db-cleanup-r130.cjs          (report only)
 *       node scripts/qa-db-cleanup-r130.cjs --clean
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const HOUR = 3600e3;

async function main() {
  const now = Date.now();
  const cands = await db.learnerProfile.findMany({
    where: { name: "یادگیرنده", createdAt: { gte: new Date(now - 2 * HOUR) } },
    select: { userId: true, name: true, createdAt: true },
  });
  console.log("QA visitor candidates (<2h):", cands.map((p) => p.userId.slice(0, 12)).join(", ") || "(none)");

  const qaAttempts = await db.quizAttempt.findMany({
    where: { category: "rush", createdAt: { gte: new Date(now - 2 * HOUR) } },
    orderBy: { createdAt: "desc" },
  });
  console.log("QA rush attempts (<2h):", qaAttempts.map((a) => a.id).join(", ") || "(none)");

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
  for (const a of qaAttempts) {
    await db.quizAttempt.delete({ where: { id: a.id } });
    console.log(`deleted QA attempt ${a.id}`);
  }
  if (rushEvent && rushEvent.count === 2) {
    await db.eventDay.delete({ where: { id: rushEvent.id } });
    console.log(`deleted rush_done row (count=2 — exactly this round's two writes)`);
  } else if (rushEvent) {
    await db.eventDay.update({ where: { id: rushEvent.id }, data: { count: { decrement: 2 } } });
    console.log(`decremented rush_done row by 2 (was count=${rushEvent.count} — real learner rows mixed in)`);
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
