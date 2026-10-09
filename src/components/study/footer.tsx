"use client";

import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-[12px] text-stone-500 sm:flex-row sm:text-right">
        <p className="flex items-center gap-1.5">
          <BookOpen size={14} className="text-emerald-600" />
          بر اساس جزوهٔ جامع «Vision Two» زبان انگلیسی پایهٔ یازدهم — تألیف و گردآوری: جمال احمدی
        </p>
        <p>
          روخوانی با هوش مصنوعی · پیشرفت شما روی همین دستگاه ذخیره می‌شود
        </p>
      </div>
    </footer>
  );
}
