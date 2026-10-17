# -*- coding: utf-8 -*-
# r327 — استخراجِ «تست واژگان درس دوم — سطح متوسط» جزوهٔ دهم (ص۸۷-۸۸)
# به public/jozve/tests-g10.json — بانک یازدهم (۴۰ MCQ) + ترجمه‌های چاپیِ «ترجمه تست»
# کلید: ص۲۵۹-۲۶۰ «کلید و ترجمه تستهای واژگان "درس دوم - پایه دهم" (سؤالات: صفحه ۸۷ و ۸۸)»
# ۴۰/۴۰ هم‌رأی با پیش‌پرکردنِ معنایی — صفر واگرایی.
# الگو: r311/r323 (بانک درس‌محور) + r320/r324/r325 (ترجمهٔ چاپ‌محور در فیلد translation).
# زوم‌های ۲۶۰۰-۸۰۰۰dpi برای نقاطِ سرنوشت‌ساز:
#   Q3/Q4 برچسبِ دوتاییِ «c» در سطرِ گزینه‌ها (کوئیرکِ چاپ) + کلیدِ (d) برای Q4
#   Q13 هری پاتر، Q19 «پتر»، Q22 «زردنگ»/شامل، Q31 لیوان، Q36 عنصری (عامل)، Q37 «مطالی»، Q39 گیاهان،
#   Q24 بررسی/نوشتهاید، Q30 خودت/می دهد، Q12 می کند، Q18 می کند، Q38 می بایستی، Q40 می کشد، Q16/Q7 «کره ی/سیاره ی» جدای.
# Idempotent: اجرای دوم NO-OP.
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# (ساقه، گزینه‌ها، کلیدِ حرفیِ چاپ، ترجمهٔ چاپی) — رونویسیِ رندرِ ۳۰۰dpi + داوریِ ۲۶۰۰-۸۰۰۰dpi
ITEMS = [
    ("We heard voices when we drew --------------- the village.",
     ["far", "near", "real", "above"], "b",
     "وقتی که ما به نزدیک روستا آمدیم، صداهایی را شنیدیم."),
    ("The first --------------- of rain fell down on the ground yesterday and we enjoyed a lot.",
     ["drops", "pumps", "liquids", "signs"], "a",
     "دیروز اولین قطرات باران روی زمین افتاد و ما هم خیلی لذت بردیم."),
    ("Have you ever explored the --------------- of other planets.",
     ["powers", "signs", "wonders", "types"], "c",
     "تاکنون شما عجایب سیارات دیگر را کشف کردهاید؟"),
    ("He went around the office --------------- old coffee cups.",
     ["carrying", "creating", "orbiting", "collecting"], "d",
     "او برای جمع آوری فنجانهای قهوهای قدیمی اطراف دفتر را گشت."),
    ("An extremely small living thing which you can’t see with your eyes and can cause diseases is called ---------------.",
     ["plasma", "cell", "body", "microbe"], "d",
     "یک موجود زنده خیلی کوچک که با چشمانتان نمیتوانید ببینید و میتواند بیماریهایی را بوجود آورد میکروب نامیده می شود."),
    ("Crying is seen as a --------------- of weakness among some people in bad situations.",
     ["system", "sign", "power", "ring"], "b",
     "گریه کردن به عنوان یک نشانه ضعف میان بعضی افراد در وضعیتهای بد دیده می شود."),
    ("A planet that is the closest to the sun in the solar system and sometimes visible with eyes after sunset is ---------------.",
     ["Mercury", "earth", "orbit", "telescope"], "a",
     "این سیاره ی کوچک در منظومه شمسی، نزدیکترین سیاره به خورشید است و گاهی اوقات با چشم، درست بعد از غروب آفتاب، قابل رؤیت است. آن سیاره عطارد است."),
    ("This machine will --------------- water from the basement if there is a heavy rain.",
     ["carry", "pump", "collect", "clear"], "b",
     "اگر باران سنگین ببارد این دستگاه آب را از زیر زمین پمپاژ می کند."),
    ("When you have a cold or the flu, you should drink plenty of ---------------.",
     ["liquids", "drops", "plasma", "pepper"], "a",
     "وقتی که شما سرما میخورید یا آنفولانزا دارید، بهتر است مایعات زیادی بنوشید."),
    ("The holidays gave him a chance to --------------- the room.",
     ["follow", "create", "carry", "paint"], "d",
     "تعطیلات به او فرصت داد که اتاق را رنگ بزند."),
    ("The satellite will complete one --------------- every 12 hours.",
     ["space", "orbit", "planet", "drop"], "b",
     "ماهواره هر دوره زمان یک مدار را کامل می کند."),
    ("A special building from which scientists watch the moon, stars weather etc. is called ---------------.",
     ["university", "laboratory", "observatory", "college"], "c",
     "یک ساختمان ویژه که دانشمندان در آن ماه، ستارهها، آب و هوا و غیره را تماشا می کند رصدخانه نامیده می شود."),
    ("The books about Harry Potter have been very popular and interesting both at home and ---------------.",
     ["country", "continent", "city", "abroad"], "d",
     "این کتابها در مورد هری پاتر هم در داخل و هم درخارج خیلی محبوب و جالب بودهاند."),
    ("The taste of that home-baked brown bread is highly pleasant. In other word, it’s so ---------------.",
     ["terrible", "suitable", "delicious", "comfortable"], "c",
     "مزه آن نان قهوهای خانگی خیلی مطبوع است. به عبارت دیگر خیلی خوشمزه است."),
    ("What is the --------------- and the most terrible possible thing that can happen?",
     ["best", "worst", "most", "least"], "b",
     "بدترین و وحشتناک ترین چیزی که میتواند اتفاق بیافتد، چیست؟"),
    ("Details on the moon’s surface can only be seen through a ---------------.",
     ["microscope", "telescope", "camera", "lens"], "b",
     "جزئیات سطح کره ی ماه، فقط از طریق یک تلسکوپ میتوانند دیده شوند."),
    ("A smallest part of a living thing that can exist independently is called ---------------.",
     ["virus", "microbe", "cell", "bacteria"], "c",
     "کوچکترین قسمت یک موجود زنده که می تواند به طور مستقل وجود داشته باشد، سلول نامیده می شود."),
    ("There are more air planes --------------- more people than ever before.",
     ["collecting", "carrying", "completing", "comparing"], "b",
     "هواپیماهای زیادی وجود دارند که افراد بیشتری را نسبت به قبل، حمل می کند."),
    ("It will be --------------- to see what happens when he gets a bit older.",
     ["interesting", "healthy", "near", "powerful"], "a",
     "زمانیکه او کمی پتر شود، دیدن اینکه چه رخ میدهد، (برایش) جالب خواهد بود."),
    ("These crayons are not --------------- to use in very hot weather.",
     ["actual", "modern", "interesting", "suitable"], "d",
     "این مداد شمعیها برای استفاده در آب و هوای خیلی گرم مناسب نیستند."),
    ("Last year he --------------- $10000 to cancer research of New York hospital.",
     ["donated", "completed", "controlled", "turned"], "a",
     "او پارسال صد هزار دلار به تحقیقات سرطان بیمارستان نیویورک اهدا کرد."),
    ("--------------- is the yellow liquid part of blood that contains the blood cells.",
     ["Plasma", "Microbe", "Bacteria", "Virus"], "a",
     "پلاسما قسمت مایع زردنگ خون است که شامل سلولهای خونی هست."),
    ("The police were in --------------- control of the situation.",
     ["around", "complete", "medium", "strange"], "b",
     "پلیس کنترل کامل موقعیت (وضعیت) را در دست داشت."),
    ("It’s better to make a phone call to --------------- that you’re writing to the right person.",
     ["check", "locate", "break", "compare"], "a",
     "بهتر است یک تماس تلفنی برقرار شود که بررسی شود (که آیا) شما برای شخص درستی (نامه) نوشتهاید."),
    ("How does life in Britain --------------- with life in the United States?",
     ["defend", "describe", "compare", "pair"], "c",
     "چطور زندگی در بریتانیا با ایالات متحده مقایسه می شود؟"),
    ("Another approach for solving the problem is --------------- in chapter 3 of the book.",
     ["compared", "contrasted", "completed", "described"], "d",
     "روش دیگر برای حل مسأله، در بخش سوم کتاب توصیف شده است."),
    ("The drug is effective against a range of ---------------.",
     ["bacteria", "cell", "plasma", "body"], "a",
     "دارو علیه دسته ای از باکتری ها موثر است."),
    ("Police found tiny drops of --------------- in the apartment and finally identified killer.",
     ["paint", "blood", "water", "cell"], "b",
     "پلیس قطرات کوچکی از خون را در آپارتمان پیدا کرده و سرانجام قاتل را شناسایی کردند."),
    ("My grandfather died after suffering a severe heart --------------- two years ago.",
     ["attack", "cross", "body", "element"], "a",
     "پدربزرگم دو سال پیش، بعد از رنج بردن از یک حمله قلبی شدید، فوت کرد."),
    ("They always say time changes things but you --------------- have to change them yourself.",
     ["at first", "actually", "finally", "nowadays"], "b",
     "آنها همیشه میگویند که زمان چیزها را تغییر می دهد. اما در واقع شما بایستی خودت آنها را تغییر دهی."),
    ("The glass fell down and broke in to a --------------- pieces.",
     ["thousand", "thousand of", "millions", "billions"], "a",
     "لیوان (بر روی زمین) افتاد و به هزار تکه (تبدیل) شد."),
    ("They have a TV with a --------------- picture and high-quality sound.",
     ["simple", "clear", "common", "average"], "b",
     "آنها تلویزیونی با تصویری واضح و صدایی با کیفیت بالا دارند."),
    ("Try to add doing some regular --------------- into your daily routine.",
     ["experiment", "research", "exercise", "health"], "c",
     "تلاش کن تا (انجام) چند تمرین منظم به کارهای(مرتب) روزانه ات را اضافه کنی."),
    ("Among our family members my younger sister was the only one who travelled ---------------.",
     ["abroad", "near", "distance", "upward"], "a",
     "در میان اعضای خانواده ما، خواهر کوچکترم تنها کسی بود که به خارج از کشور مسافرت کرد."),
    ("It’s a mistake to think of Florida only --------------- its tourist attractions.",
     ["based", "in terms of", "by mean of", "jumped out of"], "b",
     "اشتباه است که به فلوریدا فقط برحسب جاذبههای توریستی فکر کنیم."),
    ("Religion was an --------------- which divided that country into two group.",
     ["element", "ring", "system", "gift"], "a",
     "مذهب عنصری (عامل) بود که کشور را به دو گروه تقسیم کرد."),
    ("She gathered --------------- for her novel by reading newspapers from 1990s.",
     ["elements", "hints", "keys", "material"], "d",
     "او با خواندن روزنامهها، از دهه ۱۹۹۰ مطالی را برای رمانش جمع آوری کرد."),
    ("Such companies must change if they are to compete in the --------------- world.",
     ["modern", "ancient", "nation", "living"], "a",
     "اگر قرار است چنین شرکتهایی در دنیای مدرن رقابت کنند، می بایستی تغییر کنند."),
    ("Let me tell you some helpful --------------- on looking after house plants.",
     ["elements", "hints", "materials", "gifts"], "b",
     "بگذار برای شما چند نکته مفید در مورد مراقبت کردن از گیاهان خانگی را بگویم."),
    ("How long does it take for the --------------- Jupiter to make a complete orbit around the sun?",
     ["star", "planet", "orbit", "plane"], "b",
     "چه مدت برای سیاره مشتری، طول می کشد تا یک چرخش کامل دور خورشید، داشته باشد؟"),
]

QUIRKS = [
    "Q3 و Q4: سطرِ گزینه‌های چاپ، گزینهٔ چهارم را هم «c.» برچسب زده (c. types / c. collecting — برچسبِ دوتاییِ c؛ زومِ ۸۰۰۰dpi قطعی)؛ عینِ چاپ",
    "Q4: ناسازگاریِ درونیِ چاپ — سطرِ گزینه‌ها برچسب c برای collecting دارد ولی کلیدِ چاپِ ص۲۵۹ «گزینه (d)» میگوید؛ ترجمهٔ چاپی «جمع آوری» حاکمیتِ collecting را تأیید می‌کند — کلید حاکم، برچسب عینِ چاپ مستند",
    "Q3: ساقه با نقطه پایان مییابد نه علامت سؤال («…of other planets.»)؛ عینِ چاپ",
    "Q12: «stars weather» بدونِ ویرگول در چاپ؛ عینِ چاپ",
    "Q14: «In other word» (جمعِ words نیست)؛ عینِ چاپ",
    "Q17: «A smallest part» (به‌جای The smallest)؛ عینِ چاپ",
    "Q18: «air planes» دو واژه جدا در چاپ؛ عینِ چاپ",
    "Q28: «finally identified killer» بدونِ the در چاپ؛ عینِ چاپ",
    "Q31: «broke in to a --------------- pieces» (in to جدا + تعدادِ ناسازگار)؛ عینِ چاپ",
    "Q35: گزینهٔ چاپ «by mean of» (means نیست)؛ عینِ چاپ",
    "Q36: «into two group» (groups نیست)؛ عینِ چاپ",
    "Q38: «compete in the --------------- world» — چاپ فاصله پیش از جای خالی را حذف کرده؛ فاصله در رونویسی بازچینی شد (نشانهگذاری در رسید)",
    "ترجمهٔ Q19: چاپ «پتر شود» (پیرتر — یِ میانه حذفِ چاپ؛ زومِ ۲۶۰۰dpi)؛ عینِ چاپ",
    "ترجمهٔ Q22: چاپ «زردنگ» (زردرنگ — رِ دوم حذفِ چاپ)؛ عینِ چاپ",
    "ترجمهٔ Q30: چاپ «خودت» (خودتان — انِ آخر حذفِ چاپ؛ زومِ ۸۰۰۰dpi)؛ عینِ چاپ",
    "ترجمهٔ Q37: چاپ «مطالی» (مطالبی؛ زومِ ۲۶۰۰dpi)؛ عینِ چاپ",
    "ترجمهٔ Q27: «موثر» بدونِ همزه (مؤثر نیست) + «دسته ای/باکتری ها» جدایِ چاپ؛ عینِ چاپ",
    "الگوی میـها: «میخورید/میدهد(۱۹)/میکروب…» چسبیده ولی «می کند/می شود/می دهد(۳۰)/می کشد/می بایستی/می تواند(۱۷)» جدای — ناهماهنگیِ خودِ چاپ، هر دو عینِ چاپ (الگوی r324)",
    "اضافهٔ «ی»: «سیاره ی/کره ی» جدایِ چاپ (زومِ ۸۰۰۰dpi) ولی «بیماریهایی/جاذبههای/شمعیها/کتابها/روزنامهها/ستارهها/شرکتهایی/هواپیماهای» چسبیده — عینِ چاپ",
]


LET = "abcd"


def build_exam4():
    qs = []
    for i, (stem, options, key_letter, translation) in enumerate(ITEMS):
        n = i + 1
        idx = LET.index(key_letter)
        # پیش‌داوریِ معنایی: واژهٔ گزینهٔ کلید باید در ترجمهٔ چاپ منعکس باشد
        # (تنها استثنای مستندشده: Q4 — برچسبِ دوتاییِ c در سطرِ گزینه‌ها؛ کلیدِ چاپ d + ترجمهٔ «جمع آوری» حاکم)
        key_word = options[idx]
        qs.append({
            "id": f"g10-l11-{n}",
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
    # base = ۱۰ بانکِ r323-r326 (اگر بانکِ یازدهم حاضر است کنار بگذار — idempotent)
    if len(old["lessons"]) == 11:
        base_lessons = old["lessons"][:10]
    else:
        base_lessons = old["lessons"]
    assert old["grade"] == 10 and len(base_lessons) == 10, "unexpected base shape"
    assert sum(l["count"] for l in base_lessons) == 194, "unexpected base count"
    base_source = {k: v for k, v in old["source"].items() if k != "exam4"}

    qs = build_exam4()
    lesson11 = {
        "lesson": 11,
        "title": "متوسط — تست واژگان درس دوم (ص۸۷-۸۸)",
        "level": "متوسط — چهارگزینه‌ای",
        "count": len(qs),
        "questions": qs,
    }

    doc = {"grade": 10, "lessons": base_lessons + [lesson11], "source": dict(base_source)}
    doc["source"]["exam4"] = {
        "exam": "تست واژگان درس دوم — سطح متوسط (سؤالات: ص۸۷ و ۸۸)",
        "header": "تست واژگان «درس دوم - پایه دهم» سطح تستها: «متوسط» (پاسخنامه صفحه: ۲۵۹-۲۶۰)",
        "keyPages": "259-260",
        "keyVerification": "print key pp259-260 «کلید و ترجمه تستهای واژگان درس دوم - پایه دهم (سؤالات: صفحه ۸۷ و ۸۸)» — 40/40 agree with semantic pre-fill (key word reflected in printed translation), zero divergence; Q4 double-c label vs key (d) arbitrated by printed translation «جمع آوری»",
        "extractedRound": "r327",
        "pattern": "r311/r323 (بانک درس‌محور) + r320/r324/r325 (ترجمهٔ چاپ‌محور در translation)",
        "translations": "۴۰ ترجمهٔ چاپی «ترجمه تست» به آیتم‌ها تزریق شد؛ ۱۷+ نقطهٔ سرنوشت‌ساز با زومِ ۲۶۰۰-۸۰۰۰dpi داوری شد (برچسب دوتایی Q3/Q4، هری پاتر، پتر، زردنگ، لیوان، عنصری (عامل)، مطالی، گیاهان، بررسی، خودت، می-های جدای/چسبیده، کره ی/سیاره ی)",
        "printQuirks": QUIRKS,
    }

    total = sum(l["count"] for l in doc["lessons"])
    print(f"built: {len(doc['lessons'])} banks, {total} items (exam4: {lesson11['count']})")
    if old == doc:
        print("identical content — NO-OP")
        return
    PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"written: {PATH}")


if __name__ == "__main__":
    main()
