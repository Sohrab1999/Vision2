# -*- coding: utf-8 -*-
# r352 — رسیدِ vocab360b (بخشِ ۲ از ۳۶۰تستیِ واژگان) — Idempotent
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

PRINT_QUIRKS = [
    "این بانک = سؤال‌های ۱۲۱-۲۴۰ از همان آزمونِ ص۱۷۸-۱۹۴ (بخشِ ۲ از ۳؛ ص۱۸۳-۱۸۸) — بدونِ سربرگِ جدید؛ سربرگِ آزمون در ص۱۷۸ است (r351) و کلیدِ همان جدولِ یک‌صفحه‌ایِ ص۳۰۱ برای هر ۳۶۰ سؤال",
    "گریدِ کلیدِ ص۳۰۱ در این راند به‌صورت برنامه‌ای بازتولید شد (regex حرف-اول: «a 121» — الگوی شماره-اول فقط ۳۵۹/۳۶۰ می‌گرفت؛ یک جفت با خط‌شکستِ متفاوت) و با رکوردِ KEY_RAWِ r351 مقایسه شد: 360/360 AGREE، صفر واگرایی — درسِ r351 («کلید را از حفظ نساز») رعایت شد",
    "فرمتِ گزینه‌ها در ۱۲۱-۲۴۰: همگی پرانتزدار «a) b) c) d)» (ادامهٔ پیچشِ Q39→Q40 از r351؛ پیچشِ بازگشتیِ دوم در این محدوده نیست)",
    "چاپ‌خطایِ گزینه‌نامهٔ Q174: گزینهٔ چهارم در خودِ چاپ با حرفِ «b)» چاپ شده (تکرارِ حرفِ b — باید d می‌بود) و محتوای آن هم تکراریِ گزینهٔ a است («suitably») — داوریِ رندرِ ۱۲۰۰dpi: عینِ چاپ «b) suitably». داده فقط متن را نگه می‌دارد: options = [suitably, probably, honestly, suitably] — کلیدِ c («honestly») مستقل از این خطاست. جراحیِ پیش‌پارس فقط حرفِ گزینهٔ چهارم را برای پارس d کرد (بدونِ آن، پارسر c/d را تا «d) protects» قورت می‌داد و Q175 از پارس سقوط می‌کرد)",
    "پنج سؤالِ دورانِ چندگانهٔ لایه = یک خطِ خط‌چینِ پیوسته در رندرِ ۱۲۰۰dpi → ادغام (قانونِ r349-Q2/r351-Q24): Q143: ۱۰+۱۱=۲۱ (نقطه‌چسبیده) | Q146: ۱۲+۴=۱۶ | Q152: ۹+۱۰=۱۹ | Q158: ۱۰+۱۱=۲۱ (نقطه‌چسبیده) | Q213: ۱۰+۸=۱۸ — بعدِ ادغام هر ۱۲۰ سؤال دقیقاً یک ران (سنز: ۱۲۰ ران/۲۴۳۲ تیره)",
    "چاپ‌غلط‌های عینِ چاپ در stem (حفظِ verbatim): Q152 «different idea» (باید ideas) | Q213 «It's not health to eat» (باید healthy) | Q221 «It's important to became» (باید become) — گزینهٔ «quitted» در Q224-b هم شکلِ چاپیِ جزوه است (حفظِ عینِ چاپ)",
    "بدونِ هیچ ترجمهٔ چاپی در محدوده («ترجمه» ×۰ در ص۱۸۳-۱۸۸ — قرینهٔ بخشِ ۱)؛ آپستروفِ مستقیمِ لایه در سه سؤال (Q144/Q179/Q202 «she's») عینِ لایه حفظ شد — بقیهٔ آپستروف‌ها curlyِ چاپ",
]

RECEIPT = {
    "exam": "۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم — بخش ۲ (ص۱۸۳-۱۸۸)",
    "header": "بدونِ سربرگِ جدید — ادامهٔ «۳۶۰ تست آموزشی واژگان \"درس ۱ تا ۴ - پایه دهم\" (پاسخنامه کلیدی صفحه: ۳۰۱)» از ص۱۷۸ (r351) — ۱۲۰ MCQ (سؤال ۱۲۱-۲۴۰ از ۳۶۰)",
    "keyPages": "301",
    "keyVerification": "print key p301 — بازتولیدِ برنامه‌ایِ حرف-اول (360/360 unique) + AGREE با رکوردِ r351: 360/360، صفر واگرایی؛ spot checks معنایی: Q121 international / Q133 injured / Q143 attractions / Q146 shrines / Q152 respect / Q158 languages / Q174 honestly / Q175 hunts / Q213 prepare / Q220 translate / Q221 familiar / Q222 saving",
    "extractedRound": "r352",
    "pattern": "r351 (بخشِ ۱ همین آزمون — همان پارسرِ دورفرمتِ «a[.)]» و فرفرجهٔ پنجره‌دار) + r350 (بانکِ MCQِ بدونِ ترجمه) + r349/r351 (ادغامِ ران‌های تیرهٔ لایه)",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))
changed = []
if "vocab360b" not in data["source"]:
    data["source"]["vocab360b"] = RECEIPT
    changed.append("receipt vocab360b added")
else:
    assert data["source"]["vocab360b"]["extractedRound"] == "r352"
    print("receipt vocab360b already present — NO-OP")

if changed:
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("; ".join(changed), "| source keys:", len(data["source"]))
