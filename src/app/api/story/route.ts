import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, storySchema } from "@/lib/api/validate";
import { rateLimit } from "@/lib/rate-limit";
import { resolveStar } from "@/lib/my-words-resolve";
import {
  selectStoryWords,
  storyFingerprint,
  parseStory,
  fallbackStory,
} from "@/lib/story-forge";
import { trackEventServer } from "@/lib/analytics-server";

// ------------------------------------------------------------------
// Task 116 «داستانِ واژه‌های من» — a tiny AI tale starring the
// learner's starred words. Same constrained economy as F8 explain:
//   • input  = wordKeys only (content resolved server-side via the
//     shared resolveStar — the client never ships word text)
//   • output = ≤700-char simple English story (A2–B1) + one Persian
//     summary line; cached per word-set fingerprint → every learner
//     starring the same set sees the same controlled story
//   • hard rate-limit (10 generations / hour / IP) BEFORE the paid call
//   • graceful fallback exercise when the AI is unavailable
// ------------------------------------------------------------------

const QUOTA = 10;
const QUOTA_WINDOW = 60 * 60 * 1000; // 10 generations per hour per client
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
              "تو راویِ داستانِ کوتاهِ یک وب‌کتاب مدرسه‌ای ایرانی (پایهٔ یازدهم، کتاب Vision 2) هستی. " +
              "وظیفه‌ات ساختنِ یک داستانِ کوتاهِ انگلیسی با واژه‌هایی که دانش‌آموز نشان کرده است. قواعد الزامی:\n" +
              "1) یک داستان انگلیسیِ ساده (سطح A2 تا B1) در ۵ تا ۸ جمله بنویس که همهٔ واژه‌های داده‌شده را دست‌کم یک‌بار به کار ببرد.\n" +
              "2) موضوع روزمره و دلنشین باشد (مدرسه، خانواده، دوستی، طبیعت) و برای دانش‌آموز ۱۶ ساله مناسب.\n" +
              "3) واژه‌های هدف را دقیقاً به همان شکلِ داده‌شده یا با صرفِ سادهٔ گرامری (جمع، زمان) بیاور؛ واژهٔ بی‌ربطِ تازه معرفی نکن.\n" +
              "4) از واژه‌های دشوارتر از خودِ واژه‌های هدف پرهیز کن؛ جمله‌ها کوتاه و روشن باشند.\n" +
              "5) در پایان یک خطِ جدا فقط با این قالب بنویس: «خلاصه: » و یک جملهٔ فارسیِ روان که پیامِ داستان را می‌گوید.\n" +
              "6) بدون مارک‌داون، بدون شماره‌گذاری، بدون عنوان — فقط متنِ داستان و خطِ خلاصه.",
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
  { key: "story", bodyCap: BODY_CAPS.story, schema: storySchema },
  async ({ parsed, req, json }) => {
    // 1) resolve every key server-side — dangling stars are dropped; fewer
    //    than 4 real words cannot feed a tale (honest 400, not a forced one)
    const words = selectStoryWords(parsed.keys, (key) => {
      const hit = resolveStar(key);
      return hit ? { key: hit.key, en: hit.en, fa: hit.fa } : null;
    });
    if (!words) {
      throw ApiError.bad("واژه‌های معتبر برای ساخت داستان کافی نیست — دست‌کم ۴ واژهٔ درست نشان کن.");
    }

    // 2) cached? the same word-set tells the same controlled story
    const fingerprint = storyFingerprint(words);
    try {
      const hit = await db.storyCache.findUnique({ where: { key: fingerprint } });
      if (hit) {
        trackEventServer("story_served");
        return json({
          fingerprint,
          story: hit.story,
          summary: hit.summary,
          source: hit.source,
          cached: true,
          words,
        });
      }
    } catch {
      /* cache read failure is non-fatal — continue to generation */
    }

    // 3) hard quota BEFORE any paid call (cached reads above stay free)
    const verdict = rateLimit(req, "story-gen", QUOTA, QUOTA_WINDOW);
    if (!verdict.ok) return verdict.response!;

    const prompt =
      `یک دانش‌آموز ایرانی این واژه‌های انگلیسی را از کتابِ خودش نشان کرده و می‌خواهد با آن‌ها یک داستانِ کوتاه بخواند:\n\n` +
      words.map((w) => `- ${w.en} (${w.fa})`).join("\n") +
      `\n\nطبق قواعد سیستم، داستان را بساز و در پایان خطِ «خلاصه:» را بنویس.`;

    const raw = await askModel(prompt);
    const parsedStory = raw ? parseStory(raw) : null;
    const story = parsedStory ?? fallbackStory(words);
    const source = parsedStory ? "ai" : "fallback";

    // 4) store once, serve forever (best-effort — races are fine)
    try {
      await db.storyCache.upsert({
        where: { key: fingerprint },
        update: {},
        create: { key: fingerprint, story: story.story, summary: story.summary, source },
      });
    } catch {
      /* concurrent write conflict is harmless */
    }

    trackEventServer(source === "ai" ? "story_generated" : "story_fallback");
    return json({ fingerprint, ...story, source, cached: false, words });
  }
);
