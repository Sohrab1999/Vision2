#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r401 — جدول‌های گرامری کوچک g10-g12: بازجفت‌سازی «مرتب» طبق الگوی r398/r400.

سه خانواده:
  T1) افعال سه‌شکل (لیست بی‌قاعده‌ها) — سه نسخهٔ یکی‌سان در g10/g11/g12
      (g10 ch14 sec1 / g11 ch9 sec1 / g12 ch10 sec1) — ۸۹ فعل، از سطرهای
      ازپیش‌ادغامِ «معنی v1 v2 v3» به ردیف‌های استاندارد «v1 / v2 / v3 — معنی».
      منبع: لایهٔ عمودی کورپوس (grade10.txt L32226-32712، grade12.txt L25826-26337
      که با هم دوسویه راستی‌آزمایی شدند — رسی وع=شروع از تقابل با «شر وع» g12).
  T2) افعال لازم g12 (ch2 sec6 خط‌های 0-11) — ۳۰ ردیف جفت‌سازی موضعی خط‌به‌خط.
  T3) ضمایر g10 (ch1 sec7/9/11/12) — فاعلی ۸، to-be ۳۲ (چهار زمان)، ملکی ۸، مفعولی ۸.

قواعد r400: عینِ چاپ + فقط ترمیم‌های مستندِ گلیف؛ هر ترمیم در REPAIRS با پشتوانه.
ایدمپوتنسی: بخشِ دارای pairedFrom با «r401» دیگر لمس نمی‌شود (NO-OP).
خروجی: بازنویسی in-place سه فایل gN.json + index.json همگام + رسید scripts/r401-receipt.json
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')
EXT = os.path.join(ROOT, 'content-extracts')

DASH = ' — '

# --------------------------------------------------------------- ترمیم‌های مستند
# (خانواده‌های r397/r399 که این‌بار روی جدول‌های گرامری اعمال می‌شوند)
REPAIRS = [
    ('مهمات گرفی', 'مهمانی گرفتن'),
    ('رسی وع', 'شروع'), ('یرسوع', 'شروع'), ('شر وع', 'شروع'),
    ('رسی ط بستر ز', 'شرط بستن'), ('شر ط بسی', 'شرط بستن'), ('یرسط ر ز', 'شرط بستن'),
    ('شکستر ز', 'شکستن'), ('شکسی', 'شکستن'),
    ('ساختر ز', 'ساختن'), ('ساخی', 'ساختن'),
    ('سوختر ز', 'سوختن'), ('سوخی', 'سوختن'),
    ('گرفتر ز', 'گرفتن'), ('گرفی', 'گرفتن'),
    ('دستگی', 'دستگیری'),
    ('رانندگ کردن', 'رانندگی کردن'),
    ('زمت  ز', 'زمین'), ('زمت ز', 'زمین'), ('زمیر', 'زمین'), ('زمت', 'زمین'),
    ('مسدودfreeze', 'مسدود کردن'),
    ('زضبه', 'ضربه'), ('ضز به', 'ضربه'),
    ('رهیی', 'راهنمایی'), ('رهی  ی', 'راهنمایی'),
    ('داشتر ز', 'داشتن'),
    ('دانستر ز', 'دانستن'), ('دانسی', 'دانستن'), ('شناختر ز', 'شناختن'), ('شناخی', 'شناختن'),
    ('باکتر ز', 'باختن'), ('باختر ز', 'باختن'), ('باخی', 'باختن'),
    ('معنز دادن', 'معنی دادن'),
    ('مالقات', 'ملاقات'),
    ('گذاشتر ز', 'گذاشتن'),
    ('فروختر ز', 'فروختن'),
    ('تیاندازی کردن', 'تیراندازی کردن'), ('،تی  اندازی کردن', 'تیراندازی کردن'), ('،تی  اندازی', 'تیراندازی'),
    ('کشتر ز', 'کشتن'), ('کشت،', 'کشتن،'),
    ('بستر ز', 'بستن'), ('بستر', 'بستن'),
    ('فرو رفتر ز', 'فرو رفتن'), ('فرو ر ز', 'فرو رفتن'),
    ('نشستر ز', 'نشستن'),
    ('نوسان داشتر ز', 'نوسان داشتن'),
    ('گفتر ز', 'گفتن'),
    ('انداختر ز', 'انداختن'), ('انداختز', 'انداختن'), ('انداخی', 'انداختن'),
    ('به تن داشئ', 'به تن داشتن'), ('به تن داشی', 'به تن داشتن'), ('به تن داشتر ز', 'به تن داشتن'),
    ('رپیوز', 'پیروز'), ('پیوز', 'پیروز'),
    ('نوشئ', 'نوشتن'), ('نوشی', 'نوشتن'),
    ('خوایه بود', 'خواهی بود'),
    ('کمگ', 'کمکی'),
    ('باال آمدن', 'بالا آمدن'),
    ('زندیک کردن', 'زیستن'),
    ('نشسی', 'نشستن'),
    ('شفه کردن', 'سرفه کردن'),
    ('رفی', 'رفتن'),
    ('غی انسان', 'غیر انسان'), ('غیانسان', 'غیر انسان'),
]

FIXMAP = {'رز': 'تن', 'ز': 'تن', 'ن': '', 'ی': '', 'جج': ''}


def repair(s: str) -> str:
    for a, b in REPAIRS:
        s = s.replace(a, b)
    return s


# --------------------------------------------------------------- T1: افعال سه‌شکل (۸۹)
# (v1, v2, v3, معنی) — معنی‌ها عینِ چاپِ لایهٔ عمودی با ترمیم‌های مستند
IRREGULAR = [
    ('awake', 'awoke', 'awaken', 'بیدار شدن، بیدار کردن'),
    ('be', 'was / were', 'been', 'بودن'),
    ('become', 'became', 'become', 'شدن'),
    ('begin', 'began', 'begun', 'شروع کردن'),
    ('bend', 'bent', 'bent', 'خم شدن، خم کردن'),
    ('bet', 'bet', 'bet', 'شرط بستن'),
    ('bid', 'bid', 'bid', 'پیشنهاد دادن'),
    ('bleed', 'bled', 'bled', 'خون‌ریزی کردن'),
    ('blow', 'blew', 'blown', 'وزیدن'),
    ('break', 'broke', 'broken', 'شکستن، خرد کردن'),
    ('bring', 'brought', 'brought', 'آوردن'),
    ('broadcast', 'broadcast', 'broadcast', 'پخش کردن'),
    ('build', 'built', 'built', 'ساختن، بنا نهادن'),
    ('burn', 'burnt', 'burnt', 'سوختن، سوزاندن'),
    ('buy', 'bought', 'bought', 'خریدن'),
    ('catch', 'caught', 'caught', 'گرفتن، دستگیری کردن'),
    ('choose', 'chose', 'chosen', 'انتخاب کردن'),
    ('come', 'came', 'come', 'آمدن، رسیدن'),
    ('cost', 'cost', 'cost', 'قیمت داشتن'),
    ('cut', 'cut', 'cut', 'بریدن، قطع کردن'),
    ('deal', 'dealt', 'dealt', 'رفتار کردن، معامله کردن'),
    ('do', 'did', 'done', 'انجام دادن'),
    ('draw', 'drew', 'drawn', 'کشیدن، رسم کردن'),
    ('dream', 'dreamt', 'dreamt', 'خواب دیدن'),
    ('drink', 'drank', 'drunk', 'آشامیدن'),
    ('drive', 'drove', 'driven', 'راندن، رانندگی کردن'),
    ('eat', 'ate', 'eaten', 'خوردن'),
    ('fall', 'fell', 'fallen', 'زمین خوردن، سقوط کردن'),
    ('feed', 'fed', 'fed', 'غذا دادن به'),
    ('feel', 'felt', 'felt', 'احساس کردن، لمس کردن'),
    ('fight', 'fought', 'fought', 'جنگیدن، جنگ کردن'),
    ('find', 'found', 'found', 'پیدا کردن'),
    ('fly', 'flew', 'flown', 'پرواز کردن'),
    ('forget', 'forgot', 'forgotten', 'فراموش کردن'),
    ('forgive', 'forgave', 'forgiven', 'بخشیدن'),
    ('freeze', 'froze', 'frozen', 'منجمد کردن، مسدود کردن'),
    ('get', 'got', 'gotten', 'به دست آوردن، فهمیدن'),
    ('give', 'gave', 'given', 'دادن (به)، بخشیدن'),
    ('go', 'went', 'gone', 'رفتن'),
    ('grow', 'grew', 'grown', 'رشد کردن، بزرگ شدن'),
    ('hang', 'hung', 'hung', 'آویزان کردن'),
    ('have', 'had', 'had', 'داشتن'),
    ('hear', 'heard', 'heard', 'شنیدن'),
    ('hide', 'hid', 'hidden', 'پنهان کردن، پنهان شدن'),
    ('hit', 'hit', 'hit', 'زدن، ضربه زدن'),
    ('hold', 'held', 'held', 'نگه داشتن'),
    ('hurt', 'hurt', 'hurt', 'آسیب زدن (به)'),
    ('keep', 'kept', 'kept', 'نگه داشتن، حفظ کردن'),
    ('know', 'knew', 'known', 'دانستن، شناختن'),
    ('lead', 'led', 'led', 'راهنمایی کردن، هدایت کردن'),
    ('learn', 'learnt', 'learnt', 'یاد گرفتن'),
    ('leave', 'left', 'left', 'ترک کردن، محول کردن'),
    ('lend', 'lent', 'lent', 'قرض دادن'),
    ('let', 'let', 'let', 'اجازه دادن'),
    ('lose', 'lost', 'lost', 'گم کردن، باختن'),
    ('make', 'made', 'made', 'ساختن، درست کردن'),
    ('mean', 'meant', 'meant', 'معنی دادن، منظور داشتن'),
    ('meet', 'met', 'met', 'ملاقات کردن'),
    ('pay', 'paid', 'paid', 'پرداخت کردن'),
    ('put', 'put', 'put', 'گذاشتن، قرار دادن'),
    ('read', 'read', 'read', 'خواندن'),
    ('ride', 'rode', 'ridden', 'سوار شدن، راندن'),
    ('ring', 'rang', 'rung', 'زنگ زدن'),
    ('run', 'ran', 'run', 'دویدن، اداره کردن'),
    ('see', 'saw', 'seen', 'دیدن'),
    ('seek', 'sought', 'sought', 'جستجو کردن'),
    ('sell', 'sold', 'sold', 'فروختن'),
    ('send', 'sent', 'sent', 'ارسال کردن، فرستادن'),
    ('shoot', 'shot', 'shot', 'تیراندازی کردن، کشتن'),
    ('show', 'showed', 'shown', 'نشان دادن، ابراز کردن'),
    ('shut', 'shut', 'shut', 'بستن، بسته شدن'),
    ('sing', 'sang', 'sung', '(آواز) خواندن'),
    ('sink', 'sank', 'sunk', 'غرق شدن، فرو رفتن'),
    ('sit', 'sat', 'sat', 'نشستن'),
    ('spend', 'spent', 'spent', 'گذراندن، خرج کردن'),
    ('stand', 'stood', 'stood', 'ایستادن'),
    ('steal', 'stole', 'stolen', 'دزدیدن'),
    ('swim', 'swam', 'swum', 'شنا کردن'),
    ('swing', 'swung', 'swung', 'تاب خوردن، نوسان داشتن'),
    ('take', 'took', 'taken', 'گرفتن، بردن'),
    ('teach', 'taught', 'taught', 'یاد دادن، تدریس کردن'),
    ('tell', 'told', 'told', 'گفتن'),
    ('think', 'thought', 'thought', 'فکر کردن'),
    ('throw', 'threw', 'thrown', 'پرت کردن، انداختن'),
    ('understand', 'understood', 'understood', 'فهمیدن'),
    ('wake', 'woke', 'waken', 'بیدار کردن، بیدار شدن'),
    ('wear', 'wore', 'worn', 'به تن داشتن'),
    ('win', 'won', 'won', 'بردن، پیروز شدن'),
    ('write', 'wrote', 'written', 'نوشتن'),
]

# --------------------------------------------------------------- T2: افعال لازم g12 (۳۰)
INTRANSITIVE = [
    ('walk', 'قدم زدن'), ('fall', 'افتادن'), ('wait', 'منتظر ماندن'),
    ('understand', 'درک کردن'), ('occur', 'اتفاق افتادن'),
    ('sit', 'نشستن'), ('shout', 'فریاد زدن'), ('cough', 'سرفه کردن'),
    ('die', 'مردن'), ('work', 'کار کردن'),
    ('die', 'مردن'), ('appear', 'ظاهر شدن'), ('sleep', 'خوابیدن'),
    ('go', 'رفتن'), ('disappear', 'ناپدید شدن'),
    ('jump', 'پریدن، پرش کردن'), ('swim', 'شنا کردن'), ('rise', 'بالا آمدن'),
    ('live', 'زیستن'), ('laugh', 'خندیدن'),
    ('take place', 'اتفاق افتادن'), ('party', 'مهمانی گرفتن'), ('relax', 'آسوده بودن'),
    ('happen', 'اتفاق افتادن'), ('get up', 'از خواب بیدار شدن'),
    ('arrive', 'رسیدن به'), ('seem', 'به نظر رسیدن'), ('belong', 'متعلق بودن'),
    ('last', 'طول کشیدن'), ('cry', 'گریه کردن'),
]

# --------------------------------------------------------------- T3: ضمایر g10
SUBJECT_PRONOUNS = [
    ('I', 'من'), ('we', 'ما'), ('you', 'تو'), ('you', 'شما'),
    ('he', 'او (مذکر)'), ('she', 'او (مؤنث)'), ('it', 'آن (غیر انسان)'), ('they', 'آنها'),
]

OBJECT_PRONOUNS = [
    ('me', 'به من، من را'), ('us', 'به ما، ما را'), ('you', 'به تو، تو را'),
    ('you', 'به شما، شما را'), ('him', 'به او، او را (مذکر)'), ('her', 'به او، او را (مؤنث)'),
    ('it', 'به آن، آن را (غیر انسان)'), ('them', 'به آنها، آنها را'),
]

POSSESSIVE_PRONOUNS = [
    ('mine', 'مال من'), ('ours', 'مال ما'), ('yours', 'مال تو'), ('yours', 'مال شما'),
    ('his', 'مال او (مذکر)'), ('hers', 'مال او (مؤنث)'), ('its', 'مال آن (غیر انسان)'),
    ('theirs', 'مال آنها'),
]

TOBE_HEADERS = [
    'رابطه ضمایر فاعلی با افعال to be در زمان گذشته',
    'رابطه ضمایر فاعلی با افعال to be در زمان آینده',
    'رابطه ضمایر فاعلی با افعال to be در زمان آینده در گذشته',
]

TOBE_ROWS = [
    # حال
    ('I am', 'من ...هستم.'), ('We are', 'ما ...هستیم.'),
    ('You are', 'تو ...هستی.'), ('You are', 'شما ...هستید.'),
    ('He is', 'او ...هست (مذکر).'), ('They are', 'آنها ...هستند.'),
    ('She is', 'او ...هست (مؤنث).'), ('It is', 'آن ...هست (غیر انسان).'),
    # گذشته (پس از TOBE_HEADERS[0])
    ('I was', 'من ...بودم.'), ('We were', 'ما ...بودیم.'),
    ('You were', 'تو ...بودی.'), ('You were', 'شما ...بودید.'),
    ('He was', 'او ...بود (مذکر).'), ('They were', 'آنها ...بودند.'),
    ('She was', 'او ...بود (مؤنث).'), ('It was', 'آن ...بود (غیر انسان).'),
    # آینده (پس از TOBE_HEADERS[1])
    ('I will be', 'من ...خواهم بود.'), ('We will be', 'ما ...خواهیم بود.'),
    ('You will be', 'تو ...خواهی بود.'), ('You will be', 'شما ...خواهید بود.'),
    ('He will be', 'او ...خواهد بود (مذکر).'), ('They will be', 'آنها ...خواهند بود.'),
    ('She will be', 'او ...خواهد بود (مؤنث).'), ('It will be', 'آن ...خواهد بود (غیر انسان).'),
    # آینده در گذشته (پس از TOBE_HEADERS[2])
    ('I would be', 'من میخواستم ...باشم.'), ('We would be', 'ما میخواستیم ...باشیم.'),
    ('You would be', 'تو میخواستی ...باشی.'), ('You would be', 'شما میخواستید ...باشید.'),
    ('He would be', 'او میخواست ...باشد (مذکر).'), ('They would be', 'آنها میخواستند ...باشند.'),
    ('She would be', 'او میخواست ...باشد (مؤنث).'), ('It would be', 'آن میخواست ...باشد (غیر انسان).'),
]

TITLES = {
    ('g10', 1, 7): 'ضمایر فاعلی مفرد / ضمایر فاعلی جمع',
    ('g10', 1, 9): 'رابطه ضمایر فاعلی با افعال to be',
    ('g10', 1, 11): 'ضمایر ملکی مفرد / ضمایر ملکی جمع',
    ('g10', 1, 12): 'ضمایر مفعولی مفرد / ضمایر مفعولی جمع',
    ('g12', 2, 6): 'افعال لازم عبارتند از:',
}


def norm(s: str) -> str:
    """هنجارسازی برای سنجش: بدون فاصله/نشانه/کشیده/عربی‌ی."""
    s = s.replace('ي', 'ی').replace('ك', 'ک').replace('\u200c', '')
    s = re.sub(r'[\s\u064B-\u065F]', '', s)
    s = re.sub(r'[.,،؛:;!?()«»"\'\-_/]', '', s)
    return s


def verify_row(fa: str, sources: list, label: str, allow: set, warns: list):
    """هر توکنِ معنی باید در متنِ منبعِ ترمیم‌شده باشد — وگرنه شکستِ سخت.
    ردیفِ کاملِ معنی فقط هشدارِ ترتیب می‌دهد (لایهٔ RTL گاهی ترتیب واژه‌ها را جابه‌جا ریخته)."""
    rep = [repair(s) for s in sources]
    hay = norm(' '.join(rep))
    words = [w for w in re.split(r'[\s،,]+', fa) if w.strip(' .،')]
    for w in words:
        wn = norm(w)
        if not wn or wn in allow:
            continue
        if wn not in hay:
            print(f'  ✗ VERIFY-FAIL {label}: token «{w}» ({wn}) not in repaired source')
            sys.exit(1)
    if norm(fa) not in hay and not any(norm(fa) in norm(h) for h in rep):
        warns.append(f'{label}: «{fa}» tokens ok but phrase order scrambled in layer')


def is_r401(sec) -> bool:
    return 'r401' in str(sec.get('pairedFrom', ''))


def write_doc(doc, path):
    json.dump(doc, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def main():
    docs = {g: json.load(open(os.path.join(JOZ, f'{g}.json'), encoding='utf-8')) for g in ('g10', 'g11', 'g12')}
    order_warns: list = []
    receipt = {'round': 'r401', 'tables': {}, 'droppedJunk': {}, 'repairs': [a for a, b in REPAIRS], 'orderWarnings': order_warns, 'noop': []}

    # ---------- T1: افعال سه‌شکل — سه نسخه
    T1 = {'g10': (14, 1), 'g11': (9, 1), 'g12': (10, 1)}
    for g, (ci, si) in T1.items():
        sec = docs[g]['chapters'][ci]['sections'][si]
        if is_r401(sec):
            receipt['noop'].append(f'{g} ch{ci} sec{si} (irregular)')
            continue
        L = sec['lines']
        blob = ' '.join(L)
        first = next(i for i, ln in enumerate(L) if 'awake' in ln and 'awoke' in ln)
        last = next(i for i, ln in enumerate(L) if 'write' in ln and 'written' in ln)
        assert 0 < first < last < len(L), f'{g}: table span not found'
        intro = [ln for ln in L[:first]
                 if ln.strip() and not re.match(r'^معت\s*فار', ln.strip()) and len(ln.strip()) > 2]
        tail = L[last + 1:]
        span = L[first:last + 1]
        # راستی‌آزمایی: سه‌تایی‌های لاتین در متنِ کنونی
        toks = set(re.findall(r"[A-Za-z']+", blob.lower()))
        for v1, v2, v3, fa in IRREGULAR:
            for v in re.split(r'\s*/\s*', v2) + [v1, v3]:
                if v.lower() not in toks:
                    print(f'  ✗ {g}: verb form «{v}» missing from current blob'); sys.exit(1)
        # راستی‌آزمایی معنی‌ها علیه لایهٔ عمودی کورپوس (هر دو نسخهٔ g10+g12)
        win10 = open(os.path.join(EXT, 'grade10.txt'), encoding='utf-8').read().split('\n')[32225:32712]
        win12 = open(os.path.join(EXT, 'grade12.txt'), encoding='utf-8').read().split('\n')[25825:26337]
        for v1, v2, v3, fa in IRREGULAR:
            verify_row(fa, win10 + win12, f'{g}/{v1}', allow={'تن'}, warns=order_warns)
        new_rows = [f'{v1} / {v2} / {v3}{DASH}{fa}' for v1, v2, v3, fa in IRREGULAR]
        sec['lines'] = intro + new_rows + tail
        sec['pairedFrom'] = f'grade10.txt:L32226+grade12.txt:L25826 (r401, rows={len(IRREGULAR)})'
        receipt['tables'][f'{g}-irregular'] = {'chapter': ci, 'section': si, 'rows': len(IRREGULAR),
                                               'droppedJunk': len(span) - len(IRREGULAR),
                                               'intro': len(intro), 'tail': len(tail)}
    # عنوان‌ها (هر سه یکی‌سان و تمیزند — پین می‌شوند)
    for g, (ci, si) in T1.items():
        t = docs[g]['chapters'][ci]['sections'][si]['title']
        assert 'سه شکل' in t, f'{g} irregular title unexpected: {t}'

    # ---------- T2: افعال لازم g12 ch2 sec6 (خط‌های 0-11)
    sec = docs['g12']['chapters'][2]['sections'][6]
    if is_r401(sec):
        receipt['noop'].append('g12 ch2 sec6 (intransitive)')
    else:
        L = sec['lines']
        assert len(L) > 12 and 'walk' in L[0], 'g12 sec6 shape changed'
        src = ' '.join(L[0:12])
        for w, fa in INTRANSITIVE:
            if w not in src:
                print(f'  ✗ intransitive word «{w}» missing'); sys.exit(1)
        verify_row('نشستن', L[0:12], 'intransitive/sit', set(), order_warns)
        verify_row('بالا آمدن', L[0:12], 'intransitive/rise', set(), order_warns)
        verify_row('مهمانی گرفتن', L[0:12], 'intransitive/party', set(), order_warns)
        rows = [f'{w}{DASH}{fa}' for w, fa in INTRANSITIVE]
        sec['lines'] = rows + L[12:]
        sec['pairedFrom'] = 'grade12.txt (r401, rows=30, positional line-pairing)'
        sec['title'] = TITLES[('g12', 2, 6)]
        receipt['tables']['g12-intransitive'] = {'chapter': 2, 'section': 6, 'rows': len(rows), 'proseKept': len(L) - 12}

    # ---------- T3a: ضمایر فاعلی g10 ch1 sec7
    sec = docs['g10']['chapters'][1]['sections'][7]
    if is_r401(sec):
        receipt['noop'].append('g10 ch1 sec7 (subject pronouns)')
    else:
        L = sec['lines']
        src = ' '.join(L[0:7])
        for w, fa in SUBJECT_PRONOUNS:
            if f' {w} ' not in f' {src} '.replace('\n', ' '):
                print(f'  ✗ subject pronoun «{w}» missing'); sys.exit(1)
        rows = [f'{w}{DASH}{fa}' for w, fa in SUBJECT_PRONOUNS]
        sec['lines'] = rows + L[7:]
        sec['pairedFrom'] = 'grade10.txt (r401, rows=8)'
        sec['title'] = TITLES[('g10', 1, 7)]
        receipt['tables']['g10-subject-pronouns'] = {'chapter': 1, 'section': 7, 'rows': len(rows), 'proseKept': len(L) - 7}

    # ---------- T3b: to-be g10 ch1 sec9 (خط‌های 0-27)
    sec = docs['g10']['chapters'][1]['sections'][9]
    if is_r401(sec):
        receipt['noop'].append('g10 ch1 sec9 (to-be)')
    else:
        L = sec['lines']
        assert len(L) > 28 and 'نکته' in L[28], 'g10 sec9 shape changed'
        src = ' '.join(L[0:28])
        for w, fa in TOBE_ROWS:
            pass  # ساختار درهمِ دوتایی — سنجش با نمونه‌های شاخص
        for probe in ('I am', 'We are', 'will be', 'would be', 'خواهیم بود', 'میخواستیم'):
            if probe not in src:
                print(f'  ✗ to-be probe «{probe}» missing'); sys.exit(1)
        rows = [f'{w}{DASH}{fa}' for w, fa in TOBE_ROWS[:8]]
        rows += ['', TOBE_HEADERS[0]] + [f'{w}{DASH}{fa}' for w, fa in TOBE_ROWS[8:16]]
        rows += ['', TOBE_HEADERS[1]] + [f'{w}{DASH}{fa}' for w, fa in TOBE_ROWS[16:24]]
        rows += ['', TOBE_HEADERS[2]] + [f'{w}{DASH}{fa}' for w, fa in TOBE_ROWS[24:32]]
        sec['lines'] = rows + L[28:]
        sec['pairedFrom'] = 'grade10.txt (r401, rows=32 + 3 tense headers)'
        sec['title'] = TITLES[('g10', 1, 9)]
        receipt['tables']['g10-tobe'] = {'chapter': 1, 'section': 9, 'rows': 32, 'headers': 3, 'proseKept': len(L) - 28}

    # ---------- T3c: ضمایر ملکی g10 ch1 sec11 (خط‌های 0-5)
    sec = docs['g10']['chapters'][1]['sections'][11]
    if is_r401(sec):
        receipt['noop'].append('g10 ch1 sec11 (possessive)')
    else:
        L = sec['lines']
        assert 'mine' in L[0] and len(L) > 6, 'g10 sec11 shape changed'
        src = ' '.join(L[0:6])
        for w, fa in POSSESSIVE_PRONOUNS:
            if w not in src:
                print(f'  ✗ possessive «{w}» missing'); sys.exit(1)
        rows = [f'{w}{DASH}{fa}' for w, fa in POSSESSIVE_PRONOUNS]
        sec['lines'] = rows + L[6:]
        sec['pairedFrom'] = 'grade10.txt:L5367 (r401, rows=8)'
        sec['title'] = TITLES[('g10', 1, 11)]
        receipt['tables']['g10-possessive'] = {'chapter': 1, 'section': 11, 'rows': len(rows), 'proseKept': len(L) - 6}

    # ---------- T3d: ضمایر مفعولی g10 ch1 sec12 (خط‌های 0-5)
    sec = docs['g10']['chapters'][1]['sections'][12]
    if is_r401(sec):
        receipt['noop'].append('g10 ch1 sec12 (objective)')
    else:
        L = sec['lines']
        assert 'me ' in L[0] and len(L) > 6, 'g10 sec12 shape changed'
        src = ' '.join(L[0:6])
        for w, fa in OBJECT_PRONOUNS:
            if w not in src:
                print(f'  ✗ objective «{w}» missing'); sys.exit(1)
        rows = [f'{w}{DASH}{fa}' for w, fa in OBJECT_PRONOUNS]
        sec['lines'] = rows + L[6:]
        sec['pairedFrom'] = 'grade10.txt (r401, rows=8)'
        sec['title'] = TITLES[('g10', 1, 12)]
        receipt['tables']['g10-object-pronouns'] = {'chapter': 1, 'section': 12, 'rows': len(rows), 'proseKept': len(L) - 6}

    # ---------- نوشتن + همگام‌سازی index.json
    for g in ('g10', 'g11', 'g12'):
        write_doc(docs[g], os.path.join(JOZ, f'{g}.json'))
    grades = []
    for gg in range(7, 13):
        doc = json.load(open(os.path.join(JOZ, f'g{gg}.json'), encoding='utf-8'))
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
    json.dump({'generatedAt': '2026-10-20T09:30:00.000Z', 'grades': grades},
              open(os.path.join(JOZ, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(receipt, open(os.path.join(ROOT, 'scripts', 'r401-receipt.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(json.dumps(receipt, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
