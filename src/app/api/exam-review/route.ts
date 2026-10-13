import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, reviewSchema } from "@/lib/api/validate";
import { rateLimit } from "@/lib/rate-limit";
import { findQuestion, categoryFa } from "@/lib/explain-source";
import {
  buildSessionDigest,
  reviewFingerprint,
  parseReview,
  fallbackReview,
  normalizeAnswer,
  type TeacherAnswer,
} from "@/lib/exam-teacher";
import { trackEventServer } from "@/lib/analytics-server";

// ------------------------------------------------------------------
// Task 117 «معلمِ کارنامه» — the AI teacher's honest review of a
// finished quiz session. Same constrained economy as F8 explain and
// Task 116 story:
//   • input  = question ids + raw chosen indices only; every question
//     resolves server-side from the bundled banks and correctness is
//     recomputed HERE from the real keys — the client can claim any
//     answer it likes, the teacher still reads the truth
//   • output = three controlled Persian sections (intro / «نقطهٔ قوت:» /
//     «تمرینِ پیشنهادی:»), hard-capped and markdown-stripped
//   • cached per session fingerprint → every learner finishing the same
//     session pattern reads the same controlled review (one paid
//     generation, many reads)
//   • hard rate-limit (10 reviews / hour / IP) BEFORE the paid call —
//     cached reads stay free (a classroom shares one NAT IP)
//   • graceful fallback: an honest review composed from the REAL digest
//     when the AI is unreachable — never a fabricated praise
// ------------------------------------------------------------------

const QUOTA = 10;
const QUOTA_WINDOW = 60 * 60 * 1000; // 10 reviews per hour per client
const TIMEOUT_MS = 25_000;

export const runtime = "nodejs";

/** category label for the prompt — explain-source's categoryFa takes a
 *  full question; this digest row only carries the raw category key, so
 *  a minimal adapter reuses the same mapping without touching banks */
function catLabel(category: string): string {
  return categoryFa({ category } as Parameters<typeof categoryFa>[0]);
}

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
              "وظیفه‌ات نوشتنِ «معلمِ کارنامه» برای یک جلسهٔ آزمونِ تمام‌شده است — قضاوتی صادق و سازنده فقط بر اساسِ داده‌های واقعیِ جلسه. قواعد الزامی:\n" +
              "1) فقط فارسیِ ساده و روان برای دانش‌آموز ۱۶ ساله بنویس.\n" +
              "2) فقط بر اساسِ داده‌های جلسه قضاوت کن؛ هیچ مطلبِ بیرونی، حدس یا سؤالِ از مخاطب اضافه نکن.\n" +
              "3) صادق باش: اگر اشتباه‌ها زیادند مهربان اما روشن بگو؛ اگر همه درست است صادقانه تبریک بگو و فکرِ متوقف‌شدن را از ذهن بینداز.\n" +
              "4) ساختارِ پاسخ دقیقاً سه بخش باشد: یک تا دو جملهٔ قضاوتِ کلی (بدونِ پیشوند)، سپس یک خط با شروعِ دقیق «نقطهٔ قوت:» و سپس یک خط با شروعِ دقیق «تمرینِ پیشنهادی:».\n" +
              "5) «نقطهٔ قوت» باید از بهترین مهارتِ همان داده‌ها بیاید (اگر هیچ مهارتی خوب نبود، صادقانه چیزی مثبت و واقعی بیاب) و «تمرینِ پیشنهادی» یک کارِ مشخص و انجام‌پذیر برای روزهای بعد بدهد.\n" +
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

export const POST = withApi(
  { key: "exam-review", bodyCap: BODY_CAPS.examReview, schema: reviewSchema },
  async ({ parsed, req, json }) => {
    // 1) resolve EVERY id server-side — all-or-nothing keeps the teacher's
    //    verdict identical to the session the learner actually saw
    const items: TeacherAnswer[] = parsed.ids.map((id, i) => ({ id, ans: parsed.answers[i] ?? null }));
    const resolved: { q: Exclude<ReturnType<typeof findQuestion>, undefined>; ans: number | null }[] = [];
    for (const it of items) {
      const q = findQuestion(it.id);
      if (!q) {
        throw ApiError.bad(
          "این جلسه سؤال‌هایی بیرون از بانکِ وب‌کتاب دارد؛ معلمِ کارنامه فقط جلسه‌های بانکِ خودِ کتاب را داوری می‌کند."
        );
      }
      resolved.push({ q, ans: normalizeAnswer(it.ans, q) });
    }

    // 2) cached? the same session pattern earns the same controlled review
    const fingerprint = reviewFingerprint(items);
    try {
      const hit = await db.reviewCache.findUnique({ where: { key: fingerprint } });
      if (hit) {
        trackEventServer("exam_review_served");
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
    const verdict = rateLimit(req, "exam-review-gen", QUOTA, QUOTA_WINDOW);
    if (!verdict.ok) return verdict.response!;

    // 4) the prompt is composed ONLY from the resolved digest
    const digest = buildSessionDigest(resolved);
    const categoryLines = digest.perCategory
      .map((c) => `- ${catLabel(c.category)}: ${c.correct} درست از ${c.total}`)
      .join("\n");
    const wrongLines = digest.wrongDetail
      .map(
        (w) =>
          `- [${catLabel(w.category)}] ${w.text} | پاسخِ او: ${w.chosen ?? "بی‌پاسخ"} | درست: ${w.correct}`
      )
      .join("\n");
    const promptParts = [
      `یک دانش‌آموز این جلسهٔ آزمون را تمام کرده و منتظرِ «معلمِ کارنامه» است:`,
      `نتیجه: ${digest.correct} درست از ${digest.total} سؤال (${digest.percent}٪)؛ ${digest.wrong} اشتباه؛ ${digest.unanswered} بی‌پاسخ.`,
      categoryLines ? `عملکرد به تفکیک مهارت:\n${categoryLines}` : "",
      wrongLines ? `سؤال‌های اشتباه (نمونه‌های مهم):\n${wrongLines}` : "",
      digest.wrongExtra > 0 ? `(${digest.wrongExtra} سؤالِ اشتباهِ دیگر هم در جلسه بود.)` : "",
      `طبق قواعد سیستم، معلمِ کارنامه را در سه بخشِ مقرر بنویس.`,
    ];
    const prompt = promptParts.filter(Boolean).join("\n\n");

    const raw = await askModel(prompt);
    const parsedReview = raw ? parseReview(raw) : null;
    const review = parsedReview ?? fallbackReview(digest);
    const source = parsedReview ? "ai" : "fallback";

    // 5) store once, serve forever (best-effort — races are fine)
    try {
      await db.reviewCache.upsert({
        where: { key: fingerprint },
        update: {},
        create: { key: fingerprint, intro: review.intro, strength: review.strength, advice: review.advice, source },
      });
    } catch {
      /* concurrent write conflict is harmless */
    }

    trackEventServer(source === "ai" ? "exam_review_generated" : "exam_review_fallback");
    return json({ fingerprint, ...review, source, cached: false });
  }
);
