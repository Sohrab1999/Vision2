import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Eight: "Wonders of Creation"  |  شگفتی‌های آفرینش
// Vision 1 (Grade 10) — Lesson Two · جزوهٔ پایهٔ دهم (راند ۱۹۴ — «قفسهٔ کامل»)
// Grammar focus: Simple Past + comparatives/superlatives
// =====================================================================

const vocabulary = [
  W("amazing", "شگفت‌انگیز، حیرت‌آور", "adj"),
  W("ant", "مورچه", "n"),
  W("attack", "حمله کردن؛ حمله", "v"),
  W("beak", "منقار (پرنده)", "n"),
  W("bee", "زنبور عسل", "n"),
  W("butterfly", "پروانه", "n"),
  W("camel", "شتر", "n"),
  W("catch", "گرفتن، شکار کردن", "v"),
  W("claw", "چنگال، پنجه", "n"),
  W("climb", "بالارفتن، صعود کردن", "v"),
  W("communicate", "ارتباط برقرار کردن", "v"),
  W("creation", "آفرینش، خلقت", "n"),
  W("creature", "موجود، آفریده", "n"),
  W("deep", "عمیق", "adj"),
  W("defend", "دفاع کردن، حفظ کردن", "v"),
  W("desert", "بیابان، کویر", "n"),
  W("dive", "شیرجه زدن", "v"),
  W("dolphin", "دلفین", "n"),
  W("eagle", "عقاب", "n"),
  W("echo", "پژواک، انعکاس صدا", "n"),
  W("egg", "تخم، تخم‌مرغ", "n"),
  W("enemy", "دشمن", "n"),
  W("escape", "فرار کردن، گریختن", "v"),
  W("fast", "سریع، تند", "adj"),
  W("feather", "پَر (پرنده)", "n"),
  W("fin", "باله (ماهی)", "n"),
  W("freeze", "یخ زدن، منجمد شدن", "v"),
  W("fur", "خز، پشمِ حیوان", "n"),
  W("gentle", "ملایم، نرم‌خو", "adj"),
  W("hatch", "از تخم درآمدن؛ جوجه کشیدن", "v"),
  W("hear", "شنیدن", "v"),
  W("heavy", "سنگین", "adj"),
  W("hide", "پنهان شدن، پنهان کردن", "v"),
  W("high", "بلند، مرتفع", "adj"),
  W("horn", "شاخ (حیوان)", "n"),
  W("hump", "کوهان (شتر)", "n"),
  W("incredible", "باورنکردنی", "adj"),
  W("intelligent", "باهوش، زیرک", "adj"),
  W("journey", "سفر، مسیر", "n"),
  W("kilometer", "کیلومتر", "n"),
  W("long", "بلند، دراز", "adj"),
  W("migrate", "مهاجرت کردن (پرندگان/ماهی‌ها)", "v"),
  W("mile", "مایل (واحد طول)", "n"),
  W("memory", "حافظه، یادمان", "n"),
  W("nest", "لانه (پرنده)", "n"),
  W("ordinary", "معمولی، عادی", "adj"),
  W("owl", "جغد", "n"),
  W("pattern", "الگو، نقش", "n"),
  W("poison", "زهر؛ زهرآگین کردن", "n"),
  W("poisonous", "زهرآگین، سمی", "adj"),
  W("precious", "گران‌بها، گران‌قدر", "adj"),
  W("search", "جست‌وجو کردن؛ جست‌وجو", "v"),
  W("sense of smell", "حس بویایی", "phr"),
  W("shark", "کوسه", "n"),
  W("skin", "پوست", "n"),
  W("snake", "مار", "n"),
  W("sound", "صدا؛ صدا کردن", "n"),
  W("speed", "سرعت", "n"),
  W("spider", "عنکبوت", "n"),
  W("spider web", "تارعنکبوت", "phr"),
  W("spot", "خال، لکه", "n"),
  W("strange", "عجیب، غریب", "adj"),
  W("strong", "قوی، نیرومند", "adj"),
  W("survive", "جان سالم به در بردن، زنده ماندن", "v"),
  W("tail", "دُم", "n"),
  W("tongue", "زبان (اندام)", "n"),
  W("unique", "بی‌همتا، یکتا", "adj"),
  W("unbelievable", "باورنکردنی، ناباور", "adj"),
  W("valuable", "ارزشمند، باارزش", "adj"),
  W("whale", "نهنگ", "n"),
  W("wing", "بال", "n"),
  W("wonder", "شگفتی، حیرت", "n"),
];

const conversation = {
  introEn: "Listen to the conversation between Ali and Maryam, two tenth-grade students, after watching a nature documentary about amazing animals.",
  introFa: "به مکالمهٔ علی و مریم، دو دانش‌آموز پایهٔ دهم، بعد از دیدن مستندی دربارهٔ حیوانات شگفت‌انگیز گوش دهید.",
  lines: [
    {
      speaker: "Maryam",
      speakerFa: "مریم",
      en: "Did you watch the nature documentary last night, Ali? It was unbelievable!",
      fa: "مستند طبیعتِ دیشب را دیدی، علی؟ باورنکردنی بود!",
    },
    {
      speaker: "Ali",
      speakerFa: "علی",
      en: "Yes, I did! The camel was the most amazing animal in the whole program.",
      fa: "بله، دیدم! شتر شگفت‌انگیزترین حیوانِ کل برنامه بود.",
    },
    {
      speaker: "Maryam",
      speakerFa: "مریم",
      en: "Really? For me it was the dolphin. It communicated with other dolphins by making special sounds.",
      fa: "واقعاً؟ برای من دلفین بود. با ساختنِ صداهای خاص با دلفین‌های دیگر ارتباط برقرار می‌کرد.",
    },
    {
      speaker: "Ali",
      speakerFa: "علی",
      en: "That was incredible. But did you know that a camel can survive for weeks without water?",
      fa: "آن باورنکردنی بود. اما می‌دانستی شتر می‌تواند هفته‌ها بدون آب زنده بماند؟",
    },
    {
      speaker: "Maryam",
      speakerFa: "مریم",
      en: "I heard something like that. The program said its hump stores fat, not water.",
      fa: "چیزی شبیه همان شنیده بودم. برنامه گفت کوهانش چربی ذخیره می‌کند، نه آب.",
    },
    {
      speaker: "Ali",
      speakerFa: "علی",
      en: "Exactly! And the owl — it sees better at night than most animals see in daylight.",
      fa: "دقیقاً! و جغد — شب‌ها از بیشتر حیوانات در نور روز بهتر می‌بیند.",
    },
    {
      speaker: "Maryam",
      speakerFa: "مریم",
      en: "My favorite part was the spider web. It is stronger than steel of the same weight!",
      fa: "قسمتِ موردعلاقهٔ من تارعنکبوت بود. از فولادِ هم‌وزنِ خودش قوی‌تر است!",
    },
    {
      speaker: "Ali",
      speakerFa: "علی",
      en: "Wow! Nature is more creative than any engineer. Every creature has its own clever design.",
      fa: "وای! طبیعت از هر مهندسی خلاق‌تر است. هر موجودی طراحیِ هوشمندانهٔ خودش را دارد.",
    },
    {
      speaker: "Maryam",
      speakerFa: "مریم",
      en: "The eagle was the fastest hunter in the film. It dove and caught its prey in one second.",
      fa: "عقاب سریع‌ترین شکارچیِ فیلم بود. شیرجه زد و طعمه‌اش را در یک ثانیه گرفت.",
    },
    {
      speaker: "Ali",
      speakerFa: "علی",
      en: "And the whales sang the most beautiful songs under the sea. Scientists are still searching for their meaning.",
      fa: "و نهنگ‌ها زیباترین آهنگ‌ها را زیر دریا خواندند. دانشمندان هنوز دنبال معنایشان می‌گردند.",
    },
    {
      speaker: "Maryam",
      speakerFa: "مریم",
      en: "You know what? Our science teacher says the best book is nature itself. Let's plan a trip to the desert next month.",
      fa: "می‌دانی چیست؟ معلم علوم‌مان می‌گوید بهترین کتاب، خودِ طبیعت است. بیا برای ماه بعد سفری به کویر بچینیم.",
    },
    {
      speaker: "Ali",
      speakerFa: "علی",
      en: "Great idea! We will take our cameras and record every amazing creature we find.",
      fa: "ایدهٔ فوق‌العاده‌ای است! دوربین‌هایمان را می‌بریم و از هر موجودِ شگفت‌انگیزی که پیدا کنیم فیلم می‌گیریم.",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "Wonders of Creation",
    titleFa: "شگفتی‌های آفرینش",
    source: "Vision 1 — Student Book: Lesson Two",
    paragraphs: [
      {
        en: "Look around you: the world is full of amazing creatures. A tiny ant can carry fifty times its own weight. A bee visits thousands of flowers every day and never gets lost on the way home. These ordinary-looking animals are, in fact, extraordinary engineers.",
        fa: "به اطرافت نگاه کن: دنیا پُر از موجودات شگفت‌انگیز است. یک مورچهٔ کوچک می‌تواند پنجاه برابر وزنِ خودش بار حمل کند. یک زنبور هر روز به هزاران گل سر می‌زند و هرگز راهِ خانه را گم نمی‌کند. این حیواناتِ به‌ظاهر معمولی در واقع مهندس‌هایی غیرعادی‌اند.",
      },
      {
        en: "The desert is one of the hardest places on earth, but the camel survives there easily. Its hump stores fat, its long eyelashes keep the sand out of its eyes, and it can walk for days without drinking water. People call it the ship of the desert because it carries travelers across the hot sand.",
        fa: "بیابان یکی از سخت‌ترین جای‌های زمین است، اما شتر به‌آسانی آن‌جا زنده می‌ماند. کوهانش چربی ذخیره می‌کند، مژه‌های بلندش شن را از چشمانش بیرون نگه می‌دارد و می‌تواند روزها بدون آب راه برود. مردم به آن «کشتیِ بیابان» می‌گویند چون مسافران را از روی شن‌های داغ عبور می‌دهد.",
      },
      {
        en: "Under the water, the world is even more surprising. Dolphins talk to each other with special sounds, and a whale's song can travel for hundreds of kilometers in the ocean. Sharks were swimming in the seas millions of years before the first human appeared on the earth.",
        fa: "زیر آب، دنیا حتی شگفت‌انگیزتر است. دلفین‌ها با صداهای خاص با هم حرف می‌زنند و آهنگِ نهنگ می‌تواند صدها کیلومتر در اقیانوس حرکت کند. کوسه‌ها میلیون‌ها سال پیش از آنکه نخستین انسان روی زمین ظاهر شود، در دریاها شنا می‌کردند.",
      },
      {
        en: "In the sky, birds show another wonder: migration. Every autumn, millions of birds fly thousands of kilometers between their summer and winter homes. They navigate by the sun, the stars, and even the magnetic field of the earth — a built-in compass that no human made.",
        fa: "در آسمان، پرندگان شگفتی دیگری نشان می‌دهند: مهاجرت. هر پاییز میلیون‌ها پرنده هزاران کیلومتر بین خانه‌های تابستانی و زمستانی‌شان پرواز می‌کنند. با خورشید و ستاره‌ها و حتی میدان مغناطیسی زمین مسیریابی می‌کنند — قطب‌نمایی که هیچ انسانی نساخته است.",
      },
      {
        en: "Scientists study these wonders every day, but nature still keeps many secrets. Maybe you will be the next person who discovers a new creature or explains an old mystery. Keep your eyes open and your mind curious — the greatest book ever written is the world around you.",
        fa: "دانشمندان هر روز این شگفتی‌ها را مطالعه می‌کنند، اما طبیعت هنوز رازهای زیادی نگه داشته است. شاید تو نفرِ بعدی باشی که موجودی تازه کشف می‌کند یا رازِ کهنه‌ای را توضیح می‌دهد. چشمانت را باز و ذهنت را کنجکاو نگه دار — بزرگ‌ترین کتابِ همیشه، دنیای اطراف توست.",
      },
    ],
  },
  {
    titleEn: "The Greatest Travelers",
    titleFa: "بزرگ‌ترین مسافران",
    source: "Vision 1 — Workbook: Lesson Two",
    paragraphs: [
      {
        en: "Every year, the Arctic tern makes the longest journey in the animal world. This small bird flies from the North Pole to the South Pole and back — about seventy thousand kilometers in one year. No other animal travels a longer distance in its lifetime.",
        fa: "هر سال، پرستوی قطبی طولانی‌ترین سفرِ دنیای حیوانات را انجام می‌دهد. این پرندهٔ کوچک از قطب شمال تا قطب جنوب پرواز می‌کند و برمی‌گردد — حدود هفتاد هزار کیلومتر در یک سال. هیچ حیوانِ دیگری در عمرش مسافت طولانی‌تری سفر نمی‌کند.",
      },
      {
        en: "Monarch butterflies are travelers too, but their journey is different: no single butterfly finishes the whole trip. The journey takes several generations, and somehow each new generation knows the way. Scientists say the secret is written in their genes like a map.",
        fa: "پروانه‌های مونارک هم مسافرند، اما سفرشان متفاوت است: هیچ پروانه‌ای کلِ مسیر را تمام نمی‌کند. سفر چند نسل طول می‌کشد و به‌نحوی هر نسلِ جدید راه را می‌داند. دانشمندان می‌گویند راز در ژن‌هایشان مثل یک نقشه نوشته شده است.",
      },
      {
        en: "In the deep oceans, salmon swim back to the exact river where they were born. They jump over waterfalls, escape hungry bears, and swim against strong currents. Their sense of smell is so powerful that one drop of their home river in a huge lake is enough to guide them.",
        fa: "در اعماق اقیانوس‌ها، ماهی‌های سالمون به دقیقاً همان رودخانه‌ای که در آن به دنیا آمده‌اند برمی‌گردند. از آبشارها می‌پرند، از خرس‌های گرسنه می‌گریزند و خلاف جریان‌های قوی شنا می‌کنند. حس بویایی‌شان آن‌قدر قدرتمند است که یک قطره از رودخانهٔ زادگاهشان در دریاچه‌ای بزرگ برای راهنمایی‌شان کافی است.",
      },
      {
        en: "Why do these animals travel so far? The answer is simple: to survive. They follow the food, the warm weather, and the safe places for their eggs. Their journeys are long and dangerous, but the travelers that arrive find the best conditions for the next generation.",
        fa: "چرا این حیوانات این‌قدر دور سفر می‌کنند؟ پاسخ ساده است: برای زنده ماندن. غذا و هوای گرم و جای امنِ تخم‌هایشان را دنبال می‌کنند. سفرهایشان طولانی و خطرناک است، اما مسافرانی که می‌رسند، بهترین شرایط را برای نسلِ بعدی می‌یابند.",
      },
      {
        en: "Humans once needed months to cross the same distances. Today our planes are faster than any bird, but we still cannot match the accuracy of these small travelers. They cross the planet without maps, without lights, and without getting lost — one of the most beautiful wonders of creation.",
        fa: "انسان‌ها زمانی برای عبور از همین مسافت‌ها ماه‌ها وقت لازم داشتند. امروز هواپیماهای ما از هر پرنده‌ای سریع‌ترند، اما هنوز نمی‌توانیم با دقتِ این مسافرانِ کوچک رقابت کنیم. بی‌نقشه، بی‌چراغ و بی‌گم‌شدن از روی سیاره عبور می‌کنند — یکی از زیباترین شگفتی‌های آفرینش.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "گذشتهٔ ساده (Simple Past)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">گذشتهٔ ساده برای کاری که «در گذشته شروع و تمام شد» به‌کار می‌رود. فعل‌های باقاعده با <span dir="ltr">-ed</span> و فعل‌های بی‌قاعده شکل دومِ خودشان را می‌گیرند:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-indigo-700 text-white"><th class="px-3 py-2">مثبت</th><th class="px-3 py-2">منفی</th><th class="px-3 py-2">سؤالی</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We <b>watched</b> the film.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We <b>didn't watch</b> the film.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Did</b> you <b>watch</b> the film?</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The bird <b>flew</b> south.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The bird <b>didn't fly</b> south.</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Did</b> the bird <b>fly</b> south?</td></tr>
      </tbody></table></div>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-indigo-700 text-white"><th class="px-3 py-2">فعل بی‌قاعده</th><th class="px-3 py-2">گذشته</th><th class="px-3 py-2">معنی</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">go / see / fly</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">went / saw / flew</td><td class="px-3 py-2 border-t border-stone-100">رفت / دید / پرواز کرد</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">make / take / find</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">made / took / found</td><td class="px-3 py-2 border-t border-stone-100">ساخت / برد / یافت</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">swim / sing / hide</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">swam / sang / hid</td><td class="px-3 py-2 border-t border-stone-100">شنا کرد / خواند / پنهان کرد</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکتهٔ کنکوری:</b> بعد از ${EN(
        "did/didn't"
      )} همیشه «شکل سادهٔ فعل» می‌آید: ${EN(
        "Did you <b>see</b> it? (NOT: did you saw)"
      )} — اما در جملهٔ مثبتِ بی‌قاعده، شکل دوم: ${EN("He <b>saw</b> it.")}</div>`,
  },
  {
    title: "صفت‌های تفضیلی (Comparatives)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای مقایسهٔ دو چیز از صفت تفضیلی + ${EN("than")} استفاده می‌کنیم. قاعدهٔ ساخت بسته به طول صفت تغییر می‌کند:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-indigo-700 text-white"><th class="px-3 py-2">نوع صفت</th><th class="px-3 py-2">قاعده</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">یک‌بخشی (کوتاه)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">+ er</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">A cheetah is <b>faster than</b> a lion.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">پایان با e</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">+ r</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">A whale is <b>larger than</b> a shark.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">یک‌بخشیِ CVC</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">حرفِ آخر دوبار + er</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">An owl's eye is <b>bigger than</b> ours.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">دوبخشیِ بلند</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">more + صفت</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Dolphins are <b>more intelligent than</b> fish.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">بی‌قاعده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">good→better / bad→worse</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Its memory is <b>better than</b> mine.</td></tr>
      </tbody></table></div>`,
  },
  {
    title: "صفت‌های عالی و برابری (Superlatives + as ... as)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">صفت عالی، «برترینِ یک گروه» را نشان می‌دهد و معمولاً با ${EN("the")} می‌آید:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-indigo-700 text-white"><th class="px-3 py-2">نوع صفت</th><th class="px-3 py-2">قاعده</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">کوتاه</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">the + est</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The eagle was <b>the fastest</b> hunter.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">بلند</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">the most + صفت</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">It was <b>the most amazing</b> program.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">بی‌قاعده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">the best / the worst</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">It had <b>the best</b> pictures.</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای «برابریِ دو چیز» از ساختِ ${EN(
        "as + صفت + as"
      )} استفاده می‌کنیم و در منفی، ${EN("not as ... as")} یعنی «کمتر از»:</p>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">${EN(
        "A spider's web is <b>as strong as</b> steel. / A turtle is <b>not as fast as</b> a rabbit."
      )}</p>
      <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm leading-7 text-indigo-900">💡 <b>نکتهٔ کنکوری:</b> عالیِ صفت‌های دوبخشی هرگز «est» نمی‌گیرد: ${EN(
        "the most beautiful (NOT: the beautifulest)"
      )} — و تفضیلیِ همان صفت با more است، نه «more + er».</div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l8-w1", fa: "دیشب مستند طبیعت را دیدیم.", answer: ["We", "watched", "the", "nature", "documentary", "last", "night"], hint: "گذشتهٔ ساده: فعل باقاعده + ed" },
  { id: "l8-w2", fa: "شتر هفته‌ها بدون آب زنده ماند.", answer: ["The", "camel", "survived", "weeks", "without", "water"], hint: "گذشتهٔ survive → survived" },
  { id: "l8-w3", fa: "پرنده‌ها به سمت جنوب پرواز کردند.", answer: ["The", "birds", "flew", "south"], hint: "گذشتهٔ بی‌قاعدهٔ fly → flew" },
  { id: "l8-w4", fa: "کوسه از ماهیِ معمولی بزرگ‌تر است.", answer: ["The", "shark", "is", "bigger", "than", "an", "ordinary", "fish"], hint: "مقایسه: تفضیلی + than" },
  { id: "l8-w5", fa: "دلفین‌ها از بیشتر ماهی‌ها باهوش‌ترند.", answer: ["Dolphins", "are", "more", "intelligent", "than", "most", "fish"], hint: "صفت بلند → more + صفت" },
  { id: "l8-w6", fa: "عقاب سریع‌ترین شکارچیِ فیلم بود.", answer: ["The", "eagle", "was", "the", "fastest", "hunter", "in", "the", "film"], hint: "عالی: the + est" },
  { id: "l8-w7", fa: "این شگفت‌انگیزترین برنامهٔ کل سال بود.", answer: ["This", "was", "the", "most", "amazing", "program", "of", "the", "year"], hint: "صفت بلند → the most" },
  { id: "l8-w8", fa: "لاک‌پشت به‌اندازهٔ خرگوش تند نیست.", answer: ["A", "turtle", "is", "not", "as", "fast", "as", "a", "rabbit"], hint: "کمتر از: not as + صفت + as" },
];

const synonyms = [
  SYN("amazing", "astonishing", "شگفت‌انگیز ↔ حیرت‌آور"),
  SYN("incredible", "unbelievable", "باورنکردنی ↔ ناباور"),
  SYN("strange", "odd", "عجیب ↔ ناآشنا"),
  SYN("unique", "one of a kind", "بی‌همتا ↔ یکتا"),
  SYN("precious", "priceless", "گران‌بها ↔ بی‌بها"),
  SYN("valuable", "worthwhile", "ارزشمند ↔ باارزش"),
  SYN("intelligent", "clever", "باهوش ↔ زیرک"),
  SYN("journey", "trip", "سفر ↔ سفر"),
  SYN("search", "look for", "جست‌وجو کردن ↔ دنبال گشتن"),
  SYN("hide", "conceal", "پنهان کردن ↔ مستور کردن"),
  SYN("defend", "protect", "دفاع کردن ↔ حفاظت کردن"),
  SYN("escape", "flee", "فرار کردن ↔ گریختن"),
  SYN("gentle", "mild", "ملایم ↔ نرم"),
  SYN("deep", "profound", "عمیق ↔ ژرف"),
  SYN("creature", "being", "موجود ↔ موجود"),
  SYN("wonder", "marvel", "شگفتی ↔ اعجوبه"),
];

const antonyms = [
  ANT("amazing", "ordinary", "شگفت‌انگیز ↔ معمولی"),
  ANT("unique", "common", "بی‌همتا ↔ رایج"),
  ANT("precious", "worthless", "گران‌بها ↔ بی‌ارزش"),
  ANT("strong", "weak", "قوی ↔ ضعیف"),
  ANT("deep", "shallow", "عمیق ↔ کم‌عمق"),
  ANT("high", "low", "بلند ↔ کوتاه"),
  ANT("fast", "slow", "سریع ↔ آهسته"),
  ANT("heavy", "light", "سنگین ↔ سبک"),
  ANT("gentle", "violent", "ملایم ↔ خشن"),
  ANT("enemy", "friend", "دشمن ↔ دوست"),
  ANT("appear", "hide", "ظاهر شدن ↔ پنهان شدن"),
  ANT("remember", "forget", "به یاد داشتن ↔ فراموش کردن"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۱۵ تست) ----------------
  Q("l8-v1", "vocab", "The world is full of ---------------- creatures that surprise scientists every day.", ["amazing", "ordinary", "gentle", "strange"], 0, "دنیا پُر از موجودات شگفت‌انگیزی است که هر روز دانشمندان را غافلگیر می‌کنند."),
  Q("l8-v2", "vocab", "A camel can ---------------- for weeks in the desert without drinking water.", ["survive", "fly", "swim", "hide"], 0, "شتر می‌تواند هفته‌ها در بیابان بدون نوشیدن آب زنده بماند."),
  Q("l8-v3", "vocab", "The camel stores fat in its ----------------, not water.", ["hump", "wing", "beak", "fin"], 0, "شتر چربی را در کوهانش ذخیره می‌کند، نه آب."),
  Q("l8-v4", "vocab", "Owls hunt at night because they can ---------------- well in the dark.", ["see", "sing", "swim", "jump"], 0, "جغدها شب‌ها شکار می‌کنند چون در تاریکی خوب می‌بینند."),
  Q("l8-v5", "vocab", "Every autumn, thousands of birds ---------------- between their summer and winter homes.", ["migrate", "hatch", "freeze", "climb"], 0, "هر پاییز هزاران پرنده بین خانه‌های تابستانی و زمستانی‌شان مهاجرت می‌کنند."),
  Q("l8-v6", "vocab", "A spider's web is ---------------- than steel of the same weight.", ["stronger", "heavier", "longer", "deeper"], 0, "تارعنکبوت از فولادِ هم‌وزنِ خود قوی‌تر است."),
  Q("l8-v7", "vocab", "Dolphins ---------------- with each other by making special sounds under the water.", ["communicate", "escape", "search", "defend"], 0, "دلفین‌ها با ساختن صداهای خاص زیر آب با هم ارتباط برقرار می‌کنند."),
  Q("l8-v8", "vocab", "The eagle ---------------- down from the sky and caught its prey in one second.", ["dove", "froze", "hid", "climbed"], 0, "عقاب از آسمان شیرجه زد و طعمه‌اش را در یک ثانیه گرفت."),
  Q("l8-v9", "vocab", "Snakes use their ---------------- tongue to smell the air around them.", ["long", "short", "heavy", "gentle"], 0, "مارها از زبان بلندشان برای بویدن هوای اطراف استفاده می‌کنند."),
  Q("l8-v10", "vocab", "Baby birds ---------------- from their eggs in the warm nest.", ["hatch", "migrate", "hunt", "dive"], 0, "پرنده‌های کوچک در لانهٔ گرم از تخم‌هایشان بیرون می‌آیند."),
  Q("l8-v11", "vocab", "Some fish have sharp ---------------- on their bodies to defend themselves.", ["spots", "horns", "webs", "eggs"], 0, "بعضی ماهی‌ها برای دفاع از خود، شاخ‌های تیزی روی بدن دارند."),
  Q("l8-v12", "vocab", "The blue whale is the ---------------- animal that has ever lived on the earth.", ["largest", "smallest", "fastest", "weakest"], 0, "نهنگ آبی بزرگ‌ترین حیوانی است که تاکنون روی زمین زندگی کرده است."),
  Q("l8-v13", "vocab", "When the hunter came near, the rabbit ---------------- behind a big rock.", ["hid", "flew", "sang", "spoke"], 0, "وقتی شکارچی نزدیک شد، خرگوش پشتِ یک سنگ بزرگ پنهان شد."),
  Q("l8-v14", "vocab", "Scientists are still ---------------- for the meaning of the whales' songs.", ["searching", "hearing", "catching", "migrating"], 0, "دانشمندان هنوز دنبال معنای آهنگ‌های نهنگ‌ها می‌گردند."),
  Q("l8-v15", "vocab", "A ---------------- butterfly has colorful patterns on its beautiful wings.", ["butterfly", "shark", "camel", "owl"], 0, "پروانه الگوهای رنگارنگی روی بال‌های زیبایش دارد."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l8-k1", "vocab-konkuri", "The story of the creation of the earth is ----------------; no one can believe it easily.", ["unbelievable", "ordinary", "gentle", "valuable"], 0, "داستانِ آفرینش زمین باورنکردنی است؛ کسی به‌سادگی نمی‌تواند آن را باور کند."),
  Q("l8-k2", "vocab-konkuri", "Each snowflake has a ---------------- pattern; no two are exactly the same.", ["unique", "common", "poisonous", "gentle"], 0, "هر دانهٔ برف الگویی بی‌همتا دارد؛ هیچ دو تایی دقیقاً یکسان نیستند."),
  Q("l8-k3", "vocab-konkuri", "Some mushrooms are ----------------, so you must never eat wild ones.", ["poisonous", "precious", "gentle", "unique"], 0, "بعضی قارچ‌ها سمی‌اند، پس هرگز نباید قارچ‌های وحشی را خورد."),
  Q("l8-k4", "vocab-konkuri", "The ---------------- of the mountain echo came back three seconds later.", ["sound", "fur", "claw", "spot"], 0, "صدای پژواکِ کوه سه ثانیه بعد برگشت."),
  Q("l8-k5", "vocab-konkuri", "The bear's thick ---------------- keeps it warm in the freezing winter.", ["fur", "feather", "fin", "beak"], 0, "خزِ ضخیمِ خرس آن را در زمستانِ یخ‌زده گرم نگه می‌دارد."),
  Q("l8-k6", "vocab-konkuri", "Rulers in the past wore ---------------- jewels on their special clothes.", ["precious", "ordinary", "poisonous", "gentle"], 0, "فرمانروایانِ گذشته جواهرات گران‌بها روی لباس‌های خاصشان می‌پوشیدند."),
  Q("l8-k7", "vocab-konkuri", "Water ---------------- at zero degrees and becomes ice.", ["freezes", "escapes", "survives", "migrates"], 0, "آب در درجهٔ صفر یخ می‌زند و به یخ تبدیل می‌شود."),
  Q("l8-k8", "vocab-konkuri", "The bee's dance is a special ---------------- that shows the way to flowers.", ["signal", "spot", "tail", "shell"], 0, "رقصِ زنبور سیگنالِ خاصی است که راهِ گل‌ها را نشان می‌دهد."),
  Q("l8-k9", "vocab-konkuri", "Whales are the biggest animals on the earth, but they are surprisingly ---------------- with humans.", ["gentle", "poisonous", "frozen", "strange"], 0, "نهنگ‌ها بزرگ‌ترین حیوانات زمین‌اند، اما شگفت‌آور است که با انسان‌ها ملایم‌اند."),
  Q("l8-k10", "vocab-konkuri", "The eagle's sharp eyes can ---------------- a small rabbit from a great height.", ["spot", "freeze", "hatch", "escape"], 0, "چشمانِ تیزِ عقاب می‌تواند از ارتفاعِ زیاد یک خرگوش کوچک را ببیند."),
  Q("l8-k11", "vocab-konkuri", "We heard voices when we drew ---------------- the village.", ["far", "near", "real", "above"], 1, "وقتی به روستا نزدیک شدیم صدایی شنیدیم."),
  Q("l8-k12", "vocab-konkuri", "The first ---------------- of rain fell down on the ground yesterday and we enjoyed a lot.", ["drops", "pumps", "liquids", "signs"], 0, "اولین قطره‌های باران دیروز روی زمین نشست و خیلی خوشحال شدیم."),
  Q("l8-k13", "vocab-konkuri", "Have you ever explored the ---------------- of other planets?", ["powers", "signs", "wonders", "types"], 2, "آیا تا حالا شگفتی‌های سیاراتِ دیگر را کاویده‌ای؟"),
  Q("l8-k14", "vocab-konkuri", "He went around the office ---------------- old coffee cups.", ["carrying", "creating", "orbiting", "collecting"], 3, "دورِ دفتر می‌گشت و لیوان‌های قهوهٔ کهنه را جمع می‌کرد."),
  Q("l8-k15", "vocab-konkuri", "Crying is seen as a ---------------- of weakness among some people in bad situations.", ["system", "sign", "power", "ring"], 1, "گریه نزدِ برخی مردم در موقعیت‌های بد نشانهٔ ضعف دیده می‌شود."),
  // ---------------- گرامر (۱۵ تست) ----------------
  Q("l8-g1", "grammar", "We ---------------- the wildlife documentary last night.", ["watched", "watch", "are watching", "will watch"], 0, "مستند حیات وحش را دیشب دیدیم.", "قیدِ گذشته last night → گذشتهٔ ساده."),
  Q("l8-g2", "grammar", "The birds ---------------- south when the cold weather arrived.", ["flew", "fly", "flied", "flying"], 0, "پرنده‌ها وقتی هوای سرد رسید، به سمت جنوب پرواز کردند.", "گذشتهٔ بی‌قاعدهٔ fly → flew."),
  Q("l8-g3", "grammar", "---------------- you ---------------- the dolphin show last week?", ["Did / see", "Did / saw", "Do / saw", "Were / see"], 0, "نمایش دلفین‌ها را هفتهٔ گذشته دیدی؟", "بعد از did شکل سادهٔ فعل می‌آید."),
  Q("l8-g4", "grammar", "The explorers ---------------- any water in the dry desert.", ["didn't find", "didn't found", "not found", "don't found"], 0, "کاشف‌ها هیچ آبی در کویرِ خشک پیدا نکردند.", "منفیِ گذشته: didn't + شکل ساده."),
  Q("l8-g5", "grammar", "She ---------------- her keys somewhere in the park yesterday.", ["left", "leaved", "leave", "leaving"], 0, "دیروز کلیدهایش را جای‌ای در پارک جا گذاشت.", "گذشتهٔ leave → left (بی‌قاعده)."),
  Q("l8-g6", "grammar", "A cheetah is ---------------- a house cat.", ["faster than", "fast than", "more fast than", "the fastest"], 0, "یوزپلنگ از گربهٔ خانگی سریع‌تر است.", "تفضیلیِ کوتاه: er + than."),
  Q("l8-g7", "grammar", "Dolphins are considered ---------------- many other animals.", ["more intelligent than", "intelligenter than", "most intelligent than", "as intelligent"], 0, "دلفین‌ها از بسیاری حیوانات دیگر باهوش‌تر شمرده می‌شوند.", "صفت بلند → more + صفت + than."),
  Q("l8-g8", "grammar", "My new camera takes ---------------- pictures than the old one.", ["better", "more good", "gooder", "the best"], 0, "دوربینِ جدیدم عکس‌های بهتری از قبلی می‌گیرد.", "تفضیلیِ بی‌قاعدهٔ good → better."),
  Q("l8-g9", "grammar", "The blue whale is ---------------- animal on the earth.", ["the largest", "the larger", "largest than", "more large"], 0, "نهنگ آبی بزرگ‌ترین حیوان روی زمین است.", "عالی: the + est."),
  Q("l8-g10", "grammar", "That was ---------------- program I have ever watched.", ["the most amazing", "the more amazing", "most amazing than", "the amazest"], 0, "آن شگفت‌انگیزترین برنامه‌ای بود که تاکنون دیده‌ام.", "عالیِ صفت بلند: the most."),
  Q("l8-g11", "grammar", "Of all the hunters in the film, the eagle worked ----------------.", ["the hardest", "harder than", "more hard", "the harder"], 0, "از میان همهٔ شکارچی‌های فیلم، عقاب سخت‌کوش‌ترین بود.", "عالیِ قید hard → the hardest."),
  Q("l8-g12", "grammar", "A spider's web is ---------------- steel of the same weight.", ["as strong as", "so strong as", "stronger as", "as stronger as"], 0, "تارعنکبوت به‌اندازهٔ فولادِ هم‌وزنِ خود قوی است.", "برابری: as + صفت + as."),
  Q("l8-g13", "grammar", "A turtle is ---------------- a rabbit, so it always loses the race.", ["not as fast as", "as fast as", "not faster as", "so fast as"], 0, "لاک‌پشت به‌اندازهٔ خرگوش تند نیست، پس همیشه مسابقه را می‌بازد.", "کمتر از: not as + صفت + as."),
  Q("l8-g14", "grammar", "Winter in this city is ---------------- summer.", ["colder than", "the coldest", "more cold than", "cold than"], 0, "زمستانِ این شهر از تابستان سردتر است.", "تفضیلی + than؛ صفت کوتاه cold → colder."),
  Q("l8-g15", "grammar", "The children were excited because they ---------------- a real owl in the forest.", ["saw", "see", "are seeing", "sees"], 0, "بچه‌ها ذوق‌زده بودند چون یک جغدِ واقعی در جنگل دیدند.", "گذشتهٔ بی‌قاعدهٔ see → saw."),
];

export const lesson8: LessonData = {
  id: 8,
  titleEn: "Wonders of Creation",
  titleFa: "شگفتی‌های آفرینش",
  tagline: "حیوانات شگفت‌انگیز، مهاجرت و گذشتهٔ ساده با تفضیلی/عالی",
  color: "indigo",
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

export default lesson8;
