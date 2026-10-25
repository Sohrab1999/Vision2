// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 112 «بلیتِ ورود» — دستیارِ کلاینتِ mintDuelTicket:
//   ① هویتِ موجود → POST /api/duel-ticket با جفتِ احراز → رشتهٔ بلیت
//   ② ردِ سرور / JSONِ خراب / شبکهٔ مرده / بی‌هویتی → nullِ صادق
//   ③ بلیت هرگز ذخیره نمی‌شود — فقط حافظهٔ برگشتی
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useStudy } from "@/lib/study-store";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { mintDuelTicket } from "@/lib/identity";

const ID = { userId: "qa-ticket-learner", secret: "e".repeat(48) };

beforeEach(() => {
  fetchMock.mockReset();
  useStudy.setState({ userId: ID.userId, userSecret: ID.secret });
});

afterEach(() => {
  useStudy.setState({ userId: undefined, userSecret: undefined });
});

describe("mintDuelTicket", () => {
  it("posts the learner pair to /api/duel-ticket and resolves the ticket string", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, ticket: "tok.abc", ttlMs: 120_000 }), { status: 200 })
    );
    const ticket = await mintDuelTicket();
    expect(ticket).toBe("tok.abc");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/duel-ticket");
    expect(JSON.parse(String(init.body))).toEqual({ userId: ID.userId, secret: ID.secret });
  });

  it("server rejection (403) → null", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 403 })
    );
    expect(await mintDuelTicket()).toBeNull();
  });

  it("ok status with junk body → null (ticket must be a non-empty string)", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    expect(await mintDuelTicket()).toBeNull();
  });

  it("dead network → null, never throws", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(await mintDuelTicket()).toBeNull();
  });

  it("no identity and registration fails → null with only the register call", async () => {
    useStudy.setState({ userId: undefined, userSecret: undefined });
    fetchMock.mockResolvedValue(new Response("nope", { status: 500 }));
    expect(await mintDuelTicket()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/register");
  });
});
