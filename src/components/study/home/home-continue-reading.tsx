"use client";

// راند ۲۹۷ «کتاب‌خانه همه‌جا» — کارتِ «ادامهٔ خواندن» روی خانه.
// حلقهٔ بازگشت به کتاب‌خانه: یادگیری که کتابخانه را شروع کرده، همین‌جا
// داستانِ بعدیِ نخوانده‌اش را می‌بیند (ترتیبِ کتاب: s1→s2→s3) و با یک
// کلیک وارد خواننده می‌شود. تازه‌وارد (صفر داستان) این کارت را نمی‌بیند —
// کشفِ کتاب‌خانه با ابزارِ خانه است؛ و هر ۵۱ داستانِ تمام = کارتِ جشن.
// شمارش فقط از libraryProgress (منبعِ یگانه با هفته‌نامه و نمودار).
//
// راند ۳۰۱ «استریکِ کتابخوانی» — چیپِ زنجیرهٔ روزهای پیوستهٔ خواندن
// (منبعِ یگانه: dayHistory.stories از r299؛ قراردادِ خالصِ library-streak)
// + چیپِ واژه/دقیقهٔ داستانِ بعدی (همان توابعِ library-filter که فهرستِ
// r300 میخواند — هیچ شمارشِ موازی‌ای).

import { motion } from "framer-motion";
import { BookMarked, BookOpen, ChevronLeft, Flame, PartyPopper, RotateCcw } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { bookById, type HillBookId } from "@/data/hill-stories";
import { libraryProgress } from "@/lib/library-progress";
import { storyStreak } from "@/lib/library-streak";
import { readingMinutes, wordCount } from "@/lib/library-filter";
import { todayStr } from "@/state/day-engine";

// تمِ کتاب‌خانه — کلاس‌های کامل و ثابت (هم‌الگوی THEME در library-view؛
// پاک‌سازِ Tailwind امن می‌ماند)
const THEME: Record<HillBookId, { grad: string; chip: string; text: string; ring: string }> = {
  s1: {
    // r327 — سفیدِ CTA/آواتار رویِ استاپِ -۵۰۰ میمرد (زمرد ۵۰۰ = ۲٫۴۷)؛
    // جفتِ عمیق تا سفید رویِ هر دو استاپ ≥۴٫۵ بماند (زنده: ۵٫۳۶/۹٫۶۳)
    grad: "from-emerald-700 to-emerald-900",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    text: "text-emerald-700",
    ring: "bg-emerald-700",
  },
  s2: {
    // r327 — همان جراحی: ۴۰۰/۶۰۰ → ۷۰۰/۹۵۰ — تهِ -۷۰۰ در تاریک به
    // #fdba74 بازمیگردد (توکنِ orange-700، globals:201) پس -۹۵۰
    grad: "from-amber-700 to-orange-950",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    text: "text-amber-700",
    ring: "bg-amber-500",
  },
  s3: {
    // r327 — بنفشِ ۵۰۰ سفید را ۴٫۲۳ میگیرد → ۶۰۰/۷۰۰ (زنده: ۵٫۸۹/۷٫۰۷)
    grad: "from-violet-600 to-purple-700",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
    text: "text-violet-700",
    ring: "bg-violet-600",
  },
};

export default function HomeContinueReading() {
  const openLibraryStory = useStudy((s) => s.openLibraryStory);
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();
  // گاردِ ?? بیرونِ سلکتور — هم‌الگوی Task 292 در library-view
  const done = useStudy((s) => s.libraryDone) ?? {};
  const dayHistory = useStudy((s) => s.dayHistory) ?? {};

  // تازه‌وارد: هیچ. کارتِ شروعِ خانه راه را نشان میدهد؛ ابزارِ خانه کتاب‌خانه را.
  if (!mounted) return null;
  const prog = libraryProgress(done);
  if (prog.doneCount === 0) return null;

  const openLibrary = () => setView({ type: "library" });

  if (prog.complete) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
        aria-label="سه‌گانهٔ داستان‌ها تمام شد"
        className="overflow-hidden rounded-2xl border border-teal-200 c-card-elevated shadow-sm"
      >
        <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-teal-500 to-violet-500" />
        <div className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-violet-600 text-white shadow-lg shadow-teal-700/25"
            aria-hidden
          >
            <PartyPopper size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-black text-stone-800">
              هر سه کتاب را تمام کردی! 🎉
            </h2>
            <p className="mt-0.5 text-[12px] font-bold leading-6 text-stone-500">
              هر {faNum(prog.total)} داستانِ دکتر هیل خوانده شد — از «Introductory» تا «Intermediate».
              با بازخوانی، روان‌خوانی‌ات را ماندگار کن.
            </p>
          </div>
          <button
            type="button"
            onClick={openLibrary}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-2.5 text-[12.5px] font-black text-white shadow-md transition-[background-color,transform] hover:opacity-90 active:scale-[0.96]"
          >
            <RotateCcw size={14} aria-hidden />
            بازخوانی از ابتدا
          </button>
        </div>
      </motion.section>
    );
  }

  const next = prog.nextStory!;
  const book = bookById(next.book);
  const t = THEME[next.book];
  // استریکِ کتابخوانی — هم‌قراردادِ زنجیرهٔ اصلی: امروز خوانده = ادامهٔ
  // امروز؛ فقطِ دیروز = زنجیرهٔ زنده (امروز بخوان تا ننشیند)؛ شکاف = صفر.
  const streak = storyStreak(dayHistory, todayStr());
  // متادیتای خواندنِ داستانِ بعدی — همان توابعِ فهرستِ کتاب‌خانه (r300)
  const words = wordCount(next.text);
  const mins = readingMinutes(words);

  const streakChipClass =
    streak.current > 0
      ? streak.readToday
        ? "border-amber-300 bg-amber-50 text-amber-700"
        : "border-stone-300 bg-stone-100 text-stone-600"
      : "border-stone-200 bg-stone-50 text-stone-500";
  const streakLabel =
    streak.current > 0
      ? streak.readToday
        ? `زنجیرهٔ خواندن — ${faNum(streak.current)} روز`
        : `${faNum(streak.current)} روز پیوسته — امروز بخوان`
      : "شروعِ زنجیرهٔ خواندن";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
      aria-label="ادامهٔ خواندن داستان‌ها"
      className="overflow-hidden rounded-2xl border border-teal-200 c-card-elevated shadow-sm"
    >
      <div className={`h-1.5 w-full bg-gradient-to-l ${t.grad}`} />
      <div className="p-5 sm:p-6">
        {/* سطرِ سربرگ تضمین‌دوخطی نیست — h2 و چیپ‌ها با flex-wrap میراقند
            (درسِ له‌شدگیِ r300: هیچ flex-1 با basisِ صفر هم‌سطرِ چیپ‌ها) */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <BookMarked size={16} className="text-teal-600" aria-hidden />
          <h2 className="text-[13px] font-black text-stone-700">ادامهٔ خواندن</h2>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${t.chip}`}
          >
            {book?.levelFa ?? "Stories for Reproduction"}
          </span>
          <span
            className={`ms-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${streakChipClass}`}
            aria-label={streakLabel}
          >
            <Flame size={11} aria-hidden className={streak.readToday && streak.current > 0 ? "text-amber-500" : "text-stone-500"} />
            {streakLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.grad} text-white shadow-md`}
            aria-hidden
          >
            <BookOpen size={22} />
          </span>
          <div className="min-w-[160px] flex-1">
            <p dir="ltr" className="truncate text-left text-[15px] font-black text-stone-800">
              {next.title}
            </p>
            <p className="mt-0.5 text-[11.5px] font-bold text-stone-500">
              {book?.faTitle} · داستان {faNum(next.num)} — داستانِ بعدیِ تو
            </p>
            <p className="mt-1 flex items-center gap-1 text-[10.5px] font-bold text-stone-500">
              <BookOpen size={11} aria-hidden />
              {faNum(words)} واژه · حدود {faNum(mins)} دقیقه
            </p>
          </div>
          {/* موبایل: دکمهٔ تمام‌عرض زیرِ عنوان — دسکتاپ: هم‌ردیفِ آن؛
              کلیک = ورود مستقیم به خوانندهٔ همین داستان (نیتِ r297) */}
          <button
            type="button"
            onClick={() => openLibraryStory(next.id)}
            className={`inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br ${t.grad} px-4 py-2.5 text-[12.5px] font-black text-white shadow-md transition-[background-color,transform] hover:opacity-90 active:scale-[0.96] sm:w-auto`}
          >
            بخوان و جواب بزن
            <ChevronLeft size={15} aria-hidden />
          </button>
        </div>

        {/* نوار پیشرفت کل کتاب‌خانه — از منبعِ یگانه */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10.5px] font-black text-stone-500">
            <span>
              {faNum(prog.doneCount)} از {faNum(prog.total)} داستان
            </span>
            <span>{faNum(prog.percent)}٪</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-stone-200"
            role="progressbar"
            aria-valuenow={prog.doneCount}
            aria-valuemin={0}
            aria-valuemax={prog.total}
            aria-label="پیشرفت کتاب‌خانه"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, prog.percent)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${t.ring}`}
            />
          </div>
        </div>

        {/* r304 — نوارِ رکوردِ زنجیره: جاری در برابرِ رکورد (چالشِ «به رکورد برس»).
            از ۲ روزِ سابقه ظاهر میشود (یک روز = نویز)؛ مسدودِ بلوکی زیرِ نوارِ
            پیشرفت است — هیچ flex-1 با آن هم‌سطر نیست (درسِ هندسهٔ r300).
            ۰ از N هم صادق است: زنجیرهٔ شکسته دعوتِ بازگشت میشود. */}
        {streak.longest >= 2 && (
          <div className="mt-2.5">
            <div className="mb-1 flex items-center gap-1 text-[10px] font-black text-stone-500">
              <Flame
                size={10}
                aria-hidden
                className={streak.current > 0 && streak.current >= streak.longest ? "text-amber-500" : "text-stone-500"}
              />
              <span aria-label={`رکوردِ زنجیرهٔ خواندن: ${faNum(streak.longest)} روز`}>
                {streak.current >= streak.longest
                  ? `به رکورد رسیدی — ${faNum(streak.longest)} روز`
                  : `${faNum(streak.current)} از ${faNum(streak.longest)} روزِ رکورد`}
              </span>
            </div>
            <div
              className="c-track-70 h-1.5 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={streak.current}
              aria-valuemin={0}
              aria-valuemax={streak.longest}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((streak.current / streak.longest) * 100))}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                className={`h-full rounded-full ${
                  streak.current >= streak.longest
                    ? "bg-gradient-to-l from-amber-400 to-amber-500"
                    : "bg-amber-400"
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
