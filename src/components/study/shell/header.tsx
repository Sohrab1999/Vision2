"use client";

import { BookOpen, Home, Library, ClipboardCheck, BookMarked, Sun, Moon, Flame, Keyboard, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useStudy, type View } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import SettingsPopover from "../shared/settings-popover";
import ProfilePopover from "../profile/profile-popover";
import DuePill from "../practice/due-pill";
import GoalChip from "../practice/goal-chip";
import FreezeBadge from "../practice/freeze-badge";

// ------------------------------------------------------------------
// هدر چسبان — گام ۷.۲-ج §12: این فایل فقط «میلهٔ هدر» است؛ پاپ‌اُور
// پروفایل/پشتیبان/سینک به profile/profile-popover.tsx کوچید و
// avatarClasses هم به lib/study-theme رفت (ثابت مشترک سه مصرف‌کننده).
// ------------------------------------------------------------------

const navItems: { key: string; label: string; icon: React.ElementType; view: View }[] = [
  { key: "home", label: "خانه", icon: Home, view: { type: "home" } },
  { key: "dictionary", label: "دیکشنری", icon: BookMarked, view: { type: "dictionary" } },
  { key: "exam", label: "آزمون جامع", icon: ClipboardCheck, view: { type: "exam" } },
  { key: "appendix", label: "ضمیمه", icon: Library, view: { type: "appendix" } },
];

export default function Header() {
  const view = useStudy((s) => s.view);
  const setView = useStudy((s) => s.setView);
  const goHome = useStudy((s) => s.goHome);
  const streak = useStudy((s) => s.streak);
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const isDark = mounted && theme === "dark";

  const isActive = (item: { key: string }) => {
    if (item.key === "home") return view.type === "home" || view.type === "lesson";
    return view.type === item.key;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#f7f6f2]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
        <button
          onClick={goHome}
          className="flex min-h-11 min-w-11 items-center gap-2.5 text-right transition-opacity hover:opacity-80"
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
              className="mr-1 hidden items-center gap-1 rounded-full border c-chip-flame px-2.5 py-1.5 text-[12px] font-black sm:inline-flex"
              title={`زنجیرهٔ ${faNum(streak)} روزه مطالعه`}
            >
              <Flame size={14} className="streak-flame" />
              {faNum(streak)}
            </span>
          )}
          {/* SRS due pill — شمارش زندهٔ کارت‌های سررسیده، یک ضربه تا مرور (Task 73) */}
          <DuePill />
          {/* چیپ هدف امروز — پیشرفت زندهٔ reviews+quizzes تا امن‌شدن زنجیره (Task 76) */}
          <GoalChip />
          {/* نشانگر یخِ زنجیره — مخزن یخ/نجات امروز، کنار شعله (Task 77) */}
          <FreezeBadge />
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border c-card text-stone-500 transition-all hover:text-amber-500 hover:border-amber-200 active:scale-[0.96]"
            aria-label={isDark ? "حالت روشن" : "حالت شب"}
            title={isDark ? "حالت روشن" : "حالت شب"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* settings hub (TTS speed / font size / motion / daily goal) */}
          <SettingsPopover />

          {/* command palette — جست‌وجوی همه‌جا (Ctrl+K) */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border c-card text-stone-500 transition-all hover:text-teal-600 hover:border-teal-200 active:scale-[0.96]"
            aria-label="فرمان‌یاب — جست‌وجوی همه‌جا"
            title="فرمان‌یاب (Ctrl+K)"
          >
            <Search size={16} />
          </button>

          {/* keyboard shortcuts guide — موبایل مخفی (بودجهٔ هدر: Task 80؛
              راهنمای کیبورد لمسی نیست و از پالت هم reachable است) */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-shortcuts"))}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border c-card text-stone-500 transition-all hover:text-emerald-600 hover:border-emerald-200 active:scale-[0.96] sm:flex"
            aria-label="راهنمای میان‌برهای کیبورد"
            title="راهنمای میان‌برهای کیبورد (؟)"
          >
            <Keyboard size={16} />
          </button>

          {/* profile avatar + popover (profile/backup/sync) */}
          <ProfilePopover />

          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto nice-scroll" aria-label="ناوبری اصلی">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.key}
                  onClick={() => setView(item.view)}
                  className={`flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-all ${
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
