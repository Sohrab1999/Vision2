"use client";

import { User, Download, Upload, ShieldCheck, History, RotateCcw, Laptop, CloudUpload, CloudDownload, Copy, Link2Off, RefreshCw, BookmarkCheck, Play, Trash2, Route, ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useStudy, AVATAR_COLORS, AVATAR_COLOR_LABELS } from "@/lib/study-store";
import { avatarClasses } from "@/lib/study-theme";
import { sendProfile } from "@/lib/identity";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { useFreshBadges } from "@/hooks/use-fresh-badges";
import NewBadgeDot from "./new-badge-dot";
import { exportProgress, parseBackup, applyBackup, backupSummary, readAutoBackup, restoreAutoBackup, autoBackupAgeFa, collectData } from "@/lib/backup";
import { trackEvent } from "@/lib/analytics";
import { pushSync, fetchSync, mergeSyncData, applyMergedSnapshot, normalizeCode, looksLikeCode } from "@/lib/sync";
import { adoptResumeIfAbsent, appendixHistoryServerSnapshot, appendixHistorySnapshot, appendixResumeServerSnapshot, appendixResumeSnapshot, clearAppendixResume, clearAppendixResumeHistory, subscribeAppendixHistory, subscribeAppendixResume, APPENDIX_SCOPE_LABELS, type AppendixResumeItem } from "@/lib/bg-reading";
import { useAppendixResumeNav } from "../shared/use-appendix-resume-nav";
import { useToast } from "@/hooks/use-toast";
import { RESUME_FOCUS_RING } from "@/lib/study-theme";
import { RESUME_LOOP_DOORS, DOOR_HANDOFF_DELAY_MS, doorShortName, focusHeaderDoor, openAppendixDoor, type ResumeLoopDoor } from "@/lib/resume-loop-doors";
import { JUMP_VS_WRITE_FA } from "@/lib/bg-reading";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ------------------------------------------------------------------
// پروفایل یادگیرنده — دکمهٔ آواتار در هدر + پاپ‌اُور کامل آن:
// نام/رنگ، پشتیبان‌گیری محلی (دستی + خودکار مرورگر) و همگام‌سازی
// بین‌دستگاهی با کد یادگیرنده (F3). از header.tsx جدا شد (گام ۷.۲-ج).
// رویداد «open-profile» پنجره این نما را از هر جا باز می‌کند
// (جدول امتیازات، تنظیمات و…).
// ------------------------------------------------------------------

export default function ProfilePopover() {
  const userName = useStudy((s) => s.userName);
  const avatarColor = useStudy((s) => s.avatarColor);
  const setProfile = useStudy((s) => s.setProfile);
  // راند ۲۷۷ — نام‌گذاریِ دیرهنگام: کاربرِ «رد کردن»-کرده بی‌نام می‌ماند و
  // تا امروز هیچ لایه‌ای دوباره دعوتش نمی‌کرد؛ حالا دکمهٔ trigger و
  // متنِ پاپ‌آور و دکمهٔ ذخیره حالتِ بی-نامی را صادقانه می‌گویند.
  const ANON_PROFILE_HINT =
    "پروفایل من — هنوز ناشناسی؛ با انتخابِ نام در جدول امتیازات دیده می‌شوی";
  const syncCode = useStudy((s) => s.syncCode);
  const setSyncCode = useStudy((s) => s.setSyncCode);
  // راند ۲۴۵ — مینی‌کارتِ درهایِ حلقه: ناوبریِ درها + گِیتِ درِ هدر (رویِ ضمیمه مستور است)
  const setView = useStudy((s) => s.setView);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const view = useStudy((s) => s.view);
  const mounted = useMounted();
  const named = Boolean(mounted && userName);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  // قهرمان‌سازیِ دستاورد (Task 82) — نشان‌های تازه → حلقهٔ طلایی + نقطهٔ شمارنده
  const freshBadges = useFreshBadges();
  const hasFresh = freshBadges.length > 0;

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

  // راند ۲۳۷ — رکوردِ «ادامهٔ مطالعه» با storeِ خارجیِ r231 واکنشی می‌آید:
  // پاپ‌اُور باز است و کاربر در ضمیمه می‌خواند؟ رکوردِ تازه همان‌جا حاضر است.
  const resumeItem = useSyncExternalStore(
    subscribeAppendixResume,
    appendixResumeSnapshot,
    appendixResumeServerSnapshot,
  );
  // راند ۲۳۷ — تاریخچهٔ «ادامه»ها (بندِ ③ پیشنهادِ ۲۳۶): چند رکوردِ آخر،
  // دستگاه‌محلی — با snapshotِ جدا اما همان ایدئومِ storeِ خارجی.
  const resumeHistory = useSyncExternalStore(
    subscribeAppendixHistory,
    appendixHistorySnapshot,
    appendixHistoryServerSnapshot,
  );
  const navigateResume = useAppendixResumeNav();

  // تاریخچه بدونِ خودِ رکوردِ فعلی (که بالا نمایش دارد) — پرشِ چیپ، رکورد را عوض نمی‌کند.
  const recentHistory = resumeHistory.filter(
    (h) => !(resumeItem && h.scope === resumeItem.scope && h.id === resumeItem.id),
  );

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

  const saveProfile = () => {
    const name = nameDraft.trim();
    if (name.length < 2) return;
    // r278 — the anonymous→named transition is the payoff moment of the
    // deferred invitation: until the first activity the name appears nowhere
    // (leaderboard rows and feed entries both require activity), so the toast
    // must promise visibility HONESTLY — deferred to the first activity.
    const firstNaming = !named;
    setProfile(name, colorDraft);
    // Phase-0: signed profile update (server-side claim for legacy rows too)
    sendProfile({ name, color: colorDraft }).catch(() => {});
    setSaved(true);
    if (firstNaming) {
      toast({
        title: "✓ نامت ثبت شد",
        description: `با اولین فعالیتت، «${name}» در جدول امتیازات کلاس و فید فعالیت دیده میشود.`,
        duration: 5000,
      });
    }
    setTimeout(() => setOpen(false), 900);
  };

  const handleExport = () => {
    const ok = exportProgress();
    if (ok) trackEvent("backup_export");
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
      trackEvent("sync_link");
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
      // راند ۲۳۶ — رکوردِ «ادامهٔ مطالعه»ی ابری با پذیرش-اگر-غایب: دستگاهِ
      // بی‌رکورد نشانگرِ ابری را می‌گیرد (دستگاهِ نو = «ادامه» هم می‌آید)؛
      // دستگاهِ رکورددار «آخرینِ دیده‌شدهٔ» خودش را نگه می‌دارد.
      if (res.resume) adoptResumeIfAbsent(res.resume);
      if (codeForJoin) setSyncCode(normalizeCode(codeForJoin));
      markSynced(res.updatedAt);
      trackEvent("sync_restore");
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

  // ------------------- راند ۲۳۷ — کنترلِ «ادامهٔ مطالعه» -------------------

  // پنجمین درِ کوچک: از خودِ پروفایل هم می‌شود به همان‌جا رفت — پاپ‌اُور اول
  // بسته می‌شود تا ناوبری زیرِ آن گم نشود. صفرِ نوشتنِ استور (قراردادِ قلابِ r236).
  const handleResumeGo = () => {
    if (!resumeItem) return;
    setOpen(false);
    navigateResume(resumeItem);
  };

  /** پرش به یک ورودیِ تاریچه — پرش، «آخرینِ دیده‌شده» را عوض نمی‌کند
   * (نوشتن فقط با کنشِ واقعیِ خواندن در خودِ لایه‌ها انجام می‌شود). */
  const handleHistoryGo = (item: AppendixResumeItem) => {
    setOpen(false);
    navigateResume(item);
  };

  const handleResumeClear = () => {
    clearAppendixResume();
    toast({
      title: "ادامهٔ مطالعه پاک شد",
      description: "نشانگرِ آخرین موضوع برداشته شد — با نخستین دیدنِ بعدی در ضمیمه دوباره ساخته می‌شود.",
      duration: 3000,
    });
  };

  const handleHistoryClear = () => {
    clearAppendixResumeHistory();
    toast({
      title: "تاریخچهٔ ادامه‌ها پاک شد",
      description: "فقط فهرستِ «اخیراً» برداشته شد — نشانگرِ «ادامهٔ مطالعه» سرِ جایش است.",
      duration: 2500,
    });
  };

  // ------------------- راند ۲۴۵ — مینی‌کارتِ درهایِ حلقه (بندِ ② پیشنهادِ ۲۴۴) -------------------

  // «فهرستِ زنده» مصرفِ سومش را گرفت: بلوکِ پروفایل هم ردیف‌هایِ «ادامه» را
  // از RESUME_LOOP_DOORS می‌شناسد — درِ نو یک سطرِ داده است، نه یک ردیفِ دستی.
  // درِ خودِ پروفایل حذف است (اینجا ایستاده‌ای — فرمانِ باز کردنِ پروفایل از
  // درونِ پروفایل کنشِ ساختگی است) و درِ هدر رویِ خودِ ضمیمه غیبِ صادقانه
  // (نشانگرِ سرِ صفحه همان در است — همان ایدئومِ پالتِ r244). رکورد همیشه
  // هست (بخش با رکورد رندر می‌شود) پس گِیتِ بی‌رکوردِ درِ هدر اینجا معنا ندارد.
  const doorRows = RESUME_LOOP_DOORS.filter(
    (d) =>
      d.id !== "profile" &&
      (d.action.kind !== "focus-header" || view.type !== "appendix"),
  );

  // تایمرِ تحویلِ درهایِ فوکوس‌بر (فرمان‌یاب/هدر) — ایدئومِ راهنمایِ r243:
  // پاپ‌اُورِ بسته‌شونده فوکوس را به فراخوانش برمی‌گرداند؛ dispatchِ هم‌زمان
  // فوکوسِ تازه‌وارد را می‌دزدد. با خودِ کامپوننت تمیز شود.
  const handoffRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
    };
  }, []);

  const runDoorAction = (door: ResumeLoopDoor) => {
    const a = door.action;
    setOpen(false);
    if (a.kind === "goto-home") {
      setView({ type: "home" });
      return;
    }
    if (a.kind === "goto-appendix") {
      // راند ۲۴۶ — helperِ مشترکِ درِ ضمیمه: رویدادِ زنده رویِ خودِ ضمیمه،
      // پرچمِ یک‌بارمصرف + ناوبری از جای دیگر (منطقِ رفت در یک نقطه).
      openAppendixDoor(setView, view.type === "appendix");
      return;
    }
    if (a.kind === "goto-results") {
      // راند ۲۴۶ — درِ ششم: تبِ تست‌های درسِ حاضر، وگرنه درسِ اول.
      openLessonTab(view.type === "lesson" ? view.id : 1, "tests");
      return;
    }
    if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
    handoffRef.current = window.setTimeout(() => {
      handoffRef.current = null;
      if (a.kind === "open-palette") {
        window.dispatchEvent(new CustomEvent("open-command-palette"));
      } else if (a.kind === "focus-header") {
        focusHeaderDoor();
      }
    }, DOOR_HANDOFF_DELAY_MS);
  };

  return (
    <Popover open={open} onOpenChange={openPopover}>
      {/* suppressHydrationWarning: Radix emits aria-controls={useId()} on the
          trigger unconditionally; under dev hydration the client's useId
          positional encoding can drift from the byte-stable server id
          (~50% of multi-navigation sessions) — harmless, self-heals on
          open, but pollutes the console-0 QA bar. See the long NOTE in
          settings-popover.tsx (2026-10-13) for the full forensics. */}
      <PopoverTrigger asChild>
        <button
          suppressHydrationWarning
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border c-card py-1 pl-1 pr-2.5 transition-[background-color,color,border-color,box-shadow,transform] hover:border-emerald-300 hover:shadow-sm active:scale-[0.96]"
          aria-label={named ? "پروفایل من" : ANON_PROFILE_HINT}
          title={named ? "پروفایل من" : ANON_PROFILE_HINT}
        >
          {named ? (
            <>
              <span className="hidden max-w-[90px] truncate text-[12px] font-extrabold text-stone-700 sm:block">
                {userName}
              </span>
              <span className="relative">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black text-white shadow-md ${avatarClasses[avatarColor] ?? avatarClasses.emerald}${
                    hasFresh
                      ? " new-badge-ring ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent"
                      : ""
                  }`}
                >
                  {userName.trim().charAt(0)}
                </span>
                <NewBadgeDot />
              </span>
            </>
          ) : (
            <span className="relative">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-stone-300 text-stone-500${
                  hasFresh
                    ? " new-badge-ring ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent"
                    : ""
                }`}
              >
                <User size={14} />
              </span>
              <NewBadgeDot />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-2xl border-stone-200 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-extrabold text-stone-800">پروفایل یادگیرنده</h3>
          <p className="mt-0.5 text-[11.5px] leading-5 text-stone-500">
            {named
              ? "نام خود را وارد کنید تا در جدول امتیازات کلاس و فید فعالیت دیده شوید."
              : "هنوز ناشناسی — با انتخابِ یک نام در جدول امتیازات کلاس و فید فعالیت دیده می‌شوی."}
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
          className="mb-3 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-800 outline-none transition-colors placeholder:font-normal placeholder:text-stone-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                aria-label={`رنگ ${AVATAR_COLOR_LABELS[c]}`}
                className={`h-11 w-11 rounded-full shadow-md transition-[background-color,color,border-color,box-shadow,transform,opacity] ${avatarClasses[c]} ${
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
          className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-[background-color,color,border-color,transform,opacity] hover:bg-emerald-700 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saved ? "✓ ذخیره شد!" : named ? "ذخیرهٔ پروفایل" : "شروع با این نام"}
        </button>

        {/* ------------------- ادامهٔ مطالعه (راند ۲۳۷) ------------------- */}
        {resumeItem && (
          <div className="mt-4 border-t border-stone-200 pt-3" data-testid="profile-resume-section">
            <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold text-stone-500">
              <BookmarkCheck size={13} className="text-emerald-600" />
              ادامهٔ مطالعه
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[11.5px] font-black text-emerald-800">
                  «{resumeItem.title}»
                </span>
                <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">
                  {APPENDIX_SCOPE_LABELS[resumeItem.scope]}
                </span>
              </div>
              {resumeItem.hint && (
                <div className="mt-0.5 truncate text-[10px] font-bold text-emerald-700/70">
                  {resumeItem.hint}
                </div>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleResumeGo}
                  className={`inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-[10.5px] font-black text-white transition-[background-color,color,border-color,transform] hover:bg-emerald-700 active:scale-[0.96] ${RESUME_FOCUS_RING}`}
                  title="رفتن به همان‌جا در ضمیمه"
                >
                  <Play size={11} className="shrink-0" />
                  ادامه
                </button>
                <button
                  onClick={handleResumeClear}
                  data-testid="profile-resume-clear"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-[10.5px] font-black text-stone-600 transition-[background-color,color,border-color,transform] hover:border-rose-200 hover:text-rose-600 active:scale-[0.96]"
                  title="برداشتنِ نشانگرِ ادامهٔ مطالعه"
                >
                  <Trash2 size={11} className="shrink-0" />
                  پاک‌کردن
                </button>
              </div>
              <p className="mt-1.5 text-[9.5px] leading-4 text-stone-500">
                آخرین چیزی که در ضمیمه دیدی — کلیکِ راست روی دکمهٔ «ادامه» در هدر هم پاکش می‌کند.
              </p>
            </div>
            {recentHistory.length > 0 && (
              <div className="mt-2.5 border-t border-emerald-100 pt-2" data-testid="profile-resume-history">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-black text-stone-500">
                    <History size={11} className="text-emerald-600" />
                    اخیراً در ضمیمه
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] font-black text-stone-600">
                      {faNum(recentHistory.length)}
                    </span>
                  </span>
                  <button
                    onClick={handleHistoryClear}
                    data-testid="profile-history-clear"
                    className="inline-flex shrink-0 items-center gap-0.5 rounded-md px-1 py-0.5 text-[9.5px] font-bold text-stone-500 transition-colors hover:text-rose-500"
                    title="فقط فهرستِ «اخیراً» پاک می‌شود؛ نشانگرِ «ادامهٔ مطالعه» می‌ماند"
                  >
                    <Trash2 size={10} />
                    پاک‌کردن
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {recentHistory.map((h) => (
                    <button
                      key={`${h.scope}:${h.id}`}
                      onClick={() => handleHistoryGo(h)}
                      data-testid={`profile-history-item-${h.scope}-${h.id}`}
                      className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border border-stone-100 bg-transparent px-2.5 py-1.5 text-right transition-[background-color,color,border-color,transform] hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.96] dark:hover:bg-emerald-900/30 ${RESUME_FOCUS_RING}`}
                    >
                      <span className="min-w-0 flex-1 truncate text-[10.5px] font-bold text-stone-700">
                        «{h.title}»
                      </span>
                      <span className="shrink-0 text-[9px] font-bold text-stone-500">
                        {APPENDIX_SCOPE_LABELS[h.scope]}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[9px] leading-4 text-stone-500">
                  {JUMP_VS_WRITE_FA}
                </p>
              </div>
            )}
            {doorRows.length > 0 && (
              /* راند ۲۴۵ ② — مینی‌کارتِ درهایِ حلقه از RESUME_LOOP_DOORS:
                 حلقه فقط «اخیراً» و تاریخچه نیست — از کجاها می‌شود برگشت؟
                 همان دادهٔ راهنما/پالت، سبکِ فشرده؛ درِ نو خودش می‌آید. */
              <div
                className="mt-2.5 border-t border-emerald-100 pt-2"
                data-testid="profile-resume-doors"
              >
                <div className="mb-1.5 flex items-center gap-1 text-[10px] font-black text-stone-500">
                  <Route size={11} className="shrink-0 text-emerald-600" />
                  حلقهٔ «ادامهٔ مطالعه» — درهای دیگر
                </div>
                <div className="flex flex-col gap-0.5">
                  {doorRows.map((door) => (
                    <button
                      key={door.id}
                      onClick={() => runDoorAction(door)}
                      title={door.openLabel}
                      data-testid={`profile-resume-door-${door.id}`}
                      className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-lg bg-transparent px-2 py-1 text-right transition-[background-color,color] hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200 ${RESUME_FOCUS_RING}`}
                    >
                      <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-stone-600">
                        <span className="text-emerald-700 dark:text-emerald-300">درِ {doorShortName(door)}</span>
                        {" — "}
                        {door.openLabel}
                      </span>
                      <ChevronLeft size={11} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[9px] leading-4 text-stone-500">
                  کلیک روی هر ردیف، همان در را باز می‌کند.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------- progress backup ------------------- */}
        <div className="mt-4 border-t border-stone-200 pt-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-bold text-stone-500">
            <ShieldCheck size={13} className="text-emerald-600" />
            پشتیبان‌گیری پیشرفت
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-[12px] font-bold text-stone-700 transition-[background-color,color,border-color,transform] hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.96]"
            >
              <Download size={14} />
              دانلود پشتیبان
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-[12px] font-bold text-stone-700 transition-[background-color,color,border-color,transform,opacity] hover:border-amber-300 hover:text-amber-700 active:scale-[0.96] disabled:opacity-50"
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
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[10.5px] font-black text-emerald-700 transition-[background-color,color,border-color,transform] hover:bg-emerald-100 active:scale-[0.96]"
                title="بازگرداندن آخرین پشتیبان خودکار مرورگر"
              >
                <RotateCcw size={11} />
                بازیابی
              </button>
            </div>
          ) : (
            <div className="mt-2.5 rounded-xl border border-dashed border-stone-200 c-stone-60 px-2.5 py-2 text-[10.5px] leading-4 text-stone-500">
              با اولین فعالیت شما، هر روز یک پشتیبان خودکار در همین مرورگر ذخیره می‌شود — حتی اگر داده‌ها پاک شوند قابل بازیابی است.
            </div>
          )}
          <p className="mt-2 text-[10.5px] leading-4 text-stone-500">
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
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[10.5px] font-black text-emerald-700 transition-[background-color,color,border-color,transform] hover:bg-emerald-100 active:scale-[0.96]"
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-2 py-2 text-[11px] font-black text-emerald-700 transition-[background-color,color,border-color,transform,opacity] hover:bg-emerald-100 active:scale-[0.96] disabled:opacity-50"
                >
                  <CloudUpload size={13} />
                  {syncing === "push" ? "در حال ارسال…" : "به‌روزرسانی ابری"}
                </button>
                <button
                  onClick={() => handlePullMerge()}
                  disabled={syncing !== ""}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-2 py-2 text-[11px] font-black text-emerald-700 transition-[background-color,color,border-color,transform,opacity] hover:bg-emerald-100 active:scale-[0.96] disabled:opacity-50"
                >
                  <CloudDownload size={13} />
                  {syncing === "pull" ? <RefreshCw size={12} className="animate-spin" /> : "بازیابی از ابر"}
                </button>
              </div>
              <button
                onClick={handleDisconnect}
                className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-stone-500 transition-colors hover:text-rose-500"
              >
                <Link2Off size={11} />
                قطع همگام‌سازی این دستگاه
              </button>
            </div>
          ) : (
            /* ---------- no code yet: create or join ---------- */
            <div>
              <p className="mb-2 text-[10.5px] leading-4 text-stone-500">
                پیشرفتت را بین گوشی و رایانه یکی کن: یک کد بساز و روی هر دستگاهی واردش کن — بدون ثبت‌نام.
              </p>
              <button
                onClick={handleCreateCode}
                disabled={syncing !== ""}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-[12px] font-black text-white transition-[background-color,color,border-color,transform,opacity] hover:bg-emerald-700 active:scale-[0.96] disabled:opacity-50"
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
                  className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-left font-mono text-[12px] font-black tracking-wider text-stone-800 outline-none transition-colors placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={() => handlePullMerge(codeInput)}
                  disabled={!looksLikeCode(codeInput) || syncing !== ""}
                  className="shrink-0 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[11.5px] font-black text-emerald-700 transition-[background-color,color,border-color,transform,opacity] hover:bg-emerald-50 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {syncing === "join" ? "…" : "ورود با کد"}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-stone-500">
                با «ورود با کد»، پیشرفتِ ابر و همین دستگاه با هم ادغام می‌شود — هیچ‌کدام از دست نمی‌رود.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
