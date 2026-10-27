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
  "srs_due_review", // jumped into smart review from the due-words preview
  "srs_due_pill", // jumped into smart review from the header due pill (Task 73)
  "goal_chip", // tapped the daily-goal progress chip in the header (Task 76)
  "freeze_badge", // tapped the streak-freeze badge in the header (Task 77)
  "print_report", // official printable progress report
  "coverage_csv", // coverage CSV export from the official report (Task 180)
  "official_image", // official report share-card PNG (r286)
  "duel_image", // duel-done share-card PNG — download or native share (r287)
  "duel_ledger_image", // duel ledger career-card PNG — download or native share (r288)
  "library_story_done", // a hill-story finished in the library (r290)
  "weekly_image", // weekly digest share-card PNG — download or native share (r306)
  "week_calendar_image", // week-ahead review-calendar share-card PNG — the r422 strip as a card (r423)
  "week_calendar_share", // native share of the same week-calendar card — the r306 twin gate (r424)
  "drill_due_jump", // jumped from the week-strip today cell to the due bank's drill host (r425)
  "discovery_jump", // jumped from the home discovery-journey card to an untried world (r349)
  "pulse_open", // opened the full pulse dashboard from settings (r350)
  "pulse_csv", // 30-day event-ledger CSV exported from the pulse dashboard (r351)
  "teacher_open", // opened the teacher panel (r352)
  "teacher_csv", // class-roster CSV exported from the teacher panel (r352)
  "teacher_detail", // opened one learner's detail dialog in the teacher panel (r353)
  "teacher_learner_csv", // per-learner report-card CSV exported from the detail dialog (r354)
  "teacher_class_csv", // full class-ledger CSV — roster + every learner card stitched (r357)
  "tts_spoken", // server-side: real paid TTS synthesis (cache miss) in /api/tts (r358)
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
  srs_due_review: "مرور سررسیدها از داشبورد",
  srs_due_pill: "مرور سررسیدها از هدر",
  goal_chip: "پیگیری هدف روزانه از هدر",
  freeze_badge: "پیگیری یخِ زنجیره از هدر",
  print_report: "گزارش چاپی رسمی",
  coverage_csv: "خروجی CSV پوشش مهارت‌ها",
  official_image: "عکسِ کارنامهٔ رسمی",
  duel_image: "عکسِ کارتِ نبرد",
  duel_ledger_image: "عکسِ کارنامهٔ نبردها",
  library_story_done: "پایانِ داستانِ کتاب‌خانه",
  weekly_image: "عکسِ هفته‌نامهٔ پیشرفت",
  week_calendar_image: "عکسِ تقویمِ هفتهٔ پیشِ رو",
  week_calendar_share: "هم‌رسانیِ تقویمِ هفتهٔ پیشِ رو",
  drill_due_jump: "پرش به تمرینِ سررسیدها",
  discovery_jump: "پرش از سفرِ کشف",
  pulse_open: "بازکردنِ نبضِ کامل",
  pulse_csv: "خروجی CSV دفترِ نبض",
  teacher_open: "بازکردنِ پنلِ معلم",
  teacher_csv: "خروجی CSV روزنامهٔ کلاس",
  teacher_detail: "مشاهدهٔ جزئیاتِ یادگیرنده",
  teacher_learner_csv: "خروجی CSV کارنامهٔ یادگیرنده",
  teacher_class_csv: "خروجی دفترِ کاملِ کلاس",
  tts_spoken: "روخوانیِ تازه",
};

// ------------------------------------------------------------------
// r350 — «نبضِ کامل»: the dashboard groups the registry into six human
// families. Single truth lives HERE so the dashboard, future surfaces
// and this file never drift apart (the EVENT_LABELS_FA idiom).
// ------------------------------------------------------------------
export const EVENT_CATEGORIES: Record<EventName, string> = {
  app_open: "نشست و ناوبری",
  lesson_open: "نشست و ناوبری",
  srs_due_pill: "نشست و ناوبری",
  goal_chip: "نشست و ناوبری",
  freeze_badge: "نشست و ناوبری",
  discovery_jump: "نشست و ناوبری",
  pulse_open: "نشست و ناوبری",
  teacher_open: "نشست و ناوبری",
  teacher_detail: "نشست و ناوبری",
  pulse_csv: "خروجی و هم‌رسانی",
  teacher_csv: "خروجی و هم‌رسانی",
  teacher_learner_csv: "خروجی و هم‌رسانی",
  teacher_class_csv: "خروجی و هم‌رسانی",
  quiz_done: "یادگیری و تمرین",
  exam_done: "یادگیری و تمرین",
  flashcard_done: "یادگیری و تمرین",
  listen_done: "یادگیری و تمرین",
  dictation_done: "یادگیری و تمرین",
  smart_practice_start: "یادگیری و تمرین",
  quick_review_start: "یادگیری و تمرین",
  konkur_start: "یادگیری و تمرین",
  srs_due_review: "یادگیری و تمرین",
  srs_due_dictation_start: "یادگیری و تمرین",
  exam_dictation_start: "یادگیری و تمرین",
  danger_practice: "یادگیری و تمرین",
  danger_flashcards: "یادگیری و تمرین",
  danger_dictation_start: "یادگیری و تمرین",
  my_words_open: "یادگیری و تمرین",
  my_words_review_start: "یادگیری و تمرین",
  my_words_flashcards_start: "یادگیری و تمرین",
  my_words_dictation_start: "یادگیری و تمرین",
  star_word: "یادگیری و تمرین",
  library_story_done: "یادگیری و تمرین",
  duel_start: "نبرد و مسابقه",
  duel_done: "نبرد و مسابقه",
  rush_done: "نبرد و مسابقه",
  spell_rush_done: "نبرد و مسابقه",
  explain_open: "هوش مصنوعی",
  explain_served: "هوش مصنوعی",
  explain_generated: "هوش مصنوعی",
  // r358 — روخوانی هم سرویسِ پولیِ هوش مصنوعی است (همخانوادهٔ توضیحِ هوشمند)؛
  // نوارِ بودجهٔ TTS در نبض از همین کلیدِ تکحقیقت خانواده را میخواند
  tts_spoken: "هوش مصنوعی",
  print_report: "خروجی و هم‌رسانی",
  coverage_csv: "خروجی و هم‌رسانی",
  official_image: "خروجی و هم‌رسانی",
  duel_image: "خروجی و هم‌رسانی",
  duel_ledger_image: "خروجی و هم‌رسانی",
  weekly_image: "خروجی و هم‌رسانی",
  week_calendar_image: "خروجی و هم‌رسانی",
  week_calendar_share: "خروجی و هم‌رسانی",
  drill_due_jump: "نشست و ناوبری",
  anki_export: "خروجی و هم‌رسانی",
  backup_export: "خروجی و هم‌رسانی",
  sync_link: "همگام‌سازی و نصب",
  sync_restore: "همگام‌سازی و نصب",
  pwa_install: "همگام‌سازی و نصب",
};

/** family display order for the dashboard (the map above is the truth) */
export const EVENT_CATEGORY_ORDER = [
  "نشست و ناوبری",
  "یادگیری و تمرین",
  "نبرد و مسابقه",
  "هوش مصنوعی",
  "خروجی و هم‌رسانی",
  "همگام‌سازی و نصب",
] as const;

export function isEventName(v: unknown): v is EventName {
  return typeof v === "string" && (EVENT_NAMES as readonly string[]).includes(v);
}
