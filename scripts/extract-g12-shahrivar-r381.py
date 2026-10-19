#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r381 — برگهٔ دومِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۴۰۱
(pdf-p343-347) با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p348-349)
→ tests-g12.json با ۸ بانکِ تازه (l8=4؛ l9=6؛ l10=8؛ l11=4؛ l12=4؛ l13=4؛ l14=4؛ l15=4)
— ۷ بانکِ قبلی + این = ۱۱ بانک/۳۶۷ آیتم

ساختار آزمون (۱۹ سکشن، ۶۶ ردیف، بارم ۴۰، ۱۲۰ دقیقه، ۵ صفحه، تاریخ ۱۴۰۱/۰۶/۲۱):
  س۱ (۱-۴)    شنیداریِ درست/غلط — صوتی-کلید — مستثنی (کلید چاپی: 1.(b)/2.(a)/3.(a)/4.(b))
  س۲ (۵-۸)    شنیداریِ MCQ — صوتی-کلید — مستثنی (کلید چاپی: 5.(c)/6.(a)/7.(b)/8.(c))
  س۳ (۹-۱۲)   کلوژِ مکالمهٔ مجید/ايرانمهر — متنِ چاپی + کلیدِ چاپی → بانک l8
  س۴ (۱۳-۱۸)  کلوژِ متنِ شنیداریِ چاپ «Last night» — متنِ چاپی + کلیدِ چاپی → بانک l9
  س۵ (۱۹-۲۲)  تصویری (یک جمله اضافی) — تصویری-کلید — مستثنی با داوریِ کاملِ رندر (کلید چاپی: 19.(d)/20.(e)/21.(a)/22.(c))
  س۶ (۲۳-۲۵)  بانکِ ۴واژه‌ای (diary اضافیِ چاپی) → بانک l10
  س۷ (۲۶-۲۸)  تعریف‌یابی A/B (یک تعریف اضافی) → بانک l10
  س۸ (۲۹-۳۰)  حرفِ اولِ چاپی (b----/f----) → بانک l10
  س۹ (۳۱-۳۴)  گرامر MCQ → بانک l11
  س۱۰ (۳۵-۳۷) شکلِ فعلِ باز — کلیدِ چاپی (be kept/had studied/would tell — بلوکِ درهمِ لایه، داوریِ رندر ۳۰۰dpi) — مستثنی؛ کاندیدِ بانکِ تایپی
  س۱۱ (۳۸)    جمله‌سازیِ درهم — پاسخِ مدلِ چاپی (دو ترتیبِ پذیرفته) — مستثنی؛ کاندیدِ تایپی
  س۱۲ (۳۹)    جملهٔ شرطی — پاسخِ مدلِ چاپی «I would travel to the future.» — مستثنی؛ کاندیدِ تایپی
  س۱۳ (۴۰)    ضمیرِ موصولی — کلیدِ چاپی فقط بند-رأیی (which + جملهٔ دارای فعل) — مستثنی
  س۱۴ (۴۱-۴۷) خوانداریِ انرژیِ خورشیدی: ۴۱-۴۴ درست/غلط → بانک l12؛ ۴۵-۴۶ کلیدِ چاپیِ ثابت و ۴۷ پاسخِ مدل — کاندیدِ تایپی
  س۱۵ (۴۸-۵۲) خوانداریِ خواب: ۴۸-۵۱ → بانک l13؛ ۵۲ پاسخِ مدل — کاندیدِ تایپی
  س۱۶ (۵۳-۵۸) خوانداریِ واژه‌نامه: ۵۳-۵۶ → بانک l14؛ ۵۷-۵۸ پاسخِ مدل (۵۸ با داوریِ رندر) — کاندیدِ تایپی
  س۱۷ (۵۹-۶۲) حروفِ ربط (بانکِ چاپی and/or/but/so) → بانک l15
  س۱۸ (۶۳-۶۵) جملهٔ موضوعی — تولیدی — مستثنی
  س۱۹ (۶۶)    پاراگرافِ Water — تولیدی — مستثنی
idempotent: اجرای دوم NO-OP (رسید g12nahaie2).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie2" in d.get("source", {}):
    print("r381: receipt g12nahaie2 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie1" in d.get("source", {}), "tests-g12.json (r380) must exist first"
assert len(d["lessons"]) == 7, f"expected 7 banks before r381, got {len(d['lessons'])}"

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


p343 = page_slice(343)
p344 = page_slice(344)
p345 = page_slice(345)
p346 = page_slice(346)
p347 = page_slice(347)
p348 = page_slice(348)
p349 = page_slice(349)
full = "\n".join(p343 + p344 + p345 + p346 + p347 + p348 + p349)


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
    s = re.sub(r"\s{2,}", " ", raw)
    s = re.sub(r"[….]{4,}", "-------", s)
    return s


# ————— پیمانِ سربرگِ آزمون (ص۳۴۳) —————
assert any("سؤاالت  امتحان" in l for l in p343)
assert any("نوبت شهریور ماه" in l for l in p343)
assert any("سال1401" in l for l in p343)
assert any("120" in l for l in p343)
assert any("aee.medu.ir" in l for l in p343)

# ————— پیمانِ کلیدِ رسمی (ص۳۴۸-۳۴۹ — «راهنمای تصحیح») —————
assert any("راهنمای تصحیح" in l for l in p348)
assert any("راهنمای تصحیح" in l for l in p349)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p348 + p349 if l.strip()))
assert any("تاريخ امتحان" in l for l in p348) and all(
    frag in keyjoin for frag in ["21 / 06 / 1401"]), "تاریخِ کلید = تاریخِ برگه"
KEY_FRAGS = ["1. (b) False", "2. (a) True", "3. (a) True", "4. (b) False",
             "5. (c) badminton", "6. (a) popular", "7. (b) weekend", "8. (c) offline and online",
             "9. recommend", "10. monolingual", "11. elementary", "12. pocket",
             "13. late", "14. office", "15. quiet", "16. walking", "17. wondered", "18. suddenly",
             "19. (d)", "20. (e)", "21. (a)", "22. (c)",
             "23. turbine", "24. identify", "25. shouted",
             "26. (b)", "27. (d)", "28. (c)", "29. burst", "30. flock",
             "31. (b) whom", "32. (c) is spoken", "33. (a) does she", "34. (d) hadn’t played",
             "38. When the teacher came to the class, the students had done their homework.",
             "41. (b) False", "42. (b) False", "43. (a) True", "44. (b) False",
             "45. solar energy", "46. panels",
             "47. Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels.",
             "48. (a) True", "49. (b) False", "50. (c) 6.5", "51. (b) lives less",
             "52. We / You spend", "53. (b) False", "54. (a) True",
             "55. (d) to improve reading understanding", "56. (a) word",
             "57. the meaning of the word",
             "59. so", "60. or", "61. and", "62. but"]
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p348 + p349 if l.strip()))
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# بلوک‌های درهمِ لایه (س۱۰ و ق۵۸) — فقط فرگمنت‌های واقعیِ لایه پیمان می‌شوند؛ کلیدِ کامل با داوریِ رندر
for frag in ["had studied 37.", "kep", "ould", "still conf", "used or think", "are missing important information"]:
    assert frag in keyjoin, f"scrambled key layer fragment missing: {frag}"
assert "جمع نمره40" in keyjoin, "پایانِ کلید (جمع نمره ۴۰)"

# ————— س۳: کلوژِ مکالمهٔ واژه‌نامه (ص۳۴۳) → بانک l8 —————
dialogue = norm_stem(join_inclusive(p343, "Majid: Excuse me", "Majid: Thanks"))
for frag in ["9) Mr. Iranmehr: First, I", "10) Mr. Iranmehr: I suppose a",
             "11) Mr. Iranmehr: For you as a high school student, an", "12) Mr. Iranmehr: Yes, a"]:
    assert frag in dialogue, frag
assert "a learner’s dictionary" in dialogue
UNI8 = ["recommend", "monolingual", "elementary", "pocket"]
Q_L8 = [
    q("g12-l8-1", 1, "vocab", f"{dialogue} — پاسخِ خانهٔ (9): -------",
      ["monolingual", "pocket", "recommend", "elementary"], 2),
    q("g12-l8-2", 2, "vocab", f"{dialogue} — پاسخِ خانهٔ (10): -------",
      ["recommend", "monolingual", "pocket", "elementary"], 1),
    q("g12-l8-3", 3, "vocab", f"{dialogue} — پاسخِ خانهٔ (11): -------",
      ["elementary", "pocket", "monolingual", "recommend"], 0),
    q("g12-l8-4", 4, "vocab", f"{dialogue} — پاسخِ خانهٔ (12): -------",
      ["recommend", "monolingual", "elementary", "pocket"], 3),
]
assert [it["options"][it["answer"]] for it in Q_L8] == UNI8
assert [it["answer"] for it in Q_L8] == [2, 1, 0, 3]
for it in Q_L8:
    assert sorted(it["options"]) == sorted(UNI8) and len(set(it["options"])) == 4, it["id"]

# ————— س۴: کلوژِ متنِ شنیداریِ چاپ «Last night» (ص۳۴۳) → بانک l9 —————
lastnight = norm_stem(join_between(p343, "Last night, I left work", "آزمون شن"))
for frag in ["(13) ------- at around 9 p.m.", "-------(14) ------- , most people",
             "(15) ------- I hadn’t experienced", "(16) ------- , a car pulled over",
             "(17) ------- who can it be?", "(18) ------- , I remembered."]:
    assert frag in lastnight, frag
UNI9 = ["late", "office", "quiet", "walking", "wondered", "suddenly"]
Q_L9 = [
    q("g12-l9-1", 1, "vocab", f"{lastnight} — پاسخِ خانهٔ (13): -------",
      ["quiet", "wondered", "suddenly", "late", "office", "walking"], 3),
    q("g12-l9-2", 2, "vocab", f"{lastnight} — پاسخِ خانهٔ (14): -------",
      ["late", "office", "suddenly", "walking", "quiet", "wondered"], 1),
    q("g12-l9-3", 3, "vocab", f"{lastnight} — پاسخِ خانهٔ (15): -------",
      ["late", "office", "walking", "wondered", "suddenly", "quiet"], 5),
    q("g12-l9-4", 4, "vocab", f"{lastnight} — پاسخِ خانهٔ (16): -------",
      ["walking", "late", "office", "quiet", "wondered", "suddenly"], 0),
    q("g12-l9-5", 5, "vocab", f"{lastnight} — پاسخِ خانهٔ (17): -------",
      ["late", "suddenly", "wondered", "office", "quiet", "walking"], 2),
    q("g12-l9-6", 6, "vocab", f"{lastnight} — پاسخِ خانهٔ (18): -------",
      ["quiet", "late", "office", "walking", "suddenly", "wondered"], 4),
]
assert [it["options"][it["answer"]] for it in Q_L9] == UNI9
assert [it["answer"] for it in Q_L9] == [3, 1, 5, 0, 2, 4]
for it in Q_L9:
    assert sorted(it["options"]) == sorted(UNI9) and len(set(it["options"])) == 6, it["id"]

print("l8/l9 covenants OK")

# ————— س۶: بانکِ واژگان (ص۳۴۴) → بانک l10 —————
S1 = norm_stem("This wind …………… is able to generate a lot of electricity each day.")
S2 = norm_stem("To choose the best dictionary, first …………… your needs.")
S3 = norm_stem("When my mother saw my score, she …………… at me angrily.")
for s in [S1, S2, S3]:
    assert "-------" in s, s
assert "(identify / shouted / diary / turbine)" in full
POOL10 = ["identify", "shouted", "diary", "turbine"]
Q23_25 = [
    q("g12-l10-1", 1, "vocab", S1, POOL10, 3),
    q("g12-l10-2", 2, "vocab", S2, POOL10, 0),
    q("g12-l10-3", 3, "vocab", S3, POOL10, 1),
]
assert [it["options"][it["answer"]] for it in Q23_25] == ["turbine", "identify", "shouted"]
# diary اضافیِ چاپی — هرگز کلید نیست
for it in Q23_25:
    assert it["options"][it["answer"]] != "diary", it["id"]

# ————— س۷: تعریف‌یابی A/B (ص۳۴۴) → بانک l10 —————
S26 = "I really appreciate the culture and art of Iran."
S27 = "I suppose we shouldn’t give up trying after a failure."
S28 = "Pizza contains a lot of fat."
assert S26 in full and S27 in full and S28 in full
DEFS = ["to change in a form", "to be grateful for", "to have something inside", "to think and believe"]
for df in DEFS:
    assert df in full, df
Q26_28 = [
    q("g12-l10-4", 4, "vocab", f"«{S26}» — تعریفِ ستون B برای واژهٔ «appreciate»: -------", DEFS, 1),
    q("g12-l10-5", 5, "vocab", f"«{S27}» — تعریفِ ستون B برای واژهٔ «suppose»: -------", DEFS, 3),
    q("g12-l10-6", 6, "vocab", f"«{S28}» — تعریفِ ستون B برای واژهٔ «contains»: -------", DEFS, 2),
]
assert [it["options"][it["answer"]] for it in Q26_28] == [DEFS[1], DEFS[3], DEFS[2]]
# تعریفِ اضافیِ چاپی (a) هرگز کلید نیست
for it in Q26_28:
    assert it["options"][it["answer"]] != DEFS[0], it["id"]

# ————— س۸: حرفِ اولِ چاپی (ص۳۴۴) → بانک l10 —————
S29 = norm_stem("When Amir saw the film, he b - - - - into tears.")
S30 = norm_stem("People like to spend time with others who are similar to them. Therefore, “Birds of a feather, f - - - - together.”")
assert "b - - - - into tears" in full and "f - - - - together" in full
Q29_30 = [
    q("g12-l10-7", 7, "vocab", S29, ["burst", "flock"], 0),
    q("g12-l10-8", 8, "vocab", S30, ["burst", "flock"], 1),
]
assert [it["options"][it["answer"]] for it in Q29_30] == ["burst", "flock"]

Q_L10 = Q23_25 + Q26_28 + Q29_30

print("l10 covenants OK")

# ————— س۹: گرامر MCQ (ص۳۴۵) → بانک l11 —————
G1 = norm_stem("The boy …………….. you invited arrived very late.")
G2 = norm_stem("English …………….. in many countries.")
G3 = norm_stem("His sister never behaves politely, ……………..?")
G4 = norm_stem("Zahra …………….. chess before, so I showed her what to do.")
for s in [G1, G2, G3, G4]:
    assert "-------" in s, s
for o in ["which", "whom", "whose", "speaks", "is speaking", "is spoken", "has spoken",
          "does she", "doesn’t she", "does he", "doesn’t he", "didn’t play",
          "wasn’t playing", "hasn’t played", "hadn’t played"]:
    assert o in full, o
Q_L11 = [
    q("g12-l11-1", 1, "grammar", G1, ["which", "whom", "who", "whose"], 1),
    q("g12-l11-2", 2, "grammar", G2, ["speaks", "is speaking", "is spoken", "has spoken"], 2),
    q("g12-l11-3", 3, "grammar", G3, ["does she", "doesn’t she", "does he", "doesn’t he"], 0),
    q("g12-l11-4", 4, "grammar", G4, ["didn’t play", "wasn’t playing", "hasn’t played", "hadn’t played"], 3),
]
assert [it["answer"] for it in Q_L11] == [1, 2, 0, 3]

print("l11 covenants OK")

# ————— س۱۴: خوانداریِ انرژیِ خورشیدی (ص۳۴۵) → بانک l12 —————
solar = norm_stem(join_between(p345, "Solar energy is the most effective", "True/False"))
for frag in ["10,000 times greater", "solar panels or mirrors", "around 30 years", "in access"]:
    assert frag in solar, frag
T41 = norm_stem("Solar energy comes from the Earth.")
T42 = norm_stem("Solar panels cost a lot in the last few years.")
T43 = norm_stem("Solar panels convert sunlight into electrical energy.")
T44 = norm_stem("All countries use solar energy to generate electricity.")
Q_L12 = [
    q("g12-l12-1", 1, "grammar", f"{solar} — {T41}", ["True", "False"], 1),
    q("g12-l12-2", 2, "grammar", f"{solar} — {T42}", ["True", "False"], 1),
    q("g12-l12-3", 3, "grammar", f"{solar} — {T43}", ["True", "False"], 0),
    q("g12-l12-4", 4, "grammar", f"{solar} — {T44}", ["True", "False"], 1),
]
# کلیدهای درست/غلط سمانتیک‌اند — چاپ (b,b,a,b) حفظ شد؛ چرخش بی‌معنا
assert [it["answer"] for it in Q_L12] == [1, 1, 0, 1]

# ————— س۱۵: خوانداریِ خواب (ص۳۴۶) → بانک l13 —————
sleep = norm_stem(join_between(p346, "Sleep is essential for all people", "True/False"))
for frag in ["one-third (1/3)", "121 days a year", "6.5 hours a night"]:
    assert frag in sleep, frag
T48 = norm_stem("Food is less important than sleep.")
T49 = norm_stem("There is no difference in sleep time among people.")
M50 = norm_stem("Old people need ……………… hours of sleep each night.")
M51 = norm_stem("A person, who does not sleep, ……………. than one who does not eat.")
Q_L13 = [
    q("g12-l13-1", 1, "grammar", f"{sleep} — {T48}", ["True", "False"], 0),
    q("g12-l13-2", 2, "grammar", f"{sleep} — {T49}", ["True", "False"], 1),
    q("g12-l13-3", 3, "grammar", f"{sleep} — {M50}", ["9 to 10", "10 to 12", "6.5", "16"], 2),
    q("g12-l13-4", 4, "grammar", f"{sleep} — {M51}", ["lives longer", "lives less", "eats more", "gets older"], 1),
]
assert [it["answer"] for it in Q_L13] == [0, 1, 2, 1]

print("l12/l13 covenants OK")

# ————— س۱۶: خوانداریِ واژه‌نامه (ص۳۴۶-۳۴۷) → بانک l14 —————
i_lk = next(i for i, l in enumerate(p346) if "Looking up words" in l)
i_ft = next(i for i, l in enumerate(p346) if "ادامه سواالت در صفحه" in l)
i_rs = next(i for i, l in enumerate(p347) if "aee.medu.ir" in l)
i_tf = next(i for i, l in enumerate(p347) if "True/False" in l)
seg = [l.strip() for l in p346[i_lk:i_ft] if l.strip()] + \
      [l.strip() for l in p347[i_rs + 1:i_tf] if l.strip()]
dictpass = norm_stem(" ".join(seg))
for frag in ["which definition to choose", "prefixes, suffixes or roots",
             "learner’s dictionaries", "monolingual dictionaries", "bilingual dictionaries"]:
    assert frag in dictpass, frag
D53 = norm_stem("After looking the word up, try to guess it.")
D54 = norm_stem("The information around the words helps you guess their meanings.")
D55 = norm_stem("Dictionary helps you………………………..")
D56 = norm_stem("What does \"it\" in paragraph one refer to……………. ")
Q_L14 = [
    q("g12-l14-1", 1, "grammar", f"{dictpass} — {D53}", ["True", "False"], 1),
    q("g12-l14-2", 2, "grammar", f"{dictpass} — {D54}", ["True", "False"], 0),
    q("g12-l14-3", 3, "grammar", f"{dictpass} — {D55}",
      ["to miss important information", "to guess the meaning of the word",
       "to read the whole sentence", "to improve reading understanding"], 3),
    q("g12-l14-4", 4, "grammar", f"{dictpass} — {D56}", ["word", "dictionary", "context", "meaning"], 0),
]
assert [it["answer"] for it in Q_L14] == [1, 0, 3, 0]

# ————— س۱۷: حروفِ ربط (ص۳۴۷) → بانک l15 —————
C59 = norm_stem("You lost the game! …………….… if you want to succeed, you have to practice more.")
C60 = norm_stem("You can take a bus, …………….… you can take a taxi.")
C61 = norm_stem("I went to the whiteboard, ………………... I wrote the topic of the new lesson.")
C62 = norm_stem("My brother is a rich man, ……………… my sister is poor.")
for s in [C59, C60, C61, C62]:
    assert "-------" in s, s
assert "(and, or, but, so)" in full
CONJ = ["and", "or", "but", "so"]
Q_L15 = [
    q("g12-l15-1", 1, "grammar", C59, CONJ, 3),
    q("g12-l15-2", 2, "grammar", C60, CONJ, 1),
    q("g12-l15-3", 3, "grammar", C61, CONJ, 0),
    q("g12-l15-4", 4, "grammar", C62, CONJ, 2),
]
assert [it["options"][it["answer"]] for it in Q_L15] == ["so", "or", "and", "but"]
assert [it["answer"] for it in Q_L15] == [3, 1, 0, 2]
for it in Q_L15:
    assert sorted(it["options"]) == sorted(CONJ), it["id"]

print("l14/l15 covenants OK")

# ————— درج در سند —————
B8 = {"lesson": 8, "title": "نهایی شهریور ۱۴۰۱ — کلوژِ مکالمهٔ واژه‌نامه (س۳، ص۳۴۳)", "level": "چهارگزینه‌ای",
      "count": len(Q_L8), "questions": Q_L8}
B9 = {"lesson": 9, "title": "نهایی شهریور ۱۴۰۱ — متنِ شنیداریِ چاپ (س۴، ص۳۴۳)", "level": "شش‌گزینه‌ای",
      "count": len(Q_L9), "questions": Q_L9}
B10 = {"lesson": 10, "title": "نهایی شهریور ۱۴۰۱ — واژگان و تعریف و حرفِ اول (س۶-س۸، ص۳۴۴)", "level": "چهارگزینه‌ای",
       "count": len(Q_L10), "questions": Q_L10}
B11 = {"lesson": 11, "title": "نهایی شهریور ۱۴۰۱ — گرامر (س۹، ص۳۴۵)", "level": "چهارگزینه‌ای",
       "count": len(Q_L11), "questions": Q_L11}
B12 = {"lesson": 12, "title": "نهایی شهریور ۱۴۰۱ — خوانداریِ انرژیِ خورشیدی (س۱۴، ص۳۴۵-۳۴۶)", "level": "چهارگزینه‌ای",
       "count": len(Q_L12), "questions": Q_L12}
B13 = {"lesson": 13, "title": "نهایی شهریور ۱۴۰۱ — خوانداریِ خواب (س۱۵، ص۳۴۶)", "level": "چهارگزینه‌ای",
       "count": len(Q_L13), "questions": Q_L13}
B14 = {"lesson": 14, "title": "نهایی شهریور ۱۴۰۱ — خوانداریِ واژه‌نامه (س۱۶، ص۳۴۶-۳۴۷)", "level": "چهارگزینه‌ای",
       "count": len(Q_L14), "questions": Q_L14}
B15 = {"lesson": 15, "title": "نهایی شهریور ۱۴۰۱ — حروفِ ربط (س۱۷، ص۳۴۷)", "level": "چهارگزینه‌ای",
       "count": len(Q_L15), "questions": Q_L15}
for b in (B8, B9, B10, B11, B12, B13, B14, B15):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie2"] = {
    "extractedRound": "r381",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ دوم (و آخرین برگهٔ کتاب): «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۴۰۱",
    "examPages": "pdf-p343-347 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p348-349 «راهنمای تصحیح امتحان نها :يي» (سربرگِ شکستهٔ لایه)؛ مرزِ برگه‌ها = p342→p343؛ p349 آخرین صفحهٔ جزوه است (۳۴۹ صفحه)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: کلیه رشته‌ها — نوبت شهریور ۱۴۰۱ (تاریخِ چاپی: ۲۱/۰۶/۱۴۰۱ — این‌بار ارقامِ لایه سالم) — مدت ۱۲۰ دقیقه — ۱۹ سکشن/۶۶ ردیف/بارم ۴۰ — ساعت شروع ۸ صبح — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — «نمره موفق باشید40»",
    "keyPages": "pdf-p348-349 راهنمای تصحیحِ رسمی — «هر پاسخ صحیح (5/.) نمره» (عددِ اعشاریِ معکوسِ چاپ) — ۵۵ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۳۶ کلید از ۳۸ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «9. recommend 10. monolingual 11. elementary 12. pocket» / «13. late 14. office 15. quiet 16. walking 17. wondered 18. suddenly» / «23. turbine 24. identify 25. shouted» / «26. (b) 27. (d) 28. (c)» / «29. burst 30. flock» / «31. (b) whom 32. (c) is spoken 33. (a) does she 34. (d) hadn’t played» / «41. (b) False 42. (b) False 43. (a) True 44. (b) False» / «48. (a) True 49. (b) False 50. (c) 6.5 51. (b) lives less» / «53. (b) False 54. (a) True 55. (d) to improve reading understanding 56. (a) word» / «59. so 60. or 61. and 62. but» — بلوکِ درهمِ لایه برای س۱۰ («kep/ould/t/be» پراکنده) و ق۵۸ با داوریِ رندرِ ۳۰۰dpi (/tmp/qa-r381/p348-s10-key.png و p349-s16-key.png): «35. be kept 36. had studied 37. would tell» و «58. we are still confused or think we are missing important information.»",
    "sectionsTotal": 66,
    "sectionsExtracted": 38,
    "sectionsSkipped": 28,
    "items": 38,
    "bankCounts": [4, 6, 8, 4, 4, 4, 4, 4],
    "keyPolicy": "همهٔ کلیدهای ۳۸ آیتم از راهنمای تصحیحِ چاپی می‌آیند (۳۶ عینِ چاپ؛ فقط ترتیبِ گزینه‌های بانک‌های کلوژِ l8/l9 و جفتِ حرفِ اولِ l10 مهندسی‌شده‌اند — استخرِ واژگانی از خودِ کلیدِ رسمی، الگویِ r380-l4؛ چرخش‌های تازه: l8=[2,1,0,3] و l9=[3,1,5,0,2,4] — غیر از [0,2,4,1,3,5]ِ r380)؛ کلیدهای درست/غلطِ l12/l13/l14 سمانتیک‌اند و چرخش نمی‌پذیرند (چاپِ l12 دو کلیدِ Falseِ پیاپی دارد — حفظِ وفادار)؛ حروفِ ربطِ l15 بانکِ چاپیِ خودش را دارد (keys [3,1,0,2] — هر واژه دقیقاً یک‌بار)",
    "engineNote": "هر ۳۸ آیتم MCQ (قراردادِ کارتِ g12)؛ ساقه‌های خوانداری هر سه متنِ کاملِ چاپی را در خود دارند (الگویِ r380-l7 در سه متن)؛ ساقه‌های کلوژِ س۳/س۴ متنِ چاپی + «پاسخِ خانهٔ (N)» (الگویِ r380-l4)؛ ساقه‌های تعریف‌یابی دوبخشیِ فارسی (الگویِ r380-l5)؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند — الگویِ r278/r279)؛ نقطه‌چینِ چاپ → «-------» چسبیده؛ آپاستروف/گیومهٔ خمیده و مستقیمِ مختلط verbatim",
    "derivedKeys": {
        "S3": ["recommend", "monolingual", "elementary", "pocket"],
        "S4": ["late", "office", "quiet", "walking", "wondered", "suddenly"],
        "S6": ["turbine", "identify", "shouted"],
        "S7": ["to be grateful for", "to think and believe", "to have something inside"],
        "S8": ["burst", "flock"],
        "S9": ["whom", "is spoken", "does she", "hadn’t played"],
        "S14": ["False", "False", "True", "False"],
        "S15": ["True", "False", "6.5", "lives less"],
        "S16": ["False", "True", "to improve reading understanding", "word"],
        "S17": ["so", "or", "and", "but"],
    },
    "paperMap": "نقشهٔ سرانگشتیِ بخشِ چهارم (کشفِ این راند — r380 فقط نخستین برگه را دیده بود): بخش از ص۲۲۷ (جلدِ «آزمونهای از دی ماه1397») تا ص۳۴۹؛ ~۱۵ برگهٔ نهاییِ دارایِ لایه + کلیدِ چاپی: خرداد (ص۲۳۷-۲۴۳)، شهریور (ص۲۴۴-۲۵۰)، دی (ص۲۵۱-۲۵۸)، خرداد (ص۲۵۹-۲۶۷)، خرداد (ص۲۶۸-۲۷۴)، دو برگهٔ ص۲۷۵-۲۸۴، شهریور (ص۲۸۵-۲۹۲)، شهریور (ص۲۹۳-۳۰۰)، دی (ص۳۰۱-۳۰۷)، خرداد (ص۳۰۸-۳۱۴)، خرداد (ص۳۱۵-۳۲۱)، شهریور (ص۳۲۲-۳۲۸)، دی (ص۳۲۹-۳۳۵)، خرداد ۱۴۰۲ (ص۳۳۶-۳۴۲ = r380)، شهریور ۱۴۰۱ (ص۳۴۳-۳۴۹ = r381) — سالِ دقیقِ هر برگه در پروبِ راندِ بعدی تأیید می‌شود",
    "skippedSections": [
        "س۱ (ردیف ۱-۴، شنیداریِ درست/غلط): مکالمهٔ پدر/پسر — صوتی-کلید (متنِ مکالمه چاپ نیست)؛ کلیدهای چاپی: 1.(b) False / 2.(a) True / 3.(a) True / 4.(b) False — در رسید حفظ شد",
        "س۲ (ردیف ۵-۸، شنیداریِ MCQ): مکالمهٔ خانم گزارشگر/ورزشکار — صوتی-کلید؛ کلیدهای چاپی: 5.(c) badminton / 6.(a) popular / 7.(b) weekend / 8.(c) offline and online",
        "س۵ (ردیف ۱۹-۲۲، تصویری): «با توجه به تصاویر... یک جمله اضافی است» — چهار تصویر با داوریِ کاملِ رندر (ص۳۴۴): (19) بادگیرِ یزد→d، (20) دودکش‌های کارخانه با علامتِ پرتوزایی→e، (21) ذره‌بین رویِ روزنامه→a، (22) نوجوانِ کمک‌کننده به سالمند→c؛ اضافیِ چاپی: b) Absence makes the heart grow fonder — هم‌خوانِ کلیدِ رسمی",
        "س۱۰ (ردیف ۳۵-۳۷، شکلِ فعلِ باز): کلیدِ چاپی «be kept / had studied / would tell» — بدونِ گزینهٔ چاپی؛ کاندیدِ نخستِ بانکِ تایپی (کلیدِ رشته‌ایِ دقیق)",
        "س۱۱-س۱۳ (ردیف ۳۸-۴۰): جمله‌سازیِ درهم (پاسخِ مدلِ دوترتیب: «When the teacher came to the class, the students had done their homework.» یا وارونش) و جملهٔ شرطی («I would travel to the future.» بارم ۰.۲۵/۰.۲۵/۰.۵) و ضمیرِ موصولی (کلیدِ بند-رأیی: which + جملهٔ دارای فعل) — کاندیدِ تایپی/تولیدی",
        "ردیف ۴۵-۴۷ (تکمیلِ خورشیدی): کلیدِ چاپیِ ثابت «solar energy / panels» و پاسخِ مدلِ ۴۷ — کاندیدِ تایپی؛ ردیف ۵۲ (پاسخِ مدلِ خواب: «We / You spend about one-third (1/3) of our lives in sleep.») — کاندیدِ تایپی؛ ردیف ۵۷-۵۸ (پاسخِ مدلِ واژه‌نامه: «the meaning of the word.» و «we are still confused or think we are missing important information.») — کاندیدِ تایپی",
        "س۱۸-س۱۹ (ردیف ۶۳-۶۶، نگارشِ تولیدی): سه جملهٔ موضوعی (Iran/Books/Computer) و پاراگرافِ Water با (Topic/Supporting/Concluding Sentence) — تولیدی؛ کلیدِ بند-رأییِ رسمی («با توجه به رعایت اصول جمله موضوعی»)",
    ],
    "printQuirks": [
        "«سؤاﻻت» با لام‌الفِ شکسته در سربرگِ آزمون (همان الگویِ r380) و «راهنمای تصحیح امتحان نها :يي» با دونقطهٔ جابه‌جا در سربرگِ کلید",
        "بلوک‌های کلیدِ RTLِ درهم: س۱۰ به قطعاتِ «tell/ould/w/t/kep/be» و ق۵۸ به «still conf/used or think/e w» شکسته — فقط رندرِ ۳۰۰dpi کلیدِ کامل را می‌دهد (درسِ r380-ق۳۲ تکرار شد)",
        "عددِ اعشاریِ معکوسِ چاپ: «5/.» = ۰.۵ در سربرگِ هر سکشنِ کلید",
        "مخلوطِ آپاستروفِ خمیده و مستقیم در یک متنِ واحد: واژه‌نامه با don't/won'tِ مستقیم ولی learner’s خمیده (برخلافِ متنِ مکالمهٔ س۳ که کاملاً خمیده است: I’d/learner’s)",
        "«not only in access but» در متنِ خورشیدی — عبارتِ عجیبِ چاپ (انتظار: in reach) — verbatim حفظ شد",
        "گیومهٔ خمیدهٔ چاپ در اصطلاحِ «“Birds of a feather, f - - - - together.”» و گیومهٔ مستقیمِ چاپ در «What does \"it\" in paragraph one» — هر دو verbatim",
        "«the students had done their homework when the teacher came to the class,» — ویرگولِ پایانیِ چاپیِ وارونشِ ۳۸ در خودِ کلید",
        "سربرگِ پنج‌صفحه‌ایِ آزمون (ردیف/نمره/تعداد صفحات5) در هر پنج صفحه تکرار می‌شود — فیلترِ سرحدیِ گارد",
        "«نمره موفق باشید40» و «جمع نمره40» — دو امضای پایانیِ چاپیِ آزمون و کلید",
    ],
    "futureNote": "بخشِ چهارم ~۱۳ برگهٔ دیگر دارد (ص۲۲۸-۳۳۵ — نقشهٔ paperMap) که همه کلیدِ چاپی دارند — الگویِ همین رسید؛ کاندیدهای تایپیِ این برگه (س۱۰ و ردیف‌های ۳۸/۳۹/۴۵-۴۷/۵۲/۵۷-۵۸) به‌همراهِ شش پاسخِ مدلِ r380 = بانکِ تایپیِ آینده؛ ص۳۴۹ = آخرین صفحهٔ جزوه دوازدهم — بخشِ نهایی‌ها با این برگه بسته شد",
}
d["source"]["g12nahaie2"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r381 OK — banks={len(d['lessons'])} items={total} (+38 in 8 banks: l8=4 l9=6 l10=8 l11=4 l12=4 l13=4 l14=4 l15=4) — نهایی شهریور ۱۴۰۱ با کلیدِ رسمی")
