# -*- coding: utf-8 -*-
# r321 — شست‌وشوی چاپ‌محورِ ۲۰ ترجمهٔ «پاسخنامهٔ تمرین و دستگریمی آموزش گرامر کلمات ربط» (ص۱۹۲)
# به بانکِ دستگریمیِ «کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)» از grammar-g12-topic.json
# الگوی r316/r317/r318/r320: رونویسیِ چشمی ۳۰۰-۳۶۰۰dpi + کراس‌چکِ fitz + تزریقِ idempotent.
# لایهٔ OCR ص۱۹۲ نویزِ سنگین دارد (شگرم/مهماب/عیل/تمیر/میر نم/خوایه/بیاست) — رندر حاکم.
# رسید: lessons[12].source.translationsWashed — کلیدها دست‌نخورده (داوری ۲۰/۲۰ با گزینهٔ JSON).
import json
import hashlib
import sys

PATH = 'public/jozve/grammar-g12-topic.json'
TARGET_TITLE_PREFIX = 'کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)'

# رونویسیِ چاپ‌محورِ ۲۰ ترجمهٔ ص۱۹۲ (نقطه‌گذاریِ میان‌جمله‌ایِ لایه = آرتیفکت، نرمال به پایانِ جمله؛
# املای چسبیده/جدا و محاورهٔ چاپ حفظ شده؛ هر ۲۰ مورد با زومِ ۱۶۰۰-۳۶۰۰dpi رندر-تصدیق شد)
TRANSCRIPT = {
    1: 'او روزنامه میخواند اما خواندن کتاب را دوست ندارد.',
    2: 'فوتبال بازی کردن در پارک در فصل زمستان سرگرم کننده است اما بهتره در گرمای تابستان باشد.',
    3: 'من هر یکشنبه به پارک میروم چونکه دوست دارم اردکها را در دریاچه تماشا کنم.',
    4: 'من به مهمانی رفت و از آن لذت بردم.',
    5: 'او نه تنیس را دوست داره و نه پینگ پونگ. صادقانه بگم، او فقط فوتبال را دوست دارد.',
    6: 'نه وظیفه منه و نه او. فقط وظیفه علی است که اتاق را تمیز کند.',
    7: 'چای دوست داری یا قهوه؟',
    8: 'این سوپ گرم و خوشمزه است.',
    9: 'بهترین دوستم و خانواده اش اهل اسپانیا هستند.',
    10: 'من میخوام برم بخوابم بنابراین دارم دندانهایم را مسواک میزنم.',
    11: 'آنها خیلی فقیر هستند. آنها تلویزیون یا رادیو ندارند.',
    12: 'ما باید به سینما بریم یا در خانه بمانیم.',
    13: 'من همیشه یک کتاب برای خریدن میخرم با وجود این به نظر نمیرسه یک صفحه از آن را ورق بزنم.',
    14: 'او خیلی جوان است با وجود این خیلی با تجربه است.',
    15: 'او هر بعد از ظهر به باشگاه تنیس میرود چونکه عاشق تنیس بازی کردن است.',
    16: 'او به مدرسه نیامد چونکه مریض بود.',
    17: 'ما از فیلم خسته شدیم بنابراین سینما را ترک کردیم.',
    18: 'صندلیهای زیادی وجود داشت بنابراین تو مجبور نبود که بایستی.',
    19: 'من هر جمعه به پارک میروم و به آواز خواندن پرندگان گوش میکنم.',
    20: 'او شنا کردن را دوست دارد اما نمیداند چطور شنا کند.',
}

# کلیدِ حرفیِ چاپیِ ص۱۹۲ (پرانتزِ بعد از شماره) — برای داوری با options[answer]
PRINT_KEYS = {
    1: 'but', 2: 'but', 3: 'for', 4: 'and', 5: 'nor', 6: 'nor', 7: 'or',
    8: 'and', 9: 'and', 10: 'so', 11: 'nor', 12: 'or', 13: 'yet', 14: 'yet',
    15: 'for', 16: 'for', 17: 'so', 18: 'so', 19: 'and', 20: 'but',
}

RECEIPT = {
    'round': 'r321',
    'pages': '192',
    'section': 'پاسخنامه تمرین و دستگریمی آموزش گرامر "کلمات ربط" (صفحه 48) — ۲۰ آیتم با کلید حرفی + ترجمهٔ چاپی',
    'method': 'visual transcription 1600-3600dpi renders + fitz cross-check (r316-r320 pattern)',
    'items': 20,
    'supersedes': 'normalized layer-era translations of the typed bank — all 20 replaced print-verbatim',
    'keyArbitration': 'printed letter key p192 vs options[answer] — see keyAgree in receipt',
    'layerNoiseFixes': [
        'Q2 «شگرم کننده» لایه → «سرگرم کننده» چاپ (ر افتاده؛ زوم ۳۶۰۰dpi)',
        'Q4 «مهماب» لایه → «مهمانی» چاپ (ن→ب)',
        'Q6 «عیل» → «علی» و «تمیر» → «تمیز» (زوم ۲۴۰۰dpi)',
        'Q9 «بهی ین» لایه → «بهترین»',
        'Q10 «مسواک میر نم» لایه → «مسواک میزنم» چاپ (زوم ۳۶۰۰dpi)',
        'Q11/Q14 «خییل» لایه → «خیلی» چاپ',
        'Q13 «نمیر سه» لایه → «نمیرسه» چاپ (زوم ۲۴۰۰dpi)',
        'Q15 «میر ود» → «میرود»؛ Q3/Q19 «میر وم» → «میروم» (زوم i19)',
        'Q18 «مجبور خوایه بود» لایه → «مجبور نبود» چاپ؛ «بیاست» → «بایستی» (زوم ۱۶۰۰dpi خطِ کامل)',
        'نقطه‌های میان‌جمله‌ایِ لایه (مثل «اما .خواندن») آرتیفکتِ استخراج‌اند — نرمال به پایانِ جمله',
    ],
    'printQuirks': [
        'Q1 «میخواند» چسبیده', 'Q2 «بهتره» محاورهٔ چسبیده', 'Q5 «داره» + «صادقانه بگم» محاوره + «پینگ پونگ» جدا',
        'Q6 «وظیفه منه» محاوره', 'Q9 «خانواده اش» جدا', 'Q10 «میخوام برم بخوابم» محاوره + «دندانهایم» چسبیده',
        'Q12 «بریم» محاوره', 'Q13 «میخرم»/«نمیرسه» محاورهٔ چسبیده', 'Q14 «با تجربه» جدا (بخلاف «باتجربه» استاندارد)',
        'Q15 «بعد از ظهر» جدا', 'Q18 «صندلیهای» چسبیده', 'Q19 «گوش میکنم» چسبیده',
    ],
    'printErrata': [
        'Q18 ترجمهٔ چاپ «صندلیهای زیادی وجود داشت» ناسازگار با ساقهٔ انگلیسی "There are no more chairs available" — عینِ چاپ حفظ شد (الگوی printErrata r309/r320)',
    ],
}


def main():
    with open(PATH, encoding='utf-8') as f:
        raw = f.read()
    before_md5 = hashlib.md5(raw.encode()).hexdigest()
    data = json.loads(raw)

    target = None
    for les in data['lessons']:
        if les.get('title', '').startswith(TARGET_TITLE_PREFIX):
            target = les
            break
    if target is None:
        print('TARGET BANK NOT FOUND:', TARGET_TITLE_PREFIX)
        sys.exit(1)

    qs = target['questions']
    if len(qs) != 20:
        print('UNEXPECTED question count:', len(qs))
        sys.exit(1)

    # داوری کلید: کلیدِ حرفیِ چاپ ص۱۹۲ باید با options[answer] یکی باشد
    agree = 0
    for q in qs:
        print_key = PRINT_KEYS[q['n']]
        json_key = q['options'][q['answer']]
        if print_key == json_key:
            agree += 1
        else:
            print(f"KEY DIVERGENCE Q{q['n']}: print={print_key} json={json_key}")
    print(f'key agreement: {agree}/20')

    # شمارشِ تغییرها (برای idempotency)
    changed = 0
    for q in qs:
        new_t = TRANSCRIPT[q['n']]
        if q.get('translation') != new_t:
            q['translation'] = new_t
            changed += 1
    print(f'translations changed: {changed}')

    # رسید — داوریِ کلید به رسید اضافه می‌شود
    receipt = dict(RECEIPT)
    receipt['keyAgree'] = agree
    src = target.setdefault('source', {})
    src['file'] = 'جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf'
    src['questionPage'] = '48'
    src['keyPage'] = '192'
    src['translationsWashed'] = receipt

    if changed == 0 and 'translationsWashed' in src:
        print('NO-OP — nothing to do')
        return

    out = json.dumps(data, ensure_ascii=False, indent=1) + '\n'
    with open(PATH, 'w', encoding='utf-8') as f:
        f.write(out)
    after_md5 = hashlib.md5(out.encode()).hexdigest()
    print(f'md5: {before_md5} -> {after_md5}')
    print('WASH OK — 20 print-verbatim translations injected into دستگریمی bank + receipt')


if __name__ == '__main__':
    main()
