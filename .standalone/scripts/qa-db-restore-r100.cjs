// Task 100 — restore app_open baseline (QA reloads only; zero other writes)
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const r = await p.eventDay.updateMany({ where: { day: "2026-10-13", name: "app_open" }, data: { count: 2 } });
  console.log("updated:", r.count);
  const evs = await p.eventDay.findMany({ where: { day: "2026-10-13" } });
  console.log("EventDay(today):", JSON.stringify(evs));
  await p.$disconnect();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
