import { statSync, appendFileSync, writeFileSync } from "node:fs";
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
