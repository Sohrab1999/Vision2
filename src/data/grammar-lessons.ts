// ---------------------------------------------------------------------
// متروی گرامر — درس‌های ۹۰ثانیه‌ای PPP (Task 40: خط‌های ۱-۲ / Task 41:
// خط‌های ۳-۶ → حالا هر ۱۵ ایستگاه نقشه درس دارند)
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
];
