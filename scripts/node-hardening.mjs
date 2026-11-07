#!/usr/bin/env node
/**
 * P0-2 hardening (live): rate limit, room-full, private world, key rotation.
 * Separate live suite; mock 22 and live-node 12 remain independent.
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalize } from "../packages/check/src/jcs.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TLS = join(ROOT, ".p0-tls");
if (!existsSync(join(TLS, "trust.json"))) execFileSync(process.execPath, [join(ROOT, "scripts/tls-fixture.mjs")], { stdio: "inherit" });
const ca = readFileSync(join(TLS, "ca.crt"));
const lookup = (host, opts, cb) => (opts?.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const add = (id, ok, detail) => { results.push({ id, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${detail}`); };

function req(origin, path, { method = "GET", body, timeout = 3000 } = {}) {
  return new Promise((resolve) => {
    const u = new URL(path, origin);
    const r = httpsRequest(u, { method, lookup, ca, servername: u.hostname, timeout, headers: body ? { "content-type": "application/json" } : {} }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let json = null; try { json = JSON.parse(text); } catch { /* ignore */ }
        resolve({ status: res.statusCode, json, text });
      });
    });
    r.on("timeout", () => { r.destroy(); resolve({ status: 0, error: "timeout" }); });
    r.on("error", (e) => resolve({ status: 0, error: e.code || e.message }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}
async function waitHealth(origin, name, tries = 40) {
  for (let i = 0; i < tries; i++) {
    const r = await req(origin, "/healthz", { timeout: 800 });
    if (r.status === 200 && r.json?.name === name) return true;
    await sleep(150);
  }
  return false;
}
const procs = [];
function start(name, port, args = [], env = {}) {
  const p = spawn(process.execPath, [join(ROOT, "scripts/serve-node.mjs"), "--name", name, "--port", String(port), ...args], {
    cwd: ROOT, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"],
  });
  procs.push(p);
  return p;
}
async function stop(p, port) {
  p.kill("SIGTERM");
  for (let i = 0; i < 30; i++) {
    const r = await req(`https://localhost:${port}`, "/healthz", { timeout: 200 });
    if (r.status === 0) return;
    await sleep(100);
  }
}
const arrive = (origin, world, sessionId, nonce) => req(origin, "/arrive", { method: "POST", body: { targetWorld: world, sessionId, nonce } });

try {
  // 1) rate limit: 2 requests / 10s
  const rateNode = start("alice", 9543, [], { P0_RATE_LIMIT: "2", P0_TOKEN_TTL_MS: "5000" });
  const rateOrigin = "https://alice.example:9543";
  const upRate = await waitHealth(rateOrigin, "alice");
  let codes = [];
  for (let i = 0; i < 4; i++) {
    const r = await arrive(rateOrigin, "https://alice.example:8443/worlds/pixel-rooftop/world.json", `sess-rate-${i}`, `nonce-rate-${String(i).padStart(6, "0")}`);
    codes.push(r.status);
  }
  add("LIVE-11 rate limit", upRate && codes.includes(429) && codes.filter((c) => c === 200).length >= 2, `codes=${codes.join(",")}`);
  await stop(rateNode, 9543);

  // 2) room full
  const fullNode = start("hana", 9544, ["--room-full"]);
  const fullOrigin = "https://hana.example:9544";
  const upFull = await waitHealth(fullOrigin, "hana");
  const full = await arrive(fullOrigin, "https://hana.example:8444/worlds/neon-alley/world.json", "sess-full-01", "nonce-full-0001");
  add("LIVE-12 room full", upFull && full.status === 409 && full.json?.error === "E_ROOM_FULL", `status=${full.status} code=${full.json?.error}`);
  await stop(fullNode, 9544);

  // 3) private world (indistinguishable from 404)
  const privNode = start("hana", 9545, ["--private"]);
  const privOrigin = "https://hana.example:9545";
  const upPriv = await waitHealth(privOrigin, "hana");
  const priv = await arrive(privOrigin, "https://hana.example:8444/worlds/neon-alley/world.json", "sess-priv-01", "nonce-priv-0001");
  add("LIVE-13 private world", upPriv && priv.status === 404 && priv.json?.error === "E_NOT_FOUND", `status=${priv.status} code=${priv.json?.error}`);
  await stop(privNode, 9545);

  // 4) session quota: one active token per session in this fixture
  const quotaNode = start("hana", 9547, [], { P0_SESSION_QUOTA: "1" });
  const quotaOrigin = "https://hana.example:9547";
  const upQuota = await waitHealth(quotaOrigin, "hana");
  const q1 = await arrive(quotaOrigin, "https://hana.example:8444/worlds/neon-alley/world.json", "sess-quota-01", "nonce-quota-0001");
  const q2 = await arrive(quotaOrigin, "https://hana.example:8444/worlds/neon-alley/world.json", "sess-quota-01", "nonce-quota-0002");
  add("LIVE-14 session quota", upQuota && q1.status === 200 && q2.status === 429 && q2.json?.error === "E_SESSION_QUOTA", `first=${q1.status} second=${q2.status}`);
  await stop(quotaNode, 9547);

  // 5) key rotation: descriptor must verify with new pinned key, not the old one
  const rotNode = start("hana", 9546);
  const rotOrigin = "https://hana.example:9546";
  const upRot = await waitHealth(rotOrigin, "hana");
  const beforeDoc = (await req(rotOrigin, "/.well-known/weave-node.json")).json;
  const oldX = beforeDoc?.node?.publicKey?.x;
  await stop(rotNode, 9546);
  const rotated = JSON.parse(execFileSync(process.execPath, [join(ROOT, "scripts/rotate-node-key.mjs"), "--name", "hana"], { encoding: "utf8" }));
  const rotNode2 = start("hana", 9546);
  const upRot2 = await waitHealth(rotOrigin, "hana");
  const afterDoc = (await req(rotOrigin, "/.well-known/weave-node.json")).json;
  const trust = JSON.parse(readFileSync(join(TLS, "trust.json"), "utf8"));
  const pinned = trust.origins["https://hana.example:8444"].publicJwk;
  const { signature, ...rest } = afterDoc || {};
  const key = createPublicKey({ key: { kty: "OKP", crv: "Ed25519", x: pinned.x }, format: "jwk" });
  const sigOk = signature && cryptoVerify(null, Buffer.from(canonicalize(rest)), key, Buffer.from(String(signature.value).replace(/-/g, "+").replace(/_/g, "/"), "base64"));
  add("LIVE-15 key rotation", upRot && upRot2 && oldX !== afterDoc?.node?.publicKey?.x && sigOk && rotated.newX === pinned.x, `old=${String(oldX).slice(0, 8)}… new=${String(pinned.x).slice(0, 8)}…`);
  await stop(rotNode2, 9546);

  const out = process.argv.includes("--json-out") ? process.argv[process.argv.indexOf("--json-out") + 1] : null;
  if (out) writeFileSync(out, JSON.stringify({ suite: "live-hardening", generatedAt: new Date().toISOString(), results }, null, 2));
} catch (err) {
  add("LIVE-HARDENING-FATAL", false, err.message);
} finally {
  for (const p of procs) { try { p.kill("SIGTERM"); } catch { /* ignore */ } }
}
const failed = results.filter((r) => !r.ok);
console.log(`\nHARDENING RESULT: ${failed.length === 0 ? "PASS" : "FAIL"} (${results.length - failed.length}/${results.length})`);
process.exit(failed.length ? 1 : 0);
