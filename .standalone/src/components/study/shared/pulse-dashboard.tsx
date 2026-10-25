"use client";

// r350 — «نبضِ کامل» (the full pulse dashboard) — audit bottleneck ④:
// the F10 pipeline records 45 (day,name) aggregates and GET /api/event
// already served a top-6 glimpse in settings, but no HUMAN surface showed
// the whole picture. This dialog (opened from the settings pulse row)
// closes the gap:
//   • the watchtower — crash-breadcrumb count + the LAST breadcrumb
//     (GET /api/client-error, the r346 dual-path lesson: the standalone
//     server reads its own live log)
//   • the 7-day strip — total activity per day (opt-in ?days=7 series;
//     WITHOUT the param the GET response shape stays byte-identical)
//   • the six families — every whitelisted event grouped by
//     EVENT_CATEGORIES (the single truth in analytics-events.ts),
//     each row with its week + all-time counters
// Honesty rules: zeros are real zeros; a missing family is omitted (not
// faked); errors are visibility (the row hides), never invented numbers;
// pulse_open fires once per open; Persian digits everywhere.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Loader2, RefreshCw, HeartPulse, ShieldAlert, Download, Sparkles, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { faNum } from "@/lib/study-theme";
import { percent } from "@/lib/domain/percent";
import { trackEvent } from "@/lib/analytics";
import { EVENT_CATEGORIES, EVENT_CATEGORY_ORDER } from "@/lib/analytics-events";
import { budgetPercent, budgetTone } from "@/lib/budget-tone";
import { downloadPulseCsv, type PulseLedgerRow } from "@/lib/pulse-csv";
import { fileFailToast } from "@/lib/file-download";

interface PulseEvent {
  name: string;
  label: string;
  total: number;
  week: number;
}
interface SeriesRow {
  day: string;
  name: string;
  count: number;
}
interface Watchtower {
  count: number;
  last?: { at: string; kind: string; message: string; view?: string };
}

const KIND_LABELS: Record<string, string> = {
  boundary: "مرزِ خطا",
  error: "خطایِ window",
  rejection: "وعدهٔ ناکام",
  unknown: "نامشخص",
};

// r355 — خانوادهٔ میزبانِ هشدارِ بودجه، از نگاشتِ تکحقیقت مشتق میشود:
// خانوادهای که «explain_generated» را مالک است (اگر رجیستری نامِ
// خانواده را عوض کند، نوار هم دنبالش میرود؛ اگر کلید حذف شود، tsc
// نمیگذارد — رانشِ بدونِ کامپایل ناممکن است)
const AI_FAMILY = EVENT_CATEGORIES["explain_generated"];

// r358 — نوارِ همزادِ روخوانی، باز از تکحقیقتِ رجیستری مشتق میشود:
// خانوادهای که «tts_spoken» را مالک است (هر دو سرویسِ پولیِ هوش مصنوعی
// همخانواده‌اند — نام عوض شود، نوار دنبالش میرود؛ کلید حذف شود، tsc نمیگذارد)
const TTS_FAMILY = EVENT_CATEGORIES["tts_spoken"];

/** امروز و ۶ روزِ پیشِ آن — برچسبِ فارسیِ هر ستونِ نوارِ هفتروزه */
function dayLabels(days: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    out.push({
      key: d,
      label: i === 0 ? "امروز" : i === 1 ? "دیروز" : faNum(Number(d.slice(8, 10))),
    });
  }
  return out;
}

export default function PulseDashboard({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [series, setSeries] = useState<SeriesRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [wtState, setWtState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [watchtower, setWatchtower] = useState<Watchtower | null>(null);
  // r355 — «هشدارِ بودجه در خانوادهٔ هوش مصنوعی»: مصرفِ واقعیِ توضیحِ
  // هوشمند (همزادِ ردیفِ r348 تنظیمات)، درونِ خانوادهٔ خودش در نبض.
  // خطا ⇒ نوار پنهان (دیدبانی، نه درستکاری — خودِ توضیح به نبض وابسته نیست)
  const [xState, setXState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [xUsage, setXUsage] = useState<{ used: number; cap: number } | null>(null);
  // r358 — «هشدارِ بودجهٔ روخوانی در نبض» (پیشنهادِ ②ِ r357): همزادِ نوارِ
  // r355 — مصرفِ واقعیِ روخوانی (همزادِ ردیفِ r347 تنظیمات)، چهارمین
  // مصرفکنندهٔ موتورِ budget-tone. خطا ⇒ نوار پنهان (دیدبانی، نه درستکاری).
  const [ttsState, setTtsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [ttsUsage, setTtsUsage] = useState<{ used: number; cap: number } | null>(null);

  const load = useCallback(async () => {
    setState((s) => (s === "ready" ? "ready" : "loading"));
    setWtState((s) => (s === "ready" ? "ready" : "loading"));
    try {
      const res = await fetch("/api/event?days=7", { cache: "no-store" });
      if (!res.ok) throw new Error("pulse http " + res.status);
      const data = (await res.json()) as { events?: PulseEvent[]; series?: SeriesRow[]; updatedAt?: string };
      setEvents(data.events ?? []);
      setSeries(data.series ?? []);
      setUpdatedAt(data.updatedAt ?? "");
      setState("ready");
    } catch {
      setState("error");
    }
    try {
      const res = await fetch("/api/client-error", { cache: "no-store" });
      if (!res.ok) throw new Error("watchtower http " + res.status);
      const data = (await res.json()) as Watchtower & { ok?: boolean };
      setWatchtower({ count: data.count ?? 0, last: data.last });
      setWtState("ready");
    } catch {
      setWtState("error");
    }
    try {
      const res = await fetch("/api/explain/usage", { cache: "no-store" });
      if (!res.ok) throw new Error("budget http " + res.status);
      const data = (await res.json()) as { ok?: boolean; used: number; cap: number };
      if (!data.ok) throw new Error("bad-shape");
      setXUsage({ used: data.used, cap: data.cap });
      setXState("ready");
    } catch {
      setXState("error");
    }
    try {
      const res = await fetch("/api/tts/usage", { cache: "no-store" });
      if (!res.ok) throw new Error("tts-budget http " + res.status);
      const data = (await res.json()) as { ok?: boolean; used: number; cap: number };
      if (!data.ok) throw new Error("bad-shape");
      setTtsUsage({ used: data.used, cap: data.cap });
      setTtsState("ready");
    } catch {
      setTtsState("error");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    trackEvent("pulse_open");
    void load();
  }, [open, load]);

  // r360 — «هشدارِ پیشازِسقف» (پیشنهادِ ④ِ r358 — دو راند باز): وقتی
  // نبض باز میشود، مصرفِ واقعیِ هر دو سرویسِ پولی خوانده میشود؛ تنِ
  // «نزدیک» (از موتورِ تکحقیقت — بدونِ لیترالِ آستانه) رویدادِ window
  // میفرستد و pwa-layer روزیِ یک‌بار به ازایِ هر سرویس توست میدهد.
  // سقفِ بسته (۱۰۰٪) اینجا هشدار نمیدهد — آن لحظه مالِ خانوادهٔ توست
  // هایِ بستهٔ r347/r348 است (دوتاییِ صحنه ممنوع — درسِ TOAST_LIMIT).
  // خواندنِ ناموفق (state=error) رویدادی نمیفرستد — هشدارِ جعلی ممنوع.
  useEffect(() => {
    if (ttsState === "ready" && ttsUsage) {
      const pct = budgetPercent(ttsUsage.used, ttsUsage.cap);
      if (budgetTone(pct) === "near" && pct < 100)
        window.dispatchEvent(
          new CustomEvent("budget-near", { detail: { service: "tts", pct } })
        );
    }
    if (xState === "ready" && xUsage) {
      const pct = budgetPercent(xUsage.used, xUsage.cap);
      if (budgetTone(pct) === "near" && pct < 100)
        window.dispatchEvent(
          new CustomEvent("budget-near", { detail: { service: "explain", pct } })
        );
    }
  }, [ttsState, ttsUsage, xState, xUsage]);

  // r351 — «دفترِ سی‌روزهٔ نبض»: خروجیِ CSVِ خانواده، از سریِ (روز ×
  // رویداد × تعداد) با days=30 — غنیتر از نوارِ ۷روزهٔ دیالوگ. دو پا،
  // دو قضاوت (قاعدهٔ r341/r343): نخواندنِ دفتر با شکستِ ساختِ فایل
  // همسرنوشت نیستند. قصدِ خروجی قبل از تلاش ثبت میشود (idiomِ coverage_csv).
  const [csvState, setCsvState] = useState<"idle" | "loading">("idle");
  const exportLedger = async () => {
    if (csvState === "loading") return;
    trackEvent("pulse_csv");
    setCsvState("loading");
    try {
      const res = await fetch("/api/event?days=30", { cache: "no-store" });
      if (!res.ok) throw new Error("ledger http " + res.status);
      const data = (await res.json()) as { series?: PulseLedgerRow[] };
      const ok = downloadPulseCsv(data.series ?? [], new Date().toISOString().slice(0, 10));
      if (ok) {
      toast({ title: "📊 دفترِ سی‌روزهٔ نبض ذخیره شد", description: "هر سطر = یک روز × یک رویداد — آمادهٔ فیلتر در اکسل.", duration: 3000 });
    } else {
      // r398 — the failure pair borrows the named owner (fileFailToast);
      // the success toast stays this gate's own dialect.
      fileFailToast();
    }
    } catch {
      toast({ title: "دفترِ رویدادها خوانده نشد", description: "اتصال را بررسی کن و دوباره تلاش کن.", duration: 3000 });
    } finally {
      setCsvState("idle");
    }
  };

  // نوارِ هفتروزه — جمعِ همهٔ رویدادها بهازایِ هر روز (زیروها واقعیاند)
  const dailyTotals = useMemo(() => {
    const labels = dayLabels(7);
    const byDay = new Map<string, number>();
    for (const r of series) byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.count);
    const values = labels.map((l) => ({ ...l, count: byDay.get(l.key) ?? 0 }));
    const max = Math.max(...values.map((v) => v.count), 1);
    return { values, max };
  }, [series]);

  // خانوادهها — وارونهسازیِ نگاشتِ تکحقیقتِ EVENT_CATEGORIES؛ فقط
  // خانوادههایِ دارایِ ردیف، درونِ هر خانواده با بیشینهٔ کل
  const grouped = useMemo(() => {
    const inverted: Record<string, string[]> = {};
    for (const [name, cat] of Object.entries(EVENT_CATEGORIES)) {
      (inverted[cat] ??= []).push(name);
    }
    return EVENT_CATEGORY_ORDER.map((cat) => ({
      cat,
      rows: events
        .filter((e) => (inverted[cat] ?? []).includes(e.name))
        .sort((a, b) => b.total - a.total),
    })).filter((g) => g.rows.length > 0);
  }, [events]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto nice-scroll rounded-3xl border-stone-200 bg-white p-0" onInteractOutside={(e) => e.preventDefault()}>
        <div className="onboard-paper bg-gradient-to-l from-emerald-50 via-white to-white px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25">
                <Activity size={20} />
              </span>
              <div>
                <DialogTitle className="text-base font-black text-stone-800">نبضِ وب‌کتاب</DialogTitle>
                <DialogDescription className="mt-0.5 text-[11.5px] leading-5 text-stone-500">
                  فعالیتِ بی‌نامِ همهٔ یادگیرندگان — بدونِ هیچ اطلاعات شخصی.
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* r351 — دفترِ سی‌روزه (CSV) — همخانوادهٔ دکمهٔ تازهسازی */}
              <button
                onClick={() => void exportLedger()}
                className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-emerald-600 active:scale-[0.96]"
                aria-label="دانلود دفترِ سی‌روزهٔ رویدادها (CSV)"
                title="دفترِ سی‌روزه (CSV)"
              >
                {csvState === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              </button>
              <button
                onClick={() => void load()}
                className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-emerald-600 active:scale-[0.96]"
                aria-label="به‌روزرسانی نبض"
                title="به‌روزرسانی"
              >
                {state === "loading" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 pb-6">
          {/* ---------- برجِ مراقبت: نان‌های خطا ---------- */}
          <section aria-label="برج مراقبت خطاها" data-testid="pulse-watchtower">
            {wtState === "ready" && watchtower && watchtower.count === 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <HeartPulse size={17} />
                </span>
                <div>
                  <p className="text-[12.5px] font-black text-emerald-800">بدونِ خطایِ ثبت‌شده</p>
                  <p className="text-[10.5px] font-bold text-stone-500">هیچ کرشی از هیچ دستگاهی گزارش نشده است.</p>
                </div>
              </div>
            )}
            {wtState === "ready" && watchtower && watchtower.count > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                    <ShieldAlert size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-black text-amber-800">
                      {faNum(watchtower.count)} نانِ خطا رویِ این سرور
                    </p>
                    {watchtower.last && (
                      <p className="mt-0.5 truncate text-[10.5px] font-bold text-stone-500" title={watchtower.last.message}>
                        آخرین: {KIND_LABELS[watchtower.last.kind] ?? watchtower.last.kind}
                        {watchtower.last.view ? ` · ${watchtower.last.view}` : ""} — {watchtower.last.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {wtState === "loading" && (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 p-4 text-[11px] font-bold text-stone-500">
                <Loader2 size={13} className="animate-spin" />
                در حال خواندنِ برجِ مراقبت…
              </div>
            )}
            {wtState === "error" && (
              <p className="py-2 text-center text-[11px] font-bold text-stone-500">برجِ مراقبت در دسترس نیست.</p>
            )}
          </section>

          {/* ---------- نوارِ هفتروزه ---------- */}
          {state === "ready" && (
            <section aria-label="فعالیت هفت روز گذشته" data-testid="pulse-strip">
              <h3 className="mb-2 text-[11.5px] font-black text-stone-600">هفت روزِ گذشته — همهٔ رویدادها</h3>
              <div className="rounded-2xl border border-stone-200 p-4">
                <div className="flex h-16 items-end justify-between gap-1.5" dir="ltr">
                  {dailyTotals.values.map((v) => (
                    <div key={v.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                      <span className="text-[9px] font-black text-stone-500" dir="rtl">
                        {faNum(v.count)}
                      </span>
                      <div
                        className={`w-full rounded-t-md ${v.count > 0 ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : "c-track-80"}`}
                        style={{ height: `${Math.max(v.count > 0 ? 8 : 4, percent(v.count, dailyTotals.max))}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between gap-1.5" dir="ltr">
                  {dailyTotals.values.map((v) => (
                    <span key={v.key} className={`flex-1 text-center text-[9px] font-black ${v.label === "امروز" ? "text-emerald-700" : "text-stone-500"}`}>
                      {v.label}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ---------- خانوادهها ---------- */}
          {state === "ready" && (
            <section aria-label="رویدادها به تفکیک خانواده" data-testid="pulse-families">
              {events.length === 0 ? (
                <p className="py-4 text-center text-[11.5px] font-bold text-stone-500">
                  هنوز فعالیتی ثبت نشده — اولین نفر باش!
                </p>
              ) : (
                <div className="space-y-4">
                  {grouped.map((g) => (
                    <div key={g.cat}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <h3 className="text-[11.5px] font-black text-stone-600">{g.cat}</h3>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-black text-emerald-800">
                          جمع: {faNum(g.rows.reduce((s, r) => s + r.total, 0))}
                        </span>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-stone-200">
                        {g.rows.map((e, i) => (
                          <div
                            key={e.name}
                            data-testid="pulse-row"
                            data-pulse-name={e.name}
                            className={`flex items-center gap-2 px-3 py-2 ${i % 2 === 1 ? "c-stone-60" : ""}`}
                          >
                            <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-stone-600">{e.label}</span>
                            <span className="shrink-0 text-[10px] font-bold text-stone-500" title="هفتهٔ گذشته">
                              هفته: {faNum(e.week)}
                            </span>
                            <span className="w-12 shrink-0 text-left text-[11px] font-black text-emerald-700" dir="ltr" title="کل">
                              {faNum(e.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* r355 — هشدارِ بودجهٔ توضیحِ هوشمند، سوارِ خانوادهٔ خودش */}
                      {g.cat === AI_FAMILY && xState === "ready" && xUsage && (() => {
                        const pct = budgetPercent(xUsage.used, xUsage.cap);
                        const tone = budgetTone(pct);
                        const near = tone === "near";
                        const warm = tone === "warm";
                        return (
                          <div
                            data-testid="pulse-budget"
                            data-near={near ? "true" : undefined}
                            aria-label="بودجهٔ توضیح هوشمند"
                            className={`mt-1.5 rounded-2xl border p-3 ${
                              near
                                ? "border-rose-200 bg-rose-50/60"
                                : warm
                                  ? "border-amber-200 bg-amber-50/60"
                                  : "border-stone-200 c-stone-60"
                            }`}
                          >
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-stone-600">
                                <Sparkles size={12} className="text-violet-500" />
                                بودجهٔ توضیحِ هوشمندِ همین ماه
                              </span>
                              <span className={`text-[10.5px] font-black ${near ? "text-rose-600" : warm ? "text-amber-600" : "text-emerald-700"}`}>
                                {faNum(pct)}٪
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full c-track-80">
                              {/* بدونِ ترنزیشن — width ویژگیِ layout است (قفلِ scoped-transitions) */}
                              <div
                                className={`h-full rounded-full ${
                                  near
                                    ? "bg-gradient-to-l from-rose-400 to-rose-600"
                                    : warm
                                      ? "bg-gradient-to-l from-amber-400 to-amber-600"
                                      : "bg-gradient-to-l from-violet-400 to-violet-600"
                                }`}
                                style={{ width: `${Math.max(3, pct)}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[9.5px] leading-4 text-stone-500">
                              {faNum(xUsage.used)} پرسش از {faNum(xUsage.cap)} پرسشِ سقفِ ماه — کشِ پرسوالی رایگان است و این سقف هزینهٔ تولید را مهار میکند.
                            </p>
                            {warm && (
                              <p className="mt-0.5 text-[9.5px] font-black text-amber-600">
                                ماه نزدیکِ سقف است — مصرف را دنبال کن.
                              </p>
                            )}
                            {near && (
                              <p className="mt-0.5 text-[9.5px] font-black text-rose-600">
                                {pct >= 100
                                  ? "سقفِ این ماه پر شده — تولیدِ توضیح تا ماهِ بعد بسته است؛ کش و روخوانی کار میکنند."
                                  : "به سقفِ ماه نزدیک شده — تولیدِ توضیح تا پایانِ ماه کار میکند."}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                      {/* r358 — هشدارِ بودجهٔ روخوانی، همزادِ نوارِ توضیحِ هوشمند
                          در همان خانواده (هردو سرویسِ پولیِ هوش مصنوعی)؛ تنِ آرام
                          = زمردی (برندِ روخوانیِ ردیفِ تنظیمات) نه بنفشِ توضیح */}
                      {g.cat === TTS_FAMILY && ttsState === "ready" && ttsUsage && (() => {
                        const pct = budgetPercent(ttsUsage.used, ttsUsage.cap);
                        const tone = budgetTone(pct);
                        const near = tone === "near";
                        const warm = tone === "warm";
                        return (
                          <div
                            data-testid="pulse-tts-budget"
                            data-near={near ? "true" : undefined}
                            aria-label="بودجهٔ روخوانی"
                            className={`mt-1.5 rounded-2xl border p-3 ${
                              near
                                ? "border-rose-200 bg-rose-50/60"
                                : warm
                                  ? "border-amber-200 bg-amber-50/60"
                                  : "border-stone-200 c-stone-60"
                            }`}
                          >
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-stone-600">
                                <Volume2 size={12} className="text-emerald-600" />
                                بودجهٔ روخوانیِ همین ماه
                              </span>
                              <span className={`text-[10.5px] font-black ${near ? "text-rose-600" : warm ? "text-amber-600" : "text-emerald-700"}`}>
                                {faNum(pct)}٪
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full c-track-80">
                              {/* بدونِ ترنزیشن — width ویژگیِ layout است (قفلِ scoped-transitions) */}
                              <div
                                className={`h-full rounded-full ${
                                  near
                                    ? "bg-gradient-to-l from-rose-400 to-rose-600"
                                    : warm
                                      ? "bg-gradient-to-l from-amber-400 to-amber-600"
                                      : "bg-gradient-to-l from-emerald-400 to-emerald-600"
                                }`}
                                style={{ width: `${Math.max(3, pct)}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[9.5px] leading-4 text-stone-500">
                              {faNum(ttsUsage.used)} حرف از {faNum(ttsUsage.cap)} حرفِ سقفِ ماه — کشِ روخوانی رایگان است و این سقف هزینهٔ سرویس را مهار میکند.
                            </p>
                            {warm && (
                              <p className="mt-0.5 text-[9.5px] font-black text-amber-600">
                                ماه نزدیکِ سقف است — مصرف را دنبال کن.
                              </p>
                            )}
                            {near && (
                              <p className="mt-0.5 text-[9.5px] font-black text-rose-600">
                                {pct >= 100
                                  ? "سقفِ این ماه پر شده — روخوانیِ تازه تا ماهِ بعد بسته است؛ کشِ صدا کار میکند."
                                  : "به سقفِ ماه نزدیک شده — روخوانیِ تازه تا پایانِ ماه کار میکند."}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                  {updatedAt && (
                    <p className="text-center text-[9.5px] font-bold text-stone-500">
                      آخرین به‌روزرسانی: {faNum(updatedAt.slice(11, 16))} — ارقامِ کل شاملِ بایگانی است.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
          {state === "loading" && (
            <div className="flex items-center justify-center gap-2 py-6 text-[11.5px] font-bold text-stone-500">
              <Loader2 size={14} className="animate-spin" />
              در حال خواندنِ نبض…
            </div>
          )}
          {state === "error" && (
            <p className="py-4 text-center text-[11.5px] font-bold text-stone-500">نبضِ زنده در دسترس نیست — بعداً تلاش کن.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
