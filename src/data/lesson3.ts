import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Three: "Art and Culture"  |  هنر و فرهنگ
// =====================================================================

const vocabulary = [
  W("accept", "قبول کردن، پذیرفتن", "v"),
  W("according to", "بر طبق، بر اساس", "phr"),
  W("achieve", "به دست آوردن", "v"),
  W("actually", "واقعاً", "adv"),
  W("advice", "نصیحت، پند", "n"),
  W("agree", "موافقت کردن - هم‌رأی بودن", "v"),
  W("amazed", "حیران، متعجب", "adj"),
  W("amused", "سرگرم", "adj"),
  W("antonym", "متضاد", "n"),
  W("appreciate", "ارج نهادن، قدر... دانستن", "v"),
  W("arrow", "فلش، تیر، پیکان", "n"),
  W("art", "هنر - فن - صنعت", "n"),
  W("artifact", "(شیء) دست‌ساز، محصول مصنوعی", "n"),
  W("artistic", "هنرمندانه، هنری", "adj"),
  W("artwork", "کار هنری", "n"),
  W("ashamed", "شرمنده، خجالت‌زده", "adj"),
  W("attempt", "تلاش، سعی، کوشش - تلاش کردن", "n"),
  W("attitude", "نگرش، گرایش - طرز برخورد", "n"),
  W("beauty", "زیبایی", "n"),
  W("be able to", "قادر بودن، توانستن", "phr"),
  W("bite", "گازگرفتن، گاز زدن", "v"),
  W("bleed", "خون‌ریزی کردن، خون آمدن از", "v"),
  W("blow", "وزیدن - دمیدن - ضرب", "v"),
  W("booklet", "دفترچه، کتابچه", "n"),
  W("bored (with)", "خسته، کسل (با)", "adj"),
  W("bow", "تعظیم کردن", "v"),
  W("brain", "مغز، مخ - هوش، ذکاوت", "n"),
  W("calligraphy", "خوش‌نویسی", "n"),
  W("carpet", "فرش", "n"),
  W("catch", "گرفتن (تاکسی، قطار و...)، به‌چنگ آوردن", "v"),
  W("charity", "خیریه، نیکوکاری، صدقه، خیرات", "n"),
  W("cheap", "ارزان", "adj"),
  W("cheerful", "مشروح، خوش‌حال", "adj"),
  W("choice", "انتخاب", "n"),
  W("clothing", "پوشاک", "n"),
  W("collection", "مجموعه، کلکسیون", "n"),
  W("combination", "ترکیب", "n"),
  W("combine", "ترکیب کردن", "v"),
  W("conditional", "شرطی", "adj"),
  W("confuse", "گیج کردن", "v"),
  W("confused", "گیج", "adj"),
  W("confusing", "گیج‌کننده", "adj"),
  W("craft", "مهارت، فن - صنعت", "n"),
  W("craftsman", "صنعتگر (مرد)، هنرمند", "n"),
  W("craftswomen", "صنعتگر (زن)، هنرمند", "n"),
  W("create", "خلق کردن، به وجود آوردن", "v"),
  W("creative", "ابتکاری، خلاقانه", "adj"),
  W("creator", "خالق، آفریننده", "n"),
  W("customer", "مشتری، خریدار", "n"),
  W("custom", "رسم، آیین", "n"),
  W("decide", "تصمیم گرفتن", "v"),
  W("decorative", "تزئینی، دکوری", "adj"),
  W("decrease", "کاهش یافتن، کاهش دادن", "v"),
  W("depend (on)", "بستگی داشتن (به)، وابسته بودن به", "v"),
  W("depressed", "افسرده، غمگین", "adj"),
  W("discount", "تخفیف", "n"),
  W("diversity", "تنوع، گوناگونی", "n"),
  W("draw", "نقاشی کشیدن، طراحی کردن", "v"),
  W("earn", "به دست آوردن، کسب کردن", "v"),
  W("economy", "اقتصاد", "n"),
  W("especially", "به ویژه، مخصوصاً", "adv"),
  W("essay", "مقاله، انشا - تحقیق", "n"),
  W("excited", "هیجان‌زده", "adj"),
  W("expect", "انتظار داشتن، توقع داشتن", "v"),
  W("face", "مواجه شدن، روبرو شدن - صورت، چهره", "v"),
  W("fall", "پایین - افتادن، سقوط کردن", "v"),
  W("farming", "کشاورزی", "n"),
  W("fingerprint", "اثر انگشت", "n"),
  W("finish", "پایان یافتن، پایان دادن", "v"),
  W("forget", "فراموش کردن", "v"),
  W("forgive", "بخشیدن، عفو کردن", "v"),
  W("former", "قبلی، پیشین، سابق", "adj"),
  W("fortunate", "خوش‌شانس، خوشبخت", "adj"),
  W("frighten", "ترساندن، به وحشت انداختن", "v"),
  W("frightened", "ترسیده", "adj"),
  W("frightening", "ترسناک", "adj"),
  W("gallery", "گالری، نمایشگاه هنری، سالن", "n"),
  W("get along (with)", "تفاهم داشتن، سازش کردن", "phr.v"),
  W("get back", "برگشتن", "phr.v"),
  W("glad", "خوشحال، شاد", "adj"),
  W("golden", "طلایی", "adj"),
  W("go well", "خوب پیش رفتن", "phr"),
  W("greeting", "سلام و احوالپرسی", "n"),
  W("handicrafts", "صنایع دستی", "n"),
  W("hand-made", "دستی، دست‌ساز", "adj"),
  W("handshake", "دست‌دادن", "n"),
  W("hang", "آویزان کردن - دار زدن، به‌دار آویختن", "v"),
  W("helpful", "مفید، یاری‌رسان", "adj"),
  W("hide", "پنهان کردن، مخفی کردن", "v"),
  W("history", "تاریخ، تاریخچه - سابقه، پیشینه", "n"),
  W("homeland", "وطن، سرزمین", "n"),
  W("hopeful", "امیدوار", "adj"),
  W("How touching!", "چقدر تأثیرگذار است!", "phr"),
  W("hug", "در آغوش گرفتن", "v"),
  W("humankind", "بشریت، انسان", "n"),
  W("identity", "هویت - شناسایی", "n"),
  W("imagination", "تصور، خیال", "n"),
  W("include", "شامل شدن، در بر داشتن", "v"),
  W("including", "از جمله، شامل", "prep"),
  W("infinitive", "مصدر با to", "n"),
  W("income", "درآمد", "n"),
  W("instead (of)", "به جای، در عوض", "adv"),
  W("interested in", "علاقه‌مند به", "adj"),
  W("introduce", "معرفی کردن - آشنا کردن - نشان دادن", "v"),
  W("item", "شیء، جزء، فقره", "n"),
  W("learn", "یاد گرفتن - مطلع شدن", "v"),
  W("lend", "قرض دادن", "v"),
  W("Look out!", "مراقب باش!، مواظب باش!", "phr"),
  W("lovely", "دوست‌داشتنی، صمیمی", "adj"),
  W("lucky", "خوش‌شانس، خوشبخت، خوش‌قدم", "adj"),
  W("machine", "دستگاه - ماشین", "n"),
  W("market", "بازار، محل داد و ستد، مرکز تجارت", "n"),
  W("material", "ماده، جنس، جسم", "n"),
  W("meaning", "معنا، معنی", "n"),
  W("metal", "فلز، فلزی", "n"),
  W("metalwork", "فلزکاری", "n"),
  W("miss", "دلتنگ شدن، از دست دادن", "v"),
  W("mistake", "اشتباه، خطا، غلط", "n"),
  W("moral", "اخلاقی، معنوی - معنی، مفهوم", "adj"),
  W("nearby", "حوالی، نزدیک", "adj"),
  W("object", "چیز - مفعول", "n"),
  W("opposite", "مخالف، ضد", "adj"),
  W("opposition", "تناقض، مخالفت، تقابل", "n"),
  W("painting", "نقاشی", "n"),
  W("palm", "کف دست - درخت خرما", "n"),
  W("pass", "قبول شدن - عبور کردن - جواز، گذرنامه", "v"),
  W("pleasure", "مسرت، خوشی، خوشحالی", "n"),
  W("poem", "شعر", "n"),
  W("poet", "شاعر", "n"),
  W("poetry", "شعر و شاعری", "n"),
  W("pool", "استخر، آبگیر", "n"),
  W("pottery", "سفالگری، کوزه‌گری، ظروف سفال", "n"),
  W("power", "قدرت، توان", "n"),
  W("price", "قیمت، بها، نرخ", "n"),
  W("prize", "جایزه", "n"),
  W("produce", "تولید کردن", "v"),
  W("product", "محصول", "n"),
  W("promise", "قول دادن", "v"),
  W("proud", "سربلند - مغرور - مفتخر", "adj"),
  W("public", "عمومی، همگانی", "adj"),
  W("quickly", "به سرعت", "adv"),
  W("quiet", "ساکت، آرام", "adj"),
  W("quilt", "ملافه، روتختی - لحاف", "n"),
  W("quit", "ترک کردن، رها کردن", "v"),
  W("quite", "نسبتاً، کاملاً", "adv"),
  W("range", "طیف، محدوده، حوزه، ناحیه، گستره", "n"),
  W("recognize", "شناختن، تشخیص دادن، آگاه بودن", "v"),
  W("refer", "رجوع کردن به، اشاره کردن", "v"),
  W("reference", "مرجع، مأخذ، منبع، مراجعه", "n"),
  W("reference word", "کلمهٔ مرجع", "n"),
  W("reflect", "منعکس کردن - نشان دادن", "v"),
  W("remember", "به یاد آوردن", "v"),
  W("respectful", "مؤدب، با شخصیت", "adj"),
  W("result", "نتیجه، پیامد، حاصل", "n"),
  W("rise", "بالا آمدن، افزایش یافتن - طلوع کردن", "v"),
  W("rug", "قالیچه", "n"),
  W("sadly", "متأسفانه، بدبختانه", "adv"),
  W("satisfied (with)", "راضی (از)، خوشنود (از)", "adj"),
  W("science", "علم", "n"),
  W("shared", "مشترک، اشتراکی", "adj"),
  W("shocked", "متعجب، شوکه", "adj"),
  W("shut", "بستن، تعطیل کردن", "v"),
  W("silk", "ابریشم", "n"),
  W("silver", "نقره", "n"),
  W("sink", "غرق شدن، نزول کردن - رسوب کردن", "v"),
  W("site", "مکان، جا، سایت", "n"),
  W("skillful", "ماهر", "adj"),
  W("sociable", "خوش‌مشرب، اجتماعی (انسان)", "adj"),
  W("soft", "نرم، ملایم", "adj"),
  W("southwest", "جنوب غربی", "n"),
  W("souvenir", "سوغات، یادگاری", "n"),
  W("store", "مغازه، ذخیره کردن، انبار کردن", "n"),
  W("strategy", "راهکار، رویه، استراتژی", "n"),
  W("successful", "موفق، کامیاب", "adj"),
  W("surprised (at)", "متعجب، شگفت‌زده (از)", "adj"),
  W("surprising", "تعجب‌برانگیز", "adj"),
  W("swing", "تاب خوردن، چرخیدن - نوسان، نوسان‌داشتن", "v"),
  W("throw", "پرتاب کردن، انداختن، پرتاب", "v"),
  W("tile", "کاشی، سرامیک", "n"),
  W("tilework", "کاشی‌کاری", "n"),
  W("tired (of)", "خسته، بی‌رمق - بیزار", "adj"),
  W("totally", "به طور کامل", "adv"),
  W("touch", "لمس کردن - تحت تأثیر قرار دادن", "v"),
  W("traditional", "سنتی، مرسوم", "adj"),
  W("truth", "حقیقت، راستی، درستی", "n"),
  W("ugly", "زشت - بدریخت", "adj"),
  W("uncertain", "نامعلوم - نامطمئن، مردد", "adj"),
  W("unique", "منحصر به فرد، خاص", "adj"),
  W("valuable", "باارزش، گران‌بها، نفیس", "adj"),
  W("value", "ارزش نهادن، ارزش‌گذاشتن به...", "v"),
  W("vast", "بزرگ، وسیع", "adj"),
  W("wait (for)", "منتظر ماندن (برای)، صبر کردن (برای)", "v"),
  W("want", "خواستن", "v"),
  W("weave", "بافتن", "v"),
  W("well-known", "مشهور، معروف", "adj"),
  W("well done", "بسیار عالی - آفرین", "phr"),
  W("wellness", "سلامتی - بهداشت - خوش‌بخشی", "n"),
  W("What ... for?", "برای چه ...؟", "phr"),
  W("workshop", "کارگاه، اتاق کار", "n"),
  W("worry (about)", "نگران بودن درباره", "v"),
];

const conversation = {
  introEn: "Listen to the conversation between Reza and a tourist.",
  introFa: "به مکالمهٔ رضا و یک گردشگر توجه کنید.",
  lines: [
    {
      speaker: "Reza",
      speakerFa: "رضا",
      en: "How can I help you, sir?",
      fa: "چطور می‌توانم به شما کمک کنم، آقا؟",
    },
    {
      speaker: "Tourist",
      speakerFa: "گردشگر",
      en: "I am looking for some Iranian handicrafts.",
      fa: "من به دنبال تعدادی صنایع دستی ایرانی هستم.",
    },
    {
      speaker: "Reza",
      speakerFa: "رضا",
      en: "Here you can find a range of Iranian hand-made products, from carpets to pottery and tilework, but we don't sell metalwork.",
      fa: "اینجا می‌توانید طیفی از محصولات دست‌ساز ایرانی را پیدا کنید. از فرش (گرفته) تا سفال و کاشی‌کاری، اما کارهای فلزی نمی‌فروشیم.",
    },
    {
      speaker: "Tourist",
      speakerFa: "گردشگر",
      en: "I'd like to buy a Persian carpet, but it seems too expensive.",
      fa: "من دوست دارم فرش ایرانی بخرم، اما به نظرم رسه بیش از حد گران باشه.",
    },
    {
      speaker: "Reza",
      speakerFa: "رضا",
      en: "The price depends on its size. Instead, you can take an Isfahan Termeh or a Qashqai Gabbeh.",
      fa: "قیمت بستگی به اندازهٔ اش داره. به‌جاش، می‌توانید ترمهٔ اصفهان یا گبهٔ قشقایی بردارید.",
    },
    {
      speaker: "Tourist",
      speakerFa: "گردشگر",
      en: "Wow! How touching this Gabbeh is! How much is it?",
      fa: "وای، این گبه چقدر تأثیرگذاره! قیمتش چقدره؟",
    },
    {
      speaker: "Reza",
      speakerFa: "رضا",
      en: "It is 85 dollars. If you buy more than 100 dollars, you'll get a 20 percent discount. You can take this calligraphic tile for only 30 dollars.",
      fa: "اون ۸۵ دلاره. اگر بیشتر از ۱۰۰ دلار بخرید، ۲۰ درصد تخفیف خواهید گرفت. شما می‌توانید این کاشی خوش‌نویسی شده را فقط ۳۰ دلار بردارید.",
    },
    {
      speaker: "Tourist",
      speakerFa: "گردشگر",
      en: "Well, I'll take both. Please pack them for me.",
      fa: "خب، من هر دو رو برمی‌دارم. لطفاً آنها را برای من بسته‌بندی کنید.",
    },
    {
      speaker: "Reza",
      speakerFa: "رضا",
      en: "Yes, sure.",
      fa: "بله، حتماً.",
    },
    {
      speaker: "Tourist",
      speakerFa: "گردشگر",
      en: "Do you work for this shop? Who has made these beautiful items?",
      fa: "آیا شما برای این فروشگاه کار می‌کنید؟ چه کسی این اشیاء زیبا را ساخته؟",
    },
    {
      speaker: "Reza",
      speakerFa: "رضا",
      en: "Actually, it is my father's workshop and store. I work here after school. All my family members work here to help our family business.",
      fa: "در واقع، اینجا کارگاه و فروشگاه پدر من است. من بعد از مدرسه اینجا کار می‌کنم. همهٔ اعضای خانوادهٔ من برای کمک به کسب‌وکار خانواده اینجا کار می‌کنند.",
    },
    {
      speaker: "Tourist",
      speakerFa: "گردشگر",
      en: "Well done! How lucky you are to work in such a lovely shop. I really appreciate the culture and art of Iran.",
      fa: "آفرین! شما چقدر خوش‌شانس هستید که در چنین فروشگاه قشنگی کار می‌کنید. واقعاً فرهنگ و هنر ایران را ارج می‌نهم.",
    },
    {
      speaker: "Reza",
      speakerFa: "رضا",
      en: "Thank you very much. If you are interested in knowing more about our products, you can check this booklet.",
      fa: "خیلی متشکرم. اگه علاقه‌مندید که بیشتر در مورد محصولات ما بدانید، می‌توانید این کتابچه (راهنما) را مطالعه کنید.",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "Art, Culture and Society",
    titleFa: "هنر، فرهنگ و جامعه",
    source: "Student Book: Pages 90-91",
    paragraphs: [
      {
        en: "Art is what people create with imagination and skill. As a part of culture, it shows the way of life and identity of a nation and reflects the history of a society. In fact, the history of humankind is the history of art. If we want to know a country or a nation well, we should study its art.",
        fa: "هنر چیزی است که افراد با تخیل و مهارت خلق می‌کنند. آن، به عنوان بخشی از فرهنگ، روش زندگی و هویت ملت را نشان می‌دهد و تاریخ یک جامعه را منعکس می‌کند. در حقیقت، تاریخ بشریت، تاریخ هنر است. اگر ما بخواهیم یک کشور یا یک ملت را به‌خوبی بشناسیم، باید هنر آن را مطالعه کنیم.",
      },
      {
        en: "Handicrafts are good examples of the art and culture of a country. By handicrafts, we mean making decorative items in a skillful way using our hands. Each country and culture has its own handicrafts.",
        fa: "صنایع دستی مثال‌های خوبی از هنر و فرهنگ یک کشور هستند. منظور از صنایع دستی، ساختن اشیاء تزئینی به روشی ماهرانه با استفاده از دست‌هایمان است. هر کشور و فرهنگ صنایع دستی خودش را دارد.",
      },
      {
        en: "Making and selling handicrafts are good ways to help a country's economy and introduce its culture to other nations. Many people of the world produce handicrafts and sell them to tourists. In some Asian countries a part of the country's income comes from making and selling handicrafts.",
        fa: "ساختن و فروختن صنایع دستی روش‌های خوبی برای کمک کردن به اقتصاد کشور و معرفی کردن فرهنگش به ملت‌های دیگر هستند. بسیاری از مردم دنیا صنایع دستی تولید می‌کنند و آنها را به گردشگرها می‌فروشند. در بعضی از کشورهای آسیایی بخشی از درآمد یک کشور از درست‌کردن و فروختن صنایع دستی (به دست) می‌آید.",
      },
      {
        en: "Iran has a five-thousand-year-old history of artistic works and handicrafts including pottery, painting, calligraphy, rugs and carpets, etc. If you travel across Iran, you'll get back home with excellent handicrafts as souvenirs for your family and friends.",
        fa: "ایران تاریخی پنج‌هزارساله از آثار هنری و صنایع دستی شامل سفال، نقاشی، خطاطی، قالیچه، فرش و غیره دارد. اگر در سراسر ایران سفر کنید، با صنایع دستی عالی به عنوان سوغات برای خانواده و دوستانتان به خانه برمی‌گردید.",
      },
      {
        en: "Iranian art is also quite famous all around the world. There are very excellent collections of Persian art in many important museums of the world. If we want to name countries with richest art and cultural diversity, Iran is among them. Persian art is famous in the world for reflecting moral and social values of Iranian people and the natural beauty of this vast country.",
        fa: "هنر ایرانی همچنین در سراسر دنیا کاملاً معروف است. در تعداد زیادی از موزه‌های مهم دنیا کلکسیون‌های خییل عالی از هنر ایرانی وجود دارد. اگر بخواهیم کشورهای با غنی‌ترین تنوع هنری و فرهنگی را نام ببریم، ایران از جملهٔ آنها است. هنر ایرانی به خاطر منعکس‌کردن ارزش‌های معنوی و اجتماعی مردم ایران و زیبایی طبیعی این کشور پهناور، در دنیا معروف است.",
      },
      {
        en: "Iranian craftsmen and craftswomen are famous for producing very unique artworks from wood, metal and other simple materials around them. Many people of the world appreciate the art and skill of a young Iranian girl who weaves a beautiful silk carpet in a small village of Azarbaijan or Kordistan. When tourists buy Persian rugs or carpets, they take a part of Iranian art and culture to their homelands.",
        fa: "استادکاران مرد و زن ایرانی به خاطر تولید کردن آثار هنری خیلی منحصربه‌فرد از چوب، فلز و مواد سادهٔ دیگر در دور و اطراف‌شان، معروف هستند. بسیاری از مردم دنیا قدر هنر و مهارت یک دختر جوان ایرانی را می‌دانند که یک فرش ابریشمی زیبا را در یک روستای کوچک در آذربایجان یا کردستان می‌بافد. وقتی گردشگرها قالیچه یا فرش‌های ایرانی را می‌خرند، بخشی از هنر و فرهنگ ایران را به میهن‌شان می‌برند.",
      },
    ],
  },
  {
    titleEn: "Cultures and Lifestyles",
    titleFa: "فرهنگ‌ها و سبک‌های زندگی",
    source: "Workbook: Pages 46-47",
    paragraphs: [
      {
        en: "Culture is a system of shared beliefs that are common in a society. Often, we think of the food, music, clothing, and holidays that are common in a society as its culture, but these are only some of the elements. Other elements include customs, values, behaviors, and artifacts. Culture is, therefore, a combination of thoughts, feelings, attitudes, and beliefs.",
        fa: "فرهنگ، سیستمی از عقاید به‌اشتراک‌گذاشته شده است که در یک جامعه متداول هستند. اغلب، ما غذا، موسیقی، پوشاک و تعطیلات (مراسمات) که در یک جامعه رایج‌اند را به عنوان فرهنگ آن (جامعه) در نظر می‌گیریم، اما اینها تنها برخی از اجزا هستند. سایر اجزا شامل سنت‌ها، ارزش‌ها، رفتارها و صنایع دستی هستند. بنابراین، فرهنگ ترکیبی از افکار، احساسات، نگرش‌ها و عقاید می‌باشد.",
      },
      {
        en: "With more than 190 countries and 7 billion people on earth, it is not hard to imagine that many cultures exist. No matter where you go around the world, you will face people, lifestyles and cultures that are different to what you have. People around the world have very different lives and ways of living. They have different beliefs and customs. So, they usually live and behave according to what they believe to be right and wrong.",
        fa: "با بیش از ۱۹۰ کشور و ۷ میلیارد انسان بر روی کرهٔ زمین، تصور کردن اینکه فرهنگ‌های زیادی وجود داشته باشد، سخت نیست. اهمیتی ندارد اینکه کجای دنیا می‌روید، (اما) با مردم، دارای سبک‌های زندگی و سنت‌هایی مواجه می‌شوید که با آنچه دارید، فرق دارد. مردم سراسر دنیا، زندگی‌ها و شیوه‌های زندگی خیلی متفاوتی دارند. آنها دارای عقاید و رسومات گوناگونی هستند. بنابراین، آنها معمولاً با توجه به آنچه ایمان به درست و غلط بودن آن دارند، زندگی و رفتار می‌کنند.",
      },
      {
        en: "Learning to respect other cultures is important for having new experiences and learning about the world. One of the first steps to learn about other cultures is to simply accept that there are many different cultures that exist other than our own culture. One of the most important ways to learn to become respectful of other cultures is to spend some time reflecting on our own. Then it is important to understand something about other cultures.",
        fa: "آموختن احترام به سایر فرهنگ‌ها، برای داشتن تجربیات تازه و مطلع شدن در مورد جهان، اهمیت دارد. یکی از اولین قدم‌ها برای یادگیری (مطلع شدن) در مورد سایر فرهنگ‌ها، این است که به سادگی بپذیریم که فرهنگ‌های مختلف زیادی به غیر از فرهنگ ما وجود دارند. یکی از مهم‌ترین شیوه‌های مآبحیم بودن در برابر (احترام گذاشتن) سایر فرهنگ‌ها، این است که وقتی را صرف منعکس کردن آن (فرهنگ) به فرهنگ خودمان کنیم. بنابراین، مهم است که مطلبی (چیزهایی) در مورد سایر فرهنگ‌ها بفهمیم (بدانیم).",
      },
      {
        en: "For those who want to learn about other cultures, but do not know where to start, a great place to start is reading about the cultures that interest them. In today's world if we all are able to know about other cultures, and respect them, life would be easier for most of us.",
        fa: "برای آن‌هایی که می‌خواهند در مورد سایر فرهنگ‌ها یاد بگیرند، اما نمی‌دانند از کجا شروع کنند، یک مکان عالی برای شروع، خواندن در مورد فرهنگ‌هایی است که آنها را (به خود) علاقه‌مند می‌کند. در دنیای امروز، اگر همه ما قادر باشیم در مورد سایر فرهنگ‌ها بدانیم و به آنها احترام بگذاریم، زندگی برای بیشتر ما آسان‌تر خواهد بود.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "جملات شرطی نوع اول (Conditional Sentences - Type 1)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">در جملات شرطی نوع اول، جملهٔ شرط در «زمان حال ساده» و جواب شرط در «زمان آیندهٔ ساده» خواهد بود. یعنی عملی را نشان می‌دهد که به شرط انجام کار دیگری احتمال دارد در آینده انجام شود.</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-rose-600 text-white"><th class="px-3 py-2">جملهٔ شرط (if)</th><th class="px-3 py-2">جواب شرط</th><th class="px-3 py-2">مثال</th></tr></thead><tbody><tr class="bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">If you <b>study</b> (حال ساده)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">you <b>will learn</b> (آیندهٔ ساده)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">If you study more, you will learn a lot.</td></tr></tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">«اگه بیشتر مطالعه کنی، بیشتر یاد خواهی گرفت.» — جواب شرط را می‌توان به ابتدای جمله منتقل کرد و تنها ویرگول حذف می‌شود.</p>
      <div class="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm leading-7 text-rose-900 mb-3">💡 <b>نکات کنکوری:</b><br>• در جواب شرط به‌جای will می‌توان از شکل اولِ افعال ناقص (can, may, should, must) استفاده کرد: ${EN(
        "If you don't go now, you <b>may miss</b> the train."
      )}<br>• برای سؤالی کردن، «جواب شرط» را سؤالی می‌کنیم: ${EN(
        "<b>Will</b> you stay home <b>if</b> it rains in the afternoon?"
      )}<br>• جواب شرط می‌تواند «امری» باشد: ${EN("If he comes here, <b>tell</b> him that I'm not at home.")}<br>• به‌جای will می‌توان از ${EN(
        "be going to"
      )} هم استفاده کرد: ${EN("If Raman wins, he <b>is going to invite</b> us to dinner.")}<br>• در جملهٔ شرط می‌توان از «حال استمراری» یا «حال کامل» هم استفاده کرد: ${EN(
        "If you <b>are studying</b> your final exams, you shouldn't use your cell phone."
      )} — ${EN("If he <b>has written</b> the letter, I will post it soon.")}<br>• در جملهٔ شرط بعد از if هرگز ${EN(
        "will, would, be going to"
      )} و حتی was به‌کار برده نمی‌شود!</div>`,
  },
  {
    title: "صفات فاعیلی و مفعولی (-ing / -ed)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">این افعال چنانچه <b>ed</b> بگیرند، معمولاً تبدیل به «صفت مفعولی برای انسان» می‌شوند (اثرپذیر) و چنانچه <b>ing</b> بگیرند، تبدیل به «صفت فاعیلی برای غیرِ انسان» می‌شوند (اثرگذار).</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-rose-600 text-white"><th class="px-3 py-2">فعل</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">صفت مفعولی (ed)</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">صفت فاعیلی (ing)</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>${[
        ["amuse", "سرگرم کردن", "amused", "سرگرم", "amusing", "سرگرم‌کننده"],
        ["tire", "خسته کردن", "tired", "خسته", "tiring", "خسته‌کننده"],
        ["bore", "کسل کردن", "bored", "کسل", "boring", "کسل‌کننده"],
        ["confuse", "گیج کردن", "confused", "گیج", "confusing", "گیج‌کننده"],
        ["depress", "غمگین کردن", "depressed", "غمگین", "depressing", "غم‌انگیز"],
        ["embarrass", "خجالت‌زده کردن", "embarrassed", "خجالت‌زده", "embarrassing", "خجالت‌آور"],
        ["excite", "هیجان‌زده کردن", "excited", "هیجان‌زده", "exciting", "هیجان‌انگیز"],
        ["frighten", "ترساندن", "frightened", "ترسیده", "frightening", "ترسناک"],
        ["interest", "علاقه‌مند کردن", "interested", "علاقه‌مند", "interesting", "جالب"],
        ["satisfy", "راضی کردن", "satisfied", "راضی", "satisfying", "راضی‌کننده"],
        ["shock", "شوکه کردن", "shocked", "شوکه", "shocking", "شوکه‌کننده"],
        ["surprise", "غافلگیر کردن", "surprised", "غافلگیر", "surprising", "غافلگیرکننده"],
        ["worry", "نگران کردن", "worried", "نگران", "worrying", "نگران‌کننده"],
      ]
        .map(
          (r) =>
            `<tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">${r[0]}</td><td class="px-3 py-2 border-t border-stone-100">${r[1]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>${r[2]}</b></td><td class="px-3 py-2 border-t border-stone-100">${r[3]}</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>${r[4]}</b></td><td class="px-3 py-2 border-t border-stone-100">${r[5]}</td></tr>`
        )
        .join("")}</tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-2">${EN(
        "The children are <b>excited</b> because the cartoon is <b>exciting</b>."
      )} <span class="text-slate-500">«بچه‌ها هیجان‌زده هستند چونکه کارتون هیجان‌برانگیز است.»</span></p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکتهٔ بسیار مهم:</b> صفت مفعولی (edدار) معمولاً برای توصیف انسان (کلاً موجودات زنده) و صفت فاعلی (ingدار) هم برای اشیاء و هم برای موجودات زنده به‌کار می‌رود: ${EN(
        "My brother is an <b>interesting</b> person."
      )} — بعد از «افعال ربطی» (is, seem, look, feel, get, become...) همیشه «صفت» می‌آید نه قید حالت: ${EN(
        "My mother seemed <b>tired</b>. (NOT: tiredly)"
      )}</div>`,
  },
  {
    title: "مصدر با to (Infinitive)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">چنانچه شکل ساده یا ریشهٔ فعل، علامت مصدری «to» بگیرد، تبدیل به «مصدر با to» می‌شود: ${EN(
        "to play, to study, to see, to swim"
      )}</p>
      <div class="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm leading-7 text-rose-900 mb-3">💡 <b>کاربردهای مهم:</b><br>• <b>۱. فعل دوم جمله:</b> ${EN(
        "She <b>decided</b> <b>to learn</b> Spanish carefully."
      )} (فعل دوم در نقش مفعول؛ تغییرات زمانی فقط روی فعل اول انجام می‌شود)<br>• <b>۲. بعد از کلمات Wh:</b> ${EN(
        "I don't know <b>where to buy</b> a nice shirt."
      )}<br>• <b>۳. بعد از صفات:</b> ${EN(
        "He was very <b>careful to look</b> both ways."
      )} (happy, glad, safe, afraid, sorry, proud, easy, difficult, dangerous, surprised, ashamed, certain, important, willing...)<br>• <b>۴. ساختار It:</b> ${EN(
        "It + to be + صفت + (for + مفعول) + مصدر با to"
      )} — ${EN("It was really difficult for my students <b>to answer</b> all the questions.")}<br>• <b>۵. بیان هدف:</b> ${EN(
        "She goes to the library <b>to study</b> her books."
      )}<br>• <b>۶. بعد از too:</b> ${EN(
        "That table was <b>too</b> heavy <b>to move</b>."
      )} (بلافاصله بعد از too صفت می‌آید)<br>• <b>۷. بعد از enough:</b> ${EN(
        "Raman doesn't have <b>enough</b> money <b>to buy</b> that bicycle."
      )} (بلافاصله بعد از enough اسم می‌آید)<br>• <b>۸. بعد از مرتبت اعداد و the only:</b> ${EN(
        "Alfred is always <b>the last</b> student <b>to come</b> to class."
      )}<br>• <b>۹. بعد از would like:</b> ${EN("I <b>would like to drink</b> a cup of tea.")}</div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکات کنکوری:</b><br>• برای منفی کردن مصدر با to، قبل از to قید not اضافه می‌کنیم: ${EN(
        "The students promised <b>not to make</b> a lot of mistakes."
      )}<br>• بعد از افعال ${EN(
        "let, make (به معنی مجبور کردن), help"
      )} فعل دوم «شکل ساده» می‌آید: ${EN(
        "The teacher didn't <b>let</b> the students <b>speak</b> at the class."
      )}<br>• بعد از افعال ${EN(
        "stop, prefer, intend, remember, continue, forget, like, love, hate, begin, start, need"
      )} فعل دوم هم «مصدر با to» و هم «اسم مصدر» خواهد آمد: ${EN(
        "Fortunately, my father stopped <b>smoking</b> (توقف همیشگی). — I stopped <b>to buy</b> a newspaper (توقف موقت)."
      )}</div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l3-w1", fa: "اگر بیشتر مطالعه کنی، خیلی چیزها یاد خواهی گرفت.", answer: ["If", "you", "study", "more", ",", "you", "will", "learn", "a", "lot"], hint: "شرطی نوع اول: if + حال ساده، جواب = آیندهٔ ساده" },
  { id: "l3-w2", fa: "اگر الان نروی، ممکن است قطار را از دست بدهی.", answer: ["If", "you", "don't", "go", "now", ",", "you", "may", "miss", "the", "train"], hint: "به‌جای will می‌توان از may/can/should استفاده کرد" },
  { id: "l3-w3", fa: "اگر باران ببارد، ما در خانه خواهیم ماند.", answer: ["If", "it", "rains", ",", "we", "will", "stay", "home"], hint: "بعد از if هرگز will نیاورید!" },
  { id: "l3-w4", fa: "او تصمیم گرفت که اسپانیایی را با دقت یاد بگیرد.", answer: ["She", "decided", "to", "learn", "Spanish", "carefully"], hint: "فعل دوم جمله با مصدر با to می‌آید" },
  { id: "l3-w5", fa: "من نمی‌دانم کجا یک پیراهن خوب بخرم.", answer: ["I", "don't", "know", "where", "to", "buy", "a", "nice", "shirt"], hint: "بعد از کلمات Wh هم مصدر با to می‌آید" },
  { id: "l3-w6", fa: "بچه‌ها هیجان‌زده هستند چون کارتون هیجان‌برانگیز است.", answer: ["The", "children", "are", "excited", "because", "the", "cartoon", "is", "exciting"], hint: "ed برای انسان (اثرپذیر) و ing برای غیرانسان (اثرگذار)" },
  { id: "l3-w7", fa: "برای همه ضروری است که وعده‌های متعادل غذا بخورند.", answer: ["It", "is", "necessary", "for", "everyone", "to", "eat", "balanced", "meals"], hint: "ساختار It + صفت + for + مفعول + مصدر با to" },
  { id: "l3-w8", fa: "او خیلی خوشحال بود که خانواده‌اش را ببیند.", answer: ["He", "was", "very", "happy", "to", "see", "his", "family"], hint: "بعد از صفات احساسی، مصدر با to می‌آید" },
];

const synonyms = [
  SYN("according to", "based on", "بر طبق، بر اساس"),
  SYN("actually", "really", "واقعاً"),
  SYN("amazed", "surprised", "متعجب"),
  SYN("attempt", "try", "تلاش، سعی"),
  SYN("bored", "uninterested", "کسل"),
  SYN("cheap", "inexpensive", "ارزان"),
  SYN("cheerful", "glad", "شاد، خوشحال"),
  SYN("collection", "set", "مجموعه، کلکسیون"),
  SYN("combine", "mix", "ترکیب کردن"),
  SYN("creative", "inventive", "خلاق"),
  SYN("custom", "tradition", "رسم، سنت"),
  SYN("decrease", "reduce", "کاهش دادن"),
  SYN("diversity", "variety", "تنوع"),
  SYN("earn", "obtain", "کسب کردن"),
  SYN("essay", "article", "مقاله"),
  SYN("former", "previous", "قبلی، سابق"),
  SYN("glad", "happy", "خوشحال، شاد"),
  SYN("handicrafts", "handmade products", "صنایع دستی"),
  SYN("helpful", "useful", "مفید، یاری‌رسان"),
  SYN("history", "past events", "تاریخ"),
  SYN("lovely", "beautiful", "دوست‌داشتنی، زیبا"),
  SYN("market", "bazaar", "بازار"),
  SYN("material", "fabric", "ماده، جنس"),
  SYN("meaning", "sense", "معنا، معنی"),
  SYN("mistake", "error", "اشتباه، خطا"),
  SYN("nearby", "close by", "نزدیک، حوالی"),
  SYN("opposite", "contrary", "مخالف، ضد"),
  SYN("pass", "go through", "عبور کردن"),
  SYN("pleasure", "enjoyment", "لذت، خوشی"),
  SYN("pottery", "ceramics", "سفالگری"),
  SYN("price", "cost", "قیمت"),
  SYN("prize", "award", "جایزه"),
  SYN("produce", "make", "تولید کردن"),
  SYN("product", "goods", "محصول"),
  SYN("quite", "rather", "نسبتاً"),
  SYN("range", "scope", "محدوده، گستره"),
  SYN("reflect", "show", "منعکس کردن، نشان دادن"),
  SYN("remember", "recall", "به یاد آوردن"),
  SYN("result", "outcome", "نتیجه، حاصل"),
  SYN("rise", "increase", "بالا آمدن، افزایش"),
  SYN("satisfied", "gratified", "راضی، خرسند"),
  SYN("science", "knowledge", "علم"),
  SYN("shocked", "stunned", "شوکه، متعجب"),
  SYN("silk", "fiber", "ابریشم"),
  SYN("site", "location", "محل، مکان"),
  SYN("sociable", "friendly", "اجتماعی، صمیمی"),
  SYN("soft", "smooth", "نرم، ملایم"),
  SYN("strategy", "plan", "راهکار، استراتژی"),
  SYN("successful", "prosperous", "موفق، کامیاب"),
  SYN("touch", "feel", "لمس کردن"),
  SYN("truth", "reality", "حقیقت، راستی"),
  SYN("vast", "wide", "بزرگ، وسیع"),
  SYN("weave", "knit", "بافتن"),
  SYN("well-known", "famous", "مشهور، معروف"),
  SYN("worry", "be anxious", "نگران بودن"),
];

const antonyms = [
  ANT("ability", "disability", "توانایی ↔ ناتوانی"),
  ANT("available", "unavailable", "در دسترس ↔ خارج از دسترس"),
  ANT("borrow", "lend", "قرض گرفتن ↔ قرض دادن"),
  ANT("countable", "uncountable", "قابل شمارش ↔ غیرقابل شمارش"),
  ANT("die", "live", "مردن ↔ زندگی کردن"),
  ANT("appear", "disappear", "ظاهر شدن ↔ ناپدید شدن"),
  ANT("exist", "die", "وجود داشتن ↔ مردن"),
  ANT("host", "guest", "میزبان ↔ مهمان"),
  ANT("possible", "impossible", "ممکن ↔ غیرممکن"),
  ANT("luckily", "unluckily", "خوشبختانه ↔ بدشانسانه"),
  ANT("mental", "physical", "ذهنی ↔ جسمی"),
  ANT("orally", "written", "شفاهی ↔ نوشتاری"),
  ANT("same", "different", "مشابه ↔ متفاوت"),
  ANT("turn on", "turn off", "روشن کردن ↔ خاموش کردن"),
  ANT("useful", "harmful", "مفید ↔ مضر"),
  ANT("honest", "dishonest", "صادق ↔ غیرصادق"),
  ANT("tiny", "huge", "کوچک ↔ عظیم"),
  ANT("receive", "send", "دریافت کردن ↔ فرستادن"),
  ANT("weak", "powerful", "ضعیف ↔ قوی"),
  ANT("careful", "careless", "مواظب ↔ بی‌دقت"),
  ANT("catch", "miss", "گرفتن ↔ از دست دادن"),
  ANT("cheerful", "upset", "شادمان ↔ ناراحت"),
  ANT("wrong", "correct", "اشتباه ↔ درست"),
  ANT("fall", "rise", "افتادن ↔ بالا رفتن"),
  ANT("former", "latter", "پیشین ↔ پسین"),
  ANT("remember", "forget", "به یاد آوردن ↔ فراموش کردن"),
  ANT("rich", "poor", "ثروتمند ↔ فقیر"),
  ANT("safety", "risk", "امنیت ↔ خطر"),
  ANT("simple", "difficult", "ساده ↔ دشوار"),
  ANT("paradise", "hell", "بهشت ↔ جهنم"),
  ANT("attack", "defend", "حمله کردن ↔ دفاع کردن"),
  ANT("future", "past", "آینده ↔ گذشته"),
  ANT("win", "lose", "برنده شدن ↔ باختن"),
  ANT("agree", "disagree", "موافقت کردن ↔ مخالفت کردن"),
  ANT("balanced", "unbalanced", "متوازن ↔ نامتوازن"),
  ANT("calm", "nervous", "خونسرد ↔ عصبی"),
  ANT("death", "birth", "مرگ ↔ تولد"),
  ANT("decrease", "increase", "کاهش ↔ افزایش"),
  ANT("depressed", "glad", "ناراحت ↔ خوشحال"),
  ANT("educated", "uneducated", "باسواد ↔ بی‌سواد"),
  ANT("exciting", "boring", "هیجان‌برانگیز ↔ کسل‌کننده"),
  ANT("satisfied", "unhappy", "خشنود ↔ ناخشنود"),
  ANT("forbid", "allow", "ممنوع کردن ↔ اجازه دادن"),
  ANT("gain", "lose", "به دست آوردن ↔ از دست دادن"),
  ANT("healthy", "sick", "سالم ↔ بیمار"),
  ANT("complete", "incomplete", "کامل ↔ ناکامل"),
  ANT("let", "prevent", "اجازه دادن ↔ جلوگیری کردن"),
  ANT("sadly", "fortunately", "متأسفانه ↔ خوشبختانه"),
  ANT("slowly", "quickly", "کندی ↔ سریع"),
  ANT("direct", "indirect", "مستقیم ↔ غیرمستقیم"),
  ANT("impatient", "patient", "بی‌صبر ↔ صبور"),
  ANT("positive", "negative", "مثبت ↔ منفی"),
  ANT("sell", "buy", "فروختن ↔ خریدن"),
  ANT("soft", "hard", "نرم ↔ سخت"),
  ANT("traditional", "modern", "سنتی ↔ مدرن"),
  ANT("ugly", "pretty", "زشت ↔ زیبا"),
  ANT("warm", "cold", "گرم ↔ سرد"),
  ANT("wellness", "illness", "سلامتی ↔ بیماری"),
  ANT("worried", "relaxed", "نگران ↔ آرام"),
  ANT("accept", "reject", "پذیرفتن ↔ رد کردن"),
  ANT("worthy", "unworthy", "باارزش ↔ بی‌ارزش"),
  ANT("antonym", "synonym", "متضاد ↔ مترادف"),
  ANT("far", "near", "دور ↔ نزدیک"),
  ANT("complicated", "simple", "پیچیده ↔ ساده"),
  ANT("destroy", "build", "تخریب کردن ↔ ساختن"),
  ANT("enhance", "reduce", "بالا بردن ↔ کاهش دادن"),
  ANT("costly", "cheap", "پرهزینه ↔ ارزان"),
  ANT("sure", "uncertain", "مطمئن ↔ نامطمئن"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۱۵ تست) ----------------
  Q("l3-v1", "vocab", "I bought a model of the Eiffel Tower as a ---------------- of Paris for my close friend.", ["souvenir", "reflect", "product", "collection"], 0, "من یک ماکت از برج ایفل به عنوان یک سوغات از پاریس برای دوست صمیمی‌ام خریدم."),
  Q("l3-v2", "vocab", "The ---------------- of naming women after flowers is becoming less common.", ["product", "charity", "metal", "custom"], 3, "رسم نامگذاری زنان به دنبال گل‌ها دارد کمتر رایج می‌شود."),
  Q("l3-v3", "vocab", "In the last five years, there has been a ---------------- improvement in graduation rates.", ["vast", "unique", "former", "moral"], 0, "در پنج سال گذشته پیشرفت‌های گسترده‌ای در مقیاس‌های فارغ‌التحصیلی بوده است."),
  Q("l3-v4", "vocab", "How much you're paid ---------------- how important you are to the company you work for.", ["introduces", "recognizes", "attempts", "reflects"], 3, "اینکه چقدر به شما پرداخت می‌شود نشان می‌دهد چقدر شما برای شرکت که کار می‌کنید مهم هستید."),
  Q("l3-v5", "vocab", "Our strong sense of national ---------------- has been shaped by our history.", ["essay", "fingerprint", "identity", "product"], 2, "حس قوی هویت ملی توسط تاریخ مان شکل داده شده است."),
  Q("l3-v6", "vocab", "Tom seemed -------------------- by the whole situation that occurred for the family in that novel.", ["satisfied", "cheerful", "amused", "shared"], 2, "تام برای تمام وضعیتی که برای خانواده در آن رمان اتفاق افتاد، سرگرم به نظر رسید."),
  Q("l3-v7", "vocab", "His back was ---------------- under the weight of the heavy box that he lifted.", ["pressed", "bowed", "hard", "depended"], 1, "پشتش زیر وزن جعبهٔ سنگینی که بلند کرد خمیده شد."),
  Q("l3-v8", "vocab", "We need to rethink the way we consume energy. Take, ---------------- our approach to transport.", ["frightened to death", "how touching", "for instance", "well-done"], 2, "لازمه که ما تجدیدنظری دربارهٔ شیوه‌ای که ما انرژی مصرف می‌کنیم، داشته باشیم. به عنوان مثال شیوهٔ حمل و نقل مان را در نظر بگیرید."),
  Q("l3-v9", "vocab", "Every Christmas we have a collection of people for a local ----------------.", ["souvenir", "custom", "identity", "charity"], 3, "هر کریسمس ما مجموعه‌ای از مردم برای امورات خیریهٔ محلی داریم."),
  Q("l3-v10", "vocab", "A ---------------- of factors may be responsible for the increase in cancer.", ["product", "pack", "charity", "combination"], 3, "یک ترکیبی از فاکتورها ممکن است مسئول افزایش در سرطان باشد."),
  Q("l3-v11", "vocab", "You'll need a variety of skills, ---------------- leadership and negotiating with your personnel.", ["touching", "bowing", "including", "attempting"], 2, "شما به تنوعی از مهارت‌ها نیاز خواهید داشت، از جمله رهبری و مذاکره با پرسنل‌تان."),
  Q("l3-v12", "vocab", "I think you can run a business to the highest ---------------- standards in the society.", ["pressing", "moral", "well-done", "former"], 1, "من فکر می‌کنم که شما می‌توانید یک تجارت را با بالاترین استانداردهای اخلاقی در جامعه اداره کنید."),
  Q("l3-v13", "vocab", "The World Health Organization has ---------------- alcoholism as a disease since 1951.", ["recognized", "satisfied", "shared", "introduced"], 0, "سازمان جهانی بهداشت الکلیسم را به عنوان بیماری از سال ۱۹۵۱ تشخیص داده است."),
  Q("l3-v14", "vocab", "The article made no ---------------- to previous researches on the subject.", ["reference", "introduction", "essay", "identity"], 0, "مقاله هیچ ارجاعی به تحقیقات قبلی در مورد موضوع نکرد."),
  Q("l3-v15", "vocab", "The curtains are for purely ---------------- purposes and do not open or close.", ["touching", "cheerful", "decorative", "pressing"], 2, "پرده‌ها صرفاً برای اهداف تزئینی هستند و باز یا بسته نمی‌شوند."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l3-k1", "vocab-konkuri", "In a trip to Isfahan, my father has bought a ---------------- pot for my sister. It looks really beautiful.", ["satisfied", "decorative", "available", "harmful"], 1, "در سفری به اصفهان، پدرم یک کوزهٔ تزئینی برای خواهرم خریده است. واقعاً زیبا به نظر می‌رسد."),
  Q("l3-k2", "vocab-konkuri", "After finishing my exam, my teacher seemed ---------------- with my progress.", ["moral", "handmade", "satisfied", "available"], 2, "بعد از تمام کردن امتحانم، معلمم با پیشرفت من راضی به نظر می‌رسید."),
  Q("l3-k3", "vocab-konkuri", "A lot of Iranian craftswomen have great skill to ---------------- a basket from some plants.", ["reflect", "promise", "weave", "expect"], 2, "تعداد زیادی از صنعتگران زن ایرانی مهارت زیادی برای بافتن یک سبد از برخی گیاهان دارند."),
  Q("l3-k4", "vocab-konkuri", "In our country Iran, it is the ---------------- for many people to celebrate New Year.", ["material", "custom", "range", "beauty"], 1, "در کشور ما ایران، جشن گرفتن سال نو برای خیلی از مردم یک رسم است."),
  Q("l3-k5", "vocab-konkuri", "Every country has its own cultural ----------------, which is very different from other countries.", ["serving", "identity", "imagination", "artwork"], 1, "هر کشور هویت فرهنگی خودش را دارد، که با کشورهای دیگر خیلی متفاوت است."),
  Q("l3-k6", "vocab-konkuri", "Modern technology has greatly helped ---------------- in many different areas.", ["reference", "material", "homeland", "humankind"], 3, "تکنولوژی مدرن به‌شدت به بشریت در خیلی از مناطق مختلف کمک کرده است."),
  Q("l3-k7", "vocab-konkuri", "There is a 25 percent ---------------- on all clothes until the end of the week.", ["relationship", "discount", "interest", "meaning"], 1, "تا پایان هفته تخفیف ۲۵ درصدی روی تمام لباس‌ها وجود دارد."),
  Q("l3-k8", "vocab-konkuri", "Isfahan decorative -------------------- have attracted many tourists for many years.", ["exercises", "handicrafts", "collection", "patterns"], 1, "صنایع دستی تزئینی اصفهان سال‌ها است گردشگران زیادی را جذب کرده است."),
  Q("l3-k9", "vocab-konkuri", "Our university uses a combination of modern and -------------------- ways for teaching reading.", ["traditional", "vast", "valuable", "decorative"], 0, "دانشگاه ما ترکیبی از روش‌های مدرن و سنتی برای آموزش خواندن استفاده می‌کند."),
  Q("l3-k10", "vocab-konkuri", "I didn't know anybody at the class, but the teacher ---------------- me to a few people.", ["reflected", "imagined", "expected", "introduced"], 3, "من هیچ‌کس را در کلاس نمی‌شناختم، اما معلم من را به چند نفر معرفی کرد."),
  Q("l3-k11", "vocab-konkuri", "In a trip to Isfahan, my father has bought a ---------------- pot for my sister. It looks really beautiful.", ["satisfied", "decorative", "available", "harmful"], 1, "در سفری به اصفهان، پدرم یک ظرفِ تزئینی برای خواهرم خرید؛ واقعاً زیباست."),
  Q("l3-k12", "vocab-konkuri", "After finishing my exam, my teacher seemed ---------------- with my progress.", ["moral", "handmade", "satisfied", "available"], 2, "بعد از تمام شدنِ امتحانم، معلمم از پیشرفتم راضی به نظر می‌رسید."),
  Q("l3-k13", "vocab-konkuri", "A lot of Iranian craftswomen have great skill to ---------------- a basket from some plants.", ["reflect", "promise", "weave", "expect"], 2, "بسیاری از صنعتگرانِ ایرانی مهارتِ عالی برای بافتنِ سبد از گیاهان دارند."),
  Q("l3-k14", "vocab-konkuri", "In our country Iran, it is the ---------------- for many people to celebrate New Year.", ["material", "custom", "range", "beauty"], 1, "در کشورمان ایران، جشن گرفتنِ سالِ نو رسمِ بسیاری از مردم است."),
  Q("l3-k15", "vocab-konkuri", "There is a 25 percent ---------------- on all clothes until the end of the week.", ["relationship", "discount", "interest", "meaning"], 1, "تا آخر هفته ۲۵ درصد تخفیف روی همهٔ لباس‌ها هست."),
  // ---------------- گرامر و نگارش (۱۵ تست) ----------------
  Q("l3-g1", "grammar", "If I find a book that is popular among all children, I -------------- it for my brother as a birthday present.", ["buy", "will buy", "bought", "would have bought"], 1, "اگر کتابی را پیدا کنم که در بین بچه‌ها پرطرفدار است، آن را برای برادرم همچون یک کادوی تولد می‌خرم. (شرطی نوع اول)"),
  Q("l3-g2", "grammar", "You won't ---------------- to the theater on time if you ---------------- home at six.", ["got / didn't leave", "get / don't leave", "got / don't leave", "get / didn't leave"], 1, "اگر خانه را در ساعت ۶ ترک نکنی، به سر وقت به تئاتر نمی‌رسی. (شرطی نوع اول: حال ساده)"),
  Q("l3-g3", "grammar", "If you ---------------- to bed early tonight, you ---------------- better in the morning.", ["went / will feel", "go / would feel", "go / will feel", "went / would feel"], 2, "اگر امشب زودتر به رختخواب بروی، فردا صبح حالت بهتر خواهد بود. (tonight → شرطی نوع اول)"),
  Q("l3-g4", "grammar", "I think I left my watch at your house. If you ---------------- it, can you call me?", ["found", "find", "will find", "finding"], 1, "فکر کنم ساعتم را در منزل‌تان جاگذاشتم. اگر آن را پیدا کردی، می‌توانی به من زنگ بزنی؟ (در شرطی نوع اول، جواب شرط می‌تواند سؤالی باشد)"),
  Q("l3-g5", "grammar", "I -------------------- poor people in the future if I -------------------- a doctor.", ["will help / became", "would help / become", "will help / become", "help / became"], 2, "اگر دکتر بشوم، در آینده به افراد فقیر کمک خواهم کرد. (future → شرطی نوع اول)"),
  Q("l3-g6", "grammar", "We ---------------- go out today, if it ---------------- heavily.", ["can't / will rain", "can't / rains", "couldn't / will rain", "couldn't / rains"], 1, "اگر باران به شدت ببارد، ما نمی‌توانیم امروز به بیرون برویم. (بعد از if هرگز will نمی‌آید)"),
  Q("l3-g7", "grammar", "I think if we ---------------- Ben to the party, we'll have to invite his friends, too.", ["will decide inviting", "decide to invite", "will decide to invite", "decide inviting"], 1, "من فکر کنم اگر ما تصمیم بگیریم بن را به مهمانی دعوت کنیم، ما مجبور خواهیم بود همهٔ دوستانش را هم دعوت کنیم. (decide + مصدر با to)"),
  Q("l3-g8", "grammar", "We --------------- go to Paris on vacation next week if our parents -------------- to travel.", ["might / agree", "may / agreed", "might / agrees", "may / agree"], 3, "ما احتمالاً هفتهٔ آینده برای تعطیلات به پاریس سفر می‌کنیم اگر والدینمان برای سفر کردن موافقت کنند. (may = شکل اول فعل ناقص)"),
  Q("l3-g9", "grammar", "Please, eat your lunch. If you ------------------- your soup now, it ---------------- cold.", ["didn't have / would go", "had / got", "can eat / doesn't go", "don't have / will go"], 3, "لطفاً نهارت را بخور. اگر الان سوپت را نخوری، سرد خواهد شد. (now → شرطی نوع اول)"),
  Q("l3-g10", "grammar", "He felt extremely ----------------------- after staying up very late to finish his school project.", ["tiring", "to tire", "tired", "was tired"], 2, "او بعد از اینکه تا دیر وقت برای تمام کردن پروژهٔ مدرسه‌اش بیدار بود، به شدت احساس خستگی کرد. (فاعل انسان → صفت مفعولی)"),
  Q("l3-g11", "grammar", "After 10 hours of hard work, Tom did not look -----------------, so I let him go ahead and finish the job.", ["tired", "tiring", "to tire", "to be tiring"], 0, "تام بعد از ۱۰ ساعت کار شدید به نظر خسته نمی‌رسید، بنابراین من به او اجازه دادم ادامه دهد و کار را تمام کند."),
  Q("l3-g12", "grammar", "It was a hard decision but at the end, I decided -------------------- to the university.", ["going", "goes", "went", "to go"], 3, "تصمیم‌گیری سختی بود اما در آخر تصمیم گرفتم که به دانشگاه بروم. (decide + مصدر با to)"),
  Q("l3-g13", "grammar", "The police seem certain -------------------- the people who are responsible for the attack.", ["find", "finding", "found", "to find"], 3, "نیروی پلیس به نظر می‌رسید مطمئن بود که افرادی که مسئول حمله بودند را پیدا کند. (certain + مصدر با to)"),
  Q("l3-g14", "grammar", "I wanted -------------------- it but it cost too much and I didn't have enough money.", ["to bought", "to buy", "buying", "for buying"], 1, "من خواستم آن را بخرم اما قیمتش خیلی زیاد بود و من پول کافی نداشتم. (want + مصدر با to)"),
  Q("l3-g15", "grammar", "This program is completely new and I don't know how ------------------- it.", ["uses", "to use", "will use", "using"], 1, "این برنامه کاملاً جدید است و من نمی‌دانم چطور از آن استفاده کنم. (کلمات Wh + مصدر با to)"),
];

export const lesson3: LessonData = {
  id: 3,
  titleEn: "Art and Culture",
  titleFa: "هنر و فرهنگ",
  tagline: "فرهنگ ایران، صنایع دستی و جملات شرطی",
  color: "rose",
  grade: "یازدهم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  antonyms,
  writing,
  quizzes,
};

export default lesson3;
