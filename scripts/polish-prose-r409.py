#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r409 — سوییپِ چهارمِ نثر: خانواده‌هایِ جابجاییِ حرفِ کشف‌شده با پروبِ r408.

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
    ('مهماب که آنها دعوت→مهمان‌هایی که آنها دعوت (تک‌خوانشِ مهمان)', r'مهماب که آنها دعوت', 'مهمان‌هایی که آنها دعوت'),
    ('بخیس از→بخشی از (پیش از قاعدهٔ بخیس)', r'بخیس از', 'بخشی از'),
    ('جدا نشدب→جدا نشدنی (کلاسِ ی→ب)', r'جدا نشدب', 'جدا نشدنی'),
    ('تاری خ→تاریخ (سرِ خِ افتاده)', r'تاری خ', 'تاریخ'),
    ('تأثی آنچه→تأثیر آنچه (بازسازی در نثر؛ تکه‌های جدولی محفوظ)', r'تأثی آنچه', 'تأثیر آنچه'),
    ('داخل پر ن→داخل پرانتز (شاهد لایهٔ چاپ: «پرانی ن»)', r'داخل پر ن', 'داخل پرانتز'),
    ('(یا یکب) صفت دو→(یا یک‌بخشی) صفت دو', r'\(یا یکب\) صفت دو', '(یا یک‌بخشی) صفت دو'),
    ('(یا یک ب) صفت دو→(یا یک‌بخشی) صفت دو', r'\(یا یک ب\) صفت دو', '(یا یک‌بخشی) صفت دو'),
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
    # ---- کلاسِ أ/اً (همان احتماألِ r407 — جابجاییِ همزه/تنوین؛ توکن‌به‌توکن تا مبدأ/رأی سالم بمانند)
    ('معموأل→معمولاً', r'معموأل', 'معمولاً'),
    ('معموآل→معمولاً (واریانتِ آ)', r'معموآل', 'معمولاً'),
    ('واقعأ→واقعاً', r'واقعأ', 'واقعاً'),
    ('کامأل→کاملاً', r'کامأل', 'کاملاً'),
    ('حتمأ→حتماً', r'حتمأ', 'حتماً'),
    ('قبأل→قبلاً', r'قبأل', 'قبلاً'),
    ('لطفأ→لطفاً', r'لطفأ', 'لطفاً'),
    ('فورأ→فوراً', r'فورأ', 'فوراً'),
    ('فورآ→فوراً', r'فورآ', 'فوراً'),
    ('اکثرأ→اکثراً', r'اکثرأ', 'اکثراً'),
    ('اصأل→اصلاً', r'اصأل', 'اصلاً'),
    ('عمومأ→عموماً', r'عمومأ', 'عموماً'),
    ('اخیأ→اخیراً', r'اخیأ', 'اخیراً'),
    ('اخیرأ→اخیراً', r'اخیرأ', 'اخیراً'),
    ('مخصوصأ→مخصوصاً', r'مخصوصأ', 'مخصوصاً'),
    ('بعدأ→بعداً', r'بعدأ', 'بعداً'),
    ('مثأل→مثلاً', r'مثأل', 'مثلاً'),
    ('دقیقأ→دقیقاً', r'دقیقأ', 'دقیقاً'),
    ('تقریبأ→تقریباً', r'تقریبأ', 'تقریباً'),
    ('منحصرأ→منحصراً', r'منحصرأ', 'منحصراً'),
    ('منحرصأ→منحصراً (جابجاییِ ر↔ص)', r'منحرصأ', 'منحصراً'),
    ('عمدتأ→عمدتاً', r'عمدتأ', 'عمدتاً'),
    ('مطمئنأ→مطمئناً', r'مطمئنأ', 'مطمئناً'),
    ('حقیقتأ→حقیقتاً', r'حقیقتأ', 'حقیقتاً'),
    ('صرفأ→صرفاً', r'صرفأ', 'صرفاً'),
    # ---- جابجایی‌هایِ تازهٔ کشفِ اسکنِ فرکانسی
    ('طبییع→طبیعی (ی↔ع)', rf'(?<!{LET})طبییع(?!{LET})', 'طبیعی'),
    ('ملیک→ملکی (ی↔ک؛ صفات ملکی)', rf'(?<!{LET})ملیک(?!{LET})', 'ملکی'),
    ('قدییم→قدیمی (ی↔م)', rf'(?<!{LET})قدییم(?!{LET})', 'قدیمی'),
    ('زمی→زمین (افت/جابجاییِ دم)', rf'(?<!{LET})زمی(?!{LET})', 'زمین'),
    ('زمات→زمان (ن→ت)', rf'(?<!{LET})زمات(?!{LET})', 'زمان'),
    ('زماب→زمان (ن→ب — کلاسِ ی→ب)', rf'(?<!{LET})زماب(?!{LET})', 'زمان'),
    ('زماتز→زمانی (زمات + دمِ ز→ی)', rf'(?<!{LET})زماتز(?!{LET})', 'زمانی'),
    ('گسیر ش→گسترش (پسردامِ گسیش)', r'گسیر ش', 'گسترش'),
    ('انگی→انگیز (دمِ زِ افتاده؛ شگفت‌انگیز/هیجان‌انگیز)', rf'(?<!{LET})انگی(?!{LET})', 'انگیز'),
    ('تأخی→تأخیر (ر→ی)', rf'(?<!{LET})تأخی(?!{LET})', 'تأخیر'),
    ('بخیس→بخش (س↔ش؛ پس از «بخیس از»)', rf'(?<!{LET})بخیس(?!{LET})', 'بخش'),
    ('مهماب→مهمانی (ن→ب؛ پس از تک‌خوانشِ مهمان)', rf'(?<!{LET})مهماب(?!{LET})', 'مهمانی'),
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
    # دنبالهٔ گم‌شدهٔ «پرانتز» — تنها توکنِ مستقلِ «انی» در کورپوس تکه‌ماندهٔ پرانتز است
    # (شاهد لایهٔ چاپ: «داخل پرانی  ن را بنویسید» = «داخل پرانتز را بنویسید»)
    ('انی→حذف (تکهٔ پرانتز — آخرین قاعده)', rf'(?<!{LET})انی(?!{LET})', ''),
]

# سنجشِ «باید صفر باشد» پس از اجرا
LEFT_CHECKS = [
    ('معموأل', r'معموأل'), ('معموآل', r'معموآل'), ('واقعأ', r'واقعأ'),
    ('کامأل', r'کامأل'), ('حتمأ', r'حتمأ'), ('قبأل', r'قبأل'),
    ('لطفأ', r'لطفأ'), ('فورأ', r'فورأ'), ('فورآ', r'فورآ'),
    ('اکثرأ', r'اکثرأ'), ('اصأل', r'اصأل'), ('عمومأ', r'عمومأ'),
    ('اخیأ', r'اخیأ'), ('اخیرأ', r'اخیرأ'), ('مخصوصأ', r'مخصوصأ'),
    ('بعدأ', r'بعدأ'), ('مثأل', r'مثأل'), ('دقیقأ', r'دقیقأ'),
    ('تقریبأ', r'تقریبأ'), ('منحصرأ', r'منحصرأ'), ('منحرصأ', r'منحرصأ'),
    ('عمدتأ', r'عمدتأ'), ('مطمئنأ', r'مطمئنأ'), ('حقیقتأ', r'حقیقتأ'),
    ('صرفأ', r'صرفأ'),
    ('طبییع', rf'(?<!{LET})طبییع(?!{LET})'), ('ملیک', rf'(?<!{LET})ملیک(?!{LET})'),
    ('قدییم', rf'(?<!{LET})قدییم(?!{LET})'), ('زمی', rf'(?<!{LET})زمی(?!{LET})'),
    ('زمات', rf'(?<!{LET})زمات(?!{LET})'), ('زماب', rf'(?<!{LET})زماب(?!{LET})'),
    ('زماتز', rf'(?<!{LET})زماتز(?!{LET})'), ('گسیر ش', r'گسیر ش'),
    ('انگی', rf'(?<!{LET})انگی(?!{LET})'), ('تأخی', rf'(?<!{LET})تأخی(?!{LET})'),
    ('بخیس', rf'(?<!{LET})بخیس(?!{LET})'), ('مهماب', rf'(?<!{LET})مهماب(?!{LET})'),
    ('تاری خ', r'تاری خ'), ('داخل پر ن', r'داخل پر ن'),
    ('جدا نشدب', r'جدا نشدب'),
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

    # --- واگرِ بانک‌هایِ آزمون: همهٔ tests-*/grammar-* (فیلدهایِ سؤال — نه source)
    bank_docs = {}
    for fn in sorted(os.listdir(JOZ)):
        if not (fn.startswith('tests-') or fn.startswith('grammar-')) or not fn.endswith('.json'):
            continue
        bank_docs[fn[:-5]] = json.load(open(f'{JOZ}/{fn}', encoding='utf-8'))
    for name, doc in bank_docs.items():
        for le in doc.get('lessons', []):
            lt = le.get('title', '')
            for qi, q in enumerate(le.get('questions', []) or []):
                w = f'{name}:{lt}:q{qi}'
                if isinstance(q.get('question'), str):
                    q['question'] = process(q['question'], f'{w}:question')
                for oi, opt in enumerate(q.get('options', []) or []):
                    if isinstance(opt, str):
                        q['options'][oi] = process(opt, f'{w}:o{oi}')
                if isinstance(q.get('translation'), str):
                    q['translation'] = process(q['translation'], f'{w}:translation')
                for ai, acc in enumerate(q.get('accepted', []) or []):
                    if isinstance(acc, str):
                        q['accepted'][ai] = process(acc, f'{w}:a{ai}')
                if isinstance(q.get('explanation'), str):
                    q['explanation'] = process(q['explanation'], f'{w}:explanation')

    # --- نگارش با حفظِ سریال‌سازیِ اصل
    for g, doc in docs.items():
        if g in ('g7', 'g8', 'g9'):
            with open(f'{JOZ}/{g}.json', 'w', encoding='utf-8') as fh:
                json.dump(doc, fh, ensure_ascii=False)
        else:
            json.dump(doc, open(f'{JOZ}/{g}.json', 'w', encoding='utf-8'),
                      ensure_ascii=False, indent=1)
    for name, doc in bank_docs.items():
        # شیوهٔ سریال‌سازیِ اصلِ هر بانک حفظ شود (درسِ r407/r408):
        # grammar-g11 و grammar-g11-konkur در HEAD فشرده‌اند — بقیه indent=1
        raw0 = open(f'{JOZ}/{name}.json', encoding='utf-8').read()
        compact = '\n' not in raw0[:200]
        path = f'{JOZ}/{name}.json'
        if compact:
            json.dump(doc, open(path, 'w', encoding='utf-8'), ensure_ascii=False)
        else:
            json.dump(doc, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

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
    # printQuirks/layerNoiseFixesِ محفوظ در source است و از دامنه خارج)
    walked_parts: list = []
    for gg in range(7, 13):
        doc = json.load(open(f'{JOZ}/g{gg}.json', encoding='utf-8'))
        for ch in doc['chapters']:
            for sec in ch['sections']:
                walked_parts.append(str(sec.get('title', '')))
                walked_parts.extend(str(x) for x in sec.get('lines', []))
    for fn in sorted(os.listdir(JOZ)):
        if not (fn.startswith('tests-') or fn.startswith('grammar-')) or not fn.endswith('.json'):
            continue
        doc = json.load(open(f'{JOZ}/{fn}', encoding='utf-8'))
        for le in doc.get('lessons', []):
            for q in le.get('questions', []) or []:
                walked_parts.append(str(q.get('question', '')))
                walked_parts.extend(str(x) for x in q.get('options', []) or [])
                walked_parts.append(str(q.get('translation', '')))
                walked_parts.extend(str(x) for x in q.get('accepted', []) or [])
                walked_parts.append(str(q.get('explanation', '')))
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
    receipt_path = f'{ROOT}/scripts/r409-receipt.json'
    # رسیدِ نوبتِ-اول حفظ شود — اجرایِ ایدمپوتنتِ بعدی (total=0) نباید آن را پاک کند
    if total > 0 or not os.path.exists(receipt_path):
        receipt = {'round': 'r409', 'total': total, 'rules': stats, 'samples': samples,
                   'leftAfter': left or {}}
        with open(receipt_path, 'w', encoding='utf-8') as fh:
            json.dump(receipt, fh, ensure_ascii=False, indent=1)

    print(f'TOTAL fixes: {total} across {len(stats)} rules')
    for name, c in sorted(stats.items(), key=lambda x: -x[1]):
        print(f'  {c:4d}  {name}')
    print('LEFT after (must be empty):', left if left else 'ZERO ✓')


if __name__ == '__main__':
    main()
