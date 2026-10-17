#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe4 — کیفیت ترجمه‌های l3 tests-g12 + رسیدِ کامل source"""
import json

d = json.load(open("/home/z/my-project/public/jozve/tests-g12.json"))
l3 = [l for l in d["lessons"] if l["lesson"] == 3][0]
print("=== l3 FULL source ===")
print(json.dumps(l3.get("source", {}), ensure_ascii=False, indent=1))
print("\n=== top answerArbitration ===")
print(json.dumps(d.get("answerArbitration", {}), ensure_ascii=False)[:600])

# آیتم‌های بدون ترجمه یا ترجمهٔ مشکوک
qs = l3["questions"]
print(f"\n=== translations coverage: {sum(1 for q in qs if q.get('translation'))}/{len(qs)} ===")
no_tr = [q["n"] for q in qs if not q.get("translation")]
print("without translation:", no_tr)

# چند نمونه برای سنجشِ کیفیت (با چاپِ ص۲۱۵-۲۱۹)
for n in (1, 2, 9, 32, 38, 60, 75, 100):
    q = qs[n-1]
    print(f"\nQ{n} [{q['options'][q['answer']]}]: {q['question'][:80]}")
    print(f"   TR: {q.get('translation','—')[:150]}")
