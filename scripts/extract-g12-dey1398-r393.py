#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r393 — برگهٔ پانزدهمِ نهایی‌ها: دی ۱۳۹۸ (کلیهٔ رشته‌ها، ص۲۵۱-۲۵۶ + کلیدِ ص۲۵۷-۲۵۸، تاریخِ ۲۲/۱۰/۹۸)
۱۴ بانک / ۴۶ آیتم → tests-g12.json (l115-l128) + رسیدِ g12nahaie15. idempotent (اجرای دوم = NO-OP).
هم‌خانوادگی: r292 همین برگه را در grammar-g12-topic.json (l93-l104، ۴۱ آیتم) هم رندر کرده — سرشماری در رسید.
افزوده‌های r393 نسبت به دوقلو: ق۱۰-۱۱ (شنیداریِ باز) و ق۱۲-۱۴ (کلوژِ Sara/Andy) که gt ندارد.
نخست‌های tests-g12: بانکِ ناهماهنگِ یگانه (l121) و بانکِ ترتیبِ حروفِ پاراگراف (l126).
"""
import json
from pathlib import Path

F = Path("/home/z/my-project/public/jozve/tests-g12.json")
d = json.loads(F.read_text(encoding="utf-8"))
src = d["source"]
if "g12nahaie15" in src:
    print("NO-OP: g12nahaie15 already present")
    raise SystemExit(0)

# ---------- متن‌های چاپیِ داوری‌شده ----------
ELECTRIC_CARS = (
    "Many countries now think that cars that burn fossil fuels should be replaced by electric cars. "
    "Electric cars don't burn gasoline in the engine, so they don't make the air dirty and unclean. "
    "They use electricity stored on the car in batteries. The electric car is usually plugged in at "
    "night. The car can be plugged into a special charging unit even at houses. Some electric cars "
    "can be plugged right into a regular electrical wall outlet. Others need a larger outlet, like "
    "the kind that a stove or a vacuum cleaner plugs into. The engineers are trying to make better "
    "batteries that hold more energy and last longer. To overcome the problem of charging electric "
    "cars, hybrid cars are also available. Hybrid cars combine the benefits of gasoline engines and "
    "electric motors. They can be designed to meet different goals, such as better fuel economy or "
    "more power."
)
EARS_READING = (
    "The size and shape of your ears show your character more than any other part of the face. "
    "Other parts of the face change shapes as we get older, but ears do not change their shapes. "
    "They only change in size. Reading people's character from their ears is a very old science. "
    "In the past people thought that a person's ears with color were dangerous. They also thought "
    "that the shape of the ears showed if a person was musical or not. Today, too many people "
    "believe that the size and shape of the ears help you know if a person is musical. Ears are all "
    "different, and each different thing has a meaning. Next time you look at a person, see if his "
    "or her ears are large, medium-size, or small. Look at the lobes. Ears that are always red mean "
    "that a person may get angry easily. Ears that are always cold and nearly white color mean that "
    "a person has a nervous character."
)

# ---------- سازنده‌ها ----------
def bank(lesson, title, level, items):
    return {"lesson": lesson, "title": title, "level": level, "count": len(items), "questions": items}

def mcq(lid, n, cat, question, options, answer):
    return {"id": f"g12-l{lid}-{n}", "n": n, "category": cat, "question": question,
            "options": options, "answer": answer}

def typed(lid, n, cat, question, accepted):
    return {"id": f"g12-l{lid}-{n}", "n": n, "category": cat, "question": question,
            "options": [accepted[0]], "answer": 0, "kind": "typed", "accepted": accepted}

# ---------- l115 — شنیداریِ متن‌چاپ — ترکیبی (س۲، ص۲۵۱): ق۷-۹ = ۳ آیتم (۲ mcq + ۱ تایپی) ----------
l115 = [
    mcq(115, 1, "grammar",
        "Zohreh was upset because she couldn't invite --------------- to her birthday.",
        ["Mina's mother", "her close friend", "Maryam's sister"], 1),
    mcq(115, 2, "grammar",
        "Who isn't available till next Wednesday?",
        ["Mina's mother", "Zoheh's mother", "Maryam's sister"], 2),
    typed(115, 3, "grammar",
        "Where does Mina live?",
        ["She lives in another neighborhood."]),
]

# ---------- l116 — شنیداریِ بازِ ساقه‌دار — تایپی (س۳، ص۲۵۱): ق۱۰-۱۱ (افزودهٔ فراتر از دوقلو) ----------
l116 = [
    typed(116, 1, "grammar",
        "Where did Michelle's father study?",
        ["He studied in Canada."]),
    typed(116, 2, "grammar",
        "What are Michelle's brothers interested in?",
        ["They are interested in soccer.", "They are crazy about soccer."]),
]

# ---------- l117 — کلوژِ شنیداریِ Sara/Andy — تایپی (س۴، ص۲۵۱): ق۱۲-۱۴ (افزودهٔ فراتر از دوقلو) ----------
l117 = [
    typed(117, 1, "grammar",
        "Andy: Did you do anything ------- this year?",
        ["special"]),
    typed(117, 2, "grammar",
        "Andy: I went to Canada for a ------- It was terrific.",
        ["vacation"]),
    typed(117, 3, "grammar",
        "Sara: That's great. And I ------- next year is even better.",
        ["hope"]),
]

# ---------- l118 — واژگانِ تصویری — تایپی (س۵، ص۲۵۲): ق۱۵-۱۶ (ساقه‌های خودبسنده — الگویِ l104) ----------
l118 = [
    typed(118, 1, "vocab",
        "He is sitting in the b------- and drinking tea.",
        ["balcony"]),
    typed(118, 2, "vocab",
        "My brother always uses a m------- dictionary.",
        ["monolingual"]),
]

# ---------- l119 — تعریف‌یابی (س۶، ص۲۵۲): ق۱۷-۲۰، پنج‌گزینه‌ایِ چاپیِ ستون B (a-e) ----------
DEF_B = [
    "a book in which you record",                     # a (اضافیِ چاپ — هرگز-کلید)
    "help somebody remember something",               # b
    "in a quiet way",                                 # c
    "the rise and fall of the sea",                   # d
    "to find a solution or arrive at an answer to",   # e
]
l119 = [
    mcq(119, 1, "vocab", "calmly", DEF_B, 2),
    mcq(119, 2, "vocab", "tide", DEF_B, 3),
    mcq(119, 3, "vocab", "figure out", DEF_B, 4),
    mcq(119, 4, "vocab", "remind", DEF_B, 1),
]

# ---------- l120 — واژگانِ بانک (س۷، ص۲۵۲): ق۲۱-۲۴، پنج‌گزینه‌ایِ چاپی به ترتیبِ چاپ (radiation اضافی) ----------
WORD_BANK = ["shared", "cooling", "radiation", "effectively", "replaced"]
l120 = [
    mcq(120, 1, "vocab",
        "He played his role very ---------------.", WORD_BANK, 3),
    mcq(120, 2, "vocab",
        "My sister --------------- her food among the poor children.", WORD_BANK, 0),
    mcq(120, 3, "vocab",
        "My mother carefully --------------- the China plate on the shelf.", WORD_BANK, 4),
    mcq(120, 4, "vocab",
        "Wind towers are natural air ---------------systems and can be used instead of electrical air conditioners.",
        WORD_BANK, 1),
]

# ---------- l121 — ناهماهنگِ یگانه (س۸، ص۲۵۳): ق۲۵-۲۸ — نخستین بانکِ ناهماهنگِ یگانهٔ tests-g12 ----------
ODD_STEM = "Find the word which does not go with the other three."
l121 = [
    mcq(121, 1, "vocab", ODD_STEM, ["water", "tree", "coal", "sun"], 2),
    mcq(121, 2, "vocab", ODD_STEM, ["pollution", "waste", "garbage", "resource"], 3),
    mcq(121, 3, "vocab", ODD_STEM, ["effective", "useful", "confusing", "helpful"], 2),
    mcq(121, 4, "vocab", ODD_STEM, ["generate", "use up", "absorb", "digest"], 0),
]

# ---------- l122 — شکلِ صحیحِ فعل — تایپی (س۹، ص۲۵۳): ق۲۹-۳۲ (دوبخشیِ چاپیِ learned/learnt) ----------
l122 = [
    typed(122, 1, "grammar",
        "I think Mina --------------- a new mobile phone, hasn't she? (to buy)",
        ["has bought"]),
    typed(122, 2, "grammar",
        "Three people --------------- in the car accident last week. (to kill)",
        ["were killed"]),
    typed(122, 3, "grammar",
        "Before my brother moved to China, he --------------- Chinese. (to learn)",
        ["had learned", "had learnt"]),
    typed(122, 4, "grammar",
        "The letter must --------------- to the company immediately. (to send)",
        ["be sent"]),
]

# ---------- l123 — گرامرِ چهارگزینه‌ای (س۱۰، ص۲۵۳): ق۳۳-۳۶ با چینشِ دیداریِ a-d ----------
l123 = [
    mcq(123, 1, "grammar", "I was sure I --------------- him before.",
        ["meet", "have meet", "had met", "would meet"], 2),
    mcq(123, 2, "grammar", "What --------------- you do if you were my father?",
        ["would", "will", "may", "had"], 0),
    mcq(123, 3, "grammar", "The book --------------- you want isn't available now.",
        ["whose", "who", "which", "whom"], 2),
    mcq(123, 4, "grammar",
        "A: When do they collect the waste every night? B: The waste --------------- about at 9.",
        ["should collect", "collect", "collected", "is collected"], 3),
]

# ---------- l124 — مرتب‌کردنِ کلمات — تایپی (س۱۱، ص۲۵۳): ق۳۷-۳۸ (خامِ چاپ وفادار؛ دوبخشیِ ضمیرِ ق۳۸) ----------
l124 = [
    typed(124, 1, "grammar",
        "went/ my brother/ to the library/ at all/ he/ didn't/ but/ study.",
        ["My brother went to the library, but he didn't study at all."]),
    typed(124, 2, "grammar",
        "watching/ bought/ her father/ is/ the DVD/ has/ she/ that/.",
        ["She is watching the DVD that her father has bought.",
         "Her father is watching the DVD that she has bought."]),
]

# ---------- l125 — حروفِ ربط — تایپی (س۱۲، ص۲۵۳): ق۳۹-۴۲ (کلیدهای چاپی: or/so/but/and) ----------
l125 = [
    typed(125, 1, "grammar",
        "He can buy the dictionary, --------------- he can borrow it from the library.",
        ["or"]),
    typed(125, 2, "grammar",
        "There was no bread at home, --------------- my mother went out to buy some.",
        ["so"]),
    typed(125, 3, "grammar",
        "My sister loves apples, --------------- she hates bananas.",
        ["but"]),
    typed(125, 4, "grammar",
        "Ali bought a new coat, --------------- he wore it for two years .",
        ["and"]),
]

# ---------- l126 — مرتب‌کردنِ پاراگرافِ درخت‌ها — ترتیبِ حروف (س۱۳، ص۲۵۴): ق۴۳ — نخستین بانکِ ترتیبِ حروفِ tests-g12 ----------
# گزینهٔ ۱ = کلیدِ چاپیِ رسمی «( c / e / f / a / b / d )»؛ گزینه‌های ۲-۴ = پرتکننده‌های نزدیکِ دوقلو (r292/gt-l102)
TREE_ORDER = [
    "c / e / f / a / b / d",
    "c / f / e / a / b / d",
    "c / e / f / a / d / b",
    "e / c / f / a / b / d",
]
l126 = [
    mcq(126, 1, "grammar",
        "Order the six mixed-up sentences into a meaningful paragraph and write the correct letter order.",
        TREE_ORDER, 0),
]

# ---------- l127 — خوانداریِ خودروی الکتریکی — ترکیبی (س۱۶، ص۲۵۵): ق۴۸-۵۲ (۳ تایپی + ۲ mcq) ----------
l127 = [
    typed(127, 1, "vocab",
        ELECTRIC_CARS + " — Why don't electric cars make the air dirty and unclean?",
        ["They don't make the air dirty and unclean because they don't burn gasoline in the engine."]),
    typed(127, 2, "vocab",
        ELECTRIC_CARS + " — When is usually the electric car plugged in?",
        ["The electric car is usually plugged in at night."]),
    typed(127, 3, "vocab",
        ELECTRIC_CARS + " — Why do people use hybrid cars?",
        ["People use hybrid cars because hybrid cars combine the benefits of gasoline engines and electric motors."]),
    mcq(127, 4, "vocab",
        ELECTRIC_CARS + " — Electric cars use both fossil fuel and electricity.",
        ["True", "False"], 1),
    mcq(127, 5, "vocab",
        ELECTRIC_CARS + " — Not all electric cars have batteries.",
        ["True", "False"], 1),
]

# ---------- l128 — خوانداریِ گوش‌ها (س۱۷، ص۲۵۶): ق۵۳-۵۶ ----------
l128 = [
    mcq(128, 1, "vocab",
        EARS_READING + " — When we grow up, _____.",
        ["our ears will not change in size", "our ears will be the same size.",
         "our ears will get colder", "our ears will not change in shape."], 3),
    mcq(128, 2, "vocab",
        EARS_READING + " — If someone's ears are red, it means _____.",
        ["he/she is a kind person", "he/she is very happy",
         "he/she may get angry easily", "he/she drinks a lot"], 2),
    mcq(128, 3, "vocab",
        EARS_READING + " — If you look at someone's ears, the right way is to see _____.",
        ["his face, ears and nose", "the size, color and shape",
         "his mouth, eyes and nose", "the hair, eyes and color"], 1),
    mcq(128, 4, "vocab",
        EARS_READING + " — How can we find out a person has a nervous character through his/her ears?",
        ["When they are cold", "When they are medium-size",
         "When they are not white color", "When they are musical"], 0),
]

NEW = [
    bank(115, "نهایی دی ۱۳۹۸ — شنیداریِ متن‌چاپ — ترکیبی (س۲، ص۲۵۱)", "ترکیبی", l115),
    bank(116, "نهایی دی ۱۳۹۸ — شنیداریِ بازِ ساقه‌دار — تایپی (س۳، ص۲۵۱)", "تایپی", l116),
    bank(117, "نهایی دی ۱۳۹۸ — کلوژِ شنیداریِ Sara/Andy — تایپی (س۴، ص۲۵۱)", "تایپی", l117),
    bank(118, "نهایی دی ۱۳۹۸ — واژگانِ تصویری — تایپی (س۵، ص۲۵۲)", "تایپی", l118),
    bank(119, "نهایی دی ۱۳۹۸ — تعریف‌یابی (س۶، ص۲۵۲)", "پنج‌گزینه‌ای", l119),
    bank(120, "نهایی دی ۱۳۹۸ — واژگانِ بانکِ چاپ (س۷، ص۲۵۲)", "پنج‌گزینه‌ای", l120),
    bank(121, "نهایی دی ۱۳۹۸ — ناهماهنگِ یگانه (س۸، ص۲۵۳)", "چهارگزینه‌ای", l121),
    bank(122, "نهایی دی ۱۳۹۸ — شکلِ صحیحِ فعل — تایپی (س۹، ص۲۵۳)", "تایپی", l122),
    bank(123, "نهایی دی ۱۳۹۸ — گرامرِ چهارگزینه‌ای (س۱۰، ص۲۵۳)", "چهارگزینه‌ای", l123),
    bank(124, "نهایی دی ۱۳۹۸ — مرتب‌کردنِ کلمات — تایپی (س۱۱، ص۲۵۳)", "تایپی", l124),
    bank(125, "نهایی دی ۱۳۹۸ — حروفِ ربط — تایپی (س۱۲، ص۲۵۳)", "تایپی", l125),
    bank(126, "نهایی دی ۱۳۹۸ — مرتب‌کردنِ پاراگرافِ درخت‌ها — ترتیبِ حروف (س۱۳، ص۲۵۴)", "چهارگزینه‌ای", l126),
    bank(127, "نهایی دی ۱۳۹۸ — خوانداریِ خودروی الکتریکی — ترکیبی (س۱۶، ص۲۵۵)", "ترکیبی", l127),
    bank(128, "نهایی دی ۱۳۹۸ — خوانداریِ گوش‌ها (س۱۷، ص۲۵۶)", "چهارگزینه‌ای", l128),
]
for b in NEW:
    d["lessons"].append(b)

src["g12nahaie15"] = {
    "extractedRound": "r393",
    "section": ("بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ پانزدهم: "
                "«سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ دی ۱۳۹۸ — کلیهٔ رشته‌ها"),
    "examPages": ("pdf-p251-256 (شش صفحهٔ آزمون — بزرگ‌ترین برگهٔ استخراج‌شده) + کلیدِ رسمی: pdf-p257-258 "
                  "«راهنماي تصحيح امتحان نهایی درس: زبان انگلیسی (۳)»؛ مرزِ برگه‌ها = p250 → p251 (پس از شهریور ۱۳۹۸ِ r392) و "
                  "p258 → p259 (خرداد ۱۳۹۹ ریاضی-تجربیِ r388)"),
    "examMeta": ("امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — "
                 "رشته: کلیهٔ رشته‌ها — نوبت دیماه ۱۳۹۸ (تاریخِ چاپی: ۲۲/۱۰/۹۸) — ساعت شروع ۱۰ — مدت ۱۲۰ دقیقه — "
                 "۶ صفحه/۱۷ ردیف/جمعِ نمرهٔ ۴۰ — روزانه/بزرگسال/داوطلب آزاد سراسر کشور — مركز سنجش و پايش كيفيت آموزشي "
                 "(aee.medu.ir) — سربرگِ presentation-forms با «ﺳﺆاﻻت  اﻣﺘﺤﺎن ﻧﻬﺎﯾﯽ» (الگویِ r383/r386/r387/r391/r392)؛ "
                 "QRهای «Audio file (MP3)» و «Audio script (PDF)» در دو گوشهٔ بالای ص۲۵۱ (الگویِ شهریور ۱۳۹۸)؛ "
                 "شنیداریِ ۶سؤالیِ صوتی (ق۱-۶) + ساقه‌های شنیداریِ متن‌چاپ (ق۷-۱۴)"),
    "keyPages": ("pdf-p257-258 راهنمای تصحيح — قالبِ مختلط: «7. b» ساده + «9. She lives in another neighborhood.» + "
                 "«17. ( c )» پرانتزی + «25. c/ coal» کهن‌قالبِ مورب + «21. effectively» واژه‌ای — نخستین برگه با "
                 "دو قالبِ پرانتزی و مورب در یک برگه؛ ۴۶ کلیدِ چاپی در گارد پیمان می‌شود؛ ۴۶ کلید از ۴۶ آیتمِ بانک‌ها "
                 "عینِ چاپ است (تنها استثنا: هیچ — برگهٔ بدونِ کلیدِ بریده/استنتاجی، دومین بعدِ شهریور ۱۳۹۸)"),
    "keyVerification": ("کلیدِ چاپی عیناً نقل شد: ق۱-۶ مدل‌های شنیداریِ بازِ «1. do exercise 2. dishwasher 3. renewable energy "
                 "4. at the top of each page 5. sun or sunshine 6. You can carry it everywhere.» / «7. b 8. c "
                 "9. She lives in another neighborhood.» / «10. He studied in Canada. 11. They are interested in soccer. "
                 "or they are crazy about soccer.» (دوبخشیِ چاپی با or) / «12. special 13. vacation 14. hope» / "
                 "«15. balcony 16. monolingual» / «17. ( c ) 18. ( d ) 19. (  e  ) 20. ( b  )» (پرانتزهای ناهمگونِ چاپ — الگویِ r391/r392) / "
                 "«21. effectively 22. shared 23. replaced 24. cooling» / «25. c/ coal 26. d/ resource 27. c/ confusing "
                 "28. a / generate» (کهن‌قالبِ مورب؛ «a / generate» با فاصله‌های دورِ اسلش) / «29. has bought 30. were killed "
                 "31. had learned /learnt 32. be sent» (دوبخشیِ چاپی با اسلشِ چسبیده) / «33. ( c ) 34. (a) 35. (c) 36. (d)» "
                 "(پرانتزهای ناهمگون) / «37. My brother went to the library     , but he didn't study at all. (0/5)(0/5)» "
                 "«38.  She/ Her father is watching the DVD   that her father/ She has bought. (0/5)(0/5)» (دوبخشیِ ضمیر) / "
                 "«39. or 40. so 41. but 42. and» / «43.  ( c / e  / f / a  / b / d )» (ترتیبِ حروف) / س۱۴ open (ق۴۴-۴۶) و "
                 "س۱۵ open (ق۴۷ ابوعلی سینا) فقط یادداشتِ نمره‌دهی / «48. They don't make the air dirty and unclean because "
                 "they don't burn gasoline in the engine. (0/25)(0/75)» «49. The electric car is usually plugged in at night. "
                 "(0/25)(0/75)» «50. people use hybrid cars  because    Hybrid cars combine the benefits of gasoline engines "
                 "and electric motors. (0/25)(0/75)» «51. False 52. False» (۰/۵ هر یک) / «53. ( d ) 54. ( c ) 55. ( b ) 56. (a )»"),
    "sectionsTotal": 56,
    "sectionsExtracted": 46,
    "sectionsSkipped": 10,
    "items": 46,
    "bankCounts": [3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4],
    "keyPolicy": ("همهٔ کلیدهای ۴۶ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ) — دومین برگهٔ پیاپیِ بدونِ کلیدِ بریده/استنتاجی؛ "
                  "دوبخشی‌های چاپی به accepted بدل شدند: ق۱۱ (interested in soccer / crazy about soccer)، ق۳۱ (had learned / "
                  "had learnt)، ق۳۸ (دو ترتیبِ ضمیریِ She/Her father)؛ گزینه‌های گرامرِ l123 به چینشِ دیداریِ چاپ (a-d تک‌ردیفی — "
                  "ترتیبِ لایه d,c,b,a آرتیفکتِ RTL بود — الگویِ r391/r392)؛ ستونِ تعریفِ l119 به ترتیبِ چاپِ ستون B (a-e) با "
                  "«a book in which you record» اضافیِ چاپیِ هرگز-کلید؛ بانکِ l120 به ترتیبِ چاپِ بانکِ پنج‌واژه‌ای با "
                  "radiation اضافیِ هرگز-کلید (رندرِ mcq به الگویِ l85ِ دی ۹۷ — gt تایپی رندر کرده بود؛ کلیدها برابر assert شد)؛ "
                  "سه‌گزینه‌ای‌های چاپیِ ق۷-۸ (الف-ج) وفادار حفظ شدند؛ ترتیبِ درخت‌ها (l126) با گزینهٔ ۱ = کلیدِ چاپ و "
                  "گزینه‌های ۲-۴ = پرتکننده‌های نزدیکِ دوقلو (gt-l102) رندر شد"),
    "paperMap": ("نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — به‌روزِ r393: دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ "
                 "ص۲۳۴-۲۳۶ [r390]؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸) [r391]؛ "
                 "شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸) [r392]؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸) ← این راند؛ "
                 "خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹) [r388]؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹) [r389]؛ "
                 "برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ [r387]؛ "
                 "شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ [r388]؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ [r386]؛ "
                 "خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ "
                 "دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — "
                 "۱۶ برگه استخراج شد، ۱ برگه باقی است"),
    "skippedSections": [
        "س۱ شنیداریِ صوتیِ باز (ق۱-۶: exercise/dishwasher/renewable energy/بالای صفحه/خورشید/حمل همه‌جا) — ساقه‌ها فقط صوتی‌اند (بدونِ متنِ چاپی)؛ شش مدلِ کلید به مخزنِ تایپی رفت",
        "س۱۴ Topic Sentence (ق۴۴-۴۶: Doctors/Fruits/Forests) — کلید فقط یادداشتِ نمره‌دهی دارد («بە رعایت topic sentence نمره لحاظ گردد») و مدلِ چاپی ندارد",
        "س۱۵ پاراگرافِ ابوعلی سینا (ق۴۷؛ تولد ۳۵۹ بخارا/شغل/کتاب‌های قانون و شفا/درگذشتِ ۴۱۹ همدان) — مدلِ چاپی ندارد (فقط ۳ نمره)",
    ],
    "printQuirks": [
        "«Zoheh's mother» غلطِ حروف‌چینیِ چاپ برای Zohreh در گزینهٔ bِ ق۸ — وفادار حفظ شد (gt هم وفادار بود)",
        "«b. have meet» غلطِ گرامریِ چاپ در گزینهٔ bِ ق۳۳ (بجای have met) — وفادار حفظ شد",
        "چینشِ گزینه‌های ق۳۳-۳۶ در لایه d,c,b,a اما در چاپِ دیداریِ تک‌ردیفیِ a-d [z2] — ترتیبِ لایه آرتیفکتِ RTL (الگویِ r391/r392)",
        "«37. My brother went to the library     , but…» فاصله‌های چندگانهٔ پیش از ویرگول در کلیدِ چاپ — شکلِ پاک ثبت شد",
        "«42. …he wore it for two years .» نقطهٔ پس از فاصله در انتهای ق۴۲ — وفادار حفظ شد (gt هم)",
        "«21. He played his role very ………………. ..» نقطه‌چین + فاصله + نقطه در ق۲۱ — به «---------------.» نرمال شد",
        "«air ………….systems» چسبیدگیِ نقطه‌چین به systems در ق۲۴ — وفادار: «---------------systems»",
        "«he………. Chinese» چسبیدگیِ نقطه‌چین به he در ق۳۱ — به فاصله‌دار نرمال شد",
        "جای‌جایِ عدددارِ دیالوگِ Sara/Andy (…..12…..this / ..…13..…It / ..…14..…next) با فاصله‌های گم‌شدهٔ چاپ — به ------- یکدست شد (الگویِ r392)",
        "«Look at the lobes(نرمه گوش)» واژه‌نویسیِ فارسیِ چاپ در متنِ گوش‌ها — حذف برای خلوصِ لاتینِ موتور (ثبت‌شده)",
        "«31. had learned /learnt» دوبخشیِ چاپی با اسلشِ چسبیده به learnt",
        "«38.  She/ Her father is watching the DVD   that her father/ She has bought.» اسلش‌های جایگزینِ ضمیر + فاصله‌های دوبل در کلید — دو acceptedِ کامل",
        "«43.  ( c / e  / f / a  / b / d )» فاصله‌های پراکندهٔ چاپ در کلیدِ ترتیب",
        "گزینه‌های ق۵۳: b و d نقطه‌دارِ پایانی، a و c بی‌نقطه — وفادار حفظ شد (gt هم)",
        "«50. people use hybrid cars  because    Hybrid cars…» کلیدِ ق۵۰ با آغازِ کوچک و فاصله‌های دوبل — محتوا وفادار، شکل یکدست شد",
        "قالبِ مختلطِ کلید در یک برگه: پرانتزیِ «17. ( c )» در برابرِ موربِ کهنِ «25. c/ coal» و «28. a / generate» با فاصله‌های دورِ اسلش",
        "QRهای «Audio file (MP3)» و «Audio script (PDF)» در دو گوشهٔ بالای ص۲۵۱ + شماره‌گذاریِ چاپیِ ۱۵۶-۱۶۳ پایینِ صفحات",
    ],
    "twinCensus": ("هم‌خانوادگیِ بین‌خانواده‌ای — r292 همین برگه را در grammar-g12-topic.json (l93-l104، ۴۱ آیتم) هم رندر کرده: "
                   "l115↔gt-l93 (ق۷-۹: mcq/mcq/typed — هم‌نوع)، l116 و l117 افزوده‌های فراتر از دوقلو (ق۱۰-۱۴ — شنیداریِ بازِ ساقه‌دار و "
                   "کلوژِ Sara/Andy که gt ندارد؛ «Sara» دومین حضور بعد از l103ِ شهریور با دیالوگِ متفاوت)، l118↔gt-l94، "
                   "l119↔gt-l95 (ستونِ B همانِ پنج‌تعریفی)، l120↔gt-l96 (واگراییِ رندر: gt تایپی، ما mcqِ پنج‌گزینه‌ای به الگویِ l85 — "
                   "کلیدها assert برابر)، l121↔gt-l97 (نخستین بانکِ ناهماهنگِ یگانهٔ tests-g12 — ساقهٔ انگلیسیِ دوقلو به ارث رسید؛ "
                   "چاپ فارسی است)، l122↔gt-l98 (دوبخشیِ learned/learnt مشترک)، l123↔gt-l99، l124↔gt-l100 (دوبخشیِ ضمیریِ q38 — "
                   "دوقلو هم دو accepted دارد)، l125↔gt-l101، l126↔gt-l102 (درخت‌ها — گزینه‌های ۲-۴ ساختگیِ دوقلو؛ گزینهٔ ۱ = کلیدِ چاپ)، "
                   "l127↔gt-l103 (واگراییِ مستندِ q50: ما تایپیِ وفادار به مدلِ چاپ، gt mcq با گزینه‌های ساختگی)، l128↔gt-l104؛ "
                   "جفت‌های بین‌برگه‌ای: «in a quiet way» و «the rise and fall of the sea» (ستونِ Bِ l119 ↔ l95ِ خرداد ۱۳۹۸ — دومین تکرارِ "
                   "ستونِ مشترکِ وزارت)، «a book in which you record» (اضافیِ l119 ↔ تعریفِ diary در l95-2ِ خرداد)، "
                   "«effectively» (l120-1 ↔ l106-1ِ شهریور ↔ r380ِ خرداد ۱۴۰۲ — سومین تکرار با ساقه‌های متفاوت)، "
                   "کلیدِ ربطِ or/so/but/and (l125 ↔ l111ِ شهریور — همان توالی، ساقه‌های متفاوت — دومین تکرار)، "
                   "«Wind towers are natural air ---------------systems» (l120-4 ↔ تمِ توربینِ باد: l43/l68/l79/l85/l94 + متنِ انرژیِ l114)، "
                   "«fossil fuels» (متنِ خودروی الکتریکی ↔ متنِ انرژیِ l114ِ شهریور؛ تمِ خودروی برقی در gt در شهریور ۱۴۰۰ هم هست)، "
                   "«The book --------------- you want» (l123-3 ↔ خانوادهٔ موصولی‌های نهایی‌ها: l99-4ِ خرداد «The train»، l110-1ِ شهریور «The dog which»)"),
    "futureNote": ("شش مدلِ شنیداریِ بازِ ق۱-۶ (do exercise/dishwasher/renewable energy/at the top of each page/sun or sunshine/"
                   "You can carry it everywhere.) به مخزنِ بانکِ تایپیِ نهایی‌ها اضافه شد — مخزن اکنون ۸۹ ردیف است (۸۳ِ r392 + ۶)؛ "
                   "ق۴۴-۴۶ (Topic Sentence) و ق۴۷ (ابوعلی سینا) مدلِ چاپی ندارند و کاندید نیستند؛ ۱ برگه باقی است: "
                   "لایه‌خرابِ ص۲۷۷-۲۸۴ (نیازمند OCR/رندر) — پس از آن بخشِ نهایی‌های دارایِ لایه تمام می‌شود؛ "
                   "فیلدِ تصویرِ QuizQuestion هنوز نیازمندِ تصویبِ کاربر است (ق۱۵-۱۶ با ساقهٔ خودبسنده تایپی شدند — الگویِ l104)؛ "
                   "بانکِ تایپیِ نهایی از ۸۹ ردیفِ مخزن قابلِ ساخت است"),
    "engineNote": ("هفت بانکِ تایپی/ترکیبیِ تازه: l116 (شنیداریِ باز با دوبخشیِ چاپی)، l117 (کلوژِ Sara/Andy)، l118 (تصویریِ خودبسنده)، "
                   "l122 (فعل با دوبخشیِ learned/learnt)، l124 (مرتب‌کردن با دوبخشیِ ضمیری)، l125 (ربطِ تایپی)، l127 (ترکیبیِ خوانداری: "
                   "۳ تایپی + ۲ True/False) + دو بانکِ ترکیبی: l115 (۲ mcq + ۱ تایپیِ شنیداری) و l127 — "
                   "دو نخستِ tests-g12: l121 نخستین بانکِ ناهماهنگِ یگانه (odd-one-out) و l126 نخستین بانکِ ترتیبِ حروفِ پاراگراف "
                   "(چهارگزینه‌ایِ ترتیب — گزینهٔ ۱ = کلیدِ چاپ)؛ متنِ کاملِ دو خوانداری در ساقه (الگویِ l101/l102)؛ "
                   "بانک‌های تایپی/ترکیبی از حلقهٔ MCQ-خالصِ گاردها مستثنی‌اند؛ l119/l120/l121/l123/l126/l128 در حلقهٔ MCQ-خالص"),
}

F.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r393 OK: +{len(NEW)} banks / +{sum(b['count'] for b in NEW)} items -> {len(d['lessons'])} banks / {total} items")
