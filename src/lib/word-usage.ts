// ------------------------------------------------------------------
// راند ۲۵۲ — «کاربرد در جزوه»: یابندهٔ جای واژه در متن‌هایِ خودِ جزوه
//
// محتوای این ویژگی فقط از جزوه می‌آید (مأموریتِ «استخراجِ دقیق»): مکالمه‌ها
// (مقدمه + هر خط) و ریدینگ‌ها (هر پاراگراف) همهٔ درس‌ها یک‌بار نمایه می‌شوند
// و برایِ هر واژهٔ واژگان، متن‌هایی که آن واژه را دارند (هم‌درس و میان‌درسی)
// با ترجمهٔ فارسیِ خودِ جزوه برمی‌گردند — نه جمله‌ای ساختهٔ ما، نه تعریفی
// بیرونی؛ «این واژه کجای جزوه آمده؟» با پرشِ ذهنیِ آماده.
//
// منطقِ تطبیق: مرزِ واژه + تحملِ پسوندهایِ رایج — قراردادِ لایه-به-لایه:
//   · ختم به e: use → use/uses/used/using (ساقهٔ بی‌e + e|es|ed|ing)
//   · ختم به y: study → study/studies/studied/studying
//   · بقیه:     call → call/calls/called/calling (پسوندهای اختیاری)
// پسوندِ بدونِ قاعده («d» یا «n» برهنه) ممنوع — win→wind و ear→earn
// واژه‌هایِ متفاوت‌اند، نه صرفِ همان واژه (درسِ پروبِ r252).
// case-insensitive؛ «Culture» در ریدینگ، «culture» در واژگان — یکی.
// ------------------------------------------------------------------

import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";

export type WordUsageKind = "conversation" | "reading";

export interface WordUsageSite {
  lessonId: number;
  kind: WordUsageKind;
  /** برچسبِ محل با زبانِ خودِ اپ — «مکالمهٔ درس ۱» یا عنوانِ فارسیِ ریدینگ */
  titleFa: string;
  /** گزیدهٔ انگلیسیِ حاویِ تطبیق (جمله‌هایِ دارایِ واژه — حداکثر ۲ جمله) */
  en: string;
  /** ترجمهٔ فارسیِ خودِ جزوه (خطِ مکالمه یا پاراگرافِ ریدینگ) */
  fa: string;
}

/** واحدِ متنِ نمایه‌شده — یک خطِ مکالمه، مقدمهٔ مکالمه یا یک پاراگرافِ ریدینگ */
interface UsageTextUnit {
  lessonId: number;
  kind: WordUsageKind;
  titleFa: string;
  en: string;
  fa: string;
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * ریجنکسِ فرم‌هایِ مجازِ یک واژه — برایِ گاردِ تست هم صادر شده تا معناشناسیِ
 * تطبیق (مرزِ واژه + پسوندهایِ مجاز) در CI قفل باشد.
 */
export function wordFormRegex(word: string): RegExp {
  const w = word.trim();
  if (w.endsWith("e")) {
    return new RegExp(`\\b${escapeRe(w.slice(0, -1))}(?:e|es|ed|ing)\\b`, "i");
  }
  if (w.endsWith("y")) {
    return new RegExp(`\\b${escapeRe(w.slice(0, -1))}(?:y|ies|ied|ying)\\b`, "i");
  }
  return new RegExp(`\\b${escapeRe(w)}(?:s|es|ed|ing)?\\b`, "i");
}

// نمایهٔ متن‌ها — یک‌بار و تنبل ساخته می‌شود؛ کلیدِ ماژول، حافظهٔ پرس‌وجوهاست
let unitsCache: UsageTextUnit[] | null = null;

function textUnits(): UsageTextUnit[] {
  if (unitsCache) return unitsCache;
  const units: UsageTextUnit[] = [];
  for (const l of lessons) {
    units.push({
      lessonId: l.id,
      kind: "conversation",
      titleFa: `مکالمهٔ درس ${faNum(l.id)} — ${l.titleFa}`,
      en: l.conversation.introEn,
      fa: l.conversation.introFa,
    });
    for (const line of l.conversation.lines) {
      units.push({
        lessonId: l.id,
        kind: "conversation",
        titleFa: `مکالمهٔ درس ${faNum(l.id)} — ${l.titleFa}`,
        en: line.en,
        fa: line.fa,
      });
    }
    for (const r of l.readings) {
      for (const p of r.paragraphs) {
        units.push({
          lessonId: l.id,
          kind: "reading",
          titleFa: `${r.titleFa} — درس ${faNum(l.id)}`,
          en: p.en,
          fa: p.fa,
        });
      }
    }
  }
  unitsCache = units;
  return units;
}

// گزیدهٔ جمله‌ای: جمله‌هایِ دارایِ تطبیق — حداکثر ۲ جمله، ترتیبِ حفظ می‌شود
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z"'])/;

function excerptEn(en: string, re: RegExp): string {
  const sentences = en.split(SENTENCE_SPLIT).filter((s) => re.test(s));
  if (sentences.length === 0) return en;
  return sentences.slice(0, 2).join(" ");
}

const usageCache = new Map<string, WordUsageSite[]>();

/** همهٔ جای‌هایِ «word» در مکالمه‌ها و ریدینگ‌هایِ جزوه — هم‌درس و میان‌درسی */
export function findWordUsages(word: string): WordUsageSite[] {
  const key = word.trim().toLowerCase();
  if (key === "") return [];
  const cached = usageCache.get(key);
  if (cached) return cached;
  const re = wordFormRegex(word);
  const sites: WordUsageSite[] = [];
  for (const u of textUnits()) {
    if (re.test(u.en)) {
      sites.push({
        lessonId: u.lessonId,
        kind: u.kind,
        titleFa: u.titleFa,
        en: excerptEn(u.en, re),
        fa: u.fa,
      });
    }
  }
  usageCache.set(key, sites);
  return sites;
}

/** قطعه‌بندیِ متن برایِ هایلایت — قطعه‌هایِ hit با mark رندر می‌شوند */
export interface UsageHighlightPart {
  text: string;
  hit: boolean;
}

export function highlightParts(en: string, word: string): UsageHighlightPart[] {
  const parts: UsageHighlightPart[] = [];
  const re = new RegExp(wordFormRegex(word).source, "gi");
  let last = 0;
  for (const m of en.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ text: en.slice(last, idx), hit: false });
    parts.push({ text: m[0], hit: true });
    last = idx + m[0].length;
  }
  if (last < en.length) parts.push({ text: en.slice(last), hit: false });
  return parts;
}
