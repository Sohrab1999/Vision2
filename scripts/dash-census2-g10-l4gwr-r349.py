# -*- coding: utf-8 -*-
# r349e — سنزِ تیره به تفکیک سؤال (۱-۵۷)
import fitz, re

doc = fitz.open("/home/z/my-project/upload/جزوه جامع دهم .pdf")
txt = "".join(doc[pno].get_text("text") for pno in (166, 167, 168))

# جداکردن ساقه‌ها با شماره‌های آغازین
parts = re.split(r"(?m)^\s*(\d{1,2})\s*-", txt)
census = {}
for i in range(1, len(parts), 2):
    n = int(parts[i]); body = parts[i + 1]
    # فقط پیش از اولین گزینهٔ a)
    ia = body.find("a)")
    if ia > 0: body = body[:ia]
    runs = [len(r) for r in re.findall(r"(-{2,})", body)]
    if n <= 57:
        census[n] = runs
for n in sorted(census):
    print(f"Q{n}: {census[n]}")
print("total runs:", sum(len(v) for v in census.values()))
print("total blanks:", sum(sum(v) for v in census.values()))
