"use client";

// Task 290 «کتاب‌خانهٔ داستان‌ها» — سریِ کلاسیک Stories for Reproduction
// (L. A. Hill, Oxford) در سه سطحِ ۷۵۰/۱۰۰۰/۱۵۰۰ واژهٔ پایه.
// خواندنِ آزادِ انگلیسی با روخوانیِ هوش مصنوعی + آزمونِ صحیح/غلطِ کتاب
// (بخشِ A) + پرسش‌های تشریحی (بخشِ B) + واژه‌نامهٔ فارسی.
// پیشرفت در اسلایسِ library (markStoryDone) ذخیره و با سطرِ SyncField
// «libraryDone» در پشتیبان/همگام‌سازی سفر می‌کند.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Library as LibraryIcon,
  Check,
  X,
  ChevronLeft,
  ChevronDown,
  BookMarked,
  ListChecks,
  Languages,
  RotateCcw,
  Search,
  Sparkles,
  Flame,
} from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import {
  HILL_BOOKS,
  HILL_TOTAL_STORIES,
  storiesOfBook,
  storyById,
  bookById,
  type HillBook,
  type HillStory,
} from "@/data/hill-stories";
import { libraryProgress } from "@/lib/library-progress";
import { storyStreak } from "@/lib/library-streak";
import { daysAgoKey } from "@/state/day-engine";
import {
  filterStoryIds,
  readingMinutes,
  wordCount,
  type StoryFilter,
} from "@/lib/library-filter";
import SpeakButton from "../shared/speak-button";
import { useToast } from "@/hooks/use-toast";

// نقشهٔ تمِ هر کتاب — کلاس‌های کامل و ثابت (پاک‌سازِ Tailwind امن می‌ماند)
const THEME: Record<
  HillBook["theme"],
  { border: string; chip: string; grad: string; soft: string; text: string }
> = {
  emerald: {
    border: "border-emerald-200",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    // r327 — سفیدِ متن رویِ استاپِ -۵۰۰ میمرد (۲٫۴۷) → جفتِ عمیق (۵٫۳۶/۹٫۶۳)
    grad: "from-emerald-700 to-emerald-900",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
  },
  amber: {
    border: "border-amber-200",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    // r327 — ۴۰۰/۶۰۰ → ۷۰۰/۹۵۰ — تهِ -۷۰۰ در تاریک بازنگشتِ توکن است
    grad: "from-amber-700 to-orange-950",
    soft: "bg-amber-50",
    text: "text-amber-700",
  },
  violet: {
    border: "border-violet-200",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
    // r327 — بنفشِ ۵۰۰ سفید را ۴٫۲۳ میگیرد → ۶۰۰/۷۰۰ (۵٫۸۹/۷٫۰۷)
    grad: "from-violet-600 to-purple-700",
    soft: "bg-violet-50",
    text: "text-violet-700",
  },
};

// r300 — چیپ‌های صافیِ وضعیتِ خواندن؛ شمارش‌ها از منبعِ یگانه (libraryProgress)
const FILTER_CHIPS: { id: StoryFilter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "unread", label: "نخوانده" },
  { id: "read", label: "خوانده‌شده" },
];

export default function LibraryView() {
  const mounted = useMounted();
  // Task 292 — defensive `?? {}`: hydration of a corrupted/legacy payload
  // must degrade to «zero progress», never crash the whole app.
  // r298 — گاردِ ?? داخلِ memo: مرجعِ پایدار برای کامپایلرِ react
  // (با ?? خالیِ هر رندر، حفظِ memo رد میشد — درسِ lint)
  const libraryDoneRaw = useStudy((s) => s.libraryDone);
  const libraryDone = useMemo(() => libraryDoneRaw ?? {}, [libraryDoneRaw]);
  const dayHistoryRaw = useStudy((s) => s.dayHistory);
  const dayHistory = useMemo(() => dayHistoryRaw ?? {}, [dayHistoryRaw]);
  // r302 — سطحِ سومِ عرضهٔ استریک: چیپِ سربرگِ کتابخانه — همان قراردادِ
  // سه‌حالتهٔ r301 (منبعِ یگانه: dayHistory.stories از r299)
  const readStreak = useMemo(() => storyStreak(dayHistory, daysAgoKey(0)), [dayHistory]);
  const markStoryDone = useStudy((s) => s.markStoryDone);
  // r297 — نیتِ «ادامهٔ خواندن»: کارتِ خانه میتواند مستقیم یک داستان را بخواهد؛
  // lazy-init بدونِ فلشِ فهرست، و مصرفِ نیت در یک اثرِ یک‌بار (هم‌الگوی flashIntent)
  const [openStoryId, setOpenStoryId] = useState<string | null>(
    () => useStudy.getState().libraryIntent ?? null,
  );
  useEffect(() => {
    if (useStudy.getState().libraryIntent) useStudy.getState().consumeLibraryIntent();
  }, []);
  const { toast } = useToast();

  // r300 «کتابخانهٔ هوشمند» — جست‌وجو و صافیِ فهرست؛ منبعِ یگانهٔ پیشرفت
  // همان libraryProgress است (هم‌قراردادِ کارتِ خانه/نمودار/هفته‌نامه).
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StoryFilter>("all");
  const prog = libraryProgress(libraryDone);
  const visibleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const book of HILL_BOOKS) {
      for (const id of filterStoryIds(storiesOfBook(book.id), libraryDone, query, filter)) {
        ids.add(id);
      }
    }
    return ids;
  }, [libraryDone, query, filter]);
  const totalVisible = visibleIds.size;
  const queryActive = query.trim() !== "" || filter !== "all";
  const chipCounts: Record<StoryFilter, number> = {
    all: prog.total,
    unread: Math.max(0, prog.total - prog.doneCount),
    read: prog.doneCount,
  };
  const story = openStoryId ? storyById(openStoryId) : undefined;
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-4">
      {/* ---------- سرِ صفحه ---------- */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-black text-stone-800">
            <LibraryIcon size={22} className="text-teal-600" aria-hidden />
            کتاب‌خانهٔ داستان‌ها
          </h1>
          <p className="mt-1 text-[12.5px] leading-6 text-stone-500">
            سریِ کلاسیکِ <span dir="ltr" className="font-bold">Stories for Reproduction</span> (دکتر
            L. A. Hill) — بخوان، گوش کن، و بخشِ «درست یا نادرست» را جواب بزن.
          </p>
        </div>
        {mounted && (
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-[12px] font-black text-teal-700"
              aria-label="پیشرفت کل کتاب‌خانه"
            >
              <BookMarked size={14} aria-hidden />
              {faNum(prog.doneCount)} از {faNum(HILL_TOTAL_STORIES)} داستان
            </span>
            {/* r302 — چیپِ استریک: فقط با سابقه (current>0 || longest>0) تا
                سربرگِ تازه‌وارد شلوغ نشود؛ برچسب‌ها عینِ کارتِ خانه */}
            {(readStreak.current > 0 || readStreak.longest > 0) && (
              <span
                className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-[11px] font-black ${
                  readStreak.current > 0
                    ? readStreak.readToday
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-stone-300 bg-stone-100 text-stone-600"
                    : "border-stone-200 bg-stone-50 text-stone-500"
                }`}
                aria-label="زنجیرهٔ روزهای خواندن داستان"
              >
                <Flame
                  size={12}
                  aria-hidden
                  className={readStreak.readToday && readStreak.current > 0 ? "text-amber-500" : "text-stone-500"}
                />
                {readStreak.current > 0
                  ? readStreak.readToday
                    ? `زنجیرهٔ خواندن — ${faNum(readStreak.current)} روز`
                    : `${faNum(readStreak.current)} روز پیوسته — امروز بخوان`
                  : "شروعِ زنجیرهٔ خواندن"}
              </span>
            )}
          </div>
        )}
      </div>

      {story ? (
        <StoryReader
          story={story}
          onBack={() => setOpenStoryId(null)}
          onFinish={(score, total) => {
            markStoryDone(story.id, score, total);
            toast({
              title: "داستان تمام شد!",
              description: `نمرهٔ صحیح/غلط: ${faNum(score)} از ${faNum(total)}`,
            });
          }}
          doneEntry={mounted ? libraryDone[story.id] : undefined}
        />
      ) : (
        <>
          {/* r300 — نوارِ جست‌وجو و صافیِ وضعیتِ خواندن */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                aria-hidden
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جست‌وجوی عنوانِ انگلیسی یا شمارهٔ داستان…"
                aria-label="جست‌وجو در داستان‌های کتاب‌خانه"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-9 text-[12.5px] font-bold text-stone-700 outline-none transition-colors placeholder:font-normal placeholder:text-stone-500 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 transition-colors hover:text-stone-600"
                  aria-label="پاک‌کردن جست‌وجو"
                >
                  <X size={14} aria-hidden />
                </button>
              )}
            </div>
            {FILTER_CHIPS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11.5px] font-black transition-colors ${
                  filter === f.id
                    ? "border-teal-600 bg-teal-700 text-white shadow-sm"
                    : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:text-stone-600"
                }`}
              >
                {f.label}
                <span className="text-[10px] font-bold">
                  {mounted ? faNum(chipCounts[f.id]) : "–"}
                </span>
              </button>
            ))}
          </div>

          {totalVisible === 0 ? (
            /* r300 — حالتِ خالیِ صادق: هیچ داستانی با این جست‌وجو/صافی */
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
              <Search size={22} className="mx-auto mb-2 text-stone-300" aria-hidden />
              <p className="text-[13px] font-black text-stone-600">داستانی پیدا نشد</p>
              <p className="mt-1 text-[11.5px] leading-5 text-stone-500">
                عنوانِ انگلیسی را کامل‌تر بنویس یا شمارهٔ داستان را امتحان کن — مثلاً{" "}
                <span dir="ltr" className="font-bold">jones</span> یا{" "}
                <span className="font-bold">۱۲</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="mt-3 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-[11.5px] font-black text-stone-600 transition-colors hover:bg-stone-100"
              >
                پاک‌کردن جست‌وجو و صافی
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {HILL_BOOKS.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={i}
                  mounted={mounted}
                  doneOf={libraryDone}
                  onOpen={setOpenStoryId}
                  visible={visibleIds}
                  nextId={prog.nextStory?.id ?? null}
                  queryActive={queryActive}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------

function BookCard({
  book,
  index,
  mounted,
  doneOf,
  onOpen,
  visible,
  nextId,
  queryActive,
}: {
  book: HillBook;
  index: number;
  mounted: boolean;
  doneOf: Record<string, { score: number; total: number; day: string }>;
  onOpen: (storyId: string) => void;
  /** r300 — شناسه‌های هم‌نوا از منبعِ یگانه (filterStoryIds) */
  visible: Set<string>;
  /** r300 — نخستین داستانِ نخوانده (libraryProgress) — چیپِ «بعدیِ تو» */
  nextId: string | null;
  /** r300 — جست‌وجو یا صافی فعال است؟ (نمایشِ «یافته‌شده» به‌جای نوارِ پیشرفت) */
  queryActive: boolean;
}) {
  const t = THEME[book.theme];
  const stories = storiesOfBook(book.id);
  const doneN = mounted ? stories.filter((s) => doneOf[s.id]).length : 0;
  // r300 — سطرهای هم‌نوا؛ کتابِ خالی در حالتِ جست‌وجو اصلاً رندر نمیشود
  const shown = stories.filter((s) => visible.has(s.id));
  if (shown.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.28, ease: "easeOut" }}
      aria-label={book.faTitle}
      className={`rounded-2xl border ${t.border} c-card-elevated p-5 shadow-sm`}
    >
      {/* r300 — رفعِ فشردگیِ سرِ کتاب در موبایل: عنوان و چیپ‌ها دو سطرِ جدای
          تضمین‌شده‌اند (قبلاً flex-1 با basisِ صفر در یک سطرِ flex-wrap با
          چیپ‌ها تا ۱۴px له میشد — کشفِ هندسهٔ زندهٔ QA). */}
      <div className="mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.grad} text-white shadow-md`}
            aria-hidden
          >
            <BookOpen size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-black text-stone-800">{book.faTitle}</h2>
            <p dir="ltr" className="text-left text-[11px] font-bold text-stone-500">
              {book.enTitle}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-black ${t.chip}`}>
            {book.levelFa}
          </span>
          {mounted && (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10.5px] font-black text-stone-600">
              {faNum(doneN)} از {faNum(stories.length)} خوانده‌شده
            </span>
          )}
          {mounted && queryActive && (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10.5px] font-black text-teal-700">
              {faNum(shown.length)} داستانِ یافته‌شده
            </span>
          )}
        </div>
      </div>
      <p className="mb-3 text-[12px] leading-6 text-stone-500">{book.desc}</p>

      {/* r300 — نوارِ پیشرفتِ نازکِ هر کتاب (فقط حالتِ مرور) — با scaleXِ
          paint-only (درسِ قفلِ scoped-transitions: پهنا = reflow، transform = paint) */}
      {mounted && !queryActive && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100" aria-hidden>
          <div
            className={`h-full w-full origin-right rounded-full bg-gradient-to-r ${t.grad} transition-transform duration-500`}
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, doneN / Math.max(1, stories.length)))})`,
            }}
          />
        </div>
      )}

      <ul role="list" className="flex flex-col gap-1.5">
        {shown.map((s) => {
          const done = mounted ? doneOf[s.id] : undefined;
          // r300 — برچسبِ واژه/دقیقه از متنِ واقعی (wordCount/readingMinutes)
          const wc = wordCount(s.text);
          const mins = readingMinutes(wc);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpen(s.id)}
                className={`flex w-full items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5 text-right transition-[background-color,border-color,transform] hover:border-stone-200 hover:bg-stone-100 active:scale-[0.96] ${
                  done ? t.soft : ""
                }`}
                aria-label={`داستان ${faNum(s.num)}: ${s.title}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                    done
                      ? `bg-gradient-to-br ${t.grad} text-white`
                      : "border border-stone-200 bg-white text-stone-500"
                  }`}
                  aria-hidden
                >
                  {faNum(s.num)}
                </span>
                <span
                  dir="ltr"
                  className="min-w-0 flex-1 truncate text-left text-[13px] font-bold text-stone-700"
                >
                  {s.title}
                </span>
                {/* r300 — متادیتای خواندن؛ در موبایل مخفی تا سطر شلوغ نشود */}
                <span className="hidden shrink-0 text-[10px] font-bold text-stone-500 sm:inline">
                  {faNum(wc)} واژه · {faNum(mins)} دقیقه
                </span>
                {done && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${t.chip}`}
                  >
                    <Check size={11} aria-hidden />
                    {faNum(done.score)} از {faNum(done.total)}
                  </span>
                )}
                {/* r300 — نشانگرِ «بعدیِ تو» از libraryProgress.nextStory (منبعِ یگانه) */}
                {s.id === nextId && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                    <Sparkles size={11} aria-hidden />
                    بعدیِ تو
                  </span>
                )}
                <ChevronLeft size={15} className="shrink-0 text-stone-300" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

// ------------------------------------------------------------------

function StoryReader({
  story,
  onBack,
  onFinish,
  doneEntry,
}: {
  story: HillStory;
  onBack: () => void;
  onFinish: (score: number, total: number) => void;
  doneEntry?: { score: number; total: number; day: string };
}) {
  const book = bookById(story.book); // Task 292: no `!` — fallback below
  const t = THEME[book?.theme ?? "emerald"];
  const bookChip = book ? `${book.faTitle} · داستان ${faNum(story.num)}` : `داستان ${faNum(story.num)}`;

  // پاسخ‌های کاربر — index جمله → true(درست)/false(نادرست)
  // آپدیتِ تابعی (نه snapshot): کلیکِ هم‌زمان/سریع هرگز روی هم نمی‌نویسد —
  // پایانِ آزمون هم با اثرِ گارددار روشن می‌شود (نه در هندلرِ کلیک) تا با هر
  // الگویِ دسته‌ایِ React هم درست بماند.
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showB, setShowB] = useState(false);
  const firedRef = useRef(false);

  const answeredCount = Object.keys(answers).length;
  const total = story.tf.length;
  const score = story.tf.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
  const allAnswered = answeredCount === total;

  // پایانِ آزمون — یک‌بارِ برایِ هر دورِ پاسخ (گاردِ ref؛ «دوباره» مسلحش می‌کند)
  useEffect(() => {
    if (!allAnswered || firedRef.current) return;
    firedRef.current = true;
    onFinish(score, total);
  }, [allAnswered, score, total, onFinish]);

  const answer = (i: number, v: boolean) => {
    setAnswers((prev) => (prev[i] !== undefined ? prev : { ...prev, [i]: v }));
  };

  return (
    <div>
      {/* بازگشت + عنوان */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 c-veil-70 px-3 py-2 text-[12px] font-bold text-stone-600 shadow-sm transition-[background-color,color,transform] hover:bg-stone-100 active:scale-[0.96]"
        >
          <ChevronDown size={14} className="rotate-90" aria-hidden />
          بازگشت به فهرست
        </button>
        <span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-black ${t.chip}`}>
          {bookChip}
        </span>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`rounded-2xl border ${t.border} c-card-elevated p-5 shadow-sm sm:p-6`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 dir="ltr" className="text-left text-lg font-black text-stone-800">
            {story.title}
          </h2>
          <SpeakButton text={story.text} label="بخوان" size="sm" />
        </div>

        {/* متنِ داستان — انگلیسی، چپ‌به‌راست */}
        <div
          dir="ltr"
          className="rounded-xl bg-stone-50 p-4 text-left font-serif text-[15px] leading-8 text-stone-700"
        >
          {story.text.split("\n\n").map((p, i) => (
            <p key={i} className={i > 0 ? "mt-4" : ""}>
              {p}
            </p>
          ))}
        </div>

        {/* واژه‌نامه */}
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-extrabold text-stone-600">
            <Languages size={14} aria-hidden />
            واژه‌نامه
          </h3>
          <ul role="list" className="flex flex-wrap gap-1.5">
            {story.glossary.map((g) => (
              <li
                key={g.en}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-bold text-stone-600"
              >
                <span dir="ltr" className="font-black text-stone-800">
                  {g.en}
                </span>
                {/* r332 — جداکنندهٔ متنِ «|» جوهرِ stone-300 میگرفت (۱٫۴۹ روی
                    سفیدِ چیپ؛ تاریکِ #57534c روی #1c1917 = ۲٫۲۹) — تنها عضوِ
                    متنیِ خانوادهٔ stone-300 (بقیه آیکنِ SVGاند، غیرمتنِ ۳:۱)؛
                    stone-500 = ۴٫۷۴ روشن و ۵٫۹۱ تاریک (نگاشتِ #9c958c). */}
                <span aria-hidden className="text-stone-500">
                  |
                </span>
                {g.fa}
              </li>
            ))}
          </ul>
        </div>
      </motion.article>

      {/* بخش A — صحیح/غلط */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.28, ease: "easeOut" }}
        aria-label="بخش صحیح یا نادرست"
        className="mt-4 rounded-2xl border border-stone-200 c-card-elevated p-5 shadow-sm"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
            <ListChecks size={16} className={t.text} aria-hidden />
            بخشِ A — درست یا نادرست؟
          </h3>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10.5px] font-black text-stone-600">
            {faNum(answeredCount)} از {faNum(total)} پاسخ‌داده
          </span>
        </div>

        <ol role="list" className="flex flex-col gap-2.5">
          {story.tf.map((q, i) => {
            const given = answers[i];
            const isAnswered = given !== undefined;
            const isCorrect = isAnswered && given === q.a;
            return (
              <li
                key={i}
                className={`rounded-xl border p-3 transition-[border-color,background-color] ${
                  !isAnswered
                    ? "border-stone-100 bg-stone-50"
                    : isCorrect
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p dir="ltr" className="flex-1 text-left text-[13.5px] font-bold text-stone-700">
                    <span className="mr-1 font-black text-stone-500">{i + 1}.</span> {q.q}
                  </p>
                  <div
                    className="flex shrink-0 gap-1.5"
                    role="group"
                    aria-label={`پاسخ به جملهٔ ${faNum(i + 1)}`}
                  >
                    <TfButton
                      label="درست"
                      active={given === true}
                      tone={isAnswered ? (q.a === true ? "good" : "bad") : "neutral"}
                      disabled={isAnswered}
                      onClick={() => answer(i, true)}
                    />
                    <TfButton
                      label="نادرست"
                      active={given === false}
                      tone={isAnswered ? (q.a === false ? "good" : "bad") : "neutral"}
                      disabled={isAnswered}
                      onClick={() => answer(i, false)}
                    />
                  </div>
                </div>
                {isAnswered && (
                  <p className="mt-1.5 text-[11.5px] font-black" aria-live="polite">
                    {isCorrect ? (
                      <span className="text-emerald-700">
                        <Check size={12} className="inline" aria-hidden /> درست!
                      </span>
                    ) : (
                      <span className="text-rose-700">
                        <X size={12} className="inline" aria-hidden /> پاسخ درست:{" "}
                        {q.a ? "درست" : "نادرست"}
                      </span>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {/* کارتِ نتیجه */}
        {allAnswered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4"
            role="status"
          >
            <p className="text-[13px] font-black text-teal-800">
              نمرهٔ تو: {faNum(score)} از {faNum(total)}
              {score === total
                ? " — بی‌نقص! 🎉"
                : score >= total - 2
                  ? " — خیلی خوب!"
                  : " — دوباره بخوان و تکرار کن."}
            </p>
            <div className="flex items-center gap-2">
              {doneEntry && (
                <span className="text-[11px] font-bold text-teal-700" aria-live="polite">
                  بهترینِ ثبت‌شده: {faNum(doneEntry.score)} از {faNum(doneEntry.total)}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  firedRef.current = false;
                  setAnswers({});
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-2 text-[11.5px] font-black text-teal-700 transition-[background-color,transform] hover:bg-teal-100 active:scale-[0.96]"
              >
                <RotateCcw size={13} aria-hidden />
                دوباره
              </button>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* بخش B — پرسش‌های تشریحی (فقط تمرین) */}
      <section
        aria-label="پرسش‌های تشریحی"
        className="mt-4 rounded-2xl border border-stone-200 c-card-elevated shadow-sm"
      >
        <button
          type="button"
          onClick={() => setShowB((v) => !v)}
          aria-expanded={showB}
          className="flex w-full items-center justify-between gap-2 p-5 text-right"
        >
          <span className="flex items-center gap-2 text-[13.5px] font-extrabold text-stone-700">
            <BookOpen size={15} className="text-stone-500" aria-hidden />
            بخشِ B — پرسش‌های تشریحی (تمرینِ گفتاری با خودت)
          </span>
          <ChevronDown
            size={16}
            className={`text-stone-500 transition-transform ${showB ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {showB && (
          <ol
            role="list"
            dir="ltr"
            className="list-decimal px-8 pb-5 text-left text-[13px] font-medium leading-7 text-stone-600"
          >
            {story.bq.map((q, i) => (
              <li key={i} className="mt-1">
                {q}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

// دکمهٔ صحیح/غلط — سه حالتِ رنگ: خنثی/درست/نادرست (کلاس کامل — امن برای Tailwind)
function TfButton({
  label,
  active,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  tone: "neutral" | "good" | "bad";
  disabled: boolean;
  onClick: () => void;
}) {
  const cls =
    tone === "good"
      ? "bg-emerald-700 border-emerald-600 text-white shadow-sm"
      : tone === "bad"
        ? "bg-rose-600 border-rose-600 text-white shadow-sm"
        : active
          ? "bg-stone-700 border-stone-700 text-white"
          : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-100";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`min-w-[64px] rounded-lg border px-3 py-2 text-[12px] font-black transition-[background-color,border-color,color,transform] active:scale-[0.96] disabled:cursor-default ${cls}`}
    >
      {label}
    </button>
  );
}
