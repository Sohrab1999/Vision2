#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r386 — برگهٔ هفتمِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ دی ۱۳۹۹
(کلیهٔ رشته‌ها؛ تاریخِ چاپی ۰۱/۱۱/۹۹؛
pdf-p301-305 آزمون + کلیدِ رسمیِ «راهنمای تصحیح» pdf-p306-307)
→ tests-g12.json با ۸ بانکِ تازه (l43=4؛ l44=6؛ l45=8؛ l46=4؛ l47=4؛ l48=4؛ l49=4؛ l50=6)
— ۴۲ بانکِ قبلی + این = ۵۰ بانک/۵۲۱ آیتم

ساختار آزمون (۱۷ سکشن، ۶۲ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۵ صفحه، شروع ۱۰ صبح):
  س۱ (۱-۳)    شنیداریِ MCQ (پرسشِ چاپیِ «Who are our elders?») — صوتی-کلید — مستثنی (کلید: 1.( a )/2.( b )/3.( d ))
  س۲ (۴-۷)    شنیداریِ True/False (پرواز/گذرنامه) — صوتی-کلید — مستثنی (کلید: 4.False (B)/5.True (A)/6.False (B)/7.False (B))
  س۳ (۸-۱۱)   شنیداریِ کلوژِ چاپِ توربینِ بادی (امد/پدر) — متنِ چاپی + کلیدِ چاپی → بانک l43 (چهارگزینه‌ای)
  س۴ (۱۲-۱۷)  شنیداریِ کلوژِ چاپِ برنامه‌های تلویزیونی — متنِ چاپی + کلیدِ چاپی → بانک l44 (شش‌گزینه‌ای)
  س۵ (۱۸-۱۹)  شنیداریِ تولیدی — کلیدهای مدلِ چاپی (18. He would go to the park. / 19. They can play one of
              their thinking games.) — مستثنی
  س۶ (۲۰-۲۳)  تصویری (یک جمله اضافی: a) — تصویری-کلید — مستثنی (کلید: 20.(b)/21.(e)/22.(d)/23.(c)؛
              گزینهٔ d عینِ ساقهٔ r385-l36-1 است؛ e یعنی «I have kept a diary» اینجا کلید است و در
              r385 اضافیِ چاپی بود — چرخشِ بین‌برگه‌ای)
  س۷ (۲۴-۲۶)  بانکِ ۴واژه‌ای (dedicated, replaced, forgive, recommend — اضافیِ چاپی: forgive) → بانک l45
  س۸ (۲۷-۲۹)  تعریف‌یابی A/B (اضافیِ چاپی: b «the part at the beginning of a book...») → بانک l45
  س۹ (۳۰-۳۱)  حرفِ اولِ باز: «s - - - - -»=symbol و «w- - -»=worm (کلیدِ چاپی) — گزینه‌های هم‌شکلِ مهندسی‌شده → بانک l45
  س۱۰ (۳۲-۳۵) گرامر MCQ (tag/موصولی/مجهول/شرطی) → بانک l46 (کلیدهای چاپی [b,c,a,b])
  س۱۱ (۳۶-۳۷) شکلِ فعلِ باز (study→had studied / speak→is spoken) — مستثنی؛ کاندیدِ بانکِ تایپی
  س۱۲ (۳۸-۳۹) جمله‌سازیِ درهم — پاسخِ مدلِ چاپی («Mina was upset because she had gotten a bad score.» —
              دوقلویِ r384 با نامِ متفاوت؛ «John could fix the car if he were at home.» — عینِ r384) —
              هفتمین تکرارِ درسِ r380-ق۳۲ — مستثنی؛ کاندیدِ تایپی
  س۱۳ (۴۰-۴۵) خوانداریِ فرهنگِ لغت: ۴۰-۴۳ → بانک l47؛ ۴۴/۴۵ پاسخِ مدلِ چاپی — کاندیدِ تایپی
  س۱۴ (۴۶-۵۱) خوانداریِ پیکاسو: ۴۶-۴۹ → بانک l48؛ ۵۰/۵۱ تکمیلِ جمله با کلیدِ تک‌واژه‌ای (world/creating) — کاندیدِ تایپی
  س۱۵ (۵۲-۵۵) حروفِ ربط (but, and, so, or — ترتیبِ چاپِ دستور) → بانک l49 (کلیدهای چاپی [but,so,and,or])
  س۱۶ (۵۶-۶۱) مرتب‌سازیِ پاراگرافِ کانادا (a-f) با کلیدهای ۵۶.(c)/۵۷.(f)/۵۸.(a)/۵۹.(b)/۶۰.(d)/۶۱.(e)
              → بانک l50 (شش‌گزینه‌ای — سومین بانکِ مرتب‌سازیِ مخزنِ نهایی‌ها)
  س۱۷ (۶۲)    پاراگرافِ Solar system با چیپ‌های چاپی (The number of the planets / The order of distance
              from the Sun / The center of the solar system: The sun / The largest and smallest planets)
              — تولیدی — مستثنی
idempotent: اجرای دوم NO-OP (رسید g12nahaie7).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie7" in d.get("source", {}):
    print("r386: receipt g12nahaie7 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie6" in d.get("source", {}), "tests-g12.json (r385) must exist first"
assert len(d["lessons"]) == 42, f"expected 42 banks before r386, got {len(d['lessons'])}"

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


p301 = page_slice(301)
p302 = page_slice(302)
p303 = page_slice(303)
p304 = page_slice(304)
p305 = page_slice(305)
p306 = page_slice(306)
p307 = page_slice(307)
full = "\n".join(p301 + p302 + p303 + p304 + p305 + p306 + p307)


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


def gapify(raw: str) -> str:
    """خانه‌های شماره‌دارِ بدونِ پرانتزِ چاپ («……8…..») → «------- (8) -------»
    (الگویِ چاپِ این برگه برخلافِ r381/r383 که پرانتزِ چاپی داشتند) — پیش از norm اجرا شود."""
    return re.sub(r"[….]+\s*(\d{1,2})\s*[….]+", lambda m: f"------- ({m.group(1)}) -------", raw)


def line_after_dot(pages: list[str], frag: str) -> str:
    l = next(l for l in pages if frag in l)
    return l.strip().split(".", 1)[1].strip()


# ————— پیمانِ سربرگِ آزمون (ص۳۰۱ — presentation-forms با دوفاصله، الگویِ r383) —————
assert any("ﺳﺆاﻻت  اﻣﺘﺤﺎن" in l for l in p301), "سربرگِ فرم‌های ارائه با دوفاصله"
assert any("1399" in l for l in p301)
assert any("aee.medu.ir" in l for l in p301)
assert any("دوازدﻫﻢ" in l for l in p301), "پایهٔ دوازدهم"
p301join = re.sub(r"\s+", " ", " ".join(p301))
assert "01 / 11 / 99" in p301join, "تاریخِ ۰۱/۱۱/۹۹"
assert "10ﺻﺒﺢ" in p301join, "ساعتِ شروعِ ۱۰ صبح"
assert any("Audio" in l for l in p301), "پاورقیِ Audio script / MP3"
assert "کلیه" not in p301join and "ﮐﻠﯿﻪ" in p301join, "رشته: کلیهٔ رشته‌ها (فرم‌های ارائه)"

# ————— پیمانِ کلیدِ رسمی (ص۳۰۶-۳۰۷) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p306)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p307)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p306 + p307 if l.strip()))
assert "01 / 11 / 1399" in keyjoin, "تاریخِ کلید = تاریخِ برگه (سالِ کامل)"
KEY_FRAGS = ["1. ( a )", "2. ( b )", "3. ( d )",
             "4. False (B)", "5. True (A)", "6. False (B)", "7. False (B)",
             "8. generated", "9. opposite", "10. clean", "11. remind",
             "12. worst", "13. choose", "14. terrible", "15. right", "16. teenagers", "17. enjoy",
             "18. He would go to the park.", "19. They can play one of their thinking games.",
             "20. (b)", "21.(e)", "22. (d)", "23. (c)",
             "24. dedicated", "25. recommend", "26. replaced",
             "27. (c)", "28. (d)", "29. (a)",
             "30. symbol", "31. worm",
             "32. (b)", "33. (c)", "34. (a)", "35. (b)",
             "36. had studied", "37. is spoken",
             "38. Mina was upset because she had gotten a bad score.",
             "39. John could fix the car if he were at home.",
             "40. (a) True", "41. (b) False", "42. ( a )", "43. ( d )",
             "44. Quickly before they jump into to the next lesson.",
             "45. They must have a native language dictionary.",
             "46. (b) False", "47. (a) True", "48. ( c )", "49. ( d )",
             "50. world", "51. creating",
             "52. but", "53. so", "54. and", "55. or",
             "(c) There are several reasons why Canada is one of the best countries in the world.",
             "(f) First, Canada has an excellent health care system.",
             "(a) Therefore, many patients are easily cured in hospitals in Canada.",
             "(b) Second, it has a high standard of education for young people.",
             "(d) In addition, there are many chances for them to get a good job.",
             "(e) As a result, many people like to live in Canada."]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# سطرِ کلیدِ مرتب‌سازی: شماره در سطرِ جدا (کوئیرکِ چاپ) — فرگمنت‌های شماره‌دار
for nf in ["56", "57", "58", "59", "60", "61"]:
    assert re.search(rf"\b{nf} \(?\(", keyjoin) or f"{nf}\n(" in "\n".join(p307), nf

# ————— س۳: کلوژِ شنیداریِ چاپِ توربینِ بادی (ص۳۰۱) → بانک l43 (چهارگزینه‌ای) —————
wt = norm_stem(gapify(join_inclusive(p301, "Emad: Daddy", "buildings.")))
for frag in ["How might it be ------- (8) ------- from wind?",
             "a wind turbine works the ------- (9) ------- of a fan",
             "It is a type of ------- (10) ------- energy.",
             "These wind turbines ------- (11) ------- me of what I read about",
             "using wind power in Yazd’s buildings."]:
    assert frag in wt, frag
UNI43 = ["generated", "opposite", "clean", "remind"]  # استخرِ کلیدِ رسمی
Q_L43 = [
    q("g12-l43-1", 1, "vocab", f"{wt} — پاسخِ خانهٔ (8): -------",
      ["opposite", "generated", "clean", "remind"], 1),
    q("g12-l43-2", 2, "vocab", f"{wt} — پاسخِ خانهٔ (9): -------",
      ["clean", "remind", "opposite", "generated"], 2),
    q("g12-l43-3", 3, "vocab", f"{wt} — پاسخِ خانهٔ (10): -------",
      ["remind", "generated", "opposite", "clean"], 3),
    q("g12-l43-4", 4, "vocab", f"{wt} — پاسخِ خانهٔ (11): -------",
      ["generated", "clean", "remind", "opposite"], 2),
]
# کلیدهای چاپی [generated, opposite, clean, remind] با چرخشِ تازهٔ [1,2,3,2] — بدونِ تکرارِ مجاور
assert [it["options"][it["answer"]] for it in Q_L43] == UNI43
assert [it["answer"] for it in Q_L43] == [1, 2, 3, 2]
ans43 = [it["answer"] for it in Q_L43]
for i in range(1, len(ans43)):
    assert ans43[i] != ans43[i - 1], f"adjacent key run at {i}"
assert len({tuple(it["options"]) for it in Q_L43}) == 4, "چرخش‌های تکراری"

# ————— س۴: کلوژِ شنیداریِ چاپِ برنامه‌های تلویزیونی (ص۳۰۱) → بانک l44 (شش‌گزینه‌ای) —————
tv = norm_stem(gapify(join_inclusive(p301, "A: The programs on TV", "nothing for older people")))
for frag in ["are the ------- (12) ------- .",
             "channels to ------- (13) ------- from",
             "everything is ------- (14) ------- .",
             "You're ------- (15) ------- about that!",
             "written for ------- (16) ------- .",
             "nothing for older people to ------- (17) ------- ."]:
    assert frag in tv, frag
UNI44 = ["worst", "choose", "terrible", "right", "teenagers", "enjoy"]  # استخرِ کلیدِ رسمی
Q_L44 = [
    q("g12-l44-1", 1, "vocab", f"{tv} — پاسخِ خانهٔ (12): -------",
      ["worst", "choose", "terrible", "right", "teenagers", "enjoy"], 0),
    q("g12-l44-2", 2, "vocab", f"{tv} — پاسخِ خانهٔ (13): -------",
      ["terrible", "right", "choose", "worst", "enjoy", "teenagers"], 2),
    q("g12-l44-3", 3, "vocab", f"{tv} — پاسخِ خانهٔ (14): -------",
      ["enjoy", "worst", "right", "choose", "terrible", "teenagers"], 4),
    q("g12-l44-4", 4, "vocab", f"{tv} — پاسخِ خانهٔ (15): -------",
      ["right", "enjoy", "worst", "teenagers", "choose", "terrible"], 0),
    q("g12-l44-5", 5, "vocab", f"{tv} — پاسخِ خانهٔ (16): -------",
      ["choose", "enjoy", "terrible", "teenagers", "worst", "right"], 3),
    q("g12-l44-6", 6, "vocab", f"{tv} — پاسخِ خانهٔ (17): -------",
      ["worst", "right", "choose", "terrible", "teenagers", "enjoy"], 5),
]
# کلیدهای چاپی [worst, choose, terrible, right, teenagers, enjoy] با چرخشِ تازهٔ [0,2,4,0,3,5]
assert [it["options"][it["answer"]] for it in Q_L44] == UNI44
assert [it["answer"] for it in Q_L44] == [0, 2, 4, 0, 3, 5]
ans44 = [it["answer"] for it in Q_L44]
for i in range(1, len(ans44)):
    assert ans44[i] != ans44[i - 1], f"adjacent key run at {i}"
assert len({tuple(it["options"]) for it in Q_L44}) == 6, "چرخش‌های تکراری"

# ————— س۷: بانکِ واژگان (ص۳۰۲) → بانک l45 —————
S24 = norm_stem(line_after_dot(p302, "24. A: Mrs. Ahmadi") + " " +
                next(l.strip() for l in p302 if l.strip().startswith("B: I know!")))
S25 = norm_stem(line_after_dot(p302, "25. A: What kind of dictionary"))
S26 = norm_stem(line_after_dot(p302, "26. Her sister carefully"))
assert S24 == "A: Mrs. Ahmadi is very friendly and helpful. B: I know! She is known as a ------- teacher, too.", S24
assert S25 == "A: What kind of dictionary do you-------? B: A learner’s dictionary.", S25
assert S26 == "Her sister carefully -------the china plate on the shelf.", S26
assert "dedicated, replaced, forgive, recommend" in full
POOL45 = ["dedicated", "replaced", "forgive", "recommend"]  # ترتیبِ چاپ
Q24_26 = [
    q("g12-l45-1", 1, "vocab", S24, POOL45, 0),
    q("g12-l45-2", 2, "vocab", S25, POOL45, 3),
    q("g12-l45-3", 3, "vocab", S26, POOL45, 1),
]
assert [it["options"][it["answer"]] for it in Q24_26] == ["dedicated", "recommend", "replaced"]
for it in Q24_26:
    assert it["options"][it["answer"]] != "forgive", it["id"]

# ————— س۸: تعریف‌یابی A/B (ص۳۰۲) → بانک l45 —————
S27 = "Students should appreciate their teachers for their help and kindness."
S28 = "Plants absorb carbon dioxide."
S29 = "Demand for organic food is increasing."
assert S27 in full and S28 in full and S29 in full
DEFS45 = ["the amount of a product or service that people want",   # a
          "the part at the beginning of a book that gives a general idea of what it is about",  # b — اضافیِ چاپی
          "be grateful for",                                        # c
          "take something in, especially gradually"]                # d
for df in DEFS45:
    assert df in full, df
Q27_29 = [
    q("g12-l45-4", 4, "vocab", f"«{S27}» — تعریفِ ستون B برای واژهٔ «appreciate»: -------", DEFS45, 2),
    q("g12-l45-5", 5, "vocab", f"«{S28}» — تعریفِ ستون B برای واژهٔ «absorb»: -------", DEFS45, 3),
    q("g12-l45-6", 6, "vocab", f"«{S29}» — تعریفِ ستون B برای واژهٔ «Demand»: -------", DEFS45, 0),
]
assert [it["options"][it["answer"]] for it in Q27_29] == [DEFS45[2], DEFS45[3], DEFS45[0]]
for it in Q27_29:
    assert it["options"][it["answer"]] != DEFS45[1], it["id"]

# ————— س۹: حرفِ اولِ باز (ص۳۰۲) → بانک l45 — گزینه‌های هم‌شکلِ مهندسی‌شده —————
S30 = norm_stem(line_after_dot(p302, "30. I think O is the"))
i31 = next(i for i, l in enumerate(p302) if "31. I always try to wake up" in l)
S31 = norm_stem(p302[i31].strip().split(".", 1)[1].strip() + " " + p302[i31 + 1].strip())
assert S30 == "I think O is the s - - - - - for Oxygen. I am not sure!", S30
assert S31 == "I always try to wake up and start work early because I know that “the early bird catches the w- - -.”", S31
Q30 = q("g12-l45-7", 7, "vocab", S30, ["symbol", "system", "simply", "single"], 0)
Q31 = q("g12-l45-8", 8, "vocab", S31, ["worm", "warm", "wind", "wave"], 0)
for o in Q30["options"]:
    assert re.fullmatch(r"s[a-z]{5}", o), o
for o in Q31["options"]:
    assert re.fullmatch(r"w[a-z]{3}", o), o

Q_L45 = Q24_26 + Q27_29 + [Q30, Q31]

# ————— س۱۰: گرامر MCQ (ص۳۰۳) → بانک l46 —————
G32 = norm_stem(line_after_dot(p303, "32. Your sister has passed"))
i33 = next(i for i, l in enumerate(p303) if "33. A: Are you writing" in l)
G33 = norm_stem(p303[i33].strip().split(".", 1)[1].strip() + " " +
                next(l.strip() for l in p303 if l.strip().startswith("B: No, My brother")))
G34 = norm_stem(line_after_dot(p303, "34. The traffic rules"))
G35 = norm_stem(line_after_dot(p303, "35. My parents"))
assert G32 == "Your sister has passed the exam, -------?", G32
assert G33 == "A: Are you writing the letter to your father? B: No, My brother is writing the letter ------- I will send to my father tomorrow.", G33
assert G34 == "The traffic rules ------- very carefully by everyone.", G34
assert G35 == "My parents-------healthier if they lived in a village.", G35
for o in ["didn’t she", "hasn’t she", "didn’t you", "has she",
          "where", "who", "which", "whom",
          "must be obeyed", "should obey", "are obeying", "has been obeyed",
          "can be", "would be", "are", "must be"]:
    assert o in full, o
Q_L46 = [
    q("g12-l46-1", 1, "grammar", G32, ["didn’t she", "hasn’t she", "didn’t you", "has she"], 1),
    q("g12-l46-2", 2, "grammar", G33, ["where", "who", "which", "whom"], 2),
    q("g12-l46-3", 3, "grammar", G34, ["must be obeyed", "should obey", "are obeying", "has been obeyed"], 0),
    q("g12-l46-4", 4, "grammar", G35, ["can be", "would be", "are", "must be"], 1),
]
# کلیدهای چاپی [b,c,a,b] — ترتیبِ چاپ حفظ شد
assert [it["answer"] for it in Q_L46] == [1, 2, 0, 1]
assert [it["options"][it["answer"]] for it in Q_L46] == ["hasn’t she", "which", "must be obeyed", "would be"]

# ————— س۱۳: خوانداریِ فرهنگِ لغت (ص۳۰۳) → بانک l47 —————
dictread = norm_stem(join_inclusive(p303, "For English teachers, a dictionary is essential",
                                    "figure it out."))
for frag in ["A dictionary is the basic thing for any language class.",
             "at least three dictionaries available",
             "bilingual dictionary that covers words in the native language",
             "monolingual dictionary that gives word information in English",
             "they should clear up the confusion quickly",
             "they can use this dictionary to figure it out."]:
    assert frag in dictread, frag
T40 = norm_stem(line_after_dot(p303, "40. A dictionary is the basic thing").split("a) True")[0].strip())
T41 = norm_stem(line_after_dot(p303, "41. Students must have more than four").split("a) True")[0].strip())
M42 = norm_stem(line_after_dot(p304, "42. What is the main idea"))
M43 = norm_stem(line_after_dot(p304, "43. What does the underlined word"))
assert T40 == "A dictionary is the basic thing for any language class.", T40
assert T41 == "Students must have more than four dictionaries to learn English", T41
assert M42 == "What is the main idea of the text?", M42
assert M43 == "What does the underlined word “they” in paragraph 2 refer to?", M43
Q_L47 = [
    q("g12-l47-1", 1, "grammar", f"{dictread} — {T40}", ["True", "False"], 0),
    q("g12-l47-2", 2, "grammar", f"{dictread} — {T41}", ["True", "False"], 1),
    q("g12-l47-3", 3, "grammar", f"{dictread} — {M42}",
      ["Dictionaries are essential for language learning.",
       "Bilingual dictionaries are the most important types of dictionaries.",
       "All of the students cannot figure out what they read.",
       "Monolingual dictionaries are the most expensive dictionaries."], 0),
    q("g12-l47-4", 4, "grammar", f"{dictread} — {M43}",
      ["problems", "teachers", "dictionaries", "students"], 3),
]
# کلیدهای چاپی [a,b,a,d] — «42. ( a )» و «43. ( d )» با پرانتزهای فاصله‌دار (هفتم/هشتمین بار)
assert [it["answer"] for it in Q_L47] == [0, 1, 0, 3]

# ————— س۱۴: خوانداریِ پیکاسو (ص۳۰۴) → بانک l48 —————
picasso = norm_stem(join_inclusive(p304, "Pablo Picasso was a distinguished artist.",
                                   "He died on April 8, 1973."))
for frag in ["He was born in Spain on October 25, 1881.",
             "his family move to Barcelona",  # عینِ چاپ: move بدونِ d
             "finished it in one day",
             "the old Teachings of",  # T بزرگِ چاپ
             "he created his famous Blue period works",
             "the first artist to be famous during his own lifetime",
             "He died on April 8, 1973."]:
    assert frag in picasso, frag
T46 = norm_stem(line_after_dot(p304, "46. Picasso was a famous French"))
T47 = norm_stem(line_after_dot(p304, "47. Picasso was also very skillful").split("a)True")[0].strip())
M48 = norm_stem(line_after_dot(p304, "48. The underlined word"))
M49 = norm_stem(line_after_dot(p304, "49. It took"))
assert T46 == "Picasso was a famous French artist during the 18th century.", T46
assert T47 == "Picasso was also very skillful in painting when he was young.", T47
assert M48 == "The underlined word “He” in the second line refers to------- .", M48
assert M49 == "It took -------for Picasso to finish his exam to attend the Art school in Barcelona.", M49
Q_L48 = [
    q("g12-l48-1", 1, "grammar", f"{picasso} — {T46}", ["True", "False"], 1),
    q("g12-l48-2", 2, "grammar", f"{picasso} — {T47}", ["True", "False"], 0),
    q("g12-l48-3", 3, "grammar", f"{picasso} — {M48}",
      ["Picasso", "his son", "Picasso’s father", "the teacher"], 2),
    q("g12-l48-4", 4, "grammar", f"{picasso} — {M49}",
      ["a few years", "more than a day", "only one month", "one day"], 3),
]
# کلیدهای چاپی [b,a,c,d] — «48. ( c )» و «49. ( d )» با پرانتزهای فاصله‌دار
assert [it["answer"] for it in Q_L48] == [1, 0, 2, 3]

# ————— س۱۵: حروفِ ربط (ص۳۰۵) → بانک l49 —————
C52 = norm_stem(line_after_dot(p305, "52. Sepideh likes spaghetti"))
C53 = norm_stem(line_after_dot(p305, "53. These shoes are not comfortable"))
C54 = norm_stem(line_after_dot(p305, "54. He went to the restaurant"))
C55 = norm_stem(line_after_dot(p305, "55. We can go by bus"))
assert C52 == "Sepideh likes spaghetti,------- her grandmother hates spaghetti.", C52
assert C53 == "These shoes are not comfortable , ------- I will not buy them.", C53
assert C54 == "He went to the restaurant ------- ordered food.", C54
assert C55 == "We can go by bus, ------- we can take a taxi.", C55
Q_L49 = [
    q("g12-l49-1", 1, "grammar", C52, ["but", "and", "so", "or"], 0),
    q("g12-l49-2", 2, "grammar", C53, ["but", "and", "so", "or"], 2),
    q("g12-l49-3", 3, "grammar", C54, ["but", "and", "so", "or"], 1),
    q("g12-l49-4", 4, "grammar", C55, ["but", "and", "so", "or"], 3),
]
# کلیدهای چاپی [but, so, and, or] — ترتیبِ چاپِ دستور (but, and, so, or) حفظ شد
assert [it["answer"] for it in Q_L49] == [0, 2, 1, 3]
assert [it["options"][it["answer"]] for it in Q_L49] == ["but", "so", "and", "or"]

# ————— س۱۶: مرتب‌سازیِ پاراگرافِ کانادا (ص۳۰۵) → بانک l50 (شش‌گزینه‌ای) —————
SENT_A = "therefore, many patients are easily cured in hospitals in Canada"
SENT_B = "second, it has a high standard of education for young people"
SENT_C = "there are several reasons why Canada is one of the best countries in the world"
SENT_D = "in addition there are many chances for them to get a good job"
SENT_E = "as a result, many people like to live in Canada"
SENT_F = "first, Canada has an excellent health care system"
for s in (SENT_A, SENT_B, SENT_C, SENT_D, SENT_E, SENT_F):
    assert s in full, s
CAN = [SENT_A, SENT_B, SENT_C, SENT_D, SENT_E, SENT_F]  # ترتیبِ چاپِ a-f
# کلیدهای چاپی: 56.(c) 57.(f) 58.(a) 59.(b) 60.(d) 61.(e) — سطرهای شماره‌جدا
Q_L50 = [
    q("g12-l50-1", 1, "grammar", "مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۶ (جملهٔ آغازینِ پاراگراف): -------", CAN, 2),
    q("g12-l50-2", 2, "grammar", "مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۷ در پاراگراف: -------", CAN, 5),
    q("g12-l50-3", 3, "grammar", "مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۸ در پاراگراف: -------", CAN, 0),
    q("g12-l50-4", 4, "grammar", "مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۹ در پاراگراف: -------", CAN, 1),
    q("g12-l50-5", 5, "grammar", "مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۶۰ در پاراگراف: -------", CAN, 3),
    q("g12-l50-6", 6, "grammar", "مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۶۱ (پایان‌بندیِ پاراگراف): -------", CAN, 4),
]
assert [it["options"][it["answer"]] for it in Q_L50] == [SENT_C, SENT_F, SENT_A, SENT_B, SENT_D, SENT_E]
assert [it["answer"] for it in Q_L50] == [2, 5, 0, 1, 3, 4]
for it in Q_L50:
    assert len(it["options"]) == 6 and len(set(it["options"])) == 6, it["id"]

# ————— درج در سند —————
B43 = {"lesson": 43, "title": "نهایی دی ۱۳۹۹ — کلوژِ شنیداریِ توربینِ بادی (س۳، ص۳۰۱)", "level": "چهارگزینه‌ای",
       "count": len(Q_L43), "questions": Q_L43}
B44 = {"lesson": 44, "title": "نهایی دی ۱۳۹۹ — متنِ شنیداریِ چاپ (س۴، ص۳۰۱)", "level": "شش‌گزینه‌ای",
       "count": len(Q_L44), "questions": Q_L44}
B45 = {"lesson": 45, "title": "نهایی دی ۱۳۹۹ — واژگان و تعریف و حرفِ اول (س۷-س۹، ص۳۰۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L45), "questions": Q_L45}
B46 = {"lesson": 46, "title": "نهایی دی ۱۳۹۹ — گرامر (س۱۰، ص۳۰۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L46), "questions": Q_L46}
B47 = {"lesson": 47, "title": "نهایی دی ۱۳۹۹ — خوانداریِ فرهنگِ لغت (س۱۳، ص۳۰۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L47), "questions": Q_L47}
B48 = {"lesson": 48, "title": "نهایی دی ۱۳۹۹ — خوانداریِ پیکاسو (س۱۴، ص۳۰۴)", "level": "چهارگزینه‌ای",
       "count": len(Q_L48), "questions": Q_L48}
B49 = {"lesson": 49, "title": "نهایی دی ۱۳۹۹ — حروفِ ربط (س۱۵، ص۳۰۵)", "level": "چهارگزینه‌ای",
       "count": len(Q_L49), "questions": Q_L49}
B50 = {"lesson": 50, "title": "نهایی دی ۱۳۹۹ — مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵)", "level": "شش‌گزینه‌ای",
       "count": len(Q_L50), "questions": Q_L50}
# ————— نشت‌سنج: محتوای مستثنی‌شده نباید در بانک‌های این راند باشد —————
# (دامنه‌راندی — درسِ r384/r385: برخوردهای بین‌برگه‌ایِ مشروع بیرونِ دامنه می‌مانند؛
#  «jump into to the next lesson» و «native language dictionary» در متنِ چاپیِ خوانداریِ l47
#  هم هست — مانندِ r385-ردیف۴۳ از نشت‌سنج شمول ندارد)
LEAKS = ["Who are our elders",                        # س۱ (شنیداری)
         "get in the plane on time",                  # س۲ (شنیداری)
         "forgetful person",                          # س۲ (شنیداری)
         "Where would he go if it were sunny",        # س۵ (شنیداریِ تولیدی)
         "He would go to the park",                   # س۵ کلیدِ مدل
         "thinking games",                            # س۵ کلیدِ مدل
         "mother’s lap",                              # س۶ اضافیِ چاپی (تصویری)
         "Hamid sits on the sofa",                    # س۶ تصویری (در r383 هم اضافیِ چاپی بود)
         "I have kept a diary",                       # س۶ تصویری (کلیدِ ۲۱ — در r385 اضافیِ چاپی بود)
         "avoid foods that contain",                  # س۶ تصویری
         "before he moved to china",                  # س۱۱ (تایپی — china کوچکِ چاپ)
         "Tajikistan",                                # س۱۱ (تایپی)
         "Mina was upset",                            # س۱۲ پاسخِ مدل (دوقلویِ r384-Roya)
         "John could fix the car",                    # س۱۲ پاسخِ مدل (عینِ r384)
         "When should teachers clear up",             # ردیفِ ۴۴ (تایپی)
         "Picasso is famous for",                     # ردیفِ ۵۱ (تایپی)
         "Artists from everywhere in the",            # ردیفِ ۵۰ (تایپی)
         "The number of the planets",                 # س۱۷ چیپ
         "order of distance from the Sun",            # س۱۷ چیپ
         "largest and smallest planets"]              # س۱۷ چیپ
blob = json.dumps([B43, B44, B45, B46, B47, B48, B49, B50], ensure_ascii=False)
for s in LEAKS:
    assert s not in blob, f"leak: {s}"

for b in (B43, B44, B45, B46, B47, B48, B49, B50):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie7"] = {
    "extractedRound": "r386",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ هفتم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ دی ۱۳۹۹ (کلیهٔ رشته‌ها)",
    "examPages": "pdf-p301-305 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p306-307 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p300→p301 (پایانِ کلیدِ ناشنوایان) و p307→p308 (آغازِ خرداد ۱۴۰۰ ریاضی-تجربیِ r385)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: کلیهٔ رشته‌ها — نوبت دی ماه سال ۱۳۹۹ (تاریخِ چاپی: ۰۱/۱۱/۹۹) — مدت ۱۲۰ دقیقه — ساعت شروع ۱۰ صبح — ۱۷ سکشن/۶۲ ردیف/بارم ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — «Good luck / جمع نمره ۴٠»",
    "keyPages": "pdf-p306-307 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۶۱ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۴۰ کلید از ۴۰ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «1. ( a ) 2. ( b ) 3. ( d )» (سه پرانتزِ فاصله‌دارِ پیاپی) / «4. False (B) 5. True (A) 6. False (B) 7. False (B)» / «8. generated 9. opposite 10. clean 11. remind» / «12. worst 13. choose 14. terrible 15. right 16. teenagers 17. enjoy» / «18. He would go to the park. 19. They can play one of their thinking games.» / «20. (b) 21.(e) 22. (d) 23. (c)» / «24. dedicated 25. recommend 26. replaced» / «27. (c) 28. (d) 29. (a)» / «30. symbol 31. worm» / «32. (b) 33. (c) 34. (a) 35. (b)» / «36. had studied 37. is spoken» / «38. Mina was upset because she had gotten a bad score. 39. John could fix the car if he were at home.» / «40. (a) True 41. (b) False 42. ( a ) 43. ( d )» / «44. Quickly before they jump into to the next lesson. 45. They must have a native language dictionary.» / «46. (b) False 47. (a) True 48. ( c ) 49. ( d )» / «50. world 51. creating» / «52. but 53. so 54. and 55. or» / «56 (c)…57 (f)…58 (a)…59 (b)…60 (d)…61 (e)» — هفتمین تکرارِ درسِ r380-ق۳۲ در بلوکِ ۳۸/۳۹ (Mina≈Royaِ r384؛ John عینِ r384)",
    "sectionsTotal": 62,
    "sectionsExtracted": 40,
    "sectionsSkipped": 22,
    "items": 40,
    "bankCounts": [4, 6, 8, 4, 4, 4, 4, 6],
    "keyPolicy": "همهٔ کلیدهای ۴۰ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ کلوژهای شنیداریِ l43/l44 از استخرِ خودِ کلیدِ رسمی (generated/opposite/clean/remind و worst/choose/terrible/right/teenagers/enjoy) با چرخش‌های تازهٔ [1,2,3,2] و [0,2,4,0,3,5] (بدونِ تکرارِ مجاور، دنبالکنندهٔ r380-l4/r381-l8-l9/r382-l16/r383-l22)؛ بانکِ واژگانِ l45-ق۱-۳ به ترتیبِ چاپِ خودِ برگه (dedicated, replaced, forgive, recommend) با اضافیِ چاپیِ هرگز-کلید (forgive)؛ تعریف‌یابیِ l45-ق۴-۶ به ترتیبِ چاپِ ستون B با اضافیِ «the part at the beginning of a book...» هرگز-کلید؛ حرفِ اولِ l45-ق۷-۸ با چهارِ هم‌شکلِ مهندسی‌شده (s+++++/w+++)؛ گرامرِ l46 و حروفِ ربطِ l49 به ترتیبِ چاپ؛ کلیدهای درست/غلطِ l47/l48 سمانتیک‌اند (چاپ: True/False/False/True و False/True)؛ بانکِ مرتب‌سازیِ l50 گزینه‌هایش را به ترتیبِ چاپِ a-f می‌چیند با کلیدهای چاپی [c,f,a,b,d,e] در اندیس‌های [2,5,0,1,3,4]",
    "engineNote": "هر ۴۰ آیتم MCQ (قراردادِ کارتِ g12)؛ کلوژهای شنیداریِ چاپِ l43/l44 با خانه‌های «------- (N) -------» و دنبالهٔ «پاسخِ خانهٔ (N)» (الگویِ r381-l9/r383-l22) — خانه‌های چاپِ این برگه بدونِ پرانتزند («……8…..») و gapify به الگویِ استاندارد تبدیل کرد؛ ساقه‌های خوانداریِ l47/l48 متنِ کاملِ چاپی را در خود دارند؛ ساقه‌های تعریف‌یابی دوبخشیِ فارسی (الگویِ r380-l5)؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» چسبیده؛ l50 سومین بانکِ شش‌گزینه‌ایِ مرتب‌سازیِ مخزن (الگویِ l35-r384/l42-r385)",
    "derivedKeys": {
        "S3": ["generated", "opposite", "clean", "remind"],
        "S4": ["worst", "choose", "terrible", "right", "teenagers", "enjoy"],
        "S7": ["dedicated", "recommend", "replaced"],
        "S8": ["be grateful for", "take something in, especially gradually", "the amount of a product or service that people want"],
        "S9": ["symbol", "worm"],
        "S10": ["hasn’t she", "which", "must be obeyed", "would be"],
        "S13": ["True", "False", "Dictionaries are essential for language learning.", "students"],
        "S14": ["False", "True", "Picasso’s father", "one day"],
        "S15": ["but", "so", "and", "or"],
        "S16": ["there are several reasons why Canada is one of the best countries in the world", "first, Canada has an excellent health care system", "therefore, many patients are easily cured in hospitals in Canada", "second, it has a high standard of education for young people", "in addition there are many chances for them to get a good job", "as a result, many people like to live in Canada"],
    },
    "paperMap": "نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — کشفِ r384، تأییدِ دوباره در این راند: دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ (پیش از presentation-forms)؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸)؛ شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸)؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹)؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹)؛ برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ (۱۳/۰۶/۹۹)؛ شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ (۱۳/۰۶/۹۹)؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ (۰۱/۱۱/۹۹) ← این راند؛ خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۷ برگه استخراج شد، ۱۰ برگه باقی است",
    "skippedSections": [
        "س۱ (ردیف ۱-۳، شنیداریِ MCQ): پرسشِ چاپیِ «Who are our elders?» با چهار گزینهٔ چاپی — صوتی-کلید؛ کلیدهای چاپی: 1.( a )/2.( b )/3.( d ) — سه پرانتزِ فاصله‌دارِ پیاپی — در رسید حفظ شد",
        "س۲ (ردیف ۴-۷، شنیداریِ True/False): پرواز/گذرنامه (He could get in the plane on time / He had left his passport at home) — صوتی-کلید؛ کلیدهای چاپی: 4.False (B)/5.True (A)/6.False (B)/7.False (B)",
        "س۵ (ردیف ۱۸-۱۹، شنیداریِ تولیدی): «Where would he go if it were sunny?» — کلیدهای مدلِ چاپی: 18. He would go to the park. / 19. They can play one of their thinking games. — صوتی-کلید",
        "س۶ (ردیف ۲۰-۲۳، تصویری): «با توجه به تصاویر... یک جمله اضافی است» — پنج جملهٔ چاپی a-e: a) My little sister sits on my mother’s lap all the time. (اضافیِ چاپی) / b) Hamid sits on the sofa and watches TV all the time. → 20 / c) Try to avoid foods that contain a lot of fat. → 23 / d) Oil, coal and natural gas are three common fossil fuels. → 22 (عینِ ساقهٔ r385-l36-1 — برخوردِ بین‌برگه‌ایِ مشروع) / e) I have kept a diary for twelve years. → 21 (در r385 اضافیِ چاپی بود و اینجا کلید است — چرخشِ بین‌برگه‌ای)؛ استخراج نیازمندِ تصویر",
        "س۱۰ (ردیف ۳۶-۳۷، شکلِ فعلِ باز): «Joe ………..Chinese before he moved to china. (study)» → had studied و «Persian ………………in Iran, Tajikistan and Afghanistan. (speak)» → is spoken — بدونِ گزینهٔ چاپی؛ کاندیدِ بانکِ تایپی",
        "س۱۱ (ردیف ۳۸-۳۹، جمله‌سازیِ درهم): 38. had gotten/ was/ a bad score/ she/ Mina/ upset/ because → «Mina was upset because she had gotten a bad score.» (دوقلویِ r384-«Roya» با نامِ متفاوت — ردیفِ تازه شمرده شد) و 39. fix / the car /if / were / John/ at home/ could / he → «John could fix the car if he were at home.» (عینِ r384 — ردیفِ تازه شمرده نشد) — هفتمین تکرارِ درسِ r380-ق۳۲",
        "ردیف ۴۴-۴۵ (پاسخِ مدلِ خوانداریِ فرهنگِ لغت): «44. Quickly before they jump into to the next lesson.» (jump into to — عینِ چاپ) و «45. They must have a native language dictionary.» — کاندیدِ تایپی (هر دو عبارت در متنِ چاپیِ l47 هم هست — از نشت‌سنج شمول ندارد)",
        "ردیف ۵۰-۵۱ (تکمیلِ جملهٔ پیکاسو): «50. world» و «51. creating» — کلیدهای تک‌واژه‌ایِ چاپی؛ کاندیدِ تایپی (ساقه‌ها: «Artists from everywhere in the …... came to Paris to see Picasso’ first paining in modern Art.» و «Picasso is famous for …... the Cubism Style.»)",
        "س۱۷ (ردیف ۶۲، نگارشِ تولیدی): پاراگرافِ Solar system با چیپ‌های چاپی (The number of the planets / The order of distance from the Sun / The center of the solar system: The sun / The largest and smallest planets) — تولیدی با کلیدِ بند-رأیی",
    ],
    "printQuirks": [
        "پنجمین برگهٔ presentation-forms با سربرگِ «ﺳﺆاﻻت  اﻣﺘﺤﺎن» دوفاصله‌ای (الگویِ r383؛ چسبیدگیِ r385 اینجا نیست) — متنِ انگلیسی و کلیدها لاتینِ سالم",
        "خانه‌های کلوژِ شنیداری بدونِ پرانتزِ چاپی («……8…..»/«…10…..») — برخلافِ r381/r383 با «(N)» — gapify به «------- (N) -------» استاندارد تبدیل کرد؛ خانه‌های سه‌نقطه‌ایِ کوتاه («…15….») هم پوشش داده شد",
        "هفت کلیدِ پرانتز-فاصله‌دار: «1. ( a ) 2. ( b ) 3. ( d )» (سه‌تاییِ پیاپی — نو) و «42. ( a )»/«43. ( d )»/«48. ( c )»/«49. ( d )» — هفتم تا دهمین بارِ درسِ r380-ق۳۸",
        "«21.(e)» بدونِ فاصله و «22.  (d)» دوفاصله‌ای در یک سطرِ کلید (س۶)",
        "تاریخِ چاپیِ دو رقمیِ سربرگ «01 / 11 / 99» در برابرِ تاریخِ کلید «01 / 11 / 1399»",
        "نقطه‌چینِ چسبیده: ق۲۵ «do you…………….?» و ق۲۶ «………..the china plate» و ق۳۷ «Persian ………………in» و ق۴۸ «to……………. .» و ق۴۹ «took ………………for» — پس از norm «-------» چسبیده",
        "ق۳۳ «B: No, My brother» — M بزرگِ بعد از ویرگول (عینِ چاپ)؛ ق۳۵ «My parents………………healthier» بدونِ فاصله",
        "ق۴۷ گزینه‌های «a)True/b)False» بدونِ فاصله؛ ق۴۹ «a)  a few years» دوفاصلهٔ بعدِ حرف (الگویِ r385-«a)  success»)",
        "ق۴۵ بدونِ علامتِ سؤالِ چاپی («...a more advanced level») و ق۵۰ «Picasso’ first paining» (آپاستروفِ تنها + paining به‌جای painting) — عینِ چاپ",
        "متنِ پیکاسو: «his family move to Barcelona» (move بدونِ d) و «the old Teachings of Art School» (T بزرگ) و «Picasso' first paining» — عینِ چاپ حفظ شد",
        "کلیدِ مرتب‌سازی با حروفِ بزرگِ آغازین («First,...»/«In addition,»/«Therefore,...») در برابرِ گزینه‌های چاپیِ کوچک («first,...»/«in addition there are») — گزینه‌های چاپ وفادارانه ماندند؛ سطرهای کلیدِ ۵۶-۶۱ شماره در سطرِ جدا",
        "آپاستروفِ مخلوط: «You're» و «That's» مستقیم در شنیداری، «mother’s/learner’s/hasn’t/Yazd’s/Picasso’s» خمیده — عینِ چاپ",
        "پاورقیِ هر پنج صفحه: «Audio file (MP3) / Audio file (PDF) / script (PDF)» + شمارهٔ چاپیِ ۲۰۴-۲۰۸",
    ],
    "futureNote": "بخشِ ۴: ۷ برگه از ۱۷ استخراج شد، ۱۰ برگه باقی است (نزدیک‌ترین‌ها: شهریور ۱۳۹۹ ص۲۸۵-۲۹۲ و جفتِ خرداد ۱۳۹۹ ص۲۵۹-۲۷۶؛ به‌علاوهٔ برگهٔ لایه‌خرابِ ص۲۷۷-۲۸۴ که OCR/رندر می‌خواهد، ناشنوایانِ ص۲۹۳-۳۰۰ و جفتِ ۱۳۹۷/۱۳۹۸ با کلیدِ سربرگِ قدیمی)؛ کاندیدهای تایپیِ این برگه (س۱۱ «had studied»/«is spoken» + ردیفِ ۳۸ «Mina was upset because she had gotten a bad score.» + ردیفِ ۴۴ «Quickly before they jump into to the next lesson.» + ردیفِ ۴۵ «They must have a native language dictionary.» + ردیفِ ۵۰ «world» + ردیفِ ۵۱ «creating») به کاندیدهای r380-r385 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۴۶ ردیف است (۳۹ِ r385 + ۷ ردیفِ تازه؛ ردیفِ ۳۹/John عینِ r384 است و ردیفِ تازه شمرده نشد)",
}
d["source"]["g12nahaie7"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r386 OK — banks={len(d['lessons'])} items={total} (+40 in 8 banks: l43=4 l44=6 l45=8 l46=4 l47=4 l48=4 l49=4 l50=6) — نهایی دی ۱۳۹۹ با کلیدِ رسمی")
