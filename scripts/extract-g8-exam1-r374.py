#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r374 — آغازِ کارتِ تستِ پایهٔ هشتم: «نمونه سؤالات امتحانی درس اول» (pdf-p18)
→ ساختِ public/jozve/tests-g8.json با ۳ بانک/۱۰ آیتم (فایلِ تازه — هشتمین کارتِ جزوه)

خانوادهٔ ۱ (درس اول، ص۱۸ — ۵ سکشن) — ۳ بانک/۱۰ آیتم:
  س۲ (۴ MCQ چهارگزینه‌ایِ ناهماهنگ) — «کلمه ناهماهنگ با بقیه را مشخص کنید و در نقطه چین بنویسید»:
      چهار ردیفِ چاپی؛ کلیدها: Spanish (تنها زبان در برابر کشورها) / Europe (تنها قاره در
      برابر کشورها) / china (تنها کشور در برابر قاره‌ها — با c کوچکِ چاپ) / Britain (تنها
      کشورِ محض در برابر زبان/ملیت) — گزینه‌ها به ترتیبِ چاپیِ ردیف (کلیدها [3,2,2,2] طبیعی).
      خط‌تیره‌های مخلوطِ چاپ (« - » و « – ») به « – » قراردادِ کارت یکدست شد (الگویِ g7-l18).
  س۳ (۳ MCQ پنج‌گزینه‌ای با بانکِ چاپی) — «جاهای خالی را با استفاده از کلمات داده شده کامل
      کنید.(دو کلمه اضافی است)»: بانکِ چاپیِ لایه‌ای [Beautiful – alittle – cousin –
      originally – british] (۵ واژه، ۳ بلنک، ۲ اضافی — دومین بانکِ «دواضعیِ» کارت‌ها):
      1. I speak French, English and ------- Persian. → alittle (یک‌واژه‌نوشتِ چاپ verbatim)
      2. I am ------- Australian but I live in England. → originally
      3. Spain is a ------- country. I love it. → Beautiful (B بزرگِ چاپ verbatim)
      اضافی‌ها = cousin/british (هرگز-کلید)؛ ساقه‌ها با شمارهٔ چاپی «1.» verbatim.
  س۵ (۳ MCQ چهارگزینه‌ایِ ساقه‌فارسی) — «در جدول زیر کلمات داده شده را به انگلیسی ترجمه کنید»:
      جدولِ چهارستونیِ چاپی با سطرِ خالیِ پاسخ — ترجمه‌های یکتا:
      قاره → continent (لنگر: continent* جدولِ واژگانِ درس اول — لایهٔ L0601)
      کشوری زیبا → a beautiful country (لنگر: دیالوگِ درس اول «It’s a beautiful country.» — L0675)
      سال → year (کلیدِ ترجمه‌ایِ یکتا — الگویِ r371-جمعه→Friday؛ در جزوه چاپ نیست)
  مستثنیِ آیتمی: س۵-«از دیدن شما خوشحالم» — معادلِ چاپیِ یکتا ندارد (Nice to see you /
      Glad to see you / Pleased to meet you) — دوکلیدیِ ترجمه‌ای.
  مستثنیِ سکشنی: س۱ «با توجه به تصویر به سوال پاسخ کامل دهید» — نقشهٔ خطیِ ایران در رندر
      (برچسبِ دریای خزر) → «I am from Iran.» — تصویری-کلید؛ س۴ «با توجه به تصاویر در مقابل
      جملات درست "ص" و غلط "غ" بگذارید» — چهار آیتمِ تصویری با حکمِ چاپ‌ناپیدار:
      1. She is from England. [تصویر: 和/لباسِ چینی/معبد] → غ
      2. They are French. [برجِ ایفل+نقشهٔ فرانسه] → ص
      3. Are they British? Yes, they are. [نقشهٔ بریتانیا+پرچم+گارد] → ص
      4. Are you from Spain? Yes, I am. [نقشه و پرچمِ ایران با برچسبِ ایران] → غ
هیچ پاسخنامهٔ چاپی در جزوهٔ هشتم نیست — کلیدها استنتاجیِ مستند (رسید g8exam1).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g8.json"
LAYER = ROOT / "booklet-extract/g8.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g8exam1" in d.get("source", {}):
    print("r374: receipt g8exam1 already present — NO-OP")
    raise SystemExit(0)

layer = LAYER.read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(layer):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i


def page_slice(p: int) -> list[str]:
    s = PM[p]
    e = next((v for q, v in sorted(PM.items()) if q > p), len(layer))
    return layer[s:e]


def norm(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"[….]{3,}", "-------", s)
    s = re.sub(r"-------(?=[A-Za-z])", "------- ", s)
    return s


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": answer}


def place(bank: list[str], key: str, target: int) -> tuple[list[str], int]:
    rest = [w for w in bank if w != key]
    assert len(rest) == len(bank) - 1
    return rest[:target] + [key] + rest[target:], target


p18 = page_slice(18)

# ————— پیمانِ لایه: لنگرهای س۵ در درسِ اول (ص۱-۱۷) —————
head = "\n".join(layer[: PM[18]])
assert re.search(r"continent\*", head), "lesson-1 vocab anchor continent* missing"
assert re.search(r"It’s a beautiful country\.", head), "lesson-1 dialogue anchor 'a beautiful country' missing"
assert re.search(r"قاره", head), "Persian anchor قاره missing"

# ————— بانک ۱ — خ۱/س۲: چهار ردیفِ ناهماهنگ از لایهٔ ص۱۸ (ضدِ رونویسی) —————
S2_RE = re.compile(r"^(Indonesia|Australia|Asia|Chinese)\b.*")
s2_rows: list[str] = []
for line in p18:
    if S2_RE.match(line):
        left = re.split(r"\s{2,}", line.strip())[0]
        s2_rows.append(norm(left).replace(" - ", " – "))  # خط‌تیره‌های مخلوطِ چاپ → قراردادِ کارت
assert len(s2_rows) == 4, f"p18-S2 rows incomplete: {s2_rows}"
assert "china" in s2_rows[1] and "china" in s2_rows[2], "lowercase print 'china' must survive"
s2_keys = ["Spanish", "Europe", "china", "Britain"]
Q1 = []
for i, (row, key) in enumerate(zip(s2_rows, s2_keys), 1):
    words = row.split(" – ")
    assert len(words) == 4 and key in words, (row, key)
    Q1.append(q(f"g8-l1-{i}", i, "vocab", row, words, words.index(key)))

# ————— بانک ۲ — خ۱/س۳: بانکِ چاپی + سه ساقهٔ شماره‌دار از لایهٔ ص۱۸ —————
BANK_RE = re.compile(r"\(([^)]*Beautiful[^)]*)\)")
bank_line = next(l for l in p18 if BANK_RE.search(l))
B2 = [w.strip() for w in BANK_RE.search(bank_line).group(1).split("–")]
assert B2 == ["Beautiful", "alittle", "cousin", "originally", "british"], B2
S3_RE = re.compile(r"^([1-3])\.\s*(.+?)\s*$")
s3_stems: dict[str, str] = {}
for line in p18:
    m = S3_RE.match(line.strip())
    if m and "…" in line:
        s3_stems[m.group(1)] = norm(f"{m.group(1)}. {m.group(2)}")
assert set(s3_stems) == {"1", "2", "3"}, f"p18-S3 stems incomplete: {s3_stems}"
assert "alittle" in B2[1] and "alittle" not in B2[0]
Q2 = [
    q("g8-l2-1", 1, "vocab", s3_stems["1"], *place(B2, "alittle", 2)),
    q("g8-l2-2", 2, "vocab", s3_stems["2"], *place(B2, "originally", 4)),
    q("g8-l2-3", 3, "vocab", s3_stems["3"], *place(B2, "Beautiful", 1)),
]
assert "I speak French, English and ------- Persian." in s3_stems["1"], s3_stems["1"]
assert s3_stems["2"].startswith("2. I am ------- Australian"), s3_stems["2"]
assert s3_stems["3"].startswith("3. Spain is a ------- country."), s3_stems["3"]

# ————— بانک ۳ — خ۱/س۵: ترجمه‌های جدول (ساقهٔ فارسیِ چاپ‌وفادار — الگویِ r372-بانک‌های ۱۳/۱۴) —————
Q3 = [
    q("g8-l3-1", 1, "vocab", "قاره به انگلیسی: -------", ["country", "continent", "city", "island"], 1),
    q("g8-l3-2", 2, "vocab", "کشوری زیبا به انگلیسی: -------", ["a beautiful country", "a beautiful city", "a big country", "a small town"], 0),
    q("g8-l3-3", 3, "vocab", "سال به انگلیسی: -------", ["month", "week", "year", "hour"], 2),
]

# ————— ساختِ فایلِ تازه —————
d = {
    "grade": 8,
    "title": "جزوه دکتر حسن لطفی — پایه هشتم",
    "lessons": [
        {"lesson": 1, "title": "امتحانی درس اول — کلمهٔ ناهماهنگ (س۲، ص۱۸)", "level": "چهارگزینه‌ای", "count": 4, "questions": Q1},
        {"lesson": 2, "title": "امتحانی درس اول — تکمیل با بانک واژه (س۳، ص۱۸)", "level": "پنج‌گزینه‌ای", "count": 3, "questions": Q2},
        {"lesson": 3, "title": "امتحانی درس اول — ترجمهٔ جدول (س۵، ص۱۸)", "level": "چهارگزینه‌ای", "count": 3, "questions": Q3},
    ],
    "source": {
        "g8exam1": {
            "extractedRound": "r374",
            "section": "نمونه سؤالات امتحانی درس اول پایه هشتم",
            "examPages": "pdf-p18 (تک‌صفحه‌ای) — ص۱۹ واژگانِ درس دوم است و مرزِ پایینیِ خانواده",
            "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هشتم نیست — کلیدها استنتاجی؛ لنگرهای س۵ از خودِ درسِ اول (continent* جدولِ واژگان؛ It’s a beautiful country دیالوگ)",
            "sectionsTotal": 5,
            "sectionsExtracted": 3,
            "sectionsSkipped": 2,
            "items": 10,
            "bankCounts": [4, 3, 3],
            "wordBank": ["Beautiful", "alittle", "cousin", "originally", "british"],
            "wordBankSource": "پرانتزِ چاپیِ سکشنِ س۳ ص۱۸ (لایه) — ۵ واژه برای ۳ بلنک با «دو کلمه اضافی است» — دومین بانکِ دواضعیِ کارت‌ها (پس از r371-بانک۹ هفت‌گزینه‌ایِ تکاضعی)",
            "keyPolicy": "س۲: کلیدِ دسته‌ای هر ردیف (زبان/قاره/کشور) با ترتیبِ چاپیِ گزینه‌ها؛ س۳: نگاشتِ یکتای بانک-به-بلنک (alittle/originally/Beautiful) با دو اضافیِ هرگز-کلید؛ س۵: ترجمه‌های یکتا — قاره/کشوری زیبا لنگردارِ درسِ اول، سال به الگویِ کلیدِ ترجمه‌ایِ یکتای r371-جمعه→Friday",
            "engineNote": "سکشنِ ترجمه MCQ چهارگزینه‌ای است نه تایپی (قراردادِ r363)؛ ساقه‌های فارسیِ س۵ عینِ سلول‌های جدولِ چاپی‌اند (الگویِ r372-بانک‌های ۱۳/۱۴)؛ شماره‌های «1.» ساقه‌های س۳ verbatim چاپ",
            "derivedKeys": {"S2": ["Spanish", "Europe", "china", "Britain"], "S3": ["alittle", "originally", "Beautiful"], "S5": ["continent", "a beautiful country", "year"]},
            "skippedSections": [
                "ص۱۸-س۱ «با توجه به تصویر به سوال پاسخ کامل دهید» — Where are you from? / I -------؛ تصویرِ نقشهٔ خطیِ ایران (برچسبِ دریای خزر در رندرِ ۳۰۰dpi ص۱۸-top) → «I am from Iran.» — تصویری-کلید (الگویِ r371/r373)",
                "ص۱۸-س۴ «با توجه به تصاویر در مقابل جملات درست ص و غلط غ بگذارید» — چهار آیتمِ تصویری با حکمِ تصویری: 1. She is from England. [تصویرِ 和/لباسِ چینی/معبد] → غ؛ 2. They are French. [برجِ ایفل+نقشهٔ فرانسه] → ص؛ 3. Are they British? Yes, they are. [نقشهٔ بریتانیا+پرچم+گارد سلطنتی] → ص؛ 4. Are you from Spain? Yes, I am. [نقشهٔ ایران+پرچم با برچسبِ ایران] → غ (رندرِ ۳۰۰dpi ص۱۸-bottom) — تصویری-کلید",
            ],
            "printQuirks": [
                "«alittle» یک‌واژه‌نوشتِ چاپ (a little) و «british» با b کوچک و «Beautiful» با B بزرگ — هر سه verbatim در بانک",
                "«china» با c کوچک در ردیف‌های ۲/۳ س۲ — verbatim",
                "خط‌تیره‌های مخلوطِ چاپ در س۲ (ردیفِ ۲ با «-» و بقیه با «–») — به «–» قراردادِ کارت یکدست شد",
                "«از دیدن شما خوشحالم» (سلولِ چهارمِ جدولِ س۵) مستثنیِ آیتمی شد: معادلِ چاپیِ یکتا ندارد (Nice to see you / Glad to see you / Pleased to meet you) — جدول چهار سلولی است و ۳ سلولِ دیگر استخراج شد",
            ],
        },
        "g8familyMap": {
            "extractedRound": "r374",
            "note": "نقشهٔ ۷ خانوادهٔ «نمونه سؤالات امتحانی» جزوهٔ هشتم — از جست‌وجوی لایه (پروبِ r369: همتایان کامل‌اند)؛ سربرگ‌های دوبخطی با جست‌وجوی دوسطری",
            "families": [
                {"lesson": "درس اول", "pdfPage": 18, "round": "r374", "status": "استخراج شد — ۳ بانک/۱۰ آیتم از ۵ سکشن (س۱ و س۴ تصویری مستثنی؛ س۵ آیتمیِ «از دیدن شما خوشحالم» دوکلیدیِ ترجمه‌ای مستثنی)"},
                {"lesson": "درس دوم", "pdfPage": 27, "round": None, "status": "در انتظار راند بعد"},
                {"lesson": "درس سوم", "pdfPage": 35, "round": None, "status": "در انتظار راند بعد"},
                {"lesson": "درس چهارم", "pdfPage": 41, "round": None, "status": "در انتظار راند بعد"},
                {"lesson": "درس پنجم", "pdfPage": 50, "round": None, "status": "در انتظار راند بعد"},
                {"lesson": "درس ششم", "pdfPage": 60, "round": None, "status": "در انتظار راند بعد"},
                {"lesson": "درس هفتم", "pdfPage": 72, "round": None, "status": "در انتظار راند بعد"},
            ],
        },
    },
}

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(l["questions"]) for l in d["lessons"])
print(f"r374: tests-g8.json created — {len(d['lessons'])} banks/{total} items (first g8 round)")
