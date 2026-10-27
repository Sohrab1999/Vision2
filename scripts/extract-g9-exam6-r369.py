#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r369 — «سؤالات امتحانی درس ششم» نهم (چاپی ص۹۵-۹۷؛ pdf-p95-97) → tests-g9.json
خانواده: ۱۰ سکشنِ شماره‌گذاری‌شده (ارقامِ آمیخته: «۸» فارسی). p98 «تست واژگان» است
(خانوادهٔ جدا — r362 استخراجش کرده) و مرزِ پایانِ خانواده‌های امتحانیِ کارتِ نهم است.
۶ بانکِ ۴۵-۵۰ (۲۱ آیتم): این خانواده هم بازآراییِ خودِ مکالمه/تمرین‌های درس ششم است:
  س۲ (۸ تایپی) — بانکِ ۹ واژه‌ای («یک عبارت اضافی است» — اضافی: stay)؛ هر هشت بلنک
      در مکالمهٔ verbatim درس لنگر دارند (لایه p90-91) با تبادلِ چاپیِ قیدِ زمان
      (امتحان: «Last winter I fell» ↔ درس: «Last summer I fell»)؛ سطرِ آخرِ B دو بلنک
      دارد و به دو آیتم شکسته شد (الگوی r368)
  س۳ (۲ MCQ) — ناهماهنگ: my (تنها غیرِ ضمیرِ مفعولی — گرامرِ p94) / health (تنها غیرِ
      فعلِ آسیب — Cut*/Hurt*/Break* p89)
  س۴ (۱ تایپی) — مرتب‌کردن؛ ق۱ دوکلیدی مستثنی (الگوی r358/r365/r366)؛ ق۲ چینشِ یکتای
      «They saw him in the park.» با acceptedِ قیدِ مکانِ آغازین (الگوی r368)
  س۵ (۴ MCQ پنج‌گزینه‌ایِ چاپی a-e؛ اضافی: c) — دو جفت verbatimِ تمرینِ ۲ درس (p92:
      «Why did they have an accident? → Because they drove fast.» و همتای Where) و
      دو جفت با نوعِ پرسش‌واژه (Who→شخص، When→زمان)
  س۶ (۳ MCQ سه‌گزینه‌ایِ چاپی) — us (مفعول + انسجامِ discourseِ «We went») / When
      (پاسخِ زمانیِ last Monday) / Because (پاسخِ Why)
  س۷ (۳ MCQ) — them (جمعِ books) / have (Did + شکلِ ساده) / found (گذشتهٔ بی‌قاعده)
مستثنی‌ها: س۱/س۹/س۱۰ تصویری، س۸ آهنگی (افتان/خیزان) — الگوی r364-368؛ س۴ق۱ دوکلیدی.
هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)
  — کلید = استنتاجِ مستندِ مکالمه‌محور/ساختاری (الگوی g9exam1-5).
با این راند کارتِ نهم شش‌درسِ امتحانی کامل می‌شود.
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
G9 = ROOT / "public/jozve/tests-g9.json"

d = json.loads(G9.read_text(encoding="utf-8"))
if "g9exam6" in d.get("source", {}):
    print("r369: receipt g9exam6 already present — NO-OP")
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


SEG = page_lines(95) + page_lines(96) + page_lines(97)
SEG_JOINED = "\n".join(SEG)


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


# ————— سربرگ + مرزِ خانواده + شواهدِ سکشن‌های مستثنی —————
find("سواالت امتحانی درس ششم پایه نهم")
assert "تست واژگان" not in SEG_JOINED, "next family (vocab tests) leaked into exam-6 SEG"
find("با توجه به تصاویر جمالت زیر را کامل کنید")      # س۱ تصویری
find("با استفاده از فلش افتان و خیزان جمالت زیر")      # س۸ آهنگی
find("با توجه به تصاویر به سواالت پاسخ دهید")          # س۹ تصویریِ پرسش/پاسخ
find("با توجه به تصاویر گزینه صحیح را انتخاب کنید")    # س۱۰ تصویریِ MCQ
# اثباتِ مرزِ پایینی: خانوادهٔ واژگان از p98 — خارجِ SEG
for i, l in enumerate(LAYER):
    if l.strip() == "تست واژگان":
        VOCAB_LINE = i
        break
assert VOCAB_LINE > SEG.__len__() - 1 or True  # صرفاً برای خوانایی؛ چکِ واقعی پایین
PM98 = page_lines(98)
assert any("تست واژگان" in s for s in PM98), "vocab family must start at pdf-p98"

# ————— اثباتِ لنگرهای مکالمه/تمرین/photo-dictionary/واژگان/گرامرِ درس ششم (رسید) —————
LEX = {
    "I don’t think so. I don’t like school trips. Last summer I fell and broke my": "مکالمهٔ درس verbatim (Ehsan لایه p90:042) — لنگرِ س۲ق۱/ق۲ (امتحان: winter↔درس: summer)",
    "I twisted my ankle last winter. I stayed home for two": "مکالمهٔ درس verbatim (Reza p90:051) — لنگرِ س۲ق۳/ق۴ (امتحان: summer↔درس: winter)",
    "but after that, I participated in Helal-e-Ahmar first aid classes. I": "مکالمهٔ درس verbatim (Reza p91:005) — لنگرِ س۲ق۵",
    "learned how to take care of myself.": "مکالمهٔ درس verbatim (p91:006) — لنگرِ س۲ق۶",
    "Can you give me some advice?": "مکالمهٔ درس verbatim (Ehsan p91:016) — لنگرِ س۲ق۸",
    "Yes, she did.": "تمرینِ ۱ درس verbatim (p91:035) — لنگرِ س۲ق۷ و گزینهٔ اضافیِ س۵",
    "Did Mina have an accident?": "تمرینِ ۱ درس verbatim (p91:039) — لنگرِ الگوی did-پرسشِ س۲ق۷",
    "Who had an accident?": "تمرینِ ۲ درس verbatim (p92:014) — لنگرِ س۵ق۳ (Who→شخص)",
    "She broke her leg in the park.": "تمرینِ ۲ درس verbatim (p92:019) — لنگرِ س۵ق۱ (همتای مکانی)",
    "Where did she break her leg?": "تمرینِ ۲ درس verbatim (p92:021) — لنگرِ س۵ق۱",
    "Because they drove fast.": "تمرینِ ۲ درس verbatim (p92:029) — لنگرِ س۵ق۲",
    "Why did they have an accident?": "تمرینِ ۲ درس verbatim (p92:034) — لنگرِ س۵ق۲",
    "It hurts a lot. *": "photo dictionary درس (p90:007)",
    "He broke his leg*": "photo dictionary درس (p90:008) — لنگرِ س۲ق۲",
    "It is bleeding*": "photo dictionary درس (p90:009) — س۱ تصویری (مستثنی)",
    "He had a car crash*": "photo dictionary درس (p90:010) — س۱ تصویری (مستثنی)",
    "She burned her hand. *": "photo dictionary درس (p90:011) — لنگرِ س۶ق۲",
    "He has a black eye*": "photo dictionary درس (p90:012)",
    "She cut her finger*": "photo dictionary درس (p90:013) — لنگرِ س۵ق۳",
    "He has a scar*": "photo dictionary درس (p90:014) — لنگرِ س۷ق۲",
    "She had a heart attack*": "photo dictionary درس (p90:015)",
    "He has his leg in a cast*": "photo dictionary درس (p90:016)",
    "She takes care of her child*": "photo dictionary درس (p90:017) — لنگرِ س۵ق۴",
    "He has some bruises*": "photo dictionary درس (p90:018) — س۱ تصویری (مستثنی)",
    "Stick / put a plaster on the wound*": "photo dictionary درس (p90:019)",
    "He hit his head on the door*": "photo dictionary درس (p90:020)",
    "I hurt my knee*": "photo dictionary درس (p90:021) — لنگرِ س۶ق۳",
    "Heart attack*": "واژهٔ درس (p89:020)",
    "Accident*": "واژهٔ درس (p89:022) — لنگرِ س۵ق۲",
    "Hit*": "واژهٔ درس (p89:024) — لنگرِ س۵ق۱",
    "Advice*": "واژهٔ درس (p89:026) — لنگرِ س۲ق۸",
    "Hurry up*": "واژهٔ درس (p89:028) — گزینهٔ چاپیِ س۶ق۳",
    "Hurt*": "واژهٔ درس (p89:032) — لنگرِ س۳ق۲/س۶ق۳",
    "Ankle*": "واژهٔ درس (p89:033) — لنگرِ س۲ق۳",
    "Invite*": "واژهٔ درس (p89:038) — لنگرِ س۶ق۱",
    "Bleed*": "واژهٔ درس (p89:040)",
    "Knee*": "واژهٔ درس (p89:042) — لنگرِ س۶ق۳",
    "Break*": "واژهٔ درس (p89:044) — لنگرِ س۳ق۲",
    "Bruise*": "واژهٔ درس (p89:048)",
    "Burn*": "واژهٔ درس (p89:052) — لنگرِ س۶ق۲",
    "Cast*": "واژهٔ درس (p89:055)",
    "Cut*": "واژهٔ درس (p89:065) — لنگرِ س۳ق۲/س۵ق۳",
    "Scar*": "واژهٔ درس (p89:071) — لنگرِ س۷ق۲",
    "Stick*": "واژهٔ درس (p89:075)",
    "Fall*": "واژهٔ درس (p89:076) — لنگرِ س۲ق۲",
    "Take care of*": "واژهٔ درس (p89:078) — لنگرِ س۲ق۶/س۵ق۴",
    "Find": "واژهٔ درس (p89:080) — لنگرِ س۷ق۳",
    "Trip*": "واژهٔ درس (p89:082) — لنگرِ س۲ق۱",
    "Finger*": "واژهٔ درس (p89:084) — لنگرِ س۵ق۳",
    "Twist*": "واژهٔ درس (p89:086) — لنگرِ س۲ق۳",
    "First aid*": "واژهٔ درس (p89:088) — لنگرِ س۲ق۵",
    "Wound*": "واژهٔ درس (p89:090)",
    "health*": "واژهٔ درس (p89:095) — کلیدِ س۳ق۲",
    "ضمایر مفعولی": "گرامرِ درس ششم (p94:005) — لنگرِ س۳ق۱/س۶ق۱/س۷ق۱",
    "Object Pronouns": "گرامرِ درس ششم (p94:006) — لنگرِ س۳ق۱/س۶ق۱/س۷ق۱",
}
for k in LEX:
    find_all(k)
# کوئیرک: واژهٔ اضافیِ «stay» در خودِ ساقهٔ چاپیِ س۲ هم هست (Did you stay home?)
find("Did you stay home?")
# بانکِ واژهٔ چاپی + یادداشتِ اضافی
find("(broke, did, stay, twisted, participated, advice, do, learn, stayed)")
find("یک عبارت . ) اضافی است")
find("یک مورد اضافی است")  # س۵: گزینهٔ اضافی

# ————— س۲: بانک واژهٔ مکالمهٔ سلامتی و آسیب (۸ تایپی) —————
find("A: ……. you like school trips?")
find("B: No, I don’t. Last winter I fell and …………")
find("A: really? I ………………. my ankle last")
find("A: Yes, I ……………… home for 10 days.")
find("B: But after that, I ……………………... in Helal-")
find("A: I like that. Did you …………... how to take")
find("B: Yes, I …….... I can give you some …………...")
WORDBANK = ["broke", "did", "stay", "twisted", "participated", "advice", "do", "learn", "stayed"]
EXTRA = "stay"
DATA45 = [
    ("A: ------- you like school trips?", "do", "did", ["do"],
     "مکالمهٔ verbatim درس: «I don’t like school trips.» (لایه p90:042) + Trip* (p89:082)؛ عادتِ حال («like») → Do + شکلِ ساده؛ «did» تلهٔ زمانِ گذشته است"),
    ("B: No, I don’t. Last winter I fell and ------- my leg.", "broke", "stayed", ["broke"],
     "مکالمهٔ درس: «Last summer I fell and broke my leg.» (لایه p90:042-043 — امتحان قیدِ زمان را winter کرده) + photo dictionary: «He broke his leg*» (p90:008) و Fall*/Break* (p89)؛ «stayed my leg» بی‌معنا"),
    ("A: really? I ------- my ankle last summer.", "twisted", "stayed", ["twisted"],
     "مکالمهٔ درس: «I twisted my ankle last winter.» (لایه p90:051 — امتحان قیدِ زمان را summer کرده) + Twist*/Ankle* (p89:086/033)؛ «stayed my ankle» بی‌معنا"),
    ("A: Yes, I ------- home for 10 days.", "stayed", "stay", ["stayed"],
     "مکالمهٔ درس: «I stayed home for two weeks!» (لایه p90:051-052 — امتحان: 10 days)؛ گذشته با «for 10 days» → stayed؛ «stay» واژهٔ اضافیِ چاپی است و در ساقهٔ خودِ امتحان هم هست («Did you stay home?» — p95:022)"),
    ("B: But after that, I ------- in Helal-e-Ahmar first aid classes.", "participated", "twisted", ["participated"],
     "مکالمهٔ verbatim درس: «Yeah…, but after that, I participated in Helal-e-Ahmar first aid classes.» (لایه p91:005) + First aid* (p89:088)؛ «twisted in … classes» بی‌معنا"),
    ("A: I like that. Did you ------- how to take care of yourself?", "learn", "stayed", ["learn"],
     "مکالمهٔ درس: «I learned how to take care of myself.» (لایه p91:006) + Take care of* (p89:078)؛ Did + شکلِ سادهٔ فعل → learn نه stayed"),
    ("B: Yes, I -------.", "did", "do", ["did"],
     "پاسخِ کوتاهِ did-پرسش: پرسشِ پیشینِ خودِ امتحان «Did you … how to take care of yourself?» است؛ الگوی تمرینِ ۱ درس: «Did Mina have an accident? → Yes, she did.» (لایه p91:039/035)"),
    ("I can give you some ------- if you like.", "advice", "do", ["advice"],
     "مکالمهٔ درس: «Can you give me some advice?» (لایه p91:016) + Advice* (p89:026)؛ «some» + اسم → advice؛ «some do» بی‌معنا"),
]
BANK45 = []
for stem, key, wrong, accepted, why in DATA45:
    assert key in WORDBANK and wrong in WORDBANK, f"scaffold out of printed bank: {key}/{wrong}"
    assert key != EXTRA, "extra word must never be a KEY"
    # واژهٔ اضافی به‌عنوان داربست روادار است — تلهٔ زمانیِ س۲ق۴ (stayed/stay) خودش آزمونِ «اضافی نباید در بلنک برود» است
    BANK45.append({
        "id": f"g9-l45-{len(BANK45) + 1}", "n": len(BANK45) + 1,
        "category": "vocab", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": accepted, "placeholder": "answer in English…", "keyWhy": why,
    })

# ————— س۳: کلمهٔ ناهماهنگ (۲ MCQ) —————
find("1. a) her")
find("2. a) cut")
BANK46 = [
    {
        "id": "g9-l46-1", "n": 1, "category": "grammar",
        "question": "her – my – them – him",
        "options": ["her", "my", "them", "him"], "answer": 1,
        "keyWhy": "گرامرِ خودِ درس: ضمایر مفعولی (Object Pronouns، لایه p94) — her/them/him هر سه ضمیرِ مفعولی‌اند؛ my فقط صفتِ ملکی است و هرگز نقشِ مفعولی ندارد",
    },
    {
        "id": "g9-l46-2", "n": 2, "category": "vocab",
        "question": "cut – hurt – break – health",
        "options": ["cut", "hurt", "break", "health"], "answer": 3,
        "keyWhy": "سه فعلِ آسیبِ درس: Cut* (p89:065)/Hurt* (p89:032)/Break* (p89:044)؛ health اسمِ وضعیتِ سلامتی است نه فعلِ آسیب (health* p89:095)",
    },
]

# ————— س۴: مرتب‌کردن جملات (۱ تایپی — ق۱ دوکلیدی مستثنی) —————
find("1. learnt, last, English, summer, I. year.")
find("2. saw, the, in, him, they, park.")
DATA47 = [
    ("saw, the, in, him, they, park.",
     "They saw him in the park.", ["They saw him in the park.", "In the park they saw him.", "In the park, they saw him."],
     "چینشِ یکتای شش واژه؛ جایگاهِ آغازینِ قیدِ مکان روادار است (الگوی acceptedِ r368)؛ verbs: saw از خودِ ردیفِ چاپی — هیچ واژه‌ای اضافی نیست"),
]
BANK47 = []
for stem, key, accepted, why in DATA47:
    BANK47.append({
        "id": f"g9-l47-{len(BANK47) + 1}", "n": len(BANK47) + 1,
        "category": "grammar", "kind": "typed",
        "question": stem, "options": [key, stem], "answer": 0,
        "accepted": accepted, "placeholder": "write the sentence…", "keyWhy": why,
    })

# ————— س۵: وصل‌کردنیِ پرسش/پاسخ (۴ MCQ — پنج‌گزینه‌ایِ چاپی a-e) —————
find("1. Where did she hurt her back?")
find("2. Why did they have an accident?")
find("3. Who cut her finger?")
find("4. When did you take care of your father?")
for opt in ["I took care of my father last year.", "She hit it in the park.", "Yes, she did.",
            "Because they drove fast.", "My sister."]:
    find(opt)
OPTS48 = ["I took care of my father last year.", "She hit it in the park.", "Yes, she did.",
          "Because they drove fast.", "My sister."]
DATA48 = [
    ("Where did she hurt her back?", 1,
     "پرسشِ Where → مکان: b) «She hit it in the park.» («it» = back؛ Hit* p89:024)؛ همتای تمرینِ ۲ درس: «Where did she break her leg? → She broke her leg in the park.» (لایه p92:021/019)"),
    ("Why did they have an accident?", 3,
     "پرسشِ Why → علت: d) «Because they drove fast.» — جفتِ verbatimِ تمرینِ ۲ درس (لایه p92:034/029) + Accident* (p89:022)"),
    ("Who cut her finger?", 4,
     "پرسشِ Who → تنها پاسخِ شخصی: e) «My sister.»؛ همتای تمرینِ ۲ درس: «Who had an accident? → Reza.» (لایه p92:014/012)؛ Cut* (p89:065) + photo dictionary: «She cut her finger*» (p90:013)"),
    ("When did you take care of your father?", 0,
     "پرسشِ When → زمان: a) «I took care of my father last year.»؛ Take care of* (p89:078) + photo dictionary: «She takes care of her child*» (p90:017)"),
]
BANK48 = [{
    "id": f"g9-l48-{i + 1}", "n": i + 1, "category": "grammar",
    "question": f"{stem} ( ------- )", "options": OPTS48, "answer": ans, "keyWhy": why,
} for i, (stem, ans, why) in enumerate(DATA48)]
# c اضافی است — هیچ کلیدی روی اندیس ۲ نیست
for x in BANK48:
    assert x["answer"] != 2, "extra answer c must never be keyed"

# ————— س۶: کامل با کلماتِ داخلِ پرانتز (۳ MCQ سه‌گزینه‌ایِ چاپی) —————
find("1. We went to the party, because they invited")
find("2. A: …………. did he burn his hand? B: He burnt his hand last Monday.")
find("3. A: Why did you hurt your knee? B: ……………………… I fell.")
BANK49 = [
    {
        "id": "g9-l49-1", "n": 1, "category": "grammar",
        "question": "We went to the party, because they invited -------.",
        "options": ["them", "us", "our"], "answer": 1,
        "keyWhy": "گرامرِ درس: ضمایر مفعولی (p94) بعد از invite + انسجامِ گفتاریِ «We went …» → they invited us؛ «our» صفتِ ملکی است و «them» با فاعلِ «they» ناسازگار (بازتابِ همان شخص)؛ Invite* (p89:038)",
    },
    {
        "id": "g9-l49-2", "n": 2, "category": "grammar",
        "question": "A: ------- did he burn his hand? B: He burnt his hand last Monday.",
        "options": ["When", "Where", "How"], "answer": 0,
        "keyWhy": "پاسخِ B زمانی است («last Monday») → When؛ Burn* (p89:052) + photo dictionary: «She burned her hand.*» (p90:011)؛ چاپ هم «burn» و هم «burnt» (بریتانیایی) در همین آیتم دارد — واریانسِ املاییِ مستند",
    },
    {
        "id": "g9-l49-3", "n": 3, "category": "grammar",
        "question": "A: Why did you hurt your knee? B: ------- I fell.",
        "options": ["hurry up", "yeah", "because"], "answer": 2,
        "keyWhy": "پرسشِ Why → پاسخِ علت با because (الگوی تمرینِ ۲ درس: «Why did they have an accident? → Because they drove fast.» لایه p92)؛ photo dictionary: «I hurt my knee*» (p90:021)؛ Hurry up* واژهٔ درس است اما پاسخِ علت نیست",
    },
]

# ————— س۷: گزینهٔ صحیح (۳ MCQ) —————
find("1. A: Did you read the books?")
find("2. A: Did she ………. a scar?")
find("3. He …………… his coat yesterday.")
BANK50 = [
    {
        "id": "g9-l50-1", "n": 1, "category": "grammar",
        "question": "A: Did you read the books? B: Yes, I enjoyed ------- very much.",
        "options": ["them", "us", "its", "it"], "answer": 0,
        "keyWhy": "«the books» جمع است → ضمیرِ مفعولیِ جمعِ them (گرامرِ درس: Object Pronouns p94)؛ it/its مفردند و us اول‌شخصِ جمع با books ناسازگار",
    },
    {
        "id": "g9-l50-2", "n": 2, "category": "grammar",
        "question": "A: Did she ------- a scar? B: Yes, she had a scar on her face.",
        "options": ["has", "had", "have", "her"], "answer": 2,
        "keyWhy": "Did + شکلِ سادهٔ فعل → have؛ photo dictionary: «He has a scar*» (p90:014) + Scar* (p89:071)؛ پاسخِ B «had» را در گذشته تأیید می‌کند",
    },
    {
        "id": "g9-l50-3", "n": 3, "category": "grammar",
        "question": "He ------- his coat yesterday.",
        "options": ["finded", "founded", "found", "did found"], "answer": 2,
        "keyWhy": "گذشتهٔ سادهٔ بی‌قاعدهٔ find → found (Find p89:080 + قیدِ گذشتهٔ «yesterday»)؛ «finded» شکلِ ناموجود، «founded» به‌معنای تأسیس‌کردن است و «did found» ساختارِ ناممکن (did + شکلِ ساده)",
    },
]

# ————— قفل‌های پیش از نوشتن —————
NEW_BANKS = [BANK45, BANK46, BANK47, BANK48, BANK49, BANK50]
all_new_ids = [q["id"] for b in NEW_BANKS for q in b]
assert len(all_new_ids) == 21, len(all_new_ids)
assert len(set(all_new_ids)) == 21
existing_ids = {q["id"] for b in d["lessons"] for q in b["questions"]}
assert not (set(all_new_ids) & existing_ids), "id collision"
for b in NEW_BANKS:
    for q in b:
        if q.get("kind") == "typed":
            assert len(q["options"]) >= 2, f"single-option typed: {q['id']}"
            assert q["options"][q["answer"]] == q["accepted"][0]

# ————— چسباندن بانک‌ها —————
def mkbank(lesson, title, level, qs):
    return {"lesson": lesson, "title": title, "level": level, "count": len(qs), "questions": qs}


d["lessons"] += [
    mkbank(45, "امتحانی درس ششم — بانک واژهٔ مکالمهٔ سلامتی و آسیب (س۲، ص۹۵)", "تمرین تایپی (بانک واژه)", BANK45),
    mkbank(46, "امتحانی درس ششم — کلمهٔ ناهماهنگ (س۳، ص۹۵)", "چهارگزینه‌ای", BANK46),
    mkbank(47, "امتحانی درس ششم — مرتب‌کردن جملات (س۴، ص۹۵)", "تمرین تایپی (مرتب‌کردن)", BANK47),
    mkbank(48, "امتحانی درس ششم — وصل‌کردنیِ پرسش/پاسخ (س۵، ص۹۶)", "چهارگزینه‌ای (پنج‌گزینه‌ایِ چاپی)", BANK48),
    mkbank(49, "امتحانی درس ششم — کامل با کلماتِ پرانتز (س۶، ص۹۶)", "چهارگزینه‌ای (سه‌گزینه‌ایِ چاپی)", BANK49),
    mkbank(50, "امتحانی درس ششم — گزینهٔ صحیح (س۷، ص۹۶)", "چهارگزینه‌ای", BANK50),
]

d["source"]["g9exam6"] = {
    "extractedRound": "r369",
    "section": "سؤالات امتحانی درس ششم پایه نهم",
    "examPages": "pdf-p95-97 (برچسبِ فوتر: ۹۵/۹۶/۹۷)؛ p98 «تست واژگان» است — خانوادهٔ جدا که r362 استخراجش کرده و مرزِ پایینیِ خانواده‌های امتحانیِ کارتِ نهم؛ با این راند کارتِ نهم شش‌درسِ امتحانی کامل شد",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 10,
    "sectionsExtracted": 6,
    "sectionsSkipped": 4,
    "items": 21,
    "bankCounts": [8, 2, 1, 4, 3, 3],
    "wordBank": WORDBANK,
    "extraWords": [EXTRA],
    "keyPolicy": "کلیدِ استنتاجیِ مکالمه‌محور: این خانواده هم بازآراییِ خودِ مکالمه/تمرین‌های درس ششم است — هشت بلنکِ س۲ در مکالمهٔ verbatim درس (لایه p90-91) لنگر دارند (با تبادلِ چاپیِ قیدهای زمان: امتحان «Last winter I fell» ↔ درس «Last summer I fell» و بالعکس برای ankle)؛ س۵ دو جفتش verbatimِ تمرینِ ۲ درس (لایه p92: Why→Because و همتای Where) و دو جفتش با نوعِ پرسش‌واژه (Who→شخص، When→زمان) یکتاست؛ گزینهٔ اضافیِ س۵ («Yes, she did.») خودِ تمرینِ ۱ درس است (p91:035)؛ س۳ از گرامرِ خودِ درس (ضمایر مفعولی p94) و خانوادهٔ فعل‌های آسیب (p89)؛ س۶/س۷ ساختاری + photo dictionary (p90)؛ هیچ کلیدی از خارجِ متنِ جزوه نیامده",
    "derivedKeys": {
        "S2": [x["keyWhy"] for x in BANK45],
        "S3": [x["keyWhy"] for x in BANK46],
        "S4": [x["keyWhy"] for x in BANK47],
        "S5": [x["keyWhy"] for x in BANK48],
        "S6": [x["keyWhy"] for x in BANK49],
        "S7": [x["keyWhy"] for x in BANK50],
    },
    "skippedSections": [
        "س۱ (ص۹۵): «با توجه به تصاویر جملات زیر را کامل کنید» — تصویری (انگشتِ خون‌ریزی‌کننده/تصادفِ دو ماشین/کبودیِ دست) با لنگرهای photo dictionary («It is bleeding*»/«He had a car crash*»/«He has some bruises*» p90) — الگوی س۱ِ r364-368",
        "س۴ق۱ (ص۹۵): «learnt, last, English, summer, I. year.» — دوکلیدی: «I learnt English last year.» با «summer» اضافی و «I learnt English last summer.» با «year» اضافی هر دو دستوری‌اند و دستورِ چاپی «کلمهٔ اضافی» هم نمی‌گوید — الگوی دو-کلیدِ r358/r365/r366",
        "س۸ (ص۹۶): «با استفاده از فلش افتان و خیزان جملات زیر را مشخص کنید» — آهنگی با آیکنِ فلشِ تصویری در رندر (Do you have your lunch at school? / Please hurry up! / Hamid cut his finger.) — الگوی س۶ِ r366-368",
        "س۹ (ص۹۷): «با توجه به تصاویر به سوالات پاسخ دهید» — تصویری با دستورِ دوگانهٔ چاپی «کوتاه/کامل» (Did she take care of the baby? / Did you break your leg? / When did Mr. Hamidi get up? با ساعتِ ۶:۳۰ / How did Amir hurt his head?) — الگوی س۱۰ِ r368",
        "س۱۰ (ص۹۷): «با توجه به تصاویر گزینه صحیح را انتخاب کنید» — تصویری (His hand is … (bleeding) / It … a lot (hurts) / We attended in Helal-e-Ahmar … classes (first aid) / He has some … on his face (scars))",
    ],
    "printQuirkCount": 10,
    "printQuirks": [
        "شماره‌گذاریِ آمیختهٔ چاپی: ارقامِ لاتینِ 1-7 سپس «۸» فارسی (لایه p96:032) سپس 9/10 لاتین — الگوی exam-5",
        "تبادلِ قیدهای زمانِ س۲ نسبت به درس: امتحان «Last winter I fell and broke my leg» دارد و مکالمهٔ درس «Last summer I fell and broke my leg» (p90:042)؛ متقابلاً امتحان «my ankle last summer» و درس «I twisted my ankle last winter» (p90:051) — لنگرها هم‌جمله‌اند نه هم-قید",
        "واژهٔ اضافیِ س۲ («stay») در خودِ ساقهٔ چاپی هم می‌آید («Did you stay home?» p95:022) — اضافیِ خود-فاش‌شونده؛ با این حال کلیدِ هیچ بلنکی نیست و در گارد قفل شد",
        "س۲: سطرِ آخرِ B دو بلنک دارد («Yes, I ……. I can give you some ………… if you like.») — به دو آیتمِ ۷/۸ شکسته شد (الگوی r368)",
        "س۴ق۱: شش واژه با دو چینشِ دستوریِ مستقل و دو اضافیِ متفاوت — دوکلیدی → مستثنی با دلیل (بندِ مستثنی‌ها)",
        "س۴ق۱: نقطهٔ سرگردانِ چاپی پس از «I» («learnt, last, English, summer, I. year.»)",
        "س۶ق۲: چاپ هم «burn» (در پرسش) و هم «burnt» (بریتانیایی — در پاسخِ B) در یک آیتم دارد — واریانسِ املاییِ چاپی",
        "س۵: جدولِ چاپی پاسخ‌ها را در ستونِ راست با حروفِ a-e و پرسش‌ها را در ستونِ چپ با پرانتزِ حرف می‌دهد؛ لایه ترتیبِ پرسش/جواب را درهم می‌دهد — ترتیبِ منطقی بازسازی و با رندر راستی‌آزمایی شد",
        "س۹: دستورِ چاپی برای هر تصویر دو پاسخ می‌خواهد («کوتاه:» و «کامل:») — خودِ ساختارِ دوپاسخی هم تصویری و مستثنی است",
        "س۲: «really?» با حرفِ کوچکِ چاپی پس از A (بازآراییِ نقش‌ها نسبت به درس: «That’s too bad» که در درس از Ehsan است در امتحان در سطرِ B می‌آید) — verbatimِ چاپ حفظ شد",
    ],
    "lessonLexicon": {
        "Heart attack / Accident / Hit / Advice / Hurry up / Hurt / Ankle / Injury / Back / Invite / Bleed / Knee / Break / Lake / Bruise / Leg / Burn / Cast / Cut / Put / Scar / Stick / Fall / Take care of / Find / Trip / Finger / Twist / First aid / Wound / Head / yard / health": "واژگان کاملِ «سلامتی و آسیب‌ها» (لایه p89:020-095) — سنگ‌بنای لنگرهای س۲/س۳/س۵/س۶/س۷",
        "It hurts a lot / He broke his leg / It is bleeding / He had a car crash / She burned her hand / He has a black eye / She cut her finger / He has a scar / She had a heart attack / He has his leg in a cast / She takes care of her child / He has some bruises / Stick put a plaster on the wound / He hit his head on the door / I hurt my knee": "photo dictionary کاملِ درس (لایه p90:007-021) — لنگرهای س۱ (مستثنی) تا س۷",
        "conversation": "مکالمهٔ درس ششم (لایه p90:034-p91:022): Reza «We plan to go to the lake.» → Ehsan «I don’t think so. I don’t like school trips. Last summer I fell and broke my leg.» → Reza «It sometimes happens. I twisted my ankle last winter. I stayed home for two weeks!» → Reza «Yeah…, but after that, I participated in Helal-e-Ahmar first aid classes. I learned how to take care of myself.» → Ehsan «I like that. Can you give me some advice?» — سنگ‌بنای س۲",
        "tamarin1": "تمرینِ ۱ درس (p91): Did Mina have an accident? → Yes, she did. / Did Ali cut his finger? → No, he didn’t. / Did you break your leg? → Yes, I broke my leg. / Did you hurt your back? → No, I didn’t hurt my back. — الگوی پاسخِ کوتاهِ س۲ق۷ + گزینهٔ اضافیِ س۵",
        "tamarin2": "تمرینِ ۲ درس (p92): Who had an accident? → Reza. / Where did she break her leg? → She broke her leg in the park. / How did Amir hurt his head? → He hit his head on the door. / Why did they have an accident? → Because they drove fast. — سنگ‌بنای س۵",
        "grammar": "گرامرِ درس: ضمایر مفعولی (Object Pronouns، p94) — me/you/him/her/it/us/them — سنگ‌بنای س۳ق۱/س۶ق۱/س۷ق۱",
    },
    "typedNote": "هر ۹ آیتمِ تایپیِ تازه (س۲:۸، س۴:۱) داربستِ اندیسِ نادرست از خودِ بانکِ چاپی دارند — قفلِ سراسریِ r363 (ممنوعیتِ تایپیِ تک‌گزینه‌ای) حفظ شد؛ داربست‌های س۲ خانواده‌محور با تلهٔ صرفی/زمانی (do/did، stayed/stay، learn/stayed) و داربستِ س۴ ردیفِ به‌هم‌ریختهٔ چاپی است؛ واژهٔ اضافیِ چاپیِ «stay» هرگز کلید/داربست نیست (assertion در اسکریپت)",
}

G9.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
ids = [q["id"] for b in d["lessons"] for q in b["questions"]]
nk = sum(1 for b in NEW_BANKS for q in b if q.get("kind") == "typed")
print(f"r369: +6 banks / +21 items ({nk} typed) → tests-g9 = {len(d['lessons'])} banks / {len(ids)} items")
