# -*- coding: utf-8 -*-
# r358 — استخراجِ «آزمون تشریحی گرامر درس سوم» یازدهم (ص۱۰۰-۱۰۲، کلیدِ چاپیِ ص۱۹۶-۱۹۷) → tests-g11.json بانک‌های ۷۴-۷۸
# پنج سکشنِ خودِ آزمون = پنج بانک (الگوی r354/r356):
#  (۱) شکلِ صحیحِ افعال ×۱۰ تایپی | (۲) تصحیحِ اشتباهِ گرامری ×۱۲ تایپی | (۳) بهترین گزینه ×۲۰ MCQ |
#  (۴) جمله‌سازیِ شرطی ×۱۰ تایپی | (۵) جمله‌سازیِ مصدر ×۹ تایپی (چاپ در آیتمِ ۱۰ بریده — کلیدِ یتیمِ مستند).
# جمع: ۶۱ آیتم → tests-g11 = ۱۰۱۹ در ۷۸ بانک.
# درس‌های برازیده: r356 (گرامرِ درس‌محور؛ لنگرِ متقابل؛ درسِ win→won برای be-verbهای متمم)، r357 (پارسرِ
# دوستونی؛ سه شرطِ قطعِ chunk؛ مرزِ صفحه)، r354 (لنگرِ اولین سؤال + یکتایی + گاردِ فارسی + ماشینِ MCQ)،
# r351 (کلیدِ پارس‌شده از لایه، نه از حفظ)، r355-l50 (جمله‌سازی با داربستِ پاسخ‌های خودِ سکشن).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g11.json")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

doc = fitz.open(PDF)
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_clean(pno: int) -> str:
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    raise AssertionError(f"p{pno+1}: header anchor not found")


exam = "\n".join(page_clean(p) for p in (99, 100, 101))  # ص۱۰۰-۱۰۲ (ص۱۰۳ خانوادهٔ کنکوریِ جدا است)
key_raw = page_clean(195) + "\n" + page_clean(196)  # ص۱۹۶-۱۹۷

# ---------- لنگرهای متقابلِ آزمون ⇄ کلید (سربرگِ هر دو یکدیگر را تأیید می‌کنند — درسِ r356) ----------
assert re.search(r"پاسخنامه صفحه\s*:?\s*\n?196\s*\n?و\s*\n?197", exam), "exam locator «پاسخنامه 196 و 197» missing"
assert re.search(r"سؤاالت صفحه\s*:?\s*\n?100\s*\n?تا\s*\n?102", key_raw), "key locator «سؤالات صفحه 100 تا 102» missing"
assert re.search(r"آزمون تش\s+ییح گرامر درس سوم", exam), "scrambled exam header missing"
assert re.search(r"آزمون تش\s+ییح گرامر درس سوم", key_raw), "scrambled key header missing"

# ---------- کلید: ۶۲ مدخلِ شماره‌دار (۱۰/۱۲/۲۰/۱۰/۱۰ — سکشن۳ حرفی) ----------
SIZES = [10, 12, 20, 10, 10]
ENTRY = re.compile(r"(?:^|\s{3,})(\d{1,2})\.\s+(.+?)(?=\s{3,}\d{1,2}\.\s|$)")


def key_line_entries(line: str) -> list[tuple[int, str]]:
    out = []
    for m in ENTRY.finditer(line):
        body = re.sub(r"\s+", " ", m.group(2)).strip()
        if body and not PERSIAN.search(body):
            out.append((int(m.group(1)), body))
    return out


key_entries: list[tuple[int, str]] = []
for ln in key_raw.split("\n"):
    key_entries.extend(key_line_entries(ln))
assert len(key_entries) == 62, f"key entries={len(key_entries)} (expected 62)"
keys_by_sec, pos = [], 0
for sz in SIZES:
    grp = key_entries[pos : pos + sz]
    assert [n for n, _ in grp] == list(range(1, sz + 1)), f"key numbering broken at offset {pos}: {[n for n,_ in grp]}"
    keys_by_sec.append([t for _, t in grp])
    pos += sz
K1, K2, K3, K4, K5 = keys_by_sec

# قفل‌های نرمِ کلید
assert K1 == ["will stay", "won’t shine", "be", "am not", "are", "come", "don’t slow", "are", "will make", "works"], K1
assert K3 == list("bbdccbdcaacbacdcbdba"), K3
assert K5[9] == "My parents wanted me to be at home at 11 o’clock.", K5[9]  # مدخلِ یتیمِ کلید — ساقه‌اش چاپ نشده

# ---------- برشِ سکشن‌ها با لنگرِ اولین سؤالِ هر سکشن (درسِ r354) — یکتاییِ لنگر هم گارد می‌شود ----------
ANCHORS = [
    ("If it rains, we", "s1"),
    ("If you didn’t get married", "s2"),
    ("If you send this letter now", "s3"),
    ("this / fix / you / it / they / will / car / buy / if?", "s4"),
    ("eat / do / breakfast / want / for / you / to / what?", "s5"),
]
for anchor, tag in ANCHORS:
    assert exam.count(anchor) == 1, f"anchor {tag} not unique: {exam.count(anchor)}"
starts = []
for anchor, tag in ANCHORS:
    i = exam.find(anchor)
    starts.append(exam.rfind("\n", 0, i) + 1)
for k in range(len(ANCHORS) - 1):
    assert starts[k] < starts[k + 1], f"anchor order broken at {ANCHORS[k][1]}"
sec_slices = {}
for k, (anchor, tag) in enumerate(ANCHORS):
    end = starts[k + 1] if k + 1 < len(starts) else len(exam)
    sec_slices[tag] = exam[starts[k]:end]

ANS_LINE = re.compile(r"(?m)^\s*\d{1,2}\.\s+[-–\s.?]+$")


def numbered_items(text: str) -> list[tuple[int, str]]:
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


def chunk_items(text: str, n: int, tag: str) -> list[tuple[int, str]]:
    """آیتم‌های چندخطی — سه شرطِ قطع (درسِ r357): داشِ ۴۰+ / رقمِ تنها / خطِ فارسی."""
    raw = text.split("\n")
    idx = [i for i, ln in enumerate(raw) if re.match(r"^\d{1,2}\.\s", ln)]
    assert len(idx) == n, f"{tag}: item starts={len(idx)}"
    out = []
    for k in range(n):
        a, b = idx[k], idx[k + 1] if k + 1 < n else len(raw)
        kept = []
        for ln in raw[a:b]:
            if re.fullmatch(r"-{40,}\s*", ln) or re.fullmatch(r"\d{1,2}\s*", ln) or PERSIAN.search(ln):
                break
            kept.append(ln)
        body = re.sub(r"\s+", " ", " ".join(kept)).strip()
        body = re.sub(r"^\d{1,2}\.\s+", "", body)
        out.append((k + 1, body))
    return out


def merge_dash_runs(body: str, width: int) -> str:
    return re.sub(r"-{2,}(?:\s*-{2,})+", "-" * width, body)


# ---------- سکشن ۱ — شکلِ صحیحِ افعال (تایپی ×۱۰) ----------
s1_items = []
for n, body in numbered_items(sec_slices["s1"]):
    body = merge_dash_runs(re.sub(r"\s+", " ", body).strip(), 32)
    m = re.search(r"\(([^()]+)\)", body)
    assert m, f"sec1 Q{n}: no paren verb in {body[:60]!r}"
    s1_items.append({"n": n, "stem": body, "verb": m.group(1).strip()})
assert_numbering([(i["n"], "") for i in s1_items], 10, "sec1")
# قفل: رادیکالِ فعل برای فعل‌های عادی + توازنِ نفی + فهرستِ سفیدِ be از چاپ (درسِ win→wonِ r356 برای متممِ be)
BE_FORMS = ("be", "am", "is", "are", "was", "were")
for it, k in zip(s1_items, K1):
    verb = it["verb"]
    neg = verb.startswith("not ")
    base = verb[4:] if neg else verb
    klow = k.lower()
    if base == "be":
        assert any(re.search(rf"\b{f}\b", klow) for f in BE_FORMS), f"sec1 Q{it['n']}: be-form {k!r}"
    else:
        assert base[:3].lower() in klow, f"sec1 Q{it['n']}: key {k!r} vs verb {verb!r}"
    has_neg_key = bool(re.search(r"\bnot\b|n’t|n't", klow))
    assert has_neg_key == neg, f"sec1 Q{it['n']}: negation parity broken ({verb!r} vs {k!r})"

# ---------- سکشن ۲ — تصحیحِ اشتباهِ گرامری (تایپی ×۱۲؛ جعبهٔ پاسخِ چاپی در ساقه حفظ) ----------
s2_items = []
for n, body in chunk_items(sec_slices["s2"], 12, "sec2"):
    body = re.sub(r"\s+", " ", body).strip()
    m = re.search(r"\((-{2,})\)\s*$", body)
    assert m, f"sec2 Q{n}: no answer box at tail: {body[-50:]!r}"
    s2_items.append({"n": n, "stem": body})
assert_numbering([(i["n"], "") for i in s2_items], 12, "sec2")
# کلیدِ سکشن۲ = تکرارِ جمله + پرانتزِ پایانیِ تصحیح
K2_corr = []
for k, it in zip(K2, s2_items):
    m = re.search(r"\(([^()]+)\)\s*$", k)
    assert m, f"sec2 key shape: {k[-40:]!r}"
    corr = m.group(1).strip()
    sent = re.sub(r"\s*\([^()]*\)\s*$", "", k).strip()
    # جملهٔ کلید باید با ساقه (بدونِ جعبهٔ پاسخ) هم‌ریشه باشد — قفلِ تطبیقِ دوطرفه
    stem_sent = re.sub(r"\s*\(-{2,}\)\s*$", "", it["stem"]).strip()
    norm = lambda s: re.sub(r"[^a-z0-9 ]", "", re.sub(r"[’‘]", "'", s.lower()))
    assert norm(sent) == norm(stem_sent), f"sec2 Q{it['n']}: key sentence mismatch\n key={sent!r}\n stem={stem_sent!r}"
    K2_corr.append(corr)

# ---------- سکشن ۳ — بهترین گزینه (MCQ ×۲۰؛ ماشینِ r354) ----------
def parse_mcq(text: str, tag: str):
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    items, cur = [], None
    for ln in lines:
        mq = re.match(r"^(\d{1,2})\.\s+(.+)$", ln)
        mo = re.match(r"^([a-d])[.)]\s+(.+)$", ln)
        if mq and not mo:
            if PERSIAN.search(mq.group(2)):
                continue
            if cur:
                items.append(cur)
            cur = {"n": int(mq.group(1)), "stem": re.sub(r"\s+", " ", mq.group(2)).strip(), "opts": {}}
        elif mo and cur is not None:
            cur["opts"][mo.group(1)] = re.sub(r"\s+", " ", mo.group(2)).strip()
    if cur:
        items.append(cur)
    for it in items:
        assert set(it["opts"]) == {"a", "b", "c", "d"}, f"{tag} Q{it['n']}: opts={list(it['opts'])}"
    return items


s3_items = parse_mcq(sec_slices["s3"], "sec3")
assert_numbering([(i["n"], "") for i in s3_items], 20, "sec3")
A3 = ["abcd".index(k) for k in K3]  # کلیدِ حرفیِ چاپی → اندیس

# ---------- سکشن ۴ و ۵ — جمله‌سازی (تایپی؛ قفلِ چندمجموعهٔ واژگانِ ساقه⇄کلید) ----------
def tokens(s: str) -> list[str]:
    s = re.sub(r"[’‘]", "'", s.lower())
    return re.findall(r"[a-z0-9']+", s.replace("/", " "))


def build_sentence_bank(sec, K, bank, title, placeholder):
    items = [(n, re.sub(r"\s+", " ", b).strip()) for n, b in numbered_items(sec_slices[sec])]
    assert_numbering(items, len(K), sec)
    qs = []
    for idx, ((n, stem), k) in enumerate(zip(items, K)):
        assert sorted(tokens(stem)) == sorted(tokens(k)), f"{sec} Q{n}: multiset mismatch\n stem={stem!r}\n key={k!r}"
        others = [K[j] for j in range(len(K)) if j != idx][:3]
        qs.append(typed_q(bank, n, stem, [k] + others, k, placeholder, category="grammar"))
    return qs


def typed_q(bank: int, n: int, question: str, opts: list[str], answer_text: str, placeholder: str, category: str = "grammar"):
    ai = opts.index(answer_text)
    return {
        "id": f"g11-l{bank}-{n}",
        "n": n,
        "category": category,
        "kind": "typed",
        "question": question,
        "options": opts,
        "answer": ai,
        "accepted": [answer_text],
        "placeholder": placeholder,
    }


# ---------- هم‌پوشانی‌سنجی با بانک‌های پیشینِ یازدهم ----------
data = json.loads(PATH.read_text(encoding="utf-8"))
if any(b["lesson"] == 74 for b in data["lessons"]):
    before = (len(data["lessons"]), sum(len(b["questions"]) for b in data["lessons"]))
    print(f"NO-OP: bank 74 exists — banks={before[0]} items={before[1]}")
    raise SystemExit(0)
prev_stems = set()
for les in data["lessons"]:
    for q in les["questions"]:
        prev_stems.add(re.sub(r"\s+", " ", q["question"]).strip().lower())
new_stems = (
    [i["stem"] for i in s1_items]
    + [i["stem"] for i in s2_items]
    + [i["stem"] for i in s3_items]
    + [b for _, b in [(n, re.sub(r"\s+", " ", x).strip()) for n, x in numbered_items(sec_slices["s4"])]]
    + [b for _, b in [(n, re.sub(r"\s+", " ", x).strip()) for n, x in numbered_items(sec_slices["s5"])]]
)
dups = [s for s in new_stems if s.lower() in prev_stems]
assert not dups, f"overlap with prior banks: {dups[:3]}"

# ---------- ساختِ بانک‌ها ----------
banks = []
BANK_TAG = "آزمون تشریحی گرامر درس سوم"

q74 = []
for idx, (it, k) in enumerate(zip(s1_items, K1)):
    others = [K1[j] for j in range(10) if j != idx][:3]
    q74.append(typed_q(74, it["n"], it["stem"], [k] + others, k, "write the correct form of the verb in parentheses…"))
banks.append({"lesson": 74, "title": "تشریحی گرامر د۳ — شکل صحیح افعال (ص۱۰۰)", "level": "تشریحی — تایپی", "count": 10, "questions": q74})

q75 = []
for idx, (it, k) in enumerate(zip(s2_items, K2_corr)):
    others = [K2_corr[j] for j in range(12) if j != idx][:3]
    q75.append(typed_q(75, it["n"], it["stem"], [k] + others, k, "find the mistake and write the correction…"))
banks.append({"lesson": 75, "title": "تشریحی گرامر د۳ — تصحیح اشتباه گرامری (ص۱۰۰)", "level": "تشریحی — تایپی", "count": 12, "questions": q75})

q76 = []
for it, ai in zip(s3_items, A3):
    q76.append({"id": f"g11-l76-{it['n']}", "n": it["n"], "category": "grammar", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": ai})
banks.append({"lesson": 76, "title": "تشریحی گرامر د۳ — تست چهارگزینه‌ای (ص۱۰۰-۱۰۱)", "level": "تشریحی — چهارگزینه‌ای", "count": 20, "questions": q76})

q77 = build_sentence_bank("s4", K4, 77, "جمله‌سازی شرطی", "build the sentence from the jumbled words…")
banks.append({"lesson": 77, "title": "تشریحی گرامر د۳ — جمله‌سازی شرطی (ص۱۰۲)", "level": "تشریحی — جمله‌سازی", "count": 10, "questions": q77})

q78 = build_sentence_bank("s5", K5[:9], 78, "جمله‌سازی مصدر", "build the sentence with the infinitive from the jumbled words…")
banks.append({"lesson": 78, "title": "تشریحی گرامر د۳ — جمله‌سازی با مصدر (ص۱۰۲)", "level": "تشریحی — جمله‌سازی", "count": 9, "questions": q78})

# ---------- نوشتن (idempotent — چکِ زودهنگام بالا انجام شد) ----------
data["lessons"].extend(banks)
data["lessons"].sort(key=lambda b: b["lesson"])
PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

total = sum(len(b["questions"]) for b in data["lessons"])
print(f"WROTE: banks={len(data['lessons'])} items={total} (+61)")
for b in banks:
    print(f"  bank {b['lesson']}: {b['title']} — {b['count']}")
print("spot: l76 answers", [q["answer"] for q in q76])
print("sec2 corrections:", K2_corr)
print("orphan key entry (sec5 Q10):", K5[9])
