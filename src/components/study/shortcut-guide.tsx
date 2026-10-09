"use client";

import { useEffect, useState } from "react";
import { Keyboard, BookMarked, ClipboardCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudy, type LessonTab } from "@/lib/study-store";

/**
 * راهنمای میان‌برهای کیبورد + اجرای میان‌برهای سراسری.
 * کلید «؟» (Shift+/) یا کلیک روی دکمهٔ کیبورد (هدر/فوتر) پنجره را باز می‌کند.
 */

function isTyping(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  const tag = el?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return !!el && (el.isContentEditable || el.getAttribute("role") === "textbox");
}

interface Row {
  keys: string[];
  desc: string;
}

const GROUPS: { title: string; icon: React.ElementType; rows: Row[] }[] = [
  {
    title: "میان‌برهای سراسری",
    icon: Keyboard,
    rows: [
      { keys: ["H"], desc: "رفتن به خانه" },
      { keys: ["D"], desc: "دیکشنری واژگان" },
      { keys: ["E"], desc: "آزمون جامع" },
      { keys: ["A"], desc: "ضمیمهٔ کتاب" },
      { keys: ["T"], desc: "تغییر حالت شب / روز" },
      { keys: ["?"], desc: "باز و بسته کردن همین راهنما" },
    ],
  },
  {
    title: "در درس‌ها",
    icon: BookMarked,
    rows: [
      { keys: ["1", "…", "7"], desc: "پرش مستقیم به تب‌های درس (واژگان، مکالمه، ریدینگ، گرامر، نگارش، دیکته، تست‌ها)" },
      { keys: ["F"], desc: "فلش‌کارت مرور هوشمند واژگان درس" },
    ],
  },
  {
    title: "فلش‌کارت‌ها",
    icon: ClipboardCheck,
    rows: [
      { keys: ["Space"], desc: "برگرداندن کارت (دیدن معنی)" },
      { keys: ["←"], desc: "کارت بعدی" },
      { keys: ["→"], desc: "کارت قبلی" },
      { keys: ["K"], desc: "بلدم — ثبت در مرور هوشمند" },
      { keys: ["R"], desc: "تکرار — مرور دوبارهٔ همین کارت" },
    ],
  },
  {
    title: "در آزمون‌ها",
    icon: ClipboardCheck,
    rows: [
      { keys: ["1", "…", "4"], desc: "انتخاب گزینه" },
      { keys: ["Enter", "←"], desc: "سؤال بعدی" },
    ],
  },
];

const LESSON_TABS: { key: LessonTab; label: string }[] = [
  { key: "vocab", label: "واژگان" },
  { key: "conversation", label: "مکالمه" },
  { key: "reading", label: "ریدینگ" },
  { key: "grammar", label: "گرامر" },
  { key: "writing", label: "نگارش" },
  { key: "dictation", label: "دیکته" },
  { key: "tests", label: "تست‌ها" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      dir="ltr"
      className="inline-flex min-w-[26px] items-center justify-center rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-stone-600 shadow-[0_1px_0_0_#e7e5e4]"
    >
      {children}
    </kbd>
  );
}

export default function ShortcutGuide() {
  const [open, setOpen] = useState(false);
  const setView = useStudy((s) => s.setView);
  const openLesson = useStudy((s) => s.openLesson);
  const openLessonTab = useStudy((s) => s.openLessonTab);
  const view = useStudy((s) => s.view);
  const lessonTab = useStudy((s) => s.lessonTab);
  const { theme, setTheme } = useTheme();

  // open via event (header/footer buttons)
  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("open-shortcuts", handler);
    return () => window.removeEventListener("open-shortcuts", handler);
  }, []);

  // inside an active test/exam the nav letters/numbers are disabled
  // so they can't wipe an in-progress session (quiz uses 1-4 itself)
  const quizContext = view.type === "exam" || (view.type === "lesson" && lessonTab === "tests");

  // global shortcuts + "?" toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping(e)) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (open || quizContext) return; // dialog handles its own Escape
      const k = e.key.toLowerCase();
      if (k === "h") setView({ type: "home" });
      else if (k === "d") setView({ type: "dictionary" });
      else if (k === "e") setView({ type: "exam" });
      else if (k === "a") setView({ type: "appendix" });
      else if (k === "t") setTheme(theme === "dark" ? "light" : "dark");
      else if (k === "f" && view.type === "lesson") openLesson(view.id, "smart");
      else if (k >= "1" && k <= "7" && view.type === "lesson") {
        const tab = LESSON_TABS[Number(k) - 1];
        if (tab) openLessonTab(view.id, tab.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, quizContext, theme, view, lessonTab, setView, openLesson, openLessonTab, setTheme]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="shortcuts-dialog max-h-[85vh] overflow-y-auto rounded-2xl p-0 sm:max-w-lg nice-scroll">
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-l from-emerald-500 via-cyan-500 to-violet-500" />
        <div className="p-5 pt-4">
          <DialogHeader className="mb-4 text-right">
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold text-stone-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-stone-600 to-stone-800 text-white shadow-md">
                <Keyboard size={18} />
              </span>
              راهنمای میان‌برهای کیبورد
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-6 text-stone-500">
              بدون ماوس هم می‌توانی کل کتاب را ورق بزنی — کلید «؟» این راهنما را هر جا باز می‌کند.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {GROUPS.map((g) => (
              <section key={g.title} className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                <h3 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-extrabold text-stone-700">
                  <g.icon size={14} className="text-emerald-600" />
                  {g.title}
                </h3>
                <ul className="space-y-1.5">
                  {g.rows.map((r) => (
                    <li key={r.desc} className="flex items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
                      <span className="text-[12px] font-bold text-stone-600">{r.desc}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        {r.keys.map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-[10px] text-stone-300">/</span>}
                            <Kbd>{k}</Kbd>
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <p className="flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold leading-5 text-amber-800">
              <Sun size={13} className="mt-0.5 shrink-0" />
              <span>
                میان‌برهای حرفی هنگام تایپ در جعبه‌های متن و همچنین وسط آزمون غیرفعال می‌شوند تا نتیجه‌ات از دست نرود.
                <Moon size={11} className="mx-1 inline text-amber-600" />
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
