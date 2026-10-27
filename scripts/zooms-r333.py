# -*- coding: utf-8 -*-
# r333 — زوم‌های داوری: سربرگ ص۹۷ (تستی/تشریحی؟) + بالای کلید ص۲۶۴
import fitz
from pathlib import Path

PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"
OUT = Path("/tmp/r333"); OUT.mkdir(exist_ok=True)
doc = fitz.open(PDF)

pix = doc[96].get_pixmap(dpi=2600, clip=fitz.Rect(40, 18, 555, 50))
pix.save(str(OUT / "p97-header.png")); print("p97-header", pix.width, pix.height)
pix = doc[263].get_pixmap(dpi=2200, clip=fitz.Rect(40, 40, 555, 80))
pix.save(str(OUT / "p264-top.png")); print("p264-top", pix.width, pix.height)
