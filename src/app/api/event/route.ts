import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, eventSchema } from "@/lib/api/validate";
import { isEventName, EVENT_LABELS_FA } from "@/lib/analytics-events";

// ------------------------------------------------------------------
// F10 — lightweight analytics endpoint.
//   POST { name } → increment the (day, name) counter (whitelist only)
//   GET           → aggregate summary for the internal live dashboard
// Privacy: no PII, no user ids — only anonymous counters per UTC day.
// Roadmap Step 5: validation + rate limit + error shape moved to withApi.
// ------------------------------------------------------------------

const utcDay = () => new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------
// Phase-2 «تجربه» — archive rotation. Raw (day, name) rows older than
// KEEP_DAYS are folded once into per-name "archive" sentinel rows
// (day = "archive"), so all-time totals stay exact forever while the
// table stays bounded. "archive" sorts AFTER every "YYYY-MM-DD" string
// in SQLite (a > 2), so `day < cutoff` never touches archive rows.
// ------------------------------------------------------------------
const ARCHIVE_DAY = "archive";
const KEEP_DAYS = 60;
let lastRotate = 0;

async function rotateArchive(): Promise<void> {
  if (Date.now() - lastRotate < 60 * 60_000) return; // at most once per hour
  lastRotate = Date.now();
  try {
    const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
    const old = await db.eventDay.findMany({ where: { day: { lt: cutoff } } });
    if (old.length === 0) return;
    const sums = new Map<string, number>();
    for (const row of old) sums.set(row.name, (sums.get(row.name) ?? 0) + row.count);
    for (const [name, count] of sums) {
      await db.eventDay.upsert({
        where: { day_name: { day: ARCHIVE_DAY, name } },
        update: { count: { increment: count } },
        create: { day: ARCHIVE_DAY, name, count },
      });
    }
    await db.eventDay.deleteMany({ where: { day: { lt: cutoff } } });
  } catch (error) {
    // rotation is housekeeping — never break the request that triggered it
    console.error("EventDay archive rotation failed:", error);
  }
}

export const POST = withApi(
  { key: "event-post", limit: { max: 120 }, bodyCap: BODY_CAPS.event, schema: eventSchema },
  async ({ parsed, json }) => {
    if (!isEventName(parsed.name)) {
      throw ApiError.bad("رویداد ناشناخته است.");
    }
    try {
      await db.eventDay.upsert({
        where: { day_name: { day: utcDay(), name: parsed.name } },
        update: { count: { increment: 1 } },
        create: { day: utcDay(), name: parsed.name, count: 1 },
      });
    } catch {
      throw ApiError.server("ثبت رویداد ناموفق بود.");
    }
    return json({ ok: true });
  }
);

export const GET = withApi({ key: "event-get", limit: { max: 30 } }, async ({ json }) => {
  // housekeeping — throttled internally, never throws
  void rotateArchive();

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    // NOTE: the all-time aggregate intentionally includes the "archive"
    // sentinel rows (totals stay exact after rotation), while the week
    // window must exclude them — lexicographically "archive" >= any date.
    const [all, week] = await Promise.all([
      db.eventDay.groupBy({ by: ["name"], _sum: { count: true } }),
      db.eventDay.groupBy({
        by: ["name"],
        where: { day: { gte: weekAgo, not: ARCHIVE_DAY } },
        _sum: { count: true },
      }),
    ]);
    const weekMap = new Map(week.map((r) => [r.name, r._sum.count ?? 0]));
    const events = all
      .map((r) => ({
        name: r.name,
        label: isEventName(r.name) ? EVENT_LABELS_FA[r.name] : r.name,
        total: r._sum.count ?? 0,
        week: weekMap.get(r.name) ?? 0,
      }))
      .sort((a, b) => b.total - a.total);
    return json({ events, updatedAt: new Date().toISOString() });
  } catch {
    throw ApiError.server("خلاصهٔ آمار در دسترس نیست.");
  }
});
