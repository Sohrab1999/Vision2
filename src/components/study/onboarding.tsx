"use client";

// F1 — آنبردینگ ۳مرحله‌ای (نقشهٔ راه فیچرها، اسپرینت ۱)
// گام ۱: خوش‌آمد + نام و رنگ آواتار (اختیاری — ناشناس هم قابل قبول است)
// گام ۲: انتخاب هدف روزانهٔ فعالیت (۵ / ۱۰ / ۱۵)
// گام ۳: جمع‌بندی + پرش راهنمادار به اولین تمرین (فلش‌کارت درس اول)
// فقط برای اولین بازدید نمایش داده می‌شود (persist flag: onboarded)

import { useState, useSyncExternalStore } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, ChevronLeft, PartyPopper, User, Target, Play, EyeOff } from "lucide-react";
import { useStudy, AVATAR_COLORS, DAILY_GOAL_OPTIONS } from "@/lib/study-store";
import { sendProfile } from "@/lib/identity";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { avatarClasses } from "@/lib/study-theme";

const GOAL_META: Record<number, { title: string; desc: string; icon: string; tone: string }> = {
  5: { title: "سبک و روزانه", desc: "۵ فعالیت در روز — برای شروع بدون فشار", icon: "🌱", tone: "amber" },
  10: { title: "متعادل", desc: "۱۰ فعالیت در روز — انتخاب پیشنهادی ما", icon: "⚖️", tone: "emerald" },
  15: { title: "جدی و پرتلاش", desc: "۱۵ فعالیت در روز — برای آمادگی کامل", icon: "🔥", tone: "rose" },
};

const GOAL_TONE: Record<string, string> = {
  amber: "border-amber-300 bg-amber-50/80 ring-2 ring-amber-400/40",
  emerald: "border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500/40",
  rose: "border-rose-300 bg-rose-50/80 ring-2 ring-rose-400/40",
};

const GOAL_TONE_IDLE: Record<string, string> = {
  amber: "border-stone-200 hover:border-amber-200 hover:bg-amber-50/40",
  emerald: "border-stone-200 hover:border-emerald-200 hover:bg-emerald-50/40",
  rose: "border-stone-200 hover:border-rose-200 hover:bg-rose-50/40",
};

const subscribeHydrated = (cb: () => void) => useStudy.persist.onFinishHydration(cb);

export default function Onboarding() {
  const mounted = useMounted();
  // waits for the persisted store (skipHydration) — returning users never see the flow again
  const persistHydrated = useSyncExternalStore(
    subscribeHydrated,
    () => useStudy.persist.hasHydrated(),
    () => false
  );
  const onboarded = useStudy((s) => s.onboarded);
  const setOnboarded = useStudy((s) => s.setOnboarded);
  const setProfile = useStudy((s) => s.setProfile);
  const setDailyGoal = useStudy((s) => s.setDailyGoal);
  const openLesson = useStudy((s) => s.openLesson);

  const [step, setStep] = useState(0);
  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState<string>("emerald");
  const [goalDraft, setGoalDraft] = useState<number>(10);

  const open = mounted && persistHydrated && !onboarded;

  const saveProfileNow = (name: string, color: string) => {
    setProfile(name, color);
    // Phase-0: signed registration+profile (server issues userId/secret on first run)
    sendProfile({ name, color }).catch(() => {});
  };

  const finish = () => setOnboarded();

  // ESC / کلیک بیرون = رد کردن جریان (پیشرفت گام ۱ قبلاً ذخیره شده است)
  const dismissAsSkip = () => finish();

  const goStep2 = () => {
    const name = nameDraft.trim();
    if (name.length >= 2) saveProfileNow(name, colorDraft);
    setStep(1);
  };

  const goStep3 = () => {
    setDailyGoal(goalDraft);
    setStep(2);
  };

  const startFirstExercise = () => {
    finish();
    openLesson(1, "smart"); // فلش‌کارت درس اول — اولین فعالیت راهنمادار
  };

  const stepDots = (
    <div className="flex items-center justify-center gap-1.5" aria-label={`گام ${faNum(step + 1)} از ۳`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? "w-6 bg-emerald-600" : i < step ? "w-1.5 bg-emerald-400" : "w-1.5 bg-stone-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismissAsSkip();
      }}
    >
      <DialogContent
        className="max-w-md rounded-3xl border-stone-200 bg-white p-0 overflow-hidden"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          dismissAsSkip();
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-l from-emerald-50 via-white to-white px-6 pt-6 pb-4">
          <div className="mb-3 flex justify-center">{stepDots}</div>
          {step === 0 && (
            <>
              <DialogTitle className="flex items-center justify-center gap-2 text-center text-lg font-black text-stone-800">
                <Sparkles size={18} className="text-amber-500" />
                به وب‌کتاب ویژن ۲ خوش آمدی!
              </DialogTitle>
              <DialogDescription className="mt-1 text-center text-[12.5px] leading-5 text-stone-500">
                بیا در کمتر از یک دقیقه کتاب را برای تو شخصی‌سازی کنیم.
              </DialogDescription>
            </>
          )}
          {step === 1 && (
            <>
              <DialogTitle className="flex items-center justify-center gap-2 text-center text-lg font-black text-stone-800">
                <Target size={18} className="text-emerald-600" />
                هدف روزانه‌ات چقدر باشد؟
              </DialogTitle>
              <DialogDescription className="mt-1 text-center text-[12.5px] leading-5 text-stone-500">
                هر زمان از تنظیمات یا خانه می‌توانی تغییرش بدهی.
              </DialogDescription>
            </>
          )}
          {step === 2 && (
            <>
              <DialogTitle className="flex items-center justify-center gap-2 text-center text-lg font-black text-stone-800">
                <PartyPopper size={18} className="text-amber-500" />
                همه‌چیز آماده است!
              </DialogTitle>
              <DialogDescription className="mt-1 text-center text-[12.5px] leading-5 text-stone-500">
                کتاب شخصی‌سازی شد — بیا اولین قدم را برداریم.
              </DialogDescription>
            </>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* ---------------- گام ۱: نام و رنگ ---------------- */}
          {step === 0 && (
            <div>
              <div className="mb-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                <label htmlFor="onb-name" className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-stone-600">
                  <User size={13} className="text-emerald-600" />
                  اسمت را بنویس (اختیاری)
                </label>
                <input
                  id="onb-name"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goStep2()}
                  placeholder="مثلاً: امیر محمد"
                  maxLength={24}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-800 outline-none transition-colors placeholder:font-normal placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="mb-2 mt-3 text-[11.5px] font-bold text-stone-500">رنگ آواتارت:</div>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColorDraft(c)}
                      aria-label={`رنگ ${c}`}
                      className={`h-8 w-8 rounded-full shadow-md transition-all ${avatarClasses[c] ?? avatarClasses.emerald} ${
                        colorDraft === c ? "scale-110 ring-2 ring-stone-700 ring-offset-2" : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2.5 text-[10.5px] leading-4 text-stone-400">
                  با نام، در جدول امتیازات و فید فعالیت کلاس دیده می‌شوی. نمی‌خواهی؟ ناشناس ادامه بده.
                </p>
              </div>
              <button
                onClick={goStep2}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white shadow-md shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95"
              >
                ادامه
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  finish();
                }}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold text-stone-400 transition-colors hover:text-stone-600"
              >
                <EyeOff size={13} />
                رد کردن — ناشناس می‌مانم
              </button>
            </div>
          )}

          {/* ---------------- گام ۲: هدف روزانه ---------------- */}
          {step === 1 && (
            <div>
              <div className="space-y-2.5" role="radiogroup" aria-label="هدف روزانه">
                {DAILY_GOAL_OPTIONS.map((g) => {
                  const meta = GOAL_META[g];
                  const active = goalDraft === g;
                  return (
                    <button
                      key={g}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setGoalDraft(g)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-right transition-all active:scale-[0.98] ${
                        active ? GOAL_TONE[meta.tone] : GOAL_TONE_IDLE[meta.tone]
                      }`}
                    >
                      <span className="text-xl" aria-hidden>
                        {meta.icon}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2 text-[13.5px] font-black text-stone-800">
                          {meta.title}
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-black text-stone-500 shadow-sm">
                            {faNum(g)} فعالیت
                          </span>
                          {g === 10 && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                              پیشنهادی
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-4 text-stone-500">{meta.desc}</span>
                      </span>
                      <span
                        className={`h-4.5 w-4.5 shrink-0 rounded-full border-2 transition-all ${
                          active ? "border-emerald-600 bg-emerald-600 shadow-inner" : "border-stone-300 bg-white"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setStep(0)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-[13px] font-bold text-stone-500 transition-all hover:bg-stone-50 active:scale-95"
                >
                  بازگشت
                </button>
                <button
                  onClick={goStep3}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white shadow-md shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95"
                >
                  ثبت هدف
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ---------------- گام ۳: جمع‌بندی + شروع ---------------- */}
          {step === 2 && (
            <div>
              <div className="mb-4 space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-bold text-stone-500">پروفایل</span>
                  <span className="flex items-center gap-2 font-black text-stone-800">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white shadow ${avatarClasses[colorDraft] ?? avatarClasses.emerald}`}>
                      {nameDraft.trim().length >= 2 ? nameDraft.trim().charAt(0) : "?"}
                    </span>
                    {nameDraft.trim().length >= 2 ? nameDraft.trim() : "یادگیرندهٔ ناشناس"}
                  </span>
                </div>
                <div className="h-px bg-emerald-200/70" />
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-bold text-stone-500">هدف روزانه</span>
                  <span className="font-black text-emerald-700">{faNum(goalDraft)} فعالیت در روز</span>
                </div>
                <div className="h-px bg-emerald-200/70" />
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-bold text-stone-500">قدم اول</span>
                  <span className="font-black text-stone-800">فلش‌کارت درس اول 🎴</span>
                </div>
              </div>
              <button
                onClick={startFirstExercise}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-md shadow-emerald-900/20 transition-all hover:bg-emerald-700 active:scale-95"
              >
                <Play size={16} />
                شروع اولین تمرین
              </button>
              <button
                onClick={finish}
                className="mt-2 w-full rounded-xl py-2 text-[12px] font-bold text-stone-400 transition-colors hover:text-stone-600"
              >
                بعداً خودم شروع می‌کنم
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
