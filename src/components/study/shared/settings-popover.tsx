"use client";

// F2 — مرکز تنظیمات (نقشهٔ راه فیچرها، اسپرینت ۱)
// سرعت روخوانی TTS · اندازهٔ متن · کاهش حرکت · هدف روزانه · دسترسی سریع به پروفایل/پشتیبان

import { useState, useEffect } from "react";
import { Settings, Volume2, Type, Waves, Target, UserCog, Check, Smartphone, Activity, Loader2, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useStudy, DAILY_GOAL_OPTIONS } from "@/lib/study-store";
import { speak, stopSpeaking, setSpeakRateScale } from "@/lib/speak";
import { percent } from "@/lib/domain/percent";
import { faNum } from "@/lib/study-theme";

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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border c-card text-stone-500 transition-[color,border-color,transform] hover:text-emerald-600 hover:border-emerald-200 active:scale-90"
          aria-label="تنظیمات"
          title="تنظیمات"
        >
          <Settings size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl border-stone-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-900/20">
            <Settings size={15} />
          </span>
          <div>
            <h3 className="text-[13.5px] font-black text-stone-800">تنظیمات وب‌کتاب</h3>
            <p className="text-[10.5px] leading-4 text-stone-400">روی این دستگاه ذخیره می‌شود</p>
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition-[background-color,transform] hover:bg-emerald-700 active:scale-90"
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
          <div className="mt-1.5 flex justify-between text-[10px] font-bold text-stone-400">
            <span>کند</span>
            <span>سریع</span>
          </div>
        </section>

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
                  className={`flex items-center justify-center gap-1 rounded-lg border py-2 transition-[border-color,transform] active:scale-95 ${f.cls} ${
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
              <div className="text-[10px] leading-4 text-stone-400">برای تمرکز بیشتر یا حساسیت به حرکت</div>
              {/* task 168: the OS channel (globals F2b + MotionConfig) is automatic — honesty hint */}
              <div className="mt-0.5 text-[10px] leading-4 text-stone-400">
                اگر دستگاه شما «کاهش حرکت» را فعال کرده باشد، انیمیشن‌ها خودکار هم آرام می‌شوند
              </div>
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
                  className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-[13px] transition-[border-color,transform] active:scale-95 ${
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
            <button
              onClick={loadPulse}
              className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition-[color,background-color,transform] hover:bg-stone-200/70 hover:text-emerald-600 active:scale-90"
              aria-label="به‌روزرسانی آمار"
              title="به‌روزرسانی"
            >
              {pulseState === "loading" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            </button>
          </div>
          <p className="mb-2 text-[10px] leading-4 text-stone-400">
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
            <p className="py-2 text-center text-[11px] text-stone-400">هنوز فعالیتی ثبت نشده — اولین نفر باش!</p>
          )}
          {pulseState === "error" && (
            <p className="py-2 text-center text-[11px] text-stone-400">آمار زنده در دسترس نیست.</p>
          )}
        </section>

        {/* ---------- نصب روی دستگاه (F4) ---------- */}
        {showInstallRow && (
          <button
            onClick={() => {
              setOpen(false);
              setTimeout(() => window.dispatchEvent(new CustomEvent("install-app")), 150);
            }}
            className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 py-2.5 text-[12px] font-black text-emerald-700 transition-[background-color,transform] hover:bg-emerald-100 active:scale-95"
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
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border c-card py-2.5 text-[12px] font-bold text-stone-600 transition-[color,border-color,transform] hover:border-emerald-300 hover:text-emerald-700 active:scale-95"
        >
          <UserCog size={14} />
          نام، رنگ و پشتیبان‌گیری پیشرفت
        </button>
      </PopoverContent>
    </Popover>
  );
}
