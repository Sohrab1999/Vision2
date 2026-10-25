/* QA cleanup: remove the QA learner created by agent-browser today (u-mv4s4eu8). */
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const QA_ID = "u-mv4s4eu8-effea3ccf8bac9ab";
(async () => {
  const models = Object.keys(p).filter(
    (k) => p[k] && typeof p[k].deleteMany === "function" && !k.startsWith("_") && k !== "prismaClient",
  );
  for (const m of models) {
    try {
      const r = await p[m].deleteMany({ where: { userId: QA_ID } });
      if (r.count > 0) console.log(`deleted ${r.count} row(s) from ${m}`);
    } catch {
      /* model has no userId column — skip */
    }
  }
  try {
    const lp = await p.learnerProfile.deleteMany({ where: { userId: QA_ID } });
    console.log(`deleted ${lp.count} learnerProfile row(s)`);
  } catch (e) {
    console.error("learnerProfile:", e.message);
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
