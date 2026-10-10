"use client";

import { BookOpen, Home, Library, ClipboardCheck, BookMarked, Sun, Moon, Flame, User, Download, Upload, ShieldCheck, History, RotateCcw, Keyboard, Laptop, CloudUpload, CloudDownload, Copy, Link2Off, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useStudy, AVATAR_COLORS, type View } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { exportProgress, parseBackup, applyBackup, backupSummary, readAutoBackup, restoreAutoBackup, autoBackupAgeFa, collectData } from "@/lib/backup";
import { pushSync, fetchSync, mergeSyncData, applyMergedSnapshot, normalizeCode, looksLikeCode } from "@/lib/sync";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SettingsPopover from "./settings-popover";

const navItems: { key: string; label: string; icon: React.ElementType; view: View }[] = [
  { key: "home", label: "خانه", icon: Home, view: { type: "home" } },
  { key: "dictionary", label: "دیکشنری", icon: BookMarked, view: { type: "dictionary" } },
  { key: "exam", label: "آزمون جامع", icon: ClipboardCheck, view: { type: "exam" } },
  { key: "appendix", label: "ضمیمه", icon: Library, view: { type: "appendix" } },
];

export const avatarClasses: Record<string, string> = {
  emerald: "bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-emerald-700/30",
  amber: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-orange-600/30",
  rose: "bg-gradient-to-br from-rose-400 to-rose-700 shadow-rose-700/30",
  violet: "bg-gradient-to-br from-violet-400 to-purple-700 shadow-purple-700/30",
  sky: "bg-gradient-to-br from-sky-400 to-cyan-700 shadow-cyan-700/30",
};

export default function Header() {
  const view = useStudy((s) => s.view);
  const setView = useStudy((s) => s.setView);
  const goHome = useStudy((s) => s.goHome);
  const streak = useStudy((s) => s.streak);
  const userName = useStudy((s) => s.userName);
  const avatarColor = useStudy((s) => s.avatarColor);
  const setProfile = useStudy((s) => s.setProfile);
  const ensureUserId = useStudy((s) => s.ensureUserId);
  const syncCode = useStudy((s) => s.syncCode);
  const setSyncCode = useStudy((s) => s.setSyncCode);
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const isDark = mounted && theme === "dark";
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState(avatarColor);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [autoSnap, setAutoSnap] = useState<ReturnType<typeof readAutoBackup>>(null);
  // F3 sync section state
  const [codeInput, setCodeInput] = useState("");
  const [syncing, setSyncing] = useState<"" | "push" | "pull" | "create" | "join">("");
  const [lastSyncAt, setLastSyncAt] = useState<string>(() => {
    try {
      return localStorage.getItem("vision2-sync-at") ?? "";
    } catch {
      return "";
    }
  });

  const openPopover = (next: boolean) => {
    setOpen(next);
    if (next) {
      setNameDraft(userName);
      setColorDraft(avatarColor);
      setSaved(false);
      setAutoSnap(readAutoBackup());
      try {
        setLastSyncAt(localStorage.getItem("vision2-sync-at") ?? "");
      } catch {
        /* ignore */
      }
    }
  };

  // open the profile popover from anywhere (e.g. leaderboard CTA)
  useEffect(() => {
    const handler = () => openPopover(true);
    window.addEventListener("open-profile", handler);
    return () => window.removeEventListener("open-profile", handler);
  }, [userName, avatarColor]);

  const isActive = (item: { key: string }) => {
    if (item.key === "home") return view.type === "home" || view.type === "lesson";
    return view.type === item.key;
  };

  const saveProfile = () => {
    const name = nameDraft.trim();
    if (name.length < 2) return;
    setProfile(name, colorDraft);
    const userId = ensureUserId();
    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, color: colorDraft }),
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setOpen(false), 900);
  };

  const handleExport = () => {
    const ok = exportProgress();
    toast(
      ok
        ? { title: "✓ پشتیبان دانلود شد", description: "فایل JSON پیشرفت شما ذخیره شد — آن را جایی امن نگه دارید.", duration: 3500 }
        : { title: "خطا در پشتیبان‌گیری", description: "لطفاً دوباره تلاش کنید.", duration: 3000 }
    );
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const payload = parseBackup(text);
      const sum = backupSummary(payload);
      if (applyBackup(payload)) {
        toast({
          title: "✓ پشتیبان بازیابی شد",
          description: `${faNum(sum.known)} واژه، ${faNum(sum.results)} نتیجه و ${faNum(sum.srs)} واژهٔ SRS بازیابی می‌شود…`,
          duration: 2500,
        });
        setTimeout(() => window.location.reload(), 900);
      } else {
        throw new Error("اعمال پشتیبان روی حافظهٔ مرورگر ناموفق بود.");
      }
    } catch (err) {
      toast({
        title: "فایل پشتیبان نامعتبر",
        description: err instanceof Error ? err.message : "فایل انتخاب‌شده قابل خواندن نیست.",
        duration: 4000,
      });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleAutoRestore = () => {
    if (!autoSnap) return;
    const sum = backupSummary({ app: "vision2-webbook", version: 1, exportedAt: autoSnap.savedAt, data: autoSnap.data });
    if (restoreAutoBackup()) {
      toast({
        title: "✓ پشتیبان خودکار بازیابی شد",
        description: `${faNum(sum.known)} واژه و ${faNum(sum.results)} نتیجه از پشتیبان ${autoBackupAgeFa(autoSnap.savedAt)} برمی‌گردد…`,
        duration: 2500,
      });
      setTimeout(() => window.location.reload(), 900);
    } else {
      toast({ title: "بازیابی ناموفق", description: "پشتیبان خودکار قابل خواندن نیست.", duration: 3000 });
    }
  };

  // ------------------- F3 learner-code sync -------------------

  const markSynced = (iso?: string) => {
    const at = iso ?? new Date().toISOString();
    try {
      localStorage.setItem("vision2-sync-at", at);
    } catch {
      /* ignore */
    }
    setLastSyncAt(at);
  };

  const handleCreateCode = async () => {
    setSyncing("create");
    const res = await pushSync(null);
    setSyncing("");
    if (res.ok && res.code) {
      setSyncCode(res.code);
      markSynced(res.updatedAt);
      toast({
        title: "✓ کد یادگیرنده ساخته شد",
        description: `کد تو «${res.code}» است — روی هر دستگاهی که واردش کنی، پیشرفتت همان‌جا هم هست.`,
        duration: 5000,
      });
    } else {
      toast({ title: "همگام‌سازی ناموفق", description: res.error ?? "دوباره تلاش کن.", duration: 3500 });
    }
  };

  const handlePushNow = async () => {
    if (!syncCode) return;
    setSyncing("push");
    const res = await pushSync(syncCode);
    setSyncing("");
    if (res.ok) {
      markSynced(res.updatedAt);
      toast({ title: "✓ روی ابر به‌روز شد", description: "آخرین وضعیت پیشرفت روی سرور ذخیره شد.", duration: 2500 });
    } else {
      toast({ title: "همگام‌سازی ناموفق", description: res.error ?? "دوباره تلاش کن.", duration: 3500 });
    }
  };

  const handlePullMerge = async (codeForJoin?: string) => {
    const code = codeForJoin ?? syncCode;
    setSyncing(codeForJoin ? "join" : "pull");
    const res = await fetchSync(code);
    if (!res.ok || !res.data) {
      setSyncing("");
      toast({ title: "بازیابی ناموفق", description: res.error ?? "دوباره تلاش کن.", duration: 3500 });
      return;
    }
    const merged = mergeSyncData(collectData(), res.data);
    if (applyMergedSnapshot(merged)) {
      if (codeForJoin) setSyncCode(normalizeCode(codeForJoin));
      markSynced(res.updatedAt);
      toast({
        title: "✓ پیشرفت ادغام شد",
        description: "هیچ چیزی از دست نرفته — بهترین وضعیت هر واژه از هر دو دستگاه حفظ می‌شود…",
        duration: 3000,
      });
      setTimeout(() => window.location.reload(), 900);
    } else {
      setSyncing("");
      toast({ title: "ادغام ناموفق", description: "ذخیره روی حافظهٔ مرورگر انجام نشد.", duration: 3500 });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(syncCode);
      toast({ title: "✓ کد کپی شد", description: "آن را جایی امن نگه دار — کلید پیشرفتت است.", duration: 2500 });
    } catch {
      toast({ title: "کپی نشد", description: `کد را دستی یادداشت کن: ${syncCode}`, duration: 4000 });
    }
  };

  const handleDisconnect = () => {
    setSyncCode("");
    toast({
      title: "همگام‌سازی قطع شد",
      description: "پیشرفتِ همین دستگاه حذف نشد؛ کد سرور هم باقی می‌ماند و می‌توانی دوباره واردش کنی.",
      duration: 3500,
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#f7f6f2]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <button
          onClick={goHome}
          className="flex items-center gap-2.5 text-right transition-opacity hover:opacity-80"
          aria-label="رفتن به صفحهٔ اصلی"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-md shadow-emerald-900/20">
            <BookOpen size={20} />
          </span>
          <span className="hidden leading-tight min-[420px]:block">
            <span className="block text-[15px] font-extrabold text-stone-800">
              ویژن ۲ <span className="en-text text-emerald-700">Vision Two</span>
            </span>
            <span className="hidden text-[11px] text-stone-500 sm:block">
              وب‌کتاب تعاملی زبان یازدهم
            </span>
          </span>
        </button>

        <div className="flex min-w-0 items-center gap-1">
          {/* streak flame */}
          {mounted && streak > 0 && (
            <span
              className="mr-1 hidden items-center gap-1 rounded-full border border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50 px-2.5 py-1.5 text-[12px] font-black text-amber-700 sm:inline-flex"
              title={`زنجیرهٔ ${faNum(streak)} روزه مطالعه`}
            >
              <Flame size={14} className="streak-flame" />
              {faNum(streak)}
            </span>
          )}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-all hover:text-amber-500 hover:border-amber-200 active:scale-90"
            aria-label={isDark ? "حالت روشن" : "حالت شب"}
            title={isDark ? "حالت روشن" : "حالت شب"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* settings hub (TTS speed / font size / motion / daily goal) */}
          <SettingsPopover />

          {/* keyboard shortcuts guide */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-shortcuts"))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-all hover:text-emerald-600 hover:border-emerald-200 active:scale-90"
            aria-label="راهنمای میان‌برهای کیبورد"
            title="راهنمای میان‌برهای کیبورد (؟)"
          >
            <Keyboard size={16} />
          </button>

          {/* profile avatar + popover */}
          <Popover open={open} onOpenChange={openPopover}>
            <PopoverTrigger asChild>
              <button
                className="ml-1 flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-2.5 transition-all hover:border-emerald-300 hover:shadow-sm active:scale-95"
                aria-label="پروفایل من"
                title="پروفایل من"
              >
                {mounted && userName ? (
                  <>
                    <span className="hidden max-w-[90px] truncate text-[12px] font-extrabold text-stone-700 sm:block">
                      {userName}
                    </span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black text-white shadow-md ${avatarClasses[avatarColor] ?? avatarClasses.emerald}`}
                    >
                      {userName.trim().charAt(0)}
                    </span>
                  </>
                ) : (
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-stone-300 text-stone-400`}
                  >
                    <User size={14} />
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 rounded-2xl border-stone-200 p-4">
              <div className="mb-3">
                <h3 className="text-sm font-extrabold text-stone-800">پروفایل یادگیرنده</h3>
                <p className="mt-0.5 text-[11.5px] leading-5 text-stone-500">
                  نام خود را وارد کنید تا در جدول امتیازات کلاس و فید فعالیت دیده شوید.
                </p>
              </div>
              <input
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                placeholder="مثلاً: امیر محمد"
                maxLength={24}
                className="mb-3 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-800 outline-none transition-colors placeholder:font-normal placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="mb-4">
                <div className="mb-2 text-[11.5px] font-bold text-stone-500">رنگ آواتار:</div>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColorDraft(c);
                        setSaved(false);
                      }}
                      aria-label={`رنگ ${c}`}
                      className={`h-8 w-8 rounded-full shadow-md transition-all ${avatarClasses[c]} ${
                        colorDraft === c
                          ? "scale-110 ring-2 ring-stone-700 ring-offset-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={saveProfile}
                disabled={nameDraft.trim().length < 2}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saved ? "✓ ذخیره شد!" : "ذخیرهٔ پروفایل"}
              </button>

              {/* ------------------- progress backup ------------------- */}
              <div className="mt-4 border-t border-stone-200 pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold text-stone-500">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  پشتیبان‌گیری پیشرفت
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-[12px] font-bold text-stone-700 transition-all hover:border-emerald-300 hover:text-emerald-700 active:scale-95"
                  >
                    <Download size={14} />
                    دانلود پشتیبان
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={importing}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-[12px] font-bold text-stone-700 transition-all hover:border-amber-300 hover:text-amber-700 active:scale-95 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {importing ? "در حال خواندن…" : "بازیابی پشتیبان"}
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => handleImportFile(e.target.files?.[0])}
                />
                {/* auto-backup snapshot status */}
                {autoSnap ? (
                  <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                      <History size={13} className="shrink-0 text-emerald-600" />
                      <span>
                        پشتیبان خودکار: {autoBackupAgeFa(autoSnap.savedAt)}
                        <span className="mx-1 font-normal text-emerald-700/70">
                          ({faNum(Object.values(autoSnap.data.known).filter(Boolean).length)} واژه)
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={handleAutoRestore}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[10.5px] font-black text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                      title="بازگرداندن آخرین پشتیبان خودکار مرورگر"
                    >
                      <RotateCcw size={11} />
                      بازیابی
                    </button>
                  </div>
                ) : (
                  <div className="mt-2.5 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-2.5 py-2 text-[10.5px] leading-4 text-stone-400">
                    با اولین فعالیت شما، هر روز یک پشتیبان خودکار در همین مرورگر ذخیره می‌شود — حتی اگر داده‌ها پاک شوند قابل بازیابی است.
                  </div>
                )}
                <p className="mt-2 text-[10.5px] leading-4 text-stone-400">
                  پیشرفت شما (واژه‌ها، نتایج، مرورها) در یک فایل JSON ذخیره می‌شود؛ برای انتقال به دستگاه دیگر از «بازیابی» استفاده کنید.
                </p>
              </div>

              {/* ------------------- F3 learner-code sync ------------------- */}
              <div className="mt-4 border-t border-stone-200 pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold text-stone-500">
                  <Laptop size={13} className="text-emerald-600" />
                  همگام‌سازی بین دستگاه‌ها
                  <span className="mr-auto rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-black text-emerald-700">جدید</span>
                </div>

                {syncCode ? (
                  /* ---------- attached to a cloud code ---------- */
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span dir="ltr" className="font-mono text-[15px] font-black tracking-[0.12em] text-emerald-800">
                        {syncCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[10.5px] font-black text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                        title="کپی کد"
                      >
                        <Copy size={11} />
                        کپی
                      </button>
                    </div>
                    {lastSyncAt && (
                      <div className="mt-1 text-[10px] font-bold text-emerald-700/70">
                        آخرین همگام‌سازی: {autoBackupAgeFa(lastSyncAt)}
                      </div>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={handlePushNow}
                        disabled={syncing !== ""}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-2 py-2 text-[11px] font-black text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
                      >
                        <CloudUpload size={13} />
                        {syncing === "push" ? "در حال ارسال…" : "به‌روزرسانی ابری"}
                      </button>
                      <button
                        onClick={() => handlePullMerge()}
                        disabled={syncing !== ""}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-2 py-2 text-[11px] font-black text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
                      >
                        <CloudDownload size={13} />
                        {syncing === "pull" ? <RefreshCw size={12} className="animate-spin" /> : "بازیابی از ابر"}
                      </button>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-stone-400 transition-colors hover:text-rose-500"
                    >
                      <Link2Off size={11} />
                      قطع همگام‌سازی این دستگاه
                    </button>
                  </div>
                ) : (
                  /* ---------- no code yet: create or join ---------- */
                  <div>
                    <p className="mb-2 text-[10.5px] leading-4 text-stone-400">
                      پیشرفتت را بین گوشی و رایانه یکی کن: یک کد بساز و روی هر دستگاهی واردش کن — بدون ثبت‌نام.
                    </p>
                    <button
                      onClick={handleCreateCode}
                      disabled={syncing !== ""}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-[12px] font-black text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                    >
                      <CloudUpload size={14} />
                      {syncing === "create" ? "در حال ساخت کد…" : "ساخت کد یادگیرنده"}
                    </button>
                    <div className="mt-2 flex gap-1.5">
                      <input
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && looksLikeCode(codeInput) && handlePullMerge(codeInput)}
                        placeholder="کد موجود، مثل K7QM-34XP"
                        dir="ltr"
                        maxLength={9}
                        className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-left font-mono text-[12px] font-black tracking-wider text-stone-800 outline-none transition-colors placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        onClick={() => handlePullMerge(codeInput)}
                        disabled={!looksLikeCode(codeInput) || syncing !== ""}
                        className="shrink-0 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11.5px] font-black text-emerald-700 transition-all hover:bg-emerald-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {syncing === "join" ? "…" : "ورود با کد"}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-4 text-stone-400">
                      با «ورود با کد»، پیشرفتِ ابر و همین دستگاه با هم ادغام می‌شود — هیچ‌کدام از دست نمی‌رود.
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto nice-scroll" aria-label="ناوبری اصلی">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.key}
                  onClick={() => setView(item.view)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/20"
                      : "text-stone-600 hover:bg-stone-200/70"
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
