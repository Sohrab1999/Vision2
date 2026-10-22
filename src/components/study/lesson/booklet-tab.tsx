"use client";

// ------------------------------------------------------------------
// نهمین تبِ درس — «جزوه» (راند ۲۰۹ — «جزوه در دسترس»).
// محتوای دقیقِ استخراج‌شده از PDF جزوهٔ پایهٔ خودِ درس: واژگانِ جدولی،
// مکالمه و تمرین‌های کتاب درسی، درسنامه، نمونه سؤال و فعل‌های بی‌قاعده.
// قراردادِ بدونِ-ساختگی: فقط چیزی که در جزوه هست — بدونِ نامِ مؤلف/ناشر.
// ------------------------------------------------------------------

import { useMemo, useState } from "react";
import { BookMarked, MessageSquareText, NotebookPen, ScrollText, Table2, Wind } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import type { BookletSection } from "@/lib/booklet-types";
import { BOOKLET_KIND_LABEL } from "@/lib/booklet-types";
import { bookletSections } from "@/data/booklet-content";
import { themeOf, faNum } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";

const KIND_ICON: Record<BookletSection["kind"], React.ElementType> = {
  vocab: Table2,
  dialogue: MessageSquareText,
  practice: NotebookPen,
  notes: BookMarked,
  exam: ScrollText,
  verbs: Wind,
};

type KindFilter = "all" | BookletSection["kind"];

export default function BookletTab({ lesson }: { lesson: LessonData }) {
  const sections = useMemo(() => bookletSections(lesson.id), [lesson.id]);
  const [filter, setFilter] = useState<KindFilter>("all");
  const t = themeOf(lesson.color);

  const counts = useMemo(() => {
    const m = new Map<BookletSection["kind"], number>();
    for (const s of sections) m.set(s.kind, (m.get(s.kind) ?? 0) + (s.kind === "vocab" ? s.rows.length : s.kind === "exam" ? s.items.length : s.kind === "verbs" ? s.rows.length : s.kind === "notes" ? s.paras.length : s.lines.length));
    return m;
  }, [sections]);

  const visible = filter === "all" ? sections : sections.filter((s) => s.kind === filter);

  if (!sections.length) {
    return (
      <div className="rounded-2xl border c-card p-8 text-center text-sm text-stone-500">
        برای این درس هنوز جزوه‌ای بارگذاری نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* فیلترِ نوعِ بخش */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="فیلتر بخش‌های جزوه">
        <button
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
          className={`rounded-full px-3.5 py-2 text-[12px] font-bold transition-[background-color,color,box-shadow] ${
            filter === "all" ? `${t.bg} text-white shadow-sm` : "c-card text-stone-600 hover:text-stone-700"
          }`}
        >
          همهٔ بخش‌ها
          <span className="ml-1.5 rounded-full bg-black/10 px-1.5 text-[10px] dark:bg-white/10">{faNum(sections.length)}</span>
        </button>
        {[...counts.entries()].map(([kind, n]) => {
          const Icon = KIND_ICON[kind];
          const active = filter === kind;
          return (
            <button
              key={kind}
              onClick={() => setFilter(active ? "all" : kind)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-[background-color,color,box-shadow] ${
                active ? `${t.bg} text-white shadow-sm` : "c-card text-stone-600 hover:text-stone-700"
              }`}
            >
              <Icon size={13} />
              {BOOKLET_KIND_LABEL[kind]}
              <span className="rounded-full bg-black/10 px-1.5 text-[10px] dark:bg-white/10">{faNum(n)}</span>
            </button>
          );
        })}
      </div>

      {/* بخش‌ها */}
      <div className="space-y-4">
        {visible.map((sec, i) => (
          <SectionCard key={`${sec.kind}-${i}`} sec={sec} themeBg={t.bg} chipBg={t.chipBg} />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ sec, themeBg, chipBg }: { sec: BookletSection; themeBg: string; chipBg: string }) {
  const Icon = KIND_ICON[sec.kind];
  return (
    <section className="overflow-hidden rounded-2xl border c-card shadow-sm" aria-label={sec.title}>
      <header className="flex items-center gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-700/60">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${chipBg}`}>
          <Icon size={15} />
        </span>
        <h3 className="text-sm font-black text-stone-700">{sec.title}</h3>
      </header>
      <div className="max-h-96 overflow-y-auto nice-scroll p-4">
        {sec.kind === "vocab" && <VocabBody rows={sec.rows} />}
        {sec.kind === "dialogue" && <DialogueBody lines={sec.lines} />}
        {sec.kind === "practice" && <DialogueBody lines={sec.lines} />}
        {sec.kind === "notes" && <NotesBody paras={sec.paras} />}
        {sec.kind === "exam" && <ExamBody items={sec.items} themeBg={themeBg} />}
        {sec.kind === "verbs" && <VerbsBody rows={sec.rows} />}
      </div>
    </section>
  );
}

function VocabBody({ rows }: { rows: { en: string; fa: string }[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {rows.map((r, i) => (
        <li key={i} className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white px-3 py-2 dark:bg-transparent">
          <div className="min-w-0">
            <p className="en-text truncate text-[13px] font-bold text-stone-800" dir="ltr">{r.en}</p>
            <p className="truncate text-[12px] text-stone-500">{r.fa}</p>
          </div>
          <SpeakButton text={r.en} label={`روخوانی ${r.en}`} />
        </li>
      ))}
    </ul>
  );
}

function DialogueBody({ lines }: { lines: { speaker?: string | null; en: string; fa: string }[] }) {
  return (
    <ol className="space-y-2.5">
      {lines.map((l, i) => (
        <li key={i} className="rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white p-3 dark:bg-transparent">
          <div className="mb-1 flex items-center justify-between gap-2">
            {l.speaker ? (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {l.speaker}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-stone-500">{faNum(i + 1)}</span>
            )}
            <SpeakButton text={l.en} label={`روخوانی خط ${i + 1}`} />
          </div>
          <p className="en-text text-[13px] font-bold leading-6 text-stone-800" dir="ltr">{l.en}</p>
          <p className="mt-1 text-[12.5px] leading-6 text-stone-500">{l.fa}</p>
        </li>
      ))}
    </ol>
  );
}

function NotesBody({ paras }: { paras: string[] }) {
  return (
    <div className="space-y-2.5">
      {paras.map((p, i) => (
        <p key={i} className="rounded-xl bg-stone-50 p-3 text-[13px] leading-7 text-stone-700 dark:bg-stone-800/60 dark:text-stone-200">
          {p}
        </p>
      ))}
    </div>
  );
}

function ExamBody({ items, themeBg }: { items: string[]; themeBg: string }) {
  return (
    <ol className="space-y-2">
      {items.map((q, i) => (
        <li key={i} className="flex gap-2.5 rounded-xl border border-stone-200 dark:border-stone-700/60 bg-white p-3 dark:bg-transparent">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${themeBg}`}>
            {faNum(i + 1)}
          </span>
          <p className="text-[13px] leading-7 text-stone-700">{q}</p>
        </li>
      ))}
    </ol>
  );
}

function VerbsBody({ rows }: { rows: { forms: string[]; fa: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-stone-500">
            <th className="px-2 py-1.5 text-right">شکل‌ها</th>
            <th className="px-2 py-1.5 text-right">معنی</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v, i) => (
            <tr key={i} className="odd:bg-stone-50 dark:odd:bg-stone-800/40">
              <td className="px-2 py-2" dir="ltr">
                <span className="en-text text-[13px] font-bold text-stone-800">{v.forms.join(" · ")}</span>
              </td>
              <td className="px-2 py-2 text-[12.5px] text-stone-500">{v.fa}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
