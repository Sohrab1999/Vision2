"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, Library, ListTree, Volume2, SpellCheck2, BookA, Table2, BookOpenCheck, Users, BookOpenText, EyeOff, GraduationCap } from "lucide-react";
import { irregularVerbs, partsOfSpeech, vowelPhonemes, consonantPhonemes, abbreviations } from "@/data/appendix";
import {
  WORD_FAMILY_TABLES,
  WORD_FAMILY_TOTAL,
  WF_TABLE_ID_TO_LESSON,
  wordFamilyTableId,
} from "@/data/word-families";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { wordFamilyUsageCensus } from "@/lib/word-usage";
import { writeAppendixResume, type AppendixScope } from "@/lib/bg-reading";
import BookletGrammarView from "./booklet-grammar-view";
import IrregularVerbsTable from "./irregular-verbs-table";
import AppendixDrillView, { type DrillViewSpec } from "./appendix-drill-view"; // r400 — تمرینِ ضمیمه؛ r403 — نمایِ مشترکِ دو بانک؛ r404 — بانکِ سوم
import { buildDrillSession, DRILL_SIZE } from "@/lib/appendix-drill";
import { buildWordDrillSession } from "@/lib/appendix-word-drill";
import { buildAbbrevDrillSession } from "@/lib/appendix-abbrev-drill"; // r404
import PhoneticsTable from "./phonetics-table";
import AbbreviationsTable from "./abbreviations-table";
import WordFamilyTableCard from "./word-family-table-card";
import AppendixResumePill from "./appendix-resume-pill";
type SubTab = "verbs" | "phonetics" | "pos" | "abbrev" | "grammar";

const subTabs: { key: SubTab; label: string; icon: React.ElementType }[] = [
  { key: "grammar", label: "درسنامهٔ جامع", icon: BookOpenCheck },
  { key: "verbs", label: "افعال بی‌قاعده", icon: SpellCheck2 },
  { key: "phonetics", label: "جدول تلفظ (IPA)", icon: Volume2 },
  { key: "pos", label: "اجزای کلام", icon: BookA },
  { key: "abbrev", label: "نشانه‌های اختصاری", icon: Table2 },
];

// r403 — دو specِ نمایِ مشترکِ دریل: هر بانک متنِ صادقِ خودش را دارد؛
// aria-labelهای فعل قفلِ تستِ r400..r402اند — عینِ همان رشتهها.
const VERB_DRILL_SPEC: DrillViewSpec = {
  id: "verbs",
  title: "تمرین افعال بی‌قاعده",
  intro: (
    <>
      {faNum(DRILL_SIZE)} پرسش از فهرستِ {faNum(irregularVerbs.length)} فعلی ضمیمه: گذشتهٔ ساده،
      شکل سوم (p.p.)، شکلِ ساده و معنیِ فارسی. گزینه‌ها همگی از خودِ بانکِ افعال میآیند — نه
      ساختهٔ ماشینی؛ و اگر چیزی اشتباه بماند، همان‌ها دوباره پرسیده میشوند.
    </>
  ),
  startAria: "شروع جلسهٔ تمرین فعل",
  exitLabel: "جدول افعال",
  exitAria: "بازگشت به جدول افعال",
  exitResultAria: "بازگشت به جدول افعال از نتیجه",
  cancelAria: "انصراف از تمرین",
};

const WORD_DRILL_SPEC: DrillViewSpec = {
  id: "words",
  title: "تمرین خانوادهٔ واژه‌ها",
  intro: (
    <>
      {faNum(DRILL_SIZE)} پرسش از {faNum(WORD_FAMILY_TOTAL)} خانوادهٔ واژهٔ جدول‌های جزوه: معنی،
      صفت، قید، فعل و اسم. گزینه‌ها همگی از خودِ جدولها میآیند — نه ساختهٔ ماشینی؛ خانه‌هایِ خالیِ
      جزوه پرسیده نمیشوند؛ و اگر چیزی اشتباه بماند، همان‌ها دوباره پرسیده میشوند.
    </>
  ),
  startAria: "شروع جلسهٔ تمرین واژه",
  exitLabel: "جدول اجزای کلام",
  exitAria: "بازگشت به جدول اجزای کلام",
  exitResultAria: "بازگشت به جدول اجزای کلام از نتیجه",
  cancelAria: "انصراف از تمرین واژه",
};

// r404 — specِ بانکِ سوم: نشانه‌های اختصاری — معنی/شکلِ کامل/نمادِ معکوس؛
// aria-labelهای فعل و واژه قفلِ تستِ r400..r403اند — عینِ همان رشتهها.
const ABBREV_DRILL_SPEC: DrillViewSpec = {
  id: "abbrev",
  title: "تمرین نشانه‌های اختصاری",
  intro: (
    <>
      {faNum(DRILL_SIZE)} پرسش از {faNum(abbreviations.length)} نشانهٔ ضمیمه: معنی، شکلِ کامل و
      نشانهٔ معکوس. گزینه‌ها همگی از خودِ بانکِ نشانهها میآیند — نه ساختهٔ ماشینی؛ و اگر چیزی
      اشتباه بماند، همان‌ها دوباره پرسیده میشوند.
    </>
  ),
  startAria: "شروع جلسهٔ تمرین نشانه",
  exitLabel: "کارت‌های نشانه",
  exitAria: "بازگشت به کارت‌های نشانه",
  exitResultAria: "بازگشت به کارت‌های نشانه از نتیجه",
  cancelAria: "انصراف از تمرین نشانه",
};

export default function AppendixView({
  topicId,
  posTableId,
  verbBase,
  phonemeId,
  abbrevSym,
}: {
  topicId?: string;
  posTableId?: string;
  verbBase?: string;
  phonemeId?: string;
  abbrevSym?: string;
}) {
  // لنگرِ عمیقِ «اجزای کلماتی» (راند ۲۲۴) — شناسهٔ معتبر یعنی ضمیمه مستقیم
  // روی زیرتبِ pos باز می‌شود؛ نامعتبر بی‌خطر است (رفتارِ سابق: درسنامهٔ جامع).
  const validPos = !!posTableId && WORD_FAMILY_TABLES.some((t) => wordFamilyTableId(t) === posTableId);
  // لنگرِ عمیقِ «افعال بی‌قاعده» (راند ۲۳۴) — شکلِ سادهٔ معتبر یعنی ضمیمه
  // مستقیم روی زیرتبِ verbs باز می‌شود و سطرِ فعل در دید با پالسِ زمردی است.
  const validVerb = !!verbBase && irregularVerbs.some((v) => v.base === verbBase);
  // لنگرِ عمیقِ «جدول تلفظ» و «نشانه‌های اختصاری» (راند ۲۳۵) — همان داوریِ
  // روی دادهٔ منجمد؛ نامعتبر = رفتارِ سابق.
  const validPhoneme =
    !!phonemeId &&
    [vowelPhonemes, consonantPhonemes].some((arr) => arr.some((p) => p.symbol === phonemeId));
  const validAbbrev = !!abbrevSym && abbreviations.some((a) => a.sym === abbrevSym);
  const [tab, setTab] = useState<SubTab>(() =>
    validVerb ? "verbs" : validPos ? "pos" : validPhoneme ? "phonetics" : validAbbrev ? "abbrev" : "grammar",
  );
  // راند ۲۲۲ — فیلترِ پایهٔ جدول‌های «اجزای کلماتی» در زیرتبِ pos
  const [posGrade, setPosGrade] = useState<"همه" | "دهم" | "یازدهم" | "دوازدهم">("همه");
  // راند ۲۲۸ — فهرستِ پرشِ جدول‌ها (بندِ ② پیشنهادِ ۲۲۷): پنلِ چیپ‌ها همیشه از
  // «فهرستِ رندرشده» (فیلترِ فعال) — همان قراردادِ ناوبریِ r227؛ کلیک =
  // اسکرولِ محلی به لنگر + بستنِ پنل، بدونِ چرخشِ استور.
  const [posJumpOpen, setPosJumpOpen] = useState(false);
  // راند ۲۵۶ — لنزِ «فقط کاربرددارها» (بندِ ② پیشنهادِ ۲۵۵): وقتی روشن است
  // هر جدول فقط خانواده‌هایی را رندر می‌کند که دست‌کم یک سلولشان در متنِ
  // مکالمه‌ها/ریدینگ‌های جزوه آمده — همان تک‌منبعِ wordFamilyUsageCensus.
  // راند ۲۵۷ — بندِ ③ پیشنهادِ ۲۵۶: لنزِ معکوسِ «فقط بی‌کاربردها» — حالتِ
  // سه‌حالته (all/used/unused) با دوتاییِ متقابلاً انحصاری: روشن‌کردنِ یکی
  // دیگری را خاموش می‌کند؛ مطالعهٔ هدفمندِ خانواده‌هایی که هنوز در متن نیامده‌اند.
  const [posLens, setPosLens] = useState<"all" | "used" | "unused">("all");
  // سرشماریِ هر جدول — در سطحِ کامپوننت (قانونِ هوک‌ها: هوکِ شرطی ممنوع؛
  // IIFEِ pos فقط مصرف‌کننده‌اش است)؛ findWordUsages کشِ ماژول دارد.
  const tableCensus = useMemo(
    () => new Map(WORD_FAMILY_TABLES.map((t) => [wordFamilyTableId(t), wordFamilyUsageCensus(t.families)])),
    [],
  );
  // لنگرِ عمیقِ «درسنامهٔ جامع» (راند ۲۲۱) — یک‌بارِ مصرف: BookletGrammarView
  // پس از نخستین تلاشِ اسکرول (موفق یا شناسهٔ نامعتبر) onFocusDone را صدا
  // می‌زند و لنگر پاک می‌شود؛ جابه‌جاییِ بعدیِ بینِ زیرتاب‌ها دوباره پرش نمی‌کند.
  const [focusTopicId, setFocusTopicId] = useState<string | undefined>(topicId);
  // لنگرِ عمیقِ جدولِ خانوادهٔ واژه‌ها (راند ۲۲۴) — یک‌بارِ مصرفِ همان الگو
  const [focusPosTableId, setFocusPosTableId] = useState<string | undefined>(
    () => (validPos ? posTableId : undefined),
  );
  // لنگرِ عمیقِ سطرِ فعلِ بی‌قاعده (راند ۲۳۴) — یک‌بارِ مصرفِ همان الگو
  const [focusVerbBase, setFocusVerbBase] = useState<string | undefined>(
    () => (validVerb ? verbBase : undefined),
  );
  // r400 — حالتِ تمرینِ زیرتبِ verbs؛ فقط با کلیکِ کاربر روشن میشود
  // (لنگرِ عمیقِ r234 همیشه جدول را میآورد — drill هرگز رویِ دیپلینک بالا نمیآید)
  const [verbDrill, setVerbDrill] = useState(false);
  // r403 — همان قرارداد برایِ زیرتبِ pos: فقط با کلیک؛ دیپلینکِ posTable همیشه جدول
  const [wordDrill, setWordDrill] = useState(false);
  // r404 — و بانکِ سوم: زیرتبِ abbrev؛ فقط با کلیک — دیپلینکِ abbrevSym همیشه جدول
  const [abbrevDrill, setAbbrevDrill] = useState(false);
  // لنگرِ عمیقِ کارتِ واکِ «جدول تلفظ» (راند ۲۳۵) — یک‌بارِ مصرفِ همان الگو
  const [focusPhonemeId, setFocusPhonemeId] = useState<string | undefined>(
    () => (validPhoneme ? phonemeId : undefined),
  );
  // لنگرِ عمیقِ کارتِ نشانهٔ «نشانه‌های اختصاری» (راند ۲۳۵) — یک‌بارِ مصرفِ همان الگو
  const [focusAbbrevSym, setFocusAbbrevSym] = useState<string | undefined>(
    () => (validAbbrev ? abbrevSym : undefined),
  );

  // راند ۲۳۴ — ثبتِ «آخرین جدولِ دیده‌شده» از خودِ دادهٔ منجمد (هیچ ساختگی):
  // عنوانِ «پایه · درس» + شمارشِ خانواده‌ها — هر دو همان رشته‌هایِ UIِ pos.
  const recordPosResume = useCallback((id: string) => {
    const t = WORD_FAMILY_TABLES.find((tb) => wordFamilyTableId(tb) === id);
    if (!t) return;
    writeAppendixResume({
      scope: "pos",
      id,
      title: `${t.grade} · ${t.lesson}`,
      hint: `${faNum(t.families.length)} خانوادهٔ واژه`,
    });
  }, []);

  // اسکرولِ تمرکزِ لنگرِ pos (راند ۲۲۴) — jsdom scrollIntoView ندارد
  // (فراخوانِ اختیاری) و پس از نخستین تلاش لنگر پاک می‌شود.
  // راند ۲۳۴ — رسیدن با لنگرِ عمیق هم «دیدن» است؛ نشانگر ثبت می‌شود
  // (مثلِ درسنامهٔ جامع در r233).
  useEffect(() => {
    if (!focusPosTableId) return;
    const raf = requestAnimationFrame(() => {
      recordPosResume(focusPosTableId);
      document
        .getElementById(`wf-table-${focusPosTableId}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      setFocusPosTableId(undefined);
    });
    return () => cancelAnimationFrame(raf);
  }, [focusPosTableId, recordPosResume]);

  const openLessonTab = useStudy((s) => s.openLessonTab);

  // ناوبریِ پیوستهٔ جدول‌های pos (راند ۲۲۷ — آینهٔ navigateToTopicِ r226):
  // همهٔ جدول‌ها همیشه بازند — ناوبری یعنی اسکرولِ محلی به لنگرِ هدف؛
  // کاملاً محلی، بدونِ چرخشِ استور. همسایه‌ها از «فهرستِ رندرشده»
  // (همان فیلترِ فعال) مشتق می‌شوند — ناوبری هیچ‌وقت به جدولِ پنهان نمی‌رود.
  // راند ۲۳۴ — پرش (چیپِ فهرست یا قبلی/بعدی) هم «آخرینِ دیده‌شده» است.
  const navigateToTable = (id: string) => {
    recordPosResume(id);
    requestAnimationFrame(() => {
      document
        .getElementById(`wf-table-${id}`)
        ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  };

  // راند ۲۳۴ — رفت‌وبرگشتِ محلیِ نشانگرِ «ادامه» در سرِ ضمیمه: تعویضِ زیرتبِ
  // لایه + لنگرِ یک‌بارِ مصرفِ همان لایه — همان سازوکارِ عمیقِ r221/r224،
  // بدونِ هیچ چرخشِ view/استور.
  const goResume = (scope: AppendixScope, id: string) => {
    if (scope === "grammar") {
      setTab("grammar");
      setFocusTopicId(id);
    } else if (scope === "pos") {
      setTab("pos");
      setFocusPosTableId(id);
    } else if (scope === "phonetics") {
      setTab("phonetics");
      setFocusPhonemeId(id);
    } else if (scope === "abbrev") {
      setTab("abbrev");
      setFocusAbbrevSym(id);
    } else {
      setTab("verbs");
      setFocusVerbBase(id);
    }
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
          {/* راند ۲۳۴ — «ادامه از …» کنارِ زیرتاب‌ها؛ بی‌رکورد هیچ چیزی رندر نمی‌شود */}
          <AppendixResumePill onGo={goResume} />
        </div>
      </div>

      {tab === "grammar" && (
        <BookletGrammarView
          focusTopicId={focusTopicId}
          onFocusDone={() => setFocusTopicId(undefined)}
        />
      )}

      {/* راند ۲۲۹ — جدولِ افعال بی‌قاعده به کامپوننتِ خودش مهاجرت کرد
          (الگویِ استخراجِ r223) و جست‌وجوی دوزبانه + فهرستِ الفباییِ پرش
          + جداکنندهٔ حرف + تلفظِ هر سه ستونِ انگلیسی گرفت.
          راند ۲۳۴ — لنگرِ عمیقِ سطرِ فعل + ثبتِ «آخرین فعلِ شنیده‌شده». */}
      {tab === "verbs" &&
        (verbDrill ? (
          <AppendixDrillView
            spec={VERB_DRILL_SPEC}
            buildSession={() => buildDrillSession(irregularVerbs, DRILL_SIZE)}
            onExit={() => setVerbDrill(false)}
          />
        ) : (
          <>
            <div className="mb-2 flex items-center justify-end">
              <button
                onClick={() => setVerbDrill(true)}
                aria-label="شروع تمرین افعال بی‌قاعده"
                title="ده پرسش از فهرست ضمیمه — گذشته، شکل سوم و شکل ساده"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 text-[12px] font-black text-violet-700 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 active:scale-[0.96]"
              >
                <GraduationCap size={15} aria-hidden />
                تمرین
              </button>
            </div>
            <IrregularVerbsTable
              focusBase={focusVerbBase}
              onFocusDone={() => setFocusVerbBase(undefined)}
            />
          </>
        ))}

      {/* راند ۲۳۰ — کارت‌های واک به کامپوننتِ خودش مهاجرت کردند
          (الگویِ استخراجِ r223/r229) و جست‌وجوی دوزبانه + فیلترِ گروه
          + روخوانیِ واژهٔ نمونهٔ هر واک گرفتند.
          راند ۲۳۵ — لنگرِ عمیقِ کارتِ واک + نقطهٔ نوشتنِ TTS. */}
      {tab === "phonetics" && (
        <PhoneticsTable
          focusSymbol={focusPhonemeId}
          onFocusDone={() => setFocusPhonemeId(undefined)}
        />
      )}

      {/* r403 — زیرتبِ pos: تمرینِ خانوادهٔ واژه با همان نمایِ مشترک؛
          فقط با کلیکِ کاربر (قراردادِ r234/r400) — دیپلینکِ posTable همیشه جدول */}
      {tab === "pos" &&
        (wordDrill ? (
          <AppendixDrillView
            spec={WORD_DRILL_SPEC}
            buildSession={() => buildWordDrillSession(WORD_FAMILY_TABLES, DRILL_SIZE)}
            onExit={() => setWordDrill(false)}
          />
        ) : (
          (() => {
        const gradeCounts = { همه: WORD_FAMILY_TOTAL, دهم: 0, یازدهم: 0, دوازدهم: 0 } as Record<string, number>;
        for (const t of WORD_FAMILY_TABLES) gradeCounts[t.grade] += t.families.length;
        const tables = posGrade === "همه" ? WORD_FAMILY_TABLES : WORD_FAMILY_TABLES.filter((t) => t.grade === posGrade);
        // راند ۲۵۶ — شمارندهٔ لنز هم‌مقیاسِ «N خانواده» است و با فیلترِ پایه
        // می‌شمارَد (مثلِ قفلِ هم‌مقیاسیِ r253).
        const scopeUsedFam = tables.reduce(
          (s, t) => s + (tableCensus.get(wordFamilyTableId(t))?.usedFamilies ?? 0),
          0,
        );
        // راند ۲۵۷ — شمارندهٔ لنزِ معکوس، هم‌مقیاسِ خانواده مثلِ r256:
        // بی‌کاربردهایِ scopeِ فعال = کل − کاربرددارها.
        const scopeUnusedFam = tables.reduce(
          (s, t) => {
            const c = tableCensus.get(wordFamilyTableId(t));
            return s + (c ? c.totalFamilies - c.usedFamilies : 0);
          },
          0,
        );
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
                {/* r403 — دکمهٔ ورود به تمرین: همان ایدئومِ دکمهٔ verbs (راند ۲۳۹)؛
                    جدول پابرجا — دریل فقط با کلیک، دیپلینک هرگز */}
                <button
                  onClick={() => setWordDrill(true)}
                  aria-label="شروع تمرین خانوادهٔ واژه‌ها"
                  title="ده پرسش از جدول‌های جزوه — معنی، صفت، قید، فعل و اسم"
                  className="ms-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 text-[12px] font-black text-violet-700 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 active:scale-[0.96]"
                >
                  <GraduationCap size={15} aria-hidden />
                  تمرین
                </button>
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
                {/* راند ۲۵۶ — لنزِ «فقط کاربرددارها» + راند ۲۵۷ — لنزِ معکوسِ
                    «فقط بی‌کاربردها»: گروهِ خودش را دارد (هرگز داخلِ گروهِ
                    فیلترِ پایه — قراردادِ r228)؛ دوتاییِ متقابلاً انحصاری —
                    روشن‌کردنِ یکی دیگری را خاموش می‌کند. شمارنده‌هایِ هم‌مقیاسِ
                    خانواده با فیلترِ پایه می‌شمارند (قفلِ r253)؛ آسمانیِ کاربرددار
                    = هویتِ خانوادهٔ «کاربرد در جزوه»، کهرباییِ بی‌کاربرد =
                    «هنوز در متن نیامده — برایِ مطالعهٔ هدفمند». */}
                <div role="group" aria-label="لنز کاربرددار جدول‌های اجزای کلماتی">
                  <button
                    type="button"
                    data-testid="pos-used-only-toggle"
                    onClick={() => setPosLens((v) => (v === "used" ? "all" : "used"))}
                    aria-pressed={posLens === "used"}
                    title="فقط خانواده‌هایی که دست‌کم یک سلولشان در متنِ مکالمه‌ها و ریدینگ‌های جزوه آمده"
                    className={`me-1.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-bold transition-[background-color,color,border-color,box-shadow] ${
                      posLens === "used"
                        ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                        : "border-stone-200 bg-white text-stone-500 hover:border-sky-200 hover:bg-sky-50/60 hover:text-sky-700"
                    }`}
                  >
                    <BookOpenText size={13} aria-hidden />
                    فقط کاربرددارها
                    <span className="text-[10.5px] font-black opacity-80">{faNum(scopeUsedFam)}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="pos-unused-only-toggle"
                    onClick={() => setPosLens((v) => (v === "unused" ? "all" : "unused"))}
                    aria-pressed={posLens === "unused"}
                    title="فقط خانواده‌هایی که هنوز هیچ سلولشان در متنِ مکالمه‌ها و ریدینگ‌های جزوه نیامده — برایِ مطالعهٔ هدفمند"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-bold transition-[background-color,color,border-color,box-shadow] ${
                      posLens === "unused"
                        ? "border-amber-200 bg-amber-50 text-amber-800 shadow-sm"
                        : "border-stone-200 bg-white text-stone-500 hover:border-amber-200 hover:bg-amber-50/60 hover:text-amber-800"
                    }`}
                  >
                    <EyeOff size={13} aria-hidden />
                    فقط بی‌کاربردها
                    <span className="text-[10.5px] font-black opacity-80">{faNum(scopeUnusedFam)}</span>
                  </button>
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
              // راند ۲۵۹ — بندِ ③ پیشنهادِ ۲۵۸: چیپِ کهرباییِ هدر حالا
              // چرخانندهٔ همین لنز است (قرینهٔ کلیکِ سطرِ نوارِ r258)
              return (
                <WordFamilyTableCard
                  key={`${t.vision}-${t.lesson}`}
                  table={t}
                  usedOnly={posLens === "used"}
                  unusedOnly={posLens === "unused"}
                  relatedLesson={lesson}
                  onOpenLesson={lesson !== undefined ? () => openLessonTab(lesson, "vocab") : undefined}
                  onToggleUnusedLens={() => setPosLens((v) => (v === "unused" ? "all" : "unused"))}
                  unusedLensOn={posLens === "unused"}
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
      })()
        ))}

      {/* راند ۲۳۱ — نشانه‌های اختصاری هم به کامپوننتِ خودش مهاجرت کردند
          (الگویِ استخراجِ r230) و جست‌وجوی دوزبانه + روخوانیِ شکلِ کامل
          گرفتند.
          راند ۲۳۵ — لنگرِ عمیقِ کارتِ نشانه + نقطهٔ نوشتنِ TTS.
          r404 — تمرینِ نشانه‌ها با همان نمایِ مشترکِ هر سه بانک؛ فقط با
          کلیکِ کاربر (قراردادِ r234/r400/r403) — دیپلینکِ abbrevSym همیشه جدول */}
      {tab === "abbrev" &&
        (abbrevDrill ? (
          <AppendixDrillView
            spec={ABBREV_DRILL_SPEC}
            buildSession={() => buildAbbrevDrillSession(abbreviations, DRILL_SIZE)}
            onExit={() => setAbbrevDrill(false)}
          />
        ) : (
          <>
            <div className="mb-2 flex items-center justify-end">
              <button
                onClick={() => setAbbrevDrill(true)}
                aria-label="شروع تمرین نشانه‌های اختصاری"
                title="ده پرسش از ضمیمه — معنی، شکل کامل و نشانهٔ معکوس"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 text-[12px] font-black text-violet-700 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 active:scale-[0.96]"
              >
                <GraduationCap size={15} aria-hidden />
                تمرین
              </button>
            </div>
            <AbbreviationsTable
              focusSym={focusAbbrevSym}
              onFocusDone={() => setFocusAbbrevSym(undefined)}
            />
          </>
        ))}
    </div>
  );
}
