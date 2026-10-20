// ------------------------------------------------------------------
// r404 — سمتِ کلاینتِ بانکِ کتابخانهٔ جزوه + مسیریابیِ بانکِ خطا.
//
// تا r403 دو سرویسِ «چرا غلط شد؟» و «نظرِ معلم» کلِ کتاب را می‌شناختند
// (۷٬۰۳۴ سؤال، سمتِ سرور)، اما بانکِ خطای سمتِ کلاینت کور بود:
//   • jozve-view و book-view عمداً با trackMistakes={false} اجرا
//     می‌شدند — نگرانیِ مشروع: خطاهای جزوه، بانکِ سه درسِ Vision 2
//     (سطل‌های ۱/۲/۳) را آلوده می‌کردند.
//   • نتیجه: یادگیرنده‌ای که در جزوهٔ پایهٔ دوازدهم غلط می‌زد، هیچ
//     «مرورِ سریع»ی رویش نداشت — خطا ناپدید می‌شد.
// راه‌حلِ این راند: سؤال‌های جزوه با سطلِ مستقلِ پایه‌ای (g7..g12)
// ثبت می‌شوند — بانکِ Vision 2 دست‌نخورده می‌ماند — و مرورِ سریع
// کلیدهای ناشناخته را با fetchِ on-demand از همان public/jozve
// حل می‌کند (فقط فایل‌هایِ لازم، کشِ هر فایل، هرگز throw نمی‌کند).
//
// چرا fetch از public و نه روتِ API؟ فایل‌ها استاتیک‌اند و هنگامِ
// گشت‌وزی در کتابخانه از قبل در حافظهٔ HTTP مرورگرند؛ پخشِ ایستا
// بدونِ بارِ سرور کار می‌کند و آفلاینِ پس از نخستین بار هم محفوظ است.
// ------------------------------------------------------------------

import { asQuestion } from "./quiz-question-guard";
import { questionSourceLesson } from "@/state/progress";
import type { QuizQuestion } from "./study-types";

/** id → the public/jozve file that owns it (null = not a jozve id) */
export function jozveFileOf(id: string): string | null {
  if (/^g11-gram-/.test(id)) return "grammar-g11.json";
  if (/^g11-kgram-/.test(id)) return "grammar-g11-konkur.json";
  const tests = /^g(7|8|9|10|11|12)-l\d+/.exec(id);
  if (tests) return `tests-g${tests[1]}.json`;
  // بانک‌های موضوعیِ گرامرِ دوازدهم (rel/fin/dmcq/…) — «g12-» + حرف،
  // پس از فیلترِ «g12-l…»یِ تست‌ها. شناسهٔ کنکورِ باندل‌شده («g10-358»)
  // عددی است و اینجا به هیچ فایلی نمی‌خورد.
  if (/^g12-[a-z]/.test(id)) return "grammar-g12-topic.json";
  return null;
}

/** id → its grade bucket ("g7".."g12") for the mistake bank */
export function jozveBucketOf(id: string): string | null {
  // تنها شناسه‌ای سطلِ پایه‌ای می‌گیرد که مسیریاب، فایلِ صاحبش را هم
  // بشناسد — «g10-358»یِ بانکِ کنکورِ باندل‌شده نباید جلوی جزوه را بگیرد.
  if (!jozveFileOf(id)) return null;
  const m = /^g(7|8|9|10|11|12)-/.exec(id);
  return m ? `g${m[1]}` : null;
}

/**
 * سطلِ ثبتِ خطا برای هر سؤال: سؤال‌های جزوه به پایهٔ خودشان می‌روند
 * (g7..g12)، بقیه به همان سطلِ همیشگیِ درس‌ها/آزمون (0..3).
 * ثبت و پاک‌کردنِ بانک خطا هر دو باید از همین تابع بخوانند وگرنه
 * سؤالی که «درست» پاسخ می‌شود هرگز از بانک بیرون نمی‌آید.
 */
export function mistakeTargetOf(q: { id: string }): number | string {
  return jozveBucketOf(q.id) ?? questionSourceLesson(q);
}

/* --------------------------- on-demand loader --------------------------- */

const fileCache = new Map<string, Promise<Map<string, QuizQuestion>>>();

/** one file → id→question map; failures resolve empty and are re-fetchable */
function loadFile(fileName: string): Promise<Map<string, QuizQuestion>> {
  const memo = fileCache.get(fileName);
  if (memo) return memo;
  const p = (async () => {
    const out = new Map<string, QuizQuestion>();
    try {
      const res = await fetch(`/jozve/${fileName}`);
      if (!res.ok) return out;
      const parsed: unknown = await res.json();
      const lessons =
        typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { lessons?: unknown }).lessons)
          ? (parsed as { lessons: { questions?: unknown }[] }).lessons
          : [];
      for (const lesson of lessons) {
        if (!lesson || !Array.isArray(lesson.questions)) continue;
        for (const raw of lesson.questions) {
          const q = asQuestion(raw);
          if (q) out.set(q.id, q);
        }
      }
    } catch {
      /* offline/broken file — empty map, and the memo is dropped below
         so a later attempt can retry */
    }
    if (out.size === 0) fileCache.delete(fileName);
    return out;
  })();
  fileCache.set(fileName, p);
  return p;
}

/**
 * Resolve a batch of jozve ids by fetching only the files that own them.
 * Returns a map of the ids that were found; unknown/failed ids are simply
 * absent. Never throws.
 */
export async function loadJozveQuestionsFor(ids: string[]): Promise<Map<string, QuizQuestion>> {
  const byFile = new Map<string, Set<string>>();
  for (const id of ids) {
    const file = jozveFileOf(id);
    if (!file) continue;
    if (!byFile.has(file)) byFile.set(file, new Set());
    byFile.get(file)!.add(id);
  }
  const merged = new Map<string, QuizQuestion>();
  await Promise.all(
    [...byFile.entries()].map(async ([file, wanted]) => {
      const map = await loadFile(file);
      for (const id of wanted) {
        const q = map.get(id);
        if (q) merged.set(id, q);
      }
    })
  );
  return merged;
}

/** برچسبِ فارسیِ سطل‌های پایه‌ای برای چیپ‌های مرورِ سریع */
export const JOZVE_BUCKET_LABELS: Record<string, string> = {
  g7: "جزوهٔ پایهٔ هفتم",
  g8: "جزوهٔ پایهٔ هشتم",
  g9: "جزوهٔ پایهٔ نهم",
  g10: "جزوهٔ پایهٔ دهم",
  g11: "جزوهٔ پایهٔ یازدهم",
  g12: "جزوهٔ پایهٔ دوازدهم",
};
