# -*- coding: utf-8 -*-
# r347 — استخراجِ ادامهٔ خانوادهٔ درس چهارم دهم به public/jozve/tests-g10.json:
#   بانک ۸۲: «تمرین حروف اضافه "مکان" و "زمان"» ص۱۵۸ (۸ آیتم تایپیِ سه‌گزینه‌ای، کلیدِ درون‌صفحه‌ای Answer Key)
#   بانک ۸۳-۸۷: «آزمون تشریحی گرامر درس چهارم» ص۱۶۱-۱۶۲ (پنج سکشن — کلیدِ چاپی ص۲۹۰)
#     ۸۳: بخش ۱ — زیر گزینه صحیح خط بکشید (۱۰ دونگزینه‌ای — الگوی بانک ۷۶)
#     ۸۴: بخش ۲ — پرکردن با can / may / should / must (۱۰ تایپی — الگوی بانک ۷۷)
#     ۸۵: بخش ۳ — اصلاح خطا (۵ تایپی)
#     ۸۶: بخش ۴ — جمله‌سازی (۵ تایپی — الگوی بانک ۵۹)
#     ۸۷: بخش ۵ — حروف اضافه زمان in / at / on (۱۰ تایپی)
#   بانک ۸۸: «۲۰ تست آموزشی گرامر و نگارش "درس چهارم - پایه دهم"» ص۱۶۳ — ۲۰ MCQ با ترجمهٔ چاپی
#     (کلیدِ توضیح‌دارِ ص۲۹۱-۲۹۲ به الگوی r339/r343/r346)
# کلید: S1=a,b,a,b,a,a,b,b,a,b | MCQ=d,c,d,c,c,b,c,d,b,a,d,c,b,b,c,a,a,c,a,b — همه با پیش‌پرکردنِ
# معنایی هم‌رأی — صفر واگرایی.
# کشفِ چاپ‌خطا: کلیدِ ص۲۹۰ بخشِ ۶ (برای تمرینِ ص۱۵۸) ۱۲ سطر دارد ولی تمرین ۸ آیتمی است + واگرایی
# در آیتم ۵ (ص۲۹۰: on، خودِ Answer Keyِ ص۱۵۸: in — «in the world» درست است) — کلیدِ درون‌صفحه‌ای حاکم (قاعدهٔ r344).
# داوری‌های رندر (۹۰۰-۸۰۰۰dpi): سربرگ‌ها، «آسانی»+«نیپرسید» (غلطِ چاپ Q11)، «وقتی/کنی»، «خوبی»،
# «مطمئن»، «سریعی»، «سرکار»، «شهریورماه ماه ۹۹»، «دستگریمی» (سربرگ کلید در برابرِ «آموزشی» سربرگ آزمون).
import json
import re
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")


def d(n: int) -> str:
    return "-" * n


# ---------- بانک ۸۲ — تمرین حروف اضافه ص۱۵۸ (تایپی؛ تیره‌ها ۱۴) ----------
DRILL = [
    (f"My cousin lives {d(14)} (on / in / at) a small village {d(14)} (on / in / at) the mountains.",
     ["in / in", "on / in", "in / on", "at / on"], "in / in"),
    (f"I work {d(14)} (on / in / at) a bank but my sister works {d(14)} (on / in / at) a store.",
     ["in / in", "at / in", "in / at", "on / at"], "in / in"),
    (f"My grandfather was born {d(14)} (on / in / at) Tehran {d(14)} (on / in / at) 1320.",
     ["in / in", "on / in", "in / at", "at / in"], "in / in"),
    (f"{d(14)} (On / In / At) Friday night I went to bed {d(14)} (on / in / at) midnight.",
     ["On / at", "In / at", "On / in", "At / on"], "On / at"),
    (f"What’s the longest river {d(14)} (on / in / at) the world?", ["in", "on", "at"], "in"),
    (f"It was a lovely day. There wasn’t a cloud {d(14)} (on / in / at) the sky.", ["in", "at", "on"], "in"),
    (f"It’s difficult to carry a lot of things {d(14)} (on / in / at) a bicycle.", ["on", "in", "at"], "on"),
    (f"Did you go anywhere interesting {d(14)} (on / in / at) vacation?", ["on", "at", "in"], "on"),
]
# کلیدِ چاپیِ درون‌صفحه‌ایِ ص۱۵۸ (Answer Key جدول ۲×۴)
DRILL_KEY = "in / in | in / in | in / in | On / at | in | in | on | on"

# ---------- بانک ۸۳ — بخش ۱ ص۱۶۱ (۱۰ دونگزینه‌ای؛ تیره‌ها ۳۳) ----------
S1 = [
    (f"He is speaking very quietly. I {d(33)} him. (can’t hear / couldn’t hear)",
     ["can’t hear", "couldn’t hear"], "can’t hear"),
    (f"I wanted to speak to you yesterday, but I {d(33)} you. (can’t find / couldn’t find)",
     ["can’t find", "couldn’t find"], "couldn’t find"),
    (f"Ali is a good translator because he {d(33)} three languages. (can speak / could speak)",
     ["can speak", "could speak"], "can speak"),
    (f"I was tired, but I {d(33)}. (can’t sleep / couldn’t sleep)",
     ["can’t sleep", "couldn’t sleep"], "couldn’t sleep"),
    (f"I’m sorry but we {d(33)} to your party next Friday. (can’t come / couldn’t come)",
     ["can’t come", "couldn’t come"], "can’t come"),
    (f"I like this hotel room. You {d(33)} the mountains from the window. (can see / could see)",
     ["can see", "could see"], "can see"),
    (f"Ali {d(33)} to school last week. He was sick. (can’t go / couldn’t go)",
     ["can’t go", "couldn’t go"], "couldn’t go"),
    (f"I had a party last night, but two of my friends {d(33)}. (can’t come / couldn’t come)",
     ["can’t come", "couldn’t come"], "couldn’t come"),
    (f"Ali doesn’t know what to do. He {d(33)}. (can’t decide / couldn’t decide)",
     ["can’t decide", "couldn’t decide"], "can’t decide"),
    (f"I wasn’t hungry yesterday. I {d(33)} my dinner. (can’t eat / couldn’t eat)",
     ["can’t eat", "couldn’t eat"], "couldn’t eat"),
]
S1_GRID = "ababaabbab"  # کلیدِ گریدِ ص۲۹۰ (حرفِ گزینهٔ چاپی: اول/دوم)

# ---------- بانک ۸۴ — بخش ۲ ص۱۶۱ (۱۰ تایپی؛ تیره‌ها ۱۸؛ بانکِ واژه can/may/should/must) ----------
BANK_MODALS = ["can", "may", "should", "must"]
S2 = [  # (ساقه، کلید چاپی ص۲۹۰)
    (f"People in the front seat of a car {d(18)} wear a seat belt.", "must"),
    (f"That coat is too big for you. I don’t think you {d(18)} buy it.", "should"),
    (f"A: How are you going to get home tonight?           B: I’m not sure. I {d(18)} take a taxi.", "may"),
    (f"Ali {d(18)} speak French, but he can’t speak English.", "can"),
    (f"It’s a very good novel. You {d(18)} read it.", "should"),
    (f"The phone is ringing. I know it’s not for me. It {d(18)} be for you.", "must"),
    (f"You worked ten hours today. You {d(18)} be tired.", "must"),
    (f"I {d(18)} come and see you tomorrow if you like.", "can"),
    (f"A: Where’s your brother?                     B: I don’t know. He {d(18)} be in his office.", "may"),
    (f"We haven’t got much time. We {d(18)} hurry.", "must"),
]
S2_ROTATION = [  # چرخشِ بانکِ واژه (r338) — کلید نخست
    ["must", "can", "may", "should"], ["should", "must", "can", "may"],
    ["may", "should", "must", "can"], ["can", "may", "should", "must"],
    ["should", "may", "must", "can"], ["must", "should", "may", "can"],
    ["must", "may", "can", "should"], ["can", "must", "may", "should"],
    ["may", "can", "must", "should"], ["must", "can", "should", "may"],
]

# ---------- بانک ۸۵ — بخش ۳ ص۱۶۱ (۵ اصلاحِ خطا؛ پرانتزِ ۲۵تیره‌ای) ----------
S3 = [  # (ساقه با پرانتزِ خالیِ چاپی، تصحیحِ چاپی ص۲۹۰، شکلِ غلط)
    (f"I don’t want anyone to know about our plan. You mustn’t told anyone. ({d(25)})", "tell", "told"),
    (f"He mustn’t does more exercises. His heart is very weak. ({d(25)})", "do", "does"),
    (f"You should listen to loud music. It hurts your ears. ({d(25)})", "shouldn’t", "should"),
    (f"I was sitting at the back of the theatre and can’t hear very well. ({d(25)})", "couldn’t", "can’t"),
    (f"As a tourist, we be should careful about our behavior in a foreign country. ({d(25)})", "should be", "be should"),
]

# ---------- بانک ۸۶ — بخش ۴ ص۱۶۲ (۵ جمله‌سازی؛ الگوی بانک ۵۹) ----------
S4 = [  # (مجموعهٔ کلماتِ چاپی، کلیدِ چاپیِ ص۲۹۰، سه چیدمانِ替代ِ غلط)
    ("should / wildlife / students / about / learn / saving.",
     "students should learn about saving wildlife.",
     ["students should learn saving about wildlife.", "students should saving learn about wildlife.",
      "wildlife should learn about saving students."]),
    ("buy / next year / may / new / our family / car / a.",
     "Our family may buy a new car next year.",
     ["Our family may buy next year a new car.", "Our new family may buy a car next year.",
      "A new family may buy our car next year."]),
    ("without / long / a / camels / water / can / time / live / for.",
     "Camels can live without water for a long time.",
     ["Camels can live without for water a long time.", "Camels can water without live for a long time.",
      "Camels can live a long water without for time."]),
    ("successful / mustn’t / if / weak / you / you / feel / want to be.",
     "You mustn’t feel weak if you want to be successful.",
     ["You mustn’t feel successful if you want to be weak.", "You mustn’t want to feel weak if you be successful.",
      "You mustn’t be feel weak if you want to successful."]),
    ("to / music / not / we / listen / should / loud.",
     "We should not listen to loud music.",
     ["We should listen not to loud music.", "We should not to listen loud music.",
      "We not should listen to loud music."]),
]

# ---------- بانک ۸۷ — بخش ۵ ص۱۶۲ (۱۰ تایپی؛ تیره‌ها ۱۰) ----------
BANK_PREP = ["in", "at", "on"]
S5 = [  # (ساقه، کلید چاپی ص۲۹۰)
    (f"I’m taking a trip {d(10)} April.", "in"),
    (f"We’re having a party {d(10)} Friday.", "on"),
    (f"My birthday is {d(10)} the end of January.", "at"),
    (f"This street is always busy, even {d(10)} night.", "at"),
    (f"It’s difficult to listen if everyone is speaking {d(10)} the same time.", "at"),
    (f"My father usually wakes up {d(10)} 5 o’clock {d(10)} the morning.", "at / in"),
    (f"When we were {d(10)} vacation, we visited some very interesting places.", "on"),
    (f"Neil Armstrong was the first man to walk on the moon {d(10)} 21 July 1969.", "on"),
    (f"My favorite restaurant is open {d(10)} the evening. It closes {d(10)} midnight.", "in / at"),
    (f"I’ve got an interview tomorrow. It’s {d(10)} ten o’clock {d(10)} Monday morning.", "at / on"),
]
S5_ROTATION = [
    ["in", "at", "on"], ["on", "in", "at"], ["at", "on", "in"], ["at", "in", "on"],
    ["at", "on", "in"], ["at / in", "in / at", "on / in", "at / on"],
    ["on", "at", "in"], ["on", "in", "at"],
    ["in / at", "at / in", "in / on", "on / at"], ["at / on", "on / at", "at / in", "in / on"],
]

# ---------- بانک ۸۸ — ۲۰ تست ص۱۶۳ (MCQ با ترجمهٔ چاپیِ ص۲۹۱-۲۹۲) ----------
def q1_stem():
    return f"When I was a child I {d(19)} climb the trees easily but now I can’t."

MCQ = [
    (q1_stem(), ["might", "should", "can", "could"], "d",
     "وقتیکه بچه بودم میتوانستم به آسان از درختان بالا بروم اما الان نمیتوانم."),
    ('A: “Why isn’t Ali in class?”                               B: “I don’t know. He  ' + d(17) + ' be sick today.”',
     ["can", "should", "may", "must"], "c",
     "- چرا علی در کلاس نیست؟   - نمیدونم. شاید امروز مریض باشد."),
    (f"Don’t touch my school things. When I’m not at home, you  {d(18)} use my books.",
     ["should", "could", "might", "can"], "d",
     "به وسائل مدرسه ام دست نزن. وقتی در خانه نیستم، تو اجازه داری از کتابهای من استفاده کنی."),
    (f"I don’t allow you to leave the class. You {d(17)} go out after doing your homework.",
     ["should", "must", "may", "will"], "c",
     "من به تو اجازه نمیدهم که کلاس را ترک کنی. وقتی که تکالیفت را انجام دادی، اجازه داری بیرون بروی."),
    ('A: “I’m going to be late for the bus, what  ' + d(19) + ' I do?”                   B: “You can take a taxi.”',
     ["can", "may", "should", "must"], "c",
     "- داره برای اتوبوس دیرم میشه. چکار باید بکنم؟   - تو میتوانی تاکسی بگیری."),
    (f"All foreign passengers  {d(21)} present their passports at the airport.",
     ["should", "must", "can", "could"], "b",
     "همه مسافران خارج باید پاسپورت هایشان را در فرودگاه ارائه دهند."),
    ('A: “Why isn’t Raman at home?”                        B: “I’m not sure. He  ' + d(17) + ' be in the library.”',
     ["can", "must", "may", "should"], "c",
     "– چرا رامان در خانه نیست؟   - مطمئن نیستم. شاید در کتابخانه باشد."),
    ('A: “ ' + d(17) + ' I borrow your pen?”                 B: “Yes, of course.”',
     ["Should", "Would", "Must", "Can"], "d",
     "- میتونم (اجازه دارم) خودکارت را قرض بگیرم؟   - بله، البته."),
    (f"She’s a good writer. She writes interesting novels  {d(17)}.",
     ["good", "well", "quiet", "worse"], "b",
     "او نویسنده خوب است. او رمان های جالب را به خوبی مینویسد."),
    (f"My brother is a fast driver. He always drives  {d(17)}.",
     ["fast", "good", "slowly", "polite"], "a",
     "برادرم راننده سریعی است. او همیشه به سرعت رانندگی میکند."),
    (f"The teacher didn’t ask an easy question. I answered it  {d(17)}.",
     ["quick", "good", "easy", "hard"], "d",
     "معلم سوال آسانی را نیپرسید. من آن را به سختی جواب دادم."),
    (f"Ali spoke with the tourists well. Actually, he answered all their questions  {d(17)}.",
     ["good", "polite", "politely", "carelessly"], "c",
     "علی با گردشگران به خوبی صحبت کرد. در واقع او همه سؤالات آنها را مؤدبانه جواب داد."),
    (f"I always go to the park  {d(15)} the sunset to walk and do exercise.",
     ["in", "at", "to", "on"], "b",
     "من همیشه در هنگام غروب آفتاب برای قدم زدن و ورزش کردن به پارک میروم."),
    (f"When I was {d(12)} work yesterday, I had an important phone call.",
     ["in", "at", "on", "to"], "b",
     "دیروز هنگامیکه در سرکار بودم، یک تماس تلفنی مهم داشتم."),
    (f"The children were  {d(16)} home this morning.",
     ["to", "in", "at", "on"], "c",
     "امروز صبح بچه ها در خانه بودند."),
    (f"We are going to visit Mazandaran  {d(16)} Shahrivar 22, 1400.",
     ["on", "in", "to", "at"], "a",
     "ما قصد داریم در ۲۲ شهریورماه ماه ۹۹ از مازندران دیدن کنیم."),
    (f"They will visit their cousins  {d(14)} the holiday  {d(14)} spring.",
     ["on / in", "in / in", "on / at", "at / in"], "a",
     "آنها در تعطیلات در فصل بهار عموزاده های خود را ملاقات خواهند کرد."),
    (f"Are you going to invite your friends  {d(15)} your birthday  {d(14)} Khordad?",
     ["in / in", "in / on", "on / in", "at / in"], "c",
     "آیا قصد داری که دوستانت را در روز تولدت در خرداد ماه دعوت کنی؟"),
    (f"I always go to the gym  {d(15)} bus  {d(13)} the afternoon.",
     ["by / in", "at / in", "at / at", "by / on"], "a",
     "من همیشه در بعد از ظهرها با اتوبوس به باشگاه میروم."),
    (f"Next year, we will be  {d(14)} Korea  {d(13)} holiday.",
     ["in / in", "in / on", "in / at", "at / in"], "b",
     "سال آینده در تعطیلات ما در کشور کره خواهیم بود."),
]
# گرید به‌صورتِ فهرستِ صریح (درسِ r343/r346: رشتهٔ دست‌نویسِ طولانی ممنوع) — هر حرف از گریدِ
# چاپیِ «N- گزینه(x)» در ص۲۹۱ (۱-۱۵) و ص۲۹۲ (۱۶-۲۰) — ۲۰/۲۰ با پیش‌پرکردنِ معنایی هم‌رأی
MCQ_GRID = [
    "d", "c", "d", "c", "c", "b", "c", "d",   # ص۲۹۱: گریدهای ۱-۸
    "b", "a", "d", "c",                        # ص۲۹۱: گریدهای ۹-۱۲
    "b", "b", "c",                             # ص۲۹۱: گریدهای ۱۳-۱۵
    "a", "a", "c", "a", "b",                   # ص۲۹۲: گریدهای ۱۶-۲۰
]
assert len(MCQ_GRID) == 20, len(MCQ_GRID)

RECEIPT = {
    "exam": "ادامهٔ خانوادهٔ درس چهارم — تمرین حروف اضافه ص۱۵۸ + آزمون تشریحی گرامر ص۱۶۱-۱۶۲ + ۲۰ تست آموزشی ص۱۶۳",
    "header": (
        "ص۱۵۸: تمرینِ «تمرین حروف اضافه \"مکان\" و \"زمان\": زیر گزینه ی صحیح خط بکشید.» — باندِ زرد، «مکان» و «زمان» سرخ در گیومه، "
        "جاهای خالیِ سبزِ خط‌چین، گزینه‌های سرمه‌ایِ «(on / in / at)»، عبارت‌های کلیدیِ زیرخط‌دار، Answer Key جدولیِ ۲×۴ "
        "«Answer Key:» سرخِ ایتالیک روی باند سبز با ارقام سرخ — کلیدِ درون‌صفحه‌ای. "
        "ص۱۶۱ (رندر ۹۰۰dpi): سربرگِ «آزمون تشریحی گرامر درس چهارم» سرخ در گیومه روی باند سبز + «(پاسخنامه صفحه: ۲۹۰)» با ارقامِ "
        "فارسیِ سرخ و دونقطه بعدِ «صفحه:» (دهمین «تسی یچ» لایه — رندر تمیز). "
        "ص۱۶۳: سربرگِ «۲۰ تست آموزشی گرامر و نگارش \"درس چهارم - پایه دهم\"» — «۲۰ تست آموزشی گرامر و نگارش» سرخ + نقل‌قولِ سیاهِ "
        "خط‌تیره‌فاصله‌دار + «(پاسخنامه صفحه ۲۹۱ - ۲۹۲)» ارقامِ فارسیِ سرخ با خط‌تیره و بدونِ دونقطه (ناسازگاریِ درونیِ چاپ با ص۱۶۱). "
        "کلیدِ ص۲۹۰: «\"پاسخنامه آزمون تشریحی گرامر درس چهارم\"» سرخ در گیومه + «(آزمون: صفحه ۱۶۱ و ۱۶۲)» ارقامِ فارسی با واصفِ «و» و دونقطه بعدِ «آزمون:» (لایه «1۶1 و1۶2» مخلوط — رندر همه‌فارسی). "
        "کلیدِ ص۲۹۱: «پاسخنامه تستهای دستگریمی گرامر و نگارش \"درس چهارم – پایه دهم\"» — سیاهِ توپُر + نقل‌قولِ سرخ با خطِ «–» + "
        "«(سؤالات: صفحه ۱۶۳)» ارقامِ فارسی؛ «دستگریمی» در برابرِ «آموزشی» سربرگِ آزمون — ناسازگاریِ درونیِ چاپ (رندرِ ۳۰۰۰dpi حاکم). "
        "گریدهای ص۲۹۱-۲۹۲: «N- گزینه(x)» با chipِ زرد + حرفِ کادردار + توضیحِ گرامری + مثال‌های نمونه‌دار (Q9/Q10/Q11 با خطِ «He always drives fast.» زیرخط‌دار و برچسبِ قید حالت/فعل) + chipِ سبزِ «ترجمه تست:» + ترجمهٔ آبیِ توپُر در گیومه + جداکنندهٔ خط‌چینِ سرخ؛ کلیدواژه‌های can/may/should/must/on/in/at/by سرخِ توپُرِ زیرخط‌دار."
    ),
    "keyPages": "158 (درون‌صفحه‌ای), 290, 291-292",
    "extractedRound": "r347",
    "keyVerification": (
        "S1: ده گریدِ فهرستیِ ص۲۹۰ (can’t hear/…/couldn’t eat) → گریدِ ababaabbab — ۱۰/۱۰ هم‌رأی. "
        "S2: ده گریدِ فهرستی (must/should/may/can/should/must/must/can/may/must) — ۱۰/۱۰. "
        "S3: پنج گریدِ جمله‌دار با تصحیحِ سرخِ پرانتزی: (tell)/(do)/(shouldn’t)/(couldn’t)/(should be) — ۵/۵. "
        "S4: پنج جملهٔ کلیدیِ چاپی (students should…/Our family may…/Camels can…/You mustn’t…/We should not…) — ۵/۵. "
        "S5: ده گرید (in/on/at/at/at/at-in/on/on/in-at/at-on) — ۱۰/۱۰. "
        "MCQ: بیست گریدِ توضیح‌دارِ «N- گزینه(x) … :ترجمه تست» → گریدِ dcdccbcdbadcbbcaacab — ۲۰/۲۰ با پیش‌پرکردنِ معنایی — صفر واگرایی. "
        "تمرینِ ص۱۵۸: Answer Key جدولیِ خودِ صفحه (in-in/in-in/in-in/On-at/in/in/on/on) — ۸/۸؛ کلیدِ ص۲۹۰ بخشِ ۶ همان تمرین را ۱۲سطری می‌زند (چاپ‌خطا — پایین)."
    ),
    "pattern": "r344 (دونگزینه‌ای) + r345 (تایپیِ بانک‌واژه) + r340 (سکشن‌محور) + r346 (MCQ ترجمه‌دار) — بیست‌وششم تا بیست‌وهشتمین گروهِ کارتِ دهم",
    "printErrata": [
        "چاپ‌خطایِ کلیدی: «پاسخنامه آزمون تشریحی گرامر» ص۲۹۰ برای تمرینِ ص۱۵۸ یک «بخش ۶» ۱۲سطری می‌زند (جدول ۳×۴: in/in، in/in، in/in، On/at، on، in، on، on، on، in، on، at) در حالی که تمرین ۸ آیتمی است و Answer Keyِ درون‌صفحه‌ای خودش ۸ سطر دارد — سطرهای ۹-۱۲ (on/in/on/at) شبح‌اند و آیتمِ ۵ واگراست (ص۲۹۰: on؛ ص۱۵۸: in — «in the world» درست است) → کلیدِ درون‌صفحه‌ای حاکم (قاعدهٔ r344)؛ ص۲۹۰ املایِ بی‌فاصلهٔ «in/in» و ص۱۵۸ «in / in» فاصله‌دار",
        "غلطِ چاپیِ ترجمهٔ Q11: «نیپرسید» (دندانِ اضافی — نپرسید درست است) — داوریِ ۴۵۰۰-۸۰۰۰dpi: دو دندانِ میانِ ن و پ + تجزیهٔ لایهٔ «نی  سید» (افتِ پ) — سومین عضوِ خانوادهٔ غلطِ چاپ (درحایل r343، حایل r341)؛ عینِ چاپ نگه داشته شد",
        "«آسانی» Q11 با یِ نکره — داوریِ ۸۰۰۰dpi (لایه «آسابن» گمراه‌کننده)؛ «سوال» بی‌یِ نکره در همان جمله — عینِ چاپ",
        "سربرگِ کلیدِ ص۲۹۱ «تستهای دستگریمی» در برابرِ سربرگِ آزمونِ ص۱۶۳ «۲۰ تست آموزشی» — ناسازگاریِ درونیِ چاپ (عضوِ سومِ خانوادهٔ r344: حالتی/حالت)",
        "«(پاسخنامه صفحه: ۲۹۰)» ص۱۶۱ با دونقطه، «(پاسخنامه صفحه ۲۹۱ - ۲۹۲)» ص۱۶۳ بی‌دونقطه — ناسازگاریِ درونیِ چاپ",
        "ترجمهٔ Q16 «در ۲۲ شهریورماه ماه ۹۹» — «ماه» تکراری عینِ چاپ (رندرِ ۱۸۰۰dpi) + ارقامِ فارسی (لایه لاتین 22/99)",
        "ترجمهٔ Q7 با خطِ «–» بلند (نیم‌فاصله‌ای متفاوت از «-» کوتاهِ Q2/Q5/Q8) — عینِ چاپ؛ داوریِ رندر",
        "S4 آیتمِ ۵ چاپ: «5------…------.» شمارهٔ چسبیده به تیره‌ها (عینِ الگویِ «11.The» r346 — رسید)؛ سطرهای پاسخ ۱۰۶تیره‌ای — فقط رسید",
        "جداکننده‌های سرخِ ۹۸تیره‌ایِ ص۱۶۳ پس از Q8 و Q12 (مرزِ سه بلوکِ ناقص/قید/حرف اضافه) — رسید",
        "جعبهٔ «Note:» خالیِ ص۱۶۲ (سرخِ ایتالیکِ زیرخط‌دار + خط‌های بنفشِ خط‌چین — الگوی r345/r346) و پاصفحه‌های ص۱۵۸/۱۶۱/۱۶۲/۱۶۳/۲۹۰/۲۹۱/۲۹۲ بدونِ Telegram",
    ],
    "printQuirks": [
        "تیره‌شماریِ لایه: S1 ده ران × ۳۳؛ S2 ده ران × ۱۸؛ S3 پنج پرانتز × ۲۵؛ S5 تک‌ران‌ها ۱۰ (دوتایی‌ها ۱۰+۱۰)؛ تمرین ص۱۵۸: ۱۴ (دوتایی ۱۴+۱۴)؛ ص۱۶۳: Q1=۱۹ (سه رانِ لایه‌ای ۷+۲+۱۰ — یک خالیِ پیوسته در رندر)، Q2/Q7/Q8/Q9/Q10/Q11/Q12=۱۷، Q3=۱۸، Q4=۱۷، Q5=۱۹، Q6=۲۱، Q13=۱۵، Q14=۱۲، Q15/Q16=۱۶، Q17=۱۴+۱۴، Q18=۱۵+۱۴، Q19=۱۵+۱۳، Q20=۱۴+۱۳",
        "فاصلهٔ دوگانهٔ سیستماتیکِ پیش از خالی در ص۱۶۳: Q2/Q3/Q5/Q6/Q7/Q9/Q10/Q11/Q12/Q13/Q15/Q16/Q17/Q18/Q19/Q20 — عینِ چاپ؛ Q1 و Q4 تک‌فاصله",
        "گپ‌های گفتگوی چاپی (لایه، لاتین — بدونِ خطای bidi): ص۱۶۱ S2-Q3=۱۱ و Q9=۲۱ (اندازه‌گیریِ span)؛ ص۱۶۳ Q2=۳۱، Q5=۱۹، Q7=۲۴، Q8=۱۷ — عینِ چاپ در ساقه‌ها",
        "گپ‌های گفتگوی ترجمه‌ها (ص۲۹۱) به سه فاصله تکییف شد — آرتیفکتِ ترازبندیِ bidi در لایه (۱۶/۱۲/۳/۷ فاصله)؛ خطِ آغازینِ «-» و «–» عینِ چاپ ماند",
        "فاصله‌های ترازِ پیش از پرانتزِ پاسخ در S3 (۱۵-۴۴ فاصله در لایه) به یک فاصله تکییف شد — ستون‌بندیِ حاشیه، نه محتوا",
        "محاورهٔ چاپیِ ترجمه‌ها نگه داشته شد: Q5 «داره»/«دیرم میشه»/«بکنم؟»، Q8 «میتونم» با پرانتزِ «(اجازه دارم)»، Q2 «نمیدونم»",
        "پسوندهای فاصله‌دارِ سیستماتیک: «مدرسه ام»/«پاسپورت هایشان»/«رمان های»/«بچه ها»/«عموزاده های»/«ماه ها»/«خرداد ماه»؛ «کتابهای»/«تکالیفت»/«خودکارت»/«قسمتهای»/«فصلها» چسبیده — عینِ چاپ",
        "کوئیرک‌های انگلیسی: Q16 «Shahrivar 22, 1400» ارقام لاتین؛ Q1 «can’t» خمیده؛ Q24… — آپاستروف‌ها عینِ لایه/رندر؛ S4 کلیدِ ۱ با s کوچکِ «students» (عینِ چاپ ص۲۹۰)",
        "مثال‌های درون‌گریدِ Q9/Q10/Q11 (He always drives fast. / I answered it hard.) با زیرخط و برچسبِ «قید حالت/فعل» — رسیدِ گرید، خارج از دیتا",
    ],
    "layerDecompositions": [
        "لایه→چاپ (رندر حاکم): «تسی یچ»→تشریحی (دهمین)؛ «آموزیس»→آموزشی؛ «دستگریم ـگ رامر»→دستگریمی گرامر؛ «سؤاالت»→سؤالات؛ «خاریح»→خارج؛ «تعطیالت»→تعطیلات؛ «مطمیی ن»→مطمئن (همزه)؛ «میر وم»→میروم (چسبیده)؛ «رس کار»→سرکار؛ «رسگریم» خانوادهٔ جابجایی؛ «تلفتن»→تلفنی؛ «مهیم»→مهم؛ «جالت»→جالب؛ «رسییع»→سریعی؛ «رسعت»→سرعت؛ «آسابن»→آسان/آسانی؛ «باال»→بالا؛ «االن»→الان؛ «کتن»→کنی؛ «بگیر م»→بگیرم؛ «بگیر ی»→بگیری؛ «میتوابن»→میتوانی؛ «تاکیس»→تاکسی؛ «عموزاده ها» فاصله‌دار؛ «شهریورماه ماه ۹۹» عینِ چاپ",
    ],
}


def census_vector(stems):
    vec = []
    for s in stems:
        runs = [len(r) for r in re.findall(r"-{2,}", s)]
        vec.append(runs if len(runs) > 1 else runs[0])
    return vec


def main():
    old = json.loads(PATH.read_text(encoding="utf-8"))
    existing = [l for l in old["lessons"] if l["lesson"] >= 82]
    if existing:
        print(f"lessons 82+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
        if old["source"].get("g10l4c") != RECEIPT:
            old["source"]["g10l4c"] = RECEIPT
            PATH.write_text(json.dumps(old, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("source.g10l4c refreshed")
        return
    assert len(old["lessons"]) == 81, f"baseline mismatch: {len(old['lessons'])} banks"
    assert sum(l["count"] for l in old["lessons"]) == 1062, "baseline item count mismatch"

    banks = []

    # ---- بانک ۸۲: تمرین ص۱۵۸ ----
    drill_key_norm = [k.strip() for k in DRILL_KEY.split("|")]
    qs = []
    for i, (stem, options, key) in enumerate(DRILL):
        n = i + 1
        assert key == drill_key_norm[i], f"drill Q{n}: {key!r} != {drill_key_norm[i]!r}"
        assert options[0] == key
        qs.append({
            "id": f"g10-l82-{n}", "n": n, "category": "grammar", "kind": "typed",
            "question": stem, "options": options, "answer": 0,
            "accepted": [key],
            "placeholder": "choose from (on / in / at) for each blank (use / between two answers)…",
        })
    assert census_vector([s for s, *_ in DRILL]) == [[14, 14], [14, 14], [14, 14], [14, 14],
                                                     14, 14, 14, 14], census_vector([s for s, *_ in DRILL])
    banks.append({
        "lesson": 82,
        "title": "تشریحی — تمرین حروف اضافه مکان و زمان (ص۱۵۸)",
        "level": "سه‌گزینه‌ایِ تایپی — کلیدِ درون‌صفحه‌ای",
        "count": len(qs), "questions": qs,
    })

    # ---- بانک ۸۳: بخش ۱ دونگزینه‌ای ----
    qs = []
    for i, (stem, options, key) in enumerate(S1):
        n = i + 1
        letter = "ab"[options.index(key)]
        assert letter == S1_GRID[i], f"S1 Q{n}: {letter} != {S1_GRID[i]}"
        qs.append({"id": f"g10-l83-{n}", "n": n, "category": "grammar",
                   "question": stem, "options": options, "answer": options.index(key)})
    assert census_vector([s for s, *_ in S1]) == [33] * 10
    banks.append({
        "lesson": 83,
        "title": "تشریحی گرامر — بخش ۱: زیر گزینه صحیح خط بکشید (ص۱۶۱)",
        "level": "دونگزینه‌ای — can/could",
        "count": len(qs), "questions": qs,
    })

    # ---- بانک ۸۴: بخش ۲ تایپیِ بانک‌واژه ----
    qs = []
    for i, ((stem, key), rot) in enumerate(zip(S2, S2_ROTATION)):
        n = i + 1
        assert rot[0] == key, f"S2 Q{n}: rotation head {rot[0]!r} != print key {key!r}"
        assert sorted(rot) == sorted(BANK_MODALS)
        qs.append({
            "id": f"g10-l84-{n}", "n": n, "category": "grammar", "kind": "typed",
            "question": f"{stem} [bank: can / may / should / must]",
            "options": rot, "answer": 0, "accepted": [key],
            "placeholder": "fill in with can / may / should / must…",
        })
    assert census_vector([s for s, _ in S2]) == [18] * 10
    banks.append({
        "lesson": 84,
        "title": "تشریحی گرامر — بخش ۲: پرکردن با افعال ناقص (ص۱۶۱)",
        "level": "تایپی — بانکِ can / may / should / must",
        "count": len(qs), "questions": qs,
    })

    # ---- بانک ۸۵: بخش ۳ اصلاحِ خطا ----
    qs = []
    for i, (stem, fix, wrong) in enumerate(S3):
        n = i + 1
        qs.append({
            "id": f"g10-l85-{n}", "n": n, "category": "grammar", "kind": "typed",
            "question": stem, "options": [fix, wrong], "answer": 0,
            "accepted": [fix],
            "placeholder": "write the correction…",
        })
    assert census_vector([s for s, *_ in S3]) == [25] * 5
    banks.append({
        "lesson": 85,
        "title": "تشریحی گرامر — بخش ۳: اصلاح خطا (ص۱۶۱)",
        "level": "تایپی — پیدا و تصحیح کن",
        "count": len(qs), "questions": qs,
    })

    # ---- بانک ۸۶: بخش ۴ جمله‌سازی ----
    qs = []
    for i, (words, key, wrongs) in enumerate(S4):
        n = i + 1
        assert wrongs[0] != key and key not in wrongs
        qs.append({
            "id": f"g10-l86-{n}", "n": n, "category": "grammar", "kind": "typed",
            "question": words, "options": [key] + wrongs, "answer": 0,
            "accepted": [key],
            "placeholder": "make a sentence with the given words…",
        })
    banks.append({
        "lesson": 86,
        "title": "تشریحی گرامر — بخش ۴: جمله‌سازی (ص۱۶۲)",
        "level": "تایپی — با کلماتِ داده شده",
        "count": len(qs), "questions": qs,
    })

    # ---- بانک ۸۷: بخش ۵ حروف اضافه زمان ----
    qs = []
    for i, ((stem, key), rot) in enumerate(zip(S5, S5_ROTATION)):
        n = i + 1
        assert rot[0] == key, f"S5 Q{n}: {rot[0]!r} != {key!r}"
        qs.append({
            "id": f"g10-l87-{n}", "n": n, "category": "grammar", "kind": "typed",
            "question": f"{stem} [bank: in / at / on]",
            "options": rot, "answer": 0, "accepted": [key],
            "placeholder": "fill in with in / at / on (use / between two answers)…",
        })
    assert census_vector([s for s, _ in S5]) == [10, 10, 10, 10, 10, [10, 10], 10, 10, [10, 10], [10, 10]]
    banks.append({
        "lesson": 87,
        "title": "تشریحی گرامر — بخش ۵: حروف اضافه زمان (ص۱۶۲)",
        "level": "تایپی — in / at / on",
        "count": len(qs), "questions": qs,
    })

    # ---- بانک ۸۸: ۲۰ MCQ ترجمه‌دار ----
    qs = []
    for i, (stem, options, letter, translation) in enumerate(MCQ):
        n = i + 1
        assert letter == MCQ_GRID[i], f"MCQ Q{n}: {letter} != {MCQ_GRID[i]}"
        idx = "abcd".index(letter)
        qs.append({
            "id": f"g10-l88-{n}", "n": n, "category": "grammar",
            "question": stem, "options": options, "answer": idx,
            "translation": translation,
        })
    vec = census_vector([s for s, *_ in MCQ])
    assert vec == [19, 17, 18, 17, 19, 21, 17, 17, 17, 17, 17, 17, 15, 12, 16, 16,
                   [14, 14], [15, 14], [15, 13], [14, 13]], vec
    banks.append({
        "lesson": 88,
        "title": "آموزشی — تست گرامر و نگارش درس چهارم (ص۱۶۳)",
        "level": "آموزشی — چهارگزینه‌ای با ترجمهٔ چاپی",
        "count": len(qs), "questions": qs,
    })

    data = json.loads(PATH.read_text(encoding="utf-8"))
    data["lessons"].extend(banks)
    data["source"]["g10l4c"] = RECEIPT

    assert len(data["lessons"]) == 88
    total = sum(l["count"] for l in data["lessons"])
    assert total == 1130, f"total {total} != 1130"
    ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
    assert len(ids) == len(set(ids)) == 1130

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: banks 82-88 added — {total} items in {len(data['lessons'])} banks")
    for b in banks:
        print(f"  bank {b['lesson']}: {b['title']} — {b['count']}")


if __name__ == "__main__":
    main()
