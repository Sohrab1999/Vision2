import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { assembleReport } from "@/lib/teacher-report";
import { learnerHandle } from "@/lib/teacher-handles";

export const runtime = "nodejs";

// ------------------------------------------------------------------
// r352 — «پنلِ معلم» — فهرستِ کلاس (گامِ نخستِ بزرگترین خالیِ ممیزی).
// تجمیعِ READ-ONLYیِ LearnerProfile + QuizAttempt: هیچ راز، هیچ
// userId، هیچ پاسخِ خام — همان دانهٔ leaderboard (نام/رنگ/تلاش/میانگین)
// با عمقِ آموزشیِ بیشتر (ضعیفترین مهارت، پوششِ درس، آخرین فعالیت).
//
// گیتِ دسترسی: مسیر فقط وقتی زنده است که TEACHER_ACCESS_CODE رویِ
// سرور ست شده باشد — غایب بودنش یعنی اپراتور پنل را باز نکرده ⇒ 404
// صادق («پنل معلم فعال نیست»)، نه درِ قفلِ بیبرچسب. کدِ اشتباه ⇒ 401.
// مقایسه با timingSafeEqual رویِ هشِ SHA-256 (طولِ کد هم لو نمیرود).
//
// چرا نقطهٔ ورود عمومی؟ فهرست از قبل در /api/leaderboard عمومی است
// (نام/تلاش/میانگین) — این مسیر همان دانه را با دیدِ معلم میدهد و
// درِ آن با کدِ اپراتور کنترل میشود.
// ------------------------------------------------------------------

const teacherCode = (): string => (process.env.TEACHER_ACCESS_CODE ?? "").trim();

function codeMatches(presented: string, expected: string): boolean {
  const a = createHash("sha256").update(presented, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const GET = withApi({ key: "teacher-report", limit: { max: 30 } }, async ({ req, json }) => {
  const expected = teacherCode();
  if (!expected) {
    throw ApiError.notFound("پنل معلم روی این سرور فعال نیست.");
  }
  const presented = (req.headers.get("x-teacher-code") ?? "").trim();
  if (!presented || !codeMatches(presented, expected)) {
    throw ApiError.unauthorized("کد دسترسی نادرست است.");
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const [profiles, grouped, totalAgg, lessonRows, userLessonCounts, userCategoryAvgs, attemptRows, last24h] =
      await Promise.all([
        db.learnerProfile.findMany({ select: { userId: true, name: true, color: true } }),
        db.quizAttempt.groupBy({
          by: ["userId"],
          _count: { _all: true },
          _avg: { percent: true },
          _max: { percent: true },
        }),
        db.quizAttempt.aggregate({ _count: { _all: true }, _avg: { percent: true } }),
        db.quizAttempt.groupBy({ by: ["lesson"], _count: { _all: true }, _avg: { percent: true } }),
        db.quizAttempt.groupBy({ by: ["userId", "lesson"], _count: { _all: true } }),
        db.quizAttempt.groupBy({ by: ["userId", "category"], _avg: { percent: true } }),
        db.quizAttempt.findMany({ select: { userId: true, category: true, createdAt: true } }),
        db.quizAttempt.count({ where: { createdAt: { gte: since24h } } }),
      ]);

    const report = assembleReport({
      profiles,
      // r353 — هر ردیفِ فهرست شناسهٔ ناموجودالاثرِ خودش را میگیرد
      // (HMAC(userId, کد)) تا دیالوگِ جزئیات بتواند بدونِ دیدنِ userId
      // یادگیرنده را آدرس کند.
      handleOf: (userId: string) => learnerHandle(userId, expected),
      agg: grouped.map((g) => ({
        userId: g.userId,
        count: g._count._all,
        avgPercent: g._avg.percent ?? 0,
        bestPercent: g._max.percent ?? 0,
      })),
      totalAttempts: totalAgg._count._all,
      classAvg: totalAgg._avg.percent,
      last24h,
      attemptRows,
      userLessonCounts: userLessonCounts.map((r) => ({ userId: r.userId, lesson: r.lesson, count: r._count._all })),
      userCategoryAvgs: userCategoryAvgs.map((r) => ({
        userId: r.userId,
        category: r.category,
        avgPercent: r._avg.percent ?? 0,
      })),
      lessonAgg: lessonRows.map((r) => ({
        lesson: r.lesson,
        count: r._count._all,
        avgPercent: r._avg.percent,
      })),
    });

    return json({ ok: true, ...report });
  } catch {
    throw ApiError.server("گزارشِ کلاس در دسترس نیست.");
  }
});
