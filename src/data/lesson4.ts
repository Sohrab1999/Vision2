import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Four: "Sense of Appreciation"  |  حس قدردانی
// Vision 3 (Grade 12) — Lesson One · انطباقِ تعاملیِ جزوهٔ ویژن ۳
// Grammar focus: Passive voice (جملهٔ مجهول)
// =====================================================================

const vocabulary = [
  W("absolute", "مطلق، کامل، بی‌قیدوشرط", "adj"),
  W("absolutely", "کاملاً، به‌طور مطلق، حتماً", "adv"),
  W("accept", "پذیرفتن، قبول کردن", "v"),
  W("admit", "اعتراف کردن؛ پذیرفتن، راه دادن", "v"),
  W("admire", "تحسین کردن، ستودن", "v"),
  W("advantage", "مزیت، برتری، سود", "n"),
  W("appreciate", "قدردان بودن، ارج نهادن به", "v"),
  W("appreciation", "قدردانی، ارج‌شناسی، سپاس", "n"),
  W("appreciative", "قدرشناس، قدردان", "adj"),
  W("approach", "نزدیک شدن؛ روش، رویکرد", "v"),
  W("attitude", "نگرش، طرز فکر، برخورد", "n"),
  W("avoid", "پرهیز کردن، اجتناب کردن", "v"),
  W("aware", "آگاه، مطلع، واقف", "adj"),
  W("behavior", "رفتار، رفتار کردن", "n"),
  W("bless", "برکت دادن، رحمت فرستادن", "v"),
  W("body language", "زبان بدن، زبانِ اشارهٔ بدن", "phr"),
  W("bow", "تعظیم کردن، خم شدن (از احترام)", "v"),
  W("celebrate", "جشن گرفتن، برگزار کردن", "v"),
  W("ceremony", "مراسم، تشریفات، آیین", "n"),
  W("comment", "اظهارنظر کردن؛ نظر، توضیح", "v"),
  W("compliment", "تعریف و تمجید؛ تعارف، تبریک", "n"),
  W("congratulate", "تبریک گفتن، مبارک‌باد گفتن", "v"),
  W("Congratulations!", "مبارک است! تبریک می‌گویم!", "phr"),
  W("consider", "در نظر گرفتن؛ فکر کردن به", "v"),
  W("cultural", "فرهنگی، فرهنگ‌وابسته", "adj"),
  W("culture", "فرهنگ، فرهنگ‌سازی", "n"),
  W("custom", "رسم، عرف، قاعدهٔ اجتماعی", "n"),
  W("donate", "اهدا کردن، بخشیدن (مال/خون)", "v"),
  W("donation", "اهدا، کمک مالی، صدقه", "n"),
  W("eager", "مشتاق، مشتاقانه", "adj"),
  W("emphasize", "تأکید کردن، تشدید کردن", "v"),
  W("encourage", "تشویق کردن، دلگرم کردن", "v"),
  W("encouragement", "تشویق، دلگرمی، پشتیبانی", "n"),
  W("exact", "دقیق، درست، معیّن", "adj"),
  W("express", "بیان کردن، ابزار کردن", "v"),
  W("expression", "اصطلاح؛ بیان، ابزارِ احساس", "n"),
  W("extend", "گسترش دادن؛ ادا کردن (سلام/تشکر)", "v"),
  W("eye contact", "تماس چشمی، نگاه مستقیم", "phr"),
  W("favor", "لطف، محبت، مِهر", "n"),
  W("feeling", "احساس، عاطفه", "n"),
  W("festival", "جشن، جشنواره", "n"),
  W("formal", "رسمی، تشریفاتی", "adj"),
  W("generous", "بخشنده، دست‌ودل‌باز", "adj"),
  W("gesture", "اشاره، حرکت دست و سر و بدن", "n"),
  W("gift", "کادو، هدیه، پیشکش", "n"),
  W("grateful", "سپاسگزار، شاکر، ممنون", "adj"),
  W("gratefully", "با سپاس، قدردانانه", "adv"),
  W("gratitude", "سپاسگزاری، قدردانی، شکر", "n"),
  W("greet", "سلام کردن، خوش‌آمدگویی کردن", "v"),
  W("greeting", "سلام، احوالپرسی؛ پیام تبریک", "n"),
  W("greeting card", "کارت تبریک، کارت پستال", "phr"),
  W("guest", "مهمان، میهمان", "n"),
  W("heart", "قلب، دل؛ مرکز، مغزِ ماجرا", "n"),
  W("host", "میزبان؛ میزبانی کردن", "n"),
  W("hospitality", "مهمان‌نوازی، مهربانی با مهمان", "n"),
  W("hug", "در آغوش گرفتن، بغل کردن", "v"),
  W("humble", "فروتن، متواضع", "adj"),
  W("impolite", "بی‌ادب، بی‌ادبانه", "adj"),
  W("impression", "برداشت، تأثیر، امضاء (ذهنی)", "n"),
  W("informal", "خودمانی، غیررسمی، راحتی", "adj"),
  W("in return", "در ازای آن، در برابر، به‌عنوان جبران", "phr"),
  W("invitation", "دعوت‌نامه، دعوت", "n"),
  W("invite", "دعوت کردن، به‌مهمانی بردن", "v"),
  W("kindness", "مهربانی، نیکی، خوش‌خویی", "n"),
  W("kiss", "بوسیدن؛ بوسه", "v"),
  W("manner", "شیوه، روش؛ (غالباً جمع) رفتار، ادب", "n"),
  W("occasion", "مناسبت، مورد؛ فرصت", "n"),
  W("offer", "پیشنهاد دادن؛ پیشنهاد", "v"),
  W("party", "مهمانی، بزم", "n"),
  W("polite", "مؤدب، باادب، مهربان‌رخ", "adj"),
  W("politeness", "ادب، مؤدب بودن", "n"),
  W("polite request", "درخواست مؤدبانه، خواهش", "phr"),
  W("praise", "ستایش کردن؛ تحسین، ثنا", "v"),
  W("request", "درخواست کردن؛ درخواست", "v"),
  W("respect", "احترام گذاشتن؛ احترام", "v"),
  W("respectful", "بااحترام، محترمانه", "adj"),
  W("respond", "پاسخ دادن، واکنش نشان دادن", "v"),
  W("response", "پاسخ، واکنش، جواب", "n"),
  W("rude", "بی‌ادب، زننده، گستاخ", "adj"),
  W("sense", "حس، احساس؛ حِسّ (دیداری/ششم)", "n"),
  W("shake hands", "دست دادن، مصافحه کردن", "phr"),
  W("sincere", "صادق، بی‌ریا، خالص", "adj"),
  W("sincerely", "صادقانه؛ (پایانِ نامه) با احترام", "adv"),
  W("sincerity", "صداقت، بی‌ریایی", "n"),
  W("situation", "موقعیت، وضعیت، شرایط", "n"),
  W("social", "اجتماعی، مدنی", "adj"),
  W("society", "جامعه، اجتماع", "n"),
  W("speaker", "گوینده، سخنران؛ متکلم", "n"),
  W("thankful", "شکرگزار، سپاسگزار", "adj"),
  W("thank-you note", "یادداشت تشکر، پیام قدردانی", "phr"),
  W("thoughtful", "باملاحظه، بافکر، رئوسامند", "adj"),
  W("traditional", "سنتی، مرسوم، قدیمی", "adj"),
  W("usually", "معمولاً، در عادت", "adv"),
  W("various", "گوناگون، مختلف، نوع‌جو", "adj"),
  W("warm", "صمیمی، گرم، مهربان", "adj"),
  W("warm welcome", "استقبال گرم، خوش‌آمد گرم", "phr"),
  W("welcome", "خوش‌آمدگویی؛ خوش آمدی؛ عزیز", "n"),
  W("worldwide", "جهانی، سراسر جهان", "adj"),
  W("worship", "پرستش کردن؛ عبادت، نیایش", "v"),
  W("You're welcome", "خواهش می‌کنم، قابلی ندارد", "phr"),
  // — واژگان جامع (راند ۲۱۰، گیت‌شده)
  W("a set of", "مجموعه ای از"),
  W("a sign of", "یک نشانه از"),
  W("A.D", "بعد از میلاد مسیح، میلادی"),
  W("abroad", "خارج از کشور"),
  W("active", "فعال"),
  W("active voice", "جمله معلوم (در دستور زبان)"),
  W("addition", "جمع، اضافه"),
  W("advice", "نصیحت، پند"),
  W("advise", "نصیحت"),
  W("after a while", "بعد از مدت"),
  W("airplane", "هواپیما"),
  W("aloud", "بلند، با صدای بلند"),
  W("analyze", "بررسی کردن، آنالیز کردن"),
  W("anniversary", "سال روز"),
  W("antonym", "متضاد"),
  W("appropriate", "مناسب، شایسته، درخور"),
  W("as", "به عنوان"),
  W("as follows", "به شرح زیر، همچون زیر"),
  W("at least", "حداقل"),
  W("attempt", "تلاش، سعی، کوشش - تلاش کردن"),
  W("author", "نویسنده، مؤلف"),
  W("babysit", "از بچه پرستاری کردن"),
  W("babysitter", "پرستار بچه"),
  W("bear", "تحمل کردن - به دنیا آوردن - خرس"),
  W("because of", "به خاطر"),
  W("burst", "منفجر شدن"),
  W("by heart", "از حفظ، از بر، حفظ"),
  W("cage", "قفس"),
  W("cancer", "شیطان بال"),
  W("capable of", "قادر به"),
  W("care for", "مراقبت کردن از، پرستاری کردن از"),
  W("carry", "حمل کردن، با خود بردن"),
  W("catch", "گرفتن (تاکسی، قطار و...)، به‌چنگ آوردن"),
  W("center", "مرکز"),
  W("chapter", "فصل (کتاب)"),
  W("chess", "شطرنج"),
  W("childhood", "بچگی، کودکی، دوران بچگی"),
  W("choose", "انتخاب کردن"),
  W("college", "دانشکده"),
  W("combination", "ترکیب"),
  W("combine", "ترکیب کردن"),
  W("come back", "برگشتن"),
  W("conference", "کنفرانس، مذاکره، سخنرانی"),
  W("cousin", "عموزاده، دایی‌زاده، عمه‌زاده، خاله‌زاده"),
  W("cry", "گریه کردن"),
  W("cure", "معالجه کردن، درمان کردن"),
  W("customer", "مشتری، خریدار"),
  W("definition", "تعریف، معنی، تعبیر"),
  W("description", "توصیف"),
  W("diary", "دفتر خاطرات، دفتر یادداشت"),
  W("discover", "کشف کردن، یافتن"),
  W("discovery", "کشف"),
  W("dish", "ظرف"),
  W("distinguish", "تشخیص دادن، متمایز کردن"),
  W("distinguished", "برجسته، ممتاز، خوشنام"),
  W("documentary", "مستند، سند دار"),
  W("doer", "انجام دهنده، اهل عمل"),
  W("duty", "وظیفه، کار، خدمت، تکلیف"),
  W("economically", "از نظر اقتصادی"),
  W("effortless", "بدون تلاش، آسان، ساده"),
  W("elder", "بزرگ تر، بزرگ"),
  W("emotion", "احساس"),
  W("end in", "ختم شدن به، پایان یافتن با"),
  W("expert", "متخصص، کارشناس"),
  W("feed", "غذا دادن"),
  W("fingerprint", "اثر انگشت"),
  W("fix", "تعمیر کردن، نصب کردن"),
  W("generate", "تولید کردن، ایجاد کردن"),
  W("generation", "تولید؛ نسل"),
  W("grandchild", "نوه"),
  W("hence", "بنابراین- از حالا به بعد، دیگر"),
  W("icy", "یخ‌بندان، یخ‌زده"),
  W("identity", "هویت - شناسایی"),
  W("immigration", "مهاجرت"),
  W("immoral", "غیر اخلاق، بد اخلاق"),
  W("inappropriate", "نا مناسب"),
  W("inform", "مطلع کردن، با خبر کردن"),
  W("informer", "خبر چیز، جاسوس، اطلاع دهنده"),
  W("inspiration", "الهام، منبع الهام"),
  W("inspire", "الهام بخشیدن"),
  W("interestingly", "جالب است که ...، شگفت است"),
  W("judge", "قاضی"),
  W("lawyer", "وکیل"),
  W("lie", "دروغ گفتن"),
  W("location", "محل، جا، موقعیت"),
  W("loving", "مهربان، بامحبت، محبت آمیز"),
  W("major", "عمده، اصلی، بزرگ"),
  W("meaningful", "با معنی، معنی دار"),
  W("moral", "اخلاقی، معنوی - معنی، مفهوم"),
  W("most", "مهم تر این که، از همه مهمی این که"),
  W("mother-in-law", "مادرزن، مادرشوهر"),
  W("muscle", "ماهیچه"),
  W("note", "توجه کردن به، دقت کردن - یادداشت"),
  W("pause", "مکث کردن، مکث"),
  W("pay raise", "افزایش حقوق"),
  W("peaceful", "آرام، صلح‌آمیز"),
  W("penalty", "جریمه، مجازات، تاوان"),
  W("poetry", "شعر و شاعری"),
  W("principle", "قانون- اصل"),
  W("psychologist", "روانشناس"),
  W("punish", "تنبیه کردن، مجازات کردن"),
  W("punishment", "تنبیه، مجازات"),
  W("qualitative", "کیف، از نظر کیفیت"),
  W("quantitative", "از نظر کمیت، کیفی"),
  W("quantity", "کمیت، مقدار، تعداد"),
  W("rather than", "به جای، به جای اینکه"),
  W("receive", "به دست آوردن، دریافت کردن"),
  W("regarding", "در ارتباط با، با توجه به"),
  W("religion", "مذهب"),
  W("religious", "مذهبی"),
  W("replace", "جایگزین کردن قرار دادن"),
  W("reply", "جواب دادن، جواب"),
  W("rubbish", "زباله، آشغال"),
  W("score", "نمره، امتیاز، نتیجه"),
  W("scoreboard", "تابلو امتیاز"),
  W("series", "شی، مجموعه"),
  W("shout", "فریاد کشیدن، فریاد"),
  W("sometime", "زمان، روزی، یک روزی"),
  W("sound", "صدا؛ صدا کردن"),
  W("steal", "دزدیدن"),
  W("strength", "قدرت، توان، استحکام، شدت"),
  W("strict", "سخت گیر"),
  W("suddenly", "ناگهان، یک‌دفعه"),
  W("take a rest", "استراحت کردن"),
  W("terrible", "وحشتناک، افتضاح"),
  W("the) North Pole", "قطب شمال"),
  W("thus", "بدین ترتیب، بنابراین، این طور"),
  W("tool", "ابزار، وسیله"),
  W("truth", "حقیقت، راستی، درستی"),
  W("unreal", "غیر واقعی، باور ناکردنی"),
  W("voluntarily", "به طور داوطلبانه"),
  W("whereby", "که با آن، که از طریق آن"),
];

const conversation = {
  introEn: "Listen to the conversation between Sara and her Canadian classmate, Emma, after a birthday party.",
  introFa: "به مکالمهٔ سارا و همکلاسیِ کانادایی‌اش، اِما، بعد از یک مهمانی تولد توجه کنید.",
  lines: [
    {
      speaker: "Emma",
      speakerFa: "اِما",
      en: "Thanks a lot for inviting me to your birthday party, Sara. I really enjoyed it.",
      fa: "خیلی ممنون که به مهمانی تولدت دعوتم کردی، سارا. واقعاً لذت بردم.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "You're welcome, Emma. I'm glad you came. Your gift was so thoughtful. I love it.",
      fa: "خواهش می‌کنم، اِما. خوشحالم که اومدی. کادویت خیلی باملاحظه بود. عاشقش شدم.",
    },
    {
      speaker: "Emma",
      speakerFa: "اِما",
      en: "I'm happy to hear that. In Canada, we usually send a thank-you note or a greeting card after a party.",
      fa: "خوشحالم که این را می‌شنوم. در کانادا، ما معمولاً بعد از یک مهمانی یادداشت تشکر یا کارت تبریک می‌فرستیم.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "That's interesting! In Iran, we usually thank people in person and call them a few days later.",
      fa: "چه جالب! در ایران، ما معمولاً حضوری از افراد تشکر می‌کنیم و چند روز بعد هم به‌شان تلفن می‌زنیم.",
    },
    {
      speaker: "Emma",
      speakerFa: "اِما",
      en: "Do you also give gifts on every occasion? In my country, we mostly celebrate birthdays and Christmas.",
      fa: "در همهٔ مناسبت‌ها هم کادو می‌دهید؟ در کشور من بیشتر تولدها و کریسمس را جشن می‌گیریم.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "Yes, we do. We give gifts on many occasions, such as Nowruz and weddings. Giving gifts shows our gratitude.",
      fa: "بله. در بسیاری از مناسبت‌ها کادو می‌دهیم، مثل نوروز و عروسی‌ها. کادو دادن قدردانیِ ما را نشان می‌دهد.",
    },
    {
      speaker: "Emma",
      speakerFa: "اِما",
      en: "I have noticed that people in some countries bow when they greet each other. Is that a kind of respect?",
      fa: "دیده‌ام که در بعضی از کشورها مردم موقع سلام‌وحالی به هم تعظیم می‌کنند. آیا آن نوعی احترام است؟",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "Exactly. In Japan, people bow to show respect. Here, we usually shake hands or hug close friends and family.",
      fa: "دقیقاً. در ژاپن، مردم برای نشان‌دادنِ احترام تعظیم می‌کنند. اینجا، ما معمولاً دست می‌دهیم یا دوستان نزدیک و خانواده را در آغوش می‌گیریم.",
    },
    {
      speaker: "Emma",
      speakerFa: "اِما",
      en: "Body language is really powerful. A warm smile can sometimes express more than words.",
      fa: "زبان بدن واقعاً تأثیرگذار است. یک لبخند صمیمی گاهی بیشتر از کلمات بیان‌گر است.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "You're right. A sincere compliment or a small favor can make people's hearts happy, too.",
      fa: "حق با توست. یک تعریفِ صادقانه یا یک لطفِ کوچک هم می‌تواند دلِ مردم را شاد کند.",
    },
    {
      speaker: "Emma",
      speakerFa: "اِما",
      en: "That's true. Gratitude is a universal language — people all over the world understand it.",
      fa: "درست است. قدردانی یک زبانِ جهانی است — مردم سراسر جهان آن را می‌فهمند.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "Beautifully said! Now, let me walk you home. It's the least I can do for such a kind guest.",
      fa: "خوب گفتید! حالا اجازه بدهید شما را تا خانه ببرم. این کمترین کاری است که برای چنین مهمان مهربانی می‌توانم بکنم.",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "The Sense of Appreciation",
    titleFa: "حس قدردانی",
    source: "Vision 3 — Student Book: Lesson One",
    paragraphs: [
      {
        en: "Appreciation, or gratitude, is the feeling of being thankful for the good things in our lives. When people help us, give us gifts, or simply show kindness, we feel a warm sense of appreciation in our hearts. This feeling is one of the most beautiful human emotions, and it is shared by people all over the world.",
        fa: "قدردانی، یا سپاسگزاری، احساسِ شکرگزار بودن برای چیزهای خوبِ زندگی‌مان است. وقتی مردم به ما کمک می‌کنند، کادو می‌دهند، یا به‌سادگی مهربانی نشان می‌دهند، حسِ گرمِ قدردانی را در دلِ خود احساس می‌کنیم. این احساس یکی از زیباترین هیجاناتِ انسانی است و مردمِ سراسر جهان در آن شریک‌اند.",
      },
      {
        en: "People express their appreciation in various ways. Some people say 'thank you' with a sincere smile. Others send a thank-you note, a greeting card, or a small gift. A warm hug, a handshake, or even a friendly comment can also show that we are grateful. The exact way differs from culture to culture, but the feeling behind it is the same.",
        fa: "مردم قدردانی‌شان را به روش‌های گوناگون بیان می‌کنند. بعضی‌ها با یک لبخند صادقانه «متشکرم» می‌گویند. بعضی دیگر یادداشت تشکر، کارت تبریک، یا کادویی کوچک می‌فرستند. یک در آغوش گرفتنِ صمیمی، یک دست دادن، یا حتی یک نظرِ دوستانه هم می‌تواند نشان دهد که سپاسگزاریم. روشِ دقیق از فرهنگی به فرهنگ دیگر فرق می‌کند، اما احساسِ پشتِ آن یکی است.",
      },
      {
        en: "Customs of greeting and thanking are also different around the world. In many Asian countries, people bow when they meet each other. In some European countries, close friends usually hug or kiss each other on the cheek. In Iran, people shake hands, hug, and ask warmly about each other's health. These behaviors are important because they show respect and politeness.",
        fa: "رسم‌های سلام‌واحوالپرسی و تشکر هم در سراسر جهان متفاوت است. در بسیاری از کشورهای آسیایی، مردم موقع دیدار به هم تعظیم می‌کنند. در بعضی از کشورهای اروپایی، دوستان نزدیک معمولاً همدیگر را در آغوش می‌گیرند یا بوسه می‌زنند. در ایران، مردم دست می‌دهند، در آغوش می‌گیرند و به‌طور صمیمی از سلامتیِ هم می‌پرسند. این رفتارها مهم‌اند چون احترام و ادب را نشان می‌دهند.",
      },
      {
        en: "Polite people know that a favor should never be forgotten. When somebody does something kind for us, we should not accept it silently and walk away. We should thank them, remember their kindness, and try to do something good in return. In this way, kindness is passed from one person to another, and society becomes a warmer place.",
        fa: "مردمِ مؤدب می‌دانند که هیچ لطفی هرگز نباید فراموش شود. وقتی کسی کار مهربانانه‌ای برای ما می‌کند، نباید آن را بی‌صدا بپذیریم و برویم. باید از او تشکر کنیم، مهربانی‌اش را به یاد آوریم و سعی کنیم در ازای آن کار خوبی بکنیم. به این ترتیب، مهربانی از فردی به فرد دیگر منتقل می‌شود و جامعه جای گرم‌تری می‌شود.",
      },
      {
        en: "Studies have shown that grateful people are usually happier and healthier. When we express our gratitude, our hearts are blessed with peace, and our relationships become stronger. So, from today, let us notice the good things around us, appreciate the people who love us, and never forget to say a sincere 'thank you'.",
        fa: "مطالعات نشان داده‌اند که افرادِ قدرشناس معمولاً شادتر و سالم‌ترند. وقتی قدردانی‌مان را بیان می‌کنیم، دل‌هایمان به آرامش برکت می‌یابد و رابطه‌هایمان محکم‌تر می‌شود. پس، از امروز، بیایید چیزهای خوبِ اطراف‌مان را ببینیم، از مردمی که دوست‌مان دارند قدردانی کنیم و هرگز گفتنِ یک «متشکرم»ِ صادقانه را فراموش نکنیم.",
      },
    ],
  },
  {
    titleEn: "Gratitude Across Cultures",
    titleFa: "قدردانی در فرهنگ‌های جهان",
    source: "Vision 3 — Workbook: Lesson One",
    paragraphs: [
      {
        en: "Every culture has its own customs for expressing gratitude, and each one is worth admiring. In Japan, people bow to say thank you; the deeper the bow, the stronger the feeling. In Thailand, a special gesture called 'wai' — with the palms together — is used both for greeting and for thanking.",
        fa: "هر فرهنگ رسم‌های خودش را برای بیانِ قدردانی دارد و هر کدام ارزش تحسین‌کردن را دارد. در ژاپن، مردم برای تشکر تعظیم می‌کنند؛ هرچه تعظیم عمیق‌تر باشد، احساس قوی‌تر است. در تایلند، اشاره‌ای ویژه به نام «وای» — با کنار هم گذاشتن کف دست‌ها — هم برای سلام و هم برای تشکر به‌کار می‌رود.",
      },
      {
        en: "In many countries, guests are treated with generous hospitality. The host offers food, drinks, and the best seat in the house, and the guest praises the meal and thanks the host several times. A guest who leaves without saying thank you is considered impolite in almost every society in the world.",
        fa: "در بسیاری از کشورها از مهمان‌ها با مهمان‌نوازیِ بخشنده پذیرایی می‌شود. میزبان غذا، نوشیدنی و بهترین جای خانه را پیشنهاد می‌کند و مهمان از غذا تعریف می‌کند و چند بار از میزبان تشکر می‌کند. مهمانی که بدون تشکر برود تقریباً در همهٔ جامعه‌های دنیا بی‌ادب شمرده می‌شود.",
      },
      {
        en: "Words are not the only way to show gratitude. In many cultures, donations are made to charities on happy occasions, such as weddings and birthdays. When people celebrate their good days by helping others, their happiness is extended to the whole society, and the spirit of kindness grows worldwide.",
        fa: "کلمات تنها راهِ نشان‌دادنِ قدردانی نیستند. در بسیاری از فرهنگ‌ها، در مناسبت‌های شاد مثل عروسی‌ها و تولدها به خیریه‌ها اهدا می‌شود. وقتی مردم روزهای خوبشان را با کمک به دیگران جشن می‌گیرند، شادی‌شان به کل جامعه گسترش می‌یابد و روحِ مهربانی در سراسر جهان رشد می‌کند.",
      },
      {
        en: "Learning the customs of other countries is very useful, especially for travelers. A simple 'thank you' in the local language, a polite bow, or the right gesture can open hearts and create friendships. Travelers who are aware of local customs are welcomed warmly wherever they go.",
        fa: "یادگیریِ رسم‌های کشورهای دیگر خیلی سودمند است، به‌ویژه برای مسافران. یک «متشکرم»ِ ساده به زبانِ محلی، یک تعظیمِ مؤدبانه، یا اشارهٔ درست می‌تواند دل‌ها را باز کند و دوستی بسازد. مسافرانی که به رسم‌های محلی آگاه‌اند، هر جا بروند با استقبال گرم روبه‌رو می‌شوند.",
      },
      {
        en: "In short, gratitude may be expressed in thousands of different ways, but its message is always one: 'I see your kindness, and my heart is thankful.' If we keep this sense of appreciation alive in our hearts, no custom and no distance can separate us from each other.",
        fa: "خلاصه اینکه، قدردانی شاید به هزاران روشِ متفاوت بیان شود، اما پیامش همیشه یکی است: «مهربانی‌ات را می‌بینم و دلم شاکر است.» اگر این حسِ قدردانی را در دل‌هایمان زنده نگه داریم، هیچ رسم و هیچ فاصله‌ای نمی‌تواند ما را از هم جدا کند.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "جملهٔ فعال و جملهٔ مجهول (Active vs Passive)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">اگر فعلِ جمله، کاری را نشان دهد که <b>فاعل انجام می‌دهد</b>، جمله «فعال» است: ${EN(
        "Farmers <b>grow</b> rice."
      )} «کشاورزان برنج می‌کارند.» اما اگر کاری را نشان دهد که <b>بر فاعل انجام می‌شود</b>، جمله «مجهول» است: ${EN(
        "Rice <b>is grown</b> by farmers."
      )} «برنج (توسط) کشاورزان کاشته می‌شود.» در جملهٔ مجهول، چیزی که روی آن کار می‌شود به جای فاعل می‌نشیند و کانونِ حرف اول را می‌گیرد.</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-violet-600 text-white"><th class="px-3 py-2">گام</th><th class="px-3 py-2">کار</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">۱</td><td class="px-3 py-2 border-t border-stone-100">مفعولِ جملهٔ فعال را به جای فاعل بنویس</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">rice ←</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">۲</td><td class="px-3 py-2 border-t border-stone-100">فعل «be» را متناسب با زمانِ جمله اضافه کن</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">is ←</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">۳</td><td class="px-3 py-2 border-t border-stone-100">شکل سومِ فعل اصلی (p.p.) را بنویس</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">grown ←</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">۴</td><td class="px-3 py-2 border-t border-stone-100">کنندهٔ کار را در صورت نیاز با «by» بیاور</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">by farmers</td></tr>
      </tbody></table></div>
      <div class="bg-violet-50 border border-violet-200 rounded-lg p-3 text-sm leading-7 text-violet-900 mb-3">💡 <b>قاعدهٔ طلایی:</b> مجهول = مفعول + <b>be (زمان‌دار)</b> + <b>شکل سوم فعل</b>. فعلِ be حاملِ زمان است؛ اگر be را درست بزنی، بقیهٔ جمله همیشه ${EN(
        "p.p."
      )} است. مجهول فقط برای «فعل‌های متعدی» (فعل‌های مفعول‌دار) ساخته می‌شود؛ ${EN(
        "go, sleep, arrive"
      )} هرگز مجهول نمی‌شوند.</div>`,
  },
  {
    title: "مجهول در زمان حال ساده (Present Simple Passive)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">ساختار: ${EN(
        "am / is / are + شکل سوم فعل (p.p.)"
      )}. فعل be با فاعلِ جدیدِ جمله (که همان مفعولِ قبلی است) سومی‌سازی می‌شود.</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-violet-600 text-white"><th class="px-3 py-2">فعال</th><th class="px-3 py-2">مجهول</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Farmers grow <b>rice</b>.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Rice</b> is grown (by farmers).</td><td class="px-3 py-2 border-t border-stone-100">برنج کاشته می‌شود.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">People speak <b>Persian</b> in Iran.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Persian</b> is spoken in Iran.</td><td class="px-3 py-2 border-t border-stone-100">در ایران فارسی صحبت می‌شود.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">They make <b>these cars</b> in Japan.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>These cars</b> are made in Japan.</td><td class="px-3 py-2 border-t border-stone-100">این ماشین‌ها در ژاپن ساخته می‌شوند.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">People don't sell <b>that book</b> here.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>That book</b> is not sold here.</td><td class="px-3 py-2 border-t border-stone-100">آن کتاب اینجا فروخته نمی‌شود.</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکات کنکوری:</b><br>• منفی‌سازی روی فعل be می‌افتد: ${EN(
        "Rice <b>is not grown</b> in cold places."
      )}<br>• سؤالی‌سازی: be به اول جمله می‌رود: ${EN(
        "<b>Is</b> rice grown in your area?"
      )}<br>• وقتی کنندهٔ کار «مردم، آنها، کسی» نامعین است، معمولاً حذف می‌شود: ${EN(
        "Persian is spoken in Iran. (by people? لازم نیست)"
      )}</div>`,
  },
  {
    title: "مجهول در زمان گذشته ساده (Past Simple Passive)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">ساختار: ${EN(
        "was / were + شکل سوم فعل (p.p.)"
      )}. فعل was برای فاعلِ مفرد و were برای فاعلِ جمع به‌کار می‌رود.</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-violet-600 text-white"><th class="px-3 py-2">فعال</th><th class="px-3 py-2">مجهول</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Reza wrote <b>this poem</b>.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>This poem</b> was written by Reza.</td><td class="px-3 py-2 border-t border-stone-100">این شعر (توسط) رضا سروده شد.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">They built <b>this bridge</b> in 1937.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>This bridge</b> was built in 1937.</td><td class="px-3 py-2 border-t border-stone-100">این پل در ۱۹۳۷ ساخته شد.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Somebody stole <b>my bag</b> yesterday.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>My bag</b> was stolen yesterday.</td><td class="px-3 py-2 border-t border-stone-100">کیفم دیروز دزدیده شد.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">They didn't invite <b>me</b> to the party.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>I</b> was not invited to the party.</td><td class="px-3 py-2 border-t border-stone-100">من به مهمانی دعوت نشدم.</td></tr>
      </tbody></table></div>
      <div class="bg-violet-50 border border-violet-200 rounded-lg p-3 text-sm leading-7 text-violet-900">💡 <b>نکتهٔ بسیار مهم:</b> وقتی مفعولِ جملهٔ فعال ضمیرِ ${EN(
        "me, him, her, us, them"
      )} است، در مجهول به شکل فاعلی ${EN(
        "I, he, she, we, they"
      )} تبدیل می‌شود: ${EN(
        "They invited <b>me</b>. → <b>I</b> was invited."
      )} — و فعل be (was/were) با این فاعلِ جدید هماهنگ می‌شود.</div>`,
  },
  {
    title: "نکات کنکوری مجهول",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">در تست‌های کنکور، معمولاً باید زمانِ فعل be را از «قرینه‌های زمانی» جمله تشخیص دهی. این قرینه‌ها را حفظ کن:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-violet-600 text-white"><th class="px-3 py-2">قرینهٔ زمانی</th><th class="px-3 py-2">زمان</th><th class="px-3 py-2">مجهول</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">every day, usually, now</td><td class="px-3 py-2 border-t border-stone-100">حال ساده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">am/is/are + p.p.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Tea <b>is grown</b> every year.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">yesterday, in 1937, ago, last year</td><td class="px-3 py-2 border-t border-stone-100">گذشتهٔ ساده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">was/were + p.p.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The mosque <b>was built</b> 400 years ago.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">tomorrow, next week, soon</td><td class="px-3 py-2 border-t border-stone-100">آینده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">will be + p.p.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The results <b>will be announced</b> soon.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">can, must, should, may</td><td class="px-3 py-2 border-t border-stone-100">افعال ناقص</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">مدال + be + p.p.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The work <b>must be done</b> today.</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>تله‌های رایج:</b><br>• بعد از مدال (can/must/should/may) همیشه ${EN(
        "be"
      )} می‌آید، نه is/was: ${EN(
        "The letter <b>must be sent</b>. (NOT: must sent / must is sent)"
      )}<br>• «by» فقط وقتی می‌آید که گوینده بخواهد کنندهٔ کار را بگوید؛ ${EN(
        "This window was broken (by somebody)."
      )} — گاهی به‌جای by از حروفِ دیگر استفاده می‌شود: ${EN(
        "I was worried <b>about</b> you. — She was interested <b>in</b> art."
      )}<br>• برخی افعالِ مجهول همیشه با حرفِ خاصی می‌آیند: ${EN(
        "be made <b>of/from</b>, be covered <b>with</b>, be filled <b>with</b>"
      )}<br>• اگر جملهٔ فعال دو مفعول دارد، معمولاً مفعولِ «انسان» فاعلِ مجهول می‌شود: ${EN(
        "They gave <b>me</b> a gift. → <b>I</b> was given a gift. / A gift was given <b>to me</b>."
      )}</div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l4-w1", fa: "این پل در سال ۱۹۳۷ ساخته شد.", answer: ["This", "bridge", "was", "built", "in", "1937"], hint: "گذشتهٔ سادهٔ مجهول: was/were + شکل سوم فعل" },
  { id: "l4-w2", fa: "برنج در شمال ایران کشت می‌شود.", answer: ["Rice", "is", "grown", "in", "the", "north", "of", "Iran"], hint: "حال سادهٔ مجهول: is/are + p.p." },
  { id: "l4-w3", fa: "نامه‌ها هر روز صبح به این دفتر آورده می‌شوند.", answer: ["The", "letters", "are", "brought", "to", "this", "office", "every", "morning"], hint: "فاعل جمع → are + p.p." },
  { id: "l4-w4", fa: "به من یک هدیهٔ قشنگ داده شد.", answer: ["I", "was", "given", "a", "beautiful", "gift"], hint: "مفعولِ انسان، فاعلِ جملهٔ مجهول می‌شود" },
  { id: "l4-w5", fa: "این آهنگ توسط همهٔ جوانان دوست داشته می‌شود.", answer: ["This", "song", "is", "loved", "by", "all", "young", "people"], hint: "کنندهٔ کار با «by» می‌آید" },
  { id: "l4-w6", fa: "چای در بسیاری از کشورهای آسیایی تولید می‌شود.", answer: ["Tea", "is", "produced", "in", "many", "Asian", "countries"], hint: "قرینهٔ زمانی «حال ساده» → is + p.p." },
  { id: "l4-w7", fa: "این مدرسه پنجاه سال پیش ساخته شد.", answer: ["This", "school", "was", "built", "fifty", "years", "ago"], hint: "قرینهٔ «ago» → گذشتهٔ سادهٔ مجهول" },
  { id: "l4-w8", fa: "سؤال‌ها توسط معلم توضیح داده می‌شوند.", answer: ["The", "questions", "are", "explained", "by", "the", "teacher"], hint: "فاعل جمع → are + p.p. + by" },
];

const synonyms = [
  SYN("appreciate", "value", "قدردان بودن ↔ ارج نهادن"),
  SYN("grateful", "thankful", "سپاسگزار ↔ شاکر"),
  SYN("polite", "respectful", "مؤدب ↔ بااحترام"),
  SYN("rude", "impolite", "بی‌ادب ↔ گستاخ"),
  SYN("custom", "tradition", "رسم ↔ سنت"),
  SYN("formal", "official", "رسمی ↔ اداری"),
  SYN("informal", "casual", "خودمانی ↔ غیررسمی"),
  SYN("gift", "present", "کادو ↔ هدیه"),
  SYN("respond", "reply", "پاسخ دادن ↔ جواب دادن"),
  SYN("various", "different", "گوناگون ↔ مختلف"),
  SYN("manner", "way", "شیوه ↔ روش"),
  SYN("occasion", "event", "مناسبت ↔ رویداد"),
  SYN("encourage", "support", "تشویق ↔ حمایت کردن"),
  SYN("sincere", "honest", "صادق ↔ راستگو"),
  SYN("worldwide", "global", "جهانی ↔ سراسری"),
  SYN("welcome", "greet", "خوش‌آمدگویی ↔ سلام کردن"),
  SYN("generous", "kind", "بخشنده ↔ مهربان"),
  SYN("praise", "compliment", "ستایش کردن ↔ تعریف کردن"),
  SYN("eager", "keen", "مشتاق ↔ پرشور"),
  SYN("admire", "respect", "تحسین کردن ↔ احترام گذاشتن"),
];

const antonyms = [
  ANT("formal", "informal", "رسمی ↔ غیررسمی"),
  ANT("polite", "rude", "مؤدب ↔ بی‌ادب"),
  ANT("grateful", "ungrateful", "سپاسگزار ↔ ناسپاس"),
  ANT("accept", "refuse", "پذیرفتن ↔ رد کردن"),
  ANT("advantage", "disadvantage", "مزیت ↔ عیب"),
  ANT("encourage", "discourage", "تشویق ↔ دلسرد کردن"),
  ANT("traditional", "modern", "سنتی ↔ مدرن"),
  ANT("humble", "proud", "فروتن ↔ مغرور"),
  ANT("warm", "cold", "صمیمی ↔ سرد"),
  ANT("host", "guest", "میزبان ↔ مهمان"),
  ANT("praise", "criticize", "ستایش کردن ↔ انتقاد کردن"),
  ANT("sincere", "insincere", "صادق ↔ ناصادق"),
  ANT("politeness", "rudeness", "ادب ↔ بی‌ادبی"),
  ANT("arrive", "leave", "رسیدن ↔ رفتن"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۱۵ تست) ----------------
  Q("l4-v1", "vocab", "I am really ---------------- to all of you for your kindness and support during my illness.", ["eager", "grateful", "aware", "rude"], 1, "من واقعاً از همهٔ شما به‌خاطر مهربانی و حمایت‌تان در دوران بیماری‌ام سپاسگزارم."),
  Q("l4-v2", "vocab", "The students ---------------- their teacher by sending her a greeting card on Teacher's Day.", ["congratulated", "donated", "expressed", "praised"], 0, "دانش‌آموزان معلم‌شان را با فرستادن یک کارت تبریک در روز معلم تبریک گفتند."),
  Q("l4-v3", "vocab", "A warm smile and a polite ---------------- can open many hearts.", ["gesture", "donation", "ceremony", "advantage"], 0, "یک لبخند صمیمی و یک اشارهٔ مؤدبانه می‌تواند دل‌های زیادی را باز کند."),
  Q("l4-v4", "vocab", "In Japan, people ---------------- when they meet each other to show respect.", ["kiss", "bow", "worship", "avoid"], 1, "در ژاپن، مردم موقع دیدار به هم تعظیم می‌کنند تا احترام نشان دهند."),
  Q("l4-v5", "vocab", "Wearing formal clothes at a wedding is a social ---------------- in our society.", ["favor", "feeling", "custom", "impression"], 2, "پوشیدن لباس رسمی در عروسی یک رسمِ اجتماعی در جامعهٔ ماست."),
  Q("l4-v6", "vocab", "She is very ---------------- and always shares her food and money with poor people.", ["impolite", "generous", "humble", "thoughtless"], 1, "او خیلی بخشنده است و همیشه غذاش و پولش را با فقیرها قسمت می‌کند."),
  Q("l4-v7", "vocab", "The local charities receive a lot of ---------------- from generous people every year.", ["occasions", "gestures", "donations", "behaviors"], 2, "خیریه‌های محلی هر سال اهداهای زیادی از مردمِ بخشنده دریافت می‌کنند."),
  Q("l4-v8", "vocab", "He made a good first ---------------- on the interviewer by being polite and sincere.", ["impression", "invitation", "expression", "occasion"], 0, "او با مؤدب و صادق بودن، برداشت اولیهٔ خوبی روی مصاحبه‌کننده گذاشت."),
  Q("l4-v9", "vocab", "People all ---------------- the world understand the language of gratitude.", ["over", "on", "of", "above"], 0, "مردم سراسر جهان زبان قدردانی را می‌فهمند."),
  Q("l4-v10", "vocab", "It is considered ---------------- to answer your phone during a formal ceremony.", ["respectful", "sincere", "rude", "eager"], 2, "جواب دادن به تلفن‌تان در طول یک مراسم رسمی بی‌ادبانه شمرده می‌شود."),
  Q("l4-v11", "vocab", "Her parents ---------------- her to take part in the speech competition and win the first prize.", ["avoided", "encouraged", "expressed", "extended"], 1, "پدر و مادرش او را برای شرکت در مسابقهٔ سخنرانی و گرفتن جایزهٔ اول تشویق کردند."),
  Q("l4-v12", "vocab", "I'd like to ---------------- my special thanks to everyone who helped me with this project.", ["celebrate", "consider", "extend", "admit"], 2, "می‌خواهم تشکر ویژهٔ خودم را به همهٔ کسانی که در این پروژه کمکم کردند ادا کنم."),
  Q("l4-v13", "vocab", "Visitors are always given a warm ---------------- at this traditional Iranian house.", ["welcome", "request", "response", "ceremony"], 0, "به بازدیدکنندگان همیشه در این خانهٔ سنتی ایرانی استقبال گرمی می‌شود."),
  Q("l4-v14", "vocab", "The host was very kind and offered us tea and ---------------- as soon as we arrived.", ["hospitality", "gratitude", "behavior", "customs"], 0, "میزبان خیلی مهربان بود و به محض رسیدن‌مان به ما چای و پذیرایی پیشنهاد داد."),
  Q("l4-v15", "vocab", "A ---------------- person never forgets to say 'thank you' for even the smallest favor.", ["thoughtful", "rude", "formal", "social"], 0, "آدمِ باملاحظه هرگز برای کوچک‌ترین لطف هم گفتنِ «متشکرم» را فراموش نمی‌کند."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l4-k1", "vocab-konkuri", "He is so ---------------- that he never thinks about his own benefits and always helps others.", ["humble", "rude", "eager", "formal"], 0, "او آن‌قدر فروتن است که هرگز به سود خودش فکر نمی‌کند و همیشه به دیگران کمک می‌کند."),
  Q("l4-k2", "vocab-konkuri", "In Iranian culture, guests are ---------------- with the best food and a warm smile.", ["avoided", "treated", "donated", "praised"], 1, "در فرهنگ ایرانی، از مهمان‌ها با بهترین غذا و لبخندی گرم پذیرایی می‌شود."),
  Q("l4-k3", "vocab-konkuri", "The scientist was ---------------- of the importance of his discovery for the future of the world.", ["rude", "aware", "impolite", "generous"], 1, "دانشمند از اهمیت کشفش برای آیندهٔ دنیا آگاه بود."),
  Q("l4-k4", "vocab-konkuri", "The winner of the gold medal ---------------- her parents and coaches right after the ceremony.", ["thanked", "bowed", "kissed", "invited"], 0, "برندهٔ مدال طلا بلافاصله بعد از مراسم از پدر و مادر و مربی‌هایش تشکر کرد."),
  Q("l4-k5", "vocab-konkuri", "The manager's ---------------- towards the employees was so polite that everyone respected him.", ["attitude", "donation", "ceremony", "occasion"], 0, "برخوردِ مدیر با کارمندان آن‌قدر مؤدبانه بود که همه به او احترام می‌گذاشتند."),
  Q("l4-k6", "vocab-konkuri", "It gives me great ---------------- to introduce our next speaker, a world-famous artist.", ["pleasure", "favor", "kindness", "request"], 0, "برایم افتخار و لذت زیادی دارد که گویندهٔ بعدی‌مان، یک هنرمند جهانی، را معرفی کنم."),
  Q("l4-k7", "vocab-konkuri", "He wrote a ---------------- letter to thank the university for accepting him.", ["sincere", "impolite", "generous", "various"], 0, "او نامه‌ای صادقانه نوشت تا از دانشگاه به‌خاطر پذیرفتنش تشکر کند."),
  Q("l4-k8", "vocab-konkuri", "On happy ---------------- like weddings, Iranians give gifts and help the people in need.", ["occasions", "gestures", "behaviors", "advantages"], 0, "در مناسبت‌های شاد مثل عروسی‌ها، ایرانی‌ها کادو می‌دهند و به نیازمندان کمک می‌کنند."),
  Q("l4-k9", "vocab-konkuri", "I couldn't ---------------- his generosity; he had done so much for my family.", ["avoid", "admire", "express", "extend"], 1, "نمی‌توانستم بخشندگی‌اش را تحسین نکنم؛ او آن‌قدر زیاد برای خانواده‌ام کرده بود."),
  Q("l4-k10", "vocab-konkuri", "The teaching ---------------- used in this school is based on kindness, not fear.", ["approach", "impression", "situation", "advantage"], 0, "رویکردِ آموزشیِ این مدرسه بر پایهٔ مهربانی است، نه ترس."),
  Q("l4-k11", "vocab-konkuri", "Their first ---------------- to climb Everest ended in failure.", ["test", "attempt", "temperature", "exercise"], 1, "اولین تلاشِ آن‌ها برای فتحِ اورست به شکست انجامید."),
  Q("l4-k12", "vocab-konkuri", "As parents, it's our moral duty to teach our children to ---------------- other people's opinions.", ["produce", "honor", "power", "burst"], 1, "به‌عنوانِ پدر و مادر، وظیفهٔ اخلاقی‌مان این است که به بچه‌ها یاد بدهیم به نظرِ دیگران احترام بگذارند."),
  Q("l4-k13", "vocab-konkuri", "It is surely the ---------------- of the wealthy members of the society to help those who are economically weak.", ["duty", "matter", "point", "case"], 0, "قطعاً وظیفهٔ اعضای ثروتمندِ جامعه است که به تنگ‌دست‌ها کمک کنند."),
  Q("l4-k14", "vocab-konkuri", "It was a great job to do and you helped me a lot. I really don't know how to ---------------- you.", ["hate", "describe", "appreciate", "burst"], 2, "کارِ بزرگی بود و خیلی کمکم کردی؛ واقعاً نمی‌دانم چطور از تو قدردانی کنم."),
  Q("l4-k15", "vocab-konkuri", "After they had taken my brother to hospital, I tried to say how ---------------- we all were for his great help.", ["shameful", "cruel", "peaceful", "grateful"], 3, "وقتی برادرم را به بیمارستان بردند، سعی کردم بگویم همه‌مان برای کمکِ عظیمش چقدر قدردانیم."),
  // ---------------- گرامر و نگارش (۱۵ تست) ----------------
  Q("l4-g1", "grammar", "Rice ---------------- in the north of Iran every year.", ["grew", "is grown", "was grown", "has grown"], 1, "برنج هر سال در شمال ایران کشت می‌شود. (every year → حال سادهٔ مجهول)"),
  Q("l4-g2", "grammar", "This bridge ---------------- about one hundred years ago.", ["is built", "was built", "were built", "has built"], 1, "این پل حدوداً صد سال پیش ساخته شد. (ago → گذشتهٔ سادهٔ مجهول)"),
  Q("l4-g3", "grammar", "Persian ---------------- by millions of people around the world.", ["speaks", "is speaking", "is spoken", "spoken"], 2, "فارسی توسط میلیون‌ها نفر در سراسر جهان صحبت می‌شود."),
  Q("l4-g4", "grammar", "These beautiful carpets ---------------- in Isfahan, aren't they?", ["are made", "made", "were made", "make"], 0, "این فرش‌های زیبا در اصفهان ساخته می‌شوند، این‌طور نیست؟ (تأیید با are)"),
  Q("l4-g5", "grammar", "I ---------------- to the party last Friday, so I stayed home sadly.", ["was not invited", "am not invited", "did not invited", "not invited"], 0, "جمعهٔ گذشته به مهمانی دعوت نشدم، پس غمگینانه خانه ماندم."),
  Q("l4-g6", "grammar", "The letters ---------------- to this office every morning, and then they are read.", ["bring", "brought", "are brought", "was brought"], 2, "نامه‌ها هر روز صبح به این دفتر آورده می‌شوند و بعد خوانده می‌شوند."),
  Q("l4-g7", "grammar", "My grandfather ---------------- this house more than fifty years ago.", ["built", "was built", "is built", "has built"], 0, "پدربزرگم این خانه را بیش از پنجاه سال پیش ساخت. (فاعلِ کننده → فعال)"),
  Q("l4-g8", "grammar", "English ---------------- in most schools of the world today.", ["teaches", "is taught", "taught", "was taught"], 1, "امروز انگلیسی در بیشتر مدرسه‌های دنیا تدریس می‌شود."),
  Q("l4-g9", "grammar", "Who ---------------- this beautiful poem? — Hafez did.", ["was written", "wrote", "is written", "was wrote"], 1, "این شعر زیبا را چه کسی سرود؟ — حافظ. (سؤال با who در حالتِ فعال)"),
  Q("l4-g10", "grammar", "She was given a golden watch ---------------- her retirement day.", ["in", "on", "at", "by"], 1, "به او در روز بازنشستگی‌اش یک ساعت طلایی داده شد. (روزِ مشخص → on)"),
  Q("l4-g11", "grammar", "Nobody ---------------- the exact date of this old ceremony.", ["knows", "know", "is known", "known"], 0, "هیچ‌کس تاریخِ دقیقِ این مراسم قدیمی را نمی‌داند. (فاعلِ نامعین → فعلِ مفردِ فعال)"),
  Q("l4-g12", "grammar", "The guests ---------------- warmly by the host family last night.", ["welcomed", "were welcomed", "are welcomed", "welcome"], 1, "مهمان‌ها دیشب توسط خانوادهٔ میزبان به‌گرمی پذیرایی شدند."),
  Q("l4-g13", "grammar", "Our thanks ---------------- expressed to all the kind donors by the charity last week.", ["were", "was", "are", "is"], 0, "تشکرهایمان هفتهٔ گذشته توسط خیریه به همهٔ اهداکنندگانِ مهربان ادا شد. (thanks جمع است)"),
  Q("l4-g14", "grammar", "This shirt ---------------- cotton, so it feels very soft.", ["is made of", "makes of", "is made from", "made from"], 0, "این پیراهن از پنبه ساخته شده، پس خیلی نرم به نظر می‌رسد. (مادهٔ قابل‌تشخیص → of)"),
  Q("l4-g15", "grammar", "A new library ---------------- in our city next year.", ["will build", "will be built", "is built", "was built"], 1, "سال آینده یک کتابخانهٔ جدید در شهرمان ساخته خواهد شد. (next year → آیندهٔ مجهول)"),
];

export const lesson4: LessonData = {
  id: 4,
  titleEn: "Sense of Appreciation",
  titleFa: "حس قدردانی",
  tagline: "قدردانی، ادب و فرهنگ‌های جهان و جملهٔ مجهول",
  color: "violet",
  grade: "دوازدهم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  antonyms,
  writing,
  quizzes,
};

export default lesson4;
