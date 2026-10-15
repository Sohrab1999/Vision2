"use client";

// ---------------------------------------------------------------------
// راند ۲۳۰ — «لایهٔ جدولِ تلفظ (IPA)»: کارت‌های واک از بدنهٔ inlineِ
// appendix-view به کامپوننتِ خودش مهاجرت کرد (الگویِ استخراجِ r223/r229
// — یک منبعِ حقیقت) و سه لایه گرفت:
//   ① جست‌وجوی زندهٔ دوزبانه — نشانهٔ IPA + نامِ فارسی + واژه‌های نمونه
//      (بی‌حساس به بزرگی/کوچکیِ حرف در انگلیسی)؛ چیپِ «N نتیجه» +
//      دکمهٔ پاک‌کردن؛ صفرِ نتیجه = حالتِ خالیِ صادقانه — هیچ کارتِ
//      ساختگی.
//   ② فیلترِ گروه — «همه / صدادار / بی‌صدا» با شمارشِ همیشه از
//      «فهرستِ رندرشده» (قراردادِ صداقتِ r227–r229): گروهِ بی‌نتیجه
//      اصلاً رندر نمی‌شود و چیپش هم حذف می‌شود؛ چیپِ «همه» همیشه هست
//      (راهِ برگشت).
//   ③ روخوانیِ واژه‌های نمونه — یک دکمهٔ تلفظ روی رشتهٔ مثالِ هر واک
//      (عینِ چاپِ جزوه: «arm, father» هر دو واژه با هم روخوانی
//      می‌شوند) — ۴۴ نقطهٔ روخوانی. نشانهٔ IPA روخوانی نمی‌شود: TTS
//      این نویسه‌ها را خراب می‌خواند (تصمیمِ صداقت — مستند).
// ترتیبِ واک‌ها عینِ جزوه است و عمداً مرتب نمی‌شود: فهرستِ الفبایی نیست
// (برخلافِ افعالِ r229) و ساختنِ «پرشِ الفبایی» اینجا یعنی جعلِ ترتیب؛
// ناوبریِ این لایه فیلترِ گروه است. جزئیاتِ استایل: متنِ مثالِ کارت‌های
// بی‌صدا حالا هم‌رنگِ گروهِ خودش است (rose) — در چیدمانِ قدیمِ مشترک
// به‌اشتباه زمردی بود؛ هاورِ کارت‌ها scope‌شده است (قراردادِ P4).
// ---------------------------------------------------------------------

import { useMemo, useState } from "react";
import { Search, Volume2, X } from "lucide-react";
import { vowelPhonemes, consonantPhonemes, type Phoneme } from "@/data/appendix";
import { faNum } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";

type PhonemeGroup = "صدادار" | "بی‌صدا";
type GroupKey = "همه" | PhonemeGroup;

/** هویتِ بصریِ هر گروه — همهٔ کلاس‌ها لفظی‌اند تا Tailwind آن‌ها را ببیند. */
const GROUP_META: Record<
  PhonemeGroup,
  { title: string; data: Phoneme[]; dot: string; badge: string; example: string; hoverBorder: string }
> = {
  "صدادار": {
    title: "حروف صدادار (Vowels)",
    data: vowelPhonemes,
    dot: "bg-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    example: "text-emerald-700 dark:text-emerald-300",
    hoverBorder: "hover:border-emerald-300",
  },
  "بی‌صدا": {
    title: "حروف بی‌صدا (Consonants)",
    data: consonantPhonemes,
    dot: "bg-rose-600",
    badge: "bg-rose-100 text-rose-700",
    example: "text-rose-700 dark:text-rose-300",
    hoverBorder: "hover:border-rose-300",
  },
};

const GROUP_ORDER: PhonemeGroup[] = ["صدادار", "بی‌صدا"];
const TOTAL = vowelPhonemes.length + consonantPhonemes.length;

/** کارتِ یک واک — ساختارِ جزوه (نشانه / نامِ فارسی / نمونه) + روخوانیِ نمونه.
 *  جزئیاتِ چیدمان: جزوه نامِ هر واک را سطری به‌شکل «نام /نشانه/» چاپ کرده؛
 *  موربِ انتهاییِ نام آرایه‌نگاریِ همان سطر است و در کارت، نشانه خطِ خودش را
 *  با مورب‌ها دارد — نمایشِ نام بدونِ تکرارِ مورب، چیدمان است نه تغییرِ
 *  محتوا (دادهٔ خام دست‌نخورده می‌ماند و جست‌وجو روی آن کار می‌کند). */
function PhonemeCard({ p, meta }: { p: Phoneme; meta: (typeof GROUP_META)[PhonemeGroup] }) {
  const faName = p.fa.replace(/\s*\/\s*$/, "");
  return (
    <div
      className={`rounded-xl border border-stone-100 bg-stone-50 p-3 transition-[border-color,background-color,box-shadow] ${meta.hoverBorder} hover:bg-white hover:shadow-sm`}
    >
      <div className="en-text mb-1 break-words text-xl font-black text-stone-800" dir="ltr">
        /{p.symbol}/
      </div>
      <div className="text-[12px] text-stone-500">{faName}</div>
      <div className={`en-text mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold ${meta.example}`} dir="ltr">
        <span className="min-w-0 break-words">{p.example}</span>
        <SpeakButton text={p.example} size="sm" />
      </div>
    </div>
  );
}

export default function PhoneticsTable() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<GroupKey>("همه");
  const trimmed = q.trim();
  const query = trimmed.toLowerCase();

  // جست‌وجوی دوزبانه (r230): نشانهٔ IPA + نامِ فارسی + واژه‌های نمونه
  const filtered = useMemo(() => {
    const match = (p: Phoneme) =>
      p.symbol.toLowerCase().includes(query) ||
      p.fa.includes(trimmed) ||
      p.example.toLowerCase().includes(query);
    return {
      "صدادار": trimmed ? vowelPhonemes.filter(match) : vowelPhonemes,
      "بی‌صدا": trimmed ? consonantPhonemes.filter(match) : consonantPhonemes,
    } as Record<PhonemeGroup, Phoneme[]>;
  }, [trimmed, query]);

  // فیلترِ گروه — گروهِ بی‌نتیجه اصلاً رندر نمی‌شود (قراردادِ صداقت)
  const visibleGroups: PhonemeGroup[] =
    group === "همه" ? GROUP_ORDER.filter((g) => filtered[g].length > 0) : [group];
  const visibleCount = visibleGroups.reduce((n, g) => n + filtered[g].length, 0);
  const searching = trimmed.length > 0;

  const chipCounts: Record<GroupKey, number> = {
    همه: filtered["صدادار"].length + filtered["بی‌صدا"].length,
    "صدادار": filtered["صدادار"].length,
    "بی‌صدا": filtered["بی‌صدا"].length,
  };
  // چیپ‌ها همیشه از «فهرستِ رندرشده» — گروهِ بی‌روی هرگز چیپ ندارد؛
  // «همه» همیشه هست (راهِ برگشت حتی در صفرِ کامل).
  const chips: GroupKey[] = ["همه", ...GROUP_ORDER.filter((g) => chipCounts[g] > 0)];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border c-card p-5 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Volume2 size={19} />
          </span>
          <h2 className="text-[15px] font-extrabold text-stone-800">جدول تلفظ (IPA)</h2>
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-black text-violet-700">
            {faNum(TOTAL)} واک
          </span>
          {searching && (
            <span
              role="status"
              className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700"
            >
              {faNum(visibleCount)} نتیجه
            </span>
          )}
        </div>
        <p className="text-[13px] leading-7 text-stone-500">
          سیستم تلفظِ بین‌المللی (IPA) جزوه — هر واک با نشانه، نامِ فارسی و واژه‌های نمونه؛ ترتیبِ عینِ جزوه است و
          چیزی جابه‌جا یا افزوده نشده است. روی واژهٔ نمونهٔ هر واک دکمهٔ روخوانی هست؛ نشانه‌های IPA روخوانی
          نمی‌شوند.
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
              placeholder="جست‌وجو: نشانه، نام یا واژهٔ نمونه…"
              aria-label="جست‌وجو در جدول تلفظ"
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
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="فیلتر گروه واک‌ها">
            {chips.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                aria-pressed={group === g}
                className={`rounded-full px-3.5 py-2 text-[12px] font-bold transition-[background-color,color,box-shadow] ${
                  group === g
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                }`}
              >
                {g}
                <span className="ms-1.5 text-[10.5px] font-black opacity-80">{faNum(chipCounts[g])}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleCount === 0 ? (
        /* صفرِ صادقانه (r230) — هیچ کارتِ ساختگی؛ راهِ برگشت همیشه هست */
        <div className="flex flex-col items-center gap-2 rounded-2xl border c-card p-8 text-center">
          <Search size={22} className="text-stone-500 dark:text-stone-300" />
          <p className="text-[13px] font-bold text-stone-500 dark:text-stone-300">
            {group === "همه"
              ? `واکی برایِ «${trimmed}» در فهرستِ ${faNum(TOTAL)}تایی پیدا نشد.`
              : `واکی برایِ «${trimmed}» در گروهِ «${group}» پیدا نشد.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setQ("")}
              className="rounded-lg bg-violet-100 px-3 py-1.5 text-[12px] font-extrabold text-violet-700 transition-[background-color,color] hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-900/70"
            >
              پاک‌کردن جست‌وجو
            </button>
            {group !== "همه" && (
              <button
                type="button"
                onClick={() => setGroup("همه")}
                className="rounded-lg bg-stone-100 px-3 py-1.5 text-[12px] font-extrabold text-stone-600 transition-[background-color,color] hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                نمایش همهٔ گروه‌ها
              </button>
            )}
          </div>
        </div>
      ) : (
        visibleGroups.map((g) => {
          const meta = GROUP_META[g];
          const rows = filtered[g];
          return (
            <div key={g} role="group" aria-label={meta.title} className="rounded-2xl border c-card p-4">
              <h2 className="mb-3 flex flex-wrap items-center gap-2 text-[15px] font-extrabold text-stone-800">
                <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} aria-hidden="true" />
                {meta.title}
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${meta.badge}`}>
                  {faNum(rows.length)} واک
                </span>
              </h2>
              <div className="grid max-h-[38vh] gap-2 overflow-y-auto nice-scroll sm:grid-cols-2 lg:grid-cols-4">
                {rows.map((p) => (
                  <PhonemeCard key={p.symbol + p.example} p={p} meta={meta} />
                ))}
              </div>
            </div>
          );
        })
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-7 text-amber-900">
        💡 <b>نکته:</b> علامت r در ساختارهایی مثل ɜːr و ɪər نشان می‌دهد این حرف در انگلیسی آمریکایی تلفظ می‌شود اما در
        بریتانیایی تلفظ نمی‌گردد. سیستم IPA مخفف <b>International Phonetic Alphabet</b> (الفبای آوایی بین‌المللی) است.
      </div>
    </div>
  );
}
