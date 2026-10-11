// ---------------------------------------------------------------------
// متروی گرامر — درس‌های ۹۰ثانیه‌ای PPP (Task 40 / مرحلهٔ ۲ «چشم‌ها»)
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
        options: ["cat", "cats", "a cat"],
        answer: 1,
        why: "بعد از عدد سه اسم جمع می‌شود: three cats.",
      },
      {
        prompt: "I saw ___ elephant at the zoo.",
        options: ["a", "an", "___"],
        answer: 1,
        why: "elephant با صدای مصوت شروع می‌شود؛ پس an می‌گیرد نه a.",
      },
      {
        prompt: "She is reading ___ interesting book.",
        options: ["a", "an", "much"],
        answer: 1,
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
        options: ["are", "is", "be"],
        answer: 1,
        why: "milk غیرقابل شمارش و مفرد است؛ پس is می‌گیرد نه are.",
      },
      {
        prompt: "How ___ money do you need?",
        options: ["many", "much", "few"],
        answer: 1,
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
        options: ["furniture", "chairs", "luggages"],
        answer: 1,
        why: "furniture و luggage غیرقابل شمارش‌اند و هرگز جمع نمی‌شوند؛ فقط chairs (قابل شمارش) بعد از three جمع می‌شود.",
      },
      {
        prompt: "Please give me ___ of advice.",
        options: ["two pieces", "a piece", "pieces"],
        answer: 1,
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
        options: ["loaf", "loaves", "loafs"],
        answer: 1,
        why: "واحد شمارش جمع می‌شود و جمعِ loaf بی‌قاعده است: loaves.",
      },
      {
        prompt: "How ___ students are there?",
        options: ["much", "many", "a lot"],
        answer: 1,
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
        options: ["fourty", "forty", "fourthy"],
        answer: 1,
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
        options: ["thirty five", "thirty-five", "thirtyfive"],
        answer: 1,
        why: "اعداد ترکیبی بین دهگان و یکان خط تیره می‌گیرند: thirty-five.",
      },
    ],
  },
];
