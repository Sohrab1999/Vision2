#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Task 91 — Step 10 part 2: folder regroup per docs/codebase-audit.md §11.2.
54 flat files in src/components/study/ → feature folders. study-app.tsx stays root.
Rewrites: ① "@/components/study/<name>" alias imports  ② relative imports inside
the study tree (recomputed from the importer's NEW location). Subfolder modules
(home/, duel/, profile/, quiz/, shared/) stay put; only their specifiers change.
Receipt is locked by tests/component-layout.test.ts (written separately).
"""
import os, re, subprocess, sys

ROOT = "/home/z/my-project"
STUDY = os.path.join(ROOT, "src/components/study")

# ── the §11.2 receipt mapping: flat name → folder ─────────────────────────
MAPPING = {
    # shell/ — global chrome
    "command-palette": "shell", "footer": "shell", "header": "shell",
    "onboarding": "shell", "pwa-layer": "shell", "shortcut-guide": "shell",
    "theme-provider": "shell",
    # lesson/ — book content browsers + lesson tabs
    "appendix-view": "lesson", "conversation-tab": "lesson", "dictation-tab": "lesson",
    "dictionary-view": "lesson", "flashcards": "lesson", "grammar-tab": "lesson",
    "lesson-tests-tab": "lesson", "lesson-view": "lesson", "reading-tab": "lesson",
    "vocab-tab": "lesson", "word-of-day": "lesson", "writing-tab": "lesson",
    # practice/ — review/practice surfaces + status chips + targeted practice
    "badges": "practice", "daily-quests": "practice", "danger-words": "practice",
    "due-pill": "practice", "freeze-badge": "practice", "goal-chip": "practice",
    "listen-view": "practice", "my-words": "practice", "my-words-dictation": "practice",
    "my-words-flashcards": "practice", "my-words-review": "practice",
    "progress-ring": "practice", "review-view": "practice", "skill-panel": "practice",
    "smart-practice-view": "practice", "srs-panel": "practice", "vocab-donut": "practice",
    "weekly-chart": "practice",
    # exam/ — timed exam surfaces
    "exam-view": "exam", "konkur-view": "exam",
    # grammar/ — standalone grammar browser
    "grammar-lesson-flow": "grammar", "grammar-view": "grammar",
    # duel/ — arcade + competition family
    "duel-view": "duel", "leaderboard": "duel", "rush-board": "duel",
    "rush-view": "duel", "spell-rush-view": "duel",
    # reports/ — report surfaces
    "official-report": "reports", "report-card": "reports", "weekly-report": "reports",
    # shared/ — cross-cutting primitives
    "explain-box": "shared", "settings-popover": "shared", "speak-button": "shared",
    # feature-folder entries
    "home-view": "home", "quiz-engine": "quiz",
}
assert len(MAPPING) == 54, f"expected 54 moves, got {len(MAPPING)}"

def find_file(base_noext):
    """old absolute path of a module (no extension) — .tsx / .ts / index.*"""
    for ext in (".tsx", ".ts"):
        p = base_noext + ext
        if os.path.isfile(p):
            return p
    for ext in (".tsx", ".ts"):
        p = os.path.join(base_noext, "index" + ext)
        if os.path.isfile(p):
            return p
    return None

# old abs → new abs for every mapped module (must exist on disk)
moves = {}
for name, folder in MAPPING.items():
    old = find_file(os.path.join(STUDY, name))
    if not old:
        sys.exit(f"FATAL: mapped module not found on disk: {name}")
    new = os.path.join(STUDY, folder, os.path.basename(old))
    moves[os.path.normpath(old)] = new

# ── import rewriting ───────────────────────────────────────────────────────
SPEC_PATTERNS = [
    re.compile(r'(\bfrom\s*)(["\'])([^"\']+)\2'),
    re.compile(r'(\bimport\(\s*)(["\'])([^"\']+)\2(\s*\))'),
    re.compile(r'(\bimport\s+)(["\'])([^"\']+)\2'),
]
ALIAS_PREFIX = "@/components/study/"

def new_spec(spec, importer_old, importer_new):
    """return the rewritten specifier for `spec` imported by a file that used
    to live at importer_old and now lives at importer_new (None = didn't move)."""
    # ① alias into study/
    if spec.startswith(ALIAS_PREFIX):
        rest = spec[len(ALIAS_PREFIX):]
        target_old = os.path.normpath(os.path.join(STUDY, rest))
        target_new = moves.get(target_old)
        if target_new is None:
            return None  # already foldered (e.g. profile/profile-popover) — untouched
        return ALIAS_PREFIX + os.path.relpath(target_new, STUDY)
    # ② relative inside the study tree (resolve against the OLD dir)
    if spec.startswith("./") or spec.startswith("../"):
        target_old = os.path.normpath(os.path.join(os.path.dirname(importer_old), spec))
        target_new = moves.get(target_old, target_old)
        base = os.path.dirname(importer_new or importer_old)
        rel = os.path.relpath(target_new, base)
        return rel if rel.startswith(".") else "./" + rel
    return None

def rewrite_file(path):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    importer_old = os.path.normpath(path)
    importer_new = moves.get(importer_old)
    # files outside study/ (and non-moved) import via alias only — still run them
    count = 0
    def sub(m):
        nonlocal count
        head, quote, spec, tail = m.group(1), m.group(2), m.group(3), m.group(4) if m.lastindex == 4 else ""
        ns = new_spec(spec, importer_old, importer_new)
        if ns is None or ns == spec:
            return m.group(0)
        count += 1
        return f"{head}{quote}{ns}{quote}{tail}"
    out = SPEC_PATTERNS[0].sub(sub, src)
    out = SPEC_PATTERNS[1].sub(sub, out)
    out = SPEC_PATTERNS[2].sub(sub, out)
    if count:
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
    return count

# walk all ts/tsx under src/ tests/ app/
changed = {}
for top in ("src", "tests", "app"):
    for dirpath, _dirs, files in os.walk(os.path.join(ROOT, top)):
        for fn in files:
            if fn.endswith((".ts", ".tsx")):
                n = rewrite_file(os.path.join(dirpath, fn))
                if n:
                    changed[os.path.relpath(os.path.join(dirpath, fn), ROOT)] = n

# ── git mv ─────────────────────────────────────────────────────────────────
for old, new in sorted(moves.items()):
    os.makedirs(os.path.dirname(new), exist_ok=True)
    subprocess.run(["git", "mv", os.path.relpath(old, ROOT), os.path.relpath(new, ROOT)],
                   cwd=ROOT, check=True, capture_output=True)

print(f"moved: {len(moves)} files")
print(f"files with rewritten imports: {len(changed)}")
total = sum(changed.values())
print(f"total specifier rewrites: {total}")
for f in sorted(changed, key=lambda x: -changed[x])[:15]:
    print(f"  {changed[f]:3d}  {f}")
