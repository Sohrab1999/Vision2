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
import { faNum } from "@/lib/study-theme";
import { highlightParts, type WordUsageSite } from "@/lib/word-usage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface WordUsageTarget {
  en: string;
  sites: WordUsageSite[];
}

export default function WordUsageDialog({
  target,
  onClose,
  onOpenLesson,
}: {
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
  // راند ۲۶۲ — بندِ ② پیشنهادِ ۲۶۱: پراکندگیِ درس‌ها — وقتی واژه در ≥۲ درس
  // زندگی می‌کند، یک نوارِ فشرده زیرِ تیتر نشان می‌دهد هر درس چند کاربرد دارد
  // (پیش‌شمارشِ r262: change = ۱۳ کاربرد در ۶ درس با صدرنشینِ درسِ ۵؛
  // ability = ۱ کاربرد در ۱ درس → نوار مخفی — صداقتِ r252). مرتب‌سازی:
  // شمارشِ نزولی سپس شناسهٔ درسِ صعودی — قطعی؛ صدرنشین = هر سطرِ هم‌شمارِ
  // بیشینه (ایدئومِ تساویِ امنِ r258/259). چیپ‌های اطلاعاتیِ بنفش — همان
  // خانوادهٔ چیپِ درسِ ردیف‌هایِ مقایسه؛ صدرنشینِ پر (bg-violet-600) به
  // ایدئومِ badgeِ «بیشترین»؛ span نه دکمه — فضای نامِ a11yِ r253.
  const lessonCounts = (() => {
    const m = new Map<number, number>();
    target?.sites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  })();
  const maxLessonCount = lessonCounts[0]?.[1] ?? 0;
  // r263 ③ — تفکیکِ نوع (مکالمه/ریدینگ) در همان نوار — فقط وقتی هر دو نوع
  // موجودند (تک-نوع چیزی فراتر از چیپِ نوعِ خودِ کارت‌ها نمی‌گوید — صداقتِ
  // r252؛ پیش‌شمارشِ r263: change = ریدینگِ ۱۱ + مکالمهٔ ۲ · communication و
  // ability تک-نوع). ترتیبِ ثابتِ مکالمه سپس ریدینگ — همان ترتیبِ canonicalِ
  // badgeهایِ نوعِ خودِ سایت‌ها؛ ایدئومِ آسمانیِ خانواده (border-sky-200/
  // bg-sky-50/text-sky-700 — صفرِ قانونِ CSSِ نو).
  const kindCounts = (() => {
    const m = new Map<string, number>();
    target?.sites.forEach((s) => m.set(s.kind, (m.get(s.kind) ?? 0) + 1));
    return [
      { kind: "conversation", label: "مکالمه", count: m.get("conversation") ?? 0 },
      { kind: "reading", label: "ریدینگ", count: m.get("reading") ?? 0 },
    ].filter((k) => k.count > 0);
  })();
  const kindsBoth = kindCounts.length === 2;
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
        {lessonCounts.length >= 2 && (
          <div
            data-testid="usage-lessons-bar"
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 dark:border-stone-700 dark:bg-stone-800/60"
          >
            <span className="text-[10.5px] font-black text-stone-500">پراکندگیِ درس‌ها:</span>
            {lessonCounts.map(([lessonId, count]) => {
              const leading = count === maxLessonCount;
              // r263 ① — الگویِ host-decides: با هندلر، دکمهٔ واقعی با نامِ
              // دسترس‌پذیریِ صریح (هرگز «کاربرددار» یا «جزوه»ی برهنه — فضای
              // نامِ a11yِ r253)؛ بی‌هندلر، spanِ اطلاعاتیِ r262 دست‌نخورده.
              const cls = leading
                ? "inline-flex items-center rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-black text-white"
                : "inline-flex items-center rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-black text-violet-700";
              if (onOpenLesson) {
                return (
                  <button
                    key={lessonId}
                    type="button"
                    data-testid={`usage-lesson-chip-${lessonId}`}
                    title={
                      (leading ? `بیشترینِ کاربردهایِ این واژه در درسِ ${faNum(lessonId)} است — ` : "") +
                      `کلیک: واژه‌هایِ در-متنِ درسِ ${faNum(lessonId)}`
                    }
                    aria-label={`رفتن به واژه‌هایِ درسِ ${faNum(lessonId)} — ${faNum(count)} کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن`}
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
                      ? `بیشترینِ کاربردهایِ این واژه در درسِ ${faNum(lessonId)} است`
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
                {kindCounts.map((k) => (
                  <span
                    key={k.kind}
                    data-testid={`usage-kind-chip-${k.kind}`}
                    className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-black text-sky-700"
                  >
                    {k.label} {faNum(k.count)}
                  </span>
                ))}
              </>
            )}
          </div>
        )}
        <ul className="space-y-2">
          {target?.sites.slice(0, 8).map((s, i) => (
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
                {highlightParts(s.en, target.en).map((part, j) =>
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
        {target && target.sites.length > 8 && (
          <p className="text-[11px] font-bold text-stone-500" data-testid="usage-more">
            + {faNum(target.sites.length - 8)} موردِ دیگر در جزوه
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
