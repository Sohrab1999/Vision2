// Task 101 — DB hygiene: inspect QA deltas then restore baselines. Read-only unless --clean.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await p.quizAttempt.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true, userId: true, category: true, outcome: true, score: true, createdAt: true },
  });
  console.log("attempts <60m:", JSON.stringify(rows.map((r) => ({ c: r.category, o: r.outcome }))));
  const profs = await p.learnerProfile.findMany({ where: { createdAt: { gte: since } }, select: { userId: true, name: true } });
  console.log("profiles <60m:", JSON.stringify(profs.map((x) => x.name)));
  const todayKey = new Date().toISOString().slice(0, 10);
  const ev = await p.eventDay.findMany({ where: { day: todayKey }, select: { day: true, name: true, count: true } });
  console.log("today events:", JSON.stringify(ev));
  console.log("attempts total:", await p.quizAttempt.count());
  if (process.argv.includes("--clean")) {
    // QA round touched no quiz/profile rows (duel panel + badges only, localStorage seed);
    // restore passive app_open baseline and drop QA-only event rows if any appeared.
    // r189: rounds that run a REAL quiz flow (e.g. the result-card painter QA)
    // also leave quizAttempt rows + exam_done/quiz_done counters behind —
    // attempts are dropped ONLY inside the 60m QA window (real learners'
    // older attempts stay untouched); the two counters are daily aggregates
    // whose only source in this loopback QA env is the QA run itself.
    for (const e of ev) {
      if (e.name === "app_open") {
        await p.eventDay.update({ where: { day_name: { day: e.day, name: e.name } }, data: { count: 2 } });
        console.log("app_open restored to 2 (was", e.count + ")");
      } else if (["duel_start", "duel_done", "lesson_open",
        // task 185: the my-words flashcards QA path (dictionary star -> deck
        // -> flip) leaves these funnel rows behind — all QA-only by construction
        "my_words_open", "my_words_flashcards_start", "star_word",
        // task 189: the result-card painter QA completes a real 10-question exam
        "exam_done", "quiz_done",
        // task 200: the exam dictation CTA QA click fires the funnel opener
        "exam_dictation_start",
        // task 190: the dictation-tab QA path (tile + streak bar probes) leaves
        // dictation_done completions and the freeze_badge grant behind
        "dictation_done", "freeze_badge",
        // task 283: the qa-fresh-session --play mode completes a REAL 60s rush
        // hand end-to-end — every scripted play leaves one rush_done aggregate
        "rush_done",
        // r320: the rush-family audit completes REAL 60s spell sprints —
        // every scripted spell round leaves one spell_rush_done aggregate
        // (the event shipped in task 61, after this allowlist's early siblings)
        "spell_rush_done",
        // task 286: the official-report PNG card QA click fires the share event —
        // same QA-only construction as print_report's siblings in this loopback env
        "official_image",
        // task 287: the duel-done PNG card QA click fires duel_image (download or
        // native share) — same QA-only construction as official_image above
        "duel_image",
        // task 288: the duel-ledger career-card PNG QA click fires duel_ledger_image
        // — same QA-only construction as its two siblings above
        "duel_ledger_image",
        // task 290: the hill-library QA flow completes a real story quiz —
        // every scripted read leaves one library_story_done aggregate
        "library_story_done"].includes(e.name)) {
        await p.eventDay.delete({ where: { day_name: { day: e.day, name: e.name } } });
        console.log("QA event row removed:", e.name, "=", e.count);
      }
    }
    const gone = await p.quizAttempt.deleteMany({ where: { createdAt: { gte: since } } });
    if (gone.count > 0) console.log("QA-window attempts removed:", gone.count);
    console.log("CLEAN-OK");
  }
  await p.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
