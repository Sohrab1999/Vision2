// ------------------------------------------------------------------
// فرمان‌یاب (Command Palette) — موتور خالص جست‌وجو (Task 66).
// نرمال‌سازی فارسی‌پسند (ی/ك عربی، ارقام فارسی/عربی، نیم‌فاصله و
// کاراکترهای نامرئی، حروف بزرگ لاتین، فشردگی فاصله) + امتیازدهی
// توکن‌محور با معنای AND و ترتیب پایدار (ایده‌آل برای لیست‌های RTL).
// هیچ وابستگی به React/store ندارد — آزمون‌پذیر خالص.
// ------------------------------------------------------------------

export interface CommandDef {
  id: string;
  label: string;
  group: string;
  hint?: string;
  keywords?: string[];
}

/** ترتیب نمایش گروه‌ها در پنل (گروه‌های ناشناخته می‌آیند آخر، به ترتیب ورود) */
export const COMMAND_GROUPS = [
  "ناوبری",
  "درس‌ها",
  "بخش‌های درس",
  "تمرین و چالش",
  "گزارش‌ها",
  "ابزارها",
] as const;

// ------------------------------------------------------------------
// فرمان‌های عمق‌دار درس (Task 67) — پرش مستقیم به تبِ مشخص یک درس.
// شناسه‌ها قراردادی‌اند: «ltab-<درس>-<تب>» برای تب‌ها و
// «lesson-smart-<درس>» برای فلش‌کارت هوشمند SRS همان درس.
// ------------------------------------------------------------------

export interface LessonTabSeed {
  id: number;
  titleEn: string;
  titleFa: string;
}

export interface PaletteTabSeed {
  key: string;
  label: string;
  keywords: string[];
}

/** هفت تبِ درس به ترتیب خودِ درس‌نما + کلیدواژه‌های مترادف (برچسب با کسرهٔ اضافه مثل خودِ تب) */
export const PALETTE_TABS: PaletteTabSeed[] = [
  { key: "vocab", label: "واژگان", keywords: ["vocab", "words", "لغت", "واژه", "فلش‌کارت", "flashcard"] },
  { key: "conversation", label: "مکالمهٔ", keywords: ["conversation", "dialog", "گفتگو", "دیالوگ"] },
  { key: "reading", label: "ریدینگ", keywords: ["reading", "passage", "متن", "خواندن"] },
  { key: "grammar", label: "گرامر", keywords: ["grammar", "قواعد", "دستور زبان"] },
  { key: "writing", label: "نگارش", keywords: ["writing", "sentence", "جمله‌سازی", "نوشتن"] },
  { key: "dictation", label: "دیکتهٔ", keywords: ["dictation", "spelling", "املا", "املاء"] },
  { key: "tests", label: "تست‌های", keywords: ["quiz", "کوییز", "آزمون درس"] },
];

/**
 * برای هر درس: هفت فرمان تب + یک فرمان «فلش‌کارت هوشمند» (نیت SRS).
 * ۳ درس × ۸ = ۲۴ فرمان در گروه «بخش‌های درس».
 */
export function lessonTabCommands(lessons: LessonTabSeed[]): CommandDef[] {
  const out: CommandDef[] = [];
  for (const l of lessons) {
    for (const t of PALETTE_TABS) {
      out.push({
        id: `ltab-${l.id}-${t.key}`,
        label: `${t.label} درس ${faDigits(l.id)}`,
        group: "بخش‌های درس",
        hint: `${l.titleFa} · ${l.titleEn}`,
        keywords: [...t.keywords, l.titleEn.toLowerCase(), `lesson ${l.id}`],
      });
    }
    out.push({
      id: `lesson-smart-${l.id}`,
      label: `فلش‌کارت هوشمند درس ${faDigits(l.id)}`,
      group: "بخش‌های درس",
      hint: `مرور SRS واژگان · ${l.titleFa}`,
      keywords: ["srs", "flashcard", "مرور هوشمند", l.titleEn.toLowerCase(), `lesson ${l.id}`],
    });
  }
  return out;
}

/** تجزیهٔ شناسهٔ قراردادی تب درس؛ نامعتبر → null */
export function parseLessonTabId(id: string): { lesson: number; tab: string } | null {
  if (!id.startsWith("ltab-")) return null;
  const rest = id.slice("ltab-".length);
  const dash = rest.indexOf("-");
  if (dash <= 0) return null;
  const lesson = Number(rest.slice(0, dash));
  const tab = rest.slice(dash + 1);
  if (!Number.isInteger(lesson) || lesson <= 0 || !tab) return null;
  return { lesson, tab };
}

/** ادغام «آخرین فرمان‌ها»: جلوبری + حذف تکرار + سقف (پیش‌فرض ۵) */
export function mergeRecent(prev: string[], id: string, cap = 5): string[] {
  return [id, ...prev.filter((x) => x !== id)].slice(0, Math.max(1, cap));
}

const INVISIBLE = /[\u200c\u200b\u200e\u200f\uFEFF]/g;
const HAMZA_MARKS = /[\u0653\u0654\u0655]/g; // نشانه‌های ترکیبیِ همزهٔ بالای حرف
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** نمایش عدد با ارقام فارسی (برای برچسب‌ها) */
export function faDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/**
 * یکسان‌سازی متن برای مقایسه: حذف نیم‌فاصله و کاراکترهای نامرئی،
 * ارقام عربی/فارسی → لاتین، ی/ك عربی → فارسی، حروف بزرگ → کوچک،
 * فشردگی فاصله‌ها. نیم‌فاصله حذف می‌شود تا «واژه‌های» و «واژه های»
 * یکی شوند (هر دو سمتِ مقایسه همین تابع را می‌گیرند).
 */
export function normalizeFa(s: string): string {
  return s
    .replace(INVISIBLE, "")
    .replace(HAMZA_MARKS, "")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** امتیاز زیردنباله (تطبیق حروف به‌ترتیب؛ اجرای متوالی امتیاز بیشتری دارد)؛ -۱ یعنی نیافت */
function subsequenceScore(field: string, token: string): number {
  let i = 0;
  let run = 0;
  let bestRun = 0;
  let prev = -2;
  for (let c = 0; c < field.length && i < token.length; c++) {
    if (field[c] === token[i]) {
      run = prev === c - 1 ? run + 1 : 1;
      if (run > bestRun) bestRun = run;
      prev = c;
      i++;
    }
  }
  if (i < token.length) return -1;
  return 30 + bestRun * 5;
}

/**
 * امتیاز یک فرمان نسبت به پرس‌وجو: همهٔ توکن‌ها باید بیابند (AND)،
 * هر توکن بهترین امتیازِ میدان‌هایش (برچسب ۱.۲ / کلیدواژه ۱ / توضیح ۰.۶
 * / گروه ۰.۵) را می‌گیرد. تطبیق کامل > پیشوند > آغازِ واژه > زیررشته
 * > زیردنباله. پرس‌وجوی خالی یعنی «همه» → ۰.
 */
export function scoreCommand(rawQuery: string, cmd: CommandDef): number {
  const q = normalizeFa(rawQuery);
  if (!q) return 0;
  const tokens = q.split(" ").filter(Boolean);
  if (!tokens.length) return 0;

  const fields: { text: string; w: number }[] = [
    { text: normalizeFa(cmd.label), w: 1.2 },
    ...(cmd.keywords ?? []).map((k) => ({ text: normalizeFa(k), w: 1 })),
    ...(cmd.hint ? [{ text: normalizeFa(cmd.hint), w: 0.6 }] : []),
    { text: normalizeFa(cmd.group), w: 0.5 },
  ];

  let total = 0;
  for (const t of tokens) {
    let best = -1;
    for (const f of fields) {
      let s = -1;
      if (f.text === t) s = 120;
      else if (f.text.startsWith(t)) s = 100;
      else if (f.text.includes(` ${t}`)) s = 90;
      else if (f.text.includes(t)) s = 80;
      else s = subsequenceScore(f.text, t);
      if (s >= 0) s = Math.round(s * f.w);
      if (s > best) best = s;
    }
    if (best < 0) return -1; // AND — یک توکنِ بی‌نتیجه کل فرمان را می‌اندازد
    total += best;
  }

  // پاداش «برچسب همهٔ توکن‌ها را پوشش می‌دهد»
  const label = normalizeFa(cmd.label);
  if (tokens.every((t) => label.includes(t))) total += 15;
  return total;
}

/**
 * پالایش فرمان‌ها: پرس‌وجوی خالی → همان ترتیب ورودی (تا سقف)،
 * وگرنه نزولی امتیاز با ترتیب پایدار برای تساوی‌ها، بریده تا سقف.
 * (گروه «اخیر» سمت UI ساخته می‌شود — این تابع فرمان‌های تخت می‌گیرد.)
 */
export function filterCommands(cmds: CommandDef[], query: string, cap = 12): CommandDef[] {
  if (!normalizeFa(query)) return cmds.slice(0, cap);
  return cmds
    .map((cmd, idx) => ({ cmd, idx, score: scoreCommand(query, cmd) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .slice(0, cap)
    .map((x) => x.cmd);
}
