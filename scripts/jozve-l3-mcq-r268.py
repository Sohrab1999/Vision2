#!/usr/bin/env python3
# Round 268 — Close the lesson-3 (Art and Culture) extraction gap of the grade-11 جزوه:
#   A) standard vocab Q1-40 (pp.91-92)  + key with translations (pp.194-195)
#   B) konkur vocab Q1-20 (p.93)        + letters-only column key (p.195 tail)
#   C) grammar&writing tests Q1-20 (pp.103-104) + key with explanations (pp.198-199)
#   D) 70-test grammar/writing summary Q1-70 (pp.105-108) + column key (p.200)
# Parser laws inherited from r267 (positional key numbering, dialogue dashes,
# bare-letter options, page-header scrub). Output: l3-missing-tests-r268.json
import json
import re
import unicodedata

SRC = "/home/z/my-project/content-extracts/grade11.json"
OUT = "/home/z/my-project/content-extracts/l3-missing-tests-r268.json"

doc = json.load(open(SRC))
pages = {p["n"]: p["text"] for p in doc["pages"]}

def fix_fa(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("\u0640", "")
    for marker in ("پاسخنامه", "واژگان \"درس", "تست واژ", "بخش :", "Note", "تس گ", "درس سوم", "درس1"):
        i = s.find(marker)
        if i > 0:
            s = s[:i]
    s = re.sub(r"(\S+)\s*\.\s*(?=[\u0600-\u06FF])", r". \1 ", s)
    WORD_FIXES = {
        "اطالعات": "اطلاعات", "کامال": "کاملاً", "اصالً": "اصلاً", "اصال": "اصل",
        "باال": "بالا", "اضاق": "اضافه", "عیل رغم": "علی‌رغم", "الزم": "لازم",
        "عالوه": "علاوه", "سالمتی": "سلامتی", "طوالنی": "طولانی", "جمالت": "جملات",
        "تالش": "تلاش", "علیم": "علمی", "سواالت": "سوالات", "متخصصیر": "متخصصین",
        "آساب": "آسانی", "شغیل": "شغلی", "خییل": "خیلی", "میی د": "می‌بیند",
        "تالشهابی": "تلاش‌هایی", "کنی ل": "کنترل", "شعت": "شهرت", "بازجوتی": "بازجویی",
        "یم": "می", "وقن": "وقتی", "نازگ": "نازک", "یم بافد": "می‌بافد",
        "می کند": "می‌کند", "می شود": "می‌شود", "می آید": "می‌آید", "می‌سازد": "می‌سازد",
        "می رود": "می‌رود", "می دهند": "می‌دهند", "می کند": "می‌کند",
        "حرفه ایی": "حرفه‌ای", "بویژه": "به‌ویژه", "ا و": "او",
    }
    for bad, good in WORD_FIXES.items():
        s = s.replace(bad, good)
    s = s.replace("می  ", "می‌")
    s = re.sub(r"\s*\.\s+(?=[\u0600-\u06FF])", " ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    if s and not s.endswith((".", "!", "؟", "?", "،")):
        s += "."
    return s.strip()

def fix_en(s: str) -> str:
    s = s.replace("’", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"[-\s]{3,}[-\s]*", " ---------------- ", s) if "----" in s else s
    s = re.sub(r'"\s*-{3,}\s*[-\s]*(?=[AB]:)', '" ', s)
    s = re.sub(r"\s{2,}", " ", s)
    return s.strip()

def split_options(line: str) -> dict:
    line = re.sub(r"^([abcd])\s+(?=[A-Za-z])", r"\1. ", line)
    parts = re.split(r"(?:^|\s)([abcd])\.\s*", line)
    opts = {}
    for i in range(1, len(parts) - 1, 2):
        letter, val = parts[i], parts[i + 1].strip()
        for marker in ("ست ت واژگان", "پاسخنامه", "بخش", "واژگان \"درس", "تس گ", "ت ست"):
            j = val.find(marker)
            if j > 0:
                val = val[:j].strip()
        for marker in ("کمک آموزش", "زبان انگل", "گردآوری", "همکاران", "پایه یازدهم", "جزوه"):
            j = val.find(marker)
            if j > 0:
                val = val[:j].strip()
        val = val.rstrip("() ").strip()
        if letter not in opts and val:
            opts[letter] = val
    return opts

def parse_questions(page_nums, max_q=70):
    raw = "\n".join(pages[n] for n in page_nums)
    # embedded questions: PDF may start the next question on the SAME physical line
    # ("...that pass 21. It was a long...") — insert a newline before "N. Capital"
    # only when preceded by end-of-sentence chars (never inside numbers like 1990.)
    raw = re.sub(r'(?<=[a-z\)\."])\s+(?=\d{1,2}\.\s*[A-Z"])', "\n", raw)
    lines = raw.split("\n")
    items = []
    cur = None
    for ln in lines:
        t = ln.strip()
        if not t or t.isdigit() or "جزوه" in t or "Vision" in t or "تألی" in t:
            continue
        if re.search(r"سطح تستها|پاسخنامه|سطح\"|تست استاندارد و کنکوری|تست های گرامر|تست گرامر و نگارش|تست واژگان|ت ست|Grammar|سواالت صفحه|Note|یادگیرندگان", t):
            continue
        qm = re.match(r"^(\d{1,2})\s*\.\s*(.*)$", t)
        om = re.match(r"^([abcd])\s*\.?\s*(.*)$", t)
        if qm and int(qm.group(1)) <= max_q and not om:
            if cur and cur.get("options"):
                items.append(cur)
            cur = {"num": int(qm.group(1)), "text": qm.group(2), "options": {}}
        elif om and cur is not None and len(cur["options"]) < 4:
            opts = split_options(t)
            for letter, val in opts.items():
                if letter not in cur["options"]:
                    cur["options"][letter] = val
        elif cur is not None:
            if re.search(r"واژگان \"درس|پاسخنامه|پایه یازدهم|Vision|جزوه|بخش|تس گ|درس سوم|درس3|همکاران", t) or re.search(r"کمک آموزش|زبان انگل|گردآوری", t):
                continue
            if not re.search(r"[A-Za-z\u0600-\u06FF]", t):
                continue
            if not cur["options"]:
                cur["text"] += " " + t
            else:
                last = list(cur["options"])[-1]
                cur["options"][last] += " " + t
    if cur and cur.get("options"):
        items.append(cur)
    return items

GOZINE_BODY = re.compile(
    r"(\d{1,2})\s*[\s().\-]{0,8}گزینه\s*\(?\s*([abcd])\s*\)?(.*?)(?=\d{1,2}\s*[\s().\-]{0,8}گزینه|\Z)",
    re.S,
)

def _gozine_entries(raw):
    raw = raw.replace("ترجمه :تست", "ترجمه تست").replace(":ترجمه تست", "ترجمه تست")
    raw = re.sub(r"ترجمه\s+تست", "ترجمه تست", raw)
    out = []
    for m in GOZINE_BODY.finditer(raw):
        letter = m.group(2)
        body = m.group(3)
        tmi = body.find("ترجمه تست")
        if tmi >= 0:
            tr = body[tmi:].replace("ترجمه تست", "").lstrip(" :").strip('" «»')
        else:
            # lesson-3 key style: Persian explanation/translation directly follows
            tr = body
        tr = re.sub(r"-{4,}", " ", tr)
        tr = re.sub(r"\s+", " ", tr).strip()
        out.append({"letter": letter, "translation": fix_fa(tr)})
    return out

def parse_key_gozine(page_nums, num_range):
    raw = "\n".join(pages[n] for n in page_nums)
    entries = _gozine_entries(raw)
    lo, hi = num_range
    assert len(entries) == hi - lo + 1, f"expected {hi-lo+1} key entries, got {len(entries)}"
    return {lo + i: ent for i, ent in enumerate(entries)}

def parse_key_columns(page_text, expected):
    t = re.sub(r"-{4,}", " ", page_text)
    toks = t.split()
    m = {}
    j = 0
    while j < len(toks):
        if toks[j] in ("a", "b", "c", "d") and j + 1 < len(toks) and toks[j + 1].isdigit():
            m[int(toks[j + 1])] = toks[j]
            j += 2
        else:
            j += 1
    missing = [n for n in range(1, expected + 1) if n not in m]
    assert not missing, f"column key missing {missing}"
    return m

# ---------- A) standard vocab Q1-40 (pp.91-92) ----------
vocab_items = parse_questions([91, 92], max_q=40)
vocab_keys = parse_key_gozine([194, 195], (1, 40))

# ---------- B) konkur Q1-20 (p.93) ----------
konkur_items = parse_questions([93], max_q=20)
konkur_raw = pages[195]
ki = konkur_raw.find("پاسخنامه کلیدی")
konkur_keys = parse_key_columns(konkur_raw[ki:], 20)

# ---------- C) grammar&writing Q1-20 (pp.103-104) ----------
gram_items = parse_questions([103, 104], max_q=30)
gram_keys = parse_key_gozine([198, 199], (1, 30))

# ---------- D) 70-test summary Q1-70 (pp.105-108) ----------
gs_items = parse_questions([105, 106, 107, 108], max_q=70)
gs_raw = pages[200]
gi = gs_raw.find("Grammar / Writing")
if gi < 0:
    gi = gs_raw.find("پاس")
gs_keys = parse_key_columns(gs_raw[gi:], 70)

LETTER_IDX = {"a": 0, "b": 1, "c": 2, "d": 3}

def assemble(items, keys, category, skip_questions):
    out, problems = [], []
    for it in items:
        num = it["num"]
        if len(it["options"]) < 4:
            problems.append((num, "options<4", list(it["options"])))
            continue
        opts = [it["options"].get(l, "").strip() for l in "abcd"]
        if any(not o for o in opts):
            problems.append((num, "empty option", opts))
            continue
        key = keys.get(num)
        if key is None:
            problems.append((num, "no key", ""))
            continue
        letter = key if isinstance(key, str) else key["letter"]
        qtext = fix_en(it["text"])
        norm = re.sub(r"[-\s]+", " ", qtext.lower()).strip()
        if norm in skip_questions:
            continue
        out.append({
            "srcNum": num,
            "category": category,
            "question": qtext,
            "options": opts,
            "answer": LETTER_IDX[letter],
            "translation": (key.get("translation", "") if isinstance(key, dict) else ""),
        })
    return out, problems

# existing app questions (normalized)
import pathlib
l3src = pathlib.Path("/home/z/my-project/src/data/lesson3.ts").read_text()
l3src = l3src.replace("\\'", "'").replace('\\"', '"')
def norm_ts(q):
    q = q.replace("’", "'").replace("“", '"').replace("”", '"')
    q = re.sub(r"[-\s]+", " ", q.lower()).strip()
    return q
app_qs = set()
for line in l3src.split("\n"):
    if 'Q("l3-' not in line:
        continue
    m = re.match(r'\s*Q\("l3-[a-z0-9]+",\s*"[^"]*",(.*),\s*\[', line)
    if not m:
        continue
    stem = m.group(1).strip()
    if (stem.startswith("'") and stem.endswith("'")) or (stem.startswith('"') and stem.endswith('"')):
        stem = stem[1:-1]
    app_qs.add(norm_ts(stem))
print(f"existing l3 questions in app: {len(app_qs)}")

new_vocab, pv = assemble(vocab_items, vocab_keys, "vocab", app_qs)
new_konkur, pk = assemble(konkur_items, konkur_keys, "vocab-konkuri", app_qs)
new_gram, pg = assemble(gram_items, gram_keys, "grammar", app_qs)
new_gs, pgs = assemble(gs_items, gs_keys, "grammar", set())

def has_fa(s):
    return bool(re.search(r"[\u0600-\u06FF]", s))

for rec in new_vocab + new_konkur + new_gram + new_gs:
    assert not has_fa(rec["question"]), f"FA leaked into src{rec['srcNum']} question"
    for o in rec["options"]:
        assert not has_fa(o), f"FA leaked into src{rec['srcNum']} options: {o}"

result = {
    "newVocab": new_vocab, "newKonkur": new_konkur,
    "newGram": new_gram, "newGs": new_gs,
}
json.dump(result, open(OUT, "w"), ensure_ascii=False, indent=1)

print(f"vocab missing : {len(new_vocab)}  problems={pv}")
print(f"konkur missing: {len(new_konkur)}  problems={pk}")
print(f"gram missing  : {len(new_gram)}  problems={pg}")
print(f"gs (all new)  : {len(new_gs)}  problems={pgs[:6]}")
print("vocab srcNums :", [q["srcNum"] for q in new_vocab])
print("konkur srcNums:", [q["srcNum"] for q in new_konkur])
print("gram srcNums  :", [q["srcNum"] for q in new_gram])
