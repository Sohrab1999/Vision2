import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, EN } from "@/lib/study-types";

// =====================================================================
// Lesson One: "Understanding People"  |  فهمیدن مردم
// =====================================================================

const vocabulary = [
  W("ability", "توانایی، لیاقت، شایستگی", "n"),
  W("absolutely", "قطعاً، کاملاً", "adv"),
  W("access", "دسترسی، دست‌یابی", "n"),
  W("across", "از عرض، در امتداد", "adv"),
  W("action", "اقدام، عمل، کار", "n"),
  W("add", "اضافه کردن، جمع بستن", "v"),
  W("additional", "اضافی", "adj"),
  W("afraid", "ترسیده، نگران", "adj"),
  W("age", "سن، عمر، عصر، دوره", "n"),
  W("always", "همیشه", "adv"),
  W("amazing", "شگفت‌انگیز، حیرت‌برانگیز", "adj"),
  W("amount", "مقدار، میزان", "n"),
  W("appear", "آشکار شدن، به نظر رسیدن", "v"),
  W("appropriate", "مناسب، شایسته، درخور", "adj"),
  W("artist", "هنرمند", "n"),
  W("at least", "حداقل", "phr"),
  W("available", "موجود، در دسترس", "adj"),
  W("beginner", "مبتدی، تازه‌کار", "n"),
  W("beginning", "شروع، آغاز، ابتدا", "n"),
  W("belief", "اعتقاد، باور، ایمان", "n"),
  W("belong", "تعلق داشتن، متعلق بودن به", "v"),
  W("besides", "به غیر از، علاوه بر", "prep"),
  W("broadcast", "پخش کردن (برنامهٔ تلویزیونی و...)", "v"),
  W("borrow", "قرض گرفتن", "v"),
  W("bottle", "بطری", "n"),
  W("call", "نامیدن، صدا زدن، تماس گرفتن", "v"),
  W("candle", "شمع", "n"),
  W("capital letter", "حرف بزرگ", "n"),
  W("century", "قرن", "n"),
  W("certainly", "قطعاً، مسلماً", "adv"),
  W("choose", "انتخاب کردن", "v"),
  W("communicate", "ارتباط برقرار کردن", "v"),
  W("comb", "شانه (برای موی سر)", "n"),
  W("communication", "ارتباط", "n"),
  W("complete", "کامل کردن، تکمیل کردن", "v"),
  W("completely", "کاملاً، به طور کامل", "adv"),
  W("confident", "مطمئن", "adj"),
  W("consider", "بررسی کردن، در نظر گرفتن", "v"),
  W("continent", "قاره", "n"),
  W("create", "ایجاد کردن، خلق کردن", "v"),
  W("cultural", "فرهنگی", "adj"),
  W("culture", "فرهنگ", "n"),
  W("danger", "خطر", "n"),
  W("day-to-day", "روزانه", "adj"),
  W("deaf", "کر، ناشنوا", "adj"),
  W("despite", "علی‌رغم، با وجود، با اینکه", "prep"),
  W("destroy", "تخریب کردن، نابود کردن", "v"),
  W("develop", "توسعه دادن، گسترش دادن", "v"),
  W("development", "توسعه", "n"),
  W("dictation", "املاء، دیکته", "n"),
  W("dictionary", "فرهنگ لغت", "n"),
  W("die out", "از بین رفتن، منقرض شدن", "phr.v"),
  W("difference", "تفاوت، اختلاف", "n"),
  W("disappear", "ناپدید شدن", "v"),
  W("early", "زود، اولیه", "adj"),
  W("endangered", "در معرض خطر", "adj"),
  W("enjoy", "لذت بردن", "v"),
  W("escape", "فرار کردن", "v"),
  W("exchange", "مبادله کردن، عوض کردن", "v"),
  W("exercise", "تمرین، ورزش", "n"),
  W("explanation", "توضیح، تفسیر", "n"),
  W("exist", "وجود داشتن، موجود بودن", "v"),
  W("experience", "تجربه - تجربه کردن", "n"),
  W("fall down", "افتادن، سقوط کردن", "phr.v"),
  W("farming", "کشاورزی", "n"),
  W("favorite", "مطلوب، مورد علاقه", "adj"),
  W("feeling", "احساس", "n"),
  W("finally", "در نهایت، سرانجام", "adv"),
  W("fluent", "(سخن) روان، سلیس", "adj"),
  W("fluently", "به طور روان", "adv"),
  W("foreigner", "خارجی", "n"),
  W("form", "شکل دادن، فرم دادن", "v"),
  W("fortunately", "خوشبختانه", "adv"),
  W("frequently", "اغلب، پی‌درپی، به طور مکرر", "adv"),
  W("give up", "رها کردن، تسلیم شدن، ترک کردن", "phr.v"),
  W("grade", "نمره، درجه، کلاس", "n"),
  W("greatly", "زیاد، به طور عمده", "adv"),
  W("happen", "اتفاق افتادن، روی دادن", "v"),
  W("hint", "اشاره، نکته", "n"),
  W("holy", "مقدس", "adj"),
  W("honest", "درستکار، صادق، راستگو", "adj"),
  W("honestly", "به درستی، صادقانه", "adv"),
  W("host", "میزبان، مهمان‌داری کردن", "n"),
  W("imagine", "تصور کردن", "v"),
  W("impossible", "غیرممکن", "adj"),
  W("increase", "افزایش دادن، افزایش یافتن", "v"),
  W("institute", "مؤسسه", "n"),
  W("intent", "قصد، تمایل", "n"),
  W("interest", "علاقه - علاقه‌مند کردن - سود", "n"),
  W("interview", "مصاحبه کردن، مصاحبه", "v"),
  W("invite", "دعوت کردن، مهمان کردن", "v"),
  W("knowledge", "دانش، علم، بصیرت", "n"),
  W("label", "نشان، برچسب، برچسب زدن", "n"),
  W("language", "زبان", "n"),
  W("largely", "زیاد، به طور عمده", "adv"),
  W("laugh", "خنده - خندیدن", "v"),
  W("less", "کمتر", "adv"),
  W("list", "فهرست کردن، فهرست، لیست", "n"),
  W("loaf", "قرص (واحد شمارش نان)", "n"),
  W("lose", "از دست دادن، گم کردن، باختن", "v"),
  W("loudly", "با صدای بلند", "adv"),
  W("luckily", "خوشبختانه", "adv"),
  W("make up", "تشکیل دادن - جبران کردن - آرایش", "phr.v"),
  W("mark", "علامت‌گذاری کردن، نشانه، علامت", "v"),
  W("master", "یادگرفتن، مسلط شدن، استاد", "v"),
  W("matter", "مسئله، مشکل", "n"),
  W("mean", "معنی دادن، منظور داشتن", "v"),
  W("means (of)", "وسیله، ابزار", "n"),
  W("measure", "اندازه‌گیری کردن", "v"),
  W("meet", "برآورده کردن، ملاقات کردن", "v"),
  W("mental", "ذهنی", "adj"),
  W("mention", "بیان کردن، ذکر کردن", "v"),
  W("mind", "ذهن", "n"),
  W("mother tongue", "زبان مادری", "n"),
  W("nation", "ملت، مردم یک کشور", "n"),
  W("native", "بومی، مادری، محلی", "adj"),
  W("nearly", "تقریباً، تا حدودی", "adv"),
  W("neighbor", "همسایه", "n"),
  W("never", "هرگز", "adv"),
  W("notebook", "دفترچه یادداشت", "n"),
  W("notice", "توجه - متوجه شدن", "v"),
  W("nowadays", "این روزها، امروزه", "adv"),
  W("number", "عدد، رقم، شماره", "n"),
  W("object", "(دستور زبان) مفعول - شیء", "n"),
  W("often", "اغلب", "adv"),
  W("orally", "به طور شفاهی", "adv"),
  W("order", "سفارش دادن، نظم، ترتیب", "v"),
  W("pattern", "الگو، روش", "n"),
  W("period", "نقطه، دورهٔ زمانی", "n"),
  W("photograph", "عکس", "n"),
  W("phrase", "عبارت", "n"),
  W("physical", "جسمی، بدنی", "adj"),
  W("pick", "چیدن - (با up: برداشتن)", "v"),
  W("popular", "محبوب، پرطرفدار", "adj"),
  W("power", "قدرت، توان، نیروی برق", "n"),
  W("predictable", "قابل پیش‌بینی", "adj"),
  W("price", "قیمت، نرخ، بها، ارزش", "n"),
  W("percent", "درصد", "n"),
  W("probable", "محتمل، احتمالی", "adj"),
  W("project", "پروژه، طرح، برنامه", "n"),
  W("pronounce", "تلفظ کردن، ادا کردن", "v"),
  W("pronunciation", "تلفظ", "n"),
  W("protect", "حمایت کردن، محافظت کردن", "v"),
  W("protection", "حمایت، محافظت", "n"),
  W("quiet", "ساکت، آرام، بی‌صدا", "adj"),
  W("quit", "ترک کردن، تسلیم شدن", "v"),
  W("range", "محدوده، دامنه - متغیر بودن، در نوسان بودن", "n"),
  W("ready", "آماده، حاضر", "adj"),
  W("receive", "به دست آوردن، دریافت کردن", "v"),
  W("remember", "به خاطر آوردن، به خاطر داشتن", "v"),
  W("repeat", "تکرار کردن", "v"),
  W("respect", "احترام گذاشتن", "v"),
  W("save", "ذخیره کردن، پس‌انداز کردن، رهائی کردن", "v"),
  W("scan", "نگاه سریع انداختن", "v"),
  W("seek", "جستجو کردن، پیگیری کردن", "v"),
  W("sign", "نشانه، علامت - تابلو - امضاء", "n"),
  W("sign language", "زبان اشاره", "n"),
  W("similar (to)", "مشابه، یکسان", "adj"),
  W("simple", "ساده، آسان", "adj"),
  W("simply", "به سادگی، به راحتی", "adv"),
  W("skill", "مهارت، استادی، هنرمندی", "n"),
  W("slice", "تکه، قاچ، برش", "n"),
  W("smart", "باهوش، زرنگ", "adj"),
  W("society", "جامعه، اجتماع", "n"),
  W("sometimes", "گاه‌گاهی، بعضی اوقات", "adv"),
  W("space", "فضا، فاصله", "n"),
  W("speaker", "متکلم، گوینده", "n"),
  W("specific", "ویژه، خاص", "adj"),
  W("step", "مرحله، قدم، گام", "n"),
  W("storybook", "کتاب داستان", "n"),
  W("strategy", "راهکار، استراتژی", "n"),
  W("stress", "تأکید، استرس", "n"),
  W("strong", "قوی، قدرتمند", "adj"),
  W("subject", "(دستور زبان) فاعل - موضوع", "n"),
  W("suggest", "پیشنهاد دادن - اشاره کردن بر", "v"),
  W("suitable", "مناسب، شایسته", "adj"),
  W("surf", "گشتن در (اینترنت) - موج‌سواری کردن", "v"),
  W("surprising", "تعجب‌آور، شگفت‌انگیز", "adj"),
  W("syllable", "هجا، بخش (کلمه)", "n"),
  W("synonym", "هم‌معنی، مترادف", "n"),
  W("system", "سیستم - منظومه، سلسله", "n"),
  W("take", "گرفتن - برداشتن - بردن", "v"),
  W("therefore", "بنابراین، از این رو - سپس", "adv"),
  W("through", "از طریق، از میان، از وسط", "prep"),
  W("tiny", "کوچک، ریز", "adj"),
  W("tongue", "زبان - بر زبان آوردن", "n"),
  W("translate", "ترجمه کردن", "v"),
  W("translator", "مترجم", "n"),
  W("turn off", "خاموش کردن (وسیله)", "phr.v"),
  W("twice", "دوبار", "adv"),
  W("type", "نوع - تایپ کردن", "n"),
  W("under", "زیر", "prep"),
  W("underline", "زیر چیزی خط کشیدن", "v"),
  W("understand", "فهمیدن، متوجه شدن، درک کردن", "v"),
  W("unfortunately", "متأسفانه", "adv"),
  W("usually", "معمولاً", "adv"),
  W("valuable", "باارزش، گران‌بها", "adj"),
  W("value", "ارزش، بها - ارزش قائل شدن، ارزش‌گذاری کردن", "n"),
  W("vary", "فرق داشتن، متفاوت بودن", "v"),
  W("visit", "دیدن، ملاقات کردن", "v"),
  W("way", "روش، راه، شیوه، طریقه", "n"),
  W("wish", "آرزو - خواهش - آرزو داشتن", "n"),
  W("written", "کتبی، نوشتاری", "adj"),
  W("wrongly", "به اشتباه، غلط", "adv"),
];

const conversation = {
  introEn:
    "Babak Saberian is a translator who works for IRIB. Today, he is hosting Meysam in his office. Meysam is a high school student. He is interviewing Mr. Saberian for his school project.",
  introFa:
    "بابک صابریان یک مترجم است که برای صدا و سیمای جمهوری اسلامی ایران کار می‌کند. او امروز میثم را در دفترش مهمان کرده است. میثم یک دانش‌آموز دبیرستانی است. او در حال مصاحبه با آقای صابریان برای پروژهٔ مدرسه‌اش است.",
  lines: [
    {
      speaker: "Meysam",
      speakerFa: "میثم",
      en: "Thank you Mr. Saberian for inviting me to your office.",
      fa: "کارتان متشکرم آقای صابریان، از دعوت من به دفترتان متشکرم.",
    },
    {
      speaker: "Mr. Saberian",
      speakerFa: "آقای صابریان",
      en: "You're welcome!",
      fa: "خواهش می‌کنم!",
    },
    {
      speaker: "Meysam",
      speakerFa: "میثم",
      en: "I heard you know three languages. Is that right?",
      fa: "من شنیدم شما ۳ زبان بلد هستید. درسته؟",
    },
    {
      speaker: "Mr. Saberian",
      speakerFa: "آقای صابریان",
      en: "Well, actually four languages.",
      fa: "خب، راستش چهار زبان بلدم.",
    },
    {
      speaker: "Meysam",
      speakerFa: "میثم",
      en: "Four! Really?! What languages do you know?",
      fa: "چهار زبان! واقعاً؟ چه زبان‌هایی را می‌دانید؟",
    },
    {
      speaker: "Mr. Saberian",
      speakerFa: "آقای صابریان",
      en: "Besides my mother tongue, Persian, I know English, French and Russian well.",
      fa: "من علاوه بر زبان مادری‌ام فارسی، انگلیسی، فرانسوی و روسی را به‌خوبی می‌دانم.",
    },
    {
      speaker: "Meysam",
      speakerFa: "میثم",
      en: "Interesting! And when did you learn them?",
      fa: "جالب است! و شما چه موقع این زبان‌ها را یاد گرفتید؟",
    },
    {
      speaker: "Mr. Saberian",
      speakerFa: "آقای صابریان",
      en: "I began learning English at school when I was thirteen. Then I began learning French in a language institute when I was fifteen. And I learned Russian when I was a university student in Moscow.",
      fa: "شروع به یادگیری زبان انگلیسی کردم وقتی سیزده‌ساله بودم. بعد، وقتی پانزده‌ساله بودم در یک مؤسسهٔ زبان شروع به یادگیری زبان فرانسوی کردم و هنگامی که در مسکو دانشجو بودم، روسی یاد گرفتم.",
    },
    {
      speaker: "Meysam",
      speakerFa: "میثم",
      en: "Can you use all of them fluently?",
      fa: "آیا شما می‌توانید از همهٔ آنها به طور روان استفاده کنید؟",
    },
    {
      speaker: "Mr. Saberian",
      speakerFa: "آقای صابریان",
      en: "I know all of them well, but I use English more.",
      fa: "من همهٔ آنها را خوب بلدم، اما از انگلیسی بیشتر استفاده می‌کنم.",
    },
    {
      speaker: "Meysam",
      speakerFa: "میثم",
      en: "OK. Do you think language learning should start as early as possible?",
      fa: "بسیار خب. آیا شما فکر می‌کنید یادگیری زبان باید خیلی زود شروع بشه؟",
    },
    {
      speaker: "Mr. Saberian",
      speakerFa: "آقای صابریان",
      en: "My experience says interest and hard work are really more important than age.",
      fa: "تجربهٔ من می‌گوید (نشان می‌دهد) علاقه و سخت‌کوشی واقعاً مهم‌تر از سن هستند.",
    },
    {
      speaker: "Meysam",
      speakerFa: "میثم",
      en: "Hmm... that's an important point. May I know what your favorite language is? English, French, or Russian?",
      fa: "هوم... این نکتهٔ مهمیه. آیا ممکنه بدونم زبان مورد علاقهٔ شما چیه؟ انگلیسی، فرانسوی یا روسی؟",
    },
    {
      speaker: "Mr. Saberian",
      speakerFa: "آقای صابریان",
      en: "To be honest, I enjoy using them all, but my favorite language is absolutely my mother tongue!",
      fa: "صادقانه بگم، من از به‌کار بردن همهٔ آنها لذت می‌برم، اما زبان مورد علاقهٔ من قطعاً زبان مادریم است!",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "Languages of the World",
    titleFa: "زبان‌های دنیا",
    source: "Student Book: Pages 24-25",
    paragraphs: [
      {
        en: "Language is a system of communication. It uses written and spoken forms. People use language to communicate with each other in a society. They exchange knowledge, beliefs, wishes, and feelings through it.",
        fa: "زبان سیستم برقراری ارتباط است. آن از شکل‌های نوشتاری و گفتاری استفاده می‌کند. مردم در جامعه از زبان استفاده می‌کنند تا با یکدیگر ارتباط برقرار کنند. آنها از طریق آن (زبان) تبادل دانش، عقاید، آرزوها و احساسات می‌کنند.",
      },
      {
        en: "Languages vary greatly from region to region. They are so different that a person may not understand the language of someone from another region, country or continent. It is not surprising to hear that today about 7000 languages exist in the world. There are more than 2000 languages in Africa, 1000 in the Americas, more than 2250 in Asia, about 230 in Europe, and more than 1300 in Oceania.",
        fa: "زبان‌ها از یک منطقه به منطقهٔ دیگر خیلی فرق می‌کنند. آنها آنقدر متفاوت هستند که یک شخص ممکن است زبان یک نفر از یک منطقه، کشور یا قارهٔ دیگر را درک نکند. تعجب ندارد که بشنویم امروزه حدود ۷۰۰۰ زبان در دنیا وجود دارند. در آفریقا بیش از ۲۰۰۰ (زبان)، در آمریکا ۱۰۰۰ (زبان)، در آسیا بیش از ۲۲۵۰ (زبان)، در اروپا حدود ۲۳۰ (زبان) و در اقیانوسیه بیش از ۱۳۰۰ (زبان) وجود دارند.",
      },
      {
        en: "Native speakers of these languages range in number from very large, with hundreds of millions of speakers, to very small, with fewer than 10 speakers. The most popular language in the world is Chinese. More than one billion people in the world speak Chinese.",
        fa: "صحبت‌کننده‌های بومی این زبان‌ها از نظر تعداد از خیلی زیاد، با صدها میلیون صحبت‌کننده، تا خیلی کم، با کمتر از ۱۰ صحبت‌کننده متغیر هستند. پرطرفدارترین زبان دنیا چینی است. بیش از یک میلیارد نفر در دنیا چینی صحبت می‌کنند.",
      },
      {
        en: "Interestingly, English has fewer native speakers than Chinese, but there are about one billion learners of English all around the world. They learn English as an international language.",
        fa: "نکتهٔ جالب این که انگلیسی صحبت‌کننده‌های بومی کم‌تری از چینی دارد اما در سراسر جهان حدود یک میلیارد فراگیر انگلیسی وجود دارد. آنها زبان انگلیسی را به عنوان یک زبان بین‌المللی یاد می‌گیرند.",
      },
      {
        en: "About fifty percent of the world's languages have fewer than 5000 speakers. In the beginning of the twenty-first century, 204 languages had fewer than 10 speakers and 344 languages had between 10 and 99 speakers. The 548 languages with fewer than 99 speakers make up nearly 8 percent of the world's languages. We call them 'endangered languages'. As the speakers of such languages grow old and die, their languages will die, too.",
        fa: "حدود ۵۰ درصد از زبان‌های دنیا کمتر از ۵۰۰۰ صحبت‌کننده دارند. در ابتدای این قرن، ۲۰۴ زبان کمتر از ۱۰ صحبت‌کننده و ۳۴۴ زبان بین ۱۰ تا ۹۹ صحبت‌کننده داشتند. ۵۴۸ زبان با کمتر از ۹۹ صحبت‌کننده حدود ۸ درصد زبان‌های دنیا را تشکیل می‌دهند. ما آنها را «زبان‌های در معرض خطر» می‌نامیم. همچنانکه صحبت‌کننده‌های چنین زبان‌هایی پیر می‌شوند و می‌میرند، زبان‌هایشان نیز خواهند مرد.",
      },
      {
        en: "All languages are really valuable, despite their differences. Every language is an amazing means of communication that meets the needs of its own speakers. It is impossible to imagine the world without language. Therefore, we should respect all languages, no matter how different they are and how many speakers they have.",
        fa: "همهٔ زبان‌ها علی‌رغم تفاوت‌هایشان واقعاً وسیلهٔ ارتباطی باارزش هستند. هر زبان یک وسیلهٔ ارتباطی شگفت‌انگیز است که نیازهای صحبت‌کننده‌های خودش را برآورده می‌کند. غیرممکن است که دنیا را بدون زبان تصور کرد. بنابراین، ما باید به همهٔ زبان‌ها احترام بگذاریم، مهم نیست که آنها چقدر متفاوت هستند و چه تعداد صحبت‌کننده دارند.",
      },
    ],
  },
  {
    titleEn: "Hints for Learning a Language Better",
    titleFa: "نکاتی برای یادگیری بهتر یک زبان",
    source: "Workbook: Pages 10-11",
    paragraphs: [
      {
        en: "Learning a new language doesn't always mean sitting in the classroom and studying language books. In fact, language teachers suggest that you do plenty of extra learning outside of school, places like your home or a library near you.",
        fa: "آموختن یک زبان تازه همیشه به معنای نشستن در کلاس درس و مطالعهٔ کتاب‌های زبان نیست. در واقع، معلم‌های زبان به شما توصیه می‌کنند که تعداد زیادی از آموخته‌های زبانی اضافی را در مکان‌های خارج از مدرسه، همانند خانهٔ خودتان یا یک کتابخانهٔ نزدیک انجام دهید.",
      },
      {
        en: "Get a good dictionary. A dictionary is your best friend while you're learning English.",
        fa: "یک فرهنگ لغت خوب بخرید. یک فرهنگ لغت، بهترین دوست شماست در حالی‌که مشغول یادگیری زبان انگلیسی هستید.",
      },
      {
        en: "Read a lot. Reading is a great way of practicing your English in your own time. Books and newspapers are useful to improve your English.",
        fa: "زیاد بخوانید. خواندن شیوه‌ای عالی برای تمرین کردن زبان انگلیسی شما در وقت آزادتان است. کتاب‌ها و روزنامه‌ها برای بهبود زبان انگلیسی‌تان سودمند می‌باشند.",
      },
      {
        en: "Label things in your house. Buy a pack of labels and then write the name of items on them, such as phone, window, etc. This is great for beginners.",
        fa: "بر روی وسائل در خانهٔ خود برچسب بزنید. یک بسته برچسب خریداری کرده و سپس نام وسائل را بر روی آنها بنویسید؛ همانند تلفن، پنجره و غیره. این برچسب‌زدن برای مبتدی‌ها عالی است.",
      },
      {
        en: "Practice English whenever you can. It's important that you don't leave your English learning inside the classroom. Make sure you never escape learning.",
        fa: "زبان انگلیسی را هر زمان که توانستید، تمرین کنید. اینکه شما یادگیری انگلیسی خود را داخل کلاس رها نکنید، مهم است. مطمئن شوید که هیچ وقت از یادگیری فرار نمی‌کنید.",
      },
      {
        en: "Write every day. Try and write something every day using new words and grammar that you've learned.",
        fa: "هر روز بنویسید. سعی کنید هر روز با استفاده از واژگان جدید و گرامری که آموخته‌اید چیزی بنویسید.",
      },
      {
        en: "Watch television and movies and listen to good radio programs.",
        fa: "تلویزیون و فیلم تماشا کرده و به برنامه‌های خوب رادیو گوش دهید.",
      },
      {
        en: "Practice every day. Make yourself a study plan. Decide how much time a week you are going to study.",
        fa: "هر روز تمرین کنید. یک برنامهٔ مطالعه برای خود بسازید. تصمیم‌گیری کنید که قصد دارید چه مقدار زمان در یک هفته مطالعه کنید.",
      },
      {
        en: "Don't be afraid to make mistakes. Be confident when speaking or writing in English.",
        fa: "از اشتباه کردن نترسید. هنگام صحبت‌کردن یا نوشتن به زبان انگلیسی، اعتماد به نفس داشته باشید.",
      },
      {
        en: "Practice all four language skills: Reading, writing, speaking and listening.",
        fa: "همهٔ چهار مهارت زبانی را تمرین کنید: خواندن، نوشتن، صحبت‌کردن و گوش‌دادن.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "اسامی قابل شمارش (Countable Nouns)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">اسم قابل شمارش اسمی است که بتوان آن را شمرد. اسم قابل شمارش به دو صورت «مفرد» و «جمع» خواهد بود. برای شمارش اسم قابل شمارش می‌توان قبل از آن از «عدد» استفاده کرد؛ برای مثال: ۱ دانش‌آموز، ۲ دانش‌آموز و...</p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mb-3">💡 <b>نکتهٔ بسیار مهم:</b> در زبان انگلیسی اسم مفرد قابل شمارش، هیچ‌وقت در جمله به‌تنهایی به‌کار برده نمی‌شود و همواره باید قبل از آن از «معرف» مثل: حروف تعریف (a, an, the)، صفت، صفات اشاره، صفات ملکی، عدد و... استفاده کرد.</div>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-emerald-600 text-white"><th class="px-3 py-2">حروف تعریف</th><th class="px-3 py-2">صفات اشاره</th><th class="px-3 py-2">صفات ملکی</th><th class="px-3 py-2">عدد</th><th class="px-3 py-2">صفت</th></tr></thead><tbody><tr class="bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">a pen / the pen</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">this pen</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">my pen</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">one pen</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">red pen</td></tr></tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-2">${EN(
        "I have <b>a pen</b>."
      )} <span class="text-slate-500">«من یک خودکار دارم.»</span> — ${EN(
        "<s class='text-rose-600'>Not: I have pen.</s>"
      )}</p>`,
  },
  {
    title: "اسامی غیرقابل شمارش (Uncountable Nouns)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">اسم غیرقابل شمارش اسمی است که نمی‌توان آن را شمرد (مثل آب و شیر و...) و یا شمردن آن با عقل و منطق آدمی سازگار نیست (مثل شمردن موی سر، برنج و...). بنابراین اسم غیرقابل شمارش همواره به صورت «مفرد» نوشته می‌شود و <b class="text-rose-600">s جمع نمی‌گیرد</b>.</p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mb-3">💡 <b>نکتهٔ بسیار مهم:</b> برای شمارش و اندازه‌گیری اسم غیرقابل شمارش، قبل از آن از «واحدهای شمارش یا اندازه‌گیری» استفاده می‌کنیم که این واحدها «قابل جمع بستن هستند» و s جمع می‌گیرند.</div>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-emerald-600 text-white"><th class="px-3 py-2">واحد شمارش</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">واحد شمارش</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>${[
        ["a kilo of", "یک کیلو از", "a drop of", "یک قطره از"],
        ["a bottle of", "یک بطری از", "a packet of", "یک بستهٔ از"],
        ["a piece of", "یک تکه از", "a sheet of", "یک برگه از"],
        ["a cup of", "یک فنجان", "a glass of", "یک لیوان از"],
        ["a bag of", "یک کیسه", "a carton of", "یک کارتن"],
        ["a slice of", "یک برش، تکه", "a jar of", "یک شیشه از"],
        ["a can of", "یک قوطی", "a tube of", "یک لوله"],
        ["a loaf of", "یک قرص", "a bowl of", "یک کاسه از"],
        ["a bar of", "یک قالب/شمش", "a box of", "یک جعبهٔ از"],
      ]
        .map(
          (r) =>
            `<tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[0]}</td><td class="px-3 py-2 border-t border-stone-100">${r[1]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[2]}</td><td class="px-3 py-2 border-t border-stone-100">${r[3]}</td></tr>`
        )
        .join("")}</tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-2">${EN(
        "Raman is drinking <b>a glass of milk</b> now."
      )} <span class="text-slate-500">«رامان الان در حال نوشیدن یک لیوان شیر است.»</span> (واحد شمارش مفرد)</p>
      <p class="text-[15px] leading-8 text-slate-700 mb-2">${EN(
        "He drank <b>three glasses of milk</b> last night."
      )} <span class="text-slate-500">«او دیشب سه لیوان شیر را نوشید.»</span> (واحد شمارش جمع)</p>
      <div class="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm leading-7 text-rose-900">⚠️ <b>توجه:</b> اسامی مثل «اخبار، اطلاعات، ترافیک، کمک، مبلمان، پوشاک» در فارسی قابل جمع‌بستن هستند اما در انگلیسی غیرقابل شمارش محسوب می‌شوند.</div>`,
  },
  {
    title: "دسته‌بندی انواع اسامی غیرقابل شمارش",
    html: `
      <div class="grid sm:grid-cols-2 gap-3 text-sm leading-7">
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۱. اسامی انتزاعی:</b> <span class="text-slate-600" dir="ltr">interest, happiness, knowledge, danger, love, fear, health, music, luck, education, experience, money</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۲. اسم‌های ترکیبی:</b> <span class="text-slate-600" dir="ltr">soup, paper, air, cement, cheese, sugar, bread, cake, salad</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۳. اسم زبان‌ها:</b> <span class="text-slate-600" dir="ltr">German, French, Italian, English, Japanese, Spanish</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۴. مایعات و گازها:</b> <span class="text-slate-600" dir="ltr">water, milk, blood, coffee, tea, oil, ice, smoke, steam, oxygen</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۵. ورزش‌ها و سرگرمی‌ها:</b> <span class="text-slate-600" dir="ltr">wrestling, shopping, basketball, fishing, swimming, tennis</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۶. ذرات و غلات:</b> <span class="text-slate-600" dir="ltr">snow, flour, sugar, sand, dust, chalk, salt, hair, rice</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۷. رشته‌های تحصیلی:</b> <span class="text-slate-600" dir="ltr">chemistry, mathematics, geography, history, biology, art</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-emerald-700">۸. مجموعه‌ها:</b> <span class="text-slate-600" dir="ltr">clothing, homework, furniture, jewelry, baggage, equipment, fruit</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3 sm:col-span-2"><b class="text-emerald-700">۹. پدیده‌های طبیعی:</b> <span class="text-slate-600" dir="ltr">weather, heat, thunder, sunshine, snow, fire, cold, storm, light, fog, rain, wind</span></div>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mt-3">💡 <b>نکتهٔ مهم:</b> اسامی غیرقابل شمارش فعل «مفرد» می‌گیرند: ${EN(
        "There <b>is</b> a lot of snow on the street."
      )} — و اسامی مثل ${EN(
        "news, physics, mathematics, economics"
      )} به‌ظاهر جمع‌اند ولی با فعل مفرد به‌کار می‌روند: ${EN(
        "there <b>isn't</b> any good <b>news</b>"
      )}</div>`,
  },
  {
    title: "صفات شمارش (کمیت‌ها)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">چنانچه تعداد یک اسم قابل شمارش و یا مقدار یک اسم غیرقابل شمارش معلوم نباشد، از «صفات شمارش» قبل از این اسامی استفاده می‌کنیم:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-emerald-600 text-white"><th class="px-3 py-2">قبل از اسم جمع قابل شمارش</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">قبل از اسم غیرقابل شمارش</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>${[
        ["several", "چند، چندین", "much", "مقدار زیادی"],
        ["many", "تعداد زیادی", "less", "مقدار کمتری"],
        ["few", "تعداد خیلی کمی", "little", "مقدار خیلی کمی"],
        ["a few", "تعداد کمی", "a little", "مقدار کمی"],
        ["a lot of / lots of", "تعداد خیلی زیادی", "a lot of / lots of", "مقدار خیلی زیادی"],
        ["plenty of", "تعداد خیلی زیادی", "plenty of", "مقدار خیلی زیادی"],
        ["some", "تعدادی", "some", "مقداری"],
      ]
        .map(
          (r) =>
            `<tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[0]}</td><td class="px-3 py-2 border-t border-stone-100">${r[1]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[2]}</td><td class="px-3 py-2 border-t border-stone-100">${r[3]}</td></tr>`
        )
        .join("")}</tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mb-3">💡 <b>نکات کنکوری:</b><br>• ${EN(
        "many"
      )} قبل از اسامی سال، ماه، هفته، روز: ${EN("They have lived in Rasht for <b>many years</b>.")}<br>• ${EN(
        "much"
      )} بیشتر در جمله‌های منفی و سؤالی: ${EN("How <b>much</b> information did you have?")}<br>• ${EN(
        "some"
      )} اکثراً در جملات مثبت، اما برای «درخواست و پیشنهاد» در سؤال هم می‌آید: ${EN("Would you like <b>some</b> milk?")}<br>• ${EN(
        "few / little"
      )} به‌تنهایی جمله را «منفی» می‌کند، اما ${EN("a few / a little")} مفهوم مثبت دارد.</div>
      <p class="text-[15px] leading-8 text-slate-700">${EN(
        "How many students are there in your classroom?"
      )} <span class="text-slate-500">«چه تعداد دانش‌آموز در کلاس شما وجود دارد؟»</span> — ${EN(
        "How much money does he need?"
      )} <span class="text-slate-500">«او چه مقدار پول برای خرید آن ساعت لازم دارد؟»</span></p>`,
  },
  {
    title: "اعداد (Numbers)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">اعداد فقط «قبل از اسامی قابل شمارش» برای مشخص کردن تعداد به‌کار برده می‌شوند و هرگز قبل از اسامی غیرقابل شمارش نمی‌آیند (مگر با واحدهای اندازه‌گیری).</p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mb-3">💡 <b>نکات کنکوری:</b><br>• بعد از عدد ۱ اسم «مفرد» و بعد از سایر اعداد اسم «جمع» می‌آید: ${EN(
        "1 pen / 2 pens / 24 pens"
      )} — (برعکسِ فارسی: ۲ خودکار، ۲۴ خودکار!)<br>• اعداد ۲۱ تا ۹۹ بین دهگان و یکان «خط تیره» دارند: ${EN(
        "twenty-five languages"
      )}<br>• ${EN("hundred, thousand, million, billion")} همیشه «مفرد» نوشته می‌شوند: ${EN(
        "three hundred horses / eight thousand dollars"
      )}<br>• بین عدد و اسم، حرف تعریف/ملکی/اشاره و حرف اضافه نمی‌آید: ${EN(
        "<s class='text-rose-600'>four hundred the dollars</s>"
      )}<br>• برای مفاهیم کلی: ${EN("hundreds of students / thousands of books / millions of birds")}</div>
      <p class="text-[15px] leading-8 text-slate-700">هرگاه اسم قابل شمارشی که عدد دارد صفت هم بگیرد، «عدد ما بین صفت و اسم» می‌آید: ${EN(
        "She is reading <b>one</b> <b>interesting</b> novel."
      )} — ${EN("I bought <b>four</b> <b>interesting</b> books last week.")}</p>`,
  },
  {
    title: "ترتیب اجزای جمله در جملهٔ مثبت",
    html: `
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-emerald-600 text-white"><th class="px-2 py-2">فاعل</th><th class="px-2 py-2">فعل کمکی</th><th class="px-2 py-2">قید تکرار</th><th class="px-2 py-2">فعل اصلی</th><th class="px-2 py-2">مفعول</th><th class="px-2 py-2">قید حالت</th><th class="px-2 py-2">قید مکان</th><th class="px-2 py-2">قید زمان</th></tr></thead><tbody><tr class="bg-stone-50"><td class="px-2 py-2 border-t border-stone-100" dir="ltr">The children</td><td class="px-2 py-2 border-t border-stone-100" dir="ltr">are</td><td class="px-2 py-2 border-t border-stone-100" dir="ltr">—</td><td class="px-2 py-2 border-t border-stone-100" dir="ltr">playing</td><td class="px-2 py-2 border-t border-stone-100" dir="ltr">football</td><td class="px-2 py-2 border-t border-stone-100" dir="ltr">happily</td><td class="px-2 py-2 border-t border-stone-100" dir="ltr">at the park</td><td class="px-2 py-2 border-t border-stone-100" dir="ltr">right now</td></tr></tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">«بچه‌ها الان با خوشحالی در پارک در حال فوتبال بازی کردن هستند.»</p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mb-3">💡 <b>نکته‌ها:</b><br>• <b>قید تکرار</b> (always, usually, often, sometimes, never...) قبل از فعل اصلی و بعد از فعل کمکی/ناقص می‌آید: ${EN(
        "He <b>usually</b> plays tennis on Friday."
      )} — ${EN("They <b>were</b> often late.")}<br>• قیدهای ${EN(
        "rarely, seldom, hardly, never"
      )} جمله را «منفی» می‌کنند و دیگر از not استفاده نمی‌شود.<br>• ${EN(
        "sometimes"
      )} در ابتدا و انتهای جمله هم می‌تواند بیاید.<br>• قیدهای حالت، مکان و زمان به ترتیبِ (کوچک به بزرگ) می‌آیند: ${EN(
        "He was walking <b>slowly on the street this morning</b>."
      )}</div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l1-w1", fa: "بچه‌ها الان با خوشحالی در پارک در حال فوتبال بازی کردن هستند.", answer: ["The", "children", "are", "playing", "football", "happily", "at", "the", "park", "right", "now"], hint: "فاعل + فعل کمکی + فعل اصلی + مفعول + قید حالت + قید مکان + قید زمان" },
  { id: "l1-w2", fa: "دوشنبهٔ گذشته در همین ساعت‌ها، یک هواپیما به آرامی در آسمان در حال پرواز بود.", answer: ["An", "airplane", "was", "slowly", "flying", "in", "the", "sky", "at", "this", "time", "last", "Monday"] },
  { id: "l1-w3", fa: "پدر من معمولاً جمعه‌ها تنیس بازی می‌کند.", answer: ["My", "father", "usually", "plays", "tennis", "on", "Fridays"], hint: "قید تکرار قبل از فعل اصلی" },
  { id: "l1-w4", fa: "من دیروز او را دیدم که به سرعت در حومهٔ شهر اسب‌سواری می‌کرد.", answer: ["Yesterday", "I", "saw", "him", "riding", "a", "horse", "fast", "in", "the", "countryside"], hint: "قید زمان می‌تواند اول جمله بیاید" },
  { id: "l1-w5", fa: "او معمولاً با ماشین خودش به سر کار می‌رود.", answer: ["He", "usually", "goes", "to", "work", "by", "his", "car"] },
  { id: "l1-w6", fa: "ماشین‌های خیلی زیادی دیروز در خیابان بودند و مردم مجبور بودند به آرامی رانندگی کنند.", answer: ["There", "were", "too", "many", "cars", "in", "the", "street", "yesterday", "and", "people", "had", "to", "drive", "slowly"] },
  { id: "l1-w7", fa: "او اغلب شیر خیلی زیادی در صبح‌ها می‌نوشد.", answer: ["He", "often", "drinks", "a", "lot", "of", "milk", "in", "the", "morning"] },
  { id: "l1-w8", fa: "ما هرگز به رادیو گوش نمی‌دهیم.", answer: ["We", "never", "listen", "to", "the", "radio"], hint: "قید never جمله را منفی می‌کند" },
];

const synonyms = [
  SYN("absolutely", "surely", "حتماً، قطعاً"),
  SYN("additional", "extra", "اضافی"),
  SYN("besides", "in addition to", "علاوه بر"),
  SYN("despite", "in spite of", "علی‌رغم"),
  SYN("fast", "quick", "سریع"),
  SYN("form", "make up", "شکل دادن"),
  SYN("fortunately", "luckily", "خوشبختانه"),
  SYN("quit", "give up", "رها کردن"),
  SYN("greatly", "mostly", "عمده‌تأً، عمدتاً"),
  SYN("imagine", "think of", "تصور کردن"),
  SYN("largely", "greatly", "عمده‌تأً"),
  SYN("nearly", "about", "تقریباً"),
  SYN("notice", "attend", "توجه کردن"),
  SYN("piece", "slice", "قطعه، تکه"),
  SYN("powerful", "strong", "قدرتمند"),
  SYN("region", "area", "منطقه، ناحیه"),
  SYN("seek", "search for", "جستجو کردن"),
  SYN("special", "certain", "خاص، ویژه"),
  SYN("suitable", "appropriate", "مناسب"),
  SYN("tiny", "small", "کوچک"),
  SYN("same", "similar", "مشابه، یکسان"),
  SYN("valuable", "profitable", "باارزش"),
  SYN("excellent", "fantastic", "عالی"),
  SYN("a bit", "a little", "یه‌خورده"),
  SYN("actually", "in fact", "در واقع"),
  SYN("specific", "particular", "خاص، ویژه"),
  SYN("goal", "aim = purpose", "هدف، مقصد"),
  SYN("unique", "uncommon", "تک، تنها"),
  SYN("business", "trade", "تجارت"),
  SYN("effective", "efficient", "مؤثر"),
  SYN("famous", "well-known", "مشهور، معروف"),
  SYN("general", "normal", "کلی، معمول"),
  SYN("happening", "event", "رویداد، واقعه"),
  SYN("harmful", "destructive", "مضر"),
  SYN("keep on", "continue", "ادامه دادن"),
  SYN("early", "soon", "زودی، به زودی"),
  SYN("project", "scheme", "پروژه، طرح"),
  SYN("range", "vary", "متغیر بودن"),
  SYN("identify", "recognize", "تشخیص دادن"),
  SYN("around", "surroundings", "اطراف، دور و بر"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۲۰ تست) ----------------
  Q("l1-v1", "vocab", "She has a good deal of ---------------- as an ice skater and wins a lot of prizes in the competitions every year.", ["access", "ability", "experience", "image"], 1, "او توانایی خوبی به عنوان اسکیت‌باز روی یخ دارد و هر ساله در رقابت‌ها جوایز زیادی می‌برد."),
  Q("l1-v2", "vocab", "Jim knew ---------------- nothing about the business when he joined the company.", ["absolutely", "fluently", "frequently", "wrongly"], 0, "وقتی که جیم به شرکت پیوست، قطعاً هیچ چیزی در مورد کسب‌وکار نمی‌دانست."),
  Q("l1-v3", "vocab", "The ability to give clear ---------------- is the most important quality of an ideal teacher.", ["experiences", "suggestions", "combinations", "explanations"], 3, "توانایی دادن توضیحات واضح، مهم‌ترین کیفیت یک معلم ایده‌آل است."),
  Q("l1-v4", "vocab", "It's in the underdeveloped eastern ---------------- of the country that the biggest problems exist.", ["region", "continent", "villages", "plains"], 0, "در منطقهٔ شرقی توسعه‌نیافتهٔ کشور، بزرگ‌ترین مشکلات وجود دارند."),
  Q("l1-v5", "vocab", "The kitchen connects with the dining room ---------------- of a narrow hallway in that old building.", ["including", "by means of", "for instance", "get along"], 1, "در آن ساختمان قدیمی، آشپزخانه توسط یک راهروی باریک به اتاق غذاخوری وصل می‌شود."),
  Q("l1-v6", "vocab", "Women ---------------- only a small proportion of the prison population in our country.", ["hang out", "make up", "watch out", "look out"], 1, "زنان فقط یک قسمت کوچکی از جمعیت زندانیان در کشور ما را تشکیل می‌دهند."),
  Q("l1-v7", "vocab", "The police managed to gain ---------------- to roof through an upstairs window.", ["ability", "habit", "mission", "access"], 3, "پلیس موفق شد از طریق پنجرهٔ راه‌پلهٔ بالا به پشت‌بام دسترسی پیدا کند."),
  Q("l1-v8", "vocab", "I was surprised when I saw the farm. I had ---------------- it would be much bigger.", ["imagined", "suggested", "escaped", "improved"], 0, "زمانی که مزرعه را دیدم شگفت‌زده شدم. من تصور کرده بودم باید خیلی بزرگ‌تر باشد."),
  Q("l1-v9", "vocab", "The program enables pupils to gain some ---------------- of the world of work.", ["experiments", "experience", "suggestions", "influences"], 1, "برنامه شاگردان را قادر می‌سازد که مقداری تجربه از دنیای کار به دست آورند."),
  Q("l1-v10", "vocab", "There are three important ---------------- we must bear in mind when we solve that problem.", ["points", "keys", "labels", "limits"], 0, "سه نکتهٔ مهم وجود دارد که وقتی آن مسئله را حل می‌کنیم باید در ذهن داشته باشیم."),
  Q("l1-v11", "vocab", "Only thirty ---------------- of that country's people are covered by health insurance.", ["despite", "item", "percent", "range"], 2, "فقط سی درصد از افراد آن کشور تحت پوشش بیمهٔ سلامتی هستند."),
  Q("l1-v12", "vocab", "Your ---------------- is the first and main language that you learnt from your parents when you were a child.", ["mother tongue", "second language", "foreign language", "source language"], 0, "زبان مادری، زبان اول و اصلی است که شما وقتی بچه بودید از والدین‌تان یاد گرفتید."),
  Q("l1-v13", "vocab", "Today, we can observe the effects of technology on modern ---------------- in the world.", ["state", "country", "century", "society"], 3, "امروزه ما می‌توانیم اثرات تکنولوژی را روی جامعهٔ مدرن در جهان مشاهده کنیم."),
  Q("l1-v14", "vocab", 'A: "What do you wear when you go to that important meeting in the office." B: "Well, it ----------------."', ["makes", "varies", "imagines", "ranges"], 1, "الف: وقتی به آن جلسهٔ مهم در اداره می‌روید چه می‌پوشید؟ ب: خوب، فرق می‌کند."),
  Q("l1-v15", "vocab", "A large mass of land surrounded by the sea is called ----------------.", ["continent", "country", "gulf", "ocean"], 0, "یک تودهٔ بزرگ زمین که توسط دریا احاطه شده است، قاره نامیده می‌شود."),
  Q("l1-v16", "vocab", "We were trained to speak English ---------------- and without any unnecessary hesitation.", ["repeatedly", "fluently", "frequently", "specifically"], 1, "ما آموزش دیده‌ایم که انگلیسی را به طور روان و بدون هیچ مکث غیرضروری صحبت کنیم."),
  Q("l1-v17", "vocab", "She seemed no happier ---------------- the fact that her physical condition had improved.", ["according to", "besides", "despite", "depend on"], 2, "او علی‌رغم این حقیقت که شرایط فیزیکی‌اش بهتر شده بود، خوشحال‌تر به نظر نرسید."),
  Q("l1-v18", "vocab", "Quantities will vary ---------------- how many servings of soup you want to prepare.", ["according to", "relate to", "divide into", "to be honest"], 0, "با توجه به تعداد وعده‌های سوپ که می‌خواهید آماده کنید، مقادیر متفاوت خواهد بود."),
  Q("l1-v19", "vocab", "The government will direct the ---------------- taxes to the educational reform.", ["favorite", "additional", "popular", "specific"], 1, "دولت مالیات‌های اضافی را به سمت اصلاحات آموزشی هدایت خواهد کرد."),
  Q("l1-v20", "vocab", "Hollywood is the ---------------- of the movie industry in the world.", ["ability", "region", "capital", "access"], 2, "هالیوود پایتخت صنعت فیلم در جهان است."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l1-k1", "vocab-konkuri", "Our ---------------- to think and speak makes us different from other animals.", ["ability", "activity", "research", "memory"], 0, "توانایی ما در فکر کردن و سخن گفتن، ما را از دیگر حیوانات متمایز می‌کند."),
  Q("l1-k2", "vocab-konkuri", "Everyone needs to have both ---------------- and physical health.", ["mental", "religious", "careful", "reasonable"], 0, "همه نیاز دارند هم سلامتی ذهنی و هم جسمی داشته باشند."),
  Q("l1-k3", "vocab-konkuri", "These days it is very difficult to predict what will ---------------- next year.", ["respect", "communicate", "imagine", "happen"], 3, "این روزها پیش‌بینی اینکه سال آینده چه اتفاقی خواهد افتاد خیلی سخت است."),
  Q("l1-k4", "vocab-konkuri", "To be quite ----------------, I don't think your son will be successful in this field of study.", ["honest", "worry", "strange", "familiar"], 0, "راستش را بخواهید، فکر نمی‌کنم پسر شما در این رشتهٔ تحصیلی موفق شود."),
  Q("l1-k5", "vocab-konkuri", "The police ---------------- the copy with the original, but there was not much difference.", ["combined", "connected", "compared", "considered"], 2, "پلیس کپی را با نسخهٔ اصلی مقایسه کرد، اما تفاوت زیادی وجود نداشت."),
  Q("l1-k6", "vocab-konkuri", "Most of the ancient languages have ---------------- because they have no speakers.", ["gone out", "died out", "given up", "come in"], 1, "بیشتر زبان‌های باستانی از بین رفته‌اند چون هیچ گوینده‌ای ندارند."),
  Q("l1-k7", "vocab-konkuri", 'That book is appropriate for young children. "appropriate" means ----------------.', ["efficient", "various", "suitable", "explicit"], 2, "معنی appropriate: مناسب، شایسته"),
  Q("l1-k8", "vocab-konkuri", "Education and training are the most effective ---------------- of improving a nation's culture.", ["layers", "results", "means", "functions"], 2, "آموزش و تربیت مؤثرترین ابزار برای بهبود فرهنگ یک ملت هستند."),
  Q("l1-k9", "vocab-konkuri", "Every month the group meets so its members can ---------------- their opinions.", ["contrast", "range", "exchange", "imagine"], 2, "هر ماه گروه جمع می‌شود تا اعضایش بتوانند عقایدشان را مبادله کنند."),
  Q("l1-k10", "vocab-konkuri", "I didn't believe his ---------------- that he had stolen the money to give it to charity.", ["space", "notice", "value", "explanation"], 3, "من به توضیحش که گفته بود پول را برای بخشیدن به خیریه دزدیده، باور نکردم."),
  // ---------------- گرامر و نگارش (۲۰ تست) ----------------
  Q("l1-g1", "grammar", "We didn't have sugar and my mother asked me to buy ----------------.", ["two bag of white sugar", "two bags of sugar white", "two bags of white sugar", "two bag of white sugars"], 2, "شکر نداشتیم و مادرم ازم خواست دو کیلو شکر سفید بخرم. (واحد شمارش جمع + صفت قبل از اسم)"),
  Q("l1-g2", "grammar", "There ---------------- always a lot of ---------------- on the ground in Alaska in the winter.", ["is / snows", "is / snow", "are / snow", "are / snows"], 1, "در فصل زمستان در آلاسکا برف بسیار زیادی بر روی زمین وجود دارد. (snow غیرقابل شمارش + فعل مفرد)"),
  Q("l1-g3", "grammar", "My children usually drink ---------------- in the morning. It keeps them healthy.", ["two glass of milk", "two glass of milks", "two glasses of milk", "two glasses of milks"], 2, "بچه‌های من معمولاً دو لیوان شیر را در صبح‌ها می‌خورند. (milk غیرقابل شمارش، لیوان جمع می‌شود)"),
  Q("l1-g4", "grammar", "Many people know two languages, but ---------------- people speak more than ----------------.", ["very few / ten languages", "very little / ten languages", "very a few / ten language", "very a little / ten language"], 0, "بسیاری از مردم دو زبان را بلد هستند، اما تعداد خیلی کمی از مردم بیشتر از ده زبان را صحبت می‌کنند."),
  Q("l1-g5", "grammar", "Is there ---------------- traffic in your town?", ["a few", "many", "some", "much"], 3, "آیا ترافیک زیادی در شهر شما وجود دارد؟ (traffic غیرقابل شمارش → much در سؤال)"),
  Q("l1-g6", "grammar", 'A: "Do you have five dollars?" B: "No, I don\'t, but David has ---------------- money with him."', ["a lot of", "few", "many", "a lot"], 0, "ـ پنج دلار داری؟ ـ نه، اما «دیوید» پول خیلی زیادی با خودش دارد. (money غیرقابل شمارش → a lot of)"),
  Q("l1-g7", "grammar", "Spain is a beautiful country. It is ---------------- the countries I want to visit.", ["a", "a lot of", "one of", "a little of"], 2, "اسپانیا کشوری زیباست. یکی از کشورهایی است که می‌خواهم از آن دیدن کنم. (one of + اسم جمع)"),
  Q("l1-g8", "grammar", "Since I started my new job, it seems like I've got ---------------- time to do the things I enjoy.", ["very few", "very little", "very a lot", "very many"], 1, "از زمانی که شغل جدیدم را شروع کرده‌ام، به نظر می‌رسد که وقت خیلی کمی برای کارهایی که از آنها لذت می‌برم دارم."),
  Q("l1-g9", "grammar", "We invited ---------------- member of the club to the party last night.", ["all", "both", "each", "a little"], 2, "من شب گذشته هر یک از اعضای باشگاه را به مهمانی دعوت کردم. (each + اسم مفرد)"),
  Q("l1-g10", "grammar", 'A: "How ---------------- do you have to do tonight?" B: "I\'ve got a lot."', ["many homework", "a few homework", "a little homework", "much homework"], 3, "ـ چه مقدار تکلیف را تو مجبوری امشب انجام بدهی؟ ـ من خیلی زیادی دارم. (homework غیرقابل شمارش)"),
  Q("l1-g11", "grammar", 'A: "Have you ever travelled to Shiraz?" B: "Yes I have been there for ---------------- years."', ["a little", "many", "a lot of", "much"], 1, "ـ آیا تا به حال به شیراز سفر کرده‌ای؟ ـ بله، من خیلی سال‌ها پیش در آنجا بوده‌ام. (many قبل از سال/ماه/هفته/روز)"),
  Q("l1-g12", "grammar", "I had ---------------- soup and ---------------- sandwich for lunch. They were really delicious.", ["some / some", "a / some", "some / a", "a / a"], 2, "من کمی سوپ و یک ساندویچ برای ناهار خوردم. آنها خیلی خوشمزه بودند. (soup غیرقابل شمارش + sandwich مفرد)"),
  Q("l1-g13", "grammar", "How much -------------------- on English last week?", ["did you spend time", "did time you spend", "time did you spend", "time you spend"], 2, "چه مدت زمانی (در) هفتهٔ گذشته برای انگلیسی صرف کردی؟ (much + اسم غیرقابل شمارش سپس حالت سؤالی)"),
  Q("l1-g14", "grammar", "There were too many cars ---------------- and people had to drive ----------------.", ["yesterday in the street / slow", "in the street yesterday / slowly", "in the street yesterday / slow", "yesterday in the street / slowly"], 1, "ماشین‌های خیلی زیادی دیروز در خیابان وجود داشتند و مردم مجبور بودند به آرامی رانندگی کنند. (قید مکان قبل از قید زمان)"),
  Q("l1-g15", "grammar", "---------------- I saw him riding a horse ----------------.", ["Yesterday / fast in the countryside", "Fast / yesterday in the countryside", "Yesterday / fastly in the countryside", "Fast / in the countryside yesterday"], 0, "من او را دیروز دیدم که به سرعت در حومهٔ شهر در حال اسب‌سواری بود. (fast قید حالت بدون ly)"),
  Q("l1-g16", "grammar", "Choose the sentence with the best order.", ["An airplane slowly was flying in the sky last Monday at this time.", "In the sky an airplane was slowly flying at this time last Monday.", "An airplane was last Monday flying slowly in the sky at this time.", "An airplane was slowly flying in the sky at this time last Monday."], 3, "ترتیب صحیح: فاعل + فعل کمکی + قید حالت + قید مکان + قید زمان — «دوشنبهٔ گذشته در همین ساعت‌ها، یک هواپیما به آرامی در آسمان در حال پرواز بود.»"),
  Q("l1-g17", "grammar", "Choose the sentence with the best order.", ["Does usually your father go to work by his car or by bus?", "Does your father usually go to work by his car or by bus?", "Work to does your father usually go by his car or by bus?", "By his car or by bus to work does your father usually go?"], 1, "قید تکرار بعد از فعل کمکی می‌آید: «آیا پدرت معمولاً با ماشین خودش به سرکار می‌رود یا با اتوبوس؟»"),
  Q("l1-g18", "grammar", "Choose the sentence with the best order.", ["Should little children so fast often drink a lot of milk in the morning?", "Often should little children drink in the morning a lot of milk so fast?", "Should little children often drink a lot of milk so fast in the morning?", "Should little children often drink so fast a lot of milk in the morning?"], 2, "«آیا بچه‌های کوچک اغلب باید در صبح‌ها شیری خیلی زیادی را خیلی به سرعت بنوشند؟»"),
  Q("l1-g19", "grammar", "Choose the sentence which is grammatically CORRECT.", ["I bought thirty seven pencils for my students.", "He lent one hundred-sixty one dollars to his brother.", "He borrowed one thousand thirty-nine dollars from his friend.", "There are two-hundred seventy two apple trees in that jungle."], 2, "خط تیره فقط بین دهگان و یکان: one thousand thirty-nine — «او هزار و سی‌ونه دلار را از دوستش قرض گرفت.»"),
  Q("l1-g20", "grammar", "Choose the sentence which is grammatically CORRECT.", ["There are some fresh bread in the refrigerator.", "My father bought three bags of rices last evening.", "There were not much rain in last spring.", "I ate two slices of Italian pizza at the restaurant."], 3, "«من دو تکه پیتزای ایتالیایی را در رستوران خوردم.» (slice قابل شمارش است)"),
];

export const lesson1: LessonData = {
  id: 1,
  titleEn: "Understanding People",
  titleFa: "فهمیدن مردم",
  tagline: "زبان‌های دنیا، ارتباطات و مهارت‌های یادگیری زبان",
  color: "emerald",
  grade: "یازدهم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  writing,
  quizzes,
};

export default lesson1;
