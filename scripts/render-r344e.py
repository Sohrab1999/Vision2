# -*- coding: utf-8 -*-
# r344e — بازسازیِ واژه‌به‌واژهٔ کلیدِ ص۱۲۸ (y=480-640) با مختصات و رنگ
import fitz

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
page = doc[127]

words = page.get_text("words")
words = sorted([w for w in words if 480 <= w[1] <= 645], key=lambda w: (round(w[1]), -w[0]))
cur_line = None
for x0, y0, x1, y1, t, *_ in words:
    key = round(y0)
    if cur_line != key:
        print()
        print(f"y={key}: ", end="")
        cur_line = key
    print(t, end=" | ")
print()

# رنگِ هر خطِ کلیدی
d = page.get_text("dict")
print("\n--- spans in y 480-645 ---")
for block in d["blocks"]:
    if block.get("type") != 0:
        continue
    for line in block["lines"]:
        for span in line["spans"]:
            y = span["bbox"][1]
            if 480 <= y <= 645:
                c = span["color"]
                r, g, b = (c >> 16) & 255, (c >> 8) & 255, c & 255
                print(f"y={y:.0f} #{r:02x}{g:02x}{b:02x} {span['text']!r}")
