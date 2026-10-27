#!/usr/bin/env node
/* Task 138 — surgical DB hygiene (snapshot→delta→restore, r136 pattern).
 * The QA round opens the A4 paper twice (7/7 and 3/7); each open with a
 * passing weekGate fires requestWeekVerdict → exactly one server event
 * (week_review_generated OR week_review_fallback). Restore today's rows
 * to the pre-QA snapshot taken by qa-a4-seal-r138.sh (SNAPSHOT line).
 * Usage: node scripts/qa-db-cleanup-r138.cjs --gen <n> --fb <n> --clean
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

function argNum(name, dflt) {
  const i = process.argv.indexOf("--" + name);
  return i > -1 ? Number(process.argv[i + 1]) : dflt;
}
const SNAP = { generated: argNum("gen", 0), fallback: argNum("fb", 0) };

async function main() {
  const d = new Date();
  const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const gen = await db.eventDay.findFirst({ where: { day, name: "week_review_generated" } });
  const fb = await db.eventDay.findFirst({ where: { day, name: "week_review_fallback" } });
  console.log(`before: generated=${gen ? gen.count : 0} fallback=${fb ? fb.count : 0}`);

  if (!process.argv.includes("--clean")) return console.log("REPORT-ONLY");

  if (gen && gen.count > SNAP.generated) {
    const delta = gen.count - SNAP.generated;
    if (gen.count - delta === 0) {
      await db.eventDay.delete({ where: { id: gen.id } });
      console.log(`deleted week_review_generated row (delta ${delta} removed whole row)`);
    } else {
      await db.eventDay.update({ where: { id: gen.id }, data: { count: SNAP.generated } });
      console.log(`week_review_generated count ${gen.count} -> ${SNAP.generated} (QA delta ${delta} removed)`);
    }
  }
  if (fb && fb.count > SNAP.fallback) {
    const remaining = fb.count - SNAP.fallback;
    if (SNAP.fallback === 0 && remaining === fb.count) {
      await db.eventDay.delete({ where: { id: fb.id } });
      console.log(`deleted week_review_fallback row (QA-only, count=${fb.count})`);
    } else {
      await db.eventDay.update({ where: { id: fb.id }, data: { count: SNAP.fallback } });
      console.log(`week_review_fallback count ${fb.count} -> ${SNAP.fallback}`);
    }
  }
  const after1 = await db.eventDay.findFirst({ where: { day, name: "week_review_generated" } });
  const after2 = await db.eventDay.findFirst({ where: { day, name: "week_review_fallback" } });
  console.log(`after: generated=${after1 ? after1.count : 0} fallback=${after2 ? after2.count : 0}`);
  console.log("CLEAN-OK");
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
