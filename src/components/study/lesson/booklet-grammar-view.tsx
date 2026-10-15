"use client";

// ---------------------------------------------------------------------
// درسنامهٔ جامع — زیرتابِ پنجمِ ضمیمه (راند ۲۱۴)
// منبع: src/data/booklet-grammar.ts — «مرور گرامرهای پایهٔ هفتم تا نهم»
// جزوهٔ جامع پایهٔ دهم (صفحات ۲۲-۳۶)، همان‌طور که هست ترمیم‌شده و بدونِ
// نامِ مؤلف/ناشر. تعامل: آکاردئونِ موضوع‌ها، جدول‌ها، مثال‌های شنیداری و
// آزمونکِ خودِ جزوه (تودوزنیِ محلی — هیچ نوشتنی در استورِ یادگیری نیست).
// ---------------------------------------------------------------------

import { useState } from "react";
import {
  BookOpenCheck,
  ChevronDown,
  Lightbulb,
  ListOrdered,
  MoveLeft,
  PencilLine,
  RotateCcw,
  Table2,
} from "lucide-react";
import SpeakButton from "@/components/study/shared/speak-button";
import {
  BOOKLET_GRAMMAR_SOURCES,
  BOOKLET_GRAMMAR_TOPICS,
  type BgTopic,
} from "@/data/booklet-grammar";
import { faNum } from "@/lib/study-theme";

/** ترتیبِ سرگروه‌ها + عنوانِ هر جزوهٔ مبدأ */
const SOURCE_ORDER: ("دهم" | "یازدهم")[] = ["دهم", "یازدهم"];

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

export default function BookletGrammarView() {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set([BOOKLET_GRAMMAR_TOPICS[0].id]),
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // گروه‌بندی بر اساس جزوهٔ مبدأ — راند ۲۱۵ (شماره‌گذاریِ سراسری = جایگاه در آرایه)
  const groups = SOURCE_ORDER.map((src) => ({
    src,
    topics: BOOKLET_GRAMMAR_TOPICS.filter((t) => t.source === src),
  })).filter((g) => g.topics.length > 0);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border c-card p-4">
        <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold text-stone-800 dark:text-stone-100">
          <BookOpenCheck size={17} className="text-violet-600 dark:text-violet-400" />
          درسنامهٔ جامع — از خودِ جزوه‌های جامع
        </h2>
        <p className="mt-1 text-[13px] leading-7 text-stone-600 dark:text-stone-300">
          {faNum(BOOKLET_GRAMMAR_TOPICS.length)} موضوع در {faNum(groups.length)} جزوه:
          قاعده‌ها، نکته‌ها، جدول‌ها و مثال‌های ترجمه‌دار — دقیقاً همان‌طور که جزوه‌ها
          تدریس کرده‌اند. مثال‌های انگلیسی را می‌شنوی و آزمونکِ هر موضوع کلیدِ خودش
          را دارد. پایهٔ دهم بنیان‌های هفتم تا نهم را مرور می‌کند و پایهٔ یازدهم
          درسنامه‌های درس‌های خودش را.
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
          {g.topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={BOOKLET_GRAMMAR_TOPICS.indexOf(topic) + 1}
              isOpen={open.has(topic.id)}
              onToggle={toggle}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function TopicCard({
  topic,
  index,
  isOpen,
  onToggle,
}: {
  topic: BgTopic;
  index: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border c-card overflow-hidden">
      <button
        onClick={() => onToggle(topic.id)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 px-4 py-3 text-right transition-[background-color,color,border-color,box-shadow] hover:bg-stone-50 dark:hover:bg-stone-800/60"
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

      {isOpen && (
        <div className="space-y-4 border-t border-stone-100 px-4 py-4 dark:border-stone-700">
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
                    className="flex items-start justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-800/70"
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

