#!/usr/bin/env python3
"""probe-g12-keys-r274.py — کاوش شبکهٔ کلید و ترجمهٔ سریع c14/c15 + تشخیص گرامری بودن سؤال‌ها"""
import fitz, json, re

ROOT = "/home/z/my-project"
G12 = f"{ROOT}/public/jozve/g12.json"
g12 = json.load(open(G12))
ch = {c["id"]: c for c in g12["chapters"]}

for cid in ("c14", "c15"):
    secs = ch[cid]["sections"]
    print(f"===== {cid} =====")
    # sec0: ترجمهٔ سریع — ۶ خط اول + شمارش الگو
    s0 = secs[0]["lines"]
    print(f"sec0 ({len(s0)} lines) first 4:")
    for ln in s0[:4]:
        print(f"   |{ln[:100]}")
    pat = re.compile(r"^[\s\u0600-\u06FF(){}\[\]\"'«»]*([a-d])[\s()\[\]]*-\s*(\d{1,3})")
    hits = [int(pat.match(l.strip()).group(2)) for l in s0 if pat.match(l.strip())]
    print(f"sec0 letter-number hits: {len(hits)} | range {min(hits) if hits else '-'}..{max(hits) if hits else '-'} | unique {len(set(hits))}")
    # همهٔ سکشن‌ها: کدام‌ها شبیه شبکهٔ کلیدند (جفت N+letter زیاد)
    for i, s in enumerate(secs):
        joined = " ".join(s["lines"])
        pairs = re.findall(r"(?<![A-Za-z\d])(\d{1,3})\s+([a-d])(?![A-Za-z])", joined)
        if len(pairs) >= 20:
            nums = [int(n) for n, _ in pairs]
            print(f"  sec{i}: {len(pairs)} pairs | nums {min(nums)}..{max(nums)} | unique {len(set(nums))}")
    print()
