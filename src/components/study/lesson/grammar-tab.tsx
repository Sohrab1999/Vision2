"use client";

import { useState } from "react";
import { BookOpenCheck, GraduationCap, Lightbulb } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { themeOf, faNum } from "@/lib/study-theme";
import {
  BOOKLET_GRAMMAR_TOPICS,
  LESSON_BG_LINKS,
  type BgTopic,
} from "@/data/booklet-grammar";
import { TopicCard } from "@/components/study/lesson/booklet-grammar-view";

export default function GrammarTab({ lesson }: { lesson: LessonData }) {
  const t = themeOf(lesson.color);
  return (
    <div className="max-h-[64vh] space-y-4 overflow-y-auto pl-1 nice-scroll">
      {lesson.grammar.map((section, i) => (
        <section key={i} className="overflow-hidden rounded-2xl border c-card">
          <header className={`flex items-center gap-2 border-b ${t.border} ${t.bgSoft} px-4 py-3`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.bg} text-white`}>
              {i % 2 === 0 ? <GraduationCap size={15} /> : <Lightbulb size={15} />}
            </span>
            <h3 className="text-[15px] font-extrabold text-stone-800">
              {i + 1}. {section.title}
            </h3>
          </header>
          <div
            className="g-html p-4"
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        </section>
      ))}

      <LinkedBookletTopics lesson={lesson} />
    </div>
  );
}

/** درسنامهٔ جامعِ مرتبط (راند ۲۲۰) — موضوع‌هایی که خودِ جزوهٔ جامعِ همین پایه
 * برای گرامرِ این درس تدریس کرده، با همان کارت‌های آکاردئونیِ ضمیمه (جدول‌ها،
 * مثال‌های شنیداری، آزمونک‌ها، تمرینِ تایپی و جمله‌سازی — همه محلی، هیچ
 * نوشتنی در استورِ یادگیری نیست). پیش‌فرضِ همه بسته؛ پیوند فقط برای
 * درس‌هایی که شاهدِ خودِ جزوه دارد (LESSON_BG_LINKS). */
function LinkedBookletTopics({ lesson }: { lesson: LessonData }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const ids = LESSON_BG_LINKS[lesson.id] ?? [];
  if (!ids.length) return null;
  const topics = ids
    .map((id) => BOOKLET_GRAMMAR_TOPICS.find((x) => x.id === id))
    .filter((x): x is BgTopic => Boolean(x));
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200 c-card dark:border-violet-900">
      <header className="flex items-center gap-2 border-b border-violet-200 bg-violet-50/70 px-4 py-3 dark:border-violet-900 dark:bg-violet-950/40">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
          <BookOpenCheck size={15} />
        </span>
        <h3 className="text-[15px] font-extrabold text-stone-800 dark:text-stone-100">
          درسنامهٔ جامعِ مرتبط از جزوه
        </h3>
        <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-[11.5px] font-extrabold text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
          {faNum(topics.length)} موضوع
        </span>
      </header>
      <div className="space-y-3 p-3">
        <p className="rounded-lg bg-stone-50 px-3 py-2 text-[12.5px] leading-6 text-stone-600 dark:bg-stone-800/70 dark:text-stone-300">
          مطالبی که جزوهٔ جامعِ پایهٔ {lesson.grade} برای گرامرِ همین درس تدریس
          کرده — دقیقاً با نکته‌ها، جدول‌ها و مثال‌های خودِ جزوه. هر موضوع را باز
          کن: مثال‌ها را می‌شنوی و آزمونک‌ها، تمرینِ تایپی و جمله‌سازی با کلیدِ
          خودِ جزوه همین‌جا کار می‌کنند (نسخهٔ کامل: ضمیمه ← «درسنامهٔ جامع»).
        </p>
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            index={BOOKLET_GRAMMAR_TOPICS.indexOf(topic) + 1}
            isOpen={open.has(topic.id)}
            onToggle={toggle}
          />
        ))}
      </div>
    </section>
  );
}
