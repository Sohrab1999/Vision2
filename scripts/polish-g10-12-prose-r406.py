#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r406 — حکمِ بافتیِ دستیِ شش خانوادهٔ مبهمِ نثرِ گ۱۰-گ۱۲ (شی/نیم/ری/طوالت/همکالش/عقالت + معت).

ورودی: رسیدِ پروبِ scripts/r406-ambig-contexts.json (۲۷۴ رخداد) و بررسیِ بافتیِ تک‌تک
رخدادها در برابرِ لایهٔ کورپوس (content-extracts/gradeN.txt) — نمونه‌هایِ چاپیِ کلیدی:
  • «مدت طوالت» / «طوالتز تر» = طولانی/طولانی‌تر (grade10 L8074، L24904، L36002)
  • «کسابن که نیم دانند» = نمی‌دانند (grade10 L17991) — ضرب‌المثل‌ها/ساعتِ «و نیم» مصون
  • «نتيجه گير ي منطف و عقالت» = منطقی و عقلایی (grade12 L21350/21407/21460)
  • «همکالش من است» = همکلاسِ من (grade12 L13210-13246، classmate)
  • «قصد خریدن شی ینز» = شیرینی (grade10 L39178 — دیالوگِ خرید)
  • «فرمول های شیر گاو» = شیرِ گاو (grade12 L34066)؛ «آیا کیم شیر میل دارید» (grade11 L4713)
  • «از خودتان پذیراب» = پذیرایی (grade10 L20125/L45322 — help yourself)

خروجی: بازنویسیِ in-place سه سند + بازهمگامیِ index.json + رسیدِ scripts/r406-receipt.json.
ایدمپوتنسی: اجرایِ دوم = صفر. هر قاعده شمرده و نمونه‌دار؛ نگه‌داشته‌ها با دلیل مستندند.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')
FA = '[\\u0600-\\u06FF\\u200c]'

# --------------------------------------------------------------- قواعدِ سراسریِ اثبات‌شده
RULES = [
    # ---- چندواژه‌ای‌هایِ بافتی (پیش از تک‌واژه‌ای‌ها)
    ('شی زین→شیرینی',     r'\bشی زین\b',        'شیرینی'),
    ('بیش ری→بیشتر',      r'\bبیش ری\b',        'بیشتر'),
    ('غ ری→غیر',          r'\bغ ری\b',          'غیر'),
    ('منطف و عقالت→منطقی و عقلایی', r'منطف و عقالت', 'منطقی و عقلایی'),
    # ---- تک‌واژه‌ای‌ها (طوالتتر/نامعت/معتن پیش از کوتاه‌ها)
    ('طوالتتر→طولانی‌تر', r'\bطوالتتر\b',      'طولانی‌تر'),
    ('نامعت→نامعین',      r'\bنامعت\b',         'نامعین'),
    ('معتن→معنی',         r'\bمعتن\b',          'معنی'),
    # معت — با نگاه‌داشتِ FA (نسخهٔ \b کور است کنارِ رقم: «6معت»)
    ('معت→معنی',          r'(?<![\u0600-\u06FF\u200c])معت(?![\u0600-\u06FF\u200c])', 'معنی'),
    ('طوالت→طولانی',      r'\bطوالت\b',         'طولانی'),
    ('همکالش→همکلاس',     r'\bهمکالش\b',        'همکلاس'),
    ('پذیراب→پذیرایی',    r'\bپذیراب\b',        'پذیرایی'),
    ('متفاوب→متفاوت',     r'\bمتفاوب\b',        'متفاوت'),
]

# --------------------------------------------------------------- نیم — نگه‌داشته‌هایِ مستند
# (سند، جایگاه) — ساعتِ «و نیم»، واژهٔ «نصف، نیم» و سه ضرب‌المثلِ حقیقی
NIM_KEEP = {
    'g10:c5:0:vocab:L133',    # half — نصف، نیم (جمع آن: halves)
    'g10:c5:1:notes:L19',     # half نصف ،نیم
    'g10:c16:34:translation:L0',   # ساعت هشت و نیم
    'g10:c16:37:translation:L1',   # ساعت هفت و نیم
    'g10:c17:20:translation:title,0',  # صبح های جمعه ساعت هفت و نیم (عنوان)
    'g10:c17:25:translation:L13',  # ساعت شش و نیم
    'g10:c17:26:translation:L5',   # چهار و نیم
    'g10:c20:34:translation:L3',   # ساعت ده و نیم
    'g10:c20:36:translation:title,0',  # ساعت دو و نیم (عنوان)
    'g12:c5:3:vocab:L14',     # دو صد گفته چون نیم کردار نیست (سعدی)
    'g12:c5:3:vocab:L152',    # کاسه ای زیر نیم کاسه است
    'g12:c5:3:vocab:L165',    # کاسه ای زیر نیم کاسه است
    'g12:c5:3:vocab:L235',    # پیشکیس را نیم شمارند دندان اسب
    'g12:c6:1:grammar:L14',   # ساعت یک و نیم
}

# --------------------------------------------------------------- شی — نقشهٔ موقعیتی
# (سند، جایگاه) → واژهٔ مقصود؛ همهٔ رخدادهای \bشی\b در آن خط
SHE_MAP = {
    'g10:c2:1:vocab:L134': 'شیر',    # milk — شی - شی دوشیدن (۲ توکن)
    'g10:c2:6:notes:L53': 'شیر',     # martyr lion … به شهادت رساندن شی
    'g10:c2:9:grammar:L70': 'شیر',   # این شی - the milk
    'g10:c2:17:grammar:L14': 'شیر',  # She drank some milk … شی نوشید
    'g10:c2:17:grammar:L19': 'شیر',  # شی نوشید؟
    'g10:c2:17:grammar:L22': 'شیر',  # شی ننوشید
    'g11:c3:3:translation:L414': 'شیر',
    'g11:c3:3:translation:L433': 'شیر',
    'g11:c3:3:translation:L438': 'شیر',
    'g11:c3:3:translation:L481': 'شیر',  # meat گوشت milk شی
    'g11:c3:3:translation:L595': 'شیر',
    'g11:c3:3:translation:L600': 'شیر',
    'g11:c12:2:translation:L2': 'شیر',   # شی خوردن
    'g11:c12:2:translation:L3': 'شیر',
    'g11:c12:11:translation:L0': 'شیر',
    'g12:c3:1:vocab:L262': 'سری',    # series — شی، مجموعه
    'g12:c3:2:notes:L43': 'سری',     # series ? whats wrongشی ،مجموعه (کنارِ لاتین — از پروبِ \b پنهان بود)
    'g12:c3:6:grammar:L102': 'شیر',
    'g12:c3:6:grammar:L103': 'شیر',
    'g12:c4:3:translation:L11': 'سری',  # یک شی اطلاعات = یک سری اطلاعات
    'g12:c4:5:translation:L37': 'شیر',
    'g12:c4:5:translation:L67': 'شیر',
    'g12:c5:3:vocab:L160': 'شیر',    # شیر در خواب بیند پنبه دانه (کورپوس L18826)
    'g12:c15:0:intro:L66': 'شیر',    # شیر گاو (کورپوس L34066)
}

# نگه‌داشتهٔ مستندِ شی: قطعهٔ میانه‌واژه‌ایِ «شی ن» + نامِ شخصِ «شیلا» (لیگاتورِ عربی)
SHE_KEEP = {'g10:c19:38:translation:L6', 'g12:c16:1:tests:L4902'}

SHE_RX = re.compile(rf'(?<!{FA})شی(?!{FA})')
NIM_RX = re.compile(rf'(?<!{FA})نیم(?!{FA})')


def where_of(g, ch_id, si, sec_type, li):
    return f'{g}:{ch_id}:{si}:{sec_type}:{"title,0" if li is None else f"L{li}"}'


def main():
    docs = {}
    stats: dict = {}
    samples: dict = {}

    def record(name, where, ctx):
        stats[name] = stats.get(name, 0) + 1
        if len(samples.setdefault(name, [])) < 5:
            samples[name].append(f'{where}: …{ctx[:110]}…')

    for g in ('g10', 'g11', 'g12'):
        docs[g] = json.load(open(f'{JOZ}/{g}.json', encoding='utf-8'))

    for g, doc in docs.items():
        for ch in doc['chapters']:
            for si, sec in enumerate(ch['sections']):
                stype = sec.get('type', '')
                def fix(text, where):
                    for name, pat, rep in RULES:
                        def _sub(m, name=name, rep=rep, text=text, where=where):
                            record(name, where, text[max(0, m.start()-25):m.end()+35])
                            return rep
                        text = re.sub(pat, _sub, text)
                    return text

                def process(text, where):
                    text = fix(text, where)
                    # نیم — فقط خارج از نگه‌داشته‌هایِ مستند
                    if where not in NIM_KEEP:
                        def nim_sub(m, text=text, where=where):
                            record('نیم→نمی', where, text[max(0, m.start()-25):m.end()+35])
                            return 'نمی'
                        text = NIM_RX.sub(nim_sub, text)
                    # شی موقعیتی
                    if where in SHE_MAP:
                        target = SHE_MAP[where]
                        def she_sub(m, text=text, where=where, target=target):
                            record(f'شی→{target}', where, text[max(0, m.start()-25):m.end()+35])
                            return target
                        text = SHE_RX.sub(she_sub, text)
                    return text

                sec['title'] = process(sec['title'], where_of(g, ch['id'], si, stype, None))
                sec['lines'] = [process(ln, where_of(g, ch['id'], si, stype, li))
                                for li, ln in enumerate(sec['lines'])]

    for g, doc in docs.items():
        json.dump(doc, open(f'{JOZ}/{g}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # بازهمگامیِ index.json (عناوینِ تغییر کرده — پیشوند/پسوند معنی مثال و …)
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

    # راستی‌آزماییِ پس از اجرا — شمارشِ باقی‌ماندهٔ هر خانواده
    left = {}
    for g, doc in docs.items():
        for ch in doc['chapters']:
            for si, sec in enumerate(ch['sections']):
                stype = sec.get('type', '')
                texts = [(where_of(g, ch['id'], si, stype, None), sec['title'])] + \
                        [(where_of(g, ch['id'], si, stype, li), ln) for li, ln in enumerate(sec['lines'])]
                for where, text in texts:
                    for name, rx in (('she', SHE_RX), ('nim', NIM_RX),
                                     ('معت', re.compile(r'\bمعت\b')),
                                     ('طوالت', re.compile(r'\bطوالت\b')),
                                     ('همکالش', re.compile(r'\bهمکالش\b')),
                                     ('عقالت', re.compile(r'\bعقالت\b'))):
                        for m in rx.finditer(text):
                            left.setdefault(name, []).append(f'{where}: {text.strip()[:80]}')

    receipt = {
        'round': 'r406',
        'replacements': stats,
        'samples': samples,
        'keptDocumented': {
            'nim-legit-hours-and-proverbs': sorted(NIM_KEEP),
            'she-fragment-shin': sorted(SHE_KEEP),
            'rey-legit': ['g10:c6:4:translation:L20 (شهر ری)', 'g11:c1:3:appendix:L6 (نامِ استاد)',
                          'g12:c1:1:tests:L7 (نامِ استاد)', 'g10:c5:2:translation:L66 (قطعهٔ ستونیِ «ری ن»)'],
        },
        'leftAfter': {k: v for k, v in left.items()},
        'nextRoundCandidates': ['مطمی→مطمئن', 'دخی→دختر', 'میس/میش→میسر', 'کیم→کم',
                                'منطف→منطقی (خارج از عبارت)', 'شییت→شیرینی', 'شیر یتن→شیرینی‌ها',
                                'گیی→گیری', 'معتی/معتیی (مؤسساتِ ~ کنکوری — معتبر/معتبری نامشخص)',
                                'یمکند→می‌کند', 'نیم در بانک‌هایِ آزمونِ tests-gN (نیازمندِ بازبینیِ کلید)'],
    }
    json.dump(receipt, open(os.path.join(ROOT, 'scripts', 'r406-receipt.json'), 'w',
                            encoding='utf-8'), ensure_ascii=False, indent=1)

    total = sum(v for v in stats.values())
    print(f'TOTAL replacements: {total}')
    for k, v in sorted(stats.items(), key=lambda x: -x[1]):
        print(f'{v:5d}  {k}')
    print('--- leftAfter (باید فقط نگه‌داشته‌ها باشند) ---')
    for k, v in left.items():
        print(f'{k}: {len(v)}')
        for row in v[:6]:
            print('   ', row)


if __name__ == '__main__':
    main()
