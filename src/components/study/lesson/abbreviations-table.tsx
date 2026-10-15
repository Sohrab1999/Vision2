"use client";

// ---------------------------------------------------------------------
// راند ۲۳۱ — «لایهٔ نشانه‌های اختصاری»: کارت‌های نشانه از بدنهٔ inlineِ
// appendix-view به کامپوننتِ خودش مهاجرت کردند (الگویِ استخراجِ
// r223/r229/r230 — یک منبعِ حقیقت) و دو لایه گرفتند:
//   ① جست‌وجوی زندهٔ دوزبانه — نماد + شکلِ کاملِ انگلیسی + معنیِ فارسی
//      (بی‌حساس به بزرگی/کوچکیِ حرف در انگلیسی)؛ چیپِ «N نتیجه» +
//      دکمهٔ پاک‌کردن؛ صفر = حالتِ خالیِ صادقانه — هیچ کارتِ ساختگی.
//   ② روخوانیِ شکلِ کامل — یک دکمهٔ تلفظ روی رشتهٔ fullِ هر نشانه (عینِ
//      چاپِ جزوه: «(noun)» طبیعتاً «noun» خوانده می‌شود) — ۱۳ نقطهٔ
//      روخوانی. نمادِ اختصاری روخوانی نمی‌شود: «n» و «v» تنها بی‌معنا
//      خوانده می‌شوند (تصمیمِ صداقت — همان ایدئومِ r230).
// ترتیبِ نشانه‌ها عینِ جزوه است؛ این نشانه‌ها سرِ واژگانِ جزوه می‌آیند
// و هیچ گروه‌بندی/شمارشِ برساخته‌ای به آن‌ها نمی‌چسبد.
// ---------------------------------------------------------------------

import { useMemo, useState } from "react";
import { Search, Table2, X } from "lucide-react";
import { abbreviations, type Abbreviation } from "@/data/appendix";
import { faNum } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";

const TOTAL = abbreviations.length;

/** کارتِ یک نشانه — نمادِ بنفش + شکلِ کامل + روخوانی + معنیِ فارسی. */
function AbbreviationCard({ a }: { a: Abbreviation }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 transition-[border-color,background-color,box-shadow] hover:border-violet-300 hover:bg-white hover:shadow-sm">
      <span
        className="en-text flex h-9 w-14 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-[13px] font-black text-white shadow-sm"
        dir="ltr"
      >
        {a.sym}
      </span>
      <div className="min-w-0 flex-1">
        <div className="en-text flex items-center gap-1.5 text-[12px] text-stone-500" dir="ltr">
          <span className="min-w-0 break-words">{a.full}</span>
          <SpeakButton text={a.full} size="sm" />
        </div>
        <div className="text-[13px] font-bold text-stone-700">{a.fa}</div>
      </div>
    </div>
  );
}

export default function AbbreviationsTable() {
  const [q, setQ] = useState("");
  const trimmed = q.trim();
  const query = trimmed.toLowerCase();

  // جست‌وجوی دوزبانه (r231): نماد + شکلِ کامل + معنیِ فارسی
  const rows = useMemo(() => {
    if (!trimmed) return abbreviations;
    return abbreviations.filter(
      (a) =>
        a.sym.toLowerCase().includes(query) ||
        a.full.toLowerCase().includes(query) ||
        a.fa.includes(trimmed),
    );
  }, [trimmed, query]);

  const searching = trimmed.length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border c-card p-5 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Table2 size={19} />
          </span>
          <h2 className="text-[15px] font-extrabold text-stone-800">نشانه‌های اختصاری</h2>
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-black text-violet-700">
            {faNum(TOTAL)} نشانه
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
        <p className="text-[13px] leading-7 text-stone-500">
          نشانه‌هایی که سرِ واژگانِ جزوه می‌آیند — هر نشانه با شکلِ کاملِ انگلیسی و معنیِ فارسی؛ ترتیبِ عینِ جزوه است
          و روی شکلِ کاملِ هر نشانه دکمهٔ روخوانی هست.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-300"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جست‌وجو: نشانه، شکل کامل یا فارسی…"
              aria-label="جست‌وجو در نشانه‌های اختصاری"
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
      </div>

      {rows.length === 0 ? (
        /* صفرِ صادقانه (r231) — هیچ کارتِ ساختگی */
        <div className="flex flex-col items-center gap-2 rounded-2xl border c-card p-8 text-center">
          <Search size={22} className="text-stone-500 dark:text-stone-300" />
          <p className="text-[13px] font-bold text-stone-500 dark:text-stone-300">
            نشانه‌ای برایِ «{trimmed}» در فهرستِ {faNum(TOTAL)}تایی پیدا نشد.
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
        <div className="rounded-2xl border c-card p-4">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((a) => (
              <AbbreviationCard key={a.sym} a={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
