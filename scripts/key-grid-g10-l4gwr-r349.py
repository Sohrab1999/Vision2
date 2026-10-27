# -*- coding: utf-8 -*-
# r349c — استخراجِ گریدِ کاملِ کلیدِ «تست گرامر و نگارش درس چهارم» استاندارد (ص۲۹۵-۲۹۹)
import fitz, re

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")
full = "".join(doc[pno].get_text("text") for pno in range(294, 299))
norm = full.replace("\n", " ")
entries = re.findall(r"(\d{1,2})\s*-?\s*گ\s*زی\S*\s*\(?\s*([a-d])\s*\)", norm)
grid = {}
for n, l in entries:
    n = int(n)
    if n not in grid:
        grid[n] = l
print("entries:", len(grid))
print(" ".join(f"{n}{grid[n]}" for n in sorted(grid)))
missing = [n for n in range(1, 58) if n not in grid]
print("missing:", missing)
