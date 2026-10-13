// ------------------------------------------------------------------
// Vision 2 — سرویس داوری «نبرد دودنفره» (چالش زندهٔ واژگانی)
// socket.io روی پورت ۳۰۰۳ — داوری متمرکز و ضد تقلب:
//   • سرور خودش بانک ۴۹۰ سؤال را دارد و «درستیِ» هر پاسخ را خودش
//     اعتبارسنجی می‌کند (هیچ اعتمادی به گزارش کلاینت نیست).
//   • امتیاز سرعت هم مرجع-سرور است (scoring.ts) — گزارش ms کلاینت
//     خوانده نمی‌شود؛ ساعت هر سؤال روی خودِ سرور تیک می‌خورد.
//   • ترتیب سؤال‌ها و بُر خوردن گزینه‌ها (perm) سمت سرور تولید می‌شود
//     تا هر دو بازیکن دقیقاً همان گزینه‌ها را با همان ترتیب ببینند.
//   • کلاینت فقط id سؤال + perm را می‌گیرد و متن را از بانک استاتیک
//     خودش رندر می‌کند → ترافیک کم و بدون نشتِ کلید پاسخ.
// ------------------------------------------------------------------
import { createServer } from "http";
import { existsSync } from "fs";
import { join } from "path";
import { Server, type Socket } from "socket.io";

import lesson1 from "../../src/data/lesson1";
import lesson2 from "../../src/data/lesson2";
import lesson3 from "../../src/data/lesson3";
import examBank from "../../src/data/exam";
import type { QuizQuestion } from "../../src/lib/study-types";
import { loadOrCreateReceiptSecret, signDuelEnd } from "../../src/lib/duel-receipt-server";
import { recordThinkSample, padThinkSamples } from "../../src/lib/duel-think";
import { clampPaceMs, STALL_EXTRA_MS } from "../../src/lib/duel-pace";
import { clientIpOf, createJoinThrottle, entryThrottleError } from "../../src/lib/join-throttle";
import { BASE_POINTS, speedBonus } from "./scoring";

// Task 104 — رازِ رسید نسبت به «ریشهٔ پروژه» حل می‌شود نه cwdِ launch.
// قراردادِ duel-receipt-server: cwdِ سرویس و Next هر دو ریشهٔ پروژه است؛ ولی
// اگر سرویس از پوشهٔ خودش بالا بیاید (bun --hot index.ts داخلِ همین پوشه)،
// راز در مسیرِ تودرتوی mini-services/challenge-service/mini-services/…
// ساخته می‌شود و Next (cwd=ریشه) هرگز پیدایش نمی‌کند → کلِ زنجیرهٔ رسیدِ
// تسکِ ۹۴ سمتِ API با bad_sig می‌میرد (باگِ واقعیِ نوبتِ ۱۳۳۰ — اثباتِ
// قبل/بعد در scripts/qa-receipt-e2e-r104.ts). ریشه از «محلِ خودِ فایل»
// ساخته می‌شود تا هر cwdِ launch نتیجهٔ یکسان بدهد.
const REPO_ROOT = join(import.meta.dir, "..", "..");
if (!existsSync(join(REPO_ROOT, "package.json"))) {
  throw new Error("[boot] ریشهٔ پروژه از محلِ فایل ساخته نشد — index.ts را از جایش جابه‌جا نکنید.");
}

// Task 94 «رسیدِ امضاشدهٔ داوری» — هر پایانِ مسابقه با HMAC امضا می‌شود تا
// ثبتِ نتیجه در /api/stats فقط با رسیدِ معتبر داور ممکن باشد (ضد جعلِ خوداظهاری).
const RECEIPT_SECRET = loadOrCreateReceiptSecret(REPO_ROOT);

// Task 97 «گلوگاهِ ورود» (SEC-5) — سقفِ duel:create/duel:join بر IP؛ ضدِ
// کاویدنِ کدِ اتاق و سیلابِ ساختِ اتاق. مسیرهای API از گام ۵ لیمیت دارند،
// سوکت بیرونِ آن لایه بود — IP از X-Real-IPِ Caddy می‌آید (گیت‌وی می‌نویسد
// و بازنویسی؛ اتصالِ مستقیم فقط loopback است). نخستین ردِ هر سطل در هر
// پنجره یک خط لاگ — بدونِ سیلابِ لاگ.
const ENTRY_GATE = createJoinThrottle({
  onLimit: ({ ip, kind, hits }) =>
    console.warn(`[entry-gate] ${ip} ${kind} — ${hits} تلاش در پنجرهٔ ۶۰ثانیه‌ای`),
});
setInterval(() => ENTRY_GATE.sweep(), 60_000).unref();

// ----------------------------- تنظیمات مسابقه -----------------------------
const PORT = 3003;
const ROOM_SIZE = 2;
const QUESTIONS_PER_DUEL = 10;
// Task 107 «ریتمِ نبرد» — سقفِ زمانِ هر سؤال دیگر ثابتِ جوش‌خورده نیست؛
// سازندهٔ اتاق یکی از سه ریتمِ بستهٔ duel-pace را برمی‌گزیند و عددش با
// clampPaceMs گِرِفت می‌شود. کلاینت تایمرش را از duel:start می‌خواند —
// هیچ سرِ سیمی دیگر عددِ محلیِ خودش را ملاک نمی‌گیرد.
const COUNTDOWN_MS = 5_000; // شمارش معکوس پس از کامل شدن اتاق
const REMATCH_COUNTDOWN_MS = 3_000;
const FORFEIT_GRACE_MS = 12_000; // مهلت بعد از قطع‌شدن حریف وسط مسابقه
const ROOM_TTL_MS = 30 * 60_000; // اتاق‌های خالی جمع‌شونده
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // بدون حروف مبهم

// ----------------------------- بانک سؤال -----------------------------
const BANK: QuizQuestion[] = [...lesson1.quizzes, ...lesson2.quizzes, ...lesson3.quizzes, ...examBank];
const BANK_BY_ID = new Map<string, QuizQuestion>(BANK.map((q) => [q.id, q]));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** یک سؤال مسابقه: id + جایگشت گزینه‌ها + کلید واقعی (فقط سمت سرور) */
function pickDuelQuestion() {
  const q = BANK[Math.floor(Math.random() * BANK.length)];
  const perm = shuffle([0, 1, 2, 3]);
  return { id: q.id, perm, answerReal: perm.indexOf(q.answer) };
}

function makeRoomCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return code;
}

// ----------------------------- مدل اتاق -----------------------------
interface PlayerState {
  sid: string;
  name: string;
  color: string;
  qi: number; // سؤال بعدی که باید جواب بدهد (پیشروی مستقل)
  score: number;
  correct: number;
  answered: number;
  lastAnswerAt: number;
  qStartAt: number; // ساعتِ سؤالِ جاری روی سرور — مبنای پاداش سرعت (SEC)
  // Task 106 «زمانِ فکر» — ساعتِ «دیدنِ» سؤالِ جاری (duel:seen؛ سرور-ساعت).
  // امتیاز همچنان فقط از qStartAt می‌آید؛ seen فقط گزارشِ دیدن→پاسخ را
  // ممکن می‌کند و هیچ راهی به امتیاز/رسید ندارد.
  seenAt: number | null;
  /** نمونهٔ فکرِ هر سؤال (ms) — null = دیده/ثبت نشده؛ نمایشی، بیرونِ رسید */
  thinkSamples: (number | null)[];
  doneAt: number | null;
  disconnected: boolean;
}

interface Room {
  code: string;
  players: Map<string, PlayerState>; // keyed by socket.id
  status: "lobby" | "countdown" | "playing" | "done";
  questions: { id: string; perm: number[]; answerReal: number }[];
  startedAt: number | null;
  countdownTimer: NodeJS.Timeout | null;
  forfeitTimer: NodeJS.Timeout | null;
  rematchVotes: Set<string>;
  createdAt: number;
  leftDuringPlay: boolean; // کسی وسط مسابقه رفته باشد → پایان با برچسب forfeit
  /** Task 107 — ریتمِ برگزیدهٔ سازندهٔ اتاق (گرِفت‌شده با clampPaceMs) */
  paceMs: number;
}

const rooms = new Map<string, Room>();

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
  io.to(room.code).emit("duel:state", roomSummary(room));
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
  const ranked = [...ps].sort((a, b) => b.score - a.score || b.correct - a.correct || (a.doneAt ?? Infinity) - (b.doneAt ?? Infinity));
  const winner =
    finalReason === "forfeit"
      ? ps.find((p) => !p.disconnected)?.sid ?? null
      : ranked.length === ROOM_SIZE && ranked[0].score === ranked[1].score && ranked[0].correct === ranked[1].correct
        ? null
        : ranked[0]?.sid ?? null;

  const endedAt = Date.now();
  // Task 94 — رسیدِ امضاشده: هر دو بازیکن همین رسید را کنار نتیجه به
  // /api/stats می‌فرستند؛ امضای داور تنها راهِ ورودِ ردیفِ نبرد به آمار است.
  const receipt = signDuelEnd(
    {
      code: room.code,
      startedAt: room.startedAt ?? endedAt,
      endedAt,
      reason: finalReason,
      winner,
      players: ps.map((p) => ({ sid: p.sid, name: p.name, score: p.score, correct: p.correct })),
    },
    RECEIPT_SECRET
  );
  io.to(room.code).emit("duel:end", {
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
  room.questions = Array.from({ length: QUESTIONS_PER_DUEL }, pickDuelQuestion);
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
  io.to(room.code).emit("duel:start", {
    perQMs: room.paceMs, // Task 107 — ریتمِ خودِ اتاق، نه ثابتِ سراسری
    total: QUESTIONS_PER_DUEL,
    startedAt: room.startedAt,
    questions: room.questions.map((q) => ({ id: q.id, perm: q.perm })),
  });
  io.to(room.code).emit("duel:progress", progressPayload(room));
}

function scheduleCountdown(room: Room, ms: number) {
  if (room.countdownTimer) clearTimeout(room.countdownTimer);
  room.status = "countdown";
  io.to(room.code).emit("duel:countdown", { ms });
  room.countdownTimer = setTimeout(() => {
    room.countdownTimer = null;
    if (room.players.size === ROOM_SIZE && [...room.players.values()].every((p) => !p.disconnected)) startMatch(room);
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

// ----------------------------- سرور -----------------------------
const httpServer = createServer();
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60_000,
  pingInterval: 25_000,
});

interface Profile {
  name?: unknown;
  color?: unknown;
}

function readProfile(raw: Profile): { name: string; color: string } {
  const name = typeof raw?.name === "string" ? raw.name.trim().slice(0, 24) : "";
  const color = typeof raw?.color === "string" && /^#[0-9a-fA-F]{6}$/.test(raw.color) ? raw.color : "#a8a29e";
  return { name: name || "یادگیرنده", color };
}

io.on("connection", (socket: Socket) => {
  let room: Room | null = null;

  const leaveCurrentRoom = () => {
    if (!room) return;
    const r = room;
    room = null;
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
        socket.to(r.code).emit("duel:opponent-left", { graceMs: FORFEIT_GRACE_MS });
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
  };

  // ------------------------- ساخت اتاق -------------------------
  // Task 107 — سازندهٔ اتاق ریتم را هم برمی‌گزیند (perQMs اختیاری؛
  // سرویسِ قدیمی/کلاینتِ بی‌انتخاب → پیش‌فرضِ ۱۵ثانیه با clampPaceMs)
  socket.on("duel:create", (raw: Profile & { perQMs?: unknown }, ack?: (res: unknown) => void) => {
    if (room) return ack?.({ ok: false, error: "قبلاً در اتاقی هستی." });
    const createGate = ENTRY_GATE.attempt(clientIpOf(socket.handshake), "create");
    if (!createGate.ok) return ack?.({ ok: false, error: entryThrottleError("create", createGate.retryAfterMs) });
    let code = makeRoomCode();
    for (let tries = 0; rooms.has(code) && tries < 20; tries++) code = makeRoomCode();
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
    room = r;
    ack?.({ ok: true, code, state: roomSummary(r) });
    broadcastState(r);
  });

  // ------------------------- پیوستن با کد -------------------------
  socket.on("duel:join", (payload: { code?: unknown } & Profile, ack?: (res: unknown) => void) => {
    if (room) return ack?.({ ok: false, error: "قبلاً در اتاقی هستی." });
    // گلوگاهِ ورود پیشِ جست‌وجوی اتاق — هر تلاش حتی کدِ ناموجود می‌شمارد (ضدِ کاودنِ کد)
    const joinGate = ENTRY_GATE.attempt(clientIpOf(socket.handshake), "join");
    if (!joinGate.ok) return ack?.({ ok: false, error: entryThrottleError("join", joinGate.retryAfterMs) });
    const code = typeof payload?.code === "string" ? payload.code.trim().toUpperCase() : "";
    const r = rooms.get(code);
    if (!r) return ack?.({ ok: false, error: "اتاقی با این کد پیدا نشد." });
    if (r.players.size >= ROOM_SIZE) return ack?.({ ok: false, error: "این اتاق کامل است." });
    if (r.status !== "lobby") return ack?.({ ok: false, error: "مسابقه در جریان است؛ کمی بعد دوباره تلاش کن." });

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
    room = r;
    ack?.({ ok: true, code: r.code, state: roomSummary(r) });
    broadcastState(r);
    // اتاق کامل شد → شمارش معکوس تا شروع
    if (r.players.size === ROOM_SIZE) scheduleCountdown(r, COUNTDOWN_MS);
  });

  // ------------------------- پاسخ به سؤال -------------------------
  // SEC: فیلد ms گزارشیِ کلاینت عمداً نادیده گرفته می‌شود (قرارداد سیمی
  // برای سازگاری رو به جلو حفظ شده) — امتیاز از qStartAt خود سرور می‌آید.
  socket.on("duel:answer", (payload: { qi?: unknown; choice?: unknown; ms?: unknown }) => {
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

    io.to(room.code).emit("duel:progress", progressPayload(room));
    maybeFinish(room);
  });

  // ------------------------- «دیدنِ» سؤال (Task 106) -------------------------
  // کلاینت وقتی سؤال واقعاً رندر شد duel:seen می‌فرستد؛ ساعتش را خودِ سرور
  // می‌زند. فقط اولینِ دیدنِ هر سؤال ثبت می‌شود (دوباره‌فرستادی → نادیده) و
  // فقط برای همان سؤالی که نوبتش است (qi ناهم‌سو → نادیده). امتیاز همچنان
  // فقط از qStartAt می‌آید — seen فقط گزارشِ زمانِ فکر را ممکن می‌کند.
  socket.on("duel:seen", (payload: { qi?: unknown }) => {
    if (!room || room.status !== "playing") return;
    const p = room.players.get(socket.id);
    if (!p || p.doneAt !== null) return;
    if (p.seenAt !== null) return; // اولینِ دیدن ملاک است
    const qi = typeof payload?.qi === "number" ? Math.floor(payload.qi) : -1;
    if (qi !== p.qi) return;
    p.seenAt = Date.now();
  });

  // ------------------------- نبرد دوباره -------------------------
  socket.on("duel:rematch", () => {
    if (!room || room.status !== "done") return;
    if (!room.players.has(socket.id)) return;
    room.rematchVotes.add(socket.id);
    const ready = [...room.players.values()].filter((p) => !p.disconnected);
    if (ready.length === ROOM_SIZE && ready.every((p) => room!.rematchVotes.has(p.sid))) {
      scheduleCountdown(room, REMATCH_COUNTDOWN_MS);
    } else {
      socket.to(room.code).emit("duel:rematch-vote", { voted: room.rematchVotes.size });
    }
  });

  socket.on("duel:leave", () => leaveCurrentRoom());
  socket.on("disconnect", () => leaveCurrentRoom());
});

// ------------------------- سگ‌منت ضد قفل‌شدن + نظافت -------------------------
setInterval(() => {
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
      io.to(room.code).emit("duel:progress", progressPayload(room));
      maybeFinish(room);
    }
  }
}, 2_000);

setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (room.players.size === 0 && now - room.createdAt > ROOM_TTL_MS) {
      if (room.countdownTimer) clearTimeout(room.countdownTimer);
      if (room.forfeitTimer) clearTimeout(room.forfeitTimer);
      rooms.delete(room.code);
    }
  }
}, 60_000);

httpServer.listen(PORT, "127.0.0.1", () => {
  // audit 2026-10-12 (SEC-2): loopback-only — the class gateway (Caddy :81) is
  // the single ingress; direct hits from other machines can no longer reach the
  // duel service (or spoof X-Forwarded-For into the API rate limiters).
  console.log(`⚔️  Vision 2 duel service — bank ${BANK.length} questions — listening on 127.0.0.1:${PORT}`);
});

// audit SEC-5: a thrown error inside a socket handler must not take the
// whole class session down — log and keep serving.
process.on("unhandledRejection", (err) => console.error("[duel] unhandledRejection:", err));
process.on("uncaughtException", (err) => console.error("[duel] uncaughtException:", err));

const shutdown = () => {
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2_000);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
