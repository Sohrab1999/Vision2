#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r402 — پالایشِ گلیفِ نثرِ گ۱۰-گ۱۲ (فازِ ۱: فقط قواعدِ مطمئنِ مستند).

دامنه: هر سه سند g10/g11/g12 — عنوان‌ها و خط‌ها (شامل جدول‌هایِ پیشین که الگویی
ندارند و دست‌نخورده می‌مانند). سه لایهٔ قاعده:
  A) جاروی نویسه‌هایِ عربی: ي→ی، ى→ی، ك→ک (مکانیکی و بی‌ریسک)
  B) توکنِ یتیمِ «یم» → «می» (۶۰۱ مورد — همهٔ نمونه‌ها فعلِ شکسته بودند)
  C) خانوادهٔ لا↔ال (اثبات‌شدهٔ r397) + واژه‌هایِ ساختِ r401 + نام‌هایِ خاص
هر قاعده: شمارشِ جایگزینی + نمونه‌ها در رسید. ایدمپوتنسی: اجرایِ دوم = صفر.
خروجی: بازنویسی in-place + رسید scripts/r402-receipt.json (index.json هم عناوین
را نگه می‌دارد → بازهمگامی می‌شود).
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')

# (نامِ قاعده، الگو، جایگزین) — الگوهایِ توکنی با \b؛ ترتیب: بلندتر اول
RULES = [
    # ---- C: چندواژه‌ای‌ها (پیش از تک‌واژه‌ای‌ها)
    ('مهمات گرفی', r'\bمهمات گرفی', 'مهمانی گرفتن'),
    ('آموز شی', r'\bآموز شی\b', 'آموزشی'),
    ('شی ع', r'\bشی ع\b', 'سریع'),
    ('معت فاریس', r'\bمعت فاریس\b', 'معنی فارسی'),
    ('معت فارش', r'\bمعت فارش\b', 'معنی فارسی'),
    ('باال آمدن', r'\bباال آمدن\b', 'بالا آمدن'),
    # ---- C: la↔al (اثبات r397 + برخوردهایِ گ۱۰-گ۱۲)
    ('اطالعاتی', r'\bاطالعاتی\b', 'اطلاعاتی'),
    ('اطالعات', r'\bاطالعات\b', 'اطلاعات'),
    ('سئواالت', r'\bسئواالت\b', 'سؤالات'),
    ('سواالت', r'\bسواالت\b', 'سؤالات'),
    ('حاالت', r'\bحاالت\b', 'حالات'),
    ('ایاالت', r'\bایاالت\b', 'ایالات'),
    ('احتماالً', r'\bاحتماالً\b', 'احتمالاً'),
    ('احتماال', r'\bاحتماال\b', 'احتمالا'),
    ('مقاالت', r'\bمقاالت\b', 'مقالات'),
    ('تعطیالت', r'\bتعطیالت\b', 'تعطیلات'),
    ('عالقمند', r'\bعالقمند\b', 'علاقمند'),
    ('باالترین', r'\bباالترین\b', 'بالاترین'),
    ('باالیی', r'\bباالیی\b', 'بالایی'),
    ('باالخره', r'\bباالخره\b', 'بالاخره'),
    ('باالبردن', r'\bباالبردن\b', 'بالا بردن'),
    ('باالفاصله', r'\bباالفاصله\b', 'بلافاصله'),
    ('باالست', r'\bباالست\b', 'بالاست'),
    ('کواالها', r'\bکواالها\b', 'کوآلاها'),
    ('کواالی', r'\bکواالی\b', 'کوآلا'),
    ('کاالها', r'\bکاالها\b', 'کالاها'),
    ('کاال', r'\bکاال\b', 'کالا'),
    ('بزرگساالن', r'\bبزرگساالن\b', 'بزرگسالان'),
    ('ساالد', r'\bساالد\b', 'سالاد'),
    ('پاالیشگاه', r'\bپاالیشگاه\b', 'پالیشگاه'),
    ('تاالر', r'\bتاالر\b', 'تالار'),
    ('شباال', r'\bشباال\b', 'شغال'),
    # کال/الت-شکلِ خانواده (حرفِ پیشین با الف جابه‌جا شده)
    ('مشکالتی', r'\bمشکالتی\b', 'مشکلاتی'),
    ('مشکالت', r'\bمشکالت\b', 'مشکلات'),
    ('محصوالت', r'\bمحصوالت\b', 'محصولات'),
    ('مجالت', r'\bمجالت\b', 'مجلات'),
    ('مطالت', r'\bمطالت\b', 'مطالعات'),
    ('کاله', r'\bکاله', 'کلاه'),  # بدونِ \bِ پایانی: کالهت/کالهم و… هم کلاه‌اند
    ('باالتر', r'\bباالتر\b', 'بالاتر'),
    ('باالی', r'\bباالی\b', 'بالای'),
    ('باال', r'\bباال\b', 'بالا'),
    ('کالس', r'\bکالس\b', 'کلاس'),
    ('حاال', r'\bحاال\b', 'حالا'),
    ('الزم', r'\bالزم\b', 'لازم'),
    ('تالش', r'\bتالش\b', 'تلاش'),
    # ---- C: واژه‌هایِ ساخت (اثبات r401/r399)
    ('مفعویل', r'\bمفعویل\b', 'مفعولی'),
    ('فاعیل', r'\bفاعیل\b', 'فاعلی'),
    ('ملگ', r'\bملگ\b', 'ملکی'),
    ('کمگ', r'\bکمگ\b', 'کمکی'),
    ('مالقات', r'\bمالقات\b', 'ملاقات'),
    ('زندیک', r'\bزندیک\b', 'زیستن'),
    ('پییا', r'\bپییا\b', 'پیتزا'),
    ('دستگی', r'\bدستگی\b', 'دستگیری'),
    ('گایه', r'\bگایه\b', 'گاهی'),
    ('تکمییل', r'\bتکمییل\b', 'تکمیلی'),
    ('همچنت', r'\bهمچنت\b', 'همچنین'),
    ('تمی', r'\bتمی\b', 'تمیز'),
    ('خوایه', r'\bخوایه\b', 'خواهی'),
    ('جلوگیی', r'\bجلوگیی\b', 'جلوگیری'),
    ('نشسی', r'\bنشسی\b', 'نشستن'),
    ('شفه', r'\bشفه\b', 'سرفه'),
    ('رفی', r'\bرفی\b', 'رفتن'),
    ('علیضا', r'\bعلیضا\b', 'علی رضا'),
    ('عیل', r'\bعیل\b', 'علی'),
    # ---- B: یتیمِ می
    ('یم-یتیم', r'(?<![\u0600-\u06FF])یم(?![\u0600-\u06FF])', 'می'),
]

SWEEPS = [
    ('ي→ی', 'ي', 'ی'),
    ('ى→ی', 'ى', 'ی'),
    ('ك→ک', 'ك', 'ک'),
]


def apply_rules(text: str, stats: dict, samples: dict, where: str):
    for name, pat, rep in RULES:
        def _sub(m, name=name, rep=rep, text=text):
            stats[name] = stats.get(name, 0) + 1
            if len(samples.setdefault(name, [])) < 5:
                s, e = m.start(), m.end()
                samples[name].append(f'{where}: …{text[max(0, s - 30):e + 30]}…')
            return rep
        text = re.sub(pat, _sub, text)
    return text


def sweep_doc(doc, stats):
    """جاروهایِ نویسه‌ای روی ساختارِ سند؛ شمارش در stats."""
    for ch in doc['chapters']:
        ch['title'] = ch['title'].replace('ي', 'ی').replace('ى', 'ی').replace('ك', 'ک')
        for sec in ch['sections']:
            sec['title'] = sec['title'].replace('ي', 'ی').replace('ى', 'ی').replace('ك', 'ک')
            sec['lines'] = [ln.replace('ي', 'ی').replace('ى', 'ی').replace('ك', 'ک')
                            for ln in sec['lines']]


def main():
    docs = {g: json.load(open(f'{JOZ}/{g}.json', encoding='utf-8')) for g in ('g10', 'g11', 'g12')}
    stats: dict = {}
    samples: dict = {}
    # تکرار تا نقطهٔ ثابت — جاروهایِ نویسه‌ای می‌توانند تطابقِ تازه بسازند
    # (مثال واقعی: «جلوگیى» پس از ى→ی به «جلوگیی» تبدیل و در گذرِ بعد ترمیم شد)
    for pass_no in range(1, 5):
        pass_stats: dict = {}
        for g, doc in docs.items():
            for ci, ch in enumerate(doc['chapters']):
                ch['title'] = apply_rules(ch['title'], pass_stats, samples, f'{g} c{ci} title')
                for si, sec in enumerate(ch.get('sections', [])):
                    where = f'{g} c{ci} s{si}'
                    sec['title'] = apply_rules(sec['title'], pass_stats, samples, where + ' title')
                    sec['lines'] = [apply_rules(ln, pass_stats, samples, f'{where} l{li}')
                                    for li, ln in enumerate(sec['lines'])]
        for g, doc in docs.items():
            sweep_doc(doc, pass_stats)
        total_pass = sum(pass_stats.values())
        for k, v in pass_stats.items():
            stats[k] = stats.get(k, 0) + v
        print(f'pass {pass_no}: {total_pass} replacements')
        if total_pass == 0:
            break

    for g, doc in docs.items():
        json.dump(doc, open(f'{JOZ}/{g}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # بازهمگامیِ index.json (عناوین تغییر کرده‌اند)
    grades = []
    for gg in range(7, 13):
        doc = json.load(open(f'{JOZ}/g{gg}.json', encoding='utf-8'))
        grades.append({
            'grade': gg, 'title': doc['title'], 'pages': doc['pages'],
            'sourceSha256': doc['sourceSha256'],
            'chapters': [
                {'id': c['id'], 'title': c['title'], 'kind': c['kind'],
                 'sections': [{'type': s['type'], 'title': s['title'], 'lines': len(s['lines'])}
                              for s in c['sections']]}
                for c in doc['chapters']
            ],
        })
    json.dump({'generatedAt': '2026-10-20T11:45:00.000Z', 'grades': grades},
              open(f'{JOZ}/index.json', 'w', encoding='utf-8'), ensure_ascii=False)

    receipt = {'round': 'r402', 'replacements': stats, 'samples': samples,
               'leftDocumented': ['معت-غیرفاریس', 'نیم', 'ری', 'شی (ناهمگون: شیر/آموزشی/سریع)',
                                  'یس-سطری', 'باالوند (نام)']}
    json.dump(receipt, open(os.path.join(ROOT, 'scripts', 'r402-receipt.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    total = sum(v for k, v in stats.items())
    print(f'TOTAL replacements: {total}')
    for k, v in sorted(stats.items(), key=lambda x: -x[1]):
        print(f'{v:5d}  {k}')


if __name__ == '__main__':
    main()
