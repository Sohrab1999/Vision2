# -*- coding: utf-8 -*-
# r350 — استخراجِ «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ - پایه دهم» (ص۱۷۲-۱۷۶، کلیدِ چاپیِ ص۳۰۰)
# به public/jozve/tests-g10.json — بانکِ ۹۷ (lesson 97): ۱۰۰ MCQ بدونِ ترجمهٔ چاپی (خانوادهٔ
# «Grammar Tests — Vision One — Lesson 1-4»؛ صفحاتِ سؤال فاقدِ ستونِ «ترجمه تست» — بررسی شد: صفر مورد).
# سربرگِ آزمون ص۱۷۲: «۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ - پایه دهم» + «(پاسخنامه کلیدی صفحه ۳۰۰)» +
# «سطح تستها "متوسط" و "کنکوری"» — داوریِ رندرِ ۹۰۰dpi: «متوسط» سبزِ نقل‌قولی و «کنکوری» سرخِ نقل‌قولی —
# برخلافِ جلدِ ص۱۷۱ خانواده («سطح تستها: متوسط و استاندارد») — خودِ آزمون «متوسط و کنکوری» است (رندر حاکم).
# سربرگِ کلیدِ ص۳۰۰: «پاسخنامه تستهای گرامر"درس یک تا چهار - پایه دهم» + «(سؤاالت صفحه ۱۷۲ تا ۱۷۶)» —
# «سؤاالت» = پانزدهمین تجزیهٔ لیگاتورِ مستندشده (r349؛ چاپ تمیز)؛ کلید = جدولِ ۱۰×۱۰ با ارقامِ لاتین
# و حروفِ سرخ (رندرِ ۹۰۰dpi: سطرها ۱-۹ / ستون‌ها ده‌تایی نزولی) — گریدِ کاملِ ۱۰۰تایی با regex چندالگویی
# یکجا بیرون آمد: ۱۰۰/۱۰۰ بدونِ تکرار و بدونِ نقص (scripts/key-grid-g10-l14-r350.py).
# جای‌خالی‌ها: تیره‌چینِ سبز در چاپ؛ لایه ران‌های ممتد ۷-۲۳تایی می‌دهد — بدونِ هیچ بریدگیِ بین‌خطی
# (سرشماری: ۱۵۰ رانِ ≥۳) — عینِ لایه حفظ شد. حروفِ گزینه‌ها کادرِ آبیِ روشن؛ شمارهٔ سؤال‌ها سرخ.
# نویزهای لایه که رندر حکم کرد: Q14 خطِ نویزِ «a       » پیش از «a) on» (حذف — گزینه‌ها on/in/with/to)؛
# Q93 حرفِ گزینهٔ «a(» با پرانتزِ بازِ چاپ (گزینه: were leaving)؛ Q96 حروفِ سربارِ «B»/«D» در انتهای
# گزینه‌های a/c نویزِ لایه‌اند — رندرِ ۱۲۰۰dpi گزینه‌های تمیز نشان داد («WRONG» در چاپ زیرخط‌دار است).
# چاپ‌غلط‌ها/کوئیرک‌های عینِ چاپ (رندر ۱۲۰۰dpi همگی تأیید): Q28 «by his own's» (باید on his own)؛
# Q34 «Do you like Swimming?» Sِ بزرگ؛ Q42 ساقه با نقطه پایان می‌یابد («... in the world.»)؛
# Q44 «My Father a good manager.» (فعلِ اسنادی نیامده + Fِ بزرگ)؛ Q49 «tomorrow. but» بِ کوچک؛
# Q64 «Marry» (املای چاپِ Mary) + «NO,» بزرگ؛ Q97 «since 1363» رقمِ لاتینِ سالِ شمسی؛
# Q88 گزینه‌ها عینِ چاپ (old wooden / lovely small old = کلیدِ b — ترتیبِ صفت درست)؛
# Q99 «Mark has three -----------, ----------- boy and two girls. ---------- boy is 7 years old».
# کلیدِ حاکم (r344): گریدِ چاپیِ جدولیِ ص۳۰۰ بدونِ هیچ واگرایی با پیش‌پرکردنِ معنایی (۱۰۰/۱۰۰ هم‌رأی
# پس از بازبینیِ چشمیِ نمونه‌ها: Q1 may be / Q15 need / Q81 at London (جملهٔ غلطِ b) / Q88 b /
# Q91 shouldn't-near / Q93 left / Q96 c).
# Idempotent: اجرای دوم NO-OP (مبنا = ۹۶ بانکِ r323-r349 / ۱۲۴۶ آیتم).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g10.json")
PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"

BANK_NO = 97
GROUP = "تستهای متوسط و استاندارد درس ۱ تا ۴"

# گریدِ کلیدِ چاپیِ جدولیِ ص۳۰۰ (۱۰۰/۱۰۰ — خروجیِ key-grid-g10-l14-r350.py)
KEY = (
    "1b 2c 3b 4a 5d 6a 7b 8c 9a 10b 11d 12b 13c 14a 15b 16d 17c 18c 19d 20b "
    "21b 22d 23c 24b 25a 26c 27c 28a 29b 30b 31c 32d 33d 34d 35c 36c 37b 38d 39a 40c "
    "41b 42b 43c 44c 45a 46b 47b 48c 49b 50b 51a 52a 53b 54b 55c 56b 57a 58c 59a 60b "
    "61d 62b 63c 64b 65c 66d 67d 68b 69d 70d 71b 72b 73d 74c 75a 76d 77a 78c 79d 80d "
    "81b 82b 83a 84c 85b 86a 87b 88b 89b 90b 91c 92a 93c 94d 95a 96c 97b 98a 99b 100b"
)
KEYMAP = {int(m.group(1)): "abcd".index(m.group(2)) for m in re.finditer(r"(\d{1,3})([a-d])", KEY)}
assert len(KEYMAP) == 100 and set(KEYMAP) == set(range(1, 101))


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def load_layer() -> str:
    doc = fitz.open(PDF)
    txt = ""
    for pno in range(171, 176):
        txt += doc[pno].get_text("text") + "\n"
    txt = re.sub(r'\d{3}\s*\n\s*\n?\s*"جزوه[\s\S]*?همـــکاران"\s*\n', "\n", txt)
    # نویزهای لایهٔ حکم‌شده با رندر:
    txt = txt.replace("\na       a) on", "\na) on")        # Q14 — خطِ نویزِ «a»
    txt = txt.replace("a( were leaving", "a) were leaving")  # Q93 — «a(» چاپ
    # Q96 — حروفِ سربارِ «B»/«D» در انتهایِ گزینه‌های a/c نویزِ لایه‌اند (رندرِ ۱۲۰۰dpi: چاپِ تمیز)
    txt = re.sub(r"on the wall\. B(?=\s)", "on the wall.", txt)
    txt = re.sub(r"on school\. D(?=\s)", "on school.", txt)
    return txt


def parse_questions(txt: str):
    pat = re.compile(
        r'(\d{1,3})\.\s*([\s\S]*?)\n\s*a\)\s*([\s\S]*?)\n?\s*b\)\s*([\s\S]*?)\n?\s*c\)\s*([\s\S]*?)\n?\s*d\)\s*([\s\S]*?)(?=\n\s*\d{1,3}\.\s|\Z)',
    )
    qs = {}
    for m in pat.finditer(txt):
        num = int(m.group(1))
        stem, a, b, c, d = (norm(g) for g in m.groups()[1:])
        qs[num] = {"stem": stem, "opts": [a, b, c, d]}
    return qs


def build_bank(qs) -> dict:
    questions = []
    for n in range(1, 101):
        q = qs[n]
        questions.append({
            "id": f"g10-l97-{n}",
            "n": n,
            "category": "grammar",
            "question": q["stem"],
            "options": q["opts"],
            "answer": KEYMAP[n],
        })
    return {
        "lesson": BANK_NO,
        "title": "متوسط/کنکوری — ۱۰۰ تست گرامر و نگارش درس ۱ تا ۴ (ص۱۷۲-۱۷۶)",
        "level": "متوسط/کنکوری — چهارگزینه‌ای",
        "count": 100,
        "questions": questions,
    }


def verify(bank: dict) -> None:
    Q = {q["n"]: q for q in bank["questions"]}
    assert len(Q) == 100, "100 questions"

    # خلوصِ لاتین — این آزمون هیچ متنِ فارسی ندارد
    for q in bank["questions"]:
        body = q["question"] + " ".join(q["options"])
        assert not re.search(r"[آ-ی]", body), f"Persian leaked in Q{q['n']}"

    # قفلِ گریدِ کلید
    for q in bank["questions"]:
        assert 0 <= q["answer"] <= 3

    # کوئیرک‌های عینِ چاپ (رندر-آرشیو‌شده)
    assert "by his own’s" in Q[28]["question"]
    assert "Do you like Swimming?" in Q[34]["question"]
    assert Q[42]["question"].endswith("in the world.")
    assert Q[44]["question"].startswith("My Father a good manager.")
    assert "tomorrow. but I’m not quite sure" in Q[49]["question"]
    assert "Marry" in Q[64]["question"] and "NO, I forgot" in Q[64]["question"]
    assert Q[88]["options"][1] == "old wooden / lovely small old"
    assert Q[96]["question"].startswith("Which sentence is grammatically WRONG?")
    assert Q[96]["options"][0] == "Look at the picture on the wall."   # بدونِ «B» سربار
    assert Q[96]["options"][2] == "Most students have lunch on school."  # بدونِ «D» سربار
    assert "since 1363" in Q[97]["question"]
    assert Q[14]["options"] == ["on", "in", "with", "to"]
    assert Q[93]["options"][0] == "were leaving" and Q[93]["options"][2] == "left"

    # سنزِ تیره‌ها — ۱۳۹ رانِ ≥۳ در ساقه‌ها (بدونِ بریدگی)
    runs = re.findall(r"-{3,}", " ".join(q["question"] for q in bank["questions"]))
    assert len(runs) == 150, f"dash runs = {len(runs)}"

    # هم‌رأییِ چشمیِ نمونه‌ها با گرید (پیش‌پرکردنِ معنایی)
    spot = {1: 1, 15: 1, 81: 1, 88: 1, 91: 2, 93: 2, 96: 2}
    for n, want in spot.items():
        assert Q[n]["answer"] == want, f"spot Q{n}: {Q[n]['answer']} != {want}"


def main() -> None:
    data = json.loads(PATH.read_text())
    assert data["grade"] == 10
    existing = [b for b in data["lessons"] if b["lesson"] == BANK_NO]
    qs = parse_questions(load_layer())
    missing = [n for n in range(1, 101) if n not in qs]
    assert not missing, f"missing: {missing}"
    assert len(qs) == 100, f"parsed {len(qs)}"

    if existing:
        bank = existing[0]
        assert bank["count"] == 100 and len(bank["questions"]) == 100
        verify(bank)
        print("translations changed: 0 — NO-OP")
        return

    bank = build_bank(qs)
    verify(bank)
    data["lessons"].append(bank)
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    total = sum(b["count"] for b in data["lessons"])
    print(f"bank {BANK_NO} appended: 100 MCQs | tests-g10 = {total} in {len(data['lessons'])} banks")


if __name__ == "__main__":
    main()
