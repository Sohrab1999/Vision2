# -*- coding: utf-8 -*-
# r363 — کاتالوگِ کاملِ ۱۲ سکشنِ «تمرین ۱/۲» شش درسِ نهم + نقشهٔ «سؤالات امتحانی»
import re

txt = open("/home/z/my-project/booklet-extract/g9.txt").read()
lines = txt.split("\n")

# ————— ۱) کاتالوگِ تمرین‌ها —————
HEADERS = []  # (page, idx, title)
cur_page = None
for i, l in enumerate(lines):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        cur_page = int(m.group(1))
        continue
    s = l.strip()
    if re.match(r"^تمرین\s*[12]?\s*$", s) or re.match(r"^تمرین[12]", s):
        # صفحهٔ چاپی را از سطر بعدی بگیر
        nxt = lines[i + 1].strip() if i + 1 < len(lines) else ""
        HEADERS.append((cur_page, i, s, nxt))

print("===== تمرین headers =====")
for h in HEADERS:
    print(h)

# ————— ۲) برای هر تمرین: بلوکِ EN/FA تا تمرین بعدی/سربرگ بعدی —————
STOP = re.compile(r"^تمرین|سواالت امتحانی|^آهنگ زبان|^کلمات ،عبارات|^Intonation")
QEN = re.compile(r"^[A-Za-z(‘’'].*\?\s*$")   # سؤالِ انگلیسی
AEN = re.compile(r"^(Yes|No)[,.\s]", re.I)   # پاسخِ بله/خیر

print("\n===== تمرین block dumps (EN/FA lines only) =====")
for hidx, (pg, idx, title, nxt) in enumerate(HEADERS):
    end = HEADERS[hidx + 1][1] if hidx + 1 < len(HEADERS) else idx + 80
    print(f"\n----- [{title}] pdf-p{pg} ({nxt}) lines {idx}..{end} -----")
    for i in range(idx, min(end, idx + 60)):
        s = lines[i].strip()
        if not s or s.startswith("<<<PAGE") or s in ("جزوه کامل زبان انگلیسی",) or re.fullmatch(r"\d{1,3}", s):
            continue
        if STOP.search(s) and i != idx:
            break
        print(f"  {i}", repr(s[:90]))
