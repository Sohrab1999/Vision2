# -*- coding: utf-8 -*-
# r351 — بستنِ رگرسیونِ بازِ r283/r320: تطبیقِ گریدِ چاپیِ «عبارات الحاق ص۴۴» (انتهای ص۱۸۷ دوازدهم)
# و گریدِ «معلوم و مجهول بخش دوم ص۳۷-۳۸» (بالای ص۱۸۷) با داده‌های grammar-g12-topic.json
import json
import re

import fitz

doc = fitz.open("/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf")
t = doc[186].get_text("text")

# گریدِ الحاق (۲۰ جفت پس از Note)
i_note = t.find("ote")
tag_pairs = re.findall(r'\b([a-d])\s*\n?\s*(\d{1,3})\b', t[i_note:])
tag = {}
for letter, num in tag_pairs:
    n = int(num)
    assert n not in tag, f"dupe {n}"
    tag[n] = letter
assert sorted(tag) == list(range(1, 21)), f"tag grid coverage: {sorted(tag)}"
printed_tag = "".join(tag[n] for n in range(1, 21))

# گریدِ معلوم/مجهول بخش دوم (۴۰ جفت پیش از «ج»)
i_top = t.find("بخش")
top_pairs = re.findall(r'\b([a-d])\s*\n?\s*(\d{1,3})\b', t[:i_note])
top = {}
for letter, num in top_pairs:
    n = int(num)
    if n not in top:
        top[n] = letter
print("top-grid unique:", len(top), "| range:", min(top), "-", max(top))
printed_top = "".join(top[n] for n in sorted(top)) if len(top) == 40 else None

# داده‌های اپ
data = json.load(open("public/jozve/grammar-g12-topic.json"))


def find_bank(pred):
    out = []

    def walk(o):
        if isinstance(o, list):
            for x in o:
                walk(x)
        elif isinstance(o, dict):
            if pred(o):
                out.append(o)
            for v in o.values():
                walk(v)
    walk(data)
    return out[0] if out else None


def answers_of(bank):
    out = []
    for q in bank["questions"]:
        a = q.get("answer")
        if isinstance(a, list):
            out.append("".join("abcd"[i] for i in a))
        elif a is not None:
            out.append("abcd"[a])
        else:
            out.append(q.get("answerText", "?"))
    return out


b_tag = find_bank(lambda x: isinstance(x.get("title"), str) and "دستگرمی (ص۴۴)" in x["title"])
app_tag = "".join(answers_of(b_tag))
print("TAG grid — app    :", " ".join(app_tag))
print("TAG grid — printed:", " ".join(printed_tag))
print("TAG verdict:", "AGREE 20/20" if app_tag == printed_tag else f"DIVERGE {[(i+1,a,b) for i,(a,b) in enumerate(zip(app_tag, printed_tag)) if a!=b]}")

b_pas = find_bank(lambda x: isinstance(x.get("title"), str) and "بخش دوم، کنکوری (ص۳۷-۳۸)" in x["title"])
if b_pas and printed_top:
    app_pas = "".join(answers_of(b_pas))
    same = app_pas == printed_top
    print("PASSIVE grid — app:", app_pas[:40])
    print("PASSIVE grid — printed:", printed_top[:40])
    print("PASSIVE verdict:", "AGREE 40/40" if same else f"DIVERGE at {[i+1 for i,(a,b) in enumerate(zip(app_pas, printed_top)) if a!=b]}")

# ثبتِ رسید در worklog-سازگار: خروجی برای راند
json.dump({
    "tag_grid_printed": printed_tag,
    "tag_app": app_tag,
    "tag_agree": app_tag == printed_tag,
    "passive_printed": printed_top,
    "passive_agree": (answers_of(b_pas) and "".join(answers_of(b_pas)) == printed_top) if (b_pas and printed_top) else None,
}, open("/tmp/r351-tags-receipt.json", "w"), ensure_ascii=False)
print("receipt -> /tmp/r351-tags-receipt.json")
