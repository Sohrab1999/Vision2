#!/bin/bash
# r266 round-end: english commit + push attempt
cd /home/z/my-project
git add src/data/lesson1.ts src/data/lesson-meta.ts JOZVE-EXTRACTION-STATUS.md scripts/l1-gs-block-r266.txt scripts/splice-l1-gs-r266.py scripts/dump-pages-r266.py
git commit -m "feat: complete lesson-1 grammar-summary extraction — the jozve's 60-question 'Grammar & Writing summary' section (pp.36-39) is now fully in the app as l1-gs1..gs60 with the RTL-column answer key (p.182) decoded programmatically and a hand-authored Persian grammar-point explanation per question in the style of l1-g1..g20; lesson-1 quiz total rises 82->142 (grammar group 20->80), lesson-meta synced (LESSON_QUIZ_COUNT 222, TOTAL_QUESTIONS 582); splicer guards against double-splice and validates id uniqueness/completeness; E2E verified in browser: home chip 'more than 582 tests', lesson-1 tests tab header 142, mixed button 'all 142 tests', grammar session runs 80 questions, new gs question renders, correct answer accepted with Persian explanation shown (/tmp/qa-r266-gs-question.png); comprehensive descriptive exam (pp.40-42, key p.183) scoped in JOZVE-EXTRACTION-STATUS.md for next rounds (5 MCQ-able sections vs 8 productive worksheet sections); tsc=0 lint=0 full suite 1476/1476, DB CLEAN-OK" 2>&1 | tail -3
git log --oneline -1
echo "---PUSH ATTEMPT---"
timeout 40 git push origin main 2>&1 | head -3
echo "PUSH_EXIT: $?"
