"use client";

// ------------------------------------------------------------------
// r352 — «پنلِ معلم» — فهرستِ کلاس (گامِ نخستِ teacher panel). نمایِ
// چهاردهم، read-only، با گیتِ کد: مسیر /api/teacher/report فقط وقتی
// زنده است که TEACHER_ACCESS_CODE روی سرور ست باشد؛ کد در
// sessionStorage میماند (تبِ معلم — نه حافظهٔ دائم دستگاه یادگیرنده).
//
// صداقت‌ها: یادگیرندهٔ بیتلاش «—» دارد نه صفر؛ روزهایِ بیرویداد صفرِ
// واقعی؛ سرورِ بی‌کد صفحهٔ صادقِ «فعال نیست» میدهد (بیخود retry
// نمیکند — retry کمکی نمیکند، همان تفاوتِ صادقِ r348)؛ کدِ اشتباه
// retry میدهد (اشتباهِ تایپ قابلِ جبران است). dark: کرنلِ سراسری.
// ------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { School, Loader2, RefreshCw, Download, Users, ClipboardList, Gauge, Activity, KeyRound, ShieldAlert, ChevronLeft, NotebookText } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import { COVERAGE_SKILLS } from "@/lib/coverage-map";
import { lastActiveFa, sortRosterBy, ROSTER_SORT_LABELS, type TeacherReport, type RosterRow, type RosterSortKey, type LearnerDetail } from "@/lib/teacher-report";
import { downloadClassCsv } from "@/lib/teacher-csv";
import { downloadClassLedgerCsv, LEDGER_RATE_WINDOW_MAX, LEDGER_RATE_WAITS } from "@/lib/teacher-class-ledger";
import TeacherDetailDialog, { learnerDot } from "./teacher-detail";
import { useToast } from "@/hooks/use-toast";

const CODE_KEY = "vision2-teacher-code";

const skillLabel = (key: string): string =>
  COVERAGE_SKILLS.find((s) => s.key === key)?.label ?? key;

type Phase = "gate" | "checking" | "ready" | "disabled" | "auth" | "net";

function dayLabels(now: number): { day: string; label: string }[] {
  const out: { day: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ day: d, label: i === 0 ? "امروز" : i === 1 ? "دیروز" : faNum(Number(d.slice(8, 10))) });
  }
  return out;
}

export default function TeacherView() {
  const setView = useStudy((s) => s.setView);
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("gate");
  const [code, setCode] = useState("");
  const [report, setReport] = useState<TeacherReport | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
  // r357 — دفترِ کامل: حینِ واکشِ پیاپیِ کارنامهها دکمه قفل است
  const [ledgerBusy, setLedgerBusy] = useState(false);
  // r353 — مرتبسازیِ دستیِ فهرست + دیالوگِ جزئیاتِ یادگیرنده
  const [sortBy, setSortBy] = useState<RosterSortKey>("attempts");
  const [detailHandle, setDetailHandle] = useState<string | null>(null);
  const openedAt = useRef(Date.now());

  const load = useCallback(async (presented: string) => {
    if (!presented) return;
    setPhase("checking");
    try {
      const res = await fetch("/api/teacher/report", { cache: "no-store", headers: { "x-teacher-code": presented } });
      if (res.status === 404) {
        setPhase("disabled"); // سرور پنل را باز نکرده — retry بیمعناست
        return;
      }
      // ۴۰۳ = قراردادِ خانه برای unauthorized؛ ۴۰۱ هم پوشانده میشود (دفاعی)
      if (res.status === 403 || res.status === 401) {
        sessionStorage.removeItem(CODE_KEY); // کدِ کهنه بیاعتبار — از نو بپرس
        setPhase("auth");
        return;
      }
      if (!res.ok) throw new Error("teacher http " + res.status);
      const data = (await res.json()) as TeacherReport & { ok?: boolean };
      if (!data.ok || !data.roster || !data.summary) throw new Error("bad-shape");
      sessionStorage.setItem(CODE_KEY, presented);
      setReport({ generatedAt: data.generatedAt, summary: data.summary, roster: data.roster });
      setPhase("ready");
    } catch {
      setPhase("net");
    }
  }, []);

  useEffect(() => {
    trackEvent("teacher_open"); // یکبار در سوارشدنِ نما — خودِ گیت هم رویداد است
    openedAt.current = Date.now();
    const stored = sessionStorage.getItem(CODE_KEY);
    if (stored) void load(stored);
  }, [load]);

  // r353 — کدِ منقضی در دیالوگِ جزئیات ⇒ گیتِ از نو (هویتِ پایدار برای
  // وابستگیهایِ دیالوگ — otherwise every render would re-arm its effect)
  const handleDetailAuthError = useCallback(() => {
    sessionStorage.removeItem(CODE_KEY);
    setPhase("auth");
  }, []);

  // r353 — همهٔ هوکها پیشِ early-returnها (قانونِ هوکها): ترتیبِ نهاییِ
  // فهرست دستِ معلم است؛ سرور فقط پیشفرضِ قطعی میدهد
  const roster = report?.roster ?? [];
  const sortedRoster = useMemo(() => sortRosterBy(roster, sortBy), [roster, sortBy]);

  const exportCsv = () => {
    if (!report || csvBusy) return;
    trackEvent("teacher_csv");
    const ok = downloadClassCsv(report.roster, new Date().toISOString().slice(0, 10));
    toast(
      ok
        ? { title: "🎓 روزنامهٔ کلاس ذخیره شد", description: "هر سطر = یک یادگیرنده — آمادهٔ فیلتر در اکسل.", duration: 3000 }
        : { title: "خطا در ساخت فایل", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
    );
  };

  // ---------------- r357 — «دفترِ کلاسِ کامل» ----------------
  // پیوندِ روزنامه و کارنامه: برای هر ردیفِ دارایِ تلاش، جزئیات به
  // ترتیبِ فهرستِ سرور (ترتیبِ آرشیو — نه مرتبسازیِ لحظهایِ نما)
  // پیاپی واکشی میشود (متوالی — به احترامِ سقفِ نرخِ مسیرِ جزئیات).
  // دوپا/دوقضاوت (r341/r343): شکستِ خواندنِ یک کارنامه ⇒ هیچ پرونده‌ای
  // نمیسازد (دفترِ نصفه = آرشیوِ دروغگو) ≠ شکستِ ساخت/دانلود ⇒
  // توستِ خودش. کدِ منقضی در میانهٔ راه ⇒ گیتِ از نو (همان idiomِ
  // دیالوگِ r353 — کدِ مرده هیچ کاری دیگر نمی‌تواند بکند).
  //
  // r373 — «دفترِ کلاسهایِ بزرگ»: ۴۲۹ پایانِ سفر نیست — سرورِ صادق
  // در Retry-After میگوید چند ثانیه؛ حلقه همان‌قدر مکث میکند و همان
  // ردیف را دوباره میخواهد (هیچ پیشرویی بدونِ کارنامه — هیچskipِ
  // خاموشی). تا LEDGER_RATE_WAITS مکث در یک دانلود، بعدش انصرافِ صادق؛
  // و کلاسِ بزرگتر از LEDGER_RATE_WINDOW_MAX از قبل میداند سفرش طولانی
  // است. ۴۲۹ جبرانپذیر است و باید حرفش را بزند — نه نقابِ «اتصال».
  const exportLedger = async () => {
    if (!report || ledgerBusy) return;
    trackEvent("teacher_class_csv");
    setLedgerBusy(true);
    try {
      const code = sessionStorage.getItem(CODE_KEY) ?? "";
      const openable = report.roster.filter((r) => r.attempts > 0 && r.handle);
      if (openable.length > LEDGER_RATE_WINDOW_MAX) {
        toast({
          title: "کلاسِ بزرگ — سفرِ دفتر طولانی است",
          description: `کارنامه‌هایِ ${faNum(openable.length)} یادگیرنده با مکث‌هایِ کوتاهِ سرعتی واکشی می‌شوند — چند دقیقه صبر.`,
          duration: 5000,
        });
      }
      const details: LearnerDetail[] = [];
      let rateWaits = 0;
      for (let i = 0; i < openable.length; ) {
        const res = await fetch(`/api/teacher/learner?handle=${encodeURIComponent(openable[i]!.handle ?? "")}`, {
          cache: "no-store",
          headers: { "x-teacher-code": code },
        });
        if (res.status === 403 || res.status === 401) {
          toast({ title: "کدِ دسترسی منقضی شد", description: "برای ادامه، دوباره وارد شو.", duration: 3000 });
          handleDetailAuthError();
          return;
        }
        if (res.status === 429) {
          rateWaits += 1;
          if (rateWaits > LEDGER_RATE_WAITS) {
            toast({
              title: "خواندنِ کارنامه‌ها ناتمام ماند",
              description: "سقفِ سرعت چندبار پر شد — چند دقیقه بعد دوباره تلاش کن؛ دفترِ نصفه ساخته نمی‌شود.",
              duration: 4500,
            });
            return;
          }
          const wait = Math.max(1, Number(res.headers.get("Retry-After")) || 60);
          toast({
            title: "سقفِ سرعت — مکثِ کوتاه",
            description: `کارنامه‌ی ${faNum(details.length)} از ${faNum(openable.length)} خوانده شد؛ ${faNum(wait)} ثانیه صبر می‌کنیم و ادامه میدهیم.`,
            duration: Math.min(wait * 1000 + 1500, 8000),
          });
          await new Promise((ok) => setTimeout(ok, (wait + 1) * 1000));
          continue; // همان ردیف — هیچ پیشرویی بدونِ کارنامه
        }
        if (!res.ok) throw new Error("ledger http " + res.status);
        const data = (await res.json()) as { ok?: boolean; learner?: LearnerDetail };
        if (!data.ok || !data.learner) throw new Error("ledger bad-shape");
        details.push(data.learner);
        i += 1;
      }
      const ok = downloadClassLedgerCsv(
        // r362 — هفتهٔ فعال از خودِ گزارش میآید (summary.byDay — همان تکحقیقتِ نوارِ هفتروزی)
        { generatedAt: report.generatedAt, byDay: report.summary.byDay, roster: report.roster, details },
        new Date().toISOString().slice(0, 10)
      );
      toast(
        ok
          ? { title: "🎓 دفترِ کاملِ کلاس ذخیره شد", description: `${faNum(details.length)} کارنامه در ادامهٔ روزنامهٔ کلاس — آرشیوِ یکپارچه.`, duration: 3000 }
          : { title: "خطا در ساخت فایل", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
      );
    } catch {
      // [r373] املا یکدست شد: «کارنامه‌ها»/«نمی‌شود» با نیمفاصله — هم‌ریج با شاخهٔ ۴۲۹ (خطِ ۱۵۸)
      toast({ title: "خواندنِ کارنامه‌ها ناتمام ماند", description: "دفترِ نصفه ساخته نمی‌شود — اتصال را بررسی کن و دوباره تلاش کن.", duration: 3500 });
    } finally {
      setLedgerBusy(false);
    }
  };

  // ---------------- گیت: درخواستِ کد ----------------
  if (phase === "gate" || phase === "checking" || phase === "auth") {
    return (
      <div className="mx-auto max-w-sm space-y-4 pt-10 text-center" data-testid="teacher-gate">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-600/25">
          <School size={26} />
        </span>
        <div>
          <h1 className="text-lg font-black text-stone-800">پنلِ معلم</h1>
          <p className="mt-1 text-[12px] leading-5 text-stone-500">
            فهرستِ کلاس و پیشرفتِ همهٔ یادگیرندگانِ این سرور — فقط با کدِ دسترسیِ معلم.
          </p>
        </div>
        <form
          className="space-y-2.5 rounded-2xl border border-stone-200 bg-white p-4 text-right"
          onSubmit={(e) => {
            e.preventDefault();
            void load(code.trim());
          }}
        >
          <label htmlFor="teacher-code" className="flex items-center gap-1.5 text-[11.5px] font-bold text-stone-600">
            <KeyRound size={13} className="text-sky-600" />
            کدِ دسترسی
          </label>
          <input
            id="teacher-code"
            type="password"
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            className="h-10 w-full rounded-xl border border-stone-200 px-3 text-left text-[13px] font-bold tracking-wider text-stone-700 outline-none transition-[border-color,box-shadow] focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="••••••••"
            data-testid="teacher-code-input"
          />
          {phase === "auth" && (
            <p className="text-[11px] font-bold text-rose-600" data-testid="teacher-auth-error">
              کدِ دسترسی نادرست است — دوباره تلاش کن.
            </p>
          )}
          <button
            type="submit"
            disabled={phase === "checking" || code.trim().length === 0}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-[12.5px] font-black text-white shadow-sm transition-[background-color,transform] hover:bg-sky-700 active:scale-[0.96] disabled:opacity-50"
          >
            {phase === "checking" ? <Loader2 size={15} className="animate-spin" /> : <School size={15} />}
            گشودنِ پنل
          </button>
        </form>
        <button
          onClick={() => setView({ type: "home" })}
          className="text-[11px] font-bold text-stone-500 transition-[color] hover:text-sky-600"
        >
          بازگشت به خانه
        </button>
      </div>
    );
  }

  // ---------------- سرورِ بی‌کد: صفحهٔ صادقِ «فعال نیست» ----------------
  if (phase === "disabled") {
    return (
      <div className="mx-auto max-w-sm space-y-3 pt-10 text-center" data-testid="teacher-disabled">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
          <ShieldAlert size={26} />
        </span>
        <h1 className="text-base font-black text-stone-800">پنلِ معلم فعال نیست</h1>
        <p className="text-[12px] leading-5 text-stone-500">
          این سرور هنوز کدِ دسترسیِ معلم را تنظیم نکرده است — با اپراتورِ وب‌کتاب تماس بگیر.
        </p>
        <button
          onClick={() => setView({ type: "home" })}
          className="text-[11px] font-bold text-stone-500 transition-[color] hover:text-sky-600"
        >
          بازگشت به خانه
        </button>
      </div>
    );
  }

  if (phase === "net") {
    return (
      <div className="mx-auto max-w-sm space-y-3 pt-10 text-center" data-testid="teacher-net-error">
        <p className="text-[12.5px] font-bold text-stone-600">گزارشِ کلاس خوانده نشد — اتصال را بررسی کن.</p>
        <button
          onClick={() => void load(sessionStorage.getItem(CODE_KEY) ?? code.trim())}
          className="rounded-xl bg-sky-600 px-4 py-2 text-[12px] font-black text-white transition-[background-color] hover:bg-sky-700"
        >
          تلاش دوباره
        </button>
      </div>
    );
  }

  // دفاعی: در «ready» گزارش هست — این شاخه هرگز نباید رخ دهد ولی مرزِ تایپ را میبندد
  if (!report) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-[12px] font-bold text-stone-500">
        <Loader2 size={15} className="animate-spin" />
        در حال خواندنِ گزارشِ کلاس…
      </div>
    );
  }

  // ---------------- پنلِ زنده ----------------
  const { summary } = report;
  const strip = dayLabels(Date.now());
  const stripMax = Math.max(...summary.byDay.map((d) => d.attempts), 1);
  const stripMap = new Map(summary.byDay.map((d) => [d.day, d.attempts]));
  // r362 — مجموعِ هفتهٔ فعال — همان تجمیعی که سربرگِ دفترِ کامل چاپ میکند؛
  // از خودِ نوار میخواند (summary.byDay) — نه محاسبهٔ موازی و نه فیلدِ سرورِ نو
  const weekTotal = summary.byDay.reduce((s, d) => s + d.attempts, 0);

  const cards = [
    { icon: Users, label: "یادگیرنده", value: summary.learners },
    { icon: ClipboardList, label: "تلاشِ ثبت‌شده", value: summary.attempts },
    { icon: Gauge, label: "میانگینِ کلاس", value: summary.avgPercent === null ? null : `${faNum(summary.avgPercent)}٪` },
    { icon: Activity, label: "فعال در ۲۴ ساعت", value: summary.last24h },
  ];

  return (
    <div className="space-y-5" data-testid="teacher-ready">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-600/25">
            <School size={20} />
          </span>
          <div>
            <h1 className="text-base font-black text-stone-800">پنلِ معلم</h1>
            <p className="text-[11px] leading-4 text-stone-500">
              فهرستِ کلاسِ این سرور — خواندنی، نه دستکاریشدنی. آخرین به‌روزرسانی: {faNum(report.generatedAt.slice(11, 16))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => void exportLedger()}
            disabled={ledgerBusy}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-sky-600 active:scale-[0.96] disabled:opacity-50"
            aria-label="دانلود دفترِ کاملِ کلاس (CSV)"
            title="دفترِ کاملِ کلاس (CSV) — روزنامه + کارنامهٔ همه"
            data-testid="teacher-ledger"
          >
            {ledgerBusy ? <Loader2 size={15} className="animate-spin" /> : <NotebookText size={15} />}
          </button>
          <button
            onClick={exportCsv}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-sky-600 active:scale-[0.96]"
            aria-label="دانلود روزنامهٔ کلاس (CSV)"
            title="روزنامهٔ کلاس (CSV)"
          >
            {csvBusy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          </button>
          <button
            onClick={() => void load(sessionStorage.getItem(CODE_KEY) ?? "")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-sky-600 active:scale-[0.96]"
            aria-label="به‌روزرسانی گزارش"
            title="به‌روزرسانی"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ---------- کارتهایِ کلاس ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="teacher-cards">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-stone-200 bg-white p-4">
            <c.icon size={15} className="text-sky-600" />
            <p className="mt-1.5 text-xl font-black text-stone-800" dir="ltr">
              {c.value === null ? "—" : typeof c.value === "number" ? faNum(c.value) : c.value}
            </p>
            <p className="text-[10.5px] font-bold text-stone-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ---------- نوارِ هفتروزهٔ تلاشها ---------- */}
      <section aria-label="تلاشهای هفت روز گذشته" data-testid="teacher-strip">
        <h2 className="mb-2 text-[11.5px] font-black text-stone-600">
          تلاشهایِ هفت روزِ گذشته · مجموعِ هفته: <span data-testid="teacher-week-total">{faNum(weekTotal)}</span>
        </h2>
        <div className="rounded-2xl border border-stone-200 p-4">
          <div className="flex h-16 items-end justify-between gap-1.5" dir="ltr">
            {strip.map((s) => {
              const n = stripMap.get(s.day) ?? 0;
              return (
                <div key={s.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[9px] font-black text-stone-500" dir="rtl">
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
          <div className="mt-1.5 flex justify-between gap-1.5" dir="ltr">
            {strip.map((s) => (
              <span key={s.day} className={`flex-1 text-center text-[9px] font-black ${s.label === "امروز" ? "text-sky-700" : "text-stone-500"}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- فهرستِ کلاس ---------- */}
      <section aria-label="فهرست یادگیرندگان" data-testid="teacher-roster">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11.5px] font-black text-stone-600">یادگیرندگان ({faNum(roster.length)})</h2>
          {/* r353 — مرتبسازیِ دستیِ معلم — چهار کلیدِ قطعی، پیشفرض = ترتیبِ سرور */}
          <div className="flex items-center gap-1" role="group" aria-label="مرتبسازیِ فهرست" data-testid="teacher-sort">
            {(Object.keys(ROSTER_SORT_LABELS) as RosterSortKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSortBy(k)}
                aria-pressed={sortBy === k}
                data-testid={`teacher-sort-${k}`}
                className={
                  sortBy === k
                    ? "rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-black text-white transition-[background-color,transform] active:scale-[0.96]"
                    : "rounded-full border border-stone-200 px-2.5 py-1 text-[10px] font-black text-stone-500 transition-[color,border-color,transform] hover:border-sky-300 hover:text-sky-600 active:scale-[0.96]"
                }
              >
                {ROSTER_SORT_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2 border-b border-stone-200 bg-white px-3 py-2 text-[10px] font-black text-stone-500">
            <span className="min-w-0 flex-1">یادگیرنده</span>
            <span className="w-10 shrink-0 text-center">تلاش</span>
            <span className="w-12 shrink-0 text-center">میانگین</span>
            <span className="w-12 shrink-0 text-center">بهترین</span>
            <span className="hidden w-14 shrink-0 text-center sm:block">درس‌ها</span>
            <span className="hidden w-20 shrink-0 text-center sm:block">آخرین</span>
            <span className="hidden min-w-0 flex-1 sm:block">ضعیف‌ترین مهارت</span>
          </div>
          <div className="max-h-[420px] overflow-y-auto nice-scroll">
            {sortedRoster.map((r: RosterRow, i: number) => {
              // r353 — ردیفِ دارایِ تلاش + handle دری از جزئیات است؛ بیتلاش
              // ردیفِ خواندنی میماند (هیچچیز برای نشان دادن ندارد — همان
              // idiomِ چیپهایِ کشفشدهٔ سفرِ کشف که دکمه نیستند). هاورِ
              // پسزمینه ممنوع: زیرایِ unlayeredِ خانوادهٔ سنگی بر hoverِ
              // layered میچربد — affordance صادق = chevron + title.
              const zebra = i % 2 === 1 ? "c-stone-60" : "";
              const openable = r.attempts > 0 && !!r.handle;
              const body = (
                <>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${learnerDot(r.color)}`} />
                    <span className="truncate text-[11px] font-bold text-stone-600">{r.name}</span>
                  </span>
                  <span className="w-10 shrink-0 text-center text-[11px] font-black text-stone-700" dir="ltr">
                    {faNum(r.attempts)}
                  </span>
                  <span
                    className={`w-12 shrink-0 text-center text-[11px] font-black ${r.avgPercent === null ? "text-stone-500" : r.avgPercent < 50 ? "text-rose-600" : "text-emerald-700"}`}
                    dir="ltr"
                  >
                    {r.avgPercent === null ? "—" : `${faNum(r.avgPercent)}٪`}
                  </span>
                  <span className="w-12 shrink-0 text-center text-[11px] font-bold text-stone-500" dir="ltr">
                    {r.bestPercent === null ? "—" : `${faNum(r.bestPercent)}٪`}
                  </span>
                  <span className="hidden w-14 shrink-0 text-center text-[11px] font-bold text-stone-500 sm:block" dir="ltr">
                    {faNum(r.lessons)}
                  </span>
                  <span className="hidden w-20 shrink-0 truncate text-center text-[10px] font-bold text-stone-500 sm:block">
                    {lastActiveFa(r.lastActive)}
                  </span>
                  <span className="hidden min-w-0 flex-1 truncate text-[10px] font-bold text-stone-500 sm:block">
                    {r.weakest ? `${skillLabel(r.weakest.category)} · ${faNum(r.weakest.avgPercent)}٪` : "—"}
                  </span>
                  {openable && <ChevronLeft size={13} aria-hidden className="hidden shrink-0 text-stone-500 sm:block" />}
                </>
              );
              return openable ? (
                <button
                  key={`${r.name}-${i}`}
                  type="button"
                  data-testid="teacher-row"
                  data-teacher-open="true"
                  title="دیدنِ جزئیاتِ یادگیرنده"
                  onClick={() => setDetailHandle(r.handle ?? null)}
                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-right ${zebra}`}
                >
                  {body}
                </button>
              ) : (
                <div key={`${r.name}-${i}`} data-testid="teacher-row" className={`flex items-center gap-2 px-3 py-2 ${zebra}`}>
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- r353 — دیالوگِ جزئیاتِ یادگیرنده ---------- */}
      <TeacherDetailDialog
        handle={detailHandle ?? ""}
        code={typeof window !== "undefined" ? sessionStorage.getItem(CODE_KEY) ?? "" : ""}
        open={detailHandle !== null}
        onOpenChange={(v) => {
          if (!v) setDetailHandle(null);
        }}
        onAuthError={handleDetailAuthError}
      />
    </div>
  );
}
