#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r367 — «سؤالات امتحانی درس چهارم» نهم (ص۷۳-۷۵ چاپی؛ pdf-p73-75) → tests-g9.json
خانواده: ۱۱ سکشنِ شماره‌گذاری‌شدهٔ سالم (۱-۱۱)؛ ۷ بانکِ ۲۹-۳۵:
  س۵ دیکتهٔ ناقص (۳ تایپی) — «R_charge the e t_cket / inform_tion desk / help ch_rity»؛
      کلید با photo dictionary خودِ درس («recharge your E-ticket*»/«ask the information desk*»/
      «help charity*» ص۶۶) یکتا — داربست: چرخشِ عبارت‌های هم‌بانک
  س۶ مرتب‌کردن (۲ تایپی) — تنها یک چینشِ دستوری؛ داربست: ردیفِ به‌هم‌ریخته (خانوادهٔ r365)
  س۷ بانک واژهٔ پرسش‌واژه‌ها (۳ تایپی) — بانکِ چاپی [Where، How، When، Who، Why] با
      دو اضافی (How/When — به‌رغمِ «یک کلمه اضافی» چاپی)؛ کلید با نوعِ پاسخِ B
      (because→Why، My sister→Who، I live in Paveh→Where)
  س۸ بازنویسی با قیدِ تکرار (۲ تایپی) — جایگاهِ قیدِ تکرار پیش از فعلِ اصلی یکتاست؛
      داربست: جملهٔ سادهٔ خودِ ساقه
  س۹ جواب صحیح (۴ MCQ) — هر کلید با photo dictionary درس: ask the information desk* /
      open an account* / take out money from an ATM* / help charity* (ص۶۶)
  س۱۰ وصل‌کردنیِ ستون‌ها (۶ MCQ با ۷ گزینهٔ مشترکِ چاپی a-g؛ f اضافی) — آینه‌سازیِ
      ساختاریِ پرسش/پاسخ: be-پرسش↔be-پاسخ (س۲↔e)، do-پرسش↔فعل‌محور (س۳↔g)،
      Who→نامِ شخص، Where→مکان، When→حذفِ متقاطع، there→پاسخِ there
  س۱۱ تکمیل با معلومات (۴ تایپی) — t_…→take out («take out money from an ATM*» ص۶۶)،
      r_…→round (مکالمهٔ verbatim «It's just round the corner.» ص۶۶)، h_…→hire («hire a
      taxi*» ص۶۶)، f_…→fire station («Fire station*» ص۶۵ + پاسخِ c س۱۰ + متنِ س۴)
مستثنی‌ها: س۱/س۲ تصویری، س۳ افتان/خیزان (آهنگی)، س۴ «چهار اشتباه گرامری» (سه خطای یکتا:
  Its→It's، They job→Their job، always helping→always help؛ خطای چهارمِ نایکتا: in→for
  emergency events یا in→on two shifts — سقوطِ الگوی س۹ِ r365)
هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)
  — کلید = استنتاجِ مستندِ عبارت‌محور/ساختاری (الگوی g9exam1/2/3).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
G9 = ROOT / "public/jozve/tests-g9.json"

d = json.loads(G9.read_text(encoding="utf-8"))
if "g9exam4" in d.get("source", {}):
    print("r367: receipt g9exam4 already present — NO-OP")
    raise SystemExit(0)

PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i


def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]


SEG = page_lines(73) + page_lines(74) + page_lines(75)


def find(needle: str, from_abs: int = 0) -> int:
    for i in range(from_abs, len(SEG)):
        if needle in SEG[i]:
            return i
    raise AssertionError(f"anchor missing: {needle!r}")


def find_all(needle: str) -> int:
    for i, l in enumerate(LAYER):
        if needle in l:
            return i
    raise AssertionError(f"layer anchor missing: {needle!r}")


# ————— اثباتِ لنگرهای عبارت/مکالمهٔ درس چهارم (رسید) —————
LEX = {
    "open an account*": "عبارتِ photo dictionary درس — لنگرِ س۹ق۲",
    "take out money from an ATM*": "عبارتِ photo dictionary درس — لنگرِ س۹ق۳/س۱۱ق۱",
    "ask the information desk*": "عبارتِ photo dictionary درس — لنگرِ س۹ق۱/س۵ق۲",
    "help charity*": "عبارتِ photo dictionary درس — لنگرِ س۹ق۴/س۵ق۳",
    "donate blood*": "عبارتِ photo dictionary درس",
    "hire a taxi*": "عبارتِ photo dictionary درس — لنگرِ س۱۱ق۳",
    "recharge your E-ticket*": "عبارتِ photo dictionary درس — لنگرِ س۵ق۱",
    "just round the corner": "مکالمهٔ خودِ درس verbatim (Pedram ص۶۶) — لنگرِ س۱۱ق۲",
    "Fire station*": "واژهٔ درس (ص۶۵) — لنگرِ س۱۱ق۴",
}
for k in LEX:
    find_all(k)
# سربرگِ خانواده + شواهدِ سکشن‌های مستثنی
find("سواالت امتحانی درس چهارم")
find("با توجه به تصاویر پاسخ صحیح")      # س۱ تصویری
find("درستی یا نادرستی")                 # س۲ تصویری
find("افتان و خیزان")                    # س۳ آهنگی
find("چهار اشتباه گرامری")               # س۴ سقوط‌کرده

# ————— س۵: دیکتهٔ ناقص (۳ تایپی) —————
find("R_charge the e t_cket")
find("inform_tion desk")
find("help ch_rity")
DATA29 = [
    ("R_charge the e t_cket", "Recharge the e-ticket",
     ["Recharge the e-ticket", "Recharge the e ticket"],
     "information desk",
     "عبارتِ خودِ درس: «recharge your E-ticket*» (ص۶۶) + Recharge* (ص۶۵)؛ «e t_cket» شکستِ چاپیِ «e-ticket»"),
    ("inform_tion desk", "information desk", ["information desk"],
     "help charity",
     "عبارتِ خودِ درس: «ask the information desk*» (ص۶۶) + Information* (ص۶۵)"),
    ("help ch_rity", "help charity", ["help charity"],
     "Recharge the e-ticket",
     "عبارتِ خودِ درس: «help charity*» (ص۶۶) + Charity* (ص۶۵)"),
]
BANK29 = []
for stem, key, accepted, wrong, why in DATA29:
    BANK29.append({
        "id": f"g9-l29-{len(BANK29) + 1}", "n": len(BANK29) + 1,
        "category": "vocab", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": accepted, "placeholder": "complete the words…", "keyWhy": why,
    })

# ————— س۶: مرتب‌کردن جملات (۲ تایپی) —————
DATA30 = [
    ("work / every / voluntary / do / we / weekend", "We do voluntary work every weekend."),
    ("always / clean / keep / they / city / the", "They always keep the city clean."),
]
BANK30 = []
for stem, key in DATA30:
    find(stem)
    BANK30.append({
        "id": f"g9-l30-{len(BANK30) + 1}", "n": len(BANK30) + 1,
        "category": "grammar", "kind": "typed",
        "question": stem, "options": [key, stem], "answer": 0,
        "accepted": [key], "placeholder": "write the sentence…",
        "keyWhy": "تنها یک چینشِ دستوریِ ممکن از شش واژه — داربست: ردیفِ به‌هم‌ریختهٔ چاپی (خانوادهٔ r365)",
    })

# ————— س۷: بانک واژهٔ پرسش‌واژه‌ها (۳ تایپی) —————
find("(Where – How – When – Who –- Why)")
find("does take bus? B: because")
find("makes a cake for us? B: My sister.")
find("do you live? B: I live in Paveh.")
WHBANK = ["Where", "How", "When", "Who", "Why"]
DATA31 = [
    ("A: ------- does take bus? B: because it's cheap.", "Why", "How",
     "پاسخِ B با «because» آغاز می‌شود → علت‌خواهی: Why"),
    ("A: ------- makes a cake for us? B: My sister.", "Who", "When",
     "پاسخِ B نامِ شخص است → شخص‌خواهی: Who"),
    ("A: ------- do you live? B: I live in Paveh.", "Where", "When",
     "پاسخِ B مکان است → مکان‌خواهی: Where"),
]
BANK31 = []
for stem, key, wrong, why in DATA31:
    BANK31.append({
        "id": f"g9-l31-{len(BANK31) + 1}", "n": len(BANK31) + 1,
        "category": "grammar", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": [key], "placeholder": "question word…", "keyWhy": why,
    })

# ————— س۸: بازنویسی با قیدِ تکرار (۲ تایپی) —————
find("They come late. (never)")
find("She studies hard. (always)")
BANK32 = [
    {
        "id": "g9-l32-1", "n": 1, "category": "grammar", "kind": "typed",
        "question": "They come late. (never)",
        "options": ["They never come late.", "They come late."],
        "answer": 0, "accepted": ["They never come late."],
        "placeholder": "rewrite the sentence…",
        "keyWhy": "قیدِ تکرار در جملهٔ مثبت پیش از فعلِ اصلی می‌نشیند: They never come late. — داربست: جملهٔ سادهٔ خودِ ساقه",
    },
    {
        "id": "g9-l32-2", "n": 2, "category": "grammar", "kind": "typed",
        "question": "She studies hard. (always)",
        "options": ["She always studies hard.", "She studies hard."],
        "answer": 0, "accepted": ["She always studies hard."],
        "placeholder": "rewrite the sentence…",
        "keyWhy": "قیدِ تکرار پیش از فعلِ اصلی: She always studies hard. — داربست: جملهٔ سادهٔ خودِ ساقه",
    },
]

# ————— س۹: جواب صحیح (۴ MCQ) —————
find("I want to donate blood, where should I go?")
find("fill out this form. How much money")
find("My uncle is very generous")
find("save people’ lives")
find("ask information desk")
find("c) take out money from an ATM")
BANK33 = [
    {
        "id": "g9-l33-1", "n": 1, "category": "vocab",
        "question": "A: Excuse me, I want to donate blood, where should I go?\nB: I don’t know. You can -------",
        "options": ["save people’ lives", "ask information desk", "call the emergency", "keep the city clean"],
        "answer": 1,
        "keyWhy": "عبارتِ خودِ درس: «ask the information desk*» (ص۶۶) — پاسخِ «where should I go» با پرسیدن از میزِ اطلاعات سازگار است",
    },
    {
        "id": "g9-l33-2", "n": 2, "category": "vocab",
        "question": "A: I want to -------\nB: ok, fill out this form. How much money do you have?",
        "options": ["send an email", "hire a taxi", "recharge my E-ticket", "open an account"],
        "answer": 3,
        "keyWhy": "عبارتِ خودِ درس: «open an account*» (ص۶۶) — فرمِ بانکی و «How much money» فقط با افتتاحِ حساب سازگار است",
    },
    {
        "id": "g9-l33-3", "n": 3, "category": "vocab",
        "question": "A: I need money\nB: you can -------",
        "options": ["open an account", "call the emergency", "take out money from an ATM", "recharge your E-ticket"],
        "answer": 2,
        "keyWhy": "عبارتِ خودِ درس: «take out money from an ATM*» (ص۶۶) — «I need money» → برداشتِ پولِ نقد از خودپرداز",
    },
    {
        "id": "g9-l33-4", "n": 4, "category": "vocab",
        "question": "My uncle is very generous. He always -------",
        "options": ["buy ticket", "help charity", "keep the city clean", "hire a taxi"],
        "answer": 1,
        "keyWhy": "عبارتِ خودِ درس: «help charity*» (ص۶۶) — generous (بخشنده) → کمک به خیریه",
    },
]

# ————— س۱۰: وصل‌کردنیِ ستون‌ها (۶ MCQ با ۷ گزینهٔ مشترکِ چاپی a-g) —————
for stem in ["Who's that man?", "What s his job?", "What does he do?",
             "Where does he work?", "When does he work?", "Is there a fire station near here"]:
    find(stem)
for opt in ["He works on shifts", "He is Mr. Amaini", "At a fire station.", "one over there",
            "He is fire fighter.", "from a post office", "puts out fire and saves"]:
    find(opt)
OPTS34 = ["He works on shifts", "He is Mr. Amaini", "At a fire station.", "Yes, there’s one over there.",
          "He is fire fighter.", "from a post office", "He puts out fire and saves people’s lives"]
DATA34 = [
    ("Who's that man?", 1,
     "پرسشِ Who → تنها نامِ شخص: b) He is Mr. Amaini (الگوی س۴ِ r365/س۱۴ِ r364)"),
    ("What s his job?", 4,
     "پرسشِ be («What is his job?») → پاسخِ be-ساختار: e) He is fire fighter. — سؤال و جواب آینهٔ ساختاری‌اند"),
    ("What does he do?", 6,
     "پرسشِ do → پاسخِ فعل‌محور: g) He puts out fire and saves people’s lives — آینه‌سازیِ do"),
    ("Where does he work?", 2,
     "پرسشِ Where → مکان: c) At a fire station. (+ واژهٔ درس «Fire station*» ص۶۵)"),
    ("When does he work?", 0,
     "پرسشِ When → با حذفِ متقاطع تنها پاسخِ زمان‌نما: a) He works on shifts (f مکان/منبع است نه زمان)"),
    ("Is there a fire station near here", 3,
     "پرسشِ there → d) Yes, there’s one over there. — توافقِ there؛ علامتِ پرسشِ چاپی در ق۶ نیست (verbatim)"),
]
BANK34 = [{
    "id": f"g9-l34-{i + 1}", "n": i + 1, "category": "grammar",
    "question": f"{stem} ( ------- )", "options": OPTS34, "answer": ans, "keyWhy": why,
} for i, (stem, ans, why) in enumerate(DATA34)]

# ————— س۱۱: تکمیل با معلومات (۴ تایپی) —————
find("money from that ATM.")
find("r_ _ _ _ the corner.")
find("a taxi to school every day")
find("works in a f _")
DATA35 = [
    ("You can t_ _ _ _ _ _ money from that ATM.", "take out", ["take out"], "hire",
     "عبارتِ خودِ درس: «take out money from an ATM*» (ص۶۶) و گزینهٔ c س۹؛ t + ۶ خانه = takeout (هفت حرف)"),
    ("The post office is just r_ _ _ _ the corner.", "round", ["round"], "take out",
     "مکالمهٔ خودِ درس verbatim: «It’s just round the corner.» (ص۶۶، Pedram)؛ r + ۴ خانه = round"),
    ("They h _ _ _ a taxi to school every day.", "hire", ["hire"], "round",
     "عبارتِ خودِ درس: «hire a taxi*» (ص۶۶)؛ h + ۳ خانه = hire"),
    ("The fire fighter works in a f _ _ _ _ _ _ _ _ _.", "fire station", ["fire station", "firestation"], "hire",
     "واژهٔ درس «Fire station*» (ص۶۵) + پاسخِ c س۱۰ («At a fire station.») + متنِ س۴ همان صفحه («There is a fire station in my city.»)؛ خانه‌های چاپی یکی کم‌تر از حروفِ fire station — کوئیرکِ مستند"),
]
BANK35 = []
for stem, key, accepted, wrong, why in DATA35:
    BANK35.append({
        "id": f"g9-l35-{len(BANK35) + 1}", "n": len(BANK35) + 1,
        "category": "vocab", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": accepted, "placeholder": "complete the word…", "keyWhy": why,
    })

# ————— چسباندن بانک‌ها —————
def mkbank(lesson, title, level, qs):
    return {"lesson": lesson, "title": title, "level": level, "count": len(qs), "questions": qs}


d["lessons"] += [
    mkbank(29, "امتحانی درس چهارم — دیکتهٔ ناقص (س۵، ص۷۴)", "تمرین تایپی (دیکتهٔ ناقص)", BANK29),
    mkbank(30, "امتحانی درس چهارم — مرتب‌کردن جملات (س۶، ص۷۴)", "تمرین تایپی (مرتب‌کردن)", BANK30),
    mkbank(31, "امتحانی درس چهارم — بانک واژهٔ پرسش‌واژه‌ها (س۷، ص۷۴)", "تمرین تایپی (بانک واژه)", BANK31),
    mkbank(32, "امتحانی درس چهارم — بازنویسی با قیدِ تکرار (س۸، ص۷۴)", "تمرین تایپی (بازنویسی)", BANK32),
    mkbank(33, "امتحانی درس چهارم — جواب صحیح (س۹، ص۷۵)", "چهارگزینه‌ای", BANK33),
    mkbank(34, "امتحانی درس چهارم — وصل‌کردنیِ ستون‌ها (س۱۰، ص۷۵)", "چهارگزینه‌ای (هفت‌گزینه‌ایِ چاپی)", BANK34),
    mkbank(35, "امتحانی درس چهارم — تکمیل با معلومات (س۱۱، ص۷۵)", "تمرین تایپی (تکمیلِ حرف‌به‌حرف)", BANK35),
]

d["source"]["g9exam4"] = {
    "extractedRound": "r367",
    "section": "سؤالات امتحانی درس چهارم پایه نهم",
    "examPages": "ص۷۳-۷۵ (برچسبِ فوترِ خودِ اسکن با شمارهٔ PDF برابر)؛ ص۷۶ تقریباً خالی و درس پنجم از ص۷۷ با واژگانِ «رسانه» شروع می‌شود",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 11,
    "sectionsExtracted": 7,
    "sectionsSkipped": 4,
    "items": 24,
    "bankCounts": [3, 2, 3, 2, 4, 6, 4],
    "wordBank": ["Where", "How", "When", "Who", "Why"],
    "extraWords": ["How", "When"],
    "keyPolicy": "کلیدِ استنتاجیِ عبارت‌محور/ساختاری: هر کلید یا با photo dictionary خودِ درس چهارم («open an account*»/«take out money from an ATM*»/«ask the information desk*»/«help charity*»/«hire a taxi*»/«recharge your E-ticket*» ص۶۶، «Fire station*» ص۶۵) یا با مکالمهٔ verbatim درس («It’s just round the corner.» ص۶۶) یا با نوعِ پاسخِ B (س۷) یا آینه‌سازیِ ساختاریِ پرسش/پاسخ (س۱۰) یا جایگاهِ قیدِ تکرار (س۸) یکتا می‌شود — الگوی g9exam1/2/3؛ هیچ کلیدی از خارجِ متنِ درس نیامده",
    "derivedKeys": {
        "S5": [x["keyWhy"] for x in BANK29],
        "S6": [x["keyWhy"] for x in BANK30],
        "S7": [x["keyWhy"] for x in BANK31],
        "S8": [x["keyWhy"] for x in BANK32],
        "S9": [x["keyWhy"] for x in BANK33],
        "S10": [x["keyWhy"] for x in BANK34],
        "S11": [x["keyWhy"] for x in BANK35],
    },
    "skippedSections": [
        "س۱ (ص۷۳): «با توجه به تصاویر پاسخ صحیح را انتخاب کنید» — تصویری؛ گزینه‌های سه ستون (a-d ×۳) چاپی‌اند ولی انتخاب با تصویر است — الگوی س۱ِ r365/r366",
        "س۲ (ص۷۳): «با توجه به هر تصویر درستی یا نادرستی عبارات زیر را مشخص کنید» — تصویری (Take out money / Send an email / donate the blood)",
        "س۳ (ص۷۳): افتان و خیزان با فلشِ رو به بالا/پایین — آهنگی؛ الگوی س۶ِ r366/س۱۰ِ r364",
        "س۴ (ص۷۴): «در متن زیر چهار اشتباه گرامری وجود دارد» — سه خطای یکتا: Its→It's، They job→Their job، They always helping→They always help؛ خطای چهارمِ نایکتا: «to be ready in emergency events» هم با for هم در دو شمارهٔ دیگر قابلِ تصحیح است و شمارشِ چهارگانه تکمیل نمی‌شود — سقوطِ الگوی س۹ِ r365 (قراردادِ r358)",
    ],
    "printQuirkCount": 13,
    "printQuirks": [
        "گلیفِ لام-الِ لایه: «جمالت»→جملات، «باال»→بالا، «رو به باال و یا پایین تن» (س۳) — عنوان‌های بانک بازسازیِ خوانا (الگوی r362/r365)",
        "شماره‌گذاریِ چاپیِ سالم: ۱-۱۱ پیوسته و یکتا (برخلافِ درس سوم با «۴» تکراری)؛ ارقامِ آمیخته: «۱)»/«۳)»/«۸» فارسی و بقیه لاتین",
        "س۱: سه ستونِ MCQِ تصویری در یک سطرِ لایه (a-d ×۳ با COLSPLIT ۴+ فاصله)؛ سکشنِ مستثنی",
        "س۵: «R_charge the e t_cket» — شکستِ «e-ticket» با فاصله در چاپ/لایه؛ عبارتِ کامل‌شده از photo dictionary درس بازسازی شد",
        "س۷: دستورِ چاپی «یک کلمه اضافی است» ولی بانک ۵ واژه برای ۳ جای خالی دارد — دو اضافی (How/When)؛ کوئیرکِ شمارشی مستند",
        "س۷ق۱: «does take bus» — افتادِ فاعل در چاپ (verbatim در ساقه)؛ کلید با پاسخِ B (because) یکتا می‌ماند",
        "س۷ بانک: «(Where – How – When – Who –- Why)» — خطِ تیرهٔ دوبلِ چاپی؛ پنج واژه بازچینی شد",
        "س۹: «save people' lives» — آپاستروفِ بی‌s چاپی (در برابرِ people’s درست در گزینهٔ g س۱۰)؛ «buy ticket» بی‌حرفِ تعریف — هر دو verbatim",
        "س۹: گزینه‌های a/c در ستونِ چپ و b/d در ستونِ راست (دوستونی) — بازچینی به ترتیبِ a/b/c/d",
        "س۱۰: «What s his job?» — افتادِ آپاستروفِ چاپی (verbatim)؛ ق۶ «Is there a fire station near here» بی‌علامتِ پرسش؛ گزینهٔ f با حرفِ کوچکِ آغازین و بی‌نقطه",
        "س۱۰: ۷ گزینه برای ۶ سطر — f) from a post office اضافیِ چاپ؛ هفت گزینه در موتور (letters تا g) بومی پشتیبانی می‌شود",
        "س۱۱ق۴: خانه‌های چاپی یکی کم‌تر از حروفِ «fire station» (f + ۹ در برابرِ ۱۰ حرفِ باقی‌مانده) — همان افتادِ خانه‌های «Express train» (r365)؛ کلید از لنگرهای سه‌گانه (واژنامه/س۱۰ق۴/متنِ س۴) یکتاست",
        "آپاستروف‌های آمیخته: «It's cheap» راست (س۷) و «there’s/people’s/don’t» خمیده (س۹/س۱۰) — verbatim؛ نرمال‌سازِ موتور یکسان می‌کند",
    ],
    "lessonLexicon": {
        "open an account": "حساب بازکردن — photo dictionary درس («open an account*» ص۶۶) — لنگرِ س۹ق۲",
        "take out money from an ATM": "برداشتِ پول از خودپرداز — photo dictionary درس (ص۶۶) — لنگرِ س۹ق۳/س۱۱ق۱",
        "ask the information desk": "پرسیدن از میزِ اطلاعات — photo dictionary درس (ص۶۶) — لنگرِ س۹ق۱/س۵ق۲",
        "help charity": "کمک به خیریه — photo dictionary درس (ص۶۶) — لنگرِ س۹ق۴/س۵ق۳",
        "donate blood": "اهدای خون — photo dictionary درس («donate blood*» ص۶۶) + Donate* (ص۶۵)",
        "hire a taxi": "تاکسی گرفتن — photo dictionary درس (ص۶۶) — لنگرِ س۱۱ق۳",
        "recharge your E-ticket": "شارژکردنِ بلیتِ الکترونیکی — photo dictionary درس (ص۶۶) + Recharge* (ص۶۵) — لنگرِ س۵ق۱",
        "Fire station": "آتش‌نشانی — واژهٔ درس (ص۶۵) — لنگرِ س۱۱ق۴",
        "round the corner": "دورِ گوشهٔ خیابان — مکالمهٔ درس verbatim: «It’s just round the corner.» (ص۶۶، Pedram) — لنگرِ س۱۱ق۲",
        "Charity": "خیریه — واژهٔ درس (ص۶۵)",
        "Information": "اطلاعات — واژهٔ درس (ص۶۵)",
        "Recharge": "شارژکردن — واژهٔ درس (ص۶۵)",
        "voluntary work": "کارِ داوطلبانه — س۶ (عبارتِ مرتب‌کردنیِ چاپی)",
        "keep the city clean": "شهر را تمیز نگه‌داشتن — گزینهٔ س۹/س۶ (عبارتِ چاپی)",
    },
    "typedNote": "همهٔ ۱۴ آیتمِ تایپیِ تازه دو گزینه‌ای‌اند (کلید + داربستِ غلط) — قفلِ سراسریِ r363 (ممنوعیتِ تایپیِ تک‌گزینه‌ای) حفظ شد؛ داربست‌ها خانواده‌محور: چرخشِ عبارت‌های هم‌بانک (س۵/س۷/س۱۱)، ردیفِ به‌هم‌ریختهٔ چاپی (س۶)، جملهٔ سادهٔ خودِ ساقه (س۸)",
}

G9.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
ids = [q["id"] for b in d["lessons"] for q in b["questions"]]
print(f"r367: +7 banks / +24 items → tests-g9 = {len(d['lessons'])} banks / {len(ids)} items")
