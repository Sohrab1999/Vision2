// ------------------------------------------------------------------
// Task 146 — «زیرساختِ دومین تستِ ۳۰۰۳» — قراردادِ قطعاتِ تصمیمِ سیم.
//
// تسکِ ۱۲۲ پروتکلِ اتاق را هرمتیک کرد (tests/duel-room-service.test.ts)؛
// این فایل نوبتِ سه تصمیمِ باقی‌ماندهٔ index.ts است که به wiring.ts
// کوچیده‌اند: گیتِ بلیت، انتخابگرِ سؤال، تاسِ کدِ اتاق. هرمتیکِ کامل:
//   • بدونِ سوکت و شبکه — گیت با بلیتِ واقعاً ضرب‌شده (mintTicket با
//     رازِ آزمایشی) و گنبدِ حقیقیِ درون‌حافظه‌ای آزموده می‌شود.
//   • تاسِ قطعی — rngِ تزریقی ثابت، مسیرِ Fisher–Yates را دستی محاسبه
//     کرده‌ایم؛ انتظارها از ساختِ کد نیامده‌اند (ضدِ بدیهی‌بودن).
//   • سیمِ index لخت می‌ماند — منبعِ index.ts خوانده می‌شود تا هر
//     بازگشتِ منطق به درونِ سیم، تست را بشکند.
// ------------------------------------------------------------------
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it, vi } from "vitest";

import {
  CODE_ALPHABET,
  createEntryTicketGuard,
  createQuestionPicker,
  createRoomCodeMaker,
} from "../mini-services/challenge-service/wiring";
import { createTicketVault, ticketRejectMessage, TICKET_TTL_MS } from "../src/lib/duel-ticket";
import { mintTicket } from "../src/lib/duel-ticket-server";
import type { QuizQuestion } from "../src/lib/study-types";

const SECRET = "wiring-test-secret-۳۰۰۳";

const mkQ = (i: number, answer: number): QuizQuestion =>
  ({
    id: `q-${i}`,
    question: `متنِ سؤالِ ${i} — هرگز نباید نشت کند`,
    options: ["الف", "ب", "ج", "د"],
    answer,
  }) as unknown as QuizQuestion;

// ----------------------------- گیتِ بلیت -----------------------------
describe("wiring — گیتِ بلیت (ترکیبِ بازبینی + گنبد)", () => {
  it("۱. زبالهٔ خام: پیامِ malformed + ticketError — گنبد هرگز دیده نمی‌شود", () => {
    const consume = vi.fn(() => true);
    const guard = createEntryTicketGuard({ secret: SECRET, vault: { consume } });
    for (const raw of [null, undefined, 42, "string", {}, { ticket: 7 }, { other: 1 }]) {
      const v = guard(raw);
      expect(v).not.toBeNull();
      expect(v!.ticketError).toBe(true);
      expect(v!.error).toBe(ticketRejectMessage("malformed"));
    }
    expect(consume).not.toHaveBeenCalled();
  });

  it("۲. بلیتِ دست‌کاری‌شده: bad_sig و consume هرگز — دست‌کاریِ امضا nonce نمی‌سوزاند", () => {
    const consume = vi.fn(() => true);
    const guard = createEntryTicketGuard({ secret: SECRET, vault: { consume } });
    const { token } = mintTicket("learner-1", SECRET);
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    const v = guard({ ticket: tampered });
    expect(v).toEqual({ error: ticketRejectMessage("bad_sig"), ticketError: true });
    expect(consume).not.toHaveBeenCalled();
  });

  it("۳. بلیتِ سالم: null؛ همان nonce دوباره: replayed — یک‌بارمصرفِ واقعی", () => {
    const vault = createTicketVault();
    const guard = createEntryTicketGuard({ secret: SECRET, vault });
    const { token } = mintTicket("learner-2", SECRET);
    expect(guard({ ticket: token })).toBeNull();
    const again = guard({ ticket: token });
    expect(again).toEqual({ error: ticketRejectMessage("replayed"), ticketError: true });
    // گنبد واقعی هم همان را دیده: یک nonce مصرف شده
    expect(vault.size()).toBe(1);
  });

  it("۴. بلیتِ منقضی: پیامِ expired — پنجرهٔ ۱۲۰ثانیه‌ای صادق است", () => {
    const guard = createEntryTicketGuard({ secret: SECRET, vault: createTicketVault() });
    const { token } = mintTicket("learner-3", SECRET, Date.now() - TICKET_TTL_MS - 1_000);
    expect(guard({ ticket: token })).toEqual({
      error: ticketRejectMessage("expired"),
      ticketError: true,
    });
  });

  it("۵. رازِ null: حتی بلیتِ ساختاری‌درست bad_sig می‌گیرد (رازِ نیامده = هیچِ کس)", () => {
    const consume = vi.fn(() => true);
    const guard = createEntryTicketGuard({ secret: null, vault: { consume } });
    const { token } = mintTicket("learner-4", SECRET); // با رازِ دیگر ضرب شده
    expect(guard({ ticket: token })).toEqual({
      error: ticketRejectMessage("bad_sig"),
      ticketError: true,
    });
    expect(consume).not.toHaveBeenCalled();
  });

  it("۶. ترتیبِ گیت‌ها: بلیتِ خراب پیش از گنبد می‌میرد — nonceِ دست‌کاری‌شده سوزانده نمی‌شود", () => {
    const vault = createTicketVault();
    const consume = vi.spyOn(vault, "consume");
    const guard = createEntryTicketGuard({ secret: SECRET, vault });
    const { token } = mintTicket("learner-5", SECRET);
    // اول دست‌کاری: consume نباید صدا شود
    guard({ ticket: token.slice(0, -2) + "zz" });
    expect(consume).not.toHaveBeenCalled();
    // بعد بلیتِ سالمِ همان یادگیرنده: consume دقیقاً یک‌بار با nonceِ درست
    expect(guard({ ticket: token })).toBeNull();
    expect(consume).toHaveBeenCalledTimes(1);
  });
});

// ----------------------------- انتخابگرِ سؤال -----------------------------
describe("wiring — انتخابگرِ سؤال (تاسِ قطعی و ضدِ نشت)", () => {
  it("۷. rng=۰: اولین سؤالِ بانک با permِ دستی‌محاسبهٔ [1,2,3,0] و answerReal=۱", () => {
    // Fisher–Yates با تاسِ صفر: i=3→جابه‌جایی a[3]↔a[0]؛ i=2→a[2]↔a[0]؛ i=1→a[1]↔a[0]
    const bank = [mkQ(1, 2), mkQ(2, 0), mkQ(3, 1)];
    const pick = createQuestionPicker({ bank, rng: () => 0 });
    const q = pick();
    expect(q.id).toBe("q-1");
    expect(q.perm).toEqual([1, 2, 3, 0]);
    // answer=2 در perm=[1,2,3,0] در جایگاهِ ۱ نشسته است
    expect(q.answerReal).toBe(1);
  });

  it("۸. rng=۱−ε: آخرین سؤال با permِ [0,1,2,3] و answerReal = خودِ پاسخ", () => {
    const bank = [mkQ(1, 0), mkQ(2, 1), mkQ(3, 3)];
    const pick = createQuestionPicker({ bank, rng: () => 0.999999 });
    const q = pick();
    expect(q.id).toBe("q-3");
    expect(q.perm).toEqual([0, 1, 2, 3]);
    expect(q.answerReal).toBe(3);
  });

  it("۹. صد کشْ با تاسِ واقعی: perm همیشه جایگشتِ ۴تاییِ متمایز", () => {
    const bank = [mkQ(1, 0), mkQ(2, 1), mkQ(3, 2), mkQ(4, 3)];
    const pick = createQuestionPicker({ bank, rng: Math.random });
    for (let i = 0; i < 100; i++) {
      const q = pick();
      expect([...q.perm].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
      expect(q.answerReal).toBeGreaterThanOrEqual(0);
      expect(q.answerReal).toBeLessThanOrEqual(3);
    }
  });

  it("۱۰. خروجی هرگز خودِ سؤال نیست — کلید و متن نشت نمی‌کند", () => {
    const bank = [mkQ(1, 2)];
    const pick = createQuestionPicker({ bank, rng: Math.random });
    for (let i = 0; i < 20; i++) {
      const q = pick();
      expect(Object.keys(q).sort()).toEqual(["answerReal", "id", "perm"]);
      expect(JSON.stringify(q)).not.toContain("هرگز نباید نشت کند");
      expect(JSON.stringify(q)).not.toContain("الف");
    }
  });
});

// ----------------------------- تاسِ کدِ اتاق -----------------------------
describe("wiring — تاسِ کدِ اتاق (الفبای بی‌ابهام)", () => {
  it("۱۱. کد: ۵ نویسه، همه در CODE_ALPHABET (۲۰۰ کشْ)", () => {
    const roll = createRoomCodeMaker({ rng: Math.random });
    for (let i = 0; i < 200; i++) {
      const code = roll();
      expect(code).toHaveLength(5);
      for (const ch of code) expect(CODE_ALPHABET).toContain(ch);
    }
  });

  it("۱۲. نویسه‌های مبهم هرگز: هزار کشْ بدونِ I/L/O و ۰/۱", () => {
    const roll = createRoomCodeMaker({ rng: Math.random });
    for (let i = 0; i < 1000; i++) expect(roll()).not.toMatch(/[ILO01]/);
  });

  it("۱۳. تاسِ قطعی: rng=۰ → «AAAAA»؛ الفبای ثابت ۳۱نویسه و خودش بی‌ابهام", () => {
    expect(createRoomCodeMaker({ rng: () => 0 })()).toBe("AAAAA");
    expect(CODE_ALPHABET).toHaveLength(31);
    expect(CODE_ALPHABET).not.toMatch(/[ILO01]/);
  });
});

// ----------------------------- سیمِ index لخت می‌ماند -----------------------------
describe("wiring — سیمِ index.ts لخت می‌ماند (منبع)", () => {
  const src = readFileSync(
    join(process.cwd(), "mini-services/challenge-service/index.ts"),
    "utf8",
  );

  it("۱۴. سه کارخانه سیم شده‌اند و هیچ تعریفِ درجایی از قطعات نمانده", () => {
    expect(src).toContain("createEntryTicketGuard({");
    expect(src).toContain("createQuestionPicker({");
    expect(src).toContain("createRoomCodeMaker({");
    // بازگشتِ منطق به درونِ سیم ممنوع — اینها اکنون فقط در wiring.ts زنده‌اند
    expect(src).not.toContain("function entryTicketGuard");
    expect(src).not.toContain("shuffle([0, 1, 2, 3])");
    expect(src).not.toContain("CODE_ALPHABET[");
    expect(src).not.toContain("perm.indexOf(");
  });
});
