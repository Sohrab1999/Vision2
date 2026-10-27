#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r385 — برگهٔ ششمِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۴۰۰
(واریانتِ رشتهٔ ریاضی-فیزیک و علوم تجربی؛ تاریخِ چاپی ۱۹/۰۳/۱۴۰۰؛
pdf-p308-312 آزمون + کلیدِ رسمیِ «راهنمای تصحیح» pdf-p313-314)
→ tests-g12.json با ۷ بانکِ تازه (l36=7؛ l37=4؛ l38=4؛ l39=4؛ l40=4؛ l41=2؛ l42=6)
— ۳۵ بانکِ قبلی + این = ۴۲ بانک/۴۸۱ آیتم

ساختار آزمون (۱۹ سکشن، ۵۷ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۵ صفحه، شروع ۸ صبح):
  س۱ (۱-۴)    شنیداریِ درست/غلط (مینا/رویا، باشگاه) — صوتی-کلید — مستثنی (کلید: 1.False(b)/2.False(b)/3.True(a)/4.True(a))
  س۲ (۵-۸)    شنیداریِ MCQ (امیر/رسول، رستورانِ نو) — صوتی-کلید — مستثنی (کلید: 5.(b)/6.(c)/7.(c)/8.(a))
  س۳ (۹-۱۲)   شنیداریِ کلوژِ محیطِ زیست — صوتی-کلید — مستثنی (کلید: 9.around/10.social/11.land/12.protect)
  س۴ (۱۳-۱۵)  شنیداریِ درست/غلط + تکمیل (قول دادن/احترام) — صوتی-کلید — مستثنی (کلید: 13.False(b)/14.True(a)/15.listen)
  س۵ (۱۶-۱۹)  تصویری (یک جمله اضافی) — تصویری-کلید — مستثنی با داوریِ کاملِ رندر (16.(e)/17.(d)/18.(a)/19.(c))
  س۶ (۲۰-۲۲)  بانکِ ۴واژه‌ای (suppose, use up, distinguished, fossil — اضافیِ چاپی: suppose) → بانک l36
  س۷ (۲۳-۲۵)  تعریف‌یابی A/B (اضافیِ چاپی: to put things in a neat, attractive, or useful order) → بانک l36
  س۸ (۲۶)     اصطلاحِ «Actions s - - - - louder than words» (کلمهٔ ۵حرفیِ s-دار) → بانک l36
  س۹ (۲۷-۳۰)  گرامر MCQ (tag با نامِ چاپیِ Hamid در گزینه‌ها) → بانک l37
  س۱۰ (۳۱)    شکلِ فعلِ باز (pay → had paid) — کلیدِ چاپیِ دقیق — مستثنی؛ کاندیدِ بانکِ تایپی
  س۱۱ (۳۲-۳۳) جمله‌سازیِ درهم — پاسخِ مدلِ چاپی (بلوکِ درهمِ لایه، داوریِ رندر ۳۰۰dpi) — مستثنی؛ کاندیدِ تایپی
  س۱۲ (۳۴)    ضمیرِ موصولی (which + جملهٔ دارای فعل — اسب) — مستثنی؛ کاندیدِ تایپی
  س۱۳ (۳۵-۳۸) خوانداریِ لغت‌نامه: هر چهار ردیف → بانک l38 (دوبلِ Trueِ چاپ در ۳۵/۳۶)
  س۱۴ (۳۹-۴۳) خوانداریِ انرژیِ خورشیدی: ۳۹-۴۲ → بانک l39؛ ۴۳ (Solar collectors collect heat by
              absorbing sunlight.) پاسخِ مدل — کاندیدِ تایپی
  س۱۵ (۴۴-۴۷) خوانداریِ نوجوانان (دوصفحه‌ایِ ص۳۱۱→۳۱۲ با بازجوشِ inclusive): هر چهار ردیف → بانک l40
  س۱۶ (۴۸-۴۹) حروفِ ربط (بانکِ چاپی but, and, so, or) → بانک l41
  س۱۷ (۵۰)    حرفِ ربط با تصویر (کتابِ خسته‌کننده + read) — کلیدِ چاپیِ کامل («50. …..but he had to
              read it.» — عینِ کلیدِ r382-س۱۷) — مستثنی
  س۱۸ (۵۱-۵۶) مرتب‌سازیِ پاراگرافِ ارتباطات (a-f) با کلیدهای ۵۱.(c)/۵۲.(f)/۵۳.(b)/۵۴.(d)/۵۵.(e)/۵۶.(a)
              → بانک l42 (شش‌گزینه‌ای — دومین بانکِ مرتب‌سازیِ مخزنِ نهایی‌ها؛ d و e دو نیمهٔ یک جمله‌اند)
  س۱۹ (۵۷)    پاراگرافِ Sport با چیپ‌های چاپی (Different types of sport / Good physical shape /
              Healthier heart) — تولیدی — مستثنی
idempotent: اجرای دوم NO-OP (رسید g12nahaie6).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie6" in d.get("source", {}):
    print("r385: receipt g12nahaie6 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie5" in d.get("source", {}), "tests-g12.json (r384) must exist first"
assert len(d["lessons"]) == 35, f"expected 35 banks before r385, got {len(d['lessons'])}"

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


p308 = page_slice(308)
p309 = page_slice(309)
p310 = page_slice(310)
p311 = page_slice(311)
p312 = page_slice(312)
p313 = page_slice(313)
p314 = page_slice(314)
full = "\n".join(p308 + p309 + p310 + p311 + p312 + p313 + p314)


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
    """line containing frag, text after the row-marker dot"""
    l = next(l for l in pages if frag in l)
    return l.strip().split(".", 1)[1].strip()


def strip_line(pages: list[str], frag: str) -> str:
    return next(l for l in pages if frag in l).strip()


# ————— پیمانِ سربرگِ آزمون (ص۳۰۸ — presentation-forms، اﻣﺘﺤﺎنِ چسبیده) —————
assert any("ﺳﺆاﻻت" in l and "ﺘﺤﺎن" in l for l in p308), "سربرگِ فرم‌های ارائه"
assert any("1400" in l for l in p308)
assert any("aee.medu.ir" in l for l in p308)
assert any("ﺧﺮداد" in l for l in p308), "نوبتِ خرداد"
assert any("رﯾﺎﺿﯽ" in l for l in p308), "رشتهٔ ریاضی-تجربی"
p308join = re.sub(r"\s+", " ", " ".join(p308))
assert "19 / 03 / 1400" in p308join, "تاریخِ ۱۹/۰۳/۱۴۰۰"
assert any("Audio" in l for l in p308), "پاورقیِ Audio script / MP3"

# ————— پیمانِ کلیدِ رسمی (ص۳۱۳-۳۱۴) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p313)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p314)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p313 + p314 if l.strip()))
assert "19 / 03 / 1400" in keyjoin, "تاریخِ کلید = تاریخِ برگه"
KEY_FRAGS = ["1. False (b)", "2. False (b)", "3. True (a)", "4. True (a)",
             "5. (b)", "6. (c)", "7. (c)", "8. (a)",
             "9. around", "10. social", "11. land", "12. protect",
             "13. False (b)", "14. True (a)", "15. listen",
             "16. (e)", "17.(d)", "18. (a)", "19. (c)",
             "20. fossil", "21. use up", "22. distinguished",
             "23. (d)", "24. (c)", "25. (b)", "26. speak",
             "27. (b)", "28. (d)", "29. (a)", "30. (d)",
             "31. had paid",
             "35. (a) True", "36. (a) True", "37. ( c )", "38. ( b)",
             "39. (a) True", "40. (b) False", "41. ( b)", "42. ( a )",
             "43. Solar collectors collect heat by absorbing sunlight.",
             "44. (a) True", "45. (b) False", "46. (c)", "47 .(d)",
             "48. and", "49. so",
             "but he had to read it",
             "(f). Cell phones are important in these changes."]
KEY_FRAGS = KEY_FRAGS[:-1] + ["(c) The new century has brought big changes in communication.",
             "(b) Most of these cell phones can help you have video calls.",
             "(d) But some people do not have such phones",
             "(e) because they are very expensive.",
             "(a) In short, communication can depend on technology."]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# بلوک‌های درهمِ لایه (س۱۱) — فرگمنت‌های واقعی؛ کلیدِ کامل با داوریِ رندر ۳۰۰dpi
for frag in ["moved to China", "when", "Chinese", "learn", "already", "had", "Joe",
             "you.", "they were", "if", "a house", "would buy", "They",
             "http://aee.medu.ir"]:
    assert frag in keyjoin, f"scrambled key layer fragment missing: {frag}"

# ————— س۶: بانکِ واژگان (ص۳۰۹) → بانک l36 —————
S20 = norm_stem(line_after_dot(p309, "20. Oil, coal"))
S21 = norm_stem(line_after_dot(p309, "21. Don’t"))
S22 = norm_stem(line_after_dot(p309, "22. Dr. Gharib"))
assert S20 == "Oil, coal and natural gas are three common ------- fuels.", S20
assert S21 == "Don’t ------- all the milk, we need some for breakfast.", S21
assert S22 == "Dr. Gharib was known as a ------- university professor in our country.", S22
assert "suppose, use up, distinguished, fossil" in full
POOL36 = ["suppose", "use up", "distinguished", "fossil"]  # ترتیبِ چاپ
Q20_22 = [
    q("g12-l36-1", 1, "vocab", S20, POOL36, 3),
    q("g12-l36-2", 2, "vocab", S21, POOL36, 1),
    q("g12-l36-3", 3, "vocab", S22, POOL36, 2),
]
assert [it["options"][it["answer"]] for it in Q20_22] == ["fossil", "use up", "distinguished"]
for it in Q20_22:
    assert it["options"][it["answer"]] != "suppose", it["id"]

# ————— س۷: تعریف‌یابی A/B (ص۳۰۹) → بانک l36 —————
S23 = "I did not read the introduction and jumped into the next part."
S24 = "Mom forgave me for breaking the vase."
S25 = "The factory will replace most of its workers with robots."
assert S23 in full and S24 in full and S25 in full
DEFS = ["to put things in a neat, attractive, or useful order",   # a — اضافیِ چاپی
        "to take the place of somebody or something",             # b
        "to stop being angry with someone",                       # c
        "to suddenly decide to do something"]                     # d
for df in DEFS:
    assert df in full, df
Q23_25 = [
    q("g12-l36-4", 4, "vocab", f"«{S23}» — تعریفِ ستون B برای واژهٔ «jumped into»: -------", DEFS, 3),
    q("g12-l36-5", 5, "vocab", f"«{S24}» — تعریفِ ستون B برای واژهٔ «forgave»: -------", DEFS, 2),
    q("g12-l36-6", 6, "vocab", f"«{S25}» — تعریفِ ستون B برای واژهٔ «replace»: -------", DEFS, 1),
]
assert [it["options"][it["answer"]] for it in Q23_25] == [DEFS[3], DEFS[2], DEFS[1]]
for it in Q23_25:
    assert it["options"][it["answer"]] != DEFS[0], it["id"]

# ————— س۸: اصطلاح (ص۳۰۹) — ساقهٔ دوبخطی با گیومهٔ خمیدهٔ چاپ —————
i26 = next(i for i, l in enumerate(p309) if "26. Just saying" in l)
S26 = norm_stem(p309[i26].strip().split(".", 1)[1].strip() + " " + p309[i26 + 1].strip())
assert S26 == "Just saying that you will do something doesn’t mean much. You know that “Actions s - - - - louder than words”.", S26
Q26 = q("g12-l36-7", 7, "vocab", S26,
        ["speak", "spend", "sound", "stand"], 0)
for o in Q26["options"]:
    assert re.fullmatch(r"s[a-z]{4}", o), o

Q_L36 = Q20_22 + Q23_25 + [Q26]

# ————— س۹: گرامر MCQ (ص۳۱۰) → بانک l37 —————
G27 = norm_stem(line_after_dot(p310, "27. Hamid doesn’t say"))
i28 = next(i for i, l in enumerate(p310) if "28. A: What did she do" in l)
G28 = norm_stem(p310[i28].strip().split(".", 1)[1].strip() + " " + p310[i28 + 1].strip())
i29 = next(i for i, l in enumerate(p310) if "29. A: Guess what" in l)
G29 = norm_stem(p310[i29].strip().split(".", 1)[1].strip() + " " + p310[i29 + 1].strip())
i30 = next(i for i, l in enumerate(p310) if "30. A: I do not have" in l)
G30 = norm_stem(p310[i30].strip().split(".", 1)[1].strip() + " " + p310[i30 + 1].strip())
assert G27 == "Hamid doesn’t say a bad word, -------?", G27
assert G28 == "A: What did she do last Friday? B: She watched the film ------- was very interesting.", G28
assert G29 == "A: Guess what we have for dinner! B: A fish salad ------- for dinner by the cook.", G29
assert G30 == "A: I do not have a good job and cannot earn enough money. B: If you had a good job, you ------- a lot of money.", G30
for o in ["did Hamid", "does he", "doesn’t Hamid", "isn’t he",
          "whom", "who", "where", "which",
          "may be made", "will make", "is making", "has made",
          "will earn", "were earned", "earned", "could earn"]:
    assert o in full, o
Q_L37 = [
    q("g12-l37-1", 1, "grammar", G27, ["did Hamid", "does he", "doesn’t Hamid", "isn’t he"], 1),
    q("g12-l37-2", 2, "grammar", G28, ["whom", "who", "where", "which"], 3),
    q("g12-l37-3", 3, "grammar", G29, ["may be made", "will make", "is making", "has made"], 0),
    q("g12-l37-4", 4, "grammar", G30, ["will earn", "were earned", "earned", "could earn"], 3),
]
# کلیدهای چاپی [b,d,a,d] — ترتیبِ چاپ حفظ شد
assert [it["answer"] for it in Q_L37] == [1, 3, 0, 3]
assert [it["options"][it["answer"]] for it in Q_L37] == ["does he", "which", "may be made", "could earn"]

# ————— س۱۳: خوانداریِ لغت‌نامه (ص۳۱۰) → بانک l38 —————
dictread = norm_stem(join_inclusive(p310, "A dictionary is a book that explains",
                                    "entered English from Persian."))
for frag in ["dictionaries put them in alphabetical order",
             "The word ‘dictionary’ comes from the Latin ‘dictio’ (‘saying’).",
             "dictionaries of biography that tell about famous people",
             "the International Phonetic Alphabet (IPA) is used for this purpose",
             "‘pajamas’, ‘bazaar’ and ‘paradise’ entered English from Persian"]:
    assert frag in dictread, frag
T35 = norm_stem(line_after_dot(p311, "35. Words are easily found").split("a) True")[0].strip())
T36 = norm_stem(line_after_dot(p311, "36. The word ‘dictionary’").split("a) True")[0].strip())
M37 = norm_stem(line_after_dot(p311, "37. What do dictionaries of biography").split("a) These")[0].strip())
M38 = norm_stem(line_after_dot(p311, "38. What does “them”").split("a) pronunciations")[0].strip())
assert T35 == "Words are easily found in dictionaries because dictionaries put them in alphabetical order.", T35
assert T36 == "The word ‘dictionary’ comes from the Latin ‘dictio’.", T36
assert M37 == "What do dictionaries of biography explain?", M37
assert M38 == "What does “them” in the first line of paragraph 3 refer to?", M38
Q_L38 = [
    q("g12-l38-1", 1, "grammar", f"{dictread} — {T35}", ["True", "False"], 0),
    q("g12-l38-2", 2, "grammar", f"{dictread} — {T36}", ["True", "False"], 0),
    q("g12-l38-3", 3, "grammar", f"{dictread} — {M37}",
      ["These dictionaries explain the meanings of technical words.",
       "Dictionaries of biography explain IPA.",
       "They tell about famous people.",
       "They translate words from one language to another."], 2),
    q("g12-l38-4", 4, "grammar", f"{dictread} — {M38}",
      ["pronunciations", "words", "dictionaries", "spellings"], 1),
]
# کلیدهای چاپی [a,a,c,b] — دوبلِ Trueِ چاپ در ۳۵/۳۶؛ «37. ( c )» با فاصله‌های چاپی (پنجمین بار)
assert [it["answer"] for it in Q_L38] == [0, 0, 2, 1]

# ————— س۱۴: خوانداریِ انرژیِ خورشیدی (ص۳۱۱) → بانک l39 —————
# هستهٔ مشترک با متنِ انرژیِ r382 (دی ۱۴۰۰) — این نسخه بلندتر است (Nowadays...space stations)
solar = norm_stem(join_inclusive(p311, "The most common type of clean energy",
                                 "houses and even space stations."))
for frag in ["Solar energy is produced by the radiation that reaches the earth.",
             "People have used the sun as a heat source for thousands of years.",
             "Iranians, for instance, use special designs and arrangements of windows, balconies and yards",
             "Different kinds of materials might also be used in building the houses.",
             "solar energy can be converted into other forms of energy",
             "Maybe you’ve seen buildings or houses with big shiny panels on the roof.",
             "Solar energy is used in generating electricity for watches, highway signs, houses and even space stations."]:
    assert frag in solar, frag
T39 = norm_stem(line_after_dot(p311, "39. According to the passage, solar").split("a)True")[0].strip())
T40 = norm_stem(line_after_dot(p311, "40. People have used the sun").split("a)True")[0].strip())
M41 = norm_stem(line_after_dot(p311, "41. Iranians use special").split("a) generate")[0].strip())
i42 = next(i for i, l in enumerate(p311) if "42. The passage says people use different" in l)
M42 = norm_stem(p311[i42].strip().split(".", 1)[1].strip() + " " + p311[i42 + 1].strip()).split("a) materials")[0].strip()
assert T39 == "According to the passage, solar power is the most common type of clean energy.", T39
assert T40 == "People have used the sun as a source of heat for few years.", T40
assert M41 == "Iranians use special designs of windows and balconies to------- .", M41
assert M42 == "The passage says people use different -------in building the houses to keep them warm in winter and cool in summer.", M42
Q_L39 = [
    q("g12-l39-1", 1, "grammar", f"{solar} — {T39}", ["True", "False"], 0),
    q("g12-l39-2", 2, "grammar", f"{solar} — {T40}", ["True", "False"], 1),
    q("g12-l39-3", 3, "grammar", f"{solar} — {M41}",
      ["generate electricity", "get the most sunshine", "keep themselves strong", "heat water"], 1),
    q("g12-l39-4", 4, "grammar", f"{solar} — {M42}",
      ["materials", "seasons", "pools", "signs"], 0),
]
# کلیدهای چاپی [a,b,b,a]
assert [it["answer"] for it in Q_L39] == [0, 1, 1, 0]

# ————— س۱۵: خوانداریِ نوجوانان (ص۳۱۱→۳۱۲ — دوصفحه‌ای) → بانک l40 —————
teens1 = join_inclusive(p311, "For many people, their teenage years", "they can buy their own")
teens2 = join_inclusive(p312, "cars. After finishing high school", "lives.")
teens = norm_stem(teens1 + " " + teens2)
for frag in ["their teenage years – from 13 to 19 – are sometimes the best or worst years",
             "Teenagers often want to show that what they do is correct",
             "In some countries, they can drive when they are only 16.",
             "they can buy their own cars. After finishing high school",
             "their life experiences, their failures, their successes",
             "parents are the best support in their lives"]:
    assert frag in teens, frag
T44 = norm_stem(line_after_dot(p312, "44. According to the passage, teenagers").split("a) True")[0].strip())
T45 = norm_stem(line_after_dot(p312, "45. Teenagers at the age").split("a) True")[0].strip())
M46 = norm_stem(line_after_dot(p312, "46. The passage says that parents").split("a) people")[0].strip())
M47 = norm_stem(line_after_dot(p312, "47. Teenagers should respect").split("a)")[0].strip())
assert T44 == "According to the passage, teenagers are between thirteen and nineteen years old.", T44
assert T45 == "Teenagers at the age 16 can drive in all countries.", T45
assert M46 == "The passage says that parents have a lot to share with-------", M46
assert M47 == "Teenagers should respect their parents because they are the best-------for teenagers.", M47
Q_L40 = [
    q("g12-l40-1", 1, "grammar", f"{teens} — {T44}", ["True", "False"], 0),
    q("g12-l40-2", 2, "grammar", f"{teens} — {T45}", ["True", "False"], 1),
    q("g12-l40-3", 3, "grammar", f"{teens} — {M46}",
      ["people", "high schools", "teenagers", "adults"], 2),
    q("g12-l40-4", 4, "grammar", f"{teens} — {M47}",
      ["success", "generation", "experience", "support"], 3),
]
# کلیدهای چاپی [a,b,c,d]
assert [it["answer"] for it in Q_L40] == [0, 1, 2, 3]

# ————— س۱۶: حروفِ ربط (ص۳۱۲) → بانک l41 —————
C48 = norm_stem(line_after_dot(p312, "48. We went to the restaurant"))
C49 = norm_stem(line_after_dot(p312, "49. That dictionary is expensive"))
assert C48 == "We went to the restaurant ------- ordered food.", C48
assert C49 == "That dictionary is expensive, -------I can’t buy it.", C49
assert "but, and, so, or" in full
CONJ = ["but", "and", "so", "or"]
Q_L41 = [
    q("g12-l41-1", 1, "grammar", C48, CONJ, 1),
    q("g12-l41-2", 2, "grammar", C49, CONJ, 2),
]
assert [it["options"][it["answer"]] for it in Q_L41] == ["and", "so"]
assert [it["answer"] for it in Q_L41] == [1, 2]
for it in Q_L41:
    assert sorted(it["options"]) == sorted(CONJ), it["id"]

# ————— س۱۸: مرتب‌سازیِ پاراگرافِ ارتباطات (ص۳۱۲) → بانک l42 (شش‌گزینه‌ای) —————
SENT_A = "In short, communication can depend on technology."
SENT_B = "Most of these cell phones can help you have video calls."
SENT_C = "The new century has brought big changes in communication."
SENT_D = "But some people do not have such phones"
SENT_E = "because they are very expensive."
SENT_F = "Cell phones are important in these changes."
for s in (SENT_A, SENT_B, SENT_C, SENT_D, SENT_E, SENT_F):
    assert s in full, s
COMM = [SENT_A, SENT_B, SENT_C, SENT_D, SENT_E, SENT_F]  # ترتیبِ چاپِ a-f
# کلیدهای چاپی: 51.(c) 52.(f) 53.(b) 54.(d) 55.(e) 56.(a)
Q_L42 = [
    q("g12-l42-1", 1, "grammar", "مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۱ (جملهٔ آغازینِ پاراگراف): -------", COMM, 2),
    q("g12-l42-2", 2, "grammar", "مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۲ در پاراگراف: -------", COMM, 5),
    q("g12-l42-3", 3, "grammar", "مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۳ در پاراگراف: -------", COMM, 1),
    q("g12-l42-4", 4, "grammar", "مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۴ در پاراگراف: -------", COMM, 3),
    q("g12-l42-5", 5, "grammar", "مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۵ در پاراگراف: -------", COMM, 4),
    q("g12-l42-6", 6, "grammar", "مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۶ (پایان‌بندیِ پاراگراف): -------", COMM, 0),
]
assert [it["options"][it["answer"]] for it in Q_L42] == [SENT_C, SENT_F, SENT_B, SENT_D, SENT_E, SENT_A]
assert [it["answer"] for it in Q_L42] == [2, 5, 1, 3, 4, 0]
for it in Q_L42:
    assert len(it["options"]) == 6 and len(set(it["options"])) == 6, it["id"]

# ————— درج در سند —————
B36 = {"lesson": 36, "title": "نهایی خرداد ۱۴۰۰ — واژگان و تعریف و اصطلاح (س۶-س۸، ص۳۰۹)", "level": "چهارگزینه‌ای",
       "count": len(Q_L36), "questions": Q_L36}
B37 = {"lesson": 37, "title": "نهایی خرداد ۱۴۰۰ — گرامر (س۹، ص۳۱۰)", "level": "چهارگزینه‌ای",
       "count": len(Q_L37), "questions": Q_L37}
B38 = {"lesson": 38, "title": "نهایی خرداد ۱۴۰۰ — خوانداریِ لغت‌نامه (س۱۳، ص۳۱۰)", "level": "چهارگزینه‌ای",
       "count": len(Q_L38), "questions": Q_L38}
B39 = {"lesson": 39, "title": "نهایی خرداد ۱۴۰۰ — خوانداریِ انرژیِ خورشیدی (س۱۴، ص۳۱۱)", "level": "چهارگزینه‌ای",
       "count": len(Q_L39), "questions": Q_L39}
B40 = {"lesson": 40, "title": "نهایی خرداد ۱۴۰۰ — خوانداریِ نوجوانان (س۱۵، ص۳۱۱-۳۱۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L40), "questions": Q_L40}
B41 = {"lesson": 41, "title": "نهایی خرداد ۱۴۰۰ — حروفِ ربط (س۱۶، ص۳۱۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L41), "questions": Q_L41}
B42 = {"lesson": 42, "title": "نهایی خرداد ۱۴۰۰ — مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲)", "level": "شش‌گزینه‌ای",
       "count": len(Q_L42), "questions": Q_L42}
# ————— نشت‌سنج: محتوای مستثنی‌شده نباید در بانک‌های این راند باشد —————
# (دامنه‌راندی — درسِ r384-بند۵: «I have kept a diary for twelve years» در r383 به‌عنوانِ
#  ساقهٔ تعریفِ «diary» قانوناً استخراج شده و همین جمله در س۵ِ این برگه اضافیِ چاپی است؛
#  برخوردِ بین‌برگه‌ایِ مشروع — سنجش فقط روی بانک‌های تازهٔ l36-l42)
LEAKS = ["Roya will go to the gym",                    # س۱ (شنیداری)
         "Rasoul and his family",                      # س۲ (شنیداری)
         "The environment means different things",     # س۳ (شنیداریِ کلوژ)
         "Promising others can make our world",        # س۴ (شنیداری)
         "I have kept a diary for twelve years",       # س۵ اضافیِ چاپی (در r383-l23-6 مشروع است)
         "gave me some money back",                    # س۱۰ (تایپی)
         "Joe had already learned Chinese",            # س۱۱ (تایپی — پاسخِ مدل)
         "They would buy a house",                     # س۱۱ (تایپی — پاسخِ مدل)
         "A horse is an animal",                       # س۱۲ (تایپی/تولیدی)
         "but he had to read it",                      # س۱۷ (تصویری-کلید)
         "Different types of sport",                   # س۱۹ چیپ
         "Good physical shape",                        # س۱۹ چیپ
         "Healthier heart"]                            # س۱۹ چیپ
blob = json.dumps([B36, B37, B38, B39, B40, B41, B42], ensure_ascii=False)
for s in LEAKS:
    assert s not in blob, f"leak: {s}"

for b in (B36, B37, B38, B39, B40, B41, B42):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie6"] = {
    "extractedRound": "r385",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ ششم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۴۰۰ (واریانتِ رشتهٔ ریاضی-فیزیک و علوم تجربی)",
    "examPages": "pdf-p308-312 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p313-314 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p307→p308 (پایانِ کلیدِ برگهٔ قبل) و p314→p315 (آغازِ خرداد ۱۴۰۰ انسانیِ r384)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: ریاضی-فیزیک و علوم تجربی — نوبت خرداد ماه سال ۱۴۰۰ (تاریخِ چاپی: ۱۹/۰۳/۱۴۰۰) — مدت ۱۲۰ دقیقه — ساعت شروع ۸ صبح — ۱۹ سکشن/۵۷ ردیف/بارم ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — «GOOD LUCK / جمع نمره ۴٠» — برگهٔ خواهرِ انسانی (ص۳۱۵-۳۲۱، یک روز قبل: ۱۸/۰۳) جداگانه چاپ شده",
    "keyPages": "pdf-p313-314 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۵۵ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۳۱ کلید از ۳۱ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «1. False (b) 2. False (b) 3. True (a) 4. True (a)» / «5. (b) 6. (c) 7. (c) 8. (a)» / «9. around 10. social 11. land 12. protect» / «13. False (b) 14. True (a) 15. listen» / «16. (e) 17.(d) 18. (a) 19. (c)» / «20. fossil 21. use up 22. distinguished» / «23. (d) 24. (c) 25. (b)» / «26. speak» / «27. (b) 28. (d) 29. (a) 30. (d)» / «31. had paid» / «35. (a) True 36. (a) True 37. ( c ) 38. ( b)» / «39. (a) True 40. (b) False 41. ( b) 42. ( a )» / «43. Solar collectors collect heat by absorbing sunlight.» / «44. (a) True 45. (b) False 46. (c) 47 .(d)» / «48. and 49. so» — بلوکِ درهمِ لایه برای س۱۱ (۳۲/۳۳) با داوریِ رندرِ ۳۰۰dpi (/tmp/qa-r385/p313-s11-zoom.png): «32. Joe had already learned Chinese when he moved to China.» / «33. They would buy a house if they were you.» — ششمین تکرارِ درسِ r380-ق۳۲",
    "sectionsTotal": 57,
    "sectionsExtracted": 31,
    "sectionsSkipped": 26,
    "items": 31,
    "bankCounts": [7, 4, 4, 4, 4, 2, 6],
    "keyPolicy": "همهٔ کلیدهای ۳۱ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ گزینه‌های مهندسی‌شده: بانکِ واژگانِ l36-ق۱-۳ به ترتیبِ چاپِ خودِ برگه (suppose, use up, distinguished, fossil) با اضافیِ چاپیِ هرگز-کلید (suppose) و چهارِ اصطلاحِ l36-ق۷ (شکلِ حروفِ چاپ s---- محترم: speak در برابرِ spend/sound/stand — هر چهار ۵حرفیِ s-دار)؛ تعریف‌یابیِ l36-ق۴-۶ به ترتیبِ چاپِ ستون B با اضافیِ «to put things in a neat, attractive, or useful order» هرگز-کلید؛ کلیدهای درست/غلطِ l38/l39/l40 سمانتیک‌اند و چرخش نمی‌پذیرند (دوبلِ Trueِ چاپ در ۳۵/۳۶ وفادارانه حفظ شد)؛ گرامرِ l37 و حروفِ ربطِ l41 به ترتیبِ چاپ؛ بانکِ مرتب‌سازیِ l42 گزینه‌هایش را به ترتیبِ چاپِ a-f می‌چیند با کلیدهای چاپی [c,f,b,d,e,a] در اندیس‌های [2,5,1,3,4,0]",
    "engineNote": "هر ۳۱ آیتم MCQ (قراردادِ کارتِ g12)؛ l42 دومین بانکِ شش‌گزینه‌ایِ مرتب‌سازیِ مخزن (الگویِ l35ِ r384) — هر جایگاهِ ۵۱-۵۶ یک آیتم با هر شش جمله به‌عنوان گزینه؛ d و e در چاپ دو نیمهٔ یک جمله‌اند ولی وفادارانه دو گزینهٔ جدا ماندند (کلیدهای چاپی ۵۴=d و ۵۵=e)؛ ساقه‌های خوانداریِ l38/l39/l40 متنِ کاملِ چاپی را در خود دارند؛ ساقه‌های تعریف‌یابی دوبخشیِ فارسی (الگویِ r380-l5)؛ ساقه‌های A/B گرامر (ق۲۸/۲۹/۳۰) دوبخطیِ بازجوش؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» چسبیده",
    "derivedKeys": {
        "S6": ["fossil", "use up", "distinguished"],
        "S7": ["to suddenly decide to do something", "to stop being angry with someone", "to take the place of somebody or something"],
        "S8": ["speak"],
        "S9": ["does he", "which", "may be made", "could earn"],
        "S13": ["True", "True", "They tell about famous people.", "words"],
        "S14": ["True", "False", "get the most sunshine", "materials"],
        "S15": ["True", "False", "teenagers", "support"],
        "S16": ["and", "so"],
        "S18": ["The new century has brought big changes in communication.", "Cell phones are important in these changes.", "Most of these cell phones can help you have video calls.", "But some people do not have such phones", "because they are very expensive.", "In short, communication can depend on technology."],
    },
    "paperMap": "نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — کشفِ r384، تأییدِ دوباره در این راند: دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ (پیش از presentation-forms)؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸)؛ شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸)؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹)؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹)؛ برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ (۱۳/۰۶/۹۹)؛ شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ (۱۳/۰۶/۹۹)؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ (۰۱/۱۱/۹۹)؛ خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ ← این راند؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۶ برگه استخراج شد، ۱۱ برگه باقی است",
    "skippedSections": [
        "س۱ (ردیف ۱-۴، شنیداریِ درست/غلط): مکالمهٔ مینا/رویا (باشگاهِ ورزشی) — صوتی-کلید (پاورقیِ «Audio script (PDF) / Audio file (MP3)» در ص۳۰۸)؛ کلیدهای چاپی: 1.False(b)/2.False(b)/3.True(a)/4.True(a) — در رسید حفظ شد",
        "س۲ (ردیف ۵-۸، شنیداری): مکالمهٔ امیر/رسول (رستورانِ نو، غذای ماهی/مرغ) — صوتی-کلید با گزینه‌های چاپیِ کامل (it was expensive/they didn’t want to/the restaurant was too far و...)؛ کلیدهای چاپی: 5.(b)/6.(c)/7.(c)/8.(a)",
        "س۳ (ردیف ۹-۱۲، شنیداریِ کلوژ): متنِ محیطِ زیست (The environment means different things...) — صوتی-کلید؛ کلیدهای چاپی: 9.around/10.social/11.land/12.protect",
        "س۴ (ردیف ۱۳-۱۵، شنیداری): معلم/دانش‌آموز (قول دادن/احترام) — صوتی-کلید؛ کلیدهای چاپی: 13.False(b)/14.True(a)/15.listen",
        "س۵ (ردیف ۱۶-۱۹، تصویری): «با توجه به تصاویر... یک جمله اضافی است» — چهار تصویر با داوریِ کاملِ رندر (ص۳۰۹، ۳۰۰dpi): (16) کارخانهٔ آلاینده با رودخانهٔ آلوده و بشکهٔ سم→e، (17) کبوترهای پارک→d، (18) سه لامپِ روشن→a، (19) صفحهٔ لغت‌نامه با مدادِ دایره‌کشیده→c؛ اضافیِ چاپی: b) I have kept a diary for twelve years — هم‌خوانِ کلیدِ رسمی؛ استخرِ جمله‌های س۵ در r382 نیز هست (لامپ/دایره‌کشی) با اضافیِ متفاوت (خواهر-برادریِ برگه‌ها)",
        "س۱۰ (ردیف ۳۱، شکلِ فعلِ باز): «They gave me some money back because I …….. too much. (pay)» — کلیدِ چاپیِ دقیق «had paid» (ماضیِ بعید) — بدونِ گزینهٔ چاپی؛ کاندیدِ بانکِ تایپی",
        "س۱۱-س۱۲ (ردیف ۳۲-۳۴): جمله‌سازیِ درهم (پاسخِ مدل: «Joe had already learned Chinese when he moved to China.» و «They would buy a house if they were you.» — بلوکِ درهمِ لایه با داوریِ رندرِ ص۳۱۳) و ضمیرِ موصولی (A horse is an animal + which + جملهٔ دارای فعل) — کاندیدِ تایپی/تولیدی",
        "ردیف ۴۳ (پاسخِ مدلِ خورشیدی: «Solar collectors collect heat by absorbing sunlight.» بارم ۱) — کاندیدِ تایپی (عینِ جمله در متنِ خوانداریِ l39 هست — نشت‌سنج شمول ندارد)",
        "س۱۷ (ردیف ۵۰، حرفِ ربط با تصویر): «The book was boring ……………………………… . (read)» — کلیدِ چاپیِ کامل «50. …..but he had to read it.» — عینِ کلیدِ r382-س۱۷ (برخوردِ بین‌برگه‌ایِ بی‌خطر؛ هر دو مستثنی) — تصویری-کلید؛ کلید حفظ شد",
        "س۱۹ (ردیف ۵۷، نگارشِ تولیدی): پاراگرافِ Sport با چیپ‌های چاپی (Different types of sport / Good physical shape (the body) / Healthier heart) — تولیدی با کلیدِ بند-رأیی",
    ],
    "printQuirks": [
        "چهارمین برگهٔ presentation-forms (ﺳﺆاﻻت/اﻣﺘﺤﺎنِ چسبیده — الگویِ r382/r383) — متنِ انگلیسی و کلیدها لاتینِ سالم",
        "تاریخِ چاپیِ ۱۹/۰۳/۱۴۰۰ با «نوبت خرداد ماه سال 1400» — دومین برگه از جفتِ خرداد ۱۴۰۰ (خواهرِ انسانی یک روز قبل: ۱۸/۰۳)",
        "دو کلیدِ پرانتز-فاصله‌دارِ چاپی در یک صفحه: «37. ( c )» و «42. ( a )» — پنجمین و ششمین بار (الگویِ r380-q38/r382-q38/r383-ق۳۸/r384-ق۳۷)",
        "«47 .(d)» — نقطهٔ قبل از شماره (فاصله+نقطه) — کوئیرکِ نو؛ در برابرِ «46. (c)» عادی در همان سطر",
        "«41. ( b)» و «38. ( b)» — پرانتزِ بازِ چسبیده به حرف بدونِ فاصله‌ی بعدی",
        "ق۴۲ «different ………..in building» — نقطه‌چینِ چسبیده به واژهٔ بعدی → پس از norm «-------in»؛ ق۴۷ «the best…………for teenagers.» و ق۴۹ «expensive, ……….I can’t buy it.» همین الگو",
        "ق۴۱ «to….............» — ترکیبِ سه‌نقطه+نقطه‌چینِ بلند + نقطهٔ پایانیِ جدا → پس از norm «to------- .»",
        "دوبلِ Trueِ چاپ در ۳۵/۳۶ (سومین رخدادِ بعدِ r384-ق۴۴/۴۵) و «(a)True» بدونِ فاصله در ق۳۹/۴۰",
        "گزینهٔ «a)  success» با دوفاصلهٔ چاپی بعدِ حرف (ص۳۱۲، س۱۵-ق۴۷)",
        "پیشوندِ چاپیِ «a).» در جملاتِ س۱۸ — همان الگویِ مورچه‌های r384؛ جملهٔ d بدونِ نقطهٔ پایانیِ چاپ (But some people do not have such phones) و e با نقطه (because they are very expensive.) — دو نیمهٔ یک جمله",
        "آپاستروفِ خمیدهٔ یکدست در کلِ برگه (doesn’t/Don’t/it’s/‘purpose’) — عینِ چاپ حفظ شد",
        "بلوکِ کلیدِ RTLِ درهمِ س۱۱ («Joe/moved to China/when/Chinese» سطرشکن) — داوریِ رندرِ ۳۰۰dpi ص۳۱۳",
    ],
    "futureNote": "بخشِ ۴: ۶ برگه از ۱۷ استخراج شد، ۱۱ برگه باقی است (نزدیک‌ترین‌ها: دی ۱۳۹۹ ص۳۰۱-۳۰۷ و شهریور ۱۳۹۹ ص۲۸۵-۲۹۲؛ به‌علاوهٔ برگهٔ لایه‌خرابِ ص۲۷۷-۲۸۴ که OCR/رندر می‌خواهد و جفتِ ۱۳۹۷ با کلیدِ سربرگِ قدیمی)؛ کاندیدهای تایپیِ این برگه (س۱۰ «had paid» + ردیف‌های ۳۲ «Joe had already learned Chinese when he moved to China.» / ۳۳ «They would buy a house if they were you.» / ۳۴ which-اسب / ۴۳ «Solar collectors collect heat by absorbing sunlight.») به کاندیدهای r380-r384 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۳۹ ردیف است (۳۴ِ r384 + ۵ ردیفِ تازه)",
}
d["source"]["g12nahaie6"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r385 OK — banks={len(d['lessons'])} items={total} (+31 in 7 banks: l36=7 l37=4 l38=4 l39=4 l40=4 l41=2 l42=6) — نهایی خرداد ۱۴۰۰ (ریاضی-تجربی) با کلیدِ رسمی")
