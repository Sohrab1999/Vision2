// ------------------------------------------------------------------
// r354 — «کارنامهٔ یادگیرنده» — هفتمین عضوِ خانوادهٔ CSV
// (۱۶۹/۱۷۸/۱۸۰/۳۵۱ و روزنامهٔ کلاسِ r352). خروجی از خودِ دیالوگِ
// جزئیاتِ r353 — پیشنهادِ ②ِ همان راند: «داده هست، فقط نما کم است».
//
// [درسِ مهندسیِ راند — قراردادِ خانواده گویش است، نه شکلِ واحد]:
// شش عضوِ پیشین همه جدولِ تخت بودند چون مصرفشان «فیلتر در اکسل» بود
// (هر سطر = یک رکوردِ هم‌نوع). کارنامهٔ تک‌یادگیرنده پنج بلوکِ
// ناهم‌نوع دارد (خلاصه/روندِ ۱۴روزه/پوششِ درسها/مهارتها/آخرین
// تلاشها). فشردنِ همه در یک جدولِ تخت یعنی ستونِ «تلاشها» گاهی
// شمارندهٔ روز باشد و گاهی شمارندهٔ مهارت — جمعِ اکسل دروغ میگوید.
// پس شکلِ این عضو «گزارشکارتِ چندبخشی» است: هر بخشِ سرِ خود
// tidy (عنوان + سرستون + سطرها) و بخشها با سطرِ خالی جدا؛ گویشِ
// خانواده اما بایت‌به‌بایت محفوظ میماند:
//   · BOM صریح + CRLF (RFC 4180)
//   · اعدادِ ASCII — اکسل بتواند جمع بگیرد
//   · csvSafe برایِ هر رشتهٔ ورودیِ کاربر (نام!) — ویرگول/نقل‌قول/
//     شکستِ خط بیرونکشی میشود
//   · سلولِ خالی = «ناموجود» صادق (میانگینِ بیتلاش)، نه صفرِ ساختگی
//   · تاریخها ISOِ پایدار — برچسبِ «۳ ساعت پیش» در فایل کهنه میشود
//   · برچسبِ مهارت از تکحقیقتِ coverage-map؛ کلیدِ ناشناخته = خودش
//     (صداقتِ pulseLabel)
// حریم: فقط همان داده‌ای که دیالوگ نشان میدهد — نه userId و نه
// secret و نه پاسخِ خام (قفلِ r352 دستنخورده).
// ------------------------------------------------------------------

import { CSV_BOM, csvSafe } from "./teacher-csv";
import { activeWeekMeta, activeWeekRows } from "./active-week";
import { COVERAGE_SKILLS } from "./coverage-map";
import type { LearnerDetail, LearnerSkillRow } from "./teacher-report";

/** CRLF per RFC 4180 — same family dialect as all six elders */
const NL = "\r\n";

export const LEARNER_CARD_TITLE = "ویژن ۲ — کارنامهٔ یادگیرنده";

export const LEARNER_SUMMARY_COLUMNS = [
  "نام",
  "رنگ",
  "عضویت",
  "تلاش",
  "میانگین",
  "بهترین",
  "درسها",
  "آخرین فعالیت",
] as const;

const TREND_TITLE_OF = (n: number): string => `روندِ ${n} روز`; // از خودِ داده مشتق — با پنجره منحرف نمیشود
const TREND_COLUMNS = ["روز", "تلاشها"] as const;

const LESSONS_TITLE = "پوششِ درسها";
const LESSONS_COLUMNS = ["درس", "تلاشها", "میانگین"] as const;

const SKILLS_TITLE = "مهارتها — ضعیفترینِ اول";
const SKILLS_COLUMNS = ["مهارت", "تلاشها", "میانگین", "بهترین"] as const;

const RECENT_TITLE = "آخرین تلاشها";
const RECENT_COLUMNS = ["تاریخ", "مهارت", "درس", "درصد"] as const;

/** برچسبِ فارسیِ مهارت از تکحقیقتِ رجیستریِ پوشش؛ ناشناخته = کلیدِ خام */
export function learnerSkillLabel(key: string): string {
  return COVERAGE_SKILLS.find((s) => s.key === key)?.label ?? key;
}

// ------------------------------------------------------------------
// r365 — «ضعیفترینِ مهارت» — متای سربرگِ کارنامه (همزادِ CSVِ نخستین
// ردیفِ «مهارتها — ضعیفترینِ اول» که دیالوگ از r353 نشان میدهد).
// قطعیت با قاعدهٔ خودِ سرور (pickWeakestِ teacher-report): کمترینِ
// میانگین، تساوی ⇒ نامِ صعودی — قفلِ تستیِ همخوانیِ دو موتور در tests.
// صداقتها:
//   · bySkillِ تهی/غایب ⇒ null — بی‌مهارت، «ضعیفترین» هم وجود ندارد؛
//     جعل ممنوع (همان روحِ «هفتهٔ خالی بیپرکارترین»)
//   · ردیفِ بدنام (تلاشِ صفر/غیرعددی/منفی، میانگینِ غیرعددی/منفی، دستهٔ
//     تهی) از نامزدی حذف میشود — میانگینِ بیتلاش میانگین نیست؛
//     شمارندهها هرگز دروغ نمیگویند؛ همهِ بدنام ⇒ null
//   · میانگینِ صفر واقعی است — چاپ میشود، نه پنهان
//   · هر سطح به گویشِ خودش: متا کلیدِ خام را برمیگرداند؛ CSV با
//     learnerSkillLabel و ASCII، دیالوگ با skillLabel/faNumِ خودش
// ------------------------------------------------------------------
export interface WeakestSkillMeta {
  category: string;
  attempts: number;
  avgPercent: number;
}

export function weakestSkillMeta(skills: LearnerSkillRow[] | undefined | null): WeakestSkillMeta | null {
  if (!Array.isArray(skills)) return null;
  const sane = skills.filter(
    (s) =>
      s &&
      typeof s === "object" &&
      typeof s.category === "string" &&
      s.category.length > 0 &&
      typeof s.attempts === "number" &&
      Number.isFinite(s.attempts) &&
      s.attempts >= 1 &&
      typeof s.avgPercent === "number" &&
      Number.isFinite(s.avgPercent) &&
      s.avgPercent >= 0
  );
  if (sane.length === 0) return null;
  const sorted = [...sane].sort(
    (a, b) => a.avgPercent - b.avgPercent || a.category.localeCompare(b.category)
  );
  const w = sorted[0];
  return { category: w.category, attempts: w.attempts, avgPercent: Math.round(w.avgPercent) };
}

/** سطرِ سربرگِ کارنامه — متنِ نهایی با گویشِ CSV (ASCII، برچسبِ رجیستری) */
export function weakestSkillRow(skills: LearnerSkillRow[] | undefined | null): string | null {
  const m = weakestSkillMeta(skills);
  if (!m) return null;
  return `ضعیفترینِ مهارت,${csvSafe(learnerSkillLabel(m.category))} · میانگین ${m.avgPercent}٪ در ${m.attempts} تلاش`;
}

/** نامِ فایل: اسلاگِ سالمِ نام (بدونِ مسیر/فاصله) + روز؛ بی‌نام = learner */
export function learnerFileName(name: string, today: string): string {
  const slug = csvSafe(name)
    .replace(/[/\\]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return `vision2-learner-${slug || "learner"}-${today}.csv`;
}

export function buildLearnerCardCsv(d: LearnerDetail): string {
  const lines: string[] = [];

  // -- کارتِ خلاصه (یک سطر) --
  lines.push(LEARNER_CARD_TITLE);
  lines.push(LEARNER_SUMMARY_COLUMNS.join(","));
  lines.push(
    [
      csvSafe(d.name),
      csvSafe(d.color),
      d.joinedAt.slice(0, 10),
      String(d.attempts),
      d.avgPercent === null ? "" : String(d.avgPercent),
      d.bestPercent === null ? "" : String(d.bestPercent),
      String(d.lessons),
      d.lastActive ?? "",
    ].join(",")
  );

  // -- r363 — «هفتهٔ فعال» سربرگِ کارنامه — همزبانِ دفترِ r362 --
  // از خودِ byDayِ همین کارنامه میخواند (پنجرهٔ ۱۴روزه — طول از خودِ
  // داده مشتق میشود نه عددِ دستی)؛ موتورِ مشترکِ active-week —
  // هیچ محاسبهٔ موازیای. هفتهٔ خالی = صفرِ واقعی با شاهد، بیپرکارترین؛
  // ورودیِ زباله ⇒ غیبتِ صادق — هیچ سطری.
  const week = activeWeekMeta(d.byDay);
  if (week) {
    for (const row of activeWeekRows(week)) lines.push(row);
  }

  // -- r365 — «ضعیفترینِ مهارت» — همزادِ CSVِ نخستینِ ردیفِ بخشِ مهارتها --
  // گیتِ مستقلِ خودش (از bySkill) — بیتلاش/بدمهارت ⇒ هیچ سطری (صداقت).
  // جایگاه: کنارِ «پرکارترینِ روز» در ناحیهٔ متای سربرگ — حجم و کیفیت،
  // دو بینشِ یکجا پیش از جداکنندهٔ روند.
  const weakest = weakestSkillRow(d.bySkill);
  if (weakest) lines.push(weakest);

  // -- روندِ ۱۴روزه (صفرهایِ واقعی) — عنوان از طولِ خودِ پنجره --
  lines.push("");
  lines.push(TREND_TITLE_OF(d.byDay.length));
  lines.push(TREND_COLUMNS.join(","));
  for (const day of d.byDay) lines.push(`${day.day},${String(day.attempts)}`);

  // -- پوششِ درسها (۱..۱۲ + خارجیِ دفاعی؛ درسِ لمسنشده = خالیِ صادق) --
  lines.push("");
  lines.push(LESSONS_TITLE);
  lines.push(LESSONS_COLUMNS.join(","));
  for (const l of d.byLesson)
    lines.push(
      [String(l.lesson), String(l.attempts), l.avgPercent === null ? "" : String(l.avgPercent)].join(",")
    );

  // -- مهارتها (ضعیفترینِ اول) — بی‌تلاش: فقط عنوان و سرستون (صادق) --
  lines.push("");
  lines.push(SKILLS_TITLE);
  lines.push(SKILLS_COLUMNS.join(","));
  for (const s of d.bySkill)
    lines.push(
      [
        csvSafe(learnerSkillLabel(s.category)),
        String(s.attempts),
        String(s.avgPercent),
        String(s.bestPercent),
      ].join(",")
    );

  // -- آخرین تلاشها (حداکثر ۶) --
  lines.push("");
  lines.push(RECENT_TITLE);
  lines.push(RECENT_COLUMNS.join(","));
  for (const r of d.recent)
    lines.push(
      [r.createdAt, csvSafe(learnerSkillLabel(r.category)), String(r.lesson), String(r.percent)].join(",")
    );

  return lines.join(NL) + NL;
}

export function downloadLearnerCardCsv(detail: LearnerDetail, today: string): boolean {
  if (typeof document === "undefined") return false; // SSR guard
  try {
    const csv = CSV_BOM + buildLearnerCardCsv(detail);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = learnerFileName(detail.name, today);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
