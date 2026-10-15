import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Seven: "Saving Nature"  |  حفاظت از طبیعت
// Vision 1 (Grade 10) — Lesson One · جزوهٔ پایهٔ دهم (راند ۱۹۴ — «قفسهٔ کامل»)
// Grammar focus: Present Simple vs Progressive + linking words
// =====================================================================

const vocabulary = [
  W("alive", "زنده، در قید حیات", "adj"),
  W("air", "هوا", "n"),
  W("animal", "حیوان، جانور", "n"),
  W("appear", "ظاهر شدن، پیدا شدن", "v"),
  W("awful", "وحشتناک، بسیار بد", "adj"),
  W("beautiful", "زیبا، قشنگ", "adj"),
  W("beach", "ساحل (دریا)", "n"),
  W("bin", "سطل زباله", "n"),
  W("bird", "پرنده، مرغ", "n"),
  W("bottle", "بطری، شیشه", "n"),
  W("breathe", "نفس کشیدن", "v"),
  W("burn", "سوزاندن، سوختن", "v"),
  W("burn down", "از بین بردن با آتش، به آتش کشیدن", "phr.v"),
  W("camp", "چادر زدن، اردو زدن؛ اردوگاه", "v"),
  W("campfire", "آتش اردو، هیزم‌سوز", "n"),
  W("clean up", "تمیز کردن، پاک‌سازی کردن", "phr.v"),
  W("collect", "جمع‌آوری کردن، جمع کردن", "v"),
  W("community", "جامعهٔ محلی، اجتماع", "n"),
  W("cage", "قفس", "n"),
  W("cut down", "قطع کردن (درخت)، تیغه زدن", "phr.v"),
  W("danger", "خطر", "n"),
  W("dangerous", "خطرناک", "adj"),
  W("dead", "مرده، مُرده", "adj"),
  W("decrease", "کم شدن، کاهش یافتن", "v"),
  W("destroy", "از بین بردن، نابود کردن", "v"),
  W("disappear", "ناپدید شدن، محو شدن", "v"),
  W("dirty", "کثیف، آلوده", "adj"),
  W("drop", "انداختن، رها کردن؛ قطره", "v"),
  W("empty", "خالی", "adj"),
  W("extinct", "منقرض‌شده، نابودشده (گونه)", "adj"),
  W("forest", "جنگل", "n"),
  W("freedom", "آزادی", "n"),
  W("fresh", "تازه، شاداب", "adj"),
  W("full", "پر، لبریز", "adj"),
  W("garbage", "زباله، آشغال", "n"),
  W("glass", "شیشه؛ شیشه‌ای", "n"),
  W("grow", "رشد کردن، کاشتن", "v"),
  W("hike", "پیاده‌روی در طبیعت", "v"),
  W("hunt", "شکار کردن", "v"),
  W("hunter", "شکارچی", "n"),
  W("increase", "زیاد شدن، افزایش یافتن", "v"),
  W("insect", "حشره", "n"),
  W("kill", "کشتن", "v"),
  W("leaf", "برگ (شاخ و برگ: leaves)", "n"),
  W("litter", "ریختن زباله؛ زبالهٔ پراکنده", "v"),
  W("metal", "فلز", "n"),
  W("national park", "پارک ملی", "phr"),
  W("nature", "طبیعت", "n"),
  W("noisy", "پرسر و صدا", "adj"),
  W("ocean", "اقیانوس", "n"),
  W("oxygen", "اکسیژن", "n"),
  W("peaceful", "آرام، صلح‌آمیز", "adj"),
  W("picnic", "چرا کردن، پیک‌نیک رفتن؛ پیک‌نیک", "v"),
  W("planet", "سیاره", "n"),
  W("plastic", "پلاستیک، پلاستیکی", "n"),
  W("protect", "حفاظت کردن، محافظت کردن", "v"),
  W("quiet", "آرام، بی‌سر و صدا", "adj"),
  W("ranger", "دامدارِ پارک، نگهبانِ جنگل", "n"),
  W("recycle", "بازیافت کردن", "v"),
  W("reserve", "منطقهٔ حفاظت‌شده؛ ذخیره", "n"),
  W("reuse", "دوباره استفاده کردن", "v"),
  W("root", "ریشه", "n"),
  W("rubbish", "زباله، آشغال", "n"),
  W("safety", "ایمنی، بی‌خطری", "n"),
  W("seed", "بذر، دانه", "n"),
  W("silence", "سکوت، سکونه", "n"),
  W("smoke", "دود؛ سیگار کشیدن", "n"),
  W("soil", "خاک", "n"),
  W("sort", "دسته‌بندی کردن، جداسازی کردن", "v"),
  W("species", "گونه (جمع/مفرد)", "n"),
  W("suddenly", "ناگهان، یک‌دفعه", "adv"),
  W("terrible", "وحشتناک، افتضاح", "adj"),
  W("throw", "انداختن، پرتاب کردن", "v"),
  W("trail", "مسیر پیاده‌روی، دَرّه‌راه", "n"),
  W("trash", "زباله، دورریز", "n"),
  W("tree", "درخت", "n"),
  W("volunteer", "داوطلب، داوطلبانه کار کردن", "n"),
  W("wild", "وحشی، رام‌نشده", "adj"),
  W("wildlife", "حیات وحش، جانوران وحشی", "n"),
  W("wonderful", "شگفت‌انگیز، فوق‌العاده", "adj"),
  // — واژگان جامع (راند ۲۱۰، گیت‌شده)
  W("lose", "از دست دادن، گم کردن، باختن"),
  W("next", "بعد، آینده، دیگر"),
  W("nowadays", "این روزها، امروزه"),
  W("only", "فقط، تنها"),
  W("orally", "به طور شفاهی"),
  W("order", "نظم، ترتیب - دستور- سفارش"),
  W("past", "گذشته، پیش"),
  W("pattern", "الگو، روش"),
  W("pay attention to", "توجه کردن به"),
  W("phrase", "عبارت"),
  W("plain", "دشت، جلگه - ساده، آشکار"),
  W("plant", "گیاه - کاشتن"),
  W("plural", "جمع"),
  W("tomorrow", "فردا، روزبعد"),
  W("town", "شهر کوچک، شهرک"),
  W("type", "نوع - تایپ کردن"),
  W("voluntary", "داوطلبانه"),
  W("way", "روش، راه، شیوه، طریقه"),
  W("weight", "وزن"),
  W("whale", "نهنگ"),
  // — واژگان جامع (راند ۲۱۱، نجاتِ رسوبِ گیت‌شده)
  W("till", "تا، تا اینکه، تا زمانیکه"),
  W("tonight", "امشب"),
  W("unscramble", "مرتب کردن (کلمات به هم ریخته)"),
  W("visitor", "بازدید کننده، مالقات کننده"),
  W("whenever", "هر زمان که"),
];

const conversation = {
  introEn: "Listen to the conversation between Sara, a tenth-grade student, and Mr. Ahmadi, a park ranger, about protecting nature.",
  introFa: "به مکالمهٔ سارا، دانش‌آموز پایهٔ دهم، و آقای احمدی، نگهبانِ پارک، دربارهٔ حفاظت از طبیعت گوش دهید.",
  lines: [
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "Excuse me, sir. Our class is cleaning up the trail today. Can we help you too?",
      fa: "ببخشید آقا. کلاسِ ما امروز در حال پاک‌سازی مسیر است. ما هم می‌توانیم کمک کنیم؟",
    },
    {
      speaker: "Mr. Ahmadi",
      speakerFa: "آقای احمدی",
      en: "Of course, Sara! Volunteers are always welcome in this national park.",
      fa: "البته، سارا! داوطلب‌ها همیشه در این پارک ملی خوش‌آمدند.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "Look at all this rubbish near the river! People are throwing plastic bottles everywhere.",
      fa: "این همه زبالهٔ کنار رودخانه را ببینید! مردم همه‌جا در حال انداختن بطری‌های پلاستیکی‌اند.",
    },
    {
      speaker: "Mr. Ahmadi",
      speakerFa: "آقای احمدی",
      en: "Unfortunately, yes. Litter kills animals and destroys the beauty of nature.",
      fa: "متأسفانه بله. زباله حیوانات را می‌کشد و زیبایی طبیعت را نابود می‌کند.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "My teacher says a lot of species are disappearing because humans are destroying their homes.",
      fa: "معلم‌مان می‌گوید خیلی از گونه‌ها ناپدید می‌شوند چون انسان‌ها خانه‌هایشان را نابود می‌کنند.",
    },
    {
      speaker: "Mr. Ahmadi",
      speakerFa: "آقای احمدی",
      en: "That's true. When people cut down the forests, wild animals lose their food and their shelter.",
      fa: "درست است. وقتی مردم جنگل‌ها را قطع می‌کنند، حیوانات وحشی غذا و پناه‌گاه‌شان را از دست می‌دهند.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "So what can we do in our daily life to protect nature?",
      fa: "پس در زندگی روزانه‌مان چه کاری می‌توانیم بکنیم تا از طبیعت حفاظت کنیم؟",
    },
    {
      speaker: "Mr. Ahmadi",
      speakerFa: "آقای احمدی",
      en: "Three simple things: reduce your rubbish, reuse your bottles and bags, and recycle paper, glass, and metal.",
      fa: "سه کارِ ساده: زباله‌ات را کم کن، بطری‌ها و کیسه‌هایت را دوباره استفاده کن و کاغذ، شیشه و فلز را بازیافت کن.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "We are already sorting our rubbish at school. Paper goes in the blue bin and plastic in the yellow one.",
      fa: "ما در مدرسه همین حالا زباله‌هایمان را دسته‌بندی می‌کنیم. کاغذ در سطل آبی و پلاستیک در زرد.",
    },
    {
      speaker: "Mr. Ahmadi",
      speakerFa: "آقای احمدی",
      en: "Excellent! Small actions like that keep the air fresh and the rivers clean.",
      fa: "عالی! کارهای کوچکی مثل همان هوا را تازه و رودخانه‌ها را تمیز نگه می‌دارند.",
    },
    {
      speaker: "Sara",
      speakerFa: "سارا",
      en: "Sir, is it true that some birds never leave this forest, even in winter?",
      fa: "آقا، درست است که بعضی پرنده‌ها حتی در زمستان این جنگل را هرگز ترک نمی‌کنند؟",
    },
    {
      speaker: "Mr. Ahmadi",
      speakerFa: "آقای احمدی",
      en: "Yes, because this reserve is peaceful and full of food. That is why we protect it — nature gives life to everything.",
      fa: "بله، چون این منطقهٔ حفاظت‌شده آرام و پُر از غذاست. برای همین از آن حفاظت می‌کنیم — طبیعت به همه‌چیز زندگی می‌دهد.",
    },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "Saving Nature",
    titleFa: "حفاظت از طبیعت",
    source: "Vision 1 — Student Book: Lesson One",
    paragraphs: [
      {
        en: "Nature is everything around us: the trees, the rivers, the birds in the sky, and the fish in the sea. Every morning the sun rises, the wind blows, and millions of living things wake up together. Our planet is the only home that we have, and it is full of wonders that we are still discovering.",
        fa: "طبیعت همه‌چیزِ اطرافِ ماست: درخت‌ها، رودخانه‌ها، پرنده‌های آسمان و ماهی‌های دریا. هر روز صبح خورشید طلوع می‌کند، باد می‌وزد و میلیون‌ها موجودِ زنده با هم بیدار می‌شوند. سیارهٔ ما تنها خانه‌ای است که داریم و پر از شگفتی‌هایی است که هنوز در حال کشف‌شان هستیم.",
      },
      {
        en: "Today, however, nature is in danger. Every year, people cut down millions of trees and destroy large parts of the forests. Many animals are losing their homes, and some species are disappearing forever. When a species becomes extinct, it never comes back; the world becomes a poorer place.",
        fa: "اما امروز طبیعت در خطر است. هر سال مردم میلیون‌ها درخت قطع می‌کنند و بخش‌های بزرگی از جنگل‌ها را نابود می‌کنند. بسیاری از حیوانات خانه‌هایشان را از دست می‌دهند و بعضی گونه‌ها برای همیشه ناپدید می‌شوند. وقتی گونه‌ای منقرض شود، دیگر هرگز برنمی‌گردد؛ دنیا جای فقیرتری می‌شود.",
      },
      {
        en: "Pollution is another big problem. Plastic bottles, paper, and other rubbish are covering our beaches and rivers. Smoke from factories and cars is filling the air, and it is becoming harder and harder to breathe. The beautiful silence of the forests is turning into a noisy, dirty world.",
        fa: "آلودگی مشکل بزرگ دیگری است. بطری‌های پلاستیکی، کاغذ و زباله‌های دیگر ساحل‌ها و رودخانه‌هایمان را پوشانده‌اند. دودِ کارخانه‌ها و ماشین‌ها هوا را پُر می‌کند و نفس کشیدن روزبه‌روز سخت‌تر می‌شود. سکوتِ زیبای جنگل‌ها به دنیایی پُرسروصدا و کثیف تبدیل می‌شود.",
      },
      {
        en: "The good news is that everyone can help. When we reduce our rubbish, reuse our bags, and recycle glass and metal, we protect the planet. Volunteers around the world are cleaning up beaches, planting trees, and taking care of national parks. These small actions are saving the lives of thousands of animals.",
        fa: "خبر خوب این است که همه می‌توانند کمک کنند. وقتی زباله‌مان را کم می‌کنیم، کیسه‌هایمان را دوباره استفاده می‌کنیم و شیشه و فلز را بازیافت می‌کنیم، از سیاره حفاظت می‌کنیم. داوطلب‌های سراسر دنیا ساحل‌ها را پاک‌سازی می‌کنند، درخت می‌کارند و از پارک‌های ملی مراقبت می‌کنند. این کارهای کوچک جانِ هزاران حیوان را نجات می‌دهند.",
      },
      {
        en: "Nature does not need us; we need nature. The trees give us oxygen, the rivers give us water, and the soil gives us food. If we protect nature today, it will protect us tomorrow. Saving nature is not somebody else's job — it starts with you and me, right here, right now.",
        fa: "طبیعت به ما نیاز ندارد؛ ما به طبیعت نیاز داریم. درخت‌ها به ما اکسیژن می‌دهند، رودخانه‌ها آب می‌دهند و خاک غذا می‌دهد. اگر امروز از طبیعت حفاظت کنیم، فردا طبیعت از ما حفاظت می‌کند. حفاظت از طبیعت کارِ کسِ دیگری نیست — از تو و من شروع می‌شود، همین‌جا، همین حالا.",
      },
    ],
  },
  {
    titleEn: "Every Day is Earth Day",
    titleFa: "هر روز، روزِ زمین است",
    source: "Vision 1 — Workbook: Lesson One",
    paragraphs: [
      {
        en: "On April 22nd, millions of people in almost two hundred countries celebrate Earth Day. Schools organize tree-planting events, families clean up their neighborhoods, and children learn why the earth is important. But do we really need a special day to care about our planet?",
        fa: "در بیست‌ودوم آوریل، میلیون‌ها نفر در نزدیک به دویست کشور روزِ زمین را جشن می‌گیرند. مدرسه‌ها برنامهٔ درخت‌کاری می‌گذارند، خانواده‌ها محله‌هایشان را پاک‌سازی می‌کنند و بچه‌ها یاد می‌گیرند چرا زمین مهم است. اما آیا واقعاً برای اهمیت‌دادن به سیاره‌مان به روزی خاص نیاز داریم؟",
      },
      {
        en: "Last spring, the students of a small school decided to adopt the park near their houses. Every Friday, they collected rubbish, sorted it into paper, plastic, and glass, and sent it to the recycling center. In one year, they gathered more than three thousand bags of trash.",
        fa: "بهارِ گذشته، دانش‌آموزانِ یک مدرسهٔ کوچک تصمیم گرفتند پارکِ نزدیک خانه‌هایشان را به فرزندی بپذیرند. هر جمعه زباله جمع می‌کردند، آن را به کاغذ، پلاستیک و شیشه دسته‌بندی می‌کردند و به مرکز بازیافت می‌فرستادند. در یک سال، بیش از سه هزار کیسه زباله گردآوری کردند.",
      },
      {
        en: "The changes appeared quickly. The grass became greener, the birds came back, and families started to walk on the clean trails again. The mayor visited the park, and the students' project became a model for ten other towns. All of this started with a few children and a simple idea.",
        fa: "تغییرها به‌سرعت ظاهر شدند. چمن سبزتر شد، پرنده‌ها برگشتند و خانواده‌ها دوباره شروع به پیاده‌روی روی مسیرهای تمیز کردند. شهردار از پارک بازدید کرد و پروژهٔ دانش‌آموزان به الگویی برای ده شهر دیگر تبدیل شد. همهٔ این‌ها با چند بچه و یک ایدهٔ ساده شروع شد.",
      },
      {
        en: "Scientists say that protecting one hectare of forest can save hundreds of living species. That is why rangers work day and night in the reserves, watching for hunters and forest fires. Their job is difficult, but every tree they save gives oxygen, food, and shelter to so many creatures.",
        fa: "دانشمندان می‌گویند حفاظت از یک هکتار جنگل می‌تواند صدها گونهٔ زنده را نجات دهد. برای همین نگهبانان شبانه‌روز در مناطق حفاظت‌شده کار می‌کنند و مواظب شکارچی‌ها و آتش‌سوزی جنگل‌اند. کارشان سخت است، اما هر درختی که نجات می‌دهند به موجوداتِ بسیار، اکسیژن و غذا و پناه می‌دهد.",
      },
      {
        en: "You do not need to be a scientist or a ranger to help the earth. Throw your rubbish in the bin, turn off the extra lights, walk or ride a bicycle for short distances, and tell your friends about the value of nature. When millions of people do small things together, the earth smiles again.",
        fa: "برای کمک به زمین لازم نیست دانشمند یا نگهبانِ پارک باشی. زباله‌ات را در سطل بینداز، چراغ‌های اضافی را خاموش کن، برای مسیرهای کوتاه پیاده برو یا دوچرخه سوار شو و دربارهٔ ارزش طبیعت با دوستانت حرف بزن. وقتی میلیون‌ها نفر کارهای کوچک را با هم انجام می‌دهند، زمین دوباره لبخند می‌زند.",
      },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "مرور حال ساده و حال استمراری (Present Simple vs Present Progressive)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">از حال ساده برای «عادت‌ها و حقایق» و از حال استمراری برای «کارهای در حالِ انجام، همین حالا» استفاده می‌شود:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-orange-700 text-white"><th class="px-3 py-2">زمان</th><th class="px-3 py-2">ساختار</th><th class="px-3 py-2">نشانگرها</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">حال ساده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">V(+s/es)</td><td class="px-3 py-2 border-t border-stone-100">always، usually، every day، often</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Birds <b>fly</b> in the sky.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">حال استمراری</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">am/is/are + V-ing</td><td class="px-3 py-2 border-t border-stone-100">now، at the moment، look!، listen!</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Look! The bird <b>is flying</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">منفی/پرسشی</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">do/does ... / am-is-are + not</td><td class="px-3 py-2 border-t border-stone-100">—</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>doesn't cut</b> trees. / They <b>aren't cutting</b> trees now.</td></tr>
      </tbody></table></div>
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm leading-7 text-orange-900 mb-3">💡 <b>نکتهٔ کنکوری:</b> فعل‌های حالتی (${EN(
        "know, want, like, love, need, understand, believe"
      )}) معمولاً شکل استمراری نمی‌گیرند: ${EN(
        "I <b>know</b> the answer. (NOT: I am knowing)"
      )}</div>`,
  },
  {
    title: "حروف ربط: and، but، or، so، because",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">حروف ربط دو جمله یا دو جزء را به هم وصل می‌کنند؛ هر کدام رابطهٔ خاص خودش را می‌سازد:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-orange-700 text-white"><th class="px-3 py-2">حرف ربط</th><th class="px-3 py-2">رابطه</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">and</td><td class="px-3 py-2 border-t border-stone-100">افزودن (و)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We collect paper <b>and</b> glass.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">but</td><td class="px-3 py-2 border-t border-stone-100">تضاد (اما)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The park is small, <b>but</b> it is full of life.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">or</td><td class="px-3 py-2 border-t border-stone-100">انتخاب (یا)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Reuse the bottle <b>or</b> recycle it.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">so</td><td class="px-3 py-2 border-t border-stone-100">نتیجه (پس)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The river was dirty, <b>so</b> we cleaned it up.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">because</td><td class="px-3 py-2 border-t border-stone-100">علت (چون)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We protect forests <b>because</b> they give us oxygen.</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>تفاوتِ so و because:</b> در ${EN(
        "so"
      )} جملهٔ اول «علت» و جملهٔ دوم «نتیجه» است؛ در ${EN(
        "because"
      )} برعکس. ${EN(
        "It rained, so we stayed home. = We stayed home because it rained."
      )}</div>`,
  },
  {
    title: "قیدهای بسامد و حالت (Adverbs of Frequency & Manner)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3"><b>قیدهای بسامد</b> (always، usually، often، sometimes، rarely، never) میزان تکرار کار را نشان می‌دهند و «قبل از فعلِ اصلی، اما بعد از فعلِ to be» می‌نشینند:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-orange-700 text-white"><th class="px-3 py-2">جمله</th><th class="px-3 py-2">جای قید</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She <b>always recycles</b> her bottles.</td><td class="px-3 py-2 border-t border-stone-100">قبل از فعلِ اصلی</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Rangers are <b>usually</b> in the park.</td><td class="px-3 py-2 border-t border-stone-100">بعد از فعلِ to be</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We <b>never throw</b> rubbish in the river.</td><td class="px-3 py-2 border-t border-stone-100">never منفی است؛ فعل مثبت می‌ماند</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3"><b>قیدهای حالت</b> چگونگیِ انجام کار را می‌گویند و معمولاً با <span dir="ltr">-ly</span> ساخته می‌شوند (sudden → suddenly؛ quiet → quietly). استثناها: ${EN(
        "good → well, fast → fast, hard → hard"
      )}:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-orange-700 text-white"><th class="px-3 py-2">صفت</th><th class="px-3 py-2">قید</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">سریع</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">fast</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The fire spread <b>fast</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">خوب</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">well</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The students work <b>well</b> together.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">آرام</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">quietly</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We walked <b>quietly</b> in the reserve.</td></tr>
      </tbody></table></div>`,
  },
];

const writing: WritingExercise[] = [
  { id: "l7-w1", fa: "پرنده‌ها در آسمان پرواز می‌کنند. (عادت)", answer: ["Birds", "fly", "in", "the", "sky"], hint: "حال ساده برای عادت‌ها؛ فعل بدون to" },
  { id: "l7-w2", fa: "ببین! آن رنجر دارد درخت می‌کارد.", answer: ["Look!", "The", "ranger", "is", "planting", "a", "tree"], hint: "بعد از Look! حال استمراری می‌آید" },
  { id: "l7-w3", fa: "ما هرگز در رودخانه زباله نمی‌اندازیم.", answer: ["We", "never", "throw", "rubbish", "in", "the", "river"], hint: "قید بسامد قبل از فعل اصلی؛ فعل مثبت" },
  { id: "l7-w4", fa: "رودخانه کثیف بود، پس ما آن را پاک‌سازی کردیم.", answer: ["The", "river", "was", "dirty", "so", "we", "cleaned", "it", "up"], hint: "so برای نتیجه" },
  { id: "l7-w5", fa: "ما از جنگل‌ها حفاظت می‌کنیم چون به ما اکسیژن می‌دهند.", answer: ["We", "protect", "forests", "because", "they", "give", "us", "oxygen"], hint: "because برای علت" },
  { id: "l7-w6", fa: "کاغذ را بازیافت کن یا دوباره استفاده‌اش کن.", answer: ["Recycle", "the", "paper", "or", "reuse", "it"], hint: "or برای انتخاب؛ جملهٔ امری" },
  { id: "l7-w7", fa: "دانش‌آموزها با هم خوب کار می‌کنند.", answer: ["The", "students", "work", "well", "together"], hint: "قید حالت well بعد از فعل" },
  { id: "l7-w8", fa: "او همیشه بطری‌هایش را بازیافت می‌کند.", answer: ["She", "always", "recycles", "her", "bottles"], hint: "always قبل از فعل اصلی می‌نشیند" },
];

const synonyms = [
  SYN("protect", "guard", "حفاظت کردن ↔ نگهبانی کردن"),
  SYN("destroy", "ruin", "نابود کردن ↔ خراب کردن"),
  SYN("rubbish", "trash", "زباله ↔ دورریز"),
  SYN("reduce", "decrease", "کم کردن ↔ کاهش دادن"),
  SYN("collect", "gather", "جمع‌آوری کردن ↔ گردآوردن"),
  SYN("beautiful", "lovely", "زیبا ↔ دوست‌داشتنی"),
  SYN("wonderful", "amazing", "شگفت‌انگیز ↔ حیرت‌آور"),
  SYN("fresh", "pure", "تازه ↔ خالص"),
  SYN("peaceful", "calm", "آرام ↔ ساکت و آرام"),
  SYN("quiet", "silent", "بی‌صدا ↔ ساکت"),
  SYN("awful", "terrible", "وحشتناک ↔ افتضاح"),
  SYN("dangerous", "risky", "خطرناک ↔ پُرخطر"),
  SYN("hike", "walk", "پیاده‌روی کردن ↔ راه رفتن"),
  SYN("disappear", "vanish", "ناپدید شدن ↔ غایب شدن"),
  SYN("suddenly", "unexpectedly", "ناگهان ↔ غیرمنتظره"),
  SYN("freedom", "liberty", "آزادی ↔ رهایی"),
];

const antonyms = [
  ANT("protect", "destroy", "حفاظت کردن ↔ نابود کردن"),
  ANT("alive", "dead", "زنده ↔ مرده"),
  ANT("appear", "disappear", "ظاهر شدن ↔ ناپدید شدن"),
  ANT("increase", "decrease", "افزایش ↔ کاهش"),
  ANT("full", "empty", "پر ↔ خالی"),
  ANT("clean up", "pollute", "پاک‌سازی ↔ آلوده کردن"),
  ANT("fresh", "stale", "تازه ↔ مانده/بیات"),
  ANT("quiet", "noisy", "آرام ↔ پُرسروصدا"),
  ANT("safe", "dangerous", "ایمن ↔ خطرناک"),
  ANT("wild", "tame", "وحشی ↔ اهلی"),
  ANT("beautiful", "ugly", "زیبا ↔ زشت"),
  ANT("remember", "forget", "به یاد داشتن ↔ فراموش کردن"),
];

const quizzes = [
  // ---------------- واژگان استاندارد (۱۵ تست) ----------------
  Q("l7-v1", "vocab", "We must ---------------- nature, because it gives us food, water, and oxygen.", ["protect", "destroy", "hunt", "cut down"], 0, "باید از طبیعت حفاظت کنیم، چون به ما غذا، آب و اکسیژن می‌دهد."),
  Q("l7-v2", "vocab", "Please throw your rubbish in the ----------------, not on the ground.", ["bin", "trail", "reserve", "cage"], 0, "لطفاً زباله‌ات را در سطل بینداز، نه روی زمین."),
  Q("l7-v3", "vocab", "People ---------------- thousands of trees every year to build new houses.", ["cut down", "clean up", "sort out", "pick up"], 0, "مردم هر سال هزاران درخت قطع می‌کنند تا خانه‌های جدید بسازند."),
  Q("l7-v4", "vocab", "Many species are ---------------- forever because humans are destroying their homes.", ["disappearing", "appearing", "breathing", "growing"], 0, "بسیاری از گونه‌ها برای همیشه ناپدید می‌شوند چون انسان‌ها خانه‌هایشان را نابود می‌کنند."),
  Q("l7-v5", "vocab", "We ---------------- paper, glass, and metal so they can be used again.", ["recycle", "burn", "waste", "kill"], 0, "کاغذ، شیشه و فلز را بازیافت می‌کنیم تا دوباره استفاده شوند."),
  Q("l7-v6", "vocab", "The ---------------- of this forest is peaceful; you can hear only birds and wind.", ["silence", "danger", "smoke", "freedom"], 0, "سکوت این جنگل آرام است؛ فقط صدای پرنده‌ها و باد را می‌شنوی."),
  Q("l7-v7", "vocab", "Trees take in carbon dioxide and give us ---------------- to breathe.", ["oxygen", "smoke", "plastic", "rubbish"], 0, "درخت‌ها دی‌اکسید کربن می‌گیرند و اکسیژنی برای نفس کشیدن به ما می‌دهند."),
  Q("l7-v8", "vocab", "Volunteers are ---------------- the beach; they pick up every plastic bottle they find.", ["cleaning up", "cutting down", "hunting", "burning down"], 0, "داوطلب‌ها در حال پاک‌سازی ساحل‌اند؛ هر بطری پلاستیکی که پیدا می‌کنند برمی‌دارند."),
  Q("l7-v9", "vocab", "A ---------------- works in a national park and protects the animals from hunters.", ["ranger", "volunteer", "hunter", "picnic"], 0, "رنجر در پارک ملی کار می‌کند و از حیوانات در برابر شکارچی‌ها حفاظت می‌کند."),
  Q("l7-v10", "vocab", "Don't ---------------- that old bottle away; we can reuse it for water.", ["throw", "sort", "collect", "grow"], 0, "آن بطری قدیمی را دور نینداز؛ می‌توانیم برای آب دوباره از آن استفاده کنیم."),
  Q("l7-v11", "vocab", "The air in the mountains is ---------------- and clean, so it is easy to breathe there.", ["fresh", "dirty", "terrible", "noisy"], 0, "هوا در کوه‌ها تازه و تمیز است، پس نفس کشیدن آن‌جا آسان است."),
  Q("l7-v12", "vocab", "Plants grow best in rich, dark ---------------- full of natural food.", ["soil", "smoke", "glass", "plastic"], 0, "گیاهان در خاکِ حاصلخیزِ تیره و پُر از غذای طبیعی بهتر رشد می‌کنند."),
  Q("l7-v13", "vocab", "The population of this bird is ---------------- fast because its food is disappearing.", ["decreasing", "increasing", "breathing", "protecting"], 0, "جمعیت این پرنده به‌سرعت کم می‌شود چون غذایش ناپدید می‌شود."),
  Q("l7-v14", "vocab", "We went on a long ---------------- in the forest and walked for six hours.", ["hike", "picnic", "campfire", "safety"], 0, "پیاده‌روی طولانی در جنگل رفتیم و شش ساعت راه رفتیم."),
  Q("l7-v15", "vocab", "It is ---------------- to swim in this river; the water moves very fast.", ["dangerous", "peaceful", "wonderful", "beautiful"], 0, "شنا در این رودخانه خطرناک است؛ آب خیلی سریع حرکت می‌کند."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l7-k1", "vocab-konkuri", "Unfortunately, the white tiger is in danger of becoming ---------------- in the wild.", ["extinct", "alive", "fresh", "wild"], 0, "متأسفانه ببر سفید در طبیعت در خطر انقراض است."),
  Q("l7-k2", "vocab-konkuri", "Hunters caught the birds and kept them in a small ----------------.", ["cage", "reserve", "trail", "soil"], 0, "شکارچی‌ها پرنده‌ها را گرفتند و در قفسی کوچک نگه داشتند."),
  Q("l7-k3", "vocab-konkuri", "Animals in the ---------------- live in freedom, far from cities and roads.", ["wild", "bin", "camp", "park"], 0, "حیوانات در حیات وحش با آزادی زندگی می‌کنند، دور از شهرها و جاده‌ها."),
  Q("l7-k4", "vocab-konkuri", "Every spring, the students of our school ---------------- trees near the river.", ["plant", "throw", "burn", "drop"], 0, "هر بهار دانش‌آموزان مدرسه‌مان کنار رودخانه درخت می‌کارند."),
  Q("l7-k5", "vocab-konkuri", "The whole ---------------- of the village worked together to clean the forest.", ["community", "rubbish", "trail", "smoke"], 0, "کل جامعهٔ محلیِ روستا برای تمیز کردن جنگل همکاری کرد."),
  Q("l7-k6", "vocab-konkuri", "Please ---------------- the rubbish before you throw it: paper here, plastic there.", ["sort", "burn", "cut", "kill"], 0, "لطفاً قبل از دور انداختن، زباله را دسته‌بندی کن: کاغذ این‌جا، پلاستیک آن‌جا."),
  Q("l7-k7", "vocab-konkuri", "Scientists ---------------- that the number of wild animals is becoming smaller.", ["observe", "throw", "hunt", "protect"], 0, "دانشمندان مشاهده می‌کنند که شمار حیوانات وحشی کمتر می‌شود."),
  Q("l7-k8", "vocab-konkuri", "The forest fire ---------------- several hectares of old trees last summer.", ["destroyed", "protected", "collected", "recycled"], 0, "آتش‌سوزی جنگل تابستان گذشته چند هکتار از درختان قدیمی را نابود کرد."),
  Q("l7-k9", "vocab-konkuri", "We should not ---------------- animals for fun; they have a right to live.", ["kill", "feed", "watch", "save"], 0, "نباید حیوانات را برای تفریح بکشیم؛ آن‌ها حق زندگی دارند."),
  Q("l7-k10", "vocab-konkuri", "The volunteers put all the ---------------- into bags and took it out of the park.", ["litter", "oxygen", "safety", "seed"], 0, "داوطلب‌ها همهٔ زباله‌های پراکنده را در کیسه گذاشتند و از پارک بیرون بردند."),
  Q("l7-k11", "vocab-konkuri", "It was a bad accident. They're lucky to be ----------------.", ["dead", "alive", "living", "injured"], 1, "تصادف بدی بود؛ خوش‌شانس‌اند که زنده‌اند."),
  Q("l7-k12", "vocab-konkuri", "It's ---------------- how often you see drivers using mobile phones.", ["boring", "common", "amazing", "important"], 2, "شگفت‌انگیز است که چه‌قدر زیاد راننده‌ها را می‌بینی که با موبایل رانندگی می‌کنند."),
  Q("l7-k13", "vocab-konkuri", "The government should develop an education system which is more ---------------- to the needs of the students.", ["common", "especial", "important", "appropriate"], 3, "دولت باید سیستمِ آموزشی‌ای بسازد که مناسب‌تر با نیازهای دانش‌آموزان باشد."),
  Q("l7-k14", "vocab-konkuri", "The ---------------- cost of making a movie has increased by 25 percent.", ["above", "beginning", "hope", "average"], 3, "هزینهٔ متوسطِ ساختِ فیلم ۲۵ درصد افزایش یافته است."),
  Q("l7-k15", "vocab-konkuri", "The TV play was ---------------- real-life events of poor people in our society.", ["instead of", "based on", "interested in", "asked for"], 1, "آن سریالِ تلویزیونی بر رویدادهای واقعیِ مردمِ تنگ‌دستِ جامعهٔ ما بنا شده بود."),
  // ---------------- گرامر (۱۵ تست) ----------------
  Q("l7-g1", "grammar", "Look! The volunteers ---------------- the beach right now.", ["are cleaning", "clean", "cleans", "cleaned"], 0, "ببین! داوطلب‌ها همین حالا ساحل را پاک‌سازی می‌کنند.", "بعد از Look! حال استمراری می‌آید."),
  Q("l7-g2", "grammar", "My family usually ---------------- to the mountains in spring.", ["goes", "go", "is going", "going"], 0, "خانواده‌ام معمولاً در بهار به کوه می‌رود.", "usually نشانگر حال ساده؛ فاعل سوم‌شخص مفرد پس goes."),
  Q("l7-g3", "grammar", "Be quiet, please! The baby ---------------- in the next room.", ["is sleeping", "sleeps", "sleep", "slept"], 0, "ساکت لطفاً! بچه در اتاق بغلی خواب است.", "همین حالا در حال انجام است → حال استمراری."),
  Q("l7-g4", "grammar", "I ---------------- the answer; please don't explain it again.", ["know", "am knowing", "knows", "knowing"], 0, "جواب را می‌دانم؛ لطفاً دوباره توضیح نده.", "فعل حالتی know استمراری نمی‌گیرد."),
  Q("l7-g5", "grammar", "Rangers ---------------- often ---------------- at night in summer.", ["do / work", "does / work", "are / working", "is / working"], 0, "رنجرها تابستان‌ها اغلب شب‌ها کار می‌کنند.", "سؤال/منفی حال سادهٔ جمع با do ساخته می‌شود."),
  Q("l7-g6", "grammar", "We collect paper and glass, ---------------- we send them to the recycling center.", ["and", "but", "or", "so"], 0, "کاغذ و شیشه جمع می‌کنیم و به مرکز بازیافت می‌فرستیم.", "افزودن دو کار → and."),
  Q("l7-g7", "grammar", "The trail was long, ---------------- we enjoyed every minute of it.", ["but", "and", "so", "because"], 0, "مسیر طولانی بود، اما از هر دقیقه‌اش لذت بردیم.", "تضاد → but."),
  Q("l7-g8", "grammar", "The river was full of rubbish, ---------------- the students decided to clean it up.", ["so", "because", "but", "or"], 0, "رودخانه پُر از زباله بود، پس دانش‌آموزان تصمیم گرفتند پاک‌سازی‌اش کنند.", "نتیجه → so."),
  Q("l7-g9", "grammar", "We must protect the forests ---------------- they give us oxygen and food.", ["because", "so", "but", "or"], 0, "باید از جنگل‌ها حفاظت کنیم چون اکسیژن و غذا به ما می‌دهند.", "علت → because."),
  Q("l7-g10", "grammar", "You can reuse this bottle ---------------- recycle it at the center.", ["or", "but", "so", "because"], 0, "می‌توانی این بطری را دوباره استفاده کنی یا در مرکز بازیافت کنی.", "انتخاب → or."),
  Q("l7-g11", "grammar", "She ---------------- recycles her bottles; it is her daily habit.", ["always", "is always", "always is", "the always"], 0, "او همیشه بطری‌هایش را بازیافت می‌کند؛ عادتِ روزانه‌اش است.", "قید بسامد قبل از فعل اصلی و بعد از فاعل."),
  Q("l7-g12", "grammar", "The rangers are ---------------- in the reserve during the fire season.", ["usually", "usual", "use", "the usually"], 0, "رنجرها در فصل آتش‌سوزی معمولاً در منطقهٔ حفاظت‌شده‌اند.", "بعد از to be، قید بسامد (شکل قیدی) می‌آید."),
  Q("l7-g13", "grammar", "The fire spread ---------------- because of the strong wind.", ["fast", "fastly", "faster", "the fastest"], 0, "آتش به‌خاطر بادِ شدید به‌سرعت گسترش یافت.", "قید fast شکل -ly ندارد."),
  Q("l7-g14", "grammar", "Our team works very ---------------- and finishes the project on time.", ["well", "good", "better", "best"], 0, "تیم ما خیلی خوب کار می‌کند و پروژه را سرِ وقت تمام می‌کند.", "قیدِ حالتِ good → well."),
  Q("l7-g15", "grammar", "The children walked ---------------- through the quiet forest.", ["quietly", "quiet", "quietness", "quieter"], 0, "بچه‌ها به‌آرامی در جنگلِ ساکت قدم زدند.", "قید حالت quietly نحوهٔ راه رفتن را توصیف می‌کند."),

  // ---------------- واژگان/گرامر استاندارد و کنکوری جزوهٔ جامع (راند ۲۱۲) ----------------
  Q("l7-bk1", "vocab-konkuri", "In the past, teachers and students used ------------------------- to write instead of the marker we use today.", ["pens", "chalks", "pencils", "rulers"], 1),
  Q("l7-bk2", "vocab-konkuri", "Samira was so ------------------------- that when we asked her to dance, she didn’t accept.", ["serious", "lazy", "quiet", "shy"], 3),
  Q("l7-bk3", "vocab-konkuri", "A ---------------------- person is able to do dangerous things with no fear.", ["brave", "hard-working", "neat", "generous"], 0),
  Q("l7-bk4", "vocab-konkuri", "The airplane ------------------------ ten minutes ago. I can still see it in the sky.", ["landed", "took off", "boarded", "got off"], 1),
  Q("l7-bk5", "vocab-konkuri", "----------------------- are rich in vitamins and I advise you to eat them with lunch and dinner.", ["coconuts", "vegetables", "nuts", "dates"], 1),
  Q("l7-bk6", "vocab-konkuri", "We ------------------------ martyrs in our country. They are the symbols of our power.", ["keep", "help", "respect", "celebrate"], 2),
  Q("l7-bk7", "vocab-konkuri", "Fortunately, the firefighters were able to ---------------------- the fire immediately and no one was hurt.", ["put out", "took care of", "participated in", "took out"], 0),
  Q("l7-bk8", "vocab-konkuri", "He wants to be a/an ---------------------- in the future. He likes designing the map of the buildings a lot.", ["engineer", "painter", "pilot", "mechanic"], 0),
  Q("l7-bk9", "vocab-konkuri", "Mina ---------------------- a newspaper every day. She is into magazines and newspapers.", ["reads", "studies", "attends", "receives"], 0),
  Q("l7-bk10", "vocab-konkuri", "My English teacher believes that it is necessary for us to ------------------- in classroom activities.", ["set", "read", "participate", "interview"], 2),
  Q("l7-bk11", "vocab-konkuri", "When I saw the ------------------------, I called the emergency immediately.", ["ceremony", "fireworks", "parade", "accident"], 3),
  Q("l7-bk12", "vocab-konkuri", "All of us have heard that eating ----------------------- is useful for our eyes.", ["apples", "carrots", "bananas", "onions"], 1),
  Q("l7-bk13", "vocab-konkuri", "Muslims don’t usually--------------------- on Fitr Eid.", ["fast", "work", "eat", "cook"], 0),
  Q("l7-bk14", "vocab-konkuri", "My friend is ------------------------ at working with computers. He knows everything about them.", ["nice", "well", "good", "clever"], 2),
  Q("l7-bk15", "vocab-konkuri", "I like -------------------- a puzzle. In addition, I can get much information too.", ["making", "playing", "studying", "doing"], 3),
  Q("l7-bk16", "vocab-konkuri", "I ----------------------- an antivirus program on my laptop last night.", ["installed", "received", "chose", "bought"], 0),
  Q("l7-bk17", "vocab-konkuri", "There are two --------------------- holidays in Moharram month.", ["national", "religious", "military", "international"], 1),
  Q("l7-bk18", "vocab-konkuri", "My knees ------------------------ when I fell down during the football game.", ["burnt", "stood", "bruised", "changed"], 2),
  Q("l7-bk19", "vocab-konkuri", "They ---------------------- us one by one and asked some questions about our end of teaching.", ["interviewed", "texted", "helped", "cleared"], 0),
  Q("l7-bk20", "vocab-konkuri", "My father is ------------------------ a hotel in Rasht now. He will stay there for two weeks.", ["booking", "checking", "traveling", "exchanging"], 0),
  Q("l7-bk21", "vocab-konkuri", "My brother was so ---------------------- that I didn’t say anything and stayed quiet.", ["cruel", "rude", "careless", "angry"], 3),
  Q("l7-bk22", "vocab-konkuri", "My classmate is very -----------------------. She always helps us with our lessons.", ["hard-working", "brave", "careful", "helpful"], 3),
  Q("l7-bk23", "vocab-konkuri", "You should be more ------------------- with the students. You should be able to forgive their mistakes.", ["careful", "patient", "serious", "selfish"], 1),
  Q("l7-bk24", "vocab-konkuri", "Iranian people ------------------------- a ceremony on 22nd Bahman.", ["hold", "set", "stand", "keep"], 0),
  Q("l7-bk25", "vocab-konkuri", "Our ---------------------- force is so powerful that we have no fear to fight against our enemies.", ["military", "religious", "national", "international"], 0),
  Q("l7-bk26", "vocab-konkuri", "Our -------------------- is very important, so we should pay much attention to it. Playing sports can help us stay well.", ["hobby", "ability", "appearance", "health"], 3),
  Q("l7-bk27", "vocab-konkuri", "Muslims ------------------------ their prayers before noon on Fitr Eid.", ["say", "tell", "hold", "stand"], 0),
  Q("l7-bk28", "vocab-konkuri", "You can get your vitamin tablets from that ---------------------.", ["hospital", "giftshop", "drugstore", "emergency room"], 2),
  Q("l7-bk29", "vocab-konkuri", "In the -------------------- of countries there are many facilities and much progress.", ["capital", "city", "nation", "village"], 0),
  Q("l7-bk30", "vocab-konkuri", "He has nothing to do. He is always ------------------------ the Internet.", ["browsing", "watching", "sending", "paying"], 0),
  Q("l7-bk31", "vocab-konkuri", "We --------------------- the national anthem at school every day. It shows our independence.", ["read", "study", "hold", "sing"], 3),
  Q("l7-bk32", "vocab-konkuri", "Today is their wedding ----------------------. They have a party at this time each year.", ["holiday", "commemoration", "anniversary", "festival"], 2),
  Q("l7-bk33", "vocab-konkuri", "My brother’s room is always very ----------------------. Everything is in the right place.", ["lazy", "careless", "neat", "hard-working"], 2),
  Q("l7-bk34", "vocab-konkuri", "In order not to forget the martyrs we ---------------------- them every year and narrate their advice for our children.", ["commemorate", "celebrate", "hold", "help"], 0),
  Q("l7-bk35", "vocab-konkuri", "The Iranian cheetah is ----------- --------------- endangered animals.", ["anymore", "among", "wildlife", "common"], 1),
  Q("l7-bk36", "vocab-konkuri", "After the Second World War, Germany was ----------- --------------- into two separate countries.", ["identified", "hoped", "underlined", "divided"], 3),
  Q("l7-bk37", "vocab-konkuri", "My brother brought the ----------- --------------- bird into the room and took care of it.", ["injured", "endangered", "natural", "relative"], 1),
  Q("l7-bk38", "vocab-konkuri", "I called the firefighters to ----------- --------------- the fire in the city center.", ["put out", "cut down", "turn off", "pay attention"], 0),
  Q("l7-bk39", "vocab-konkuri", "I think they should ----------- --------------- the number of the buses.", ["hurt", "choose", "destroy", "increase"], 3),
  Q("l7-bk40", "vocab-konkuri", "We had to change our ----------- --------------- because the bus arrived late.", ["plain", "report", "information", "schedule"], 3),
  Q("l7-bk41", "vocab-konkuri", "Endangered animals need ----------- --------------- and attention.", ["protection", "hope", "enough", "intonation"], 0),
  Q("l7-bk42", "vocab-konkuri", "In the past, many hunters didn’t ----------- --------------- attention to wildlife.", ["take", "pay", "hurt", "save"], 1),
  Q("l7-bk43", "vocab-konkuri", "The building was completely ----------- --------------- by fire.", ["identified", "divided", "destroyed", "increased"], 2),
  Q("l7-bk44", "vocab-konkuri", "I ----------- --------------- my pocket money in the street yesterday.", ["destroyed", "put out", "paid", "lost"], 3),
  Q("l7-bk45", "vocab-konkuri", "Many homes, schools, mosques and offices were damaged and thousands of ----------- --------------- people were taken to hospitals.", ["hopeful", "injured", "dangerous", "endangered"], 1),
  Q("l7-bk46", "grammar", "Her situation is getting worse. The doctors think that she ------------------- die.", ["is going to", "will", "goes to", "will go to"], 1),
  Q("l7-bk47", "grammar", "Look! The barometer is falling, perhaps the weather ------------------ be nice at the weekend.", ["won’t go to", "isn’t going to", "won’t", "willn’t"], 1),
  Q("l7-bk48", "grammar", "A: Why are you wearing your best suit? B: I ----------------- have lunch with my biggest customer.", ["will", "'m going to", "go to", "will to"], 1),
  Q("l7-bk49", "vocab-konkuri", "Firefighters soon ---------- ----------- the fire out.", ["take", "put", "turn", "make"], 1),
  Q("l7-bk50", "vocab-konkuri", "I really like to be a ---------- ----------- because I enjoy visiting different places in the world.", ["hunter", "pilot", "tourist", "zookeeper"], 2),
  Q("l7-bk51", "vocab-konkuri", "This is a ---------- ----------- mountain, but those mountains are low.", ["high", "long", "short", "thin"], 0),
  Q("l7-bk52", "vocab-konkuri", "Humans cut down trees and destroy lakes. They make homes and roads ---------- -----------.", ["natural", "instead", "forest", "future"], 1),

  // ---------------- رسوبِ نجات‌یافتهٔ تست‌های جزوهٔ جامع — حلِ دستیِ کلِ ردیف‌به‌ردیف (راند ۲۱۳) ----------------
  Q("l7-bk53", "grammar", "Tom called to say he’s going to be ------------------ minutes late.", ["much", "a few", "anymore", "else"], 1),
  Q("l7-bk54", "vocab-konkuri", "His writing style is now --------------------- and out of date and many people didn’t enjoy it.", ["boring", "hopeful", "interesting", "especial"], 0),
  Q("l7-bk55", "vocab-konkuri", "We need to work together to achieve our --------------------- goal.", ["common", "completed", "natural", "protected"], 0),
  Q("l7-bk56", "vocab-konkuri", "If we continue to ------------------- the countryside, many more animals will die out in the near future.", ["protect", "destroy", "build", "take care of"], 1),
  Q("l7-bk57", "vocab-konkuri", "The --------------------- of new jobs for unemployed people is hard for most countries nowadays.", ["destroying", "creation", "dividing", "decreasing"], 1),
  Q("l7-bk58", "vocab-konkuri", "Write your full name in the --------------------- space at the bottom of the from.", ["column", "blank", "next", "right"], 1),
  Q("l7-bk59", "vocab-konkuri", "Here, the river --------------------- three channels and we must take channel one for fishing.", ["divides in to", "dies out", "odds out", "takes care of"], 0),
  Q("l7-bk60", "vocab-konkuri", "The lizards are classed as an --------------------- species.", ["common", "endangered", "injured", "natural"], 1),
  Q("l7-bk61", "vocab-konkuri", "I never liked long walks, --------------------- in winter days.", ["hopefully", "especially", "amazingly", "wonderfully"], 1),
  Q("l7-bk62", "vocab-konkuri", "It’s so necessary for us to increase our --------------------- about birth control.", ["lifespan", "expression", "knowledge", "chart"], 2),
  Q("l7-bk63", "vocab-konkuri", "Helen didn’t study, she decided to become a pilot art ----------------------.", ["finally", "at first", "instead", "for example"], 2),
  Q("l7-bk64", "vocab-konkuri", "The last week terrible car accident left him seriously ---------------------.", ["endangered", "injured", "died out", "saved"], 1),
  Q("l7-bk65", "vocab-konkuri", "Our teacher is really worried that your absences in the classes are ---------------------.", ["decreasing", "increasing", "completing", "protecting"], 1),
  Q("l7-bk66", "vocab-konkuri", "The --------------------- body is a very complicated machine and is one of wonders of creation.", ["tiger", "elephant", "animal", "human"], 3),
  Q("l7-bk67", "vocab-konkuri", "We had better --------------------- what they have to say about that important project .", ["complete", "lose", "hear", "order"], 2),
  Q("l7-bk68", "vocab-konkuri", "We’ve been able to save this land from development and keep it for --------------------- generations.", ["past", "future", "present", "injury"], 1),
  Q("l7-bk69", "vocab-konkuri", "Many countries, --------------------- Mexico and Japan, have a lot of earthquakes every year.", ["for example", "instead", "yet", "finally"], 0),
  Q("l7-bk70", "vocab-konkuri", "Cambridge is always full of --------------------- in the summer.", ["patterns", "tourists", "phrases", "expression"], 1),
  Q("l7-bk71", "vocab-konkuri", "Is there a particular --------------------- of book he enjoys?", ["type", "point", "rule", "way"], 0),
  Q("l7-bk72", "vocab-konkuri", "I don’t want to see you --------------------- because you behaved badly toward me.", ["next", "else", "till", "anymore"], 3),
  Q("l7-bk73", "vocab-konkuri", "It is important to separate learning English --------------------- from learning it by reading books.", ["irregularly", "orally", "especially", "naturally"], 1),
  Q("l7-bk74", "vocab-konkuri", "The organization depended heavily on --------------------- help.", ["natural", "voluntary", "regular", "simple"], 1),
  Q("l7-bk75", "vocab-konkuri", "Fax machines were a --------------------- invention at that time.", ["wonderful", "simple", "natural", "common"], 0),
  Q("l7-bk76", "vocab-konkuri", "They lived in a ten-story --------------------- in the town center.", ["tower", "place", "plain", "pattern"], 0),
  Q("l7-bk77", "vocab-konkuri", "He is fourteen, old enough to --------------------- himself.", ["pay attention to", "take care of", "divide into", "based on"], 1),
  Q("l7-bk78", "vocab-konkuri", "A --------------------- is a large wild animal that has yellow and black lines on its body .", ["elephant", "tiger", "fish", "dolphin"], 1),
  Q("l7-bk79", "vocab-konkuri", "How can he fit everything in to his busy ---------------------?", ["schedule", "strategy", "weight", "pattern"], 0),
  Q("l7-bk80", "vocab-konkuri", "Joe is an expert in military ---------------------.", ["world", "rule", "strategy", "type"], 2),
  Q("l7-bk81", "vocab-konkuri", "His conditions was critical, but the doctors were able to --------------------- him.", ["visit", "protect", "save", "consider"], 2),
  Q("l7-bk82", "vocab-konkuri", "The accident seemed to have completely ---------------------- his confidence.", ["built", "destroyed", "stayed", "considered"], 1),
  Q("l7-bk83", "vocab-konkuri", "----------------------, we’ll be able to rearrange the dates of our holiday.", ["Hopefully", "Usually", "Really", "Angrily"], 0),
  Q("l7-bk84", "vocab-konkuri", "He picked up a piece of ---------------------- and wrote the answer on the blackboard .", ["pattern", "air", "chalk", "graph"], 2),
  Q("l7-bk85", "vocab-konkuri", "Since retiring from the company, she has done ---------------------- work for a charity.", ["natural", "voluntary", "plural", "recent"], 1),
  Q("l7-bk86", "vocab-konkuri", "The -------------- will be closed and go under if a generous donor isn’t found within the next few months.", ["charity", "plant", "world", "weather"], 0),
  Q("l7-bk87", "vocab-konkuri", "At the end of the lecture, I’d like all the students to --------------------- small discussion groups.", ["put out", "divide into", "check out", "take off"], 1),
  Q("l7-bk88", "vocab-konkuri", "If everything goes according to --------------------, work will be complete in December.", ["phrase", "schedule", "forest", "intonation"], 1),
  Q("l7-bk89", "vocab-konkuri", "All you have to do to win is ---------------------- the words here to find four names of birds.", ["considering", "unscrambling", "cleaning", "beginning"], 1),
  Q("l7-bk90", "vocab-konkuri", "We’re not doing enough to ---------------------- the environment from pollution.", ["protect", "break", "donate", "interview"], 0),
  Q("l7-bk91", "vocab-konkuri", "The working life of most vehicles can be increased if they are serviced ----------------------.", ["recently", "carelessly", "originally", "regularly"], 3),
  Q("l7-bk92", "vocab-konkuri", "Even the smallest baby can ---------------------- its mother by her voice.", ["imagine", "decrease", "identify", "save"], 2),
  Q("l7-bk93", "vocab-konkuri", "I didn’t feel that this was an ---------------------- time to mention the subject of money.", ["different", "appropriate", "excellent", "generous"], 1),
  Q("l7-bk94", "vocab-konkuri", "---------------------- animals and plants need to be kept secure from poachers.", ["International", "Endangered", "possible", "cultural"], 1),
  Q("l7-bk95", "vocab-konkuri", "-----------------------, the construction will be finished before school reopens in September. The students will feel great about this.", ["Naturally", "Hopefully", "Carefully", "Hardly"], 1),
  Q("l7-bk96", "vocab-konkuri", "What a ----------------------- sight it was to see so many beautiful boats on the lake at the same time.", ["simple", "irregular", "religious", "wonderful"], 3),
  Q("l7-bk97", "vocab-konkuri", "The management was forced to ----------------------- salaries for many of the workers.", ["introduce", "sneeze", "increase", "suggest"], 2),
  Q("l7-bk98", "vocab-konkuri", "It is important to separate learning English --------------------- from learning English by reading books.", ["slowly", "orally", "averagely", "quickly"], 1),
  Q("l7-bk99", "vocab-konkuri", "The role of scientists is to observe and ------------------------- the world, not to try to control it.", ["describe", "leave", "decide", "account"], 0),
  Q("l7-bk100", "vocab-konkuri", "The leader ---------------------- them that they should leave the country immediately.", ["interested", "advised", "hired", "attended"], 1),
  Q("l7-bk101", "vocab-konkuri", "There was an ---------------------- article about vegetarianism in the newspaper yesterday.", ["plural", "selfish", "interesting", "polite"], 2),
  Q("l7-bk102", "vocab-konkuri", "In the past eight years, the elephant --------------------- in Africa has been halved.", ["population", "facilities", "attention", "wonders"], 0),
  Q("l7-bk103", "vocab-konkuri", "While I was in the crowd, I had to ---------------------- my voice to make myself heard over the noise.", ["divide", "keep", "put", "raise"], 3),
  Q("l7-bk104", "vocab-konkuri", "A self-protecting system will defend itself from ----------------------- damages and external attacks.", ["hopeful", "oral", "accidental", "important"], 2),
  Q("l7-bk105", "vocab-konkuri", "After world war, many countries --------------------- to have a great army to protect themselves.", ["guessed", "decided", "left", "completed"], 1),
  Q("l7-bk106", "vocab-konkuri", "The people at the table behind us were --------------------- someone’s birthday.", ["suggesting", "hoping", "celebrating", "destroying"], 2),
  Q("l7-bk107", "vocab-konkuri", "A dangerous amount of radioactivity was released into the --------------------- last month.", ["environment", "point", "mirror", "history"], 0),
  Q("l7-bk108", "vocab-konkuri", "A leg injury is stopping him from active -------------------- in the sport matches.", ["description", "information", "participation", "location"], 2),
  Q("l7-bk109", "vocab-konkuri", "Each room has books, toys, and games that are -------------------- to that specific age group.", ["suitable", "actual", "interested", "possible"], 0),
  Q("l7-bk110", "vocab-konkuri", "We are planning a dinner to celebrate the 50th ------------------- of the founding of the company.", ["charity", "account", "anniversary", "personality"], 2),
  Q("l7-bk111", "vocab-konkuri", "He repeated his country’s desire and interest for --------------- relations with all neighboring countries.", ["friendly", "selfish", "voluntary", "religious"], 0),
  Q("l7-bk112", "vocab-konkuri", "Australia has its own -------------------------, which is very different from that of Britain.", ["information", "conversation", "culture", "course"], 2),
  Q("l7-bk113", "vocab-konkuri", "Lots of people always say time changes things, but you ----------------- have to change them yourself.", ["carefully", "politely", "actually", "hardly"], 2),
  Q("l7-bk114", "vocab-konkuri", "I went to several libraries to gather information about a book about ----------------------- animals.", ["careful", "endangered", "serious", "wonderful"], 1),
  Q("l7-bk115", "vocab-konkuri", "The ---------------------- in the number of bicycles and cars might give rise to another new set of environmental problems.", ["military", "information", "injury", "decrease"], 3),
  Q("l7-bk116", "vocab-konkuri", "Parents of young children often become depressed, and this is -------------------- true of single parents.", ["especially", "naturally", "really", "internationally"], 0),
  Q("l7-bk117", "vocab-konkuri", "If you compare house prices in the two towns, it’s quite ------------------------- how different they are.", ["pleasant", "possible", "serious", "amazing"], 3),
  Q("l7-bk118", "vocab-konkuri", "------------------- is to do something to show that you remember and respect someone important or an important event in the past.", ["injures", "commemorates", "unscrambles", "identifies"], 1),
  Q("l7-bk119", "vocab-konkuri", "The average human --------------- in the developed countries has increased over the last hundred years.", ["lifespan", "schedule", "nature", "interest"], 0),
  Q("l7-bk120", "grammar", "When people keep the earth clean and safe, most kinds of animals will ------------- longer in the future.", ["live", "living", "are going to live", "lived"], 0),
  Q("l7-bk121", "grammar", "Other students are going ------------------- their friends’ reports and learn many things about nature and sea animals.", ["read", "to read", "will read", "reading"], 1),
  Q("l7-bk122", "grammar", "Mr. Rahimi’s little daughter broke his expensive laptop. He --------------------- a new one next month.", ["be going to buy", "bought", "will buying", "is going to buy"], 3),
  Q("l7-bk123", "grammar", "A: My classmates and I don’t know how to answer these difficult math questions. B: They’re really easy. Don’t worry my dear students. I --------------------- you these questions again.", ["am going to teach", "will teach", "am teaching", "taught"], 1),
  Q("l7-bk124", "grammar", "Next Saturday, my cousin ----------------- to Tehran for 2 days to visit Milad Tower and Azadi Square.", ["is going to travel", "will travel", "traveled", "travel"], 0),
  Q("l7-bk125", "grammar", "My parents have decided to have a great birthday party for me. They --------------------- my best friends next Wednesday.", ["invite", "will invite", "are going to invite", "have invited"], 2),
  Q("l7-bk126", "grammar", "Our mother has bought some rice, meat from the supermarket. So, she ----------------------- a delicious food tomorrow night.", ["cook", "cooked", "will cook", "is going to cook"], 3),
  Q("l7-bk127", "grammar", "When you come to our house Sunday night, I --------------------- you my big new toy train.", ["am going to show", "will show", "show", "showed"], 0),
  Q("l7-bk128", "grammar", "The hard-working zookeepers in our city’s zoo ----------------- the endangered animals more seriously.", ["will protects", "are going to protect", "protecting", "to protect"], 1),
  Q("l7-bk129", "grammar", "Raman helped his friend, Arshan to solve his math problems. He -------------------- him do his homework next Thursday.", ["will help", "helps", "is going to help", "be going to help"], 2),
  Q("l7-bk130", "grammar", "I don’t know what time the movie ------------------ tonight.", ["is beginning", "will begin", "begins", "began"], 2),
  Q("l7-bk131", "grammar", "I think Sarah ---------- ----------- like the present we bought for her.", ["will", "is going to", "goes to like", "will be"], 0),
  Q("l7-bk132", "grammar", "She is so pale that I believe she---------------- now.", ["is going to faint", "will faint", "faints", "is fainting"], 0),
  Q("l7-bk133", "grammar", "Samira and Saba ------------------- go to the cinema tonight. It’s said that the movie is great. I wish I could go with them.", ["is going to", "were going to", "are going to", "was going to"], 2),
  Q("l7-bk134", "grammar", "We should wrap up warm, it has been snowing for two day, so it ------------------ very cold outside.", ["was", "will be", "isn’t", "is going to be"], 3),
  Q("l7-bk135", "grammar", "Drive slowly Jack! Otherwise, we -------------------- a car crash!", ["will have", "have", "are having", "are going to have"], 3),
  Q("l7-bk136", "grammar", "After graduation, I ------------------- found an institute. I think it ----------------- attract lots of students.", ["will / is going to", "am going to / is going to", "will / will", "am going to / will"], 3),
  Q("l7-bk137", "grammar", "There is a football match on TV tomorrow night. I feel Real Madrid --------------- against Barcelona.", ["will win", "is going to win", "wins", "is winning"], 0),
  Q("l7-bk138", "grammar", "I saw three --------------- in the mountain. They -------------- very dangerous.", ["wolves/are", "wolfs/were", "wolves/were", "wolfs / are"], 2),
  Q("l7-bk139", "grammar", "Coming back home, we found -----------------. She was crying loudly.", ["three missing kids", "a missing kids", "a missing kid", "two missing kid"], 2),
  Q("l7-bk140", "grammar", "---------------- guest who they invited was from -------------. He was a famous athlete.", ["A / the German", "The / Germany", "A / the Germany", "The / German"], 1),
  Q("l7-bk141", "grammar", "Since the creation, there have been a lot of ---------------- on the earth who have had different traditions", ["peoples / beliefs", "people / believes", "persons / beliefs", "peoples / believes"], 0),
  Q("l7-bk142", "grammar", "The accident happened --------------- hour ago. --------------- were taken to hospital immediately.", ["a / The injured people", "an / Injured people", "a / Injured people", "an / The injured people"], 3),
  Q("l7-bk143", "grammar", "Those people standing in --------------- are impatient with the long queue.", ["lines", "a line", "an line", "line"], 3),
  

];

export const lesson7: LessonData = {
  id: 7,
  titleEn: "Saving Nature",
  titleFa: "حفاظت از طبیعت",
  tagline: "طبیعت، بازیافت و مرورِ حال ساده/استمراری با حروف ربط",
  color: "orange",
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

export default lesson7;

