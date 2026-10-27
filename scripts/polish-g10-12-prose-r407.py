#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r407 — دومین موجِ حکمِ بافتیِ نثر (خانواده‌هایِ مستندِ nextRoundCandidates رَ r406).

ورودی: پروبِ scripts/r407-fulllines.json + شواهدِ کورپوسِ لایهٔ چاپ (content-extracts/gradeN.txt).
حکم‌هایِ کلیدی:
  • یم→می‌ (جابجاییِ ی/م — همان کلاسِ نیم→نمی): «مطالعه یمکنم»→«مطالعه می‌کنم» (۸۶ رخداد، همگی فعل‌آغاز)
  • کیم→کمی (جابجاییِ ی/م — حروفِ یکسانِ بازچینی‌شده): «تعداد کیم»→«تعداد کمی»؛ نامِ «کیمیا» مصون (نگاه‌داشتِ یا)
  • مطمی→مطمئن (افتِ همزه) — «مطمیی ن»→«مطمئن» در documentations/tests-g10 مستند است (ر334)
  • منطف→منطقی — «منطف»→«منطقی» در printQuirksِ tests-g10 (ر334) مستند است
  • دخی/دخیر/دخیش/دخیم/دخیها/دخیی→دختر/دخترش/دخترم/دخترها/دختری — «دخیم»→«دخترم» در tests-g10 مستند است
  • یگ→یکی (افتِ ک): «یگ پس از دیگری»، «یگ به یگ»، «یگ از مهمیین»
  • احتماأل→احتمالاً (جابجاییِ الف+همزه؛ ۱۱ رخداد)
  • گیی→گیری (افتِ ر): اندازه‌گیری/نتیجه‌گیری/تصمیم‌گیری/به‌کارگیری/پیش‌گیری/شکل‌گیری — «گییح»→گیج جدا
  • معتی/معتیی→معتبر: عبارتِ ثابتِ اعتبارِ منابعِ «مؤسسات معتبر کنکوری» + سطرِ authority (صلاحیت، اختیار، معتبر)
  • میسر: «گنج میس/میش نیمشود»=گنج میسر نمی‌شود (ضرب‌المثل)؛ «میسید/میسه»=به نظر می‌رسید/می‌رسه (بافتِ «به نظر ر»)؛ «خط میس»=خط مشی (policy)
  • میش نشسته=پشت میز نشسته (میز)؛ «شیدزد»=شتر دزد (تخم‌مرغ دزد شتر دزد می‌شود)؛ «فرویس»=فروشی (شیرینی‌فروشی، روزنامه‌فروشی، کادوفروشی — شاهدِ چاپ L39186/L35367/L33773)
  • «شییت»=شیرینی (دیالوگِ خریدِ سحر — شاهدِ چاپِ همان دیالوگ)
  • بازسازیِ موقعیتیِ جفتِ خطِ «مشتری بزرگترین سیاره» (g10:c5:2 — انگلیسیِ همان خط: Jupiter is the largest one)

نگه‌داشته‌هایِ مستند: جدولِ صرفیِ «شو» در g9 (تکه‌هایِ ستونیِ بی‌چاپِ معتبر)، نامِ «کیمیا»، «میشه»یِ محاوره‌ای،
«میشود/میشوند» (املایِ درست)، ساعت‌ها و نیم‌دایره (قاعدهٔ نیم فقط فعل‌ها را می‌گیرد).
خروجی: بازنویسیِ in-place شش سند + بازهمگامیِ index.json + رسیدِ scripts/r407-receipt.json. ایدمپوتنسی: اجرایِ دوم=صفر.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOZ = os.path.join(ROOT, 'public', 'jozve')
FA = '[\\u0600-\\u06FF\\u200c]'      # کلِ بلاک — برایِ یگِ کنارِ علائم هم محافظت می‌کند
LET = '[\\u0621-\\u064A\\u0670-\\u06D3\\u200c]'  # فقط حروف — علائمِ ،؛؟ و رقم‌ها را رد می‌کند
FA_RX = re.compile(f'{FA}')
GRADES = ('g7', 'g8', 'g9', 'g10', 'g11', 'g12')

# --------------------------------------------------- بازسازیِ موقعیتیِ خطِ کامل
# (گ، ایندکسِ فصل، ایندکسِ سکشن، ایندکسِ خط) → (متنِ قدیمِ دقیقِ پیش از r407، متنِ جدید)
POSITIONAL_LINES = {
    # chapters[4] id=c5 — سکشنِ ترجمهٔ مکالمهٔ Vision One - Lesson Two
    ('g10', 4, 2, 40): ('کن؟ مشیی بزر ر', ''),  # تکه‌هایِ تکراریِ ستونی — همه در بازسازیِ L41 آمده‌اند
    ('g10', 4, 2, 41): ('گیین سیاره است .بیش از 60قمر داره .میخوای بهش نگاه ز خانم تابش :سیاره ر',
                        'خانم تابش :سیاره مشتری بزرگترین سیاره است .بیش از 60قمر داره .میخوای بهش نگاه کن؟'),
}

# --------------------------------------------------- قواعدِ موقعیتی (پیش از سراسری‌ها)
POSITIONAL_SUBS = [
    ('گنج میس(?!ر)→گنج میسر', r'گنج میس(?!ر)', 'گنج میسر'),
    ('گنج میش→گنج میسر', r'گنج میش', 'گنج میسر'),
    ('میش نشسته→میز نشسته', r'میش نشسته', 'میز نشسته'),
    ('خط میس→خط مشی', r'خط میس', 'خط مشی'),
    ('شیدزد→شتر دزد', r'شیدزد', 'شتر دزد'),
    ('پیاده کت→پیاده کنی', r'پیاده کت', 'پیاده کنی'),
    ('یک پس و سه دخی→یک پسر و سه دختر', r'یک پس و سه دخی', 'یک پسر و سه دختر'),
    ('دو پس و یک دخی→دو پسر و یک دختر', r'دو پس و یک دخی', 'دو پسر و یک دختر'),
    ('پس 7ساله→پسر 7ساله', r'پس 7ساله', 'پسر 7ساله'),
    ('از پسها→از پسرها', r'از پسها', 'از پسرها'),
    ('بزرگیین→بزرگترین (دُمِ «ترین» — نباید به «بزرگیرین» بیفتد)', r'بزرگیین', 'بزرگترین'),
    ('سطرِ authority — صالحیت→صلاحیت + جداکننده (از حالتِ اصلیِ «معتیی»)', r'صالحیت، اختیار - معتیی', 'صلاحیت، اختیار، معتبر'),
    # خانوادهٔ گییِ حرف‌چسبیده — دُمِ واژه‌هایِ گیری/انگیز (پیش از قاعدهٔ سراسری)
    ('انگیی که نزدیک→انگیزی که نزدیک', r'انگیی که نزدیک', 'انگیزی که نزدیک'),
    ('انگیی روبه رو→انگیزی روبه رو', r'انگیی روبه رو', 'انگیزی روبه رو'),
    ('انگیی!→انگیز!', r'انگیی!', 'انگیز!'),
    ('انگیی دارد→انگیز دارد', r'انگیی دارد', 'انگیز دارد'),
    ('غلطگیی→غلط‌گیری', r'غلطگیی', 'غلط‌گیری'),
    ('ده هزارمیی→ده هزار متری', r'ده هزارمیی', 'ده هزار متری'),
    ('برای معات→برای معانی', r'برای معات', 'برای معانی'),
    ('و لذت بییم→و لذت ببریم', r'و لذت بییم', 'و لذت ببریم'),
]

# --------------------------------------------------- قواعدِ پسین (بعد از سراسری‌ها — ترمیمِ حاصلِ قاعدهٔ گیی)
POST_SUBS = [
    ('گیری طول→اندازه‌گیری طول (سرِ واژهٔ افتاده)', r'(?<![\u0600-\u06FF\u200c])گیری طول', 'اندازه‌گیری طول'),
]

# --------------------------------------------------- قواعدِ سراسریِ اثبات‌شده (مرتب)
GLOBAL_RULES = [
    ('گییحی→گیجی', r'گییحی', 'گیجی'),
    ('گییح→گیج', rf'(?<!{LET})گییح(?!{LET})', 'گیج'),
    ('معتیی→معتبر', rf'(?<!{LET})معتیی(?!{LET})', 'معتبر'),
    ('معتی→معتبر', rf'(?<!{LET})معتی(?!{LET})', 'معتبر'),
    ('دخیشان→دخترشان', r'دخیشان', 'دخترشان'),
    ('دخیش→دخترش', rf'(?<!{LET})دخیش(?!{LET})', 'دخترش'),
    ('دخیم→دخترم', rf'(?<!{LET})دخیم(?!{LET})', 'دخترم'),
    ('دخیها→دخترها', rf'(?<!{LET})دخیها(?!{LET})', 'دخترها'),
    ('دخیی→دختری', rf'(?<!{LET})دخیی(?!{LET})', 'دختری'),
    ('دخیر→دختر', rf'(?<!{LET})دخیر(?!{LET})', 'دختر'),
    ('دخی→دختر', rf'(?<!{LET})دخی(?!{LET})', 'دختر'),
    ('شییت→شیرینی', rf'(?<!{LET})شییت(?!{LET})', 'شیرینی'),
    ('فرویس→فروشی', rf'(?<!{LET})فرویس(?!{LET})', 'فروشی'),
    ('گیی→گیری (بی‌گارد — همیشه دُمِ گیری)', r'گیی', 'گیری'),
    ('یم→می‌', rf'(?<!{FA})یم(?={FA})', 'می‌'),
    ('نیم+فعل→نمی‌', rf'(?<!{FA})نیم(?=شود|کن|دان|سوز|خواه|خوان|گیر|بین|ده|آور|برد|بود|داد|رفت|رود|خورد|باش|توان|یاب|رس)', 'نمی‌'),
    ('کیم→کمی', rf'(?<!{LET})کیم(?!یا)(?!{LET})', 'کمی'),
    ('مطمی→مطمئن', rf'(?<!{LET})مطمی(?!{LET})', 'مطمئن'),
    ('منطف→منطقی', rf'(?<!{LET})منطف(?!{LET})', 'منطقی'),
    ('میسید→می‌رسید', rf'(?<!{LET})میسید(?!{LET})', 'می‌رسید'),
    ('میسه→می‌رسه', rf'(?<!{LET})میسه(?!{LET})', 'می‌رسه'),
    ('نیسیتم→نیستیم', r'نیسیتم', 'نیستیم'),
    ('احتماأل→احتمالاً', r'احتماأل', 'احتمالاً'),
    ('یگ→یکی', rf'(?<!{LET})یگ(?!{LET})', 'یکی'),
]

# سنجشِ «باید صفر باشد» پس از اجرا (به‌جز نگه‌داشته‌ها) — با گاردِ حروفی تا کنارِ «،» هم بگیرد
LEFT_CHECKS = [
    ('یم', rf'(?<!{FA})یم(?={FA})'),
    ('کیم', rf'(?<!{LET})کیم(?!یا)(?!{LET})'),
    ('مطمی', rf'(?<!{LET})مطمی(?!{LET})'),
    ('منطف', rf'(?<!{LET})منطف(?!{LET})'),
    ('معتی', rf'(?<!{LET})معتی'),
    ('دخی-خانواده', rf'(?<!{LET})دخ(ی|یر|یش|یم)(?!{LET})'),
    ('شییت', rf'(?<!{LET})شییت(?!{LET})'),
    ('فرویس', rf'(?<!{LET})فرویس(?!{LET})'),
    ('گییح', r'گییح'),
    ('گیی', r'گیی'),
    ('نیم+فعل', rf'(?<!{LET})نیم(?=شود|کن|دان|سوز)'),
    ('میسید', rf'(?<!{LET})میسید(?!{LET})'),
    ('میسه', rf'(?<!{LET})میسه(?!{LET})'),
    ('گنج میس', r'گنج میس(?!ر)'),
    ('گنج میش', r'گنج میش'),
    ('خط میس', r'خط میس'),
    ('میش نشسته', r'میش نشسته'),
    ('نیسیتم', r'نیسیتم'),
    ('احتماأل', r'احتماأل'),
    ('یگ', rf'(?<!{LET})یگ(?!{LET})'),
    ('شیدزد', r'شیدزد'),
    ('پیاده کت', r'پیاده کت'),
    ('انگیی', r'انگیی'),
    ('غلطگیی', r'غلطگیی'),
    ('ده هزارمیی', r'ده هزارمیی'),
    ('معات', r'برای معات'),
    ('لذت بییم', r'لذت بییم'),
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
        # بازسازیِ موقعیتیِ خطِ کامل — فقط با تطابقِ عینِ متنِ قدیم (ایدمپوتنسی)
        if where in POSITIONAL_LINE_BY_WHERE:
            expected_old, new = POSITIONAL_LINE_BY_WHERE[where]
            if text == expected_old:
                record('خطِ موقعیتی (بازسازیِ کامل)', where, new[:80])
                return new
            return text
        text = apply_subs(text, where, POSITIONAL_SUBS)
        text = apply_subs(text, where, GLOBAL_RULES)
        text = apply_subs(text, where, POST_SUBS)
        return text

    # نقشهٔ where → (متنِ قدیمِ دقیق، متنِ جدید) برای خط‌هایِ موقعیتی — از تعریفِ هاردکد
    POSITIONAL_LINE_BY_WHERE = {}
    for (g, chi, si, li), (old, new) in POSITIONAL_LINES.items():
        doc0 = json.load(open(f'{JOZ}/{g}.json', encoding='utf-8'))
        ch0 = doc0['chapters'][chi]
        sec0 = ch0['sections'][si]
        where = f'{g}:{ch0["id"]}:{si}:{sec0.get("type", "")}:L{li}'
        POSITIONAL_LINE_BY_WHERE[where] = (old, new)

    docs = {}
    for g in GRADES:
        docs[g] = json.load(open(f'{JOZ}/{g}.json', encoding='utf-8'))

    for g, doc in docs.items():
        for chi, ch in enumerate(doc['chapters']):
            for si, sec in enumerate(ch['sections']):
                stype = sec.get('type', '')
                sec['title'] = process(sec['title'], f'{g}:{ch["id"]}:{si}:{stype}:title')
                for li, ln in enumerate(sec['lines']):
                    sec['lines'][li] = process(ln, f'{g}:{ch["id"]}:{si}:{stype}:L{li}')

    for g, doc in docs.items():
        # g7-g9 در HEAD فشرده‌اند (یک‌خطی، جداکنندهٔ پیش‌فرض) — فرمتِ اصل حفظ شود
        # (تا سروِ استاتیک باد نکند و diff فقط محتوا باشد)
        if g in ('g7', 'g8', 'g9'):
            with open(f'{JOZ}/{g}.json', 'w', encoding='utf-8') as fh:
                json.dump(doc, fh, ensure_ascii=False)
        else:
            json.dump(doc, open(f'{JOZ}/{g}.json', 'w', encoding='utf-8'),
                      ensure_ascii=False, indent=1)

    # بازهمگامیِ index.json
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
    json.dump({'generatedAt': '2026-10-20T16:30:00.000Z', 'grades': grades},
              open(f'{JOZ}/index.json', 'w', encoding='utf-8'), ensure_ascii=False)

    # راستیِ پس از اجرا — نگه‌داشتهٔ مستندِ جدولِ g9 مستثناست
    g9_doc = json.load(open(f'{JOZ}/g9.json', encoding='utf-8'))
    g9_keep_lines = []
    sec = g9_doc['chapters'][1]['sections'][12]
    for li in (20, 35, 37, 40):
        g9_keep_lines.append(f'g9:c1:12:L{li}: {sec["lines"][li].strip()[:60]}')

    left = {}
    for g in GRADES:
        doc = json.load(open(f'{JOZ}/{g}.json', encoding='utf-8'))
        for chi, ch in enumerate(doc['chapters']):
            for si, secc in enumerate(ch['sections']):
                stype = secc.get('type', '')
                texts = [(f'{g}:{ch["id"]}:{si}:{stype}:title', secc['title'])] + \
                        [(f'{g}:{ch["id"]}:{si}:{stype}:L{li}', ln)
                         for li, ln in enumerate(secc['lines'])]
                for where, text in texts:
                    if g == 'g9' and ':c1:12:' in where and \
                       where.rsplit(':L', 1)[-1] in ('20', '35', '37', '40'):
                        continue
                    for name, pat in LEFT_CHECKS:
                        for m in re.finditer(pat, text):
                            left.setdefault(name, []).append(f'{where}: {text.strip()[:70]}')

    total = sum(stats.values())
    receipt_path = os.path.join(ROOT, 'scripts', 'r407-receipt.json')
    if total == 0 and os.path.exists(receipt_path):
        # اجرایِ ایدمپوتنت — رسیدِ واقعیِ راند دست‌نخورده می‌ماند
        print('IDEMPOTENT RUN — zero replacements, existing r407-receipt.json kept')
        print('leftAfter:', 'خالی' if not left else left)
        return
    receipt = {
        'round': 'r407',
        'replacements': stats,
        'samples': samples,
        'keptDocumented': {
            'g9-sho-conjugation-fragments': g9_keep_lines,
            'kimiya-personal-name': 'کیم(?!یا) نگه‌داشت — ۸ توکن در g7 (دیالوگ معرفی) و g10',
            'mishe-colloquial': '«میشه» (می‌شه محاوره‌ای) سالم — فقط «میسه»(س) اصلاح می‌شود',
            'mishod-legit-spelling': '«میشود/میشوند» املایِ درستِ بدونِ نیمفاصله — دست‌نخورده',
            'nim-narrow-rule': 'قاعدهٔ نیم فقط فعل‌ها را می‌گیرد؛ ساعت/نیم‌دایره/نیمه دست‌نخورده',
        },
        'leftAfter': left,
        'idempotenceNote': 'اجراهایِ بعدی باید صفر بازگردانند (همهٔ قواعد self-match ندارند — گنج میس(?!ر) گارد دارد)',
    }
    json.dump(receipt, open(os.path.join(ROOT, 'scripts', 'r407-receipt.json'), 'w',
                            encoding='utf-8'), ensure_ascii=False, indent=1)

    total = sum(stats.values())
    print(f'TOTAL replacements: {total}')
    for k, v in sorted(stats.items(), key=lambda x: -x[1]):
        print(f'{v:5d}  {k}')
    print('--- leftAfter (باید خالی یا فقط نگه‌داشته‌ها) ---')
    if not left:
        print('   (خالی — همهٔ خانواده‌ها بسته شدند)')
    for k, v in left.items():
        print(f'{k}: {len(v)}')
        for row in v[:5]:
            print('   ', row)


if __name__ == '__main__':
    main()
