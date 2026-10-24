// ------------------------------------------------------------------
// r352 — «پنلِ معلم» — گامِ نخستِ بزرگترین خالیِ ممیزی (Phase 3).
// این ماژول «موتورِ خالصِ» گزارشِ کلاس است: انواعِ مشترکِ مسیر و نما +
// تجمیعهایِ بدونِ اثرِ جانبی — خودِ مسیر فقط گیتِ کد + کوئریهای DB است
// و نما فقط رندر. قراردادهایِ صداقت:
//   · یادگیرندهٔ بیتلاش: میانگین/بهترین/ضعیفترین = null — «—»یِ چاپی،
//     نه صفرِ ساختگی (همان idiomِ coverage).
//   · روزهایِ بیرویدادِ نوارِ هفتروزه: صفرِ واقعی (بنیادِ صفر با شاهد).
//   · byLesson رویِ درسهایِ ۱..۱۲ (حقیقتِ جزوه) — درسِ لمسنشده
//     attempts=0 / avgPercent=null؛ درسِ خارجِ بازه (دفاعی) ضمیمه میشود.
//   · فهرست: همهٔ پروفایلها — مرتبِ قطعی: تلاش نزولی، میانگین نزولی، نام.
//   · حریم: هیچ userId/secretی در خروجی نیست — نام و رنگ و آمارِ تجمیعی.
// ------------------------------------------------------------------

import { relativeAgeFa, TEACHER_HEAD } from "@/lib/time-fa";

export const TEACHER_DAYS_WINDOW = 7;

// r353 — «عمقِ پنلِ معلم»: پنجرهٔ نوارِ روندِ تک‌یادگیرنده در دیالوگِ جزئیات
export const LEARNER_DAYS_WINDOW = 14;

export interface WeakestSkill {
  category: string;
  avgPercent: number;
}

export interface RosterRow {
  name: string;
  color: string;
  attempts: number;
  avgPercent: number | null;
  bestPercent: number | null;
  lessons: number;
  lastActive: string | null; // ISO — null = هنوز هیچ تلاشی ثبت نشده
  weakest: WeakestSkill | null;
  // r353 — شناسهٔ ناموجودالاثرِ HMAC(userId, کدِ اپراتور) — نه userId است
  // نه هیچ رازی؛ با چرخشِ کد عوض میشود و از payloadِ گزارش به دیالوگِ
  // جزئیات میرود. اختیاری: fixturesِ قدیمی و CSV دستنخورده میمانند.
  handle?: string;
}

export interface LessonCoverage {
  lesson: number;
  attempts: number;
  avgPercent: number | null;
}

export interface ClassSummary {
  learners: number;
  attempts: number;
  avgPercent: number | null; // کلِ کلاس — کلاسِ بیتلاش = null
  last24h: number;
  byDay: { day: string; attempts: number }[]; // ۷ روز، کهنه→امروز، صفرها واقعی
  byLesson: LessonCoverage[]; // ۱..۱۲ + خارجیِ دفاعی، صعودی
}

export interface TeacherReport {
  generatedAt: string;
  summary: ClassSummary;
  roster: RosterRow[];
}

// ---------------- ورودیهایِ خام از DB (فقطِ لازم) ----------------

export interface AttemptAgg {
  userId: string;
  count: number;
  avgPercent: number;
  bestPercent: number;
}

export interface AttemptRow {
  userId: string;
  category: string;
  createdAt: Date | string;
}

/** میانگینِ هر (کاربر×مهارت) — برایِ «ضعیفترین» */
export interface UserCategoryAvg {
  userId: string;
  category: string;
  avgPercent: number;
}

// ---------------- کمکهایِ خالص ----------------

const utcDayKey = (d: Date | string): string =>
  (typeof d === "string" ? new Date(d) : d).toISOString().slice(0, 10);

/** بستنهٔ روزهایِ پنجره — صفرها واقعی، کهنه→امروز */
export function buildByDay(
  createdAts: (Date | string)[],
  now: number = Date.now(),
  days: number = TEACHER_DAYS_WINDOW
): { day: string; attempts: number }[] {
  const counts = new Map<string, number>();
  for (const c of createdAts) {
    const k = utcDayKey(c);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const out: { day: string; attempts: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ day, attempts: counts.get(day) ?? 0 });
  }
  return out;
}

/** ضعیفترین مهارتِ کاربر — کمترینِ میانگین، تساوی ⇒ نامِ صعودی (قطعی) */
export function pickWeakest(rows: UserCategoryAvg[]): WeakestSkill | null {
  if (rows.length === 0) return null;
  const sorted = [...rows].sort(
    (a, b) => a.avgPercent - b.avgPercent || a.category.localeCompare(b.category)
  );
  const w = sorted[0];
  return { category: w.category, avgPercent: Math.round(w.avgPercent) };
}

/** مرتبِ قطعیِ فهرست: تلاش نزولی، میانگین نزولی (null آخر)، نام */
export function sortRoster(rows: RosterRow[]): RosterRow[] {
  return [...rows].sort((a, b) => {
    if (b.attempts !== a.attempts) return b.attempts - a.attempts;
    const av = a.avgPercent ?? -1;
    const bv = b.avgPercent ?? -1;
    if (bv !== av) return bv - av;
    return a.name.localeCompare(b.name, "fa");
  });
}

// ------------------------------------------------------------------
// r353 — مرتبسازیِ دستیِ فهرست از سویِ معلم — چهار کلید، همه قطعی با
// تساویِ «نامِ فارسی» و nullِ آخر (هیچ ردیفی گم نمیشود، هیچ ترتیبی
// بینِ دو رندر نوسان نمیکند). «attempts» عینِ ترتیبِ سرور است.
// ------------------------------------------------------------------
export type RosterSortKey = "attempts" | "avg" | "name" | "recent";

export const ROSTER_SORT_LABELS: Record<RosterSortKey, string> = {
  attempts: "فعال‌ترین",
  avg: "میانگین",
  name: "نام",
  recent: "آخرین",
};

export function sortRosterBy(rows: RosterRow[], key: RosterSortKey): RosterRow[] {
  const s = [...rows];
  const byName = (a: RosterRow, b: RosterRow) => a.name.localeCompare(b.name, "fa");
  if (key === "attempts") return sortRoster(s);
  if (key === "avg")
    return s.sort(
      (a, b) =>
        (b.avgPercent ?? -1) - (a.avgPercent ?? -1) || byName(a, b)
    );
  if (key === "name") return s.sort(byName);
  // recent: ISO نزولی — null («هرگز») همیشه آخر؛ تساوی ⇒ نام
  return s.sort(
    (a, b) =>
      (b.lastActive ?? "").localeCompare(a.lastActive ?? "") || byName(a, b)
  );
}

/** «همین حالا / N ساعت پیش / N روز پیش / هرگز» — r385: پله‌سِ محاسبه به مالکِ
 * دامنه (lib/time-fa) کوچید؛ اینجا فقط فالبکِ دامنهایِ معلم («هرگز» برای
 * بی‌سابقه/ناخوانا) و گویشِ TEACHER_HEAD میماند. محلیِ faDigits (سومین
 * دوقلوی ارقام) با همان جراحی مرد. */
export function lastActiveFa(iso: string | null, now: number = Date.now()): string {
  if (!iso) return "هرگز";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "هرگز";
  return relativeAgeFa(now - t, TEACHER_HEAD) ?? "هرگز";
}

// ---------------- مونتاژِ گزارش از خروجیهایِ DB ----------------

export function assembleReport(input: {
  now?: number;
  profiles: { userId: string; name: string; color: string }[];
  agg: AttemptAgg[];
  totalAttempts: number;
  classAvg: number | null;
  last24h: number;
  attemptRows: AttemptRow[];
  userLessonCounts: { userId: string; lesson: number; count: number }[];
  userCategoryAvgs: UserCategoryAvg[];
  lessonAgg: { lesson: number; count: number; avgPercent: number | null }[];
  // r353 — شناسهٔ ناموجودالاثرِ هر ردیف (HMAC روی userId با کدِ اپراتور)؛
  // خودِ userId هرگز از مرزِ این تابع بیرون نمیرود.
  handleOf?: (userId: string) => string;
}): TeacherReport {
  const now = input.now ?? Date.now();
  const aggMap = new Map(input.agg.map((a) => [a.userId, a]));

  const lessonsPerUser = new Map<string, Set<number>>();
  for (const r of input.userLessonCounts) {
    let set = lessonsPerUser.get(r.userId);
    if (!set) {
      set = new Set<number>();
      lessonsPerUser.set(r.userId, set);
    }
    set.add(r.lesson);
  }

  const catsByUser = new Map<string, UserCategoryAvg[]>();
  for (const c of input.userCategoryAvgs) {
    let list = catsByUser.get(c.userId);
    if (!list) {
      list = [];
      catsByUser.set(c.userId, list);
    }
    list.push(c);
  }

  const lastByUser = new Map<string, string>();
  for (const r of input.attemptRows) {
    const iso = (typeof r.createdAt === "string" ? r.createdAt : r.createdAt.toISOString());
    const prev = lastByUser.get(r.userId);
    if (!prev || prev < iso) lastByUser.set(r.userId, iso);
  }

  const roster = sortRoster(
    input.profiles.map((p) => {
      const a = aggMap.get(p.userId);
      return {
        name: p.name,
        color: p.color,
        attempts: a?.count ?? 0,
        avgPercent: a ? Math.round(a.avgPercent) : null,
        bestPercent: a ? Math.round(a.bestPercent) : null,
        lessons: lessonsPerUser.get(p.userId)?.size ?? 0,
        lastActive: lastByUser.get(p.userId) ?? null,
        weakest: pickWeakest(catsByUser.get(p.userId) ?? []),
        handle: input.handleOf?.(p.userId),
      };
    })
  );

  // پوششِ درسها: ۱..۱۲ حقیقتِ جزوه + خارجیِ دفاعی
  const lessonMap = new Map(input.lessonAgg.map((l) => [l.lesson, l]));
  const lessonIds = new Set<number>([...lessonMap.keys()]);
  for (let i = 1; i <= 12; i++) lessonIds.add(i);
  const byLesson: LessonCoverage[] = [...lessonIds]
    .sort((a, b) => a - b)
    .map((lesson) => {
      const row = lessonMap.get(lesson);
      return {
        lesson,
        attempts: row?.count ?? 0,
        avgPercent: row && row.count > 0 ? Math.round(row.avgPercent ?? 0) : null,
      };
    });

  return {
    generatedAt: new Date(now).toISOString(),
    summary: {
      learners: input.profiles.length,
      attempts: input.totalAttempts,
      avgPercent: input.classAvg === null ? null : Math.round(input.classAvg),
      last24h: input.last24h,
      byDay: buildByDay(
        input.attemptRows.map((r) => r.createdAt),
        now
      ),
      byLesson,
    },
    roster,
  };
}

// ==================================================================
// r353 — «عمقِ پنلِ معلم»: موتورِ خالصِ جزئیاتِ تک‌یادگیرنده.
// ورودی فقط پروفایل + تلاشهایِ همان یادگیرنده است — هیچ userId و
// secret و پاسخِ خامی وارد یا خارج نمیشود (قفلِ حریمِ r352 دستنخورده).
// صداقت‌ها عینِ گزارشِ کلاس: بیتلاش = null نه صفرِ ساختگی؛ روزهایِ
// بیرویداد = صفرِ واقعی؛ درسِ لمسنشده = attempts:0 / avg:null.
// ==================================================================

export interface LearnerAttemptRow {
  category: string;
  lesson: number;
  percent: number;
  createdAt: Date | string;
}

export interface LearnerSkillRow {
  category: string;
  attempts: number;
  avgPercent: number;
  bestPercent: number;
}

export interface LearnerRecentRow {
  category: string;
  lesson: number;
  percent: number;
  createdAt: string; // ISO
}

export interface LearnerDetail {
  name: string;
  color: string;
  joinedAt: string; // ISO — عضویت
  attempts: number;
  avgPercent: number | null; // یادگیرندهٔ بیتلاش = null
  bestPercent: number | null;
  lessons: number;
  lastActive: string | null; // ISO
  byDay: { day: string; attempts: number }[]; // ۱۴ روز، کهنه→امروز، صفرِ واقعی
  byLesson: LessonCoverage[]; // ۱..۱۲ + خارجیِ دفاعی، صعودی
  bySkill: LearnerSkillRow[]; // ضعیفترینِ اول (میانگین صعودی، تساوی ⇒ نام)
  recent: LearnerRecentRow[]; // حداکثر ۶، نو→کهنه
}

export const LEARNER_RECENT_CAP = 6;

export function assembleLearnerDetail(input: {
  now?: number;
  profile: { name: string; color: string; createdAt: Date | string };
  attempts: LearnerAttemptRow[];
}): LearnerDetail {
  const now = input.now ?? Date.now();
  const rows = input.attempts;

  const percents = rows.map((r) => r.percent);
  const avg = percents.length ? percents.reduce((s, p) => s + p, 0) / percents.length : null;
  const best = percents.length ? Math.max(...percents) : null;

  const lastActive = rows
    .map((r) => (typeof r.createdAt === "string" ? r.createdAt : r.createdAt.toISOString()))
    .sort()
    .at(-1) ?? null;

  // شکستِ مهارت‌به‌مهارت — ضعیفترینِ اول
  const catMap = new Map<string, { attempts: number; sum: number; best: number }>();
  for (const r of rows) {
    const c = catMap.get(r.category) ?? { attempts: 0, sum: 0, best: 0 };
    c.attempts += 1;
    c.sum += r.percent;
    c.best = Math.max(c.best, r.percent);
    catMap.set(r.category, c);
  }
  const bySkill: LearnerSkillRow[] = [...catMap.entries()]
    .map(([category, c]) => ({
      category,
      attempts: c.attempts,
      avgPercent: Math.round(c.sum / c.attempts),
      bestPercent: Math.round(c.best),
    }))
    .sort((a, b) => a.avgPercent - b.avgPercent || a.category.localeCompare(b.category));

  // شکستِ درس‌به‌درس — ۱..۱۲ حقیقتِ جزوه + خارجیِ دفاعی (عینِ گزارشِ کلاس)
  const lessonAgg = new Map<number, { count: number; sum: number }>();
  for (const r of rows) {
    const l = lessonAgg.get(r.lesson) ?? { count: 0, sum: 0 };
    l.count += 1;
    l.sum += r.percent;
    lessonAgg.set(r.lesson, l);
  }
  const lessonIds = new Set<number>([...lessonAgg.keys()]);
  for (let i = 1; i <= 12; i++) lessonIds.add(i);
  const byLesson: LessonCoverage[] = [...lessonIds]
    .sort((a, b) => a - b)
    .map((lesson) => {
      const row = lessonAgg.get(lesson);
      return {
        lesson,
        attempts: row?.count ?? 0,
        avgPercent: row && row.count > 0 ? Math.round(row.sum / row.count) : null,
      };
    });

  // شش تلاشِ آخر — نو→کهنه (موتور به ترتیبِ ورودی اعتماد نمیکند؛
  // مقایسه روی ISOی کامل — دو تلاشِ همروز هم درست مرتب میشوند)
  const isoOf = (c: Date | string): string =>
    typeof c === "string" ? c : c.toISOString();
  const recent: LearnerRecentRow[] = [...rows]
    .sort((a, b) => isoOf(b.createdAt).localeCompare(isoOf(a.createdAt)))
    .slice(0, LEARNER_RECENT_CAP)
    .map((r) => ({
      category: r.category,
      lesson: r.lesson,
      percent: r.percent,
      createdAt: isoOf(r.createdAt),
    }));

  return {
    name: input.profile.name,
    color: input.profile.color,
    joinedAt:
      typeof input.profile.createdAt === "string"
        ? input.profile.createdAt
        : input.profile.createdAt.toISOString(),
    attempts: rows.length,
    avgPercent: avg === null ? null : Math.round(avg),
    bestPercent: best === null ? null : Math.round(best),
    lessons: lessonAgg.size,
    lastActive,
    byDay: buildByDay(
      rows.map((r) => r.createdAt),
      now,
      LEARNER_DAYS_WINDOW
    ),
    byLesson,
    bySkill,
    recent,
  };
}

// ==================================================================
// r380 — «درِ صداقتِ کهنگیِ گزارش» — موتورِ خالصِ کهنگی.
// گزارشِ پنل یک snapshot است (generatedAt) و سربرگ لحظهاش را چاپ
// میکند؛ اما کهنگی را نام نمیداد. این موتور «قدیمیبودن» را با
// قراردادِ همان خانواده داوری میکند:
//   · مرزِ strict: only now - t > REPORT_STALE_MS — دقیقاً ۵ دقیقه
//     هنوز تازه است، ۱ms بیشتر کهنه (داده‌محور، عینِ مرزِ r378)
//   · generatedAtِ غایب/ناخوانا ⇒ false — بدونِ شاهد ادعای کهنگی
//     ممنوع (عینِ «خالیِ صادقِ» lastActive)
//   · ساعتِ مقایسه از فراخوانده میآید — نما با تیکِ محلیِ ۶۰ثانیهای
//     مؤدب «الان» را نو میکند؛ هیچ واکشِ خودکاری در کار نیست
//     (پنلِ read-only میماند) و هیچ رویدادِ تحلیلیِ نو ثبت نمیشود.
// ==================================================================

/** آستانهٔ کهنگیِ گزارشِ پنل — ۵ دقیقه؛ بعدش سربرگ صادقانه هشدار میدهد */
export const REPORT_STALE_MS = 5 * 60 * 1000;

export function isReportStale(generatedAt: string | null | undefined, now: number): boolean {
  if (typeof generatedAt !== "string" || generatedAt.length === 0) return false;
  const t = Date.parse(generatedAt);
  return Number.isFinite(t) && now - t > REPORT_STALE_MS;
}
