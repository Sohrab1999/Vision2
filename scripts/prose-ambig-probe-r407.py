#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r407 — پروبِ خانواده‌هایِ مستندِ باقی‌ماندهٔ نثر (از nextRoundCandidates رَ r406).

هر رخداد با بافتِ کامل + شناسهٔ جایگاه (سند/فصل/سکشن/خط) در
scripts/r407-ambig-contexts.json تخلیه می‌شود تا حکمِ بافتی روی آن انجام گیرد.
دامنه: همهٔ فایل‌هایِ public/jozve/*.json (نه فقط g10-g12) — چون خانوادهٔ
«نیم در بانک‌هایِ tests-gN» آگاهانه به این راند موکول شده بود.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')
FA = '[\\u0600-\\u06FF\\u200c]'

# (نامِ خانواده، الگو) — الگوها برای پروبِ خام؛ حکم نهایی در اسکریپتِ اصلاح
FAMILIES = [
    ('مطمی',   rf'(?<!{FA})مطمی'),
    ('دخی',    rf'(?<!{FA})دخی'),
    ('میس',    rf'(?<!{FA})میس'),
    ('میش',    rf'(?<!{FA})میش'),
    ('کیم',    rf'(?<!{FA})کیم'),
    ('منطف',   rf'(?<!{FA})منطف'),
    ('شییت',   rf'(?<!{FA})شییت'),
    ('شیر یتن', r'شیر یتن'),
    ('گیی',    rf'(?<!{FA})گیی'),
    ('معتی',   rf'(?<!{FA})معتی'),
    ('یمکن',   rf'(?<!{FA})یمکن'),
    ('نیم',    rf'(?<!{FA})نیم(?!{FA})'),
    ('همچنین-family: چنتین/حنتین', rf'(?<!{FA})(چنتین|حنتین|جنتین)'),
    ('پیشنهادِ خانواده: بشن/بن (فعل)', rf'(?<!{FA})بن\b'),
]


def walk(doc, g):
    """همهٔ (where, text) های یک سند — شاملِ عنوانِ سکشن، خط‌ها و (اگر باشد) سؤال‌ها."""
    for ch in doc.get('chapters', []):
        for si, sec in enumerate(ch.get('sections', [])):
            stype = sec.get('type', '')
            yield f'{g}:{ch["id"]}:{si}:{stype}:title', sec.get('title', '')
            for li, ln in enumerate(sec.get('lines', [])):
                yield f'{g}:{ch["id"]}:{si}:{stype}:L{li}', ln
            for qi, q in enumerate(sec.get('questions', []) or []):
                stem = q.get('stem') or q.get('q') or ''
                if stem:
                    yield f'{g}:{ch["id"]}:{si}:{stype}:Q{qi}:stem', stem
                for oi, opt in enumerate(q.get('options', []) or []):
                    yield f'{g}:{ch["id"]}:{si}:{stype}:Q{qi}:o{oi}', str(opt)
                for ai, acc in enumerate(q.get('accepted', []) or []):
                    yield f'{g}:{ch["id"]}:{si}:{stype}:Q{qi}:a{ai}', str(acc)


def walk_tests(doc, g):
    """ساختارِ فایل‌هایِ بانکِ آزمون (questions در سطحِ ریشه)."""
    for qi, q in enumerate(doc.get('questions', []) or []):
        stem = q.get('stem') or q.get('q') or ''
        if stem:
            yield f'{g}:q{qi}:stem', stem
        for oi, opt in enumerate(q.get('options', []) or []):
            yield f'{g}:q{qi}:o{oi}', str(opt)
        for ai, acc in enumerate(q.get('accepted', []) or []):
            yield f'{g}:q{qi}:a{ai}', str(acc)


def main():
    hits: dict = {}
    files = sorted(f for f in os.listdir(JOZ) if f.endswith('.json') and f != 'index.json')
    for fname in files:
        g = fname[:-5]
        doc = json.load(open(os.path.join(JOZ, fname), encoding='utf-8'))
        stream = walk_tests(doc, g) if fname.startswith('tests-') else walk(doc, g)
        for where, text in stream:
            if not text:
                continue
            for name, pat in FAMILIES:
                rx = re.compile(pat)
                for m in rx.finditer(text):
                    key = f'{name}|{g}'
                    hits.setdefault(key, []).append({
                        'where': where,
                        'ctx': text[max(0, m.start() - 40):m.end() + 50],
                    })
    out = {k: v for k, v in sorted(hits.items(), key=lambda x: (x[0].split('|')[0], x[0].split('|')[1]))}
    json.dump(out, open(os.path.join(ROOT, 'scripts', 'r407-ambig-contexts.json'), 'w',
                        encoding='utf-8'), ensure_ascii=False, indent=1)
    total = 0
    for k, rows in out.items():
        total += len(rows)
        print(f'{len(rows):4d}  {k}')
        for row in rows[:3]:
            print(f'        {row["where"]}  …{row["ctx"][:70]}…')
    print(f'TOTAL: {total}')


if __name__ == '__main__':
    main()
