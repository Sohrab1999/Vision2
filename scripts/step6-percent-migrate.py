#!/usr/bin/env python3
"""Step-6 R-4: migrate scattered inline percent computations to lib/domain/percent.

One patch() call per file: all replacements first (each asserted present),
then a single import insertion after the anchor. Aliased `percentOf` for
files that declare a local `percent` variable (shadow/TDZ safety).
"""
import pathlib


def patch(path, repls, import_line, anchor):
    p = pathlib.Path(path)
    src = p.read_text()
    # idempotency: if the import already landed, assume this file is done
    if import_line in src:
        print(f"SKIP {path} (already patched)")
        return
    for old, new, *cnt in repls:
        n = cnt[0] if cnt else 1
        assert src.count(old) >= n, f"{path}: want {n}x, have {src.count(old)}x of: {old[:60]}"
        src = src.replace(old, new, n)
    assert anchor in src, f"{path}: anchor missing"
    assert import_line not in src, f"{path}: import already present"
    src = src.replace(anchor, anchor + "\n" + import_line, 1)
    p.write_text(src)
    print(f"OK {path}")


# ---- plain `percent` import sites (no local shadowing) ----
patch(
    "src/components/study/home-view.tsx",
    [
        ("const goalPercent = Math.min(100, Math.round((todayActivities / dailyGoal) * 100));",
         "const goalPercent = percent(todayActivities, dailyGoal);"),
        ("const knownPercent = Math.round((wordsKnown / l.vocabCount) * 100);",
         "const knownPercent = percent(wordsKnown, l.vocabCount);"),
    ],
    'import { percent } from "@/lib/domain/percent";',
    'import { useStudy, knownCountOfLesson, summarize, srsDueTotal, firstLessonWithDue, todayStr, mistakesOfLesson, FREEZE_CAP } from "@/lib/study-store";',
)
patch(
    "src/components/study/lesson-view.tsx",
    [("const knownPercent = Math.round((knownCount / lesson.vocabulary.length) * 100);",
      "const knownPercent = percent(knownCount, lesson.vocabulary.length);")],
    'import { percent } from "@/lib/domain/percent";',
    'import { useStudy, knownCountOfLesson, type LessonTab } from "@/lib/study-store";',
)
patch(
    "src/components/study/konkur-view.tsx",
    [
        ("coveragePct: Math.round((seenCount / examBank.length) * 100),",
         "coveragePct: percent(seenCount, examBank.length),"),
        ("masteryPct: seenCount ? Math.round((masteredCount / seenCount) * 100) : 0,",
         "masteryPct: percent(masteredCount, seenCount),"),
    ],
    'import { percent } from "@/lib/domain/percent";',
    'import { shuffle } from "@/lib/domain/shuffle";',
)
patch(
    "src/components/study/settings-popover.tsx",
    [("Math.max(4, Math.round((e.total / max) * 100))",
      "Math.max(4, percent(e.total, max))")],
    'import { percent } from "@/lib/domain/percent";',
    'import { useMounted } from "@/lib/use-mounted";',
)
patch(
    "src/components/study/daily-quests.tsx",
    [("const overallPct = Math.round((doneCount / quests.length) * 100);",
      "const overallPct = percent(doneCount, quests.length);")],
    'import { percent } from "@/lib/domain/percent";',
    'import { useStudy, firstLessonWithDue, todayStr, type DayStat } from "@/lib/study-store";',
)
patch(
    "src/lib/duel-standings.ts",
    [("winRate: c.wins + c.losses > 0 ? Math.round((c.wins / (c.wins + c.losses)) * 100) : 0,",
      "winRate: percent(c.wins, c.wins + c.losses),")],
    'import { percent } from "@/lib/domain/percent";',
    'export interface DuelAttemptLike {',
)
patch(
    "src/lib/grammar-progress.ts",
    [
        ("return { green, total, percent: Math.round((green / total) * 100) };",
         "return { green, total, percent: percent(green, total) };"),
        ("return { green, total, percent: total ? Math.round((green / total) * 100) : 0 };",
         "return { green, total, percent: percent(green, total) };"),
    ],
    'import { percent } from "@/lib/domain/percent";',
    'import { lessons } from "@/data";',
)
patch(
    "src/lib/grammar-lesson.ts",
    [("return Math.round((correct / total) * 100);", "return percent(correct, total);")],
    'import { percent } from "@/lib/domain/percent";',
    'import { GRAMMAR_LINES } from "@/data/grammar-map";',
)
patch(
    "src/lib/persist/schema.ts",
    [("percent: Math.round((correct / total) * 100),", "percent: percent(correct, total),")],
    'import { percent } from "@/lib/domain/percent";',
    'import type { QuizResult } from "@/lib/study-types";',
)
patch(
    "src/lib/daily-quests.ts",
    [("pct: Math.min(100, Math.round((value / def.target) * 100))",
      "pct: percent(value, def.target)")],
    'import { percent } from "@/lib/domain/percent";',
    'import { emptyDayStat, todayStr } from "./study-store";',
)

# ---- aliased `percentOf` sites (local `percent` variables would shadow) ----
patch(
    "src/components/study/quiz-engine.tsx",
    [
        ("const percent = Math.round((correct / total) * 100);",
         "const percent = percentOf(correct, total);"),
        ("const percent = Math.round((correctCount / total) * 100);",
         "const percent = percentOf(correctCount, total);"),
        ("faNum(Math.round((g.correct / g.total) * 100))", "faNum(percentOf(g.correct, g.total))"),
        ("const pct = Math.round((g.correct / g.total) * 100);",
         "const pct = percentOf(g.correct, g.total);"),
    ],
    'import { percent as percentOf } from "@/lib/domain/percent";',
    'import { useStudy } from "@/lib/study-store";',
)
patch(
    "src/components/study/listen-view.tsx",
    [("const percent = Math.round((correct / total) * 100);",
      "const percent = percentOf(correct, total);", 2)],
    'import { percent as percentOf } from "@/lib/domain/percent";',
    'import { useStudy, resultKey, wordKey } from "@/lib/study-store";',
)
patch(
    "src/components/study/dictation-tab.tsx",
    [("const percent = Math.round((finalScore / total) * 100);",
      "const percent = percentOf(finalScore, total);"),
     ("const percent = Math.round((score / total) * 100);",
      "const percent = percentOf(score, total);")],
    'import { percent as percentOf } from "@/lib/domain/percent";',
    'import { shuffle } from "@/lib/domain/shuffle";',
)
patch(
    "src/components/study/duel-view.tsx",
    [("const percent = end.total > 0 ? Math.round((mine.correct / end.total) * 100) : 0;",
      "const percent = percentOf(mine.correct, end.total);")],
    'import { percent as percentOf } from "@/lib/domain/percent";',
    'import { useStudy, questionSourceLesson } from "@/lib/study-store";',
)
patch(
    "src/components/study/vocab-donut.tsx",
    [("const percent = Math.round((knownTotal / totalVocabulary) * 100);",
      "const percent = percentOf(knownTotal, totalVocabulary);"),
     ("a.total ? Math.round((a.count / a.total) * 100) : 0",
      "percentOf(a.count, a.total)")],
    'import { percent as percentOf } from "@/lib/domain/percent";',
    'import { useStudy, knownCountOfLesson } from "@/lib/study-store";',
)
patch(
    "src/components/study/writing-tab.tsx",
    [("const percent = Math.round((correctCount / lesson.writing.length) * 100);",
      "const percent = percentOf(correctCount, lesson.writing.length);", 2)],
    'import { percent as percentOf } from "@/lib/domain/percent";',
    'import { shuffle } from "@/lib/domain/shuffle";',
)

print("done")
