#!/usr/bin/env python3
"""probe-g11-r275.py — کاوش فصل‌های تست c12/c13/c14 جزوهٔ یازدهم و صفحات PDF"""
import fitz, json, re

ROOT = "/home/z/my-project"
PDF = f"{ROOT}/upload/جزوه جامع یازدهم .pdf"
G11 = f"{ROOT}/public/jozve/g11.json"
g11 = json.load(open(G11))
ch = {c["id"]: c for c in g11["chapters"]}

for cid in ("c12", "c13", "c14"):
    secs = ch[cid]["sections"]
    print(f"===== {cid}: {len(secs)} sections =====")
    for i, s in enumerate(secs):
        head = " / ".join(s["lines"][:1])[:95] if s["lines"] else "(empty)"
        joined = " ".join(s["lines"])
        pairs = re.findall(r"(?<![A-Za-z\d])(\d{1,3})\s+([a-d])(?![A-Za-z])", joined)
        print(f"  sec{i} ({len(s['lines']):3d}L, {len(pairs):3d} pairs): {head}")
    print()

doc = fitz.open(PDF)
print("PDF pages:", doc.page_count)
for label, pages in (("L1 (19-20)", (18, 19)), ("L2 (57-58)", (56, 57)), ("L3 (91-92)", (90, 91))):
    qnums = []
    for p in pages:
        if p >= doc.page_count:
            continue
        for ln in doc[p].get_text("text").splitlines():
            m = re.match(r"^\s*(\d{1,3})\.\s", ln)
            if m:
                qnums.append(int(m.group(1)))
    print(f"{label}: {len(qnums)} question-number lines | unique {len(set(qnums))} | range {min(qnums) if qnums else '-'}..{max(qnums) if qnums else '-'}")
print("\n--- page 19 (0-idx 18) first 22 lines ---")
for ln in doc[18].get_text("text").splitlines()[:22]:
    print(f"  |{ln[:120]}")
