#!/usr/bin/env python3
# Task 172 — contrast contract fixes, consolidated & idempotent.
# Discovered via LIVE DOM audit (contrast-discover-r172.sh) against the
# task-171 tree; every replacement is pattern-anchored and safe to re-run:
#   applied  = pattern found and replaced
#   skipped  = pattern already applied (or file absent)
# Run AFTER restoring the repo to origin/main (post-snapshot-recovery).
# Fixture list of files this round touches (missing file => reported, not fatal).
import os, re, sys

ROOT = "/home/z/my-project"

# (file, [(old, new), ...])
EDITS = [
    # --- duel hero: rose-500 end + translucent white chips -> black scrims + label floors
    ("src/components/study/duel/duel-setup.tsx", [
        ("from-violet-600 via-fuchsia-600 to-rose-500", "from-violet-600 via-fuchsia-600 to-rose-600"),
        ("border border-white/30 bg-white/15 px-3 py-1", "border border-white/25 bg-black/25 px-3 py-1"),
        ("border border-white/25 bg-white/15 px-4 py-2", "border border-white/25 bg-black/25 px-4 py-2"),
        ("border border-white/25 bg-white/10 p-4", "border border-white/25 bg-black/25 p-4"),
        ("text-[13.5px] leading-7 text-white/85", "text-[13.5px] leading-7 text-white/95"),
        ("text-[12px] leading-6 text-white/80", "text-[12px] leading-6 text-white/90"),
        ("text-[10.5px] leading-4 text-white/70", "text-[10.5px] leading-4 text-white/90"),
        ("text-[11px] font-bold text-white/75", "text-[11px] font-bold text-white/90"),
        ("text-[11.5px] font-bold text-white/75", "text-[11.5px] font-bold text-white/90"),
        ("text-[12px] font-bold text-white/60", "text-[12px] font-bold text-white/80"),
        ('"border border-white/25 bg-white/10 text-white/85 hover:bg-white/20"',
         '"border border-white/25 bg-black/25 text-white/90 hover:bg-black/35"'),
    ]),
    # --- konkur hero: red/orange/amber -> 700 family; KPI tiles -> black/25; floors
    ("src/components/study/exam/konkur-view.tsx", [
        ("from-red-600 via-orange-500 to-amber-500", "from-red-700 via-orange-700 to-amber-700"),
        ("from-amber-500 to-orange-600 py-3.5", "from-amber-700 to-orange-700 py-3.5"),
        ("rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm", "rounded-xl bg-black/25 px-3 py-2.5 backdrop-blur-sm"),
        ("text-[11px] font-black text-white/85", "text-[11px] font-black text-white/95"),
        ("text-[10.5px] font-bold text-white/70", "text-[10.5px] font-bold text-white/90"),
    ]),
    # --- report band: emerald/teal -> 700/800 family; opacity floors
    ("src/components/study/reports/report-card.tsx", [
        ("from-emerald-700 via-emerald-600 to-teal-500 px-5", "from-emerald-800 via-emerald-700 to-teal-700 px-5"),
        ("gap-1.5 text-[10.5px] font-bold opacity-80", "gap-1.5 text-[10.5px] font-bold opacity-95"),
        ("text-[12px] leading-5 opacity-90", "text-[12px] leading-5 opacity-95"),
        ("border-dashed border-white/50 text-center text-[8px] font-black leading-3 opacity-80",
         "border-dashed border-white/60 text-center text-[8px] font-black leading-3 opacity-100"),
    ]),
    # --- metro line solids: white-text surfaces -> 600/700 family
    ("src/lib/grammar-theme.ts", [
        ('solid: "bg-emerald-600"', 'solid: "bg-emerald-700"'),
        ('solid: "bg-amber-500"', 'solid: "bg-amber-700"'),
        ('solid: "bg-teal-600"', 'solid: "bg-teal-700"'),
        ('solid: "bg-rose-500"', 'solid: "bg-rose-600"'),
        ('solid: "bg-orange-500"', 'solid: "bg-orange-700"'),
    ]),
    # --- lesson CTA map: one step deeper (white text 14px bold)
    ("src/lib/study-theme.ts", [
        ('bg: "bg-emerald-600"', 'bg: "bg-emerald-700"'),
        ('bg: "bg-amber-500"', 'bg: "bg-amber-700"'),
        ('bg: "bg-rose-500"', 'bg: "bg-rose-600"'),
    ]),
    # --- gmetro hero: teal-600 start -> 700; steps -> black/20; teal-100 -> teal-50
    ("src/components/study/grammar/grammar-view.tsx", [
        ("from-teal-600 via-teal-700 to-emerald-800", "from-teal-700 via-teal-800 to-emerald-900"),
        ("gmetro-step rounded-xl bg-white/10", "gmetro-step rounded-xl bg-black/20"),
        ("text-[13px] leading-6 text-teal-100", "text-[13px] leading-6 text-teal-50"),
        ("bg-white/15 px-3 py-1.5", "bg-black/20 px-3 py-1.5"),
    ]),
    # --- exam: amber gradient badge+CTA -> 700 family
    ("src/components/study/exam/exam-view.tsx", [
        ("bg-gradient-to-l from-amber-500 to-orange-600", "bg-gradient-to-l from-amber-700 to-orange-700"),
        ("w-full rounded-xl bg-emerald-600 py-3.5 text-[15px]", "w-full rounded-xl bg-emerald-700 py-3.5 text-[15px]"),
        ('shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5', 'shrink-0 rounded-xl bg-emerald-700 px-4 py-2.5'),
    ]),
    # --- home hero: clip-text end teal-500 -> teal-700 (large-text 3:1); book face deeper
    ("src/components/study/home/home-hero.tsx", [
        ("from-emerald-700 via-emerald-600 to-teal-500 bg-clip-text", "from-emerald-700 via-emerald-700 to-teal-700 bg-clip-text"),
        ("from-emerald-600 via-emerald-700 to-emerald-900", "from-emerald-700 via-emerald-800 to-emerald-900"),
    ]),
    # --- home banners chip: warm-solid rule -> dark text on orange
    ("src/components/study/home/home-banners.tsx", [
        ("bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white",
         "bg-orange-500 px-2 py-0.5 text-[10px] font-black text-stone-900"),
    ]),
    # --- smart practice: violet chip + emerald CTA
    ("src/components/study/practice/smart-practice-view.tsx", [
        ("bg-violet-500 px-2.5", "bg-violet-600 px-2.5"),
        ("bg-emerald-600 py-3.5", "bg-emerald-700 py-3.5"),
    ]),
    # --- dictionary: active count badge scrim; inactive chip text one step
    ("src/components/study/lesson/dictionary-view.tsx", [
        ('stateFilter === c.id ? "bg-white/25" : "bg-stone-200/80 text-stone-500"',
         'stateFilter === c.id ? "bg-black/25" : "bg-stone-200/80 text-stone-600"'),
    ]),
    # --- teacher CTA gradients (violet-500 start 4.16 marginal)
    ("src/components/study/reports/week-teacher.tsx", [
        ("from-violet-500 to-fuchsia-600", "from-violet-600 to-fuchsia-700"),
    ]),
    ("src/components/study/quiz/quiz-teacher.tsx", [
        ("from-violet-500 to-fuchsia-600", "from-violet-600 to-fuchsia-700"),
    ]),
    # --- my-words sort chip: warm-solid rule (dark on amber keeps the yellow)
    ("src/components/study/practice/my-words.tsx", [
        ('sort === m.id ? "bg-amber-500 text-white"', 'sort === m.id ? "bg-amber-500 text-stone-900"'),
    ]),
    # --- story speaking chip: sky-500 -> sky-700 (white 12px bold)
    ("src/components/study/practice/my-words-story.tsx", [
        ('"border-sky-400 bg-sky-500 text-white"', '"border-sky-400 bg-sky-700 text-white"'),
    ]),
]

def apply():
    stats = {"applied": 0, "skipped": 0, "missing_file": 0}
    for rel, pairs in EDITS:
        p = os.path.join(ROOT, rel)
        if not os.path.exists(p):
            print(f"MISSING-FILE {rel}")
            stats["missing_file"] += 1
            continue
        s = open(p, encoding="utf-8").read()
        changed = 0
        for old, new in pairs:
            if new in s and old not in s:
                stats["skipped"] += 1
                continue
            n = s.count(old)
            if n:
                s = s.replace(old, new)
                changed += n
                stats["applied"] += n
            else:
                print(f"  ?? no-hit {rel}: {old[:60]}")
        if changed:
            open(p, "w", encoding="utf-8").write(s)
            print(f"OK {rel}: {changed} replacement(s)")
        else:
            print(f"-- {rel}: nothing to do")
    print(json.dumps(stats) if False else f"TOTAL applied={stats['applied']} skipped={stats['skipped']} missing={stats['missing_file']}")

# --- estate migration: text-stone-400 -> text-stone-500 (readable text; the
#     @theme darkening of stone-500 below carries it over 4.5:1 on white)
def migrate_stone():
    n_files = n_hits = 0
    for dirpath, _, files in os.walk(os.path.join(ROOT, "src")):
        for f in files:
            if not f.endswith(".tsx"):
                continue
            p = os.path.join(dirpath, f)
            s = open(p, encoding="utf-8").read()
            n = len(re.findall(r"\btext-stone-400\b", s))
            if n:
                s = re.sub(r"\btext-stone-400\b", "text-stone-500", s)
                open(p, "w", encoding="utf-8").write(s)
                n_files += 1
                n_hits += n
    print(f"STONE-MIGRATION: {n_hits} occurrence(s) in {n_files} file(s)")

# --- @theme: darken stone-500 in LIGHT mode so the migrated muted-text
#     family clears 4.5:1 on white (oklch 55.3% -> 52% ~= 4.43 -> ~5.5),
#     with the .dark kernel restoring the Tailwind default for dark mode.
def theme_stone():
    p = os.path.join(ROOT, "src/app/globals.css")
    s = open(p, encoding="utf-8").read()
    mark = "--color-white: #fff;"
    if "--color-stone-500: oklch(52%" in s:
        print("-- globals: theme override already present")
    elif mark in s:
        s = s.replace(
            mark,
            mark
            + "\n  /* r172 contrast contract: light-mode stone-500 darkened one step so\n"
              "     the muted-text family (incl. the estate-wide text-stone-400 ->\n"
              "     text-stone-500 migration) clears WCAG 4.5:1 on white/stone-50.\n"
              "     Dark mode restores the stock tone in the .dark kernel below —\n"
              "     per-panel .dark ink-tone canonical groups still override it. */\n"
              "  --color-stone-500: oklch(52% 0.013 58.071);",
            1,
        )
        open(p, "w", encoding="utf-8").write(s)
        print("OK globals: @theme stone-500 -> oklch(52% ...)")
    else:
        print("?? globals: @theme anchor not found")
    # .dark kernel restore
    if "--color-stone-500: oklch(55.3%" in s:
        print("-- globals: .dark restore already present")
        return
    m = re.search(r"^\.dark \{\n", s, re.M)
    if m:
        s = s[: m.end()] + "  /* r172: stock stone-500 back for dark (the @theme 52% override is light-only) */\n  --color-stone-500: oklch(55.3% 0.013 58.071);\n" + s[m.end():]
        open(p, "w", encoding="utf-8").write(s)
        print("OK globals: .dark kernel restores stock stone-500")
    else:
        print("?? globals: .dark kernel not found")



if __name__ == "__main__":
    apply()
    migrate_stone()
    theme_stone()
