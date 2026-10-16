import { NextResponse } from "next/server";

// ------------------------------------------------------------------
// Client-crash report sink (companion to the route error boundary).
// Until now the boundary's console.error stayed in the learner's
// browser, so a client-side crash left no trace on the server — the
// 2026-10-16 incident (user saw «این صفحهٔ کتاب باز نشد!» while
// dev.log was all-200) proved the gap. This endpoint forwards the
// crash into the server log where the QA rounds actually look.
//
// Privacy & bounds: no PII, no DB write — stdout only; message/stack/
// href are hard-truncated and the JSON parse is guarded, because a
// crash reporter must never become a crash source of its own.
// ------------------------------------------------------------------

const cap = (v: unknown, n: number): string =>
  typeof v === "string" ? v.slice(0, n) : "";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const message = cap(body.message, 300) || "(no message)";
    const stack = cap(body.stack, 1500);
    const digest = cap(body.digest, 64);
    const href = cap(body.href, 200);
    console.error(
      `[client-error] ${message}`
        + (digest ? ` (digest: ${digest})` : "")
        + (href ? ` @ ${href}` : "")
        + (stack ? `\n${stack}` : ""),
    );
  } catch {
    // malformed report → still ack, never throw from a crash sink
  }
  return new NextResponse(null, { status: 204 });
}
