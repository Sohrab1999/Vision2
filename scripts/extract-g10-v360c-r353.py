# -*- coding: utf-8 -*-
# r353 — استخراجِ بخشِ سومِ «۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم» (سؤال: ص۱۷۸-۱۹۴، کلیدِ جدولیِ ص۳۰۱)
# به public/jozve/tests-g10.json — بانکِ ۱۰۰ (lesson 100): سؤال‌های ۲۴۱ تا ۳۶۰ (ص۱۸۹-۱۹۴) — سومین و
# آخرینِ سه بانکِ ۱۲۰تایی (۱۲۰×۳=۳۶۰) — تکمیلِ خانواده. MCQ بدونِ ترجمهٔ چاپی («ترجمه» ×۰).
# درسِ r351: گریدِ KEY هرگز از حفظ ساخته نمی‌شود — این اسکریپت خودش ص۳۰۱ را با regex حرف-اول بازتولید
# می‌کند و با رکوردِ r351 (KEY_RAW در extract-g10-v360a-r351.py) مقایسهٔ AGREE می‌کند (۳۶۰/۳۶۰ — سومین
# استخراجِ مستقل از همان جدولِ چاپی).
# کوئیرک‌های داوری‌شدهٔ این راند (رندر ۱۲۰۰dpi):
#  * صفر سؤالِ چندران در ۲۴۱-۳۶۰ (برخلافِ پنج‌تاییِ r352 و یکیِ r351) — سنز: هر سؤال دقیقاً یک رانِ
#    ۱۶-۲۴ تیره؛ داوریِ رندرِ Q241/Q300/Q359/Q360: تک‌رانِ پیوسته.
#  * Q359/Q360: گزینه‌ها در لایهٔ متنی عمودی‌اند ولی در چاپِ ۱۲۰۰dpi هم‌ردیف‌اند — پارسر هر دو چیدمان را
#    می‌گیرد؛ داده فقط متنِ گزینه‌ها را نگه می‌دارد.
#  * پایانِ آزمون: جعبهٔ «Note:» خالیِ خط‌چینِ بنفش بعد از Q360 در پاصفحهٔ ص۱۹۴ (الگوی r334/r338).
#  * لوکاتور: برنامهٔ r351/r352 می‌گفت «ص۱۸۸-۱۹۴» ولی Q241 در ص۱۸۹ آغاز می‌شود (ص۱۸۸ به‌تمامیِ بخشِ ۲
#    تعلق دارد: Q219-240) — عنوانِ بانک از محدودهٔ دقیقِ «ص۱۸۹-۱۹۴» استفاده می‌کند (درسِ r351-لوکاتور).
#  * کلیدِ چاپیِ Q243 «collect» (b) — از منظرِ معنایی «carry» انتظار می‌رفت؛ کلیدِ چاپ حاکم است (قانون:
#    کلید هرگز تغییر نمی‌کند) — در رسید ثبت شد.
# فرمتِ گزینه‌ها در ۲۴۱-۳۶۰: همگی پرانتزدار «a)» (پیچشِ سوم در این محدوده نیست).
# Idempotent: اجرای دوم NO-OP (مبنا = ۹۹ بانکِ r323-r352 / ۱۵۸۶ آیتم).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g10.json")
PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"

BANK_NO = 100
GROUP = "۳۶۰ تست واژگان درس ۱ تا ۴"
Q_FROM, Q_TO = 241, 360

# —— گریدِ کلید: بازتولیدِ برنامه‌ای از ص۳۰۱ (حرف-اول؛ الگویِ کاملِ r352) + AGREE با رکوردِ r351
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
    for pno in range(177, 194):  # ص۱۷۸-۱۹۴ — کلِ ۳۶۰ سؤال (این راند فقط ۲۴۱-۳۶۰ مصرف می‌شود)
        txt += doc[pno].get_text("text") + "\n"
    txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)
    # لبهٔ «آخرین سؤالِ کلِ آزمون»: بعد از Q360 جعبهٔ «Note:» خالی + خطوطِ خط‌چینِ تزئینیِ پاصفحهٔ ص۱۹۴
    # است (رندر: پاصفحهٔ ص۱۹۴ — الگوی r334/r338)؛ بدونِ سؤالِ بعدی، lookahead تا انتهای متن می‌بلعد.
    # برشِ دنباله از لنگرِ Note — فقط بعد از موقعیتِ Q360 (هر Note دیگری پیش از آن دست‌نخورده می‌ماند).
    i360 = txt.find("\n360.")
    assert i360 >= 0, "Q360 anchor not found"
    m_note = re.search(r"\n\s*:\s*\n\s*Note\b", txt[i360:])
    assert m_note, "Note-box end anchor not found after Q360"
    txt = txt[: i360 + m_note.start()]
    return txt


def parse_questions(txt: str):
    # فرمتِ یکتای این محدوده: پرانتزدار — ولی [.)] برای استحکام (الگوی r351/r352)
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
    # ادغامِ ران‌های مجاورِ خط‌چین (۲+ رانِ جداشده با فضای سفید) → یک رانِ مجموع
    # (در این محدوده هیچ سؤالِ چندرانی نیست — تابع برای استحکام و idempotency حفظ شده)
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
    empty_opts = [n for n in range(Q_FROM, Q_TO + 1) if any(not o for o in qs[n]["opts"])]
    assert not empty_opts, f"empty options: {empty_opts}"

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
            "id": f"g10-l{BANK_NO}-{n}",
            "n": n,
            "category": "vocab",
            "question": question,
            "options": q["opts"],
            "answer": KEYMAP[n],
        })

    bank = {
        "lesson": BANK_NO,
        "title": "آموزشی/متوسط — ۳۶۰ تست واژگان درس ۱ تا ۴ — بخش ۳ از ۳ (ص۱۸۹-۱۹۴)",
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
    # سنزِ ران‌ها: این محدوده صفر سؤالِ چندران دارد — هر سؤال دقیقاً یک ران
    multi = [q["n"] for q in bank["questions"] if len(re.findall(r"-{6,}", q["question"])) > 1]
    assert not multi, f"unexpected multi-run: {multi}"
    runs_total = sum(len(re.findall(r"-{6,}", q["question"])) for q in bank["questions"])
    dashes_total = sum(sum(len(m) for m in re.findall(r"-{6,}", q["question"])) for q in bank["questions"])
    print(f"dash census: runs={runs_total} dashes={dashes_total}")
    lens = sorted({len(r) for q in bank["questions"] for r in re.findall(r"-{6,}", q["question"])})
    print(f"run-length span: {lens[0]}..{lens[-1]}")
    # هر سؤال یک جای‌خالی ۶+ تیره
    no_blank = [q["n"] for q in bank["questions"] if not re.search(r"-{6,}", q["question"])]
    assert not no_blank, f"no-blank questions: {no_blank}"
    # تکیه‌گاه‌های معنایی (رندر/منطق) — کلیدِ چاپ حاکم
    spot = {241: 2, 242: 3, 244: 3, 264: 0, 265: 2, 266: 2, 300: 3, 351: 2, 352: 3, 360: 3}
    for n, want in spot.items():
        assert Q[n]["answer"] == want, f"spot Q{n}: got {'abcd'[Q[n]['answer']]} want {'abcd'[want]}"
    # قفلِ گزینه‌های رندرِ داوری‌شده
    assert Q[300]["options"] == ["proper", "wonderful", "probable", "foreign"], Q[300]["options"]
    assert Q[360]["options"] == ["price", "agents", "hosts", "sites"], Q[360]["options"]
    assert Q[241]["options"] == ["suggestion", "entertainment", "continent", "country"], Q[241]["options"]
    assert Q[359]["options"] == ["prepared", "located", "attracted", "planned"], Q[359]["options"]
    # کلیدِ چاپیِ Q243 = collect (b) — ثبت برای رسید (کلید حاکم، هرگز تغییر نمی‌کند)
    assert Q[243]["answer"] == 1, f"Q243 key: {'abcd'[Q[243]['answer']]}"
    # آپستروف‌های مستقیمِ لایه (ثبتِ شکلِ لایه برای رسید)
    straight = [q["n"] for q in bank["questions"] if "'" in q["question"] + "".join(q["options"])]
    print("questions containing straight apostrophe:", straight)

    data["lessons"].append(bank)
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    total = sum(b["count"] for b in data["lessons"])
    print(f"bank {BANK_NO} appended: {bank['count']} MCQs | tests-g10 = {total} in {len(data['lessons'])} banks")


if __name__ == "__main__":
    main()
