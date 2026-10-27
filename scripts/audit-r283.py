#!/usr/bin/env python3
"""audit-r283.py — رسید کامل بانک‌های عبارات الحاق برای بازبینی چشمی"""
import json

d = json.load(open('/home/z/my-project/public/jozve/grammar-g12-topic.json'))
l8 = d['lessons'][7]
l9 = d['lessons'][8]
print('=== BANK A (20) ===')
for q in l8['questions']:
    print(f"{q['n']:2d}| {q['question']}")
    opts = ' | '.join(chr(97 + i) + ') ' + o for i, o in enumerate(q['options']))
    print(f'    {opts}  → {chr(97 + q["answer"])}')
print()
print('=== BANK B (15) ===')
for q in l9['questions']:
    print(f"{q['n']:2d}| {q['question']}")
    opts = ' | '.join(chr(97 + i) + ') ' + o for i, o in enumerate(q['options']))
    print(f'    {opts}  → {chr(97 + q["answer"])}')
