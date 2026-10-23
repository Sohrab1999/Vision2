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
import { Activity, Loader2, RefreshCw, HeartPulse, ShieldAlert, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { faNum } from "@/lib/study-theme";
import { percent } from "@/lib/domain/percent";
import { trackEvent } from "@/lib/analytics";
import { EVENT_CATEGORIES, EVENT_CATEGORY_ORDER } from "@/lib/analytics-events";
import { downloadPulseCsv, type PulseLedgerRow } from "@/lib/pulse-csv";

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
  }, []);

  useEffect(() => {
    if (!open) return;
    trackEvent("pulse_open");
    void load();
  }, [open, load]);

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
      toast(
        ok
          ? { title: "📊 دفترِ سی‌روزهٔ نبض ذخیره شد", description: "هر سطر = یک روز × یک رویداد — آمادهٔ فیلتر در اکسل.", duration: 3000 }
          : { title: "خطا در ساخت فایل", description: "لطفاً دوباره تلاش کن.", duration: 3000 }
      );
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
