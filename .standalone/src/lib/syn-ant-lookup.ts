// ------------------------------------------------------------------
// «دیکشنریِ جفت‌آگاه» (Task 203) — نمایِ جفت‌های مترادف/متضاد جزوه.
//
// جدول‌های SYN/ANT (۳۰۹ مترادف + ۲۱۷ متضاد روی ۱۲ درس) از تسکِ ۲۰۲ تبِ
// خودشان را دارند؛ این ماژول همان ردیف‌ها را برای کارتِ واژهٔ دیکشنری
// نمای می‌کند: هر واژه چه به‌عنوانِ سرِ ردیف و چه به‌عنوانِ همتای ردیفی
// دیگر (borrow ↔ lend از هر دو سو) جفت‌هایش را می‌گیرد.
//
// خالص است — هیچ import از store/React. کلیدِ نمایه همیشه
// trim+lowercase است؛ جفت‌های عبارتی («in addition to») سالم می‌مانند.
// ------------------------------------------------------------------

import type { LessonData } from "./study-types";

export interface SynAntPairEntry {
  kind: "syn" | "ant";
  /** واژهٔ همتا — هم‌جهت با kind: برای syn هم‌معنی، برای ant متضاد */
  other: string;
  /** ترجمهٔ فارسیِ ردیفِ جزوه (مشترک بین دو سر) */
  fa: string;
  lessonId: number;
}

/** کلیدِ نمایه: trim + lowercase — جستجوی بی‌حساس به بزرگیِ حرف */
export function normalizePairWord(en: string): string {
  return en.trim().toLowerCase();
}

/**
 * نمایهٔ دوطرفهٔ جفت‌ها — هر ردیفِ جزوه دو کلید می‌سازد: سرِ ردیف (en)
 * و همتا (syn/ant)، تا «borrow» و «lend» هر دو همدیگر را پیدا کنند.
 * تکرارِ (kind, other, lessonId) یک‌بار ثبت می‌شود.
 */
export function buildSynAntIndex(lessons: LessonData[]): Map<string, SynAntPairEntry[]> {
  const index = new Map<string, SynAntPairEntry[]>();

  const push = (key: string, entry: SynAntPairEntry) => {
    const k = normalizePairWord(key);
    if (!k) return;
    const list = index.get(k);
    if (!list) {
      index.set(k, [entry]);
      return;
    }
    const dup = list.some(
      (e) => e.kind === entry.kind && e.other === entry.other && e.lessonId === entry.lessonId
    );
    if (!dup) list.push(entry);
  };

  for (const lesson of lessons) {
    for (const row of lesson.synonyms ?? []) {
      push(row.en, { kind: "syn", other: row.syn, fa: row.fa, lessonId: lesson.id });
      push(row.syn, { kind: "syn", other: row.en, fa: row.fa, lessonId: lesson.id });
    }
    for (const row of lesson.antonyms ?? []) {
      push(row.en, { kind: "ant", other: row.ant, fa: row.fa, lessonId: lesson.id });
      push(row.ant, { kind: "ant", other: row.en, fa: row.fa, lessonId: lesson.id });
    }
  }

  // ترتیبِ قطعی: اولِ مترادف، بعدِ متضاد؛ داخلِ هر خانواده الفبایی
  for (const list of index.values()) {
    list.sort((a, b) =>
      a.kind === b.kind
        ? a.other.localeCompare(b.other)
        : a.kind === "syn"
          ? -1
          : 1
    );
  }
  return index;
}

/** جفت‌های یک واژه — برای واژهٔ بی‌جفت آرایهٔ خالی (نه undefined) */
export function synAntPairsFor(index: Map<string, SynAntPairEntry[]>, en: string): SynAntPairEntry[] {
  return index.get(normalizePairWord(en)) ?? [];
}

/**
 * جستجوی ازراهِجفت — آیا ردیفِ جفتِ این واژه با پرس‌وجو می‌خواند؟
 * «lend» کارتِ «borrow» را می‌آورد؛ پرس‌وجو هرجا بیاید خودش
 * trim+lowercase می‌شود (تطبیقِ جزئیِ includes).
 */
export function matchesViaPairs(
  index: Map<string, SynAntPairEntry[]>,
  en: string,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return synAntPairsFor(index, en).some((p) => p.other.toLowerCase().includes(q));
}
