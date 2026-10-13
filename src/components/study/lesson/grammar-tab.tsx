"use client";

import { GraduationCap, Lightbulb } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { themeOf } from "@/lib/study-theme";

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
    </div>
  );
}
