import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Ten: "Hello, English!"  |  سلام، انگلیسی!
// Prospect 1 (Grade 7) — جزوهٔ دکتر حسن لطفی، پایهٔ هفتم (راند ۱۹۸ — «قفسهٔ شش‌پایه»)
// Grade-wide booklet: greetings & alphabet, classroom, months & birthday,
// jobs & family, appearance & clothes, home & daily routine.
// Grammar focus: to be + این/آن‌ها (this/that/these/those) + صفت ملکی و مشاغل
// =====================================================================

const vocabulary = [
  W("welcome", "خوش آمدی/خوش آمدید", "phr"),
  W("word", "واژه، کلمه، لغت", "n"),
  W("write", "نوشتن", "v"),
  W("letter", "حرف الفبا؛ نامه", "n"),
  W("alphabet", "الفبا", "n"),
  W("name", "نام، اسم", "n"),
  W("number", "عدد، شماره", "n"),
  W("say", "گفتن، سخن گفتن", "v"),
  W("classroom", "کلاس درس", "n"),
  W("start", "روشن کردن، شروع کردن", "v"),
  W("telephone", "تلفن؛ تلفن کردن", "n"),
  W("object", "چیز، شی، کالا", "n"),
  W("door", "درب، در", "n"),
  W("blackboard", "تخته سیاه", "n"),
  W("desk", "میز تحریر", "n"),
  W("chair", "صندلی", "n"),
  W("pen", "خودکار", "n"),
  W("pencil", "مداد", "n"),
  W("eraser", "مدادپاک‌کن، پاک‌کن", "n"),
  W("notebook", "دفتر تکالیف", "n"),
  W("please", "لطفاً، خواهشاً", "adv"),
  W("listen", "گوش دادن، شنیدن", "v"),
  W("book", "کتاب", "n"),
  W("dictionary", "فرهنگ لغت، لغت‌نامه", "n"),
  W("classmate", "هم‌کلاسی، هم‌درس", "n"),
  W("bag", "کیف، ساک", "n"),
  W("ruler", "خط‌کش", "n"),
  W("family", "خانواده", "n"),
  W("father", "پدر", "n"),
  W("mother", "مادر", "n"),
  W("brother", "برادر", "n"),
  W("sister", "خواهر", "n"),
  W("teacher", "معلم، آموزگار", "n"),
  W("doctor", "پزشک، دکتر", "n"),
  W("nurse", "پرستار", "n"),
  W("farmer", "کشاورز", "n"),
  W("driver", "راننده", "n"),
  W("police", "پلیس", "n"),
  W("job", "شغل، کار", "n"),
  W("tall", "بلندقامت", "adj"),
  W("short", "کوتاه؛ کوتاه‌قد", "adj"),
  W("young", "جوان، کم‌سن", "adj"),
  W("shirt", "پیراهن", "n"),
  W("dress", "لباس؛ پیراهن زنانه", "n"),
  W("shoe", "کفش", "n"),
  W("hat", "کلاه", "n"),
  W("coat", "پالتو، کت", "n"),
  W("birthday", "تولد", "n"),
  W("age", "سن، سال", "n"),
  W("date", "تاریخ", "n"),
  W("month", "ماه (تقویمی)", "n"),
  W("January", "ژانویه (دی/بهمن)", "n"),
  W("April", "آوریل (فروردین/اردیبهشت)", "n"),
  W("July", "ژوئیه (تیر/مرداد)", "n"),
  W("October", "اکتبر (مهر/آبان)", "n"),
  W("apartment", "آپارتمان، واحد مسکونی", "n"),
  W("bedroom", "اتاق خواب", "n"),
  W("kitchen", "آشپزخانه", "n"),
  W("bathroom", "اتاق حمام", "n"),
  W("clock", "ساعت (دیواری/میز)", "n"),
  W("breakfast", "صبحانه", "n"),
  W("dinner", "شام، شامگاه", "n"),
  W("eat", "خوردن", "v"),
  W("drink", "نوشیدن", "v"),
  W("sleep", "خوابیدن", "v"),
];

const conversation = {
  introEn: "Listen to the conversation between Amir, a seventh-grade student, and Reza, a new classmate, on the first day of school.",
  introFa: "به مکالمهٔ امیر، دانش‌آموز پایهٔ هفتم، و رضا، هم‌کلاسیِ تازه، در اولین روز مدرسه گوش دهید.",
  lines: [
    { speaker: "Amir", speakerFa: "امیر", en: "Hello! Welcome to our classroom.", fa: "سلام! به کلاس ما خوش آمدی." },
    { speaker: "Reza", speakerFa: "رضا", en: "Hi! Thank you very much.", fa: "سلام! خیلی ممنون." },
    { speaker: "Amir", speakerFa: "امیر", en: "I'm Amir. What's your name?", fa: "من امیرم. اسم تو چیست؟" },
    { speaker: "Reza", speakerFa: "رضا", en: "My name is Reza. Nice to meet you.", fa: "اسم من رضاست. از آشناییت خوشحالم." },
    { speaker: "Amir", speakerFa: "امیر", en: "Nice to meet you, too. Are you in this class?", fa: "من هم خوشحالم. تو هم در این کلاسی؟" },
    { speaker: "Reza", speakerFa: "رضا", en: "Yes, I am. This is my first day here.", fa: "بله. امروز اولین روز من این‌جاست." },
    { speaker: "Amir", speakerFa: "امیر", en: "Great! That is your desk, next to the window.", fa: "عالی است! آن میز توست، کنار پنجره." },
    { speaker: "Reza", speakerFa: "رضا", en: "Thanks. Who is our teacher?", fa: "ممنون. معلم ما کیست؟" },
    { speaker: "Amir", speakerFa: "امیر", en: "Mrs. Karimi. She is a very kind teacher.", fa: "خانم کریمی. او معلم خیلی مهربانی است." },
    { speaker: "Reza", speakerFa: "رضا", en: "What is that on the blackboard?", fa: "آن چیز روی تخته سیاه چیست؟" },
    { speaker: "Amir", speakerFa: "امیر", en: "It's the English alphabet. We learn a new letter every day.", fa: "الفبای انگلیسی است. هر روز یک حرف تازه یاد می‌گیریم." },
    { speaker: "Reza", speakerFa: "رضا", en: "How nice! I love English words.", fa: "چه خوب! من عاشق واژه‌های انگلیسی‌ام." },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "My First English Class",
    titleFa: "اولین کلاس انگلیسی من",
    source: "Prospect 1 — Booklet: Grade Seven",
    paragraphs: [
      { en: "Hi! My name is Mahsa and I am twelve years old. I am a student in the seventh grade. Today is my first English class and I am very happy. Our teacher, Mrs. Karimi, comes into the classroom and says, \"Welcome to your first English class!\"", fa: "سلام! اسم من مهساست و دوازده سالم است. من دانش‌آموز پایهٔ هفتم هستم. امروز اولین کلاس انگلیسی من است و خیلی خوشحالم. معلم ما، خانم کریمی، وارد کلاس می‌شود و می‌گوید: «به اولین کلاس انگلیسی‌تان خوش آمدید!»" },
      { en: "Our classroom is big and clean. There are ten desks and twenty chairs in it. A big blackboard is on the wall. On the teacher's desk there are a dictionary, a ruler, and a red pen. My best friend Sara sits next to me.", fa: "کلاس ما بزرگ و تمیز است. ده میز تحریر و بیست صندلی در آن هست. یک تختهٔ سیاهِ بزرگ روی دیوار است. روی میز معلم یک فرهنگ لغت، یک خط‌کش و یک خودکارِ قرمز هست. بهترین دوستم سارا کنار من می‌نشیند." },
      { en: "Mrs. Karimi writes the English alphabet on the blackboard. \"English has twenty-six letters,\" she says. \"This is letter A, and this is letter B.\" She points to the letters and we say them together. Then she asks us to open our books.", fa: "خانم کریمی الفبای انگلیسی را روی تخته می‌نویسد. می‌گوید: «انگلیسی بیست‌وشش حرف دارد. این حرف A است و این حرف B.» به حرف‌ها اشاره می‌کند و ما با هم می‌گوییم‌شان. بعد از ما می‌خواهد کتاب‌هایمان را باز کنیم." },
      { en: "\"What is this?\" she asks and holds up a pencil. \"It is a pencil!\" we answer. She holds up a notebook and asks the same question. \"It is a notebook!\" Now everyone wants to answer. English words are new and fun for us.", fa: "می‌پرسد: «این چیست؟» و یک مداد را بالا می‌گیرد. جواب می‌دهیم: «این یک مداد است!» یک دفتر بالا می‌گیرد و همان سؤال را می‌پرسد. «این یک دفتر است!» حالا همه می‌خواهند جواب بدهند. واژه‌های انگلیسی برای ما تازه و شیرین‌اند." },
      { en: "At the end of the class, Mrs. Karimi says, \"You are good students. Please listen, say, and write every day.\" I look at my new book and think: this is the start of something great. I love my English class!", fa: "در پایان کلاس خانم کریمی می‌گوید: «شما شاگردان خوبی هستید. لطفاً هر روز گوش بدهید، بگویید و بنویسید.» به کتاب تازه‌ام نگاه می‌کنم و فکر می‌کنم: این شروعِ چیزِ بزرگی است. کلاس انگلیسی‌ام را دوست دارم!" },
    ],
  },
  {
    titleEn: "Sam's Family Album",
    titleFa: "آلبوم خانوادهٔ سام",
    source: "Prospect 1 — Booklet: Grade Seven",
    paragraphs: [
      { en: "This is Sam, and this is his family album. He is ten years old and he is in the fifth grade. His family is not big: his father, his mother, and his little sister Roya. They live in a nice apartment in Tehran.", fa: "این سام است و این آلبوم خانوادهٔ اوست. او ده سالش است و کلاس پنجم است. خانواده‌اش بزرگ نیست: پدرش، مادرش و خواهرِ کوچکش رویا. آن‌ها در یک آپارتمانِ خوب در تهران زندگی می‌کنند." },
      { en: "Sam's father is a driver. He is tall and he is thirty-nine years old. Every morning he starts work at seven o'clock. Sam's mother is a nurse at a big hospital. She is kind and she helps many people every day.", fa: "پدر سام راننده است. او بلندقامت است و سی‌ونه سالش است. هر روز صبح ساعت هفت کارش را شروع می‌کند. مادر سام پرستارِ یک بیمارستانِ بزرگ است. او مهربان است و هر روز به خیلی از مردم کمک می‌کند." },
      { en: "\"Who is this?\" Sam asks and points to an old photo. \"That is my grandfather,\" says his mother. \"He was a farmer and he worked in a green field near a small town.\" In the photo, grandpa wears a hat and stands next to his old truck.", fa: "سام به یک عکس قدیمی اشاره می‌کند و می‌پرسد: «این کیست؟» مادرش می‌گوید: «آن پدربزرگِ توست. او کشاورز بود و در مزرعه‌ای سبز نزدیک شهرکی کوچک کار می‌کرد.» در عکس، پدربزرگ کلاهی بر سر دارد و کنار کامیون قدیمی‌اش ایستاده است." },
      { en: "Roya's birthday is in July, but Sam's birthday is in October. On Roya's birthday there is a big cake, and the family eats dinner together. Roya gets many presents: a new dress, red shoes, and a picture book about animals.", fa: "تولد رویا در ژوئیه است اما تولد سام در اکتبر. در تولد رویا یک کیکِ بزرگ هست و خانواده با هم شام می‌خورند. رویا هدیه‌های زیادی می‌گیرد: یک لباسِ تازه، کفش‌های قرمز و یک کتابِ عکس دربارهٔ حیوانات." },
      { en: "At eight o'clock, Sam goes to bed and says goodnight to his family. He sleeps in his bedroom, next to the kitchen. Tomorrow is Friday and the family will visit grandma. Sam is happy because his family is full of love.", fa: "ساعت هشت، سام به رختخواب می‌رود و به خانواده‌اش شب‌بخیر می‌گوید. در اتاق خوابش می‌خوابد، کنار آشپزخانه. فردا جمعه است و خانواده به دیدن مادربزرگ می‌رود. سام خوشحال است چون خانواده‌اش پر از عشق است." },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "فعل to be: am / is / are و معرفی خود (Introductions)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">فعل ${EN(
        "to be"
      )} مهم‌ترین فعل انگلیسی است؛ برای معرفی خود، گفتن سن و شغل و توصیف چیزها از آن استفاده می‌کنیم. شکلِ آن به فاعل بستگی دارد:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-pink-700 text-white"><th class="px-3 py-2">فاعل</th><th class="px-3 py-2">شکلِ فعل</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">am</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I <b>am</b> a student. = I'm a student.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He / She / It</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">is</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She <b>is</b> a nurse. = She's a nurse.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">You / We / They</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">are</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">They <b>are</b> my classmates.</td></tr>
      </tbody></table></div>
      <div class="bg-pink-50 border border-pink-200 rounded-lg p-3 text-sm leading-7 text-pink-900 mb-3">💡 <b>نکتهٔ امتحانی:</b> شکلِ منفی با ${EN(
        "not"
      )} ساخته می‌شود: ${EN(
        "I am <b>not</b> late. / He <b>isn't</b> a driver."
      )} و در سؤال، فعل به اولِ جمله می‌آید: ${EN(
        "<b>Are</b> you a new student? — Yes, I am."
      )}</div>`,
  },
  {
    title: "این و آن: this / that / these / those و جمع‌ها (Plurals)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای اشاره به چیزها از چهار کلمهٔ اشاره استفاده می‌کنیم؛ دو تای اول «نزدیک» و دو تای دیگر «دور»ند:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-pink-700 text-white"><th class="px-3 py-2">کلمه</th><th class="px-3 py-2">معنی</th><th class="px-3 py-2">تعداد</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">this</td><td class="px-3 py-2 border-t border-stone-100">این (نزدیک)</td><td class="px-3 py-2 border-t border-stone-100">مفرد</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>This</b> is my desk.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">that</td><td class="px-3 py-2 border-t border-stone-100">آن (دور)</td><td class="px-3 py-2 border-t border-stone-100">مفرد</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>That</b> is our school.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">these</td><td class="px-3 py-2 border-t border-stone-100">این‌ها (نزدیک)</td><td class="px-3 py-2 border-t border-stone-100">جمع</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>These</b> are my books.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">those</td><td class="px-3 py-2 border-t border-stone-100">آن‌ها (دور)</td><td class="px-3 py-2 border-t border-stone-100">جمع</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Those</b> are her pens.</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">جمعِ اسامی معمولاً با ${EN(
        "-s"
      )} ساخته می‌شود: ${EN("book → book<b>s</b>، pen → pen<b>s</b>")}. اما اگر اسم به ${EN("s, sh, ch, x, o")} تمام شود، ${EN(
        "-es"
      )} می‌گیرد: ${EN("bus → bus<b>es</b>، watch → watch<b>es</b>")}. اسم‌هایی که به «حرف صدادار + y» تمام می‌شوند، y به ${EN(
        "-ies"
      )} تبدیل می‌شود: ${EN("baby → bab<b>ies</b>، dictionary → dictionar<b>ies</b>")}</p>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکتهٔ امتحانی:</b> بعد از ${EN(
        "this/that"
      )} فعل مفرد است (${EN("This <b>is</b>…")}) و بعد از ${EN("these/those")} فعل جمع (${EN(
        "These <b>are</b>…"
      )}) — این پرتکرارترین تلهٔ امتحانِ هفتم است.</div>`,
  },
  {
    title: "صفت‌های ملکی my/your/his/her و مشاغل با a/an",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">صفت‌های ملکی نشان می‌دهند چیزی به چه کسی تعلق دارد و همیشه «قبل از اسم» می‌آیند:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-pink-700 text-white"><th class="px-3 py-2">فاعل</th><th class="px-3 py-2">صفت ملکی</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">my</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>My</b> name is Sam.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">you</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">your</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">What's <b>your</b> job?</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">he</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">his</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>His</b> sister is a doctor.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">she</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">her</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Her</b> bag is new.</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای گفتن شغل، قبل از شغلِ مفرد، حرف ${EN("a")} (قبل از صدا) یا ${EN("an")} (قبل از صدادار: a, e, i, o, u) می‌آید: ${EN(
        "I am <b>a</b> teacher. / She is <b>an</b> engineer. / He is <b>a</b> police officer."
      )}</p>
      <div class="bg-pink-50 border border-pink-200 rounded-lg p-3 text-sm leading-7 text-pink-900">💡 <b>هشدار:</b> صفت ملکی هرگز با ${EN(
        "a/an"
      )} همزمان نمی‌آید: ${EN(
        "<b>my</b> book (NOT: a my book)"
      )} — و شکلِ آن برای اسم مفرد و جمع یکسان است: ${EN("his sister / his sister<b>s</b>")}</div>`,
  },
];

const synonyms = [
  SYN("start", "begin", "شروع کردن"),
  SYN("say", "tell", "گفتن"),
  SYN("desk", "table", "میز"),
  SYN("friend", "classmate", "دوست، هم‌کلاسی"),
  SYN("job", "work", "شغل، کار"),
  SYN("tall", "high", "بلند"),
  SYN("old", "aged", "پیر، سالخورده"),
  SYN("listen", "hear", "گوش دادن، شنیدن"),
  SYN("dad", "father", "پدر"),
  SYN("mom", "mother", "مادر"),
  SYN("look at", "watch", "نگاه کردن"),
  SYN("happy", "glad", "خوشحال"),
];

const antonyms = [
  ANT("welcome", "goodbye", "خوش آمد ↔ خداحافظ"),
  ANT("tall", "short", "بلند ↔ کوتاه"),
  ANT("young", "old", "جوان ↔ پیر"),
  ANT("big", "small", "بزرگ ↔ کوچک"),
  ANT("day", "night", "روز ↔ شب"),
  ANT("eat", "drink", "خوردن ↔ نوشیدن"),
  ANT("open", "close", "باز کردن ↔ بستن"),
  ANT("start", "finish", "شروع کردن ↔ تمام کردن"),
  ANT("new", "old", "تازه ↔ کهنه"),
  ANT("up", "down", "بالا ↔ پایین"),
  ANT("happy", "sad", "خوشحال ↔ غمگین"),
  ANT("good", "bad", "خوب ↔ بد"),
];

const writing: WritingExercise[] = [
  { id: "l10-w1", fa: "من دانش‌آموز هستم و دوازده سالم است.", answer: ["I", "am", "a", "student", "and", "I", "am", "twelve"], hint: "فعل am فقط با I می‌آید" },
  { id: "l10-w2", fa: "این میز من است و آن صندلی توست.", answer: ["This", "is", "my", "desk", "and", "that", "is", "your", "chair"], hint: "this نزدیک، that دور" },
  { id: "l10-w3", fa: "این‌ها کتاب‌های ما هستند.", answer: ["These", "are", "our", "books"], hint: "بعد از these فعل جمع می‌آید" },
  { id: "l10-w4", fa: "مادر او پرستار است.", answer: ["His", "mother", "is", "a", "nurse"], hint: "صفت ملکی قبل از اسم؛ a قبل از شغل" },
  { id: "l10-w5", fa: "آن‌ها معلم نیستند.", answer: ["They", "are", "not", "teachers"], hint: "منفیِ are با not" },
  { id: "l10-w6", fa: "تو یک پزشک هستی؟", answer: ["Are", "you", "a", "doctor"], hint: "در سؤال فعل to be به اول جمله می‌آید" },
  { id: "l10-w7", fa: "لطفاً به معلم گوش بده.", answer: ["Please", "listen", "to", "the", "teacher"], hint: "listen به حرف اضافه to نیاز دارد" },
  { id: "l10-w8", fa: "ما در آشپزخانه شام می‌خوریم.", answer: ["We", "eat", "dinner", "in", "the", "kitchen"], hint: "شام = dinner؛ مکان با in" },
];

const quizzes = [
  // ---------------- واژگان (۱۵ تست) ----------------
  Q("l10-v1", "vocab", "---------------- to our English class! Please sit down.", ["Welcome", "Goodbye", "Sleep", "Finish"], 0, "به کلاس انگلیسی‌مان خوش آمدید! لطفاً بنشینید."),
  Q("l10-v2", "vocab", "English has twenty-six ---------------- in its alphabet.", ["letters", "doors", "months", "nurses"], 0, "الفبای انگلیسی بیست‌وشش حرف دارد."),
  Q("l10-v3", "vocab", "The teacher writes new words on the ----------------.", ["blackboard", "bedroom", "kitchen", "birthday"], 0, "معلم واژه‌های تازه را روی تختهٔ سیاه می‌نویسد."),
  Q("l10-v4", "vocab", "Please ---------------- to the tape and repeat the words.", ["listen", "drink", "eat", "sleep"], 0, "لطفاً به نوار گوش بده و واژه‌ها را تکرار کن."),
  Q("l10-v5", "vocab", "My ---------------- and I study in the same classroom.", ["classmates", "shoes", "hats", "clocks"], 0, "هم‌کلاسی‌های من و من در یک کلاس درس می‌خوانیم."),
  Q("l10-v6", "vocab", "I put my books and pens in my school ----------------.", ["bag", "desk", "chair", "door"], 0, "کتاب‌ها و خودکارهایم را در کیف مدرسه‌ام می‌گذارم."),
  Q("l10-v7", "vocab", "My father's brother is my ----------------.", ["uncle", "sister", "mother", "nurse"], 0, "برادر پدرم عموی من است."),
  Q("l10-v8", "vocab", "A ---------------- works in a hospital and helps the doctor.", ["nurse", "farmer", "driver", "police"], 0, "پرستار در بیمارستان کار می‌کند و به پزشک کمک می‌کند."),
  Q("l10-v9", "vocab", "The ---------------- grows plants and keeps animals on a farm.", ["farmer", "doctor", "teacher", "student"], 0, "کشاورز در مزرعه گیاه می‌کارد و حیوانات را نگه می‌دارد."),
  Q("l10-v10", "vocab", "My brother is two meters ----------------; he plays basketball.", ["tall", "short", "young", "old"], 0, "برادرم دو متر قد دارد؛ بسکتبال بازی می‌کند."),
  Q("l10-v11", "vocab", "In winter we wear a warm ---------------- over our clothes.", ["coat", "kitchen", "letter", "number"], 0, "در زمستان یک پالتوی گرم روی لباس‌هایمان می‌پوشیم."),
  Q("l10-v12", "vocab", "Roya's ---------------- is in July; she gets many presents.", ["birthday", "job", "object", "clock"], 0, "تولد رویا در ژوئیه است؛ هدیه‌های زیادی می‌گیرد."),
  Q("l10-v13", "vocab", "There are four ---------------- in a room: bedroom, kitchen, bathroom and living room.", ["rooms", "rulers", "months", "shoes"], 0, "در یک خانه چهار اتاق هست: اتاق خواب، آشپزخانه، حمام و اتاق نشیمن."),
  Q("l10-v14", "vocab", "We ---------------- breakfast at seven o'clock every morning.", ["eat", "sleep", "write", "open"], 0, "هر روز صبح ساعت هفت صبحانه می‌خوریم."),
  Q("l10-v15", "vocab", "Please open your ---------------- and find the new word.", ["dictionary", "birthday", "family", "coat"], 0, "لطفاً لغت‌نامه‌ات را باز کن و واژهٔ تازه را پیدا کن."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l10-k1", "vocab-konkuri", "What do you ---------------- your friend? — I say \"hello\" to her.", ["say to", "welcome", "sleep", "eat"], 0, "به دوستت چه می‌گویی؟ به او «سلام» می‌گویم."),
  Q("l10-k2", "vocab-konkuri", "Our English ---------------- is clean and there are twenty chairs in it.", ["classroom", "birthday", "kitchen", "coat"], 0, "کلاس انگلیسی ما تمیز است و بیست صندلی در آن هست."),
  Q("l10-k3", "vocab-konkuri", "A ---------------- drives a bus and takes children to school.", ["driver", "nurse", "farmer", "teacher"], 0, "راننده اتوبوس را می‌راند و بچه‌ها را به مدرسه می‌برد."),
  Q("l10-k4", "vocab-konkuri", "The police officer works with the ---------------- to keep the city safe.", ["police", "family", "alphabet", "dictionary"], 0, "افسر پلیس با پلیس کار می‌کند تا شهر امن بماند."),
  Q("l10-k5", "vocab-konkuri", "Her ---------------- is very young; she is only twenty years old.", ["age", "job", "date", "letter"], 0, "سن او خیلی کم است؛ او فقط بیست سالش است."),
  Q("l10-k6", "vocab-konkuri", "I write my homework in a small ---------------- every evening.", ["notebook", "blackboard", "kitchen", "shoe"], 0, "هر شب تکالیفم را در یک دفترِ کوچک می‌نویسم."),
  Q("l10-k7", "vocab-konkuri", "---------------- is the first month of the year in the English calendar.", ["January", "April", "July", "October"], 0, "ژانویه اولین ماه سال در تقویم انگلیسی است."),
  Q("l10-k8", "vocab-konkuri", "The doctor asks about my name and the ---------------- of my birth.", ["date", "door", "desk", "dress"], 0, "پزشک نام و تاریخ تولد من را می‌پرسد."),
  Q("l10-k9", "vocab-konkuri", "She is wearing a beautiful red ---------------- to the party.", ["dress", "ruler", "number", "object"], 0, "او یک لباس قرمزِ زیبا به مهمانی پوشیده است."),
  Q("l10-k10", "vocab-konkuri", "Children ---------------- eight hours every night to grow well.", ["sleep", "eat", "say", "start"], 0, "بچه‌ها هر شب هشت ساعت می‌خوابند تا خوب رشد کنند."),
  // ---------------- گرامر (۱۵ تست) ----------------
  Q("l10-g1", "grammar", "I ---------------- a new student in this school.", ["am", "is", "are", "be"], 0, "من دانش‌آموز تازه‌ای در این مدرسه هستم.", "فعل am فقط با I می‌آید."),
  Q("l10-g2", "grammar", "My sister ---------------- a nurse in a big hospital.", ["is", "am", "are", "do"], 0, "خواهرم پرستارِ یک بیمارستانِ بزرگ است.", "فاعل سوم‌شخص مفرد → is."),
  Q("l10-g3", "grammar", "We ---------------- in the seventh grade this year.", ["are", "is", "am", "was"], 0, "امسال ما در پایهٔ هفتم هستیم.", "فاعل جمع we → are."),
  Q("l10-g4", "grammar", "---------------- you a new classmate? — Yes, I am.", ["Are", "Is", "Am", "Do"], 0, "تو هم‌کلاسیِ تازه‌ای هستی؟ بله.", "سؤال با you → Are."),
  Q("l10-g5", "grammar", "---------------- is my friend Sara; she is twelve.", ["This", "These", "Those", "They"], 0, "این دوستم ساراست؛ او دوازده سالش است.", "معرفی مفردِ نزدیک → This."),
  Q("l10-g6", "grammar", "---------------- are my books; please don't take them.", ["These", "This", "That", "It"], 0, "این‌ها کتاب‌های من‌اند؛ لطفاً برندارشان.", "جمعِ نزدیک → These + فعل جمع."),
  Q("l10-g7", "grammar", "Look at those pens! ---------------- are on the teacher's desk.", ["They", "It", "This", "That"], 0, "به آن خودکارها نگاه کن! آن‌ها روی میز معلم‌اند.", "بعد از those، ضمیر جمع they می‌آید."),
  Q("l10-g8", "grammar", "I have two English ---------------- in my bag.", ["dictionaries", "dictionarys", "dictionary", "dictionaryes"], 0, "دو لغت‌نامهٔ انگلیسی در کیفم دارم.", "اسمِ تمام‌شده به «حرف صدادار + y» جمعش -ies می‌گیرد."),
  Q("l10-g9", "grammar", "There are three big ---------------- in our classroom.", ["windows", "window", "windowes", "windowies"], 0, "سه پنجرهٔ بزرگ در کلاس ما هست.", "جمعِ ساده با -s."),
  Q("l10-g10", "grammar", "---------------- name is Reza and he is my best friend.", ["His", "Her", "My", "Your"], 0, "اسم او رضاست و بهترین دوست من است.", "he → his؛ she → her."),
  Q("l10-g11", "grammar", "Sara is my classmate. ---------------- bag is blue.", ["Her", "His", "She", "Your"], 0, "سارا هم‌کلاسی من است. کیفِ او آبی است.", "بعد از Sara (زن) → her."),
  Q("l10-g12", "grammar", "My mother is ---------------- engineer at a big company.", ["an", "a", "the", "—"], 0, "مادرم مهندسِ یک شرکت بزرگ است.", "قبل از صدادار (engineer) → an."),
  Q("l10-g13", "grammar", "My father is ---------------- taxi driver.", ["a", "an", "two", "—"], 0, "پدرم رانندهٔ تاکسی است.", "قبل از صدای همخوان (driver) → a."),
  Q("l10-g14", "grammar", "The children are not in the ----------------; they are in the classroom.", ["kitchen", "classroom", "blackboard", "birthday"], 0, "بچه‌ها در آشپزخانه نیستند؛ در کلاس‌اند.", "معنی: آشپزخانه."),
  Q("l10-g15", "grammar", "That is ---------------- apartment; they live there.", ["their", "they", "them", "theirs"], 0, "آن آپارتمانِ آن‌هاست؛ آن‌جا زندگی می‌کنند.", "they → صفت ملکی their."),
];

export const lesson10: LessonData = {
  id: 10,
  titleEn: "Hello, English!",
  titleFa: "سلام، انگلیسی!",
  tagline: "الفبا، احوالپرسی، خانواده و مشاغل با فعل to be",
  color: "pink",
  grade: "هفتم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  antonyms,
  writing,
  quizzes,
};

export default lesson10;
