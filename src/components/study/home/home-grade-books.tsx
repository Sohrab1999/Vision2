"use client";

// r397 — بخشِ «کتاب‌های پایه‌ها» در خانه — قفسهٔ دومِ کتابخانه.
// خواستهٔ صریح کاربر: «همهٔ این کتاب‌ها رو به وب‌اپ اضافه کن، همان‌طور که
// جزوهٔ یازدهم رو اضافه کردی — مرتب». شش جزوهٔ پایهٔ ۷ تا ۱۲ با رحلِ کتاب
// روی قفسه + کارتِ هر پایه؛ کلیک = نمای درس‌به‌درسِ همان کتاب
// (src/components/study/books/book-view.tsx). آمار از متای ثابتِ
// src/lib/books.ts می‌آید که در tests/books-derive.test.ts با فایل‌های
// واقعی public/jozve/*.json پین شده‌اند (ضدِ عددِ کهنه).

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, LibraryBig, ListChecks } from "lucide-react";
import { BOOKS, BOOKS_PAGES_TOTAL, BOOK_BANK_COUNTS } from "@/lib/books";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";

export default function HomeGradeBooks() {
  const setView = useStudy((s) => s.setView);

  return (
    <section aria-label="کتاب‌های پایه‌ها">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
          <LibraryBig size={19} className="text-amber-600" />
          کتاب‌های پایه‌ها — شش جزوهٔ کامل
        </h2>
        <span className="text-xs text-stone-500">هر پایه درس‌به‌درس: واژگان، گرامر، ترجمه، تست</span>
      </div>

      {/* بندهای کتاب روی قفسه */}
      <div className="mb-6 flex items-end justify-center gap-1.5 overflow-x-auto rounded-t-2xl border border-b-0 border-stone-200 shelf-strip bg-gradient-to-b from-stone-100 to-stone-50 px-4 py-6 sm:gap-2.5">
        {BOOKS.map((b, i) => (
          <motion.button
            key={b.grade}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setView({ type: "book", grade: b.grade })}
            className={`book-spine flex w-14 shrink-0 flex-col items-center justify-end rounded-t-lg bg-gradient-to-b pb-3 text-white shadow-lg sm:w-[4.5rem] ${b.spine}`}
            style={{ height: `${96 + (i % 3) * 10}px` }}
            aria-label={`باز کردن کتاب پایهٔ ${b.label}`}
          >
            <LibraryBig size={14} />
            <span className="mt-1 text-[11px] font-black">پایهٔ {b.label}</span>
          </motion.button>
        ))}
      </div>
      <div className="h-2.5 rounded-b-xl shelf-edge bg-gradient-to-b from-stone-300 to-stone-400 shadow-md" aria-hidden />

      {/* کارت‌های پایه */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BOOKS.map((b, i) => (
          <motion.div
            key={b.grade}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg ${b.ring}`}
          >
            <div className={`h-1.5 w-full bg-gradient-to-l ${b.spine}`} />
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className={`mb-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-black ${b.chip}`}>
                    پایهٔ {b.label}
                  </span>
                  <h3 className="truncate text-[15px] font-black text-stone-800">{b.title}</h3>
                </div>
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b text-white shadow-sm ${b.spine}`}>
                  <BookOpen size={17} />
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-1.5 text-[10.5px] font-bold text-stone-500">
                <span className="rounded-lg bg-stone-100 px-2 py-1">{faNum(b.lessonCount)} درس</span>
                <span className="rounded-lg bg-stone-100 px-2 py-1">
                  <ListChecks size={10} className="ml-0.5 inline align-middle" /> {faNum(BOOK_BANK_COUNTS[b.grade] ?? 0)} بانک آزمون
                </span>
                <span className="rounded-lg bg-stone-100 px-2 py-1">{faNum(b.pages)} صفحه</span>
              </div>
              <button
                onClick={() => setView({ type: "book", grade: b.grade })}
                className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l py-2.5 text-sm font-bold text-white transition-[opacity,transform] hover:opacity-90 active:scale-95 ${b.spine}`}
              >
                ورود به کتاب
                <ArrowLeft size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11.5px] font-bold text-stone-400">
        مجموعاً {faNum(BOOKS_PAGES_TOTAL)} صفحه استخراج واژه‌به‌واژه از شش جزوه — متنِ کامل هر فصل در کتابخانهٔ جزوه‌ها هم قابل مطالعه است.
      </p>
    </section>
  );
}
