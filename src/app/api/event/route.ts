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

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const [all, week] = await Promise.all([
      db.eventDay.groupBy({ by: ["name"], _sum: { count: true } }),
      db.eventDay.groupBy({ by: ["name"], where: { day: { gte: weekAgo } }, _sum: { count: true } }),
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
