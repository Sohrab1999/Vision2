# -*- coding: utf-8 -*-
# r356 — استخراجِ «آزمون تشریحی گرامر درس دوم» یازدهم (ص۶۳-۶۴، کلیدِ چاپیِ ص۱۸۷) → tests-g11.json بانک‌های ۵۶-۵۹
# چهار سکشنِ خودِ آزمون = چهار بانک (الگوی r354/r355):
#  (۱) since/for ×۱۰ تایپی | (۲) گزینهٔ صحیح پرانتزی ×۱۲ تایپی | (۳) شکلِ صحیحِ افعال ×۱۲ تایپی |
#  (۴) بهترین گزینه ×۲۰ MCQ. جمع: ۵۴ آیتم → tests-g11 = ۸۹۳ در ۵۹ بانک.
# درس‌های برازیده: r354 (برشِ سکشن با لنگرِ اولین سؤال + گاردِ فارسی)، r351 (کلیدِ پارس‌شده از لایه، نه از حفظ)،
# r355 (پارسِ chunk-محور برای آیتمِ چندخطی + ادغامِ رانِ شکسته)، g10-l14/l15 و r354 (قراردادِ typed:
# accepted=[options[answer]] + placeholder)؛ سربرگِ خودِ آزمون لوکاتورِ کلید را اعلام می‌کند («پاسخنامه صفحه ۱۸۷»).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g11.json")
PDF = "/home/z/my-project/upload/جزوه جامع یازدهم .pdf"

doc = fitz.open(PDF)
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def page_clean(pno: int) -> str:
    """متنِ صفحه با حذفِ سربرگِ تکراری — regex تیره‌محورِ «هم[ـ]*کاران» (درسِ r354)."""
    raw = doc[pno].get_text("text")
    lines = raw.split("\n")
    for i, ln in enumerate(lines):
        if re.search(r"هم[ـ]*کاران", ln):
            return "\n".join(lines[i + 1:])
    raise AssertionError(f"p{pno+1}: header anchor not found")


exam = "\n".join(page_clean(p) for p in (62, 63))  # ص۶۳-۶۴
key_raw = page_clean(186)  # ص۱۸۷

# ---------- لنگرهای متقابلِ آزمون ↔ کلید (سربرگِ خودِ آزمون لوکاتور را اعلام می‌کند) ----------
assert re.search(r"پاسخنامه صفحه\s*:?\s*\n?\s*7\s*\n?\s*18", exam), "exam header locator «پاسخنامه صفحه 187» missing"
assert re.search(r"آزمون صفحه\s*:?\s*\n?\s*63\s*\n?\s*و\s*\n?\s*64", key_raw), "key header locator «آزمون صفحه 63 و 64» missing"
assert re.search(r"آزمون تش\s+ییح\s*\n?\s*گرامر درس دوم", exam), "scrambled exam header missing"

# ---------- کلید: ۵۴ مدخلِ شماره‌دار با شماره‌گذاریِ بازشونده (۱۰/۱۲/۱۲/۲۰) ----------
SIZES = [10, 12, 12, 20]
key_entries = []
for m in re.finditer(r"(?m)^(\d{1,2})\.\s+(.+)$", key_raw):
    body = re.sub(r"\s+", " ", m.group(2)).strip()
    if PERSIAN.search(body):
        continue
    key_entries.append((int(m.group(1)), body))
assert len(key_entries) == 54, f"key entries={len(key_entries)} (expected 54)"
keys_by_sec, pos = [], 0
for sz in SIZES:
    grp = key_entries[pos : pos + sz]
    assert [n for n, _ in grp] == list(range(1, sz + 1)), f"key numbering broken at offset {pos}: {[n for n,_ in grp]}"
    keys_by_sec.append([t for _, t in grp])
    pos += sz
K1, K2, K3, K4 = keys_by_sec

# قفلِ نرمِ سکشن۱: کلیدها ∈ {for, since} + Q1 دوبلانکیِ ترتیب‌دار
assert K1[0] == "for / since", K1[0]
assert set(K1[1:]) <= {"for", "since"}, K1[1:]

# ---------- برشِ سکشن‌ها با لنگرِ اولین سؤال هر سکشن (درسِ r354) ----------
ANCHORS = [
    ("My sister has been sick", "s1"),
    ("Reza (went / has gone)", "s2"),
    ("(not play) football yesterday", "s3"),
    ("Ahmad works in a factory now", "s4"),
]
starts = []
for anchor, tag in ANCHORS:
    i = exam.find(anchor)
    assert i >= 0, f"anchor missing: {tag}"
    starts.append(exam.rfind("\n", 0, i) + 1)
for k in range(len(ANCHORS) - 1):
    assert starts[k] < starts[k + 1], f"anchor order broken at {ANCHORS[k][1]}"
sec_slices = {}
for k, (anchor, tag) in enumerate(ANCHORS):
    end = starts[k + 1] if k + 1 < len(starts) else len(exam)
    sec_slices[tag] = exam[starts[k]:end]

ANS_LINE = re.compile(r"(?m)^\s*\d{1,2}\.\s+[-–\s.?]+$")


def numbered_items(text: str) -> list[tuple[int, str]]:
    """جفت‌های «N. متن» تک‌خطی — سربرگ‌های فارسی و خطوطِ نقطه‌چین نمی‌گیرد (گاردِ r354)."""
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


def merge_dash_runs(body: str, width: int) -> str:
    """ران‌های شکستهٔ بین‌خطی ادغام (قرارداد r311) + نرمال‌سازیِ همهٔ ران‌های باقی‌مانده به عرضِ ثابت."""
    merged = re.sub(r"-{2,}(?:\s*-{2,})+", "-" * width, body)
    return re.sub(r"-{2,}", "-" * width, merged)


# سکشن ۱ — since/for (تایپی ×۱۰) — Q8 چندخطی است (درسِ r355): پارسِ chunk-محور
s1_raw = sec_slices["s1"]
_starts1 = [m.start() for m in re.finditer(r"(?m)^\d{1,2}\.\s", s1_raw)]
assert len(_starts1) == 10, f"sec1 item starts={len(_starts1)}"
s1_items = []
for k1 in range(10):
    chunk = s1_raw[_starts1[k1] : _starts1[k1 + 1] if k1 + 1 < 10 else len(s1_raw)]
    kept = []
    for ln in chunk.split("\n"):
        if re.fullmatch(r"-{40,}\s*", ln):
            break
        kept.append(ln)
    body = re.sub(r"\s+", " ", " ".join(kept)).strip()
    body = re.sub(r"^\d{1,2}\.\s+", "", body)
    body = merge_dash_runs(body, width=24)
    s1_items.append((k1 + 1, body))
assert_numbering(s1_items, 10, "sec1")
# قفل‌های شکلِ سکشن۱: Q1 دوبلانکی؛ Q8 رانِ شکستهٔ ادغام‌شده
assert s1_items[0][1].count("-" * 24) == 2, s1_items[0][1]
assert "for" in K1[0] and "since" in K1[0]
assert s1_items[7][1].count("-" * 24) == 1 and "15 years" in s1_items[7][1], s1_items[7][1]

# سکشن ۲ — گزینهٔ صحیح پرانتزی (تایپی ×۱۲) — تک‌خطی؛ Q7 دو پرانتز دارد
PAREN = re.compile(r"\(([^()]+)\)")
s2_items = []
for n, body in numbered_items(sec_slices["s2"]):
    body = re.sub(r"\s+", " ", body).strip()
    parens = PAREN.findall(body)
    s2_items.append({"n": n, "stem": body, "parens": parens})
assert_numbering([(i["n"], "") for i in s2_items], 12, "sec2")
for it in s2_items:
    if it["n"] == 7:
        assert len(it["parens"]) == 2, f"sec2 Q7: {it['parens']}"
        cands = [c.strip() for c in it["parens"][0].split("/")]
        assert cands == ["is", "has been"], cands
        assert K2[6] == "is / has been", K2[6]
    else:
        assert len(it["parens"]) == 1, f"sec2 Q{it['n']}: {it['parens']}"
        cands = [c.strip() for c in it["parens"][0].split("/")]
        assert len(cands) == 2, f"sec2 Q{it['n']}: {cands}"
        assert K2[it["n"] - 1] in cands, f"sec2 Q{it['n']}: key {K2[it['n']-1]!r} ∉ {cands}"
        it["cands"] = cands

# سکشن ۳ — شکلِ صحیحِ افعال (تایپی ×۱۲) — تک‌خطی با رانِ بلندِ dash + پرانتزِ فعل
s3_items = []
for n, body in numbered_items(sec_slices["s3"]):
    body = re.sub(r"\s+", " ", body).strip()
    body = merge_dash_runs(body, width=40)
    m = PAREN.search(body)
    assert m, f"sec3 Q{n}: no paren verb in {body[:60]!r}"
    s3_items.append({"n": n, "stem": body, "verb": m.group(1).strip()})
assert_numbering([(i["n"], "") for i in s3_items], 12, "sec3")
# قفلِ نرمِ سکشن۳: رادیکالِ فعلِ پرانتزی باید در کلید بیاید (نفی/صورتِ صرفیِ چاپی حفظ می‌شود)
RADICALS = {
    1: "pl", 2: "lo", 3: "ans", 4: "ha", 5: "vi", 6: "rep",
    7: "as", 8: "li", 9: "wo", 10: "sp", 11: "dr", 12: "pr",  # 9: win→won (بی‌قاعده)
}
for it, k in zip(s3_items, K3):
    rad = RADICALS[it["n"]]
    assert rad in k.lower(), f"sec3 Q{it['n']}: key {k!r} lacks radical of ({it['verb']})"

# سکشن ۴ — بهترین گزینه (MCQ ×۲۰) — ماشینِ r354
def parse_mcq(text: str, tag: str):
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    items, cur = [], None
    for ln in lines:
        mq = re.match(r"^(\d{1,2})\.\s+(.+)$", ln)
        mo = re.match(r"^([a-d])[.)]\s+(.+)$", ln)
        if mq and not mo:
            if PERSIAN.search(mq.group(2)):
                continue  # سربرگِ فارسی — سؤال نیست (درسِ r354)
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


def opt_index(it, key_text: str, tag: str) -> int:
    key_n = re.sub(r"\s+", " ", key_text).strip()
    hits = [L for L, txt in it["opts"].items() if txt == key_n]
    assert len(hits) == 1, f"{tag} Q{it['n']}: key {key_n!r} matched {hits} (opts={it['opts']})"
    return "abcd".index(hits[0])


s4_items = parse_mcq(sec_slices["s4"], "sec4")
assert_numbering([(i["n"], "") for i in s4_items], 20, "sec4")
for it in s4_items:
    it["stem"] = merge_dash_runs(it["stem"], width=20)
A4 = [opt_index(it, k, "sec4") for it, k in zip(s4_items, K4)]
# قفل‌های نقطه‌ایِ سکشن۴: دوبلانکی‌های Q9/Q13 + کوئیرک‌های verbatim
assert s4_items[8]["stem"].count("-" * 20) == 2 and "World Cup" in s4_items[8]["stem"], s4_items[8]["stem"]
assert s4_items[12]["stem"].count("-" * 20) == 2 and "never" in s4_items[12]["stem"], s4_items[12]["stem"]
assert s4_items[6]["opts"]["d"] == "has you been", s4_items[6]["opts"]  # چاپ‌غلطِ verbatim
assert "A: Have you ever spoken to him. B:" in s4_items[15]["stem"], s4_items[15]["stem"]  # نقطهٔ چاپی به‌جای «؟» در بخشِ A

# ---------- هم‌پوشانی‌سنجی با بانک‌های پیشینِ یازدهم (ساقهٔ نرمال‌شده — درسِ r311) ----------
data = json.loads(PATH.read_text(encoding="utf-8"))
if any(b["lesson"] == 56 for b in data["lessons"]):
    before = (len(data["lessons"]), sum(len(b["questions"]) for b in data["lessons"]))
    print(f"NO-OP: bank 56 exists — banks={before[0]} items={before[1]}")
    raise SystemExit(0)
prev_stems = set()
for les in data["lessons"]:
    for q in les["questions"]:
        prev_stems.add(re.sub(r"\s+", " ", q["question"]).strip().lower())
new_stems = (
    [b for _, b in s1_items]
    + [i["stem"] for i in s2_items]
    + [i["stem"] for i in s3_items]
    + [i["stem"] for i in s4_items]
)
dups = [s for s in new_stems if s.lower() in prev_stems]
assert not dups, f"overlap with prior banks: {dups[:3]}"

# ---------- ساختِ بانک‌ها ----------
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


banks = []
BANK_TAG = "آزمون تشریحی گرامر درس دوم"

# بانک ۵۶ — سکشن ۱: since/for (تایپی ×۱۰)
q56 = []
for n, stem in s1_items:
    k = K1[n - 1]
    if n == 1:  # دوبلانکی: کلیدِ ترتیب‌دار «for / since»؛ خرابِ ترتیب = گزینهٔ دوم
        q56.append(typed_q(56, n, stem, ["for / since", "since / for"], k, "fill each blank: first blank / second blank…"))
    else:
        other = "since" if k == "for" else "for"
        q56.append(typed_q(56, n, stem, [k, other], k, "fill the blank with since or for…"))
banks.append({"lesson": 56, "title": "تشریحی گرامر د۲ — جاهای خالی با since یا for (ص۶۳)", "level": "تشریحی — تایپی", "count": 10, "questions": q56})

# بانک ۵۷ — سکشن ۲: گزینهٔ صحیح پرانتزی (تایپی ×۱۲؛ گزینه‌ها = دو نامزدِ چاپی — الگوی r354-l40)
q57 = []
for it in s2_items:
    k = K2[it["n"] - 1]
    if it["n"] == 7:  # دو پرانتز با جفتِ یکسان؛ کلیدِ ترتیب‌دار
        q57.append(typed_q(57, it["n"], it["stem"], ["is / has been", "has been / is"], k, "type both answers in order: first blank / second blank…"))
    else:
        q57.append(typed_q(57, it["n"], it["stem"], it["cands"], k, "type the correct option in parentheses…"))
banks.append({"lesson": 57, "title": "تشریحی گرامر د۲ — گزینهٔ صحیح پرانتزی (ص۶۳)", "level": "تشریحی — تایپی", "count": 12, "questions": q57})

# بانک ۵۸ — سکشن ۳: شکلِ صحیحِ افعال (تایپی ×۱۲؛ گزینه‌ها = پاسخِ خود + سه کلیدِ دیگرِ سکشن — الگوی l14/l15)
q58 = []
for idx, it in enumerate(s3_items):
    k = K3[idx]
    others = [K3[j] for j in range(12) if j != idx][:3]
    q58.append(typed_q(58, it["n"], it["stem"], [k] + others, k, "write the correct verb form (present perfect or simple past)…"))
banks.append({"lesson": 58, "title": "تشریحی گرامر د۲ — شکل صحیح افعال (ص۶۳)", "level": "تشریحی — تایپی", "count": 12, "questions": q58})

# بانک ۵۹ — سکشن ۴: بهترین گزینه (MCQ ×۲۰)
q59 = []
for it, ai in zip(s4_items, A4):
    q59.append({"id": f"g11-l59-{it['n']}", "n": it["n"], "category": "grammar", "question": it["stem"], "options": [it["opts"][L] for L in "abcd"], "answer": ai})
banks.append({"lesson": 59, "title": "تشریحی گرامر د۲ — تست چهارگزینه‌ای (ص۶۴)", "level": "تشریحی — چهارگزینه‌ای", "count": 20, "questions": q59})

# ---------- نوشتن (idempotent — چکِ زودهنگام بالا انجام شد) ----------
data["lessons"].extend(banks)
data["lessons"].sort(key=lambda b: b["lesson"])
PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

total = sum(len(b["questions"]) for b in data["lessons"])
print(f"WROTE: banks={len(data['lessons'])} items={total} (+54)")
for b in banks:
    print(f"  bank {b['lesson']}: {b['title']} — {b['count']}")
print("spot: l56 keys", K1, "| l59 answers", A4)
