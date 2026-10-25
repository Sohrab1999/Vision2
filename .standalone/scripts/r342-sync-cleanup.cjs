// r342 — حذفِ ردیفهایِ learnerSyncِ QA (پاکسازیِ اختصاصیِ راند — قراردادِ
//   r101 فقط events/attempts/profiles را میپوشاند؛ sync از آغاز QA-only
//   است: کدِ ساختهشدهٔ شخصیتِ آرش روی ابر نباید بماند).
//   اجرا: node scripts/r342-sync-cleanup.cjs CODE [CODE...]
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const codes = process.argv.slice(2).map((c) => c.toUpperCase());
  if (!codes.length) {
    console.log("usage: node scripts/r342-sync-cleanup.cjs CODE [CODE...]");
    await p.$disconnect();
    process.exit(1);
  }
  const gone = await p.learnerSync.deleteMany({ where: { code: { in: codes } } });
  console.log("learnerSync rows removed:", gone.count, "for codes:", codes.join(","));
  const left = await p.learnerSync.count();
  console.log("learnerSync total remaining:", left);
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
