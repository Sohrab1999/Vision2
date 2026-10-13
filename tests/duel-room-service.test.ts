// ------------------------------------------------------------------
// Task 122 «زیرساختِ تستِ روتِ ۳۰۰۳» — قراردادِ هرمتیکِ اتاق‌سازِ داوری.
//
// منطقِ پروتکل از index.ts به room-manager.ts کوچیده شده (کارخانه با
// تزریقِ bus/entryGuard/gate/signEnd/pickQuestion/makeCode) — این فایل
// همین قرارداد را بدونِ سوکت و بدونِ شبکه، با ساعتِ مجازیِ vitest و
// تزریق‌های قطعی قفل می‌کند:
//   ① گیت‌ها به همان ترتیبِ سیمیِ قدیم: بلیت ← گلوگاه ← جست‌وجوی اتاق
//   ② چرخهٔ اتاق: لابی ← شمارش معکوس ← بازی ← پایان (یا کنسلی)
//   ③ امتیاز مرجع-سرور: ساعتِ qStartAt خودِ سرور؛ msِ کلاینت هرگز
//   ④ ترکِ وسطِ بازی: مهلتِ ۱۲ثانیه‌ایِ تسلیم، رسیدِ forfeit
//   ⑤ نبردِ دوباره، سگ‌منتِ ضدقفل، TTL
// هرمتیک: هیچ اتصالِ واقعی، هیچ بانکِ واقعی، هیچ رازِ واقعی.
//
// یادداشتِ مونتاژ: نشستِ cronِ هم‌زمان نیم‌فایل گذاشته بود (تا تستِ ۱۰
// کامل، قطعِ وسطِ ۱۱) — همین فایل نیمه با پوششِ چرخهٔ کامل تکمیل شد.
// ------------------------------------------------------------------

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  COUNTDOWN_MS,
  FORFEIT_GRACE_MS,
  QUESTIONS_PER_DUEL,
  REMATCH_COUNTDOWN_MS,
  ROOM_SIZE,
  ROOM_TTL_MS,
  createDuelRoomService,
  readProfile,
  type DuelBus,
  type DuelRoomService,
  type DuelSocketLike,
} from "../mini-services/challenge-service/room-manager";
import { BASE_POINTS } from "../mini-services/challenge-service/scoring";
import { STALL_EXTRA_MS, DEFAULT_PACE_MS } from "@/lib/duel-pace";
import type { Room } from "../mini-services/challenge-service/room-manager";

// ----------------------------- قراردادِ ثابت‌ها -----------------------------
const BASE_TIME = new Date("2026-10-13T12:00:00Z").getTime();

/** سؤالِ قطعی: perm[2] === 3 === answerReal → گزینهٔ ۲ درست است */
const Q = { id: "q-1", perm: [2, 0, 3, 1], answerReal: 3 };
/** پاسخِ درست برای Q */
const RIGHT = 2;
/** پاسخِ غلط برای Q: perm[0] === 2 ≠ 3 */
const WRONG = 0;

type BusEvent = { code: string; event: string; payload: unknown; except?: string };

interface Harness {
  svc: DuelRoomService;
  events: BusEvent[];
  entryGuard: ReturnType<typeof vi.fn>;
  gate: { attempt: ReturnType<typeof vi.fn> };
  signEnd: ReturnType<typeof vi.fn>;
  pickQuestion: ReturnType<typeof vi.fn>;
  makeCode: ReturnType<typeof vi.fn>;
  sock(id: string, ip?: string, headers?: Record<string, unknown>): DuelSocketLike;
}

function makeHarness(opts?: {
  ticketError?: { error: string; ticketError: true } | null;
  gateFailKind?: "create" | "join" | null;
  codes?: string[];
}): Harness {
  const events: BusEvent[] = [];
  const bus: DuelBus = {
    emitToRoom: (code, event, payload) => events.push({ code, event, payload }),
    emitToRoomExcept: (code, event, payload, exceptSid) =>
      events.push({ code, event, payload, except: exceptSid }),
  };
  const entryGuard = vi.fn(() => (opts?.ticketError ? opts.ticketError : null));
  const gate = {
    attempt: vi.fn((ip: string, kind: "create" | "join") =>
      opts?.gateFailKind === kind ? { ok: false as const, retryAfterMs: 42_000 } : { ok: true as const }
    ),
  };
  const signEnd = vi.fn(() => "sig-test");
  const pickQuestion = vi.fn(() => ({ ...Q, perm: [...Q.perm] }));
  const codes = opts?.codes ?? ["AAAAA", "BBBBB", "CCCCC", "DDDDD", "EEEEE"];
  let codeIdx = 0;
  const makeCode = vi.fn(() => codes[Math.min(codeIdx++, codes.length - 1)]);
  const svc = createDuelRoomService({ bus, entryGuard, gate, signEnd, pickQuestion, makeCode });
  return {
    svc,
    events,
    entryGuard,
    gate,
    signEnd,
    pickQuestion,
    makeCode,
    sock: (id, ip = "10.0.0.1", headers) => ({
      id,
      join: vi.fn(),
      leave: vi.fn(),
      handshake: { headers: headers ?? {}, address: ip },
    }),
  };
}

const evts = (h: Harness, event: string) => h.events.filter((e) => e.event === event);
const lastEvt = (h: Harness, event: string) => evts(h, event).at(-1);
const ackOf = () => vi.fn();
const ackArg = (ack: ReturnType<typeof vi.fn>) => ack.mock.calls[0]?.[0] as Record<string, unknown>;

/** اتاق در لابی با دو بازیکنِ قطعی (سازنده: آوا، پیوسته: کیان) — کدِ واقعی برمی‌گردد */
function roomAtLobby(h: Harness) {
  const s1 = h.sock("s1");
  const a1 = ackOf();
  h.svc.handleCreate(s1, { ticket: "t1", name: "  آوا  ", color: "#112233" }, a1);
  const code = ackArg(a1).code as string;
  expect(ackArg(a1)).toMatchObject({ ok: true });
  const s2 = h.sock("s2", "10.0.0.2");
  const a2 = ackOf();
  h.svc.handleJoin(s2, { code: ` ${code.toLowerCase()} `, ticket: "t2", name: "کیان" }, a2);
  expect(ackArg(a2)).toMatchObject({ ok: true, code });
  h.events.length = 0; // رویدادهایِ لابی برایِ خواناییِ تست‌هایِ بعدی ریخته می‌شود
  return { s1, s2, code };
}

/** اتاق در حالِ بازی (شمارش معکوس طی شده) */
function roomPlaying(h: Harness) {
  const r = roomAtLobby(h);
  vi.advanceTimersByTime(COUNTDOWN_MS);
  h.events.length = 0;
  return r;
}

/** هر دو بازیکن هر ۱۰ سؤال را پاسخ می‌دهند؛ advanceMs پیش از پاسخِ s2 اعمال می‌شود */
function playAll(h: Harness, p: { s1: DuelSocketLike; s2: DuelSocketLike }, advanceMsBeforeS2 = 0) {
  for (let qi = 0; qi < QUESTIONS_PER_DUEL; qi++) {
    h.svc.handleAnswer(p.s1, { qi, choice: RIGHT });
    if (advanceMsBeforeS2 > 0) vi.advanceTimersByTime(advanceMsBeforeS2);
    h.svc.handleAnswer(p.s2, { qi, choice: RIGHT });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
});
afterEach(() => {
  vi.useRealTimers();
});

// ----------------------------- پروفایلِ خوداظهار -----------------------------
describe("room-manager — readProfile (خالص)", () => {
  it("۱. ثابت‌های پروتکل عیناً همان سیمیِ قدیم‌اند", () => {
    expect(ROOM_SIZE).toBe(2);
    expect(QUESTIONS_PER_DUEL).toBe(10);
    expect(COUNTDOWN_MS).toBe(5_000);
    expect(REMATCH_COUNTDOWN_MS).toBe(3_000);
    expect(FORFEIT_GRACE_MS).toBe(12_000);
    expect(ROOM_TTL_MS).toBe(30 * 60_000);
  });

  it("۲. نام بریده/پاک‌سازی می‌شود؛ رنگِ نامعتبر → سنگِ پیش‌فرض؛ نامِ خالی → «یادگیرنده»", () => {
    expect(readProfile({ name: "   " + "و".repeat(30) + " ", color: "#AABBCC" })).toEqual({
      name: "و".repeat(24),
      color: "#AABBCC",
    });
    expect(readProfile({ name: "سحر", color: "red" }).color).toBe("#a8a29e");
    expect(readProfile({ name: 42, color: 17 }).name).toBe("یادگیرنده");
    expect(readProfile({ name: "   ", color: "#GGHHII" })).toEqual({
      name: "یادگیرنده",
      color: "#a8a29e",
    });
  });
});

// ----------------------------- گیت‌ها: بلیت ← گلوگاه ← اتاق -----------------------------
describe("room-manager — ترتیبِ گیت‌هایِ ورود", () => {
  it("۳. بلیتِ ردشده پیشِ گلوگاه پاس می‌شود: گلوگاه اصلاً دیده نمی‌شود و اتاقی ساخته نمی‌شود", () => {
    const h = makeHarness({ ticketError: { error: "بلیت نامعتبر است", ticketError: true } });
    const s1 = h.sock("s1");
    const ack = ackOf();
    h.svc.handleCreate(s1, { ticket: "junk" }, ack);
    expect(ackArg(ack)).toEqual({ ok: false, error: "بلیت نامعتبر است", ticketError: true });
    expect(h.gate.attempt).not.toHaveBeenCalled();
    expect(h.makeCode).not.toHaveBeenCalled();
    expect(h.svc.rooms.size).toBe(0);

    const s2 = h.sock("s2");
    const ack2 = ackOf();
    h.svc.handleJoin(s2, { code: "AAAAA" }, ack2);
    expect(ackArg(ack2)).toEqual({ ok: false, error: "بلیت نامعتبر است", ticketError: true });
    expect(h.gate.attempt).not.toHaveBeenCalled();
  });

  it("۴. گلوگاهِ ردکنندهٔ create: خطای فارسیِ گلوگاه، بدونِ تولیدِ کد و اتاق", () => {
    const h = makeHarness({ gateFailKind: "create" });
    const ack = ackOf();
    h.svc.handleCreate(h.sock("s1"), { ticket: "t" }, ack);
    const res = ackArg(ack);
    expect(res.ok).toBe(false);
    expect(typeof res.error).toBe("string");
    expect((res.error as string).length).toBeGreaterThan(0);
    expect((res.error as string)).not.toContain("ticketError");
    expect(h.makeCode).not.toHaveBeenCalled();
    expect(h.svc.rooms.size).toBe(0);
  });

  it("۵. گلوگاهِ join حتی پیش از جست‌وجوی کدِ ناموجود می‌شمارد (ضدِ کاودنِ کد)", () => {
    const h = makeHarness();
    const ack = ackOf();
    h.svc.handleJoin(h.sock("s1"), { code: "ZZZZZ", ticket: "t" }, ack);
    expect(h.gate.attempt).toHaveBeenCalledTimes(1);
    expect(h.gate.attempt).toHaveBeenCalledWith("10.0.0.1", "join");
    expect(ackArg(ack)).toEqual({ ok: false, error: "اتاقی با این کد پیدا نشد." });
  });

  it("۶. IP از X-Forwarded-For دستِ گلوگاه می‌رسد (سیمِ clientIpOf)", () => {
    const h = makeHarness();
    h.svc.handleCreate(
      h.sock("s1", "ignored", { "x-forwarded-for": "5.5.5.5, 10.0.0.9" }),
      { ticket: "t" },
      ackOf()
    );
    expect(h.gate.attempt).toHaveBeenCalledWith("5.5.5.5", "create");
  });
});

// ----------------------------- ساخت و پیوستن -----------------------------
describe("room-manager — ساخت/پیوستنِ اتاق", () => {
  it("۷. create موفق: ack با کد+خلاصه، پیوستن به اتاق، پخشِ duel:state", () => {
    const h = makeHarness();
    const s1 = h.sock("s1");
    const ack = ackOf();
    h.svc.handleCreate(s1, { ticket: "t", name: "آوا", color: "#112233" }, ack);
    expect(ackArg(ack)).toEqual({
      ok: true,
      code: "AAAAA",
      state: {
        code: "AAAAA",
        status: "lobby",
        perQMs: 15_000,
        players: [
          {
            sid: "s1",
            name: "آوا",
            color: "#112233",
            qi: 0,
            score: 0,
            correct: 0,
            answered: 0,
            done: false,
            disconnected: false,
          },
        ],
      },
    });
    expect(s1.join).toHaveBeenCalledWith("AAAAA");
    const st = lastEvt(h, "duel:state");
    expect(st?.code).toBe("AAAAA");
    expect(h.svc.rooms.get("AAAAA")?.paceMs).toBe(15_000); // بدونِ perQMs → پیش‌فرض
  });

  it("۸. کدِ برخوردی تا ۲۰ بار دوباره تاس می‌خورد", () => {
    const h = makeHarness({ codes: ["AAAAA", "AAAAA", "BBBBB"] });
    h.svc.handleCreate(h.sock("s1"), { ticket: "t" }, ackOf()); // AAAAA
    const ack = ackOf();
    h.svc.handleCreate(h.sock("s9"), { ticket: "t" }, ack); // AAAAA اشغال → BBBBB
    expect(ackArg(ack)).toMatchObject({ ok: true, code: "BBBBB" });
    expect(h.makeCode).toHaveBeenCalledTimes(3);
    expect(h.svc.rooms.size).toBe(2);
  });

  it("۹. سوکتِ در-اتاق دوباره create/join نمی‌تواند («قبلاً در اتاقی هستی»)", () => {
    const h = makeHarness();
    const s1 = h.sock("s1");
    h.svc.handleCreate(s1, { ticket: "t" }, ackOf());
    const a1 = ackOf();
    h.svc.handleCreate(s1, { ticket: "t" }, a1);
    expect(ackArg(a1)).toMatchObject({ ok: false, error: "قبلاً در اتاقی هستی." });
    const a2 = ackOf();
    h.svc.handleJoin(s1, { code: "AAAAA", ticket: "t" }, a2);
    expect(ackArg(a2)).toMatchObject({ ok: false, error: "قبلاً در اتاقی هستی." });
  });

  it("۱۰. join: کد نرمال می‌شود (حرفِ کوچک/فاصله)؛ اتاقِ پُر رد می‌شود", () => {
    const h = makeHarness();
    const s1 = h.sock("s1");
    h.svc.handleCreate(s1, { ticket: "t" }, ackOf());
    const s2 = h.sock("s2");
    const a2 = ackOf();
    h.svc.handleJoin(s2, { code: "  aaaaa  ", ticket: "t" }, a2); // نرمال → AAAAA
    expect(ackArg(a2)).toMatchObject({ ok: true, code: "AAAAA" });
    expect(s2.join).toHaveBeenCalledWith("AAAAA");

    const s3 = h.sock("s3");
    const a3 = ackOf();
    h.svc.handleJoin(s3, { code: "AAAAA", ticket: "t" }, a3);
    expect(ackArg(a3)).toEqual({ ok: false, error: "این اتاق کامل است." });
    expect(s3.join).not.toHaveBeenCalled();
  });
});

// ----------------------------- شمارش معکوس و شروع -----------------------------
describe("room-manager — چرخهٔ شمارش معکوس → شروع", () => {
  it("۱۱. اتاقِ کامل → duel:countdown(۵۰۰۰)؛ با گذرِ ساعت → duel:start با ۱۰ سؤالِ بی‌کلید", () => {
    const h = makeHarness();
    const s1 = h.sock("s1");
    const a1 = ackOf();
    h.svc.handleCreate(s1, { ticket: "t1", name: "آوا", color: "#112233" }, a1);
    const code = ackArg(a1).code as string;
    const s2 = h.sock("s2", "10.0.0.2");
    h.svc.handleJoin(s2, { code, ticket: "t2", name: "کیان" }, ackOf());
    const cd = lastEvt(h, "duel:countdown");
    expect(cd?.payload).toEqual({ ms: COUNTDOWN_MS });
    expect(h.svc.rooms.get(code)?.status).toBe("countdown");

    vi.advanceTimersByTime(COUNTDOWN_MS);
    const start = lastEvt(h, "duel:start");
    expect(start?.payload).toMatchObject({ perQMs: DEFAULT_PACE_MS, total: QUESTIONS_PER_DUEL });
    const questions = (start?.payload as { questions: { id: string; perm: number[] }[] }).questions;
    expect(questions).toHaveLength(QUESTIONS_PER_DUEL);
    // گاردِ نشتِ کلید: سیمِ شروع هرگز answerReal ندارد
    expect(questions[0]).toEqual({ id: "q-1", perm: [2, 0, 3, 1] });
    expect(h.svc.rooms.get(code)?.status).toBe("playing");
    void s1;
  });

  it("۱۲. رفتنِ یکی وسطِ شمارش معکوس آن را لغو می‌کند: لابی، تایمرِ مرده، شروعِ هرگز", () => {
    const h = makeHarness();
    const { s2 } = roomAtLobby(h);
    h.svc.handleLeave(s2);
    expect(h.svc.rooms.get("AAAAA")?.status).toBe("lobby");
    expect(lastEvt(h, "duel:state")?.payload).toMatchObject({ status: "lobby" });
    vi.advanceTimersByTime(COUNTDOWN_MS * 3);
    expect(evts(h, "duel:start")).toHaveLength(0);
  });
});

// ----------------------------- امتیازِ مرجع-سرور -----------------------------
describe("room-manager — duel:answer (داوریِ سرور)", () => {
  it("۱۳. امتیاز فقط از ساعتِ سرور: فوری → سقفِ پاداش؛ یک‌ثانیه‌ای → ۹۹؛ ms:0ِ کلاینت هرگز", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    h.svc.handleAnswer(s1, { qi: 0, choice: RIGHT, ms: 0 }); // elapsed=0 → ۱۰۰+۱۰۰
    vi.advanceTimersByTime(1_000);
    h.svc.handleAnswer(s2, { qi: 0, choice: RIGHT, ms: 0 }); // elapsed=1000 → ۱۰۰+۹۹
    const players = (lastEvt(h, "duel:progress")?.payload as { players: { sid: string; score: number }[] }).players;
    expect(players.find((p) => p.sid === "s1")?.score).toBe(BASE_POINTS + 100);
    expect(players.find((p) => p.sid === "s2")?.score).toBe(BASE_POINTS + 99);
  });

  it("۱۴. پاسخِ غلط پیشروی می‌کند ولی امتیاز ندارد؛ پاسخِ کهنه/گزینهٔ بیرونِ بازه نادیده", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    const before = evts(h, "duel:progress").length;
    h.svc.handleAnswer(s1, { qi: 5, choice: RIGHT }); // کهنه — نادیده
    h.svc.handleAnswer(s1, { qi: 0, choice: 9 }); // گزینهٔ ناموجود — نادیده
    expect(evts(h, "duel:progress")).toHaveLength(before);
    h.svc.handleAnswer(s1, { qi: 0, choice: WRONG }); // غلط ولی معتبر
    const players = (lastEvt(h, "duel:progress")?.payload as { players: { sid: string; score: number; answered: number; qi: number }[] }).players;
    const a = players.find((p) => p.sid === "s1");
    expect(a?.score).toBe(0);
    expect(a?.answered).toBe(1);
    expect(a?.qi).toBe(1);
    void s2;
  });

  it("۱۵. بیرونِ بازی (لابی) و پس از پایان هیچ پاسخی پردازش نمی‌شود", () => {
    const h = makeHarness();
    const s0 = h.sock("s0");
    h.svc.handleCreate(s0, { ticket: "t" }, ackOf());
    const before = h.events.length;
    h.svc.handleAnswer(s0, { qi: 0, choice: RIGHT });
    expect(h.events).toHaveLength(before); // لابی

    const { s1, s2, code } = roomPlaying(h);
    playAll(h, { s1, s2 }); // هر دو تمام
    expect(h.svc.rooms.get(code)?.status).toBe("done");
    const after = h.events.length;
    h.svc.handleAnswer(s1, { qi: 0, choice: RIGHT });
    expect(h.events).toHaveLength(after); // اتاقِ done
  });
});

// ----------------------------- پایان و رسید -----------------------------
describe("room-manager — پایانِ مسابقه و رسیدِ داور", () => {
  it("۱۶. هر دو تمام کنند → duel:end یک‌بار؛ مساوی → winner=null؛ رسید از signEndِ واقعیِ سیم", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    playAll(h, { s1, s2 });
    const ends = evts(h, "duel:end");
    expect(ends).toHaveLength(1);
    const end = ends[0].payload as { reason: string; winner: string | null; total: number; receipt: string };
    expect(end.reason).toBe("finished");
    expect(end.winner).toBeNull(); // هر دو ۲۰۰۰
    expect(end.total).toBe(QUESTIONS_PER_DUEL);
    expect(end.receipt).toBe("sig-test");
    expect(h.signEnd).toHaveBeenCalledTimes(1);
    const signed = h.signEnd.mock.calls[0][0] as { winner: string | null; reason: string; players: { sid: string; score: number }[] };
    expect(signed.reason).toBe("finished");
    expect(signed.winner).toBeNull();
    expect(signed.players.map((p) => p.score)).toEqual([2_000, 2_000]);
  });

  it("۱۷. برنده از امتیازِ واقعی: درست‌های s1 در برابر غلط‌های s2 → برنده s1 در رسید", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    for (let qi = 0; qi < QUESTIONS_PER_DUEL; qi++) {
      h.svc.handleAnswer(s1, { qi, choice: RIGHT });
      h.svc.handleAnswer(s2, { qi, choice: WRONG });
    }
    const end = lastEvt(h, "duel:end")?.payload as { winner: string | null; reason: string };
    expect(end.winner).toBe("s1");
    expect(end.reason).toBe("finished");
    const signed = h.signEnd.mock.calls[0][0] as { winner: string | null };
    expect(signed.winner).toBe("s1");
  });
});

// ----------------------------- زمانِ فکر (Task 106) -----------------------------
describe("room-manager — duel:seen و زمانِ فکرِ صادق", () => {
  it("۱۸. اولینِ دیدن ملاک است؛ نمونه = پاسخ منهای دیدن؛ بی‌دیدن → nullِ صادق", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    for (let qi = 0; qi < QUESTIONS_PER_DUEL; qi++) {
      vi.advanceTimersByTime(100);
      h.svc.handleSeen(s1, { qi });
      h.svc.handleSeen(s1, { qi }); // دوباره — نادیده (اولین ملاک)
      if (qi === 0) h.svc.handleSeen(s2, { qi: 5 }); // qiِ ناهم‌سو — نادیده
      vi.advanceTimersByTime(100);
      h.svc.handleAnswer(s1, { qi, choice: RIGHT });
      h.svc.handleAnswer(s2, { qi, choice: RIGHT });
    }
    const think = (lastEvt(h, "duel:end")?.payload as { think: Record<string, (number | null)[]> }).think;
    expect(think.s1).toEqual(Array(QUESTIONS_PER_DUEL).fill(100)); // ۱۰۰ms دیدن→پاسخ
    expect(think.s2).toEqual(Array(QUESTIONS_PER_DUEL).fill(null)); // هرگز ندید
  });

  it("۱۹. seenِ دوباره روی همان سؤال ساعتِ اول را نگه می‌دارد (نمونهٔ ۱۵۰ نه ۱۰۰)", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    vi.advanceTimersByTime(100);
    h.svc.handleSeen(s1, { qi: 0 }); // دیدنِ اول در +۱۰۰
    vi.advanceTimersByTime(100);
    h.svc.handleAnswer(s1, { qi: 0, choice: RIGHT }); // +۲۰۰ → نمونهٔ ۱۰۰
    h.svc.handleSeen(s2, { qi: 0 }); // s2 در +۲۰۰ می‌بیند
    vi.advanceTimersByTime(50);
    h.svc.handleSeen(s2, { qi: 0 }); // دوباره در +۲۵۰ — نادیده
    vi.advanceTimersByTime(100);
    h.svc.handleAnswer(s2, { qi: 0, choice: RIGHT }); // +۳۵۰ → نمونه از دیدنِ اول: ۱۵۰
    const think = (lastEvt(h, "duel:end")?.payload as { think: Record<string, (number | null)[]> } | undefined)?.think;
    // هنوز بازی تمام نشده؛ از progress نمی‌توان think خواند — با پایانِ بازی می‌سنجیم
    for (let qi = 1; qi < QUESTIONS_PER_DUEL; qi++) {
      h.svc.handleAnswer(s1, { qi, choice: RIGHT });
      h.svc.handleAnswer(s2, { qi, choice: RIGHT });
    }
    const think2 = (lastEvt(h, "duel:end")?.payload as { think: Record<string, (number | null)[]> }).think;
    expect(think2.s1[0]).toBe(100);
    expect(think2.s2[0]).toBe(150); // اگر دیدنِ دوم ملاک بود ۱۰۰ می‌شد
    void think;
  });
});

// ----------------------------- ترک و تسلیمِ وسطِ بازی -----------------------------
describe("room-manager — ترکِ اتاق", () => {
  it("۲۰. لابیِ تک‌نفره با رفتنِ سازنده بلافاصله جمع می‌شود؛ ترکِ بی‌اتاق بی‌صدا است", () => {
    const h = makeHarness();
    const lonely = h.sock("lonely");
    expect(() => h.svc.handleLeave(lonely)).not.toThrow(); // بی‌اتاق — بدونِ خرابی
    const s1 = h.sock("s1");
    h.svc.handleCreate(s1, { ticket: "t" }, ackOf());
    expect(h.svc.rooms.size).toBe(1);
    h.svc.handleLeave(s1);
    expect(h.svc.rooms.size).toBe(0); // اتاقِ بی‌بازیکن همان‌جا جمع می‌شود
  });

  it("۲۱. رفتنِ حریف وسطِ بازی → opponent-left (جز خودِ رونده) + مهلتِ ۱۲ثانیه‌ای → پایانِ forfeit به سودِ مانده", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    h.svc.handleAnswer(s1, { qi: 0, choice: RIGHT });
    vi.advanceTimersByTime(500);
    h.svc.handleAnswer(s1, { qi: 1, choice: RIGHT });
    h.svc.handleLeave(s2); // کیان وسطِ بازی می‌رود
    const left = lastEvt(h, "duel:opponent-left");
    expect(left?.payload).toEqual({ graceMs: FORFEIT_GRACE_MS });
    expect(left?.except).toBe("s2"); // فقط حریفِ مانده می‌شنود
    expect(h.svc.rooms.get("AAAAA")?.status).toBe("playing"); // هنوز مهلت هست
    vi.advanceTimersByTime(FORFEIT_GRACE_MS);
    const end = lastEvt(h, "duel:end")?.payload as { reason: string; winner: string | null };
    expect(end.reason).toBe("forfeit");
    expect(end.winner).toBe("s1");
    const signed = h.signEnd.mock.calls[0][0] as { reason: string; winner: string | null };
    expect(signed.reason).toBe("forfeit");
    expect(signed.winner).toBe("s1");
  });
});

// ----------------------------- نبردِ دوباره -----------------------------
describe("room-manager — duel:rematch", () => {
  it("۲۲. رأیِ اول → شمارش برای حریف (جز رأی‌دهنده)؛ رأیِ دوم → شمارش معکوسِ ۳ثانیه‌ای و دکِ نو", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    playAll(h, { s1, s2 });
    h.svc.handleRematch(s1);
    const vote = lastEvt(h, "duel:rematch-vote");
    expect(vote?.payload).toEqual({ voted: 1 });
    expect(vote?.except).toBe("s1");
    h.svc.handleRematch(s2);
    expect(lastEvt(h, "duel:countdown")?.payload).toEqual({ ms: REMATCH_COUNTDOWN_MS });
    vi.advanceTimersByTime(REMATCH_COUNTDOWN_MS);
    expect(evts(h, "duel:start")).toHaveLength(1); // بازیِ تازه (رویدادهایِ لابی ریخته شده بود)
    expect(h.pickQuestion).toHaveBeenCalledTimes(QUESTIONS_PER_DUEL * 2); // دکِ دوم
    const players = (lastEvt(h, "duel:progress")?.payload as { players: { score: number }[] }).players;
    expect(players.every((p) => p.score === 0)).toBe(true);
  });
});

// ----------------------------- سگ‌منت و TTL -----------------------------
describe("room-manager — نگهبان‌های سرویس", () => {
  it("۲۳. سگ‌منتِ سکون: بازیکنِ بی‌پاسخ پس از paceMs+۴s سرور خودش جلو می‌برد؛ تا پایانِ مساویِ صفر", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h); // paceMs پیش‌فرض ۱۵هزار
    for (let i = 0; i < QUESTIONS_PER_DUEL; i++) {
      vi.advanceTimersByTime(DEFAULT_PACE_MS + STALL_EXTRA_MS + 1);
      h.svc.sweepWatchdog();
    }
    const end = lastEvt(h, "duel:end")?.payload as { reason: string; winner: string | null; players: { answered: number; score: number }[] };
    expect(end.reason).toBe("finished");
    expect(end.winner).toBeNull(); // هر دو صفر — مساویِ صادق
    expect(end.players.every((p) => p.answered === QUESTIONS_PER_DUEL)).toBe(true);
    expect(end.players.every((p) => p.score === 0)).toBe(true);
    void s1;
    void s2;
  });

  it("۲۴. اتاقِ خالیِ کهنه فقط با TTL جمع می‌شود؛ اتاقِ تازه می‌ماند", () => {
    const h = makeHarness();
    const base = {
      players: new Map(),
      status: "lobby" as const,
      questions: [],
      startedAt: null,
      countdownTimer: null,
      forfeitTimer: null,
      rematchVotes: new Set<string>(),
      leftDuringPlay: false,
      paceMs: DEFAULT_PACE_MS,
    };
    h.svc.rooms.set("OLDOLD", { ...base, code: "OLDOLD", createdAt: BASE_TIME - ROOM_TTL_MS - 1 } as Room);
    h.svc.rooms.set("NEWNEW", { ...base, code: "NEWNEW", createdAt: BASE_TIME } as Room);
    h.svc.sweepTtl();
    expect(h.svc.rooms.has("OLDOLD")).toBe(false);
    expect(h.svc.rooms.has("NEWNEW")).toBe(true);
  });
});

// ----------------------------- لبه‌هایِ مکملِ نشستِ موازی (۲۵–۲۹) -----------------------------
// یادداشتِ ادغام: پوششِ حذف‌شدهٔ نسخهٔ نیم‌فایلِ قبلی — پرشِ آگاهانهٔ −۱،
// ترکِ دوبطرفه، اتمام پیش از مهلت، رأیِ قطع‌شده، و ریتمِ اختصاصیِ سگ‌منت.
describe("room-manager — لبه‌هایِ مکمل", () => {
  it("۲۵. پرشِ آگاهانهٔ −۱ مشروع است: پیشروی بدونِ امتیاز؛ −۲ و ۴ همچنان نامعتبر", () => {
    const h = makeHarness();
    const { s1 } = roomPlaying(h);
    const p1 = () => h.svc.rooms.get("AAAAA")!.players.get("s1")!;
    h.svc.handleAnswer(s1, { qi: 0, choice: -2 }); // خراب‌تر از پرش — نادیده
    h.svc.handleAnswer(s1, { qi: 0, choice: 4 }); // بیرونِ گزینه‌ها — نادیده
    expect(p1().answered).toBe(0);
    h.svc.handleAnswer(s1, { qi: 0, choice: -1 }); // پرشِ آگاهانه
    expect(p1().answered).toBe(1);
    expect(p1().qi).toBe(1);
    expect(p1().score).toBe(0);
    expect(p1().correct).toBe(0);
  });

  it("۲۶. هر دو وسطِ بازی بروند → بستنِ فوری: forfeitِ بی‌برنده، اتاق جمع، تایمرِ مرده", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    h.svc.handleAnswer(s1, { qi: 0, choice: RIGHT });
    h.svc.handleLeave(s1);
    h.svc.handleLeave(s2);
    const ends = evts(h, "duel:end");
    expect(ends).toHaveLength(1);
    const end = ends[0].payload as { reason: string; winner: string | null };
    expect(end.reason).toBe("forfeit"); // leftDuringPlay برچسبِ پایان را عوض می‌کند
    expect(end.winner).toBeNull(); // هیچ حاضرِ مانده‌ای نیست
    expect(h.svc.rooms.size).toBe(0); // هر دو رفته‌اند
    h.events.length = 0;
    vi.advanceTimersByTime(FORFEIT_GRACE_MS * 2);
    expect(evts(h, "duel:end")).toHaveLength(0); // پایانِ دوباره در راه نیست
  });

  it("۲۷. مانده پیش از مهلت تمام کند → endِ forfeit همان‌جا؛ تایمرِ تسلیم پاک می‌شود", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    h.svc.handleLeave(s1);
    for (let qi = 0; qi < QUESTIONS_PER_DUEL; qi++) h.svc.handleAnswer(s2, { qi, choice: RIGHT });
    const ends = evts(h, "duel:end");
    expect(ends).toHaveLength(1);
    const end = ends[0].payload as { reason: string; winner: string | null };
    expect(end.reason).toBe("forfeit");
    expect(end.winner).toBe("s2");
    h.events.length = 0;
    vi.advanceTimersByTime(FORFEIT_GRACE_MS * 2);
    expect(evts(h, "duel:end")).toHaveLength(0); // شلیکِ دوبارهٔ تایمرِ تسلیم ممنوع
  });

  it("۲۸. رأیِ قطع‌شده در نبردِ دوباره شمرده نمی‌شود (ready فقطِ حاضران)", () => {
    const h = makeHarness();
    const { s1, s2 } = roomPlaying(h);
    playAll(h, { s1, s2 });
    h.events.length = 0;
    h.svc.handleLeave(s1); // پس از done → فقط پرچمِ قطع؛ اتاق سرِ پا می‌ماند
    const room = h.svc.rooms.get("AAAAA")!;
    expect(room.status).toBe("done");
    expect(room.players.get("s1")?.disconnected).toBe(true);
    h.svc.handleRematch(s2);
    expect(evts(h, "duel:countdown")).toHaveLength(0); // رأیِ تنها شمارش نمی‌آورد
    expect(lastEvt(h, "duel:rematch-vote")?.payload).toEqual({ voted: 1 });
  });

  it("۲۹. سگمنت از ریتمِ خودِ اتاق پیروی می‌کند: ۸ثانیه‌ای در ۱۹ثانیه جلو می‌رود، ۲۵ثانیه‌ای نه", () => {
    const h8 = makeHarness();
    h8.svc.handleCreate(h8.sock("s1"), { ticket: "t", perQMs: 8_000 }, ackOf());
    h8.svc.handleJoin(h8.sock("s2"), { code: "AAAAA", ticket: "t" }, ackOf());
    vi.advanceTimersByTime(COUNTDOWN_MS);
    vi.advanceTimersByTime(DEFAULT_PACE_MS + STALL_EXTRA_MS + 1); // ۱۹ثانیه > ۸+۴
    h8.svc.sweepWatchdog();
    expect(h8.svc.rooms.get("AAAAA")!.players.get("s1")!.qi).toBe(1);

    const h25 = makeHarness();
    h25.svc.handleCreate(h25.sock("s1"), { ticket: "t", perQMs: 25_000 }, ackOf());
    h25.svc.handleJoin(h25.sock("s2"), { code: "AAAAA", ticket: "t" }, ackOf());
    vi.advanceTimersByTime(COUNTDOWN_MS);
    vi.advanceTimersByTime(DEFAULT_PACE_MS + STALL_EXTRA_MS + 1); // ۱۹ثانیه < ۲۵+۴
    h25.svc.sweepWatchdog();
    expect(h25.svc.rooms.get("AAAAA")!.players.get("s1")!.qi).toBe(0); // هنوز صبوری
  });
});
