// ------------------------------------------------------------------
// r361 — «ادامهٔ خواندن» برایِ درسها — همزادِ درسیِ رکوردِ ضمیمه (r235).
//
// حلقهٔ بازگشتِ یادگیرندهٔ برگشتی: آخرین (درس، تب) که مطالعه کرده،
// رویِ خانه با یک کلیک برمیگردد. قراردادها:
//
//   • رکورد در localStorage زندگی میکند نه در استور — هیچ فیلدِ جدیدِ
//     persistای نیست؛ بکآپ/سینکِ ابری رایگان میماند (همان تصمیمِ r235
//     برایِ رکوردِ ضمیمه؛ همان آیدیومِ خواندنِ رکوردِ بیرونیِ r231:
//     subscribe + snapshot + serverSnapshot=null برایِ هیدریشن).
//   • نویسنده فقط lesson-view است (هر ورود/تعویضِ تب) — یک نویسنده،
//     یک خواننده (کارتِ خانه)؛ واگراییِ مسیرِ نوشتن ممنوع.
//   • پالایشِ صادقانه: درسِ بیرون از ۱..۱۲ یا تبِ بیرون از فهرستِ
//     نُتایی ⇒ رکوردِ کهنه دستنخورده میماند — جعلِ محل ممنوع.
//   • بازنویسیِ همسنت (همان درس، همان تب) نمیکند — `at` فقط با
//     تغییرِ محلِ واقعی تازه میشود (بدونِ نویزِ نوبتِ mount).
// ------------------------------------------------------------------

"use client";

import { useSyncExternalStore } from "react";
import type { LessonTab } from "@/state/types";

export const LESSON_RESUME_KEY = "vision2-lesson-resume-v1"; // r361

export const LESSON_RESUME_TABS: readonly LessonTab[] = [
  "vocab",
  "conversation",
  "reading",
  "grammar",
  "writing",
  "dictation",
  "tests",
  "synant",
  "booklet",
] as const;

export const LESSON_RESUME_MAX = 12; // درسهایِ وبکتاب (۱..۱۲)

export interface LessonResumeRecord {
  lesson: number;
  tab: LessonTab;
  at: string; // ISO
}

const VALID = new Set<string>(LESSON_RESUME_TABS);

// snapshot باید بینِ فراخوانی‌هایِ پیاپیِ React یک هویتِ پایدار برگرداند —
// cache بر پایهٔ متنِ خام (آیدیومِ r231): تغییرِ بیرونیِ localStorage هم
// دیده میشود، بدونِ جوِ بی‌پایانِ هویتِ نو.
let snapCacheKey = "\u0000empty";
let snapCacheVal: LessonResumeRecord | null = null;

const parse = (raw: string | null): LessonResumeRecord | null => {
  if (!raw) return null;
  try {
    const rec = JSON.parse(raw) as { lesson?: unknown; tab?: unknown; at?: unknown };
    const lesson = typeof rec.lesson === "number" ? Math.round(rec.lesson) : NaN;
    if (!(lesson >= 1) || lesson > LESSON_RESUME_MAX) return null;
    if (typeof rec.tab !== "string" || !VALID.has(rec.tab)) return null;
    const at = typeof rec.at === "string" && !Number.isNaN(Date.parse(rec.at)) ? rec.at : "";
    if (!at) return null;
    return { lesson, tab: rec.tab as LessonTab, at };
  } catch {
    return null;
  }
};

const listeners = new Set<() => void>();

export const subscribeLessonResume = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const lessonResumeSnapshot = (): LessonResumeRecord | null => {
  if (typeof window === "undefined") return null;
  let raw = "";
  try {
    raw = window.localStorage.getItem(LESSON_RESUME_KEY) ?? "";
  } catch {
    return null; // private mode — بی‌رکورد، صادقانه
  }
  if (raw === snapCacheKey) return snapCacheVal;
  snapCacheKey = raw;
  snapCacheVal = raw ? parse(raw) : null;
  return snapCacheVal;
};

export const lessonResumeServerSnapshot = (): LessonResumeRecord | null => null;

const emit = () => {
  for (const cb of listeners) cb();
};

/** نویسندهٔ یکتا — فقط lesson-view صدا میزند */
export function writeLessonResume(lesson: number, tab: LessonTab): void {
  if (typeof window === "undefined") return;
  if (!Number.isInteger(lesson) || lesson < 1 || lesson > LESSON_RESUME_MAX) return;
  if (!VALID.has(tab)) return;
  const prev = lessonResumeSnapshot();
  if (prev && prev.lesson === lesson && prev.tab === tab) return; // همسنت ⇒ بدونِ بازنویسی
  const rec: LessonResumeRecord = { lesson, tab, at: new Date().toISOString() };
  try {
    window.localStorage.setItem(LESSON_RESUME_KEY, JSON.stringify(rec));
  } catch {
    return; // private mode — رکورد ندارد، کارت هم غایب (صادقانه)
  }
  emit();
}

/** قلابِ خواننده — هم‌الگویِ رکوردِ ضمیمه (useSyncExternalStore، بی‌سطحِ هیدریشن) */
export function useLessonResume(): LessonResumeRecord | null {
  return useSyncExternalStore(
    subscribeLessonResume,
    lessonResumeSnapshot,
    lessonResumeServerSnapshot
  );
}
