// ---------------------------------------------------------------------
// متروی گرامر — Task 39 (مرحلهٔ ۱ «ستون فقرات» از نقشهٔ راه گرامر)
// docs/grammar-roadmap.md — ایدهٔ مرکزی: کل گرامر کتاب یک نقشهٔ مترو است.
//
// ایستگاه‌ها = ۱۴ سکشن واقعی گرامر کتاب ویژن ۲ (همان سکشن‌هایی که در تب
// «گرامر» هر درس سرو می‌شوند) + خط‌بندی خانوادگی؛ هیچ محتوایی از بیرون
// کتاب نیامده تا با امتحان مدرسه هم‌راستا بماند.
//
// قراردادها:
//  - مسیر داخل هر خط یک‌طرفه است: ایستگاه i+1 فقط با سبز شدن ایستگاه i
//    باز می‌شود (سبز = آزمونک ایستگاه با ۸۰٪ یا بیشتر — GRAMMAR_GREEN).
//  - خط‌ها مستقل‌اند: ایستگاه اولِ هر خط همیشه باز است («نقشهٔ شخصی،
//    نه مسیر اجباری» — آزمون شناخت فقط پیشنهاد می‌دهد، قفل نمی‌کند).
//  - quizIds سؤال‌های ترجیحی ایستگاه‌اند؛ اگر سؤالِ اختصاصی کم باشد،
//    استخر گرامرِ همان درس مکمل می‌شود (lib/grammar-progress.ts).
//  - tip = بذر «کارت قاعده» (فاز ۳ نقشهٔ راه) — ترفند حفظ کوتاه.
// ---------------------------------------------------------------------

export type GrammarLineColor =
  | "emerald"
  | "amber"
  | "teal"
  | "rose"
  | "violet"
  | "orange";

export interface GrammarStation {
  id: string; // پایدار و بدون فاصله — کلید پیشرفت از روی آن ساخته می‌شود
  fa: string;
  en: string;
  lesson: 1 | 2 | 3;
  section: number; // ایندکس سکشن در lesson.grammar (از دادهٔ کتاب)
  quizIds: string[]; // سؤال‌های ترجیحی (ممکن است خالی باشد ← مکمل از استخر درس)
  tip: string; // ترفند حفظ کوتاه به فارسی
}

export interface GrammarLine {
  id: number;
  fa: string;
  en: string;
  color: GrammarLineColor;
  stations: GrammarStation[]; // ترتیب = زنجیرهٔ پیش‌نیاز
}

export const GRAMMAR_LINES: GrammarLine[] = [
  {
    id: 1,
    fa: "خط خانه — جملهٔ درست",
    en: "Sentence Building",
    color: "emerald",
    stations: [
      {
        id: "g-order",
        fa: "ترتیب اجزای جمله",
        en: "Word Order",
        lesson: 1,
        section: 5,
        quizIds: ["l1-g14", "l1-g15", "l1-g16", "l1-g17", "l1-g18"],
        tip: "ترتیب طلایی قیدها: حالت ← مکان ← زمان. «I saw him fast in the park yesterday.»",
      },
    ],
  },
  {
    id: 2,
    fa: "خط اسامی و کمیت",
    en: "Nouns & Quantity",
    color: "amber",
    stations: [
      {
        id: "g-count",
        fa: "اسامی قابل شمارش",
        en: "Countable Nouns",
        lesson: 1,
        section: 0,
        quizIds: ["l1-g7", "l1-g9", "l1-g11", "l1-g20"],
        tip: "قابل شمارش‌ها a می‌گیرند و جمع می‌شوند: many / few / one of the + جمع.",
      },
      {
        id: "g-uncount",
        fa: "اسامی غیرقابل شمارش",
        en: "Uncountable Nouns",
        lesson: 1,
        section: 1,
        quizIds: ["l1-g2", "l1-g5", "l1-g6", "l1-g10", "l1-g12"],
        tip: "غیرقابل شمارش همیشه مفرد است: much / little — هرگز many/few نه.",
      },
      {
        id: "g-uncount-groups",
        fa: "دسته‌های غیرشمارشی",
        en: "Uncountable Groups",
        lesson: 1,
        section: 2,
        quizIds: ["l1-g5", "l1-g10", "l1-g2", "l1-g13"],
        tip: "چهار گروه بزرگ: ماده (bread)، سیال (milk)، انتزاعی (advice)، مجموعه (luggage).",
      },
      {
        id: "g-quantity",
        fa: "صفات کمیت",
        en: "Quantifiers",
        lesson: 1,
        section: 3,
        quizIds: ["l1-g1", "l1-g3", "l1-g4", "l1-g8", "l1-g12"],
        tip: "کمیت با واحد شمارش می‌شود: two glasses of water — خودِ ماده هرگز جمع نمی‌شود.",
      },
      {
        id: "g-numbers",
        fa: "اعداد",
        en: "Numbers",
        lesson: 1,
        section: 4,
        quizIds: ["l1-g19", "l1-g11", "l1-g4", "l1-g8"],
        tip: "خط تیره فقط بین دهگان و یکان: thirty-nine؛ hundred و thousand بدون خط تیره.",
      },
    ],
  },
  {
    id: 3,
    fa: "خط حال کامل",
    en: "Present Perfect",
    color: "teal",
    stations: [
      {
        id: "g-present-perfect",
        fa: "زمان حال کامل",
        en: "Present Perfect",
        lesson: 2,
        section: 0,
        quizIds: [
          "l2-g1",
          "l2-g2",
          "l2-g3",
          "l2-g4",
          "l2-g5",
          "l2-g6",
          "l2-g7",
        ],
        tip: "حال کامل پلِ «گذشته تا اکنون» است؛ سرنخ‌ها: just، ever، yet، since، up to now.",
      },
    ],
  },
  {
    id: 4,
    fa: "خط فعل‌های ترکیبی",
    en: "Verb Patterns",
    color: "rose",
    stations: [
      {
        id: "g-phrasal-insep",
        fa: "دوکلمه‌ای جدا نشدنی",
        en: "Inseparable Phrasal Verbs",
        lesson: 2,
        section: 1,
        quizIds: [],
        tip: "جدا نشدنی‌ها همیشه چسبیده می‌مانند: look after him — هرگز him after look نه.",
      },
      {
        id: "g-phrasal-sep",
        fa: "دوکلمه‌ای جدا شدنی",
        en: "Separable Phrasal Verbs",
        lesson: 2,
        section: 2,
        quizIds: [],
        tip: "با مکمل اسم وسط آزاد است: turn the light off؛ با ضمیر حتماً جدا: turn it off.",
      },
      {
        id: "g-gerund",
        fa: "اسم مصدر",
        en: "Gerund",
        lesson: 2,
        section: 3,
        quizIds: [
          "l2-g8",
          "l2-g9",
          "l2-g10",
          "l2-g11",
          "l2-g12",
          "l2-g13",
          "l2-g14",
          "l2-g15",
        ],
        tip: "بعد از حرف اضافه و این فعل‌ها ing می‌آید: enjoy، avoid، imagine، finish.",
      },
      {
        id: "g-infinitive",
        fa: "مصدر با to",
        en: "Infinitive with to",
        lesson: 3,
        section: 2,
        quizIds: ["l3-g7", "l3-g12", "l3-g13", "l3-g14", "l3-g15"],
        tip: "decide/want/seem + to؛ الگوی Wh هم می‌پذیرد: I don't know how to use it.",
      },
    ],
  },
  {
    id: 5,
    fa: "خط شرط و احساس",
    en: "Condition & Feeling",
    color: "violet",
    stations: [
      {
        id: "g-cond1",
        fa: "شرطی نوع اول",
        en: "First Conditional",
        lesson: 3,
        section: 0,
        quizIds: [
          "l3-g1",
          "l3-g2",
          "l3-g3",
          "l3-g4",
          "l3-g5",
          "l3-g6",
          "l3-g7",
          "l3-g8",
          "l3-g9",
        ],
        tip: "بعد از if هرگز will نمی‌نشیند: if + حال ساده، جواب + will.",
      },
      {
        id: "g-ing-ed",
        fa: "صفات احساسی",
        en: "-ing / -ed Adjectives",
        lesson: 3,
        section: 1,
        quizIds: ["l3-g10", "l3-g11"],
        tip: "انسانِ احساس‌کننده → ed (tired man)؛ چیزی که احساس می‌سازد → ing (tiring day).",
      },
    ],
  },
  {
    id: 6,
    fa: "خط واژه‌سازی",
    en: "Word Formation",
    color: "orange",
    stations: [
      {
        id: "g-prefix",
        fa: "پیشوندها",
        en: "Prefixes",
        lesson: 2,
        section: 4,
        quizIds: [],
        tip: "un-/im-/in-/dis- معنی را برعکس می‌کنند: possible → impossible.",
      },
      {
        id: "g-suffix",
        fa: "پسوندها",
        en: "Suffixes",
        lesson: 2,
        section: 5,
        quizIds: [],
        tip: "ful یعنی پُر و less یعنی بی (careful/careless)؛ tion اسم می‌سازد.",
      },
    ],
  },
];

export const GRAMMAR_STATION_TOTAL = GRAMMAR_LINES.reduce(
  (n, l) => n + l.stations.length,
  0
);
