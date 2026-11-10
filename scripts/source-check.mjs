#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Inceptless <support@inceptless.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * AGPL §13 check: the node exposes a running-version Source endpoint/link and
 * the built viewer contains a visible Source link.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TLS = join(ROOT, ".p0-tls");
const PORT = 9548;
if (!existsSync(join(TLS, "trust.json"))) {
  console.error("source-check: missing .p0-tls; run `pnpm tls:fixture` first");
  process.exit(2);
}
if (!existsSync(join(ROOT, "apps/playground/dist/index.html"))) {
  console.error("source-check: missing apps/playground/dist; run `pnpm build` first");
  process.exit(2);
}
const ca = readFileSync(join(TLS, "ca.crt"));
const lookup = (host, opts, cb) => (opts?.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function req(path, port = PORT) {
  return new Promise((resolve) => {
    const u = new URL(path, `https://alice.example:${port}`);
    const r = httpsRequest(u, { lookup, ca, servername: u.hostname, timeout: 2000 }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") }));
    });
    r.on("timeout", () => { r.destroy(); resolve({ status: 0, error: "timeout" }); });
    r.on("error", (e) => resolve({ status: 0, error: e.code || e.message }));
    r.end();
  });
}
function startNode(port, env = {}) {
  return spawn(process.execPath, [join(ROOT, "scripts/serve-node.mjs"), "--name", "alice", "--port", String(port), "--client-dist", "apps/playground/dist"], {
    cwd: ROOT, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"],
  });
}
const proc = startNode(PORT);
let health = null;
for (let i = 0; i < 40; i++) {
  health = await req("/healthz");
  if (health.status === 200) break;
  await sleep(150);
}
let ok = false;
try {
  const source = await req("/source");
  const json = JSON.parse(source.body || "{}");
  const sourceOk = source.status === 200
    && json.license === "AGPL-3.0-or-later"
    && /github\.com\/haeliotang\/choroweave/.test(json.source || "")
    && /^[0-9a-f]{7,40}$/i.test(json.commit || "")
    && String(source.headers?.link || "").includes('rel="source"');
  const index = await req("/");
  const htmlOk = index.status === 200 && index.body.includes('id="sourceLink"') && index.body.includes("Source");
  ok = Boolean(health?.status === 200 && sourceOk && htmlOk);
  console.log(`${ok ? "PASS" : "FAIL"}  source endpoint: ${json.source || "missing"}; commit=${json.commit || "missing"}; header=${source.headers?.link || "missing"}`);
  console.log(`${htmlOk ? "PASS" : "FAIL"}  viewer Source link present in built client`);
} catch (err) {
  console.error(`source-check: ${err.message}`);
} finally {
  proc.kill("SIGTERM");
}

// Override path: CHOROWEAVE_SOURCE_URL must not drop the commit; the /source
// response carries the commit as a separate field (and the Link header).
let overrideOk = false;
const overrideUrl = "https://github.com/haeliotang/choroweave";
const proc2 = startNode(9550, { CHOROWEAVE_SOURCE_URL: overrideUrl });
try {
  let health2 = null;
  for (let i = 0; i < 40; i++) {
    health2 = await req("/healthz", 9550);
    if (health2.status === 200) break;
    await sleep(150);
  }
  const source2 = await req("/source", 9550);
  const json2 = JSON.parse(source2.body || "{}");
  overrideOk = Boolean(health2?.status === 200
    && json2.source === overrideUrl
    && /^[0-9a-f]{7,40}$/i.test(json2.commit || "")
    && String(source2.headers?.link || "").includes(`<${overrideUrl}>; rel="source"`));
  console.log(`${overrideOk ? "PASS" : "FAIL"}  CHOROWEAVE_SOURCE_URL override: source=${json2.source || "missing"}; commit=${json2.commit || "missing"}`);
} catch (err) {
  console.error(`source-check override: ${err.message}`);
} finally {
  proc2.kill("SIGTERM");
}
ok = ok && overrideOk;
console.log(`\nSOURCE RESULT: ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);
