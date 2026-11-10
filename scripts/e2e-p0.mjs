#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * P0 e2e: actual portal UI interaction (teleport → E → confirm dialog → Enter),
 * 10 bidirectional traversals, rollback, live prefetch budget + whitelist checks.
 *
 *   pnpm dev                          # fixture mode, dev server at :5173
 *   pnpm test:e2e
 *   P0_LIVE=1 pnpm build && P0_LIVE=1 pnpm test:e2e
 *
 * Live mode starts two independent HTTPS nodes (alice/hana) itself; it never
 * ignores TLS errors globally — the fixture leaf keys are pinned explicitly via
 * Chrome's SPKI allowlist. Node-side strict verification lives in live-conformance.
 */
import { chromium } from "playwright-core";
import { spawn, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { createServer } from "node:net";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE = process.env.P0_LIVE === "1" || process.argv.includes("--live");
const HEADED = process.env.P0_HEADED === "1";
const BASE = process.env.P0_URL || (LIVE ? "https://alice.example:8443/" : "http://localhost:5173/");
const TLS = join(ROOT, ".p0-tls");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const procs = [];
const nodeProcs = {};
function startNode(name, port, extra = []) {
  const p = spawn(process.execPath, [join(ROOT, "scripts/serve-node.mjs"), "--name", name, "--port", String(port), ...extra], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  procs.push(p);
  nodeProcs[name] = p;
  return p;
}
function stopAll() { for (const p of procs) { try { p.kill("SIGTERM"); } catch { /* ignore */ } } }
const lookup = (host, opts, cb) => (opts?.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4));
function health(origin, timeout = 800) {
  return new Promise((resolve) => {
    const u = new URL("/healthz", origin);
    const r = httpsRequest(u, { lookup, ca: readFileSync(join(TLS, "ca.crt")), servername: u.hostname, timeout }, (res) => {
      const c = [];
      res.on("data", (d) => c.push(d));
      res.on("end", () => resolve(res.statusCode === 200));
    });
    r.on("timeout", () => { r.destroy(); resolve(false); });
    r.on("error", () => resolve(false));
    r.end();
  });
}
async function waitNodes() {
  for (let i = 0; i < 50; i++) {
    if ((await health("https://alice.example:8443")) && (await health("https://hana.example:8444"))) return true;
    await sleep(150);
  }
  return false;
}

let browser = null;
const report = { mode: LIVE ? "live" : "fixture", coldStartMs: null, jumps: [], p50: null, p95: null, rollback: null, liveChecks: null, gesture: null, roomFull: null, errors: [] };
let failed = 0;

try {
  let args = ["--no-sandbox", ...(HEADED ? [] : ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"])];
  if (LIVE) {
    if (!existsSync(join(TLS, "trust.json"))) execFileSync(process.execPath, [join(ROOT, "scripts/tls-fixture.mjs")], { stdio: "inherit" });
    if (!existsSync(join(ROOT, "apps/playground/dist/index.html"))) throw new Error("apps/playground/dist missing; run pnpm build first");
    const trust = JSON.parse(readFileSync(join(TLS, "trust.json"), "utf8"));
    const pins = Object.values(trust.origins).map((o) => o.spkiSha256).join(",");
    // Kill leftovers from previous runs on the fixture ports.
    const portsFree = await Promise.all([8443, 8444].map((port) => new Promise((resolve) => {
      const s = createServer();
      s.once("error", () => resolve(false));
      s.once("listening", () => s.close(() => resolve(true)));
      s.listen(port, "127.0.0.1");
    })));
    if (portsFree.some((free) => !free)) throw new Error("port 8443/8444 in use; stop existing P0 nodes first (this harness never kills unrelated processes)");
    startNode("alice", 8443, ["--client-dist", "apps/playground/dist"]);
    startNode("hana", 8444);
    if (!(await waitNodes())) throw new Error("live nodes failed to start");
    args.push(
      "--host-resolver-rules=MAP alice.example 127.0.0.1,MAP hana.example 127.0.0.1",
      `--ignore-certificate-errors-spki-list=${pins}`,
    );
  } else {
    // Fixture mode expects `pnpm dev` (Vite) at :5173.
    const probe = await fetch(BASE).catch(() => null);
    if (!probe?.ok) throw new Error(`dev server not reachable at ${BASE}; run pnpm dev`);
  }

  const executablePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!existsSync(executablePath)) throw new Error(`Chrome not found at ${executablePath}; set CHROME_PATH`);
  browser = await chromium.launch({ executablePath, headless: !HEADED, args });
  let page = await browser.newPage();
  const attach = (p) => { p.on("pageerror", (e) => report.errors.push(String(e))); p.on("console", (m) => { if (m.type() === "error" && !m.text().includes("favicon")) report.errors.push(m.text()); }); };
  attach(page);

  const started = Date.now();
  await page.goto(`${BASE}?live=${LIVE ? 1 : 0}`, { waitUntil: "load", timeout: 25000 });
  await page.waitForFunction(() => window.__P0__?.status().world, null, { timeout: 25000 });
  report.coldStartMs = Date.now() - started;
  console.log(`boot (${report.mode}): ${report.coldStartMs}ms`);

  async function jump(n) {
    const before = await page.evaluate(() => window.__P0__.status());
    await page.evaluate(() => window.__P0__.teleportToPortal());
    await page.waitForFunction(() => window.__P0__.status().nearPortal === true, null, { timeout: 5000 });
    await page.keyboard.press("KeyE");
    await page.waitForFunction(() => document.querySelector("#portalDialog")?.open === true, null, { timeout: 5000 });
    const t0 = Date.now();
    await page.locator("#enterBtn").click();
    const expected = before.world.includes("pixel-rooftop") ? "neon-alley" : "pixel-rooftop";
    try {
      await page.waitForFunction((e) => window.__P0__?.status().world?.includes(e), expected, { timeout: 25000 });
    } catch (e) {
      const dbg = await page.evaluate(() => ({ status: window.__P0__?.status(), toast: document.querySelector("#toast").textContent, dialog: document.querySelector("#portalDialog").open, loading: document.querySelector("#loading").className }));
      console.log("jump debug", JSON.stringify(dbg));
      throw e;
    }
    const elapsed = Date.now() - t0;
    const after = await page.evaluate(() => window.__P0__.status());
    const ok = after.world.includes(expected) && elapsed < 5000;
    if (!ok) failed++;
    report.jumps.push({ n, from: before.world, to: after.world, elapsedMs: elapsed, ok });
    console.log(`jump ${String(n).padStart(2, "0")}: ${ok ? "PASS" : "FAIL"} ${elapsed}ms`);
  }

  for (let i = 1; i <= 10; i++) await jump(i);

  const perfTimes = report.jumps.filter((j) => j.ok).map((j) => j.elapsedMs).sort((a, b) => a - b);
  if (perfTimes.length) {
    const q = (p) => perfTimes[Math.min(perfTimes.length - 1, Math.floor(p * (perfTimes.length - 1)))];
    report.p50 = q(0.5);
    report.p95 = q(0.95);
    console.log(`warm traversal p50=${report.p50}ms p95=${report.p95}ms; cold start=${report.coldStartMs}ms`);
  }

  if (LIVE) {
    const budget = await page.evaluate(() => window.__P0__.prefetchTest(9 * 1024 * 1024));
    const write = await page.evaluate(() => ({
      allowed: window.__P0__.tryWritePointer("/nodes/radio/translation"),
      denied: window.__P0__.tryWritePointer("/nodes/radio/scale"),
    }));
    report.liveChecks = { budget, write };
    if (budget.ok || !write.allowed.ok || write.denied.ok) failed++;
    console.log(`live checks: budget=${budget.ok ? "FAIL" : "PASS"} whitelist=${write.allowed.ok && !write.denied.ok ? "PASS" : "FAIL"}`);

    // Gesture guard: a programmatic auto-traversal must be rejected and must not move.
    const g0 = await page.evaluate(() => window.__P0__.status());
    const gcode = await page.evaluate(() => window.__P0__.autoTraverse().then(() => "resolved").catch((e) => e.code || "rejected"));
    await page.waitForTimeout(300);
    const g1 = await page.evaluate(() => window.__P0__.status());
    report.gesture = { code: gcode, unchanged: g0.world === g1.world };
    const gestureOk = gcode === "E_GESTURE_REQUIRED" && g0.world === g1.world;
    if (!gestureOk) failed++;
    console.log(`gesture guard: ${gestureOk ? "PASS" : "FAIL"}`);

    // Room-full fallback: new page, B restarted with --room-full, expect single-player entry.
    try {
      await page.close();
      page = await browser.newPage();
      attach(page);
      nodeProcs.hana?.kill("SIGTERM");
      await sleep(400);
      startNode("hana", 8444, ["--room-full"]);
      if (!(await waitNodes())) throw new Error("room-full node failed to start");
      await page.goto(`${BASE}?live=1`, { waitUntil: "load", timeout: 25000 });
      await page.waitForFunction(() => window.__P0__?.status().world, null, { timeout: 25000 });
      await page.evaluate(() => window.__P0__.teleportToPortal());
      await page.keyboard.press("KeyE");
      await page.waitForFunction(() => document.querySelector("#portalDialog")?.open === true, null, { timeout: 5000 });
      await page.locator("#enterBtn").click();
      await page.waitForFunction(() => window.__P0__?.status().world?.includes("neon-alley"), null, { timeout: 20000 });
      const rf = await page.evaluate(() => window.__P0__.status());
      report.roomFull = { world: rf.world, singlePlayer: rf.singlePlayer };
      if (!rf.singlePlayer) failed++;
      console.log(`room-full fallback: ${rf.singlePlayer ? "PASS" : "FAIL"}`);
      await page.close();
    } catch (err) {
      failed++;
      report.roomFull = { error: err.message };
      console.log(`room-full fallback: FAIL (${err.message})`);
    }

    // Rollback: fresh page at A, node B down, attempt traversal.
    try {
      page = await browser.newPage();
      attach(page);
      nodeProcs.hana?.kill("SIGTERM");
      await sleep(500);
      await page.goto(`${BASE}?live=1`, { waitUntil: "load", timeout: 25000 });
      await page.waitForFunction(() => window.__P0__?.status().world, null, { timeout: 25000 });
      await page.evaluate(() => window.__P0__.teleportToPortal());
      await page.keyboard.press("KeyE");
      await page.waitForFunction(() => document.querySelector("#portalDialog")?.open === true, null, { timeout: 5000 });
      const before = await page.evaluate(() => window.__P0__.status());
      await page.locator("#enterBtn").click();
      await page.waitForFunction(() => document.querySelector("#toast").textContent.includes("traversal failed"), null, { timeout: 15000 });
      const after = await page.evaluate(() => window.__P0__.status());
      report.rollback = { before: before.world, after: after.world, toast: await page.locator("#toast").textContent() };
      const ok = after.world === before.world;
      if (!ok) failed++;
      console.log(`rollback (node B down): ${ok ? "PASS" : "FAIL"}`);
    } catch (err) {
      failed++;
      report.rollback = { error: err.message };
      console.log(`rollback: FAIL (${err.message})`);
    }
  } else {
    await page.goto(`${BASE}?failPortal=1`, { waitUntil: "load", timeout: 20000 });
    await page.waitForFunction(() => window.__P0__?.status().world, null, { timeout: 20000 });
    await page.evaluate(() => window.__P0__.teleportToPortal());
    await page.keyboard.press("KeyE");
    await page.waitForFunction(() => document.querySelector("#portalDialog")?.open === true, null, { timeout: 5000 });
    const before = await page.evaluate(() => window.__P0__.status());
    await page.locator("#enterBtn").click();
    await page.waitForFunction(() => document.querySelector("#toast").textContent.includes("traversal failed"), null, { timeout: 15000 });
    const after = await page.evaluate(() => window.__P0__.status());
    report.rollback = { before: before.world, after: after.world, toast: await page.locator("#toast").textContent() };
    if (after.world !== before.world) failed++;
    console.log(`rollback (simulated): ${after.world === before.world ? "PASS" : "FAIL"}`);
  }

  const times = report.jumps.filter((j) => j.ok).map((j) => j.elapsedMs).sort((a, b) => a - b);
  if (times.length) {
    const q = (p) => times[Math.min(times.length - 1, Math.floor(p * (times.length - 1)))];
    report.p50 = q(0.5);
    report.p95 = q(0.95);
    console.log(`warm traversal p50=${report.p50}ms p95=${report.p95}ms; cold start=${report.coldStartMs}ms`);
  }
} catch (err) {
  failed++;
  console.error("e2e error:", err.message);
} finally {
  if (browser) await browser.close().catch(() => {});
  stopAll();
}

report.ok = failed === 0;
if (process.env.P0_REPORT_OUT) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(process.env.P0_REPORT_OUT, JSON.stringify({ suite: "live-browser", generatedAt: new Date().toISOString(), ...report }, null, 2));
}
console.log(`\nRESULT: ${failed === 0 ? "PASS" : "FAIL"} (${report.jumps.filter((j) => j.ok).length}/10 jumps, ${report.mode}, cold ${report.coldStartMs}ms, p95 ${report.p95}ms)`);
if (failed) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}
