# -*- coding: utf-8 -*-
# r350 — ثبتِ رسیدِ gram14 (آزمونِ ۱۰۰تستیِ گرامرِ درس ۱-۴) در source/tests-g10.json — Idempotent
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

PRINT_QUIRKS = [
    "جلدِ ص۱۷۱ خانواده: «Grammar Tests / Vision 1 / (Lesson: 1-4)» سرمه‌ایِ ایتالیک روی نوارِ زرد + «Vision 1» سرخِ بزرگ + «سطح تستها: متوسط و استاندارد» — ولی سربرگِ خودِ آزمونِ ص۱۷۲: «سطح تستها \"متوسط\" و \"کنکوری\"» («متوسط» سبزِ نقل‌قولی، «کنکوری» سرخِ نقل‌قولی؛ رندرِ ۹۰۰dpi حاکم) — آزمونِ «متوسط و کنکوری» است نه استاندارد",
    "سربرگِ چاپیِ ص۱۷۲: «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ - پایه دهم» با «۱۰۰» سرخ و «ست ت» لایه (= تست) + «:(پاسخنامه کلیدی صفحه ۳۰۰)» با رقمِ لاتینِ ۳۰۰ در لایه (چاپ: فارسی)",
    "سربرگِ کلیدِ ص۳۰۰: «پاسخنامه تستهای گرامر\"درس یک تا چهار - پایه دهم (سؤاالت صفحه ۱۷۲ تا ۱۷۶)» — «سؤاالت» = پانزدهمین تجزیهٔ لیگاتورِ مستندشده (r349؛ چاپ تمیز)؛ جعبهٔ Noteِ خالیِ تیره‌دارِ زیرِ سربرگ استخراج نشد (قرینهٔ r348/r349)",
    "کلید = جدولِ ۱۰×۱۰ (سطرها ۱-۹، ستون‌ها ده‌تایی نزولی) با ارقامِ لاتینِ مشکی و حروفِ سرخ — گریدِ کاملِ ۱۰۰تایی با regex چندالگویی یکجا: ۱۰۰/۱۰۰ بدونِ تکرار/نقص (key-grid-g10-l14-r350.py)؛ 100/100 agree with semantic pre-fill — صفر واگرایی (الگوی r323)",
    "جای‌خالی‌ها تیره‌چینِ سبز (خط‌چین)؛ لایه ران‌های ممتدِ ۷-۲۳تایی بدونِ هیچ بریدگیِ بین‌خطی می‌دهد — ۱۵۰ رانِ ≥۳ بر ۱۰۰ ساقه عینِ لایه حفظ شد؛ حروفِ گزینه‌ها کادرِ آبیِ روشن؛ شمارهٔ سؤال‌ها سرخ",
    "نویزهای لایه که رندر حکم کرد: Q14 خطِ نویزِ «a       » پیش از «a) on» (حذف)؛ Q93 حرفِ گزینهٔ «a(» با پرانتزِ باز (گزینه: were leaving)؛ Q96 حروفِ سربارِ «B»/«D» در انتهای گزینه‌های a/c نویزِ لایه‌اند — رندرِ ۱۲۰۰dpi گزینه‌های تمیز نشان داد",
    "دو سؤالِ «Which sentence is grammatically WRONG?» (Q81/Q96) — «WRONG» در چاپ زیرخط‌دار؛ Q81 کلیدِ b «He went to a new school at London.» (at London = خطایِ هدف)؛ Q96 کلیدِ c «Most students have lunch on school.»",
    "چاپ‌غلط‌ها/کوئیرک‌های عینِ چاپ (رندر ۱۲۰۰dpi تأیید): Q28 «by his own's» (باید on his own)؛ Q34 «Do you like Swimming?» Sِ بزرگ؛ Q42 ساقه با نقطه پایان می‌یابد («... in the world.»)؛ Q44 «My Father a good manager.» (فعلِ اسنادی نیامده + Fِ بزرگ)؛ Q49 «tomorrow. but» بِ کوچک؛ Q64 «Marry» (املای چاپِ Mary) + «NO,» بزرگ؛ Q97 «since 1363» رقمِ لاتینِ سالِ شمسی؛ Q30 «speak / won’t» جفتِ ناهماهنگِ خودِ چاپ",
    "Q88 گزینه‌ها عینِ چاپ: a) old wooden / small lovely old، b) old wooden / lovely small old (کلید — ترتیبِ صفتِ درست)، c) wooden old / small lovely old، d) wooden old / lovely old small",
    "Q99 سه‌جای‌خالی: «Mark has three -----------, ----------- boy and two girls. ---------- boy is 7 years old and their girls are 3.» — کلیدِ b «children / a / The»",
    "بدونِ هیچ ترجمهٔ چاپی در صفحاتِ سؤال (بررسی: «ترجمه» ×۰ در ص۱۷۲-۱۷۶) — بانکِ بدونِ translation (قرینهٔ r334)؛ مجموعِ tests-g10 = ۱۳۴۶ در ۹۷ بانک",
]

RECEIPT = {
    "exam": "۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ - پایه دهم (ص۱۷۲-۱۷۶)",
    "header": "جلدِ ص۱۷۱: «Grammar Tests / Vision 1 / (Lesson: 1-4) / سطح تستها: متوسط و استاندارد» + سربرگِ چاپیِ ص۱۷۲: «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ - پایه دهم (پاسخنامه کلیدی صفحه ۳۰۰)» + «سطح تستها \"متوسط\" و \"کنکوری\"» — ۱۰۰ MCQ",
    "keyPages": "300",
    "keyVerification": "print key p300 «پاسخنامه تستهای گرامر درس یک تا چهار - پایه دهم (سؤالات: صفحه ۱۷۲ تا ۱۷۶)» — کلیدِ جدولیِ ۱۰×۱۰ با ارقامِ لاتین — 100/100 agree with semantic pre-fill, zero divergence",
    "extractedRound": "r350",
    "pattern": "r349 (بانکِ MCQِ درس‌محور) + r334 (گرامرِ بدونِ ترجمهٔ چاپی) + r322 (عینِ چاپ)",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))
if "gram14" in data["source"]:
    assert data["source"]["gram14"]["extractedRound"] == "r350"
    print("receipt gram14 already present — NO-OP")
else:
    data["source"]["gram14"] = RECEIPT
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("receipt gram14 added; source keys:", len(data["source"]))
