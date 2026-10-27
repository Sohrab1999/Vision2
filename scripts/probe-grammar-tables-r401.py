#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r401 probe: survey line-grouped grammar tables (en-line + fa-line pairs) in g10-g12 jozve docs.

A "candidate table" = a run of consecutive lines inside a grammar/notes/answer/etc. section
where lines alternate: an English-mostly line (>=2 latin word tokens) followed by a
Persian-mostly line. We report every run with >=2 pairs so the human/LLM can decide
which are real two-column tables worth pairing.
"""
import json
import re
import sys

FA = re.compile(r'[\u0600-\u06FF]')
EN_WORD = re.compile(r"[A-Za-z']+(?:[ /-][A-Za-z']+)*")


def mostly_en(s: str) -> bool:
    fa = len(FA.findall(s))
    en_words = re.findall(r"[A-Za-z']+", s)
    return bool(en_words) and fa <= max(1, len(en_words) // 4)


def mostly_fa(s: str) -> bool:
    return len(FA.findall(s)) >= 2 and not mostly_en(s)


def en_words(s: str):
    return re.findall(r"[A-Za-z']+", s)


def scan(grade: str):
    doc = json.load(open(f'public/jozve/{grade}.json'))
    findings = []
    for ci, ch in enumerate(doc['chapters']):
        for si, sec in enumerate(ch.get('sections', [])):
            lines = sec.get('lines', [])
            i = 0
            while i < len(lines) - 1:
                if mostly_en(lines[i]) and mostly_fa(lines[i + 1]) and len(en_words(lines[i])) >= 2:
                    # try to build a run of alternating pairs
                    start = i
                    pairs = []
                    while i + 1 < len(lines) and mostly_en(lines[i]) and mostly_fa(lines[i + 1]) and len(en_words(lines[i])) >= 2:
                        pairs.append((lines[i], lines[i + 1]))
                        i += 2
                    if len(pairs) >= 2:
                        findings.append({
                            'chapter': ci, 'section': si, 'type': sec['type'],
                            'title': sec['title'][:60],
                            'pairs': pairs,
                        })
                else:
                    i += 1
    return findings


for grade in ['g10', 'g11', 'g12']:
    f = scan(grade)
    total_pairs = sum(len(x['pairs']) for x in f)
    print(f"\n===== {grade}: {len(f)} candidate tables, {total_pairs} line-pairs =====")
    for x in f:
        print(f"\n-- ch{x['chapter']} sec{x['section']} [{x['type']}] {x['title']} ({len(x['pairs'])} pairs)")
        for en, fa in x['pairs'][:4]:
            print(f"   EN| {en[:90]}")
            print(f"   FA| {fa[:90]}")
        if len(x['pairs']) > 4:
            print('   ...')
