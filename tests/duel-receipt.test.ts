// ------------------------------------------------------------------
// Task 94 «رسیدِ امضاشدهٔ داوری» — قرارداد رسید دودل.
//
// قفل‌ها:
//   ① عینِ امضا قطعی است (canonical همان ورودی → همان sig) و هر دست‌کاریِ
//     یک فیلد امضا را می‌شکند (بدون نیاز به دانستن الگوریتم)
//   ② ساختار خراب قبل از HMAC رد می‌شود (malformed)
//   ③ ادعا باید داخل رسید candidate داشته باشد: نام + امتیاز + تعداد درست
//   ④ outcome با داوری هم‌خوان باشد — بردِ باخته/مساویِ نابرابر رد می‌شود
//   ⑤ پنجرهٔ زمانی: رسیدِ آینده یا کهنه‌تر از ۲۴ ساعت stale
//   ⑥ پاریتیِ duelDisplayName با readProfile سرویس (کلیدِ candidate)
//   ⑦ roundtrip فایل راز (ساخت → خواندن) در cwd ایزولهٔ تست
// ------------------------------------------------------------------

import { describe, it, expect, afterEach } from "vitest";
import { rmSync } from "node:fs";
import { join } from "node:path";

import {
  canonicalReceiptString,
  duelDisplayName,
  judgeReceiptShape,
  receiptIsShaped,
  type DuelReceipt,
} from "@/lib/duel-receipt";
import {
  loadOrCreateReceiptSecret,
  readReceiptSecret,
  signDuelEnd,
  verifyDuelSubmission,
} from "@/lib/duel-receipt-server";

const SECRET = "a".repeat(64);

// captured ONCE per test run — every fixture shares it so two signedFixture()
// calls stay byte-identical (sig determinism) AND sit inside the 24h window
const T0 = Date.now();

function signedFixture(over: Partial<Parameters<typeof signDuelEnd>[0]> = {}, secret = SECRET): DuelReceipt {
  return signDuelEnd(
    {
      code: "W248Y",
      startedAt: T0 - 90_000,
      endedAt: T0 - 5_000,
      reason: "finished",
      winner: "sid-a",
      players: [
        { sid: "sid-a", name: "آرش", score: 194, correct: 9 },
        { sid: "sid-b", name: "سارا", score: 190, correct: 8 },
      ],
      ...over,
    },
    secret
  );
}

const probeA = { name: "آرش", score: 194, correct: 9, outcome: "win" as const };

describe("رسید داوری — امضا و کانونی‌کال", () => {
  it("عینِ امضا قطعی است: همان ورودی → همان canonical → همان sig", () => {
    const a = signedFixture();
    const b = signedFixture();
    expect(a.sig).toBe(b.sig);
    expect(canonicalReceiptString(a)).toBe(canonicalReceiptString(b));
    expect(a.sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verify happy path: برنده با نام/امتیاز/درستِ خودش قبول می‌شود (win و tie و loss)", () => {
    expect(verifyDuelSubmission(signedFixture(), probeA, SECRET)).toEqual({ ok: true });
    // loss از زبان بازنده
    expect(
      verifyDuelSubmission(signedFixture(), { name: "سارا", score: 190, correct: 8, outcome: "loss" }, SECRET)
    ).toEqual({ ok: true });
    // tie روی مسابقهٔ مساوی
    const tie = signedFixture({ winner: null, players: [
      { sid: "sid-a", name: "آرش", score: 190, correct: 8 },
      { sid: "sid-b", name: "سارا", score: 190, correct: 8 },
    ] });
    expect(
      verifyDuelSubmission(tie, { name: "آرش", score: 190, correct: 8, outcome: "tie" }, SECRET)
    ).toEqual({ ok: true });
  });

  it("دست‌کاریِ یک فیلد امضا را می‌شکند — حتی بدون دانستن راز", () => {
    const receipt = signedFixture();
    const tampered: DuelReceipt = {
      ...receipt,
      players: [receipt.players[0], { ...receipt.players[1], score: 999 }],
    };
    expect(verifyDuelSubmission(tampered, probeA, SECRET)).toEqual({ ok: false, reason: "bad_sig" });
    // خودِ sig دست‌کاری‌شده — اولین رقم به نویسه‌ای «قطعاً متفاوت» فلیپ می‌شود
    // (درسِ ۱۱۱: اگر اولین رقمِ sig اصلی «0» باشد — با شانسِ ~۱/۱۶ در هر اجرا،
    // چون T0=Date.now امضا را جابه‌جا می‌کند — جایگزینیِ کور با «0» هیچ دست‌کاری
    // نمی‌کرد و تستِ خودش را فِلِیک می‌داد)
    const flipped = receipt.sig[0] === "0" ? "1" : "0";
    const flipSig: DuelReceipt = { ...receipt, sig: flipped + receipt.sig.slice(1) };
    expect(verifyDuelSubmission(flipSig, probeA, SECRET)).toEqual({ ok: false, reason: "bad_sig" });
    // راز متفاوت
    expect(verifyDuelSubmission(receipt, probeA, "b".repeat(64))).toEqual({ ok: false, reason: "bad_sig" });
  });

  it("ساختار خراب قبل از امضا malformed می‌شود", () => {
    expect(verifyDuelSubmission(null, probeA, SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyDuelSubmission({ ...signedFixture(), v: 2 }, probeA, SECRET)).toEqual({ ok: false, reason: "malformed" });
    expect(verifyDuelSubmission({ ...signedFixture(), sig: "zz" }, probeA, SECRET)).toEqual({ ok: false, reason: "malformed" });
    const three = signedFixture();
    expect(
      verifyDuelSubmission({ ...three, players: [...three.players, three.players[0]] }, probeA, SECRET)
    ).toEqual({ ok: false, reason: "malformed" });
    // شکلِ درست از دید receiptIsShaped هم همان است
    expect(receiptIsShaped(signedFixture())).toBe(true);
    expect(receiptIsShaped({ ...signedFixture(), code: "AB" })).toBe(false);
  });

  it("ادعا بدون candidate رد می‌شود — نام/امتیاز/تعداد درست هر سه باید با یک بازیکنِ رسید یکی باشد", () => {
    const receipt = signedFixture();
    expect(
      verifyDuelSubmission(receipt, { name: "دیگری", score: 194, correct: 9, outcome: "win" }, SECRET)
    ).toEqual({ ok: false, reason: "no_candidate" });
    expect(
      verifyDuelSubmission(receipt, { name: "آرش", score: 200, correct: 9, outcome: "win" }, SECRET)
    ).toEqual({ ok: false, reason: "no_candidate" });
    expect(
      verifyDuelSubmission(receipt, { name: "آرش", score: 194, correct: 7, outcome: "win" }, SECRET)
    ).toEqual({ ok: false, reason: "no_candidate" });
  });

  it("outcome ناهم‌خوان با داوری رد می‌شود — بردِ باخته، مساویِ نابرابر، باختِ مساوی، outcomeِ غایب", () => {
    const receipt = signedFixture(); // برنده sid-a
    expect(
      verifyDuelSubmission(receipt, { name: "سارا", score: 190, correct: 8, outcome: "win" }, SECRET)
    ).toEqual({ ok: false, reason: "outcome_mismatch" });
    expect(
      verifyDuelSubmission(receipt, { name: "آرش", score: 194, correct: 9, outcome: "tie" }, SECRET)
    ).toEqual({ ok: false, reason: "outcome_mismatch" });
    const tie = signedFixture({ winner: null });
    expect(
      verifyDuelSubmission(tie, { name: "آرش", score: 194, correct: 9, outcome: "loss" }, SECRET)
    ).toEqual({ ok: false, reason: "outcome_mismatch" });
    expect(
      verifyDuelSubmission(receipt, { name: "آرش", score: 194, correct: 9, outcome: null }, SECRET)
    ).toEqual({ ok: false, reason: "outcome_mismatch" });
  });

  it("پنجرهٔ زمانی: رسیدِ کهنه‌تر از ۲۴ ساعت یا آینده‌تر از ۲ دقیقه stale است", () => {
    const now = 10_000_000_000;
    const fresh = signedFixture({ endedAt: now - 60_000, startedAt: now - 160_000 });
    expect(judgeReceiptShape(fresh, probeA, true, { now })).toEqual({ ok: true });
    const old = signedFixture({ endedAt: now - 25 * 60 * 60 * 1000, startedAt: now - 25 * 60 * 60 * 1000 });
    expect(judgeReceiptShape(old, probeA, true, { now })).toEqual({ ok: false, reason: "stale" });
    const future = signedFixture({ endedAt: now + 3 * 60 * 1000, startedAt: now });
    expect(judgeReceiptShape(future, probeA, true, { now })).toEqual({ ok: false, reason: "stale" });
  });

  it("فورفیت: برندهٔ فنی مسابقه را با رسید می‌گیرد", () => {
    const ff = signedFixture({ reason: "forfeit" });
    expect(verifyDuelSubmission(ff, probeA, SECRET)).toEqual({ ok: true });
  });

  it("خانوادهٔ هم‌نام: دو بازیکن هم‌نام با نمرهٔ برابر فقط مساوی می‌پذیرند", () => {
    const twin = signedFixture({
      winner: null,
      players: [
        { sid: "sid-a", name: "یادگیرنده", score: 100, correct: 7 },
        { sid: "sid-b", name: "یادگیرنده", score: 100, correct: 7 },
      ],
    });
    const p = { name: "یادگیرنده", score: 100, correct: 7, outcome: "tie" as const };
    expect(verifyDuelSubmission(twin, p, SECRET)).toEqual({ ok: true });
    expect(
      verifyDuelSubmission(twin, { ...p, outcome: "win" }, SECRET)
    ).toEqual({ ok: false, reason: "outcome_mismatch" });
  });
});

describe("رسید داوری — نام نمایشی و راز فایل", () => {
  it("duelDisplayName پاریتیِ readProfile سرویس است: trim + slice(24) + فالبک", () => {
    expect(duelDisplayName("  آرش  ")).toBe("آرش");
    expect(duelDisplayName("نامِبلندترازبیست‌وچهارنویسه‌ای‌که‌باید‌بریده‌شود")).toHaveLength(24);
    expect(duelDisplayName("   ")).toBe("یادگیرنده");
    expect(duelDisplayName("")).toBe("یادگیرنده");
  });

  const tmpCwd = join(process.cwd(), "node_modules", ".receipt-test-cwd");

  afterEach(() => {
    rmSync(tmpCwd, { recursive: true, force: true });
  });

  it("roundtrip راز: ساخت → خواندن → همان مقدار؛ فایلِ خراب = null", () => {
    const s1 = loadOrCreateReceiptSecret(tmpCwd);
    expect(s1).toMatch(/^[0-9a-f]{64}$/);
    expect(readReceiptSecret(tmpCwd)).toBe(s1);
    // ساختِ دوباره همان را برمی‌گرداند (idempotent)
    expect(loadOrCreateReceiptSecret(tmpCwd)).toBe(s1);
    // cwd بدون راز → null (سمت API بدون داور)
    expect(readReceiptSecret(join(tmpCwd, "empty"))).toBeNull();
  });

  it("verifyDuelSubmission مسیر کامل: رسیدِ واقعی با رازِ فایلِ تازه تأیید می‌شود", () => {
    const s = loadOrCreateReceiptSecret(tmpCwd);
    const receipt = signedFixture({}, s);
    expect(verifyDuelSubmission(receipt, probeA, readReceiptSecret(tmpCwd))).toEqual({ ok: true });
    // آگاهیِ تکرار: رسیدِ سالمِ قبلی هم رد می‌شود
    expect(
      verifyDuelSubmission(receipt, probeA, s, { replayed: true })
    ).toEqual({ ok: false, reason: "replayed" });
    // رازِ غایب (داور راه نیفتاده) → bad_sig نه کرش
    expect(verifyDuelSubmission(receipt, probeA, null)).toEqual({ ok: false, reason: "bad_sig" });
  });
});
