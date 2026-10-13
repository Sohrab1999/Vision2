"use client";

import { useState, useMemo, useEffect } from "react";
import { ClipboardCheck, Timer, Zap, BookOpen, GraduationCap, ScrollText, Eraser, Layers, ArrowLeft, Ear } from "lucide-react";
import { examBank, lessons } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy, mistakesOfLesson } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { themeOf, faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import { buildExamDictation, DICTATION_MIN_EXAM } from "@/lib/exam-dictation";
import {
  clearCountPrefill,
  clearFlagPrefill,
  EXAM_TIMED_KEY,
  readCountPrefill,
  readFlagPrefill,
} from "@/lib/nav-prefill";
import QuizEngine from "../quiz/quiz-engine";
import DictationTab from "../lesson/dictation-tab";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { shuffle } from "@/lib/domain/shuffle";

/** source lesson of a question from its id prefix (l1-, l2-, l3-, x-) */
function sourceOf(q: QuizQuestion): string {
  if (q.id.startsWith("l1")) return "l1";
  if (q.id.startsWith("l2")) return "l2";
  if (q.id.startsWith("l3")) return "l3";
  return "x";
}

const GROUP_LABELS: Record<string, string> = {
  l1: "درس اول — فهمیدن مردم",
  l2: "درس دوم — یک سبک زندگی سالم",
  l3: "درس سوم — هنر و فرهنگ",
  x: "بانک ۳۶۰ تستی جزوه",
};

const MISTAKES_TARGET: Record<string, number | string> = { l1: 1, l2: 2, l3: 3, x: 0 };

type Mode = "vocab" | "final";
interface Session {
  title: string;
  questions: QuizQuestion[];
  timed: boolean;
  kind: "exam" | "final" | "exam-mistakes";
}

/** طول‌های مجاز آزمون جامع — فرمان پارامتری پالت هم همین‌ها را پیش‌انتخاب می‌کند */
const EXAM_COUNTS = [10, 20, 30] as const;
const EXAM_PREFILL_KEY = "vision2-exam-prefill";

export default function ExamView() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<Mode>("vocab");
  // Task 69: فرمان پارامتری پالت («آزمون ۲۰») مقدار را در sessionStorage
  // می‌گذارد — initializer غیرمخرب می‌خواند (نما lazy است و رویدادش گم می‌شود)
  // Task 71: صفت زمان هم راه می‌آید («آزمون ۲۰ بدون زمان») — هم‌الگوی تعداد
  const [examCount, setExamCount] = useState(() => readCountPrefill(EXAM_PREFILL_KEY, EXAM_COUNTS) ?? 10);
  const [examTimed, setExamTimed] = useState(() => readFlagPrefill(EXAM_TIMED_KEY) ?? true);
  const [finalTimed, setFinalTimed] = useState(true);
  const [dictOpen, setDictOpen] = useState(false);
  const bestExam = useStudy((s) => s.results["exam"]);
  const bestFinal = useStudy((s) => s.results["final"]);
  const mistakes = useStudy((s) => s.mistakes);
  const setView = useStudy((s) => s.setView);
  const mounted = useMounted();

  // مصرفِ یک‌بارهٔ prefill (بدون setState — پاک‌سازی خارجی) + رویداد
  // «open-exam-with» برای وقتی که نما همین حالا باز است (Task 69).
  // دام QA: مسیر رویداد هم باید کلید را مصرف کند وگرنه mount بعدیِ تازه
  // مقدار کهنه را می‌خواند — prefill باید در هر دو مسیر یک‌بارمصرف باشد.
  useEffect(() => {
    clearCountPrefill(EXAM_PREFILL_KEY);
    clearFlagPrefill(EXAM_TIMED_KEY);
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ count?: number; timed?: boolean }>).detail;
      if (typeof d?.count === "number" && (EXAM_COUNTS as readonly number[]).includes(d.count)) {
        setExamCount(d.count);
        clearCountPrefill(EXAM_PREFILL_KEY);
      }
      if (typeof d?.timed === "boolean") {
        setExamTimed(d.timed);
        clearFlagPrefill(EXAM_TIMED_KEY);
      }
    };
    window.addEventListener("open-exam-with", handler);
    return () => window.removeEventListener("open-exam-with", handler);
  }, []);

  /* The exam pool is STATIC (pure function of examBank) — build once on
     mount and reuse the same object as the dialog's source, so the round
     is a stable snapshot and the CTA always knows its size. */
  const examDictPool = useMemo(() => buildExamDictation(), []);
  const examDictSource = dictOpen ? examDictPool : null;
  const examDictCount = examDictPool.words.length;

  const examMistakeCount = mounted ? mistakesOfLesson(mistakes, 0) : 0;
  const totalMistakesAll = mounted
    ? mistakesOfLesson(mistakes, 0) + mistakesOfLesson(mistakes, 1) + mistakesOfLesson(mistakes, 2) + mistakesOfLesson(mistakes, 3)
    : 0;

  /* ------------------------- active session -------------------------
     Questions are generated ONCE at start and kept in session state —
     regenerating on render would reshuffle mid-quiz when the store
     changes (results/mistakes) and corrupt the final report.          */
  if (session) {
    return (
      <QuizEngine
        title={session.title}
        questions={session.questions}
        resultKeyStr={session.kind === "final" ? "final" : session.kind === "exam" ? "exam" : "exam-mistakes"}
        lessonId={0}
        category={session.kind === "final" ? "final" : session.kind === "exam" ? "exam" : "mistakes"}
        immediate={session.kind === "exam-mistakes"}
        secondsPerQuestion={session.timed && session.kind !== "exam-mistakes" ? 45 : undefined}
        certificate={session.kind === "final"}
        groupOf={session.kind === "final" ? sourceOf : undefined}
        groupLabels={session.kind === "final" ? GROUP_LABELS : undefined}
        mistakesOf={session.kind === "final" ? (q) => MISTAKES_TARGET[sourceOf(q)] ?? 0 : undefined}
        onExit={() => setSession(null)}
      />
    );
  }

  const finalBestPct = bestFinal?.percent ?? 0;

  return (
    <div className="space-y-5">
      {/* --------------------- cross-bank quick review banner --------------------- */}
      {mounted && totalMistakesAll > 0 && (
        <button
          onClick={() => setView({ type: "review" })}
          className="review-hero flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Zap size={19} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-extrabold text-stone-800">
              پیش از امتحان: {faNum(totalMistakesAll)} سؤالِ غلط در بانک خطا داری
            </span>
            <span className="block text-[12px] text-stone-500">
              مرور سریعِ ترکیبی (۳ درس + بانک ۳۶۰تا) — پاسخِ درست یعنی حذفِ دائمی از بانک
            </span>
          </span>
          <ArrowLeft size={17} className="shrink-0 text-amber-600" />
        </button>
      )}

      {/* --------------------------- mode switch --------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ModeCard
          active={mode === "vocab"}
          onClick={() => setMode("vocab")}
          icon={ClipboardCheck}
          title="آزمون جامع واژگان"
          desc={`${faNum(examBank.length)} تست از بانک «۳۶۰ تست جمع‌بندی واژگان» جزوه`}
          accent="emerald"
          best={bestExam ? `بهترین نتیجه: ${faNum(bestExam.percent)}٪` : undefined}
        />
        <ModeCard
          active={mode === "final"}
          onClick={() => setMode("final")}
          icon={GraduationCap}
          title="آزمون جامع پایان ترم"
          desc="۴۰ سؤال ترکیبی از هر سه درس + بانک تستی، با گواهی پایان ترم"
          accent="amber"
          badge="جدید"
          best={bestFinal ? `بهترین نتیجه: ${faNum(bestFinal.percent)}٪` : undefined}
        />
      </div>

      {/* --------------------------- vocab exam config --------------------------- */}
      {mode === "vocab" && (
        <div className="rounded-2xl border c-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ScrollText size={22} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-stone-800">آزمون جامع واژگان</h1>
              <p className="text-[13px] text-stone-500">تست گردآوری از بانک ۳۶۰ تستی جزوه با تایمر اختیاری</p>
            </div>
          </div>

          <p className="mb-2 text-[13px] font-bold text-stone-600">۱. تعداد سؤالات را انتخاب کنید:</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {EXAM_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setExamCount(n)}
                className={`rounded-xl border-2 px-5 py-2.5 text-sm font-black transition-all active:scale-95 ${
                  examCount === n
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
                }`}
              >
                {faNum(n)} تست
              </button>
            ))}
          </div>

          <p className="mb-2 text-[13px] font-bold text-stone-600">۲. حالت آزمون:</p>
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setExamTimed(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
                examTimed
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
              }`}
            >
              <Timer size={16} />
              با تایمر (۴۵ ثانیه برای هر تست)
            </button>
            <button
              onClick={() => setExamTimed(false)}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
                !examTimed
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
              }`}
            >
              <Zap size={16} />
              بدون تایمر
            </button>
          </div>

          <button
            onClick={() =>
              setSession({
                title: `آزمون جامع واژگان (${examCount} تست)`,
                questions: shuffle(examBank).slice(0, examCount),
                timed: examTimed,
                kind: "exam",
              })
            }
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-[15px] font-black text-white shadow-lg shadow-emerald-900/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            شروع آزمون جامع
          </button>

          {/* exam-bank mistakes review (bank 0) */}
          {examMistakeCount > 0 && (
            <button
              onClick={() =>
                setSession({
                  title: "مرور اشتباهات آزمون جامع",
                  questions: shuffle(examBank.filter((q) => (mistakes[`0:${q.id}`] ?? 0) > 0)),
                  timed: false,
                  kind: "exam-mistakes",
                })
              }
              className="mistakes-cta mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-gradient-to-l from-rose-50 to-red-50 p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
                  <Eraser size={20} />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-stone-800">مرور اشتباهات آزمون جامع</span>
                  <span className="block text-[12px] text-stone-500">
                    {faNum(examMistakeCount)} سؤال از بانک ۳۶۰ تستی که اشتباه جواب داده‌ای
                  </span>
                </span>
              </span>
              <span className="shrink-0 rounded-xl bg-rose-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-rose-600/30">
                شروع مرور
              </span>
            </button>
          )}

          {/* exam-bank vocabulary dictation — spell what the 360 bank tests, by ear */}
          <button
            onClick={() => (setDictOpen(true), trackEvent("exam_dictation_start"))}
            disabled={examDictCount < DICTATION_MIN_EXAM}
            title={
              examDictCount < DICTATION_MIN_EXAM
                ? `حداقل ${faNum(DICTATION_MIN_EXAM)} واژهٔ کنکوری لازم است`
                : `${faNum(examDictCount)} واژه‌ای که بانک ${faNum(examBank.length)} تستی واقعاً آزمون می‌کند`
            }
            className="exam-dict-cta mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-white p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                <Ear size={20} />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-stone-800">دیکتهٔ واژگان کنکور</span>
                <span className="block text-[12px] text-stone-500">
                  املای شنیداری {faNum(examDictCount)} واژه‌ای که بانک تستی جزوه واقعاً می‌پرسد — هجیِ درست یعنی ارتقای واقعی مرور
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-600/30">
              شروع دیکته
            </span>
          </button>

          {/* exam dictation dialog — 5th DictationSource (360-bank vocabulary) */}
          <Dialog open={dictOpen} onOpenChange={setDictOpen}>
            <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto nice-scroll">
              <DialogHeader className="text-right">
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Ear size={16} className="text-emerald-600" />
                  دیکتهٔ واژگان بانک آزمون
                </DialogTitle>
              </DialogHeader>
              {examDictSource && (
                <DictationTab source={examDictSource} onExit={() => setDictOpen(false)} exitLabel="بازگشت به آزمون جامع" />
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* --------------------------- final exam config --------------------------- */}
      {mode === "final" && (
        <div className="final-exam-card overflow-hidden rounded-2xl border-2 border-amber-200 bg-white shadow-sm">
          <div className="h-1.5 w-full bg-gradient-to-l from-amber-400 via-orange-500 to-rose-500" />
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-md shadow-amber-600/30">
                <GraduationCap size={24} />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-stone-800">آزمون جامع پایان ترم</h1>
                <p className="text-[13px] text-stone-500">ارزیابی نهایی همهٔ آموخته‌ها — با گواهی و اشتراک‌گذاری نتیجه</p>
              </div>
            </div>

            <div className="mb-5 grid gap-2.5 sm:grid-cols-4">
              {[
                { icon: Layers, label: "ترکیبی از ۴ منبع", desc: "واژگان + گرامر سه درس و بانک ۳۶۰ تستی" },
                { icon: ClipboardCheck, label: "۴۰ سؤال", desc: "۱۰ سؤال از هر منبع، بُر خورده" },
                { icon: Timer, label: "۳۰ دقیقه", desc: "۴۵ ثانیه برای هر سؤال (قابل خاموش کردن)" },
                { icon: GraduationCap, label: "گواهی پایان ترم", desc: "کارنامهٔ تفکیکی + اشتراک‌گذاری" },
              ].map((f) => (
                <div key={f.label} className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                  <f.icon size={17} className="mb-1.5 text-amber-600" />
                  <div className="text-[12.5px] font-extrabold text-stone-800">{f.label}</div>
                  <div className="text-[11px] leading-5 text-stone-500">{f.desc}</div>
                </div>
              ))}
            </div>

            {bestFinal && (
              <div className={`mb-5 rounded-xl border p-3.5 ${finalBestPct >= 70 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <p className="text-[13px] font-bold text-stone-800">
                  🎓 بهترین نتیجهٔ شما در آزمون پایان ترم: {faNum(bestFinal.percent)}٪ ({faNum(bestFinal.correct)} از {faNum(bestFinal.total)})
                </p>
                <p className="mt-1 text-[11.5px] text-stone-500">
                  {finalBestPct >= 90
                    ? "سطح شما عالی است — با تلاش مجدد می‌توانی رکورد بزنی!"
                    : finalBestPct >= 70
                      ? "خیلی خوب بود؛ برای نمرهٔ عالی دوباره تلاش کن."
                      : "با مرور فلش‌کارت‌ها و تست‌های درس‌ها دوباره امتحان کن."}
                </p>
              </div>
            )}

            <p className="mb-2 text-[13px] font-bold text-stone-600">حالت آزمون:</p>
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFinalTimed(true)}
                className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
                  finalTimed
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-stone-200 bg-white text-stone-600 hover:border-amber-300"
                }`}
              >
                <Timer size={16} />
                با تایمر (۳۰ دقیقه)
              </button>
              <button
                onClick={() => setFinalTimed(false)}
                className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
                  !finalTimed
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-stone-200 bg-white text-stone-600 hover:border-amber-300"
                }`}
              >
                <Zap size={16} />
                بدون تایمر
              </button>
            </div>

            <button
              onClick={() => {
                // ۴۰ سؤال: ۱۰ سؤال از هر درس + ۱۰ سؤال از بانک ۳۶۰ تستی
                const pool = [
                  ...shuffle(lessons[0].quizzes).slice(0, 10),
                  ...shuffle(lessons[1].quizzes).slice(0, 10),
                  ...shuffle(lessons[2].quizzes).slice(0, 10),
                  ...shuffle(examBank).slice(0, 10),
                ];
                setSession({ title: "آزمون جامع پایان ترم", questions: shuffle(pool), timed: finalTimed, kind: "final" });
              }}
              className="w-full rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 py-3.5 text-[15px] font-black text-white shadow-lg shadow-amber-700/25 transition-all hover:opacity-95 active:scale-[0.98]"
            >
              🎓 شروع آزمون پایان ترم
            </button>
          </div>
        </div>
      )}

      {/* quick lesson tests shortcut */}
      <div className="rounded-2xl border c-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-stone-700">
          <BookOpen size={16} className="text-stone-400" />
          یا مستقیم وارد تست‌های هر درس شوید:
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {lessons.map((l) => (
            <LessonShortcut key={l.id} id={l.id} title={l.titleFa} color={l.color} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  accent,
  badge,
  best,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  desc: string;
  accent: "emerald" | "amber";
  badge?: string;
  best?: string;
}) {
  const activeCls =
    accent === "amber"
      ? "border-amber-500 bg-amber-50 shadow-amber-200/50"
      : "border-emerald-500 bg-emerald-50 shadow-emerald-200/50";
  const iconCls =
    accent === "amber"
      ? "bg-gradient-to-br from-amber-400 to-orange-600 text-white"
      : "bg-emerald-50 text-emerald-600";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`relative rounded-2xl border-2 p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${
        active ? activeCls : "border-stone-200 bg-white"
      }`}
    >
      {badge && (
        <span className="absolute left-3 top-3 rounded-full bg-gradient-to-l from-amber-500 to-orange-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md">
          {badge}
        </span>
      )}
      <span className={`mb-2.5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconCls}`}>
        <Icon size={21} />
      </span>
      <h3 className="text-[14.5px] font-extrabold text-stone-800">{title}</h3>
      <p className="mt-0.5 text-[12px] leading-6 text-stone-500">{desc}</p>
      {best && <p className="mt-1.5 text-[11.5px] font-bold text-emerald-700">{best}</p>}
    </button>
  );
}

function LessonShortcut({ id, title, color }: { id: number; title: string; color: string }) {
  const openLesson = useStudy((s) => s.openLesson);
  const t = themeOf(color);
  return (
    <button
      onClick={() => openLesson(id)}
      className={`rounded-xl border ${t.border} ${t.bgSoft} p-3.5 text-right transition-all hover:shadow-md active:scale-[0.98]`}
    >
      <div className={`text-[13px] font-extrabold ${t.text}`}>درس {id === 1 ? "اول" : id === 2 ? "دوم" : "سوم"}</div>
      <div className="text-[12px] font-bold text-stone-600">{title}</div>
    </button>
  );
}
