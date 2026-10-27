// shared star-resolution for the «واژه‌های من» feature — used by both the
// word-book list (my-words.tsx) and the review-quiz launcher (my-words-review.tsx)

import { lessons } from "@/data";
import type { LessonColor } from "@/lib/study-types";

export interface ResolvedStar {
  key: string;
  lessonId: number;
  en: string;
  fa: string;
  pos?: string;
  /** رنگِ خانوادهٔ درسِ مالک — کاملِ LessonColor (r431+ قفسهٔ دوازده‌خانواده‌ای) */
  color: LessonColor;
  titleFa: string;
}

const LESSON_BY_ID = new Map(lessons.map((l) => [l.id, l]));

/** resolve a starred wordKey against the book content (null when dangling) */
export function resolveStar(key: string): ResolvedStar | null {
  const sep = key.indexOf(":");
  if (sep < 1) return null;
  const lessonId = Number(key.slice(0, sep));
  const en = key.slice(sep + 1);
  const lesson = LESSON_BY_ID.get(lessonId);
  const word = lesson?.vocabulary.find((v) => v.en.toLowerCase() === en);
  if (!lesson || !word) return null;
  return { key, lessonId, en: word.en, fa: word.fa, pos: word.pos, color: lesson.color, titleFa: lesson.titleFa };
}
