#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe10 — ساقه‌های انگلیسی آیتم‌های مبهم (لنگر معنایی) + ترجمهٔ فعلی JSON"""
import json

d = json.load(open("/home/z/my-project/public/jozve/tests-g12.json"))
l3 = [l for l in d["lessons"] if l["lesson"] == 3][0]
qs = {q["n"]: q for q in l3["questions"]}
for n in (1, 2, 9, 10, 14, 20, 21, 22, 24, 25, 27, 30, 34, 40, 41, 42, 43, 46, 47, 48, 49, 54, 55, 56, 57, 58, 61, 62, 65, 66, 67, 68, 69, 70, 72, 73, 74, 75, 76, 77, 80, 81, 87, 98, 99):
    q = qs[n]
    print(f"Q{n:3d} [{q['options'][q['answer']]}]: {q['question'][:110]}")
