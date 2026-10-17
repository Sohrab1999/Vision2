#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 split — هر ترکیب صفحه را به دو نیمهٔ عمودی تقسیم کن (خواناییِ Read)"""
from PIL import Image

for pno in (215, 216, 217, 218):
    img = Image.open(f"/tmp/r316-blocks-p{pno}.png")
    w, h = img.size
    # نیمهٔ بالا و پایین با هم‌پوشانیِ 60px (بلوک مرزی دوبار دیده شود)
    mid = h // 2
    top = img.crop((0, 0, w, min(h, mid + 60)))
    bot = img.crop((0, max(0, mid - 60), w, h))
    top.save(f"/tmp/r316-p{pno}-a.png")
    bot.save(f"/tmp/r316-p{pno}-b.png")
    print(f"p{pno}: a={top.size} b={bot.size}")
