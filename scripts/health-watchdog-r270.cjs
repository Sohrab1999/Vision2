#!/usr/bin/env node
/**
 * r270 health watchdog — keep the dev server alive before the OOM reaper
 * strikes. Background for the 2026-10-17 incident chain: the sandbox box has
 * 4GB RAM; turbopack dev accumulates every HMR recompilation from the parallel
 * cron sessions, next-server RSS reached 1.86GB and the kernel OOM-killed it
 * (dmesg, r269) — the user experiences that as "the page won't open" again.
 *
 * Policy (calibrated 2026-10-17 on live measurements):
 *   dead probe (non-200 on /)                                   -> restart
 *   MemAvailable < 700MB AND next-server RSS > 1.45GB           -> restart
 *   MemAvailable < 500MB AND next-server RSS > 1.2GB            -> restart
 *     Baseline anon heap of `next dev` (turbopack) on this project is
 *     ~1.34GB at boot and the kernel OOM fired at 1.86GB anon (r269 dmesg);
 *     growth on top of baseline comes from parallel-session HMR. The box is
 *     4GB with chrome-QA bursts of ~0.7-1GB, so these thresholds catch real
 *     danger without restarting on every healthy boot (r269 explicitly chose
 *     no hard V8 heap cap — periodic preventive restart is the mitigation).
 *
 * Usage:
 *   node scripts/health-watchdog-r270.cjs            # report only, exit code
 *   node scripts/health-watchdog-r270.cjs --ensure   # restart when policy says so
 *   node scripts/health-watchdog-r270.cjs --restart  # unconditional clean restart
 *
 * The restart itself MUST go through scripts/daemonize-r269.py (double-fork
 * orphan to PID 1) — any inline/nohup/setsid launch is reaped by the sandbox
 * when the tool call ends (r269/r270 finding).
 */
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PROJECT = "/home/z/my-project";
const LOG = path.join(PROJECT, "scripts", "watchdog.log");
const PROBE = "http://127.0.0.1:3000/";
const RESTART_AVAILABLE_MB = 700;
const RESTART_RSS_MB = 1450;
const EMERGENCY_AVAILABLE_MB = 500;
const EMERGENCY_RSS_MB = 1200;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  try {
    fs.appendFileSync(LOG, line + "\n");
  } catch {
    /* logging must never crash the watchdog */
  }
  console.log(line);
}

function httpStatus() {
  try {
    const out = execSync(
      `curl -s -o /dev/null -w "%{http_code}" --max-time 8 ${PROBE}`,
      { encoding: "utf8", timeout: 12000 },
    ).trim();
    return parseInt(out, 10) || 0;
  } catch {
    return 0;
  }
}

function nextServerRssMb() {
  try {
    const out = execSync(
      'ps -eo rss,comm,args --sort=-rss | grep -E "next-server" | grep -v grep | head -1',
      { encoding: "utf8", shell: "/bin/bash", timeout: 8000 },
    ).trim();
    const rss = parseInt(out.split(/\s+/)[0], 10);
    return Number.isFinite(rss) ? Math.round(rss / 1024) : 0;
  } catch {
    return 0;
  }
}

function memAvailableMb() {
  try {
    const info = fs.readFileSync("/proc/meminfo", "utf8");
    const m = info.match(/^MemAvailable:\s+(\d+)\s+kB/m);
    return m ? Math.round(parseInt(m[1], 10) / 1024) : -1;
  } catch {
    return -1;
  }
}

function killServerTree() {
  // kill the `next dev -p 3000` tree (bash wrapper + node + next-server child);
  // the battle judge on :3003 (`bun --hot index.ts`) does NOT match these
  // patterns and stays untouched.
  try {
    execSync('pkill -f "next dev -p 3000" 2>/dev/null; true', {
      shell: "/bin/bash",
      timeout: 8000,
    });
  } catch {
    /* pkill exits 1 when nothing matched — fine */
  }
  try {
    execSync('pkill -f "next-server" 2>/dev/null; true', {
      shell: "/bin/bash",
      timeout: 8000,
    });
  } catch {
    /* same */
  }
}

function waitForDead(maxMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    if (nextServerRssMb() === 0) return true;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400);
  }
  return nextServerRssMb() === 0;
}

function startServer() {
  // daemonize double-forks to PID 1 — survives the tool-call reaper
  const r = spawnSync(
    "python3",
    [
      path.join(PROJECT, "scripts", "daemonize-r269.py"),
      PROJECT,
      path.join(PROJECT, "dev.log"),
      "bun",
      "run",
      "dev",
    ],
    { timeout: 15000 },
  );
  if (r.error) throw r.error;
}

function waitForHealthy(maxMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const s = httpStatus();
    if (s === 200) return true;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 900);
  }
  return false;
}

function restart(reason) {
  log(`restart scheduled: ${reason}`);
  killServerTree();
  const dead = waitForDead(6000);
  if (!dead) log("WARN: old next-server still visible after kill (may be zombie — proceeding)");
  startServer();
  const ok = waitForHealthy(40000);
  log(ok ? "restart OK: probe 200" : "restart FAILED: probe never reached 200");
  return ok;
}

function main() {
  const mode = process.argv[2] || "";
  const status = httpStatus();
  const rss = nextServerRssMb();
  const avail = memAvailableMb();
  log(`check: probe=${status} nextRSS=${rss}MB memAvailable=${avail}MB mode=${mode || "report"}`);

  if (mode === "--restart") {
    process.exit(restart("explicit --restart") ? 3 : 1);
  }

  const dead = status !== 200;
  const memPressure =
    avail >= 0 && avail < RESTART_AVAILABLE_MB && rss > RESTART_RSS_MB;
  const memEmergency =
    avail >= 0 && avail < EMERGENCY_AVAILABLE_MB && rss > EMERGENCY_RSS_MB;
  if (mode === "--ensure") {
    if (dead) process.exit(restart(`probe=${status} (dead)`));
    if (memEmergency) {
      process.exit(
        restart(
          `emergency: available=${avail}MB < ${EMERGENCY_AVAILABLE_MB}MB and rss=${rss}MB`,
        ),
      );
    }
    if (memPressure) {
      process.exit(
        restart(`mem pressure: available=${avail}MB < ${RESTART_AVAILABLE_MB}MB and rss=${rss}MB`),
      );
    }
    log("ensure: healthy, no action");
    process.exit(0);
  }

  // report-only
  if (dead) process.exit(1);
  if (memPressure || memEmergency) process.exit(2);
  process.exit(0);
}

main();
