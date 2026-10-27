"use client";
// ------------------------------------------------------------------
// راند ۲۵۳ — استخراجِ دیالوگِ «کاربرد در جزوه» به کامپوننتِ مشترک
//
// دیالوگِ جایِ واژه در مکالمه‌ها/ریدینگ‌هایِ جزوه (راند ۲۵۲) از دیکشنری
// بیرون کشیده شد تا همان تک‌منبع به سه سطح برسد: کارتِ دیکشنری، تبِ
// واژگانِ درس و پشتِ فلش‌کارت — «همان چیپِ کوچک، همان دیالوگ» (بندِ ①
// پیشنهادِ ۲۵۲). کلاس‌ها و testidها عینِ r252 هستند تا پیمان‌هایِ آن راند
// با استخراج هم سبز بمانند — استخراج، بازطراحی نیست.
// محتوا فقط از جزوه می‌آید (مأموریتِ استخراجِ دقیق): mark هایلایتِ واژه
// با amberِ ریمپ‌شدهٔ kernel، نشانِ نوع (مکالمه/ریدینگ)، ترجمهٔ فارسیِ
// خودِ جزوه، سقفِ ۸ مورد با شمارندهٔ صادقانهٔ مابقی.
// ------------------------------------------------------------------

import { BookOpenText, Gauge, TrendingUp } from "lucide-react";
import { faNum } from "@/lib/study-theme";
import { usageTierLabel } from "@/lib/lens-csv";
import { highlightParts, usedWordRank, type WordUsageSite } from "@/lib/word-usage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface UsageDialogData {
  en: string;
  sites: WordUsageSite[];
}

export default function UsageDialog({
  usage,
  onClose,
}: {
  usage: UsageDialogData | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!usage} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto nice-scroll" data-testid="usage-dialog">
        <DialogHeader className="text-right">
          <DialogTitle className="flex flex-wrap items-baseline gap-2 text-base">
            <BookOpenText size={16} className="shrink-0 self-center text-sky-600" aria-hidden />
            <span dir="ltr" className="en-text">{usage?.en}</span>
            <span className="text-[12px] font-bold text-stone-500">
              در جزوه · {usage ? faNum(usage.sites.length) : ""} کاربرد
            </span>
            {/* راند ۲۶۰ — رتبهٔ پرکاربردی در خودِ دیالوگ (بندِ ② پیشنهادِ ۲۵۹):
                همان usedWordRankِ نشانِ WOTD — «رتبهٔ N از M» فقط برایِ واژه‌هایِ
                کاربرددار؛ شاخهٔ صفر-سایتِ درسنامه (r259) بی‌رتبه می‌ماند و
                هیچ می‌گوید. */}
            {(() => {
              const rank = usage ? usedWordRank(usage.en) : null;
              if (!rank) return null;
              return (
                <span
                  data-testid="usage-rank"
                  title={`رتبهٔ این واژه میانِ ${faNum(rank.total)} واژهٔ حاضر در جزوه — ۱ یعنی پرکاربردترین · سطح: ${usageTierLabel(rank.count)}`}
                  className="inline-flex items-center gap-1 self-center rounded-md border border-sky-200 bg-sky-50/60 px-1.5 py-0.5 text-[10.5px] font-bold text-sky-700"
                >
                  <TrendingUp size={11} aria-hidden />
                  رتبهٔ {faNum(rank.rank)} از {faNum(rank.total)}
                </span>
              );
            })()}
            {/* راند ۲۶۷ — سطحِ پرکاربردی در خودِ دیالوگ (بندِ ② پیشنهادِ ۲۶۶):
                همان usageTierLabelِ ستونِ «سطح»یِ CSVِ r266 — از شمارشِ همین
                دیالوگ مشتق می‌شود، پس هر هشت درِ ورود به دیالوگ سطحِ
                فایلِ اکسل را هم می‌بینند. رنگ از خانواده‌هایِ حاضرِ کارت‌ها
                (زمردیِ مترادف‌ها / کهرباییِ mark / سنگیِ بی‌طرف — همه از
                دامنهٔ remapِ کرنل)؛ بی‌سطحِ صادقانه: شاخهٔ صفر-سایتِ r259
                هیچ چیزی نمی‌گیرد. */}
            {(() => {
              const tier = usage ? usageTierLabel(usage.sites.length) : "";
              if (!tier) return null;
              const style =
                tier === "پرکاربرد"
                  ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                  : tier === "میانه"
                    ? "border-amber-200 bg-amber-50/60 text-amber-700"
                    : "border-stone-200 bg-stone-50 text-stone-500";
              return (
                <span
                  data-testid="usage-tier"
                  title="سطحِ پرکاربردی — پرکاربرد یعنی ۵+ کاربرد در جزوه، میانه ۲–۴ و کم‌کاربرد ۱"
                  className={`inline-flex items-center gap-1 self-center rounded-md border px-1.5 py-0.5 text-[10.5px] font-bold ${style}`}
                >
                  <Gauge size={11} aria-hidden />
                  سطح: {tier}
                </span>
              );
            })()}
          </DialogTitle>
        </DialogHeader>
        {/* راند ۲۵۹ — حالتِ خالیِ صادقانه: تنها راهِ بازشدن با صفر سایت،
            چیپِ درسنامه است (واژه در نثرِ گرامر زندگی می‌کند ولی در
            مکالمه/ریدینگِ جزوه نیامده) — بقیهٔ سطوح با تطبیقِ واقعی باز می‌شوند. */}
        {usage && usage.sites.length === 0 && (
          <p
            className="rounded-lg bg-stone-50 px-3 py-2.5 text-[12px] font-bold leading-6 text-stone-500 c-stone-60"
            data-testid="usage-empty"
          >
            این واژه در متن‌هایِ مکالمه و ریدینگِ جزوه نیامده — همین‌جا در نثرِ درسنامه می‌بینیدش.
          </p>
        )}
        {usage && usage.sites.length > 0 && (
          <ul className="space-y-2">
          {usage?.sites.slice(0, 8).map((s, i) => (
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
                {highlightParts(s.en, usage.en).map((part, j) =>
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
        )}
        {usage && usage.sites.length > 8 && (
          <p className="text-[11px] font-bold text-stone-500" data-testid="usage-more">
            + {faNum(usage.sites.length - 8)} موردِ دیگر در جزوه
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
