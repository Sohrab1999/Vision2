#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Task 91 repair — the first pass (regroup-11.2-r91.py) moved 54 files and rewrote
specs whose targets STAYED, but spec→file resolution omitted extensions, so every
spec pointing at a MOVED target (and every bare alias) is dangling. This pass:
  ① alias "@/components/study/<bare>" where <bare> is a moved module → new folder
  ② relative specs that fail to resolve from the importer's CURRENT dir →
     re-resolve via basename → recompute from current dir
Specs that already resolve are left alone (they are the correct first-pass rewrites).
"""
import os, re, sys

ROOT = "/home/z/my-project"
STUDY = os.path.join(ROOT, "src/components/study")
FOLDERS = ("shell", "lesson", "practice", "exam", "grammar", "duel", "home",
           "profile", "quiz", "reports", "shared")

def resolve(base_noext):
    for ext in (".tsx", ".ts"):
        p = base_noext + ext
        if os.path.isfile(p):
            return p
    for ext in (".tsx", ".ts"):
        p = os.path.join(base_noext, "index" + ext)
        if os.path.isfile(p):
            return p
    return None

# basename(no ext) → current absolute path, for every module in the study tree
by_base = {}
for dirpath, _dirs, files in os.walk(STUDY):
    for fn in files:
        if fn.endswith((".tsx", ".ts")) and not fn.startswith("index."):
            by_base[fn.rsplit(".", 1)[0]] = os.path.join(dirpath, fn)

ALIAS_PREFIX = "@/components/study/"
SPEC_PATTERNS = [
    re.compile(r'(\bfrom\s*)(["\'])([^"\']+)\2'),
    re.compile(r'(\bimport\(\s*)(["\'])([^"\']+)\2(\s*\))'),
    re.compile(r'(\bimport\s+)(["\'])([^"\']+)\2'),
]

def new_spec(spec, importer):
    if spec.startswith(ALIAS_PREFIX):
        rest = spec[len(ALIAS_PREFIX):]
        if "/" in rest:
            return None  # foldered alias — already correct
        cur = by_base.get(rest)
        if cur is None:
            sys.exit(f"FATAL: alias target unknown: {rest}")
        rel = os.path.relpath(cur, STUDY)
        return None if rel == rest else ALIAS_PREFIX + rel
    if spec.startswith("./") or spec.startswith("../"):
        base = os.path.dirname(importer)
        if resolve(os.path.normpath(os.path.join(base, spec))):
            return None  # resolves — first pass already handled it
        stem = spec.rstrip("/").rsplit("/", 1)[-1]
        cur = by_base.get(stem)
        if cur is None:
            return None  # not a study module (e.g. ../lib style) — leave for tsc to judge
        rel = os.path.relpath(cur, base)
        return rel if rel.startswith(".") else "./" + rel
    return None

changed = {}
for top in ("src", "tests", "app"):
    for dirpath, _dirs, files in os.walk(os.path.join(ROOT, top)):
        for fn in files:
            if not fn.endswith((".ts", ".tsx")):
                continue
            path = os.path.join(dirpath, fn)
            with open(path, "r", encoding="utf-8") as f:
                src = f.read()
            n = 0
            def sub(m):
                global n
                head, quote, spec = m.group(1), m.group(2), m.group(3)
                tail = m.group(4) if m.lastindex == 4 else ""
                ns = new_spec(spec, path)
                if ns is None or ns == spec:
                    return m.group(0)
                n += 1
                return f"{head}{quote}{ns}{quote}{tail}"
            out = SPEC_PATTERNS[0].sub(sub, src)
            out = SPEC_PATTERNS[1].sub(sub, out)
            out = SPEC_PATTERNS[2].sub(sub, out)
            if n:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(out)
                changed[os.path.relpath(path, ROOT)] = n

print(f"repair rewrites: {sum(changed.values())} in {len(changed)} files")
for f in sorted(changed, key=lambda x: -changed[x])[:20]:
    print(f"  {changed[f]:3d}  {f}")
