import { statSync, appendFileSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, clientErrorSchema } from "@/lib/api/validate";

// ------------------------------------------------------------------
// Task 292 — crash telemetry endpoint.
//   POST { kind, message, stack?, digest?, view?, path? }
// The route-level error boundary (src/app/error.tsx) and the global
// window error/rejection hooks (lib/client-error-reporter) report here.
//
// Why: the QA loop always runs fresh seeded sessions, so a crash that
// only happens with a real learner's long-lived state can never be
// reproduced locally — the user saw the error boundary with nothing
// for us to read. This endpoint turns that dead end into a one-line
// breadcrumb on disk, so the NEXT occurrence carries its own stack.
//
// Storage: append-only JSONL file next to dev.log (NOT db/, NOT .env —
// it is a diagnostic log like any build log). Hard size cap with a
// truncate-on-overflow policy keeps the tree clean. No PII: the
// payload is error-shaped data only, UA is trimmed server-side.
// ------------------------------------------------------------------

const LOG_NAME = "client-errors.log";
const LOG_CAP_BYTES = 512 * 1024; // rotate by truncation — breadcrumbs, not archives

function logPath(): string {
  // env override exists for tests (and for ops that want a tmp dir);
  // default keeps the breadcrumb beside the dev server log.
  return process.env.CLIENT_ERROR_LOG || join(process.cwd(), LOG_NAME);
}

function appendBreadcrumb(line: string): void {
  const p = logPath();
  try {
    const size = statSync(p).size;
    if (size > LOG_CAP_BYTES) {
      // one clean sweep instead of unbounded growth — the newest crash
      // is the one that matters; old ones already had their turn.
      writeFileSync(p, "", "utf8");
    }
  } catch {
    /* missing file → first write creates it */
  }
  appendFileSync(p, line + "\n", "utf8");
}

export const POST = withApi(
  { key: "client-error", limit: { max: 30 }, bodyCap: BODY_CAPS.clientError, schema: clientErrorSchema },
  async ({ parsed, json, req }) => {
    try {
      const ua = (req.headers.get("user-agent") ?? "").slice(0, 200);
      const row = JSON.stringify({
        at: new Date().toISOString(),
        kind: parsed.kind,
        message: parsed.message,
        ...(parsed.stack ? { stack: parsed.stack } : {}),
        ...(parsed.digest ? { digest: parsed.digest } : {}),
        ...(parsed.view ? { view: parsed.view } : {}),
        ...(parsed.path ? { path: parsed.path } : {}),
        ua,
      });
      appendBreadcrumb(row);
    } catch {
      // telemetry must never fail loudly — but a broken disk is worth a 500
      throw ApiError.server("ثبت گزارش خطا ناموفق بود.");
    }
    return json({ ok: true });
  }
);

// ------------------------------------------------------------------
// r350 «نبضِ کامل» — the watchtower read: how many crash breadcrumbs
// has this server collected, and what was the LAST one (kind + trimmed
// message + view). The dual-path lesson (r346): the standalone server
// chdirs into .next/standalone, so THIS server's live log is the one
// its own cwd points at — the root log stays the historical archive.
// No PII beyond what POST already stores (error-shaped data only).
// ------------------------------------------------------------------
export const GET = withApi({ key: "client-error-get", limit: { max: 30 } }, async ({ json }) => {
  try {
    const p = logPath();
    let raw = "";
    try {
      raw = readFileSync(p, "utf8");
    } catch {
      return json({ ok: true, count: 0 }); // missing file — no crash ever recorded
    }
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    const count = lines.length;
    let last: { at: string; kind: string; message: string; view?: string } | undefined;
    if (count > 0) {
      try {
        const parsedLast = JSON.parse(lines[lines.length - 1]) as {
          at?: string; kind?: string; message?: string; view?: string;
        };
        last = {
          at: typeof parsedLast.at === "string" ? parsedLast.at : "",
          kind: typeof parsedLast.kind === "string" ? parsedLast.kind : "unknown",
          message: typeof parsedLast.message === "string" ? parsedLast.message.slice(0, 160) : "",
          ...(typeof parsedLast.view === "string" ? { view: parsedLast.view } : {}),
        };
      } catch {
        // a torn last line (truncation mid-write) — count stays honest, last stays undefined
      }
    }
    return json({ ok: true, count, ...(last ? { last } : {}) });
  } catch {
    throw ApiError.server("خواندنِ نان‌های خطا ناموفق بود.");
  }
});
