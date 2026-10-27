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

/** /api/sync POST — snapshot envelope; data shape checked by dataToString.
 *  راند ۲۳۶ — resume (نشانگرِ «ادامهٔ مطالعه») اختیاری و مات: سرور فقط
 *  قابِ شیء را می‌پذیرد؛ پالایشِ محتوایی با sanitizeResumeInput سمتِ
 *  کلاینتِ گیرنده است. */
export const syncSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(6, "شناسهٔ یادگیرنده نامعتبر است.")
    .max(64, "شناسهٔ یادگیرنده نامعتبر است."),
  code: z.string().max(32, "قالب کد ارسالی نامعتبر است.").optional(),
  data: z.record(z.string(), z.unknown(), { message: "دادهٔ ارسالی باید یک شیء باشد." }),
  resume: z.record(z.string(), z.unknown()).optional(),
});

/** /api/event POST — whitelist check lives in the route (isEventName) */
export const eventSchema = z.object({
  name: z.string().max(64, "نام رویداد نامعتبر است."),
});

/** /api/event GET — r350 «نبضِ کامل»: an OPTIONAL days window for the
 *  per-day series. Without it the response shape stays byte-identical to
 *  the F10 contract (the frozen settings-pulse consumer). */
export const eventQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .min(1)
    .max(30)
    .optional(),
});

/** /api/teacher/learner GET — r353 «عمقِ پنلِ معلم»: the opaque HMAC
 *  handle only (16 lowercase hex chars). No userId ever crosses the
 *  query line — the handle is re-derived server-side from profiles. */
export const teacherLearnerQuerySchema = z.object({
  handle: z
    .string()
    .regex(/^[0-9a-f]{16}$/, "شناسهٔ یادگیرنده نامعتبر است."),
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

/** /api/duel-ticket POST (Task 112) — learner credentials; ticket comes back */
export const duelTicketSchema = z.object({
  userId: userIdSchema,
  secret: z
    .string({ message: "امضای ارسالی نامعتبر است." })
    .min(1, "امضای ارسالی نامعتبر است.")
    .max(100, "امضای ارسالی نامعتبر است."),
});

/** /api/client-error POST (Task 292) — crash telemetry from the learner's
 *  device. The error boundary + global hooks report here so a crash that
 *  only happens with a REAL learner's long-lived state becomes diagnosable
 *  (the QA sessions can never reproduce those). Stack is bounded hard —
 *  this is a diagnostic breadcrumb, not a log dump. */
export const clientErrorSchema = z.object({
  kind: z.enum(["boundary", "error", "rejection"], { message: "نوع گزارش نامعتبر است." }),
  message: z
    .string({ message: "پیام خطا نامعتبر است." })
    .trim()
    .min(1, "پیام خطا نامعتبر است.")
    .max(500, "پیام خطا نامعتبر است."),
  stack: z.string().max(4_000, "ردپای خطا نامعتبر است.").optional(),
  digest: z.string().max(120, "شناسهٔ خطا نامعتبر است.").optional(),
  view: z.string().max(60, "نمای جاری نامعتبر است.").optional(),
  path: z.string().max(200, "مسیر نامعتبر است.").optional(),
});

/** /api/story POST (Task 116) — 4..20 word keys for the story builder */
export const storySchema = z.object({
  keys: z
    .array(
      z
        .string({ message: "کلید واژه نامعتبر است." })
        .trim()
        .min(1, "کلید واژه نامعتبر است.")
        .max(60, "کلید واژه نامعتبر است."),
      { message: "کلید واژه نامعتبر است." },
    )
    .min(4, "کلید واژه نامعتبر است.")
    .max(20, "کلید واژه نامعتبر است."),
});

/** /api/exam-review POST (Task 117) — question ids + raw chosen indices;
 *  correctness recomputes server-side, equal lengths enforced */
export const reviewSchema = z
  .object({
    ids: z
      .array(
        z
          .string({ message: "شناسهٔ سؤال نامعتبر است." })
          .trim()
          .min(1, "شناسهٔ سؤال نامعتبر است.")
          .max(60, "شناسهٔ سؤال نامعتبر است."),
        { message: "شناسهٔ سؤال نامعتبر است." },
      )
      .min(1, "شناسهٔ سؤال نامعتبر است.")
      .max(40, "شناسهٔ سؤال نامعتبر است."),
    answers: z
      .array(
        z
          .number({ message: "پاسخ نامعتبر است." })
          .int("پاسخ نامعتبر است.")
          .nullable(),
        { message: "پاسخ نامعتبر است." },
      )
      .max(40, "پاسخ نامعتبر است."),
  })
  .refine((v) => v.ids.length === v.answers.length, {
    message: "تعداد پاسخ‌ها با سؤال‌ها همخوان نیست.",
  });

/** /api/jozve-search GET (r410) — text search across the jozve library */
export const jozveSearchQuerySchema = z.object({
  q: z
    .string({ message: "عبارت جست‌وجو نامعتبر است." })
    .trim()
    .min(2, "عبارت جست‌وجو نامعتبر است.")
    .max(80, "عبارت جست‌وجو نامعتبر است."),
  grade: z.coerce
    .number({ message: "پایه نامعتبر است." })
    .int("پایه نامعتبر است.")
    .min(7, "پایه نامعتبر است.")
    .max(12, "پایه نامعتبر است.")
    .optional(),
  kind: z.enum(["text", "question"], { message: "نوع نتیجه نامعتبر است." }).optional(),
  limit: z.coerce
    .number({ message: "سقف نتیجه نامعتبر است." })
    .int("سقف نتیجه نامعتبر است.")
    .min(1, "سقف نتیجه نامعتبر است.")
    .max(60, "سقف نتیجه نامعتبر است.")
    .default(30),
});

/** /api/week-review POST (Task 119) — the honest week ledger; the two
 *  consistency refines keep the client honest: the activity sum must add
 *  up and duel wins can never exceed the ledger's duels (null = no ledger) */
export const weekReviewSchema = z
  .object({
    activities: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    reviews: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    quizzes: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    words: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    dictation: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    rush: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    activeDays: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(7, "شکل هفتهٔ ارسالی نامعتبر است."),
    goalDays: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(7, "شکل هفتهٔ ارسالی نامعتبر است."),
    prevActivities: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    bestDay: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است.").nullable(),
    duels: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است.").nullable(),
    duelWins: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(5000, "شکل هفتهٔ ارسالی نامعتبر است."),
    duelBest: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(100000, "شکل هفتهٔ ارسالی نامعتبر است."),
    thinkAvgMs: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(600000, "شکل هفتهٔ ارسالی نامعتبر است.").nullable(),
    quickWeek: z.boolean({ message: "شکل هفتهٔ ارسالی نامعتبر است." }),
    streak: z.number({ message: "شکل هفتهٔ ارسالی نامعتبر است." }).int("شکل هفتهٔ ارسالی نامعتبر است.").min(0, "شکل هفتهٔ ارسالی نامعتبر است.").max(3650, "شکل هفتهٔ ارسالی نامعتبر است."),
  })
  .refine((v) => v.activities === v.reviews + v.quizzes + v.words + v.dictation + v.rush, {
    message: "جمع فعالیت‌های هفته با سطرهای کارنامه هم‌خوان نیست.",
  })
  .refine((v) => v.duels === null || v.duelWins <= v.duels, {
    message: "تعداد برد دوئل با دفتر دوئل‌ها هم‌خوان نیست.",
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
  duelTicket: 1 * 1024, // { userId, secret } — tiny
  clientError: 6 * 1024, // bounded breadcrumb — message+stack caps above
  story: 2 * 1024, // 4..20 word keys
  examReview: 4 * 1024, // 1..40 id+answer pairs
  weekReview: 2 * 1024, // the flat week ledger — small ints only
} as const;
