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

export const TEACHER_DAYS_WINDOW = 7;

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

/** «همین حالا / N ساعت پیش / N روز پیش / هرگز» — ارقامِ فارسیِ خودجا */
const faDigits = (n: number): string =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export function lastActiveFa(iso: string | null, now: number = Date.now()): string {
  if (!iso) return "هرگز";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "هرگز";
  const age = Math.max(0, now - t);
  if (age < 3600_000) return "همین حالا";
  if (age < 86_400_000) return `${faDigits(Math.floor(age / 3600_000))} ساعت پیش`;
  return `${faDigits(Math.floor(age / 86_400_000))} روز پیش`;
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
