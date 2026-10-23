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

import { useCallback, useEffect, useRef, useState } from "react";
import { School, Loader2, RefreshCw, Download, Users, ClipboardList, Gauge, Activity, KeyRound, ShieldAlert } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import { COVERAGE_SKILLS } from "@/lib/coverage-map";
import { lastActiveFa, type TeacherReport, type RosterRow } from "@/lib/teacher-report";
import { downloadClassCsv } from "@/lib/teacher-csv";
import { useToast } from "@/hooks/use-toast";

const CODE_KEY = "vision2-teacher-code";

const DOT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  teal: "bg-teal-500",
  orange: "bg-orange-500",
};

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

const colorDot = (c: string): string => DOT_COLORS[c] ?? "bg-stone-500";

export default function TeacherView() {
  const setView = useStudy((s) => s.setView);
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("gate");
  const [code, setCode] = useState("");
  const [report, setReport] = useState<TeacherReport | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
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
  const { summary, roster } = report;
  const strip = dayLabels(Date.now());
  const stripMax = Math.max(...summary.byDay.map((d) => d.attempts), 1);
  const stripMap = new Map(summary.byDay.map((d) => [d.day, d.attempts]));

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
        <h2 className="mb-2 text-[11.5px] font-black text-stone-600">تلاشهایِ هفت روزِ گذشته</h2>
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
        <h2 className="mb-2 text-[11.5px] font-black text-stone-600">
          یادگیرندگان ({faNum(roster.length)}) — بهترتیبِ فعالتترین
        </h2>
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
            {roster.map((r: RosterRow, i: number) => (
              <div
                key={`${r.name}-${i}`}
                data-testid="teacher-row"
                className={`flex items-center gap-2 px-3 py-2 ${i % 2 === 1 ? "c-stone-60" : ""}`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${colorDot(r.color)}`} />
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
