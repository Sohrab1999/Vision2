const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const rows = await p.eventDay.findMany({ orderBy: [{ day: "asc" }, { name: "asc" }] });
  for (const r of rows) console.log(`${r.day} ${r.name}=${r.count}`);
  console.log(Object.keys(p).filter(k => typeof p[k]?.count === "function").join(",") || "no-count-models");
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
