"use client";

// ---------------------------------------------------------------------
// راند ۲۲۹ — جدولِ «افعال بی‌قاعده» از ضمیمه به کامپوننتِ خودش مهاجرت کرد
// (همان الگویِ استخراجِ r223 برای WordFamilyTableCard — یک منبعِ حقیقت)
// و سه لایه گرفت:
//   ① جست‌وجوی زندهٔ دوزبانه — سه شکلِ انگلیسی (بی‌حساس به بزرگی/کوچکیِ
//      حرف) + معنیِ فارسیِ زیررشته‌ای؛ شمارشِ نتیجه و دکمهٔ پاک‌کردن.
//   ② فهرستِ الفباییِ پرش — چیپِ هر حرف با شمارش، همیشه از «فهرستِ
//      رندرشده» (فیلترِ فعال — قراردادِ صداقتِ r227/r228): حرفِ بی‌روی
//      اصلاً رندر نمی‌شود؛ کلیک = اسکرولِ محلی به لنگرِ سطرِ حرف،
//      بدونِ چرخشِ استور.
//   ③ سطرهای جداکنندهٔ حرف داخلِ جدول (لنگرِ iv-letter-X با scroll-mt
//      برای فاصلهٔ سرصفحهٔ چسبان) و دکمهٔ تلفظ روی هر سه ستونِ انگلیسی —
//      همان ایدئومِ EnSpeakCellِ r223.
// محتوای جدول عینِ ضمیمهٔ جزوه است؛ هیچ چیزی به‌جایش ساخته نشده و
// صفرِ جست‌وجو صادقانه است.
// ---------------------------------------------------------------------

import { Fragment, useMemo, useState } from "react";
import { Search, SpellCheck2, X } from "lucide-react";
import { irregularVerbs, type IrregularVerb } from "@/data/appendix";
import { faNum } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";

/** سلولِ انگلیسیِ غیرتهی: واژه + دکمهٔ تلفظ (ایدئومِ r223). */
function EnSpeakCell({ word, bold }: { word: string; bold?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`en-text text-[12.5px] ${bold ? "font-black text-violet-700" : "text-stone-600"}`}
        dir="ltr"
      >
        {word}
      </span>
      <SpeakButton text={word} size="sm" />
    </span>
  );
}

export default function IrregularVerbsTable() {
  const [q, setQ] = useState("");
  const trimmed = q.trim();
  const query = trimmed.toLowerCase();

  // جست‌وجوی دوزبانه (r229): سه شکلِ انگلیسی + معنیِ فارسی
  const rows = useMemo(() => {
    if (!trimmed) return irregularVerbs;
    return irregularVerbs.filter(
      (v) =>
        [v.base, v.past, v.pp].some((e) => e.toLowerCase().includes(query)) ||
        v.fa.includes(trimmed),
    );
  }, [trimmed, query]);

  // گروه‌بندیِ حرف‌اول از «فهرستِ رندرشده» — حرفِ بی‌سطر هرگز رندر نمی‌شود
  const groups = useMemo(() => {
    const byLetter = new Map<string, IrregularVerb[]>();
    for (const v of rows) {
      const L = v.base.charAt(0).toUpperCase();
      const bucket = byLetter.get(L);
      if (bucket) bucket.push(v);
      else byLetter.set(L, [v]);
    }
    return [...byLetter.entries()].map(([letter, verbs]) => ({ letter, verbs }));
  }, [rows]);

  const searching = trimmed.length > 0;

  // پرشِ الفبایی — کاملاً محلی: rAF به لنگرِ سطرِ حرف داخلِ ظرفِ اسکرول
  const jumpToLetter = (letter: string) => {
    requestAnimationFrame(() => {
      document
        .getElementById(`iv-letter-${letter}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="rounded-2xl border c-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <SpellCheck2 size={19} />
        </span>
        <h2 className="text-[15px] font-extrabold text-stone-800">افعال بی‌قاعده</h2>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-black text-violet-700">
          {faNum(irregularVerbs.length)} فعل
        </span>
        {searching && (
          <span
            role="status"
            className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700"
          >
            {faNum(rows.length)} نتیجه
          </span>
        )}
      </div>
      <p className="mb-3 text-[13px] leading-7 text-stone-500">
        افعال در زبان انگلیسی سه شکل دارند: ۱) شکل ساده ۲) شکل دوم یا گذشته ۳) شکل سوم (اسم مفعول - p.p.).
        افعال بی‌قاعده به‌جای گرفتن «ed» تغییر شکل می‌دهند و باید حفظ شوند.
      </p>

      {/* جست‌وجوی دوزبانه (r229) */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-300"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جست‌وجو: انگلیسی یا فارسی…"
            aria-label="جست‌وجو در افعال بی‌قاعده"
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pe-8 ps-8 text-[13px] text-stone-700 transition-[border-color,box-shadow] placeholder:text-stone-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:ring-violet-900/50"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="پاک‌کردن جست‌وجو"
              title="پاک‌کردن جست‌وجو"
              className="absolute end-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition-[background-color,color] hover:bg-stone-100 hover:text-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* فهرستِ الفباییِ پرش — از فهرستِ رندرشده (فیلترِ فعال) */}
      {rows.length > 0 && (
        <div
          role="group"
          aria-label="پرش الفبایی افعال بی‌قاعده"
          className="mb-3 flex flex-wrap items-center gap-1.5"
        >
          {groups.map((g) => (
            <button
              key={g.letter}
              type="button"
              onClick={() => jumpToLetter(g.letter)}
              aria-label={`پرش به فعل‌های حرفِ ${g.letter} (${faNum(g.verbs.length)} فعل)`}
              title={`${faNum(g.verbs.length)} فعل با حرفِ ${g.letter}`}
              dir="ltr"
              className="en-text inline-flex min-w-9 items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[12px] font-black text-stone-600 transition-[background-color,border-color,color,box-shadow] hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-violet-700 dark:hover:bg-violet-900/30 dark:hover:text-violet-300"
            >
              {g.letter}
              <span className="text-[10px] font-black text-violet-500">{faNum(g.verbs.length)}</span>
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        /* صفرِ صادقانه (r229) — هیچ نتیجه‌ای، هیچ ردیفِ ساختگی */
        <div className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 p-8 text-center dark:border-stone-700">
          <Search size={22} className="text-stone-500 dark:text-stone-300" />
          <p className="text-[13px] font-bold text-stone-500 dark:text-stone-300">
            فعلِ «{trimmed}» در فهرستِ {faNum(irregularVerbs.length)}تایی پیدا نشد.
          </p>
          <button
            type="button"
            onClick={() => setQ("")}
            className="rounded-lg bg-violet-100 px-3 py-1.5 text-[12px] font-extrabold text-violet-700 transition-[background-color,color] hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-900/70"
          >
            پاک‌کردن جست‌وجو
          </button>
        </div>
      ) : (
        <div className="max-h-[58vh] overflow-auto rounded-xl border border-stone-200 nice-scroll">
          <table className="verbs-table w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-violet-600 text-white">
                <th className="px-3 py-2.5 text-right">معنی فارسی</th>
                <th className="px-3 py-2.5">شکل اول (ساده)</th>
                <th className="px-3 py-2.5">شکل دوم (گذشته)</th>
                <th className="px-3 py-2.5">شکل سوم (p.p.)</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g.letter}>
                  {/* جداکنندهٔ حرف — لنگرِ پرشِ الفبایی؛ scroll-mt زیرِ سرصفحهٔ چسبان */}
                  <tr
                    id={`iv-letter-${g.letter}`}
                    className="scroll-mt-12 bg-violet-50 dark:bg-violet-900/30"
                  >
                    <td colSpan={4} className="px-3 py-1.5">
                      <span
                        className="en-text text-[12.5px] font-black text-violet-700 dark:text-violet-300"
                        dir="ltr"
                      >
                        {g.letter}
                      </span>
                      <span className="ms-2 text-[11px] font-black text-violet-500 dark:text-violet-400">
                        {faNum(g.verbs.length)} فعل
                      </span>
                    </td>
                  </tr>
                  {g.verbs.map((v, i) => (
                    <tr key={v.base} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                      <td className="px-3 py-2 text-[12.5px] text-stone-700">{v.fa}</td>
                      <td className="px-3 py-2">
                        <EnSpeakCell word={v.base} bold />
                      </td>
                      <td className="px-3 py-2">
                        <EnSpeakCell word={v.past} />
                      </td>
                      <td className="px-3 py-2">
                        <EnSpeakCell word={v.pp} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
