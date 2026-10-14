"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  BookOpenText,
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
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useStudy, type LessonTab } from "@/lib/study-store";
import { LESSONS_META } from "@/data/lesson-meta";
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
import { Kbd } from "./shortcut-guide";

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
  ClipboardCheck,
  Library,
  Route,
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
  const togglePalette = () => {
    setOpen((v) => !v);
    setQuery("");
    setSelected(0);
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

  const baseCommands: CommandDef[] = useMemo(
    () => [
      // ── ناوبری ──
      { id: "nav-home", label: "خانه", group: "ناوبری", hint: "برگشت به جلد کتاب", keywords: ["home", "bookshelf"] },
      { id: "nav-dictionary", label: "دیکشنری واژگان", group: "ناوبری", hint: "جست‌وجوی ۶۳۳+ واژه", keywords: ["dictionary", "vocab", "لغت", "culture"] },
      { id: "nav-exam", label: "آزمون جامع", group: "ناوبری", hint: "ارزیابی پایانی کتاب", keywords: ["exam", "final test"] },
      { id: "nav-appendix", label: "ضمیمهٔ کتاب", group: "ناوبری", hint: "افعال بی‌قاعده و آواها", keywords: ["appendix", "irregular verbs", "ipa"] },
      { id: "nav-grammar", label: "متروی گرامر", group: "ناوبری", hint: "نقشهٔ سفر گرامر کتاب", keywords: ["grammar", "metro", "map"] },
      { id: "nav-konkur", label: "گوشهٔ کنکور", group: "ناوبری", hint: "بانک ۳۶۰ تستی با پاسخ تشریحی", keywords: ["konkur", "question bank", "entrance"] },
      // Task 73: برچسب صادقانه — مقصد این فرمان نمای «مرور سریع قبل امتحان» است
      // (بانک غلط‌ها)، نه داشبورد SRS (که بخشی از خانه است)؛ واژه‌نامهٔ SRS به
      // فرمان‌های lesson-smart-<n> و nav-smart منتقل شد.
      { id: "nav-review", label: "مرور سریع خطاها", group: "ناوبری", hint: "بانک غلط‌های اخیر — مرور قبل امتحان", keywords: ["review", "mistakes", "مرور خطا"] },
      { id: "nav-my-words", label: "واژه‌های من", group: "ناوبری", hint: "نشان‌شده‌ها و وضعیت یادگیری", keywords: ["my words", "starred", "favorites"] },
      { id: "nav-smart", label: "تمرین هوشمند", group: "ناوبری", hint: "دور ترکیبی متناسب با تو", keywords: ["smart practice", "mixed"] },
      { id: "nav-listen", label: "آموخته‌های شنیداری", group: "ناوبری", hint: "تمرین گوش و روخوانی", keywords: ["listen", "audio", "ear"] },
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
    [isDark],
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
    rememberRecent(cmd.id);
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
      case "nav-smart":
        setView({ type: "smart" });
        break;
      case "nav-listen":
        setView({ type: "listen" });
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
            className="min-w-0 flex-1 rounded-md bg-transparent text-[15px] font-bold text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500/30"
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
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
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
                <div className="flex items-center gap-1.5 px-2 pb-1 pt-2.5 text-[10.5px] font-black tracking-wide text-stone-400">
                  <span>{g.group}</span>
                  <span className="rounded-full bg-stone-100 px-1.5 text-[9.5px] font-bold text-stone-400">
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
                          active ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/20" : "bg-stone-100 text-stone-500"
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
                        <span className="shrink-0 rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
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
        <div className="flex items-center justify-between border-t border-stone-200/70 px-4 py-2 text-[10.5px] font-bold text-stone-400">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> حرکت
            <span className="mx-1 text-stone-300">·</span>
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
