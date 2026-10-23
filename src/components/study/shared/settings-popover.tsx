"use client";

// F2 — مرکز تنظیمات (نقشهٔ راه فیچرها، اسپرینت ۱)
// سرعت روخوانی TTS · اندازهٔ متن · کاهش حرکت · هدف روزانه · دسترسی سریع به پروفایل/پشتیبان

import { useState, useEffect } from "react";
import { Settings, Volume2, Type, Waves, Target, UserCog, Check, Smartphone, Activity, Loader2, RefreshCw, Gauge, Sparkles, BarChart3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useStudy, DAILY_GOAL_OPTIONS } from "@/lib/study-store";
import { speak, stopSpeaking, setSpeakRateScale } from "@/lib/speak";
import { percent } from "@/lib/domain/percent";
import { faNum } from "@/lib/study-theme";
import { useWatchtower } from "@/lib/use-watchtower";
import PulseDashboard from "./pulse-dashboard";

const FONT_OPTIONS: { scale: number; label: string; cls: string }[] = [
  { scale: 0.94, label: "کوچک", cls: "text-[13px]" },
  { scale: 1, label: "معمولی", cls: "text-[15px]" },
  { scale: 1.1, label: "بزرگ", cls: "text-[17px]" },
];

function rateLabel(v: number): string {
  if (v < 0.85) return "آرام و شمرده";
  if (v < 1.15) return "معمولی";
  return "سریع‌تر";
}

export default function SettingsPopover() {
  // NOTE (hydration fix 2026-10-12): this component used to early-return a plain
  // placeholder button while !mounted. useMounted flips to true during the
  // client's FIRST (hydration) render (useSyncExternalStore client snapshot),
  // so the server rendered a bare button while the client rendered the Radix
  // Popover — a tree-shape/useId mismatch that logged a hydration error on
  // every load of a returning learner. The trigger itself reads no store
  // state and the (store-reading) content only mounts when opened, so the
  // SAME tree is now rendered unconditionally on both sides.
  //
  // NOTE (hydration fix 2026-10-13): a SECOND, rarer mismatch remained —
  // `aria-controls="radix-…"` on this trigger (Radix emits it unconditionally
  // from the root's useId) diverged between the server HTML and the client's
  // hydration pass in ~50% of multi-navigation dev sessions: the server id is
  // byte-stable across curls, the client's React useId positional encoding
  // drifted non-deterministically (React: «This won't be patched up»). Zero
  // functional harm — the id self-heals the moment the popover opens — but it
  // polluted the console-0 QA bar. suppressHydrationWarning on THIS button
  // silences exactly that attribute noise (server id stays until first
  // re-render, then Radix writes the live id); any REAL tree-shape regression
  // here still surfaces. Same marker on profile-popover's trigger.
  const settings = useStudy((s) => s.settings);
  const setSettings = useStudy((s) => s.setSettings);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const setDailyGoal = useStudy((s) => s.setDailyGoal);
  const [open, setOpen] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [showInstallRow, setShowInstallRow] = useState(false);

  // F10 — live product pulse: anonymous aggregate activity of the whole
  // learning community (no PII — only whitelisted counters), fetched on open
  const [pulse, setPulse] = useState<{ name: string; label: string; total: number; week: number }[] | null>(null);
  const [pulseState, setPulseState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  // r350 «نبضِ کامل» — داشبوردِ تمامِ رویدادها + برجِ مراقبتِ نان‌های خطا
  const [pulseOpen, setPulseOpen] = useState(false);

  // r351 «برجِ بیدار» — نشانِ فعالِ نانهای خطا رویِ ماشهٔ تنظیمات:
  // یک خوانش در سوارشدن + تازهسازی با هر بازشدنِ پنجره (کلیدِ رفرش).
  // تازگی = آخرین نانِ خطا در ۲۴ ساعتِ گذشته ⇒ نقطهٔ کهربایی. خطا ⇒ بی‌نشان.
  const [wtKey, setWtKey] = useState(0);
  const watchtower = useWatchtower(wtKey);

  // r347 — «بودجهٔ روخوانیِ ماه»: مصرفِ واقعیِ سرویسِ روخوانی، هر بار که
  // پنجره باز میشود تازه میشود (سبک است — یک GET کوچک). خطا ⇒ ردیف پنهان
  // (دیدبانی، نه درستکاری — خودِ روخوانی به این ردیف وابسته نیست).
  const [usage, setUsage] = useState<{ used: number; cap: number } | null>(null);
  const [usageState, setUsageState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const loadUsage = async () => {
    setUsageState((prev) => (prev === "loading" ? prev : "loading"));
    try {
      const res = await fetch("/api/tts/usage", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { ok: boolean; used: number; cap: number };
      if (!data.ok) throw new Error("bad-shape");
      setUsage({ used: data.used, cap: data.cap });
      setUsageState("ready");
    } catch {
      setUsageState("error");
    }
  };

  // r348 — «بودجهٔ توضیح هوشمند»: همزادِ ردیفِ روخوانی — مصرفِ واقعیِ
  // /api/explain، هر بازشدن تازه، خطا ⇒ پنهان (دیدبانی نه درستکاری).
  const [xUsage, setXUsage] = useState<{ used: number; cap: number } | null>(null);
  const [xUsageState, setXUsageState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const loadXUsage = async () => {
    setXUsageState((prev) => (prev === "loading" ? prev : "loading"));
    try {
      const res = await fetch("/api/explain/usage", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { ok: boolean; used: number; cap: number };
      if (!data.ok) throw new Error("bad-shape");
      setXUsage({ used: data.used, cap: data.cap });
      setXUsageState("ready");
    } catch {
      setXUsageState("error");
    }
  };

  const loadPulse = async () => {
    setPulseState((prev) => (prev === "loading" ? prev : "loading"));
    try {
      const res = await fetch("/api/event", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { events?: { name: string; label: string; total: number; week: number }[] };
      setPulse(data.events ?? []);
      setPulseState("ready");
    } catch {
      setPulseState("error");
    }
  };

  const toggleOpen = (next: boolean) => {
    setOpen(next);
    if (!next) {
      stopSpeaking();
      return;
    }
    if (pulseState === "idle") loadPulse();
    loadUsage(); // r347 — همیشه تازه، چون مصرف با هر روخوانی جلو میرود
    loadXUsage(); // r348 — همزادِ توضیح هوشمند
    setWtKey((k) => k + 1); // r351 — برج هم با هر بازشدن تازه میشود
  };

  // install row: hidden once the app runs standalone (F4)
  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const update = () =>
      setShowInstallRow(!window.matchMedia("(display-mode: standalone)").matches && nav.standalone !== true);
    update();
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Task 69 — باز شدن از فرمان‌یاب (فرمان «تنظیمات وب‌کتاب»): رویداد پنجره‌ای،
  // هم‌الگوی open-profile پروفایل. تپشِ زنده هم در هر باز شدن تازه می‌شود.
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      loadPulse();
    };
    window.addEventListener("open-settings", handler);
    return () => window.removeEventListener("open-settings", handler);
  }, []);

  const changeRate = (v: number) => {
    setSettings({ ttsRate: v });
    setSpeakRateScale(v); // immediate — next speak() uses it
  };

  const preview = async () => {
    if (previewing) {
      stopSpeaking();
      setPreviewing(false);
      return;
    }
    setPreviewing(true);
    await speak("Hello! Welcome to Vision Two, your interactive English book.", 0.95, () => setPreviewing(false), () => setPreviewing(false));
  };

  return (
    <Popover open={open} onOpenChange={toggleOpen}>
      <PopoverTrigger asChild>
        <button
          suppressHydrationWarning
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border c-card text-stone-500 transition-[background-color,color,border-color,transform] hover:text-emerald-600 hover:border-emerald-200 active:scale-[0.96]"
          aria-label="تنظیمات"
          title={watchtower.fresh ? "تنظیمات — خطایِ تازه رویِ سرور" : "تنظیمات"}
        >
          <Settings size={16} />
          {/* r351 «برجِ بیدار» — نقطهٔ کهرباییِ نانِ خطایِ ۲۴ساعته. client-only
              (بعد از واکشی ظاهر میشود) ⇒ اختلالِ هیدریشن ندارد. animate-pulse
              = فقط رنگ (idiomِ موجود — duel-play/my-words/home-feed). */}
          {watchtower.fresh && (
            <span
              aria-hidden
              title="خطایِ تازه در ۲۴ ساعتِ گذشته رویِ سرور"
              data-testid="watchtower-dot"
              className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl border-stone-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-900/20">
            <Settings size={15} />
          </span>
          <div>
            <h3 className="text-[13.5px] font-black text-stone-800">تنظیمات وب‌کتاب</h3>
            <p className="text-[10.5px] leading-4 text-stone-500">روی این دستگاه ذخیره می‌شود</p>
          </div>
        </div>

        {/* ---------- سرعت روخوانی ---------- */}
        <section className="mb-4 rounded-xl border border-stone-200 c-stone-60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-stone-600">
              <Volume2 size={13} className="text-emerald-600" />
              سرعت روخوانی
            </span>
            <span className="text-[11px] font-black text-emerald-700">{rateLabel(settings.ttsRate)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[settings.ttsRate]}
              min={0.7}
              max={1.3}
              step={0.05}
              onValueChange={(vals) => changeRate(vals[0] ?? 1)}
              aria-label="سرعت روخوانی"
              className="flex-1"
            />
            <button
              onClick={preview}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:bg-emerald-800 active:scale-[0.96]"
              aria-label={previewing ? "توقف پخش نمونه" : "پخش نمونهٔ روخوانی"}
              title={previewing ? "توقف" : "بشنو"}
            >
              {previewing ? (
                <span className="h-2.5 w-2.5 rounded-[2px] bg-white" aria-hidden />
              ) : (
                <Volume2 size={14} />
              )}
            </button>
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-bold text-stone-500">
            <span>کند</span>
            <span>سریع</span>
          </div>
        </section>

        {/* ---------- بودجهٔ روخوانیِ ماه (r347) ---------- */}
        {usageState === "ready" && usage && (() => {
          const pct = Math.min(100, Math.round((usage.used / usage.cap) * 100));
          const near = pct >= 85;
          const warm = pct >= 60 && !near;
          return (
            <section className="mb-4 rounded-xl border border-stone-200 c-stone-60 p-3" aria-label="بودجهٔ روخوانیِ ماه">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-stone-600">
                  <Gauge size={13} className="text-emerald-600" />
                  بودجهٔ روخوانیِ ماه
                </span>
                <span
                  className={`text-[11px] font-black ${near ? "text-rose-600" : warm ? "text-amber-600" : "text-emerald-700"}`}
                >
                  {faNum(pct)}٪
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full c-track-80">
                {/* خانه: بدونِ ترنزیشن — width ویژگیِ layout است (قفلِ scoped-transitions)؛
                    نوار با هر بازشدنِ پنجره نرم مقدارِ تازه میگیرد، انیمیشنِ لازم نیست */}
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
              <p className="mt-1 text-[10px] leading-4 text-stone-500">
                {faNum(usage.used)} حرف از {faNum(usage.cap)} حرفِ سقفِ ماه — این سقف هزینهٔ سرویسِ روخوانی را مهار می‌کند.
              </p>
            </section>
          );
        })()}

        {/* ---------- بودجهٔ توضیح هوشمند (r348) ---------- */}
        {xUsageState === "ready" && xUsage && (() => {
          const pct = Math.min(100, Math.round((xUsage.used / xUsage.cap) * 100));
          const near = pct >= 85;
          const warm = pct >= 60 && !near;
          return (
            <section className="mb-4 rounded-xl border border-stone-200 c-stone-60 p-3" aria-label="بودجهٔ توضیح هوشمند">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-stone-600">
                  <Sparkles size={13} className="text-violet-500" />
                  بودجهٔ توضیح هوشمند
                </span>
                <span
                  className={`text-[11px] font-black ${near ? "text-rose-600" : warm ? "text-amber-600" : "text-emerald-700"}`}
                >
                  {faNum(pct)}٪
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full c-track-80">
                {/* خانه: بدونِ ترنزیشن — width ویژگیِ layout است (قفلِ scoped-transitions)؛
                    نوار با هر بازشدنِ پنجره نرم مقدارِ تازه میگیرد، انیمیشنِ لازم نیست */}
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
              <p className="mt-1 text-[10px] leading-4 text-stone-500">
                {faNum(xUsage.used)} پرسش از {faNum(xUsage.cap)} پرسشِ سقفِ ماه — این سقف هزینهٔ توضیحِ هوشمند را مهار می‌کند.
              </p>
            </section>
          );
        })()}

        {/* ---------- اندازهٔ متن ---------- */}
        <section className="mb-4 rounded-xl border border-stone-200 c-stone-60 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-stone-600">
            <Type size={13} className="text-emerald-600" />
            اندازهٔ متن
          </div>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="اندازهٔ متن">
            {FONT_OPTIONS.map((f) => {
              const active = Math.abs(settings.fontScale - f.scale) < 0.01;
              return (
                <button
                  key={f.label}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSettings({ fontScale: f.scale })}
                  className={`flex items-center justify-center gap-1 rounded-lg border py-2 transition-[background-color,color,border-color,transform] active:scale-[0.96] ${f.cls} ${
                    active
                      ? "border-emerald-500 bg-emerald-50 font-black text-emerald-700"
                      : "border-stone-200 bg-white font-bold text-stone-500 hover:border-emerald-200"
                  }`}
                >
                  {active && <Check size={12} />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- کاهش حرکت ---------- */}
        <section className="mb-4 flex items-center justify-between rounded-xl border border-stone-200 c-stone-60 p-3">
          <div className="flex items-center gap-1.5">
            <Waves size={13} className="text-emerald-600" />
            <div>
              <div className="text-[12px] font-bold text-stone-700">کاهش حرکت و انیمیشن</div>
              <div className="text-[10px] leading-4 text-stone-500">برای تمرکز بیشتر یا حساسیت به حرکت</div>
            </div>
          </div>
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(v) => setSettings({ reduceMotion: v })}
            aria-label="کاهش حرکت و انیمیشن"
          />
        </section>

        {/* ---------- هدف روزانه ---------- */}
        <section className="mb-4 rounded-xl border border-stone-200 c-stone-60 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-stone-600">
            <Target size={13} className="text-emerald-600" />
            هدف روزانهٔ فعالیت
          </div>
          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="هدف روزانهٔ فعالیت">
            {DAILY_GOAL_OPTIONS.map((g) => {
              const active = dailyGoal === g;
              return (
                <button
                  key={g}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDailyGoal(g)}
                  className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-[13px] transition-[background-color,color,border-color,transform] active:scale-[0.96] ${
                    active
                      ? "border-emerald-500 bg-emerald-50 font-black text-emerald-700"
                      : "border-stone-200 bg-white font-bold text-stone-500 hover:border-emerald-200"
                  }`}
                >
                  {active && <Check size={12} />}
                  {faNum(g)}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- تپش وب‌کتاب (F10، زنده و بی‌نام) ---------- */}
        <section className="mb-4 rounded-xl border border-stone-200 c-stone-60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-stone-600">
              <Activity size={13} className="text-emerald-600" />
              تپش وب‌کتاب (زنده)
            </span>
            <div className="flex items-center gap-1">
              {/* r350 «نبضِ کامل» — داشبوردِ تمامِ رویدادها + برجِ مراقبت */}
              <button
                onClick={() => {
                  setOpen(false); // پاپاورِ روی‌هم‌افتاده نمیماند — دیالوگ صحنه را میگیرد
                  setPulseOpen(true);
                }}
                className="flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-black text-emerald-700 transition-[background-color,color,border-color,transform] hover:bg-emerald-100/80 active:scale-[0.96]"
                aria-label="نبضِ کامل — داشبوردِ همهٔ رویدادها"
              >
                <BarChart3 size={11} />
                نبضِ کامل
              </button>
              <button
                onClick={loadPulse}
                className="flex h-6 w-6 items-center justify-center rounded-full text-stone-500 transition-[background-color,color,border-color,transform] hover:bg-stone-200/70 hover:text-emerald-600 active:scale-[0.96]"
                aria-label="به‌روزرسانی آمار"
                title="به‌روزرسانی"
              >
                {pulseState === "loading" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              </button>
            </div>
          </div>
          <p className="mb-2 text-[10px] leading-4 text-stone-500">
            فعالیت بی‌نامِ همهٔ یادگیرندگان — بدون هیچ اطلاعات شخصی.
          </p>
          {pulseState === "ready" && pulse && pulse.length > 0 && (() => {
            const top = pulse.slice(0, 6);
            const max = Math.max(...top.map((e) => e.total), 1);
            return (
              <div className="max-h-40 space-y-1.5 overflow-y-auto nice-scroll pl-1" dir="rtl">
                {top.map((e) => (
                  <div key={e.name} className="flex items-center gap-2">
                    <span className="w-[118px] shrink-0 truncate text-[10.5px] font-bold text-stone-500">{e.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full c-track-80">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-emerald-600"
                        style={{ width: `${Math.max(4, percent(e.total, max))}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-left text-[10.5px] font-black text-emerald-700" dir="ltr">
                      {faNum(e.total)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
          {pulseState === "ready" && pulse && pulse.length === 0 && (
            <p className="py-2 text-center text-[11px] text-stone-500">هنوز فعالیتی ثبت نشده — اولین نفر باش!</p>
          )}
          {pulseState === "error" && (
            <p className="py-2 text-center text-[11px] text-stone-500">آمار زنده در دسترس نیست.</p>
          )}
        </section>

        {/* ---------- نصب روی دستگاه (F4) ---------- */}
        {showInstallRow && (
          <button
            onClick={() => {
              setOpen(false);
              setTimeout(() => window.dispatchEvent(new CustomEvent("install-app")), 150);
            }}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 py-2.5 text-[12px] font-black text-emerald-700 transition-[background-color,color,border-color,transform] hover:bg-emerald-100 active:scale-[0.96]"
          >
            <Smartphone size={14} />
            نصب وب‌کتاب روی دستگاه
          </button>
        )}

        {/* ---------- پروفایل و پشتیبان ---------- */}
        <button
          onClick={() => {
            setOpen(false);
            setTimeout(() => window.dispatchEvent(new CustomEvent("open-profile")), 150);
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border c-card py-2.5 text-[12px] font-bold text-stone-600 transition-[background-color,color,border-color,transform] hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.96]"
        >
          <UserCog size={14} />
          نام، رنگ و پشتیبان‌گیری پیشرفت
        </button>
      </PopoverContent>
      {/* r350 «نبضِ کامل» — بیرونِ PopoverContent تا پورتالِ مستقلِ خودش را داشته باشد */}
      <PulseDashboard open={pulseOpen} onOpenChange={setPulseOpen} />
    </Popover>
  );
}
