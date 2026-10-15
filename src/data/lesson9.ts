import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Nine: "The Value of Knowledge"  |  ارزش دانش
// Vision 1 (Grade 10) — Lesson Three · جزوهٔ پایهٔ دهم (راند ۱۹۴ — «قفسهٔ کامل»)
// Grammar focus: Future (will / be going to) + verb + to-infinitive
// =====================================================================

const vocabulary = [
  W("achieve", "به دست آوردن، محقق کردن", "v"),
  W("author", "نویسنده، مؤلف", "n"),
  W("brain", "مغز", "n"),
  W("chapter", "فصل (کتاب)", "n"),
  W("college", "دانشکده", "n"),
  W("communicate", "ارتباط برقرار کردن", "v"),
  W("correct", "درست، صحیح؛ اصلاح کردن", "adj"),
  W("curious", "کنجکاو", "adj"),
  W("curiosity", "کنجکاوی، فضولیِ علمی", "n"),
  W("degree", "مدرک دانشگاهی؛ درجه", "n"),
  W("dictionary", "واژه‌نامه، فرهنگ لغت", "n"),
  W("discover", "کشف کردن", "v"),
  W("discovery", "کشف", "n"),
  W("dream", "رؤیا؛ رؤیا دیدن", "n"),
  W("effort", "تلاش، زحمت", "n"),
  W("encyclopedia", "دانشنامه، دایرةالمعارف", "n"),
  W("experiment", "آزمایش", "n"),
  W("explain", "توضیح دادن", "v"),
  W("fact", "واقعیت، حقیقت", "n"),
  W("forget", "فراموش کردن", "v"),
  W("future", "آینده", "n"),
  W("goal", "هدف", "n"),
  W("graduate", "فارغ‌التحصیل شدن؛ فارغ‌التحصیل", "v"),
  W("hardworking", "سخت‌کوش، پرتلاش", "adj"),
  W("hope", "امید داشتن؛ امید", "v"),
  W("idea", "ایده، فکر", "n"),
  W("imagine", "تصور کردن، خیال کردن", "v"),
  W("information", "اطلاعات", "n"),
  W("invent", "اختراع کردن", "v"),
  W("invention", "اختراع", "n"),
  W("knowledge", "دانش، معرفت", "n"),
  W("laboratory", "آزمایشگاه", "n"),
  W("language", "زبان", "n"),
  W("library", "کتابخانه", "n"),
  W("meaning", "معنی، مفهوم", "n"),
  W("memorize", "حفظ کردن", "v"),
  W("mind", "ذهن، عقل", "n"),
  W("mistake", "اشتباه، خطا", "n"),
  W("novel", "رمان", "n"),
  W("opinion", "نظر، عقیده", "n"),
  W("patient", "صبور؛ بیمار", "adj"),
  W("poem", "شعر", "n"),
  W("practice", "تمرین کردن؛ تمرین", "v"),
  W("question", "سؤال؛ زیر سؤال بردن", "n"),
  W("read", "خواندن، مطالعه کردن", "v"),
  W("remember", "به یاد آوردن", "v"),
  W("research", "پژوهش، تحقیق", "n"),
  W("school", "مدرسه", "n"),
  W("science", "علم، دانشِ تجربی", "n"),
  W("scientist", "دانشمند", "n"),
  W("search", "جست‌وجو کردن؛ جست‌وجو", "v"),
  W("sentence", "جمله", "n"),
  W("skill", "مهارت", "n"),
  W("smart", "باهوش، زرنگ", "adj"),
  W("story", "داستان", "n"),
  W("study", "مطالعه کردن؛ مطالعه", "v"),
  W("succeed", "موفق شدن", "v"),
  W("success", "موفقیت، پیروزی", "n"),
  W("teach", "آموزش دادن، یاد دادن", "v"),
  W("teacher", "معلم، آموزگار", "n"),
  W("translate", "ترجمه کردن", "v"),
  W("truth", "حقیقت، راستی", "n"),
  W("understand", "فهمیدن، درک کردن", "v"),
  W("university", "دانشگاه", "n"),
  W("wise", "فرزانه، خردمند", "adj"),
  W("wisdom", "حکمت، خرد", "n"),
  W("wonder", "شگفت زده شدن؛ مشتاق بودن", "v"),
  W("word", "واژه، کلمه", "n"),
  W("write", "نوشتن", "v"),
  W("writer", "نویسنده، پدیدآور", "n"),
  // — واژگان جامع (راند ۲۱۰، گیت‌شده)
  W("across", "از عرض، در امتداد"),
  W("action", "اقدام، عمل، کار"),
  W("add", "اضافه کردن، جمع بستن"),
  W("adverb", "قید"),
  W("airplane", "هواپیما"),
  W("ashamed", "شرمنده، خجالت‌زده"),
  W("at all", "اصلاً، ابداً"),
  W("at that time", "در آن زمان"),
  W("background", "پس زمینه"),
  W("be", "بودن"),
  W("be after", "به دنبال بودن"),
  W("become", "شدن"),
  W("behave", "رفتار کردن"),
  W("belief", "اعتقاد، باور، ایمان"),
  W("believe", "باور داشتن ریاضی، ایمان داشتن ریاضی، عقیده"),
  W("carry out", "انجام دادن"),
  W("change into", "تبدیل شدن به، تبدیل کردن به"),
  W("come in", "وارد شدن، داخل شدن"),
  W("cultural", "فرهنگی"),
  W("description", "توصیف"),
  W("destroy", "تخریب کردن، نابود کردن"),
  W("develop", "توسعه دادن، گسترش دادن"),
  W("do research", "تحقیق انجام دادن"),
  W("emotion", "احساس"),
  W("emotional", "احساسی، عاطفی"),
  W("emphatic", "تأکیدی"),
  W("energetic", "پر انرژی، فعال"),
  W("everything", "هر چی زی- هر کاری"),
  W("experience", "تجربه - تجربه کردن"),
  W("express", "بیان کردن، ابزار کردن"),
  W("face", "مواجه شدن، روبرو شدن - صورت، چهره"),
  W("farmer", "کشاورز"),
  W("finally", "در نهایت، سرانجام"),
  W("fortunately", "خوشبختانه"),
  W("full of", "پر از"),
  W("gain", "به دست آوردن، کسب کردن"),
  W("give up", "رها کردن، تسلیم شدن، ترک کردن"),
  W("given", "داده شده - ارائه شده"),
  W("grow up", "رشد کردن، بالغ شدن"),
  W("hall", "هال، اتاق بزرگ، تالار"),
  W("have fun", "خوش گذراندن، تفریح داشتن"),
  W("herself", "خودش خانم"),
  W("himself", "خودش آقا"),
  W("honest", "درستکار، صادق، راستگو"),
  W("honestly", "به درستی، صادقانه"),
  W("host", "میزبان، مهمان‌داری کردن"),
  W("illness", "بیماری"),
  W("image", "تصور تصویر، عکس"),
  W("in fact", "در حقیقت"),
  W("inventor", "مخترع"),
  W("itself", "خودش غیر انسان"),
  W("kill", "کشتن"),
  W("medicine", "دوا، دارو - پزشکی"),
  W("narrate", "نقل کردن- روایت کردن"),
  W("no one", "هیچ کش"),
  W("noise", "سر و صدا، شلوغی"),
  W("noisy", "پرسر و صدا"),
  W("notice", "توجه - متوجه شدن"),
  W("organization", "سازمان"),
  W("painful", "دردناک"),
  W("paradise", "بهشت"),
  W("passport", "پاسپورت"),
  W("peace", "صلح- آرامش"),
  W("pilgrim", "زائر، مسافر مذهبی"),
  W("poet", "شاعر"),
  W("quickly", "به سرعت"),
  W("quit", "ترک کردن، تسلیم شدن"),
  W("rainy", "بارانی"),
  W("relate", "ربط دادن، مربوط بودن"),
  W("researcher", "محقق"),
  W("rich", "ثروتمند"),
  W("sadly", "متأسفانه، با ناراحتی"),
  W("save", "ذخیره کردن، پس‌انداز کردن، رهائی کردن"),
  W("seek", "جستجو کردن، پیگیری کردن"),
  W("seem", "به نظر رسیدن"),
  W("sense", "حس، احساس؛ حِسّ (دیداری/ششم)"),
  W("similar", "مشابه، مانند"),
  W("skillful", "ماهر"),
  W("slowly", "به آرامی"),
  W("smoke", "دود؛ سیگار کشیدن"),
  W("solution", "راه‌حل، محلول"),
  W("solve", "حل کردن، حل‌وفصل کردن"),
  W("souvenir", "سوغات، یادگاری"),
  W("speaker", "متکلم، گوینده"),
  W("speed", "سرعت"),
  W("still", "هنوز، بازهم"),
  W("successful", "موفق، کامیاب"),
  W("successfully", "با موفقیت"),
  W("suggestion", "پیشنهاد، نظریه"),
  W("suitably", "به طور مناسب"),
  W("take time", "زمان بردن، طول کشیدن"),
  W("tour", "سفر تفریح، گردش، اردو"),
  W("traditional", "سنتی، مرسوم"),
  W("transportation", "حمل‌ونقل، ترابری"),
  W("travel agency", "آژانس مسافرتر"),
  W("travel agent", "کارمند آژانس مسافرتر"),
  W("traveler", "مسافر"),
  W("unfortunately", "متأسفانه"),
  W("until", "تا، تا اینکه"),
  W("vacation", "تعطیلات"),
  W("valuable", "باارزش، گران‌بها"),
  W("value", "ارزش، بها - ارزش قائل شدن، ارزش‌گذاری کردن"),
  W("waste", "هدر دادن؛ زباله، دورریز"),
  W("week", "هفته"),
  W("wind", "باد، نسیم"),
  W("windy", "طوفانی"),
];

const conversation = {
  introEn: "Listen to the conversation between Hadi, a tenth-grade student, and his uncle, Professor Nasiri, about the value of knowledge.",
  introFa: "به مکالمهٔ هادی، دانش‌آموز پایهٔ دهم، و عمویش، استاد نصیری، دربارهٔ ارزش دانش گوش دهید.",
  lines: [
    {
      speaker: "Hadi",
      speakerFa: "هادی",
      en: "Uncle, you read so many books! Don't you ever get tired of studying?",
      fa: "عمو، شما خیلی کتاب می‌خوانید! از درس‌خواندن خسته نمی‌شوید؟",
    },
    {
      speaker: "Professor Nasiri",
      speakerFa: "استاد نصیری",
      en: "Never, Hadi. For me, a book is a door: when you open it, you walk into a new world.",
      fa: "هرگز، هادی. برای من کتاب یک در است: وقتی بازش کنی، وارد دنیایی تازه می‌شوی.",
    },
    {
      speaker: "Hadi",
      speakerFa: "هادی",
      en: "But we have the internet now. We can find any information in seconds.",
      fa: "اما الان اینترنت داریم. هر اطلاعاتی را در چند ثانیه پیدا می‌کنیم.",
    },
    {
      speaker: "Professor Nasiri",
      speakerFa: "استاد نصیری",
      en: "The internet is a great tool, but finding information is not the same as understanding it. Knowledge needs thinking.",
      fa: "اینترنت ابزار فوق‌العاده‌ای است، اما پیدا کردنِ اطلاعات با فهمیدنش فرق دارد. دانش به فکر کردن نیاز دارد.",
    },
    {
      speaker: "Hadi",
      speakerFa: "هادی",
      en: "So what is the best way to really learn something new?",
      fa: "پس بهترین راه برای واقعاً یاد گرفتنِ چیزی تازه چیست؟",
    },
    {
      speaker: "Professor Nasiri",
      speakerFa: "استاد نصیری",
      en: "Be curious first. Ask questions, make mistakes, and correct them. Every scientist in history started with a simple question.",
      fa: "اول کنجکاو باش. سؤال بپرس، اشتباه کن و اشتباه‌هایت را اصلاح کن. هر دانشمندی در تاریخ با یک سؤالِ ساده شروع کرد.",
    },
    {
      speaker: "Hadi",
      speakerFa: "هادی",
      en: "I hope to study medicine at university one day. What should I do from now?",
      fa: "امیدوارم یک روز در دانشگاه پزشکی بخوانم. از الان چه باید بکنم؟",
    },
    {
      speaker: "Professor Nasiri",
      speakerFa: "استاد نصیری",
      en: "Read one page of science every day, practice your English, and never be afraid of hard questions. That is how you will achieve your goal.",
      fa: "هر روز یک صفحه علم بخوان، انگلیسی‌ات را تمرین کن و هرگز از سؤال‌های سخت نترس. این‌طور به هدفت می‌رسی.",
    },
    {
      speaker: "Hadi",
      speakerFa: "هادی",
      en: "And what about you, uncle? What are you going to write next?",
      fa: "و شما چه، عمو؟ بعدی قرار است چه بنویسید؟",
    },
    {
      speaker: "Professor Nasiri",
      speakerFa: "استاد نصیری",
      en: "I am going to write a book about ten Persian scientists who changed the world. Their stories will surprise you.",
      fa: "می‌خواهم کتابی دربارهٔ ده دانشمند ایرانی که دنیا را تغییر دادند بنویسم. داستان‌هایشان تو را غافلگیر می‌کند.",
    },
    {
      speaker: "Hadi",
      speakerFa: "هادی",
      en: "I will be the first person to read it! Thank you, uncle — from today, I am going to use my library card every week.",
      fa: "اولین کسی خواهم بود که آن را می‌خواند! ممنون عمو — از امروز قرار است هر هفته از کارت کتابخانه‌ام استفاده کنم.",
    },
    {
      speaker: "Professor Nasiri",
      speakerFa: "استاد نصیری",
      en: "That is the best promise a student can make. Remember: knowledge is the only treasure that grows when you give it away.",
      fa: "آن بهترین قولی است که یک دانش‌آموز می‌تواند بدهد. یادت باشد: دانش تنها گنجی است که وقتی بخشش کنی بیشتر می‌شود.",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "The Value of Knowledge",
    titleFa: "ارزش دانش",
    source: "Vision 1 — Student Book: Lesson Three",
    paragraphs: [
      {
        en: "Why do people build schools, libraries, and universities in every country of the world? Because knowledge is the most valuable treasure that a human being can own. Money can be lost in one day, but what you learn stays in your mind forever and grows every time you share it.",
        fa: "چرا مردم در هر کشوری مدرسه، کتابخانه و دانشگاه می‌سازند؟ چون دانش باارزش‌ترین گنجی است که یک انسان می‌تواند داشته باشد. پول می‌تواند در یک روز از دست برود، اما آنچه می‌آموزی برای همیشه در ذهنت می‌ماند و هر بار که به اشتراکش می‌گذاری بیشتر می‌شود.",
      },
      {
        en: "Every great invention started in a curious mind. When a scientist asks a simple question — why does the apple fall down? — a whole new science can begin. Curiosity is the seed, questions are the water, and effort is the sunlight that makes knowledge grow.",
        fa: "هر اختراع بزرگ در ذهنی کنجکاو شروع شد. وقتی دانشمندی سؤالی ساده می‌پرسد — چرا سیب پایین می‌افتد؟ — می‌تواند علمی تازه آغاز شود. کنجکاوی بذر است، سؤال‌ها آب‌اند و تلاش نورِ خورشیدی است که به دانش رشد می‌دهد.",
      },
      {
        en: "Learning a language is a perfect example. Nobody is born knowing English or Arabic. Step by step, word by word, you practice, you make mistakes, and you correct them. One day you understand a book, a poem, or a person from another culture — and your world becomes larger.",
        fa: "یادگیری زبان نمونهٔ کاملی است. هیچ‌کس انگلیسی یا عربی بلد به دنیا نمی‌آید. قدم‌به‌قدم، واژه‌به‌واژه تمرین می‌کنی، اشتباه می‌کنی و اصلاح می‌کنی. یک روز کتابی، شعری یا انسانی از فرهنگی دیگر را می‌فهمی — و دنیایت بزرگ‌تر می‌شود.",
      },
      {
        en: "Libraries are the treasure houses of nations. Inside a quiet library, you can sit next to the wisest people of history: poets, scientists, and travelers who wrote their discoveries thousands of years ago. They will teach you patiently, and they will never ask for money.",
        fa: "کتابخانه‌ها خزانه‌های ملت‌ها هستند. درونِ یک کتابخانهٔ ساکت، می‌توانی کنارِ فرزانه‌ترین مردمِ تاریخ بنشینی: شاعران، دانشمندان و مسافرانی که هزاران سال پیش کشف‌هایشان را نوشتند. آن‌ها صبورانه به تو یاد می‌دهند و هرگز پول نمی‌خواهند.",
      },
      {
        en: "The future will belong to those who keep learning. Machines are becoming faster and stronger, but a wise, creative, and curious mind will always be precious. So read one more page today, ask one more question, and remember: a person with knowledge carries a light that never goes out.",
        fa: "آینده از آنِ کسانی خواهد بود که یادگیری را ادامه می‌دهند. ماشین‌ها تندتر و قوی‌تر می‌شوند، اما ذهنِ فرزانه و خلاق و کنجکاو همیشه گران‌بها خواهد بود. پس امروز یک صفحهٔ بیشتر بخوان، یک سؤالِ دیگر بپرس و یادت باشد: انسانِ دانشمند نوری با خود حمل می‌کند که هرگز خاموش نمی‌شود.",
      },
    ],
  },
  {
    titleEn: "A Dream Called University",
    titleFa: "رؤیایی به نام دانشگاه",
    source: "Vision 1 — Workbook: Lesson Three",
    paragraphs: [
      {
        en: "In a small village far from the city, a girl named Zhina walked two hours to school every morning. Her school was simple, and the library had only one shelf of old books. But her teacher told the class: 'Every book you read is a window. Open as many windows as you can.'",
        fa: "در روستایی کوچک و دور از شهر، دختری به نام ژیلا هر صبح دو ساعت پیاده تا مدرسه می‌رفت. مدرسه‌اش ساده بود و کتابخانه‌اش فقط یک قفسهٔ کتابِ قدیمی داشت. اما معلمش به کلاس می‌گفت: «هر کتابی که می‌خوانی یک پنجره است. هرچه می‌توانی پنجره باز کن.»",
      },
      {
        en: "Zhina followed that advice. She read every book in the village, then borrowed books from the city library by mail. She made mistakes, she forgot many words, but she never stopped. Her classmates laughed at first; two years later, they were asking her to explain the lessons.",
        fa: "ژیلا آن توصیه را گوش داد. هر کتابِ روستا را خواند، بعد با پست از کتابخانهٔ شهر کتاب قرض گرفت. اشتباه کرد، خیلی واژه‌ها را فراموش کرد، اما هرگز توقف نکرد. هم‌کلاسی‌هایش اول خندیدند؛ دو سال بعد از او می‌خواستند درس‌ها را توضیح دهد.",
      },
      {
        en: "When she finished high school, Zhina took the national exam and entered one of the best universities in the country. She chose to study engineering because she wanted to build things that help people. Her parents, who could not read or write, traveled for the first time to see her graduation.",
        fa: "وقتی ژیلا دبیرستان را تمام کرد، در آزمونِ سراسری شرکت کرد و وارد یکی از بهترین دانشگاه‌های کشور شد. مهندسی خواند چون می‌خواست چیزهایی بسازد که به مردم کمک کند. پدر و مادرش، که سواد خواندن و نوشتن نداشتند، برای اولین بار سفر کردند تا فارغ‌التحصیلی‌اش را ببینند.",
      },
      {
        en: "Today, Zhina is an engineer, and she is going to build the first real library in her village. 'Knowledge changed my life,' she says. 'Now it is my turn to open windows for the children of my village.' Her story shows that effort and hope can turn a dream into a plan.",
        fa: "امروز ژیلا مهندس است و می‌خواهد نخستین کتابخانهٔ واقعی روستایش را بسازد. می‌گوید: «دانش زندگی‌ام را تغییر داد. حالا نوبت من است که برای بچه‌های روستایم پنجره باز کنم.» داستانش نشان می‌دهد تلاش و امید می‌تواند رؤیا را به برنامه تبدیل کند.",
      },
      {
        en: "You do not have to walk two hours like Zhina; your school is probably closer, and your phone can reach a thousand libraries. The only question is: what are you going to read this week? Choose a book, set a small goal, and start today — your future self will thank you.",
        fa: "لازم نیست مثل ژیلا دو ساعت پیاده روی کنی؛ مدرسه‌ات احتمالاً نزدیک‌تر است و گوشی‌ات به هزار کتابخانه می‌رسد. تنها سؤال این است: این هفته چه می‌خواهی بخوانی؟ یک کتاب انتخاب کن، هدفی کوچک بگذار و از امروز شروع کن — آیندهٔ خودت از تو تشکر خواهد کرد.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "آینده با will (Future with will)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">با ${EN(
        "will + شکل سادهٔ فعل"
      )} از «پیش‌بینی، قول و تصمیمِ همان‌لحظه‌ای» دربارهٔ آینده حرف می‌زنیم. این ساخت برای همهٔ فاعل‌ها یکسان است:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-fuchsia-700 text-white"><th class="px-3 py-2">کاربرد</th><th class="px-3 py-2">مثال</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">پیش‌بینی</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Knowledge <b>will open</b> many doors for you.</td><td class="px-3 py-2 border-t border-stone-100">دانش درهای زیادی را برایت باز خواهد کرد.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">قول دادن</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I <b>will be</b> the first person to read it.</td><td class="px-3 py-2 border-t border-stone-100">اولین کسی خواهم بود که آن را می‌خواند.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">تصمیمِ لحظه‌ای</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">It's late. I <b>will call</b> a taxi.</td><td class="px-3 py-2 border-t border-stone-100">دیر است. تاکسی زنگ می‌زنم.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">منفی</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Money <b>will not (won't)</b> buy wisdom.</td><td class="px-3 py-2 border-t border-stone-100">پول خرد نخواهد خرید.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">سؤالی</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Will</b> you <b>help</b> me with the essay?</td><td class="px-3 py-2 border-t border-stone-100">در انشا کمکم می‌کنی؟</td></tr>
      </tbody></table></div>`,
  },
  {
    title: "آینده با be going to و تفاوت با will",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">با ${EN(
        "am/is/are + going to + فعل"
      )} از «برنامه‌های از قبل چیده‌شده» یا «پیش‌بینی بر پایهٔ شواهدِ موجود» صحبت می‌کنیم:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-fuchsia-700 text-white"><th class="px-3 py-2">will</th><th class="px-3 py-2">be going to</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">تصمیمِ همان لحظه</td><td class="px-3 py-2 border-t border-stone-100">برنامهٔ از قبل</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The bag is heavy. I <b>will help</b> you.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I <b>am going to study</b> medicine. (رؤیای دیرینه)</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">پیش‌بینیِ شخصی (به نظرم)</td><td class="px-3 py-2 border-t border-stone-100">پیش‌بینیِ شواهدِ دیده‌شده</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I think she <b>will pass</b> the exam.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Look at those clouds! It <b>is going to rain</b>.</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکتهٔ کنکوری:</b> بعد از ${EN(
        "going to"
      )} شکل سادهٔ فعل می‌آید: ${EN(
        "I am going to <b>write</b> a book. (NOT: going to wrote)"
      )} — و در سؤالی، فعلِ to be جابه‌جا می‌شود: ${EN("<b>Are</b> you going to read it?")}</div>`,
  },
  {
    title: "فعل + مصدر با to (Verb + to-Infinitive)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">بعضی فعل‌ها بعد از خودشان «مصدر با to» می‌خواهند. پرتکرارترین‌ها: ${EN(
        "want, hope, plan, decide, try, need, learn, promise, agree"
      )}:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-fuchsia-700 text-white"><th class="px-3 py-2">فعل</th><th class="px-3 py-2">مثال</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">want</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I <b>want to learn</b> three languages.</td><td class="px-3 py-2 border-t border-stone-100">می‌خواهم سه زبان یاد بگیرم.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">hope</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She <b>hopes to study</b> medicine.</td><td class="px-3 py-2 border-t border-stone-100">امیدوار است پزشکی بخواند.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">decide</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We <b>decided to open</b> a small library.</td><td class="px-3 py-2 border-t border-stone-100">تصمیم گرفتیم کتابخانه‌ای کوچک باز کنیم.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">try</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Try <b>to read</b> one page every day.</td><td class="px-3 py-2 border-t border-stone-100">سعی کن هر روز یک صفحه بخوانی.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">promise</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>promised to return</b> the book.</td><td class="px-3 py-2 border-t border-stone-100">قول داد کتاب را برگرداند.</td></tr>
      </tbody></table></div>
      <div class="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-3 text-sm leading-7 text-fuchsia-900">💡 <b>نکتهٔ کنکوری:</b> بعد از حرفِ اضافه یا این فعل‌ها (enjoy، finish، avoid، keep) «ing» می‌آید نه مصدر: ${EN(
        "I enjoy <b>reading</b>. — I hope <b>to read</b> it."
      )} — دو الگو را با هم قاطی نکن.</div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l9-w1", fa: "دانش درهای زیادی را برایت باز خواهد کرد.", answer: ["Knowledge", "will", "open", "many", "doors", "for", "you"], hint: "آینده با will + شکل سادهٔ فعل" },
  { id: "l9-w2", fa: "من می‌خواهم پزشکی بخوانم.", answer: ["I", "am", "going", "to", "study", "medicine"], hint: "برنامهٔ از قبل: be going to + فعل" },
  { id: "l9-w3", fa: "او امیدوار است در دانشگاه موفق شود.", answer: ["She", "hopes", "to", "succeed", "at", "university"], hint: "hope + مصدر با to" },
  { id: "l9-w4", fa: "آن ابرها را ببین! باران خواهد بارید.", answer: ["Look", "at", "those", "clouds!", "It", "is", "going", "to", "rain"], hint: "پیش‌بینی بر پایهٔ شواهد: be going to" },
  { id: "l9-w5", fa: "ما تصمیم گرفتیم کتابخانه‌ای کوچک باز کنیم.", answer: ["We", "decided", "to", "open", "a", "small", "library"], hint: "decide + مصدر با to" },
  { id: "l9-w6", fa: "دیر است؛ من به تو زنگ خواهم زد.", answer: ["It", "is", "late;", "I", "will", "call", "you"], hint: "تصمیمِ لحظه‌ای: will" },
  { id: "l9-w7", fa: "سعی کن هر روز یک صفحه بخوانی.", answer: ["Try", "to", "read", "one", "page", "every", "day"], hint: "try + مصدر با to" },
  { id: "l9-w8", fa: "پول خرد نخواهد خرید.", answer: ["Money", "will", "not", "buy", "wisdom"], hint: "منفیِ آینده: will not (won't)" },
];

const synonyms = [
  SYN("knowledge", "understanding", "دانش ↔ فهم و شناخت"),
  SYN("wise", "sage", "فرزانه ↔ حکیم"),
  SYN("smart", "bright", "باهوش ↔ تیزهوش"),
  SYN("curious", "inquisitive", "کنجکاو ↔ جست‌وجوگر"),
  SYN("discover", "find out", "کشف کردن ↔ پی بردن"),
  SYN("invent", "create", "اختراع کردن ↔ آفریدن"),
  SYN("valuable", "precious", "ارزشمند ↔ گران‌بها"),
  SYN("succeed", "prosper", "موفق شدن ↔ پیشرفت کردن"),
  SYN("effort", "struggle", "تلاش ↔ کوشش"),
  SYN("truth", "reality", "حقیقت ↔ واقعیت"),
  SYN("remember", "recall", "به یاد آوردن ↔ به خاطر آوردن"),
  SYN("explain", "clarify", "توضیح دادن ↔ روشن کردن"),
  SYN("goal", "aim", "هدف ↔ مقصود"),
  SYN("hardworking", "diligent", "سخت‌کوش ↔ کوشا"),
  SYN("author", "writer", "نویسنده ↔ پدیدآور"),
  SYN("famous", "well-known", "مشهور ↔ شناخته‌شده"),
];

const antonyms = [
  ANT("knowledge", "ignorance", "دانش ↔ جهل"),
  ANT("wise", "foolish", "فرزانه ↔ نادان"),
  ANT("remember", "forget", "به یاد آوردن ↔ فراموش کردن"),
  ANT("succeed", "fail", "موفق شدن ↔ شکست خوردن"),
  ANT("correct", "wrong", "درست ↔ غلط"),
  ANT("future", "past", "آینده ↔ گذشته"),
  ANT("patient", "impatient", "صبور ↔ بی‌حوصله"),
  ANT("hardworking", "lazy", "سخت‌کوش ↔ تنبل"),
  ANT("understand", "misunderstand", "فهمیدن ↔ بدفهمیدن"),
  ANT("question", "answer", "سؤال ↔ جواب"),
  ANT("strength", "weakness", "قدرت ↔ ضعف"),
  ANT("begin", "finish", "شروع کردن ↔ تمام کردن"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۱۵ تست) ----------------
  Q("l9-v1", "vocab", "---------------- is the most valuable treasure that a person can own.", ["Knowledge", "Money", "Furniture", "Weather"], 0, "دانش باارزش‌ترین گنجی است که انسان می‌تواند داشته باشد."),
  Q("l9-v2", "vocab", "Scientists work in a ---------------- and do many tests there.", ["laboratory", "library", "university", "station"], 0, "دانشمندان در آزمایشگاه کار می‌کنند و آن‌جا آزمایش‌های زیادی انجام می‌دهند."),
  Q("l9-v3", "vocab", "You can find the meaning of new words in a ----------------.", ["dictionary", "novel", "poem", "chapter"], 0, "معنی واژه‌های تازه را در واژه‌نامه می‌توانی پیدا کنی."),
  Q("l9-v4", "vocab", "Curious people always ask ---------------- and try to find the answers.", ["questions", "mistakes", "stories", "experiments"], 0, "آدم‌های کنجکاو همیشه سؤال می‌پرسند و سعی می‌کنند جواب‌ها را پیدا کنند."),
  Q("l9-v5", "vocab", "Thomas Edison was a great ---------------- who invented the light bulb.", ["inventor", "author", "translator", "traveler"], 0, "توماس ادیسون مخترعِ بزرگی بود که لامپ را اختراع کرد."),
  Q("l9-v6", "vocab", "If you practice every day, you will make fewer ---------------- and learn faster.", ["mistakes", "degrees", "wisdom", "facts"], 0, "اگر هر روز تمرین کنی، اشتباه‌های کمتری می‌کنی و سریع‌تر یاد می‌گیری."),
  Q("l9-v7", "vocab", "My sister will ---------------- from university next year with a good degree.", ["graduate", "teach", "translate", "memorize"], 0, "خواهرم سال آینده با مدرکِ خوبی از دانشگاه فارغ‌التحصیل می‌شود."),
  Q("l9-v8", "vocab", "The library is quiet, so it is the best place to ---------------- your lessons.", ["study", "search", "explain", "correct"], 0, "کتابخانه ساکت است، پس بهترین جای مطالعهٔ درس‌هایت است."),
  Q("l9-v9", "vocab", "Reading books gives you a lot of useful ---------------- about the world.", ["information", "furniture", "machines", "buildings"], 0, "کتاب‌خواندن اطلاعاتِ مفید زیادی دربارهٔ دنیا به تو می‌دهد."),
  Q("l9-v10", "vocab", "A ---------------- person thinks before he speaks and learns all his life.", ["wise", "lazy", "wrong", "quick"], 0, "انسانِ فرزانه قبل از حرف زدن فکر می‌کند و تمامِ عمر یاد می‌گیرد."),
  Q("l9-v11", "vocab", "Please ---------------- this sentence from English into Persian.", ["translate", "explain", "invent", "practice"], 0, "لطفاً این جمله را از انگلیسی به فارسی ترجمه کن."),
  Q("l9-v12", "vocab", "Hard work and hope are the two keys to ---------------- in life.", ["success", "mistake", "language", "knowledge"], 0, "کارِ سخت و امید دو کلیدِ موفقیت در زندگی‌اند."),
  Q("l9-v13", "vocab", "I didn't ---------------- the teacher's explanation, so I asked her again.", ["understand", "remember", "forget", "answer"], 0, "توضیحِ معلم را نفهمیدم، پس دوباره ازش پرسیدم."),
  Q("l9-v14", "vocab", "You need a lot of ---------------- to learn a new skill well.", ["practice", "furniture", "money", "luck"], 0, "برای خوب یاد گرفتنِ یک مهارت تازه به تمرینِ زیادی نیاز داری."),
  Q("l9-v15", "vocab", "The first ---------------- of this book talks about the history of science.", ["chapter", "author", "library", "language"], 0, "فصلِ اول این کتاب دربارهٔ تاریخِ علم صحبت می‌کند."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l9-k1", "vocab-konkuri", "Great scientists never lose their ----------------; they always want to know more.", ["curiosity", "memory", "furniture", "wisdom"], 0, "دانشمندان بزرگ هرگز کنجکاوی‌شان را از دست نمی‌دهند؛ همیشه می‌خواهند بیشتر بدانند."),
  Q("l9-k2", "vocab-konkuri", "The old man shared his ---------------- with the young students of the village.", ["wisdom", "mistake", "novel", "degree"], 0, "پیرمرد خردش را با دانش‌آموزانِ جوانِ روستا به اشتراک گذاشت."),
  Q("l9-k3", "vocab-konkuri", "Hafez wrote the most beautiful ---------------- in the Persian language.", ["poems", "experiments", "degrees", "libraries"], 0, "حافظ زیباترین شعرها را به زبان فارسی سرود."),
  Q("l9-k4", "vocab-konkuri", "The teacher asked us to ---------------- the new words; we must not forget them.", ["memorize", "discover", "explain", "translate"], 0, "معلم خواست واژه‌های جدید را حفظ کنیم؛ نباید فراموششان کنیم."),
  Q("l9-k5", "vocab-konkuri", "Two plus two equals four — that is a simple scientific ----------------.", ["fact", "opinion", "story", "dream"], 0, "دو به‌علاوهٔ دو مساوی چهار است — این یک واقعیتِ علمیِ ساده است."),
  Q("l9-k6", "vocab-konkuri", "In my ----------------, reading before bed helps you sleep better.", ["opinion", "laboratory", "chapter", "degree"], 0, "به نظر من، خواندن قبل از خواب کمک می‌کند بهتر بخوابی."),
  Q("l9-k7", "vocab-konkuri", "Marie Curie made an important ----------------: a new element called radium.", ["discovery", "invention", "sentence", "word"], 0, "ماری کوری کشفِ مهمی کرد: عنصری تازه به نام رادیوم."),
  Q("l9-k8", "vocab-konkuri", "Try to ---------------- your goal step by step; success does not come overnight.", ["achieve", "memorize", "borrow", "search"], 0, "سعی کن هدفت را قدم‌به‌قدم به دست بیاوری؛ موفقیت شبه‌روزی نمی‌آید."),
  Q("l9-k9", "vocab-konkuri", "The brain controls the whole body; it is the center of our thoughts and ----------------.", ["memory", "practice", "story", "truth"], 0, "مغز کل بدن را کنترل می‌کند؛ مرکزِ افکار و حافظهٔ ماست."),
  Q("l9-k10", "vocab-konkuri", "Do not believe everything you read online; some news is not based on ----------------.", ["truth", "novels", "poems", "dreams"], 0, "به همه‌چیزِ آنلاین باور نکن؛ بعضی خبرها بر پایهٔ حقیقت نیست."),
  Q("l9-k11", "vocab-konkuri", "Jack arrived home while his father was watching his ---------------- film in the living room.", ["interested", "famous", "favorite", "energetic"], 2, "جک به خانه رسید وقتی پدرش فیلمِ محبوبش را در اتاق نشیمن تماشا می‌کرد."),
  Q("l9-k12", "vocab-konkuri", "We're planning to travel to Russia by ---------------- this summer. I like flying.", ["airplane", "boat", "ship", "train"], 0, "برنامه داریم این تابستان با هواپیما به روسیه سفر کنیم؛ من پرواز را دوست دارم."),
  Q("l9-k13", "vocab-konkuri", "I'm reading a book which is about ---------------- Iranian great scientists such as Avicenna and Razi.", ["favorite", "famous", "energetic", "possible"], 1, "کتابی می‌خوانم که دربارهٔ دانشمندانِ بزرگِ ایرانی مثل ابوعلی سینا و رازی است."),
  Q("l9-k14", "vocab-konkuri", "That novel was so ---------------- that I learned a lot of interesting things from it.", ["useful", "natural", "famous", "energetic"], 0, "آن رمان آن‌قدر مفید بود که چیزهای جالبِ زیادی از آن یاد گرفتم."),
  Q("l9-k15", "vocab-konkuri", "She studies ---------------- at Tehran university. She likes to be a doctor.", ["medicine", "geography", "chemistry", "literature"], 0, "او در دانشگاه تهران پزشکی می‌خواند؛ دوست دارد پزشک شود."),
  // ---------------- گرامر (۱۵ تست) ----------------
  Q("l9-g1", "grammar", "I think knowledge ---------------- many doors for you in the future.", ["will open", "opens to", "is opening", "opened"], 0, "فکر می‌کنم دانش در آینده درهای زیادی را برایت باز خواهد کرد.", "پیش‌بینی با will + شکل سادهٔ فعل."),
  Q("l9-g2", "grammar", "It is late. I ---------------- you to the bus stop.", ["will take", "am taking to", "take", "took"], 0, "دیر است؛ من تو را تا ایستگاه اتوبوس می‌برم.", "تصمیمِ همان لحظه → will."),
  Q("l9-g3", "grammar", "Don't worry about the exam; I promise I ---------------- you.", ["will help", "am helping", "help", "helped"], 0, "نگران امتحان نباش؛ قول می‌دهم کمکت کنم.", "قول دادن با will."),
  Q("l9-g4", "grammar", "Money ---------------- buy wisdom.", ["won't", "willn't", "not will", "doesn't will"], 0, "پول خرد نخواهد خرید.", "منفیِ will → will not (won't)."),
  Q("l9-g5", "grammar", "---------------- you ---------------- me with my essay tonight?", ["Will / help", "Are / help", "Do / will", "Will / helping"], 0, "امشب در انشایم کمکم می‌کنی؟", "سؤالیِ آینده: Will + فاعل + فعلِ ساده."),
  Q("l9-g6", "grammar", "Next year, my brother ---------------- medicine at a famous university.", ["is going to study", "will studying", "goes study", "studies to"], 0, "سال آینده برادرم می‌خواهد در دانشگاهی معروف پزشکی بخواند.", "برنامهٔ از قبل → be going to + فعلِ ساده."),
  Q("l9-g7", "grammar", "Look at those black clouds! It ---------------- rain.", ["is going to", "will to", "goes to", "is going"], 0, "آن ابرهای سیاه را ببین! باران خواهد بارید.", "پیش‌بینیِ بر پایهٔ شواهد → be going to."),
  Q("l9-g8", "grammar", "We ---------------- a small library in our school next month; the plan is ready.", ["are going to open", "will opening", "open to", "are opening to"], 0, "ماهِ آینده می‌خواهیم کتابخانه‌ای کوچک در مدرسه باز کنیم؛ برنامه آماده است.", "برنامهٔ چیده‌شده → are going to."),
  Q("l9-g9", "grammar", "I am going to ---------------- a book about Persian scientists.", ["write", "writing", "wrote", "written"], 0, "می‌خواهم کتابی دربارهٔ دانشمندان ایرانی بنویسم.", "بعد از going to شکل سادهٔ فعل می‌آید."),
  Q("l9-g10", "grammar", "---------------- you going to read the whole novel this week?", ["Are", "Will", "Do", "Is"], 0, "این هفته می‌خواهی کل رمان را بخوانی؟", "سؤالیِ be going to: فعل to be جابه‌جا می‌شود."),
  Q("l9-g11", "grammar", "She hopes ---------------- medicine at university one day.", ["to study", "studying", "study", "studies"], 0, "او امیدوار است یک روز در دانشگاه پزشکی بخواند.", "hope + مصدر با to."),
  Q("l9-g12", "grammar", "We decided ---------------- a new skill this summer.", ["to learn", "learning", "learn", "learned"], 0, "تصمیم گرفتیم این تابستان یک مهارت تازه یاد بگیریم.", "decide + مصدر با to."),
  Q("l9-g13", "grammar", "Try ---------------- one page of science every day.", ["to read", "reading to", "read", "reads"], 0, "سعی کن هر روز یک صفحهٔ علم بخوانی.", "try + مصدر با to."),
  Q("l9-g14", "grammar", "He promised ---------------- the book to the library on time.", ["to return", "returning", "return", "returned"], 0, "قول داد کتاب را سرِ وقت به کتابخانه برگرداند.", "promise + مصدر با to."),
  Q("l9-g15", "grammar", "I enjoy ---------------- in the quiet library, but I hope ---------------- more books at home too.", ["reading / to buy", "to read / buying", "read / to buy", "reading / buying"], 0, "از خواندن در کتابخانهٔ ساکت لذت می‌برم، اما امیدوارم کتاب‌های بیشتری هم برای خانه بخرم.", "enjoy + ing؛ hope + مصدر با to."),
];

export const lesson9: LessonData = {
  id: 9,
  titleEn: "The Value of Knowledge",
  titleFa: "ارزش دانش",
  tagline: "کتاب‌خوانی، دانشگاه و آینده با will و be going to",
  color: "fuchsia",
  grade: "دهم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  antonyms,
  writing,
  quizzes,
};

export default lesson9;
