// ------------------------------------------------------------------
// F10 — lightweight product analytics (no PII, no user identifiers).
// Shared event registry: the single whitelist consumed by the client
// tracker and by the /api/event route. Anything outside this list is
// dropped — keeps the table meaningful and the DB bounded.
// ------------------------------------------------------------------

export const EVENT_NAMES = [
  "app_open", // one per browser session
  "lesson_open",
  "quiz_done",
  "exam_done",
  "rush_done",
  "spell_rush_done", // 60s spelling sprint finished
  "duel_start", // 2-player live duel session started
  "duel_done", // 2-player live duel finished (server-arbitrated)
  "listen_done",
  "dictation_done",
  "flashcard_done",
  "danger_practice",
  "danger_flashcards",
  "danger_dictation_start", // started a spelling round from dangerous words
  "srs_due_dictation_start", // started a spelling round from SRS-due words
  "exam_dictation_start", // started a spelling round from the 360 exam bank's vocabulary
  "explain_open",
  "explain_served", // server-side: cache hit in /api/explain
  "explain_generated", // server-side: new LLM generation in /api/explain
  "sync_link",
  "sync_restore",
  "backup_export",
  "pwa_install",
  "quick_review_start",
  "smart_practice_start",
  "konkur_start", // konkur corner session (360-bank coverage/mastery)
  "anki_export",
  "star_word", // a word starred into «واژه‌های من»
  "my_words_open", // opened the personal word-book view
  "my_words_review_start", // started a review quiz from starred words
  "my_words_flashcards_start", // started a flashcard pass from starred words
  "my_words_dictation_start", // started a spelling round from starred words
  "my_words_story_start", // asked for an AI mini-story from starred words (Task 116)
  "story_served", // server-side: cache hit in /api/story
  "story_generated", // server-side: new LLM generation in /api/story
  "story_fallback", // server-side: /api/story served the offline exercise
  "exam_review_start", // asked the AI teacher to review a finished session (Task 117)
  "exam_review_served", // server-side: cache hit in /api/exam-review
  "exam_review_generated", // server-side: new LLM generation in /api/exam-review
  "exam_review_fallback", // server-side: /api/exam-review served the honest fallback
  "week_review_start", // asked the AI teacher to review the whole week (Task 119)
  "week_review_served", // server-side: cache hit in /api/week-review
  "week_review_generated", // server-side: new LLM generation in /api/week-review
  "week_review_fallback", // server-side: /api/week-review served the honest fallback
  "srs_due_review", // jumped into smart review from the due-words preview
  "srs_due_pill", // jumped into smart review from the header due pill (Task 73)
  "goal_chip", // tapped the daily-goal progress chip in the header (Task 76)
  "week_chip", // tapped the weekly-goal ring chip in the header (Task 129)
  "freeze_badge", // tapped the streak-freeze badge in the header (Task 77)
  "streak_badge", // tapped the combined streak badge's flame segment (Task 150)
  "print_report", // official printable progress report
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/** Persian labels for the live dashboard (settings popover / API). */
export const EVENT_LABELS_FA: Record<EventName, string> = {
  app_open: "بازکردن وب‌کتاب",
  lesson_open: "بازکردن درس",
  quiz_done: "آزمون کوتاه",
  exam_done: "آزمون جامع کامل",
  rush_done: "چالش برق‌آسا",
  spell_rush_done: "چالش دیکتهٔ برق‌آسا",
  duel_start: "شروع نبرد دودنفره",
  duel_done: "نبرد دودنفره",
  listen_done: "تمرین شنیداری",
  dictation_done: "دیکته",
  flashcard_done: "دور فلش‌کارت",
  danger_practice: "تمرین واژه‌های خطرناک",
  danger_flashcards: "فلش‌کارت واژه‌های خطرناک",
  danger_dictation_start: "شروع دیکتهٔ واژه‌های خطرناک",
  srs_due_dictation_start: "شروع دیکتهٔ واژه‌های سررسید",
  exam_dictation_start: "شروع دیکتهٔ واژگان بانک آزمون",
  explain_open: "درخواست توضیح هوشمند",
  explain_served: "توضیح هوشمند (از کش)",
  explain_generated: "توضیح هوشمند (تازه)",
  sync_link: "ساخت کد یادگیرنده",
  sync_restore: "بازیابی از ابر",
  backup_export: "خروجی پشتیبان",
  pwa_install: "نصب روی دستگاه",
  quick_review_start: "شروع مرور سریع",
  smart_practice_start: "شروع تمرین هوشمند",
  konkur_start: "شروع جلسهٔ گوشهٔ کنکور",
  anki_export: "خروجی Anki",
  star_word: "نشان‌کردن واژه",
  my_words_open: "بازکردن واژه‌های من",
  my_words_review_start: "شروع مرور نشان‌شده‌ها",
  my_words_flashcards_start: "شروع فلش‌کارت واژه‌های من",
  my_words_dictation_start: "شروع دیکتهٔ واژه‌های من",
  my_words_story_start: "درخواست داستان واژه‌های من",
  story_served: "داستان واژه‌ها (از کش)",
  story_generated: "داستان واژه‌ها (تازه)",
  story_fallback: "داستان واژه‌ها (آفلاین)",
  exam_review_start: "درخواست معلمِ کارنامه",
  exam_review_served: "معلمِ کارنامه (از کش)",
  exam_review_generated: "معلمِ کارنامه (تازه)",
  exam_review_fallback: "معلمِ کارنامه (آفلاین)",
  week_review_start: "درخواست معلمِ هفته",
  week_review_served: "معلمِ هفته (از کش)",
  week_review_generated: "معلمِ هفته (تازه)",
  week_review_fallback: "معلمِ هفته (آفلاین)",
  srs_due_review: "مرور سررسیدها از داشبورد",
  srs_due_pill: "مرور سررسیدها از هدر",
  goal_chip: "پیگیری هدف روزانه از هدر",
  week_chip: "پیگیری هدف هفتگی از هدر",
  freeze_badge: "پیگیری یخِ زنجیره از هدر",
  streak_badge: "پیگیری زنجیره از نشانِ ترکیبی",
  print_report: "گزارش چاپی رسمی",
};

export function isEventName(v: unknown): v is EventName {
  return typeof v === "string" && (EVENT_NAMES as readonly string[]).includes(v);
}
