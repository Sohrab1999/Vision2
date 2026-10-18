# -*- coding: utf-8 -*-
# r352 — تشریحِ Q175 (ناموجود در پارسر) + رندرِ پنج سؤالِ دورانِ چندگانه
import fitz, re

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
doc = fitz.open(PDF)
txt = ""
for pno in range(177, 194):
    txt += doc[pno].get_text("text") + "\n"
txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)

i = txt.find("\n175.")
print("===== RAW LAYER around Q175 =====")
print(txt[i:i+700])
print("===== RAW LAYER end =====")

# ران‌های اطراف Q174 و Q176 برای اطمینان از مرزها
for q in (174, 176):
    j = txt.find(f"\n{q}.")
    print(f"--- Q{q} head: {txt[j:j+180].replace(chr(10), ' | ')}")
