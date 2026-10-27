#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r372 — «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس پنجم (pdf-p84) + خانوادهٔ درس ششم (pdf-p90)
→ افزودنِ ۵ بانک/۲۲ آیتم به public/jozve/tests-g7.json (۱۰ بانکِ r370/r371 محفوظ)

خانوادهٔ ۵ (درس پنجم، ص۸۴ — ۵ سکشن) — ۴ بانک/۱۶ آیتم:
  س۱ (۴ MCQ پنج‌گزینه‌ایِ مشترکِ چاپی) — «پاسخ هر کدام از سوالات ستون A را در ستون B پیدا کنید
      (یک جواب اضافی است)»: ستونِ چاپی verbatim [She is my teacher, Mrs Amini. / He is sixteen
      years old. / Great, thanks / It's in Farvardin. / He is a worker.]؛ اضافیِ چاپی =
      «It's in Farvardin.» (هرگز-کلید)؛ ساقهٔ «4.How old isyour uncle?» با غلطِ چاپِ isyour verbatim؛
      ساقه‌ها از خودِ لایه استخراج می‌شوند (ضدِ رونویسی — الگوی r371)
  س۲ (۴ MCQ چهارگزینه‌ای) — «با توجه به اطلاعات داده شده فرم مقابل را کامل کنید»: متنِ چاپی
      «Hello.My name is Reza Pakzad.I am a waiter. I am fifteen years old. My birthday is in Azar.»
      + فرمِ چاپی [First name / Last name / Month of birth / Job] — نگاشتِ یک‌به‌یکِ چاپ‌لنگردار:
      First name→Reza / Last name→Pakzad / Month of birth→Azar (birthday is in Azar) / Job→waiter؛
      ستونِ مشترکِ مشتقِ چاپی — پاسخ‌های خودِ فرم حواس‌پرتِ هم می‌شوند (الگویِ r371-بانک۶)
  س۴ (۴ MCQ چهارگزینه‌ای) — «رنگ های زیر را به انگلیسی بنویسید»: زرد/آبی/سیاه/قهوه ای —
      هر چهار کلید در جدولِ واژگانِ درس پنجم چاپی است (ص۷۶: yellow* / blue* / black* / brown*) —
      ستونِ مشترکِ لنگردار؛ ساقهٔ فارسی (دومین و سومین… بانکِ ساقه‌فارسیِ کارتِ هفتم — الگویِ r371-بانک۸)
  س۵ (۴ MCQ چهارگزینه‌ای) — «کلمات زیر را به انگلیسی بنویسید»: کفش/چادر/کت و شلوار/روسری —
      لنگرهای جدولِ درس پنجم (ص۷۷: shoes* / chador* / scarf*؛ ص۷۶: suit* «یکدست لباس» + ص۸۱
      «three-piece suit | کت و …») — trousers فقط «شلوار» است (ص۷۶) پس «کت و شلوار» ≠ trousers؛
      ستونِ مشترکِ لنگردار [shoes, chador, suit, scarf]
  مستثنی: س۳ «هر کلمه را زیر تصویر مربوط به خود بنویسید (یک کلمه اضافی است)» — بانکِ چاپی
      Backpack-Thirteen-Engineer-Thirty-Nurse ولی کلید از تصویر است (معمار/پرستار/عددِ ۱۳/کوله‌پشتی؛
      اضافی Thirty) — QuizQuestion فیلدِ تصویر ندارد (الگویِ مستثنیِ r370/r371)
خانوادهٔ ۶ (درس ششم، ص۹۰ — ۳ سکشن) — ۱ بانک/۶ آیتم:
  س۱ (۶ MCQ هشت‌گزینه‌ایِ مشترکِ چاپی) — «با استفاده از کلمات داده شده جملات را کامل کنید»:
      بانکِ چاپیِ کادرِ بنفش (فقط در رندر — لایه ندارد؛ الگویِ r370-بانک۴):
      [where, bedroom, reading, she's, washing, what, doing, watching]؛ هفت بلنکِ چاپی ولی
      «I am ------- the bank.» (b-B) هیچ واژه‌ای از بانک نمی‌پذیرد (washing/reading هر دو
      بی‌معنا؛ prepositionِ گم‌شده — نقصِ چاپ) → حذفِ آیتمیِ b-B (الگویِ r370-ردیف۴/r371)؛
      شش آیتم با کلیدِ گرامری/معناییِ یکتا: I am in the ------- → bedroom / What are you
      -------? → doing / ------- Is he? → where (Is بزرگ چاپی verbatim) / ------- in the
      living room. → she's / ------- is he doing. → what (نقطهٔ چاپی verbatim) / she is
      ------- TV. → watching؛ هرگز-کلید: reading/washing (دو واژهٔ بی‌مصرفِ بانک — گارد)؛
      گزینه‌های هر آیتم = کلِ بانکِ ۸ واژه‌ای چاپی (هرگز-کلیدها حواس‌پرتِ واقعی‌اند)
  مستثنی: س۲ «با توجه به تصاویر به سوالات زیر پاسخ دهید» (فوتبال/خوردن/تعمیرِ ماشین — تصویری)؛
      س۳ «با توجه به تصاویر کلمه مناسب را انتخاب کنید» (گزینه‌های چاپیِ clock/television/computer/radio
      و clock/table/comb/computer و newspaper/television/mirror/comb ولی کلید از تصویر:
      کامپیوتر/میز/روزنامه — تصویری-کلید)
هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست — کلیدها استنتاجیِ مستند (رسید g7exam5/g7exam6).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g7.json"
LAYER = ROOT / "booklet-extract/g7.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g7exam5" in d.get("source", {}):
    print("r372: receipt g7exam5 already present — NO-OP")
    raise SystemExit(0)

layer = LAYER.read_text(encoding="utf-8").split("\n")


def page_slice(p: int) -> list[str]:
    s = next(i for i, l in enumerate(layer) if l.strip() == f"<<<PAGE {p}>>>")
    e = next(i for i, l in enumerate(layer) if i > s and l.strip().startswith("<<<PAGE"))
    return layer[s:e]


def norm(s: str) -> str:
    """نرمال‌سازیِ چاپ: فاصله‌های چندگانه → تک‌فاصله؛ نقطه‌چینِ بلنک → -------؛
    بلنکِ چسبیده به واژهٔ بعدی → با فاصله."""
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"[….]{3,}", "-------", s)  # هر توالیِ بلنکِ ≥۳ (ترکیبِ … و .) → -------
    s = re.sub(r"-------(?=[A-Za-z])", "------- ", s)
    return s


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": answer}


# ————— پیمانِ لایه: لنگرهای جدولِ واژگانِ درس پنجم (ص۷۶-۷۷) —————
p76 = "\n".join(page_slice(76))
p77 = "\n".join(page_slice(77))
p84 = page_slice(84)
p90 = page_slice(90)
for anchor in ["yellow*", "blue*", "black*", "brown*", "suit*", "trousers*"]:
    assert anchor in p76, f"missing vocab anchor {anchor} on p76"
for anchor in ["shoes*", "chador*", "scarf*"]:
    assert anchor in p77, f"missing vocab anchor {anchor} on p77"
assert "واژگان و نکات گرامری درس پنجم" in p76, "p76 is not the lesson-5 vocab table"

# ————— بانک ۱۱ — خ۵/س۱: ساقه‌ها از لایهٔ ص۸۴ (ضدِ رونویسی) —————
S1_RE = re.compile(r"^\s*([1-4])\.\s*(.+?)\s*\(([^)]+)\)\s*$")
s1_stems: dict[str, str] = {}
for line in p84:
    m = S1_RE.match(line)
    if m:
        s1_stems[m.group(1)] = norm(m.group(1) + ". " + m.group(2) + " (-------)")
assert set(s1_stems) == {"1", "2", "3", "4"}, f"layer stems for p84-S1 incomplete: {s1_stems}"
assert "isyour" in s1_stems["4"], "print typo 'isyour' must be preserved verbatim from layer"

COL_S1 = ["She is my teacher, Mrs Amini.", "He is sixteen years old.", "Great, thanks", "It's in Farvardin.", "He is a worker."]
assert sum(1 for l in p84 for c in COL_S1 if norm(c) in norm(l)) >= 4, "column-B answers missing from layer p84"

S1_ITEMS = [
    (s1_stems["1"], ["Great, thanks", "She is my teacher, Mrs Amini.", "He is sixteen years old.", "It's in Farvardin.", "He is a worker."], 0),
    (s1_stems["2"], ["She is my teacher, Mrs Amini.", "It's in Farvardin.", "Great, thanks", "He is a worker.", "He is sixteen years old."], 3),
    (s1_stems["3"], ["He is sixteen years old.", "Great, thanks", "She is my teacher, Mrs Amini.", "He is a worker.", "It's in Farvardin."], 2),
    (s1_stems["4"], ["It's in Farvardin.", "He is sixteen years old.", "Great, thanks", "He is a worker.", "She is my teacher, Mrs Amini."], 1),
]
bank11 = {
    "lesson": 11,
    "title": "امتحانی درس پنجم — پاسخ از ستون B (س۱، ص۸۴)",
    "level": "پنج‌گزینه‌ای",
    "count": 4,
    "questions": [q(f"g7-l11-{i+1}", i + 1, "vocab", stem, opts, ans) for i, (stem, opts, ans) in enumerate(S1_ITEMS)],
}

# ————— بانک ۱۲ — خ۵/س۲: فرمِ Reza Pakzad — فیلدها از لایه —————
form_fields = [norm(x) for x in ["First name:", "Last name:", "Month of birth:", "Job:"]]
joined84 = "\n".join(p84)
for f_ in form_fields:
    assert f_ in joined84, f"form field {f_!r} missing from layer p84"
assert "Reza Pakzad" in joined84 and "waiter" in joined84 and "Azar" in joined84, "form source text missing from layer"

COL_S2 = ["Reza", "Pakzad", "Azar", "waiter"]
S2_ITEMS = [
    ("First name: -------", ["Reza", "Pakzad", "Azar", "waiter"], 0),
    ("Last name: -------", ["Reza", "Azar", "waiter", "Pakzad"], 3),
    ("Month of birth: -------", ["Pakzad", "Reza", "Azar", "waiter"], 2),
    ("Job: -------", ["Pakzad", "waiter", "Reza", "Azar"], 1),
]
bank12 = {
    "lesson": 12,
    "title": "امتحانی درس پنجم — کامل‌کردن فرم (س۲، ص۸۴)",
    "level": "چهارگزینه‌ای",
    "count": 4,
    "questions": [q(f"g7-l12-{i+1}", i + 1, "vocab", stem, opts, ans) for i, (stem, opts, ans) in enumerate(S2_ITEMS)],
}

# ————— بانک ۱۳ — خ۵/س۴: رنگ‌ها (لنگرِ ص۷۶) — آیتم‌های چاپی از لایه —————
s4_zone = "\n".join(p84[52:62])
for color in ["زرد", "آبی", "سیاه", "قهوه ای"]:
    assert color in s4_zone, f"color {color!r} missing from p84-S4 zone"
assert "رنگ های زیر را به انگلیسی بنویسید" in joined84, "S4 instruction missing"
COL_S3_ = ["yellow", "blue", "black", "brown"]
S4_ITEMS = [
    ("زرد به انگلیسی: -------", ["yellow", "blue", "black", "brown"], 0),
    ("آبی به انگلیسی: -------", ["yellow", "black", "brown", "blue"], 3),
    ("سیاه به انگلیسی: -------", ["blue", "brown", "black", "yellow"], 2),
    ("قهوه ای به انگلیسی: -------", ["blue", "brown", "yellow", "black"], 1),
]
bank13 = {
    "lesson": 13,
    "title": "امتحانی درس پنجم — رنگ‌ها به انگلیسی (س۴، ص۸۴)",
    "level": "چهارگزینه‌ای",
    "count": 4,
    "questions": [q(f"g7-l13-{i+1}", i + 1, "vocab", stem, opts, ans) for i, (stem, opts, ans) in enumerate(S4_ITEMS)],
}

# ————— بانک ۱۴ — خ۵/س۵: پوشاک (لنگرِ ص۷۶/۷۷) — آیتم‌های چاپی از لایه —————
s5_zone = "\n".join(p84[60:68])
for word in ["کفش", "چادر", "کت و شلوار", "روسری"]:
    assert word in s5_zone, f"clothing {word!r} missing from p84-S5 zone"
assert "کلمات زیر را به انگلیسی بنویسید" in joined84, "S5 instruction missing"
COL_S4_ = ["shoes", "chador", "suit", "scarf"]
S5_ITEMS = [
    ("کفش به انگلیسی: -------", ["shoes", "chador", "suit", "scarf"], 0),
    ("چادر به انگلیسی: -------", ["shoes", "suit", "scarf", "chador"], 3),
    ("کت و شلوار به انگلیسی: -------", ["chador", "scarf", "suit", "shoes"], 2),
    ("روسری به انگلیسی: -------", ["chador", "scarf", "shoes", "suit"], 1),
]
bank14 = {
    "lesson": 14,
    "title": "امتحانی درس پنجم — پوشاک به انگلیسی (س۵، ص۸۴)",
    "level": "چهارگزینه‌ای",
    "count": 4,
    "questions": [q(f"g7-l14-{i+1}", i + 1, "vocab", stem, opts, ans) for i, (stem, opts, ans) in enumerate(S5_ITEMS)],
}

# ————— بانک ۱۵ — خ۶/س۱: بانکِ ۸ واژه‌ایِ ص۹۰ — ساقه‌ها از لایه (ضدِ رونویسی) —————
PAIR_RE = re.compile(r"^\s*([a-d])\)\s*(.+?)\s*B\)\s*(.+?)\s*$")
pairs: dict[str, tuple[str, str]] = {}
for line in p90:
    m = PAIR_RE.match(line)
    if m and "…" in line:
        pairs[m.group(1)] = (norm(m.group(2)), norm(m.group(3)))
assert set(pairs) == {"a", "b", "c", "d"}, f"p90-S1 pairs incomplete: {list(pairs)}"

WORD_BANK = ["where", "bedroom", "reading", "she's", "washing", "what", "doing", "watching"]
# بانک فقط در رندر (کادرِ بنفش) است — لایه ندارد؛ شش ساقهٔ کلیددار از لایه می‌آیند
S6_ITEMS = [
    # (ساقه، اندیسِ کلید در WORD_BANK، جایگاهِ هدفِ کلید در گزینه‌ها)
    (pairs["a"][1], 1, 1),  # bedroom
    (pairs["b"][0], 6, 2),  # doing
    (pairs["c"][0], 0, 3),  # where
    (pairs["c"][1], 3, 4),  # she's
    (pairs["d"][0], 5, 5),  # what
    (pairs["d"][1], 7, 7),  # watching
]
assert pairs["a"][1] == "I am in the -------", pairs["a"]
assert pairs["b"][0] == "What are you -------?", pairs["b"]
assert pairs["b"][1] == "I am ------- the bank.", pairs["b"]  # حذفِ آیتمی — نقصِ چاپ
assert pairs["c"][0] == "------- Is he?", pairs["c"]
assert pairs["c"][1] == "------- in the living room.", pairs["c"]
assert pairs["d"][0] == "------- is he doing.", pairs["d"]
assert pairs["d"][1] == "she is ------- TV.", pairs["d"]

def opts15(kw_idx: int, target: int) -> list[str]:
    """چینشِ قطعیِ per-item: واژهٔ کلید (WB[kw_idx]) دقیقاً در جایگاهِ target؛
    هفت واژهٔ دیگر به ترتیبِ بانک در جایگاه‌های باقی‌مانده."""
    rest = [w for i, w in enumerate(WORD_BANK) if i != kw_idx]
    rest.insert(target, WORD_BANK[kw_idx])
    return rest

bank15 = {
    "lesson": 15,
    "title": "امتحانی درس ششم — کامل‌کردن با بانک واژه (س۱، ص۹۰)",
    "level": "هشت‌گزینه‌ای",
    "count": 6,
    "questions": [
        q(f"g7-l15-{i+1}", i + 1, "vocab", stem, opts15(ki, target), target)
        for i, (stem, ki, target) in enumerate(S6_ITEMS)
    ],
}

# ————— رسیدِ خانوادهٔ ۵ —————
receipt5 = {
    "extractedRound": "r372",
    "section": "نمونه سؤالات امتحانی درس پنجم پایه هفتم",
    "examPages": "pdf-p84 (فوترِ خودِ اسکن: ۸۴) — خانوادهٔ یک‌صفحه‌ای با ۵ سکشن؛ ص۸۵ جدولِ واژگان/تمرین (مرزِ پایانی)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست؛ کلیدها استنتاجیِ مستند — لنگرِ واژگانی از جدولِ درس پنجمِ خودِ جزوه (ص۷۶-۷۷)",
    "sectionsTotal": 5,
    "sectionsExtracted": 4,
    "sectionsSkipped": 1,
    "items": 16,
    "bankCounts": [4, 4, 4, 4],
    "columnA": ["1.How are you today?", "2. What is his Job?", "3.Who is that woman?", "4.How old isyour uncle?"],
    "columnB": COL_S1,
    "extraAnswer": "It's in Farvardin. (اضافیِ چاپیِ ستون B — هرگز-کلید؛ گارد)",
    "derivedKeys": {
        "S1": [
            "How are you today? → Great, thanks (تنها پاسخِ احوال‌پرسی)",
            "What is his Job? → He is a worker. (تنها پاسخِ شغلی)",
            "Who is that woman? → She is my teacher, Mrs Amini. (تنها معرفیِ زن)",
            "How old isyour uncle? → He is sixteen years old. (تنها پاسخِ سن)",
        ],
        "S2": [
            "First name → Reza (My name is Reza Pakzad)",
            "Last name → Pakzad (نامِ خانوادگیِ چاپی)",
            "Month of birth → Azar (My birthday is in Azar)",
            "Job → waiter (I am a waiter)",
        ],
        "S4": ["زرد → yellow*", "آبی → blue*", "سیاه → black*", "قهوه ای → brown* — هر چهار کلید در جدولِ ص۷۶ چاپی‌اند"],
        "S5": ["کفش → shoes* (ص۷۷ — جمعِ چاپ)", "چادر → chador* (ص۷۷)", "کت و شلوار → suit* (ص۷۶ «یکدست لباس»؛ همتایِ ص۸۱ «three-piece suit | کت و …»)", "روسری → scarf* (ص۷۷)"],
    },
    "skippedSections": [
        "س۳ «هر کلمه را زیر تصویر مربوط به خود بنویسید. (یک کلمه اضافی است)» — بانکِ چاپی Backpack-Thirteen-Engineer-Thirty-Nurse؛ رندر: ۴ تصویر (معمارِ کلاه‌زرد با نقشه → Engineer / پرستار → Nurse / تابلوی عددِ ۱۳ → Thirteen / کوله‌پشتی → Backpack) و اضافی = Thirty — کلید از تصویر است نه ساقه؛ QuizQuestion فیلدِ تصویر ندارد و پاسخ‌دهنده تصویر را نمی‌بیند (الگویِ r370/r371)",
    ],
    "printQuirks": [
        "ساقهٔ «4.How old isyour uncle?» — غلطِ فاصله‌گذاریِ چاپ (is your → isyour) — verbatim؛ اسکریپت آن را از لایه می‌خواند و اظهار می‌کند",
        "پرانتزِ بلنکِ ساقه‌های س۱ با نقطه‌چینِ چاپ (……..) — در ساقهٔ MCQ به (-------) نرمال شد (الگویِ r371)",
        "«Great, thanks» بدونِ نقطهٔ چاپی — verbatim؛ سه پاسخِ دیگرِ ستون B نقطه‌دار",
        "«قهوه ای» با فاصلهٔ کامل چاپ (نه نیم‌فاصله) — verbatim در ساقه",
        "ساقه‌های س۱/س۲ از خودِ لایهٔ متنی ص۸۴ استخراج شدند (پیمانِ assert در اسکریپت و گارد) نه بازنویسیِ دستی",
        "بانک‌های ۱۳/۱۴ ساقهٔ فارسی دارند — دستورِ چاپیِ سکشن («رنگ های زیر را به انگلیسی بنویسید» / «کلمات زیر را به انگلیسی بنویسید») در رسید حفظ شد؛ خلوصِ لاتینِ گارد به بانک‌های ۱۱/۱۲/۱۵ scope می‌شود",
        "«کت و شلوار → suit»: trousers* در ص۷۶ تنها «شلوار» است پس معادلِ یکدستِ کت‌وشلوار حذف می‌شود؛ suit* = «یکدست لباس،جامه» + ص۸۱ «three-piece suit | کت و …» — استنتاجِ دوشاخه‌ایِ مستند",
    ],
}

# ————— رسیدِ خانوادهٔ ۶ —————
receipt6 = {
    "extractedRound": "r372",
    "section": "نمونه سؤالات امتحانی درس ششم پایه هفتم",
    "examPages": "pdf-p90 (فوترِ خودِ اسکن: ۹۰) — خانوادهٔ یک‌صفحه‌ای با ۳ سکشن؛ ص۹۱ تمرین (مرزِ پایانی)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست؛ کلیدها استنتاجیِ مستند",
    "sectionsTotal": 3,
    "sectionsExtracted": 1,
    "sectionsSkipped": 2,
    "items": 6,
    "bankCounts": [6],
    "wordBank": WORD_BANK,
    "wordBankSource": "کادرِ بنفشِ بالای سکشن — فقط در رندر؛ لایهٔ ص۹۰ این کادر را ندارد (الگویِ r370-بانک۴)",
    "keyPolicy": "کلیدِ گرامری/معناییِ یکتا: I am in the … فقط مکانِ (bedroom)؛ What are you …? فعلِ استمراریِ پرسشی (doing)؛ … Is he? پرسش‌واژهٔ مکان (where — پرسشِ What در d مصرف شده و she's به‌سؤال نمی‌نشیند)؛ … in the living room. ضمیرِ سوم‌شخصِ مونث (she's — بقیهٔ ستون B آن‌جا I am است)؛ … is he doing. پرسش‌واژهٔ What (where در c مصرف شده)؛ she is … TV. فعلِ مشاهده (watching)",
    "engineNote": "هشت‌گزینه‌ایِ دومِ کارتِ هفتم (همتایِ r371-بانک۹)؛ گزینه‌های هر آیتم = کلِ بانکِ ۸ واژه‌ایِ چاپی به چینشِ چرخشیِ per-item (کلیدها [1,2,3,4,5,7])؛ شکلِ گزینه‌ها عینِ کادرِ چاپی (lowercase حتی در جایگاهِ آغازین جمله — چاپ‌وفادار به بانک)",
    "derivedKeys": {
        "S1": [
            "I am in the … → bedroom",
            "What are you …? → doing",
            "… Is he? → where",
            "… in the living room. → she's",
            "… is he doing. → what",
            "she is … TV. → watching",
        ],
    },
    "skippedSections": [
        "س۱ ب-B حذفِ آیتمی: «I am … the bank.» هیچ واژه‌ای از بانک نمی‌پذیرد — washing/reading هر دو بی‌معنا و prepositionِ گم‌شده (at/near) در بانک نیست — نقصِ چاپ (الگویِ r370-ردیف۴/r371-دوکلیدی)؛ شش بلنکِ کلیددار در برابرِ هشت واژه = دو اضافی (reading/washing) و دستورِ چاپی تعدادِ اضافی نگفته",
        "س۲ «با توجه به تصاویر به سوالات زیر پاسخ دهید؟» — سه تصویر (فوتبال‌بازی/خوردنِ صبحانه/تعمیرِ ماشین) با ساقه‌های چاپی (What are they doing? / What is she doing? / what is he doing?) ولی پاسخِ آزادِ توصیفی از تصویر — تصویری-تولیدی",
        "س۳ «با توجه به تصاویر کلمه مناسب را انتخاب کنید» — سه گروهِ چهارگزینه‌ایِ چاپی (clock/television/computer/radio؛ clock/table/comb/computer؛ newspaper/television/mirror/comb) ولی کلید از تصویر است (کامپیوتر→computer / میز→table / روزنامه→newspaper) — تصویری-کلید (الگویِ r371-p74)",
    ],
    "printQuirks": [
        "«------- Is he?» با Is بزرگِ چاپی در میانه — verbatim؛ «------- is he doing.» با نقطهٔ چاپیِ پایانی (سؤالِ بی‌علامت) — verbatim",
        "«she is … TV.» با s کوچکِ چاپی — verbatim؛ بلنکِ چسبیده به TV با قاعدهٔ نرمالِ اسکریپت جدا شد",
        "«she's» با آپاستروفِ چاپی (she’s در کادرِ رندر) — در گزینه‌ها به شکلِ آپاستروفِ مستقیم (') نرمال شد (هم‌خوان با لایهٔ JSON و موتور)",
        "ساقه‌های شش‌گانه از لایهٔ ص۹۰ استخراج و با assert اظهار شدند؛ حروفِ a)/B) پیشوندِ ستون‌اند و در ساقه نمی‌آیند",
    ],
}

# ————— به‌روزرسانیِ نقشهٔ خانواده‌ها —————
d["source"]["g7familyMap"]["families"][4] = {
    "lesson": "درس پنجم", "pdfPage": 84, "round": "r372",
    "status": "استخراج شد — ۴ بانک/۱۶ آیتم از ۵ سکشن (س۳ تصویری مستثنی)",
}
d["source"]["g7familyMap"]["families"][5] = {
    "lesson": "درس ششم", "pdfPage": 90, "round": "r372",
    "status": "استخراج شد — ۱ بانک/۶ آیتم از ۳ سکشن (س۲ تصویری-تولیدی و س۳ تصویری-کلید مستثنی؛ b-B حذفِ آیتمیِ نقصِ چاپ)",
}

d["source"]["g7exam5"] = receipt5
d["source"]["g7exam6"] = receipt6

d["lessons"].extend([bank11, bank12, bank13, bank14, bank15])
d["lessons"].sort(key=lambda b: b["lesson"])

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r372: tests-g7.json extended — {len(d['lessons'])} banks / {total} items")
print("S1 stems from layer:", [s1_stems[k] for k in "1234"])
print("S1(p90) stems:", [pairs["a"][1], pairs["b"][0], pairs["c"][0], pairs["c"][1], pairs["d"][0], pairs["d"][1]])
print("excluded item:", pairs["b"][1])
