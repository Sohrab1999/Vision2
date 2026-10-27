# -*- coding: utf-8 -*-
# r339 — استخراجِ «متوسط — تست واژگان درس سوم» جزوهٔ دهم (ص۱۲۳-۱۲۴، کلید و ترجمهٔ چاپی ص۲۷۵-۲۷۶)
# به public/jozve/tests-g10.json — عینِ الگوی r324/r325 (بانک ۵/۱۱): ۴۰ MCQ که هر آیتم
# ترجمهٔ چاپیِ «ترجمه تست» خود جزوه را در فیلد translation دارد.
# کلیدِ حرفی از گریدِ چاپِ ص۲۷۵-۲۷۶ — ۴۰/۴۰ هم‌رأی با پیش‌پرکردنِ معنایی، صفر واگرایی.
# داوری‌های رندر (۳۰۰dpi کامل ×۴ صفحه + ۳۶۰۰-۵۲۰۰dpi جراحی):
#   - سربرگِ ص۱۲۳ «تست واژگان "درس سوم - پایه دهم" سطح: "متوسط" (پاسخنامه صفحه: 275-276)» سالمِ رنگی
#   - سربرگِ ص۲۷۵ «کلید و ترجمه تستهای واژگان "درس سوم- پایه دهم" (سؤالات: صفحه 123 و 124)» —
#     لایهٔ «سؤاالت» = تجزیهٔ لایگِچرِ «سؤالات» (رندر حاکم: تمیز)
#   - Q22 «حقیقتی است» (لایه «حقیقت ی است» — رندرِ ۳۶۰۰dpi: چسبیده)
#   - Q33 «اعتقاد» (لایه + رندرِ ۵۲۰۰dpi؛ خوانشِ ۳۰۰dpi من «اعتماد» غلط بود)
#   - Q37 «هنگامیک» چاپ‌غلطِ عینِ چاپ (لایه «هنگام یکه» — رندر: یک واژهٔ چسبیده)
#   - Q24 «در 4شنبه سوری» رقمِ لاتینِ ۴ چسبیده به شنبه؛ Q34 «سال 1397» فاصله‌دار
#   - Q21 «فرمود: "زگهواره..."» کولون + گیومه (لایهٔ خام کولون را بلعیده بود)؛ «زگهواره» چسبیده عینِ چاپ
#   - Q17 هر دو اصطلاح گیومه‌دار: "رها کردن" و "ترک کردن" (لایه فقط اولی را گیومه‌دار داشت)
#   - Q31 «ماشین هایشان» فاصله‌دار با ی (لایهٔ واژه‌محور حاکم؛ اعرابِ «آتشِ/کردنِ» حذف شد — قاعدهٔ خانواده)
#   - Q28 بدونِ نقطهٔ پایانی؛ Q33 با نقطه — ناسازگاریِ خودِ چاپ
# Idempotent: اجرای دوم NO-OP (مبنا = ۵۶ بانکِ r323-r338 / ۷۳۴ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# (ساقه، گزینه‌ها، حرفِ کلیدِ چاپ، ترجمهٔ چاپی) — ساقه‌ها عینِ لایهٔ ص۱۲۳-۱۲۴
# (تیره‌ها: ۱۹ استاندارد؛ Q3 = ۱۷؛ Q37 = ۷ — کوئیرکِ چاپ مستند ولی نرمال‌شده به ۱۹ طبق الگوی r338 MCQ-14)
ITEMS = [
    ("Jack arrived home while his father was watching his ------------------- film at the living room.",
     ["interested", "famous", "favorite", "energetic"], "c",
     "جک در حالیکه پدرش مشغول تماشای فیلم مورد علاقهاش در اتاق نشیمن بود، به خانه رسید."),
    ("We’re planning to travel to Russian by ------------------- this summer. I like flying.",
     ["airplane", "boat", "ship", "train"], "a",
     "ما قصد داریم تابستان امسال با هواپیما به روسیه مسافرت کنیم. من پرواز کردن را دوست دارم."),
    ("I’m reading a book which is about ----------------- Iranian great scientists such as Avecina and Razi.",
     ["favorite", "famous", "energetic", "possible"], "b",
     "من درحال خواندن کتابی هستم که در مورد دانشمندان بزرگ ایرانی مشهور مانند ابوعلی سینا و رازی هست."),
    ("That novel was so ------------------- that I learned a lot of interesting things from it.",
     ["useful", "natural", "famous", "energetic"], "a",
     "آن رمان چنان مفید بود که من چیزهای جالب زیادی از آن یاد گرفتم."),
    ("She studies ------------------- at Tehran university. She likes to be a doctor.",
     ["invention", "novels", "research", "medicine"], "d",
     "او در دانشگاه تهران پزشکی می خواند. او دوست دارد، دکتر بشود."),
    ("A: “Who came to the school -------------------, you or your friend?”                         B: “I came first.”",
     ["later", "sooner", "at last", "finally"], "b",
     "الف: \"چه کسی زودتر به مدرسه آمد، تو یا دوستت؟\" ب: \"من اول آمدم.\""),
    ("My brother is really -------------------. He's always exercising.",
     ["successful", "useful", "famous", "energetic"], "d",
     "برادرم خیلی پر انرژی است. او همیشه ورزش می کند."),
    ("They do ------------------- in the laboratory on blood cells.",
     ["knowledge", "experiment", "science", "success"], "b",
     "آنها در آزمایشگاه روی سلولهای خونی آزمایش انجام می دهند."),
    ("Hard-work and love of God bring ------------------- for everyone.",
     ["success", "belief", "pain", "failure"], "a",
     "پشتکار و توکل بر خدا برای همه موفقیت می آورد."),
    ("Tomas Edison ------------------- the first light bulb and then became famous.",
     ["invented", "solved", "quitted", "developed"], "a",
     "توماس ادیسون اولین لامپ را اختراع کرد و بعد از آن مشهور شد."),
    ("My teacher is so helpful. He helps me in ------------------- physics problems.",
     ["developing", "solving", "growing", "building"], "b",
     "معلمم خیلی یاری رسان است. او در حل مسائل فیزیک به من کمک می کند."),
    ("My father reads some ------------------- of Hafez on Yalda night every year.",
     ["poets", "poems", "translations", "researches"], "b",
     "پدرم هر سال چند شعر حافظ را در شب یلدا می خواند."),
    ("My uncle’s ------------------- is in Behesht Zahra and I sometimes go there.",
     ["cradle", "grave", "death", "belief"], "b",
     "قبر عمویم در بهشت زهرا است و من بعضی اوقات به آنجا می روم."),
    ("He ------------------- his work sadly and went out at once.",
     ["gave up", "felt", "went out", "solved"], "a",
     "او کارش را با ناراحتی ترک کرد و فوراً بیرون رفت."),
    ("A ------------------- is a someone who spends a lot of time thinking about ideas and important problems.",
     ["thinker", "farmer", "translator", "reader"], "a",
     "یک متفکر شخصی است که وقت زیادی به فکر کردن در مورد ایده ها و مسائل مهم صرف می کند."),
    ("Many people try hard to find ------------------- about the world.",
     ["novels", "facts", "problems", "cradles"], "b",
     "بسیاری از مردم سخت تلاش می کنند که حقایق در مورد جهان را پیدا کنند."),
    ("I never give up doing research. “Give up” is the synonym of -------------------.",
     ["develop", "quit", "invent", "solve"], "b",
     "من هرگز تحقیق کردن را رها نمی کنم. \"رها کردن\" مترادف \"ترک کردن\" است."),
    ("He finally ------------------- much money from his great invention.",
     ["lost", "gained", "found", "solved"], "b",
     "او سرانجام پول زیادی از اختراع بزرگش بدست آورد."),
    ("My younger sister is interested in medicine and helping -------------------.",
     ["patients", "nurses", "speakers", "writers"], "a",
     "خواهر کوچکترم به پزشکی و کمک به بیماران علاقه مند است."),
    ("The ------------------- of science is clear for everyone. It makes our lives get better.",
     ["value", "pain", "light", "belief"], "a",
     "ارزش علم برای همه واضح است. آن (علم) باعث می شود زندگی مان بهتر شود."),
    ("“------------------- knowledge from cradle to the grave.” The Holy Prophet (PBHU) said.",
     ["Give up", "Seek", "Solve", "Use"], "b",
     "پیامبر اکرم (درود خدا بر او باد) اینچنین فرمود: \"زگهواره تا گور دانش بجوی.\""),
    ("It’s a fact that children usually ------------------- rapidly and everyone likes it.",
     ["look after", "grow up", "put aside", "take off"], "b",
     "این حقیقتی است که بچه ها معمولاً به سرعت رشد می کنند و همه این (حقیقت) را دوست دارند."),
    ("Taking photos with a ------------------- camera is so enjoyable.",
     ["energetic", "modern", "successful", "easy"], "b",
     "عکس گرفتن با دوربین مدرن خیلی لذت بخش است."),
    ("Sadly, John lost one of his eyes in Charshanbeh Souri last year. \"Sadly\" means -------------------.",
     ["unsuccessfully", "unfortunately", "fortunately", "rapidly"], "b",
     "متاسفانه، جان پارسال یکی از چشمهایش را در 4شنبه سوری از دست داد. \"متاسفانه\" هم معنی: بطور تاسف بار."),
    ("My friend didn’t ------------------- at school for three months last year because of his sickness.",
     ["quit", "solve", "attend", "invent"], "c",
     "دوستم پارسال به خاطر بیماریش به مدت سه ماه در مدرسه حضور نیافت."),
    ("Hard-work is the ------------------- to everyone’s success in the world.",
     ["key", "aim", "pain", "gain"], "a",
     "پشتکار کلید موفقیت همه در جهان است."),
    ("Corona Virus is ------------------- the world rapidly and a lot of people are getting sick.",
     ["putting side", "getting around", "going up", "filling in"], "b",
     "ویروس کرونا به سرعت در جهان در حال گسترش است و افراد زیادی مریض می شوند."),
    ("Reading and ------------------- the Holy Quran is really important and necessary for us in any age.",
     ["publishing", "reciting", "speaking", "writing"], "b",
     "خواندن و تلاوت قرآن کریم برای ما در هر سنی خیلی مهم و ضروری است"),
    ("Some great writers ------------------- their books every year.",
     ["solve", "publish", "give up", "develop"], "b",
     "بعضی از نویسندگان بزرگ، هر سال کتابهایشان را منتشر می کنند."),
    ("By learning a new language we can ------------------- some books into that language.",
     ["write", "publish", "translate", "attend"], "c",
     "با یادگیری یک زبان جدید ما می توانیم بعضی کتابها را به آن زبان ترجمه کنیم."),
    ("The firefighters always ------------------- of their car rapidly for putting out the fire.",
     ["jump out", "put aside", "fill out", "grow up"], "a",
     "آتش نشانان برای خاموش کردن آتش، همیشه به سرعت از ماشین هایشان بیرون می پرند."),
    ("For my backache, I must take some -------------------.",
     ["experiments", "medicine", "researches", "inventions"], "b",
     "من برای کمر دردم باید مقداری دارو بخورم."),
    ("The key to students’ success is having ------------------- in themselves.",
     ["research", "experiment", "belief", "invention"], "c",
     "کلید موفقیت دانش آموزان، داشتن اعتقاد به خودشان است."),
    ("My grandfather ------------------- in 1397 because of his illness.",
     ["developed", "grew up", "passed away", "attended"], "c",
     "پدر بزرگم در سال 1397 به علت بیماری اش به رحمت خدا رفت."),
    ("With a ------------------- heart I have some problems in running.",
     ["powerful", "weak", "heavy", "healthy"], "b",
     "من با یک قلب ضعیف، مشکلاتی در دویدن دارم."),
    ("The little baby sleeping in the ------------------- is so pretty.",
     ["grave", "cradle", "shelf", "table"], "b",
     "این بچه کوچک که در گهواره خوابیده، خیلی زیباست."),
    ("While I was sleeping in my bedroom at 11 last night, ------------------- I heard a loud noise and woke up rapidly.",
     ["daily", "slowly", "suddenly", "recently"], "c",
     "دیشب هنگامیک ساعت 11 در اتاق خوابم خوابیده بودم، ناگهان یک صدای بلندی شنیدم و به سرعت بیدار شدم."),
    ("As an English teacher I have great ------------------- in teaching English.",
     ["fact", "drop", "interest", "size"], "c",
     "به عنوان یک معلم انگلیسی، من علاقه زیادی به تدریس انگلیسی دارم."),
    ("He doesn’t have any ------------------- about space. He is going to learn some things about it soon.",
     ["knowledge", "belief", "creation", "sign"], "a",
     "او هیچ دانشی در مورد فضا ندارد. او می خواهد بزودی چیزهایی در مورد آن را یاد بگیرد."),
    ("Our country needs to ------------------- a new kind of energy for the future.",
     ["develop", "answer", "solve", "believe"], "a",
     "کشورمان به توسعه نوع جدیدی از انرژی برای آینده نیاز دارد."),
]

# گریدِ حرفیِ چاپِ ص۲۷۵-۲۷۶ — چهار سطرِ ۱۰تایی
KEY_LETTERS = "cabadbdbaa" + "bbbaabbbaa" + "bbbbcabbbc" + "abccbbccaa"
LET = "abcd"

RECEIPT = {
    "exam": "متوسط — تست واژگان درس سوم (ص۱۲۳-۱۲۴)",
    "header": "سربرگِ ص۱۲۳ (رندرِ ۶۰۰dpi): «تست واژگان \"درس سوم - پایه دهم\" سطح: \"متوسط\" (پاسخنامه صفحه: ۲۷۵-۲۷۶؛ عینِ چاپ با رقمِ لاتین 275-276)» — سربرگِ رنگیِ سالم؛ سربرگِ کلیدِ ص۲۷۵: «کلید و ترجمه تستهای واژگان \"درس سوم- پایه دهم\" (سؤالات: صفحه 123 و 124)» — لایهٔ «سؤاالت» = تجزیهٔ لایگِچرِ «سؤالات» (رندر حاکم: تمیز)؛ قالبِ گریدِ کلید: «.N گزینه (X) ترجمه تست: ...» با چیپِ زردِ حرف و کلیدواژه‌های قرمز درونِ ترجمه‌ها (۲۸ واژهٔ قرمز — در داده متنِ ساده ذخیره شد)",
    "keyPages": "275-276",
    "extractedRound": "r339",
    "keyVerification": "گریدِ حرفیِ چاپِ ص۲۷۵-۲۷۶ (Q1-28 در ص۲۷۵، Q29-40 در ص۲۷۶): cabadbdbaa/bbbaabbbaa/bbbbcabbbc/abccbbccaa — ۴۰/۴۰ با پیش‌پرکردنِ معنایی هم‌رأی (مثال‌های حاکم: Q6 «sooner» با «زودتر»، Q10 «اختراع»، Q22 «رشد می کنند»، Q25 «حضور نیافت»، Q27 «در حال گسترش»، Q31 «بیرون می پرند»، Q34 «به رحمت خدا رفت»، Q37 «ناگهان»، Q40 «توسعه») — صفر واگرایی؛ هر کلید هم به واژهٔ گزینه قفل شد",
    "pattern": "r324/r325 — یک بانک ۴۰MCQ به ازای آزمون؛ هر آیتم ترجمهٔ چاپیِ «ترجمه تست» در فیلد translation؛ هفدهمین گروهِ کارتِ دهم",
    "translations": "۴۰ ترجمهٔ چاپی — رونویسیِ رندر (۳۰۰dpi کامل ×۴ صفحه + ۳۶۰۰-۵۲۰۰dpi جراحی)؛ قاعدهٔ خانوادهٔ واژگان (r324/r325): بدونِ نیم‌فاصله (می کنند/می خواند فاصله‌دار)، اعرابِ چاپ حذف (آتشِ/کردنِ/کِلید)، تحریف‌های لایه ترمیم (عالقه→علاقه، معموآل→معمولاً، تالوت→تلاوت، تالش→تلاش، مشکالتی→مشکلاتی، منتسی یم→منتشر می، گسی ش→گسترش، بیر ون یم پرند→بیرون می پرند، ی دانیس→دانشی، المپ→لامپ، اخی اع→اختراع، رزش ا→ارزش، سؤاالت→سؤالات) و چاپ‌غلط‌های رندر-تأیید عیناً محفوظ (هنگامیک، 4شنبه، آمدم، زگهواره چسبیده)",
    "printQuirks": [
        "Q21: «(PBHU)» عینِ چاپ (PBUH انتظار می‌رفت — چاپ‌غلطِ مستند؛ قرینهٔ fallowingِ r337)",
        "Q2: «travel to Russian» عینِ چاپ (Russia انتظار می‌رفت)؛ Q1: «film at the living room» با at (in انتظار می‌رفت)",
        "Q15: «A ------ is a someone who...» — «a someone» عینِ چاپ (a اضافه)",
        "Q37: جای خالیِ چاپ فقط ۷ تیره در برابرِ ۱۹ تیرهٔ استاندارد (Q3 = ۱۷) — نرمال‌شده به تیرهٔ استانداردِ خانواده (الگوی r338 MCQ-14)؛ ساقه‌های دیگر عینِ چاپ",
        "Q7: آپاستروفِ مستقیمِ He's (U+0027) در برابرِ تایپوگرافیکِ ۹ آیتمِ دیگر (We’re/I’m/uncle’s/It’s/didn’t/everyone’s/students’/doesn’t) — ناسازگاریِ خودِ چاپ",
        'Q24: «"Sadly"» با گیومهٔ مستقیم (U+0022) در برابرِ گیومهٔ تایپوگرافیکِ Q6/Q17/Q21 — ناسازگاریِ خودِ چاپ؛ Sadly در ساقه ایتالیک',
        "Q17: «give up» ایتالیک+زیرخط‌دار در ساقه؛ در ترجمه هر دو اصطلاح گیومه‌دار: \"رها کردن\" مترادف \"ترک کردن\" (لایه فقط اولی را گیومه‌دار داشت — رندرِ ۴۲۰۰dpi حاکم)",
        "Q6: دیالوگِ A/B با شکافِ ستونیِ ~۲۵ فاصله‌ای در چاپ (در داده تک‌فاصله شد)؛ ترجمه با «الف:/ب:» — «آمد،» کامادار و «من اول آمدم.»",
        "Q5: «دوست دارد، دکتر بشود.» — کامای چاپ بعدِ دارد؛ Q1: «بود، به خانه رسید.» کامادار",
        'Q21: «فرمود: "زگهواره..."» کولون+گیومه (لایهٔ خام کولون را بلعیده بود — رندرِ ۳۶۰۰dpi حاکم)؛ «زگهواره» چسبیده عینِ چاپ (اصطلاحِ «ز گهواره تا گور دانش بجوی»)',
        "Q22: «حقیقتی است» (لایه «حقیقت ی است» — رندرِ ۳۶۰۰dpi چسبیده) + «بچه ها» فاصله‌دار؛ Q24: «در 4شنبه سوری» رقمِ لاتینِ ۴ چسبیده به شنبه (لایه «در4» — رندر: فاصله بعدِ در)؛ Q34: «سال 1397» فاصله‌دار با رقمِ لاتین",
        "Q33: «اعتقاد» نه «اعتماد» — لایه + رندرِ ۵۲۰۰dpi حاکم (خوانشِ اولیهٔ ۳۰۰dpi من غلط بود)؛ با نقطهٔ پایانی «است.» در حالیکه Q28 بدونِ نقطه «ضروری است» پایان می‌پذیرد — ناسازگاریِ خودِ چاپ",
        "Q37: «هنگامیک» چاپ‌غلطِ عینِ چاپ (هنگامی که انتظار می‌رفت؛ لایه «هنگام یکه» — رندرِ ۳۶۰۰dpi: یک واژهٔ چسبیده) — قرینهٔ دو-زیادِ راندِ r338",
        "Q26/Q27: کلیدواژهٔ قرمزِ «کلید»/«در حال گسترش» در گریدِ چاپ روی سطرِ برچسب جدا افتاده بود — در متنِ ترجمه سرِ جایِ درستش بازسازی شد",
        "Q31: «ماشین هایشان» فاصله‌دار با ی (لایهٔ واژه‌محور حاکم بر تردیدِ رندر)؛ اعرابِ چاپ («آتشِ نشانان»/«کردنِ») طبق قاعدهٔ خانواده حذف شد",
        "جعبهٔ «Note:» خالیِ پاصفحهٔ ص۲۷۶ با عنوانِ قرمز و ۱۶ خطِ خط‌چین (بزرگ‌تر از جعبهٔ ۴خطیِ r334/r338)",
        "پاصفحهٔ ص۱۲۳/۱۲۴: «جزوه جامع زبان انگلیسی پایه دهم» + «تألیف و گردآوری: جمال احمدی و همکاران» + «Vision One» (سربرگِ مشترکِ هر دو صفحه)",
    ],
}


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    existing = [l for l in old["lessons"] if l["lesson"] >= 57]
    if existing:
        print(f"lessons 57+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
        if old["source"].get("l3vocab") != RECEIPT:
            old["source"]["l3vocab"] = RECEIPT
            PATH.write_text(json.dumps(old, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("source.l3vocab refreshed")
        return
    assert len(old["lessons"]) == 56, f"baseline mismatch: {len(old['lessons'])} banks"
    assert sum(l["count"] for l in old["lessons"]) == 734, "baseline item count mismatch"

    qs = []
    for i, (stem, options, letter, tr) in enumerate(ITEMS):
        n = i + 1
        idx = LET.index(letter)
        assert KEY_LETTERS[i] == letter, f"Q{n}: letter {letter} != grid {KEY_LETTERS[i]}"
        assert "\u200c" not in tr, f"Q{n}: ZWNJ in translation (family rule: no ZWNJ)"
        qs.append({
            "id": f"g10-l57-{n}",
            "n": n,
            "category": "vocab",
            "question": stem,
            "options": options,
            "answer": idx,
            "translation": tr,
        })
    assert len(qs) == 40

    data = json.loads(PATH.read_text(encoding="utf-8"))
    data["lessons"].append({
        "lesson": 57,
        "title": "متوسط — تست واژگان درس سوم (ص۱۲۳-۱۲۴)",
        "level": "متوسط — چهارگزینه‌ای",
        "count": len(qs),
        "questions": qs,
    })
    data["source"]["l3vocab"] = RECEIPT

    # راستی‌آزماییِ نهایی: ۵۷ بانک / ۷۷۴ آیتم / id یگانه
    assert len(data["lessons"]) == 57
    total = sum(l["count"] for l in data["lessons"])
    assert total == 774, f"total {total} != 774"
    ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
    assert len(ids) == len(set(ids)) == 774

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: bank 57 added — {total} items in {len(data['lessons'])} banks")
    print(f"  bank 57: {data['lessons'][-1]['title']} — {data['lessons'][-1]['count']}")


if __name__ == "__main__":
    main()
