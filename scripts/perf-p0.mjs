#!/usr/bin/env node
/**
 * P0 performance evidence: sampled cold start / warm traversal + target-restart recovery.
 *
 * Local (loopback, fixture TLS):
 *   pnpm build && P0_LIVE=1 node scripts/perf-p0.mjs
 *   P0_HEADED=1 P0_LIVE=1 node scripts/perf-p0.mjs
 *   P0_LIVE=1 node scripts/perf-p0.mjs --strict      # non-zero on budget/restart failure
 *
 * Remote profiles (real LAN/public deployment; no local servers, no loopback rewriting):
 *   P0_PERF_REMOTE=1 P0_PERF_PROFILE=lan \
 *   P0_URL=https://choroweave.lan/ P0_NODE_A_ORIGIN=https://a.lan P0_NODE_B_ORIGIN=https://b.lan \
 *   node scripts/perf-p0.mjs --strict
 * Optional: P0_HOST_RESOLVER="MAP ...", P0_SPKI_PINS="<pin,...>", CHROME_PATH.
 *
 * Samples: P0_PERF_SAMPLES (warm, default 20), P0_PERF_COLD (default 10).
 * A remote profile is validated (non-loopback; public rejects private ranges) so it
 * cannot be claimed by merely changing a label.
 */
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:net";
import { request as httpsRequest } from "node:https";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TLS = join(ROOT, ".p0-tls");
const STRICT = process.argv.includes("--strict") || process.env.P0_PERF_STRICT === "1";
const REMOTE = process.argv.includes("--remote") || process.env.P0_PERF_REMOTE === "1";
const HEADED = process.env.P0_HEADED === "1";
const PROFILE = process.env.P0_PERF_PROFILE || (REMOTE ? "public" : "loopback");
const BASE = process.env.P0_URL || (REMOTE ? "" : "https://alice.example:8443/");
const WARM_N = Number(process.env.P0_PERF_SAMPLES || 20);
const COLD_N = Number(process.env.P0_PERF_COLD || 10);
const OUT = process.env.P0_PERF_OUT || join(ROOT, "artifacts", `perf-p0-${PROFILE}-${HEADED ? "headed" : "headless"}.json`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function failConfig(msg) { console.error(`perf: ${msg}`); process.exit(2); }
function hostOf(url) { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } }
function isLoopback(host) { return host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "::1" || host === "[::1]"; }
function isPrivate(host) {
  return /^(10\.|127\.|192\.168\.|169\.254\.|0\.)/.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host.endsWith(".local") || host.endsWith(".lan");
}
if (!["loopback", "lan", "public"].includes(PROFILE)) failConfig(`unknown P0_PERF_PROFILE=${PROFILE}`);
if (!REMOTE && PROFILE !== "loopback") failConfig(`profile ${PROFILE} requires P0_PERF_REMOTE=1 with a real deployment`);
if (REMOTE && !BASE) failConfig("remote mode requires P0_URL (the client origin)");
if (REMOTE) {
  if (!BASE.startsWith("https://")) failConfig("P0_URL must be https");
  const h = hostOf(BASE);
  if (PROFILE === "lan" && isLoopback(h)) failConfig("lan profile requires a non-loopback client host (e.g. LAN IP)");
  if (PROFILE === "public" && (isLoopback(h) || isPrivate(h))) failConfig("public profile requires a public client host; private/loopback is rejected");
}

const lookup = (h, o, cb) => (o?.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4));
const ca = existsSync(join(TLS, "ca.crt")) ? readFileSync(join(TLS, "ca.crt")) : null;
const procs = [];
const nodeProcs = {};

function portFree(port) {
  return new Promise((resolve) => {
    const s = createServer();
    s.once("error", () => resolve(false));
    s.once("listening", () => s.close(() => resolve(true)));
    s.listen(port, "127.0.0.1");
  });
}
async function requirePorts() {
  const ports = [8443, 8444];
  const free = await Promise.all(ports.map(portFree));
  const busy = ports.filter((_, i) => !free[i]);
  if (busy.length) {
    console.error(`perf: port(s) ${busy.join(", ")} already in use. Stop the existing P0 nodes (this harness never kills unrelated processes), or use P0_PERF_REMOTE=1.`);
    process.exit(2);
  }
}
function startNode(name, port, extra = []) {
  const p = spawn(process.execPath, [join(ROOT, "scripts/serve-node.mjs"), "--name", name, "--port", String(port), ...extra], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
  procs.push(p);
  nodeProcs[name] = p;
  return p;
}
function stop() { for (const p of procs) { try { p.kill("SIGTERM"); } catch { /* ignore */ } } }
function health(origin) {
  return new Promise((resolve) => {
    if (!ca) return resolve(false);
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

let pins = process.env.P0_SPKI_PINS || "";
if (!REMOTE) {
  await requirePorts();
  if (!existsSync(join(TLS, "trust.json"))) {
    const { execFileSync } = await import("node:child_process");
    execFileSync(process.execPath, [join(ROOT, "scripts/tls-fixture.mjs")], { stdio: "inherit" });
  }
  if (!existsSync(join(ROOT, "apps/playground/dist/index.html"))) failConfig("apps/playground/dist missing; run pnpm build");
  const trust = JSON.parse(readFileSync(join(TLS, "trust.json"), "utf8"));
  pins = Object.values(trust.origins).map((o) => o.spkiSha256).join(",");
  startNode("alice", 8443, ["--client-dist", "apps/playground/dist"]);
  startNode("hana", 8444);
  if (!(await waitNodes())) { stop(); failConfig("local nodes failed to start"); }
}

const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = ["--no-sandbox", ...(HEADED ? [] : ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"])];
if (!REMOTE) args.push("--host-resolver-rules=MAP alice.example 127.0.0.1,MAP hana.example 127.0.0.1");
if (process.env.P0_HOST_RESOLVER) args.push(`--host-resolver-rules=${process.env.P0_HOST_RESOLVER}`);
if (pins) args.push(`--ignore-certificate-errors-spki-list=${pins}`);
const launchOpts = { executablePath: chromePath, headless: !HEADED, args };
let browser = null;
const cold = [];
const warm = [];
let restart = null;
try {
  // Cold start: fresh browser process per sample.
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

  // Warm traversal via the real portal UI.
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

  if (!REMOTE) {
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
  }
  await ctx.close();
} finally {
  if (browser) await browser.close().catch(() => {});
  stop();
}

const perfPass = cold.length > 0 && warm.length > 0 &&
  pct(cold, 0.95) <= 5000 && pct(warm, 0.95) <= 1500 &&
  (REMOTE || restart?.retriedAfterRestart === true);
const report = {
  schema: "p0-perf/0.2",
  generatedAt: new Date().toISOString(),
  profile: PROFILE,
  remote: REMOTE,
  headless: !HEADED,
  clientUrl: BASE,
  nodeOrigins: REMOTE ? { a: process.env.P0_NODE_A_ORIGIN || null, b: process.env.P0_NODE_B_ORIGIN || null } : { a: "https://alice.example:8443", b: "https://hana.example:8444" },
  samples: { cold: COLD_N, warm: WARM_N },
  coldStartMs: summary(cold),
  warmTraversalMs: summary(warm),
  restartRecovery: REMOTE ? { skipped: "remote profile does not restart the target node" } : restart,
  gates: { coldP95Ms: 5000, warmP95Ms: 1500, restartRecovery: !REMOTE },
  perfPass,
  strict: STRICT,
  note: REMOTE
    ? "Remote profile: no local servers, no loopback rewriting. Confirm the deployment and network before treating as G0 evidence."
    : "Loopback fixture only; LAN/public require a remote deployment.",
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
console.log(`\nPERF: ${perfPass ? "PASS" : "REVIEW"}${STRICT ? (perfPass ? " (strict)" : " — FAIL (strict)") : ""} -> ${OUT}`);
process.exit(STRICT && !perfPass ? 1 : 0);
