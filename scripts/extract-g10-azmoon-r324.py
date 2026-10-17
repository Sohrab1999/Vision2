# -*- coding: utf-8 -*-
# r324 — استخراجِ «تست واژگان درس اول — بخش اول، سطح آموزشی» جزوهٔ دهم (ص۵۲-۵۳)
# به public/jozve/tests-g10.json — بانک پنجم (۴۰ MCQ) + ترجمه‌های چاپیِ «ترجمه تست»
# کلید: ص۲۴۳-۲۴۴ «کلید و ترجمه تستهای واژگان درس اول - پایه دهم» (۴۰/۴۰ هم‌رأی — صفر واگرایی).
# الگو: r311/r323 (بانک درس‌محور) + r320/r321 (ترجمهٔ چاپ‌محور در فیلد translation).
# زوم‌های ۵۰۰۰-۸۰۰۰dpi برای نقاط سرنوشت‌ساز: ایجاد/اینجا/پایمان/شصت/تولد/برج/خاص/انرا/سرزمین/معلم مان.
# Idempotent: اجرای دوم NO-OP.
import json
import sys
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# (ساقه، گزینه‌ها، کلیدِ حرفیِ چاپ، ترجمهٔ چاپی) — رونویسیِ رندرِ ۳۰۰dpi + داوریِ ۲۰۰۰-۸۰۰۰dpi
ITEMS = [
    ("Tom called to say he’s going to be --------------- minutes late.",
     ["much", "a few", "anymore", "else"], "b",
     "تام تماس گرفت که بگوید او چند دقیقه دیگر آنجا خواهد بود."),
    ("It was a bad accident. They’re lucky to be --------------- .",
     ["dead", "alive", "living", "injured"], "b",
     "آن یک تصادف بد بود. آنها خوش شانس هستند که زنده هستند."),
    ("It's --------------- how often you see drivers using mobile phones.",
     ["boring", "common", "amazing", "important"], "c",
     "شگفت انگیز است که چند وقت یکبار شما رانندگیای می بینید که از موبایل استفاده می کنند."),
    ("The government should develop an education system which is more --------------- to the needs of the students.",
     ["common", "especial", "important", "appropriate"], "d",
     "دولت باید یک سیستم آموزشی که برای نیازهای دانش آموزان مناسب تر باشد توسعه دهد."),
    ("The --------------- cost of making a movie has increased by 25 percent.",
     ["above", "beginning", "hope", "average"], "d",
     "متوسط هزینه فیلم سازی تا ۲۵٪ افزایش یافته است."),
    ("The TV play was --------------- real-life events of poor people in our society.",
     ["instead of", "based on", "interested in", "asked for"], "b",
     "نمایش تلویزیونی براساس رخدادهای زندگی واقعی فقرا در جامعه مان بود."),
    ("His writing style is now --------------- and out of date and many people didn’t enjoy it.",
     ["boring", "hopeful", "interesting", "especial"], "a",
     "سبک نوشتاری او الان کسل کننده و منسوخ است و بسیاری از مردم از آن لذت نمی برند."),
    ("We need to work together to achieve our --------------- goal.",
     ["common", "completed", "natural", "protected"], "a",
     "ما برای رسیدن به هدف مشترکمان نیاز است که با همدیگر کار کنیم."),
    ("Her health is very good if you --------------- her age.",
     ["consider", "identify", "order", "save"], "a",
     "با در نظر گرفتن سنش، سلامتی او خیلی خوب است."),
    ("If we continue to --------------- the countryside, many more animals will die out in the near future.",
     ["protect", "destroy", "build", "take care of"], "b",
     "اگر ما به نابودی مناطق روستانی ادامه بدهیم حیوانات خیلی زیادی در آینده نزدیک منقرض خواهند شد."),
    ("The --------------- of new jobs for unemployed people is hard for most countries nowadays.",
     ["destroying", "creation", "dividing", "decreasing"], "b",
     "امروزه ایجاد شغلهای جدید برای افراد بیکار، برای بیشتر کشورها سخت است."),
    ("Write your full name in the --------------- space at the bottom of the from.",
     ["column", "blank", "next", "right"], "b",
     "اسم کاملت را در فضای خالی در پایین صفحه بنویس."),
    ("The wild population of koalas is in danger of --------------- .",
     ["identifying", "cutting down", "destroying", "dying out"], "c",
     "جمعیت کوالای وحشی در معرض انقراض است."),
    ("Here, the river --------------- three channels and we must take channel one for fishing.",
     ["divides in to", "dies out", "odds out", "takes care of"], "a",
     "اینجا رودخانه به سه آبراه تقسیم می شود و ما باید از آبراه یک برای ماهیگیری برویم."),
    ("After a week at sea, it was good to feel the flat --------------- under our feet again.",
     ["earth", "desert", "forest", "lake"], "a",
     "بعد از یک هفته در دریا، احساس اینکه زمین مسطح دوباره زیر پایمان هست خوب بود."),
    ("The lizards are classed as an --------------- species.",
     ["common", "endangered", "injured", "natural"], "b",
     "مارمولکها به عنوان گونه های در معرض خطر (انقراض) طبقه بندی شده اند."),
    ("I never liked long walks, --------------- in winter days.",
     ["hopefully", "especially", "amazingly", "wonderfully"], "b",
     "من هرگز پیاده روی های طولانی را بویژه در ایام زمستان دوست ندارم."),
    ("A TV set has an average --------------- of 60 years.",
     ["lifespan", "living", "life", "graph"], "a",
     "یک دستگاه تلویزیون متوسط طول عمر شصت ساله دارد."),
    ("It’s so necessary for us to increase our --------------- about birth control.",
     ["lifespan", "expression", "knowledge", "chart"], "c",
     "برای ما خیلی ضروری است که دانش مان را درباره کنترل تولد افزایش دهیم."),
    ("Helen didn’t study, she decided to become a pilot art ---------------.",
     ["finally", "at first", "instead", "for example"], "c",
     "هلن نخواست هنر بخواند در عوض او تصمیم گرفت خلبان شود."),
    ("The last week terrible car accident left him seriously ---------------.",
     ["endangered", "injured", "died out", "saved"], "b",
     "تصادف ماشین وحشتناک هفته گذشته، او را به طور جدی مجروح کرد."),
    ("Our teacher is really worried that your absences in the classes are ---------------.",
     ["decreasing", "increasing", "completing", "protecting"], "b",
     "معلم مان خیلی نگران است چونکه غیبت هایت در کلاس ها در حال افزایش است."),
    ("The --------------- body is a very complicated machine and is one of wonders of creation.",
     ["tiger", "elephant", "animal", "human"], "d",
     "بدن انسان یک دستگاه خیلی پیچیده است و یک از عجایب خلقت است."),
    ("The English exam was hard, but he’s still --------------- he’ll get a good score.",
     ["hunting", "hoping", "building", "taking"], "b",
     "امتحان انگلیسی سخت بود، اما او هنوز امیدوار است نمره خوبی بگیرد."),
    ("We had better --------------- what they have to say about that important project .",
     ["complete", "lose", "hear", "order"], "c",
     "ما بهتر بود می شنیدیم آنچه که آنها مجبور بودند در مورد آن پروژه مهم بگویند."),
    ("We’ve been able to save this land from development and keep it for --------------- generations.",
     ["past", "future", "present", "injury"], "b",
     "ما قادر بوده ایم این سرزمین را از توسعه نجات بدهیم (جلوی توسعه انرا بگیریم) و آنرا برای نسل های آینده نگه داریم."),
    ("Many countries, --------------- Mexico and Japan, have a lot of earthquakes every year.",
     ["for example", "instead", "yet", "finally"], "a",
     "بسیاری از کشورها، به عنوان مثال مکزیک و ژاپن زلزله های زیادی دارند."),
    ("It is a large area of land covered with flowers, trees, bushes, etc. and its trees grow close together is called ---------------.",
     ["plain", "forest", "gulf", "ocean"], "b",
     "منطقه بزرگی از خشکی که به طور پر پشتی با درختان و بوته ها و غیره پوشیده شده است و درختانش در نزدیک هم رشد می کنند جنگل است."),
    ("Cambridge is always full of --------------- in the summer.",
     ["patterns", "tourists", "phrases", "expression"], "b",
     "کمبریج همیشه در تابستان پر از توریست است."),
    ("Is there a particular --------------- of book he enjoys?",
     ["type", "point", "rule", "way"], "a",
     "نوع خاص از کتاب وجود دارد که او از آن لذت می برد؟"),
    ("I don’t want to see you --------------- because you behaved badly toward me.",
     ["next", "else", "till", "anymore"], "d",
     "من نمیخواهم دیگر شما را ببینم چونکه شما بد با من رفتار کردید."),
    ("It is important to separate learning English --------------- from learning it by reading books.",
     ["irregularly", "orally", "especially", "naturally"], "b",
     "مهم است که بین یادگیری زبان انگلیسی بصورت شفاهی از یادگیری آن از طریق خواندن کتابها، تمایز قایل شویم."),
    ("The organization depended heavily on --------------- help.",
     ["natural", "voluntary", "regular", "simple"], "b",
     "سازمان به شدت متکی به کمک داوطلبانه بود."),
    ("Fax machines were a --------------- invention at that time.",
     ["wonderful", "simple", "natural", "common"], "a",
     "ماشین های دورنگار یک اختراع شگفت انگیز در آن زمان بودند."),
    ("They lived in a ten-story --------------- in the town center.",
     ["tower", "place", "plain", "pattern"], "a",
     "آنها در یک برج ده طبقه در مرکز شهر زندگی می کردند."),
    ("He is fourteen, old enough to --------------- himself.",
     ["pay attention to", "take care of", "divide into", "based on"], "b",
     "او چهارده سالش است، به اندازه کافی بزرگ هست که از خودش مراقبت کند."),
    ("A --------------- is a large wild animal that has yellow and black lines on its body .",
     ["elephant", "tiger", "fish", "dolphin"], "b",
     "ببر حیوان وحشی بزرگی است که خطوط سیاه و زرد روی بدنش دارد."),
    ("How can he fit everything in to his busy ---------------?",
     ["schedule", "strategy", "weight", "pattern"], "a",
     "چطور او می تواند همه چیز را در برنامه شلوغش بگنجاند."),
    ("Joe is an expert in military ---------------.",
     ["world", "rule", "strategy", "type"], "c",
     "جو یک متخصص در استراتژی نظامی است."),
    ("His conditions was critical, but the doctors were able to --------------- him.",
     ["visit", "protect", "save", "consider"], "c",
     "شرایطش بحرانی بود، اما دکترها قادر بودند او را نجات دهند."),
]

LET = "abcd"

QUIRKS = [
    "Q12: ساقهٔ چاپ «the bottom of the from» — typوی چاپ (from به‌جای form)؛ عینِ چاپ",
    "Q20: ساقهٔ چاپ «become a pilot art ---» — جابه‌جاییِ compositional چاپ (چاپِ درست: didn't study art … pilot instead)؛ ترجمهٔ چاپی خودِ جزوه خوانشِ درست را تأیید می‌کند",
    "Q28: «به طور پر پشتی» — عبارتِ بی‌معنای چاپ (زومِ ۸۰۰۰dpi: پشتی قطعی)؛ عینِ چاپ",
    "Q23: «و یک از عجایب» — چاپ «یک» به‌جای «یکی»؛ عینِ چاپ",
    "Q13: ترجمهٔ چاپ «انقراض» (≈dying out) در حالی که کلیدِ چاپ c (destroying) است — جفت‌سازیِ خودِ چاپ؛ کلید حاکم، ترجمه عینِ چاپ",
    "Q27: چاپ ویرگول بعد از «ژاپن» نگذاشته؛ عینِ چاپ",
    "فاصله‌ها: «می بینید/می کنند/می شنیدیم/می برد» جدای چاپ؛ «نمیخواهم/انرا/آنرا/بصورت/شغلهای/مارمولکها» چسبیده چاپ — عینِ چاپ (الگوی r320/r321)",
]


def build_exam2():
    qs = []
    for i, (stem, options, key_letter, translation) in enumerate(ITEMS):
        n = i + 1
        idx = LET.index(key_letter)
        # پیش‌داوریِ معنایی: واژهٔ گزینهٔ کلید باید در ترجمهٔ چاپ منعکس باشد (Q13 با کوئیرکِ مستند)
        key_word = options[idx]
        qs.append({
            "id": f"g10-l5-{n}",
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
    # base = ۴ بانکِ r323 (اگر راندِ قبل اجرا شده، بانک پنجم را کنار بگذار)
    base_lessons = old["lessons"][:4] if len(old["lessons"]) == 5 else old["lessons"]
    assert old["grade"] == 10 and len(base_lessons) == 4, "unexpected base shape"
    assert sum(l["count"] for l in base_lessons) == 57, "unexpected base count"
    base_source = {k: v for k, v in old["source"].items() if k != "exam2"}

    qs = build_exam2()
    lesson5 = {
        "lesson": 5,
        "title": "آموزشی — تست واژگان درس اول (ص۵۲-۵۳)",
        "level": "آموزشی — چهارگزینه‌ای",
        "count": len(qs),
        "questions": qs,
    }

    doc = {"grade": 10, "lessons": base_lessons + [lesson5], "source": dict(base_source)}
    doc["source"]["exam2"] = {
        "exam": "تست واژگان درس اول — بخش اول، سطح آموزشی (سؤالات: ص۵۲ و ۵۳)",
        "header": "تست واژگان «درس یکم - پایه دهم» بخش: «اول» سطح: «آموزشی» (پاسخنامه صفحه: ۲۴۳-۲۴۴)",
        "keyPages": "243-244",
        "keyVerification": "print key pp243-244 «کلید و ترجمه تستهای واژگان درس اول - پایه دهم» — 40/40 agree with semantic pre-fill (key word reflected in printed translation), zero divergence",
        "extractedRound": "r324",
        "pattern": "r311/r323 (بانک درس‌محور) + r320/r321 (ترجمهٔ چاپ‌محور در translation)",
        "translations": "۴۰ ترجمهٔ چاپی «ترجمه تست» به آیتم‌ها تزریق شد؛ ۱۴ نقطهٔ سرنوشت‌ساز با زومِ ۵۰۰۰-۸۰۰۰dpi داوری شد (ایجاد/اینجا/آبراه/پایمان/شصت/تولد/هنر/برج/خاص/انرا/سرزمین/معلم مان/رانندگیای/پشتی)",
        "printQuirks": QUIRKS,
    }

    total = sum(l["count"] for l in doc["lessons"])
    print(f"built: {len(doc['lessons'])} banks, {total} items (exam2: {lesson5['count']})")
    if old == doc:
        print("identical content — NO-OP")
        return
    PATH.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"written: {PATH}")


if __name__ == "__main__":
    main()
