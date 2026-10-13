// ------------------------------------------------------------------
// Vision 2 — سرویس داوری «نبرد دودنفره» (چالش زندهٔ واژگانی)
// socket.io روی پورت ۳۰۰۳ — داوری متمرکز و ضد تقلب:
//   • سرور خودش بانک سؤال را دارد و «درستیِ» هر پاسخ را خودش
//     اعتبارسنجی می‌کند (هیچ اعتمادی به گزارش کلاینت نیست).
//   • امتیاز سرعت هم مرجع-سرور است (scoring.ts) — گزارش ms کلاینت
//     خوانده نمی‌شود؛ ساعت هر سؤال روی خودِ سرور تیک می‌خورد.
//   • ترتیب سؤال‌ها و بُر خوردن گزینه‌ها (perm) سمت سرور تولید می‌شود
//     تا هر دو بازیکن دقیقاً همان گزینه‌ها را با همان ترتیب ببینند.
//   • کلاینت فقط id سؤال + perm را می‌گیرد و متن را از بانک استاتیک
//     خودش رندر می‌کند → ترافیک کم و بدون نشتِ کلید پاسخ.
//
// Task 122 — منطقِ اتاق و پروتکل به room-manager.ts کوچ کرد (گام ۱۰:
// زیرساختِ تستِ روتِ ۳۰۰۳)؛ Task 146 — آخرین سه تصمیمِ سیم (گیتِ بلیت،
// انتخابِ سؤال، تاسِ کد) هم به wiring.ts کوچید («زیرساختِ دومین تستِ
// ۳۰۰۳») — این فایل واقعاً فقط سیم است: رازها، بانکِ سؤال، سوکت‌ایو،
// فاصله‌سنج‌ها و چرخهٔ فرایند. رفتارِ سیمی حرف‌به‌حرف همان است —
// تستِ هرمتیک: tests/duel-room-service.test.ts (پروتکل) و
// tests/duel-service-wiring.test.ts (قطعاتِ تصمیم).
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
import { createJoinThrottle } from "../../src/lib/join-throttle";
import { loadOrCreateTicketSecret } from "../../src/lib/duel-ticket-server";
import { createTicketVault } from "../../src/lib/duel-ticket";
import { createDuelRoomService } from "./room-manager";
import {
  createEntryTicketGuard,
  createQuestionPicker,
  createRoomCodeMaker,
} from "./wiring";

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
// ثبتِ نتیجه در /api/stats فقط با رسیدِ معتبر داور ممکن است (ضد جعلِ خوداظهاری).
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

// Task 112 «بلیتِ ورود» (SEC-5 — آخرین دهانهٔ باز) — duel:create/duel:join
// فقط با بلیتی که Next با شناسهٔ احرازشدهٔ یادگیرنده ضرب کرده است.
// راز از همان الگوی رسیدِ تسک ۹۴: فایل ۰۶۰۰، داور هنگام بوت می‌سازد.
// گنبدِ nonce یک‌بارمصرف را نگه می‌دارد؛ sweep هر دقیقه — unref تا سرویس
// تنها مانعِ خروج نباشد. ردِ بلیت قبل از گلوگاهِ نرخ می‌آید تا کوبیدنِ
// بی‌بلیت، بودجهٔ IPِ کاربرانِ واقعی را نسوزاند و حافظه هم بی‌اثر بماند.
const TICKET_SECRET = loadOrCreateTicketSecret(REPO_ROOT);
const TICKET_VAULT = createTicketVault();
setInterval(() => TICKET_VAULT.sweep(), 60_000).unref();

// Task 146 — قطعاتِ تصمیم به wiring.ts کوچیدند؛ اینجا فقط نمونه‌سازی با
// راز/گنبدِ واقعی و تاسِ Math.random — رفتارِ سیمی حرف‌به‌حرف همانِ قدیم.
const entryTicketGuard = createEntryTicketGuard({ secret: TICKET_SECRET, vault: TICKET_VAULT });

// ----------------------------- تنظیمات مسابقه -----------------------------
const PORT = 3003;

// ----------------------------- بانک سؤال -----------------------------
const BANK: QuizQuestion[] = [...lesson1.quizzes, ...lesson2.quizzes, ...lesson3.quizzes, ...examBank];

const pickDuelQuestion = createQuestionPicker({ bank: BANK, rng: Math.random });
const makeRoomCode = createRoomCodeMaker({ rng: Math.random });

// ----------------------------- سرویسِ اتاق -----------------------------
const service = createDuelRoomService({
  bus: {
    emitToRoom: (code, event, payload) => io.to(code).emit(event, payload),
    emitToRoomExcept: (code, event, payload, exceptSid) => io.to(code).except(exceptSid).emit(event, payload),
  },
  entryGuard: entryTicketGuard,
  gate: ENTRY_GATE,
  signEnd: (payload) => signDuelEnd(payload, RECEIPT_SECRET),
  pickQuestion: pickDuelQuestion,
  makeCode: makeRoomCode,
});

// ----------------------------- سرور -----------------------------
const httpServer = createServer();
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60_000,
  pingInterval: 25_000,
});

io.on("connection", (socket: Socket) => {
  // task 122 — بستنِ پروتکل روی سرویسِ تزریقی؛ هر هندلر یک فراخوانیِ مستقیم.
  socket.on("duel:create", (raw: unknown, ack?: (res: unknown) => void) => service.handleCreate(socket, raw, ack));
  socket.on("duel:join", (payload: unknown, ack?: (res: unknown) => void) => service.handleJoin(socket, payload, ack));
  socket.on("duel:answer", (payload: unknown) => service.handleAnswer(socket, payload));
  socket.on("duel:seen", (payload: unknown) => service.handleSeen(socket, payload));
  socket.on("duel:rematch", () => service.handleRematch(socket));
  socket.on("duel:leave", () => service.handleLeave(socket));
  socket.on("disconnect", () => service.handleLeave(socket));
});

// سگ‌منتِ ضد قفل‌شدن و نظافتِ اتاق‌های خالی — هر ۲ثانیه / هر ۶۰ثانیه
setInterval(() => service.sweepWatchdog(), 2_000);
setInterval(() => service.sweepTtl(), 60_000);

httpServer.listen(PORT, "127.0.0.1", () => {
  // audit 2026-10-12 (SEC-2): loopback-only — the class gateway (Caddy :81) is
  // the single ingress; direct hits from other machines can no longer reach the
  // duel service (or spoof X-Forwarded-For into the API rate limiters).
  console.log(
    `⚔️  Vision 2 duel service — bank ${BANK.length} questions — listening on 127.0.0.1:${PORT}`
  );
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
