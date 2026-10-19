#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r370 — «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس اول (pdf-p50) + خانوادهٔ درس دوم (pdf-p56)
→ ساختِ public/jozve/tests-g7.json (نخستین فایلِ تستِ پایهٔ هفتم)

خانوادهٔ ۱ (درس اول، ۵ سکشن) — ۲ بانک/۱۲ آیتم:
  س۱ (۱۱ MCQ دوگزینه‌ای) — «شکل کوچک و بزرگ حروف زیر را در نقطه چین جلوی آن بنویسید»:
      چاپ: A b K q R m X o D v G (لایهٔ p50:028 + رندر). چرا MCQ و نه تایپی:
      موتورِ پاسخِ تایپی case-insensitive است (src/lib/typed-answer.ts → normalizeTypedAnswer
      با toLowerCase) و تبدیلِ کوچک/بزرگ را سنجش‌ناپذیر می‌کند؛ انتخابِ کلیکیِ MCQ اندیس‌محور
      و دقیق است. گزینه‌ها = [شکلِ خواسته‌شده، خودِ حرفِ چاپی] — تلهٔ «همان‌حرفی‌نوشتن»؛
      چینشِ یک‌درمیان (فرد: هدف اول/جواب 0، زوج: حرفِ چاپی اول/جواب 1) تا الگو حدس‌زدنی نباشد
  س۳ (۱ MCQ چهارگزینه‌ایِ چاپی) — «کدام گزینه با بقیه متفاوت است»: green/blue/black/book → book
      (تنها غیرِ رنگ)
  مستثنی: س۲ تصویری (واژه‌ای که با B شروع می‌شود — چهار تصویر و چندپاسخِ چاپی)،
          س۴ تولیدِ آزاد (مشخصاتِ خودِ یادگیرنده)، س۵ تصویری (Mr./Miss با عکس)
خانوادهٔ ۲ (درس دوم، ۵ سکشن) — ۲ بانک/۸ آیتم:
  س۲ (۳ MCQ سه‌گزینه‌ای) — نام‌سازی از حروفِ چیپ‌های چاپی:
      (a n a h m)→Mahan، (a b a r k)→Akbar، (n a o m)→Mona؛ ردیفِ ۴ حذفِ آیتمی:
      چیپ‌های چاپی «a n a h m» (کپیِ ردیفِ ۱) هیچ‌یک از Akbar/Kobra/Kasra را نمی‌سازد — نقصِ چاپ
  س۵ (۵ MCQ شش‌گزینه‌ایِ مشترکِ چاپی) — وصل‌کردنیِ پایانِ جمله: ستونِ راست ۶ پاسخ برای
      ۵ ساقه؛ اضافیِ چاپی: Hello. (هرگز کلید نیست — گارد)؛ ستون‌ها فقط در رندرند (لایه ندارد)
  مستثنی: س۱ علامت‌گذاریِ دایره/زیرخطِ نام/نام‌خانوادگی (تبدیلِ MCQ نیازمندِ گزینهٔ غیرچاپی یا
          نخستینِ گزینهٔ فارسی — مستثنی + فرصت)، س۳/س۴ تصویری-وابسته (ص/غ و she/he — کلید در تصویر)
هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست — کلیدها استنتاجیِ مستند (رسید g7exam1/g7exam2).
نقشهٔ ۸ خانوادهٔ امتحانیِ g7 (ص۵۰/۵۶/۶۵/۷۴/۸۴/۹۰/۹۷/۱۰۳ — درسِ ۱-۸) در رسیدِ g7familyMap.
idempotent: اجرای دوم NO-OP.
"""
import json
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g7.json"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g7exam1" in d.get("source", {}):
    print("r370: receipt g7exam1 already present — NO-OP")
    raise SystemExit(0)


def q(id_: str, n: int, question: str, options: list[str], answer: int, level: str):
    return {
        "id": id_,
        "n": n,
        "category": "vocab",
        "question": question,
        "options": options,
        "answer": answer,
    }


# ————— خانوادهٔ ۱ / س۱ — یازده حرفِ چاپی: A b K q R m X o D v G —————
LETTERS = ["A", "b", "K", "q", "R", "m", "X", "o", "D", "v", "G"]
s1_questions = []
for i, ch in enumerate(LETTERS):
    target = ch.lower() if ch.isupper() else ch.upper()
    n = i + 1
    # چینشِ یک‌درمیان: فرد → [هدف، خودِ حرف] جواب 0؛ زوج → [خودِ حرف، هدف] جواب 1
    opts = [target, ch] if n % 2 == 1 else [ch, target]
    ans = 0 if n % 2 == 1 else 1
    s1_questions.append(q(f"g7-l1-{n}", n, f"{ch} → -------", opts, ans, "دوگزینه‌ای"))

bank1 = {
    "lesson": 1,
    "title": "امتحانی درس اول — شکل کوچک و بزرگ حروف (س۱، ص۵۰)",
    "level": "دوگزینه‌ای",
    "count": 11,
    "questions": s1_questions,
}

bank2 = {
    "lesson": 2,
    "title": "امتحانی درس اول — کلمهٔ ناهماهنگ (س۳، ص۵۰)",
    "level": "چهارگزینه‌ای",
    "count": 1,
    "questions": [
        q("g7-l2-1", 1, "green – blue – black – book", ["green", "blue", "black", "book"], 3, "چهارگزینه‌ای"),
    ],
}

# ————— خانوادهٔ ۲ / س۲ — نام‌سازی از حروفِ چیپ‌های چاپی (ردیفِ ۴ حذف: نقصِ چاپ) —————
ANAGRAMS = [
    ("a n a h m", ["Mahsa", "Mahin", "Mahan"], 2),
    ("a b a r k", ["Arash", "Armin", "Akbar"], 2),
    ("n a o m", ["Mina", "Mona", "Amin"], 1),
]
bank3 = {
    "lesson": 3,
    "title": "امتحانی درس دوم — نام‌سازی از حروفِ داده‌شده (س۲، ص۵۶)",
    "level": "سه‌گزینه‌ای",
    "count": 3,
    "questions": [
        q(f"g7-l3-{i + 1}", i + 1, f"{letters} → ?", opts, ans, "سه‌گزینه‌ای")
        for i, (letters, opts, ans) in enumerate(ANAGRAMS)
    ],
}

# ————— خانوادهٔ ۲ / س۵ — وصل‌کردنیِ پایانِ جمله (ستون‌ها از رندر — لایه ندارد) —————
MATCH_OPTS = ["morning.", "Thanks.", "is Majidi.", "your name?", "Hello.", "Ali Karimi."]
MATCH = [
    ("My name is ……. .", 5),
    ("What's ……… .", 3),
    ("Fine, ……", 1),
    ("Good ……. .", 0),
    ("My last name ……. .", 2),
]
bank4 = {
    "lesson": 4,
    "title": "امتحانی درس دوم — وصل‌کردنیِ پایانِ جمله (س۵، ص۵۶)",
    "level": "شش‌گزینه‌ای",
    "count": 5,
    "questions": [
        q(f"g7-l4-{i + 1}", i + 1, f"{stem} ( ------- )", list(MATCH_OPTS), ans, "شش‌گزینه‌ای")
        for i, (stem, ans) in enumerate(MATCH)
    ],
}

receipt1 = {
    "extractedRound": "r370",
    "section": "نمونه سؤالات امتحانی درس اول پایه هفتم",
    "examPages": "pdf-p50 (فوترِ خودِ اسکن: ۵۰) — خانوادهٔ یک‌صفحه‌ای؛ ص۵۱ جدولِ واژگانِ درس اول است و پایینِ آن سربرگِ «واژگان و نکات دستوری درس دوم» — مرزِ پایینیِ خانواده",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست (کل جزوه پاسخنامه ندارد — جست‌وجوی کلِ لایه: صفر hit «پاسخنامه»)؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 5,
    "sectionsExtracted": 2,
    "sectionsSkipped": 3,
    "items": 12,
    "bankCounts": [11, 1],
    "keyPolicy": "کلیدِ استنتاجیِ ساختاری: س۱ = تبدیلِ کوچک/بزرگِ خودِ حرفِ چاپی (خوداعتبارسنجی — الگوی r357/r364 س۶/س۱۱)؛ س۳ = odd-one-outِ موضوعی (رنگ در برابرِ اشیاء)",
    "engineNote": "س۱ عمداً MCQ دوگزینه‌ای شد نه تایپی: موتورِ پاسخِ تایپی case-insensitive است (src/lib/typed-answer.ts → normalizeTypedAnswer با toLowerCase) و تبدیلِ کوچک/بزرگ را سنجش‌ناپذیر می‌کند؛ در MCQ انتخابِ کلیکیِ اندیس‌محور است و تفاوتِ a/A دقیق دیده می‌شود. گزینهٔ دومِ هر آیتم = خودِ حرفِ چاپی (تلهٔ «همان‌حرفی‌نوشتن»)؛ چینشِ یک‌درمیان (فرد: هدف اول/جواب 0، زوج: حرفِ چاپی اول/جواب 1) تا الگوی «جوابِ همیشه‌اول» حدس‌زدنی نباشد",
    "derivedKeys": {
        "S1": [f"{ch} → {ch.lower() if ch.isupper() else ch.upper()} (تبدیلِ حرفِ چاپی به شکلِ دیگر)" for ch in LETTERS],
        "S3": ["book = تنها غیرِ رنگ میانِ green/blue/black — سه رنگ از واژگانِ خودِ درس اول"],
    },
    "skippedSections": [
        "س۲ تصویری: «واژه انگلیسی کدام یک از تصاویر زیر با حرف B شروع می شود» — چهار تصویر (کتاب/کیف/وایت‌برد/پاک‌کن) و چندپاسخِ چاپی هم هست (book/bag/blackboard هر سه با B آغاز می‌شوند) — الگوی r364-369",
        "س۴ تولیدِ آزاد: «مشخصات خود را بصورت صحیح در جای خالی به انگلیسی بنویسید» (First name/last name) — بی‌کلیدِ چاپی",
        "س۵ تصویری: کامل‌کردن با (Mr. - Miss) با دو عکس (پسر/دخترِ محجبه)",
    ],
    "printQuirks": [
        "خانوادهٔ امتحانیِ g7 یک‌صفحه‌ای است (در برابرِ ۳-صفحه‌ای‌های g9) — امتحانِ درسِ الفباست",
        "ساقه‌های س۱ در لایهٔ متنی verbatim است (p50:028: «A……     b……    K……    q……   R……    m……    X……    o……   D……    v……    G……») و با رندرِ ۱۵۰dpi راستی‌آزمایی شد",
    ],
}

receipt2 = {
    "extractedRound": "r370",
    "section": "نمونه سؤالات امتحانی درس دوم پایه هفتم",
    "examPages": "pdf-p56 (فوترِ خودِ اسکن: ۵۶) — خانوادهٔ یک‌صفحه‌ای؛ ص۵۷ جدولِ واژگانِ درس دوم است (مرز)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 5,
    "sectionsExtracted": 2,
    "sectionsSkipped": 3,
    "items": 8,
    "bankCounts": [3, 5],
    "wordBank": MATCH_OPTS,
    "extraWords": ["Hello."],
    "keyPolicy": "کلیدِ استنتاجیِ ساختاری/مکالمه‌محور: س۲ = تنها نامی که دقیقاً از حروفِ چیپ‌های چاپی ساخته می‌شود (آنالیزِ چندمجموعه‌ای)؛ س۵ = تکمیلِ جفتِ ساقه/پایان با انسجامِ مکالمه‌ایِ درسِ معرفی و احوال‌پرسی",
    "derivedKeys": {
        "S2": [
            "(a n a h m) → Mahan: m,a,h,a,n — Mahsa حرفِ s اضافه دارد و Mahin حرفِ i",
            "(a b a r k) → Akbar: a,k,b,a,r — Arash حرفِ s/h دارد و Armin حرفِ i/m/n",
            "(n a o m) → Mona: m,o,n,a — Mina و Amin حرفِ i دارند که در چیپ‌ها نیست",
        ],
        "S5": [
            "My name is → Ali Karimi. (تنها «نامِ کامل»؛ is Majidi ساختارِ نامِ خانوادگی دارد)",
            "What's → your name? (تنها دنباله‌ای که پرسشِ «اسمت چیه؟» می‌سازد)",
            "Fine, → Thanks. (پاسخِ احوال‌پرسیِ درس)",
            "Good → morning. (تنها بخشِ روز)",
            "My last name → is Majidi. (فعلِ is + نامِ خانوادگی)",
        ],
    },
    "skippedSections": [
        "س۱ علامت‌گذاریِ دایره/زیرخطِ نام/نام‌خانوادگی (Kamali/Mobina/Mahsa/Mohammadi/Majidi/Ayda/Hani/Saro) — تبدیلِ MCQ نیازمندِ گزینهٔ غیرچاپی یا نخستینِ گزینهٔ فارسیِ کارت است؛ مستثنی + فرصتِ مستقلِ ثبت‌شده",
        "س۳ تصویری-وابسته: ص/غ با چهار تصویر (classroom/teacher/eraser/backpack) — ساقه‌های چاپی‌اند (it is a classroom/She is a teacher/It is an eraser/It is a backpack) ولی کلید در تصویر است نه در ساقه",
        "س۴ تصویری-وابسته: کامل‌کردن با she/he با دو عکس (Mina/معلمِ پای تخته)",
        "س۲ردیفِ ۴ حذفِ آیتمی: چیپ‌های چاپی «a n a h m» (کپیِ ردیفِ ۱) هیچ‌یک از Akbar/Kobra/Kasra را نمی‌سازد — نقصِ چاپ (الگویِ بی‌اعتباریِ r366 س۷ق۷)",
    ],
    "printQuirks": [
        "چیپ‌های ردیفِ ۴ = کپیِ ردیفِ ۱ (a n a h m) — نقصِ چاپ",
        "ستونِ چپ ۵ ساقه و ستونِ راست ۶ پاسخ — «Hello.» اضافیِ چاپی است؛ در گارد never-key قفل شد",
        "ستون‌های س۵ فقط در رندرند (لایهٔ متنیِ ص۵۶ سکشنِ ۵ را ندارد) — خوانده از رندرِ ۱۵۰/۲۲۰dpi",
        "What's با آپاستروفِ راست‌سادهٔ چاپ (') — verbatim",
    ],
}

receipt_map = {
    "extractedRound": "r370",
    "note": "نقشهٔ ۸ خانوادهٔ «نمونه سؤالات امتحانی» جزوهٔ هفتم — از جست‌وجوی لایه؛ سربرگ‌های دوخطی (مثل «درس\nدوم») با جست‌وجوی دوسطری یافت شدند",
    "families": [
        {"lesson": "درس اول", "pdfPage": 50, "round": "r370", "status": "استخراج شد — ۲ بانک/۱۲ آیتم از ۵ سکشن"},
        {"lesson": "درس دوم", "pdfPage": 56, "round": "r370", "status": "استخراج شد — ۲ بانک/۸ آیتم از ۵ سکشن"},
        {"lesson": "درس سوم", "pdfPage": 65, "round": None, "status": "در انتظار راند بعد"},
        {"lesson": "درس چهارم", "pdfPage": 74, "round": None, "status": "در انتظار راند بعد"},
        {"lesson": "درس پنجم", "pdfPage": 84, "round": None, "status": "در انتظار راند بعد"},
        {"lesson": "درس ششم", "pdfPage": 90, "round": None, "status": "در انتظار راند بعد"},
        {"lesson": "درس هفتم", "pdfPage": 97, "round": None, "status": "در انتظار راند بعد"},
        {"lesson": "درس هشتم", "pdfPage": 103, "round": None, "status": "در انتظار راند بعد — نزدیکِ انتهای جزوه (۱۰۴ صفحه)"},
    ],
    "g8Note": "جزوهٔ هشتم هم ۷ خانواده دارد (pdf-p18/27/35/41/50/60/72) — کارتِ تستِ هشتم پس از g7؛ همتایانِ کامل‌اند، نه غایب (پاسخِ پروبِ r369)",
}

d = {
    "grade": 7,
    "title": "جزوه دکتر حسن لطفی — پایه هفتم",
    "lessons": [bank1, bank2, bank3, bank4],
    "source": {
        "g7exam1": receipt1,
        "g7exam2": receipt2,
        "g7familyMap": receipt_map,
    },
}

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r370: tests-g7.json written — {len(d['lessons'])} banks / {total} items")
