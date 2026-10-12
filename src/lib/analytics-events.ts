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
  "duel_start", // 2-player live duel session started
  "duel_done", // 2-player live duel finished (server-arbitrated)
  "listen_done",
  "dictation_done",
  "flashcard_done",
  "danger_practice",
  "danger_flashcards",
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
  duel_start: "شروع نبرد دودنفره",
  duel_done: "نبرد دودنفره",
  listen_done: "تمرین شنیداری",
  dictation_done: "دیکته",
  flashcard_done: "دور فلش‌کارت",
  danger_practice: "تمرین واژه‌های خطرناک",
  danger_flashcards: "فلش‌کارت واژه‌های خطرناک",
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
  print_report: "گزارش چاپی رسمی",
};

export function isEventName(v: unknown): v is EventName {
  return typeof v === "string" && (EVENT_NAMES as readonly string[]).includes(v);
}
