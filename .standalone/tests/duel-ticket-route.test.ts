// ------------------------------------------------------------------
// Task 112 — shell of the /api/duel-ticket route: authentication,
// judge-secret absence, zod validation, mint round-trip.
// Hermetic (the db handle is mocked; the ticket crypto is real).
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  db: {
    learnerProfile: { findUnique: vi.fn() },
  },
}));

const { ticketSecret } = vi.hoisted(() => ({ ticketSecret: { value: "c".repeat(64) as string | null } }));

vi.mock("@/lib/duel-ticket-server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/duel-ticket-server")>()),
  readTicketSecret: () => ticketSecret.value,
}));

import { db } from "@/lib/db";
import { POST } from "@/app/api/duel-ticket/route";
import { hashSecret } from "@/lib/identity/secret";
import { verifyTicket } from "@/lib/duel-ticket-server";

const mockFindUnique = db.learnerProfile.findUnique as ReturnType<typeof vi.fn>;

function postReq(body: unknown): NextRequest {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: {
      get: (n: string) => (n.toLowerCase() === "content-length" ? String(text.length) : null),
    },
    nextUrl: new URL("http://localhost/api/duel-ticket"),
    text: async () => text,
  } as unknown as NextRequest;
}

const CRED = { userId: "learner-1", secret: "f".repeat(48) };

describe("POST /api/duel-ticket", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    ticketSecret.value = "c".repeat(64);
  });

  it("authenticated learner gets a ticket the judge can verify (real HMAC chain)", async () => {
    mockFindUnique.mockResolvedValue({ secret: hashSecret(CRED.secret) });
    const res = await POST(postReq(CRED));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; ticket: string; ttlMs: number };
    expect(json.ok).toBe(true);
    expect(json.ttlMs).toBe(120_000);
    const verdict = verifyTicket(json.ticket, ticketSecret.value, { now: Date.now() });
    expect(verdict).toMatchObject({ ok: true, uid: CRED.userId });
  });

  it("wrong secret → 403, no ticket", async () => {
    mockFindUnique.mockResolvedValue({ secret: hashSecret(CRED.secret) });
    const res = await POST(postReq({ ...CRED, secret: "0".repeat(48) }));
    expect(res.status).toBe(403);
    const json = (await res.json()) as { ok: boolean; ticket?: string };
    expect(json.ok).toBe(false);
    expect(json.ticket).toBeUndefined();
  });

  it("unregistered learner → 403", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(postReq(CRED));
    expect(res.status).toBe(403);
  });

  it("profile without a secret → 403 (never signed up fully)", async () => {
    mockFindUnique.mockResolvedValue({ secret: null });
    const res = await POST(postReq(CRED));
    expect(res.status).toBe(403);
  });

  it("missing body secret → validation_failed with Persian message", async () => {
    const res = await POST(postReq({ userId: CRED.userId }));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { code: string; error: string };
    expect(json.code).toBe("validation_failed");
    expect(json.error).toContain("امضا");
  });

  it("judge secret absent → 500 with the honest Persian readiness message", async () => {
    mockFindUnique.mockResolvedValue({ secret: hashSecret(CRED.secret) });
    ticketSecret.value = null;
    const res = await POST(postReq(CRED));
    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toContain("سرویس داوری");
  });
});
