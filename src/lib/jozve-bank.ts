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
import type { QuizCategory, QuizQuestion } from "./study-types";

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

/** minimal runtime shape-check — a row must look like a real question */
function asQuestion(raw: unknown): QuizQuestion | null {
  if (typeof raw !== "object" || raw === null) return null;
  const q = raw as Record<string, unknown>;
  const { id, question, options, answer } = q as Record<string, unknown>;
  if (typeof id !== "string" || id.length === 0 || id.length > 60) return null;
  if (typeof question !== "string" || question.trim().length === 0) return null;
  if (!Array.isArray(options) || options.length === 0) return null;
  if (!options.every((o) => typeof o === "string")) return null;
  if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
  const rawCat = typeof q.category === "string" ? q.category : "vocab";
  const category: QuizCategory = rawCat === "grammar" || rawCat === "vocab-konkuri" ? rawCat : "vocab";
  const out: QuizQuestion = {
    id,
    category,
    question,
    options: options as string[],
    answer,
  };
  if (q.kind === "typed") out.kind = "typed";
  if (Array.isArray(q.accepted) && q.accepted.every((a) => typeof a === "string")) {
    out.accepted = q.accepted as string[];
  }
  if (typeof q.translation === "string" && q.translation.length > 0) out.translation = q.translation;
  return out;
}

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
