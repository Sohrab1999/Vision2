"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Keyboard, BookMarked, ClipboardCheck, Sun, Moon, History, ChevronLeft, MousePointerClick, MapPin, House, CalendarClock, GraduationCap } from "lucide-react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudy, type LessonTab } from "@/lib/study-store";
import {
  appendixResumeServerSnapshot,
  appendixResumeSnapshot,
  subscribeAppendixResume,
} from "@/lib/bg-reading";
import { RESUME_LOOP_DOORS, DOOR_HANDOFF_DELAY_MS as HANDOFF_DELAY_MS, focusHeaderDoor, openAppendixDoor, type ResumeLoopDoor } from "@/lib/resume-loop-doors";
import { RESUME_DOOR_COVERAGE } from "@/lib/resume-door-coverage";
import { RETURN_CLUSTER_DOORS, RETURN_HOME_OPEN_LABEL } from "@/lib/return-cluster-doors";
import { faNum, RESUME_FOCUS_RING } from "@/lib/study-theme";
import { isTypingTarget, useKeydown } from "@/hooks/use-keyboard";
// r381 — پرشِ داشبورد از کارتِ راهنما: عینِ قراردادِ پالتِ r372 — کتابخانهٔ
// دامنه مالکِ پرش و پرچم است؛ و گیتِ پیشرفت هم از موتورِ تکمنبعِ همان‌جا
import { requestSrsSpotlight, focusSrsDashboard, hasProgressOf } from "@/lib/srs-due";

/**
 * راهنمای میان‌برهای کیبورد + اجرای میان‌برهای سراسری.
 * کلید «؟» (Shift+/) یا کلیک روی دکمهٔ کیبورد (هدر/فوتر) پنجره را باز می‌کند.
 * میان‌برها با e.code (کلید فیزیکی) تطبیق داده می‌شوند تا روی چیدمان
 * فارسی (که حروف/ارقام فارسی تولید می‌کند) هم کار کنند.
 */

function isTyping(e: KeyboardEvent): boolean {
  return isTypingTarget(e);
}

interface Row {
  keys: string[];
  desc: string;
}

const GROUPS: { title: string; icon: React.ElementType; rows: Row[] }[] = [
  {
    title: "میان‌برهای سراسری",
    icon: Keyboard,
    rows: [
      { keys: ["H"], desc: "رفتن به خانه" },
      { keys: ["D"], desc: "دیکشنری واژگان" },
      { keys: ["E"], desc: "آزمون جامع" },
      { keys: ["A"], desc: "ضمیمهٔ کتاب" },
      { keys: ["C"], desc: "چالش برق‌آسا (۶۰ ثانیه)" },
      { keys: ["V"], desc: "نبرد دودنفره (زنده، دو نفره)" },
      { keys: ["G"], desc: "گوشهٔ کنکور (بانک ۳۶۰ تستی)" },
      { keys: ["M"], desc: "متروی گرامر — نقشهٔ سفر گرامر کتاب" },
      { keys: ["T"], desc: "تغییر حالت شب / روز" },
      { keys: ["?"], desc: "باز و بسته کردن همین راهنما" },
      { keys: ["Ctrl", "K"], desc: "فرمان‌یاب — جست‌وجوی همه‌جا و اجرای سریع فرمان‌ها" },
    ],
  },
  {
    title: "در درس‌ها",
    icon: BookMarked,
    rows: [
      { keys: ["1", "…", "7"], desc: "پرش مستقیم به تب‌های درس (واژگان، مکالمه، ریدینگ، گرامر، نگارش، دیکته، تست‌ها)" },
      { keys: ["F"], desc: "فلش‌کارت مرور هوشمند واژگان درس" },
    ],
  },
  {
    title: "فلش‌کارت‌ها",
    icon: ClipboardCheck,
    rows: [
      { keys: ["Space"], desc: "برگرداندن کارت (دیدن معنی)" },
      { keys: ["←"], desc: "کارت بعدی" },
      { keys: ["→"], desc: "کارت قبلی" },
      { keys: ["K"], desc: "بلدم — ثبت در مرور هوشمند" },
      { keys: ["R"], desc: "تکرار — مرور دوبارهٔ همین کارت" },
    ],
  },
  {
    title: "در آزمون‌ها",
    icon: ClipboardCheck,
    rows: [
      { keys: ["1", "…", "4"], desc: "انتخاب گزینه" },
      { keys: ["Enter", "←"], desc: "سؤال بعدی" },
    ],
  },
  {
    // r402..r408 — گروهِ تمرینهای چهارگزینه‌ای: همان ایدئومِ کوئیز برایِ هر شش بانک
    // (فعلِ r400، واژهِ r403، نشانهٔ r404، تلفظِ r405، مثالهایِ درسنامهٔ r406 و
    // واژگانِ r407 — که r408 مقیاسِ سراسریِ دیکشنریاش هم آمد) — ثبتِ صادق در راهنما
    title: "تمرین‌های چهارگزینه‌ای (فعل، واژه، نشانه، تلفظ، درسنامه و واژگانِ درس و دیکشنری)",
    icon: GraduationCap,
    rows: [
      { keys: ["1", "…", "4"], desc: "انتخاب گزینه (ارقام فارسی و لاتین، هر چیدمان)" },
      { keys: ["Enter", "←"], desc: "پرسش بعدی — فقط پس از پاسخ" },
    ],
  },
];

const LESSON_TABS: { key: LessonTab; label: string }[] = [
  { key: "vocab", label: "واژگان" },
  { key: "conversation", label: "مکالمه" },
  { key: "reading", label: "ریدینگ" },
  { key: "grammar", label: "گرامر" },
  { key: "writing", label: "نگارش" },
  { key: "dictation", label: "دیکته" },
  { key: "tests", label: "تست‌ها" },
];

// صادرشده برای فرمان‌یاب (task 66) — همان چیپ کلید همه‌جا
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      dir="ltr"
      className="inline-flex min-w-[26px] items-center justify-center rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-stone-600 shadow-[0_1px_0_0_#e7e5e4]"
    >
      {children}
    </kbd>
  );
}

// راند ۲۴۳ — تحویلِ فوکوس بینِ دو دایالوگ: راهنما هنگامِ بسته‌شدن فوکوس را
// به دکمهٔ فراخوانش برمی‌گرداند (FocusScopeِ رادیکس — بعد از انیمیشنِ خروجِ
// ۲۰۰ms). اگر فرمان‌یاب/پروفایل را هم‌زمان باز کنیم، بازگشتِ فوکوسِ راهنما
// فوکوسِ تازه‌وارد را می‌دزدد — پس کنش‌هایِ فوکوس‌بر بعد از ۲۶۰ms اجرا می‌شوند.
// راند ۲۴۴ — ثابت به DOOR_HANDOFF_DELAY_MS (lib/resume-loop-doors) کوچید تا
// فرمان‌یاب (گروهِ «درهای حلقه») هم همان قرارداد را داشته باشد — یک عدد، یک منبع.

export default function ShortcutGuide() {
  const [open, setOpen] = useState(false);
  const setView = useStudy((s) => s.setView);
  const openLesson = useStudy((s) => s.openLesson);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const view = useStudy((s) => s.view);
  const lessonTab = useStudy((s) => s.lessonTab);
  // r381 — گیتِ ردیفِ داشبورد: عینِ گیتِ خانه/پالت از موتورِ تکمنبع —
  // بیپیشرفتِ واقعی نه پنل رندر میشود نه این ردیف (صداقتِ r236 — هیچ پرشِ ساختگی)
  const known = useStudy((s) => s.known) ?? {};
  const results = useStudy((s) => s.results) ?? {};
  const srsMap = useStudy((s) => s.srs) ?? {};
  const libraryDone = useStudy((s) => s.libraryDone) ?? {};
  const hasProgress = hasProgressOf(known, results, srsMap, libraryDone);
  const { theme, setTheme } = useTheme();
  // راند ۲۴۳ — درِ هدر فقط وقتی «هست» که رکوردی باشد و رویِ خودِ ضمیمه
  // نباشیم (قراردادِ صداقتِ r236: بی‌رکورد هیچ کنشِ ساختگی). همان ایدئومِ
  // storeِ خارجیِ دکمهٔ هدر — هیدریشنِ صادقانه با snapshotِ سرورِ null.
  const resumeItem = useSyncExternalStore(
    subscribeAppendixResume,
    appendixResumeSnapshot,
    appendixResumeServerSnapshot,
  );
  const handoffRef = useRef<number | null>(null);

  // open via event (header/footer buttons)
  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("open-shortcuts", handler);
    return () => window.removeEventListener("open-shortcuts", handler);
  }, []);

  // راند ۲۴۳ — تایمرِ تحویلِ درها با خودِ کامپوننت تمیز شود
  useEffect(() => {
    return () => {
      if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
    };
  }, []);

  // راند ۲۴۳ ② — «کلیک روی هر ردیف، همان در را باز می‌کند»: ناوبری‌ها
  // فوری‌اند (بی‌تعارضِ فوکوس)؛ فرمان‌یاب/پروفایل بعد از بسته‌شدنِ کاملِ
  // راهنما باز می‌شوند (HANDOFF_DELAY_MS) و درِ هدر با اسکرولِ نرم و
  // فوکوس نشان داده می‌شود (حلقهٔ کیبوردِ r239 در focus-visible).
  // راند ۳۶۷ — رفتنِ خانه از هر دو خانوادهٔ ردیف (درهایِ حلقه و خوشهٔ
  // بازگشت) از همین یک نقطه می‌گذرد — یک منطق، یک منبع.
  const goHomeThroughDoor = () => {
    if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
    setOpen(false);
    setView({ type: "home" });
  };

  // r381 — پرشِ داشبورد از کارتِ راهنما (بندِ ④ پیشنهادِ r373 — هشت‌راند معطل):
  // عینِ dispatchِ پالتِ r372 با افزودنِ بستنِ دیالوگ (درسِ r243 — FocusScopeِ
  // بستهشونده فوکوس را پس میگیرد، پسِ پرشِ فوکوس‌برِ رویِ خانه بعد از دورهٔ
  // تحویلِ HANDOFF_DELAY_MS؛ از نمایِ دیگر پرچمِ یک‌بارمصرف + ناوبری —
  // مالکِ نمایش (srs-panel) بعد از mount مصرفش میکند).
  const jumpToSrsDashboard = () => {
    if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
    setOpen(false);
    if (view.type !== "home") {
      requestSrsSpotlight();
      setView({ type: "home" });
    } else {
      handoffRef.current = window.setTimeout(() => {
        handoffRef.current = null;
        focusSrsDashboard();
      }, HANDOFF_DELAY_MS);
    }
  };

  const runDoorAction = (door: ResumeLoopDoor) => {
    const a = door.action;
    if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
    setOpen(false);
    if (a.kind === "goto-home") {
      goHomeThroughDoor();
      return;
    }
    if (a.kind === "goto-appendix") {
      // راند ۲۴۶ — helperِ مشترک: رویِ خودِ ضمیمه رویدادِ زندهٔ نشانگر،
      // از جای دیگر پرچمِ یک‌بارمصرف + ناوبریِ فوری (ناوبری‌ها بی‌تعارضِ فوکوس‌اند).
      openAppendixDoor(setView, view.type === "appendix");
      return;
    }
    if (a.kind === "goto-results") {
      // راند ۲۴۶ — درِ ششم: باز کردنِ خودِ محلِ خطِ «ادامهٔ مطالعه» —
      // تبِ تست‌های درسِ حاضر، وگرنه درسِ اول (مدخلِ اصلیِ کتاب).
      openLessonTab(view.type === "lesson" ? view.id : 1, "tests");
      return;
    }
    handoffRef.current = window.setTimeout(() => {
      handoffRef.current = null;
      if (a.kind === "open-palette") {
        window.dispatchEvent(new CustomEvent("open-command-palette"));
      } else if (a.kind === "open-profile") {
        window.dispatchEvent(new CustomEvent("open-profile"));
      } else if (a.kind === "focus-header") {
        // راند ۲۴۴ — کمکیِ مشترکِ درِ هدر: اسکرول + فوکوس + رویدادِ پالسِ
        // زرشکی (همان ایدئومِ لنگرِ ضمیمه؛ دکمهٔ هدر مالکِ نمایشِ پالس است).
        focusHeaderDoor();
      }
    }, HANDOFF_DELAY_MS);
  };

  // inside an active test/exam/challenge the nav letters/numbers are disabled
  // so they can't wipe an in-progress session (quiz uses 1-4 itself)
  const quizContext =
    view.type === "exam" || view.type === "rush" || view.type === "duel" || view.type === "konkur" || (view.type === "lesson" && lessonTab === "tests");

  // global shortcuts + «؟» toggle (layout-independent: matches e.code)
  useKeydown((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTyping(e)) return;
    // «؟» = ASCII ? (EN layout) or U+061F (FA layout on the same physical key)
    if (e.key === "?" || e.key === "؟") {
      e.preventDefault();
      setOpen((v) => !v);
      return;
    }
    if (open || quizContext) return; // dialog handles its own Escape
    const code = e.code;
    if (code === "KeyH") setView({ type: "home" });
    else if (code === "KeyD") setView({ type: "dictionary" });
    else if (code === "KeyE") setView({ type: "exam" });
    else if (code === "KeyA") setView({ type: "appendix" });
    else if (code === "KeyC") setView({ type: "rush" });
    else if (code === "KeyV") setView({ type: "duel" });
    else if (code === "KeyG") setView({ type: "konkur" });
    else if (code === "KeyM") setView({ type: "grammar" });
    else if (code === "KeyT") setTheme(theme === "dark" ? "light" : "dark");
    else if (code === "KeyF" && view.type === "lesson") openLesson(view.id, "smart");
    else if (/^(Digit|Numpad)[1-7]$/.test(code) && view.type === "lesson") {
      const tab = LESSON_TABS[Number(code.slice(-1)) - 1];
      if (tab) openLessonTab(view.id, tab.key);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="shortcuts-dialog max-h-[85vh] overflow-y-auto rounded-2xl p-0 sm:max-w-lg nice-scroll">
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-l from-emerald-500 via-cyan-500 to-violet-500" />
        <div className="p-5 pt-4">
          <DialogHeader className="mb-4 text-right">
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold text-stone-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-stone-600 to-stone-800 text-white shadow-md">
                <Keyboard size={18} />
              </span>
              راهنمای میان‌برهای کیبورد
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-6 text-stone-500">
              بدون ماوس هم می‌توانی کل کتاب را ورق بزنی — کلید «؟» این راهنما را هر جا باز می‌کند.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {GROUPS.map((g) => (
              <section key={g.title} className="rounded-xl border border-stone-200 c-stone-70 p-3">
                <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-extrabold text-stone-700">
                  <g.icon size={14} className="text-emerald-600" />
                  {g.title}
                </h3>
                <ul className="space-y-1.5">
                  {g.rows.map((r) => (
                    <li key={r.desc} className="flex items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-[12px] font-bold text-stone-600">{r.desc}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        {r.keys.map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-[10px] text-stone-500">/</span>}
                            <Kbd>{k}</Kbd>
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* حلقهٔ «ادامهٔ مطالعه» (r242 ②، راند ۲۴۳ ①+②) — درها از
                RESUME_LOOP_DOORS (تک‌منبعِ حقیقتِ src/lib/resume-loop-doors.ts)
                رندر می‌شوند: درِ نو به فهرست اضافه شود، کارتِ راهنما خودش
                تازه می‌شود. هر ردیف حالا یک دکمهٔ واقعی است — کلیکش همان
                در را باز می‌کند (ناوبری فوری؛ فرمان‌یاب/پروفایل/فوکوسِ هدر
                بعد از HANDOFF_DELAY_MS). صداقتِ کلیدِ r242 پابرجا: فقط
                Ctrl+K چیپ دارد؛ چهار درِ دیگر با برچسبِ محل. درِ هدر
                بی‌رکورد یا رویِ خودِ ضمیمه صادقانه disable است. */}
            <section
              data-testid="shortcut-guide-resume-loop"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
            >
              <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-extrabold text-emerald-800">
                <History size={14} className="shrink-0 text-emerald-600" aria-hidden />
                حلقهٔ «ادامهٔ مطالعه» — هر جا رها کنی، از همین‌جاها برمی‌گردی
              </h3>
              <ul className="space-y-1.5">
                {RESUME_LOOP_DOORS.map((door) => {
                  const disabled =
                    door.action.kind === "focus-header" && (!resumeItem || view.type === "appendix");
                  return (
                    <li key={door.id}>
                      <button
                        type="button"
                        onClick={() => runDoorAction(door)}
                        disabled={disabled}
                        title={
                          disabled
                            ? !resumeItem
                              ? door.closedHint ?? door.openLabel
                              : "روی خودِ ضمیمه دکمهٔ هدر مستور است — نشانگرِ سرِ صفحه همین در است"
                            : door.openLabel
                        }
                        data-testid={`resume-door-${door.id}`}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 text-right shadow-sm transition-[background-color,color,opacity] hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white ${RESUME_FOCUS_RING}`}
                      >
                        <span className="min-w-0 text-[12px] font-bold leading-5 text-stone-600">
                          {door.lead ? (
                            <>
                              <span className="text-emerald-700">{door.lead}</span> {door.text}
                            </>
                          ) : (
                            door.text
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          {door.keys?.map((k, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {i > 0 && <span className="text-[10px] text-stone-500">+</span>}
                              <Kbd>{k}</Kbd>
                            </span>
                          ))}
                          {!disabled && (
                            <ChevronLeft size={12} className="shrink-0 text-emerald-600" aria-hidden />
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                <MousePointerClick size={11} className="shrink-0" aria-hidden />
                کلیک روی هر ردیف، همان در را باز می‌کند.
              </p>
            </section>

            {/* راند ۳۶۷ — بندِ ③ پیشنهادِ r366: «خوشهٔ بازگشت» — خانه به
                یاد دارد. از RETURN_CLUSTER_DOORS (تک‌منبعِ حقیقتِ
                src/lib/return-cluster-doors.ts) رندر می‌شود — درِ نو به
                خانه اضافه شود، این بخش خودش تازه می‌شود (سومین «فهرستِ
                زنده» پس از درهایِ حلقه و پوشش). ردیفها دکمه‌اند: کلیک به
                خانه می‌برد — درها فقط آن‌جایند (همان شاخهٔ goto-homeِ
                runDoorAction). صداقتِ هر در زیرِ خودش است: gateHint
                می‌گوید «چه‌وقت هست» — بی‌رکورد، هیچ (r236). پالت:
                همان کلاسهایِ موجودِ همین فایل — صفرِ CSS. */}
            <section
              data-testid="shortcut-guide-return-cluster"
              className="rounded-xl border border-stone-200 c-stone-70 p-3"
            >
              <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-extrabold text-stone-700">
                <House size={14} className="shrink-0 text-emerald-600" aria-hidden />
                خوشهٔ بازگشت — خانه به یاد دارد — {faNum(RETURN_CLUSTER_DOORS.length)} در
              </h3>
              <ul className="space-y-1.5">
                {RETURN_CLUSTER_DOORS.map((door) => (
                  <li key={door.id}>
                    <button
                      type="button"
                      onClick={goHomeThroughDoor}
                      title={RETURN_HOME_OPEN_LABEL}
                      data-testid={`return-door-${door.id}`}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 text-right shadow-sm transition-[background-color,color] hover:bg-emerald-50 hover:text-emerald-800 ${RESUME_FOCUS_RING}`}
                    >
                      <span className="min-w-0 text-[12px] font-bold leading-5 text-stone-600">
                        <span className="text-emerald-700">{door.label}:</span> {door.text}
                      </span>
                      <ChevronLeft size={12} className="shrink-0 text-emerald-600" aria-hidden />
                    </button>
                    <p className="mt-0.5 pr-3.5 text-[10.5px] font-bold leading-4 text-stone-500">
                      {door.gateHint}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex items-start gap-1 text-[10px] font-bold leading-4 text-emerald-800">
                <MousePointerClick size={11} className="mt-0.5 shrink-0" aria-hidden />
                کلیک روی هر ردیف به خانه می‌برد — هر در فقط وقتی هست که چیزی برایِ برگشتن داشته باشی (بی‌رکورد، هیچ).
              </p>
            </section>

            {/* راند ۳۸۱ — بندِ ④ پیشنهادِ r373 (هشت‌راند معطل): «داشبوردِ مرور» هم
                به کارتِ راهنما میپیوندد — چهارمین «فهرستِ زنده» نه؛ یک مقصدِ
                تک‌ردیفی با گیتِ صادقِ موتورِ تکمنبع (hasProgressOfِ srs-due —
                همان گیتِ خانه/پالت). پرش عینِ dispatchِ پالتِ r372: از نمایِ
                دیگر پرچمِ یک‌بارمصرف + ناوبری؛ رویِ خودِ خانه پرشِ فوکوس‌بر
                بعد از دورهٔ تحویلِ فوکوس (درسِ r243). صداقتِ r236: بی‌پیشرفت
                داشبوردی نیست که به آن پرید — ردیف اصلاً نیست. */}
            {hasProgress && (
              <section
                data-testid="shortcut-guide-srs-dashboard"
                className="rounded-xl border border-stone-200 c-stone-70 p-3"
              >
                <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-extrabold text-stone-700">
                  <CalendarClock size={14} className="shrink-0 text-emerald-600" aria-hidden />
                  داشبورد مرور هوشمند — پرش به سررسیدها
                </h3>
                <ul className="space-y-1.5">
                  <li>
                    <button
                      type="button"
                      onClick={jumpToSrsDashboard}
                      title="پرش به داشبورد مرور"
                      data-testid="guide-srs-dashboard-row"
                      className={`flex w-full items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 text-right shadow-sm transition-[background-color,color] hover:bg-emerald-50 hover:text-emerald-800 ${RESUME_FOCUS_RING}`}
                    >
                      <span className="min-w-0 text-[12px] font-bold leading-5 text-stone-600">
                        <span className="text-emerald-700">سررسیدها:</span> نردبان حافظه و پیش‌بینی هفت‌روزه — همان‌جا که کنشِ مرور زندگی میکند
                      </span>
                      <ChevronLeft size={12} className="shrink-0 text-emerald-600" aria-hidden />
                    </button>
                  </li>
                </ul>
                <p className="mt-2 flex items-start gap-1 text-[10px] font-bold leading-4 text-emerald-800">
                  <MousePointerClick size={11} className="mt-0.5 shrink-0" aria-hidden />
                  فقط برایِ یادگیرندهٔ دارایِ پیشرفت هست — بی‌پیشرفت داشبوردی نیست که به آن پرید (بی‌رکورد، هیچ).
                </p>
              </section>
            )}

            {/* راند ۲۵۱ — بندِ ② پیشنهادِ ۲۴۹: جدولِ «پوششِ درها» — از
                RESUME_DOOR_COVERAGE (تک‌منبعِ حقیقتِ src/lib/resume-door-coverage.ts)
                رندر می‌شود: محلِ نو به خانواده اضافه شود، این کارت خودش تازه
                می‌شود. برخلافِ بخشِ درها این‌جا ردیف‌ها اطلاعاتی‌اند نه دکمه —
                کنش‌ها را بخشِ بالا دارد؛ این نقشهٔ «کجاها» است. صداقتِ
                nav-resume در پانویس تکرار می‌شود: بی‌رکورد، هیچ. */}
            <section
              data-testid="shortcut-guide-coverage"
              className="rounded-xl border border-stone-200 c-stone-70 p-3"
            >
              <h3 className="mb-2 flex flex-wrap items-center gap-1.5 text-[12.5px] font-extrabold text-stone-700">
                <MapPin size={14} className="shrink-0 text-emerald-600" aria-hidden />
                ردیفِ «ادامهٔ مطالعه» همه‌جایِ حکم — پوششِ {faNum(RESUME_DOOR_COVERAGE.length)}گانه
              </h3>
              <ul className="space-y-1.5">
                {RESUME_DOOR_COVERAGE.map((c) => (
                  <li
                    key={c.id}
                    data-testid={`coverage-${c.id}`}
                    className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                      <span className="min-w-0 text-[12px] font-extrabold text-stone-700">{c.label}</span>
                    </div>
                    <p className="mt-0.5 pr-3.5 text-[10.5px] font-bold leading-4 text-stone-500">{c.where}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex items-start gap-1 text-[10px] font-bold leading-4 text-emerald-800">
                <MousePointerClick size={11} className="mt-0.5 shrink-0" aria-hidden />
                این ردیف فقط وقتی دیده می‌شود که نشانگری از ضمیمه داشته باشی — بی‌رکورد، هیچ (صداقتِ همیشگیِ حلقه).
              </p>
            </section>

            <p className="flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold leading-5 text-amber-800">
              <Sun size={13} className="mt-0.5 shrink-0" />
              <span>
                میان‌برهای حرفی هنگام تایپ در جعبه‌های متن و همچنین وسط آزمون غیرفعال می‌شوند تا نتیجه‌ات از دست نرود.
                روی چیدمان کیبورد فارسی هم کار می‌کنند (کلیدهای فیزیکی).
                <Moon size={11} className="mx-1 inline text-amber-600" />
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
