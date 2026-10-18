# -*- coding: utf-8 -*-
# r344 — استخراجِ دو بلوکِ باقی‌ماندهٔ ص۱۲۷-۱۳۰ جزوهٔ دهم به public/jozve/tests-g10.json:
#   بانکِ ۷۵ (lesson 75): «تستهای ضمیر انعکاسی و تاکیدی در کنکورهای سال ۱۳۹۸ تا ۱۴۰۰» (ص۱۲۸) —
#     ۴ MCQ چهارگزینه‌ای با برچسبِ آبیِ کنکورِ درون‌ساقه + کلیدِ توضیح‌دارِ چاپیِ همان صفحه
#     («پاسخنامه تشریحی ۴ تست بالا:» — جعبهٔ زرد) — گریدِ ۳/۱/۳/۳ (صفر-مبنا: 2/0/2/2) — 4/4 صفر واگرایی.
#   بانکِ ۷۶ (lesson 76): «تمرین "افعال حالتی و کنشی"» (ص۱۳۰) — ۱۰ آیتمِ دونگزینه‌ایِ «زیر گزینه صحیح
#     خط بکشید» با Answer Keyِ جدولیِ درون‌متنیِ همان صفحه — 10/10 هم‌رأی — نخستین بانکِ دونگزینه‌ایِ کارتِ دهم.
# داوری‌های رندر (۶۰۰-۳۰۰۰dpi):
#   سربرگِ بلوک: «تستهای ضمیر انعکاسی و تاکیدی در کنکورهای سال ۱۳۹۸ تا ۱۴۰۰» — جعبهٔ صورتی، ارقامِ فارسیِ
#   ۱۳۹۸/۱۴۰۰ با واصفِ «تا»؛ «تاکیدی» بی‌همزه در سربرگ در برابرِ «تأکیدی» همزه‌دار در نکتهٔ ۶ و کلید —
#   ناسازگاریِ خودِ چاپ؛ سربرگِ کلید: «پاسخنامه تشریحی ۴ تست بالا:» (جعبهٔ زرد) — «تسی یچ» لایه = هشتمین
#   تجزیهٔ به‌هم‌ریختگیِ «تشریحی» (r340 ششم، r342 هفتم)؛
#   «باال» لایه = «بالا» چاپ در «هیچگاه بالا فاصله بعد از فاعل» (کلیدِ ۱ و ۴) — لا-لیگاتور در رندرِ ۳۰۰۰dpi —
#   عبارتِ ناهموارِ خودِ چاپ (در مقدمهٔ ص۱۲۷ «به تنهاب» = تجزیهٔ «تنهایی» طبق r341)؛
#   «حتمأ» لایه = «حتماً» چاپ (تنوینِ روی الف — رندرِ ۳۰۰۰dpi)؛ «f sel her» لایه = «herself» چاپ؛
#   نکاتِ سرخِ «(رد گزینه ...)»: نخست فاصله‌دار «(رد گزینه ۱ و۴.)» با نقطهٔ درونِ پرانتز، دوم چسبیده
#   «(رد گزینه۲).» با نقطهٔ بیرونِ پرانتز — ناسازگاریِ خودِ چاپ (برشِ span-محورِ ۳۰۰۰dpi)؛
#   دیاگرامِ کلیدِ ۲: «Gerald and I ourselves forget …» با «ourselves» سرخ؛
#   برچسب‌های آبیِ کنکور با ارقامِ فارسی: Q1 «(کنکور خارج تجربی ۱۴۰۰)» / Q2 «(کنکور ریاضی ۹۹)» /
#   Q3 «(کنکور هنر ۹۹)» / Q4 «(کنکور هنر با اندکی تغییر ۹۸)» — لایه «نکنکور/تجرب/هین/اندگ» = نویز (رندر حاکم)؛
#   تیره‌ها: Q1=۲۱، Q2=۲۱، Q3=۲۰، Q4=۲۱ (شمارشِ لایه حاکم — r338) با سبکِ خط‌چینِ سبزِ چاپ؛
#   آپاستروفِ تایپوگرافیک: doesn’t (Q3)؛
#   تمرینِ ص۱۳۰: سربرگِ «تمرین "افعال حالتی و کنشی". زیر گزینه صحیح خط بکشید.» — «حالتی» با ی در برابرِ
#   سربرگِ بخشِ ص۱۲۹ «افعال حالت و کنشی» (ناسازگاریِ خودِ چاپ)؛ گزینه‌های درونِ پرانتز سرمه‌ای با اسلشِ سرخ
#   (رنگِ تزئینی — برخلافِ r342-B71 کلیدِ رنگ‌نشانه‌ای نیست؛ Answer Keyِ جدولیِ ۲×۵ با سربرگِ سبز حاکم)؛
#   «15» لاتین در Q10 عینِ چاپ؛ آپاستروف‌های don’t/aren’t.
# Idempotent: اجرای دوم NO-OP (مبنا = ۷۴ بانکِ r323-r343 / ۹۵۱ آیتم).
import json
import re
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

D21 = "-" * 21
D20 = "-" * 20

# —— بانکِ ۷۵: ۴ MCQ کنکوریِ ص۱۲۸ — (ساقه با برچسبِ درون‌ساقه، گزینه‌ها، کلیدِ صفر-مبنا)
REFL_ITEMS = [
    (f"We spent a week in Istanbul, and then a month in a village. The villagers {D21} were very welcoming. (کنکور خارج تجربی ۱۴۰۰)",
     ["they", "them", "themselves", "who they"], 2),
    (f"Gerald {D21} forgot to lock the door the night our restaurant was robbed. (کنکور ریاضی ۹۹)",
     ["and I", "or myself", "and I themselves", "himself and myself"], 0),
    (f"When a student doesn’t listen to the teacher in class and talks to others, she prevents {D20} and others from learning. (کنکور هنر ۹۹)",
     ["it", "those", "herself", "themselves"], 2),
    (f"A: Did anyone help them do the project? B: No, those college students, Ted and Tom, {D21} did the project. (کنکور هنر با اندکی تغییر ۹۸)",
     ["ourselves", "they", "themselves", "were those"], 2),
]
# گریدِ چاپیِ «پاسخنامه تشریحی ۴ تست بالا:»: ۳/۱/۳/۳ (یک-مبنا) → صفر-مبنا: 2/0/2/2
REFL_GRID = [2, 0, 2, 2]

# —— بانکِ ۷۶: ۱۰ دونگزینه‌ایِ ص۱۳۰ — (ساقه با پرانتزِ عینِ چاپ، دو گزینه، کلیدِ صفر-مبنا)
VERB_ITEMS = [
    ("I don’t know him but he (seems / is seeming) like such a nice boy.", ["seems", "is seeming"], 0),
    ("I (have / am having) dinner with my friends now. Can you call me later?", ["have", "am having"], 1),
    ("I eat a lot of chocolate because I (love / am loving) sweets.", ["love", "am loving"], 0),
    ("My coffee (tastes / is tasting) bitter. Pass me the sugar, please.", ["tastes", "is tasting"], 0),
    ("Maryam (studies / is studying) English with her mother at the moment.", ["studies", "is studying"], 1),
    ("Why (don’t you remember / aren’t you remembering) my family name?", ["don’t you remember", "aren’t you remembering"], 0),
    ("I had dinner and (was watching / watched) TV for a couple of hours.", ["was watching", "watched"], 1),
    ("I (need / am needing) to do some shopping on my way home from work.", ["need", "am needing"], 0),
    ("He (is liking / likes) to spend his evenings in front of the television.", ["is liking", "likes"], 1),
    ("We (were cooking / cooked) all morning because we had 15 people coming for lunch.", ["were cooking", "cooked"], 0),
]
# کلیدِ چاپیِ «Answer Key:» جدولِ ۲×۵ (همان صفحه)
VERB_KEY_WORDS = ["seems", "am having", "love", "tastes", "is studying",
                  "don’t you remember", "watched", "need", "likes", "were cooking"]

# —— قفل‌های درونی — بانک ۷۵
for i, (stem, _, key) in enumerate(REFL_ITEMS):
    runs = [len(m.group()) for m in re.finditer(r"-{6,}", stem)]
    assert runs == [[21], [21], [20], [21]][i], f"refl Q{i+1}: dashes {runs} != printed"
    assert key == REFL_GRID[i], f"refl Q{i+1}: key {key} != printed grid {REFL_GRID[i]}"
assert "doesn’t" in REFL_ITEMS[2][0] and "doesn't" not in REFL_ITEMS[2][0]
assert "(کنکور خارج تجربی ۱۴۰۰)" in REFL_ITEMS[0][0]
assert "(کنکور ریاضی ۹۹)" in REFL_ITEMS[1][0]
assert "(کنکور هنر ۹۹)" in REFL_ITEMS[2][0]
assert "(کنکور هنر با اندکی تغییر ۹۸)" in REFL_ITEMS[3][0]

# —— قفل‌های درونی — بانک ۷۶
for i, (stem, opts, key) in enumerate(VERB_ITEMS):
    assert len(opts) == 2, f"verb Q{i+1}: not 2 options"
    assert opts[key] == VERB_KEY_WORDS[i], f"verb Q{i+1}: key word mismatch"
    assert f"({opts[0]} / {opts[1]})" in stem, f"verb Q{i+1}: inline parens not verbatim"
assert "15" in VERB_ITEMS[9][0] and "۱۵" not in VERB_ITEMS[9][0]      # رقمِ لاتینِ عینِ چاپ
assert "don’t" in VERB_ITEMS[0][0] and "aren’t" in VERB_ITEMS[5][0]

REFL_QUIRKS = [
    "سربرگِ چاپیِ ص۱۲۸: «تستهای ضمیر انعکاسی و تاکیدی در کنکورهای سال ۱۳۹۸ تا ۱۴۰۰» — جعبهٔ صورتی، ارقامِ فارسیِ ۱۳۹۸/۱۴۰۰ با واصفِ «تا»؛ «تاکیدی» بی‌همزه در سربرگ در برابرِ «تأکیدی» همزه‌دار در نکتهٔ ۶ همان صفحه و در کلید — ناسازگاریِ خودِ چاپ؛ «انعکایس» لایه = «انعکاسی» چاپ",
    "سربرگِ کلید (جعبهٔ زردِ همان صفحه): «پاسخنامه تشریحی ۴ تست بالا:» — «تسی یچ» لایه = هشتمین تجزیهٔ به‌هم‌ریختگیِ «تشریحی» (r340 ششم، r342 هفتم)؛ کلیدِ درون‌متنیِ زیرِ خودِ تست‌ها — نه صفحاتِ انتهایی؛ گریدِ ۳/۱/۳/۳",
    "«باال» لایه = «بالا» چاپ در «هیچگاه بالا فاصله بعد از فاعل» (کلیدِ ۱ و ۴) — لا-لیگاتور در رندرِ ۳۰۰۰dpi؛ عبارتِ ناهموارِ خودِ چاپ (ظاهراً «با فاصله» مقصود بوده) — عینِ چاپ محفوظ؛ در مقدمهٔ ص۱۲۷ «به تنهاب» = تجزیهٔ «تنهایی» (خانوادهٔ r341)",
    "نکاتِ سرخِ «(رد گزینه ...)» در کلید: نخستِ هر مدخل فاصله‌دار «(رد گزینه ۱ و۴.)» با نقطهٔ درونِ پرانتز، دومی چسبیده «(رد گزینه۲).» با نقطهٔ بیرونِ پرانتز — ناسازگاریِ نقطه‌گذاری/فاصله‌گذاریِ خودِ چاپ (برشِ span-محورِ ۳۰۰۰dpi: span « (رد گزینه2» + « )»)",
    "«حتمأ» لایه = «حتماً» چاپ (تنوینِ روی الفِ پایانی — رندرِ ۳۰۰۰dpi)؛ «ضمیر تاکیدی» بی‌همزه در همان جمله در برابرِ «تأکیدی» همزه‌دار در جملهٔ بعدیِ همان مدخلِ ۲",
    "دیاگرامِ کلیدِ ۲: «Gerald and I ourselves forget …» — ساختارِ ساقه+ضمیرِ تأکیدی با «ourselves» سرخ؛ «f sel her» لایه در مدخلِ ۳ = «herself» چاپ (به‌هم‌ریختگیِ OCR)",
    "برچسب‌های آبیِ کنکور با ارقامِ فارسی — درون‌ساقه به الگوی r322/r343: Q1 «(کنکور خارج تجربی ۱۴۰۰)»، Q2 «(کنکور ریاضی ۹۹)»، Q3 «(کنکور هنر ۹۹)»، Q4 «(کنکور هنر با اندکی تغییر ۹۸)» — لایه «نکنکور/تجرب/هین/اندگ تغییر» = نویزِ OCR (رندر حاکم: «ریاضی/تجربی/هنر/اندکی»)",
    "تیره‌ها: Q1=۲۱، Q2=۲۱، Q3=۲۰، Q4=۲۱ (شمارشِ لایه حاکم — r338)؛ سبکِ چاپِ جای‌خالی خط‌چینِ سبزِ پیوسته است (در رونویسی با تیرهٔ یونیکد)؛ آپاستروفِ تایپوگرافیکِ doesn’t در Q3",
    "بدونِ ترجمهٔ چاپی برای این ۴ تست (برخلافِ r334/r339/r341/r343) — کلید فقط توضیحِ فارسی دارد؛ غیبتِ صادقانه",
]

VERB_QUIRKS = [
    "سربرگِ چاپیِ ص۱۳۰: «تمرین \"افعال حالتی و کنشی\". زیر گزینه صحیح خط بکشید.» — عنوانِ سرخِ نقل‌قولی؛ «حالتی» با ی در برابرِ سربرگِ بخشِ ص۱۲۹ «افعال حالت و کنشی» بدونِ ی — ناسازگاریِ خودِ چاپ",
    "نخستین بانکِ دونگزینه‌ایِ کارتِ دهم: هر آیتم دقیقاً دو گزینه درونِ پرانتز (options.length=2 — موتور با برچسبِ a/b)؛ ساقه‌ها پرانتزِ عینِ چاپ را هم نگه می‌دارند",
    "گزینه‌های درونِ پرانتز سرمه‌ای با اسلشِ سرخ و شماره‌های سرخ — رنگِ تزئینی است (برخلافِ r342-B71 کلیدِ رنگ‌نشانه‌ای نیست)؛ حاکم: Answer Keyِ جدولی",
    "Answer Key: جدولِ ۲×۵ با سربرگِ سبزِ «Answer Key:» در همان صفحه — کلیدِ درون‌متنی (نه صفحاتِ انتهایی): seems/am having/love/tastes/is studying/don’t you remember/watched/need/likes/were cooking — 10/10 هم‌رأی",
    "«15» لاتین در Q10 «we had 15 people coming for lunch» — عینِ چاپ (لایه هم لاتین)؛ آپاستروف‌های تایپوگرافیکِ don’t/aren’t در Q1/Q6",
]

REFL_RECEIPT = {
    "exam": "تستهای ضمیر انعکاسی و تاکیدی در کنکورهای سال ۱۳۹۸ تا ۱۴۰۰ (ص۱۲۸)",
    "header": "سربرگِ چاپیِ ص۱۲۸: «تستهای ضمیر انعکاسی و تاکیدی در کنکورهای سال ۱۳۹۸ تا ۱۴۰۰» — جعبهٔ صورتی با ارقامِ فارسیِ ۱۳۹۸/۱۴۰۰ — ۴ MCQ کنکوری",
    "keyPages": "128",
    "keyVerification": "print key p128 «پاسخنامه تشریحی ۴ تست بالا:» — ۴ مدخلِ توضیح‌دار با نکاتِ سرخِ «(رد گزینه ...)» — 4/4 agree with semantic pre-fill, zero divergence (گریدِ ۳/۱/۳/۳)",
    "extractedRound": "r344",
    "pattern": "r343/r322 (برچسبِ کنکورِ درون‌ساقه) — MCQ چهارگزینه‌ایِ بدونِ ترجمهٔ چاپی (کلیدِ توضیح‌دارِ همان صفحه)",
    "printQuirks": REFL_QUIRKS,
}

VERB_RECEIPT = {
    "exam": "تمرین \"افعال حالتی و کنشی\" (ص۱۳۰)",
    "header": "سربرگِ چاپیِ ص۱۳۰: «تمرین \"افعال حالتی و کنشی\". زیر گزینه صحیح خط بکشید.» — عنوانِ سرخِ نقل‌قولی — ۱۰ آیتمِ دونگزینه‌ای",
    "keyPages": "130",
    "keyVerification": "print key p130 «Answer Key:» جدولِ ۲×۵ در همان صفحه — 10/10 agree with semantic pre-fill, zero divergence",
    "extractedRound": "r344",
    "pattern": "MCQ دونگزینه‌ای — نخستین بانکِ دونگزینه‌ایِ کارتِ دهم (options.length=2)؛ ساقه با پرانتزِ عینِ چاپ",
    "printQuirks": VERB_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))

has75 = [l for l in data["lessons"] if l["lesson"] == 75]
has76 = [l for l in data["lessons"] if l["lesson"] == 76]
if has75 and has76:
    print(f"lessons 75/76 already present ({has75[0]['count']}/{has76[0]['count']} items) — NO-OP")
else:
    assert len(data["lessons"]) == 74, f"baseline mismatch: {len(data['lessons'])} banks"
    assert sum(l["count"] for l in data["lessons"]) == 951, "baseline item count mismatch"

    if not has75:
        qs = []
        for i, (stem, opts, key) in enumerate(REFL_ITEMS):
            qs.append({
                "id": f"g10-l75-{i + 1}", "n": i + 1, "category": "grammar",
                "question": stem, "options": opts, "answer": key,
            })
        bank75 = {
            "lesson": 75,
            "title": "کنکور ۹۸-۱۴۰۰ — تستهای ضمیر انعکاسی و تاکیدی (ص۱۲۸)",
            "level": "کنکوری — چهارگزینه‌ای", "count": len(qs), "questions": qs,
        }
        data["lessons"].append(bank75)
        data["source"]["refl1"] = REFL_RECEIPT

    if not has76:
        qs = []
        for i, (stem, opts, key) in enumerate(VERB_ITEMS):
            qs.append({
                "id": f"g10-l76-{i + 1}", "n": i + 1, "category": "grammar",
                "question": stem, "options": opts, "answer": key,
            })
        bank76 = {
            "lesson": 76,
            "title": "تمرین افعال حالتی و کنشی (ص۱۳۰)",
            "level": "تمرین — دونگزینه‌ایِ خط‌بکشید", "count": len(qs), "questions": qs,
        }
        data["lessons"].append(bank76)
        data["source"]["verb1"] = VERB_RECEIPT

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lessons 75/76: {bank75['count']}+{bank76['count']} items → banks={len(data['lessons'])}, total={total}")
