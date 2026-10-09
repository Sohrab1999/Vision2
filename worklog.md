# Worklog — ویژن ۲ (Vision Two) وب‌کتاب تعاملی

---

Task ID: 1
Agent: main (Z.ai Code)
Task: بررسی پروژه و اسکیل‌ها (Papermorph، TTS)، تحلیل PDF جزوهٔ ۲۰۴ صفحه‌ای

Work Log:
- ریپوی https://github.com/DozenTwelve/Papermorph خوانده شد: «تبدیل PDF به کتاب وب تعاملی» با pipeline: PDF → Book plan → Animation & quizzes → Web book
- رویکرد Papermorph به‌صورت نیتیو در Next.js 16 پیاده شد (قفسه کتاب + درس‌های انیمیشنی + تست تعاملی + روخوانی)
- اسکیل TTS بارگذاری شد (z-ai-web-dev-sdk، صدای jam برای انگلیسی، محدودیت ۱۰۲۴ کاراکتر)
- کل محتوای PDF (۲۰۴ صفحه) استخراج و ساختاردهی شد: ۳ درس، ~۶۳۳ واژه، مکالمه‌ها، ریدینگ‌ها، گرامر، ~۲۰۰ تست با کلید و ترجمه

Stage Summary:
- طراحی داده: src/lib/study-types.ts (LessonData, QuizQuestion, VocabWord, ...)
- تصمیم: چون کاربر فقط route «/» را می‌بیند، اپ به‌صورت SPA تک‌صفحه‌ای با Zustand ساخته شد

---

Task ID: 2
Agent: main (Z.ai Code)
Task: Prisma schema + فایل‌های محتوایی ۳ درس + بانک آزمون + ضمیمه

Work Log:
- prisma/schema.prisma: مدل QuizAttempt (userId, lesson, category, total, correct, percent, createdAt) + db:push موفق
- src/data/lesson1.ts — «Understanding People»: ۲۰۴ واژه، مکالمهٔ کامل (میثم/صابریان)، ۲ ریدینگ، ۶ بخش گرامر (اسامی قابل/غیرقابل شمارش، صفات شمارش، اعداد، ترتیب اجزا)، ۴۰ مترادف، ۵۰ تست با ترجمهٔ فارسی
- src/data/lesson2.ts — «A Healthy Lifestyle»: ~۱۶۰ واژه، مکالمهٔ سینا/بهزاد، ۲ ریدینگ، گرامر حال کامل + افعال دوکلمه‌ای + اسم مصدر + پیشوند/پسوند، ۶۵ مترادف، ۴۰ تست
- src/data/lesson3.ts — «Art and Culture»: ~۱۵۵ واژه، مکالمهٔ رضا/گردشگر، ۲ ریدینگ، گرامر شرطی نوع اول + صفات ed/ing + مصدر با to، ۵۵ مترادف + ۷۰ متضاد، ۴۰ تست
- src/data/exam.ts — ۴۰ تست از بانک ۳۶۰ تستی با کلید صفحهٔ ۲۰۴
- src/data/appendix.ts — ۸۶ فعل بی‌قاعده، ۴۴ آوای IPA، اجزای کلام، نشانه‌های اختصاری

Stage Summary:
- کلیدهای تست‌ها عیناً از پاسخنامهٔ جزوه (صفحات ۱۷۶-۲۰۴) با ترجمه‌های تشریحی

---

Task ID: 3
Agent: main (Z.ai Code)
Task: بک‌اند (API) + استور + UI کامل

Work Log:
- API: /api/tts (روخوانی با صدای jam + کش ماژول‌سطح) و /api/stats (GET آمار، POST ثبت نتیجه با zod-like validation دستی)
- Zustand store با persist (skipHydration + rehydrate بعد از mount) برای پیشرفت کاربر: واژگان «بلدم» + بهترین نتیجهٔ هر دستهٔ تست
- الگوی useMounted با useSyncExternalStore (سازگار با قوانین lint جدید React 19)
- کامپوننت‌ها (src/components/study/): header، footer (sticky)، home-view (Hero + کتاب سه‌بعدی انیمیشنی + قفسه کتاب + کارت درس‌ها + ابزارها)، lesson-view (۵ تب)، vocab-tab (جستجو/فیلتر/علامت‌گذاری)، flashcards (فلپ سه‌بعدی)، conversation-tab (پخش پشت‌سرهم کل مکالمه)، reading-tab، grammar-tab (HTML تشریحی با جداول)، quiz-engine (فیدبک فوری + ترجمه + تایمر + review)، lesson-tests-tab، dictionary-view، exam-view (تعداد سؤال + تایمر)، appendix-view، speak-button، progress-ring
- layout.tsx: RTL + فارسی + فونت Vazirmatn (next/font)، page.tsx فقط «/»

Stage Summary:
- lint نهایی: ۰ خطا / ۰ هشدار

---

Task ID: 4
Agent: main (Z.ai Code)
Task: تست End-to-End با agent-browser و رفع باگ‌ها

Work Log:
- صفحهٔ اصلی، هر ۳ درس، ۵ تب هر درس، دیکشنری، آزمون جامع، ضمیمه — همه رندر و تعامل سالم
- باگ ۱ (رفع شد): فرمت mp3 در TTS API پذیرفته نمی‌شد (کد ۱۲۱۴) → به wav تغییر یافت؛ تست curl: WAV معتبر ۲۲۸KB در ۲۴kHz
- باگ ۲ (رفع شد): setState همگام در effect (قانون react-hooks/set-state-in-effect) → الگوی useSyncExternalStore و تایمر بازنویسی شد
- آزمون کامل ۲۰ سوالی اجرا و تمام شد؛ نتیجه (۴۰٪) هم در localStorage و هم در دیتابیس (POST /api/stats → Prisma INSERT) ذخیره شد
- فلش‌کارت: فلپ کار می‌کند، «بلدم» ذخیره و پس از reload پابرجاست
- روخوانی: POST /api/tts 200 در مرورگر
- موبایل (iPhone 14): چیدمان واکنش‌گرا و فوتر چسبان تأیید شد
- اسکرین‌شات‌ها: /tmp/home-final.png، /tmp/lesson-final.png، /tmp/mobile-home.png، /tmp/appendix.png

Stage Summary:
- وضعیت: MVP کامل و پایدار — ۶۳۳ واژه، ۱۷۰+ تست تعاملی، روخوانی هوش مصنوعی، پیشرفت ماندگار

---

Task ID: 5 (پیشنهاد برای ادامه)
Agent: next agent
Task: ایده‌های توسعهٔ بعدی

- نگارش (Writing): تمرین ترتیب کلمات drag & drop از بخش «جمله بسازید» جزوه
- Spaced repetition واقعی برای فلش‌کارت (SM-2)
- جدول ۳۶۰ تستی کامل‌تر + بخش «تست جامع پایان ترم» (صفحات ۱۱۴-۱۱۶)
- حالت شب (next-themes نصب است)
- صوتی‌سازی املاء (dictation) با نمایش حروف ناقص
- Leaderboard از /api/stats برای چند کاربره
