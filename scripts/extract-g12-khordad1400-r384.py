#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r384 — برگهٔ پنجمِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۴۰۰
(واریانتِ رشتهٔ ادبیات و علوم انسانی-علوم و معارف اسلامی؛ تاریخِ چاپی ۱۸/۰۳/۱۴۰۰؛
pdf-p315-319 آزمون + کلیدِ رسمیِ «راهنمای تصحیح» pdf-p320-321)
→ tests-g12.json با ۷ بانکِ تازه (l29=7؛ l30=4؛ l31=3؛ l32=3؛ l33=4؛ l34=2؛ l35=6)
— ۲۸ بانکِ قبلی + این = ۳۵ بانک/۴۵۰ آیتم

ساختار آزمون (۱۹ سکشن، ۵۷ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۵ صفحه، شروع ۸ صبح):
  س۱ (۱-۳)    شنیداریِ درست/غلط + کلوژ (زهره/مریم، مهمانیِ مینا) — صوتی-کلید — مستثنی (کلید: 1.True(a)/2.False(b)/3.sister)
  س۲ (۴-۷)    شنیداریِ MCQ (شیلا/سمیرا، موزه) — صوتی-کلید — مستثنی (کلید: 4.(b)/5.(c)/6.(b)/7.(a))
  س۳ (۸-۱۱)   شنیداریِ کلوژِ فرهنگِ لغت (اسدی توسی) — صوتی-کلید — مستثنی (کلید: 8.famous/9.final/10.taken/11.lived)
  س۴ (۱۲-۱۵)  شنیداریِ درست/غلط (طاهره صفارزاده) — صوتی-کلید — مستثنی (کلید: 12.False(b)/13.True(a)/14.False(b)/15.True(a))
  س۵ (۱۶-۱۹)  تصویری (یک جمله اضافی) — تصویری-کلید — مستثنی با داوریِ کاملِ رندر (16.(d)/17.(e)/18.(c)/19.(b))
  س۶ (۲۰-۲۲)  بانکِ ۴واژه‌ای (hugged, introduction, absorb, effectively — اضافیِ چاپی: effectively) → بانک l29
  س۷ (۲۳-۲۵)  تعریف‌یابی A/B (اضافیِ چاپی: cry suddenly) → بانک l29
  س۸ (۲۶)     اصطلاحِ «Easy c - - - , easy go» (کلمهٔ ۴حرفیِ c-دار) → بانک l29
  س۹ (۲۷-۳۰)  گرامر MCQ (با گزینهٔ چاپیِ «didn’t we» حواس‌پرتر) → بانک l30
  س۱۰ (۳۱)    شکلِ فعلِ باز (break → was broken) — کلیدِ چاپیِ دقیق — مستثنی؛ کاندیدِ بانکِ تایپی
  س۱۱ (۳۲-۳۳) جمله‌سازیِ درهم — پاسخِ مدلِ چاپی (بلوکِ درهمِ لایه، داوریِ رندر ۳۰۰dpi) — مستثنی؛ کاندیدِ تایپی
  س۱۲ (۳۴)    ضمیرِ موصولی (which + بندِ دارای فعل، بارم ۰.۵+۰.۵) — مستثنی
  س۱۳ (۳۵-۳۸) خوانداریِ احترام به بزرگ‌ترها: ۳۵-۳۷ → بانک l31؛ ۳۸ (They feel honored.) پاسخِ مدل — کاندیدِ تایپی
  س۱۴ (۳۹-۴۳) خوانداریِ فرهنگِ لغت: ۳۹-۴۱ → بانک l32؛ ۴۲ (entry) و ۴۳ (collocations) پاسخِ مدل — کاندیدِ تایپی
  س۱۵ (۴۴-۴۷) خوانداریِ آبی‌برق: هر چهار ردیف → بانک l33
  س۱۶ (۴۸-۴۹) حروفِ ربط (بانکِ چاپی but, and, so, or) → بانک l34
  س۱۷ (۵۰)    حرفِ ربط با تصویر (wash the dishes) — کلیدِ چاپیِ کامل («50. …..or you should wash the dishes.») — مستثنی
  س۱۸ (۵۱-۵۶) مرتب‌سازیِ پاراگرافِ مورچه‌ها (a-f) با کلیدهای ۵۱.(d)/۵۲.(a)/۵۳.(c)/۵۴.(b)/۵۵.(f)/۵۶.(e)
              → بانک l35 (شش‌گزینه‌ای — نخستین بانکِ مرتب‌سازیِ مخزنِ نهایی‌ها)
  س۱۹ (۵۷)    پاراگرافِ Forests با چیپ‌های چاپی (Natural home of animals / Source of fresh air /
              Source of necessary things for man) — تولیدی — مستثنی
idempotent: اجرای دوم NO-OP (رسید g12nahaie5).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie5" in d.get("source", {}):
    print("r384: receipt g12nahaie5 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie4" in d.get("source", {}), "tests-g12.json (r383) must exist first"
assert len(d["lessons"]) == 28, f"expected 28 banks before r384, got {len(d['lessons'])}"

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
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": answer}


p315 = page_slice(315)
p316 = page_slice(316)
p317 = page_slice(317)
p318 = page_slice(318)
p319 = page_slice(319)
p320 = page_slice(320)
p321 = page_slice(321)
full = "\n".join(p315 + p316 + p317 + p318 + p319 + p320 + p321)


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


# ————— پیمانِ سربرگِ آزمون (ص۳۱۵ — presentation-forms، الگوی r382/r383) —————
assert any("ﺳﺆاﻻت" in l and "ﺘﺤﺎن" in l for l in p315), "سربرگِ فرم‌های ارائه (با اﻣ ﺘﺤﺎنِ شکسته)"
assert any("1400" in l for l in p315)
assert any("aee.medu.ir" in l for l in p315)
assert any("ﺧﺮداد" in l for l in p315), "نوبتِ خرداد"
assert any("اﻧﺴﺎﻧﯽ" in l for l in p315), "رشتهٔ انسانی-معارف"
p315join = re.sub(r"\s+", " ", " ".join(p315))
assert "18 / 03 / 1400" in p315join, "تاریخِ ۱۸/۰۳/۱۴۰۰"
assert any("Audio" in l for l in p315), "پاورقیِ Audio script / MP3"

# ————— پیمانِ کلیدِ رسمی (ص۳۲۰-۳۲۱) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p320)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p321)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p320 + p321 if l.strip()))
assert "18 / 03 / 1400" in keyjoin, "تاریخِ کلید = تاریخِ برگه"
KEY_FRAGS = ["1. True (a)", "2. False (b)", "3. sister",
             "4. (b)", "5. (c)", "6. (b)", "7. (a)",
             "8. famous", "9. final", "10. taken", "11. lived",
             "12. False (b)", "13.True (a)", "14. False (b)", "15. True (a)",
             "16. (d)", "17. (e)", "18. (c)", "19. (b)",
             "20. absorb", "21. introduction", "22. hugged",
             "23. (d)", "24. (c)", "25. (b)", "26. come",
             "27. (c)", "28. (a)", "29. (c)", "30. (b)",
             "31. was broken",
             "35. (a) True", "36. (b) False", "37. ( b )",
             "38. They feel honored.",
             "39. (b) False", "40. (a) True", "41. (b)", "42. entry", "43. collocations",
             "44. (a) True", "45. (a) True", "46. (c)", "47.(a)",
             "48. and", "49. but",
             "or you should wash the dishes",
             "51\n(d) Ants are hardworking insects"]
KEY_FRAGS = KEY_FRAGS[:-1] + ["(d) Ants are hardworking insects.", "(a) Throughout the summer",
             "(c) Whenever they find sweet", "(b) they stick to the sweet",
             "(f) Thus, in this way", "(e) As a result"]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# بلوک‌های درهمِ لایه (س۱۱) — فرگمنت‌های واقعی؛ کلیدِ کامل با داوریِ رندر
for frag in ["score", "a bad", "had gotten", "she", "because", "was upset", "Roya",
             "were at home", "he", "if", "the car", "could fix", "John",
             "http://aee.medu.ir"]:
    assert frag in keyjoin, f"scrambled key layer fragment missing: {frag}"

# ————— س۶: بانکِ واژگان (ص۳۱۶) → بانک l29 —————
S20 = norm_stem(line_after_dot(p316, "20. Plants"))
S21 = norm_stem(line_after_dot(p316, "21. This book has only"))
S22 = norm_stem(line_after_dot(p316, "22. My uncle went"))
assert S20 == "Plants ------- carbon dioxide.", S20
assert S21 == "This book has only a two-page ------- .", S21
assert S22 == "My uncle went to his son and ------- him.", S22
assert "hugged, introduction, absorb, effectively" in full
POOL29 = ["hugged", "introduction", "absorb", "effectively"]
Q20_22 = [
    q("g12-l29-1", 1, "vocab", S20, POOL29, 2),
    q("g12-l29-2", 2, "vocab", S21, POOL29, 1),
    q("g12-l29-3", 3, "vocab", S22, POOL29, 0),
]
assert [it["options"][it["answer"]] for it in Q20_22] == ["absorb", "introduction", "hugged"]
for it in Q20_22:
    assert it["options"][it["answer"]] != "effectively", it["id"]

# ————— س۷: تعریف‌یابی A/B (ص۳۱۶) → بانک l29 —————
S23 = "He always speaks slowly and calmly."
S24 = "Here you can see two high and two low tides each day."
S25 = "No one can live forever."
assert S23 in full and S24 in full and S25 in full
DEFS = ["cry suddenly", "for all time", "the rise and fall of the sea", "in a quiet way"]
for df in DEFS:
    assert df in full, df
Q23_25 = [
    q("g12-l29-4", 4, "vocab", f"«{S23}» — تعریفِ ستون B برای واژهٔ «calmly»: -------", DEFS, 3),
    q("g12-l29-5", 5, "vocab", f"«{S24}» — تعریفِ ستون B برای واژهٔ «tides»: -------", DEFS, 2),
    q("g12-l29-6", 6, "vocab", f"«{S25}» — تعریفِ ستون B برای واژهٔ «forever»: -------", DEFS, 1),
]
assert [it["options"][it["answer"]] for it in Q23_25] == [DEFS[3], DEFS[2], DEFS[1]]
for it in Q23_25:
    assert it["options"][it["answer"]] != DEFS[0], it["id"]

# ————— س۸: اصطلاح (ص۳۱۶) — ساقهٔ دوبخطی با گیومهٔ خمیدهٔ چاپ —————
i26 = next(i for i, l in enumerate(p316) if "26. A: When you get money quickly" in l)
S26 = norm_stem(p316[i26].strip().split(".", 1)[1].strip() + " " + p316[i26 + 1].strip())
assert S26 == "A: When you get money quickly, it’s easy to spend it or lose it quickly as well. B: You know that “Easy c - - - , easy go”.", S26
Q26 = q("g12-l29-7", 7, "vocab", S26,
        ["come", "cost", "care", "calm"], 0)

Q_L29 = Q20_22 + Q23_25 + [Q26]

# ————— س۹: گرامر MCQ (ص۳۱۷) → بانک l30 —————
G27 = norm_stem(line_after_dot(p317, "27. They invited you"))
i28 = next(i for i, l in enumerate(p317) if "28. A: What did the students" in l)
G28 = norm_stem(p317[i28].strip().split(".", 1)[1].strip() + " " + p317[i28 + 1].strip())
G29 = norm_stem(line_after_dot(p317, "29. I ………… lunch"))
i30 = next(i for i, l in enumerate(p317) if "30. A: How can we have better" in l)
G30 = norm_stem(p317[i30].strip().split(".", 1)[1].strip() + " " + p317[i30 + 1].strip())
assert G27 == "They invited you to their party, ------- ?", G27
assert G28 == "A: What did the students want to do? B: They wanted to talk to the teacher ------- Ali met before.", G28
assert G29 == "I ------- lunch before I went out.", G29
assert G30 == "A: How can we have better streets? B: The traffic rules ------- by everyone.", G30
for o in ["do they", "didn’t we", "didn’t they", "don’t you",
          "whom", "when", "where", "which",
          "am eating", "will eat", "had eaten", "eat",
          "may obey", "must be obeyed", "obeyed", "has obeyed"]:
    assert o in full, o
Q_L30 = [
    q("g12-l30-1", 1, "grammar", G27, ["do they", "didn’t we", "didn’t they", "don’t you"], 2),
    q("g12-l30-2", 2, "grammar", G28, ["whom", "when", "where", "which"], 0),
    q("g12-l30-3", 3, "grammar", G29, ["am eating", "will eat", "had eaten", "eat"], 2),
    q("g12-l30-4", 4, "grammar", G30, ["may obey", "must be obeyed", "obeyed", "has obeyed"], 1),
]
# کلیدهای چاپی [c,a,c,b] — ترتیبِ چاپ حفظ شد
assert [it["answer"] for it in Q_L30] == [2, 0, 2, 1]

# ————— س۱۳: خوانداریِ احترام به بزرگ‌ترها (ص۳۱۷) → بانک l31 —————
elders = norm_stem(join_inclusive(p317, "It is very important for us to respect our elders",
                                  "appreciate their love and respect them."))
for frag in ["elders were not born elders; they were kids like us",
             "A few years hence we will also grow older",
             "their life experiences, their failures, their successes",
             "Respect and care for elders start with our parents",
             "they love us unconditionally"]:
    assert frag in elders, frag
T35 = norm_stem(line_after_dot(p317, "35. It is important to remember").split("a) True")[0].strip())
T36 = norm_stem(line_after_dot(p317, "36. The passage says that elders").split("a) True")[0].strip())
M37 = norm_stem(line_after_dot(p317, "37. What does “they”").split("a) future")[0].strip())
assert T35 == "It is important to remember that elders were not born elders.", T35
assert T36 == "The passage says that elders have nothing to share with us.", T36
assert M37 == "What does “they” in the third line of paragraph 2 refer to?", M37
Q_L31 = [
    q("g12-l31-1", 1, "grammar", f"{elders} — {T35}", ["True", "False"], 0),
    q("g12-l31-2", 2, "grammar", f"{elders} — {T36}", ["True", "False"], 1),
    q("g12-l31-3", 3, "grammar", f"{elders} — {M37}",
      ["future generations", "parents", "teachers", "lives"], 1),
]
# کلیدهای چاپی [a,b,b] — کلیدِ «37. ( b )» با فاصله‌های چاپی (کوئیرکِ r380-q38/r382-q38/r383-ق۳۸)
assert [it["answer"] for it in Q_L31] == [0, 1, 1]

# ————— س۱۴: خوانداریِ فرهنگِ لغت (ص۳۱۸) → بانک l32 —————
dictread = norm_stem(join_inclusive(p318, "A good dictionary gives the user information",
                                    "expand your vocabulary."))
for frag in ["spellings, pronunciations and definitions",
             "essential to know how to use a dictionary",
             "Read the Guide Words. These are the two words at the top of each page",
             "Read the Definitions. Once you find an entry",
             "Look for Collocations. Learning the meaning of a single word"]:
    assert frag in dictread, frag
T39 = norm_stem(line_after_dot(p318, "39. The passage says that good dictionaries").split("a)True")[0].strip())
T40 = norm_stem(line_after_dot(p318, "40. It is necessary").split("a)True")[0].strip())
i41 = next(i for i, l in enumerate(p318) if "41. According to the passage," in l)
M41 = norm_stem(p318[i41].strip().split(".", 1)[1].strip() + " " + p318[i41 + 1].strip())
assert T39 == "The passage says that good dictionaries give information about how to buy a dictionary.", T39
assert T40 == "It is necessary to know how to use a dictionary.", T40
assert M41 == "According to the passage, ------- are the two words at the top of each page that show the first and last entries on the page.", M41
Q_L32 = [
    q("g12-l32-1", 1, "grammar", f"{dictread} — {T39}", ["True", "False"], 1),
    q("g12-l32-2", 2, "grammar", f"{dictread} — {T40}", ["True", "False"], 0),
    q("g12-l32-3", 3, "grammar", f"{dictread} — {M41}",
      ["definitions", "guide words", "pronunciations", "spellings"], 1),
]
# کلیدهای چاپی [b,a,b]
assert [it["answer"] for it in Q_L32] == [1, 0, 1]

# ————— س۱۵: خوانداریِ آبی‌برق (ص۳۱۸) → بانک l33 —————
hydro = norm_stem(join_inclusive(p318, "Hydropower is a type of renewable energy",
                                 "they are saved for future."))
for frag in ["It uses water to make electricity",
             "the water cycle is an endless system",
             "it is called hydroelectric power or hydropower",
             "Turbines convert the water energy into electricity",
             "fewer fossil fuels are consumed each year"]:
    assert frag in hydro, frag
T44 = norm_stem(line_after_dot(p318, "44. A type of renewable").split("a) True")[0].strip())
T45 = norm_stem(line_after_dot(p318, "45. Turbines convert").split("a) True")[0].strip())
M46 = norm_stem(line_after_dot(p318, "46. The passage says that clean").split("a) hot")[0].strip())
M47 = norm_stem(line_after_dot(p318, "47. When fewer fossil").split("a) saved")[0].strip())
assert T44 == "A type of renewable energy is called hydropower.", T44
assert T45 == "Turbines convert the water energy into electricity.", T45
assert M46 == "The passage says that clean energy is used in some of countries to keep the cities------- .", M46
assert M47 == "When fewer fossil fuels are used each year, they are ------- for future.", M47
Q_L33 = [
    q("g12-l33-1", 1, "grammar", f"{hydro} — {T44}", ["True", "False"], 0),
    q("g12-l33-2", 2, "grammar", f"{hydro} — {T45}", ["True", "False"], 0),
    q("g12-l33-3", 3, "grammar", f"{hydro} — {M46}",
      ["hot", "renewable", "clean", "endless"], 2),
    q("g12-l33-4", 4, "grammar", f"{hydro} — {M47}",
      ["saved", "consumed", "used up", "decreased"], 0),
]
# کلیدهای چاپی [a,a,c,a]
assert [it["answer"] for it in Q_L33] == [0, 0, 2, 0]

# ————— س۱۶: حروفِ ربط (ص۳۱۹) → بانک l34 —————
C48 = norm_stem(line_after_dot(p319, "48. I get up early"))
C49 = norm_stem(line_after_dot(p319, "49. There is snow"))
assert C48 == "I get up early in the morning, ------- I make an omelet myself.", C48
assert C49 == "There is snow in the street, ------- it’s not too cold.", C49
assert "but, and, so, or" in full
CONJ = ["but", "and", "so", "or"]
Q_L34 = [
    q("g12-l34-1", 1, "grammar", C48, CONJ, 1),
    q("g12-l34-2", 2, "grammar", C49, CONJ, 0),
]
assert [it["options"][it["answer"]] for it in Q_L34] == ["and", "but"]
assert [it["answer"] for it in Q_L34] == [1, 0]
for it in Q_L34:
    assert sorted(it["options"]) == sorted(CONJ), it["id"]

# ————— س۱۸: مرتب‌سازیِ پاراگرافِ مورچه‌ها (ص۳۱۹) → بانک l35 (شش‌گزینه‌ای) —————
SENT_A = "Throughout the summer, they collect food for the winter season."
SENT_B = "they stick to the sweet and carry it to their home."
SENT_C = "Whenever they find sweet lying on the floor,"
SENT_D = "Ants are hardworking insects."
SENT_E = "As a result, they are known as helpful and active insects."
SENT_F = "Thus, in this way, they clean the floor."
for s in (SENT_A, SENT_B, SENT_C, SENT_D, SENT_E, SENT_F):
    assert s in full, s
ANTS = [SENT_A, SENT_B, SENT_C, SENT_D, SENT_E, SENT_F]  # ترتیبِ چاپِ a-f
# کلیدهای چاپی: 51.(d) 52.(a) 53.(c) 54.(b) 55.(f) 56.(e)
Q_L35 = [
    q("g12-l35-1", 1, "grammar", "مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۱ (جملهٔ آغازینِ پاراگراف): -------", ANTS, 3),
    q("g12-l35-2", 2, "grammar", "مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۲ در پاراگراف: -------", ANTS, 0),
    q("g12-l35-3", 3, "grammar", "مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۳ در پاراگراف: -------", ANTS, 2),
    q("g12-l35-4", 4, "grammar", "مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۴ در پاراگراف: -------", ANTS, 1),
    q("g12-l35-5", 5, "grammar", "مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۵ در پاراگراف: -------", ANTS, 5),
    q("g12-l35-6", 6, "grammar", "مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹) — جملاتِ درهم‌ریختهٔ a تا f؛ جایگاهِ ۵۶ (پایان‌بندیِ پاراگراف): -------", ANTS, 4),
]
assert [it["options"][it["answer"]] for it in Q_L35] == [SENT_D, SENT_A, SENT_C, SENT_B, SENT_F, SENT_E]
assert [it["answer"] for it in Q_L35] == [3, 0, 2, 1, 5, 4]
for it in Q_L35:
    assert len(it["options"]) == 6 and len(set(it["options"])) == 6, it["id"]

# ————— نشت‌سنج: محتوای مستثنی‌شده نباید در JSON باشد —————
LEAKS = ["Zohreh has invited everyone but Mina",       # س۱ (شنیداری)
         "Holy Defense",                                # س۲ گزینهٔ c (شنیداری)
         "Asadi Tusi",                                  # س۳ (شنیداریِ کلوژ)
         "Saffarzadeh",                                 # س۴ (شنیداریِ درست/غلط)
         "Iran is rich in oil resources",               # س۵ اضافیِ چاپی
         "by that boy yesterday",                       # س۱۰ (تایپی) — عینِ ساقهٔ چاپ
         "Roya was upset",                              # س۱۱ (تایپی — پاسخِ مدل)
         "could fix the car",                           # س۱۱ (تایپی — پاسخِ مدل)
         "An ostrich",                                  # س۱۲ (تایپی/تولیدی)
         "They feel honored",                           # ردیف ۳۸ (تایپی)
         "wash the dishes",                             # س۱۷ (تصویری-کلید)
         "Natural home of animals",                     # س۱۹ چیپ
         "Source of fresh air"]                         # س۱۹ چیپ
blob = json.dumps(d["lessons"], ensure_ascii=False)
for s in LEAKS:
    assert s not in blob, f"leak: {s}"

# ————— درج در سند —————
B29 = {"lesson": 29, "title": "نهایی خرداد ۱۴۰۰ — واژگان و تعریف و اصطلاح (س۶-س۸، ص۳۱۶)", "level": "چهارگزینه‌ای",
       "count": len(Q_L29), "questions": Q_L29}
B30 = {"lesson": 30, "title": "نهایی خرداد ۱۴۰۰ — گرامر (س۹، ص۳۱۷)", "level": "چهارگزینه‌ای",
       "count": len(Q_L30), "questions": Q_L30}
B31 = {"lesson": 31, "title": "نهایی خرداد ۱۴۰۰ — خوانداریِ احترام به بزرگ‌ترها (س۱۳، ص۳۱۷)", "level": "چهارگزینه‌ای",
       "count": len(Q_L31), "questions": Q_L31}
B32 = {"lesson": 32, "title": "نهایی خرداد ۱۴۰۰ — خوانداریِ فرهنگِ لغت (س۱۴، ص۳۱۸)", "level": "چهارگزینه‌ای",
       "count": len(Q_L32), "questions": Q_L32}
B33 = {"lesson": 33, "title": "نهایی خرداد ۱۴۰۰ — خوانداریِ آبی‌برق (س۱۵، ص۳۱۸)", "level": "چهارگزینه‌ای",
       "count": len(Q_L33), "questions": Q_L33}
B34 = {"lesson": 34, "title": "نهایی خرداد ۱۴۰۰ — حروفِ ربط (س۱۶، ص۳۱۹)", "level": "چهارگزینه‌ای",
       "count": len(Q_L34), "questions": Q_L34}
B35 = {"lesson": 35, "title": "نهایی خرداد ۱۴۰۰ — مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹)", "level": "شش‌گزینه‌ای",
       "count": len(Q_L35), "questions": Q_L35}
for b in (B29, B30, B31, B32, B33, B34, B35):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie5"] = {
    "extractedRound": "r384",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ پنجم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۴۰۰ (واریانتِ رشتهٔ ادبیات و علوم انسانی-علوم و معارف اسلامی)",
    "examPages": "pdf-p315-319 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p320-321 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p314→p315 (پایانِ کلیدِ برگهٔ قبل) و p321→p322 (آغازِ شهریور ۱۴۰۰ِ r383)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: ادبیات و علوم انسانی-علوم و معارف اسلامی — نوبت خرداد ماه سال ۱۴۰۰ (تاریخِ چاپی: ۱۸/۰۳/۱۴۰۰) — مدت ۱۲۰ دقیقه — ساعت شروع ۸ صبح — ۱۹ سکشن/۵۷ ردیف/بارم ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — «GOOD LUCK / جمع نمره ۴٠» — برگهٔ خواهرِ ریاضی-تجربی (ص۳۰۸-۳۱۴) جداگانه چاپ شده",
    "keyPages": "pdf-p320-321 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۵۰ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۲۹ کلید از ۲۹ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «1. True (a) 2. False (b) 3. sister» / «4. (b) 5. (c) 6. (b) 7. (a)» / «8. famous 9. final 10. taken 11. lived» / «12. False (b) 13.True (a) 14. False (b) 15. True (a)» / «16. (d) 17. (e) 18. (c) 19. (b)» / «20. absorb 21. introduction 22. hugged» / «23. (d) 24. (c) 25. (b)» / «26. come» / «27. (c) 28. (a) 29. (c) 30. (b)» / «31. was broken» / «35. (a) True 36. (b) False 37. ( b )» / «38. They feel honored.» / «39. (b) False 40. (a) True 41. (b) 42. entry 43. collocations» / «44. (a) True 45. (a) True 46. (c) 47.(a)» / «48. and 49. but» — بلوکِ درهمِ لایه برای س۱۱ (۳۲/۳۳) با داوریِ رندرِ ۳۰۰dpi (/tmp/qa-r384/p320-300.png): «32. Roya was upset because she had gotten a bad score.» / «33. John could fix the car if he were at home.» — پنجمین تکرارِ درسِ r380-ق۳۲",
    "sectionsTotal": 57,
    "sectionsExtracted": 29,
    "sectionsSkipped": 28,
    "items": 29,
    "bankCounts": [7, 4, 3, 3, 4, 2, 6],
    "keyPolicy": "همهٔ کلیدهای ۲۹ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ گزینه‌های مهندسی‌شده: بانکِ واژگانِ l29-ق۱-۳ به ترتیبِ چاپِ خودِ برگه (hugged, introduction, absorb, effectively) با اضافیِ چاپیِ هرگز-کلید (effectively) و چهارِ اصطلاحِ l29-ق۷ (شکلِ حروفِ چاپ c---- محترم: come در برابرِ cost/care/calm — هر چهار ۴حرفیِ c-دار)؛ تعریف‌یابیِ l29-ق۴-۶ به ترتیبِ چاپِ ستون B با اضافیِ «cry suddenly» هرگز-کلید؛ کلیدهای درست/غلطِ l31/l32/l33 سمانتیک‌اند و چرخش نمی‌پذیرند؛ گرامرِ l30 و حروفِ ربطِ l34 به ترتیبِ چاپ؛ بانکِ مرتب‌سازیِ l35 گزینه‌هایش را به ترتیبِ چاپِ a-f می‌چیند با کلیدهای چاپی [d,a,c,b,f,e] در اندیس‌های [3,0,2,1,5,4]",
    "engineNote": "هر ۲۹ آیتم MCQ (قراردادِ کارتِ g12)؛ l35 نخستین بانکِ شش‌گزینه‌ایِ مرتب‌سازیِ مخزن (الگویِ l9ِ r381 برای شش‌گزینه‌ای) — هر جایگاهِ ۵۱-۵۶ یک آیتم با هر شش جمله به‌عنوان گزینه؛ ساقه‌های خوانداریِ l31/l32/l33 هر سه متنِ کاملِ چاپی را در خود دارند (بزرگ‌ترها/فرهنگِ لغت/آبی‌برق)؛ ساقه‌های تعریف‌یابی دوبخشیِ فارسی (الگویِ r380-l5)؛ ساقه‌های A/B گرامر (ق۲۸/۳۰) دوبخطیِ بازجوش؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» چسبیده",
    "derivedKeys": {
        "S6": ["absorb", "introduction", "hugged"],
        "S7": ["in a quiet way", "the rise and fall of the sea", "for all time"],
        "S8": ["come"],
        "S9": ["didn’t they", "whom", "had eaten", "must be obeyed"],
        "S13": ["True", "False", "parents"],
        "S14": ["False", "True", "guide words"],
        "S15": ["True", "True", "clean", "saved"],
        "S16": ["and", "but"],
        "S18": ["Ants are hardworking insects.", "Throughout the summer, they collect food for the winter season.", "Whenever they find sweet lying on the floor,", "they stick to the sweet and carry it to their home.", "Thus, in this way, they clean the floor.", "As a result, they are known as helpful and active insects."],
    },
    "paperMap": "کشفِ این راند — نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه): دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ (پیش از presentation-forms؛ کلید با پاسخ‌های مدلِ نگارشِ Horses)؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸)؛ شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸)؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹)؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹)؛ برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ (۱۳/۰۶/۹۹)؛ شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ (۱۳/۰۶/۹۹)؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ (۰۱/۱۱/۹۹)؛ خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۲ + کلید ص۳۱۳-۳۱۴ (۱۹/۰۳/۱۴۰۰)؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ ← این راند؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۵ برگه استخراج شد، ۱۲ برگه باقی است",
    "skippedSections": [
        "س۱ (ردیف ۱-۳، شنیداریِ درست/غلط + کلوژ): مکالمهٔ زهره/مریم (مهمانیِ مینا) — صوتی-کلید (متنِ شنیداری چاپ نیست؛ پاورقیِ «Audio script (PDF) / Audio file (MP3)» در ص۳۱۵)؛ کلیدهای چاپی: 1.True(a)/2.False(b)/3.sister — در رسید حفظ شد",
        "س۲ (ردیف ۴-۷، شنیداری): مکالمهٔ شیلا/سمیرا (موزهٔ هنرهای مدرن/حرم/دفاع مقدس) — صوتی-کلید با گزینه‌های چاپی؛ کلیدهای چاپی: 4.(b)/5.(c)/6.(b)/7.(a)",
        "س۳ (ردیف ۸-۱۱، شنیداریِ کلوژ): متنِ فرهنگِ لغتِ اسادی توسی (لغت‌نامهٔ کهنِ پنجم‌قرنی) — صوتی-کلید؛ کلیدهای چاپی: 8.famous/9.final/10.taken/11.lived",
        "س۴ (ردیف ۱۲-۱۵، شنیداریِ درست/غلط): طاهره صفارزاده (شیراز/قرآن/ترجمهٔ ۱۳۸۰) — صوتی-کلید؛ کلیدهای چاپی: 12.False(b)/13.True(a)/14.False(b)/15.True(a)",
        "س۵ (ردیف ۱۶-۱۹، تصویری): «با توجه به تصاویر... یک جمله اضافی است» — چهار تصویر با داوریِ کاملِ رندر (ص۳۱۶): (16) پدرِ عصبانی به پسر (برگهٔ امتحان)→d، (17) توربین‌های بادی→e، (18) غذای چربِ خط‌خورده→c، (19) مردِ بالکن‌نشین با فنجان و کتاب→b؛ اضافیِ چاپی: a) Iran is rich in oil resources — هم‌خوانِ کلیدِ رسمی",
        "س۱۰ (ردیف ۳۱، شکلِ فعلِ باز): «The window ………. by that boy yesterday. (break)» — کلیدِ چاپیِ دقیق «was broken» (مجازیِ ماضی) — بدونِ گزینهٔ چاپی؛ کاندیدِ بانکِ تایپی",
        "س۱۱-س۱۲ (ردیف ۳۲-۳۴): جمله‌سازیِ درهم (پاسخِ مدل: «Roya was upset because she had gotten a bad score.» و «John could fix the car if he were at home.» — بلوکِ درهمِ لایه با داوریِ رندر) و ضمیرِ موصولی (کلیدِ بند-رأیی: which + جملهٔ دارای فعل، بارم ۰.۵+۰.۵) — کاندیدِ تایپی/تولیدی",
        "ردیف ۳۸ (پاسخِ مدلِ بزرگ‌ترها: «They feel honored.» بارم ۱) و ۴۲ («entry») و ۴۳ («collocations») — کاندیدِ تایپی",
        "س۱۷ (ردیف ۵۰، حرفِ ربط با تصویر): کلیدِ چاپیِ کامل «50. …..or you should wash the dishes.» (تخته‌شویی) ولی دستورِ سکشن «با استفاده از تصویر» است — تصویری-کلید (الگویِ r380-ردیف۱۶/r381/r382/r383-س۱۷)؛ کلید حفظ شد",
        "س۱۹ (ردیف ۵۷، نگارشِ تولیدی): پاراگرافِ Forests با چیپ‌های چاپی (Natural home of animals / Source of fresh air / Source of necessary things for man) — تولیدی با کلیدِ بند-رأیی",
    ],
    "printQuirks": [
        "سومین برگهٔ presentation-forms (ﺳﺆاﻻت/اﻣ ﺘﺤﺎن با شکستگیِ «اﻣ ﺘﺤﺎن» — برخلافِ اﻣﺘﺤﺎنِ چسبیدهٔ r382/r383) — متنِ انگلیسی و کلیدها لاتینِ سالم",
        "تاریخِ چاپیِ ۱۸/۰۳/۱۴۰۰ با «نوبت خرداد ماه سال 1400» — نخستین برگه از جفتِ خرداد ۱۴۰۰ (خواهرِ ریاضی-تجربی در ص۳۰۸-۳۱۲)",
        "نشانگرهای فارسیِ «١/٢/٣/٤/٥» در ستونِ ردیفِ سربرگ، جدا از نشانگرهای لاتینِ ق۱-۵۷",
        "بارمِ کسریِ «5/1» و «5/.» با خطِ موربِ چاپ (الگویِ r383)",
        "کلیدِ «13.True (a)» چسبیده بدونِ فاصله (برخلافِ «12. False (b)») در همان سطر",
        "کلیدِ «47.(a)» چسبیده بدونِ فاصله در برابرِ «46. (c)» با فاصله",
        "ق۴۶ «cities.………… .» — نقطهٔ چسبیده به واژه + نقطه‌چین + نقطهٔ پایانیِ جدا — پس از norm به «cities------- .» رسید",
        "«37. ( b )» — فاصله‌های چاپیِ داخلِ پرانتزِ کلید (چهارمین بار: r380-q38/r382-q38/r383-ق۳۸)",
        "پیشوندِ چاپیِ «a).» (پرانتز + نقطه) در جملاتِ س۱۸ — شش‌گزینه‌ایِ نخستینِ مخزن",
        "ق۳۵/۳۶ «a) True    b) False» هم‌سطرِ ساقه در ص۳۱۷ ولی ق۳۹ «a)True» بدونِ فاصله در ص۳۱۸",
        "آپاستروفِ خمیدهٔ یکدست در کلِ برگه (didn’t we/didn’t they/it’s) — عینِ چاپ حفظ شد",
        "بلوکِ کلیدِ RTLِ درهمِ س۱۱ («Roya/was upset/score/a bad» سطرشکن) — داوریِ رندرِ ۳۰۰dpi",
    ],
    "futureNote": "بخشِ ۴ اکنون نقشهٔ کاملِ ۱۷برگه‌ای دارد (ص۲۲۸-۳۴۹) — ۵ برگه استخراج شد، ۱۲ برگه باقی است (نزدیک‌ترین‌ها: خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ و دی ۱۳۹۹ ص۳۰۱-۳۰۷؛ به‌علاوهٔ برگهٔ لایه‌خرابِ ص۲۷۷-۲۸۴ که OCR/رندر می‌خواهد و جفتِ ۱۳۹۷ با کلیدِ سربرگِ قدیمی)؛ کاندیدهای تایپیِ این برگه (س۱۰ «was broken» + ردیف‌های ۳۲/۳۳/۳۴/۳۸/۴۲/۴۳) به کاندیدهای r380/r381/r382/r383 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۳۴ ردیف است (۲۷ِ r383 + ۷ ردیفِ تازه)",
}
d["source"]["g12nahaie5"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r384 OK — banks={len(d['lessons'])} items={total} (+29 in 7 banks: l29=7 l30=4 l31=3 l32=3 l33=4 l34=2 l35=6) — نهایی خرداد ۱۴۰۰ (انسانی) با کلیدِ رسمی")
