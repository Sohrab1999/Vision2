# -*- coding: utf-8 -*-
"""r312 probe full — متن کامل صفحات بدنه و کلید"""
import sys
from pathlib import Path
import pdfplumber

ROOT = Path("/home/z/my-project")
PDF = ROOT / "upload/جزوه جامع یازدهم .pdf"

pages = [int(x) for x in sys.argv[1:]] or [54, 55, 56, 193]

with pdfplumber.open(str(PDF)) as pdf:
    for pno in pages:
        t = pdf.pages[pno - 1].extract_text() or ""
        print(f"===== PAGE {pno} ({len(t)} chars, {len(t.splitlines())} lines) =====")
        for i, ln in enumerate(t.splitlines()):
            print(f"{i:3d} | {ln}")
        print()
