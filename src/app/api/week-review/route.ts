import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, weekReviewSchema } from "@/lib/api/validate";
import { rateLimit } from "@/lib/rate-limit";
import { parseReview } from "@/lib/exam-teacher";
import {
  fallbackWeekReview,
  hasWeekVerdict,
  weekFingerprint,
  type WeekTeacherStats,
} from "@/lib/week-teacher";
import { trackEventServer } from "@/lib/analytics-server";

// ------------------------------------------------------------------
// Task 119 «معلمِ هفته» — the AI teacher's verdict on a whole WEEK,
// as the weekly report band (Task 37/103/109/113) renders it. The
// honest economy of exam-review (117) with one honest difference: a
// week lives in the learner's localStorage, so there is no server bank
// to recompute from. The client ships ONLY the band's own aggregate
// counts (never the raw dayHistory, never question/word content) and
// the route enforces INTERNAL consistency before the teacher reads a
// single number:
//   • zod: bounded ints + two refines (activities = the five counters'
//     sum, duelWins ≤ duels) — an inconsistent envelope never reaches
//     the prompt
//   • the verdict gate: activities = 0 AND duels = 0 → an honest 400 —
//     the teacher never judges an empty week
//   • cached per week fingerprint → every learner with the same week
//     shape reads the same controlled verdict (one paid generation,
//     many reads)
//   • hard rate-limit (10 verdicts / hour / IP) BEFORE the paid call —
//     cached reads stay free (a classroom shares one NAT IP)
//   • graceful fallback: an honest review composed from the REAL stats
//     when the AI is unreachable — never a fabricated praise
// ------------------------------------------------------------------

const QUOTA = 10;
const QUOTA_WINDOW = 60 * 60 * 1000; // 10 verdicts per hour per client
const TIMEOUT_MS = 25_000;

export const runtime = "nodejs";

/** ask the model with a hard timeout so the request never hangs */
async function askModel(prompt: string): Promise<string | null> {
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = (await Promise.race([
      zai.chat.completions.create({
        messages: [
          {
            role: "assistant",
            content:
              "تو معلمِ مهربانِ زبانِ انگلیسیِ یک وب‌کتابِ مدرسه‌ایِ ایرانی (پایهٔ یازدهم، کتاب Vision 2) هستی. " +
              "وظیفه‌ات نوشتنِ «معلمِ هفته» است — قضاوتِ صادق و سازندهٔ یک هفتهٔ یادگیری، فقط بر اساسِ شمارنده‌های واقعیِ هفته. قواعد الزامی:\n" +
              "1) فقط فارسیِ ساده و روان برای دانش‌آموز ۱۶ ساله بنویس.\n" +
              "2) فقط بر اساسِ داده‌های همین هفته قضاوت کن؛ هیچ مطلبِ بیرونی، حدس یا سؤالِ از مخاطب اضافه نکن.\n" +
              "3) صادق باش: روندِ هفته را با عددِ واقعی بخوان (بیشتر/کمتر/همان وزنِ هفتهٔ پیش)؛ اگر روزهای خالی زیادند مهربان اما روشن بگو؛ اگر هفتهٔ کامل و پیوسته بوده صادقانه تبریک بگو.\n" +
              "4) ساختارِ پاسخ دقیقاً سه بخش باشد: یک تا دو جملهٔ قضاوتِ کلی (بدونِ پیشوند)، سپس یک خط با شروعِ دقیق «نقطهٔ قوت:» و سپس یک خط با شروعِ دقیق «تمرینِ پیشنهادی:».\n" +
              "5) «نقطهٔ قوت» باید از قوی‌ترین بُعدِ همان داده‌ها بیاید و «تمرینِ پیشنهادی» یک کارِ مشخص و انجام‌پذیر برای هفتهٔ بعد بدهد — ترجیحاً روی ضعیف‌ترین بُعد.\n" +
              "6) مجموعاً حداکثر ۷۵۰ کاراکتر؛ بدون مارک‌داون، بدون شماره‌گذاری، بدون عنوان.",
          },
          { role: "user", content: prompt },
        ],
        thinking: { type: "disabled" },
      }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS)),
    ])) as Awaited<ReturnType<typeof zai.chat.completions.create>>;
    const text = completion.choices?.[0]?.message?.content?.trim() ?? "";
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/** the per-dimension count line — duels keep their honest null as «بی‌دفترچه» */
function dimLine(label: string, n: number | null): string {
  return n == null ? `- ${label}: دفترچه‌ای نیست` : `- ${label}: ${n}`;
}

/** compose the prompt ONLY from the validated aggregate shape */
function buildWeekPrompt(s: WeekTeacherStats): string {
  const diff = s.activities - s.prevActivities;
  const trend =
    s.prevActivities === 0
      ? "هفتهٔ پیش بدون فعالیت بوده (آغازِ مسیر)."
      : diff > 0
        ? `این هفته ${diff} فعالیت بیشتر از هفتهٔ پیش است.`
        : diff < 0
          ? `این هفته ${Math.abs(diff)} فعالیت کمتر از هفتهٔ پیش است.`
          : "فعالیتِ این هفته دقیقاً هم‌وزنِ هفتهٔ پیش است.";
  const duelPart =
    s.duels == null
      ? "دفترچهٔ نبرد موجود نیست."
      : `${s.duels} نبرد این هفته (${s.duelWins} برد، بهترین امتیازِ ${s.duelBest}${
          s.thinkAvgMs != null ? `، میانگینِ فکرِ ${(s.thinkAvgMs / 1000).toFixed(1)} ثانیه` : ""
        }).`;
  const parts = [
    "یک دانش‌آموز منتظرِ «معلمِ هفته» است — قضاوتِ یک هفتهٔ یادگیری از هفته‌نامه‌اش:",
    `مجموعِ فعالیت: ${s.activities} (${dimLine("مرور لغت", s.reviews)}، ${dimLine("آزمون", s.quizzes)}، ${dimLine("واژهٔ نو", s.words)}، ${dimLine("دیکته", s.dictation)}، ${dimLine("چالشِ برق‌آسا", s.rush)})`,
    `${s.activeDays} روز از ۷ روز فعال بود؛ هدفِ روزانه در ${s.goalDays} روز کامل شد.`,
    trend,
    duelPart,
    s.quickWeek ? "این هفته نشانِ «هفتهٔ چابک/برق» (سریع‌اندیشی و دقت در نبردها) گرفته است." : "",
    `زنجیرهٔ روزهای پشت‌سرهمِ فعلی: ${s.streak}.`,
    `طبق قواعد سیستم، معلمِ هفته را در سه بخشِ مقرر بنویس.`,
  ];
  return parts.filter(Boolean).join("\n");
}

export const POST = withApi(
  { key: "week-review", bodyCap: BODY_CAPS.weekReview, schema: weekReviewSchema },
  async ({ parsed, req, json }) => {
    // 1) the verdict gate — one evaluator shared with the UI render guard:
    //    an empty week (no activity, no duel) is never judged
    if (!hasWeekVerdict(parsed)) {
      throw ApiError.bad(
        "این هفته هیچ فعالیت و نبردی برای داوری ندارد — معلمِ هفته هفتهٔ خالی را قضاوت نمی‌کند."
      );
    }

    // 2) cached? the same week shape earns the same controlled verdict
    const fingerprint = weekFingerprint(parsed);
    try {
      const hit = await db.weekReviewCache.findUnique({ where: { key: fingerprint } });
      if (hit) {
        trackEventServer("week_review_served");
        return json({
          fingerprint,
          intro: hit.intro,
          strength: hit.strength,
          advice: hit.advice,
          source: hit.source,
          cached: true,
        });
      }
    } catch {
      /* cache read failure is non-fatal — continue to generation */
    }

    // 3) hard quota BEFORE any paid call (cached reads above stay free)
    const verdict = rateLimit(req, "week-review-gen", QUOTA, QUOTA_WINDOW);
    if (!verdict.ok) return verdict.response!;

    // 4) the prompt is composed ONLY from the validated aggregates
    const prompt = buildWeekPrompt(parsed);

    const raw = await askModel(prompt);
    const parsedReview = raw ? parseReview(raw) : null;
    const review = parsedReview ?? fallbackWeekReview(parsed);
    const source = parsedReview ? "ai" : "fallback";

    // 5) store once, serve forever (best-effort — races are fine)
    try {
      await db.weekReviewCache.upsert({
        where: { key: fingerprint },
        update: {},
        create: { key: fingerprint, intro: review.intro, strength: review.strength, advice: review.advice, source },
      });
    } catch {
      /* concurrent write conflict is harmless */
    }

    trackEventServer(source === "ai" ? "week_review_generated" : "week_review_fallback");
    return json({ fingerprint, ...review, source, cached: false });
  }
);
