# -*- coding: utf-8 -*-
# r351 — رسیدِ vocab360a (بخشِ ۱ از ۳۶۰تستیِ واژگان) + بستنِ رسمیِ رگرسیونِ tags r283 — Idempotent
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

PRINT_QUIRKS = [
    "سربرگِ چاپیِ ص۱۷۸: «۳۶۰ تست آموزشی واژگان \"درس ۱ تا ۴ - پایه دهم\"» با «۳۶۰» لایه «3۶0» (رقمِ فارسیِ وسط) + «(پاسخنامه کلیدی صفحه: ۳۰۱)» + «سطح تستها: \"آموزشی\" و \"متوسط\"» — داوریِ رندرِ ۹۰۰dpi: «آموزشی» سرخِ نقل‌قولی و «متوسط» مشکیِ نقل‌قولی (لایه «ی آموزیس» = تجزیهٔ «آموزشی») — دو سطحِ نقل‌قولی (الگوی r343؛ برخلافِ r349 تک‌سطح)",
    "کلید = جدولِ ص۳۰۱ — هر ۳۶۰ جفت در یک صفحه (یکتا، بدونِ نقص، بدونِ واگرایی با پیش‌پرکردنِ معنایی: Q1 instead / Q2 gain / Q24 sites / Q25 cradle / Q40 hurt) — رکوردِ گریدِ خانواده (r350: ۱۰۰؛ این راند: ۳۶۰)",
    "کوئیرکِ فرمتِ گزینه‌ها: خودِ چاپ بینِ Q39 و Q40 از «a. b. c. d.» (نقطه‌دار) به «a) b) c) d)» (پرانتزدار) می‌پیچد — رندرِ ۱۱۰۰dpi: Q38/Q39 نقطه‌دار، Q40+ پرانتزدار (ناکسازیِ تایپوگرافیکِ خودِ جزوه)؛ در داده فقط متنِ گزینه ذخیره می‌شود",
    "Q24: ران‌های [۷،۱۰،۳،۱] لایه (بریده بینِ خط‌ها) = یک خطِ خط‌چین در رندرِ ۱۲۰۰dpi → ۲۱ تیرهٔ یکپارچه با نقطهٔ چسبیده (قانونِ ادغامِ r349-Q2)",
    "چاپ‌غلطِ عینِ چاپ: Q40 گزینهٔ c «planed» (باید planned) — گزینهٔ انحرافی؛ کلیدِ a «hurt»",
    "بدونِ هیچ ترجمهٔ چاپی در ص۱۷۸-۱۹۴ (بررسی: «ترجمه» ×۰) — بانکِ بدونِ translation (قرینهٔ r334/r350)؛ شماره‌گذاریِ پیوستهٔ ۱-۳۶۰ بدونِ بخش‌بندیِ درون‌متنی؛ این بانک = سؤال‌های ۱-۱۲۰ (ص۱۷۸-۱۸۳)",
    "نویزِ لایه که پیش‌ازاستخراج حکم شد: فرفرجهٔ صفحات با تعدادِ کشیدهٔ متغیرِ «هم..کاران» — الگوی واحدِ پنجره‌دار («\"جزوه» در ۲۰ نویسه) تا عددِ «۳۰۱» در سربرگ هم لنگر نشود (اولین تلاش Q1-20 را بلعید — برگشت و اصلاح شد)",
]

RECEIPT = {
    "exam": "۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم — بخش ۱ (ص۱۷۸-۱۸۳)",
    "header": "سربرگِ چاپیِ ص۱۷۸: «۳۶۰ تست آموزشی واژگان \"درس ۱ تا ۴ - پایه دهم\" (پاسخنامه کلیدی صفحه: ۳۰۱)» + «سطح تستها: \"آموزشی\" و \"متوسط\"» — ۱۲۰ MCQ (سؤال ۱-۱۲۰ از ۳۶۰)",
    "keyPages": "301",
    "keyVerification": "print key p301 «پاسخنامه کلیدی ۳۶۰ تست واژگان درس ۱ تا ۴ (سؤاالت: صفحه ۱۷۸ تا ۱۹۴)» — جدولِ یک‌صفحه‌ایِ ۳۶۰ جفت — 360/360 unique; spot checks agree with semantic pre-fill, zero divergence",
    "extractedRound": "r351",
    "pattern": "r350 (بانکِ MCQِ درس‌محورِ بدونِ ترجمه) + r324/r325 (واژگانِ درس‌محور) + r349 (ادغامِ ران‌های تیرهٔ لایه)",
    "printQuirks": PRINT_QUIRKS,
}

TAGS_RECEIPT = {
    "regression": "r283/r320 tags grid — closed in r351",
    "exam": "عبارات الحاق (Tag Questions) — دستگرمی (ص۴۴) — کلیدِ گریدِ انتهای ص۱۸۷ جزوهٔ دوازدهم",
    "verification": "printed grid p187 (پایه دوازدهم) vs grammar-g12-topic.json bank «دستگرمی (ص۴۴)»: 20/20 AGREE — render 1100dpi verified (1=d 6=c 11=c 16=c / 2=d 7=b 12=b 17=b / 3=c 8=b 13=b 18=a / 4=a 9=b 14=d 19=a / 5=a 10=d 15=d 20=d)؛ گریدِ مجاورِ «معلوم و مجهول بخش دوم ص۳۷-۳۸» (r284) هم 40/40 AGREE",
    "closedRound": "r351",
}

data = json.loads(PATH.read_text(encoding="utf-8"))
changed = []
if "vocab360a" not in data["source"]:
    data["source"]["vocab360a"] = RECEIPT
    changed.append("receipt vocab360a added")
else:
    assert data["source"]["vocab360a"]["extractedRound"] == "r351"
    print("receipt vocab360a already present — NO-OP")

if "tagsR283Regression" not in data["source"]:
    data["source"]["tagsR283Regression"] = TAGS_RECEIPT
    changed.append("tags r283 regression receipt added (CLOSED-GREEN)")

if changed:
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("; ".join(changed), "| source keys:", len(data["source"]))
