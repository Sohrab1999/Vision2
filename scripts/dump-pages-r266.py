#!/usr/bin/env python3
"""Dump specific pages of grade11 corpus for inspection (r266)."""
import json, sys

with open("content-extracts/grade11.json", encoding="utf-8") as f:
    doc = json.load(f)

pages = doc["pages"]
print("PAGES:", len(pages), "first entry keys:", list(pages[0].keys()))

want = [int(x) for x in sys.argv[1:]] or [36, 37, 38, 39, 40, 41, 42]
for p in pages:
    pn = p.get("n")
    if pn in want:
        print(f"\n===== PAGE {pn} =====")
        print(p.get("text", "")[:2800])
