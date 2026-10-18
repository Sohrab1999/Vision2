# -*- coding: utf-8 -*-
# r354 — استخراجِ «آزمون تشریحی گرامر درس اول - پایه یازدهم» (ص۲۹-۳۱، کلیدِ ص۱۷۹) → tests-g11.json بانک‌های ۳۷-۴۲
# شش سکشنِ خودِ آزمون: (۱) جاهای خالی much/many — ۱۰ تایپی؛ (۲) a little/a few — ۱۰ تایپی؛
# (۳) بهترین گزینه — ۲۰ MCQ؛ (۴) خط زیر گزینهٔ صحیح (پرانتزی) — ۸ تایپی؛
# (۵) انتخاب واژهٔ صحیح (واحدهای شمارش) — ۱۰ تایپی؛ (۶) جمله‌سازی — ۱۰ تایپی. جمع: ۶۸ آیتم.
# کلیدِ ص۱۷۹ هر شش سکشن را در یک صفحه دارد («آزمون تشریحی گرامر درس اول (آزمون صفحه ۲۹ تا ۳۱)»).
# درس‌های برازیده: r351 (کلید هرگز از حفظ — بازتولیدِ برنامه‌ای)، r311 (کلیدِ واژه‌محور → نگاشتِ یکتا به حرف)،
# r350 (idempotency + قفل‌های سخت)، g10-l14/l15/l26 (قراردادِ بانک‌های تایپی: accepted + options[answer] + placeholder).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g11.json")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

doc = fitz.open(PDF)


def page_clean(pno: int) -> str:
    """متنِ صفحه با حذفِ سربرگِ تکراری (از شروع تا خطِ «هم…کاران» — تعدادِ کشیده در صفحات متفاوت است)."""
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    raise AssertionError(f"p{pno+1}: header anchor not found")


exam = "\n".join(page_clean(p) for p in (28, 29, 30))  # ص۲۹-۳۱
key_raw = page_clean(178)  # ص۱۷۹

# ---------- کلید: ۶۸ مدخلِ شماره‌دار به‌ترتیب (۱۰/۱۰/۲۰/۸/۱۰/۱۰ با شماره‌گذاریِ بازشونده) ----------
# نویزِ شناخته‌شده: سربرگِ به‌هم‌ریختهٔ سکشن ۲ در لایه («۲. از …») یک مدخلِ مزاحمِ «N. از» می‌سازد — پالایش می‌شود.
key_entries = [
    (int(m.group(1)), m.group(2).strip())
    for m in re.finditer(r"(?m)^(\d{1,2})\.\s+(.+)$", key_raw)
    if m.group(2).strip() != "از"
]
assert len(key_entries) == 68, f"key entries={len(key_entries)} (expected 68)"
SIZES = [10, 10, 20, 8, 10, 10]
keys_by_sec, pos = [], 0
for sz in SIZES:
    grp = key_entries[pos : pos + sz]
    assert [n for n, _ in grp] == list(range(1, sz + 1)), f"key numbering broken at offset {pos}: {[n for n,_ in grp]}"
    keys_by_sec.append([t for _, t in grp])
    pos += sz
K1, K2, K3, K4, K5, K6 = keys_by_sec
assert set(K1) <= {"much", "many"}, K1
assert set(K2) <= {"a little", "a few"}, K2

# ---------- برشِ سکشن‌ها با لنگرِ اولین سؤال هر سکشن (جداکننده‌های dash در لایه بین ۴ و ۵ نیست — درسِ این راند) ----------
ANCHORS = [
    ("He doesn’t read very much.", "s1"),
    ("I can’t talk to you now.", "s2"),
    ("She can drink a lot of water", "s3"),
    ("I am sorry, my (knowledge is", "s4"),
    ("My brother drank a (kilo / bag / glass)", "s5"),
    ("do / much / need / information / how / they?", "s6"),
]
pos_first = exam.find(ANCHORS[0][0])
assert pos_first >= 0, "sec1 anchor missing"
starts = []
for anchor, tag in ANCHORS:
    i = exam.find(anchor)
    assert i >= 0, f"anchor missing: {tag}"
    line_start = exam.rfind("\n", 0, i) + 1  # از آغازِ خط تا پیشوندِ «N. » حفظ شود
    starts.append(line_start)
sec_slices = {}
for k, (anchor, tag) in enumerate(ANCHORS):
    end = starts[k + 1] if k + 1 < len(starts) else len(exam)
    sec_slices[tag] = exam[starts[k]:end]

s1_raw, s2_raw, s3_raw = sec_slices["s1"], sec_slices["s2"], sec_slices["s3"]
s4_raw, s5_raw, s6_raw = sec_slices["s4"], sec_slices["s5"], sec_slices["s6"]

ANS_LINE = re.compile(r"(?m)^\s*\d{1,2}\.\s+[-–\s.?]+$")  # خطوطِ پاسخِ نقطه‌چینِ سکشن۶
PERSIAN = re.compile(r"[\u0600-\u06FF]")  # سربرگ‌های سکشن‌ها فارسی‌اند — ساقه‌ها/گزینه‌ها انگلیسی


def numbered_items(text: str) -> list[str]:
    """جفت‌های «N. متن» — خطوطِ نقطه‌چینِ پاسخ، سربرگ‌های فارسی و گزینه‌های a-d را نمی‌گیرد."""
    out = []
    for m in re.finditer(r"(?m)^(\d{1,2})\.\s+(.+)$", text):
        body = m.group(2).strip()
        if ANS_LINE.match(m.group(0).strip()):
            continue
        if PERSIAN.search(body):
            continue
        out.append((int(m.group(1)), body))
    return out


def assert_numbering(items, n, tag):
    assert [i for i, _ in items] == list(range(1, n + 1)), f"{tag}: {[i for i,_ in items]}"
    assert len(items) == n, f"{tag}: {len(items)} != {n}"


# سکشن ۱ و ۲ — تایپیِ جای خالی
s1_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(s1_raw)]
s2_items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(s2_raw)]
assert_numbering(s1_items, 10, "sec1")
assert_numbering(s2_items, 10, "sec2")
assert s1_items[0][1].startswith("He doesn’t read very much."), s1_items[0]
assert s2_items[0][1].startswith("I can’t talk to you now."), s2_items[0]

# سکشن ۳ — MCQ: ساقه + چهار گزینه‌ی «x. متن»
def parse_mcq(text: str):
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    items, cur = [], None
    for ln in lines:
        mq = re.match(r"^(\d{1,2})\.\s+(.+)$", ln)
        mo = re.match(r"^([a-d])\.\s+(.+)$", ln)
        if mq and not mo:
            if PERSIAN.search(mq.group(2)):
                continue  # سربرگِ سکشنِ بعدی («4. زیر گزینه…») — سؤال نیست
            if cur:
                items.append(cur)
            cur = {"n": int(mq.group(1)), "stem": re.sub(r"\s+", " ", mq.group(2)).strip(), "opts": {}}
        elif mo and cur is not None:
            cur["opts"][mo.group(1)] = re.sub(r"\s+", " ", mo.group(2)).strip()
    if cur:
        items.append(cur)
    return items

s3_items = parse_mcq(s3_raw)
assert_numbering([(i["n"], "") for i in s3_items], 20, "sec3")
for it in s3_items:
    assert set(it["opts"]) == {"a", "b", "c", "d"}, f"sec3 Q{it['n']}: opts={list(it['opts'])}"

# سکشن ۴ و ۵ — تایپیِ پرانتزی (جفت/سه‌تایی داخل پرانتز)
PAREN = re.compile(r"\(([^()]+)\)")
def parse_paren(text: str, n_expected: int, tag: str):
    items = []
    for n, body in numbered_items(text):
        body = re.sub(r"\s+", " ", body).strip()
        m = PAREN.search(body)
        assert m, f"{tag} Q{n}: no parens in {body[:60]!r}"
        cands = [c.strip() for c in m.group(1).split("/")]
        items.append({"n": n, "stem": body, "cands": cands})
    assert_numbering([(i["n"], "") for i in items], n_expected, tag)
    return items

s4_items = parse_paren(s4_raw, 8, "sec4")
s5_items = parse_paren(s5_raw, 10, "sec5")

# سکشن ۶ — جمله‌سازی: فهرستِ واژه‌ها (بدونِ پرانتز، با «؟» یا «.» چاپی)
s6_items = []
for n, body in numbered_items(s6_raw):
    body = re.sub(r"\s+", " ", body).strip()
    assert "/" in body and "(" not in body, f"sec6 Q{n}: unexpected shape {body[:60]!r}"
    s6_items.append({"n": n, "stem": body})
assert_numbering([(i["n"], "") for i in s6_items], 10, "sec6")

# ---------- اعتبارسنجیِ کلید بر متن ----------
# سکشن ۵: کلید باید یکی از سه نامزدِ همان سؤال باشد
for it, k in zip(s5_items, K5):
    assert k in it["cands"], f"sec5 Q{it['n']}: key {k!r} ∉ {it['cands']}"
# سکشن ۴: کلید = یکی از دو نامزد
for it, k in zip(s4_items, K4):
    assert k in it["cands"], f"sec4 Q{it['n']}: key {k!r} ∉ {it['cands']}"
# سکشن ۳: نگاشتِ یکتای متنِ کلید → حرفِ گزینه (تطبیقِ دقیق؛ نرمال‌سازیِ فقطِ فاصله)
def opt_index(it, key_text: str) -> int:
    key_n = re.sub(r"\s+", " ", key_text).strip()
    hits = [L for L, txt in it["opts"].items() if txt == key_n]
    assert len(hits) == 1, f"sec3 Q{it['n']}: key {key_n!r} matched {hits} (opts={it['opts']})"
    return "abcd".index(hits[0])

A3 = [opt_index(it, k) for it, k in zip(s3_items, K3)]

# ---------- ساختِ بانک‌ها ----------
def typed_q(bank: int, n: int, question: str, cands: list[str], answer_text: str, placeholder: str, opts_override=None):
    opts = opts_override if opts_override is not None else list(cands)
    ai = opts.index(answer_text)
    return {
        "id": f"g11-l{bank}-{n}",
        "n": n,
        "category": "grammar",
        "kind": "typed",
        "question": question,
        "options": opts,
        "answer": ai,
        "accepted": [answer_text],
        "placeholder": placeholder,
    }

banks = []

# بانک ۳۷ — سکشن ۱
q37 = [typed_q(37, n, f"{stem} [fill: much / many]", ["much", "many"], k,
               "fill in the blank with much or many…")
       for (n, stem), k in zip(s1_items, K1)]
banks.append({"lesson": 37, "title": "تشریحی گرامر — جاهای خالی با much یا many (ص۲۹)", "level": "تشریحی — تایپی", "count": 10, "questions": q37})

# بانک ۳۸ — سکشن ۲
q38 = [typed_q(38, n, f"{stem} [fill: a little / a few]", ["a little", "a few"], k,
               "fill in the blank with a little or a few…")
       for (n, stem), k in zip(s2_items, K2)]
banks.append({"lesson": 38, "title": "تشریحی گرامر — جاهای خالی با a little یا a few (ص۲۹)", "level": "تشریحی — تایپی", "count": 10, "questions": q38})

# بانک ۳۹ — سکشن ۳ (MCQ)
q39 = []
for it, ai in zip(s3_items, A3):
    q39.append({
        "id": f"g11-l39-{it['n']}",
        "n": it["n"],
        "category": "grammar",
        "question": it["stem"],
        "options": [it["opts"][L] for L in "abcd"],
        "answer": ai,
    })
banks.append({"lesson": 39, "title": "تشریحی گرامر — تست چهارگزینه‌ای (ص۲۹-۳۰)", "level": "تشریحی — چهارگزینه‌ای", "count": 20, "questions": q39})

# بانک ۴۰ — سکشن ۴
q40 = [typed_q(40, it["n"], it["stem"], it["cands"], k, "type the correct option in parentheses…")
       for it, k in zip(s4_items, K4)]
banks.append({"lesson": 40, "title": "تشریحی گرامر — گزینهٔ صحیح داخل پرانتز (ص۳۰)", "level": "تشریحی — تایپی", "count": 8, "questions": q40})

# بانک ۴۱ — سکشن ۵
q41 = [typed_q(41, it["n"], it["stem"], it["cands"], k, "choose the correct option in parentheses…")
       for it, k in zip(s5_items, K5)]
banks.append({"lesson": 41, "title": "تشریحی گرامر — انتخاب واژهٔ صحیح (واحدهای شمارش) (ص۳۱)", "level": "تشریحی — تایپی", "count": 10, "questions": q41})

# بانک ۴۲ — سکشن ۶ (جمله‌سازی: گزینه‌ها = پاسخِ خودِ سؤال + سه پاسخِ دیگرِ همین سکشن — الگوی g10-l14/l15)
q42 = []
for idx, it in enumerate(s6_items):
    ans = K6[idx]
    others = [K6[j] for j in range(len(s6_items)) if j != idx]
    distractors = [others[(idx * 3 + d) % len(others)] for d in range(3)]
    opts = [ans] + distractors
    q42.append({
        "id": f"g11-l42-{it['n']}",
        "n": it["n"],
        "category": "grammar",
        "kind": "typed",
        "question": it["stem"],
        "options": opts,
        "answer": 0,
        "accepted": [ans],
        "placeholder": "make a sentence with the given words…",
    })
banks.append({"lesson": 42, "title": "تشریحی گرامر — جمله‌سازی با کلمات داده شده (ص۳۱)", "level": "تشریحی — جمله‌سازی", "count": 10, "questions": q42})

# ---------- نوشتن (idempotent) ----------
data = json.loads(PATH.read_text(encoding="utf-8"))
if any(b["lesson"] == 37 for b in data["lessons"]):
    before = (len(data["lessons"]), sum(len(b["questions"]) for b in data["lessons"]))
    print(f"NO-OP: bank 37 exists — banks={before[0]} items={before[1]}")
    raise SystemExit(0)

data["lessons"].extend(banks)
data["lessons"].sort(key=lambda b: b["lesson"])
PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

total = sum(len(b["questions"]) for b in data["lessons"])
print(f"WROTE: banks={len(data['lessons'])} items={total} (+68)")
for b in banks:
    print(f"  bank {b['lesson']}: {b['title']} — {b['count']}")
