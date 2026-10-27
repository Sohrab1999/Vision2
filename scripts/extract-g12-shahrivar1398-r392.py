#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r392 — برگهٔ چهاردهمِ نهایی‌ها: شهریور ۱۳۹۸ (کلیهٔ رشته‌ها، ص۲۴۴-۲۴۸ + کلیدِ ص۲۴۹-۲۵۰، تاریخِ ۱۲/۶/۱۳۹۸)
۱۲ بانک / ۴۸ آیتم → tests-g12.json (l103-l114) + رسیدِ g12nahaie14. idempotent (اجرای دوم = NO-OP).
هم‌خانوادگی: r292 همین برگه را در grammar-g12-topic.json (l81-l92، ۴۳ آیتم) هم رندر کرده — سرشماری در رسید.
افزوده‌های r392 نسبت به دوقلو: ق۱۰-۱۱ (شنیداریِ باز) و ق۱۲-۱۴ (کلوژِ Sara/Nurse) که gt ندارد.
"""
import json
from pathlib import Path

F = Path("/home/z/my-project/public/jozve/tests-g12.json")
d = json.loads(F.read_text(encoding="utf-8"))
src = d["source"]
if "g12nahaie14" in src:
    print("NO-OP: g12nahaie14 already present")
    raise SystemExit(0)

# ---------- متن‌های چاپیِ داوری‌شده ----------
VOCAB_READING = (
    "Suppose that you have a very small vocabulary. Also suppose that you don't know how to get the "
    "meanings of new words. When you come across an unfamiliar word, that word may stop your "
    "understanding of the passage. Your eyes pause too long on the word as you try to get its meaning. "
    "You go back and read the word again, try to get its meaning from the context. As a result, you "
    "read much more slowly than you should, and you find that the difficult word is a wall to your "
    "comprehension. Suppose that you know many words and you are skilled in finding the meanings of "
    "new words. Your eyes move quickly and you read rapidly. You comprehend what you are reading. "
    "If you have a good vocabulary, you are more interested in reading."
)
ENERGY_READING = (
    "What do people need to light their homes and drive cars? Energy! Energy gives power to many "
    "things we need and use. Most of the energy people use comes from coal, oil, and gas. They are "
    "called fossil fuels. Those fuels come from fossils under the ground. Fossils are the remains of "
    "plants and animals that lived long ago. Burning fossil fuels pollutes the air. The air becomes "
    "dirty. That can be harmful to people, animals, and plants. Now more people are using clean "
    "energy. Such energy does not pollute the air. Two kinds of clean energy are wind power and "
    "solar power. Solar power: The sun gives Earth heat and light. Some homes have solar panels on "
    "the roof. The panels collect sun light and turn it into electricity. That is a kind of energy. "
    "It lets people do many things. For example, we use electricity to light our homes and watch "
    "television. Solar power can also be used to warm up the water in our homes. Wind power: People "
    "can turn wind energy into electricity. Wind turbines are machines that spin when the wind "
    "blows. They make electricity."
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

# ---------- l103 — شنیداریِ متن‌چاپ (س۲-س۴، ص۲۴۴): ق۷-۱۴ = ۸ آیتم ----------
l103 = [
    mcq(103, 1, "vocab", "What are they talking about?",
        ["playing volleyball", "taking photographs", "picnic"], 2),
    mcq(103, 2, "grammar", "When did they have barbecue?",
        ["in the morning", "at midnight", "in the evening"], 0),
    typed(103, 3, "grammar", "What did they do in the afternoon?",
        ["They flew their kites."]),
    typed(103, 4, "grammar", "How was the street at night?",
        ["It was dark and quiet."]),
    typed(103, 5, "grammar", "Who waved at the man?",
        ["The driver waved him."]),
    typed(103, 6, "grammar",
        "Sara: I guess I have only seen his name in my English book, but I'm not ------- about it.",
        ["sure"]),
    typed(103, 7, "grammar",
        "Sara: Oh, can you tell me a little about his -------?",
        ["life"]),
    typed(103, 8, "grammar",
        "Nurse: Dr. Gharib was born in Tehran in 1288. After receiving his diploma, he went ------- to study medicine.",
        ["abroad"]),
]

# ---------- l104 — واژگانِ تصویری — تایپی (س۵، ص۲۴۵): ق۱۵-۱۶ ----------
l104 = [
    typed(104, 1, "vocab",
        "My grandfather feeds the ------- in the park every morning.",
        ["pigeons"]),
    typed(104, 2, "vocab",
        "The new light bulbs ------- less electricity.",
        ["consume"]),
]

# ---------- l105 — تعریف‌یابی (س۶، ص۲۴۵): ق۱۷-۲۰، پنج‌گزینه‌ایِ چاپی ----------
DEF_B = [
    "to change in form or character",                 # a
    "to put things in a neat, attractive, or useful order",  # b
    "to suddenly decide to do something",             # c (اضافیِ چاپ — هرگز-کلید)
    "to stop being angry with someone",               # d
    "for all time",                                   # e
]
l105 = [
    mcq(105, 1, "vocab", "No one can live forever.", DEF_B, 4),
    mcq(105, 2, "vocab", "Those sofas convert into bed.", DEF_B, 0),
    mcq(105, 3, "vocab", "Mom will forgive me for breaking the vase.", DEF_B, 3),
    mcq(105, 4, "vocab", "We'll need to arrange the chairs around the table.", DEF_B, 1),
]

# ---------- l106 — واژگانِ بانک — تایپی (س۷، ص۲۴۵): ق۲۱-۲۳ (بانکِ چاپ: origin, generous, effectively, share؛ generous اضافی) ----------
l106 = [
    typed(106, 1, "vocab",
        "Being able to communicate ------- is one of the most important life skills",
        ["effectively"]),
    typed(106, 2, "vocab",
        "Elders have a lot to ------- with us: their life experiences, failures, successes and many more.",
        ["share"]),
    typed(106, 3, "vocab",
        "A complete dictionary tells you about the ------- of words and the story behind them.",
        ["origin"]),
]

# ---------- l107 — دانشِ خودِ حرف‌اول — تایپی (س۸، ص۲۴۶): ق۲۴-۲۶ ----------
l107 = [
    typed(107, 1, "vocab",
        "I have recorded my thoughts and feelings on my d------- every day for 10 years.",
        ["diary"]),
    typed(107, 2, "vocab",
        "This book has only a two-page i-------. It is about the writer and his success.",
        ["introduction"]),
    typed(107, 3, "vocab",
        "Nowadays d------- for organic food is increasing.",
        ["demand"]),
]

# ---------- l108 — شکلِ صحیحِ فعل — تایپی (س۹، ص۲۴۶): ق۲۷-۳۰ (سه‌گانهٔ would/might/could — نخستینِ بخشِ نهایی‌ها) ----------
l108 = [
    typed(108, 1, "grammar",
        "I think more money should ------- on education. ( to spend )",
        ["be spent"]),
    typed(108, 2, "grammar",
        "Paul had gone home before I ------- at the party. ( to arrive )",
        ["arrived"]),
    typed(108, 3, "grammar",
        "Last night my father ------- home very late, didn't he? ( to come )",
        ["came"]),
    typed(108, 4, "grammar",
        "If we found two hundred dollars, we ------- it to the police station. ( to give )",
        ["would give", "might give", "could give"]),
]

# ---------- l109 — گرامرِ چهارگزینه‌ای (س۱۰، ص۲۴۶): ق۳۱-۳۴ با چینشِ دیداریِ a-d ----------
l109 = [
    mcq(109, 1, "grammar", "I ------- to play ping pong when I was six years old.",
        ["had taught", "was taught", "taught", "will be taught"], 1),
    mcq(109, 2, "grammar", "She answered all the questions correctly ------- she had studied well.",
        ["before", "although", "because", "when"], 2),
    mcq(109, 3, "grammar", "The woman ------- my sister met in the hospital is a nurse.",
        ["where", "what", "which", "whom"], 3),
    mcq(109, 4, "grammar", "Aida burst ------- tears when she saw her score.",
        ["into", "on", "up", "over"], 0),
]

# ---------- l110 — جمله‌سازی — تایپی (س۱۱، ص۲۴۶): ق۳۵-۳۶ (خامِ چاپ وفادار) ----------
l110 = [
    typed(110, 1, "grammar",
        "very fast / the dog / is / can /which /runs / brown.",
        ["The dog which can run very fast is brown.",
         "The dog which is brown can run very fast."]),
    typed(110, 2, "grammar",
        "employed /  during / a lot of / the last five years / have been / workers.",
        ["A lot of workers have been employed during the last five years."]),
]

# ---------- l111 — حروفِ ربط — تایپی (س۱۲، ص۲۴۶): ق۳۷-۴۰ (کلیدهای چاپی: or/so/but/and) ----------
l111 = [
    typed(111, 1, "grammar",
        "You can buy a shirt ------- you can save your money.",
        ["or"]),
    typed(111, 2, "grammar",
        "There was nothing at home to eat ------- I went to a restaurant.",
        ["so"]),
    typed(111, 3, "grammar",
        "My friend had a lot of problems ------- she didn't tell me anything.",
        ["but"]),
    typed(111, 4, "grammar",
        "He wrote some books for children ------- translated a lot of story books.",
        ["and"]),
]

# ---------- l112 — نقش‌های پاراگرافِ فوتبال (س۱۴، ص۲۴۷): ق۴۲-۴۷، سه‌گزینه‌ایِ نقش‌محور ----------
ROLES = ["Topic sentence", "Supporting sentence", "Concluding sentence"]
l112 = [
    mcq(112, 1, "grammar", "You can often see them playing at school or in the street.", ROLES, 1),
    mcq(112, 2, "grammar", "If a player is very good, he may go on to play for a famous team.", ROLES, 1),
    mcq(112, 3, "grammar", "In high schools, students may play football on a team.", ROLES, 1),
    mcq(112, 4, "grammar",
        "There are many popular sports in my country, but the most popular one is football.", ROLES, 0),
    mcq(112, 5, "grammar", "Football is really a national sport in my country.", ROLES, 2),
    mcq(112, 6, "grammar",
        "Many children begin learning to play football when they are very young.", ROLES, 1),
]

# ---------- l113 — خوانداریِ واژگان (س۱۵، ص۲۴۷): ق۴۸ + ق۵۰ + ق۵۱ + ق۵۲ (ق۴۹ به مخزن) ----------
l113 = [
    typed(113, 1, "vocab",
        VOCAB_READING + " — What may happen when you come across an unfamiliar word?",
        ["That word may stop my understanding of the passage."]),
    mcq(113, 2, "vocab",
        VOCAB_READING + ' — What is the closest synonym for the word "suppose"?',
        ["believe", "accept", "understand", "imagine"], 3),
    mcq(113, 3, "vocab",
        VOCAB_READING + " — Unknown words in a passage may make comprehension easier.",
        ["True", "False"], 1),
    mcq(113, 4, "vocab",
        VOCAB_READING + " — The meaning of a new word may be guessed from the text.",
        ["True", "False"], 0),
]

# ---------- l114 — خوانداریِ انرژی (س۱۶، ص۲۴۸): ق۵۳-۵۶ ----------
l114 = [
    mcq(114, 1, "vocab",
        ENERGY_READING + " — Where does most of the energy that people use come from?",
        ["the wind", "plants", "fossil fuels", "the sun"], 2),
    mcq(114, 2, "vocab",
        ENERGY_READING + " — What are two examples of clean energy?",
        ["solar power and electricity", "wind power and solar power",
         "fossil fuels and wind power", "electricity and fossil fuels"], 1),
    mcq(114, 3, "vocab",
        ENERGY_READING + " — What is the main goal of using clean energy?",
        ["to replace the sun and wind with man-made energy sources",
         "to remove pollution from the air as quickly as possible",
         "to stop destroying fossils from long ago",
         "to create electricity without creating pollution"], 1),
    mcq(114, 4, "vocab",
        ENERGY_READING + ' — What is the closest synonym for the word "spin"?',
        ["turn", "run", "fly", "climb"], 0),
]

NEW = [
    bank(103, "نهایی شهریور ۱۳۹۸ — شنیداریِ متن‌چاپ — ترکیبی (س۲-س۴، ص۲۴۴)", "ترکیبی", l103),
    bank(104, "نهایی شهریور ۱۳۹۸ — واژگانِ تصویری — تایپی (س۵، ص۲۴۵)", "تایپی", l104),
    bank(105, "نهایی شهریور ۱۳۹۸ — تعریف‌یابی (س۶، ص۲۴۵)", "پنج‌گزینه‌ای", l105),
    bank(106, "نهایی شهریور ۱۳۹۸ — واژگانِ بانک — تایپی (س۷، ص۲۴۵)", "تایپی", l106),
    bank(107, "نهایی شهریور ۱۳۹۸ — دانشِ خودِ حرف‌اول — تایپی (س۸، ص۲۴۶)", "تایپی", l107),
    bank(108, "نهایی شهریور ۱۳۹۸ — شکلِ صحیحِ فعل — تایپی (س۹، ص۲۴۶)", "تایپی", l108),
    bank(109, "نهایی شهریور ۱۳۹۸ — گرامرِ چهارگزینه‌ای (س۱۰، ص۲۴۶)", "چهارگزینه‌ای", l109),
    bank(110, "نهایی شهریور ۱۳۹۸ — جمله‌سازی — تایپی (س۱۱، ص۲۴۶)", "تایپی", l110),
    bank(111, "نهایی شهریور ۱۳۹۸ — حروفِ ربط — تایپی (س۱۲، ص۲۴۶)", "تایپی", l111),
    bank(112, "نهایی شهریور ۱۳۹۸ — نقش‌های پاراگرافِ فوتبال (س۱۴، ص۲۴۷)", "سه‌گزینه‌ای", l112),
    bank(113, "نهایی شهریور ۱۳۹۸ — خوانداریِ واژگان — ترکیبی (س۱۵، ص۲۴۷)", "ترکیبی", l113),
    bank(114, "نهایی شهریور ۱۳۹۸ — خوانداریِ انرژی (س۱۶، ص۲۴۸)", "چهارگزینه‌ای", l114),
]
for b in NEW:
    d["lessons"].append(b)

src["g12nahaie14"] = {
    "extractedRound": "r392",
    "section": ("بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ چهاردهم: "
                "«سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۳۹۸ — کلیهٔ رشته‌ها"),
    "examPages": ("pdf-p244-248 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p249-250 «راهنماي تصحيح امتحان نهایی درس: "
                  "زبان انگلیسی (۳)»؛ مرزِ برگه‌ها = p243 → p244 (پس از خرداد ۱۳۹۸ِ r391) و p250 → p251 (دی ۱۳۹۸)"),
    "examMeta": ("امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — "
                 "رشته: کلیهٔ رشته‌ها — نوبت شهریورماه ۱۳۹۸ (تاریخِ چاپی: ۱۲/۶/۱۳۹۸ — نزدیک‌ترین برگه به امروزِ استخراج) — "
                 "ساعت شروع ۸ صبح — مدت ۱۲۰ دقیقه — ۵ صفحه/۱۶ ردیف/جمعِ نمرهٔ ۴۰ — روزانه/بزرگسال/داوطلب آزاد — "
                 "مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — سربرگِ presentation-forms با «ﺳﺆاﻻت  اﻣﺘﺤﺎن ﻧﻬﺎﯾﯽ» "
                 "(الگویِ r383/r386/r387/r391) و یادداشتِ «سؤالات (پاسخ نامه دارد)»؛ QRهای «Audio file (MP3)» و "
                 "«Audio script (PDF)» در دو گوشهٔ بالای ص۲۴۴ (نه پانویس — تفاوت با خرداد ۱۳۹۸)؛ شنیداریِ "
                 "۶سؤالیِ صوتی (ق۱-۶) + ساقه‌های بازِ شنیداریِ متن‌چاپ (ق۹-۱۱)"),
    "keyPages": ("pdf-p249-250 راهنمای تصحیح — قالبِ «7. c/ picnic» و «17. ( e )» و «21. effectively» و "
                 "«30. would/ might/ could give» — ۴۸ کلیدِ چاپی در گارد پیمان می‌شود؛ ۴۸ کلید از ۴۸ آیتمِ بانک‌ها "
                 "عینِ چاپ است (تنها استثنا: هیچ — نخستین برگهٔ بدونِ کلیدِ بریده/استنتاجی)"),
    "keyVerification": ("کلیدِ چاپی عیناً نقل شد: ق۱-۶ مدل‌های شنیداریِ بازِ «1. stories 2. wind 3. We can carry it. "
                 "4. I would found a company. 5. I feel proud or happy. 6. The foods which contain fat.» با یادداشتِ "
                 "«پاسخ سوال ۳ تا ۶ پیشنهادی است» / «7. c/ picnic» «8. a/ in the morning» «9. They flew their kites.» / "
                 "«10. It was dark and quiet.» «11. The driver waved him.» / «12. sure 13. life 14. abroad» / "
                 "«15. pigeons 16. consume» / «17. ( e ) 18. ( a ) 19. (  d  ) 20. ( b  )» (پرانتزهای ناهمگونِ چاپ — الگویِ r391) / "
                 "«21. effectively 22. share 23. origin» / «24. diary 25. introduction 26. demand» / "
                 "«27. be spent 28. arrived 29. came 30. would/ might/ could give» (سه‌گانهٔ چاپی — نخستینِ بخشِ نهایی‌ها) / "
                 "«31. b/ was taught 32. c/ because 33. d/ whom 34. a/ into» / "
                 "«35. The dog which can run very fast is brown. Or The dog which is brown can run very fast. (0/5)(0/5)» "
                 "«36. A lot of workers have been employed during the last five years. (0/25)(0/5)(0/25)» / "
                 "«37. or 38. so 39. but 40. and» / س۱۳ open (ق۴۱ پاراگرافِ smoking با صرفهٔ داور) / "
                 "جدولِ س۱۴: Topic=45، Supporting=47/42/44/43، Concluding=46 / "
                 "«48. That word may stop my understanding of the passage. (1)» "
                 "«49. If we have a good vocabulary, we are more interested in reading. (0.25/0.75)» / "
                 "«50. d/ imagine» «51. b/ False» «52. a/ True» / «53. c/ fossil fuels» "
                 "«54. b/ wind power and solar power» «55. b/ to remove pollution from the air as quickly as possible» "
                 "«56. a/ turn»"),
    "sectionsTotal": 56,
    "sectionsExtracted": 48,
    "sectionsSkipped": 8,
    "items": 48,
    "bankCounts": [8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4],
    "keyPolicy": ("همهٔ کلیدهای ۴۸ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ) — نخستین برگهٔ نهایی‌ها بدونِ "
                  "هیچ کلیدِ بریده یا استنتاجی؛ سه‌گانهٔ چاپیِ ق۳۰ (would/might/could give) به acceptedِ سه‌عضوی بدل شد "
                  "(نخستین acceptedِ سه‌عضویِ بخشِ نهایی‌ها؛ r391 دوبخشیِ would/could داشت)؛ دوبخشیِ چاپیِ ق۳۵ "
                  "(دو ترتیبِ جمله) به accepted دوبخشی بدل شد؛ بانکِ تعریفِ l105 به ترتیبِ چاپِ ستون B (a-e) با "
                  "«to suddenly decide to do something» اضافیِ چاپیِ هرگز-کلید (تثبیتِ ستونِ پایدارِ وزارت)؛ "
                  "گزینه‌های گرامرِ l109 به چینشِ دیداریِ چاپ (a-d تک‌ردیفی — ترتیبِ لایه d,c,b,a آرتیفکتِ RTL بود)؛ "
                  "سه‌گزینه‌ای‌های چاپیِ ق۷-۸ (الف-ج) وفادار حفظ شدند؛ نقش‌های l112 به ترتیبِ خودِ برگه (ق۴۲-۴۷) با "
                  "کلیدِ جدولیِ چاپ (Topic=45/Concluding=46/بقیه Supporting)"),
    "paperMap": ("نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — به‌روزِ r392: دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ "
                 "ص۲۳۴-۲۳۶ [r390]؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸) [r391]؛ "
                 "شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸) ← این راند؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ "
                 "خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ [r388]؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹) [r389]؛ "
                 "برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ [r387]؛ "
                 "شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ [r388]؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ [r386]؛ "
                 "خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ "
                 "دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — "
                 "۱۵ برگه استخراج شد، ۲ برگه باقی است"),
    "skippedSections": [
        "س۱ شنیداریِ صوتیِ باز (ق۱-۶: قصه‌ها/باد/حملِ آن/شرکتِ تأسیسی/غرور/چربی) — ساقه‌ها فقط صوتی‌اند (بدونِ متنِ چاپی)؛ مدل‌های کلید در گارد پیمان شد",
        "س۱۳ پاراگرافِ «smoking» (ق۴۱) — با صرفهٔ داور (گزاره‌های bulletِ چاپ: سرطانِ ریه/افسردگی/عادتِ وحشتناک/اعتیاد)",
        "ق۴۹ خوانداریِ بازِ واژگان — مدلِ چاپیِ «If we have a good vocabulary, we are more interested in reading.» به مخزنِ تایپی رفت (gt رندرِ تایپیِ ق۴۸ را دارد ولی ق۴۹ را ندارد)",
    ],
    "printQuirks": [
        "«30. would/ might/ could give» سه‌گانهٔ چاپی — نخستین acceptedِ سه‌عضویِ بخشِ نهایی‌ها (r391 دوبخشیِ would/could داشت)",
        "«19. (  d  )» و «20. ( b  )» پرانتزهای ناهمگونِ چاپ در کلید (الگویِ r391)",
        "چینشِ گزینه‌های ق۳۱-۳۴ در لایه d,c,b,a اما در چاپِ دیداری تک‌ردیفیِ a-d [z2] — ترتیبِ لایه آرتیفکتِ RTL",
        "«7. c/ picnic» و «8. a/ in the morning» سه‌گزینه‌ای‌های چاپیِ (الف-ج) — وفادار حفظ شد",
        "دو کلیدِ متفاوتِ چاپی برای مجموعهٔ ربطِ یکسان: این برگه «37. or 38. so 39. but 40. and» در برابرِ خرداد ۱۳۹۸ «37. so 38. and 39. but 40. or» — ساقه‌ها هم متفاوت‌اند (بدونِ تناقض)",
        "«25.This book» نقطهٔ چسبیده به شماره (بدونِ فاصله) در ق۲۵",
        "«d……….» و «i………..» حروفِ توپرِ چسبیده به نقطه‌چین در ق۲۴-۲۶ (d-------/i------- پیوند خورد)",
        "«( to spend )» و «( to arrive )» و «( to come )» و «( to give )» فاصلهٔ اولِ پرانتز در ساقه‌های فعل",
        "ق۲۱ «…life skills» بدونِ نقطهٔ پایانیِ چاپ — وفادار حفظ شد",
        "«very fast / the dog / is / can /which /runs / brown.» اسلشِ چسبیدهٔ /which در خامِ ق۳۵",
        "«employed /  during» فاصلهٔ دوبلِ چاپ در خامِ ق۳۶",
        "QRهای «Audio file (MP3)» و «Audio script (PDF)» در دو گوشهٔ بالای ص۲۴۴ — نه پانویس (تفاوت با r391) + شماره‌گذاریِ چاپیِ ۱۴۹-۱۵۳ پایینِ صفحات",
        "نقشِ «Football is really a national sport in my country.» Concluding است (نه Topic) — Topic = 45 «There are many popular sports…» [z3]",
        "«didn't» و «We'll» و «don't» آپاستروف‌های خمیدهٔ لایه در ق۲۹/۳۹ و ق۲۰ و متنِ خوانداری — به آپاستروفِ راست نرمال شد",
        "جای‌جایِ عدددارِ دیالوگِ Sara/Nurse (….12….. / …..13….. / …….14….) با نقطه‌چینِ حروف‌چینیِ متغیر — به ------- یکدست شد",
    ],
    "twinCensus": ("هم‌خانوادگیِ بین‌خانواده‌ای — r292 همین برگه را در grammar-g12-topic.json (l81-l92، ۴۳ آیتم) هم رندر کرده: "
                   "l103↔gt-l81 (ق۷-۹: mcq/mcq/typed — هم‌نوع)، l104↔gt-l82، l105↔gt-l83 (ستونِ B همانِ پنج‌تعریفی)، "
                   "l106↔gt-l84، l107↔gt-l85، l108↔gt-l86 (acceptedِ سه‌گانهٔ would/might/could)، l109↔gt-l87، l110↔gt-l88، "
                   "l111↔gt-l89، l112↔gt-l90 (نقش‌ها: [1,1,1,0,2,1])، l113↔gt-l91 (ق۴۸ تایپی + ق۵۰-۵۲)، l114↔gt-l92؛ "
                   "افزوده‌های r392 فراتر از دوقلو: ق۱۰-۱۱ (شنیداریِ بازِ ساقه‌دار) و ق۱۲-۱۴ (کلوژِ Sara/Nurse — «Dr. Gharib» پیوند با ق۱-۶ و l96-2ِ خرداد) "
                   "که gt ندارد؛ ق۴۹ در gt هم نیست → مخزن؛ جفت‌های بین‌برگه‌ای: «Those sofas convert into bed» (l105-2 ↔ l95-4ِ خرداد ۱۳۹۸ ↔ "
                   "اضافیِ چاپیِ r387-س۵ «The sofa converts into bed.») — سومین تکرار با ستون‌های B متفاوت؛ ستونِ تعریفِ "
                   "«for all time / to change in form or character / to stop being angry with someone» (l105 ↔ خانوادهٔ تعریف‌های وزارت)؛ "
                   "«Being able to communicate…effectively» (l106-1 ↔ r380ِ خرداد ۱۴۰۲ «21. effectively» — ساقهٔ عیناً چاپی)؛ "
                   "«consume» (l104-2 ↔ l96-1ِ خرداد ۱۳۹۸ بانکِ چاپ)؛ «wind turbines» (l114 متنِ انرژی ↔ l94-2/l43/l68/l79/l85 — تمِ پایدارِ وزارت)؛ "
                   "«Dr. Gharib» (l103-6..8 ↔ l96-2/l96-3ِ خرداد و مدلِ صوتیِ «2. Dr. Gharib» این برگه)؛ "
                   "«diary» (l107-1 ↔ تعریفِ «a book in which you record your thoughts…» l95-2ِ خرداد)؛ "
                   "«If we found two hundred dollars…» شرطیِ نوع دوم (l108-4 ↔ خانوادهٔ شرطی‌های نهایی‌ها)"),
    "futureNote": ("کاندیدهای تایپیِ این برگه: ق۴۹ (مدلِ چاپیِ If we have a good vocabulary…) به کاندیدهای r380-r391 اضافه شد — "
                   "مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۸۳ ردیف است (۸۲ِ r391 + ۱ ردیفِ تازه)؛ ق۱-۶ شنیداریِ بازِ بی‌ساقهٔ چاپی — "
                   "قابلِ بانک‌شدن نیستند؛ ق۴۱ پاراگرافِ smoking با صرفهٔ داور؛ ۲ برگه باقی است (نزدیک‌ترین: دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلیدِ ص۲۵۷-۲۵۸؛ "
                   "سپس برگهٔ لایه‌خراب ص۲۷۷-۲۸۴)؛ بانکِ تایپیِ نهایی از ۸۳ ردیفِ مخزن قابلِ ساخت است؛ "
                   "فیلدِ تصویرِ QuizQuestion هنوز نیازمندِ تصویبِ کاربر است (ق۱۵-۱۶ با ساقهٔ خودبسنده تایپی شدند — الگویِ l94)"),
    "engineNote": ("شش بانکِ تایپیِ تازه: l104 (تصویریِ خودبسنده)، l106 (بانکِ چاپیِ چهارواژه‌ای — generousِ اضافیِ چاپ)، "
                   "l107 (حرف‌اولِ d-------/i-------)، l108 (فعل با acceptedِ سه‌عضویِ would/might/could)، l110 (جمله‌سازیِ خام با دو ترتیبِ چاپ)، "
                   "l111 (ربطِ تایپی — برخلافِ l100ِ mcqِ خرداد؛ هم‌سو با gt-l89) + دو بانکِ ترکیبی: l103 (۲ mcq + ۶ تایپیِ شنیداری) و "
                   "l113 (۱ تایپی + ۳ mcqِ خوانداری) — نخستین بانک‌های ترکیبیِ tests-g12 (level=«ترکیبی»)؛ "
                   "l112 نخستین بانکِ نقش‌محورِ استخراج‌شدهٔ tests-g12 (سه‌گزینه‌ای — کاندیدِ آبِ r391 همچنان ثبت‌شده)؛ "
                   "متنِ کاملِ دو خوانداری در ساقه (الگویِ l101/l102)؛ بانک‌های تایپی/ترکیبی از حلقهٔ MCQ-خالصِ گاردها مستثنی‌اند"),
}

F.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r392 OK: +{len(NEW)} banks / +{sum(b['count'] for b in NEW)} items -> {len(d['lessons'])} banks / {total} items")
