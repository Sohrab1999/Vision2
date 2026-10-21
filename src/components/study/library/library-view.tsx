"use client";

// Task 290 «کتاب‌خانهٔ داستان‌ها» — سریِ کلاسیک Stories for Reproduction
// (L. A. Hill, Oxford) در سه سطحِ ۷۵۰/۱۰۰۰/۱۵۰۰ واژهٔ پایه.
// خواندنِ آزادِ انگلیسی با روخوانیِ هوش مصنوعی + آزمونِ صحیح/غلطِ کتاب
// (بخشِ A) + پرسش‌های تشریحی (بخشِ B) + واژه‌نامهٔ فارسی.
// پیشرفت در اسلایسِ library (markStoryDone) ذخیره و با سطرِ SyncField
// «libraryDone» در پشتیبان/همگام‌سازی سفر می‌کند.

import { useEffect, useRef, useState } from "react";
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
    grad: "from-emerald-500 to-emerald-700",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
  },
  amber: {
    border: "border-amber-200",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    grad: "from-amber-400 to-orange-600",
    soft: "bg-amber-50",
    text: "text-amber-700",
  },
  violet: {
    border: "border-violet-200",
    chip: "bg-violet-50 text-violet-700 border-violet-200",
    grad: "from-violet-500 to-purple-700",
    soft: "bg-violet-50",
    text: "text-violet-700",
  },
};

export default function LibraryView() {
  const mounted = useMounted();
  // Task 292 — defensive `?? {}`: hydration of a corrupted/legacy payload
  // must degrade to «zero progress», never crash the whole app.
  const libraryDone = useStudy((s) => s.libraryDone) ?? {};
  const markStoryDone = useStudy((s) => s.markStoryDone);
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const { toast } = useToast();

  const doneCount = mounted ? Object.keys(libraryDone).length : 0;
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
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-[12px] font-black text-teal-700"
            aria-label="پیشرفت کل کتاب‌خانه"
          >
            <BookMarked size={14} aria-hidden />
            {faNum(doneCount)} از {faNum(HILL_TOTAL_STORIES)} داستان
          </span>
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
        <div className="flex flex-col gap-4">
          {HILL_BOOKS.map((book, i) => (
            <BookCard
              key={book.id}
              book={book}
              index={i}
              mounted={mounted}
              doneOf={libraryDone}
              onOpen={setOpenStoryId}
            />
          ))}
        </div>
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
}: {
  book: HillBook;
  index: number;
  mounted: boolean;
  doneOf: Record<string, { score: number; total: number; day: string }>;
  onOpen: (storyId: string) => void;
}) {
  const t = THEME[book.theme];
  const stories = storiesOfBook(book.id);
  const doneN = mounted ? stories.filter((s) => doneOf[s.id]).length : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.28, ease: "easeOut" }}
      aria-label={book.faTitle}
      className={`rounded-2xl border ${t.border} c-card-elevated p-5 shadow-sm`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
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
        <span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-black ${t.chip}`}>
          {book.levelFa}
        </span>
        {mounted && (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10.5px] font-black text-stone-600">
            {faNum(doneN)} از {faNum(stories.length)} خوانده‌شده
          </span>
        )}
      </div>
      <p className="mb-3 text-[12px] leading-6 text-stone-500">{book.desc}</p>

      <ul role="list" className="flex flex-col gap-1.5">
        {stories.map((s) => {
          const done = mounted ? doneOf[s.id] : undefined;
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
                {done && (
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${t.chip}`}
                  >
                    <Check size={11} aria-hidden />
                    {faNum(done.score)} از {faNum(done.total)}
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
                <span aria-hidden className="text-stone-300">
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
      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
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
