#!/usr/bin/env node
/**
 * P0 performance evidence: cold start and warm traversal samples + target-restart recovery.
 *
 *   pnpm build && P0_LIVE=1 node scripts/perf-p0.mjs
 *   P0_HEADED=1 P0_LIVE=1 node scripts/perf-p0.mjs     # hardware-accelerated headed Chrome
 *
 * P0_PERF_SAMPLES (default 20) warm jumps; P0_PERF_COLD (default 10) cold page loads.
 * Profile label is recorded, not simulated: loopback here; LAN/public need real deployment.
 */
import { chromium } from "playwright-core";
import { spawn, execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TLS = join(ROOT, ".p0-tls");
const BASE = process.env.P0_URL || "https://alice.example:8443/";
const HEADED = process.env.P0_HEADED === "1";
const PROFILE = process.env.P0_PERF_PROFILE || "loopback";
const WARM_N = Number(process.env.P0_PERF_SAMPLES || 20);
const COLD_N = Number(process.env.P0_PERF_COLD || 10);
const OUT = process.env.P0_PERF_OUT || join(ROOT, "artifacts", `perf-p0-${HEADED ? "headed" : "headless"}.json`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lookup = (h, o, cb) => (o?.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4));
const ca = readFileSync(join(TLS, "ca.crt"));
const procs = [];
const nodeProcs = {};

function startNode(name, port, extra = []) {
  const p = spawn(process.execPath, [join(ROOT, "scripts/serve-node.mjs"), "--name", name, "--port", String(port), ...extra], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
  procs.push(p);
  nodeProcs[name] = p;
  return p;
}
function stop() { for (const p of procs) { try { p.kill("SIGTERM"); } catch { /* ignore */ } } }
function health(origin) {
  return new Promise((resolve) => {
    const u = new URL("/healthz", origin);
    const r = httpsRequest(u, { lookup, ca, servername: u.hostname, timeout: 800 }, (res) => { res.resume(); resolve(res.statusCode === 200); });
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
function pct(values, p) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
}
const summary = (xs) => ({ n: xs.length, min: Math.min(...xs), p50: pct(xs, 0.5), p95: pct(xs, 0.95), max: Math.max(...xs) });

if (!existsSync(join(TLS, "trust.json"))) execFileSync(process.execPath, [join(ROOT, "scripts/tls-fixture.mjs")], { stdio: "inherit" });
if (!existsSync(join(ROOT, "apps/playground/dist/index.html"))) throw new Error("run pnpm build first");
try { execFileSync("bash", ["-lc", "lsof -ti:8443,8444 | xargs kill 2>/dev/null || true"]); } catch { /* ignore */ }
const trust = JSON.parse(readFileSync(join(TLS, "trust.json"), "utf8"));
const pins = Object.values(trust.origins).map((o) => o.spkiSha256).join(",");
startNode("alice", 8443, ["--client-dist", "apps/playground/dist"]);
startNode("hana", 8444);
if (!(await waitNodes())) throw new Error("nodes failed to start");

const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = [
  "--no-sandbox",
  ...(HEADED ? [] : ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"]),
  "--host-resolver-rules=MAP alice.example 127.0.0.1,MAP hana.example 127.0.0.1",
  `--ignore-certificate-errors-spki-list=${pins}`,
];
const launchOpts = { executablePath: chromePath, headless: !HEADED, args };
let browser = null;
const cold = [];
const warm = [];
let restart = null;
try {
  // Cold start: a fresh browser process per sample (no shared HTTP cache).
  for (let i = 0; i < COLD_N; i++) {
    const b = await chromium.launch(launchOpts);
    const ctx = await b.newContext();
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto(`${BASE}?live=1`, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => window.__P0__?.status().world, null, { timeout: 30000 });
    cold.push(Date.now() - t0);
    await b.close();
  }

  // Warm traversal: one page/browser, alternating A↔B through the real UI.
  browser = await chromium.launch(launchOpts);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}?live=1`, { waitUntil: "load", timeout: 30000 });
  await page.waitForFunction(() => window.__P0__?.status().world, null, { timeout: 30000 });
  async function jump() {
    const before = await page.evaluate(() => window.__P0__.status());
    await page.evaluate(() => window.__P0__.teleportToPortal());
    await page.keyboard.press("KeyE");
    await page.waitForFunction(() => document.querySelector("#portalDialog")?.open === true, null, { timeout: 5000 });
    const t0 = Date.now();
    await page.locator("#enterBtn").click();
    const expected = before.world.includes("pixel-rooftop") ? "neon-alley" : "pixel-rooftop";
    await page.waitForFunction((e) => window.__P0__?.status().world?.includes(e), expected, { timeout: 20000 });
    warm.push(Date.now() - t0);
  }
  for (let i = 0; i < WARM_N; i++) await jump();

  // Target restart recovery: stop B, verify rollback, restart B, retry succeeds.
  const atA = (await page.evaluate(() => window.__P0__.status())).world.includes("pixel-rooftop");
  if (!atA) await jump();
  nodeProcs.hana?.kill("SIGTERM");
  await sleep(500);
  await page.evaluate(() => window.__P0__.teleportToPortal());
  await page.keyboard.press("KeyE");
  await page.waitForFunction(() => document.querySelector("#portalDialog")?.open === true, null, { timeout: 5000 });
  await page.locator("#enterBtn").click();
  await page.waitForFunction(() => document.querySelector("#toast").textContent.includes("traversal failed"), null, { timeout: 15000 });
  const rolledBack = (await page.evaluate(() => window.__P0__.status())).world.includes("pixel-rooftop");
  startNode("hana", 8444);
  if (!(await waitNodes())) throw new Error("node B failed to restart");
  await sleep(300);
  const t0 = Date.now();
  await page.evaluate(() => window.__P0__.teleportToPortal());
  await page.keyboard.press("KeyE");
  await page.waitForFunction(() => document.querySelector("#portalDialog")?.open === true, null, { timeout: 5000 });
  await page.locator("#enterBtn").click();
  await page.waitForFunction(() => window.__P0__?.status().world?.includes("neon-alley"), null, { timeout: 20000 });
  restart = { rolledBackBeforeRestart: rolledBack, retriedAfterRestart: true, retryMs: Date.now() - t0 };
  await ctx.close();
} finally {
  if (browser) await browser.close().catch(() => {});
  stop();
}

const report = {
  schema: "p0-perf/0.1",
  generatedAt: new Date().toISOString(),
  profile: PROFILE,
  headless: !HEADED,
  browser: "Chrome via playwright-core",
  samples: { cold: COLD_N, warm: WARM_N },
  coldStartMs: summary(cold),
  warmTraversalMs: summary(warm),
  restartRecovery: restart,
  targets: { coldP95Ms: 5000, warmP95Ms: 1500 },
  note: "Cold start uses a fresh browser process per sample; warm uses one page. Loopback fixture only — LAN/public network profiles require real deployment and are not claimed here.",
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
console.log(`\nPERF: ${report.coldStartMs.p95 <= 5000 && report.warmTraversalMs.p95 <= 1500 && restart?.retriedAfterRestart ? "PASS (loopback)" : "REVIEW"} -> ${OUT}`);
process.exit(0);
