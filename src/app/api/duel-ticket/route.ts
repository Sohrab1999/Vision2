import { db } from "@/lib/db";
import { withApi } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { BODY_CAPS, duelTicketSchema } from "@/lib/api/validate";
import { presentSecret, secretMatches } from "@/lib/identity/secret";
import { mintTicket, readTicketSecret } from "@/lib/duel-ticket-server";

export const runtime = "nodejs";

// ------------------------------------------------------------------
// Task 112 «بلیتِ ورود» (SEC-5) — ضربِ بلیتِ یک‌بارمصرف برای ورود به
// نبرد دودنفره. فقط یادگیرندهٔ احرازشده (userId+secret، مقایسهٔ
// timing-safe با هشِ ذخیره‌شده) بلیت می‌گیرد؛ داورِ ۳۰۰۳ امضا، پنجرهٔ
// ۱۲۰ثانیه‌ای و یک‌بارمصرفِ nonce را بازبینی می‌کند. نتیجه: سوکتِ
// بی‌بلیت به duel:create/duel:join راه ندارد — حتی داخلِ بودجهٔ IPِ خودش.
// لیمیت ۳۰/دقیقه: هر ورود ۱–۲ بلیت می‌خواهد (با retryِ منقضی) — برای
// کلاسِ پشتِ NAT هم جا می‌شود؛ سیلابِ ضرب، لیمیتِ همیشگیِ مسیرها را دارد.
// ------------------------------------------------------------------

export const POST = withApi(
  { key: "duel-ticket", limit: { max: 30 }, bodyCap: BODY_CAPS.duelTicket, schema: duelTicketSchema },
  async ({ parsed, json }) => {
    const profile = await db.learnerProfile.findUnique({
      where: { userId: parsed.userId },
      select: { secret: true },
    });
    if (!profile) {
      throw ApiError.unauthorized("این یادگیرنده ثبت‌نام نشده است.");
    }
    if (!profile.secret) {
      throw ApiError.unauthorized("این شناسه هنوز امضا نگرفته است.");
    }
    if (!secretMatches(presentSecret(parsed.secret), profile.secret)) {
      throw ApiError.unauthorized();
    }

    // داور هنوز بوت نشده/راز در راه نیست — صادق بگو، نه خطای مبهم
    const secret = readTicketSecret();
    if (!secret) {
      throw ApiError.server("سرویس داوری هنوز آماده نیست؛ چند لحظه بعد دوباره تلاش کن.");
    }

    const { token, ttlMs } = mintTicket(parsed.userId, secret);
    return json({ ok: true, ticket: token, ttlMs });
  }
);
