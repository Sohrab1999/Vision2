#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r371 — «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس سوم (pdf-p65) + خانوادهٔ درس چهارم (pdf-p74+p75)
→ افزودنِ ۶ بانک/۲۵ آیتم به public/jozve/tests-g7.json (۴ بانکِ r370 محفوظ)

خانوادهٔ ۳ (درس سوم، ص۶۵ — ۶ سکشن: ۱/۲/۳/۴ + بی‌شماره + ۶) — ۴ بانک/۱۳ آیتم:
  س۱ (۴ MCQ چهارگزینه‌ای) — «کلمات زیر را با en یا ten کامل کنید»: Sev/Elev/Nine/Six
      ستونِ مشترکِ مشتقِ چاپی [Seven, Eleven, Nineteen, Sixteen]؛ چرا MCQ و نه تاییدی:
      قراردادِ r363 (بدونِ آیتمِ تایپی در g7 — موتورِ تایپ case-insensitive) و چون افزودنِ
      حرفِ «ten» به «Nine» از نظرِ املایی «Nineteen» می‌شود نه «Nineten» — MCQ با گزینه‌های
      کاملِ کلمه این ابهامِ چاپی را منحل می‌کند. چینشِ گزینه‌ها per-item (کلیدها 0,3,2,1)
  س۲ (۴ MCQ چهارگزینه‌ای) — «اعداد زیر را به حروف انگلیسی بنویسید»: 10/5/20/41
      ستونِ مشترکِ چاپی-مشتق [Ten, Five, Twenty, Forty-one]؛ هر پاسخِ سکشن، حواس‌پرتِ
      سه آیتمِ دیگر است (الگویِ ستونِ مشترکِ r370-بانک۴)؛ 41 = Forty-one با خطِ پیوند
  س۳ (۴ MCQ چهارگزینه‌ایِ مشترکِ چاپی) — «با توجه به کلمات ستون سمت راست، به سوالات جواب دهید»:
      ستونِ چاپی a-d verbatim (پاسخ‌های lowercase چاپ حفظ شد: my name is saro. و…)؛
      ساقهٔ «Hoe old are you?» با غلطِ تایپیِ چاپ verbatim؛ کلیدها [1,3,0,2] — نگاشتِ یک‌به‌یک
  س۶ (۱ MCQ سه‌گزینه‌ای) — «جمعه به انگلیسی چه می شود؟» → Friday؛ نخستین ساقهٔ فارسیِ کارتِ
      هفتم (عینِ خطِ چاپ)؛ گزینه‌های حواس‌پرت = روزهایِ چاپیِ س۴ (Saturday/Tuesday)؛ کلیدِ
      ترجمه‌ایِ یکتا (الگویِ کلیدِ عینیِ r369) — خودِ Friday در خانواده چاپی نیست (مستند)
  مستثنی: س۴ (Sunday/four در هیچ‌جایِ خانواده چاپی نیست — تولیدِ توالی)،
          س۵ بی‌شمارهٔ چاپی (کیکِ تولد ۶ شمعه/تقویمِ آذر — کلید در تصویر است؛ QuizQuestion
          فیلدِ تصویر ندارد و پاسخ‌دهنده نمی‌تواند تصویر را ببیند — الگویِ مستثنیِ r370)
خانوادهٔ ۴ (درس چهارم، ص۷۴+ص۷۵ — ۷ سکشن) — ۲ بانک/۱۱ آیتم:
  ص۷۵-س۲ (۴ MCQ هفت‌گزینه‌ایِ مشترکِ چاپی — نخستینِ هفت‌گزینه‌ایِ کارتِ هفتم) —
      بانکِ چاپی [Mechanic, birthday, Mrs, florist, housewife, Bahman, meet]؛
      ۲ حذفِ آیتمیِ دوکلیدی: س۳ «My uncle is a …» (mechanic/florist هر دو مجاز) و
      س۵ «My moter is a …» (housewife/florist هر دو مجاز — با حذفِ س۳ قیدِ «یک اضافی»
      دیگر گزینش‌گر نیست)؛ هرگز-کلید: Mechanic/florist/housewife (گارد)؛
      «Day …, Esfand.» = توالیِ ماه‌های دی/بهمن/اسفند (Day = دی — جدولِ ص۶۴)
  ص۷۵-س۳ (۷ MCQ دوگزینه‌ایِ He/She) — مذکر/مونثِ بانکِ چاپی؛ «grangmoter» غلطِ تایپیِ
      چاپ برایِ grandmother — verbatim؛ مذکر: Father/brother/grandfather/uncle؛
      مونث: mother/sister/grangmoter
  مستثنی (همه تصویری-کلید): ص۷۴-س۱ (وسیله→شغل — ساقه‌ها تصویرند: هواپیما/سطل‌ونقاشی/تراکتور/یونیتِ دندان)،
      ص۷۴-س۲ (نام‌ها چاپی‌اند ولی کلید از نوارِ تصویر می‌آید)، ص۷۴-س۳ (ص/غ با تصاویر)،
      ص۷۵-س۱ (Football/bus/father/nurse/dentist/sister به تصاویر)، ص۷۵-س۴ (معنیِ فارسیِ
      Teacher/pilot/آشپز/کارگر — کلیدِ فارسی چاپی نیست — تولید)
هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست — کلیدها استنتاجیِ مستند (رسید g7exam3/g7exam4).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g7.json"
LAYER = ROOT / "booklet-extract/g7.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g7exam3" in d.get("source", {}):
    print("r371: receipt g7exam3 already present — NO-OP")
    raise SystemExit(0)

# ————— استخراجِ ساقه‌های س۱ از خودِ لایه (بدونِ بازنویسیِ دستی — ضدِ خطایِ رونویسی) —————
layer = LAYER.read_text(encoding="utf-8").split("\n")
p65_start = next(i for i, l in enumerate(layer) if l.strip() == "<<<PAGE 65>>>")
p65_end = next(i for i, l in enumerate(layer) if i > p65_start and l.strip().startswith("<<<PAGE"))
p65 = layer[p65_start:p65_end]
tokens: list[str] = []
for line in p65:
    for tok in line.split():
        if re.fullmatch(r"(Sev|Elev|Nine|Six)[….]+", tok):
            tokens.append(tok)
assert len(tokens) == 4, f"expected 4 stems from layer p65, got {tokens}"
SEV, ELEV, NINE, SIX = tokens
assert SEV.startswith("Sev") and ELEV.startswith("Elev") and NINE.startswith("Nine") and SIX.startswith("Six")


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {
        "id": id_,
        "n": n,
        "category": category,
        "question": question,
        "options": options,
        "answer": answer,
    }


# ————— خانوادهٔ ۳ / س۱ — تکمیلِ اعداد با en/ten: ستونِ مشترکِ مشتقِ چاپی —————
COL_S1 = ["Seven", "Eleven", "Nineteen", "Sixteen"]
S1_OPTS = [
    (["Seven", "Eleven", "Nineteen", "Sixteen"], 0),
    (["Seven", "Nineteen", "Sixteen", "Eleven"], 3),
    (["Eleven", "Sixteen", "Nineteen", "Seven"], 2),
    (["Seven", "Sixteen", "Eleven", "Nineteen"], 1),
]
bank5 = {
    "lesson": 5,
    "title": "امتحانی درس سوم — تکمیل اعداد با en/ten (س۱، ص۶۵)",
    "level": "چهارگزینه‌ای",
    "count": 4,
    "questions": [
        q(f"g7-l5-{i+1}", i + 1, "vocab", stem, opts, ans)
        for i, (stem, (opts, ans)) in enumerate(zip([SEV, ELEV, NINE, SIX], S1_OPTS))
    ],
}

# ————— خانوادهٔ ۳ / س۲ — عدد به حروف: ستونِ مشترک —————
COL_S2 = ["Ten", "Five", "Twenty", "Forty-one"]
S2_ITEMS = [
    ("10", ["Ten", "Five", "Twenty", "Forty-one"], 0),
    ("5", ["Ten", "Twenty", "Forty-one", "Five"], 3),
    ("20", ["Ten", "Forty-one", "Twenty", "Five"], 2),
    ("41", ["Twenty", "Forty-one", "Ten", "Five"], 1),
]
bank6 = {
    "lesson": 6,
    "title": "امتحانی درس سوم — عدد به حروف (س۲، ص۶۵)",
    "level": "چهارگزینه‌ای",
    "count": 4,
    "questions": [
        q(f"g7-l6-{i+1}", i + 1, "vocab", f"{digit} → -------", opts, ans)
        for i, (digit, opts, ans) in enumerate(S2_ITEMS)
    ],
}

# ————— خانوادهٔ ۳ / س۳ — پاسخ از ستونِ راستِ چاپی (a-d verbatim) —————
COL_S3 = ["I am 13 years old.", "my name is saro.", "it is in Bahman.", "my last name is lotfi."]
S3_STEMS = [
    "What is your first name? ( ------- )",
    "What is your last name? ( ------- )",
    "Hoe old are you? ( ------- )",
    "What is your birthday? ( ------- )",
]
S3_KEYS = [1, 3, 0, 2]
bank7 = {
    "lesson": 7,
    "title": "امتحانی درس سوم — پاسخ از ستون راست (س۳، ص۶۵)",
    "level": "چهارگزینه‌ای",
    "count": 4,
    "questions": [
        q(f"g7-l7-{i+1}", i + 1, "vocab", stem, COL_S3, ans)
        for i, (stem, ans) in enumerate(zip(S3_STEMS, S3_KEYS))
    ],
}

# ————— خانوادهٔ ۳ / س۶ — جمعه به انگلیسی (نخستین ساقهٔ فارسیِ کارتِ هفتم) —————
bank8 = {
    "lesson": 8,
    "title": "امتحانی درس سوم — جمعه به انگلیسی (س۶، ص۶۵)",
    "level": "سه‌گزینه‌ای",
    "count": 1,
    "questions": [
        q("g7-l8-1", 1, "vocab", "جمعه به انگلیسی چه می شود؟ ( ------- )", ["Friday", "Saturday", "Tuesday"], 0),
    ],
}

# ————— خانوادهٔ ۴ / ص۷۵-س۲ — تکمیلِ جمله با بانکِ واژهٔ هفت‌تاییِ چاپی —————
COL_S9 = ["Mechanic", "birthday", "Mrs", "florist", "housewife", "Bahman", "meet"]
S9_ITEMS = [
    ("She is ( ------- ) Ahmadi.", 2),   # Mrs
    ("Happy ( ------- ) to you.", 1),    # birthday
    ("Day ( ------- ), Esfand.", 5),     # Bahman — دی/بهمن/اسفند
    ("Nice to ( ------- ) you.", 6),     # meet
]
bank9 = {
    "lesson": 9,
    "title": "امتحانی درس چهارم — تکمیل جمله با بانک واژه (س۲، ص۷۵)",
    "level": "هفت‌گزینه‌ای",
    "count": 4,
    "questions": [
        q(f"g7-l9-{i+1}", i + 1, "vocab", stem, COL_S9, ans)
        for i, (stem, ans) in enumerate(S9_ITEMS)
    ],
}

# ————— خانوادهٔ ۴ / ص۷۵-س۳ — مذکر/مونث: هفت دوگزینه‌ایِ He/She —————
S10_WORDS = ["Father", "mother", "sister", "brother", "grandfather", "grangmoter", "uncle"]
S10_KEYS = [0, 1, 1, 0, 0, 1, 0]  # He=0 / She=1
bank10 = {
    "lesson": 10,
    "title": "امتحانی درس چهارم — مذکر و مونث (س۳، ص۷۵)",
    "level": "دوگزینه‌ای",
    "count": 7,
    "questions": [
        q(f"g7-l10-{i+1}", i + 1, "grammar", f"{w} → -------", ["He", "She"], ans)
        for i, (w, ans) in enumerate(zip(S10_WORDS, S10_KEYS))
    ],
}

# ————— رسیدِ خانوادهٔ ۳ —————
receipt3 = {
    "extractedRound": "r371",
    "section": "نمونه سؤالات امتحانی درس سوم پایه هفتم",
    "examPages": "pdf-p65 (فوترِ خودِ اسکن: ۶۵) — خانوادهٔ یک‌صفحه‌ای؛ ص۶۶ جدولِ واژگانِ درس سوم است (مرزِ پایانی)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 6,
    "sectionsExtracted": 4,
    "sectionsSkipped": 2,
    "items": 13,
    "bankCounts": [4, 4, 4, 1],
    "keyPolicy": "کلیدِ استنتاجیِ ساختاری: س۱/س۲ = ستونِ مشترکِ مشتقِ چاپی (پاسخِ هر آیتم از ساقهٔ چاپی + دستورِ «en/ten» یا «اعداد به حروف»، حواس‌پرت‌ها = پاسخ‌های دیگرِ همان سکشن — الگویِ ستونِ مشترکِ r370-بانک۴)؛ س۳ = جورِ یک‌به‌یکِ سؤال/پاسخ از ستونِ چاپیِ a-d (my name is saro فقط به first name می‌نشیند و…)؛ س۶ = کلیدِ ترجمه‌ایِ یکتا (جمعه = Friday — الگویِ کلیدِ عینیِ r369)",
    "engineNote": "س۱/س۲ عمداً MCQ شدند نه تایپی: قراردادِ r363 (بدونِ آیتمِ تایپی در g7 — موتورِ تایپ case-insensitive است) و افزون بر آن، افزودنِ حرفِ «ten» به «Nine» از نظرِ املایی «Nineteen» می‌شود نه «Nineten» — MCQ با گزینه‌های کلمهٔ کامل این ابهامِ چاپی را منحل می‌کند. چینشِ گزینه‌های س۱/س۲ per-item است (کلیدها 0,3,2,1) تا الگویِ «جوابِ قطرِ اصلی» حدس‌زدنی نباشد",
    "derivedKeys": {
        "S1": [
            f"{SEV} → Seven (دستورِ چاپ: با en یا ten)",
            f"{ELEV} → Eleven (دستورِ چاپ: با en یا ten)",
            f"{NINE} → Nineteen (املایِ چاپِ «ten» ابهام دارد؛ MCQ کلمهٔ کامل را می‌سنجد)",
            f"{SIX} → Sixteen (دستورِ چاپ: با en یا ten)",
        ],
        "S2": ["10 → Ten", "5 → Five", "20 → Twenty", "41 → Forty-one (با خطِ پیوند)"],
        "S3": [
            "What is your first name? → my name is saro. (تنها «نامِ کوچک»)",
            "What is your last name? → my last name is lotfi. (تنها «نامِ خانوادگی»)",
            "Hoe old are you? → I am 13 years old. (تنها «سن»)",
            "What is your birthday? → it is in Bahman. (تنها «ماه»)",
        ],
        "S6": ["جمعه → Friday؛ حواس‌پرت‌ها Saturday/Tuesday از روزهایِ چاپیِ س۴"],
    },
    "skippedSections": [
        "س۴ «جاهای خالی را با کلمات مناسب پر کنید»: Saturday … Monday, Tuesday / One, two, three, …, five, …, seven — کلیدها (Sunday/four) در هیچ‌جایِ خانواده چاپی نیستند و «six» هم فقط در س۱ هست؛ تبدیلِ MCQ نیازمندِ کلیدِ غیرچاپی — تولیدِ توالی (الگویِ r370-س۴)",
        "سکشنِ بی‌شمارهٔ چاپی (میانِ ۴ و ۶) «با توجه به تصاویر پاسخ ها را کامل کنید»: How old is your sister? She is … (کیکِ ۶-شمعه) / When's her birthday? It's in … (تقویمِ آذر) — کلید در تصویر است نه ساقه؛ QuizQuestion فیلدِ تصویر ندارد و پاسخ‌دهنده تصویر را نمی‌بیند (الگویِ مستثنیِ r370) — شمارشِ شمع‌ها/خوانشِ تقویم در رسید ثبت شد (۶ شمع؛ آذر)",
        "شماره‌گذاریِ چاپ: سکشنِ پنجم در چاپ بی‌شماره است (۱/۲/۳/۴ سپس ۶) — به‌عنوانِ س۵ شمرده شد",
    ],
    "printQuirks": [
        "ساقهٔ «Hoe old are you?» — غلطِ تایپیِ چاپ (How → Hoe) — verbatim حفظ شد",
        "پاسخ‌های ستونِ س۳ lowercase چاپ‌اند (my name is saro. / my last name is lotfi.) — verbatim؛ «c)it» فاصلهٔ چاپی ندارد (پیشوندِ حرفِ گزینه در UI است، متنِ گزینه از it آغاز می‌شود)",
        "ساقه‌های س۱ از خودِ لایهٔ متنی استخراج شدند (p65: خطِ Sev/Elev/Nine/Six) نه بازنویسیِ دستی — اسکریپت، توکن‌ها را از لایه می‌خواند و اظهار می‌کند",
        "نقطه‌چینِ ساقه‌ها با نویسهٔ … چاپ است — verbatim",
        "س۶: نخستین ساقهٔ فارسیِ کارتِ هفتم (عینِ خطِ چاپ) — گاردِ خلوصِ لاتینِ r370 به بانک‌های ۱-۴ scope شد",
    ],
}

# ————— رسیدِ خانوادهٔ ۴ —————
receipt4 = {
    "extractedRound": "r371",
    "section": "نمونه سؤالات امتحانی درس چهارم پایه هفتم (دو صفحه)",
    "examPages": "pdf-p74 (سربرگ + ۳ سکشنِ تصویری) + pdf-p75 (ادامه با ۴ سکشن)؛ ص۷۶ جدولِ واژگان (مرزِ پایانی)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 7,
    "sectionsExtracted": 2,
    "sectionsSkipped": 5,
    "items": 11,
    "bankCounts": [4, 7],
    "wordBank": ["Mechanic", "birthday", "Mrs", "florist", "housewife", "Bahman", "meet"],
    "extraWords": ["Mechanic", "florist", "housewife"],
    "keyPolicy": "کلیدِ استنتاجیِ ساختاری: ص۷۵-س۲ = تکمیلِ یکتایِ جمله (Happy … to you فقط birthday؛ Nice to … you فقط meet؛ Day …, Esfand = توالیِ ماه‌های دی/بهمن/اسفند — Day = دی از جدولِ ص۶۴؛ She is … Ahmadi فقط Mrs)؛ ص۷۵-س۳ = مذکر/مونثِ واژگانِ خانواده (دانشِ واژگانیِ عینی)",
    "engineNote": "هفت‌گزینه‌ایِ بانکِ ۹ نخستینِ کارتِ هفتم است (همتایِ r367 در کارتِ نهم)؛ ستونِ مشترکِ چاپی با ۳ هرگز-کلیدِ مستند (Mechanic/florist/housewife) — گارد قفل می‌کند. بانکِ ۱۰ دوگزینه‌ایِ ثابتِ [He, She] است با ترتیبِ چاپ (He پیش از She در سربرگِ گروه‌ها)",
    "derivedKeys": {
        "P75-S2": [
            "She is … Ahmadi. → Mrs (لقبِ رسمیِ پیش از نامِ خانوادگی)",
            "Happy … to you. → birthday (فقط birthday تبریک می‌سازد)",
            "Day …, Esfand. → Bahman (دی، بهمن، اسفند — توالیِ ماه‌ها)",
            "Nice to … you. → meet (اصطلاحِ آشناسازیِ درس)",
        ],
        "P75-S3": [
            "Father → He (مذکر)", "mother → She (مونث)", "sister → She (مونث)",
            "brother → He (مذکر)", "grandfather → He (مذکر)",
            "grangmoter → She (مونث — غلطِ تایپیِ چاپ برایِ grandmother)",
            "uncle → He (مذکر)",
        ],
    },
    "skippedSections": [
        "ص۷۴-س۱ «با توجه به تصاویر مشخص کنید هر وسیله مربوط به چه شغلی می باشد. یک شغل اضافی است» — بانکِ چاپی Painter/Dentist/Florist/Pilot/farmer ولی ساقه‌ها تصویرند (هواپیما/سطل‌وموِ نقاشی/تراکتور/یونیتِ دندان‌پزشکی) — کلید در تصویر است نه ساقه (الگویِ r370)؛ تحلیلِ رندر: ۴ تصویر → Pilot/Painter/farmer/Dentist و Florist اضافی است (ثبت‌شده برایِ آینده)",
        "ص۷۴-س۲ «هرجمله را با نوشتن نام صحیح کنار تصاویر کامل کنید» — نام‌ها چاپی‌اند (Mina/Mr. Amini/Mr. Karimi/Mr. Akbari/Mrs. Amani) ولی کلید از نوارِ تصویر می‌آید (راننده در خودرو = Karimi و…) — تصویری-کلید",
        "ص۷۴-س۳ «با توجه به تصاویر جمله های صحیح را با ✓ و جملات غلط را با ✗ مشخص کنید» — شش ساقهٔ چاپی (My first name is Ali/Hello, Mrs Amini/This is my son/Mina is thirteen years old/He is a boy/My brother is a driver) ولی درستی از تصویر سنجیده می‌شود — تصویری-کلید",
        "ص۷۵-س۱ «کلمات را به تصاویر وصل کنید» — Football/bus/father/nurse/dentist/sister به تصاویر — تصویری-کلید",
        "ص۷۵-س۴ «شغل های زیر را به فارسی و انگلیسی بنویسید» (Teacher/pilot/آشپز/کارگر) — کلیدِ فارسی چاپی نیست — تولید (فقط cook در ص۷۴-س۲ چاپی است؛ ناهمگون)",
        "ص۷۵-س۲ س۳ حذفِ آیتمی: «My uncle is a …» دوکلیدیِ معنایی (mechanic/florist هر دو مجاز؛ چاپ «یک اضافی» گزینش‌گر نیست)",
        "ص۷۵-س۲ س۵ حذفِ آیتمی: «My moter is a …» دوکلیدیِ معنایی (housewife/florist هر دو مجاز — با حذفِ س۳ قیدِ «یک اضافی» دیگر مفید نیست)؛ غلطِ تایپیِ چاپ «moter» در ساقهٔ حذف‌شده ثبت شد",
    ],
    "printQuirks": [
        "بانکِ ص۷۵-س۲ با خط‌های مختلطِ چاپ: (Mechanic – birthday - Mrs – florist – housewife – Bahman – meet) — ترتیبِ چاپ حفظ شد",
        "«grangmoter» غلطِ تایپیِ چاپ برایِ grandmother — verbatim در ساقه (بانکِ ۱۰)",
        "«My moter is a …» غلطِ تایپیِ چاپ برایِ My mother — در ساقهٔ حذف‌شده (ثبت)",
        "«Day …, Esfand.» جملهٔ ناقصِ چاپ است (الگویِ «ماهِ …، اسفند») — Day = دی از جدولِ تبدیلِ ماهِ ص۶۴",
        "سکشن‌های ص۷۴ دوصفحه‌ای نیستند؛ خانوادهٔ چهارم تنها خانوادهٔ دومصفحه‌ایِ g7 تا اینجای جزوه است (ص۷۴+ص۷۵)",
    ],
}

# ————— به‌روزرسانیِ نقشهٔ خانواده‌ها —————
d["source"]["g7familyMap"]["families"][2] = {
    "lesson": "درس سوم", "pdfPage": 65, "round": "r371",
    "status": "استخراج شد — ۴ بانک/۱۳ آیتم از ۶ سکشن (س۴ و س۵ِ تصویری مستثنی)",
}
d["source"]["g7familyMap"]["families"][3] = {
    "lesson": "درس چهارم", "pdfPage": 74, "round": "r371",
    "status": "استخراج شد — ۲ بانک/۱۱ آیتم از ۷ سکشنِ دوصفحه‌ای (۵ سکشنِ تصویری/تولیدی مستثنی)",
}

d["source"]["g7exam3"] = receipt3
d["source"]["g7exam4"] = receipt4

d["lessons"].extend([bank5, bank6, bank7, bank8, bank9, bank10])
d["lessons"].sort(key=lambda b: b["lesson"])

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r371: tests-g7.json extended — {len(d['lessons'])} banks / {total} items")
print("stems from layer:", [SEV, ELEV, NINE, SIX])
