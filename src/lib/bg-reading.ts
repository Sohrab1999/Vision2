// راند ۲۳۳ — «ادامهٔ مطالعه»: نشانگرِ آخرین موضوعِ دیده‌شدهٔ درسنامهٔ جامع.
// راند ۲۳۴ — تعمیم به همهٔ لایه‌هایِ ضمیمه (بندِ ① پیشنهادِ ۲۳۳): یک رکوردِ
// واحدِ {scope, id, title, hint?} زیرِ یک کلید — «آخرین چیزی که در ضمیمه
// دیدی»، در هر لایه. نوشتنِ هر لایه رکوردِ قبلی را بازنویسی می‌کند
// (write-wins) — ترتیبِ «آخرین» بدونِ هیچ timestamp از خودِ ترتیبِ نوشتن
// می‌آید؛ چیزی جز آخرینِ واقعی ذخیره نمی‌شود.
//
// چرا رکوردِ خودکفا (scope + id + title + hint) و نه فقط شناسه؟ کارتِ
// «ضمیمهٔ کتاب» در home-tools جزوِ پوستهٔ eagerِ خانه است و قراردادِ Task-44
// اجازهٔ کشیدنِ booklet-grammar (۲۱۴ کیلوبایت) یا بانکِ افعال را به آن نمی‌دهد؛
// رکوردِ ذخیره‌شده عنوان را بی‌هیچِ importِ سنگین به خانه می‌آورد. صحتِ
// ناوبری با خودِ شناسه تضمین می‌شود — هر scope مقصدهایِ خودش را دارد:
//   grammar → openAppendixTopic (داوریِ validFocus روی دادهٔ واقعی)
//   pos     → openAppendixPosTable (داوریِ validPos روی WORD_FAMILY_TABLES)
//   verbs   → openAppendixVerb (داوریِ validVerb روی irregularVerbs)
// شناسهٔ مرده = بازشدنِ سادهٔ ضمیمه، هیچ گره‌ای.
//
// مهاجرتِ رکوردِ ۲۳۳: کلیدِ قدیمیِ vision2-bg-last-topic همان‌جا می‌ماند
// (writeBgLastTopic هر دو کلید را می‌نویسد) و خوانندهٔ تعمیم‌یافته وقتی کلیدِ
// نو غایب است، رکوردِ قدیمی را به‌شکلِ scope:"grammar" می‌پذیرد — دادهٔ
// یادگیرندهٔ واقعی هیچ‌وقت به‌دلیلِ آپدیت گم نمی‌شود.
//
// ایدئومِ راندِ ۲۳۱: localStorage مثلِ storeِ خارجیِ واقعی (subscribe +
// snapshotِ cacheشده برایِ useSyncExternalStore)، نوشتنِ همگام با خبردادنِ
// مشترکین، خواندنِ دفاعی — و هیچ نوشتنی در استورِ یادگیری نیست.

export interface BgReadingBookmark {
  id: string;
  title: string;
  page?: string;
  source?: string;
}

/** لایه‌هایِ دارایِ نشانگرِ «ادامه» — فقط لایه‌هایِ سیم‌کشی‌شدهٔ واقعی. */
export const APPENDIX_SCOPES = ["grammar", "pos", "verbs"] as const;
export type AppendixScope = (typeof APPENDIX_SCOPES)[number];

/** برچسبِ فارسیِ هر لایه — مشترک میانِ کارتِ خانه و نشانگرِ سرِ ضمیمه. */
export const APPENDIX_SCOPE_LABELS: Record<AppendixScope, string> = {
  grammar: "درسنامهٔ جامع",
  pos: "اجزای کلماتی",
  verbs: "افعال بی‌قاعده",
};

export interface AppendixResumeItem {
  scope: AppendixScope;
  /** grammar: شناسهٔ موضوع / pos: شناسهٔ جدولِ خانوادهٔ واژه‌ها / verbs: شکلِ سادهٔ فعل */
  id: string;
  /** رشتهٔ نمایشیِ خودکفا — از محتوایِ منجمدِ خودِ جزوه، هیچ ساختگی */
  title: string;
  /** توضیحِ کوتاهِ اختیاری (شمارهٔ صفحه / معنی فعل / شمارشِ خانواده‌ها) */
  hint?: string;
}

const BG_LAST_TOPIC_KEY = "vision2-bg-last-topic";
const APPENDIX_LAST_KEY = "vision2-bg-last-item";

// ---- storeِ خارجی (ایدئومِ r231) — مشترکین + snapshotِ cacheشده ------------

const resumeListeners = new Set<() => void>();
const notifyResume = () => {
  for (const l of resumeListeners) l();
};

export const subscribeAppendixResume = (cb: () => void): (() => void) => {
  resumeListeners.add(cb);
  return () => {
    resumeListeners.delete(cb);
  };
};

// snapshot باید بینِ فراخوانی‌هایِ پیاپیِ React یک هویتِ پایدار برگرداند —
// cache بر پایهٔ متنِ خامِ هر دو کلید (نو + قدیمی).
let snapCacheKey = "\u0000empty";
let snapCacheVal: AppendixResumeItem | null = null;

/** snapshot برایِ useSyncExternalStore — null روی سرور، پایدار روی کلاینت. */
export const appendixResumeSnapshot = (): AppendixResumeItem | null => {
  if (typeof window === "undefined") return null;
  let newRaw = "";
  let legacyRaw = "";
  try {
    newRaw = window.localStorage.getItem(APPENDIX_LAST_KEY) ?? "";
    legacyRaw = window.localStorage.getItem(BG_LAST_TOPIC_KEY) ?? "";
  } catch {
    return null;
  }
  const key = `${newRaw}\u0001${legacyRaw}`;
  if (key === snapCacheKey) return snapCacheVal;
  snapCacheKey = key;
  // کلیدِ نو موجود ولی خراب = null (رکوردِ کهنهٔ legacy احیا نمی‌شود)؛
  // کلیدِ نو غایب = مهاجرتِ روی-خواندنِ رکوردِ ۲۳۳ به‌شکلِ grammar.
  snapCacheVal = newRaw ? parseResumeRaw(newRaw) : parseLegacyAsResume(legacyRaw);
  return snapCacheVal;
};

/** snapshotِ سرور برایِ useSyncExternalStore — همیشه null. */
export const appendixResumeServerSnapshot = (): AppendixResumeItem | null => null;

// ---- نوشتن ----------------------------------------------------------------

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

/** نوشتنِ رکوردِ تعمیم‌یافته — هر نوشتنِ واقعی، «آخرینِ دیده‌شده» را عوض می‌کند. */
export const writeAppendixResume = (item: {
  scope: AppendixScope;
  id: string;
  title: string;
  hint?: string;
}): void => {
  if (typeof window === "undefined") return;
  if (!APPENDIX_SCOPES.includes(item.scope)) return;
  if (!isNonEmptyString(item.id) || !isNonEmptyString(item.title)) return;
  const record: AppendixResumeItem = {
    scope: item.scope,
    id: item.id,
    title: item.title,
    ...(isNonEmptyString(item.hint) ? { hint: item.hint } : {}),
  };
  try {
    window.localStorage.setItem(APPENDIX_LAST_KEY, JSON.stringify(record));
    notifyResume();
  } catch {
    /* حافظه در دسترس نیست — نشانگرِ UI-محلی می‌ماند */
  }
};

/** نوشتنِ نشانگرِ درسنامه (r233) — کلیدِ قدیمی برایِ سازگاری + آینه در کلیدِ نو. */
export const writeBgLastTopic = (topic: {
  id: string;
  title: string;
  page?: string;
  source?: string;
}): void => {
  if (typeof window === "undefined") return;
  if (!isNonEmptyString(topic.id) || !isNonEmptyString(topic.title)) return;
  const record: BgReadingBookmark = {
    id: topic.id,
    title: topic.title,
    ...(isNonEmptyString(topic.page) ? { page: topic.page } : {}),
    ...(isNonEmptyString(topic.source) ? { source: topic.source } : {}),
  };
  try {
    window.localStorage.setItem(BG_LAST_TOPIC_KEY, JSON.stringify(record));
  } catch {
    /* حافظه در دسترس نیست — نشانگرِ UI-محلی می‌ماند */
  }
  writeAppendixResume({
    scope: "grammar",
    id: topic.id,
    title: topic.title,
    hint: topic.page,
  });
};

// ---- خواندنِ دفاعی ----------------------------------------------------------

const parseResumeRaw = (raw: string): AppendixResumeItem | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const rec = parsed as Record<string, unknown>;
    if (!APPENDIX_SCOPES.includes(rec.scope as AppendixScope)) return null;
    if (!isNonEmptyString(rec.id) || !isNonEmptyString(rec.title)) return null;
    return {
      scope: rec.scope as AppendixScope,
      id: rec.id,
      title: rec.title,
      ...(isNonEmptyString(rec.hint) ? { hint: rec.hint } : {}),
    };
  } catch {
    return null;
  }
};

/** مهاجرتِ روی-خواندنِ ۲۳۳: رکوردِ قدیمیِ درسنامه = آخرینِ دیده‌شده با scopeِ grammar. */
const parseLegacyAsResume = (raw: string): AppendixResumeItem | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const rec = parsed as Record<string, unknown>;
    if (!isNonEmptyString(rec.id) || !isNonEmptyString(rec.title)) return null;
    return {
      scope: "grammar",
      id: rec.id,
      title: rec.title,
      ...(isNonEmptyString(rec.page) ? { hint: rec.page } : {}),
    };
  } catch {
    return null;
  }
};

/** خواندنِ مستقیم (خانه با useMounted) — همان cacheِ snapshot، همان دفاع. */
export const readAppendixResume = (): AppendixResumeItem | null =>
  appendixResumeSnapshot();

/** خواندنِ دفاعیِ رکوردِ قدیمیِ درسنامه — برایِ گاردها و سازگاری (r233). */
export const readBgLastTopic = (): BgReadingBookmark | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BG_LAST_TOPIC_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as Record<string, unknown>;
    if (!isNonEmptyString(rec.id) || !isNonEmptyString(rec.title)) return null;
    return {
      id: rec.id,
      title: rec.title,
      ...(isNonEmptyString(rec.page) ? { page: rec.page } : {}),
      ...(isNonEmptyString(rec.source) ? { source: rec.source } : {}),
    };
  } catch {
    return null;
  }
};
