"use client";

// ------------------------------------------------------------------
// راند ۲۵۳ — دیالوگِ مشترکِ «کاربرد در جزوه»
//
// تا r252 دیالوگِ جای‌هایِ واژه فقط در دیکشنری زندگی می‌کرد؛ راند ۲۵۳
// خانواده را گسترش می‌دهد (تبِ واژگانِ درس + پشتِ فلش‌کارت) و دیالوگ
// به یک تک‌منبع مشترک می‌رود تا هر سه مصرف‌کننده یک زبان حرف بزنند —
// همان ایدئومِ «فهرستِ زنده»: markup و testidها عینِ r252 می‌مانند
// (usage-dialog / usage-site / markهایِ amberِ ریمپ‌شدهٔ kernel) تا
// گاردهایِ r252 بی‌تغییر بمانند و مصرف‌کنندهٔ نو هم رایگان وارد شود.
//
// مصرف‌کننده‌ها: dictionary-view (از r252) · vocab-tab · flashcards (r253)
// ------------------------------------------------------------------

import { BookOpenText } from "lucide-react";
import { useState } from "react";
import { faNum } from "@/lib/study-theme";
import { highlightParts, type WordUsageSite } from "@/lib/word-usage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface WordUsageTarget {
  en: string;
  sites: WordUsageSite[];
}

type KindFilter = "conversation" | "reading" | null;

/** فهرستِ فارسیِ درس‌هایِ صدرنشین — ۱: «درسِ ۵» · ۲: «درس‌هایِ ۵ و ۹» ·
 *  ۳+: «درس‌هایِ ۵، ۹ و ۱۲» — تساویِ امن: همهٔ هم-بیشینه‌ها نامیده می‌شوند
 *  (پیش‌شمارشِ r264: ۲۳۱ واژهٔ نواریِ پیکره صدرنشینِ مساوی دارد — نامیدنِ
 *  تک‌درسه‌ای دروغ می‌شد). */
function leadersFa(ls: number[]): string {
  const ids = ls.map((l) => faNum(l));
  if (ls.length === 1) return `درسِ ${ids[0]}`;
  return `درس‌هایِ ${ids.slice(0, -1).join("، ")} و ${ids[ids.length - 1]}`;
}

export default function WordUsageDialog(props: {
  target: WordUsageTarget | null;
  onClose: () => void;
  // r263 ① — بندِ ① پیشنهادِ ۲۶۲: پیوندِ دوسویه — وقتی میزبان می‌دهد، چیپ‌های
  // درسِ نوارِ پراکندگی دکمه می‌شوند و کلیکشان همان درس را به میزبان
  // برمی‌گرداند (دیکشنری: فیلترِ همان درس + لنزِ آسمانی + بستنِ دیالوگ —
  // همان مسیرِ کلیکِ سطرِ مقایسهٔ r258). میزبانِ بی-هندلر (تبِ واژگان،
  // فلش‌کارت، واژهٔ روز، جدولِ خانواده، داورِ خطر) چیپِ spanِ اطلاعاتیِ r262
  // را می‌گیرد — الگویِ host-decidesِ relatedLesson/onOpenLessonِ r259.
  onOpenLesson?: (lessonId: number) => void;
}) {
  // r264 — کلیدِ واژه: تعویضِ هدف، لنزِ نوع را از نو می‌کند — لنزِ یک واژه
  // نباید به واژهٔ بعدی نشت کند (stateِ درونِ بدنه با key ری‌مونت می‌شود).
  return <WordUsageDialogBody key={props.target?.en ?? "none"} {...props} />;
}

function WordUsageDialogBody({
  target,
  onClose,
  onOpenLesson,
}: {
  target: WordUsageTarget | null;
  onClose: () => void;
  onOpenLesson?: (lessonId: number) => void;
}) {
  // r264 ① — بندِ ① پیشنهادِ ۲۶۳: لنزِ نوع در-جایِ دیالوگ — چیپ‌هایِ
  // «مکالمه/ریدینگ» دکمه‌هایِ دوسطحیِ aria-pressed می‌شوند (الگویِ
  // togglingِ r259): کلیک، فهرستِ سایت‌ها را درجا فیلتر می‌کند — ساده و
  // بی-ناوبری، برخلافِ چیپِ درس که به میزبان سفر می‌کند. کلیکِ دوباره =
  // بازگشت؛ کلیکِ نوعِ دیگر = تعویضِ متقابل (الگویِ زوجِ r257).
  const [kindFilter, setKindFilter] = useState<KindFilter>(null);

  // راند ۲۶۲ — بندِ ② پیشنهادِ ۲۶۱: پراکندگیِ درس‌ها — وقتی واژه در ≥۲ درس
  // زندگی می‌کند، یک نوارِ فشرده زیرِ تیتر نشان می‌دهد هر درس چند کاربرد دارد
  // (پیش‌شمارشِ r262: change = ۱۳ کاربرد در ۶ درس با صدرنشینِ درسِ ۵؛
  // ability = ۱ کاربرد در ۱ درس → نوار مخفی — صداقتِ r252). مرتب‌سازی:
  // شمارشِ نزولی سپس شناسهٔ درسِ صعودی — قطعی؛ صدرنشین = هر سطرِ هم‌شمارِ
  // بیشینه (ایدئومِ تساویِ امنِ r258/259). r264: زیرِ لنزِ نوع، همان توزیع
  // از سایت‌هایِ هم-لنز بازمحاسبه می‌شود — چیپ‌ها همیشه توزیعِ «لنزِ جاری»
  // را توصیف می‌کنند، نه عکسِ کهنه.
  const visibleSites = kindFilter
    ? (target?.sites ?? []).filter((s) => s.kind === kindFilter)
    : target?.sites ?? [];
  const lessonCounts = (() => {
    const m = new Map<number, number>();
    visibleSites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  })();
  const maxLessonCount = lessonCounts[0]?.[1] ?? 0;
  const leaderLessons = lessonCounts
    .filter(([, c]) => c === maxLessonCount)
    .map(([l]) => l);
  // r265 ① — بندِ ① پیشنهادِ ۲۶۴: شمارِ هم-بیشینه‌ها در tooltipِ خودِ
  // شمارندهٔ صدرنشین — متنِ مرئی نامشان را می‌گوید، tooltip حالا «چندتا» را
  // هم می‌گوید: زیرِ تساوی «اینجا K درسِ هم-بیشینه‌اند: ...» و بی-تساوی
  // «اینجا صدرنشینِ یگانه است: ...» — از همان leaderLessonsِ تک‌منبعِ لنزِ
  // جاری، هرگز رشتهٔ منجمد (پیش‌شمارشِ r265: از ۵۴۹ نوارِ بازِ پیکره ۳۱۸
  // یگانه و ۲۳۱ مساوی‌اند — هر دو حالت زنده‌اند و باید صادق بمانند؛
  // بیشینهٔ تساوی ۱۰ هم-بیشینه). عبارتِ آموزشیِ «همهٔ درس‌هایِ هم-بیشینه
  // نامیده می‌شوند» قفلِ r264 دست‌نخورده می‌ماند — افزوده می‌شود نه جایگزین.
  // r266 ② — بندِ ② پیشنهادِ ۲۶۵: صداقتِ توزیعِ یکنواخت — وقتی «همهٔ» درس‌هایِ
  // توزیعِ جاری هم-بیشینه‌اند (leaderLessons.length === lessonCounts.length)،
  // پسوندِ «توزیعِ یکنواخت (همهٔ درس‌ها هم‌شمارند)» افزوده می‌شود — زیرِ لنز هم
  // دامنه‌اش همان توزیعِ لنز است، نه کلِ واژه. افزودنِ نه جایگزینی — قفل‌هایِ
  // r264/265 سبز می‌مانند (پیش‌شمارشِ r266: از ۵۴۹ نوارِ باز ۱۷۳ یکنواخت‌اند —
  // مثلِ لنزِ مکالمهٔ change و واژهٔ conversation با ۱۰ درسِ هم‌شمار؛ ۵۸ تساویِ
  // جزئی دارند مثلِ interest — برایشان «یکنواخت» دروغ می‌شد).
  const leaderTieNote =
    leaderLessons.length > 1
      ? `اینجا ${faNum(leaderLessons.length)} درسِ هم-بیشینه‌اند: ${leadersFa(leaderLessons)}` +
        (leaderLessons.length === lessonCounts.length
          ? " — توزیعِ یکنواخت (همهٔ درس‌ها هم‌شمارند)"
          : "")
      : leaderLessons.length === 1
        ? `اینجا صدرنشینِ یگانه است: ${leadersFa(leaderLessons)}`
        : "";
  // r263 ③ — تفکیکِ نوع (مکالمه/ریدینگ) در همان نوار — فقط وقتی هر دو نوع
  // موجودند (تک-نوع چیزی فراتر از چیپِ نوعِ خودِ کارت‌ها نمی‌گوید — صداقتِ
  // r252؛ پیش‌شمارشِ r263: change = ریدینگِ ۱۱ + مکالمهٔ ۲ · communication و
  // ability تک-نوع). ترتیبِ ثابتِ مکالمه سپس ریدینگ — همان ترتیبِ canonicalِ
  // badgeهایِ نوعِ خودِ سایت‌ها؛ ایدئومِ آسمانیِ خانواده (border-sky-200/
  // bg-sky-50/text-sky-700 — صفرِ قانونِ CSSِ نو). شمارش از «همهٔ» سایت‌ها —
  // کنترلِ لنز ثابت می‌ماند (چیپِ نوع، کلِ واژه را توصیف می‌کند).
  const kindCounts = (() => {
    const m = new Map<string, number>();
    target?.sites.forEach((s) => m.set(s.kind, (m.get(s.kind) ?? 0) + 1));
    return [
      { kind: "conversation", label: "مکالمه", count: m.get("conversation") ?? 0 },
      { kind: "reading", label: "ریدینگ", count: m.get("reading") ?? 0 },
    ].filter((k) => k.count > 0);
  })();
  const kindsBoth = kindCounts.length === 2;
  // r264 ② — بندِ ② پیشنهادِ ۲۶۳: شمارندهٔ «N از M» رویِ عنوانِ نوار —
  // صدرنشینِ توزیعِ جاری: «۵ از ۱۳ کاربرد در درسِ ۵»؛ زیرِ لنز با ذکرِ نوع:
  // «۴ از ۱۱ کاربردِ ریدینگ در درسِ ۵». همیشه از دادهٔ زنده، هرگز رشتهٔ
  // منجمد (قانونِ صادقیتِ r259)؛ برچسبِ نوع از همان kindCounts تک‌منبع.
  const activeKindLabel = kindCounts.find((k) => k.kind === kindFilter)?.label ?? "";
  const targetEn = target?.en ?? "";
  const leaderStat =
    `${faNum(maxLessonCount)} از ${faNum(visibleSites.length)} کاربرد` +
    (kindFilter && activeKindLabel ? `ِ ${activeKindLabel}` : "") +
    ` در ${leadersFa(leaderLessons)}`;
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby={undefined} className="max-h-[88vh] max-w-xl overflow-y-auto nice-scroll" data-testid="usage-dialog">
        <DialogHeader className="text-right">
          <DialogTitle className="flex flex-wrap items-baseline gap-2 text-base">
            <BookOpenText size={16} className="shrink-0 self-center text-sky-600" aria-hidden />
            <span dir="ltr" className="en-text">{target?.en}</span>
            <span className="text-[12px] font-bold text-stone-500">
              در جزوه · {target ? faNum(target.sites.length) : ""} کاربرد
            </span>
          </DialogTitle>
        </DialogHeader>
        {(lessonCounts.length >= 2 || kindFilter) && (
          <div
            data-testid="usage-lessons-bar"
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 dark:border-stone-700 dark:bg-stone-800/60"
          >
            <span className="text-[10.5px] font-black text-stone-500">
              {kindFilter ? `پراکندگیِ ${activeKindLabel}` : "پراکندگیِ درس‌ها"}:
            </span>
            <span
              data-testid="usage-lessons-leader"
              title={
                (kindFilter
                  ? `صدرنشینِ ${activeKindLabel} — همهٔ درس‌هایِ هم-بیشینه نامیده می‌شوند`
                  : "صدرنشینِ توزیعِ درس‌ها — همهٔ درس‌هایِ هم-بیشینه نامیده می‌شوند") +
                (leaderTieNote ? ` · ${leaderTieNote}` : "") +
                ` · ${faNum(maxLessonCount)} از ${faNum(visibleSites.length)}`
              }
              className="text-[10.5px] font-bold text-stone-500"
            >
              {leaderStat}
            </span>
            {lessonCounts.map(([lessonId, count]) => {
              const leading = count === maxLessonCount;
              // r263 ① — الگویِ host-decides: با هندلر، دکمهٔ واقعی با نامِ
              // دسترس‌پذیریِ صریح (هرگز «کاربرددار» یا «جزوه»ی برهنه — فضای
              // نامِ a11yِ r253)؛ بی-هندلر، spanِ اطلاعاتیِ r262 دست‌نخورده.
              // r264: زیرِ لنزِ نوع، شمارش و وعدهٔ چیپ هم-لنز می‌شود —
              // «۳ کاربردِ ریدینگِ این واژه در آن»، نه شمارشِ کهنهٔ همه-نوعه.
              const cls = leading
                ? "inline-flex items-center rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-black text-white"
                : "inline-flex items-center rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black text-violet-700";
              const countNote = kindFilter
                ? `${faNum(count)} کاربردِ ${activeKindLabel}ِ این واژه در آن`
                : `${faNum(count)} کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن`;
              const leadTitle = leading
                ? kindFilter
                  ? `بیشترینِ کاربردهایِ ${activeKindLabel} در درسِ ${faNum(lessonId)} است — `
                  : `بیشترینِ کاربردهایِ این واژه در درسِ ${faNum(lessonId)} است — `
                : "";
              if (onOpenLesson) {
                return (
                  <button
                    key={lessonId}
                    type="button"
                    data-testid={`usage-lesson-chip-${lessonId}`}
                    title={leadTitle + `کلیک: واژه‌هایِ در-متنِ درسِ ${faNum(lessonId)}`}
                    aria-label={`رفتن به واژه‌هایِ درسِ ${faNum(lessonId)} — ${countNote}`}
                    onClick={() => onOpenLesson(lessonId)}
                    className={cls}
                  >
                    درس {faNum(lessonId)} · {faNum(count)}
                  </button>
                );
              }
              return (
                <span
                  key={lessonId}
                  data-testid={`usage-lesson-chip-${lessonId}`}
                  title={
                    leading
                      ? kindFilter
                        ? `بیشترینِ کاربردهایِ ${activeKindLabel} در درسِ ${faNum(lessonId)} است`
                        : `بیشترینِ کاربردهایِ این واژه در درسِ ${faNum(lessonId)} است`
                      : undefined
                  }
                  className={cls}
                >
                  درس {faNum(lessonId)} · {faNum(count)}
                </span>
              );
            })}
            {kindsBoth && (
              <>
                <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-stone-300 dark:bg-stone-600" />
                {kindCounts.map((k) => {
                  const active = kindFilter === k.kind;
                  // r264 ① — دکمهٔ دوسطحی: فعال = پرِ آسمانیِ bg-sky-600
                  // (آینهٔ بنفشِ پرِ صدرنشین)؛ نامش هرگز «کاربرددار» یا
                  // «جزوه»ی برهنه نمی‌گیرد (فضای نامِ a11yِ r253) — وعدهٔ
                  // aria همان رفتار است: فیلترِ درجا و بازگشتِ کامل.
                  return (
                    <button
                      key={k.kind}
                      type="button"
                      data-testid={`usage-kind-chip-${k.kind}`}
                      aria-pressed={active}
                      title={
                        active
                          ? "کلیک: بازگشت به همهٔ کاربردها"
                          : `کلیک: فقط کاربردهایِ ${k.label} در همین دیالوگ`
                      }
                      aria-label={
                        active
                          ? "کلیک: بازگشت به همهٔ کاربردها"
                          : `کلیک: فقط کاربردهایِ ${k.label}`
                      }
                      onClick={() => setKindFilter(active ? null : (k.kind as KindFilter))}
                      className={
                        active
                          ? "inline-flex items-center rounded-md border border-sky-600 bg-sky-600 px-1.5 py-0.5 text-[10px] font-black text-white"
                          : "inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-black text-sky-700"
                      }
                    >
                      {k.label} {faNum(k.count)}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
        <ul className="space-y-2">
          {visibleSites.slice(0, 8).map((s, i) => (
            <li
              key={`${s.lessonId}-${s.kind}-${i}`}
              data-testid="usage-site"
              className="c-card rounded-lg border border-stone-200 p-2.5"
            >
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-black text-sky-700">
                  {s.kind === "conversation" ? "مکالمه" : "ریدینگ"}
                </span>
                <span className="text-[10.5px] font-bold text-stone-500">{s.titleFa}</span>
              </div>
              <p className="en-text text-[12.5px] font-bold leading-5 text-stone-700" dir="ltr">
                {highlightParts(s.en, targetEn).map((part, j) =>
                  part.hit ? (
                    <mark key={j} className="rounded-sm bg-amber-50 px-0.5 font-extrabold text-amber-800 underline decoration-amber-800/40 underline-offset-2">{part.text}</mark>
                  ) : (
                    <span key={j}>{part.text}</span>
                  )
                )}
              </p>
              <p className="mt-1 text-[11.5px] font-bold leading-5 text-stone-500">{s.fa}</p>
            </li>
          ))}
        </ul>
        {target && visibleSites.length > 8 && (
          <p className="text-[11px] font-bold text-stone-500" data-testid="usage-more">
            + {faNum(visibleSites.length - 8)} موردِ دیگر در جزوه
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
