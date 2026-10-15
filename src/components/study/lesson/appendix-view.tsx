"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Library, ListTree, Volume2, SpellCheck2, BookA, Table2, BookOpenCheck, Users } from "lucide-react";
import { irregularVerbs, vowelPhonemes, consonantPhonemes, abbreviations, partsOfSpeech } from "@/data/appendix";
import {
  WORD_FAMILY_TABLES,
  WORD_FAMILY_TOTAL,
  WF_TABLE_ID_TO_LESSON,
  wordFamilyTableId,
} from "@/data/word-families";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import BookletGrammarView from "./booklet-grammar-view";
import WordFamilyTableCard from "./word-family-table-card";

type SubTab = "verbs" | "phonetics" | "pos" | "abbrev" | "grammar";

const subTabs: { key: SubTab; label: string; icon: React.ElementType }[] = [
  { key: "grammar", label: "درسنامهٔ جامع", icon: BookOpenCheck },
  { key: "verbs", label: "افعال بی‌قاعده", icon: SpellCheck2 },
  { key: "phonetics", label: "جدول تلفظ (IPA)", icon: Volume2 },
  { key: "pos", label: "اجزای کلام", icon: BookA },
  { key: "abbrev", label: "نشانه‌های اختصاری", icon: Table2 },
];

export default function AppendixView({ topicId, posTableId }: { topicId?: string; posTableId?: string }) {
  // لنگرِ عمیقِ «اجزای کلماتی» (راند ۲۲۴) — شناسهٔ معتبر یعنی ضمیمه مستقیم
  // روی زیرتبِ pos باز می‌شود؛ نامعتبر بی‌خطر است (رفتارِ سابق: درسنامهٔ جامع).
  const validPos = !!posTableId && WORD_FAMILY_TABLES.some((t) => wordFamilyTableId(t) === posTableId);
  const [tab, setTab] = useState<SubTab>(() => (validPos ? "pos" : "grammar"));
  // راند ۲۲۲ — فیلترِ پایهٔ جدول‌های «اجزای کلماتی» در زیرتبِ pos
  const [posGrade, setPosGrade] = useState<"همه" | "دهم" | "یازدهم" | "دوازدهم">("همه");
  // راند ۲۲۸ — فهرستِ پرشِ جدول‌ها (بندِ ② پیشنهادِ ۲۲۷): پنلِ چیپ‌ها همیشه از
  // «فهرستِ رندرشده» (فیلترِ فعال) — همان قراردادِ ناوبریِ r227؛ کلیک =
  // اسکرولِ محلی به لنگر + بستنِ پنل، بدونِ چرخشِ استور.
  const [posJumpOpen, setPosJumpOpen] = useState(false);
  // لنگرِ عمیقِ «درسنامهٔ جامع» (راند ۲۲۱) — یک‌بارِ مصرف: BookletGrammarView
  // پس از نخستین تلاشِ اسکرول (موفق یا شناسهٔ نامعتبر) onFocusDone را صدا
  // می‌زند و لنگر پاک می‌شود؛ جابه‌جاییِ بعدیِ بینِ زیرتاب‌ها دوباره پرش نمی‌کند.
  const [focusTopicId, setFocusTopicId] = useState<string | undefined>(topicId);
  // لنگرِ عمیقِ جدولِ خانوادهٔ واژه‌ها (راند ۲۲۴) — یک‌بارِ مصرفِ همان الگو
  const [focusPosTableId, setFocusPosTableId] = useState<string | undefined>(
    () => (validPos ? posTableId : undefined),
  );

  // اسکرولِ تمرکزِ لنگرِ pos (راند ۲۲۴) — jsdom scrollIntoView ندارد
  // (فراخوانِ اختیاری) و پس از نخستین تلاش لنگر پاک می‌شود.
  useEffect(() => {
    if (!focusPosTableId) return;
    const raf = requestAnimationFrame(() => {
      document
        .getElementById(`wf-table-${focusPosTableId}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      setFocusPosTableId(undefined);
    });
    return () => cancelAnimationFrame(raf);
  }, [focusPosTableId]);

  const openLessonTab = useStudy((s) => s.openLessonTab);

  // ناوبریِ پیوستهٔ جدول‌های pos (راند ۲۲۷ — آینهٔ navigateToTopicِ r226):
  // همهٔ جدول‌ها همیشه بازند — ناوبری یعنی اسکرولِ محلی به لنگرِ هدف؛
  // کاملاً محلی، بدونِ چرخشِ استور. همسایه‌ها از «فهرستِ رندرشده»
  // (همان فیلترِ فعال) مشتق می‌شوند — ناوبری هیچ‌وقت به جدولِ پنهان نمی‌رود.
  const navigateToTable = (id: string) => {
    requestAnimationFrame(() => {
      document
        .getElementById(`wf-table-${id}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border c-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Library size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800">ضمیمهٔ کتاب</h1>
            <p className="text-[13px] text-stone-500">ابزارهای مرجع جزوه: درسنامهٔ جامع، افعال بی‌قاعده، تلفظ بین‌المللی و واژه‌شناسی</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {subTabs.map((st) => {
            const Icon = st.icon;
            const active = tab === st.key;
            return (
              <button
                key={st.key}
                onClick={() => setTab(st.key)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-[background-color,color,border-color,box-shadow] ${
                  active ? "bg-violet-600 text-white shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Icon size={15} />
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "grammar" && (
        <BookletGrammarView
          focusTopicId={focusTopicId}
          onFocusDone={() => setFocusTopicId(undefined)}
        />
      )}

      {tab === "verbs" && (
        <div className="rounded-2xl border c-card p-4">
          <p className="mb-3 text-[13px] leading-7 text-stone-500">
            افعال در زبان انگلیسی سه شکل دارند: ۱) شکل ساده ۲) شکل دوم یا گذشته ۳) شکل سوم (اسم مفعول - p.p.).
            افعال بی‌قاعده به‌جای گرفتن «ed» تغییر شکل می‌دهند و باید حفظ شوند.
          </p>
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
                {irregularVerbs.map((v, i) => (
                  <tr key={v.base} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                    <td className="px-3 py-2 text-stone-700">{v.fa}</td>
                    <td className="en-text px-3 py-2 font-bold text-violet-700" dir="ltr">{v.base}</td>
                    <td className="en-text px-3 py-2 text-stone-600" dir="ltr">{v.past}</td>
                    <td className="en-text px-3 py-2 font-semibold text-stone-800" dir="ltr">{v.pp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "phonetics" && (
        <div className="space-y-4">
          {[
            { title: "حروف صدادار (Vowels)", data: vowelPhonemes, color: "bg-emerald-600" },
            { title: "حروف بی‌صدا (Consonants)", data: consonantPhonemes, color: "bg-rose-600" },
          ].map((group) => (
            <div key={group.title} className="rounded-2xl border c-card p-4">
              <h2 className="mb-3 text-[15px] font-extrabold text-stone-800">{group.title}</h2>
              <div className="grid max-h-[38vh] gap-2 overflow-y-auto nice-scroll sm:grid-cols-2 lg:grid-cols-4">
                {group.data.map((p) => (
                  <div key={p.symbol + p.example} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                    <div className="en-text mb-1 text-xl font-black text-stone-800" dir="ltr">
                      /{p.symbol}/
                    </div>
                    <div className="text-[12px] text-stone-500">{p.fa}</div>
                    <div className="en-text mt-1 text-[12.5px] font-semibold text-emerald-700" dir="ltr">
                      {p.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-7 text-amber-900">
            💡 <b>نکته:</b> علامت r در ساختارهایی مثل ɜːr و ɪər نشان می‌دهد این حرف در انگلیسی آمریکایی تلفظ می‌شود اما در
            بریتانیایی تلفظ نمی‌گردد. سیستم IPA مخفف <b>International Phonetic Alphabet</b> (الفبای آوایی بین‌المللی) است.
          </div>
        </div>
      )}

      {tab === "pos" && (() => {
        const gradeCounts = { همه: WORD_FAMILY_TOTAL, دهم: 0, یازدهم: 0, دوازدهم: 0 } as Record<string, number>;
        for (const t of WORD_FAMILY_TABLES) gradeCounts[t.grade] += t.families.length;
        const tables = posGrade === "همه" ? WORD_FAMILY_TABLES : WORD_FAMILY_TABLES.filter((t) => t.grade === posGrade);
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {partsOfSpeech.map((p, i) => (
                <div key={p.name} className="rounded-2xl border c-card p-4">
                  <h2 className="mb-1 flex items-center gap-2 text-[14px] font-extrabold text-violet-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-[12px] font-black">
                      {i + 1}
                    </span>
                    {p.name}
                  </h2>
                  <p className="text-[13px] leading-7 text-stone-600">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* اجزای کلماتی از خودِ جزوه‌های جامع (راند ۲۲۲) */}
            <div className="rounded-2xl border c-card p-5 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Users size={19} />
                </span>
                <h2 className="text-[16px] font-extrabold text-stone-800">خانوادهٔ واژه‌ها از خودِ جزوه‌ها (اجزای کلماتی)</h2>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11.5px] font-black text-violet-700">
                  {faNum(WORD_FAMILY_TOTAL)} خانواده · {faNum(WORD_FAMILY_TABLES.length)} جدول
                </span>
              </div>
              <p className="text-[13px] leading-7 text-stone-500">
                از خودِ جزوه‌ها: «مهم‌ترین اجزای کلماتیِ (Parts of Speech) کنکور به ترتیبِ درس آمده‌اند که در افزایشِ دایرهٔ واژگان
                و برای ترجمه و فهمِ زبان بسیار مفید می‌باشند.» ترتیبِ ستون‌ها و محتوا عینِ جزوه است؛ خانهٔ خالیِ جزوه با خطِ تیره
                رندر می‌شود و چیزی به‌جایش ساخته نشده است.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="فیلتر پایهٔ جدول‌های اجزای کلماتی">
                  {(["همه", "دهم", "یازدهم", "دوازدهم"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setPosGrade(g)}
                      aria-pressed={posGrade === g}
                      className={`rounded-full px-3.5 py-2 text-[12px] font-bold transition-[background-color,color,box-shadow] ${
                        posGrade === g
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
                      }`}
                    >
                      {g}
                      <span className="ms-1.5 text-[10.5px] font-black opacity-80">{faNum(gradeCounts[g])}</span>
                    </button>
                  ))}
                </div>
                {/* راند ۲۲۸ — فهرستِ پرشِ جدول‌ها (بیرونِ گروهِ فیلتر — قراردادِ گارد) */}
                <button
                  type="button"
                  onClick={() => setPosJumpOpen((v) => !v)}
                  aria-expanded={posJumpOpen}
                  aria-controls="pos-jump-index"
                  title="پرشِ سریع به هر جدول — با شمارهٔ جایگاه و شمارشِ خانواده‌ها"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-stone-600 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-stone-100 dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-900/70"
                >
                  <ListTree size={13} />
                  فهرست جدول‌ها
                </button>
              </div>
              {posJumpOpen && (
                <div
                  id="pos-jump-index"
                  role="group"
                  aria-label="فهرست پرش جدول‌های اجزای کلماتی"
                  className="mt-2 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/60"
                >
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {tables.map((t, ti) => (
                      <button
                        key={wordFamilyTableId(t)}
                        type="button"
                        onClick={() => {
                          navigateToTable(wordFamilyTableId(t));
                          setPosJumpOpen(false);
                        }}
                        aria-label={`پرش به جدولِ ${faNum(ti + 1)}: ${t.grade} · ${t.lesson}`}
                        title={`${t.grade} · ${t.lesson} — ${faNum(t.families.length)} خانوادهٔ واژه`}
                        className="flex min-w-0 items-center gap-2 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-right transition-[background-color,border-color,color,box-shadow] hover:border-violet-300 hover:bg-violet-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-violet-700 dark:hover:bg-violet-900/30"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-100 text-[11px] font-black text-violet-700 shadow-sm dark:bg-violet-900/50 dark:text-violet-300">
                          {faNum(ti + 1)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-stone-700 dark:text-stone-200">
                          {t.grade} · {t.lesson}
                        </span>
                        <span className="shrink-0 text-[10.5px] font-black text-stone-500">
                          {faNum(t.families.length)} خانواده
                        </span>
                        <ChevronLeft size={13} className="shrink-0 text-stone-300 dark:text-stone-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* راند ۲۲۳: کارتِ جدول به کامپوننتِ مشترک مهاجرت کرد — ضمیمه و
                تبِ واژگانِ درس‌ها هر دو از یک رندر می‌خورند؛ دکمهٔ تلفظ هم
                حالا روی هر چهار ستونِ انگلیسیِ غیرتهی است (بندِ ② نقشهٔ ۲۲۲).
                راند ۲۲۴: چیپِ «درسِ مرتبط» مسیرِ برگشتِ رفت‌وبرگشت است —
                نقشهٔ معکوس از خودِ WORD_FAMILY_LESSON_LINKS مشتق می‌شود.
                راند ۲۲۷: نوارِ ناوبری «قبلی/بعدی + X از Y» از فهرستِ رندرشده
                (فیلترِ فعال) — ناوبریِ پیوستهٔ ۱۰ جدول، اسکرولِ محلی. */}
            {tables.map((t, ti) => {
              const tid = wordFamilyTableId(t);
              const lesson = WF_TABLE_ID_TO_LESSON[tid];
              return (
                <WordFamilyTableCard
                  key={`${t.vision}-${t.lesson}`}
                  table={t}
                  relatedLesson={lesson}
                  onOpenLesson={lesson !== undefined ? () => openLessonTab(lesson, "vocab") : undefined}
                  prevTable={
                    ti > 0
                      ? { id: wordFamilyTableId(tables[ti - 1]), title: `${tables[ti - 1].grade} · ${tables[ti - 1].lesson}` }
                      : undefined
                  }
                  nextTable={
                    ti < tables.length - 1
                      ? { id: wordFamilyTableId(tables[ti + 1]), title: `${tables[ti + 1].grade} · ${tables[ti + 1].lesson}` }
                      : undefined
                  }
                  onNavigateTable={navigateToTable}
                  tablePosition={ti + 1}
                  tableTotal={tables.length}
                />
              );
            })}
          </div>
        );
      })()}

      {tab === "abbrev" && (
        <div className="rounded-2xl border c-card p-4">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {abbreviations.map((a) => (
              <div key={a.sym} className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3">
                <span className="en-text flex h-9 w-14 items-center justify-center rounded-lg bg-violet-600 text-[13px] font-black text-white" dir="ltr">
                  {a.sym}
                </span>
                <div>
                  <div className="en-text text-[12px] text-stone-500" dir="ltr">{a.full}</div>
                  <div className="text-[13px] font-bold text-stone-700">{a.fa}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
