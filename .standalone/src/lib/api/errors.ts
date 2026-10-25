import { NextResponse } from "next/server";

// ------------------------------------------------------------------
// Roadmap Step 5 (audit §10 R-3) — ONE error shape for all 9 routes.
//
// Before: 13 rate-limit preambles + 3 secret-check variants + 2 error
// languages (Persian prose AND bare English like "invalid payload")
// with no machine-readable codes. Now every error response is
//   { ok: false, code: <ApiErrorCode>, error: <fa message> }
// and route handlers signal failure by THROWING an ApiError — the
// withApi wrapper (handler.ts) turns it into the shape below.
// Adding a field here is additive for clients: they only ever read
// `error` (see src/lib/sync.ts), `code` is for tooling and tests.
// ------------------------------------------------------------------

export type ApiErrorCode =
  | "bad_request" // malformed envelope / missing parameter
  | "invalid_json" // body is not parseable JSON
  | "validation_failed" // zod schema rejected the payload
  | "payload_too_large" // Content-Length / text length over the route cap
  | "rate_limited" // sliding-window bucket exhausted (429)
  | "unauthorized" // missing / wrong learner signature (403)
  | "not_found" // unknown resource id (404)
  | "server_error"; // unexpected failure (500)

export const API_ERROR_FA: Record<ApiErrorCode, string> = {
  bad_request: "درخواست نامعتبر است.",
  invalid_json: "بدنهٔ درخواست قابل خواندن نیست.",
  validation_failed: "داده‌های ارسالی با قالب مورد انتظار سازگار نیست.",
  payload_too_large: "حجم درخواست بیش از حد مجاز است.",
  rate_limited: "درخواست‌های خیلی زیاد — کمی صبر کن.",
  unauthorized: "امضای نامعتبر است.",
  not_found: "منبعی با این مشخصات پیدا نشد.",
  server_error: "خطای سرور — دوباره تلاش کن.",
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message?: string) {
    super(message ?? API_ERROR_FA[code]);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  static bad(message?: string) {
    return new ApiError(400, "bad_request", message);
  }
  static validation(message?: string) {
    return new ApiError(400, "validation_failed", message);
  }
  static unauthorized(message?: string) {
    return new ApiError(403, "unauthorized", message);
  }
  static notFound(message?: string) {
    return new ApiError(404, "not_found", message);
  }
  static tooLarge(message?: string) {
    return new ApiError(413, "payload_too_large", message);
  }
  static rateLimited(message: string, retryAfterSec: number) {
    const err = new ApiError(429, "rate_limited", message);
    err.retryAfterSec = retryAfterSec;
    return err;
  }
  static server(message?: string) {
    return new ApiError(500, "server_error", message);
  }

  /** seconds the client should wait before retrying (429 only) */
  retryAfterSec?: number;
}

/** Serialize an ApiError into the single wire shape (with Retry-After on 429). */
export function apiErrorResponse(err: ApiError): NextResponse {
  const headers: Record<string, string> = {};
  if (err.status === 429) {
    headers["Retry-After"] = String(Math.max(1, err.retryAfterSec ?? 1));
  }
  return NextResponse.json(
    { ok: false as const, code: err.code, error: err.message },
    { status: err.status, headers }
  );
}
