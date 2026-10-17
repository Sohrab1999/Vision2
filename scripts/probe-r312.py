# -*- coding: utf-8 -*-
"""r312 probe — ص۵۴-۵۶ (درس دوم) و ص۸۸-۹۰ (درس سوم) + کلیدهای ۱۸۴/۱۹۳"""
import re
from pathlib import Path
import pdfplumber

ROOT = Path("/home/z/my-project")
PDF = ROOT / "upload/جزوه جامع یازدهم .pdf"

with pdfplumber.open(str(PDF)) as pdf:
    for pno in [54, 55, 56, 88, 89, 90, 184, 193]:
        t = pdf.pages[pno - 1].extract_text() or ""
        print(f"===== PAGE {pno} ({len(t)} chars) =====")
        lines = t.splitlines()
        for ln in lines[:12]:
            print(" |", ln)
        if pno in (184, 193):
            print(" ... FULL:")
            for ln in lines:
                print(" |", ln)
        print()
