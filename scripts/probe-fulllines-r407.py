#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r407 — تخلیهٔ خطِ کاملِ همهٔ رخدادهایِ خانواده‌هایِ حکم‌ممحوز + شواهدِ کورپوس."""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')
FA = '[\\u0600-\\u06FF\\u200c]'

PROBES = {
    'دخی':  rf'(?<!{FA})(دخی|دخیر)',
    'مطمی': rf'(?<!{FA})مطمی',
    'معتی': rf'(?<!{FA})معتی',
    'منطف': rf'(?<!{FA})منطف',
    'میس':  rf'(?<!{FA})میس',
    'میشـجدا': rf'(?<!{FA})میش(?![\u0600-\u06FF\u200c])',
    'کیم':  rf'(?<!{FA})کیم',
    'گیی':  rf'(?<!{FA})گیی',
    'شییت': rf'(?<!{FA})شییت',
    'یم':   rf'(?<!{FA})یم(?=[\u0600-\u06FF\u200c])',
    'نیم+فعل': rf'(?<!{FA})نیم(?=شود|کرد|کن|خواه|خوان|دان|ده|گیر|بین|آورد|رفت|آمد)',
    'نیمـجدا': rf'(?<!{FA})نیم(?![\u0600-\u06FF\u200c])',
}


def texts_of(doc, fname):
    out = []

    def walk(o, path):
        if isinstance(o, str):
            out.append((path, o))
        elif isinstance(o, dict):
            for k, v in o.items():
                walk(v, f'{path}.{k}')
        elif isinstance(o, list):
            for i, v in enumerate(o):
                walk(v, f'{path}[{i}]')
    walk(doc, fname)
    return out


def main():
    res: dict = {}
    for fname in sorted(os.listdir(JOZ)):
        if not fname.endswith('.json') or fname == 'index.json':
            continue
        doc = json.load(open(os.path.join(JOZ, fname), encoding='utf-8'))
        for name, pat in PROBES.items():
            rx = re.compile(pat)
            for path, t in texts_of(doc, fname):
                for m in rx.finditer(t):
                    res.setdefault(name, []).append({
                        'file': fname, 'path': path, 'line': t, 'hit': m.group(0),
                    })
    out = {}
    for name, rows in res.items():
        out[name] = rows
        print(f'=== {name}: {len(rows)} ===')
        for r in rows:
            print(f'  [{r["file"]} @ {r["path"][:58]}] hit=«{r["hit"]}»')
            print(f'      LINE: {r["line"][:240]}')
    json.dump(out, open(os.path.join(ROOT, 'scripts', 'r407-fulllines.json'), 'w',
                        encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
