import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ZodType, ZodSafeParseResult } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "./client-ip";
import { ApiError, apiErrorResponse } from "./errors";

// ------------------------------------------------------------------
// Roadmap Step 5 (audit §10 R-3) — the API composition root.
//
// One wrapper replaces the 13 hand-rolled preambles: size cap →
// rate limit → parse → zod → handler → one catch. Every route now
// fails with the same wire shape and a machine-readable code, and a
// giant body is rejected at the Content-Length header BEFORE it is
// ever parsed into memory (Next 16 route handlers have no default
// JSON limit — audit §7 SEC-2).
//
//   export const GET = withApi({ key: "lb-get", limit: { max: 240 } }, async () => {...});
//
// Handlers receive typed `parsed` data and signal failure by throwing
// ApiError; anything else becomes a logged 500 with code server_error.
// ------------------------------------------------------------------

export interface ApiContext<T> {
  req: NextRequest;
  /** client ip as computed by the shared extractor (rate-limit parity) */
  ip: string;
  /** zod output — POST body when `schema` is set, GET query when `query` is set */
  parsed: T;
  /** uniform success helper (just NextResponse.json, kept for symmetry) */
  json: (data: unknown, init?: ResponseInit) => NextResponse;
}

export interface WithApiSpec<T> {
  /** rate-limit bucket key — also used as the log prefix for 500s */
  key: string;
  /** omit → no automatic limit (routes that limit conditionally, e.g. TTS/explain, do it themselves) */
  limit?: { max: number; windowMs?: number };
  /**
   * POST body ceiling in bytes. Checked first against Content-Length
   * (reject before reading anything), then against the fully-read text
   * (chunked uploads without a length header). Defaults to DEFAULT_BODY_CAP.
   */
  bodyCap?: number;
  /** zod schema for the JSON body (POST) */
  schema?: ZodType<T>;
  /** zod schema for the query string (GET) */
  query?: ZodType<T>;
}

/** 64 KB is plenty for every route except /api/sync (600 KB snapshots). */
export const DEFAULT_BODY_CAP = 64 * 1024;

/** first zod issue → one short Persian message (zod internals never leak) */
export function firstIssueMessage(result: ZodSafeParseResult<unknown>): string {
  const issue = result.error?.issues[0];
  return issue?.message ?? "داده‌های ارسالی با قالب مورد انتظار سازگار نیست.";
}

function rejectTooLarge(): ApiError {
  return ApiError.tooLarge();
}

async function readBodyWithCap(req: NextRequest, cap: number): Promise<string> {
  const declared = req.headers.get("content-length");
  if (declared) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > cap) throw rejectTooLarge();
  }
  const text = await req.text();
  // UTF-8 multibyte (Persian) can double the byte count vs .length — keep headroom
  if (text.length > cap) throw rejectTooLarge();
  return text;
}

export function withApi<T = undefined>(
  spec: WithApiSpec<T>,
  handler: (ctx: ApiContext<T>) => Promise<Response> | Response
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest): Promise<Response> => {
    const isGet = req.method === "GET" || req.method === "HEAD";
    const cap = spec.bodyCap ?? DEFAULT_BODY_CAP;
    try {
      // 1) rate limit — before any parsing work (unless the route opts out)
      if (spec.limit) {
        const verdict = rateLimit(req, spec.key, spec.limit.max, spec.limit.windowMs ?? 60_000);
        if (!verdict.ok) {
          return verdict.response!;
        }
      }

      let parsed: T = undefined as T;

      if (spec.query) {
        // GET: validate the query string
        const obj = Object.fromEntries(req.nextUrl.searchParams.entries());
        const res = spec.query.safeParse(obj);
        if (!res.success) throw ApiError.validation(firstIssueMessage(res));
        parsed = res.data;
      } else if (spec.schema) {
        // POST: cap → read → parse → validate
        const text = await readBodyWithCap(req, cap);
        let raw: unknown;
        try {
          raw = JSON.parse(text);
        } catch {
          throw new ApiError(400, "invalid_json");
        }
        const res = spec.schema.safeParse(raw);
        if (!res.success) throw ApiError.validation(firstIssueMessage(res));
        parsed = res.data;
      } else if (!isGet) {
        // no schema, no cap interest — still guard the JSON parse for POSTs
        const text = await readBodyWithCap(req, cap);
        let raw: unknown;
        try {
          raw = JSON.parse(text);
        } catch {
          throw new ApiError(400, "invalid_json");
        }
        parsed = raw as T;
      }

      // 2) the route itself
      return await handler({
        req,
        ip: clientIp(req),
        parsed,
        json: (data, init) => NextResponse.json(data, init),
      });
    } catch (error) {
      if (error instanceof ApiError) return apiErrorResponse(error);
      // unknown failure — log with the route key, answer with the one shape
      console.error(`[api:${spec.key}]`, error);
      return apiErrorResponse(ApiError.server());
    }
  };
}
