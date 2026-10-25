"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, BookOpen, Languages, ListChecks, Volume2, ClipboardCheck, ArrowLeft } from "lucide-react";
import { TOTAL_VOCABULARY, TOTAL_QUESTIONS } from "@/data/lesson-meta";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { coverProgress } from "@/lib/cover-progress";

// بخش Hero — تیتر، دکمه‌های شروع و جلد کتاب شناور (Papermorph-style).
// Task 111 «کتابِ زنده» — جلد از تزئین به مصنوعِ زنده: تیلتِ اشاره‌گرِ
// بهاری (فقط pointer:fine و بی‌reduce-motion)، درخشِ دوره‌ایِ لبهٔ جلد
// (CSS — با kill-switch سراسریِ user-reduce-motion سازگار)، لبهٔ صفحات،
// ورودِ پلکانیِ ستونِ متن و حلقهٔ پیشرفتِ گنجینهٔ واژگان روی خودِ جلد.

const RING_R = 15.5;
const RING_C = 2 * Math.PI * RING_R;

/** ورودِ پلکانیِ ستونِ متن — با reduce-motion خاموش (initial=false) */
const rise = (delay: number, reduceMotion: boolean) => ({
  initial: reduceMotion ? false : ({ opacity: 0, y: 14 } as const),
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: reduceMotion ? 0 : delay },
});

export default function HomeHero() {
  const openLesson = useStudy((s) => s.openLesson);
  const setView = useStudy((s) => s.setView);
  const known = useStudy((s) => s.known);
  const reduceMotion = useStudy((s) => s.settings.reduceMotion);
  const cp = coverProgress(known, TOTAL_VOCABULARY);

  // تیلتِ جلد — زاویه از موقعیتِ اشاره‌گر (±۷°)؛ بهاری برمی‌گردد.
  // فقط pointer:fine — لمسِ موبایل تیلت نمی‌گیرد (اسکرول مزاحم نمی‌شود)
  // و reduce-motion کلِ مسیر JS را هم می‌بندد — به احترامِ تنظیمِ کاربر.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 160, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 160, damping: 18 });

  return (
    <section className="grid items-center gap-8 pt-6 md:grid-cols-2 md:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="order-2 md:order-1"
      >
        <motion.span
          {...rise(0, reduceMotion)}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
        >
          <Sparkles size={13} />
          جزوهٔ کاغذی ⇠ تبدیل به وب‌کتاب تعاملی
        </motion.span>
        <motion.h1 {...rise(0.07, reduceMotion)} className="mb-3 text-3xl font-black leading-[1.35] text-stone-800 sm:text-4xl">
          آموزش زبان انگلیسی دبیرستان
          <span className="mt-1 block bg-gradient-to-l from-emerald-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
            «Vision Two» تعاملی و شنیداری
          </span>
        </motion.h1>
        <motion.p {...rise(0.14, reduceMotion)} className="mb-6 max-w-lg text-[15px] leading-8 text-stone-600">
          دوازده درس در {faNum(6)} پایه: جزوه‌های کامل هفتم تا دوازدهم — واژگان کامل، مکالمه و ریدینگ با <b className="text-emerald-700">روخوانی هوش مصنوعی</b>،
          گرامر تشریحی، فلش‌کارت و بیش از {faNum(TOTAL_QUESTIONS)} تست کنکوری — همه در یک کتاب دیجیتال زنده.
        </motion.p>
        <motion.div {...rise(0.21, reduceMotion)} className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openLesson(1)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition-[background-color,color,border-color,box-shadow,transform] hover:bg-emerald-800 hover:shadow-emerald-900/30 active:scale-[0.96]"
          >
            <BookOpen size={17} />
            شروع یادگیری — درس اول
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => setView({ type: "exam" })}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition-[background-color,color,border-color,transform] hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.96]"
          >
            <ClipboardCheck size={17} />
            آزمون جامع
          </button>
        </motion.div>

        <motion.div {...rise(0.28, reduceMotion)} className="mt-7 grid max-w-md grid-cols-3 gap-3">
          {[
            { icon: Languages, label: "واژگان", value: `${faNum(TOTAL_VOCABULARY)}+` },
            { icon: ListChecks, label: "تست تعاملی", value: `${faNum(TOTAL_QUESTIONS)}+` },
            { icon: Volume2, label: "روخوانی TTS", value: "کل متون" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border c-card p-3 text-center shadow-sm"
            >
              <s.icon size={18} className="mx-auto mb-1.5 text-emerald-600" />
              <div className="text-lg font-black text-stone-800">{s.value}</div>
              <div className="text-[11px] text-stone-500">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Book cover (Papermorph-style) — زنده: تیلت + درخش + حلقهٔ گنجینه */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="order-1 flex justify-center md:order-2"
      >
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="relative"
          style={{ perspective: 900 }}
        >
          <div className="absolute -inset-4 rounded-3xl bg-emerald-200/40 blur-2xl" aria-hidden />
          <motion.button
            onClick={() => openLesson(1)}
            onPointerMove={(e) => {
              if (reduceMotion) return;
              if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
              const rect = e.currentTarget.getBoundingClientRect();
              px.set((e.clientX - rect.left) / rect.width - 0.5);
              py.set((e.clientY - rect.top) / rect.height - 0.5);
            }}
            onPointerLeave={() => {
              px.set(0);
              py.set(0);
            }}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              boxShadow: "14px 18px 34px -14px rgb(6 78 59 / 0.5), inset 6px 0 12px -6px rgb(0 0 0 / 0.45)",
            }}
            className="hero-book relative block w-64 overflow-hidden rounded-r-2xl rounded-l-md bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 p-6 text-center text-white shadow-2xl shadow-emerald-900/40 sm:w-72"
            aria-label="باز کردن کتاب"
          >
            <div className="absolute inset-y-0 right-0 w-3 bg-black/25" aria-hidden />
            {/* لبهٔ صفحات — خطوطِ افقیِ نازک در لبهٔ چپ (فورِ-ادج) */}
            <div
              className="absolute inset-y-1 left-0 w-1.5 rounded-l"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.20) 0 1px, transparent 1px 5px)",
              }}
              aria-hidden
            />
            <div className="pt-4 text-[11px] font-bold tracking-widest text-emerald-100">
              ENGLISH FOR 11TH GRADE
            </div>
            <div className="en-text mt-6 text-5xl font-bold italic" dir="ltr">
              Vision
            </div>
            <div className="en-text text-6xl font-black italic text-amber-300" dir="ltr">
              Two
            </div>
            <div className="mx-auto my-4 h-px w-2/3 bg-emerald-400/50" />
            <div className="text-[13px] font-bold leading-7">
              وب‌کتاب تعاملی
              <br />
              واژگان · مکالمه · گرامر · تست
            </div>
            {/* حلقهٔ گنجینه — پیشرفتِ واقعیِ یادگیرنده روی جلد */}
            <div className="mt-4 flex items-center justify-center gap-2.5">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                role="img"
                aria-label={`گنجینهٔ واژگانِ تو: ${cp.fa}٪`}
                className="shrink-0"
              >
                <circle cx="18" cy="18" r={RING_R} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="3" />
                {cp.percent > 0 && (
                  <circle
                    cx="18"
                    cy="18"
                    r={RING_R}
                    fill="none"
                    stroke="rgb(252 211 77)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(cp.percent / 100) * RING_C} ${RING_C}`}
                    transform="rotate(-90 18 18)"
                  />
                )}
                <text x="18" y="21.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">
                  {cp.fa}
                </text>
              </svg>
              <div className="text-right leading-4">
                <div className="text-[11px] font-bold text-emerald-100">گنجینهٔ واژگانِ تو</div>
                <div className="text-[10px] text-emerald-100">
                  {cp.countFa} از {faNum(TOTAL_VOCABULARY)} واژه
                </div>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold">
              <Volume2 size={12} /> با روخوانی هوش مصنوعی
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
