import { withApi } from "@/lib/api/handler";
import { jozveSearchQuerySchema } from "@/lib/api/validate";
import { searchJozve } from "@/lib/jozve-search.server";

export const runtime = "nodejs";

// ------------------------------------------------------------------
// r410 «جست‌وجو در کتاب‌ها» — جست‌وجوی متنیِ سراسریِ کتابخانهٔ جزوه.
//
// GET /api/jozve-search?q=حال+کامل&grade=11&kind=text&limit=30
//   q     — ۲ تا ۸۰ نویسه (AND سختِ واژه‌ها، نرمال‌سازیِ هم‌ارزها)
//   grade — فیلترِ اختیاریِ پایه (۷..۱۲)
//   kind  — فیلترِ اختیاریِ نوع نتیجه: text (خطِ جزوه) | question (سؤالِ بانک)
//   limit — ۱..۶۰ (پیش‌فرضِ ۳۰)
// پاسخ: { ok, took, total, results, phraseDocs } — results پراکنده‌شده
// میانِ اسناد (هر سند تا ۱۲) تا یک کتاب سیلابِ نتیجه را انحصار نگیرد؛
// r415 — phraseDocs = اسنادِ عبارت‌دار در «کلِ تطبیق‌ها» (منبعِ چیپِ
// «عبارتِ کامل در این کتاب» روی سرگروه‌ها — فارغ از کپِ نمایش).
// ایندکسِ کورپوس (۴۳هزار رکورد) تنبل و یک‌بارمصرف ساخته می‌شود؛ هر پرس‌وجو
// یک اسکنِ خطیِ چند ده میلی‌ثانیه‌ای است — بدونِ شاخصِ بیرونی.
// ------------------------------------------------------------------

export const GET = withApi(
  { key: "jozve-search-get", limit: { max: 240 }, query: jozveSearchQuerySchema },
  async ({ parsed, json }) => {
    const t0 = Date.now();
    const { total, results, phraseDocs } = searchJozve(parsed.q, {
      grade: parsed.grade,
      kind: parsed.kind,
      limit: parsed.limit,
    });
    return json({ ok: true, took: Date.now() - t0, total, results, phraseDocs });
  },
);
