#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r366 — «سؤالات امتحانی درس سوم» نهم (ص۶۱-۶۳ چاپی؛ pdf-p61-63) → tests-g9.json
خانواده: ۸ بلوکِ چاپی (شماره‌گذاریِ معیوب: «۴» دوبار، سپس ۵/۶/۷)؛ ۶ بانکِ ۲۳-۲۸:
  س۲ سوالی و منفی (۴ تایپی) — دو جمله (cat/teacher)؛ کلیدِ ساختاریِ وارونگی/منفی‌سازیِ یکتا
      (Does+مفرد / Do+جمع / doesn't+شکلِ ساده) — داربست: جملهٔ سادهٔ خودِ ساقه (خانوادهٔ bank20ِ r365)
  س۳ فعلِ مناسب (۶ تایپی) — جفتِ درون‌پرانتزِ چاپی (Do/Does، watch/watches، ...) —
      کلید با توافقِ نهاد و فعل (you/I/Mr.Smith/people/parents/Helen) — داربست: گزینهٔ دیگرِ چاپی
  س۴ متنِ کامل‌کردنیِ «رهین» (۶ تایپی) — کلیدِ توافق (We/us/she/aunts/boys/girls)؛
      چاپ‌غلطِ «a big a cake» و آغازِ lowercaseِ «the boys» verbatim در ساقه
  س۴ب شکلِ صحیحِ فعل (۲ تایپی — سربرگِ چاپیِ تکراریِ «4)») — doesn't drive (پرانتزِ چاپی
      «(not drive)» داربست) و waters (توافقِ She)
  س۵ بانک واژهٔ نوروز (۴ تایپی) — بانکِ چاپیِ [relatives، swim، meal، sing، wears] با
      واژهٔ اضافیِ sing؛ لنگرِ ق۲: مکالمهٔ خودِ درس verbatim «We normally visit our relatives in Norooz.» (ص۵۲)
  س۷ گزینهٔ صحیح (۶ MCQ از ۸) — ق۱ «hold a ceremony*» و ق۲ «Islamic-Iranian culture*»
      عبارت‌های photo dictionary خودِ درس (ص۵۲)؛ ق۴/ق۵ منطقِ ملکی (Ali→his، حیوان→its)؛
      ق۶ توافقِ پاسخِ «Yes, he…» با فاعلِ مذکر (uncle)؛ ق۸ تنها جملهٔ سالم (b)
مستثنی‌ها: س۱ تصویری (۸ تصویر/۹ عبارت — واژهٔ اضافیِ چاپ: Sing the national anthem)،
  س۶ افتان/خیزان (آهنگی)، س۷ق۳ دوکلیدی (religious festival/ceremony هر دو واژهٔ درس)،
  س۷ق۷ بی‌گزینهٔ معتبر (مجهولِ «is held» در گزینه‌های چاپی غایب است)
هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)
  — کلید = استنتاجِ مستندِ ساختاری/عبارت‌محور (الگوی g9exam1/g9exam2).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
G9 = ROOT / "public/jozve/tests-g9.json"

d = json.loads(G9.read_text(encoding="utf-8"))
if "g9exam3" in d.get("source", {}):
    print("r366: receipt g9exam3 already present — NO-OP")
    raise SystemExit(0)

# ————— برشِ pdf-p61-63 —————
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i


def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]


SEG = page_lines(61) + page_lines(62) + page_lines(63)


def find(needle: str, from_abs: int = 0) -> int:
    for i in range(from_abs, len(SEG)):
        if needle in SEG[i]:
            return i
    raise AssertionError(f"anchor missing: {needle!r}")


def find_all(needle: str) -> int:
    """لنگرهای خارجِ برش (عبارت‌های درس سوم در pdf-p51-54) در کلِ لایه"""
    for i, l in enumerate(LAYER):
        if needle in l:
            return i
    raise AssertionError(f"layer anchor missing: {needle!r}")


# ————— اثباتِ لنگرهای عبارت/مکالمهٔ درس سوم (رسید) —————
LEX = {
    "hold a ceremony*": "عبارتِ photo dictionary درس — لنگرِ س۷ق۱",
    "Islamic-Iranian culture*": "عبارتِ photo dictionary درس — لنگرِ س۷ق۲",
    "We normally visit our relatives in Norooz": "مکالمهٔ خودِ درس verbatim — لنگرِ س۵ق۲",
    "watch military parade*": "عبارتِ photo dictionary درس",
    "watch fireworks*": "عبارتِ photo dictionary درس",
    "sing the national anthem*": "عبارتِ photo dictionary درس (واژهٔ اضافیِ چاپِ س۱)",
    "commemorate NE martyrs*": "عبارتِ photo dictionary درس («NE» خرابیِ لایه)",
    "celebrate a religious holiday*": "عبارتِ photo dictionary درس",
}
for k in LEX:
    find_all(k)
# سربرگ‌های خانواده + سکشن‌های مستثنی
find("سواالت امتحانی درس سوم")
find("عبارت مناسب هر تصویر")
find("افتان یا خیزان")
find("Fitr-Eid is at the end of Ramadan")   # س۷ق۳ دوکلیدی — مستثنی
find("Each year Fajr Film Festival")        # س۷ق۷ بی‌گزینهٔ معتبر — مستثنی

# ————— س۲: سوالی و منفی (۴ تایپی) —————
PLAIN_CAT = "The cat drinks its milk"
PLAIN_THEY = "They listen to their teacher"
find("The cat drinks its milk.")
find("They listen to their teacher.")
BANK23 = [
    {
        "id": "g9-l23-1", "n": 1, "category": "grammar", "kind": "typed",
        "question": "The cat drinks its milk. (Question: -------)",
        "options": ["Does the cat drink its milk?", PLAIN_CAT],
        "answer": 0, "accepted": ["Does the cat drink its milk?"],
        "placeholder": "yes/no question…",
        "keyWhy": "توافقِ Does + مفردِ سوم‌شخص (the cat)؛ وارونگیِ بله/خیریِ یکتا — داربست: جملهٔ سادهٔ خودِ ساقه",
    },
    {
        "id": "g9-l23-2", "n": 2, "category": "grammar", "kind": "typed",
        "question": "The cat drinks its milk. (Negative: -------)",
        "options": ["The cat doesn’t drink its milk.", PLAIN_CAT],
        "answer": 0, "accepted": ["The cat doesn’t drink its milk.", "The cat does not drink its milk."],
        "placeholder": "negative form…",
        "keyWhy": "منفی‌سازیِ یکتا: doesn’t + شکلِ سادهٔ drink؛ دو شکلِ روادار (doesn’t/does not) در accepted",
    },
    {
        "id": "g9-l23-3", "n": 3, "category": "grammar", "kind": "typed",
        "question": "They listen to their teacher. (Question: -------)",
        "options": ["Do they listen to their teacher?", PLAIN_THEY],
        "answer": 0, "accepted": ["Do they listen to their teacher?"],
        "placeholder": "yes/no question…",
        "keyWhy": "توافقِ Do + جمع (they)؛ وارونگیِ بله/خیریِ یکتا",
    },
    {
        "id": "g9-l23-4", "n": 4, "category": "grammar", "kind": "typed",
        "question": "They listen to their teacher. (Negative: -------)",
        "options": ["They don’t listen to their teacher.", PLAIN_THEY],
        "answer": 0, "accepted": ["They don’t listen to their teacher.", "They do not listen to their teacher."],
        "placeholder": "negative form…",
        "keyWhy": "منفی‌سازیِ یکتا: don’t + شکلِ سادهٔ listen؛ دو شکلِ روادار در accepted",
    },
]

# ————— س۳: فعلِ مناسب — جفتِ درون‌پرانتزِ چاپی (۶ تایپی) —————
DATA24 = [
    ("(Do/Does) you come to work by bus?", "Do", "Does",
     "توافقِ you → Do (پرسشِ بله/خیریِ حالِ ساده)"),
    ("I (watch/watches) TV on Fridays.", "watch", "watches",
     "توافقِ I → شکلِ سادهٔ فعل"),
    ("Mr. Smith (work/works) for a company.", "works", "work",
     "Mr. Smith → سوم‌شخصِ مفرد"),
    ("Many people (eat/eats) lunch in this restaurant.", "eat", "eats",
     "people → جمع"),
    ("My parents (don't stay/doesn't stay) home on Nature Day.", "don't stay", "doesn't stay",
     "parents → جمع؛ منفیِ حالِ ساده"),
    ("(Do/Does) Helen read poems of Khayyam?", "Does", "Do",
     "Helen → سوم‌شخصِ مفرد در پرسش"),
]
BANK24 = []
for stem, key, wrong, why in DATA24:
    find(stem)
    BANK24.append({
        "id": f"g9-l24-{len(BANK24) + 1}", "n": len(BANK24) + 1,
        "category": "grammar", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": [key], "placeholder": "choose and type…", "keyWhy": why,
    })

# ————— س۴: متنِ کامل‌کردنیِ «رهین» (۶ تایپی) —————
find("My name is Rahin")
find("(go – goes – going) to my grandfather's house")
find("(we – us) gifts")
find("(cooks – cooking – cook)")
find("(makes – make – making) a big a cake")
find("(sets – set) the table")
find("(clear – clears) the table")
DATA25 = [
    ("We ------- (go – goes – going) to my grandfather's house on Fridays.", "go", "goes",
     "توافقِ We → go؛ goes با جمعِ ناسازگار"),
    ("He usually gives ------- (we – us) gifts.", "us", "we",
     "مفعولِ فعلِ gives → ضمیرِ مفعولیِ us (نه فاعلیِ we)"),
    ("My grandmother ------- (cooks – cooking – cook) a special food for family.", "cooks", "cook",
     "grandmother → سوم‌شخصِ مفرد"),
    ("My aunts ------- (makes – make – making) a big a cake.", "make", "makes",
     "aunts → جمع — چاپ‌غلطِ «a big a cake» verbatim در ساقه"),
    ("the boys ------- (sets – set) the table", "set", "sets",
     "boys → جمع — آغازِ lowercaseِ چاپی verbatim (بعد از نقطه)"),
    ("the girls ------- (clear – clears) the table.", "clear", "clears",
     "girls → جمع — «and» رابطِ سطرِ چاپی در آیتمِ مستقل حذف شد"),
]
BANK25 = []
for stem, key, wrong, why in DATA25:
    BANK25.append({
        "id": f"g9-l25-{len(BANK25) + 1}", "n": len(BANK25) + 1,
        "category": "grammar", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": [key], "placeholder": "the correct word…", "keyWhy": why,
    })

# ————— س۴ب: شکلِ صحیحِ فعل (۲ تایپی — سربرگِ چاپیِ تکراریِ «4)») —————
find("Mr. Ahmadi goes to work by bus. He")
find("(not drive)")
find("Sahar doesn’t water the garden. She")
BANK26 = [
    {
        "id": "g9-l26-1", "n": 1, "category": "grammar", "kind": "typed",
        "question": "Mr. Ahmadi goes to work by bus. He ------- his car. (not drive)",
        "options": ["doesn’t drive", "not drive"],
        "answer": 0, "accepted": ["doesn’t drive", "does not drive"],
        "placeholder": "the correct form…",
        "keyWhy": "سوم‌شخصِ مفرد + منفیِ حالِ ساده: doesn’t + drive — کنتراستِ با «goes to work by bus»؛ داربست: عینِ پرانتزِ چاپی (not drive)",
    },
    {
        "id": "g9-l26-2", "n": 2, "category": "grammar", "kind": "typed",
        "question": "Sahar doesn’t water the garden. She ------- the flowers. (water)",
        "options": ["waters", "water"],
        "answer": 0, "accepted": ["waters"],
        "placeholder": "the correct form…",
        "keyWhy": "سوم‌شخصِ مفرد (She) → waters — کنتراستِ با جملهٔ منفیِ قبل",
    },
]

# ————— س۵ (چاپیِ «5)»): بانک واژهٔ نوروز (۴ تایپی) —————
find("relatives- swim-meal-sing-wears")
find("My grandmother cooks the new year")
find("We visit our")
find("special clothes on festivals")
find("in the river in the summer")
DATA27 = [
    ("My grandmother cooks the new year -------.", "meal", "sing",
     "cooks the new year meal — meal تنها اسمِ سازگار؛ sing فعل است (واژهٔ اضافیِ بانک)"),
    ("We visit our ------- in Norooz.", "relatives", "meal",
     "مکالمهٔ خودِ درس verbatim: «We normally visit our relatives in Norooz.» (ص۵۲)"),
    ("Tom ------- special clothes on festivals.", "wears", "swim",
     "سوم‌شخصِ مفرد (Tom) → wears؛ عبارتِ درس «Wear special clothes» (بانکِ س۱)"),
    ("They ------- in the river in the summer.", "swim", "wears",
     "They → جمع؛ هم‌نشینیِ «in the river» → swim"),
]
BANK27 = []
for stem, key, wrong, why in DATA27:
    BANK27.append({
        "id": f"g9-l27-{len(BANK27) + 1}", "n": len(BANK27) + 1,
        "category": "vocab", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": [key], "placeholder": "answer in English…", "keyWhy": why,
    })

# ————— س۷: گزینهٔ صحیح (۶ MCQ از ۸) —————
find("Every year, Iranians")
find("Nowruz Celebration is very important in Iranian")
find("Ali has many story books")
find("This cat is white and black")
find("B: Yes, he makes good foods.")
find("Which sentence is correct?")
find("Does your uncle exchanges money?")
BANK28 = [
    {
        "id": "g9-l28-1", "n": 1, "category": "grammar",
        "question": "Every year, Iranians ------- a ceremony.",
        "options": ["sing", "gets", "hold", "wear"], "answer": 2,
        "keyWhy": "عبارتِ خودِ درس: «hold a ceremony*» (ص۵۲ — photo dictionary)؛ gets با جمعِ Iranians ناسازگار",
    },
    {
        "id": "g9-l28-2", "n": 2, "category": "grammar",
        "question": "Nowruz Celebration is very important in Iranian -------.",
        "options": ["parade", "holiday", "revolution", "culture"], "answer": 3,
        "keyWhy": "عبارتِ خودِ درس: «Islamic-Iranian culture*» (ص۵۲)؛ سه گزینهٔ دیگر با «important in Iranian» هم‌نشینیِ معنایی ندارند",
    },
    {
        "id": "g9-l28-3", "n": 3, "category": "grammar",
        "question": "Ali has many story books. I'm interested in ------- books.",
        "options": ["her", "Ali", "their", "his"], "answer": 3,
        "keyWhy": "Ali مذکر است → his؛ her/their ناسازگار و Ali خودِ اسم است نه ضمیرِ ملکی",
    },
    {
        "id": "g9-l28-4", "n": 4, "category": "grammar",
        "question": "This cat is white and black ------- legs are black.",
        "options": ["her", "his", "it", "its"], "answer": 3,
        "keyWhy": "ملکیِ it برای جانور: its — it ضمیرِ فاعلی است و در جایِ ملکی نمی‌نشیند",
    },
    {
        "id": "g9-l28-5", "n": 5, "category": "grammar",
        "question": "A: -------? B: Yes, he makes good foods.",
        "options": ["Does Samaneh make lunch?", "Does your uncle make lunch?",
                    "Does your aunt bake a cake?", "Does she bake a cake?"],
        "answer": 1,
        "keyWhy": "پاسخِ «Yes, he …» فقط با فاعلِ مذکر سازگار است: uncle — Samaneh/aunt/she هر سه مؤنث‌اند",
    },
    {
        "id": "g9-l28-6", "n": 6, "category": "grammar",
        "question": "Which sentence is correct?",
        "options": ["Does your uncle exchanges money?", "Is your father packing for a trip?",
                    "Do her aunt buys tickets?", "She don't like selfish persons."],
        "answer": 1,
        "keyWhy": "تنها b دستوریِ سالم است — a: Does…exchanges (باید exchange باشد)، c: Do her aunt buys (دو خطا)، d: She don’t (باید doesn’t)",
    },
]

# ————— چسباندن بانک‌ها —————
def mkbank(lesson, title, level, qs):
    return {"lesson": lesson, "title": title, "level": level, "count": len(qs), "questions": qs}


d["lessons"] += [
    mkbank(23, "امتحانی درس سوم — سوالی و منفی (س۲، ص۶۲)", "تمرین تایپی", BANK23),
    mkbank(24, "امتحانی درس سوم — فعلِ مناسب (س۳، ص۶۲)", "تمرین تایپی (دوگزینه‌ایِ چاپی)", BANK24),
    mkbank(25, "امتحانی درس سوم — متنِ کامل‌کردنیِ رهین (س۴، ص۶۲)", "تمرین تایپی (متنِ کامل‌کردنی)", BANK25),
    mkbank(26, "امتحانی درس سوم — شکلِ صحیحِ فعل (س۴ِ دومِ چاپی، ص۶۲)", "تمرین تایپی", BANK26),
    mkbank(27, "امتحانی درس سوم — بانک واژهٔ نوروز (س۵، ص۶۳)", "تمرین تایپی (بانک واژه)", BANK27),
    mkbank(28, "امتحانی درس سوم — گزینهٔ صحیح (س۷، ص۶۳)", "چهارگزینه‌ای", BANK28),
]

d["source"]["g9exam3"] = {
    "extractedRound": "r366",
    "section": "سؤالات امتحانی درس سوم پایه نهم",
    "examPages": "ص۶۱-۶۳ (برچسبِ فوترِ خودِ اسکن در این بازه با شمارهٔ PDF برابر است)؛ ص۶۴ تقریباً خالی (فقط سربرگ/فوتر) و درس چهارم از ص۶۵ با واژگانِ «خدمات» شروع می‌شود",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 8,
    "sectionsExtracted": 6,
    "sectionsSkipped": 2,
    "items": 28,
    "bankCounts": [4, 6, 6, 2, 4, 6],
    "wordBank": ["relatives", "swim", "meal", "sing", "wears"],
    "extraWord": "sing",
    "keyPolicy": "کلیدِ استنتاجیِ ساختاری/عبارت‌محور: هر کلید یا با عبارتِ photo dictionary خودِ درس سوم («hold a ceremony*»/«Islamic-Iranian culture*» ص۵۲) یا با مکالمهٔ verbatim درس («We normally visit our relatives in Norooz.») یا با توافقِ نهاد و فعل/منطقِ ضمیرِ ملکی/توافقِ پاسخ و فاعلِ خودِ ساقه یکتا می‌شود — الگوی g9exam1/g9exam2؛ هیچ کلیدی از خارجِ متنِ درس نیامده",
    "derivedKeys": {
        "S2": [x["keyWhy"] for x in BANK23],
        "S3": [x["keyWhy"] for x in BANK24],
        "S4": [x["keyWhy"] for x in BANK25],
        "S4b": [x["keyWhy"] for x in BANK26],
        "S5": [x["keyWhy"] for x in BANK27],
        "S7": [x["keyWhy"] for x in BANK28],
    },
    "skippedSections": [
        "س۱ (ص۶۱): عبارتِ مناسبِ هر تصویر — تصویری؛ ۸ تصویر/۹ عبارت و واژهٔ اضافیِ چاپ از رویِ تصویرها «Sing the national anthem» است، ولی سکشنِ تطبیقِ تصویر طبقِ قراردادِ r365 مستثنی ماند؛ بانکِ ۹ عبارتیِ خودِ درس در lessonLexicon قفل شد",
        "س۶ (ص۶۳): افتان یا خیزان — آهنگی؛ در قالبِ تعاملیِ متنیِ فعلی سنجش‌پذیر نیست (الگوی س۱۰ِ r364)",
        "س۷ق۳: «Fitr-Eid is at the end of Ramadan. It's a …» — ابهامِ دوکلیدی: religious festival و religious ceremony هر دو جملهٔ سالم‌اند و Festival*/Ceremony* هر دو واژهٔ خودِ درس‌اند (ص۵۱)؛ «Eid» در متنِ درس نیست تا لنگرِ یگانه بدهد — قراردادِ r358",
        "س۷ق۷: «Each year Fajr Film Festival … in Iran» — هیچ گزینهٔ چاپی جملهٔ معتبر نمی‌سازد: مجهولِ «is held» در گزینه‌ها غایب است و celebrates/holds/puts بی‌مفعولِ مناسب و is holding ناقص‌اند — بی‌کلیدِ قابلِ استنتاج (فقط خواندنِ درس چهارم «attended Fajr International Film Festival» ص۷۸ فعلِ مناسب نمی‌سازد)",
    ],
    "printQuirkCount": 13,
    "printQuirks": [
        "گلیفِ لام-الِ لایه: «جمالت»→جملات، «سواالت»→سوالات، «اصالح»→اصلاح — عنوان‌های بانک بازسازیِ خوانا (الگوی r362/r365)",
        "شماره‌گذاریِ چاپیِ معیوب: «4)» دوبار سربرگ شده (متنِ رهین و شکلِ صحیح، هر دو ص۶۲) و سپس «5)»/«6»/«7» در ص۶۳ می‌آید — هشت بلوک با هفت شمارهٔ یکتا؛ در عنوان‌های بانک شمارهٔ چاپی حفظ شد",
        "سربرگِ س۲ در لایه معکوس: «2» سطرِ جدا + «.)جمالت داده شده…» (شکستِ RTL)؛ س۳ با رقمِ فارسیِ «۳)» و س۴/س۶/س۷ با رقمِ لاتینِ سطرِ جدا",
        "بانکِ واژهٔ س۵ در لایه: «relatives- swim-meal-sing-wears)» + پرانتزِ سرگردانِ سطرِ بعد — جداکنندهٔ خطِ تیرهٔ بی‌فاصله؛ پنج واژه بازچینی شد",
        "متنِ رهین: «a big a cake» چاپ‌غلطِ verbatim در ساقه؛ «is generous man» (افتادِ a) در لایه هست ولی خارج از ساقه‌هاست",
        "دو جای خالی در یک سطرِ چاپی: «gives … / grandmother …» و «the boys … / the girls …» — هر کدام دو آیتمِ مستقل شدند؛ «and» رابطِ سطر در آیتمِ girls حذف شد",
        "«8-Clear the table» در بانکِ س۱: خطِ تیره به‌جای نقطه — سکشنِ تصویریِ مستثنی",
        "ق۴ِ س۷: گزینهٔ a چاپِ «a her» — ادغامِ حرفِ گزینه با واژه (نقطهٔ میانیِ افتاده)؛ در گزینه‌ها «her» بازسازی شد",
        "ق۸ِ س۷: گزینه‌های a/c در یک سطر و b/d در سطرِ بعد (چیدمانِ دوستونی) — بازچینی به ترتیبِ a/b/c/d",
        "نقطه‌چین‌های درون‌سطریِ پاسخِ س۳ («…………………..» پس از هر ساقه) — فرمِ خالیِ چاپ؛ از ساقه‌ها حذف شد",
        "دو رسم‌الخط در خودِ جزوه: «Nowruz» (س۷ق۲) در برابرِ «Norooz» (متنِ درس و س۵) — هر دو verbatim",
        "برچسب‌های چاپیِ فارسیِ «سوالی/منفی» در س۲ زیرِ بلنک‌هاست — در ساقه‌ها هم‌ارزِ انگلیسیِ (Question:/Negative:) به الگوی bank20ِ r365 به‌کار رفت تا خانواده خلوصِ لاتین بماند",
        "آپاستروف‌های آمیخته در یک صفحه: «doesn’t» خمیده (شکلِ صحیح ص۶۲) و «don't» راست (ساقه‌های س۳) — verbatim؛ نرمال‌سازِ موتور هر دو را یکسان می‌کند",
    ],
    "lessonLexicon": {
        "hold a ceremony": "برگزاریِ مراسم — photo dictionary درس («hold a ceremony*» ص۵۲) — لنگرِ س۷ق۱",
        "Islamic-Iranian culture": "فرهنگِ اسلامی-ایرانی — photo dictionary درس («Islamic-Iranian culture*» ص۵۲) — لنگرِ س۷ق۲",
        "visit our relatives": "دیدنِ بستگان — مکالمهٔ درس verbatim: «We normally visit our relatives in Norooz.» (ص۵۲) — لنگرِ س۵ق۲",
        "watch military parade": "تماشای رژهٔ نظامی — photo dictionary درس («watch military parade*» ص۵۲)",
        "watch fireworks": "تماشای آتش‌بازی — photo dictionary درس («watch fireworks*» ص۵۲)",
        "sing the national anthem": "خواندنِ سرودِ ملی — photo dictionary درس (ص۵۲) — واژهٔ اضافیِ چاپِ س۱",
        "commemorate martyrs": "بزرگداشتِ شهیدان — photo dictionary درس («commemorate NE martyrs*» ص۵۲؛ «NE» خرابیِ لایه)",
        "celebrate a religious holiday": "جشن گرفتنِ عیدِ مذهبی — photo dictionary درس (ص۵۲)",
        "Ceremony": "مراسم — واژهٔ درس (ص۵۱) — مبنای داوریِ دوکلیدیِ س۷ق۳",
        "Festival": "جشن — واژهٔ درس (ص۵۱) — مبنای داوریِ دوکلیدیِ س۷ق۳",
        "Culture": "فرهنگ — واژهٔ درس (ص۵۱)",
        "meal": "غذا — بانکِ واژهٔ س۵",
        "swim": "شنا کردن — بانکِ واژهٔ س۵",
        "sing": "خواندن (آهنگ) — واژهٔ اضافیِ بانکِ س۵ (داربستِ ق۱)",
        "wears": "می‌پوشد — بانکِ واژهٔ س۵",
        "relatives": "بستگان — بانکِ واژهٔ س۵/مکالمهٔ درس",
    },
    "typedNote": "همهٔ ۲۲ آیتمِ تایپیِ تازه دو گزینه‌ای‌اند (کلید + داربستِ غلط) — قفلِ سراسریِ r363 (ممنوعیتِ تایپیِ تک‌گزینه‌ای) حفظ شد؛ داربست‌ها خانواده‌محور: جملهٔ سادهٔ خودِ ساقه (س۲)، گزینهٔ دیگرِ جفتِ چاپی (س۳/س۴)، عینِ پرانتزِ چاپی (س۴ب)، چرخشِ واژهٔ بانک (س۵)",
}

G9.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
ids = [q["id"] for b in d["lessons"] for q in b["questions"]]
print(f"r366: +6 banks / +28 items → tests-g9 = {len(d['lessons'])} banks / {len(ids)} items")
