"use client";

// F2 — مرکز تنظیمات (نقشهٔ راه فیچرها، اسپرینت ۱)
// سرعت روخوانی TTS · اندازهٔ متن · کاهش حرکت · هدف روزانه · دسترسی سریع به پروفایل/پشتیبان

import { useState } from "react";
import { Settings, Volume2, Type, Waves, Target, UserCog, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useStudy, DAILY_GOAL_OPTIONS } from "@/lib/study-store";
import { speak, stopSpeaking, setSpeakRateScale } from "@/lib/speak";
import { useMounted } from "@/lib/use-mounted";
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
  const mounted = useMounted();
  const settings = useStudy((s) => s.settings);
  const setSettings = useStudy((s) => s.setSettings);
  const dailyGoal = useStudy((s) => s.dailyGoal);
  const setDailyGoal = useStudy((s) => s.setDailyGoal);
  const [open, setOpen] = useState(false);
  const [previewing, setPreviewing] = useState(false);

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

  if (!mounted) {
    return (
      <button
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500"
        aria-label="تنظیمات"
      >
        <Settings size={16} />
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) stopSpeaking(); }}>
      <PopoverTrigger asChild>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-all hover:text-emerald-600 hover:border-emerald-200 active:scale-90"
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
        <section className="mb-4 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-90"
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
        <section className="mb-4 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
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
                  className={`flex items-center justify-center gap-1 rounded-lg border py-2 transition-all active:scale-95 ${f.cls} ${
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
        <section className="mb-4 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-3">
          <div className="flex items-center gap-1.5">
            <Waves size={13} className="text-emerald-600" />
            <div>
              <div className="text-[12px] font-bold text-stone-700">کاهش حرکت و انیمیشن</div>
              <div className="text-[10px] leading-4 text-stone-400">برای تمرکز بیشتر یا حساسیت به حرکت</div>
            </div>
          </div>
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(v) => setSettings({ reduceMotion: v })}
            aria-label="کاهش حرکت و انیمیشن"
          />
        </section>

        {/* ---------- هدف روزانه ---------- */}
        <section className="mb-4 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
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
                  className={`flex items-center justify-center gap-1 rounded-lg border py-2 text-[13px] transition-all active:scale-95 ${
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

        {/* ---------- پروفایل و پشتیبان ---------- */}
        <button
          onClick={() => {
            setOpen(false);
            setTimeout(() => window.dispatchEvent(new CustomEvent("open-profile")), 150);
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2.5 text-[12px] font-bold text-stone-600 transition-all hover:border-emerald-300 hover:text-emerald-700 active:scale-95"
        >
          <UserCog size={14} />
          نام، رنگ و پشتیبان‌گیری پیشرفت
        </button>
      </PopoverContent>
    </Popover>
  );
}
