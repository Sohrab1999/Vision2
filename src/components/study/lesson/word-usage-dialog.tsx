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
}: {
  target: WordUsageTarget | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto nice-scroll" data-testid="usage-dialog">
        <DialogHeader className="text-right">
          <DialogTitle className="flex flex-wrap items-baseline gap-2 text-base">
            <BookOpenText size={16} className="shrink-0 self-center text-sky-600" aria-hidden />
            <span dir="ltr" className="en-text">{target?.en}</span>
            <span className="text-[12px] font-bold text-stone-500">
              در جزوه · {target ? faNum(target.sites.length) : ""} کاربرد
            </span>
          </DialogTitle>
        </DialogHeader>
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
