#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r387 — برگهٔ هشتمِ بخشِ نهایی‌ها: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۳۹۹
(تمام رشته‌ها؛ تاریخِ چاپی ۱۳/۰۶/۹۹؛
pdf-p285-290 آزمون + کلیدِ رسمیِ «راهنمای تصحیح» pdf-p291-292)
→ tests-g12.json با ۹ بانکِ تازه (l51=6؛ l52=3؛ l53=3؛ l54=6؛ l55=4؛ l56=4؛ l57=4؛ l58=4؛ l59=4)
— ۵۰ بانکِ قبلی + این = ۵۹ بانک/۵۵۹ آیتم

ساختار آزمون (۱۸ سکشن، ۶۷ ردیف، بارم ۴۸، ۱۲۰ دقیقه، ۶ صفحه، شروع ۸ صبح):
  س۱ (۱-۳)    شنیداریِ MCQ (Amin/Behzad) — صوتی-کلید — مستثنی (کلید: 1.( a )/2.( c )/3.( c ) — سه‌تاییِ پرانتز-فاصله‌دارِ پیاپی)
  س۲ (۴-۶)    شنیداریِ کوتاه (کتابِ الکس) — صوتی-کلید — مستثنی (کلید: 4. He left his jacket on the bus. / 5. False ( b)/6. True (a))
  س۳ (۷-۸)    شنیداریِ کوتاه (جشنِ تولد) — صوتی-کلید — مستثنی (کلید: 7. It is at 6:30. / 8. She may bring a birthday card.)
  س۴ (۹-۱۴)   شنیداریِ کلوژِ چاپِ گفت‌وگوی نیک (ورزش) — متنِ چاپی + کلیدِ چاپی → بانک l51 (چهارگزینه‌ایِ چرخشی)
  س۵ (۱۵-۱۸)  تصویری (یک جمله اضافی: e) — تصویری-کلید — مستثنی (کلید: 15.( b )/16.( d )/17.( a )/18.( c )؛
              داوریِ رندرِ ۳۰۰dpi: ۱۵=بالکن، ۱۶=پنلِ خورشیدی، ۱۷=در آغوش‌گرفتن، ۱۸=لغت‌نامهٔ دایره‌کشیده؛
              اضافیِ چاپی = e «The sofa converts into bed.»)
  س۶ (۱۹-۲۱)  بانکِ ۴واژه‌ایِ چاپ (repeatedly, forever, demand, arrange — اضافیِ چاپی: forever) → بانک l52
  س۷ (۲۲-۲۴)  حرفِ اولِ شکل‌پا (h- - - - - -=hearing؛ s - - - - phones=smart؛ p - - - - - -=pollute) → بانک l53
  س۸ (۲۵-۳۰)  گرامر MCQ (tag/موصولی/مجهول/شرطی/قیدِ -ly) → بانک l54 (کلیدهای چاپی [b,c,b,d,c,a]؛ بک‌تیکِ چاپ در گزینه‌های ۲۵)
  س۹ (۳۱)     تولیدیِ موصولی (which + جمله) — مستثنی («کلیدِ کامل در لایه نیست» — «w»+«hich» آشفته)
  س۱۰ (۳۲)    تولیدیِ شرطی (would/could/might) — مستثنی
  س۱۱ (۳۳-۳۸) خوانداریِ احترام: ۳۳-۳۶ → بانک l55؛ ۳۷/۳۸ پاسخِ مدلِ چاپی — مستثنی
  س۱۲ (۳۹-۴۴) خوانداریِ انسان‌های نخستین: ۳۹-۴۲ → بانک l56 (متنِ لایه‌آشفته — بازجوشِ داوری‌شدهٔ ۳۰۰dpi؛
              «they» توپُر/زیرخط‌دارِ چاپ)؛ ۴۳=means و ۴۴=founding تک‌واژه‌ایِ تایپی — کاندیدِ بانکِ تایپی
  س۱۳ (۴۵-۴۸) حروفِ ربط (but, and, so, or — ترتیبِ چاپِ دستور) → بانک l57 (کلیدهای چاپی [and,or,but,so] در [1,3,0,2]؛
              omelet با اتصالِ ویرگولی — دوقلویِ r384-l34-1؛ dictionary با اتصالِ ویرگولی — دوقلویِ r385-l41-2)
  س۱۴ (۴۹)    تصویری-ربط (Saeed + دو تصویر) — کلیدِ چاپیِ «49. …so he passed it.» — مستثنی
  س۱۵ (۵۰)    Topic Sentenceِ Smoking — تولیدی — مستثنی
  س۱۶ (۵۱-۵۸) انتخابیِ الف/ب: الف تعریف‌یابی (۵۱-۵۴؛ اضافیِ چاپیِ b «cry suddenly») → بانک l58؛
              ب اصطلاحات (۵۵-۵۸؛ اضافیِ چاپیِ i) → بانک l59
  س۱۷ (۵۹-۶۲) جمله‌سازیِ انتخابی — پاسخ‌های مدلِ چاپی (با بک‌تیکِ چاپ در ۶۰/۶۱) — کاندیدِ بانکِ تایپی
  س۱۸ (۶۳-۶۷) نگارشِ انتخابیِ تصویری (Ferdowsi/Watching TV/Sport/Clean energy + چیپ‌های healthy lifestyle) — مستثنی
idempotent: اجرای دوم NO-OP (رسید g12nahaie8).
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g12nahaie8" in d.get("source", {}):
    print("r387: receipt g12nahaie8 already present — NO-OP")
    raise SystemExit(0)
assert d and "g12nahaie7" in d.get("source", {}), "tests-g12.json (r386) must exist first"
assert len(d["lessons"]) == 50, f"expected 50 banks before r387, got {len(d['lessons'])}"

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


p285 = page_slice(285)
p286 = page_slice(286)
p287 = page_slice(287)
p288 = page_slice(288)
p289 = page_slice(289)
p290 = page_slice(290)
p291 = page_slice(291)
p292 = page_slice(292)
full = "\n".join(p285 + p286 + p287 + p288 + p289 + p290)


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
    """خانه‌های شماره‌دارِ بدونِ پرانتزِ چاپ («…9…….») → «------- (9) -------»
    (الگویِ چاپِ این برگه مانندِ r386 — برخلافِ r381/r383 با پرانتز) — پیش از norm اجرا شود."""
    return re.sub(r"[….]+\s*(\d{1,2})\s*[….]+", lambda m: f"------- ({m.group(1)}) -------", raw)


def line_after_dot(pages: list[str], frag: str) -> str:
    l = next(l for l in pages if frag in l)
    return l.strip().split(".", 1)[1].strip()


# ————— پیمانِ سربرگِ آزمون (ص۲۸۵ — presentation-forms با دوفاصله، الگویِ r383/r386) —————
assert any("ﺳﺆاﻻت  اﻣﺘﺤﺎن" in l for l in p285), "سربرگِ فرم‌های ارائه با دوفاصله"
assert any("1399" in l for l in p285)
assert any("aee.medu.ir" in l for l in p285)
assert any("دوازدﻫﻢ" in l for l in p285), "پایهٔ دوازدهم"
p285join = re.sub(r"\s+", " ", " ".join(p285))
assert "13 / 06 / 99" in p285join, "تاریخِ ۱۳/۰۶/۹۹"
assert "8ﺻﺒﺢ" in p285join, "ساعتِ شروعِ ۸ صبح"
assert "ﺷﻬﺮﯾﻮرﻣﺎه" in p285join, "نوبتِ شهریورماه"
assert "120دﻗﯿﻘﻪ" in p285join, "مدتِ ۱۲۰ دقیقه"
assert any("Audio" in l for l in p285), "پاورقیِ Audio script / MP3"
assert "ﺗﻤﺎﻣ" in p285join, "رشته: تمام رشته‌ها (فرم‌های ارائه)"

# ————— پیمانِ کلیدِ رسمی (ص۲۹۱-۲۹۲) —————
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p291)
assert any("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ" in l for l in p292)
keyjoin = re.sub(r"\s{2,}", " ", " ".join(l.strip() for l in p291 + p292 if l.strip()))
assert "13 / 06 / 1399" in keyjoin, "تاریخِ کلید = تاریخِ برگه (سالِ کامل)"
KEY_FRAGS = ["1. ( a )", "2. ( c )", "3. ( c )",
             "4. He left his jacket on the bus.", "5. False ( b)", "6. True (a)",
             "7. It is at 6:30.", "8. She may bring a birthday card.",
             "9. volleyball", "10. team", "11. fun", "12. play", "13. twice", "14. games",
             "15. ( b )", "16.( d )", "17. ( a )", "18. ( c )",
             "19. arrange", "20. demand", "21. repeatedly",
             "22. hearing", "23. smart", "24. pollute",
             "25. ( b)", "26. ( c )", "27. ( b )", "28. ( d )", "29. ( c )", "30. ( a )",
             "33. (a) True", "34. (b) False", "35. ( d )", "36. ( a )",
             "38.Yes, it can, for example, washing the dishes/ cleaning the kitchen/ cleaning the room",
             "39. (a) True", "40. (a) True", "41. ( b )", "42. ( d )",
             "43. means", "44. founding",
             "45. and", "46. or", "47. but", "48. so",
             "49. …so he passed it.",
             "51- c", "52- a", "53- d", "54- e", "55- j", "56- h", "57- f", "58- g",
             "59. There are some workers and teachers who work in the village.",
             "60. The girl wrote a letter, didn`t she?",
             "61. Everything in the garden was brown because it hadn`t rained.",
             "62. The parents should be called by the teacher."]
for kf in KEY_FRAGS:
    assert kf in keyjoin, f"printed key fragment missing: {kf}"
# س۹: پاسخِ مدلِ «1. which» در لایهٔ کلید آشفته است («w»+«hich» جدا؛ «1.» پس ازشان) —
# ولی راهنمای فارسیِ سطرِ معلم «which» سالم دارد — پیمان روی پاسخِ مدل است نه راهنما
assert "1. which" not in keyjoin, "پاسخِ مدلِ س۹ باید آشفته بماند"
assert any(l.strip() == "hich" for l in p291) and any(l.strip() == "w" for l in p291), "فرگمنت‌های آشفتهٔ which"
# س۱۰: (would ,could ,might) با فاصله‌های چاپی
assert "(would ,could ,might)" in keyjoin, "کلیدِ شرطیِ س۱۰"
# س۱۱ ق۳۷: پاسخِ مدل = انتهای متنِ چاپیِ خودِ خوانداری (در لایهٔ کلید شکسته) — فرگمنتِ آغازین
assert "37. The easiest way to show your love and respect is to tell them that you appreciate who" in keyjoin

# ————— س۴: کلوژِ شنیداریِ چاپِ گفت‌وگوی نیک (ص۲۸۵) → بانک l51 (چهارگزینه‌ایِ چرخشی) —————
nick = norm_stem(gapify(join_inclusive(p285, "Do you play any sports, Nick?", "not sure about that")))
for frag in ["my favorite sport is------- (9) ------- A: Really?",  # نقطهٔ پایانیِ چاپ در دنبالهٔ نقطه‌های خانه بود — gapify گرسنه آن را هم برد
             "Are you on a ------- (10) ------- .?",
             "It is a lot of ------- (11) ------- .",
             "How often do you ------- (12) -------?",
             "about ------- (13) ------- a week",
             "playing video ------- (14) ------- is a sport?",
             "Umm, I am not sure about that."]:
    assert frag in nick, frag
UNI51 = ["volleyball", "team", "fun", "play", "twice", "games"]  # استخرِ کلیدِ رسمی
Q_L51 = [
    q("g12-l51-1", 1, "vocab", f"{nick} — پاسخِ خانهٔ (9): -------",
      ["team", "fun", "volleyball", "twice"], 2),
    q("g12-l51-2", 2, "vocab", f"{nick} — پاسخِ خانهٔ (10): -------",
      ["team", "games", "volleyball", "play"], 0),
    q("g12-l51-3", 3, "vocab", f"{nick} — پاسخِ خانهٔ (11): -------",
      ["play", "twice", "games", "fun"], 3),
    q("g12-l51-4", 4, "vocab", f"{nick} — پاسخِ خانهٔ (12): -------",
      ["twice", "play", "volleyball", "fun"], 1),
    q("g12-l51-5", 5, "vocab", f"{nick} — پاسخِ خانهٔ (13): -------",
      ["games", "play", "twice", "team"], 2),
    q("g12-l51-6", 6, "vocab", f"{nick} — پاسخِ خانهٔ (14): -------",
      ["games", "volleyball", "team", "play"], 0),
]
# کلیدهای چاپی [volleyball, team, fun, play, twice, games] با چرخشِ تازهٔ [2,0,3,1,2,0] — بدونِ تکرارِ مجاور
assert [it["options"][it["answer"]] for it in Q_L51] == UNI51
assert [it["answer"] for it in Q_L51] == [2, 0, 3, 1, 2, 0]
ans51 = [it["answer"] for it in Q_L51]
for i in range(1, len(ans51)):
    assert ans51[i] != ans51[i - 1], f"adjacent key run at {i}"
assert len({tuple(it["options"]) for it in Q_L51}) == 6, "چرخش‌های تکراری"

# ————— س۶: بانکِ واژگانِ چاپ (ص۲۸۶) → بانک l52 —————
S19 = norm_stem(line_after_dot(p286, "19. We’ll need to"))
S20 = norm_stem(line_after_dot(p286, "20. The ……………for organic"))
S21 = norm_stem(line_after_dot(p286, "21. I have told Mohsen……………"))
assert S19 == "We’ll need to------- the chairs around the table.", S19
assert S20 == "The -------for organic food is increasing these days.", S20
assert S21 == "I have told Mohsen-------to talk politely to his teacher.", S21
assert "repeatedly, forever, demand, arrange" in full
POOL52 = ["repeatedly", "forever", "demand", "arrange"]  # ترتیبِ چاپ
Q_L52 = [
    q("g12-l52-1", 1, "vocab", S19, POOL52, 3),
    q("g12-l52-2", 2, "vocab", S20, POOL52, 2),
    q("g12-l52-3", 3, "vocab", S21, POOL52, 0),
]
# کلیدهای چاپی [arrange, demand, repeatedly] — اضافیِ چاپیِ forever هرگز کلید نیست
assert [it["options"][it["answer"]] for it in Q_L52] == ["arrange", "demand", "repeatedly"]
for it in Q_L52:
    assert it["options"][it["answer"]] != "forever", it["id"]

# ————— س۷: حرفِ اولِ شکل‌پا (ص۲۸۶) → بانک l53 — گزینه‌های هم‌شکلِ مهندسی‌شده —————
S22 = line_after_dot(p286, "22. They have to speak louder")
S23 = line_after_dot(p286, "23. There are some free dictionaries")
S24 = line_after_dot(p286, "24. We should not build factories")
assert S22 == "They have to speak louder, because their grandmother is hard of h- - - - - -.", S22
assert S23 == "There are some free dictionaries for PCs and apps for s - - - - phones.", S23
assert S24 == "We should not build factories near rivers because they p - - - - - - the rivers.", S24
Q_L53 = [
    q("g12-l53-1", 1, "vocab", S22, ["hopeful", "hearing", "hurting", "helping"], 1),
    q("g12-l53-2", 2, "vocab", S23, ["smart", "small", "spare", "stand"], 0),
    q("g12-l53-3", 3, "vocab", S24, ["prevent", "protect", "pollute", "plaster"], 2),
]
for o in Q_L53[0]["options"]:
    assert re.fullmatch(r"h[a-z]{6}", o), o   # h + ۶ خطِ چاپ → ۷حرفی
for o in Q_L53[1]["options"]:
    assert re.fullmatch(r"s[a-z]{4}", o), o   # s + ۴ خطِ چاپ → ۵حرفی (smart)
for o in Q_L53[2]["options"]:
    assert re.fullmatch(r"p[a-z]{6}", o), o   # p + ۶ خطِ چاپ → ۷حرفی
assert [it["options"][it["answer"]] for it in Q_L53] == ["hearing", "smart", "pollute"]

# ————— س۸: گرامر MCQ (ص۲۸۶) → بانک l54 —————
G25 = norm_stem(line_after_dot(p286, "25. They will buy a new house"))
G26 = norm_stem(line_after_dot(p286, "26. My mother found the keys"))
G27 = norm_stem(line_after_dot(p286, "27. Hafez"))
i28 = next(i for i, l in enumerate(p286) if "28. A: What is the problem?" in l)
G28 = norm_stem(p286[i28].strip().split(".", 1)[1].strip() + " " +
                next(l.strip() for l in p286 if l.strip().startswith("B: The windows")))
G29 = norm_stem(line_after_dot(p286, "29. If the old man had his glasses"))
G30 = norm_stem(line_after_dot(p286, "30.  My job has become"))
assert G25 == "They will buy a new house, -------?", G25
assert G26 == "My mother found the keys ------- I lost last week.", G26
assert G27 == "Hafez ------- to be as one of the most famous Persian poet of all time.", G27
assert G28 == "A: What is the problem? B: The windows -------by the boys.", G28
assert G29 == "If the old man had his glasses, he ------- the paper easily.", G29
assert G30 == "My job has become ------- difficult because of my illness.", G30
# بک‌تیکِ چاپ در گزینه‌های ۲۵ (won`t) — عینِ چاپ؛ و quirkِ «Persian poet» مفرد در ۲۷
for o in ["won`t he", "won`t they", "will they", "will he",
          "when", "whom", "which", "who",
          "knows", "is known", "knowing", "has known",
          "are breaking", "have broken", "broke", "have been broken",
          "can read", "was reading", "could read", "read",
          "increasingly", "increase", "increasing", "increases"]:
    assert o in full, o
Q_L54 = [
    q("g12-l54-1", 1, "grammar", G25, ["won`t he", "won`t they", "will they", "will he"], 1),
    q("g12-l54-2", 2, "grammar", G26, ["when", "whom", "which", "who"], 2),
    q("g12-l54-3", 3, "grammar", G27, ["knows", "is known", "knowing", "has known"], 1),
    q("g12-l54-4", 4, "grammar", G28, ["are breaking", "have broken", "broke", "have been broken"], 3),
    q("g12-l54-5", 5, "grammar", G29, ["can read", "was reading", "could read", "read"], 2),
    q("g12-l54-6", 6, "grammar", G30, ["increasingly", "increase", "increasing", "increases"], 0),
]
# کلیدهای چاپی [b,c,b,d,c,a] — ترتیبِ چاپ حفظ شد
assert [it["answer"] for it in Q_L54] == [1, 2, 1, 3, 2, 0]
assert [it["options"][it["answer"]] for it in Q_L54] == ["won`t they", "which", "is known", "have been broken", "could read", "increasingly"]

# ————— س۱۱: خوانداریِ احترام (ص۲۸۷) → بانک l55 —————
respect = norm_stem(join_inclusive(p287, "Respect is a way of acting well", "a sign of respect."))
for frag in ["You respect those who are important to you.",
             "You show your respect by being polite and kind.",
             "they may feel sad or angry",
             "But whom should you respect the most?",
             "Besides bringing you into the world",
             "your parents spend their time, energy, and strength",
             "The easiest way to show your love and respect is to tell them that you appreciate who they are and what they do.",
             "wash the dishes, clean the kitchen after dinner or clean the rooms",
             "any of these small things can be a sign of respect."]:
    assert frag in respect, frag
T33 = norm_stem(line_after_dot(p287, "33. We respect those who are important").split("a) True")[0].strip())
T34 = norm_stem(line_after_dot(p287, "34. If you are impolite").split("a) True")[0].strip())
M35 = norm_stem(line_after_dot(p287, "35. We show our"))
M36 = norm_stem(line_after_dot(p287, "36. Telling your parents that you thank them"))
assert T33 == "We respect those who are important to us for some reasons.", T33
assert T34 == "If you are impolite or act badly toward people, they feel important.", T34
assert M35 == "We show our-------by being polite to those we care for.", M35
assert M36 == "Telling your parents that you thank them ------- the level of your respect for them.", M36
Q_L55 = [
    q("g12-l55-1", 1, "grammar", f"{respect} — {T33}", ["True", "False"], 0),
    q("g12-l55-2", 2, "grammar", f"{respect} — {T34}", ["True", "False"], 1),
    q("g12-l55-3", 3, "grammar", f"{respect} — {M35}",
      ["need", "strength", "happiness", "respect"], 3),
    q("g12-l55-4", 4, "grammar", f"{respect} — {M36}",
      ["reflects", "invents", "imagines", "shouts"], 0),
]
# کلیدهای چاپی [a,b,d,a]
assert [it["answer"] for it in Q_L55] == [0, 1, 3, 0]

# ————— س۱۲: خوانداریِ انسان‌های نخستین (ص۲۸۷) → بانک l56 — لایهٔ آشفته، بازجوشِ داوری‌شدهٔ ۳۰۰dpi —————
# لایهٔ PDF چندستونی/جدا-ران است: «they cut trees\n ,\ne skillful...fuel\nbecam\nthey\nand made fires.»
# رندرِ ۳۰۰dpi (scripts/zoom-g12-shahrivar1399-r387.py → /tmp/qa-r387/p287-s12-passage.png) ترتیبِ واقعی را
# داوری کرد: «...however, they became skillful at changing their environment. To provide themselves
# with fuel, they cut trees and made fires.» — «they» در چاپ توپُر/زیرخط‌دار است (مرجعِ ق۴۱).
RAW_FRAGS = ["they cut trees",
             "e skillful at changing their environment. To provide themselves with fuel",
             "becam",
             "and made fires. Parts of forests were changed to lands to increase the growth of grass and to provide",
             "Fire also provided the means for cooking plants",
             "founding the cities and living in larger groups."]
for frag in RAW_FRAGS:
    assert any(frag in l for l in p287), frag
HUMANS = ("When early humans hunted and collected food, they could not control their environment. "
          "They could live in their environment like other animals. When humans learned to make fire, however, "
          "they became skillful at changing their environment. To provide themselves with fuel, they cut trees "
          "and made fires. Parts of forests were changed to lands to increase the growth of grass and to provide "
          "a greater area for the animals that humans ate as their food. This improvement ended in farming and "
          "also keeping animals as sources of human food. Fire also provided the means for cooking plants "
          "which were not used before. After meeting the simple need for food, early humans began to follow "
          "other goals such as founding the cities and living in larger groups.")
assert HUMANS not in "\n".join(p287), "متنِ بازجوش نباید در لایهٔ خام پیوسته باشد"
T39 = norm_stem(line_after_dot(p288, "39. Early humans killed the animals").split("a) True")[0].strip())
T40 = norm_stem(line_after_dot(p288, "40. Early humans discovered").split("a)True")[0].strip())
M41 = norm_stem(line_after_dot(p288, "41. What does “they” in line 3"))
M42 = norm_stem(line_after_dot(p288, "42. What is this passage mostly about?"))
assert T39 == "Early humans killed the animals and ate them as their food.", T39
assert T40 == "Early humans discovered how to make fire.", T40
assert M41 == "What does “they” in line 3 refer to?", M41
assert M42 == "What is this passage mostly about? It is about------- .", M42
Q_L56 = [
    q("g12-l56-1", 1, "grammar", f"{HUMANS} — {T39}", ["True", "False"], 0),
    q("g12-l56-2", 2, "grammar", f"{HUMANS} — {T40}", ["True", "False"], 0),
    q("g12-l56-3", 3, "grammar", f"{HUMANS} — {M41}",
      ["environments", "humans", "fires", "animals"], 1),
    q("g12-l56-4", 4, "grammar", f"{HUMANS} — {M42}",
      ["how animals were hunted", "the plants early humans ate", "how to make fire", "the life of early humans"], 3),
]
# کلیدهای چاپی [a,a,b,d] — دوبلِ Trueِ چاپ در ۳۹/۴۰ (الگویِ r384-l32/r385-l38)
assert [it["answer"] for it in Q_L56] == [0, 0, 1, 3]

# ————— س۱۳: حروفِ ربط (ص۲۸۸) → بانک l57 —————
C45 = norm_stem(line_after_dot(p288, "45. I get up early in the morning"))
C46 = norm_stem(line_after_dot(p288, "46. We can eat our lunch"))
C47 = norm_stem(line_after_dot(p288, "47. They wanted to call you"))
C48 = norm_stem(line_after_dot(p288, "48. That dictionary is expensive"))
assert C45 == "I get up early in the morning,------- I make an omelet myself.", C45
assert C46 == "We can eat our lunch at the restaurant,------- we can have it at home.", C46
assert C47 == "They wanted to call you,------- they did not have your phone number.", C47
assert C48 == "That dictionary is expensive,------- I can’t buy it.", C48
Q_L57 = [
    q("g12-l57-1", 1, "grammar", C45, ["but", "and", "so", "or"], 1),
    q("g12-l57-2", 2, "grammar", C46, ["but", "and", "so", "or"], 3),
    q("g12-l57-3", 3, "grammar", C47, ["but", "and", "so", "or"], 0),
    q("g12-l57-4", 4, "grammar", C48, ["but", "and", "so", "or"], 2),
]
# کلیدهای چاپی [and, or, but, so] — ترتیبِ چاپِ دستور (but, and, so, or) حفظ شد؛ چرخشِ تازهٔ [1,3,0,2]
assert [it["answer"] for it in Q_L57] == [1, 3, 0, 2]
assert [it["options"][it["answer"]] for it in Q_L57] == ["and", "or", "but", "so"]

# ————— س۱۶-الف: تعریف‌یابی (ص۲۸۹) → بانک l58 —————
S51 = norm_stem(line_after_dot(p289, "51. I have kept a diary"))
S52 = norm_stem(line_after_dot(p289, "52. Plants absorb"))
S53 = norm_stem(line_after_dot(p289, "I did not read the introduction"))
S54 = norm_stem(line_after_dot(p289, "54. Don’t use up all the milk"))
assert S51 == "I have kept a diary for twelve years.", S51
assert S52 == "Plants absorb carbon dioxide.", S52
assert S53 == "I did not read the introduction and jumped into the next part.", S53
assert S54 == "Don’t use up all the milk - we need some for breakfast.", S54
DEFS58 = ["to take something in, especially gradually",   # a
          "cry suddenly",                                  # b — اضافیِ چاپیِ هرگز-کلید
          "a book in which you record your thoughts or feelings or what has happened every day",  # c
          "to suddenly decide to do something",            # d
          "to finish something"]                           # e
for df in DEFS58:
    assert df in full, df
Q_L58 = [
    q("g12-l58-1", 1, "vocab", f"«{S51}» — تعریفِ ستون B برای واژهٔ «diary»: -------", DEFS58, 2),
    q("g12-l58-2", 2, "vocab", f"«{S52}» — تعریفِ ستون B برای واژهٔ «absorb»: -------", DEFS58, 0),
    q("g12-l58-3", 3, "vocab", f"«{S53}» — تعریفِ ستون B برای واژهٔ «jumped into»: -------", DEFS58, 3),
    q("g12-l58-4", 4, "vocab", f"«{S54}» — تعریفِ ستون B برای واژهٔ «use up»: -------", DEFS58, 4),
]
# کلیدهای چاپی [c,a,d,e] — ترتیبِ چاپِ ستون B (a-e) حفظ شد؛ اضافیِ b هرگز کلید نیست
assert [it["options"][it["answer"]] for it in Q_L58] == [DEFS58[2], DEFS58[0], DEFS58[3], DEFS58[4]]
for it in Q_L58:
    assert it["options"][it["answer"]] != DEFS58[1], it["id"]

# ————— س۱۶-ب: اصطلاحات (ص۲۸۹) → بانک l59 —————
for idi in ["55. Out of sight, out of mind", "56. Practice makes perfect",
            "57. Easy come, easy go", "58. Two heads are better than one"]:
    assert idi in full, idi
IDMS59 = ["When you get money quickly, like by winning it, it’s easy to spend it or lose it quickly as well.",  # f
          "When two people cooperate with each other, they come up with better ideas.",                        # g
          "You have to practice a skill a lot to become good at it.",                                          # h
          "People like to spend time with those who are similar to them.",                                     # i — اضافیِ چاپیِ هرگز-کلید
          "You soon forget people or things that are no longer visible or present."]                           # j
for df in IDMS59:
    assert df in full, df
Q_L59 = [
    q("g12-l59-1", 1, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «Out of sight, out of mind»: -------", IDMS59, 4),
    q("g12-l59-2", 2, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «Practice makes perfect»: -------", IDMS59, 2),
    q("g12-l59-3", 3, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «Easy come, easy go»: -------", IDMS59, 0),
    q("g12-l59-4", 4, "vocab", "مفهوم و تعریفِ ضرب‌المثلِ «Two heads are better than one»: -------", IDMS59, 1),
]
# کلیدهای چاپی [j,h,f,g] — ترتیبِ چاپِ ستون B (f-j) حفظ شد؛ اضافیِ i هرگز کلید نیست
assert [it["options"][it["answer"]] for it in Q_L59] == [IDMS59[4], IDMS59[2], IDMS59[0], IDMS59[1]]
for it in Q_L59:
    assert it["options"][it["answer"]] != IDMS59[3], it["id"]

# ————— درج در سند —————
B51 = {"lesson": 51, "title": "نهایی شهریور ۱۳۹۹ — کلوژِ شنیداریِ گفت‌وگو (س۴، ص۲۸۵)", "level": "چهارگزینه‌ای",
       "count": len(Q_L51), "questions": Q_L51}
B52 = {"lesson": 52, "title": "نهایی شهریور ۱۳۹۹ — واژگانِ بانکِ چاپ (س۶، ص۲۸۶)", "level": "چهارگزینه‌ای",
       "count": len(Q_L52), "questions": Q_L52}
B53 = {"lesson": 53, "title": "نهایی شهریور ۱۳۹۹ — حرفِ اول (س۷، ص۲۸۶)", "level": "چهارگزینه‌ای",
       "count": len(Q_L53), "questions": Q_L53}
B54 = {"lesson": 54, "title": "نهایی شهریور ۱۳۹۹ — گرامر (س۸، ص۲۸۶)", "level": "چهارگزینه‌ای",
       "count": len(Q_L54), "questions": Q_L54}
B55 = {"lesson": 55, "title": "نهایی شهریور ۱۳۹۹ — خوانداریِ احترام (س۱۱، ص۲۸۷)", "level": "چهارگزینه‌ای",
       "count": len(Q_L55), "questions": Q_L55}
B56 = {"lesson": 56, "title": "نهایی شهریور ۱۳۹۹ — خوانداریِ انسان‌های نخستین (س۱۲، ص۲۸۷)", "level": "چهارگزینه‌ای",
       "count": len(Q_L56), "questions": Q_L56}
B57 = {"lesson": 57, "title": "نهایی شهریور ۱۳۹۹ — حروفِ ربط (س۱۳، ص۲۸۸)", "level": "چهارگزینه‌ای",
       "count": len(Q_L57), "questions": Q_L57}
B58 = {"lesson": 58, "title": "نهایی شهریور ۱۳۹۹ — تعریف‌یابی (س۱۶-الف، ص۲۸۹)", "level": "چهارگزینه‌ای",
       "count": len(Q_L58), "questions": Q_L58}
B59 = {"lesson": 59, "title": "نهایی شهریور ۱۳۹۹ — اصطلاحات (س۱۶-ب، ص۲۸۹)", "level": "چهارگزینه‌ای",
       "count": len(Q_L59), "questions": Q_L59}
# ————— نشت‌سنج: محتوای مستثنی‌شده نباید در بانک‌های این راند باشد —————
# (دامنه‌راندی — درسِ r384/r385/r386: برخوردهای بین‌برگه‌ایِ مشروع بیرونِ دامنه می‌مانند؛
#  «appreciate who they are» و «clean the kitchen» عینِ متنِ چاپیِ خوانداریِ l55 است — مانندِ
#  r386-«jump into to» از نشت‌سنج شمول ندارد؛ تک‌واژه‌های «means/founding» هم داخلِ متنِ l56 اند)
LEAKS = ["Amin is really tired",                       # س۱ (شنیداریِ صوتی)
         "Where did Alex leave his jacket",            # س۲ (شنیداریِ صوتی)
         "It is at 6:30",                              # س۳ کلیدِ مدل (شنیداری)
         "birthday card",                              # س۳ کلیدِ مدل (شنیداری)
         "The mother is hugging",                      # س۵ تصویری
         "sits in the balcony",                        # س۵ تصویری
         "circled the dictionary entry",               # س۵ تصویری
         "Solar panels change solar power",            # س۵ تصویری
         "The sofa converts into bed",                 # س۵ اضافیِ چاپی (تصویری)
         "A cheetah is an animal",                     # س۹ (تولیدیِ موصولی)
         "If I had wings",                             # س۱۰ (تولیدیِ شرطی)
         "What is the easiest way",                    # ردیفِ ۳۷ (پاسخِ مدل)
         "Saeed studied hard",                         # س۱۴ (تصویری-ربط)
         "so he passed it",                            # س۱۴ کلیدِ چاپی
         "Smoking",                                    # س۱۵ (تولیدی)
         "risk of death",                              # س۱۵ (تولیدی)
         "There are some workers and teachers",        # س۱۷ پاسخِ مدل (تایپی)
         "The girl wrote a letter",                    # س۱۷ پاسخِ مدل (تایپی)
         "Everything in the garden",                   # س۱۷ پاسخِ مدل (تایپی)
         "The parents should be called",               # س۱۷ پاسخِ مدل (تایپی)
         "Ferdowsi",                                   # س۱۸ (تولیدیِ تصویری)
         "Watching TV",                                # س۱۸ (تولیدیِ تصویری)
         "Clean energy",                               # س۱۸ (تولیدیِ تصویری)
         "healthy lifestyle",                          # س۱۸ چیپ
         "Eat fewer snacks"]                           # س۱۸ چیپ
blob = json.dumps([B51, B52, B53, B54, B55, B56, B57, B58, B59], ensure_ascii=False)
for s in LEAKS:
    assert s not in blob, f"leak: {s}"

for b in (B51, B52, B53, B54, B55, B56, B57, B58, B59):
    assert b["count"] == len(b["questions"])
    d["lessons"].append(b)

d["source"]["g12nahaie8"] = {
    "extractedRound": "r387",
    "section": "بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ هشتم: «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۳۹۹ (تمام رشته‌ها)",
    "examPages": "pdf-p285-290 (شش صفحهٔ آزمون؛ ششمی فقط پایان‌بندی/جمع‌بندی) + کلیدِ رسمی: pdf-p291-292 «راهنماي تصحيح»؛ مرزِ برگه‌ها = p284→p285 (پایانِ برگهٔ لایه‌خراب) و p292→p293 (آغازِ ناشنوایان)",
    "examMeta": "امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: تمام رشته‌ها — نوبت شهریورماه سال ۱۳۹۹ (تاریخِ چاپی: ۱۳/۰۶/۹۹) — مدت ۱۲۰ دقیقه — ساعت شروع ۸ صبح — ۱۸ سکشن/۶۷ ردیف/بارم ۴۸ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — «Good luck / جمع نمره ۴٨»",
    "keyPages": "pdf-p291-292 راهنمای تصحیحِ رسمی — «هر پاسخ صحيح (5/.) نمره» — ۶۴ فرگمنتِ کلیدِ چاپی در گارد پیمان می‌شود؛ ۳۸ کلید از ۳۸ آیتمِ بانک‌ها عینِ چاپ است",
    "keyVerification": "کلیدِ چاپی عیناً نقل شد: «1. ( a ) 2. ( c ) 3. ( c )» (چهارمین سه‌تاییِ پرانتز-فاصله‌دارِ پیاپی) / «4. He left his jacket on the bus. 5. False ( b) 6. True (a)» / «7. It is at 6:30. 8. She may bring a birthday card.» / «9. volleyball 10. team 11. fun 12. play 13. twice 14. games» / «15. ( b  ) 16.(  d  ) 17. ( a  ) 18. ( c )» (پرانتزهای دوفاصله‌ایِ چاپ) / «19. arrange 20. demand 21. repeatedly» / «22. hearing 23. smart 24. pollute» / «25. ( b) 26. ( c ) 27. ( b ) 28. ( d ) 29. ( c ) 30. ( a )» / «33. (a) True 34. (b) False 35. ( d ) 36. ( a )» / «39. (a) True 40. (a) True» (دوبلِ True) «41. ( b ) 42. ( d )» / «43. means 44. founding» / «45. and 46. or 47. but 48. so» (با دوفاصلهٔ چاپ در ۴۷) / «49. …so he passed it.» / «51- c 52- a 53- d 54- e 55- j 56- h 57- f 58- g» (جفت‌های خط‌پیوندیِ پراکنده) / «59. There are some workers and teachers who work in the village. 60. The girl wrote a letter, didn`t she? 61. Everything in the garden was brown because it hadn`t rained. 62. The parents should be called by the teacher.» (بک‌تیکِ چاپ در ۶۰/۶۱) — س۹ «which» در لایهٔ کلید آشفته است («w»+«hich») و س۱۰ «(would ,could ,might)»",
    "sectionsTotal": 67,
    "sectionsExtracted": 38,
    "sectionsSkipped": 29,
    "items": 38,
    "bankCounts": [6, 3, 3, 6, 4, 4, 4, 4, 4],
    "keyPolicy": "همهٔ کلیدهای ۳۸ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ کلوژِ شنیداریِ l51 از استخرِ خودِ کلیدِ رسمی (volleyball/team/fun/play/twice/games) با چرخشِ تازهٔ [2,0,3,1,2,0] (بدونِ تکرارِ مجاور، دنبالکنندهٔ r380-l4/r381-l8-l9/r382-l16/r383-l22/r386-l43-l44)؛ بانکِ واژگانِ l52 به ترتیبِ چاپِ خودِ برگه (repeatedly, forever, demand, arrange) با اضافیِ چاپیِ هرگز-کلید (forever)؛ حرفِ اولِ l53 با سه سه‌تاییِ هم‌شکلِ مهندسی‌شده (h+++++/s++++/p+++++)؛ گرامرِ l54 و حروفِ ربطِ l57 به ترتیبِ چاپ؛ کلیدهای درست/غلطِ l55/l56 سمانتیک‌اند (چاپ: True/False و True/True — دوبلِ Trueِ چاپ وفادارانه ماند)؛ تعریف‌یابیِ l58 و اصطلاحاتِ l59 به ترتیبِ چاپِ ستون B با اضافی‌های چاپیِ هرگز-کلید (b/i)",
    "engineNote": "هر ۳۸ آیتم MCQ (قراردادِ کارتِ g12)؛ کلوژِ شنیداریِ چاپِ l51 با خانه‌های «------- (N) -------» و دنبالهٔ «پاسخِ خانهٔ (N)» (الگویِ r381-l9/r383-l22/r386-l43-l44) — خانه‌های چاپِ این برگه بدونِ پرانتزند («…9…….») و gapify به الگویِ استاندارد تبدیل کرد (شاملِ دنبالهٔ مختلطِ «…13..….»)؛ ساقه‌های خوانداریِ l55/l56 متنِ کاملِ چاپی را در خود دارند؛ متنِ l56 لایهٔ آشفته دارد و بازجوشِ داوری‌شدهٔ ۳۰۰dpi است (گاردِ فرگمنت‌های خام + «متنِ پیوسته در لایه نیست»)؛ ساقه‌های تعریف‌یابی/اصطلاح دوبخشیِ فارسی (الگویِ r380-l5/r386-l45)؛ ترجمه عمداً غایب (نهایی‌ها ترجمهٔ چاپی ندارند)؛ نقطه‌چینِ چاپ → «-------» چسبیده؛ این برگه سکشنِ مرتب‌سازیِ شش‌گزینه‌ای ندارد",
    "derivedKeys": {
        "S4": ["volleyball", "team", "fun", "play", "twice", "games"],
        "S6": ["arrange", "demand", "repeatedly"],
        "S7": ["hearing", "smart", "pollute"],
        "S8": ["won`t they", "which", "is known", "have been broken", "could read", "increasingly"],
        "S11": ["True", "False", "respect", "reflects"],
        "S12": ["True", "True", "humans", "the life of early humans"],
        "S13": ["and", "or", "but", "so"],
        "S16-الف": ["a book in which you record your thoughts or feelings or what has happened every day", "to take something in, especially gradually", "to suddenly decide to do something", "to finish something"],
        "S16-ب": ["You soon forget people or things that are no longer visible or present.", "You have to practice a skill a lot to become good at it.", "When you get money quickly, like by winning it, it’s easy to spend it or lose it quickly as well.", "When two people cooperate with each other, they come up with better ideas."],
    },
    "paperMap": "نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — کشفِ r384، تأییدِ دوباره در این راند: دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ (پیش از presentation-forms)؛ خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸)؛ شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸)؛ دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹)؛ خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹)؛ برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ (۱۳/۰۶/۹۹) ← این راند؛ شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ (۱۳/۰۶/۹۹)؛ دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ [r386]؛ خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۸ برگه استخراج شد، ۹ برگه باقی است",
    "skippedSections": [
        "س۱ (ردیف ۱-۳، شنیداریِ MCQ): Amin/Behzad — صوتی-کلید؛ کلیدهای چاپی: 1.( a )/2.( c )/3.( c ) — چهارمین سه‌تاییِ پرانتز-فاصله‌دارِ پیاپی — در رسید حفظ شد",
        "س۲ (ردیف ۴-۶، شنیداریِ کوتاه): کتابِ الکس — صوتی-کلید؛ کلیدهای چاپی: 4. He left his jacket on the bus. / 5. False ( b)/6. True (a)",
        "س۳ (ردیف ۷-۸، شنیداریِ کوتاه): جشنِ تولد — صوتی-کلید؛ کلیدهای چاپی: 7. It is at 6:30. / 8. She may bring a birthday card.",
        "س۵ (ردیف ۱۵-۱۸، تصویری): «یک جمله اضافی است» — پنج جملهٔ چاپی a-e: a) The mother is hugging her little child. → 17 / b) My sister often sits in the balcony and studies her lessons. → 15 / c) The student circled the dictionary entry for the new word. → 18 / d) Solar panels change solar power into electricity. → 16 / e) The sofa converts into bed. (اضافیِ چاپی)؛ داوریِ رندرِ ۳۰۰dpi (p286-s5-pictures.png): بالکن ۱۵/پنلِ خورشیدی ۱۶/در آغوش‌گرفتن ۱۷/لغت‌نامهٔ دایره‌کشیده ۱۸؛ استخراج نیازمندِ تصویر",
        "س۹ (ردیف ۳۱، تولیدیِ موصولی): «A cheetah is an animal…….» — کلیدِ چاپی: which + جمله‌ای دارای فعل (در لایهٔ کلید آشفته: «w»+«hich») — تولیدی",
        "س۱۰ (ردیف ۳۲، تولیدیِ شرطی): «If I had wings, I…….» — کلیدِ چاپی: (would ,could ,might) + جمله‌ای که مفهوم را برساند — تولیدی",
        "ردیف ۳۷-۳۸ (پاسخِ مدلِ خوانداریِ احترام): «37. The easiest way to show your love and respect is to tell them that you appreciate who they are and what they do.» (عینِ جملهٔ متنِ چاپی — از نشت‌سنج شمول ندارد) و «38.Yes, it can, for example, washing the dishes/ cleaning the kitchen/ cleaning the room» (بدونِ فاصلهٔ چاپ در ۳۸.Yes)",
        "ردیف ۴۳-۴۴ (تکمیلِ جملهٔ انسان‌های نخستین): «43. means» و «44. founding» — کلیدهای تک‌واژه‌ایِ چاپی؛ کاندیدِ تایپی (ساقه‌ها: «Fire provided the …………… for cooking plants» و «other goals such as ………… the cities» — هر دو در متنِ چاپیِ l56 هم هست)",
        "س۱۴ (ردیف ۴۹، تصویری-ربط): «Saeed studied hard for the exam,…….» با دو تصویر (پسرِ درس‌خوان + برگهٔ A+) — کلیدِ چاپی: «49. …so he passed it.» — استخراج نیازمندِ تصویر",
        "س۱۵ (ردیف ۵۰، تولیدی): Topic Sentence برای «Smoking» — پاراگرافِ چاپیِ سه‌جمله‌ای (It increases the risk of death... / The risk of dying from smoking has increased over the last 50 years... / So, if people want to be healthy...) — تولیدی",
        "س۱۷ (ردیف ۵۹-۶۲، جمله‌سازیِ انتخابی): چهار پاسخِ مدلِ چاپی: 59. There are some workers and teachers who work in the village. / 60. The girl wrote a letter, didn`t she? (بک‌تیکِ چاپ) / 61. Everything in the garden was brown because it hadn`t rained. (بک‌تیک) / 62. The parents should be called by the teacher. — کاندیدِ تایپی (چارگانهٔ ۵۹-۶۲ به دلخواهِ دو-از-چهار)",
        "س۱۸ (ردیف ۶۳-۶۷، نگارشِ انتخابیِ تصویری): الف) Topic Sentence برای چهار عنوانِ تصویری (63. a) Ferdowsi / 64. b) Watching TV / 65. c) Sport / 66. d) Clean energy) و ب) پاراگرافِ «Having a healthy lifestyle» با چیپ‌های چاپی (Eat fewer snacks / Eat more fruit and vegies / Be more active) — تولیدی با تصویر",
    ],
    "printQuirks": [
        "ششمین برگهٔ presentation-forms با سربرگِ «ﺳﺆاﻻت  اﻣﺘﺤﺎن» دوفاصله‌ای (الگویِ r383/r386) — متنِ انگلیسی و کلیدها لاتینِ سالم",
        "خانه‌های کلوژِ شنیداری بدونِ پرانتزِ چاپی با دنباله‌های مختلط («…9…….»، «……10…… .?»، «…11…... .»، «…13..….») — gapify به «------- (N) -------» استاندارد تبدیل کرد؛ « .?» چاپیِ خانهٔ ۱۰ وفادارانه ماند",
        "شش کلیدِ پرانتز-فاصله‌دار: سه‌تاییِ پیاپیِ «1. ( a ) 2. ( c ) 3. ( c )» + «35. ( d )»/«36. ( a )»/«41. ( b )»/«42. ( d )» — یازدهم تا چهاردهمین بارِ درسِ r380-ق۳۸؛ «25. ( b)» بدونِ فاصله؛ «15. ( b  )»/«16.(  d  )»/«17. ( a  )» دوفاصله‌ای",
        "بک‌تیکِ چاپ در گزینه‌های ق۲۵ (won`t he / won`t they) و در پاسخ‌های مدلِ ۶۰/۶۱ (didn`t she / hadn`t rained) — عینِ چاپ حفظ شد",
        "تاریخِ چاپیِ دو رقمیِ سربرگ «13 / 06 / 99» در برابرِ تاریخِ کلید «13 / 06 / 1399»؛ ساعتِ شروعِ ۸ صبح (در اکثرِ برگه‌های پیشین ۱۰ صبح بود)",
        "لایهٔ متنِ خوانداریِ س۱۲ آشفته است (ران‌های توپُر/زیرخط‌دار جدا: «becam»+«e» و «they» بین‌شان گم) — رندرِ ۳۰۰dpi ترتیبِ واقعی را داوری کرد؛ «they» در چاپ توپُر/زیرخط‌دار است (مرجعِ ق۴۱ «in line 3»)",
        "ق۲۷ «one of the most famous Persian poet» — مفردِ چاپ؛ ق۳۰ خانهٔ نقطه‌ایِ خالص («..................») برخلافِ نقطه‌چینِ بقیه؛ ق۳۵ «our……………….by» چسبیده به دو سو؛ ق۲۸ «…………..by» چسبیده به واژهٔ بعد",
        "ق۴۵-۴۸ ویرگول + نقطه‌چینِ چسبیده به ویرگول («morning,…….» → «morning,-------») — دوقلویِ r384-l34-1 (omelet با فاصله) و r385-l41-2 (dictionary با اتصال به I) با چینشِ متفاوتِ همان جمله‌ها — هر سه رندرِ وفادارِ برگهٔ خود",
        "دوبلِ Trueِ چاپ در کلیدِ ۳۹/۴۰ («39. (a) True 40. (a) True») — الگویِ r384-l32/r385-l38",
        "کلیدِ س۱۶ با جفت‌های خط‌پیوندیِ پراکنده («51-» سطرِ جدا از «c»؛ ترتیبِ چاپِ کلید: ۵۱/۵۵/۵۲/۵۶/۵۳/۵۷/۵۴/۵۸) — پس از collapse جفت‌ها پیوسته‌اند",
        "«38.Yes» بدونِ فاصله و «47.  but» دوفاصله در کلید — عینِ چاپ",
        "پاورقیِ صفحات: «Audio file (MP3) / Audio script (PDF)» در ص۲۸۵ + شمارهٔ چاپیِ ۱۸۸-۱۹۳",
    ],
    "futureNote": "بخشِ ۴: ۸ برگه از ۱۷ استخراج شد، ۹ برگه باقی است (نزدیک‌ترین‌ها: ناشنوایانِ ص۲۹۳-۳۰۰ و جفتِ خرداد ۱۳۹۹ ص۲۵۹-۲۷۶؛ به‌علاوهٔ برگهٔ لایه‌خرابِ ص۲۷۷-۲۸۴ که OCR/رندر می‌خواهد و سه برگهٔ ۱۳۹۷/۱۳۹۸ با کلیدِ سربرگِ قدیمی)؛ کاندیدهای تایپیِ این برگه (ردیفِ ۴۳ «means» + ردیفِ ۴۴ «founding» + ردیفِ ۵۹ «There are some workers and teachers who work in the village.» + ردیفِ ۶۰ «The girl wrote a letter, didn`t she?» + ردیفِ ۶۱ «Everything in the garden was brown because it hadn`t rained.» + ردیفِ ۶۲ «The parents should be called by the teacher.») به کاندیدهای r380-r386 اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۵۲ ردیف است (۴۶ِ r386 + ۶ ردیفِ تازه)",
}
d["source"]["g12nahaie8"]["bookletFile"] = d["source"].get("file", "")

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r387 OK — banks={len(d['lessons'])} items={total} (+38 in 9 banks: l51=6 l52=3 l53=3 l54=6 l55=4 l56=4 l57=4 l58=4 l59=4) — نهایی شهریور ۱۳۹۹ با کلیدِ رسمی")
