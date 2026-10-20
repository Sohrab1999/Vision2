"use client";

import { Sparkles, BookMarked, ClipboardCheck, GraduationCap, TrainFront, Swords, Ear, Eraser, Library, LibraryBig, Trophy, Star } from "lucide-react";
import { TOTAL_VOCABULARY, EXAM_BANK_SIZE } from "@/data/lesson-meta";
import { useStudy, summarize, srsDueTotal, firstLessonWithDue } from "@/lib/study-store";
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
  // r404 — badge «مرور سریع» حالا خطاهای کتابخانهٔ جزوه (سطل‌های g7..g12) را هم می‌شمارد
  const totalMistakes = mounted
    ? Object.values(mistakes).filter((c) => c > 0).length
    : 0;
  const konkurHardCount = mounted ? hardIdsOf(mistakes, konkurWrong).size : 0;

  return (
    <section aria-label="ابزارهای یادگیری">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-stone-800">
        <Sparkles size={19} className="text-amber-500" />
        ابزارهای ویژه
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[
          { icon: Sparkles, title: "تمرین هوشمند", desc: "جلسه‌ای که خودش از روی بانک خطا و مهارت‌های ضعیف تو ساخته می‌شود", onClick: () => setView({ type: "smart" as const }), color: "text-violet-600 bg-violet-50 border-violet-200" },
          { icon: BookMarked, title: "دیکشنری جستجو", desc: `${faNum(TOTAL_VOCABULARY)} واژهٔ سه درس با جستجوی فارسی و انگلیسی`, view: { type: "dictionary" as const }, color: "text-sky-600 bg-sky-50 border-sky-200" },
          { icon: Star, title: "واژه‌های من", desc: "واژه‌نامهٔ شخصی: ستاره‌هایت را مرور کن، تلفظ بشنو و بلدها را علامت بزن", view: { type: "my-words" as const }, color: "text-amber-600 bg-amber-50 border-amber-200", badge: starredCount },
          { icon: ClipboardCheck, title: "آزمون جامع", desc: `${faNum(EXAM_BANK_SIZE)} تست گردآوری از بانک ۳۶۰ تستی جزوه با تایمر`, view: { type: "exam" as const }, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { icon: GraduationCap, title: "گوشهٔ کنکور", desc: "سامانهٔ پوشش و تسلط بانک ۳۶۰تایی: نقشهٔ پیشرفت، شبیه‌ساز و تست‌های سخت", view: { type: "konkur" as const }, color: "text-orange-600 bg-orange-50 border-orange-200", badge: konkurHardCount },
          { icon: TrainFront, title: "متروی گرامر", desc: "نقشهٔ سفر گرامر کتاب: ۶ خط و ۱۵ ایستگاه واقعی؛ هر قاعده یک ایستگاه با درس، ترفند و آزمونک", onClick: () => setView({ type: "grammar" as const }), color: "text-teal-600 bg-teal-50 border-teal-200" },
          { icon: Swords, title: "نبرد دودنفره", desc: "مصاف زندهٔ واژگانی با یادگیرندهٔ دیگر: ۱۰ سؤال، ۱۵ ثانیه، داوری روی سرور", onClick: () => setView({ type: "duel" as const }), color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200" },
          { icon: Ear, title: "آزمون دیکته", desc: "املای شنیداری با روخوانی هوش مصنوعی و ثبت در SRS", onClick: () => openLessonTab(reviewLesson ?? 1, "dictation"), color: "text-violet-600 bg-violet-50 border-violet-200" },
          { icon: Eraser, title: "مرور سریع قبل امتحان", desc: "ترکیبی از غلط‌های اخیر — از سه درس و بانک ۳۶۰تا تا هر شش جزوه؛ پاسخ درست = حذف از بانک خطا", onClick: () => setView({ type: "review" as const }), color: "text-rose-600 bg-rose-50 border-rose-200", badge: totalMistakes },
          { icon: LibraryBig, title: "کتابخانهٔ جزوه‌ها", desc: "استخراج کامل ۶ جزوهٔ پایهٔ ۷ تا ۱۲: واژگان، ترجمه، گرامر، تست و پاسخنامه — با جست‌وجو", onClick: () => setView({ type: "jozve" as const }), color: "text-amber-700 bg-amber-50 border-amber-200" },
          { icon: Library, title: "ضمیمهٔ کتاب", desc: "افعال بی‌قاعده، جدول تلفظ IPA و اجزای کلام", view: { type: "appendix" as const }, color: "text-amber-600 bg-amber-50 border-amber-200" },
          { icon: Trophy, title: "کارنامهٔ من", desc: "گزارش کامل پیشرفت: رکوردها، مهارت‌ها و فعالیت هفته", onClick: () => window.dispatchEvent(new CustomEvent("open-report")), color: "text-stone-600 bg-stone-50 border-stone-200", custom: true },
        ].map((tool) => (
          <button
            key={tool.title}
            onClick={() => ("onClick" in tool && tool.onClick ? tool.onClick() : setView((tool as { view: { type: "dictionary" } }).view))}
            className="relative rounded-2xl border c-card p-4 text-right shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            {"badge" in tool && typeof tool.badge === "number" && tool.badge > 0 && (
              <span className="absolute left-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow-md shadow-rose-500/30">
                {faNum(tool.badge)}
              </span>
            )}
            <span className={`mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${tool.color}`}>
              <tool.icon size={19} />
            </span>
            <h3 className="mb-1 text-sm font-extrabold text-stone-800">{tool.title}</h3>
            <p className="text-[12px] leading-6 text-stone-500">{tool.desc}</p>
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
