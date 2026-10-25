"use client";

// ------------------------------------------------------------------
// Task 292 — crash telemetry, learner side.
//
// The QA loop can never reproduce a crash that only happens with a
// real learner's long-lived localStorage (r292: the user hit the
// error boundary and we had NOTHING to read — no console access, no
// digest in dev). This reporter closes that gap:
//
//   • error boundary (src/app/error.tsx) calls reportClientError()
//   • global window "error" + "unhandledrejection" hooks installed
//     once by the study shell catch everything the boundary can't
//
// Contracts:
//   • fire-and-forget — telemetry NEVER throws, awaits, or retries;
//     a dead endpoint must stay invisible to the learner
//   • deduped per session by kind+message-prefix (a crashed render
//     loop can hammer the boundary dozens of times per second)
//   • hard session cap (20) — breadcrumbs, not a log dump
//   • payload bounded by the server schema too (defense in depth)
// ------------------------------------------------------------------

const MAX_REPORTS_PER_SESSION = 20;
const DEDUPE_KEY_LEN = 120;

import { useStudy } from "@/lib/study-store";
import { healChunkFailure, isChunkLoadFailure } from "@/lib/chunk-heal";

let installed = false;
let sent = 0;
const seen = new Set<string>();

export interface ClientErrorReport {
  kind: "boundary" | "error" | "rejection";
  message: string;
  stack?: string;
  digest?: string;
  /** current study view id — tells us WHERE the crash lived */
  view?: string;
  path?: string;
}

function currentView(): string | undefined {
  try {
    // synchronous store read — never throws; tells us WHICH view crashed
    const v = useStudy.getState().view;
    return v && typeof v.type === "string" ? v.type : undefined;
  } catch {
    return undefined;
  }
}

/** one bounded POST — never awaited, never throws */
function send(report: ClientErrorReport): void {
  if (sent >= MAX_REPORTS_PER_SESSION) return;
  const key = `${report.kind}:${report.message.slice(0, DEDUPE_KEY_LEN)}`;
  if (seen.has(key)) return;
  seen.add(key);
  sent += 1;
  try {
    const payload: ClientErrorReport = {
      ...report,
      message: report.message.slice(0, 500),
      stack: report.stack?.slice(0, 4_000),
      path: typeof window === "undefined" ? undefined : window.location.pathname,
      view: report.view ?? currentView(),
    };
    void fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* telemetry never breaks the app */
  }
}

/** for the error boundary — the one caller that already has the Error */
export function reportClientError(report: ClientErrorReport): void {
  send(report);
}

/** r346 — the captured real-world ChunkLoadError arrived as kind:"error"
 *  (window hook), NOT kind:"boundary": chunk failures from event-handler
 *  imports and unhandled promise rejections never reach a React boundary,
 *  so Task 293's boundary-only heal left them stranded (reported but never
 *  reloaded). The evidence-first contract is preserved — send() posts the
 *  keepalive breadcrumb BEFORE the heal navigates away — and the 60s
 *  sessionStorage window inside healChunkFailure makes every path
 *  (boundary + both hooks) mutually idempotent, so a storm of hooks firing
 *  for one crash heals at most once. */
function maybeHeal(...parts: (string | undefined)[]): void {
  try {
    if (isChunkLoadFailure(parts.filter(Boolean).join("\n"))) healChunkFailure();
  } catch {
    /* the net never becomes the crash */
  }
}

/** install the global nets exactly once (shell mount) */
export function installClientErrorReporter(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) => {
    // resource-load failures (img/script) also land here with no error obj
    const err = e.error;
    const message = err?.message || e.message || "unknown window error";
    send({
      kind: "error",
      message,
      stack: err?.stack,
    });
    // r346 — the real captured crash walked exactly this leg: ChunkLoadError
    // on the preview proxy, kind:"error", view:"home". Report first (the
    // keepalive breadcrumb survives the reload), then heal.
    maybeHeal(message, err?.stack);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const r = (e as PromiseRejectionEvent).reason;
    const message =
      r instanceof Error ? r.message : String(r ?? "unknown rejection").slice(0, 500);
    send({
      kind: "rejection",
      message,
      stack: r instanceof Error ? r.stack : undefined,
    });
    // r346 — a failed dynamic import() rejects with no boundary in sight
    // (event-handler imports, prefetch races): same stale-chunk family,
    // same one-shot heal.
    maybeHeal(message, r instanceof Error ? r.stack : undefined);
  });
}
