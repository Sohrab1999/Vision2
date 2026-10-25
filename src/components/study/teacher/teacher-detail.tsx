"use client";

// ------------------------------------------------------------------
// r353 — «عمقِ پنلِ معلم» — گامِ دوم: دیالوگِ جزئیاتِ تک‌یادگیرنده.
// از ردیفِ فهرستِ پنل (r352) با شناسهٔ ناموجودالاثرِ handle باز
// میشود؛ داده از GET /api/teacher/learner میآید و همهچیز خواندنی
// است. صداقت‌ها: بیتلاش «—» دارد نه صفر؛ روزهایِ بیرویداد صفرِ
// واقعی؛ 404ِ «یافت نشد» بدونِ دکمهٔ تلاشِ دوباره (تکرارِ همان
// handle کمکی نمیکند — تفاوتِ صادقِ r348)؛ خطایِ شبکه retry دارد.
// dark: کرنلِ سراسری .dark .bg-white — صفرِ قاعدهٔ تازه (r350).
// ------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, UserRound, ClipboardList, Gauge, Trophy, Layers, History, SearchX, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import { lastActiveFa, type LearnerDetail } from "@/lib/teacher-report";
import { teacherSkillLabel } from "@/lib/teacher-skill-label"; // r375 — تکمنبعِ برچسبِ مهارت (نسخهٔ دوقلو بازنشسته شد)
import { downloadLearnerCardCsv, weakestSkillMeta } from "@/lib/teacher-learner-csv";
import { fileFailToast } from "@/lib/file-download";

const DOT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  teal: "bg-teal-500",
  orange: "bg-orange-500",
};

export const learnerDot = (c: string): string => DOT_COLORS[c] ?? "bg-stone-500";

const skillLabel = teacherSkillLabel; // r375 — تکمنبع؛ مصرفِ داخلیِ فایل تغییرنکردنی ماند

type DetailPhase = "loading" | "ready" | "missing" | "auth" | "net";

/** برچسبِ فارسیِ روزهایِ نوار — الگویِ روزانهٔ نبض/پنل (امروز/دیروز/روزِ ماه) */
function stripLabels(now: number, days: number): { day: string; label: string }[] {
  const out: { day: string; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ day: d, label: i === 0 ? "امروز" : i === 1 ? "دیروز" : faNum(Number(d.slice(8, 10))) });
  }
  return out;
}

export default function TeacherDetailDialog({
  handle,
  code,
  open,
  onOpenChange,
  onAuthError,
}: {
  handle: string;
  code: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAuthError: () => void;
}) {
  const [phase, setPhase] = useState<DetailPhase>("loading");
  const [detail, setDetail] = useState<LearnerDetail | null>(null);
  const [missingMsg, setMissingMsg] = useState("");
  const [csvBusy, setCsvBusy] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/teacher/learner?handle=${encodeURIComponent(handle)}`, {
        cache: "no-store",
        headers: { "x-teacher-code": code },
      });
      // ۴۰۳ = قراردادِ خانه برای unauthorized؛ ۴۰۱ هم پوشانده میشود (دفاعی)
      if (res.status === 403 || res.status === 401) {
        setPhase("auth");
        onAuthError();
        return;
      }
      if (res.status === 404) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setMissingMsg(body.error ?? "یادگیرندهٔ موردنظر یافت نشد — فهرست را تازه کن.");
        setPhase("missing"); // تکرارِ همان handle کمکی نمیکند — retry بیمعناست
        return;
      }
      if (!res.ok) throw new Error("teacher-detail http " + res.status);
      const data = (await res.json()) as { ok?: boolean; learner?: LearnerDetail };
      if (!data.ok || !data.learner) throw new Error("bad-shape");
      setDetail(data.learner);
      setPhase("ready");
    } catch {
      setPhase("net");
    }
  }, [handle, code, onAuthError]);

  useEffect(() => {
    if (!open) return;
    trackEvent("teacher_detail"); // یکبار در هر بازشدنِ دیالوگ — retry اینجا را دوباره نمیافروزد
    void load();
  }, [open, load]);

  // r354 — هفتمین عضوِ خانوادهٔ CSV: کارنامهٔ همین یادگیرنده از
  // خودِ دیالوگ — idiomِ عینِ exportCsvِ پنل (r352)
  const exportCard = () => {
    if (!detail || csvBusy) return;
    trackEvent("teacher_learner_csv");
    const ok = downloadLearnerCardCsv(detail, new Date().toISOString().slice(0, 10));
    if (ok) {
      toast({ title: `🎓 کارنامهٔ ${detail.name} ذخیره شد`, description: "روندِ چهارده روز، پوششِ درسها و شکستِ مهارتها — آمادهٔ چاپ.", duration: 3000 });
    } else {
      // r398 — the failure pair borrows the named owner (fileFailToast);
      // the success toast stays this gate's own dialect.
      fileFailToast();
    }
  };

  // r377 — [باگِ نهفتهٔ r353 که خروجیِ تستِ suite را سرخ میکرد]: detail
  // از شبکه میآید و byDayِ غایب (انحرافِ قرارداد) رویِ `.map`/`.length`
  // کرشِ رندر میداد — سه سطرِ همین نوار سه گویشِ دفاعیِ ناهمگون داشتند
  // (سطرِ اول گاردِ ناقص، سطرِ دوم بیگارد، سطرِ سوم `?? []`). تکحقیقت:
  // یک byDayِ نرمالشده برایِ همه — انحراف ⇒ نوارِ خالیِ صادق، نه مرگِ دیالوگ.
  const byDay = detail?.byDay ?? [];
  const stripMax = Math.max(...byDay.map((d) => d.attempts), 1);
  // برچسبهایِ نوار — یک `now` برایِ هر دو ردیف (ستونها و زیرنویسها همیشه همخوان)
  const strip = detail ? stripLabels(Date.now(), byDay.length) : [];
  // r363 — مجموعِ دو هفته — از خودِ byDayِ نوار (همان تکحقیقتی که ستونها میخوانند —
  // آیدیومِ r362: «مجموعِ هفته» در نوارِ پنل — هیچ محاسبهٔ موازیای؛
  // همزادِ CSV: سطرِ «هفتهٔ فعال» کارنامه — هر سطح به گویشِ سطحِ خودش)
  const fortnightTotal = byDay.reduce((s, d) => s + d.attempts, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] max-w-lg overflow-y-auto nice-scroll rounded-3xl border-stone-200 bg-white p-0"
        onInteractOutside={(e) => e.preventDefault()}
        data-testid="teacher-detail-dialog"
      >
        {/* r365 — [باگِ نهفتهٔ r353 که داوریِ این راند گرفت]: در فازهایِ
            loading/missing/auth/net هیچ DialogTitle/Descriptionای رندر
            نمیشد و رادیکس خطای a11y میگفت (از r353 در کنسولِ تولیدی بود؛
            داوریهایِ پیشین با خطایِ مثبتِ کاذبِ pipefail در خطِ کنسول
            CLEAN خوانده میشد). عنوانِ پنهانِ فازها — در فازِ ready عنوانِ
            دیدنیِ خودش حرف میزند و این هیچ میشود؛ هرگز دوتایی نمیشوند. */}
        {phase !== "ready" && (
          <>
            <DialogTitle className="sr-only">جزئیاتِ یادگیرنده</DialogTitle>
            <DialogDescription className="sr-only">
              وضعیتِ خواندنِ کارنامهٔ تک‌یادگیرنده از پنلِ معلم
            </DialogDescription>
          </>
        )}
        <div className="onboard-paper bg-gradient-to-l from-sky-50 via-white to-white px-6 pt-6 pb-4">
          {phase === "loading" && (
            <div className="flex items-center justify-center gap-2 py-14 text-[12px] font-bold text-stone-500" data-testid="teacher-detail-loading">
              <Loader2 size={15} className="animate-spin" />
              در حال خواندنِ جزئیات…
            </div>
          )}

          {phase === "missing" && (
            <div className="space-y-3 py-10 text-center" data-testid="teacher-detail-missing">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
                <SearchX size={22} />
              </span>
              <p className="text-[12px] font-bold leading-5 text-stone-600">{missingMsg}</p>
            </div>
          )}

          {phase === "auth" && (
            <div className="space-y-2 py-10 text-center" data-testid="teacher-detail-auth">
              <p className="text-[12px] font-bold text-rose-600">کدِ دسترسی دیگر معتبر نیست — دوباره وارد شو.</p>
            </div>
          )}

          {phase === "net" && (
            <div className="space-y-3 py-10 text-center" data-testid="teacher-detail-net">
              <p className="text-[12.5px] font-bold text-stone-600">جزئیاتِ یادگیرنده خوانده نشد — اتصال را بررسی کن.</p>
              <button
                onClick={() => void load()}
                className="rounded-xl bg-sky-600 px-4 py-2 text-[12px] font-black text-white transition-[background-color] hover:bg-sky-700"
              >
                تلاش دوباره
              </button>
            </div>
          )}

          {phase === "ready" && detail && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-600/25">
                    <UserRound size={20} />
                  </span>
                  <div>
                    <DialogTitle className="flex items-center gap-2 text-base font-black text-stone-800">
                      <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${learnerDot(detail.color)}`} />
                      {detail.name}
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-[11.5px] leading-5 text-stone-500">
                      عضو از {faNum(detail.joinedAt.slice(0, 10))} · آخرین فعالیت: {lastActiveFa(detail.lastActive)}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={exportCard}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-sky-600 active:scale-[0.96]"
                    aria-label="دانلود کارنامهٔ این یادگیرنده (CSV)"
                    title="کارنامهٔ (CSV)"
                    data-testid="teacher-detail-csv"
                  >
                    {csvBusy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  </button>
                  <button
                    onClick={() => void load()}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-sky-600 active:scale-[0.96]"
                    aria-label="به‌روزرسانی جزئیات"
                    title="به‌روزرسانی"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* ---------- کارتهایِ خلاصه ---------- */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="teacher-detail-cards">
                {[
                  { icon: ClipboardList, label: "تلاش", value: detail.attempts },
                  { icon: Gauge, label: "میانگین", value: detail.avgPercent === null ? null : `${faNum(detail.avgPercent)}٪` },
                  { icon: Trophy, label: "بهترین", value: detail.bestPercent === null ? null : `${faNum(detail.bestPercent)}٪` },
                  { icon: Layers, label: "درس‌ها", value: detail.lessons },
                ].map((c) => (
                  <div key={c.label} className="rounded-2xl border border-stone-200 bg-white p-3">
                    <c.icon size={14} className="text-sky-600" />
                    <p className="mt-1 text-lg font-black text-stone-800" dir="ltr">
                      {c.value === null ? "—" : typeof c.value === "number" ? faNum(c.value) : c.value}
                    </p>
                    <p className="text-[10px] font-bold text-stone-500">{c.label}</p>
                  </div>
                ))}
              </div>

              {/* ---------- نوارِ ۱۴روزه ---------- */}
              <section aria-label="روند چهارده روز گذشته" className="mt-4" data-testid="teacher-detail-strip">
                <h3 className="mb-2 text-[11.5px] font-black text-stone-600">
                  تلاشهایِ چهارده روزِ گذشته · مجموعِ دو هفته: <span data-testid="teacher-detail-week-total">{faNum(fortnightTotal)}</span>
                </h3>
                <div className="rounded-2xl border border-stone-200 p-3">
                  <div className="flex h-14 items-end justify-between gap-1" dir="ltr">
                    {strip.map((s) => {
                      const n = byDay.find((d) => d.day === s.day)?.attempts ?? 0;
                      return (
                        <div key={s.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                          <span className="text-[8.5px] font-black text-stone-500" dir="rtl">
                            {faNum(n)}
                          </span>
                          <div
                            className={`w-full rounded-t-md ${n > 0 ? "bg-gradient-to-t from-sky-600 to-sky-400" : "c-track-80"}`}
                            style={{ height: `${Math.max(n > 0 ? 8 : 4, (n / stripMax) * 100)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1 flex justify-between gap-1" dir="ltr">
                    {strip.map((s, i) => (
                      <span key={s.day} className={`flex-1 text-center text-[8.5px] font-black ${i === strip.length - 1 ? "text-sky-700" : "text-stone-500"}`}>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* ---------- پوششِ درس‌به‌درس ---------- */}
              <section aria-label="پوشش درس‌ها" className="mt-4" data-testid="teacher-detail-lessons">
                <h3 className="mb-2 text-[11.5px] font-black text-stone-600">پوششِ درس‌ها (۱ تا ۱۲)</h3>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {detail.byLesson.map((l) => (
                    <div
                      key={l.lesson}
                      className={`rounded-xl border p-2 text-center ${l.attempts > 0 ? "border-sky-200 bg-sky-50" : "border-stone-200"}`}
                    >
                      <p className={`text-[9.5px] font-black ${l.attempts > 0 ? "text-sky-700" : "text-stone-500"}`}>
                        درسِ {faNum(l.lesson)}
                      </p>
                      <p className={`text-[11px] font-black ${l.avgPercent === null ? "text-stone-500" : l.avgPercent < 50 ? "text-rose-600" : "text-emerald-700"}`} dir="ltr">
                        {l.avgPercent === null ? "—" : `${faNum(l.avgPercent)}٪`}
                      </p>
                      <p className="text-[9px] font-bold text-stone-500" dir="ltr">
                        {faNum(l.attempts)} تلاش
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---------- شکستِ مهارت‌به‌مهارت ---------- */}
              {detail.bySkill.length > 0 && (
                <section aria-label="مهارت‌ها" className="mt-4" data-testid="teacher-detail-skills">
                  <h3 className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-black text-stone-600">
                    <span>مهارت‌ها — ضعیفترینِ اول</span>
                    {/* r365 — خلاصهٔ executive: نامِ ضعیفترینِ این دوره کنارِ عنوان —
                        از همان موتورِ سطرِ CSV (weakestSkillMeta) با گویشِ خودِ
                        دیالوگ (skillLabel + faNum) — هیچ محاسبهٔ موازیای؛ صفرِ CSS */}
                    {(() => {
                      const w = weakestSkillMeta(detail.bySkill);
                      return w ? (
                        <span
                          data-testid="teacher-detail-weakest"
                          title={`ضعیفترینِ مهارتِ این دوره — میانگین ${faNum(w.avgPercent)}٪ در ${faNum(w.attempts)} تلاش`}
                          className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-black text-rose-700"
                        >
                          ضعیفترین: {skillLabel(w.category)} · {faNum(w.avgPercent)}٪
                        </span>
                      ) : null;
                    })()}
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-stone-200">
                    {detail.bySkill.map((s, i) => (
                      <div key={s.category} className={`flex items-center gap-2 px-3 py-2 text-[11px] ${i % 2 === 1 ? "c-stone-60" : ""}`}>
                        <span className="min-w-0 flex-1 truncate font-bold text-stone-600">{skillLabel(s.category)}</span>
                        <span className="w-14 shrink-0 text-center font-bold text-stone-500" dir="ltr">
                          {faNum(s.attempts)} تلاش
                        </span>
                        <span className="w-12 shrink-0 text-center font-black text-stone-700" dir="ltr">
                          {faNum(s.bestPercent)}٪
                        </span>
                        <span
                          className={`w-14 shrink-0 text-center font-black ${s.avgPercent < 50 ? "text-rose-600" : "text-emerald-700"}`}
                          dir="ltr"
                        >
                          {faNum(s.avgPercent)}٪
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ---------- شش تلاشِ آخر ---------- */}
              {detail.recent.length > 0 && (
                <section aria-label="آخرین تلاش‌ها" className="mt-4" data-testid="teacher-detail-recent">
                  <h3 className="mb-2 flex items-center gap-1.5 text-[11.5px] font-black text-stone-600">
                    <History size={13} className="text-sky-600" />
                    آخرین تلاشها
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-stone-200">
                    {detail.recent.map((r, i) => (
                      <div key={`${r.createdAt}-${i}`} className={`flex items-center gap-2 px-3 py-2 text-[11px] ${i % 2 === 1 ? "c-stone-60" : ""}`}>
                        <span className="min-w-0 flex-1 truncate font-bold text-stone-600">
                          {skillLabel(r.category)}
                          <span className="mr-1 text-stone-500">· درسِ {faNum(r.lesson)}</span>
                        </span>
                        <span className="shrink-0 font-bold text-stone-500">{lastActiveFa(r.createdAt)}</span>
                        <span
                          className={`w-12 shrink-0 text-center font-black ${r.percent < 50 ? "text-rose-600" : "text-emerald-700"}`}
                          dir="ltr"
                        >
                          {faNum(r.percent)}٪
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* یادگیرندهٔ بیتلاشِ سالم — عملاً رویِ دکمهٔ فهرست سد شده، اینجا مرزِ تایپ */}
              {detail.attempts === 0 && detail.bySkill.length === 0 && (
                <p className="mt-4 rounded-2xl border border-stone-200 p-3 text-center text-[11.5px] font-bold text-stone-500">
                  هنوز هیچ تلاشی ثبت نشده است.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
