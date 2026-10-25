import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, explainSchema } from "@/lib/api/validate";
import { rateLimit } from "@/lib/rate-limit";
import { findQuestion, categoryFa } from "@/lib/explain-source";
import { trackEventServer } from "@/lib/analytics-server";
import { bumpExplainMeter, explainMonthUsage } from "@/lib/explain-meter";

// ------------------------------------------------------------------
// F8 «چرا غلط شد؟» — AI explanation of wrong answers.
// Constrained MVP per the roadmap:
//   • input  = question id only (content resolved server-side)
//   • output = ≤420-char simple Persian explanation + one example
//   • cached per question id in SQLite → every learner sees the same
//     controlled answer (one paid generation, many reads)
//   • hard rate-limit (20 generations / hour / IP) BEFORE calling the LLM
//   • graceful fallback text when the AI is unavailable
//
// Roadmap Step 5: withApi handles validation + error shape; the rate
// limit stays INSIDE the handler on purpose — cached reads must remain
// free (a whole classroom shares one NAT IP), only paid generations
// consume the quota.
// r348: the paid path also has a MONTHLY generation budget (ExplainMeter,
// env-tunable — the r347 TTS budget's sibling). Metering fails OPEN — a
// broken meter never takes the explanation away; the gate only closes
// the route when the meter itself proves the month is spent. Only REAL
// ai generations meter (+1 each): cached reads and SDK-down fallback
// text are free and unmetered. The 429 speaks its own code
// ('explain_quota') so ExplainBox can tell the learner the SPECIFIC
// reason (inline monthly state + the once-a-day 'explain-quota'
// window event → pwa-layer toast).
// ------------------------------------------------------------------

const QUOTA = 20;
const QUOTA_WINDOW = 60 * 60 * 1000; // 20 generations per hour per client
const MAX_LEN = 420;
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
              "تو معلم مهربان زبان انگلیسیِ یک وب‌کتاب مدرسه‌ای ایرانی (پایهٔ یازدهم، کتاب Vision 2) هستی. " +
              "وظیفه‌ات توضیح «چرا این گزینه درست است» برای یک سؤال چهارگزینه‌ای است. قواعد الزامی:\n" +
              "1) فقط فارسی ساده و روان برای دانش‌آموز ۱۶ ساله بنویس.\n" +
              "2) فقط بر اساس متن سؤال، گزینه‌های داده‌شده و کلیدِ اعلام‌شده توضیح بده؛ از دانش بیرونی یا مطلبِ اضافه استفاده نکن.\n" +
              "3) از ترجمهٔ تحت‌اللفظی پرهیز کن؛ به نکتهٔ معنایی یا گرامریِ تعیین‌کننده اشاره کن.\n" +
              "4) واژه‌ها و مثال انگلیسی را با نام گزینه مطابقت بده؛ واژهٔ جدیدِ بی‌ربط معرفی نکن.\n" +
              "5) حداکثر ۴۰۰ کاراکتر. بدون مارک‌داون، بدون فهرست، فقط متن ساده.\n" +
              "6) ساختار پاسخ دقیقاً این‌گونه باشد: یک تا دو جملهٔ توضیح، سپس خط دوم با شروع «مثال: » و یک جملهٔ مثال کوتاه انگلیسی با ترجمهٔ فارسی داخل پرانتز.",
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

/** keep only clean plain text, enforce the length ceiling */
function sanitize(raw: string): string {
  const clean = raw
    .replace(/[*_`#>]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
  if (clean.length <= MAX_LEN) return clean;
  const cut = clean.slice(0, MAX_LEN);
  const lastStop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("،"), cut.lastIndexOf("\n"));
  return (lastStop > 200 ? cut.slice(0, lastStop + 1) : cut).trim();
}

function fallbackText(correctOption: string): string {
  return (
    `پاسخ درست «${correctOption}» است. برای فهم بهتر، واژهٔ کلیدی این سؤال را در فلش‌کارت‌های همان درس دوباره مرور کن ` +
    `و جملهٔ سؤال را یک بار با گزینهٔ درست بلند بخوان تا جایگاه واژه در ذهنت جا بیفتد.\n` +
    `مثال: سؤال را با گزینهٔ درست برای خودت بازسازی کن تا معنا تثبیت شود.`
  );
}

export const POST = withApi(
  { key: "explain", bodyCap: BODY_CAPS.explain, schema: explainSchema },
  async ({ parsed, req, json }) => {
    const id = parsed.id;

    // 1) resolve the question server-side — unknown ids are rejected
    const q = findQuestion(id);
    if (!q) {
      throw ApiError.notFound("سؤالی با این شناسه در بانک وب‌کتاب نیست.");
    }

    // 2) cached? same controlled answer for everyone
    try {
      const hit = await db.explainCache.findUnique({ where: { key: id } });
      if (hit) {
        trackEventServer("explain_served");
        return json({ id, explanation: hit.explanation, cached: true, source: hit.source });
      }
    } catch {
      /* cache read failure is non-fatal — continue to generation */
    }

    // 3) r348 — the monthly gate, on the expensive path only, BEFORE the
    //    paid call (and before the hourly limiter — one small DB read vs
    //    burning a bucket hour on a month that is already over).
    //    Metering failure fails OPEN (usage=null ⇒ no gate).
    let usage: { used: number; cap: number } | null = null;
    try {
      usage = await explainMonthUsage();
    } catch {
      /* meter unavailable — availability beats accounting */
    }
    if (usage && usage.used >= usage.cap) {
      return json(
        { ok: false, code: "explain_quota", error: "سقفِ توضیحِ هوشمندِ این ماه پر شده است — ماهِ بعد دوباره در دسترس است" },
        { status: 429 }
      );
    }

    // 4) hard hourly quota BEFORE any paid call (cached reads above stay free)
    const verdict = rateLimit(req, "explain-gen", QUOTA, QUOTA_WINDOW);
    if (!verdict.ok) return verdict.response!;

    const correct = q.options[q.answer] ?? "";
    const prompt =
      `یک دانش‌آموز در سؤال چهارگزینه‌ای زیر پاسخ اشتباه داده و می‌خواهد بداند چرا گزینهٔ درست، درست است.\n\n` +
      `مهارت سؤال: ${categoryFa(q)}\n` +
      `متن سؤال: ${q.question}\n` +
      `گزینه‌ها:\n${q.options.map((o, i) => `${"abcd"[i]}) ${o}${i === q.answer ? "  ← کلید درست" : ""}`).join("\n")}\n` +
      `کلید: گزینهٔ ${"abcd"[q.answer]}) ${correct}\n\n` +
      `طبق قواعد سیستم توضیح بده که چرا فقط همین گزینه با جمله سازگار است (و نکتهٔ اصلی تفاوتش با گزینه‌های نزدیک چیست).`;

    const raw = await askModel(prompt);
    const explanation = raw ? sanitize(raw) : fallbackText(correct);
    const source = raw ? "ai" : "fallback";

    // 5) store once, serve forever (best-effort — races are fine)
    try {
      await db.explainCache.upsert({
        where: { key: id },
        update: {},
        create: { key: id, explanation, source },
      });
    } catch {
      /* concurrent write conflict is harmless */
    }

    // 6) r348 — meter AFTER a real ai generation only (fallback is free);
    //    a broken meter never fails the answer the learner is holding.
    let metered: { used: number; cap: number } | undefined;
    if (raw && usage) {
      try {
        await bumpExplainMeter();
        metered = { used: usage.used + 1, cap: usage.cap };
      } catch {
        /* metering is a cost guard, not correctness */
      }
    }

    trackEventServer("explain_generated");
    return json(
      { id, explanation, cached: false, source },
      metered
        ? { headers: { "X-Explain-Month-Gens": String(metered.used), "X-Explain-Month-Cap": String(metered.cap) } }
        : undefined
    );
  }
);
