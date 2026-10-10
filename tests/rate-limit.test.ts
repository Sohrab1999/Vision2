// Phase-1 «پایداری» — tests for the in-memory sliding-window rate limiter
// that guards the shared class database and the paid TTS backend.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

/** minimal NextRequest-compatible stand-in (only headers.get is used) */
function fakeReq(ip: string): NextRequest {
  return {
    headers: {
      get: (name: string) => (name === "x-forwarded-for" ? ip : null),
    },
  } as unknown as NextRequest;
}

describe("rateLimit — sliding window", () => {
  it("allows up to max requests then blocks with 429 + Retry-After", () => {
    const ip = "10.1.0.1";
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(fakeReq(ip), "test-a", 3, 60_000).ok).toBe(true);
    }
    const verdict = rateLimit(fakeReq(ip), "test-a", 3, 60_000);
    expect(verdict.ok).toBe(false);
    expect(verdict.response?.status).toBe(429);
    expect(verdict.response?.headers.get("Retry-After")).toBeTruthy();
  });

  it("is keyed by route bucket AND client ip", () => {
    expect(rateLimit(fakeReq("10.2.0.1"), "test-b", 1, 60_000).ok).toBe(true);
    // same ip, different bucket → allowed
    expect(rateLimit(fakeReq("10.2.0.1"), "test-c", 1, 60_000).ok).toBe(true);
    // same bucket, different ip → allowed
    expect(rateLimit(fakeReq("10.2.0.2"), "test-b", 1, 60_000).ok).toBe(true);
    // same bucket + same ip over the limit → blocked
    expect(rateLimit(fakeReq("10.2.0.1"), "test-b", 1, 60_000).ok).toBe(false);
  });

  it("takes the first x-forwarded-for hop behind a proxy chain", () => {
    const req = {
      headers: { get: (n: string) => (n === "x-forwarded-for" ? "10.3.0.9, 172.16.0.1" : null) },
    } as unknown as NextRequest;
    expect(rateLimit(req, "test-d", 1, 60_000).ok).toBe(true);
    expect(rateLimit(fakeReq("10.3.0.9"), "test-d", 1, 60_000).ok).toBe(false);
  });

  it("expires entries after the window passes (fake timers)", () => {
    vi.useFakeTimers();
    try {
      const ip = "10.4.0.1";
      expect(rateLimit(fakeReq(ip), "test-e", 1, 1_000).ok).toBe(true);
      expect(rateLimit(fakeReq(ip), "test-e", 1, 1_000).ok).toBe(false);
      vi.advanceTimersByTime(1_100);
      expect(rateLimit(fakeReq(ip), "test-e", 1, 1_000).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});