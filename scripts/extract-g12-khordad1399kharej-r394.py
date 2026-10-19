#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r394 — برگهٔ شانزدهمِ نهایی‌ها: خرداد ۱۳۹۹ داوطلبانِ آزادِ خارجِ از کشور (کلیهٔ رشته‌های نظری،
ص۲۷۷-۲۸۲ + کلیدِ ص۲۸۳-۲۸۴، تاریخِ چاپیِ ۱۳۹۹/۳/۳۱) — برگه‌ای که paperMap آن را «لایه‌خراب» نامیده بود؛
کشفِ راند: لایهٔ لاتینِ بدنه سالم است و فقط سربرگِ فارسی mojibake دارد — هویتِ برگه با خوانشِ دیداریِ رندر
محقق شد («داوطلبان آزاد خارج از کشور (خرداد ماه) سال ۱۳۹۹»)؛ gt (r292) همین برگه را با عنوانِ نادرستِ
«نهایی شهریور ۹۹» (gt-l138-l153، ۱۶ بانک/۵۴ آیتم) رندر کرده.
۱۳ بانک / ۵۴ آیتم → tests-g12.json (l129-l141) + رسیدِ g12nahaie16. idempotent (اجرای دوم = NO-OP).
مستثنی: س۴ (ق۱۳-۱۶ تصویریِ چهارگزینه‌ای — گره‌خورده به فیلدِ تصویر) و س۱۵ (پاراگرافِ دکتر غریب — بی‌مدل).
با این راند بخشِ نهایی‌های دارایِ لایه کامل می‌شود: ۱۷ از ۱۷.
"""
import json
from pathlib import Path

F = Path("/home/z/my-project/public/jozve/tests-g12.json")
d = json.loads(F.read_text(encoding="utf-8"))
src = d["source"]
if "g12nahaie16" in src:
    print("NO-OP: g12nahaie16 already present")
    raise SystemExit(0)

# ---------- متن‌های چاپیِ داوری‌شده ----------
SUPERHUMAN = (
    "Have you ever wished to become a superhuman? It is said that superhuman has {b5} "
    "abilities, for example He can fly or read people's {b6} He may become {b7} or sometimes "
    "very strong to help others. Do you like to {b8} a superhuman?"
)
ENVIRONMENT = (
    "For many environmentalists, the world seems to be getting worse; they have developed long "
    "lists of our main fears. Natural resources are running out, the population is growing; "
    "leaving less food to eat, animals and plants are becoming extinct in great numbers and the "
    "planet's air and water are becoming ever more polluted. But a quick look at the facts shows "
    "a different picture. According to the book \"the limits to Growth\" which was published in "
    "1972 by a group of scientists, energy and other natural resources have become more than they "
    "were in the past. More food is now produced per each person of the world's population than "
    "any time in history. Fewer people are dying of hunger. Although animals and plants are "
    "becoming extinct, only about 0.7% of them are expected to disappear in the next 50 years, "
    "not 25-50%, which has been predicted. And finally, most forms of environmental population "
    "appear to have been increased."
)
BABY = (
    "Everyone knows that when a child is born, he cannot speak. Making a few kinds of sound like "
    "crying is the only way he can communicate with others. By crying, he means he is hungry or "
    "he is tired. In this way he can show his feelings, but after a few months, the baby gets "
    "aware of his world. At this time, he's careful about everything around him, especially his "
    "parents. He begins to record what they do, what they say and how they act. He even records "
    "his parents' accent, tone of voice, or gesture. Then the baby starts to act like them, that "
    "is he tries to copy them. By acting like his parents, he'll be able to say his first words "
    "which are very simple. As he grows up, the child's speaking ability improves, and when he "
    "gets older, he can choose proper words, and expressions to say exactly what he wants."
)
BL = "---------------"  # جای خالیِ یکدست

def sup_text(current: int) -> str:
    """متنِ سوپرهیومن با جای خالیِ جاری به‌صورتِ خطِ تیره و بقیه با شمارهٔ چاپی."""
    m = {5: BL, 6: "(6) ..............", 7: "(7) .............", 8: "(8) ............."}
    m[current] = BL
    return (f"Have you ever wished to become a superhuman? It is said that superhuman has {m[5]} "
            f"abilities, for example He can fly or read people's {m[6]} He may become {m[7]} "
            f"or sometimes very strong to help others. Do you like to {m[8]} a superhuman?")

# ---------- سازنده‌ها ----------
def bank(lesson, title, level, items):
    return {"lesson": lesson, "title": title, "level": level, "count": len(items), "questions": items}

def mcq(lid, n, cat, question, options, answer):
    return {"id": f"g12-l{lid}-{n}", "n": n, "category": cat, "question": question,
            "options": options, "answer": answer}

def typed(lid, n, cat, question, accepted):
    return {"id": f"g12-l{lid}-{n}", "n": n, "category": cat, "question": question,
            "options": [accepted[0]], "answer": 0, "kind": "typed", "accepted": accepted}

# ---------- l129 — شنیداریِ بخشِ الف (س۱، ص۲۷۷): ق۱-۴ = ۴ mcq (چاپِ چهارگزینه‌ایِ کامل — دوقلو در ق۲/۳ گزینهٔ d را انداخته بود) ----------
l129 = [
    mcq(129, 1, "grammar", "The girl doesn't need --------------- because she had bought some before.",
        ["pencils", "dictionaries", "notebooks", "pens"], 3),
    mcq(129, 2, "grammar", "The present was a --------------- .",
        ["pen", "pencil", "dictionary", "notebook"], 2),
    mcq(129, 3, "grammar", "The girl got a gift because she had gotten a good --------------- .",
        ["score", "dictionary", "scarf", "notebook"], 0),
    mcq(129, 4, "grammar", "The man thinks the girl is a --------------- student.",
        ["lazy", "busy", "clever", "funny"], 2),
]

# ---------- l130 — کلوژِ شنیداریِ سوپرهیومن (س۲، ص۲۷۷): ق۵-۸ = ۴ تایپی با متنِ کامل در ساقه ----------
l130 = [
    typed(130, 1, "grammar", sup_text(5), ["wonderful"]),
    typed(130, 2, "grammar", sup_text(6), ["minds"]),
    typed(130, 3, "grammar", sup_text(7), ["invisible"]),
    typed(130, 4, "grammar", sup_text(8), ["visit"]),
]

# ---------- l131 — کلوژِ شنیداریِ خودروهای برقی (س۳، ص۲۷۷): ق۹-۱۲ = ۴ تایپی ----------
l131 = [
    typed(131, 1, "grammar",
        "The needs for Electric cars are increasing in many --------------- countries.",
        ["developed"]),
    typed(131, 2, "grammar",
        "Electricity is stored in ---------------on the electric cars.",
        ["batteries"]),
    typed(131, 3, "grammar",
        "Hybrid cars combine the --------------- of gasoline engines and electric motors.",
        ["benefit"]),
    typed(131, 4, "grammar",
        "Hybrid cars are designed to meet different --------------- , such as better fuel economy or more power.",
        ["goals"]),
]

# ---------- l132 — تعریف‌یابیِ ستونِ B (س۵، ص۲۷۸): ق۱۷-۲۰ = ۴ mcq پنج‌گزینه‌ای (c اضافیِ هرگز-کلید) ----------
DEF_B = [
    "To put things in a useful order",             # a
    "To cry suddenly",                             # b
    "To take something in",                        # c (اضافیِ چاپ — هرگز-کلید)
    "Many different types of things or people",    # d
    "Birds of a feather flock together",           # e
]
l132 = [
    mcq(132, 1, "vocab", "The people of this city come from a variety of different background.", DEF_B, 3),
    mcq(132, 2, "vocab", "People like to spend time with others who are similar to them.", DEF_B, 4),
    mcq(132, 3, "vocab", "His books are neatly arranged in alphabetical order.", DEF_B, 0),
    mcq(132, 4, "vocab", "The children burst into tears on hearing of the death of their grandfather.", DEF_B, 1),
]

# ---------- l133 — واژگانِ بانکِ چاپ (س۶، ص۲۷۹): ق۲۱-۲۳ = ۳ تایپی (forgive اضافیِ چاپ) — الگویِ l106 ----------
l133 = [
    typed(133, 1, "vocab",
        "Wind towers are natural air --------------- systems and can be used instead of electrical air conditioners.",
        ["cooling"]),
    typed(133, 2, "vocab",
        "Ghasem Soleimani is regarded as a --------------- person because he spared no pains to help people.",
        ["dedicated"]),
    typed(133, 3, "vocab",
        ".As a great artist, he has used a --------------- of paints in his works.",
        ["combination"]),
]

# ---------- l134 — دانشِ خودِ حرف‌اول (س۷، ص۲۷۹): ق۲۴-۲۶ = ۳ تایپی (diary/demand/absorb) ----------
l134 = [
    typed(134, 1, "vocab",
        "A book which you record your thoughts or feelings or what has happened every day is called a d-------.",
        ["diary"]),
    typed(134, 2, "vocab",
        "Nowadays d------- for organic food is increasing",
        ["demand"]),
    typed(134, 3, "vocab",
        "Plants a------- carbon dioxide from the air.",
        ["absorb"]),
]

# ---------- l135 — گرامرِ چهارگزینه‌ای (س۸، ص۲۷۹): ق۲۷-۳۰ با چینشِ دیداریِ a-d ----------
l135 = [
    mcq(135, 1, "grammar", "The police caught the one --------------- was entering into my flat.",
        ["which", "when", "who", "whose"], 2),
    mcq(135, 2, "grammar", "The team had a football match, but it finished --------------- .",
        ["success", "unsuccessfully", "succeed", "unsuccessful"], 1),
    mcq(135, 3, "grammar", "Alcohol --------------- by an Iranian scientist called Razi many years ago.",
        ["was discovering", "was discovered", "has discovered", "had discovered"], 1),
    mcq(135, 4, "grammar", "My parents bought a ball for my brother because he --------------- his in the park.",
        ["to lose", "had lost", "was lost", "would lose"], 1),
]

# ---------- l136 — شکلِ صحیحِ فعلِ مکالمهٔ Jack/Kevin (س۹، ص۲۷۹): ق۳۱-۳۴ = ۴ تایپی ----------
l136 = [
    typed(136, 1, "grammar",
        "Jack: It --------------- rather cold today, doesn't it? (to seem)",
        ["seems"]),
    typed(136, 2, "grammar",
        "Kevin: Yes, I --------------- to go swimming before I left home. (to decide)",
        ["had decided"]),
    typed(136, 3, "grammar",
        "Jack: It's a pity! If it were fine, we --------------- swimming today. (to go)",
        ["would go"]),
    typed(136, 4, "grammar",
        "Jack: I know a restaurant in which special seafood --------------- (to serve)",
        ["is served"]),
]

# ---------- l137 — مرتب‌کردنِ کلمات (س۱۰، ص۲۸۰): ق۳۵-۳۶ = ۲ تایپی (خامِ چاپِ وفادار) ----------
l137 = [
    typed(137, 1, "grammar",
        "if/ could / he / a car/ my uncle /his driving test / passed/ drive.",
        ["If my uncle passed his driving test, he could drive a car."]),
    typed(137, 2, "grammar",
        "my mother/ this / the golden watch / is / which/ to buy/ wants/.",
        ["My mother wants to buy this, which is the golden watch."]),
]

# ---------- l138 — خوانداریِ محیط‌زیست (س۱۱، ص۲۸۰): ق۳۷-۴۲ = ۶ ترکیبی (۲ mcq + ۲ T/F + ۲ تایپی) ----------
l138 = [
    mcq(138, 1, "vocab", ENVIRONMENT + " — The main idea of this passage is ....",
        ["a number of animals and plants are becoming extinct",
         "animals and plants extinction are happening at very high speed",
         "an increase in most forms of environmental population",
         "extinction is happening at a much higher rate, not the number that people think"], 2),
    mcq(138, 2, "vocab",
        ENVIRONMENT + " — The scientists who wrote the book 'The limits to Growth' believed that energy and other natural resources --------------- .",
        ["are endless", "would soon be used", "are more than they were in the past", "disappear quickly"], 2),
    mcq(138, 3, "vocab",
        ENVIRONMENT + " — According to environmentalists, energy and natural resources are not disappearing.",
        ["True", "False"], 1),
    mcq(138, 4, "vocab",
        ENVIRONMENT + " — Scientists believe that animals and plants are becoming extinct at lower rate.",
        ["True", "False"], 0),
    typed(138, 5, "vocab",
        ENVIRONMENT + " — What do environmentalists think about the world?",
        ["They think that the world seems to be getting worse."]),
    typed(138, 6, "vocab",
        ENVIRONMENT + " — What do the scientists believe about energy and natural resources?",
        ["They believe that energy and natural resources have become more than they were in the past."]),
]

# ---------- l139 — خوانداریِ نوزاد (س۱۲، ص۲۸۱): ق۴۳-۴۸ = ۶ ترکیبی (۲ mcq + ۲ T/F + ۲ تایپی) ----------
l139 = [
    mcq(139, 1, "vocab", BABY + " — The only way of communication for a newborn baby is --------------- .",
        ["his facial expressions", "crying", "saying difficult words", "gestures"], 1),
    mcq(139, 2, "vocab", BABY + ' — The word "act" is closest in meaning to --------------- .',
        ["remind", "copy", "change", "respect"], 1),
    mcq(139, 3, "vocab", BABY + " — The first child's words are very simple.",
        ["True", "False"], 0),
    mcq(139, 4, "vocab", BABY + " — Parents' gestures are also difficult to practice.",
        ["True", "False"], 1),
    typed(139, 5, "vocab", BABY + " — How can a baby show his feelings?",
        ["A baby can show his feeling by crying."]),
    typed(139, 6, "vocab", BABY + " — What does a child do when he gets older?",
        ["When he gets older he can choose proper words and expressions to say what he wants."]),
]

# ---------- l140 — حروفِ ربط (س۱۳، ص۲۸۲): ق۴۹-۵۲ = ۴ تایپی (کلیدهای چاپی: and/so/or/but — سومین توالیِ متمایز) ----------
l140 = [
    typed(140, 1, "grammar",
        "They went to the park yesterday, --------------- they had a wonderful time.",
        ["and"]),
    typed(140, 2, "grammar",
        "These shoes aren't comfortable, --------------- I rarely wear them.",
        ["so"]),
    typed(140, 3, "grammar",
        "You can buy a car, --------------- you can save your money.",
        ["or"]),
    typed(140, 4, "grammar",
        "She loves apples, --------------- she hates bananas.",
        ["but"]),
]

# ---------- l141 — نقش‌های پاراگرافِ آب (س۱۴، ص۲۸۲): جمله‌های a-f = ۶ mcq نقش‌محور با کلیدِ چاپی — دومین بانکِ نقش‌محورِ استخراج‌شده ----------
ROLES = ["Topic sentence", "Supporting sentence", "Concluding sentence"]
l141 = [
    mcq(141, 1, "grammar", "Thus, water is very important to our life and our planet.", ROLES, 2),
    mcq(141, 2, "grammar", "But also the wild life is going to extinct without it.", ROLES, 1),
    mcq(141, 3, "grammar", "Water is the most essential element in our life.", ROLES, 0),
    mcq(141, 4, "grammar", "We need water to drink, to wash, to cook and to grow vegetables and fruits.", ROLES, 1),
    mcq(141, 5, "grammar", "Not only human will die without water.", ROLES, 1),
    mcq(141, 6, "grammar", "Water is also essential for animals, birds, insects, etc", ROLES, 1),
]

NEW = [
    bank(129, "نهایی خرداد ۱۳۹۹ خارج از کشور — شنیداریِ بخشِ الف (س۱، ص۲۷۷)", "چهارگزینه‌ای", l129),
    bank(130, "نهایی خرداد ۱۳۹۹ خارج از کشور — کلوژِ شنیداریِ سوپرهیومن — تایپی (س۲، ص۲۷۷)", "تایپی", l130),
    bank(131, "نهایی خرداد ۱۳۹۹ خارج از کشور — کلوژِ شنیداریِ خودروهای برقی — تایپی (س۳، ص۲۷۷)", "تایپی", l131),
    bank(132, "نهایی خرداد ۱۳۹۹ خارج از کشور — تعریف‌یابیِ ستونِ B (س۵، ص۲۷۸)", "پنج‌گزینه‌ای", l132),
    bank(133, "نهایی خرداد ۱۳۹۹ خارج از کشور — واژگانِ بانکِ چاپ — تایپی (س۶، ص۲۷۹)", "تایپی", l133),
    bank(134, "نهایی خرداد ۱۳۹۹ خارج از کشور — دانشِ خودِ حرف‌اول — تایپی (س۷، ص۲۷۹)", "تایپی", l134),
    bank(135, "نهایی خرداد ۱۳۹۹ خارج از کشور — گرامرِ چهارگزینه‌ای (س۸، ص۲۷۹)", "چهارگزینه‌ای", l135),
    bank(136, "نهایی خرداد ۱۳۹۹ خارج از کشور — شکلِ صحیحِ فعلِ مکالمهٔ Jack/Kevin — تایپی (س۹، ص۲۷۹)", "تایپی", l136),
    bank(137, "نهایی خرداد ۱۳۹۹ خارج از کشور — مرتب‌کردنِ کلمات — تایپی (س۱۰، ص۲۸۰)", "تایپی", l137),
    bank(138, "نهایی خرداد ۱۳۹۹ خارج از کشور — خوانداریِ محیط‌زیست — ترکیبی (س۱۱، ص۲۸۰)", "ترکیبی", l138),
    bank(139, "نهایی خرداد ۱۳۹۹ خارج از کشور — خوانداریِ نوزاد — ترکیبی (س۱۲، ص۲۸۱)", "ترکیبی", l139),
    bank(140, "نهایی خرداد ۱۳۹۹ خارج از کشور — حروفِ ربط — تایپی (س۱۳، ص۲۸۲)", "تایپی", l140),
    bank(141, "نهایی خرداد ۱۳۹۹ خارج از کشور — نقش‌های پاراگرافِ آب (س۱۴، ص۲۸۲)", "سه‌گزینه‌ای", l141),
]
for b in NEW:
    d["lessons"].append(b)

src["g12nahaie16"] = {
    "extractedRound": "r394",
    "section": ("بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ شانزدهم: "
                "«سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۳۹۹ ویژهٔ داوطلبانِ آزادِ خارجِ از کشور — "
                "کلیهٔ رشته‌های نظری — برگه‌ای که paperMap آن را «لایه‌خرابِ ص۲۷۷-۲۸۴» نامیده بود"),
    "examPages": ("pdf-p277-282 (شش صفحهٔ آزمون) + کلیدِ رسمی: pdf-p283-284 با سربرگِ «Answer key»؛ "
                  "مرزِ برگه‌ها = p276 → p277 (پس از خرداد ۱۳۹۹ انسانیِ r389) و p284 → p285 (سراسریِ شهریور ۱۳۹۹ِ r387)"),
    "examMeta": ("امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — "
                 "رشته: کلیهٔ رشته‌های نظری — نوبت خردادماه ۱۳۹۹ داوطلبانِ آزادِ خارجِ از کشور (تاریخِ چاپی: "
                 "۱۳۹۹/۳/۳۱) — ساعت شروع ۱۰ صبح به افقِ تهران — مدت ۱۲۰ دقیقه — ۶ صفحه/۱۵ ردیف/جمعِ نمرهٔ ۴۰ — "
                 "مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — سومین برگهٔ خرداد ۹۹ در جزوه (کنارِ ریاضی-تجربیِ r388 و "
                 "انسانیِ r389) و نخستین برگهٔ خارجِ از کشور؛ **لایهٔ فارسیِ سربرگ کاملاً خراب است (mojibake) و هویتِ "
                 "برگه فقط با خوانشِ دیداریِ رندرِ ۱۵۰dpi محقق شد** — لایهٔ لاتینِ بدنه سالم بود و «لایه‌خرابِ» paperMap "
                 "فقط به سربرگ می‌خورد؛ QRهای «Audio file (MP3)» و «Audio script (PDF)» در دو گوشهٔ بالای ص۲۷۷"),
    "keyPages": ("pdf-p283-284 «Answer key» — قالبِ واژه‌ایِ «1. d» و «5. wonderful» و جمله‌ایِ «35. If my uncle "
                 "passed his driving test, he could drive a car.» — ۵۴ کلید در گارد پیمان می‌شود (۴۸ سؤالِ شماره‌دارِ "
                 "رندرشده + ۶ جملهٔ نقش‌محورِ س۱۴)؛ **غلطِ املاییِ «28. unseccessfully» در خودِ کلیدِ چاپی** (گزینهٔ "
                 "چاپیِ b درست است: unsuccessfully) — وفادار نقل شد؛ هیچ کلیدِ بریده یا استنتاجی نیست — سومین برگهٔ پیاپی"),
    "keyVerification": ("کلیدِ چاپی عیناً نقل شد: «1. d 2. c 3. a 4. c» / «5. wonderful 6. minds 7. invisible 8. visit» / "
                 "«9. developed 10. batteries 11. benefit 12. goals» / «13. c 14. b 15. d 16. a» (تصویری — مستثنی) / "
                 "«17. d 18. e 19. a 20. b» / «21. cooling 22. dedicated 23. combination» (forgive اضافیِ چاپ) / "
                 "«24. diary 25. demand 26. absorb» / «27. who 28. unseccessfully 29. was discovered 30. had lost» / "
                 "«31. seems 32. had decided 33. would go 34. is served» / «35. If my uncle passed his driving test, "
                 "he could drive a car.» «36. My mother wants to buy this, which is the golden watch.» / "
                 "«37. c 38. c 39. False 40. True» / «41. They think that the world seems to be getting worse.» "
                 "«42. They believe that energy and natural resources have become more than they were in the past.» / "
                 "«43. b 44. b 45. True 46. False» / «47. A baby can show his feeling by crying.» «48. When he gets "
                 "older he can choose proper words and expressions to say what he wants.» / «49. and 50. so 51. or "
                 "52. but» / جدولِ نقش‌های س۱۴: «c: Topic sentence / d: supporting / f: supporting / e: supporting / "
                 "b: supporting / a: concluding» / س۱۵ (دکتر غریب) فقط یادداشتِ نمره‌دهی (۳ نمره)"),
    "sectionsTotal": 52,
    "sectionsExtracted": 48,
    "sectionsSkipped": 4,
    "items": 54,
    "bankCounts": [4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6],
    "keyPolicy": ("همهٔ کلیدها از «Answer key» چاپی می‌آیند (عینِ چاپ) — سومین برگهٔ پیاپیِ بدونِ کلیدِ بریده/استنتاجی؛ "
                  "چاپِ چهارگزینه‌ایِ کاملِ ق۲/۳ (با d notebook) بازگردانده شد — دوقلو (gt-l138) سه‌گزینه‌ای رندر کرده بود؛ "
                  "ستونِ تعریفِ l132 به ترتیبِ چاپِ ستون B (a-e) با «To take something in» اضافیِ هرگز-کلید؛ "
                  "بانکِ l133 تایپی به الگویِ l106 (بانکِ چهارواژه‌ای — forgive اضافی)؛ حروفِ توپرِ «a d-------» به‌صورتِ "
                  "دیداریِ چاپ (مقاله + حرف) — لایه «ad» چسبیده داشت؛ متنِ کاملِ سوپرهیومن و دو خوانداری در ساقه‌ها "
                  "(الگویِ l127/l128) با جای خالیِ جاریِ خط‌تیره و بقیهٔ جاهای خالیِ شماره‌دارِ چاپ؛ نقش‌های l141 به "
                  "ترتیبِ خودِ برگه (a-f) با کلیدِ جدولیِ چاپ (Topic=c/Concluding=a/بقیه Supporting)"),
    "paperMap": ("نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — به‌روزِ r394: دی ۱۳۹۷ ص۲۲۹-۲۳۳ [r390]؛ "
                 "خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ [r391]؛ شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ [r392]؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ [r393]؛ "
                 "خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ [r388]؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ [r389]؛ "
                 "**خرداد ۱۳۹۹ خارج از کشور ص۲۷۷-۲۸۲ + کلید ص۲۸۳-۲۸۴ ← این راند (همان «لایه‌خرابِ» paperMap — "
                 "هویتِ واقعی با خوانشِ دیداری محقق شد)**؛ سراسریِ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ [r387]؛ "
                 "ناشنوایانِ شهریور ۱۳۹۹ ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ [r388]؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ [r386]؛ "
                 "خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ "
                 "دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — "
                 "**۱۷ برگه استخراج شد، ۰ برگه باقی است — بخشِ نهایی‌های دارایِ لایه کامل شد**"),
    "skippedSections": [
        "س۴ واژگانِ تصویریِ چهارگزینه‌ای (ق۱۳-۱۶) — گزینه‌ها خودِ تصاویرند (پنلِ خورشیدی/کبوتر/دیکشنریِ آکسفورد/توربینِ باد) و کلید حرفِ تصویر است (c/b/d/a) — بدونِ فیلدِ تصویرِ QuizQuestion قابلِ رندرِ متنی نیست (دوقلو با ساقهٔ فارسی و گزینه‌های جمله‌ای رندر کرده بود — به‌خاطرِ خلوصِ لاتین و بی‌پاسخیِ متنیِ item دنبال نشد)؛ «monolingual dictionary» (ق۱۳ ↔ l118-2)، «pigeons» (ق۱۴ ↔ l104-1) و «wind turbines» (ق۱۵) واژه‌هایش در بانک‌های دیگر زنده‌اند",
        "س۱۵ پاراگرافِ دکتر محمود غریب (با عکس و داده‌های چاپی: تولدِ ۵ ژوئیهٔ ۱۹۰۹ تهران/درگذشتِ ۲۰ ژانویهٔ ۱۹۷۵/دانشگاهِ پاریس/پزشک و استادِ دانشگاه) — مدلِ چاپی ندارد؛ داده‌ها ↔ l96-2/l96-3 و مدلِ صوتیِ «2. Dr. Gharib» شهریور ۱۳۹۸ (ر392)",
    ],
    "printQuirks": [
        "لایهٔ فارسیِ سربرگِ همهٔ صفحات mojibake است («,rl\\1\\/f/n» = خردادِ رمزگذاری‌شده) — هویتِ برگه فقط از رندرِ دیداری: «داوطلبان آزاد خارج از کشور (خرداد ماه) سال ۱۳۹۹»",
        "«28. unseccessfully» غلطِ املایی در خودِ کلیدِ چاپی (گزینهٔ چاپی b صحیح: unsuccessfully) — کلید وفادار نقل شد",
        "«23. .As a great artist» نقطهٔ آغازینِ چاپ در ق۲۳ — وفادار حفظ شد",
        "«Alcohol……………by» چسبیدگیِ نقطه‌چین (با نقطهٔ سرگردانِ لایه: «Alcohol. ...........») به Alcohol در ق۲۹ — به فاصله‌دار نرمال شد",
        "«is called a d………» — چاپِ دیداری «a d» جدا با حرفِ توپر؛ لایه «ad ......» چسبیده داشت — به شکلِ دیداری («a d-------») رندر شد",
        "«25. Nowadays d……. for organic food is increasing» بدونِ نقطهٔ پایانیِ چاپ — وفادار (الگویِ l106-1)",
        "«environmental population» غلطِ چاپیِ متنِ محیط‌زیست برای pollution — در ساقه و در گزینهٔ درستِ ق۳۷ وفادار حفظ شد",
        "«\"the limits to Growth\"» کوتیشنِ دوتایی و حروفِ ناهمگونِ نامِ کتاب در متن و ق۳۸ (تک‌کوتیشن در ق۳۸) — وفادار",
        "«Water is also essential for animals, birds, insects, etc» بدونِ نقطهٔ پایانی در جملهٔ fِ نقش‌ها — وفادار",
        "تعدادِ صفحاتِ ناهمگونِ سربرگ: ص۲۷۷ «۴» در برابرِ ص۲۷۸/۲۸۲/۲۸۳ «۶»",
        "«b)busy» بدونِ فاصله پس از پرانتز در ق۴ — وفادار",
        "«47. A baby can show his feeling by crying.» feelingِ مفردِ کلید — وفادار (gt هم)",
        "«Wind towers are natural air --------------- systems» با فاصله — در برابرِ چسبیدهٔ «---------------systems» دی ۹۸ (l120-4) — دو برگه، دو چاپ",
        "«forgive, cooling , dedicated , combination» فاصله‌های پیش از ویرگول در بانکِ چاپِ س۶",
        "گزینهٔ درستِ ق۳۷ (c) خودِ عبارتِ معیوبِ «an increase in most forms of environmental population» است — کلیدِ رسمی",
        "QRهای «Audio file (MP3)» و «Audio script (PDF)» در دو گوشهٔ بالای ص۲۷۷ + سربرگِ کلید با عنوانِ «Answer key»",
    ],
    "twinCensus": ("هم‌خانوادگیِ بین‌خانواده‌ای — r292 همین برگه را در grammar-g12-topic.json با عنوانِ نادرستِ "
                   "«نهایی شهریور ۹۹» (gt-l138-l153، ۱۶ بانک/۵۴ آیتم) رندر کرده — عنوانِ درست از سربرگِ دیداری: "
                   "خرداد ۱۳۹۹ داوطلبانِ آزادِ خارجِ از کشور؛ نقشهٔ تناظر: l129↔gt-l138 (با بازگردانیِ گزینهٔ dِ ق۲/۳)، "
                   "l130↔gt-l139، l131↔gt-l140، l132↔gt-l142، l133↔gt-l143، l134↔gt-l144، l135↔gt-l145، l136↔gt-l146، "
                   "l137↔gt-l147، l138↔gt-l148+gt-l149 (دو بانکِ دوقلو در یک بانکِ ترکیبی)، l139↔gt-l150+gt-l151، "
                   "l140↔gt-l152، l141↔gt-l153 (نقش‌ها: [2,1,0,1,1,1] همسان)؛ ق۱۳-۱۶: دوقلو با ساقهٔ فارسی و گزینه‌های "
                   "جمله‌ای رندر کرده (gt-l141) — ما مستثنی کردیم (تصویریِ حرف-کلید؛ خلوصِ لاتین + بی‌پاسخیِ متنی)؛ "
                   "جفت‌های بین‌برگه‌ای: «spared no pains» (ق۲۲ ↔ l96-3 ↔ r388-l68 ↔ r298 ↔ r390-l87 — پنجمین تکرار)، "
                   "«Wind towers are natural air --------------- systems» (ق۲۱ ↔ l120-4ِ دی ۹۸ — همان ساقه با فاصله‌گذاریِ متفاوت)، "
                   "«Nowadays d------- for organic food» (ق۲۵ ↔ l107-3ِ شهریور ۱۳۹۸ — همان ساقه)، "
                   "«diary» (ق۲۴ ↔ l107-1 ↔ تعریفِ l95-2ِ خرداد ۱۳۹۸ — تعریفِ مشترکِ وزارت این‌بار به‌صورتِ جمله)، "
                   "«burst into tears» (ق۲۰ ↔ l109-4ِ شهریور ۱۳۹۸ «Aida burst into tears»)، "
                   "خودروهای برقی (ق۹-۱۲ ↔ l127ِ دی ۹۸ + متنِ انرژیِ l114 — تمِ پایدار؛ «batteries» ق۱۰ ↔ متنِ l127)، "
                   "«She loves apples, --------------- she hates bananas.» (ق۵۲ ↔ l125-3ِ دی ۹۸ «My sister loves apples…» — ساقهٔ نزدیک، کلیدِ یکسانِ but)، "
                   "«You can buy a car, --------------- you can save your money.» (ق۵۱ ↔ l111-1ِ شهریور «You can buy a shirt…» — واریانتِ shirt→car، کلیدِ یکسانِ or)، "
                   "شرطیِ نوعِ دوم (ق۳۳ و ق۳۵ ↔ خانوادهٔ شرطی‌های نهایی‌ها: l108-4 و l85)، «Dr. Gharib» (س۱۵ ↔ l96-2/l96-3 ↔ مدلِ صوتیِ l103)، "
                   "پاراگرافِ آب (س۱۴ ↔ کاندیدِ آبِ r391 ↔ نقش‌های r387 — سومین پاراگرافِ آب و دومینِ دارایِ کلیدِ چاپی)، "
                   "«absorb carbon dioxide» (ق۲۶ ↔ متنِ درخت‌های l126ِ دی ۹۸)"),
    "futureNote": ("مخزنِ بانکِ تایپیِ نهایی بدونِ تغییر در ۸۹ ردیف ماند (مدل‌های تایپیِ ق۴۱/۴۲/۴۷/۴۸ همین راند در "
                   "بانک‌های ترکیبیِ l138/l139 رندر شدند)؛ **بخشِ نهایی‌های دارایِ لایه کامل شد: ۱۷ از ۱۷ برگه** — "
                   "آیندهٔ بخش فقط: (۱) فیلدِ تصویرِ QuizQuestion (REQUIRES-APPROVAL) برای س۴ِ همین برگه و سکشن‌های "
                   "تصویریِ داوری‌شدهٔ قبلی، (۲) بانکِ تایپیِ نهایی از مخزنِ ۸۹ ردیفی، (۳) case-sensitive mode؛ "
                   "پس از این راند «استخراجِ جزوه‌های آزمونی» همهٔ کارت‌ها + بخشِ نهایی‌ها بسته است"),
    "engineNote": ("هشت بانکِ تایپی/ترکیبیِ تازه: l130 (کلوژ با متنِ کامل و جای خالیِ نشانه‌گذاری‌شده — الگویِ جدید برای "
                   "کلوژهای چندبخشی)، l131، l133، l134 (حرف‌اولِ «a d-------»)، l136 (مکالمه با پیشوندِ گوینده)، l137، "
                   "l140، + دو بانکِ ترکیبیِ خوانداری: l138/l139 (هر یک: ۲ mcq + ۲ True/False + ۲ تایپیِ مدل‌دار)؛ "
                   "دومین بانکِ نقش‌محورِ استخراج‌شده (l141 — بعد از l112 فوتبال) با کلیدِ جدولیِ چاپ؛ "
                   "سومین توالیِ ربطِ متمایزِ نهایی‌ها (and/so/or/but — بعدِ so/and/but/orِ خرداد ۹۸ و or/so/but/andِ "
                   "شهریور/دی ۹۸)؛ l129/l132/l135/l141 در حلقهٔ MCQ-خالص؛ l130/l131/l133/l134/l136/l137/l140 تایپی؛ "
                   "l138/l139 ترکیبی و مستثنی از حلقه"),
}

F.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r394 OK: +{len(NEW)} banks / +{sum(b['count'] for b in NEW)} items -> {len(d['lessons'])} banks / {total} items")
