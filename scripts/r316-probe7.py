#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe7 — نگاشتِ قطعیِ بلوک→(شماره، حرف) با فیلترِ لبهٔ راست + تطبیق JSON"""
import re, json, fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
LIMIT218 = 316.0
doc = fitz.open(PDF)
W = doc[214].rect.width

d = json.load(open("/home/z/my-project/public/jozve/tests-g12.json"))
l3 = [l for l in d["lessons"] if l["lesson"] == 3][0]
qs = {q["n"]: q for q in l3["questions"]}

all_blocks = []
for pno in (215, 216, 217, 218):
    page = doc[pno - 1]
    dd = page.get_text("dict")
    dashes, bottom = [], None
    for blk in dd["blocks"]:
        for ln in blk.get("lines", []):
            txt = "".join(sp["text"] for sp in ln["spans"]).strip()
            y = min(sp["bbox"][1] for sp in ln["spans"])
            if re.match(r"^-{10,}$", txt):
                dashes.append(y)
            if pno == 218 and y > LIMIT218:
                bottom = y if bottom is None else min(bottom, y)
    dashes.sort()
    tops = [18.0] + [x + 3 for x in dashes]
    bots = [x - 2 for x in dashes] + ([bottom - 4] if bottom else [815.0])
    for y0, y1 in zip(tops, bots):
        if y1 - y0 > 14:
            all_blocks.append((pno, y0, y1))

fa2en = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
LET = re.compile(r"^\(?([abcd])\)?[:,.]?$", re.I)
NUMW = re.compile(r"^\(?([0-9۰-۹]{1,3})\)?[,]?$")

rows = []
for i, (pno, y0, y1) in enumerate(all_blocks, start=1):
    page = doc[pno - 1]
    clip = fitz.Rect(0, y0, W, y1)
    words = page.get_text("words", clip=clip)
    # سرصفحه: کلمات در لبهٔ راست (x0 > 0.78W) در نیمهٔ بالاییِ بلوک
    h = y1 - y0
    lets, nums = [], []
    for x0, yy0, x1, yy1, wtxt, *_ in words:
        if x0 < W * 0.78:
            continue
        t = wtxt.strip().translate(fa2en)
        m = LET.match(t)
        if m:
            lets.append((yy0, m.group(1).lower()))
        m = NUMW.match(t)
        if m and 1 <= int(m.group(1)) <= 100:
            nums.append((yy0, int(m.group(1))))
    lets.sort(); nums.sort()
    # شمارهٔ آیتم: نزدیک‌ترین عدد به بالای بلوک
    num = None
    for yy, n in nums:
        if yy - y0 < h * 0.75:
            num = n
            break
    letter = lets[0][1] if lets else None
    q = qs.get(i)
    json_ans = "abcd"[q["answer"]] if q else "?"
    ok = "?" if (letter is None or num is None) else ("OK" if (num == i and letter == json_ans) else "XX")
    rows.append((i, pno, num, letter, json_ans, ok))
    print(f"blk{i:3d} p{pno} | num={num} letter={letter} json={json_ans} {ok}")

# خلاصه
oks = sum(1 for r in rows if r[5] == "OK")
xx = [r for r in rows if r[5] == "XX"]
qq = [r for r in rows if r[5] == "?"]
print(f"\nOK: {oks}/100 | XX: {[(r[0], r[2], r[3], r[4]) for r in xx]} | ??: {[(r[0]) for r in qq]}")
