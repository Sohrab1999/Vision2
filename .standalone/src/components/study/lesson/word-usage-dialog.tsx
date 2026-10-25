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
import { useEffect, useRef, useState } from "react";
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

  // r268 ① — بندِ نوِ این راند: گشایندهٔ «+ N موردِ دیگر» — تا r26۷ این خط
  // فقط متنِ مرده بود و کاربردهایِ نهم به بعد «هیچ‌راه» بودند (پیش‌شمارشِ
  // r268: از ۲۶۴۰ واژه، ۱۵۳ واژه بیش از ۸ سایت دارند — بیشینه «of» با ۹۱
  // سایت و ۸۳ پنهان!). حالا دکمه‌ای دوسطحی است (ایدئومِ togglingِ r259):
  // aria-expanded صداقتِ وضعیت را می‌گوید و بازگشتِ کاملِ r260 را دارد.
  // نامِ دسترس‌پذیر از خودِ متنِ مرئی می‌آید (بدونِ aria-label — WCAG 2.5.3
  // خودکار)، tooltip رفتار را می‌آموزد و شمارش‌ها از visibleSites.length
  // تک‌منبعِ r264 می‌آیند — هرگز رشتهٔ منجمد. remount با keyِ واژه
  // (r264) showAll را هم از نو می‌کند — لنزِ یک واژه به واژهٔ بعدی
  // نشت نمی‌کند.
  const [showAll, setShowAll] = useState(false);

  // r269 ② — بازگشتِ اسکرولِ صادقانه: فروپاشیِ گشاینده و تعویضِ لنز هر دو
  // «درجا»اند — و دیدِ طراحیِ هر دو از بالایِ فهرست است (تیتر + نوار + آغازِ
  // کارت‌ها). فروپاشی از دیوارِ ۹۱ کارتیِ «of» کاربر را نیمه‌راه رها می‌کرد
  // و تعویضِ لنز او را تهِ فهرستِ کوتاه‌شده می‌گذاشت. پس scrollTop به صفر
  // برمی‌گردد — ایدئومِ «بازگشتِ کاملِ» r260 حالا اسکرول را هم در بر
  // می‌گیرد. گشودن هرگز نمی‌کشد (لیست به پایین می‌روید، جایِ کاربر محفوظ
  // است) و mount هم نه (prevها آگاهانه از خودِ stateهایِ اولیه آغاز
  // می‌شوند). ref رویِ ul + closest به ظرفِ اسکرول — بدونِ پرس‌وجویِ
  // سراسری؛ scrollTop (نه scrollTo) — همه‌جا پشتیبانی می‌شود و در jsdom
  // بی-خطر است.
  const listRef = useRef<HTMLUListElement>(null);
  const prevShowAll = useRef(showAll);
  const prevKind = useRef<KindFilter>(null);
  useEffect(() => {
    const collapsed = prevShowAll.current && !showAll;
    const lensChanged = prevKind.current !== kindFilter;
    prevShowAll.current = showAll;
    prevKind.current = kindFilter;
    if (collapsed || lensChanged) {
      const scroller = listRef.current?.closest('[data-testid="usage-dialog"]');
      if (scroller) scroller.scrollTop = 0;
    }
  }, [showAll, kindFilter]);

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
            {/* r271 ② — مقیاسِ هم-لنزِ تیتر: زیرِ لنز، تیتر تنها عنصرِ بی-مقیاسِ
                دیالوگ بود — فهرست ۷۱ کارت می‌داد و تیتر می‌گفت ۹۱. حالا مثلِ
                چیپ‌هایِ r267 خودش مخرج می‌گیرد: «در جزوه · ۷۱ کاربردِ ریدینگ از ۹۱»
                — از تک‌منبع‌هایِ visibleSites.length و target.sites.length.
                شاخهٔ بی-لنز بایت‌به‌بایتِ قبلی است (قفلِ «در جزوه · ۶ کاربرد»ی
                r255 و دوقلوهایش در هر ۴ میزبان سبز می‌مانند). */}
            <span className="text-[12px] font-bold text-stone-500">
              {kindFilter && activeKindLabel && target
                ? `در جزوه · ${faNum(visibleSites.length)} کاربردِ ${activeKindLabel} از ${faNum(target.sites.length)}`
                : `در جزوه · ${target ? faNum(target.sites.length) : ""} کاربرد`}
            </span>
          </DialogTitle>
        </DialogHeader>
        {/* r269 ① — نوارِ چسبان: در دیوارِ بلندِ گشاینده («of» با ۹۱ کارت)،
            کنترل‌هایِ لنز و شمارندهٔ صدرنشین نباید با اسکرول گم شوند. نکتهٔ
            چیدمان: DialogContent یک grid است و در grid، محدودهٔ سفرِ sticky
            همان grid-areaِ خودِ آیتم است (به بلندیِ خودش → سفرِ صفر) — پس
            نوار و فهرست در یک wrapperِ بلند زندگی می‌کنند تا نوار کلِ
            wrapper را سفر کند. بدونِ z-10: نوارِ positioned بالایِ کارت‌هایِ
            غیر-positioned می‌نشیند و دکمهٔ بستنِ absolute (بعد در DOM)
            بالایِ نوار می‌ماند — هیچ z جعلی‌ای لازم نیست. bgِ opaque: در
            dark حالتِ نیمه‌شفافِ /60 کارت‌هایِ ردشده را نشان می‌داد.
            r270 ① — بارِ فشردهٔ موبایل: در ۳۹۰px چیپ‌ها به ۴ ردیف پیچیده
            و نوار ۱۶۱px می‌شد — یک‌پنجمِ ویوپورت فقط برایِ کنترل‌ها. زیرِ
            sm یک ردیفِ افقیِ سوایپ‌شدنی می‌گیرد (flex-nowrap + overflow-x)
            با scrollbar-none — چیپِ بریده در لبه خودِ نشانهٔ سوایپ است؛
            کاربرِ کیبورد هم با tab داخلِ چیپ‌ها به همه می‌رسد (فوکوس
            خودکارِ offscreen را scroll می‌کند). دسکتاپ دست‌نخورده: wrap
            برایِ ≥sm می‌ماند — جفتِ واکنش‌گرا در همان className. */}
        {/* min-w-0 (r270): بدونِ آن، min-contentِ نوارِ nowrap از wrapperِ
            overflow-visible به trackِ gridِ دیالوگ نشت می‌کند و track به
            ۴۸۰px می‌رو — wrapper اجازهٔ انقباض می‌خواهد تا نوارِ افقی
            درونِ همان ۳۹۰px اسکرول شود. در انتها — قطعهٔ قفل‌شدهٔ r269
            پیوسته می‌ماند. */}
        <div className="flex flex-col gap-4 min-w-0">
            {/* r271 ① — سرفِ لنز در ردیفِ موبایل: در ردیفِ تک-ردیفیِ r270،
                چیپ‌هایِ لنز — تنها کنترل‌هایِ واقعیِ نوار — تهِ ۹۷۸px بودند و
                نخستین تعویضِ لنز یک سوایپِ کامل می‌خواست. orderهایِ واکنش‌گرا
                (فقط max-sm) کنترل‌ها را به سرِ ردیف می‌آورند: لنز (۱) ← چیپ‌هایِ
                درس (۲) ← برچسب و رهبر (۳ — اطلاعاتی‌اند، چیپ‌ها خودشان همان
                داده را در «درس ۵ · ۵ از ۱۳» می‌گویند). DOM و ترتیبِ tab و
                همهٔ testidها دست‌نخورده — فقط ترتیبِ بصریِ فلکس در موبایل؛
                جداکنندهٔ تزئینیِ بینِ دو گروه در موبایل پنهان می‌شود —
                معنایش را گم می‌کند. دسکتاپ wrap: همهٔ orderها خاموش. */}
        {(lessonCounts.length >= 2 || kindFilter) && (
          <div
            data-testid="usage-lessons-bar"
            className="sticky top-0 flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 dark:border-stone-700 dark:bg-stone-800 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:scrollbar-none"
          >
            <span className="shrink-0 whitespace-nowrap max-sm:order-3 text-[10.5px] font-black text-stone-500">
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
              className="shrink-0 whitespace-nowrap max-sm:order-3 text-[10.5px] font-bold text-stone-500"
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
              // r267 ① — بندِ ① پیشنهادِ ۲۶۶: مقیاسِ دوتاییِ چیپ‌ها — هر چیپ
              // حالا خودکفاست: «درس ۵ · ۵ از ۱۳» (زیرِ لنز: «· ۴ از ۱۱») —
              // مخرج = اندازهٔ همان توزیعِ جاری (visibleSites.length — تک‌منبعِ
              // r264؛ زیرِ لنز مخرجِ هم-لنز). وعدهٔ aria هم همان مقیاس می‌گیرد
              // (دو-و-نیمِ WCAG: نامِ دسترس‌پذیری متنِ مرئی را در بر دارد) —
              // دنبالهٔ وعدهٔ r263 («کاربردِ این واژه در ...») پیوسته می‌ماند
              // و قفل‌هایِ منبعِ r263/264 سبز می‌مانند؛ فقط دو toBeِ دقیقِ
              // r264 با مخرج به‌روز شدند.
              const countNote = kindFilter
                ? `${faNum(count)} از ${faNum(visibleSites.length)} کاربردِ ${activeKindLabel}ِ این واژه در آن`
                : `${faNum(count)} از ${faNum(visibleSites.length)} کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن`;
              const cls = leading
                ? "inline-flex items-center shrink-0 whitespace-nowrap max-sm:order-2 rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-black text-white"
                : "inline-flex items-center shrink-0 whitespace-nowrap max-sm:order-2 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black text-violet-700";
              const chipLabel = `درس ${faNum(lessonId)} · ${faNum(count)} از ${faNum(visibleSites.length)}`;
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
                    {chipLabel}
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
                  {chipLabel}
                </span>
              );
            })}
            {kindsBoth && (
              <>
                <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-stone-300 dark:bg-stone-600 max-sm:hidden" />
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
                          ? "inline-flex items-center shrink-0 whitespace-nowrap max-sm:order-1 rounded-md border border-sky-600 bg-sky-600 px-1.5 py-0.5 text-[10px] font-black text-white"
                          : "inline-flex items-center shrink-0 whitespace-nowrap max-sm:order-1 rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-black text-sky-700"
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
        <ul ref={listRef} className="space-y-2">
          {(showAll ? visibleSites : visibleSites.slice(0, 8)).map((s, i) => (
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
                {/* r268 ② — نشانِ درسِ هر کارت — از s.lessonId تک‌منبع: titleFa
                    درس را در نثر می‌گوید («مکالمهٔ درس ۱ — ...» یا «... — درس ۱»)
                    ولی برای چشمِ جوینده گم است؛ چیپِ خنثایِ سنگی آن را در یک
                    نگاه می‌دهد و با چیپ‌هایِ نوارِ پراکندگی یک زبان می‌شود.
                    spanِ بی-هندلر: سفرِ درس کارِ چیپ‌هایِ نوار است (r263) —
                    دو مقصدِ یکسان رویِ یک کارت شلوغی است نه سادگی. */}
                <span
                  data-testid="usage-site-lesson"
                  title={`این کاربرد از واژگانِ درسِ ${faNum(s.lessonId)} است`}
                  className="ms-auto inline-flex items-center rounded-md border border-stone-200 bg-stone-100 px-1.5 py-0.5 text-[10px] font-black text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
                >
                  درس {faNum(s.lessonId)}
                </span>
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
          // r268 ① — دکمهٔ دوسطحیِ گشاینده: متنِ مرئیِ جمع‌شده («+ N موردِ
          // دیگر در جزوه») بایت‌به‌بایت همانِ قفل‌هایِ r264 است — تغییرِ
          // عنصر از p به button هیچ toContainی را نمی‌شکند؛ aria-expanded
          // وضعیت را صادقانه می‌گوید و بازگشتِ کاملِ r260 را دارد. نامِ
          // دسترس‌پذیر از خودِ متنِ مرئی می‌آید — خطِ aria-label وجود ندارد
          // تا فضای نامِ a11yِ r253 (هرگز «جزوه» در aria) بی‌استثنا بماند.
          <button
            type="button"
            data-testid="usage-more"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
            title={
              showAll
                ? "کلیک: بازگشت به فهرستِ فشرده"
                : kindFilter && activeKindLabel
                  ? `کلیک: نمایشِ همهٔ ${faNum(visibleSites.length)} کاربردِ ${activeKindLabel} در جزوه`
                  : `کلیک: نمایشِ همهٔ ${faNum(visibleSites.length)} کاربردِ جزوه`
            }
            className="mx-auto flex w-fit items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-bold text-stone-500 transition-colors duration-150 hover:border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:border-stone-700 dark:bg-stone-800/60 dark:hover:border-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          >
            {showAll
              ? `نمایشِ کمتر — همهٔ ${faNum(visibleSites.length)} کاربرد در جزوه`
              : `+ ${faNum(visibleSites.length - 8)} موردِ دیگر در جزوه`}
          </button>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
