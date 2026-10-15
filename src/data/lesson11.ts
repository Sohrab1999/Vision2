import type { LessonData, Reading, GrammarSection, WritingExercise } from "@/lib/study-types";
import { W, Q, SYN, ANT, EN } from "@/lib/study-types";

// =====================================================================
// Lesson Eleven: "My World"  |  دنیای من
// Prospect 2 (Grade 8) — جزوهٔ دکتر حسن لطفی، پایهٔ هشتم (راند ۱۹۸ — «قفسهٔ شش‌پایه»)
// Grade-wide booklet: nationalities, days & times, abilities & activities,
// health & advice, city & places, weather & farm.
// Grammar focus: nationality suffixes + be from، can/ability، there is/are + توصیه
// =====================================================================

const vocabulary = [
  W("country", "کشور", "n"),
  W("nationality", "ملیت", "n"),
  W("continent", "قاره", "n"),
  W("language", "زبان", "n"),
  W("Iranian", "ایرانی", "adj"),
  W("Chinese", "چینی", "adj"),
  W("Brazilian", "برزیلی", "adj"),
  W("Australian", "استرالیایی", "adj"),
  W("Spanish", "اسپانیایی", "adj"),
  W("British", "بریتانیایی", "adj"),
  W("Asian", "آسیایی", "adj"),
  W("European", "اروپایی", "adj"),
  W("originally", "در اصل، اصالتاً", "adv"),
  W("beautiful", "زیبا، قشنگ", "adj"),
  W("correct", "درست، صحیح", "adj"),
  W("speak", "صحبت کردن، زبان گفتن", "v"),
  W("live", "زندگی کردن، سکونت داشتن", "v"),
  W("love", "عشق داشتن، دوست داشتن", "v"),
  W("Monday", "دوشنبه", "n"),
  W("Tuesday", "سه‌شنبه", "n"),
  W("Wednesday", "چهارشنبه", "n"),
  W("Thursday", "پنج‌شنبه", "n"),
  W("Friday", "جمعه", "n"),
  W("Saturday", "شنبه", "n"),
  W("Sunday", "یکشنبه", "n"),
  W("morning", "صبح", "n"),
  W("afternoon", "بعدازظهر", "n"),
  W("evening", "عصر، غروب", "n"),
  W("night", "شب", "n"),
  W("noon", "ظهر، وسط روز", "n"),
  W("midnight", "نیمه‌شب", "n"),
  W("sunrise", "طلوع خورشید", "n"),
  W("sunset", "غروب خورشید", "n"),
  W("every", "هر، هروقت", "adj"),
  W("relax", "آرام گرفتن، استراحت کردن", "v"),
  W("visit", "دیدن کردن، ملاقات کردن", "v"),
  W("relative", "خویشاوند، فامیل", "n"),
  W("ability", "توانایی، قابلیت", "n"),
  W("cook", "آشپزی کردن؛ آشپز", "v"),
  W("search", "جست‌وجو کردن", "v"),
  W("help", "کمک کردن؛ کمک", "v"),
  W("advice", "توصیه، نصیحت", "n"),
  W("rest", "استراحت؛ باقی", "n"),
  W("flu", "آنفلوانزا", "n"),
  W("cold", "سرماخوردگی؛ سرد", "n"),
  W("cough", "سرفه؛ سرفه کردن", "n"),
  W("dentist", "دندان‌پزشک", "n"),
  W("city", "شهر", "n"),
  W("capital", "پایتخت؛ سرمایه", "n"),
  W("center", "مرکز", "n"),
  W("airport", "فرودگاه", "n"),
  W("bridge", "پل", "n"),
  W("building", "ساختمان", "n"),
  W("cinema", "سینما", "n"),
  W("downtown", "مرکز شهر", "n"),
  W("metro", "مترو، قطار شهری", "n"),
  W("famous", "مشهور، معروف", "adj"),
  W("clean", "تمیز؛ تمیز کردن", "adj"),
  W("east", "شرق", "n"),
  W("west", "غرب", "n"),
  W("cloudy", "ابری", "adj"),
  W("dry", "خشک", "adj"),
  W("farm", "مزرعه", "n"),
  W("field", "مزرعه، زمین (کشاورزی)", "n"),
  W("flower", "گل، شکوفه", "n"),
  W("hill", "تپه", "n"),
  W("cow", "گاو", "n"),
  W("hen", "مرغِ تخم‌گذار", "n"),
];

const conversation = {
  introEn: "Listen to the conversation between Nima and his cousin Tara about the weekend plans and their abilities.",
  introFa: "به مکالمهٔ نیما و دخترعمویش تارا دربارهٔ برنامهٔ آخرِ هفته و توانایی‌هایشان گوش دهید.",
  lines: [
    { speaker: "Tara", speakerFa: "تارا", en: "Hi Nima! What are you doing this weekend?", fa: "سلام نیما! آخر هفته چه‌کار می‌کنی؟" },
    { speaker: "Nima", speakerFa: "نیما", en: "On Friday morning, I usually relax at home. But not this week!", fa: "صبح جمعه معمولاً خانه استراحت می‌کنم. اما این هفته نه!" },
    { speaker: "Tara", speakerFa: "تارا", en: "Really? Why not?", fa: "واقعاً؟ چرا؟" },
    { speaker: "Nima", speakerFa: "نیما", en: "We are going to visit our relatives in Shiraz. Can you drive a car, Tara?", fa: "می‌خواهیم به دیدن فامیل در شیراز برویم. تو می‌توانی ماشین برانی، تارا؟" },
    { speaker: "Tara", speakerFa: "تارا", en: "No, I can't. But I can ride a bicycle very well.", fa: "نه، نمی‌توانم. اما خیلی خوب می‌توانم دوچرخه‌سواری کنم." },
    { speaker: "Nima", speakerFa: "نیما", en: "Great! Can you cook, too?", fa: "عالی است! آشپزی هم بلدی؟" },
    { speaker: "Tara", speakerFa: "تارا", en: "Yes, I can make a cake and cook rice. What about you?", fa: "بله، می‌توانم کیک درست کنم و برنج بپزم. تو چه؟" },
    { speaker: "Nima", speakerFa: "نیما", en: "I can play tennis and search the web, but I can't cook at all!", fa: "من می‌توانم تنیس بازی کنم و اینترنت را جست‌وجو کنم، اما اصلاً آشپزی بلد نیستم!" },
    { speaker: "Tara", speakerFa: "تارا", en: "Why don't you come with us next Thursday? There is a famous park in our city.", fa: "چرا پنجشنبهٔ بعد با ما نمی‌آیی؟ در شهر ما پارکِ معروفی هست." },
    { speaker: "Nima", speakerFa: "نیما", en: "That sounds great! Is there a metro station near the park?", fa: "چه عالی! نزدیک پارک ایستگاه مترو هست؟" },
    { speaker: "Tara", speakerFa: "تارا", en: "Yes, there is. It's in the city center, next to the big bridge.", fa: "بله هست. در مرکز شهر است، کنار پلِ بزرگ." },
    { speaker: "Nima", speakerFa: "نیما", en: "Perfect. See you on Thursday at nine in the morning!", fa: "عالی. پنجشنبه ساعت نه صبح می‌بینمت!" },
  ],
};

const readings: Reading[] = [
  {
    titleEn: "Flags and Friends",
    titleFa: "پرچم‌ها و دوست‌ها",
    source: "Prospect 2 — Booklet: Grade Eight",
    paragraphs: [
      { en: "My name is Behnam and I live in Tabriz, a beautiful city in the northwest of Iran. In our English class this year, we have a fun project: \"Friends of the World\". Every student writes to a pen friend in another country, and I write to a boy called Jack.", fa: "اسم من بهنام است و در تبریز، شهری زیبا در شمال‌غرب ایران، زندگی می‌کنم. امسال در کلاس انگلیسی‌مان پروژهٔ جالبی داریم: «دوست‌های جهان». هر دانش‌آموز به یک دوستِ قلمی در کشور دیگری نامه می‌نویسد و من به پسری به نام جک نامه می‌نویسم." },
      { en: "Jack is British and he lives in London, the capital of England. He speaks English and a little French. He is twelve years old, like me. Jack loves football and his favorite team is from Brazil. He says many Brazilian players are famous all over the world.", fa: "جک بریتانیایی است و در لندن، پایتخت انگلستان، زندگی می‌کند. او انگلیسی و کمی فرانسه صحبت می‌کند. او مثل من دوازده سالش است. جک عاشق فوتبال است و تیمِ محبوبش برزیلی است. می‌گوید بسیاری از بازیکنان برزیلی در سراسر جهان مشهورند." },
      { en: "In his letters, Jack tells me about his city. There is a big river in London and there are many old bridges over it. His school is in the city center, next to a famous museum. On Saturdays and Sundays, he rides his bicycle along the river with his sister.", fa: "جک در نامه‌هایش از شهرش برایم می‌گوید. در لندن رودخانهٔ بزرگی هست و پل‌های قدیمیِ زیادی روی آن. مدرسه‌اش در مرکز شهر است، کنار موزه‌ای مشهور. روزهای شنبه و یکشنبه با دوچرخه‌اش کنار رودخانه با خواهرش دوچرخه‌سواری می‌کند." },
      { en: "I answer his questions about Iran. I tell him that Persian is our language and that Iran is in Asia, a very big continent. Our country is famous for its kind people, its four seasons, and its delicious food. I also teach him two Persian words every week.", fa: "من به سؤال‌هایش دربارهٔ ایران جواب می‌دهم. به او می‌گویم زبان ما فارسی است و ایران در آسیا، قاره‌ای خیلی بزرگ، قرار دارد. کشور ما به مردم مهربانش، چهار فصلش و غذاهای خوشمزه‌اش مشهور است. هر هفته دو واژهٔ فارسی هم به او یاد می‌دهم." },
      { en: "Jack's birthday is in June and mine is in October. This year he sends me a small Australian flag, because his mother is Australian and she works with Australian companies. Now on my desk there are two flags: the flag of Iran and the flag of the UK. Friends of the world, like two flags on one desk!", fa: "تولد جک در ژوئن است و تولد من در اکتبر. امسال او یک پرچم کوچک استرالیایی برایم می‌فرستد، چون مادرش استرالیایی است و با شرکت‌های استرالیایی کار می‌کند. حالا روی میزم دو پرچم هست: پرچم ایران و پرچم بریتانیا. دوست‌های جهان، مثل دو پرچم روی یک میز!" },
    ],
  },
  {
    titleEn: "Grandma's Farm",
    titleFa: "مزرعهٔ مادربزرگ",
    source: "Prospect 2 — Booklet: Grade Eight",
    paragraphs: [
      { en: "Every summer, my family visits my grandma. Her farm is near a small village between two green hills. We travel there by bus; the trip takes three hours. I love the first minute when we arrive: the air is fresh and the sky is very blue.", fa: "هر تابستان خانواده‌ام به دیدن مادربزرگم می‌رود. مزرعه‌اش نزدیک روستایی کوچک، بین دو تپهٔ سبز، است. با اتوبوس به آن‌جا سفر می‌کنیم؛ سفر سه ساعت طول می‌کشد. من لحظهٔ اولِ رسیدن را دوست دارم: هوا تازه است و آسمان خیلی آبی." },
      { en: "Grandma's farm is big. There are six cows, ten hens, and two dogs on it. Every morning before sunrise, the hens make noise and wake everyone up! Grandma says, \"Get up, children! Come and help me.\" We give water to the cows and collect the eggs from the field.", fa: "مزرعهٔ مادربزرگ بزرگ است. شش گاو، ده مرغ و دو سگ در آن هست. هر صبح قبل از طلوع خورشید، مرغ‌ها سر و صدا می‌کنند و همه را بیدار می‌کنند! مادربزرگ می‌گوید: «بلند شوید بچه‌ها! بیایید به من کمک کنید.» به گاوها آب می‌دهیم و از مزرعه تخم‌مرغ‌ها را جمع می‌کنیم." },
      { en: "The weather on the farm is different from the city. In the city it is often cloudy and dry, but on the farm the mornings are cool and the afternoons are sunny. At noon we eat lunch under the big tree near the well, and at sunset we sit outside and watch the stars.", fa: "هوای مزرعه با شهر فرق دارد. در شهر هوا اغلب ابری و خشک است، اما در مزرعه صبح‌ها خنک و بعدازظهرها آفتابی است. ظهرها ناهار را زیر درختِ بزرگ کنار چاه می‌خوریم و غروب‌ها بیرون می‌نشینیم و ستاره‌ها را تماشا می‌کنیم." },
      { en: "One Wednesday, the weather changes. The sky becomes cloudy and it starts to rain. \"No problem,\" says grandma with a smile. \"Today we stay in the kitchen.\" She teaches us how to make bread and soup. The kitchen is warm and the food smells wonderful.", fa: "یک چهارشنبه هوا عوض می‌شود. آسمان ابری می‌شود و باران می‌بارد. مادربزرگ با لبخند می‌گوید: «اشکالی ندارد. امروز در آشپزخانه می‌مانیم.» به ما یاد می‌دهد چطور نان و سوپ درست کنیم. آشپزخانه گرم است و بوی غذا عالی است." },
      { en: "On Friday, our last day, we clean the farm, say goodbye to the animals, and pack our bags. Grandma gives us a basket of flowers and fresh eggs. On the bus home, my little brother sleeps, but I look at the hills and think: I can't wait for next summer!", fa: "جمعه، آخرین روز، مزرعه را تمیز می‌کنیم، با حیوانات خداحافظی می‌کنیم و چمدان‌ها را می‌بندیم. مادربزرگ سبدی از گل و تخم‌مرغِ تازه به ما می‌دهد. در اتوبوس، در راه خانه، برادر کوچکم می‌خوابد، اما من به تپه‌ها نگاه می‌کنم و فکر می‌کنم: دلم برای تابستانِ بعد نمی‌برد!" },
    ],
  },
];

const grammar: GrammarSection[] = [
  {
    title: "کشور، ملیت و زبان: پسوند‌های ملیت (Nationality Suffixes)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای گفتن ملیت، پسوندِ مخصوص به آخرِ نامِ کشور اضافه می‌شود؛ ساختارِ پرکاربرد ${EN(
        "be from + کشور"
      )} یا ${EN("شخصِ ملیتی")}' است:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-blue-700 text-white"><th class="px-3 py-2">کشور</th><th class="px-3 py-2">ملیت</th><th class="px-3 py-2">زبان</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Iran</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Iran<b>ian</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Persian</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>is from Iran</b>. He is <b>Iranian</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">China</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Chin<b>ese</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Chinese</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">My friend is <b>Chinese</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Brazil</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Brazil<b>ian</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Portuguese</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Brazilian players are famous.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">England / the UK</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">English / British</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">English</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She is <b>British</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Spain</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Span<b>ish</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Spanish</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Spanish food is delicious.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Australia</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Austral<b>ian</b></td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">English</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">His mother is Australian.</td></tr>
      </tbody></table></div>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm leading-7 text-blue-900 mb-3">💡 <b>نکتهٔ امتحانی:</b> اسمِ قاره‌ها و کشورها با حرفِ بزرگ شروع می‌شود و ملیت همیشه با حرفِ بزرگ نوشته می‌شود: ${EN(
        "Asia → Asian، Europe → European"
      )} — «ی» پایانیِ ${EN("Japanese, Chinese")} همیشه حفظ می‌شود (جمع نمی‌گیرد).</div>`,
  },
  {
    title: "توانایی با can و فعل‌های فعالیت (Ability & Activity Collocations)",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">فعل ${EN(
        "can"
      )} برای «توانستن» به کار می‌رود و بعد از آن، فعلِ اصلی به شکلِ ساده می‌آید — بدونِ تغییر و بدونِ s:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-blue-700 text-white"><th class="px-3 py-2">ساختار</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">مثبت: can + V(simple)</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">She <b>can ride</b> a bicycle. / I <b>can play</b> tennis.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">منفی: can't (cannot) + V</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">He <b>can't cook</b> at all.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">سؤال: Can + فاعل + V؟</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Can</b> you <b>drive</b>? — Yes, I can.</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">ترکیبِ فعل با فعالیت‌ها را حفظ کن — هر فعالیت با فعلِ خودش می‌آید:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-blue-700 text-white"><th class="px-3 py-2">فعل</th><th class="px-3 py-2">ترکیب‌ها</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">play</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">play football / tennis / basketball — بازی با توپ</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">go</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">go shopping / go to school — حرکت و مکان</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">do</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">do a puzzle / do homework — فعالیت عمومی</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">make</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">make a cake / make dinner — ساختنِ چیزی</td></tr>
      </tbody></table></div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm leading-7 text-amber-900">💡 <b>نکتهٔ امتحانی:</b> بعد از can هرگز s نمی‌آید: ${EN(
        "She can <b>ride</b> (NOT: she can rides)"
      )} — و can همیشه شکلِ یکسان دارد (فعلِ کمکی است، نه فعلِ اصلی).</div>`,
  },
  {
    title: "هست/هستند + توصیه: there is / there are و Why don't you…?",
    html: `
      <p class="text-[15px] leading-8 text-slate-700 mb-3">${EN(
        "there is / there are"
      )} «وجود داشتن» را نشان می‌دهد: برای مفرد ${EN("there is")} و برای جمع ${EN("there are")}:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-blue-700 text-white"><th class="px-3 py-2">ساختار</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">there is + مفرد</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>There is</b> a metro station near the park.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">there are + جمع</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>There are</b> six cows on the farm.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">سؤال</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Is there</b> a bridge here? — Yes, there is.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">منفی</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>There aren't</b> any banks in this street.</td></tr>
      </tbody></table></div>
      <p class="text-[15px] leading-8 text-slate-700 mb-3">برای پیشنهاد و توصیهٔ دوستانه از ${EN(
        "Why don't you…?"
      )} و ${EN("You should…")} استفاده می‌کنیم:</p>
      <div class="overflow-x-auto"><table class="w-full text-sm mb-3 border border-stone-200 rounded-lg overflow-hidden"><thead><tr class="bg-blue-700 text-white"><th class="px-3 py-2">ساختار</th><th class="px-3 py-2">مثال</th></tr></thead><tbody>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">Why don't you + V?</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>Why don't you come</b> with us next Thursday?</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">You should + V</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr">You have a cold. <b>You should rest</b>.</td></tr>
      <tr class="odd:bg-stone-50"><td class="px-3 py-2 border-t border-stone-100" dir="ltr">پاسخ پذیرش</td><td class="px-3 py-2 border-t border-stone-100" dir="ltr"><b>That sounds great!</b> / All right.</td></tr>
      </tbody></table></div>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm leading-7 text-blue-900">💡 <b>هشدار:</b> بعد از ${EN(
        "Why don't you"
      )} و ${EN("should")} فعل ساده می‌آید: ${EN(
        "Why don't you <b>come</b>? / You should <b>rest</b> (NOT: comes / to rest)"
      )}</div>`,
  },
];

const synonyms = [
  SYN("famous", "well-known", "مشهور، معروف"),
  SYN("beautiful", "pretty", "زیبا"),
  SYN("help", "assist", "کمک کردن"),
  SYN("speak", "talk", "صحبت کردن"),
  SYN("relax", "rest", "استراحت کردن"),
  SYN("big", "large", "بزرگ"),
  SYN("correct", "right", "درست"),
  SYN("visit", "see", "دیدن کردن"),
  SYN("smart", "clever", "باهوش"),
  SYN("ill", "sick", "مریض"),
  SYN("cold", "chilly", "سرد"),
  SYN("city", "town", "شهر، شهرک"),
];

const antonyms = [
  ANT("east", "west", "شرق ↔ غرب"),
  ANT("morning", "evening", "صبح ↔ عصر"),
  ANT("sunrise", "sunset", "طلوع ↔ غروب"),
  ANT("dry", "wet", "خشک ↔ مرطوب"),
  ANT("clean", "dirty", "تمیز ↔ کثیف"),
  ANT("city", "village", "شهر ↔ روستا"),
  ANT("every day", "never", "هر روز ↔ هرگز"),
  ANT("hot", "cold", "گرم ↔ سرد"),
  ANT("come", "go", "آمدن ↔ رفتن"),
  ANT("correct", "wrong", "درست ↔ غلط"),
  ANT("noon", "midnight", "ظهر ↔ نیمه‌شب"),
  ANT("happy", "upset", "خوشحال ↔ ناراحت"),
];

const writing: WritingExercise[] = [
  { id: "l11-w1", fa: "من از ایران هستم و فارسی صحبت می‌کنم.", answer: ["I", "am", "from", "Iran", "and", "I", "speak", "Persian"], hint: "be from + کشور" },
  { id: "l11-w2", fa: "دوست من برزیلی است و فوتبال بازی می‌کند.", answer: ["My", "friend", "is", "Brazilian", "and", "plays", "football"], hint: "ملیت با حرف بزرگ" },
  { id: "l11-w3", fa: "تو می‌توانی دوچرخه‌سواری کنی؟", answer: ["Can", "you", "ride", "a", "bicycle"], hint: "سؤالِ can به اول جمله می‌آید" },
  { id: "l11-w4", fa: "او نمی‌تواند اصلاً آشپزی کند.", answer: ["He", "can't", "cook", "at", "all"], hint: "منفیِ can = can't" },
  { id: "l11-w5", fa: "نزدیک پارک یک ایستگاه مترو هست.", answer: ["There", "is", "a", "metro", "station", "near", "the", "park"], hint: "مفرد → there is" },
  { id: "l11-w6", fa: "در مزرعه شش گاو هست.", answer: ["There", "are", "six", "cows", "on", "the", "farm"], hint: "جمع → there are" },
  { id: "l11-w7", fa: "چرا پنجشنبه با ما نمی‌آیی؟", answer: ["Why", "don't", "you", "come", "with", "us", "on", "Thursday"], hint: "پیشنهاد: Why don't you + فعل ساده" },
  { id: "l11-w8", fa: "سرفه‌ات بد است؛ تو باید استراحت کنی.", answer: ["Your", "cough", "is", "bad", "you", "should", "rest"], hint: "توصیه: should + فعل ساده" },
];

const quizzes = [
  // ---------------- واژگان (۱۵ تست) ----------------
  Q("l11-v1", "vocab", "Iran, China, and Brazil are the names of some ----------------.", ["countries", "languages", "cities", "days"], 0, "ایران، چین و برزیل نام چند کشورند."),
  Q("l11-v2", "vocab", "Asia is the biggest ---------------- in the world.", ["continent", "country", "city", "bridge"], 0, "آسیا بزرگ‌ترین قارهٔ دنیاست."),
  Q("l11-v3", "vocab", "Persian is the official ---------------- of Iran.", ["language", "nationality", "continent", "capital"], 0, "فارسی زبانِ رسمی ایران است."),
  Q("l11-v4", "vocab", "Tehran is the ---------------- of Iran.", ["capital", "airport", "cinema", "field"], 0, "تهران پایتخت ایران است."),
  Q("l11-v5", "vocab", "We don't go to school on ----------------; it is the weekend.", ["Thursday", "Saturday", "Monday", "Tuesday"], 0, "پنج‌شنبه به مدرسه نمی‌رویم؛ آخرِ هفته است."),
  Q("l11-v6", "vocab", "The sun rises in the ---------------- and sets in the evening.", ["morning", "afternoon", "midnight", "night"], 0, "خورشید صبح طلوع می‌کند و عصر غروب می‌کند."),
  Q("l11-v7", "vocab", "We usually ---------------- our relatives on Friday afternoons.", ["visit", "search", "cook", "climb"], 0, "معمولاً بعدازظهرهای جمعه به دیدن فامیل می‌رویم."),
  Q("l11-v8", "vocab", "Playing chess is a good ---------------- for your brain.", ["ability", "advice", "flu", "rest"], 0, "شطرنج بازی کردن تواناییِ خوبی برای مغز توست."),
  Q("l11-v9", "vocab", "You have a high fever and a bad ----------------; see the doctor.", ["cough", "flower", "bridge", "metro"], 0, "تب بالایی و سرفهٔ بدی داری؛ به پزشک مراجعه کن."),
  Q("l11-v10", "vocab", "Take a good ---------------- and drink warm tea; you will feel better.", ["rest", "dentist", "capital", "cow"], 0, "استراحت خوبی کن و چای گرم بنوش؛ حالت بهتر می‌شود."),
  Q("l11-v11", "vocab", "There is a new shopping ---------------- in the center of our city.", ["center", "hill", "field", "cow"], 0, "یک مرکز خرید جدید در مرکز شهر ما هست."),
  Q("l11-v12", "vocab", "The airplane lands at the ---------------- after a two-hour flight.", ["airport", "cinema", "bridge", "farm"], 0, "هواپیما بعد از دو ساعت پرواز در فرودگاه به زمین می‌نشیند."),
  Q("l11-v13", "vocab", "Today the sky is ----------------; the sun is behind the clouds.", ["cloudy", "sunny", "famous", "correct"], 0, "امروز آسمان ابری است؛ خورشید پشت ابرهاست."),
  Q("l11-v14", "vocab", "Farmers keep ---------------- for milk and ---------------- for eggs.", ["cows / hens", "hens / cows", "cows / bridges", "hens / airports"], 0, "کشاورزها گاو برای شیر و مرغ برای تخم‌مرغ نگه می‌دارند."),
  Q("l11-v15", "vocab", "Our village is between two green ----------------.", ["hills", "airports", "cities", "cinemas"], 0, "روستای ما بین دو تپهٔ سبز است."),
  // ---------------- واژگان کنکوری (۱۰ تست) ----------------
  Q("l11-k1", "vocab-konkuri", "My pen friend is ----------------; she was born in Canberra.", ["Australian", "Brazilian", "Spanish", "British"], 0, "دوستِ قلمی من استرالیایی است؛ در کانبرا به دنیا آمده است."),
  Q("l11-k2", "vocab-konkuri", "He speaks English and a little ---------------- because his father works in Madrid.", ["Spanish", "Persian", "Chinese", "Australian"], 0, "او انگلیسی و کمی اسپانیایی صحبت می‌کند چون پدرش در مادرید کار می‌کند."),
  Q("l11-k3", "vocab-konkuri", "---------------- people love drinking tea in the afternoon.", ["British", "Brazil", "Spain", "China"], 0, "مردم بریتانیا عاشق نوشیدن چای در بعدازظهرند."),
  Q("l11-k4", "vocab-konkuri", "We are ---------------- for ten days, so please water the flowers.", ["away", "beautiful", "cloudy", "famous"], 0, "ده روز بیرون می‌رویم، پس لطفاً به گل‌ها آب بده."),
  Q("l11-k5", "vocab-konkuri", "The doctor gave me a good piece of ----------------: rest and drink water.", ["advice", "ability", "flu", "dentist"], 0, "پزشک توصیهٔ خوبی به من داد: استراحت کن و آب بنوش."),
  Q("l11-k6", "vocab-konkuri", "The ---------------- told me to brush my teeth twice a day.", ["dentist", "farmer", "driver", "player"], 0, "دندان‌پزشک گفت روزی دو بار مسواک بزنم."),
  Q("l11-k7", "vocab-konkuri", "Many tourists cross the old ---------------- to take photos of the river.", ["bridge", "cough", "field", "hen"], 0, "بسیاری از توریست‌ها از پل قدیمی می‌گذرند تا از رودخانه عکس بگیرند."),
  Q("l11-k8", "vocab-konkuri", "You can ---------------- the web to find the answer to this question.", ["search", "visit", "wake", "ride"], 0, "می‌توانی برای پیدا کردن جواب این سؤال اینترنت را جست‌وجو کنی."),
  Q("l11-k9", "vocab-konkuri", "The weather is hot and ---------------- in the desert; nothing grows there.", ["dry", "wet", "clean", "cloudy"], 0, "هوا در بیابان گرم و خشک است؛ هیچ‌چیز آن‌جا نمی‌روید."),
  Q("l11-k10", "vocab-konkuri", "The boys ---------------- a mountain in the north of Iran every summer.", ["climb", "cook", "collect", "drink"], 0, "پسرها هر تابستان کوهی در شمال ایران را می‌پیمایند."),
  // ---------------- گرامر (۱۵ تست) ----------------
  Q("l11-g1", "grammar", "My friend ---------------- from China; he speaks Chinese.", ["is", "are", "am", "be"], 0, "دوست من اهل چین است؛ چینی صحبت می‌کند.", "be from + کشور؛ فاعل مفرد → is."),
  Q("l11-g2", "grammar", "Paris is the capital of France and ---------------- people speak French.", ["French", "France", "Spain", "Iranian"], 0, "پاریس پایتخت فرانسه است و مردمش فرانسه‌ای صحبت می‌کنند.", "ملیتِ مردم فرانسه = French."),
  Q("l11-g3", "grammar", "A: What's her ----------------? B: She is Spanish.", ["nationality", "country", "language", "continent"], 0, "ملیت او چیست؟ او اسپانیایی است.", "ملیت → nationality."),
  Q("l11-g4", "grammar", "Jack is British, but his mother is ----------------; she was born in Sydney.", ["Australian", "Australia", "Brazilian", "Australians"], 0, "جک بریتانیایی است، اما مادرش استرالیایی است؛ در سیدنی به دنیا آمده.", "صفتِ ملیت → Australian."),
  Q("l11-g5", "grammar", "Tara can ---------------- a bicycle very well.", ["ride", "rides", "riding", "to ride"], 0, "تارا خیلی خوب می‌تواند دوچرخه‌سواری کند.", "بعد از can فعل ساده می‌آید."),
  Q("l11-g6", "grammar", "I can play ---------------- but I can't play ----------------.", ["tennis / the piano", "the tennis / piano", "tennis / piano", "a tennis / the piano"], 0, "می‌توانم تنیس بازی کنم اما پیانو نمی‌توانم بزنم.", "ورزش بدون the؛ سازه با the می‌آید."),
  Q("l11-g7", "grammar", "---------------- you help me with this puzzle, please?", ["Can", "Are", "Do", "Is"], 0, "می‌توانی لطفاً در این پازل کمکم کنی؟", "درخواست با Can."),
  Q("l11-g8", "grammar", "My brother can't cook at all, but he ---------------- make a good salad.", ["can", "can't", "does", "is"], 0, "برادرم اصلاً آشپزی بلد نیست، اما سالادِ خوبی می‌تواند درست کند.", "تضاد but + can مثبت."),
  Q("l11-g9", "grammar", "---------------- there a cinema in your neighborhood?", ["Is", "Are", "Does", "Do"], 0, "در محلهٔ شما سینما هست؟", "مفرد → Is there."),
  Q("l11-g10", "grammar", "There ---------------- six cows and ten hens on our farm.", ["are", "is", "have", "has"], 0, "شش گاو و ده مرغ در مزرعهٔ ما هست.", "جمع → there are."),
  Q("l11-g11", "grammar", "---------------- don't you come with us next Thursday?", ["Why", "What", "Where", "When"], 0, "چرا پنجشنبهٔ بعد با ما نمی‌آیی؟", "پیشنهاد دوستانه: Why don't you…?"),
  Q("l11-g12", "grammar", "You have the flu. You ---------------- stay at home and rest.", ["should", "can't", "don't", "aren't"], 0, "آنفلوانزا داری. باید خانه بمانی و استراحت کنی.", "توصیه → should."),
  Q("l11-g13", "grammar", "A: Can you swim? B: Yes, ----------------.", ["I can", "I do", "I am", "I can't"], 0, "می‌توانی شنا کنی؟ بله.", "پاسخِ کوتاهِ can → Yes, I can."),
  Q("l11-g14", "grammar", "There is ---------------- old bridge over the river in my city.", ["an", "a", "the", "some"], 0, "پلِ قدیمی‌ای روی رودخانه در شهر ما هست.", "قبل از صدادار (old) → an."),
  Q("l11-g15", "grammar", "We usually relax ---------------- home ---------------- the weekend.", ["at / at", "in / at", "at / in", "on / in"], 0, "معمولاً آخر هفته خانه استراحت می‌کنیم.", "at home + at the weekend."),
];

export const lesson11: LessonData = {
  id: 11,
  titleEn: "My World",
  titleFa: "دنیای من",
  tagline: "ملیت‌ها، روزهای هفته، توانایی‌ها با can و توصیه",
  color: "blue",
  grade: "هشتم",
  vocabulary,
  conversation,
  readings,
  grammar,
  synonyms,
  antonyms,
  writing,
  quizzes,
};

export default lesson11;
