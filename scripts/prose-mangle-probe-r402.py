#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r402 probe — شمارِ خانواده‌هایِ گلیفِ شکسته در نثرِ گ۱۰-گ۱۲ (خارج از جدول‌هایِ پالایش‌شده).

بازهٔ هدف: همهٔ سکشن‌هایِ g10/g11/g12 به‌جز سکشن‌هایِ دارای pairedFrom (جدول‌هایِ
r398/r401 که قبلاً پالایش شده‌اند). خروجی: فراوانیِ هر الگو برای تصمیمِ دامنه.
"""
import json
import re

ROOT = '/home/z/my-project'
JOZ = f'{ROOT}/public/jozve'

FAMILIES = {
    # la↔al (الفِ beginning) family — r397-proven forms
    'کالس': r'\bکالس', 'باال': r'\bباال', 'سؤايل': r'\bسؤايل', 'سواالت': r'\bسواالت',
    'حاال': r'\bحاال', 'تعطیالت': r'\bتعطیالت', 'اطالعات': r'\bاطالعات', 'عالقمند': r'\bعالقمند',
    'االن': r'\bاالن', 'مثاال': r'\bمثاال', 'افتتاح??': r'zzz', 'سالی': r'\bسالی\b',
    'عاالی': r'\bعاالی', 'عالی‌های': r'\bعالی', 'بالا-OK': r'\bبالا',
    # mi/یم family
    'یم-standalone': r'\bیم\b', 'نیم-standalone': r'\bنیم\b',
    # کمکی family
    'کمگ': r'\bکمگ', 'الزم': r'\bالزم', 'مفویل?': r'\bمفعویل', 'فاعیل': r'\bفاعیل', 'ملگ': r'\bملگ',
    # arabic yeh/kaf
    'ي-arabic': '[ي]', 'ك-arabic': '[ك]', 'ؤ-غلط?': 'ؤاالت',
    # misc
    'معت ': r'\bمعت ', 'فاریس': r'\bفاریس', 'فارش': r'\bفارش',
    'دستگی': r'\bدستگی', 'مالقات': r'\bمالقات', 'شی-نوشید': r'\bشی\b',
    'زندیک': r'\bزندیک', 'باالتر': r'\bباالتر', 'بالاتر-OK': r'\bبالاتر',
    'گایه': r'\bگایه', 'گاهی-OK': r'\bگاهی',
    'پییا': r'\bپییا', 'ری-standalone': r'\bری\b', 'شفه': r'\bشفه',
    'یس': r'\bیس\b', 'دی و تکم': r'دی و تکم', 'تر ز': r'تر ز\b',
}

counts = {}
samples = {}
for g in ('g10', 'g11', 'g12'):
    doc = json.load(open(f'{JOZ}/{g}.json', encoding='utf-8'))
    for ci, ch in enumerate(doc['chapters']):
        for si, sec in enumerate(ch.get('sections', [])):
            if sec.get('pairedFrom'):
                continue  # جدول‌هایِ پالایش‌شدهٔ r398/r401
            for li, ln in enumerate(sec.get('lines', [])):
                for name, pat in FAMILIES.items():
                    for m in re.finditer(pat, ln):
                        counts[name] = counts.get(name, 0) + 1
                        if name not in samples or len(samples[name]) < 3:
                            samples.setdefault(name, []).append(
                                f'{g} ch{ci} sec{si} l{li}: …{ln[max(0,m.start()-25):m.end()+25]}…')

print('=== فراوانی (فقط موارد > 0) ===')
for name, n in sorted(counts.items(), key=lambda x: -x[1]):
    print(f'{n:5d}  {name}')
print()
print('=== نمونه‌ها ===')
for name in sorted(samples):
    print(f'-- {name}')
    for s in samples[name][:2]:
        print('   ', s)
