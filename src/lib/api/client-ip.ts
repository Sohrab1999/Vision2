import type { NextRequest } from "next/server";

// ------------------------------------------------------------------
// Roadmap Step 5 (audit §10 R-3) — the ONE client-IP extractor.
//
// Deployment reality (audit §2 SEC-2): both services bind 127.0.0.1
// and sit behind Caddy, which OVERWRITES X-Forwarded-For with the real
// remote host on every hop (see Caddyfile header_up). Direct loopback
// calls (QA, health checks) carry no proxy header and collapse into
// the shared "local" bucket — one bucket for the whole machine is the
// intended fail-closed behaviour.
// ------------------------------------------------------------------

/** First XFF hop (Caddy-injected) → X-Real-IP → shared "local" bucket. */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const first = fwd.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip")?.trim() || "local";
}
