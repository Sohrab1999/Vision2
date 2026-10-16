"use client";

// ------------------------------------------------------------------
// راند ۲۳۶ — دکمهٔ «ادامهٔ مطالعه» در هدرِ سراسری (بندِ ① پیشنهادِ ۲۳۴/۲۳۵):
// از هر نمایِ غیرِضمیمه‌ای یک‌کلیکی به همان‌جایِ آخرینِ دیده‌شده — درِ
// چهارمِ حلقه (کارتِ خانه، نشانگرِ سرِ ضمیمه، فرمان‌یاب و حالا هدر).
//
// صداقت‌ها:
//   • بی‌رکورد = هیچ دکمه‌ای رندر نمی‌شود (هیچ کنشِ ساختگی) — همان
//     قراردادِ نشانگرِ r234؛ snapshotِ سرور null است پس صفرِ ناسازگاریِ
//     هیدریشن (ایدئومِ r231/r234).
//   • روی خودِ نمایِ ضمیمه پنهان می‌شود — نشانگرِ سرِ ضمیمه همان‌جاست و
//     بودجهٔ هدر (Task 80) نباید خرجِ دکمهٔ تکراری شود.
//   • واکنش‌پذیر با storeِ خارجیِ bg-reading: شنیدنِ یک واک در ضمیمه
//     دکمهٔ هدر را بی‌درنگ تازه می‌کند (تولوتیپ و مقصد).
//   • کلیک = ناوبریِ view از قلابِ مشترکِ سه‌دره (r236) — صفرِ نوشتنِ
//     استورِ یادگیری.
//
// راند ۲۴۰ — «مسیرهای اخیر» زیرِ دکمهٔ هدر (بندِ ① پیشنهادِ ۲۳۹): یک
// دکمهٔ کوچکِ caret کنارِ نشانگر، فهرستِ کوچکی از جدیدترینِ ورودی‌هایِ
// «دیگر»ِ تاریخچه (vision2-bg-history — بدونِ کلیدِ تازه) را زیرِ خودش
// باز می‌کند؛ تا ۴ مسیر (پروفایل مالکِ همهٔ ۸تاست — این فقط پرشِ سریعِ
// همین‌جاست). همان قراردادهایِ حلقه: کلیکِ ردیف = ناوبریِ view از قلابِ
// مشترک — پرش ≠ نوشتن؛ خودِ رکوردِ فعلی هرگز در فهرست نمی‌آید (دکمهٔ
// اصلی همان را می‌برد). بودجهٔ هدر (Task 80) با اندازه‌گیریِ زنده
// رعایت شد: در ۳۹۰px فقط ۳px و در ۶۴۰px صفرpx جا مانده — caret فقط از
// md (۷۶۸px؛ ۷۸px فراغتِ اندازه‌گیری‌شده) بالا می‌آید؛ موبایل همان سه
// درِ قبلیِ «اخیراً» را دارد (سینیِ خانه، چیپِ نشانگر، تاریخچهٔ پروفایل)
// — همان ایدئومِ دکمهٔ راهنمای کیبورد (hidden تا sm). حلقهٔ کیبوردِ
// واحدِ r239 (RESUME_FOCUS_RING) رویِ caret و ردیف‌هایِ پنل هم نشسته —
// درهایِ Tab-پذیرِ تازهٔ همین حلقه‌اند.
// ------------------------------------------------------------------

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, History, Play } from "lucide-react";
import {
  APPENDIX_SCOPE_LABELS,
  appendixHistoryServerSnapshot,
  appendixHistorySnapshot,
  appendixResumeServerSnapshot,
  appendixResumeSnapshot,
  clearAppendixResume,
  subscribeAppendixHistory,
  subscribeAppendixResume,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { useAppendixResumeNav } from "../shared/use-appendix-resume-nav";
import { useToast } from "@/hooks/use-toast";
import { faNum, RESUME_FOCUS_RING } from "@/lib/study-theme";
import { PULSE_HEADER_RESUME_EVENT } from "@/lib/resume-loop-doors";

/** سقفِ مسیرهایِ پنلِ سریعِ هدر — پروفایل مالکِ تاریخچهٔ کاملِ ۸تاست. */
const HEADER_RECENT_CAP = 4;
const RECENT_PANEL_ID = "header-resume-recent";

export default function HeaderResumeButton() {
  const item = useSyncExternalStore(
    subscribeAppendixResume,
    appendixResumeSnapshot,
    appendixResumeServerSnapshot,
  );
  // راند ۲۴۰ — تاریخچه با snapshotِ جدا اما همان ایدئومِ r231؛ فقط
  // جدیدترینِ «دیگر»ها به پنلِ سریع می‌آیند (سقفِ ۴).
  const history = useSyncExternalStore(
    subscribeAppendixHistory,
    appendixHistorySnapshot,
    appendixHistoryServerSnapshot,
  );
  const view = useStudy((s) => s.view);
  const navigateResume = useAppendixResumeNav();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // راند ۲۴۴ — پالسِ زرشکیِ گذرا (بندِ ② پیشنهادِ ۲۴۳): بعد از پرشِ اسکرول
  // از کارتِ راهنما/فرمان‌یاب، فوکوس به‌تنهایی همیشه دیده نمی‌شود (focus-visible
  // پس از فوکوسِ برنامه‌ای در همهٔ مرورگرها یکسان رفتار نمی‌کند) — همان
  // ایدئومِ لنگرِ ضمیمهٔ r235: هایلایتِ گذرای ۱٫۶ثانیه‌ای که مالکش خودِ دکمه
  // است و پرنده‌هایِ در فقط رویداد می‌فرستند (تک‌نقطه‌ای بودنِ منطقِ نمایش).
  const [pulsing, setPulsing] = useState(false);
  const pulseTimerRef = useRef<number | null>(null);
  useEffect(() => {
    const onPulse = () => {
      setPulsing(true);
      // پالسِ ۱٫۶ثانیه‌ای — عمداً بیرونِ پاک‌سازیِ effect (آموزشِ r234)
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(() => {
        pulseTimerRef.current = null;
        setPulsing(false);
      }, 1600);
    };
    window.addEventListener(PULSE_HEADER_RESUME_EVENT, onPulse);
    return () => {
      window.removeEventListener(PULSE_HEADER_RESUME_EVENT, onPulse);
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    };
  }, []);

  // راند ۲۳۷ — کلیکِ راست رویِ دکمهٔ هدر = پاک‌کردنِ رکورد (بندِ ① پیشنهادِ
  // ۲۳۶). پاک‌کردنِ فوری + توست — همان سبکِ قطعِ همگام‌سازی؛ رکوردِ پاک‌شده
  // با نخستین دیدنِ بعدی در ضمیمه دوباره ساخته می‌شود، پس کنشِ کم‌خطر است.
  const handleClear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    clearAppendixResume();
    toast({
      title: "ادامهٔ مطالعه پاک شد",
      description: "نشانگرِ آخرین موضوع برداشته شد — با نخستین دیدنِ بعدی در ضمیمه دوباره ساخته می‌شود.",
      duration: 3000,
    });
  };

  // راند ۲۴۰ — Escape پنلِ «مسیرهای اخیر» را می‌بندد (باز بودنش معنا دارد)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // بی‌رکورد یا خودِ ضمیمه = هیچ (قراردادِ صداقت + بودجهٔ هدر). تاریخچه
  // به‌تنهایی درِ هدر را باز نمی‌کند — سینیِ خانه و پروفایل پاسخگویِ
  // «اخیراً»ی بی‌رکوردند (تقسیمِ کارِ r238)؛ اینجا فقط دکمه‌ای که هست
  // غنی‌تر می‌شود.
  if (!item || view.type === "appendix") return null;

  const recents = history
    .filter((h) => !(h.scope === item.scope && h.id === item.id))
    .slice(0, HEADER_RECENT_CAP);

  const layer = APPENDIX_SCOPE_LABELS[item.scope];
  const tooltip = `ادامهٔ مطالعه از «${item.title}» در ${layer}${item.hint ? ` — ${item.hint}` : ""}`;

  return (
    <div className="relative flex items-center" data-testid="header-resume-cluster">
      <button
        type="button"
        onClick={() => navigateResume(item)}
        onContextMenu={handleClear}
        aria-label={tooltip}
        title={tooltip}
        data-testid="header-resume-button"
        data-pulsing={pulsing ? "true" : undefined}
        // راند ۲۳۹ — حلقهٔ کیبوردِ واحدِ درهایِ «ادامه» (بندِ ② پیشنهادِ ۲۳۸)
        // راند ۲۴۴ — پالسِ زرشکیِ گذرا: هایلایتِ هم‌خانوادهٔ لنگرِ ضمیمه اما
        // زرشکی تا با حلقهٔ زمردیِ focus-visible آمیخته نشود؛ box-shadow هم
        // به ترنزیشن اضافه شد تا حلقهٔ درونیِ inset نرم محو شود.
        className={`flex h-11 min-w-11 max-w-[13rem] shrink-0 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-emerald-700 shadow-sm transition-[background-color,color,border-color,transform,box-shadow] hover:bg-emerald-100 hover:border-emerald-300 active:scale-[0.96] dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70 ${
          pulsing
            ? "border-rose-300 bg-rose-50 shadow-[inset_0_0_0_2px] shadow-rose-300 dark:border-rose-700 dark:bg-rose-950/40 dark:shadow-rose-700"
            : ""
        } ${RESUME_FOCUS_RING}`}
      >
        <Play size={15} className="shrink-0" />
        <span className="hidden min-w-0 truncate text-[12.5px] font-extrabold min-[420px]:inline">
          ادامه از «{item.title}»
        </span>
      </button>
      {recents.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={RECENT_PANEL_ID}
          aria-label={`مسیرهای اخیر ضمیمه — ${faNum(recents.length)} مسیر`}
          title="مسیرهای اخیر ضمیمه"
          data-testid="header-resume-recent-toggle"
          // بودجهٔ هدر (Task 80): اندازه‌گیریِ زندهٔ راند ۲۴۰ — زیرِ md جا
          // نیست (۳۹۰px: فراغتِ ۳px، ۶۴۰px: صفر)؛ از md بالا فقط همین
          // caret اضافه می‌شود. موبایل درهایِ خودش را دارد (سند بالای فایل).
          className={`hidden h-11 w-8 items-center justify-center rounded-full text-emerald-600 transition-[background-color,color,transform] hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.96] dark:text-emerald-400 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 md:flex ${RESUME_FOCUS_RING}`}
        >
          <ChevronDown
            size={14}
            className={`shrink-0 transition-[transform] ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
      {open && recents.length > 0 && (
        <>
          {/* پردهٔ بستن — یک کلیکِ بیرون از پنل؛ نامرئی، بدونِ توقفِ تب */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            data-testid="header-resume-recent-backdrop"
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            id={RECENT_PANEL_ID}
            data-testid="header-resume-recent"
            className="absolute top-full z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl ltr:left-0 rtl:right-0 dark:border-stone-700 dark:bg-stone-900"
          >
            <p className="mb-1 flex items-center gap-1 px-1.5 pt-1 text-[9.5px] font-black text-stone-500">
              <History size={10} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              مسیرهای اخیر در ضمیمه
              <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[8.5px] font-black text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {faNum(recents.length)}
              </span>
            </p>
            <div className="flex flex-col gap-0.5">
              {recents.map((h) => (
                <button
                  key={`${h.scope}:${h.id}`}
                  type="button"
                  data-testid={`header-recent-item-${h.scope}-${h.id}`}
                  onClick={() => {
                    navigateResume(h);
                    setOpen(false);
                  }}
                  title={`پرش به «${h.title}» در ${APPENDIX_SCOPE_LABELS[h.scope]} — این پرش نشانگرِ «ادامهٔ مطالعه» را عوض نمی‌کند${h.hint ? ` — ${h.hint}` : ""}`}
                  className={`flex min-h-9 items-center justify-between gap-1.5 rounded-lg px-2 text-right transition-[background-color,color] hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200 ${RESUME_FOCUS_RING}`}
                >
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-bold text-stone-700 dark:text-stone-200">
                    «{h.title}»
                  </span>
                  <span className="shrink-0 text-[9px] font-bold text-stone-500">
                    {APPENDIX_SCOPE_LABELS[h.scope]}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-1 border-t border-stone-100 px-1.5 pt-1.5 text-[9px] leading-relaxed text-stone-500 dark:border-stone-800">
              پرش به مسیرهای اخیر نشانگرِ «ادامهٔ مطالعه» را عوض نمی‌کند — فقط یک دیدنِ دوباره است.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
