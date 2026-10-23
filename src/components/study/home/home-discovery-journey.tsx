"use client";

// r349 — «سفرِ کشف» (discovery journey) — آنبوردینگِ هفتهٔ دوم؛ بدهیِ ممیزیِ
// r345 (بزرگترین گپِ UXِ باقیمانده). آنبوردینگِ روزِ نخست (onboarding.tsx +
// home-starter) سه قدم را میآموزد؛ این کارت از «اولین پیشرفت واقعی» به بعد
// همچنان میآموزد: ۹ دنیای وبکتاب، هر کدام با پرِشِ مستقیم.
//
// قراردادهای خانه که این فایل رعایت میکند:
//   • هیچ فیلدِ جدیدِ استور نیست — همهٔ پیشگویهای «کشف شد» از stateهایِ
//     persistشدهٔ موجود مشتق میشوند (بکآپ/سینک ابری رایگان میماند —
//     همان قاعدهٔ grammar-lesson.ts)؛ کارت صرفاً «خوانندهٔ» استور است.
//   • تحلیلِ صادقانه: فقط رویدادِ واقعیِ پرش (discovery_jump) ثبت میشود؛
//     چیپِ «کشف شد» دکمه نیست و رویدادی نمیفرستد.
//   • ترنزیشنهایِ اسکوپشده (paint-only) — قفلِ scoped-transitions؛ حلقهٔ
//     پیشرفت SVG است (الگوی daily-quests) نه نوارِ width.
//   • ارقامِ فارسی با faNum؛ aria-label برای هر چیپ؛ data-journey-* برای
//     کاوشِ زندهٔ پایدار (الگوی data-quiz-option).
//
// r356 — «شمارندههای نبض»: چیپِ کشفشده دیگر فقط «کشف شد» نیست — مصرفِ
// واقعیِ همان دنیا از دفترِ رویدادها (GET /api/event — بدونِ تغییرِ API)
// رویِ خطِ دوم مینشیند: «N بار این هفته» / «N بار تا امروز». نگاشتِ
// دنیا→رویداد و ریاضیِ جمع در تکحقیقتِ journey-counts.ts زندگی میکند؛
// واکشِ شکستخورده یا واگراییِ محلی-سرور ⇒ خطِ ثابتِ r349 — عددِ جعلی
// ممنوع (قاعدهٔ نبض/بودجه: دیدبانی، نه درستکاری).

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  BookOpen,
  ListChecks,
  Headphones,
  PenLine,
  Zap,
  Swords,
  Star,
  Library,
  GraduationCap,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { uiColors } from "@/lib/ui-colors";
import { trackEvent } from "@/lib/analytics";
import {
  JOURNEY_WORLD_EVENTS,
  journeyCounterState,
  sumJourneyEvents,
  useJourneyCounts,
  type JourneyCounterKind,
  type JourneyWorldKey,
} from "@/lib/journey-counts";

interface WorldDef {
  key: JourneyWorldKey; // تایپشده علیهِ نگاشتِ تکحقیقت — دنیایِ بی‌نگاشت کامپایل نمیشود
  icon: typeof Compass;
  title: string;
  desc: string;
  /** آکِسنتِ کاشیِ آیکون — حالتِ «کشفنشده» (تاریکش در globals.css اسکوپ شده) */
  accent: string;
  jump: () => void;
  discovered: boolean;
}

const TOTAL_WORLDS = 9;

export default function HomeDiscoveryJourney() {
  const mounted = useMounted();
  // r356 — شمارندههای نبض: یک GET کوچک؛ خطا/واگرایی ⇒ نقشههای خالی ⇒
  // خطِ ثابت — مسیرِ سقوط با مسیرِ موفقیت یکی است، بدونِ حالتِ میانی
  const counts = useJourneyCounts();
  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const srs = useStudy((s) => s.srs);
  const starredWords = useStudy((s) => s.starredWords);
  const libraryDone = useStudy((s) => s.libraryDone) ?? {};
  const konkurSeen = useStudy((s) => s.konkurSeen);
  const rushGames = useStudy((s) => s.rushGames);

  const openLesson = useStudy((s) => s.openLesson);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const setView = useStudy((s) => s.setView);

  // پیشگویهای «کشف شد» — خوانشِ خالصِ stateهایِ persistشدهٔ موجود
  const isQuizLike = useMemo(
    () =>
      Object.keys(results).some(
        (k) =>
          /^\d+:/.test(k) &&
          !k.includes("listening") &&
          !k.includes("dictation") &&
          !k.includes("writing") &&
          !k.includes("synant")
      ),
    [results]
  );

  const worlds: WorldDef[] = useMemo(
    () => [
      {
        key: "flashcards",
        icon: BookOpen,
        title: "فلش‌کارت‌ها",
        desc: "واژه را ببین، بشنو، بلد شو",
        accent: "bg-emerald-100 text-emerald-800",
        jump: () => openLesson(1, "smart"),
        discovered: Object.values(known).some(Boolean),
      },
      {
        key: "quiz",
        icon: ListChecks,
        title: "آزمونک‌های درس",
        desc: "محکِ چهارگزینه‌ای واژه‌ها",
        accent: "bg-teal-100 text-teal-700",
        jump: () => openLessonTab(1, "tests"),
        discovered: isQuizLike,
      },
      {
        key: "listening",
        icon: Headphones,
        title: "تمرین شنیدار",
        desc: "جمله را بشنو، گزینه را بزن",
        accent: "bg-sky-100 text-sky-700",
        jump: () => setView({ type: "listen" }),
        discovered: Object.keys(results).some((k) => k.includes(":listening")),
      },
      {
        key: "dictation",
        icon: PenLine,
        title: "دیکتهٔ واژه‌ها",
        desc: "املای حرف‌به‌حرف با نیم‌امتیاز",
        accent: "bg-amber-100 text-amber-700",
        jump: () => openLessonTab(1, "dictation"),
        discovered: Object.keys(results).some((k) => k.includes(":dictation")),
      },
      {
        key: "rush",
        icon: Zap,
        title: "مسابقهٔ برق‌آسا",
        desc: "۶۰ ثانیه — بیشترین پاسخ درست",
        accent: "bg-orange-100 text-orange-700",
        jump: () => setView({ type: "rush" }),
        discovered: rushGames > 0 || "rush" in results,
      },
      {
        key: "duel",
        icon: Swords,
        title: "نبرد واژه‌ها",
        desc: "مصاف زندهٔ دونفره با داور",
        accent: "bg-rose-100 text-rose-700",
        jump: () => setView({ type: "duel" }),
        discovered: "duel" in results,
      },
      {
        key: "mywords",
        icon: Star,
        title: "واژه‌های من",
        desc: "واژه‌های نشان‌شدهٔ خودت",
        accent: "bg-violet-100 text-violet-700",
        jump: () => setView({ type: "my-words" }),
        discovered: starredWords.length > 0,
      },
      {
        key: "library",
        icon: Library,
        title: "کتابخانهٔ داستان",
        desc: "داستان‌های کوتاه با پرسش",
        accent: "bg-lime-100 text-lime-700",
        jump: () => setView({ type: "library" }),
        discovered: Object.keys(libraryDone).length > 0,
      },
      {
        key: "konkur",
        icon: GraduationCap,
        title: "گوشهٔ کنکور",
        desc: "بانک ۳۶۰ سؤالی پایهٔ دوازدهم",
        accent: "bg-indigo-100 text-indigo-700",
        jump: () => setView({ type: "konkur" }),
        discovered: Object.keys(konkurSeen).length > 0,
      },
    ],
    [known, isQuizLike, results, rushGames, starredWords, libraryDone, konkurSeen, openLesson, openLessonTab, setView]
  );

  const discoveredCount = worlds.filter((w) => w.discovered).length;
  const allDone = discoveredCount === TOTAL_WORLDS;

  // گیتِ نمایش — همارزِ hasProgressِ home-view: تازهواردِ مطلق (روزِ نخست)
  // کارت را نمیبیند؛ مسیرِ شروع (home-starter) صاحبِ آن لحظه است.
  const hasProgress =
    Object.values(known).some(Boolean) ||
    Object.keys(results).length > 0 ||
    Object.keys(srs).length > 0 ||
    Object.keys(libraryDone).length > 0;

  if (!mounted || !hasProgress) return null;

  const overallPct = Math.round((discoveredCount / TOTAL_WORLDS) * 100);
  const subtitle = allDone
    ? "هر ۹ دنیای ویژن ۲ را دیدی — قهرمانِ کاوش!"
    : discoveredCount === 0
      ? "۹ دنیا برای کشف هست — با هر پرش یکی میآید وسط"
      : "دنیاهایِ باقیمانده هم منتظر تو هستند";

  const onJump = (w: WorldDef) => {
    trackEvent("discovery_jump");
    w.jump();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      aria-label="سفر کشف — نقشهٔ تجربههای وبکتاب"
      className="discovery-journey relative overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm"
    >
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-stone-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="j-head-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-600 text-white shadow-md shadow-sky-600/25">
            <Compass size={20} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-black text-stone-800">سفرِ کشف</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  allDone ? "bg-emerald-700 text-white" : "bg-sky-100 text-sky-700"
                }`}
              >
                {allDone ? "همه کشف شد!" : `${faNum(discoveredCount)} از ${faNum(TOTAL_WORLDS)}`}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] font-bold text-stone-500">{subtitle}</p>
          </div>
        </div>
        <div className="relative shrink-0" aria-hidden>
          <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
            <circle cx="26" cy="26" r="22" fill="none" stroke={uiColors.stone[200]} strokeWidth="5" />
            <circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              stroke={allDone ? uiColors.emerald[600] : uiColors.sky[500]}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 22}
              strokeDashoffset={2 * Math.PI * 22 * (1 - overallPct / 100)}
              style={{ transition: "stroke-dashoffset 0.7s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className={`text-[13px] font-black leading-none ${overallPct === 0 ? "text-stone-500" : "text-stone-700"}`}>
              {faNum(overallPct)}
              <span className="text-[9px]">٪</span>
            </span>
          </span>
        </div>
      </div>

      {/* worlds grid */}
      <ul className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {worlds.map((w) => {
          const Icon = w.icon;
          return (
            <li key={w.key}>
              {w.discovered ? (
                <JourneyDoneChip
                  title={w.title}
                  worldKey={w.key}
                  counter={journeyCounterState(
                    sumJourneyEvents(counts.week, JOURNEY_WORLD_EVENTS[w.key]),
                    sumJourneyEvents(counts.total, JOURNEY_WORLD_EVENTS[w.key])
                  )}
                />
              ) : (
                <button
                  data-journey-chip={w.key}
                  data-journey-state="todo"
                  onClick={() => onJump(w)}
                  aria-label={`${w.title} — پرش برای کشف`}
                  className="jrow group flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-right transition-[background-color,color,border-color,box-shadow] hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${w.accent}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-extrabold text-stone-800">{w.title}</span>
                    <span className="mt-0.5 block truncate text-[10.5px] font-bold text-stone-500">{w.desc}</span>
                  </span>
                  <ChevronLeft
                    size={14}
                    className="shrink-0 text-stone-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-sky-500"
                  />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

// ------------------------------------------------------------------
// r356 — چیپِ «کشف شد» با شمارندهٔ زنده. سه حالت:
//   active  ⇒ «N بار این هفته» — زمردی (همان تنِ r349)
//   dormant ⇒ «N بار تا امروز — برگرد و تمرین کن» — کهرباییِ گرم؛
//             کلاسِ text-amber-700 از خطِ تاریکِ موجودِ کرنل میگذرد
//             (قفلِ ⑫ِ r349 — رشدِ صفرِ CSS)
//   plain   ⇒ خطِ ثابتِ r349 «کشف شد — ادامه بده!» — واگراییِ محلی-سرور
//             یا شکستِ واکش هرگز عدد جعل نمیکند
// aria-label فقط وقتی غنی میشود که عددِ واقعی پشتش باشد؛ حالتِ plain
// همان برچسبِ یخزدهٔ r349 است (قفلِ ⑨ِ r349 با شکستِ واکش سبز میماند).
// ------------------------------------------------------------------
function JourneyDoneChip({
  title,
  worldKey,
  counter,
}: {
  title: string;
  worldKey: JourneyWorldKey;
  counter: { kind: JourneyCounterKind; week: number; total: number };
}) {
  const suffix =
    counter.kind === "active"
      ? `، ${faNum(counter.week)} بار این هفته`
      : counter.kind === "dormant"
        ? `، ${faNum(counter.total)} بار تا امروز`
        : "";
  const line =
    counter.kind === "active"
      ? `${faNum(counter.week)} بار این هفته — ادامه بده!`
      : counter.kind === "dormant"
        ? `${faNum(counter.total)} بار تا امروز — برگرد و تمرین کن`
        : "کشف شد — ادامه بده!";
  return (
    <div
      data-journey-chip={worldKey}
      data-journey-state="done"
      aria-label={`${title} — کشف شده${suffix}`}
      className="jrow flex w-full items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50/70 p-3"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
        <Check size={18} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-extrabold text-stone-800">{title}</span>
        <span
          data-journey-counter={worldKey}
          data-counter-kind={counter.kind}
          className={`mt-0.5 block truncate text-[10.5px] font-bold ${
            counter.kind === "dormant" ? "text-amber-700" : "text-emerald-600"
          }`}
        >
          {line}
        </span>
      </span>
    </div>
  );
}
