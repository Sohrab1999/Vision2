// Task 129 DB hygiene — remove the single week_chip analytics event that the
// QA click wrote (feature shipped minutes ago; no real user could have fired
// it). Policy parity with r125/r127: QA-written events must not pollute the
// real learners' ledger. Everything else untouched.
const path = require("path");
const { PrismaClient } = require(path.join(process.cwd(), "node_modules/.prisma/client"));
// some setups expose @prisma/client instead — fallback
let db;
try { db = new PrismaClient(); } catch (e) { db = new (require("@prisma/client").PrismaClient)(); }

(async () => {
  const ev = await db.eventDay.findFirst({ where: { name: "week_chip" } });
  if (!ev) { console.log("week_chip event: none (already clean)"); }
  else {
    console.log(`week_chip event found: day=${ev.day} count=${ev.count}`);
    if (ev.count <= 1) { await db.eventDay.delete({ where: { id: ev.id } }); console.log("deleted (count<=1)"); }
    else { await db.eventDay.update({ where: { id: ev.id }, data: { count: { decrement: 1 } } }); console.log("decremented"); }
  }
  const ao = await db.eventDay.findFirst({ where: { name: "app_open" } });
  console.log(`app_open now: day=${ao?.day} count=${ao?.count}`);
  const at = await db.quizAttempt.count();
  console.log(`attempts total: ${at}`);
  await db.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
