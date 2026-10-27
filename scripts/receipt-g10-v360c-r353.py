# -*- coding: utf-8 -*-
# r353 — رسیدِ vocab360c (بخشِ ۳ از ۳۶۰تستیِ واژگان — تکمیلِ خانواده) — Idempotent
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

PRINT_QUIRKS = [
    "این بانک = سؤال‌های ۲۴۱-۳۶۰ از همان آزمونِ ص۱۷۸-۱۹۴ (بخشِ ۳ از ۳؛ پایانِ آزمون) — بدونِ سربرگِ جدید؛ سربرگِ آزمون در ص۱۷۸ است (r351) و کلیدِ همان جدولِ یک‌صفحه‌ایِ ص۳۰۱ برای هر ۳۶۰ سؤال. لوکاتورِ برنامهٔ r351/r352 «ص۱۸۸-۱۹۴» بود ولی Q241 در ص۱۸۹ آغاز می‌شود (ص۱۸۸ به‌تمامیِ بخشِ ۲ تعلق دارد: Q219-240) — عنوانِ بانک از محدودهٔ دقیقِ «ص۱۸۹-۱۹۴» استفاده می‌کند (درسِ r351: لوکاتورِ دقیق)",
    "گریدِ کلیدِ ص۳۰۱ سومین بار به‌صورت برنامه‌ای بازتولید شد (regex حرف-اول) و با رکوردِ KEY_RAWِ r351 مقایسه شد: 360/360 AGREE، صفر واگرایی — سومین استخراجِ مستقل از همان جدولِ چاپی",
    "فرمتِ گزینه‌ها در ۲۴۱-۳۶۰: همگی پرانتزدار «a) b) c) d)» (پیچشِ سوم در این محدوده نیست)",
    "صفر سؤالِ چندران در این محدوده (برخلافِ پنج‌تاییِ r352 و یکیِ r351) — سنزِ کامل: ۱۲۰ ران/۲۴۷۳ تیره، هر سؤال دقیقاً یک رانِ ۱۶-۲۴ تیره؛ داوریِ رندرِ ۱۲۰۰dpi برای Q241/Q300/Q359/Q360: تک‌رانِ پیوسته",
    "لبهٔ «آخرین سؤالِ کلِ آزمون»: گزینهٔ d سؤال Q360 در لایهٔ متنی جعبهٔ «Note:» خالیِ پاصفحهٔ ص۱۹۴ و خطوطِ خط‌چینِ تزئینی را می‌بلعید (lookahead بدونِ سؤالِ بعدی) — برش با لنگرِ Note فقط بعد از موقعیتِ Q360؛ خودِ جعبهٔ «Note:» خالی با خط‌های خط‌چینِ بنفش (الگوی r334/r338) در چاپ حفظ شد و به داده راه نیافت",
    "Q359/Q360: گزینه‌ها در لایهٔ متنی عمودی‌اند (هر گزینه یک خط) ولی در چاپِ ۱۲۰۰dpi هم‌ردیف‌اند — پارسرِ دورفرمت هر دو چیدمان را می‌گیرد؛ داده فقط متنِ گزینه‌ها را نگه می‌دارد (options رندرِ Q360: price/agents/hosts/sites با کلیدِ d «sites» تأیید شد)",
    "کلیدِ چاپیِ Q243 «collect» (b) برای «Red blood cells ___ carbon dioxide» — از منظرِ معنایی «carry» انتظار می‌رفت؛ کلیدِ چاپ حاکم است (قانون: کلید هرگز تغییر نمی‌کند)",
    "چاپ‌غلطِ عینِ چاپ در stemِ Q308: «tom's new house» با tِ کوچک (باید Tom's) — حفظِ verbatim؛ آپستروفِ مستقیمِ لایه در چهار سؤال (Q249/Q266/Q308/Q355) عینِ لایه حفظ شد — بقیهٔ آپستروف‌ها curlyِ چاپ؛ بدونِ هیچ ترجمهٔ چاپی («ترجمه» ×۰ در ص۱۸۹-۱۹۴)",
]

RECEIPT = {
    "exam": "۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم — بخش ۳ (ص۱۸۹-۱۹۴) — پایانِ آزمون",
    "header": "بدونِ سربرگِ جدید — ادامهٔ «۳۶۰ تست آموزشی واژگان \"درس ۱ تا ۴ - پایه دهم\" (پاسخنامه کلیدی صفحه: ۳۰۱)» از ص۱۷۸ (r351) — ۱۲۰ MCQ (سؤال ۲۴۱-۳۶۰ از ۳۶۰)؛ جعبهٔ «Note:» خالی در پاصفحهٔ ص۱۹۴ = پایانِ آزمون",
    "keyPages": "301",
    "keyVerification": "print key p301 — بازتولیدِ برنامه‌ایِ حرف-اول (360/360 unique) + AGREE با رکوردِ r351: 360/360، صفر واگرایی (سومین استخراجِ مستقل)؛ spot checks معنایی: Q241 continent / Q242 destroy / Q244 against / Q264 arrive / Q265 nature / Q266 suggestion / Q300 foreign / Q351 boring / Q352 wonders / Q360 sites",
    "extractedRound": "r353",
    "pattern": "r352 (بخشِ ۲ — همان پارسرِ دورفرمتِ «a[.)]» و فرفرجهٔ پنجره‌دار) + r351 (بخشِ ۱) + r349/r351 (ادغامِ ران‌های تیرهٔ لایه — در این محدوده اعمال‌نشده چون صفر سؤالِ چندران)",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))
changed = []
if "vocab360c" not in data["source"]:
    data["source"]["vocab360c"] = RECEIPT
    changed.append("receipt vocab360c added")
else:
    assert data["source"]["vocab360c"]["extractedRound"] == "r353"
    if data["source"]["vocab360c"]["printQuirks"] != PRINT_QUIRKS:
        data["source"]["vocab360c"]["printQuirks"] = PRINT_QUIRKS
        changed.append("receipt vocab360c printQuirks updated (same round)")
    else:
        print("receipt vocab360c already present — NO-OP")

if changed:
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("; ".join(changed), "| source keys:", len(data["source"]))
