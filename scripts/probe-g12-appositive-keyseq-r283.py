#!/usr/bin/env python3
"""probe-g12-appositive-keyseq-r283.py — ترتیب خام کلیدهای توضیحی بانک کنکوری ص۱۸۹-۱۹۱"""
import re

ROOT = "/home/z/my-project"
TXT = f"{ROOT}/booklet-extract/g12.txt"

raw = open(TXT, encoding="utf-8").read()
pages = {}
for m in re.finditer(r"<<<PAGE (\d+)>>>\n", raw):
    start = m.end()
    nxt = re.search(r"<<<PAGE \d+>>>\n", raw[start:])
    end = start + nxt.start() if nxt else len(raw)
    pages[int(m.group(1))] = raw[start:end]

# پیوستِ صفحات ۱۸۹-۱۹۱ و جست‌وجوی جفت (شماره، گزینه)
joined = "\n".join(pages[p] for p in (189, 190, 191))
lines = [l.strip() for l in joined.split("\n")]
lines = [l for l in lines if l and l != "-" * 71 and l != "-" * 73]

events = []
for i, l in enumerate(lines):
    # شمارهٔ تنها (مارکر سؤال)
    m_num = re.fullmatch(r"(\d{1,2})", l)
    m_dash_num = re.fullmatch(r"(\d{1,2})\s*-?", l)
    if m_num or m_dash_num:
        n = int((m_num or m_dash_num).group(1))
        # جست‌وجوی گزینه در ۶ خط بعد
        for j in range(1, 7):
            if i + j >= len(lines):
                break
            nxt_line = lines[i + j]
            m_opt = re.search(r"گزینه\s*\(?([a-d])\)?", nxt_line)
            if m_opt:
                events.append((n, m_opt.group(1), i, j, nxt_line[:60]))
                break
            # اگر بین شماره و گزینه خطِ توضیحِ غیرمرتبط آمد، ادامه بده ولی محدود
            if j > 3 and not re.search(r"گزینه|[\u0600-\u06FF]", nxt_line):
                break

print("EVENTS (n, letter, line_idx, offset, context):")
for e in events:
    print(f"  Q{e[0]:2d} → {e[1]}   (line {e[2]}, +{e[3]})  ctx: {e[4]!r}")

# چک‌پوش معنایی tag questions — بانک B ص۴۵
print("\nSEMANTIC SPOT-CHECKS (manual expectations from question design):")
print("  B-Q1 base 'Jane believes' → does+she, neg → doesn't she = d")
print("  B-Q2 base 'his explanation mustn't be true' → must it = c")
print("  B-Q3 base 'It is a fact' → isn't it = b")
print("  B-Q5 'Her uncle said that he had to...' base = main clause past 'said' → didn't he = d")
print("  B-Q6 'Let's take...' → shall we = c")
print("  B-Q7 'Their aunt ..., didn't she?' → fill: ordered = d")
print("  B-Q8 'I think that you never promised...' base I think → don't... wait: neg never in sub → main pos → don't you... options a) did you b) didn't you c) wouldn't it d) would it → hmm: think-transfer → sub never promised → positive tag 'did you' = a")
print("  B-Q13 'If my parents had free time, they would come...' → wouldn't they = c")
print("  B-Q14 'If you can't access..., you have to call...' → have to: positive 'don't you' = d")
print("  B-Q15 'I think that none of us can eat...' think+none(neg sub) → don't I = a")
