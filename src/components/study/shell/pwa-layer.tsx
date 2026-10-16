"use client";

// ------------------------------------------------------------------
// F4 «PWA نصب‌پذیر + بدج سررسید» و F9 «نگهبان زنجیره» — لایهٔ همیشه‌فعال
//
// • ثبت service worker (/sw.js) — کش امن + آفلاین حداقلی
// • کارت شناور «نصب کن» (beforeinstallprompt / راهنمای iOS) + رویداد install-app
//   از تنظیمات؛ حداکثر هر ۷ روز پس از «بعداً» تکرار می‌شود
// • بدج آیکون اپ (setAppBadge) = تعداد واژه‌های سررسید مرور
// • نوتیف یک‌باردرروز: «N واژه سررسید» + توست‌های یخ زنجیره (ساخت/نجات)
// • پشتیبانی از میان‌برهای manifest (?goto=review / ?goto=exam)
// ------------------------------------------------------------------

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, PlusSquare, Share2, Smartphone, X } from "lucide-react";
import { useStudy, srsDueTotal, firstLessonWithDue, todayStr, FREEZE_CAP, FREEZE_EARN_GOALS } from "@/lib/study-store";
import { useToast } from "@/hooks/use-toast";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { trackEvent } from "@/lib/analytics";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const INSTALL_DISMISS_KEY = "vision2-install-dismissed";
const DUE_TOAST_KEY = "vision2-due-toast-day";
const FREEZE_TOAST_KEY = "vision2-freeze-toast-day";
const EARN_TOAST_KEY = "vision2-earn-toast-day";
const DISMISS_COOLDOWN = 7 * 86_400_000; // «بعداً» → ۷ روز سکوت

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

// deferred install prompt stays alive across renders (module scope)
let deferredInstall: BeforeInstallPromptEvent | null = null;

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneNow(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

/** true when this key wasn't already recorded today — records it atomically */
function oncePerDay(key: string): boolean {
  const today = todayStr();
  try {
    if (localStorage.getItem(key) === today) return false;
    localStorage.setItem(key, today);
  } catch {
    /* private mode — allow the toast */
  }
  return true;
}

export default function PwaLayer() {
  const { toast } = useToast();
  const mounted = useMounted();
  const [installable, setInstallable] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  // «بعداً» timestamp — kept in state so card visibility is fully derived
  const [dismissedAt, setDismissedAt] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(localStorage.getItem(INSTALL_DISMISS_KEY) ?? 0);
    } catch {
      return 0;
    }
  });

  // F9 toast inputs (global → safe to subscribe here)
  const freezeSavedDay = useStudy((s) => s.freezeSavedDay);
  const freezeEarnedDay = useStudy((s) => s.freezeEarnedDay);

  const persistHydrated = useSyncExternalStore(
    (cb) => useStudy.persist.onFinishHydration(cb),
    () => useStudy.persist.hasHydrated(),
    () => false
  );

  // ---------------- legacy service-worker purge ----------------
  // حادثهٔ ۲۰۲۶-۱۰-۱۷ «چندمین بار برنامه باگ خورده و باز نمیشه»: کلاینت‌هایی
  // که قبل از گاردِ dev (ریشه‌یابی 2026-10-12) SW نسخهٔ v1 را ثبت کرده
  // بودند، همچنان آن را دارند — و v1 چانک‌های /_next/static را cache-first
  // سرو می‌کند؛ یعنی حتی بعد از رفرش دستی هم کدِ کهنه از انبار می‌آید و
  // گراف ماژول می‌شکند. پاک‌سازیِ هدفمند و بدون‌تکرار: هر جا انبارِ v1
  // دیده شد، همهٔ SWها برچین و همهٔ انبارهای vision2 حذف می‌شوند؛ در prod
  // ثبتِ v2 در همان سشن/بازدید بعدی دوباره انجام می‌شود. بدون این، کلاینت
  // قدیمی تا ابد در حلقهٔ «باز نمیشه» می‌ماند.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const purgeLegacy = async () => {
      try {
        const keys = "caches" in window ? await caches.keys() : [];
        if (!keys.some((k) => k.startsWith("vision2-sw-v1"))) return;
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        await Promise.all(
          keys
            .filter((k) => k.startsWith("vision2-sw-"))
            .map((k) => caches.delete(k))
        );
      } catch {
        /* پاک‌سازی هرگز منبع کرش نمی‌شود */
      }
    };
    purgeLegacy();
  }, []);

  // ---------------- service worker ----------------
  useEffect(() => {
    // ریشه‌یابی 2026-10-12: در dev، چانک‌های توربوپک هم از مسیر
    // /_next/static/ سرو می‌شوند و استراتژی cache-first سرویس‌ورکر کد
    // کهنه را برای کل سشن کش می‌کرد (حادثه‌های «motion is not defined»
    // و «OptionButton is not defined» دقیقاً از همین جا بودند). سرویس‌ورکر
    // فقط در بیلد پروداکشن معنا دارد — در dev هرگز ثبت نمی‌شود.
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* SW is a progressive enhancement — ignore */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  // ---------------- standalone state ----------------
  useEffect(() => {
    const update = () => setStandalone(isStandaloneNow());
    update();
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // ---------------- install events ----------------
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredInstall = e as BeforeInstallPromptEvent;
      setInstallable(true);
    };
    const onInstalled = () => {
      deferredInstall = null;
      setInstallable(false);
      setDismissedAt(Date.now());
      trackEvent("pwa_install");
      toast({ title: "🎉 ویژن ۲ نصب شد!", description: "از این به بعد مثل یک اپ واقعی کنار اپ‌های توست." });
    };
    // fired by the settings popover row («نصب روی دستگاه»)
    const onManual = () => {
      if (deferredInstall) deferredInstall.prompt().catch(() => {});
      else setShowGuide(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("install-app", onManual as EventListener);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("install-app", onManual as EventListener);
    };
  }, [toast]);

  // card visibility — fully derived (no effect): never inside the installed
  // app, respects «بعداً» cooldown, needs a native prompt or an iOS guide
  const showCard =
    mounted && !standalone && (installable || isIos()) && (!dismissedAt || Date.now() - dismissedAt > DISMISS_COOLDOWN);

  const dismissCard = () => {
    setDismissedAt(Date.now());
    try {
      localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  // ---------------- app badge = due reviews ----------------
  useEffect(() => {
    if (!persistHydrated) return;
    const update = () => {
      const n = srsDueTotal(useStudy.getState().srs);
      const nav = navigator as Navigator & { setAppBadge?: (n?: number) => void; clearAppBadge?: () => void };
      try {
        if (n > 0) nav.setAppBadge?.(Math.min(n, 99));
        else nav.clearAppBadge?.();
      } catch {
        /* unsupported platform */
      }
    };
    update();
    const unsub = useStudy.subscribe(update);
    const onVis = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      unsub();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [persistHydrated]);

  // ---------------- daily nudge: due reviews ----------------
  useEffect(() => {
    if (!persistHydrated) return;
    const n = srsDueTotal(useStudy.getState().srs);
    if (n <= 0) return;
    if (!oncePerDay(DUE_TOAST_KEY)) return;
    toast({
      title: `${faNum(n)} واژهٔ سررسید منتظر توست`,
      description: "چند دقیقه مرور هوشمند، زنجیرهٔ حافظه‌ات را زنده نگه می‌دارد.",
    });
  }, [persistHydrated, toast]);

  // ---------------- F9 toasts ----------------
  useEffect(() => {
    if (!persistHydrated || !freezeSavedDay || freezeSavedDay !== todayStr()) return;
    if (!oncePerDay(FREEZE_TOAST_KEY)) return;
    toast({
      title: "❄️ یخِ تو نجاتت داد!",
      description: "دیروز غایب بودی، اما یخِ زنجیره شعله‌ات را روشن نگه داشت.",
    });
  }, [persistHydrated, freezeSavedDay, toast]);

  useEffect(() => {
    if (!persistHydrated || !freezeEarnedDay || freezeEarnedDay !== todayStr()) return;
    if (!oncePerDay(EARN_TOAST_KEY)) return;
    toast({
      title: "❄️ یک یخِ زنجیره ساختی!",
      description: `هدفِ روزانه را این هفته در ${faNum(FREEZE_EARN_GOALS)} روز کامل کردی — یخِ بعدی در سقف ${faNum(FREEZE_CAP)} یخ نگه داشته می‌شود.`,
    });
  }, [persistHydrated, freezeEarnedDay, toast]);

  // ---------------- manifest shortcuts (?goto=…) ----------------
  useEffect(() => {
    if (!persistHydrated) return;
    const p = new URLSearchParams(window.location.search).get("goto");
    if (!p) return;
    const s = useStudy.getState();
    if (p === "review") s.openLesson(firstLessonWithDue(s.srs) ?? 1, "smart");
    else if (p === "exam") s.setView({ type: "exam" });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("goto");
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* ignore */
    }
  }, [persistHydrated]);

  return (
    <>
      {/* ---------- floating install card ---------- */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-none fixed inset-x-3 bottom-24 z-40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[21rem]"
            role="complementary"
            aria-label="پیشنهاد نصب وب‌کتاب"
          >
            <div className="overflow-hidden rounded-2xl border border-emerald-200 c-veil-95 shadow-2xl shadow-emerald-900/15 backdrop-blur">
              <div className="h-1 w-full bg-gradient-to-l from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="flex items-start gap-3 p-4">
                <img
                  src="/icons/icon-192.png"
                  alt="آیکون وب‌کتاب ویژن ۲"
                  className="h-12 w-12 shrink-0 rounded-xl border border-emerald-100 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13.5px] font-black text-stone-800">ویژن ۲ را روی دستگاهت نصب کن</h3>
                  <p className="mt-0.5 text-[11.5px] leading-5 text-stone-500">
                    باز شدن سریع‌تر، بدون نوار مرورگر — مثل یک اپ واقعی.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (deferredInstall) {
                          deferredInstall.prompt().catch(() => {});
                          dismissCard();
                        } else {
                          setShowGuide(true);
                        }
                      }}
                      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-black text-white shadow-md shadow-emerald-900/20 transition-[background-color,transform] hover:bg-emerald-700 active:scale-95"
                    >
                      <Download size={13} />
                      نصب رایگان
                    </button>
                    <button
                      onClick={dismissCard}
                      className="pointer-events-auto rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-stone-500 transition-colors hover:text-stone-700"
                    >
                      بعداً
                    </button>
                  </div>
                </div>
                <button
                  onClick={dismissCard}
                  className="pointer-events-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                  aria-label="بستن پیشنهاد نصب"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- iOS / manual install guide ---------- */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-sm rounded-2xl border-stone-200 p-5">
          <DialogHeader className="text-right">
            <DialogTitle className="flex items-center gap-2 text-[15px] text-stone-800">
              <Smartphone size={17} className="text-emerald-600" />
              نصب وب‌کتاب روی دستگاه
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-5">
              {isIos()
                ? "سه قدم ساده در سافاری — حدود ۲۰ ثانیه:"
                : "از منوی مرورگر یا قدم‌های زیر استفاده کن:"}
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            {isIos() ? (
              <>
                <li className="flex items-start gap-2.5 rounded-xl border border-stone-200 c-stone-60 p-3 text-[12.5px] leading-6 text-stone-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">۱</span>
                  <span className="flex flex-1 items-center justify-between gap-2">
                    در سافاری دکمهٔ اشتراک را بزن
                    <Share2 size={16} className="shrink-0 text-emerald-600" />
                  </span>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-stone-200 c-stone-60 p-3 text-[12.5px] leading-6 text-stone-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">۲</span>
                  <span className="flex flex-1 items-center justify-between gap-2">
                    «افزودن به صفحهٔ اصلی» را انتخاب کن
                    <PlusSquare size={16} className="shrink-0 text-emerald-600" />
                  </span>
                </li>
                <li className="flex items-start gap-2.5 rounded-xl border border-stone-200 c-stone-60 p-3 text-[12.5px] leading-6 text-stone-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">۳</span>
                  <span>«افزودن» را بزن — آیکون ویژن ۲ کنار بقیهٔ اپ‌ها می‌نشیند.</span>
                </li>
              </>
            ) : (
              <li className="rounded-xl border border-stone-200 c-stone-60 p-3 text-[12.5px] leading-6 text-stone-700">
                در کروم یا اج: منوی مرورگر (⋮) ← <b>«نصب Vision Two»</b> یا <b>«افزودن به صفحهٔ اصلی»</b> را بزن.
                در سافاری مک: منوی <b>File ← Add to Dock</b>.
              </li>
            )}
          </ol>
          <p className="text-[11px] leading-5 text-stone-400">
            نصب فقط یک میان‌بر است — پیشرفت‌ات همان است و با کد یادگیرنده بین دستگاه‌ها همگام می‌ماند.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
