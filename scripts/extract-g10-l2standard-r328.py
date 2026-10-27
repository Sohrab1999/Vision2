# -*- coding: utf-8 -*-
# r328 — استخراجِ «تست واژگان درس دوم — بخش دوم، سطح استاندارد» جزوهٔ دهم (ص۸۹-۹۰)
# به public/jozve/tests-g10.json — بانک دوازدهم (۴۰ MCQ) + ترجمه‌های چاپیِ «ترجمه تست»
# کلید: ص۲۶۱-۲۶۳ «پاسخنامه تستی تستهای واژگان — درس دوم، سطح تستها استاندارد» (۴۰/۴۰ هم‌رأی — صفر واگرایی).
# الگو: r325 (استانداردِ درس اول) + r324 (ترجمهٔ چاپ‌محور) + r311/r323 (بانک درس‌محور) + r320/r321 (عینِ چاپ).
# زوم‌های ۳۰۰۰-۸۰۰۰dpi برای نقاط سرنوشت‌ساز: خلبان گفته/عمده‌ی/نبستند/قطرات/دسری/هایگ/استفاده ی/
# می شود/رصد کردن/هوایی/دانشگاهه/معلمی/مضر/به طوربا دقت/observe (بدون d) + اراتای glossهای Q40.
# Idempotent: اجرای دوم NO-OP (مبنا = ۱۱ بانکِ r323-r327).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# (ساقه، گزینه‌ها، کلیدِ حرفیِ چاپ، ترجمهٔ چاپی) — رونویسیِ رندرِ ۳۰۰dpi + داوریِ ۲۲۰۰-۸۰۰۰dpi
ITEMS = [
    ("If you listen --------------- to this great music, you can hear a flute in the background.",
     ["really", "carefully", "regularly", "slowly"], "b",
     "اگر به این موسیقی عالی با دقت گوش بدهید، می توانید صدای فلوت را در موسیقی زمینه بشنوید."),
    ("The children were vaccinated against the major childhood ---------------.",
     ["area", "disease", "energy", "gift"], "b",
     "کودکان در برابر بیماری‌های عمده‌ی دوران کودکی واکسینه شدند."),
    ("“This is your captain speaking. We --------------- to be landing at London airport in an hour’s time”. the pilot said.",
     ["happen", "expect", "follow", "exercise"], "b",
     "خلبان گفته: کاپیتان شما صحبت می کند. ما انتظار داریم که در حدود یک ساعت آینده در فرودگاه لندن فرود بیاییم."),
    ("That’s --------------- - I’m sure I put my glasses in my bag, but they’re not there.",
     ["fresh", "simple", "serious", "strange"], "d",
     "عجیبه. مطمئن هستم که عینکم را در کیفم گذاشته‌ام، اما آنجا نیستند."),
    ("It’s a difficult --------------- and I don't know what to do to solve my problem.",
     ["situation", "half", "liquid", "land"], "a",
     "موقعیت سختی است و نمی دانم برای این که مشکلم را حل بکنم، چیکار بکنم."),
    ("I was looking for a birthday present for my mother but I didn't find anything ---------------.",
     ["brave", "fatty", "suitable", "extra"], "c",
     "دنبال یک هدیه روز تولد برای مادرم گشتم، اما چیز مناسبی پیدا نکردم."),
    ("Her latest project is a film that is --------------- the life of a 19th-century music hall star.",
     ["based on", "divided into", "cut down", "looked after"], "a",
     "آخرین پروژه او فیلمی است که بر اساس زندگی یک ستارهٔ موسیقی قرن نوزدهم است."),
    ("A good knife is probably one of the most --------------- things you can have in a kitchen.",
     ["useful", "dark", "amazing", "interesting"], "a",
     "احتمالاً یک چاقوی خوب، یکی از پرکاربرد و مفیدترین چیزهایی است که میتوانید در آشپزخانه داشته باشید."),
    ("The picture quality is bad because the TV signal isn’t --------------- enough.",
     ["suitable", "golden", "powerful", "polite"], "c",
     "کیفیت تصویر بد است زیرا سیگنال تلویزیون به اندازه کافی قوی نیست."),
    ("The research project has been --------------- changes in the local population.",
     ["drawing", "rising", "donating", "observing"], "d",
     "پروژهٔ تحقیق در حال مشاهده (رصد) کردن تغییرات جمعیت محلی بوده است."),
    ("I had a --------------- headache, but I went to the concert.",
     ["energetic", "careless", "terrible", "irregular"], "c",
     "یک سر درد بسیار بد داشتم، اما به کنسرت رفتم."),
    ("I can give you --------------- pain-killing drugs if these aren’t enough.",
     ["stronger", "kinder", "farther", "larger"], "a",
     "اگر این ها کافی نبستند، من می توانم به تو مسکن های قوی تری بدهم."),
    ("Working in that factory was hard for those months, but it was a good --------------- for him.",
     ["experience", "information", "material", "situation"], "a",
     "کار کردن در آن کارخانه، برای \"آن\" ماه ها سخت بود، اما تجربه خوبی براش بود."),
    ("You should --------------- parking the car a few more times before you take the driver's test.",
     ["happen", "endanger", "spell", "practice"], "d",
     "باید قبل از این که امتحان رانندگی ماشین را بدهید، یک بار بیشتر پارک کردن ماشین را تمرین کنید."),
    ("With all the --------------- of modern technology, why has no one come up with a way to have a time travel?",
     ["rings", "gifts", "wonders", "marks"], "c",
     "با تمام شگفتی‌های تکنولوژی مدرن، چرا هیچکس ایده ای برای سفر در زمان نداشته است؟"),
    ("The Vatican has agreed to --------------- $80 000 in emergency aid to countries affected by the war.",
     ["order", "donate", "expect", "pump"], "b",
     "واتیکان قبول کرده است که ۸۰ هزار دلار برای کمک اضطراری به کشورهایی که درگیر جنگ شده‌اند، اهدا کند."),
    ("The president was asked how he could --------------- a policy that increased unemployment.",
     ["defend", "sneeze", "increase", "observe"], "a",
     "از رئیس جمهور پرسیده شد که چطور توانست از سیاستی که موجب افزایش بیکاری شده، دفاع کند؟"),
    ("She told me every single --------------- of what they did to her in hospital.",
     ["organ", "rock", "detail", "metal"], "c",
     "او تمام جزئیات آنچه را که آن ها با او در بیمارستان کرده‌ند، به من گفت."),
    ("Paul helped his elderly neighbor by --------------- snow from yard of her house.",
     ["clearing", "following", "exercising", "donating"], "a",
     "پائول به همسایهٔ سالخورده اش به وسیلهٔ تمیز کردن برف از حیاط خانه اش کمک کرد."),
    ("There were little --------------- of paint on the kitchen floor and we had to remove them.",
     ["interests", "golds", "signs", "drops"], "d",
     "قطرات کوچک رنگی در کف آشپزخانه بود و ما مجبور بودیم که پاکشان کنیم."),
    ("That was a/an --------------- he hadn’t heard before, and wondered what it meant.",
     ["relative", "hope", "expression", "graph"], "c",
     "آن یک عبارتی بود که قبلاً نشنیده بود و در شگفت بود که معنی آن چه می شود."),
    ("He’s dropped several --------------- to the boss that he’ll quit if he doesn’t get a promotion.",
     ["hints", "drops", "marks", "arrows"], "a",
     "او به طور غیر مستقیم بارها به رییس گفته است که اگر ترفیع درجه نگیرد، از کار انصراف میدهد."),
    ("We try to do what is best for our customers --------------- the quality of our products.",
     ["on our own", "instead of", "in terms of", "in fact"], "c",
     "ما سعی میکنیم که آن چه را که بهترین است از لحاظ کیفیت محصولات مان، برای مشتری‌هایمان انجام بدهیم."),
    ("Prices of products are governed by the cost of the ---------------, as well as by the cost of production.",
     ["health", "materials", "expressions", "wonders"], "b",
     "قیمت‌های محصولات به وسیلهٔ قیمت مواد اولیه و همچنین هزینهٔ تولید کنترل می شود."),
    ("He’s not interested in ---------------. All he cares about is making money.",
     ["quality", "pepper", "gift", "element"], "a",
     "الف: \"او به کیفیت علاقه مند نیست. تمام چیزی که او برایش مهم است، پول در آوردن است.\""),
    ("Having a second income is an important --------------- for most home buyers.",
     ["abroad", "area", "element", "form"], "c",
     "داشتن یک درآمد دوم، یک عنصر مهم برای خریداران خانه است."),
    ("I didn’t --------------- want any more dessert, but Julia forced it on me.",
     ["importantly", "angrily", "carefully", "actually"], "d",
     "من در واقع دیگه دسری نمی خواستم، اما جولیا مجبورم کرد."),
    ("I didn’t think his comments were very --------------- at that time.",
     ["appropriate", "expensive", "beautiful", "famous"], "a",
     "فکر می کردم که نظراتش خیلی مناسب آن زمان نبودند."),
    ("The drug works more quickly if it is injected directly into the blood ---------------.",
     ["fact", "stream", "land", "location"], "b",
     "اگر [آن] دارو مستقیماً به جریان خون تزریق شود، سریع تر عمل می کند."),
    ("It was a --------------- decision to quit her job and start her own business.",
     ["clear", "actual", "expensive", "brave"], "d",
     "یک تصمیم شجاعانه بود که از کارش انصراف بدهد و کسب و کار خودش را راه بیندازد."),
    ("She went into a --------------- coma after taking an overdose of sleeping pills.",
     ["common", "extra", "plastic", "deep"], "d",
     "او بعد از استفاده ی بیش از حد قرص های خواب آور، به یک کمای عمیق رفت."),
    ("As a parent we should try to --------------- a stable home environment for our children to grow up in.",
     ["describe", "observe", "create", "train"], "c",
     "به عنوان والدین، ما باید تلاش کنیم تا یک محیط پایدار خانگی برای فرزندانمان بسازیم تا در آن رشد کنند."),
    ("I can recommend the chicken in our special sauce for your lunch. it's really --------------- !",
     ["delicious", "serious", "cultural", "strong"], "a",
     "می توانم برای نهار شما، جوجه در سس مخصوص خودمان را پیشنهاد دهم. واقعاً خوشمزه است."),
    ("Many things make it --------------- for women to reach the top in US business.",
     ["sick", "difficult", "wonderful", "healthy"], "b",
     "خیلی چیزها برای خانم ها این را سخت می کند که به درجات بالا در تجارت در آمریکا برسند."),
    ("The word “flight” has two --------------- meanings: a plane journey, and the act of escaping.",
     ["different", "endangered", "dangerous", "energetic"], "a",
     "کلمهٔ flight دو معنی متفاوت دارد: یک سفر هوایی، و عمل فرار کردن."),
    ("The life of humans has lots of different things to --------------- ; such as job, college major, etc.",
     ["spell", "clear", "choose", "decrease"], "c",
     "زندگی انسان‌ها خیلی چیزهای مختلفی دارد برای انتخاب کردن؛ مانند شغل، رشتهٔ دانشگاهه، و ...."),
    ("We need someone who has --------------- in marketing and teaching, and I think Alex is just the man for the job.",
     ["experience", "insect", "example", "form"], "a",
     "ما به کسی نیاز داریم که در امر بازاریابی و معلمی تجربه دارد، و فکر کنم الکس تنها فرد برای این کار است."),
    ("His parents won’t let him play ice hockey because they think it’s too ---------------.",
     ["pleasant", "possible", "important", "dangerous"], "d",
     "والدین او به او اجازه ی بازی کردن هایگ روی یخ را نخواهند داد چون فکر میکنند که خیلی خطرناک است."),
    ("It’s important to --------------- your skin from the harmful effects of the sun.",
     ["injure", "protect", "unscramble", "identify"], "b",
     "این مهم است که از پوستتان در برابر تاثیرات مضر خورشید محافظت کنید."),
    ("During the 1980s, the amount of ozone in the stratosphere above Europe --------------- by about 8%.",
     ["decreased", "attacked", "happened", "observe"], "a",
     "در طول ۱۹۸۰، مقدار ازون در استراتوسفر بالای اروپا حدوداً ۸ درصد کاهش پیدا کرد."),
]

QUIRKS = [
    "Q3: چاپ ساقه «...an hour's time\". the pilot said.» — نقطه بعد از گیومهٔ بسته + the کوچک (عین چاپ)",
    "Q19: چاپ ساقه «snow from yard of her house» — حذفِ the قبل از yard (عین چاپ)",
    "Q40 ساقه: گزینهٔ d چاپ «observe» بدون d پایانی (زوم ۳۰۰۰dpi قطعی؛ باید observed می‌بود) — عین چاپ",
    "Q37: نشانِ جای خالیِ ساقه کوتاه (۴خط‌چین) — نرمال‌سازی به ۱۵خطه (قرارداد r324/r325)",
    "Q2 کلید: «بیماری‌های عمده‌ی دوران کودکی» — عمده + یِ اضافه (زوم ۸۰۰۰dpi)",
    "Q3 کلید: «خلبان گفته: کاپیتان شما صحبت می کند...» — خوانشِ نخستِ ۳۰۰dpi «خدان» رد شد (زوم ۵۲۰۰dpi)",
    "Q5 گزینهٔ ۴ کلید: «خشکی ، فرود آمدن» (زوم ۴۰۰۰dpi؛ خوانشِ نخست «فرد آمدن» رد شد)",
    "Q7 گزینهٔ ۱ کلید: «پایه گذاری کردن (اینچا معنی بر اساس میدهد)» — کوئیرک چاپِ «اینچا» (۴۰۰۰dpi)",
    "Q10 کلید: «مشاهده (رصد) کردن» — پرانتزِ داخلِ ترجمه عین چاپ",
    "Q12 کلید: «اگر این ها کافی نبستند» — «نبستند» با بِ یک‌نقطه (۸۰۰۰dpi؛ لایه «نیستند» گزارش می‌کرد)",
    "Q13 کلید: «برای \"آن\" ماه ها» — کوتیشنِ دورِ آن عین چاپ",
    "Q15 کلید: «شگفتی‌های» با ف (۸۰۰۰dpi؛ خوانشِ نخستِ ۳۰۰dpi «شگقتی» رد شد)",
    "Q16 کلید: «۸۰ هزار دلار» رقمِ فارسی + «درگیر جنگ شده‌اند» (لایه تأیید؛ خوانشِ نخست «دیگر» رد)",
    "Q17 گزینهٔ ۴ کلید: «رصد کردن» با و (۸۰۰۰dpi؛ هماهنگ با Q10)",
    "Q18 کلید: «کرده‌ند» — کوئیرک چاپ",
    "Q20 کلید: «قطرات کوچک رنگی» — «قطرات» با تِ دوتایی (۸۰۰۰dpi؛ به‌جای قطره‌ها)",
    "Q21 کلید: «در شگفت بود که معنی آن چه می شود.» — «می شود» (۸۰۰۰dpi؛ لایه «می شد» گزارش می‌کرد)",
    "Q22 کلید: گزینهٔ ۱ «نشانه ، اشاره ، نثار» با فاصله‌دورِ ویرگول‌ها (۸۰۰۰dpi) + جعبهٔ چاپیِ idiom زیرِ آیتم: «Drop a hint: به طور غیر مستقیم چیزی را گفتن»",
    "Q27 کلید: «دیگه دسری» (۸۰۰۰dpi) + گزینهٔ ۱ «به طور مهم» + گزینهٔ ۳ «به طوربا دقت» بدون فاصله بعد از طور (۶۰۰۰dpi)",
    "Q29 کلید: «اگر [آن] دارو مستقیماً» — براکتِ مربعِ چاپ (۸۰۰۰dpi)",
    "Q31 کلید: «استفاده ی بیش از حد» — یِ اضافه با فاصله (۸۰۰۰dpi)",
    "Q35 کلید: «سفر هوایی» با ی دوبل (۵۲۰۰dpi؛ خوانشِ نخستِ ۳۰۰dpi «هواری» رد شد)",
    "Q36 کلید: «رشتهٔ دانشگاهه، و ....» — «دانشگاهه» با هِ اضافه + ویرگول قبل از و (۸۰۰۰dpi)",
    "Q37 کلید: «در امر بازاریابی و معلمی تجربه دارد» — «معلمی» جای تدریس (۸۰۰۰dpi؛ لایه «معلیم»)",
    "Q38 کلید: «اجازه ی بازی کردن هایگ روی یخ» — یِ اضافه با فاصله + «هایگ» با گِ سرگردان (۸۰۰۰dpi)؛ «فکر میکنند» چسبیده",
    "Q39 کلید: «تاثیرات مضر خورشید» بدون همزه (۶۰۰۰dpi؛ خوانشِ نخست «مضرٔ» رد) + گزینهٔ ۲ کلید «مراقبت کردن» در حالی که ترجمه «محافظت کنید» دارد — هر دو عین چاپ",
    "Q40 کلید — اراتای بزرگِ صفحهٔ کلید: سطرِ glossها (۱) طول عمر [قرمز] (۲) برنامه (۳) طبیعت (۴) علاقه و هایلایتِ قرمزِ «طول» در ترجمه، کپیِ اشتباه از Q40ِ «استاندارد درس اول» (r325) است؛ ترجمهٔ جمله («...حدوداً ۸ درصد کاهش پیدا کرد») و کلیدِ (a) با decreased سازگارند — قفلِ دوگانه با انعکاسِ ترجمه برقرار؛ glossها عیناً مستند، کلید دست‌نخورده",
    "فاصله‌های می: «می توانید/می کند(Q3,Q29)/می توانم(Q12,Q33)/میدهد(Q22)/میکنیم(Q23)/می شود(Q21,Q24)/نمی خواستم(Q27)/می کردم(Q28)/می کند(Q34)/میکنند(Q38)» — هر آیتم عین چاپ (الگوی r325/r327)",
    "ZWNJ: «بیماری‌های/گذاشته‌ام/شگفتی‌های/مشتری‌هایمان/قیمت‌های/انسان‌ها/کرده‌ند/جنگ شده‌اند» چسبیده-با-ZWNJ چاپ",
]


def build_exam5():
    qs = []
    for i, (stem, options, key_letter, translation) in enumerate(ITEMS):
        n = i + 1
        idx = "abcd".index(key_letter)
        # پیش‌داوریِ معنایی: ترجمهٔ چاپ باید گزینهٔ کلید را تأیید کند (لفظی یا گلوسِ چاپ — Q22 استثنای مستند)
        qs.append({
            "id": f"g10-l12-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
            "translation": translation,
        })
    return qs


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    # base = ۱۱ بانکِ r323-r327 (اگر راندِ قبل اجرا شده، بانک دوازدهم را کنار بگذار)
    base_lessons = old["lessons"][:11] if len(old["lessons"]) == 12 else old["lessons"]
    assert old["grade"] == 10 and len(base_lessons) == 11, "unexpected base shape"
    assert sum(l["count"] for l in base_lessons) == 234, "unexpected base count"
    base_source = {k: v for k, v in old["source"].items() if k != "exam5"}

    qs = build_exam5()
    lesson12 = {
        "lesson": 12,
        "title": "استاندارد — تست واژگان درس دوم (ص۸۹-۹۰)",
        "level": "استاندارد — چهارگزینه‌ای",
        "count": len(qs),
        "questions": qs,
    }

    doc = {"grade": 10, "lessons": base_lessons + [lesson12], "source": dict(base_source)}
    doc["source"]["exam5"] = {
        "exam": "تست واژگان درس دوم — بخش دوم، سطح استاندارد (سؤالات: ص۸۹ و ۹۰)",
        "header": "سؤالات تستی واژگان درس: «دوم» پایه: «دهم» (پاسخنامه صفحه: ۲۶۱ تا ۲۶۳) بخش: «دوم» سطح تستها: «استاندارد»",
        "keyPages": "261-263",
        "keyVerification": "print key pp261-263 «پاسخنامه تستی تستهای واژگان — پایه: دهم درس: دوم سطح تستها: استاندارد» — 40/40 agree with semantic pre-fill (key option reflected in printed translation — lexical throughout; Q22 via the printed gloss «به طور غیر مستقیم»; Q40 via «کاهش پیدا کرد» despite the copied-from-lesson-1 gloss row), zero divergence",
        "extractedRound": "r328",
        "pattern": "r325 (استاندارد درس اول) + r324 (ترجمهٔ چاپ‌محور) + r311/r323 (بانک درس‌محور) + r320/r321 (عینِ چاپ)",
        "translations": "۴۰ ترجمهٔ چاپی «ترجمه تست» به آیتم‌ها تزریق شد؛ ~۲۹ نقطه با زومِ ۲۲۰۰-۸۰۰۰dpi داوری شد (خلبان گفته/عمده‌ی/نبستند/قطرات/دسری/هایگ/استفاده ی/می شود/رصد کردن/هوایی/دانشگاهه/معلمی/مضر/به طوربا دقت/observe) + اراتای glossهای Q40 مستند",
        "printQuirks": QUIRKS,
    }

    total = sum(l["count"] for l in doc["lessons"])
    print(f"built: {len(doc['lessons'])} banks, {total} items (exam5: {lesson12['count']})")
    if old == doc:
        print("identical content — NO-OP")
        return
    PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"written: {PATH}")


if __name__ == "__main__":
    main()
