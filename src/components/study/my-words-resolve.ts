// shared star-resolution for the «واژه‌های من» feature — used by both the
// word-book list (my-words.tsx) and the review-quiz launcher (my-words-review.tsx)

import { lessons } from "@/data";

export interface ResolvedStar {
  key: string;
  lessonId: number;
  en: string;
  fa: string;
  pos?: string;
  color: "emerald" | "amber" | "rose";
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
