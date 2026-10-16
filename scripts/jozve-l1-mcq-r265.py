#!/usr/bin/env python3
# Round 265 — Parse the REMAINING lesson-1 vocab tests of the grade-11 جزوه
# (Q21-40 standard + Q11-22 konkur) that were never extracted into the app,
# with Persian translations from the جزوه's own answer key (p177-178).
#
# Output: /home/z/my-project/content-extracts/l1-missing-tests.json
import json
import re
import unicodedata

SRC = "/home/z/my-project/content-extracts/grade11.json"
OUT = "/home/z/my-project/content-extracts/l1-missing-tests.json"

doc = json.load(open(SRC))
pages = {p["n"]: p["text"] for p in doc["pages"]}

# ---------- Persian cleanup helpers ----------
def fix_fa(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("\u0640", "")  # tatweel
    # cut contamination from answer-key blocks / page headers
    for marker in ("پاسخنامه", "واژگان \"درس", "تست واژ", "بخش :", "Note"):
        i = s.find(marker)
        if i > 0:
            s = s[:i]
    # period reversed onto the next word: ".دارد" -> "دارد."
    s = re.sub(r"(\S+)\s*\.\s*(?=[\u0600-\u06FF])", r". \1 ", s)
    # common glyph repairs observed in the extraction (لا-ligature swaps etc.)
    WORD_FIXES = {
        "اطالعات": "اطلاعات", "کامال": "کاملاً", "اصالً": "اصلاً", "اصال": "اصل",
        "باال": "بالا", "اضاق": "اضافه", "دسی س": "دسترس", "عیل رغم": "علی‌رغم",
        "پایین\u200cتر": "پایین‌تر", "اسالیم": "اسلامی", "الزم": "لازم",
        "عالوه": "علاوه", "کامأل": "کاملاً", "قطعأ": "قطعاً", "تقریبآ": "تقریباً",
        "عمدتأ": "عمدتاً", "میس": "می", "کمتر": "کمتر",
    }
    for bad, good in WORD_FIXES.items():
        s = s.replace(bad, good)
    s = s.replace("می  ", "می‌")
    # stray mid-sentence periods (extraction put the final period early):
    # "X . Y" -> "X Y" and add the final period at the very end
    s = re.sub(r"\s*\.\s+(?=[\u0600-\u06FF])", " ", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    if s and not s.endswith((".", "!", "؟", "?", "،")):
        s += "."
    return s.strip()

def fix_en(s: str) -> str:
    s = s.replace("’", "'").replace("“", '"').replace("”", '"')
    # dashed blank + stray spaces
    s = re.sub(r"[-\s]{3,}[-\s]*", " ---------------- ", s) if "----" in s else s
    s = re.sub(r"\s{2,}", " ", s)
    return s.strip()

# ---------- 1) parse questions from pages 19-21 ----------
QUESTION_RE = re.compile(
    r"^\s*(\d{1,2})\s*\.\s*(.+?)\s*$", re.M
)

def split_options(line: str) -> dict:
    """Split 'a. xx  b. yy  c. zz  d. ww' into {a: xx, ...}."""
    parts = re.split(r"(?:^|\s)([abcd])\.\s*", line)
    opts = {}
    for i in range(1, len(parts) - 1, 2):
        letter, val = parts[i], parts[i + 1].strip()
        # values may carry page-footer junk on the same physical line
        for marker in ("ست ت واژگان", "پاسخنامه", "بخش", "واژگان \"درس"):
            j = val.find(marker)
            if j > 0:
                val = val[:j].strip()
        val = val.rstrip("() ").strip()
        if letter not in opts and val:
            opts[letter] = val
    return opts

def parse_questions(page_nums):
    """Parse numbered MCQs; options a-d (all four usually share one line)."""
    raw = "\n".join(pages[n] for n in page_nums)
    lines = raw.split("\n")
    items = []
    cur = None
    for ln in lines:
        t = ln.strip()
        if not t or t.isdigit() or "جزوه" in t or "Vision" in t or "تألی" in t:
            continue
        qm = re.match(r"^(\d{1,2})\s*\.\s*(.*)$", t)
        om = re.match(r"^([abcd])\s*\.\s*(.*)$", t)
        if qm and int(qm.group(1)) <= 50 and not om:
            if cur and cur.get("options"):
                items.append(cur)
            cur = {"num": int(qm.group(1)), "text": qm.group(2), "options": {}}
        elif om and cur is not None:
            opts = split_options(t)
            for letter, val in opts.items():
                if letter not in cur["options"]:
                    cur["options"][letter] = val
        elif cur is not None:
            # page-footer/header guards — never append into question or options
            if re.search(r"واژگان \"درس|پاسخنامه|پایه یازدهم|Vision|جزوه|بخش", t):
                continue
            if not re.search(r"[A-Za-z\u0600-\u06FF]", t):
                continue  # punctuation-only fragments from broken page footers
            if not cur["options"]:
                # continuation of question stem (wrapped line or split dashes)
                cur["text"] += " " + t
            else:
                # wrapped option value continues into the last added option
                last = list(cur["options"])[-1]
                cur["options"][last] += " " + t
    if cur and cur.get("options"):
        items.append(cur)
    return items

vocab_items = parse_questions([19, 20])          # بخش اول: Q1-40
konkur_items = parse_questions([21])             # بخش دوم: Q1-22

# ---------- 2) parse answer keys ----------
def parse_key_gozine(page_nums):
    """Key format: N . گزینه( x ) :ترجمه تست <persian>
    Digits of the question number may be split across lines (13 -> 1\n3)."""
    keys = {}
    for n in page_nums:
        raw = pages[n]
        # Two-digit numbers are stored RTL-visual (unit digit first):
        # "10" extracts as "0\n1 . گزینه(" — reverse the pair back.
        raw = re.sub(
            r"(\d)\s*\n\s*(\d)(\s*\n?\s*\.\s*\n?\s*گزینه)",
            lambda m: m.group(2) + m.group(1) + m.group(3),
            raw,
        )
        pattern = re.compile(
            r"(\d{1,2})\s*\.\s*گزینه\s*\(\s*([abcd])\s*\)\s*:?\s*ترجمه\s*تست\s*(.*?)(?=\d{1,2}\s*\.\s*گزینه|\Z)",
            re.S,
        )
        for m in pattern.finditer(raw):
            num = int(m.group(1))
            letter = m.group(2)
            tr = m.group(3)
            tr = re.sub(r"-{4,}", " ", tr)
            tr = re.sub(r"\s+", " ", tr).strip()
            if num not in keys:  # first occurrence wins
                keys[num] = {"letter": letter, "translation": fix_fa(tr)}
    return keys

vocab_keys = parse_key_gozine([177, 178])   # Q1-30 + Q31-40
konkur_keys = {}
kraw = pages[178]
kpos = kraw.find("پاسخنامه کلیدی")
if kpos >= 0:
    kblock = kraw[kpos:kpos + 400]
    for m in re.finditer(r"(\d{1,2})\s+([abcd])\b", kblock):
        konkur_keys[int(m.group(1))] = {"letter": m.group(2), "translation": ""}

# ---------- 3) assemble ----------
LETTER_IDX = {"a": 0, "b": 1, "c": 2, "d": 3}

def assemble(items, keys, id_prefix, category, only_from=None):
    out = []
    for it in items:
        num = it["num"]
        if only_from and num in only_from:
            continue
        if num not in keys or len(it["options"]) < 4:
            continue
        opts = [it["options"].get(l, "").strip() for l in "abcd"]
        if any(not o for o in opts):
            continue
        qtext = fix_en(it["text"])
        if "----------------" not in qtext and category != "vocab-konkuri":
            continue  # only fill-in-the-blank style
        key = keys[num]
        out.append({
            "id": f"{id_prefix}{num}",
            "category": category,
            "question": qtext,
            "options": opts,
            "answer": LETTER_IDX[key["letter"]],
            "translation": key.get("translation", ""),
        })
    return out

# vocab: keep Q21-40 (Q1-20 already in app as l1-v1..v20)
new_vocab = [q for q in assemble(vocab_items, vocab_keys, "l1-v", "vocab")
             if 21 <= int(q["id"][4:]) <= 40]
# konkur: keep Q11-22 (Q1-10 already in app as l1-k1..k10)
new_konkur = [q for q in assemble(konkur_items, konkur_keys, "l1-k", "vocab-konkuri")
              if 11 <= int(q["id"][4:]) <= 22]

# diagnostics: which Q21-40 are missing and why
have_nums = {int(q["id"][4:]) for q in new_vocab}
missing = [n for n in range(21, 41) if n not in have_nums]
if missing:
    print("missing vocab:", missing)
    for it in vocab_items:
        if it["num"] in missing:
            print(f"  Q{it['num']}: opts={list(it['options'])} text={it['text'][:60]!r}")
    for n in missing:
        print(f"  key[{n}]:", vocab_keys.get(n))

result = {"newVocab": new_vocab, "newKonkur": new_konkur}
json.dump(result, open(OUT, "w"), ensure_ascii=False, indent=1)
print(f"vocab new: {len(new_vocab)} (want 20)")
print(f"konkur new: {len(new_konkur)} (want 12)")
print("sample vocab:", json.dumps(new_vocab[0], ensure_ascii=False)[:300] if new_vocab else "NONE")
print("sample konkur:", json.dumps(new_konkur[0], ensure_ascii=False)[:300] if new_konkur else "NONE")
