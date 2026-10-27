"use client";

// ---------------------------------------------------------------------
// درسنامهٔ جامع — زیرتابِ پنجمِ ضمیمه (راند ۲۱۴)
// منبع: src/data/booklet-grammar.ts — «مرور گرامرهای پایهٔ هفتم تا نهم»
// جزوهٔ جامع پایهٔ دهم (صفحات ۲۲-۳۶)، همان‌طور که هست ترمیم‌شده و بدونِ
// نامِ مؤلف/ناشر. تعامل: آکاردئونِ موضوع‌ها، جدول‌ها، مثال‌های شنیداری و
// آزمونکِ خودِ جزوه (تودوزنیِ محلی — هیچ نوشتنی در استورِ یادگیری نیست).
// ---------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Blocks,
  BookOpenCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FoldVertical,
  GraduationCap,
  Keyboard,
  Lightbulb,
  ListOrdered,
  ListTree,
  MoveLeft,
  PencilLine,
  RotateCcw,
  Table2,
  UnfoldVertical,
} from "lucide-react";
import SpeakButton from "@/components/study/shared/speak-button";
import AppendixDrillView, { type DrillViewSpec } from "./appendix-drill-view"; // r406 — بانکِ پنجمِ نمایِ مشترک
import useDrillDueBases from "./use-drill-due"; // r414 — سررسیدهایِ SRSِ بانکِ درسنامه
import DrillStatChip from "./drill-stat-chip"; // r413 — چیپِ مشترکِ پیشرفتِ تمرین کنارِ دکمهٔ ورود
import { buildBgExampleDrillSession } from "@/lib/appendix-bg-example-drill";
import { drillLabelFor } from "@/lib/drill-label-atlas"; // r420 — اطلسِ برچسب (مالکِ یگانه)
import { DRILL_SIZE } from "@/lib/appendix-drill";
import {
  BG_TOPIC_TO_LESSON,
  BOOKLET_GRAMMAR_SOURCES,
  BOOKLET_GRAMMAR_TOPICS,
  type BgTopic,
} from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";
import { writeBgLastTopic } from "@/lib/bg-reading";
import { faNum } from "@/lib/study-theme";

// راند ۲۳۱ — جایگاهِ خواندنِ پایدار (بندِ ① پیشنهادِ ۲۲۸): مجموعهٔ موضوع‌های
// باز در localStorage فقط برایِ این UI ذخیره می‌شود — چیپِ توپُرِ فهرستِ پرش
// بینِ نشست‌ها می‌ماند و «باز/بستنِ همه» هم یک انتخابِ ماندگار است؛ هیچ
// نوشتنی در استورِ یادگیری نیست. localStorage مثلِ یک storeِ خارجیِ واقعی
// خوانده/نوشته می‌شود (useSyncExternalStore — ایدئومِ useMountedِ خودِ پروژه):
// بدونِ setState-in-effect و بدونِ mismatchِ هیدریشن (snapshotsِ سرور/کلاینت).
const BG_OPEN_TOPICS_KEY = "vision2-bg-open-topics";

const BG_DEFAULT_OPEN: Set<string> = new Set([BOOKLET_GRAMMAR_TOPICS[0].id]);

let bgLastRaw: string | null;
let bgCache: Set<string> = BG_DEFAULT_OPEN;
const bgListeners = new Set<() => void>();

/** snapshotِ کلاینت — با cacheِ مبتنی بر رشتهٔ خام (پایدار برایِ React) */
const bgSnapshot = (): Set<string> => {
  if (typeof window === "undefined") return bgCache;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(BG_OPEN_TOPICS_KEY);
  } catch {
    raw = null;
  }
  if (raw === bgLastRaw) return bgCache;
  bgLastRaw = raw;
  if (raw === null) {
    // هرگز بازدیدنشده یا JSONِ خراب — پیش‌فرضِ موضوعِ ۱ (انتخابِ کاربر نیست)
    bgCache = new Set(BG_DEFAULT_OPEN);
    return bgCache;
  }
  try {
    const ids: unknown = JSON.parse(raw);
    bgCache = Array.isArray(ids)
      ? new Set(
          ids.filter(
            (id): id is string =>
              typeof id === "string" && BOOKLET_GRAMMAR_TOPICS.some((t) => t.id === id),
          ),
        )
      : new Set(BG_DEFAULT_OPEN);
  } catch {
    bgCache = new Set(BG_DEFAULT_OPEN);
  }
  return bgCache;
};

/** snapshotِ سرور/هیدریشن — همیشه پیش‌فرض؛ مجموعهٔ واقعی بعد از مونت می‌آید */
const bgServerSnapshot = (): Set<string> => BG_DEFAULT_OPEN;

const subscribeBg = (cb: () => void) => {
  bgListeners.add(cb);
  return () => {
    bgListeners.delete(cb);
  };
};

/** نوشتن = localStorage + cache + اطلاع به مشترکین — همگامِ بی‌واسطه */
const writeBgOpen = (next: Set<string>) => {
  bgCache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(BG_OPEN_TOPICS_KEY, JSON.stringify([...next]));
      bgLastRaw = window.localStorage.getItem(BG_OPEN_TOPICS_KEY);
    } catch {
      /* حافظه در دسترس نیست — UI محلی می‌ماند */
    }
  }
  bgListeners.forEach((l) => l());
};

/** ترتیبِ سرگروه‌ها + عنوانِ هر جزوهٔ مبدأ */
const SOURCE_ORDER: ("دهم" | "یازدهم" | "دوازدهم")[] = ["دهم", "یازدهم", "دوازدهم"];

// r406 — بانکِ پنجمِ نمایِ مشترکِ دریل: مثالهایِ ترجمه‌دارِ درسنامه —
// شمارشِ صادق از خودِ داده (هر فیلدی که جزوه داده) — هیچ دستیِ نویسی
const BG_EXAMPLE_TOTAL = BOOKLET_GRAMMAR_TOPICS.reduce(
  (n, t) => n + (t.examples?.length ?? 0),
  0,
);
const BG_EXAMPLE_DRILL_SPEC: DrillViewSpec = {
  id: "bg-examples",
  title: "تمرین مثال‌های درسنامهٔ جامع",
  intro: (
    <>
      {faNum(DRILL_SIZE)} پرسش از {faNum(BG_EXAMPLE_TOTAL)} مثالِ{" "}
      {faNum(BOOKLET_GRAMMAR_TOPICS.length)} درسنامه: ترجمه، یافتنِ جملهٔ انگلیسی و تشخیصِ
      موضوع. گزینه‌ها همگی از خودِ مثال‌های جزوه میآیند — نه ساختهٔ ماشینی؛ و اگر چیزی
      اشتباه بماند، همان‌ها دوباره پرسیده میشوند.
    </>
  ),
  startAria: "شروع جلسهٔ تمرین مثال",
  exitLabel: "درسنامهٔ جامع",
  exitAria: "بازگشت به درسنامهٔ جامع",
  exitResultAria: "بازگشت به درسنامهٔ جامع از نتیجه",
  cancelAria: "انصراف از تمرین مثال",
};

function TopicTables({ topic }: { topic: BgTopic }) {
  if (!topic.tables?.length) return null;
  return (
    <div className="space-y-3">
      {topic.tables.map((t, ti) => (
        <div
          key={ti}
          className="max-h-[40vh] overflow-auto rounded-xl border border-stone-200 nice-scroll"
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-violet-600 text-white">
                {t.headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`border-t border-stone-100 px-3 py-2 leading-7 ${
                        /[A-Za-z]/.test(cell.charAt(0))
                          ? "dir-ltr text-left text-slate-800"
                          : "text-stone-700"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default function BookletGrammarView({
  focusTopicId,
  onFocusDone,
  focusExampleEn,
  onExampleFocusDone,
}: {
  /** لنگرِ عمیق (راند ۲۲۱) — موضوعی که باید باز و در دید باشد (از ضمیمه با
   * openAppendixTopic می‌آید)؛ نامعتبر باشد نادیده گرفته می‌شود. */
  focusTopicId?: string;
  /** یک‌بارِ مصرف — پس از نخستین تلاشِ اسکرول صدا زده می‌شود تا والد لنگر را پاک کند. */
  onFocusDone?: () => void;
  /** r431 — عمقِ سطریِ مثال (الگویِ سطرِ فعلِ r234/سطرِ خانوادهٔ r428): خودِ
   * جملهٔ مثال — سطرش در موضوعِ لنگرخورده با پالسِ زمردی در دید باز میشود؛
   * جملهٔ بیگانه با مثالهایِ موضوع ساکتِ صادق میماند (r236). */
  focusExampleEn?: string;
  /** r431 — یک‌بارِ مصرفِ لنگرِ مثال — پسِ نخستین تلاشِ اسکرول (موفق یا
   * ناکام) تا پرشِ دوبارهٔ همان جمله پالسِ تازه بزند (ایدئومِ r427). */
  onExampleFocusDone?: () => void;
}) {
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const validFocus =
    focusTopicId && BOOKLET_GRAMMAR_TOPICS.some((t) => t.id === focusTopicId);

  // راند ۲۳۱ — مجموعهٔ پایدار از localStorage (storeِ خارجی) + ادغامِ لنگرِ
  // عمیقِ در-مسیر (session-scope): پرشِ عمیق همیشه باز می‌ماند حتی اگر در
  // مجموعهٔ ذخیره‌شده نباشد. بعد از مونت، snapshotِ واقعی جایگزین می‌شود.
  const baseOpen = useSyncExternalStore(subscribeBg, bgSnapshot, bgServerSnapshot);
  const open = useMemo(
    () =>
      validFocus && focusTopicId ? new Set(baseOpen).add(focusTopicId) : baseOpen,
    [baseOpen, validFocus, focusTopicId],
  );

  // اسکرولِ تمرکزِ لنگر (راند ۲۲۱) — یک‌بارِ مصرف؛ jsdom scrollIntoView ندارد
  // (فراخوانِ اختیاری) و والد هم بعدش لنگر را پاک می‌کند تا پرش تکرار نشود.
  useEffect(() => {
    if (!validFocus) {
      if (focusTopicId) onFocusDone?.();
      return;
    }
    const raf = requestAnimationFrame(() => {
      // راند ۲۳۳ — رسیدن با لنگرِ عمیق هم «دیدن» است؛ نشانگر ثبت می‌شود
      const topic = BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === focusTopicId);
      if (topic) writeBgLastTopic(topic);
      // r431 — بازشدنِ پرشی ماندگار میشود (عینِ navigateToTopicِ r226):
      // پیشتر پسِ مصرفِ لنگر، آکاردئون میخوابید و فرودِ عمیق محو بود؛
      // سطرِ مثالِ پالس‌دار (r431) هم به همین ماندگاری تکیه دارد.
      writeBgOpen(new Set(open).add(focusTopicId));
      document
        .getElementById(`bg-topic-${focusTopicId}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      onFocusDone?.();
    });
    return () => cancelAnimationFrame(raf);
    // عمداً فقط به لنگر وابسته است — onFocusDone/validFocus در هر رندرِ والد نوسازند
  }, [focusTopicId, validFocus, onFocusDone]);

  // r431 — لنگرِ عمیقِ سطرِ مثال (الگویِ کارتِ واژهٔ r427): اسکرولِ محلی به
  // سطرِ مثال + پالسِ زمردیِ ۱٫۶ثانیهای؛ گاردِ عضویتِ نهایی اینجاست — جملهٔ
  // بیگانه با مثالهایِ موضوعِ لنگرخورده ساکتِ صادق میماند (r236). پالس در
  // stateِ محلی زندگی میکند تا مصرفِ لنگرِ موضوع آن را نکُشد؛ پرشِ دوبارهٔ
  // همان جمله هم پالسِ تازه میزند (لنگر پسِ نخستین تلاشِ اسکرول مصرف میشود).
  const [pulseExample, setPulseExample] = useState<{ topicId: string; en: string } | null>(null);
  const pulseTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!validFocus || !focusTopicId || !focusExampleEn) return;
    const topic = BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === focusTopicId);
    const idx = topic?.examples?.findIndex((ex) => ex.en === focusExampleEn) ?? -1;
    if (!topic || idx < 0) {
      onExampleFocusDone?.();
      return;
    }
    // r431 — پالس/اسکرول/مصرف در «یک تایمرِ مستقلِ بدونِ cleanup». درسِ
    // diagnosedِ این راند: بازشدنِ ماندگارِ موضوع (writeBgOpen در rAFِ اثرِ
    // موضوع) یک رندرِ همگامِ useSyncExternalStore میسازد که rAFِ همین اثر
    // را «پیشِ آتش» لغو کرد و پالس هرگز روشن نمیشد (شاهدِ زنده: dbg کامل،
    // rafFired هرگز). تایمرِ مستقل از هر رندر جان میبرد؛ سطر از نخستین
    // رندر در DOM است (بخشِ پرشی باز است) و re-runِ بعدیِ اثر با گاردِ
    // لنگرِ خالی مسیرِ دومی نمیگذارد — ایدئومِ یکبارِ مصرفِ r427 با جانِ تازه.
    window.setTimeout(() => {
      setPulseExample({ topicId: topic.id, en: focusExampleEn });
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(() => {
        pulseTimerRef.current = null;
        setPulseExample(null);
      }, 1600);
      document
        .getElementById(`bg-ex-${topic.id}-${idx}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      onExampleFocusDone?.();
    }, 0);
    // عمداً فقط به لنگرها وابسته است — onExampleFocusDone در هر رندرِ والد نوساز است
  }, [focusTopicId, focusExampleEn, validFocus]);
  // خاموشیِ پالس هنگامِ پیادهشدن از زیرتاب — فقط unmount؛ با راهاندازیِ مجددِ پالس تداخلی ندارد
  useEffect(
    () => () => {
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    },
    [],
  );

  // toggle روی مجموعهٔ ادغام‌شده کار می‌کند — بستنِ موضوعِ متمرکزِ لنگر هم
  // درست کار می‌کند و نتیجه یک‌جا ذخیره می‌شود (راند ۲۳۱).
  // راند ۲۳۳ — بازکردنِ یک موضوع = «آخرین موضوعِ دیده‌شده» (سوختِ «ادامهٔ
  // مطالعه» روی کارتِ ضمیمهٔ خانه)؛ بستن نشانگر را عوض نمی‌کند.
  const toggle = (id: string) => {
    const next = new Set(open);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      const topic = BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === id);
      if (topic) writeBgLastTopic(topic);
    }
    writeBgOpen(next);
  };

  // راند ۲۲۷ — باز/بستنِ همهٔ موضوع‌ها (بندِ ② پیشنهادِ ۲۲۶ — اکشنِ صریحِ
  // مطالعهٔ سراسری): بازکردنِ همه = کلِ بانکِ ۳۲تایی در یک نگاه؛ بستنِ همه
  // حتیِ موضوعِ اولِ پیش‌باز را هم می‌بندد. راند ۲۳۱: هر دو انتخاب ماندگارند.
  const openAll = () => writeBgOpen(new Set(BOOKLET_GRAMMAR_TOPICS.map((t) => t.id)));
  const closeAll = () => writeBgOpen(new Set());

  // ناوبریِ پیوسته (راند ۲۲۶) — «قبلی/بعدی» داخلِ کارت: موضوعِ هدف را در
  // مجموعهٔ بازها می‌گذارد و با rAF به لنگرش می‌رود — کاملاً محلی، بدونِ
  // چرخشِ استور (ضمیمه از قبل مونت است و لنگرِ prop یک‌بارِ مصرف است).
  const navigateToTopic = (id: string) => {
    // راند ۲۳۳ — پرش (چیپِ فهرست یا قبلی/بعدی) هم «آخرین موضوعِ دیده‌شده» است
    const topic = BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === id);
    if (topic) writeBgLastTopic(topic);
    writeBgOpen(new Set(open).add(id));
    requestAnimationFrame(() => {
      document
        .getElementById(`bg-topic-${id}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  };

  // راند ۲۲۸ — فهرستِ پرش (بندِ ② پیشنهادِ ۲۲۷): پنلِ «برو به هر موضوع…»
  // کنارِ باز/بستنِ همه — چیپِ هر موضوع با شمارهٔ سراسری و نشانِ باز/بسته؛
  // کلیک = همان navigateToTopicِ محلی (بازکردنِ هدف + اسکرول) + بستنِ پنل.
  const [jumpOpen, setJumpOpen] = useState(false);

  // r406 — حالتِ تمرینِ مثالها؛ فقط با کلیکِ کاربر روشن میشود (لنگرِ عمیقِ
  // topicId همیشه آکاردئون را میآورد — drill هرگز رویِ دیپلینک بالا نمیآید،
  // همان قراردادِ r234/r403/r404/r405).
  const [exampleDrill, setExampleDrill] = useState(false);

  // r414 — سررسیدهایِ SRSِ بانکِ مثالهایِ درسنامه — فهرستِ اولویتدار برایِ سهمیهٔ موتور
  const bgExamplesDue = useDrillDueBases("bg-examples");

  // r418 — مالکِ برچسبِ پایه (r403): جملهٔ انگلیسی → ترجمهٔ خودِ مثال؛
  // موضوعِ (گونهٔ topic) → عنوانِ موضوع؛ حلنشده = تهیِ صادق.
  // r420 — این جست‌وجو به اطلسِ برچسب کوچید (مالکِ یگانه — همان
  // تختکنندهٔ خودِ موتور، همان نقشهٔ یکبارساخته؛ دو-نامِ r385 ممنوع)

  // گروه‌بندی بر اساس جزوهٔ مبدأ — راند ۲۱۵ (شماره‌گذاریِ سراسری = جایگاه در آرایه)
  const groups = SOURCE_ORDER.map((src) => ({
    src,
    topics: BOOKLET_GRAMMAR_TOPICS.filter((t) => t.source === src),
  })).filter((g) => g.topics.length > 0);

  // r406 — دریلِ مثالها کلِ بدنهٔ زیرتاب را میگیرد (ایدئومِ r400..r405:
  // سرصفحه و آکاردئون میروند، خروجِ سالم برمیگرداند) — همهٔ هوکها بالا زندهاند
  if (exampleDrill) {
    return (
      <AppendixDrillView
        spec={BG_EXAMPLE_DRILL_SPEC}
        buildSession={() => buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, Math.random, bgExamplesDue)}
        buildMistakeSession={() =>
          buildBgExampleDrillSession(BOOKLET_GRAMMAR_TOPICS, DRILL_SIZE, Math.random, bgExamplesDue, true)
        } // r415 — تمرینِ سررسیدها
        calendarLabel={drillLabelFor("bg-examples")} // r418/r420 — برچسب از اطلس
        onExit={() => setExampleDrill(false)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border c-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold text-stone-800 dark:text-stone-100">
            <BookOpenCheck size={17} className="text-violet-600 dark:text-violet-400" />
            درسنامهٔ جامع — از خودِ جزوه‌های جامع
          </h2>
          {/* راند ۲۲۷ — باز/بستنِ همهٔ موضوع‌ها + راند ۲۲۸ — فهرستِ پرش
              (دکمهٔ پرش بیرونِ گروهِ دودکمه‌ای است — قراردادِ گاردِ r227) */}
          <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1.5" role="group" aria-label="باز و بستن همهٔ موضوع‌ها">
            <button
              type="button"
              onClick={openAll}
              title="همهٔ موضوع‌ها باز می‌شوند"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-violet-700 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-violet-100 dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-900/70"
            >
              <UnfoldVertical size={13} />
              بازکردن همه
            </button>
            <button
              type="button"
              onClick={closeAll}
              title="همهٔ موضوع‌ها بسته می‌شوند"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-stone-600 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-stone-100 dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-900/70"
            >
              <FoldVertical size={13} />
              بستن همه
            </button>
          </div>
          <button
            type="button"
            onClick={() => setJumpOpen((v) => !v)}
            aria-expanded={jumpOpen}
            aria-controls="bg-jump-index"
            title="پرشِ سریع به هر موضوع — با شمارهٔ جایگاه و نشانِ باز/بسته"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-stone-600 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-stone-100 dark:bg-violet-900/40 dark:text-violet-200 dark:hover:bg-violet-900/70"
          >
            <ListTree size={13} />
            فهرست پرش
          </button>
          {/* r406 — دکمهٔ ورودِ دریل (ایدئومِ r239/r403/r404/r405): بنفشِ
              خانوادهٔ تمرین؛ عمقِ لینک هرگز دریل را بالا نمیآورد */}
          <button
            type="button"
            onClick={() => setExampleDrill(true)}
            aria-label="شروع تمرین مثال‌های درسنامه"
            title={`۱۰ پرسش از ${faNum(BG_EXAMPLE_TOTAL)} مثال ترجمه‌دارِ درسنامه‌ها`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[12px] font-extrabold text-white shadow-sm transition-colors hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            <GraduationCap size={13} />
            تمرین مثال‌ها
          </button>
          {/* r413 — پیشرفتِ ماندگارِ بانکِ درسنامه کنارِ دکمهٔ ورود؛ بی‌رکورد هیچ */}
          <DrillStatChip bankId="bg-examples" />
        </div>
          {/* راند ۲۲۸ — پنلِ فهرستِ پرش: ۳۲ چیپ در ۳ گروهِ جزوه — نشانِ توپُر =
              موضوعِ باز، یک نگاه، کلِ نقشهٔ درسنامه؛ کلیک = پرشِ محلی + بستن */}
          {jumpOpen && (
            <div
              id="bg-jump-index"
              role="group"
              aria-label="فهرست پرش موضوع‌های درسنامهٔ جامع"
              className="mt-3 mb-1 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/60"
            >
              {groups.map((g) => (
                <div key={g.src} className="mb-3 last:mb-0">
                  {/* div نه h4 — پنل پیش از نخستین h3 است و قراردادِ outline (P7) پرشِ h2→h4 را نمی‌پذیرد */}
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-extrabold text-stone-500 dark:text-stone-300">
                    <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[11px] font-black text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                      {BOOKLET_GRAMMAR_SOURCES[g.src]}
                    </span>
                    {faNum(g.topics.length)} موضوع
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {g.topics.map((t) => {
                      const gi = BOOKLET_GRAMMAR_TOPICS.indexOf(t);
                      const isOpen = open.has(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            navigateToTopic(t.id);
                            setJumpOpen(false);
                          }}
                          data-open={isOpen}
                          aria-label={`پرش به موضوعِ ${faNum(gi + 1)}: ${t.title}`}
                          title={`${t.page} — ${isOpen ? "باز است" : "بسته است"}`}
                          className="flex min-w-0 items-center gap-2 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-right transition-[background-color,border-color,color,box-shadow] hover:border-violet-300 hover:bg-violet-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-violet-700 dark:hover:bg-violet-900/30"
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black ${
                              isOpen
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            }`}
                          >
                            {faNum(gi + 1)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-stone-700 dark:text-stone-200">
                            {t.title}
                          </span>
                          <ChevronLeft size={13} className="shrink-0 text-stone-300 dark:text-stone-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-7 text-stone-600 dark:text-stone-300">
          {faNum(BOOKLET_GRAMMAR_TOPICS.length)} موضوع در {faNum(groups.length)} جزوه:
          قاعده‌ها، نکته‌ها، جدول‌ها و مثال‌های ترجمه‌دار — دقیقاً همان‌طور که جزوه‌ها
          تدریس کرده‌اند. مثال‌های انگلیسی را می‌شنوی، آزمونکِ هر موضوع کلیدِ خودش را
          دارد، تمرینِ تایپیِ بخش‌های تولیدی بررسی می‌شود و جمله‌سازیِ کلیک‌کردنیِ
          آزمون‌های تشخیصی هم با جملهٔ کلیدِ خودِ جزوه سنجیده می‌شود.
          پایهٔ دهم بنیان‌های هفتم تا نهم را مرور می‌کند و پایه‌های یازدهم
          و دوازدهم درسنامه‌های درس‌های خودشان را.
        </p>
      </div>

      {groups.map((g) => (
        <section key={g.src} className="space-y-3">
          <h3 className="flex items-center gap-2 px-1 text-[13px] font-extrabold text-violet-700 dark:text-violet-300">
            <span className="inline-flex h-6 items-center rounded-lg bg-violet-100 px-2 dark:bg-violet-900/50">
              {BOOKLET_GRAMMAR_SOURCES[g.src]}
            </span>
            <span className="text-stone-500">{faNum(g.topics.length)} موضوع</span>
          </h3>
          {g.topics.map((topic) => {
            const gi = BOOKLET_GRAMMAR_TOPICS.indexOf(topic);
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={gi + 1}
                isOpen={open.has(topic.id)}
                onToggle={toggle}
                relatedLesson={BG_TOPIC_TO_LESSON[topic.id]}
                onOpenLesson={
                  BG_TOPIC_TO_LESSON[topic.id] !== undefined
                    ? () => openLessonTab(BG_TOPIC_TO_LESSON[topic.id], "grammar")
                    : undefined
                }
                prevTopic={
                  gi > 0
                    ? { id: BOOKLET_GRAMMAR_TOPICS[gi - 1].id, title: BOOKLET_GRAMMAR_TOPICS[gi - 1].title }
                    : undefined
                }
                nextTopic={
                  gi < BOOKLET_GRAMMAR_TOPICS.length - 1
                    ? { id: BOOKLET_GRAMMAR_TOPICS[gi + 1].id, title: BOOKLET_GRAMMAR_TOPICS[gi + 1].title }
                    : undefined
                }
                onNavigateTopic={navigateToTopic}
                totalCount={BOOKLET_GRAMMAR_TOPICS.length}
                pulseExampleEn={pulseExample?.topicId === topic.id ? pulseExample.en : undefined} // r431 — پالسِ سطرِ مثال فقط به موضوعِ خودش میرسد
              />
            );
          })}
        </section>
      ))}
    </div>
  );
}

/** کارتِ آکاردئونیِ موضوع — هم در زیرتابِ «درسنامهٔ جامع» و هم در تبِ گرامرِ
 * هر درس (پیوندِ درسنامه ↔ درس، راند ۲۲۰) مصرف می‌شود. رفت‌وبرگشتِ راند ۲۲۱:
 * onOpenInAppendix (از درس → ضمیمه با لنگرِ موضوع) و relatedLesson + onOpenLesson
 * (از ضمیمه → درسِ مرتبط) — هردو اختیاری و بستگی به بسترِ میزبان دارند.
 * راند ۲۲۶ — ناوبریِ پیوسته: prevTopic/nextTopic/onNavigateTopic/totalCount
 * فقط در بسترِ ضمیمه پر می‌شوند (مطالعهٔ پیوستهٔ ۳۲ موضوع با جایگاهِ «X از Y»);
 * درس‌ها کارتِ تک‌پیوندیِ خودشان را بدونِ نوارِ ناوبری می‌بینند. */
export function TopicCard({
  topic,
  index,
  isOpen,
  onToggle,
  relatedLesson,
  onOpenLesson,
  onOpenInAppendix,
  prevTopic,
  nextTopic,
  onNavigateTopic,
  totalCount,
  pulseExampleEn,
}: {
  topic: BgTopic;
  index: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
  /** درسِ مرتبط از BG_TOPIC_TO_LESSON — نبودش = بی‌چیپ (بنیان‌های دهم). */
  relatedLesson?: number;
  onOpenLesson?: () => void;
  onOpenInAppendix?: () => void;
  /** ناوبریِ پیوسته (r226) — همسایه‌هایِ ترتیبِ سراسریِ آرایه؛ فقط ضمیمه. */
  prevTopic?: { id: string; title: string };
  nextTopic?: { id: string; title: string };
  onNavigateTopic?: (id: string) => void;
  totalCount?: number;
  /** r431 — جملهٔ پالس‌دارِ این موضوع (فقط از BookletGrammarView با موضوعِ
   * خودِ پالس میآید)؛ undefined = هیچ سطری پالس ندارد. */
  pulseExampleEn?: string;
}) {
  return (
    // لنگرِ اسکرولِ عمیق (r221) — scroll-mt برای فاصلهٔ هدرِ چسبان
    <div id={`bg-topic-${topic.id}`} className="scroll-mt-24 rounded-2xl border c-card overflow-hidden">
      {/* هدرِ دو-دکمه‌ای — toggle و ↗ هر دو دکمه‌اند؛ تو‌در‌توسبادی مجاز نیست */}
      <div className="flex w-full items-center gap-1 py-2 pl-2 pr-2.5">
        <button
          onClick={() => onToggle(topic.id)}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-1.5 text-right transition-[background-color,color,border-color,box-shadow] hover:bg-stone-50 dark:hover:bg-stone-800/60"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-[13px] font-extrabold text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
            {faNum(index)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold text-stone-800 dark:text-stone-100">
              {topic.title}
              {topic.titleEn && (
                <span className="mr-2 text-[12px] font-bold text-stone-500" dir="ltr">
                  {topic.titleEn}
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-[12px] font-bold text-violet-600 dark:text-violet-400">
              {topic.page}
            </span>
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-stone-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {onOpenInAppendix && (
          <button
            onClick={onOpenInAppendix}
            aria-label={`نمایشِ «${topic.title}» در ضمیمه`}
            title="همان موضوع در ضمیمه — درسنامهٔ جامع"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-violet-100 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/70"
          >
            <ExternalLink size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-4 border-t border-stone-100 px-4 py-4 dark:border-stone-700">
          {relatedLesson !== undefined && onOpenLesson && (
            <button
              onClick={onOpenLesson}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-2.5 py-1.5 text-[12px] font-extrabold text-violet-700 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-900/70"
            >
              <GraduationCap size={14} />
              درسِ مرتبط: درسِ {faNum(relatedLesson)}
            </button>
          )}
          {topic.intro && (
            <p className="text-[14px] leading-8 text-stone-700 dark:text-stone-300">
              {topic.intro}
            </p>
          )}

          {topic.orderStrip && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <h4 className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-amber-800 dark:text-amber-300">
                <ListOrdered size={15} />
                ترتیب اجزای جمله در جملات مثبت
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {topic.orderStrip.map((part, pi) => (
                  <span key={part} className="flex items-center gap-1.5">
                    <span className="rounded-lg bg-white px-2.5 py-1 text-[12px] font-extrabold text-amber-900 shadow-sm dark:bg-amber-900/50 dark:text-amber-200">
                      {part}
                    </span>
                    {pi < topic.orderStrip!.length - 1 && (
                      <MoveLeft size={13} className="text-amber-600 dark:text-amber-400" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {topic.notes && topic.notes.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-stone-700 dark:text-stone-200">
                <Lightbulb size={15} className="text-amber-500" />
                نکته‌ها و قاعده‌ها ({faNum(topic.notes.length)})
              </h4>
              <ul className="space-y-1.5">
                {topic.notes.map((n, ni) => (
                  <li
                    key={ni}
                    className="rounded-lg border-r-4 border-amber-400 bg-stone-50 px-3 py-2 text-[13px] leading-7 text-stone-700 dark:border-amber-600 dark:bg-stone-800/70 dark:text-stone-300"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.tables && topic.tables.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-stone-700 dark:text-stone-200">
                <Table2 size={15} className="text-violet-500" />
                جدول‌ها ({faNum(topic.tables.length)})
              </h4>
              <TopicTables topic={topic} />
            </div>
          )}

          {topic.examples && topic.examples.length > 0 && (
            <div>
              <h4 className="mb-2 text-[13px] font-extrabold text-stone-700 dark:text-stone-200">
                مثال‌های خودِ جزوه ({faNum(topic.examples.length)})
              </h4>
              <ul className="space-y-1.5">
                {topic.examples.map((ex, ei) => (
                  <li
                    key={ei}
                    id={`bg-ex-${topic.id}-${ei}`}
                    data-bg-example={ex.en}
                    className={`${
                      // r431 — پالسِ زمردیِ سطرِ مثال (هستهٔ r234؛ قراردادِ
                      // «جایگزین، نه اضافه»: bg-stone-50 و dark:bg-stone-800/70
                      // در شاخهٔ بی‌پالس میمانند تا هیچ همسایهای دزدِ متغیر
                      // یا دزدِ bg نباشد) — شب: dark:shadow-emerald-700.
                      pulseExampleEn === ex.en
                        ? "flex items-start justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 shadow-[inset_0_0_0_2px] shadow-emerald-300 dark:bg-emerald-900/30 dark:shadow-emerald-700 transition-[background-color,box-shadow]"
                        : "flex items-start justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-800/70"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold leading-7 text-slate-800 dark:text-slate-200" dir="ltr">
                        {ex.en}
                      </p>
                      <p className="text-[13px] leading-7 text-stone-600 dark:text-stone-300">
                        {ex.fa}
                        {ex.tag && (
                          <span className="mr-2 rounded-md bg-violet-100 px-1.5 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                            {ex.tag}
                          </span>
                        )}
                      </p>
                    </div>
                    <SpeakButton text={ex.en} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <TopicDrill topic={topic} />
          <TopicTypeDrill topic={topic} />
          <TopicOrderDrill topic={topic} />

          {/* ناوبریِ پیوسته (راند ۲۲۶) — پایانِ بدنه مثلِ صفحه‌خوانیِ کتاب؛
              فقط وقتی میزبان (ضمیمه) همسایه‌ها و callback را داده باشد */}
          {onNavigateTopic && totalCount !== undefined && (prevTopic || nextTopic) && (
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 c-track-70 p-2 dark:border-stone-700 dark:bg-stone-800/50">
              {prevTopic ? (
                <button
                  type="button"
                  onClick={() => onNavigateTopic(prevTopic.id)}
                  aria-label={`موضوعِ قبلی: ${prevTopic.title}`}
                  className="inline-flex min-w-0 flex-1 items-center justify-end gap-1.5 rounded-lg px-2.5 py-2 text-right text-[12px] font-bold text-stone-600 transition-[background-color,color] hover:bg-stone-100 hover:text-stone-800 dark:text-stone-300 dark:hover:bg-stone-700/50 dark:hover:text-stone-100"
                >
                  <ChevronRight size={15} className="shrink-0" />
                  <span className="min-w-0 truncate">قبلی: {prevTopic.title}</span>
                </button>
              ) : (
                <span className="flex-1" />
              )}
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-stone-600 shadow-sm dark:bg-stone-800 dark:text-stone-300">
                {faNum(index)} از {faNum(totalCount)}
              </span>
              {nextTopic ? (
                <button
                  type="button"
                  onClick={() => onNavigateTopic(nextTopic.id)}
                  aria-label={`موضوعِ بعدی: ${nextTopic.title}`}
                  className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-bold text-stone-600 transition-[background-color,color] hover:bg-stone-100 hover:text-stone-800 dark:text-stone-300 dark:hover:bg-stone-700/50 dark:hover:text-stone-100"
                >
                  <span className="min-w-0 truncate">بعدی: {nextTopic.title}</span>
                  <ChevronLeft size={15} className="shrink-0" />
                </button>
              ) : (
                <span className="flex-1" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TopicDrill({ topic }: { topic: BgTopic }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  if (!topic.drill?.length) return null;
  const answered = Object.keys(picks).length;
  const correct = topic.drill.reduce(
    (n, d, i) => n + (picks[i] === d.answer ? 1 : 0),
    0,
  );
  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-900 dark:bg-violet-950/30">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-[13px] font-extrabold text-violet-800 dark:text-violet-300">
          <PencilLine size={15} />
          آزمونکِ خودِ جزوه — {faNum(topic.drill.length)} سؤال
        </h4>
        <div className="flex items-center gap-2">
          {answered > 0 && (
            <span className="text-[12px] font-bold text-violet-700 dark:text-violet-300">
              {faNum(correct)} از {faNum(answered)} درست
            </span>
          )}
          <button
            onClick={() => setPicks({})}
            aria-label="پاک کردن پاسخ‌های آزمونک"
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[12px] font-bold text-violet-700 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-violet-100 dark:bg-violet-900/40 dark:text-violet-200"
          >
            <RotateCcw size={13} />
            از نو
          </button>
        </div>
      </div>
      <ol className="space-y-3">
        {topic.drill.map((d, di) => {
          const pick = picks[di];
          const done = pick !== undefined;
          return (
            <li key={di} className="rounded-lg bg-white p-2.5 shadow-sm dark:bg-stone-900">
              <p className="mb-2 text-[13px] font-bold leading-7 text-stone-800 dark:text-stone-200" dir="auto">
                <span className="text-violet-600 dark:text-violet-400">{faNum(di + 1)}. </span>
                {d.q}
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {d.options.map((opt, oi) => {
                  const isAnswer = oi === d.answer;
                  const isPick = pick === oi;
                  let cls =
                    "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700";
                  if (done && isAnswer) {
                    cls = "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
                  } else if (done && isPick && !isAnswer) {
                    cls = "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200";
                  } else if (done) {
                    cls = "border-stone-200 bg-white text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500";
                  }
                  return (
                    <button
                      key={oi}
                      disabled={done}
                      aria-pressed={done ? isPick : undefined}
                      onClick={() => setPicks((p) => ({ ...p, [di]: oi }))}
                      className={`rounded-lg border px-2 py-1.5 text-[12px] font-bold transition-[background-color,color,border-color,box-shadow] ${cls}`}
                      dir="auto"
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}


/** نرمال‌سازیِ پاسخِ تایپی — فقط حروف بزرگ/کوچک، آپاستروف، فاصله‌های دورِ «/» و فاصله‌های اضافی */
export function normTypeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2019\u2018']/g, "'")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ");
}

/** تمرینِ تایپیِ خودِ جزوه (راند ۲۱۸) — بخش‌های تولیدیِ آزمون‌های تشخیصی:
 * ورودیِ آزاد با کلیدِ عینِ پاسخنامه؛ هیچ نوشتنی در استورِ یادگیری نیست. */
function TopicTypeDrill({ topic }: { topic: BgTopic }) {
  const [vals, setVals] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  if (!topic.typeDrill?.length) return null;
  const answered = Object.keys(checked).length;
  const correct = topic.typeDrill.reduce(
    (n, d, i) => n + (checked[i] && normTypeAnswer(vals[i] ?? "") === normTypeAnswer(d.answer) ? 1 : 0),
    0,
  );
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-[13px] font-extrabold text-amber-800 dark:text-amber-300">
          <Keyboard size={15} />
          تمرینِ تایپیِ خودِ جزوه — {faNum(topic.typeDrill.length)} سؤال
        </h4>
        <div className="flex items-center gap-2">
          {answered > 0 && (
            <span className="text-[12px] font-bold text-amber-700 dark:text-amber-300">
              {faNum(correct)} از {faNum(answered)} درست
            </span>
          )}
          <button
            onClick={() => {
              setVals({});
              setChecked({});
            }}
            aria-label="پاک کردن پاسخ‌های تمرین تایپی"
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[12px] font-bold text-amber-700 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-200"
          >
            <RotateCcw size={13} />
            از نو
          </button>
        </div>
      </div>
      <ol className="space-y-3">
        {topic.typeDrill.map((d, di) => {
          const done = checked[di] === true;
          const isOk = done && normTypeAnswer(vals[di] ?? "") === normTypeAnswer(d.answer);
          const taskChanged = d.task !== undefined && d.task !== topic.typeDrill![di - 1]?.task;
          return (
            <li key={di} className="rounded-lg bg-white p-2.5 shadow-sm dark:bg-stone-900">
              {taskChanged && (
                <p className="mb-1.5 rounded-md bg-amber-100/70 px-2 py-1 text-[11.5px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  {d.task}
                </p>
              )}
              <p className="mb-2 text-[13px] font-bold leading-7 text-stone-800 dark:text-stone-200" dir="auto">
                <span className="text-amber-600 dark:text-amber-400">{faNum(di + 1)}. </span>
                {d.q}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={vals[di] ?? ""}
                  disabled={done}
                  onChange={(e) => setVals((v) => ({ ...v, [di]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !done && (vals[di] ?? "").trim()) {
                      setChecked((c) => ({ ...c, [di]: true }));
                    }
                  }}
                  aria-label={`پاسخ سؤال ${faNum(di + 1)} تمرین تایپی`}
                  className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-[13px] font-bold outline-none transition-[border-color,background-color,box-shadow] focus:ring-2 disabled:opacity-80 ${
                    done
                      ? isOk
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 dark:focus:ring-emerald-800/50"
                        : "border-rose-300 bg-rose-50 text-rose-800 focus:ring-rose-200 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200 dark:focus:ring-rose-800/50"
                      : "border-stone-200 bg-stone-50 text-stone-800 focus:border-amber-400 focus:ring-amber-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/40"
                  }`}
                  dir="ltr"
                />
                {!done && (
                  <button
                    onClick={() => {
                      if ((vals[di] ?? "").trim()) setChecked((c) => ({ ...c, [di]: true }));
                    }}
                    disabled={!(vals[di] ?? "").trim()}
                    aria-label={`بررسی سؤال ${faNum(di + 1)} تمرین تایپی`}
                    className="shrink-0 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-[12px] font-extrabold text-amber-800 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:bg-amber-200 active:scale-[0.96] disabled:opacity-40 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                  >
                    بررسی
                  </button>
                )}
              </div>
              {done && !isOk && (
                <p className="mt-1.5 text-[12px] font-bold text-rose-700 dark:text-rose-300" dir="auto">
                  پاسخِ درست: <span dir="ltr">{d.answer}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** جداکردنِ کاشی‌ها از گروهِ کلماتِ خودِ جزوه («do / much / need / …») — راند ۲۱۹ */
export function buildOrderTiles(q: string): string[] {
  return q
    .split("/")
    .map((w) => w.trim())
    .filter(Boolean);
}

/** نرمال‌سازیِ جملهٔ ساخته‌شده برای سنجش با کلید — حروف کوچک، آپاستروفِ یکسان،
 * بی‌اعتنا به نقطه/علامتِ سؤال/کاما و فاصله‌های اضافی (کلماتِ خودِ جزوه‌اند،
 * غلطِ املایی در میان نیست — ترتیب مهارتِ این تمرین است). */
export function normOrderAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2019\u2018']/g, "'")
    .replace(/[.,!?():;"«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** بُر زدنِ قطعی (deterministic) — همان seed همان ترتیب؛ برای هم‌خوانیِ SSR/کلاینت
 * Math.random در رندر ممنوع است (هیدریشن و خطای lint react-hooks). */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  let a = seed >>> 0;
  const rand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** ترتیبِ کاشی‌های هر سؤال — بُر خورده اما هرگز از قبل برابرِ کلید نیست. */
export function orderTilesFor(itemKey: string, q: string, answer: string): string[] {
  const tiles = buildOrderTiles(q);
  const key = normOrderAnswer(answer);
  let seed = hashSeed(itemKey);
  for (let tries = 0; tries < 8; tries++) {
    const shuffled = seededShuffle(tiles, seed);
    if (normOrderAnswer(shuffled.join(" ")) !== key) return shuffled;
    seed = (seed + 1) >>> 0;
  }
  return seededShuffle(tiles, (hashSeed(itemKey) ^ 0x9e3779b9) >>> 0);
}

/** جمله‌سازیِ کلیک‌کردنیِ خودِ جزوه (راند ۲۱۹) — بخش‌های «جمله بسازید» آزمون‌های
 * تشخیصی: کاشی‌ها را به ترتیب کلیک کن؛ سنجش با جملهٔ کلیدِ عینِ پاسخنامه.
 * هیچ نوشتنی در استورِ یادگیری نیست. */
function TopicOrderDrill({ topic }: { topic: BgTopic }) {
  const [seq, setSeq] = useState<Record<number, number[]>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  if (!topic.orderDrill?.length) return null;
  const answered = Object.keys(checked).length;
  const correct = topic.orderDrill.reduce((n, d, i) => {
    // همان ترتیبِ قطعیِ کاشی‌های هر سؤال — ایندکس‌هایِ seq به آرایهٔ بُرخورده اشاره می‌کنند
    const tiles = orderTilesFor(`${topic.id}#${i}`, d.q, d.answer);
    const built = (seq[i] ?? []).map((ti) => tiles[ti]).join(" ");
    return n + (checked[i] && normOrderAnswer(built) === normOrderAnswer(d.answer) ? 1 : 0);
  }, 0);
  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 dark:border-sky-900 dark:bg-sky-950/30">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-[13px] font-extrabold text-sky-800 dark:text-sky-300">
          <Blocks size={15} />
          جمله‌سازیِ خودِ جزوه — {faNum(topic.orderDrill.length)} سؤال
        </h4>
        <div className="flex items-center gap-2">
          {answered > 0 && (
            <span className="text-[12px] font-bold text-sky-700 dark:text-sky-300">
              {faNum(correct)} از {faNum(answered)} درست
            </span>
          )}
          <button
            onClick={() => {
              setSeq({});
              setChecked({});
            }}
            aria-label="پاک کردن پاسخ‌های جمله‌سازی"
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[12px] font-bold text-sky-700 shadow-sm transition-[background-color,color,border-color,box-shadow] hover:bg-sky-100 dark:bg-sky-900/40 dark:text-sky-300"
          >
            <RotateCcw size={13} />
            از نو
          </button>
        </div>
      </div>
      <ol className="space-y-3">
        {topic.orderDrill.map((d, di) => {
          const tiles = orderTilesFor(`${topic.id}#${di}`, d.q, d.answer);
          const picked = seq[di] ?? [];
          const done = checked[di] === true;
          const built = picked.map((ti) => tiles[ti]).join(" ");
          const isOk = done && normOrderAnswer(built) === normOrderAnswer(d.answer);
          const complete = picked.length === tiles.length;
          const taskChanged = d.task !== undefined && d.task !== topic.orderDrill![di - 1]?.task;
          const stripCls = done
            ? isOk
              ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-900/30"
              : "border-rose-300 bg-rose-50/70 dark:border-rose-700 dark:bg-rose-900/30"
            : "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/70";
          return (
            <li key={di} className="rounded-lg bg-white p-2.5 shadow-sm dark:bg-stone-900">
              {taskChanged && (
                <p className="mb-1.5 rounded-md bg-sky-100/70 px-2 py-1 text-[11.5px] font-bold text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                  {d.task}
                </p>
              )}
              <div className="flex items-start gap-2">
                <div
                  className={`min-h-[38px] flex-1 rounded-lg border px-2 py-1.5 transition-[border-color,background-color,box-shadow] ${stripCls}`}
                  dir="ltr"
                  aria-label={`جملهٔ ساخته‌شدهٔ سؤال ${faNum(di + 1)} جمله‌سازی`}
                >
                  {picked.length === 0 ? (
                    <span className="text-[12px] font-bold text-stone-500">
                      جمله را با کلیک روی کلمه‌ها بسازید…
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {picked.map((ti, pos) => (
                        <button
                          key={`${ti}-${pos}`}
                          disabled={done}
                          onClick={() =>
                            setSeq((s) => ({
                              ...s,
                              [di]: (s[di] ?? []).filter((_, p) => p !== pos),
                            }))
                          }
                          aria-label={`برگرداندن واژهٔ ${faNum(pos + 1)} سؤال ${faNum(di + 1)} جمله‌سازی`}
                          className="rounded-md border border-sky-300 bg-sky-100 px-2 py-0.5 text-[12px] font-extrabold text-sky-900 transition-[background-color,color,border-color,box-shadow] hover:bg-sky-200 disabled:cursor-default disabled:opacity-90 dark:border-sky-800 dark:bg-sky-900/60 dark:text-sky-100"
                        >
                          {tiles[ti]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!done && (
                  <button
                    onClick={() => {
                      if (complete) setChecked((c) => ({ ...c, [di]: true }));
                    }}
                    disabled={!complete}
                    aria-label={`بررسی سؤال ${faNum(di + 1)} جمله‌سازی`}
                    className="shrink-0 rounded-lg border border-sky-300 bg-sky-100 px-3 py-1.5 text-[12px] font-extrabold text-sky-800 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:bg-sky-200 active:scale-[0.96] disabled:opacity-40 dark:border-sky-800 dark:bg-sky-900/50 dark:text-sky-300"
                  >
                    بررسی
                  </button>
                )}
              </div>
              {!done && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5" dir="ltr">
                  {tiles.map((w, ti) =>
                    picked.includes(ti) ? null : (
                      <button
                        key={ti}
                        onClick={() =>
                          setSeq((s) => ({ ...s, [di]: [...(s[di] ?? []), ti] }))
                        }
                        className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[12px] font-extrabold text-stone-700 shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900 active:scale-[0.96] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-sky-700 dark:hover:bg-sky-900/50 dark:hover:text-sky-100"
                      >
                        {w}
                      </button>
                    ),
                  )}
                </div>
              )}
              {done && !isOk && (
                <p className="mt-1.5 text-[12px] font-bold text-rose-700 dark:text-rose-300" dir="auto">
                  پاسخِ درست: <span dir="ltr">{d.answer}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
