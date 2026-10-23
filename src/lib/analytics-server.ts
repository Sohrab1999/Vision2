// ------------------------------------------------------------------
// F10 — server-side event counter (used by API routes themselves,
// e.g. explain cache hits). Fire-and-forget: analytics must never
// break the response it travels alongside.
// ------------------------------------------------------------------

import { db } from "./db";

const utcDay = () => new Date().toISOString().slice(0, 10);

export function trackEventServer(name: string): void {
  // r358 — the best-effort contract now holds against SYNC failures too:
  // a missing/unmocked db (db.eventDay undefined) used to escape as a
  // synchronous TypeError and take the response down with it (the r347
  // TTS route caught this live). Analytics fails SILENT — the sibling of
  // the meter's fails-OPEN rule: availability beats accounting.
  try {
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
  } catch {
    /* analytics is best-effort — never break the response it rides */
  }
}
