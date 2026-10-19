#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r383 — برگهٔ چهارمِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۴۰۰
(تاریخِ چاپی ۲۴/۰۶/۱۴۰۰؛ pdf-p322-326 آزمون + کلیدِ رسمیِ «راهنمای تصحيح» pdf-p327-328)
→ tests-g12.json با ۷ بانکِ تازه (l22=5؛ l23=7؛ l24=4؛ l25=4؛ l26=4؛ l27=2؛ l28=2)
— ۲۱ بانکِ قبلی + این = ۲۸ بانک/۴۲۱ آیتم

ساختار آزمون (۱۹ سکشن، ۵۵ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۵ صفحه، شروع ۸ صبح):
  س۱ (۱-۴)    شنیداریِ درست/غلط (متنِ فرهنگِ لغت) — صوتی-کلید — مستثنی (کلید: 1.False(b)/2.True(a)/3.False(b)/4.True(a))
  س۲ (۵-۷)    شنیداری (پدر و پسر، پیک‌نیک) — صوتی-کلید — مستثنی (کلید: 5.(b)/6.(a)/7.(c))
  س۳ (۸-۱۱)   شنیداری (مهران/بیژن) — صوتی-کلید — مستثنی (کلید: 8.(b)/9.(b)/10.(a)/11.(c))
  س۴ (۱۲-۱۶)  کلوژِ مکالمهٔ چاپیِ «پزشکانِ ایران» (سارا/پرستار، بو علی سینا) — کلیدِ چاپی → بانک l22 (پنج‌گزینه‌ای)
  س۵ (۱۷-۲۰)  تصویری (یک جمله اضافی) — تصویری-کلید — مستثنی با داوریِ کاملِ رندر (17.(c)/18.(a)/19.(d)/20.(e))
  س۶ (۲۱-۲۳)  بانکِ ۴واژه‌ای (forgive اضافیِ چاپی) → بانک l23
  س۷ (۲۴-۲۶)  تعریف‌یابی A/B (یک تعریف اضافی) → بانک l23
  س۸ (۲۷)     اصطلاحِ «too many cooks s---- the broth» → بانک l23
  س۹ (۲۸-۳۱)  گرامر MCQ → بانک l24
  س۱۰ (۳۲)    شکلِ فعلِ باز (had got/gotten) — کلیدِ چاپیِ دقیق — مستثنی؛ کاندیدِ بانکِ تایپی
  س۱۱ (۳۳-۳۴) جمله‌سازیِ درهم — پاسخِ مدلِ چاپی (بلوکِ درهمِ لایه، داوریِ رندر ۳۰۰dpi) — مستثنی؛ کاندیدِ تایپی
  س۱۲ (۳۵)    ضمیرِ موصولی (which + جملهٔ دارای فعل، ۰.۵+۰.۵) — مستثنی
  س۱۳ (۳۶-۴۰) خوانداریِ خودروی برقی: ۳۶-۳۹ → بانک l25؛ ۴۰ (portable device) پاسخِ مدل — کاندیدِ تایپی
  س۱۴ (۴۱-۴۴) خوانداریِ فرهنگِ لغت: هر چهار ردیف → بانک l26
  س۱۵ (۴۵-۴۸) خوانداریِ احترام به طبیعت: ۴۵-۴۶ → بانک l27؛ ۴۷-۴۸ پاسخِ مدل (بلوکِ درهم) — کاندیدِ تایپی
  س۱۶ (۴۹-۵۰) حروفِ ربط (بانکِ چاپی but, and, so, or) → بانک l28
  س۱۷ (۵۱)    حرفِ ربط با تصویر (make an omelet) — کلیدِ چاپیِ کامل («51.. …..and I make an omelet.») — مستثنی (کلید حفظ شد)
  س۱۸ (۵۲-۵۴) جملهٔ موضوعی (Smoking/Hafez/Technology) — تولیدی — مستثنی
  س۱۹ (۵۵)    پاراگرافِ Wind towers با چیپ‌های چاپی — تولیدی — مستثنی
idempotent: اجرای دوم NO-OP (رسید g12nahaie4).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie4" in d.get("source", {}):
    print("r383: receipt g12nahaie4 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie3" in d.get("source", {}), "tests-g12.json (r382) must exist first"
assert len(d["lessons"]) == 21, f"expected 21 banks before r383, got {len(d['lessons'])}"

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


p322 = page_slice(322)
p323 = page_slice(323)
p324 = page_slice(324)
p325 = page_slice(325)
p326 = page_slice(326)
p327 = page_slice(327)
p328 = page_slice(328)
full = "\n".join(p322 + p323 + p324 + p325 + p326 + p327 + p328)


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


# ————— پیمانِ سربرگِ آزمون (ص۳۲۲ — presentation-forms، الگوی r382) —————
assert any("ﺳﺆاﻻت  اﻣﺘﺤﺎن" in l for l in p322)
assert any("1400" in l for l in p322)
assert any("aee.medu.ir" in l for l in p322)
assert any("ﺻﻔﺤﺎت:5" in l for l in p322)
assert any("ﺷﻬﺮﯾﻮر" in l for l in p322)

# ————— پیمانِ کلیدِ رسمی (ص۳۲۷-۳۲۸) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p327)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p328)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p327 + p328 if l.strip()))
assert "24 / 06 / 1400" in keyjoin, "تاریخِ کلید = تاریخِ برگه"
KEY_FRAGS = ["1. False (b)", "2.True (a)", "3. False (b)", "4. True (a)",
             "5. (b)", "6. (a)", "7. (c)",
             "8. (b)", "9. (b)", "10. (a)", "11. (c)",
             "12. medicine", "13.history", "14. Persian", "15. life", "16. take",
             "17. (c)", "18. (a)", "19. (d)", "20. (e)",
             "21. variety", "22. arrange", "23. absorb",
             "24. (a)", "25. (d)", "26. (b)", "27. spoil",
             "28. (d)", "29. (a)", "30. (c)", "31. (c)", "32. had got/gotten",
             "36. (a) True", "37. (b) False", "38. ( c )", "39. (b)", "40. portable device",
             "41. (b) False", "42. (a) True", "43. (b)", "44. (a)",
             "45. (b) False", "46. (a) True",
             "49. or", "50. but",
             "51..", "and I make an omelet."]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# بلوک‌های درهمِ لایه (س۱۱ و س۱۵) — فرگمنت‌های واقعی؛ کلیدِ کامل با داوریِ رندر
for frag in ["went to the zoo", "fore", "a bear", "had never seen", "Sara",
             "were at home", "oom", "her", "would clean", "My sister",
             "in your yard or in your favorite park", "You can do th",
             "of our world and are", "that all living creatures are part",
             "You should remind your children", "valuable in the natural environment",
             "http://aee.medu.ir"]:
    assert frag in keyjoin, f"scrambled key layer fragment missing: {frag}"

# ————— س۴: کلوژِ «پزشکانِ ایران» (ص۳۲۲) → بانک l22 —————
meds = norm_stem(join_inclusive(p322, "Sara: It is so good", "exciting trip!"))
for frag in ["rich in-------(12)------- .", "Back in -------(13)-------, we can mention Avicenna",
             "a great -------(14)------- physician", "His -------(15)------- is a source of inspiration",
             "to -------(16)------- us to Hamedan"]:
    assert frag in meds, frag
assert "That's so nice" in meds, "آپاستروفِ مستقیمِ چاپ در That's — عینِ چاپ"
UNI22 = ["medicine", "history", "Persian", "life", "take"]
Q_L22 = [
    q("g12-l22-1", 1, "vocab", f"{meds} — پاسخِ خانهٔ (12): -------",
      ["history", "life", "medicine", "Persian", "take"], 2),
    q("g12-l22-2", 2, "vocab", f"{meds} — پاسخِ خانهٔ (13): -------",
      ["Persian", "medicine", "take", "life", "history"], 4),
    q("g12-l22-3", 3, "vocab", f"{meds} — پاسخِ خانهٔ (14): -------",
      ["Persian", "take", "life", "history", "medicine"], 0),
    q("g12-l22-4", 4, "vocab", f"{meds} — پاسخِ خانهٔ (15): -------",
      ["take", "history", "Persian", "life", "medicine"], 3),
    q("g12-l22-5", 5, "vocab", f"{meds} — پاسخِ خانهٔ (16): -------",
      ["life", "take", "medicine", "Persian", "history"], 1),
]
assert [it["options"][it["answer"]] for it in Q_L22] == UNI22
assert [it["answer"] for it in Q_L22] == [2, 4, 0, 3, 1]
for it in Q_L22:
    assert sorted(it["options"]) == sorted(UNI22) and len(set(it["options"])) == 5, it["id"]

# ————— س۶: بانکِ واژگان (ص۳۲۳) → بانک l23 —————
S21 = norm_stem(line_after_dot(p323, "21.They do a"))
S22 = norm_stem(line_after_dot(p323, "22. We’ll need to"))
S23 = norm_stem(line_after_dot(p323, "23. Plants"))
assert S21 == "They do a ------- of fitness activities.", S21
assert S22 == "We’ll need to -------the chairs around the table.", S22
assert S23 == "Plants -------carbon dioxide.", S23
assert "absorb, variety, forgive, arrange" in full
POOL23 = ["absorb", "variety", "forgive", "arrange"]
Q21_23 = [
    q("g12-l23-1", 1, "vocab", S21, POOL23, 1),
    q("g12-l23-2", 2, "vocab", S22, POOL23, 3),
    q("g12-l23-3", 3, "vocab", S23, POOL23, 0),
]
assert [it["options"][it["answer"]] for it in Q21_23] == ["variety", "arrange", "absorb"]
for it in Q21_23:
    assert it["options"][it["answer"]] != "forgive", it["id"]

# ————— س۷: تعریف‌یابی A/B (ص۳۲۳) → بانک l23 —————
S24 = "This book has only a two-page introduction."
S25 = "If you know how to study more effectively, you’ll be able to learn more."
S26 = "I have kept a diary for twelve years."
assert S24 in full and S25 in full and S26 in full
DEFS = ["the part at the beginning of a book that gives a general idea of what it is about",
        "a book in which you record your thoughts or feelings or what has happened every day",
        "cry suddenly",
        "in a way that is successful and achieves what you want"]
for df in DEFS:
    assert df in full, df
Q24_26 = [
    q("g12-l23-4", 4, "vocab", f"«{S24}» — تعریفِ ستون B برای واژهٔ «introduction»: -------", DEFS, 0),
    q("g12-l23-5", 5, "vocab", f"«{S25}» — تعریفِ ستون B برای واژهٔ «effectively»: -------", DEFS, 3),
    q("g12-l23-6", 6, "vocab", f"«{S26}» — تعریفِ ستون B برای واژهٔ «diary»: -------", DEFS, 1),
]
assert [it["options"][it["answer"]] for it in Q24_26] == [DEFS[0], DEFS[3], DEFS[1]]
for it in Q24_26:
    assert it["options"][it["answer"]] != DEFS[2], it["id"]

# ————— س۸: اصطلاح (ص۳۲۳) — ساقهٔ دوبخطی با گیومهٔ خمیدهٔ چاپ —————
i27 = next(i for i, l in enumerate(p323) if "too many people trying to lead" in l)
S27 = norm_stem(p323[i27].strip().split(".", 1)[1].strip() + " " + p323[i27 + 1].strip())
assert S27 == "When there are too many people trying to lead, it’s confusing and leads to bad results. You know that “too many cooks s - - - - the broth”.", S27
Q27 = q("g12-l23-7", 7, "vocab", S27,
        ["spoil", "spice", "spare", "shine"], 0)

Q_L23 = Q21_23 + Q24_26 + [Q27]

# ————— س۹: گرامر MCQ (ص۳۲۴) → بانک l24 —————
G28 = norm_stem(line_after_dot(p324, "28. You haven’t done"))
i29 = next(i for i, l in enumerate(p324) if "29. A: What did you find?" in l)
G29 = norm_stem(p324[i29].strip().split(".", 1)[1].strip() + " " + p324[i29 + 1].strip())
i30 = next(i for i, l in enumerate(p324) if "30. A: How can the teachers" in l)
G30 = norm_stem(p324[i30].strip().split(".", 1)[1].strip() + " " + p324[i30 + 1].strip())
i31 = next(i for i, l in enumerate(p324) if "31. A: This question is very hard" in l)
G31 = norm_stem(p324[i31].strip().split(".", 1)[1].strip() + " " + p324[i31 + 1].strip())
assert G28 == "You haven’t done your homework, -------?", G28
assert G29 == "A: What did you find? B: I found the keys ------- I lost yesterday..", G29
assert G30 == "A: How can the teachers talk to the parents? B: The parents ------- by the principal.", G30
assert G31 == "A: This question is very hard, and I can’t solve it. B: If our friends came here, we ------- them for help.", G31
for o in ["haven’t you", "haven’t I", "does your homework", "have you",
          "which", "who", "where", "whom",
          "may call", "have called", "should be called", "are calling",
          "may ask", "were asked", "could ask", "were asking"]:
    assert o in full, o
Q_L24 = [
    q("g12-l24-1", 1, "grammar", G28, ["haven’t you", "haven’t I", "does your homework", "have you"], 3),
    q("g12-l24-2", 2, "grammar", G29, ["which", "who", "where", "whom"], 0),
    q("g12-l24-3", 3, "grammar", G30, ["may call", "have called", "should be called", "are calling"], 2),
    q("g12-l24-4", 4, "grammar", G31, ["may ask", "were asked", "could ask", "were asking"], 2),
]
# کلیدهای چاپی [d,a,c,c] — دو cِ پیاپی (۳۰/۳۱) سمانتیک‌اند؛ ترتیبِ چاپ حفظ شد
assert [it["answer"] for it in Q_L24] == [3, 0, 2, 2]

# ————— س۱۳: خوانداریِ خودروی برقی (ص۳۲۴) → بانک l25 —————
cars = norm_stem(join_inclusive(p324, "Many countries now think", "instead."))
for frag in ["don’t burn gasoline in the engine, so they don’t pollute the air",
             "12 or 24 batteries, or more, are needed to power the car",
             "remote-controlled car", "flashlights or in regular gasoline cars",
             "portable devices you carry around every day: your cell phone, MP3 player, or digital camera",
             "a much bigger gadget that carries you around instead"]:
    assert frag in cars, frag
# ق۳۶ دوبخطی با «a)True      b) False» چسبیده به خطِ دوم
i36 = next(i for i, l in enumerate(p325) if "36. According to the passage" in l)
raw36 = p325[i36].strip().split(".", 1)[1].strip() + " " + p325[i36 + 1].strip().split("a)True")[0].strip()
T36 = norm_stem(raw36)
T37 = norm_stem(line_after_dot(p325, "37. Electric cars always"))
M38 = norm_stem(line_after_dot(p325, "38. Electric cars use"))
M39 = norm_stem(line_after_dot(p325, "39. The passage says"))
assert T36 == "According to the passage, many countries think that cars that use fossil fuels should be replaced by electric cars.", T36
assert T37 == "Electric cars always burn gasoline in the engine.", T37
assert M38 == "Electric cars use electricity ------- the car in batteries.", M38
assert M39 == "The passage says to get the battery in electric cars ready to -------, you have to charge it.", M39
Q_L25 = [
    q("g12-l25-1", 1, "grammar", f"{cars} — {T36}", ["True", "False"], 0),
    q("g12-l25-2", 2, "grammar", f"{cars} — {T37}", ["True", "False"], 1),
    q("g12-l25-3", 3, "grammar", f"{cars} — {M38}",
      ["consumed by", "replaced in", "stored on", "polluted"], 2),
    q("g12-l25-4", 4, "grammar", f"{cars} — {M39}",
      ["produce", "roll", "carry", "deal"], 1),
]
# کلیدهای چاپی [a,b,c,b] — «( c )» با فاصله‌های چاپی در کلید (کوئیرکِ r380-q38/r382-q38)
assert [it["answer"] for it in Q_L25] == [0, 1, 2, 1]

# ————— س۱۴: خوانداریِ فرهنگِ لغت (ص۳۲۵) → بانک l26 —————
dictread = norm_stem(join_inclusive(p325, "It is very important for students", "stand for."))
for frag in ["a dictionary gives the users a lot of information",
             "Choose the Right Dictionary", "learner’s dictionaries, general dictionaries and etc",
             "Read the Definitions", "Learn the Abbreviations"]:
    assert frag in dictread, frag
T41 = norm_stem(line_after_dot(p325, "41. According to the passage"))
T42 = norm_stem(line_after_dot(p325, "42. Dictionary users"))
M43 = norm_stem(line_after_dot(p325, "43. You can find"))
M44 = norm_stem(line_after_dot(p325, "44. If the user does not"))
assert T41 == "According to the passage, there is only one type of good dictionary.", T41
assert T42 == "Dictionary users should know their needs.", T42
assert M43 == "You can find the exact meaning of a word when you find its -------", M43  # بدونِ نقطهٔ پایانیِ چاپ — عینِ چاپ
assert M44 == "If the user does not know what the abbreviations stand for, it will be ------- to understand it.", M44
assert "c)surprising" in full, "گزینهٔ چسبیدهٔ چاپ"
Q_L26 = [
    q("g12-l26-1", 1, "grammar", f"{dictread} — {T41}", ["True", "False"], 1),
    q("g12-l26-2", 2, "grammar", f"{dictread} — {T42}", ["True", "False"], 0),
    q("g12-l26-3", 3, "grammar", f"{dictread} — {M43}",
      ["learner’s dictionary", "entry", "part of speech", "origin"], 1),
    q("g12-l26-4", 4, "grammar", f"{dictread} — {M44}",
      ["confusing", "boring", "surprising", "easy"], 0),
]
# کلیدهای چاپی [b,a,b,a]
assert [it["answer"] for it in Q_L26] == [1, 0, 1, 0]

# ————— س۱۵: خوانداریِ احترام به طبیعت (ص۳۲۵) → بانک l27 —————
nature = norm_stem(join_inclusive(p325, "Respect is not only for people", "in the natural environment."))
for frag in ["teach it to your next generation", "blueness of the sky",
             "touch trees, rocks and leaves", "practice identifying them",
             "buy a plant for each child"]:
    assert frag in nature, frag
# ق۴۵/۴۶ با «a)True      b) False» چسبیده به همان خط
T45 = norm_stem(next(l for l in p326 if "45. According to the passage" in l).strip().split(".", 1)[1].strip().split("a)True")[0].strip())
T46 = norm_stem(next(l for l in p326 if "46. Our next generations" in l).strip().split(".", 1)[1].strip().split("a)True")[0].strip())
assert T45 == "According to the passage, people should only respect other people.", T45
assert T46 == "Our next generations need to know about nature and its value.", T46
Q_L27 = [
    q("g12-l27-1", 1, "grammar", f"{nature} — {T45}", ["True", "False"], 1),
    q("g12-l27-2", 2, "grammar", f"{nature} — {T46}", ["True", "False"], 0),
]
# کلیدهای چاپی [b,a]
assert [it["answer"] for it in Q_L27] == [1, 0]

# ————— س۱۶: حروفِ ربط (ص۳۲۶) → بانک l28 —————
C49 = norm_stem(line_after_dot(p326, "49. I go out tonight"))
C50 = norm_stem(line_after_dot(p326, "50. Mary studies"))
assert C49 == "I go out tonight, -------I take a rest at home.", C49
assert C50 == "Mary studies a lot , -------she can’t pass the exam.", C50
assert "but, and, so, or" in full
CONJ = ["but", "and", "so", "or"]
Q_L28 = [
    q("g12-l28-1", 1, "grammar", C49, CONJ, 3),
    q("g12-l28-2", 2, "grammar", C50, CONJ, 0),
]
assert [it["options"][it["answer"]] for it in Q_L28] == ["or", "but"]
assert [it["answer"] for it in Q_L28] == [3, 0]
for it in Q_L28:
    assert sorted(it["options"]) == sorted(CONJ), it["id"]

# ————— نشت‌سنج: محتوای مستثنی‌شده نباید در JSON باشد —————
LEAKS = ["A friend in need, is a friend indeed",       # س۳ (شنیداری)
         "flew kites",                                  # س۲ گزینهٔ c
         "saved some money to buy",                     # س۳ ق۹
         "Hamid sits on the sofa and watches TV all the time",  # س۵ اضافیِ چاپی
         "Wind turbines are used to produce electricity from wind power",  # س۵ گزینهٔ d (تصویری)
         "had got/gotten",                              # س۱۰ (تایپی)
         "make an omelet",                              # س۱۷ (تصویری-کلید)
         "Wind towers",                                 # س۱۹
         "Topic sentence",                              # س۱۸
         "Hafez",                                       # س۱۸
         "flying kites"]                                # س۲ (واژهٔ متنِ شنیداری)
blob = json.dumps(d["lessons"], ensure_ascii=False)
for s in LEAKS:
    assert s not in blob, f"leak: {s}"

# ————— درج در سند —————
B22 = {"lesson": 22, "title": "نهایی شهریور ۱۴۰۰ — کلوژِ مکالمهٔ پزشکان (س۴، ص۳۲۲)", "level": "پنج‌گزینه‌ای",
       "count": len(Q_L22), "questions": Q_L22}
B23 = {"lesson": 23, "title": "نهایی شهریور ۱۴۰۰ — واژگان و تعریف و اصطلاح (س۶-س۸، ص۳۲۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L23), "questions": Q_L23}
B24 = {"lesson": 24, "title": "نهایی شهریور ۱۴۰۰ — گرامر (س۹، ص۳۲۴)", "level": "چهارگزینه‌ای",
       "count": len(Q_L24), "questions": Q_L24}
B25 = {"lesson": 25, "title": "نهایی شهریور ۱۴۰۰ — خوانداریِ خودروی برقی (س۱۳، ص۳۲۴-۳۲۵)", "level": "چهارگزینه‌ای",
       "count": len(Q_L25), "questions": Q_L25}
B26 = {"lesson": 26, "title": "نهایی شهریور ۱۴۰۰ — خوانداریِ فرهنگِ لغت (س۱۴، ص۳۲۵)", "level": "چهارگزینه‌ای",
       "count": len(Q_L26), "questions": Q_L26}
B27 = {"lesson": 27, "title": "نهایی شهریور ۱۴۰۰ — خوانداریِ احترام به طبیعت (س۱۵، ص۳۲۵)", "level": "چهارگزینه‌ای",
       "count": len(Q_L27), "questions": Q_L27}
B28 = {"lesson": 28, "title": "نهایی شهریور ۱۴۰۰ — حروفِ ربط (س۱۶، ص۳۲۶)", "level": "چهارگزینه‌ای",
       "count": len(Q_L28), "questions": Q_L28}
for b in (B22, B23, B24, B25, B26, B27, B28):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie4"] = {
    "extractedRound": "r383",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ چهارم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۴۰۰",
    "examPages": "pdf-p322-326 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p327-328 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p321→p322 (پایانِ کلیدِ برگهٔ قبل) و p328→p329 (آغازِ دی ۱۴۰۰ِ r382)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: کلیه رشته‌ها — نوبت شهریور ۱۴۰۰ (تاریخِ چاپی: ۲۴/۰۶/۱۴۰۰ — ارقامِ چاپیِ سالم، برخلافِ r380) — مدت ۱۲۰ دقیقه — ساعت شروع ۸ صبح — ۱۹ سکشن/۵۵ ردیف/بارم ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — «GOOD LUCK / نمره 40»",
    "keyPages": "pdf-p327-328 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۴۸ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۲۸ کلید از ۲۸ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «1. False (b) 2.True (a) 3. False (b) 4. True (a)» / «5. (b) 6. (a) 7. (c)» / «8. (b) 9. (b) 10. (a) 11. (c)» / «12. medicine 13.history 14. Persian 15. life 16. take» / «17. (c) 18. (a) 19. (d) 20. (e)» / «21. variety 22. arrange 23. absorb» / «24. (a) 25. (d) 26. (b)» / «27. spoil» / «28. (d) 29. (a) 30. (c) 31. (c)» / «36. (a) True 37. (b) False 38. ( c ) 39. (b)» / «41. (b) False 42. (a) True 43. (b) 44. (a)» / «45. (b) False 46. (a) True» / «49. or 50. but» — بلوک‌های درهمِ لایه برای س۱۱ (۳۳/۳۴) و س۱۵ (۴۷/۴۸) با داوریِ رندرِ ۳۰۰dpi (/tmp/qa-r383/p327-s11-key.png و p328-s15-key.png): «33. Sara had never seen a bear before she went to the zoo.» / «34. My sister would clean her room if she were at home.» / «47. You can do this in your yard or in your favorite park.» / «48. You should remind your children that all living creatures are parts of our world and are valuable in the natural environment.»",
    "sectionsTotal": 55,
    "sectionsExtracted": 28,
    "sectionsSkipped": 27,
    "items": 28,
    "bankCounts": [5, 7, 4, 4, 4, 2, 2],
    "keyPolicy": "همهٔ کلیدهای ۲۸ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ گزینه‌های مهندسی‌شده: بانکِ کلوژِ l22 (استخرِ پنج‌واژه‌ایِ خودِ کلید — پنجمین چینشِ متمایز [2,4,0,3,1] پس از r380-l4/r381-l8-l9/r382-l16) و چهارِ اصطلاحِ l23-ق۷ (شکلِ حروفِ چاپ s---- محترم: spoil در برابرِ spice/spare/shine — هر چهار ۵حرفیِ s-دار)؛ کلیدهای درست/غلطِ l25/l26/l27 سمانتیک‌اند و چرخش نمی‌پذیرند؛ گرامرِ l24 دو cِ پیاپی در ۳۰/۳۱ دارد — ترتیبِ چاپ حفظ شد؛ بانکِ l28 به ترتیبِ دستورِ چاپ (but, and, so, or) با کلیدهای [or, but] در [3,0]",
    "engineNote": "هر ۲۸ آیتم MCQ (قراردادِ کارتِ g12)؛ ساقه‌های خوانداریِ l25/l26/l27 هر سه متنِ کاملِ چاپی را در خود دارند (خودرویِ برقی/فرهنگِ لغت/احترام به طبیعت)؛ ساقه‌های کلوژِ س۴ متنِ چاپی + «پاسخِ خانهٔ (N)» (الگویِ r380-l4/r381-l8-l9/r382-l16)؛ ساقه‌های تعریف‌یابی دوبخشیِ فارسی (الگویِ r380-l5)؛ ساقه‌های A/B گرامر (ق۲۹/۳۰/۳۱) دوبخطیِ بازجوش؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» چسبیده",
    "derivedKeys": {
        "S4": ["medicine", "history", "Persian", "life", "take"],
        "S6": ["variety", "arrange", "absorb"],
        "S7": ["the part at the beginning of a book that gives a general idea of what it is about", "in a way that is successful and achieves what you want", "a book in which you record your thoughts or feelings or what has happened every day"],
        "S8": ["spoil"],
        "S9": ["have you", "which", "should be called", "could ask"],
        "S13": ["True", "False", "stored on", "roll"],
        "S14": ["False", "True", "entry", "confusing"],
        "S15": ["False", "True"],
        "S16": ["or", "but"],
    },
    "paperMap": "نقشهٔ paperMapِ r382 تأیید و گسترش یافت: برگهٔ چهارم (شهریور ۱۴۰۰، ص۳۲۲-۳۲۸) استخراج شد — تاریخِ چاپی ۲۴/۰۶/۱۴۰۰ و «نوبت شهریور ماه سال 1400» در سربرگ؛ کلیدِ ص۳۲۷-۳۲۸ با همان تاریخ؛ باقیِ برگه‌های ص۲۲۸-۳۲۱ هنوز پروبِ سال نشده‌اند (kandidatِ راندهای بعدی — p320-321 کلیدِ برگهٔ پیشین است)",
    "skippedSections": [
        "س۱ (ردیف ۱-۴، شنیداریِ درست/غلط): متنِ «فرهنگِ لغت» — صوتی-کلید (متنِ شنیداری چاپ نیست)؛ کلیدهای چاپی: 1.False(b)/2.True(a)/3.False(b)/4.True(a) — در رسید حفظ شد",
        "س۲ (ردیف ۵-۷، شنیداری): مکالمهٔ پدر و پسر (پیک‌نیک/والیبال/بادبادک) — صوتی-کلید با گزینه‌های چاپی؛ کلیدهای چاپی: 5.(b)/6.(a)/7.(c)",
        "س۳ (ردیف ۸-۱۱، شنیداری): مکالمهٔ مهران/بیژن («A friend in need, is a friend indeed») — صوتی-کلید؛ کلیدهای چاپی: 8.(b)/9.(b)/10.(a)/11.(c)",
        "س۵ (ردیف ۱۷-۲۰، تصویری): «با توجه به تصاویر... یک جمله اضافی است» — چهار تصویر با داوریِ کاملِ رندر (ص۳۲۳): (17) زغالِ گاری+بشکه+کپسولِ گاز→c، (18) پدرِ سالخورده در آغوشِ پسر→a، (19) ترسیمِ توربین‌های بادی→d، (20) پسرِ گیج با انگشت بر شقیقه→e؛ اضافیِ چاپی: b) Hamid sits on the sofa and watches TV all the time — هم‌خوانِ کلیدِ رسمی",
        "س۱۰ (ردیف ۳۲، شکلِ فعلِ باز): کلیدِ چاپیِ دقیق «had got/gotten» (دو شکلِ مجازِ چاپ — برخلافِ «had seen» تک‌شکلیِ r382) — بدونِ گزینهٔ چاپی؛ کاندیدِ بانکِ تایپی",
        "س۱۱-س۱۲ (ردیف ۳۳-۳۵): جمله‌سازیِ درهم (پاسخِ مدل: «Sara had never seen a bear before she went to the zoo.» و «My sister would clean her room if she were at home.» — بلوکِ درهمِ لایه با داوریِ رندر) و ضمیرِ موصولی (کلیدِ بند-رأیی: which + جملهٔ دارای فعل، بارم ۰.۵+۰.۵) — کاندیدِ تایپی/تولیدی",
        "ردیف ۴۰ (پاسخِ مدلِ خودروی برقی: «portable device» بارم ۱) — کاندیدِ تایپی؛ ردیف ۴۷ («You can do this in your yard or in your favorite park.» — عبارتِ زیرخط‌دارِ چاپ) و ۴۸ («You should remind your children that all living creatures are parts of our world and are valuable in the natural environment.» — بلوکِ درهم، داوریِ رندر) — کاندیدِ تایپی",
        "س۱۷ (ردیف ۵۱، حرفِ ربط با تصویر): کلیدِ چاپیِ کامل «51.. …..and I make an omelet.» (نشانگرِ دودانهٔ چاپ «51..») ولی دستورِ سکشن «با استفاده از تصویر» است — تصویری-کلید (الگویِ r380-ردیف۱۶/r381/r382-س۱۷)؛ کلید حفظ شد",
        "س۱۸-س۱۹ (ردیف ۵۲-۵۵، نگارشِ تولیدی): سه جملهٔ موضوعی (Smoking/Hafez/Technology) و پاراگرافِ Wind towers با چیپ‌های چاپی (In Yazd’s buildings / Natural air cooling system / Source of clean energy) — تولیدی با کلیدِ بند-رأیی",
    ],
    "printQuirks": [
        "دومین برگهٔ presentation-forms (ﺳﺆاﻻت/اﻣﺘﺤﺎن/ﭘﺎﯾﻪ) — همان تایپوگرافیِ r382؛ متنِ انگلیسی و کلیدها لاتینِ سالم",
        "نشانگرِ «21.They» چسبیده بدونِ فاصله (برخلافِ «22. » با فاصله) در همان سکشن",
        "کلیدِ «13.history» چسبیده بدونِ فاصله (برخلافِ «12. medicine»)",
        "«38. ( c )» — فاصله‌های چاپیِ داخلِ پرانتزِ کلید (همان کوئیرکِ r380-q38 و r382-q38)",
        "ق۵۰ «Mary studies a lot , ……….» — فاصلهٔ پیش از ویرگول — عینِ چاپ",
        "ق۲۹ «I lost yesterday..» — دونقطهٔ پایانیِ چاپ — verbatim در ساقه",
        "«51.. …..and I make an omelet.» — نشانگرِ دودانهٔ «51..» در کلید",
        "آپاستروفِ مخلوط در یک جمله: «That's» مستقیم در کنارِ «I’ll» خمیده (س۴) — عینِ چاپ حفظ شد",
        "ق۳۶ «replaced  by» — فاصلهٔ دوبلِ چاپی (پس از collapse به تک‌فاصله رسید)",
        "گزینهٔ «c)surprising» چسبیده بدونِ فاصله (ق۴۴)",
        "ق۴۳ بدونِ نقطهٔ پایانیِ چاپ — ساقه با خودِ نقطه‌چین تمام می‌شود («…its -------»)",
        "«a)True      b) False» چسبیده به ساقه در ق۳۶/۴۵/۴۶ ولی سطرِ جدا در ق۳۷/۴۱/۴۲",
        "نقطه‌چین‌های چسبیده به واژهٔ بعدی: «………..the chairs» / «……….carbon dioxide» / «……………..I take» / «……….she can’t»",
        "بلوک‌های کلیدِ RTLِ درهم: س۱۱ («fore/be» و «oom/r» شکسته) و س۱۵ («You can do th/is» و «are part/s») — داوریِ رندرِ ۳۰۰dpi",
    ],
    "futureNote": "بخشِ چهارم ~۱۱ برگهٔ دیگر دارد (ص۲۲۸-۳۲۱) — الگویِ همین رسید؛ کاندیدهای تایپیِ این برگه (س۱۰ «had got/gotten» + ردیف‌های ۳۳/۳۴/۴۰/۴۷/۴۸) به کاندیدهای r380/r381/r382 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۲۷ ردیف است (۲۱ِ r382 + ۶ ردیفِ تازه)",
}
d["source"]["g12nahaie4"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r383 OK — banks={len(d['lessons'])} items={total} (+28 in 7 banks: l22=5 l23=7 l24=4 l25=4 l26=4 l27=2 l28=2) — نهایی شهریور ۱۴۰۰ با کلیدِ رسمی")
