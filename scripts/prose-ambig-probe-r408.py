#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r408 — پروبِ سوییپِ سومِ نثر (از nextRoundCandidates رَ r407).

بخشِ الف: خانواده‌هایِ مستندِ باقی‌مانده (رسگریم/گسیش/شییعأ/حارص/بررسی ک .نیم)
بخشِ ب: کاوشِ خانواده‌هایِ پیشنهادیِ r407 — «رس/راز» (جابجاییِ ر) و «یج/یگ»
بخشِ پ: شمارشِ فرکانسیِ توکن‌هایِ فارسی برایِ کشفِ خانواده‌هایِ تازه

خروجی: scripts/r408-ambig-contexts.json + چاپِ خلاصه در stdout.
دامنه: هر ۱۵ فایلِ public/jozve/*.json — همهٔ فیلدهایِ رشته‌ای.
"""
import json
import os
import re
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')
FA = '[\\u0600-\\u06FF\\u200c]'

# (نامِ خانواده، الگو) — پروبِ خام؛ حکم نهایی در اسکریپتِ اصلاح
FAMILIES = [
    ('رسگریم',            rf'(?<!{FA})رسگریم'),
    ('گسیش',              rf'(?<!{FA})گسیش'),
    ('شییعأ',             r'شییعأ'),
    ('حارص',              rf'(?<!{FA})حارص'),
    ('بررسی ک .نیم',      r'بررسی ک ?\.? ?نیم'),
    # کاوشِ پیشنهادیِ r407
    ('رس-standalone',     rf'(?<!{FA})رس(?!{FA})'),
    ('راز-transposed',    rf'(?<!{FA})زرا(?!{FA})'),
    ('یج-standalone',     rf'(?<!{FA})یج(?!{FA})'),
    ('یگ-standalone',     rf'(?<!{FA})یگ(?!{FA})'),
]

TOKEN_RE = re.compile(r'[\u0621-\u064A\u0670-\u06D3\u200c]{3,}')


def walk(doc, g):
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
    for qi, q in enumerate(doc.get('questions', []) or []):
        stem = q.get('stem') or q.get('q') or ''
        if stem:
            yield f'{g}:q{qi}:stem', stem
        for oi, opt in enumerate(q.get('options', []) or []):
            yield f'{g}:q{qi}:o{oi}', str(opt)
        for ai, acc in enumerate(q.get('accepted', []) or []):
            yield f'{g}:q{qi}:a{ai}', str(acc)


def main():
    fam_hits = defaultdict(list)
    tokens = Counter()
    token_ctx = defaultdict(list)

    for fn in sorted(os.listdir(JOZ)):
        if not fn.endswith('.json') or fn == 'index.json':
            continue
        g = fn[:-5]
        with open(os.path.join(JOZ, fn), encoding='utf-8') as f:
            doc = json.load(f)
        walker = walk_tests(doc, g) if fn.startswith('tests-') or fn.startswith('grammar-') else walk(doc, g)
        for where, text in walker:
            text = str(text)
            if not text:
                continue
            for name, pat in FAMILIES:
                for m in re.finditer(pat, text):
                    s = max(0, m.start() - 55)
                    e = min(len(text), m.end() + 55)
                    fam_hits[name].append({'where': where, 'ctx': text[s:e]})
            for t in TOKEN_RE.findall(text):
                tokens[t] += 1
                if len(token_ctx[t]) < 3:
                    token_ctx[t].append(where)

    out = {'families': {k: v for k, v in fam_hits.items()},
           'token_top': dict(tokens.most_common(400))}
    with open(os.path.join(ROOT, 'scripts', 'r408-ambig-contexts.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    print('=== بخشِ الف: خانواده‌هایِ مستند ===')
    for name in ['رسگریم', 'گسیش', 'شییعأ', 'حارص', 'بررسی ک .نیم']:
        hits = fam_hits.get(name, [])
        print(f'\n[{name}] {len(hits)} hit(s)')
        for h in hits[:6]:
            print('  ', h['where'], '::', h['ctx'].replace('\n', ' '))
    print('\n=== بخشِ ب: کاوشِ رس/راز و یج/یگ ===')
    for name in ['رس-standalone', 'راز-transposed', 'یج-standalone', 'یگ-standalone']:
        hits = fam_hits.get(name, [])
        print(f'\n[{name}] {len(hits)} hit(s)')
        for h in hits[:10]:
            print('  ', h['where'], '::', h['ctx'].replace('\n', ' '))
    print('\n=== بخشِ پ: توکن‌هایِ پرتکرار (count>=5) برایِ چشم‌گردی ===')
    for t, c in tokens.most_common(400):
        if c >= 5:
            print(f'{c:4d}  {t}')


if __name__ == '__main__':
    main()
