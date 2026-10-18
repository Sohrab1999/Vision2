# -*- coding: utf-8 -*-
# r352 — استخراجِ بخشِ دومِ «۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم» (سؤال: ص۱۷۸-۱۹۴، کلیدِ جدولیِ ص۳۰۱)
# به public/jozve/tests-g10.json — بانکِ ۹۹ (lesson 99): سؤال‌های ۱۲۱ تا ۲۴۰ (ص۱۸۳-۱۸۸) — دومینِ سه
# بانکِ ۱۲۰تایی (۱۲۰×۳=۳۶۰). MCQ بدونِ ترجمهٔ چاپی («ترجمه» ×۰ — قرینهٔ r351/r334/r350).
# درسِ r351: گریدِ KEY هرگز از حفظ ساخته نمی‌شود — این اسکریپت خودش ص۳۰۱ را با regex حرف-اول بازتولید
# می‌کند و با رکوردِ r351 (KEY_RAW در extract-g10-v360a-r351.py) مقایسهٔ AGREE می‌کند (۳۶۰/۳۶۰).
# کوئیرک‌های داوری‌شدهٔ این راند (رندر ۱۲۰۰dpi):
#  * Q174: گزینهٔ چهارم در خودِ چاپ «b) suitably» است (حرفِ b تکرار — باید d می‌بود) + تکرارِ محتوای
#    «suitably» (a هم suitably). جراحیِ پیش‌پارس: فقط حرفِ گزینهٔ چهارم موقتاً d می‌شود (داده فقط متن
#    نگه می‌دارد؛ عینِ چاپ در رسیدِ printQuirks ثبت است). بدونِ این جراحی، پارسر c/d را تا «d) protects»
#    می‌بلعید و Q175 گم می‌شد (کشفِ پروب).
#  * پنج سؤالِ دورانِ چندگانه = یک خطِ پیوسته در رندر → ادغام (قانونِ r349-Q2/r351-Q24):
#    Q143: ۱۰+۱۱=۲۱ (نقطه‌چسبیده) | Q146: ۱۲+۴=۱۶ | Q152: ۹+۱۰=۱۹ | Q158: ۱۰+۱۱=۲۱ (نقطه‌چسبیده) |
#    Q213: ۱۰+۸=۱۸
#  * چاپ‌غلط‌های عینِ چاپ (stem): Q152 «different idea» (باید ideas) | Q213 «It's not health» (باید
#    healthy) | Q221 «to became» (باید become) — در داده حفظ و در رسید ثبت می‌شوند.
# فرمتِ گزینه‌ها در ۱۲۱-۲۴۰: همگی پرانتزدار «a)» (پیچشِ Q39→Q40 از r351 در همین فرمت می‌ماند).
# Idempotent: اجرای دوم NO-OP (مبنا = ۹۸ بانکِ r323-r351 / ۱۴۶۶ آیتم).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g10.json")
PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"

BANK_NO = 99
GROUP = "۳۶۰ تست واژگان درس ۱ تا ۴"
Q_FROM, Q_TO = 121, 240

# —— گریدِ کلید: بازتولیدِ برنامه‌ای از ص۳۰۱ (حرف-اول؛ الگوی کاملِ ۳۶۰تایی) + AGREE با رکوردِ r351
def build_keymap() -> dict:
    doc = fitz.open(PDF)
    t301 = doc[300].get_text("text")
    pairs = re.findall(r'\b([a-d])\s*\n?\s*(\d{1,3})\b', t301)
    km = {int(n): "abcd".index(l) for l, n in pairs}
    assert len(km) == 360 and set(km) == set(range(1, 361)), f"fresh keymap broken: {len(km)}"
    # مقایسهٔ AGREE با رکوردِ r351 (خوانده از اسکریپتِ راندِ قبل — هرگز از حفظ)
    r351_src = Path("scripts/extract-g10-v360a-r351.py").read_text(encoding="utf-8")
    m = re.search(r"KEY_RAW = \(([\s\S]*?)\)", r351_src)
    assert m, "r351 KEY_RAW not found"
    r351map = {int(n): "abcd".index(l) for n, l in re.findall(r"(\d{1,3})([a-d])", m.group(1))}
    assert len(r351map) == 360
    diff = [n for n in range(1, 361) if km[n] != r351map[n]]
    assert not diff, f"key divergence vs r351 record: {diff[:10]}"
    print("key grid: fresh p301 letter-first 360/360 — AGREE with r351 record: 360/360, zero divergence")
    return km

KEYMAP = build_keymap()


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def load_layer() -> str:
    doc = fitz.open(PDF)
    txt = ""
    for pno in range(177, 194):  # ص۱۷۸-۱۹۴ — کلِ ۳۶۰ سؤال (این راند فقط ۱۲۱-۲۴۰ مصرف می‌شود)
        txt += doc[pno].get_text("text") + "\n"
    txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)
    # جراحیِ پیش‌پارسِ Q174 (فقط حرفِ گزینهٔ چهارم؛ لنگرِ یکتا: «honestly» سپس «b) suitably»)
    m = re.search(r"(174\.[\s\S]*?honestly\s{2,})b\)(\s?suitably)", txt)
    assert m, "Q174 4th-option anchor not found"
    txt = txt[: m.start(1)] + m.group(1) + "d)" + m.group(2) + txt[m.end(2):]
    return txt


def parse_questions(txt: str):
    # فرمتِ یکتای این محدوده: پرانتزدار — ولی [.)] برای استحکام (الگوی r351)
    pat = re.compile(
        r'(\d{1,3})\.\s*([\s\S]*?)\n\s*a[.)]\s*([\s\S]*?)\n?\s*b[.)]\s*([\s\S]*?)\n?\s*c[.)]\s*([\s\S]*?)\n?\s*d[.)]\s*([\s\S]*?)(?=\n\s*\d{1,3}\.\s|\Z)',
    )
    qs = {}
    for m in pat.finditer(txt):
        num = int(m.group(1))
        if num not in qs:
            qs[num] = {"stem": norm(m.group(2)), "opts": [norm(g) for g in m.groups()[2:]]}
    return qs


def merge_runs(question: str) -> str:
    # ادغامِ ران‌های مجاورِ خط‌چین (۲+ رانِ جداشده با فضای سفید) → یک رانِ مجموع (رندر حاکم: یک خطِ پیوسته)
    return re.sub(
        r"-{2,}(?:\s*-{2,})+",
        lambda m: "-" * sum(len(r) for r in re.findall(r"-{2,}", m.group(0))),
        question,
    )


def main() -> None:
    data = json.loads(PATH.read_text())
    assert data["grade"] == 10
    existing = [b for b in data["lessons"] if b["lesson"] == BANK_NO]
    qs = parse_questions(load_layer())
    missing = [n for n in range(Q_FROM, Q_TO + 1) if n not in qs]
    assert not missing, f"missing: {missing}"

    if existing:
        bank = existing[0]
        assert bank["count"] == Q_TO - Q_FROM + 1
        assert len(bank["questions"]) == bank["count"]
        print("translations changed: 0 — NO-OP")
        return

    questions = []
    for n in range(Q_FROM, Q_TO + 1):
        q = qs[n]
        question = merge_runs(q["stem"])
        questions.append({
            "id": f"g10-l99-{n}",
            "n": n,
            "category": "vocab",
            "question": question,
            "options": q["opts"],
            "answer": KEYMAP[n],
        })

    bank = {
        "lesson": BANK_NO,
        "title": "آموزشی/متوسط — ۳۶۰ تست واژگان درس ۱ تا ۴ — بخش ۲ از ۳ (ص۱۸۳-۱۸۸)",
        "level": "آموزشی/متوسط — چهارگزینه‌ای",
        "count": len(questions),
        "questions": questions,
    }

    # —— راستی‌آزمایی‌های درونی
    Q = {q["n"]: q for q in bank["questions"]}
    assert len(Q) == 120
    # خلوصِ لاتین
    for q in bank["questions"]:
        body = q["question"] + " ".join(q["options"])
        assert not re.search(r"[آ-ی]", body), f"Persian leaked in Q{q['n']}"
    # ادغام‌ها: هر سؤال دقیقاً یک ران (بعدِ ادغام) — پنج سؤالِ داوری‌شده با طولِ دقیق
    merged_expect = {143: 21, 146: 16, 152: 19, 158: 21, 213: 18}
    for n, ln in merged_expect.items():
        runs = re.findall(r"-{6,}", Q[n]["question"])
        assert len(runs) == 1 and len(runs[0]) == ln, f"Q{n} merge: {runs}"
    multi = [q["n"] for q in bank["questions"] if len(re.findall(r"-{6,}", q["question"])) > 1]
    assert not multi, f"unmerged multi-run: {multi}"
    # چاپ‌غلط‌های عینِ چاپ (stem)
    assert "different idea," in Q[152]["question"], Q[152]["question"]
    assert "It’s not health to eat" in Q[213]["question"], Q[213]["question"]
    assert "important to became" in Q[221]["question"], Q[221]["question"]
    # Q174 — گزینهٔ چهارم تکراریِ verbatim (رندر: حرفِ چاپیِ «b)»)
    assert Q[174]["options"] == ["suitably", "probably", "honestly", "suitably"], Q[174]["options"]
    # تکیه‌گاه‌های معنایی (رندر/منطق)
    spot = {121: 0, 133: 1, 143: 1, 146: 0, 152: 1, 158: 1, 174: 2, 175: 0, 213: 3, 220: 2, 221: 0, 222: 1}
    for n, want in spot.items():
        assert Q[n]["answer"] == want, f"spot Q{n}: got {'abcd'[Q[n]['answer']]} want {'abcd'[want]}"
    # هر سؤال یک جای‌خالی ۶+ تیره
    no_blank = [q["n"] for q in bank["questions"] if not re.search(r"-{6,}", q["question"])]
    assert not no_blank, f"no-blank questions: {no_blank}"
    # آمارِ تیره‌ها برای گارد
    runs_total = sum(len(re.findall(r"-{6,}", q["question"])) for q in bank["questions"])
    dashes_total = sum(sum(len(m) for m in re.findall(r"-{6,}", q["question"])) for q in bank["questions"])
    print(f"dash census: runs={runs_total} dashes={dashes_total}")
    # آپستروف‌های مستقیمِ لایه (ثبتِ شکلِ لایه)
    straight = [q["n"] for q in bank["questions"] if "'" in q["question"] + "".join(q["options"])]
    print("questions containing straight apostrophe:", straight)

    data["lessons"].append(bank)
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    total = sum(b["count"] for b in data["lessons"])
    print(f"bank {BANK_NO} appended: {bank['count']} MCQs | tests-g10 = {total} in {len(data['lessons'])} banks")


if __name__ == "__main__":
    main()
