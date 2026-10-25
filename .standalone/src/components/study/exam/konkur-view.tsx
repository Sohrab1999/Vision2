"use client";

// ------------------------------------------------------------------
// گوشهٔ کنکور — Konkur Corner
// A dedicated control-room for the workbook's «۳۶۰ تست واژگان» bank:
//   • نقشهٔ پیشرفت ۳۶۰خانه‌ای (coverage grid, GitHub-style)
//   • شبیه‌ساز کنکور (unseen-first timed simulator)
//   • تست‌های سخت من (mistake-bank ∪ wrong-now drill)
//   • پوشش بانک (unseen-only learning session)
// All sessions run on the shared QuizEngine; mistakes flow into the
// classic mistake bank (bucket 0) so exam view / quick review stay in
// sync, and per-question results feed the coverage map automatically.
// ------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Timer,
  Zap,
  Target,
  Eraser,
  ArrowLeft,
  Trophy,
  Layers,
  CheckCircle2,
  CircleDashed,
  PartyPopper,
  Ban,
  AlarmClock,
} from "lucide-react";
import { examBank } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy, srsQuestionDueIds, srsQuestionDueTotal } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { hardIdsOf } from "@/lib/konkur";
import { trackEvent } from "@/lib/analytics";
import {
  clearCountPrefill,
  clearFlagPrefill,
  KONKUR_TIMED_KEY,
  readCountPrefill,
  readFlagPrefill,
} from "@/lib/nav-prefill";
import QuizEngine from "../quiz/quiz-engine";
import { shuffle } from "@/lib/domain/shuffle";
import { percent } from "@/lib/domain/percent";

/** source bucket of a question from its id prefix (l1-, l2-, l3-, x-) */
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

type Mode = "sim" | "hard" | "cover";

interface Session {
  title: string;
  questions: QuizQuestion[];
  kind: Mode;
  timed: boolean;
}

const HARD_CAP = 20; // per-session cap for the hard drill

/** طول‌های مجاز شبیه‌ساز — فرمان پارامتری پالت هم همین‌ها را پیش‌انتخاب می‌کند */
const SIM_COUNTS = [10, 20, 30] as const;
const KONKUR_PREFILL_KEY = "vision2-konkur-prefill";

export default function KonkurView() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<Mode>("sim");
  // Task 69: فرمان پارامتری پالت («کنکور ۳۰») مقدار را در sessionStorage
  // می‌گذارد — initializer غیرمخرب می‌خواند (نما lazy است و رویدادش گم می‌شود)
  const [simCount, setSimCount] = useState(() => readCountPrefill(KONKUR_PREFILL_KEY, SIM_COUNTS) ?? 10);
  // Task 71: صفت زمان پالت («کنکور ۳۰ با/بدون زمان») — هم‌الگوی prefill تعداد
  const [simTimed, setSimTimed] = useState(() => readFlagPrefill(KONKUR_TIMED_KEY) ?? true);
  const [coverCount, setCoverCount] = useState(10);

  // مصرفِ یک‌بارهٔ prefill (بدون setState — پاک‌سازی خارجی) + رویداد
  // «open-konkur-with» برای وقتی که نما همین حالا باز است (Task 69).
  // دام QA: مسیر رویداد هم باید کلید را مصرف کند وگرنه mount بعدیِ تازه
  // مقدار کهنه را می‌خواند — prefill باید در هر دو مسیر یک‌بارمصرف باشد.
  useEffect(() => {
    clearCountPrefill(KONKUR_PREFILL_KEY);
    clearFlagPrefill(KONKUR_TIMED_KEY);
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ count?: number; timed?: boolean }>).detail;
      if (typeof d?.count === "number" && (SIM_COUNTS as readonly number[]).includes(d.count)) {
        setSimCount(d.count);
        clearCountPrefill(KONKUR_PREFILL_KEY);
      }
      if (typeof d?.timed === "boolean") {
        setSimTimed(d.timed);
        clearFlagPrefill(KONKUR_TIMED_KEY);
      }
    };
    window.addEventListener("open-konkur-with", handler);
    return () => window.removeEventListener("open-konkur-with", handler);
  }, []);

  const konkurSeen = useStudy((s) => s.konkurSeen);
  const konkurWrong = useStudy((s) => s.konkurWrong);
  const mistakes = useStudy((s) => s.mistakes);
  const srs = useStudy((s) => s.srs);
  const bestSim = useStudy((s) => s.results["0:konkur"]);
  const bestHard = useStudy((s) => s.results["0:konkur-hard"]);
  const bestCover = useStudy((s) => s.results["0:konkur-cover"]);
  const mounted = useMounted();

  // F11 — exam-bank questions whose spaced-repetition review is due right now
  const dueIds = useMemo(
    () => new Set(mounted ? srsQuestionDueIds(srs) : []),
    [mounted, srs]
  );
  const dueCount = mounted ? srsQuestionDueTotal(srs) : 0;

  // ---- derived stats (all guarded for hydration) ----
  const stats = useMemo(() => {
    const bankIds = new Set(examBank.map((q) => q.id));
    const seenSet = new Set(
      mounted ? Object.keys(konkurSeen).filter((id) => bankIds.has(id)) : []
    );
    const wrongSet = mounted
      ? new Set([...hardIdsOf(mistakes, konkurWrong)].filter((id) => bankIds.has(id)))
      : new Set<string>();
    const masteredCount = [...seenSet].filter((id) => !wrongSet.has(id)).length;
    const seenCount = seenSet.size;
    return {
      seenSet,
      wrongSet,
      seenCount,
      wrongCount: wrongSet.size,
      masteredCount,
      coveragePct: percent(seenCount, examBank.length),
      masteryPct: percent(masteredCount, seenCount),
    };
  }, [mounted, konkurSeen, konkurWrong, mistakes]);

  /* ------------------------- active session -------------------------
     Questions are generated ONCE at start and kept in session state —
     regenerating on render would reshuffle mid-quiz when the store
     changes (konkurSeen/mistakes) and corrupt the final report.     */
  if (session) {
    return (
      <QuizEngine
        title={session.title}
        questions={session.questions}
        resultKeyStr={
          session.kind === "sim" ? "0:konkur" : session.kind === "hard" ? "0:konkur-hard" : "0:konkur-cover"
        }
        lessonId={0}
        category={session.kind === "sim" ? "konkur" : session.kind === "hard" ? "konkur-hard" : "konkur-cover"}
        immediate={session.kind !== "sim"}
        secondsPerQuestion={session.timed ? 45 : undefined}
        groupOf={sourceOf}
        groupLabels={GROUP_LABELS}
        mistakesOf={() => 0}
        // راند ۲۴۷ — بندِ ① پیشنهادِ ۲۴۶: خانوادهٔ resumeDoor به نتیجهٔ کنکور هم رسید —
        // جایی که نتیجه گرفته می‌شود، راهِ برگشت به ضمیمه هم آن‌جاست (همان الگو، opt-inِ مصرف‌کننده).
        resumeDoor
        onExit={() => setSession(null)}
      />
    );
  }

  const unseen = examBank.filter((q) => !stats.seenSet.has(q.id));
  const fullCoverage = stats.seenCount >= examBank.length;

  const startSim = () => {
    const fresh = shuffle(unseen);
    const rest = shuffle(examBank.filter((q) => stats.seenSet.has(q.id)));
    const pool = shuffle([...fresh, ...rest].slice(0, simCount));
    trackEvent("konkur_start");
    setSession({ title: `شبیه‌ساز کنکور (${faNum(pool.length)} تست)`, questions: pool, kind: "sim", timed: simTimed });
  };

  const startHard = () => {
    const hard = examBank.filter((q) => stats.wrongSet.has(q.id));
    // F11 — due-for-review questions first (spaced repetition priority),
    // then the rest of the hard set
    const dueFirst = shuffle(hard.filter((q) => dueIds.has(q.id)));
    const rest = shuffle(hard.filter((q) => !dueIds.has(q.id)));
    const pool = [...dueFirst, ...rest].slice(0, HARD_CAP);
    if (!pool.length) return;
    trackEvent("konkur_start");
    setSession({
      title: pool.length < stats.wrongCount
        ? `تست‌های سخت من (${faNum(pool.length)} از ${faNum(stats.wrongCount)})`
        : `تست‌های سخت من (${faNum(pool.length)} تست)`,
      questions: pool,
      kind: "hard",
      timed: false,
    });
  };

  const startCover = () => {
    const pool = unseen.slice(0, coverCount);
    if (!pool.length) return;
    trackEvent("konkur_start");
    setSession({
      title: `پوشش بانک ۳۶۰ (${faNum(pool.length)} تست تازه)`,
      questions: pool,
      kind: "cover",
      timed: false,
    });
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------ hero ------------------------------ */}
      <section className="konkur-hero relative overflow-hidden rounded-2xl bg-gradient-to-l from-red-700 via-orange-700 to-amber-700 p-5 text-white shadow-lg shadow-orange-600/20 sm:p-6">
        <div className="absolute -left-4 -top-7 opacity-10" aria-hidden>
          <GraduationCap size={160} />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
            <GraduationCap size={27} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black sm:text-2xl">گوشهٔ کنکور</h1>
            <p className="mt-1 text-[13px] font-bold leading-6 text-white">
              اتاق فرمان بانک «۳۶۰ تست واژگان» جزوه — پوشش بده، تسلط پیدا کن، برای کنکور آماده شو.
            </p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {/* راند ۲۷۵ — گذرِ صداقتِ KPIها: هر پنج کارت تولتیپِ فرمولِ صادق با
              اعدادِ زنده دارند (پیش‌تر بی-title بودند) و «تسلط» دیگر «درستِ
              دیده‌شده» را وعده نمی‌دهد — بانک کنکور «درست» جداگانه ثبت
              نمی‌کند؛ مسلط یعنی دیده‌شده‌ای که خطایِ باز ندارد. */}
          <HeroKpi
            icon={Layers}
            label="پوشش بانک"
            value={`${faNum(stats.seenCount)} از ${faNum(examBank.length)}`}
            hint={`${faNum(stats.coveragePct)}٪ دیده‌شده`}
            title={`هر تستی که حداقل یک‌بار دیده‌ای — درست یا غلط، در هر حالتِ جلسه؛ الان ${faNum(stats.seenCount)} از ${faNum(examBank.length)}`}
          />
          <HeroKpi
            icon={Target}
            label="تسلط"
            value={`${faNum(stats.masteryPct)}٪`}
            hint="بی-خطایِ باز از دیده‌شده‌ها"
            title={`مسلط یعنی دیده‌شده‌ای که خطایِ باز ندارد — بانک «درست» جداگانه ثبت نمی‌کند؛ الان ${faNum(stats.masteredCount)} از ${faNum(stats.seenCount)} دیده‌شده`}
          />
          <HeroKpi
            icon={Eraser}
            label="خطای باز"
            value={faNum(stats.wrongCount)}
            hint="نیازمند مرور"
            title="غلط‌هایی که هنوز پاک نشده‌اند — با «تست‌های سخت من» مرورشان کن"
          />
          <HeroKpi
            icon={AlarmClock}
            label="مرور سررسید"
            value={faNum(dueCount)}
            hint={dueCount > 0 ? "الان وقت مرور است!" : "زمان‌بندی SRS"}
            title="تست‌هایی که طبق زمان‌بندی SRS الان وقتِ مرورشان است"
          />
          <HeroKpi
            icon={Trophy}
            label="رکورد شبیه‌ساز"
            value={bestSim ? `${faNum(bestSim.percent)}٪` : "—"}
            hint={bestSim ? `${faNum(bestSim.correct)} از ${faNum(bestSim.total)}` : "هنوز جلسه‌ای نداری"}
            title={bestSim ? "بهترین درصدِ جلسه‌هایِ شبیه‌ساز تا امروز" : "اولین جلسهٔ شبیه‌سازت را بزن تا رکورد ثبت شود"}
          />
        </div>
      </section>

      {/* ------------------------- coverage grid ------------------------- */}
      <section className="rounded-2xl border c-card p-5 shadow-sm sm:p-6" aria-label="نقشهٔ پیشرفت بانک کنکور">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-stone-800">
            <Target size={17} className="text-orange-600" />
            نقشهٔ پیشرفت بانک ۳۶۰تایی
          </h2>
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-700">
            {fullCoverage ? "پوشش کامل ✓" : `${faNum(examBank.length - stats.seenCount)} تست باقی‌مانده`}
          </span>
        </div>

        {fullCoverage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-bold text-emerald-800">
            <PartyPopper size={16} className="shrink-0" />
            فوق‌العاده! هر ۳۶۰ تستِ بانک را حداقل یک‌بار دیده‌ای — حالا نوبت تسلطِ کامل است (تست‌های سخت من).
          </div>
        )}

        {/* راند ۲۷۵ — ارقامِ لیبلِ a11y هم مثلِ همهٔ متنِ مرئی از faNum می‌گذرد
            (پیش‌تر «0 دیده‌شده از 360» می‌گفت — بی‌سروصدا لاتین) */}
        <div
          className="grid grid-cols-10 gap-[3px] sm:grid-cols-15 lg:grid-cols-20"
          role="img"
          aria-label={`نقشهٔ پیشرفت بانک کنکور: ${faNum(stats.seenCount)} دیده‌شده از ${faNum(examBank.length)}، ${faNum(stats.wrongCount)} خطای باز`}
        >
          {examBank.map((q) => {
            const seen = stats.seenSet.has(q.id);
            const wrong = stats.wrongSet.has(q.id);
            const cls = !seen ? "bg-stone-200" : wrong ? "bg-rose-700" : "bg-emerald-500";
            // راند ۲۷۵ — تولتیپِ خانه‌ها هم فارسی‌رقم شد (پیش‌تر «تست 12» لاتین می‌گفت)
            return (
              <div
                key={q.id}
                title={`تست ${faNum(q.id.slice(2))} — ${!seen ? "دیده‌نشده" : wrong ? "غلط اخیر" : "مسلط"}`}
                aria-hidden
                className={`aspect-square rounded-[3px] transition-transform duration-150 hover:scale-[1.35] ${cls}`}
              />
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-bold text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] bg-emerald-500" aria-hidden />
            مسلط ({faNum(stats.masteredCount)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] bg-rose-700" aria-hidden />
            غلط اخیر ({faNum(stats.wrongCount)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] bg-stone-200" aria-hidden />
            دیده‌نشده ({faNum(examBank.length - stats.seenCount)})
          </span>
          <span className="text-stone-500">— هر خانه یک تست از بانک ۳۶۰تایی است</span>
        </div>
      </section>

      {/* --------------------------- mode cards --------------------------- */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ModeCard
          active={mode === "sim"}
          onClick={() => setMode("sim")}
          icon={Timer}
          title="شبیه‌ساز کنکور"
          desc="تست‌های دیده‌نشده اول؛ با تایمر ۴۵ ثانیه‌ای مثل جلسهٔ واقعی"
          tone="amber"
          best={bestSim ? `رکورد: ${faNum(bestSim.percent)}٪` : undefined}
        />
        <ModeCard
          active={mode === "hard"}
          onClick={() => setMode("hard")}
          icon={Eraser}
          title="تست‌های سخت من"
          desc={`غلط‌های باز بانک (خطای آزمون جامع + کنکور) — حداکثر ${faNum(HARD_CAP)} تست در هر جلسه`}
          tone="rose"
          badge={stats.wrongCount}
          best={bestHard ? `رکورد: ${faNum(bestHard.percent)}٪` : undefined}
        />
        <ModeCard
          active={mode === "cover"}
          onClick={() => setMode("cover")}
          icon={CheckCircle2}
          title="پوشش بانک"
          desc="فقط دیده‌نشده‌ها، به ترتیب بانک — بدون تایمر برای یادگیری آرام"
          tone="emerald"
          best={bestCover ? `رکورد: ${faNum(bestCover.percent)}٪` : undefined}
        />
      </div>

      {/* --------------------------- mode panel --------------------------- */}
      {mode === "sim" && (
        <div className="rounded-2xl border c-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-stone-800">
            <Zap size={17} className="text-amber-600" />
            شبیه‌ساز کنکور
          </h2>
          <p className="mb-2 text-[13px] font-bold text-stone-600">تعداد تست:</p>
          {/* راند ۲۷۳ — خانوادهٔ انتخابگرها کامل شد (قراردادِ r272/posGrade):
              گروهِ نام‌دار + وضعیتِ اعلام‌شده رویِ هر دکمه — نه فقط رنگ */}
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="تعداد تستِ شبیه‌ساز کنکور">
            {SIM_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setSimCount(n)}
                aria-pressed={simCount === n}
                className={`rounded-xl border-2 px-5 py-2.5 text-sm font-black transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                  simCount === n
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-stone-200 bg-white text-stone-600 hover:border-amber-300"
                }`}
              >
                {faNum(n)} تست
              </button>
            ))}
          </div>
          <p className="mb-2 text-[13px] font-bold text-stone-600">حالت جلسه:</p>
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="حالت جلسهٔ شبیه‌ساز">
            <button
              onClick={() => setSimTimed(true)}
              aria-pressed={simTimed}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                simTimed
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-stone-200 bg-white text-stone-600 hover:border-amber-300"
              }`}
            >
              <Timer size={16} />
              با تایمر (۴۵ ثانیه برای هر تست)
            </button>
            <button
              onClick={() => setSimTimed(false)}
              aria-pressed={!simTimed}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                !simTimed
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-stone-200 bg-white text-stone-600 hover:border-amber-300"
              }`}
            >
              <Ban size={16} />
              بدون تایمر
            </button>
          </div>
          {stats.seenCount > 0 && stats.seenCount < examBank.length && (
            <p className="mb-4 rounded-xl bg-stone-50 px-3.5 py-2.5 text-[12px] font-bold leading-6 text-stone-500">
              ترکیب جلسه: اول تست‌های دیده‌نشده ({faNum(unseen.length)} تا) و در صورت نیاز از بقیهٔ بانک پر می‌شود.
            </p>
          )}
          <button
            onClick={startSim}
            className="w-full rounded-xl bg-gradient-to-l from-amber-700 to-orange-700 py-3.5 text-[15px] font-black text-white shadow-lg shadow-orange-600/25 transition-[background-color,color,border-color,box-shadow,transform,opacity] hover:opacity-95 active:scale-[0.96]"
          >
            شروع شبیه‌ساز کنکور
            <ArrowLeft size={17} className="mr-2 inline" />
          </button>
        </div>
      )}

      {mode === "hard" && (
        <div className="rounded-2xl border c-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-stone-800">
            <Eraser size={17} className="text-rose-600" />
            تست‌های سخت من
          </h2>
          {stats.wrongCount === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CircleDashed size={34} className="text-stone-300" />
              <p className="text-[13.5px] font-bold text-stone-600">هنوز تستِ سختی نداری!</p>
              <p className="max-w-md text-[12px] leading-6 text-stone-500">
                هر تستِ غلط از شبیه‌ساز، آزمون جامع، مرور سریع یا تمرین هوشمند این‌جا جمع می‌شود تا با هدف جواب بدهی — پاسخِ درست یعنی حذفِ دائمی.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-bold leading-6 text-rose-800">
                {faNum(stats.wrongCount)} تست سختِ باز داری
                {stats.wrongCount > HARD_CAP
                  ? ` — هر جلسه ${faNum(HARD_CAP)}تای تصادفی از آن‌ها پرسیده می‌شود.`
                  : " — با پاسخ درست، هم از این‌جا و هم از بانک خطای آزمون جامع حذف می‌شوند."}
              </p>
              {dueCount > 0 && (
                <p className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] font-bold leading-6 text-amber-800">
                  <AlarmClock size={16} className="shrink-0" />
                  {faNum(dueCount)} تست سررسیدِ مرور دارد — زمان‌بندی SRS این‌ها را اول می‌آورد؛ پاسخ درست = یک پله بالاتر، غلط = برگشت به شروع.
                </p>
              )}
              <button
                onClick={startHard}
                className="w-full rounded-xl bg-rose-600 py-3.5 text-[15px] font-black text-white shadow-lg shadow-rose-600/25 transition-[background-color,color,border-color,box-shadow,transform] hover:bg-rose-700 active:scale-[0.96]"
              >
                شروع مرور تست‌های سخت ({faNum(Math.min(stats.wrongCount, HARD_CAP))} تست)
              </button>
            </>
          )}
        </div>
      )}

      {mode === "cover" && (
        <div className="rounded-2xl border c-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-stone-800">
            <CheckCircle2 size={17} className="text-emerald-600" />
            پوشش بانک — فقط دیده‌نشده‌ها
          </h2>
          {unseen.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <PartyPopper size={34} className="text-emerald-500" />
              <p className="text-[13.5px] font-bold text-stone-600">کل بانک را پوشش دادی!</p>
              <p className="max-w-md text-[12px] leading-6 text-stone-500">
                هیچ تست دیده‌نشده‌ای نمانده — برای تقویت، سراغ «شبیه‌ساز کنکور» یا «تست‌های سخت من» برو.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-2 text-[13px] font-bold text-stone-600">
                تعداد تست تازه ({faNum(unseen.length)} دیده‌نشده موجود):
              </p>
              <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="تعداد تستِ تازهٔ پوشش بانک">
                {[10, 15, 20].map((n) => {
                  const disabled = n > unseen.length;
                  return (
                    <button
                      key={n}
                      onClick={() => setCoverCount(n)}
                      disabled={disabled}
                      aria-pressed={coverCount === n}
                      className={`rounded-xl border-2 px-5 py-2.5 text-sm font-black transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                        disabled
                          ? "cursor-not-allowed border-stone-100 bg-stone-50 text-stone-300"
                          : coverCount === n
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-stone-200 bg-white text-stone-600 hover:border-emerald-300"
                      }`}
                    >
                      {faNum(n)} تست
                    </button>
                  );
                })}
              </div>
              <button
                onClick={startCover}
                className="w-full rounded-xl bg-emerald-700 py-3.5 text-[15px] font-black text-white shadow-lg shadow-emerald-900/25 transition-[background-color,color,border-color,box-shadow,transform] hover:bg-emerald-800 active:scale-[0.96]"
              >
                شروع پوشش بانک ({faNum(Math.min(coverCount, unseen.length))} تست)
                <ArrowLeft size={17} className="mr-2 inline" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ------------------------- how it works ------------------------- */}
      <section className="rounded-2xl border c-card p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
          <GraduationCap size={16} className="text-orange-600" />
          گوشهٔ کنکور چطور کار می‌کند؟
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {[
            { icon: Layers, title: "۱. پوشش بده", desc: "با «پوشش بانک» هر ۳۶۰ تست را حداقل یک‌بار ببین — نقشه خانه‌به‌خانه پر می‌شود." },
            { icon: Timer, title: "۲. تمرین زمان‌دار", desc: "شبیه‌ساز، دیده‌نشده‌ها را اول می‌آورد و با تایمر، سرعتِ تصمیم‌گیریِ کنکوری می‌سازد." },
            { icon: Eraser, title: "۳. اشکال‌زدایی", desc: "غلط‌ها در «تست‌های سخت من» می‌مانند تا با پاسخ درست برای همیشه پاک شوند." },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border border-stone-100 c-stone-70 p-3.5">
              <s.icon size={17} className="mb-1.5 text-orange-600" />
              <div className="text-[12.5px] font-extrabold text-stone-800">{s.title}</div>
              <div className="mt-0.5 text-[11.5px] leading-6 text-stone-500">{s.desc}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] font-bold leading-6 text-stone-500">
          نکته: نتایج این‌جا با بقیهٔ کتاب هم‌سان است — غلط‌های بانک ۳۶۰تایی در «مرور سریع قبل امتحان» و «مرور اشتباهات آزمون جامع» هم دیده می‌شوند.
        </p>
      </section>
    </div>
  );
}

function HeroKpi({
  icon: Icon,
  label,
  value,
  hint,
  title,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint: string;
  title?: string;
}) {
  return (
    <div title={title} className="rounded-xl bg-black/25 px-3 py-2.5 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-white/95">
        <Icon size={13} />
        {label}
      </div>
      <div className="text-lg font-black leading-tight">{value}</div>
      <div className="text-[10.5px] font-bold text-white/90">{hint}</div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  tone,
  badge,
  best,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  desc: string;
  tone: "amber" | "rose" | "emerald";
  badge?: number;
  best?: string;
}) {
  const toneCls: Record<typeof tone, { active: string; icon: string }> = {
    amber: { active: "border-amber-500 bg-amber-50", icon: "bg-amber-50 text-amber-600" },
    rose: { active: "border-rose-400 bg-rose-50", icon: "bg-rose-50 text-rose-600" },
    emerald: { active: "border-emerald-500 bg-emerald-50", icon: "bg-emerald-50 text-emerald-600" },
  };
  const t = toneCls[tone];
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`relative rounded-2xl border-2 p-4 text-right shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:shadow-md active:scale-[0.96] ${
        active ? `${t.active} shadow-lg` : "border-stone-200 bg-white"
      }`}
    >
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute left-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-700 px-1.5 text-[11px] font-black text-white shadow-md shadow-rose-500/30">
          {faNum(badge)}
        </span>
      )}
      <span className={`mb-2.5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${t.icon}`}>
        <Icon size={21} />
      </span>
      <h3 className="text-[14px] font-extrabold text-stone-800">{title}</h3>
      <p className="mt-0.5 text-[11.5px] leading-6 text-stone-500">{desc}</p>
      {best && <p className="mt-1.5 text-[11.5px] font-bold text-emerald-700">{best}</p>}
    </button>
  );
}
