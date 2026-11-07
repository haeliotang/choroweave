#!/usr/bin/env node
/**
 * P0-2 LIVE conformance: real HTTPS nodes, real signed descriptors, real arrive tokens.
 * Separate from the mock unit suite in packages/check.
 *
 *   node scripts/live-conformance.mjs
 *
 * Starts two nodes on the TLS fixture origins, exercises handshake failure modes,
 * then shuts them down. Requires `.p0-tls/` (auto-generated) and Node >= 20.
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer as createTcpServer } from "node:net";
import { request as httpsRequest } from "node:https";
import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalize } from "../packages/check/src/jcs.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TLS = join(ROOT, ".p0-tls");
if (!existsSync(join(TLS, "trust.json"))) {
  console.log("live: generating TLS fixture…");
  execFileSync(process.execPath, [join(ROOT, "scripts/tls-fixture.mjs")], { stdio: "inherit" });
}
const trust = JSON.parse(readFileSync(join(TLS, "trust.json"), "utf8"));
const ca = readFileSync(join(TLS, "ca.crt"));
const A = "https://alice.example:8443";
const B = "https://hana.example:8444";
const lookup = (host, opts, cb) => (opts?.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4));

function req(origin, path, { method = "GET", body, timeout = 4000 } = {}) {
  return new Promise((resolve) => {
    const u = new URL(path, origin);
    const r = httpsRequest(
      u,
      {
        method,
        lookup,
        ca,
        servername: u.hostname,
        timeout,
        headers: body ? { "content-type": "application/json" } : {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try { json = JSON.parse(text); } catch { /* text */ }
          resolve({ status: res.statusCode, json, text });
        });
      },
    );
    r.on("timeout", () => { r.destroy("timeout"); resolve({ status: 0, error: "timeout" }); });
    r.on("error", (e) => resolve({ status: 0, error: e.code || e.message }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitHealth(origin, name) {
  for (let i = 0; i < 40; i++) {
    const r = await req(origin, "/healthz", { timeout: 1000 }).catch(() => ({ status: 0 }));
    if (r.status === 200 && r.json?.name === name) return true;
    await sleep(150);
  }
  return false;
}

const procs = [];
function startNode(name, port) {
  const p = spawn(process.execPath, [join(ROOT, "scripts/serve-node.mjs"), "--name", name, "--port", String(port)], {
    cwd: ROOT,
    env: { ...process.env, P0_TOKEN_TTL_MS: "500" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  procs.push(p);
  return p;
}
function stopAll() {
  for (const p of procs) { try { p.kill("SIGTERM"); } catch { /* ignore */ } }
}

const results = [];
const add = (id, ok, detail) => { results.push({ id, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${detail}`); };

try {
  startNode("alice", 8443);
  startNode("hana", 8444);
  const okA = await waitHealth(A, "alice");
  const okB = await waitHealth(B, "hana");
  add("LIVE-00 nodes up", okA && okB, `A=${okA} B=${okB} (two processes, two HTTPS origins)`);
  if (!okA || !okB) throw new Error("nodes failed to start");

  // Signed descriptors + pinned trust anchors
  for (const [name, origin] of [["alice", A], ["hana", B]]) {
    const d = await req(origin, "/.well-known/weave-node.json");
    const doc = d.json;
    const { signature, ...rest } = doc || {};
    const jwk = trust.origins[origin].publicJwk;
    const key = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: jwk.x }, format: "jwk" });
    const sigOk = signature && cryptoVerify(null, Buffer.from(canonicalize(rest)), key, Buffer.from(signature.value.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
    add(`LIVE-01.${name} descriptor`, d.status === 200 && sigOk && doc.node.publicKey.x === jwk.x, "signed + pinned key matches");
  }

  const ma = await req(A, "/worlds/pixel-rooftop/world.json");
  const mb = await req(B, "/worlds/neon-alley/world.json");
  const aMan = ma.json;
  const bMan = mb.json;
  add("LIVE-02 manifests", aMan.id === `${A}/worlds/pixel-rooftop/world.json` && aMan.portals[0].target.url === `${B}/worlds/neon-alley/world.json`,
    "live IDs/targets rewritten to real origins");

  const targetB = bMan.id;
  const sessionId = "sess-live-0001";
  const nonce = "nonce-live-00000001";
  const normal = await req(B, "/arrive", { method: "POST", body: { targetWorld: targetB, sessionId, nonce } });
  add("LIVE-03 arrive token", normal.status === 200 && normal.json?.token && normal.json.expiresAt > Date.now(), "token issued + bound fields");

  const consume1 = await req(B, "/arrive/consume", { method: "POST", body: { token: normal.json.token } });
  const consume2 = await req(B, "/arrive/consume", { method: "POST", body: { token: normal.json.token } });
  add("LIVE-04 token replay", consume1.status === 200 && consume2.status === 409 && consume2.json?.error === "E_TOKEN_REPLAY", "second consume rejected");

  const dupNonce = await req(B, "/arrive", { method: "POST", body: { targetWorld: targetB, sessionId: "sess-live-0002", nonce } });
  add("LIVE-05 nonce replay", dupNonce.status === 409 && dupNonce.json?.error === "E_NONCE_REPLAY", "nonce reuse rejected");

  const exp = await req(B, "/arrive", { method: "POST", body: { targetWorld: targetB, sessionId: "sess-live-0003", nonce: "nonce-live-00000003" } });
  await sleep(750);
  const expired = await req(B, "/arrive/consume", { method: "POST", body: { token: exp.json.token } });
  add("LIVE-06 token expiry", expired.status === 410 && expired.json?.error === "E_TOKEN_EXPIRED", "expired token rejected");

  const wrong = await req(B, "/arrive", { method: "POST", body: { targetWorld: `${A}/worlds/pixel-rooftop/world.json`, sessionId: "sess-live-0004", nonce: "nonce-live-00000004" } });
  add("LIVE-07 wrong world", wrong.status === 400 && wrong.json?.error === "E_WRONG_WORLD", "cross-node world mismatch rejected");

  const refused = await req("https://hana.example:9", "/healthz", { timeout: 800 });
  add("LIVE-08 node unreachable", refused.status === 0 && /ECONNREFUSED|EAI_AGAIN|timeout/.test(refused.error || ""), `error=${refused.error}`);

  // A TCP listener that accepts but never completes the TLS handshake.
  const blackhole = createTcpServer(() => {});
  await new Promise((r) => blackhole.listen(9555, "127.0.0.1", r));
  const timed = await req("https://hana.example:9555", "/healthz", { timeout: 500 });
  blackhole.close();
  add("LIVE-09 timeout", timed.status === 0 && timed.error === "timeout", "hung TLS handshake aborted by client timeout");

  // Runtime-side live checks are exercised by scripts/e2e-p0.mjs (budget + whitelist + confirm UI).
  // Trust mismatch: a descriptor signed by Alice must not verify under Hana's pinned key.
  {
    const da = (await req(A, "/.well-known/weave-node.json")).json;
    const { signature, ...rest } = da;
    const wrong = trust.origins[B].publicJwk;
    const wrongKey = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: wrong.x }, format: "jwk" });
    const bad = cryptoVerify(null, Buffer.from(canonicalize(rest)), wrongKey, Buffer.from(String(signature.value).replace(/-/g, "+").replace(/_/g, "/"), "base64"));
    add("LIVE-10 trust mismatch", bad === false, "descriptor for A does not verify under B's pinned key");
  }
  console.log("LIVE note: prefetch budget / whitelist / confirm UI are covered by scripts/e2e-p0.mjs (live runtime).");
} catch (err) {
  add("LIVE-FATAL", false, err.message);
} finally {
  stopAll();
}

const failed = results.filter((r) => !r.ok);
console.log(`\nLIVE RESULT: ${failed.length === 0 ? "PASS" : "FAIL"} (${results.length - failed.length}/${results.length})`);
console.log("mock suite remains separate: pnpm test:p0");
process.exit(failed.length ? 1 : 0);
