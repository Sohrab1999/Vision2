# -*- coding: utf-8 -*-
# r334 — استخراجِ «۲۰ تست دستگریمی گرامر و نگارش» جزوهٔ دهم (ص۹۹-۱۰۰، کلیدِ توضیح‌دار و ترجمهٔ چاپیِ ص۲۶۵-۲۶۶)
# به public/jozve/tests-g10.json — بانکِ ۳۰ (lesson 30): ۲۰ MCQ که هر آیتم ترجمهٔ چاپیِ «ترجمه تست» خود جزوه را
# دارد (الگوی r330/r332). کلید چاپی: 20/20 هم‌رأی با پیش‌پرکردنِ معناییِ مستقل — صفر واگرایی.
# داوری‌های رندر ۵-۲۲x (نقاطِ کلیدی):
# سربرگِ آزمون عنوانِ چاپی ندارد؛ فقط «سطح تستها: "صرفاً آموزشی" ، "ساده" (پاسخنامه صفحه: ۲۶۵-۲۶۶)»
# (لایه «رصفأ» = scramblingِ «صرفاً»، «آموزیس» = «آموزشی»)؛ عنوانِ فهرستِ ص۷۵: «۲۰ تست دستگریمی گرامر و نگارش»
# (چاپ «دستگریمی» با یِ اضافه — تحریفِ چاپیِ «دستگرمی»)؛
# Q2 ساقه: «I expected is to be» (لغزشِ چاپی — عینِ چاپ)؛
# Q12 گزینه‌ها در لایه سالم، کلیدِ (a) با رندرِ ص۲۶۶ حاکم شد (لایه «b» شناور نویز)؛
# Q13 گزینهٔ c در لایه با d یکسان شده بود — رندر: c) nice black small metal؛
# Q14 گزینهٔ a در لایه جابه‌جا — چاپ: a) beautiful wooden old؛
# کلیدهای بالانویس: Q8/Q14 «زندگی»، Q9 «قرمز/سیاه»، Q15 «قدیمی»، Q17 «سبز»، Q18 «آلمانی» (بینِ دوچرخه و قشنگ)، Q20 «less than» — همگی با گپِ لایه و رندر جای‌گذاری شدند؛
# «ماشیر/قدییم/آسیاب/آلمابن/کیل/خییل/بهی ین/نیم» همگی نویزِ لایه‌اند (چاپ: ماشین/قدیمی/آسیای/آلمانی/کلی/خیلی/بهترین/نمی).
# Idempotent: اجرای دوم NO-OP (مبنا = ۲۹ بانکِ r323-r333 / ۴۸۲ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

D21 = "-" * 21
D20 = "-" * 20
D19 = "-" * 19
D18 = "-" * 18
D17 = "-" * 17
D16 = "-" * 16
D15 = "-" * 15

# —— ۲۰ MCQ (ص۹۹: Q1-16، ص۱۰۰: Q17-20) — (ساقه، گزینه‌ها، کلیدِ صفر-مبنا، ترجمهٔ چاپی)
ITEMS = [
    (f"Her handwriting is not as {D21} as my handwriting.",
     ["worse", "the worst", "the best", "bad"], 3,
     "دستخط او به اندازه دستخط من بد نیست."),
    (f"His car was very cheap. I expected is to be {D21} than my car.",
     ["the most expensive", "more expensive", "expensive", "as expensive as"], 1,
     "ماشین او ارزان بود. انتظار داشتم از ماشین من گران تر باشد."),
    (f"It’s a very good room. It is {D21} room in this hotel.",
     ["the worst", "the best", "better", "worst"], 1,
     "اتاق خیلی خوبیه، بهترین اتاق در این هتل است."),
    (f"It’s a terrible hospital. It’s {D21} hospital in the city.",
     ["the worst", "the best", "better", "worse"], 0,
     "بیمارستان خیلی افتضاحیه. بدترین بیمارستان در این شهر است."),
    (f"Don’t worry. The exam was very difficult. Your mark isn’t so bad. It could be {D16} than this.",
     ["better", "worse", "well", "the best"], 1,
     "نگران نباش. امتحان خیلی سخت بود. نمره تو خیلی بد نبود. میتوانست از این هم بدتر باشد."),
    (f"It’s a very delicious food. It’s {D17} food in the restaurant.",
     ["better", "the best", "the worst", "worse"], 1,
     "غذای خیلی خوشمزه ایه، بهترین غذا در این رستوران است."),
    (f"Our hotel was {D17} than all the others in the town.",
     ["the cheapest", "as cheap as", "cheaper", "cheap"], 2,
     "هتل ما از همه هتل های دیگر شهر ارزان تر است."),
    (f"It was a terrible experience. It was {D17} experience of my life.",
     ["the worst", "the best", "better", "worse"], 0,
     "تجربه خیلی بدی بود. بدترین تجربه زندگی‌ام بود."),
    (f"The red car is {D20} than the black car.",
     ["expensive", "more expensive", "as expensive as", "the most expensive"], 1,
     "ماشین قرمز از ماشین سیاه گران تر است."),
    (f"The man is 70 kilos. The woman is 67 kilos. The man is {D19} the woman.",
     ["the heaviest", "as heavy as", "heavier than", "heavier"], 2,
     "مرد ۷۰ کیلو وزن دارد. زن ۶۷ کیلو وزن دارد. مرد از زن سنگین وزن تر است."),
    (f"Robert does not write well. He has {D18} handwriting in our class.",
     ["bad", "worse", "the worst", "as bad as"], 2,
     "رابرت به خوبی نمی نویسد. او بدترین دستخط کلاس را دارد."),
    (f"My brother has a {D15} cat.",
     ["pretty big brown Asian", "pretty big Asian brown", "big pretty brown Asian", "big brown pretty Asian"], 0,
     "برادرم یک گربه آسیای قهوه ای بزرگ قشنگ داره."),
    (f"There’s a {D17} box in our house.",
     ["small nice metal black", "small nice black metal", "nice black small metal", "nice small black metal"], 3,
     "در خانه ما یک جعبه فلزی سیاه کوچک زیبا وجود دارد."),
    (f"They live in a {D17} house.",
     ["beautiful wooden old", "beautiful old wooden", "old beautiful wooden", "wooden beautiful old"], 1,
     "آنها در یک خانه چوبی قدیمی زیبا زندگی میکنند."),
    (f"My friend never lets his little brother drive his {D17} car.",
     ["old expensive big", "big old expensive", "big expensive old", "expensive big old"], 3,
     "دوستم هرگز به برادرش اجازه نمیدهد که ماشین قدیمی بزرگ گران قیمتش را براند."),
    (f"Which sport is {D21} dangerous of all the sports in the Olympics?",
     ["least", "more", "the most", "many"], 2,
     "کدام ورزش به نسبت همه ورزش های دیگر المپیک خطرناکترین است؟"),
    (f"Did the tall young woman look in that {D17} dress?",
     ["long green silk", "green long silk", "silk long green", "long silk green"], 0,
     "آیا آن خانم قدبلند به آن پیراهن ابریشیمی سبز نگاه کرد؟"),
    (f"That {D15} bicycle is {D17} expensive than this motorcycle.",
     ["German nice / most", "nice German / most", "German nice / more", "nice German / more"], 3,
     "آن دوچرخه آلمانی قشنگ از آن موتور سیکلت گران تر است."),
    (f"There are many cheap things in the shop, but the cake is {D16} thing of all.",
     ["cheap", "cheaper than", "cheaper", "the cheapest"], 3,
     "وسایل ارزان زیادی در این مغازه وجود دارد اما کیک ارزانترین آنهاست."),
    (f"I had {D18} time than I needed to finish that work.",
     ["little", "less", "the least", "many"], 1,
     "من وقت کمتری از اون چیزی که برای تمام کردن آن کار لازمه، را دارم."),
]

PRINT_QUIRKS = [
    "سربرگِ آزمونِ ص۹۹ عنوانِ چاپی ندارد — فقط «سطح تستها: \"صرفاً آموزشی\" ، \"ساده\" (پاسخنامه صفحه: ۲۶۵-۲۶۶)» با متنِ قرمز؛ لایه «رصفأ» = scramblingِ «صرفاً» و «آموزیس» = «آموزشی» (چهارمین درسِ سربرگِ رنگیِ r318/r331/r333)",
    "عنوانِ فهرستِ ص۷۵: «۲۰ تست دستگریمی گرامر و نگارش» — چاپ «دستگریمی» با یِ اضافه (تحریفِ چاپیِ «دستگرمی»؛ برخلافِ «دستگری» ص۲۴۹ که لایه‌ای بود) — عنوانِ گروهِ UI تمیز شده، تحریف در همین رسید مستند است",
    "کلیدِ ص۲۶۵ با جعبهٔ «شیوه کلی حل تستهای گرامر صفات» آغاز می‌شود: «هرگاه به گزینه‌های یک تست نگاه کردید و گزینه‌ها، \"انواع صفت، کاربردهای آن و یا ترتیب صفات در جمله\" بودند، گرامر مربوطه معلوم شده...» (لایه «کیل» = کلی) — مادهٔ آموزشیِ ص۲۶۵",
    "رمزِ ترتیبِ صفات در کلید (Q12-15/17/18): «جم رساک» = جنس+ملیت+رنگ+سن+اندازه+کیفیت از سمت راست به چپ — عبارتِ صحیحِ هر تست زیرش با برچسبِ فارسیِ هر صفت زیرخط‌دار چاپ شده (pretty big brown Asian ← کیفیت/اندازه/رنگ/ملیت)",
    "Q2 ساقه: «I expected is to be --------------------- than my car.» — لغزشِ چاپیِ «is to be» (باید it to be می‌بود) — عینِ چاپ؛ لایه آن را نداده بود",
    "Q6/Q3 ساقه: «It’s a very delicious food» / «It’s a very good room» — food غیرقابل‌شمارش با حرف تعریف a — لغزشِ چاپی؛ ترجمه‌ها محاوره‌ای چاپ: «خوبیه/افتضاحیه/ایه/داره/میتوانست» (r330-Q11 الگو)",
    "Q12 کلید = (a) «pretty big brown Asian» — رندرِ ۷x ص۲۶۶ حاکم؛ لایه یک «b» شناور بالای مدخل داشت که نویز بود؛ توضیحِ چاپ: «جایگاه صفت ملیت (Asian) در گزینه b درست نیست. محل صفت رنگ (brown) در گزینه d اشتباهه...»",
    "Q13 گزینه‌های c/d در لایه یکسان شده بودند (nice small black metal ×۲) — رندرِ ۶x حاکم: c) nice black small metal | d) nice small black metal — کلید d؛ Q14 گزینهٔ a در لایه جابه‌جا (لایه: old wooden beautiful — چاپ: beautiful wooden old)",
    "Q15/Q14 «قدیمی» لایه «قدییم» (جابه‌جاییِ ی/م — رندرِ ۱۶x حاکم)؛ «چوبی» لایه «چوب» (یِ آخر حذف)؛ «ماشین» لایه «ماشیر» (Q2/Q9/Q15 — رندرِ ۱۶x: نِ کاسه‌دار با نقطهٔ بالا) — همگی نویزِ لایه، چاپ تمیز",
    "Q12 ترجمه: «برادرم یک گربه آسیای قهوه ای بزرگ قشنگ داره.» — «آسیای» با یِ واحد (رندرِ ۲۲x: آ-س-ی-ا-ی؛ لایه «آسیاب») + «داره» محاوره (رندرِ ۱۶x) — عینِ چاپ",
    "Q8 ترجمه: «بدترین تجربه زندگی‌ام بود.» — «زندگی» بالانویس (y0=590.4 در برابرِ سطرِ 598.5) بینِ «تجربه» و «ام» چاپ شده؛ «ام» در لایه دو توکنِ جدا (ا/م)؛ Q14 همین الگو با «زندگی» بالانویس بینِ «زیبا» و «میکند»",
    "Q9 ترجمه: «ماشین قرمز از ماشین سیاه گران تر است.» — «قرمز» و «سیاه» بالانویس (y0=642.9 در برابرِ 646.3) در شکافِ پس از هر «ماشین»",
    "Q15 ترجمه: «ماشین قدیمی بزرگ گران قیمتش را براند» — «قدیمی» بالانویس بینِ «ماشین» و «بزرگ» (y0=392.9 در برابرِ 396.3)",
    "Q18 ترجمه: «آن دوچرخه آلمانی قشنگ از آن موتور سیکلت گران تر است.» — «آلمانی» بالانویس (y0=603.6 در برابرِ 609.6) در شکافِ ۲۸pt بینِ «دوچرخه» و «قشنگ» — جای‌گذاری بر اساسِ اسلایزِ افقی (الگوی Q8/Q9/Q14/Q15)؛ لایه «آلمابن» (رندرِ ۱۶x: نِ کاسه‌دار)؛ «سیکلت» لایه یک‌بار «سیکلرت» داد — چاپ «سیکلت»",
    "Q20 توضیحِ کلید: «حالت برتری صفت little چون بی قاعده است، less than میباشد.» — «less than» با هم بالانویس (y0=702.3 در برابرِ 705.4؛ لایه «than less» جدا)؛ ترجمه: «من وقت کمتری از اون چیزی که برای تمام کردن آن کار لازمه، را دارم.» — «اون/لازمه/کمتری» محاوره، عینِ چاپ (لایه «کمی ی/چیر نی/الزمه»)",
    "Q17 ترجمه: «آیا آن خانم قدبلند به آن پیراهن ابریشیمی سبز نگاه کرد؟» — لایه «ابریشیم سی» + توکنِ جدا «بلند» = scramblingِ «ابریشیمی سبز» (رندرِ ۹x حاکم)؛ ساقه: «dress?» چسبیده در لایه (رندر گپِ ریز نشان می‌داد — توکنِ واحدِ لایه حاکم، الگوی r333 «the?»)",
    "Q10 ترجمه با ارقامِ فارسی: «مرد ۷۰ کیلو... زن ۶۷ کیلو...» — لایه «7 زن۶» بهم‌ریخته بود (رندرِ ۹x حاکم) + گیومهٔ بالارفتهٔ پایان‌سطر (الگوی r332-Q21)",
    "Q11 ترجمه: «رابرت به خوبی نمی نویسد.» — لایه «به خوب نیم نویسد» (نیم = نمی + جابه‌جایی)؛ Q16 ترجمه: «خطرناکترین» چسبیده (لایه «خطرناکی ین»)؛ Q19: «ارزانترین» چسبیده (لایه «ارزانی ین»)",
    "جای‌خالی‌های سبزِ خط‌چین با طولِ متغیر (۱۵ تا ۲۱ خط‌تیره) — طولِ هر ساقه عیناً از لایه؛ Q18 دو جای‌خالی (۱۵ و ۱۷)؛ Q4 جای‌خالیِ ۲۱تایی در لایه رویِ سطرِ جدا افتاده بود ولی x آن (174.02) بینِ «It’s»(153.34) و «hospital»(254.33) = درون‌خطی",
    "گزینه‌ها با قابِ آبیِ حاشیه‌دار و برچسبِ a/b/c/d ایتالیکِ آبی (سبکِ MCQِ این جزوه)؛ سؤال‌های ۱۷-۲۰ در ص۱۰۰؛ جعبهٔ Note خالیِ زرد با خطوطِ نوشتار در ص۱۰۰ (خارج از محتوا — الگوی r330)",
    "بدونِ برچسبِ «کنکور» در این آزمون (برخلافِ r330-Q19/20) — سطحِ چاپ: «صرفاً آموزشی» ، «ساده»",
]

RECEIPT = {
    "exam": "۲۰ تست دستگرمی گرامر و نگارش — درس دوم (ص۹۹-۱۰۰)",
    "header": "سربرگِ چاپیِ ص۹۹ عنوانِ آزمون ندارد: «سطح تستها: \"صرفاً آموزشی\" ، \"ساده\" (پاسخنامه صفحه: ۲۶۵-۲۶۶)» — عنوان از فهرستِ ص۷۵: «۲۰ تست دستگریمی گرامر و نگارش» — ۲۰ MCQ",
    "keyPages": "265-266",
    "keyVerification": "print key pp265-266 «شیوه کلی حل تستهای گرامر صفات» + 20 مدخلِ توضیح‌دار (گزینه + شیوهٔ حل + ترجمهٔ چاپی) — 20/20 agree with semantic pre-fill, zero divergence (Q12=a با رندرِ ص۲۶۶ حاکم شد — لایه «b» شناور نویز)",
    "extractedRound": "r334",
    "pattern": "r332 (کلیدِ توضیح‌دار + ترجمهٔ چاپی در هر آیتم) + r330 (روشِ گپِ لایه) + r333 (رندرِ حاکم بر گزینه‌های چندکلمه‌ای)",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))

existing = [l for l in data["lessons"] if l["lesson"] == 30]
if existing:
    print(f"lesson 30 already present ({existing[0]['count']} items) — NO-OP")
else:
    assert len(data["lessons"]) == 29, f"baseline mismatch: {len(data['lessons'])} banks"

    qs = []
    for i, (stem, opts, key, tr) in enumerate(ITEMS):
        qs.append({
            "id": f"g10-l30-{i + 1}", "n": i + 1, "category": "grammar",
            "question": stem, "options": opts, "answer": key, "translation": tr,
        })
    bank = {
        "lesson": 30,
        "title": "صرفاً آموزشی/ساده — ۲۰ تست دستگرمی گرامر و نگارش درس دوم (ص۹۹-۱۰۰)",
        "level": "صرفاً آموزشی/ساده — چهارگزینه‌ای", "count": len(qs), "questions": qs,
    }
    data["lessons"].append(bank)
    data["source"]["gram5"] = RECEIPT
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lesson 30: {bank['count']} items → banks={len(data['lessons'])}, total={total}")
