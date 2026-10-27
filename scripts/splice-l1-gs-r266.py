#!/usr/bin/env python3
"""r266: splice the 60 lesson-1 grammar-summary tests (jozve pp.36-39, key p.182) into lesson1.ts and sync lesson-meta.ts."""
import re, sys

ROOT = "/home/z/my-project"
L1 = f"{ROOT}/src/data/lesson1.ts"
BLOCK = f"{ROOT}/scripts/l1-gs-block-r266.txt"
META = f"{ROOT}/src/data/lesson-meta.ts"

src = open(L1, encoding="utf-8").read()
block = open(BLOCK, encoding="utf-8").read().strip()

# --- guards ---
if "l1-gs1" in src:
    sys.exit("ABORT: l1-gs1 already present — splicing twice?")
ids = re.findall(r'Q\("(l1-gs\d+)"', block)
assert len(ids) == 60, f"expected 60 ids, got {len(ids)}"
assert len(set(ids)) == 60, "duplicate ids in block"
# every line must be a complete Q(...) — balanced quotes per line sanity
for ln in block.splitlines():
    s = ln.strip()
    if not s:
        continue
    assert s.startswith('Q("l1-gs') and s.endswith('),'), f"bad line: {s[:60]}..."

anchor = 'Q("l1-g20"'
i = src.find(anchor)
assert i != -1, "l1-g20 anchor not found"
eol = src.find("\n", i)
assert eol != -1

section = "\n  // ---------------- جمع‌بندی گرامر و نگارش (۶۰ تست — جزوه ص۳۶-۳۹، کلید ص۱۸۲) ----------------\n  "
insertion = eol + 1
new_src = src[:insertion] + section + block.replace("\n", "\n  ") + "\n" + src[insertion:]
open(L1, "w", encoding="utf-8").write(new_src)
print(f"lesson1.ts: spliced 60 tests after l1-g20 (file now {len(new_src)} chars)")

# --- lesson-meta sync ---
meta = open(META, encoding="utf-8").read()
repl = [
    ("quizCount: 82,", "quizCount: 142,"),
    ("export const LESSON_QUIZ_COUNT = 162;", "export const LESSON_QUIZ_COUNT = 222;"),
    ("export const TOTAL_QUESTIONS = LESSON_QUIZ_COUNT + EXAM_BANK_SIZE; // 522",
     "export const TOTAL_QUESTIONS = LESSON_QUIZ_COUNT + EXAM_BANK_SIZE; // 582"),
]
for old, new in repl:
    assert meta.count(old) == 1, f"meta anchor not unique: {old}"
    meta = meta.replace(old, new)
open(META, "w", encoding="utf-8").write(meta)
print("lesson-meta.ts: quizCount 82->142, LESSON_QUIZ_COUNT 162->222, TOTAL 522->582")

# --- final count check ---
n_grammar = len(re.findall(r'"grammar",', new_src))
total_q = len(re.findall(r'^\s*Q\("l1-', new_src, re.M))
print(f"lesson1 quizzes total={total_q} (expect 142), grammar lines={n_grammar} (expect 80)")
