// ------------------------------------------------------------------
// F10 — server-side event counter (used by API routes themselves,
// e.g. explain cache hits). Fire-and-forget: analytics must never
// break the response it travels alongside.
// ------------------------------------------------------------------

import { db } from "./db";

const utcDay = () => new Date().toISOString().slice(0, 10);

export function trackEventServer(name: string): void {
  const day = utcDay();
  db.eventDay
    .upsert({
      where: { day_name: { day, name } },
      update: { count: { increment: 1 } },
      create: { day, name, count: 1 },
    })
    .catch(() => {
      /* analytics is best-effort */
    });
}
