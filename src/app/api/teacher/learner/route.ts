import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { teacherLearnerQuerySchema } from "@/lib/api/validate";
import { assembleLearnerDetail, LEARNER_DAYS_WINDOW } from "@/lib/teacher-report";
import { learnerHandle } from "@/lib/teacher-handles";

export const runtime = "nodejs";

// ------------------------------------------------------------------
// r353 — «عمقِ پنلِ معلم»: جزئیاتِ تک‌یادگیرنده (گامِ دومِ teacher
// panel — داده از r352 هست؛ فقط این مسیر و نمایِ دیالوگ تازهاند).
//
// گیتِ دسترسی: عینِ /api/teacher/report — بی‌TEACHER_ACCESS_CODE ⇒
// 404 صادق («پنل معلم فعال نیست»)؛ کدِ غلط ⇒ 403 با مقایسهٔ
// timing-safe رویِ هشِ SHA-256. (گیت عمداً اینجا هم inline ماند —
// فایلِ گزارشِ r352 سطحِ تستشدهٔ منجمد است و دست نمیخورد.)
//
// آدرسدهیِ حریمدوست: مسیر فقط «handle» میپذیرد — ۱۶ hex از
// HMAC(userId, کدِ اپراتور) که مسیرِ گزارش در فهرست میگذارد. هیچ
// userIdی در کوئری، payload یا لاگ نیست؛ handleِ ناهمتا ⇒ 404 صادقِ
// «یافت نشد» (شاید کد چرخیده — فهرست را تازه کن).
//
// پاسخ: پروفایل (نام/رنگ/عضویت) + تجمیعهایِ موتورِ خالصِ
// assembleLearnerDetail — روندِ ۱۴روزه، پوششِ درسهای ۱..۱۲، شکستِ
// مهارت‌به‌مهارت (ضعیفترین اول) و شش تلاشِ آخر. هیچ پاسخِ خامی
// (total/correct/score/receipt) از DB بیرون نمیآید — فقط percent.
// ------------------------------------------------------------------

const teacherCode = (): string => (process.env.TEACHER_ACCESS_CODE ?? "").trim();

function codeMatches(presented: string, expected: string): boolean {
  const a = createHash("sha256").update(presented, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const GET = withApi(
  { key: "teacher-learner", limit: { max: 60 }, query: teacherLearnerQuerySchema },
  async ({ req, parsed, json }) => {
    const expected = teacherCode();
    if (!expected) {
      throw ApiError.notFound("پنل معلم روی این سرور فعال نیست.");
    }
    const presented = (req.headers.get("x-teacher-code") ?? "").trim();
    if (!presented || !codeMatches(presented, expected)) {
      throw ApiError.unauthorized("کد دسترسی نادرست است.");
    }

    try {
      // handle⇒پروفایل: بازمحاسبهٔ همهٔ handleها رویِ فهرستِ کوچکِ
      // پروفایلها — کوئریِ مستقیمِ بر اساسِ handle وجود ندارد و
      // userId هم هرگز واردِ خطِ کوئریِ قابلِ دیدن نمیشود.
      const profiles = await db.learnerProfile.findMany({
        select: { userId: true, name: true, color: true, createdAt: true },
      });
      const matched = profiles.find((p) => learnerHandle(p.userId, expected) === parsed.handle);
      if (!matched) {
        throw ApiError.notFound(
          "یادگیرندهٔ موردنظر یافت نشد — شاید کدِ دسترسی عوض شده باشد؛ فهرست را تازه کن."
        );
      }

      const attempts = await db.quizAttempt.findMany({
        where: { userId: matched.userId },
        select: { category: true, lesson: true, percent: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });

      const learner = assembleLearnerDetail({
        profile: { name: matched.name, color: matched.color, createdAt: matched.createdAt },
        attempts,
      });

      // windowDays در پاسخ هم میآید تا نما پنجرهٔ نوار را از تکحقیقت
      // بخواند، نه از عددِ محلی (r350 درسِ سریِ اختیاری).
      return json({ ok: true, windowDays: LEARNER_DAYS_WINDOW, learner });
    } catch (e) {
      if (e instanceof ApiError) throw e; // 404هایِ معنادارِ بالا را بلع نگیر
      throw ApiError.server("جزئیاتِ یادگیرنده در دسترس نیست.");
    }
  }
);
