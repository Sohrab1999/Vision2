#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r378 — پایانِ کارتِ تستِ پایهٔ هشتم: خانوادهٔ پایانیِ «نمونه سؤالات امتحانی درس هفتم» (pdf-p72)
→ tests-g8.json با ۱ بانکِ تازه/۶ آیتم (۱۵ بانکِ قبلی + این = ۱۶ بانک/۵۲ آیتم)

خانوادهٔ ۷ (درس هفتم، ص۷۲) — ۱ بانک/۶ آیتم:
  س۲ دوم (جدولِ ترجمهٔ دوطرفه، ۶ خانه) — «کلمات زیر را به انگلیسی و فارسی ترجمه کنید»:
      رندرِ جدول (چپ→راست): shopping | searching | reading | شعر | مجله | باشگاه + ردیفِ پاسخِ خالی
      سه خانهٔ انگلیسی → فارسی و سه خانهٔ فارسی → انگلیسی؛ گزینه‌ها از خودِ شش‌تاییِ جدول
      (هم‌جدولی — الگویِ r374-بانک۳ «ترجمهٔ جدول»):
        باشگاه → gym      (لنگر: دیالوگِ ص۶۲ «But I usually go to the gym in my free time.»)
        مجله → magazine*  (ص۶۱)
        شعر → poem*       (ص۶۱)
        reading → خواندن  (read* ص۶۱ «خواندن» + دیالوگِ ص۶۲ «I love reading. / من عاشق خواندن هستم»)
        searching → جستجو (search* ص۶۱ «جستجو کردن» + ص۶۳ «I enjoy searching the Web. / من از جستجو در وب لذت می برم»)
        shopping → خرید   (go shopping* ص۶۱ «رفتن برای خرید» + ص۶۳ «I usually go shopping. / من معمولا به خرید می روم»)
مستثنی‌ها (۲ سکشنِ تصویری — داوریِ رندر برای پشتیبانیِ تصویریِ آینده در رسید ثبت شد):
  ص۷۲-س۱ (۶ تصویرِ سرگرمی به ترتیبِ چپ→راستِ رندر: تماشای تلویزیون=watch movies(6)،
    پسری در حال خواندن=reading(1)، قدم‌زدن در پارک=walk in the park(4)، اسب‌سواری=horse riding(5)،
    چرخِ خرید=shopping(3)، بازیِ کامپیوتری=playing computer game(2))
  ص۷۲-س۲ (۴ تصویرِ جمله‌های ناقص: اسکی‌سوار=skiing، پسری در حال راه‌رفتن=walking،
    جلدِ مجلهٔ فارسی=magazine، بازی‌کنندهٔ کامپیوتر=computer games)
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g8.json"
LAYER = ROOT / "booklet-extract/g8.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g8exam7" in d.get("source", {}):
    print("r378: receipt g8exam7 already present — NO-OP")
    raise SystemExit(0)
assert d and "g8exam56" in d.get("source", {}), "tests-g8.json (r377) must exist first"

layer = LAYER.read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(layer):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i


def page_slice(p: int) -> list[str]:
    s = PM[p]
    e = next((v for q, v in sorted(PM.items()) if q > p), len(layer))
    return layer[s:e]


def cells(line: str) -> list[str]:
    return [c.strip() for c in re.split(r"\s{2,}", line.strip()) if c.strip()]


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": answer}


p72 = page_slice(72)
p61 = page_slice(61)
p62 = page_slice(62)
p63 = page_slice(63)
a61 = "\n".join(p61)          # لنگرهای ستاره‌دارِ درس هفتم
a6263 = "\n".join(p62 + p63)  # دیالوگ‌های gym/reading/searching/shopping

# ————— پیمانِ لایه: تیترِ دوبخطیِ خانوادهٔ هفتم —————
i_title = next(i for i, l in enumerate(p72) if "نمونه سواالت امتحانی درس" in l)
title_lines = [l.strip() for l in p72[i_title:i_title + 4] if l.strip()][:2]
assert title_lines == ["نمونه سواالت امتحانی درس", "هفتم"], title_lines

# ————— پیمانِ لایه: شش جملهٔ سرگرمیِ س۱ (تصویری — مستثنی) —————
S1_SENT = [
    "1) I like reading.", "2) I like playing computer game.",
    "3) I go shopping", "4) I walk in the park",
    "5) I go horse riding", "6) I watch movies as a hobby.",
]
s1_flat: list[str] = []
for l in p72:
    if re.match(r"^[15]\)", l.strip()) or re.match(r"^[34]\) I", l.strip()):
        s1_flat.extend(cells(l))
assert s1_flat == S1_SENT, s1_flat
# نقطهٔ پایانیِ چاپی فقط روی ۱/۲/۶ است (۳/۴/۵ بی‌نقطه — کوئیرکِ چاپی)
assert s1_flat[2].endswith("shopping") and s1_flat[3].endswith("park") and s1_flat[4].endswith("riding")

# ————— پیمانِ لایه: سرخطِ س۲ با «جمالت»ِ لایه (شکستنِ لام‌الف — رندر درست است) —————
assert any("با توجه به تصاویر داده شده جمالت ناقص زیر را کامل کنید" in l for l in p72)

# ————— پیمانِ لایه: چهار ساقهٔ ناقصِ س۲ (تصویری — مستثنی) —————
S2_STEM = [
    "I like ………………… in winter.", "He enjoys ………………………",
    "I usually buy a ……………………………", "my hobby is playing …………………………",
]
s2_flat: list[str] = []
for l in p72:
    if l.strip().startswith("I like …") or l.strip().startswith("I usually buy a …"):
        s2_flat.extend(cells(l))
assert s2_flat == S2_STEM, s2_flat

# ————— پیمانِ لایه: شمارهٔ تکراریِ «۲» چاپ + سرخطِ جدولِ ترجمه —————
assert any(l.strip() == "2)" for l in p72), "stray printed '2)' (S3 number) missing"
assert any("کلمات زیر را به انگلیسی و فارسی ترجمه کنید" in l for l in p72)

# ————— پیمانِ لایه: شش خانهٔ جدولِ ترجمه (لایه: باشگاه/«مجله شعر» ادغامی/reading/searching/shopping) —————
i_gym = next(i for i, l in enumerate(p72) if l.strip() == "باشگاه")
tail72 = [l.strip() for l in p72[i_gym:] if l.strip()]
assert tail72[:5] == ["باشگاه", "مجله شعر", "reading", "searching", "shopping"], tail72[:5]

# ————— پیمانِ لنگرها: جدولِ ستاره‌دارِ ص۶۱ + دیالوگ‌های ص۶۲/۶۳ —————
# کوئیرکِ لایه: ستارهٔ «search» در خطِ جداگانه چاپ شده (فارسیِ «جستجو کردن» دوبخطی → ستاره سرریز شده)
for anchor in [r"magazine\*", r"poem\*", r"read\*", r"go shopping\*"]:
    assert re.search(anchor, a61), f"lesson-7 anchor missing on p61: {anchor}"
assert re.search(r"\*\s*\nsearch", a61), "search* (star-on-own-line quirk) missing on p61"
assert "go to the gym in my free" in a6263, "gym dialogue missing (p62)"
assert "I love reading." in a6263 and "I enjoy searching the Web." in a6263 and "I usually go shopping." in a6263

# ————— بانک ۱۶ — خ۷/جدولِ ترجمهٔ س۲ دوم: ۶ خانه با گزینه‌های هم‌جدولی —————
# استخرِ انگلیسی: شش همتای جدول؛ استخرِ فارسی: شش همتای جدول.
EN_POOL = ["gym", "magazine", "poem", "shopping", "searching", "reading"]
FA_POOL = ["باشگاه", "مجله", "شعر", "خواندن", "جستجو", "خرید"]


def en_opts(key: str, distractors: list[str], pos: int) -> tuple[list[str], int]:
    rest = [w for w in distractors if w != key]
    return rest[:pos] + [key] + rest[pos:], pos


Q16 = [
    # — خانه‌های فارسی → انگلیسی — ساقه به الگویِ r374-بانک۳ —
    q("g8-l16-1", 1, "vocab", "باشگاه به انگلیسی: -------",
      *en_opts("gym", ["shopping", "gym", "magazine", "searching"], 1)),
    q("g8-l16-2", 2, "vocab", "مجله به انگلیسی: -------",
      *en_opts("magazine", ["magazine", "reading", "gym", "poem"], 0)),
    q("g8-l16-3", 3, "vocab", "شعر به انگلیسی: -------",
      *en_opts("poem", ["searching", "gym", "poem", "magazine"], 2)),
    # — خانه‌های انگلیسی → فارسی (به ترتیبِ چاپِ لایه: reading/searching/shopping) —
    q("g8-l16-4", 4, "vocab", "reading به فارسی: -------",
      *en_opts("خواندن", ["خرید", "شعر", "جستجو", "خواندن"], 3)),
    q("g8-l16-5", 5, "vocab", "searching به فارسی: -------",
      *en_opts("جستجو", ["جستجو", "مجله", "خواندن", "شعر"], 0)),
    q("g8-l16-6", 6, "vocab", "shopping به فارسی: -------",
      *en_opts("خرید", ["باشگاه", "خواندن", "خرید", "شعر"], 2)),
]
assert [it["options"][it["answer"]] for it in Q16] == ["gym", "magazine", "poem", "خواندن", "جستجو", "خرید"]
assert [it["answer"] for it in Q16] == [1, 0, 2, 3, 0, 2]
# هر گزینه از استخرِ هم‌جهتِ خودش می‌آید (q1-3 انگلیسی، q4-6 فارسی)
for it in Q16[:3]:
    assert all(o in EN_POOL for o in it["options"]), it["id"]
for it in Q16[3:]:
    assert all(o in FA_POOL for o in it["options"]), it["id"]
# پوششِ شش‌تاییِ جدول: هر خانه یا ساقه است یا کلید (gym/magazine/poem کلید؛ reading/searching/shopping ساقه)
assert {it["options"][it["answer"]] for it in Q16[:3]} == {"gym", "magazine", "poem"}
assert {re.sub(r" به فارسی: -------", "", it["question"]) for it in Q16[3:]} == {"reading", "searching", "shopping"}

# ————— درج در سند —————
B16 = {"lesson": 16, "title": "امتحانی درس هفتم — ترجمهٔ جدول (س۲ دوم، ص۷۲)", "level": "چهارگزینه‌ای",
       "count": len(Q16), "questions": Q16}
assert B16["count"] == len(B16["questions"])
d["lessons"].append(B16)

d["source"]["g8exam7"] = {
    "extractedRound": "r378",
    "section": "نمونه سؤالات امتحانی درس هفتم پایه هشتم (pdf-p72) — آخرین خانوادهٔ کارتِ هشتم",
    "examPages": "pdf-p72 (تک‌صفحه‌ای) — ص۶۱ لغاتِ جدیدِ درس هفتم (لنگرهای ستاره‌دار) و ص۶۲ دیالوگِ gym؛ ص۷۳ «نمونه سؤالات امتحانی ترم اول و دوم» = مرزِ پایینیِ خانواده (مستثنی — خارجِ تعریفِ خانواده‌های درس‌به‌درس)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هشتم نیست — کلیدها استنتاجی؛ لنگرهای درس‌درون: magazine*/poem*/read*/search*/go shopping* ص۶۱ + دیالوگِ «But I usually go to the gym in my free time.» ص۶۲ (gym) و «I love reading.» ص۶۲ و «I enjoy searching the Web.»/«I usually go shopping.» ص۶۳",
    "sectionsTotal": 3,
    "sectionsExtracted": 1,
    "sectionsSkipped": 2,
    "items": 6,
    "bankCounts": [6],
    "tableCellsRenderOrder": ["shopping", "searching", "reading", "شعر", "مجله", "باشگاه"],
    "tableCellsSource": "جدولِ تک‌ردیفیِ س۲ دومِ ص۷۲ با ردیفِ پاسخِ خالی — ترتیبِ چپ→راستِ رندر (لایه RTL: «باشگاه»، «مجله شعر» ادغامی، reading، searching، shopping)",
    "keyPolicy": "جدولِ ترجمهٔ دوطرفه با گزینه‌های هم‌جدولی (الگویِ r374-بانک۳): گزینه‌های هر سؤال از شش‌تاییِ خودِ جدول؛ ساقه‌های فارسی‌به‌انگلیسی به الگویِ «X به انگلیسی: -------» و انگلیسی‌به‌فارسی «X به فارسی: -------»؛ gym در جدولِ واژگانِ ص۶۱ نیست و از دیالوگِ چاپیِ ص۶۲ لنگر می‌گیرد",
    "engineNote": "همهٔ آیتم‌ها MCQ چهارگزینه‌ای (قراردادِ r363)؛ بانکِ ۱۶ دوروییِ کامل دارد: ساقه‌های q1-3 فارسی با گزینه‌های انگلیسی و ساقه‌های q4-6 انگلیسی با گزینه‌های فارسی — استثنایِ پنجمِ خلوصِ لاتینِ کارت (الگویِ بانکِ ۱۴)؛ خانه‌های خواندن/جستجو/خرید از فرمِ ستاره‌دارِ ص۶۱ (read*/search*/go shopping*) و فرمِ gerundِ جدولِ چاپ (reading/searching/shopping) در ساقه verbatim ماند",
    "derivedKeys": {
        "S2-l7": ["gym", "magazine", "poem", "خواندن", "جستجو", "خرید"],
    },
    "skippedSections": [
        "ص۷۲-س۱ (تصویری): «شماره هر جمله را زیر تصویر مربوط به آن بنویسید» با ۶ جملهٔ سرگرمیِ چاپی — داوریِ رندر (چپ→راست): تماشای تلویزیون=I watch movies as a hobby(6)، پسری در حال خواندن کتاب=I like reading(1)، قدم‌زدن در پارک=I walk in the park(4)، اسب‌سواری=I go horse riding(5)، چرخِ خرید پر=I go shopping(3)، بازیِ کامپیوتری=I like playing computer game(2)",
        "ص۷۲-س۲ (تصویری): «با توجه به تصاویر داده شده جملات ناقص زیر را کامل کنید» با ۴ جمله — داوریِ رندر: اسکی‌سوار=I like skiing in winter، پسری در حال راه‌رفتن=He enjoys walking، جلدِ مجلهٔ فارسی=I usually buy a magazine، بازی‌کنندهٔ کامپیوتر=my hobby is playing computer games",
    ],
    "printQuirks": [
        "«جمالت» در لایهٔ سرخطِ س۲ (شکستنِ لام‌الفِ «جملات» — رندرِ چاپ درست است؛ verbatim لایه حفظ شد)",
        "شماره‌گذاریِ تکراریِ چاپ: سکشنِ سومِ صفحه (جدولِ ترجمه) هم «۲)» چاپ شده درحالی‌که سکشنِ دومِ تصویری هم «۲» است — چاپ «۳» چاپ نکرده؛ در عنوانِ بانک با «س۲ دوم» مستند شد",
        "جمله‌های ۳/۴/۵ س۱ بدونِ نقطهٔ پایانی چاپ شده‌اند («3) I go shopping»، «4) I walk in the park»، «5) I go horse riding») — ۱/۲/۶ نقطه دارند",
        "«مجله شعر» در لایه یک خطِ ادغامی است (دو خانهٔ جدول در هم تنیده — RTL quirk)",
        "سرخطِ جدولِ ترجمه در لایه با نقطهٔ پیش از متن می‌آید: « .کلمات زیر را به انگلیسی و فارسی ترجمه کنید»",
    ],
}
fam7 = next(f for f in d["source"]["g8familyMap"]["families"] if f["lesson"] == "درس هفتم")
fam7["round"] = "r378"
fam7["status"] = "استخراج شد — ۱ بانک/۶ آیتم از ۳ سکشن (س۱ و س۲ تصویری مستثنی؛ داوریِ ۶+۴ تصویر در رسید) — کارتِ هشتم کامل شد (۷/۷)"
d["source"]["g8familyMap"]["lastUpdatedRound"] = "r378"

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r378 OK — banks={len(d['lessons'])} items={total} (+6 in 1 bank: l16=6) — g8 family map 7/7")
