#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r377 — جفتِ دو خانوادهٔ بعدیِ کارتِ تستِ پایهٔ هشتم:
  «نمونه سؤالات امتحانی درس پنجم» (pdf-p50، ۴ سکشن) + «درس ششم» (pdf-p60، ۳ سکشن)
→ tests-g8.json با ۳ بانکِ تازه/۱۰ آیتم (۱۲ بانکِ قبلی + این ۳ = ۱۵ بانک/۴۶ آیتم)

خانوادهٔ ۵ (درس پنجم، ص۵۰) — ۲ بانک/۶ آیتم:
  س۲ (۴ MCQ چهارگزینه‌ایِ فرگمنت) — «با توجه به تصاویر داده شده کلمات ناقص زیر آن را کامل کنید»:
      فرگمنت‌ها در لایه چاپ‌اند ولی نگاشتِ تصویر-به-کلمه ناممکن است؛ با این حال شکلِ هر فرگمنت
      در سراسر واژگانِ جزوه یگانه است (قفلِ شکلِ regexی) پس بدونِ تصویر هم کلیدپذیر — الگویِ
      r376-بانک۱۰ ولی این‌بار فرگمنت‌ها رندر-فقط نیستند (لایه‌ای‌اند):
      «Airp – rt» → airport (لنگر: airport* ص۴۲ — ستاره‌دارِ جدولِ درس پنجم)
      «cin – ma» → cinema (cinema* ص۴۲)
      «shr – ne» → shrine (shrine* ص۴۲)
      «pal - ce» → palace (palace* ص۴۳ — خطِ تکیِ بعد از جدولِ ص۴۲)
      گزینه‌ها چهار واژهٔ خودِ سکشن‌اند (شکلِ یگانگی را گارد اثبات می‌کند)؛ حالتِ فرگمنتِ اول
      با A بزرگ verbatim چاپ و آخری با خطِ تیرهٔ ساده (-) بجای en-dash — هر دو verbatim.
  س۴ (۲ MCQ تلفظیِ ساقه‌فارسی) — «در کدام یک از کلمات زیر حرف th صدای " ص" می دهد.» با
      فهرستِ هفت‌واژه‌ایِ چاپی (South – brother - math – three – toothache – thirty – this):
      فهرست ۵ ص‌دار (/θ/) و ۲ ذ‌دار (/ð/) دارد — پرسشِ صِ چاپی از ۷ واژه تک‌کلیدی نمی‌شود
      (۳ گزینهٔ غیرِ ص لازم است ولی فقط brother/this غیرِ ص‌اند)؛ پس پرسش وارونه می‌شود به
      «ذ» — الگویِ مستندِ وارونه‌سازی؛ هر دو کلید چاپ‌لنگردارند:
      «در کدام کلمه حرف th صدای "ذ" می دهد.»
        brother (فهرستِ ذِ ص۵۹: mother–father–brother–…–weather — نکتهٔ تلفظیِ چاپی)
        this (دوبل: دیالوگِ ص۵۶ «in ‘there’, ‘this’, and ‘they’, it’s /ð/.» + فهرستِ ص۵۹)
      گزینه‌های ص‌دار از خودِ فهرستِ چاپی (South/math/three/toothache/thirty)؛ South در هر دو
      سؤال تکرار می‌شود (تنها راهِ چهارگزینه‌کردن با ۷ واژهٔ چاپی — مستند در رسید).
      south/three ص‌بودنشان هم چاپ‌لنگردار است (دیالوگِ ص۵۶ «In ‘north’, ‘south’, ‘thank’,
      and ‘three’, it’s /θ/.»).
خانوادهٔ ۶ (درس ششم، ص۶۰) — ۱ بانک/۴ آیتم:
  س۳ (۴ ناهماهنگِ چاپی) — «کلمه ناهماهنگ از نظر معنی را مشخص کنید و در.نقطه چین بنویسید»:
      Father – mother – brother – weather → weather (تنها غیرِ خانواده؛ برادر/پدر/مادر در
         فهرستِ ذِ ص۵۹ هم چاپ‌اند)
      River – summer – einter – fall → river (تنها غیرِ فصل؛ summer*/fall* ص۵۱؛ «einter»
         تایپوی چاپیِ winter — verbatim حفظ شد)
      Wet – rainy – snowy – story → story (تنها غیرِ آب‌وهوا؛ wet*/rainy*/snowy* ص۵۱؛
         story* ص۶۱ واژگانِ درس هفتم — لنگرِ بین‌درسی، الگویِ r376-morning* ص۱۹)
      Icy – snowy – cold – hot → hot (تنها غیرِ سرد؛ icy*/snowy*/cold* ص۵۱)
مستثنی‌ها (۴ سکشن تصویری — داوری از رندر برای پشتیبانیِ تصویریِ آینده در رسید ثبت شد):
  ص۵۰-س۱ (۵ تصویر: bridge[سی‌وسه‌پل]/stadium[ورزشگاهِ آزادی]/mosque[شاه‌چراغ]/zoo[خرس‌ها]/
     پنجمی پایینِ زوم)، ص۵۰-س۳ (قطب‌نمای هشت‌پر با ۴ جعبهٔ شماره‌دار: ۱=شمال‌غرب، ۲=شمال‌شرق،
     ۳=جنوب‌غرب، ۴=جنوب‌شرق)، ص۶۰-س۱ (۱=rainy، ۲=Suuny[sunny]، ۳=windy، ۴=hot)،
     ص۶۰-س۲ (metro system/bridge/palace/mosque/stadium/farm به ترتیبِ رندر).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g8.json"
LAYER = ROOT / "booklet-extract/g8.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g8exam56" in d.get("source", {}):
    print("r377: receipt g8exam56 already present — NO-OP")
    raise SystemExit(0)
assert d and "g8exam3" in d.get("source", {}), "tests-g8.json (r376) must exist first"

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
    return s


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": answer}


def place(bank: list[str], key: str, target: int) -> tuple[list[str], int]:
    rest = [w for w in bank if w != key]
    assert len(rest) == len(bank) - 1
    return rest[:target] + [key] + rest[target:], target


p50 = page_slice(50)
p60 = page_slice(60)
head50 = "\n".join(layer[: PM[50]])    # لایهٔ پیش از درس پنجم (لنگرهای واژگانی ص۴۲/۴۳)
mid56 = "\n".join(layer[PM[50] : PM[60]])  # ص۵۰-۵۹ (لنگرهای درس ششم + نکته‌های تلفظ)
after60 = "\n".join(layer[PM[60] :])   # ص۶۰ به بعد (لنگرِ story* ص۶۱)

# ————— پیمانِ لایه: واژگانِ ستاره‌دارِ درس پنجم پیش از ص۵۰ —————
for anchor in [r"airport\*", r"cinema\*", r"shrine\*", r"palace\*", r"south\*"]:
    assert re.search(anchor, head50), f"lesson-5 anchor missing before p50: {anchor}"
# ————— پیمانِ لایه: واژگانِ ستاره‌دارِ درس ششم در ص۵۰-۵۹ —————
for anchor in [r"weather\*", r"river\*", r"summer\*", r"fall\*", r"wet\*", r"rainy\*",
               r"snowy\*", r"icy\*", r"hot\*", r"cold\*"]:
    assert re.search(anchor, mid56), f"lesson-6 anchor missing in p50-59: {anchor}"
# لنگرهای تلفظیِ چاپی: دیالوگِ ص۵۶ + فهرستِ ذِ ص۵۹ + story* ص۶۱ (بین‌درسی)
DIA_THETA = "In ‘north’, ‘south’, ‘thank’, and ‘three’, it’s /θ/."
DIA_ETH = "Yes, in ‘there’, ‘this’, and ‘they’, it’s /ð/."
for anchor in [re.escape(DIA_THETA), re.escape(DIA_ETH),
               r"mother – father – brother – with – this – they – there –that – the – weather",
               r"story\*"]:
    assert re.search(anchor, mid56) or re.search(anchor, after60), f"pron anchor missing: {anchor}"

# ————— پیمانِ لایهٔ ص۵۰: بانکِ س۱، فرگمنت‌های س۲، بانکِ قطب‌نمای س۳، فهرستِ تلفظِ س۴ —————
BANK50_RE = re.compile(r"\((mosque[^)]*)\)")
bank50_line = next(l for l in p50 if BANK50_RE.search(l))
B50_S1 = [w.strip() for w in BANK50_RE.search(bank50_line).group(1).split("–")]
assert B50_S1 == ["mosque", "bridge", "stadium", "metro", "zoo"], B50_S1

FRAG_LINE = next(l for l in p50 if "Airp" in l)
frags_raw = [f.strip() for f in re.split(r"\s{2,}", FRAG_LINE.strip()) if f.strip()]
assert frags_raw == ["Airp – rt", "cin – ma", "shr – ne", "pal - ce"], frags_raw

COMPASS_RE = re.compile(r"\((south west[^)]*)\)")
compass_line = next(l for l in p50 if COMPASS_RE.search(l))
COMPASS = [w.strip() for w in COMPASS_RE.search(compass_line).group(1).split("–")]
assert COMPASS == ["south west", "north west", "south east", "north east"], COMPASS
# ناحیهٔ قطب‌نما (بینِ بانکِ جهت‌ها و تیترِ س۴) در لایه خالی است — تصویرِ محض
# («4» تنها شمارهٔ سکشنِ س۴ است، خطِ جدا — الگویِ r376-«5»)
i_compass = next(i for i, l in enumerate(p50) if COMPASS_RE.search(l))
i_s4 = next(i for i, l in enumerate(p50) if "حرفth" in l)
gap50 = [l for l in p50[i_compass + 1 : i_s4]]
assert all(not l.strip() or re.fullmatch(r"[0-9]", l.strip()) for l in gap50), \
    f"p50 S3 compass area must be empty/section-number only: {gap50!r}"

TH_LINE = next(l for l in p50 if l.strip().startswith("South –"))
TH7 = [w.strip() for w in re.split(r"\s[-–]\s", TH_LINE.strip())]
assert TH7 == ["South", "brother", "math", "three", "toothache", "thirty", "this"], TH7

# ساقهٔ سه‌خطیِ س۴ ص۵۰ (RTL quirk) — برای گاردِ بازسازی
i4l = next(i for i, l in enumerate(p50) if "حرفth" in l)
s4_lines = [l.strip() for l in p50[i4l : i4l + 6] if l.strip()]
assert s4_lines[0].endswith("حرفth") and "صدای" in s4_lines[1] and "می دهد" in s4_lines[2], s4_lines[:3]

# ————— پیمانِ لایهٔ ص۶۰: بانک‌های س۱/س۲ + چهار ردیفِ ناهماهنگِ س۳ —————
BANK60_1_RE = re.compile(r"\((Suuny[^)]*)\)")
b601_line = next(l for l in p60 if BANK60_1_RE.search(l))
B60_S1 = [w.strip() for w in BANK60_1_RE.search(b601_line).group(1).split("–")]
assert B60_S1 == ["Suuny", "hot", "rainy", "windy"], B60_S1

BANK60_2_RE = re.compile(r"\((farm[^)]*)\)")
b602_line = next(l for l in p60 if BANK60_2_RE.search(l))
B60_S2 = [w.strip() for w in BANK60_2_RE.search(b602_line).group(1).split("–")]
assert B60_S2 == ["farm", "stadium", "mosque", "bridge", "palace", "metro system"], B60_S2

ROW60_RE = re.compile(r"^(Father|River|Wet|Icy)\b")
s60_rows: list[str] = []
for line in p60:
    if ROW60_RE.match(line.strip()) and "…" in line:
        s60_rows.append(norm(re.split(r"\s{2,}", line.strip())[0]))
assert s60_rows == [
    "Father – mother – brother – weather",
    "River – summer – einter – fall",
    "Wet – rainy – snowy – story",
    "Icy – snowy – cold – hot",
], s60_rows

# ————— بانک ۱۳ — خ۵/س۲: چهار فرگمنتِ شکل‌یگانه — گزینه‌ها چهار واژهٔ خودِ سکشن —————
# («Airp» با A بزرگ verbatim چاپ ولی گزینه‌ها شکلِ ستاره‌دارِ واژگان‌اند — تطبیقِ شکل روی فرگمنتِ کوچک‌شده)
FRAG_WORDS = ["airport", "cinema", "shrine", "palace"]
SHAPES13 = {
    "Airp – rt": re.compile(r"^airp[a-z]{0,2}rt$"),
    "cin – ma": re.compile(r"^cin[a-z]{0,2}ma$"),
    "shr – ne": re.compile(r"^shr[a-z]{0,2}ne$"),
    "pal - ce": re.compile(r"^pal[a-z]{0,2}ce$"),
}
for frag, rx in SHAPES13.items():
    matches = [w for w in FRAG_WORDS if rx.match(w.lower())]
    assert len(matches) == 1, (frag, matches)
Q13 = [
    q("g8-l13-1", 1, "vocab", frags_raw[0], *place(FRAG_WORDS, "airport", 2)),
    q("g8-l13-2", 2, "vocab", frags_raw[1], *place(FRAG_WORDS, "cinema", 0)),
    q("g8-l13-3", 3, "vocab", frags_raw[2], *place(FRAG_WORDS, "shrine", 3)),
    q("g8-l13-4", 4, "vocab", frags_raw[3], *place(FRAG_WORDS, "palace", 1)),
]
assert [it["options"][it["answer"]] for it in Q13] == ["airport", "cinema", "shrine", "palace"]

# ————— بانک ۱۴ — خ۵/س۴: دو تلفظِ وارونه‌شدهٔ ذ — کلیدها brother/this —————
STEM_TH = "در کدام کلمه حرف th صدای \"ذ\" می دهد."
Q14 = [
    q("g8-l14-1", 1, "pron", STEM_TH, *place(["brother", "South", "math", "three"], "brother", 2)),
    q("g8-l14-2", 2, "pron", STEM_TH, *place(["this", "toothache", "thirty", "South"], "this", 0)),
]
assert [it["options"][it["answer"]] for it in Q14] == ["brother", "this"]
# هر ۷ واژهٔ چاپیِ س۴ دست‌کم یک بار در گزینه‌ها — South تکراری (مستند)
used14 = sorted({o for it in Q14 for o in it["options"]})
assert used14 == sorted(set(TH7)), used14

# ————— بانک ۱۵ — خ۶/س۳: چهار ناهماهنگِ چاپیِ verbatim — کلیدها weather/river/story/hot —————
Q15 = [
    q("g8-l15-1", 1, "vocab", s60_rows[0], s60_rows[0].split(" – "), s60_rows[0].split(" – ").index("weather")),
    q("g8-l15-2", 2, "vocab", s60_rows[1], s60_rows[1].split(" – "), s60_rows[1].split(" – ").index("River")),
    q("g8-l15-3", 3, "vocab", s60_rows[2], s60_rows[2].split(" – "), s60_rows[2].split(" – ").index("story")),
    q("g8-l15-4", 4, "vocab", s60_rows[3], s60_rows[3].split(" – "), s60_rows[3].split(" – ").index("hot")),
]
assert [it["options"][it["answer"]] for it in Q15] == ["weather", "River", "story", "hot"]

# ————— درج در سند —————
B13 = {"lesson": 13, "title": "امتحانی درس پنجم — کامل‌کردن حروف (س۲، ص۵۰)", "level": "چهارگزینه‌ای",
       "count": len(Q13), "questions": Q13}
B14 = {"lesson": 14, "title": "امتحانی درس پنجم — تلفظ th (س۴، ص۵۰)", "level": "چهارگزینه‌ای",
       "count": len(Q14), "questions": Q14}
B15 = {"lesson": 15, "title": "امتحانی درس ششم — کلمهٔ ناهماهنگ (س۳، ص۶۰)", "level": "چهارگزینه‌ای",
       "count": len(Q15), "questions": Q15}
d["lessons"].extend([B13, B14, B15])
for b in (B13, B14, B15):
    assert b["count"] == len(b["questions"])

d["source"]["g8exam56"] = {
    "extractedRound": "r377",
    "section": "نمونه سؤالات امتحانی درس پنجم پایه هشتم (pdf-p50) + درس ششم (pdf-p60)",
    "examPages": "pdf-p50 و pdf-p60 (تک‌صفحه‌ای) — ص۴۲-۴۳ واژگانِ درس پنجم، ص۵۱ واژگانِ درس ششم؛ ص۶۱ لغاتِ درس هفتم = مرزِ پایینیِ خانوادهٔ ششم",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هشتم نیست — کلیدها استنتاجی؛ لنگرهای تلفظیِ چاپی: دیالوگِ ص۵۶ («in ‘there’, ‘this’, and ‘they’, it’s /ð/.» و «In ‘north’, ‘south’, ‘thank’, and ‘three’, it’s /θ/.») + فهرستِ ذِ ص۵۹ (mother–father–brother–…–weather)",
    "sectionsTotal": 7,
    "sectionsExtracted": 3,
    "sectionsSkipped": 4,
    "items": 10,
    "bankCounts": [4, 2, 4],
    "wordBank": TH7,
    "wordBankSource": "فهرستِ چاپیِ س۴ ص۵۰ (استخرِ گزینه‌های تلفظی — ۵ ص‌دار /θ/ و ۲ ذ‌دار /ð/)؛ سکشن‌های بانک‌واژه‌دارِ س۱ ص۵۰ و س۱/س۲ ص۶۰ تصویری و مستثنی‌اند",
    "keyPolicy": "س۲ ص۵۰: شکلِ هر فرگمنت در سراسر واژگانِ جزوه یگانه است (قفلِ regexیِ گارد) پس بدونِ تصویر کلیدپذیر — الگویِ r376-بانک۱۰ ولی لایه‌ای نه رندر-فقط؛ س۴ ص۵۰: پرسشِ صِ چاپی از ۷ واژه تک‌کلیدی نمی‌شود (فقط ۲ واژهٔ غیرِ ص‌اند) → وارونه‌سازیِ مستند به «ذ» با کلیدهای چاپ‌لنگردار (brother ص۵۹؛ this ص۵۶+ص۵۹)؛ س۳ ص۶۰: ناهماهنگِ دسته‌ایِ هر ردیف با لنگرِ ستاره‌دارِ واژگان (weather/river/story/hot)",
    "engineNote": "همهٔ بانک‌ها MCQ چهارگزینه‌ای (قراردادِ r363)؛ ساقه‌های فارسیِ بانک ۱۴ بازساختهٔ ساقهٔ سه‌خطیِ بریدهٔ RTL («حرفth / صدای« ص» / .می دهد») با فاصله‌بندیِ یکدست — الگویِ r376-بانک۱۲؛ فرگمنتِ «Airp» با A بزرگ و «pal - ce» با خطِ تیرهٔ ساده verbatim چاپ؛ گزینه‌های بانک ۱۳ واژه‌های شکلِ واژگانیِ ستاره‌دار (airport/cinema/shrine/palace)",
    "derivedKeys": {
        "S2-l5": ["airport", "cinema", "shrine", "palace"],
        "S4-l5": ["brother", "this"],
        "S3-l6": ["weather", "River", "story", "hot"],
    },
    "skippedSections": [
        "ص۵۰-س۱ (تصویری): کلماتِ مربوط به تصاویر از بانکِ چاپی (mosque/bridge/stadium/metro/zoo) — داوریِ رندر برای پشتیبانیِ تصویریِ آینده: سی‌وسه‌پل=bridge، ورزشگاهِ آزادی=stadium، شاه‌چراغ=mosque، خرس‌ها=zoo؛ تصویرِ پنجمی (metro) پایینِ ردیف",
        "ص۵۰-س۳ (تصویری): قطب‌نمای هشت‌پر با ۴ جعبهٔ شماره‌دار — داوریِ رندر: ۱=شمال‌غرب (بالا-چپ)، ۲=شمال‌شرق (بالا-راست)، ۳=جنوب‌غرب (پایین-چپ)، ۴=جنوب‌شرق (پایین-راست)؛ بانکِ چاپی (south west/north west/south east/north east)",
        "ص۶۰-س۱ (تصویری): ۴ تصویرِ آب‌وهوا از بانکِ چاپی (Suuny/hot/rainy/windy) — داوریِ رندر: ۱=بارانی(rainy)، ۲=آفتابی(Suuny/sunny)، ۳=بادی(windy)، ۴=گرم(hot)",
        "ص۶۰-س۲ (تصویری): ۶ تصویر از بانکِ چاپی (farm/stadium/mosque/bridge/palace/metro system) — داوریِ رندر به ترتیبِ چاپ: قطار=metro system، پل=bridge، قصر=palace، مسجد=mosque، ورزشگاه=stadium، مزرعه=farm",
    ],
    "printQuirks": [
        "«Suuny» تایپوی چاپیِ س۱ ص۶۰ (sunny) — در رسیدِ مستثنی ثبت شد نه در آیتم‌ها",
        "«einter» تایپوی چاپیِ ردیفِ دومِ س۳ ص۶۰ (winter) — verbatim در ساقه حفظ شد",
        "فرگمنتِ اولِ س۲ ص۵۰ با A بزرگ چاپ («Airp – rt») و آخری با خطِ تیرهٔ ساده («pal - ce») — هر دو verbatim",
        "فهرستِ س۴ ص۵۰ جداکنندهٔ مختلط دارد: «South – brother - math – three…» (en-dash و hyphen درهم)",
        "ساقهٔ س۴ ص۵۰ سه‌خطیِ بریدهٔ RTL: «در کدام یک از کلمات زیر حرفth» / « صدای\" ص\"» / «.می دهد» — نقطهٔ پایانی در ابتدای خطِ سوم",
        "تیترِ س۳ ص۶۰: «کلمه ناهماهنگ از نظر معنی را مشخص کنید و در.نقطه چین بنویسید» — نقطهٔ وسطِ جمله (RTL quirk)",
    ],
}
fam5 = next(f for f in d["source"]["g8familyMap"]["families"] if f["lesson"] == "درس پنجم")
fam6 = next(f for f in d["source"]["g8familyMap"]["families"] if f["lesson"] == "درس ششم")
fam5["round"] = "r377"
fam5["status"] = "استخراج شد — ۲ بانک/۶ آیتم از ۴ سکشن (س۱ و س۳ تصویری مستثنی؛ داوریِ قطب‌نما در رسید)"
fam6["round"] = "r377"
fam6["status"] = "استخراج شد — ۱ بانک/۴ آیتم از ۳ سکشن (س۱ و س۲ تصویری مستثنی؛ داوریِ تصاویر در رسید)"
d["source"]["g8familyMap"]["lastUpdatedRound"] = "r377"

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(b["questions"]) for b in d["lessons"])
print(f"r377 OK — banks={len(d['lessons'])} items={total} (+10 in 3 banks: l13=4, l14=2, l15=4)")
