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

