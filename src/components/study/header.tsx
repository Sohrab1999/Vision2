"use client";

import { BookOpen, Home, Library, ClipboardCheck, BookMarked, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useStudy, type View } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";

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
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const isDark = mounted && theme === "dark";

  const isActive = (item: { key: string }) => {
    if (item.key === "home") return view.type === "home" || view.type === "lesson";
    return view.type === item.key;
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
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold text-stone-800">
              ویژن ۲ <span className="en-text text-emerald-700">Vision Two</span>
            </span>
            <span className="block text-[11px] text-stone-500">
              وب‌کتاب تعاملی زبان یازدهم
            </span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-all hover:text-amber-500 hover:border-amber-200 active:scale-90"
            aria-label={isDark ? "حالت روشن" : "حالت شب"}
            title={isDark ? "حالت روشن" : "حالت شب"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <nav className="flex items-center gap-1 overflow-x-auto" aria-label="ناوبری اصلی">
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
