import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Twelve: "People and Media"  |  آدم‌ها و رسانه
// Prospect 3 (Grade 9) — جزوهٔ دکتر حسن لطفی، پایهٔ نهم (راند ۱۹۸ — «قفسهٔ شش‌پایه»)
// Grade-wide booklet: personality, travel, festivals & ceremonies,
// services, media, health & injuries.
// Grammar focus: be + صفتِ شخصیت، حال استمراری، گذشتهٔ سادهٔ باقاعده/بی‌قاعده
// =====================================================================

const vocabulary = [
  W("personality", "شخصیت", "n"),
  W("kind", "مهربان", "adj"),
  W("lazy", "تنبل", "adj"),
  W("angry", "عصبانی", "adj"),
  W("member", "عضو", "n"),
  W("best", "بهترین", "adj"),
  W("neat", "مرتب، تمیز و منظم", "adj"),
  W("nervous", "مضطرب، نگران", "adj"),
  W("brave", "شجاع", "adj"),
  W("patient", "صبور؛ بیمار", "adj"),
  W("careful", "با دقت، مواظب", "adj"),
  W("careless", "بی‌دقت", "adj"),
  W("clever", "باهوش، زیرک", "adj"),
  W("cruel", "بی‌رحم، ستمگر", "adj"),
  W("environment", "محیط، محیط‌زیست", "n"),
  W("everybody", "هرکس، همه", "pron"),
  W("forget", "فراموش کردن", "v"),
  W("friendly", "صمیمی، دوستانه", "adj"),
  W("funny", "بامزه، خنده‌دار", "adj"),
  W("generous", "بخشنده", "adj"),
  W("happy", "خوشحال، شاد", "adj"),
  W("hard-working", "سخت‌کوش، کوشا", "adj"),
  W("helpful", "مفید، کمک‌کننده", "adj"),
  W("homework", "تکلیف، کارِ خانه", "n"),
  W("kid", "بچه", "n"),
  W("pleasant", "دلپذیر", "adj"),
  W("polite", "مودب", "adj"),
  W("quiet", "ساکت، آرام", "adj"),
  W("relative", "خویشاوند، فامیل", "n"),
  W("rude", "بی‌ادب", "adj"),
  W("selfish", "خودخواه", "adj"),
  W("serious", "جدی", "adj"),
  W("shy", "خجالتی", "adj"),
  W("soldier", "سرباز", "n"),
  W("talkative", "پرحرف", "adj"),
  W("upset", "ناراحت", "adj"),
  W("travel", "سفر کردن؛ سفر", "v"),
  W("trip", "سفر (کوتاه)", "n"),
  W("tourist", "توریست، جهانگرد", "n"),
  W("festival", "جشن، جشنواره", "n"),
  W("ceremony", "مراسم، آیین", "n"),
  W("celebrate", "جشن گرفتن، برگزار کردن", "v"),
  W("media", "رسانه", "n"),
  W("program", "برنامه (رادیو/تلویزیون)", "n"),
  W("channel", "کانال", "n"),
  W("news", "اخبار، خبر", "n"),
  W("health", "سلامتی", "n"),
  W("injury", "جراحت، آسیب", "n"),
  W("hurt", "آسیب دیدن؛ آسیب زدن", "v"),
  W("broken", "شکسته", "adj"),
  W("ambulance", "آمبولانس", "n"),
  W("headache", "سردرد", "n"),
  W("sore throat", "گلودرد", "n"),
  W("medicine", "دارو", "n"),
  W("service", "خدمات، سرویس", "n"),
  W("busy", "پرکار، شلوغ؛ گرفتار", "adj"),
  W("proud", "سربلند، مفتخر", "adj"),
  W("interesting", "جالب", "adj"),
  W("usually", "معمولاً", "adv"),
  W("always", "همیشه", "adv"),
  W("never", "هرگز", "adv"),
  W("sometimes", "گاهی اوقات", "adv"),
  W("very much", "خیلی زیاد", "adv"),
  W("why", "چرا", "adv"),
];

const conversation = {
  introEn: "Listen to the conversation between Elham and her friend Nasrin about a school project on personalities and TV programs.",
  introFa: "به مکالمهٔ الهام و دوستش نسرین دربارهٔ یک پروژهٔ مدرسه‌ای روی شخصیت‌ها و برنامه‌های تلویزیون گوش دهید.",
  lines: [
    { speaker: "Elham", speakerFa: "الهام", en: "Hi Nasrin! Did you watch the documentary last night?", fa: "سلام نسرین! مستند دیشب را دیدی؟" },
    { speaker: "Nasrin", speakerFa: "نسرین", en: "Yes, I did. It was about a brave soldier who saved his friends.", fa: "بله دیدم. دربارهٔ سربازِ شجاعی بود که دوستانش را نجات داد." },
    { speaker: "Elham", speakerFa: "الهام", en: "I watched it too. What a kind person he was!", fa: "منم دیدم. چه آدمِ مهربانی بود!" },
    { speaker: "Nasrin", speakerFa: "نسرین", en: "Right. And he was very generous; he gave his food to the village kids.", fa: "درسته. و خیلی هم بخشنده بود؛ غذایش را به بچه‌های روستا داد." },
    { speaker: "Elham", speakerFa: "الهام", en: "Our teacher says we should write about a person we admire.", fa: "معلممان می‌گوید باید دربارهٔ کسی که تحسینش می‌کنیم بنویسیم." },
    { speaker: "Nasrin", speakerFa: "نسرین", en: "I'm writing about my grandma. She is patient, polite and never angry.", fa: "من دربارهٔ مادربزرگم می‌نویسم. او صبور و مودب است و هرگز عصبانی نمی‌شود." },
    { speaker: "Elham", speakerFa: "الهام", en: "Nice! My uncle is my hero. He is a doctor and he works hard every day.", fa: "چه خوب! دایی‌ام قهرمان من است. پزشک است و هر روز سخت کار می‌کند." },
    { speaker: "Nasrin", speakerFa: "نسرین", en: "Is he hard-working?", fa: "او سخت‌کوش است؟" },
    { speaker: "Elham", speakerFa: "الهام", en: "Very! But he is not serious all the time; he is quite funny.", fa: "خیلی! اما همهٔ وقت‌ها جدی نیست؛ او بامزه است." },
    { speaker: "Nasrin", speakerFa: "نسرین", en: "My little brother is the opposite: talkative and a little careless!", fa: "برادر کوچکم برعکس است: پرحرف و کمی بی‌دقت!" },
    { speaker: "Elham", speakerFa: "الهام", en: "Ha! Kids are like that. Are you watching the new program tonight?", fa: "ها! بچه‌ها همین‌طورند. امشب برنامهٔ جدید را می‌بینی؟" },
    { speaker: "Nasrin", speakerFa: "نسرین", en: "Sure. It starts at nine on channel two. Don't forget!", fa: "حتماً. ساعت نه از کانال دو شروع می‌شود. یادت نره!" },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "The Kind Stranger",
    titleFa: "غریبهٔ مهربان",
    source: "Prospect 3 — Booklet: Grade Nine",
    paragraphs: [
      { en: "Last winter, Reza traveled to Ahvaz to visit his relatives. The trip was long and the bus arrived late at night. When he got off, the streets were quiet and the weather was colder than he thought. Reza was a little nervous because it was his first trip alone.", fa: "پارسال زمستان رضا برای دیدن فامیل به اهواز سفر کرد. سفر طولانی بود و اتوبوس دیرهنگام رسید. وقتی پیاده شد خیابان‌ها ساکت و هوا سردتر از آن بود که فکر می‌کرد. رضا کمی مضطرب بود چون اولین سفرِ تنهايش بود." },
      { en: "At the bus station, Reza couldn't find his wallet. He searched all his pockets and his bag, but the wallet was gone. All his money and his ticket home were in it. He sat on a bench, sad and worried. Everybody walked past him; nobody stopped.", fa: "در ترمینال، رضا نتوانست کیف پولش را پیدا کند. همهٔ جیب‌ها و کیفش را گشت اما کیف پول نبود. همهٔ پولش و بلیتِ برگشتش داخلش بود. روی نیمکت نشست، غمگین و نگران. همه از کنارش می‌گذشتند؛ هیچ‌کس نایستاد." },
      { en: "Then an old man with a warm smile came to him. \"Why are you upset, young man?\" he asked. Reza told him the story. The stranger listened carefully and said, \"Don't worry. First, we call your family.\" He used his own phone and waited with Reza until his uncle answered.", fa: "بعد پیرمردی با لبخند گرم پیشش آمد. پرسید: «چرا ناراحتی، جوان؟» رضا ماجرا را گفت. غریبه با دقت گوش داد و گفت: «نگران نباش. اول به خانواده‌ات زنگ می‌زنیم.» با گوشیِ خودش زنگ زد و کنار رضا ماند تا عمویش جواب داد." },
      { en: "The kind man was a retired teacher. He was talkative and friendly, and he told Reza about the city while they waited. \"People here are not careless,\" he said proudly. \"We help each other.\" After one hour, Reza's uncle arrived and thanked the stranger again and again.", fa: "مردِ مهربان معلمِ بازنشسته‌ای بود. پرحرف و صمیمی بود و وقتی منتظر می‌شدند، از شهر برای رضا گفت. با غرور گفت: «مردم این‌جا بی‌دقت نیستند. ما به همدیگر کمک می‌کنیم.» بعد از یک ساعت عموی رضا رسید و بارها از غریبه تشکر کرد." },
      { en: "Reza never forgot that winter night. Now, when he sees a person who needs help, he always stops. \"A little kindness makes a big story,\" he says. He learned that the best personality is not to be rich or famous; it is to be kind, patient and generous.", fa: "رضا هرگز آن شبِ زمستانی را فراموش نکرد. حالا وقتی کسی را می‌بیند که کمک لازم دارد، همیشه می‌ایستد. می‌گوید: «کمی مهربانی، قصهٔ بزرگی می‌سازد.» یاد گرفت که بهترین شخصیت این نیست که پولدار یا مشهور باشی؛ این است که مهربان، صبور و بخشنده باشی." },
    ],
  },
  {
    titleEn: "Screens Big and Small",
    titleFa: "صفحه‌نمایش‌ها، بزرگ و کوچک",
    source: "Prospect 3 — Booklet: Grade Nine",
    paragraphs: [
      { en: "Fifty years ago, there was only one TV channel in Iran, and families watched the news together every evening. Today, media are everywhere: TVs, phones, tablets, and computers. People watch programs on big screens, small screens, and even very small screens in their pockets.", fa: "پنجاه سال پیش در ایران فقط یک کانال تلویزیون بود و خانواده‌ها هر شب اخبار را با هم تماشا می‌کردند. امروز رسانه‌ها همه‌جا هستند: تلویزیون‌ها، گوشی‌ها، تبلت‌ها و رایانه‌ها. مردم برنامه‌ها را روی نمایشگرهای بزرگ، کوچک و حتی خیلی کوچک در جیب‌هایشان می‌بینند." },
      { en: "Media give us news very fast. When something happens in one country, the whole world knows about it in minutes. TV channels show the story, websites write about it, and everybody talks about it. Fast news is useful, but it is not always careful, so good viewers ask questions first.", fa: "رسانه‌ها اخبار را خیلی سریع به ما می‌رسانند. وقتی اتفاقی در کشوری می‌افتد، جهان در چند دقیقه باخبر می‌شود. کانال‌های تلویزیون ماجرا را نشان می‌دهند، وب‌سایت‌ها درباره‌اش می‌نویسند و همه درباره‌اش حرف می‌زنند. خبرِ سریع مفید است اما همیشه با دقت نیست، پس بینندهٔ خوب اول سؤال می‌پرسد." },
      { en: "Not everything on screens is good for us. Doctors say too much screen time hurts our eyes and our sleep. Some kids become lazy and forget their homework. A famous study last year showed that students who watched TV for more than four hours studied less than the others.", fa: "همهٔ چیزهای روی نمایشگر برای ما خوب نیست. پزشکان می‌گویند وقتِ زیادِ نمایشگر به چشم‌ها و خوابمان آسیب می‌زند. بعضی بچه‌ها تنبل می‌شوند و تکالیفشان را فراموش می‌کنند. یک پژوهشِ مشهور پارسال نشان داد دانش‌آموزانی که بیش از چهار ساعت تلویزیون می‌دیدند، کمتر از بقیه درس می‌خواندند." },
      { en: "So how can we use media well? First, choose your programs carefully; an interesting documentary teaches you more than five hours of funny videos. Second, take a break every thirty minutes. Third, don't watch screens at midnight — your brain needs sleep, not more news.", fa: "پس چطور می‌توانیم از رسانه‌ها خوب استفاده کنیم؟ اول، برنامه‌هایت را با دقت انتخاب کن؛ یک مستندِ جالب بیشتر از پنج ساعت ویدیوی بامزه به تو یاد می‌دهد. دوم، هر سی دقیقه استراحت کن. سوم، نیمه‌شب پای نمایشگر نرو — مغز تو به خواب نیاز دارد، نه اخبارِ بیشتر." },
      { en: "Media are like a big library that never closes. A careful and polite viewer finds wonderful things in it: science, art, languages, and stories from every culture. The screen is only a tool; the person behind the screen makes the choice. Be a wise viewer, and the media will be your best teacher.", fa: "رسانه‌ها مثل کتابخانهٔ بزرگی هستند که هرگز تعطیل نمی‌شود. بینندهٔ با دقت و مودب چیزهای شگفت‌انگیزی در آن پیدا می‌کند: علم، هنر، زبان‌ها و قصه‌هایی از هر فرهنگ. نمایشگر فقط یک ابزار است؛ آدمِ پشتِ نمایشگر انتخاب می‌کند. بیننده‌ای خرد باش، و رسانه بهترین معلم تو خواهد بود." },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "شخصیت‌ها با صفت: be + adjective و توصیفِ آدم‌ها",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">صفت‌های شخصیت بعد از فعل ${EN(
        "to be"
      )} می‌آیند و «حالتِ آدم‌ها» را توصیف می‌کنند — صفت هرگز جمع نمی‌شود:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-purple-700 text-white"><th class="px-3 py-2">ساختار</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">فاعل + be + صفت</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>is kind</b>. / They <b>are generous</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">منفی</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She <b>is not lazy</b>. = She isn't lazy.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">سؤال</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Is</b> he <b>serious</b>? — No, he is funny.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">صفت + اسم</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">a <b>brave</b> soldier / <b>hard-working</b> students</td></tr>
      </tbody></table></div>
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm leading-7 text-purple-900 mb-3">💡 <b>نکتهٔ امتحانی:</b> وقتی صفتِ شخصیت قبل از اسم می‌آید، فعلِ to be حذف می‌شود: ${EN(
        "He is a <b>kind</b> man."
      )} — و صفت‌ها با ${EN("very/quite")} شدت می‌گیرند: ${EN("very <b>helpful</b>، quite <b>funny</b>")}</div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>دو جفتِ مهمِ مقابل:</b> ${EN(
        "kind ↔ rude، careful ↔ careless، generous ↔ selfish"
      )} — تضادها را با هم یاد بگیر تا در تست‌های واژگان سریع جواب بدهی.</div>`,
  },
  {
    title: "حال استمراری (Present Progressive) — کارِ در حالِ انجام",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای کاری که «همین حالا» در جریان است، از حال استمراری استفاده می‌کنیم:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-purple-700 text-white"><th class="px-3 py-2">ساختار</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">am/is/are + V-ing</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">I <b>am watching</b> TV now.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">منفی</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>isn't studying</b> at the moment.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">سؤال</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Are</b> you <b>listening</b> to me?</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">نشانگرها</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">now، at the moment، Look!، Listen!</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">قاعدهٔ ساختِ ${EN(
        "V-ing"
      )}: فعلِ تمام‌شده به ${EN("e")} بی‌صدا، e حذف می‌شود: ${EN(
        "write → writ<b>ing</b>، make → mak<b>ing</b>"
      )}؛ فعلِ تک‌هجاییِ «صدا + صدا»، حرف آخر دوبل می‌شود: ${EN(
        "run → run<b>n</b>ing، sit → sit<b>t</b>ing"
      )}</p>
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm leading-7 text-purple-900">💡 <b>نکتهٔ کنکوری:</b> فعل‌های حالتی (${EN(
        "know, want, like, love, need, understand"
      )}) استمراری نمی‌گیرند: ${EN(
        "I <b>know</b> the news. (NOT: I am knowing)"
      )}</div>`,
  },
  {
    title: "گذشتهٔ ساده باقاعده و بی‌قاعده (Past Simple: Regular & Irregular)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای کاری که در گذشته «تمام شد»، گذشتهٔ ساده می‌آید. افعالِ باقاعده با ${EN(
        "-ed"
      )} ساخته می‌شوند؛ افعالِ بی‌قاعده شکلِ دومِ خاصِ خودشان را دارند:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-purple-700 text-white"><th class="px-3 py-2">نوع</th><th class="px-3 py-2">حال</th><th class="px-3 py-2">گذشته</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">باقاعده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">watch</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">watch<b>ed</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">We <b>watched</b> the documentary last night.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">باقاعده (e + d)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">travel</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">travel<b>led</b> / travel<b>ed</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>traveled</b> to Ahvaz last winter.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">بی‌قاعده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">go / see / take / come</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">went / saw / took / came</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She <b>went</b> home and <b>took</b> her book.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100">بی‌قاعده</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">be (am/is)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">was</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">The trip <b>was</b> long.</td></tr>
      </tbody></table></div>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-purple-700 text-white"><th class="px-3 py-2">ساختار</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">منفی با did</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>didn't watch</b> the news yesterday. (فعل برگشت به ساده!)</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">سؤال با did</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Did</b> you <b>see</b> the program? — Yes, I <b>did</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">نشانگرها</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">yesterday، last night/week، two years ago</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>پرتکرارترین تلهٔ نهم:</b> بعد از ${EN(
        "did/didn't"
      )} فعلِ اصلی «ساده» می‌ماند: ${EN(
        "Did you <b>see</b>…? (NOT: did you saw)"
      )} — گذشته فقط یک‌بار در جمله می‌آید، یا در فعل یا در did.</div>`,
  },
];

const synonyms = [
  SYN("kind", "friendly", "مهربان، دلسوز"),
  SYN("clever", "smart", "باهوش"),
  SYN("funny", "humorous", "بامزه"),
  SYN("brave", "bold", "شجاع"),
  SYN("trip", "journey", "سفر"),
  SYN("angry", "mad", "عصبانی"),
  SYN("happy", "glad", "خوشحال"),
  SYN("ill", "sick", "مریض"),
  SYN("famous", "well-known", "مشهور"),
  SYN("polite", "well-mannered", "مودب"),
  SYN("quiet", "silent", "ساکت"),
  SYN("usually", "normally", "معمولاً"),
];

const antonyms = [
  ANT("kind", "cruel", "مهربان ↔ بی‌رحم"),
  ANT("careful", "careless", "بادقت ↔ بی‌دقت"),
  ANT("generous", "selfish", "بخشنده ↔ خودخواه"),
  ANT("polite", "rude", "مودب ↔ بی‌ادب"),
  ANT("lazy", "hard-working", "تنبل ↔ سخت‌کوش"),
  ANT("quiet", "talkative", "ساکت ↔ پرحرف"),
  ANT("happy", "upset", "خوشحال ↔ ناراحت"),
  ANT("remember", "forget", "به یاد آوردن ↔ فراموش کردن"),
  ANT("brave", "nervous", "شجاع ↔ مضطرب"),
  ANT("always", "never", "همیشه ↔ هرگز"),
  ANT("best", "worst", "بهترین ↔ بدترین"),
  ANT("arrive", "leave", "رسیدن ↔ رفتن"),
];

const writing: WritingExercise[] = [
  { id: "l12-w1", fa: "او سربازِ شجاع و مهربانی بود.", answer: ["He", "was", "a", "brave", "and", "kind", "soldier"], hint: "صفت قبل از اسم؛ گذشتهٔ was" },
  { id: "l12-w2", fa: "مادربزرگ من صبور و مودب است.", answer: ["My", "grandma", "is", "patient", "and", "polite"], hint: "بعد از be صفت می‌آید" },
  { id: "l12-w3", fa: "الان برنامهٔ محبوبم را تماشا می‌کنم.", answer: ["I", "am", "watching", "my", "favorite", "program", "now"], hint: "now → حال استمراری" },
  { id: "l12-w4", fa: "او در این لحظه درس نمی‌خواند.", answer: ["He", "isn't", "studying", "at", "the", "moment"], hint: "منفی استمراری: isn't + V-ing" },
  { id: "l12-w5", fa: "دیشب مستند را دیدیم.", answer: ["We", "watched", "the", "documentary", "last", "night"], hint: "last night → گذشتهٔ ساده" },
  { id: "l12-w6", fa: "او پارسال به اهواز سفر کرد.", answer: ["He", "traveled", "to", "Ahvaz", "last", "year"], hint: "باقاعده: travel → traveled" },
  { id: "l12-w7", fa: "دیروز به اخبار گوش ندادی؟", answer: ["Didn't", "you", "listen", "to", "the", "news", "yesterday"], hint: "بعد از didn't فعل ساده می‌ماند" },
  { id: "l12-w8", fa: "بچه‌ها بی‌دقت نیستند؛ آن‌ها با دقت بازی می‌کنند.", answer: ["The", "kids", "aren't", "careless", "they", "play", "carefully"], hint: "صفت بعد از be؛ قیدِ حالت بعد از فعل" },
];

const quizzes = [
  // ---------------- واژگان (۱۵ تست) ----------------
  Q("l12-v1", "vocab", "A ---------------- person always shares his things with others.", ["generous", "selfish", "lazy", "rude"], 0, "آدمِ بخشنده همیشه چیزهایش را با دیگران قسمت می‌کند."),
  Q("l12-v2", "vocab", "The ---------------- soldier saved his friends in the dark night.", ["brave", "careless", "talkative", "upset"], 0, "سربازِ شجاع در شبِ تاریک دوستانش را نجات داد."),
  Q("l12-v3", "vocab", "Be ----------------! You can lose your way in this old city.", ["careful", "funny", "quiet", "kind"], 0, "مواظب باش! در این شهرِ قدیمی می‌توانی راهت را گم کنی."),
  Q("l12-v4", "vocab", "My little sister is very ----------------; she talks all the time.", ["talkative", "quiet", "patient", "serious"], 0, "خواهر کوچکم خیلی پرحرف است؛ همیشه حرف می‌زند."),
  Q("l12-v5", "vocab", "Don't be ---------------- with the animals; they feel pain too.", ["cruel", "polite", "helpful", "happy"], 0, "با حیوانات بی‌رحم نباش؛ آن‌ها هم درد را حس می‌کنند."),
  Q("l12-v6", "vocab", "Our ---------------- to Isfahan took five hours by bus.", ["trip", "channel", "injury", "environment"], 0, "سفر ما به اصفهان پنج ساعت با اتوبوس طول کشید."),
  Q("l12-v7", "vocab", "Every spring, Iranians ---------------- Nowruz with special foods and visits.", ["celebrate", "forget", "hurt", "watch"], 0, "هر بهار ایرانی‌ها نوروز را با غذاهای خاص و دیدارها جشن می‌گیرند."),
  Q("l12-v8", "vocab", "The wedding ---------------- was beautiful; all the relatives came.", ["ceremony", "kid", "member", "news"], 0, "مراسم عروسی زیبا بود؛ همهٔ فامیل آمدند."),
  Q("l12-v9", "vocab", "I read the morning ---------------- and watched TV before school.", ["news", "soldier", "medicine", "health"], 0, "اخبار صبح را خواندم و قبل از مدرسه تلویزیون دیدم."),
  Q("l12-v10", "vocab", "That TV ---------------- about wild animals starts at nine.", ["program", "personality", "service", "member"], 0, "آن برنامهٔ تلویزیونی دربارهٔ حیوانات وحشی ساعت نه شروع می‌شود."),
  Q("l12-v11", "vocab", "The ---------------- came fast and took the injured man to the hospital.", ["ambulance", "tourist", "environment", "channel"], 0, "آمبولانس سریع آمد و مردِ مصدوم را به بیمارستان برد."),
  Q("l12-v12", "vocab", "I have a bad ----------------; I can't read or study today.", ["headache", "festival", "channel", "trip"], 0, "سردردِ بدی دارم؛ امروز نمی‌توانم بخوانم یا درس بخوانم."),
  Q("l12-v13", "vocab", "Take this ---------------- twice a day and rest well.", ["medicine", "media", "member", "ceremony"], 0, "این دارو را روزی دو بار بخور و خوب استراحت کن."),
  Q("l12-v14", "vocab", "She broke her arm, but the ---------------- was not serious.", ["injury", "environment", "tourist", "program"], 0, "بازویش شکست اما جراحت جدی نبود."),
  Q("l12-v15", "vocab", "A ---------------- person never thinks only about himself.", ["kind", "selfish", "lazy", "nervous"], 0, "آدمِ مهربان هرگز فقط به خودش فکر نمی‌کند."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l12-k1", "vocab-konkuri", "He is very ----------------; he never gets angry, even in hard times.", ["patient", "careless", "selfish", "lazy"], 0, "او خیلی صبور است؛ حتی در سخت‌ها هرگز عصبانی نمی‌شود."),
  Q("l12-k2", "vocab-konkuri", "---------------- in our class likes the new English teacher.", ["Everybody", "Every", "All", "Much"], 0, "همهٔ کلاس ما معلم تازهٔ انگلیسی را دوست دارد."),
  Q("l12-k3", "vocab-konkuri", "The children kept their room ---------------- before the guests arrived.", ["neat", "broken", "upset", "hurt"], 0, "بچه‌ها قبل از رسیدن مهمان‌ها اتاقشان را مرتب نگه داشتند."),
  Q("l12-k4", "vocab-konkuri", "Smoking is harmful to your health and to the ----------------.", ["environment", "ceremony", "program", "member"], 0, "سیگار برای سلامتی تو و برای محیط‌زیست مضر است."),
  Q("l12-k5", "vocab-konkuri", "Millions of ---------------- visit Iran's old cities every year.", ["tourists", "soldiers", "medicines", "channels"], 0, "میلیون‌ها توریست هر سال از شهرهای قدیمی ایران دیدن می‌کنند."),
  Q("l12-k6", "vocab-konkuri", "He was ---------------- about the exam and couldn't sleep well.", ["nervous", "funny", "generous", "neat"], 0, "بابت امتحان مضطرب بود و نمی‌توانست خوب بخوابد."),
  Q("l12-k7", "vocab-konkuri", "She spoke in a ---------------- voice so the baby wouldn't wake up.", ["quiet", "loud", "brave", "careless"], 0, "با صدای آرامی حرف زد تا بچه بیدار نشود."),
  Q("l12-k8", "vocab-konkuri", "The ---------------- in this hospital work day and night for patients.", ["nurses", "festivals", "screens", "channels"], 0, "پرستارهای این بیمارستان شبانه‌روز برای بیمارها کار می‌کنند."),
  Q("l12-k9", "vocab-konkuri", "My uncle felt ---------------- of me when I won the school prize.", ["proud", "upset", "selfish", "sore"], 0, "دایی‌ام وقتی جایزهٔ مدرسه را بردم به من افتخار کرد."),
  Q("l12-k10", "vocab-konkuri", "Don't ---------------- your friends' names; write them in your notebook.", ["forget", "remember", "celebrate", "protect"], 0, "اسم دوست‌هایت را فراموش نکن؛ در دفترت بنویس‌شان."),
  // ---------------- گرامر (۱۵ تست) ----------------
  Q("l12-g1", "grammar", "My best friend ---------------- very kind and generous.", ["is", "are", "am", "be"], 0, "بهترین دوستم خیلی مهربان و بخشنده است.", "فاعل مفرد → is + صفت."),
  Q("l12-g2", "grammar", "The students of class two ---------------- hard-working.", ["are", "is", "was", "has"], 0, "دانش‌آموزانِ کلاس دو سخت‌کوش‌اند.", "فاعل جمع → are."),
  Q("l12-g3", "grammar", "Nasrin's brother is not serious; he is quite ----------------.", ["funny", "serious", "carefully", "care"], 0, "برادر نسرین جدی نیست؛ او بامزه است.", "بعد از be صفت می‌آید نه قید."),
  Q("l12-g4", "grammar", "We don't like ---------------- people who never help others.", ["selfish", "selfishly", "selfishness", "self"], 0, "ما آدم‌های خودخواهی را که هرگز کمک نمی‌کنند دوست نداریم.", "صفت قبل از اسم."),
  Q("l12-g5", "grammar", "Listen! The baby ---------------- in her bedroom.", ["is sleeping", "sleeps", "slept", "sleep"], 0, "گوش کن! بچه در اتاقش خواب است.", "بعد از Listen! حال استمراری."),
  Q("l12-g6", "grammar", "I can't talk now; I ---------------- my homework.", ["am doing", "do", "does", "did"], 0, "الان نمی‌توانم حرف بزنم؛ دارم تکالیفم را انجام می‌دهم.", "همین حالا → حال استمراری."),
  Q("l12-g7", "grammar", "The tourists ---------------- photos of the old building at the moment.", ["are taking", "take", "took", "takes"], 0, "توریست‌ها همین حالا از بنای قدیمی عکس می‌گیرند.", "at the moment → استمراری."),
  Q("l12-g8", "grammar", "He ---------------- the documentary last night and enjoyed it.", ["watched", "watches", "is watching", "watch"], 0, "دیشب مستند را دید و از آن لذت برد.", "last night → گذشتهٔ سادهٔ باقاعده."),
  Q("l12-g9", "grammar", "We ---------------- to Mashhad two years ago.", ["went", "go", "are going", "goes"], 0, "دو سال پیش به مشهد رفتیم.", "go → went (بی‌قاعده)؛ two years ago."),
  Q("l12-g10", "grammar", "---------------- you see the news yesterday evening?", ["Did", "Do", "Are", "Was"], 0, "دیروز عصر اخبار را دیدی؟", "سؤالِ گذشته با did + فعل ساده."),
  Q("l12-g11", "grammar", "She ---------------- answer the phone because she was in the bathroom.", ["didn't", "did", "doesn't", "isn't"], 0, "او گوشی را جواب نداد چون در حمام بود.", "منفیِ گذشته → didn't."),
  Q("l12-g12", "grammar", "My uncle came home late and ---------------- his favorite program.", ["missed", "miss", "misses", "missing"], 0, "دایی‌ام دیر آمد به خانه و برنامهٔ محبوبش را از دست داد.", "گذشتهٔ باقاعده: miss → missed."),
  Q("l12-g13", "grammar", "The kids ---------------- in the yard when it started to rain.", ["were playing", "played", "play", "are playing"], 0, "بچه‌ها در حیاط بازی می‌کردند که باران شروع شد.", "بعد از was/were، شکل استمراری می‌آید."),
  Q("l12-g14", "grammar", "A: Did you enjoy the trip? B: Yes, ----------------.", ["I did", "I do", "I was", "I enjoyed"], 0, "از سفر لذت بردی؟ بله.", "پاسخِ کوتاهِ گذشته → Yes, I did."),
  Q("l12-g15", "grammar", "Reza was upset because he ---------------- his wallet at the station.", ["lost", "loses", "is losing", "lose"], 0, "رضا ناراحت بود چون کیف پولش را در ترمینال گم کرد.", "lose → lost (بی‌قاعده)."),
];

export const lesson12: LessonData = {
  id: 12,
  titleEn: "People and Media",
  titleFa: "آدم‌ها و رسانه",
  tagline: "شخصیت، سفر، جشن‌ها و گذشتهٔ ساده",
  color: "purple",
  grade: "نهم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  antonyms,
  writing,
  quizzes,
};

export default lesson12;
