import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Two: "A Healthy Lifestyle"  |  یک شیوهٔ زندگی سالم
// =====================================================================

const vocabulary = [
  W("a bit", "یه‌خورده، کمی، ذره‌ای", "phr"),
  W("active", "فعال", "adj"),
  W("activity", "فعالیت", "n"),
  W("addict", "معتاد", "n"),
  W("addictive", "اعتیادآور", "adj"),
  W("addiction", "اعتیاد", "n"),
  W("all right", "درسته، بسیار خوب", "phr"),
  W("anti-cancer", "ضد سرطان", "adj"),
  W("asleep", "خوابیده", "adj"),
  W("attend", "شرکت کردن در، حضور یافتن در", "v"),
  W("attention", "توجه", "n"),
  W("avoid", "خودداری کردن - اجتناب کردن", "v"),
  W("balanced", "متوازن - متعادل", "adj"),
  W("bear", "تحمل کردن - به دنیا آوردن - خرس", "v"),
  W("behave", "رفتار کردن", "v"),
  W("behavior", "رفتار", "n"),
  W("blood pressure", "فشار خون", "n"),
  W("boat", "قایق", "n"),
  W("business", "تجارت - حرفه - کار", "n"),
  W("call sb back", "تماس مجدد گرفتن", "phr.v"),
  W("calm", "آرام، خونسرد", "adj"),
  W("candy", "آب‌نبات", "n"),
  W("case", "حالت، مورد، قضیه، نمونه", "n"),
  W("certain", "مطمئن - مشخص", "adj"),
  W("check in", "پذیرش شدن (هتل، فرودگاه و...)", "phr.v"),
  W("clear", "واضح، شفاف - پاک کردن", "adj"),
  W("climb", "بالا رفتن، صعود کردن", "v"),
  W("come back", "برگشتن", "phr.v"),
  W("common", "عادی، رایج، متداول", "adj"),
  W("conditions", "شرایط", "n"),
  W("confuse", "گیج کردن", "v"),
  W("contain", "شامل بودن، در بر داشتن", "v"),
  W("cook", "آشپزی - پختن", "v"),
  W("couch potato", "معتاد تلویزیون", "n"),
  W("cure", "معالجه کردن، درمان کردن", "v"),
  W("cycle", "دوچرخه‌سواری کردن - چرخه، دوره", "v"),
  W("cycling", "دوچرخه‌سواری", "n"),
  W("dead", "مرده", "adj"),
  W("death", "مرگ", "n"),
  W("defend", "دفاع کردن از، حمایت کردن", "v"),
  W("definition", "تعریف، معنی، تعبیر", "n"),
  W("depressed", "افسرده، غمگین", "adj"),
  W("describe", "توصیف کردن", "v"),
  W("description", "توصیف", "n"),
  W("details", "جزئیات", "n"),
  W("diet", "رژیم غذایی", "n"),
  W("direct", "هدایت کردن، مستقیم", "v"),
  W("discuss", "بحث کردن", "v"),
  W("disagree", "مخالفت کردن", "v"),
  W("dislike", "دوست نداشتن", "v"),
  W("disorder", "بی‌نظمی - اختلال، بیماری", "n"),
  W("drug", "دارو، مواد مخدر", "n"),
  W("educate", "با سواد کردن - تحصیل کردن", "v"),
  W("education", "تحصیلات، آموزش", "n"),
  W("educated", "باسواد، تحصیل‌کرده", "adj"),
  W("effect", "اثر، نتیجه", "n"),
  W("effective", "مؤثر", "adj"),
  W("emergency", "اورژانس", "n"),
  W("emotion", "احساس", "n"),
  W("emotional", "احساسی، عاطفی", "adj"),
  W("enable", "قادر ساختن", "v"),
  W("even", "حتی", "adv"),
  W("event", "رویداد، حادثه، رخداد", "n"),
  W("ever", "تا به حال - هرگز", "adv"),
  W("excellent", "عالی، عالی‌مقشر", "adj"),
  W("exciting", "هیجان‌برانگیز", "adj"),
  W("factor", "عامل، فاکتور", "n"),
  W("fat", "چاق - چربی", "adj"),
  W("fight", "جنگ، دعوا - مبارزه کردن، دعوا کردن", "n"),
  W("flat", "مسطح، هموار، آپارتمان - پنچر", "adj"),
  W("flight", "پرواز", "n"),
  W("forbid", "ممنوع کردن - قدغن کردن", "v"),
  W("forbidden", "ممنوع، قدغن", "adj"),
  W("frequency", "تکرار - فرکانس", "n"),
  W("fully", "کاملاً", "adv"),
  W("function", "عملکرد، کاربرد", "n"),
  W("gain", "به دست آوردن، کسب کردن", "v"),
  W("general", "معمول، عادی", "adj"),
  W("gerund", "(دستور زبان) اسم مصدر", "n"),
  W("get away", "فرار کردن - ترک کردن", "phr.v"),
  W("get up", "از خواب بلند شدن", "phr.v"),
  W("give up", "رها کردن، تسلیم شدن، دست کشیدن از", "phr.v"),
  W("goal", "هدف، مقصد، منظور", "n"),
  W("go away", "دور شدن، رفتن", "phr.v"),
  W("good at", "خوب در", "phr"),
  W("groceries", "خوار و بار", "n"),
  W("grow up", "رشد کردن، بالغ شدن", "phr.v"),
  W("guess", "حدس - حدس زدن", "v"),
  W("guest", "مهمان", "n"),
  W("habit", "عادت", "n"),
  W("hang out", "وقت گذراندن (در یک مکان)", "phr.v"),
  W("happen", "اتفاق افتادن", "v"),
  W("happening", "اتفاق، رویداد", "n"),
  W("harm", "ضرر", "n"),
  W("harmful", "مضر", "adj"),
  W("harmless", "بی‌ضرر", "adj"),
  W("health", "سلامتی، تندرستی", "n"),
  W("healthy", "سالم، تندرست - مفید (خوراکی)", "adj"),
  W("heart attack", "سکتهٔ قلبی", "n"),
  W("heartbeat", "ضربان قلب", "n"),
  W("hiking", "کوه‌نوردی، پیاده‌روی", "n"),
  W("history", "تاریخ، تاریخچه", "n"),
  W("hobby", "سرگرمی", "n"),
  W("homeless", "بی‌خانمان", "adj"),
  W("however", "اما، در هر صورت", "adv"),
  W("hurt", "صدمه زدن، آسیب رساندن", "v"),
  W("idea", "ایده، نظر، عقیده", "n"),
  W("identify", "شناسایی کردن، تشخیص دادن", "v"),
  W("identification", "شناسایی", "n"),
  W("illness", "بیماری", "n"),
  W("improve", "بهبود بخشیدن، بهبود یافتن", "v"),
  W("include", "شامل بودن، در بر داشتن", "v"),
  W("incomplete", "ناکامل، ناتمام، ناقص", "adj"),
  W("incorrect", "نادرست، غلط", "adj"),
  W("increase", "افزایش دادن، افزایش یافتن", "v"),
  W("influence", "تأثیر، تحت تأثیر قرار دادن", "n"),
  W("invention", "اختراع", "n"),
  W("invitation", "دعوت", "n"),
  W("jog", "آهسته دویدن", "v"),
  W("join", "پیوستن، ملحق شدن، متصل شدن", "v"),
  W("junk food", "غذای ناسالم، هله‌هوله", "n"),
  W("keep on", "ادامه دادن", "phr.v"),
  W("laugh", "خندیدن", "v"),
  W("laughter", "خنده", "n"),
  W("lazy", "تنبل", "adj"),
  W("leave", "ترک کردن، جاگذاشتن - قرار دادن", "v"),
  W("lifestyle", "شیوه زندگی", "n"),
  W("limit", "محدود کردن، محدودیت", "v"),
  W("line", "خط - سطر، ردیف - ریسمان", "n"),
  W("look after", "مراقبت کردن از", "phr.v"),
  W("main", "عمده، اصلی، اساسی", "adj"),
  W("mainly", "عمده‌تأً، اساساً", "adv"),
  W("make up", "تشکیل دادن - جبران کردن - آرایش", "phr.v"),
  W("manner", "شیوه، حالت - (در جمع) رفتار", "n"),
  W("measure", "اندازه‌گیری کردن", "v"),
  W("medical", "پزشکی", "adj"),
  W("medicine", "دوا، دارو - پزشکی", "n"),
  W("member", "عضو", "n"),
  W("midday", "نیمهٔ روز، ظهر", "n"),
  W("middle", "وسط، میانه", "n"),
  W("miracle", "معجزه", "n"),
  W("mission", "مأموریت", "n"),
  W("natural", "طبیعی", "adj"),
  W("necessary", "لازم، ضروری", "adj"),
  W("neighbor", "همسایه", "n"),
  W("noise", "سر و صدا، شلوغی", "n"),
  W("nope", "نه!، نخیر!", "adv"),
  W("normal", "عادی، معمول", "adj"),
  W("object", "مفعول - شیء", "n"),
  W("onion", "پیاز", "n"),
  W("opinion", "عقیده، نظر", "n"),
  W("paper", "کاغذ - روزنامه", "n"),
  W("part", "قسمت، بخش", "n"),
  W("partly", "تا حدی، نسبتاً", "adv"),
  W("patient", "بیمار - صبور", "n"),
  W("perfect", "عالی، کامل، تمام", "adj"),
  W("plan", "طرح، نقشه، برنامه", "n"),
  W("plain", "دشت، جلگه - ساده، آشکار", "n"),
  W("plane", "هواپیما", "n"),
  W("plant", "گیاه - کاشتن", "n"),
  W("positive", "مثبت", "adj"),
  W("possible", "ممکن، احتمال", "adj"),
  W("pray", "نماز - عبادت، دعا", "v"),
  W("predict", "پیش‌بینی کردن", "v"),
  W("prefer", "ترجیح دادن", "v"),
  W("prefix", "پیشوند", "n"),
  W("prepare", "مهیا کردن، آماده کردن", "v"),
  W("preposition", "حرف اضافه", "n"),
  W("pressure", "فشار", "n"),
  W("prevent", "جلوگیری کردن، خودداری کردن", "v"),
  W("produce", "تولید کردن", "v"),
  W("producer", "تولیدکننده", "n"),
  W("production", "تولید", "n"),
  W("proportion", "نسبت", "n"),
  W("properly", "به درستی", "adv"),
  W("pyramid", "هرم", "n"),
  W("quickly", "به سرعت", "adv"),
  W("quince", "(میوه) به", "n"),
  W("rarely", "به ندرت", "adv"),
  W("reality", "واقعیت", "n"),
  W("reason", "دلیل، علت", "n"),
  W("recent", "اخیری، تازه", "adj"),
  W("recreational", "تفریحی، سرگرمی", "adj"),
  W("relate", "ربط دادن، مربوط بودن", "v"),
  W("relationship", "رابطه", "n"),
  W("replay", "بازپخش، دوباره پخش کردن", "v"),
  W("rethink", "تجدیدنظر کردن", "v"),
  W("retired", "بازنشسته", "adj"),
  W("rewrite", "بازنویسی کردن", "v"),
  W("risk", "خطر کردن، ریسک کردن", "v"),
  W("sadly", "متأسفانه، با ناراحتی", "adv"),
  W("sail", "بادبان - حرکت کردن در دریا", "v"),
  W("secret", "راز، رمز", "n"),
  W("serious", "جدی، عبوس، اخمو", "adj"),
  W("serving", "پرس (غذا)", "n"),
  W("situation", "موقعیت، وضعیت", "n"),
  W("skim", "سرسری خواندن، اجمال‌خواندن", "v"),
  W("smartphone", "تلفن هوشمند", "n"),
  W("smoker", "سیگاری", "n"),
  W("social", "اجتماعی", "adj"),
  W("socialize", "معاشرت کردن - اجتماعی کردن", "v"),
  W("special", "ویژه، خاص، سفارشی", "adj"),
  W("specialist", "متخصص، کارشناس", "n"),
  W("sportsperson", "ورزشکار", "n"),
  W("stage", "مرحله - صحنه", "n"),
  W("step", "مرحله، قدم", "n"),
  W("stress", "استرس", "n"),
  W("subject", "فاعل، موضوع", "n"),
  W("suffix", "پسوند", "n"),
  W("take", "بر داشتن، بردن", "v"),
  W("take part in", "شرکت کردن در", "phr.v"),
  W("taste", "چشیدن، مزه دادن - سلیقه", "v"),
  W("thought", "فکر، تفکر", "n"),
  W("tired (of)", "خسته (از)", "adj"),
  W("title", "عنوان - لقب، مقام", "n"),
  W("topic", "موضوع، عنوان، سر فصل", "n"),
  W("towards", "به طرف، به سوی، نسبت به", "prep"),
  W("turn around", "دور زدن، چرخیدن", "phr.v"),
  W("unfortunately", "متأسفانه، بدبختانه", "adv"),
  W("unimportant", "بی‌اهمیتی، پیش‌پاافتاده", "adj"),
  W("unsafe", "ناامن، خطرناک", "adj"),
  W("upward", "رو به بالا - رو به ترقی", "adv"),
  W("vacuum cleaner", "جارو برقی", "n"),
  W("wake up", "از خواب برخاستن", "phr.v"),
  W("watch out", "مراقب بودن، مواظب بودن", "phr.v"),
  W("weight", "وزن", "n"),
  W("worth", "ارزش، بها، قیمت - قیمت داشتن", "n"),
  W("worthy", "ارزشمند، شایسته، سزاوار", "adj"),
  W("yet", "هنوز - با وجود این", "adv"),
];

const conversation = {
  introEn:
    "Sina and Behzad are old friends. They have not seen each other for about three months. Behzad has called Sina.",
  introFa:
    "سینا و بهزاد دوستان قدیمی هستند. آنها حدود سه ماه است که یکدیگر را ندیده‌اند. بهزاد به سینا زنگ زده است.",
  lines: [
    {
      speaker: "Behzad",
      speakerFa: "بهزاد",
      en: "Hi Sina. How is it going? I haven't seen you since Norooz.",
      fa: "سلام سینا. حالت چطوره؟ من تو را از نوروز ندیده‌ام.",
    },
    {
      speaker: "Sina",
      speakerFa: "سینا",
      en: "Hi Behzad. Thanks for calling. I am home most of the time. I do different things like surfing the net and playing computer games.",
      fa: "سلام بهزاد. از تماست متشکرم. من بیشتر اوقات در خانه هستم. من چیزهای مختلفی انجام می‌دهم مثل گشت‌وگذار در اینترنت و انجام بازی‌های کامپیوتری.",
    },
    {
      speaker: "Behzad",
      speakerFa: "بهزاد",
      en: "How about your free time? Going out, jogging, playing football, ...?",
      fa: "در اوقات فراغتت چطور؟ بیرون روی، دوی آهسته، فوتبال بازی کردن، ...؟",
    },
    {
      speaker: "Sina",
      speakerFa: "سینا",
      en: "Nope. I rarely go out and hang out with my friends.",
      fa: "نه، من به ندرت بیرون می‌روم و با دوستانم وقت می‌گذرانم.",
    },
    {
      speaker: "Behzad",
      speakerFa: "بهزاد",
      en: "I see. Reza and I are going to Darband for climbing and walking this Thursday. We really like to see you. Will you come with us?",
      fa: "متوجه شدم. رضا و من این پنج‌شنبه قصد داریم برای کوه‌نوردی و پیاده‌روی به «دربند» برویم. ما واقعاً دوست داریم تو را ببینیم. آیا با ما خواهی آمد؟",
    },
    {
      speaker: "Sina",
      speakerFa: "سینا",
      en: "What?! Oh, no, I haven't been there for a long time. I prefer to stay home and watch my movies on the weekend. I've bought lots of things to eat, too.",
      fa: "چی؟! اوه، نه، برای مدت طولانی است که آنجا نرفته‌ام. من ترجیح می‌دهم در آخر هفته در خانه بمانم و فیلم‌هایم را تماشا کنم. من همچنین چیزهای زیادی برای خوردن خریده‌ام.",
    },
    {
      speaker: "Behzad",
      speakerFa: "بهزاد",
      en: "Come on! Stop being a couch potato! I guess you haven't exercised for a long time. I think you are a bit fat now.",
      fa: "برو بابا! این‌قدر خورهٔ تلویزیون نباش! من حدس می‌زنم تو برای مدت طولانی ورزش نکرده‌ای. من فکر می‌کنم الان کمی چاق هستی.",
    },
    {
      speaker: "Sina",
      speakerFa: "سینا",
      en: "Actually, you're right. I've gained five kilos in three months. I really do not like to move!",
      fa: "راستش را بخواهی، درست می‌گویی. من در ۳ ماه ۵ کیلو چاق شدم. من واقعاً دوست ندارم تحرک داشته باشم!",
    },
    {
      speaker: "Behzad",
      speakerFa: "بهزاد",
      en: "See? I told you. Working with computers for a long time makes people sick and depressed. I've read about this somewhere.",
      fa: "می‌بینی! من به تو گفته بودم. کار کردن با کامپیوتر برای مدت طولانی افراد را بیمار و افسرده می‌کند. من در این باره در جایی (مطلبی) خوانده‌ام.",
    },
    {
      speaker: "Sina",
      speakerFa: "سینا",
      en: "All right. You won! When and where should we meet?",
      fa: "باشه، تو بردی. کی و کجا باید همدیگر را ببینیم؟",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "Having a Healthier and Longer Life",
    titleFa: "داشتن یک زندگی سالم‌تر و طولانی‌تر",
    source: "Student Book: Pages 58-59",
    paragraphs: [
      {
        en: "Have you ever thought of a healthy lifestyle to live longer? People can do many things to have a healthier life. Most people have a special diet or do lots of exercise; however, without a careful plan they may hurt themselves.",
        fa: "آیا تاکنون به یک سبک زندگی سالم برای طولانی‌تر زندگی کردن فکر کرده‌اید؟ مردم می‌توانند چیزهای زیادی انجام دهند تا بتوانند زندگی سالم‌تری داشته باشند. بیشتر مردم رژیم خاصی دارند یا زیاد ورزش می‌کنند؛ اما بدون یک برنامهٔ دقیق، آنها ممکن است به خودشان صدمه بزنند.",
      },
      {
        en: "To have a healthier lifestyle, people need to do certain things. First, they should check their general health. Measuring blood pressure and heartbeat is the most important thing to do. They also need to check their family health history. In this way, they understand if anyone in the family has had a special illness.",
        fa: "برای داشتن یک سبک زندگی سالم‌تر، مردم عمومی باید کارهای خاصی را انجام دهند. ابتدا، آنها باید سلامت شان را چک کنند. اندازه‌گیری فشار خون و ضربان قلب مهم‌ترین کار (کار) برای انجام دادن است. آن‌ها همچنین باید سابقهٔ سلامتی خانوادهٔ خود را بررسی کنند. به این طریق، آنها می‌فهمند که آیا هیچ‌کس در خانواده بیماری خاصی داشته است (یا نه).",
      },
      {
        en: "Another thing is paying attention to physical health. For example, eating healthy food helps people live longer and prevents diseases. Eating junk food makes people gain weight, and increases the risk of heart attack. Eating balanced servings of bread, vegetables, fruits, protein, and oil is necessary for everyone. Also, daily exercises improve people's health condition.",
        fa: "مطلب دیگر، توجه کردن به سلامت جسمی است. برای مثال، خوردن غذای سالم به مردم کمک می‌کند طولانی‌تر عمر کنند و از بیماری‌ها پیشگیری می‌کند. خوردن غذاهای بی‌ارزش (هله‌هوله) باعث چاق شدن می‌شود و خطر سکتهٔ قلبی را افزایش می‌دهد. خوردن وعده‌های متعادل از نان، سبزی، میوه، پروتئین و روغن برای همه ضروری است. همچنین ورزش روزانه وضعیت سلامت افراد را بهبود می‌بخشد.",
      },
      {
        en: "An effective way to enjoy a better lifestyle is having healthy relationships with others. Recent research has shown that a good social life decreases the risk of death. Sadly, some people do not visit their relatives very often these days. They are really busy with their work and usually use technology to communicate.",
        fa: "یک روش مؤثر برای لذت بردن از سبک زندگی بهتر، داشتن روابط سالم با دیگران است. تحقیق اخیری نشان داده است که زندگی اجتماعی خوب، خطر مرگ را کاهش می‌دهد. متأسفانه این روزها، بعضی از مردم خیلی اوقات بستگان، خویشاوندان شان را ملاقات نمی‌کنند. آنها خیلی مشغول کارشان هستند و معمولاً برای ارتباط برقرار کردن از فناوری استفاده می‌کنند.",
      },
      {
        en: "Bad habits and addiction can be harmful to health. One day of smoking can take around 5 hours away from the smoker's life. Addiction to technology such as using computers for a long time is also dangerous.",
        fa: "عادت‌های بد و اعتیاد می‌تواند برای سلامتی مضر باشد. یک روز سیگارکشیدن می‌تواند ۵ ساعت از عمر فردی که سیگار می‌کشد را بگیرد. اعتیاد به فناوری مانند استفاده از رایانه به مدت طولانی نیز خطرناک است.",
      },
      {
        en: "Above all, the most important thing to enjoy a good life is having emotional health. Praying decreases stress and gives people a calm and balanced life. People with this lifestyle have had a better life.",
        fa: "در رأس همه، مهم‌ترین چیز برای لذت بردن از یک زندگی خوب، داشتن سلامت عاطفی است. نماز خواندن (دعا کردن) اضطراب را کاهش می‌دهد و به افراد یک زندگی آرام و متعادل می‌دهد. افراد با این سبک زندگی بهتر، زندگی بهتری داشته‌اند.",
      },
      {
        en: "There are many other things people can do to live healthier and longer. The key point, however, is having a plan for the way they want to live and take care of their physical and emotional health.",
        fa: "چیزهای (کارهای) دیگری وجود دارند که مردم می‌توانند انجام دهند تا زندگی سالم‌تر و طولانی‌تری داشته باشند. نکتهٔ کلیدی، به هر حال، داشتن یک برنامه برای راهی است که آنها می‌خواهند زندگی کنند و از سلامت جسمی و عاطفی‌شان مراقبت نمایند.",
      },
    ],
  },
  {
    titleEn: "The Positive and Negative Effects of the Modern Lifestyle",
    titleFa: "تأثیرات مثبت و منفی شیوهٔ زندگی امروزی",
    source: "Workbook: Pages 27-28",
    paragraphs: [
      {
        en: "The modern lifestyle has had both positive and negative effects on people's lives. Modern technologies have enabled us to have easy access to information, become more creative, experience fast communication, travel easier, and have a more comfortable life. Have you ever imagined a world without the Internet, tablets, mobile phones, airplanes, and vacuum cleaners? Most people cannot do that, as technology is the miracle of our time.",
        fa: "شیوهٔ زندگی مدرن، هم تأثیرات مثبت و هم تأثیرات منفی بر روی زندگی افراد داشته است. فناوری‌های مدرن ما را قادر ساخته که به راحتی به اطلاعات دسترسی داشته باشیم، خلاق شویم، ارتباطات سریع را تجربه کنیم، راحت‌تر سفر کنیم و زندگی آسانی داشته باشیم. آیا تا به حال دنیا را بدون اینترنت، تبلت‌ها، موبایل‌ها، هواپیماها و جاروبرقی‌ها تصور کرده‌اید؟ اکثر مردم نمی‌توانند این کار را انجام دهند، زیرا فناوری معجزهٔ عصر ما می‌باشد.",
      },
      {
        en: "But using new technologies has changed people's lifestyle in a harmful way in this century as well. Some technologies are dangerous to our health and can harm our body. Using mobile phones or surfing the Internet for long hours can increase people's blood pressure and cause sleep problems. Playing video games for long hours makes people nervous and harm their heart and nervous system. Listening to music by headsets can be harmful to one's hearing and even brain.",
        fa: "اما استفاده از تکنولوژی‌های تازه در این قرن، همچنین شیوهٔ زندگی مردم را به شیوهٔ زیان‌بخشی تغییر داده است. بعضی از فناوری‌ها برای سلامت ما خطرناک هستند و می‌توانند به بدن ما صدمه بزنند. استفاده از موبایل‌ها یا جستجو کردن در اینترنت برای ساعات طولانی می‌تواند فشار خون افراد را بالا برده و سبب مشکلات خواب بشود. انجام بازی‌های ویدیویی برای ساعات طولانی، افراد را عصبی کرده و به قلب و سیستم عصبی آنها آسیب می‌رساند. گوش‌دادن به موسیقی با هدفون‌ها می‌تواند برای شنوایی فرد و حتی مغز مضر باشد.",
      },
      {
        en: "Using technology in a wrong way has created bad habits and new types of addictions. It is not strange now to call someone an Internet or mobile addict. Technology addicts are people with serious problems to control themselves to use various kinds of technology, in particular the Internet, smartphones, tablets and laptops. Technology addicts do not like to socialize with people; instead, they prefer to be alone and spend lots of their time working with their devices. This makes them depressed and impatient.",
        fa: "بهره گرفتن از تکنولوژی به طور غلط، عادات بد و انواع تازه‌ای از اعتیادها را به وجود آورده است. اینکه الان کسی را معتاد به موبایل یا اینترنت بنامیم، عجیب نیست. معتادهای تکنولوژی، افرادی با مشکلات جدی در بازداشتن خودشان برای استفاده از انواع مختلف فناوری، مخصوصاً اینترنت، موبایل‌های هوشمند، تبلت‌ها و لپ‌تاپ‌ها هستند. معتادهای تکنولوژی دوست ندارند با افراد معاشرت داشته باشند. در عوض، آن‌ها ترجیح می‌دهند که تنها باشند و مدت زمان زیادی از وقت‌شان را صرف کار کردن با وسایل‌شان کنند. این کار، آنها را افسرده و بی‌حوصله می‌کند.",
      },
      {
        en: "Specialists have found different ways to cure technology addicts. To avoid this type of addiction, people should spend more time with their friends and family members, do daily exercise, and limit the time of working with technologies. They also need to enjoy nature more and have regular plans to travel.",
        fa: "کارشناسان راه‌های مختلفی برای درمان معتادهای تکنولوژی پیدا کرده‌اند. برای جلوگیری از این نوع اعتیاد، افراد بایستی زمان بیشتری را با دوستان و اعضای خانوادهٔ خود سپری کنند، ورزش روزانه انجام دهند و مدت زمان کار با فناوری‌ها را محدود کنند. همچنین باید از طبیعت بیشتر لذت برده و برنامه‌ریزی‌های منظم برای سفر کردن داشته باشند.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "زمان حال کامل (Present Perfect Tense)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">از این زمان برای اشاره به عملی که در گذشته انجام گرفته و اثر و نتیجهٔ آن تا زمان حال باقی مانده، یا آن عمل تا حال ادامه پیدا کرده است، استفاده می‌کنیم.</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-amber-600 text-white"><th class="px-3 py-2">فاعل</th><th class="px-3 py-2">افعال کمکی have / has</th><th class="px-3 py-2">شکل سوم فعل (p.p.)</th><th class="px-3 py-2">مفعول</th><th class="px-3 py-2">قید</th></tr></thead><tbody><tr class="bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>have</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>lived</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">in Boukan</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">since 1356</td></tr></tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">«ما از سال ۱۳۵۶ در بوکان زندگی کرده‌ایم.» — برای فاعل‌های سوم‌شخص مفرد از ${EN(
        "has"
      )} و برای بقیه از ${EN("have")} استفاده می‌کنیم.</p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mb-3">💡 <b>کاربردهای زمان حال کامل:</b><br>• عملی که از گذشته آغاز شده و ادامه دارد: ${EN(
        "Mr. Karimi <b>has taught</b> English since 1387."
      )}<br>• تجربهٔ زندگی: ${EN("He's <b>traveled</b> to Africa a lot.")} (هرگز قید زمان دقیق گذشته نیاورید!)<br>• عملی که تازه تمام شده: ${EN(
        "His mother <b>has just cooked</b> dinner."
      )}<br>• کاری که بر حال تأثیر دارد: ${EN("My son <b>has lost</b> his keys.")}<br>• کاری که یک یا چند بار تا حال انجام شده: ${EN("My students <b>have read</b> that book <b>twice</b>.")}</div>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-amber-600 text-white"><th class="px-3 py-2">علامت</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">جایگاه</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>${[
        ["since", "از (مبدأ زمان)", "قبل از زمان/جملهٔ گذشته", "I've taught English <b>since</b> 1385."],
        ["for", "به مدت", "قبل از مدت زمان", "Mr. Amini has lived in Spain <b>for</b> 10 years."],
        ["yet", "هنوز", "انتهای منفی و سؤالی", "I haven't traveled <b>yet</b>."],
        ["just", "به تازگی", "قبل از فعل اصلی", "My father <b>has just arrived</b>."],
        ["ever", "تا به حال", "منفی و سؤالی", "<b>Have</b> you <b>ever</b> been in England?"],
        ["already", "هم اکنون", "جملهٔ مثبت", "We have <b>already</b> finished our work."],
        ["so far", "تاکنون", "ابتدا یا انتها", "He's written two letters <b>so far</b>."],
        ["recently", "به تازگی", "ابتدا یا انتها", "Alison has <b>recently</b> found a job."],
      ]
        .map(
          (r) =>
            `<tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>${r[0]}</b></td><td class="px-3 py-2 border-t border-stone-100">${r[1]}</td><td class="px-3 py-2 border-t border-stone-100">${r[2]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr" class="text-xs">${r[3]}</td></tr>`
        )
        .join("")}</tbody></table></div>
      <div class="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm leading-7 text-rose-900">⚠️ <b>توجه‌های خیلی مهم:</b><br>• اگر قید زمان دقیق گذشته ذکر شود، باید از «گذشتهٔ ساده» استفاده کرد: ${EN(
        "They <b>moved</b> into a new apartment <b>last week</b>."
      )}<br>• جملهٔ بعد از ${EN(
        "since"
      )} به زمان «گذشتهٔ ساده» می‌رود: ${EN("She has cleaned the rooms <b>since she got up</b> in the morning.")}<br>• ${EN(
        "It is the best book <b>that I have ever read</b>."
      )} (بعد از صفت عالی + ever)</div>`,
  },
  {
    title: "افعال دوکلمه‌ای جدا نشدنی (با حرف اضافهٔ مخصوص)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">این دسته از صفات و افعال همواره با حرف اضافهٔ مخصوص خود در جمله به‌کار برده می‌شوند و هرگز از آن حرف اضافه جدا نمی‌شوند. مفعول (چه اسم و چه ضمیر) همواره «بعد از حرف اضافه» می‌آید.</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-amber-600 text-white"><th class="px-3 py-2">فعل / صفت</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">فعل / صفت</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>${[
        ["responsible for", "مسئول برای", "different from", "متفاوت از"],
        ["similar to", "مشابه با", "listen to", "گوش دادن به"],
        ["agree with / about", "موافق بودن با/درباره", "good at", "خوب در"],
        ["plan for", "برنامه‌ریزی کردن برای", "think about", "فکر کردن دربارهٔ"],
        ["tired of", "خسته از", "careful about / of", "مراقب... بودن"],
        ["afraid of", "ترسیدن از", "vary in", "فرق داشتن در"],
        ["consist of", "تشکیل شده از", "rely on = depend on", "متکی بودن به"],
        ["satisfied with", "راضی از، خوشنود از", "ashamed of", "شرمنده از"],
        ["worry about", "نگران بودن درباره", "look after", "مراقبت کردن از"],
        ["talk to / about", "حرف زدن با/درباره", "communicate with", "ارتباط برقرار کردن با"],
        ["interested in", "علاقه‌مند به", "ask for", "درخواست کردن برای"],
        ["apply for", "درخواست کردن برای", "behave towards", "رفتار کردن نسبت به"],
        ["thank for", "تشکر کردن برای", "reply to", "جواب دادن به"],
        ["divide into", "تقسیم کردن به", "add to", "اضافه کردن به"],
        ["look up", "نگاه کردن به بالا", "learn about", "مطلع شدن درباره"],
        ["familiar with", "آشنا با", "care for", "مراقبت کردن از"],
      ]
        .map(
          (r) =>
            `<tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[0]}</td><td class="px-3 py-2 border-t border-stone-100">${r[1]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[2]}</td><td class="px-3 py-2 border-t border-stone-100">${r[3]}</td></tr>`
        )
        .join("")}</tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700">${EN(
        "Is the boy <b>afraid of</b> the leopards?"
      )} → ${EN("Yes, he is <b>afraid of</b> them.")} — ${EN(
        "Please <b>listen to</b> the radio."
      )} → ${EN("Ok, I'll <b>listen to</b> it.")}</p>`,
  },
  {
    title: "افعال دوکلمه‌ای جدا شدنی (Phrasal Verbs)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">این افعال از دو قسمت «فعل + جزء قیدی» تشکیل شده‌اند؛ حرف اضافه‌ای که بعد از فعل می‌آید باعث تغییر معنای فعل می‌شود. مفعول اسمی می‌تواند «بین فعل و جزء قیدی» یا بعد از آن بیاید؛ اما <b class="text-rose-600">ضمیر مفعولی فقط «ما بین فعل و جزء قیدی»</b> می‌آید و هرگز بعد از حرف اضافه نمی‌آید: ${EN(
        "Turn <b>it</b> on. (NOT: Turn on it.)"
      )}</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-amber-600 text-white"><th class="px-3 py-2">فعل</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">فعل</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>${[
        ["turn on", "روشن کردن", "call back", "متعاقباً تلفن زدن"],
        ["turn off", "خاموش کردن", "give back", "پس دادن"],
        ["turn up", "صدای چیزی را بالا بردن", "pick up", "برداشتن، بلند کردن"],
        ["turn down", "صدای چیزی را پایین آوردن", "look up", "به دنبال معنی لغت گشتن"],
        ["put on", "پوشیدن", "wake up", "بیدار شدن"],
        ["take off", "کندن، درآوردن", "take apart", "از هم جدا کردن"],
        ["throw away", "دور انداختن", "put out", "خاموش کردن"],
        ["add up", "اضافه کردن", "find out", "فهمیدن، پی بردن"],
        ["bring up", "پرورش دادن، بزرگ کردن", "keep on", "ادامه دادن"],
        ["figure out", "فهمیدن، پی بردن", "use up", "تا آخر استفاده کردن، تمام کردن"],
      ]
        .map(
          (r) =>
            `<tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[0]}</td><td class="px-3 py-2 border-t border-stone-100">${r[1]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[2]}</td><td class="px-3 py-2 border-t border-stone-100">${r[3]}</td></tr>`
        )
        .join("")}</tbody></table></div>`,
  },
  {
    title: "اسم مصدر (Gerund)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">اسم مصدر یا «جرند» فعلی است که ing گرفته و در نقش «اسم» به‌کار رفته باشد. پس اسم مصدر دیگر فعل محسوب نمی‌شود و همچون اسم می‌تواند «فاعل» یا «مفعول» جمله باشد.</p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900 mb-3">💡 <b>کاربردها:</b><br>• <b>۱. در نقش فاعل:</b> ${EN(
        "<b>Swimming</b> in this part of the river <b>is</b> very dangerous."
      )} (اسم مصدر مثل اسم «مفرد» است و فعل مفرد می‌گیرد؛ اما دو اسم مصدر، فعل جمع می‌گیرند: ${EN(
        "<b>Fishing</b> and <b>swimming</b> <b>are</b> my favorite hobbies."
      )})<br>• <b>۲. بعد از go</b> برای تفریحات: ${EN("go shopping, goes hunting, gone swimming, going jogging")}<br>• <b>۳. بعد از NO</b> در تابلوها: ${EN(
        "No <b>smoking</b>! / No <b>parking</b>!"
      )}<br>• <b>۴. بعد از حروف اضافه:</b> ${EN(
        "She is interested <b>in</b> <b>reading</b> history books. — Thanks a lot <b>for</b> <b>inviting</b> me."
      )}<br>• <b>۵. بعد از افعال زیر (در نقش مفعول):</b> ${EN(
        "enjoy, finish, stop, practice, discuss, imagine, miss, mind, deny, consider, suggest, avoid, risk, keep, keep on, go on, give up, forbid, prevent, quit, love, like, dislike, hate, notice, appreciate"
      )} — ${EN("He <b>enjoys walking</b> at the park.")}<br>• <b>۶. به‌عنوان متمم فاعل:</b> ${EN(
        "My favorite hobby <b>is hiking</b>."
      )}</div>`,
  },
  {
    title: "واژه‌سازی: پیشوندها (Prefixes)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">پیشوند به یک حرف یا گروهی از حروف گفته می‌شود که به «ابتدای کلمه» می‌چسبد و «معنی کلمه را تغییر داده» و از آن کلمهٔ جدیدی می‌سازد.</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-amber-600 text-white"><th class="px-3 py-2">پیشوند</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>${[
        ["anti-", "مخالف، ضد", "antibody / anti-cancer / antibiotic"],
        ["co-", "با، هم‌", "co-worker / co-pilot / co-operation"],
        ["dis-", "مخالفت، نفی کردن", "disagree / disappear / dislike"],
        ["ex-", "قبلی، قدیمی", "ex-president / ex-wife"],
        ["fore-", "قبل، پیش", "forecast / foresee"],
        ["im-, in-", "نفی کردن", "impossible / incorrect / impolite"],
        ["il-, ir-", "نفی کردن", "illegal / irresponsible"],
        ["inter-, intra-", "بین، میان", "interact / internet / intranet"],
        ["macro-", "بزرگ", "macroeconomics"],
        ["micro-", "کوچک", "microscope / microfilm"],
        ["mid-", "وسط، میان", "midsummer / midway / midday"],
        ["mis-", "اشتباه، نقص", "misinterpret / mistake / mislead"],
        ["non-", "بدون، غیر", "nonsense / noncount"],
        ["post-", "بعد از", "postpone / post-flight"],
        ["pre-", "از قبل، از پیش", "pre-school / prefix"],
        ["re-", "دوباره، مجدداً", "redo / rediscover / return"],
        ["sub-", "زیر، پایین", "submarine / subtitle"],
        ["super-", "روی، فوق", "superfood / superstar"],
        ["tri-", "سه (معرف عدد ۳)", "triangle / tripod / tricycle"],
        ["un-", "نفی کردن", "unhappy / unimportant / unknown"],
        ["uni-", "تک، واحد", "unicycle / universal / uniform"],
      ]
        .map(
          (r) =>
            `<tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>${r[0]}</b></td><td class="px-3 py-2 border-t border-stone-100">${r[1]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[2]}</td></tr>`
        )
        .join("")}</tbody></table></div>`,
  },
  {
    title: "واژه‌سازی: پسوندها (Suffixes)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">پسوند به «انتهای کلمه» می‌چسبد تا کلمهٔ جدیدی ایجاد شود و «عملکرد و نقش کلمه را از نظر گرامری تغییر می‌دهد».</p>
      <div class="grid sm:grid-cols-2 gap-3 text-sm leading-7 mb-3">
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-amber-700">فعل‌ساز:</b><br><span dir="ltr" class="text-slate-600">-ate (communicate, educate) — -en (sharpen, shorten) — -ify/-fy (simplify, satisfy) — -ize/-ise (socialize)</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-amber-700">قیدساز:</b><br><span dir="ltr" class="text-slate-600">-ly (slowly, rudely, politely)</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-amber-700">اسم‌ساز:</b><br><span dir="ltr" class="text-slate-600">-acy (accuracy) — -ance/-ence (existence) — -dom (freedom) — -er/-or (reader) — -ism (humanism) — -ist (scientist) — -ity (university) — -ment (argument) — -ness (sickness) — -ship (friendship) — -tion (information)</span></div>
        <div class="bg-stone-50 border border-stone-200 rounded-lg p-3"><b class="text-amber-700">صفت‌ساز:</b><br><span dir="ltr" class="text-slate-600">-able/-ible (comfortable) — -al (cultural) — -ful (useful) — -less (useless) — -ic/-ical (musical) — -ous (famous, nervous) — -ish (childish) — -ive (informative) — -y (rainy) — -ing (amusing) — -ed (tired) — -ant (important)</span></div>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>تست:</b> correct → <span dir="ltr"><b>in</b>correct</span> (نفی)، nature → <span dir="ltr">natural</span>، translate → <span dir="ltr">translat<b>or</b></span>، danger → <span dir="ltr">danger<b>ous</b></span>، possible → <span dir="ltr"><b>im</b>possible</span></div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l2-w1", fa: "من از سال ۱۳۸۵ در بوکان زندگی کرده‌ام.", answer: ["I", "have", "lived", "in", "Boukan", "since", "1385"], hint: "حال کامل: have/has + p.p. — بعد از since جملهٔ گذشتهٔ ساده" },
  { id: "l2-w2", fa: "مادرش تازه شام را پخته است.", answer: ["His", "mother", "has", "just", "cooked", "dinner"], hint: "just بین فعل کمکی و فعل اصلی" },
  { id: "l2-w3", fa: "آیا تو تا به حال به انگلستان سفر کرده‌ای؟", answer: ["Have", "you", "ever", "traveled", "to", "England", "?"], hint: "سؤالی: فعل کمکی اول + ever" },
  { id: "l2-w4", fa: "مادرم تا کنون دو نامه نوشته است.", answer: ["My", "mother", "has", "written", "two", "letters", "so", "far"] },
  { id: "l2-w5", fa: "آنها هفتهٔ گذشته به یک آپارتمان جدید نقل مکان کردند.", answer: ["They", "moved", "to", "a", "new", "apartment", "last", "week"], hint: "قید زمان دقیق گذشته → گذشتهٔ ساده (نه حال کامل!)" },
  { id: "l2-w6", fa: "او از خواندن کتاب‌های تاریخی لذت می‌برد.", answer: ["He", "enjoys", "reading", "history", "books"], hint: "بعد از enjoy فعل دوم اسم مصدر (ing) می‌گیرد" },
  { id: "l2-w7", fa: "شنا کردن در این قسمت از رودخانه خیلی خطرناک است.", answer: ["Swimming", "in", "this", "part", "of", "the", "river", "is", "very", "dangerous"], hint: "اسم مصدر در نقش فاعل، فعل مفرد می‌گیرد" },
  { id: "l2-w8", fa: "من اغلب از خرید کردن در آخرهفته‌ها خودداری می‌کنم.", answer: ["I", "often", "avoid", "going", "shopping", "on", "weekends"] },
];

const synonyms = [
  SYN("a bit", "a little", "یه‌خورده"),
  SYN("asleep", "sleeping", "خوابیده"),
  SYN("attend", "take part in", "شرکت کردن"),
  SYN("avoid", "forbid", "جلوگیری کردن"),
  SYN("calm", "quiet", "آرام، ساکت"),
  SYN("candy", "sweet", "آب‌نبات"),
  SYN("certain", "sure", "مطمئن"),
  SYN("common", "ordinary", "عادی، رایج"),
  SYN("cure", "remedy", "درمان کردن"),
  SYN("cycling", "bicycling", "دوچرخه‌سواری"),
  SYN("depressed", "sad", "افسرده، ناراحت"),
  SYN("describe", "explain", "توصیف کردن"),
  SYN("diet", "nutrition plan", "رژیم غذایی"),
  SYN("dislike", "hate", "دوست نداشتن"),
  SYN("drug", "medicine", "دارو"),
  SYN("effect", "influence", "تأثیر"),
  SYN("emergency", "crisis", "اورژانس، حالت اضطراری"),
  SYN("even", "still", "حتی"),
  SYN("exciting", "thrilling", "هیجان‌انگیز"),
  SYN("fight", "argue", "دعوا، جنگ"),
  SYN("fully", "completely", "کاملاً"),
  SYN("gain", "get", "به دست آوردن"),
  SYN("general", "normal", "معمول، عادی"),
  SYN("goal", "aim", "هدف"),
  SYN("grow up", "get older", "رشد کردن"),
  SYN("habit", "custom", "عادت، رسم"),
  SYN("harm", "damage", "ضرر"),
  SYN("harmful", "destructive", "مضر"),
  SYN("healthy", "fit", "سالم"),
  SYN("illness", "sickness", "بیماری"),
  SYN("increase", "enhance", "افزایش دادن"),
  SYN("invite", "ask over", "دعوت کردن"),
  SYN("join", "connect", "پیوستن، وصل کردن"),
  SYN("keep on", "continue", "ادامه دادن"),
  SYN("lazy", "idle", "تنبل"),
  SYN("leave", "quit", "ترک کردن"),
  SYN("limit", "restrict", "محدود کردن"),
  SYN("mainly", "mostly", "عمده‌تأً"),
  SYN("medicine", "drug", "دارو"),
  SYN("middle", "center", "وسط، میانه"),
  SYN("miracle", "wonder", "معجزه"),
  SYN("noise", "sound", "صدا، شلوغی"),
  SYN("part", "portion", "قسمت، بخش"),
  SYN("perfect", "complete", "عالی، کامل"),
  SYN("plan", "program", "برنامه، طرح"),
  SYN("positive", "constructive", "مثبت"),
  SYN("prepare", "arrange", "مهیا کردن"),
  SYN("pressure", "stress", "فشار"),
  SYN("prevent", "stop", "جلوگیری کردن"),
  SYN("produce", "make", "تولید کردن"),
  SYN("quickly", "fast", "به سرعت"),
  SYN("rarely", "seldom", "به ندرت"),
  SYN("reason", "cause", "دلیل، علت"),
  SYN("recent", "new", "اخیری، تازه"),
  SYN("rethink", "reconsider", "تجدیدنظر کردن"),
  SYN("risk", "danger", "خطر"),
  SYN("secret", "mystery", "راز، رمز"),
  SYN("serious", "severe", "جدی، سنگین"),
  SYN("situation", "condition", "موقعیت، وضعیت"),
  SYN("special", "particular", "ویژه، خاص"),
  SYN("stage", "step", "مرحله"),
  SYN("stress", "tension", "استرس"),
  SYN("taste", "flavor", "سلیقه، مزه"),
  SYN("topic", "title", "موضوع، عنوان"),
  SYN("worth", "value", "ارزش، بها"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۱۵ تست) ----------------
  Q("l2-v1", "vocab", "She provided ---------------- support at a very distressing time for me.", ["emotional", "cultural", "balanced", "depressed"], 0, "او در یک زمان پریشان‌آور از من حمایت عاطفی کرد."),
  Q("l2-v2", "vocab", "I was ---------------- at the thought of all the hard work ahead of me in that hard time.", ["confused", "depressed", "influenced", "balanced"], 1, "من در فکر همهٔ کارهای سختی که جلوی من در آن زمان سخت بود، افسرده بودم."),
  Q("l2-v3", "vocab", "Some studies have shown the benefits of a vegetarian ---------------- on people's health and longer life.", ["habit", "limit", "diet", "serving"], 2, "بعضی مطالعات فواید رژیم سبزیجات را روی سلامتی و عمر طولانی‌تر افراد نشان داده است."),
  Q("l2-v4", "vocab", "She knew it probably wasn't necessary anymore, but old ---------------- die hard.", ["limits", "missions", "miracles", "habits"], 3, "او متوجه شد که احتمالاً دیگر ضروری نیست، اما عادت‌های قدیمی به سختی از بین می‌روند."),
  Q("l2-v5", "vocab", "A sudden serious medical condition in which someone's heart stops working normally, causing them great pain. It is ----------------.", ["heart attack", "blood pressure", "heart beat", "addict to drug"], 0, "شرایط پزشکی جدی ناگهانی که در آن قلب کسی از کارکردن نرمال می‌ایستد، سکتهٔ قلبی است."),
  Q("l2-v6", "vocab", "He's studying politics and its ---------------- to the media in that famous university.", ["mission", "relationship", "influence", "limit"], 1, "او سیاست و رابطهٔ اش با رسانه‌ها را در آن دانشگاه مشهور می‌خواند."),
  Q("l2-v7", "vocab", "In mental illnesses, there is a complex relationship between cause and ----------------.", ["effect", "habit", "limit", "miracle"], 0, "در بیماری‌های روانی، یک رابطهٔ پیچیده بین علت و معلول وجود دارد."),
  Q("l2-v8", "vocab", "The North's share of the world's energy consumption is expected to ---------------- from 70% to 60%.", ["produce", "decrease", "increase", "measure"], 1, "سهم شمال از مصرف انرژی جهان انتظار می‌رود از ۷۰ درصد به ۶۰ درصد کاهش یابد."),
  Q("l2-v9", "vocab", "Testing yourself with information on cards is a useful ---------------- for studying.", ["habit", "serving", "device", "cause"], 2, "آزمایش کردن خودت با اطلاعات روی کارت‌ها وسیلهٔ مفیدی برای مطالعه است."),
  Q("l2-v10", "vocab", "Your accountant will ---------------- with you how to complete these forms in your office.", ["measure", "prevent", "discuss", "take part"], 2, "حسابدار‌تان با شما بحث خواهد کرد که چطور این فرم‌ها را کامل کنید."),
  Q("l2-v11", "vocab", "My wife and I set a ---------------- on how much we spend on clothes each month.", ["limit", "habit", "device", "diet"], 0, "من و همسرم برای اینکه چقدر هر ماه برای لباس‌ها هزینه کنیم، محدودیت گذاشتیم."),
  Q("l2-v12", "vocab", "He has started smoking recently and was already developing an ---------------- to nicotine.", ["emotion", "relation", "depression", "addiction"], 3, "او اخیراً سیگار را شروع کرده بود و در حال حاضر دارد به نیکوتین اعتیاد پیدا می‌کند."),
  Q("l2-v13", "vocab", "Exercise will not only lower ---------------- but possibly protect against heart attack.", ["heartbeat", "diet", "blood pressure", "addiction"], 2, "ورزش نه‌تنها فشار خون را پایین می‌آورد بلکه احتمالاً شما را در مقابل حملهٔ قلبی محافظت می‌کند."),
  Q("l2-v14", "vocab", "He's turned into a real ---------------- since he subscribed to the sports channel.", ["relationship", "couch potato", "specialist", "mission"], 1, "او از وقتی که اشتراک کانال ورزش را گرفته، معتاد تلویزیون شده است."),
  Q("l2-v15", "vocab", "The drug was taken off the market because of its very ---------------- side effects.", ["harmful", "harmless", "useful", "calm"], 0, "دارو به دلیل اثرات جانبی بسیار مضرش از بازار خارج شد."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l2-k1", "vocab-konkuri", "Bahram is not a child anymore; it is time he ---------------- life more seriously.", ["makes", "takes", "puts", "does"], 1, "بهزاد دیگر بچه نیست؛ وقتش رسیده که زندگی را جدی‌تر بگیرد."),
  Q("l2-k2", "vocab-konkuri", "She suffered from an ---------------- problem after her husband's death, and unfortunately none of her friends were ready to help her.", ["emotional", "effective", "excited", "addictive"], 0, "او بعد از مرگ همسرش از مشکل عاطفی رنج می‌برد و متأسفانه هیچ‌کدام از دوستانش آمادهٔ کمک نبودند."),
  Q("l2-k3", "vocab-konkuri", "I want to go back to work if I can find somebody to ---------------- the children.", ["call up", "call out", "look for", "look after"], 3, "می‌خواهم به سرکار برگردم اگر بتوانم کسی را پیدا کنم که از بچه‌ها مراقبت کند."),
  Q("l2-k4", "vocab-konkuri", "The farmer knows that some insects bring ----------------, and some others eat the food that he grows.", ["health", "disease", "value", "control"], 1, "کشاورز می‌داند که بعضی حشرات بیماری می‌آورند و بعضی دیگر غذایی که می‌رویاند را می‌خورند."),
  Q("l2-k5", "vocab-konkuri", "The pilot of the airplane had to make a/an ---------------- landing because of the very bad weather.", ["experiment", "emergency", "strategy", "connection"], 1, "خلبان هواپیما به دلیل هوای خیلی بد مجبور شد فرود اضطراری انجام دهد."),
  Q("l2-k6", "vocab-konkuri", "Now that the term is over, all of the students are widely ---------------- about the holiday.", ["excited", "bright", "emotional", "available"], 0, "حالا که ترم تمام شده، همهٔ دانش‌آموزان به‌شدت هیجان‌زده از تعطیلات هستند."),
  Q("l2-k7", "vocab-konkuri", "Without going into ----------------, I can tell you that we have had a very successful year.", ["details", "events", "terms", "effects"], 0, "بدون وارد شدن به جزئیات، می‌توانم به شما بگویم که سال بسیار موفقی داشته‌ایم."),
  Q("l2-k8", "vocab-konkuri", "Now, it is hard to ---------------- what things would be like today without computers.", ["disagree", "contrast", "define", "imagine"], 3, "امروز تصور کردن اینکه امروزه چیزها بدون کامپیوتر چه شکلی بودند، سخت است."),
  Q("l2-k9", "vocab-konkuri", "Scientists believe that ---------------- activities, particularly mountain climbing, cause good health.", ["formal", "actual", "physical", "rural"], 2, "دانشمندان باور دارند فعالیت‌های بدنی، مخصوصاً کوه‌نوردی، سبب سلامتی می‌شود."),
  Q("l2-k10", "vocab-konkuri", "He is a great football player but his knee injury ---------------- him from playing.", ["prevents", "rewrites", "discusses", "predicts"], 0, "او فوتبالیست بزرگی است اما آسیب‌دیدگی زانویش مانع او از بازی کردن می‌شود."),
  Q("l2-k11", "vocab-konkuri", "She provided ---------------- support at a very distressing time for me.", ["emotional", "cultural", "balanced", "depressed"], 0, "او در زمانِ بسیار ناراحت‌کننده‌ای برای من حمایتِ عاطفی ارائه داد."),
  Q("l2-k12", "vocab-konkuri", "I was ---------------- at the thought of all the hard work ahead of me in that hard time.", ["confused", "depressed", "influenced", "balanced"], 1, "با فکرِ همهٔ کارِ سختِ پیشِ رو در آن دورانِ سخت، افسرده بودم."),
  Q("l2-k13", "vocab-konkuri", "Some studies have shown the benefits of a vegetarian ---------------- on people's health and longer life.", ["habit", "limit", "diet", "serving"], 2, "برخی پژوهش‌ها فوایدِ رژیمِ گیاهی را بر سلامتی و عمرِ طولانی‌تر نشان داده‌اند."),
  Q("l2-k14", "vocab-konkuri", "She knew it probably wasn't necessary anymore, but old ---------------- die hard.", ["limits", "missions", "miracles", "habits"], 3, "می‌دانست دیگر لازم نیست، اما عادت‌های قدیمی به‌سختی از بین می‌روند."),
  Q("l2-k15", "vocab-konkuri", "In mental illnesses, there is a complex relationship between cause and ----------------.", ["effect", "habit", "limit", "miracle"], 0, "در بیماری‌های روانی، رابطهٔ پیچیده‌ای بین علت و اثر وجود دارد."),
  // ---------------- گرامر و نگارش (۱۵ تست) ----------------
  Q("l2-g1", "grammar", "They have won all the other games easily since they ---------------- the football game to Germany.", ["lose", "were losing", "lost", "had lost"], 2, "آنها همهٔ بازی‌های دیگر را به آسانی برده‌اند از زمانیکه بازی فوتبال را به آلمان باختند. (زمان گذشتهٔ ساده بعد از since)"),
  Q("l2-g2", "grammar", "Last week he received an offer for a job in London, but he ---------------- what to do about it yet.", ["won't decide", "wasn't deciding", "didn't decide", "hasn't decided"], 3, "هفتهٔ گذشته پیشنهاد شغلی را در لندن دریافت کرد اما هنوز دربارهٔ اینکه چه چیزی در موردش انجام دهد، تصمیم نگرفته است. (yet → حال کامل)"),
  Q("l2-g3", "grammar", "We think that Raman has the most expensive sport car that we ---------------- in the town.", ["have ever seen", "ever saw", "was ever going to see", "will ever see"], 0, "ما فکر می‌کنیم که «رامان» گران‌قیمت‌ترین ماشین اسپرتی را دارد که ما تا به حال در این شهر دیده‌ایم. (صفت عالی + ever → حال کامل)"),
  Q("l2-g4", "grammar", "I ---------------- this exam twice up to now. I am hopeful I will pass it.", ["had taken", "took", "will be taking", "have taken"], 3, "من تا به حال دو بار این امتحان را داده‌ام. امیدوارم که در آن قبول بشوم. (twice, up to now → حال کامل)"),
  Q("l2-g5", "grammar", 'A: "Would you like something to have?" B: "No, thanks. I ---------------- a sandwich."', ["have just eaten", "just ate", "will just eat", "had just eaten"], 0, "ـ مایلید چیزی برای خوردن بخورید؟ ـ نه متشکرم. من تازه یک ساندویچ خورده‌ام. (just → حال کامل)"),
  Q("l2-g6", "grammar", "I ---------------- two poem books since I ---------------- to this city.", ["wrote / moved", "have written / have moved", "have written / moved", "wrote / have moved"], 2, "من از وقتی‌که به این شهر نقل مکان کرده‌ام، دو کتاب شعر را نوشته‌ام. (since + گذشتهٔ ساده)"),
  Q("l2-g7", "grammar", "I ---------------- to see him three days ago. I ---------------- him twice since that day.", ["want / have called", "wanted / called", "wanted / have called", "have wanted / called"], 2, "من ۳ روز قبل خواستم او را ببینم. از آن روز، دو بار به او زنگ زده‌ام."),
  Q("l2-g8", "grammar", "I often avoid ---------------- shopping on weekends because the stores are so crowded.", ["go", "to go", "going", "from going"], 2, "من اغلب از خرید کردن در آخرهفته‌ها خودداری می‌کنم چون مغازه‌ها بیش از حد شلوغ هستند. (avoid + اسم مصدر)"),
  Q("l2-g9", "grammar", "Ali left his job because he was so tired of ---------------- the same job, day after day.", ["do", "doing of", "to do", "doing"], 3, "علی شغلش را رها کرد چون از انجام یک کار، روز به روز، خسته شده بود. (بعد از حرف اضافهٔ of → اسم مصدر)"),
  Q("l2-g10", "grammar", "Just imagine -------------------- in a country where it is always warm and sunny. What will you do?", ["lived", "living", "to live", "be living"], 1, "فقط زندگی‌کردن در یک کشوری که همیشه گرم و آفتابی است را تصور کن. چه کاری انجام خواهی داد؟ (imagine + اسم مصدر)"),
  Q("l2-g11", "grammar", "---------------- fast food -------------------- not good for your health especially if you eat too much.", ["Eating / are", "Ate / is", "Eating / is", "Ate / are"], 2, "خوردن غذای آماده (فست‌فود) برای سلامتی خوب نیست مخصوصاً اگه تو خیلی بخوری. (اسم مصدر = اسم مفرد)"),
  Q("l2-g12", "grammar", 'A: "Have you finished ---------------- that book?" B: "No, I haven\'t -------------------- it yet."', ["read / finished", "reading / finished", "to read / finishing", "reading / finishing"], 1, "ـ آیا خواندن آن کتاب را تمام کرده‌ای؟ ـ نه، من هنوز آن را تمام نکرده‌ام. (finish + gerund، haven't + p.p.)"),
  Q("l2-g13", "grammar", "---------------- and finding job -------------------- not easy in a foreign country.", ["Living / is", "Lived / are", "Living / are", "Lives / is"], 0, "زندگی‌کردن و پیدا کردن شغل در یک کشور خارجی آسان نیست. (اسم مصدر مفرد)"),
  Q("l2-g14", "grammar", "-------------------- helps your body be healthy and prevents it from --------------------- sick.", ["Exercise / being", "Exercising / be", "Exercise / be", "Exercising / being"], 3, "ورزش‌کردن به بدن‌تان کمک می‌کند سالم باشد و از بیمار شدن آن جلوگیری می‌کند."),
  Q("l2-g15", "grammar", "My grandfather loves ---------------------- a long walk. He often goes ---------------------- on Sundays.", ["taking / hike", "take / hike", "taking / hiking", "took / hiking"], 2, "پدربزرگم عاشق پیاده‌روی طولانی‌مدت است. او اغلب در یک‌شنبه‌ها به کوه‌نوردی می‌رود. (love + gerund / go + gerund)"),
];

export const lesson2: LessonData = {
  id: 2,
  titleEn: "A Healthy Lifestyle",
  titleFa: "یک شیوهٔ زندگی سالم",
  tagline: "سلامتی، تکنولوژی و زمان حال کامل",
  color: "amber",
  grade: "یازدهم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  writing,
  quizzes,
};

export default lesson2;
