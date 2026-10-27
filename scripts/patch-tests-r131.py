#!/usr/bin/env python3
"""Task 131 — add nameDraft/setNameDraft props to every DuelSetup render in tests."""
import re, pathlib

JSX_FILES = [
    "tests/duel-setup-share-native.component.test.tsx",
    "tests/duel-entry-ticket.component.test.tsx",
    "tests/duel-setup-think-chip.component.test.tsx",
    "tests/duel-setup-shield.component.test.tsx",
    "tests/duel-ledger-sort.component.test.tsx",
    "tests/duel-ledger-export.component.test.tsx",
    "tests/duel-ledger-filter.component.test.tsx",
]
OBJ_FILES = [
    "tests/duel-pace-setup.component.test.tsx",
]

base = pathlib.Path("/home/z/my-project")
for rel in JSX_FILES:
    p = base / rel
    t = p.read_text()
    if "nameDraft" in t:
        print(f"skip (already patched): {rel}")
        continue
    new, n = re.subn(
        r"(createBusy=\{(?:false|true|createBusy)\}\n)",
        lambda m: m.group(1) + '        nameDraft=""\n        setNameDraft={() => {}}\n',
        t,
        count=1,
    )
    if n != 1:
        print(f"PATTERN-MISS: {rel}")
        continue
    p.write_text(new)
    print(f"patched jsx: {rel}")

for rel in OBJ_FILES:
    p = base / rel
    t = p.read_text()
    if "nameDraft" in t:
        print(f"skip (already patched): {rel}")
        continue
    new, n = re.subn(
        r"(createBusy: (?:false|true),\n)",
        lambda m: m.group(1) + '  nameDraft: "",\n  setNameDraft: () => {},\n',
        t,
        count=1,
    )
    if n != 1:
        print(f"PATTERN-MISS: {rel}")
        continue
    p.write_text(new)
    print(f"patched obj: {rel}")
