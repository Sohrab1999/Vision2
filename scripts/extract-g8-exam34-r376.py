#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r376 — جفتِ دو خانوادهٔ کارتِ تستِ پایهٔ هشتم در یک راند:
  «نمونه سؤالات امتحانی درس سوم» (pdf-p35، ۵ سکشن) + «درس چهارم» (pdf-p41، ۵ سکشن)
→ tests-g8.json با ۵ بانکِ تازه/۱۵ آیتم (۳ بانکِ r374 + ۴ بانکِ r375 + ۵ بانکِ این راند = ۱۲ بانک/۳۶ آیتم)

خانوادهٔ ۳ (درس سوم، ص۳۵) — ۳ بانک/۱۲ آیتم:
  س۲ (۴ MCQ پنج‌گزینه‌ای با بانکِ چاپیِ تک‌اضافی) — «با کلمات داده شده جاهای خالی را کامل کنید
      (Cook – do – type – speak – take)» — ۵ واژه/۴ بلنک، اضافیِ چاپی «take» هرگز-کلید:
      1) How do you ------- a hard puzzle? → do (لنگر: Do a puzzle* ص۲۸ «حل کردن جدول» +
         Can he do a puzzle? ص۳۱)
      2) All my classmate can ------- English well. → speak (لنگر: speak ص۲۹ جدولِ تکمیلیِ
         درس سوم [خطِ جدولیِ «speakراندن» — سلول‌های چسبیده] + He speaks French ص۱۰)
      3) What do you need to ------- some food? → Cook (لنگر: cook ص۲۸ «غذا پختن» +
         Is she good at cooking? ص۳۰)
      4) I like to learn how to ------- fast. → type (کلیدِ مشتقِ چاپی: type بیرونِ واژگانِ
         جزوه است اما در خودِ ص۳۵ دو بار چاپ است — بانکِ س۲ و ردیفِ س۳؛ «type fast» تنها
         ترکیبِ معنادارِ بانک با fast؛ الگویِ r371-س۱/س۲ ص۶۵)
  س۳ (۴ ناهماهنگِ چاپی) — «کلمه ناهماهنگ را در هر ردیف مشخص کنید»:
      Swimming – running – buying – riding → buying (تنها غیرِ ورزش/حرکتِ بدنی؛ swim* ص۲۸ +
         ride ص۳۱ — سه کلیدِ دیگر از «افعال مربوط به سرگرمی‌ها» عنوانِ جدولِ ص۲۸)
      Badminton – ping pong – draw – tennis → draw (تنها فعلِ غیرِ ورزشِ راکتی؛ play badminton*
         ص۲۸ + Ali can play tennis well. ص۳۱ + draw* ص۲۸)
      Speak – read – type – chess → chess (تنها اسم؛ بقیه فعلِ مهارت؛ chess ص۲۹ چاپ)
      Playing – doing – speaking – morning → morning (تنها اسمِ زمان؛ morning* ص۱۹ درس دوم +
         Friday mornings ص۲۰/۲۱ — لنگرِ بین‌درسی، الگویِ r375-نکته۲)
  س۴ (۴ MCQ چهارگزینه‌ایِ فرگمنتِ رندر-فقط) — «با توجه به تصاویر امالی کلمات ناقص را کامل کنید»:
      فرگمنت‌ها در لایه نیستند (بینِ تیترِ س۴ و س۵ خالی — الگویِ رندر-فقطِ r375-بانک۴) و از
      زومِ ۳۰۰dpi رونویسی شدند؛ گزینه‌ها اصطلاح/واژهٔ کامل‌اند:
      m-------ke t-------a → make tea (لنگر: Make tea* ص۲۸ «چای درست کردن» + تصویرِ کتریِ س۱)
      dr-------w a pict-------re → draw a picture (لنگر: draw* ص۲۸ + drawing book ص۲۹)
      r-------de a h-------rse → ride a horse (لنگر: horse ص۲۹ + Can you ride a bicycle? ص۳۱)
      t-------p------- → type (قفلِ شکل: تنها type از گزینه‌ها با الگوی t…p… می‌سازد؛ «tape»
         هم شکل می‌سازد اما بیرونِ محدودهٔ واژگانِ جزوه است و عمداً گزینه نشد — مستند در رسید)
خانوادهٔ ۴ (درس چهارم، ص۴۱) — ۲ بانک/۳ آیتم:
  س۳ (۲ ناهماهنگِ چاپی) — «در هر گروه دور کلمه ناهماهنگ خط بکشید»:
      Health – sore eyes – headache – measles → Health (تنها غیرِ بیماری؛ health* ص۳۶ +
         measles*/Sore eyes*/headache* همگی چاپِ جدولِ واژگانِ درس چهارم ص۳۶)
      Sneeze – cough – mumps – nurse → nurse (تنها شغل/انسان؛ sneeze* ص۳۷ + cough* ص۳۶ +
         mumps* ص۳۷ — سه علامت/بیماریِ چاپِ جدول؛ nurse* ص۳۷ چاپ)
  س۵ (۱ MCQ چهارگزینه‌ایِ تلفظیِ ساقه‌فارسی) — «در کدام کلمه حرف ch صدای "ک" می دهد.»:
      school – chair – teacher – toothache → school (ch=/k/ تنها در school؛ لنگر: Go to
         school* ص۱۹ + toothache* ص۳۶ — گزینهٔ تله با ch همان /tʃ/؛ ساقهٔ تمام‌فارسیِ چاپِ
         سه‌خطیِ بریده (RTL quirk) با فاصله‌بندیِ بازساخته — مقایسهٔ گارد بدونِ فاصله/نقطه)
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g8.json"
LAYER = ROOT / "booklet-extract/g8.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g8exam3" in d.get("source", {}):
    print("r376: receipt g8exam3 already present — NO-OP")
    raise SystemExit(0)
assert d and "g8exam2" in d.get("source", {}), "tests-g8.json (r375) must exist first"

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


p35 = page_slice(35)
p41 = page_slice(41)
head35 = "\n".join(layer[: PM[35]])   # لایهٔ پیش از خانوادهٔ سوم (لنگرهای خ۳)
mid = "\n".join(layer[PM[35] : PM[41]])  # ص۳۵-۴۰ (لنگرهای خ۴: جدولِ ص۳۶/۳۷)

# ————— پیمانِ لایه: لنگرهای درس سوم پیش از ص۳۵ —————
for anchor in [r"\btea\b", r"\bmake\b", r"\bpuzzle\b", r"\bspeak\b", r"\bcook\b", r"\bhorse\b",
               r"\bdraw\b", r"\bride\b", r"\bchess\b", r"\bbadminton\b", r"\bswim\b",
               r"\bphoto\b", r"\btake\b", r"morning\*", r"Go to school\*", r"drawing book"]:
    assert re.search(anchor, head35), f"lesson-3 anchor missing before p35: {anchor}"
# ————— پیمانِ لایه: لنگرهای درس چهارم در ص۳۶-۴۰ —————
for anchor in [r"health\*", r"measles\*", r"Sore eyes\*", r"headache\*", r"cough\*",
               r"nurse\*", r"mumps\*", r"sneeze\*", r"fever\*", r"toothache\*"]:
    assert re.search(anchor, mid), f"lesson-4 anchor missing in p35-40: {anchor}"

# ————— پیمانِ لایهٔ ص۳۵: بانکِ چاپیِ س۲، چهار ساقه، چهار ردیفِ ناهماهنگِ س۳، خالی‌بودنِ ناحیهٔ س۴ —————
BANK_RE = re.compile(r"\((Cook[^)]*)\)")
bank_line = next(l for l in p35 if BANK_RE.search(l))
B5 = [w.strip() for w in BANK_RE.search(bank_line).group(1).split("–")]
assert B5 == ["Cook", "do", "type", "speak", "take"], B5

S2_RE = re.compile(r"^([1-4])\)\s*(.+?)\s*$")
s2_stems: dict[str, str] = {}
for line in p35:
    m = S2_RE.match(line.strip())
    if m and ("…" in line or "..." in line) and not re.search(r"\([^)]*\)\s*$", line):
        s2_stems[m.group(1)] = norm(f"{m.group(1)}) {m.group(2)}")
assert set(s2_stems) == {"1", "2", "3", "4"}, f"p35-S2 stems incomplete: {sorted(s2_stems)}"
assert s2_stems["1"] == "1) How do you ------- a hard puzzle?", s2_stems["1"]
assert s2_stems["2"] == "2) All my classmate can ------- English well.", s2_stems["2"]
assert s2_stems["3"] == "3) What do you need to ------- some food?", s2_stems["3"]
assert s2_stems["4"] == "4) I like to learn how to ------- fast.", s2_stems["4"]

ROW_RE = re.compile(r"^(Swimming|Badminton|Speak|Playing)\b")
s3_rows: list[str] = []
for line in p35:
    if ROW_RE.match(line.strip()) and "…" in line:
        s3_rows.append(norm(re.split(r"\s{2,}", line.strip())[0]))
assert s3_rows == [
    "Swimming – running – buying – riding",
    "Badminton – ping pong – draw – tennis",
    "Speak – read – type – chess",
    "Playing – doing – speaking – morning",
], s3_rows

# ناحیهٔ س۴ ص۳۵: بینِ تیترِ س۴ و تیترِ س۵ لایه خالی است (اثباتِ رندر-فقطِ فرگمنت‌ها)
i4 = next(i for i, l in enumerate(p35) if "امالی کلمات ناقص" in l)
i5 = next(i for i, l in enumerate(p35) if "پاسخ کامل" in l)
gap = [l for l in p35[i4 + 1 : i5]]
# «5» تنها شمارهٔ سکشنِ س۵ است (خطِ جدا) — بقیه باید خالی باشند
assert all(not l.strip() or l.strip() == "5" for l in gap), f"p35 S4->S5 gap must be empty: {gap!r}"

# ————— پیمانِ لایهٔ ص۴۱: دو ردیفِ ناهماهنگِ س۳ + ساقهٔ سه‌خطیِ س۵ + ستونِ گزینه‌ها —————
ROW41_RE = re.compile(r"^(Health|Sneeze)\b")
s41_rows: list[str] = []
for line in p41:
    if ROW41_RE.match(line.strip()) and "…" in line:
        s41_rows.append(norm(re.split(r"\s{2,}", line.strip())[0]))
assert s41_rows == [
    "Health – sore eyes – headache – measles",
    "Sneeze – cough – mumps – nurse.",
], s41_rows

OPT41 = [l.strip() for l in p41 if re.match(r"^school\b", l.strip())]
assert OPT41 == ["school – chair – teacher - toothache"], OPT41
pron_opts = [w.strip() for w in re.split(r"\s[-–]\s", OPT41[0])]
assert pron_opts == ["school", "chair", "teacher", "toothache"], pron_opts

# ساقهٔ سه‌خطیِ س۵ ص۴۱ (RTL quirk — خطوطِ بریده با خالی‌های جداشده): بازسازیِ سرراست برای گارد
i5l = next(i for i, l in enumerate(p41) if l.strip() == "5)")
pron_layer = [l.strip() for l in p41[i5l + 1 : i5l + 9] if l.strip()][:3]
assert pron_layer == ["در کدام کلمه حرفch", 'صدای" ک"', ".می دهد"], pron_layer

# ————— بانک ۸ — خ۳/س۲: بانکِ چاپیِ تک‌اضافی — کلیدها do/speak/Cook/type در [1,3,0,2] —————
Q8 = [
    q("g8-l8-1", 1, "vocab", s2_stems["1"], *place(B5, "do", 1)),
    q("g8-l8-2", 2, "vocab", s2_stems["2"], *place(B5, "speak", 3)),
    q("g8-l8-3", 3, "vocab", s2_stems["3"], *place(B5, "Cook", 0)),
    q("g8-l8-4", 4, "vocab", s2_stems["4"], *place(B5, "type", 2)),
]
assert [it["options"][it["answer"]] for it in Q8] == ["do", "speak", "Cook", "type"]

# ————— بانک ۹ — خ۳/س۳: چهار ناهماهنگِ چاپی — کلیدها buying/draw/chess/morning —————
Q9 = [
    q("g8-l9-1", 1, "vocab", s3_rows[0], s3_rows[0].split(" – "), s3_rows[0].split(" – ").index("buying")),
    q("g8-l9-2", 2, "vocab", s3_rows[1], s3_rows[1].split(" – "), s3_rows[1].split(" – ").index("draw")),
    q("g8-l9-3", 3, "vocab", s3_rows[2], s3_rows[2].split(" – "), s3_rows[2].split(" – ").index("chess")),
    q("g8-l9-4", 4, "vocab", s3_rows[3], s3_rows[3].split(" – "), s3_rows[3].split(" – ").index("morning")),
]
assert [it["options"][it["answer"]] for it in Q9] == ["buying", "draw", "chess", "morning"]

# ————— بانک ۱۰ — خ۳/س۴: چهار فرگمنتِ رندر-فقط (رونویسی از زومِ ۳۰۰dpi ص۳۵) —————
FRAG_TEA = "m-------ke t-------a"       # چاپ: «m - ke t - a»
FRAG_PIC = "dr-------w a pict-------re" # چاپ: «dr - w a pict - re»
FRAG_HORSE = "r-------de a h-------rse" # چاپ: «r - de a h - rse»
FRAG_TYPE = "t-------p-------"          # چاپ: «t - p -»
assert all(f not in head35 and f not in "\n".join(p35) for f in (FRAG_TEA, FRAG_PIC, FRAG_HORSE, FRAG_TYPE)), \
    "fragments must be render-only"
Q10 = [
    q("g8-l10-1", 1, "vocab", FRAG_TEA, ["take photos", "make tea", "make a cake", "tell stories"], 1),
    q("g8-l10-2", 2, "vocab", FRAG_PIC, ["do a puzzle", "make tea", "ride a horse", "draw a picture"], 3),
    q("g8-l10-3", 3, "vocab", FRAG_HORSE, ["do a puzzle", "make tea", "ride a horse", "tell stories"], 2),
    q("g8-l10-4", 4, "vocab", FRAG_TYPE, ["type", "make", "take", "tell"], 0),
]
assert [it["options"][it["answer"]] for it in Q10] == ["make tea", "draw a picture", "ride a horse", "type"]
# قفلِ شکل: دقیقاً یک گزینه با الگویِ فرگمنت می‌سازد
SHAPES = {
    FRAG_TEA: re.compile(r"^m[a-z]+ke t[a-z]+a$"),
    FRAG_PIC: re.compile(r"^dr[a-z]+w a pict[a-z]+re$"),
    FRAG_HORSE: re.compile(r"^r[a-z]+de a h[a-z]+rse$"),
    FRAG_TYPE: re.compile(r"^t[a-z]+p[a-z]+$"),
}
for it in Q10:
    fits = [o for o in it["options"] if SHAPES[it["question"]].match(o)]
    assert fits == [it["options"][it["answer"]]], (it["id"], fits)

# ————— بانک ۱۱ — خ۴/س۳: دو ناهماهنگِ چاپی — کلیدها Health/nurse — نقطهٔ چاپِ «nurse.» حذف (قراردادِ کارت) —————
r41 = [row.rstrip(".") for row in s41_rows]
assert r41[1] == "Sneeze – cough – mumps – nurse", r41[1]
Q11 = [
    q("g8-l11-1", 1, "vocab", r41[0], r41[0].split(" – "), r41[0].split(" – ").index("Health")),
    q("g8-l11-2", 2, "vocab", r41[1], r41[1].split(" – "), r41[1].split(" – ").index("nurse")),
]
assert [it["options"][it["answer"]] for it in Q11] == ["Health", "nurse"]

# ————— بانک ۱۲ — خ۴/س۵: تلفظِ ch — ساقهٔ تمام‌فارسیِ چاپِ بازساخته — کلید school —————
PRON_STEM = 'در کدام کلمه حرف ch صدای "ک" می دهد.'
Q12 = [q("g8-l12-1", 1, "pron", PRON_STEM, pron_opts, 0)]
assert Q12[0]["options"][Q12[0]["answer"]] == "school"
# مقایسهٔ بدونِ فاصله/نقطه با لایه (کوئیرکِ RTL — الگویِ r373 «re-join»)
stripped = lambda s: re.sub(r"[\s.]", "", s)
assert stripped(PRON_STEM) == stripped(" ".join(pron_layer)), (PRON_STEM, pron_layer)

# ————— الحاقِ ۵ بانک به فایلِ موجود —————
d["lessons"] += [
    {"lesson": 8, "title": "امتحانی درس سوم — تکمیل با بانک واژه (س۲، ص۳۵)", "level": "پنج‌گزینه‌ای", "count": len(Q8), "questions": Q8},
    {"lesson": 9, "title": "امتحانی درس سوم — کلمهٔ ناهماهنگ (س۳، ص۳۵)", "level": "چهارگزینه‌ای", "count": len(Q9), "questions": Q9},
    {"lesson": 10, "title": "امتحانی درس سوم — کامل‌کردن حروف (س۴، ص۳۵)", "level": "چهارگزینه‌ای", "count": len(Q10), "questions": Q10},
    {"lesson": 11, "title": "امتحانی درس چهارم — کلمهٔ ناهماهنگ (س۳، ص۴۱)", "level": "چهارگزینه‌ای", "count": len(Q11), "questions": Q11},
    {"lesson": 12, "title": "امتحانی درس چهارم — تلفظ ch (س۵، ص۴۱)", "level": "چهارگزینه‌ای", "count": len(Q12), "questions": Q12},
]

d["source"]["g8exam3"] = {
    "extractedRound": "r376",
    "section": "نمونه سؤالات امتحانی درس سوم + درس چهارم پایه هشتم (جفتِ دو خانواده)",
    "examPages": "pdf-p35 (درس سوم، تک‌صفحه‌ای) + pdf-p41 (درس چهارم، تک‌صفحه‌ای) — ص۳۶/۳۷ واژگانِ درس چهارم و ص۴۲ واژگانِ درس پنجم = مرزها",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هشتم نیست — کلیدها استنتاجی؛ لنگرهای خ۳ از جدولِ واژگانِ ص۲۸/۲۹ و تمرین‌های ص۲۹-۳۴؛ لنگرهای خ۴ از جدولِ واژگانِ ص۳۶/۳۷؛ کلیدِ type (بانک ۸ آیتم ۴) مشتقِ چاپی است (بیرونِ واژگان، دو بار چاپ در خودِ ص۳۵)",
    "sectionsTotal": 10,
    "sectionsExtracted": 5,
    "sectionsSkipped": 5,
    "items": 15,
    "bankCounts": [4, 4, 4, 2, 1],
    "wordBank": ["Cook", "do", "type", "speak", "take"],
    "wordBankSource": "پرانتزِ چاپیِ سکشنِ س۲ ص۳۵ (لایه) — ۵ واژه برای ۴ بلنک با تک‌اضافیِ چاپیِ «take» (الگویِ r374-بانک۲ دواضعی، این‌جا تک‌اضافی)؛ take با photo* ص۲۸ جفتِ چاپ دارد و هیچ بلنکی آن را نمی‌خواهد — هرگز-کلیدِ قفل‌شده",
    "keyPolicy": "س۲: سه کلید لنگرِ جدولیِ درس‌درون (Do a puzzle* ص۲۸، speak ص۲۹، cook ص۲۸) + type مشتقِ چاپی؛ س۳: کلیدِ دسته‌ای (تنها غیرِ ورزشِ حرکتی/تنها فعلِ غیرِ راکتی/تنها اسم/تنها زمان) با لنگرهای swim*/play badminton*/chess/morning*؛ س۴: قفلِ شکلِ فرگمنت + لنگرهای Make tea*/draw*/horse؛ خ۴-س۳: تنها غیرِ بیماری (Health) و تنها شغل (nurse) با جدولِ چاپیِ ص۳۶/۳۷؛ خ۴-س۵: ch=/k/ تنها در school (دانشِ تلفظیِ قطعی + Go to school* ص۱۹)",
    "engineNote": "بانک ۱۰ فرگمنت‌های رندر-فقط دارد (لایه بینِ تیترِ س۴ و س۵ خالی — پنجمین نمونهٔ رندر-فقط) با گزینه‌های اصطلاحِ کامل (الگویِ r375-بانک۴)؛ «tape» با شکلِ t-------p------- می‌سازد اما بیرونِ محدودهٔ واژگانِ جزوه است و عمداً گزینه نشد؛ بانک ۱۲ ساقهٔ تمام‌فارسیِ چاپ دارد (سومین ساقه‌فارسیِ کارت — الگویِ r374-بانک۳/r375-بانک۶) و استثنای خلوصِ لاتین است؛ شماره‌گذاریِ «1)» چاپیِ س۲ verbatim ماند",
    "derivedKeys": {
        "S2": ["do", "speak", "Cook", "type"],
        "S3-l3": ["buying", "draw", "chess", "morning"],
        "S4": ["make tea", "draw a picture", "ride a horse", "type"],
        "S3-l4": ["Health", "nurse"],
        "S5-l4": ["school"],
    },
    "skippedSections": [
        "ص۳۵-س۱ «اصطلاح مربوط به هر تصویر را زیر آن بنویسید» — چهار تصویرِ اصطلاحی: تنیس‌باز→play tennis (Ali can play tennis well. ص۳۱)، وب→search the Web (Are you good at searching the Web? ص۳۰)، کتری→make tea (Make tea* ص۲۸)، کتاب‌خوان→read a book (بیرونِ لایه) — تولیدِ اصطلاح از تصویر؛ بدونِ تصویر سؤال بی‌معناست → تصویری-کلید (الگویِ r374-س۱)",
        "ص۳۵-س۵ «با توجه به تصاویر به سوالات پاسخ کامل دهید» — دو سؤالِ تصویری: «Are you good at swimming?» [دو شناگر] → Yes, I am و «Can he ride a bicycle?» [دوچرخه‌سوارِ ساقط] → No, he can't — جهتِ Yes/No فقط از تصویر (لنگرِ پاسخ‌کوتاهِ چاپی: Yes, I am./No, I'm not. ص۳۰ و Yes, he can./No, he can't. ص۳۱) → تصویری-کلید (الگویِ r374-س۴)",
        "ص۴۱-س۱ «با توجه به تصاویر داده شده به سواالت پاسخ کامل دهید» — تصاویرِ محض، ستونِ سؤال هم در لایه نیست → تصویری-کلید",
        "ص۴۱-س۲ «اصطلاح مربوط به هر تصویر را زیر آن بنویسید» — تولیدِ اصطلاح از تصویر → تصویری-کلید",
        "ص۴۱-س۴ «برای هر تصویر یک کلمه انتخاب کنید» (sore eyes – fever – cough – running nose – mumps) — نگاشتِ واژه→تصویر بدونِ تصویر ناممکن؛ fever* ص۳۶ و Running nose* ص۳۶ چاپ‌اند اما جفت‌سازیِ تصویری → تصویری-کلید",
    ],
    "printQuirks": [
        "«All my classmate» در ساقهٔ ۲ س۲ — جمعِ بدونِ s در چاپ — verbatim",
        "«Cook» با C بزرگ در بانکِ چاپی س۲ (و کلیدِ آیتمِ ۳) — verbatim برخلافِ do/type/speak/take",
        "نقطهٔ پایانیِ چاپیِ ردیفِ ۲ س۳ ص۴۱ («nurse.») در کارت حذف شد — قراردادِ ردیف‌های ناهماهنگِ کارت (هر ۸ ردیفِ قبلی بدونِ نقطه؛ الگویِ r374/r375)",
        "خط‌تیرهٔ مخلوطِ چاپ در ستونِ س۵ ص۴۱ («school – chair – teacher - toothache»، سومین «-» ساده) — گزینه‌سازی مستقل از خط‌تیره؛ ردیف‌ها با «–» قراردادِ کارت",
        "ساقهٔ س۵ ص۴۱ در لایه سه‌خطیِ بریده است («در کدام کلمه حرفch» / «صدای\" ک\"» / «.می دهد» — جابجاییِ RTL)؛ ساقهٔ کارت با فاصله‌بندیِ بازساخته و مقایسهٔ گارد بدونِ فاصله/نقطه (الگویِ r373 re-join)",
        "«امالی» در تیترِ س۴ ص۳۵ (بدونِ «ء») — verbatim در لایه، در رسید و گارد بازتولید می‌شود",
        "نقطه‌های چسبیدهٔ «……………a hard puzzle»/«……………………English» پس از بلنک در لایه — norm فاصله را بازگرداند (قراردادِ r373)",
        "فرگمنت‌های چاپیِ س۴ ص۳۵ با خط‌تیره‌های جداکنندهٔ دور («m - ke») چاپ شده‌اند — در کارت به قراردادِ بلنکِ درون‌واژهٔ «m-------ke» نرمال شدند (الگویِ r375 «go sh-------ing»)",
    ],
}
d["source"]["g8familyMap"]["lastUpdatedRound"] = "r376"
fam3 = d["source"]["g8familyMap"]["families"][2]
fam3["round"] = "r376"
fam3["status"] = "استخراج شد — ۳ بانک/۱۲ آیتم از ۵ سکشن (س۱ و س۵ تصویری مستثنی)"
fam4 = d["source"]["g8familyMap"]["families"][3]
fam4["round"] = "r376"
fam4["status"] = "استخراج شد — ۲ بانک/۳ آیتم از ۵ سکشن (س۱/س۲/س۴ تصویری مستثنی)"

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(l["questions"]) for l in d["lessons"])
print(f"r376: tests-g8.json extended — {len(d['lessons'])} banks/{total} items (g8 lesson-3+4 families done)")
