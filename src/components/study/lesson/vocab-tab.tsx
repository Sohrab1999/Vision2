"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, Circle, Layers, X, Star, Users, ChevronDown, ExternalLink, BookOpenText } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { useStudy, wordKey } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { posLabel, themeOf, faNum } from "@/lib/study-theme";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";
import { findWordUsages, type WordUsageSite } from "@/lib/word-usage";
import WordUsageDialog from "./word-usage-dialog";
import { speak } from "@/lib/speak";
import { lessons } from "@/data";
import { WORD_FAMILY_LESSON_LINKS, wordFamilyTableId } from "@/data/word-families";
import Flashcards from "./flashcards";
import WordFamilyTableCard from "./word-family-table-card";

type Filter = "all" | "known" | "unknown";

export default function VocabTab({
  lesson,
  startSmart = false,
}: {
  lesson: LessonData;
  startSmart?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [flashMode, setFlashMode] = useState(startSmart);
  const known = useStudy((s) => s.known);
  const toggleKnown = useStudy((s) => s.toggleKnown);
  const toggleStarred = useStudy((s) => s.toggleStarred);
  const starredWords = useStudy((s) => s.starredWords);
  const consumeFlashIntent = useStudy((s) => s.consumeFlashIntent);
  const mounted = useMounted();
  // راند ۲۵۳ — «کاربرد در جزوه» به تبِ واژگانِ درس هم رسید (بندِ ① پیشنهادِ ۲۵۲):
  // همان تک‌منبعِ دیکشنری (findWordUsages) با همان دیالوگِ مشترک
  const [usage, setUsage] = useState<{ en: string; sites: WordUsageSite[] } | null>(null);

  // consume the "smart review" navigation intent once (flashcards open via
  // the flashNonce remount-key in LessonView, so no setState is needed here)
  useEffect(() => {
    if (startSmart) consumeFlashIntent();
  }, [startSmart, consumeFlashIntent]);

  const t = themeOf(lesson.color);

  // راند ۲۰۵: جفت‌های مترادف/متضاد جزوه روی کارت‌های تبِ واژگان — همان نمایهٔ
  // مشترک دیکشنری/WOTD/فلش‌کارت (تسک‌های ۲۰۳/۲۰۴)؛ یک‌بار روی همهٔ درس‌ها
  const pairIndex = useMemo(() => buildSynAntIndex(lessons), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lesson.vocabulary.filter((w) => {
      if (q && !w.en.toLowerCase().includes(q) && !w.fa.includes(query.trim())) return false;
      if (filter === "all") return true;
      const isKnown = mounted && !!known[wordKey(lesson.id, w.en)];
      return filter === "known" ? isKnown : !isKnown;
    });
  }, [lesson, query, filter, known, mounted]);

  if (flashMode) {
    return <Flashcards lesson={lesson} onExit={() => setFlashMode(false)} startSmart={startSmart} />;
  }

  const knownCount = lesson.vocabulary.filter((w) => mounted && known[wordKey(lesson.id, w.en)]).length;

  const filterBtn = (f: Filter, label: string, count: number, active: boolean) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-[background-color,color,border-color,box-shadow] ${
        active ? `${t.bg} text-white shadow-sm` : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در واژگان (فارسی یا انگلیسی)..."
            className="w-full rounded-xl border c-card py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-600"
              aria-label="پاک کردن جستجو"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFlashMode(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-[background-color,color,border-color,transform] hover:bg-emerald-100 active:scale-[0.96]"
        >
          <Layers size={16} />
          حالت فلش‌کارت
        </button>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filterBtn("all", "همه", lesson.vocabulary.length, filter === "all")}
        {filterBtn("known", "بلدم", knownCount, filter === "known")}
        {filterBtn("unknown", "یاد نگرفته", lesson.vocabulary.length - knownCount, filter === "unknown")}
        <span className="mr-auto hidden text-[11px] text-stone-500 sm:block">
          روی هر واژه کلیک کنید تا «بلدم» علامت بخورد
        </span>
      </div>

      {/* grid */}
      <div className="grid max-h-[62vh] gap-2.5 overflow-y-auto pl-1 nice-scroll sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((w, i) => {
          const isKnown = mounted && !!known[wordKey(lesson.id, w.en)];
          const wKey = wordKey(lesson.id, w.en);
          const isStarred = mounted && starredWords.includes(wKey);
          return (
            <motion.div
              key={w.en}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.012, 0.3) }}
              role="button"
              tabIndex={0}
              aria-pressed={isKnown}
              // راند ۲۵۳ — نامِ دسترس‌پذیریِ صریح: تا امروز نامِ کارت دیوارِ
              // متنِ کلِ محتوایش بود (واژه + جفت‌ها + چیپ‌ها) و با آمدنِ چیپِ
              // «در جزوه» با دکمهٔ تبِ «جزوه» تصادم گرفت — و برایِ صفحه‌خوان
              // هم همیشه یک دیوارِ بی‌شکل بود؛ حالا یک کنشِ تمیز اعلام می‌کند.
              aria-label={isKnown ? `${w.en} — بلدم؛ کلیک: برداشتنِ علامت` : `${w.en} — کلیک: بلدم‌کردن`}
              onClick={() => toggleKnown(wKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleKnown(wKey);
                }
              }}
              className={`group flex items-start justify-between gap-2 rounded-xl border p-3 text-right transition-[background-color,color,border-color,box-shadow,transform] active:scale-[0.96] ${
                isKnown
                  ? `${t.border} ${t.bgSoft}`
                  : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
              }`}
              title={isKnown ? "علامت‌زده به عنوان بلد" : "کلیک: بلدم"}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className={`en-text text-[15px] font-bold ${isKnown ? t.text : "text-stone-800"}`} dir="ltr">
                    {w.en}
                  </span>
                  {w.pos && (
                    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                      {posLabel[w.pos] ?? w.pos}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStarred(wKey);
                    }}
                    title={isStarred ? "حذف از واژه‌های من" : "افزودن به واژه‌های من"}
                    aria-label={isStarred ? `حذف ${w.en} از واژه‌های من` : `افزودن ${w.en} به واژه‌های من`}
                    aria-pressed={isStarred}
                    className={`rounded-md p-0.5 transition-[background-color,color,border-color,transform] hover:scale-110 active:scale-[0.96] ${
                      isStarred ? "text-amber-400" : "text-stone-300 hover:text-amber-400"
                    }`}
                  >
                    <Star size={14} className={isStarred ? "fill-amber-400" : ""} />
                  </button>
                </div>
                <div className="mt-1 text-[13px] leading-6 text-stone-600">{w.fa}</div>
                {(() => {
                  const pairs = synAntPairsFor(pairIndex, w.en);
                  if (pairs.length === 0) return null;
                  return (
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {pairs.slice(0, 3).map((p) => (
                        <button
                          key={`${p.kind}-${p.other}-${p.lessonId}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // کارت کلیکِ خودش را دارد: بلدم‌کردن
                            void speak(p.other, 0.95);
                          }}
                          title="روخوانی جفت"
                          aria-label={`${p.kind === "syn" ? "مترادف" : "متضاد"}ِ ${w.en}: ${p.other} — روخوانی`}
                          className={`dict-pair-chip inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10.5px] font-bold transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                            p.kind === "syn"
                              ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
                              : "border-rose-200 bg-rose-50/60 text-rose-700"
                          }`}
                        >
                          <span aria-hidden className="font-black">{p.kind === "syn" ? "≈" : "↔"}</span>
                          <span dir="ltr">{p.other}</span>
                        </button>
                      ))}
                      {pairs.length > 3 && (
                        <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10.5px] font-bold text-stone-500">
                          +{faNum(pairs.length - 3)}
                        </span>
                      )}
                    </div>
                  );
                })()}
                {(() => {
                  // راند ۲۵۳ — چیپِ «در جزوه» رویِ کارتِ واژگانِ درس: این واژه
                  // کجای مکالمه/ریدینگِ جزوه آمده؟ فقط با تطبیقِ واقعی —
                  // بی‌کاربرد، هیچ (صداقتِ همیشگیِ r252). stopPropagation:
                  // کارتِ کلیکِ خودش را دارد (بلدم‌کردن) — همان قراردادِ
                  // چیپِ جفت و ستاره.
                  const sites = mounted ? findWordUsages(w.en) : [];
                  if (sites.length === 0) return null;
                  return (
                    <button
                      type="button"
                      data-testid={`usage-chip-${w.en.replace(/\s+/g, "-")}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setUsage({ en: w.en, sites });
                      }}
                      title="کاربرد این واژه در مکالمه‌ها و ریدینگ‌های جزوه"
                      aria-label={`کاربرد ${w.en} در مکالمه‌ها و ریدینگ‌ها — ${faNum(sites.length)} مورد`}
                      className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50/60 px-1.5 py-0.5 text-[10.5px] font-bold text-sky-700 transition-[background-color,color,border-color,transform] active:scale-[0.96]"
                    >
                      <BookOpenText size={11} aria-hidden />
                      در جزوه · {faNum(sites.length)}
                    </button>
                  );
                })()}
              </div>
              {isKnown ? (
                <CheckCircle2 size={17} className={`shrink-0 ${t.text}`} />
              ) : (
                <Circle size={17} className="shrink-0 text-stone-300 group-hover:text-stone-500" />
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
            واژه‌ای یافت نشد
          </div>
        )}
      </div>

      <LinkedWordFamilies lesson={lesson} />

      {/* راند ۲۵۳ — دیالوگِ مشترکِ «کاربرد در جزوه» (تک‌منبع با دیکشنری و فلش‌کارت) */}
      <WordUsageDialog target={usage} onClose={() => setUsage(null)} />
    </div>
  );
}

/** خانوادهٔ واژه‌های مرتبط از جزوه (راند ۲۲۳ — بندِ ① نقشهٔ ۲۲۲، ادامهٔ
 * حرفِ کاربرِ «به درس‌های مرتبط در برنامه اضافه کنی» برای لایهٔ واژگان):
 * جدولِ «اجزای کلماتی» که خودِ جزوهٔ جامعِ همین پایه برای همین درس آورده
 * («به ترتیبِ درس» — درسِ Nامِ هر پایه، جدولِ «درس Nام» همان پایه).
 * همان کارتِ ضمیمه با دکمهٔ تلفظِ همهٔ ستون‌های انگلیسی (بندِ ②).
 * راند ۲۲۴ — نیمهٔ رفتِ رفت‌وبرگشت: دکمهٔ ↗ (الگویِ دو-دکمه‌ایِ TopicCardِ
 * راند ۲۲۱ — toggle و پرش توأمان دکمه‌اند، تو‌در‌توسبادی مجاز نیست) همان
 * جدول را در «ضمیمه ← اجزای کلام» با لنگرِ اسکرول باز می‌کند.
 * پیش‌فرضِ بسته — درسِ سبک می‌ماند (الگویِ LinkedBookletTopics راند ۲۲۰).
 * درس‌های بی‌جدول (۱۰-۱۲ جزوهٔ جامع ندارند) اصلاً این بخش را نمی‌بینند. */
function LinkedWordFamilies({ lesson }: { lesson: LessonData }) {
  const [open, setOpen] = useState(false);
  const openAppendixPosTable = useStudy((s) => s.openAppendixPosTable);
  const table = WORD_FAMILY_LESSON_LINKS[lesson.id];
  if (!table) return null;
  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200 c-card dark:border-violet-900">
      {/* هدرِ دو-دکمه‌ای (r224) — toggle و ↗ هر دو دکمه‌اند؛ تو‌در‌توسبادی مجاز نیست */}
      <div className="flex w-full items-center gap-1 border-b border-violet-200 bg-violet-50/70 px-2 py-2 dark:border-violet-900 dark:bg-violet-950/40">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2.5 py-1 text-right transition-[background-color,color,border-color,box-shadow] hover:bg-violet-100/70 dark:hover:bg-violet-900/40"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
            <Users size={15} />
          </span>
          <span className="min-w-0 flex-1 text-[15px] font-extrabold text-stone-800 dark:text-stone-100">
            خانوادهٔ واژه‌های مرتبط از جزوه
          </span>
          <span className="shrink-0 rounded-lg bg-violet-100 px-2 py-0.5 text-[11.5px] font-extrabold text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
            {faNum(table.families.length)} خانواده
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-stone-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={() => openAppendixPosTable(wordFamilyTableId(table))}
          aria-label={`نمایشِ «اجزای کلماتیِ ${table.lesson}» در ضمیمه`}
          title="همان جدول در ضمیمه — اجزای کلام"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-violet-100 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/70"
        >
          <ExternalLink size={14} />
        </button>
      </div>
      {open && (
        <div className="space-y-3 p-3">
          <p className="rounded-lg bg-stone-50 px-3 py-2 text-[12.5px] leading-6 text-stone-600 dark:bg-stone-800/70 dark:text-stone-300">
            خانوادهٔ واژه‌های «{table.lesson}» از خودِ جزوهٔ جامعِ پایهٔ {lesson.grade}
            — قید، صفت، فعل و اسمِ کنارِ هم، عینِ جدولِ «اجزای کلماتیِ» جزوه.
            دکمهٔ بلندگو کنارِ هر واژه آن را می‌خوانَد؛ دکمهٔ ↗ همان جدول را با
            لنگر در ضمیمه باز می‌کند — نسخهٔ کاملِ هر سه پایه: «ضمیمه ← اجزای کلام».
          </p>
          <WordFamilyTableCard table={table} />
        </div>
      )}
    </section>
  );
}
