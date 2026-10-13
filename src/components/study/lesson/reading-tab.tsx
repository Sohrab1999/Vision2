"use client";

import { useState } from "react";
import { Languages, FileText } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { themeOf } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";

export default function ReadingTab({ lesson }: { lesson: LessonData }) {
  const [showFa, setShowFa] = useState(true);
  const t = themeOf(lesson.color);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border c-card px-4 py-3">
        <span className="flex items-center gap-2 text-[13px] font-bold text-stone-600">
          <FileText size={15} className="text-stone-400" />
          متن هر پاراگراف را با دکمهٔ صوتی بشنوید
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-bold text-stone-600">
          <Languages size={15} className="text-stone-400" />
          ترجمهٔ فارسی
          <button
            role="switch"
            aria-checked={showFa}
            onClick={() => setShowFa((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${showFa ? "bg-emerald-500" : "bg-stone-300"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                showFa ? "right-0.5" : "right-[22px]"
              }`}
            />
          </button>
        </label>
      </div>

      <div className="max-h-[62vh] space-y-5 overflow-y-auto pl-1 nice-scroll">
        {lesson.readings.map((reading) => (
          <article key={reading.titleEn} className="rounded-2xl border c-card p-4 sm:p-5">
            <header className={`mb-4 rounded-xl border ${t.border} ${t.bgSoft} p-3.5 text-center`}>
              <h3 className={`en-text text-lg font-bold ${t.text}`} dir="ltr">
                “{reading.titleEn}”
              </h3>
              <p className="mt-0.5 text-sm font-bold text-stone-700">{reading.titleFa}</p>
              <span className="mt-1.5 inline-block rounded-full c-veil-80 px-2.5 py-0.5 text-[10.5px] text-stone-500" dir="ltr">
                {reading.source}
              </span>
            </header>
            <div className="space-y-4">
              {reading.paragraphs.map((p, i) => (
                <div key={i} className="rounded-xl border border-stone-100 c-stone-60 p-3.5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="en-text flex-1 text-[14.5px] leading-8 text-stone-800" dir="ltr">
                      {p.en}
                    </p>
                    <SpeakButton text={p.en} />
                  </div>
                  {showFa && (
                    <p className="border-t border-dashed border-stone-200 pt-2 text-[13px] leading-8 text-stone-500">
                      {p.fa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
