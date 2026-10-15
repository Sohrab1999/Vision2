"use client";

import { Sparkles, BookMarked, ClipboardCheck, GraduationCap, TrainFront, Swords, Ear, Eraser, Library, Trophy, Star, Play } from "lucide-react";
import { TOTAL_VOCABULARY, EXAM_BANK_SIZE } from "@/data/lesson-meta";
import { GRAMMAR_LINES, GRAMMAR_STATION_TOTAL } from "@/data/grammar-map";
import { useStudy, summarize, srsDueTotal, firstLessonWithDue, mistakesOfLesson } from "@/lib/study-store";
import { readAppendixResume, APPENDIX_SCOPE_LABELS, type AppendixResumeItem } from "@/lib/bg-reading";
import { hardIdsOf } from "@/lib/konkur";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";

// شبکهٔ «ابزارهای ویژه» — ده میان‌بر به سطوح تمرین و گزارش

export default function HomeTools() {
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const setView = useStudy((s) => s.setView);
  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const srs = useStudy((s) => s.srs);
  const mistakes = useStudy((s) => s.mistakes);
  const konkurWrong = useStudy((s) => s.konkurWrong);
  const starredCount = useStudy((s) => s.starredWords.length);
  const mounted = useMounted();

  const summary = mounted ? summarize(known, results) : { knownCount: 0, totalPercent: 0, doneCategories: 0, bestExam: null };
  const reviewLesson = mounted ? firstLessonWithDue(srs) : null;
  const totalMistakes = mounted
    ? mistakesOfLesson(mistakes, 0) + mistakesOfLesson(mistakes, 1) + mistakesOfLesson(mistakes, 2) + mistakesOfLesson(mistakes, 3)
    : 0;
  const konkurHardCount = mounted ? hardIdsOf(mistakes, konkurWrong).size : 0;

  // راند ۲۳۳/۲۳۴ — «ادامهٔ مطالعه»: آخرینِ دیده‌شده در هر لایهٔ ضمیمه
  // (درسنامهٔ جامع / اجزای کلماتی / افعال بی‌قاعده) — رکوردِ خودکفایِ
  // localStorageِ bg-reading (بدونِ هیچ importِ سنگین در پوستهٔ eagerِ خانه،
  // قراردادِ Task-44). هیچ رکوردی = کارت مثلِ سابق.
  const resume: AppendixResumeItem | null = mounted ? readAppendixResume() : null;
  const openAppendixTopic = useStudy((s) => s.openAppendixTopic);
  const openAppendixPosTable = useStudy((s) => s.openAppendixPosTable);
  const openAppendixVerb = useStudy((s) => s.openAppendixVerb);
  const openAppendixPhoneme = useStudy((s) => s.openAppendixPhoneme);
  const openAppendixAbbrev = useStudy((s) => s.openAppendixAbbrev);

  return (
    <section aria-label="ابزارهای یادگیری" className="tools-grid">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-stone-800">
        <Sparkles size={19} className="text-amber-500" />
        ابزارهای ویژه
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[
          { icon: Sparkles, title: "تمرین هوشمند", desc: "جلسه‌ای که خودش از روی بانک خطا و مهارت‌های ضعیف تو ساخته می‌شود", onClick: () => setView({ type: "smart" as const }), color: "text-violet-600" },
          { icon: BookMarked, title: "دیکشنری جستجو", desc: `${faNum(TOTAL_VOCABULARY)} واژهٔ کتاب با جستجوی فارسی و انگلیسی`, view: { type: "dictionary" as const }, color: "text-sky-600" },
          { icon: Star, title: "واژه‌های من", desc: "واژه‌نامهٔ شخصی: ستاره‌هایت را مرور کن، تلفظ بشنو و بلدها را علامت بزن", view: { type: "my-words" as const }, color: "text-amber-600", badge: starredCount },
          { icon: ClipboardCheck, title: "آزمون جامع", desc: `${faNum(EXAM_BANK_SIZE)} تست گردآوری از بانک ۳۶۰ تستی جزوه با تایمر`, view: { type: "exam" as const }, color: "text-emerald-600" },
          { icon: GraduationCap, title: "گوشهٔ کنکور", desc: "سامانهٔ پوشش و تسلط بانک ۳۶۰تایی: نقشهٔ پیشرفت، شبیه‌ساز و تست‌های سخت", view: { type: "konkur" as const }, color: "text-orange-600", badge: konkurHardCount },
          { icon: TrainFront, title: "متروی گرامر", desc: `نقشهٔ سفر گرامر کتاب: ${faNum(GRAMMAR_LINES.length)} خط و ${faNum(GRAMMAR_STATION_TOTAL)} ایستگاه واقعی؛ هر قاعده یک ایستگاه با درس، ترفند و آزمونک`, onClick: () => setView({ type: "grammar" as const }), color: "text-teal-600" },
          { icon: Swords, title: "نبرد دودنفره", desc: "مصاف زندهٔ واژگانی با یادگیرندهٔ دیگر: ۱۰ سؤال، ۱۵ ثانیه، داوری روی سرور", onClick: () => setView({ type: "duel" as const }), color: "text-fuchsia-600" },
          { icon: Ear, title: "آزمون دیکته", desc: "املای شنیداری با روخوانی هوش مصنوعی و ثبت در SRS", onClick: () => openLessonTab(reviewLesson ?? 1, "dictation"), color: "text-violet-600" },
          { icon: Eraser, title: "مرور سریع قبل امتحان", desc: "ترکیبی از غلط‌های اخیر ۳ درس و بانک ۳۶۰تا؛ پاسخ درست = حذف از بانک خطا", onClick: () => setView({ type: "review" as const }), color: "text-rose-600", badge: totalMistakes },
          { icon: Library, title: "ضمیمهٔ کتاب", desc: "افعال بی‌قاعده، جدول تلفظ IPA و اجزای کلام", view: { type: "appendix" as const }, color: "text-amber-600", resume },
          { icon: Trophy, title: "کارنامهٔ من", desc: "گزارش کامل پیشرفت: رکوردها، مهارت‌ها و فعالیت هفته", onClick: () => window.dispatchEvent(new CustomEvent("open-report")), color: "text-stone-600", custom: true },
        ].map((tool) => (
          <button
            key={tool.title}
            onClick={() => {
              if ("onClick" in tool && tool.onClick) {
                tool.onClick();
                return;
              }
              // راند ۲۳۳/۲۳۴/۲۳۵ — نشانگرِ «ادامهٔ مطالعه» موجود است؟ پرشِ عمیقِ همان لایه
              // (r221 درسنامه / r224 جدولِ pos / r234 سطرِ فعل / r235 واک و نشانه)؛
              // نبودِ رکورد = ضمیمهٔ ساده
              if ("resume" in tool && tool.resume) {
                const r = tool.resume;
                if (r.scope === "grammar") openAppendixTopic(r.id);
                else if (r.scope === "pos") openAppendixPosTable(r.id);
                else if (r.scope === "phonetics") openAppendixPhoneme(r.id);
                else if (r.scope === "abbrev") openAppendixAbbrev(r.id);
                else openAppendixVerb(r.id);
                return;
              }
              setView((tool as { view: { type: "dictionary" } }).view);
            }}
            {...("resume" in tool && tool.resume
              ? { title: `ادامهٔ مطالعه از «${tool.resume.title}» در ${APPENDIX_SCOPE_LABELS[tool.resume.scope]}${tool.resume.hint ? ` — ${tool.resume.hint}` : ""}` }
              : {})}
            className={`relative rounded-2xl border c-card p-4 text-right shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.96] ${
              "resume" in tool && tool.resume ? "ring-2 ring-emerald-200 dark:ring-emerald-800" : ""
            }`}
          >
            {"badge" in tool && typeof tool.badge === "number" && tool.badge > 0 && (
              <span className="absolute left-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow-md shadow-rose-500/30">
                {faNum(tool.badge)}
              </span>
            )}
            <span className={`mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-stone-50 border-stone-200 ${tool.color}`}>
              <tool.icon size={19} />
            </span>
            <h3 className="mb-1 text-sm font-extrabold text-stone-800">{tool.title}</h3>
            <p className="text-[12px] leading-6 text-stone-500">{tool.desc}</p>
            {"resume" in tool && tool.resume && (
              <p className="mt-2 flex items-center gap-1 text-[12px] font-bold text-emerald-700 dark:text-emerald-300">
                <Play size={12} className="shrink-0" />
                <span className="min-w-0 truncate">
                  ادامه از «{tool.resume.title}»{tool.resume.hint ? ` — ${tool.resume.hint}` : ""}
                </span>
              </p>
            )}
            {tool.custom && (
              <p className="mt-2 text-[12px] font-bold text-emerald-700">
                {faNum(summary.knownCount)} واژه بلدم · میانگین {faNum(summary.totalPercent)}٪
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
