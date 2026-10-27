# نقشهٔ اجراییِ راند ۲۵۳ — چیپِ «کاربرد در جزوه» همه‌جا + شمارندهٔ سرصفحهٔ دیکشنری

این فایل **ردیابی‌نشده** است (از reset --hard جان سالم به ببرد) و بر اساسِ
**مشاهدهٔ زندهٔ وضعیتِ واقعیِ r252** نوشته شده: در تیکِ ۱۹:۳۰ قبل از بازگشتِ حجم،
این فایل‌ها خط‌به‌خط خوانده شدند — `src/lib/word-usage.ts` (۱۵۳ خط)،
`src/components/study/lesson/dictionary-view.tsx` (۴۹۷ خط)،
`vocab-tab.tsx` (۲۸۶ خط)، `flashcards.tsx` (۳۶۲ خط). جلسهٔ بعدی بعد از بازیابی
می‌تواند بدونِ کاوشِ دوباره همین را پیاده کند.

## مبنای موجود (r252 — بعد از بازیابی این‌ها حاضرند)

- `src/lib/word-usage.ts`: `findWordUsages(word)` (کشِ ماژول per-word)،
  `wordFormRegex(word)` (صادرشده برای قفلِ CI)، `highlightParts(en, word)`،
  تایپ‌های `WordUsageSite`/`UsageHighlightPart`. نمایهٔ تنبلِ متن‌های ۱۲ درس
  (مقدمهٔ مکالمه + هر خط + هر پاراگرافِ ریدینگ) با ترجمهٔ فارسیِ خودِ جزوه.
  معناشناسی: مرزِ واژه + پسوندهایِ مجاز (e-enders/y-enders/بقیه)؛ d/n برهنه ممنوع.
- `dictionary-view.tsx`: چیپِ آسمانیِ inline (بلاکِ IIFE با testid
  `usage-chip-<en-with-dashes>`) + دیالوگِ `usage-dialog` در انتهایِ کامپوننت
  (استیتِ `usage: {en, sites} | null`)، سقفِ ۸ سایت + `usage-more`.
- چیپ فقط با تطبیقِ واقعی می‌آید؛ رنگ‌ها sky-50/200/700 و amber-50/800 — همه با
  ریمپِ تاریکِ kernel؛ بودجهٔ انتخابگرها ۵۱۳ (صفرِ قانونِ نو).
- گیت‌هایِ r252: tsc=0، lint=0، **۱۷۸۲/۱۷۸۲ (۱۷۹ فایل)**؛
  `tests/word-usage-r252.test.tsx` با ۵ گارد (تست‌ها با مستقیم‌رندر + mockهای
  `@/lib/analytics` و `@/hooks/use-toast` و `next/navigation`).

## ① کامپوننتِ مشترک — `src/components/study/shared/usage-chip.tsx`

```tsx
"use client";
// چیپِ «در جزوه · N» + دیالوگِ جای‌ها — یک قرارداد برایِ سه مصرف‌کننده؛
// بی‌تطبیق، هیچ (صداقتِ همیشگی). داده از تک‌منبعِ word-usage می‌آید.
export function UsageChip({ en, testid }: { en: string; testid?: string }) {
  const [open, setOpen] = useState(false);
  const sites = findWordUsages(en);          // کشِ ماژول — پرتابِ دوباره ارزان
  if (sites.length === 0) return null;
  // دکمه: همیشه (e) => { e.stopPropagation(); setOpen(true); } — کارتِ والد
  // در تبِ واژگان و فلش‌کارت کلیکِ خودش را دارد (بلد‌کردن / فلپ)
  // دکمه + <Dialog> (کپیِ دیالوگِ فعلیِ dictionary-view با همان testidها)
}
```

نکاتِ ظریف:
- **مقدارِ پیش‌فرضِ testid همان قراردادِ r252 باشد**: `usage-chip-${en.replace(/\s+/g,"-")}`
  تا گاردهایِ `tests/word-usage-r252.test.tsx` بدونِ تغییر سبز بمانند.
- گاردِ `mounted` لازم نیست — دادهٔ ایستایِ قطعی است، SSR/CSS یکسان (نکتهٔ جدید
  نسبت به نسخهٔ inline که `mounted ? ... : []` داشت؛ حذفش یعنی بدونِ فلشِ اول).
- دیالوگ در داخلِ خودِ چیپ است — dictionary-view دیگر استتِ `usage` و دیالوگِ
  انتهایی را نمی‌خواهد (حذفِ استت + بلاکِ IIFE + دیالوگ؛ ایمپورت‌های
  BookOpenText/findWordUsages/highlightParts/Dialog به مصرف‌کنندهٔ تازه می‌روند).

سه اتصال:
1. **dictionary-view.tsx** (خطِ ~۳۸۱): بلاکِ IIFEٔ چیپ → `<UsageChip en={w.en} />`؛
   استتِ `usage`، دیالوگِ انتهایی و ایمپورت‌هایِ مرتبط حذف.
2. **vocab-tab.tsx** (بعد از بلاکِ جفت‌ها، داخلِ `min-w-0`): `<UsageChip en={w.en} />`
   — stopPropagation داخلِ کامپوننت است؛ کارتِ کلیک‌دارِ بلد‌کردن دست‌نخورده.
   جفت‌های r205 همان بالا هستند؛ چیپ زیرشان می‌آید (الگویِ دیکشنری).
3. **flashcards.tsx** (جبههٔ کارت، کنارِ `SpeakButton` در یک ردیفِ flex):
   `<div className="flex items-center gap-2"><SpeakButton .../><UsageChip en={word.en}/></div>`
   — صفرِ رشدِ ارتفاعِ عمودی (جبهه h-64 در موبایل پر است)؛ stopPropagation جلوی
   فلپِ ناخواسته را می‌گیرد؛ چهرهٔ پشت (gradient سفید) نگیرد — sky رویِ سفیدِ جبهه.

## ② شمارندهٔ سرصفحهٔ دیکشنری — «X از N واژه در متنِ جزوه پیدا می‌شوند»

در `word-usage.ts` اضافه شود (کشِ ماژول، یک‌بار):

```ts
let usageStats: { total: number; withUsage: number } | null = null;
export function bookletUsageStats(): { total: number; withUsage: number } {
  if (usageStats) return usageStats;
  let total = 0, withUsage = 0;
  for (const l of lessons) for (const w of l.vocabulary) {
    total++;                                  // کارت‌مبنا — هم‌نام‌ها دو کارت‌اند
    if (findWordUsages(w.en).length > 0) withUsage++;
  }
  return (usageStats = { total, withUsage });
}
```

- مصرف: در dictionary-view با `useEffect` + `setTimeout(0)` (محاسبهٔ ~۱۴۰هزار
  regex رویِ اولین رندر نبندد)؛ چیپِ آسمانیِ کوچک زیرِ زیرعنوان با
  `data-testid="dictionary-usage-stat"`: «X از N واژه در مکالمه‌ها و ریدینگ‌هایِ
  جزوه پیدا می‌شوند» — همهٔ ارقام با `faNum`.
- اثرِ جانبیِ خوب: این محاسبه کشِ همهٔ واژه‌ها را گرم می‌کند — چیپ‌هایِ سه
  مصرف‌کننده بعدش cache-hit‌اند.

## گاردهایِ تست — `tests/usage-everywhere-r253.test.tsx` (۵ گارد)

1. `bookletUsageStats`: total == مجموعِ طولِ vocabularyِ درس‌ها؛ withUsage ≤ total؛
   withUsage > 0؛ دو بارِ فراخوانی یکسان (کش).
2. چیپِ مشترک: واژهٔ بی‌کاربرد (مثلِ broadcast اگر جزوه ندارد) → null؛ واژهٔ
   کاربرددار → چیپ با شمارشِ faNum؛ کلیک → دیالوگ با mark/ترجمه/نشانِ نوع.
3. vocab-tab: چیپ رویِ کارت‌هایِ کاربرددارِ درس ۱ حاضر؛ کلیکِ چیپ «بلدم» را
   تغییر **نمی‌دهد** (stopPropagation — سنجش با استتِ useStudy).
4. flashcards: جبههٔ کارتِ کاربرددار چیپ دارد؛ کلیک فلپ نمی‌کند
   (aria-pressed همان false می‌ماند) و دیالوگ باز می‌شود.
5. سرصفحهٔ دیکشنری: بعد از mount، `dictionary-usage-stat` با «X از N» و ارقامِ
   فارسی حاضر است؛ X ≤ N و مطابقِ lib.

همان قاعدهٔ mock: `@/lib/analytics`، `@/hooks/use-toast`، `next/navigation`؛
beforeAll: scrollIntoView + matchMedia؛ بعدِ هر تست useStudy.setState پاک.

## ایدئوم‌هایِ الزامی

- صفرِ قانونِ CSS نو — کلاس‌هایِ inline رویِ ریمپ‌هایِ kernel (sky/amber).
- ارقامِ فارسی همه‌جا (faNum حتی در lib — درسِ r252).
- بی‌تطبیق، هیچ — چیپ و شمارنده هر دو صادق‌اند.
- css-hygiene: جابه‌جاییِ کلاس‌ها بینِ فایل‌ها نباید ماتریسِ مصرف‌کننده را
  تغییر دهد؛ اگر c-stone-70 جابه‌جا شد، قفل را با کامنتِ r253 رشد بده (الگویِ ۱۹۲).
- کامیت: انگلیسی؛ worklog: فارسی؛ بعدش push + آینهٔ rNNN-pack.

## ترتیبِ اجرا بعد از بازیابی

1. `git fetch origin && git reset --hard origin/main` + بازسازیِ آینه‌ها (RECOVERY-253.md)
2. سنجشِ محتوا: `src/lib/word-usage.ts` موجود؛ گیت‌ها = ۱۷۸۲/۱۷۸۲ (۱۷۹ فایل)
3. «ثبتِ دائمی» RECOVERY-253.md → worklog؛ این فایل و RECOVERY را پاک کن
4. همین نقشه را اجرا کن؛ در پایان: cleanupِ DB + push + آینهٔ راند
