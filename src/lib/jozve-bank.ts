// ------------------------------------------------------------------
// r403 — بانکِ کتابخانهٔ جزوه در سمتِ سرور.
//
// کتاب‌های g7-g12 (تست‌ها + گرامر) در public/jozve/*.json زندگی می‌کنند و
// کلاینت آن‌ها را با fetch می‌خواند؛ ولی دو سرویسِ سمتِ سرور — /api/explain
// (چرا غلط شد؟) و /api/exam-review (معلمِ کارنامه) — ایندکسِ خودشان را از
// explain-source می‌ساختند که فقط ۴۹۰ سؤالِ درس‌های ۱-۳ + آزمونِ جامع را
// می‌شناخت. نتیجه: هر سشنِ جزوه‌ای (۶٬۲۲۲ سؤالِ ۹ فایل) با «بیرون از بانک»
// رد می‌شد. این ماژول همان فایل‌های عمومی را در سمتِ سرور (fs) می‌خواند
// و همهٔ سؤال‌ها را با همان شکلِ QuizQuestion برمی‌گرداند:
//   • تنبل و یک‌بارمصرف (singleton) — نخستین درخواست می‌خواند، بعدش کش
//   • هر فایل مستقل: خرابیِ یک فایل هرگز کل لودر را نمی‌اندازد
//   • سؤالِ بدِ تک‌افتاده هم نادیده گرفته می‌شود (shape-guard سخت‌گیر)
//   • فقط runtimeِ nodejs (دو روتِ مصرف‌کننده هر دو nodejs هستند)
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import path from "node:path";
import { asQuestion } from "./quiz-question-guard";
import type { QuizQuestion } from "./study-types";

/** nine quiz-bearing files of the jozve library (id prefixes are unique) */
export const JOZVE_BANK_FILES = [
  "tests-g7.json",
  "tests-g8.json",
  "tests-g9.json",
  "tests-g10.json",
  "tests-g11.json",
  "tests-g12.json",
  "grammar-g11.json",
  "grammar-g11-konkur.json",
  "grammar-g12-topic.json",
] as const;

// r404 — اعتبارسنجِ شکلِ سؤال به lib/quiz-question-guard.ts (مشترکِ
// سرور/کلاینت) کوچید؛ این ماژول همان گارد را مصرف می‌کند.

interface LessonLike {
  questions?: unknown;
}

/** one JSON file → its questions (empty on any failure — never throws) */
function loadFile(fileName: string): QuizQuestion[] {
  try {
    const filePath = path.join(process.cwd(), "public", "jozve", fileName);
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    const lessons =
      typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { lessons?: unknown }).lessons)
        ? ((parsed as { lessons: LessonLike[] }).lessons)
        : [];
    const out: QuizQuestion[] = [];
    for (const lesson of lessons) {
      if (!lesson || !Array.isArray(lesson.questions)) continue;
      for (const raw of lesson.questions) {
        const q = asQuestion(raw);
        if (q) out.push(q);
      }
    }
    return out;
  } catch {
    return [];
  }
}

let bank: QuizQuestion[] | null = null;

/** all jozve-library questions (lazy, cached; never throws) */
export function loadJozveQuestions(): QuizQuestion[] {
  if (!bank) {
    const merged: QuizQuestion[] = [];
    for (const f of JOZVE_BANK_FILES) merged.push(...loadFile(f));
    bank = merged;
  }
  return bank;
}
