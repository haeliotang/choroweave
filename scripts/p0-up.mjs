#!/usr/bin/env node
/**
 * One-click P0 two-node launcher (test-only TLS fixture).
 * Generates certs if needed, starts Alice + Hana, serves the built client from Alice.
 *
 *   pnpm build && pnpm p0:up
 *
 * Stop with Ctrl-C. For automated verification use `P0_LIVE=1 pnpm test:e2e`.
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TLS = join(ROOT, ".p0-tls");
if (!existsSync(join(TLS, "trust.json"))) {
  console.log("p0: generating TLS fixture…");
  execFileSync(process.execPath, [join(ROOT, "scripts/tls-fixture.mjs")], { stdio: "inherit" });
}
if (!existsSync(join(ROOT, "apps/playground/dist/index.html"))) {
  console.error("p0: apps/playground/dist missing — run `pnpm build` first");
  process.exit(1);
}
const ca = (await import("node:fs")).readFileSync(join(TLS, "ca.crt"));
const lookup = (host, opts, cb) => (opts?.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function health(origin) {
  return new Promise((resolve) => {
    const u = new URL("/healthz", origin);
    const r = httpsRequest(u, { lookup, ca, servername: u.hostname, timeout: 800 }, (res) => res.resume() || resolve(res.statusCode === 200));
    r.on("timeout", () => { r.destroy(); resolve(false); });
    r.on("error", () => resolve(false));
    r.end();
  });
}
async function wait(origin, name) {
  for (let i = 0; i < 50; i++) {
    if (await health(origin)) return true;
    await sleep(150);
  }
  return false;
}

const children = [];
function start(name, port, extra = []) {
  const p = spawn(process.execPath, [join(ROOT, "scripts/serve-node.mjs"), "--name", name, "--port", String(port), ...extra], {
    cwd: ROOT, stdio: "inherit",
  });
  children.push(p);
  return p;
}
function stop() { for (const p of children) { try { p.kill("SIGTERM"); } catch { /* ignore */ } } }
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { stop(); process.exit(0); });

console.log("p0: starting Alice (8443) + Hana (8444)…");
start("alice", 8443, ["--client-dist", "apps/playground/dist"]);
start("hana", 8444);
const [a, b] = await Promise.all([wait("https://alice.example:8443"), wait("https://hana.example:8444")]);
if (!a || !b) { console.error(`p0: nodes failed to start (alice=${a}, hana=${b})`); stop(); process.exit(1); }

console.log(`
P0 nodes are up (test-only TLS fixture).

  Client (Alice origin):  https://alice.example:8443/?live=1
  Node A descriptor:      https://alice.example:8443/.well-known/weave-node.json
  Node B descriptor:      https://hana.example:8444/.well-known/weave-node.json
  Trust anchors:          ${join(TLS, "trust.json")}

Browsers must resolve alice.example / hana.example to 127.0.0.1 and trust (or pin) the
fixture certificates. Automated runs do this for you:

  P0_LIVE=1 pnpm test:e2e
  node scripts/live-conformance.mjs
  node scripts/node-hardening.mjs

Press Ctrl-C to stop.
`);
