#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r364 — «سؤالات امتحانی درس اول» نهم (ص۳۱-۳۳ چاپی؛ pdf-p31-33) → tests-g9.json
خانواده: ۱۵ سکشن؛ ۷ سکشنِ کلیدپذیر استخراج می‌شود (۲۹ آیتم در ۷ بانکِ ۹-۱۵):
  س۲ متضاد (۴ تایپی) — کلید از واژنامهٔ خودِ درس اول یکتاست (Kind→Cruel، lazy→Hard working،
      Happy→Upset، Talkative→Quiet) — الگوی خوداعتبارسنجیِ r357 در لغت‌نامهٔ درس
  س۴ سوالی/منفی (۲ تایپی) — تبدیلِ نحویِ یکتای «Mina is hard working.»
  س۶ there is/are (۴ تایپی) — کلیدِ ساختاریِ توافق (الگوی r362) — دوستونیِ RTL با شماره بازچینی
  س۷ گزینه صحیح (۳ MCQ) — کلیدِ استنتاجیِ خودکار (she is not quiet→talkative؛ Everybody likes him→kind؛
      There is … apple→an)
  س۹ کلمه ناهماهنگ (۷ MCQ) — کلیدِ استنتاجی: فعل/اسمِ میانِ صفت‌ها (۱/۴)، غیرمکان (۵)، منفیِ تنها (۳/۷)،
      حالتِ گذرا در برابرِ ویژگیِ شخصیتی (۲/۶ — موضوعِ واحدِ درس)
  س۱۱ am/is/are (۵ تایپی) — کلیدِ ساختاریِ توافق
  س۱۴ مکالمهٔ وصل‌شدنی (۴ MCQ) — گزینه‌های چاپیِ a-e؛ کلید با توافقِ ضمیر/نوعِ پرسش یکتاست
۸ سکشنِ استثنی‌شده (رسید): س۱/س۳/س۱۲ تصویری، س۵/س۱۵ تولیدِ آزاد، س۸ ابهامِ دوکلیدی
  (جای ۴/۵: selfish/patient)، س۱۰ آهنگی (افتان/خیزان).
هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست — کلید = استنتاجِ مستند.
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
G9 = ROOT / "public/jozve/tests-g9.json"

# ————— برشِ pdf-p31-33 —————
PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i


def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]


SEG = page_lines(31) + page_lines(32) + page_lines(33)


def find(needle: str, from_abs: int = 0) -> int:
    for i in range(from_abs, len(SEG)):
        if needle in SEG[i]:
            return i
    raise AssertionError(f"anchor missing: {needle!r}")


LEADER = re.compile(r"[.…]{2,}(?:\s*[.…]+)*")  # رانِ ۲+ نشانهٔ نقطه‌چین/بیضی (نقطهٔ شماره‌گذاری را نمی‌بلعد)


def collapse(s: str) -> str:
    """ران‌های نقطه‌چین → رانِ تیره؛ پس از ران، اگر نویسهٔ حرفی چسبیده باشد فاصله درج می‌شود"""
    out = LEADER.sub("-------", s)
    out = re.sub(r"-------(?=[A-Za-z])", "------- ", out)
    return out.strip()


def clean_text(s: str) -> str:
    return re.sub(r"\s+", " ", collapse(s)).strip()


# ————— س۲: متضاد (دوستونیِ RTL: Kind/lazy در یک سطر، Happy/Talkative در سطر بعد) —————
i2 = find("متضاد کلمات")
r_kind = clean_text(SEG[i2 + 1])
r_happy = clean_text(SEG[i2 + 2])
assert r_kind.startswith("Kind:") and "lazy:" in r_kind, r_kind
assert r_happy.startswith("Happy:") and "Talkative:" in r_happy, r_happy
s2_pairs = []
for label, src in [("Kind", r_kind), ("lazy", r_kind), ("Happy", r_happy), ("Talkative", r_happy)]:
    m = re.search(re.escape(label) + r":\s*(-------)?", src)
    assert m, f"S2 label {label} missing in {src!r}"
    s2_pairs.append(label)
assert s2_pairs == ["Kind", "lazy", "Happy", "Talkative"]
S2_KEYS = {"Kind": ["cruel"], "lazy": ["hard working", "hardworking", "hard-working"],
           "Happy": ["upset", "sad"], "Talkative": ["quiet"]}

# ————— س۴: سوالی/منفی —————
i4 = find("سوالی و یکبار منفی")
sent = clean_text(SEG[i4 + 1])
assert sent == "Mina is hard working.", sent
lab4 = clean_text(SEG[i4 + 2])
assert "سوالی" in lab4 and "منفی" in lab4, lab4

# ————— س۶: there is/there are (دوستونی: 1)…2)… / 3)…4)…) —————
i6 = find("جاهای خالی را باthere is")
i6a = find("1)", i6)          # دستورِ چاپ چندخطی است — سطرِ آیتم‌ها با لنگرِ «1)»
l6a = clean_text(SEG[i6a])
l6b = clean_text(SEG[i6a + 1])
assert "1)" in l6a and "2)" in l6a, l6a
assert "3)" in l6b and "4)" in l6b, l6b
S6 = []
for n, (line, a, b) in [(1, (l6a, "1)", "2)")), (2, (l6a, "2)", None)), (3, (l6b, "3)", "4)")), (4, (l6b, "4)", None))]:
    if b:
        part = line[line.index(a):line.index(b)].strip()
    else:
        part = line[line.index(a):].strip()
    part = re.sub(r"^\d\)\s*", "", part)
    S6.append(part)
assert len(S6) == 4 and all(p.startswith("-------") for p in S6), S6
# قفل‌های ساقه
assert "some pens on the deask" in S6[0], S6[0]          # چاپ‌غلطِ deask — verbatim
assert "a computer in the library" in S6[1], S6[1]
assert "an eraser in here" in S6[2], S6[2]
assert "four students in the class" in S6[3], S6[3]
S6_KEYS = ["There are", "There is", "There is", "There are"]

# ————— س۷: MCQ سه‌تایی —————
i7 = find("گزینه صحیح را انتخاب کنید")
OPT = re.compile(r"(?:^|\s)([abcd])\)\s*")
S7: list[dict] = []
j = i7 + 1
while len(S7) < 3:
    line = clean_text(SEG[j])
    mo = re.match(r"^(\d)\.\s+(.*)$", line)
    if mo and "-------" in mo.group(2):
        stem = mo.group(2)
        optline = clean_text(SEG[j + 1])
        anchors = [(m.group(1).lower(), m.start(), m.end()) for m in OPT.finditer(" " + optline)]
        assert [a[0] for a in anchors] == ["a", "b", "c", "d"], (j, optline)
        opts = []
        for k, (letter, st, en) in enumerate(anchors):
            seg_end = anchors[k + 1][1] if k + 1 < len(anchors) else len(" " + optline)
            text = (" " + optline)[st + (en - st):seg_end].strip()
            assert text, f"S7 empty option q{mo.group(1)}"
            opts.append(text)
        S7.append({"n": int(mo.group(1)), "stem": stem, "options": opts})
        j += 2
    else:
        j += 1
assert [x["n"] for x in S7] == [1, 2, 3]
assert S7[0]["options"] == ["neat", "talkative", "kind", "pleasant"], S7[0]
assert S7[1]["options"] == ["lazy", "cruel", "serious", "kind"], S7[1]
assert S7[2]["options"] == ["a", "some", "an", "6"], S7[2]
S7_KEYS = [1, 3, 2]  # talkative / kind / an — استنتاجی (رسید)

# ————— س۹: ناهماهنگ (۷ سطر) —————
i9 = find("کلمه ناهماهنگ")
S9: list[dict] = []
for k in range(7):
    line = clean_text(SEG[i9 + 1 + k])   # سربرگِ «9)» سطرِ جدا دارد — دستور در i9، آیتم‌ها از i9+1
    mo = re.match(r"^(\d)\.\s+(.*?)\s*-------$", line)
    assert mo, f"S9 line {k}: {line!r}"
    stem = mo.group(2)
    # جداکنندهٔ اصلی «–» است؛ در س۹-۵ جداکنندهٔ سوم به‌صورت خطِ تیرهٔ چسبیده چاپ شده («library-»)
    words = [w.strip() for w in re.split(r"–|-\s", stem)]
    assert len(words) == 4, (k, words)
    S9.append({"n": int(mo.group(1)), "stem": stem, "options": words})
assert [x["n"] for x in S9] == list(range(1, 8))
assert S9[0]["options"] == ["serious", "help", "quiet", "neat"], S9[0]
assert S9[4]["options"] == ["office", "library", "company", "homework"], S9[4]
S9_KEYS = [1, 2, 1, 3, 3, 0, 2]  # help/angry/cruel/person/homework/nervous/careless — رسید

# ————— س۱۱: am/is/are (دوستونی: 1-2 / 3-4 / 5 تنها) —————
i11 = find("با شکل مناسب am – is – are")
l11a = clean_text(SEG[i11 + 2])
l11b = clean_text(SEG[i11 + 3])
l11c = clean_text(SEG[i11 + 4])
assert "1." in l11a and "2." in l11a and "3." in l11b and "4." in l11b, (l11a, l11b)
assert l11c.startswith("5."), l11c
S11 = []
for line, a, b in [(l11a, "1.", "2."), (l11a, "2.", None), (l11b, "3.", "4."), (l11b, "4.", None), (l11c, "5.", None)]:
    if b:
        part = line[line.index(a):line.index(b)].strip()
    else:
        part = line[line.index(a):].strip()
    part = re.sub(r"^\d\.\s*", "", part)
    S11.append(part)
assert len(S11) == 5 and all("-------" in p for p in S11), S11
# قفل‌های ساقه
assert S11[0].startswith("They") and "neat" in S11[0]
assert S11[1].startswith("My brother") and "helpful" in S11[1]
assert S11[2].startswith("I ") and "not cruel" in S11[2]
assert S11[3].startswith("We") and "clever" in S11[3]
assert S11[4].endswith("Zahra careless?")
S11_KEYS = ["are", "is", "am", "are", "Is"]

# ————— س۱۴: وصل‌شدنی — سؤال + گزینه در یک سطر (a با ق۱، … d با ق۴) و e تنها —————
i14 = find("مکالمه زیر را با توجه به عبارات سمت چپ")
S14_Q: list[str] = []
S14_OPT: dict[str, str] = {}
for k in range(4):
    line = clean_text(SEG[i14 + 1 + k])   # سربرگِ «14» سطرِ جدا دارد — دستور در i14، سؤال‌ها از i14+1
    mo = re.match(r"^(\d)\.\s+(.*?)\s+([abcd])\s*[–-]\s*(.*)$", line)
    assert mo, f"S14 line {k}: {line!r}"
    S14_Q.append(mo.group(2))
    S14_OPT[mo.group(3)] = mo.group(4).strip()
line_e = clean_text(SEG[i14 + 5])
mo_e = re.match(r"^e\s*[–-]\s*(.*)$", line_e)
assert mo_e, f"S14 e-line: {line_e!r}"
S14_OPT["e"] = mo_e.group(1).strip()
assert sorted(S14_OPT) == list("abcde"), S14_OPT
assert S14_Q[0].startswith("Are you angry?"), S14_Q
S14_OPTS = [S14_OPT[c] for c in "abcde"]
assert S14_OPTS == ["Yes, he is.", "She is a careful girl.", "I`m brave.", "No, she isn`t.", "No, we are not."], S14_OPTS
S14_KEYS = [4, 0, 2, 1]  # e/a/c/b — توافقِ ضمیر و نوعِ پرسش — رسید
print("parse OK: S2=4 S4=2 S6=4 S7=3 S9=7 S11=5 S14=4 — 29 items")
