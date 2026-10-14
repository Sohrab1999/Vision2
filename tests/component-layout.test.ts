// Step 10 part 2 (folder regroup §11.2) — Task 91 receipt guard.
// The §11.2 target tree is now ACHIEVED: src/components/study/ holds exactly
// ONE root orchestrator (study-app.tsx) + 11 feature folders. This guard pins
// the full placement map so no future file may regress to the flat root, and
// no bare "@/components/study/<name>" alias may return for a moved module.
// Run: bun run test
import { describe, it, expect } from "vitest";
import { readdirSync, existsSync, statSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const STUDY = resolve(process.cwd(), "src/components/study");

// the §11.2 receipt — every moved file at its feature-folder home
const PLACEMENT: Record<string, string> = {
  // shell/ — global chrome (header/footer/theme/pwa/onboarding/shortcuts/palette)
  "command-palette": "shell", "footer": "shell", "header": "shell",
  "onboarding": "shell", "pwa-layer": "shell", "shortcut-guide": "shell",
  "theme-provider": "shell",
  // lesson/ — book content browsers + lesson tabs
  "appendix-view": "lesson", "conversation-tab": "lesson", "dictation-tab": "lesson",
  "dictionary-view": "lesson", "flashcards": "lesson", "grammar-tab": "lesson",
  "lesson-tests-tab": "lesson", "lesson-view": "lesson", "reading-tab": "lesson",
  "vocab-tab": "lesson", "word-of-day": "lesson", "writing-tab": "lesson",
  // practice/ — review/practice surfaces, status chips, targeted practice
  "badges": "practice", "daily-quests": "practice", "danger-words": "practice",
  "due-pill": "practice", "goal-chip": "practice",
  "listen-view": "practice", "my-words": "practice", "my-words-dictation": "practice",
  "my-words-flashcards": "practice", "my-words-review": "practice",
  "progress-ring": "practice", "review-view": "practice", "skill-panel": "practice",
  "smart-practice-view": "practice", "srs-panel": "practice", "streak-badge": "practice",
  "vocab-donut": "practice",
  "weekly-chart": "practice",
  // exam/ — timed exam surfaces
  "exam-view": "exam", "konkur-view": "exam",
  // grammar/ — standalone grammar browser
  "grammar-lesson-flow": "grammar", "grammar-view": "grammar",
  // duel/ — arcade + competition family
  "duel-view": "duel", "leaderboard": "duel", "rush-board": "duel",
  "rush-view": "duel", "spell-rush-view": "duel",
  // reports/ — report surfaces
  "official-report": "reports", "report-card": "reports", "weekly-report": "reports",
  // shared/ — cross-cutting primitives
  "explain-box": "shared", "settings-popover": "shared", "speak-button": "shared",
  // feature-folder entries
  "home-view": "home", "quiz-engine": "quiz",
};

const FOLDERS = [
  "shell", "lesson", "practice", "exam", "grammar",
  "duel", "home", "profile", "quiz", "reports", "shared",
];

function walkTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkTsFiles(p));
    else if (/\.(tsx?|)$/.test(name) && /\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

describe("component layout §11.2 receipt (Step 10 part 2 — Task 91)", () => {
  it("study/ root holds ONLY study-app.tsx + the 11 feature folders", () => {
    const entries = readdirSync(STUDY).sort();
    const files = entries.filter((e) => statSync(resolve(STUDY, e)).isFile());
    const dirs = entries.filter((e) => statSync(resolve(STUDY, e)).isDirectory()).sort();
    expect(files).toEqual(["study-app.tsx"]);
    expect(dirs).toEqual([...FOLDERS].sort());
  });

  it("every §11.2-placed module exists at its feature-folder home", () => {
    for (const [name, folder] of Object.entries(PLACEMENT)) {
      const found =
        existsSync(resolve(STUDY, folder, `${name}.tsx`)) ||
        existsSync(resolve(STUDY, folder, `${name}.ts`));
      expect({ name, at: `${folder}/${name}`, found }).toEqual({ name, at: `${folder}/${name}`, found: true });
    }
  });

  it("no bare alias import remains for any moved module (stale-alias ban)", () => {
    const offenders: string[] = [];
    for (const file of walkTsFiles(STUDY)) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/@\/components\/study\/([a-z-]+)["']/g)) {
        const bare = m[1];
        if (bare in PLACEMENT) offenders.push(`${file} → @/components/study/${bare}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("no relative import may reach a moved module through its retired flat path", () => {
    // a stale flat relative spec would have to name-solve to study/<name> —
    // impossible now (root is study-app only), but a quoted-string guard is cheap:
    for (const [name] of Object.entries(PLACEMENT)) {
      expect(existsSync(resolve(STUDY, `${name}.tsx`))).toBe(false);
      expect(existsSync(resolve(STUDY, `${name}.ts`))).toBe(false);
    }
  });
});
