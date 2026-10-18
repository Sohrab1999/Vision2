#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r364-b — ادامهٔ extract-g9-exam1-r364.py:
  ساختِ ۲۹ آیتم در ۷ بانک (۹-۱۵) + رسیدِ g9exam1 + نوشتنِ tests-g9.json (idempotent)
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
G9 = ROOT / "public/jozve/tests-g9.json"

_g = {"__name__": "r364a"}
exec(compile((ROOT / "scripts/extract-g9-exam1-r364.py").read_text(encoding="utf-8"),
             "extract-g9-exam1-r364.py", "exec"), _g)
S2_KEYS, S6, S6_KEYS = _g["S2_KEYS"], _g["S6"], _g["S6_KEYS"]
S7, S7_KEYS = _g["S7"], _g["S7_KEYS"]
S9, S9_KEYS = _g["S9"], _g["S9_KEYS"]
S11, S11_KEYS = _g["S11"], _g["S11_KEYS"]
S14_Q, S14_OPTS, S14_KEYS = _g["S14_Q"], _g["S14_OPTS"], _g["S14_KEYS"]


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower().replace("’", "'").replace("`", "'")).strip(" ?؟.!")


TYPED = {"kind": "typed"}
banks_def = []

# ————— بانک ۹ — س۲ متضاد —————
s2_labels = ["Kind", "lazy", "Happy", "Talkative"]
q9 = []
for i, lab in enumerate(s2_labels, start=1):
    acc = S2_KEYS[lab]
    q9.append({
        "id": f"g9-l9-{i}", "n": i, "category": "vocab", **TYPED,
        "question": f"{lab}: -------", "options": [acc[0]], "answer": 0,
        "accepted": acc, "placeholder": "the opposite word…",
    })
# اسکافولدِ غلطِ درون‌بانکی (پاسخِ آیتمِ بعدی — چرخشی)
for i, q in enumerate(q9):
    q["options"] = [q["accepted"][0], q9[(i + 1) % len(q9)]["accepted"][0]]
    assert norm(q["options"][1]) != norm(q["options"][0]), q["id"]
banks_def.append((9, "امتحانی درس اول — متضاد کلمات (س۲، ص۳۱)", "تمرین تایپی", q9))

# ————— بانک ۱۰ — س۴ سوالی/منفی —————
q10 = [
    {"id": "g9-l10-1", "n": 1, "category": "grammar", **TYPED,
     "question": "Mina is hard working. (سوالی : -------)", "options": ["Is Mina hard working?"],
     "answer": 0, "accepted": ["Is Mina hard working?"], "placeholder": "rewrite as a question…"},
    {"id": "g9-l10-2", "n": 2, "category": "grammar", **TYPED,
     "question": "Mina is hard working. (منفی: -------)",
     "options": ["Mina is not hard working."],
     "answer": 0, "accepted": ["Mina is not hard working.", "Mina isn’t hard working."],
     "placeholder": "rewrite as a negative…"},
]
q10[0]["options"] = ["Is Mina hard working?", "Mina is not hard working."]
q10[1]["options"] = ["Mina is not hard working.", "Is Mina hard working?"]
banks_def.append((10, "امتحانی درس اول — سوالی و منفی (س۴، ص۳۱)", "تمرین تایپی", q10))

# ————— بانک ۱۱ — س۶ there is/there are —————
q11 = []
for i, (stem, key) in enumerate(zip(S6, S6_KEYS), start=1):
    q11.append({
        "id": f"g9-l11-{i}", "n": i, "category": "grammar", **TYPED,
        "question": stem, "options": ["There is", "There are"],
        "answer": 0 if key == "There is" else 1,
        "accepted": [key], "placeholder": "there is / there are…",
    })
assert [q["answer"] for q in q11] == [1, 0, 0, 1]
banks_def.append((11, "امتحانی درس اول — there is/there are (س۶، ص۳۲)", "تمرین تایپی", q11))

# ————— بانک ۱۲ — س۷ گزینه صحیح —————
q12 = []
for i, (item, key) in enumerate(zip(S7, S7_KEYS), start=1):
    q12.append({
        "id": f"g9-l12-{i}", "n": i, "category": "grammar",
        "question": item["stem"], "options": item["options"], "answer": key,
    })
banks_def.append((12, "امتحانی درس اول — گزینه صحیح (س۷، ص۳۲)", "چهارگزینه‌ای", q12))

# ————— بانک ۱۳ — س۹ ناهماهنگ —————
q13 = []
for i, (item, key) in enumerate(zip(S9, S9_KEYS), start=1):
    q13.append({
        "id": f"g9-l13-{i}", "n": i, "category": "vocab",
        "question": item["stem"], "options": item["options"], "answer": key,
    })
banks_def.append((13, "امتحانی درس اول — کلمه ناهماهنگ (س۹، ص۳۲)", "چهارگزینه‌ای", q13))

# ————— بانک ۱۴ — س۱۱ am/is/are —————
q14 = []
for i, (stem, key) in enumerate(zip(S11, S11_KEYS), start=1):
    q14.append({
        "id": f"g9-l14-{i}", "n": i, "category": "grammar", **TYPED,
        "question": stem, "options": ["am", "is", "are"],
        "answer": ["am", "is", "are"].index(key.lower()),
        "accepted": [key], "placeholder": "am, is or are…",
    })
assert [q["accepted"][0] for q in q14] == ["are", "is", "am", "are", "Is"]
banks_def.append((14, "امتحانی درس اول — am/is/are (س۱۱، ص۳۳)", "تمرین تایپی", q14))

# ————— بانک ۱۵ — س۱۴ وصل‌شدنی —————
q15 = []
for i, (stem, key) in enumerate(zip(S14_Q, S14_KEYS), start=1):
    q15.append({
        "id": f"g9-l15-{i}", "n": i, "category": "grammar",
        "question": stem, "options": list(S14_OPTS), "answer": key,
    })
banks_def.append((15, "امتحانی درس اول — مکالمهٔ وصل‌شدنی (س۱۴، ص۳۳)", "چهارگزینه‌ای (پنج‌گزینه‌ای چاپی)", q15))

# ————— قفل‌های معنایی —————
def item_of(bank_no: int, n: int) -> dict:
    return next(q for b in banks_def if b[0] == bank_no for q in b[3] if q["n"] == n)

assert item_of(9, 1)["accepted"] == ["cruel"]
assert item_of(9, 2)["accepted"] == ["hard working", "hardworking", "hard-working"]
assert item_of(9, 3)["accepted"] == ["upset", "sad"]
assert item_of(9, 4)["accepted"] == ["quiet"]
assert item_of(12, 2)["answer"] == 3 and item_of(12, 2)["options"][3] == "kind"
assert item_of(12, 3)["answer"] == 2 and item_of(12, 3)["options"][2] == "an"
assert item_of(13, 1)["options"][1] == "help"
assert item_of(13, 5)["options"] == ["office", "library", "company", "homework"]
assert item_of(15, 4)["answer"] == 1 and item_of(15, 4)["options"][1] == "She is a careful girl."
# هیچ تایپیِ تک‌گزینه‌ای (قفلِ r363)
for _, _, _, qs in banks_def:
    for q in qs:
        if q.get("kind") == "typed":
            assert len(q["options"]) >= 2, q["id"]
print("items built: 29 — locks OK")

# ————— رسید —————
lexicon = {
    "Kind": "مهربان", "Lazy": "تنبل", "Angry": "عصبانی", "Neat": "مرتب", "Big": "بزرگ",
    "Nervous": "مضطرب", "Brave": "شجاع", "Patient": "صبور", "Careful": "بادقت",
    "Careless": "بی‌دقت", "Clever": "باهوش", "Pleasant": "دلپذیر", "Cruel": "بی‌رحم",
    "Polite": "مودب", "Quiet": "ساکت", "Rude": "بی‌ادب", "Friendly": "صمیمی",
    "Selfish": "خودخواه", "Funny": "بامزه", "Serious": "جدی", "Generous": "بخشنده",
    "Happy": "خوشحال", "Shy": "خجالتی", "Hard working": "سخت‌کوش", "Talkative": "پرحرف",
    "Helpful": "مفید", "Upset": "ناراحت",
}
quirks = [
    "چیدمانِ دوستونیِ RTL در س۲/س۶/س۱۱ (دو آیتم در یک سطرِ چاپ) — با لنگرِ شماره‌ها بازچینی شد (قرارداد r361)",
    "چاپ‌غلطِ «deask» (س۶ ق۱ به‌جای desk) — verbatim در ساقه",
    "جداکنندهٔ سومِ س۹-۵ به‌صورتِ خطِ تیرهٔ چسبیده چاپ شده («library-») — با الگوی «- » جدا شد؛ چهار واژه: office/library/company/homework",
    "آپاستروفِ وارونهٔ چاپیِ س۱۴ («I`m brave.» / «No, she isn`t.» با backtick) — verbatim؛ نرمال‌سازِ موتور backtick را به آپاستروفِ راست یکسان می‌کند",
    "«d –No» و «e –No» بدونِ فاصله پس از خطِ تیره — در متنِ گزینه اثری ندارد",
    "رهروهای نقطه‌چینِ اطرافِ بلنک‌ها (با نقطه‌های مجاورِ خودشان) در یک رانِ تیرهٔ «-------» فروپاشیدند؛ فاصلهٔ پس از ران درج شد (بازسازیِ خوانا)",
    "سه‌گونه‌چاپیِ یک واژه در خودِ جزوه: «Hard working» (واژنامه) / «a hard-working worker» (مثالِ درس) / «hardworking» (س۹-۷) — هر سه شکل در acceptedِ متضادِ lazy",
    "ساقه‌های س۴ برچسب‌های چاپیِ «سوالی :/منفی:» را حفظ کرده‌اند — متنِ مختلطِ فارسی-لاتین، عینِ چاپ",
    "شماره‌های چاپیِ آیتم‌ها به فیلدِ n منتقل شدند و از ساقه حذف شدند (قرارداد r362)",
    "دستورِ چندخطیِ س۶ در لایه به‌هم‌ریخته است («جاهای خالی را باthere is/وthere are/.کامل کنید») — لنگرگیریِ ساقه‌ها با «1)»",
    "گزینه‌های س۱۴ در سطرِ خودِ سؤال‌ها چاپ شده‌اند (a با ق۱ … d با ق۴) و «e» تنها — پنج گزینه برای هر چهار سؤال",
]
receipt = {
    "extractedRound": "r364",
    "section": "سؤالات امتحانی درس اول پایه نهم",
    "examPages": "ص۳۱-۳۳ (برچسبِ فوترِ خودِ اسکن در این بازه با شمارهٔ PDF برابر است)",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 15,
    "sectionsExtracted": 7,
    "sectionsSkipped": 8,
    "items": 29,
    "bankCounts": [4, 2, 4, 3, 7, 5, 4],
    "keyPolicy": "کلیدِ استنتاجیِ لغت‌نامه‌محور/ساختاری: هر کلید یا از توافقِ نحویِ خودِ ساقه (س۶/س۱۱) یا از واژنامهٔ بیست‌وهفت‌واژه‌ایِ خودِ درس اول (س۲/س۷/س۹) یا از توافقِ ضمیر و نوعِ پرسش (س۱۴) یکتا می‌شود — الگوی خوداعتبارسنجیِ r357؛ هیچ کلیدی از خارجِ متنِ درس نیامده",
    "derivedKeys": {
        "S7": [
            "ق۱ «she is not quiet» → talkative (متضادِ مستقیمِ Quiet در واژنامه)",
            "ق۲ «Everybody likes him» → kind (تنها گزینهٔ مثبتِ سازگار)",
            "ق۳ «There is … apple» → an (an+واکه؛ a/some/6 ناسازگار)",
        ],
        "S9": [
            "ق۱ help = فعل میانِ چهار صفت",
            "ق۲ angry = حالتِ گذرا میانِ ویژگی‌های شخصیتی (موضوعِ واحدِ درس: Personality)",
            "ق۳ cruel = تنها منفی میانِ سه مثبت",
            "ق۴ person = اسم میانِ چهار صفت",
            "ق۵ homework = غیرِ مکان",
            "ق۶ nervous = حالتِ گذرا (همان استدلالِ ق۲)",
            "ق۷ careless = تنها منفی",
        ],
        "S14": [
            "ق۱ «Are you angry?» → e «No, we are not.» (تنها پاسخِ you/we؛ بقیه he/she یا خودتوصیفی)",
            "ق۲ «Is your uncle careful?» → a «Yes, he is.» (he=uncle)",
            "ق۳ «What are you like?» → c «I`m brave.» (تنها خودتوصیفیِ I-form)",
            "ق۴ «What is your sister like?» → b «She is a careful girl.» (Wh نیازمندِ توصیف؛ d پاسخِ بله/خیر است)",
        ],
    },
    "skippedSections": [
        "س۱: صفتِ مناسب برای هر تصویر — تصویری؛ بانکِ (Cruel–careless–rude–brave) بدونِ تصویر کلیدپذیر نیست",
        "س۳ و س۱۲: تطبیقِ جمله با تصویر — تصویری (جمله‌ها در لایه موجودند ولی بدونِ تصویر بی‌کلیدند)",
        "س۵ و س۱۵: تولیدِ آزاد («پاسخ کامل دهید» / «متن را کامل کنید») — بی‌کلیدِ یکتا",
        "س۸: دیالوگِ بانک‌واژه‌ای — جای‌خالی‌های ۴/۵ دو تفسیرِ سازگار دارند (selfish/patient) — ابهامِ دوکلیدی؛ به قراردادِ r358 وارد بانک نمی‌شود",
        "س۱۰: افتان و خیزان — آهنگی؛ در قالبِ تعاملیِ متنیِ فعلی سنجش‌پذیر نیست",
    ],
    "printQuirkCount": len(quirks),
    "printQuirks": quirks,
    "lessonLexicon": lexicon,
    "typedNote": "بانک‌های تایپیِ س۲/س۱۰ اسکافولدِ غلطِ درون‌بانکی دارند (پاسخِ آیتمِ دیگرِ همان بانک) — قفلِ «تک‌گزینه‌ایِ ممنوع» r363؛ س۶/س۱۱ گزینه‌های ساختاریِ خودِ دستورِ چاپ‌اند (There is/There are و am/is/are)",
}

# ————— نوشتن —————
data = json.loads(G9.read_text(encoding="utf-8"))
if "g9exam1" in data["source"]:
    print("g9exam1 receipt already present — NO-OP")
    raise SystemExit(0)

new_banks = []
for bank_no, title, level, qs in banks_def:
    new_banks.append({"lesson": bank_no, "title": title, "level": level, "count": len(qs), "questions": qs})

existing_ids = [q["id"] for b in data["lessons"] for q in b["questions"]]
new_ids = [q["id"] for b in new_banks for q in b["questions"]]
assert len(existing_ids) == 112 and len(new_ids) == 29
assert len(set(existing_ids + new_ids)) == 141, "id collision"

data["lessons"].extend(new_banks)
data["source"]["g9exam1"] = receipt

before = G9.read_text(encoding="utf-8")
out = json.dumps(data, ensure_ascii=False, indent=1) + "\n"
if out == before:
    print("NO-OP")
else:
    G9.write_text(out, encoding="utf-8")
    import hashlib
    print(f"WROTE {len(out)} bytes md5={hashlib.md5(out.encode()).hexdigest()[:8]}")
for b in new_banks:
    print(f"  bank {b['lesson']}: {b['title'][:56]} — {b['count']}")
