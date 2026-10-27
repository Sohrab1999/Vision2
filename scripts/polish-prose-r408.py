#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r408 — سوییپِ سومِ نثر: خانواده‌هایِ جابجاییِ حرفِ کشف‌شده با پروبِ r408.

ورودی: پروبِ scripts/prose-ambig-probe-r408.py + شمارش‌هایِ گاردِ LET + بافت‌هایِ کامل.
کلاس‌هایِ حکم‌شده (همه با شاهدِ کورپوس — رسیدِ scripts/r408-receipt.json):
  • رسگریم→سرگرمی (جابجاییِ دوتاییِ س↔ر + ی↔م؛ hobby/entertainment/fun) — ۷
  • گسیش→گسترش (ویروس در حال گسترش؛ دایره لغات؛ اتاق) — ۵
  • حارص→حاضر (ready=حاضر؛ present=حاضر؛ «در حال حاضر»؛ «حاضریم») — ۱۳
  • حا نرص→حاضر (واریانتِ با نِ درج‌شده) — ۱
  • نرصوری→ضروری + رصوری→ضروری (necessary essential رصوری،لازم؛ جابجاییِ ض↔ر) — ۱+۷
  • رس→سر (سردرد/موی سر/سر شب/سرِ وقت/سرنخ/سرزنده/سر و صدا/سر کار/سر می‌زنم) — ۱۸
  • برگشی→برگشتن (come back؛ فروپاشیِ دمِ مصدر ت+ن→ی) — ۳
  • عجیت→عجیب (جابجاییِ ب↔ت؛ سر و صدای عجیب) — ۱
  • داشی→داشتن (همان کلاسِ دمِ مصدر؛ ۳۴ شاهد: گزینه‌ها/سرفصل‌ها/نگه داشتن) — ۳۴
  • ربیون→بیرون (جابجاییِ ر به سر؛ ۲۳) + بیون→بیرون (افتِ ر؛ ۱۱)
  • همکالیس→همکلاس (۴) + کالیس→کلاس (۱) — همان خانوادهٔ الی/لا؛ quirk-note محفوظ
  • یرسکت→شرکت (جابجاییِ ی↔ش؛ ۵) — تنهاب→تنهایی (ی↔ب؛ ۱۴) — خوشحایل→خوشحالی (ل↔ی؛ ۵)
  • انگلییستان→انگلیسی‌تان (ضمیرِ چسبیده؛ ۱) + انگلییس→انگلیسی (س↔ی؛ ۱۱۶) — ۱۱۷
  • یافین→یافتن (حضور یافتن؛ ۱) — بپویس→بپوش (۱)
  • خانوادهٔ «رسد»یِ سردِ g10: هوا رسد/رسد است/رسد خواهد بود/cold — رسد → سرد — ۷
    (ضرب‌المثلِ «چو فردا رسد فکر فردا کنیم» و «به نظر می رسد» مصون‌اند)
  • That sounds great — رسد → «عالی به نظر می‌رسد» (بازسازی از دیالوگِ همان درس)
  • بررسی ک .نیم→بررسی کنیم (گ۸+گ۹؛ ۲) — گشی به دنبال→گشتن به دنبال (۳) — گشی به رس کار→برگشتن به سر کار (۱)

نگه‌داشته‌ها: printQuirksِ tests-g10 (واگرِ موتور وارد source نمی‌شود)، «چو فردا رسد»، «به نظر می رسد»،
شدی/کردی/بردیِ دوم‌شخصِ مشروع، «می میش ود»یِ g9، «کیمیا»، «گذاشی/شدی» (بدونِ قاعده).
خروجی: g7-g12 + tests-g11 + بازهمگامیِ index.json + رسید. ایدمپوتنسی: اجرایِ دوم=صفر.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')
FA = '[\\u0600-\\u06FF\\u200c]'
LET = '[\\u0621-\\u064A\\u0670-\\u06D3\\u200c]'

# ---------------------------------------------- قواعدِ موقعیتی/ترکیبی (پیش از سراسری‌ها)
POSITIONAL_SUBS = [
    ('انگلییستان→انگلیسی‌تان (ضمیرِ چسبیده)', r'انگلییستان', 'انگلیسی‌تان'),
    ('حارص داریم به→حاضریم به (تک‌خوانشِ دستوریِ سطرِ تغذیهٔ حیوانات)', r'حارص داریم به', 'حاضریم به'),
    ('حا نرص→حاضر (در حال حاضر)', r'حا نرص', 'حاضر'),
    ('گشی به رس کار→برگشتن به سر کار (تکهٔ سطرِ شست‌وشو)', r'گشی به رس کار', 'برگشتن به سر کار'),
    ('گشی به دنبال→گشتن به دنبال (look for)', r'گشی به دنبال', 'گشتن به دنبال'),
    ('گشی دنبال→گشتن دنبال (seek)', r'گشی دنبال', 'گشتن دنبال'),
    ('بررسی ک .نیم→بررسی کنیم', r'بررسی ک ?\. ?نیم', 'بررسی کنیم'),
    ('cold — رسد→cold — سرد (ردیفِ واژگان)', r'cold — رسد', 'cold — سرد'),
    ('That sounds great — رسد→عالی به نظر می‌رسد (بازسازی از دیالوگِ همان درس)',
     r'That sounds great — رسد', 'That sounds great — عالی به نظر می‌رسد'),
    ('هوا رسد→هوا سرد', r'هوا رسد', 'هوا سرد'),
    ('رسد خواهد بود→سرد خواهد بود', r'رسد خواهد بود', 'سرد خواهد بود'),
    ('رسد است→سرد است (خانوادهٔ cold — پس از «هوا رسد»)', r'رسد است', 'سرد است'),
    ('نرصوری→ضروری (پیش از رصوری)', r'نرصوری', 'ضروری'),
]

# ---------------------------------------------- قواعدِ سراسریِ توکنی (گاردِ حروفی)
GLOBAL_RULES = [
    ('رسگریم→سرگرمی', rf'(?<!{LET})رسگریم(?!{LET})', 'سرگرمی'),
    ('گسیش→گسترش', rf'(?<!{LET})گسیش(?!{LET})', 'گسترش'),
    ('حارص→حاضر', rf'(?<!{LET})حارص(?!{LET})', 'حاضر'),
    ('حاضز→حاضر (جابجاییِ ض↔ز؛ ready/at the moment)', rf'(?<!{LET})حاضز(?!{LET})', 'حاضر'),
    ('محارصه→محاصره (همان کلاسِ ص↔ر؛ surround/محاصرهٔ قاتل)', rf'(?<!{LET})محارصه(?!{LET})', 'محاصره'),
    ('رصوری→ضروری', rf'(?<!{LET})رصوری(?!{LET})', 'ضروری'),
    ('رس→سر (standalone)', rf'(?<!{LET})رس(?!{LET})', 'سر'),
    ('برگشی→برگشتن', rf'(?<!{LET})برگشی(?!{LET})', 'برگشتن'),
    ('عجیت→عجیب', rf'(?<!{LET})عجیت(?!{LET})', 'عجیب'),
    ('داشی→داشتن', rf'(?<!{LET})داشی(?!{LET})', 'داشتن'),
    ('ربیون→بیرون', rf'(?<!{LET})ربیون(?!{LET})', 'بیرون'),
    ('بیون→بیرون (افتِ ر — پس از ربیون)', rf'(?<!{LET})بیون(?!{LET})', 'بیرون'),
    ('همکالیس→همکلاس', r'همکالیس', 'همکلاس'),
    ('کالیس→کلاس (standalone)', rf'(?<!{LET})کالیس(?!{LET})', 'کلاس'),
    ('یرسکت→شرکت', rf'(?<!{LET})یرسکت(?!{LET})', 'شرکت'),
    ('تنهاب→تنهایی', rf'(?<!{LET})تنهاب(?!{LET})', 'تنهایی'),
    ('خوشحایل→خوشحالی', rf'(?<!{LET})خوشحایل(?!{LET})', 'خوشحالی'),
    ('انگلییس→انگلیسی', rf'(?<!{LET})انگلییس(?!{LET})', 'انگلیسی'),
    ('یافین→یافتن', rf'(?<!{LET})یافین(?!{LET})', 'یافتن'),
    ('بپویس→بپوش', rf'(?<!{LET})بپویس(?!{LET})', 'بپوش'),
]

# سنجشِ «باید صفر باشد» پس از اجرا
LEFT_CHECKS = [
    ('رسگریم', rf'(?<!{LET})رسگریم(?!{LET})'),
    ('گسیش', rf'(?<!{LET})گسیش(?!{LET})'),
    ('حارص', rf'(?<!{LET})حارص(?!{LET})'),
    ('حاضز', rf'(?<!{LET})حاضز(?!{LET})'),
    ('محارصه', rf'(?<!{LET})محارصه(?!{LET})'),
    ('حا نرص', r'حا نرص'),
    ('نرصوری', r'نرصوری'),
    ('رصوری', rf'(?<!{LET})رصوری(?!{LET})'),
    ('رس', rf'(?<!{LET})رس(?!{LET})'),
    ('برگشی', rf'(?<!{LET})برگشی(?!{LET})'),
    ('عجیت', rf'(?<!{LET})عجیت(?!{LET})'),
    ('داشی', rf'(?<!{LET})داشی(?!{LET})'),
    ('ربیون', rf'ربیون'),
    ('بیون', rf'(?<!{LET})بیون(?!{LET})'),
    ('همکالیس', r'همکالیس'),
    ('کالیس', rf'(?<!{LET})کالیس(?!{LET})'),
    ('یرسکت', rf'(?<!{LET})یرسکت(?!{LET})'),
    ('تنهاب', rf'(?<!{LET})تنهاب(?!{LET})'),
    ('خوشحایل', rf'(?<!{LET})خوشحایل(?!{LET})'),
    ('انگلییس', rf'(?<!{LET})انگلییس(?!{LET})'),
    ('یافین', rf'(?<!{LET})یافین(?!{LET})'),
    ('بپویس', rf'(?<!{LET})بپویس(?!{LET})'),
    ('گشی', rf'(?<!{LET})گشی(?!{LET})'),
    ('بررسی ک .نیم', r'بررسی ک ?\. ?نیم'),
    ('هوا رسد', r'هوا رسد'),
    ('رسد است', r'رسد است'),
    ('رسد خواهد بود', r'رسد خواهد بود'),
    ('cold — رسد', r'cold — رسد'),
    ('sounds great — رسد', r'That sounds great — رسد'),
]


def main():
    stats: dict = {}
    samples: dict = {}

    def record(name, where, ctx):
        stats[name] = stats.get(name, 0) + 1
        if len(samples.setdefault(name, [])) < 5:
            samples[name].append(f'{where}: …{ctx[:110]}…')

    def apply_subs(text, where, subs):
        for name, pat, rep in subs:
            rx = re.compile(pat)
            def _sub(m, name=name, rep=rep, text=text, where=where):
                record(name, where, text[max(0, m.start() - 25):m.end() + 35])
                return rep
            text = rx.sub(_sub, text)
        return text

    def process(text, where):
        text = apply_subs(text, where, POSITIONAL_SUBS)
        text = apply_subs(text, where, GLOBAL_RULES)
        return text

    docs = {}
    for g in ('g7', 'g8', 'g9', 'g10', 'g11', 'g12'):
        docs[g] = json.load(open(f'{JOZ}/{g}.json', encoding='utf-8'))

    # --- واگرِ اصلی: عنوانِ سکشن + خط‌ها (همان معماریِ r407)
    for g, doc in docs.items():
        for chi, ch in enumerate(doc['chapters']):
            for si, sec in enumerate(ch['sections']):
                stype = sec.get('type', '')
                sec['title'] = process(sec['title'], f'{g}:{ch["id"]}:{si}:{stype}:title')
                for li, ln in enumerate(sec['lines']):
                    sec['lines'][li] = process(ln, f'{g}:{ch["id"]}:{si}:{stype}:L{li}')

    # --- واگرِ بانکِ آزمون: tests-g11 (question/options/translation — نه source، نه translationRestorations)
    t11_path = f'{JOZ}/tests-g11.json'
    t11 = json.load(open(t11_path, encoding='utf-8'))
    for le in t11.get('lessons', []):
        lt = le.get('title', '')
        for qi, q in enumerate(le.get('questions', []) or []):
            w = f'tests-g11:{lt}:q{qi}'
            if isinstance(q.get('question'), str):
                q['question'] = process(q['question'], f'{w}:question')
            for oi, opt in enumerate(q.get('options', []) or []):
                if isinstance(opt, str):
                    q['options'][oi] = process(opt, f'{w}:o{oi}')
            if isinstance(q.get('translation'), str):
                q['translation'] = process(q['translation'], f'{w}:translation')

    # --- نگارش با حفظِ سریال‌سازیِ اصل
    for g, doc in docs.items():
        if g in ('g7', 'g8', 'g9'):
            with open(f'{JOZ}/{g}.json', 'w', encoding='utf-8') as fh:
                json.dump(doc, fh, ensure_ascii=False)
        else:
            json.dump(doc, open(f'{JOZ}/{g}.json', 'w', encoding='utf-8'),
                      ensure_ascii=False, indent=1)
    with open(t11_path, 'w', encoding='utf-8') as fh:
        json.dump(t11, fh, ensure_ascii=False, indent=1)

    # --- بازهمگامیِ index.json (عنوان‌ها پس از اصلاح)
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
    index = {'generatedAt': json.load(open(f'{JOZ}/index.json', encoding='utf-8'))['generatedAt'],
             'grades': grades}
    # index.json در HEAD فشرده است (یک‌خطی) — همان in-lesson فرمتِ r407: بازنویسیِ باددارِ ممنوع
    json.dump(index, open(f'{JOZ}/index.json', 'w', encoding='utf-8'), ensure_ascii=False)

    # --- سنجشِ پسین رویِ «میدان‌هایِ پیموده‌شده» (صادقانه — همان دامنهٔ موتور؛
    # printQuirksِ محفوظِ tests-g10 در source است و از دامنه خارج)
    walked_parts: list = []
    for gg in range(7, 13):
        doc = json.load(open(f'{JOZ}/g{gg}.json', encoding='utf-8'))
        for ch in doc['chapters']:
            for sec in ch['sections']:
                walked_parts.append(str(sec.get('title', '')))
                walked_parts.extend(str(x) for x in sec.get('lines', []))
    t11b = json.load(open(t11_path, encoding='utf-8'))
    for le in t11b.get('lessons', []):
        for q in le.get('questions', []) or []:
            walked_parts.append(str(q.get('question', '')))
            walked_parts.extend(str(x) for x in q.get('options', []) or [])
            walked_parts.append(str(q.get('translation', '')))
    idx = json.load(open(f'{JOZ}/index.json', encoding='utf-8'))
    for gr in idx['grades']:
        for ch in gr['chapters']:
            walked_parts.append(str(ch.get('title', '')))
            for sec in ch['sections']:
                walked_parts.append(str(sec.get('title', '')))
    corpus = '\n'.join(walked_parts)
    left = {}
    for name, pat in LEFT_CHECKS:
        n = len(re.findall(pat, corpus))
        if n:
            left[name] = n

    total = sum(stats.values())
    receipt_path = f'{ROOT}/scripts/r408-receipt.json'
    # رسیدِ نوبتِ-اول حفظ شود — اجرایِ ایدمپوتنتِ بعدی (total=0) نباید آن را پاک کند
    if total > 0 or not os.path.exists(receipt_path):
        receipt = {'round': 'r408', 'total': total, 'rules': stats, 'samples': samples,
                   'leftAfter': left or {}}
        with open(receipt_path, 'w', encoding='utf-8') as fh:
            json.dump(receipt, fh, ensure_ascii=False, indent=1)

    print(f'TOTAL fixes: {total} across {len(stats)} rules')
    for name, c in sorted(stats.items(), key=lambda x: -x[1]):
        print(f'  {c:4d}  {name}')
    print('LEFT after (must be empty):', left if left else 'ZERO ✓')


if __name__ == '__main__':
    main()
