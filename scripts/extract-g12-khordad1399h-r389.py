#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r389 — برگهٔ یازدهمِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۳۹۹
انسانی-معارف (تاریخِ چاپی ۰۷/۰۴/۹۹؛ pdf-p268-274 آزمون + کلیدِ رسمیِ «راهنمای تصحيح» pdf-p275-276)
→ tests-g12.json با ۱۲ بانکِ تازه (l72=1؛ l73=3؛ l74=2؛ l75=3؛ l76=3؛ l77=5؛ l78=4؛ l79=4؛ l80=4؛
l81=4؛ l82=4؛ l83=2) — ۳۹ آیتم — ۷۱ بانکِ قبلی + این = ۸۳ بانک/۶۳۳ آیتم

دوقلویِ نزدیکِ برگهٔ ریاضی-تجربیِ r388 (همان چاپِ خرداد ۱۳۹۹) — درسِ برگهٔ ناشنوایان (r388):
ردیف‌های دوقلویِ بایتی استثنی می‌شوند. کشفِ این راند: دو ردیفِ ضرب‌المثلِ س۱۴-ب
(Out of sight→i و Practice makes perfect→j) دوقلویِ بایتیِ l59-1/l59-2 → فقط ۲ ردیفِ تازه شپ شد.

ساختار آزمون (۱۶ سکشن، ۶۲ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۷ صفحه، شروع ۸ صبح):
  س۱ (۱-۴)    شنیداری (دادزدن): ردیفِ چاپیِ ۱ → l72 (۱ آیتم؛ کلیدِ 1. ( d ))؛ ۲-۴ صوتی-کلید
              (کلید: 2. False ( b)/3. Because she can’t hear well./4. ...an infection / more serious.)
  س۲ (۵-۹)    شنیداری (باتریِ لپ‌تاپ): ردیف‌های چاپیِ ۵-۷ → l73 (کلید: 5. (d)/6. (b)/7. (a)؛
              «d) b & c» چاپی)؛ ۸-۹ صوتی-کلید (کلیدِ ۹ آشفته: She needed/electricity/nough/e/...)
  س۳ (۱۰-۱۴)  شنیداری (ایمیل): ردیف‌های چاپیِ ۱۰-۱۱ → l74 — نخستین بانکِ تایپیِ بخشِ نهایی‌ها
              (kind=typed؛ کلید: 10. responding/11. personal)؛ ۱۲-۱۴ صوتی-کلید
  س۴ (۱۵-۱۸)  تصویری: a) free apps→16 / b) hugging→17 / c) teenagers (اضافیِ چاپی) /
              d) hydropower→15 / e) tides→18 — کلید: 15.( d )/16.( a )/17.( b  )/18.( e ) — مستثنی
  س۵ (۱۹-۲۱)  بانکِ ۴واژه‌ایِ چاپ (introduction, dedicated, alphabetically, conditioner —
              اضافیِ چاپی: introduction) → l75
  س۶ (۲۲-۲۴)  حرفِ اول (f------=forever ۷حرفی؛ c------=contain ۷حرفی؛ l--=lap ۳حرفی) → l76
              با گزینه‌های هم‌شکلِ مهندسی‌شده
  س۷ (۲۵-۲۹)  گرامر MCQ (موصولی/شرطیِ دوم/مجهول/tagِ بک‌تیکی/سuffixِ -ic) → l77 (کلیدهای چاپی
              [a,a,c,d] برای ۲۵-۲۸ و ( d ) برای ۲۹؛ «28. (c)» با بک‌تیک‌های چاپی)
  س۸ (۳۰-۳۴)  شکلِ صحیحِ فعل (increasingly/collect/has been discovered/were invented/were) —
              تولیدیِ تایپی — مستثنی؛ ۵ ردیفِ تازه به مخزنِ تایپی (۶۹ ردیف)
  س۹ (۳۵-۴۰)  خوانداریِ انیشتین (متنِ تازه): ۳۵-۳۸ → l78 (متنِ کامل در ساقه)؛ ۳۹/۴۰ پاسخِ مشتقِ
              خودِ متن — مستثنی (کلیدِ ۳۹ با «in١٢٩١» ارقامِ فارسیِ چسبیده)
  س۱۰ (۴۱-۴۶) خوانداریِ انرژیِ خورشید (متنِ بلندِ سه‌پاراگرافی — هسته با r385-l39/r382-l19 ولی
              ردیف‌ها تازه): ۴۱-۴۴ → l79؛ ۴۵/۴۶ مستثنی (کلیدِ ۴۶ با ارقامِ فارسیِ وارونهٔ «٦٤.» —
              دومین تکرارِ کوئیرکِ r388)
  س۱۱ (۴۷-۵۰) جملهٔ مناسبِ ستون‌ها (ساقه‌ها با حرفِ ربطِ انتهاییِ چاپی!) → l80 (کلید: 47.( c )/
              48.( d )/49.( a  )/50.( b  )؛ بک‌تیکِ «didn`t» در گزینهٔ a)
  س۱۲ (۵۱-۵۴) حروفِ ربطِ پاراگرافِ امین (and/or/but/so) → l81 — دومین رندرِ پاراگرافیِ مخزن
  س۱۳ (۵۵-۵۶) Topic Sentence (Plants/Vitamin D) — تولیدی — مستثنی
  س۱۴ (۵۷-۶۰) انتخابیِ الف/ب: الف تعریف‌یابی (forgive→d/combination→e/effectively→c/demand→b؛
              اضافیِ چاپیِ a «cry suddenly» — اکویِ اضافیِ r387-l58) → l82؛ ب اصطلاحات: دو ردیفِ
              تازه (Too many cooks→h/Birds of a feather→f) → l83؛ دو ردیفِ دوقلویِ بایتیِ l59
              (Out of sight→i/Practice makes perfect→j) مستثنی با کلیدِ چاپیِ حفظ‌شده؛ اضافیِ g
  س۱۵ (۶۱-۶۲) جمله‌سازیِ انتخابیِ a/b — چهار پاسخِ مدلِ چاپی با نمره‌های زیربخش (0/25)(0/75) — مستثنی
  س۱۶ (c/d)   نگارشِ انتخابیِ تصویری (Hassan Omidzadeh/Dictionaries/Forest/Light bulbs + پاراگرافِ
              Firefighters با چیپ‌ها) — مستثنی

idempotent: اجرای دوم NO-OP (رسید g12nahaie11).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie11" in d.get("source", {}):
    print("r389-humanities: receipt g12nahaie11 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie10" in d.get("source", {}), "tests-g12.json (r388-math) must exist first"
assert len(d["lessons"]) == 71, f"expected 71 banks before r389, got {len(d['lessons'])}"

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


def qt(id_: str, n: int, category: str, question: str, options: list[str], answer: int, accepted: list[str]):
    return {"id": id_, "n": n, "category": category, "kind": "typed", "question": question,
            "options": options, "answer": int(answer), "accepted": accepted}


p268 = page_slice(268)
p269 = page_slice(269)
p270 = page_slice(270)
p271 = page_slice(271)
p272 = page_slice(272)
p273 = page_slice(273)
p274 = page_slice(274)
p275 = page_slice(275)
p276 = page_slice(276)
full = "\n".join(p268 + p269 + p270 + p271 + p272 + p273 + p274)


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


# ————— پیمانِ سربرگِ آزمون (ص۲۶۸ — presentation-forms؛ دوفاصلهٔ «ﺳﺆاﻻت  اﻣﺘﺤﺎن») —————
assert any("ﺳﺆاﻻت  اﻣﺘﺤﺎن" in l for l in p268), "سربرگِ فرم‌های ارائه با دوفاصله"
assert any("1399" in l for l in p268)
assert any("aee.medu.ir" in l for l in p268)
p268join = re.sub(r"\s+", " ", " ".join(p268))
assert "07 / 04 / 99" in p268join, "تاریخِ ۰۷/۰۴/۹۹"
assert "8 ﺻﺒﺢ" in p268join, "ساعتِ شروعِ ۸ صبح (با فاصلهٔ چاپ — الگویِ r388)"
assert "120دﻗﯿﻘﻪ" in p268join, "مدتِ ۱۲۰ دقیقه"
assert "اﻧﺴﺎﻧﯽ" in p268join and "ﻣﻌﺎرف" in p268join, "رشتهٔ انسانی-معارف"
assert "ﺧﺮداد" in p268join and "ﻧﻮﺑﺖ" in p268join, "نوبتِ خردادماه"

# ————— پیمانِ کلیدِ رسمی (ص۲۷۵-۲۷۶) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p275)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p276)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p275 + p276 if l.strip()))
assert "07 / 04 / 1399" in keyjoin, "تاریخِ کلید = تاریخِ برگه (سالِ کامل)"
KEY_FRAGS = ["1. ( d )", "2. False ( b)", "3. Because she can’t hear well.",
             "4. It might be something as simple as an infection / more serious.",
             "5. (d)", "6. (b)", "7. (a)",
             "10. responding", "11. personal",
             "12. Yes, it does. It takes him a lot of time to answer the emails.",
             "13. He deletes them.", "14. He takes an organized approach with work emails.",
             "15. ( d )", "16. ( a )", "17. ( b )", "18. ( e )",
             "19. dedicated", "20. conditioner", "21. alphabetically",
             "22. forever", "23. contain", "24. lap",
             "25. ( a )", "26. (b)", "27. (a )", "28. (c)", "29. ( d )",
             "30. increasingly", "31. collect", "32. has been discovered",
             "33. were invented", "34. were",
             "35. (b)", "36. (c)", "37. ( a) True", "38. (b) False",
             "39. The Nobel Prize was awarded to Einstein for physics in١٢٩١.",
             "40. He wrote a letter to President Roosevelt expressing his worry about the atomic bomb.",
             "41. (c)", "42. (b)", "43. (a) True)", "44. (b) False",
             "45. The energy is stored in their roots,/ fruits,/ and leaves.",
             "47. ( c )", "48. ( d )", "49. ( a )", "50. ( b )",
             "51. and", "52. or", "53. but", "54. so",
             "61. (a) The woman who bought that apartment was talking to the neighbors in the yard.",
             "(b) His parents became happy after they had met their son.",
             "62. (a) He could be a good runner if he had more free time to practice.",
             "(b) They must be informed about the result today."]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# کلیدِ ۴۶ با ارقامِ فارسیِ وارونه در لایه («٦٤.») — دومین تکرارِ کوئیرکِ r388 — خطِ مستقل با شکستِ سطرِ energy
kv_line = next(l for l in p276 if l.strip().startswith("٦٤."))
assert kv_line.strip().startswith("٦٤. Three forms of renewable energy are: solar energy, water energy and wind"), kv_line
assert any(l.strip() == "energy" for l in p276), "ادامهٔ کلیدِ ۴۶ در سطرِ بعدی"
assert "46." not in keyjoin, "کلیدِ ۴۶ باید با ارقامِ فارسی بماند (بدونِ «46.» لاتین)"
# کلیدِ ۹ آشفته است (ران‌های جدا — الگویِ کلیدِ ۱۰ِ r388)
for frag in ["movie", "to finish watching", "electricity", "nough", "e", "She needed"]:
    assert any(l.strip() == frag for l in p275), f"فرگمنتِ آشفتهٔ کلیدِ ۹: {frag}"
# جدولِ عمودیِ ۵۷-۶۰ (d i / e h / c f / b j) — حروفِ تک‌خطیِ مستقل در ص۲۷۶
for letter in ["d", "i", "e", "h", "c", "f", "b", "j"]:
    assert any(l.strip() == letter for l in p276), f"حرفِ عمودیِ جدولِ ۵۷-۶۰: {letter}"
# «(a) True)» پرانتزِ سرگردانِ کلیدِ ۴۳ — عینِ چاپ در سطرِ خودش
assert any(l.strip() == "43. (a) True)" for l in p276), "پرانتزِ سرگردانِ کلیدِ ۴۳"
# دوفاصله‌های چاپِ درون-پرانتز در کلیدهای ۱۷/۵۰ — عینِ چاپ در لایهٔ خام (keyjoin فشرده‌شان می‌کند)
assert any(l.strip() == "17. ( b  )" for l in p275), "دوفاصلهٔ چاپِ کلیدِ ۱۷"
assert any(l.strip() == "50. ( b  )" for l in p276), "دوفاصلهٔ چاپِ کلیدِ ۵۰"

# ————— س۱: کلوژِ شنیداریِ چاپ — ردیفِ ۱ (ص۲۶۸) → بانک l72 —————
R1 = norm_stem(line_after_dot(p268, "1. A: Why is the man shouting"))
assert R1 == "A: Why is the man shouting? B: Because ------- .", R1
for o in ["he is very angry", "he is far from the woman", "she can’t hear at all", "she can’t hear clearly"]:
    assert o in full, o
Q_L72 = [q("g12-l72-1", 1, "vocab", R1,
           ["he is very angry", "he is far from the woman", "she can’t hear at all", "she can’t hear clearly"], 3)]
# کلیدِ چاپی 1. ( d )
assert Q_L72[0]["options"][Q_L72[0]["answer"]] == "she can’t hear clearly"

# ————— س۲: کلوژِ شنیداریِ چاپ — ردیف‌های ۵-۷ (ص۲۶۸) → بانک l73 —————
R5 = norm_stem(line_after_dot(p268, "5. A: What was the problem with the woman"))
R6 = norm_stem(line_after_dot(p268, "6.  The woman said the battery"))
R7 = norm_stem(line_after_dot(p268, "7. A: What was she looking for"))
assert R5 == "A: What was the problem with the woman’s computer? B: The battery was ------- .", R5
assert R6 == "The woman said the battery of her computer was ------- .", R6
assert R7 == "A: What was she looking for? B: She was looking for a/an------- .", R7  # نقطه‌چینِ چسبیده به a/an
assert "d) b & c" in full, "گزینهٔ چاپیِ «b & c»"
Q_L73 = [
    q("g12-l73-1", 1, "vocab", R5, ["broken", "full", "out of order", "low"], 3),
    q("g12-l73-2", 2, "vocab", R6, ["replaceable", "rechargeable", "convertible", "b & c"], 1),
    q("g12-l73-3", 3, "vocab", R7, ["outlet", "computer", "radio", "TV set"], 0),
]
# کلیدهای چاپی 5.(d)/6.(b)/7.(a)
assert [it["options"][it["answer"]] for it in Q_L73] == ["low", "rechargeable", "outlet"]

# ————— س۳: خانه‌های چاپِ ایمیل (ص۲۶۸) → بانک l74 — نخستین بانکِ تایپیِ نهایی‌ها —————
R10 = norm_stem(line_after_dot(p268, "10. When speaker looks at his inbox"))
R11 = norm_stem(line_after_dot(p268, "11. He has a/an"))
assert R10 == "When speaker looks at his inbox, he gets stuck into reading and ------- to emails.", R10
assert R11 == "He has a/an ------- email account and an account for work.", R11  # a/an با فاصله — برخلافِ R7
assert "When speaker looks" in R10, "«When speaker» بی‌حرف تعریفِ چاپ"
Q_L74 = [
    qt("g12-l74-1", 1, "vocab", R10, ["responding"], 0, ["responding"]),
    qt("g12-l74-2", 2, "vocab", R11, ["personal"], 0, ["personal"]),
]
# کلیدهای چاپی 10. responding / 11. personal
assert [it["accepted"][0] for it in Q_L74] == ["responding", "personal"]
for it in Q_L74:
    assert it["kind"] == "typed" and it["options"] == [it["accepted"][0]], it["id"]

# ————— س۵: بانکِ واژگانِ چاپ (ص۲۶۹) → بانک l75 —————
S19 = norm_stem(line_after_dot(p269, "19. A: Why is he so famous") + " " + next(l.strip() for l in p269 if "university professor" in l))
S20 = norm_stem(line_after_dot(p269, "20. A: How do you keep this room cool") + " " + next(l.strip() for l in p269 if "to keep here cool" in l))
S21 = norm_stem(line_after_dot(p269, "21. A: How should we find a book") + " " + next(l.strip() for l in p269 if "authors’ names" in l))
assert S19 == "A: Why is he so famous? B: Because he is a/an------- university professor.", S19
assert S20 == "A: How do you keep this room cool? B: We use a perfect air ------- to keep here cool.", S20
assert S21 == "A: How should we find a book written by a great poet at this library? B: The books are arranged ------- by authors’ names.", S21
assert "to keep here cool" in S20, "«keep here cool» چاپ (به‌جای it) — وفادارانه"
assert "introduction, dedicated, alphabetically, conditioner" in full
POOL75 = ["introduction", "dedicated", "alphabetically", "conditioner"]  # ترتیبِ چاپ
Q_L75 = [
    q("g12-l75-1", 1, "vocab", S19, POOL75, 1),
    q("g12-l75-2", 2, "vocab", S20, POOL75, 3),
    q("g12-l75-3", 3, "vocab", S21, POOL75, 2),
]
# کلیدهای چاپی dedicated/conditioner/alphabetically — اضافیِ چاپیِ introduction هرگز کلید نیست
assert [it["options"][it["answer"]] for it in Q_L75] == ["dedicated", "conditioner", "alphabetically"]
for it in Q_L75:
    assert it["options"][it["answer"]] != "introduction", it["id"]

# ————— س۶: حرفِ اول (ص۲۶۹) → بانک l76 — گزینه‌های هم‌شکلِ مهندسی‌شده —————
S22 = norm_stem(line_after_dot(p269, "22. You should tell him the truth"))
S23 = norm_stem(line_after_dot(p269, "23. In order to be healthy"))
S24 = norm_stem(line_after_dot(p269, "24. The baby enjoys sitting"))
assert S22 == "You should tell him the truth one day. You can’t keep it a secret f- - - - - -.", S22
assert S23 == "In order to be healthy, try to avoid foods that c - - - - - - a lot of fat.", S23
assert S24 == "The baby enjoys sitting on her mother`s l - - .", S24
Q_L76 = [
    q("g12-l76-1", 1, "vocab", S22, ["forever", "further", "fortune", "failure"], 0),
    q("g12-l76-2", 2, "vocab", S23, ["contain", "collect", "combine", "compare"], 0),
    q("g12-l76-3", 3, "vocab", S24, ["lap", "leg", "lip", "low"], 0),
]
for o in Q_L76[0]["options"]:
    assert re.fullmatch(r"f[a-z]{6}", o), o   # f + ۶ خطِ چاپ → ۷حرفی
for o in Q_L76[1]["options"]:
    assert re.fullmatch(r"c[a-z]{6}", o), o   # c + ۶ خطِ چاپ → ۷حرفی
for o in Q_L76[2]["options"]:
    assert re.fullmatch(r"l[a-z]{2}", o), o   # l + ۲ خطِ چاپ → ۳حرفی
assert [it["options"][it["answer"]] for it in Q_L76] == ["forever", "contain", "lap"]

# ————— س۷: گرامر MCQ (ص۲۶۹-۲۷۰) → بانک l77 —————
G25 = norm_stem(line_after_dot(p269, "25. A: Where is his car") + " " + next(l.strip() for l in p269 if "is parked there belongs" in l))
G26 = norm_stem(line_after_dot(p269, "26. A: Can she get a good mark now") + " " + next(l.strip() for l in p269 if "good score if she" in l))
G27 = norm_stem(line_after_dot(p269, "27. There is a new building"))
G28 = norm_stem(line_after_dot(p270, "28. Their sister bought a new dress"))
G29 = norm_stem(line_after_dot(p270, "29. He is not very"))
assert G25 == "A: Where is his car? B: The car ------- is parked there belongs to him.", G25
assert G26 == "A: Can she get a good mark now? B: No, but she could get a good score if she -------more.", G26
assert G27 == "There is a new building in the neighborhood. The workers-------it very well.", G27
assert G28 == "Their sister bought a new dress at a very low price, -------?", G28
assert G29 == "He is not very-------, thus he doesn’t feel comfortable to talk to people.", G29
# گزینه‌های چاپ: بک‌تیک‌های ق۲۸ (doesn`t she / don`t they / didn`t she / didn`t they)
OPTS28 = ["doesn`t she", "don`t they", "didn`t she", "didn`t they"]
for o in OPTS28 + ["which", "when", "whom", "whose", "have studied", "studied", "studies", "would study",
                   "have built", "are built", "were built", "have been built",
                   "communicatively", "communicate", "communication", "communicative"]:
    assert o in full, o
Q_L77 = [
    q("g12-l77-1", 1, "grammar", G25, ["which", "when", "whom", "whose"], 0),
    q("g12-l77-2", 2, "grammar", G26, ["have studied", "studied", "studies", "would study"], 1),
    q("g12-l77-3", 3, "grammar", G27, ["have built", "are built", "were built", "have been built"], 0),
    q("g12-l77-4", 4, "grammar", G28, OPTS28, 2),
    q("g12-l77-5", 5, "grammar", G29, ["communicatively", "communicate", "communication", "communicative"], 3),
]
# کلیدهای چاپی [a,b,a,c,d]
assert [it["answer"] for it in Q_L77] == [0, 1, 0, 2, 3]
assert [it["options"][it["answer"]] for it in Q_L77] == ["which", "studied", "have built", "didn`t she", "communicative"]

# ————— س۹: خوانداریِ انیشتین (ص۲۷۰) → بانک l78 —————
EIN = join_inclusive(p270, "Albert Einstein, a physicist", "died on April 18, 1955.")
for frag in ["Albert Einstein, a physicist, was born on March 14, 1879, in Germany. He could change people`s",
             "understanding of the physical world, therefore, he has been considered as one of the greatest",
             "After graduating in 1900, Einstein had a hard time finding a job. He finally got a",
             "job at the Swiss Patent Office in 1902.",
             "He became a professor at the German University in Prague.",
             "Einstein was awarded the Nobel Prize for physics in 1921.",
             "In 1933, he left Germany because of the strict rules of Hitler.",
             "World War II, he wrote a letter to President Roosevelt expressing his worry about the atomic bomb.",
             "stomach pains several times, and he died on April 18, 1955."]:
    assert any(frag in l for l in p270), frag
assert "people`s understanding" in EIN, "بک‌تیکِ چاپِ people`s"
assert EIN not in "\n".join(p270), "متنِ بازجوش در لایهٔ خام پیوسته نیست"
assert not any(it["question"].startswith("Albert Einstein") for b in d["lessons"] for it in b["questions"])
M35 = norm_stem(line_after_dot(p270, "35. Before the World War II"))
M36 = norm_stem(line_after_dot(p270, "36. He died because of his"))
T37 = norm_stem(line_after_dot(p270, "37. His job helped him").split("a) True")[0].strip())
T38 = norm_stem(line_after_dot(p270, "38. He found a job easily").split("a) True")[0].strip())
assert M35 == "Before the World War II, Einstein left Germany and became a/an------- .", M35
assert M36 == "He died because of his -------", M36  # نقطهٔ پایانیِ چاپ داخلِ رانِ نقطه‌چین است
assert T37 == "His job helped him to think about his theory.", T37
assert T38 == "He found a job easily after graduation.", T38
Q_L78 = [
    q("g12-l78-1", 1, "grammar", f"{EIN} — {M35}",
      ["president", "American citizen", "physicist", "student"], 1),
    q("g12-l78-2", 2, "grammar", f"{EIN} — {M36}",
      ["Relativity Theory", "scientific research", "health problems", "academic studies"], 2),
    q("g12-l78-3", 3, "grammar", f"{EIN} — {T37}", ["True", "False"], 0),
    q("g12-l78-4", 4, "grammar", f"{EIN} — {T38}", ["True", "False"], 1),
]
# کلیدهای چاپی [b,c,True,False]
assert [it["answer"] for it in Q_L78] == [1, 2, 0, 1]

# ————— س۱۰: خوانداریِ انرژیِ خورشید (ص۲۷۱-۲۷۲) → بانک l79 —————
SOLAR = join_inclusive(p271, "All of our energy comes from the sun", "using them.")
for frag in ["All of our energy comes from the sun which is our nearest star.",
             "We call this energy solar energy or radiant energy.",
             "This process is called Photosynthesis.",
             "muscles and brain cells. We use this energy for everything we do. We use energy when we sing a",
             "song, think a thought, tell a joke or climb mountains. Everything needs energy.",
             "Just as humans store energy in their bodies, the earth stores the sun`s energy too.",
             "energy has also been stored in coal, oil, and natural gases which are known as fossil fuels. We may",
             "Fossil fuels are known as non-renewable sources of energy, so they can’t be used over and",
             "Luckily, there are some renewable energy sources we can use, and we can keep using.",
             "Three forms of renewable energy are: solar",
             "energy, water energy and wind energy.",
             "solar panels on the top of houses to help capture the sun`s energy and transform it into heat and",
             "Wind turbines can get the energy of the moving air and turn it into electricity."]:
    assert any(frag in l for l in p271), frag
assert "sun`s energy" in SOLAR, "بک‌تیکِ چاپِ sun`s"
assert SOLAR not in "\n".join(p271), "متنِ بازجوش در لایهٔ خام پیوسته نیست"
assert not any(it["question"].startswith("All of our energy") for b in d["lessons"] for it in b["questions"])
M41 = norm_stem(line_after_dot(p271, "41. What does “they” in paragraph3"))
M42 = norm_stem(line_after_dot(p271, "42. What is this passage mostly about"))
T43 = norm_stem(line_after_dot(p272, "43. Our nearest star").split("a) True")[0].strip())
T44 = norm_stem(line_after_dot(p272, "44. The sun`s energy can only").split("a)True")[0].strip())
assert M41 == "What does “they” in paragraph3, line 2 refer to?", M41
assert M42 == "What is this passage mostly about? It is about------- .", M42
assert T43 == "Our nearest star is the source of all the energy we need on earth.", T43
assert T44 == "The sun`s energy can only be stored in the form of coal, oil, and natural gases.", T44
Q_L79 = [
    q("g12-l79-1", 1, "grammar", f"{SOLAR} — {M41}",
      ["fossil fuels", "non-renewable energy sources", "renewable sources of energy", "solar panels"], 2),
    q("g12-l79-2", 2, "grammar", f"{SOLAR} — {M42}",
      ["how long it takes for light to reach the earth from the sun",
       "the importance of energy for human life and where energy comes from",
       "different types of non-renewable sources of energy used by people",
       "how fossil fuels were formed"], 1),
    q("g12-l79-3", 3, "grammar", f"{SOLAR} — {T43}", ["True", "False"], 0),
    q("g12-l79-4", 4, "grammar", f"{SOLAR} — {T44}", ["True", "False"], 1),
]
# کلیدهای چاپی [c,b,True,False]
assert [it["answer"] for it in Q_L79] == [2, 1, 0, 1]

# ————— س۱۱: جملهٔ مناسبِ ستون‌ها (ص۲۷۲) → بانک l80 — ساقه‌ها با حرفِ ربطِ انتهاییِ چاپی —————
for frag in ["47. You can use mobile dictionary, or", "48. The roads were covered with ice, so",
             "49. I wanted to call you, but", "50. I went to the window, and"]:
    assert any(l.strip() == frag for l in p272), f"ساقهٔ چاپیِ س۱۱: {frag}"
B47 = "I didn`t have your number."
B48 = "I looked out."
B49 = "you can buy a pocket one."
B50 = "it was not safe to drive."
for o in [B47, B48, B49, B50]:
    assert o in full, o
Q_L80 = [
    q("g12-l80-1", 1, "vocab", "You can use mobile dictionary, or -------",
      [B47, B48, B49, B50], 2),
    q("g12-l80-2", 2, "vocab", "The roads were covered with ice, so -------",
      [B47, B48, B49, B50], 3),
    q("g12-l80-3", 3, "vocab", "I wanted to call you, but -------",
      [B47, B48, B49, B50], 0),
    q("g12-l80-4", 4, "vocab", "I went to the window, and -------",
      [B47, B48, B49, B50], 1),
]
# کلیدهای چاپی 47.( c )/48.( d )/49.( a  )/50.( b  ) — رندر: خانهٔ «-------» برای سازگاریِ موتور (چاپ خانه ندارد — الگویِ l61)
assert [it["options"][it["answer"]] for it in Q_L80] == [B49, B50, B47, B48]

# ————— س۱۲: حروفِ ربطِ پاراگرافِ امین (ص۲۷۲) → بانک l81 — دومین رندرِ پاراگرافی —————
AMIN = join_inclusive(p272, "Amin is a student", "father arrived.")
assert "(51)" in AMIN and "(54)" in AMIN, "نشانه‌های چاپیِ خانه‌ها"
AMIN_NORM = norm_stem(re.sub(r"\s*\((?:5[1234])\)\s*[….]+", "-------", AMIN))
C51 = "Amin is a student,-------he goes to a school near his house."
C52 = "He can come home by taxi,------- he can come on foot."
C53 = "He usually gets back on time,------- yesterday he came home late because one of his friends got sick,"
C54 = "------- Amin waited until his friend’s father arrived."
for c in (C51, C52, C53, C54):
    assert c in AMIN_NORM, c
Q_L81 = [
    q("g12-l81-1", 1, "grammar", C51, ["but", "and", "so", "or"], 1),
    q("g12-l81-2", 2, "grammar", C52, ["but", "and", "so", "or"], 3),
    q("g12-l81-3", 3, "grammar", C53, ["but", "and", "so", "or"], 0),
    q("g12-l81-4", 4, "grammar", C54, ["but", "and", "so", "or"], 2),
]
# کلیدهای چاپی [and, or, but, so] — ترتیبِ چاپِ دستور (but, and, so, or) حفظ شد؛ ساقهٔ ۵۳ با ویرگولِ پایانیِ چاپ و ۵۴ خانه-آغاز
assert [it["options"][it["answer"]] for it in Q_L81] == ["and", "or", "but", "so"]

# ————— س۱۴-الف: تعریف‌یابی (ص۲۷۳) → بانک l82 —————
S57 = norm_stem(line_after_dot(p273, "57. I may forgive myself"))
S58 = norm_stem(line_after_dot(p273, "58. They really liked the combination"))
S59 = norm_stem(line_after_dot(p273, "59.  Scientists work effectively"))
S60 = norm_stem(line_after_dot(p273, "60. These days the demand for oil"))
assert S57 == "I may forgive myself for the accident, but it is very difficult to forget.", S57
assert S58 == "They really liked the combination of colors in my painting.", S58
assert S59 == "Scientists work effectively to find new ways to make life easier for us.", S59
assert S60 == "These days the demand for oil is decreasing in many areas in the country.", S60
DEFS82 = ["cry suddenly",                                   # a — اضافیِ چاپیِ هرگز-کلید (اکویِ اضافیِ r387-l58)
          "the amount of a product or service that people want",  # b
          "in a way that is successful and achieves what you want",  # c
          "stop being angry with someone",                  # d
          "an arrangement in a particular order"]           # e
for df in DEFS82:
    assert df in full, df
Q_L82 = [
    q("g12-l82-1", 1, "vocab", f"«{S57}» — تعریفِ ستون B برای واژهٔ «forgive»: -------", DEFS82, 3),
    q("g12-l82-2", 2, "vocab", f"«{S58}» — تعریفِ ستون B برای واژهٔ «combination»: -------", DEFS82, 4),
    q("g12-l82-3", 3, "vocab", f"«{S59}» — تعریفِ ستون B برای واژهٔ «effectively»: -------", DEFS82, 2),
    q("g12-l82-4", 4, "vocab", f"«{S60}» — تعریفِ ستون B برای واژهٔ «demand»: -------", DEFS82, 1),
]
# کلیدهای چاپی [d,e,c,b] — ترتیبِ چاپِ ستون B (a-e) حفظ شد؛ اضافیِ a (cry suddenly) هرگز کلید نیست
assert [it["options"][it["answer"]] for it in Q_L82] == [DEFS82[3], DEFS82[4], DEFS82[2], DEFS82[1]]
for it in Q_L82:
    assert it["options"][it["answer"]] != DEFS82[0], it["id"]

# ————— س۱۴-ب: اصطلاحات (ص۲۷۳) → بانک l83 — دو ردیفِ تازه؛ دو دوقلویِ بایتیِ l59 مستثنی —————
for idi in ["57. Out of sight, out of mind", "58. Too many cooks spoil the broth",
            "59. Birds of a feather flock together", "60. Practice makes perfect"]:
    assert idi in full, idi
IDMS83 = ["People like to spend time with those who are similar to them.",            # f
          "When two people cooperate with each other, they come up with better ideas.",  # g — اضافیِ چاپیِ هرگز-کلید
          "When there are too many people trying to lead and give their opinions, it’s confusing and leads to bad results.",  # h — دوخطیِ چاپ (leads to/bad results.) بازجوش با فاصله
          "You soon forget people or things that are no longer visible or present.",   # i
          "You have to practice a skill a lot to become good at it."]                  # j
for df in IDMS83:
    # داوریِ لایهٔ خام: تعریفِ h در چاپ دوخطی است («…leads to» / «bad results.») — بازجوش با فاصله
    if df.startswith("When there are too many people"):
        assert any(l.strip() == "h. When there are too many people trying to lead and give their opinions, it’s confusing and leads to" for l in p273), "فرگمنتِ h سطرِ اول"
        assert any(l.strip() == "bad results." for l in p273), "فرگمنتِ h سطرِ دوم"
    else:
        assert df in full, df
Q_L83 = [
    q("g12-l83-1", 1, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «Too many cooks spoil the broth»: -------", IDMS83, 2),
    q("g12-l83-2", 2, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «Birds of a feather flock together»: -------", IDMS83, 0),
]
# کلیدهای چاپی [h,f] — ترتیبِ چاپِ ستون B (f-j) حفظ شد؛ اضافیِ g هرگز کلید نیست؛
# ردیف‌های ۵۷ (Out of sight→i) و ۶۰ (Practice makes perfect→j) دوقلویِ بایتیِ l59-1/l59-2 — مستثنی با کلیدِ چاپیِ حفظ‌شده
assert [it["options"][it["answer"]] for it in Q_L83] == [IDMS83[2], IDMS83[0]]
for it in Q_L83:
    assert it["options"][it["answer"]] != IDMS83[1], it["id"]

# ————— گاردِ سراسریِ ضدتکرار —————
EXISTING_STEMS = {it["question"] for b in d["lessons"] for it in b["questions"]}
ALL_NEW = (Q_L72, Q_L73, Q_L74, Q_L75, Q_L76, Q_L77, Q_L78, Q_L79, Q_L80, Q_L81, Q_L82, Q_L83)
for bank in ALL_NEW:
    for it in bank:
        assert it["question"] not in EXISTING_STEMS, f"byte-twin stem shipped: {it['id']}"
# دوقلوهای مستثنیِ س۱۴-ب واقعاً در مخزن هستند و بانکِ تازه آن‌ها را ندارد
assert any("Out of sight" in it["question"] for b in d["lessons"] if b["lesson"] == 59 for it in b["questions"])
assert not any("Out of sight" in it["question"] or "Practice makes perfect" in it["question"] for bank in ALL_NEW for it in bank)

# ————— درج در سند —————
B72 = {"lesson": 72, "title": "نهایی خرداد ۱۳۹۹ انسانی — کلوژِ شنیداریِ گفت‌وگوی داد (س۱، ص۲۶۸)", "level": "چهارگزینه‌ای",
       "count": len(Q_L72), "questions": Q_L72}
B73 = {"lesson": 73, "title": "نهایی خرداد ۱۳۹۹ انسانی — کلوژِ شنیداریِ باتریِ لپ‌تاپ (س۲، ص۲۶۸)", "level": "چهارگزینه‌ای",
       "count": len(Q_L73), "questions": Q_L73}
B74 = {"lesson": 74, "title": "نهایی خرداد ۱۳۹۹ انسانی — خانه‌های چاپِ ایمیل (س۳، ص۲۶۸)", "level": "تایپی",
       "count": len(Q_L74), "questions": Q_L74}
B75 = {"lesson": 75, "title": "نهایی خرداد ۱۳۹۹ انسانی — واژگانِ بانکِ چاپ (س۵، ص۲۶۹)", "level": "چهارگزینه‌ای",
       "count": len(Q_L75), "questions": Q_L75}
B76 = {"lesson": 76, "title": "نهایی خرداد ۱۳۹۹ انسانی — حرفِ اول (س۶، ص۲۶۹)", "level": "چهارگزینه‌ای",
       "count": len(Q_L76), "questions": Q_L76}
B77 = {"lesson": 77, "title": "نهایی خرداد ۱۳۹۹ انسانی — گرامر (س۷، ص۲۶۹-۲۷۰)", "level": "چهارگزینه‌ای",
       "count": len(Q_L77), "questions": Q_L77}
B78 = {"lesson": 78, "title": "نهایی خرداد ۱۳۹۹ انسانی — خوانداریِ انیشتین (س۹، ص۲۷۰)", "level": "چهارگزینه‌ای",
       "count": len(Q_L78), "questions": Q_L78}
B79 = {"lesson": 79, "title": "نهایی خرداد ۱۳۹۹ انسانی — خوانداریِ انرژیِ خورشید (س۱۰، ص۲۷۱-۲۷۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L79), "questions": Q_L79}
B80 = {"lesson": 80, "title": "نهایی خرداد ۱۳۹۹ انسانی — جملهٔ مناسبِ ستون‌ها (س۱۱، ص۲۷۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L80), "questions": Q_L80}
B81 = {"lesson": 81, "title": "نهایی خرداد ۱۳۹۹ انسانی — حروفِ ربطِ پاراگرافِ امین (س۱۲، ص۲۷۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L81), "questions": Q_L81}
B82 = {"lesson": 82, "title": "نهایی خرداد ۱۳۹۹ انسانی — تعریف‌یابی (س۱۴-الف، ص۲۷۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L82), "questions": Q_L82}
B83 = {"lesson": 83, "title": "نهایی خرداد ۱۳۹۹ انسانی — اصطلاحات (س۱۴-ب، ص۲۷۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L83), "questions": Q_L83}

# ————— نشت‌سنجِ راندی: محتوای مستثنی‌شدهٔ برگهٔ انسانی نباید در بانک‌های تازه باشد —————
LEAKS = ["should see a doctor",                 # س۱ ردیفِ ۲ (صوتی)
         "repeat themselves",                   # س۱ ردیفِ ۳ (صوتی)
         "simple as an infection",              # س۱ کلیدِ مدلِ ۴
         "running low",                         # س۲ کلیدِ مدلِ ۸
         "finish watching the movie",           # س۲ کلیدِ مدلِ ۹ (آشفته)
         "unwanted emails",                     # س۳ ردیفِ ۱۳ (صوتی)
         "organized approach",                  # س۳ کلیدِ مدلِ ۱۴
         "free apps",                           # س۴ تصویری
         "hugging your child",                  # س۴ تصویری
         "Teenagers who help others",           # س۴ اضافیِ چاپی (تصویری)
         "Hydropower is produced",              # س۴ تصویری
         "Tides can usually happen",            # س۴ تصویری
         "His job became",                      # س۸ تایپیِ ۳۰
         "increasingly",                        # س۸ تایپی
         "has been discovered",                 # س۸ تایپی
         "were invented",                       # س۸ تایپی
         "waste every night",                   # س۸ تایپیِ ۳۱
         "There are some plants which grow",    # س۱۳ (تولیدیِ Plants)
         "Vitamin D",                           # س۱۳ (تولیدی)
         "sunshine vitamin",                    # س۱۳ (تولیدی)
         "talking / to the neighbors",          # س۱۵ گروهِ واژگانِ ۶۱a
         "had / happy / after",                 # س۱۵ گروهِ واژگانِ ۶۱b
         "good runner if he had more free time",  # س۱۵ پاسخِ مدلِ ۶۲a
         "must be informed about the result",   # س۱۵ پاسخِ مدلِ ۶۲b
         "Omidzadeh",                           # س۱۶-ج (تصویری)
         "Light bulbs",                         # س۱۶-ج (تصویری)
         "Firefighters",                        # س۱۶-د
         "Keeping others safe",                 # س۱۶-د چیپ
         "being always ready",                  # س۱۶-د چیپ
         "wearing uniform"]                     # س۱۶-د چیپ
blob = json.dumps([B72, B73, B74, B75, B76, B77, B78, B79, B80, B81, B82, B83], ensure_ascii=False)
for s in LEAKS:
    assert s not in blob, f"leak: {s}"

for b in (B72, B73, B74, B75, B76, B77, B78, B79, B80, B81, B82, B83):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie11"] = {
    "extractedRound": "r389",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ یازدهم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۳۹۹ (ادبیات و علوم انسانی–علوم و معارف اسلامی)",
    "examPages": "pdf-p268-274 (هفت صفحهٔ آزمون؛ هفتمی فقط نگارش/جمع‌بندی) + کلیدِ رسمی: pdf-p275-276 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p267→p268 (پس از ریاضی-تجربیِ r388) و p276→p277 (آغازِ برگهٔ لایه‌خراب)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: ادبیات و علوم انسانی–علوم و معارف اسلامی — نوبت خردادماه سال ۱۳۹۹ (تاریخِ چاپی: ۰۷/۰۴/۹۹) — مدت ۱۲۰ دقیقه — ساعت شروع ۸ صبح (با فاصلهٔ چاپ — الگویِ r388) — ۱۶ سکشن/۶۲ ردیف/جمعِ نمرهٔ ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir)",
    "keyPages": "pdf-p275-276 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۵۵ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۳۹ کلید از ۳۹ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «1. ( d )» (پرانتز-فاصله‌دار) «2. False ( b)» (پرانتزِ ناهمگون) «3. Because she can’t hear well. 4. It might be something as simple as an infection / more serious.» / «5. (d) 6. (b) 7. (a)» / کلیدِ ۹ آشفته (ران‌های جدا: She needed/electricity/nough/e/to finish watching/movie) / «10. responding 11. personal» / «12. Yes, it does. It takes him a lot of time to answer the emails. 13. He deletes them. 14. He takes an organized approach with work emails.» / «15. ( d ) 16. ( a ) 17. ( b  ) 18. ( e )» (دوفاصلهٔ چاپ در ۱۷) / «19. dedicated 20. conditioner 21. alphabetically» / «22. forever 23. contain 24. lap» / «25. ( a ) 26. (b) 27. (a ) 28. (c) 29. ( d )» (پرانتزهای ناهمگونِ چاپ) / «30. increasingly 31. collect 32. has been discovered 33. were invented 34. were» / «35. (b) 36. (c) 37. ( a) True 38. (b) False» / کلیدِ ۳۹ «The Nobel Prize was awarded to Einstein for physics in١٢٩١.» با ارقامِ فارسیِ چسبیده (بازتابِ ۱۹۲۱ِ متن) / «41. (c) 42. (b)» / کلیدِ ۴۳ «(a) True)» با پرانتزِ سرگردانِ چاپ / «44. (b) False» / «45. The energy is stored in their roots,/ fruits,/ and leaves.» / کلیدِ ۴۶ با ارقامِ فارسیِ وارونه («٦٤.») — دومین تکرارِ کوئیرکِ r388؛ شمارهٔ لاتینِ ۴۶ در کلید نیست؛ شکستِ سطرِ «wind/energy» / «47. ( c ) 48. ( d ) 49. ( a  ) 50. ( b  )» / «51. and 52. or 53. but 54. so» / جدولِ عمودیِ ۵۷-۶۰ (d i/e h/c f/b j) با حروفِ تک‌خطیِ مستقل در لایه / «61-62» چهار پاسخِ مدل با نمره‌های زیربخشِ چاپی (0/25)(0/75) و یادداشتِ «در سؤال ۶۱ قسمت a با توجه به فlesh جواب می‌تواند صحیح باشد» (غلطِ حروف‌چینیِ «فلس»)",
    "sectionsTotal": 62,
    "sectionsExtracted": 39,
    "sectionsSkipped": 23,
    "items": 39,
    "bankCounts": [1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2],
    "keyPolicy": "همهٔ کلیدهای ۳۹ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ بانکِ ۴واژه‌ایِ l75 به ترتیبِ چاپِ خودِ برگه (introduction, dedicated, alphabetically, conditioner) با اضافیِ چاپیِ هرگز-کلید (introduction)؛ حرفِ اولِ l76 با سه سه‌تاییِ هم‌شکلِ مهندسی‌شده (f++++++/c++++++/l++ — ۷/۷/۳حرفی)؛ گرامرِ l77 به ترتیبِ چاپ با بک‌تیک‌های tagِ ۲۸؛ کلوژهای شنیداریِ l72/l73 گزینه‌های ردیفیِ خودشان را دارند (نه استخرِ مشترک)؛ کلیدهای درست/غلطِ l78/l79 سمانتیک‌اند (چاپ: True/False و True/False با «a)True» بی‌فاصله در ۴۴)؛ حروفِ ربطِ l81 به ترتیبِ چاپِ دستور (but, and, so, or)؛ تعریف‌یابیِ l82 و اصطلاحاتِ l83 به ترتیبِ چاپِ ستون B با اضافی‌های چاپیِ هرگز-کلید (a/g)",
    "engineNote": "۳۷ آیتم MCQ + ۲ آیتم typed (l74 — نخستین بانکِ تایپیِ بخشِ نهایی‌ها با kind=typed و accepted عینِ کلیدِ چاپی؛ options در حالتِ typed داربستِ بازبینی است)؛ ساقه‌های خوانداریِ l78/l79 متنِ کاملِ چاپی را در خود دارند (بازجوشِ joinِ بی‌نُرمِ فرگمنتی)؛ l81 دومین رندرِ پاراگرافیِ حروفِ ربط (الگویِ l69ِ r388) — نشانهٔ چاپیِ «(N)…….» داخلِ جمله به خانهٔ ساده تبدیل شد (خانه‌های چسبیده به واژهٔ بعد وفادارانه ماندند؛ ساقهٔ ۵۳ با ویرگولِ پایانیِ چاپ و ساقهٔ ۵۴ خانه-آغاز)؛ ساقه‌های l80 خانهٔ چاپی ندارند و خانهٔ رندر «-------» برای سازگاریِ موتور الحاق شد (الگویِ l61)؛ ساقه‌های تعریف‌یابی/اصطلاح دوبخشیِ فارسی (الگویِ r380-l5/r386-l45/r387-l58)؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» (چسبیدگی‌های «a/an-------» در ق۷ و «she -------more» در ق۲۶ و «very-------,» در ق۲۹ وفادارانه ماند)",
    "derivedKeys": {
        "S1": ["she can’t hear clearly"],
        "S2": ["low", "rechargeable", "outlet"],
        "S3-typed": ["responding", "personal"],
        "S5": ["dedicated", "conditioner", "alphabetically"],
        "S6": ["forever", "contain", "lap"],
        "S7": ["which", "studied", "have built", "didn`t she", "communicative"],
        "S9": ["American citizen", "health problems", "True", "False"],
        "S10": ["renewable sources of energy", "the importance of energy for human life and where energy comes from", "True", "False"],
        "S11": ["you can buy a pocket one.", "it was not safe to drive.", "I didn`t have your number.", "I looked out."],
        "S12": ["and", "or", "but", "so"],
        "S14-الف": ["stop being angry with someone", "an arrangement in a particular order", "in a way that is successful and achieves what you want", "the amount of a product or service that people want"],
        "S14-ب": ["When there are too many people trying to lead and give their opinions, it’s confusing and leads to bad results.", "People like to spend time with those who are similar to them."],
    },
    "paperMap": "نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — کشفِ r384، تأییدِ دوباره در این راند: دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ (پیش از presentation-forms)؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸)؛ شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸)؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ [r388]؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹) ← این راند؛ برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ [r387]؛ شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ [r388]؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ [r386]؛ خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۱۲ برگه استخراج شد، ۵ برگه باقی است",
    "skippedSections": [
        "س۱ ردیف‌های ۲-۴ (شنیداریِ دادزدن): صوتی-کلید؛ کلیدهای چاپی: 2. False ( b)/3. Because she can’t hear well./4. It might be something as simple as an infection / more serious.",
        "س۲ ردیف‌های ۸-۹ (شنیداریِ باتری): صوتی-کلید؛ کلیدِ ۸ «Because her phone battery was running low.» و کلیدِ ۹ آشفته (ران‌های جدا: She needed/electricity/nough/e/to finish watching/movie — «She needed enough electricity to finish watching the movie.»)",
        "س۳ ردیف‌های ۱۲-۱۴ (شنیداریِ ایمیل): صوتی-کلید؛ کلیدهای چاپی: 12. Yes, it does. It takes him a lot of time to answer the emails./13. He deletes them./14. He takes an organized approach with work emails.",
        "س۴ (ردیف ۱۵-۱۸، تصویری): «یک جمله اضافی است» — پنج جملهٔ چاپی a-e: a) There are lots of free apps that you don’t need to pay money to use them. → 16 / b) It is believed that hugging your child boosts the level of happiness. → 17 / c) Teenagers who help others are more successful in life. (اضافیِ چاپی) / d) Hydropower is produced as a result of falling or running water. → 15 / e) Tides can usually happen near any huge body of water like an ocean or a sea. → 18؛ استخراج نیازمندِ تصویر",
        "س۸ (ردیف ۳۰-۳۴، شکلِ صحیحِ فعل): «30. increasingly/31. collect/32. has been discovered/33. were invented/34. were» — تولیدیِ تایپی؛ کاندیدِ تایپی (۵ ردیفِ تازه به مخزن — ۶۹ ردیف)",
        "س۹ ردیف‌های ۳۹-۴۰ (پاسخِ مدلِ خوانداریِ انیشتین): «39. The Nobel Prize was awarded to Einstein for physics in١٢٩۱.» (ارقامِ فارسیِ چسبیده) و «40. He wrote a letter to President Roosevelt expressing his worry about the atomic bomb.» — پاسخ‌های مشتقِ خودِ متن (درسِ r387: از ثبتِ مخزن معاف)",
        "س۱۰ ردیف‌های ۴۵-۴۶ (پاسخِ مدلِ خوانداریِ خورشید): «45. The energy is stored in their roots,/ fruits,/ and leaves.» و «46. Three forms of renewable energy are: solar energy, water energy and wind energy» (با ارقامِ فارسیِ وارونهٔ «٦٤.» در لایه — دومین تکرارِ کوئیرکِ r388) — پاسخ‌های مشتقِ خودِ متن",
        "س۱۳ (ردیف ۵۵-۵۶، تولیدی): Topic Sentence برای «Plants» و «Vitamin D» — تولیدی",
        "س۱۴-ب ردیف‌های ۵۷ و ۶۰ (Out of sight→i و Practice makes perfect→j): دوقلویِ بایتیِ ساقه‌های l59-1/l59-2 با ستونِ B یکسان و کلیدِ یکسان — طبق درسِ برگهٔ ناشنوایان (r388) شمرده نشدند و کلیدهای چاپیِ i/j در رسید حفظ شد",
        "س۱۵ (ردیف ۶۱-۶۲، جمله‌سازیِ انتخابیِ a/b): چهار پاسخِ مدلِ چاپی: 61a. The woman who bought that apartment was talking to the neighbors in the yard. (با نمره‌های زیربخش 0/25+0/75) / 61b. His parents became happy after they had met their son. / 62a. He could be a good runner if he had more free time to practice. / 62b. They must be informed about the result today. — با یادداشتِ چاپیِ «در سؤال ۶۱ قسمت a با توجه به فﻠﺶ جواب می‌تواند صحیح باشد» (غلطِ حروف‌چینی)",
        "س۱۶ (نگارشِ انتخابیِ c/d): ج) Topic Sentence برای چهار عنوانِ تصویری (a) Hassan Omidzadeh / b) Dictionaries / c) Forest / d) Light bulbs) و د) پاراگرافِ Firefighters با چیپ‌های چاپی (Keeping others safe / being always ready / wearing uniform for) — تولیدی با تصویر",
    ],
    "printQuirks": [
        "نخستین برگهٔ دوقلویِ چاپِ خرداد ۱۳۹۹ (هم‌صفحه‌بندِ ریاضی-تجربیِ r388) — سربرگِ «ﺳﺆاﻻت  اﻣﺘﺤﺎن ﻧﻬﺎﯾﯽ» دوفاصله‌ای (الگویِ r383/r386/r388)؛ متنِ انگلیسی و کلیدها لاتینِ سالم",
        "«8 ﺻﺒﺢ» با فاصلهٔ چاپ (الگویِ r388؛ برخلافِ r387 چسبیده)؛ «درس :» با فاصلهٔ پیش از دونقطه",
        "نقطه‌چینِ چسبیده به واژه: «a/an…………» در ق۷ و «……………more» در ق۲۶ و «very………………,» در ق۲۹ — خانهٔ ساده با چسبیدگیِ وفادار («a/an-------»/«-------more»/«very-------,»)؛ در ق۱۱ «a/an …………….» با فاصله — تضادِ چاپیِ ق۷/ق۱۱ پیمان شد",
        "«d) b & c» گزینهٔ ترکیبیِ چاپیِ ق۶ — عینِ چاپ",
        "«When speaker looks» بی‌حرف تعریف در ق۱۰ — مفردِ چاپ وفادارانه ماند",
        "«to keep here cool» ق۲۰ (به‌جای it) — چاپِ برگه وفادارانه ماند",
        "بک‌تیکِ چاپ: «mother`s l - -» ق۲۴، «people`s» و «sun`s» در متن‌ها، «didn`t» گزینهٔ a س۱۱، و چهارگزینهٔ tagِ ق۲۸ (doesn`t she/don`t they/didn`t she/didn`t they)",
        "ساقه‌های س۱۱ با حرفِ ربطِ انتهاییِ چاپی («…, or»/«…, so»/«…, but»/«…, and») — عینِ چاپ؛ خانهٔ رندر الحاق شد",
        "نشانه‌های خانه‌های س۱۲ داخلِ جمله: «(51)…….he» چسبیده به واژهٔ بعد، «(53)…….. yesterday» و «(54) …… Amin» با فاصله — به خانهٔ ساده تبدیل شد",
        "گزینه‌های TF ناهمگون: ق۴۳ «a) True  b) False» و ق۴۴ «a)True  b)False» بی‌فاصله — عینِ چاپ (رندرِ موتور: True/False استاندارد)",
        "کلیدِ ۴۳ با پرانتزِ سرگردانِ چاپ («(a) True)») و کلیدهای پرانتز-فاصله‌دارِ ناهمگون («1. ( d )»/«17. ( b  )»/«27. (a )»/«49. ( a  )») — عینِ چاپ",
        "کلیدِ ۳۹ با ارقامِ فارسیِ چسبیده («in١٢٩١») و کلیدِ ۴۶ با ارقامِ فارسیِ وارونه («٦٤.») — دومین تکرارِ کوئیرکِ r388؛ شکستِ سطرِ «wind/energy» در کلیدِ ۴۶",
        "جدولِ عمودیِ کلیدِ ۵۷-۶۰: حروفِ d/i/e/h/c/f/b/j هرکدام خطِ مستقل در لایه — پیمانِ فرگمنتی",
        "کلیدِ ۹ آشفته (ران‌های جدا) — الگویِ کلیدِ ۱۰ِ r388؛ تعریفِ h س۱۴-الف دوخطیِ چاپ («…leads to»/«bad results.») — بازجوش با فاصله",
        "یادداشتِ چاپیِ کلیدِ ۶۱ با غلطِ حروف‌چینی («فﻠﺶ» به‌جای فلس) — ثبت شد",
        "پاورقیِ صفحات: شمارهٔ چاپیِ ۱۷۳-۱۷۹ و ۱۸۰-۱۸۱ (کلید) + پاورقیِ «Audio file (MP3) / Audio script (PDF)» در ص۲۶۸",
    ],
    "futureNote": "بخشِ ۴: ۱۲ برگه از ۱۷ استخراج شد، ۵ برگه باقی است (نزدیک‌ترین: برگهٔ لایه‌خرابِ ص۲۷۷-۲۸۴ که OCR/رندر می‌خواهد؛ سپس چهار برگهٔ ۱۳۹۷/۱۳۹۸ با کلیدِ سربرگِ قدیمی: دی ۱۳۹۷ ص۲۲۹-۲۳۶/خرداد ۱۳۹۸ ص۲۳۷-۲۴۳/شهریور ۱۳۹۸ ص۲۴۴-۲۵۰/دی ۱۳۹۸ ص۲۵۱-۲۵۸)؛ کاندیدهای تایپیِ این برگه (س۸: increasingly/collect/has been discovered/were invented/were) به کاندیدهای r380-r388 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۶۹ ردیف است (۶۴ِ r388 + ۵ ردیفِ تازه)؛ l74 نخستین بانکِ تایپیِ شپ‌شدهٔ بخشِ نهایی‌هاست (الگویِ بانک‌های تایپیِ آینده)",
}
d["source"]["g12nahaie11"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r389-humanities OK — banks={len(d['lessons'])} items={total} (+39 in 12 banks: l72=1 l73=3 l74=2 l75=3 l76=3 l77=5 l78=4 l79=4 l80=4 l81=4 l82=4 l83=2) — نهایی خرداد ۱۳۹۹ انسانی با کلیدِ رسمی")
