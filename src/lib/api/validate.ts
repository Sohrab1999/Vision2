import { z } from "zod";

// ------------------------------------------------------------------
// Roadmap Step 5 (audit §10 R-3) — zod schemas for all 9 routes.
//
// Before: ~20 hand-rolled `typeof` sites in 3 styles; /api/stats
// accepted negative and float `lesson` values and non-integer totals
// (audit §7: garbage dilutes the class averages). Now every payload
// is validated by one schema per route — this module is the single
// place that documents the wire contract, and every constraint
// carries a Persian message so the ONE error language stays Persian
// (zod's built-ins would otherwise leak English prose to clients).
//
// Policy: reject garbage (do not silently slice), but keep loose at
// the envelope level so old clients never break.
// ------------------------------------------------------------------

/** profile palette — was duplicated in register + profile routes */
export const LEARNER_COLORS = ["emerald", "amber", "rose", "violet", "sky"] as const;

const colorSchema = z.enum(LEARNER_COLORS, { message: "رنگ انتخابی مجاز نیست." });

/** client-generated learner id (crypto.randomUUID based, ≤ 80 chars) */
const userIdSchema = z
  .string({ message: "شناسهٔ یادگیرنده نامعتبر است." })
  .trim()
  .min(1, "شناسهٔ یادگیرنده نامعتبر است.")
  .max(80, "شناسهٔ یادگیرنده نامعتبر است.");

/** presented write-secret (48-hex today; bounded string for legacy clients) */
const secretSchema = z.string().max(100, "امضای ارسالی نامعتبر است.").optional();

/** /api/register — fresh issue, first-claim and idempotent re-issue */
export const registerSchema = z.object({
  userId: userIdSchema.optional(),
  secret: secretSchema,
  name: z.string().max(100, "نام بیش از حد بلند است.").optional(),
  color: colorSchema.optional(),
});

/** /api/profile GET?userId=… */
export const profileQuerySchema = z.object({
  userId: userIdSchema,
});

/** /api/profile POST — name is the only required field (≥ 2 chars) */
export const profileSchema = z.object({
  userId: userIdSchema,
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(100, "نام بیش از حد بلند است."),
  color: colorSchema.default("emerald"),
  secret: secretSchema,
});

/** /api/stats POST — signed attempt; lesson 0 = exam/rush/duel rows */

/** Task 94 «رسیدِ داوری» — the judge's signed end-of-match receipt (3003) */
const duelReceiptSchema = z.object(
  {
    v: z.literal(1, { message: "نسخهٔ رسیدِ داوری نامعتبر است." }),
    code: z
      .string({ message: "کد اتاقِ رسید نامعتبر است." })
      .min(4, "کد اتاقِ رسید نامعتبر است.")
      .max(8, "کد اتاقِ رسید نامعتبر است."),
    startedAt: z.number({ message: "زمانِ شروعِ رسید نامعتبر است." }).int().min(0),
    endedAt: z.number({ message: "زمانِ پایانِ رسید نامعتبر است." }).int().min(0),
    reason: z.enum(["finished", "forfeit"], { message: "دلیلِ پایانِ رسید نامعتبر است." }),
    winner: z.string().max(64, "شناسهٔ برندهٔ رسید نامعتبر است.").nullable(),
    players: z
      .array(
        z.object({
          sid: z.string().min(1).max(64),
          name: z.string().min(1).max(40),
          score: z.number().int().min(0).max(1_000_000),
          correct: z.number().int().min(0).max(999),
        })
      )
      .length(2, "رسیدِ داوری باید دقیقاً دو بازیکن داشته باشد."),
    sig: z.string({ message: "امضای رسید نامعتبر است." }).regex(/^[0-9a-f]{64}$/, "امضای رسید نامعتبر است."),
  },
  { message: "رسیدِ داوری نامعتبر است." }
);

export const statsSchema = z
  .object({
    userId: userIdSchema,
    secret: secretSchema,
    lesson: z.number().int().min(0, "شمارهٔ درس نامعتبر است.").max(12, "شمارهٔ درس نامعتبر است."),
    category: z.string().trim().min(1, "دسته‌بندی نامعتبر است.").max(40, "دسته‌بندی نامعتبر است."),
    total: z.number().int().min(1, "تعداد سؤال‌ها نامعتبر است.").max(500, "تعداد سؤال‌ها نامعتبر است."),
    correct: z.number().int().min(0, "تعداد پاسخ درست نامعتبر است.").max(500, "تعداد پاسخ درست نامعتبر است."),
    score: z.number().min(0, "امتیاز نامعتبر است.").max(1_000_000, "امتیاز نامعتبر است.").optional(),
    outcome: z.enum(["win", "loss", "tie"], { message: "نتیجهٔ نبرد نامعتبر است." }).optional(),
    /** Task 94 — duel only; rejected server-side without a valid judge receipt */
    duelName: z.string().trim().min(1, "نام داخل نبرد نامعتبر است.").max(40, "نام داخل نبرد نامعتبر است.").optional(),
    receipt: duelReceiptSchema.optional(),
  })
  .refine((v) => v.correct <= v.total, { message: "تعداد پاسخ درست نمی‌تواند از کل سؤال‌ها بیشتر باشد" });

/** /api/sync GET?code=XXXX-XXXX (format normalized again in the route) */
export const syncQuerySchema = z.object({
  code: z.string().max(32, "قالب کد ارسالی نامعتبر است."),
});

/** /api/sync POST — snapshot envelope; data shape checked by dataToString */
export const syncSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(6, "شناسهٔ یادگیرنده نامعتبر است.")
    .max(64, "شناسهٔ یادگیرنده نامعتبر است."),
  code: z.string().max(32, "قالب کد ارسالی نامعتبر است.").optional(),
  data: z.record(z.string(), z.unknown(), { message: "دادهٔ ارسالی باید یک شیء باشد." }),
});

/** /api/event POST — whitelist check lives in the route (isEventName) */
export const eventSchema = z.object({
  name: z.string().max(64, "نام رویداد نامعتبر است."),
});

/** /api/explain POST — question id only; content resolves server-side */
export const explainSchema = z.object({
  id: z.string().trim().min(1, "شناسهٔ سؤال نامعتبر است.").max(40, "شناسهٔ سؤال نامعتبر است."),
});

/** /api/tts POST — text is trimmed to 950 chars in the route */
export const ttsSchema = z.object({
  text: z.string().max(4_000, "متن روخوانی نامعتبر است."),
  speed: z.number().min(0.5, "سرعت روخوانی نامعتبر است.").max(1.6, "سرعت روخوانی نامعتبر است.").default(0.95),
});

/** per-route body caps in bytes (POST only; GET routes need none) */
export const BODY_CAPS = {
  register: 4 * 1024,
  profile: 4 * 1024,
  stats: 4 * 1024,
  event: 1 * 1024,
  explain: 2 * 1024,
  tts: 8 * 1024,
  sync: 700 * 1024, // 600 KB snapshot ceiling + envelope slack
} as const;
