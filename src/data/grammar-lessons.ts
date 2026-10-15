// ---------------------------------------------------------------------
// متروی گرامر — درس‌های ۹۰ثانیه‌ای PPP (Task 40: خط‌های ۱-۲ / Task 41:
// خط‌های ۳-۶ / راند ۱۹۶: خط‌های ۷-۱۱ ← حالا هر ۳۴ ایستگاه نقشه درس دارند)
// docs/grammar-roadmap.md بخش ۵-۱:
//
//   ۱) «ببین»    — جملهٔ رنگی: هر نقش (فاعل/فعل/مفعول/کمکی/باقی) رنگ
//                  ثابت خودش را دارد و چشم قاعده را از روی رنگ می‌خواند؛
//                  برای زمان‌ها یک «نوار زمان» هم جای فعل را نشان می‌دهد.
//   ۲) «بفهم»    — آینهٔ فارسی: جملهٔ فارسی و انگلیسی‌اش کنار هم و
//                  توضیح صادقانهٔ اینکه انگلیسی چه چیزی اضافه می‌کند؛
//                  + غلط کلاسیک ایرانی‌ها و چراییِ درست‌بودن.
//   ۳) «امتحان کن» — دقیقاً ۳ سؤال سریع؛ هر غلط دکمهٔ «چرا اشتباه شد؟»
//                  دارد (قالب ثابت — دستیار «چرا؟» نقشهٔ راه).
//
// محتوا «دادهٔ ساخت‌یافته» است نه کد (بخش ۱۱ نقشهٔ راه) — ویرایش بعدی
// یعنی ویرایش همین جدول‌ها. رنگ‌ها فقط شش‌تا و هماهنگ با نقشهٔ مترو:
// فاعل=emerald، فعل=rose، مفعول=amber، کمکی=violet، باقی=خنثی.
// ---------------------------------------------------------------------

/** نقش‌های رنگی جمله — رنگ هر نقش در همهٔ درس‌ها ثابت است */
export type SentenceRole = "subject" | "verb" | "object" | "aux" | "rest";

export const ROLE_LABELS: Record<SentenceRole, string> = {
  subject: "فاعل",
  verb: "فعل اصلی",
  object: "مفعول",
  aux: "فعل کمکی",
  rest: "باقی جمله",
};

/** تکه‌های جملهٔ «ببین» */
export interface ColoredPiece {
  text: string;
  role: SentenceRole;
}

/** نوار زمانِ درس‌های زمانی — marker جای پرچم روی خط (۰=گذشته … ۱۰۰=آینده) */
export interface TimeBar {
  label: string; // «گذشته ← اکنون» و…
  marker: number; // 0..100
}

/** آینهٔ فارسی — «بفهم» */
export interface MirrorPair {
  fa: string; // جملهٔ فارسی
  en: string; // همان جمله به انگلیسی
  adds: string; // انگلیسی چه چیزی دارد که فارسی ندارد
  mistake: {
    wrong: string; // غلط کلاسیک ایرانی‌ها
    right: string; // شکل درست
    why: string; // یک جملهٔ سادهٔ چرایی
  };
}

/** سؤال «امتحان کن» — همیشه ۳تا؛ چرای غلط با قالب ثابت */
export interface TryQuestion {
  prompt: string; // جای خالی با ___
  options: string[];
  answer: number; // ایندکس گزینهٔ درست
  why: string; // «چرا اشتباه شد؟» — قالب: قاعده + شکل درست
}

export interface GrammarMicroLesson {
  stationId: string; // ارجاع به GRAMMAR_LINES (data/grammar-map.ts)
  hook: string; // جملهٔ شروعِ خودمانی — «چرا این ایستگاه مهم است»
  see: {
    pieces: ColoredPiece[];
    timebar?: TimeBar; // فقط درس‌های زمان‌محور
    note: string; // چیزی که چشم باید ببیند
  };
  mirrors: MirrorPair[]; // ۱ تا ۲ جفت
  try: TryQuestion[]; // دقیقاً ۳ سؤال
}

export const GRAMMAR_MICRO_LESSONS: GrammarMicroLesson[] = [
  // ------------------------------------------------ خط ۱ — ترتیب اجزای جمله
  {
    stationId: "g-order",
    hook: "دانش‌آموزِ درس‌خون، جمله‌های غلط می‌سازد چون ترتیب فارسی را به انگلیسی می‌آورد. این ایستگاه همان‌جا را درست می‌کند.",
    see: {
      pieces: [
        { text: "I", role: "subject" },
        { text: "saw", role: "verb" },
        { text: "him", role: "object" },
        { text: "in the park", role: "rest" },
        { text: "yesterday", role: "rest" },
      ],
      timebar: { label: "گذشته — دیدم و تمام شد", marker: 15 },
      note: "قیدها به ترتیب می‌آیند: حالت ← مکان ← زمان. yesterday همیشه نزدیک نقطه است.",
    },
    mirrors: [
      {
        fa: "من دیروز او را در پارک دیدم.",
        en: "I saw him in the park yesterday.",
        adds: "فارسی مفعول را با «را» نشان می‌دهد و جای قیدها آزاد است؛ انگلیسی فاعل-فعل-مفعول را سفت‌وسخت رعایت می‌کند و قید زمان را می‌برد آخر جمله.",
        mistake: {
          wrong: "I saw yesterday him in the park.",
          right: "I saw him in the park yesterday.",
          why: "قید زمان (yesterday) هرگز وسط جمله و بین فعل و مفعول نمی‌نشیند؛ جای قانونی‌اش آخر جمله است.",
        },
      },
      {
        fa: "او انگلیسی را خوب حرف می‌زند.",
        en: "He speaks English well.",
        adds: "قید حالت (well) در انگلیسی بعد از مفعول می‌آید؛ فارسی همان «خوب» را هرجای جمله می‌گذارد.",
        mistake: {
          wrong: "He speaks well English.",
          right: "He speaks English well.",
          why: "قید حالت بعد از مفعول می‌نشیند، نه وسط فعل و مفعول — فعل و مفعول همدیگر را ول نمی‌کنند.",
        },
      },
    ],
    try: [
      {
        prompt: "My father ___ every morning.",
        options: ["in the park walks", "walks in the park", "walks park the in"],
        answer: 1,
        why: "فعل بلافاصله بعد از فاعل می‌آید و قید مکان بعد از فعل: walks in the park.",
      },
      {
        prompt: "She wrote a letter ___ .",
        options: ["last night", "night last", "last a night"],
        answer: 0,
        why: "قید زمان به آخر جمله می‌رود: last night.",
      },
      {
        prompt: "The teacher explained the lesson ___ .",
        options: ["very good", "clearly slow", "very clearly"],
        answer: 2,
        why: "قید حالت بعد از مفعول می‌آید: explained the lesson very clearly.",
      },
    ],
  },

  // ------------------------------------------------ خط ۲ — اسامی و کمیت
  {
    stationId: "g-count",
    hook: "در فارسی «دو سیب» می‌گوییم و سیب جمع نمی‌شود؛ انگلیسی حرف آخر را می‌زند و apple جمع می‌خواهد.",
    see: {
      pieces: [
        { text: "I", role: "subject" },
        { text: "have", role: "verb" },
        { text: "two apples", role: "object" },
        { text: "and", role: "rest" },
        { text: "an orange", role: "object" },
      ],
      note: "عددِ بیش از یک ← اسم جمع می‌شود؛ اسم مفردِ تنها هیچ‌وقت بدون a/an نمی‌ماند.",
    },
    mirrors: [
      {
        fa: "من دو سیب دارم.",
        en: "I have two apples.",
        adds: "فارسی با «دو» کفایت می‌کند؛ انگلیسی هم عدد می‌گذارد هم اسم را جمع می‌کند — double sign.",
        mistake: {
          wrong: "I have two apple.",
          right: "I have two apples.",
          why: "بعد از عددِ بیش از یک، اسم قابل شمارش حتماً جمع می‌شود: two apples.",
        },
      },
      {
        fa: "یک پرتقال خریدم.",
        en: "I bought an orange.",
        adds: "فارسی اسم مفرد را تنها می‌گذارد؛ انگلیسی هیچ اسم مفردِ قابل شمارشی را بدون a/an رها نمی‌کند.",
        mistake: {
          wrong: "I bought orange.",
          right: "I bought an orange.",
          why: "اسم مفردِ قابل شمارش هرگز برهنه نمی‌آید؛ باید a/an یا the بگیرد.",
        },
      },
    ],
    try: [
      {
        prompt: "There are three ___ in the yard.",
        options: ["cats", "a cat", "cat"],
        answer: 0,
        why: "بعد از عدد سه اسم جمع می‌شود: three cats.",
      },
      {
        prompt: "I saw ___ elephant at the zoo.",
        options: ["a", "___", "an"],
        answer: 2,
        why: "elephant با صدای مصوت شروع می‌شود؛ پس an می‌گیرد نه a.",
      },
      {
        prompt: "She is reading ___ interesting book.",
        options: ["an", "a", "much"],
        answer: 0,
        why: "interesting با صدای مصوت شروع می‌شود؛ پس an می‌گیرد و book مفرد قابل شمارش است — هرگز تنها نمی‌ماند.",
      },
    ],
  },
  {
    stationId: "g-uncount",
    hook: "آب، اطلاعات، تکلیف… در انگلیسی این‌ها شن می‌خورند: جمع نمی‌شوند و مفرد می‌مانند.",
    see: {
      pieces: [
        { text: "I", role: "subject" },
        { text: "drank", role: "verb" },
        { text: "some water", role: "object" },
        { text: "before class", role: "rest" },
      ],
      note: "water همیشه مفرد است — بعضی اسم‌ها هرگز جمع نمی‌شوند.",
    },
    mirrors: [
      {
        fa: "کمی آب خوردم.",
        en: "I drank some water.",
        adds: "فارسی «کمی» می‌گوید و تمام؛ انگلیسی برای غیرقابل شمارش some/much/little می‌گذارد و اسم را مفرد نگه می‌دارد.",
        mistake: {
          wrong: "I drank many waters.",
          right: "I drank some water.",
          why: "water غیرقابل شمارش است؛ با much/some می‌آید و هرگز جمع نمی‌شود و many نمی‌گیرد.",
        },
      },
      {
        fa: "تکالیف زیادی دارم.",
        en: "I have a lot of homework.",
        adds: "فارسی «تکالیف» جمع است؛ homework در انگلیسی یک تودهٔ مفرد است که جمع ندارد.",
        mistake: {
          wrong: "I have many homeworks.",
          right: "I have a lot of homework.",
          why: "homework غیرقابل شمارش است — homeworks هرگز ساخته نمی‌شود؛ با a lot of/much می‌آید.",
        },
      },
    ],
    try: [
      {
        prompt: "There ___ some milk in the glass.",
        options: ["is", "are", "be"],
        answer: 0,
        why: "milk غیرقابل شمارش و مفرد است؛ پس is می‌گیرد نه are.",
      },
      {
        prompt: "How ___ money do you need?",
        options: ["many", "few", "much"],
        answer: 2,
        why: "money غیرقابل شمارش است؛ سؤالش much است نه many.",
      },
      {
        prompt: "I need some ___ .",
        options: ["informations", "information", "an information"],
        answer: 1,
        why: "information هرگز جمع نمی‌شود و a نمی‌گیرد: some information.",
      },
    ],
  },
  {
    stationId: "g-uncount-groups",
    hook: "غیرقابل شمارش‌ها چهار دستهٔ بزرگ‌اند: ماده، سیال، انتزاعی، مجموعه. دسته را بشناسی، قاعده را می‌فهمی.",
    see: {
      pieces: [
        { text: "The luggage", role: "subject" },
        { text: "is", role: "verb" },
        { text: "heavy", role: "rest" },
      ],
      note: "luggage مجموعه است اما مفرد است — is می‌گیرد نه are.",
    },
    mirrors: [
      {
        fa: "دو قرص نان خریدم.",
        en: "I bought two loaves of bread.",
        adds: "فارسی نان را با قرص می‌شمارد؛ انگلیسی هم ماده را جمع نمی‌کند و «واحد شمارش» جمع می‌شود: loaves.",
        mistake: {
          wrong: "I bought two breads.",
          right: "I bought two loaves of bread.",
          why: "bread ماده است و جمع نمی‌شود؛ شمارشش با واحد است: two loaves of bread.",
        },
      },
      {
        fa: "مشورت‌های خوبی گرفتم.",
        en: "I got some good advice.",
        adds: "advice انتزاعی است و جمع ندارد؛ فارسی «مشورت‌ها» جمع می‌کند ولی انگلیسی نمی‌کند.",
        mistake: {
          wrong: "I got many advices.",
          right: "I got some good advice.",
          why: "advice غیرقابل شمارش است — advices غلط است؛ «یک مشورت» می‌شود a piece of advice.",
        },
      },
    ],
    try: [
      {
        prompt: "There are three ___ in the room.",
        options: ["chairs", "furniture", "luggages"],
        answer: 0,
        why: "furniture و luggage غیرقابل شمارش‌اند و هرگز جمع نمی‌شوند؛ فقط chairs (قابل شمارش) بعد از three جمع می‌شود.",
      },
      {
        prompt: "Please give me ___ of advice.",
        options: ["two pieces", "pieces", "a piece"],
        answer: 2,
        why: "advice با واحد piece شمرده می‌شود: a piece of advice.",
      },
      {
        prompt: "The news ___ very good today.",
        options: ["are", "is", "were"],
        answer: 1,
        why: "news با اینکه به جمع شبیه است، غیرقابل شمارش و مفرد است: the news is.",
      },
    ],
  },
  {
    stationId: "g-quantity",
    hook: "برای شمردن ماده، خودِ ماده جمع نمی‌شود؛ واحدِ شمارش جمع می‌شود — مثل فارسیِ «دو لیوان آب».",
    see: {
      pieces: [
        { text: "I", role: "subject" },
        { text: "bought", role: "verb" },
        { text: "two bottles of water", role: "object" },
      ],
      note: "bottles جمع شد، water مفرد ماند — کمیت روی واحد سوار می‌شود.",
    },
    mirrors: [
      {
        fa: "دو لیوان آب خوردم.",
        en: "I drank two glasses of water.",
        adds: "فارسی «لیوان» را جمع می‌کند؛ انگلیسی دقیقاً همان کار را می‌کند — فقط به‌جای لیوان، glass جمع می‌شود.",
        mistake: {
          wrong: "I drank two water.",
          right: "I drank two glasses of water.",
          why: "آبِ خالی شمرده نمی‌شود؛ باید واحد شمارش بیاید: two glasses of water.",
        },
      },
      {
        fa: "پول زیادی دارم.",
        en: "I have a lot of money.",
        adds: "با غیرقابل شمارش‌ها much/a lot of می‌آید؛ many فقط برای قابل شمارش‌هاست.",
        mistake: {
          wrong: "I have many money.",
          right: "I have a lot of money.",
          why: "money غیرقابل شمارش است؛ many نمی‌گیرد — a lot of/much می‌گیرد.",
        },
      },
    ],
    try: [
      {
        prompt: "I need three ___ of bread.",
        options: ["loaves", "loaf", "loafs"],
        answer: 0,
        why: "واحد شمارش جمع می‌شود و جمعِ loaf بی‌قاعده است: loaves.",
      },
      {
        prompt: "How ___ students are there?",
        options: ["much", "a lot", "many"],
        answer: 2,
        why: "students قابل شمارش است؛ پس many.",
      },
      {
        prompt: "There are two ___ of milk in the fridge.",
        options: ["carton", "cartons", "milk cartonses"],
        answer: 1,
        why: "واحد شمارش جمع می‌شود: two cartons of milk — خودِ milk مفرد می‌ماند.",
      },
    ],
  },
  {
    stationId: "g-numbers",
    hook: "چهل‌تا چهل‌تا حرف می‌زنیم ولی انگلیسی «چهل» را عجیب می‌نویسد: forty بی‌یو! خط تیره‌اش هم قانون دارد.",
    see: {
      pieces: [
        { text: "My grandmother", role: "subject" },
        { text: "is", role: "verb" },
        { text: "eighty-nine", role: "rest" },
        { text: "years old", role: "rest" },
      ],
      note: "خط تیره فقط بین دهگان و یکان می‌نشیند: eighty-nine.",
    },
    mirrors: [
      {
        fa: "مادربزرگم هشتادونه سالش است.",
        en: "My grandmother is eighty-nine years old.",
        adds: "انگلیسی عدد ترکیبی را با خط تیره می‌نویسد و «سال» را جمع می‌کند: years — فارسی هر دو را پنهان می‌کند.",
        mistake: {
          wrong: "My grandmother is eighty nine year old.",
          right: "My grandmother is eighty-nine years old.",
          why: "بین دهگان و یکان خط تیره لازم است و بعد از عددِ بیش از یک، year جمع می‌شود: years.",
        },
      },
      {
        fa: "دوصد دانش‌آموز آمدند.",
        en: "Two hundred students came.",
        adds: "بعد از عدد دقیق، hundred و thousand جمع نمی‌شوند؛ فارسی این تفاوت را اصلاً نشان نمی‌دهد.",
        mistake: {
          wrong: "Two hundreds students came.",
          right: "Two hundred students came.",
          why: "بعد از عدد دقیق hundred هرگز s نمی‌گیرد؛ hundreds فقط وقتی می‌آید که عدد مشخص نباشد: hundreds of students.",
        },
      },
    ],
    try: [
      {
        prompt: "My uncle is ___ years old.",
        options: ["forty", "fourty", "fourthy"],
        answer: 0,
        why: "عدد چهل در انگلیسی forty نوشته می‌شود — بدون u؛ این استثنای معروف است.",
      },
      {
        prompt: "There are ___ books on the shelf.",
        options: ["three hundreds", "three hundred", "three hundred of"],
        answer: 1,
        why: "بعد از عدد دقیق، hundred بدون s و بدون of می‌آید: three hundred books.",
      },
      {
        prompt: "My little brother is ___ years old.",
        options: ["thirty five", "thirtyfive", "thirty-five"],
        answer: 2,
        why: "اعداد ترکیبی بین دهگان و یکان خط تیره می‌گیرند: thirty-five.",
      },
    ],
  },

  // ------------------------------------------------ خط ۳ — حال کامل
  {
    stationId: "g-present-perfect",
    hook: "فارسی با یک «کرده‌ایم» کارش را راه می‌اندازد؛ انگلیسی برای همان یک کلمه حتماً have/has و شکل سوم فعل می‌خواهد — و پنج سرنخ طلا دارد که جایزه می‌دهد.",
    see: {
      pieces: [
        { text: "We", role: "subject" },
        { text: "have", role: "aux" },
        { text: "lived", role: "verb" },
        { text: "in Boukan", role: "rest" },
        { text: "since 1356", role: "rest" },
      ],
      timebar: { label: "از گذشته تا همین حالا — پل هنوز پابرجاست", marker: 88 },
      note: "have/has + شکل سوم فعل (p.p.)؛ سرنخ‌ها: since، for، just، ever، yet، already، so far.",
    },
    mirrors: [
      {
        fa: "ما از سال ۱۳۵۶ در بوکان زندگی کرده‌ایم.",
        en: "We have lived in Boukan since 1356.",
        adds: "فارسی همان «کرده‌ایم» کافی است؛ انگلیسی have + شکل سوم فعل می‌خواهد و since یعنی «از مبدأ زمان» نه «به مدت».",
        mistake: {
          wrong: "We are living in Boukan since 1356.",
          right: "We have lived in Boukan since 1356.",
          why: "since سرنخِ حال کامل است: عملی که از گذشته شروع شده و تا حال ادامه دارد — حال استمراری اینجا جایز نیست.",
        },
      },
      {
        fa: "دانش‌آموزهای من تا حال دو بار آن کتاب را خوانده‌اند.",
        en: "My students have read that book twice.",
        adds: "تعداد تکرار (twice) با حال کامل می‌آید؛ فارسی این دقت زمانی را نشان نمی‌دهد.",
        mistake: {
          wrong: "My students have read that book two times yesterday.",
          right: "My students have read that book twice.",
          why: "قید زمان دقیق گذشته (yesterday) با حال کامل جمع نمی‌شود — و «دو بار» می‌شود twice نه two times.",
        },
      },
    ],
    try: [
      {
        prompt: "My father ___ dinner.",
        options: ["has just cooked", "have just cooked", "just has cooked"],
        answer: 0,
        why: "father سوم‌شخص مفرد است → has؛ و just قبل از فعل اصلی می‌نشیند، نه بین فاعل و کمکی.",
      },
      {
        prompt: "They moved into a new apartment ___ .",
        options: ["last week", "since last week", "for last week"],
        answer: 0,
        why: "قید زمان دقیق گذشته (last week) قانونش گذشتهٔ ساده است — حال کامل هرگز با زمان دقیق گذشته نمی‌آید.",
      },
      {
        prompt: "Have you ___ been in England?",
        options: ["yet", "ever", "already"],
        answer: 1,
        why: "در سؤالِ تجربهٔ تا به حال از ever استفاده می‌شود؛ yet مال جملهٔ منفی و سؤالیِ «هنوز» است.",
      },
    ],
  },

  // ------------------------------------------------ خط ۴ — فعل‌های ترکیبی
  {
    stationId: "g-phrasal-insep",
    hook: "فارسی «از» را هرجای جمله می‌گذارد؛ انگلیسی حرف اضافهٔ مخصوص بعضی فعل‌ها را مثل قلاب از خودش جدا نمی‌کند و مفعول همیشه ته قلاب می‌نشیند.",
    see: {
      pieces: [
        { text: "She", role: "subject" },
        { text: "looks after", role: "verb" },
        { text: "her little brother", role: "object" },
        { text: "every day", role: "rest" },
      ],
      note: "فعل + حرف اضافهٔ مخصوص همیشه چسبیده‌اند (looks after) و مفعول — اسم یا ضمیر — بعد از حرف اضافه می‌آید.",
    },
    mirrors: [
      {
        fa: "او هر روز از برادر کوچکش مراقبت می‌کند.",
        en: "She looks after her little brother every day.",
        adds: "فارسی «مراقبت کردن از» را می‌شکند و جای مفعول آزاد است؛ انگلیسی look و after یکی‌اند و مفعول ته‌شان می‌نشیند.",
        mistake: {
          wrong: "She looks her little brother after every day.",
          right: "She looks after her little brother every day.",
          why: "فعل دوکلمه‌ای جدا نشدنی هرگز از حرف اضافهٔ مخصوصش جدا نمی‌شود؛ مفعول فقط بعد از حرف اضافه می‌آید.",
        },
      },
      {
        fa: "او با دقت به حرف‌های معلمش گوش می‌دهد.",
        en: "He listens to his teacher carefully.",
        adds: "انگلیسی listen بدون to بی‌معناست؛ فارسی «گوش دادن به» را در جمله ساده به «گوش می‌دهد» تبدیل می‌کند.",
        mistake: {
          wrong: "He listens carefully his teacher.",
          right: "He listens to his teacher carefully.",
          why: "حرف اضافهٔ مخصوصِ listen یعنی to قسمتی از خود فعل است — بین فعل و آن حرف اضافه چیزی نمی‌گنجد.",
        },
      },
    ],
    try: [
      {
        prompt: "Please ___ the baby while I am cooking.",
        options: ["look after", "after look", "look for after"],
        answer: 0,
        why: "look after یعنی مراقبت کردن؛ دو کلمه چسبیده می‌مانند و مفعول بعدشان می‌آید.",
      },
      {
        prompt: "This team ___ five players.",
        options: ["consist of", "consists of", "consists"],
        answer: 1,
        why: "consist همیشه of می‌خواهد (جدا نشدنی) و با فاعل مفرد s هم می‌گیرد: consists of.",
      },
      {
        prompt: "She is very good ___ mathematics.",
        options: ["of", "in", "at"],
        answer: 2,
        why: "صفت دوکلمه‌ای good at یعنی «خوب در» — حرف اضافهٔ مخصوصش at است نه in.",
      },
    ],
  },

  {
    stationId: "g-phrasal-sep",
    hook: "turn on با اسم آزاد است: turn the light on یا turn on the light؛ ولی ضمیر وسط گروگان می‌شود: turn it on — و Turn on it هرگز!",
    see: {
      pieces: [
        { text: "I", role: "subject" },
        { text: "turned", role: "verb" },
        { text: "the light", role: "object" },
        { text: "off", role: "rest" },
        { text: "and left", role: "rest" },
      ],
      note: "مفعول اسمی بین فعل و جزء قیدی یا بعد از آن آزاد است؛ ضمیر (it/them) فقط و فقط بین دو کلمه می‌آید.",
    },
    mirrors: [
      {
        fa: "چراغ را خاموش کن.",
        en: "Turn the light off.",
        adds: "فارسی مفعول را قبل از فعل می‌آورد؛ انگلیسی فعل و جزء قیدی قابل جداشدن‌اند و مفعول اسمی دو جای قانونی دارد.",
        mistake: {
          wrong: "Turn off it, please.",
          right: "Turn it off, please.",
          why: "ضمیر مفعولی فقط بین فعل و جزء قیدی می‌نشیند — ضمیر بعد از جزء قیدی ممنوع است.",
        },
      },
      {
        fa: "صدای رادیو را بالا بده.",
        en: "Turn the radio up.",
        adds: "جزء قیدی معنی فعل را عوض می‌کند (turn up ≠ turn down) و فارسی این معنی را داخل خود فعل پنهان کرده است.",
        mistake: {
          wrong: "Turn up it.",
          right: "Turn it up.",
          why: "همان قانون ضمیر: it بین turn و up می‌آید — Turn up it هرگز درست نیست.",
        },
      },
    ],
    try: [
      {
        prompt: "Your socks are on the floor. Please ___ .",
        options: ["pick up them", "pick them up", "them pick up"],
        answer: 1,
        why: "them ضمیر است و فقط بین فعل و جزء قیدی می‌آید: pick them up.",
      },
      {
        prompt: "I can't hear the news. ___ , please.",
        options: ["Turn it up", "Turn up it", "Up it turn"],
        answer: 0,
        why: "برای بلند کردن صدا turn up می‌آید و ضمیر وسط قرار می‌گیرد: Turn it up.",
      },
      {
        prompt: "Here is your coat — ___ before you go out.",
        options: ["Put on it", "Put it on", "Put it off"],
        answer: 1,
        why: "put on یعنی پوشیدن و با ضمیر حتماً می‌شکند: Put it on — put off یعنی به تعویق انداختن، نه پوشیدن.",
      },
    ],
  },

  {
    stationId: "g-gerund",
    hook: "بعد از بعضی فعل‌ها و همهٔ حروف اضافه، فعل دوم لباس ing می‌پوشد و در نقش اسم کار می‌کند — حتی می‌تواند فاعل جمله بشود.",
    see: {
      pieces: [
        { text: "He", role: "subject" },
        { text: "enjoys", role: "verb" },
        { text: "walking", role: "object" },
        { text: "in the park", role: "rest" },
      ],
      note: "بعد از enjoy/finish/avoid/imagine/keep/mind/suggest و بعد از هر حرف اضافه، فعل بعدی ing می‌گیرد.",
    },
    mirrors: [
      {
        fa: "او قدم زدن در پارک را دوست دارد.",
        en: "He enjoys walking in the park.",
        adds: "فارسی مفعول را با «را» قبل از فعل می‌آورد؛ انگلیسی بعد از enjoy فعل دوم ing می‌گیرد — نه to.",
        mistake: {
          wrong: "He enjoys to walk in the park.",
          right: "He enjoys walking in the park.",
          why: "enjoy جزو افعالی است که بعدشان مصدر با to نمی‌آید؛ فقط شکل ing قابل قبول است.",
        },
      },
      {
        fa: "او به جمع‌کردن تمبر علاقه‌مند است.",
        en: "She is interested in collecting stamps.",
        adds: "بعد از حرف اضافه (in) فعل همیشه ing می‌گیرد؛ فارسی این قاعده را اصلاً ندارد.",
        mistake: {
          wrong: "She is interested in collect stamps.",
          right: "She is interested in collecting stamps.",
          why: "بعد از حرف اضافه فعل خام نمی‌ماند؛ شکل ing اسم مصدر لازم است.",
        },
      },
    ],
    try: [
      {
        prompt: "___ in this river is dangerous.",
        options: ["Swimming", "Swim", "To swimming"],
        answer: 0,
        why: "اسم مصدر در نقش فاعل می‌آید و مثل اسم مفرد است: Swimming is dangerous.",
      },
      {
        prompt: "I finished ___ my homework an hour ago.",
        options: ["do", "to do", "doing"],
        answer: 2,
        why: "finish جزو فهرست افعالی است که بعدشان ing می‌آید: finished doing.",
      },
      {
        prompt: "Thanks a lot for ___ me.",
        options: ["inviting", "invite", "invited"],
        answer: 0,
        why: "بعد از حرف اضافهٔ for فعل شکل ing می‌گیرد: for inviting me.",
      },
    ],
  },

  {
    stationId: "g-infinitive",
    hook: "فعل دوم جمله در انگلیسی گشنه است و to می‌خواهد: I want go ✗ در حالی که فارسی هیچ to‌ای لازم ندارد.",
    see: {
      pieces: [
        { text: "She", role: "subject" },
        { text: "decided", role: "verb" },
        { text: "to learn", role: "object" },
        { text: "Spanish carefully", role: "rest" },
      ],
      note: "فعل دوم مصدر با to می‌شود؛ تغییر زمان فقط روی فعل اول می‌آید: decided (گذشته) + to learn.",
    },
    mirrors: [
      {
        fa: "او تصمیم گرفت اسپانیایی را با دقت یاد بگیرد.",
        en: "She decided to learn Spanish carefully.",
        adds: "فارسی دو فعل را پشت‌سرهم می‌آورد؛ انگلیسی فعل دوم را با to می‌بندد و زمان فقط یک‌بار صرف می‌شود.",
        mistake: {
          wrong: "She decided learning Spanish.",
          right: "She decided to learn Spanish.",
          why: "decide بعدش to می‌خواهد نه ing — افعالی مثل want/decide/seem همیشه to-دارند.",
        },
      },
      {
        fa: "نمی‌دانم کجا یک پیراهن خوب بخرم.",
        en: "I don't know where to buy a nice shirt.",
        adds: "بعد از کلمات پرسشی (where/what/how) هم مصدر با to می‌آید؛ فارسی فعل را صرف می‌کند (بخرم).",
        mistake: {
          wrong: "I don't know where buy a nice shirt.",
          right: "I don't know where to buy a nice shirt.",
          why: "بعد از کلمهٔ Wh همیشه to لازم است: where to buy، how to use، what to say.",
        },
      },
    ],
    try: [
      {
        prompt: "My brother wants ___ a bicycle.",
        options: ["buy", "to buy", "buying"],
        answer: 1,
        why: "want بعدش مصدر با to می‌خواهد: wants to buy.",
      },
      {
        prompt: "It was difficult for the students ___ all the questions.",
        options: ["to answer", "answer", "answering"],
        answer: 0,
        why: "ساختار It + صفت + for + مفعول + مصدر با to است: difficult for the students to answer.",
      },
      {
        prompt: "That box was too heavy ___ .",
        options: ["moving", "to move it", "to move"],
        answer: 2,
        why: "بعد از too + صفت مصدر با to می‌آید و مفعولِ تکراری نمی‌آید: too heavy to move.",
      },
    ],
  },

  // ------------------------------------------------ خط ۵ — شرط و احساس
  {
    stationId: "g-cond1",
    hook: "فارسی «اگه بخونی، یاد می‌گیری» را هر دو طرف حال می‌گوید؛ انگلیسی جواب را با will به آینده می‌فرستد — ولی بعد از if خودش هرگز will نمی‌گذارد!",
    see: {
      pieces: [
        { text: "If you study more,", role: "rest" },
        { text: "you", role: "subject" },
        { text: "will", role: "aux" },
        { text: "learn", role: "verb" },
        { text: "a lot.", role: "rest" },
      ],
      note: "قانون دوطرفه: شرط (if) حال ساده — جواب will + فعل ساده. will فقط سمت جواب زندگی می‌کند.",
    },
    mirrors: [
      {
        fa: "اگه بیشتر درس بخونی، خیلی یاد می‌گیری.",
        en: "If you study more, you will learn a lot.",
        adds: "انگلیسی نیمهٔ جواب را با will به آینده می‌برد؛ فارسی هر دو نیمه را حال می‌گوید.",
        mistake: {
          wrong: "If you will study more, you will learn a lot.",
          right: "If you study more, you will learn a lot.",
          why: "بعد از if هرگز will/would/be going to نمی‌آید — will فقط در جواب شرط جای دارد.",
        },
      },
      {
        fa: "اگه همین الان نری، ممکنه قطار را از دست بدهی.",
        en: "If you don't go now, you may miss the train.",
        adds: "جای will در جواب شرط می‌توان از can/may/should/must هم استفاده کرد — نکتهٔ کنکوری کتاب!",
        mistake: {
          wrong: "If you don't go now, you will can miss the train.",
          right: "If you don't go now, you may miss the train.",
          why: "دو فعل کمکی پشت هم نمی‌آیند: یا will یا may — will can غیرقابل قبول است.",
        },
      },
    ],
    try: [
      {
        prompt: "If it ___ tomorrow, we will stay home.",
        options: ["will rain", "rains", "rain"],
        answer: 1,
        why: "بعد از if حال ساده می‌آید: If it rains — will فقط در نیمهٔ جواب است.",
      },
      {
        prompt: "If he comes here, ___ him that I'm not at home.",
        options: ["tell", "you will tell", "telling"],
        answer: 0,
        why: "جواب شرط می‌تواند امری باشد: If he comes, tell him… — نکتهٔ مهم کتاب.",
      },
      {
        prompt: "Will you stay home if it ___ in the afternoon?",
        options: ["will rain", "rains", "rained"],
        answer: 1,
        why: "حتی وقتی جمله سؤالی است، بعد از if باز هم حال ساده می‌ماند.",
      },
    ],
  },

  {
    stationId: "g-ing-ed",
    hook: "bored و boring از یک فعل‌اند؛ ولی یکی آدمِ خسته است و یکی روزِ خسته‌کننده. کل فرق‌شان سه حرف است — و کنکور همین را می‌پرسد.",
    see: {
      pieces: [
        { text: "The children", role: "subject" },
        { text: "are", role: "verb" },
        { text: "excited", role: "rest" },
        { text: "because", role: "rest" },
        { text: "the cartoon", role: "subject" },
        { text: "is", role: "verb" },
        { text: "exciting", role: "rest" },
      ],
      note: "انسانِ احساس‌کننده (اثرپذیر) → ed؛ چیزی که احساس می‌سازد (اثرگذار) → ing.",
    },
    mirrors: [
      {
        fa: "بچه‌ها هیجان‌زده‌اند چون کارتون هیجان‌انگیز است.",
        en: "The children are excited because the cartoon is exciting.",
        adds: "فارسی دو صفت جداگانه دارد؛ انگلیسی از یک فعل (excite) با ed و ing دو صفت می‌سازد.",
        mistake: {
          wrong: "The children are exciting because the cartoon is excited.",
          right: "The children are excited because the cartoon is exciting.",
          why: "جای دو صفت عوض شده: انسانِ اثرپذیر ed می‌گیرد و منبعِ احساس ing.",
        },
      },
      {
        fa: "مادرم به‌نظر خسته می‌آمد.",
        en: "My mother seemed tired.",
        adds: "بعد از فعل‌های ربطی (seem/look/feel/get) صفت می‌آید نه قید؛ ed یعنی او اثرپذیر بوده است.",
        mistake: {
          wrong: "My mother seemed tiredly.",
          right: "My mother seemed tired.",
          why: "بعد از فعل ربطی صفت می‌نشیند؛ قید حالت (tiredly) آنجا کار ندارد.",
        },
      },
    ],
    try: [
      {
        prompt: "The math problem was really ___ .",
        options: ["confused", "confusing", "confuse"],
        answer: 1,
        why: "مسئلهٔ ریاضی منبعِ گیجی است (اثرگذار) → ing: confusing.",
      },
      {
        prompt: "After the long trip, everyone was ___ .",
        options: ["tired", "tiring", "tire"],
        answer: 0,
        why: "انسان‌های خسته‌شده اثرپذیرند → ed: everyone was tired.",
      },
      {
        prompt: "I was ___ in the movie from the first minute.",
        options: ["interesting", "interested", "interest"],
        answer: 1,
        why: "«من» احساس‌کننده‌ام → ed: interested in.",
      },
    ],
  },

  // ------------------------------------------------ خط ۶ — واژه‌سازی
  {
    stationId: "g-prefix",
    hook: "یک پیشوند کوچک کلمه را به ضدّش تبدیل می‌کند: possible → impossible — انگلیسی به‌جای کلمهٔ نفی، خودِ کلمه را برعکس می‌کند.",
    see: {
      pieces: [
        { text: "This question", role: "subject" },
        { text: "is", role: "verb" },
        { text: "impossible", role: "rest" },
        { text: "for me", role: "rest" },
      ],
      note: "پیشوندهای نفی: un-/im-/in-/dis-/il-/ir- — معنی را برعکس می‌کنند و به اول کلمه می‌چسبند.",
    },
    mirrors: [
      {
        fa: "این سؤال برای من ممکن نیست.",
        en: "This question is impossible for me.",
        adds: "فارسی «نفی» را با کلمهٔ جدا می‌سازد؛ انگلیسی پیشوند im- را به possible می‌چسباند.",
        mistake: {
          wrong: "This question is unpossible for me.",
          right: "This question is impossible for me.",
          why: "قبل از حروف m/p پیشوند im- می‌آید نه un-: impossible، impolite.",
        },
      },
      {
        fa: "او با تصمیم من موافق نیست.",
        en: "He disagrees with my decision.",
        adds: "فعل هم پیشوند نفی می‌گیرد: agree → disagree؛ فارسی فعل را مستقل منفی می‌کند.",
        mistake: {
          wrong: "He unagrees with my decision.",
          right: "He disagrees with my decision.",
          why: "پیشوند نفی‌سازِ رایجِ فعل‌ها dis- است: disagree، dislike، disappear.",
        },
      },
    ],
    try: [
      {
        prompt: "It's ___ to finish this book in one day.",
        options: ["impossible", "unpossible", "dispossible"],
        answer: 0,
        why: "possible با p شروع می‌شود → پیشوند im- : impossible.",
      },
      {
        prompt: "He was ___ , so nobody said hello to him.",
        options: ["unpolite", "impolite", "dispolite"],
        answer: 1,
        why: "polite با p شروع می‌شود → im- : impolite یعنی بی‌ادب.",
      },
      {
        prompt: "I ___ with your idea about the trip.",
        options: ["unagree", "inagree", "disagree"],
        answer: 2,
        why: "برای فعل agree پیشوند dis- می‌آید: disagree.",
      },
    ],
  },

  {
    stationId: "g-suffix",
    hook: "پسوند شغلِ کلمه را عوض می‌کند: care اسم است، careful صفت می‌شود و communication اسمِ بزرگ‌تر — یک پسوند، یک تغییر نقش.",
    see: {
      pieces: [
        { text: "My grandfather", role: "subject" },
        { text: "is", role: "verb" },
        { text: "a careful driver", role: "rest" },
      ],
      note: "ful یعنی «پُر از» و less یعنی «بی»؛ پسوندهای -tion/-ment اسم و -ate/-en/-ify/-ize فعل می‌سازند.",
    },
    mirrors: [
      {
        fa: "پدربزرگم رانندهٔ دقیق و مراقبی است.",
        en: "My grandfather is a careful driver.",
        adds: "انگلیسی با پسوند ful از اسم صفت می‌سازد: care → careful؛ فارسی صفت را کلمهٔ جدا می‌آورد.",
        mistake: {
          wrong: "My grandfather is a carefull driver.",
          right: "My grandfather is a careful driver.",
          why: "پسوند ful فقط یک L دارد — carefull املای غلطِ رایج ایرانی‌هاست.",
        },
      },
      {
        fa: "ارتباط با او آسان است.",
        en: "Communication with him is easy.",
        adds: "پسوند tion از فعل اسم می‌سازد: communicate → communication؛ و اسم می‌تواند فاعل جمله باشد.",
        mistake: {
          wrong: "Communicate with him is easy.",
          right: "Communication with him is easy.",
          why: "فعل خام نمی‌تواند فاعل باشد؛ با پسوند tion از آن اسم می‌سازیم تا فاعل شود.",
        },
      },
    ],
    try: [
      {
        prompt: "He broke three cups. He is so ___ .",
        options: ["careless", "careful", "care"],
        answer: 0,
        why: "less یعنی «بی»؛ کسی که مراقبت ندارد careless است.",
      },
      {
        prompt: "This bag is very ___ ; you can carry it easily.",
        options: ["useless", "useful", "use"],
        answer: 1,
        why: "useful یعنی پُر از فایده — با ful ؛ useless یعنی بی‌فایده.",
      },
      {
        prompt: "The ___ of the new bridge took two years.",
        options: ["construct", "constructive", "construction"],
        answer: 2,
        why: "فاعلِ جمله اسم می‌خواهد؛ پسوند tion می‌سازدش: construction.",
      },
    ],
  },

  // ------------------------------------------------ خط ۷ — مجهول (درس‌های ۴-۵)
  {
    stationId: "g-passive-base",
    hook: "وقتی نمی‌دانی یا نمی‌خواهی بگویی «چه کسی»، جمله مجهول می‌شود: مفعول بالا می‌آید و فعل، be + p.p. می‌گیرد.",
    see: {
      pieces: [
        { text: "Rice", role: "subject" },
        { text: "is grown", role: "verb" },
        { text: "in the north of Iran", role: "rest" },
      ],
      note: "مفعولِ جملهٔ فعال، فاعلِ جملهٔ مجهول می‌شود؛ فعلِ تکه‌دو: be + قسمت سوم. انجام‌دهنده یا حذف است یا با by می‌آید.",
    },
    mirrors: [
      {
        fa: "در شمال ایران برنج کاشته می‌شود.",
        en: "Rice is grown in the north of Iran.",
        adds: "فارسی با «می‌شود» مجهول می‌سازد؛ انگلیسی با be + p.p. و فاعلِ تازه — برنج دیگر «می‌روید» نیست، «کاشته می‌شود».",
        mistake: {
          wrong: "Rice is grow in the north of Iran.",
          right: "Rice is grown in the north of Iran.",
          why: "بعد از be حتماً قسمت سوم فعل می‌آید؛ grow → grown، نه grow.",
        },
      },
      {
        fa: "این فرش را در اصفهان می‌بافند.",
        en: "This carpet is woven in Isfahan.",
        adds: "«می‌بافند» بدونِ فاعلِ مشخص یعنی مجهول؛ انگلیسی هم فاعل را حذف و مفعول را بالا می‌آورد.",
        mistake: {
          wrong: "This carpet weaves in Isfahan.",
          right: "This carpet is woven in Isfahan.",
          why: "فرش خودش نمی‌بافد؛ انجام‌دهندهٔ نامعلوم یعنی مجهول: is woven.",
        },
      },
    ],
    try: [
      {
        prompt: "Persian ___ by millions of people around the world.",
        options: ["speaks", "is spoken", "is speaking"],
        answer: 1,
        why: "فارسی خودش حرف نمی‌زند؛ مردم آن را حرف می‌زنند → مجهول: is spoken + by.",
      },
      {
        prompt: "My grandfather ___ this house more than fifty years ago.",
        options: ["was built", "built", "is built"],
        answer: 1,
        why: "پدربزرگ خودش ساخته — فاعلِ انجام‌دهنده روشن است → جملهٔ فعال: built.",
      },
      {
        prompt: "Who ___ this beautiful poem? — Hafez did.",
        options: ["wrote", "was written", "is written"],
        answer: 0,
        why: "Who جای فاعل است و جمله فعالی می‌خواهد: Who wrote…؟ مجهولِ آن «By whom…؟» می‌شود.",
      },
    ],
  },
  {
    stationId: "g-passive-present",
    hook: "حقایق و کارهای همیشگی که انجام‌دهنده‌شان مهم نیست: am/is/are + p.p. — رایج‌ترین مجهولِ کتاب.",
    see: {
      pieces: [
        { text: "The letters", role: "subject" },
        { text: "are delivered", role: "verb" },
        { text: "to this office", role: "rest" },
        { text: "every morning", role: "rest" },
      ],
      note: "حال سادهٔ مجهول = am/is/are + p.p. سرنخ‌ها: every day، usually، today، aren't they؟ فاعلِ جمع are می‌خواهد.",
    },
    mirrors: [
      {
        fa: "نامه‌ها هر روز صبح به این دفتر فرستاده می‌شوند.",
        en: "The letters are delivered to this office every morning.",
        adds: "فارسی «می‌شوند» را یکی یکی می‌آورد؛ انگلیسی are + p.p. — فاعلِ جمع با are، مفرد با is.",
        mistake: {
          wrong: "The letters are deliver to this office every morning.",
          right: "The letters are delivered to this office every morning.",
          why: "بعد از are قسمت سوم فعل لازم است؛ deliver → delivered.",
        },
      },
      {
        fa: "امروزه انگلیسی در بیشتر مدرسه‌های جهان تدریس می‌شود.",
        en: "English is taught in most schools of the world today.",
        adds: "مجهولِ حال ساده با is + p.p.؛ انجام‌دهنده (معلم‌ها) مهم نیست و حذف شده.",
        mistake: {
          wrong: "English teaches in most schools of the world today.",
          right: "English is taught in most schools of the world today.",
          why: "انگلیسی خودش تدریس نمی‌کند؛ مجهول یعنی is taught — teach بی‌قاعده است: taught.",
        },
      },
    ],
    try: [
      {
        prompt: "Rice ___ in the north of Iran every year.",
        options: ["is grown", "grows up", "grown"],
        answer: 0,
        why: "انجام‌دهندهٔ نامعلوم و برچسبِ every year → حال سادهٔ مجهول: is grown.",
      },
      {
        prompt: "These beautiful carpets ___ in Isfahan, aren't they?",
        options: ["weave", "are woven", "woven"],
        answer: 1,
        why: "are + p.p. → are woven؛ تگِ پرسشی هم مجهول است: aren't they؟",
      },
      {
        prompt: "The letters ___ to this office every morning, and then they are read.",
        options: ["deliver", "are delivered", "delivered"],
        answer: 1,
        why: "نامه‌ها خودشان نمی‌رسانند؛ نیمهٔ دوم جمله هم مجهول است → are delivered.",
      },
    ],
  },
  {
    stationId: "g-passive-past",
    hook: "کارهای تمام‌شدهٔ گذشته که انجام‌دهنده مهم نیست: was/were + p.p. — برچسب‌های ago و last اینجا پادشاه‌اند.",
    see: {
      pieces: [
        { text: "The bridge", role: "subject" },
        { text: "was built", role: "verb" },
        { text: "about one hundred years ago", role: "rest" },
      ],
      timebar: { label: "گذشته — ساخته شد و تمام", marker: 15 },
      note: "گذشتهٔ سادهٔ مجهول = was/were + p.p. مفرد was، جمع were؛ برچسب‌ها: ago، last night، in 1920.",
    },
    mirrors: [
      {
        fa: "این پل حدود صد سال پیش ساخته شد.",
        en: "This bridge was built about one hundred years ago.",
        adds: "فارسی «شد» را می‌گوید؛ انگلیسی was + p.p. — برچسبِ ago زمان را روی گذشته قفل می‌کند.",
        mistake: {
          wrong: "This bridge was build about one hundred years ago.",
          right: "This bridge was built about one hundred years ago.",
          why: "بعد از was قسمت سوم می‌آید؛ build بی‌قاعده است: built.",
        },
      },
      {
        fa: "مهمان‌ها دیشب گرم از خانوادهٔ میزبان پذیرایی شدند.",
        en: "The guests were warmly welcomed by the host family last night.",
        adds: "مجهولِ جمعِ گذشته = were + p.p.؛ انجام‌دهندهٔ مشخص این‌جا با by آمده.",
        mistake: {
          wrong: "The guests were warmly welcoming by the host family last night.",
          right: "The guests were warmly welcomed by the host family last night.",
          why: "مهمان‌ها خوش‌آمد «می‌گفتند» نه؛ گفته شدند → p.p. لازم است: welcomed، نه welcoming.",
        },
      },
    ],
    try: [
      {
        prompt: "This bridge ___ about one hundred years ago.",
        options: ["is built", "was built", "built"],
        answer: 1,
        why: "برچسبِ ago یعنی گذشتهٔ تمام‌شده و پل «ساخته شد» → was built.",
      },
      {
        prompt: "I ___ to the party last Friday, so I stayed home sadly.",
        options: ["was not invited", "did not invite", "am not invited"],
        answer: 0,
        why: "من «دعوت شدم» نه «دعوت کردم»؛ منفیِ گذشتهٔ مجهول: was not invited.",
      },
      {
        prompt: "Our thanks ___ expressed to all the kind donors by the charity last week.",
        options: ["are", "were", "was"],
        answer: 1,
        why: "thanks جمع است و برچسبِ last week گذشته است → were expressed.",
      },
    ],
  },
  {
    stationId: "g-passive-exam",
    hook: "تله‌های کنکورِ مجهول: فعل‌های دو مفعولی، سؤال‌های Who/What، و فعل‌هایی که هرگز مجهول نمی‌شوند.",
    see: {
      pieces: [
        { text: "She", role: "subject" },
        { text: "was given", role: "verb" },
        { text: "a golden watch", role: "object" },
        { text: "on her retirement day", role: "rest" },
      ],
      note: "فعلِ دو مفعولی (give) دو شکل مجهول دارد: She was given… یا A watch was given to her. سؤالِ مجهول: By whom…؟",
    },
    mirrors: [
      {
        fa: "در روز بازنشستگی‌اش یک ساعت طلایی به او هدیه داده شد.",
        en: "She was given a golden watch on her retirement day.",
        adds: "فارسی «به او … داده شد»؛ انگلیسی هر دو مفعول می‌توانند فاعلِ مجهول شوند — این‌جا «او» فاعل شده.",
        mistake: {
          wrong: "A golden watch was given her on her retirement day.",
          right: "A golden watch was given to her on her retirement day.",
          why: "وقتی شیء فاعلِ مجهول می‌شود، گیرنده با to می‌آید: was given to her.",
        },
      },
      {
        fa: "این شعرِ زیبا را چه کسی سرود؟",
        en: "By whom was this beautiful poem written?",
        adds: "در سؤالِ مجهول، Who می‌شود By whom و بعدش ساختارِ عادی سؤالِ مجهول می‌آید: was + p.p.",
        mistake: {
          wrong: "Who was written this beautiful poem?",
          right: "By whom was this beautiful poem written?",
          why: "Who در مجهول باید By whom شود و be هم قبل از p.p. بنشیند.",
        },
      },
    ],
    try: [
      {
        prompt: "She was given a golden watch ___ her retirement day.",
        options: ["in", "on", "at"],
        answer: 1,
        why: "با «روزِ» مشخص از on استفاده می‌شود: on her retirement day.",
      },
      {
        prompt: "Nobody ___ the exact date of this old ceremony.",
        options: ["knows", "is known", "know"],
        answer: 0,
        why: "اینجا فعلِ فعال می‌خواهیم؛ nobody فاعلِ مفرد است → knows با s.",
      },
      {
        prompt: "English ___ in most schools of the world today.",
        options: ["teaches", "is taught", "taught"],
        answer: 1,
        why: "زبان خودش تدریس نمی‌شود؛ مجهولِ حال: is taught — teach بی‌قاعده: taught.",
      },
    ],
  },
  {
    stationId: "g-passive-future",
    hook: "برنامه‌هایی که «انجام خواهند شد» — ولی هنوز معلوم نیست چه کسی انجام‌شان می‌دهد: will be + p.p.",
    see: {
      pieces: [
        { text: "A new subway", role: "subject" },
        { text: "will be built", role: "verb" },
        { text: "in this city", role: "rest" },
        { text: "in the near future", role: "rest" },
      ],
      timebar: { label: "آینده — ساخته خواهد شد", marker: 85 },
      note: "آیندهٔ مجهول = will be + p.p. بینِ will و p.p. همیشه be می‌نشیند؛ never will built.",
    },
    mirrors: [
      {
        fa: "متروی تازه در آیندهٔ نزدیک در این شهر ساخته خواهد شد.",
        en: "A new subway will be built in this city in the near future.",
        adds: "فارسی «خواهد شد»؛ انگلیسی will be + p.p. — انجام‌دهنده هنوز نامعلوم است.",
        mistake: {
          wrong: "A new subway will built in this city in the near future.",
          right: "A new subway will be built in this city in the near future.",
          why: "بین will و p.p. حتماً be لازم است: will be built.",
        },
      },
      {
        fa: "نتیجه‌های مسابقه هفتهٔ بعد اعلام خواهند شد.",
        en: "The results of the competition will be announced next week.",
        adds: "مجهولِ آینده با will be + p.p.؛ برچسبِ next week آینده را نشان می‌دهد.",
        mistake: {
          wrong: "The results will announce next week.",
          right: "The results will be announced next week.",
          why: "نتایج خودشان اعلام نمی‌کنند؛ مجهول یعنی will be announced.",
        },
      },
    ],
    try: [
      {
        prompt: "The results of the competition ___ next week.",
        options: ["will be announced", "will announce", "are announced"],
        answer: 0,
        why: "برچسبِ next week و انجام‌دهندهٔ نامعلوم → آیندهٔ مجهول: will be announced.",
      },
      {
        prompt: "Will the new museum ___ next year?",
        options: ["open", "be opened", "opened"],
        answer: 1,
        why: "موزه «باز می‌شود» نه «باز می‌کند»؛ سؤالِ مجهولِ آینده: Will … be opened؟",
      },
      {
        prompt: "More trees ___ in our neighborhood to keep the air clean.",
        options: ["will plant", "are planting", "will be planted"],
        answer: 2,
        why: "درخت‌ها «کاشته می‌شوند» و جمله آینده است → will be planted.",
      },
    ],
  },
  {
    stationId: "g-passive-modal",
    hook: "«باید انجام شود»، «می‌تواند حل شود» — بعد از هر فعل ناقص، مجهول با be + p.p. می‌آید.",
    see: {
      pieces: [
        { text: "The environment", role: "subject" },
        { text: "must be protected", role: "verb" },
        { text: "by all of us", role: "rest" },
      ],
      note: "قاعدهٔ طلایی: modal + be + p.p. — can/must/should/may هرگز مستقیم p.p. نمی‌گیرند؛ بین‌شان همیشه be هست.",
    },
    mirrors: [
      {
        fa: "محیط زیست باید توسط همهٔ ما حفاظت شود.",
        en: "The environment must be protected by all of us.",
        adds: "فارسی «باید … شود»؛ انگلیسی must be + p.p. — انجام‌دهنده با by می‌آید.",
        mistake: {
          wrong: "The environment must protected by all of us.",
          right: "The environment must be protected by all of us.",
          why: "بعد از must حتماً be می‌آید؛ must protected مجهولِ ناقص است.",
        },
      },
      {
        fa: "این مشکل نمی‌تواند به‌سادگی حل شود.",
        en: "This problem cannot be solved easily.",
        adds: "فعل ناقص + be + p.p. — سه تکه‌ای که نباید هیچ‌کدامش جا بیفتد.",
        mistake: {
          wrong: "This problem cannot solved easily.",
          right: "This problem cannot be solved easily.",
          why: "بعد از cannot هم be لازم است: cannot be solved.",
        },
      },
    ],
    try: [
      {
        prompt: "This problem ___ easily; it needs a lot of research.",
        options: ["cannot solve", "cannot be solved", "cannot been solved"],
        answer: 1,
        why: "cannot + be + p.p. — been غلط است چون فعل ناقص p.p.ِ کمکی نمی‌گیرد.",
      },
      {
        prompt: "Smoking ___ in public places; it is against the law.",
        options: ["must not be allowed", "must not allow", "must not been allowed"],
        answer: 0,
        why: "کشیدن سیگار «مجاز شمرده نمی‌شود» → مجهولِ فعل ناقص: must not be allowed.",
      },
      {
        prompt: "The homework ___ by intelligent programs in a few seconds tomorrow.",
        options: ["will do", "will be done", "will been done"],
        answer: 1,
        why: "تکالیف «انجام می‌شوند» → will be done؛ been جای be را نمی‌گیرد.",
      },
    ],
  },
  {
    stationId: "g-passive-detect",
    hook: "در تست، اول تشخیص: مجهول است یا فعال؟ دو سرنخِ بزرگ: by و منطقِ فاعل — بدونِ by هم مجهول ممکن است.",
    see: {
      pieces: [
        { text: "Flying taxis", role: "subject" },
        { text: "will be used", role: "verb" },
        { text: "for crowded cities", role: "rest" },
        { text: "in the next ten years", role: "rest" },
      ],
      note: "فاعلِ بی‌جانی که «انجام نمی‌دهد» سرنخِ اصلی است؛ انجام‌دهنده معمولاً حذف شده چون مهم نیست.",
    },
    mirrors: [
      {
        fa: "تاکسی‌های پرنده در ده سالِ آینده برای شهرهای شلوغ به کار گرفته خواهند شد.",
        en: "Flying taxis will be used for crowded cities in the next ten years.",
        adds: "مجهولِ آینده بدونِ by؛ فاعلِ انجام‌دهنده حذف شده چون مهم نیست.",
        mistake: {
          wrong: "Flying taxis will use for crowded cities in the next ten years.",
          right: "Flying taxis will be used for crowded cities in the next ten years.",
          why: "تاکسی‌ها «استفاده می‌کنند» نه؛ استفاده می‌شوند → will be used.",
        },
      },
      {
        fa: "دانشمندان می‌گویند این بیماری در آینده با یک داروی ساده درمان می‌شود.",
        en: "Scientists say this disease will be cured by a simple medicine in the future.",
        adds: "در جملهٔ مرکب، فقط بخشِ داخل مجهول می‌شود؛ فعلِ گزارنده (say) فعال می‌ماند.",
        mistake: {
          wrong: "This disease will cure by a simple medicine in the future.",
          right: "This disease will be cured by a simple medicine in the future.",
          why: "با by حتماً مجهول لازم است: will be cured.",
        },
      },
    ],
    try: [
      {
        prompt: "The keys ___ in the drawer yesterday; did you check there?",
        options: ["were put", "put", "are put"],
        answer: 0,
        why: "برچسبِ yesterday → گذشته؛ کلیدها «گذاشته شدند» → were put — p.p.ِ put همان put است.",
      },
      {
        prompt: "The letters ___ as soon as the post office opens.",
        options: ["will send", "will be sent", "send"],
        answer: 1,
        why: "نامه‌ها «فرستاده می‌شوند»؛ در جملهٔ شرطیِ زمان هم will می‌آید → will be sent.",
      },
      {
        prompt: "Nobody knows exactly what ___ in the future.",
        options: ["will happen", "will be happened", "happens"],
        answer: 0,
        why: "happen مفعول ندارد و هرگز مجهول نمی‌شود → will happen.",
      },
    ],
  },
  {
    stationId: "g-report-statements",
    hook: "وقتی حرف کسی را برای دیگری تعریف می‌کنی، فعل‌ها یک پله عقب می‌روند: said که گذشته است، داخلِ جمله هم گذشته می‌شود.",
    see: {
      pieces: [
        { text: "He", role: "subject" },
        { text: "said", role: "verb" },
        { text: "that", role: "rest" },
        { text: "he was very tired", role: "rest" },
      ],
      timebar: { label: "یک پله عقب‌تر — is می‌شود was", marker: 25 },
      note: "am/is→was، will→would، can→could، must→had to؛ حقیقتِ همیشه‌راست (زمین گرد است) عقب نمی‌رود.",
    },
    mirrors: [
      {
        fa: "او گفت که خیلی خسته است.",
        en: "He said that he was very tired.",
        adds: "در نقل قول، is به was عقب می‌رود و ضمیرِ I هم به he تبدیل می‌شود — نگاه از بیرونِ حرف.",
        mistake: {
          wrong: "He said that he is very tired.",
          right: "He said that he was very tired.",
          why: "بعد از said (گذشته) فعلِ داخل هم گذشته می‌شود: is → was.",
        },
      },
      {
        fa: "او گفت که می‌تواند خیلی خوب شنا کند.",
        en: "He said that he could swim very well.",
        adds: "can در نقل قول ثابت می‌شود could — این تغییر همیشه همین است.",
        mistake: {
          wrong: "He said that he can swim very well.",
          right: "He said that he could swim very well.",
          why: "فعلِ گزارنده در گذشته است؛ can باید عقب برود: could.",
        },
      },
    ],
    try: [
      {
        prompt: 'He said, "I am very tired." — He said that he ___ very tired.',
        options: ["was", "is", "were"],
        answer: 0,
        why: "is بعد از said می‌شود was؛ فاعلِ he هم was مفرد می‌خواهد.",
      },
      {
        prompt: 'He said, "I will come tomorrow." — He said that he ___ the next day.',
        options: ["would come", "will come", "comes"],
        answer: 0,
        why: "will در نقل قول می‌شود would و tomorrow هم می‌شود the next day.",
      },
      {
        prompt: 'He said, "I must save fuel." — He said that he ___ save fuel.',
        options: ["must", "had to", "have to"],
        answer: 1,
        why: "must در نقل قول معمولاً had to می‌شود؛ he هم had می‌خواهد نه have.",
      },
    ],
  },
  {
    stationId: "g-report-shifts",
    hook: "نقل قول یعنی حرف زدن از جای دیگر و روز دیگر — جاها و روزها هم عقب می‌روند، مثل خودِ فعل‌ها.",
    see: {
      pieces: [
        { text: "She", role: "subject" },
        { text: "said", role: "verb" },
        { text: "that she would show me her new device there", role: "rest" },
      ],
      note: "here→there، this→that، tomorrow→the next day، yesterday→the day before، now→then — ضمیرها هم عوض می‌شوند: I→he/she، you→me.",
    },
    mirrors: [
      {
        fa: "او گفت که دستگاه تازه‌اش را همان‌جا به من نشان خواهد داد.",
        en: "She said that she would show me her new device there.",
        adds: "here در نقل قول می‌شود there و you از دیدِ نقل‌کننده می‌شود me — ضمیر و قید با هم می‌چرخند.",
        mistake: {
          wrong: "She said that she would show me her new device here.",
          right: "She said that she would show me her new device there.",
          why: "جای سخن‌گویی عوض شده؛ پس here هم به there تبدیل می‌شود.",
        },
      },
      {
        fa: "او گفت که نامه را روزِ قبلش فرستاده است.",
        en: "She said that she had sent the letter the day before.",
        adds: "دو جابه‌جایی با هم: فعلِ گذشته ساده می‌شود گذشتهٔ کامل (sent → had sent) و yesterday می‌شود the day before.",
        mistake: {
          wrong: "She said that she sent the letter yesterday.",
          right: "She said that she had sent the letter the day before.",
          why: "در نقل قول هم زمانِ فعل عقب می‌رود هم قیدِ زمان؛ sent → had sent و yesterday → the day before.",
        },
      },
    ],
    try: [
      {
        prompt: 'She said, "I will show you my new device here." — She said that she would show me her new device ___.',
        options: ["here", "there", "this"],
        answer: 1,
        why: "قیدِ مکان در نقل قول عقب می‌رود: here → there.",
      },
      {
        prompt: 'He said, "I sent the letter yesterday." — He said that he ___ the letter the day before.',
        options: ["had sent", "sent", "has sent"],
        answer: 0,
        why: "گذشتهٔ ساده در نقل قول می‌شود گذشتهٔ کامل: sent → had sent.",
      },
      {
        prompt: 'He said, "I will come tomorrow." — He said that he would come ___.',
        options: ["tomorrow", "the next day", "yesterday"],
        answer: 1,
        why: "tomorrow در نقل قول می‌شود the next day.",
      },
    ],
  },
  {
    stationId: "g-report-questions",
    hook: "سؤال در نقل قول دیگر «سؤال» نیست: ترتیب فاعل-فعل برمی‌گردد و do/does/did کامل حذف می‌شود.",
    see: {
      pieces: [
        { text: "He", role: "subject" },
        { text: "asked", role: "verb" },
        { text: "me", role: "object" },
        { text: "where I lived", role: "rest" },
      ],
      note: "الگوی Wh: wh + فاعل + فعلِ گذشته؛ سؤالِ بله/خیر: if/whether؛ do حذف و فعلِ اصلی خودش گذشته می‌شود.",
    },
    mirrors: [
      {
        fa: "از من پرسید کجا زندگی می‌کنم.",
        en: "He asked me where I lived.",
        adds: "do you live در نقل قول می‌شود I lived — do حذف، فعل می‌رود گذشته و ترتیب عادی می‌آید.",
        mistake: {
          wrong: "He asked me where did I live.",
          right: "He asked me where I lived.",
          why: "بعد از wh در نقل قول، جمله روایی است: فاعل-فعل — did حذف می‌شود.",
        },
      },
      {
        fa: "از او پرسیدم که آیا چای می‌خواهد.",
        en: "I asked him if he wanted tea.",
        adds: "سؤالِ بله/خیر در نقل قول با if/whether می‌آید و صورتِ سؤالی‌اش را کامل گم می‌کند.",
        mistake: {
          wrong: "I asked him if did he want tea.",
          right: "I asked him if he wanted tea.",
          why: "بعد از if هم ترتیبِ فاعل-فعل است؛ want هم گذشته می‌شود: wanted.",
        },
      },
    ],
    try: [
      {
        prompt: 'He asked me, "Where do you live?" — He asked me where ___.',
        options: ["I lived", "do I live", "did I live"],
        answer: 0,
        why: "do حذف، فعل می‌رود گذشته و ترتیب فاعل-فعل می‌شود: where I lived.",
      },
      {
        prompt: 'She asked me, "Do you want tea?" — She asked me ___ tea.',
        options: ["did I want", "if I wanted", "if did I want"],
        answer: 1,
        why: "سؤالِ بله/خیر → if + فاعل + فعلِ گذشته: if I wanted.",
      },
      {
        prompt: 'He asked me, "What is she doing?" — He asked me what ___.',
        options: ["she was doing", "is she doing", "was she doing"],
        answer: 0,
        why: "be هم از جای فاعل برمی‌گردد: what she was doing.",
      },
    ],
  },

  // ------------------------------------------------ خط ۹ — حال و ربط (درس ۷)
  {
    stationId: "g-present-vs-prog",
    hook: "«هر بهار می‌روم» یا «همین الآن دارم می‌روم»؟ انتخابِ فعل از سرنخِ زمان می‌آید — اول سرنخ را پیدا کن.",
    see: {
      pieces: [
        { text: "Look!", role: "rest" },
        { text: "The volunteers", role: "subject" },
        { text: "are cleaning", role: "verb" },
        { text: "the beach", role: "object" },
        { text: "right now", role: "rest" },
      ],
      timebar: { label: "اکنون — همین لحظه در جریان است", marker: 60 },
      note: "استمراری = am/is/are + ing با سرنخ‌های Look!/now؛ ساده = عادت با usually/every. فعل‌های حالتی (know، like) استمراری نمی‌شوند.",
    },
    mirrors: [
      {
        fa: "ببین! داوطلب‌ها همین الآن ساحل را تمیز می‌کنند.",
        en: "Look! The volunteers are cleaning the beach right now.",
        adds: "فارسی «دارند می‌کنند» می‌گوید؛ انگلیسی are + ing — خودِ Look! فریادِ «الان» است.",
        mistake: {
          wrong: "Look! The volunteers clean the beach right now.",
          right: "Look! The volunteers are cleaning the beach right now.",
          why: "با سرنخِ Look! و right now حتماً استمراری لازم است: are cleaning.",
        },
      },
      {
        fa: "خانواده‌ام معمولاً هر بهار به کوه‌ها می‌رود.",
        en: "My family usually goes to the mountains in spring.",
        adds: "عادت‌های تکرارشونده حال ساده می‌گیرند؛ قیدِ بسامد هم قبل از فعلِ اصلی می‌نشیند.",
        mistake: {
          wrong: "My family is usually going to the mountains in spring.",
          right: "My family usually goes to the mountains in spring.",
          why: "عادت استمراری نمی‌گیرد؛ usually هم می‌رود قبل از فعلِ اصلی، نه وسط آن.",
        },
      },
    ],
    try: [
      {
        prompt: "Be quiet, please! The baby ___ in the next room.",
        options: ["is sleeping", "sleeps", "sleep"],
        answer: 0,
        why: "«همین الآن» با Be quiet! → استمراری: is sleeping.",
      },
      {
        prompt: "My family usually ___ to the mountains in spring.",
        options: ["is going", "goes", "go"],
        answer: 1,
        why: "usually یعنی عادت → حال ساده؛ family اینجا مفردِ جمعی است: goes.",
      },
      {
        prompt: "I ___ the answer; please don't explain it again.",
        options: ["know", "am knowing", "knows"],
        answer: 0,
        why: "فعل‌های حالتی مثل know استمراری نمی‌شوند: I know — و با I هم s نمی‌گیرد.",
      },
    ],
  },
  {
    stationId: "g-linking",
    hook: "پنج ربطِ کوچک که نیمهٔ دوم جمله را جهت می‌دهند: و، اما، یا، پس، چون — قبل از انتخاب، رابطهٔ دو نیمه را ببین.",
    see: {
      pieces: [
        { text: "The trail was long", role: "rest" },
        { text: "but", role: "rest" },
        { text: "we", role: "subject" },
        { text: "enjoyed", role: "verb" },
        { text: "every minute of it", role: "object" },
      ],
      note: "so نتیجه می‌آورد، because دلیل، but تضاد، or انتخاب و and اضافه؛ ربطِ بین دو جملهٔ مستقل با کاما می‌آید.",
    },
    mirrors: [
      {
        fa: "مسیر طولانی بود، اما از هر دقیقه‌اش لذت بردیم.",
        en: "The trail was long, but we enjoyed every minute of it.",
        adds: "فارسی «اما» وسط می‌آید؛ انگلیسی but هم بعدِ کاما می‌آید و دو نیمهٔ مخالف را وصل می‌کند.",
        mistake: {
          wrong: "The trail was long, so we enjoyed every minute of it.",
          right: "The trail was long, but we enjoyed every minute of it.",
          why: "رابطه تضاد است نه نتیجه؛ so جهت را برعکس می‌کند — but درست است.",
        },
      },
      {
        fa: "باید جنگل‌ها را حفظ کنیم چون به ما اکسیژن و غذا می‌دهند.",
        en: "We must protect the forests because they give us oxygen and food.",
        adds: "because دلیلِ نیمهٔ اول را می‌آورد؛ در فارسی «چون» ممکن است اول بیاید، در انگلیسی هم آزاد است اما جایِ بعدی رایج‌تر است.",
        mistake: {
          wrong: "We must protect the forests so they give us oxygen and food.",
          right: "We must protect the forests because they give us oxygen and food.",
          why: "نیمهٔ دوم «دلیل» است نه نتیجه؛ so جهت را برعکس می‌کند.",
        },
      },
    ],
    try: [
      {
        prompt: "The river was full of rubbish, ___ the students decided to clean it up.",
        options: ["because", "so", "or"],
        answer: 1,
        why: "تصمیمِ دانش‌آموزها «نتیجهٔ» آلودگی بود: so.",
      },
      {
        prompt: "We must protect the forests ___ they give us oxygen and food.",
        options: ["because", "but", "so"],
        answer: 0,
        why: "نیمهٔ دوم «دلیلِ» حفاظت است: because.",
      },
      {
        prompt: "You can reuse this bottle ___ recycle it at the center.",
        options: ["or", "but", "so"],
        answer: 0,
        why: "دو گزینهٔ انتخابی: یا دوباره استفاده کن یا ببرش بازیافت — or.",
      },
    ],
  },
  {
    stationId: "g-adverbs",
    hook: "قیدِ بسامد جای ثابتی دارد: «قبل از فعلِ اصلی، بعد از be» — و قیدِ حالت معمولاً می‌رود آخر جمله.",
    see: {
      pieces: [
        { text: "She", role: "subject" },
        { text: "always recycles", role: "verb" },
        { text: "her bottles", role: "object" },
        { text: "it is her daily habit", role: "rest" },
      ],
      note: "always/often/never بین فاعل و فعلِ اصلی؛ با be بعدِ خودِ be: are usually. قیدِ حالتِ ‎-ly‎ جای پیش‌فرضش آخر جمله است.",
    },
    mirrors: [
      {
        fa: "او همیشه بطری‌هایش را بازیافت می‌کند؛ عادتِ روزانه‌اش است.",
        en: "She always recycles her bottles; it is her daily habit.",
        adds: "قیدِ بسامد در انگلیسی قبل از فعلِ اصلی می‌نشیند؛ فارسی جای آزادتری دارد.",
        mistake: {
          wrong: "She recycles always her bottles; it is her daily habit.",
          right: "She always recycles her bottles; it is her daily habit.",
          why: "always قبل از فعلِ اصلی می‌آید، نه بعدش.",
        },
      },
      {
        fa: "آتش به‌خاطر بادِ شدید سریع گسترش یافت.",
        en: "The fire spread quickly because of the strong wind.",
        adds: "قیدِ حالت از صفت + ly ساخته می‌شود: quick → quickly؛ فعل را قید توصیف می‌کند نه صفت.",
        mistake: {
          wrong: "The fire spread quick because of the strong wind.",
          right: "The fire spread quickly because of the strong wind.",
          why: "توصیفِ فعل = قید: quickly — صفت (quick) فقط اسم را توصیف می‌کند.",
        },
      },
    ],
    try: [
      {
        prompt: "The fire spread ___ because of the strong wind.",
        options: ["quickly", "quick", "quickness"],
        answer: 0,
        why: "توصیفِ فعل = قید: quickly.",
      },
      {
        prompt: "Our team works very ___ and finishes the project on time.",
        options: ["hardly", "harder", "hard"],
        answer: 2,
        why: "hard خودش قید است (سخت)؛ hardly یعنی «به‌سختی/تقریباً نه» و معنی را برعکس می‌کند.",
      },
      {
        prompt: "The rangers are ___ in the reserve during the fire season.",
        options: ["usually", "usual", "usualness"],
        answer: 0,
        why: "بعد از be قیدِ بسامد می‌آید: are usually — usual صفت است.",
      },
    ],
  },
  {
    stationId: "g-past-simple",
    hook: "برچسبِ زمانِ قطعی آمد؟ فعل هم قطعاً گذشتهٔ ساده است — نه حال کامل، نه حال.",
    see: {
      pieces: [
        { text: "We", role: "subject" },
        { text: "watched", role: "verb" },
        { text: "the wildlife documentary", role: "object" },
        { text: "last night", role: "rest" },
      ],
      timebar: { label: "گذشته — دیشب، تمام‌شده", marker: 15 },
      note: "last night/ago/in 1390 → گذشتهٔ ساده؛ منفی و سؤال با did + مصدرِ بدونِ to — did دیدی، فعل برمی‌گردد به شکل ساده.",
    },
    mirrors: [
      {
        fa: "دیشب مستندِ حیات‌وحش را دیدیم.",
        en: "We watched the wildlife documentary last night.",
        adds: "برچسبِ last night فعل را قفل می‌کند؛ انگلیسی با ed (یا شکلِ بی‌قاعده) می‌سازد.",
        mistake: {
          wrong: "We have watched the wildlife documentary last night.",
          right: "We watched the wildlife documentary last night.",
          why: "با برچسبِ زمانِ قطعیِ گذشته حال کامل نمی‌آید: watched.",
        },
      },
      {
        fa: "وقتی هوای سرد رسید، پرنده‌ها به جنوب رفتند.",
        en: "The birds flew south when the cold weather arrived.",
        adds: "دو فعلِ گذشته در جملهٔ مرکب؛ fly بی‌قاعده است: flew.",
        mistake: {
          wrong: "The birds flied south when the cold weather arrived.",
          right: "The birds flew south when the cold weather arrived.",
          why: "fly بی‌قاعده است: flew — flied غلط رایج است.",
        },
      },
    ],
    try: [
      {
        prompt: "We ___ the wildlife documentary last night.",
        options: ["have watched", "watched", "watch"],
        answer: 1,
        why: "last night برچسبِ گذشتهٔ قطعی است: watched.",
      },
      {
        prompt: "The explorers ___ any water in the dry desert.",
        options: ["didn't find", "didn't found", "not found"],
        answer: 0,
        why: "منفیِ گذشته با did not + مصدرِ ساده: didn't find — found گذشتهٔ find است نه مصدر.",
      },
      {
        prompt: "___ you ___ the dolphin show last week?",
        options: ["Did / see", "Did / saw", "Do / saw"],
        answer: 0,
        why: "سؤالِ گذشته: Did + فاعل + مصدرِ بدونِ to: Did you see.",
      },
    ],
  },

  // ------------------------------------------------ خط ۱۰ — گذشته و مقایسه (درس ۸)
  {
    stationId: "g-comparatives",
    hook: "مقایسهٔ دو چیز: صفتِ کوتاه ‑er می‌گیرد، صفتِ بلند more می‌خواهد — و مقایسه بدونِ than تمام نمی‌شود.",
    see: {
      pieces: [
        { text: "My new camera", role: "subject" },
        { text: "takes", role: "verb" },
        { text: "better pictures", role: "object" },
        { text: "than the old one", role: "rest" },
      ],
      note: "کوتاه: faster/stronger + than؛ بلند: more intelligent + than؛ بی‌قاعده‌ها: good→better، bad→worse، far→farther.",
    },
    mirrors: [
      {
        fa: "دوربینِ تازه‌ام عکس‌های بهتری از قبلی می‌گیرد.",
        en: "My new camera takes better pictures than the old one.",
        adds: "better شکلِ تفضیلیِ good است؛ مقایسه با than کامل می‌شود.",
        mistake: {
          wrong: "My new camera takes more good pictures than the old one.",
          right: "My new camera takes better pictures than the old one.",
          why: "good بی‌قاعده است: better — more good هرگز درست نیست.",
        },
      },
      {
        fa: "یوزپلنگ از گربهٔ خانگی سریع‌تر است.",
        en: "A cheetah is faster than a house cat.",
        adds: "صفتِ کوتاه fast فقط er می‌گیرد: faster than — no more.",
        mistake: {
          wrong: "A cheetah is more fast than a house cat.",
          right: "A cheetah is faster than a house cat.",
          why: "صفتِ تک‌بخشی er می‌گیرد؛ more fast تکرارِ بی‌دلیلِ مقایسه است.",
        },
      },
    ],
    try: [
      {
        prompt: "A cheetah is ___ a house cat.",
        options: ["faster than", "more fast than", "fast than"],
        answer: 0,
        why: "fast کوتاه است: faster than.",
      },
      {
        prompt: "Dolphins are considered ___ many other animals.",
        options: ["more intelligent than", "intelligent than", "most intelligent than"],
        answer: 0,
        why: "صفتِ بلند با more می‌آید: more intelligent than.",
      },
      {
        prompt: "A spider's web is ___ steel of the same weight.",
        options: ["more strong than", "stronger than", "strong than"],
        answer: 1,
        why: "strong کوتاه است: stronger than.",
      },
    ],
  },
  {
    stationId: "g-superlatives",
    hook: "از بینِ همه: the + ‑est / the most — و برابری با as … as. سرنخِ طلایی: «of all» یعنی عالی.",
    see: {
      pieces: [
        { text: "The blue whale", role: "subject" },
        { text: "is", role: "verb" },
        { text: "the largest animal", role: "rest" },
        { text: "on the earth", role: "rest" },
      ],
      note: "کوتاه: the largest؛ بلند: the most interesting؛ برابری: as slow as — صفتِ عالی حتماً the می‌خواهد.",
    },
    mirrors: [
      {
        fa: "نهنگ آبی بزرگ‌ترین جانور روی زمین است.",
        en: "The blue whale is the largest animal on the earth.",
        adds: "برترین با the می‌آید؛ large کوتاه است: the largest — «روی زمین» یعنی از بینِ همه.",
        mistake: {
          wrong: "The blue whale is largest animal on the earth.",
          right: "The blue whale is the largest animal on the earth.",
          why: "صفتِ عالی حتماً the می‌خواهد: the largest.",
        },
      },
      {
        fa: "لاک‌پشت به‌اندازهٔ خرگوش آرام است، برای همین همیشه می‌بازد.",
        en: "A turtle is as slow as a rabbit, so it always loses the race.",
        adds: "برابری با as + صفت + as ساخته می‌شود؛ بین دو as صفتِ ساده می‌آید، نه تفضیلی.",
        mistake: {
          wrong: "A turtle is as slower as a rabbit, so it always loses the race.",
          right: "A turtle is as slow as a rabbit, so it always loses the race.",
          why: "بین دو as صفتِ ساده می‌آید: as slow as — as slower as غلط است.",
        },
      },
    ],
    try: [
      {
        prompt: "The blue whale is ___ animal on the earth.",
        options: ["the largest", "largest", "the larger"],
        answer: 0,
        why: "عالی یعنی the + ‑est: the largest — the larger مخصوص مقایسهٔ دوتایی است.",
      },
      {
        prompt: "That was ___ program I have ever watched.",
        options: ["more interesting", "the most interesting", "the more interesting"],
        answer: 1,
        why: "«از همهٔ برنامه‌هایی که دیده‌ای» → برترین با صفتِ بلند: the most interesting.",
      },
      {
        prompt: "Of all the hunters in the film, the eagle worked ___.",
        options: ["the most carefully", "more carefully", "carefullest"],
        answer: 0,
        why: "«of all» برترین می‌خواهد؛ قیدِ بلند هم: the most carefully.",
      },
    ],
  },

  // ------------------------------------------------ خط ۱۱ — آینده (درس ۹)
  {
    stationId: "g-future-will",
    hook: "تصمیمِ همین لحظه، قول و پیش‌بینی — همه با will + مصدرِ بدونِ to. بعد از will هرگز to و s نمی‌آید.",
    see: {
      pieces: [
        { text: "Don't worry about the exam;", role: "rest" },
        { text: "I", role: "subject" },
        { text: "promise", role: "verb" },
        { text: "I will help you", role: "rest" },
      ],
      timebar: { label: "آینده — قولِ همین حالا", marker: 80 },
      note: "will برای تصمیمِ درجا (I will take you)، پیش‌بینی (will open) و قول؛ منفی: won't؛ سؤال: Will you…؟",
    },
    mirrors: [
      {
        fa: "نگران امتحان نباش؛ قول می‌دهم کمکت می‌کنم.",
        en: "Don't worry about the exam; I promise I will help you.",
        adds: "قولِ درجا با will می‌آید؛ فارسی «می‌کنم» می‌گوید ولی انگلیسی will می‌خواهد.",
        mistake: {
          wrong: "I promise I will to help you.",
          right: "I promise I will help you.",
          why: "بعد از will مصدرِ بدونِ to می‌آید؛ will to help غلط است.",
        },
      },
      {
        fa: "فکر می‌کنم دانش برای تو درهای زیادی را در آینده باز خواهد کرد.",
        en: "I think knowledge will open many doors for you in the future.",
        adds: "پیش‌بینی با will؛ بعدش مصدرِ بدونِ to — بدونِ s چون will خودش علامتِ فعل است.",
        mistake: {
          wrong: "I think knowledge will opens many doors for you.",
          right: "I think knowledge will open many doors for you.",
          why: "بعد از will فعل شکلِ ساده می‌گیرد؛ s فقط وقتی می‌آید که will نباشد.",
        },
      },
    ],
    try: [
      {
        prompt: "I think knowledge ___ many doors for you in the future.",
        options: ["will opens", "will open", "opens"],
        answer: 1,
        why: "پیش‌بینی با will + مصدرِ بدونِ to: will open.",
      },
      {
        prompt: "It is late. I ___ you to the bus stop.",
        options: ["will take", "take", "am taking"],
        answer: 0,
        why: "تصمیمِ لحظه‌ایِ همین حالا → will: I will take you.",
      },
      {
        prompt: "___ you ___ me with my essay tonight?",
        options: ["Will / help", "Will / helped", "Do / helped"],
        answer: 0,
        why: "سؤالِ آینده: Will + فاعل + مصدرِ بدونِ to: Will you help.",
      },
    ],
  },
  {
    stationId: "g-future-going",
    hook: "برنامهٔ ازپیش‌بسته یا شاهدِ بیرونی؟ be going to — فارسیِ دقیقش «قرار است / می‌خواهد» است.",
    see: {
      pieces: [
        { text: "Look at those black clouds!", role: "rest" },
        { text: "It", role: "subject" },
        { text: "is going to rain", role: "verb" },
      ],
      timebar: { label: "آینده — با نشانه و برنامه", marker: 85 },
      note: "شاهدِ بیرونی (ابرهای سیاه) یا برنامهٔ آماده → be going to؛ تصمیمِ درجا → will.",
    },
    mirrors: [
      {
        fa: "به آن ابرهای سیاه نگاه کن! باران می‌خواهد ببارد.",
        en: "Look at those black clouds! It is going to rain.",
        adds: "نشانهٔ بیرونی → be going to؛ فارسی «می‌خواهد ببارد» دقیقاً همان حسِ نزدیکیِ آینده را دارد.",
        mistake: {
          wrong: "Look at those black clouds! It will rain.",
          right: "Look at those black clouds! It is going to rain.",
          why: "با شاهدِ چشمیِ همین حالا، be going to دقیق‌تر است؛ will برای پیش‌بینیِ بدونِ شاهد.",
        },
      },
      {
        fa: "ماهِ آینده برای مدرسه‌مان کتابخانهٔ کوچکی می‌سازیم؛ نقشه آماده است.",
        en: "We are going to build a small library in our school next month; the plan is ready.",
        adds: "برنامهٔ آماده → be going to؛ علامتش این است که «نقشه/قرار» از قبل وجود دارد.",
        mistake: {
          wrong: "We will build a small library next month; the plan is ready.",
          right: "We are going to build a small library next month; the plan is ready.",
          why: "وقتی برنامه از قبل بسته شده، be going to درست‌تر است.",
        },
      },
    ],
    try: [
      {
        prompt: "Look at those black clouds! It ___ rain.",
        options: ["is going to", "will be", "goes to"],
        answer: 0,
        why: "شاهدِ بیرونی → be going to: is going to rain.",
      },
      {
        prompt: "We ___ a small library in our school next month; the plan is ready.",
        options: ["are going to build", "will building", "are building to"],
        answer: 0,
        why: "برنامهٔ آماده → are going to + مصدرِ ساده.",
      },
      {
        prompt: "I am going to ___ a book about Persian scientists.",
        options: ["reading", "read", "reads"],
        answer: 1,
        why: "بعد از be going to مصدرِ ساده می‌آید: read.",
      },
    ],
  },
  {
    stationId: "g-verb-infinitive",
    hook: "فعل‌های «نیت و تصمیم» بعدشان to می‌خواهند: hope، decide، promise، try — قراردادِ آینده با to بسته می‌شود.",
    see: {
      pieces: [
        { text: "She", role: "subject" },
        { text: "hopes", role: "verb" },
        { text: "to study", role: "rest" },
        { text: "medicine", role: "object" },
        { text: "at university one day", role: "rest" },
      ],
      note: "hope/decide/promise/try/plan + to + مصدر؛ برخلاف enjoy/finish که ing می‌گیرند — دو الگوی متضاد.",
    },
    mirrors: [
      {
        fa: "او امیدوار است روزی در دانشگاه پزشکی بخواند.",
        en: "She hopes to study medicine at university one day.",
        adds: "فارسی فعلِ صرف‌شده می‌آید؛ انگلیسی hope + to + مصدر — دو فعل با to وصل می‌شوند.",
        mistake: {
          wrong: "She hopes studying medicine at university one day.",
          right: "She hopes to study medicine at university one day.",
          why: "hope بعدش to می‌خواهد نه ing: hopes to study.",
        },
      },
      {
        fa: "او قول داد کتاب را به‌موقع به کتابخانه برگرداند.",
        en: "He promised to return the book to the library on time.",
        adds: "promise + to + مصدر — وعدهٔ آینده همیشه با to بسته می‌شود.",
        mistake: {
          wrong: "He promised returning the book to the library on time.",
          right: "He promised to return the book to the library on time.",
          why: "promise بعدش to می‌گیرد: promised to return — نه ing.",
        },
      },
    ],
    try: [
      {
        prompt: "She hopes ___ medicine at university one day.",
        options: ["to study", "studying", "study"],
        answer: 0,
        why: "hope + to: hopes to study.",
      },
      {
        prompt: "We decided ___ a new skill this summer.",
        options: ["learning", "learn", "to learn"],
        answer: 2,
        why: "decide + to: decided to learn.",
      },
      {
        prompt: "I enjoy ___ in the quiet library, but I hope ___ more books at home.",
        options: ["reading / to read", "to read / reading", "read / read"],
        answer: 0,
        why: "enjoy بعدش ing و hope بعدش to — دو الگوی متضاد در یک جمله.",
      },
    ],
  },

  // ---------------- خط ۱۲-۱۴ — متوسطهٔ اول (راند ۱۹۸، قفسهٔ شش‌پایه) ----------------
  {
    stationId: "g-be-intro",
    hook: "اولین جملهٔ هر زبان‌آموز «I am …» است؛ اما همین جمله در امتحان به سؤال و منفی تبدیل می‌شود. این ایستگاه ستونِ معرفی است.",
    see: {
      pieces: [
        { text: "I", role: "subject" },
        { text: "am", role: "verb" },
        { text: "a student", role: "rest" },
      ],
      note: "am فقط با I می‌نشیند؛ is با او/او (مفرد) و are با شما/ما/آن‌ها — فعل به فاعل می‌چسبد.",
    },
    mirrors: [
      {
        fa: "من دانش‌آموز پایهٔ هفتم هستم.",
        en: "I am a seventh-grade student.",
        adds: "معرفیِ خود همیشه با am شروع می‌شود؛ شکلِ کوتاه I'm در مکالمه رایج است.",
        mistake: {
          wrong: "I is a seventh-grade student.",
          right: "I am a seventh-grade student.",
          why: "فعل is هرگز با I نمی‌آید؛ جفتِ همیشگیِ I با am است.",
        },
      },
      {
        fa: "تو هم‌کلاسیِ تازه‌ای هستی؟",
        en: "Are you a new classmate?",
        adds: "در سؤال، فعل to be از میانهٔ جمله به اول می‌آید؛ جواب کوتاه: Yes, I am.",
        mistake: {
          wrong: "You are a new classmate? — Yes, I are.",
          right: "Are you a new classmate? — Yes, I am.",
          why: "سؤال به جابه‌جایی فعل نیاز دارد؛ و پاسخِ کوتاهِ you همیشه I am است نه I are.",
        },
      },
    ],
    try: [
      {
        prompt: "My sister ___ a nurse in a big hospital.",
        options: ["am", "is", "are"],
        answer: 1,
        why: "سوم‌شخصِ مفرد (my sister) با is جفت می‌شود.",
      },
      {
        prompt: "___ you a new student? — Yes, I am.",
        options: ["Are", "Is", "Am"],
        answer: 0,
        why: "سؤال با you همیشه Are می‌گیرد.",
      },
      {
        prompt: "We ___ in the seventh grade this year.",
        options: ["is", "am", "are"],
        answer: 2,
        why: "we جمع است → are.",
      },
    ],
  },
  {
    stationId: "g-demonstratives",
    hook: "با چهار کلمهٔ this/that/these/those می‌توانی به همه‌چیزِ کلاس اشاره کنی؛ اما فعلِ بعدشان مفرد است یا جمع؟ این‌جا یاد می‌گیری.",
    see: {
      pieces: [
        { text: "These", role: "rest" },
        { text: "are", role: "verb" },
        { text: "my books", role: "rest" },
      ],
      note: "نزدیک و مفرد → this is؛ دور و مفرد → that is؛ جمع‌ها → these/those + are.",
    },
    mirrors: [
      {
        fa: "این‌ها کتاب‌های من‌اند.",
        en: "These are my books.",
        adds: "these برای جمعِ نزدیک است و فعلِ جمع are را می‌کشد.",
        mistake: {
          wrong: "These is my books.",
          right: "These are my books.",
          why: "these جمع است؛ فعلش هم باید جمع باشد: are.",
        },
      },
      {
        fa: "آن (دور) مدرسهٔ ماست.",
        en: "That is our school.",
        adds: "چیزی که دور است با that نشان داده می‌شود و فعل مفرد is می‌گیرد.",
        mistake: {
          wrong: "That are our school.",
          right: "That is our school.",
          why: "that مفرد است؛ is می‌گیرد — are مالِ these/those است.",
        },
      },
    ],
    try: [
      {
        prompt: "___ is my desk and ___ is your chair (دور).",
        options: ["This / that", "These / those", "That / this"],
        answer: 0,
        why: "نزدیک → this، دور → that؛ هر دو مفرد با is.",
      },
      {
        prompt: "Look at ___ pens over there!",
        options: ["this", "those", "that"],
        answer: 1,
        why: "pens جمع + over there (دور) → those.",
      },
      {
        prompt: "I have three English ___ in my bag.",
        options: ["dictionarys", "dictionaries", "dictionaryes"],
        answer: 1,
        why: "اسمِ تمام‌شده به «صدادار + y» جمعش -ies می‌گیرد: dictionaries.",
      },
    ],
  },
  {
    stationId: "g-possessive-jobs",
    hook: "«کیفِ او» یا «bag his»؟ و چرا شغلِ هرکس با a/an می‌آید؟ این ایستگاه مالکیت و مشاغل را تمیز می‌کند.",
    see: {
      pieces: [
        { text: "Her", role: "rest" },
        { text: "bag", role: "rest" },
        { text: "is", role: "verb" },
        { text: "new", role: "rest" },
      ],
      note: "my/your/his/her همیشه «قبل از اسم» می‌آیند و با a/an جمع نمی‌شوند.",
    },
    mirrors: [
      {
        fa: "مادر او پرستار است.",
        en: "His mother is a nurse.",
        adds: "صفت ملکی (his) قبل از اسم؛ شغلِ مفرد با a می‌آید.",
        mistake: {
          wrong: "Him mother is nurse.",
          right: "His mother is a nurse.",
          why: "صفت ملکی his است نه him؛ و شغل بدون a نمی‌ماند.",
        },
      },
      {
        fa: "او مهندسِ یک شرکت بزرگ است.",
        en: "She is an engineer at a big company.",
        adds: "قبل از صدادار (engineer) → an؛ قبل از همخوان → a.",
        mistake: {
          wrong: "She is a engineer at a big company.",
          right: "She is an engineer at a big company.",
          why: "engineer با صدای صدادار شروع می‌شود؛ a/an باید با صدا هماهنگ باشد.",
        },
      },
    ],
    try: [
      {
        prompt: "Sara is my classmate. ___ bag is blue.",
        options: ["His", "Her", "Your"],
        answer: 1,
        why: "Sara زن است → her.",
      },
      {
        prompt: "My father is ___ taxi driver.",
        options: ["a", "an", "the"],
        answer: 0,
        why: "taxi با همخوان شروع می‌شود → a.",
      },
      {
        prompt: "___ name is Reza and he is my best friend.",
        options: ["His", "Her", "Their"],
        answer: 0,
        why: "he → his؛ جمله با he ادامه دارد.",
      },
    ],
  },
  {
    stationId: "g-nationalities",
    hook: "از کجایی؟ I'm from Iran — ولی «ایرانی» به انگلیسی چیست؟ پسوندهای ملیت قاعدهٔ کوچک و پرتکراری دارند.",
    see: {
      pieces: [
        { text: "He", role: "subject" },
        { text: "is from", role: "verb" },
        { text: "China", role: "rest" },
        { text: "→ He is Chinese", role: "rest" },
      ],
      note: "کشور با be from می‌آید؛ ملیت با پسوند: -ian (Iran→Iranian)، -ese (China→Chinese)، -ish (Spain→Spanish).",
    },
    mirrors: [
      {
        fa: "من از ایرانم و فارسی صحبت می‌کنم.",
        en: "I am from Iran and I speak Persian.",
        adds: "be from + کشور برای اصل و نسب؛ زبانِ گفتن با speak می‌آید.",
        mistake: {
          wrong: "I am Iran and I speak Iran.",
          right: "I am from Iran and I speak Persian.",
          why: "از کشور با from می‌گوییم؛ زبانِ ایران فارسی است نه «ایرانی».",
        },
      },
      {
        fa: "دوست من برزیلی است.",
        en: "My friend is Brazilian.",
        adds: "Brazil → Brazilian؛ ملیت همیشه با حرف بزرگ نوشته می‌شود.",
        mistake: {
          wrong: "My friend is brazilian.",
          right: "My friend is Brazilian.",
          why: "ملیت‌ها (مثل اسم کشورها) با حرف بزرگ شروع می‌شوند.",
        },
      },
    ],
    try: [
      {
        prompt: "Jack was born in Sydney; he is ___.",
        options: ["Australian", "Australia", "Australia's"],
        answer: 0,
        why: "ملیتِ استرالیا: Australian (پسوند -ian).",
      },
      {
        prompt: "Paris is the capital of France and ___ people speak French.",
        options: ["France", "French", "France's"],
        answer: 1,
        why: "مردم/زبانِ فرانسه: French.",
      },
      {
        prompt: "A: What's her nationality? B: She is ___.",
        options: ["Spain", "Spanish", "Spain-country"],
        answer: 1,
        why: "ملیتِ اسپانیا: Spanish (پسوند -ish).",
      },
    ],
  },
  {
    stationId: "g-can-ability",
    hook: "«می‌توانم» یعنی can — اما چرا بعدش هیچ‌وقت s نمی‌آید؟ چون can فعلِ کمکی است و فعلِ اصلی را ساده نگه می‌دارد.",
    see: {
      pieces: [
        { text: "She", role: "subject" },
        { text: "can", role: "verb" },
        { text: "ride", role: "rest" },
        { text: "a bicycle", role: "rest" },
      ],
      note: "can + فعلِ ساده؛ منفی: can't؛ سؤال: Can you…? — ترکیب‌ها: play football، go shopping، make a cake.",
    },
    mirrors: [
      {
        fa: "تو می‌توانی دوچرخه‌سواری کنی؟",
        en: "Can you ride a bicycle?",
        adds: "سؤالِ توانایی با جابه‌جایی can به اول جمله ساخته می‌شود.",
        mistake: {
          wrong: "Do you can ride a bicycle?",
          right: "Can you ride a bicycle?",
          why: "can خودش فعلِ کمکی است و با do ساخته نمی‌شود.",
        },
      },
      {
        fa: "او اصلاً نمی‌تواند آشپزی کند.",
        en: "He can't cook at all.",
        adds: "منفیِ can = can't (cannot)؛ بعدش فعل ساده.",
        mistake: {
          wrong: "He can't cooks at all.",
          right: "He can't cook at all.",
          why: "بعد از can/can't فعلِ اصلی هرگز s نمی‌گیرد.",
        },
      },
    ],
    try: [
      {
        prompt: "Tara can ___ a bicycle very well.",
        options: ["rides", "riding", "ride"],
        answer: 2,
        why: "بعد از can فعل ساده می‌آید: ride.",
      },
      {
        prompt: "___ you help me with this puzzle, please?",
        options: ["Can", "Are", "Do"],
        answer: 0,
        why: "درخواستِ توانایی با Can شروع می‌شود.",
      },
      {
        prompt: "I can play ___ but I can't play ___.",
        options: ["tennis / the piano", "the tennis / piano", "a tennis / the piano"],
        answer: 0,
        why: "ورزش بدون the می‌آید؛ سازهٔ موسیقی با the.",
      },
    ],
  },
  {
    stationId: "g-there-advice",
    hook: "«یک ایستگاه مترو هست» و «باید استراحت کنی» — دو ابزارِ روزمرهٔ هشتم: there is/are برای وجود، should برای توصیه.",
    see: {
      pieces: [
        { text: "There", role: "rest" },
        { text: "is", role: "verb" },
        { text: "a metro station", role: "rest" },
        { text: "near the park", role: "rest" },
      ],
      note: "مفرد → there is؛ جمع → there are؛ توصیه → should + فعل ساده؛ پیشنهاد → Why don't you + فعل ساده؟",
    },
    mirrors: [
      {
        fa: "در مزرعه شش گاو هست.",
        en: "There are six cows on the farm.",
        adds: "جمعِ واقعی (six cows) فعلِ جمع می‌خواهد: there are.",
        mistake: {
          wrong: "There is six cows on the farm.",
          right: "There are six cows on the farm.",
          why: "بعد از there، فعل با اولین اسمِ بعدی جفت می‌شود؛ cows جمع است.",
        },
      },
      {
        fa: "آنفلوانزا داری؛ باید خانه بمانی.",
        en: "You have the flu; you should stay at home.",
        adds: "should برای نصیحتِ دوستانه؛ بعدش فعل ساده — بدون to.",
        mistake: {
          wrong: "You should to stay at home.",
          right: "You should stay at home.",
          why: "بعد از should فعلِ ساده می‌آید؛ to مالِ want/hope است.",
        },
      },
    ],
    try: [
      {
        prompt: "___ don't you come with us next Thursday?",
        options: ["What", "Why", "Where"],
        answer: 1,
        why: "پیشنهادِ دوستانه با Why don't you…? ساخته می‌شود.",
      },
      {
        prompt: "You have a bad cough. You ___ rest and drink warm tea.",
        options: ["should", "can't", "aren't"],
        answer: 0,
        why: "توصیهٔ پزشکی → should + فعل ساده.",
      },
      {
        prompt: "___ there a cinema in your neighborhood?",
        options: ["Are", "Is", "Do"],
        answer: 1,
        why: "a cinema مفرد است → Is there.",
      },
    ],
  },
  {
    stationId: "g-personality-adj",
    hook: "«او مهربان است» — صفت بعد از be می‌نشیند؛ اما در «آدمِ مهربان» فعل حذف می‌شود. جای صفت، امتحانِ نهم را تعیین می‌کند.",
    see: {
      pieces: [
        { text: "He", role: "subject" },
        { text: "is", role: "verb" },
        { text: "kind", role: "rest" },
      ],
      note: "be + صفت (He is kind) در برابر صفت + اسم (a kind man) — صفت هرگز جمع نمی‌شود.",
    },
    mirrors: [
      {
        fa: "برادر نسرین جدی نیست؛ بامزه است.",
        en: "Nasrin's brother is not serious; he is quite funny.",
        adds: "بعد از be صفت می‌آید؛ quite/very شدت می‌دهد.",
        mistake: {
          wrong: "Nasrin's brother is not seriously; he is quite funnily.",
          right: "Nasrin's brother is not serious; he is quite funny.",
          why: "بعد از be صفت می‌آید نه قید — seriously/funnily قیدند.",
        },
      },
      {
        fa: "او سربازِ شجاعِ مهربانی بود.",
        en: "He was a brave and kind soldier.",
        adds: "چند صفت قبل از اسم می‌آیند و با and وصل می‌شوند.",
        mistake: {
          wrong: "He was a bravely and kindly soldier.",
          right: "He was a brave and kind soldier.",
          why: "قبل از اسم، شکلِ صفی می‌آید نه قیدی.",
        },
      },
    ],
    try: [
      {
        prompt: "My best friend ___ very kind and generous.",
        options: ["are", "is", "be"],
        answer: 1,
        why: "فاعل مفرد → is + صفت.",
      },
      {
        prompt: "We don't like ___ people who never help others.",
        options: ["selfishness", "selfishly", "selfish"],
        answer: 2,
        why: "قبل از اسمِ people صفت می‌آید: selfish.",
      },
      {
        prompt: "The students of class two ___ hard-working.",
        options: ["is", "was", "are"],
        answer: 2,
        why: "فاعل جمع → are.",
      },
    ],
  },
  {
    stationId: "g-present-progressive",
    hook: "«الان دارم برنامهٔ محبوبم را می‌بینم» — برای کارِ در جریان، انگلیسی از ing استفاده می‌کند؛ نشانگرهایش را بشناس.",
    see: {
      pieces: [
        { text: "I", role: "subject" },
        { text: "am watching", role: "verb" },
        { text: "TV", role: "rest" },
        { text: "now", role: "rest" },
      ],
      note: "am/is/are + V-ing؛ نشانگرها: now، at the moment، Look!، Listen! — know/want/like استمراری نمی‌گیرند.",
    },
    mirrors: [
      {
        fa: "الان نمی‌توانم حرف بزنم؛ دارم تکالیفم را انجام می‌دهم.",
        en: "I can't talk now; I am doing my homework.",
        adds: "کارِ در جریان در لحظهٔ حرف زدن → حال استمراری.",
        mistake: {
          wrong: "I can't talk now; I do my homework.",
          right: "I can't talk now; I am doing my homework.",
          why: "حال ساده برای عادت است؛ کاری که همین حالا جریان دارد استمراری می‌خواهد.",
        },
      },
      {
        fa: "بچه‌ها همین حالا از بنای قدیمی عکس می‌گیرند.",
        en: "The kids are taking photos of the old building at the moment.",
        adds: "at the moment نشانگرِ استمراری است؛ write→writing حرفِ e را می‌اندازد.",
        mistake: {
          wrong: "The kids are takeing photos at the moment.",
          right: "The kids are taking photos at the moment.",
          why: "فعلِ تمام‌شده به e بی‌صدا، قبل از ing حرف e را حذف می‌کند: take → taking.",
        },
      },
    ],
    try: [
      {
        prompt: "Listen! The baby ___ in her bedroom.",
        options: ["sleeps", "is sleeping", "slept"],
        answer: 1,
        why: "بعد از Listen! کارِ در جریان → حال استمراری.",
      },
      {
        prompt: "I ___ my homework now.",
        options: ["am doing", "do", "did"],
        answer: 0,
        why: "now نشانگرِ حال استمراری است.",
      },
      {
        prompt: "He can't come to the phone; he ___ a shower.",
        options: ["is taking", "takes", "took"],
        answer: 0,
        why: "همین لحظه در جریان است → استمراری.",
      },
    ],
  },
  {
    stationId: "g-past-narrative",
    hook: "«دیشب مستند را دیدیم» — گذشتهٔ تمام‌شده. باقاعده‌ها -ed می‌گیرند؛ بی‌قاعده‌ها شکلِ دومِ خودشان را دارند و بعد از did همه ساده می‌شوند.",
    see: {
      pieces: [
        { text: "We", role: "subject" },
        { text: "watched", role: "verb" },
        { text: "the documentary", role: "rest" },
        { text: "last night", role: "rest" },
      ],
      note: "watch→watched (باقاعده)؛ go→went، see→saw، lose→lost (بی‌قاعده)؛ منفی/سؤال با did + فعل ساده.",
    },
    mirrors: [
      {
        fa: "او پارسال به اهواز سفر کرد.",
        en: "He traveled to Ahvaz last year.",
        adds: "فعلِ باقاعده + ed؛ نشانگرِ زمانِ گذشته (last year) کنارش می‌آید.",
        mistake: {
          wrong: "He travel to Ahvaz last year.",
          right: "He traveled to Ahvaz last year.",
          why: "گذشتهٔ سادهٔ فعلِ باقاعده ed می‌گیرد؛ شکلِ حال نمی‌ماند.",
        },
      },
      {
        fa: "دیروز به اخبار گوش ندادی؟",
        en: "Didn't you listen to the news yesterday?",
        adds: "بعد از didn't فعل برمی‌گردد به شکل ساده — گذشته فقط یک‌بار می‌آید.",
        mistake: {
          wrong: "Didn't you listened to the news yesterday?",
          right: "Didn't you listen to the news yesterday?",
          why: "did قبلاً گذشته را نشان داده؛ فعلِ اصلی ساده می‌ماند.",
        },
      },
    ],
    try: [
      {
        prompt: "We ___ to Mashhad two years ago.",
        options: ["go", "went", "are going"],
        answer: 1,
        why: "go بی‌قاعده است: went؛ two years ago گذشتهٔ قطعی.",
      },
      {
        prompt: "___ you see the news yesterday evening?",
        options: ["Did", "Do", "Are"],
        answer: 0,
        why: "سؤالِ گذشته با did + فعل ساده ساخته می‌شود.",
      },
      {
        prompt: "Reza was upset because he ___ his wallet at the station.",
        options: ["loses", "lost", "is losing"],
        answer: 1,
        why: "lose → lost (بی‌قاعده)؛ جملهٔ توضیح در گذشته است.",
      },
    ],
  },
];
