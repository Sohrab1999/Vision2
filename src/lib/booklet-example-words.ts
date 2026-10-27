// ------------------------------------------------------------------
// راند ۲۶۳ — سطحِ هشتمِ «کاربرد در جزوه»: واژه‌های زندهٔ مثال‌هایِ
// درسنامهٔ جامع — کتابِ «مرور گرامرهای پایهٔ هفتم تا نهم» حالا هم زنده
// می‌شود: هر مثالِ ساختاریافته (BgExample) واژه‌های واژگانِ خودِ جزوه
// را که در آن زندگی می‌کنند نشان می‌دهد — همان معناشناسیِ هفت سطحِ
// قبلی (مرزِ واژه + پسوندهایِ مجاز) با همان دیالوگِ مشترک.
//
// مسیرِ تشخیص — پارتیِ قفل‌شده با پیمانِ ① r263 (و همان الگویِ
// شاخصِ توکنیِ r259): تک‌واژه‌هایِ خالص (/^[a-z]+$/) از شاخصِ
// توکنیِ فرم‌هایِ مجاز (توکنِ متن ∈ toleratedForms(w) — هم‌ارزِ
// \b...\b چون توکن‌سازی روی همان مرز می‌شکند) و ۴۲۵ ورودیِ خاص
// (عبارتِ چندواژه‌ای/نقطه‌دار) از خودِ wordFormRegex — پارتیِ دو
// مسیر با گذرِ کاملِ ۲۰۵ مثال × ۲۶۳۷ واژه قفل است (صفرِ ناهم‌خوان).
//
// دامنه: کلِ واژگانِ جزوه (۱۲ درس) — درسنامهٔ جامع کتابِ همهٔ درس‌هاست،
// نه یک درس (برخلافِ نثرِ درسِ r259 که قفلِ درس داشت)؛ ددوپِ هم‌نامی
// سراسری و ترتیبِ پایدار = ترتیبِ واژگانِ درس‌ها (۱ تا ۱۲). کشِ
// ماژول-سطح برای هر موضوع — اولین بازشدنِ کارت می‌سازد، دفعاتِ بعد فوری.
// ------------------------------------------------------------------

import { lessons } from "@/data";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { findWordUsages, wordFormRegex, type WordUsageSite } from "./word-usage";

/** یک چیپِ زندهٔ مثال — واژه + سایت‌هایِ پیکره (خالی = واژهٔ فقط-درسنامه‌ای) */
export interface ExampleLiveChip {
  en: string;
  sites: WordUsageSite[];
}

/** فرم‌هایِ مجاز — آینهٔ تحت‌اللفظیِ سه شاخهٔ wordFormRegex (همان قراردادِ r259) */
function toleratedForms(word: string): string[] {
  const w = word.trim().toLowerCase();
  if (w.endsWith("e")) {
    const s = w.slice(0, -1);
    return [s + "e", s + "es", s + "ed", s + "ing"];
  }
  if (w.endsWith("y")) {
    const s = w.slice(0, -1);
    return [s + "y", s + "ies", s + "ied", s + "ying"];
  }
  return [w, w + "s", w + "es", w + "ed", w + "ing"];
}

// شاخصِ ماژول — یک بار ساخته می‌شود
let formIndex: Map<string, Set<string>> | null = null;
let specialWords: string[] = [];
let uniqueWords: string[] = []; // اندیس → فرمِ نمایش (اولین رخداد در ترتیبِ درس‌ها)
let orderIndex: Map<string, number> = new Map();

function buildIndex(): void {
  if (formIndex) return;
  formIndex = new Map();
  orderIndex = new Map();
  const seen = new Set<string>();
  let order = 0;
  for (const l of lessons) {
    for (const w of l.vocabulary) {
      const key = w.en.trim().toLowerCase();
      if (seen.has(key)) continue; // هم‌نامیِ سراسری — یک واژه
      seen.add(key);
      uniqueWords.push(w.en);
      orderIndex.set(key, order++);
      if (/^[a-z]+$/.test(w.en)) {
        for (const f of toleratedForms(w.en)) {
          let s = formIndex.get(f);
          if (!s) formIndex.set(f, (s = new Set()));
          s.add(key);
        }
      } else {
        specialWords.push(w.en);
      }
    }
  }
}

const chipsCache = new Map<string, ExampleLiveChip[][]>();

/**
 * چیپ‌هایِ هر مثالِ یک موضوعِ درسنامهٔ جامع — به ترتیبِ مثال‌هایِ خودِ
 * جزوه؛ هر عضو = واژه‌هایِ زندهٔ آن مثال به ترتیبِ پایدارِ واژگان.
 */
export function topicExampleChips(topicId: string): ExampleLiveChip[][] {
  const cached = chipsCache.get(topicId);
  if (cached) return cached;
  buildIndex();
  const topic = BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === topicId);
  const result: ExampleLiveChip[][] = (topic?.examples ?? []).map((ex) => {
    const tokens = new Set(ex.en.toLowerCase().match(/[a-z]+/g) ?? []);
    const hits = new Set<number>(); // اندیس‌هایِ orderIndex — برایِ ترتیبِ پایدار
    for (const tok of tokens) {
      const ws = formIndex!.get(tok);
      if (ws) for (const w of ws) hits.add(orderIndex.get(w)!);
    }
    // ورودی‌هایِ خاص (عبارتِ چندواژه‌ای/نقطه‌دار) — مسیرِ regexِ خودِ تطبیق
    for (const w of specialWords) {
      if (wordFormRegex(w).test(ex.en)) hits.add(orderIndex.get(w.trim().toLowerCase())!);
    }
    return [...hits]
      .sort((a, b) => a - b)
      .map((idx) => {
        const en = uniqueWords[idx];
        return { en, sites: findWordUsages(en) }; // sites گرم — دیالوگِ فوری
      });
  });
  chipsCache.set(topicId, result);
  return result;
}
