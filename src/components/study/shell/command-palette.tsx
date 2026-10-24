"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  BookOpenText,
  CalendarClock,
  ClipboardCheck,
  Ear,
  FileBadge,
  GraduationCap,
  Headphones,
  History,
  Home,
  Keyboard,
  Library,
  ListChecks,
  MessageSquareText,
  Moon,
  PenLine,
  Route,
  School,
  Search,
  SearchX,
  Settings,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Swords,
  Target,
  UserCog,
  Zap,
  BarChart3,
  Play,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useStudy, type LessonTab } from "@/lib/study-store";
import { trackEvent } from "@/lib/analytics";
import { libraryProgress } from "@/lib/library-progress";
import { lessonResumeSnapshot, useLessonResume } from "@/lib/lesson-resume";
import { RETURN_CLUSTER_DOORS, returnCmdId } from "@/lib/return-cluster-doors";
// r372 — پرشِ فرمانِ «داشبورد مرور»: کتابخانهٔ دامنه مالکِ پرش و پرچم است
// (تک‌منبع با چیپهایِ r371) — پالت فقط پرنده است (درسِ r243/r244).
import { requestSrsSpotlight, focusSrsDashboard, hasProgressOf } from "@/lib/srs-due";
import { LESSONS_META, TOTAL_VOCABULARY } from "@/data/lesson-meta";
import { faNum } from "@/lib/study-theme";
import {
  COMMAND_GROUPS,
  commandFromParamId,
  expandParameterized,
  faDigits,
  filterCommands,
  lessonTabCommands,
  mergeRecent,
  parseLessonTabId,
  parseParamCommandId,
  type CommandDef,
} from "@/lib/command-palette";
import {
  EXAM_TIMED_KEY,
  KONKUR_TIMED_KEY,
  writeCountPrefill,
  writeFlagPrefill,
} from "@/lib/nav-prefill";
import {
  readAppendixResume,
  readAppendixResumeHistory,
  APPENDIX_SCOPE_LABELS,
  type AppendixResumeItem,
} from "@/lib/bg-reading";
import {
  RESUME_LOOP_DOORS,
  DOOR_HANDOFF_DELAY_MS,
  doorCmdId,
  doorShortName,
  focusHeaderDoor,
  openAppendixDoor,
} from "@/lib/resume-loop-doors";
import { useAppendixResumeNav } from "../shared/use-appendix-resume-nav";
import { Kbd } from "./shortcut-guide";

// راند ۲۴۱ — «مسیرهای اخیر» در فرمان‌یاب (بندِ ① پیشنهادِ ۲۴۰): هشتمین درِ
// حلقهٔ «ادامهٔ مطالعه». سقفِ ۴ مثلِ پنلِ هدرِ r240 — پروفایل مالکِ همهٔ ۸تاست،
// این فقط پرشِ سریعِ همین‌جاست.
const RESUME_RECENTS_CAP = 4;
const RESUME_RECENT_PREFIX = "resume-recent-";

// شناسهٔ خودکفای مسیرِ اخیر: scope و id داخلِ خودِ شناسهٔ فرمان سفر می‌کنند
// (جداکنندهٔ %7C — «|» در خروجیِ encodeURIComponent هرگز باقی نمی‌ماند) تا
// اجرا با خودِ ورودیِ تاریخچه داوری شود، نه با ایندکسیِ شکننده که بازنویسیِ
// تاریخچه در فاصلهٔ باز-تا-اجرا ردیف را به مقصدِ دیگری می‌فرستد.
const resumeRecentCmdId = (h: { scope: string; id: string }): string =>
  `${RESUME_RECENT_PREFIX}${encodeURIComponent(h.scope)}%7C${encodeURIComponent(h.id)}`;

const parseResumeRecentCmdId = (id: string): { scope: string; id: string } | null => {
  if (!id.startsWith(RESUME_RECENT_PREFIX)) return null;
  const rest = id.slice(RESUME_RECENT_PREFIX.length);
  const sep = rest.indexOf("%7C");
  if (sep < 0) return null;
  try {
    const scope = decodeURIComponent(rest.slice(0, sep));
    const entryId = decodeURIComponent(rest.slice(sep + 3));
    if (!scope || !entryId) return null;
    return { scope, id: entryId };
  } catch {
    return null; // شناسهٔ خراب — مثلِ شناسهٔ ناشناخته هیچ
  }
};

// ------------------------------------------------------------------
// فرمان‌یاب (Task 66) — پنجرهٔ «جست‌وجوی همه‌جا» با Ctrl+K.
// باز شدن: کلید ترکیبی Ctrl/Cmd+K (روی هر چیدمانی — با e.code) یا
// رویداد پنجره‌ای «open-command-palette» (دکمهٔ هدر/فوتر). موتورِ
// جست‌وجو خالص است (lib/command-palette.ts) و نتیجه‌ها گروه‌بندی و
// با کیبورد (↑↓/Enter) هم قابل اجرا هستند. سطح‌ها همه از خانوادهٔ
// توکن-محور (سنگ‌آلفا) تا در دارک خودبه‌خود تیره شوند + پچ‌های
// انتخابی هم‌خانوادهٔ shortcuts-dialog در globals.css.
// ------------------------------------------------------------------

const ICONS: Record<string, React.ElementType> = {
  Home,
  BookMarked,
  CalendarClock,
  ClipboardCheck,
  Library,
  Route,
  School,
  GraduationCap,
  History,
  Star,
  Sparkles,
  Headphones,
  BookOpen,
  BookOpenText,
  MessageSquareText,
  PenLine,
  Ear,
  ListChecks,
  Zap,
  Swords,
  BarChart3,
  FileBadge,
  Keyboard,
  Sun,
  Moon,
  Target,
  Settings,
  UserCog,
  Smartphone,
  Play,
};

// ------------------------------------------------------------------
// فرمان‌های عمق‌دار (Task 67) — ثابت‌اند؛ بیرون از کامپوننت ساخته
// می‌شوند تا در هر رندر دوباره نسازند. ۳ درس × ۸ = ۲۴ فرمان.
// ------------------------------------------------------------------
const DEEP_COMMANDS: CommandDef[] = lessonTabCommands(LESSONS_META);

const RECENTS_KEY = "vision2-cmd-recent";
const RECENTS_CAP = 5;

function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const setView = useStudy((s) => s.setView);
  const goHome = useStudy((s) => s.goHome);
  const openLesson = useStudy((s) => s.openLesson);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const view = useStudy((s) => s.view); // راند ۲۴۴ — گِیتِ درِ هدر (رویِ ضمیمه مستور است)
  const lessonTab = useStudy((s) => s.lessonTab);
  // راند ۳۶۸ — گیتهایِ زندهٔ درهایِ خانه — همان گیتِ کارتهایِ خانه
  // (r297: گاردِ ?? بیرونِ سلکتور)
  const lessonRec = useLessonResume();
  const konkurSeen = useStudy((s) => s.konkurSeen) ?? {};
  const duelHistory = useStudy((s) => s.duelHistory) ?? [];
  const libraryDone = useStudy((s) => s.libraryDone) ?? {};
  // راند ۳۷۲ — گیتِ صادقانهٔ فرمانِ «داشبورد مرور»: عینِ hasProgressِ
  // خانه (home-view r297 — گاردِ ?? بیرونِ سلکتور): پنل فقط برایِ
  // یادگیرندهٔ دارایِ پیشرفت رندر میشود؛ فرمان هم فقط برایِ او هست —
  // بیپیشرفت هیچ فرمانِ ساختگی (صداقتِ r236).
  const known = useStudy((s) => s.known) ?? {};
  const results = useStudy((s) => s.results) ?? {};
  const srsMap = useStudy((s) => s.srs) ?? {};
  // عینِ hasProgressِ home-view (هم‌ارزِ semantics، یک قرارداد):
  // هر پیشرفتِ واقعی — بلدم/آزمون/srs/کتابخانه — پنل را زنده میکند
  // و فرمانِ پالت را هم.
  // r381 — گیت از موتورِ تکمنبعِ srs-due میخواند (نسخهٔ موازیِ محلی ممنوع)
  const hasProgress = hasProgressOf(known, results, srsMap, libraryDone);
  // راند ۲۳۶ — مسیرِ فرمانِ «ادامهٔ مطالعه» از قلابِ مشترکِ سه‌دره
  const navigateResume = useAppendixResumeNav();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // «آخرین فرمان‌ها» — فقط در رویدادهای اجرا به‌روز می‌شود (نه در اثر)
  const [recentIds, setRecentIds] = useState<string[]>(loadRecents);
  const rememberRecent = (id: string) => {
    const next = mergeRecent(loadRecents(), id, RECENTS_CAP);
    try {
      window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      /* حالت خصوصی مرورگر — نادیده */
    }
    setRecentIds(next);
  };

  // Ctrl/Cmd+K — چرخه‌ایِ باز/بسته؛ با e.code تا روی چیدمان فارسی هم کار کند
  // (ریست پرس‌وجو/انتخاب همین‌جا در رویداد — نه داخل اثر)
  // راند ۲۳۵ — هر باز شدن، رکوردِ «ادامهٔ مطالعه» هم همان‌جا خوانده می‌شود
  // (خواندنِ localStorage در رویداد = بدونِ اثر، بدونِ سطحِ هیدریشن).
  const [resumeItem, setResumeItem] = useState<AppendixResumeItem | null>(null);
  // راند ۲۴۴ — تایمرِ تحویلِ درِ هدر با خودِ کامپوننت تمیز شود (ایدئومِ راهنمایِ r243)
  const handoffRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
    };
  }, []);
  // راند ۲۴۱ — تاریخچه در رویدادهایِ باز شدن خوانده می‌شود (بدونِ اثر،
  // بدونِ سطحِ هیدریشن — همان قراردادِ خواندنِ رکوردِ r235).
  const [resumeHistory, setResumeHistory] = useState<AppendixResumeItem[]>([]);
  const togglePalette = () => {
    setOpen((v) => !v);
    setQuery("");
    setSelected(0);
    setResumeItem(readAppendixResume());
    setResumeHistory(readAppendixResumeHistory());
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.code === "KeyK") {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // باز شدن از دکمه‌های هدر/فوتر
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setQuery("");
      setSelected(0);
      setResumeItem(readAppendixResume());
      setResumeHistory(readAppendixResumeHistory());
    };
    window.addEventListener("open-command-palette", handler);
    return () => window.removeEventListener("open-command-palette", handler);
  }, []);

  // هر باز شدن: فوکوس روی ورودی (ریست‌ها در رویدادهای باز کردن انجام شده‌اند)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // راند ۲۳۵ — فرمانِ «ادامهٔ مطالعه» (بندِ ② پیشنهادِ ۲۳۴): فقط وقتی
  // رکوردی هست فرمانی هست — هیچ فرمانِ ساختگیِ بی‌مقصد. اولین فرمانِ
  // ناوبری می‌شود تا ورودِ سریعِ کیبوردی باشد (در نمای خالی هم دیده می‌شود).
  const resumeCmd: CommandDef | null = useMemo(() => {
    if (!resumeItem) return null;
    const layer = APPENDIX_SCOPE_LABELS[resumeItem.scope];
    return {
      id: "nav-resume",
      label: "ادامهٔ مطالعه",
      group: "ناوبری",
      hint: `از «${resumeItem.title}» در ${layer}${resumeItem.hint ? ` — ${resumeItem.hint}` : ""}`,
      keywords: ["resume", "bookmark", "ادامه", "آخرین دیده‌شده", "ضمیمه", layer],
    } satisfies CommandDef;
  }, [resumeItem]);

  // راند ۲۴۱ — «مسیرهای اخیر» (بندِ ① پیشنهادِ ۲۴۰): فرمانِ «ادامهٔ مطالعه»
  // (r235) حالا جست‌وجوپذیر می‌شود و ورودی‌هایِ اخیرِ تاریخچه هم سوارِ همان
  // جست‌وجو می‌آیند. همان قراردادهایِ هر شش درِ قبلی: خودِ رکوردِ فعلی از
  // فهرست حذف است (فرمانِ اصلی همان را می‌برد — بدونِ ردیفِ تکراری)،
  // بی‌تاریخچه = هیچ گروهی (شمارشِ ۳۱تاییِ Task 79 دست‌نخورده)، و شناسهٔ
  // خودکفا نه ایندکسی — اجرا با خودِ ورودی داوری می‌شود.
  const resumeRecentCmds: CommandDef[] = useMemo(() => {
    const others = resumeHistory.filter(
      (h) => !(resumeItem && resumeItem.scope === h.scope && resumeItem.id === h.id),
    );
    return others.slice(0, RESUME_RECENTS_CAP).map((h) => ({
      id: resumeRecentCmdId(h),
      label: h.title,
      group: "ادامه‌های اخیر",
      hint: `${APPENDIX_SCOPE_LABELS[h.scope]} · مسیرِ اخیر`,
      keywords: ["ادامه", "اخیر", "recent", "history", APPENDIX_SCOPE_LABELS[h.scope], h.title],
    }));
  }, [resumeItem, resumeHistory]);

  // راند ۲۴۴ — «درهای حلقه» در فرمان‌یاب (بندِ ① پیشنهادِ ۲۴۳): دومین مصرفِ
  // فهرستِ زندهٔ RESUME_LOOP_DOORS — فرمانِ پرش به محلِ هر در؛ درِ نو = یک
  // سطرِ داده، نه یک فرمانِ دستی. قراردادها:
  //   • درِ فرمان‌یاب خودش حذف است — فرمانِ «باز کردنِ فرمان‌یاب» از درونِ
  //     فرمان‌یاب، کنشِ ساختگی است (صداقتِ r236: بی‌مقصد = هیچ).
  //   • درِ هدر فقط با رکورد و بیرونِ ضمیمه حاضر است (قراردادِ r236/r240:
  //     بی‌رکورد یا مستوریِ ضمیمه هیچ فرمانِ ساختگی نمی‌خواهد — پالت هم مثل
  //     راهنما «غیبتِ صادقانه» دارد نه ردیفِ بی‌کنش).
  //   • برچسب از خودِ داده («درِ « + lead بدونِ »:») و hint = openLabel —
  //     همان چیزی که اجرا می‌کند.
  const doorCmds: CommandDef[] = useMemo(() => {
    return RESUME_LOOP_DOORS.filter((d) => d.id !== "palette")
      .filter((d) => d.action.kind !== "focus-header" || (resumeItem && view.type !== "appendix"))
      .map((d) => ({
        id: doorCmdId(d.id),
        // راند ۲۴۵ — اشتقاقِ نام از doorShortName (یک اشتقاق، یک منبع —
        // همان helperِ مینی‌کارتِ پروفایل)؛ برایِ درهایِ leadدار همان
        // «درِ هدر/خانه/ضمیمه/پروفایل»ِ قبل است.
        label: `درِ ${doorShortName(d)}`,
        group: "درهای حلقه",
        hint: d.openLabel,
        keywords: [d.id, "door", "حلقه", d.text],
      }));
  }, [resumeItem, view.type]);

  // راند ۳۶۸ — «درهای خانه» در فرمان‌یاب (بندِ ④ پیشنهادِ r367): چهارمین مصرفِ
  // فهرستِ زندهٔ RETURN_CLUSTER_DOORS — فرمانِ پرشِ همان‌جایی که کارتِ خانه
  // میپرد، نه فقط خانه. قراردادها:
  //   • درِ ضمیمه در پالت نیست — فرمانش از قبل هست (nav-resume r235 + درِ
  //     خانه r244)؛ دو گویش نباید دو فرمان شوند (قراردادِ palette:null).
  //   • گیتِ هر در = گیتِ واقعیِ کارتش (r236: بی‌رکورد هیچ فرمانِ ساختگی).
  //   • رویِ خودِ دنیا هم مستور است — «ادامهٔ کنکور» وسطِ جلسه یعنی remount
  //     و سوختنِ جلسه؛ غیبتِ صادقانه هم‌زمان محافظِ جلسه است. درس فقط
  //     رویِ نقطهٔ دقیقِ رزومه مستور است — از درسِ دیگر پرش به مقصدِ رزومه
  //     همچنان معنادار است.
  //   • برچسب از خودِ داده (palette.label = عنوانِ کارت) و hint = متنِ در.
  const returnCmds: CommandDef[] = useMemo(() => {
    const lessonResumePoint =
      view.type === "lesson" && lessonRec != null && view.id === lessonRec.lesson && lessonTab === lessonRec.tab;
    const gates: Record<string, boolean> = {
      lesson: lessonRec != null && !lessonResumePoint,
      reading: libraryProgress(libraryDone).doneCount > 0 && view.type !== "library",
      konkur: Object.keys(konkurSeen).length > 0 && view.type !== "konkur",
      duel: duelHistory.length > 0 && view.type !== "duel",
    };
    return RETURN_CLUSTER_DOORS.filter((d) => d.palette && gates[d.id]).map((d) => ({
      id: returnCmdId(d.id),
      label: d.palette!.label,
      group: "درهای خانه",
      hint: d.text,
      keywords: [d.id, "بازگشت", "خانه", d.label, d.text],
    }));
  }, [view, lessonTab, lessonRec, konkurSeen, duelHistory, libraryDone]);

  const baseCommands: CommandDef[] = useMemo(
    () => [
      ...(resumeCmd ? [resumeCmd] : []),
      ...resumeRecentCmds,
      // ── ناوبری ──
      { id: "nav-home", label: "خانه", group: "ناوبری", hint: "برگشت به جلد کتاب", keywords: ["home", "bookshelf"] },
      { id: "nav-dictionary", label: "دیکشنری واژگان", group: "ناوبری", hint: `جست‌وجوی ${faNum(TOTAL_VOCABULARY)}+ واژه`, keywords: ["dictionary", "vocab", "لغت", "culture"] },
      { id: "nav-exam", label: "آزمون جامع", group: "ناوبری", hint: "ارزیابی پایانی کتاب", keywords: ["exam", "final test"] },
      { id: "nav-appendix", label: "ضمیمهٔ کتاب", group: "ناوبری", hint: "افعال بی‌قاعده و آواها", keywords: ["appendix", "irregular verbs", "ipa"] },
      { id: "nav-grammar", label: "متروی گرامر", group: "ناوبری", hint: "نقشهٔ سفر گرامر کتاب", keywords: ["grammar", "metro", "map"] },
      { id: "nav-konkur", label: "گوشهٔ کنکور", group: "ناوبری", hint: "بانک ۳۶۰ تستی با پاسخ تشریحی", keywords: ["konkur", "question bank", "entrance"] },
      // Task 73: برچسب صادقانه — مقصد این فرمان نمای «مرور سریع قبل امتحان» است
      // (بانک غلط‌ها)، نه داشبورد SRS (که بخشی از خانه است)؛ واژه‌نامهٔ SRS به
      // فرمان‌های lesson-smart-<n> و nav-smart منتقل شد.
      { id: "nav-review", label: "مرور سریع خطاها", group: "ناوبری", hint: "بانک غلط‌های اخیر — مرور قبل امتحان", keywords: ["review", "mistakes", "مرور خطا"] },
      { id: "nav-my-words", label: "واژه‌های من", group: "ناوبری", hint: "نشان‌شده‌ها و وضعیت یادگیری", keywords: ["my words", "starred", "favorites"] },
      { id: "nav-library", label: "کتاب‌خانهٔ داستان‌ها", group: "ناوبری", hint: "داستان‌های کلاسیک Hill در سه سطح", keywords: ["library", "stories", "hill", "reading", "کتاب", "داستان"] },
      { id: "nav-teacher", label: "پنل معلم", group: "ناوبری", hint: "فهرست کلاس — فقط با کد دسترسی", keywords: ["teacher", "panel", "class", "معلم", "کلاس", "فهرست", "گزارش"] },
      { id: "nav-smart", label: "تمرین هوشمند", group: "ناوبری", hint: "دور ترکیبی متناسب با تو", keywords: ["smart practice", "mixed"] },
      { id: "nav-listen", label: "آموخته‌های شنیداری", group: "ناوبری", hint: "تمرین گوش و روخوانی", keywords: ["listen", "audio", "ear"] },
      // راند ۳۷۲ — بندِ ④ پیشنهادِ r371: داشبوردِ مرور هم واردِ فرمان‌یاب
      // میشود — پرشِ همان‌جایی که کنشِ مرور زندگی میکند (نه فرمانِ مرورِ
      // ساختگی؛ عینِ قراردادِ چیپهایِ r371). گیت = hasProgressِ خانه؛
      // رویِ خودِ خانه هم پیداست — پنل زیرِ خطِ لبه است و پرش همان‌جا
      // معنادار (دقیقاً مثلِ چیپهایِ کارتِ خطر).
      ...(hasProgress
        ? [{ id: "nav-srs-dashboard", label: "داشبورد مرور هوشمند", group: "ناوبری", hint: "سررسیدها، نردبان حافظه و پیش‌بینی هفت‌روزه", keywords: ["srs", "review", "dashboard", "مرور", "سررسید", "داشبورد", "حافظه", "فراموشی"] }]
        : []),
      // راند ۲۴۴ — درهایِ حلقه بعد از بلوکِ ناوبری: در تساویِ امتیازِ جست‌وجو،
      // مقصدِ اصلی (مثل «ضمیمهٔ کتاب») از ترتیبِ آرایه اول می‌آید — گروه‌بندیِ
      // نمایش به ترتیبِ COMMAND_GROUPS است و به این ترتیب کاری ندارد.
      ...doorCmds,
      // راند ۳۶۸ — درهایِ خانه بعد از درهایِ حلقه: خوشهٔ پنجدرهایِ خانه
      // در پالت هم زنده — با گیتِ صادقِ خودِ کارتها.
      ...returnCmds,
      // ── درس‌ها ──
      ...LESSONS_META.map((l) => ({
        id: `lesson-${l.id}`,
        label: `درس ${faDigits(l.id)} — ${l.titleFa}`,
        group: "درس‌ها",
        hint: `${l.vocabCount} واژه · ${l.quizCount} تست`,
        keywords: [l.titleEn.toLowerCase(), `lesson ${l.id}`],
      })),
      // ── تمرین و چالش ──
      { id: "act-rush", label: "چالش برق‌آسا", group: "تمرین و چالش", hint: "تست ۶۰ ثانیه‌ای + دیکتهٔ برق‌آسا", keywords: ["rush", "spell", "60", "sprint"] },
      { id: "act-duel", label: "نبرد دودنفره", group: "تمرین و چالش", hint: "دودل زندهٔ دو نفره و تاریخچهٔ نبردها", keywords: ["duel", "live", "opponent", "history"] },
      // ── گزارش‌ها ──
      { id: "rep-report", label: "کارنامهٔ پیشرفت", group: "گزارش‌ها", hint: "گزارش حرفی و هفته‌نامه", keywords: ["report", "progress", "weekly"] },
      { id: "rep-official", label: "گزارش رسمی چاپی", group: "گزارش‌ها", hint: "برای معلم و والدین", keywords: ["official", "print", "teacher"] },
      // ── ابزارها ──
      {
        id: "tool-theme",
        label: isDark ? "حالت روشن" : "حالت شب",
        group: "ابزارها",
        hint: "تغییر پوستهٔ کتاب",
        keywords: ["dark", "light", "theme", "night", "پوسته"],
      },
      { id: "tool-shortcuts", label: "راهنمای میان‌برهای کیبورد", group: "ابزارها", hint: "همهٔ کلیدهای میان‌بر", keywords: ["shortcuts", "keyboard", "hotkeys"] },
      // ── میان‌برهای زیرپنل (Task 69) ──
      { id: "tool-settings", label: "تنظیمات وب‌کتاب", group: "ابزارها", hint: "سرعت روخوانی، اندازهٔ متن، کاهش حرکت", keywords: ["settings", "تنظیمات"] },
      { id: "tool-profile", label: "پروفایل و پشتیبان", group: "ابزارها", hint: "نام، رنگ، پشتیبان‌گیری و سینک ابری", keywords: ["profile", "backup", "sync", "پروفایل", "ذخیره"] },
      { id: "tool-install", label: "نصب روی دستگاه", group: "ابزارها", hint: "وب‌کتاب مثل اپ — آفلاین و تمام‌صفحه", keywords: ["install", "pwa", "نصب", "اپلیکیشن"] },
    ],
    [isDark, resumeCmd, resumeRecentCmds, doorCmds, returnCmds, hasProgress],
  );

  // کلیدواژهٔ ناوبری برای همهٔ فرمان‌ها (جست‌وجو) + نگاشت شناسه برای «اخیر»
  // + فرمان‌های پارامتریِ متناظر با پرس‌وجو («آزمون ۲۰» → آزمون جامع ۲۰ سؤالی)
  const commands: CommandDef[] = useMemo(
    () => [...baseCommands, ...DEEP_COMMANDS, ...expandParameterized(query)],
    [baseCommands, query],
  );

  const recentCmds: CommandDef[] = useMemo(() => {
    if (!recentIds.length) return [];
    const byId = new Map(commands.map((c) => [c.id, c] as const));
    // فرمان پارامتری در نمای خالی در لیست نیست — از شناسه‌اش بازسازی می‌شود
    return recentIds
      .map((id) => byId.get(id) ?? commandFromParamId(id))
      .filter((c): c is CommandDef => Boolean(c));
  }, [recentIds, commands]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // نمای خالی: «اخیر» + فرمان‌های سطح‌بالا (فرمان‌های عمق‌دار با جست‌وجو می‌آیند)
      const rest = baseCommands.filter((c) => !recentIds.includes(c.id));
      return recentCmds.length ? [...recentCmds.map((c) => ({ ...c, group: "اخیر" })), ...rest] : rest;
    }
    return filterCommands(commands, query, 12);
  }, [baseCommands, commands, recentCmds, recentIds, query]);

  // گروه‌بندی نتیجه‌ها با ترتیب ثابت گروه‌ها؛ «اخیر» همیشه اول
  const grouped = useMemo(() => {
    const buckets = new Map<string, CommandDef[]>();
    for (const cmd of filtered) {
      const list = buckets.get(cmd.group) ?? [];
      list.push(cmd);
      buckets.set(cmd.group, list);
    }
    const known = COMMAND_GROUPS.filter((g) => buckets.has(g));
    const rest = [...buckets.keys()].filter((g) => !COMMAND_GROUPS.includes(g as never));
    const out = [...known, ...rest].map((g) => ({ group: g, items: buckets.get(g)! }));
    const ri = out.findIndex((g) => g.group === "اخیر");
    if (ri > 0) out.unshift(...out.splice(ri, 1));
    return out;
  }, [filtered]);

  const run = (cmd: CommandDef | undefined) => {
    if (!cmd) return;
    setOpen(false);
    // راند ۲۴۱ — فرمان‌های مسیرِ اخیر خودشان «اخیر»اند؛ در نوارِ «اخیر»
    // ذخیره نمی‌شوند (پنل هر بار از تاریخچهٔ واقعی ساخته می‌شود).
    if (!cmd.id.startsWith(RESUME_RECENT_PREFIX)) rememberRecent(cmd.id);
    switch (cmd.id) {
      case "nav-home":
        goHome();
        break;
      case "nav-dictionary":
        setView({ type: "dictionary" });
        break;
      case "nav-exam":
        setView({ type: "exam" });
        break;
      case "nav-appendix":
        setView({ type: "appendix" });
        break;
      case "nav-resume": {
        // راند ۲۳۵/۲۳۶ — مقصد از snapshotِ لحظهٔ اجرا خوانده می‌شود (نه لحظهٔ
        // باز شدن) تا همیشه «آخرینِ واقعی» برود. رکورد در فاصلهٔ باز شدن تا
        // اجرا پاک شده باشد = هیچ جابه‌جاییِ ساختگی — فرمانِ بی‌مقصد هیچ کار
        // نمی‌کند (صداقتِ رفتاری).
        const r = readAppendixResume();
        if (r) navigateResume(r);
        break;
      }
      case "nav-grammar":
        setView({ type: "grammar" });
        break;
      case "nav-konkur":
        setView({ type: "konkur" });
        break;
      case "nav-review":
        setView({ type: "review" });
        break;
      case "nav-my-words":
        setView({ type: "my-words" });
        break;
      case "nav-library":
        setView({ type: "library" });
        break;
      case "nav-teacher":
        setView({ type: "teacher" });
        break;
      case "nav-smart":
        setView({ type: "smart" });
        break;
      case "nav-listen":
        setView({ type: "listen" });
        break;
      // راند ۳۷۲ — فرمانِ «داشبورد مرور هوشمند»: چهارمین مصرفِ تابعِ
      // پرشِ focusSrsDashboard (بعدِ پل و چیپهایِ ردیفِ کارتِ خطر —
      // r371). دو مسیرِ رسیدن:
      //   • از دنیایِ دیگر: پرچمِ یک‌بارمصرف + ناوبری — پنل بعد از mount
      //     پرچم را مصرف میکند و میپرد (سکونِ چیدمان در خودِ پنل؛ ایدئومِ
      //     نشانگرِ ضمیمه، r246). رویدادِ تحلیلیِ نو ندارد — پرش، کنشِ
      //     یادگیری نیست (رجیستری ۵۲؛ قراردادِ r368 برایِ درهایِ خانه).
      //   • رویِ خودِ خانه: پرشِ زنده بعد از دورهٔ تحویلِ فوکوسِ پالت
      //     (درسِ r243 — FocusScopeِ بستهشونده فوکوس را پس میگیرد) —
      //     ایدئومِ درِ هدر، عیناً.
      //   • بیپنل (بیپیشرفت): فرمان اصلاً در پالت نیست (گیتِ hasProgress)
      //     — و اگر در فاصلهٔ باز-تا-اجرا چیزی عوض شود، focusSrsDashboard
      //     خودش هیچ و false (صداقتِ r236).
      case "nav-srs-dashboard": {
        if (view.type !== "home") {
          requestSrsSpotlight();
          setView({ type: "home" });
        } else {
          if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
          handoffRef.current = window.setTimeout(() => {
            handoffRef.current = null;
            focusSrsDashboard();
          }, DOOR_HANDOFF_DELAY_MS);
        }
        break;
      }
      // راند ۲۴۴ — درهایِ حلقه (بندِ ① پیشنهادِ ۲۴۳): ناوبری‌ها فوری‌اند
      // (بی‌تعارضِ فوکوس)؛ درِ هدر فوکوس‌بر است و بعد از دورهٔ تحویلِ
      // DOOR_HANDOFF_DELAY_MS اجرا می‌شود (درسِ r243 — FocusScopeِ پالتِ
      // بسته‌شونده فوکوس را پس می‌گیرد)؛ اجرا با خودِ دکمه داوری می‌شود —
      // رکورد در فاصلهٔ باز-تا-اجرا پاک شده باشد = هیچ (صداقتِ nav-resume).
      case "door-home":
        goHome();
        break;
      case "door-appendix":
        // راند ۲۴۶ — helperِ مشترک: رویدادِ زندهٔ نشانگر رویِ خودِ ضمیمه،
        // پرچمِ یک‌بارمصرف + ناوبری از جای دیگر (منطقِ رفت در یک نقطه).
        openAppendixDoor(setView, view.type === "appendix");
        break;
      case "door-results":
        // راند ۲۴۶ — درِ ششم: تبِ تست‌های درسِ حاضر، وگرنه درسِ اول.
        openLessonTab(view.type === "lesson" ? view.id : 1, "tests");
        break;
      case "door-profile":
        window.dispatchEvent(new CustomEvent("open-profile"));
        break;
      case "door-header":
        if (handoffRef.current !== null) window.clearTimeout(handoffRef.current);
        handoffRef.current = window.setTimeout(() => {
          handoffRef.current = null;
          focusHeaderDoor();
        }, DOOR_HANDOFF_DELAY_MS);
        break;
      // راند ۳۶۸ — درهایِ خانه: پرشِ همان‌جایی که کارتِ خانه میپرد.
      // رکوردِ درس در لحظهٔ اجرا دوباره خوانده میشود (صداقتِ nav-resume:
      // پاکشده در فاصلهٔ باز-تا-اجرا = هیچ جابه‌جاییِ ساختگی)؛ رویدادِ
      // lesson_open با همان معنایِ کارتِ خانه (r361: پرشِ رزومه = بازکردنِ
      // واقعیِ درس) — ولی بدونِ رویدادِ نو در رجیستری (۵۲ میماند)؛
      // کنکور/میدان/کتابخانه بی‌رویداد — konkur_start/duel_start مالِ
      // جلسهٔ واقعیاند، بازکردنِ نما رویداد ندارد (قراردادِ r364).
      case "return-lesson": {
        const rec = lessonResumeSnapshot();
        if (rec) {
          trackEvent("lesson_open"); // همان معنایِ کارتِ خانه — بازکردنِ واقعیِ درس
          openLessonTab(rec.lesson, rec.tab);
        }
        break;
      }
      case "return-reading":
        setView({ type: "library" });
        break;
      case "return-konkur":
        setView({ type: "konkur" });
        break;
      case "return-duel":
        setView({ type: "duel" });
        break;
      case "act-rush":
        setView({ type: "rush" });
        break;
      case "act-duel":
        setView({ type: "duel" });
        break;
      case "rep-report":
        window.dispatchEvent(new CustomEvent("open-report"));
        break;
      case "rep-official":
        window.dispatchEvent(new CustomEvent("open-official-report"));
        break;
      case "tool-theme":
        setTheme(isDark ? "light" : "dark");
        break;
      case "tool-shortcuts":
        window.dispatchEvent(new CustomEvent("open-shortcuts"));
        break;
      case "tool-settings":
        window.dispatchEvent(new CustomEvent("open-settings"));
        break;
      case "tool-profile":
        window.dispatchEvent(new CustomEvent("open-profile"));
        break;
      case "tool-install":
        window.dispatchEvent(new CustomEvent("install-app"));
        break;
      default: {
        // راند ۲۴۱ — پرش به مسیرِ اخیر: dispatch در لحظهٔ اجرا تاریخچهٔ واقعی
        // را دوباره می‌خواند و با شناسهٔ خودکفا داوری می‌کند — ورودیِ حذف‌شده
        // در فاصلهٔ باز-تا-اجرا = هیچ جابه‌جاییِ ساختگی (همان صداقتِ nav-resume
        // در r235). مقصد از قلابِ مشترکِ r236 می‌رود — پرش ≠ نوشتن.
        if (cmd.id.startsWith(RESUME_RECENT_PREFIX)) {
          const ref = parseResumeRecentCmdId(cmd.id);
          const target = ref
            ? readAppendixResumeHistory().find(
                (h) => h.scope === ref.scope && h.id === ref.id,
              )
            : null;
          if (target) navigateResume(target);
          break;
        }
        // ── فرمان‌های پارامتری (Task 69) ──
        // آزمون جامع N سؤالی: prefill در sessionStorage می‌نشیند (نمای lazy
        // رویداد را از دست می‌دهد) + رویداد برای وقتی که نما همین حالا باز است
        if (cmd.id.startsWith("exam-count-")) {
          const p = parseParamCommandId(cmd.id);
          if (p) {
            writeCountPrefill("vision2-exam-prefill", p.n);
            if (p.timing !== null) writeFlagPrefill(EXAM_TIMED_KEY, p.timing === "timed");
            setView({ type: "exam" });
            window.dispatchEvent(
              new CustomEvent("open-exam-with", {
                detail: p.timing ? { count: p.n, timed: p.timing === "timed" } : { count: p.n },
              })
            );
          }
          break;
        }
        if (cmd.id.startsWith("konkur-count-")) {
          const p = parseParamCommandId(cmd.id);
          if (p) {
            writeCountPrefill("vision2-konkur-prefill", p.n);
            if (p.timing !== null) writeFlagPrefill(KONKUR_TIMED_KEY, p.timing === "timed");
            setView({ type: "konkur" });
            window.dispatchEvent(
              new CustomEvent("open-konkur-with", {
                detail: p.timing ? { count: p.n, timed: p.timing === "timed" } : { count: p.n },
              })
            );
          }
          break;
        }
        if (cmd.id.startsWith("daily-goal-")) {
          const n = Number(cmd.id.slice("daily-goal-".length));
          if ([5, 10, 15].includes(n)) useStudy.getState().setDailyGoal(n); // فوری — بدون جابه‌جایی
          break;
        }
        if (cmd.id.startsWith("smart-count-")) {
          // تمرین هوشمند N سؤالی (Task 74) — هم‌الگوی آزمون/کنکور: prefill برای
          // نمای lazy + رویداد برای نمای همین‌حالا-باز؛ تمرین هوشمند بی‌تایمر
          // است پس صفت زمان ندارد (پارسر چنین شناسه‌ای را null می‌دهد).
          const p = parseParamCommandId(cmd.id);
          if (p) {
            writeCountPrefill("vision2-smart-prefill", p.n);
            setView({ type: "smart" });
            window.dispatchEvent(new CustomEvent("open-smart-with", { detail: { count: p.n } }));
          }
          break;
        }
        if (cmd.id.startsWith("lesson-smart-")) {
          // فلش‌کارت هوشمند درس — مثل فرمان خودِ درس، رویداد lesson_open می‌سازد
          const id = Number(cmd.id.slice("lesson-smart-".length));
          if (LESSONS_META.some((l) => l.id === id)) openLesson(id, "smart");
          break;
        }
        // فرمان عمق‌دار تب درس — بدون رویداد قیفی، مثل ناوبری ارزان
        const lt = parseLessonTabId(cmd.id);
        if (lt && LESSONS_META.some((l) => l.id === lt.lesson)) {
          openLessonTab(lt.lesson, lt.tab as LessonTab);
        }
      }
    }
  };

  // ایندکس انتخاب امن مشتق‌شده — وقتی نتیجه‌ها کم می‌شوند بدون اثر کلمپ می‌شود
  const sel = filtered.length ? Math.min(selected, filtered.length - 1) : 0;

  // ردیف فعال همیشه در دید
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selected, query]);

  const flatIdxOf = (groupIdx: number, itemIdx: number) =>
    grouped.slice(0, groupIdx).reduce((acc, g) => acc + g.items.length, 0) + itemIdx;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="command-palette gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500" />
        <DialogTitle className="sr-only">فرمان‌یاب</DialogTitle>
        <DialogDescription className="sr-only">
          جست‌وجو میان همهٔ صفحه‌ها و ابزارهای کتاب و اجرای سریع فرمان‌ها
        </DialogDescription>

        {/* ورودی جست‌وجو */}
        <div className="flex items-center gap-2.5 border-b border-stone-200/70 px-4 py-3">
          <Search size={18} className="shrink-0 text-emerald-600" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((s) => (filtered.length ? (s + 1) % filtered.length : 0));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((s) =>
                  filtered.length ? (s - 1 + filtered.length) % filtered.length : 0,
                );
              } else if (e.key === "Enter") {
                e.preventDefault();
                run(filtered[sel]);
              }
            }}
            role="combobox"
            aria-expanded={filtered.length > 0}
            aria-controls="command-palette-list"
            aria-activedescendant={filtered[sel] ? `cp-opt-${sel}` : undefined}
            aria-label="جست‌وجوی فرمان‌ها"
            placeholder="برو به… (آزمون ۲۰، تمرین هوشمند ۱۵، هدف ۱۰، شب)"
            className="min-w-0 flex-1 rounded-lg bg-transparent text-[15px] font-bold text-stone-800 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            autoComplete="off"
            spellCheck={false}
          />
          <Kbd>Esc</Kbd>
        </div>

        {/* نتیجه‌ها */}
        <div
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          aria-label="فرمان‌ها"
          className="nice-scroll max-h-[46vh] overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                <SearchX size={22} />
              </span>
              <p className="text-[13.5px] font-extrabold text-stone-800">فرمانی یافت نشد</p>
              <p className="text-[11.5px] font-bold text-stone-500">
                «آزمون ۲۰ بدون زمان»، «واژگان درس ۲» یا «دیکشنری» را امتحان کن
              </p>
            </div>
          ) : (
            grouped.map((g, gi) => (
              <div key={g.group} role="group" aria-label={g.group}>
                <div className="flex items-center gap-1.5 px-2 pb-1 pt-2.5 text-[10.5px] font-black tracking-wide text-stone-500">
                  <span>{g.group}</span>
                  <span className="rounded-full bg-stone-100 px-1.5 text-[9.5px] font-bold text-stone-500">
                    {faNum(g.items.length)}
                  </span>
                </div>
                {g.items.map((cmd, ii) => {
                  const idx = flatIdxOf(gi, ii);
                  const active = idx === sel;
                  const Icon = ICONS[cmdIconKey(cmd.id, isDark)] ?? BookOpen;
                  return (
                    <motion.button
                      key={cmd.id}
                      id={`cp-opt-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      data-active={active || undefined}
                      onClick={() => run(cmd)}
                      onMouseEnter={() => setSelected(idx)}
                      whileTap={{ scale: 0.985 }}
                      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-right transition-colors ${
                        active ? "bg-stone-200/70" : "bg-transparent"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active ? "bg-emerald-700 text-white shadow-sm shadow-emerald-900/20" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-extrabold text-stone-800">
                          {cmd.label}
                        </span>
                        {cmd.hint && (
                          <span className="block truncate text-[11px] font-bold text-stone-500">
                            {cmd.hint}
                          </span>
                        )}
                      </span>
                      {active && (
                        <span className="shrink-0 rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                          Enter ↵
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* راهنمای کلیدها */}
        <div className="flex items-center justify-between border-t border-stone-200/70 px-4 py-2 text-[10.5px] font-bold text-stone-500">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> حرکت
            <span className="mx-1 text-stone-500">·</span>
            <Kbd>Enter</Kbd> اجرا
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> هر جا باز می‌شود
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// نگاشت شناسهٔ فرمان → کلید آیکون (خارج از رندر برای خوانایی)
function cmdIconKey(id: string, isDark: boolean): string {
  switch (id) {
    case "nav-home":
      return "Home";
    case "nav-resume":
      return "Play";
    case "nav-dictionary":
      return "BookMarked";
    case "nav-exam":
      return "ClipboardCheck";
    case "nav-appendix":
      return "Library";
    case "nav-grammar":
      return "Route";
    case "nav-konkur":
      return "GraduationCap";
    case "nav-review":
      return "History";
    case "nav-my-words":
      return "Star";
    case "nav-library":
      return "BookOpen";
    case "nav-teacher":
      return "School";
    case "nav-srs-dashboard":
      return "CalendarClock";
    case "nav-smart":
      return "Sparkles";
    case "nav-listen":
      return "Headphones";
    case "act-rush":
      return "Zap";
    case "act-duel":
      return "Swords";
    case "rep-report":
      return "BarChart3";
    case "rep-official":
      return "FileBadge";
    case "tool-theme":
      return isDark ? "Sun" : "Moon";
    case "tool-shortcuts":
      return "Keyboard";
    case "tool-settings":
      return "Settings";
    case "tool-profile":
      return "UserCog";
    case "tool-install":
      return "Smartphone";
    default: {
      // راند ۲۴۱ — مسیرهای اخیر: آیکونِ تاریخچه، متمایز از Playِ خودِ «ادامه»
      if (id.startsWith(RESUME_RECENT_PREFIX)) return "History";
      // فرمان‌های پارامتری (Task 69): آیکونِ مقصدِ هر خانواده
      if (id.startsWith("exam-count-")) return "ClipboardCheck";
      if (id.startsWith("konkur-count-")) return "GraduationCap";
      if (id.startsWith("daily-goal-")) return "Target";
      // فرمان‌های عمق‌دار درس: آیکون هر تب، مثل خودِ درس‌نما
      const lt = parseLessonTabId(id);
      if (lt) {
        switch (lt.tab) {
          case "vocab":
            return "BookOpen";
          case "conversation":
            return "MessageSquareText";
          case "reading":
            return "BookOpenText";
          case "grammar":
            return "GraduationCap";
          case "writing":
            return "PenLine";
          case "dictation":
            return "Ear";
          case "tests":
            return "ListChecks";
          default:
            return "BookOpen";
        }
      }
      if (id.startsWith("lesson-smart-")) return "Sparkles"; // فلش‌کارت هوشمند
      return "BookOpen"; // درس‌ها
    }
  }
}
