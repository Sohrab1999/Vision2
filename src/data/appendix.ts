// =====================================================================
// ضمیمهٔ جزوه: افعال بی‌قاعده، جدول تلفظ (IPA)، واژه‌سازی
// =====================================================================

export interface IrregularVerb {
  base: string;
  past: string;
  pp: string;
  fa: string;
}

export const irregularVerbs: IrregularVerb[] = [
  { base: "be", past: "was / were", pp: "been", fa: "بودن" },
  { base: "become", past: "became", pp: "become", fa: "شدن" },
  { base: "begin", past: "began", pp: "begun", fa: "شروع کردن" },
  { base: "bend", past: "bent", pp: "bent", fa: "خم شدن، خم کردن" },
  { base: "bet", past: "bet", pp: "bet", fa: "شرط بستن" },
  { base: "bleed", past: "bled", pp: "bled", fa: "خون‌ریزی کردن" },
  { base: "blow", past: "blew", pp: "blown", fa: "وزیدن" },
  { base: "break", past: "broke", pp: "broken", fa: "شکستن، خرد کردن" },
  { base: "bring", past: "brought", pp: "brought", fa: "آوردن" },
  { base: "broadcast", past: "broadcast", pp: "broadcast", fa: "پخش کردن" },
  { base: "build", past: "built", pp: "built", fa: "ساختن، بنا نهادن" },
  { base: "burn", past: "burnt", pp: "burnt", fa: "سوختن، سوزاندن" },
  { base: "buy", past: "bought", pp: "bought", fa: "خریدن" },
  { base: "catch", past: "caught", pp: "caught", fa: "گرفتن، دستگیر کردن" },
  { base: "choose", past: "chose", pp: "chosen", fa: "انتخاب کردن" },
  { base: "come", past: "came", pp: "come", fa: "آمدن، رسیدن" },
  { base: "cost", past: "cost", pp: "cost", fa: "قیمت داشتن" },
  { base: "cut", past: "cut", pp: "cut", fa: "بریدن، قطع کردن" },
  { base: "deal", past: "dealt", pp: "dealt", fa: "رفتار کردن، معامله کردن" },
  { base: "do", past: "did", pp: "done", fa: "انجام دادن" },
  { base: "draw", past: "drew", pp: "drawn", fa: "کشیدن، رسم کردن" },
  { base: "dream", past: "dreamt", pp: "dreamt", fa: "خواب دیدن" },
  { base: "drink", past: "drank", pp: "drunk", fa: "آشامیدن" },
  { base: "drive", past: "drove", pp: "driven", fa: "راندن، رانندگی کردن" },
  { base: "eat", past: "ate", pp: "eaten", fa: "خوردن" },
  { base: "fall", past: "fell", pp: "fallen", fa: "زمین خوردن، سقوط کردن" },
  { base: "feed", past: "fed", pp: "fed", fa: "غذا دادن به" },
  { base: "feel", past: "felt", pp: "felt", fa: "احساس کردن، لمس کردن" },
  { base: "fight", past: "fought", pp: "fought", fa: "جنگیدن، جنگ کردن" },
  { base: "find", past: "found", pp: "found", fa: "پیدا کردن" },
  { base: "fly", past: "flew", pp: "flown", fa: "پرواز کردن" },
  { base: "forget", past: "forgot", pp: "forgotten", fa: "فراموش کردن" },
  { base: "forgive", past: "forgave", pp: "forgiven", fa: "بخشیدن" },
  { base: "freeze", past: "froze", pp: "frozen", fa: "منجمد کردن، مسدود کردن" },
  { base: "get", past: "got", pp: "gotten", fa: "به دست آوردن، فهمیدن" },
  { base: "give", past: "gave", pp: "given", fa: "دادن (به)، بخشیدن" },
  { base: "go", past: "went", pp: "gone", fa: "رفتن" },
  { base: "grow", past: "grew", pp: "grown", fa: "رشد کردن، بزرگ شدن" },
  { base: "hang", past: "hung", pp: "hung", fa: "آویزان کردن" },
  { base: "have", past: "had", pp: "had", fa: "داشتن" },
  { base: "hear", past: "heard", pp: "heard", fa: "شنیدن" },
  { base: "hide", past: "hid", pp: "hidden", fa: "پنهان کردن، پنهان شدن" },
  { base: "hit", past: "hit", pp: "hit", fa: "زدن، ضربه زدن" },
  { base: "hold", past: "held", pp: "held", fa: "نگه داشتن" },
  { base: "hurt", past: "hurt", pp: "hurt", fa: "آسیب زدن (به)" },
  { base: "keep", past: "kept", pp: "kept", fa: "نگه داشتن، حفظ کردن" },
  { base: "know", past: "knew", pp: "known", fa: "دانستن، شناختن" },
  { base: "lead", past: "led", pp: "led", fa: "رهبری کردن، هدایت کردن" },
  { base: "learn", past: "learnt", pp: "learnt", fa: "یاد گرفتن" },
  { base: "leave", past: "left", pp: "left", fa: "ترک کردن، محول کردن" },
  { base: "lend", past: "lent", pp: "lent", fa: "قرض دادن" },
  { base: "let", past: "let", pp: "let", fa: "اجازه دادن" },
  { base: "lose", past: "lost", pp: "lost", fa: "گم کردن، باختن" },
  { base: "make", past: "made", pp: "made", fa: "ساختن، درست کردن" },
  { base: "mean", past: "meant", pp: "meant", fa: "معنی دادن، منظور داشتن" },
  { base: "meet", past: "met", pp: "met", fa: "ملاقات کردن" },
  { base: "pay", past: "paid", pp: "paid", fa: "پرداخت کردن" },
  { base: "put", past: "put", pp: "put", fa: "گذاشتن، قرار دادن" },
  { base: "read", past: "read", pp: "read", fa: "خواندن" },
  { base: "ride", past: "rode", pp: "ridden", fa: "سوار شدن، راندن" },
  { base: "ring", past: "rang", pp: "rung", fa: "زنگ زدن" },
  { base: "run", past: "ran", pp: "run", fa: "دویدن، اداره کردن" },
  { base: "see", past: "saw", pp: "seen", fa: "دیدن" },
  { base: "seek", past: "sought", pp: "sought", fa: "جستجو کردن" },
  { base: "sell", past: "sold", pp: "sold", fa: "فروختن" },
  { base: "send", past: "sent", pp: "sent", fa: "فرستادن، ارسال کردن" },
  { base: "shoot", past: "shot", pp: "shot", fa: "تیراندازی کردن، کشتن" },
  { base: "show", past: "showed", pp: "shown", fa: "نشان دادن، ابراز کردن" },
  { base: "shut", past: "shut", pp: "shut", fa: "بستن، بسته شدن" },
  { base: "sing", past: "sang", pp: "sung", fa: "خواندن (آواز)" },
  { base: "sink", past: "sank", pp: "sunk", fa: "غرق شدن، فرو رفتن" },
  { base: "sit", past: "sat", pp: "sat", fa: "نشستن" },
  { base: "spend", past: "spent", pp: "spent", fa: "گذراندن، خرج کردن" },
  { base: "stand", past: "stood", pp: "stood", fa: "ایستادن" },
  { base: "steal", past: "stole", pp: "stolen", fa: "دزدیدن" },
  { base: "swim", past: "swam", pp: "swum", fa: "شنا کردن" },
  { base: "swing", past: "swung", pp: "swung", fa: "تاب خوردن، نوسان داشتن" },
  { base: "take", past: "took", pp: "taken", fa: "گرفتن، بردن" },
  { base: "teach", past: "taught", pp: "taught", fa: "یاد دادن، تدریس کردن" },
  { base: "tell", past: "told", pp: "told", fa: "گفتن" },
  { base: "think", past: "thought", pp: "thought", fa: "فکر کردن" },
  { base: "throw", past: "threw", pp: "thrown", fa: "پرت کردن، انداختن" },
  { base: "understand", past: "understood", pp: "understood", fa: "فهمیدن" },
  { base: "wake", past: "woke", pp: "woken", fa: "بیدار کردن، بیدار شدن" },
  { base: "wear", past: "wore", pp: "worn", fa: "به تن داشتن" },
  { base: "win", past: "won", pp: "won", fa: "بردن، پیروزی شدن" },
  { base: "write", past: "wrote", pp: "written", fa: "نوشتن" },
];

export interface Phoneme {
  symbol: string;
  example: string;
  fa: string;
}

export const vowelPhonemes: Phoneme[] = [
  { symbol: "ɑː", example: "arm, father", fa: "کشیده آ /" },
  { symbol: "ʌ", example: "cup, luck", fa: "کوتاه آ /" },
  { symbol: "e", example: "men, bed", fa: "کوتاهِ ا /" },
  { symbol: "æ", example: "cat, black", fa: "اَ /" },
  { symbol: "ɜːr", example: "turn, learn", fa: "اِ کشیده /" },
  { symbol: "ə", example: "away, cinema", fa: "بین اِ و اَ /" },
  { symbol: "iː", example: "see, heat", fa: "کشیده ای /" },
  { symbol: "ɪ", example: "hit, sitting", fa: "ای کوتاه /" },
  { symbol: "ɔː", example: "call, four", fa: "کشیده آ /" },
  { symbol: "ɒ", example: "hot, rock", fa: "آ کشیده /" },
  { symbol: "uː", example: "blue, food", fa: "کشیده او /" },
  { symbol: "ʊ", example: "put, could", fa: "کوتاه ُا /" },
  { symbol: "aʊ", example: "now, out", fa: "وا /" },
  { symbol: "aɪ", example: "five, eye", fa: "آی /" },
  { symbol: "eər", example: "where, air", fa: "کشیدهِ ا /" },
  { symbol: "əʊ (uk), oʊ (us)", example: "go, home", fa: "وُا /" },
  { symbol: "ɪər", example: "near, here", fa: "یِای /" },
  { symbol: "eɪ", example: "say, eight", fa: "یِا /" },
  { symbol: "ʊər", example: "pure, tourist", fa: "اِ یو /" },
  { symbol: "ɔɪ", example: "boy, join", fa: "یُا /" },
];

export const consonantPhonemes: Phoneme[] = [
  { symbol: "b", example: "bad, lab", fa: "ب /" },
  { symbol: "d", example: "did, lady", fa: "د /" },
  { symbol: "f", example: "find, if", fa: "ف /" },
  { symbol: "g", example: "give, flag", fa: "گ /" },
  { symbol: "h", example: "how, hello", fa: "ح /" },
  { symbol: "j", example: "yes, yellow", fa: "ی /" },
  { symbol: "l", example: "leg, little", fa: "ل /" },
  { symbol: "k", example: "cat, black", fa: "ک /" },
  { symbol: "n", example: "no, ten", fa: "نوک‌زبانی ن /" },
  { symbol: "ŋ", example: "sing, finger", fa: "ن انتهای زبان یا حلق /" },
  { symbol: "m", example: "man, lemon", fa: "م /" },
  { symbol: "p", example: "pet, map", fa: "پ /" },
  { symbol: "r", example: "red, try", fa: "ر /" },
  { symbol: "s", example: "sun, miss", fa: "س /" },
  { symbol: "ʃ", example: "she, crash", fa: "ش /" },
  { symbol: "t", example: "tea, table", fa: "ت /" },
  { symbol: "tʃ", example: "check, church", fa: "چ /" },
  { symbol: "θ", example: "think, both", fa: "ص چسبیده به دندان /" },
  { symbol: "ð", example: "this, mother", fa: "ض چسبیده به دندان /" },
  { symbol: "v", example: "voice, five", fa: "واو معمولی /" },
  { symbol: "w", example: "wet, window", fa: "واو لب غنچه‌ای /" },
  { symbol: "z", example: "zoo, lazy", fa: "ز معمولی /" },
  { symbol: "dʒ", example: "just, large", fa: "ج /" },
  { symbol: "ʒ", example: "pleasure, vision", fa: "ژ /" },
];

export interface Abbreviation {
  sym: string;
  full: string;
  fa: string;
}

export const abbreviations: Abbreviation[] = [
  { sym: "n", full: "(noun)", fa: "اسم" },
  { sym: "v", full: "(verb)", fa: "فعل" },
  { sym: "adj", full: "(adjective)", fa: "صفت" },
  { sym: "adv", full: "(adverb)", fa: "قید" },
  { sym: "pre", full: "(preposition)", fa: "حرف اضافه" },
  { sym: "conj", full: "(conjunction)", fa: "حرف ربط" },
  { sym: "pron", full: "(pronoun)", fa: "ضمیر" },
  { sym: "phr.v", full: "(phrasal verb)", fa: "فعل دوکلمه‌ای" },
  { sym: "pl", full: "(plural)", fa: "جمع" },
  { sym: "sth", full: "(something)", fa: "چیزی" },
  { sym: "sb", full: "(somebody)", fa: "کسی" },
  { sym: "syn", full: "(synonym)", fa: "مترادف" },
  { sym: "ant", full: "(antonym)", fa: "متضاد" },
];

export const partsOfSpeech = [
  { name: "اسم (Noun)", desc: "کلمه‌ای که برای نامیدن اشخاص، حیوانات، اشیاء، اماکن و یا حالات آن‌ها به‌کار می‌رود." },
  { name: "ضمیر (Pronoun)", desc: "کلمه‌ای که جانشین اسم می‌گردد و ما را از تکرار اسامی اشخاص و اشیاء بی‌نیاز می‌کند." },
  { name: "صفت (Adjective)", desc: "کلمه‌ای که اسم را توصیف می‌کند و معنی آن را روشن‌تر و مشخص‌تر و کامل‌تر بیان می‌کند." },
  { name: "فعل (Verb)", desc: "کلمه‌ای که عمل یا حالتی را بیان می‌کند." },
  { name: "قید (Adverb)", desc: "کلمه‌ای که برای توصیف فعل، صفت و یا قید دیگر به‌کار می‌رود و چگونگی انجام یک فعل و وضعیت یک صفت را بیان می‌کند." },
  { name: "حرف اضافه (Preposition)", desc: "کلمه‌ای که نسبت یا ارتباط اسم و ضمیر را با سایر قسمت‌های جمله نشان می‌دهد؛ معمولاً برای مکان، زمان و جهت." },
  { name: "حرف ربط (Conjunction)", desc: "کلمه‌ای که برای وصل کردن دو جمله، دو عبارت و یا دو کلمه به‌کار می‌رود." },
  { name: "صوت (Interjection)", desc: "کلمه‌ای برای تعجب و تحسین، افسوس و وحشت و سایر احساسات ناگهانی: Hey!, wow!, hush!, ah!, oh!" },
];

const appendixData = {
  irregularVerbs,
  vowelPhonemes,
  consonantPhonemes,
  abbreviations,
  partsOfSpeech,
};

export default appendixData;
