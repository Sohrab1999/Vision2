#!/usr/bin/env node
/* Task 122 — DB hygiene after the duel room-test round.
 * Deletes ONLY the QA identities minted by this round's probes/E2E
 * (بلیت‌آزمای QA / نبردکاملِ QA — the r112-probe and r122-full-e2e names),
 * then re-verifies the real-learner baseline: attempts=39 untouched,
 * app_open untouched, no EventDay rows added by the socket-only QA flow
 * (the duel judge writes no EventDay at all). Content caches stay.
 * Run:  node scripts/qa-db-cleanup-r122.cjs          (report only)
 *       node scripts/qa-db-cleanup-r122.cjs --clean  (delete QA profiles)
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const QA_NAMES = new Set(["بلیت‌آزمای QA", "نبردکاملِ QA"]);

async function main() {
  const qaProfiles = await db.learnerProfile.findMany({
    where: { name: { in: [...QA_NAMES] } },
    select: { userId: true, name: true, createdAt: true },
  });
  console.log(
    "QA profiles found:",
    qaProfiles.map((p) => `${p.name}@${p.userId.slice(0, 8)}`).join(", ") || "(none)"
  );

  if (process.argv.includes("--clean")) {
    for (const p of qaProfiles) {
      await db.learnerProfile.delete({ where: { userId: p.userId } });
      console.log(`deleted profile ${p.name}@${p.userId.slice(0, 8)}`);
    }
  }

  const [profiles, attempts, opens, ticketEvents] = await Promise.all([
    db.learnerProfile.findMany({ select: { userId: true, name: true } }),
    db.quizAttempt.count(),
    db.eventDay.findMany({ where: { name: "app_open" }, select: { day: true, count: true }, orderBy: { day: "desc" }, take: 1 }),
    db.eventDay.count({ where: { name: { contains: "duel" } } }),
  ]);
  console.log("remaining profiles:", profiles.length, "| names:", JSON.stringify(profiles.map((p) => p.name)));
  console.log("attempts total:", attempts, "(baseline 39 — duel QA never writes attempts)");
  console.log("app_open latest:", JSON.stringify(opens));
  console.log("duel* event rows:", ticketEvents, "(socket flow writes none)");
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
