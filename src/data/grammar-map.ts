// ---------------------------------------------------------------------
// متروی گرامر — Task 39 (مرحلهٔ ۱ «ستون فقرات» از نقشهٔ راه گرامر)
// docs/grammar-roadmap.md — ایدهٔ مرکزی: کل گرامر کتاب یک نقشهٔ مترو است.
//
// ایستگاه‌ها = سکشن‌های واقعی گرامر کتاب (همان سکشن‌هایی که در تب «گرامر»
// هر درس سرو می‌شوند) + خط‌بندی خانوادگی؛ هیچ محتوایی از بیرون کتاب
// نیامده تا با امتحان مدرسه هم‌راستا بماند.
// راند ۱۹۶: با ورود جزوه‌های پایهٔ دهم (درس‌های ۷-۹)، نقشه از ۶ خطِ
// ویژن ۲ به ۱۱ خطِ سه‌پایه گسترش یافت — مجهول، نقل قول، حال/ربط،
// گذشته/مقایسه و آینده، هرکدام یک خط مستقل با رنگ خانوادهٔ خودش.
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
  | "orange"
  | "sky"
  | "fuchsia"
  | "lime"
  | "indigo"
  | "cyan";

export interface GrammarStation {
  id: string; // پایدار و بدون فاصله — کلید پیشرفت از روی آن ساخته می‌شود
  fa: string;
  en: string;
  lesson: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
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
  {
    id: 7,
    fa: "خط مجهول",
    en: "Passive Voice",
    color: "sky",
    stations: [
      {
        id: "g-passive-base",
        fa: "فعال و مجهول",
        en: "Active vs Passive",
        lesson: 4,
        section: 0,
        quizIds: ["l4-g9", "l4-g14", "l4-g11"],
        tip: "مجهول = be + p.p. مفعول می‌آید اول؛ فاعل یا حذف می‌شود یا با by می‌آید.",
      },
      {
        id: "g-passive-present",
        fa: "مجهول حال ساده",
        en: "Present Simple Passive",
        lesson: 4,
        section: 1,
        quizIds: ["l4-g1", "l4-g3", "l4-g6", "l4-g8", "l4-g4"],
        tip: "am/is/are + p.p.: Rice is grown — برچسب‌های زمانِ حال: every year، today، usually.",
      },
      {
        id: "g-passive-past",
        fa: "مجهول گذشتهٔ ساده",
        en: "Past Simple Passive",
        lesson: 4,
        section: 2,
        quizIds: ["l4-g2", "l4-g7", "l4-g12", "l4-g13", "l4-g10"],
        tip: "was/were + p.p.: The bridge was built — برچسب‌ها: ago، last، yesterday، in 1920.",
      },
      {
        id: "g-passive-exam",
        fa: "نکات کنکوری مجهول",
        en: "Passive Exam Traps",
        lesson: 4,
        section: 3,
        quizIds: ["l4-g5", "l4-g9", "l4-g14"],
        tip: "«Who…؟» مجهول می‌شود «By whom…؟»؛ فعلِ بدونِ مفعول هرگز مجهول نمی‌شود — تلهٔ همیشگی.",
      },
      {
        id: "g-passive-future",
        fa: "مجهول آینده",
        en: "Future Passive",
        lesson: 5,
        section: 0,
        quizIds: ["l5-g1", "l5-g3", "l5-g7", "l5-g8", "l5-g12"],
        tip: "will be + p.p.: The results will be announced — بعد از will هرگز p.p. تنها نمی‌آید.",
      },
      {
        id: "g-passive-modal",
        fa: "مجهول با افعال ناقص",
        en: "Modal Passive",
        lesson: 5,
        section: 1,
        quizIds: ["l5-g4", "l5-g10", "l5-g11", "l5-g14"],
        tip: "قاعدهٔ طلایی: بعد از هر فعل ناقص، be + p.p. — must be protected، can be solved.",
      },
      {
        id: "g-passive-detect",
        fa: "تشخیص مجهول در تست",
        en: "Spotting Passive",
        lesson: 5,
        section: 2,
        quizIds: ["l5-g2", "l5-g5", "l5-g6", "l5-g13", "l5-g15"],
        tip: "اول دنبال by و برچسب زمان بگرد؛ بدونِ by هم مجهول ممکن است — فعل کامل بودن را ببین.",
      },
    ],
  },
  {
    id: 8,
    fa: "خط نقل قول",
    en: "Reported Speech",
    color: "fuchsia",
    stations: [
      {
        id: "g-report-statements",
        fa: "نقل قول گزاره‌ای",
        en: "Reported Statements",
        lesson: 6,
        section: 0,
        quizIds: ["l6-g1", "l6-g2", "l6-g5", "l6-g9", "l6-g12"],
        tip: "said → said that + جمله عقب می‌رود یک زمان: am→was، will→would، can→could.",
      },
      {
        id: "g-report-shifts",
        fa: "تغییر ضمایر و قیدها",
        en: "Pronoun & Time Shifts",
        lesson: 6,
        section: 1,
        quizIds: ["l6-g15", "l6-g5", "l6-g2"],
        tip: "نقل قول یعنی نگاه از جای دیگر: here→there، tomorrow→the next day، now→then.",
      },
      {
        id: "g-report-questions",
        fa: "نقل قول سؤالی",
        en: "Reported Questions",
        lesson: 6,
        section: 2,
        quizIds: ["l6-g3", "l6-g4", "l6-g8", "l6-g10", "l6-g14"],
        tip: "سؤال در نقل قول ریخت‌وعقم خودش را می‌بازد: do/does/did حذف، ترتیب فاعل-فعل، if/whether برای بله/خیر.",
      },
    ],
  },
  {
    id: 9,
    fa: "خط حال و ربط",
    en: "Present & Linking",
    color: "lime",
    stations: [
      {
        id: "g-present-vs-prog",
        fa: "حال ساده یا استمراری",
        en: "Simple vs Progressive",
        lesson: 7,
        section: 0,
        quizIds: ["l7-g1", "l7-g2", "l7-g3", "l7-g4", "l7-g5"],
        tip: "سرنخ استمراری: Look!، now، at the moment؛ سرنخ ساده: usually، every، عادت‌ها.",
      },
      {
        id: "g-linking",
        fa: "حروف ربط",
        en: "Linking Words",
        lesson: 7,
        section: 1,
        quizIds: ["l7-g6", "l7-g7", "l7-g8", "l7-g9", "l7-g10"],
        tip: "and=اضافه، but=برخلاف، or=انتخاب، so=نتیجه، because=دلیل — ربطِ نیمهٔ دوم را انتخاب می‌کند.",
      },
      {
        id: "g-adverbs",
        fa: "قید بسامد و حالت",
        en: "Frequency & Manner",
        lesson: 7,
        section: 2,
        quizIds: ["l7-g11", "l7-g12", "l7-g13", "l7-g14", "l7-g15"],
        tip: "always/often/never قبل از فعل اصلی و بعد از be؛ قید حالتِ ‎-ly‎ معمولاً آخر جمله.",
      },
    ],
  },
  {
    id: 10,
    fa: "خط گذشته و مقایسه",
    en: "Past & Comparison",
    color: "indigo",
    stations: [
      {
        id: "g-past-simple",
        fa: "گذشتهٔ ساده",
        en: "Simple Past",
        lesson: 8,
        section: 0,
        quizIds: ["l8-g1", "l8-g2", "l8-g3", "l8-g4", "l8-g5"],
        tip: "برچسبِ زمان قطعی (last night، ago، in 1390) یعنی گذشتهٔ ساده — نه حال کامل.",
      },
      {
        id: "g-comparatives",
        fa: "صفت‌های تفضیلی",
        en: "Comparatives",
        lesson: 8,
        section: 1,
        quizIds: ["l8-g6", "l8-g8", "l8-g12", "l8-g13", "l8-g14"],
        tip: "کوتاه: ‎-er‎ + than؛ بلند: more + صفت + than — بینِ دو چیز همیشه than.",
      },
      {
        id: "g-superlatives",
        fa: "صفت‌های عالی و برابری",
        en: "Superlatives & as...as",
        lesson: 8,
        section: 2,
        quizIds: ["l8-g9", "l8-g10", "l8-g11", "l8-g7"],
        tip: "برترین‌ها: the + ‎-est‎/most؛ برابری: as + صفت + as — «of all» یعنی عالی.",
      },
    ],
  },
  {
    id: 11,
    fa: "خط آینده",
    en: "Future Forms",
    color: "cyan",
    stations: [
      {
        id: "g-future-will",
        fa: "آینده با will",
        en: "Future with will",
        lesson: 9,
        section: 0,
        quizIds: ["l9-g1", "l9-g2", "l9-g3", "l9-g4", "l9-g5"],
        tip: "will برای تصمیمِ لحظه‌ای، پیش‌بینی و قول: I will help you — بعدش مصدرِ بدونِ to.",
      },
      {
        id: "g-future-going",
        fa: "be going to در برابر will",
        en: "Be Going To vs Will",
        lesson: 9,
        section: 1,
        quizIds: ["l9-g7", "l9-g8", "l9-g9", "l9-g10", "l9-g6"],
        tip: "برنامه/شاهدِ بیرونی → be going to (ابرهای سیاه = it is going to rain)؛ تصمیمِ درجا → will.",
      },
      {
        id: "g-verb-infinitive",
        fa: "فعل + مصدر با to",
        en: "Verb + to-Infinitive",
        lesson: 9,
        section: 2,
        quizIds: ["l9-g11", "l9-g12", "l9-g13", "l9-g14", "l9-g15"],
        tip: "hope/decide/promise/try + to — این فعل‌ها به «نیت» وصل‌اند و آینده را وعده می‌دهند.",
      },
    ],
  },
];

export const GRAMMAR_STATION_TOTAL = GRAMMAR_LINES.reduce(
  (n, l) => n + l.stations.length,
  0
);
