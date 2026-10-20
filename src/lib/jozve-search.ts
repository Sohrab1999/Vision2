// ------------------------------------------------------------------
// r410 — «جست‌وجو در کتاب‌ها» — موتورِ خالصِ جست‌وجوی متنیِ کتابخانه.
//
// خواستهٔ کاربر پس از اضافه‌شدن هر شش جزوه به وب‌اپ: جست‌وجو باید
// سراسری باشد — از ۴۱هزار خطِ متنِ شش کتاب و ۶٬۲۲۲ سؤالِ نُه بانک —
// نه substring تک‌توکنیِ درونِ یک جزوه (همان جست‌وجوی قدیمیِ jozve-view).
//
// این ماژول عمداً خالص است (بدون node:fs، بدون fetch) تا:
//   • vitest آن را با دادهٔ ساختگی راستی‌آزمایی کند،
//   • کامپوننت‌های کلاینت (هایلایت، برچسب‌ها) هم از همان نرمال‌سازی
//     استفاده کنند و قراردادِ تطبیق سرور/کلاینت یکی بماند.
// خواندنِ کورپوس و پیمایشِ رکوردها در jozve-search.server.ts (فقط
// nodejs) زندگی می‌کند — الگوی jozve-bank.ts / teacher-bank.server.ts.
// ------------------------------------------------------------------

// ------------------------------------------------------- نرمال‌سازی

/**
 * یکسان‌سازیِ نویسه‌های هم‌ارزِ فارسی/عربی برای «تطبیق» (نه نمایش):
 *   • ی/ي/ى → ی   ك → ک   ة → ه
 *   • أ/إ/آ/ٱ → ا   ؤ → و   ئ → ی
 *   • اعراب و کشیده حذف؛ ارقام فارسی/عربی → لاتین
 *   • نیم‌فاصله/نویسه‌های جهت حذف (چون در استخراجِ PDF گم می‌شوند)
 *   • NFKC: لیگاتورها و اشکال نمایشیِ عربی (ﻻ، ﻡ…) به پایه
 */
export function normSearchText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // اعراب + نیم‌متره
    .replace(/[يىﻯ]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ی")
    .replace(/[\u200c\u200d\u200e\u200f]/g, "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\s+/g, " ")
    .trim();
}

/** پرس‌وجو → جملاتِ تطبیق (AND): واژه‌های ≥۲ نویسه؛ « » فارسی هم جداکننده است */
export function searchTerms(q: string): string[] {
  return normSearchText(q)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2)
    .slice(0, 8);
}

// ---------------------------------------------------------- امتیازدهی

/**
 * امتیازِ تطبیقِ یک رکورد — null یعنی حذف (AND سختِ همهٔ جملات).
 *   • هر جمله +۲ و تا ۳ تکرارِ اضافه +۱
 *   • وجودِ جمله در «عنوان» (فصل/سکشن/بانک) +۲
 *   • عبارتِ کاملِ پرس‌وجو در متن +۶
 */
export function scoreHaystack(
  haystack: string,
  titleHay: string,
  terms: string[],
  phrase: string,
): number | null {
  let score = 0;
  for (const t of terms) {
    const first = haystack.indexOf(t);
    if (first < 0) return null;
    let freq = 1;
    let from = first;
    for (;;) {
      const next = haystack.indexOf(t, from + t.length);
      if (next < 0 || freq >= 4) break;
      freq += 1;
      from = next;
    }
    score += 2 + Math.min(freq - 1, 3);
    if (titleHay.includes(t)) score += 2;
  }
  if (phrase.length >= 2 && haystack.includes(phrase)) score += 6;
  return score;
}

// --------------------------------------------------- هایلایت و قطعه

const escapeInClass = (ch: string): string => ch.replace(/[\]\\^\-]/g, "\\$&");

/** کلاسِ نویسهٔ هم‌ارز برای یک نویسهٔ نرمال‌شده — خالی یعنی حرف‌نخورده */
function charClass(ch: string): string | null {
  if (/[اأإآٱ]/.test(ch)) return "[اأإآٱ]";
  if (/[یيى]/.test(ch)) return "[یيىﻯ]";
  if (/[کك]/.test(ch)) return "[کك]";
  if (/[هة]/.test(ch)) return "[هة]";
  if (/[وؤ]/.test(ch)) return "[وؤ]";
  if (/[0-9]/.test(ch)) return "[0-9۰-۹٠-٩]";
  if (ch === " ") return "[\u200c ]+";
  if (/[\p{L}\p{N}]/u.test(ch)) return `[${escapeInClass(ch)}]`;
  return null; // نقطه‌گذاری و علائم — در الگو نمی‌گذاریم
}

/**
 * regex هایلایت روی «متن خام» — هم‌ارزِ نویسه‌ای (ی/ي، ک/ك، ا/أ/آ، ارقام)
 * و بی‌تفاوت به نیم‌فاصله. بینِ نویسه‌ها \u200c اختیاری است تا «یادگیری»
 * در ردیفِ شکستهٔ «یاد گیری» هم بشیند. null یعنی هیچ جمله‌ای قابل
 * هایلایت نیست (پرس‌وجوی خالی/نقطه‌گذاریِ خالص).
 */
export function buildHighlightRegex(terms: string[]): RegExp | null {
  const parts: string[] = [];
  for (const t of terms) {
    const cls: string[] = [];
    for (const ch of Array.from(t)) {
      const c = charClass(ch);
      if (c) cls.push(c);
    }
    if (cls.length) parts.push(`(?:${cls.join("\u200c?")})`);
  }
  if (!parts.length) return null;
  return new RegExp(`(?:${parts.join("|")})`, "gi");
}

/**
 * r412 — regex عبارتِ پیوسته: همهٔ جملات «به‌ترتیب و پشت‌سرهم» —
 * بینِ نویسه‌های هر واژه \u200c اختیاری (همان قراردادِ هایلایتِ تکی)
 * و بینِ واژه‌ها فاصله/نیم‌فاصلهٔ خالص (بدونِ نقطه‌گذاری — «پیوسته»
 * یعنی هیچ واژهٔ دیگری میان‌شان نباشد). پرس‌وجوی تک‌واژه‌ای یا
 * واژه‌هایِ بدونِ حرف، null برمی‌گرداند (لایهٔ عبارت معنا ندارد).
 * مثال: ["حال","کامل"] روی «حالِ کامل» و «حال کامل» و «حالكامل» می‌نشیند.
 */
export function buildPhraseRegex(terms: string[]): RegExp | null {
  if (terms.length < 2) return null;
  const wordParts: string[] = [];
  for (const t of terms) {
    const cls: string[] = [];
    for (const ch of Array.from(t)) {
      const c = charClass(ch);
      if (c) cls.push(c);
    }
    if (!cls.length) return null; // واژهٔ بی‌حرف — عبارتِ قابلِ اطمینان نیست
    wordParts.push(`(?:${cls.join("\u200c?")})`);
  }
  return new RegExp(`(?:${wordParts.join("[\\u200c ]+")})`, "gi");
}

/**
 * قطعهٔ زمینه از متنِ خام: نخستین نشستِ هر جمله ± radius نویسه،
 * با «…» در برش‌ها. بی‌نشست → برشِ سادهٔ ابتدای متن.
 * r412 — اگر regex عبارتِ پیوسته داده شود، نشستِ عبارت اولویتِ
 * مرکزِ قطعه را دارد تا «کلِ عبارتِ پرس‌وجو» در زمینه دیده شود.
 */
export function makeSnippet(text: string, terms: string[], radius = 70, phrase?: RegExp | null): string {
  const fallback = (): string =>
    text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  let m: RegExpExecArray | null = null;
  if (phrase) {
    const pre = new RegExp(phrase.source, "gi"); // نمونهٔ تازه — lastIndexِ مستقل
    const pm = pre.exec(text);
    if (pm && pm[0].length > 0) m = pm;
  }
  if (!m) {
    const re = buildHighlightRegex(terms);
    if (!re) return fallback();
    const tm = re.exec(text);
    if (!tm || tm.index == null) return fallback();
    m = tm;
  }
  const start = Math.max(0, m.index - radius);
  const end = Math.min(text.length, m.index + m[0].length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

// ------------------------------------------------------ قراردادِ سیم

/**
 * نوعِ گروهِ نمایشیِ یک سند (r411) — بانک‌هایِ باندلِ ویژن ۲ و کنکور
 * گروه‌هایِ خودشان را می‌گیرند و بقیه (جزوه‌های g7-g12) به رنگِ کتاب
 * می‌روند. خالص و بی‌import تا پیمانِ client-safe سالم بماند.
 */
export function searchGroupKind(doc: string): "vision2" | "konkur" | "booklet" {
  if (doc === "konkur-g10") return "konkur";
  if (doc.startsWith("lesson-") || doc === "exam-360") return "vision2";
  return "booklet";
}

/** یک نتیجهٔ جست‌وجو (شکلِ سیمِ /api/jozze-search — بدونِ فیلدهای داخلی) */
export interface JozveSearchResult {
  kind: "text" | "question";
  grade: number;
  doc: string; // g7..g12 | tests-g7.. | grammar-*
  bookTitle: string;
  /** متنِ رکورد — خطِ جزوه یا صورتِ سؤال */
  text: string;
  snippet: string;
  score: number;
  /** r412 — کلِ عبارتِ پرس‌وجو به‌صورتِ پیوسته در رکورد نشسته است */
  phraseHit?: boolean;
  // فقط متنِ جزوه
  chapterId?: string;
  chapterTitle?: string;
  sectionTitle?: string;
  sectionType?: string;
  lineIdx?: number;
  // فقط سؤالِ بانک
  bankLesson?: number;
  bankTitle?: string;
  questionId?: string;
  options?: string[];
  answer?: number;
  translation?: string;
}

export interface JozveSearchResponse {
  ok: true;
  took: number;
  total: number;
  results: JozveSearchResult[];
}
