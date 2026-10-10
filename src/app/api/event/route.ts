import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { isEventName, EVENT_LABELS_FA } from "@/lib/analytics-events";

// ------------------------------------------------------------------
// F10 — lightweight analytics endpoint.
//   POST { name } → increment the (day, name) counter (whitelist only)
//   GET           → aggregate summary for the internal live dashboard
// Privacy: no PII, no user ids — only anonymous counters per UTC day.
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

export async function POST(req: NextRequest) {
  const verdict = rateLimit(req, "event-post", 120, 60_000);
  if (!verdict.ok) return verdict.response!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }
  const rec = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = rec["name"];
  if (!isEventName(name)) {
    return NextResponse.json({ error: "رویداد ناشناخته است." }, { status: 400 });
  }

  try {
    await db.eventDay.upsert({
      where: { day_name: { day: utcDay(), name } },
      update: { count: { increment: 1 } },
      create: { day: utcDay(), name, count: 1 },
    });
  } catch {
    return NextResponse.json({ error: "ثبت رویداد ناموفق بود." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const verdict = rateLimit(req, "event-get", 30, 60_000);
  if (!verdict.ok) return verdict.response!;

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
    return NextResponse.json({ events, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "خلاصهٔ آمار در دسترس نیست." }, { status: 500 });
  }
}
