import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Six: "Renewable Energy"  |  انرژی تجدیدپذیر
// Vision 3 (Grade 12) — Lesson Three · انطباقِ تعاملیِ جزوهٔ ویژن ۳
// Grammar focus: Reported speech (نقل قول)
// =====================================================================

const vocabulary = [
  W("affect", "تأثیر گذاشتن، اثر گذاشتن", "v"),
  W("alternative", "جایگزین، بدل", "adj"),
  W("amount", "مقدار، میزان", "n"),
  W("atmosphere", "جوّ (زمین)، هواکره", "n"),
  W("available", "در دسترس، موجود", "adj"),
  W("battery", "باتری، پیل", "n"),
  W("biomass", "زیست‌توده، سوخت زیستی", "n"),
  W("carbon dioxide", "دی‌اکسید کربن، گاز کربنیک", "phr"),
  W("cheap", "ارزان، کم‌بها", "adj"),
  W("clean", "تمیز، پاکیزه", "adj"),
  W("climate", "اقلیم، آب‌وهوا", "n"),
  W("climate change", "تغییر اقلیم، تغییرات آب‌وهوایی", "phr"),
  W("coal", "زغال‌سنگ، ذغال", "n"),
  W("completely", "کاملاً، به‌طور کامل", "adv"),
  W("consume", "مصرف کردن، به‌هدر دادن", "v"),
  W("convert", "تبدیل کردن، دگرگون کردن", "v"),
  W("costly", "پرهزینه، گران", "adj"),
  W("dam", "سد، بند", "n"),
  W("demand", "تقاضا، درخواست؛ تقاضا داشتن", "n"),
  W("depend (on)", "بستگی داشتن (به)، وابسته بودن به", "v"),
  W("device", "دستگاه، وسیله", "n"),
  W("earth", "زمین، کرهٔ خاکی", "n"),
  W("efficient", "پُربازده، کارآمد", "adj"),
  W("electricity", "برق، الکتریسیته", "n"),
  W("energy", "انرژی، نیرو", "n"),
  W("engine", "موتور، ماشین", "n"),
  W("environment", "محیط زیست، محیط", "n"),
  W("expensive", "گران، پرهزینه", "adj"),
  W("finite", "محدود، متناهی", "adj"),
  W("fossil fuel", "سوخت فسیلی", "phr"),
  W("fuel", "سوخت؛ سوخت‌رسانی کردن", "n"),
  W("generate", "تولید کردن، ایجاد کردن", "v"),
  W("generation", "تولید؛ نسل", "n"),
  W("geothermal", "زمین‌گرمایی", "adj"),
  W("global warming", "گرمایش جهانی", "phr"),
  W("greenhouse gas", "گاز گلخانه‌ای", "phr"),
  W("heat", "گرما؛ گرم کردن", "n"),
  W("hydropower", "انرژی آبی، برق‌آبی", "n"),
  W("inexhaustible", "تمام‌نشدنی، بی‌پایان", "adj"),
  W("infinite", "بی‌نهایت، نامحدود", "adj"),
  W("install", "نصب کردن، کار گذاشتن", "v"),
  W("light", "نور، روشنایی؛ چراغ", "n"),
  W("limited", "محدود، اندک", "adj"),
  W("major", "عمده، اصلی، بزرگ", "adj"),
  W("natural", "طبیعی، طبیعت‌آسا", "adj"),
  W("natural gas", "گاز طبیعی", "phr"),
  W("nature", "طبیعت، سرشت", "n"),
  W("ocean", "اقیانوس، پهنهٔ اقیانوس", "n"),
  W("oil", "نفت، روغن", "n"),
  W("panel", "پنل، صفحه (خورشیدی)", "n"),
  W("plant", "نیروگاه؛ گیاه؛ کاشتن", "n"),
  W("pollute", "آلوده کردن، آلودن ساختن", "v"),
  W("pollution", "آلودگی", "n"),
  W("power", "توان، نیرو؛ برق", "n"),
  W("power plant", "نیروگاه، مرکز تولید برق", "phr"),
  W("produce", "تولید کردن، فرآوردن", "v"),
  W("reduce", "کاهش دادن، کم کردن", "v"),
  W("renewable", "تجدیدپذیر، نوپدید", "adj"),
  W("resource", "منبع، ثروت، ذخیره", "n"),
  W("run out (of)", "تمام شدن، به‌پایان رسیدن", "phr.v"),
  W("save", "صرفه‌جویی کردن؛ نجات دادن", "v"),
  W("solar", "خورشیدی، خورشیدآین", "adj"),
  W("solar panel", "پنل خورشیدی", "phr"),
  W("source", "منبع، سرچشمه", "n"),
  W("spin", "چرخیدن، دوران کردن", "v"),
  W("steam", "بخار، بخار آب", "n"),
  W("sunlight", "نور خورشید، آفتاب", "n"),
  W("supply", "تأمین کردن؛ عرضه", "v"),
  W("sustainable", "پایدار، دوام‌پذیر", "adj"),
  W("tide", "جزر و مد، مدّوکسیر", "n"),
  W("turbine", "توربین، چرخِ محرک", "n"),
  W("wind", "باد، نسیم", "n"),
  W("wind farm", "مزرعهٔ بادی", "phr"),
  W("wind turbine", "توربین بادی", "phr"),
  W("wood", "چوب، هیزم", "n"),
  W("waste", "هدر دادن؛ زباله، دورریز", "v"),
  // — واژگان جامع (راند ۲۱۰، گیت‌شده)
  W("angry", "عصبانی"),
  W("apply", "درخواست کردن، تقاضا کردن"),
  W("as a result of", "در نتیجه- به دلیل"),
  W("attitude", "نگرش، گرایش - طرز برخورد"),
  W("background", "پس زمینه"),
  W("basis", "اساس- اصل"),
  W("beach", "ساحل (دریا)"),
  W("beloved", "محبوب، مورد علاقه"),
  W("blow", "وزیدن - دمیدن - ضرب"),
  W("broth", "آبگوشت"),
  W("burn", "سوزاندن، سوختن"),
  W("character", "شخصیت"),
  W("circulation", "گردش، جریان، دوران"),
  W("clean energy", "انرژی پاک"),
  W("collect", "جمع‌آوری کردن، جمع کردن"),
  W("collector", "جمع کننده"),
  W("community", "جامعهٔ محلی، اجتماع"),
  W("consist of", "تشکیل شدن از"),
  W("consumer", "مصرف کننده"),
  W("consumption", "مصرف، استفاده"),
  W("cooler", "خنک کننده"),
  W("cooling", "خنک سازی"),
  W("cost", "قیمت داشتن"),
  W("document", "مدرک- سند"),
  W("dreadful", "ترسناک"),
  W("economy", "اقتصاد"),
  W("electric", "برق"),
  W("energetic", "پر انرژی، فعال"),
  W("energetically", "با انرژی، به طور پر انرژی"),
  W("equivalent", "برابر"),
  W("except", "به جزء، به غیر از"),
  W("fall", "پایین - افتادن، سقوط کردن"),
  W("fan", "پنکه، فن، بادبزن، بادزن"),
  W("fantastic", "رویایی"),
  W("feather", "پَر (پرنده)"),
  W("flock", "دسته، گروه- دور هم جمع شدن"),
  W("fly", "پرواز کردن"),
  W("forever", "برای همیشه"),
  W("gadget", "وسیله، ابزار کوچک، دستگاه جادویی"),
  W("garbage", "زباله، آشغال"),
  W("global", "جهانی، جهان‌شمول"),
  W("goal", "هدف، مقصد، منظور"),
  W("harm", "ضرر"),
  W("hatch", "از تخم درآمدن؛ جوجه کشیدن"),
  W("heart", "قلب، دل؛ مرکز، مغزِ ماجرا"),
  W("herd", "گروه- دسته- گله"),
  W("hold", "برگزار کردن"),
  W("impression", "برداشت، تأثیر، امضاء (ذهنی)"),
  W("incandescent lamp", "لامپ رشته ای"),
  W("lead", "راهنمایی کردن"),
  W("leader", "رهبر"),
  W("likelihood", "احتمال"),
  W("line", "خط - سطر، ردیف - ریسمان"),
  W("machine", "دستگاه - ماشین"),
  W("marketplace", "بازار، میدان فروش کالا"),
  W("material", "ماده، جنس، جسم"),
  W("nephew", "پسر خواهر، پسر برادر"),
  W("noise-free", "بدون صدا"),
  W("organization", "سازمان"),
  W("other than", "به جز، به غیر از"),
  W("particularly", "به ویژه، به طور خاص"),
  W("perfect", "عالی، کامل، تمام"),
  W("permanently", "به طور پایدار، ماندگار"),
  W("place", "مکان، جا، محل، میدان"),
  W("politics", "سیاست"),
  W("polluted", "آلوده"),
  W("portable", "قابل حمل"),
  W("principal", "مدیر، رئیس - اصیل، عمده، مهم"),
  W("product", "محصول"),
  W("repeat", "تکرار کردن"),
  W("result", "نتیجه، پیامد، حاصل"),
  W("revolve", "چرخیدن، گردش کردن، دور زدن"),
  W("rise", "بالا آمدن، افزایش یافتن - طلوع کردن"),
];

const conversation = {
  introEn: "Listen to the conversation between Mr. Karimi, an engineer, and his daughter Zahra, about solar panels.",
  introFa: "به مکالمهٔ آقای کریمی، مهندس، و دخترش زهرا دربارهٔ پنل‌های خورشیدی توجه کنید.",
  lines: [
    {
      speaker: "Zahra",
      speakerFa: "زهرا",
      en: "Dad, the science teacher said that fossil fuels will run out one day. Is that true?",
      fa: "بابا، معلم علوم گفت یک روز سوخت‌های فسیلی تمام می‌شوند. درست است؟",
    },
    {
      speaker: "Mr. Karimi",
      speakerFa: "آقای کریمی",
      en: "Yes, Zahra. Oil, coal, and natural gas are limited resources, and they are being used very fast.",
      fa: "بله، زهرا. نفت، زغال‌سنگ و گاز طبیعی منابعِ محدودی‌اند و خیلی سریع مصرف می‌شوند.",
    },
    {
      speaker: "Zahra",
      speakerFa: "زهرا",
      en: "Then what will happen to our electricity in the future?",
      fa: "پس در آینده برق‌مان چه می‌شود؟",
    },
    {
      speaker: "Mr. Karimi",
      speakerFa: "آقای کریمی",
      en: "Don't worry. More and more electricity will be produced by renewable sources like the sun and the wind.",
      fa: "نگران نباش. برق بیشتری توسط منابع تجدیدپذیر مثل خورشید و باد تولید خواهد شد.",
    },
    {
      speaker: "Zahra",
      speakerFa: "زهرا",
      en: "I see. And I've noticed that some houses in our street have solar panels on their roofs.",
      fa: "فهمیدم. و دیده‌ام بعضی خانه‌های خیابان‌مان پنل خورشیدی روی پشت‌بام‌شان دارند.",
    },
    {
      speaker: "Mr. Karimi",
      speakerFa: "آقای کریمی",
      en: "Exactly! Sunlight is converted into electricity by those panels. My company is installing them these days.",
      fa: "دقیقاً! نور خورشید توسط آن پنل‌ها به برق تبدیل می‌شود. شرکت من این روزها در حال نصب آن‌هاست.",
    },
    {
      speaker: "Zahra",
      speakerFa: "زهرا",
      en: "Are they expensive? Our teacher said clean energy was still costly in the past.",
      fa: "گران‌اند؟ معلم‌مان گفت انرژی پاک در گذشته هنوز پرهزینه بود.",
    },
    {
      speaker: "Mr. Karimi",
      speakerFa: "آقای کریمی",
      en: "They used to be costly, but their price has decreased a lot. Besides, the electricity bills become much cheaper.",
      fa: "قبلاً پرهزینه بودند، اما قیمت‌شان خیلی کم شده. به‌علاوه، قبض برق خیلی ارزان‌تر می‌شود.",
    },
    {
      speaker: "Zahra",
      speakerFa: "زهرا",
      en: "That's great! And wind turbines? Do they also produce clean electricity?",
      fa: "چه عالی! و توربین‌های بادی؟ آن‌ها هم برقِ پاک تولید می‌کنند؟",
    },
    {
      speaker: "Mr. Karimi",
      speakerFa: "آقای کریمی",
      en: "Yes. When the wind spins the blades of the turbine, electricity is generated. No smoke, no pollution.",
      fa: "بله. وقتی باد پره‌های توربین را می‌چرخاند، برق تولید می‌شود. بدون دود، بدون آلودگی.",
    },
    {
      speaker: "Zahra",
      speakerFa: "زهرا",
      en: "Wonderful! Then when I grow up, I want to build big solar power plants for our country.",
      fa: "فوق‌العاده! پس وقتی بزرگ شدم، می‌خواهم نیروگاه‌های خورشیدی بزرگی برای کشورمان بسازم.",
    },
    {
      speaker: "Mr. Karimi",
      speakerFa: "آقای کریمی",
      en: "That's a beautiful dream, Zahra. Study hard, because the future of our planet needs engineers like you.",
      fa: "رؤیای قشنگی است، زهرا. خوب درس بخوان، چون آیندهٔ سیارهٔ ما به مهندس‌هایی مثل تو نیاز دارد.",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "Renewable Energy",
    titleFa: "انرژی تجدیدپذیر",
    source: "Vision 3 — Student Book: Lesson Three",
    paragraphs: [
      {
        en: "Energy is the power that makes everything work: our lamps, our cars, our computers, and even our bodies. For many years, most of the world's energy was produced by burning fossil fuels such as coal, oil, and natural gas. These fuels were cheap and easy to find, so they were used everywhere.",
        fa: "انرژی نیرویی است که همه‌چیز را به کار می‌اندازد: چراغ‌هایمان، ماشین‌هایمان، رایانه‌هایمان و حتی بدن‌هایمان. سال‌های زیاد، بیشتر انرژیِ دنیا با سوزاندن سوخت‌های فسیلی مثل زغال‌سنگ، نفت و گاز طبیعی تولید می‌شد. این سوخت‌ها ارزان و پیداکردنیِ راحتی بودند، پس همه‌جا به‌کار می‌رفتند.",
      },
      {
        en: "However, fossil fuels have two big problems. First, they are finite resources; scientists say that one day they will run out completely. Second, burning them pollutes the atmosphere with carbon dioxide and other greenhouse gases, which cause global warming and climate change.",
        fa: "با این حال، سوخت‌های فسیلی دو مشکل بزرگ دارند. اول اینکه منابعی متناهی‌اند؛ دانشمندان می‌گویند یک روز تمام‌وشده خواهند شد. دوم اینکه سوزاندن‌شان جوّ زمین را با دی‌اکسید کربن و دیگر گازهای گلخانه‌ای آلوده می‌کند که باعث گرمایش جهانی و تغییر اقلیم می‌شود.",
      },
      {
        en: "Renewable energy is the best alternative. Sunlight, wind, water, and biomass are inexhaustible sources, and using them does not pollute the earth. Solar panels convert sunlight into electricity, wind turbines are turned by the wind, and hydropower plants generate electricity from the water that spins behind dams.",
        fa: "انرژی تجدیدپذیر بهترین جایگزین است. نور خورشید، باد، آب و زیست‌توده منابعِ تمام‌نشدنی‌اند و استفاده از آن‌ها زمین را آلوده نمی‌کند. پنل‌های خورشیدی نور خورشید را به برق تبدیل می‌کنند، توربین‌های بادی با باد می‌چرخند و نیروگاه‌های برق‌آبی از آبِ پشتِ سدها برق تولید می‌کنند.",
      },
      {
        en: "In the past, renewable energy was expensive, so many countries did not use it much. Today, the price of solar panels and wind turbines has decreased, and clean electricity is being produced in large amounts around the world. Many governments ask that more and more power plants be built from renewable sources.",
        fa: "در گذشته، انرژی تجدیدپذیر گران بود، پس بسیاری از کشورها از آن زیاد استفاده نمی‌کردند. امروز قیمت پنل‌های خورشیدی و توربین‌های بادی کاهش یافته و در سراسر جهان مقادیر زیادی برقِ پاک تولید می‌شود. بسیاری از دولت‌ها خواستار ساخته‌شدنِ نیروگاه‌های بیشتری از منابع تجدیدپذیرند.",
      },
      {
        en: "The future of our planet depends on the choices we make today. If we save energy at home, plant trees, and support clean technologies, we will leave a healthier earth for the next generations. Renewable energy is not only science; it is also a promise that we give to the future of the earth.",
        fa: "آیندهٔ سیارهٔ ما به انتخاب‌هایی بستگی دارد که امروز می‌کنیم. اگر در خانه انرژی را ذخیره کنیم، درخت بکاریم و از فناوری‌های پاک پشتیبانی کنیم، زمینی سالم‌تر برای نسل‌های بعدی به‌جا خواهیم گذاشت. انرژی تجدیدپذیر فقط علم نیست؛ وعده‌ای است که به آیندهٔ زمین می‌دهیم.",
      },
    ],
  },
  {
    titleEn: "Energy for the Future",
    titleFa: "انرژی برای آینده",
    source: "Vision 3 — Workbook: Lesson Three",
    paragraphs: [
      {
        en: "Did you know that the sunlight which reaches the earth in one hour carries more energy than the whole world uses in one year? This amazing fact shows how rich our planet is in natural power. The problem is not the amount of energy; the problem is how we use it.",
        fa: "می‌دانستی نور خورشیدی که در یک ساعت به زمین می‌رسد، انرژیِ بیشتری از کل مصرفِ یک‌سالهٔ دنیا حمل می‌کند؟ این واقعیت شگفت‌انگیز نشان می‌دهد سیارهٔ ما چه قدر در قدرتِ طبیعی غنی است. مشکل مقدارِ انرژی نیست؛ مشکل این است که چگونه از آن استفاده می‌کنیم.",
      },
      {
        en: "Geothermal energy is another clean source that is hidden under the ground. In some countries, the natural heat of the earth is used to warm houses in cold winters. Wave and tide power are also being explored near oceans, because the movement of water never stops.",
        fa: "انرژی زمین‌گرمایی منبع پاکِ دیگری است که زیرِ زمین پنهان است. در بعضی از کشورها، از گرمای طبیعی زمین برای گرم نگه‌داشتنِ خانه‌ها در زمستان‌های سرد استفاده می‌شود. انرژی موج و جزر و مد هم نزدیک اقیانوس‌ها در حال کاوش است، چون حرکتِ آب هرگز متوقف نمی‌شود.",
      },
      {
        en: "Scientists have also improved batteries, so the electricity that is produced on sunny or windy days can be saved for cloudy and calm ones. In the near future, electric cars will be charged by clean energy, and homes will be powered by their own solar panels and small wind machines.",
        fa: "دانشمندان باتری‌ها را هم بهبود داده‌اند، تا برقی که در روزهای آفتابی یا بادی تولید می‌شود، برای روزهای ابری و بی‌باد ذخیره شود. در آیندهٔ نزدیک، ماشین‌های برقی با انرژی پاک شارژ خواهند شد و خانه‌ها با پنل‌های خورشیدی و ماشین‌های بادیِ کوچکِ خودشان برق‌دار خواهند بود.",
      },
      {
        en: "Every person can take part in this great change. When we turn off the lights we do not need, use public transportation, and recycle paper and plastic, less fuel is burned, and less smoke enters the atmosphere. Small actions, when they are repeated by millions of people, become a powerful force.",
        fa: "هر فردی می‌تواند در این تغییرِ بزرگ سهیم شود. وقتی چراغ‌های بی‌لازم را خاموش می‌کنیم، از حمل‌ونقل عمومی استفاده می‌کنیم و کاغذ و پلاستیک را بازیافت می‌کنیم، سوختِ کمتری سوزانده می‌شود و دودِ کمتری وارد جوّ می‌شود. کارهای کوچک، وقتی میلیون‌ها نفر تکرارشان می‌کنند، به نیرویی قدرتمند تبدیل می‌شوند.",
      },
      {
        en: "The sun, the wind, and the water will never send us a bill; their energy is free for everyone. All we need is the wisdom to use them well and the will to change our habits. That is how the story of energy on the earth will be written by the next generation.",
        fa: "خورشید، باد و آب هرگز برایمان قبض نمی‌فرستند؛ انرژی‌شان برای همه رایگان است. تنها چیزی که نیاز داریم، خردِ استفادهٔ خوب از آن‌ها و ارادهٔ تغییرِ عادت‌هایمان است. داستانِ انرژی روی زمین همین‌گونه توسط نسل بعد نوشته خواهد شد.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "نقل قول گزاره‌ای (Reported Speech — Statements)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">وقتی حرفِ کسی را «به نقل» می‌گوییم، جمله با ${EN(
        "said (that)"
      )} یا ${EN(
        "told + مخاطب (that)"
      )} آغاز می‌شود و معمولاً زمانِ فعل یک پله به گذشته برمی‌گردد (backshift):</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-teal-700 text-white"><th class="px-3 py-2">نقل مستقیم</th><th class="px-3 py-2">نقل غیرمستقیم</th><th class="px-3 py-2">تغییر زمان</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He said, "I am tired."</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He said (that) he <b>was</b> tired.</td><td class="px-3 py-2 border-t border-stone-100">حال ساده → گذشتهٔ ساده</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She said, "I sent the letter."</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She said (that) she <b>had sent</b> the letter.</td><td class="px-3 py-2 border-t border-stone-100">گذشتهٔ ساده → گذشتهٔ کامل</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He said, "I will come."</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He said (that) he <b>would</b> come.</td><td class="px-3 py-2 border-t border-stone-100">آینده → would</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She said, "I can swim."</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She said (that) she <b>could</b> swim.</td><td class="px-3 py-2 border-t border-stone-100">can → could</td></tr>
      </tbody></table></div>
      <div class="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm leading-7 text-teal-900 mb-3">💡 <b>تفاوتِ say و tell:</b> بعد از ${EN(
        "tell"
      )} همیشه مخاطب می‌آید (${EN("tell <b>me/him/us</b> that...")}) اما بعد از ${EN(
        "say"
      )} مخاطب مستقیم نمی‌آید (${EN("say that...")}). پس: ${EN(
        'He told me, "..." → He told me that... / He said, "..." → He said that...'
      )}</div>`,
  },
  {
    title: "تغییر ضمایر و قیدهای زمان و مکان",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">در نقل قول، علاوه بر فعل، ضمیرها و قیدهای زمان/مکان هم متناسب با گویندهٔ جدید تغییر می‌کنند:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-teal-700 text-white"><th class="px-3 py-2">در نقل مستقیم</th><th class="px-3 py-2">در نقل غیرمستقیم</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">now</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">then / at that moment</td><td class="px-3 py-2 border-t border-stone-100">الان → آن‌موقع</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">today / tonight</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">that day / that night</td><td class="px-3 py-2 border-t border-stone-100">امروز/امشب → آن‌روز/آن‌شب</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">tomorrow</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">the next day / the following day</td><td class="px-3 py-2 border-t border-stone-100">فردا → روزِ بعد</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">yesterday</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">the day before / the previous day</td><td class="px-3 py-2 border-t border-stone-100">دیروز → روزِ قبل</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">here</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">there</td><td class="px-3 py-2 border-t border-stone-100">اینجا → آنجا</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">this / these</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">that / those</td><td class="px-3 py-2 border-t border-stone-100">این → آن</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-2">${EN(
        'She said, "I will call you tomorrow."'
      )} → ${EN("She said that she would call me <b>the next day</b>.")}</p>`,
  },
  {
    title: "نقل قول سؤالی (Reported Questions)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">در نقلِ سؤال، جمله «سؤالی» نمی‌ماند؛ به شکل خبری و معمولاً با ${EN(
        "asked"
      )} بیان می‌شود. دو حالت داریم:</p>
      <p class="text-[15px] leading-8 text-slate-700 mb-3"><b>۱. سؤال‌های بله/خیر:</b> با ${EN(
        "if / whether"
      )} وصل می‌شوند: ${EN(
        'She asked me, "Do you want tea?" → She asked me <b>if I wanted</b> tea.'
      )}</p>
      <p class="text-[15px] leading-8 text-slate-700 mb-3"><b>۲. سؤال‌های Wh:</b> کلمهٔ پرسشی می‌ماند اما ترتیبِ خبری می‌شود (فعل بعد از فاعل): ${EN(
        'He asked me, "Where do you live?" → He asked me <b>where I lived</b>.'
      )}</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-teal-700 text-white"><th class="px-3 py-2">سؤال مستقیم</th><th class="px-3 py-2">نقل غیرمستقیم</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">"Are you hungry?"</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He asked me <b>if I was</b> hungry.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">"Where do you live?"</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He asked me <b>where I lived</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">"What is she doing?"</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He asked me <b>what she was doing</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">"Why did you leave?"</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He asked me <b>why I had left</b>.</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکات کنکوری:</b><br>• در سؤالِ نقل‌شده هرگز do/does/did و «؟» نمی‌آید: ${EN(
        "He asked where I lived. (NOT: where did I live)"
      )}<br>• ${EN(
        "say → said / tell → told"
      )} برای جملهٔ خبری و ${EN("ask → asked")} برای سؤال<br>• اگر گفتهٔ اصلی «حقیقتِ علمی» باشد، backshift اجباری نیست: ${EN(
        'The teacher said that the earth <b>goes</b> around the sun.'
      )}</div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l6-w1", fa: "او گفت که خسته است.", answer: ["He", "said", "that", "he", "was", "tired"], hint: "نقل قول: حال ساده → گذشتهٔ ساده" },
  { id: "l6-w2", fa: "او به من گفت که نامه را فرستاده است.", answer: ["She", "told", "me", "that", "she", "had", "sent", "the", "letter"], hint: "بعد از tell مخاطب می‌آید؛ گذشتهٔ ساده → گذشتهٔ کامل" },
  { id: "l6-w3", fa: "او از من پرسید که کجا زندگی می‌کنم.", answer: ["He", "asked", "me", "where", "I", "lived"], hint: "سؤال Wh در نقل قول: ترتیب خبری، بدون do/does" },
  { id: "l6-w4", fa: "او از من پرسید که آیا چای می‌خواهم.", answer: ["She", "asked", "me", "if", "I", "wanted", "tea"], hint: "سؤال بله/خیر → if/whether" },
  { id: "l6-w5", fa: "او گفت که فردا می‌آید.", answer: ["He", "said", "that", "he", "would", "come", "the", "next", "day"], hint: "will → would و tomorrow → the next day" },
  { id: "l6-w6", fa: "او گفت که انرژی خورشیدی تجدیدپذیر است.", answer: ["She", "said", "that", "solar", "energy", "was", "renewable"], hint: "حال ساده → گذشتهٔ ساده در نقل قول" },
  { id: "l6-w7", fa: "او توضیح داد که توربین‌ها برق تولید می‌کنند.", answer: ["He", "explained", "that", "the", "turbines", "produced", "electricity"], hint: "فعل نقل‌کنندهٔ مناسب: explain" },
  { id: "l6-w8", fa: "او گفت که باید سوخت را ذخیره کنیم.", answer: ["He", "said", "that", "we", "had", "to", "save", "fuel"], hint: "must → had to در نقل قول" },
];

const synonyms = [
  SYN("renewable", "sustainable", "تجدیدپذیر ↔ پایدار"),
  SYN("cheap", "inexpensive", "ارزان ↔ کم‌هزینه"),
  SYN("clean", "pure", "تمیز ↔ خالص"),
  SYN("produce", "generate", "تولید کردن ↔ برق‌تولیدی کردن"),
  SYN("convert", "transform", "تبدیل کردن ↔ دگرگون کردن"),
  SYN("amount", "quantity", "مقدار ↔ کمیت"),
  SYN("source", "resource", "منبع ↔ ثروت"),
  SYN("pollute", "contaminate", "آلوده کردن ↔ آلودن ساختن"),
  SYN("major", "main", "عمده ↔ اصلی"),
  SYN("infinite", "endless", "بی‌نهایت ↔ بی‌پایان"),
  SYN("expensive", "costly", "گران ↔ پرهزینه"),
  SYN("heat", "warmth", "گرما ↔ گرما/گرمی"),
  SYN("available", "accessible", "در دسترس ↔ قابل دسترسی"),
  SYN("spin", "rotate", "چرخیدن ↔ دوران کردن"),
  SYN("demand", "need", "تقاضا ↔ نیاز"),
  SYN("waste", "squander", "هدر دادن ↔ اسراف کردن"),
];

const antonyms = [
  ANT("renewable", "nonrenewable", "تجدیدپذیر ↔ تجدیدناپذیر"),
  ANT("cheap", "expensive", "ارزان ↔ گران"),
  ANT("clean", "dirty", "تمیز ↔ کثیف"),
  ANT("reduce", "increase", "کاهش دادن ↔ افزایش دادن"),
  ANT("infinite", "finite", "بی‌نهایت ↔ متناهی"),
  ANT("save", "waste", "صرفه‌جویی کردن ↔ هدر دادن"),
  ANT("available", "unavailable", "موجود ↔ ناموجود"),
  ANT("pollute", "purify", "آلوده کردن ↔ تصفیه کردن"),
  ANT("major", "minor", "عمده ↔ جزئی"),
  ANT("natural", "artificial", "طبیعی ↔ مصنوعی"),
  ANT("limited", "unlimited", "محدود ↔ نامحدود"),
  ANT("demand", "supply", "تقاضا ↔ عرضه"),
  ANT("light", "darkness", "نور ↔ تاریکی"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۱۵ تست) ----------------
  Q("l6-v1", "vocab", "Solar, wind, and hydropower are all kinds of ---------------- energy.", ["renewable", "fossil", "limited", "finite"], 0, "خورشیدی، بادی و برق‌آبی همگی انواع انرژی تجدیدپذیرند."),
  Q("l6-v2", "vocab", "Burning coal, oil, and natural gas ---------------- the air with carbon dioxide.", ["converts", "pollutes", "saves", "supplies"], 1, "سوزاندن زغال‌سنگ، نفت و گاز طبیعی هوا را با دی‌اکسید کربن آلوده می‌کند."),
  Q("l6-v3", "vocab", "Scientists say that fossil fuels will ---------------- one day, so we need alternatives.", ["run out", "install", "spin", "affect"], 0, "دانشمندان می‌گویند یک روز سوخت‌های فسیلی تمام می‌شوند، پس به جایگزین نیاز داریم."),
  Q("l6-v4", "vocab", "The wind makes the blades of the ---------------- turn and electricity is generated.", ["dam", "turbine", "battery", "panel"], 1, "باد پره‌های توربین را می‌چرخاند و برق تولید می‌شود."),
  Q("l6-v5", "vocab", "Greenhouse gases cause global ----------------, which changes the climate of the earth.", ["warming", "burning", "polluting", "saving"], 0, "گازهای گلخانه‌ای باعث گرمایش جهانی می‌شوند که اقلیم زمین را تغییر می‌دهد."),
  Q("l6-v6", "vocab", "The price of solar panels has ---------------- a lot in the last ten years.", ["decreased", "increased", "polluted", "consumed"], 0, "قیمت پنل‌های خورشیدی در ده سال گذشته خیلی کم شده است."),
  Q("l6-v7", "vocab", "Water stored behind the ---------------- is used to produce electricity in power plants.", ["dam", "engine", "battery", "atmosphere"], 0, "از آبِ ذخیره‌شده پشتِ سد برای تولید برق در نیروگاه‌ها استفاده می‌شود."),
  Q("l6-v8", "vocab", "Please ---------------- energy at home; turn off the lights when you leave the room.", ["save", "waste", "burn", "convert"], 0, "لطفاً در خانه انرژی را ذخیره کن؛ موقع خروج از اتاق چراغ‌ها را خاموش کن."),
  Q("l6-v9", "vocab", "The ---------------- of energy in big cities is much higher than in villages.", ["consumption", "generation", "atmosphere", "pollution"], 0, "مصرفِ انرژی در شهرهای بزرگ خیلی بیشتر از روستاهاست."),
  Q("l6-v10", "vocab", "Electric cars are becoming ---------------- because their batteries are improving.", ["available", "expensive", "costly", "limited"], 0, "ماشین‌های برقی در دسترس‌تر می‌شوند چون باتری‌هایشان بهبود یافته است."),
  Q("l6-v11", "vocab", "A power ---------------- is a place where electricity is produced for homes and factories.", ["plant", "panel", "turbine", "source"], 0, "نیروگاه جایی است که برق برای خانه‌ها و کارخانه‌ها تولید می‌شود."),
  Q("l6-v12", "vocab", "Sunlight is ---------------- into electricity by solar panels on the roof.", ["converted", "polluted", "wasted", "burned"], 0, "نور خورشید توسط پنل‌های خورشیدی روی پشت‌بام به برق تبدیل می‌شود."),
  Q("l6-v13", "vocab", "Biomass energy is produced from plants, wood, and other natural ----------------.", ["materials", "bills", "engines", "tides"], 0, "انرژی زیست‌توده از گیاهان، چوب و دیگر موادِ طبیعی تولید می‌شود."),
  Q("l6-v14", "vocab", "Wind farms are usually built in open areas where the ---------------- is strong.", ["wind", "oil", "coal", "steam"], 0, "مزرعه‌های بادی معمولاً در مناطق باز که باد قوی دارد ساخته می‌شوند."),
  Q("l6-v15", "vocab", "Factories must ---------------- the amount of smoke they send into the atmosphere.", ["reduce", "increase", "install", "supply"], 0, "کارخانه‌ها باید مقدار دودی که به جوّ می‌فرستند را کم کنند."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l6-k1", "vocab-konkuri", "Unlike fossil fuels, sunlight is an ---------------- source of power; it never runs out.", ["inexhaustible", "expensive", "limited", "artificial"], 0, "برخلاف سوخت‌های فسیلی، نور خورشید منبعی تمام‌نشدنی است؛ هرگز تمام نمی‌شود."),
  Q("l6-k2", "vocab-konkuri", "The movement of sea water, called ----------------, can also be used to make electricity.", ["tide", "smoke", "steam", "wood"], 0, "حرکتِ آب دریا که «جزر و مد» نام دارد هم می‌تواند برای تولید برق به‌کار رود."),
  Q("l6-k3", "vocab-konkuri", "The natural heat under the ground is called ---------------- energy.", ["geothermal", "solar", "wind", "biomass"], 0, "گرمای طبیعی زیرِ زمین «انرژی زمین‌گرمایی» نامیده می‌شود."),
  Q("l6-k4", "vocab-konkuri", "My uncle works in a company that ---------------- electricity from the wind in Manjil.", ["generates", "pollutes", "wastes", "burns"], 0, "داییم در شرکتی کار می‌کند که در منجیل از باد برق تولید می‌کند."),
  Q("l6-k5", "vocab-konkuri", "Energy from water that spins behind dams is called ---------------- power.", ["hydro", "solar", "fossil", "thermal"], 0, "انرژیِ آبِ پشتِ سدها «انرژی آبی» نامیده می‌شود."),
  Q("l6-k6", "vocab-konkuri", "Using public ---------------- is a good way to reduce air pollution in cities.", ["transportation", "generation", "installation", "production"], 0, "استفاده از حمل‌ونقل عمومی راه خوبی برای کاهش آلودگی هوای شهرهاست."),
  Q("l6-k7", "vocab-konkuri", "The new solar devices are very ----------------; they use almost every part of the sunlight.", ["efficient", "expensive", "costly", "finite"], 0, "دستگاه‌های خورشیدی جدید خیلی پُربازده‌اند؛ تقریباً از هر بخشِ نور خورشید استفاده می‌کنند."),
  Q("l6-k8", "vocab-konkuri", "Many governments ---------------- that more clean power plants be built in the future.", ["demand", "waste", "pollute", "affect"], 0, "بسیاری از دولت‌ها تقاضا می‌کنند که نیروگاه‌های پاک بیشتری در آینده ساخته شود."),
  Q("l6-k9", "vocab-konkuri", "It was reported that the old power plant ---------------- into a modern solar farm.", ["was converted", "was polluted", "was wasted", "was burned"], 0, "گزارش شد که نیروگاه قدیمی به یک مزرعهٔ خورشیدی مدرن تبدیل شده است."),
  Q("l6-k10", "vocab-konkuri", "Car engines that burn ---------------- fuels send a lot of smoke into the air.", ["fossil", "clean", "solar", "renewable"], 0, "موتور ماشین‌هایی که سوخت‌های فسیلی می‌سوزانند دود زیادی به هوا می‌فرستند."),
  Q("l6-k11", "vocab-konkuri", "After finishing reading the novel, I ---------------- the book correctly on the shelf.", ["replaced", "defended", "covered", "attracted"], 0, "بعد از تمام کردنِ رمان، کتاب را درست سرِ جایش روی قفسه گذاشتم."),
  Q("l6-k12", "vocab-konkuri", "In a natural process, nitrogen is ---------------- into nitrates in the soil which plants can then use.", ["magnified", "visited", "consumed", "converted"], 3, "در فرایندی طبیعی، نیتروژن در خاک به نیترات تبدیل می‌شود که گیاهان بعداً از آن استفاده می‌کنند."),
  Q("l6-k13", "vocab-konkuri", "As the number of population increases, power plants should ---------------- more fossil fuels to generate electricity.", ["consider", "endanger", "consume", "expand"], 2, "با افزایشِ جمعیت، نیروگاه‌ها باید سوختِ فسیلیِ بیشتری مصرف کنند تا برق تولید کنند."),
  Q("l6-k14", "vocab-konkuri", "They have greatly ---------------- the size and cost of most electronic products.", ["reduced", "developed", "generated", "labeled"], 0, "آن‌ها اندازه و هزینهٔ بیشترِ محصولاتِ الکترونیکی را به‌شدت کم کرده‌اند."),
  Q("l6-k15", "vocab-konkuri", "He believes that eating ---------------- food reduces one's chances of developing certain types of cancer.", ["organic", "renewable", "ordinary", "junk"], 0, "او باور دارد خوردنِ غذای ارگانیک شانسِ ابتلا به برخی سرطان‌ها را کم می‌کند."),
  // ---------------- گرامر و نگارش (۱۵ تست) ----------------
  Q("l6-g1", "grammar", 'He said, "I am very tired." — He said that he ---------------- very tired.', ["is", "was", "were", "has been"], 1, "او گفت که خیلی خسته است. (حال ساده → گذشتهٔ ساده در نقل قول)"),
  Q("l6-g2", "grammar", 'She said, "I sent the letter yesterday." — She said that she ---------------- the letter the day before.', ["sent", "had sent", "has sent", "sends"], 1, "او گفت که نامه را روزِ قبل فرستاده است. (گذشتهٔ ساده → گذشتهٔ کامل)"),
  Q("l6-g3", "grammar", 'He asked me, "Where do you live?" — He asked me where ----------------.', ["do I live", "did I live", "I lived", "I live?"], 2, "او از من پرسید کجا زندگی می‌کنم. (سؤال Wh در نقل قول: ترتیب خبری)"),
  Q("l6-g4", "grammar", 'She asked me, "Do you want tea?" — She asked me ---------------- tea.', ["if I wanted", "do I want", "that I wanted", "if I want?"], 0, "او از من پرسید آیا چای می‌خواهم. (سؤال بله/خیر → if)"),
  Q("l6-g5", "grammar", 'He said, "I will come tomorrow." — He said that he ---------------- the next day.', ["will come", "would come", "comes", "had come"], 1, "او گفت که روز بعد می‌آید. (will → would و tomorrow → the next day)"),
  Q("l6-g6", "grammar", "The engineer ---------------- that the new turbines produced clean electricity.", ["told", "said", "asked", "spoke"], 1, "مهندس گفت که توربین‌های جدید برقِ پاک تولید می‌کنند. (بعد از say مخاطبِ مستقیم نمی‌آید)"),
  Q("l6-g7", "grammar", "My father ---------------- me that fossil fuels were limited resources.", ["said", "asked", "told", "spoke"], 2, "پدرم به من گفت که سوخت‌های فسیلی منابعِ محدودی‌اند. (tell + مخاطب)"),
  Q("l6-g8", "grammar", 'The teacher asked, "Is water necessary for life?" — She asked ---------------- necessary for life.', ["if water is", "if water was", "that water was", "was water"], 1, "معلم پرسید آیا آب برای حیات ضروری است. (سؤال بله/خیر + backshift)"),
  Q("l6-g9", "grammar", 'He said, "I can swim very well." — He said that he ---------------- swim very well.', ["can", "could", "will", "may"], 1, "او گفت که می‌تواند خیلی خوب شنا کند. (can → could)"),
  Q("l6-g10", "grammar", 'She asked him, "Why did you leave early?" — She asked him why ---------------- early.', ["did he leave", "he left", "he had left", "had he left"], 2, "او از او پرسید چرا زود رفته بود. (گذشتهٔ ساده → گذشتهٔ کامل، ترتیب خبری)"),
  Q("l6-g11", "grammar", "The scientist said that the earth ---------------- around the sun.", ["went", "goes", "had gone", "would go"], 1, "دانشمند گفت که زمین به دور خورشید می‌چرخد. (حقیقتِ علمی → backshift اجباری نیست)"),
  Q("l6-g12", "grammar", 'He said, "I must save fuel." — He said that he ---------------- save fuel.', ["must", "had to", "have to", "should have"], 1, "او گفت که باید سوخت را ذخیره کند. (must → had to)"),
  Q("l6-g13", "grammar", 'They said, "We are installing solar panels now." — They said that they ---------------- solar panels then.', ["are installing", "were installing", "install", "have installed"], 1, "گفتند که آن‌موقع در حال نصب پنل خورشیدی هستند. (حال استمراری → گذشتهٔ استمراری)"),
  Q("l6-g14", "grammar", 'He asked me, "What is she doing?" — He asked me what ----------------.', ["is she doing", "she was doing", "was she doing", "she is doing"], 1, "او از من پرسید او چه می‌کرد. (ترتیب خبری + گذشتهٔ استمراری)"),
  Q("l6-g15", "grammar", 'She said, "I will show you my new device here." — She said that she would show me her new device ----------------.', ["here", "there", "in here", "at here"], 1, "گفت که دستگاه جدیدش را آنجا به من نشان خواهد داد. (here → there)"),
];

export const lesson6: LessonData = {
  id: 6,
  titleEn: "Renewable Energy",
  titleFa: "انرژی تجدیدپذیر",
  tagline: "انرژی‌های پاک، محیط زیست و نقل قول",
  color: "teal",
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

export default lesson6;
