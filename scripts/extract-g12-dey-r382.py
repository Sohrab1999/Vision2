#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r382 — برگهٔ سومِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ دی ۱۴۰۰
(pdf-p329-333) با کلیدِ رسمیِ چاپیِ «راهنمای تصحيح» (pdf-p334-335)
→ tests-g12.json با ۶ بانکِ تازه (l16=5؛ l17=7؛ l18=4؛ l19=4؛ l20=4؛ l21=2)
— ۱۵ بانکِ قبلی + این = ۲۱ بانک/۳۹۳ آیتم

ساختار آزمون (۱۹ سکشن، ۵۵ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۵ صفحه، تاریخ ۱۴۰۰/۱۰/۲۰ —
نخستین برگه با تایپوگرافیِ presentation-forms در لایه):
  س۱ (۱-۴)    شنیداریِ درست/غلط (عماد و پدرش) — صوتی-کلید — مستثنی (کلید: 1.True(a)/2.False(b)/3.True(a)/4.False(b))
  س۲ (۵-۷)    شنیداری (شیلا/سمیرا) — صوتی-کلید — مستثنی (کلید: 5.False(b)/6.True(a)/7.arrived,took)
  س۳ (۸-۱۱)   شنیداری (زهرا/مبینا) — صوتی-کلید — مستثنی (کلید: 8.walk,rain/9.gym/10.stay,rest/11.Health is more important.)
  س۴ (۱۲-۱۶)  کلوژِ متنِ چاپیِ «فرهنگ لغت» — کلیدِ چاپی → بانک l16 (پنج‌گزینه‌ای)
  س۵ (۱۷-۲۰)  تصویری (یک جمله اضافی) — تصویری-کلید — مستثنی با داوریِ کاملِ رندر (17.(e)/18.(a)/19.(c)/20.(b))
  س۶ (۲۱-۲۳)  بانکِ ۴واژه‌ای (shouted اضافیِ چاپی) → بانک l17
  س۷ (۲۴-۲۶)  تعریف‌یابی A/B (یک تعریف اضافی) → بانک l17
  س۸ (۲۷)     اصطلاحِ «Out of s----, out of m---» → بانک l17
  س۹ (۲۸-۳۱)  گرامر MCQ → بانک l18
  س۱۰ (۳۲)    شکلِ فعلِ باز (had seen) — کلیدِ چاپیِ دقیق — مستثنی؛ کاندیدِ بانکِ تایپی
  س۱۱ (۳۳-۳۴) جمله‌سازیِ درهم — پاسخِ مدلِ چاپی (بلوکِ درهمِ لایه، داوریِ رندر ۳۰۰dpi) — مستثنی؛ کاندیدِ تایپی
  س۱۲ (۳۵)    ضمیرِ موصولی — کلیدِ بند-رأیی (which + جملهٔ دارای فعل) — مستثنی
  س۱۳ (۳۶-۴۰) خوانداریِ انرژی: ۳۶-۳۹ → بانک l19؛ ۴۰ پاسخِ مدل — کاندیدِ تایپی
  س۱۴ (۴۱-۴۴) خوانداریِ معلمان: ۴۱-۴۲ → بانک l20؛ ۴۳-۴۴ پاسخِ مدل — کاندیدِ تایپی
  س۱۵ (۴۵-۴۸) خوانداریِ فناوری: ۴۵-۴۶ → بانک l20؛ ۴۷ (بلوکِ درهم) و ۴۸ پاسخِ مدل — کاندیدِ تایپی
  س۱۶ (۴۹-۵۰) حروفِ ربط (بانکِ چاپی but, and, so, or) → بانک l21
  س۱۷ (۵۱)    حرفِ ربط با تصویر — کلیدِ چاپیِ کامل («…but he had to read it.») — مستثنی (کلید حفظ شد)
  س۱۸ (۵۲-۵۴) جملهٔ موضوعی — تولیدی — مستثنی
  س۱۹ (۵۵)    پاراگرافِ Saadi Shirazi — تولیدی — مستثنی
idempotent: اجرای دوم NO-OP (رسید g12nahaie3).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie3" in d.get("source", {}):
    print("r382: receipt g12nahaie3 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie2" in d.get("source", {}), "tests-g12.json (r381) must exist first"
assert len(d["lessons"]) == 15, f"expected 15 banks before r382, got {len(d['lessons'])}"

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


p329 = page_slice(329)
p330 = page_slice(330)
p331 = page_slice(331)
p332 = page_slice(332)
p333 = page_slice(333)
p334 = page_slice(334)
p335 = page_slice(335)
full = "\n".join(p329 + p330 + p331 + p332 + p333 + p334 + p335)


def join_between(pages: list[str], start_frag: str, end_frag: str | None) -> str:
    s = next(i for i, l in enumerate(pages) if start_frag in l)
    e = next((i for i, l in enumerate(pages) if end_frag and end_frag in l and i > s), len(pages))
    seg = [l.strip() for l in pages[s:e] if l.strip()]
    return re.sub(r"\s{2,}", " ", " ".join(seg))


def join_inclusive(pages: list[str], start_frag: str, end_frag: str) -> str:
    s = next(i for i, l in enumerate(pages) if start_frag in l)
    e = next(i for i, l in enumerate(pages) if end_frag in l and i >= s)
    seg = [l.strip() for l in pages[s:e + 1] if l.strip()]
    return re.sub(r"\s{2,}", " ", " ".join(seg))


def norm_stem(raw: str) -> str:
    s = raw.replace("…", "...")  # این برگه «…» را ۲-۳نویسه‌ای چاپ کرده — گسترش تا ادغامِ رانِ نقطه‌ها
    s = re.sub(r"\s{2,}", " ", s)
    s = re.sub(r"[….]{4,}", "-------", s)
    return s


# ————— پیمانِ سربرگِ آزمون (ص۳۲۹ — presentation-forms) —————
assert any("ﺳﺆاﻻت  اﻣﺘﺤﺎن" in l or "ﺳﺆاﻻت  اﻣﺘﺤﺎن" in l for l in p329)
assert any("1400" in l for l in p329)
assert any("aee.medu.ir" in l for l in p329)
assert any("ﺗﻌﺪاد ﺻﻔﺤﺎت:5" in l or "ﺻﻔﺤﺎت:5" in l for l in p329)

# ————— پیمانِ کلیدِ رسمی (ص۳۳۴-۳۳۵) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p334)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p335)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p334 + p335 if l.strip()))
assert "20 / 10 / 1400" in keyjoin, "تاریخِ کلید = تاریخِ برگه"
KEY_FRAGS = ["1. True (a)", "2. False (b)", "3. True (a)", "4. False (b)",
             "5. False (b)", "6. True (a)", "7. arrived, took",
             "8. walk , rain", "9. gym", "10. stay, rest", "11. Health is more important.",
             "12. information", "13. order", "14. definition", "15. imagine", "16. choice",
             "17. (e)", "18. (a)", "19. (c)", "20. (b)",
             "21. born", "22. introduction", "23. demand",
             "24. (c)", "25. (a)", "26. (d)", "27. sight , mind",
             "28. (d)", "29. (a)", "30. (a)", "31. (c)", "32. had seen",
             "36. (a) True", "37. (a) True", "38. ( c )", "39. (d)",
             "40. Iranians use special designs and arrangements",
             "41. (b) False", "42. (a) True",
             "43. …… paying attention during lessons and following classroom rules.",
             "go far beyond their duties.",
             "45. (b) False", "46. (b) False",
             "48. Because they can cause brain problems.",
             "49. and", "50. or", "51. …but he had to read it."]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# بلوک‌های درهمِ لایه (س۱۱ و ق۴۷) — فرگمنت‌های واقعی؛ کلیدِ کامل با داوریِ رندر
for frag in ["got hom", "had fallen", "The baby", "could res", "had more time",
             "phones", "online games", "computers,", "televisions", "http://aee.medu.ir"]:
    assert frag in keyjoin, f"scrambled key layer fragment missing: {frag}"

# ————— س۴: کلوژِ «فرهنگ لغت» (ص۳۲۹) → بانک l16 —————
dictlisten = norm_stem(join_inclusive(p329, "A dictionary is one of the most important tools", "skillful."))
for frag in ["-------12------- about words", "alphabetical ...13-------, so it will be easy",
             "which -------14-------to use?", "-------15-------a blank space",
             "the correct -------16------- . The more you practice"]:
    assert frag in dictlisten, frag
UNI16 = ["information", "order", "definition", "imagine", "choice"]
Q_L16 = [
    q("g12-l16-1", 1, "vocab", f"{dictlisten} — پاسخِ خانهٔ (12): -------",
      ["order", "information", "choice", "definition", "imagine"], 1),
    q("g12-l16-2", 2, "vocab", f"{dictlisten} — پاسخِ خانهٔ (13): -------",
      ["information", "definition", "order", "imagine", "choice"], 2),
    q("g12-l16-3", 3, "vocab", f"{dictlisten} — پاسخِ خانهٔ (14): -------",
      ["definition", "order", "imagine", "choice", "information"], 0),
    q("g12-l16-4", 4, "vocab", f"{dictlisten} — پاسخِ خانهٔ (15): -------",
      ["choice", "imagine", "information", "order", "definition"], 1),
    q("g12-l16-5", 5, "vocab", f"{dictlisten} — پاسخِ خانهٔ (16): -------",
      ["imagine", "order", "definition", "choice", "information"], 3),
]
assert [it["options"][it["answer"]] for it in Q_L16] == UNI16
assert [it["answer"] for it in Q_L16] == [1, 2, 0, 1, 3]
for it in Q_L16:
    assert sorted(it["options"]) == sorted(UNI16) and len(set(it["options"])) == 5, it["id"]

# ————— س۶: بانکِ واژگان (ص۳۳۰) → بانک l17 —————
S21 = norm_stem("Ferdowsi was …………in a village near Toos.")
S22 = norm_stem("This book has only a two-page …………… .")
S23 = norm_stem("The …………… for organic food is increasing.")
for s in [S21, S22, S23]:
    assert "-------" in s, s
assert "shouted, born, demand, introduction" in full
POOL17 = ["shouted", "born", "demand", "introduction"]
Q21_23 = [
    q("g12-l17-1", 1, "vocab", S21, POOL17, 1),
    q("g12-l17-2", 2, "vocab", S22, POOL17, 3),
    q("g12-l17-3", 3, "vocab", S23, POOL17, 2),
]
assert [it["options"][it["answer"]] for it in Q21_23] == ["born", "introduction", "demand"]
for it in Q21_23:
    assert it["options"][it["answer"]] != "shouted", it["id"]

# ————— س۷: تعریف‌یابی A/B (ص۳۳۰) → بانک l17 —————
S24 = "I’ve told Mohsen repeatedly to talk politely to his teachers."
S25 = "From the letters X and Y, we can get two combinations: XY and YX."
S26 = "Future generations will carry our present values."
assert S24 in full and S25 in full and S26 in full
DEFS = ["an arrangement in a particular order", "finish something", "many times",
        "all the people of about the same age within a society"]
for df in DEFS:
    assert df in full, df
Q24_26 = [
    q("g12-l17-4", 4, "vocab", f"«{S24}» — تعریفِ ستون B برای واژهٔ «repeatedly»: -------", DEFS, 2),
    q("g12-l17-5", 5, "vocab", f"«{S25}» — تعریفِ ستون B برای واژهٔ «combinations»: -------", DEFS, 0),
    q("g12-l17-6", 6, "vocab", f"«{S26}» — تعریفِ ستون B برای واژهٔ «generations»: -------", DEFS, 3),
]
assert [it["options"][it["answer"]] for it in Q24_26] == [DEFS[2], DEFS[0], DEFS[3]]
for it in Q24_26:
    assert it["options"][it["answer"]] != DEFS[1], it["id"]

# ————— س۸: اصطلاح (ص۳۳۰) — ساقهٔ دوبخطی با گیومهٔ خمیدهٔ چاپ —————
i27 = next(i for i, l in enumerate(p330) if "no longer visible or present" in l)
S27 = norm_stem(p330[i27].strip().split(".", 1)[1].strip() + " " + p330[i27 + 1].strip())
assert S27 == "Every one believes that you soon forget people or things that are no longer visible or present, “Out of s - - - -, out of m - - -”.", S27
Q27 = q("g12-l17-7", 7, "vocab", S27,
        ["sight / mind", "sound / mood", "scale / mark", "skill / most"], 0)

Q_L17 = Q21_23 + Q24_26 + [Q27]

# ————— س۹: گرامر MCQ (ص۳۳۱) → بانک l18 —————
i28 = next(i for i, l in enumerate(p331) if "You haven’t done your homework" in l)
G28 = norm_stem(p331[i28].strip().split(".", 1)[1].strip() + " " + p331[i28 + 1].strip())
assert G28 == "A: You haven’t done your homework, -------? B: No, I haven’t.", G28
G29 = norm_stem("The woman …………you met yesterday is coming to dinner.")
G30 = norm_stem("People …………..of the danger of harmful gasses.")
G31 = norm_stem("The first fast food restaurants …………….. in our city thirty years ago.")
for s in [G29, G30, G31]:
    assert "-------" in s, s
for o in ["haven’t you", "haven’t I", "has it", "have you", "whom", "when", "where", "which",
          "should be informed", "have informed", "are informing", "is informed",
          "opens", "were opening", "were opened", "can open"]:
    assert o in full, o
Q_L18 = [
    q("g12-l18-1", 1, "grammar", G28, ["haven’t you", "haven’t I", "has it", "have you"], 3),
    q("g12-l18-2", 2, "grammar", G29, ["whom", "when", "where", "which"], 0),
    q("g12-l18-3", 3, "grammar", G30, ["should be informed", "have informed", "are informing", "is informed"], 0),
    q("g12-l18-4", 4, "grammar", G31, ["opens", "were opening", "were opened", "can open"], 2),
]
# کلیدهای چاپی [d,a,a,c] — دو aِ پیاپی (۲۹/۳۰) سمانتیک‌اند؛ ترتیبِ چاپ حفظ شد
assert [it["answer"] for it in Q_L18] == [3, 0, 0, 2]

# ————— س۱۳: خوانداریِ انرژی (ص۳۳۱) → بانک l19 —————
energy = norm_stem(join_inclusive(p331, "Energy is the ability to do work", "the year."))
for frag in ["fossil fuels such as natural gas, oil, and coal", "Once we use them up",
             "wind, water, sunshine, tides, and plants", "balconies and yards to get the most sunshine"]:
    assert frag in energy, frag
T36 = norm_stem("According to the passage, mechanical, electrical, chemical, and nuclear forms are variety of energy.")
T37 = norm_stem("The resources of the earth are used to produce energy.")
M38 = norm_stem("Fossil fuels are nonrenewable means that they …………..easily.")
M39 = norm_stem("The most common type of clean energy is produced by the ………that reaches the earth..")
assert "are variety of" in full and "nonrenewable means" in full and "reaches the earth.." in full
Q_L19 = [
    q("g12-l19-1", 1, "grammar", f"{energy} — {T36}", ["True", "False"], 0),
    q("g12-l19-2", 2, "grammar", f"{energy} — {T37}", ["True", "False"], 0),
    q("g12-l19-3", 3, "grammar", f"{energy} — {M38}",
      ["cannot be consumed", "can be replaced", "aren’t replaced", "are polluted"], 2),
    q("g12-l19-4", 4, "grammar", f"{energy} — {M39}",
      ["design", "wind", "plant", "radiation"], 3),
]
# کلیدهای چاپی [a,a,c,d] — دو Trueِ پیاپی سمانتیک‌اند؛ «( c )» با فاصله‌های چاپی در کلید
assert [it["answer"] for it in Q_L19] == [0, 0, 2, 3]

# ————— س۱۴+س۱۵: خوانداریِ معلمان و فناوری (ص۳۳۲-۳۳۳) → بانک l20 —————
teachers = norm_stem(join_inclusive(p332, "It is very important for us to respect our teachers", "love and attempt."))
for frag in ["They were once students like us", "following classroom rules", "go far beyond their duties"]:
    assert frag in teachers, frag
tech1 = join_inclusive(p332, "Many Scientists believe", "over the years.")
tech2 = join_inclusive(p333, "Always remember that your health", "once you have lost it.")
tech = norm_stem(tech1 + " " + tech2)
for frag in ["kill more people than smoking", "24-hour televisions", "sleep problems", "brain problems"]:
    assert frag in tech, frag
T41 = norm_stem("According to the passage, teachers were always teachers.")
T42 = norm_stem("Teachers share their experiences with us.")
T45 = norm_stem("According to the passage, mobile phones are not very harmful for children.")
T46 = norm_stem("Mobile phones can cure memory loss in some people")
Q_L20 = [
    q("g12-l20-1", 1, "grammar", f"{teachers} — {T41}", ["True", "False"], 1),
    q("g12-l20-2", 2, "grammar", f"{teachers} — {T42}", ["True", "False"], 0),
    q("g12-l20-3", 3, "grammar", f"{tech} — {T45}", ["True", "False"], 1),
    q("g12-l20-4", 4, "grammar", f"{tech} — {T46}", ["True", "False"], 1),
]
# کلیدهای چاپی [b,a,b,b] — ق۴۶ بدونِ علامتِ سؤالِ چاپ؛ دو Falseِ پیاپیِ ۴۵/۴۶ سمانتیک
assert [it["answer"] for it in Q_L20] == [1, 0, 1, 1]

# ————— س۱۶: حروفِ ربط (ص۳۳۳) → بانک l21 —————
C49 = norm_stem("Reza and Saeed went swimming last week, …………….. they had a nice time.")
C50 = norm_stem("We can eat our lunch at the restaurant, ……………..we can have it at home.")
for s in [C49, C50]:
    assert "-------" in s, s
assert "(but, and, so, or)" in full.replace("ﮐﻠﻤﺎت رﺑﻂ", "کلمات ربط") or "but, and, so, or" in full
CONJ = ["but", "and", "so", "or"]
Q_L21 = [
    q("g12-l21-1", 1, "grammar", C49, CONJ, 1),
    q("g12-l21-2", 2, "grammar", C50, CONJ, 3),
]
assert [it["options"][it["answer"]] for it in Q_L21] == ["and", "or"]
assert [it["answer"] for it in Q_L21] == [1, 3]
for it in Q_L21:
    assert sorted(it["options"]) == sorted(CONJ), it["id"]

# ————— درج در سند —————
B16 = {"lesson": 16, "title": "نهایی دی ۱۴۰۰ — کلوژِ فرهنگِ لغت (س۴، ص۳۲۹)", "level": "پنج‌گزینه‌ای",
       "count": len(Q_L16), "questions": Q_L16}
B17 = {"lesson": 17, "title": "نهایی دی ۱۴۰۰ — واژگان و تعریف و اصطلاح (س۶-س۸، ص۳۳۰)", "level": "چهارگزینه‌ای",
       "count": len(Q_L17), "questions": Q_L17}
B18 = {"lesson": 18, "title": "نهایی دی ۱۴۰۰ — گرامر (س۹، ص۳۳۱)", "level": "چهارگزینه‌ای",
       "count": len(Q_L18), "questions": Q_L18}
B19 = {"lesson": 19, "title": "نهایی دی ۱۴۰۰ — خوانداریِ انرژی (س۱۳، ص۳۳۱-۳۳۲)", "level": "چهارگزینه‌ای",
       "count": len(Q_L19), "questions": Q_L19}
B20 = {"lesson": 20, "title": "نهایی دی ۱۴۰۰ — خوانداریِ معلمان و فناوری (س۱۴-س۱۵، ص۳۳۲-۳۳۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L20), "questions": Q_L20}
B21 = {"lesson": 21, "title": "نهایی دی ۱۴۰۰ — حروفِ ربط (س۱۶، ص۳۳۳)", "level": "چهارگزینه‌ای",
       "count": len(Q_L21), "questions": Q_L21}
for b in (B16, B17, B18, B19, B20, B21):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie3"] = {
    "extractedRound": "r382",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ سوم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ دی ۱۴۰۰",
    "examPages": "pdf-p329-333 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p334-335 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p328→p329 (پایانِ شهریور ۱۴۰۰) و p335→p336 (آغازِ خرداد ۱۴۰۲)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: کلیه رشته‌ها — نوبت دی ۱۴۰۰ (تاریخِ چاپی: ۲۰/۱۰/۱۴۰۰) — مدت ۱۲۰ دقیقه — ساعت شروع ۱۰ صبح (تنها برگه با شروعِ ۱۰) — ۱۹ سکشن/۵۵ ردیف/بارم ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — «GOOD LUCK / نمره 40»",
    "keyPages": "pdf-p334-335 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۴۷ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۲۶ کلید از ۲۶ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «12. information 13. order 14. definition 15. imagine 16. choice» / «21. born 22. introduction 23. demand» / «24. (c) 25. (a) 26. (d)» / «27. sight , mind» / «28. (d) 29. (a) 30. (a) 31. (c)» / «36. (a) True 37. (a) True 38. ( c ) 39. (d)» / «41. (b) False 42. (a) True» / «45. (b) False 46. (b) False» / «49. and 50. or» — بلوک‌های درهمِ لایه برای س۱۱ (۳۳/۳۴) و ق۴۷ با داوریِ رندرِ ۳۰۰dpi (/tmp/qa-r382/p334-s11-key.png و p335-s15-key.png): «33. The baby had fallen asleep when I got home.» / «34. John could rest if he had more time.» / «47. televisions, computers, online games, phones»",
    "sectionsTotal": 55,
    "sectionsExtracted": 26,
    "sectionsSkipped": 29,
    "items": 26,
    "bankCounts": [5, 7, 4, 4, 4, 2],
    "keyPolicy": "همهٔ کلیدهای ۲۶ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ گزینه‌های مهندسی‌شده: بانکِ کلوژِ l16 (استخرِ پنج‌واژه‌ایِ خودِ کلید — چرخشِ تازهٔ [1,2,0,1,3]) و جفتِ اصطلاحِ l17-ق۷ (شکلِ حروفِ چاپ s----/m--- محترم: sight/mind در برابرِ sound/mood و scale/mark و skill/most)؛ کلیدهای درست/غلطِ l19/l20 سمانتیک‌اند و چرخش نمی‌پذیرند (چاپِ l19 دو Trueِ پیاپی و l20 دو Falseِ پیاپی دارد — حفظِ وفادار؛ همچنین گرامرِ l18 دو aِ پیاپی در ۲۹/۳۰ دارد — ترتیبِ چاپ حفظ شد)",
    "engineNote": "هر ۲۶ آیتم MCQ (قراردادِ کارتِ g12)؛ ساقه‌های خوانداریِ l19/l20 هر سه متنِ کاملِ چاپی را در خود دارند (انرژی/معلمان/فناوری — فناوری دوصفحه‌ای است: ص۳۳۲ + «Always remember…» ص۳۳۳)؛ ساقه‌های کلوژِ س۴ متنِ چاپی + «پاسخِ خانهٔ (N)» (الگویِ r380-l4/r381-l8-l9)؛ ساقه‌های تعریف‌یابی دوبخشیِ فارسی (الگویِ r380-l5)؛ ساقه‌های A/B گرامر (ق۲۸) دوبخطیِ بازجوش؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» چسبیده",
    "derivedKeys": {
        "S4": ["information", "order", "definition", "imagine", "choice"],
        "S6": ["born", "introduction", "demand"],
        "S7": ["many times", "an arrangement in a particular order", "all the people of about the same age within a society"],
        "S8": ["sight / mind"],
        "S9": ["have you", "whom", "should be informed", "were opened"],
        "S13": ["True", "True", "aren’t replaced", "radiation"],
        "S14-15": ["False", "True", "False", "False"],
        "S16": ["and", "or"],
    },
    "paperMap": "نقشهٔ paperMapِ r381 تکمیل شد: برگهٔ سوم (دی ۱۴۰۰، ص۳۲۹-۳۳۵) استخراج شد — سالِ دقیقِ دو برگه تأیید شد: ص۳۲۲-۳۲۸ = شهریور ۱۴۰۰ (کلید ص۳۲۷-۳۲۸) و ص۳۲۹-۳۳۵ = دی ۱۴۰۰؛ باقیِ برگه‌های ص۲۲۸-۳۲۱ هنوز پروبِ سال نشده‌اند (kandidatِ راندهای بعدی)",
    "skippedSections": [
        "س۱ (ردیف ۱-۴، شنیداریِ درست/غلط): متنِ «عماد و پدرش» — صوتی-کلید (متنِ مکالمه چاپ نیست)؛ کلیدهای چاپی: 1.True(a)/2.False(b)/3.True(a)/4.False(b) — در رسید حفظ شد",
        "س۲ (ردیف ۵-۷، شنیداری): مکالمهٔ شیلا/سمیرا — صوتی-کلید؛ کلیدهای چاپی: 5.False(b)/6.True(a)/7.arrived, took",
        "س۳ (ردیف ۸-۱۱، شنیداری): مکالمهٔ زهرا/مبینا — صوتی-کلید؛ کلیدهای چاپی: 8.walk , rain / 9.gym / 10.stay, rest / 11.Health is more important.",
        "س۵ (ردیف ۱۷-۲۰، تصویری): «با توجه به تصاویر... یک جمله اضافی است» — چهار تصویر با داوریِ کاملِ رندر (ص۳۳۰): (17) مادر با کودکِ دامنی→e، (18) لامپ‌های کم‌مصرف→a، (19) مدخلِ واژه‌نامه با دایرهٔ قرمز→c، (20) منابعِ تجدیدپذیرِ باد/آب/خورشید→b؛ اضافیِ چاپی: d) C is the symbol for carbon — هم‌خوانِ کلیدِ رسمی",
        "س۱۰ (ردیف ۳۲، شکلِ فعلِ باز): کلیدِ چاپیِ دقیق «had seen» — بدونِ گزینهٔ چاپی؛ کاندیدِ بانکِ تایپی",
        "س۱۱-س۱۲ (ردیف ۳۳-۳۵): جمله‌سازیِ درهم (پاسخِ مدل: «The baby had fallen asleep when I got home.» و «John could rest if he had more time.» — بلوکِ درهمِ لایه با داوریِ رندر) و ضمیرِ موصولی (کلیدِ بند-رأیی: which + جملهٔ دارای فعل، بارم ۰.۵+۰.۵) — کاندیدِ تایپی/تولیدی",
        "ردیف ۴۰ (پاسخِ مدلِ انرژی: «Iranians use special designs and arrangements of windows, balconies and yards to get the most sunshine.» بارم ۰.۵+۰.۵) — کاندیدِ تایپی؛ ردیف ۴۳/۴۴ (پاسخِ مدلِ معلمان: «paying attention during lessons and following classroom rules.» و «go far beyond their duties.») — کاندیدِ تایپی؛ ردیف ۴۷ (پاسخِ مدلِ فناوری: «televisions, computers, online games, phones» بارم ۰.۲۵×۴ — بلوکِ درهم) و ۴۸ («Because they can cause brain problems.») — کاندیدِ تایپی",
        "س۱۷ (ردیف ۵۱، حرفِ ربط با تصویر): کلیدِ چاپیِ کامل «…but he had to read it.» ولی دستورِ سکشن «با استفاده از تصویر» است — تصویری-کلید (الگویِ r380-ردیف۱۶/r381)؛ کلید حفظ شد",
        "س۱۸-س۱۹ (ردیف ۵۲-۵۵، نگارشِ تولیدی): سه جملهٔ موضوعی (Sport/Electric Cars/Ants) و پاراگرافِ Saadi Shirazi با چیپ‌های چاپی (Great Iranian Poet / 606 Shiraz / Bustan,Gulistan) — تولیدی با کلیدِ بند-رأیی",
    ],
    "printQuirks": [
        "نخستین برگه با تایپوگرافیِ presentation-forms در لایه (ﺳﺆاﻻت/اﻣﺘﺤﺎن/ﭘﺎﯾﻪ) — برخلافِ r380/r381 که فارسیِ عادی داشتند؛ متنِ انگلیسی و کلیدها لاتینِ سالم",
        "نشانگرِ سؤال «1.» با نقطه (برخلافِ «1)» برگه‌های r380/r381)",
        "«38. ( c )» — فاصله‌های چاپیِ داخلِ پرانتزِ کلید (همان کوئیرکِ r380-ق۳۸)",
        "«8. walk , rain» و «27. sight , mind» — فاصلهٔ چاپی پیش از ویرگول در کلید",
        "ق۳۹ «reaches the earth..» — دونقطهٔ پایانیِ چاپ — verbatim در ساقه",
        "ق۴۶ «Mobile phones can cure memory loss in some people» — بدونِ علامتِ سؤالِ چاپ — verbatim",
        "بلوک‌های کلیدِ RTLِ درهم: س۱۱ («got hom/…e» و «could res/t» شکسته) و ق۴۷ («phones , online games computers, , televisions») — داوریِ رندرِ ۳۰۰dpi",
        "ساعتِ شروع ۱۰ صبح (تنها برگه — بقیه ۸ صبح)",
        "فوترِ اسکنِ «Audio file (MP3)/(PDF)» و شماره‌های ۲۳۲-۲۳۸ در پنج صفحهٔ آزمون — نویزِ جداشده",
        "«نمره 40» با «GOOD LUCK» — امضای پایانی",
    ],
    "futureNote": "بخشِ چهارم ~۱۲ برگهٔ دیگر دارد (ص۲۲۸-۳۲۱ + ص۳۲۲-۳۲۸ شهریور ۱۴۰۰ تأییدشده) — الگویِ همین رسید؛ کاندیدهای تایپیِ این برگه (س۱۰ «had seen» + ردیف‌های ۳۳/۳۴/۴۰/۴۳/۴۴/۴۷/۴۸) به کاندیدهای r380/r381 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۲۱ ردیف است",
}
d["source"]["g12nahaie3"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r382 OK — banks={len(d['lessons'])} items={total} (+26 in 6 banks: l16=5 l17=7 l18=4 l19=4 l20=4 l21=2) — نهایی دی ۱۴۰۰ با کلیدِ رسمی")
