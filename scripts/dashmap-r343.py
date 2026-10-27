# -*- coding: utf-8 -*-
# r343 — نگاشتِ تیره‌ها به سؤال‌ها (شمارشِ لایه حاکم — قاعدهٔ r338/r341)
import fitz, re

doc = fitz.open('/home/z/my-project/upload/جزوه جامع دهم .pdf')
txt = ''.join(doc[p].get_text('text') for p in (137, 138, 139))

# برشِ بر اساسِ شمارهٔ سؤال در ابتدای سطر/پس از فاصله
pats = [(n, r'(?m)^\s*' + str(n) + r'\s*-') for n in range(1, 47)]
positions = []
for n, p in pats:
    m = re.search(p, txt)
    if m is None:  # شماره‌های چسبیده به حرف: 22-A / 34-I / 45-You
        m = re.search(r'(?m)^\s*' + str(n) + r'\s*-\s*(?=[A-Za-z"])', txt)
    assert m, f"Q{n} marker not found"
    positions.append((n, m.start(), m.end()))

runs = [(m.start(), len(m.group())) for m in re.finditer(r'-{6,}', txt)]

for i, (n, s, e) in enumerate(positions):
    e2 = positions[i + 1][1] if i + 1 < len(positions) else len(txt)
    seg = txt[s:e2]
    qs = seg.split('\n')[0][:34].replace('\n', ' ')
    bl = [len(m.group()) for m in re.finditer(r'-{6,}', seg)]
    # تیره‌های درونِ گزینه‌ها نداریم — همهٔ ران‌ها در ساقه‌اند
    print(f"Q{n:>2} blanks={bl}  first-line: {qs!r}")
