#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r406 — پروبِ خانواده‌هایِ مبهمِ باقی‌ماندهٔ نثرِ گ۱۰-گ۱۲ (شی/نیم/ری/طوالت/همکالش/عقالت/معت).

هر رخداد را با بافت (خطِ کامل + شناسهٔ جایگاه: سند/فصل/بخش/اندیسِ خط) چاپ می‌کند
تا حکمِ بافتیِ دستی روی نمونه‌هایِ چاپی انجام شود. خروجی: scripts/r406-ambig-contexts.json
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')

# خانواده‌ها — الگویِ توکنی
FAMILIES = [
    ('she',      r'\bشی\b'),            # ردشدهٔ r402: ناهمگون (شیر/آموزشی/سریع)
    ('nim',      r'\bنیم\b'),           # نیمِ حقیقی vs نا-می/نامیِ شکسته
    ('rey',      r'(?<![آ-ی])ری(?![آ-ی])'),  # شهرِ ری (بجاست) vs مangle
    ('tevalat',  r'\bطوالت\b'),         # خانوادهٔ لا↔ال
    ('hamkalesh',r'\bهمکالش\b'),
    ('aghalat',  r'\bعقالت\b'),
    ('met',      r'\bمعت\b'),           # معنیِ بی-نی (غیرِ «معت فاریس» که رفع شد)
]

def iter_strings(doc, grade):
    """هر (path, text) در سند — خط‌ها + عنوان‌ها."""
    for ci, ch in enumerate(doc.get('chapters', [])):
        cid, ctitle = ch.get('id'), ch.get('title', '')
        for si, sec in enumerate(ch.get('sections', [])):
            base = f'g{grade}:{cid}:{si}:{sec.get("type","")}'
            if sec.get('title'):
                yield (base + ':title', str(sec['title']))
            for li, line in enumerate(sec.get('lines', [])):
                if isinstance(line, str):
                    yield (f'{base}:L{li}', line)

out = {}
for grade in (10, 11, 12):
    doc = json.load(open(os.path.join(JOZ, f'g{grade}.json')))
    for name, pat in FAMILIES:
        rx = re.compile(pat)
        hits = []
        for path, text in iter_strings(doc, grade):
            for m in rx.finditer(text):
                s, e = m.span()
                ctx = text.strip()
                hits.append({'where': path, 'match': m.group(0), 'context': ctx})
        if hits:
            out.setdefault(name, {}).setdefault(f'g{grade}', hits)

# خلاصهٔ چاپی برای تصمیم‌گیری
total = 0
for name, per_doc in out.items():
    n = sum(len(v) for v in per_doc.values())
    total += n
    print(f'== {name}: {n}')
    for gd, hits in per_doc.items():
        print(f'   {gd}: {len(hits)}')
        for h in hits[:200]:
            print(f'     [{h["where"]}] {h["context"][:150]}')

json.dump(out, open(os.path.join(ROOT, 'scripts', 'r406-ambig-contexts.json'), 'w'),
          ensure_ascii=False, indent=1)
print(f'TOTAL: {total} -> scripts/r406-ambig-contexts.json')
