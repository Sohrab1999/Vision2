// ------------------------------------------------------------------
// Task 112 «بلیتِ ورود» — قراردادِ خالصِ بلیت + گنبدِ nonce + زنجیرهٔ
// crypto (mint→verify): ساختار، امضا، پنجرهٔ ۱۲۰ثانیه‌ای، یک‌بارمصرف،
// capِ fail-closed و مرزهای منقضی. الگوی duel-receipt.test.
// ------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest";
import {
  TICKET_TTL_MS,
  canonicalTicketString,
  ticketIsShaped,
  ticketRejectMessage,
  createTicketVault,
  type TicketPayload,
} from "@/lib/duel-ticket";
import { mintTicket, verifyTicket } from "@/lib/duel-ticket-server";

const SECRET = "a".repeat(64);

describe("ticket vault (one-time nonce)", () => {
  it("first consume is true, immediate replay is false", () => {
    const v = createTicketVault({ now: () => 1_000 });
    expect(v.consume("aaaaaaaaaaaa")).toBe(true);
    expect(v.consume("aaaaaaaaaaaa")).toBe(false);
    expect(v.size()).toBe(1);
  });

  it("nonce becomes usable again only after TTL — via sweep, not consume", () => {
    let t = 1_000;
    const v = createTicketVault({ now: () => t });
    expect(v.consume("bbbbbbbbbbbb")).toBe(true);
    t = 1_000 + TICKET_TTL_MS - 1;
    expect(v.consume("bbbbbbbbbbbb")).toBe(false); // هنوز در پنجره
    expect(v.sweep()).toBe(0); // هنوز نه مُرده است
    t = 1_000 + TICKET_TTL_MS;
    expect(v.sweep()).toBe(1); // حالا مُرده — sweep جمعش کرد
    expect(v.consume("bbbbbbbbbbbb")).toBe(true);
  });

  it("sweep removes only expired nonces and reports the count", () => {
    let t = 5_000;
    const v = createTicketVault({ now: () => t });
    v.consume("cccccccccccc");
    t = 5_000 + 10;
    v.consume("dddddddddddd");
    t = 5_000 + TICKET_TTL_MS + 5;
    expect(v.sweep()).toBe(1); // فقط اولی مُرده است
    expect(v.size()).toBe(1);
    expect(v.sweep()).toBe(0);
  });

  it("distinct nonces never collide inside the window", () => {
    const v = createTicketVault({ now: () => 7_000 });
    expect(v.consume("e1aaaaaaaa")).toBe(true);
    expect(v.consume("e2aaaaaaaa")).toBe(true);
    expect(v.consume("e1aaaaaaaa")).toBe(false);
    expect(v.consume("e2aaaaaaaa")).toBe(false);
  });

  it("cap is fail-closed: beyond cap new consumes are rejected", () => {
    const v = createTicketVault({ now: () => 1, cap: 2 });
    expect(v.consume("111111111111")).toBe(true);
    expect(v.consume("222222222222")).toBe(true);
    expect(v.consume("333333333333")).toBe(false); // لبریز — رد
    expect(v.consume("111111111111")).toBe(false); // ثبتِ قبلی سالم مانده
  });

  it("reaching cap frees expired entries on consume (self-heal)", () => {
    let t = 1;
    const v = createTicketVault({ now: () => t, cap: 2 });
    v.consume("444444444444");
    v.consume("555555555555");
    t = 1 + TICKET_TTL_MS; // اولی مُرده؛ دومی هم مرز
    expect(v.consume("666666666666")).toBe(true); // پیرایش جا باز کرد
  });
});

describe("ticket contract", () => {
  const sample: TicketPayload = { uid: "u-123", exp: 1_800_000_000_000, n: "0123456789ab" };

  it("canonical string is deterministic and receipt-family shaped", () => {
    expect(canonicalTicketString(sample)).toBe("t1|u-123|1800000000000|0123456789ab");
    expect(canonicalTicketString(sample)).toBe(canonicalTicketString({ ...sample }));
  });

  it("shape guard accepts the honest payload", () => {
    expect(ticketIsShaped(sample)).toBe(true);
  });

  it("shape guard kills junk in every field", () => {
    expect(ticketIsShaped(null)).toBe(false);
    expect(ticketIsShaped("t1|u|1|n")).toBe(false);
    expect(ticketIsShaped({ ...sample, uid: "" })).toBe(false);
    expect(ticketIsShaped({ ...sample, uid: "x".repeat(65) })).toBe(false);
    expect(ticketIsShaped({ ...sample, exp: 1.5 })).toBe(false);
    expect(ticketIsShaped({ ...sample, exp: -5 })).toBe(false);
    expect(ticketIsShaped({ ...sample, n: "0123456789aZ" })).toBe(false); // غیر hex
    expect(ticketIsShaped({ ...sample, n: "0123456789a" })).toBe(false); // کوتاه
    expect(ticketIsShaped({ uid: "u", exp: 1 })).toBe(false); // nonce غایب
  });

  it("reject messages: expired is honest, the rest one guard family", () => {
    expect(ticketRejectMessage("expired")).toContain("منقضی");
    expect(ticketRejectMessage("malformed")).toBe(ticketRejectMessage("bad_sig"));
    expect(ticketRejectMessage("replayed")).toBe(ticketRejectMessage("malformed"));
  });
});

describe("mint → verify (crypto chain)", () => {
  it("round-trips uid and a hex12 nonce", () => {
    const { token } = mintTicket("learner-9", SECRET, 1_000);
    const v = verifyTicket(token, SECRET, { now: 1_050 });
    expect(v).toEqual({ ok: true, uid: "learner-9", n: expect.stringMatching(/^[0-9a-f]{12}$/) });
  });

  it("declares the TTL it signed (120s)", () => {
    expect(mintTicket("u", SECRET).ttlMs).toBe(TICKET_TTL_MS);
  });

  it("tampered payload dies on bad_sig (uid flip)", () => {
    const { token } = mintTicket("learner-9", SECRET, 1_000);
    const dot = token.indexOf(".");
    const json = JSON.parse(Buffer.from(token.slice(0, dot), "base64url").toString("utf8"));
    json.uid = "attacker";
    const forged = `${Buffer.from(JSON.stringify(json)).toString("base64url")}.${token.slice(dot + 1)}`;
    expect(verifyTicket(forged, SECRET)).toEqual({ ok: false, reason: "bad_sig" });
  });

  it("tampered signature dies on bad_sig (conditional flip — the task-111 flake lesson)", () => {
    const { token } = mintTicket("u", SECRET, 1_000);
    const dot = token.indexOf(".");
    const sig = token.slice(dot + 1);
    const flipped = sig[0] === "0" ? `1${sig.slice(1)}` : `0${sig.slice(1)}`;
    expect(verifyTicket(`${token.slice(0, dot)}.${flipped}`, SECRET)).toEqual({ ok: false, reason: "bad_sig" });
  });

  it("wrong secret dies on bad_sig", () => {
    const { token } = mintTicket("u", SECRET, 1_000);
    expect(verifyTicket(token, "b".repeat(64))).toEqual({ ok: false, reason: "bad_sig" });
  });

  it("expiry boundary: alive at exp-1, dead at exp", () => {
    const t0 = 50_000;
    const { token } = mintTicket("u", SECRET, t0);
    const exp = t0 + TICKET_TTL_MS;
    expect(verifyTicket(token, SECRET, { now: exp - 1 }).ok).toBe(true);
    expect(verifyTicket(token, SECRET, { now: exp })).toEqual({ ok: false, reason: "expired" });
  });

  it("malformed tokens never reach the signature", () => {
    expect(verifyTicket(null, SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyTicket(42, SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyTicket("", SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyTicket("nodot", SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyTicket(".sig", SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyTicket("payload.", SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyTicket("!!!.sig", SECRET)).toEqual({ ok: false, reason: "malformed" }); // b64url خراب → JSON نه
    expect(verifyTicket(`${Buffer.from("[]").toString("base64url")}.00`, SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyTicket(`x.${"0".repeat(600)}`, SECRET)).toEqual({ ok: false, reason: "malformed" }); // سقفِ ۵۱۲
  });

  it("null secret (judge not booted) is bad_sig — fail-closed", () => {
    const { token } = mintTicket("u", SECRET, 1_000);
    expect(verifyTicket(token, null)).toEqual({ ok: false, reason: "bad_sig" });
  });

  it("mint is random: two calls give two distinct nonces", () => {
    const a = mintTicket("u", SECRET, 1_000).token;
    const b = mintTicket("u", SECRET, 1_000).token;
    expect(a).not.toBe(b);
  });
});
