#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Task 91 repair pass 2 — strip .tsx/.ts from import specifiers (codebase
convention is extensionless; allowImportingTsExtensions is off)."""
import os, re

ROOT = "/home/z/my-project"
PAT = re.compile(r'((?:from\s+|import\(\s*)["\']((?:\.\.?|@/)[^"\']*?)\.(?:tsx|ts)(["\']))')

n_total, files = 0, []
for top in ("src", "tests", "app"):
    for dirpath, _dirs, fns in os.walk(os.path.join(ROOT, top)):
        for fn in fns:
            if not fn.endswith((".ts", ".tsx")):
                continue
            p = os.path.join(dirpath, fn)
            with open(p, "r", encoding="utf-8") as f:
                src = f.read()
            out, n = PAT.subn(lambda m: f'{m.group(0)[:0]}from_placeholder', src)  # placeholder
            # simpler: manual rebuild
            out, n = 0, 0
            def _sub(m):
                global n
                n += 1
                q = m.group(0)
                # reconstruct head + spec-without-ext + quote
                head, spec, quote = m.group(1), m.group(2), m.group(3)
                return None
            # do a clean manual pass instead of the lambda mess above
            out = src
            m2 = re.compile(r'(from\s+|import\(\s*)("|\')((?:\.\.?|@/)[^"\']*?)\.(tsx|ts)(\2)')
            out, n = m2.subn(lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}{m.group(2)}", src)
            if n:
                with open(p, "w", encoding="utf-8") as f:
                    f.write(out)
                n_total += n
                files.append((os.path.relpath(p, ROOT), n))
print(f"stripped extensions: {n_total} in {len(files)} files")
for f, n in sorted(files, key=lambda x: -x[1])[:10]:
    print(f"  {n:3d}  {f}")
