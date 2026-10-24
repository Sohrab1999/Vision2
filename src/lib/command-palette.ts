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

/** ترتیب نمایش گروه‌ها در پنل (گروه‌های ناشناخته می‌آیند آخر، به ترتیب ورود).
 *  راند ۲۴۱ — گروهِ «ادامه‌های اخیر» درست بعد از «ناوبری» می‌نشیند: هشتمین
 *  درِ حلقهٔ «ادامهٔ مطالعه» (چیپ‌هایِ اخیرِ ضمیمه که جست‌وجوپذیر شده‌اند).
 *  راند ۲۴۴ — گروهِ «درهای حلقه» درست بعدِ آن: فرمان‌هایِ پرش به محلِ هر درِ
 *  حلقه از تک‌منبعِ RESUME_LOOP_DOORS (مصرفِ دومِ فهرستِ زنده).
 *  راند ۳۶۸ — گروهِ «درهای خانه» درست بعدِ آن: فرمان‌هایِ پرشِ درهایِ
 *  خوشهٔ بازگشت از تک‌منبعِ RETURN_CLUSTER_DOORS (مصرفِ چهارمِ فهرستِ زنده). */
export const COMMAND_GROUPS = [
  "ناوبری",
  "ادامه‌های اخیر",
  "درهای حلقه",
  "درهای خانه",
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

/** هشت تبِ درس به ترتیب خودِ درس‌نما + کلیدواژه‌های مترادف (برچسب با کسرهٔ اضافه مثل خودِ تب) */
export const PALETTE_TABS: PaletteTabSeed[] = [
  { key: "vocab", label: "واژگان", keywords: ["vocab", "words", "لغت", "واژه", "فلش‌کارت", "flashcard"] },
  { key: "conversation", label: "مکالمهٔ", keywords: ["conversation", "dialog", "گفتگو", "دیالوگ"] },
  { key: "reading", label: "ریدینگ", keywords: ["reading", "passage", "متن", "خواندن"] },
  { key: "grammar", label: "گرامر", keywords: ["grammar", "قواعد", "دستور زبان"] },
  { key: "writing", label: "نگارش", keywords: ["writing", "sentence", "جمله‌سازی", "نوشتن"] },
  { key: "dictation", label: "دیکتهٔ", keywords: ["dictation", "spelling", "املا", "املاء"] },
  { key: "tests", label: "تست‌های", keywords: ["quiz", "کوییز", "آزمون درس"] },
  { key: "synant", label: "مترادف و متضادِ", keywords: ["synonym", "antonym", "مترادف", "متضاد", "معنی"] },
];

/**
 * برای هر درس: هشت فرمان تب + یک فرمان «فلش‌کارت هوشمند» (نیت SRS).
 * ۳ درس × ۹ = ۲۷ فرمان در گروه «بخش‌های درس».
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

// ------------------------------------------------------------------
// فرمان‌های پارامتری (Task 69) — قالب‌هایی که با «عدد در پرس‌وجو»
// نمونهٔ عینی می‌سازند: «آزمون ۲۰» → «آزمون جامع ۲۰ سؤالی».
// شناسه‌ها قراردادی‌اند: «<key>-<عدد اسنپ‌شده>» و با commandFromParamId
// برای گروه «اخیر» از شناسه بازسازی می‌شوند (هم‌الگوی parseLessonTabId).
// ------------------------------------------------------------------

export interface ParamSpec {
  /** کلید قراردادی شناسه — «<key>-<n>» و با صفت زمان «<key>-<n>-<timed|untimed>» */
  key: string;
  /** واژه‌های ماشه (نرمال‌شده) که باید در پرس‌وجو بیایند */
  triggers: string[];
  /** مقادیر مجازِ صعودی — عدد پرس‌وجو به نزدیک‌ترینِ این‌ها می‌چسبد */
  values: readonly number[];
  label: (n: number) => string;
  hint: (n: number) => string;
  group: string;
  keywords?: string[];
  /** صفت زمان («آزمون ۲۰ بدون زمان») برای این خانواده معنا دارد؟ (Task 71) */
  supportsTiming?: boolean;
}

/**
 * چهار خانوادهٔ پارامتری: طول آزمون جامع، طول شبیه‌ساز کنکور، هدف روزانه،
 * و طول «تمرین هوشمند» (Task 74 — هم‌مقادیر با SIZE_OPTIONS نما).
 * تمرین هوشمند ذاتاً بی‌تایمر است — صفت زمان برایش معنا ندارد
 * (supportsTiming=false) و صفتِ تایپ‌شده فقط کلیدواژه می‌شود تا فیلتر AND
 * نتیجه را نکشد (فیکس راند ۷۴).
 */
export const PARAM_SPECS: ParamSpec[] = [
  {
    key: "exam-count",
    triggers: ["آزمون", "exam"],
    values: [10, 20, 30],
    label: (n) => `آزمون جامع ${faDigits(n)} سؤالی`,
    hint: (n) => `شروع سریع — ${faDigits(n)} سؤال از قبل انتخاب شده`,
    group: "تمرین و چالش",
    keywords: ["exam", "final test", "سؤال", "طول آزمون"],
    supportsTiming: true,
  },
  {
    key: "konkur-count",
    triggers: ["کنکور", "شبیه‌ساز", "konkur"],
    values: [10, 20, 30],
    label: (n) => `شبیه‌ساز کنکور ${faDigits(n)} تستی`,
    hint: (n) => `ورود به شبیه‌ساز با ${faDigits(n)} تست`,
    group: "تمرین و چالش",
    keywords: ["konkur", "simulator", "تست"],
    supportsTiming: true,
  },
  {
    key: "daily-goal",
    triggers: ["هدف", "goal"],
    values: [5, 10, 15],
    label: (n) => `هدف روزانه: ${faDigits(n)} فعالیت`,
    hint: (n) => `تنظیم فوری هدف روی ${faDigits(n)} — بدون جابه‌جایی`,
    group: "ابزارها",
    keywords: ["daily goal", "تنظیم هدف", "هدف فعالیت"],
  },
  {
    key: "smart-count",
    triggers: ["تمرین", "هوشمند", "smart"],
    values: [10, 15, 20],
    label: (n) => `تمرین هوشمند ${faDigits(n)} سؤالی`,
    hint: (n) => `جلسهٔ ترکیبی از ضعف‌های تو — ${faDigits(n)} سؤال، بدون تایمر`,
    group: "تمرین و چالش",
    keywords: ["smart practice", "mixed", "بدون تایمر", "فیدبک فوری"],
  },
];

/** نخستین عدد پرس‌وجو (ارقام لاتین پس از normalizeFa)؛ بدون عدد → null */
export function parseQueryNumber(query: string): number | null {
  const m = normalizeFa(query).match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * چسباندن عدد به نزدیک‌ترین مقدار مجاز (لیست صعودی).
 * تساوی فاصله → مقدار پایین‌تر (مقایسهٔ اکید «کوچک‌تر» جایگزین نمی‌کند).
 */
export function snapToValues(n: number, values: readonly number[]): number {
  let best = values[0];
  for (const v of values) {
    if (Math.abs(v - n) < Math.abs(best - n)) best = v;
  }
  return best;
}

// ------------------------------------------------------------------
// صفت زمان (Task 71) — «آزمون ۲۰ بدون زمان» / «کنکور ۳۰ با زمان».
// ماشه‌ها به شکل انسانی نوشته می‌شوند و هر دو سمت نرمال می‌شوند؛
// نیم‌فاصله در normalizeFa حذف می‌شود (نه فاصله‌سازی) پس شکل چسبیده و
// فاصله‌دار هر دو فهرست شده‌اند («بی‌زمان»→«بیزمان»، «بی تایم» فاصله‌دار).
// تطبیق با مرزواژهٔ فاصله‌ای است («بدون زماندار» به «بدون زمان» نمی‌خوابد).
// ------------------------------------------------------------------

export type QueryTiming = "timed" | "untimed";

/** برچسب اشتراکی برچسب/کلیدواژه‌ها */
export const TIMING_LABEL: Record<QueryTiming, string> = { timed: "با زمان", untimed: "بدون زمان" };

const TIMING_UNTIMED_TRIGGERS = [
  "بدون زمان",
  "بیزمان",
  "بی تایم",
  "بیتایم",
  "بدون تایمر",
  "بدونتایمر",
  "بدون زمانسنج",
  "بدون محدودیت",
  "untimed",
  "no timer",
];
const TIMING_TIMED_TRIGGERS = ["با زمان", "بازمان", "با تایمر", "باتایمر", "تایم دار", "تایمدار", "با زمانسنج", "timed"];

/** صفت زمان پرس‌وجو؛ هیچ ماشه‌ای نیامد → null (هر دو سمت نرمال می‌شوند) */
export function parseQueryTiming(query: string): QueryTiming | null {
  const q = normalizeFa(query);
  const padded = ` ${q} `;
  const hit = (list: string[]) =>
    list.some((tr) => {
      const ntr = normalizeFa(tr);
      return padded.includes(` ${ntr} `);
    });
  if (hit(TIMING_UNTIMED_TRIGGERS)) return "untimed";
  if (hit(TIMING_TIMED_TRIGGERS)) return "timed";
  return null;
}

/** چکیدهٔ شناسهٔ پارامتریِ پارس‌شده — منبع یگانهٔ حقیقتِ دیسپچ و «اخیر» */
export interface ParsedParamId {
  spec: ParamSpec;
  n: number;
  timing: QueryTiming | null;
}

/**
 * پارس قرارداد شناسه «<key>-<n>» یا «<key>-<n>-<timed|untimed>>».
 * پسوند ناشناخته/عدد خارج از مقادیر/صفت زمان برای خانوادهٔ بی‌زمان → null.
 */
export function parseParamCommandId(id: string): ParsedParamId | null {
  for (const spec of PARAM_SPECS) {
    if (!id.startsWith(`${spec.key}-`)) continue;
    const rest = id.slice(spec.key.length + 1);
    const m = rest.match(/^(\d+)(?:-(timed|untimed))?$/);
    if (!m) return null;
    const n = Number(m[1]);
    if (!spec.values.includes(n)) return null;
    const timing = (m[2] as QueryTiming | undefined) ?? null;
    if (timing && !spec.supportsTiming) return null;
    return { spec, n, timing };
  }
  return null;
}

/**
 * ساخت CommandDef پارامتری — برچسب/راهنما با صفت زمان تزئین می‌شوند.
 * rawN = عددِ تایپ‌شدهٔ کاربر (پیش از snap)؛ وقتی با مقدار اسنپ‌شده فرق دارد
 * به کلیدواژه‌ها می‌چسبد — وگرنه فیلتر ANDِ توکنی (که همهٔ توکن‌ها باید در
 * متن/کلیدواژه بخوابند) فرمانِ اسنپ‌شده را حذف می‌کرد: «آزمون ۱۵» → برچسب
 * «آزمون جامع ۱۰ سؤالی» توکنِ «۱۵» را ندارد (باگ راند ۷۲).
 * ignoredTiming = صفتِ تایپ‌شده‌ای که خانواده نادیده می‌گیرد (Task 74) —
 * فقط کلیدواژه می‌شود («هدف ۱۵ بدون زمان» → توکن‌های «بدون/زمان» باید
 * جایی بخوابند وگرنه فیلتر AND نتیجهٔ فوری هدف را حذف می‌کرد — همان
 * الگوی ترکیبِ راند ۷۲ برای صفت). کلیدواژه فقط برای رتبه‌بندی است —
 * شناسهٔ دیسپچ canonical می‌ماند («<key>-<n اسنپ‌شده>»، بدون پسوند صفت
 * برای خانواده‌های بی‌زمان تا parseParamCommandId سالم بماند).
 */
function paramCommand(
  spec: ParamSpec,
  n: number,
  timing: QueryTiming | null,
  rawN: number | null = null,
  ignoredTiming: QueryTiming | null = null,
): CommandDef {
  const keywords = [...(spec.keywords ?? [])];
  if (timing) keywords.push(TIMING_LABEL[timing]);
  if (ignoredTiming) keywords.push(TIMING_LABEL[ignoredTiming]);
  if (rawN != null && rawN !== n) keywords.push(String(rawN));
  return {
    id: timing ? `${spec.key}-${n}-${timing}` : `${spec.key}-${n}`,
    label: timing ? `${spec.label(n)}، ${TIMING_LABEL[timing]}` : spec.label(n),
    hint: timing ? `${spec.hint(n)} — تایمر ${timing === "untimed" ? "خاموش" : "روشن"}` : spec.hint(n),
    group: spec.group,
    keywords,
  };
}

/**
 * گسترش پرس‌وجو به فرمان‌های پارامتریِ متناظر: حداقل یک ماشه در توکن‌ها +
 * (عدد یا صفتِ قابل‌اعمال). عدد خارج از مقادیر مجاز به نزدیک‌ترین می‌چسبد —
 * کاربر همیشه نتیجه می‌گیرد. صفت زمان فقط برای خانواده‌های supportsTiming
 * به شناسه/برچسب می‌چسبد («آزمون بدون زمان» → ۱۰ سؤالی بی‌زمان؛ صفت بدون
 * عدد → کوچک‌ترین مقدار)؛ برای خانوادهٔ بی‌زمان صفت «نادیده» می‌شود اما
 * فرمان می‌آید و صفت فقط کلیدواژه است («هدف ۱۵ بدون زمان» → همان هدفِ
 * فوری — قابل‌یافت در فیلتر AND، فیکس راند ۷۴).
 */
export function expandParameterized(query: string): CommandDef[] {
  const q = normalizeFa(query);
  const n = parseQueryNumber(q);
  const timing = parseQueryTiming(q);
  if (!n && !timing) return [];
  const tokens = q.split(" ").filter(Boolean);
  const out: CommandDef[] = [];
  for (const spec of PARAM_SPECS) {
    const hit = spec.triggers.some((tr) => {
      // ماشه هم نرمال می‌شود — «شبیه‌ساز» با نیم‌فاصله باید به «شبیهسازِ»
      // نرمال‌شدهٔ پرس‌وجو بخوابد (هر دو سمتِ مقایسه همین تابع را می‌گیرند)
      const ntr = normalizeFa(tr);
      return ntr.includes(" ") ? q.includes(ntr) : tokens.some((t) => t === ntr || t.includes(ntr));
    });
    if (!hit) continue;
    const useTiming = timing && spec.supportsTiming ? timing : null;
    if (!n && !useTiming) continue; // ماشه بدون عدد و بدون صفت قابل‌اعمال — صرف‌نظر
    const ignoredTiming = timing && !spec.supportsTiming ? timing : null;
    const snapped = n ? snapToValues(n, spec.values) : spec.values[0];
    out.push(paramCommand(spec, snapped, useTiming, n, ignoredTiming));
  }
  return out;
}

/** بازسازی فرمان پارامتری از شناسه‌اش (گروه «اخیر»)؛ ناشناخته → null */
export function commandFromParamId(id: string): CommandDef | null {
  const p = parseParamCommandId(id);
  return p ? paramCommand(p.spec, p.n, p.timing) : null;
}
