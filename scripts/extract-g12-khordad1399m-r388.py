#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r388 — برگهٔ دهمِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۳۹۹
ریاضی-تجربی (تاریخِ چاپی ۰۵/۰۴/۹۹؛
pdf-p259-265 آزمون + کلیدِ رسمیِ «راهنمای تصحیح» pdf-p266-267)
→ tests-g12.json با ۸ بانکِ تازه (l64=3؛ l65=3؛ l66=4؛ l67=4؛ l68=4؛ l69=4؛ l70=4؛ l71=3) — ۲۹ آیتم
— ۶۳ بانکِ قبلی + این = ۷۱ بانک/۵۹۴ آیتم

جفتِ این راند با برگهٔ لاغرِ ناشنوایان (۶ آیتم) طبق قانونِ «اگر لاغر بود جفت‌کردن».

ساختار آزمون (۱۷ سکشن، ۶۰ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۷ صفحه، شروع ۸ صبح):
  س۱ (۱-۴)    شنیداری (لپ‌تاپ) — صوتی-کلید — مستثنی (کلید: 1. False ( b)/2. False ( b)/
              3. she had the money./4. Because it is so slow.)
  س۲ (۵-۱۰)   شنیداری (اختراع) — صوتی-کلید — مستثنی (کلید: 5.(c)/6.(c)/7. True (a)/8. False (b)/
              9. No, he doesn`t like it./10. No, he doesn`t appreciate the woman`s job. — پاسخِ ۱۰
              در لایهٔ کلید آشفته است (ران‌های جدا: No/he doesn/`s job/t appreciate the woman))
  س۳ (۱۱-۱۵)  شنیداری (تیم) — صوتی-کلید — مستثنی (کلید: 11. False ( b)/12. True (a)/13. creative
              با یادداشتِ «هرکلمه‌ای هم که به نوعی به پاسخ اشاره کند صحیح است»/14. respect each
              other`s abilities./15. He didn`t enjoy working in a team environment a year ago.)
  س۴ (۱۶-۱۹)  تصویری (یک جمله اضافی: c) — تصویری-کلید — مستثنی (کلید: 16.( d )/17.( e )/18.( b )/19.( a )؛
              داوریِ رندرِ ۳۰۰dpi (p260-s4-pictures.png): (16)بادگیرِ سنتی (17)مردِ گیج (18)ذره‌بین روی
              متن (19)دماسنج/دستکشِ پزشکی؛ اضافیِ چاپی = c «Teenagers who help others...»؛
              کوئیرکِ شکستِ سطرِ «Vocabula/ry» و بک‌تیکِ «sun`s rays» در گزینهٔ b)
  س۵ (۲۰-۲۲)  بانکِ ۴واژه‌ایِ چاپ (suppose, honored, demand, overcome — اضافیِ چاپی: demand) → l64
  س۶ (۲۳-۲۵)  حرفِ اول (i----=intermediate ۱۲حرفی؛ r------most=replace ۷حرفی — چسبیده به most؛
              g----=guide ۵حرفی) → l65 با گزینه‌های هم‌شکلِ مهندسی‌شده
  س۷ (۲۶-۲۹)  گرامر MCQ (موصولی/endogerund/tagِ never/مجهولِ شرطی) → l66 (کلیدهای چاپی [c,b,d,b]؛
              «the corps» مفردِ چاپ؛ آپاستروفِ مخلوطِ چاپ: isn’t  she در برابرِ doesn't she؛
              دوفاصلهٔ چاپ در isn’t  she و could  save)
  س۸ (۳۰)     تولیدیِ موصولی (which) — مستثنی («کلیدِ کامل در لایه نیست» — «w»+«hich» آشفته)
  س۹ (۳۱-۳۴)  افعالِ مکالمه‌ای (have been invited/was said/decides/might-would-could choose — کلیدِ
              سه‌گانهٔ چاپ!) — تولیدیِ تایپی — مستثنی؛ ۴ ردیفِ تازه به مخزن
  س۱۰ (۳۵-۴۰) خوانداریِ سختیِ زبان (متنِ تازه): ۳۵-۳۸ → l67 (متنِ کامل در ساقه؛ «first Language»
              مفردِ چاپ؛ «day to day life» بدونِ خطِ فاصله)؛ ۳۹/۴۰ پاسخِ مشتقِ خودِ متن — مستثنی
  س۱۱ (۴۱-۴۶) خوانداریِ منابعِ انرژی (متنِ تازه): ۴۱-۴۴ → l68 («has led into» و «new source» چاپی)؛
              ۴۵/۴۶ پاسخِ مشتقِ خودِ متن — مستثنی (کلیدِ ۴۶ با ارقامِ فارسیِ وارونه در لایه: «٦٤.»)
  س۱۲ (۴۷-۵۰) حروفِ ربطِ پاراگراف (Teachers — نخستین رندرِ پاراگرافیِ این سکشن در مخزن؛ نشانهٔ
              چاپیِ «(N)......» داخلِ جمله → خانهٔ ساده؛ عددِ سؤال خودِ قید است) → l69
  س۱۳ (۵۱-۵۲) تصویری-ربط (COVID/Jimmy) — کلیدهای چاپی: «51. …they should stay at home.» و
              «52. ..he has to do his homework.» — مستثنی
  س۱۴ (۵۳-۵۴) Topic Sentence (Reading/Nature) — تولیدی — مستثنی
  س۱۵ (۵۵-۵۸) انتخابیِ الف/ب: الف تعریف‌یابی (share/variety/polluted/contain؛ اضافیِ چاپیِ d
              «an arrangement in a particular order») → l70؛ ب اصطلاحات (God helps/Two heads/
              Action speak/A burnt child؛ اضافیِ چاپیِ i) → l71 — «Two heads» دوقلویِ ساقهٔ l59-4
              (ستونِ B متفاوت: «better idea.» بدونِ s) — دوقلو شمرده نشد (درسِ John) و کلیدش در رسید
  س۱۶ (۵۹-۶۰) جمله‌سازیِ انتخابیِ a/b — چهار پاسخِ مدلِ چاپی (Mina/My-mother/The-students/
              Can-water؛ بک‌تیکِ چاپ در hadn`t) — کاندیدِ تایپی (۴ ردیفِ تازه به مخزن)
  س۱۷ (c/d)   نگارشِ انتخابیِ تصویری (Water/Damavand/Perspolis/Tahereh Saffarzadeh + پاراگرافِ
              شهید فهمیده با چیپ‌ها) — مستثنی

idempotent: اجرای دوم NO-OP (رسید g12nahaie10).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie10" in d.get("source", {}):
    print("r388-math: receipt g12nahaie10 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie9" in d.get("source", {}), "tests-g12.json (r388-deaf) must exist first"
assert len(d["lessons"]) == 63, f"expected 63 banks before r388-math, got {len(d['lessons'])}"

layer = LAYER.read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(layer):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i


def page_slice(p: int) -> list[str]:
    s = PM[p]
    e = next((v for q, v in sorted(PM.items()) if q > p), len(layer))
    return layer[s:e]


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": int(answer)}


p259 = page_slice(259)
p260 = page_slice(260)
p261 = page_slice(261)
p262 = page_slice(262)
p263 = page_slice(263)
p264 = page_slice(264)
p265 = page_slice(265)
p266 = page_slice(266)
p267 = page_slice(267)
full = "\n".join(p259 + p260 + p261 + p262 + p263 + p264 + p265)


def join_inclusive(pages: list[str], start_frag: str, end_frag: str) -> str:
    s = next(i for i, l in enumerate(pages) if start_frag in l)
    e = next(i for i, l in enumerate(pages) if end_frag in l and i >= s)
    seg = [l.strip() for l in pages[s:e + 1] if l.strip()]
    return re.sub(r"\s{2,}", " ", " ".join(seg))


def norm_stem(raw: str) -> str:
    s = raw.replace("…", "...")
    s = re.sub(r"\s{2,}", " ", s)
    s = re.sub(r"[….]{4,}", "-------", s)
    return s


def line_after_dot(pages: list[str], frag: str) -> str:
    l = next(l for l in pages if frag in l)
    return l.strip().split(".", 1)[1].strip()


# ————— پیمانِ سربرگِ آزمون (ص۲۵۹ — presentation-forms؛ «نهایی» همان‌سطر با «اﻣﺘﺤﺎن») —————
assert any("ﺳﺆاﻻت  اﻣﺘﺤﺎن" in l for l in p259), "سربرگِ فرم‌های ارائه با دوفاصله"
assert any("1399" in l for l in p259)
assert any("aee.medu.ir" in l for l in p259)
p259join = re.sub(r"\s+", " ", " ".join(p259))
assert "05 / 04 / 99" in p259join, "تاریخِ ۰۵/۰۴/۹۹"
assert "8 ﺻﺒﺢ" in p259join, "ساعتِ شروعِ ۸ صبح (با فاصله — برخلافِ r387)"
assert "120دﻗﯿﻘﻪ" in p259join, "مدتِ ۱۲۰ دقیقه"
assert "ﺧﺮداد" in p259join and "ﻧﻮﺑﺖ" in p259join, "نوبتِ خردادماه"
assert "ﻓﯿﺰﯾﮏ" in p259join and "ﺗﺠﺮﺑﯽ" in p259join, "رشتهٔ ریاضی-فیزیک–علوم تجربی"

# ————— پیمانِ کلیدِ رسمی (ص۲۶۶-۲۶۷) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p266)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p267)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p266 + p267 if l.strip()))
assert "05 / 04 / 1399" in keyjoin, "تاریخِ کلید = تاریخِ برگه (سالِ کامل)"
KEY_FRAGS = ["1. False ( b)", "2. False ( b)", "3. she had the money.", "4. Because it is so slow.",
             "5. (c)", "6. (c)", "7. True (a)", "8. False (b)",
             "9. No, he doesn`t like it.",
             "11. False ( b)", "12. True (a)",
             "13. creative",
             "14. respect each other`s abilities.",
             "15. He didn`t enjoy working in a team environment a year ago.",
             "16. ( d )", "17. ( e )", "18. ( b )", "19. ( a )",
             "20. honored", "21. overcome", "22. suppose",
             "23. intermediate", "24. replace", "25. guide",
             "26. ( c )", "27. ( b )", "28. ( d )", "29. ( b)",
             "31. have been invited", "32. was said", "33. decides 34. might/would /could choose",
             "35. (b)", "36. (a)", "37. ( b) False", "38. (a) True",
             "39. English is easier for French people to learn because it is very similar to French",
             "40. Because they already use Chinese letters in their own language.",
             "41. ( b )", "42. (c)", "43. (b) False", "44. (a) True",
             "45. It is produced from streams and rivers/oceans/water.",
             "47. so", "48. and", "49. but", "50. or",
             "51. …they should stay at home.", "52. ..he has to do his homework.",
             "55. b g", "56. e j", "57. a f", "58. c h",
             "59. (a) Mina would help you with your homework if she had more free time.",
             "(b) My mother was angry with my brother because he hadn`t washed his hands.",
             "60. (a) The students bought some useful books which their teacher suggested.",
             "(b) Can water be converted into ice in cold weather?"]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# کلیدِ ۴۶ با ارقامِ فارسیِ وارونه در لایه («٦٤.») — شمارهٔ لاتینِ ۴۶ در کلید نیست
assert "It will keep the environment clean." in keyjoin, "کلیدِ ۴۶"
assert "46." not in keyjoin, "کلیدِ ۴۶ باید با ارقامِ فارسی بماند (بدونِ «46.» لاتین)"
assert any(l.strip() == "٦٤." for l in p267), "فرگمنتِ ارقامِ فارسیِ ۴۶"
# کلیدِ ۱۰ آشفته است (ران‌های جدا) — پیمانِ فرگمنتی
assert "10. No, he doesn`t appreciate" not in keyjoin, "کلیدِ ۱۰ باید آشفته بماند"
for frag in ["No", "he doesn", "t appreciate the woman", "`s job"]:
    assert any(l.strip() == frag for l in p266), f"فرگمنتِ آشفتهٔ کلیدِ ۱۰: {frag}"
# س۸: پاسخِ مدلِ «which» از «30» جدا افتاده (الگویِ r387/r388-deaf)
assert "30. which" not in keyjoin
assert any(l.strip() == "hich" for l in p266) and any(l.strip() == "w" for l in p266), "فرگمنت‌های آشفتهٔ which"
# یادداشتِ معلمِ ۱۳
assert "ﺻﺤﯿﺢ اﺳﺖ" in keyjoin and "creative" in keyjoin, "یادداشتِ «هرکلمه‌ای...» کنارِ creative"

# ————— س۵: بانکِ واژگانِ چاپ (ص۲۶۰) → بانک l64 —————
S20 = norm_stem(line_after_dot(p260, "20. Elders feel"))
S21 = norm_stem(line_after_dot(p260, "21. People use hybrid cars"))
S22 = norm_stem(line_after_dot(p260, "22. Let us"))
assert S20 == "Elders feel ------- when we appreciate them.", S20
assert S21 == "People use hybrid cars to ------- the problem of charging electric cars.", S21
assert S22 == "Let us ------- for a moment that the news is really true.", S22
assert "suppose, honored, demand, overcome" in full
POOL64 = ["suppose", "honored", "demand", "overcome"]  # ترتیبِ چاپ
Q_L64 = [
    q("g12-l64-1", 1, "vocab", S20, POOL64, 1),
    q("g12-l64-2", 2, "vocab", S21, POOL64, 3),
    q("g12-l64-3", 3, "vocab", S22, POOL64, 0),
]
# کلیدهای چاپی [honored, overcome, suppose] — اضافیِ چاپیِ demand هرگز کلید نیست
assert [it["options"][it["answer"]] for it in Q_L64] == ["honored", "overcome", "suppose"]
for it in Q_L64:
    assert it["options"][it["answer"]] != "demand", it["id"]

# ————— س۶: حرفِ اول (ص۲۶۰) → بانک l65 — گزینه‌های هم‌شکلِ مهندسی‌شده —————
S23 = line_after_dot(p260, "23. Dictionaries are usually")
S24 = line_after_dot(p260, "24. The factory could")
S25 = line_after_dot(p260, "25. The two words at the top")
assert S23 == "Dictionaries are usually in three levels: elementary, i - - - - - - - - - - -  and advanced.", S23
assert S24 == "The factory could r - - - - - -most of its workers with robots two years ago.", S24
assert S25 == "The two words at the top of each page of a dictionary are called g - - - - words.", S25
Q_L65 = [
    q("g12-l65-1", 1, "vocab", S23, ["intermediate", "interruption", "interference", "intimidating"], 0),
    q("g12-l65-2", 2, "vocab", S24, ["request", "replace", "respect", "recover"], 1),
    q("g12-l65-3", 3, "vocab", S25, ["great", "group", "grand", "guide"], 3),
]
for o in Q_L65[0]["options"]:
    assert re.fullmatch(r"i[a-z]{11}", o), o   # i + ۱۱ خطِ چاپ → ۱۲حرفی
for o in Q_L65[1]["options"]:
    assert re.fullmatch(r"r[a-z]{6}", o), o    # r + ۶ خطِ چاپ → ۷حرفی (replace)
for o in Q_L65[2]["options"]:
    assert re.fullmatch(r"g[a-z]{3}", o), o    # g + ۴ خطِ چاپ → ۵حرفی (guide words)
assert [it["options"][it["answer"]] for it in Q_L65] == ["intermediate", "replace", "guide"]

# ————— س۷: گرامر MCQ (ص۲۶۰-۲۶۱) → بانک l66 —————
G26 = norm_stem(line_after_dot(p260, "26. She was the person"))
G27 = norm_stem(line_after_dot(p260, "27. Scientists believe"))
G28 = norm_stem(line_after_dot(p261, "28. Zhila never says"))
G29 = norm_stem(line_after_dot(p261, "29.  My father might buy"))
assert G26 == "She was the person ------- everyone regarded as trustworthy.", G26
assert G27 == "Scientists believe that hot weather is often ------- the corps.", G27
assert G28 == "Zhila never says a word when she is sad,-------?", G28
assert G29 == "My father might buy a new car if some more dollars------- by the family.", G29
# گزینه‌های چاپ: آپاستروفِ مخلوط (isn’t  she دوفاصله‌ای در برابرِ doesn't she) و could  save دوفاصله‌ای
OPTS28 = ["isn’t  she", "did she", "doesn't she", "does she"]
OPTS29 = ["could  save", "were saved", "had saved", "were saving"]
for o in OPTS28 + OPTS29 + ["which", "when", "whom", "whose",
                            "endanger", "endangering", "endangered", "dangers"]:
    assert o in full, o
Q_L66 = [
    q("g12-l66-1", 1, "grammar", G26, ["which", "when", "whom", "whose"], 2),
    q("g12-l66-2", 2, "grammar", G27, ["endanger", "endangering", "endangered", "dangers"], 1),
    q("g12-l66-3", 3, "grammar", G28, OPTS28, 3),
    q("g12-l66-4", 4, "grammar", G29, OPTS29, 1),
]
# کلیدهای چاپی [c,b,d,b] — ترتیبِ چاپ حفظ شد؛ «the corps» مفردِ چاپ؛ tagِ never مثبت (does she)
assert [it["answer"] for it in Q_L66] == [2, 1, 3, 1]
assert [it["options"][it["answer"]] for it in Q_L66] == ["whom", "endangering", "does she", "were saved"]

# ————— س۱۰: خوانداریِ سختیِ زبان (ص۲۶۱-۲۶۲) → بانک l67 —————
LANGS = join_inclusive(p261, "There are many languages in the world", "to day life.")
for frag in ["There are many languages in the world, some of which may seem harder to learn for second or",
             "foreign learners. But which is the most difficult language to learn? Well, it’s not easy to reply",
             "because there are many factors to discuss.",
             "A native speaker of French, for example, will find English easier to learn than Chinese, because",
             "English is very similar to French, while Chinese is very different. As a result, first Language can",
             "affect learning a second language. The greater the differences between the second language and the",
             "first, the harder it will be to learn. Many people answer that Chinese is the hardest language to learn,",
             "possibly influenced by the thought of learning the Chinese writing system. Besides, the",
             "pronunciation of Chinese does appear to be very difficult for many foreign learners. However, for",
             "Japanese speakers, who already use Chinese letters in their own language, learning writing will be",
             "less difficult than for speakers of languages using the Roman alphabet.",
             "Teachers and the conditions in which the language is learned also play an important role, as well",
             "as each learner’s motivation for learning. If people learn a language because they need to use it for a",
             "living, they often learn it faster than people who study a language that has no direct use in their day",
             "to day life."]:
    assert any(frag in l for l in p261) or any(frag in l for l in p262), frag
assert "first Language" in LANGS, "«first Language» مفردِ چاپ"
assert "day to day life" in LANGS, "«day to day» بدونِ خطِ فاصله"
assert LANGS not in "\n".join(p261), "متنِ بازجوش در لایهٔ خام پیوسته نیست"
assert not any(it["question"].startswith("There are many languages") for b in d["lessons"] for it in b["questions"])
M35 = norm_stem(line_after_dot(p261, "35. The word “it” in paragraph"))
M36 = norm_stem(line_after_dot(p262, "36. Hardness of learning"))
T37 = norm_stem(line_after_dot(p262, "37. Being familiar with").split("a) True")[0].strip())
T38 = norm_stem(line_after_dot(p262, "38. The reason behind").split("a) True")[0].strip())
assert M35 == "The word “it” in paragraph 2 line 4 refers to------- .", M35
assert M36 == "Hardness of learning a language can depend on------- .", M36
assert T37 == "Being familiar with writing system of the second language makes it harder to learn.", T37
assert T38 == "The reason behind learning a language can slow down or speed up learning.", T38
Q_L67 = [
    q("g12-l67-1", 1, "grammar", f"{LANGS} — {M35}",
      ["learning first language", "second language", "difference of languages", "Chinese language"], 1),
    q("g12-l67-2", 2, "grammar", f"{LANGS} — {M36}",
      ["how different it is from one’s mother tongue", "whether it is French or English",
       "whether you are learning Japanese or Chinese", "how long it takes to master pronunciation"], 0),
    q("g12-l67-3", 3, "grammar", f"{LANGS} — {T37}", ["True", "False"], 1),
    q("g12-l67-4", 4, "grammar", f"{LANGS} — {T38}", ["True", "False"], 0),
]
# کلیدهای چاپی [b,a,False,True]
assert [it["answer"] for it in Q_L67] == [1, 0, 1, 0]

# ————— س۱۱: خوانداریِ منابعِ انرژی (ص۲۶۲-۲۶۳) → بانک l68 —————
ENERGY = join_inclusive(p262, "The research for new sources of energy", "to nations of the world.")
for frag in ["The research for new sources of energy has led into various ways. To produce any type of energy,",
             "the resources of the earth are used. The main resources of the earth are fossil fuels such as natural",
             "gas, oil and coal. Electricity is generated from coal, oil and natural gas, but the process has been",
             "proven to be expensive.",
             "Experimental works are in progress to produce energy from other resources. Scientists and",
             "experts spared no pains to search for new ways of producing new source of energy. For instance,",
             "electricity has been produced with giant wind turbines. Geothermal power or the heat from the earth",
             "is also being tested to produce energy. Many societies are burning rubbish and other biological",
             "waste products to generate electricity. Not only changing unwanted products to gas or oil is a cheap",
             "way to produce energy, but also it is an effective way to get rid of waste.",
             "Some experts expect service companies to expand hydroelectric power generated from streams",
             "and rivers. As an example, 50 years ago hydroelectric power provided one-third of the electricity",
             "used in the United States but today it includes only 4%. The oceans are another possible source of",
             "energy. Scientists are studying ways to change the energy of oceans’ tides and waves into",
             "electricity. Experiments are also underway to make use of temperature differences in ocean water to",
             "produce energy.",
             "Clean energy resources are vastly respected, valued, and used all over the world to keep the",
             "environment clean. As a result, scientists try to introduce new types of energy resources called clean",
             "energy resources to nations of the world."]:
    assert any(frag in l for l in p262), frag
assert "has led into various ways" in ENERGY, "«has led into» چاپِ این برگه"
assert "producing new source of energy" in ENERGY, "«new source» مفردِ چاپ"
assert ENERGY not in "\n".join(p262), "متنِ بازجوش در لایهٔ خام پیوسته نیست"
assert not any(it["question"].startswith("The research for new sources") for b in d["lessons"] for it in b["questions"])
M41 = norm_stem(line_after_dot(p262, "41. Which is the best title"))
M42 = norm_stem(line_after_dot(p263, "42. Which of the following is not offered"))
T43 = norm_stem(line_after_dot(p263, "43. Changing waste products").split("a) True")[0].strip() + " " +
                next(l.strip() for l in p263 if l.strip() == "effective."))
T44 = norm_stem(line_after_dot(p263, "44. Geothermal power"))
assert M41 == "Which is the best title for this passage?", M41
assert M42 == "Which of the following is not offered in the passage as a source of energy?", M42
assert T43 == "Changing waste products to gas or oil is an expensive way to generate energy, but it is very effective.", T43
assert T44 == "Geothermal power is the heat from the Earth.", T44
Q_L68 = [
    q("g12-l68-1", 1, "grammar", f"{ENERGY} — {M41}",
      ["The use of waste products for energy", "The search for new sources of energy",
       "Effective ways of producing hydropower", "New discoveries in geothermal power"], 1),
    q("g12-l68-2", 2, "grammar", f"{ENERGY} — {M42}",
      ["Electrical power", "Clean energy", "Nuclear energy", "Hydroelectric power"], 2),
    q("g12-l68-3", 3, "grammar", f"{ENERGY} — {T43}", ["True", "False"], 1),
    q("g12-l68-4", 4, "grammar", f"{ENERGY} — {T44}", ["True", "False"], 0),
]
# کلیدهای چاپی [b,c,False,True]
assert [it["answer"] for it in Q_L68] == [1, 2, 1, 0]

# ————— س۱۲: حروفِ ربطِ پاراگراف (ص۲۶۳) → بانک l69 — نخستین رندرِ پاراگرافی —————
TEACH = join_inclusive(p263, "Teachers work hard every day", "you will be sorry")
assert "(47)" in TEACH and "(50)" in TEACH, "نشانه‌های چاپیِ خانه‌ها"
# نشانهٔ چاپیِ «(N)......» داخلِ جمله → خانهٔ ساده (عددِ سؤال خودِ قید است)
TEACH_NORM = norm_stem(re.sub(r"\s*\((?:4[789]|50)\)\s*[….]+", "-------", TEACH))
C47 = "Teachers work hard every day to make sure you have learnt your lessons,-------they deserve your respect."
C48 = "You should know their values,------- tell them that you are grateful to them for their help."
C49 = "You may sometimes forget their kindness,-------you need to remember that they shape your lives like your parents."
C50 = "Treat them well when they are still around,------- you will be sorry one day."
for c in (C47, C48, C49, C50):
    assert c in TEACH_NORM, c
Q_L69 = [
    q("g12-l69-1", 1, "grammar", C47, ["but", "and", "so", "or"], 2),
    q("g12-l69-2", 2, "grammar", C48, ["but", "and", "so", "or"], 1),
    q("g12-l69-3", 3, "grammar", C49, ["but", "and", "so", "or"], 0),
    q("g12-l69-4", 4, "grammar", C50, ["but", "and", "so", "or"], 3),
]
# کلیدهای چاپی [so, and, but, or] — ترتیبِ چاپِ دستور (but, and, so, or) حفظ شد
assert [it["options"][it["answer"]] for it in Q_L69] == ["so", "and", "but", "or"]

# ————— س۱۵-الف: تعریف‌یابی (ص۲۶۴) → بانک l70 —————
S55A = norm_stem(line_after_dot(p264, "55. Our parents have a lot"))
S56A = norm_stem(line_after_dot(p264, "56.   I really like the variety"))
S57A = norm_stem(line_after_dot(p264, "57. The factory polluted"))
S58A = norm_stem(line_after_dot(p264, "58. Try to avoid foods"))
assert S55A == "Our parents have a lot to share with us like their experiences and failures.", S55A
assert S56A == "I really like the variety the store has to offer.", S56A
assert S57A == "The factory polluted the river.", S57A
assert S58A == "Try to avoid foods that contain a lot of fat.", S58A
DEFS70 = ["to make water, air, etc. dirty",            # a
          "lack of success in doing something",         # b
          "have something inside",                      # c
          "an arrangement in a particular order",       # d — اضافیِ چاپیِ هرگز-کلید
          "many different types of things or people"]   # e
for df in DEFS70:
    assert df in full, df
Q_L70 = [
    q("g12-l70-1", 1, "vocab", f"«{S55A}» — تعریفِ ستون B برای واژهٔ «failures»: -------", DEFS70, 1),
    q("g12-l70-2", 2, "vocab", f"«{S56A}» — تعریفِ ستون B برای واژهٔ «variety»: -------", DEFS70, 4),
    q("g12-l70-3", 3, "vocab", f"«{S57A}» — تعریفِ ستون B برای واژهٔ «polluted»: -------", DEFS70, 0),
    q("g12-l70-4", 4, "vocab", f"«{S58A}» — تعریفِ ستون B برای واژهٔ «contain»: -------", DEFS70, 2),
]
# کلیدهای چاپی [b,e,a,c] — ترتیبِ چاپِ ستون B (a-e) حفظ شد؛ اضافیِ d هرگز کلید نیست
assert [it["options"][it["answer"]] for it in Q_L70] == [DEFS70[1], DEFS70[4], DEFS70[0], DEFS70[2]]
for it in Q_L70:
    assert it["options"][it["answer"]] != DEFS70[3], it["id"]

# ————— س۱۵-ب: اصطلاحات (ص۲۶۴) → بانک l71 — «Two heads» دوقلویِ ساقهٔ l59-4 — شمرده نشد —————
for idi in ["55. God helps those who help themselves", "56. Two heads are better than one",
            "57. Action speak louder than words", "58. A burnt child dreads the fire"]:
    assert idi in full, idi
assert "Action speak louder" in full, "«speak» مفردِ چاپ"
IDMS71 = ["Just saying that you will do something doesn`t mean much. Actually, doing it is harder.",  # f
          "Don`t just wait for good things to happen to you. Work hard to achieve your goals.",       # g
          "Someone who has experienced some kind of negative situation will try to avoid making the same mistake.",  # h
          "People like to spend time with others who are similar to them.",                           # i — اضافیِ چاپیِ هرگز-کلید
          "When two people cooperate with each other, they come up with better idea."]                # j — دوقلویِ ساقه با «idea.» بدونِ s
for df in IDMS71:
    assert df in full, df
Q_L71 = [
    q("g12-l71-1", 1, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «God helps those who help themselves»: -------", IDMS71, 1),
    q("g12-l71-2", 2, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «Action speak louder than words»: -------", IDMS71, 0),
    q("g12-l71-3", 3, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «A burnt child dreads the fire»: -------", IDMS71, 2),
]
# کلیدهای چاپی [g,f,h] — ترتیبِ چاپِ ستون B (f-j) حفظ شد؛ اضافیِ i هرگز کلید نیست؛
# «Two heads» (کلیدِ j با «better idea.») دوقلویِ بایتیِ ساقهٔ l59-4 است — مستثنی با کلیدِ چاپیِ حفظ‌شده
assert [it["options"][it["answer"]] for it in Q_L71] == [IDMS71[1], IDMS71[0], IDMS71[2]]
for it in Q_L71:
    assert it["options"][it["answer"]] != IDMS71[3], it["id"]

# ————— گاردِ سراسریِ ضدتکرار —————
EXISTING_STEMS = {it["question"] for b in d["lessons"] for it in b["questions"]}
for bank in (Q_L64, Q_L65, Q_L66, Q_L67, Q_L68, Q_L69, Q_L70, Q_L71):
    for it in bank:
        assert it["question"] not in EXISTING_STEMS, f"byte-twin stem shipped: {it['id']}"

# ————— درج در سند —————
B64 = {"lesson": 64, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — واژگانِ بانکِ چاپ (س۵، ص۲۶۰)", "level": "چهارگزینه‌ای",
       "count": len(Q_L64), "questions": Q_L64}
B65 = {"lesson": 65, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — حرفِ اول (س۶، ص۲۶۰)", "level": "چهارگزینه‌ای",
       "count": len(Q_L65), "questions": Q_L65}
B66 = {"lesson": 66, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — گرامر (س۷، ص۲۶۰-۲۶۱)", "level": "چهارگزینه‌ای",
       "count": len(Q_L66), "questions": Q_L66}
B67 = {"lesson": 67, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — خوانداریِ سختیِ زبان (س۱۰، ص۲۶۱-۲۶۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L67), "questions": Q_L67}
B68 = {"lesson": 68, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — خوانداریِ منابعِ انرژی (س۱۱، ص۲۶۲-۲۶۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L68), "questions": Q_L68}
B69 = {"lesson": 69, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — حروفِ ربطِ پاراگراف (س۱۲، ص۲۶۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L69), "questions": Q_L69}
B70 = {"lesson": 70, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — تعریف‌یابی (س۱۵-الف، ص۲۶۴)", "level": "چهارگزینه‌ای",
       "count": len(Q_L70), "questions": Q_L70}
B71 = {"lesson": 71, "title": "نهایی خرداد ۱۳۹۹ ریاضی-تجربی — اصطلاحات (س۱۵-ب، ص۲۶۴)", "level": "چهارگزینه‌ای",
       "count": len(Q_L71), "questions": Q_L71}

# ————— نشت‌سنجِ راندی: محتوای مستثنی‌شدهٔ برگهٔ ریاضی نباید در بانک‌های تازه باشد —————
LEAKS = ["she had the money",                       # س۱ کلیدِ مدل (شنیداری)
         "Because it is so slow",                   # س۱ کلیدِ مدل
         "doesn`t like it",                         # س۲ کلیدِ مدل
         "appreciate the woman",                    # س۲ کلیدِ مدل
         "recycling unwanted food",                 # س۲ ساقهٔ شنیداریِ صوتی
         "creative",                                # س۳ کلیدِ مدل
         "respect each other",                      # س۳ کلیدِ مدل
         "didn`t enjoy working",                    # س۳ کلیدِ مدل
         "Delilah",                                 # س۳ نامِ شنیداری
         "Taking people’s temperature",             # س۴ تصویری
         "magnifying glass",                        # س۴ تصویری
         "Teenagers who help others",               # س۴ اضافیِ چاپی (تصویری)
         "Wind tower",                              # س۴ تصویری
         "figure out what the teacher",             # س۴ تصویری
         "A pigeon is a bird",                      # س۸ (تولیدیِ موصولی)
         "have been invited",                       # س۹ (تایپی)
         "was said",                                # س۹ (تایپی)
         "decides",                                 # س۹ (تایپی)
         "English is easier for French people",     # س۱۰ پاسخِ مدل (مشتقِ متن)
         "streams and rivers/oceans/water",         # س۱۱ پاسخِ مدل
         "It will keep the environment clean.",     # س۱۱ پاسخِ مدل
         "they should stay at home",                # س۱۳ کلیدِ چاپی (تصویری-ربط)
         "he has to do his homework",               # س۱۳ کلیدِ چاپی
         "COVID 19",                                # س۱۳ ساقهٔ تصویری
         "Jimmy seems very tired",                  # س۱۳ ساقهٔ تصویری
         "sitting in front of the TV",              # س۱۴ (تولیدی)
         "quiet place, whether it is a forest",     # س۱۴ (تولیدی)
         "Mina would help you with your homework",  # س۱۶ پاسخِ مدل (تایپی)
         "My mother was angry with my brother",     # س۱۶ پاسخِ مدل (تایپی)
         "The students bought some useful books",   # س۱۶ پاسخِ مدل (تایپی)
         "Can water be converted into ice",         # س۱۶ پاسخِ مدل (تایپی)
         "Tahereh",                                 # س۱۷ (تولیدیِ تصویری)
         "Saffarzadeh",                             # س۱۷ (تولیدیِ تصویری)
         "Perspolis",                               # س۱۷ (تولیدیِ تصویری)
         "Damavand",                                # س۱۷ (تولیدیِ تصویری)
         "Fahmideh"]                                # س۱۷ چیپ
blob = json.dumps([B64, B65, B66, B67, B68, B69, B70, B71], ensure_ascii=False)
for s in LEAKS:
    assert s not in blob, f"leak: {s}"

for b in (B64, B65, B66, B67, B68, B69, B70, B71):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie10"] = {
    "extractedRound": "r388",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ دهم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۳۹۹ (ریاضی فیزیک–علوم تجربی)",
    "examPages": "pdf-p259-265 (هفت صفحهٔ آزمون؛ هفتمی فقط نگارش/جمع‌بندی) + کلیدِ رسمی: pdf-p266-267 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p258→p259 (پس از دی ۱۳۹۸) و p267→p268 (آغازِ انسانی)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: ریاضی فیزیک–علوم تجربی — نوبت خردادماه سال ۱۳۹۹ (تاریخِ چاپی: ۰۵/۰۴/۹۹) — مدت ۱۲۰ دقیقه — ساعت شروع ۸ صبح (با فاصلهٔ چاپ — برخلافِ r387) — ۱۷ سکشن/۶۰ ردیف/جمعِ نمرهٔ ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir)",
    "keyPages": "pdf-p266-267 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۶۰ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۲۹ کلید از ۲۹ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «1. False ( b) 2. False ( b)» (دوبلِ Falseِ چاپ) «3. she had the money. 4. Because it is so slow.» / «5. (c) 6. (c)» (دوبلِ c) «7. True (a) 8. False (b)» / کلیدِ ۹ «No, he doesn`t like it.» با دوفاصلهٔ چاپ / کلیدِ ۱۰ آشفته (ران‌های جدا: No/he doesn/`s job/t appreciate the woman) / «11. False ( b) 12. True (a)» / «13. creative» با یادداشتِ معلمِ «در این بخش هرکلمه‌ای هم که به نوعی به پاسخ اشاره کند صحیح است.» / «14. respect each other`s abilities. 15. He didn`t enjoy working in a team environment a year ago.» (بک‌تیکِ چاپ) / «16. ( d ) 17. ( e ) 18. ( b ) 19. ( a )» / «20. honored 21. overcome 22. suppose» / «23. intermediate 24. replace 25. guide» / «26. ( c ) 27. ( b ) 28. ( d ) 29. ( b)» / س۸ «which» آشفته (w+hich) / «31. have been invited 32. was said 33. decides 34. might/would /could choose» (کلیدِ سه‌گانهٔ چاپ با فاصله‌های ناهمگون) / «35. (b) 36. (a) 37. ( b) False 38. (a) True» / «39. English is easier for French people to learn because it is very similar to French» (دوفاصلهٔ چاپ پیش از because) «40. Because they already use Chinese letters in their own language.» / «41. ( b ) 42. (c) 43. (b) False 44. (a) True» / «45. It is produced from streams and rivers/oceans/water.» / کلیدِ ۴۶ با ارقامِ فارسیِ وارونه («٦٤.») — شمارهٔ لاتینِ ۴۶ در کلید نیست / «47. so 48. and 49. but 50. or» (دوفاصله‌های چاپ) / «51. …they should stay at home. 52. ..he has to do his homework.» / «55. b g 56. e j 57. a f 58. c h» (جفت‌های درهمِ الف/ب) / «59-60» چهار پاسخِ مدل با بک‌تیکِ چاپ در hadn`t",
    "sectionsTotal": 60,
    "sectionsExtracted": 29,
    "sectionsSkipped": 31,
    "items": 29,
    "bankCounts": [3, 3, 4, 4, 4, 4, 4, 3],
    "keyPolicy": "همهٔ کلیدهای ۲۹ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ بانکِ ۴واژه‌ایِ l64 به ترتیبِ چاپِ خودِ برگه (suppose, honored, demand, overcome) با اضافیِ چاپیِ هرگز-کلید (demand)؛ حرفِ اولِ l65 با سه سه‌تاییِ هم‌شکلِ مهندسی‌شده (i+++++++++++/r++++++/g++++ — ۱۲/۷/۵حرفی)؛ گرامرِ l66 و حروفِ ربطِ پاراگرافیِ l69 به ترتیبِ چاپ (دستورِ but, and, so, or)؛ کلیدهای درست/غلطِ l67/l68 سمانتیک‌اند (چاپ: False/True و False/True)؛ تعریف‌یابیِ l70 و اصطلاحاتِ l71 به ترتیبِ چاپِ ستون B با اضافی‌های چاپیِ هرگز-کلید (d/i)",
    "engineNote": "هر ۲۹ آیتم MCQ (قراردادِ کارتِ g12)؛ ساقه‌های خوانداریِ l67/l68 متنِ کاملِ چاپی را در خود دارند (بازجوشِ joinِ بی‌نُرمِ فرگمنتی — دو متنِ تمیز)؛ l69 نخستین رندرِ پاراگرافیِ حروفِ ربط در مخزن — نشانهٔ چاپیِ «(N)......» داخلِ جمله به خانهٔ ساده تبدیل شد (عددِ سؤال خودِ قید است؛ خانه‌های چسبیده به واژهٔ بعد وفادارانه ماندند)؛ ساقه‌های تعریف‌یابی/اصطلاح دوبخشیِ فارسی (الگویِ r380-l5/r386-l45/r387-l58)؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» چسبیده؛ این برگه کلوژِ شنیداری و مرتب‌سازیِ شش‌گزینه‌ای ندارد",
    "derivedKeys": {
        "S5": ["honored", "overcome", "suppose"],
        "S6": ["intermediate", "replace", "guide"],
        "S7": ["whom", "endangering", "does she", "were saved"],
        "S10": ["second language", "how different it is from one’s mother tongue", "False", "True"],
        "S11": ["The search for new sources of energy", "Nuclear energy", "False", "True"],
        "S12": ["so", "and", "but", "or"],
        "S15-الف": ["lack of success in doing something", "many different types of things or people", "to make water, air, etc. dirty", "have something inside"],
        "S15-ب": ["Don`t just wait for good things to happen to you. Work hard to achieve your goals.", "Just saying that you will do something doesn`t mean much. Actually, doing it is harder.", "Someone who has experienced some kind of negative situation will try to avoid making the same mistake."],
    },
    "paperMap": "نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — کشفِ r384، تأییدِ دوباره در این راند: دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ (پیش از presentation-forms)؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸)؛ شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸)؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹) ← این راند؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹)؛ برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ [r387]؛ شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ [r388]؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ [r386]؛ خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۱۱ برگه استخراج شد، ۶ برگه باقی است",
    "skippedSections": [
        "س۱ (ردیف ۱-۴، شنیداریِ لپ‌تاپ): صوتی-کلید؛ کلیدهای چاپی: 1. False ( b)/2. False ( b)/3. she had the money./4. Because it is so slow. — دوبلِ Falseِ چاپ",
        "س۲ (ردیف ۵-۱۰، شنیداریِ اختراع): صوتی-کلید؛ کلیدهای چاپی: 5.(c)/6.(c)/7. True (a)/8. False (b)/9. No, he doesn`t like it./10. No, he doesn`t appreciate the woman`s job. — کلیدِ ۱۰ در لایهٔ کلید آشفته است (ران‌های جدا)",
        "س۳ (ردیف ۱۱-۱۵، شنیداریِ تیم): صوتی-کلید؛ کلیدهای چاپی: 11. False ( b)/12. True (a)/13. creative («در این بخش هرکلمه‌ای هم که به نوعی به پاسخ اشاره کند صحیح است.»)/14. respect each other`s abilities./15. He didn`t enjoy working in a team environment a year ago.",
        "س۴ (ردیف ۱۶-۱۹، تصویری): «یک جمله اضافی است» — پنج جملهٔ چاپی a-e: a) Taking people’s temperature can help them fight the coronavirus. → 19 / b) If you focus the sun`s rays through a magnifying glass on a dry leaf, it will start to burn. → 18 / c) Teenagers who help others are more successful in life. (اضافیِ چاپی) / d) Wind tower is a type of natural air cooling system. → 16 / e) John couldn’t figure out what the teacher was talking about. → 17؛ داوریِ رندرِ ۳۰۰dpi (p260-s4-pictures.png): بادگیرِ سنتی ۱۶/مردِ گیج ۱۷/ذره‌بین روی متن ۱۸/دماسنج ۱۹؛ استخراج نیازمندِ تصویر",
        "س۸ (ردیف ۳۰، تولیدیِ موصولی): «A pigeon is a bird…….» — کلیدِ چاپی: which (در لایهٔ کلید آشفته: «w»+«hich») — تولیدی",
        "س۹ (ردیف ۳۱-۳۴، افعالِ مکالمه‌ایِ بابک/علی): «31. have been invited» / «32. was said» / «33. decides» / «34. might/would /could choose» (کلیدِ سه‌گانهٔ چاپ) — تولیدیِ تایپی؛ کاندیدِ تایپی (۴ ردیفِ تازه به مخزن)",
        "س۱۰ ردیف‌های ۳۹-۴۰ (پاسخِ مدلِ خوانداریِ سختیِ زبان): «39. English is easier for French people to learn because it is very similar to French» و «40. Because they already use Chinese letters in their own language.» — پاسخ‌های مشتقِ خودِ متن (درسِ r387: از ثبتِ مخزن معاف)",
        "س۱۱ ردیف‌های ۴۵-۴۶ (پاسخِ مدلِ خوانداریِ انرژی): «45. It is produced from streams and rivers/oceans/water.» و «46. It will keep the environment clean.» (با ارقامِ فارسیِ وارونهٔ «٦٤.» در لایه) — پاسخ‌های مشتقِ خودِ متن",
        "س۱۳ (ردیف ۵۱-۵۲، تصویری-ربط): «51. Many people are still becoming sick because of the COVID 19, so…….» و «52. Jimmy seems very tired, but……………….» با تصویر — کلیدهای چاپی: «51. …they should stay at home.» / «52. ..he has to do his homework.» — استخراج نیازمندِ تصویر",
        "س۱۴ (ردیف ۵۳-۵۴، تولیدی): Topic Sentence برای «Reading» و «Nature» — تولیدی",
        "س۱۵-ب ردیفِ ۵۶ (Two heads are better than one → j): دوقلویِ بایتیِ ساقهٔ l59-4 — ستونِ B این برگه متفاوت است («When two people cooperate with each other, they come up with better idea.» بدونِ s) ولی ساقه یکسان است — طبق درسِ John شمرده نشد و کلیدِ چاپیِ j در رسید حفظ شد",
        "س۱۶ (ردیف ۵۹-۶۰، جمله‌سازیِ انتخابیِ a/b): چهار پاسخِ مدلِ چاپی: 59a. Mina would help you with your homework if she had more free time. / 59b. My mother was angry with my brother because he hadn`t washed his hands. (بک‌تیکِ چاپ) / 60a. The students bought some useful books which their teacher suggested. / 60b. Can water be converted into ice in cold weather? — کاندیدِ تایپی (۴ ردیفِ تازه به مخزن)",
        "س۱۷ (نگارشِ انتخابیِ c/d): ج) Topic Sentence برای چهار عنوانِ تصویری (a) Water / b) Damavand / c) Perspolis (Takht-e-Jamshid) / d) Tahereh Saffarzadeh) و د) پاراگرافِ شهید محمدحسین فهمیده با چیپ‌های چاپی (Birth: May 6, 1967, Qom / Death: (Martyred) October 30, 1980, Khorramshahr / Job: Student / War: Iran–Iraq War, in Khorramshahr) — تولیدی با تصویر",
    ],
    "printQuirks": [
        "هشتمین برگهٔ presentation-forms با سربرگِ «ﺳﺆاﻻت  اﻣﺘﺤﺎن ﻧﻬﺎﯾﯽ» (نهایی همان‌سطر — برخلافِ r387 که جدا بود) — متنِ انگلیسی و کلیدها لاتینِ سالم",
        "«8 ﺻﺒﺢ» با فاصلهٔ چاپ (r387: «8ﺻﺒﺢ» چسبیده)؛ «درس :» با فاصلهٔ پیش از دونقطه",
        "شکستِ سطریِ «Vocabula/ry» در سکشنِ ۴ (سربرگِ واژگان دو-تکه در لایه) — بازجوش نشد؛ فقط ثبت شد",
        "بک‌تیکِ چاپ در گزینهٔ b س۴ (sun`s rays) و در کلیدهای مدلِ ۱۴/۱۵/۵۹b (other`s / didn`t / hadn`t) — عینِ چاپ",
        "«the corps» مفردِ چاپ در ق۲۷ (برای crops) — وفادارانه ماند",
        "آپاستروفِ مخلوطِ چاپ در گزینه‌های ق۲۸: «isn’t  she» (خمیده + دوفاصله) کنارِ «doesn't she» (مستقیم) — عینِ چاپ؛ دوفاصلهٔ چاپ در «could  save» ق۲۹",
        "خانهٔ حرفِ اولِ ق۲۴ به واژهٔ بعد چسبیده است («r - - - - - -most») و ق۲۳ دوفاصلهٔ چاپ پیش از and دارد — عینِ چاپ",
        "نشانه‌های خانه‌های س۱۲ داخلِ جمله‌اند: «(47)......they» چسبیده به واژهٔ بعد، «(48)…… tell» و «(50) ……. you» با فاصله — به خانهٔ ساده تبدیل شد (عددِ سؤال خودِ قید است)",
        "کلیدِ ۴۶ با ارقامِ فارسیِ وارونه در لایه («٦٤.») — شمارهٔ لاتینِ ۴۶ در کلید نیست؛ پیمانِ گارد",
        "کلیدِ ۳۴ سه‌گانه است با فاصله‌های ناهمگونِ چاپ («might/would /could choose») — عینِ چاپ",
        "«57. Action speak louder than words» — مفردِ چاپ (speak)؛ «56.   I really like» دوفاصلهٔ پس از شماره",
        "پاورقیِ صفحات: شمارهٔ چاپیِ ۱۶۴-۱۷۲ + پاورقیِ «Audio file (MP3) / Audio text (PDF) / Audio script (PDF)» در ص۲۵۹",
    ],
    "futureNote": "بخشِ ۴: ۱۱ برگه از ۱۷ استخراج شد، ۶ برگه باقی است (نزدیک‌ترین: انسانیِ خرداد ۱۳۹۹ ص۲۶۸-۲۷۶؛ به‌علاوهٔ برگهٔ لایه‌خرابِ ص۲۷۷-۲۸۴ که OCR/رندر می‌خواهد و چهار برگهٔ ۱۳۹۷/۱۳۹۸ با کلیدِ سربرگِ قدیمی)؛ کاندیدهای تایپیِ این برگه (س۹: «have been invited»/«was said»/«decides»/«might-would-could choose» + س۱۶: Mina/My-mother/The-students/Can-water) به کاندیدهای r380-r387 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۶۴ ردیف است (۵۶ِ r388-deaf + ۸ ردیفِ تازه)",
}
d["source"]["g12nahaie10"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r388-math OK — banks={len(d['lessons'])} items={total} (+29 in 8 banks: l64=3 l65=3 l66=4 l67=4 l68=4 l69=4 l70=4 l71=3) — نهایی خرداد ۱۳۹۹ ریاضی-تجربی با کلیدِ رسمی")
