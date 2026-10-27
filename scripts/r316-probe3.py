#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r316 probe3 — تطبیق «۱۰۰ تست واژگان درس ۳» با مانیفست + شمارش کامل کارت‌ها"""
import json, re

m = json.load(open("/home/z/my-project/public/jozve/grammar-g12-topic.json"))
print("=== banks with source.pages near 132-136 or vocab in title ===")
for les in m["lessons"]:
    qs = les.get("questions", [])
    src = les.get("source", {})
    title = les.get("title", "")
    if any(k in title for k in ["واژگان", "واژه", "vocab"]) or (
        isinstance(src.get("pages"), (list, tuple)) and any(120 <= p <= 145 for p in src["pages"])
    ) or (isinstance(src.get("pages"), int) and 120 <= src["pages"] <= 145):
        print(f"  l{les['lesson']}: {title[:70]} -> {len(qs)} items | source={json.dumps(src, ensure_ascii=False)[:160]}")

print("\n=== ALL g12-topic banks (l, count, title) ===")
total = 0
for les in m["lessons"]:
    n = len(les.get("questions", []))
    total += n
    print(f"  l{les['lesson']}: {n:3d} | {les.get('title','')[:66]}")
print(f"TOTAL: {total} in {len(m['lessons'])} banks")
