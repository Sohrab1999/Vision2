// ------------------------------------------------------------------
// Vision 2 — اتاق‌سازِ داوری «نبرد دودنفره» (task 122)
//
// گام ۱۰ — زیرساختِ تستِ روتِ ۳۰۰۳: منطقِ پروتکل (ساخت/پیوستن/پاسخ/دیدن/
// نبردِ دوباره/ترک) و چرخهٔ اتاق (شمارش معکوس، شروع، پایان، ترکِ وسطِ
// بازی، سگ‌منت، TTL) از index.ts بیرون کشیده شد تا هرمتیک آزموده شود.
//
// قراردادِ کارخانه: همهٔ عوارضِ جانبیِ محیطی تزریقی‌اند —
//   • bus            پخشِ رویداد به اتاق (معادل io.to / socket.to)
//   • entryGuard     گیتِ بلیت (راز و گنبدِ nonce در index.ts می‌ماند)
//   • gate           گلوگاهِ نرخِ ورود بر IP
//   • signEnd        امضای رسیدِ پایان (HMAC در index.ts سیم می‌شود)
//   • pickQuestion   انتخابِ سؤال (تزریقی برای تستِ قطعی)
//   • makeCode       تولیدِ کدِ اتاق (تزریقی برای تستِ قطعی)
//
// رفتارِ سیمیِ قبلی حرف‌به‌حرف حفظ شده است؛ تنها سه تبدیلِ مکانیکی رخ داده:
//   ① io.to(code).emit → bus.emitToRoom  و  socket.to(code).emit →
//      bus.emitToRoomExcept(code, …, socket.id)  (سمانتیکِ «جز خودم» همان است)
//   ② متغیرِ اتصالیِ «room» در بستارِ connection → نقشهٔ sid→اتاق
//      (هر socket.id یکتاست؛ همان معناشناسی، فقط قابلِ رصد در تست)
//   ③ Date.now/Math.randomِ داخلِ منطق دست‌نخورده‌اند — تست با ساعتِ
//     مجازیِ vitest و pickQuestion/makeCodeِ تزریقی قطعی می‌شود.
// ------------------------------------------------------------------
import { recordThinkSample, padThinkSamples } from "../../src/lib/duel-think";
import { clampPaceMs, STALL_EXTRA_MS } from "../../src/lib/duel-pace";
import { clientIpOf, entryThrottleError } from "../../src/lib/join-throttle";
import { BASE_POINTS, speedBonus } from "./scoring";

// ----------------------------- ثابت‌های پروتکل -----------------------------
export const ROOM_SIZE = 2;
export const QUESTIONS_PER_DUEL = 10;
/** شمارش معکوس پس از کامل شدن اتاق */
export const COUNTDOWN_MS = 5_000;
export const REMATCH_COUNTDOWN_MS = 3_000;
/** مهلت بعد از قطع‌شدن حریف وسط مسابقه */
export const FORFEIT_GRACE_MS = 12_000;
/** اتاق‌های خالی جمع‌شونده */
export const ROOM_TTL_MS = 30 * 60_000;

// ----------------------------- مدل‌ها -----------------------------
export interface PlayerState {
  sid: string;
  name: string;
  color: string;
  /** سؤال بعدی که باید جواب بدهد (پیشروی مستقل) */
  qi: number;
  score: number;
  correct: number;
  answered: number;
  lastAnswerAt: number;
  /** ساعتِ سؤالِ جاری روی سرور — مبنای پاداش سرعت (SEC) */
  qStartAt: number;
  /**
   * Task 106 — ساعتِ «دیدنِ» سؤالِ جاری (duel:seen؛ سرور-ساعت).
   * امتیاز همچنان فقط از qStartAt می‌آید؛ seen فقط گزارشِ دیدن→پاسخ را
   * ممکن می‌کند و هیچ راهی به امتیاز/رسید ندارد.
   */
  seenAt: number | null;
  /** نمونهٔ فکرِ هر سؤال (ms) — null = دیده/ثبت نشده؛ نمایشی، بیرونِ رسید */
  thinkSamples: (number | null)[];
  doneAt: number | null;
  disconnected: boolean;
}

export interface Room {
  code: string;
  players: Map<string, PlayerState>;
  status: "lobby" | "countdown" | "playing" | "done";
  questions: { id: string; perm: number[]; answerReal: number }[];
  startedAt: number | null;
  countdownTimer: NodeJS.Timeout | null;
  forfeitTimer: NodeJS.Timeout | null;
  rematchVotes: Set<string>;
  createdAt: number;
  /** کسی وسط مسابقه رفته باشد → پایان با برچسب forfeit */
  leftDuringPlay: boolean;
  /** Task 107 — ریتمِ برگزیدهٔ سازندهٔ اتاق (گرِفت‌شده با clampPaceMs) */
  paceMs: number;
}

export interface DuelEndPayload {
  code: string;
  startedAt: number | null;
  endedAt: number;
  reason: "finished" | "forfeit";
  winner: string | null;
  players: { sid: string; name: string; score: number; correct: number }[];
}

export type DuelAck = (res: unknown) => void;

/** باریکهٔ سوکت که داور لازم دارد — سوکتِ واقعیِ socket.io همین شکل است */
export interface DuelSocketLike {
  id: string;
  join(code: string): unknown;
  leave(code: string): unknown;
  handshake: { headers?: Record<string, unknown>; address?: string };
}

/** پخشِ رویداد — socket.to(code).emit یعنی همهٔ اتاق جز فرستنده */
export interface DuelBus {
  emitToRoom(code: string, event: string, payload: unknown): void;
  emitToRoomExcept(code: string, event: string, payload: unknown, exceptSid: string): void;
}

export interface DuelGate {
  attempt(ip: string, kind: "create" | "join"): { ok: true } | { ok: false; retryAfterMs: number };
}

export interface DuelDeps {
  bus: DuelBus;
  /** گیتِ بلیت — رشتهٔ خطا + ticketError یا null (index.ts واقعی‌اش را سیم می‌کند) */
  entryGuard(raw: unknown): { error: string; ticketError: true } | null;
  gate: DuelGate;
  signEnd(payload: DuelEndPayload): string;
  pickQuestion(): { id: string; perm: number[]; answerReal: number };
  makeCode(): string;
}

/** نرمال‌سازیِ پروفایلِ خوداظهار — فقط نمایشی؛ هرگز به امتیاز/رسید راه ندارد */
export function readProfile(raw: { name?: unknown; color?: unknown }): { name: string; color: string } {
  const name = typeof raw?.name === "string" ? raw.name.trim().slice(0, 24) : "";
  const color =
    typeof raw?.color === "string" && /^#[0-9a-fA-F]{6}$/.test(raw.color) ? raw.color : "#a8a29e";
  return { name: name || "یادگیرنده", color };
}

// ----------------------------- کارخانهٔ سرویس اتاق -----------------------------
export function createDuelRoomService(deps: DuelDeps) {
  const rooms = new Map<string, Room>();
  /** جایگزینِ متغیرِ اتصالیِ «room» — هر socket.id حداکثر یک اتاق */
  const currentRoom = new Map<string, Room>();

  function publicPlayers(room: Room) {
    return [...room.players.values()].map((p) => ({
      sid: p.sid,
      name: p.name,
      color: p.color,
      qi: p.qi,
      score: p.score,
      correct: p.correct,
      answered: p.answered,
      done: p.doneAt !== null,
      disconnected: p.disconnected,
    }));
  }

  function roomSummary(room: Room) {
    // Task 107 — perQMs در خلاصهٔ اتاق تا لابیِ هر دو طرف (سازنده و پیوسته)
    // ریتمِ برگزیده را پیش از شروع ببیند؛ duel:start هم همان عدد را می‌فرستد.
    return { code: room.code, status: room.status, perQMs: room.paceMs, players: publicPlayers(room) };
  }

  function broadcastState(room: Room) {
    deps.bus.emitToRoom(room.code, "duel:state", roomSummary(room));
  }

  function progressPayload(room: Room) {
    return { code: room.code, status: room.status, perQMs: room.paceMs, players: publicPlayers(room) };
  }

  function endMatch(room: Room, reason: "finished" | "forfeit") {
    if (room.status === "done") return;
    const finalReason = room.leftDuringPlay ? "forfeit" : reason;
    room.status = "done";
    if (room.countdownTimer) clearTimeout(room.countdownTimer);
    if (room.forfeitTimer) clearTimeout(room.forfeitTimer);
    room.countdownTimer = null;
    room.forfeitTimer = null;

    const ps = [...room.players.values()];
    const ranked = [...ps].sort(
      (a, b) =>
        b.score - a.score || b.correct - a.correct || (a.doneAt ?? Infinity) - (b.doneAt ?? Infinity)
    );
    const winner =
      finalReason === "forfeit"
        ? ps.find((p) => !p.disconnected)?.sid ?? null
        : ranked.length === ROOM_SIZE && ranked[0].score === ranked[1].score && ranked[0].correct === ranked[1].correct
          ? null
          : ranked[0]?.sid ?? null;

    const endedAt = Date.now();
    // Task 94 — رسیدِ امضاشده: هر دو بازیکن همین رسید را کنار نتیجه به
    // /api/stats می‌فرستند؛ امضای داور تنها راهِ ورودِ ردیفِ نبرد به آمار است.
    const receipt = deps.signEnd({
      code: room.code,
      startedAt: room.startedAt ?? endedAt,
      endedAt,
      reason: finalReason,
      winner,
      players: ps.map((p) => ({ sid: p.sid, name: p.name, score: p.score, correct: p.correct })),
    });
    deps.bus.emitToRoom(room.code, "duel:end", {
      reason: finalReason,
      winner,
      total: room.questions.length,
      startedAt: room.startedAt,
      players: publicPlayers(room),
      // Task 106 — نمونه‌های زمانِ فکرِ هر بازیکن (نمایشی؛ بیرونِ رسیدِ امضاشده؛
      // جاهای بی‌نمونه nullِ صادق می‌مانند — نه صفرِ ساختگی)
      think: Object.fromEntries(
        ps.map((p) => [p.sid, padThinkSamples(p.thinkSamples, room.questions.length)])
      ),
      receipt,
    });
    room.rematchVotes.clear();
  }

  /** وقتی همه تمام کردند یا حریف قطع شد، مسابقه را می‌بندد */
  function maybeFinish(room: Room) {
    if (room.status !== "playing") return;
    const active = [...room.players.values()].filter((p) => !p.disconnected);
    if (active.length > 0 && active.every((p) => p.doneAt !== null)) endMatch(room, "finished");
  }

  function startMatch(room: Room) {
    room.status = "playing";
    room.startedAt = Date.now();
    room.rematchVotes.clear();
    room.questions = Array.from({ length: QUESTIONS_PER_DUEL }, () => deps.pickQuestion());
    for (const p of room.players.values()) {
      p.qi = 0;
      p.score = 0;
      p.correct = 0;
      p.answered = 0;
      p.lastAnswerAt = Date.now();
      p.qStartAt = Date.now();
      p.seenAt = null;
      p.thinkSamples = [];
      p.doneAt = null;
    }
    deps.bus.emitToRoom(room.code, "duel:start", {
      perQMs: room.paceMs, // Task 107 — ریتمِ خودِ اتاق، نه ثابتِ سراسری
      total: QUESTIONS_PER_DUEL,
      startedAt: room.startedAt,
      questions: room.questions.map((q) => ({ id: q.id, perm: q.perm })),
    });
    deps.bus.emitToRoom(room.code, "duel:progress", progressPayload(room));
  }

  function scheduleCountdown(room: Room, ms: number) {
    if (room.countdownTimer) clearTimeout(room.countdownTimer);
    room.status = "countdown";
    deps.bus.emitToRoom(room.code, "duel:countdown", { ms });
    room.countdownTimer = setTimeout(() => {
      room.countdownTimer = null;
      if (
        room.players.size === ROOM_SIZE &&
        [...room.players.values()].every((p) => !p.disconnected)
      )
        startMatch(room);
      else {
        room.status = "lobby";
        broadcastState(room);
      }
    }, ms);
  }

  function destroyRoomIfEmpty(room: Room) {
    const allGone = [...room.players.values()].every((p) => p.disconnected);
    if (allGone) {
      if (room.countdownTimer) clearTimeout(room.countdownTimer);
      if (room.forfeitTimer) clearTimeout(room.forfeitTimer);
      rooms.delete(room.code);
    }
  }

  function leaveCurrentRoom(socket: DuelSocketLike) {
    const r = currentRoom.get(socket.id);
    if (!r) return;
    currentRoom.delete(socket.id);
    socket.leave(r.code);
    const p = r.players.get(socket.id);
    if (r.status === "lobby" || r.status === "countdown") {
      // در لابی/شمارش معکوس حذف کامل طبیعی است (هنوز بازی شروع نشده)
      r.players.delete(socket.id);
    } else if (p) {
      // وسط/پس از مسابقه: رکورد بازیکن با پرچم قطع‌شدن حفظ می‌شود
      // تا نتیجهٔ نهایی آمار هر دو طرف را داشته باشد
      p.disconnected = true;
    }

    if (r.status === "countdown") {
      // شمارش معکوس با رفتن یکی لغو می‌شود
      if (r.countdownTimer) clearTimeout(r.countdownTimer);
      r.countdownTimer = null;
      r.status = "lobby";
      broadcastState(r);
    } else if (r.status === "playing") {
      const remaining = [...r.players.values()].filter((x) => !x.disconnected);
      if (remaining.length === 0) {
        endMatch(r, "finished"); // هر دو رفتند — نتیجه‌ای معنا ندارد
      } else {
        r.leftDuringPlay = true;
        deps.bus.emitToRoomExcept(
          r.code,
          "duel:opponent-left",
          { graceMs: FORFEIT_GRACE_MS },
          socket.id
        );
        if (!r.forfeitTimer) {
          r.forfeitTimer = setTimeout(() => {
            r.forfeitTimer = null;
            endMatch(r, "forfeit");
          }, FORFEIT_GRACE_MS);
        }
      }
    }
    broadcastState(r);
    destroyRoomIfEmpty(r);
  }

  // ------------------------- ساخت اتاق -------------------------
  // Task 107 — سازندهٔ اتاق ریتم را هم برمی‌گزیند (perQMs اختیاری؛
  // سرویسِ قدیمی/کلاینتِ بی‌انتخاب → پیش‌فرض با clampPaceMs)
  function handleCreate(
    socket: DuelSocketLike,
    raw: { perQMs?: unknown; ticket?: unknown } & { name?: unknown; color?: unknown },
    ack?: DuelAck
  ) {
    if (currentRoom.has(socket.id)) return ack?.({ ok: false, error: "قبلاً در اتاقی هستی." });
    // Task 112 — بلیت پیشِ همه: سوکتِ بی‌بلیت/تقلبی نه اتاق می‌سازد، نه
    // بودجهٔ IPِ گلوگاه را می‌سوزاند (ردِ آن بی‌هزینه و بی‌حافظه است)
    const createTicket = deps.entryGuard(raw);
    if (createTicket) return ack?.({ ok: false, ...createTicket });
    const createGate = deps.gate.attempt(clientIpOf(socket.handshake), "create");
    if (!createGate.ok)
      return ack?.({ ok: false, error: entryThrottleError("create", createGate.retryAfterMs) });
    let code = deps.makeCode();
    for (let tries = 0; rooms.has(code) && tries < 20; tries++) code = deps.makeCode();
    const profile = readProfile(raw);
    const r: Room = {
      code,
      players: new Map(),
      status: "lobby",
      questions: [],
      startedAt: null,
      countdownTimer: null,
      forfeitTimer: null,
      rematchVotes: new Set(),
      createdAt: Date.now(),
      leftDuringPlay: false,
      paceMs: clampPaceMs(raw?.perQMs),
    };
    r.players.set(socket.id, {
      sid: socket.id,
      ...profile,
      qi: 0,
      score: 0,
      correct: 0,
      answered: 0,
      lastAnswerAt: Date.now(),
      qStartAt: Date.now(),
      seenAt: null,
      thinkSamples: [],
      doneAt: null,
      disconnected: false,
    });
    rooms.set(code, r);
    socket.join(code);
    currentRoom.set(socket.id, r);
    ack?.({ ok: true, code, state: roomSummary(r) });
    broadcastState(r);
  }

  // ------------------------- پیوستن با کد -------------------------
  function handleJoin(
    socket: DuelSocketLike,
    payload: { code?: unknown; ticket?: unknown } & { name?: unknown; color?: unknown },
    ack?: DuelAck
  ) {
    if (currentRoom.has(socket.id)) return ack?.({ ok: false, error: "قبلاً در اتاقی هستی." });
    // Task 112 — بلیت پیشِ گلوگاه: کاودنِ کد بدونِ بلیت حتی شمارنده را نمی‌بیند
    const joinTicket = deps.entryGuard(payload);
    if (joinTicket) return ack?.({ ok: false, ...joinTicket });
    // گلوگاهِ ورود پیشِ جست‌وجوی اتاق — هر تلاش حتی کدِ ناموجود می‌شمارد (ضدِ کاودنِ کد)
    const joinGate = deps.gate.attempt(clientIpOf(socket.handshake), "join");
    if (!joinGate.ok)
      return ack?.({ ok: false, error: entryThrottleError("join", joinGate.retryAfterMs) });
    const code = typeof payload?.code === "string" ? payload.code.trim().toUpperCase() : "";
    const r = rooms.get(code);
    if (!r) return ack?.({ ok: false, error: "اتاقی با این کد پیدا نشد." });
    if (r.players.size >= ROOM_SIZE) return ack?.({ ok: false, error: "این اتاق کامل است." });
    if (r.status !== "lobby")
      return ack?.({ ok: false, error: "مسابقه در جریان است؛ کمی بعد دوباره تلاش کن." });

    const profile = readProfile(payload);
    r.players.set(socket.id, {
      sid: socket.id,
      ...profile,
      qi: 0,
      score: 0,
      correct: 0,
      answered: 0,
      lastAnswerAt: Date.now(),
      qStartAt: Date.now(),
      seenAt: null,
      thinkSamples: [],
      doneAt: null,
      disconnected: false,
    });
    socket.join(code);
    currentRoom.set(socket.id, r);
    ack?.({ ok: true, code: r.code, state: roomSummary(r) });
    broadcastState(r);
    // اتاق کامل شد → شمارش معکوس تا شروع
    if (r.players.size === ROOM_SIZE) scheduleCountdown(r, COUNTDOWN_MS);
  }

  // ------------------------- پاسخ به سؤال -------------------------
  // SEC: فیلد ms گزارشیِ کلاینت عمداً نادیده گرفته می‌شود (قرارداد سیمی
  // برای سازگاری رو به جلو حفظ شده) — امتیاز از qStartAt خود سرور می‌آید.
  function handleAnswer(socket: DuelSocketLike, payload: { qi?: unknown; choice?: unknown; ms?: unknown }) {
    const room = currentRoom.get(socket.id);
    if (!room || room.status !== "playing") return;
    const p = room.players.get(socket.id);
    if (!p || p.doneAt !== null) return;
    const qi = typeof payload?.qi === "number" ? Math.floor(payload.qi) : -1;
    const choice = typeof payload?.choice === "number" ? Math.floor(payload.choice) : -2;
    if (qi !== p.qi || qi < 0 || qi >= room.questions.length) return; // پاسخ دیرهنگام/تکراری نادیده گرفته می‌شود
    if (choice < -1 || choice > 3) return;

    const q = room.questions[qi];
    const correct = choice >= 0 && q.perm[choice] === q.answerReal;
    const now = Date.now();
    const serverElapsedMs = now - p.qStartAt; // زمان‌سنجی مرجع-سرور
    p.answered += 1;
    p.lastAnswerAt = now;
    // Task 106 — نمونهٔ زمانِ فکر: پاسخ منهای دیدن (هر دو ساعتِ خودِ سرور).
    // قبل از جابه‌جاییِ qStartAt ثبت می‌شود چون پنجره به همین سؤال تعلق دارد.
    p.thinkSamples = recordThinkSample(p.thinkSamples, qi, p.seenAt, now, p.qStartAt);
    p.seenAt = null; // سؤالِ بعدی دیدنِ تازه می‌خواهد
    if (correct) {
      p.correct += 1;
      p.score += BASE_POINTS + speedBonus(serverElapsedMs);
    }
    p.qi += 1;
    p.qStartAt = now; // ساعت سؤال بعدی با همین پاسخ روشن می‌شود (هم‌گام با پیشروی کلاینت)
    if (p.qi >= room.questions.length) p.doneAt = now;

    deps.bus.emitToRoom(room.code, "duel:progress", progressPayload(room));
    maybeFinish(room);
  }

  // ------------------------- «دیدنِ» سؤال (Task 106) -------------------------
  // کلاینت وقتی سؤال واقعاً رندر شد duel:seen می‌فرستد؛ ساعتش را خودِ سرور
  // می‌زند. فقط اولینِ دیدنِ هر سؤال ثبت می‌شود (دوباره‌فرستادی → نادیده) و
  // فقط برای همان سؤالی که نوبتش است (qi ناهم‌سو → نادیده). امتیاز همچنان
  // فقط از qStartAt می‌آید — seen فقط گزارشِ زمانِ فکر را ممکن می‌کند.
  function handleSeen(socket: DuelSocketLike, payload: { qi?: unknown }) {
    const room = currentRoom.get(socket.id);
    if (!room || room.status !== "playing") return;
    const p = room.players.get(socket.id);
    if (!p || p.doneAt !== null) return;
    if (p.seenAt !== null) return; // اولینِ دیدن ملاک است
    const qi = typeof payload?.qi === "number" ? Math.floor(payload.qi) : -1;
    if (qi !== p.qi) return;
    p.seenAt = Date.now();
  }

  // ------------------------- نبرد دوباره -------------------------
  function handleRematch(socket: DuelSocketLike) {
    const room = currentRoom.get(socket.id);
    if (!room || room.status !== "done") return;
    if (!room.players.has(socket.id)) return;
    room.rematchVotes.add(socket.id);
    const ready = [...room.players.values()].filter((p) => !p.disconnected);
    if (ready.length === ROOM_SIZE && ready.every((p) => room.rematchVotes.has(p.sid))) {
      scheduleCountdown(room, REMATCH_COUNTDOWN_MS);
    } else {
      deps.bus.emitToRoomExcept(room.code, "duel:rematch-vote", { voted: room.rematchVotes.size }, socket.id);
    }
  }

  // ------------------- سگ‌منت ضد قفل‌شدن + نظافت -------------------
  // (بدنهٔ هر دو پیمایش از index.ts آمده؛ فاصله‌سنج‌ها همان‌جا سیم می‌شوند)
  function sweepWatchdog() {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (room.status !== "playing") continue;
      let changed = false;
      for (const p of room.players.values()) {
        if (p.doneAt !== null || p.disconnected) continue;
        // کلاینت قفل شده و پاسخ -۱ خودکارش نرسیده → سرور خودش جلو می‌برد (غلط)
        // Task 107 — مهلتِ سگ‌منت بر پایهٔ ریتمِ خودِ اتاق است نه ثابتِ سراسری
        if (now - p.lastAnswerAt > room.paceMs + STALL_EXTRA_MS) {
          p.answered += 1;
          p.qi += 1;
          p.seenAt = null; // Task 106 — بدونِ پاسخ، نمونهٔ فکر هم ندارد؛ سؤالِ بعد دیدنِ تازه می‌خواهد
          if (p.qi >= room.questions.length) p.doneAt = now;
          changed = true;
        }
      }
      if (changed) {
        deps.bus.emitToRoom(room.code, "duel:progress", progressPayload(room));
        maybeFinish(room);
      }
    }
  }

  function sweepTtl() {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (room.players.size === 0 && now - room.createdAt > ROOM_TTL_MS) {
        if (room.countdownTimer) clearTimeout(room.countdownTimer);
        if (room.forfeitTimer) clearTimeout(room.forfeitTimer);
        rooms.delete(room.code);
      }
    }
  }

  return {
    rooms,
    roomOf: (sid: string) => currentRoom.get(sid) ?? null,
    handleCreate,
    handleJoin,
    handleAnswer,
    handleSeen,
    handleRematch,
    handleLeave: leaveCurrentRoom,
    sweepWatchdog,
    sweepTtl,
  };
}

export type DuelRoomService = ReturnType<typeof createDuelRoomService>;
