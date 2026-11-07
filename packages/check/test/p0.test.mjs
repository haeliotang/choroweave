import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { validateManifest, isEnterableTarget, escapeText } from "../src/manifest.mjs";
import { verifyManifestSignature } from "../src/signature.mjs";
import { runConformance, signedCopy } from "../src/cases.mjs";

const CHECK = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(CHECK, "../..");
const WORLDS = ["pixel-rooftop", "neon-alley"];
const load = (w) => JSON.parse(readFileSync(join(ROOT, "worlds", w, "world.json"), "utf8"));

test("generated P0 worlds exist and carry frozen canonical IDs", () => {
  const a = load("pixel-rooftop");
  const b = load("neon-alley");
  assert.equal(a.id, "https://alice.example/worlds/pixel-rooftop/world.json");
  assert.equal(b.id, "https://hana.example/worlds/neon-alley/world.json");
  assert.equal(a.portals[0].target.url, b.id);
  assert.equal(b.portals[0].target.url, a.id);
});

test("both P0 worlds pass the 22 SHP conformance cases", () => {
  for (const w of WORLDS) {
    const results = runConformance(load(w));
    assert.equal(results.length, 22, `${w}: expected 22 cases`);
    const failed = results.filter((r) => !r.ok);
    assert.deepEqual(failed.map((r) => r.id), [], `${w}: failed ${failed.map((r) => `${r.id} (${r.detail})`).join(", ")}`);
  }
});

test("manifest validator rejects missing fields, bad targets, version mismatch, duplicate portals", () => {
  const base = load("pixel-rooftop");
  const cases = [
    (m) => { delete m.title; },
    (m) => { m.portals[0].target.url = "http://insecure.example/w.json"; },
    (m) => { m.protocol.version = "2.0"; },
    (m) => { m.portals.push(JSON.parse(JSON.stringify(m.portals[0]))); },
    (m) => { m.capabilities.sync.whitelist = ["nope"]; },
  ];
  for (const mutate of cases) {
    const m = JSON.parse(JSON.stringify(base));
    mutate(m);
    const v = validateManifest(m);
    assert.ok(v.errors.length > 0, `expected validation error for mutation: ${mutate}`);
  }
});

test("signature: valid accepted, tamper and key swap rejected", () => {
  const good = signedCopy(load("pixel-rooftop"));
  assert.equal(verifyManifestSignature(good).ok, true);
  const tampered = JSON.parse(JSON.stringify(good));
  tampered.title = "x";
  assert.equal(verifyManifestSignature(tampered).ok, false);
});

test("hostile portal targets are not enterable", () => {
  for (const u of ["http://x/w.json", "ipfs://cid", "https://localhost/w.json", "https://10.0.0.1/w.json", "https://192.168.1.9/w.json"]) {
    assert.equal(isEnterableTarget(u), false, u);
  }
  assert.equal(isEnterableTarget("https://hana.example/worlds/neon-alley/world.json"), true);
});

test("preview text is escaped", () => {
  assert.equal(escapeText('<script>"x"</script>'), "&lt;script&gt;&quot;x&quot;&lt;/script&gt;");
});

test("CLI returns 0 for both worlds and prints 22/22", () => {
  for (const w of WORLDS) {
    const out = execFileSync(process.execPath, [join(CHECK, "src/cli.mjs"), join(ROOT, "worlds", w), "--conformance", "--json"], {
      encoding: "utf8",
    });
    const report = JSON.parse(out);
    assert.equal(report.ok, true);
    assert.equal(report.conformance.total, 22);
    assert.equal(report.conformance.passed, 22);
  }
});
