# -*- coding: utf-8 -*-
# r346 — استخراجِ «تست واژگان "درس چهارم - پایه دهم"» جزوهٔ دهم (ص۱۵۱-۱۵۲، کلید و ترجمهٔ چاپی ص۲۸۸-۲۸۹)
# به public/jozve/tests-g10.json — عینِ الگوی r339/r343 (MCQ با ترجمهٔ چاپیِ «ترجمه تست»):
#   بانک ۸۱: ۴۰ MCQ واژگانِ متوسط — کلید از گریدهای چاپیِ «N. گزینه (x) : ترجمه تست: "..."» (۲۶ گرید ص۲۸۸ + ۱۴ گرید ص۲۸۹)
# کلید: گریدهای چاپی d,b,c,a,c,a,b,d,b,a,c,d,a,b,b,c,a,d,a,c,b,b,d,b,d,a | b,a,c,c... (۴۰/۴۰ با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی)
# داوری‌های رندر (۹۰۰-۳۰۰۰dpi):
#   سربرگ آزمون: «تست واژگان "درس چهارم - پایه دهم"» سرخ + «سطح: "متوسط"» + «(پاسخنامه صفحه: ۲۸۸ - ۲۸۹)» ارقامِ فارسی با خط‌تیره
#   سربرگ کلید: «کلید و ترجمه تستهای واژگان "درس چهارم - پایه دهم"» + «(سؤالات: صفحه ۱۵۱ تا ۱۵۲)» ارقامِ فارسی با «تا» (لایه لاتین 151/152)
#   گرید: «N.» ارقام فارسی (لایه لاتین) + «گزینه» chip زرد + حرفِ سبزِ توپُر در پرانتز + «ترجمه تست:» chip سبز + کلیدواژهٔ سرخِ زیرخط‌دار + جداکنندهٔ خط‌چینِ بنفش
#   کشف‌های تجزیهٔ لایه: جلوئی→جلوی / سنت،،→سنت، اعتقاد، رسوم / بین ما شان→تفاوت های مابین شان / بیشی→بیشتر / رسگریم→سرگرمی (ن/م) / احی ام→احترام / داخیل→داخلی / مؤ جهی→موجهی / دالر→دلار / دالیل→دلیل / احتمایل→احتمال / آموزشگاهای→آموزشگاههای / مد نر→مدرن / سؤ االتی→سؤالاتی / بی ادب انه→بی ادبانه / مشکالت→مشکلات / تعطیالت→تعطیلات / بیر ن→بین / الملیل→المللی / مسئولنه→مسئولانه / معموالً→معمولاً / اصالً→اصلاً / ب ارزش→بی ارزش / ُدِیب→دُبی (ضمه) / نخت→تخت (دو نقطه در ۳۰۰۰dpi)
#   کوئیرک‌های ترجمه: «تابستانی اش»/«تنش های»/«فیلم ها»/«بچه ها»/«سرگرمی های»/«هله هوله»/«همسایه ام»/«مسئولانه تری» فاصله‌دار؛ «کرده اید.» فاصله‌دار (۳۰×)؛ «(زمین) کشاورزی.» و «(بی ارزش)» و «(داخلی) اش» و «(رؤیای من)» پرانتز؛ «کار "جین"» و «شهر "دُبی"» گیومهٔ درونی؛ گیومهٔ آغازینِ سرخِ گرید ۲۷؛ «می کند، در حقیقت» ویرگول (لایه نقطه)؛ «پرواز کند.» فاصله‌دار (لایه «پرواز.کند»)؛ نقطه‌های پایانیِ همهٔ گریدها داخل گیومه (لایه بی‌نقطه در ۱۱/۲۱/۳۵ تجزیه)
#   کوئیرک‌های ساقه: Q11 «11.The» چسبیده (فقط رسید — دیتا بدون شماره)؛ Q14 دو فاصله بعد کاما «films,  TV»؛ Q24 آپوستروفِ مستقیمِ «couldn't»؛ Q35/Q39 بدون نقطهٔ پایانی؛ Q40 «---- .» نقطهٔ فاصله‌دار؛ Q1 «summer vacations» جمع؛ Q19 «Corona Virus» کپیتال؛ Q22 «some of people»؛ Q7/Q38 دوسطری؛ Q40 «three month» بدون خط‌تیره
#   تیره‌شماری: ۴۰ ران = ۸۲۶ تیره — استاندارد ۲۳؛ استثناها: Q3=۲۰، Q4/Q5/Q8/Q38=۱۸، Q7=۷، Q15/Q20/Q23/Q31=۱۶، Q22=۲۲، Q25/Q33/Q40=۱۹، Q28=۱۳، Q37/Q39=۲۱
# Idempotent: اجرای دوم NO-OP (مبنا = ۸۰ بانکِ r323-r345 / ۱۰۲۲ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

def d(n: int) -> str:
    return "-" * n

# (ساقه، گزینه‌ها، کلیدِ حرفِ چاپیِ ص۲۸۸-۲۸۹، ترجمهٔ چاپی)
ITEMS = [
    (f"He {d(23)} to fly to America for his summer vacations on Wednesday.",
     ["compares", "leaves", "prepares", "plans"], "d",
     "او قصد دارد برای تعطیلات تابستانی اش در چهارشنبه به آمریکا پرواز کند."),
    (f"Egypt {d(23)} are one of the Seven Wonders of the World that are really amazing.",
     ["agents", "pyramids", "deserts", "cultures"], "b",
     "اهرام مصر یکی از هفت عجایب جهان هستند که خیلی حیرت آور هستند."),
    (f"The local people were very kind and {d(20)}, so we enjoyed their behavior so much.",
     ["amazing", "honest", "hospitable", "ancient"], "c",
     "افراد بومی خیلی مهربان و مهمان نواز بودند بنابراین ما از رفتارشان خیلی لذت بردیم."),
    (f"This area of the country is always dry with a lot of sand and no activity. It’s a {d(18)}.",
     ["desert", "paradise", "site", "beach"], "a",
     "این منطقه از کشور همیشه خشک است با ماسه زیاد و بدون هیچ گونه فعالیتی. آنجا بیابان است."),
    (f"In our {d(18)}, it is rude to ask someone some questions such as their earnings and age.",
     ["choice", "vacation", "culture", "nation"], "c",
     "در فرهنگ ما، پرسیدن از کسی سؤالاتی مانند درآمد و سن، بی ادبانه است."),
    (f"The attack on the embassy made a lot of {d(23)} tensions for some countries.",
     ["international", "national", "worldwide", "native"], "a",
     "حمله به سفارت، تنش های بین المللی زیادی برای چند کشور بوجود آورد."),
    (f"A person or group of people that represent another person or that takes action for other people is {d(7)} of that person or people.",
     ["tourist", "agent", "traveler", "host"], "b",
     "شخص یا گروهی از افراد که شخص دیگری را نمایندگی می کند یا برای افراد کار می کند نماینده آن شخص یا افراد است."),
    (f"A big home with a large front yard covered with grass near the sea is my idea of true {d(18)}.",
     ["desert", "abroad", "embassy", "paradise"], "d",
     "یک خانه بزرگ با حیاط جلوی بزرگ پوشیده از چمن نزدیک دریا، ایده من (رؤیای من) از بهشت واقعی است."),
    (f"They believed in their {d(23)}, belief, customs and way of doing something that has existed for a long time.",
     ["destination", "tradition", "suggestion", "entertainment"], "b",
     "آنها به سنت، اعتقاد، رسوم و راه شان از انجام چیزی که برای مدت زمان زیادی وجود داشته است، اعتقاد داشتند."),
    (f"You must make some important {d(23)} for your future. They are so necessary for your improvement.",
     ["choices", "suggestions", "traditions", "entertainments"], "a",
     "شما باید چند انتخاب مهم برای آینده تان داشته باشید. آنها برای پیشرفت شما خیلی ضروری هستند."),
    (f"The two products looked quite {d(23)} and I got confused.",
     ["different", "domestic", "similar", "suitable"], "c",
     "(آن) دو محصول خیلی شبیه به هم به نظر رسیدند و من گیج شدم."),
    (f"I think seaside is an ideal {d(23)} for a relaxing weekend.",
     ["range", "obligation", "possibility", "destination"], "d",
     "من فکر می کنم کنار دریا، یک مقصد ایده آل برای استراحت آخر هفته است."),
    (f"This old building will be replaced, most {d(23)} by a modern sports center.",
     ["probably", "patiently", "generously", "especially"], "a",
     "این ساختمان قدیمی به احتمال قوی با یک مرکز ورزشی مدرن، جایگزین خواهد شد."),
    (f"There will be live {d(23)} all day long such as films,  TV performances, etc. that are intended to amuse people.",
     ["choices", "entertainments", "suggestions", "traditions"], "b",
     "سرگرمی های زنده ای در تمام طول روز مانند فیلم ها - اجراهای تلویزیونی که قصد سرگرم کردن مردم دارند، وجود خواهد داشت."),
    (f"The {d(16)} will continue discussions with the Chinese government about that contract.",
     ["pilgrim", "embassy", "traveler", "nation"], "b",
     "سفارت، بحث هایش را با دولت چین در مورد آن قرارداد، ادامه خواهد داد."),
    (f"Unfortunately, his {d(23)} life wasn’t very happy and was full of problems.",
     ["cultural", "hospitable", "domestic", "agent"], "c",
     "متأسفانه زندگی درونی (داخلی) اش خیلی شاد نبود و پر از مشکلات بود."),
    (f"The committee rejected the {d(23)} that house should be built on this site.",
     ["suggestion", "agent", "choice", "tradition"], "a",
     "کمیته این پیشنهاد که خانه باید در این جا ساخته شود را رد کرد."),
    (f"These toys are suitable for children in the pre-school age {d(23)}.",
     ["vacation", "suggestion", "agent", "range"], "d",
     "این اسباب بازی ها برای بچه ها در محدوده سن پیش دبستانی مناسب هستند."),
    (f"Airlines have lost {d(23)} of dollars because of Corona Virus.",
     ["travels", "thousands", "passengers", "many"], "a",
     "خطوط هوایی میلیاردها دلار به خاطر ویروس کرونا از دست دادند."),
    (f"The child showed them a normal {d(16)} of development and a lot of people admired him.",
     ["element", "fact", "pattern", "means"], "c",
     "بچه الگوی طبیعی پیشرفت را به آنها نشان داد و افراد زیادی او را تحسین کردند."),
    (f"Strong family relationship still {d(23)} them together in all of the situations.",
     ["built", "linked", "defended", "compared"], "b",
     "روابط خانوادگی قوی، هنوز آنها را در همه وضعیت ها به هم متصل ساخته است."),
    (f"Takhteh-Jamshid in Shiraz is a major {d(22)} for some of people around the world.",
     ["tourist attention", "tourist attraction", "distance", "obligation"], "b",
     "تخت جمشید در شیراز یک جاذبه توریستی مهم برای بعضی از مردم در سراسر جهان است."),
    (f"I have the greatest {d(16)} for Jane’s work that is so valuable for society improvement.",
     ["belief", "honest", "background", "respect"], "d",
     "من برای کار \"جین\" که برای پیشرفت جامعه خیلی ارزشمند است، بیشترین احترام را قائل هستم."),
    ("We searched a lot but couldn't " + f"{d(23)} the source of radio signal.",
     ["relate", "locate", "check", "create"], "b",
     "ما زیاد جستجو کردیم اما نتوانستیم منبع امواج رادیویی را پیدا کنیم."),
    (f"My neighbor makes a trip for religious reasons to holy places. In fact, he is a {d(19)}.",
     ["traveler", "agent", "foreigner", "pilgrim"], "d",
     "همسایه ام به دلیل مذهبی به مکانهای مقدس مسافرت می کند، در حقیقت او یک زائر است."),
    (f"Education levels in English language institutes are strongly {d(23)} to each other.",
     ["related", "compared", "based", "prepared"], "a",
     "سطوح آموزشی در آموزشگاههای زبان خیلی به هم مرتبط هستند."),
    (f"Dubai depends highly on {d(23)} for much of its income.",
     ["embassy", "tourism", "vacation", "tradition"], "b",
     "شهر \"دُبی\" برای درآمد بیشترش به شدت به گردشگری وابسته است."),
    (f"The foreign {d(13)} complained that he’s been held by the local police without good reason.",
     ["traveler", "embassy", "host", "tourism"], "a",
     "مسافر خارجی شکایت کرد که او بدون هیچ دلیل موجهی توسط پلیس محلی، بازداشت شده است."),
    (f"Parents are under a legal {d(23)} to educate their children well.",
     ["creation", "possibility", "obligation", "culture"], "c",
     "والدین تحت اجبار قانونی برای آموزش دادن خوب به بچه ها هستند."),
    (f"There’s always a {d(23)} that he might go back to London.",
     ["possibility", "obligation", "vacation", "choice"], "a",
     "همیشه یک احتمال وجود دارد که او ممکن است به لندن برگردد."),
    (f"Much homework should not be used as a {d(16)} controlling children at home and school.",
     ["care of", "rather than", "means of", "in terms of"], "c",
     "تکالیف زیاد نباید به عنوان وسیله کنترل بچه ها در خانه و مدرسه به کار برده شود."),
    (f"If you {d(23)} things you compare them to show the differences between them.",
     ["base on", "count", "contrast", "prepare"], "c",
     "اگر شما چیزها را مقایسه کنید، آنها را برای نشان دادن تفاوت های مابین شان مقایسه کرده اید."),
    (f"Since the weather usually is dusty you should clean the windows {d(19)} once a week.",
     ["at most", "for a while", "so much", "at least"], "d",
     "از آنجایی که آب و هوا معمولاً گرد و غبار است، بهتر است پنجره ها را حداقل یکبار در هفته تمیز کنید."),
    (f"She was {d(23)} enough to overlook my little mistake.",
     ["patient", "generous", "honest", "rude"], "b",
     "او به اندازه کافی بخشنده است که اشتباه های کوچک من را نادیده بگیرد."),
    (f"I was so {d(23)} and warm in my bed. I didn’t want to get up at all",
     ["comfortable", "hospitable", "cultural", "neat"], "a",
     "من در رختخوابم خیلی راحت و گرم بودم. من نخواستم اصلاً بلند شوم."),
    (f"This area of the country is {d(23)} desert without any farming.",
     ["probably", "mostly", "nicely", "bravely"], "b",
     "این منطقه از کشور بیشتر بیابان است بدون هیچ گونه (زمین) کشاورزی."),
    (f"I had hoped you would behave in a more responsible {d(21)}.",
     ["manner", "blank", "choice", "activity"], "a",
     "من امیدوار بوده ام که شما با یک روش مسئولانه تری برخورد خواهید کرد."),
    (f"What does a coach do to {d(18)} his team for winning the match?",
     ["prepare", "ready", "compare", "create"], "a",
     "یک مربی برای آماده کردن تیمش برای بردن مسابقه چکار می کند؟"),
    ("We never eat " + f"{d(21)} food because it is a packaged food that has low value for health",
     ["delicious", "junk", "healthy", "cooked"], "b",
     "ما هرگز غذای هله هوله (بی ارزش) نمی خوریم زیرا غذایی بسته بندی شده است که ارزش کمی برای سلامتی دارد."),
    (f"She applied for a three month tourist {d(19)} .",
     ["visa", "ticket", "agent", "attraction"], "a",
     "او تقاضای ویزای تحصیلی سه ماهه کرد."),
]

# گریدِ چاپیِ ص۲۸۸-۲۸۹ (لایه + داوری رندر) — ۴۰ حرف
PRINT_GRID = "dbcacabdbacdabbcadacbbdbdabacaccdbabaaba"
PRINT_GRID = PRINT_GRID.replace(" ", "")
assert len(PRINT_GRID) == 40, len(PRINT_GRID)

RECEIPT = {
    "exam": "تست واژگان «درس چهارم - پایه دهم» — سطح متوسط (ص۱۵۱-۱۵۲)",
    "header": "سربرگِ آزمونِ ص۱۵۱ (رندرِ ۹۰۰dpi): «تست واژگان \'درس چهارم - پایه دهم\'» سرخ با گیومه + «سطح: \'متوسط\'» + «(پاسخنامه صفحه: ۲۸۸ - ۲۸۹)» با ارقامِ فارسی و خط‌تیره (لایه لاتین 288 - 289)؛ سربرگِ کلیدِ ص۲۸۸: «کلید و ترجمه تستهای واژگان \'درس چهارم - پایه دهم\'» سرخ + «(سؤالات: صفحه ۱۵۱ تا ۱۵۲)» با ارقامِ فارسی و واصفِ «تا» (لایه لاتین 151/152 — همان درسِ تکرارشدهٔ r344/r345)؛ سرصفحهٔ «جزوه جامع زبان انگلیسی، پایه دهم» / «Vision One» / «تألیف و گردآوری: \'جمال احمدی و همکاران\'»؛ گزینه‌ها با حرفِ کادردارِ فیروزه‌ایِ «a.» و زیرخطِ سبزِ خط‌چین در ساقه‌ها؛ قابِ سرخِ ناحیهٔ پایینِ ص۱۵۲؛ پاصفحه‌های ص۱۵۱/۱۵۲/۲۸۸/۲۸۹ بدونِ خطِ Telegram (ادامهٔ الگویِ درسِ چهارم r345)",
    "keyPages": "288-289",
    "extractedRound": "r346",
    "keyVerification": "چهل گریدِ چاپی «N. گزینه (x) : ترجمه تست: ‹...›» — ۲۶ گرید در ص۲۸۸ + ۱۴ گرید در ص۲۸۹؛ «N.» با ارقامِ فارسی (لایه لاتین)؛ «گزینه» با پس‌زمینهٔ زردِ کمرنگ و حرفِ گزینه سبزِ توپُر درونِ پرانتز؛ «ترجمه تست:» با پس‌زمینهٔ سبزِ کمرنگ؛ کلیدواژهٔ ترجمه سرخِ توپُرِ زیرخط‌دار (قصد دارد/فرهنگ/بین المللی/مقصد/انتخاب/فرهنگ/سنت/جاذبه توریستی/احترام/پیدا/زائر/مرتبط/گردشگری/مسافر/اجبار/احتمال/وسیله/مقایسه کنید/حداقل/راحت/بیشتر/روش/هله هوله (بی ارزش)/ویزای)؛ جداکنندهٔ خط‌چینِ بنفشِ زیرِ هر گرید؛ جعبهٔ «Note:» خالیِ خط‌چین در پایینِ ص۲۸۹ (الگوی r345)؛ ۴۰/۴۰ گرید با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی",
    "pattern": "r339/r343 — MCQ واژگانِ تک‌بانکی با ترجمهٔ چاپیِ «ترجمه تست» برای هر آیتم؛ بیست‌وپنجمین گروهِ کارتِ دهم",
    "printQuirks": [
        "تیره‌شماریِ لایه: ۴۰ ران = ۸۲۶ تیره — استاندارد ۲۳؛ استثناها: Q3=۲۰، Q4/Q5/Q8/Q38=۱۸، Q7=۷ (ساقهٔ دوسطری «is ------- of that person»)، Q15/Q20/Q23/Q31=۱۶، Q22=۲۲، Q25/Q33/Q40=۱۹، Q28=۱۳، Q37/Q39=۲۱ — همگی عینِ چاپ",
        "Q11 «11.The» بدونِ فاصله بعدِ شماره — عینِ چاپ (دیتا بدونِ شماره؛ ثبتِ رسیدی)",
        "Q14 دو فاصله بعدِ کاما «such as films,  TV performances» — عینِ چاپ (رندر ۹۰۰dpi)",
        "Q24 آپوستروفِ مستقیمِ «couldn't» در برابرِ ’ خمیدهٔ بقیه (Q16 wasn’t/Q23 Jane’s/Q30 There’s/Q35 didn’t) — عینِ چاپ",
        "Q35 و Q39 بدونِ نقطهٔ پایانی («...get up at all» / «...low value for health») — عینِ چاپ؛ Q40 «------------------- .» نقطهٔ فاصله‌دار — عینِ چاپ",
        "Q1 «summer vacations» جمع (برخلافِ دستور)؛ Q19 «Corona Virus» کپیتالِ هر دو؛ Q22 «for some of people» دستورِ چاپ؛ Q40 «three month» بدونِ خط‌تیره — همگی عینِ چاپ",
        "ترجمه‌ها فاصله‌محورِ چاپ: «تابستانی اش»/«تنش های»/«فیلم ها»/«بچه ها»/«سرگرمی های»/«هله هوله»/«همسایه ام»/«مسئولانه تری»/«حیرت آور»/«مهمان نواز»/«آینده تان»/«اسباب بازی ها»/«وضعیت ها»/«تفاوت های»/«اشتباه های»/«بسته بندی»/«پیش دبستانی»/«بحث هایش»/«پنجره ها»/«می کند» همگی فاصله‌دار؛ «کرده اید.» با فاصلهٔ کامل (داوریِ ۳۰×)",
        "پرانتزهای درون‌ترجمه: «(رؤیای من)» Q8، «(آن)» Q11، «(داخلی) اش» Q16، «(زمین) کشاورزی.» Q36، «(بی ارزش)» Q39 — عینِ چاپ",
        "گیومهٔ درونیِ ترجمه: Q23 «کار \"جین\"»؛ Q27 «شهر \"دُبی\"» با ضمهٔ چاپی (لایه «ُدِیب» = تجزیهٔ کسره/ضمه) — و گیومهٔ آغازینِ گریدِ ۲۷ سرخ (کوئیرکِ رنگِ چاپ)",
        "کشف‌های تجزیهٔ لایه (رندر حاکم): «جلوئی»→جلوی؛ «سنت،،»→سنت، اعتقاد، رسوم؛ «بین ما شان»→تفاوت های مابین شان؛ «بیشی»→بیشتر؛ «رسگریم»→سرگرمی (جابجاییِ ن/م)؛ «احی ام»→احترام؛ «داخیل»→داخلی؛ «مؤ جهی»→موجهی؛ «دالر/دالیل»→دلار/دلیل؛ «احتمایل»→احتمال؛ «آموزشگاهای»→آموزشگاههای؛ «مد نر»→مدرن؛ «سؤ االتی»→سؤالاتی؛ «بی ادب انه»→بی ادبانه؛ «مشکالت/تعطیالت»→مشکلات/تعطیلات؛ «بیر ن»→بین؛ «الملیل»→المللی؛ «مسئوالنه»→مسئولانه؛ «معموالً»→معمولاً؛ «اصالً»→اصلاً؛ «ب ارزش»→بی ارزش؛ «پرواز.کند»→پرواز کند.",
        "«می کند، در حقیقت» در Q25 ویرگولِ چاپ (لایه نقطه داده بود — رندر ۹۰۰dpi حاکم)؛ «آنجا» در Q4 چسبیده (لایه «آن جا»)؛ نقطه‌های پایانیِ همهٔ گریدها داخل گیومه (لایه بی‌نقطه در Q11/Q21/Q35 تجزیه)",
        "«تخت جمشید» Q22 — دو نقطهٔ چاپ در ۳۰۰۰dpi (شبههٔ «نخت» رد شد)؛ پاصفحهٔ ص۲۸۸ استاندارد («جزوه جامع زبان انگلیسی، پایه دهم» / Vision One / تألیف و گردآوری) بدونِ Telegram",
    ],
}


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    existing = [l for l in old["lessons"] if l["lesson"] >= 81]
    if existing:
        print(f"lessons 81+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
        if old["source"].get("vocab40l4") != RECEIPT:
            old["source"]["vocab40l4"] = RECEIPT
            PATH.write_text(json.dumps(old, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("source.vocab40l4 refreshed")
        return
    assert len(old["lessons"]) == 80, f"baseline mismatch: {len(old['lessons'])} banks"
    assert sum(l["count"] for l in old["lessons"]) == 1022, "baseline item count mismatch"

    qs = []
    for i, (stem, options, key_letter, translation) in enumerate(ITEMS):
        n = i + 1
        assert key_letter == PRINT_GRID[i], f"Q{n}: script key {key_letter!r} != print grid {PRINT_GRID[i]!r}"
        idx = "abcd".index(key_letter)
        # داوریِ معنایی: کلیدواژه باید در گزینه‌ها باشد و از لحاظِ معنایی هم‌رأی
        qs.append({
            "id": f"g10-l81-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
            "translation": translation,
        })

    # گاردِ تیره‌شماری: طولِ ران‌های ساقه‌ها عینِ لایه
    import re
    dash_lens = []
    for stem, *_ in ITEMS:
        m = re.search(r"-{2,}", stem)
        dash_lens.append(len(m.group(0)))
    expected = [23, 23, 20, 18, 18, 23, 7, 18, 23, 23, 23, 23, 23, 23, 16, 23, 23, 23, 23,
                16, 23, 22, 16, 23, 19, 23, 23, 13, 23, 23, 16, 23, 19, 23, 23, 23, 21, 18, 21, 19]
    assert dash_lens == expected, f"dash census mismatch: {dash_lens}"
    total_dashes = sum(dash_lens)
    assert total_dashes == 826, f"total dashes {total_dashes} != 826"

    bank = {
        "lesson": 81,
        "title": "متوسط — تست واژگان درس چهارم (ص۱۵۱-۱۵۲)",
        "level": "متوسط — چهارگزینه‌ای",
        "count": len(qs),
        "questions": qs,
    }
    data = json.loads(PATH.read_text(encoding="utf-8"))
    data["lessons"].append(bank)
    data["source"]["vocab40l4"] = RECEIPT

    # راستی‌آزماییِ نهایی: ۸۱ بانک / ۱۰۶۲ آیتم / id یگانه
    assert len(data["lessons"]) == 81
    total = sum(l["count"] for l in data["lessons"])
    assert total == 1062, f"total {total} != 1062"
    ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
    assert len(ids) == len(set(ids)) == 1062

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: bank 81 added — {total} items in {len(data['lessons'])} banks")
    print(f"  bank 81: {bank['title']} — {bank['count']}")


if __name__ == "__main__":
    main()
