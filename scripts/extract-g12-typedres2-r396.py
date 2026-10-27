#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r396 — «بانکِ تایپیِ نهایی‌ها» — قسمتِ دوم: جمله‌سازی (l143، ۱۸ آیتم)
دومین بانکِ گردآوریِ درون‌خانوادگی از «مخزنِ بانکِ تایپیِ نهایی‌ها» — سهمِ این قسط:
۱۸ ردیفِ جمله‌سازی (مرتب‌کردنِ کلمات) از ۸ برگه؛ پس از این بانک، همهٔ ردیف‌های
جمله‌سازیِ مخزن مصرف شده و فقط ۵۱ ردیفِ «پاسخِ مدل» باقی می‌ماند.

سهمِ هر برگه (۸ برگه / ۱۸ ردیف):
  r381 شهریور ۱۴۰۱ (ص۳۴۵):     ق۳۸ — دو ترتیبِ پذیرفتهٔ چاپی (کلیدِ ص۳۴۸)
  r382 دی ۱۴۰۰ (ص۳۳۱):          ق۳۳/۳۴ — بازسازی از چیپ‌های عمودیِ کلیدِ قدیمی (ص۳۳۴)
  r383 شهریور ۱۴۰۰ (ص۳۲۴):      ق۳۳/۳۴ — همان روش (ص۳۲۷)
  r384 خرداد ۱۴۰۰ انسانی (ص۳۱۷): ق۳۲/۳۳ — همان روش (ص۳۲۰)
  r385 خرداد ۱۴۰۰ ریاضی-تجربی (ص۳۱۰): ق۳۲/۳۳ — مدلِ جملهٔ کاملِ چاپی در رسیدِ همان راند
  r386 دی ۱۳۹۹ (ص۳۰۳):          ق۳۸ — مدلِ چاپیِ سالم (ص۳۰۷)
  r387 شهریور ۱۳۹۹ (ص۲۸۹):      ق۵۹-۶۲ — چهارگانه با مدلِ چاپی (ص۲۹۲)
  r388m خرداد ۱۳۹۹ ریاضی-تجربی (ص۲۶۵): س۱۶ چهارگانهٔ a/b با مدلِ چاپی (ص۲۶۷)

روشِ بازسازیِ کلیدهای قدیمی (r382/383/384): راهنمای تصحیحِ سربرگِ قدیمی پاسخِ جمله‌سازی
را به‌صورتِ چیپ‌های عمودی چاپ می‌کند؛ لایهٔ متنی ترتیبِ RTL را وارونه می‌ریزد —
خواندنِ از پایین به بالا ترتیبِ جمله را می‌دهد؛ با کلیدِ تمیزِ برگه‌های دوقلو
(r386-ق۳۸ = نسخهٔ Minaِ همان جملهٔ r384-ق۳۲) و یکتاییِ گرامریِ چیپ‌ها سه‌سویه تأیید شد.
idempotent: اجرای دوم NO-OP (رسیدِ g12typedres2).
"""
import json
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"

d = json.loads(OUT.read_text(encoding="utf-8"))
if "g12typedres2" in d.get("source", {}):
    print("r396: receipt g12typedres2 already present — NO-OP")
    raise SystemExit(0)
assert len(d["lessons"]) == 142, f"expected 142 banks before r396, got {len(d['lessons'])}"
assert [b["lesson"] for b in d["lessons"][-1:]] == [142], "last bank must be l142"

G = "/"  # چیپ‌ها عینِ چاپ — بدونِ بازسازی


def q(i: int, stem: str, accepted: list[str]):
    return {
        "id": f"g12-l143-{i}",
        "n": i,
        "category": "grammar",
        "question": stem,
        "options": [accepted[0]],
        "answer": 0,
        "kind": "typed",
        "accepted": accepted,
    }


ITEMS = [
    # —— r381 شهریور ۱۴۰۱ — ق۳۸ — هر دو ترتیبِ چاپیِ کلید (ص۳۴۸: جملهٔ اصلی + «یا …») ——
    ("the teacher / had done / the students / their homework / when / came to the class /. /", [
        "When the teacher came to the class, the students had done their homework.",
        "The students had done their homework when the teacher came to the class.",
    ]),
    # —— r382 دی ۱۴۰۰ — ق۳۳/۳۴ — بازسازی از چیپ‌های عمودیِ کلیدِ ص۳۳۴ ——
    ("got home / had fallen/ The baby/ asleep/ when /I/. /",
     ["The baby had fallen asleep when I got home."]),
    ("John/ he/ if / more time / had / could rest  /./",
     ["John could rest if he had more time."]),
    # —— r383 شهریور ۱۴۰۰ — ق۳۳/۳۴ — کلیدِ ص۳۲۷ ——
    ("went to the zoo / had never seen/ Sara/ a bear/ before /she/. /",
     ["Sara had never seen a bear before she went to the zoo."]),
    ("My sister/ she/ if / her room / were at home / would clean /. /",
     ["My sister would clean her room if she were at home."]),
    # —— r384 خرداد ۱۴۰۰ انسانی — ق۳۲/۳۳ — کلیدِ ص۳۲۰ + تأییدِ دوقلوی r386 ——
    ("had gotten/ was upset/ because/ a bad score/ she/ Roya /. /",
     ["Roya was upset because she had gotten a bad score."]),
    ("the car / were at home /if / he / could fix/ John  /. /",
     ["John could fix the car if he were at home."]),
    # —— r385 خرداد ۱۴۰۰ ریاضی-تجربی — ق۳۲/۳۳ — مدلِ جملهٔ کاملِ چاپی (رسیدِ r385) ——
    ("moved to China / had already learned/ Chinese/ Joe/ he/ when /. /",
     ["Joe had already learned Chinese when he moved to China."]),
    ("you /if / They / a house /  would buy / they were /./",
     ["They would buy a house if they were you."]),
    # —— r386 دی ۱۳۹۹ — ق۳۸ — مدلِ چاپیِ سالم (ص۳۰۷) ——
    ("had gotten/ was/ a bad score/ she/ Mina/ upset/ because /. /",
     ["Mina was upset because she had gotten a bad score."]),
    # —— r387 شهریور ۱۳۹۹ — ق۵۹-۶۲ — چهارگانه با چسبِ چاپیِ «who /and» و مدلِ ص۲۹۲ ——
    ("work / some workers / who /and teachers/ in the village / there are /.",
     ["There are some workers and teachers who work in the village."]),
    ("wrote / didn't / a letter / the girl / she / , /?",
     ["The girl wrote a letter, didn't she?"]),
    ("because / hadn't rained / everything in the garden / it / was brown /.",
     ["Everything in the garden was brown because it hadn't rained."]),
    ("be / by the teacher / the parents / called / should /.",
     ["The parents should be called by the teacher."]),
    # —— r388m خرداد ۱۳۹۹ ریاضی-تجربی — س۱۶ چهارگانهٔ a/b (چیپ‌های ص۲۶۵، مدلِ ص۲۶۷) ——
    ("more free time / Mina / would / had / help / you / if / she / with your homework /.",
     ["Mina would help you with your homework if she had more free time."]),
    ("was / because / he / my mother / hadn't / angry / my brother / washed / with / his hands /.",
     ["My mother was angry with my brother because he hadn't washed his hands."]),
    ("bought / the students / which / their teacher / some / useful / suggested / books /.",
     ["The students bought some useful books which their teacher suggested."]),
    ("cold weather / into / converted / water / in / ice / be / can / ?",
     ["Can water be converted into ice in cold weather?"]),
]

assert len(ITEMS) == 18, f"expected 18 items, got {len(ITEMS)}"

# مدل‌های بازسازی‌شده (آیتم‌های ۲-۹): چیپ‌های عمودیِ کلیدِ قدیمیِ r382/383/384 +
# کلیدِ فرگمنتیِ r385 (مدل‌هایش در رسیدِ همان راند به‌صورتِ جملهٔ کامل نقل شده) —
# رشتهٔ پیوسته در لایه ندارند؛ راستی‌آزمایی‌شان از راهِ قطعه‌های چیپ + تأییدِ دوقلو + تستِ پین‌شده است
RECONSTRUCTED = {2, 3, 4, 5, 6, 7, 8, 9}

# ——— راستی‌آزماییِ لایه: هر مدل و هر قطعهٔ چیپ باید در لایهٔ متنی حاضر باشد ———
layer_flat = " ".join((ROOT / "booklet-extract/g12.txt").read_text(encoding="utf-8").split())
for idx, (stem, accepted) in enumerate(ITEMS, start=1):
    if idx in RECONSTRUCTED:
        continue
    for a in accepted:
        # مدل‌ها با آپوستروفِ نرمال و بدونِ حساسیتِ بزرگی/کوچکی جست‌وجو می‌شوند
        # (نسخهٔ دومِ r381 در چاپ با حرفِ کوچک و ویرگولِ پایانی است)
        flat_cf = layer_flat.casefold()
        # نقطه/ویرگولِ انتهاییِ سوزن برمی‌دارد (نسخهٔ دومِ r381 در چاپ با ویرگولِ پایانی است)
        for form in {a, a.replace("'", "`"), a.replace("'", "’")}:
            if form.rstrip(".,?؟!").casefold() in flat_cf:
                break
        else:
            raise AssertionError(f"model not found in layer: {a}")
for frag in [
    "the teacher / had done", "got home / had fallen", "more time / had / could rest",
    "had never seen/ Sara", "were at home / would clean", "a bad score/ she/ Roya",
    "could fix/ John", "had already learned/ Chinese/ Joe", "a house /  would buy",
    "she/ Mina/ upset/ because", "who /and teachers/ in the village",
    "a letter / the girl / she", "everything in the garden / it / was brown",
    "the parents / called / should", "more free time / Mina / would / had",
    "angry / my brother / washed", "some / useful / suggested / books",
    "converted / water / in / ice / be / can",
]:
    # دوفاصله‌های چاپی در متنِ تخت فرومی‌ریزند — قطعه هم فروریخته مقایسه می‌شود
    assert " ".join(frag.split()) in layer_flat, f"chip fragment '{frag}' not found in g12.txt layer"

bank = {
    "lesson": 143,
    "title": "مرورِ تایپیِ نهایی‌ها — جمله‌سازی (قسمتِ دومِ مخزنِ ۸۹ ردیفی)",
    "level": "تایپی",
    "count": len(ITEMS),
    "questions": [q(i + 1, s, a) for i, (s, a) in enumerate(ITEMS)],
}
d["lessons"].append(bank)

d["source"]["g12typedres2"] = {
    "extractedRound": "r396",
    "section": ("بانکِ تایپیِ نهایی‌ها — قسمتِ دوم: جمله‌سازی (l143) — دومین بانکِ گردآوریِ درون‌خانوادگی؛ "
                "۱۸ ردیفِ مرتب‌کردنِ کلمات از ۸ برگه — با این بانک همهٔ ردیف‌های جمله‌سازیِ مخزن مصرف شد "
                "و فقط ۵۱ ردیفِ «پاسخِ مدل» باقی ماند (قسطِ سوم)"),
    "examPages": ("بدونِ صفحهٔ آزمونِ تازه؛ چیپ‌ها از لایهٔ متنیِ g12.txt (ص۳۴۵/۳۳۱/۳۲۴/۳۱۷/۳۱۰/۳۰۳/۲۸۹/۲۶۵) و "
                  "مدل‌ها از کلیدهای چاپی: r381 ص۳۴۸ (دو ترتیب با «یا»)، r386 ص۳۰۷ (سالم)، r387 ص۲۹۲، r388m ص۲۶۷؛ "
                  "بازسازیِ کلیدهای عمودیِ قدیمیِ r382/r383/r384 (ص۳۳۴/۳۲۷/۳۲۰) با خوانشِ پایین-به-بالای "
                  "چیپ‌های RTL + تأییدِ سه‌سویه با کلیدِ تمیزِ دوقلو (r386-ق۳۸ = نسخهٔ Minaِ r384-ق۳۲) و "
                  "یکتاییِ گرامریِ چیپ‌ها؛ r385-ق۳۲/۳۳ از مدلِ جملهٔ کاملِ چاپیِ رسیدِ همان راند"),
    "keyPolicy": ("مدل‌ها عینِ چاپ؛ بک‌تیک/کوتیشنِ خمیدهٔ چاپ (didn`t/hadn’t) به آپوستروفِ ASCII نرمال شد "
                  "(الگویِ l136/r393)؛ حرفِ بزرگِ آغازِ جمله در مدل‌ها از چاپ؛ دو ترتیبِ چاپیِ r381-ق۳۸ "
                  "→ accepted دومَعضوی (ویرگولِ انتهاییِ نسخهٔ دومِ چاپ به نقطه نرمال شد)؛ "
                  "چسب‌ها و دوفاصله‌های چیپ‌ها («who /and»، «could rest  /./»، «John  /. /») وفادارانه ماند"),
    "items": 18,
    "bankCounts": {"l143": 18},
    "reservoirCensus": {
        "consumedHere": {
            "r381-shahrivar1401": "ق۳۸ (۱)",
            "r382-dey1400": "ق۳۳/۳۴ (۲)",
            "r383-shahrivar1400": "ق۳۳/۳۴ (۲)",
            "r384-khordad1400h": "ق۳۲/۳۳ (۲)",
            "r385-khordad1400m": "ق۳۲/۳۳ (۲ — با کشفِ این راند: این دو ردیف جمله‌سازی‌اند نه پاسخِ مدل)",
            "r386-dey1399": "ق۳۸ (۱)",
            "r387-shahrivar1399": "ق۵۹-۶۲ (۴)",
            "r388m-khordad1399m": "س۱۶ چهارگانهٔ a/b (۴)",
        },
        "remaining": ("۵۱ ردیفِ پاسخِ مدلِ خوانداری/شنیداری/واژه‌نامه (قسطِ سوم): r380-ق۴۳/۴۴/۴۷/۴۸؛ "
                      "r381-ق۳۹/۴۵-۴۷/۵۲/۵۷-۵۸؛ r382-ق۴۰/۴۳/۴۴/۴۷/۴۸؛ r383-ق۴۰/۴۷/۴۸؛ r384-ق۳۴/۳۸/۴۲/۴۳؛ "
                      "r385-ق۳۴/۴۳؛ r386-ق۴۴/۴۵/۵۰/۵۱؛ r387-ق۴۳/۴۴ (means/founding)؛ r390-ق۳۷/۳۸/۵۵-۵۷/۶۰؛ "
                      "r391-ق۳۵/۳۶/۴۸/۴۹/۵۳-۵۵؛ r392-ق۴۹؛ r393-ق۱-۶ شنیداری — "
                      "یادداشتِ تعدیل: سرشمارِ جزئیِ ۹۱ (=۲۲+۱۸+۵۱) با جمعِ متحرکِ تاریخیِ رسیدها (۸۹) ±۲ "
                      "اختلاف دارد؛ ابهام در ردیف‌های ۴۵-۴۷ِ r381 و یکی از ردیف‌های r382 — فهرستِ جزئیِ "
                      "همین رسید ملاکِ قسطِ سوم است"),
    },
    "engineNote": ("یکهزاردرصدِ تایپی (kind=typed) — مستثنی از حلقهٔ MCQ؛ ساقه = چیپ‌های خامِ چاپ با « / » "
                   "(الگویِ l110/l137)؛ options=[مدلِ نخست] به‌عنوانِ داربستِ بازبینی؛ دوتاییِ چاپیِ "
                   "r381-ق۳۸ در accepted؛ ترتیبِ برگه‌ها همان ترتیبِ استخراجِ r380-r394"),
    "futureNote": ("مخزن از ۶۷ به ۵۱ ردیف رسید — قسطِ سوم (پایانی): ۵۱ پاسخِ مدل؛ "
                   "دو فرصتِ دیگرِ ثبت‌شدهٔ بخش: فیلدِ تصویرِ QuizQuestion (REQUIRES-APPROVAL) و case-sensitive mode"),
}

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r396 OK: +1 bank / +{bank['count']} items -> {len(d['lessons'])} banks / {total} items")
