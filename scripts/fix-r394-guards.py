#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r394-fix — اصلاحِ پنج خرابیِ گاردِ تازه (سشنِ قبلی پیش از اجرای کامل بریده بود):
۱) JSON: twinCensus «(l138-l153،» → «(gt-l138-l153،» (هم‌سویی با سبکِ r392/r393 و داک‌استرینگِ خودِ اسکریپت)
۲) extract-g12-khordad1399kharej-r394.py: همان جایگزینی در سطرِ twinCensus (سازگاریِ منبع)
۳) تستِ تازه: چهار اصلاح — keyPolicy به‌جای keyVerification برای «سومین برگهٔ پیاپی»،
   twinCensus به‌جای printQuirks برای «spared no pains»، آف‌بای‌وانِ l125 (questions[2])،
   حذفِ دو رشتهٔ نامعتبرِ نشت‌سنج (سنتِ Solar powerِ r393).
Idempotent: هر جایگزینی با شمارشِ دقیقاً-یک رخداد.
"""
from pathlib import Path

ROOT = Path("/home/z/my-project")
json_path = ROOT / "public/jozve/tests-g12.json"
ext_path = ROOT / "scripts/extract-g12-khordad1399kharej-r394.py"
tst_path = ROOT / "tests/jozve-tests-g12-khordad1399kharej-r394.test.ts"

# ---- ۱) JSON twinCensus ----
s = json_path.read_text(encoding="utf-8")
OLD, NEW = "(l138-l153،", "(gt-l138-l153،"
c = s.count(OLD)
assert c == 1, f"JSON: expected exactly 1 occurrence of {OLD!r}, found {c}"
json_path.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("JSON: twinCensus patched (gt- prefix)")

# ---- ۲) extract script consistency ----
s2 = ext_path.read_text(encoding="utf-8")
c2 = s2.count(OLD)
assert c2 == 1, f"extract: expected exactly 1 occurrence of {OLD!r}, found {c2}"
ext_path.write_text(s2.replace(OLD, NEW), encoding="utf-8")
print("extract script: twinCensus patched (gt- prefix)")

# ---- ۳) test file fixes ----
t = tst_path.read_text(encoding="utf-8")
edits = [
    # (a) «سومین برگهٔ پیاپی» در keyPolicy ساکن است
    ('    expect(kv).toContain("52. but");\n    expect(kv).toContain("سومین برگهٔ پیاپی");',
     '    expect(kv).toContain("52. but");\n'
     '    // r394-fix: ادعای «سومین برگهٔ پیاپیِ بدونِ کلیدِ بریده» در keyPolicy ساکن است (نه keyVerification)\n'
     '    expect(String(r16.keyPolicy)).toContain("سومین برگهٔ پیاپی");'),
    # (b) spared no pains یادداشتِ هم‌خانوادگی است نه کوئیرکِ چاپ
    ('    expect(joined).toContain("«a d-------»");\n    expect(joined).toContain("spared no pains");',
     '    expect(joined).toContain("«a d-------»");\n'
     '    // r394-fix: «spared no pains» یادداشتِ هم‌خانوادگیِ twinCensus است (پنجمین تکرار) — نه کوئیرکِ چاپ\n'
     '    expect(String(r16.twinCensus)).toContain("spared no pains");'),
    # (c) آف‌بای‌وان: l125-3 مبنای یک = questions[2]
    ('    // ساقهٔ نزدیکِ l125-3ِ دی ۹۸ با کلیدِ یکسان\n    expect(L(125).questions[3].accepted![0]).toBe("but");',
     '    // ساقهٔ نزدیکِ l125-3ِ دی ۹۸ (مبنای یک → questions[2]) با کلیدِ یکسانِ but\n'
     '    expect(L(125).questions[2].accepted![0]).toBe("but");'),
    # (d) دو رشتهٔ نامعتبرِ نشت‌سنج — سنتِ Solar powerِ r393
    ('      "shiny panels", // stemِ چاپِ ق۱۶ (س۴ تصویری)\n'
     '      "use wind to generate electricity", // stemِ چاپِ ق۱۵\n',
     '      // r394-fix: «shiny panels» حذف شد — متنِ خورشیدیِ مشروعِ راندهای قبل (سنتِ Solar power)\n'
     '      // r394-fix: «use wind to generate electricity» حذف شد — l94-2 (دی ۱۴۰۱) همین عبارت را مشروع رندر کرده\n'),
]
for old, new in edits:
    c3 = t.count(old)
    assert c3 == 1, f"test: fragment {old[:60]!r}... found {c3} times"
    t = t.replace(old, new)
tst_path.write_text(t, encoding="utf-8")
print("test file: 4 fixes applied")
print("r394-fix DONE")
