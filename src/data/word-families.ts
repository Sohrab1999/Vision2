// راند ۲۲۲ — «اجزای کلماتی» از خودِ جزوه‌های جامع (بخشِ Parts of Speech).
// منبع: جدول‌های خانوادهٔ واژهٔ انتهای هر سه جزوه (دهم: ص~آخر، یازدهم، دوازدهم)
// که «مهم‌ترین اجزای کلماتیِ کنکور به ترتیب درس» هستند — ۱۰ جدول، ۲۴۳ خانواده.
//
// قراردادِ وفاداری (همان راندهای ۲۱۴-۲۲۱):
//   • ترتیبِ ستون‌ها عینِ جزوه: قید | صفت | فعل | معنی | اسم (جریانِ استخراج)
//   • خانهٔ خالیِ جزوه = رشتهٔ تهی (در UI با خطِ تیرهٔ کم‌رنگ رندر می‌شود) — هیچ
//     خانه‌ای ساختگی پر نمی‌شود؛ صفرِ صادقانه.
//   • «measurement» در خانهٔ فعلِ خانوادهٔ measure عینِ چاپِ جزوه است (غلطِ
//     چاپیِ خودِ جزوه) — دست نخورده ماند؛ و «Patience» با حرفِ بزرگِ خودِ جزوه.
//   • ترمیم‌های انجام‌شده فقط «سوپِ استخراج» هستند (جابه‌جایی/حذفِ حروفِ PDF،
//     «لا»ی عربی، کشیده) — هر ترمیم در REPAIRS مستند است؛ هیچ معنی/مثالِ
//     تازه‌ای ساخته نشده. شواهدِ متقاطع از واژگانِ خودِ جزوه: patient = «صبور»،
//     clear = «پاک/پاکی»، noise = «سروصدا» (سطر ۱۷۸۳۵: «پر رس وصدا»)،
//     respect = «احترام» (سطر ۲۲۰۸۴: «احیر ام بگذاریم»).
//   • واژهٔ «ناشر» در خانوادهٔ publish محتوای واژگانیِ خودِ جزوه است، نه
//     انتسابِ اثر — طبق سیاستِ حذفِ نامِ نویسنده/ناشر دست نخورده ماند.
//
// REPAIRS (سوپ → ترمیم): دسی یس→دسترسی، سالست→سلاست، فراوات→فراوانی،
//   مالحضه→ملاحظه، هسن→هستی، شگفنر→شگفتی، زیبات→زیبایی، تغیی→تغییر،
//   اطالعات→اطلاعات، عالقه→علاقه، معنز→معنی، شناسات→شناسایی، صی→صبور،
//   پایک→پاکی، سالمنر→سلامتی، خوشحایل→خوشحالی، رس و صدا→سروصدا،
//   ز ریاض→ریاضی، مخیر ع→مخترع، ناراحنر→ناراحتی، رسعت→سرعت، رسگری→سرگرمی،
//   تاری  خ→تاریخ، خارچ→خارج، احیر ام→احترام، راحن→راحت، شر ط→شرط،
//   گییحی→گیجی، ناراحن→ناراحتی، رص  ر→ضرر، فیر یک→فیزیک، پیش بین→پیش‌بینی،
//   تزئئر→تزئین، عنرص→عنصر، اخالق→اخلاق، معاشر ت→معاشرت، قدردات→قدردانی،
//   مهربات→مهربانی، پائیر→پایین، تمیر ی→تمیزی، شچشمه→سرچشمه، آلودیک→آلودگی،
//   ابتدات→ابتدا، شییم→شیمی، مسییح→مسیح، مرصف کننده→مصرف‌کننده،
//   آشیی ی→آشپزی، رهیی→رهبری، واکیس→واکس

export interface WordFamily {
  adverb: string; // قید
  adjective: string; // صفت
  verb: string; // فعل
  fa: string; // معنی — تهی یعنی خانهٔ خالیِ خودِ جزوه
  noun: string; // اسم
}

export interface WordFamilyTable {
  grade: "دهم" | "یازدهم" | "دوازدهم";
  vision: string; // نامِ انگلیسیِ پایه از خودِ جزوه (Vision One/Two/Three)
  lesson: string; // شمارهٔ درس از خودِ جزوه
  families: WordFamily[];
}

const F = (adverb: string, adjective: string, verb: string, fa: string, noun: string): WordFamily => ({
  adverb,
  adjective,
  verb,
  fa,
  noun,
});

export const WORD_FAMILY_TABLES: WordFamilyTable[] = [
  {
    grade: "دهم",
    vision: "Vision One",
    lesson: "درس اول",
    families: [
      F("amazingly", "amazing", "amaze", "شگفتی", "amusement"),
      F("attentively", "attentive", "attend", "توجه", "attention"),
      F("beautifully", "beautiful", "beautify", "زیبایی", "beauty"),
      F("carefully", "careful", "care", "مراقبت", "care"),
      F("changeably", "changeable", "change", "تغییر", "change"),
      F("correctly", "correct", "correct", "تصحیح", "correction"),
      F("creatively", "creative", "create", "خلقت", "creation"),
      F("dangerously", "dangerous", "endanger", "خطر", "danger"),
      F("destructively", "destructive", "destroy", "تخریب", "destruction"),
      F("differently", "different", "differ", "تفاوت", "difference"),
      F("", "divisible", "divide", "تقسیم", "division"),
      F("enjoyably", "enjoyable", "enjoy", "لذت", "enjoyment"),
      F("helpfully", "helpful", "help", "کمک", "help"),
      F("hopefully", "hopeful", "hope", "امید", "hope"),
      F("humanly", "inhuman", "humanize", "انسان", "human"),
      F("hurtfully", "hurtful", "hurt", "صدمه", "hurt"),
      F("identifiably", "identifiable", "identify", "شناسایی", "identification"),
      F("informatively", "informative", "inform", "اطلاعات", "information"),
      F("", "injured", "injure", "زخم", "injury"),
      F("interestedly", "interested", "interest", "علاقه", "interest"),
      F("knowledgeably", "knowledgeable", "know", "دانش", "knowledge"),
      F("", "alive", "live", "زندگی", "life"),
      F("meaningfully", "meaningful", "mean", "معنی", "meaning"),
      F("naturally", "natural", "", "طبیعت", "nature"),
      F("powerfully", "powerful", "power", "قدرت", "power"),
      F("protectively", "protective", "protect", "محافظت", "protection"),
      F("", "rainy", "rain", "باران", "rain"),
      F("safely", "safe", "save", "امنیت", "safety"),
      F("voluntarily", "voluntary", "volunteer", "داوطلب", "volunteer"),
      F("wildly", "wild", "", "حیات وحش", "wildlife"),
      F("wonderfully", "wonderful", "wonder", "شگفتی", "wonder"),
    ],
  },
  {
    grade: "دهم",
    vision: "Vision One",
    lesson: "درس دوم",
    families: [
      F("bloodily", "bloody", "bleed", "خون", "blood"),
      F("cheerfully", "cheerful", "cheer", "هورا، فریاد", "cheer"),
      F("clearly", "clear", "clear", "پاکی", "clearness"),
      F("collectively", "collective", "collect", "مجموعه", "collection"),
      F("comparably", "comparative", "compare", "مقایسه", "comparison"),
      F("", "", "feel", "احساس", "feeling"),
      F("finally", "final", "finalize", "آخرین", "final"),
      F("healthily", "healthy", "", "سلامتی", "health"),
      F("lightly", "light", "light", "نور", "light"),
      F("observably", "observable", "observe", "مشاهده", "observation"),
      F("really", "real", "", "واقعیت", "reality"),
      F("", "carriable", "carry", "حامل", "carrier"),
      F("defensively", "defendable", "defend", "مدافع", "defender"),
      F("happily", "happy", "", "خوشحالی", "happiness"),
      F("highly", "high", "", "ارتفاع", "height"),
      F("heatedly", "hot", "hot", "گرما", "heat"),
      F("painfully", "painful", "pain", "درد", "pain"),
      F("patiently", "patient", "", "صبور", "Patience"),
      F("plainly", "plain", "", "دشت", "plain"),
      F("poetically", "poetic", "poetize", "شعر", "poem"),
      F("", "prepared", "prepare", "آمادگی", "preparation"),
      F("", "priceless", "price", "قیمت", "price"),
      F("", "rocky", "rock", "سنگ", "rock"),
      F("", "solvable", "solve", "راه حل", "solution"),
      F("uselessly", "useless", "use", "استفاده", "usefulness"),
      F("widely", "wide", "widen", "پهنا، عرض", "width"),
    ],
  },
  {
    grade: "دهم",
    vision: "Vision One",
    lesson: "درس سوم",
    families: [
      F("actively", "active", "act", "عمل", "action"),
      F("believably", "believable", "believe", "اعتقاد", "belief"),
      F("", "buildable", "build", "ساختمان", "building"),
      F("", "cool", "cool", "کولر", "cooler"),
      F("developmentally", "developed", "develop", "توسعه", "development"),
      F("emotionally", "emotional", "emotionalize", "احساس", "emotion"),
      F("emphatically", "emphatic", "emphasize", "تأکید", "emphasis"),
      F("energetically", "energetic", "energize", "انرژی", "energy"),
      F("experimentally", "experimental", "", "آزمایش", "experiment"),
      F("expressively", "expressive", "express", "بیان", "expression"),
      F("inventively", "inventive", "invent", "مخترع", "inventor"),
      F("knowing", "knowing", "know", "دانش", "knowledge"),
      F("narratively", "narrative", "narrate", "گوینده", "narrator"),
      F("noiselessly", "noisy", "", "سروصدا", "noise"),
      F("noticeably", "noticeable", "notice", "توجه", "notice"),
      F("", "patterned", "pattern", "الگو، طرح", "pattern"),
      F("peacefully", "peaceful", "", "صلح", "peace"),
      F("", "publishable", "publish", "انتشار", "publication"),
      F("", "", "research", "محقق", "researcher"),
      F("relative", "relative", "relate", "ارتباط", "relation"),
      F("sadly", "sad", "sadden", "ناراحتی", "sadness"),
      F("scientifically", "scientific", "", "علم", "science"),
      F("successfully", "successful", "succeed", "موفقیت", "success"),
      F("senselessly", "senseless", "sense", "حس", "sense"),
      F("strangely", "strange", "", "غریبه", "stranger"),
      F("suddenly", "sudden", "", "سرعت", "suddenness"),
      F("", "thinkable", "think", "فکر", "thought"),
      F("", "translatable", "translate", "ترجمه", "translation"),
      F("usefully", "useful", "use", "استفاده", "use"),
      F("", "valuable", "value", "ارزش", "value"),
    ],
  },
  {
    grade: "دهم",
    vision: "Vision One",
    lesson: "درس چهارم",
    families: [
      F("attractively", "attractive", "attract", "جاذبه", "attraction"),
      F("", "behavioral", "behave", "رفتار", "behavior"),
      F("", "choice", "choose", "انتخاب", "choice"),
      F("", "cultural", "", "فرهنگ", "culture"),
      F("entertainingly", "entertaining", "entertain", "سرگرمی", "entertainment"),
      F("generously", "generous", "", "سخاوت", "generosity"),
      F("historically", "historic", "", "تاریخ", "history"),
      F("", "foreign", "", "خارج", "foreigner"),
      F("honestly", "honest", "", "صداقت", "honesty"),
      F("ill", "ill", "", "بیماری", "illness"),
      F("", "", "image", "تصویر", "image"),
      F("", "located", "locate", "محل", "location"),
      F("nationally", "national", "nationalize", "ملت", "nation"),
      F("", "obligatory", "oblige", "اجبار", "obligation"),
      F("", "", "plan", "نقشه", "plan"),
      F("politely", "polite", "", "ادب", "politeness"),
      F("popularly", "popular", "popularize", "محبوبیت", "popularity"),
      F("possibly", "possible", "", "احتمال", "possibility"),
      F("probably", "probable", "", "احتمال", "probability"),
      F("properly", "proper", "", "صحیح", ""),
      F("respectfully", "respectful", "respect", "احترام", "respect"),
      F("suggestively", "suggestive", "suggest", "پیشنهاد", "suggestion"),
      F("", "", "tour", "گردشگر", "tourist"),
    ],
  },
  {
    grade: "یازدهم",
    vision: "Vision Two",
    lesson: "درس اول",
    families: [
      F("absolutely", "absolute", "", "وجود مطلق", "absolute"),
      F("accessibly", "accessible", "access", "دسترسی", "access"),
      F("additionally", "additional", "add", "افزایش", "addition"),
      F("", "", "appear", "ظاهر", "appearance"),
      F("", "", "begin", "مبتدی", "beginner"),
      F("certainly", "certain", "", "اطمینان", "certainty"),
      F("communicatively", "communicative", "communicate", "ارتباط", "communication"),
      F("confidently", "confident", "", "اطمینان", "confidence"),
      F("decidedly", "decisive", "decide", "تصمیم", "decision"),
      F("exchangeably", "exchangeable", "exchange", "مبادله", "exchange"),
      F("", "existent", "exist", "هستی", "existence"),
      F("", "experienced", "experience", "تجربه", "experience"),
      F("", "explainable", "explain", "توضیح", "explanation"),
      F("fluently", "fluent", "", "سلاست", "fluency"),
      F("fortunately", "fortunate", "", "شانس", "fortune"),
      F("frequently", "frequent", "frequent", "فراوانی", "frequency"),
      F("considerably", "considerable", "consider", "ملاحظه", "consideration"),
      F("honestly", "honest", "", "صداقت", "honesty"),
      F("imaginatively", "imaginary", "imagine", "تخیل", "imagination"),
      F("", "improved", "improve", "بهبودی", "improvement"),
      F("", "", "label", "برچسب", "label"),
      F("loudly", "loud", "", "بلندی", "loudness"),
      F("", "", "matter", "اهمیت", "matter"),
      F("", "measureless", "measurement", "اندازه", "measurement"),
    ],
  },
  {
    grade: "یازدهم",
    vision: "Vision Two",
    lesson: "درس دوم",
    families: [
      F("actively", "inactive", "activate", "فعالیت", "activity"),
      F("", "addictive", "addict", "اعتیاد", "addiction"),
      F("", "balanced", "balance", "تعادل", "balance"),
      F("comfortably", "comfortable", "comfort", "راحت", "comfort"),
      F("conditionally", "conditional", "condition", "شرط", "condition"),
      F("productively", "productive", "produce", "تولید", "production"),
      F("variously", "various", "vary", "تنوع", "variety"),
      F("confusingly", "confused", "confuse", "گیجی", "confusion"),
      F("", "depressed", "depress", "ناراحتی", "depression"),
      F("", "discussable", "discuss", "بحث", "discussion"),
      F("", "educated", "educate", "آموزش", "education"),
      F("effectively", "effective", "affect", "اثر", "effect"),
      F("recently", "recent", "", "جدید", ""),
      F("", "simple", "simplify", "سهولت", "simplicity"),
      F("", "weighty", "weigh", "وزن", "weight"),
      F("", "forbidden", "forbid", "ممنوعیت", "forbiddance"),
      F("harmlessly", "harmless", "harm", "ضرر", "harm"),
      F("", "influential", "influence", "تأثیر", "influence"),
      F("", "uninvited", "invite", "دعوت", "invitation"),
      F("", "limited", "limit", "محدودیت", "limitation"),
      F("physically", "physical", "", "فیزیک", "physics"),
      F("", "predictive", "predict", "پیش‌بینی", "prediction"),
      F("", "winning", "win", "برنده", "winner"),
    ],
  },
  {
    grade: "یازدهم",
    vision: "Vision Two",
    lesson: "درس سوم",
    families: [
      F("decoratively", "decorative", "decorate", "تزئین", "decoration"),
      F("diversely", "diverse", "diversify", "تنوع", "diversity"),
      F("economically", "economic", "economize", "اقتصاد", "economy"),
      F("elementarily", "elementary", "", "عنصر", "element"),
      F("excitedly", "exciting", "excite", "هیجان", "excitement"),
      F("frighteningly", "frightening", "frighten", "ترساننده", "frightener"),
      F("identifiably", "identifiable", "identify", "هویت", "identity"),
      F("mentally", "mental", "", "ذهن، اندیشه", "mentality"),
      F("morally", "moral", "moralize", "اخلاق", "morality"),
      F("proudly", "proud", "", "غرور", "pride"),
      F("", "referential", "refer", "رجوع", "reference"),
      F("reflectively", "reflective", "reflect", "انعکاس", "reflection"),
      F("satisfyingly", "satisfied", "satisfy", "رضایت", "satisfaction"),
      F("shockingly", "shocking", "shock", "شوک", "shock"),
      F("skillfully", "skillful", "", "مهارت", "skill"),
      F("sociably", "sociable", "socialize", "معاشرت", "sociability"),
      F("surprisingly", "surprised", "surprise", "تعجب", "surprise"),
      F("totally", "total", "totalize", "کلیت", "totality"),
      F("traditionally", "traditional", "", "سنت", "tradition"),
      F("truthfully", "truthful", "", "صداقت", "truth"),
      F("vastly", "vast", "", "وسعت", "vastness"),
    ],
  },
  {
    grade: "دوازدهم",
    vision: "Vision Three",
    lesson: "درس اول",
    families: [
      F("accidentally", "accidental", "", "تصادف", "accident"),
      F("", "agreeable", "agree", "توافق", "agreement"),
      F("", "", "appreciate", "قدردانی", "appreciation"),
      F("", "", "babysit", "پرستار بچه", "babysitter"),
      F("", "combinable", "combine", "ترکیب", "combination"),
      F("", "confirmed", "confirm", "تأیید", "confirmation"),
      F("", "dedicated", "dedicate", "اهدا", "dedication"),
      F("", "describable", "describe", "توصیف", "description"),
      F("", "discoverable", "discover", "کشف", "discovery"),
      F("", "doable", "do", "انجام دهنده", "doer"),
      F("", "", "elicit", "استنباط", "elicitation"),
      F("", "", "fail", "شکست", "failure"),
      F("", "inspired", "inspire", "الهام", "inspiration"),
      F("kindly", "kind", "", "مهربانی", "kindness"),
      F("low", "low", "lower", "پایین", "low"),
      F("medically", "medical", "medicalize", "دارو", "medicine"),
      F("painfully", "painful", "pain", "درد", "pain"),
      F("repeatedly", "repeated", "repeat", "تکرار", "repetition"),
      F("responsibly", "responsible", "", "مسئولیت", "responsibility"),
      F("", "", "rob", "دزد", "robber"),
      F("selectively", "selective", "select", "انتخاب", "selection"),
      F("", "solvable", "solve", "راه حل", "solution"),
      F("strongly", "strong", "strengthen", "قدرت", "strength"),
    ],
  },
  {
    grade: "دوازدهم",
    vision: "Vision Three",
    lesson: "درس دوم",
    families: [
      F("", "abbreviated", "abbreviate", "اختصار", "abbreviation"),
      F("arrangeable", "arranged", "arrange", "ترتیب", "arrangement"),
      F("", "", "browse", "جستجوگر", "browser"),
      F("", "containable", "contain", "ظرف", "container"),
      F("definably", "definable", "define", "تعریف", "definition"),
      F("directly", "direct", "direct", "جهت", "direction"),
      F("", "expanded", "expand", "انبساط", "expansion"),
      F("infectiously", "infectious", "infect", "عفونت", "infection"),
      F("neatly", "neat", "neaten", "تمیزی", "neatness"),
      F("orderly", "ordered", "order", "نظم", "order"),
      F("", "organized", "organize", "سازمان", "organization"),
      F("originally", "original", "originate", "سرچشمه", "origin"),
      F("", "polluted", "pollute", "آلودگی", "pollution"),
      F("primarily", "primary", "", "ابتدا", "primary"),
      F("", "publishable", "publish", "ناشر", "publisher"),
      F("sportingly", "supportable", "support", "حمایت", "support"),
      F("symbolically", "symbolic", "symbolize", "نماد", "symbol"),
      F("technically", "technical", "", "فن", "technique"),
      F("systematically", "systematic", "systematize", "سیستم", "system"),
      F("uselessly", "useable", "use", "کاربر", "user"),
      F("", "vibrational", "vibrate", "لرزش", "vibration"),
      F("wisely", "wise", "wise", "خرد، عقل", "wisdom"),
    ],
  },
  {
    grade: "دوازدهم",
    vision: "Vision Three",
    lesson: "درس سوم",
    families: [
      F("basely", "baseless", "base", "اساس", "basis"),
      F("beneficially", "beneficial", "benefit", "منفعت", "benefit"),
      F("chemically", "chemical", "", "شیمی", "chemistry"),
      F("", "Christian", "", "مسیح", "Christ"),
      F("collectively", "collective", "collect", "گردآورنده", "collector"),
      F("", "conclusive", "conclude", "نتیجه", "conclusion"),
      F("constantly", "constant", "", "پایداری", "constancy"),
      F("", "consumed", "consume", "مصرف‌کننده", "consumer"),
      F("", "cooked", "cook", "آشپزی", "cookery"),
      F("cooperatively", "cooperative", "cooperate", "همکاری", "cooperation"),
      F("", "costly", "cost", "هزینه", "cost"),
      F("", "delivered", "deliver", "تحویل", "delivery"),
      F("descriptively", "descriptive", "describe", "توصیف", "description"),
      F("digestively", "digestive", "digest", "هضم", "digestion"),
      F("distantly", "distant", "distance", "فاصله", "distance"),
      F("electrically", "electrical", "", "برق", "electricity"),
      F("generatively", "generative", "generate", "نسل", "generation"),
      F("", "leading", "lead", "رهبری", "leader"),
      F("mechanically", "mechanical", "mechanize", "مکانیک", "mechanic"),
      F("", "radiative", "radiate", "تابش", "radiation"),
      F("", "replaceable", "replace", "تعویض", "replacement"),
      F("", "shiny", "shine", "واکس", "shiner"),
      F("visibly", "visible", "visit", "رؤیت", "visibility"),
    ],
  },
];

/** جمعِ خانواده‌های همهٔ جدول‌ها — برای گاردِ تست و شمارش‌های UI */
export const WORD_FAMILY_TOTAL = WORD_FAMILY_TABLES.reduce((n, t) => n + t.families.length, 0);

// ---------------------------------------------------------------------------
// راند ۲۲۳ — پیوندِ «اجزای کلماتی» به درس‌های برنامه (بندِ ① نقشهٔ ۲۲۲ — همان
// الگویِ LESSON_BG_LINKSِ راند ۲۲۰ ولی برای لایهٔ واژگان): کلید = شناسهٔ درسِ
// برنامه، مقدار = خودِ جدولِ همان درس از WORD_FAMILY_TABLES (ارجاعِ مستقیم،
// نه کپی — یک منبعِ حقیقت). شاهدِ نگاشت فقط خودِ جزوه است: جدول‌ها «به ترتیبِ
// درس» آمده‌اند و جایگاهِ درس‌های برنامه در lesson-meta ثابت است — درس‌های
// ۱-۳ برنامه = یازدهم (Vision Two)، ۴-۶ = دوازدهم (Vision Three)، ۷-۹ = دهم
// (Vision One)؛ پس درسِ Nامِ هر پایه جدولِ «درس Nام» همان پایه را می‌گیرد.
// صفرهایِ صادقانه: جدولِ «درس چهارمِ دهم» در برنامهٔ درسی جای ندارد (برنامه
// ۳ درسِ دهمی دارد) و فقط در ضمیمه دیده می‌شود؛ درس‌های ۱۰-۱۲ (هفتم/هشتم/
// نهم) جزوهٔ جامع ندارند و بیرونِ نقشه‌اند.
// ---------------------------------------------------------------------------
const WF_LESSON_NUM: Record<string, number> = {
  "درس اول": 1,
  "درس دوم": 2,
  "درس سوم": 3,
  "درس چهارم": 4,
};

const LESSON_WF_SPEC: Record<number, { grade: WordFamilyTable["grade"]; ordinal: number }> = {
  1: { grade: "یازدهم", ordinal: 1 },
  2: { grade: "یازدهم", ordinal: 2 },
  3: { grade: "یازدهم", ordinal: 3 },
  4: { grade: "دوازدهم", ordinal: 1 },
  5: { grade: "دوازدهم", ordinal: 2 },
  6: { grade: "دوازدهم", ordinal: 3 },
  7: { grade: "دهم", ordinal: 1 },
  8: { grade: "دهم", ordinal: 2 },
  9: { grade: "دهم", ordinal: 3 },
};

export const WORD_FAMILY_LESSON_LINKS: Record<number, WordFamilyTable> = Object.fromEntries(
  Object.entries(LESSON_WF_SPEC).flatMap(([idStr, spec]) => {
    const table = WORD_FAMILY_TABLES.find(
      (t) => t.grade === spec.grade && WF_LESSON_NUM[t.lesson] === spec.ordinal,
    );
    return table ? [[Number(idStr), table] as const] : [];
  }),
);

// ---------------------------------------------------------------------------
// راند ۲۲۴ — لنگرِ عمیقِ رفت‌وبرگشت برای جدول‌های «اجزای کلماتی» (آینهٔ
// BG_TOPIC_TO_LESSON راند ۲۲۱ برای لایهٔ واژگان): هر جدول شناسهٔ پایداری دارد
// (لنگرِ DOM + کلیدِ ناوبری) و نقشهٔ معکوس، از خودِ WORD_FAMILY_LESSON_LINKS
// مشتق می‌شود (نه دستی) — جدولِ «درس چهارمِ دهم» که در برنامه جای ندارد
// بیرونِ نقشه می‌ماند (صفرِ صادقانهٔ r223).
// ---------------------------------------------------------------------------

const WF_GRADE_NUM: Record<WordFamilyTable["grade"], number> = {
  دهم: 10,
  یازدهم: 11,
  دوازدهم: 12,
};

/** شناسهٔ پایدارِ جدول — «wf-g11-l1» یعنی درسِ اولِ یازدهم؛ مشتق از grade و
 * lessonِ خودِ جدول، پس شناسه و محتوا هیچ‌وقت از هم جدا نمی‌افتند. */
export function wordFamilyTableId(t: Pick<WordFamilyTable, "grade" | "lesson">): string {
  return `wf-g${WF_GRADE_NUM[t.grade]}-l${WF_LESSON_NUM[t.lesson]}`;
}

/** نقشهٔ معکوسِ شناسهٔ جدول ← درسِ برنامه — مشتق از WORD_FAMILY_LESSON_LINKS:
 * دقیقاً ۹ مدخل (۱۰ جدول منهایِ «درس چهارمِ دهم» که درسِ برنامه‌ای ندارد). */
export const WF_TABLE_ID_TO_LESSON: Record<string, number> = Object.fromEntries(
  Object.entries(WORD_FAMILY_LESSON_LINKS).map(([lid, table]) => [
    wordFamilyTableId(table),
    Number(lid),
  ]),
);
