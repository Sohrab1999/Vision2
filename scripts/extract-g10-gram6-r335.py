# -*- coding: utf-8 -*-
# r335 — استخراجِ «تستهای "کنکوری" و "تألیف" گرامر و نگارش» جزوهٔ دهم (ص۱۰۱-۱۰۴، کلیدِ توضیح‌دار و ترجمهٔ چاپیِ ص۲۶۷-۲۷۱)
# به public/jozve/tests-g10.json — بانکِ ۳۱ (lesson 31): ۴۵ MCQ که هر آیتم ترجمهٔ چاپیِ «ترجمه:» خود جزوه را
# دارد (الگوی r330/r332/r334). کلید چاپی: ۴۵/۴۵ هم‌رأی با پیش‌پرکردنِ معناییِ مستقل — صفر واگرایی.
# داوری‌های رندر ۵-۳۰x (نقاطِ کلیدی):
# سربرگِ چاپی: «تستهای "کنکوری" و "تألیف" گرامر و نگارش "درس دوم - پایه دهم" "انواع صفت و کاربردهای آن" (پاسخنامه صفحه: ۲۶۷ - ۲۷۱)»
# برچسب‌های قرمز ۲۵تایی: لایه «تجرب/انساب/هی» = تحریفِ یِ پایانی — رندرِ ۲۰x حاکم: «تجربی/انسانی/هنر»؛
# خطِ تیرهٔ برچسب‌ها ناهماهنگِ چاپ: Q4 «۹۸ - نظام» فاصله‌دار vs Q2/Q7 «۹۸- نظام» چسبیده؛
# ترجمهٔ Q10 «ژاپنی» را نیاورده (لغزشِ چاپی) + «اخیرأ» با أ؛ Q11 «به نظرآسان» چسبیده؛
# Q12 «قبأل» با أ vs Q22 «قبلا» تمیز — ناهماهنگیِ خودِ چاپ؛
# Q14 «زیبای» (زیبایی می‌بود)؛ Q19 «زیبا» دوبار؛ Q20 «یک یک» تکرار + «بکنم ؟» — رندر ۲۰x: نخی/صورتی/دخترم تمیز
# (۵x «نچ/صورب/دخیم» می‌نمود!)؛ Q4/Q6/Q7 «بیشی» سه‌بار (رندر ۳۰x حرف‌به‌حرف)؛
# Q23 «داد زد و زد زیر خنده» دو زد؛ Q26 «پس» بدونِ ر؛ Q37 «داره» محاوره؛
# Q39/Q44 «نقطهٔ قرمز» پس از نقطهٔ سیاه؛ Q44 «سریعتی» لغزشِ چاپی؛ Q21 «پلاستیگی» با گ؛
# ارجاعِ کوتاهِ ۱۴ مدخل: «(رجوع به توضیحات تست شماره ۸)» — عددِ ۸ رندرِ ۱۲x حاکم (توضیحِ جم رساک در مدخلِ ۲!)؛
# نوارِ «اســم + جنس + مــلیت + رنــگ + ســن + اندازه + کیفیت» — تکِ «ملیت» (۳۰۰dpi دو بار دیده می‌شد = خطای خوانش).
# Idempotent: اجرای دوم NO-OP (مبنا = ۳۰ بانکِ r323-r334 / ۵۰۲ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

def D(n: int) -> str:
    return "-" * n

# —— ۴۵ MCQ (ص۱۰۱: Q1-14، ص۱۰۲: Q15-28، ص۱۰۳: Q29-42، ص۱۰۴: Q43-45) — (ساقه، گزینه‌ها، کلیدِ صفر-مبنا، ترجمهٔ چاپی)
ITEMS = [
    (f"The modern train appeared to be going as fast as, perhaps even faster than {D(14)}. (تجربی خارج ۹۸)",
     ["a car the fastest", "the fastest cars", "a car is the fastest", "fastest cars"], 1,
     "به نظر رسید که این قطار مدرن، به اندازه سریعترین ماشینها، سریع باشد شاید هم سریعتر!"),
    (f"The {D(19)} refrigerator that I have bought didn’t seem nice to my wife. (انسانی ۹۸- نظام قدیم)",
     ["old big stone green", "green old stone big", "stone green big old", "big old green stone"], 3,
     "به نظر نمی‌رسید یخچال سنگی سبز قدیمی بزرگی را که من خریده ام، مورد پسند همسرم باشد."),
    (f"I should say that I haven't seen {D(19)} man than Peter in my whole life so far. (تجربی ۹۸)",
     ["as generous as a", "a more generous", "the most generous", "the most generous of"], 1,
     "من باید بگم که تا به حال مردی را سخاوتمندتر از پیتر در تمام زندگیم ندیدم."),
    (f"The {D(17)} house at the end of the street is one they have been living in for over thirty years. (انسانی خارج ۹۸ - نظام قدیم)",
     ["wooden nice big German", "nice big wooden German", "big nice German wooden", "nice big German wooden"], 3,
     "خانه چوبی آلمانی بزرگ قشنگی که در انتهای خیابانه، خانه ای است که آنها بیشی از ۳۰ ساله که در آن زندگی میکنند."),
    (f"I am sorry to say so, but {D(17)} of all is that they have grown used to this pattern of behavior. (انسانی ۹۸)",
     ["things worst", "worse things", "the worst thing", "the worst of things"], 2,
     "متاسفم که این را میگم اما از همه بدتر (بدترین چیز) این است که آنها با این الگوی رفتاری بزرگ شده اند."),
    (f"The birthday gift I love most is actually a / an {D(18)} clock. (تجربی خارج ۹۸)",
     ["wonderful big old Italian wooden", "big old wonderful Italian wooden", "wonderful big old wooden Italian", "old wonderful big Italian wooden"], 0,
     "در واقع هدیه تولدی که من بیشی از همه دوست دارم، یک ساعت دیواری چوب ایتالیایی قدیمی بزرگ شگفت‌انگیزه."),
    (f"People began to understand how electricity works {D(17)} two centuries ago. (ریاضی ۹۸- نظام قدیم)",
     ["only more than a little", "more than a little only", "for more than only a little", "only a little more than"], 3,
     "مردم فقط کمی بیشی از دو قرن گذشته شروع کردن به فهمیدن اینکه نیروی برق چگونه کار می کند."),
    (f"Catherine explained the lesson to the class {D(22)} an experienced teacher. (انسانی خارج ۹۸)",
     ["as good as", "as well as", "the best of", "better than that"], 1,
     "کاترین درس را برای کلاس به خوبی یک معلم با تجربه توضیح داد."),
    (f"The newly employed girl is more efficient {D(20)} they have ever had. (کنکور زبان ۹۸)",
     ["than any other secretary", "any other secretary than", "secretary than any other", "any other than secretary"], 0,
     "دختر تازه استخدام شده، از هر منشی دیگری که آنها تا به حال دیده اند کارآمد تر (مؤثرتر) است."),
    (f"He has recently bought a {D(19)} car. (تجربی ۹۱)",
     ["white beautiful Japanese big", "beautiful white big Japanese", "beautiful big white Japanese", "Japanese big beautiful white"], 2,
     "او اخیرأ یک ماشین سفید بزرگ قشنگ خریده است."),
    (f"The exercise did not seem to be as easy {D(18)} I thought it would be. (تجربی ۹۹)",
     ["that", "than", "from", "as"], 3,
     "این تمرین، به آن اندازه ای که فکر می کردم، به نظرآسان نمی رسید."),
    (f"To me, this job is as difficult to do {D(20)} the one I already had. (هنر ۹۹)",
     ["as", "from", "like", "that"], 0,
     "برای من این شغل برای انجام دادن به اندازه شغلی که من قبأل داشتم، سخت است."),
    (f"Modern motorcycles are lighter, faster, {D(14)} than motorcycles of thirty years ago. (کنکور زبان ۹۹)",
     ["more efficient", "or as efficient", "and efficient", "and more efficient"], 3, None),
    (f"In the cupboard, there are some {D(22)} teacups used for special occasions. (ریاضی ۸۴)",
     ["small beautiful Egyptian", "beautiful small Egyptian", "small Egyptian beautiful", "Egyptian beautiful small"], 1,
     "در آن گنجه تعدادی فنجان چای مصری کوچک زیبای وجود دارد که برای موقعیت های خاص استفاده می شوند."),
    (f"That {D(19)} cupboard is very expensive. (کنکور زبان ۸۸)",
     ["brown Iranian big wood", "big Iranian brown wood", "big brown Iranian wood", "Iranian big brown wood"], 2,
     "آن کمد قهوه ای رنگ چوب بزرگ ایرانی خیلی گران قیمت است."),
    (f"Mary always likes to drive a / an {D(22)} car. (تجربی ۸۹)",
     ["little old red", "little red old", "red little old", "old little red"], 0,
     "ماری همیشه دوست داشته است که یک ماشین قدیمی کوچک قرمز رنگ را براند."),
    (f"At present, 10,000 meters is {D(19)} walking competition held in the Olympics. (تجربی خارج ۹۳)",
     ["largest", "the largest", "larger", "the larger"], 1,
     "در حال حاضر رقابت ده هزارمتری بزرگترین رقابت پیاده روی برگزار شده در بازی های المپیک است."),
    (f"My friend has a {D(22)} woolen rug on the floor in her bedroom. (انسانی ۹۳)",
     ["lovely long gray", "long lovely gray", "gray lovely long", "long gray lovely"], 0,
     "دوست من در کف اتاق خوابش یک قالیچه زیبای بلند قهوه ای پشمی دارد."),
    (f"Didn’t the women look lovely in that {D(22)} silk dress? (تجربی ۹۳)",
     ["beautiful long green", "long beautiful green", "green beautiful long", "long green beautiful"], 0,
     "آیا آن خانم در آن لباس بلند زیبای سبز رنگ ابریشمی زیبا به نظر نمی رسید؟"),
    (f"A: “Can I help you?”  B”: Yes, I am looking for a {D(22)} dress for my daughter.” (انسانی ۹۴)",
     ["small, pink, cotton", "small, cotton, pink", "pink, small, cotton", "cotton, small, pink"], 0,
     "الف: می توانم کمکتان بکنم ؟ ب: بله من دنبال یک یک لباس نخی صورتی کوچک برای دخترم می گردم."),
    (f"I really liked that {D(22)} ball my uncle gave me on my birthday. (هنر ۹۶)",
     ["blue big plastic beautiful", "beautiful big blue plastic", "beautiful plastic big blue", "big blue beautiful plastic"], 1,
     "من واقعا از آن توپ آبی زیبای بزرگ پلاستیگی که داییم در روز تولدم به من داد خوشم آمد."),
    (f"I have never forgotten the {D(16)} table at which we all used to eat our meals. (تجربی ۹۷)",
     ["beautiful brown large wooden", "large wooden beautiful brown", "beautiful large wooden brown", "beautiful large brown wooden"], 3,
     "من هرگز آن میز زیبای بزرگ قهوه ای رنگ چوب که قبلا بر روی آن غذا می خوردیم را فراموش نکرده ام."),
    (f"Jumping out from behind the bushes, Carlos shouted at his {D(10)} and laughed. (تجربی خارج ۹۹)",
     ["frightened sister", "sister frightened", "sister to be frightened", "frightening sister"], 0,
     "کارلوس هنگامی که از پشت بوته ها بیرون پرید بر سر خواهر ترسیده اش داد زد و زد زیر خنده."),
    (f"Because drawing was so closely related to communication, it was probably {D(18)} form to develop. (ریاضی ۱۴۰۰)",
     ["early", "earlier", "as early as", "the earliest"], 3,
     "چونکه طراحی ارتباط خیلی زیادی با ارتباط برقرار کردن دارد احتمالا اولین شکل (هنری) بوده است که توسعه پیدا کرده است."),
    (f"He isn’t {D(20)} some of my friends, but what he says is often more original than you normally hear. (انسانی ۱۴۰۰)",
     ["talkative", "more talkative", "as talkative as", "the most talkative"], 2,
     "او به اندازه تعدادی از دوستانم پرحرف نیست اما آنچه که می گوید غالبا اصیل تر از آنچه است که شما معمولا می شنوید."),
    (f"Mohsen is a very {D(18)} boy. He is {D(17)} as Ahmad now.",
     ["tall / taller", "the tallest / tall", "tall / as tall", "taller / as tall"], 2,
     "محسن یک پس خیلی قد بلند است. او الان هم قد احمد شده است."),
    (f"This bike is {D(18)} than yours. In my opinion it’s {D(18)} bike in the world.",
     ["more expensive / most expensive", "expensiver / expensivest", "more expensive / the most expensive", "expensiver / the most expensive"], 2,
     "این دوچرخه از دوچرخه تو گران قیمت تر است. به نظر من این دوچرخه گران قیمت ترین دوچرخه در دنیا است."),
    (f"She is going to buy a / an {D(19)} car tomorrow.",
     ["nice American long", "American long nice", "long nice American", "nice long American"], 3,
     "او قصد دارد فردا یک ماشین خوب دراز آمریکایی بخرد."),
    (f"Europe is not {D(21)} Asia. Actually, Asia is {D(17)} continent in the world.",
     ["as big as / biggest", "big / the biggest", "bigger than / the biggest", "the biggest / the biggest"], 2,
     "قاره اروپا از قاره آسیا بزرگی نیست. در حقیقت آسیا بزرگترین قاره در جهان است."),
    (f"Cheetahs are {D(19)} animals on the earth. They can go very quickly to hunt their prey.",
     ["the fastest", "the most fast", "fast", "as fast as"], 0,
     "یوزپلنگ ها سریعترین حیوانات بر روی کره زمین هستند. آنها می توانند خیلی سریع بروند و طعمه شان را شکار بکنند."),
    (f"She gave her {D(18)} watch to her daughter. It was her late grandmother’s present.",
     ["wonderful golden old", "old wonderful golden", "golden old wonderful", "wonderful old golden"], 3,
     "او ساعت قدیمی طلایی شگفت انگیزش را به دخترش داد. آن ساعت هدیه مادربزرگ مرحومش بود."),
    (f"In our class Jack has {D(19)} handwriting. It’s not readable.",
     ["the best", "the worst", "better", "worse"], 1,
     "در کلاس ما جک بدترین دستخط را دارد. (دستخط او) قابل خواندن نیست."),
    (f"Those {D(17)} men are going to come back their home next month.",
     ["tall young generous Italian", "generous tall young Italian", "young generous Italian tall", "generous young tall Italian"], 1,
     "آن مردان سخاوتمند قدبلند جوان ایتالیایی قصد دارند ماه بعد به خانه(کشور) خود بازگردند."),
    (f"A sportsperson is often {D(20)} than an ordinary person who doesn’t do a lot of exercise.",
     ["as healthy as", "the healthiest", "healthier", "very healthier"], 2,
     "یک ورزشکار غالبا از یک شخص معمولی که خیلی ورزش نمی کند سالم تر است."),
    (f"The summer of this year was {D(19)}. It was even {D(18)} the last summer.",
     ["hot / hotter than", "hot / the hottest", "the hottest / hot", "hot / the hotter than"], 0,
     "تابستان امسال خیلی گرم بود. حتی گرمتر از تابستان قبل بود."),
    (f"Domestic trips are {D(12)} international trips, so you don’t need much money to travel to Mashhad.",
     ["as cheap as", "cheaper than", "the cheapest", "more cheap than"], 1,
     "سفر های داخلی از سفرهای خارجی ارزان تر هستند. بنابراین تو برای سفر کردن به مشهد پول زیادی نیاز نداری."),
    (f"Nima is getting fatter and fatter. He has recently become {D(22)} student in the class.",
     ["the fattest", "fatter than", "as fat as", "fattest"], 0,
     "نیما داره چاق تر و چاق تر می شود. او به تازگی به چاق ترین دانش آموز کلاس تبدیل شده است."),
    (f"We can go Hamid’s home in two hours. It is not very {D(19)}from here.",
     ["as far as", "the farthest", "far", "farther than"], 2,
     "ما می توانیم در دو ساعت به خانه حمید برویم چونکه از اینجا خیلی دور نیست."),
    (f"Jupiter is {D(22)} planet of all. It means it’s {D(15)}every planet in the solar system.",
     ["the biggest / bigger than", "as big as / bigger than", "the biggest / as big as", "the biggest / big"], 0,
     "سیاره مشتری بزرگترین سیاره ها است. یعنی اینکه این سیاره از هر سیاره دیگری در منظومه شمسی بزرگتر است."),
    (f"There have been many {D(22)} diseases in the human’s history so far, but in my opinion Covid-19 has been {D(22)} one.",
     ["dangerous / as dangerous as", "the most dangerous / the most dangerous", "the most dangerous / more dangerous than", "dangerous / the most dangerous"], 3,
     "بیماری های خطرناک در طول تاریخ تا الان وجود داشته اند، اما به نظر من ویروس کرونا خطرناک ترین بوده است."),
    (f"I believe this problem is {D(22)} one of our lesson. It’s even {D(22)} than those the teacher asked.",
     ["the hardest / as difficult as", "harder than / the most difficult", "the hardest / more difficult", "as hard as / more difficult"], 2,
     "من معتقدم که این مسئله سخت ترین مسئله درس ما است. حتی از آن مسئله هایی که معلم پرسید هم سخت تر است."),
    (f"They stayed in a / an {D(22)} cottage.",
     ["old small nice wooden", "nice old wooden small", "wooden nice old small", "nice small old wooden"], 3,
     "آنها در یک کلبه زیبای کوچک قدیمی چوبی اقامت داشتند."),
    (f"She is very {D(23)}. She thinks she is {D(21)} person in the world.",
     ["selfish / the most important", "as selfish as / more important than", "the most selfish / the most important", "selfish / as important as"], 0,
     "او خیلی خودخواه است. او فکر می کند مهمترین آدم در دنیا است."),
    (f"This year, Sam is going to buy a {D(22)} horse.",
     ["sports big fast new", "new big sports fast", "fast new big sports", "fast big new sports"], 3,
     "سام امسال می خواهد یک اسب سریعتی بزرگ جدید ورزشی بخرد."),
    (f"Mohammad Ali was one of {D(14)} boxers. He was stronger {D(14)} most of his competitors.",
     ["powerfulest / than", "the most powerful / than", "powerfulest / as", "the most powerful / from"], 1,
     "محمد علی یکی از قدرمندترین بوکسورها بود. او از بیشتر رقیبانش قوی تر بود."),
]

PRINT_QUIRKS = [
    "سربرگِ چاپیِ ص۱۰۱: «تستهای \"کنکوری\" و \"تألیف\" گرامر و نگارش \"درس دوم - پایه دهم\" \"انواع صفت و کاربردهای آن\" (پاسخنامه صفحه: ۲۶۷ - ۲۷۱)» — عنوانِ «کنکوری/تألیف» قرمز و «انواع صفت» سبز در قابِ آبی (پنجمین سربرگِ رنگیِ سالم — برخلافِ «تسی یچ»های r318/r331/r333)",
    "برچسب‌های قرمزِ ۲۵تایی با ارقامِ فارسی: (تجربی خارج ۹۸)/(انسانی ۹۸- نظام قدیم)/(هنر ۹۹)/(ریاضی ۱۴۰۰)... — لایه «تجرب/انساب/هی/ریاض» = تحریفِ یِ پایانی؛ رندرِ ۲۰x حاکم: «تجربی/انسانی/هنر/ریاضی» (همان الگوی «ایتالیاب→ایتالیایی» لایه)؛ خطِ تیرهٔ برچسب‌ها ناهماهنگِ خودِ چاپ: Q4 «۹۸ - نظام» فاصله‌دار، Q2/Q7 «۹۸- نظام» چسبیده",
    "Q3 ساقه: «I haven't seen» با آپاستروفِ صاف — برخلافِ مابقیِ آزمون که ’ پیچیده دارد (didn’t/isn’t/grandmother’s) — عینِ چاپ",
    "Q20 دیالوگ: «B”:» گیومه پیش از دونقطه + پایانِ «daughter.”» — عینِ چاپ (الگوی r332-Q26)؛ بخشِ الف/ب با گپِ چاپی",
    "Q38 ساقه: «-------------------from here» خط‌چینِ چسبیده به from (بدون فاصله)؛ Q39 جای‌خالیِ دوم: «---------------every planet» چسبیده — عینِ چاپ",
    "Q13 گزینهٔ d: «and more  efficient» گپِ عریضِ چاپی میانِ more و efficient (~۲برابرِ فاصلهٔ عادی؛ لایه فاصلهٔ واحد داده بود) — گپِ رندرِ ۱۴x حاکم، متن با فاصلهٔ واحد ذخیره شد",
    "ترجمهٔ Q10: «او اخیرأ یک ماشین سفید بزرگ قشنگ خریده است.» — «ژاپنی» را نیاورده (لغزشِ چاپی — گزینهٔ صحیحِ c شامل Japanese است؛ لایه «اپت/ژ» نویزِ جابه‌جا بود) + «اخیرأ» با أ (کوئیرکِ أ/لا همین جزوه: فورأ/اصأل/کامأل/ناچارأ/مطمئنأ)",
    "Q11 ترجمه: «به نظرآسان نمی رسید» — «نظرآسان» چسبیده (بدون فاصله) — عینِ چاپ (الگوی r332-Q13 «جک،آرام»)",
    "Q12 ترجمه: «قبأل» با أ / Q22 ترجمه: «قبلا» با لاِ تمیز — ناهماهنگیِ خودِ چاپ در دو مدخلِ هم‌موضوع",
    "Q14 ترجمه: «فنجان چای مصری کوچک زیبای وجود دارد» — «زیبای» (باید زیبایی می‌بود) عینِ چاپ (رندرِ ۱۴x: یک یِ پایانی)",
    "Q19 ترجمه: «لباس بلند زیبای سبز رنگ ابریشمی زیبا» — «زیبا» دوبار (زیبای + زیبا) عینِ چاپ — رندرِ ۱۱x حاکم بر لایه",
    "Q20 ترجمه: «دنبال یک یک لباس نخی صورتی کوچک برای دخترم می گردم» — «یک یک» تکرارِ چاپی + «بکنم ؟» فاصله پیش از علامتِ سؤال؛ رندرِ ۵x «نچ/صورب/دخیم/یم» می‌نمود که ۲۰x رد شد — چاپ تمیز: نخی/صورتی/دخترم/می (درسِ r334: تارِ ۵x حاکم نیست)",
    "Q4/Q6/Q7 ترجمه: «بیشی» (باید بیش می‌بود) — سه‌بار؛ رندرِ ۳۰x حرف‌به‌حرف: ب+ی+ش+ی (چهار حرف با چهار نقطهٔ زیر) — تحریفِ چاپیِ «بیش»؛ «کمی» Q7 تمیز (لایه «کیم» جابه‌جا)",
    "Q23 ترجمه: «داد زد و زد زیر خنده» — دو «زد» (دومین متعلق به اصطلاحِ «زد زیر خنده») عینِ چاپ — رندرِ ۲۴x حاکم؛ لایه هم‌رأی",
    "Q24 ترجمه: «اولین شکل (هنری)» — پرانتزِ داخلِ ترجمه (رندرِ ۲۴x: رِ هنری حاکم — خوانشِ ۳۰۰dpi «هنی» خطا بود) + «احتمالا» با لاِ تمیز (لایه «احتماال» = تجزیهٔ لایگِچر)",
    "Q26 ترجمه: «محسن یک پس خیلی قد بلند است» — «پس» بدونِ ر (لغزشِ چاپیِ پسر — الگوی r330-Q3) + «الان» تمیز (لایه «االن» = تجزیهٔ لایگِچرِ لا)",
    "Q33 ترجمه: «به خانه(کشور) خود بازگردند» — پرانتزِ چسبیده؛ Q32: «(دستخط او)» پرانتزِ داخلِ ترجمه",
    "Q37 ترجمه محاوره: «داره» + «به تازگی» (لایه «تازگ» ی را حذف کرده بود — رندرِ ۱۱x)؛ Q21 «پلاستیگی» با گِ چاپی (پلاستیکی می‌بود) + «داییم» (دایی‌ام محاوره)",
    "Q39/Q44 پایانِ ترجمه: نقطهٔ سیاه + «نقطهٔ قرمز» + گیومه (رندرِ ۲۰x) — نخستین نقطه‌های قرمزِ پایان‌سطرِ ترجمه در این خانواده؛ Q44 «سریعتی» لغزشِ چاپیِ سریع عینِ چاپ (رندر ۱۱x)",
    "Q29 ترجمه: «بزرگی نیست» عینِ چاپ (کوتاهشدهٔ «به بزرگی… نیست»)؛ Q39 «بزرگتر است» — لایه «بزرگی» = حذفِ تر (رندرِ ۲۰x: ت+ر حاکم)",
    "مدخل‌های کوتاهِ ۱۴تایی (Q10/14-16/18-22/28/31/33/42/44): «\"ترتیب صفات\" (رجوع به توضیحات تست شماره ۸)» — عددِ ۸ رندرِ ۱۲x حاکم؛ توضیحِ جم رساک در مدخلِ ۲ است — ارجاعِ ناهماهنگِ خودِ چاپ، عینِ چاپ ذخیره شد",
    "نوارِ رمز در مدخل‌های ۲/۴/۶: «اســم + جنس + مــلیت + رنــگ + ســن + اندازه + کیفیت» (حروفِ کشیده) — تکِ «ملیت»؛ خوانشِ ۳۰۰dpiِ «دو ملیت» خطای من بود (درسِ رندرِ ۵x+)",
    "جعبهٔ Note خالیِ زرد در ص۱۰۴ (الگوی r330/r334) + کانالِ تلگرامِ @PracticalEnglishInKonkour در پابرگِ ص۱۰۴/۲۷۱",
]

RECEIPT = {
    "exam": "تستهای \"کنکوری\" و \"تألیف\" گرامر و نگارش — درس دوم: انواع صفت (ص۱۰۱-۱۰۴)",
    "header": "سربرگِ چاپیِ ص۱۰۱: «تستهای \"کنکوری\" و \"تألیف\" گرامر و نگارش \"درس دوم - پایه دهم\" \"انواع صفت و کاربردهای آن\" (پاسخنامه صفحه: ۲۶۷ - ۲۷۱)» — ۴۵ MCQ با ۲۵ برچسبِ قرمزِ کنکور",
    "keyPages": "267-271",
    "keyVerification": "print key pp267-271 «پاسخنامه تستهای کنکوری و تألیف گرامر: \"انواع صفت\" (سؤالات: صفحه ۱۰۱ تا ۱۰۴)» + 45 مدخلِ توضیح‌دار (گزینه + شیوهٔ حل + ترجمهٔ چاپی؛ ۱۴ مدخلِ کوتاهِ «ترتیب صفات» با ارجاع به تست ۸) — 45/45 agree with semantic pre-fill, zero divergence",
    "extractedRound": "r335",
    "pattern": "r332/r334 (کلیدِ توضیح‌دار + ترجمهٔ چاپی در هر آیتم) + r330 (روشِ گپِ لایه) + r333/r334 (رندرِ حاکم بر گزینه‌های چندکلمه‌ای — قانونِ همیشگی)",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))

existing = [l for l in data["lessons"] if l["lesson"] == 31]
if existing:
    print(f"lesson 31 already present ({existing[0]['count']} items) — NO-OP")
else:
    assert len(data["lessons"]) == 30, f"baseline mismatch: {len(data['lessons'])} banks"

    qs = []
    for i, (stem, opts, key, tr) in enumerate(ITEMS):
        q = {
            "id": f"g10-l31-{i + 1}", "n": i + 1, "category": "grammar",
            "question": stem, "options": opts, "answer": key,
        }
        if tr:
            q["translation"] = tr
        qs.append(q)
    bank = {
        "lesson": 31,
        "title": "کنکوری/تألیف — ۴۵ تست گرامر و نگارش درس دوم: انواع صفت (ص۱۰۱-۱۰۴)",
        "level": "کنکوری و تألیف — چهارگزینه‌ای", "count": len(qs), "questions": qs,
    }
    data["lessons"].append(bank)
    data["source"]["gram6"] = RECEIPT
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lesson 31: {bank['count']} items → banks={len(data['lessons'])}, total={total}")
