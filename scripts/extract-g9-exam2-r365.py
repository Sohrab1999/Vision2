#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r365 — «سؤالات امتحانی درس دوم» نهم (ص۴۷-۵۰ چاپی؛ pdf-p47-50) → tests-g9.json
خانواده: ۱۱ سکشن؛ ۷ سکشنِ کلیدپذیر استخراج می‌شود (۲۴ آیتم در ۷ بانکِ ۱۶-۲۲):
  س۲ بانک‌واژهٔ مکالمهٔ هتل (۸ تایپی) — ۹ واژهٔ چاپی/یک اضافی (book)؛ هر کلید با جملهٔ
      موازیِ مکالمهٔ خودِ درس دوم verbatim یکتا می‌شود (help/reservation/staying/visiting/
      wife/standing/key/enjoy — لایه ۲۳۸۶-۲۴۱۶) — داربستِ غلط: چرخشِ واژهٔ خودِ بانک
  س۳ فعلِ مناسب حال استمراری (۲ تایپی) — کلید از عبارت‌های photo dictionary خودِ درس
      («fill out a form*» لایه۲۳۶۱، «check the timetable*» لایه۲۳۷۳)؛ داربست: شکلِ سادهٔ فعل
  س۴ وصل‌کردنیِ پرسش/پاسخ (۴ MCQ پنج‌گزینه‌ای) — گزینه‌های چاپیِ مشترک a-e verbatim؛
      کلید با توافقِ ضمیر/نوعِ پرسش (b اضافی: پاسخِ بله/خیرِ آغازشده با «No,») — الگوی س۱۴ِ r364
  س۵ کلمهٔ ناهماهنگ (۲ MCQ) — ردیف ۱: person/غیرِperson (check in)؛ ردیف ۲: of-ساخت با
      نامِ شخص («the shirt of the Jack») — کلیدِ استنتاجیِ واژنامه‌محور
  س۶ شکلِ فشرده/سوالی/منفی (۳ تایپی) — سطر ۱ «They are speaking Arabic.» — تبدیلِ نحویِ
      یکتا (الگوی س۴ِ r364)؛ سطرهای ۲/۳ (Where/How/What) مستثنی: ابهامِ دوکلیدیِ مکانیکی
  س۷ مرتب‌کردن جملات (۳ تایپی) — تنها یک چینشِ دستوری ممکن؛ داربست: ردیفِ به‌هم‌ریختهٔ چاپی
  س۸ گزینهٔ صحیح (۲ MCQ) — ق۱ کلیدِ ساختاری (He is buying)؛ ق۲ هم‌نشینیِ «check the
      passport*» (لایه۲۳۶۹ — عبارتِ خودِ درس)
۴ سکشنِ مستثنی‌شده (رسید): س۱/س۱۱ تصویری، س۹ «چهار غلط» (دو غلطِ نایکتا: friend is/friends are)،
  س۱۰ ترجمهٔ فارسی (چندپذیرشِ عبارتِ مرکب + نخستین بانکِ پاسخ‌فارسی نیازمندِ تصمیمِ زیرساختی)
هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)
  — کلید = استنتاجِ مستندِ لغت‌نامه/مکالمه‌محور (الگوی g9exam1).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
G9 = ROOT / "public/jozve/tests-g9.json"

d = json.loads(G9.read_text(encoding="utf-8"))
if "g9exam2" in d.get("source", {}):
    print("r365: receipt g9exam2 already present — NO-OP")
    raise SystemExit(0)

# ————— برشِ pdf-p47-50 —————
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i


def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]


SEG = page_lines(47) + page_lines(48) + page_lines(49) + page_lines(50)


def find(needle: str, from_abs: int = 0) -> int:
    for i in range(from_abs, len(SEG)):
        if needle in SEG[i]:
            return i
    raise AssertionError(f"anchor missing: {needle!r}")


def find_all(needle: str) -> int:
    """لنگرهای خارجِ برش (مکالمه/عبارت‌های درس دوم در pdf-p35-37) در کلِ لایه"""
    for i, l in enumerate(LAYER):
        if needle in l:
            return i
    raise AssertionError(f"layer anchor missing: {needle!r}")


LEADER = re.compile(r"[.…]{2,}(?:\s*[.…]+)*")


def collapse(s: str) -> str:
    out = LEADER.sub("-------", s)
    out = re.sub(r"-------(?=[A-Za-z])", "------- ", out)
    return out.strip()


COLSPLIT = re.compile(r"\s{4,}")  # دوستونیِ چاپی A/B

# ————— اثباتِ لنگرهای مکالمه/عبارتِ درس دوم (رسید) —————
CONV = {
    "help": "Receptionist: Welcome to our hotel sir, how can I help you?",
    "reservation": "I have a reservation here.",
    "staying": "Are you staying here for two nights?",
    "visiting": "my wife and I are visiting Tehran for three days",
    "wife": "my wife and I are visiting Tehran",
    "standing": "She’s standing over there, by the gift shop.",
    "key": "This is your key.",
    "enjoy": "Hope you enjoy your stay in",
}
for k, v in CONV.items():
    find_all(v)
find_all("fill out a form*")
find_all("check the timetable*")
find_all("check the passport*")

BANK16 = []
DATA16 = [
    ("A: Welcome to our hotel, how can I ------- you?", "help", "staying",
     "مکالمهٔ درس verbatim: «how can I help you?» (لایه ۲۳۸۶)"),
    ("B: I have a ------- here.", "reservation", "book",
     "مکالمهٔ درس verbatim: «I have a reservation here.» (لایه ۲۳۸۹) — واژهٔ اضافیِ چاپی «book» همان تلهٔ ردیف است"),
    ("A: Are you ------- for 5 days?", "staying", "standing",
     "مکالمهٔ درس: «Are you staying here for two nights?» (لایه ۲۳۹۱) — جفتِ آواییِ staying/standing تلهٔ چاپی"),
    ("B: No, we are ------- Isfahan for 3 nights.", "visiting", "staying",
     "مکالمهٔ درس: «my wife and I are visiting Tehran» (لایه ۲۳۹۳) — visiting متعدی؛ staying حرفِ اضافه می‌خواهد"),
    ("A: Where is your -------?", "wife", "key",
     "مکالمهٔ درس: «my wife and I» (لایه ۲۳۹۳) + پاسخِ B «she’s …» → شخص"),
    ("B: she’s ------- by the table.", "standing", "visiting",
     "مکالمهٔ درس verbatim-موازی: «She’s standing over there, by the gift shop.» (لایه ۲۴۱۱)"),
    ("A: This is your -------", "key", "book",
     "مکالمهٔ درس verbatim: «This is your key.» (لایه ۲۴۱۶)"),
    ("Hope you ------- your stay in Isfahan.", "enjoy", "visiting",
     "مکالمهٔ درس verbatim: «Hope you enjoy your stay in Tehran.» (لایه ۲۴۱۶)"),
]
for stem, key, wrong, why in DATA16:
    # هر ساقه باید از لایه آمده باشد: رانِ تیره جایگزینِ نقطه‌چینِ چاپی است
    raw = stem.split("-------")[0].strip()[:24]
    find(raw)
    BANK16.append({
        "id": f"g9-l16-{len(BANK16) + 1}",
        "n": len(BANK16) + 1,
        "category": "vocab",
        "kind": "typed",
        "question": stem,
        "options": [key, wrong],
        "answer": 0,
        "accepted": [key],
        "placeholder": "answer in English…",
        "keyWhy": why,
    })

# ————— س۳: فعلِ مناسب (۲ تایپی) —————
BANK17 = []
DATA17 = [
    ("He ------- the reservation form.", "is filling out", ["is filling out", "is filling"],
     "fill out", "عبارتِ خودِ درس: «fill out a form*» (لایه ۲۳۶۱)؛ توافقِ He→is"),
    ("I ------- the time table.", "am checking", ["am checking"],
     "check", "عبارتِ خودِ درس: «check the timetable*» (لایه ۲۳۷۳)؛ توافقِ I→am"),
]
for stem, key, accepted, phrase, why in DATA17:
    find(stem.split("-------")[0].strip()[:14])
    BANK17.append({
        "id": f"g9-l17-{len(BANK17) + 1}",
        "n": len(BANK17) + 1,
        "category": "grammar",
        "kind": "typed",
        "question": stem,
        "options": [key, phrase],  # داربست: شکلِ سادهٔ فعل — خطای کلاسیکِ استمراری
        "answer": 0,
        "accepted": accepted,
        "placeholder": "present continuous…",
        "keyWhy": why,
    })

# ————— س۴: وصل‌کردنیِ پرسش/پاسخ (۴ MCQ پنج‌گزینه‌ای) —————
OPTS18 = ["Paul.", "No, he is working with the computer.", "Yes, she is.", "He’s checking the map.",
          "No, they are boarding the plane."]
for o in OPTS18:
    find(o)
DATA18 = [
    ("Is Kate reading a guide book?", 2, "Kate→she + بله/خیر؛ فقط c با she آغاز به «Yes» می‌کند"),
    ("What is he doing?", 3, "پرسشِ What پاسخِ بله/خیر (b آغازشده با «No,») نمی‌گیرد → d"),
    ("Are they taking an express train?", 4, "they + بله/خیرِ منفی → e («No, they are boarding…»)"),
    ("Who is speaking to the teacher now?", 0, "پرسشِ Who → تنها نامِ شخص: a) Paul."),
]
BANK18 = [{
    "id": f"g9-l18-{i + 1}", "n": i + 1, "category": "grammar",
    "question": f"{stem} ( ------- )", "options": OPTS18, "answer": ans, "keyWhy": why,
} for i, (stem, ans, why) in enumerate(DATA18)]

# ————— س۵: کلمهٔ ناهماهنگ (۲ MCQ) —————
find("a) shopkeeper")
find("b) the shirt of the Jack")
find("c) the legs of the chair")
OPTS19_1 = ["shopkeeper", "tourist", "check in", "teacher"]
OPTS19_2 = ["the wheels of the car", "the shirt of the Jack", "the legs of the chair", "the door of the class"]
BANK19 = [
    {"id": "g9-l19-1", "n": 1, "category": "vocab", "question": " – ".join(OPTS19_1),
     "options": OPTS19_1, "answer": 2,
     "keyWhy": "check in فعلیتِ پذیرش است نه شخص؛ سه واژهٔ دیگر هر سه شخص/شغل‌اند"},
    {"id": "g9-l19-2", "n": 2, "category": "vocab", "question": " – ".join(OPTS19_2),
     "options": OPTS19_2, "answer": 1,
     "keyWhy": "«the shirt of the Jack» of-ساخت با نامِ شخص — سه موردِ دیگر of-ساختِ شیء با شیء"},
]

# ————— س۶ سطر ۱: شکلِ فشرده/سوالی/منفی (۳ تایپی) —————
find("They are speaking Arabic.")
find("Contracted form:")
PLAIN = "They are speaking Arabic"
BANK20 = [
    {"id": "g9-l20-1", "n": 1, "category": "grammar", "kind": "typed",
     "question": "They are speaking Arabic. (Contracted form: -------)",
     "options": ["They’re speaking Arabic", PLAIN], "answer": 0,
     "accepted": ["They’re speaking Arabic"], "placeholder": "contracted form…",
     "keyWhy": "تنها فشرده‌سازیِ ممکن: They are→They’re"},
    {"id": "g9-l20-2", "n": 2, "category": "grammar", "kind": "typed",
     "question": "They are speaking Arabic. (Question: -------)",
     "options": ["Are they speaking Arabic?", PLAIN], "answer": 0,
     "accepted": ["Are they speaking Arabic?"], "placeholder": "yes/no question…",
     "keyWhy": "وارونگیِ سوالیِ بله/خیری یکتاست: Are they…?"},
    {"id": "g9-l20-3", "n": 3, "category": "grammar", "kind": "typed",
     "question": "They are speaking Arabic. (Negative: -------)",
     "options": ["They are not speaking Arabic.", PLAIN], "answer": 0,
     "accepted": ["They are not speaking Arabic.", "They aren’t speaking Arabic.", "They’re not speaking Arabic."],
     "placeholder": "negative form…",
     "keyWhy": "منفی‌سازیِ یکتا؛ سه شکلِ روادار (are not/aren’t/’re not) در accepted"},
]

# ————— س۷: مرتب‌کردن جملات (۳ تایپی) —————
DATA21 = [
    ("am, into, going, gift, I, the, shop.", "I am going into the gift shop."),
    ("is, for, in, Mashhad, a, searching, Mohammad, hotel?", "Is Mohammad searching for a hotel in Mashhad?"),
    ("it, country, is, beautiful, a?", "Is it a beautiful country?"),
]
BANK21 = []
for stem, key in DATA21:
    find(stem)
    BANK21.append({
        "id": f"g9-l21-{len(BANK21) + 1}", "n": len(BANK21) + 1, "category": "grammar",
        "kind": "typed", "question": stem,
        "options": [key, stem.rstrip(".?")],  # داربست: ردیفِ به‌هم‌ریختهٔ چاپی (خانوادهٔ r363)
        "answer": 0, "accepted": [key], "placeholder": "write the sentence…",
        "keyWhy": "تنها یک چینشِ دستوریِ ممکن از هشت/هفت/پنج واژه",
    })

# ————— س۸: گزینهٔ صحیح (۲ MCQ) —————
find("a) buy")
find("b) is checking")
BANK22 = [
    {"id": "g9-l22-1", "n": 1, "category": "grammar", "question": "He ------- a ticket.",
     "options": ["buy", "is buy", "buying", "is buying"], "answer": 3,
     "keyWhy": "کلیدِ ساختاری: تنها «is buying» هم فعلِ استمراریِ کامل دارد هم توافقِ He"},
    {"id": "g9-l22-2", "n": 2, "category": "grammar", "question": "That man ------- the passport.",
     "options": ["is praying", "is checking", "is playing", "is landing"], "answer": 1,
     "keyWhy": "هم‌نشینیِ عبارتِ خودِ درس: «check the passport*» (لایه ۲۳۶۹)"},
]

# ————— چسباندن بانک‌ها —————
def mkbank(lesson, title, level, qs):
    return {"lesson": lesson, "title": title, "level": level, "count": len(qs), "questions": qs}


d["lessons"] += [
    mkbank(16, "امتحانی درس دوم — بانک واژهٔ مکالمهٔ هتل (س۲، ص۴۷)", "تمرین تایپی (بانک واژه)", BANK16),
    mkbank(17, "امتحانی درس دوم — فعلِ مناسب حال استمراری (س۳، ص۴۷)", "تمرین تایپی", BANK17),
    mkbank(18, "امتحانی درس دوم — وصل‌کردنیِ پرسش/پاسخ (س۴، ص۴۸)", "چهارگزینه‌ای (پنج‌گزینه‌ای چاپی)", BANK18),
    mkbank(19, "امتحانی درس دوم — کلمهٔ ناهماهنگ (س۵، ص۴۸)", "چهارگزینه‌ای", BANK19),
    mkbank(20, "امتحانی درس دوم — شکلِ فشرده/سوالی/منفی (س۶، ص۴۸)", "تمرین تایپی", BANK20),
    mkbank(21, "امتحانی درس دوم — مرتب‌کردن جملات (س۷، ص۴۸)", "تمرین تایپی", BANK21),
    mkbank(22, "امتحانی درس دوم — گزینهٔ صحیح (س۸، ص۴۹)", "چهارگزینه‌ای", BANK22),
]

d["source"]["g9exam2"] = {
    "extractedRound": "r365",
    "section": "سؤالات امتحانی درس دوم پایه نهم",
    "examPages": "ص۴۷-۵۰ (برچسبِ فوترِ خودِ اسکن در این بازه با شمارهٔ PDF برابر است)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 11,
    "sectionsExtracted": 7,
    "sectionsSkipped": 4,
    "items": 24,
    "bankCounts": [8, 2, 4, 2, 3, 3, 2],
    "wordBank": ["Standing", "book", "reservation", "enjoy", "visiting", "help", "wife", "staying", "key"],
    "extraWord": "book",
    "keyPolicy": "کلیدِ استنتاجیِ مکالمه/عبارت‌محور: هر کلید یا با جملهٔ موازیِ verbatim مکالمهٔ خودِ درس دوم (لایه ۲۳۸۶-۲۴۱۶) یا با عبارتِ photo dictionary خودِ درس («fill out a form*»/«check the timetable*»/«check the passport*») یا با توافقِ ضمیر/نوعِ پرسش/ساختارِ نحویِ خودِ ساقه یکتا می‌شود — الگوی g9exam1/r357؛ هیچ کلیدی از خارجِ متنِ درس نیامده",
    "derivedKeys": {
        "S2": [x["keyWhy"] for x in BANK16],
        "S3": [x["keyWhy"] for x in BANK17],
        "S4": [x["keyWhy"] for x in BANK18],
        "S5": [x["keyWhy"] for x in BANK19],
        "S6": [x["keyWhy"] for x in BANK20],
        "S7": [x["keyWhy"] for x in BANK21],
        "S8": [x["keyWhy"] for x in BANK22],
    },
    "skippedSections": [
        "س۱: تکمیلِ جملات با زمان حال استمراری «با توجه به تصاویر» — تصویری؛ بی‌تصویر کلیدپذیر نیست",
        "س۶ سطرهای ۲/۳ (سوال‌سازیِ Where/How و What/Who): ابهامِ دوکلیدیِ مکانیکی — «What are Jack and Paul doing/opening?» هر دو روادارند؛ Where/How هم جابه‌جاییِ قیدِ جای/شیوه را خنثی نمی‌کند — قراردادِ r358",
        "س۹: «در متن زیر چهار غلط وجود دارد» — دو غلطِ چهارگانه نایکتا: «my friend are» هم با «my friend is» هم با «my friends are» درست می‌شود؛ «looking at the room of the window» بدونِ متنِ مرجعِ درس، اصلاحِ یگانه ندارد — دوکلیدی",
        "س۱۰: ترجمهٔ فارسیِ ده عبارت — کادرِ خالیِ بی‌کلیدِ چاپی؛ ترکیبِ فارسیِ عبارتِ مرکب چندپذیرش است (تبدیل کردن پول/تبدیل پول…) و نخستین بانکِ پاسخ‌فارسی نیازمندِ تصمیمِ زیرساختیِ جداگانه است (نرمال‌سازیِ نیم‌فاصله/RTL/گاردِ خلوص) — فرصتِ مستقلِ آینده؛ پنج عبارتِ لنگردارِ verbatim (take off→بلندشدن هواپیما، Land→فرود آمدن، Check in→پذیرش شدن و…) در واژنامهٔ درس ثبت شد",
        "س۱۱: نوشتنِ اصطلاح زیر هر تصویر — تصویری",
    ],
    "printQuirkCount": 11,
    "printQuirks": [
        "گلیفِ لام-الِ لایه: «جمالت»→جملات، «سواالت»→سوالات، «اصالح»→اصلاح، «اطالع»→اطلاع — در ساقه‌ها verbatim حفظ نمی‌شود چون خطِ گلیف است نه متنِ سؤال (عنوان‌های بانک بازسازیِ خوانا — الگوی r362)",
        "سربرگ‌های شماره‌دار سطرِ جدا با ارقامِ آمیخته: «2)» لاتین، «۳)» فارسی، «4»/«5»/«6»/«7»/«9»/«10»/«11» لاتینِ بدونِ پرانتز، «۸» فارسی — ترتیبِ لایه با ترتیبِ چاپ یکی است",
        "س۲ دوستونیِ چاپی: نیمهٔ A و B یک سطر با فاصله‌های بزرگ در لایه پیوسته‌اند (COLSPLIT ۴+ فاصله)؛ «B) Thank you» پرانتز به‌جای دونقطه — پایانِ سطرِ چهارم",
        "س۲: هر دو جای خالیِ سطرِ چهارم از گفتارِ A است («This is your key. Hope you enjoy your stay.») و «B) Thank you» پاسخِ B — در بانک، دو آیتمِ مستقل با پیشوندِ A",
        "س۳: «2)I» بی‌فاصله در برابرِ «1) He» با فاصله — ناهمگونیِ شماره‌گذاریِ چاپی",
        "س۵: ردیفِ دوم بین دو سطر شکسته (a/b سطر بالا، c/d سطر پایین) — بازچینی شد",
        "س۷: سطرِ ق۲ شکسته — کلمات در یک سطر، نقطه‌چین در سطر بعد",
        "«Express train*» در واژنامهٔ درس «قطار سریع اسیر» — افتادِ «السیر» در لایه",
        "آپاستروفِ خمیدهٔ چاپی verbatim: she’s/He’s/I’m/It’s/scarf’s",
        "س۸ ق۱: جفتِ «a) buy / b) is buy» — گزینهٔ شکستهٔ فعلِ استمراری",
        "س۹: سربرگ «چهار غلط» — شمارشِ چاپیِ خودِ جزوه؛ دو غلطِ نایکتا (سقوطِ سکشن)",
    ],
    "lessonLexicon": {
        "help": "کمک کردن — مکالمهٔ درس: «چطور میتوانم کمکتون کنم؟»",
        "reservation": "رزرو — واژنامهٔ درس (Reservation*)",
        "staying": "ماندن — مکالمهٔ درس: «آیا دو شب اینجا میمانید؟»",
        "visiting": "دیدن کردن از — مکالمهٔ درس: «سه روز از تهران دیدن کنیم»",
        "wife": "همسر — مکالمهٔ درس: «من و همسرم»",
        "standing": "ایستادن — واژنامهٔ درس (Stand) + مکالمه: «آنجا ایستاده است»",
        "key": "کلید — واژنامهٔ درس (Key*)",
        "enjoy": "لذت بردن — واژنامهٔ درس (Enjoy*)",
        "book": "رزرو کردن (فعل) — واژنامهٔ درس (Book* = رزرو کردن) — واژهٔ اضافیِ بانک",
        "fill out a form": "پر کردن فرم — photo dictionary درس («fill out a form*»)",
        "check the timetable": "بررسی کردن جدول زمانی — photo dictionary («check the timetable*»؛ Timetable* = جدول زمانی)",
        "check the passport": "بررسی کردن گذرنامه — photo dictionary («check the passport*»؛ مکالمه: «گذرنامه اش را بررسی کنم»)",
        "Express train": "قطار سریع‌السیر — واژنامهٔ درس (با افتادِ «السیر» در لایه)",
        "Guide book": "کتاب راهنما — واژنامهٔ درس",
        "Tourist": "گردشگر — واژنامهٔ درس",
        "Board": "سوارشدن — واژنامهٔ درس («boarding the plane» س۴)",
        "Take off": "بلندشدن هواپیما — واژنامهٔ درس (لنگرِ س۱۰ِ مستثنی)",
        "Land": "فرود آمدن — واژنامهٔ درس (لنگرِ س۱۰ِ مستثنی)",
        "Check in": "پذیرش شدن — واژنامهٔ درس (لنگرِ س۱۰ِ مستثنی)",
        "Fill out": "پر کردن — واژنامهٔ درس",
    },
    "typedNote": "همهٔ ۱۶ آیتمِ تایپیِ تازه دو گزینه‌ای‌اند (کلید + داربستِ غلط) — قفلِ سراسریِ r363 (ممنوعیتِ تایپیِ تک‌گزینه‌ای) حفظ شد؛ داربست‌ها خانواده‌محور: چرخشِ واژهٔ بانک (س۲)، شکلِ سادهٔ فعل (س۳)، جملهٔ ساده (س۶)، ردیفِ به‌هم‌ریختهٔ چاپی (س۷)",
}

G9.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
ids = [q["id"] for b in d["lessons"] for q in b["questions"]]
print(f"r365: +7 banks / +24 items → tests-g9 = {len(d['lessons'])} banks / {len(ids)} items")
