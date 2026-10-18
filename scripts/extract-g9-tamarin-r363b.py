#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r363-b — ادامهٔ extract-g9-tamarin-r363.py:
  اصلاحِ باگِ امتیازدهیِ تایپیِ تک‌گزینه‌ای (۴۳ آیتم در g9/g10/g11) + نوشتنِ سه فایل
بخشِ الف (پارسِ ۱۱ سکشن + ساختِ ۵۵ آیتم) از execِ اسکریپتِ اصلی می‌آید.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
G9 = ROOT / "public/jozve/tests-g9.json"
G10 = ROOT / "public/jozve/tests-g10.json"
G11 = ROOT / "public/jozve/tests-g11.json"

_g = {"__name__": "r363a"}
exec(compile((ROOT / "scripts/extract-g9-tamarin-r363.py").read_text(encoding="utf-8"),
             "extract-g9-tamarin-r363.py", "exec"), _g)
ALL_ITEMS = _g["ALL_ITEMS"]
BANK_DEF = _g["BANK_DEF"]


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower().replace("’", "'")).strip(" ?؟.!")


def fix_g9_is_are(data: dict) -> int:
    """بانک ۱: options=['is','are'] با answer=اندیسِ کلید — کلیدِ ساختاری دست‌نخورده"""
    fixed = 0
    for q in data["lessons"][0]["questions"]:
        if q.get("kind") != "typed":
            continue
        assert q["options"] == [q["accepted"][0]], f"unexpected shape {q['id']}: {q['options']}"
        key = q["accepted"][0]
        assert key in ("is", "are"), f"key {q['id']}={key!r}"
        q["options"] = ["is", "are"]
        q["answer"] = 0 if key == "is" else 1
        fixed += 1
    assert fixed == 4, f"g9 fixed={fixed}"
    return fixed


BLANK_PAREN = re.compile(r"\(([A-Za-z][A-Za-z_]*_{2,}[A-Za-z_]*)\)")
BLANK_RUN = re.compile(r"[-_]{4,}")
BLANK_SPACED = re.compile(r"(?:[A-Za-z] )+_(?: _)+")


def blank_form(question: str) -> str:
    m = BLANK_PAREN.search(question)
    if m:
        return m.group(1)
    m = BLANK_RUN.search(question)
    if m:
        return m.group(0)
    m = BLANK_SPACED.search(question)
    if m:
        return m.group(0)
    raise AssertionError(f"no blank form in: {question[:60]!r}")


PREP_ROT = {"at": "in", "in": "on", "on": "at"}


def fix_g10(data: dict) -> int:
    fixed = 0
    for bank in data["lessons"]:
        for q in bank["questions"]:
            if q.get("kind") != "typed" or len(q.get("options", [])) != 1:
                continue
            ans = q["options"][0]
            qid = q["id"]
            if qid.startswith("g10-l89-"):
                wrong = blank_form(q["question"])
            elif qid.startswith("g10-l91-"):
                wrong = blank_form(q["question"])          # رانِ dash در «(----)»
            elif qid.startswith("g10-l92-"):
                parts = ans.split(" / ")
                assert len(parts) == 2, f"{qid}: {ans!r}"
                wrong = f"{parts[1]} / {parts[0]}"          # جفتِ برعکسِ اسلش‌دار
            elif qid.startswith("g10-l94-"):
                key = ans.lower()
                assert key in PREP_ROT, f"{qid}: prep {ans!r}"
                wrong = PREP_ROT[key]
                if ans[0].isupper():
                    wrong = wrong.capitalize()
            else:
                raise AssertionError(f"g10 single-option outside known families: {qid}")
            assert norm(wrong) != norm(ans), f"{qid}: distractor==answer ({wrong!r})"
            q["options"] = [ans, wrong]
            fixed += 1
    assert fixed == 35, f"g10 fixed={fixed}"
    return fixed


def fix_g11(data: dict) -> int:
    fixed = 0
    for bank in data["lessons"]:
        for q in bank["questions"]:
            if q.get("kind") != "typed" or len(q.get("options", [])) != 1:
                continue
            ans = q["options"][0]
            qid = q["id"]
            if qid == "g11-l90-1":
                wrong = "falling / rising"
            elif qid == "g11-l99-1":
                wrong = q["question"]                       # سطرِ به‌هم‌ریختهٔ خودِ چاپ
            elif qid == "g11-l105-3":
                wrong = "Few people use social media."      # اسکافولدِ ناهمدیسی (هرگز رندر نمی‌شود)
            elif qid == "g11-l108-1":
                wrong = "do"                                # هم‌آشوبِ کلاسیکِ make/do
            else:
                raise AssertionError(f"g11 single-option outside known families: {qid}")
            assert norm(wrong) != norm(ans), f"{qid}: distractor==answer"
            q["options"] = [ans, wrong]
            fixed += 1
    assert fixed == 4, f"g11 fixed={fixed}"
    return fixed


# ————— نوشتنِ فایل‌ها —————
g9data = json.loads(G9.read_text(encoding="utf-8"))
g10data = json.loads(G10.read_text(encoding="utf-8"))
g11data = json.loads(G11.read_text(encoding="utf-8"))

quirks = [
    "ساختارِ لایه در این جزوه: هر آیتم = [بلوکِ پاسخ EN][پاسخ FA][بلوکِ سؤال EN][سؤال FA] — پاسخ در لایه پیش از سؤال می‌آید (ترتیبِ استخراج، نه ترتیبِ بصری چاپ)",
    "جفتِ ۱ تمرین۱ درس اول: شکستِ RTL — قطعهٔ «م ؟» جدا از «بله، من هست»؛ بازسازیِ «هستم» با فهرستِ FIXUPS (لنگر: مقدارِ پارس‌شده)",
    "ترجمهٔ پاسخِ جفت‌های ۲-۵ تمرین۱ درس اول با «؟» سرگردانِ چاپی پایان می‌یابد (۴ مورد) — در فیلدِ ترجمه پاک‌سازی و اینجا مستند شد",
    "«بله، او هس ت» (تمرین۱ درس دوم جفت ۳) — فاصلهٔ درون‌کلمه‌ایِ لایه؛ بازسازیِ «هست» با FIXUPS",
    "چاپ‌خطای محتوایی (printErrata): تمرین۱ درس سوم ق۴ — پاسخِ EN با «Yes,» آغاز می‌شود («Yes, they don’t buy goldfish») ولی ترجمهٔ چاپیِ FA با «نه» و منطقِ جمله منفی است؛ شکلِ چاپی verbatim اولِ accepted و شکل‌های اصلاح‌شده («No, …») در accepted به‌عنوانِ واریانتِ روادار",
    "«No, we don’t» و «Yes, they usually color them» (تمرین۱ درس سوم ق۲/ق۳) بدونِ نقطهٔ پایانیِ چاپی — verbatim؛ نرمال‌سازِ موتور نقطهٔ پایانی را بی‌اثر می‌کند",
    "«بله.میخرم» (تمرین۱ درس سوم جفت ۱) — نقطه به‌جای ویرگول و بدونِ فاصله در چاپ — verbatim در ترجمه",
    "لایه «معموال» = چاپ «معمول» (تجزیهٔ لِگاتورِ لا در استخراجِ متن) — ترجمه با شکلِ چاپیِ خوانا",
    "سربرگِ «تمرین1» درس چهارم دو بار در لایه می‌آید (دو بلوکِ ۴+۶ جفتیِ یک سکشنِ چاپی) — بانک ۶ با ادغامِ هر دو بلوک ساخته شد",
    "سربرگِ درس ششم «تم رین1» با فاصله و «صفحه۳1» درس دوم با ارقامِ آمیختهٔ فارسی/لاتین — scrambleهای سربرگ",
    "عنوانِ چاپیِ درس ششم «صحبت کردن در مورد سالمتی و آسیب ها» — «سالمتی» غلطِ چاپیِ «سلامتی» (در عنوانِ بانک verbatim نگه داشته شد)",
    "سطرهای نقطه‌چینِ فرمِ پاسخِ آزاد در تمرین۲ درس دوم/تمرین۱ درس سوم/تمرین۱ و ۲ درس ششم — فضای خالیِ چاپ‌اند و استخراج نمی‌شوند",
    "قطعه‌های شکستهٔ Q-FA (مثل «آیا آنها در حال سفر دور دنیا»+«هستند؟») و A-EN (مثل «Yes, she has many»+«friends.») با فاصله بازپیوسته شدند — خودکار با قفلِ شمارشِ هر سکشن",
    "دو جفتِ پایانیِ تمرین۲ درس اول پس از سربرگِ صفحهٔ بعد در لایه می‌آیند (شکستِ صفحهٔ چاپ) — در همان بانک ادامه یافتند",
]

receipt = {
    "extractedRound": "r363",
    "families": 6,
    "sections": 11,
    "items": 55,
    "bankCounts": [11, 9, 8, 10, 9, 8],
    "examPages": "تمرین‌ها ص۱۷/۳۱/۵۱/۶۵/۸۳/۹۶ (برچسبِ چاپیِ خودِ سربرگ‌ها؛ «۳۱» با ارقامِ آمیختهٔ ۳1)",
    "keySource": "پرسش و پاسخ هر دو چاپیِ درون‌صفحه (جفتِ دیالوگ) — بی‌پاسخنامهٔ جدا؛ کلید = پاسخِ چاپیِ همان صفحه + واریانت‌های روادار (بی‌ویرگول/بازشدنِ مخفف)",
    "printErrata": [
        "تمرین۱ درس سوم ق۴: «Yes, they don’t buy goldfish» در برابرِ ترجمهٔ چاپیِ «نه، آنها ماهی قرمز نمیخرند» — شکلِ چاپی verbatim اولِ accepted، شکل‌های «No, …» روادار",
    ],
    "printQuirkCount": len(quirks),
    "printQuirks": quirks,
    "acceptedVariantsPolicy": "accepted[0] عینِ پاسخِ چاپی است؛ واریانت‌های بعدی فقط رواداریِ تایپ‌اند (بی‌ویرگولِ Yes/No، بازشدنِ مخفف، شکل‌های اصلاح‌شدهٔ چاپ‌خطا) — کلیدِ چاپی هرگز جابه‌جا نمی‌شود",
    "distractorPolicy": "options=[پاسخِ چاپی، پاسخِ آیتمِ بعدیِ همان بانک] — اسکافولدِ غلطِ درون‌بانکی؛ برای آیتم تایپی هرگز رندر نمی‌شود (کارنامه متنِ خامِ تایپ‌شده را نشان می‌دهد) و فقط نقشِ اندیسِ نادرست را دارد",
    "examMap": {
        "note": "نقشهٔ «سؤالات امتحانی» هر شش درس برای راندهای بعدی — شماره‌ها صفحهٔ PDF؛ سکشن‌های تصویری/آهنگی استخراج‌ناپذیر؛ هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده وجود ندارد (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)",
        "lesson1": "pdf-p31-33 — ۱۵ سکشن؛ تصویری: ۱/۳/۱۲؛ آهنگی: ۱۰ (افتان/خیزان)؛ تولیدِ آزاد: ۵/۱۵",
        "lesson2": "pdf-p47+ — سربرگِ «سواالت امتحانی درس دوم»",
        "lesson3": "pdf-p61+ — سربرگِ «سواالت امتحانی درس سوم»",
        "lesson4": "pdf-p73+ — سربرگِ «سواالت امتحانی درس چهارم»",
        "lesson5": "pdf-p85+ — سربرگِ «سواالت امتحانی درس پنجم»",
        "lesson6": "pdf-p95+ — سربرگِ «سواالت امتحانی درس ششم»",
    },
    "typedSingleOptionFix": {
        "bug": "typedAnswerIndex برای ورودیِ ناهم‌سان با accepted و options، (answer+1) % options.length را برمی‌گرداند — با options.length=1 این همیشه خودِ answer است: هر ورودیِ غلطی «درست» امتیاز می‌گرفت",
        "scope": "۴۳ آیتمِ تایپیِ تک‌گزینه‌ای: tests-g9 (۴: g9-l1-4..7)، tests-g10 (۳۵: l89-1..16، l91-3..13، l92-1..2، l94-1..6)، tests-g11 (۴: l90-1، l99-1، l105-3، l108-1)",
        "fix": "افزودنِ اسکافولدِ غلطِ خانواده‌محور به options — g9: جفتِ ساختاری [is، are] با answer=اندیسِ کلید؛ l89/l91: شکلِ خالیِ چاپیِ خودِ سؤال (فام__لی__ر / رانِ dash)؛ l92/l90: جفتِ برعکسِ اسلش‌دار؛ l94: چرخشِ at/in/on؛ l99: سطرِ به‌هم‌ریختهٔ چاپ؛ l105: جملهٔ ناهمدیسی؛ l108: «do»",
        "guard": "tests/jozve-tests-g9-tamarin-r363.test.ts — هیچ آیتمِ تایپی در هیچ tests-gN.json نباید options.length<2 داشته باشد",
    },
}

if "g9tamarin" in g9data["source"]:
    print("g9tamarin receipt already present — NO-OP (verify manually if re-round intended)")
    raise SystemExit(0)

new_banks = []
for bank_no, title, _ in BANK_DEF:
    qs = [x["item"] for x in ALL_ITEMS if x["bank"] == bank_no]
    new_banks.append({"lesson": bank_no, "title": title, "level": "تمرین مکالمه — تایپی", "count": len(qs), "questions": qs})

existing_ids = [q["id"] for b in g9data["lessons"] for q in b["questions"]]
new_ids = [q["id"] for b in new_banks for q in b["questions"]]
assert len(existing_ids) == 57 and len(new_ids) == 55
assert len(set(existing_ids + new_ids)) == 112, "id collision"

g9fix = fix_g9_is_are(g9data)
g10fix = fix_g10(g10data)
g11fix = fix_g11(g11data)
print(f"single-option typed fixed: g9={g9fix} g10={g10fix} g11={g11fix} (total {g9fix+g10fix+g11fix})")

g9data["lessons"].extend(new_banks)
g9data["source"]["g9tamarin"] = receipt
g10data["source"]["typedFixR363"] = {"round": "r363", "fixed": g10fix, "rule": "اسکافولدِ غلطِ خانواده‌محور (l89/l91: شکلِ خالیِ چاپی؛ l92: جفتِ برعکس؛ l94: چرخشِ حرف اضافه) — توضیحِ کامل در tests-g9.json → source.g9tamarin.typedSingleOptionFix"}
g11data["source"]["typedFixR363"] = {"round": "r363", "fixed": g11fix, "rule": "l90: جفتِ برعکسِ اسلش‌دار؛ l99: سطرِ به‌هم‌ریختهٔ چاپ؛ l105: جملهٔ ناهمدیسی؛ l108: «do» — توضیحِ کامل در tests-g9.json → source.g9tamarin.typedSingleOptionFix"}

for path, data, tag in [(G9, g9data, "g9"), (G10, g10data, "g10"), (G11, g11data, "g11")]:
    before = path.read_text(encoding="utf-8")
    out = json.dumps(data, ensure_ascii=False, indent=1) + "\n"
    if out == before:
        print(f"{tag}: NO-OP")
    else:
        path.write_text(out, encoding="utf-8")
        import hashlib
        print(f"{tag}: WROTE {len(out)} bytes md5={hashlib.md5(out.encode()).hexdigest()[:8]}")

for b in new_banks:
    print(f"  bank {b['lesson']}: {b['title'][:52]} — {b['count']}")
