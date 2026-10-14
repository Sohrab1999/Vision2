#!/bin/bash
# Task 150 — combined streak badge (flame×ice) live QA against a PRODUCTION
# verification instance on 3004.
#
# WHY production: the long-lived dev server (3000) froze pre-wave-9 — its
# bundle can never contain Task 150. Instead of killing the platform-owned
# dev server, we build a SIDE distDir (temporarily patching next.config.ts —
# NEXT_DIST_DIR env is dev-stacktrace-only, NOT the real dist dir) and serve
# it with `next start` on 3004, all inside THIS single tool call (child
# processes are only reaped BETWEEN calls). The config patch must be present
# for BOTH build and start; it is restored (trap-insured) before exit and
# .next-prod150 is removed. Zero traces, zero DB writes (event POSTs are
# swallowed via fetch/sendBeacon patches before any click).
#
# Phases (all against 127.0.0.1:3004, seeded via the vision2-study-v1
# persist key + reload — the r81 pattern):
#   A. newcomer (fresh state): NO streak badge at all (quiet, old contract).
#   B. combo seed (streak 9 + 2 ice): one chip — flame «۹» + ice guest
#      «۲ یخ», title = the ONE-PARAGRAPH joined sentence, aria==title.
#   C. flame-only seed: no .streak-ice, title verbatim = the old flame chip.
#   D. saved-today seed: «نجات شد» inside the SAME chip.
#   E. ice guest ink == the freeze chip's ink (theme-form-proof equality vs
#      a c-chip-freeze probe element, in BOTH themes; dark == rgb(56,189,248)).
#   F. click → real navigation home (nav home button goes active) — analytics
#      POSTs swallowed, DB untouched.
#   G. OV390 = 0 (mobile overflow, header changed this round).
#   H. console errors = 0.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r150.bak
DIST=.next-prod150

restore() {
  if [ -f "$BAK" ]; then cp "$BAK" "$CFG"; fi
  for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do
    kill -9 "$pid" 2>/dev/null
  done
}
trap restore EXIT

echo "--- 0. patch distDir + production build into side dir ($DIST)"
cp "$CFG" "$BAK"
rg -q 'distDir' "$CFG" && { echo "CONFIG-ALREADY-PATCHED-ABORT"; exit 1; }
python3 - "$CFG" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
s = s.replace('const nextConfig: NextConfig = {\n  output: "standalone",',
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod150",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
# NOTE: `bun run build` runs hardcoded `.next`-path cp steps for the standalone
# assembly — wrong destination for a side distDir AND unnecessary here (this
# instance serves via `next start`, which handles statics itself; the r149
# "standalone static 404 mystery" note says the same: next start worked).
bunx next build >/tmp/r150-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r150-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod150 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod150-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod150-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم"));
  if(b){b.click();return "SKIPPED-INTRO";} return "NO-INTRO";
})()' 2>/dev/null
sleep 1

echo "--- A. newcomer: fresh state → NO streak badge"
agent-browser eval '(() => {
  const chip = document.querySelector(".streak-badge");
  return "NEWCOMER|badge=" + (chip ? "PRESENT-BAD" : "absent-OK");
})()' 2>/dev/null

echo "--- B. combo seed: streak 9 + 2 ice → one chip, flame+ice, joined title"
agent-browser eval '(() => {
  localStorage.setItem("vision2-study-v1", JSON.stringify({ state: {
    streak: 9, bestStreak: 9, freezeCount: 2, freezeSavedDay: "",
    freezeUsedDays: [], freezeEarnedDay: "", goalMetDays: [], dailyGoal: 10
  }, version: 0 }));
  return "SEEDED-COMBO";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const chip = document.querySelector(".streak-badge");
  if (!chip) return "COMBO|chip=MISSING-BAD";
  const ice = chip.querySelector(".streak-ice");
  const expected = "زنجیرهٔ ۹ روزه مطالعه؛ ۲ یخِ زنجیره داری — یک روز غیبت را خودکار پوشش می‌دهد (سقف ۲ یخ)";
  return JSON.stringify({
    flameNum: chip.textContent.includes("۹"),
    iceLabel: ice ? ice.textContent.trim() : null,
    titleExact: chip.getAttribute("title") === expected,
    ariaEqTitle: chip.getAttribute("aria-label") === chip.getAttribute("title"),
    flameAnim: !!chip.querySelector(".streak-flame"),
    familyBase: chip.className.includes("c-chip-flame"),
    responsive: chip.className.includes("hidden") && chip.className.includes("sm:inline-flex")
  });
})()' 2>/dev/null

echo "--- E. ice guest ink == freeze chip ink (both themes, theme-form-proof)"
agent-browser eval '(() => {
  const ice = document.querySelector(".streak-badge .streak-ice");
  if (!ice) return "INK|ice=MISSING";
  const probe = document.createElement("span");
  probe.className = "c-chip-freeze";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const lightIce = getComputedStyle(ice).color;
  const lightProbe = getComputedStyle(probe).color;
  document.documentElement.classList.add("dark");
  const darkIce = getComputedStyle(ice).color;
  const darkProbe = getComputedStyle(probe).color;
  const darkExact = darkIce === "rgb(56, 189, 248)";
  document.documentElement.classList.remove("dark");
  probe.remove();
  return JSON.stringify({ lightEq: lightIce === lightProbe, darkEq: darkIce === darkProbe, darkIce, darkExact, lightIce });
})()' 2>/dev/null

echo "--- F. click → real navigation home (analytics POSTs swallowed)"
agent-browser eval '(() => {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.includes("/api/event")) return Promise.resolve(new Response("{}", { status: 200 }));
    return realFetch(input, init);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = () => true;
  return "FETCH-PATCHED";
})()' 2>/dev/null
agent-browser eval '(() => {
  const chip = document.querySelector(".streak-badge");
  if (!chip) return "CLICK|chip=MISSING";
  chip.click();
  return "CLICKED";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const nav = [...document.querySelectorAll("nav[aria-label=\"ناوبری اصلی\"] button")];
  const home = nav.find(x => x.textContent.includes("خانه"));
  return "CLICK-NAV|" + (home && home.className.includes("bg-emerald-600") ? "home-active-OK" : "NOT-NAVIGATED-BAD");
})()' 2>/dev/null

echo "--- C. flame-only seed: no ice guest, title verbatim = old flame chip"
agent-browser eval '(() => {
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  raw.state.freezeCount = 0;
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "SEEDED-FLAME";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const chip = document.querySelector(".streak-badge");
  if (!chip) return "FLAME|chip=MISSING-BAD";
  return JSON.stringify({
    noIce: !chip.querySelector(".streak-ice"),
    titleExact: chip.getAttribute("title") === "زنجیرهٔ ۹ روزه مطالعه",
    ariaEqTitle: chip.getAttribute("aria-label") === chip.getAttribute("title")
  });
})()' 2>/dev/null

echo "--- D. saved-today seed: «نجات شد» inside the same chip"
agent-browser eval '(() => {
  const raw = JSON.parse(localStorage.getItem("vision2-study-v1"));
  raw.state.freezeCount = 1;
  raw.state.freezeSavedDay = new Date().toISOString().slice(0,10);
  localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
  return "SEEDED-SAVED";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 4
agent-browser eval '(() => {
  const chip = document.querySelector(".streak-badge");
  if (!chip) return "SAVED|chip=MISSING-BAD";
  const ice = chip.querySelector(".streak-ice");
  return JSON.stringify({
    savedLabel: ice ? ice.textContent.trim() : null,
    titleHasSaved: (chip.getAttribute("title") || "").includes("امروز یخ، زنجیره را نجات داد")
  });
})()' 2>/dev/null

echo "--- G. mobile 390 overflow (header changed this round)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- H. console errors"
agent-browser console 2>/dev/null | rg -i "error" | rg -v "favicon|Download the React DevTools" | wc -l | xargs echo "CONSOLE_ERRORS="

echo "--- cleanup: kill 3004 + restore config + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R150-QA-DONE"
