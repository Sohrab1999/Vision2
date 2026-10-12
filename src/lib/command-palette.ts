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
  "تمرین و چالش",
  "گزارش‌ها",
  "ابزارها",
] as const;

const INVISIBLE = /[\u200c\u200b\u200e\u200f\uFEFF]/g;

/**
 * یکسان‌سازی متن برای مقایسه: حذف نیم‌فاصله و کاراکترهای نامرئی،
 * ارقام عربی/فارسی → لاتین، ی/ك عربی → فارسی، حروف بزرگ → کوچک،
 * فشردگی فاصله‌ها. نیم‌فاصله حذف می‌شود تا «واژه‌های» و «واژه های»
 * یکی شوند (هر دو سمتِ مقایسه همین تابع را می‌گیرند).
 */
export function normalizeFa(s: string): string {
  return s
    .replace(INVISIBLE, "")
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
