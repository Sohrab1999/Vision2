#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe6 — نگاشتِ استخراجیِ بلوک→شمارهٔ آیتم + حرفِ کلید + تطبیق با JSON"""
import re, json, fitz

PDF = "/home/z/my-project/upload/جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf"
LIMIT218 = 316.0
doc = fitz.open(PDF)

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

print(f"blocks: {len(all_blocks)}")
LET = re.compile(r"\(([abcd])\)")
NUM = re.compile(r"(?:^|[\s\-«»()])((?:[۰-۹0-9]{1,3}))[\s\-]*$")
mismatch = []
for i, (pno, y0, y1) in enumerate(all_blocks, start=1):
    page = doc[pno - 1]
    clip = fitz.Rect(0, y0, page.rect.width, y1)
    txt = page.get_text("text", clip=clip)
    # حرف کلید
    letters = LET.findall(txt)
    # شمارهٔ آیتم: الگوهای «N -» یا «- N» یا «-N» در ابتدای/انتهای بلوک
    flat = txt.replace("\n", " ")
    nums = re.findall(r"-?\s*([۰-۹]{1,3}|1\d\d)\s*-", flat)
    fa2en = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
    cands = [int(n.translate(fa2en)) for n in nums]
    cands = [c for c in cands if 1 <= c <= 100]
    q = qs.get(i)
    json_ans = "abcd"[q["answer"]] if q else "?"
    letters_ok = letters and letters[0] == json_ans
    num_repr = cands[:4]
    flag = ""
    if q and i in qs:
        if not letters_ok:
            flag = "  <<< LETTER MISMATCH"
            mismatch.append((i, letters, json_ans))
    print(f"blk{i:3d} p{pno} y{y0:.0f}-{y1:.0f} | letters={letters[:2]} | nums={num_repr} | json=Q{i}:{json_ans}{flag}")

print("\nMISMATCHES:", mismatch if mismatch else "none — 100/100 letters agree")
