import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, statsSchema } from "@/lib/api/validate";
import { presentSecret, secretMatches } from "@/lib/identity/secret";
import { readReceiptSecret, verifyDuelSubmission } from "@/lib/duel-receipt-server";

export const runtime = "nodejs";

// Roadmap Step 5: validation (int bounds, correct ≤ total) + rate limit +
// error shape moved to withApi — negative/float lesson and non-integer
// totals are now rejected by the schema instead of diluting the averages.

export const GET = withApi({ key: "stats-get", limit: { max: 240 } }, async ({ json }) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, avg, last24h, recent] = await Promise.all([
    db.quizAttempt.count(),
    db.quizAttempt.aggregate({ _avg: { percent: true } }),
    db.quizAttempt.count({ where: { createdAt: { gte: since } } }),
    db.quizAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        userId: true,
        lesson: true,
        category: true,
        total: true,
        correct: true,
        percent: true,
        createdAt: true,
      },
    }),
  ]);

  // join learner names for the live feed (select projection — no secret hash)
  const profiles = await db.learnerProfile.findMany({
    where: { userId: { in: recent.map((r) => r.userId) } },
    select: { userId: true, name: true, color: true },
  });
  const nameMap = new Map(profiles.map((p) => [p.userId, p]));
  const recentNamed = recent.map((r) => {
    const p = nameMap.get(r.userId);
    return {
      ...r,
      name: p?.name ?? null,
      color: p?.color ?? null,
    };
  });

  return json({
    total,
    avgPercent: Math.round(avg._avg.percent ?? 0),
    last24h,
    recent: recentNamed,
  });
});

export const POST = withApi(
  { key: "stats-post", limit: { max: 60 }, bodyCap: BODY_CAPS.stats, schema: statsSchema },
  async ({ parsed: body, json }) => {
    // Phase-0 «اعتماد»: attempts may only be written by the learner that
    // /api/register issued a secret for — leaderboard entries are no longer
    // forgeable by posting an arbitrary userId.
    const profile = await db.learnerProfile.findUnique({
      where: { userId: body.userId },
      select: { secret: true },
    });
    if (!profile) {
      throw ApiError.unauthorized("این یادگیرنده ثبت‌نام نشده است.");
    }
    if (!profile.secret) {
      throw ApiError.unauthorized("این شناسه هنوز امضا نگرفته است.");
    }
    // audit S4: timing-safe compare against the hashed secret at rest
    if (!secretMatches(presentSecret(body.secret), profile.secret)) {
      throw ApiError.unauthorized();
    }

    const percent = Math.round((body.correct / body.total) * 100);
    // schema bounds score to [0, 1e6]; the persisted cap stays 100 000
    const score = body.score !== undefined && body.score > 0 ? Math.min(Math.round(body.score), 100_000) : null;
    // Task-36 «جدول نبرد» — the duel outcome rides along with signed duel
    // attempts. Strictly whitelisted: any other category silently drops it.
    const outcome = body.category === "duel" && body.outcome ? body.outcome : null;

    // Task 94 «رسیدِ امضاشدهٔ داوری» — a duel row exists only when the :3003
    // judge itself signed the end of that match. The HMAC receipt proves the
    // result was arbitrated; the candidate check (duelName + score + correct)
    // proves THIS claim matches the player inside the receipt; the 24h window
    // plus the per-(user, sig) replay check close receipt farming.
    let receiptSig: string | null = null;
    if (body.category === "duel") {
      if (!body.receipt || !body.duelName) {
        throw ApiError.unauthorized("نتیجهٔ نبرد بدون رسیدِ امضاشدهٔ داوری ثبت نمی‌شود.");
      }
      const secret = readReceiptSecret();
      const replayed = body.receipt.sig
        ? (await db.quizAttempt.findFirst({ where: { userId: body.userId, receiptSig: body.receipt.sig }, select: { id: true } })) !== null
        : false;
      const verdict = verifyDuelSubmission(
        body.receipt,
        { name: body.duelName, score: body.score ?? 0, correct: body.correct, outcome: body.outcome ?? null },
        secret,
        { now: Date.now(), replayed }
      );
      if (!verdict.ok) {
        const fa: Record<string, string> = {
          malformed: "رسیدِ داوری ناقص یا خراب است.",
          bad_sig: "امضای داور روی این رسید معتبر نیست.",
          stale: "رسیدِ داوری کهنه یا از آینده است.",
          no_candidate: "نتیجهٔ اعلام‌شده با بازیکن‌های رسیدِ داوری هم‌خوان نیست.",
          outcome_mismatch: "نتیجهٔ اعلام‌شده با داوریِ سرور هم‌خوان نیست.",
          replayed: "این رسید قبلاً ثبت شده است.",
        };
        throw ApiError.unauthorized(fa[verdict.reason] ?? "رسیدِ داوری پذیرفته نشد.");
      }
      receiptSig = body.receipt.sig;
    }

    const attempt = await db.quizAttempt.create({
      data: {
        userId: body.userId,
        lesson: body.lesson,
        category: body.category,
        total: body.total,
        correct: body.correct,
        percent,
        score,
        outcome,
        receiptSig,
      },
    });
    return json({ ok: true, id: attempt.id });
  }
);
