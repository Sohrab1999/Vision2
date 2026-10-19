#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r380 — نخستین آزمونِ نهاییِ وزارتیِ پروژه: «سؤالات امتحان نهایی — زبان انگلیسی (۳) —
نوبت خرداد ۱۴۰۲» (pdf-p336-340) با کلیدِ رسمیِ چاپیِ «راهنمای تصحيح» (pdf-p341-342)
→ tests-g12.json با ۴ بانکِ تازه (l4=۶؛ l5=۷؛ l6=۶؛ l7=۱۰) — ۳ بانکِ قبلی + این = ۷ بانک/۳۲۹ آیتم

ساختار آزمون (۲۰ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۵ صفحه، تاریخ ۱۴۰۲/۰۳/۲۵):
  ردیف ۱-۳   شنیداریِ محض (صوتی-کلید — مکالمه‌های شنیداری) — مستثنی (کلیدهای چاپی‌شان در رسید ثبت شد)
  ردیف ۴     کلوژِ متنِ چاپیِ «احترام به سالمندان» (خانه‌های ۱۱-۱۶) — کلیدِ چاپی → بانک l4
  ردیف ۵     تصویری (جمله/تصویر با یک اضافی) — مستثنی (کلید چاپی: 17c/18e/19d/20a)
  ردیف ۶     بانکِ ۴واژه‌ای (۳ خانه + suppose اضافیِ چاپی) — کلید چاپی → بانک l5
  ردیف ۷     تعریف‌یابی A/B (یک تعریف اضافی) — کلید چاپی → بانک l5
  ردیف ۸     اصطلاحِ «the e---- bird catches the w----» — کلید چاپی (early, worm) → بانک l5
  ردیف ۹     گرامر MCQ (28-31) — کلید چاپی → بانک l6
  ردیف ۱۰    شکلِ فعل (32) — کلید چاپیِ «fallen» (= had fallen) → بانک l6
  ردیف ۱۱    جمله‌سازی (33-34) — کلیدِ این ردیف در لایهٔ راهنمای تصحیح نیفتاده — مستثنی
  ردیف ۱۲    ضمیرِ موصولی (35) — کلیدِ ردیف در لایه نیست؛ who با استنتاجِ ساختاری (شخص+فاعل) → بانک l6
  ردیف ۱۳-۱۵ خوانداری (hydro/Mike/dictionary) MCQ و درست/غلط (36-42، 45-46) — کلید چاپی → بانک l7
  ردیف ۱۵ق۴۹ IPA — کلید چاپی (International Phonetic Alphabet) → بانک l7
  ردیف ۱۶    حرفِ ربط با تصویر (50-51) — تصویری-کلید هرچند کلید چاپی (so/but) — مستثنی
  ردیف ۱۷-۲۰ نگارشِ تولیدی — مستثنی
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie1" in d.get("source", {}):
    print("r380: receipt g12nahaie1 already present — NO-OP")
    raise SystemExit(0)
assert d and "keyGrid" in d.get("source", {}), "tests-g12.json (r273/274) must exist first"
assert len(d["lessons"]) == 3, f"expected 3 banks before r380, got {len(d['lessons'])}"

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


p336 = page_slice(336)
p337 = page_slice(337)
p338 = page_slice(338)
p339 = page_slice(339)
p340 = page_slice(340)
p341 = page_slice(341)
p342 = page_slice(342)
full = "\n".join(p336 + p337 + p338 + p339 + p340 + p341 + p342)


def join_between(pages: list[str], start_frag: str, end_frag: str | None) -> str:
    s = next(i for i, l in enumerate(pages) if start_frag in l)
    e = next((i for i, l in enumerate(pages) if end_frag and end_frag in l), len(pages))
    seg = [l.strip() for l in pages[s:e] if l.strip()]
    return re.sub(r"\s{2,}", " ", " ".join(seg))


def norm_stem(raw: str) -> str:
    s = re.sub(r"\s{2,}", " ", raw)
    s = re.sub(r"[….]{4,}", "-------", s)
    return s


# ————— پیمانِ سربرگِ آزمون (ص۳۳۶) —————
assert any("سؤاﻻت  امتحان" in l for l in p336)
assert any("زبان انگليسي)٣(" in l for l in p336)
assert any("دوازدهم" in l for l in p336)
assert any("خرداد" in l for l in p336)
assert any("aee.medu.ir" in l for l in p336)

# ————— پیمانِ کلیدِ رسمی (ص۳۴۱-۳۴۲ — «راهنمای تصحيح») —————
assert any("راهنماي تصحيح" in l for l in p341)
KEY_FRAGS = ["1. False (b)", "2.True (a)", "3. False (b)", "4. (c)", "5. (c)", "6. (b)", "7. (a)",
             "8. (good) dictionary", "9. online, smart", "10. word, search",
             "11. forgive", "12. knowledge", "13. faced", "14. respecting", "15. feel", "16. appreciate",
             "17. (c)", "18. (e)", "19.  (d)", "20. (a)",
             "21. effectively", "22. communicative", "23. replaced",
             "24. (c)", "25. (d)", "26. (a)", "27. early, worm",
             "28. (d)", "29. (b)", "30. (a)", "31. (c)", "fallen",
             "36. (a) True", "37. (running) water", "38. ( c )", "39. (b)", "40. (d)",
             "41. (d)", "42. (a)", "45. (a) True", "46. (b) False", "50. so", "51. but"]
for kf in KEY_FRAGS:
    assert kf in full, f"printed key fragment missing: {kf}"
assert "Alphabet." in "\n".join(p342) and "International Phonetic" in "\n".join(p342), "q49 key"

# ————— ردیف ۴: کلوژِ سالمندان (ص۳۳۶) —————
elders = join_between(p336, "Do you know why it is important", "پايان آزمون شنيداري")
for frag in ["……(11)……others.", "……. (12)…… and wisdom", "…….(13)……. in life",
             "……(14)…… and learning from", "……(15)…….. the pain", "……(16)….. them"]:
    assert frag in elders, frag
UNI4 = ["forgive", "knowledge", "faced", "respecting", "feel", "appreciate"]
Q_L4 = [
    q("g12-l4-1", 1, "vocab", f"{elders} — پاسخِ خانهٔ (11): -------",
      ["forgive", "respecting", "feel", "knowledge", "faced", "appreciate"], 0),
    q("g12-l4-2", 2, "vocab", f"{elders} — پاسخِ خانهٔ (12): -------",
      ["respecting", "feel", "knowledge", "appreciate", "forgive", "faced"], 2),
    q("g12-l4-3", 3, "vocab", f"{elders} — پاسخِ خانهٔ (13): -------",
      ["feel", "appreciate", "forgive", "knowledge", "faced", "respecting"], 4),
    q("g12-l4-4", 4, "vocab", f"{elders} — پاسخِ خانهٔ (14): -------",
      ["appreciate", "respecting", "forgive", "faced", "feel", "knowledge"], 1),
    q("g12-l4-5", 5, "vocab", f"{elders} — پاسخِ خانهٔ (15): -------",
      ["faced", "knowledge", "appreciate", "feel", "respecting", "forgive"], 3),
    q("g12-l4-6", 6, "vocab", f"{elders} — پاسخِ خانهٔ (16): -------",
      ["respecting", "forgive", "feel", "faced", "knowledge", "appreciate"], 5),
]
assert [it["options"][it["answer"]] for it in Q_L4] == UNI4
assert [it["answer"] for it in Q_L4] == [0, 2, 4, 1, 3, 5]
for it in Q_L4:
    assert sorted(it["options"]) == sorted(UNI4) and len(set(it["options"])) == 6, it["id"]

# ————— ردیف ۶: بانکِ واژگان (ص۳۳۷) —————
S21 = norm_stem("If students know how to study more ………….., they’ll be able to learn more.")
S22 = norm_stem("He wasn’t very ………….. and kept to himself.")
S23 = norm_stem("Mina carefully …………. the glasses on the shelf.")
for s in [S21, S22, S23]:
    assert "-------" in s and "------- " not in s.split("-------")[0], s
POOL6 = ["communicative", "replaced", "suppose", "effectively"]
Q6 = [
    q("g12-l5-1", 1, "vocab", S21, ["communicative", "effectively", "suppose", "replaced"], 1),
    q("g12-l5-2", 2, "vocab", S22, ["replaced", "suppose", "effectively", "communicative"], 3),
    q("g12-l5-3", 3, "vocab", S23, ["replaced", "suppose", "communicative", "effectively"], 0),
]
assert [it["options"][it["answer"]] for it in Q6] == ["effectively", "communicative", "replaced"]
for it in Q6:
    assert sorted(it["options"]) == sorted(POOL6), it["id"]

# ————— ردیف ۷: تعریف‌یابی (ص۳۳۷) —————
DEFS = ["the rise and fall of the sea", "take something in, especially gradually",
        "put things in a neat, attractive, or useful order", "tell somebody that something is good"]
S24 = "They have to arrange the chairs around the table for the party."
S25 = "The teacher recommended a learner’s dictionary to his students."
S26 = "Here you can see two high and two low tides each day."
assert S24 in full and S25 in full and S26 in full
for dfrag in DEFS:
    assert dfrag in full, dfrag
Q7 = [
    q("g12-l5-4", 4, "vocab", f"«{S24}» — تعریفِ ستون B برای واژهٔ «arrange»: -------",
      [DEFS[2], DEFS[0], DEFS[1], DEFS[3]], 0),
    q("g12-l5-5", 5, "vocab", f"«{S25}» — تعریفِ ستون B برای واژهٔ «recommended»: -------",
      [DEFS[0], DEFS[1], DEFS[2], DEFS[3]], 3),
    q("g12-l5-6", 6, "vocab", f"«{S26}» — تعریفِ ستون B برای واژهٔ «tides»: -------",
      [DEFS[1], DEFS[0], DEFS[3], DEFS[2]], 1),
]
assert [it["options"][it["answer"]] for it in Q7] == [DEFS[2], DEFS[3], DEFS[0]]
# تعریفِ اضافیِ چاپی (b) هرگز کلید نیست
for it in Q7:
    assert it["options"][it["answer"]] != DEFS[1], it["id"]

# ————— ردیف ۸: اصطلاح (ص۳۳۷) — ساقهٔ دوبخطی با گیومهٔ خمیدهٔ چاپ —————
i27 = next(i for i, l in enumerate(p337) if "wake up and start work" in l)
S27 = norm_stem(p337[i27].strip().split(".", 1)[1].strip() + " " + p337[i27 + 1].strip())
assert S27 == "You should wake up and start work sooner if you want to succeed. You know that “the e - - - - bird catches the w - - - ”.", S27
Q8 = q("g12-l5-7", 7, "vocab", S27,
       ["eager / work", "earth / wind", "early / worm", "earn / warm"], 2)

# ————— ردیف ۹-۱۰ و ۱۲: گرامر (ص۳۳۸) —————
S28 = norm_stem("A: Hamid has not come to school. I’ve heard he is not well, …………….. ? B: Oh ,yes. He has got a flu.")
S29 = norm_stem("The woman ……….. my sister met in the hospital is a nurse.")
S30 = norm_stem("This book ……………….into countless languages including German, English and French.")
S31 = norm_stem("A: This summer is really hot and lots of animals are in danger. B: Something …………..about global warming, or some types of animals will die out.")
S32 = norm_stem("When I got home, the baby………… asleep. (fall)")
S35 = norm_stem("A doctor is a person…………………………………. .")
for s in [S28, S29, S30, S31, S32, S35]:
    assert "-------" in s, s
assert "Oh ,yes" in S28, "کوئیرکِ «Oh ,yes» (فاصله پیش از ویرگول)"
Q9 = [
    q("g12-l6-1", 1, "grammar", S28, ["has he", "have I", "hasn’t Hamid", "is he"], 3),
    q("g12-l6-2", 2, "grammar", S29, ["which", "whom", "whose", "where"], 1),
    q("g12-l6-3", 3, "grammar", S30, ["has been translated", "had translated", "may translate", "were translated"], 0),
    q("g12-l6-4", 4, "grammar", S31, ["must do", "were done", "should be done", "are doing"], 2),
    q("g12-l6-5", 5, "grammar", S32, ["fell", "was falling", "had fallen", "falls"], 2),
    q("g12-l6-6", 6, "grammar", "جمله را با ضمیرِ موصولیِ مناسب (whom / who / which) کامل کنید: " + S35,
      ["whom", "who", "which"], 1),
]
for o in ["has he", "have I", "is he"]:
    assert o in full, o
assert "hasn’t Hamid" in full and "whom" in full and "whose" in full

# ————— ردیف ۱۳: خوانداریِ hydro (متنِ پایانیِ ص۳۳۸، پرسش‌های ۳۷-۴۰ روی ص۳۳۹) —————
hydro = join_between(p338, "Many countries have used the energy in moving water", "True/False")
for frag in ["“hydroelectric power” or “hydropower”", "about 19% of all our electricity",
             '"The Water Cycle"']:
    assert frag in hydro, frag
S36 = norm_stem(p338[next(i for i, l in enumerate(p338) if "According to the passage, the energy" in l)]
                .strip().split(".", 1)[1].strip() + " " +
                p338[next(i for i, l in enumerate(p338) if "According to the passage, the energy" in l) + 1]
                .strip().split("a)True")[0].strip())
S36 = S36[:S36.rfind("electricity.") + len("electricity.")]
assert S36 == "According to the passage, the energy in moving water can generate clean, renewable, and cheap electricity.", S36
S37 = norm_stem("Many countries produce energy from …….……… and convert it to ………………. .")
S38 = norm_stem("The power produced from falling or running water is called……………. .")
S39 = norm_stem("The passage says…………… makes hydropower renewable.")
S40 = "What is the best title for this text?"
assert "clean, renewable, and cheap" in full and "best title for this text?" in full
Q13 = [
    q("g12-l7-1", 1, "grammar", f"{hydro} — {S36}", ["True", "False"], 0),
    q("g12-l7-2", 2, "grammar", f"{hydro} — {S37}",
      ["running water / electricity", "clouds / rain", "turbines / generators", "water cycle / electricity"], 0),
    q("g12-l7-3", 3, "grammar", f"{hydro} — {S38}", ["water cycle", "turbine", "hydropower", "generator"], 2),
    q("g12-l7-4", 4, "grammar", f"{hydro} — {S39}", ["electricity", "water", "earth", "cloud"], 1),
    q("g12-l7-5", 5, "grammar", f"{hydro} — {S40}",
      ["Different  sources of energy", "Converting electricity", "Electrical air conditioner", "Hydropower"], 3),
]

def join_after(pages: list[str], start_frag: str, end_frag: str) -> str:
    s = next(i for i, l in enumerate(pages) if start_frag in l)
    e = next(i for i in range(s + 1, len(pages)) if end_frag in pages[i])
    seg = [l.strip() for l in pages[s:e] if l.strip()]
    return re.sub(r"\s{2,}", " ", " ".join(seg))


# ————— ردیف ۱۴: خوانداریِ Mike (ص۳۳۹) —————
mike = join_after(p339, "Last night Mike left work late", "Choose the best answer")
for frag in ["a car pulled over", "his suitcase in his car", "He apologized for his anger"]:
    assert frag in mike, frag
S41 = norm_stem("According to the passage, Mike hadn’t ………….  such a dark and quiet street before.")
S42 = norm_stem("John……………at Mike and came out of the car.")
Q14 = [
    q("g12-l7-6", 6, "grammar", f"{mike} — {S41}", ["pulled over", "gone", "come out of", "experienced"], 3),
    q("g12-l7-7", 7, "grammar", f"{mike} — {S42}", ["waved", "wondered", "remembered", "apologized"], 0),
]

# ————— ردیف ۱۵: خوانداریِ dictionary (ص۳۳۹) —————
dict_pass = join_between(p339, "A dictionary is a book which explains", "True/False")
for frag in ["Latin ‘dictio’ (‘saying’)", "alphabetical order", "International Phonetic Alphabet (IPA) is used"]:
    assert frag in dict_pass, frag
S45 = "Since dictionaries put words in alphabetical order, you can find them easily."
S46 = "The word ‘dictionary’ comes from the French ‘dictio’."
S49 = norm_stem("IPA stands for ………………………………. .")
assert S45 in full and S46 in full
Q15 = [
    q("g12-l7-8", 8, "grammar", f"{dict_pass} — {S45}", ["True", "False"], 0),
    q("g12-l7-9", 9, "grammar", f"{dict_pass} — {S46}", ["True", "False"], 1),
    q("g12-l7-10", 10, "grammar", S49,
      ["International Phonetic Alphabet", "International Pronunciation Alphabet",
       "Inner Phonetic Alphabet", "Integrated Phonetic Lettering"], 0),
]

# ————— درج در سند —————
B4 = {"lesson": 4, "title": "نهایی خرداد ۱۴۰۲ — کامل‌کردن متن (س۴، ص۳۳۶)", "level": "شش‌گزینه‌ای",
      "count": len(Q_L4), "questions": Q_L4}
B5 = {"lesson": 5, "title": "نهایی خرداد ۱۴۰۲ — واژگان و تعریف و اصطلاح (س۶-س۸، ص۳۳۷)", "level": "چهارگزینه‌ای",
      "count": len(Q6 + Q7 + [Q8]), "questions": Q6 + Q7 + [Q8]}
B6 = {"lesson": 6, "title": "نهایی خرداد ۱۴۰۲ — گرامر (س۹-س۱۰ و س۱۲، ص۳۳۸)", "level": "چهارگزینه‌ای",
      "count": len(Q9), "questions": Q9}
B7 = {"lesson": 7, "title": "نهایی خرداد ۱۴۰۲ — خوانداری (س۱۳-س۱۵، ص۳۳۹-۳۴۰)", "level": "چهارگزینه‌ای",
      "count": len(Q13 + Q14 + Q15), "questions": Q13 + Q14 + Q15}
for b in (B4, B5, B6, B7):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie1"] = {
    "extractedRound": "r380",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — نخستین برگه: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۴۰۲",
    "examPages": "pdf-p336-340 (پنج صفحهٔ آزمون، فوترِ خودِ اسکن ۲۳۸-۲۴۲) + کلیدِ رسمی: pdf-p341-342 «راهنماي تصحيح امتحان نهايي» (فوتر ۲۴۳-۲۴۵)؛ ص۳۴۳ آغازِ برگهٔ بعدی = مرز",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: کلیه رشته‌ها — نوبت خرداد ۱۴۰۲ (تاریخِ لایه: «٥٢/٣٠/١٠٤١» — ارقامِ معکوسِ RTL) — مدت ۱۲۰ دقیقه — ۲۰ ردیف/بارم ۴۰ — ساعت شروع ۸ صبح — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir)",
    "keyPages": "pdf-p341-342 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (٠.٥) نمره» — نخستین کلیدِ رسمیِ وزارتیِ پروژه؛ ۲۶ کلید از ۲۸ آیتمِ بانک‌ها عینِ چاپ است (تنها ق۳۵ استنتاجی و ق۳۲ کلیدِ خلاصه‌نویسی‌شدهٔ رسمی)",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «21. effectively 22. communicative 23. replaced» / «24. (c) 25. (d) 26. (a)» / «27. early, worm» / «28. (d) 29. (b) 30. (a) 31. (c)» / «fallen» (ق۳۲) / «36. (a) True 37. (running) water, electricity 38. (c) 39. (b) 40. (d)» / «41. (d) 42. (a)» / «45. (a) True 46. (b) False» / «49. International Phonetic Alphabet.» — گاردِ r380 هر ۴۳ فرگمنتِ کلیدِ چاپی را روی لایه پیمان می‌کند",
    "sectionsTotal": 20,
    "sectionsExtracted": 10,
    "sectionsSkipped": 8,
    "items": 29,
    "bankCounts": [6, 7, 6, 10],
    "keyPolicy": "همهٔ کلیدها از راهنمای تصحیحِ چاپی می‌آیند به‌جز: ق۳۵ (کلیدِ ردیف ۱۲ در لایه نیفتاده — who با استنتاجِ ساختاری: شخص+جای خالیِ فاعلی؛ whom مفعولی و which غیرِشخص است — الگویِ مستندِ قدیمی) و ق۳۲ (کلیدِ چاپیِ «fallen» = شکلِ کاملِ «had fallen» — خلاصه‌نویسیِ رسمی؛ گزینه‌ها مهندسی‌شده با همین قفل)؛ گزینه‌های مهندسی‌شدهٔ دیگر: جفت‌های ق۲۷ (شکلِ حروفِ چاپ e----/w---- محترم) و ق۳۷ (جفت‌ها فقط از واژگانِ خودِ متنِ hydro) و ق۴۹",
    "engineNote": "هر ۲۹ آیتم MCQ (قراردادِ کارتِ g12)؛ بانک l4 شش‌گزینه‌ای با استخرِ شش‌واژه‌ایِ کلیدِ چاپی (هر واژه دقیقاً یک خانه)؛ ساقه‌های خوانداری متنِ کاملِ چاپی را در خود دارند (الگویِ r379-بانک۱۹ در مقیاسِ بزرگ‌تر)؛ ترجمه عمداً غایب است (غیبتِ صادقانه — الگویِ r278/r279: نهایی‌ها ترجمهٔ چاپی ندارند)؛ ساقه‌ها نقطه‌چینِ چاپ → «-------» چسبیده (الگویِ r379)؛ آپاستروف/گیومهٔ خمیدهٔ چاپ (’ “ ” ‘) verbatim ماند",
    "derivedKeys": {
        "S4": ["forgive", "knowledge", "faced", "respecting", "feel", "appreciate"],
        "S6": ["effectively", "communicative", "replaced"],
        "S7": ["put things in a neat, attractive, or useful order",
               "tell somebody that something is good", "the rise and fall of the sea"],
        "S8": ["early / worm"],
        "S9-10": ["is he", "whom", "has been translated", "should be done", "had fallen"],
        "S12": ["who"],
        "S13": ["True", "running water / electricity", "hydropower", "water", "Hydropower"],
        "S14": ["experienced", "waved"],
        "S15": ["True", "False", "International Phonetic Alphabet"],
    },
    "skippedSections": [
        "ردیف ۱-۳ (شنیداریِ محض): مکالمه‌های شنیداریِ شیلا/سمیرا، بیژن/مهران، مریم/سارا — ساقه‌ها به صدای شنیداری گره خورده‌اند (صوتی-کلید — همتایِ تصویری-کلید)؛ کلیدهای چاپی‌شان برای آینده: 1.False(b)/2.True(a)/3.False(b)، 4.(c)/5.(c)/6.(b)/7.(a)، 8.(good) dictionary/9.online,smart/10.word,search — کلیدِ رسمی در رسید حفظ شد",
        "ردیف ۵ (تصویری): «با توجه به تصاویر... یک جمله اضافی است» — پنج جملهٔ چاپی (a-e) و کلید چاپی 17.(c)/18.(e)/19.(d)/20.(a) — کلید در تصویر است نه ساقه؛ جملات a-e برای پشتیبانیِ تصویری حفظ شدند (fat/plants/light bulbs/wind towers/hard of hearing)",
        "ردیف ۱۱ (جمله‌سازی 33-34): چیپ‌های چاپی دارند («They / their son / the driving test / were excited / had passed / because / . /») ولی کلیدِ این ردیف در لایهٔ راهنمای تصحیح نیفتاده (نمونه‌پاسخِ دست‌نویسِ رندر-فقط) — بی‌کلیدِ لایه؛ فرصتِ آینده با داوریِ رندر",
        "ردیف ۱۶ (حرفِ ربط با تصویر، 50-51): کلید چاپی (50. so / 51. but) ولی دستورِ سکشن «با توجه به تصویر» است — تصویری-کلید (الگویِ r370+)؛ کلیدها حفظ شد",
        "ردیف ۱۷-۲۰ (نگارشِ تولیدی): 52 جمله با تصویر (کلیدِ مدل: «…but these/those shoes (they) are big.»)، 53 جمله‌سازی از تصویر («Yesterday, my sister saw an ant.»)، 19-20 topic sentence و پاراگرافِ Solar energy — تولیدی با پاسخِ مدلِ چاپی؛ فرصتِ بانکِ تایپیِ آینده (accepted = پاسخِ مدل) — به‌همراه ق۴۳/۴۴/۴۷/۴۸ که پاسخِ مدلِ چاپی دارند",
    ],
    "printQuirks": [
        "تاریخِ امتحان در لایه با ارقامِ معکوسِ RTL: «٥٢/٣٠/١٠٤١» = ۱۴۰۲/۰۳/۲۵ (رندر درست است)",
        "«سؤاﻻت» با لام‌الفِ شکسته در لایه (سربرگِ «سؤاﻻت امتحان نهايي» و «رديف سؤاﻻت)پاسخ نامه دارد»)",
        "«Oh ,yes» — فاصلهٔ چاپی پیش از ویرگول (س۹ق۲۸) — verbatim در ساقه",
        "بلنک‌های چسبیده: «…………….into» (ق۳۰)، «…………..about» (ق۳۱)، «baby………… asleep» (ق۳۲)، «John……………at» (ق۴۲) — به «-------» چسبیده نرمال شد",
        "مخلوطِ گیومهٔ خمیده و مستقیم در یک متن: «“hydroelectric power” یا “hydropower”» خمیده ولی «The Water Cycle» با گیومهٔ مستقیمِ چاپ (متنِ hydro) — verbatim",
        "«Different  sources of energy» با دوفاصلهٔ چاپی در گزینهٔ ق۴۰ — verbatim",
        "آپاستروف‌های خمیدهٔ چاپ: they’ll/wasn’t/learner’s/I’ve/hadn’t/‘dictionary’/‘dictio’ — verbatim (ق۳۵ ساقه‌اش با مستقیم در دستورِ فارسی)",
        "سربرگِ پنج‌صفحه‌ایِ آزمون تکرار می‌شود و فوترِ عددیِ اسکن (۲۳۸-۲۴۵) جدا از شمارهٔ PDF است",
        "کلیدِ ق۳۸ با فاصله‌های چاپیِ عجیب: «38. ( c )» — در پیمانِ گارد با همین شکل",
        "«نهابی» غلطِ تایپیِ چاپ برای نهایی در تیترِ بخشِ چهارم — verbatim در رسید",
    ],
    "futureNote": "بخشِ چهارم چند برگهٔ نهاییِ دیگر دارد (دی/شهریور سال‌های ۱۳۹۷-۱۴۰۱) — الگویِ همین رسید؛ ق۴۳/۴۴/۴۷/۴۸ با پاسخِ مدلِ چاپی کاندیدِ نخستین بانکِ تایپیِ نهایی‌اند (kind=typed با accepted)",
}
famNote = d["source"].get("file", "")
d["source"]["g12nahaie1"]["bookletFile"] = famNote

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r380 OK — banks={len(d['lessons'])} items={total} (+29 in 4 banks: l4=6 l5=7 l6=6 l7=10) — نهایی خرداد ۱۴۰۲ با کلیدِ رسمی")
