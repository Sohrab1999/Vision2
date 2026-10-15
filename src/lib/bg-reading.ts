// راند ۲۳۳ — «ادامهٔ مطالعه»: نشانگرِ آخرین موضوعِ دیده‌شدهٔ درسنامهٔ جامع.
// سوختِ دکمهٔ «ادامهٔ مطالعه» روی کارتِ ضمیمهٔ خانه (بندِ ② پیشنهادِ ۲۳۱/۲۳۲).
//
// چرا رکوردِ خودکفا (id + title + page + source) و نه فقط شناسه؟ کارتِ
// «ضمیمهٔ کتاب» در home-tools جزوِ پوستهٔ eagerِ خانه است و قراردادِ Task-44
// اجازهٔ کشیدنِ @/data/booklet-grammar (۲۱۴ کیلوبایت) را به آن نمی‌دهد؛ رکوردِ
// ذخیره‌شده عنوان را بی‌هیچِ importِ سنگین به خانه می‌آورد. صحتِ ناوبری با
// خودِ شناسه تضمین می‌شود — openAppendixTopic به validFocusِ ضمیمه می‌رسد که
// شناسه را همان‌جا در برابرِ دادهٔ واقعی داوری می‌کند (شناسهٔ مرده = بازشدنِ
// سادهٔ ضمیمه، هیچ گره‌ای). عنوانِ ذخیره‌شده از محتوایِ منجمدِ خودِ جزوه است
// و گاردهایِ داده آن را پین کرده‌اند.
//
// ایدئومِ راندِ ۲۳۱: localStorage مثلِ storeِ خارجیِ واقعی، نوشتنِ همگام،
// خواندنِ دفاعی — و هیچ نوشتنی در استورِ یادگیری نیست.

export interface BgReadingBookmark {
  id: string;
  title: string;
  page?: string;
  source?: string;
}

const BG_LAST_TOPIC_KEY = "vision2-bg-last-topic";

/** نوشتنِ نشانگر — فقط با موضوعِ کامل (شناسه و عنوانِ واقعی از دادهٔ منجمد). */
export const writeBgLastTopic = (topic: {
  id: string;
  title: string;
  page?: string;
  source?: string;
}): void => {
  if (typeof window === "undefined") return;
  if (!topic.id || !topic.title) return;
  const record: BgReadingBookmark = {
    id: topic.id,
    title: topic.title,
    ...(topic.page ? { page: topic.page } : {}),
    ...(topic.source ? { source: topic.source } : {}),
  };
  try {
    window.localStorage.setItem(BG_LAST_TOPIC_KEY, JSON.stringify(record));
  } catch {
    /* حافظه در دسترس نیست — نشانگرِ UI-محلی می‌ماند */
  }
};

/** خواندنِ دفاعی — هر شکلِ خراب یا ناقص = null (هیچ ساختگی). */
export const readBgLastTopic = (): BgReadingBookmark | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BG_LAST_TOPIC_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as Record<string, unknown>;
    if (typeof rec.id !== "string" || !rec.id) return null;
    if (typeof rec.title !== "string" || !rec.title) return null;
    return {
      id: rec.id,
      title: rec.title,
      ...(typeof rec.page === "string" && rec.page ? { page: rec.page } : {}),
      ...(typeof rec.source === "string" && rec.source ? { source: rec.source } : {}),
    };
  } catch {
    return null;
  }
};
